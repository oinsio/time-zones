# Review: add-time-sliders-to-location-cards

## Summary

| Item | Value |
|---|---|
| Tasks verified | 25/27 |
| Requirements traced | 70/74 |
| CRITICAL | 1 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 `constants/timeSelection.ts:2-5` (`TRACK_STEP_MINUTES`, `TRACK_HOUR_MOVE_MINUTES`, `HOUR_LABEL_INTERVAL_HOURS`, `TRACK_TOUCH_SLOP_PX`), `constants/dayPeriods.ts:2-7`, `constants/localDateTime.ts` `HOUR_LABEL_FORMAT_OPTIONS`; all re-exported from `constants/index.ts`.
- ✅ 1.2 `locales/en.json` / `locales/ru.json`: `locations.timeSliderLabel` ("Time in {{city}}" / "Время — {{city}}") and `locations.timeSliderValue` ("{{time}}, {{date}}") in both.
- ✅ 2.1 `model/reduceSelectInstant.ts:25-63` (Z-only parse, same state on an equal pin, `UNIQUE`, `requestedWallTime` in the reference zone); `SELECT_INSTANT` / `INVALID_INSTANT` in `model/locations.ts:49,59,86,158`; tests in `model/reduceSelectInstant.test.ts` with the required header.
- ✅ 2.2 `model/dayTrack.ts:17-106` (all functions and `TrackMove`), exported from `model/index.ts`; `model/dayTrack.test.ts` with the D2 header.
- ✅ 2.3 `model/dayPeriods.ts:16-76` (`DayPeriod`, `DAY_PERIOD_SCHEDULE` from constants, `getDayPeriod(wallTime, schedule)`); `model/dayPeriods.test.ts`.
- ✅ 2.4 `model/dayPeriodWindows.ts:39-161` (`findOffsetTransitions` with `getTimeZoneTransition("next")`, `collectBlendWindows`, `collectOffsetEdges`), `model/dayPeriodStops.ts:31-79` (`assembleDayPeriodStops`, memoized `getDayPeriodStops`); tests in `model/dayPeriodStops.test.ts` and `model/dayPeriodWindows.test.ts`.
- ✅ 2.5 Measured in this review: `reduceSelectInstant.ts`, `dayTrack.ts`, `dayPeriods.ts`, `dayPeriodStops.ts` and `locations.ts` 100%, `dayPeriodWindows.ts` 96.43% (see Mutation).
- ✅ 3.1 `presenter/dayTrack.ts:70-135` (`formatHourLabel`, memoized hour labels, `presentDayTrack`); `presenter/dayTrack.test.ts` with the D5 header.
- ✅ 3.2 `presenter/presentLocationRows.ts` `dayTrack` field (undefined for an unknown zone) and `referenceDay` in `LocationRowsContext`; tests at `presenter/presentLocationRows.test.ts:163`; `PresentedDayTrack` exported from `presenter/index.ts`.
- ✅ 3.3 Measured: `presenter/dayTrack.ts` 100%, `presenter/presentLocationRows.ts` 100%.
- ✅ 4.1 `controller/useLocations.ts` passes `getReferenceDay(state, now)` read at the same `now` as the effective instant; `controller/useLocations.dayTrack.test.tsx` with the D6 header.
- ✅ 4.2 `controller/useTimeSelection.ts:21-49` dispatches `SELECT_INSTANT` straight to the store (no write scheduler); `useTimeSelection` and `TrackMove` exported from `controller/index.ts`; `controller/useTimeSelection.test.tsx`.
- ✅ 4.3 Measured: `useLocations.ts` 100%, `useTimeSelection.ts` 100%.
- ✅ 5.1 `views/shared/dayTrackGradient.ts:5-29` (`DAY_PERIOD_COLOR_VARIABLES`, `buildDayTrackGradient`, `formatPercent`); `views/shared/dayTrackGradient.test.ts`.
- ✅ 5.2 `views/shared/dayTrackKeys.ts:4-21` and `views/shared/dayTrackTouch.ts:3-35`, wired at `views/shared/DayTrack.tsx:67-114`; `dayTrackKeys.test.ts`, `dayTrackTouch.test.ts`, plus pointer/touch wiring tests in `views/shared/DayTrack.input.test.tsx`.
- ✅ 5.3 `views/shared/DayTrack.tsx:49-168`; `views/shared/DayTrack.test.tsx:7-32` asserts the gradient, `left: 52.0833%` and five labels in an `aria-hidden` container.
- ✅ 5.4 `views/shared/LocationRow.tsx` renders `DayTrack` when `row.dayTrack` is set; `LocationList.tsx` passes `onSelectTrackFraction` / `onMoveTrack`; `views/cards/CardsView.tsx` takes them from `useTimeSelection()`; `views/shared/LocationRow.test.tsx:4`.
- ❌ 5.5 Measured `views/shared/DayTrack.tsx` at 89.71%, below the task's 90% minimum (and the 95% target); see R2. The other files pass: `dayTrackGradient.ts` 100%, `dayTrackKeys.ts` 100%, `LocationRow.tsx` 96%, `CardsView.tsx` 100%, `dayTrackTouch.ts` 91.30% (R3).
- ✅ 6.1 `test/features/time_selection/time_selection_select_time.feature` + `steps/time_selection_select_time.steps.tsx` (select, snap, 23-hour day, malformed, keys); the date-bar, storage, other-tab and NFR-P1 scenarios sit in `time_selection_moment.feature` + `steps/time_selection_moment.steps.tsx`, timed with `performance.now()` in `steps/trackBudgetWorld.ts:42-45`.
- ✅ 6.2 `time_selection_day_track.feature` (reference day, handle, NFR-P2) and `time_selection_day_colours.feature` (colour stops, sampled colours, Apia, hard edge, hour labels, slider strings), with step files `steps/time_selection_day_track.steps.tsx` and `steps/time_selection_day_colours.steps.tsx`.
- ✅ 6.3 `test/features/date_selection/date_selection_wall_clock.feature:15-16` tagged `@add-time-sliders-to-location-cards @FR5 @M4`; steps at `date_selection/steps/date_selection_wall_clock.steps.tsx:75`.
- ✅ 7.1 Scenarios split across `time_selection_e2e.feature` (pointer, keys, focus, names, axe), `time_selection_layout_e2e.feature` (layout, labels, handle centre, touch targets, no horizontal scroll, token colours, handle tokens) and `time_selection_touch_e2e.feature` (vertical swipe, finger tap), with `steps/time_selection_*_e2e.steps.ts`, each step carrying `// Verifies … of add-time-sliders-to-location-cards`.
- ✅ 7.2 `time_selection_view_contract_e2e.feature:11-13` (`@view-contract @FR3 @FR5`, "Select a time"); steps `steps/time_selection_view_contract_e2e.steps.ts:9`.
- ✅ 7.3 `test/features/locations/steps/locationsStates.ts:47,113-125` (`TIME_SELECTED` clicks 75% of the Almaty bar and waits for `18:00`); four rows and the tags at `test/features/locations/locations_ui_e2e.feature:113,147-150`; 8 new baselines.
- ❌ 7.4 Only the 375 px "list" and "pinned" baselines were re-approved. The 12 baselines of "list", "pinned" and "calendar" at 1024 px (light/dark × `chromium`/`mobile-chrome`) are unchanged since commit `4bbe340` and show cards without tracks; see R1.
- ✅ 8.1 The traceability loop of the task prints nothing (re-run in this review for every FR, NFR, UX and M2–M7, M9 id).
- ✅ 8.2 Commands are listed and CI is green; the full mutation run is left to the user, as the task says.

## Requirements

- ✅ FR1 — `model/dayTrack.ts:33-47` `getReferenceDay`; `presenter/presentLocationRows.ts` leaves `dayTrack` undefined for an unknown zone; scenarios "A 24-hour reference day", "Days of 23 and 25 hours", "No track for an unknown zone" in `time_selection_day_track.feature`.
- ✅ FR2 — `getTrackFraction` (`model/dayTrack.ts:52-57`), rows re-presented on `minuteTick` in `controller/useLocations.ts`; handle scenarios in `time_selection_day_track.feature:33-59` and `controller/useLocations.dayTrack.test.tsx`.
- ✅ FR3 — `getInstantAtTrackFraction` (`model/dayTrack.ts:79-85`), `reduceSelectInstant.ts:41-47` (no-op on equal pin), touch gating `views/shared/DayTrack.tsx:67-107`; unit BDD `time_selection_select_time.feature`, E2E `time_selection_e2e.feature:7-24`, `time_selection_touch_e2e.feature`.
- ✅ FR4 — `getInstantAfterTrackMove` (`model/dayTrack.ts:88-106`), `views/shared/dayTrackKeys.ts`; `time_selection_select_time.feature:53-92`, E2E `time_selection_e2e.feature:28-57`.
- ✅ FR5 — `UNIQUE` status in `reduceSelectInstant.ts:58`; `time_selection_moment.feature:6-27`, `date_selection_wall_clock.feature:16`.
- ✅ FR6 — `model/dayPeriods.ts`, `model/dayPeriodWindows.ts`, `model/dayPeriodStops.ts`, `views/shared/dayTrackGradient.ts`; `time_selection_day_colours.feature:6-42`, E2E token check `time_selection_layout_e2e.feature:70`.
- ✅ FR7 — `presenter/dayTrack.ts:70-113`, labels row `views/shared/DayTrack.tsx:151-165`; `time_selection_day_colours.feature:45`, E2E `time_selection_layout_e2e.feature:24-30`.
- ✅ FR8 — `INVALID_INSTANT` at `reduceSelectInstant.ts:31-39`, direct store dispatch at `controller/useTimeSelection.ts:34-35`; `time_selection_select_time.feature:47`, `time_selection_moment.feature:30-44`.
- ✅ FR9 — both locale files; `time_selection_day_colours.feature:60` (both languages), E2E name check `time_selection_e2e.feature:67`.
- ✅ NFR-P1 — `time_selection_moment.feature:47` timed in `steps/trackBudgetWorld.ts:42-45` (≤ 50 ms for 50 rows).
- ✅ NFR-P2 — `time_selection_day_track.feature:61` "50 tracks within the date-change budget".
- ✅ NFR-A1 — `time_selection_e2e.feature:75-80` axe outline (live / time selected × light / dark).
- ✅ NFR-A2 — one `tabIndex={0}` per slider and `preventDefault()` on mapped keys (`views/shared/DayTrack.tsx:109-123`), focus ring `DayTrack.tsx:148`; E2E `time_selection_e2e.feature:28,60`; key wiring also in `DayTrack.input.test.tsx:171`.
- ✅ NFR-A3 — `role="slider"` with `aria-label`, `aria-valuemin/max/now/text` (`DayTrack.tsx:122-128`); E2E `time_selection_e2e.feature:67`.
- ✅ NFR-R1 — E2E `time_selection_layout_e2e.feature:58` at 320 and 2560 px.
- ✅ NFR-R2 — layout classes `DayTrack.tsx:119,140`, `touch-pan-y` `DayTrack.tsx:136`; E2E `time_selection_layout_e2e.feature:7-30`, `time_selection_touch_e2e.feature`.
- ❌ NFR-R3 — the 1024 px "list", "pinned" and "calendar" baselines were not re-approved and do not show the tracks (R1).
- ✅ UX1 — 44 px slider and hit box, 28/32 px circle with surface fill and foreground border (`DayTrack.tsx:136,145,148`); E2E `time_selection_layout_e2e.feature:7-20,46,82`.
- ✅ UX2 — handle `left: fraction%` centred with `-translate-x-1/2` (`DayTrack.tsx:145-146`); E2E `time_selection_layout_e2e.feature:33`.
- ✅ UX3 — `text-muted-foreground tabular-nums` on the labels row (`DayTrack.tsx:153`); E2E `time_selection_layout_e2e.feature:21`.
- ✅ M1 — the traceability grep finds every FR1–FR9, NFR and UX id next to the change name.
- ✅ M2 — `time_selection_day_track.feature:33` (fraction 0.520833 on all cards) and `time_selection_select_time.feature:5-34` (0.75 / 0.52 / 1.0 / 0).
- ✅ M3 — `time_selection_select_time.feature:53-83` (six pinned keys and two live keys).
- ✅ M4 — `time_selection_day_track.feature:13`, `time_selection_select_time.feature:36`, `date_selection_wall_clock.feature:15`.
- ✅ M5 — `time_selection_day_colours.feature:5-36` (16 stops, sampled colours, Apia).
- ✅ M6 — `time_selection_day_colours.feature:44-57`.
- ✅ M7 — `time_selection_moment.feature:29-34`, and `controller/useTimeSelection.test.tsx` (`lastDelayMs()` undefined).
- ⚠️ M8 — measured 100% or ≥ 96% on every new or changed model, presenter and controller file, but `views/shared/DayTrack.tsx` is at 89.71% (R2).
- ⚠️ M9 — axe (0 violations in 2 states × 2 themes) and the 320 / 2560 px scroll checks are covered, but the screenshot part fails its own premise: the 1024 px baselines it names as "re-approved" were never re-approved (R1).
- ✅ Scenario: A gap is told in the bar — unchanged existing scenario, `date_selection_wall_clock.feature:6`.
- ✅ Scenario: A time selection ends the gap note — `date_selection_wall_clock.feature:16`, steps `date_selection_wall_clock.steps.tsx:75`.
- ✅ Scenario: Wall-clock outcomes — unchanged existing outline, `date_selection_wall_clock.feature:26`.
- ✅ Scenario: A malformed date changes nothing — unchanged existing scenario, `date_selection_wall_clock.feature:41`.
- ✅ Scenario: A 24-hour reference day — `time_selection_day_track.feature:6`.
- ✅ Scenario: Days of 23 and 25 hours — `time_selection_day_track.feature:14`.
- ✅ Scenario: No track for an unknown zone — `time_selection_day_track.feature:27`.
- ✅ Scenario: All handles stand at the same position — `time_selection_day_track.feature:34`.
- ✅ Scenario: A live handle follows the clock — `time_selection_day_track.feature:42`.
- ✅ Scenario: A pinned handle ignores minute updates — `time_selection_day_track.feature:51`.
- ✅ Scenario: Dragging one track moves every card — unit `time_selection_select_time.feature:6`, E2E `time_selection_e2e.feature:7`.
- ✅ Scenario: Selections snap to quarter hours and stay inside the day — `time_selection_select_time.feature:22`.
- ✅ Scenario: Selection on a 23-hour day — `time_selection_select_time.feature:37`.
- ✅ Scenario: A malformed instant changes nothing — `time_selection_select_time.feature:47`.
- ✅ Scenario: Keys from a pinned quarter hour — unit `time_selection_select_time.feature:54`, E2E `time_selection_e2e.feature:42`.
- ✅ Scenario: Keys from a live moment between steps — `time_selection_select_time.feature:73`.
- ✅ Scenario: Keys stop at the ends of the day — `time_selection_select_time.feature:85`.
- ✅ Scenario: Now after selecting a time — `time_selection_moment.feature:6`.
- ✅ Scenario: A date change keeps the selected time — `time_selection_moment.feature:19`.
- ✅ Scenario: Time selections store nothing — `time_selection_moment.feature:30`.
- ✅ Scenario: The selected time survives a list change in another tab — `time_selection_moment.feature:37`.
- ✅ Scenario: Colour stops of Almaty and New York — `time_selection_day_colours.feature:6`.
- ✅ Scenario: Colours follow the local period outside blend windows — `time_selection_day_colours.feature:19`.
- ✅ Scenario: Boundaries of a skipped local date are left out — `time_selection_day_colours.feature:28`.
- ✅ Scenario: A period change across an offset change is a hard edge — `time_selection_day_colours.feature:38`.
- ✅ Scenario: Colours come from the theme tokens — `time_selection_layout_e2e.feature:70`.
- ✅ Scenario: Hour labels of four zones — `time_selection_day_colours.feature:45`.
- ✅ Scenario: Labels only on wide screens — `time_selection_layout_e2e.feature:24`.
- ✅ Scenario: Slider name and value in both languages — `time_selection_day_colours.feature:60`.
- ✅ Scenario: 50 rows within the time-selection budget — `time_selection_moment.feature:47`.
- ✅ Scenario: 50 tracks within the date-change budget — `time_selection_day_track.feature:61`.
- ✅ Scenario: No accessibility violations with tracks — `time_selection_e2e.feature:75`.
- ✅ Scenario: Slider name, range and value — `time_selection_e2e.feature:67`.
- ✅ Scenario: Keyboard moves every card — `time_selection_e2e.feature:28`.
- ✅ Scenario: Visible focus — `time_selection_e2e.feature:60`.
- ✅ Scenario: Track under the text on a narrow screen — `time_selection_layout_e2e.feature:7`.
- ✅ Scenario: Track beside the time on a wide screen — `time_selection_layout_e2e.feature:15`.
- ✅ Scenario: Handle centre matches the instant — `time_selection_layout_e2e.feature:33` (375 and 1024 px).
- ✅ Scenario: Drag without scrolling or reordering — `time_selection_e2e.feature:18`.
- ✅ Scenario: A vertical swipe on a track scrolls without selecting a time — `time_selection_touch_e2e.feature:6`.
- ✅ Scenario: A finger tap on a track selects a time — `time_selection_touch_e2e.feature:18`.
- ✅ Scenario: Touch targets — `time_selection_layout_e2e.feature:46`.
- ✅ Scenario: Tracks fit narrow and wide screens — `time_selection_layout_e2e.feature:58`.
- ❌ Scenario: Screenshots show the tracks — the outline exists (`locations_ui_e2e.feature:114`), but the 1024 px "list", "pinned" and "calendar" baselines show no tracks and pass only within the pixel tolerance (R1).
- ✅ Scenario: Select a time — `time_selection_view_contract_e2e.feature:12`.

## Mutation

Measured in this review with `npx stryker run --mutate '<files>'` from `packages/client`, at most five files per run, one run at a time:

| File | Score | Survivors |
|---|---|---|
| `src/model/reduceSelectInstant.ts` | 100.00% | — |
| `src/model/dayTrack.ts` | 100.00% | — |
| `src/model/dayPeriods.ts` | 100.00% | — |
| `src/model/dayPeriodStops.ts` | 100.00% | — |
| `src/model/dayPeriodWindows.ts` | 96.43% | 3: `disambiguation: "earlier"` → `{}` (line 107-108) is equivalent, since `compatible` also yields the earlier instant in an overlap and the gap check skips either way; `> 0` → `>= 0` / `true` at line 149 survive because no fixture has a period-changing offset transition at or within 3 h before the day start (such an edge would only add stops at fraction ≤ 0). Above the 95% target, so not a finding |
| `src/model/locations.ts` | 100.00% | — |
| `src/presenter/dayTrack.ts` | 100.00% | — |
| `src/presenter/presentLocationRows.ts` | 100.00% | — |
| `src/controller/useLocations.ts` | 100.00% | — |
| `src/controller/useTimeSelection.ts` | 100.00% | — |
| `src/views/shared/DayTrack.tsx` | **89.71%** | 6 survivors + 1 no-coverage, all in the hour-label alignment classes (lines 33-38, 159), see R2; 1 runtime error excluded from the score |
| `src/views/shared/dayTrackGradient.ts` | 100.00% | — |
| `src/views/shared/dayTrackKeys.ts` | 100.00% | — |
| `src/views/shared/dayTrackTouch.ts` | 91.30% | 2 equivalent at line 30, see R3 |
| `src/views/shared/LocationRow.tsx` | 96.00% | 2, both on lines this branch did not change (75, 79) |
| `src/views/shared/LocationList.tsx` | 100.00% | — |
| `src/views/cards/CardsView.tsx` | 100.00% | — |

Constants files hold no logic and were not mutated.

## Findings

### R1 — CRITICAL — 1024 px screenshot baselines were not re-approved and show no tracks
- Location: `packages/client/src/test/features/__screenshots__/chromium/Screenshot-of-the-list-state-at-1024-px-in-the-light-theme.png`
- Rule: task 7.4 of `tasks.md`; NFR-R3 of `proposal.md`
- Problem: Task 7.4 is ticked, but only the four 375 px "list" / "pinned" baselines per project changed on this branch. The 12 baselines of the "list", "pinned" and "calendar" states at 1024 px (light and dark, in both `__screenshots__/chromium/` and `__screenshots__/mobile-chrome/`) were last changed in commit `4bbe340`, before this change. Opening them shows Almaty and Moscow cards with no day track, no handle and no hour labels, while the new `Screenshot-of-the-time-selected-state-at-1024-px-in-the-light-theme.png` of the same layout shows tracks beside the time column. The scenario "Screenshot of the <state> state …" at `locations_ui_e2e.feature:114` still passes because `playwright.bdd.config.ts:32` allows `SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.025` (about 20 000 pixels of a 1024 px page), and two thin tracks with their handles and labels change fewer pixels than that. The 375 px "calendar" baselines are a full-screen dialog that hides the rows, so they need no change.
- Impact: NFR-R3 ("The approved screenshots at 375 px and 1024 px … show the tracks. The existing "list", "pinned" and "calendar" baselines are re-approved") and the spec scenario "Screenshots show the tracks" are not met, and a ticked task is not done. The wide-screen baselines approve a screen without the feature: a regression that drops or breaks the tracks at 1024 px in those states (e.g. the track hidden by a layout change) would still pass the visual check.
- Fix: Re-run the screenshot outline for those states with `--update-snapshots`, one project at a time: `npx playwright test -c playwright.bdd.config.ts --grep "Screenshot of the (list|pinned|calendar) state at 1024" --project chromium --update-snapshots`, then the same with `--project mobile-chrome`. Open the 12 new PNGs and check that each card shows its gradient track, handle and five hour labels (rows dimmed behind the dialog in "calendar"). Then run the `--grep Screenshot` command of task 7.4 without `--update-snapshots`, and commit the 12 updated baselines.
- Fix risk: The baselines are re-approved from the current implementation, so a layout defect would become the new baseline unless the PNGs are looked at. Nothing in code changes. The 2.5% tolerance stays as it is; changing it would affect every other screenshot and is outside this change.
- Status: fixed
- Resolution: re-generated the 12 baselines of "list", "pinned" and "calendar" at 1024 px
  with `--update-snapshots=all` in both projects (the default mode skips them within the 2.5%
  tolerance); opened them and each card shows its track, handle and five hour labels.

### R2 — WARNING — DayTrack.tsx mutation score below 90%: hour-label edge alignment is tested nowhere
- Location: `packages/client/src/views/shared/DayTrack.tsx:33`
- Rule: `CLAUDE.md` "Mutation testing … minimum acceptable >=90%"; task 5.5; M8; design D8 ("the outer labels are aligned to the track edges")
- Problem: Stryker scores `DayTrack.tsx` at 89.71%. Every survivor is in `LABEL_ALIGNMENT_CLASS_NAMES` (lines 33-38: emptying the array or any of its class strings survives) and in the `?? ""` fallback at line 159 (no coverage). These classes do what D8 asks: the first label starts at the left edge of the bar and the last one ends at its right edge. A unit test asserting the class names was removed in commit `6b01dcd`, and no E2E step replaces it: `steps/time_selection_labels_e2e.steps.ts:43-56` checks only that five labels are visible and sit below the bar, not where they sit horizontally.
- Impact: The file is under the project's minimum mutation score, and dropping the alignment classes (for example in a later refactor of the label row) passes every test, although the first label then sticks out half its width past the left end of the track and the last one past the right end, unlike the approved tablet screen.
- Fix: In the step "every track shows {int} hour labels under its bar" (`steps/time_selection_labels_e2e.steps.ts:44`), also assert that the first label's box `x` is at least the bar's `x` − 1 and that the last label's `x + width` is at most the bar's `x + width` + 1 (that step already reads label boxes with `requireBox`). Then mark the layout-only lines for Stryker the way `views/shared/CalendarDialog.tsx:57,67` already does: `// Stryker disable all: not equivalent — label alignment is layout, untested in jsdom by design (D9), covered by time_selection_layout_e2e.feature` before line 33 with a `// Stryker restore all` after line 39, and `// Stryker disable next-line StringLiteral: equivalent — every label index has a class` above line 159. Re-run `npx stryker run --mutate 'src/views/shared/DayTrack.tsx'` and check it is ≥ 90%.
- Fix risk: The disable comments hide any future mutant on those lines from Stryker, so the E2E assertion becomes their only guard. A 1 px tolerance on label boxes could be flaky with sub-pixel layout; widen it to 2 px if needed. The E2E runs in both `chromium` and `mobile-chrome` at 1024 px, where the labels are visible.
- Status: fixed
- Resolution: the step "every track shows {int} hour labels under its bar" now asserts the first
  label starts at the bar left edge and the last ends at its right edge (1 px tolerance); layout-only
  lines carry Stryker disable comments as in CalendarDialog.tsx. DayTrack.tsx now scores 100%.

### R3 — SUGGESTION — Redundant clause in the touch decision leaves two equivalent mutants
- Location: `packages/client/src/views/shared/dayTrackTouch.ts:30`
- Rule: `CLAUDE.md` "Mutation testing — target >=95%"
- Problem: In `getTouchGestureDecision`, the `SELECT` branch tests `horizontalDistance > TRACK_TOUCH_SLOP_PX && horizontalDistance > verticalDistance`. The second clause can never be false there: if `horizontalDistance > TRACK_TOUCH_SLOP_PX` and `horizontalDistance <= verticalDistance`, then `verticalDistance > TRACK_TOUCH_SLOP_PX && verticalDistance >= horizontalDistance` is true and the `ABANDON` branch above has already returned. Stryker reports both mutants of that clause as survivors, so the file scores 91.30%, below the 95% target.
- Impact: Low: behaviour is correct, but the dead clause costs 4–5 points of mutation score on a new file and suggests a case that does not exist.
- Fix: Reduce the condition to `horizontalDistance > TRACK_TOUCH_SLOP_PX`, with a one-line comment that the vertical case was decided above. Keep `dayTrackTouch.test.ts` as it is; it should stay green. Re-run `npx stryker run --mutate 'src/views/shared/dayTrackTouch.ts'`.
- Fix risk: Behaviour stays exactly what design D7 describes ("`SELECT` when the horizontal distance exceeds `TRACK_TOUCH_SLOP_PX` and the vertical one"), but the `SELECT` branch then depends on staying below the `ABANDON` branch; the existing `it.each` case "12 px right, 12 px up → `ABANDON`" in `dayTrackTouch.test.ts` catches a reordering.
- Status: fixed
- Resolution: reduced the SELECT condition to the slop check with a comment; dayTrackTouch.test.ts
  stays green and dayTrackTouch.ts scores 100% in Stryker.

## Verdict

Not ready. R1 (CRITICAL) blocks: task 7.4 is ticked but the 1024 px "list", "pinned" and "calendar" baselines were never re-approved, so NFR-R3 and the scenario "Screenshots show the tracks" are not met. R2 (WARNING) should be fixed in the same round to bring `DayTrack.tsx` above the 90% mutation minimum. R3 is optional.
