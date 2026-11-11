# Review: refine-meeting-range-entry-and-handles

## Summary

| Item | Value |
|---|---|
| Tasks verified | 23/23 |
| Requirements traced | 69/71 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 Glossary — `docs/glossary/time-selection.md:23` ("at any whole minute", `MEETING_START_EQUALS_END`, `MEETING_END_BEFORE_START`), `:25` (Meeting handle "onto the track step", `getMeetingHandleRow`, `useVisibleStripRows`), `:30` (separator, `formatTypedWallTimeText`), `:13` (`getMinutesAfterTrackStep`); `docs/glossary/date-selection.md:5` (`DATE_BAR_SELECTOR`); file is 32 lines.
- ✅ 1.2 Architecture docs — `docs/architecture/domain-model.md:58` ("whole minutes inside the reference day"), `:75` (both new error codes); `docs/architecture/views.md:42` and `docs/architecture/overview.md:21` cite ADR-0013; no "on the track step of the reference day" left.
- ✅ 2.1 RED tests — `src/model/meetingRange.test.ts` (validity, limits of 09:00–09:05, off-step moves, `moveMeetingRangeToDay` 09:05–09:28 at `:254`), `src/model/dayTrack.test.ts` (`getMinutesAfterTrackStep` cases).
- ✅ 2.2 GREEN D1 — `src/model/dayTrack.ts:113` exports `getMinutesAfterTrackStep`, used by `getInstantAfterTrackMove` (`:133`) and `getMeetingRangeAfterHandleMove` (`src/model/meetingRange.ts:142`); `isOnWholeMinute` at `meetingRange.ts:50`; minimum length `Math.min(TRACK_STEP_MINUTES, …)` at `:94`; step floor removed from `moveMeetingRangeToDay` (`:193`).
- ✅ 2.3 Wall-clock refusals — `src/model/locationCommands.ts:42-43` (two codes); `src/model/reduceMeetingRangeWallTimes.ts:88-101` (equal → `MEETING_START_EQUALS_END`, `getShownDayRefusal` at `:31`); table tests in `reduceMeetingRangeWallTimes.test.ts`.
- ✅ 2.4 Existing unit BDD updated — `meeting_range_commands.feature` (`04:10:30Z` row), `meeting_range_wall_times.feature` (new tables, whole day → `MEETING_START_EQUALS_END`), steps updated.
- ✅ 2.5 New unit BDD — `src/test/features/meeting_range/meeting_range_any_minute.feature` (4 scenarios, `@FR1`, `@FR5`, `@FR4`) with `steps/meeting_range_any_minute.steps.ts`.
- ✅ 3.1 Separator rule — `src/presenter/formatTypedWallTimeText.ts:29`, constants at `src/constants/timeSelection.ts:127-139`, exported through `constants/index.ts` and `presenter/index.ts`; `formatTypedWallTimeText.test.ts` (`it.each`).
- ✅ 3.2 Outcomes and messages — `src/controller/useMeetingRange.ts:43-48` (three outcomes), `OUTCOME_OF_REFUSAL` at `:54`; `src/views/shared/MeetingRangeInput.tsx:25` (`RANGE_ERROR_KEYS`); three keys in `ru.json`/`en.json` lines 126-128; `grep -rn "INVALID_RANGE\b\|шагом 15 минут\|15-minute steps" src` prints nothing.
- ✅ 4.1 Separator in the views — `src/views/shared/typedTimeFieldText.ts:57`, used in `WallTimeInput.tsx:78` and both fields of `MeetingRangeInput.tsx:119,130`; tests `typedTimeFieldText.test.ts`, `WallTimeInput.test.tsx`, `MeetingRangeInput.test.tsx`.
- ✅ 4.2 Unit BDD of the input — `grid_view_meeting_range_input_unit.feature` ("A meeting at any minute" 5 rows, "Wrong input…" 5 rows); new `time_selection/time_selection_time_separator_unit.feature` with steps.
- ✅ 4.3 Handle rows — `src/views/grid/meetingHandleRow.ts:109` (`{ firstRow, lastRow }`), `src/views/grid/useVisibleStripRows.ts:47`, `MEETING_HANDLE_HEIGHT_PX` (`constants/meeting.ts:158`), `DATE_BAR_SELECTOR` (`constants/date.ts:40`), `data-date-bar` (`app/MainPage.tsx:67`), wiring `GridView.tsx:44-61`; tests `meetingHandleRow.test.ts`, `useVisibleStripRows.test.tsx`, `MainPage.test.tsx`.
- ✅ 4.4 Hit area, grab offset, release — `MeetingHandle.tsx:101` (`w-11`), `useMeetingHandleDrag.ts:58-63` (press-relative minutes), `:117-135` (one-shot capture click guard), `:154` (`touchend` `preventDefault`); `MEETING_HANDLE_RELEASE_CLICK_WINDOW_MS` (`constants/meeting.ts:160`); tests `useMeetingHandleDrag.release.test.tsx`, `useMeetingHandleDrag.test.tsx`, `MeetingHandle.test.tsx`.
- ✅ 4.5 Unit BDD of the handles — `grid_view_meeting_handle_reach_unit.feature` (4 scenarios) with `steps/grid_view_meeting_handle_reach_unit.steps.tsx`.
- ✅ 5.1 E2E handles — `grid_view_meeting_handle_reach_e2e.feature` (on-screen at 3 positions × 2 viewports, press beside grip, press without movement, hit area, off-step values, arrow keys) with steps; `grid_view_layers_e2e.steps.ts` imports `DATE_BAR_SELECTOR`; auto-scroll scenarios of `grid_view_meeting_handles_e2e.feature` retagged and reworded ("keeps its distance from the finger at the press").
- ✅ 5.2 E2E separator and messages — `time_selection/time_selection_time_separator_e2e.feature` with steps; `grid_view/grid_view_meeting_range_messages_e2e.feature` (axe, 6 examples) with steps.
- ✅ 5.3 Existing browser suites — the named scenarios still exist in `grid_view_meeting_handles_e2e.feature`, `time_selection_wall_time_input_e2e.feature` and `grid_view_meeting_lock_e2e.feature`; CI is green.
- ✅ 6.1 Scoped Stryker — re-measured in this review (see Mutation): every changed production file ≥ 91.8 %.
- ✅ 6.2 Build, bundle, legacy build, typecheck, lint, tests — CI green on the branch.
- ✅ 6.3 Screenshots — handoff README H2 records "none re-written"; no `.png` baseline changed in the branch diff.
- ✅ 6.4 Traceability — `grep -rn "refine-meeting-range-entry-and-handles" packages/client/src` yields FR1–FR8, NFR-A1, NFR-A2, NFR-P1, NFR-R1, UX1–UX3; `grep -rn isOnTrackStep packages/client/src` prints nothing.
- ✅ 7.1 Handoff H1 — `handoff/H1-adr-0013-meeting-range-any-minute.patch` passes `git apply --check`; `docs/adr/0013-*` absent; README `## H1` section present.
- ✅ 7.2 Handoff H2 — README `## H2` section with Serves, Files, Verify ("none re-written"), Why manual, Automated part.

## Requirements

- ✅ FR1 — `isOnWholeMinute` in `src/model/meetingRange.ts:50-64`; tests `meetingRange.test.ts`, `meeting_range_any_minute.feature` "A meeting at any minute" (5, 23, 1 minute).
- ✅ FR2 — `src/model/reduceMeetingRangeWallTimes.ts:88-101` and `getShownDayRefusal` `:31-48`; `reduceMeetingRangeWallTimes.test.ts`, `meeting_range_wall_times.feature`.
- ✅ FR3 — `MeetingRangeInput.tsx:25-32,91-98` (both fields invalid, one message per outcome), locale keys in `ru.json`/`en.json`; `MeetingRangeInput.test.tsx`, `grid_view_meeting_range_input_unit.feature` "Wrong input keeps the input open".
- ✅ FR4 — `getMinutesAfterTrackStep` (`dayTrack.ts:113`), limits `meetingRange.ts:92-108`; `meeting_range_any_minute.feature` "Moves from an end off the track step" (8 rows), "A drag lands an off-step end on the track step"; E2E "Arrow keys bring an off-step end onto the track step".
- ✅ FR5 — `moveMeetingRangeToDay` keeps the given start (`meetingRange.ts:193`); `meeting_range_any_minute.feature` "Next day keeps a meeting off the track step".
- ✅ FR6 — `formatTypedWallTimeText.ts`, `typedTimeFieldText.ts`, wired in both inputs; unit and E2E separator features.
- ✅ FR7 — `useVisibleStripRows.ts`, `meetingHandleRow.ts`, `GridView.tsx:44-49` (frozen while dragging); `useVisibleStripRows.test.tsx`, E2E "Handles stay on screen in a long list".
- ✅ FR8 — `w-11` hit area, press-relative drag, click guard and `touchend` `preventDefault` in `useMeetingHandleDrag.ts`; unit BDD "A click after a handle drag is not a tap", "Finger drag without Pointer Events"; E2E "A press beside the grip drags the handle", "Press and release without movement".
- ⚠️ NFR-P1 — one pending frame and an unchanged-run bail-out exist (`useVisibleStripRows.ts:63-76`), but the handles re-render when the candidate run changes and their rows do not; see R1.
- ✅ NFR-A1 — `grid_view_meeting_range_messages_e2e.feature` (axe, 3 messages × 2 themes); `aria-invalid`/`aria-describedby` asserted in `MeetingRangeInput.test.tsx`.
- ✅ NFR-A2 — slider role and values unchanged in `MeetingHandle.tsx:107-120`; E2E "Slider values off the track step" (545 / `09:05`) and hit-area scenario.
- ✅ NFR-R1 — E2E "Handles stay on screen in a long list" checks the box inside the viewport above `DATE_BAR_SELECTOR` and the topmost element, at 390 × 844 and 844 × 390, top/middle/bottom.
- ✅ NFR-R2 — the approved-screenshot scenarios are unchanged and pass; H2 lists no re-written baseline.
- ✅ UX1 — caret at the end and Backspace after `10:` in `time_selection_time_separator_e2e.feature` ("Digits typed one by one", "Backspace removes the separator"); `WallTimeInput.test.tsx` checks `selectionStart` 5.
- ✅ UX2 — grip `h-9 w-3` unchanged (`MeetingHandle.tsx:122`), pinned in `MeetingHandle.test.tsx`.
- ✅ UX3 — the three messages in `ru.json`/`en.json` have no "step" or "invariant"; asserted texts in `grid_view_meeting_range_input_unit.feature`.
- ✅ M1 — the 5 typed pairs in "A meeting at any minute" of `grid_view_meeting_range_input_unit.feature` plus Almaty `905`–`928` in `time_selection_time_separator_e2e.feature`.
- ✅ M2 — rows `10/10`, `12/10`, `22/2`, New York `13/14` in "Wrong input keeps the input open"; `useMeetingRange.input.test.tsx` checks the range stays 09:00–11:00.
- ✅ M3 — `1030`, `930`, `0930`, `2359`, `12345` among the 8 examples of "Digits typed one by one" (unit and E2E).
- ✅ M4 — E2E "Handles stay on screen in a long list", 3 positions × 2 handles at 390 × 844.
- ✅ M5 — E2E "A press beside the grip drags the handle" (09:00–12:00), "Press and release without movement"; unit BDD "Finger drag without Pointer Events" (09:00–11:00, `touchend` default prevented).
- ✅ M6 — `meeting_range_any_minute.feature` rows 09:05–11:00 start next/previous step and 09:00–09:05 end Home.
- ✅ M7 — measured in this review: lowest changed file 91.8 % (`useVisibleStripRows.ts`), all others ≥ 95.1 % (see Mutation).
- ✅ Scenario: Tap on column 9 — `grid_view_meeting_unit.feature`, `grid_view_meeting_e2e.feature`.
- ✅ Scenario: Enter on an hour strip — `grid_view_meeting_unit.feature`, `grid_view_meeting_e2e.feature`.
- ✅ Scenario: Handles of the sample meeting — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Handles stay on screen in a long list — `grid_view_meeting_handle_reach_e2e.feature`.
- ✅ Scenario: Handle rows among the visible rows — `grid_view_meeting_handle_reach_unit.feature`, `meetingHandleRow.test.ts`.
- ⚠️ Scenario: Scrolling re-places the handles cheaply — `grid_view_meeting_handle_reach_unit.feature` covers one frame and the unchanged run, but not a run change that keeps the handle rows (R1).
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
- ✅ Scenario: The hit area is at least 44 by 44 px — `grid_view_meeting_handle_reach_e2e.feature` ("The hit area of the <handle> handle is at least 44 by 44 px").
- ✅ Scenario: Type the meeting in another location's time — `grid_view_meeting_range_input_unit.feature`.
- ✅ Scenario: A meeting at any minute (grid-view) — `grid_view_meeting_range_input_unit.feature`, `time_selection_time_separator_e2e.feature`.
- ✅ Scenario: Twelve-hour texts — `grid_view_meeting_range_input_unit.feature`.
- ✅ Scenario: Wrong input keeps the input open — `grid_view_meeting_range_input_unit.feature` (5 rows).
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
- ✅ Scenario: Digits typed one by one — `time_selection_time_separator_unit.feature`, `time_selection_time_separator_e2e.feature`.
- ✅ Scenario: Texts left as typed — `time_selection_time_separator_unit.feature`.
- ✅ Scenario: Backspace removes the separator — unit and E2E separator features.
- ✅ Scenario: A pasted time gets its separator — `time_selection_time_separator_unit.feature`.
- ✅ Scenario: A typed time with the separator is confirmed — `time_selection_time_separator_e2e.feature`.
- ✅ Scenario: Rejected texts stay rejected — unit and E2E separator features (`130` included).

## Mutation

Measured in this review with scoped Stryker, three runs of at most five files, one at a time (`cd packages/client && npx stryker run --mutate '…'`), read from `reports/mutation/mutation-report.json`:

| File | Score | Survivors |
|---|---|---|
| `src/model/meetingRange.ts` | 98.7 % | 1 (`:201` `<` → `<=`, equivalent: the clamp yields the same instant) |
| `src/model/dayTrack.ts` | 100 % | 0 |
| `src/model/reduceMeetingRangeWallTimes.ts` | 95.5 % | 3 (`:92` `<` → `<=`, equivalent after the `=== 0` return; `:74`, `:108` the unchanged `instanceof RangeError` re-throws) |
| `src/presenter/formatTypedWallTimeText.ts` | 100 % | 0 |
| `src/controller/useMeetingRange.ts` | 96.4 % | 2 (`:112-113`, unchanged catch block) |
| `src/views/shared/typedTimeFieldText.ts` | 100 % | 0 |
| `src/views/shared/WallTimeInput.tsx` | 100 % | 0 |
| `src/views/shared/MeetingRangeInput.tsx` | 100 % | 0 |
| `src/views/grid/meetingHandleRow.ts` | 100 % | 0 |
| `src/views/grid/useVisibleStripRows.ts` | 91.8 % | 5 (`:27` `<=` → `<` at the date bar edge; `:83` cancel of the pending frame, `:85` removal of the `scroll` listener, see R2) |
| `src/views/grid/useMeetingHandleDrag.ts` | 95.1 % | 6 (`:89`, `:138`, `:148`, `:157`, `:179-180`: guards and cleanup paths) |
| `src/views/grid/MeetingHandle.tsx` | 100 % | 0 |
| `src/views/grid/GridView.tsx` | 100 % | 0 |
| `src/app/MainPage.tsx` | 100 % | 0 |
| `src/views/grid/useHourStripScroll.ts` | 98.5 % | 1 no coverage (`:32`, unchanged) |

`src/model/locationCommands.ts` and the `src/constants/*.ts` files only gain enum members and constants and were not mutated. Every file is above the 90 % minimum; only `useVisibleStripRows.ts` is below the 95 % target.

## Findings

### R1 — WARNING — Handles re-render when the candidate run changes but their rows do not
- Location: `packages/client/src/views/grid/useVisibleStripRows.ts:62-70`
- Rule: NFR-P1 of the change and the `grid-view` delta → "Meeting handles on the frame": "Re-placing the handles … MUST re-render a handle only when its row changes."
- Problem: `useVisibleStripRows` compares and publishes the candidate run `{ firstRow, lastRow }`, and the state lives in `GridView` (`GridView.tsx:45-49`). Any change of the run therefore re-renders `GridView`, every hour strip it renders, and both `MeetingHandleSlider`s (none is memoised), even when `getMeetingHandleRow` gives the same rows. Example: run `{ a, a + 4 }` → `{ a, a + 5 }` (one more row fits at the bottom after a small scroll or a date bar height change) keeps the end handle on row `a + 2` and the start handle on `a + 3`, yet both handles re-render and re-run their `useLayoutEffect` strip measurement (`MeetingHandle.tsx:77-89`). The hook also runs, and re-renders the whole grid on every run change, while no meeting range is set and no handle exists. The unit BDD scenario only checks a scroll that leaves the run unchanged, so this case is not tested.
- Impact: The requirement's re-render bound is not met. During vertical scrolling of a long list, the whole grid re-renders and both handles force a layout read on frames where no handle moves, with or without a meeting. This is the scroll-time work NFR-P1 was written to bound.
- Fix: In `useVisibleStripRows`, derive the two handle rows with `getMeetingHandleRow` from the measured run. Compare those rows with the published ones, and publish (`setState`) only when one of them changed. Return the rows, and pass each slider its row number in place of `candidateRows`. In `GridView`, pass `isHandleDragging || !hasMeetingRange` as `isFrozen` so nothing is measured without a meeting range. The effect already measures synchronously when `isFrozen` turns false. Extend the "Scrolling re-places the handles cheaply" scenario in `grid_view_meeting_handle_reach_unit.feature` and its steps with "When a scroll changes the candidate rows but not the handle rows / Then no meeting handle is rendered again". Add the matching case to `useVisibleStripRows.test.tsx`.
- Fix risk: `useVisibleStripRows.test.tsx`, `meetingHandleFixture.tsx` and `MeetingHandle.test.tsx` pass `candidateRows` today and need their props updated. While no meeting range is set, the hook would keep its last value. When a range is set, the effect's first measurement runs after that commit (`useEffect`), so the handles may paint for one frame on stale rows. Switching that first measurement to `useLayoutEffect` avoids it.
- Status: open

### R2 — SUGGESTION — Cleanup of the visible-row listeners is untested
- Location: `packages/client/src/views/grid/useVisibleStripRows.ts:82-87`
- Rule: `.claude/rules/tdd-workflow.md` ("Target mutation score: >=95%")
- Problem: Scoped Stryker leaves 5 survivors in this file (91.8 %). Among them, removing `cancelAnimationFrame` (`:83`) and emptying the event name of `removeEventListener("scroll", …)` (`:85`) both survive, so no test unmounts the hook and checks that scrolling no longer schedules a measurement.
- Impact: A regression that leaks the `window` scroll listener or a pending frame after the Grid view unmounts (view switch to Cards) would pass every test. The leaked listener would keep measuring a detached panel on every scroll. Today's code is correct; only the guard is missing.
- Fix: Add one case to `src/views/grid/useVisibleStripRows.test.tsx`: render the hook, unmount it with a frame pending, dispatch a `scroll` event, and assert that the stubbed `requestAnimationFrame` was not called again and that `cancelAnimationFrame` was called with the pending id. Re-run `npx stryker run --mutate 'src/views/grid/useVisibleStripRows.ts'`.
- Fix risk: none — test-only, using the stubs the file already has.
- Status: open

## Verdict

Ready — there is no CRITICAL finding, so nothing blocks the merge. R1 (WARNING) should be fixed before merging, so that NFR-P1's re-render bound holds. R2 is optional.
