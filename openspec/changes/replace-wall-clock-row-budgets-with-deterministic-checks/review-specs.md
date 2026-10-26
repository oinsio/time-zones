# Specs review: replace-wall-clock-row-budgets-with-deterministic-checks

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 25/25 |
| Contradictions | 4 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 4 |

## Freshness

- ✅ Seven files under `packages/client/src` call `performance.now()`: 4 step files (`locations_local_time_unit.steps.tsx`, `locations_utc_offset_unit.steps.tsx`, `locations_device_time_zone_unit.steps.tsx`, `locations_reorder_unit.steps.ts`) and 3 worlds (`referenceMomentRowsWorld.ts`, `trackBudgetWorld.ts`, `searchWorld.ts`). This matches proposal.md M2 and design.md:7.
- ✅ The eight timed scenarios in the proposal.md "Why" table exist under the names and tags given there (for example `locations_local_time_unit.feature:57-61`, `time_selection_day_track.feature:60-65`, `location_search_performance.feature:4-7`).
- ✅ `vitest run` collects 136 unit and step files (`src/**/*.{test,steps}.{ts,tsx}` minus `*_e2e.steps.ts`, `vitest.config.ts:12-14`). This matches proposal.md:5.
- ✅ `src/presenter/localDateTime.ts:16,27`: `formatLocalTime` and `formatLocalDate` call `localDateTime.toLocaleString(language, …)` (design.md:8).
- ✅ `src/presenter/dayTrack.ts:30-48`: there is a module `Map` of formatters keyed by `${language}|${timeZoneId}|${options.minute ?? ""}`, and the cache hit is `if (cached !== undefined) return cached;`. `LOCAL_DATE_FORMAT_OPTIONS` (`src/constants/localDateTime.ts:8-12`) has no `minute`, so merging the caches as they are would collide (design.md:10).
- ✅ `src/presenter/countryName.ts:7-8` caches one `Intl.DisplayNames` per language, with `return cachedDisplayNames`. `src/model/dayPeriodStops.ts:52-70` caches stops per zone for the last day, with `return cached`. So the `return cached` jq filter of task 5.3 matches exactly one cache-hit line in each of the three mutated files (design.md:11, D1, D7).
- ✅ A cache-stop miss reaches `getTimeZoneTransition` through `findOffsetTransitions` (`src/model/dayPeriodWindows.ts:38-57`). That is the only `getTimeZoneTransition` caller in `src` (design.md D7).
- ✅ `createCompositeCitySearch.search` calls `normalizeSearchText` once and builds one `Intl.Collator` per non-empty query (`src/adapters/city-search/createCompositeCitySearch.ts:58-60`). Record texts are normalized at source build (`zoneCitiesSource.ts:37-40`), and `normalizeSearchText.ts:11` is the only `.normalize(` in production code (design.md:12, FR4).
- ✅ `.github/workflows/ci.yml` has one job, `check` ("Lint, test, build, E2E"), running `pnpm test`. No line contains `bench` (design.md:13, task 6.5).
- ✅ The package name `@time-zones/client` exists (`packages/client/package.json:2`). `.nvmrc` is `26`. `scripts/check-bundle-size.mjs:15` imports `../app.config.ts`, and `tsconfig.node.json:34` includes `scripts` (design.md D5).
- ✅ `src/styles/tokens.test.ts:2-3` imports `node:fs` and `node:path` (design.md D5).
- ✅ `stryker.config.mjs` excludes `!src/test/**` from `mutate` (design.md D6).
- ✅ `.claude/rules/bdd-unit.md:116` (`| Performance (operation time)  | yes (performance.now) | no |`) and `.claude/rules/test-planning.md:26` are the only `performance.now` mentions in `.claude/rules` (task 7.1).
- ✅ `docs/adr/` holds 0001–0007, all `Accepted`, with no 0008. The ADR list in `CLAUDE.md:15` ends at 0007.
- ✅ Every MODIFIED requirement exists in `openspec/specs/` under the restated name: `locations/spec.md:261,423,554,712`, `date-selection/spec.md:206`, `time-selection/spec.md:248`, `location-search/spec.md:151`, `app-delivery/spec.md:45`. The deltas keep every unchanged sentence and scenario.
- ✅ Nothing is implemented yet: there is no `src/test/workCounters.ts`, no `src/test/benchmarks/`, no `scripts/benchBudgets.ts` and no `bench` script. No archived change covers this work (`fix-date-change-row-budget-measurement` and `add-time-sliders-to-location-cards` only introduced the timed scenarios).
- ❌ design.md:54 (D4) says "The Given/When steps keep their data and warm-up". The four locations budget scenarios have no warm-up. `locations_utc_offset_unit.steps.tsx:248-264`, `locations_local_time_unit.steps.tsx:175-191`, `locations_device_time_zone_unit.steps.tsx:152-165` and `locations_reorder_unit.steps.ts:246-270` build the locations in Given and present them once, inside the timed When. Only `referenceMomentRowsWorld.ts:90` and `trackBudgetWorld.ts:177` present rows before the measurement.

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ locations "50 rows within the budget" ×2, "50 locations within the budget"; time-selection "50 rows within the time-selection budget" | ✅ 3.1, 3.2, 3.4, 4.2 |
| FR2 | ✅ | ✅ locations "Device time zone badge…" scenario "50 rows within the budget" | ✅ 3.3 |
| FR3 | ✅ | ✅ date-selection "50 rows within the budget"; time-selection "50 tracks within the date-change budget", "The new day's tracks are computed once" | ✅ 4.1, 4.3 |
| FR4 | ✅ | ✅ location-search "Query timing" | ✅ 5.1 |
| FR5 | ✅ | ✅ locations "Labels are unchanged by formatter reuse"; time-selection "Hour labels are unchanged by formatter reuse" | ✅ 1.1, 1.4, 3.1, 4.3 |
| FR6 | ✅ | ✅ app-delivery "A timing budget is missed" | ✅ 6.1–6.4 |
| FR7 | ✅ | ✅ app-delivery "Checks on every pull request" (separate job, never fails the check) | ✅ 6.5, 6.6 |
| FR8 | ✅ | ✅ app-delivery "Unit tests ignore runner speed" | ✅ 5.2, 7.1 |
| NFR-P1 | ✅ | ✅ every MODIFIED requirement keeps its 50 ms budget | ✅ groups 3–6 |
| UX1 | ✅ | ✅ locations "Local time and date are fast and accessible" (labels identical) | ✅ 1.1, 8.2 |
| G1 | ✅ | n/a — met by FR8 | n/a — met by M2 (5.2) |
| G2 | ✅ | n/a — met by FR1–FR4 | n/a — met by M3 (5.3) |
| G3 | ✅ | n/a — met by FR6, FR7 | n/a — met by M5 (8.3) |
| NG1 | ✅ | n/a — every delta keeps 50 ms / 50 rows / 10 queries | n/a — no task changes a budget value |
| NG2 | ✅ | n/a — only the D1 formatter cache is added | n/a — tasks 1.3/1.4 add only that cache |
| NG3 | ✅ | n/a — no real-browser timing | n/a — none built |
| NG4 | ✅ | n/a — the job never fails the check | n/a — 6.6 sets `continue-on-error: true` and stores no history |
| NG5 | ✅ | n/a — no retries or multipliers | n/a — none built |
| M1 | ✅ | n/a | ✅ 8.2, 8.3 |
| M2 | ✅ | n/a | ✅ 5.2 |
| M3 | ✅ | n/a | ✅ 5.3 |
| M4 | ✅ | n/a | ✅ 8.1 |
| M5 | ✅ | n/a | ✅ 8.3 |
| M6 | ✅ | n/a | ✅ 1.5, 6.4 |
| Q1 | ✅ | n/a | n/a — left open on purpose (NG4) |

## Consistency

- design.md:54 (D4: "Scenarios keep their names, tags and data, and only their `Then` changes", "The Given/When steps keep their data and warm-up") contradicts the spec deltas. Those deltas rewrite the Given and When of the locations scenarios: `specs/locations/spec.md:7-8` ("whose rows have been presented with offsets once" / "again at another minute of the same day"), `:46`, `:75` ("no row has been presented yet") and `:101-102`. Tasks group 3 (tasks.md:20) follows the deltas.
- tasks.md:24 (task 3.3: FR2 scenario "with zones from `Intl.supportedValuesOf("timeZone")`") contradicts design.md:54 (D4 "keep their data"). The data today is device-zone rows plus `Asia/Tokyo` (`locations_device_time_zone_unit.steps.tsx:154-161`).
- proposal.md:84 (FR6: "`pnpm --filter @time-zones/client bench` … prints each median, and emits a warning … It exits with 0") contradicts design.md:59-62 and tasks.md:43,45. There, the `bench` script is only `vitest bench --run --outputJson …`, and the warnings come from the separate `scripts/check-bench-budgets.mjs`.
- design.md:58 (D5: `citySearch.bench.ts` times "10 sample queries as one operation") together with design.md:61 (every median compared with `ROW_BUDGET_MS = 50`) contradicts `specs/location-search/spec.md:4`, where the 50 ms budget is per query ("Computing the results of one query … SHALL take at most 50 ms").

## Findings

### R1 — WARNING — D4 claims a warm-up that four locations scenarios do not have
- Location: `openspec/changes/replace-wall-clock-row-budgets-with-deterministic-checks/design.md:54`
- Rule: `.claude/rules/design-decisions.md`
- Problem: D4 says the scenarios change only their `Then`, and that "The Given/When steps keep their data and warm-up". The four locations budget scenarios have no warm-up today. Their Given only builds locations, and the single `presentLocationRows` call is the timed When (`locations_utc_offset_unit.steps.tsx:248-264`, `locations_local_time_unit.steps.tsx:175-191`, `locations_reorder_unit.steps.ts:246-270`, `locations_device_time_zone_unit.steps.tsx:152-165`). The spec deltas add exactly that warm-up as a new Given ("whose rows have been presented … once", `specs/locations/spec.md:7,46,101`).
- Impact: An implementer who follows D4 and keeps the Given/When as they are would count the first, cold presenting in the FR1 scenarios. "No formatter is built" would then fail on a clean run, or pass only because an earlier scenario in the same file happened to warm the same zone and language. The result would depend on scenario order.
- Fix: In design.md D4, replace "Scenarios keep their names, tags and data, and only their `Then` changes" and "The Given/When steps keep their data and warm-up" with: "Scenarios keep their names and old tags. Their steps follow the spec delta: the FR1 scenarios of the four locations features gain a Given that presents the rows once (the warm-up the date- and time-selection worlds already have), the `When` wraps only the second presenting in `startWorkCount()`, and `Then` asserts the counts." Rename the D4 heading to "Scenarios keep their names and tags; their steps follow the spec delta (NFR-P1)".
- Fix risk: none. The spec deltas and tasks group 3 already ask for this. Only the design text changes.
- Status: open

### R2 — WARNING — Task 3.3's zone data weakens the FR2 bound
- Location: `openspec/changes/replace-wall-clock-row-budgets-with-deterministic-checks/tasks.md:24`
- Rule: —
- Problem: Task 3.3 tells the FR2 cold scenario to use "zones from `Intl.supportedValuesOf("timeZone")`". With one row per zone, the FR2 bound ("at most 3 `Intl.DateTimeFormat` per distinct time zone") lets up to 3 formatters per row pass. That includes the very regression this change found: two uncached builds per row, for local time and local date. The existing data (`locations_device_time_zone_unit.steps.tsx:154-161`) puts the 50 rows into two zones, the device zone and `Asia/Tokyo`. With that data, per-row builds give dozens per zone and fail the bound. D4 (design.md:54) also says the data is kept, so task and design disagree.
- Impact: Implemented as written, the cold FR2 scenario still passes if `formatLocalTime`/`formatLocalDate` go back to building a formatter per call. G2 ("formatters rebuilt per row … still fail the PR check") then rests only on the FR1 scenarios.
- Fix: In tasks.md 3.3, replace "with zones from `Intl.supportedValuesOf("timeZone")`" with "keeping the existing data: `BUDGET_MATCHING_ROW_COUNT` rows in the device time zone and the rest in `Asia/Tokyo`, so that several rows share each zone".
- Fix risk: Only two zones are covered by the cold count. That is enough for a per-zone bound, and the spec scenario (`specs/locations/spec.md:74`, "50 locations and a device time zone that matches some of them") still holds.
- Status: open

### R3 — WARNING — The search benchmark compares 10 queries with a per-query budget
- Location: `openspec/changes/replace-wall-clock-row-budgets-with-deterministic-checks/design.md:58`
- Rule: —
- Problem: D5 times `citySearch.bench.ts` as "10 sample queries as one operation", and `evaluateBenchBudgets` compares every median with `ROW_BUDGET_MS = 50` (design.md:61). The stable and delta requirement "Search is fast and lazy" sets 50 ms per query (`specs/location-search/spec.md:4`: "Computing the results of one query over the full bundled data SHALL take at most 50 ms"). The benchmark would therefore check a total of 10 queries against a single-query budget, which is 10 times stricter than the spec.
- Impact: The FR6 timing check for search does not check the specified budget. It warns as soon as the average query takes more than 5 ms, while the product still meets its 50 ms budget. The warnings in the benchmark job (U4, M5) are then misleading for that operation.
- Fix: In design.md D5, replace "`citySearch.bench.ts` (10 sample queries as one operation)" with "`citySearch.bench.ts` (one operation, one query per iteration, rotating through the 10 sample queries of `location_search_performance.steps.ts`), so its median is the time of one query". Mirror the wording in tasks.md 6.1.
- Fix risk: A median over mixed queries can hide one slow query. That is acceptable for a non-blocking warning (NG4). It keeps the count of 8 operations that FR6, M5 and task 6.2's fixtures rely on.
- Status: open

### R4 — SUGGESTION — FR6 attributes the warnings to `pnpm bench`
- Location: `openspec/changes/replace-wall-clock-row-budgets-with-deterministic-checks/proposal.md:84`
- Rule: `.claude/rules/traceability.md`
- Problem: FR6 says `pnpm --filter @time-zones/client bench` "prints each median, and emits a warning … for every median above 50 ms". Design D5 (design.md:59-62) and tasks 6.1/6.3 make `bench` only `vitest bench --run --outputJson reports/bench/bench.json`. The medians table and the `::warning` lines come from the separate `node scripts/check-bench-budgets.mjs`, which the CI job runs as a second command (task 6.6).
- Impact: Verified against its own text, FR6 is not met by the tasks: `pnpm bench` alone emits no budget warning. An implementer may instead chain the check into the `bench` script, which would run it twice in CI.
- Fix: In proposal.md FR6, replace "`pnpm --filter @time-zones/client bench` times each … and emits a warning" with "`pnpm --filter @time-zones/client bench` times each of the eight operations … with warm-up and at least 20 samples and writes their medians to a JSON report. `scripts/check-bench-budgets.mjs` reads that report, prints each median, and emits a warning … for every median above 50 ms. Both exit with 0 whatever the medians are."
- Fix risk: none. Design and tasks already build this.
- Status: open

### R5 — SUGGESTION — D2 does not name which `Temporal` the counters spy on
- Location: `openspec/changes/replace-wall-clock-row-budgets-with-deterministic-checks/design.md:39-41`
- Rule: `.claude/rules/temporal.md`
- Problem: D2 spies on "`Temporal.ZonedDateTime`, `Instant`, `PlainDate`, `PlainTime` and `PlainDateTime` prototypes" and on `Temporal.ZonedDateTime.prototype.getTimeZoneTransition`. It does not say which `Temporal`. The app uses the polyfill exported by `@/lib/temporal` (`src/lib/temporal.ts:1-3`). Node 26 (`.nvmrc`) also has a native global `Temporal` (`node -e "typeof Temporal"` prints `object`), and that is a different set of classes.
- Impact: A `workCounters.ts` that spies on the global `Temporal` counts no `toLocaleString` and no transition lookup. The FR1/FR3 "no transition is looked up" assertions would then always pass. Task 5.3 (M3) would catch the stops cache, but the `toLocaleString` gap that D2 closes would silently stay open.
- Fix: In design.md D2, add: "Every Temporal spy targets the classes of `Temporal` imported from `@/lib/temporal`, never `globalThis.Temporal`." In task 2.1, add the case "a `getTimeZoneTransition` call on a `ZonedDateTime` from `@/lib/temporal` is counted".
- Fix risk: none.
- Status: open

### R6 — SUGGESTION — The line-count check covers only the time-selection files
- Location: `openspec/changes/replace-wall-clock-row-budgets-with-deterministic-checks/tasks.md:33`
- Rule: `.claude/rules/process-invariants.md`
- Problem: Only task 4.3 checks with `wc -l` that touched step and world files stay at most 200 lines. Tasks 3.2 and 3.4 add a warm-up Given, `f.AfterEachScenario` with `stop()` and, for reorder, an order assertion. They do this to `locations_utc_offset_unit.steps.tsx` (270 lines) and `locations_reorder_unit.steps.ts` (283 lines), which are already near the 300-line hard cap ("300 is a hard cap").
- Impact: Task 3.4 can push the reorder step file past the 300-line hard cap with nothing in the task list catching it.
- Fix: In tasks.md, move the `wc -l` check from 4.3 into the routine above group 3 (tasks.md:20): "every touched steps or world file stays at most 300 lines and, where it already was, at most 200 (`wc -l`); split a file that would exceed 300."
- Fix risk: A split of the reorder steps file may be needed, which adds a small task.
- Status: open

### R7 — SUGGESTION — The FR5 scenarios do not name what the labels are compared with
- Location: `openspec/changes/replace-wall-clock-row-budgets-with-deterministic-checks/specs/locations/spec.md:108`
- Rule: `.claude/rules/gherkin.md`
- Problem: "Labels are unchanged by formatter reuse" and "Hour labels are unchanged by formatter reuse" (`specs/time-selection/spec.md:28`) assert "the same … labels as the same zone formatted on its own". They do not say what "formatted on its own" is. If the step formats the lone zone through the same presenter, the comparison is presenter against presenter, and it cannot fail when the switch away from `toLocaleString` changes a label (FR5).
- Impact: The FR5 Gherkin scenarios may end up unable to fail. FR5 would then rest only on the literal characterization cases of task 1.1.
- Fix: In both scenarios, replace "as the same zone formatted on its own, in the same language" with "as `Temporal.ZonedDateTime#toLocaleString` gives for that zone with the label's format options, in the same language". Mirror this in tasks 3.1 and 4.3.
- Fix risk: The step calls `toLocaleString` outside the counted block, so it does not touch the work bounds.
- Status: open

## Verdict

Needs revision. No CRITICAL findings. The WARNINGs R1, R2 and R3 should be fixed before implementation: R1 and R2 decide whether the FR1/FR2 work bounds test the right thing, and R3 decides whether the search timing check uses the specified budget. R4–R7 are polish.
