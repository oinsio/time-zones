# Design: Replace wall-clock row budgets with deterministic checks

## Context

Driven by FR1–FR8 and NFR-P1 of `proposal.md` (see proposal.md, Why). Current state, checked in `packages/client/`:

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

Add `src/presenter/dateTimeFormatters.ts` with `getDateTimeFormatter(language, timeZoneId, kind)`, where `kind` is a new enum `DateTimeLabelKind { LOCAL_TIME, LOCAL_DATE, HOUR }` mapped to `LOCAL_TIME_FORMAT_OPTIONS`, `LOCAL_DATE_FORMAT_OPTIONS` and `HOUR_LABEL_FORMAT_OPTIONS`. The cache key is `language|timeZoneId|kind`. `formatLocalTime` and `formatLocalDate` format `localDateTime.epochMilliseconds` with the cached formatter. `formatHourLabel` in `dayTrack.ts` uses the same function, with `LOCAL_TIME` for labels whose minutes are not zero, as today. The cache is not keyed by day or instant, so a date change reuses it (FR3). At most 3 kinds per zone gives the FR2 bound.

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

### D4: Scenarios keep their names, tags and data, and only their `Then` changes (NFR-P1)

Each feature keeps its scenario name, the old change tag and the old FR/NFR tag. It adds `@replace-wall-clock-row-budgets-with-deterministic-checks @FR<n>`. The Given/When steps keep their data and warm-up. The `When` step wraps the same work in `startWorkCount()` instead of `performance.now()`. `Then` asserts the counts from the spec delta. Constant names follow the bounds: `MAX_FORMATTERS_PER_ZONE = 3`, `MAX_TRANSITION_LOOKUPS_PER_ZONE = 2`, `MAX_COLLATORS_PER_QUERY = 1`, `NORMALIZATIONS_PER_QUERY = 1`. They live in `src/test/workCounters.ts`, because they are test thresholds, not product constants. The timing world helpers `elapsedMs` and `measureSearchMilliseconds` are removed.

### D5: Benchmark with `vitest bench` and a warn-only budget script (FR6, FR7)

- `src/test/benchmarks/rowPresenting.bench.ts` (5 row operations: present with time and date, with offsets, with badge, reorder, date change), `timeSelection.bench.ts` (selection, track date change) and `citySearch.bench.ts` (10 sample queries as one operation). Each `bench` reuses the Given setup of its world, with `{ warmupIterations: 5, iterations: 20 }` (constants in the bench files).
- `packages/client/package.json`: `"bench": "vitest bench --run --outputJson reports/bench/bench.json"`.
- `packages/client/scripts/check-bench-budgets.mjs` reads the JSON, prints a Markdown table of medians to `$GITHUB_STEP_SUMMARY` when it is set (otherwise stdout), prints `::warning title=Benchmark budget::<name> median <x> ms > 50 ms` for each miss, and always exits 0. The budget `ROW_BUDGET_MS = 50` is a named constant in the script.
- `.github/workflows/ci.yml`: a new job, `benchmark`, with `needs: []` and `continue-on-error: true`. It repeats checkout, pnpm, node and install, then runs `pnpm --filter @time-zones/client bench` and `node packages/client/scripts/check-bench-budgets.mjs`. It runs on its own runner, so it does not compete with `pnpm test`.

- Alternative: a separate Vitest project in the same `vitest run`, with `singleFork`. Rejected: still blocking, and still on a shared runner.
- Alternative: Playwright with `performance.measure` in a real browser. Out of scope (NG3).

### D6: Rule and ADR (FR8)

- `.claude/rules/test-planning.md`: the "For changes with performance requirements" bullet becomes "work bounds (counts of formatters, lookups, passes) as blocking unit BDD, plus a `*.bench.ts` benchmark reported by the non-blocking CI job. Never assert `performance.now()` durations in unit or BDD tests."
- `docs/adr/0008-performance-budgets-as-work-bounds.md`: global ADR in the format of `.claude/rules/adr.md`. Context: the three CI failures. Decision: D2 + D5. Consequences: budgets catch the class of regression they guard (allocation per row, recompute per call), not an arbitrary slowdown, which only shows as a benchmark warning.
- Stryker: `src/test/**` is already excluded from mutation. Bench files sit there, so no config change.

## Risks / Trade-offs

- [A slowdown with no extra counted work, for example a slower algorithm inside a cached path, passes the blocking check] → It shows as a `::warning` in the benchmark job. NG4 accepts this deliberately. Q1 of the proposal revisits it.
- [A future dependency upgrade makes `temporal-polyfill` stop caching per-zone formatters] → Not counted (D2). The benchmark median would rise and warn.
- [The global `Intl` replacement leaks into another scenario if `stop()` is skipped after a failed step] → `stop()` runs in `AfterEachScenario`, which runs on failure too. Files run in isolated workers.
- [`vi.resetModules()` in D3 re-evaluates `i18n` and loses the language set up earlier] → The FR2 world passes `translate` and `language` explicitly, as the worlds do today, and changes the language after the re-import.
- [FR5: `Intl.DateTimeFormat.format(epochMilliseconds)` and `ZonedDateTime.toLocaleString` could differ] → Characterization tests on the current output in `en` and `ru` (zones with `+5:30`, `+5:45`, a negative offset, a DST day) are written and green before the switch (tasks 1.1). The E2E screenshots must pass without re-approval (UX1).

## Migration Plan

Test and CI change plus one internal presenter refactor. There is no data migration. To roll back, revert the commit. The benchmark job can be removed alone without affecting the PR check.
