# Review: replace-wall-clock-row-budgets-with-deterministic-checks

## Summary

| Item | Value |
|---|---|
| Tasks verified | 22/23 |
| Requirements traced | 41/48 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 0 |

## Tasks

Paths are relative to `packages/client/` unless stated. The diff base is `4780783` (parent of the commit that added this change). No `origin/main` exists in the sandbox. Commands I ran: the M6 and M3 Stryker runs (see Mutation), `pnpm run build` (succeeds), and one `npx vitest run` over `src/test/features/{locations,date_selection,time_selection,location_search}`, `src/test/workCounters.test.ts`, `src/test/benchmarks` and `src/presenter`: 35 files, 972 tests passed.

- ✅ 1.1 — `src/presenter/localDateTime.test.ts` "local labels (characterization)" and `src/presenter/dayTrack.test.ts` "formatHourLabel (characterization)": `it.each` with literal `en`/`ru` labels for `Asia/Kolkata`, `Asia/Kathmandu`, `America/New_York` at `2026-07-15T12:00:00Z`, `2026-03-08T06:59:00Z` and `2026-03-08T07:00:00Z`. Each is tagged `// FR5, UX1 of replace-wall-clock-row-budgets-with-deterministic-checks`.
- ✅ 1.2 — `src/presenter/dateTimeFormatters.test.ts:18-44` covers the same instance per key, distinct instances per kind, zone and language, and an `it.each` that each kind formats like its options constant.
- ✅ 1.3 — `src/presenter/dateTimeFormatters.ts:8-12` adds the `DateTimeLabelKind` enum. Lines 33-47 add `getDateTimeFormatter` with the `language|timeZoneId|kind` key and the one-line cache hit at :40. The JSDoc at :31 carries FR1, FR2, FR5.
- ✅ 1.4 — `src/presenter/localDateTime.ts:13-17,28-32` and `src/presenter/dayTrack.ts` `formatHourLabel` format `epochMilliseconds` with `getDateTimeFormatter`. The old `formatters` map and `getFormatter` are gone from `dayTrack.ts`.
- ✅ 1.5 — I measured 100% on `dateTimeFormatters.ts`, `localDateTime.ts` and `dayTrack.ts` (see Mutation).
- ✅ 2.1 — `src/test/workCounters.test.ts` (122 lines, header `Verifies FR1–FR4`) counts constructors, Temporal `toLocaleString`, `getTimeZoneTransition` and `normalize`, using `Temporal` from `@/lib/temporal`. It also checks restore and `instanceof`.
- ✅ 2.2 — `src/test/workCounters.ts` (133 lines) uses a `Proxy` construct trap (:43-69), Temporal prototype spies (:79-108) and a `normalize` spy (:109-118). It defines the D4 constants at :7-10.
- ✅ 3.1 — `locations_local_time_unit.feature` gained the FR1 scenario (warm Given, counted When) and "Labels are unchanged by formatter reuse" (`@FR5 @UX1`). The steps are at `steps/locations_local_time_unit.steps.tsx:189-254`, and the expected labels come from `Temporal.ZonedDateTime#toLocaleString` outside the counted block. The behaviour is done. The group-3 size check fails (198 → 255 lines, see R1).
- ✅ 3.2 — `locations_utc_offset_unit.feature` FR1 scenario. The steps use `presentBudgetRows` at `BUDGET_SECOND_MOMENT` and assert 0 formatters, 0 display names and 0 lookups. The file is 278 lines, the same as its original 270 under the 300 cap.
- ✅ 3.3 — `locations_device_time_zone_unit.steps.tsx:169-200` calls `vi.resetModules()` and imports `@/presenter` dynamically in "no row has been presented yet". It then asserts at most `MAX_FORMATTERS_PER_ZONE` per zone over more than one zone, and at most 1 `DisplayNames`. The behaviour is done. The size check fails (183 → 204 lines, see R1).
- ✅ 3.4 — `locations_reorder_unit.steps.ts` has a warm Given, a counted move+present, 0 formatters, display names and lookups, and the check `presentedRows[0].cityLabel === locations.at(-1).label`. 282 lines (under 300; it was 283).
- ✅ 4.1 — `date_selection/steps/referenceMomentRowsWorld.ts` replaces `elapsedMs` with `startWorkCount()` and exposes `workCount`/`stop`. The steps assert 0 formatters and 0 display names. `f.AfterEachScenario(budget.stop)`.
- ✅ 4.2 — `time_selection/steps/trackBudgetWorld.ts` counts the selection. `time_selection_moment.steps.tsx` asserts 0 formatters, display names and lookups.
- ✅ 4.3 — `time_selection_day_track.steps.tsx:150-224` covers the date change, with at most `MAX_TRANSITION_LOOKUPS_PER_ZONE` per zone through `transitionLookupsByZone()`, "The new day's tracks are computed once" (`presentAgain`, 0 lookups) and the hour-label check in `steps/trackLabelsCheck.ts`. The behaviour is done. The size check fails (167 → 225 lines, see R1).
- ✅ 5.1 — `location_search/steps/searchWorld.ts` `countSearchWork` and `location_search_performance.steps.ts` assert exactly `NORMALIZATIONS_PER_QUERY` and at most `MAX_COLLATORS_PER_QUERY` for each of the 10 queries. `measureSearchMilliseconds` is removed.
- ✅ 5.2 — `grep -rlE "performance\.now\(\)" src --exclude-dir=benchmarks` prints nothing (run by me).
- ❌ 5.3 — The command as written (three files, `--disableBail`) crashes in the dry run here: `Test runner crashed … TypeError: Cannot convert object to primitive value`. Without `--disableBail`, the jq filter prints `true`, but every cache-hit mutant is credited to `locations_storage_ui_unit.steps.tsx` "Private mode", not to a work-bound scenario. The measurement does not show what M3 claims (see R2).
- ✅ 6.1 — `src/test/benchmarks/rowPresenting.bench.ts`, `timeSelection.bench.ts` and `citySearch.bench.ts` (one query per iteration, rotating) carry the FR6/NFR-P1 headers and `WARMUP_ITERATIONS = 5`, `SAMPLE_ITERATIONS = 20`. `package.json` has `"bench": "vitest bench --run --mode test --outputJson reports/bench/bench.json"`. `reports/bench/bench.json` holds 8 benchmarks with medians.
- ✅ 6.2 — `src/test/benchmarks/benchBudgets.test.ts` covers under budget, exactly 50, 80, the `it.each` no-report cases, and CLI runs through `execFileSync` with a temporary `GITHUB_STEP_SUMMARY`. The fixtures `underBudget.json` and `overBudget.json` exist.
- ✅ 6.3 — `scripts/benchBudgets.ts` (`ROW_BUDGET_MS = 50`, `evaluateBenchBudgets`) and `scripts/check-bench-budgets.mjs` (default path, summary file or stdout, warning lines, no non-zero exit). Both carry FR6 headers.
- ✅ 6.4 — I measured 98.15% on `scripts/benchBudgets.ts` (see Mutation).
- ✅ 8.1 — The traceability loop from tasks.md over `src scripts` prints nothing (run by me).
- ✅ 8.2 — `pnpm run build` succeeds (run by me), and the affected suites pass (972 tests). I did not re-run the full `pnpm test` or `test:bdd`. No screenshot baseline is touched in the diff.

## Requirements

- ✅ FR1 — `src/presenter/dateTimeFormatters.ts:33-47` (JSDoc FR1). The warm scenarios in `locations_local_time_unit`, `locations_utc_offset_unit`, `locations_reorder_unit` and `time_selection_moment` assert 0 formatters, display names and lookups. A probe with the cache hit bypassed (`if (false)`, then restored) fails the local-time FR1 Then with `expected 100 to be +0`.
- ✅ FR2 — `locations_device_time_zone_unit.steps.tsx:169-200`: cold module graph, at most 3 formatters per zone, at most 1 `DisplayNames`. Tag `@FR2` on the scenario.
- ✅ FR3 — `date_selection_reference_moment_rows` (0 formatters) and `time_selection_day_track` (at most 2 lookups per zone, then 0 on the second presenting of the new day).
- ✅ FR4 — `location_search_performance.steps.ts` asserts exactly 1 normalization and at most 1 collator per query over 10 queries.
- ✅ FR5 — Characterization in `localDateTime.test.ts` and `dayTrack.test.ts` (en/ru, +5:30, +5:45, New York DST). The label scenarios compare with `toLocaleString` from the platform.
- ✅ FR6 — The three `*.bench.ts` files with 8 operations, 5 warm-up and 20 samples. `scripts/benchBudgets.ts` and `scripts/check-bench-budgets.mjs` warn above 50 and always exit 0, tested by `benchBudgets.test.ts`.
- ⚠️ FR7 — Not implemented in this change: `.github/workflows/ci.yml` has no `benchmark` job, and `ciBenchmarkJob.test.ts` does not exist. The operator deferred this to tasks.md "Human follow-up" H1, because `.github/` is outside the implement stage. It is not a finding for this stage.
- ⚠️ FR8 — The `src/` part holds: no `performance.now()` outside `src/test/benchmarks/` (traced in the `workCounters.ts` header). The `.claude/rules` edits and ADR 0008 are deferred to H2 by the operator. `docs/adr/` still ends at 0007. Not a finding for this stage.
- ✅ NFR-P1 — The budget scenarios carry `@NFR-P1` on the same tag line as this change's tag. The 50 ms budget stays in the specs and in `ROW_BUDGET_MS` of the benchmark check.
- ✅ UX1 — The characterization literals are unchanged and pass against the new code. No screenshot baselines or view files change in the diff.
- ⚠️ M1 — Needs the PR's CI run. Deferred to H3 (the sandbox has no GitHub access). Not a finding for this stage.
- ✅ M2 — `grep -rlE "performance\.now\(\)" packages/client/src --exclude-dir=benchmarks` prints nothing.
- ⚠️ M3 — Not demonstrated as stated: the specified run crashes, and the kills it records come from a storage UI scenario, not a work-bound scenario (R2).
- ⚠️ M4 — Every id except FR7 is traced under `src`/`scripts`. FR7 and the `.claude/rules`/`docs/adr` lines arrive with H1 and H2. Not a finding for this stage.
- ⚠️ M5 — Needs the PR's benchmark job (H3). Locally, `reports/bench/bench.json` has 8 medians. Not a finding for this stage.
- ✅ M6 — Measured: `dateTimeFormatters.ts` 100%, `localDateTime.ts` 100%, `dayTrack.ts` 100%, `scripts/benchBudgets.ts` 98.15%.
- ✅ Scenario: A check fails (app-delivery) — unchanged by this change. `.github/workflows/ci.yml` job "Lint, test, build, E2E" runs `pnpm lint`, `pnpm test`, the bundle check and `test:bdd`.
- ✅ Scenario: Bundle exceeds the budget (app-delivery) — unchanged. `ci.yml:48` runs `check:bundle-size` (`scripts/check-bundle-size.mjs`).
- ⚠️ Scenario: A timing budget is missed (app-delivery) — the warning and the exit code 0 are tested in `benchBudgets.test.ts` (over-budget fixture). The non-blocking CI job is deferred to H1.
- ✅ Scenario: Unit tests ignore runner speed (app-delivery) — the M2 grep prints nothing.
- ✅ Scenario: 50 rows within the budget (date-selection) — `date_selection_reference_moment_rows.feature` with `@FR3`. The steps assert 0 formatters and display names, plus the row dates at the next day.
- ✅ Scenario: The new date shows in the same render (date-selection) — unchanged scenario in `date_selection_reference_moment_rows.feature`. No product change.
- ✅ Scenario: Query timing (location-search) — `location_search_performance.feature` with `@FR4`. The steps assert 1 normalization and at most 1 collator per query.
- ✅ Scenario: Data loads only when the search opens (location-search) — unchanged. `locations/locations_ui_e2e.feature`.
- ✅ Scenario: Bundle budget (location-search) — unchanged. The bundle check in `ci.yml:48`. No new production dependency.
- ✅ Scenario: 50 rows within the budget (locations, offsets) — `locations_utc_offset_unit.feature` with `@FR1`. The steps assert 0 formatters, display names and lookups at another minute.
- ✅ Scenario: No accessibility violations with offsets (locations) — unchanged. `locations_utc_offset_e2e.feature:7`.
- ✅ Scenario: Offsets fit narrow and wide screens (locations) — unchanged. `locations_utc_offset_e2e.feature:21`.
- ✅ Scenario: List screenshots show the offsets (locations) — unchanged. `locations_ui_e2e.feature:114`, no baseline touched.
- ✅ Scenario: No accessibility violations (locations, reorder) — unchanged. `locations_reorder_e2e.feature:185,197`.
- ✅ Scenario: Handle target size (locations, reorder) — unchanged. `locations_reorder_e2e.feature:60-65` (at least 44 by 44 px).
- ✅ Scenario: Narrow and wide screens (locations, reorder) — unchanged. `locations_reorder_e2e.feature:210-221` (320, 2560).
- ✅ Scenario: 50 locations within the budget (locations, reorder) — `locations_reorder_unit.feature` with `@FR1`. 0 formatters, display names and lookups, and the first row is the last location.
- ✅ Scenario: Reorder stays out of the initial bundle (locations, reorder) — unchanged. `scripts/check-bundle-size.mjs`. No view or import change.
- ✅ Scenario: List screenshots show the handles (locations, reorder) — unchanged. `locations_reorder_e2e.feature:224`.
- ✅ Scenario: Row name includes the badge (locations, badge) — unchanged. `locations_device_time_zone_e2e.feature:7`.
- ✅ Scenario: 50 rows within the budget (locations, badge) — `locations_device_time_zone_unit.feature` with `@FR2`. Cold import, per-zone at most 3, at most 1 `DisplayNames`.
- ✅ Scenario: No accessibility violations with the badge (locations) — unchanged. `locations_device_time_zone_e2e.feature:14`.
- ✅ Scenario: Badge fits narrow and wide screens (locations) — unchanged. `locations_device_time_zone_e2e.feature:27`.
- ✅ Scenario: List screenshots show the badge (locations) — unchanged. `locations_ui_e2e.feature:114`, no baseline touched.
- ✅ Scenario: 50 rows within the budget (locations, local time) — `locations_local_time_unit.feature` with `@FR1`. The warm Given and counted When assert 0 formatters, display names and lookups.
- ✅ Scenario: Labels are unchanged by formatter reuse (locations) — `locations_local_time_unit.steps.tsx:210-254`. en and ru are compared with `ZonedDateTime#toLocaleString` from `@/lib/temporal` outside any count.
- ✅ Scenario: No accessibility violations with times (locations) — unchanged. `locations_local_time_e2e.feature:39`.
- ✅ Scenario: Time does not change the row name and is not announced (locations) — unchanged. `locations_local_time_e2e.feature:51`.
- ✅ Scenario: 50 rows within the time-selection budget (time-selection) — `time_selection_moment.feature` with `@FR1`. 0 formatters, display names and lookups.
- ✅ Scenario: 50 tracks within the date-change budget (time-selection) — `time_selection_day_track.steps.tsx:150-185`. 0 formatters and display names, at most 2 lookups per zone over more than 0 zones.
- ✅ Scenario: The new day's tracks are computed once (time-selection) — `time_selection_day_track.steps.tsx:186-209` (`presentAgain`, 0 lookups).
- ✅ Scenario: Hour labels are unchanged by formatter reuse (time-selection) — `steps/trackLabelsCheck.ts` compares every hour label in en and ru with `toLocaleString` and the hour or local-time options.

## Mutation

All runs were from `packages/client/`, one at a time.

- M6 run (`--mutate 'src/presenter/dateTimeFormatters.ts,src/presenter/localDateTime.ts,src/presenter/dayTrack.ts,scripts/benchBudgets.ts'`):
  - `dateTimeFormatters.ts` 100% (7 killed)
  - `localDateTime.ts` 100% (2)
  - `dayTrack.ts` 100% (24)
  - `scripts/benchBudgets.ts` 98.15% (53 killed, 1 survived)

  The survivor is the `ArrayDeclaration` `["Stryker was here"]` at `scripts/benchBudgets.ts:24`. It is equivalent, as the comment at :22 says, because `filter(isRecord)` drops a string. That comment is `disable next-line` on :23, so it does not reach :24. Low stakes, so not a finding.
- M3 run as specified (`--mutate 'src/presenter/dateTimeFormatters.ts,src/model/dayPeriodStops.ts,src/presenter/countryName.ts' --disableBail`): the dry run fails with `Test runner crashed. Tried twice to restart it without any luck. … TypeError: Cannot convert object to primitive value at errorToString (@stryker-mutator/util/dist/src/errors.js:22:12)`.
- The same three files without `--disableBail`: 100% each (31, 12 and 7 killed). The tasks.md 5.3 jq filter prints `true`. However, all 8 cache-hit mutants are killed after 1 test, by test 21, which is `locations_storage_ui_unit.steps.tsx` "Private mode". So were 43 of the 51 mutants in the run.
- `dateTimeFormatters.ts` alone with `--disableBail` completes. It also completes with `--disableBail --coverageAnalysis all`, where each mutant runs 303 of 1124 tests. In both, the cache-bypass mutant (`if (false)`) at `:40` is killed only by `dateTimeFormatters.test.ts`, the device time zone FR2 `When` step, and UI flows (`locations_storage_ui_unit`, `locations_ui_unit`, `main_page_states_unit`, `date_selection_calendar`, `AppShell.pageNotices`). No warm FR1/FR3 `Then` step is credited. The same mutant applied by hand fails that `Then` in plain Vitest, so the tests catch it. The Stryker report does not show it.
- `localDateTime.ts` alone with `--disableBail`: completes. Its score is covered above.

## Findings

### R1 — WARNING — Three touched step files grow past the 200-line target
- Location: `packages/client/src/test/features/locations/steps/locations_local_time_unit.steps.tsx:210`
- Rule: `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity") and the group-3 routine of `tasks.md` ("check with `wc -l` that every touched steps or world file stays at most 300 lines and, where it already was, at most 200").
- Problem: Three step files were at or under 200 lines and are now over it:
  - `locations_local_time_unit.steps.tsx`: 198 → 255. The new label scenario at :210-254 holds the whole platform-label comparison inline.
  - `time_selection/steps/time_selection_day_track.steps.tsx`: 167 → 225. The per-zone lookup assertion is at :165-182, and the "computed once" setup with `previousMoment` is at :186-209.
  - `locations/steps/locations_device_time_zone_unit.steps.tsx`: 183 → 204. The cold re-import and per-zone assertions are at :169-200.

  The tasks were ticked although the size check they include fails.
- Impact: This breaks a project invariant that CLAUDE.md repeats ("Files must stay under 200 lines for AI context quality"). The same change already has world and check files for this logic (`rowBudgetWorld.ts` at 52 lines, `trackBudgetWorld.ts` at 107, `trackLabelsCheck.ts` at 79). Leaving the logic inline puts three more files over the target, which later changes must work around.
- Fix: Move the new scenario logic out of the step files into their existing helpers, in the same way `trackLabelsCheck.ts` already does for hour labels:
  1. Move the local-time label comparison (the Given locations, the en/ru presenting and the `toLocaleString` comparison) into a new `locations/steps/localTimeLabelsCheck.ts` shaped like `trackLabelsCheck.ts`.
  2. Move the per-zone lookup assertion and the "previous day, then date change" setup of the day-track scenarios into `trackBudgetWorld.ts`, as e.g. `expectLookupsPerZoneAtMost(max)` and `prepareDayStarting(dayStart, deviceTimeZoneId)`.
  3. Move the cold re-import (`vi.resetModules()` plus `import("@/presenter")`) and the per-zone formatter assertion into `rowBudgetWorld.ts`.

  Re-run each of the three steps files alone, then `wc -l` them.
- Fix risk: The move is test-only and changes no behaviour or step text. Two things to watch. First, `vi.resetModules()` must stay in the Given step that calls it, so the cold module graph of D3 is kept. Second, `rowBudgetWorld.ts` is imported by `rowPresenting.bench.ts`. Keeping the new helpers free of `expect` at module level keeps the bench import working.
- Status: open

### R2 — WARNING — M3 cache-guard proof does not show a work-bound scenario killing the cache bypass
- Location: `openspec/changes/replace-wall-clock-row-budgets-with-deterministic-checks/tasks.md:39`
- Rule: `.claude/rules/tdd-workflow.md` ("Analyze survived mutants — each survivor indicates a missed scenario or a weak assertion") and proposal M3 ("each one is killed by at least one test under `src/test/features/`. So turning off the formatter, colour stop or region name cache fails a work-bound scenario").
- Problem: Task 5.3 is ticked, but the measurement it describes does not hold here, in two ways.
  - The specified three-file run with `--disableBail` fails its dry run: `TypeError: Cannot convert object to primitive value`.
  - Without `--disableBail`, the jq filter prints `true` only because it accepts any test under `src/test/features/`. Every cache-hit mutant of `dateTimeFormatters.ts:40`, `dayPeriodStops.ts:70` and `countryName.ts:8` is credited to `locations_storage_ui_unit.steps.tsx` "Private mode", which is not a work-bound scenario.

  Per-file runs with `--disableBail`, and also with `--coverageAnalysis all`, show something more. The `if (false)` cache-bypass mutant of `dateTimeFormatters.ts` is never credited to any warm FR1/FR3 `Then` step. Only the FR2 `When` step and UI flows kill it, although plain Vitest fails `locations_local_time_unit` "50 rows within the budget" with `expected 100 to be +0` when the same bypass is applied by hand. So the code meets FR1. The recorded M3 evidence does not show it.
- Impact: M3 is reported as met with evidence that does not show what it claims. If a later edit removed or weakened a warm work-bound `Then` assertion, the 5.3 check would still print `true`, because unrelated UI scenarios keep killing the mutants. The reviewer of the PR is told a regression proof exists when it does not.
- Fix: In `tasks.md` 5.3:
  1. Untick the task.
  2. Replace the three-file command with three per-file runs `npx stryker run --mutate '<file>' --disableBail`. The per-file form completes, as measured for `dateTimeFormatters.ts`.
  3. Narrow `$featureTests` in the jq filter from every `src/test/features/` test to the test names of the work-bound scenarios. That is names containing `within the budget`, `within the time-selection budget`, `within the date-change budget` or `computed once`.
  4. Record the measured result under 5.3.
  5. Tick 5.3 only when the narrowed filter prints `true`. If it prints `false` because Stryker does not credit the vitest-cucumber `Then` steps, as measured here, leave 5.3 open with that note. Do not widen the filter back.
- Fix risk: No production or test code changes. Given the attribution measured here, the narrowed filter will likely print `false`. Task 5.3 then stays open, and M3 needs a decision on how it is measured, made in proposal/design D7. D7 currently names "a test from a file under `src/test/features/`". Narrowing follows M3's own wording ("fails a work-bound scenario") but is stricter than D7's literal filter. Each per-file run takes about 1.5 minutes.
- Status: open

## Verdict

Ready. There is no CRITICAL finding, so nothing blocks. R1 and R2 are WARNINGs that should be fixed before archiving. FR7, the rule and ADR part of FR8, M1, M4 and M5 are open by the operator's decision (Human follow-up H1–H3), not by defects in this branch.
