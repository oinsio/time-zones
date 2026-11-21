# Review: move-meeting-range-and-extend-past-midnight

## Summary

| Item | Value |
|---|---|
| Tasks verified | 43/45 |
| Requirements traced | 147/149 |
| CRITICAL | 1 |
| WARNING | 2 |
| SUGGESTION | 2 |

## Tasks

Paths are relative to `packages/client/` unless they start with `docs/`, `openspec/` or `temporary-docs/`.

- ✅ 1.1 — `temporary-docs/gnomish/github-oinsio-time-zones-155/handoff/H1-adr-0019-meeting-range-past-the-reference-day.patch` exists, `git apply --check` exits 0, `handoff/README.md` has one `## H1`; `docs/adr` and `CLAUDE.md` are untouched.
- ✅ 1.2 — `docs/architecture/overview.md` has the ADR-0019 row (`grep -c` prints 1).
- ✅ 1.3 — `docs/glossary/time-selection.md:43-44` (Strip tail, Meeting move), `:27` (Meeting range with `MOVE_MEETING_RANGE`, `MEETING_RANGE_MAX_MINUTES`), Midnight marker with "its first cell in the strip tail is a midnight cell", Meeting bar with `MEETING_BAR_SELECTOR`; `docs/glossary/locations.md` names `REORDER_TOUCH_ACTIVATION_DELAY_MS`; no `MEETING_END_BEFORE_START` left; file is 44 lines.
- ✅ 1.4 — `docs/architecture/views.md:42` (strip tail), `docs/architecture/domain-model.md:62`; `docs/design/README.md:66` marks parts 2 and 3.
- ✅ 2.1 — `src/model/meetingRange.test.ts`, `src/model/meetingRange.handles.test.ts` (`it.each` rows of the handle tables and limits).
- ✅ 2.2 — `src/model/meetingRange.ts:57-71` (`isValidMeetingRange` with the 24-hour limit), `:105-130` (`getMeetingHandleLimits`), `src/constants/meeting.ts:28` (`MEETING_RANGE_MAX_MINUTES`).
- ✅ 2.3 — `src/model/meetingRange.ts:198-209` (`moveMeetingRangeToDay` keeps the exact length, no clamp); `src/model/reduceReferenceMoment.ts:67`; scenarios in `meeting_range_commands.feature:60` and `meeting_range_past_midnight.feature:48`.
- ✅ 2.4 — `src/model/reduceMeetingRangeWallTimes.ts:68-83` (end on the next date, only the start checked); `src/controller/useMeetingRange.input.test.tsx:100-101` (`[720, 2040]`, `[1320, 1560]`); `meeting_range_wall_times.feature` rows moved.
- ✅ 2.5 — `src/test/features/meeting_range/meeting_range_past_midnight.feature` with `steps/meeting_range_past_midnight.steps.ts`; `meeting_range_commands.feature`, `meeting_range_handles.feature` updated.
- ✅ 3.1 — `src/model/stripTail.ts` (`getStripTailCellCount`), `src/model/hourCells.ts:76-109` (tail argument); `src/model/hourCells.test.ts` (+88 lines).
- ✅ 3.2 — `src/model/hourCellColumns.ts:26-38` (tail column at the next day's start), `src/model/meetingRange.ts:79-98` (`getMeetingRangeOfCells` clamps to the next day and to 24 h).
- ✅ 3.3 — `src/presenter/hourStrip.ts:149-199` (cell-by-cell presentation, day cells kept); `src/presenter/hourStrip.test.ts` (+51).
- ✅ 3.4 — `src/controller/useHourGrid.ts:48-75` (`cellCount` = day + tail); `src/controller/useHourGrid.test.tsx:209-230` (24 and 27); `src/views/grid/hourCellLayout.test.ts:18-20`.
- ✅ 3.5 — `src/test/features/grid_view/grid_view_strip_tail.feature` (five scenarios) with `steps/grid_view_strip_tail.steps.tsx`.
- ✅ 4.1 — `MEETING_END_BEFORE_START`, `END_BEFORE_START` and `rangeInputEndBeforeStartError` are gone from `src` (grep prints nothing); `src/locales/ru.json`/`en.json` carry the new `rangeInputOutsideDayError`.
- ✅ 4.2 — `src/presenter/meetingHandles.test.ts` (+55: maximums 1980/1985, past-midnight sample).
- ✅ 4.3 — `src/views/grid/useMeetingRangeDrag.ts` (core, re-anchoring at `:211-222`); `useMeetingHandleDrag.ts` is a 55-line caller; `src/views/grid/useMeetingHandleDrag.tail.test.tsx:12`.
- ✅ 4.4 — `src/views/grid/useHourCellSelection.ts:83,107` (tail guards), `GridView.tsx:116-118` (frozen tail); `src/views/grid/HourStrip.selectionTail.test.tsx`.
- ✅ 4.5 — `grid_view_meeting_range_input_unit.feature:52` ("A meeting past midnight is typed"), `grid_view_meeting_unit.feature:81` ("A tap on a tail cell changes nothing").
- ✅ 5.1 — `grid_view_meeting_range_messages_e2e.feature:13`, `grid_view_width_e2e.feature:48` (five sizes).
- ✅ 5.2 — `grid_view_meeting_handle_reach_e2e.feature:62` (updated in place), `grid_view_meeting_handles_e2e.feature:74,104,115,126,138,150,162`.
- ✅ 6.1 — `src/app/MainPage.tsx:19-20,72-74` (`sticky top-0 z-meeting-bar`, `data-meeting-bar`), `src/constants/date.ts:55`, `tailwind.config.ts` (`"meeting-bar": "5"`); `src/app/MainPage.test.tsx:212`.
- ✅ 6.2 — `src/views/grid/useVisibleStripRows.ts:17-40` (top edge = meeting bar bottom); `src/views/grid/useVisibleStripRows.test.tsx` (+27).
- ✅ 6.3 — `grid_view_meeting_handle_reach_unit.feature:6` tagged `@FR13`, steps stub `MEETING_BAR_SELECTOR`.
- ✅ 6.4 — `src/app/MainPage.tsx:54-68` (`scroll-padding-top` from a `ResizeObserver`, cleared on cleanup); `src/app/MainPage.test.tsx:181-210`.
- ✅ 6.5 — `grid_view_meeting_move_e2e.feature:11,28,36`; `grid_view_meeting_handle_reach_e2e.feature:11` updated in place with `@FR13`.
- ✅ 7.1 — `src/model/meetingRangeMove.test.ts` (132 lines, `it.each` move tables).
- ✅ 7.2 — `src/model/meetingRangeMove.ts`, `src/model/reduceMeetingRange.ts:75-98` (`reduceMoveMeetingRange`), `src/model/locations.ts:190`, `src/model/locationCommands.ts:110`.
- ✅ 7.3 — `src/model/meetingRange.ts:35` (`MeetingHandle.MOVE`), `src/presenter/meetingHandles.ts:72-79`, `meeting.moveHandle` in both locales, `src/controller/useMeetingRange.ts:168-170`; tests `src/controller/useMeetingRange.test.tsx:100-132`.
- ✅ 7.4 — `src/test/features/meeting_range/meeting_range_move.feature` (six scenarios) with `steps/meeting_range_move.steps.ts`.
- ✅ 8.1 — `src/views/grid/moveHandlePlacement.ts`, `moveHandlePlacement.test.ts`.
- ✅ 8.2 — `src/views/grid/useMoveHandlePlacement.ts` (rAF-throttled, cleaned up); `useMoveHandlePlacement.test.tsx:79` ("measure once for three scroll events").
- ✅ 8.3 — `src/views/grid/MoveHandle.tsx:60-89` (grip `h-3 w-9`, hit area `h-11 w-12`, `fixed z-move-handle`, keys), `tailwind.config.ts` (`"move-handle": "6"`), `src/styles/tokens.css` (`--meeting-lift-shadow`); `src/views/grid/MoveHandle.test.tsx`.
- ❌ 8.4 — `src/views/grid/useMeetingFrameMove.ts` and the guards in `useHourCellSelection.ts:70-81,91-94` exist with tests, but the clause "on fitting strips a finger that enters another cell before the hold makes a cell drag and cancels the hold" is not built: the hold is cancelled only by the 5 px tolerance (`useMeetingFrameMove.ts:143-157`), never by a cell change, and no test covers it (R2).
- ✅ 8.5 — `src/views/grid/GridView.tsx:62-77,128-139` (frame move wired, `isHandleDragging` frozen during a move), `MeetingFrame.tsx:25` (`data-moving`), `HourCellView.tsx:59-61` (grab cursor).
- ✅ 8.6 — `grid_view_meeting_move_unit.feature:6,12,18,26,32` and `grid_view_meeting_move_budget.feature:6` ("A move step is bounded") with steps.
- ✅ 8.7 — `grid_view_meeting_move_e2e.feature:46-249` (all listed scenarios); `grid_view_meeting_lock_e2e.feature:5` tagged `@NFR-A1`, step tabs until «Move meeting».
- ✅ 8.8 — `src/test/benchmarks/meetingRange.bench.ts:65`, `src/test/benchmarks/hourStrip.bench.ts:107`, both carry the `Verifies NFR-P1` line.
- ❌ 9.1 — the six new baselines of "Approved screenshots of the moved and extended meeting" and the `docs/design/screens` copies exist, but the eight baselines of "Approved screenshots of the meeting state" were not re-taken: none of `src/test/features/__screenshots__/chromium/Approved-screenshots-of-the-meeting-state-*.png` changed on this branch (last commit 38d67d9, 2026-11-19) (R1).
- ✅ 9.2 — `grid_view_meeting_contract_e2e.feature:27` ("Move a meeting range").
- ✅ 10.1 — scoped Stryker runs measured in this review: every model and presenter file of the task ≥ 96 % (see Mutation).
- ✅ 10.2 — `pnpm run build` and `pnpm check:bundle-size` exit 0 in this review (initial JS 150.0 KB gzipped, budget 150 KB, not raised).
- ✅ 10.3 — the `grid_view_meeting*` E2E features are updated in place; CI is green for the branch (not re-run here).
- ✅ 10.4 — the traceability grep of the task prints a line for every id FR1–FR20, NFR-P1, NFR-A1–A3, NFR-R1–R2, UX1–UX4.
- ✅ 10.5 — `grep -rniE "thumb|knob|timeline|hour bar|selection frame"` over the listed paths prints nothing (other *Never:* words: R4).

## Requirements

- ✅ FR1 — `src/model/meetingRange.ts:57-71`; `meeting_range_past_midnight.feature:6` (`@FR1`), `src/model/meetingRange.test.ts`.
- ✅ FR2 — `src/model/reduceMeetingRange.ts` (`reduceSetMeetingRange` through `isValidMeetingRange`); `meeting_range_past_midnight.feature:19`, `meeting_range_commands.feature:20`.
- ✅ FR3 — `src/model/reduceMeetingRangeWallTimes.ts:68-83`; `src/model/reduceMeetingRangeWallTimes.test.ts`, `meeting_range_wall_times.feature:6`.
- ✅ FR4 — `src/model/meetingRange.ts:101-125`; `meeting_range_past_midnight.feature:26,42`, `grid_view_meeting_handles_e2e.feature:104,115`.
- ✅ FR5 — `src/model/meetingRange.ts:198-209`; `meeting_range_commands.feature:60`, `meeting_range_past_midnight.feature:48`.
- ✅ FR6 — `src/model/stripTail.ts`, `src/model/hourCells.ts`, `src/controller/useHourGrid.ts:48-75`; `grid_view_strip_tail.feature:6,21`.
- ✅ FR7 — `src/model/hourCells.ts:91-97` (same builder for tail cells); `grid_view_strip_tail.feature:27,39`.
- ✅ FR8 — `src/controller/useHourGrid.ts:74` (`cellCount` with tail); `grid_view_width_e2e.feature:48`, `hourCellLayout.test.ts:18-20`.
- ✅ FR9 — `src/model/meetingRange.ts:79-98`, `src/views/grid/useHourCellSelection.ts:83,107`; `grid_view_meeting_handles_e2e.feature:126,138,150`, `HourStrip.selectionTail.test.tsx`.
- ✅ FR10 — `src/locales/ru.json`/`en.json` `rangeInputOutsideDayError`; `grid_view_meeting_range_input_unit.feature:39`, `grid_view_meeting_range_messages_e2e.feature:13`.
- ✅ FR11 — `src/model/reduceMeetingRange.ts` pins the reference to the start; `meeting_range_past_midnight.feature` (`@FR11`).
- ✅ FR12 — `src/app/MainPage.tsx:19-20,72-74`; `grid_view_meeting_move_e2e.feature:11,28`, `MainPage.test.tsx:212`.
- ✅ FR13 — `src/views/grid/useVisibleStripRows.ts:17-40`; `grid_view_meeting_handle_reach_unit.feature:6`, `grid_view_meeting_handle_reach_e2e.feature:11`.
- ✅ FR14 — `src/model/meetingRangeMove.ts:83-108`, `src/model/reduceMeetingRange.ts:75-98`; `meeting_range_move.feature:6,22,34,47`.
- ✅ FR15 — `src/views/grid/useMeetingFrameMove.ts:89-118`, `useHourCellSelection.ts:70-81`; `grid_view_meeting_move_unit.feature:6,12`, `grid_view_meeting_move_e2e.feature:135`.
- ⚠️ FR16 — `src/views/grid/useMeetingFrameMove.ts:130-170`; `grid_view_meeting_move_e2e.feature:163,175,187,198`; but a finger that enters another cell within the 5 px tolerance and then holds turns its cell drag into a move, against "A finger that moves before the hold does what it did before" (R2).
- ✅ FR17 — `src/views/grid/MoveHandle.tsx`, `moveHandlePlacement.ts`, `useMoveHandlePlacement.ts`; `grid_view_meeting_move_e2e.feature:82,91,109,119,147`.
- ✅ FR18 — `src/views/grid/MoveHandle.tsx:53-58`, `src/presenter/meetingHandles.ts:72-79`; `grid_view_meeting_move_e2e.feature:46,54,73`.
- ✅ FR19 — `MeetingFrame.tsx:25`, `MoveHandle.tsx:66`, `GridView.tsx:62-66,77`; `grid_view_meeting_move_unit.feature:18,26`.
- ✅ FR20 — `src/model/meetingRangeMove.ts:28-44` (end not clamped); `meeting_range_move.feature` (`@FR20`), `grid_view_meeting_move_e2e.feature:222`.
- ✅ NFR-P1 — `src/presenter/hourStrip.ts:149-199`, `useMoveHandlePlacement.ts:45-49`; `grid_view_strip_tail.feature:46`, `grid_view_meeting_move_budget.feature:6`, `grid_view_meeting_move_unit.feature:32`; benchmarks in 8.8.
- ✅ NFR-A1 — `MoveHandle.tsx:73-80` (role, name, value, limits, value text); `grid_view_meeting_move_e2e.feature:46,54,73`, `grid_view_meeting_lock_e2e.feature:5`.
- ✅ NFR-A2 — `MoveHandle.tsx:66,85` (48 × 44 hit area, accent focus ring); `grid_view_meeting_move_e2e.feature:235,249`.
- ✅ NFR-A3 — `src/app/MainPage.tsx:54-68`; `grid_view_meeting_move_e2e.feature:36`, `MainPage.test.tsx:181-210`.
- ✅ NFR-R1 — `grid_view_width_e2e.feature:48`, `grid_view_meeting_screenshots_e2e.feature:28`.
- ✅ NFR-R2 — `grid_view_meeting_move_e2e.feature:11` (844 × 390 row visible).
- ✅ UX1 — `MoveHandle.tsx:87` (`h-3 w-9 rounded bg-meeting`); `MoveHandle.test.tsx:94`, new screenshots `grid_view_meeting_screenshots_e2e.feature:28`.
- ✅ UX2 — `src/views/grid/moveHandlePlacement.ts:13-25`; `moveHandlePlacement.test.ts`, `grid_view_meeting_move_e2e.feature:91`.
- ✅ UX3 — `MoveHandle.tsx:87` (`group-data-[moving]:h-3.5 w-11 shadow-meeting-lift`), `MeetingFrame.tsx:25`; `MoveHandle.test.tsx:101`, screenshot "the range being moved".
- ✅ UX4 — tail cells from the same builder (`hourCells.ts:91-97`); `grid_view_strip_tail.feature:27`, screenshot "with its strip tail".
- ✅ M1 — `grid_view_meeting_range_input_unit.feature:60` (`Almaty | 23 | 2`), `grid_view_width_e2e.feature:55` confirms `23:00`–`02:00`; the refusal no longer exists (task 4.1).
- ✅ M2 — `meeting_range_move.feature:6,22,34,47` (the four move tables).
- ✅ M3 — `meeting_range_move.feature:9,63` ("120 minutes long", "60 minutes long"), `grid_view_meeting_move_e2e.feature:147` ("2 hours long").
- ✅ M4 — `grid_view_meeting_move_e2e.feature:119` (top, middle, bottom at 390 × 844).
- ✅ M5 — `grid_view_meeting_move_e2e.feature:91` (scroll 0, 4, 7, 400).
- ✅ M6 — `grid_view_meeting_move_e2e.feature:249` (two themes × two positions).
- ✅ M7 — `grid_view_width_e2e.feature:48` (five widths).
- ✅ M8 — measured in this review: changed model files 96.1–100 % (Mutation).
- ✅ M9 — `pnpm check:bundle-size` exits 0 in this review, initial JS 150.0 KB of the 150 KB budget, budget file unchanged.
- ✅ Scenario: Four rows of 24 aligned cells — `grid_view_hour_cells_unit.feature` (unchanged, passes).
- ✅ Scenario: Clock change days in the reference zone — `grid_view_hour_cells_unit.feature`.
- ✅ Scenario: Cells in a real layout stand in columns — `grid_view_hour_cells_e2e.feature`.
- ✅ Scenario: Strip tail of a meeting past midnight — `grid_view_strip_tail.feature:6`.
- ✅ Scenario: The tail goes away with the meeting — `grid_view_strip_tail.feature:21`.
- ✅ Scenario: Midnight cells of the sample day — `grid_view_hour_cell_labels.feature`.
- ✅ Scenario: The reference zone's row starts with 0 — `grid_view_hour_cell_labels.feature`.
- ✅ Scenario: English month — `grid_view_hour_cell_labels.feature`.
- ✅ Scenario: Midnight cells of the strip tail — `grid_view_strip_tail.feature:27`.
- ✅ Scenario: All hours fit — `grid_view_width_e2e.feature`.
- ✅ Scenario: Phone in portrait scrolls all strips together — `grid_view_width_e2e.feature`.
- ✅ Scenario: Frame moved out of view is scrolled into view — `grid_view_width_e2e.feature`.
- ✅ Scenario: Strip width with a tail — `grid_view_width_e2e.feature:48`.
- ✅ Scenario: Tap on column 9 — `grid_view_meeting_e2e.feature`, `grid_view_meeting_unit.feature`.
- ✅ Scenario: Enter on an hour strip — `grid_view_meeting_e2e.feature`, `grid_view_meeting_unit.feature`.
- ✅ Scenario: A tap on a tail cell changes nothing — `grid_view_meeting_unit.feature:81`, `grid_view_meeting_handles_e2e.feature:126`.
- ✅ Scenario: Drag from column 9 to column 10 — `grid_view_meeting_e2e.feature`.
- ✅ Scenario: Drag to the left — `grid_view_meeting_e2e.feature`.
- ✅ Scenario: A swipe on a scrolling strip sets nothing — `grid_view_meeting_e2e.feature`.
- ✅ Scenario: Drag onto the strip tail — `grid_view_meeting_handles_e2e.feature:138`.
- ✅ Scenario: A drag across more than 24 hours — `grid_view_meeting_handles_e2e.feature:150`.
- ✅ Scenario: A finger drag inside the frame on fitting strips — `grid_view_meeting_move_e2e.feature:187` (a press at a cell centre; the near-edge case is R2).
- ✅ Scenario: Frame and dimming of the sample meeting — `grid_view_meeting_e2e.feature`, `grid_view_meeting_unit.feature`.
- ✅ Scenario: A quarter-hour range — `grid_view_meeting_unit.feature`.
- ✅ Scenario: Meeting frame colour and layers — `grid_view_meeting_e2e.feature`.
- ✅ Scenario: Frame over the strip tail — `grid_view_strip_tail.feature:39`.
- ✅ Scenario: Handles of the sample meeting — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Handles stay on screen in a long list — `grid_view_meeting_handle_reach_e2e.feature:11` (below the meeting bar).
- ✅ Scenario: Handle rows among the visible rows — `grid_view_meeting_handle_reach_unit.feature:6`.
- ✅ Scenario: Scrolling re-places the handles cheaply — `grid_view_meeting_handle_reach_unit.feature`.
- ✅ Scenario: Slider values of the handles — `grid_view_meeting_handles_e2e.feature:74` (end maximum 1980).
- ✅ Scenario: Slider values off the track step — `grid_view_meeting_handle_reach_e2e.feature:62` (1985).
- ✅ Scenario: Keys on the handles — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Arrow keys bring an off-step end onto the track step — `grid_view_meeting_handle_reach_e2e.feature`.
- ✅ Scenario: The hit area is at least 44 by 44 px — `grid_view_meeting_handle_reach_e2e.feature:49` ("The hit area of the <handle> handle is at least 44 by 44 px").
- ✅ Scenario: Slider values of a meeting past midnight — `grid_view_meeting_handles_e2e.feature:104`.
- ✅ Scenario: End on the end handle — `grid_view_meeting_handles_e2e.feature:115`.
- ✅ Scenario: Dragging the end handle to the right edge on a phone — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Dragging the start handle to the left edge on a phone — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: The hour frame comes back into view after Clear — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: The tail grows under a dragged end handle — `grid_view_meeting_handles_e2e.feature:162`, `useMeetingHandleDrag.tail.test.tsx:12`.
- ✅ Scenario: Type the meeting in another location's time — `grid_view_meeting_range_input_unit.feature`.
- ✅ Scenario: A meeting at any minute — `grid_view_meeting_range_input_unit.feature` (grid-view delta).
- ✅ Scenario: Twelve-hour texts — `grid_view_meeting_range_input_unit.feature`.
- ✅ Scenario: Wrong input keeps the input open — `grid_view_meeting_range_input_unit.feature:39`.
- ✅ Scenario: Esc closes the input without a change — `grid_view_meeting_range_input_unit.feature`.
- ✅ Scenario: No accessibility violations with each range message — `grid_view_meeting_range_messages_e2e.feature:13`.
- ✅ Scenario: A meeting past midnight is typed — `grid_view_meeting_range_input_unit.feature:52`.
- ⚠️ Scenario: Approved screenshots of the meeting state — `grid_view_meeting_screenshots_e2e.feature:6` runs, but its eight baselines were not re-taken for the move handle as the requirement says (R1).
- ✅ Scenario: A handle move re-presents the spans cheaply — `grid_view_meeting_budget.feature` (unchanged).
- ✅ Scenario: No accessibility violations in the meeting state — `grid_view_meeting_share_e2e.feature`.
- ✅ Scenario: No accessibility violations with the meeting range input — `grid_view_meeting_lock_e2e.feature`.
- ✅ Scenario: Tab order skips the locked controls — `grid_view_meeting_lock_e2e.feature:6` (ends with «Move meeting»).
- ✅ Scenario: The open input's fields sit in place of the span in the Tab order — `grid_view_meeting_lock_e2e.feature`.
- ✅ Scenario: The keyboard alone sets the meeting — `grid_view_meeting_lock_e2e.feature`.
- ✅ Scenario: The open input fits on a phone — `grid_view_meeting_lock_e2e.feature`.
- ✅ Scenario: The meeting bar stays in a long list — `grid_view_meeting_move_e2e.feature:11`.
- ✅ Scenario: The normal header still scrolls away — `grid_view_meeting_move_e2e.feature:28`.
- ✅ Scenario: Focus is not hidden under the bar — `grid_view_meeting_move_e2e.feature:36`.
- ✅ Scenario: The move handle of the sample meeting — `grid_view_meeting_move_e2e.feature:82`.
- ✅ Scenario: The move handle sticks to the meeting bar — `grid_view_meeting_move_e2e.feature:91`.
- ✅ Scenario: The move handle follows the strips — `grid_view_meeting_move_e2e.feature:109`.
- ✅ Scenario: The move handle stays in reach in a long list — `grid_view_meeting_move_e2e.feature:119`.
- ✅ Scenario: Slider values of the move handle — `grid_view_meeting_move_e2e.feature:46`.
- ✅ Scenario: Keys on the move handle — `grid_view_meeting_move_e2e.feature:54`.
- ✅ Scenario: Tab order of the three handles — `grid_view_meeting_move_e2e.feature:73`.
- ✅ Scenario: The hit area of the move handle — `grid_view_meeting_move_e2e.feature:235`.
- ✅ Scenario: No accessibility violations with the move handle — `grid_view_meeting_move_e2e.feature:249`.
- ✅ Scenario: Drag the frame with the mouse — `grid_view_meeting_move_e2e.feature:135`.
- ✅ Scenario: Drag the move handle — `grid_view_meeting_move_e2e.feature:147`.
- ✅ Scenario: Hold and drag with a finger — `grid_view_meeting_move_e2e.feature:163`.
- ✅ Scenario: Hold and drag with a finger on fitting strips — `grid_view_meeting_move_e2e.feature:175`.
- ✅ Scenario: A swipe inside the frame still scrolls — `grid_view_meeting_move_e2e.feature:198`.
- ✅ Scenario: A click inside the frame is still a tap — `grid_view_meeting_move_unit.feature:6`.
- ✅ Scenario: A press outside the frame sets a new range — `grid_view_meeting_move_unit.feature:12`.
- ✅ Scenario: Finger move without Pointer Events — `grid_view_meeting_move_e2e.feature:210`.
- ✅ Scenario: Rows follow the move — `grid_view_meeting_move_unit.feature:18`.
- ✅ Scenario: A move into the strip tail — `grid_view_meeting_move_e2e.feature:222`.
- ✅ Scenario: A release after a move is not a tap — `grid_view_meeting_move_unit.feature:26`.
- ✅ Scenario: Scrolling re-places the move handle cheaply — `grid_view_meeting_move_unit.feature:32`.
- ✅ Scenario: A move step is bounded — `grid_view_meeting_move_budget.feature:6`.
- ✅ Scenario: A growing tail presents only its cells — `grid_view_strip_tail.feature:46`.
- ✅ Scenario: Approved screenshots of the move handle and the strip tail — `grid_view_meeting_screenshots_e2e.feature:28` ("…of the moved and extended meeting", six new baselines per project).
- ✅ Scenario: A stored list never carries a meeting range — `meeting_range_commands.feature`.
- ✅ Scenario: A meeting at any minute — `meeting_range_any_minute.feature` (meeting-range delta).
- ✅ Scenario: A meeting past midnight of the reference zone — `meeting_range_past_midnight.feature:6`.
- ✅ Scenario: Set a two-hour meeting — `meeting_range_commands.feature`.
- ✅ Scenario: Invalid ranges are refused — `meeting_range_commands.feature:20`.
- ✅ Scenario: Clear keeps the moment pinned — `meeting_range_commands.feature`.
- ✅ Scenario: Set a meeting that ends after midnight — `meeting_range_past_midnight.feature:19`.
- ✅ Scenario: Keyboard moves of the handles — `meeting_range_handles.feature:6`.
- ✅ Scenario: Moves from an end off the track step — `meeting_range_any_minute.feature`.
- ✅ Scenario: A drag cannot cross the other end — `meeting_range_handles.feature`.
- ✅ Scenario: A drag lands an off-step end on the track step — `meeting_range_any_minute.feature`.
- ✅ Scenario: Handles of a meeting past midnight — `meeting_range_past_midnight.feature:26`.
- ✅ Scenario: The end handle is dragged past midnight — `meeting_range_past_midnight.feature:42`.
- ✅ Scenario: Wall-clock times of any location set the range — `meeting_range_wall_times.feature:6`.
- ✅ Scenario: Times that break the invariants are refused — `meeting_range_wall_times.feature` (the two past-midnight rows removed).
- ✅ Scenario: The whole reference day — `meeting_range_wall_times.feature`.
- ✅ Scenario: Commands that remove the range — `meeting_range_commands.feature`.
- ✅ Scenario: Next day keeps the meeting — `meeting_range_commands.feature`.
- ✅ Scenario: Next day keeps a meeting off the track step — `meeting_range_any_minute.feature`.
- ✅ Scenario: A shorter day keeps the length — `meeting_range_commands.feature:60`.
- ✅ Scenario: Next day keeps a meeting past midnight — `meeting_range_past_midnight.feature:48`.
- ✅ Scenario: Moves of the sample meeting — `meeting_range_move.feature:6`.
- ✅ Scenario: Moves of a meeting off the track step — `meeting_range_move.feature:22`.
- ✅ Scenario: A pointer position lands the start on the track step — `meeting_range_move.feature:34`.
- ✅ Scenario: A move stops at the limits — `meeting_range_move.feature:47`.
- ✅ Scenario: A move on a clock change day keeps the length — `meeting_range_move.feature:60`.
- ✅ Scenario: No meeting range — `meeting_range_move.feature:66`.

## Mutation

Scoped runs from `packages/client`, one at a time, read from `reports/mutation/mutation-report.json`:

| File | Score | Killed | Timeout | Survived |
|---|---|---|---|---|
| `src/model/meetingRange.ts` | 100.00 % | 77 | 3 | 0 |
| `src/model/meetingRangeMove.ts` | 100.00 % | 23 | 0 | 0 |
| `src/model/stripTail.ts` | 100.00 % | 12 | 0 | 0 |
| `src/model/hourCellColumns.ts` | 100.00 % | 15 | 4 | 0 |
| `src/model/nextReferenceDay.ts` | 100.00 % | 5 | 0 | 0 |
| `src/model/hourCells.ts` | 100.00 % | 32 | 0 | 0 |
| `src/model/reduceMeetingRange.ts` | 98.53 % | 67 | 0 | 1 |
| `src/model/reduceMeetingRangeWallTimes.ts` | 96.08 % | 47 | 2 | 2 |
| `src/presenter/meetingHandles.ts` | 100.00 % | 11 | 0 | 0 |
| `src/views/grid/meetingHandleRow.ts` | 100.00 % | 11 | 0 | 0 |
| `src/views/grid/moveHandlePlacement.ts` | 100.00 % | 12 | 0 | 0 |
| `src/views/grid/meetingFrameHit.ts` | 100.00 % | 22 | 0 | 0 |

The three survivors lie in code this branch did not change: `reduceMeetingRange.ts:116` (`followMeetingRange`) and the `RangeError` guards at `reduceMeetingRangeWallTimes.ts:50,90`.

Not measured: `src/presenter/hourStrip.ts` and `src/model/hourCellBuilder.ts` (the run was stopped by the 10-minute limit of the shell before it wrote a report; a run with more files was stopped the same way), and the view hooks `useMeetingRangeDrag.ts`, `useMeetingFrameMove.ts`, `useMoveHandlePlacement.ts`, `useHourCellSelection.ts` and the components (not run).

## Findings

### R1 — CRITICAL — Meeting-state screenshot baselines not re-taken for the move handle
- Location: `packages/client/src/test/features/__screenshots__/chromium/Approved-screenshots-of-the-meeting-state-at-1440-by-900-px-in-the-light-theme.png` (and the other seven `Approved-screenshots-of-the-meeting-state-*` baselines, in `chromium/` and `mobile-chrome/`)
- Rule: task 9.1 of `tasks.md`; the modified grid-view requirement "Approved screenshots of the meeting state"
- Problem: Task 9.1 is ticked and says "Re-take the eight baselines of 'Approved screenshots of the meeting state' (they gain the move handle)", and the delta spec says these screenshots "SHALL be re-taken once for the move handle". None of the eight baselines changed on this branch; their last commit is 38d67d9 (2026-11-19), before the move handle existed. The screenshot step (`steps/locations_layout_e2e.steps.ts:65-77`) masks nothing, so the scenarios pass only because the 36 × 12 px grip is far below `SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.025` (`playwright.bdd.config.ts:73`).
- Impact: The approved screens of the meeting state show no move handle, so they no longer are the approved look of the build. A regression that hides, misplaces or restyles the move handle in the sample meeting state passes these eight scenarios. A task is ticked but not done.
- Fix: Re-take the eight baselines in the CI container with `npx playwright test -c playwright.bdd.config.ts --grep "Approved screenshots of the meeting state" --update-snapshots` (both the `chromium` and `mobile-chrome` projects), check that each new image shows the move handle on the frame's top line, commit them, and run the same command without `--update-snapshots` twice to confirm they are stable.
- Fix risk: baselines taken outside the CI image (other fonts or rendering) fail in CI; take them where the other baselines were taken. No code changes.
- Status: open

### R2 — WARNING — A cell drag near a cell edge on fitting strips does not cancel the finger hold
- Location: `packages/client/src/views/grid/useMeetingFrameMove.ts:143`
- Rule: `design.md` D6 ("a finger press inside the frame stays a candidate cell drag until either the finger enters another cell (a cell drag, as today, and the pending hold is cancelled) or the hold fires"); FR16; task 8.4
- Problem: `handleTouchMove` cancels the pending hold only when the finger has moved more than `REORDER_TOUCH_ACTIVATION_TOLERANCE_PX` (5 px). Nothing cancels it when `useHourCellSelection` starts a cell drag. D6 assumes "the 5 px tolerance never reaches another cell", but a finger that lands within 5 px of a cell edge enters the next cell after less than 5 px of travel.
- Impact: On fitting strips (for example 1440 × 900 with touch), a finger pressed inside the frame 2 px left of a cell edge, slid 3 px right and then held still: the cell drag sets the range of the two cells (`onSelectCells`), and 250 ms later the hold fires (`startDrag`). The next finger movement then moves the whole range instead of extending the cell drag, and `useHourCellSelection` drops its anchor (`isFrameMoving`). FR16 says a finger that moves before the hold does what it did before. No test covers this case.
- Fix: In `useMeetingFrameMove`, remember on `touchstart` the pressed strip's left edge and the pressed column (`Math.floor((clientX − stripLeft) / cellPitchPx)`), and in `handleTouchMove` also call `clearHold()` when the column under the finger differs from the pressed column. Add a test to `src/views/grid/useMeetingFrameMove.test.tsx`: a touch 2 px left of a cell edge, a move of 3 px into the next cell, then the hold callback must not have been scheduled or must not start a move.
- Fix risk: low. On scrolling strips a column change by finger always comes with native scrolling of more than 5 px, which already cancels the hold, so nothing changes there. The column has to be measured from the strip under the finger, as `findPressedStrip` already does.
- Status: open

### R3 — WARNING — The move handle's value text builds the span label a second time
- Location: `packages/client/src/presenter/meetingHandles.ts:78`
- Rule: `.claude/rules/glossary.md` ("No new code computes something that a *Code:* owner already computes"); `.claude/rules/antipatterns.md` ("Second owner of a concept")
- Problem: The value text of the move handle is built as `formatTime(start) + MEETING_SPAN_SEPARATOR + formatTime(end)`. The span of the range in a zone already has one owner, `presentLocationMeetingRange(...).spanLabel` (`src/presenter/locationMeetingRange.ts:49`). The spec says the move handle's value text is "the span of the range in the reference zone", which is that owner's result for the reference zone's row.
- Impact: Two places now decide how a span reads. A change to the span format (separator, 12-hour suffixes, a day mark) made in `presentLocationMeetingRange` leaves the move handle's screen-reader text out of step with the span in the reference zone's row.
- Fix: In `presentMeetingHandles`, set the move handle's `valueText` to `presentLocationMeetingRange(referenceZoneId, meeting, referenceZoneId, { language, hourFormat, translate }).spanLabel`, and drop the local `formatTime` helper if no other line still uses it.
- Fix risk: low. Both formatters come from the cached `formatLocalTime`, so NFR-P1 (no new `Intl` formatter) still holds. `getLocationMeetingRange` adds a day-shift computation for one zone per presentation. The tests in `src/presenter/meetingHandles.test.ts` keep `09:00–11:00`.
- Status: open

### R4 — SUGGESTION — Never-words of "Meeting move" in new names and Gherkin
- Location: `packages/client/src/views/grid/MoveHandle.tsx:18`
- Rule: `.claude/rules/glossary.md` ("Words listed under *Never:* must not appear for that concept in code, comments, specs…"); `docs/glossary/time-selection.md:44` (Meeting move — *Never:* shift, drag the meeting)
- Problem: The new prop `onDragMeetingTo` (`MoveHandle.tsx:18,38,49`, `GridView.tsx:138`, `MoveHandle.test.tsx:20-123`, test title "should drag the whole meeting by the pointer") and the narrative of `src/test/features/meeting_range/meeting_range_move.feature:3` ("As a user I shift the whole meeting range") use the *Never:* words of the meeting move.
- Impact: The concept gains a second vocabulary in code and specs, which the glossary rule calls a bug; later code searching for "move" misses these names.
- Fix: Rename `onDragMeetingTo` to `onMoveMeetingTo` in `MoveHandle.tsx`, `GridView.tsx` and `MoveHandle.test.tsx` (and the test title to "should move the whole meeting by the pointer"), and reword the feature narrative to "As a user I move the whole meeting range and its length stays the same."
- Fix risk: none; a pure rename inside the grid module and one Gherkin narrative line, which no step definition reads.
- Status: open

### R5 — SUGGESTION — `getStripTailCellCount` recomputes the last column of the meeting span
- Location: `packages/client/src/model/stripTail.ts:22`
- Rule: `.claude/rules/glossary.md` (Meeting range *Code:* `getMeetingSpan` owns the columns the range overlaps)
- Problem: `getStripTailCellCount` computes `endMinutes` from epoch milliseconds and `Math.ceil(endMinutes / MINUTES_PER_HOUR) - 1` itself, which is exactly `getMeetingSpan(day, meeting).lastColumn` (`src/model/meetingRange.ts:180-193`).
- Impact: The rule "which column does the range end in" now has two copies in the model. A change to it (for example how an end on a cell edge counts) in `getMeetingSpan` would move the frame and the dimming but not the tail.
- Fix: Replace lines 19–22 with `const { lastColumn } = getMeetingSpan(day, meeting);`, imported from `./meetingRange`, and drop the now unused `MILLISECONDS_PER_MINUTE`/`MINUTES_PER_HOUR` imports.
- Fix risk: low. `meetingRange.ts` does not import `stripTail.ts`, so no import cycle appears. `hourCells.test.ts` and `grid_view_strip_tail.feature` cover the result, and the file scored 100 % in mutation.
- Status: open

## Verdict

Not ready. R1 is blocking: task 9.1 is ticked, but the eight meeting-state baselines were never re-taken for the move handle. R2 and R3 should be fixed in the same round. R4 and R5 are small renames and reuse.
