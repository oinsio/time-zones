# Review: refine-meeting-range-entry-and-handles

## Summary

| Item | Value |
|---|---|
| Tasks verified | 23/23 |
| Requirements traced | 68/71 |
| CRITICAL | 1 |
| WARNING | 1 |
| SUGGESTION | 2 |

## Tasks

Paths below are under `packages/client/src/` unless they start with `docs/` or `temporary-docs/`.

- ✅ 1.1 Glossary — `docs/glossary/time-selection.md:13` (Track move gains `getMinutesAfterTrackStep`), `:23` (Meeting range "at any whole minute", `MEETING_START_EQUALS_END`, `MEETING_END_BEFORE_START`), `:25` (Meeting handle "onto the track step", `getMeetingHandleRow`, `useVisibleStripRows`), `:30` (Wall-time input separator, `formatTypedWallTimeText`), `:31` (Meeting range input separator); `docs/glossary/date-selection.md:5` (`DATE_BAR_SELECTOR`); the file has 32 lines.
- ✅ 1.2 Architecture docs — `docs/architecture/domain-model.md:28` (`"a whole minute of the reference day"`), `:58` (invariant 5, whole minutes), `:75` (both new error codes); ADR-0013 cited at `docs/architecture/views.md:42` and `docs/architecture/overview.md:21`.
- ✅ 2.1 RED tests — `model/meetingRange.test.ts:39` (`04:00`–`04:01`), `:51` (`04:10:30`), `:167-171` (`moveMeetingRangeToDay` keeps 09:05–09:28), `:192` (start at 551 → `04:15`); `model/dayTrack.test.ts:171-174` (`545`→`555`/`540`, `540`→`555`/`525`).
- ✅ 2.2 GREEN D1 — `model/dayTrack.ts:113` exports `getMinutesAfterTrackStep`, called by `getInstantAfterTrackMove` (`:133`, `:137`) and by `getMeetingRangeAfterHandleMove` (`model/meetingRange.ts:142`, `:146`); `isOnWholeMinute` at `meetingRange.ts:50`; minimum length `Math.min(TRACK_STEP_MINUTES, …)` at `:94`; the step floor is gone from `moveMeetingRangeToDay` (`:193` `const start = newStart`).
- ✅ 2.3 Wall-clock refusals — `model/locationCommands.ts:42-43` (two codes); `model/reduceMeetingRangeWallTimes.ts:88-92` (equal times → `MEETING_START_EQUALS_END`), `:31` `getShownDayRefusal`, `:100`; table tests in `model/reduceMeetingRangeWallTimes.test.ts`.
- ✅ 2.4 Existing unit BDD updated — `meeting_range_commands.feature` (`04:10:30Z` row), `meeting_range_wall_times.feature` (new tables, "The whole reference day" → `MEETING_START_EQUALS_END`), steps updated in `meeting_range_wall_times.steps.ts` and `meeting_range_commands.steps.ts`.
- ✅ 2.5 New unit BDD — `test/features/meeting_range/meeting_range_any_minute.feature` (scenarios "A meeting at any minute", "Next day keeps a meeting off the track step", "Moves from an end off the track step", "A drag lands an off-step end on the track step") with `steps/meeting_range_any_minute.steps.ts`.
- ✅ 3.1 Separator rule — `presenter/formatTypedWallTimeText.ts:29`; constants at `constants/timeSelection.ts:59-73` (`WALL_TIME_SEPARATOR` `:62`), exported through `constants/index.ts` and `presenter/index.ts`; `presenter/formatTypedWallTimeText.test.ts` (`it.each`, `130`→`13:0` included).
- ✅ 3.2 Outcomes and messages — `controller/useMeetingRange.ts:44-48` (three outcomes), `OUTCOME_OF_REFUSAL` at `:54`, used at `:192`; `views/shared/MeetingRangeInput.tsx:25` (`RANGE_ERROR_KEYS`), `:91-98`; three keys at `locales/ru.json:126-128` and `locales/en.json:126-128`; `grep -rn "INVALID_RANGE\b\|rangeInputError\b\|шагом 15" src` prints nothing.
- ✅ 4.1 Separator in the views — `views/shared/typedTimeFieldText.ts:23` (`getTypedTimeFieldText`), used at `WallTimeInput.tsx:78` and `MeetingRangeInput.tsx:119,130`; tests `typedTimeFieldText.test.ts`, `WallTimeInput.test.tsx:132-134` (`1030` → `selectionStart` 5), `MeetingRangeInput.test.tsx`.
- ✅ 4.2 Unit BDD of the input — `grid_view_meeting_range_input_unit.feature:19-30` ("A meeting at any minute", 5 rows), `:39-51` ("Wrong input keeps the input open", 5 rows, `@FR3 @UX3`); new `time_selection/time_selection_time_separator_unit.feature` (5 scenarios, `130` in rows `:18` and `:61`) with steps.
- ✅ 4.3 Handle rows — `views/grid/meetingHandleRow.ts:4-7` (`MeetingHandleCandidateRows`), `:18`; `views/grid/useVisibleStripRows.ts:47`; `MEETING_HANDLE_HEIGHT_PX` at `constants/meeting.ts:19`; `DATE_BAR_SELECTOR` at `constants/date.ts:40`; `data-date-bar` at `app/MainPage.tsx:67`; wiring at `views/grid/GridView.tsx:44-61`; tests `meetingHandleRow.test.ts`, `useVisibleStripRows.test.tsx` (10 cases, `:81-150`), `app/MainPage.test.tsx`.
- ✅ 4.4 Hit area, grab offset, release — `views/grid/MeetingHandle.tsx:101` (`h-12 w-11`), `:122` (grip `h-9 w-3`); `views/grid/useMeetingHandleDrag.ts:58-63` (press-relative minutes), `:117-135` (one-shot capture click guard), `:154` (`touchend` `preventDefault`); `MEETING_HANDLE_RELEASE_CLICK_WINDOW_MS` at `constants/meeting.ts:21`; tests `useMeetingHandleDrag.release.test.tsx:38-144`, `MeetingHandle.test.tsx:42-46`. `useMeetingHandleDrag.edges.test.tsx` has no absolute-minute assertion, so it needed no change.
- ✅ 4.5 Unit BDD of the handles — `grid_view/grid_view_meeting_handle_reach_unit.feature` (4 scenarios) with `steps/grid_view_meeting_handle_reach_unit.steps.tsx`.
- ✅ 5.1 E2E handles — `grid_view_meeting_handle_reach_e2e.feature` (on screen at 3 positions × 2 viewports, press 16 px beside the grip, press without movement, hit area, off-step slider values, arrow keys) with steps; `grid_view_layers_e2e.steps.ts` imports `DATE_BAR_SELECTOR`; the two auto-scroll scenarios of `grid_view_meeting_handles_e2e.feature` are retagged and use the grab-offset step.
- ✅ 5.2 E2E separator and messages — `time_selection/time_selection_time_separator_e2e.feature` (caret step at `:17`, `905`–`928` → «Meeting · 23 min») with steps; `grid_view/grid_view_meeting_range_messages_e2e.feature` (6 examples, light and dark) with steps.
- ✅ 5.3 Existing browser suites — the named scenarios still exist in `grid_view_meeting_handles_e2e.feature`, `time_selection_wall_time_input_e2e.feature` and `grid_view_meeting_lock_e2e.feature`; CI is green.
- ✅ 6.1 Scoped Stryker — re-measured in this review (see Mutation): every run scores ≥ 97 % and every changed production file ≥ 91.8 %, above the 90 % the task asks for.
- ✅ 6.2 Build, bundle, legacy build, typecheck, lint, tests — CI green on the branch.
- ✅ 6.3 Screenshots — handoff README H2 records "none re-written"; no `.png` baseline is in the branch diff.
- ✅ 6.4 Traceability — `grep -rn "refine-meeting-range-entry-and-handles" packages/client/src` yields FR1–FR8, NFR-A1, NFR-A2, NFR-P1, NFR-R1, UX1–UX3; `grep -rn isOnTrackStep packages/client/src` prints nothing.
- ✅ 7.1 Handoff H1 — `temporary-docs/gnomish/github-oinsio-time-zones-114/handoff/H1-adr-0013-meeting-range-any-minute.patch` exists, `docs/adr/0013-*` is absent, README has `## H1`.
- ✅ 7.2 Handoff H2 — README `## H2` with Serves, Files, Verify ("none re-written"), Why manual, Automated part.

## Requirements

- ✅ FR1 — `isOnWholeMinute` (`model/meetingRange.ts:50`, used by `isValidMeetingRange`); `meetingRange.test.ts:39,51`; `meeting_range_any_minute.feature` "A meeting at any minute".
- ✅ FR2 — `model/reduceMeetingRangeWallTimes.ts:31-48,88-101`; `reduceMeetingRangeWallTimes.test.ts`; `meeting_range_wall_times.feature`.
- ✅ FR3 — `MeetingRangeInput.tsx:25-32,91-98` (both fields invalid, one message per outcome); keys at `ru.json`/`en.json:126-128`; `MeetingRangeInput.test.tsx`; `grid_view_meeting_range_input_unit.feature:39-51`.
- ✅ FR4 — `getMinutesAfterTrackStep` (`dayTrack.ts:113`), limits at `meetingRange.ts:92-107`; `meeting_range_any_minute.feature` "Moves from an end off the track step", "A drag lands an off-step end on the track step"; E2E "Arrow keys bring an off-step end onto the track step".
- ✅ FR5 — `moveMeetingRangeToDay` keeps the given start (`meetingRange.ts:193`); `meetingRange.test.ts:167-171`; "Next day keeps a meeting off the track step".
- ✅ FR6 — `formatTypedWallTimeText.ts:29`, `typedTimeFieldText.ts:23`, wired at `WallTimeInput.tsx:78` and `MeetingRangeInput.tsx:119,130`; unit and E2E separator features.
- ✅ FR7 — `useVisibleStripRows.ts:17-37,47-91`, `meetingHandleRow.ts:18`, `GridView.tsx:44-49` (frozen while a handle is dragged); `useVisibleStripRows.test.tsx`; E2E "Handles stay on screen in a long list". It also measures with no meeting range set; see R2.
- ✅ FR8 — `w-11` hit area (`MeetingHandle.tsx:101`), press-relative drag, click guard and `touchend` `preventDefault` (`useMeetingHandleDrag.ts:58-63,117-135,154`); unit BDD "A click after a handle drag is not a tap", "Finger drag without Pointer Events"; E2E "A press beside the grip drags the handle", "Press and release without movement".
- ❌ NFR-P1 — the first half is met: one pending frame (`useVisibleStripRows.ts:72-76`) and the unchanged-run bail-out (`:62-68`) exist and are tested ("Scrolling re-places the handles cheaply"). The second half, "re-renders a handle only when its row changes", is not: both `MeetingHandleSlider`s re-render, and re-run their layout effect, on every change of the candidate run, even when `getMeetingHandleRow` gives the same row (`MeetingHandle.tsx:53-89`, R1). The Grid view is also measured and re-rendered on scroll with no meeting range set (R2).
- ✅ NFR-A1 — `grid_view_meeting_range_messages_e2e.feature:24-29` (axe, 3 messages × 2 themes); `aria-invalid` and `aria-describedby` asserted in `MeetingRangeInput.test.tsx`.
- ✅ NFR-A2 — slider role and values at `MeetingHandle.tsx:107-120`; E2E "Slider values off the track step" (545, `09:05`) and the hit-area scenario.
- ✅ NFR-R1 — E2E "Handles stay on screen in a long list" checks the handle box inside the viewport and above `DATE_BAR_SELECTOR`, and the topmost element, at 390 × 844 and 844 × 390, top, middle and bottom.
- ✅ NFR-R2 — the approved-screenshot scenarios are unchanged and pass; H2 lists no re-written baseline.
- ✅ UX1 — "the caret is after the last character" (`time_selection_time_separator_e2e.feature:17`) and "Backspace removes the separator"; `WallTimeInput.test.tsx:134` checks `selectionStart` 5.
- ✅ UX2 — grip `h-9 w-3` unchanged (`MeetingHandle.tsx:122`), pinned in `MeetingHandle.test.tsx:46`.
- ✅ UX3 — the three messages (`ru.json`/`en.json:126-128`) have no "step" or "invariant"; texts asserted in `grid_view_meeting_range_input_unit.feature:48-51`.
- ✅ M1 — the 5 pairs of `grid_view_meeting_range_input_unit.feature:26-30` (with titles, «Встреча · 5 мин» included) and Almaty `905`–`928` in `time_selection_time_separator_e2e.feature`.
- ✅ M2 — rows `10/10`, `12/10`, `22/2`, New York `13/14` of `grid_view_meeting_range_input_unit.feature:48-51`, each with "the meeting range is still 09:00–11:00".
- ⚠️ M3 — `1030`, `930`, `0930`, `2359`, `12345` are typed only in the wall-time input (`time_selection_time_separator_e2e.feature:22-26`, same rows in the unit feature). The meeting range fields get only `905` and `1130`, so "in both input kinds" is not measured; see R4.
- ✅ M4 — E2E "Handles stay on screen in a long list", 3 positions × 2 handles at 390 × 844.
- ✅ M5 — E2E "A press beside the grip drags the handle" (09:00–12:00), "Press and release without movement" (09:00–11:00); unit BDD "Finger drag without Pointer Events" (09:00–11:00, `touchend` default prevented).
- ✅ M6 — `meeting_range_any_minute.feature` rows: 09:05–11:00 start next / previous step, and 09:00–09:05 end Home.
- ✅ M7 — measured in this review: lowest changed file 91.8 % (`useVisibleStripRows.ts`), all others ≥ 95.0 % (see Mutation).
- ✅ Scenario: Tap on column 9 — `grid_view_meeting_unit.feature`, `grid_view_meeting_e2e.feature`.
- ✅ Scenario: Enter on an hour strip — `grid_view_meeting_unit.feature`, `grid_view_meeting_e2e.feature`.
- ✅ Scenario: Handles of the sample meeting — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Handles stay on screen in a long list — `grid_view_meeting_handle_reach_e2e.feature`.
- ✅ Scenario: Handle rows among the visible rows — `grid_view_meeting_handle_reach_unit.feature`, `meetingHandleRow.test.ts`.
- ⚠️ Scenario: Scrolling re-places the handles cheaply — `grid_view_meeting_handle_reach_unit.feature:19-24` covers one frame and the unchanged run, but not a run change that keeps the handle rows, which today re-renders both handles (R1).
- ✅ Scenario: Drag the end handle one hour right — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Drag the start handle past the end — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Finger drag without Pointer Events — `grid_view_meeting_handle_reach_unit.feature`.
- ✅ Scenario: A press beside the grip drags the handle — `grid_view_meeting_handle_reach_e2e.feature`.
- ✅ Scenario: Press and release without movement — `grid_view_meeting_handle_reach_e2e.feature`.
- ✅ Scenario: A click after a handle drag is not a tap — `grid_view_meeting_handle_reach_unit.feature`.
- ✅ Scenario: Dragging the end handle to the right edge on a phone — `grid_view_meeting_handles_e2e.feature` (retagged `@FR8`, grab-offset step).
- ✅ Scenario: Dragging the start handle to the left edge on a phone — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: The hour frame comes back into view after Clear — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Slider values of the handles — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Slider values off the track step — `grid_view_meeting_handle_reach_e2e.feature`.
- ✅ Scenario: Keys on the handles — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Arrow keys bring an off-step end onto the track step — `grid_view_meeting_handle_reach_e2e.feature`.
- ✅ Scenario: The hit area is at least 44 by 44 px — `grid_view_meeting_handle_reach_e2e.feature` ("The hit area of the <handle> handle is at least 44 by 44 px", 2 examples).
- ✅ Scenario: Type the meeting in another location's time — `grid_view_meeting_range_input_unit.feature`.
- ✅ Scenario: A meeting at any minute (grid-view) — `grid_view_meeting_range_input_unit.feature:19-30`, `time_selection_time_separator_e2e.feature`.
- ✅ Scenario: Twelve-hour texts — `grid_view_meeting_range_input_unit.feature`.
- ✅ Scenario: Wrong input keeps the input open — `grid_view_meeting_range_input_unit.feature:39-51`.
- ✅ Scenario: Esc closes the input without a change — `grid_view_meeting_range_input_unit.feature`.
- ✅ Scenario: No accessibility violations with each range message — `grid_view_meeting_range_messages_e2e.feature`.
- ✅ Scenario: A stored list never carries a meeting range — `meeting_range_commands.feature`.
- ✅ Scenario: A meeting at any minute (meeting-range) — `meeting_range_any_minute.feature`.
- ✅ Scenario: Set a two-hour meeting — `meeting_range_commands.feature`.
- ✅ Scenario: Invalid ranges are refused — `meeting_range_commands.feature` (`04:10:30Z` row).
- ✅ Scenario: Clear keeps the moment pinned — `meeting_range_commands.feature`.
- ✅ Scenario: Commands that remove the range — `meeting_range_commands.feature`.
- ✅ Scenario: Next day keeps the meeting — `meeting_range_commands.feature`.
- ✅ Scenario: Next day keeps a meeting off the track step — `meeting_range_any_minute.feature`.
- ✅ Scenario: A shorter day clamps the end — `meeting_range_commands.feature`.
- ✅ Scenario: Keyboard moves of the handles — `meeting_range_handles.feature`.
- ✅ Scenario: Moves from an end off the track step — `meeting_range_any_minute.feature`.
- ✅ Scenario: A drag cannot cross the other end — `meeting_range_handles.feature`.
- ✅ Scenario: A drag lands an off-step end on the track step — `meeting_range_any_minute.feature`.
- ✅ Scenario: Wall-clock times of any location set the range — `meeting_range_wall_times.feature`.
- ✅ Scenario: Times that break the invariants are refused — `meeting_range_wall_times.feature`.
- ✅ Scenario: The whole reference day — `meeting_range_wall_times.feature` (`MEETING_START_EQUALS_END`).
- ✅ Scenario: Digits typed one by one — `time_selection_time_separator_unit.feature:6`, `time_selection_time_separator_e2e.feature:13`.
- ✅ Scenario: Texts left as typed — `time_selection_time_separator_unit.feature:23`.
- ✅ Scenario: Backspace removes the separator — unit (`:37`) and E2E (`:32`) separator features.
- ✅ Scenario: A pasted time gets its separator — `time_selection_time_separator_unit.feature:45`.
- ✅ Scenario: A typed time with the separator is confirmed — `time_selection_time_separator_e2e.feature:42`.
- ✅ Scenario: Rejected texts stay rejected — unit (`:51`) and E2E (`:49`) separator features, `130` included.

## Mutation

Measured in this review with three scoped Stryker runs of at most five files each, one at a time (`cd packages/client && npx stryker run --mutate '…'`). Results were read from `reports/mutation/mutation-report.json` after each run.

| File | Score | Survivors |
|---|---|---|
| `src/model/meetingRange.ts` | 98.68 % | 1 (`:201` `<` → `<=` in the end clamp of `moveMeetingRangeToDay`, equivalent: the clamp yields the same instant) |
| `src/model/dayTrack.ts` | 100 % | 0 |
| `src/model/reduceMeetingRangeWallTimes.ts` | 95.45 % | 3 (`:92` `<` → `<=`, equivalent after the `=== 0` return at `:89`; `:74` and `:108`, the unchanged `instanceof RangeError` re-throws) |
| `src/presenter/formatTypedWallTimeText.ts` | 100 % | 0 |
| `src/controller/useMeetingRange.ts` | 96.43 % | 2 (`:112-113`, the unchanged `catch` block of `meeting`) |
| `src/views/shared/typedTimeFieldText.ts` | 100 % | 0 |
| `src/views/shared/WallTimeInput.tsx` | 100 % | 0 |
| `src/views/shared/MeetingRangeInput.tsx` | 100 % | 0 |
| `src/views/grid/meetingHandleRow.ts` | 100 % | 0 |
| `src/views/grid/useVisibleStripRows.ts` | 91.80 % | 5 (`:27` `<=` → `<` at the date bar edge; `:83` guard before `cancelAnimationFrame`: `false`, `true`, `===`; `:85` empty event name when the `resize` listener is removed; see R3) |
| `src/views/grid/useMeetingHandleDrag.ts` | 95.08 % | 6 (`:89`, `:138`, `:148`, `:157`, `:179-180`: guards and cleanup paths) |
| `src/views/grid/MeetingHandle.tsx` | 100 % | 0 |
| `src/views/grid/GridView.tsx` | 100 % | 0 |
| `src/app/MainPage.tsx` | 100 % | 0 |
| `src/views/grid/useHourStripScroll.ts` | 98.51 % | 1 no coverage (`:32`, the unchanged default parameter) |

Run totals: 97.76 %, 97.55 % and 97.11 %. `src/model/locationCommands.ts` and the `src/constants/*.ts` files only gain enum members and constants, so they were not mutated. Every file is above the 90 % minimum. Only `useVisibleStripRows.ts` is below the 95 % target.

## Findings

### R1 — CRITICAL — Handles re-render when the candidate run changes but their rows do not
- Location: `packages/client/src/views/grid/MeetingHandle.tsx:53-89`
- Rule: NFR-P1 of the change ("Re-placing the handles on scroll (FR7) re-measures the strips at most once per animation frame and re-renders a handle only when its row changes."); `grid-view` delta → "Meeting handles on the frame" (`specs/grid-view/spec.md:22`): "Re-placing the handles MUST measure the strips at most once per animation frame and MUST re-render a handle only when its row changes."
- Problem: As D5 prescribes, `useVisibleStripRows` publishes the candidate run `{ firstRow, lastRow }` into `GridView` state (`GridView.tsx:45-49`), and `GridView` passes it to both `MeetingHandleSlider`s (`GridView.tsx:54-61,83-87`). `MeetingHandleSlider` is a plain function component that takes `candidateRows` and works out its row inside (`MeetingHandle.tsx:74`). So every change of the run re-renders both handles, even when `getMeetingHandleRow` gives the same row. Each re-render also runs their `useLayoutEffect`, which has no dependency list (`MeetingHandle.tsx:77-88`), so it re-reads the strip and panel rects and re-creates its `ResizeObserver`. For example, the run grows from `{ 1, 5 }` to `{ 1, 6 }` because one more row fits after a small scroll. The end handle stays on row 3 and the start handle on row 4, yet both re-render. This case is untested. The unit BDD scenario "Scrolling re-places the handles cheaply" (`grid_view_meeting_handle_reach_unit.feature:19-24`) and the delta scenario (`spec.md:59-63`) only check a scroll that leaves the candidate run unchanged.
- Impact: A MUST of the change's own spec and the second half of NFR-P1 are not met, so NFR-P1 is unmet. While a meeting range is set and a long list scrolls, about every other run change re-renders both handles and forces two extra layout reads on frames where neither handle moves. No test would catch a regression of the bound.
- Fix: Keep D5's wiring unchanged: the hook still returns the candidate rows, `GridView` still calls it once and passes them to both sliders, and `setState` still runs only on a run change. In `MeetingHandle.tsx`, `MeetingHandleSlider` then only computes `rowNumber = getMeetingHandleRow(handle, candidateRows)` and renders a `memo`-wrapped inner component. That component takes `rowNumber` instead of `candidateRows` and holds today's body (drag hook, layout effect, markup). Its other props already keep their identity between such renders:
  - `presented` comes from the `meeting` `useMemo` at `controller/useMeetingRange.ts:92-124`, whose dependencies (`state`, `language`, `hourFormat`, `t`, `clock`) do not change on scroll;
  - `onMoveHandle` and `onDragHandleTo` come from the `actions` `useMemo` of the same hook (`:200`);
  - `onDragActiveChange` is a `useState` setter;
  - `cellPitchPx` and `isScrollable` are primitives.

  Through `/opsx:update`, add this line to the `grid-view` delta scenario "Scrolling re-places the handles cheaply" (`spec.md:59-63`): "AND a scroll that changes the candidate rows but not the handle rows re-renders no meeting handle". Add the same case to tasks.md 4.5. Then add to that scenario in `grid_view_meeting_handle_reach_unit.feature` a step `When a scroll changes the candidate rows but not the handle rows`, followed by the existing `Then no meeting handle is rendered again`. Define the new `When` in `steps/grid_view_meeting_handle_reach_unit.steps.tsx`, with the stubbed rects scrolled so that the run changes and the handle rows stay, and reuse the existing `Then`, which asserts through the `panelReads` counter (`:44`, `:65`, `:164-165`).
- Fix risk: The memo works only while its props keep their identity. If a later change passes an inline callback, the bail-out silently stops working; the new BDD step guards against that. A render that the memo skips no longer runs the inner layout effect. A row height change still re-measures through the effect's `ResizeObserver` on the panel. Rows are locked while a meeting range is set (`areRowControlsLocked`, `GridView.tsx:95`), so no reorder can keep the row number while the strip under it changes. `MeetingHandle.tsx` grows from 126 to about 140 lines, under the 200-line target; the steps file grows from 239 to about 255 lines, under the 300-line hard cap of `process-invariants.md`.
- Status: fixed
- Resolution: `MeetingHandleSlider` now only computes the row and renders a `memo`-wrapped `MeetingHandleView` taking `rowNumber`; covered by the new unit BDD scenario "A change of the candidate rows that keeps the handle rows renders no handle" (failed red before). The spec/tasks.md lines are outside this stage's remit and were left untouched.

### R2 — WARNING — Visible rows are measured, and the whole Grid view re-renders on scroll, with no meeting range set
- Location: `packages/client/src/views/grid/GridView.tsx:44-49`
- Rule: — (no rule file covers it; the work is outside what FR7 asks for: "While a meeting range is set and the grid has rows, the two meeting handles stand on the candidate rows")
- Problem: `GridView` calls `useVisibleStripRows(panelElement, strips.size, isHandleDragging)` on every render. Nothing in that call depends on `hasMeetingRange` (`GridView.tsx:29`), even though the result (`candidateRows`) is used only by the two `MeetingHandleSlider`s, which exist only while a meeting range is set (`GridView.tsx:80-87`). So with no meeting range, the hook still adds its `window` `scroll` and `resize` listeners and its `ResizeObserver` (`useVisibleStripRows.ts:78-81`). On every scroll frame it reads the rect of every `[data-hour-strip]` and of the date bar (`:21-30`). Each time a row enters or leaves the run, it calls `setCandidateRows` (`:70`). That state lives in `GridView`, and no grid component is memoised, so every hour strip of every row re-renders for a value no element uses.
- Impact: In the most common state of the Grid view (no meeting range), scrolling a 12-location list on a phone forces a layout read of all strips on every animation frame. It also re-renders the whole grid about twice per row scrolled past (once when `firstRow` changes, once when `lastRow` changes). Before this branch, scrolling the Grid did no such work. No requirement forbids it outright (NFR-P1 bounds the re-placing of handles, and there are no handles here), so this is a performance defect, not an unmet requirement. No test would catch it: every hook and BDD case sets a meeting range first.
- Fix: In `GridView.tsx:45-49`, pass `isHandleDragging || !hasMeetingRange` as the hook's `isFrozen`. The hook then registers nothing and keeps its last value while no meeting range is set (`useVisibleStripRows.ts:57`). It measures again as soon as a range is set, which the existing case "should measure again when the freeze ends" (`useVisibleStripRows.test.tsx:143`) already pins. D5's signature (panel, row count, `isFrozen`) and its "called once in `GridView`" wiring stay as they are. Change the hook's `useEffect` (`useVisibleStripRows.ts:56`) to `useLayoutEffect`, as `MeetingHandle.tsx` already does for its own measurement. Then the first measurement after a range is set happens before the handles are painted. Pin the guard with a scenario "Scrolling without a meeting range measures no strip", tagged `@refine-meeting-range-entry-and-handles @FR7`, in `grid_view_meeting_handle_reach_unit.feature`, with steps in `steps/grid_view_meeting_handle_reach_unit.steps.tsx`: open the Grid with 12 locations and no meeting, `scrollBy` a few rows, `flushFrame`, and assert that the existing `dateBarReads` counter did not change (each measurement reads the date bar once, `useVisibleStripRows.ts:10`). Add the matching scenario under "Meeting handles on the frame" in the `grid-view` delta and a bullet in tasks.md 4.5 through `/opsx:update`, in the same pass as R1.
- Fix risk: With the fix, the hook keeps a stale run while no meeting range is set. If its first measurement stayed in `useEffect`, the handles of a newly set range could paint for one frame on the run measured the last time a range was set. The switch to `useLayoutEffect` removes that, and its `setState` re-renders before paint. The existing hook tests use `renderHook` and work with either effect. The new steps add about 15 more lines to the steps file; with R1's step it stays under the 300-line hard cap (about 270 lines).
- Status: fixed
- Resolution: `GridView` passes `isHandleDragging || !hasMeetingRange` as `isFrozen`, and the hook measures in `useLayoutEffect`; covered by the new unit BDD scenario "Scrolling without a meeting range measures no strip" (red before). Spec/tasks.md additions are outside this stage's remit.

### R3 — SUGGESTION — The listener cleanup and the date bar edge of the visible rows are untested
- Location: `packages/client/src/views/grid/useVisibleStripRows.ts:82-87`
- Rule: `.claude/rules/tdd-workflow.md` ("Target mutation score: >=95%. Minimum acceptable: >=90%.")
- Problem: Scoped Stryker scores this file 91.8 % with 5 survivors. Four are in the effect's cleanup: the three mutants of the guard `if (pendingFrame !== undefined) window.cancelAnimationFrame(pendingFrame)` (`:83`) and the empty event name in `window.removeEventListener("resize", …)` (`:85`). The fifth is `<=` → `<` at `:27`: no case puts a handle box exactly on the date bar's top. No test unmounts the hook and checks that the pending frame is cancelled or that a later `resize` schedules nothing.
- Impact: A regression that leaks the `window` `resize` listener or a pending frame after the Grid view unmounts (a switch to Cards) would pass every test. The leaked listener would keep measuring a detached panel on every resize. The `:27` boundary decides whether a row whose handle exactly touches the date bar is a candidate. FR7 counts a box that touches it as inside, and nothing pins that. Today's code is correct; only the tests are missing. The file is above the 90 % minimum, so this is not a WARNING.
- Fix: Add two cases to `src/views/grid/useVisibleStripRows.test.tsx`, using the `requestAnimationFrame`/`cancelAnimationFrame` spies it already installs (`:51-55`):
  - Render the hook, schedule a frame with a `scroll` event, then unmount. Assert that `cancelAnimationFrame` was called with the pending id. Then dispatch `resize` and assert that `requestAnimationFrame` was not called again.
  - A strip whose centred 48 px handle ends exactly at the date bar's top is a candidate.

  Re-run `npx stryker run --mutate 'src/views/grid/useVisibleStripRows.ts'`.
- Fix risk: none. The fix is test-only and uses the stubs the file already has.
- Status: fixed
- Resolution: Added cases to useVisibleStripRows.test.tsx for the exact date bar edge, cancel on unmount, no listener after unmount and no cancel without a pending frame; Stryker on the file now 100%.

### R4 — SUGGESTION — M3's digit sequences are not measured in the meeting range input
- Location: `packages/client/src/test/features/time_selection/time_selection_time_separator_e2e.feature:20-29`
- Rule: — (no rule file covers success metrics; the measurement is named by M3 of the proposal, which reads: "Typed digit by digit, 5 of 5 sequences show the expected text in both input kinds: `1030` → `10:30`, `930` → `9:30`, `0930` → `09:30`, `2359` → `23:59`, `12345` → `12:345`.")
- Problem: The five M3 sequences are typed only in the wall-time input (`:22-26`, and the same rows in `time_selection_time_separator_unit.feature`). The fields of the meeting range input are typed only with `905` and `1130` (`:28-29`). `MeetingRangeInput.test.tsx` adds only those two cases too. The metric's "both input kinds" half has no measurement.
- Impact: M3 cannot be reported as met from the tests. A wiring regression in only one meeting range field, for example `onChange` of the end field passing the wrong previous text (`MeetingRangeInput.tsx:130`), would surface only for the sequences that field is typed with.
- Fix: Add an `it.each` over the five M3 sequences × the start and end fields to `src/views/shared/MeetingRangeInput.test.tsx`, typing with `@testing-library/user-event` over the selected text, as the existing `905`/`1130` cases do. Mark it `// Verifies M3, FR6 of refine-meeting-range-entry-and-handles.` This is a Vitest case, so the Gherkin scenario and the delta spec stay as they are.
- Fix risk: none. The fix adds 10 test cases to a file of 233 lines; if that pushes it past 300, put them in a new `MeetingRangeInput.separator.test.tsx`.
- Status: fixed
- Resolution: Added an it.each of the five M3 sequences over the start and end fields in MeetingRangeInput.test.tsx, marked `Verifies M3, FR6`.


## Verdict

Not ready — blocked by R1 (CRITICAL): NFR-P1 and the `grid-view` delta's "MUST re-render a handle only when its row changes" are not met, because both meeting handles re-render on every change of the candidate run. R2 (WARNING) should be fixed in the same pass. R3 and R4 are optional test additions.
