# Review: show-clock-change-note-on-location-cards

## Summary

| Item | Value |
|---|---|
| Tasks verified | 22/22 |
| Requirements traced | 42/43 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 0 |

## Tasks

All paths below are under `packages/client/src/` unless they start with `docs/`.

- ✅ 1.1 — `docs/glossary/time.md` has **Clock change** (RU, Code, Never). `docs/glossary/date-selection.md` has **Clock change window**, **Clock change note** and **Row note**, and `getRowNote` is added to **Wall-time hint** and **Wall-clock note**. `docs/architecture/views.md` has the "Clock change note" row, and the "Wall-time hint" row says "hides the clock change note of its row". Every glossary file is under 200 lines (the largest, `time.md`, has 25).
- ✅ 2.1 — `model/dayTrack.test.ts:175-219` (`// Verifies FR1 …`) checks the Belgrade window `2026-10-24T22:00:00Z`…`2026-11-08T23:00:00Z` (lines 181-182, 201), the home location case and the pinned case.
- ✅ 2.2 — `CLOCK_CHANGE_WINDOW_DAYS = 7` is in `constants/timeSelection.ts:19` and exported from `constants/index.ts:72`. `ClockChangeWindow` and `clockChangeWindow` are in `model/dayTrack.ts:21-31`, computed at `model/dayTrack.ts:56-65`. The field is added to the literal in `test/features/time_selection/steps/time_selection_day_colours.steps.tsx`.
- ✅ 2.3 — `model/dayPeriodWindows.test.ts:127-185` covers margin 0, the span start being included, the span end being excluded, and the default margin. `model/clockChange.test.ts:27-196` covers the `it.each` cases (Belgrade, Lord Howe, Almaty, Tokyo, an unknown zone), memoization (lines 114-146, via `startWorkCount`) and `findNearestClockChange` (lines 148-196).
- ✅ 2.4 — `findOffsetTransitions(timeZoneId, span, marginHours)` is in `model/dayPeriodWindows.ts:44-65` (it starts 1 ns before the lower bound, and the upper bound is excluded). `model/clockChange.ts` has the enums, the type, `getClockChanges` (memoized, lines 77-95) and `findNearestClockChange`. `getDayPeriodStops` uses `getClockChangesAround` (`model/dayPeriodStops.ts:62-76, 97`). The new names are exported from `model/index.ts`.
- ✅ 2.5 — `model/rowNote.test.ts:29-75` has the hint-wins case, another row, a `DATE_BAR` note, no wall-clock note, a zone without a change, and an unknown zone.
- ✅ 2.6 — `model/rowNote.ts:41-66` has `getRowNote`, `RowNoteKind` and `RowNote`, exported from `model/index.ts`.
- ✅ 3.1 — `presenter/clockChangeNote.test.ts:40-138` has an `it.each` over the spec table, the 12-hour case (line 107) and the 30-minute and 90-minute amounts (line 118). `presenter/localDateTime.test.ts:106` covers `formatWallClockDate`, including the formatter-build count.
- ✅ 3.2 — `CLOCK_CHANGE_DATE_FORMAT_OPTIONS` is in `constants/localDateTime.ts:47-50`. `DateTimeLabelKind.DAY_AND_MONTH` is in `presenter/dateTimeFormatters.ts:14,27-30`. `formatWallClockDate` is in `presenter/localDateTime.ts:71-81`. The 7 keys are in `locales/en.json:35-41` and `locales/ru.json:35-41`. `presenter/clockChangeNote.ts:53-72` holds the presenter.
- ✅ 3.3 — `presenter/presentZoneMoment.wallTime.test.ts` (`// Verifies FR5, FR6 …`) covers a row note, the hint row, another row next to a hint, and the device time location. The home location case is in the unit BDD `locations_clock_change_note_placement.feature:14`, not in the `presentLocationRows.home.test.ts` the task names, but the behaviour is covered.
- ✅ 3.4 — `presenter/presentZoneMoment.ts:107-113` calls `getRowNote`, and lines 137-158 fill `wallTimeHint` / `clockChangeNote`. `grep -rn findRowNoteOf src` prints nothing.
- ✅ 4.1 — `views/shared/ClockChangeNote.test.tsx` checks the text, no `status` role, no `aria-live` and no `role`. The row checks are in `views/shared/LocationRow.clockChangeNote.test.tsx:13-41` (last element after the menu button, not in the accessible name, absent without a note), a new file rather than `LocationRow.test.tsx`.
- ✅ 4.2 — `views/shared/RowNoteBox.tsx` exists. `WallTimeHint.tsx` renders `<RowNoteBox role="status">`, `ClockChangeNote.tsx:13-15` renders it without a role, and the note is rendered at `views/shared/LocationRow.tsx:191-193`.
- ✅ 5.1 — The cities are in `test/factories/buildLocation.ts:32-35`. `locations_clock_change_note_unit.feature` and `locations_clock_change_note_placement.feature` hold every scenario of the three requirements, with tags. The window-bounds outline has the 17 October–November rows plus the March rows. Steps and world are in `steps/locations_clock_change_note_unit.steps.ts`, `…_placement.steps.ts`, `clockChangeNoteWorld.ts` and `clockChangeNoteHandlers.ts`. The unit steps file is 271 lines, see R1.
- ✅ 5.2 — `locations_clock_change_note_budget.feature:5-16` and `steps/locations_clock_change_note_budget.steps.ts:73` assert 0 `transitionLookups()`. Lines 105-115 assert per-zone lookups ≤ `MAX_TRANSITION_LOOKUPS_PER_ZONE`.
- ✅ 5.3 — `test/benchmarks/clockChangeNote.bench.ts:36-52` has the two benches (same day, date change).
- ✅ 6.1 — `locations_clock_change_note_e2e.feature:6,16,28,44` has the four scenarios. The steps are in `steps/locations_clock_change_note_e2e.steps.ts`: lines 57-64 check no live region and no status role, and lines 70-84 check the accessible name. The cities are in `steps/locationsE2eHelpers.ts`.
- ✅ 6.2 — The tag is at `locations_ui_e2e.feature:135` and `locations_12_hour_screenshots_e2e.feature:6`. 20 PNGs under `test/features/__screenshots__/` are re-approved.
- ✅ 6.3 — The stage brief says CI is green. The re-approved screenshots are the only expectation changes in the diff.
- ✅ 7.1 — My scoped Stryker runs score ≥95% on every file that finished (see Mutation). `dayPeriodWindows.ts` could not finish inside the 10-minute tool limit (70/86 tested, 0 survived).
- ✅ 7.2 — The stage brief says CI is green (typecheck, lint, tests, build, legacy scan). I did not re-run them.
- ✅ 7.3 — I ran the task's traceability loop from `packages/client/` and it prints nothing. The glossary grep over locales, presenter and model also prints nothing.

## Requirements

- ✅ FR1 — The window is `model/dayTrack.ts:56-65`, half-open `[start, end)` per D1, consumed at `model/clockChange.ts:66-69`. Tested by `model/dayTrack.test.ts:175-219` and the unit BDD "Window bounds" / "The window is counted in the reference zone" (`locations_clock_change_note_unit.feature:25,54`, `@FR1`). Live mode is covered by "A past change at the lower bound" (current instant, not pinned).
- ✅ FR2 — Date, time (the wall-clock time before the change), direction and amount are built at `model/clockChange.ts:41-62` and `presenter/clockChangeNote.ts:36-72`. Tested by `model/clockChange.test.ts:28-66` and `presenter/clockChangeNote.test.ts:41-138`.
- ✅ FR3 — The tense is set at `model/clockChange.ts:122-127` (`compare <= 0` → PAST) against the effective instant (`presentZoneMoment.ts:112`, `instant` from `getEffectiveInstant` in `controller/useLocations.ts:60`). Tested by `clockChange.test.ts:185` and the BDD "A change on the reference day" (`@FR3`).
- ✅ FR4 — The nearest change and the earlier one at a tie are picked at `model/clockChange.ts:101-121`. Tested by `clockChange.test.ts:158-183` and the BDD "Nearest of two changes" (`@FR4`).
- ✅ FR5 — Every row goes through `getRowNote` in `presentZoneMoment`. An unknown zone returns `[]` (`clockChange.ts:70-73`). Tested by `rowNote.test.ts:64-75` and `locations_clock_change_note_placement.feature:6,14,23` (`@FR5`).
- ✅ FR6 — The hint priority lives once, in `model/rowNote.ts:54-59`. `WallTimeHint` keeps `role="status"` (`views/shared/WallTimeHint.tsx`). Tested by `rowNote.test.ts:30` and the placement scenarios at lines 43, 52 and 61 (`@FR6`).
- ✅ FR7 — The note is derived per render from the reference day and settings, with no state or storage. Tested by "The note follows the date bar and the settings" (`locations_clock_change_note_placement.feature:31`, `@FR7`).
- ✅ FR8 — The 7 keys are in both `locales/en.json:35-41` and `locales/ru.json:35-41`, and the texts match the spec table. Tested by "Texts in both languages" (`@FR8`) and `presenter/clockChangeNote.test.ts:41`.
- ✅ NFR-P1 — The `getClockChanges` cache (`clockChange.ts:77-95`) is shared with `getDayPeriodStops` (`dayPeriodStops.ts:69`), and the date formatter is cached (`dateTimeFormatters.ts`). Tested by `locations_clock_change_note_budget.feature` (`@NFR-P1`) and `test/benchmarks/clockChangeNote.bench.ts`.
- ✅ NFR-A1 — `ClockChangeNote` renders `RowNoteBox` with no role (`views/shared/ClockChangeNote.tsx:14`). Tested by `ClockChangeNote.test.tsx`, `LocationRow.clockChangeNote.test.tsx:28` and E2E `locations_clock_change_note_e2e.steps.ts:57-84`.
- ✅ NFR-A2 — E2E outline "No accessibility violations with notes in the <theme> theme" (`locations_clock_change_note_e2e.feature:28`, light and dark).
- ✅ NFR-R1 — E2E outline "No horizontal scrolling with notes at <width> px at <moment>" (`locations_clock_change_note_e2e.feature:44`, 320/768/2560 px, Russian).
- ✅ NFR-R2 — The screenshot outlines are tagged (`locations_ui_e2e.feature:135`, `locations_12_hour_screenshots_e2e.feature:6`) and 20 PNGs are re-approved.
- ✅ UX1 — Same `RowNoteBox` markup (`order-last`, notice tokens) as the hint. E2E "Showing the note moves nothing in its card" (`locations_clock_change_note_e2e.feature:16`) and `LocationRow.clockChangeNote.test.tsx:13`.
- ✅ UX2 — One plain sentence from four keys (`presenter/clockChangeNote.ts:12-25`). Tested by "Texts in both languages" (`@UX2`).
- ✅ M1 — The window-bounds outline (`locations_clock_change_note_unit.feature:25-52`) has one example per date from `2026-10-17` to `2026-11-02`: 15 yes, 2 no.
- ✅ M2 — The budget steps assert 0 lookups and 0 formatters on a minute re-presentation (`locations_clock_change_note_budget.steps.ts:73` ff.) and ≤ 2 per zone on a date change (lines 105-115).
- ⚠️ M3 — Measured by me: clockChange 95.31%, rowNote 100%, dayPeriodStops 97.78%, dayTrack 100%, clockChangeNote 100%, localDateTime 100%, dateTimeFormatters 100%, presentZoneMoment 100%. `dayPeriodWindows.ts` did not finish within the tool's 10-minute limit (70/86 tested, 0 survived, 15 timed out), so its score is unmeasured. This is a measurement gap, not a code defect, so it is not a finding.
- ✅ M4 — The axe-core outline covers 2 themes and the no-scroll outline covers 3 widths (`locations_clock_change_note_e2e.feature:28,44`).
- ✅ M5 — I ran the task 7.3 traceability loop and it prints nothing for any of the 15 ids.
- ✅ Scenario: A past change at the lower bound of the window — `locations_clock_change_note_unit.feature:6`, steps `locations_clock_change_note_unit.steps.ts:41`.
- ✅ Scenario: A future change at the upper bound of the window — `locations_clock_change_note_unit.feature:16`, steps `…unit.steps.ts:58`.
- ✅ Scenario: Window bounds — `locations_clock_change_note_unit.feature:25` (Scenario Outline), steps `…unit.steps.ts:74`.
- ✅ Scenario: The window is counted in the reference zone — `locations_clock_change_note_unit.feature:54`, steps `…unit.steps.ts:96`.
- ✅ Scenario: A change on the reference day, before and after it — `locations_clock_change_note_unit.feature:63`, steps `…unit.steps.ts:112`.
- ✅ Scenario: Nearest of two changes — `locations_clock_change_note_unit.feature:74`, steps `…unit.steps.ts:133`. It uses `test/stubZoneRules.ts` because the polyfill misses the 7-day Boa Vista span.
- ✅ Scenario: A change of 30 minutes — `locations_clock_change_note_unit.feature:85`, steps `…unit.steps.ts:175`.
- ✅ Scenario: A permanent change of the offset — `locations_clock_change_note_unit.feature:93`, steps `…unit.steps.ts:199`.
- ✅ Scenario: No note for a zone without changes — `locations_clock_change_note_placement.feature:6`.
- ✅ Scenario: Home location and device time location show the note — `locations_clock_change_note_placement.feature:14`, steps `…placement.steps.ts:58-81`.
- ✅ Scenario: Unknown zone — `locations_clock_change_note_placement.feature:23`, steps `…placement.steps.ts:84`.
- ✅ Scenario: The note follows the date bar and the settings — `locations_clock_change_note_placement.feature:31`, steps `…placement.steps.ts:101`.
- ✅ Scenario: The wall-time hint wins in its row only — `locations_clock_change_note_placement.feature:43`.
- ✅ Scenario: Other rows keep their notes next to a hint — `locations_clock_change_note_placement.feature:52`.
- ✅ Scenario: The note returns when the hint ends — `locations_clock_change_note_placement.feature:61`, steps `…placement.steps.ts:166`.
- ✅ Scenario: Texts in both languages — `locations_clock_change_note_unit.feature:102` (Scenario Outline), steps `…unit.steps.ts:215`.
- ✅ Scenario: Amount with hours and minutes — `locations_clock_change_note_unit.feature:121`, steps `…unit.steps.ts:236`.
- ✅ Scenario: 50 rows with notes within the work bound — `locations_clock_change_note_budget.feature:6`.
- ✅ Scenario: A new reference day searches each zone once — `locations_clock_change_note_budget.feature:13`.
- ✅ Scenario: The note is not announced — `locations_clock_change_note_e2e.feature:6`.
- ✅ Scenario: Showing the note moves nothing in its card — `locations_clock_change_note_e2e.feature:16`.
- ✅ Scenario: No accessibility violations with notes — `locations_clock_change_note_e2e.feature:28`.
- ✅ Scenario: No horizontal scrolling with notes — `locations_clock_change_note_e2e.feature:44`.

## Mutation

I ran Stryker myself, scoped with `--mutate`, one run at a time, from `packages/client/`.

| File | Score | Notes |
|---|---|---|
| `src/model/clockChange.ts` | 95.31% | 3 survivors, all in the equal-distance clause at lines 114-115 (`nearest !== undefined` → `true`/`===`, `< 0` → `<= 0`). `getClockChanges` always returns ascending instants, so the clause never changes the pick. Two of the mutants are equivalent; the third is killable only by an unordered input, which production never passes. FR4 is still covered by `clockChange.test.ts:176`. |
| `src/model/rowNote.ts` | 100% | — |
| `src/model/dayPeriodStops.ts` | 97.78% | 1 survivor at line 74 (`< until` → `<= until`): a transition exactly at `day.end + 3 h`, which has no observable effect on the stops. |
| `src/model/dayTrack.ts` | 100% | — |
| `src/model/dayPeriodWindows.ts` | not measured | Two runs, alone and paired with `dayPeriodStops.ts`, were stopped by the tool's 10-minute limit. The last one reached 70/86 tested, 0 survived, 15 timed out (the timeouts are infinite-loop mutants of the `while` walk). No score is reported. |
| `src/presenter/clockChangeNote.ts` | 100% | — |
| `src/presenter/localDateTime.ts` | 100% | — |
| `src/presenter/dateTimeFormatters.ts` | 100% | — |
| `src/presenter/presentZoneMoment.ts` | 100% | — |
| `src/views/shared/ClockChangeNote.tsx` | 100% | — |
| `src/views/shared/RowNoteBox.tsx` | 100% | — |

## Findings

### R1 — WARNING — Two files this change grew pass the 200-line limit
- Location: `packages/client/src/test/features/locations/steps/locations_clock_change_note_unit.steps.ts:1` (271 lines, new) and `packages/client/src/model/dayTrack.test.ts:175` (219 lines; this change added lines 175-219 to a 174-line file)
- Rule: `CLAUDE.md` ("Files must stay under 200 lines for AI context quality"), `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity"), and the change's own `tasks.md` ("every file stays under 200 lines; a steps file that would pass it gets a helper next to it")
- Problem: The new unit BDD steps file has 271 lines and `model/dayTrack.test.ts` now has 219. Commit 7792fca already split the unit feature once, to the 300-line hard cap, not to the 200-line limit the project and `tasks.md` set. Splitting would not hurt clarity here. The change already has the pattern: `locations_clock_change_note_placement.feature` with its own steps file, and `presentZoneMoment.wallTime.test.ts` as a topic-named test file.
- Impact: It breaks the file-size invariant of `CLAUDE.md` and the change's own cross-cutting rule in `tasks.md`. It also lowers the AI context quality those rules protect for later work on these tests.
- Fix: Move the scenarios "Nearest of two changes", "A change of 30 minutes" and "A permanent change of the offset" (with their `@show-clock-change-note-on-location-cards @FR…` tags) from `locations_clock_change_note_unit.feature` into a new `locations_clock_change_note_changes_unit.feature`. Move their step definitions (`locations_clock_change_note_unit.steps.ts:133-214`, including the `stubZoneRules` setup and `MINUTES_PER_TEST_HOUR`) into a new `steps/locations_clock_change_note_changes_unit.steps.ts` built on the existing `createClockChangeNoteWorld` and `createClockChangeNoteHandlers`. Move the `clockChangeWindow` tests at `model/dayTrack.test.ts:175-219` into a new `model/dayTrack.clockChangeWindow.test.ts` with its `// Verifies FR1 of show-clock-change-note-on-location-cards (D1).` comment.
- Fix risk: Low. The scenarios keep their names, tags and steps, so the traceability loop of task 7.3 and the unit BDD runs are unaffected. The proposal's "Behavior" list would then name one more unit feature file than it does now; that is a documentation drift only, since `proposal.md` is not code. The new feature file must stay in the `locations` folder so the vitest-cucumber `loadFeature` path and the `@show-clock-change-note-on-location-cards` tag convention of `.claude/rules/bdd-unit.md` still hold.
- Status: open

## Verdict

Ready. No CRITICAL findings. R1 (WARNING) is a file-size rule breach in test code and does not block. The model, presenter and view meet every requirement and spec scenario. The one gap is that I could not measure the mutation score of `dayPeriodWindows.ts` inside the tool limit (0 survivors among the 70 mutants tested).
