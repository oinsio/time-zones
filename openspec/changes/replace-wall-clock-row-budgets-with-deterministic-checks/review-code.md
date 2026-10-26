# Review: replace-wall-clock-row-budgets-with-deterministic-checks

## Summary

| Item | Value |
|---|---|
| Tasks verified | 19/23 |
| Requirements traced | 41/48 |
| CRITICAL | 2 |
| WARNING | 0 |
| SUGGESTION | 1 |

## Tasks

Paths are relative to `packages/client/` unless stated. The diff base is `4780783` (parent of the commit that added this change). No `origin/main` exists in the sandbox. Commands I ran: the M6 and M3 Stryker runs (see Mutation), `pnpm run build` (succeeds), and one `npx vitest run` over `src/test/features/{locations,date_selection,time_selection,location_search}`, `src/test/workCounters.test.ts`, `src/test/benchmarks` and `src/presenter`: 35 files, 972 tests passed.

- ✅ 1.1 — `src/presenter/localDateTime.test.ts` "local labels (characterization)" and `src/presenter/dayTrack.test.ts` "formatHourLabel (characterization)": `it.each` with literal `en`/`ru` labels for `Asia/Kolkata`, `Asia/Kathmandu`, `America/New_York` at `2026-07-15T12:00:00Z`, `2026-03-08T06:59:00Z` and `2026-03-08T07:00:00Z`. Each is tagged `// FR5, UX1 of replace-wall-clock-row-budgets-with-deterministic-checks`.
- ✅ 1.2 — `src/presenter/dateTimeFormatters.test.ts:18-44` covers the same instance per key, distinct instances per kind, zone and language, and an `it.each` that each kind formats like its options constant.
- ✅ 1.3 — `src/presenter/dateTimeFormatters.ts:8-12` adds the `DateTimeLabelKind` enum. Lines 33-47 add `getDateTimeFormatter` with the `language|timeZoneId|kind` key and the one-line cache hit at :40. The JSDoc at :31 carries FR1, FR2, FR5.
- ✅ 1.4 — `src/presenter/localDateTime.ts:13-17,28-32` and `src/presenter/dayTrack.ts` `formatHourLabel` format `epochMilliseconds` with `getDateTimeFormatter`. The old `formatters` map and `getFormatter` are gone from `dayTrack.ts`.
- ✅ 1.5 — I measured 100% on `dateTimeFormatters.ts`, `localDateTime.ts` and `dayTrack.ts` (see Mutation).
- ✅ 2.1 — `src/test/workCounters.test.ts` (122 lines, header `Verifies FR1–FR4`) counts constructors, Temporal `toLocaleString`, `getTimeZoneTransition` and `normalize`, using `Temporal` from `@/lib/temporal`. It also checks restore and `instanceof`.
- ✅ 2.2 — `src/test/workCounters.ts` (133 lines) uses a `Proxy` construct trap (:43-69), Temporal prototype spies (:79-108) and a `normalize` spy (:109-118). It defines the D4 constants at :7-10.
- ❌ 3.1 — Ticked but not done. The scenarios exist: `locations_local_time_unit.feature` gained the FR1 scenario (warm Given, counted When) and "Labels are unchanged by formatter reuse" (`@FR5 @UX1`). The steps are at `steps/locations_local_time_unit.steps.tsx:189-254`, and the expected labels come from `Temporal.ZonedDateTime#toLocaleString` outside the counted block. But the group-3 routine also requires the `wc -l` check "at most 200 where it already was". The file was 198 lines and is now 255, so that check fails (R1).
- ✅ 3.2 — `locations_utc_offset_unit.feature` FR1 scenario. The steps use `presentBudgetRows` at `BUDGET_SECOND_MOMENT` and assert 0 formatters, 0 display names and 0 lookups. The file is 278 lines, the same as its original 270 under the 300 cap.
- ❌ 3.3 — Ticked but not done. The behaviour exists: `locations_device_time_zone_unit.steps.tsx:169-200` calls `vi.resetModules()` and imports `@/presenter` dynamically in "no row has been presented yet". It then asserts at most `MAX_FORMATTERS_PER_ZONE` per zone over more than one zone, and at most 1 `DisplayNames`. But the group-3 `wc -l` check fails: the file was 183 lines and is now 204, over 200 (R1). The scenario also lacks this change's tag comment at :155 (R3).
- ✅ 3.4 — `locations_reorder_unit.steps.ts` has a warm Given, a counted move+present, 0 formatters, display names and lookups, and the check `presentedRows[0].cityLabel === locations.at(-1).label`. 282 lines (under 300; it was 283).
- ✅ 4.1 — `date_selection/steps/referenceMomentRowsWorld.ts` replaces `elapsedMs` with `startWorkCount()` and exposes `workCount`/`stop`. The steps assert 0 formatters and 0 display names. `f.AfterEachScenario(budget.stop)`.
- ✅ 4.2 — `time_selection/steps/trackBudgetWorld.ts` counts the selection. `time_selection_moment.steps.tsx` asserts 0 formatters, display names and lookups.
- ❌ 4.3 — Ticked but not done. The behaviour exists: `time_selection_day_track.steps.tsx:150-224` covers the date change, with at most `MAX_TRANSITION_LOOKUPS_PER_ZONE` per zone through `transitionLookupsByZone()`, "The new day's tracks are computed once" (`presentAgain`, 0 lookups) and the hour-label check in `steps/trackLabelsCheck.ts`. But group 4 uses the "same RED → GREEN routine as group 3", including the `wc -l` check. The file was 167 lines and is now 225, so that check fails (R1).
- ✅ 5.1 — `location_search/steps/searchWorld.ts` `countSearchWork` and `location_search_performance.steps.ts` assert exactly `NORMALIZATIONS_PER_QUERY` and at most `MAX_COLLATORS_PER_QUERY` for each of the 10 queries. `measureSearchMilliseconds` is removed.
- ✅ 5.2 — `grep -rlE "performance\.now\(\)" src --exclude-dir=benchmarks` prints nothing (run by me).
- ❌ 5.3 — Ticked but not done. The command as written (three files, `--disableBail`) fails in its dry run here: `Test runner crashed … TypeError: Cannot convert object to primitive value`. So the specified check never produced a report, and tasks.md records no result. Three per-file runs with `--disableBail` do complete. In each, every cache-hit mutant is Killed by at least one `src/test/features/` test, which is what M3/D7 ask (see Mutation). The task text and its record do not reflect this (R2).
- ✅ 6.1 — `src/test/benchmarks/rowPresenting.bench.ts`, `timeSelection.bench.ts` and `citySearch.bench.ts` (one query per iteration, rotating) carry the FR6/NFR-P1 headers and `WARMUP_ITERATIONS = 5`, `SAMPLE_ITERATIONS = 20`. `package.json` has `"bench": "vitest bench --run --mode test --outputJson reports/bench/bench.json"`. `reports/bench/bench.json` holds 8 benchmarks with medians.
- ✅ 6.2 — `src/test/benchmarks/benchBudgets.test.ts` covers under budget, exactly 50, 80, the `it.each` no-report cases, and CLI runs through `execFileSync` with a temporary `GITHUB_STEP_SUMMARY`. The fixtures `underBudget.json` and `overBudget.json` exist.
- ✅ 6.3 — `scripts/benchBudgets.ts` (`ROW_BUDGET_MS = 50`, `evaluateBenchBudgets`) and `scripts/check-bench-budgets.mjs` (default path, summary file or stdout, warning lines, no non-zero exit). Both carry FR6 headers.
- ✅ 6.4 — I measured 98.15% on `scripts/benchBudgets.ts` (see Mutation).
- ✅ 8.1 — The traceability loop from tasks.md over `src scripts` prints nothing (run by me).
- ✅ 8.2 — `pnpm run build` succeeds (run by me), and the affected suites pass (972 tests). I did not re-run the full `pnpm test` or `test:bdd`. This stage starts from a green CI run of the implement stage, which includes both. No screenshot baseline is touched in the diff.

## Requirements

- ✅ FR1 — `src/presenter/dateTimeFormatters.ts:33-47` (JSDoc FR1). The warm scenarios in `locations_local_time_unit`, `locations_utc_offset_unit`, `locations_reorder_unit` and `time_selection_moment` assert 0 formatters, display names and lookups. A probe with the cache hit bypassed (`if (false)`, then restored) fails the local-time FR1 Then with `expected 100 to be +0`.
- ✅ FR2 — `locations_device_time_zone_unit.steps.tsx:169-200`: cold module graph, at most 3 formatters per zone, at most 1 `DisplayNames`. Traced by the `@replace-wall-clock-row-budgets-with-deterministic-checks @FR2` tag at `locations_device_time_zone_unit.feature:89`, by `dateTimeFormatters.ts:31` and by `rowBudgetWorld.ts:1`. The steps file lacks the matching `// @replace-wall-clock-row-budgets-with-deterministic-checks @FR2` comment at :155, where only `// @mark-device-time-zone-in-location-list @NFR-P1` stands (R3).
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
- ⚠️ M3 — The substance holds, but the measurement M3 names fails. The "one Stryker run" over the 3 files with bail disabled crashes in its dry run. I ran each file separately with `--disableBail`. All 8 mutants on the 3 cache-hit lines (`dateTimeFormatters.ts:40`, `dayPeriodStops.ts:70`, `countryName.ts:8`) are Killed, each by 6–56 tests under `src/test/features/`. They include work-bound steps such as "50 rows within the budget When their rows are presented" (device time zone) and "The new day's tracks are computed once Given …". tasks.md 5.3 neither records nor uses this form (R2).
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

  The survivor is the `ArrayDeclaration` `["Stryker was here"]` at `scripts/benchBudgets.ts:24`. It is equivalent because `filter(isRecord)` drops a string, which is what the comment at :22 says. That comment is a `disable next-line` on :23, so it does not reach :24. Low stakes, so not a finding.
- M3 run as specified in tasks.md 5.3 and design D7 (`--mutate 'src/presenter/dateTimeFormatters.ts,src/model/dayPeriodStops.ts,src/presenter/countryName.ts' --disableBail`): the dry run fails with `Test runner crashed. Tried twice to restart it without any luck. … TypeError: Cannot convert object to primitive value at errorToString (@stryker-mutator/util/dist/src/errors.js:22:12)`. There is no report and no score.
- M3 per file, each with `--disableBail`. All three complete:
  - `src/presenter/dateTimeFormatters.ts`: 100% (7 killed, 1 min 16 s). The 3 mutants on the cache-hit line :40 are Killed by 6, 51 and 51 tests under `src/test/features/`. The 5.3 jq filter, with `>= 3` changed to `>= 1` because the report holds one file, prints `true` and exits 0.
  - `src/model/dayPeriodStops.ts`: 100% (31 killed, 2 min 52 s). The 3 mutants on :70 are Killed by 12, 12 and 6 feature tests, among them "The new day's tracks are computed once Given …" and the device time zone "50 rows within the budget When their rows are presented".
  - `src/presenter/countryName.ts`: 100% (12 killed, 1 min 27 s). The 2 mutants on :8 are Killed by 11 and 56 feature tests, among them the warm Given/When steps of every "50 rows/locations/tracks within the budget" scenario.

  So M3's criterion ("each one is killed by at least one test under `src/test/features/`") is met when the run is split per file. The one-run form that M3, D7 and 5.3 name is not.

## Findings

### R1 — CRITICAL — Tasks 3.1, 3.3 and 4.3 are ticked although their file-size check fails
- Location: `packages/client/src/test/features/locations/steps/locations_local_time_unit.steps.tsx:210`
- Rule: `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity") and the group-3 routine of `tasks.md`, which group 4 reuses ("Then check with `wc -l` that every touched steps or world file stays at most 300 lines and, where it already was, at most 200").
- Problem: Three step files were at or under 200 lines before this branch and are now over it, yet the tasks that require the size check are ticked `[x]`:
  - Task 3.1, `locations/steps/locations_local_time_unit.steps.tsx`: 198 → 255. The new label scenario at :210-254 holds the whole platform-label comparison inline.
  - Task 4.3, `time_selection/steps/time_selection_day_track.steps.tsx`: 167 → 225. The per-zone lookup assertion is at :165-182, and the "computed once" setup with `previousMoment` is at :186-209.
  - Task 3.3, `locations/steps/locations_device_time_zone_unit.steps.tsx`: 183 → 204. The cold re-import and the per-zone assertions are at :169-200.
- Impact: Three tasks are ticked but not done, which hides an open item from the archive step. The files also break a project invariant that CLAUDE.md repeats ("Files must stay under 200 lines for AI context quality"). This change already has helper files for this logic (`rowBudgetWorld.ts` at 52 lines, `trackBudgetWorld.ts` at 107, `trackLabelsCheck.ts` at 79), but the logic stayed inline.
- Fix: Move the new scenario logic out of the step files into helpers next to them, in the same way `trackLabelsCheck.ts` already does for hour labels:
  1. Move the local-time label comparison (the en/ru presenting and the `toLocaleString` comparison) into a new `locations/steps/localTimeLabelsCheck.ts` shaped like `trackLabelsCheck.ts`.
  2. Move the per-zone lookup assertion and the "previous day, then date change" setup of the day-track scenarios into `trackBudgetWorld.ts` or a new `time_selection/steps/trackLookupsCheck.ts`.
  3. Move the per-zone formatter assertion of the device time zone scenario into `rowBudgetWorld.ts`.

  Re-run each of the three steps files alone, then `wc -l` them: each must print at most 200. Then the ticks hold.
- Fix risk: The move is test-only and changes no behaviour or step text. Three things to watch:
  - `vi.resetModules()` and the dynamic `import("@/presenter")` must stay in the Given step, so the cold module graph of D3 is kept.
  - `rowBudgetWorld.ts` and `trackBudgetWorld.ts` are imported by `src/test/benchmarks/rowPresenting.bench.ts` and `timeSelection.bench.ts`. New helpers that call `expect` should go into separate check files (as `trackLabelsCheck.ts` does), not into the worlds the benchmarks import. Otherwise the bench files pull in assertion code they never run.
  - R3 adds one line to `locations_device_time_zone_unit.steps.tsx`, so the move must leave room for it.
- Status: open

### R2 — CRITICAL — Task 5.3 is ticked but its specified Stryker run crashes and no result is recorded
- Location: `openspec/changes/replace-wall-clock-row-budgets-with-deterministic-checks/tasks.md:39`
- Rule: proposal M3 ("One Stryker run is scoped to the 3 cache files … with bail disabled. In it, 100% of the mutants on the 3 cache-hit lines … are Killed, and each one is killed by at least one test under `src/test/features/`") and design D7 (the same command, plus a filter that "fails … if a mutant's `killedBy` names no test from a file under `src/test/features/`").
- Problem: Task 5.3 is ticked `[x]`. Its command `npx stryker run --mutate 'src/presenter/dateTimeFormatters.ts,src/model/dayPeriodStops.ts,src/presenter/countryName.ts' --disableBail` fails in the dry run: `Test runner crashed … TypeError: Cannot convert object to primitive value`. So it writes no report for the jq filter to read. tasks.md records no measured result. The check the task describes cannot have printed `true`.

  Per-file runs with `--disableBail` do complete, and they meet the D7/M3 criterion. All 8 cache-hit mutants are Killed. Each is killed by at least one test under `src/test/features/` (6–56 per mutant), and the filter prints `true` per report (see Mutation). The code meets M3, but the task and its evidence do not.
- Impact: A ticked task whose command cannot run cannot be repeated. That defeats D7's point ("A hand-made … check cannot be repeated. Instead, one Stryker run …"). Anyone re-running 5.3 before archiving, or after a cache change, hits the crash and gets no proof that the cache guards still hold.
- Fix: Keep the D7/M3 filter as written: any test under `src/test/features/`. Do not narrow it. Then:
  1. In `tasks.md` 5.3, replace the three-file command with three runs, one per file, each `npx stryker run --mutate '<file>' --disableBail`, run one at a time.
  2. After each run, apply the existing jq filter to `reports/mutation/mutation-report.json`, with `>= 3` changed to `>= 1`, since each report holds one file.
  3. Note the dry-run crash of the combined run as the reason for the split.
  4. Record the measured result under 5.3: per file, the score, the cache-hit line, and that the filter printed `true`.
  5. Make the same one-line command change in design D7.
  6. Keep 5.3 ticked only once the three filters print `true`. They did in this review.
- Fix risk: No production or test code changes. The split changes M3's "one Stryker run" wording into three runs. The proven property is the same, because `killedBy` is per mutant and each mutant lives in one file. The fix-code stage must therefore reword M3 in `proposal.md` to "one run per cache file". Otherwise M3 still names a crashing command. The three runs take about 6 minutes in total, against about 1.5 for the intended single run. CLAUDE.md's limit of at most 5 files per Stryker run still holds.
- Status: open

### R3 — SUGGESTION — FR2 budget scenario steps lack this change's tag comment
- Location: `packages/client/src/test/features/locations/steps/locations_device_time_zone_unit.steps.tsx:155`
- Rule: `.claude/rules/bdd-unit.md` Key Rule 5 ("**Tag comment** — before `f.Scenario` add comment `// @<change-name> @FR-X`").
- Problem: The rewritten "50 rows within the budget" scenario carries only `// @mark-device-time-zone-in-location-list @NFR-P1`. Its feature tag line (`locations_device_time_zone_unit.feature:89`) adds `@replace-wall-clock-row-budgets-with-deterministic-checks @FR2`. Every other steps file this change touched carries the matching comment, for example `locations_local_time_unit.steps.tsx:190` and `locations_utc_offset_unit.steps.tsx:252`.
- Impact: A `grep` for this change's FR2 in step files finds no scenario, only the helpers. Someone tracing FR2 to its executable check must go through the feature file. FR2 itself stays traced (`rowBudgetWorld.ts:1`, `dateTimeFormatters.ts:31`), so the cost is low.
- Fix: Add `// @replace-wall-clock-row-budgets-with-deterministic-checks @FR2` on the line after :155, as `locations_local_time_unit.steps.tsx:189-190` does.
- Fix risk: It adds one line to a file already over 200 lines (R1). Apply it together with the R1 move.
- Status: open

## Verdict

Not ready. Blocking: R1 and R2, both CRITICAL ticked-but-undone tasks (3.1, 3.3, 4.3 and 5.3). Neither needs a production code change: R1 is a test-helper move, and R2 is a tasks.md, design.md and proposal.md rewording backed by the per-file runs measured here. R3 is a one-line SUGGESTION. FR7, the rule and ADR part of FR8, M1, M4 and M5 are open by the operator's decision (Human follow-up H1–H3), not by defects in this branch.
