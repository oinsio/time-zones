# Review: replace-wall-clock-row-budgets-with-deterministic-checks

## Summary

| Item | Value |
|---|---|
| Tasks verified | 20/23 |
| Requirements traced | 41/48 |
| CRITICAL | 1 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Tasks

Paths are relative to `packages/client/` unless stated otherwise. The diff base is the task's base commit `b7fac30` on `main`, which added the change's specs. No `origin/main` exists in the sandbox. I ran these commands one at a time:
- the M3 and M6 Stryker runs (see Mutation)
- `pnpm bench`
- `pnpm run build`, which succeeds
- one throw-away probe test of the date-change worlds, deleted afterwards (see R2)

- ✅ 1.1 — `src/presenter/localDateTime.test.ts:41-43` "local labels (characterization)" and `src/presenter/dayTrack.test.ts:92-94` "formatHourLabel (characterization)": `it.each` with literal `en`/`ru` labels for `Asia/Kolkata`, `Asia/Kathmandu` and `America/New_York`, at `2026-07-15T12:00:00Z` and the DST start (`2026-03-08T06:59:00Z`, `07:00:00Z`). Both carry the tag `// FR5, UX1 of replace-wall-clock-row-budgets-with-deterministic-checks`.
- ✅ 1.2 — `src/presenter/dateTimeFormatters.test.ts:18-44` tests the same instance for the same key, distinct instances per kind, zone and language, and an `it.each` that each kind formats like its options constant.
- ✅ 1.3 — `src/presenter/dateTimeFormatters.ts:8-12` adds the `DateTimeLabelKind` enum. `:33-47` adds `getDateTimeFormatter` with the `language|timeZoneId|kind` key and the one-line cache hit at `:40`. The JSDoc at `:31` names FR1, FR2 and FR5.
- ✅ 1.4 — `src/presenter/localDateTime.ts:13-17,28-32` and `formatHourLabel` in `src/presenter/dayTrack.ts` format `epochMilliseconds` with `getDateTimeFormatter`. The old `formatters` map and `getFormatter` are removed from `dayTrack.ts`.
- ✅ 1.5 — I measured 100% on `dateTimeFormatters.ts`, `localDateTime.ts` and `dayTrack.ts` (see Mutation).
- ✅ 2.1 — `src/test/workCounters.test.ts` (122 lines) covers:
  - counts of constructors, `toLocaleString` on all five Temporal classes (`it.each` at `:48`), `getTimeZoneTransition` and `normalize`, all through `Temporal` from `@/lib/temporal`
  - restore on `stop` (`:94`)
  - `instanceof` (`:103`)
- ✅ 2.2 — `src/test/workCounters.ts` (133 lines): a `Proxy` construct trap (`:43-69`), Temporal prototype spies (`:79-108`), a `normalize` spy (`:109-118`), and the D4 constants at `:7-10`.
- ❌ 3.1 — The behaviour exists. `locations_local_time_unit.feature:58,64` has the FR1 scenario and "Labels are unchanged by formatter reuse". The steps at `steps/locations_local_time_unit.steps.tsx:189-254` take the expected labels from `ZonedDateTime#toLocaleString` outside the counted block. But the group-3 routine requires a `wc -l` check: "at most 200 where it already was". The file had 198 lines at `b7fac30` and has 255 now, so the ticked task's check fails (R1).
- ✅ 3.2 — `locations_utc_offset_unit.steps.tsx:251-277` has a warm Given and a counted When at `BUDGET_SECOND_MOMENT`. It asserts 0 formatters, 0 display names and 0 lookups. The file has 278 lines (it had 270, under the 300 cap).
- ❌ 3.3 — The behaviour exists. `locations_device_time_zone_unit.steps.tsx:169-200` calls `vi.resetModules()` and imports `@/presenter` dynamically. It asserts at most `MAX_FORMATTERS_PER_ZONE` per zone over more than one zone, and at most 1 `DisplayNames`. But the file went from 183 to 204 lines, so the group-3 `wc -l` check fails (R1).
- ✅ 3.4 — `locations_reorder_unit.steps.ts:242-281` has a warm Given and a counted move plus present. It asserts 0 formatters, display names and lookups, and that `presentedRows[0].cityLabel` is the last location's label. The file has 282 lines (it had 283).
- ✅ 4.1 — `date_selection/steps/referenceMomentRowsWorld.ts:95-111` counts the reduce and present with `startWorkCount()` instead of `performance.now()`. `date_selection_reference_moment_rows.steps.tsx:27` stops it in `f.AfterEachScenario`, and `:55` asserts 0 formatters.
- ✅ 4.2 — `time_selection/steps/trackBudgetWorld.ts:44-51` counts the presenting. `time_selection_moment.steps.tsx:107-132` asserts 0 formatters, display names and lookups.
- ❌ 4.3 — The behaviour exists in `time_selection_day_track.steps.tsx:150-224`:
  - the date change with at most `MAX_TRANSITION_LOOKUPS_PER_ZONE` per zone
  - "The new day's tracks are computed once", through `presentAgain` with 0 lookups
  - the hour-label check through `steps/trackLabelsCheck.ts`

  But group 4 uses the "same RED → GREEN routine as group 3", including the `wc -l` check. The file went from 167 to 225 lines (R1).
- ✅ 5.1 — `location_search/steps/searchWorld.ts:45-53` `countSearchWork`. `location_search_performance.steps.ts:29-38` asserts exactly `NORMALIZATIONS_PER_QUERY` and at most `MAX_COLLATORS_PER_QUERY` for each of the 10 queries. `measureSearchMilliseconds` is gone, and both files are under 200 lines (59 and 40).
- ✅ 5.2 — `grep -rlE "performance\.now\(\)" src --exclude-dir=benchmarks` prints nothing.
- ✅ 5.3 — The run in this task (three files, `--disableBail`) completes here: 50 mutants, 100%, 4 min 17 s. The task's `jq` filter prints `true` with exit code 0. All 8 cache-hit mutants (`dateTimeFormatters.ts:40`, `dayPeriodStops.ts:70`, `countryName.ts:8`) are Killed. Each one's `killedBy` includes a work-bound feature step, for example the FR2 "50 rows within the budget When their rows are presented". An earlier review round reported a dry-run crash of this command. It does not reproduce, so that crash came from the environment.
- ✅ 6.1 — The three `src/test/benchmarks/*.bench.ts` files carry the FR6/NFR-P1 header and `WARMUP_ITERATIONS = 5`, `SAMPLE_ITERATIONS = 20`. `package.json:14` has the `bench` script. `pnpm bench` prints 8 results and writes `reports/bench/bench.json` with 8 medians. The verification the task names holds. What two of the date-change benchmarks actually time is a separate defect (R2).
- ✅ 6.2 — `src/test/benchmarks/benchBudgets.test.ts` covers:
  - under budget (`:40`), exactly 50 (`:51`) and 80 (`:55`)
  - the `it.each` no-report and malformed cases (`:69`, `:86`)
  - CLI runs with a temporary `GITHUB_STEP_SUMMARY` (`:140-190`)

  `fixtures/underBudget.json` and `fixtures/overBudget.json` exist.
- ✅ 6.3 — `scripts/benchBudgets.ts` has `ROW_BUDGET_MS = 50` and `evaluateBenchBudgets`. `scripts/check-bench-budgets.mjs` reads the default path, writes to the summary file or stdout, prints the warning lines and never exits non-zero. Both carry the FR6 header.
- ✅ 6.4 — I measured 98.15% on `scripts/benchBudgets.ts` (see Mutation).
- ✅ 8.1 — The traceability loop from tasks.md over `src scripts` prints nothing.
- ✅ 8.2 — `pnpm run build` succeeds. The Stryker initial test runs pass the whole vitest suite. I did not run `test:bdd` (Playwright). The diff touches no screenshot baseline and no view file.

## Requirements

- ✅ FR1 — `src/presenter/dateTimeFormatters.ts:33-47` (JSDoc FR1). Warm scenarios assert 0 formatters, display names and lookups: `locations_local_time_unit`, `locations_utc_offset_unit`, `locations_reorder_unit` and `time_selection_moment`.
- ✅ FR2 — `locations_device_time_zone_unit.steps.tsx:169-200`: a cold module graph, at most 3 formatters per zone over more than one zone, and at most 1 `DisplayNames`. It is traced by the feature tag at `locations_device_time_zone_unit.feature:89`, by `dateTimeFormatters.ts:31` and by `rowBudgetWorld.ts:1`. The steps file lacks the tag comment (R3).
- ✅ FR3 — `date_selection_reference_moment_rows` asserts 0 formatters on the date change. `time_selection_day_track.steps.tsx:150-209` asserts at most 2 lookups per zone, then 0 on the second presenting of the new day.
- ✅ FR4 — `location_search_performance.steps.ts:29-38` asserts exactly 1 normalization and at most 1 collator for each of 10 queries.
- ✅ FR5 — Characterization in `localDateTime.test.ts:41` and `dayTrack.test.ts:92` (en/ru, +5:30, +5:45, New York DST). The two label scenarios compare against the platform's `toLocaleString`.
- ⚠️ FR6 — `pnpm bench` writes 8 medians, and the budget check warns above 50 and always exits 0 (`benchBudgets.test.ts`). But both date-change benchmarks time the re-presenting of an already cached day, not a date change (R2).
- ⚠️ FR7 — Not in this change. `.github/workflows/ci.yml` has no `benchmark` job. The operator deferred this to tasks.md "Human follow-up" H1, because `.github/` is outside the implement stage. Not a finding.
- ⚠️ FR8 — The `src/` part holds: no `performance.now()` outside `src/test/benchmarks/`, traced in the `workCounters.ts:1` header. The `.claude/rules` edits and ADR 0008 are deferred to H2, and `docs/adr/` still ends at 0007. Not a finding.
- ✅ NFR-P1 — Every budget scenario has `@NFR-P1` on the same tag line as this change's tag. The 50 ms budget lives in `ROW_BUDGET_MS` of the benchmark check.
- ✅ UX1 — The characterization literals are unchanged and pass against the new code. The diff changes no screenshot baseline and no view file.
- ⚠️ M1 — This needs the PR's CI run, which is deferred to H3 because the sandbox has no GitHub access. Not a finding.
- ✅ M2 — `grep -rlE "performance\.now\(\)" packages/client/src --exclude-dir=benchmarks` prints nothing.
- ✅ M3 — The one scoped run with `--disableBail` gives 100%. The task 5.3 filter prints `true` (see Mutation).
- ⚠️ M4 — Every id except FR7 is traced under `src`/`scripts`. FR7 and the `.claude/rules`/`docs/adr` lines arrive with H1 and H2. Not a finding.
- ⚠️ M5 — This needs the PR's benchmark job (H3). Locally, `reports/bench/bench.json` has 8 medians.
- ✅ M6 — Measured: `dateTimeFormatters.ts` 100%, `localDateTime.ts` 100%, `dayTrack.ts` 100%, `scripts/benchBudgets.ts` 98.15%.
- ✅ Scenario: A check fails (app-delivery) — Unchanged. The `ci.yml` job runs `pnpm lint`, `pnpm test`, the bundle check and `test:bdd` (`ci.yml:39-57`).
- ✅ Scenario: Bundle exceeds the budget (app-delivery) — Unchanged. `ci.yml:48` runs `check:bundle-size`.
- ⚠️ Scenario: A timing budget is missed (app-delivery) — The warning and exit code 0 are tested in `benchBudgets.test.ts:170`. The non-blocking CI job is deferred to H1.
- ✅ Scenario: Unit tests ignore runner speed (app-delivery) — The M2 grep prints nothing.
- ✅ Scenario: 50 rows within the budget (date-selection) — `date_selection_reference_moment_rows.feature:7` (`@FR3`). It asserts 0 formatters and display names, and the row dates of the next day.
- ✅ Scenario: The new date shows in the same render (date-selection) — Unchanged, `date_selection_reference_moment_rows.feature:14`.
- ✅ Scenario: Query timing (location-search) — `location_search_performance.feature` (`@FR4`). It asserts 1 normalization and at most 1 collator per query.
- ✅ Scenario: Data loads only when the search opens (location-search) — Unchanged, `locations/locations_ui_e2e.feature:33`.
- ✅ Scenario: Bundle budget (location-search) — Unchanged. `ci.yml:48` runs the bundle check, and no production dependency is added.
- ✅ Scenario: 50 rows within the budget (locations, offsets) — `locations_utc_offset_unit.steps.tsx:251-277`. It asserts 0 formatters, display names and lookups at another minute.
- ✅ Scenario: No accessibility violations with offsets (locations) — Unchanged, `locations_utc_offset_e2e.feature:7`.
- ✅ Scenario: Offsets fit narrow and wide screens (locations) — Unchanged, `locations_utc_offset_e2e.feature:21`.
- ✅ Scenario: List screenshots show the offsets (locations) — Unchanged, `locations_utc_offset_e2e.feature:34`. No baseline is touched.
- ✅ Scenario: No accessibility violations (locations, reorder) — Unchanged, `locations_reorder_e2e.feature:185,197`.
- ✅ Scenario: Handle target size (locations, reorder) — Unchanged, `locations_reorder_e2e.feature:60`.
- ✅ Scenario: Narrow and wide screens (locations, reorder) — Unchanged, `locations_reorder_e2e.feature:210`.
- ✅ Scenario: 50 locations within the budget (locations, reorder) — `locations_reorder_unit.steps.ts:242-281`. It asserts 0 formatters, display names and lookups, and that the first row is the last location.
- ✅ Scenario: Reorder stays out of the initial bundle (locations, reorder) — Unchanged. The bundle check runs, and no view or import changes.
- ✅ Scenario: List screenshots show the handles (locations, reorder) — Unchanged, `locations_reorder_e2e.feature:224`.
- ✅ Scenario: Row name includes the badge (locations, badge) — Unchanged, `locations_device_time_zone_e2e.feature:7`.
- ✅ Scenario: 50 rows within the budget (locations, badge) — `locations_device_time_zone_unit.steps.tsx:155-200`. A cold import, at most 3 per zone, at most 1 `DisplayNames`.
- ✅ Scenario: No accessibility violations with the badge (locations) — Unchanged, `locations_device_time_zone_e2e.feature:14`.
- ✅ Scenario: Badge fits narrow and wide screens (locations) — Unchanged, `locations_device_time_zone_e2e.feature:27`.
- ✅ Scenario: List screenshots show the badge (locations) — Unchanged, `locations_device_time_zone_e2e.feature:40`.
- ✅ Scenario: 50 rows within the budget (locations, local time) — `locations_local_time_unit.steps.tsx:189-207`. A warm Given and a counted When, checked by `expectNoWarmWork`.
- ✅ Scenario: Labels are unchanged by formatter reuse (locations) — `locations_local_time_unit.steps.tsx:210-254`. It compares en and ru with `ZonedDateTime#toLocaleString` from `@/lib/temporal`, outside any count.
- ✅ Scenario: No accessibility violations with times (locations) — Unchanged, `locations_local_time_e2e.feature:39`.
- ✅ Scenario: Time does not change the row name and is not announced (locations) — Unchanged, `locations_local_time_e2e.feature:51`.
- ✅ Scenario: 50 rows within the time-selection budget (time-selection) — `time_selection_moment.steps.tsx:107-132`. It asserts 0 formatters, display names and lookups, and the handles at 0.75.
- ✅ Scenario: 50 tracks within the date-change budget (time-selection) — `time_selection_day_track.steps.tsx:150-185`. It asserts 0 formatters, at most 2 lookups per zone over more than 0 zones, and the tracks of the new day.
- ✅ Scenario: The new day's tracks are computed once (time-selection) — `time_selection_day_track.steps.tsx:187-209`, through `presentAgain` with 0 lookups.
- ✅ Scenario: Hour labels are unchanged by formatter reuse (time-selection) — `steps/trackLabelsCheck.ts:38-77` compares every hour label in en and ru with `toLocaleString`, using the hour or local-time options.

## Mutation

All runs were from `packages/client/`, one at a time, never in the background.

- **M6 run** (`--mutate 'src/presenter/dateTimeFormatters.ts,src/presenter/localDateTime.ts,src/presenter/dayTrack.ts,scripts/benchBudgets.ts'`):
  - `dateTimeFormatters.ts`: 100% (7 killed)
  - `localDateTime.ts`: 100% (2 killed)
  - `dayTrack.ts`: 100% (24 killed)
  - `scripts/benchBudgets.ts`: 98.15% (53 killed, 1 survived)

  The survivor is the `ArrayDeclaration` on `scripts/benchBudgets.ts:24`, the body of `recordsOf`. It is equivalent: `filter(isRecord)` drops the placeholder string, as the `Stryker disable` comment at `:22` says. That comment disables only line `:23`, so the mutant is still reported. All files are above 95%, so this is not a finding.
- **M3 run** (`--mutate 'src/presenter/dateTimeFormatters.ts,src/model/dayPeriodStops.ts,src/presenter/countryName.ts' --disableBail`, exactly as in tasks.md 5.3):
  - `dayPeriodStops.ts`: 100% (31 killed)
  - `countryName.ts`: 100% (12 killed)
  - `dateTimeFormatters.ts`: 100% (7 killed)

  The run completed in 4 min 17 s, and the task 5.3 `jq` filter prints `true`. Each of the 8 cache-hit mutants is killed by 8 to 164 tests, among them feature steps of the budget scenarios.

## Findings

### R1 — CRITICAL — Tasks 3.1, 3.3 and 4.3 are ticked although their file-size check fails
- Location: `packages/client/src/test/features/locations/steps/locations_local_time_unit.steps.tsx:210`
- Rule: `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity"). Also the group-3 routine in `tasks.md`, which group 4 reuses: "Then check with `wc -l` that every touched steps or world file stays at most 300 lines and, where it already was, at most 200".
- Problem: Three step files had at most 200 lines at the base commit and have more now, yet the tasks that require the size check are ticked `[x]`:
  - Task 3.1, `locations/steps/locations_local_time_unit.steps.tsx`: 198 → 255. The new label scenario at `:210-254` holds the whole platform-label comparison inline.
  - Task 4.3, `time_selection/steps/time_selection_day_track.steps.tsx`: 167 → 225. The per-zone lookup assertion is inline at `:167-177`, and so is the "previous day, then date change" setup at `:192-200`.
  - Task 3.3, `locations/steps/locations_device_time_zone_unit.steps.tsx`: 183 → 204. The per-zone formatter assertion is inline at `:187-194`.
- Impact: Three tasks are ticked but not done, which hides an open item from the archive step. The files also break the invariant that CLAUDE.md repeats: "Files must stay under 200 lines for AI context quality". The change already has helper files next to these steps: `rowBudgetWorld.ts` (52 lines), `trackBudgetWorld.ts` (107) and `trackLabelsCheck.ts` (79). The new logic stayed inline anyway.
- Fix: Move the new scenario logic into helpers next to the step files, the way `trackLabelsCheck.ts` already does for hour labels:
  1. Move the local-time label presenting and the `toLocaleString` comparison into a new `locations/steps/localTimeLabelsCheck.ts`, shaped like `time_selection/steps/trackLabelsCheck.ts`.
  2. Move the per-zone lookup assertion and the previous-day setup of the day-track scenarios into `trackBudgetWorld.ts`, for example as `expectLookupsPerZoneAtMost(max)` and `prepareDayStarting(dayStart, deviceTimeZoneId)`.
  3. Move the per-zone formatter assertion of the device time zone scenario into `rowBudgetWorld.ts`, next to `expectNoWarmWork`.

  Then run each of the three steps files alone and `wc -l` it. Each must be at most 200 lines.
- Fix risk: The move only touches tests and changes no step text or behaviour. Two things to watch:
  - `vi.resetModules()` and the dynamic `import("@/presenter")` must stay in the Given step of the device scenario, so the cold module graph of D3 is kept.
  - `rowBudgetWorld.ts` and `trackBudgetWorld.ts` are also imported by `rowPresenting.bench.ts` and `timeSelection.bench.ts`. Both worlds already import `expect` (`expectNoWarmWork`, `expectEveryHandleAt`), so new assertion helpers add no new kind of dependency to the benchmarks.

  R3 adds one line to the device steps file, so the move must leave room for it.
- Status: open

### R2 — WARNING — Date-change benchmarks time a cached day, not a date change
- Location: `packages/client/src/test/benchmarks/timeSelection.bench.ts:29`
- Rule: proposal FR6 ("times each of the eight operations from the 'Why' table"). The time-selection spec delta: "A date change SHALL re-present 50 rows, including the new colour stops … Both budgets MUST be checked by the timing benchmark". Design D5 lists "date change" and "track date change" as benchmarked operations.
- Problem: The benchmarks "date change on 50 tracks" (`timeSelection.bench.ts:27-31`) and "date change on 50 rows" (`rowPresenting.bench.ts:86-90`) call `measureDateChange()` on a world prepared once. Neither world stores the shifted state:
  - `trackBudgetWorld.ts:44-50` keeps `state`.
  - `referenceMomentRowsWorld.ts:95-111` keeps `state` and `startInstant`.

  So every iteration moves from the same day to the same next day. `getDayPeriodStops` (`src/model/dayPeriodStops.ts:62-70`) caches the stops of one day. From the second warm-up iteration on, every sample hits that cache, and no colour stop or transition lookup is computed. Both world methods also wrap each sample in `startWorkCount()`. That installs 3 `Proxy`s and 7 `vi.spyOn`s per sample and records every spied call, so the time includes the test counters.

  I measured this with a probe test, deleted afterwards. The first `measureDateChange()` of `createRowBudgetWorld` makes 50 transition lookups in 20.8 ms. The next ones make 0 lookups in 3.7 and 3.0 ms. In `pnpm bench`, both date-change medians (2.43 and 2.40 ms) equal the plain re-presenting medians (2.20–2.52 ms).
- Impact: The date change is the operation whose wall-clock budget failed CI (114 and 118 ms in the proposal's "Why"), and its cost is the new day's colour stops. Suppose a change makes the stop computation 10× slower: say a transition lookup per hour, or a slower `findOffsetTransitions`. Both date-change medians stay around 2.4 ms. No `::warning` is ever shown, so FR6's benchmark does not check the date-change budget the spec says it checks.
- Fix: Make every date-change sample present a day that is not cached, without the counters:
  1. In `trackBudgetWorld.ts` and `referenceMomentRowsWorld.ts`, extract the reduce-and-present of a date shift into an uncounted function, e.g. `presentDateShift(days)`, built from the prepared state.
  2. Keep `measureDateChange()` as `startWorkCount()` around `presentDateShift(ONE_DAY)`, so the BDD scenarios do not change.
  3. In the two date-change benches, call `presentDateShift` with `days` alternating between `ONE_DAY` and `-ONE_DAY` on each iteration. Each sample then presents a day other than the cached one and computes its stops, without the counters.
  4. Optionally, add an uncounted selection function in the same way for "time selection on 50 rows", so that median also excludes the counter overhead.
- Fix risk: Only tests and benchmarks change. The BDD scenarios keep calling `measureDateChange()` with the same counted work. Both worlds stay under 200 lines (107 and 120 now). `SHIFT_DATE` with negative days is the "previous day" command `reduceReferenceMoment` already supports. The date-change medians will rise to the real cost, about 20 ms locally per the probe. On a slow CI runner they may cross 50 ms and print a non-blocking warning, which is the signal FR6 asks for. Some samples may differ slightly because the days around `2026-03-08` include a DST day.
- Status: open

### R3 — SUGGESTION — FR2 budget scenario steps lack this change's tag comment
- Location: `packages/client/src/test/features/locations/steps/locations_device_time_zone_unit.steps.tsx:155`
- Rule: `.claude/rules/bdd-unit.md` Key Rule 5 ("**Tag comment** — before `f.Scenario` add comment `// @<change-name> @FR-X`").
- Problem: The rewritten "50 rows within the budget" scenario has only `// @mark-device-time-zone-in-location-list @NFR-P1`. Its feature tag line (`locations_device_time_zone_unit.feature:89`) adds `@replace-wall-clock-row-budgets-with-deterministic-checks @FR2`. The other steps files this change touched have the matching comment, e.g. `locations_local_time_unit.steps.tsx:190` and `locations_utc_offset_unit.steps.tsx:252`.
- Impact: A `grep` for this change's FR2 across step files finds no scenario, only the helpers. FR2 itself is still traced (`rowBudgetWorld.ts:1`, `dateTimeFormatters.ts:31`), so the cost is low.
- Fix: Add `// @replace-wall-clock-row-budgets-with-deterministic-checks @FR2` on the line after `:155`, as `locations_local_time_unit.steps.tsx:189-190` does.
- Fix risk: It adds one line to a file already over 200 lines. Apply it together with the R1 move.
- Status: open

## Verdict

Not ready. R1 (CRITICAL) blocks: tasks 3.1, 3.3 and 4.3 are ticked although their file-size check fails. R2 (WARNING) should be fixed before archiving, so that the date-change benchmarks time a date change. R3 is a one-line SUGGESTION. None of the three needs a production code change.

FR7, the rule and ADR part of FR8, M1, M4 and M5 are open by the operator's decision (Human follow-up H1–H3), not because of defects in this branch.
