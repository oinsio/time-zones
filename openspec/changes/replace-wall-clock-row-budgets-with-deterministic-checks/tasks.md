# Tasks

All paths are relative to `packages/client/` unless they start with `.github/`, `.claude/` or `docs/`. Run every test command from `packages/client/`, one at a time, never in the background (CLAUDE.md "Running tests"). Stryker runs only with `--mutate` on at most 5 files.

## 1. Shared formatter cache (FR1, FR2, FR5, design D1)

- [ ] 1.1 Characterization (FR5, UX1): in `src/presenter/localDateTime.test.ts` and `src/presenter/dayTrack.test.ts`, add `it.each` cases that pin the current output of `formatLocalTime`, `formatLocalDate` and `formatHourLabel` for `en` and `ru`. Zones: `Asia/Kolkata`, `Asia/Kathmandu`, `America/New_York`. Instants: `2026-07-15T12:00:00Z`, plus `America/New_York` on `2026-03-08T06:59:00Z` and `2026-03-08T07:00:00Z` (DST start). Expected strings are literals. Tag the cases with `// FR5, UX1 of replace-wall-clock-row-budgets-with-deterministic-checks`. Verify: `npx vitest run src/presenter/localDateTime.test.ts src/presenter/dayTrack.test.ts` passes on the unchanged code.
- [ ] 1.2 RED: add `src/presenter/dateTimeFormatters.test.ts`. Cases: same instance for the same language, zone and `DateTimeLabelKind`; distinct instances for each of the 3 kinds and for another zone or language; the formatter of each kind formats like its options constant. Verify: `npx vitest run src/presenter/dateTimeFormatters.test.ts` fails (module missing).
- [ ] 1.3 GREEN: add `DateTimeLabelKind` (enum, next to the presenter) and `src/presenter/dateTimeFormatters.ts` with `getDateTimeFormatter(language, timeZoneId, kind)` and the cache key `language|timeZoneId|kind`. JSDoc: `Implements FR1, FR2, FR5 of replace-wall-clock-row-budgets-with-deterministic-checks (D1).` Verify: task 1.2's command passes.
- [ ] 1.4 Switch `formatLocalTime` and `formatLocalDate` (`src/presenter/localDateTime.ts`) and `formatHourLabel` (`src/presenter/dayTrack.ts`) to `getDateTimeFormatter(...).format(localDateTime.epochMilliseconds)`. Remove the old `formatters` map and `getFormatter` from `dayTrack.ts`. Verify: `npx vitest run src/presenter` passes, including the 1.1 characterization cases, unchanged.
- [ ] 1.5 Mutation (M6): `npx stryker run --mutate 'src/presenter/dateTimeFormatters.ts,src/presenter/localDateTime.ts,src/presenter/dayTrack.ts'`. Read `reports/mutation/mutation-report.json`. The score is ≥ 95% (minimum 90%). Kill survivors with extra cases in the matching `*.test.ts`.

## 2. Work counters (FR1–FR4, design D2, D3)

- [ ] 2.1 RED: add `src/test/workCounters.test.ts`. `startWorkCount()` counts `new Intl.DateTimeFormat` (with `formattersByZone()` grouped by the `timeZone` option), `new Intl.DisplayNames`, `new Intl.Collator`, each `toLocaleString` call on the five Temporal prototypes (counted as a formatter), `ZonedDateTime#getTimeZoneTransition` and `String#normalize`. `stop()` restores the originals (`Intl.DateTimeFormat === original` afterwards), and `instanceof Intl.DateTimeFormat` still holds for a formatter built while counting. Verify: `npx vitest run src/test/workCounters.test.ts` fails (module missing).
- [ ] 2.2 GREEN: implement `src/test/workCounters.ts` per D2, with the threshold constants of D4 (`MAX_FORMATTERS_PER_ZONE`, `MAX_TRANSITION_LOOKUPS_PER_ZONE`, `MAX_COLLATORS_PER_QUERY`, `NORMALIZATIONS_PER_QUERY`). Header comment: `Implements FR1–FR4 of replace-wall-clock-row-budgets-with-deterministic-checks (D2).` Verify: task 2.1's command passes, and `wc -l src/test/workCounters.ts` prints at most 200.

## 3. Row-presenting scenarios (FR1, FR2, NFR-P1, design D4)

For each task: first change the feature file to the spec delta's steps and tags (`@replace-wall-clock-row-budgets-with-deterministic-checks @FR<n> @NFR-P1` added on one tag line, `@FR5 @UX1` instead of `@NFR-P1` for the label scenarios, old tags kept) and confirm that the step file fails (RED). Then rewrite the steps with `startWorkCount()`, call `stop()` in `f.AfterEachScenario`, delete the `performance.now()` and `elapsedMs` code, and confirm that it passes (GREEN). Prove the bound bites (M3) by temporarily bypassing the guarded cache and seeing the scenario fail, then revert.

- [ ] 3.1 `src/test/features/locations/locations_local_time_unit.feature` + `steps/locations_local_time_unit.steps.tsx`: "50 rows within the budget" (FR1) and the new "Labels are unchanged by formatter reuse" (FR5). M3 check: make `getDateTimeFormatter` skip the cache. Verify: `npx vitest run src/test/features/locations/steps/locations_local_time_unit.steps.tsx`.
- [ ] 3.2 `locations_utc_offset_unit.feature` + steps: "50 rows within the budget" (FR1). Verify: `npx vitest run src/test/features/locations/steps/locations_utc_offset_unit.steps.tsx`.
- [ ] 3.3 `locations_device_time_zone_unit.feature` + steps: "50 rows within the budget" as the cold bound (FR2, D3: `vi.resetModules()` and dynamic `import("@/presenter")` in the Given step, with zones from `Intl.supportedValuesOf("timeZone")`). M3 check: build the `Intl.DisplayNames` per row. Verify: `npx vitest run src/test/features/locations/steps/locations_device_time_zone_unit.steps.tsx`.
- [ ] 3.4 `locations_reorder_unit.feature` + steps: "50 locations within the budget" (FR1), plus the order assertion from the spec delta. Verify: `npx vitest run src/test/features/locations/steps/locations_reorder_unit.steps.ts`.

## 4. Date-change and time-selection scenarios (FR1, FR3, FR5, NFR-P1, design D4)

Same RED → GREEN → M3 routine as group 3.

- [ ] 4.1 `src/test/features/date_selection/date_selection_reference_moment_rows.feature` + `steps/referenceMomentRowsWorld.ts` + steps: "50 rows within the budget" (FR3). Replace `elapsedMs` in the world with the counter. Verify: `npx vitest run src/test/features/date_selection/steps/date_selection_reference_moment_rows.steps.tsx`.
- [ ] 4.2 `src/test/features/time_selection/time_selection_moment.feature` + `steps/trackBudgetWorld.ts` + steps: "50 rows within the time-selection budget" (FR1, no transition lookups). M3 check: clear the stop cache on every call of `getDayPeriodStops`. Verify: `npx vitest run src/test/features/time_selection/steps/time_selection_moment.steps.tsx`.
- [ ] 4.3 `time_selection_day_track.feature` + steps: "50 tracks within the date-change budget" (FR3, at most 2 lookups per zone), the new "The new day's tracks are computed once" (FR3) and "Hour labels are unchanged by formatter reuse" (FR5). M3 check: clear the hour label cache on every call. Verify: `npx vitest run src/test/features/time_selection/steps/time_selection_day_track.steps.tsx`, and every touched steps or world file stays at most 200 lines (`wc -l`).

## 5. Search scenario (FR4, NFR-P1, design D4)

- [ ] 5.1 `src/test/features/location_search/location_search_performance.feature` + steps + `steps/searchWorld.ts`: "Query timing" asserts 1 normalization and at most 1 collator per sample query. Remove `measureSearchMilliseconds`. M3 check: normalize the record texts inside `match` instead of at build time. Verify: `npx vitest run src/test/features/location_search/steps/location_search_performance.steps.ts`.
- [ ] 5.2 No wall-clock left (M2, FR8): `grep -rlE "performance\.now\(\)" src --exclude-dir=benchmarks` prints nothing. It also covers the 3 `*World.ts` helpers, so timing code left in a world fails it.

## 6. Benchmark (FR6, FR7, design D5)

- [ ] 6.1 Add `src/test/benchmarks/rowPresenting.bench.ts`, `timeSelection.bench.ts` and `citySearch.bench.ts` (8 operations, `warmupIterations: 5`, `iterations: 20`, named constants). Each header says `Implements FR6, verifies NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks`. Add `"bench": "vitest bench --run --outputJson reports/bench/bench.json"` to `package.json`. Verify: `pnpm bench` prints 8 results and writes `reports/bench/bench.json`, and `npx vitest run src/test/workCounters.test.ts` still collects no bench file.
- [ ] 6.2 Add `scripts/check-bench-budgets.mjs` (`ROW_BUDGET_MS = 50`, medians table to `$GITHUB_STEP_SUMMARY` or stdout, `::warning` per miss, exit 0). Verify: `node scripts/check-bench-budgets.mjs` (default path `reports/bench/bench.json`) after 6.1 prints 8 medians and exits 0. Then run it on a copy of the JSON with one median edited to 80, passed by path argument: it prints one `::warning` and still exits 0.
- [ ] 6.3 Add the `benchmark` job to `.github/workflows/ci.yml` (`continue-on-error: true`, own runner, checkout + pnpm + node + install, `pnpm --filter @time-zones/client bench`, then the budget script). Comment `# implements FR7 of replace-wall-clock-row-budgets-with-deterministic-checks`. Verify: `npx --yes @action-validator/cli .github/workflows/ci.yml` (or `actionlint` if installed) reports no errors, and the "Lint, test, build, E2E" job still has no bench step (`grep -n bench .github/workflows/ci.yml` shows only the new job).

## 7. Rule and ADR (FR8, design D6)

- [ ] 7.1 Update `.claude/rules/test-planning.md` (the bullet of "For changes with performance requirements" plus a line in the bad/good examples). Write `docs/adr/0008-performance-budgets-as-work-bounds.md` in the format of `.claude/rules/adr.md`, and add 0008 to the ADR list in `CLAUDE.md`. Verify: `grep -n "performance.now" .claude/rules/test-planning.md` shows only the "never assert" sentence, and the ADR names this change.

## 8. Integration checks (M1, M4, M5)

- [ ] 8.1 Traceability (M4): `for id in FR1 FR2 FR3 FR4 FR5 FR6 FR7 FR8 NFR-P1 UX1; do grep -rqE "replace-wall-clock-row-budgets-with-deterministic-checks.*$id([^0-9A-Za-z-]|$)|$id([^0-9A-Za-z-]|$).*replace-wall-clock-row-budgets-with-deterministic-checks" src scripts ../../.github ../../.claude/rules ../../docs/adr || echo "missing $id"; done` prints nothing.
- [ ] 8.2 `pnpm run build` succeeds. Then `pnpm test` passes with 0 failed tests, and `pnpm --filter @time-zones/client test:bdd` passes with no screenshot re-approval (UX1).
- [ ] 8.3 Ask the user to push and confirm on the PR (M1, M5): "Lint, test, build, E2E" is green, and the `benchmark` job summary lists 8 medians.

## Workflow follow-up

- Archive the change with `/opsx:archive` after review (`openspec/changes/archive/YYYY/MM/…`).
