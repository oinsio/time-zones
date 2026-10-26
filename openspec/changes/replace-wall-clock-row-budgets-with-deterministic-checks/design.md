# Design: Replace wall-clock row budgets with deterministic checks

## Context

Driven by FR1–FR8, NFR-P1 and M3 of `proposal.md` (see proposal.md, Why). Current state, checked in `packages/client/`:

- Eight unit BDD scenarios time the work with `performance.now()` and assert `<= 50`. The timed code lives in the step files of `locations_local_time_unit`, `locations_utc_offset_unit`, `locations_device_time_zone_unit` and `locations_reorder_unit`, and in `date_selection/steps/referenceMomentRowsWorld.ts`, `time_selection/steps/trackBudgetWorld.ts` and `location_search/steps/searchWorld.ts` (`measureSearchMilliseconds`).
- `src/presenter/localDateTime.ts`: `formatLocalTime` and `formatLocalDate` call `localDateTime.toLocaleString(language, options)`. In `temporal-polyfill` 0.3 this builds a new `Intl.DateTimeFormat` on every call. A probe gave 50 builds for 50 calls, and 50 more when repeated.
- `temporal-polyfill` keeps its own reference to `Intl.DateTimeFormat`, taken at import (`en = Intl.DateTimeFormat` in `chunks/internal.js`), and caches one formatter per zone for offset lookups. Replacing the global later does not count its internal builds.
- `src/presenter/dayTrack.ts` already caches hour-label formatters in a module `Map`, keyed by `${language}|${timeZoneId}|${options.minute ?? ""}`. That key separates "hours only" from "hours and minutes". It would collide with `LOCAL_DATE_FORMAT_OPTIONS` (no `minute` either) if the caches were merged as they are.
- `src/presenter/countryName.ts` caches one `Intl.DisplayNames` per language. `src/model/dayPeriodStops.ts` caches stops per zone for the last reference day, and `presenter/dayTrack.ts` caches hour labels the same way.
- `adapters/city-search/zoneCitiesSource.ts` normalizes every record text once, when the source is built. A query runs `normalizeSearchText` once (`String.prototype.normalize("NFD")`) and `createCompositeCitySearch.search` builds one `Intl.Collator`.
- CI (`.github/workflows/ci.yml`) has one job, "Lint, test, build, E2E", with `pnpm test` running all of `vitest run` in parallel.
- Vitest 3.2 ships `vitest bench` (tinybench). By default it includes `**/*.{bench,benchmark}.?(c|m)[jt]s?(x)`, and `vitest run` never picks those files up.

## Goals / Non-Goals

**Goals:**
- Blocking checks count work that the code does, so a step fails only when the code does more work.
- Real timings come from one place, with warm-up and medians, and never fail the PR check.

**Non-Goals:**
- Counting work inside `temporal-polyfill` or the JS engine. Only what our code asks for is counted (D2).
- Any change to `vitest.config.ts` or the Stryker config, apart from what D6 needs.

## Decisions

### D1: One formatter cache for every date-time label (FR1, FR2, FR5)

Add `src/presenter/dateTimeFormatters.ts` with `getDateTimeFormatter(language, timeZoneId, kind)`, where `kind` is a new enum `DateTimeLabelKind { LOCAL_TIME, LOCAL_DATE, HOUR }` mapped to `LOCAL_TIME_FORMAT_OPTIONS`, `LOCAL_DATE_FORMAT_OPTIONS` and `HOUR_LABEL_FORMAT_OPTIONS`. The cache key is `language|timeZoneId|kind`. The cache hit is one line, `if (cachedFormatter !== undefined) return cachedFormatter;`, in the same shape as the existing caches in `dayTrack.ts` (`return cached`), `dayPeriodStops.ts` (`return cached`) and `countryName.ts` (`return cachedDisplayNames`). The M3 check finds the cache-hit lines by that shape (D7). `formatLocalTime` and `formatLocalDate` format `localDateTime.epochMilliseconds` with the cached formatter. `formatHourLabel` in `dayTrack.ts` uses the same function, with `LOCAL_TIME` for labels whose minutes are not zero, as today. The cache is not keyed by day or instant, so a date change reuses it (FR3). At most 3 kinds per zone gives the FR2 bound.

- Alternative: keep `toLocaleString` and memoize the formatted strings per zone and minute. Rejected: the key would include the instant, so it never hits on a date change.
- Alternative: key by `JSON.stringify(options)`. Rejected: string building on every call, and an enum is required by `code-style.md` anyway.

### D2: Count work with test-scoped wrappers, not with mocks of our modules (FR1–FR4)

Add `src/test/workCounters.ts`. `startWorkCount()` installs counters and returns `{ formatters(), formattersByZone(), displayNames(), transitionLookups(), normalizations(), collators(), stop() }`.
- `Intl.DateTimeFormat`, `Intl.DisplayNames` and `Intl.Collator` are replaced by a `Proxy` with a `construct` trap that counts and records the `timeZone` option, then constructs the original. Statics and `instanceof` pass through. A `Proxy` does not depend on how `vi.spyOn` handles `new`.
- Every `toLocaleString` call on `Temporal.ZonedDateTime`, `Instant`, `PlainDate`, `PlainTime` and `PlainDateTime` prototypes counts as one formatter build, through `vi.spyOn(prototype, "toLocaleString")`. The polyfill builds those formatters through its private reference, which the `Proxy` cannot see. This closes the gap, so "no formatter is built" stays true to the spec.
- `Temporal.ZonedDateTime.prototype.getTimeZoneTransition` is a method spy (transition lookups).
- `String.prototype.normalize` is a method spy (normalizations).
- `stop()` restores every original. The worlds call it in `AfterEachScenario`, and the counter starts right before the counted block, as `performance.now()` did.

- Alternative: `vi.mock("@/presenter/…")` to count calls of our own functions. Rejected: that ties the tests to internal file names, imports from module internals (`process-invariants.md`), and would miss a new formatter built elsewhere.

### D3: Cold first presenting via a fresh module graph (FR2)

The FR2 scenario needs empty caches. Its world calls `vi.resetModules()` and then `await import("@/presenter")` and `await import("@/model")` in the Given step. This gives fresh module-level caches, with no reset function exported from production code. `temporal-polyfill` is a node_modules dependency, so it is not re-evaluated, and its internal caches are not counted anyway (D2).

- Alternative: export `resetPresenterCaches()` from `@/presenter`. Rejected: a test-only API in production code.

### D4: Scenarios keep their names and tags; their steps follow the spec delta (NFR-P1)

Each feature keeps its scenario name, the old change tag and the old FR/NFR tag. It adds `@replace-wall-clock-row-budgets-with-deterministic-checks @FR<n> @NFR-P1` on one tag line. The label scenarios get `@FR5 @UX1` instead of `@NFR-P1`. That way every new id sits on the same line as this change's tag, which the M4 grep needs. The steps follow the spec delta. The FR1 scenarios of the four locations features gain a Given that presents the rows once — the warm-up the date- and time-selection worlds already have (`referenceMomentRowsWorld.ts`, `trackBudgetWorld.ts`) — so no count depends on which scenario ran before. The `When` wraps only the second presenting in `startWorkCount()` instead of `performance.now()`. The FR2 scenario stays cold (D3) and keeps its existing data. `Then` asserts the counts from the spec delta. Constant names follow the bounds: `MAX_FORMATTERS_PER_ZONE = 3`, `MAX_TRANSITION_LOOKUPS_PER_ZONE = 2`, `MAX_COLLATORS_PER_QUERY = 1`, `NORMALIZATIONS_PER_QUERY = 1`. They live in `src/test/workCounters.ts`, because they are test thresholds, not product constants. The timing world helpers `elapsedMs` and `measureSearchMilliseconds` are removed.

### D5: Benchmark with `vitest bench` and a warn-only budget script (FR6, FR7)

- `src/test/benchmarks/rowPresenting.bench.ts` (5 row operations: present with time and date, with offsets, with badge, reorder, date change), `timeSelection.bench.ts` (selection, track date change) and `citySearch.bench.ts` (10 sample queries as one operation). Each `bench` reuses the Given setup of its world, with `{ warmupIterations: 5, iterations: 20 }` (constants in the bench files). Each file header says `Implements FR6, verifies NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks`, the form `traceability.md` gives for a performance test (`// Verifies NFR-PX of <change-name>`).
- `packages/client/package.json`: `"bench": "vitest bench --run --outputJson reports/bench/bench.json"`.
- The budget check is split in two, so that its logic can be tested and mutated in-process:
  - `packages/client/scripts/benchBudgets.ts`: pure functions with no I/O. `evaluateBenchBudgets(benchReport)` takes the parsed `vitest bench` JSON and returns `{ summaryMarkdown, warningLines }`: a Markdown table with the name and median of each benchmark, and one `::warning title=Benchmark budget::<name> median <x> ms > 50 ms` line for each median above `ROW_BUDGET_MS = 50` (a median of exactly 50 is within the budget). A report that is missing or cannot be parsed gives one warning line, `::warning title=Benchmark budget::no benchmark report`, and an empty table.
  - `packages/client/scripts/check-bench-budgets.mjs`: the thin wrapper. It reads the JSON at the path given as its first argument (default `reports/bench/bench.json`), calls `evaluateBenchBudgets`, appends the table to `$GITHUB_STEP_SUMMARY` when it is set (otherwise prints it to stdout), prints each warning line, and always exits 0. It imports `./benchBudgets.ts` the way `scripts/check-bundle-size.mjs` already imports `../app.config.ts`. This works because Node 26 (`.nvmrc`) strips TypeScript types.
  - `src/test/benchmarks/benchBudgets.test.ts` tests both parts. It unit-tests `evaluateBenchBudgets` on in-memory reports: all medians under the budget, one at 50, one at 80, an empty or missing report. It also runs the wrapper with `execFileSync("node", ["scripts/check-bench-budgets.mjs", fixturePath])` on JSON fixtures in `src/test/benchmarks/fixtures/` (under budget, over budget, missing file) and asserts the exit code is 0, the number of `::warning` lines, and that the table is written to a temporary `GITHUB_STEP_SUMMARY` file. Existing tests already import `node:` modules (`src/styles/tokens.test.ts`). `vitest run` picks the file up through its `src/**/*.test.ts` pattern. Stryker can mutate `scripts/benchBudgets.ts` through `--mutate`, which replaces the `mutate` list of `stryker.config.mjs`.
- `.github/workflows/ci.yml`: a new job, `benchmark`, with `needs: []` and `continue-on-error: true`. It repeats checkout, pnpm, node and install, then runs `pnpm --filter @time-zones/client bench` and `node packages/client/scripts/check-bench-budgets.mjs packages/client/reports/bench/bench.json` (the path is passed because the step runs from the repository root). It runs on its own runner, so it does not compete with `pnpm test`. `src/test/benchmarks/ciBenchmarkJob.test.ts` reads `ci.yml` as text (no YAML parser is installed, and none is added) and asserts the job's shape: `continue-on-error: true`, the two commands, and no `bench` in any other job.

- Alternative: a separate Vitest project in the same `vitest run`, with `singleFork`. Rejected: still blocking, and still on a shared runner.
- Alternative: Playwright with `performance.measure` in a real browser. Out of scope (NG3).

### D6: Rule and ADR (FR8)

- `.claude/rules/test-planning.md`: the "For changes with performance requirements" bullet becomes "work bounds (counts of formatters, lookups, passes) as blocking unit BDD, plus a `*.bench.ts` benchmark reported by the non-blocking CI job. Never assert `performance.now()` durations in unit or BDD tests."
- `.claude/rules/bdd-unit.md`: in "When to Use Unit BDD vs E2E BDD", the row `| Performance (operation time) | yes (performance.now) | no |` becomes `| Performance (work bounds: formatters, lookups, passes) | yes (counted, never performance.now) | no |`. A sentence under the table points timing to the `*.bench.ts` benchmark. After this, `grep -rn "performance.now" .claude/rules` shows only sentences that forbid asserting it.
- `docs/adr/0008-performance-budgets-as-work-bounds.md`: global ADR in the format of `.claude/rules/adr.md`. Context: the three CI failures. Decision: D2 + D5. Consequences: budgets catch the class of regression they guard (allocation per row, recompute per call), not an arbitrary slowdown, which only shows as a benchmark warning.
- Stryker: `src/test/**` is already excluded from mutation. Bench files sit there, so no config change.

### D7: The cache guards are proven by a scoped mutation run, not by hand edits (M3)

A hand-made "turn the cache off, see red, revert" check cannot be repeated. Instead, one Stryker run mutates the 3 cache files whose work the counters see, with bail disabled, so that `killedBy` lists every test that kills a mutant, not only the first one:

`npx stryker run --mutate 'src/presenter/dateTimeFormatters.ts,src/model/dayPeriodStops.ts,src/presenter/countryName.ts' --disableBail`

On a cache-hit line, Stryker turns `if (cached… !== undefined)` into `if (false)` (cache bypassed) and makes other mutants that return `undefined`. Bypassing the formatter cache builds `Intl.DateTimeFormat` objects, bypassing the stop cache calls `findOffsetTransitions` and so `getTimeZoneTransition` (`model/dayPeriodWindows.ts`), and bypassing the region name cache builds `Intl.DisplayNames` (used by `presentLocationRows.ts`). Each of these is a counted work item. The hour label cache in `dayTrack.ts` is left out: bypassing it only calls `format` again on cached formatters, which D2 does not count. A `jq` filter over `reports/mutation/mutation-report.json` selects the mutants whose source line contains `return cached`. It fails if there are fewer than 3 such lines, if any of those mutants is not `Killed`, or if a mutant's `killedBy` names no test from a file under `src/test/features/`. The search bound needs no mutation proof: it is an exact count (1 normalization), so one more normalization per query fails it.

- Alternative: export a "disable caches" switch for tests. Rejected: test-only API in production code (same reason as D3).

## Risks / Trade-offs

- [A slowdown with no extra counted work, for example a slower algorithm inside a cached path, passes the blocking check] → It shows as a `::warning` in the benchmark job. NG4 accepts this deliberately. Q1 of the proposal revisits it.
- [A future dependency upgrade makes `temporal-polyfill` stop caching per-zone formatters] → Not counted (D2). The benchmark median would rise and warn.
- [The global `Intl` replacement leaks into another scenario if `stop()` is skipped after a failed step] → `stop()` runs in `AfterEachScenario`, which runs on failure too. Files run in isolated workers.
- [`vi.resetModules()` in D3 re-evaluates `i18n` and loses the language set up earlier] → The FR2 world passes `translate` and `language` explicitly, as the worlds do today, and changes the language after the re-import.
- [FR5: `Intl.DateTimeFormat.format(epochMilliseconds)` and `ZonedDateTime.toLocaleString` could differ] → Characterization tests on the current output in `en` and `ru` (zones with `+5:30`, `+5:45`, a negative offset, a DST day) are written and green before the switch (tasks 1.1). The E2E screenshots must pass without re-approval (UX1).

## Migration Plan

Test and CI change plus one internal presenter refactor. There is no data migration. To roll back, revert the commit. The benchmark job can be removed alone without affecting the PR check.
