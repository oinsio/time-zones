# Specs review: move-meeting-range-and-extend-past-midnight

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 53/54 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 6 |
| SUGGESTION | 0 |

## Freshness

- ✅ `isValidMeetingRange` compares the end with the end of the reference day today (`packages/client/src/model/meetingRange.ts:62`, `end.epochMilliseconds <= day.end.epochMilliseconds`), as proposal Why 1 and design D1 say.
- ✅ `getMeetingRangeOfCells` clamps the end of the highest cell to `day.end` (`src/model/meetingRange.ts:76-82`) and is the builder `useMeetingRange` uses for cell drags (`src/controller/useMeetingRange.ts` imports it), as D10 says.
- ✅ `buildFlags` in `src/model/workingTime.ts:105-107` reads `getHourCellStart(day, column + 1)` and clamps it with `Math.min(nextStart, day.end…)`, as D10 claims.
- ✅ `useHourGrid` returns `cellCount: getHourCellCount(day)` today (`src/controller/useHourGrid.ts:67`), as D4 says.
- ✅ `getHourCellLayout` lives in `src/views/grid/hourCellLayout.ts` and is called by `useHourStripScroll.ts`; `MIN_FITTING_HOUR_CELL_PX = 32` and `HOUR_CELL_SCROLL_WIDTH_PX = 38` are in `src/constants/grid.ts`; `HourGridCssVariable.CELL_COUNT` / `CELL_PITCH` exist there.
- ✅ The reference zone's row has no midnight cell today: `hourCells.ts` marks a midnight cell only when `timeZoneId !== referenceZoneId` (`src/model/hourCells.ts:60`), so D4's "column 0 of the reference zone's row is a plain cell" is a change of one condition.
- ✅ `useMeetingHandleDrag.ts` exists (209 lines) with `MEETING_HANDLE_AUTO_SCROLL_EDGE_PX`, `MEETING_HANDLE_RELEASE_CLICK_WINDOW_MS` (`src/constants/meeting.ts`) and a touch-event fallback (`useMeetingHandleDrag.ts:149-192`), as D5 says.
- ✅ `REORDER_POINTER_ACTIVATION_DISTANCE_PX`, `REORDER_TOUCH_ACTIVATION_DELAY_MS`, `REORDER_TOUCH_ACTIVATION_TOLERANCE_PX` are in `src/constants/reorder.ts` and used by `LocationList.tsx`; the glossary's **Grab area** (`docs/glossary/locations.md:21`) names only "the place and zone line elements of `ZoneRowContent`" in its *Code:*, as design Context says.
- ✅ `MeetingHandle` is a model enum (`src/model/meetingRange.ts`), `MeetingHandleSlider` is in `src/views/grid/MeetingHandle.tsx` with a 44 × 48 px hit area (`h-12 w-11`, line 123) and `z-meeting-handle`.
- ✅ `getMeetingHandleRow` (`views/grid/meetingHandleRow.ts`) and `useVisibleStripRows` (which reads `DATE_BAR_SELECTOR`) exist; `DATE_BAR_SELECTOR` is in `src/constants/date.ts`, so `MEETING_BAR_SELECTOR` "beside" it is a new constant.
- ✅ The header in `src/app/MainPage.tsx` is not sticky today (`MEETING_HEADER_CLASS_NAMES`, line 19-20, has no `sticky`); only the footer is `sticky bottom-0 z-page-bar` (line 71).
- ✅ The meeting bar height of 85 px (D8) matches the header classes `pt-6 pb-4` + 44 px buttons + 1 px border; the frame inset 4 px and line 3 px match `MeetingFrame.tsx:22` (`top-1`, `border-[3px]`).
- ✅ `LocationErrorCode.MEETING_END_BEFORE_START` (`src/model/locationCommands.ts:46`), its branch in `reduceMeetingRangeWallTimes.ts:46`, `MeetingRangeInputOutcome.END_BEFORE_START` (`src/controller/useMeetingRange.ts:46,59`), its message in `views/shared/MeetingRangeInput.tsx:28` and `meeting.rangeInputEndBeforeStartError` in both locale files (`ru.json:127`, `en.json:127`) all exist, as D2 and task 4.1 list.
- ✅ Line references of the tasks hold: `MeetingRangeInput.test.tsx:184,237` are the `END_BEFORE_START` rows; `reduceMeetingRangeWallTimes.test.ts:146,153` the `MEETING_END_BEFORE_START` rows; `useMeetingRange.input.test.tsx:69-70` the `"12"/"10"` and `"22"/"2"` rows; `meeting_range_wall_times.feature:34-35` the two refused rows; `grid_view_meeting_handle_reach_e2e.feature:11` "Handles stay on screen in a long list" and `:62` "Slider values off the track step".
- ✅ Every test file the tasks name as existing exists (`meetingRange.test.ts`, `hourCells.test.ts`, `useHourGrid.test.tsx`, `hourCellLayout.test.ts`, `HourStrip.selection.test.tsx`, `HourStrip.selectionGesture.test.tsx`, `MeetingRangeInput.test.tsx`, `locales.test.ts`, `meetingHandles.test.ts`, `MainPage.test.tsx`, `meetingHandleRow.test.ts`, `useVisibleStripRows.test.tsx`, `reduceMeetingRange.test.ts`, `useMeetingRange.test.tsx`, `workingTime.test.ts`, `MeetingHandle.test.tsx`, `useMeetingHandleDrag*.test.tsx`), and `startWorkCount` is exported by `src/test/workCounters.ts:33`.
- ✅ Every feature and steps file the tasks update exists under `src/test/features/meeting_range/` and `src/test/features/grid_view/` (`meeting_range_commands`, `_handles`, `_any_minute`, `_wall_times`, `grid_view_meeting_range_input_unit`, `grid_view_meeting_unit`, `grid_view_meeting_range_messages_e2e`, `grid_view_width_e2e`, `grid_view_meeting_handles_e2e`, `grid_view_meeting_handle_reach_unit/_e2e`, `grid_view_meeting_screenshots_e2e`, `grid_view_meeting_contract_e2e`); `playwright.bdd.config.ts` exists.
- ✅ The scripts of task 10.2 and 9.1 exist: `check:bundle-size`, `check:legacy-build`, `design:screens`, `typecheck`, `lint` (`packages/client/package.json`).
- ✅ Every MODIFIED requirement of both deltas exists under the same name in `openspec/specs/meeting-range/spec.md` and `openspec/specs/grid-view/spec.md`, and each delta keeps every stable scenario of its requirement (checked by a scenario-name diff).
- ✅ The REMOVED "Commands that remove or move the meeting range" exists in `openspec/specs/meeting-range/spec.md:57` with the clamping rule ("the end is clamped to the end of the new reference day") and the scenario "A shorter day clamps the end"; its other three scenarios reappear unchanged in the ADDED replacement.
- ✅ Nothing of the change is built yet: no `strip tail`, `MOVE_MEETING_RANGE` or meeting move handle in `packages/client/src`, `docs/glossary`, `docs/architecture` or an archived change (the only "move handle" hits are the reorder feature's "the list offers no move handle").
- ✅ ADR-0011 has a "Refined by ADR-0013" line (`docs/adr/0011-meeting-range-in-grid-view.md:6`), no ADR-0019 exists, the ADR table of `docs/architecture/overview.md` ends its meeting rows with ADR-0013 (line 21), and `CLAUDE.md` lists ADRs through 0018, as task 1.1/1.2 assume.
- ✅ Existing E2E Tab-order steps survive a third handle after the end handle: `grid_view_meeting_share_e2e.steps.ts:143-146` stops at the end handle and `grid_view_meeting_lock_e2e.steps.ts:92` tabs until «Meeting end», so task 10.3 is not broken by D7.

## Coverage

| Id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ meeting-range "Meeting range invariants" | ✅ 2.1, 2.2, 2.5 |
| FR2 | ✅ | ✅ "Set and clear a meeting range" | ✅ 2.1, 2.5 |
| FR3 | ✅ | ✅ "Set a meeting range from wall-clock times" | ✅ 2.4 |
| FR4 | ✅ | ✅ "Meeting handle moves", "Meeting handles are sliders" | ✅ 2.1, 4.2, 5.2 |
| FR5 | ✅ | ✅ "Commands that remove the meeting range or carry it to another date" | ✅ 2.3 |
| FR6 | ✅ | ✅ "Hour cells of the reference day" | ✅ 3.1, 3.5 |
| FR7 | ✅ | ✅ "Midnight marker in the hour strip", "Hour cells…" | ✅ 3.3, 3.5 |
| FR8 | ✅ | ✅ "Hour strip width" | ✅ 3.4, 5.1 |
| FR9 | ✅ | ✅ "Tap or Enter…", "Drag across hour cells…" | ✅ 3.2, 4.4, 5.2 |
| FR10 | ✅ | ✅ "Meeting range input" | ✅ 4.1, 4.5, 5.1 |
| FR11 | ✅ | ✅ "A meeting past midnight of the reference zone", "A meeting past midnight is typed" | ✅ 2.5, 4.5 |
| FR12 | ✅ | ✅ "Meeting bar stays at the top of the viewport" | ✅ 6.1, 6.5 |
| FR13 | ✅ | ✅ "Meeting handles on the frame" | ✅ 6.2, 6.3, 6.5 |
| FR14 | ✅ | ✅ "Move the whole meeting range" | ✅ 7.1–7.4 |
| FR15 | ✅ | ✅ "Move the meeting range by its frame" | ✅ 8.4, 8.6, 8.7 |
| FR16 | ✅ | ✅ "Move the meeting range by its frame" | ✅ 8.4, 8.7 (mechanism gap, R2) |
| FR17 | ✅ | ✅ "Move handle on the frame" | ✅ 8.1–8.3, 8.7 (stacking gap, R1) |
| FR18 | ✅ | ✅ "Move handle is a slider" | ✅ 7.3, 8.3, 8.7 |
| FR19 | ✅ | ✅ "Moving the meeting range", "Handle drag scrolls the strips" | ✅ 4.3, 8.5, 8.6, 8.7 |
| FR20 | ✅ | ✅ "Move the whole meeting range", "A move into the strip tail" | ✅ 7.4, 8.7 |
| NFR-P1 | ✅ | ✅ "Moves and the strip tail are fast" | ✅ 3.5, 8.2, 8.6 work bounds (no benchmark, R4) |
| NFR-A1 | ✅ | ✅ "Move handle is a slider" | ✅ 8.3, 8.7 |
| NFR-A2 | ✅ | ✅ "The hit area of the move handle", "No accessibility violations with the move handle" | ✅ 8.7 |
| NFR-A3 | ✅ | ✅ "Focus is not hidden under the bar" | ✅ 6.4, 6.5 |
| NFR-R1 | ✅ | ✅ "Hour strip width", screenshots | ✅ 5.1, 9.1 |
| NFR-R2 | ✅ | ✅ "The meeting bar stays in a long list" | ✅ 6.5 |
| UX1 | ✅ | ✅ "Move handle on the frame" | ✅ 8.3, 8.7, 9.1 |
| UX2 | ✅ | ✅ "The move handle sticks to the meeting bar" | ✅ 8.1, 8.7 |
| UX3 | ✅ | ✅ "Moving the meeting range" | ✅ 8.3, 8.6, 9.1 |
| UX4 | ✅ | ✅ "Hour cells of the reference day" (tail cell in every respect), screenshots | ✅ 3.3, 9.1 |
| M1 | ✅ | n/a | ✅ 2.4, 4.5 |
| M2 | ✅ | n/a | ✅ 7.1, 7.4 |
| M3 | ✅ | n/a | ✅ 7.1, 7.4 |
| M4 | ✅ | n/a | ❌ no scenario checks the move handle fully visible at the top, middle and bottom (R5) |
| M5 | ✅ | n/a | ✅ 8.1, 8.7 |
| M6 | ✅ | n/a | ✅ 8.7 |
| M7 | ✅ | n/a | ✅ 5.1 |
| M8 | ✅ | n/a | ✅ 10.1 |
| M9 | ✅ | n/a | ✅ 10.2 |
| G1 | ✅ | n/a — met by FR1–FR4, FR9 | n/a — met by FR1–FR4, FR9 |
| G2 | ✅ | n/a — met by FR14–FR19, M2, M3 | n/a — met by FR14–FR19, M2, M3 |
| G3 | ✅ | n/a — met by FR12, FR13, FR17, M4 | n/a — met by FR12, FR13, FR17, M4 |
| G4 | ✅ | n/a — met by FR18, NFR-A1–NFR-A3 | n/a — met by FR18, NFR-A1–NFR-A3 |
| G5 | ✅ | n/a — met by UX1–UX3, M5 | n/a — met by UX1–UX3, M5 |
| NG1 | ✅ | n/a — nothing builds a range over 24 h | n/a |
| NG2 | ✅ | n/a — only the bounded tail is built | n/a |
| NG3 | ✅ | n/a — moves clamp the start at 0 | n/a |
| NG4 | ✅ | n/a — no «‹ ›» buttons | n/a |
| NG5 | ✅ | n/a — D11 builds no trace | n/a |
| NG6 | ✅ | n/a — tail taps and drags change nothing | n/a |
| NG7 | ✅ | n/a — no Cards or storage task | n/a |
| NG8 | ✅ | n/a — no share text change | n/a |
| Q1 | ✅ | n/a — left open on purpose (NG5, D11) | n/a |
| Q2 | ✅ | n/a — answered in the proposal and D4: one spare cell | n/a |

## Consistency

- Stable `openspec/specs/grid-view/spec.md:638` ("Meeting state is fast": after a meeting handle move within the same reference day "every hour strip MUST stay the same object") is not modified, while the delta `specs/grid-view/spec.md:629` ("Growing or shrinking the strip tail MUST present only the cells that are added") and design D4 (`design.md:64`, the cells of the day kept by identity, so the strip itself changes) make a handle move that changes the tail count produce new strips.
- Stable `openspec/specs/grid-view/spec.md:588` ("Accessible meeting state": "The Tab order MUST be: «Поделиться встречей», «Сбросить выбор встречи», then for each row its span button and its hour strip, then the meeting handles «Начало встречи», «Конец встречи»") is not modified, while the delta's ADDED "Move handle is a slider" (`specs/grid-view/spec.md:509`, "The move handle MUST be one Tab stop, after the end handle") and its scenario (`specs/grid-view/spec.md:533`, the focus visits «Начало встречи», «Конец встречи» and «Сдвиг встречи») add a third handle Tab stop that the stable closed list does not allow.

## Findings

### R1 — WARNING — No layer decided for the move handle over the sticky meeting bar
- Location: `openspec/changes/move-meeting-range-and-extend-past-midnight/design.md:88` (D8), `design.md:104` (D9); `specs/grid-view/spec.md:477`
- Rule: `.claude/rules/design-decisions.md`
- Problem: the spec requires the move handle to "lie above everything in the panel and above the meeting bar's line" and to rest on the bar's bottom line once the frame top scrolls under it. D9 puts the sticky header on the `z-page-bar` layer (10, `tailwind.config.ts:63-71`), while D7/D8 make the move handle a `MeetingHandleSlider`, whose layer today is `z-meeting-handle` (3, `MeetingHandle.tsx:123`). D8 says only `position: fixed` and does not name a layer. With the layers as written, the half of the handle that reaches over the bar is painted under the bar. Raising the handle above 10 instead would put a grid element above the date bar layer, against the stable "Grid layers stay under the page bars and dialogs" (`openspec/specs/grid-view/spec.md:769`, which puts "the meeting handles" below the date bar).
- Impact: built as written, the resting move handle is half hidden at scroll ≥ 7 px, so UX2, M4 and M5 fail in E2E, and the implementer has to make a layering choice the spec does not settle, either way risking the stable layering requirement.
- Fix: in D9, give the sticky header a new layer `meeting-bar` (5) instead of `page-bar`: above the grid layers (1–4) and below `page-bar` (10), `location-menu` (20) and `dialog` (30). In D8, give the move handle a new layer `move-handle` (6). Add both tokens to the `zIndex` map in `tailwind.config.ts` in task 6.1 (header) and 8.3 (handle), and add a Then "the topmost element at the centre of the move handle is the move handle" to the rows of "The move handle sticks to the meeting bar" (`specs/grid-view/spec.md:485`).
- Fix risk: low. 5 and 6 stay below the date bar, the location menu and the dialogs, so "Grid layers stay under the page bars and dialogs" and "Meeting bar stays at the top of the viewport" ("below an open dialog and an open location menu") still hold. The dragged-row layer (15) is above the bar, but rows cannot be reordered while a meeting range is set ("Row controls are locked while a meeting range is set"). The two new tokens need a line in the glossary or architecture note that lists the page layers.
- Status: open

### R2 — WARNING — Design does not say how a held finger stops native scrolling on scrolling strips
- Location: `openspec/changes/move-meeting-range-and-extend-past-midnight/design.md:72-78` (D6); `specs/grid-view/spec.md:559`, scenario "Hold and drag with a finger" (`:576`)
- Rule: `.claude/rules/design-decisions.md`
- Problem: on scrolling strips the cells carry `touch-pan-x touch-pan-y` (`src/views/grid/HourStrip.tsx:73`). D6 says a 250 ms hold "starts a move, on scrolling and on fitting strips alike" and that `useMeetingFrameMove` runs over the drag core of `useMeetingHandleDrag`. That core uses Pointer Events on modern engines and touch events only as the legacy fallback (`useMeetingHandleDrag.ts:149-192`). It works for the handles because they are `touch-none` (`MeetingHandle.tsx:142`). On a `pan-x` cell the browser claims the first horizontal finger move as a scroll and sends `pointercancel`, unless a non-passive `touchmove` listener calls `preventDefault()` after the hold. D6 names no such mechanism. The reorder drag that D6 copies the thresholds from gets it from dnd-kit's `TouchSensor` (`LocationList.tsx:114`).
- Impact: built from D6 as written, the hold fires and the next move scrolls the strips and cancels the move. FR16 and the scenario "Hold and drag with a finger" ("the strips did not scroll by the finger's travel") then fail in E2E (task 8.7), and the implementer has to redesign the gesture during implementation.
- Fix: in D6, add that once the hold has fired, `useMeetingFrameMove` cancels native panning with a non-passive `touchmove` listener on the strips that calls `preventDefault()` while the move lasts, and before the hold it calls nothing, so a swipe still scrolls. Name the touch path of the drag core as the one used for that finger, so no second copy of the touch handling is written. In task 8.4, add the jsdom tests "a touchmove after the hold is default-prevented" and "a touchmove before the hold is not".
- Fix risk: medium. The listener must be non-passive only on the strips, or it costs page-scroll performance. The guard order with `useHourCellSelection` on fitting strips (D6) must still let a finger that changes cell before the hold set a range, which the existing task 8.4 guard test covers.
- Status: open

### R3 — WARNING — "Meeting state is fast" is left unmodified though the tail changes the strips
- Location: `openspec/specs/grid-view/spec.md:638`; `openspec/changes/move-meeting-range-and-extend-past-midnight/specs/grid-view/spec.md:629`; `design.md:64`
- Rule: `.claude/rules/delta-specs.md`
- Problem: the stable requirement says that after a meeting handle move within the same reference day "every hour strip MUST stay the same object". With this change a handle move that crosses into or out of the last cell of the day changes the strip tail, and D4 and the ADDED "Moves and the strip tail are fast" present new cells, so the strip is no longer the same object. The delta and the proposal's Capabilities list do not modify "Meeting state is fast".
- Impact: after archive the stable grid-view spec holds two requirements that disagree for every tail-changing move. An implementer who keeps the strip object identical to satisfy the stable rule cannot show the tail. A later change that tests the stable rule with a range near midnight gets a failing test.
- Fix: add "Meeting state is fast" to the grid-view delta's MODIFIED requirements with its full stable text and scenario. Change "every hour strip MUST stay the same object" to "every hour strip MUST stay the same object while the strip tail keeps its cell count; when the tail grows or shrinks, only the added cells are presented ("Moves and the strip tail are fast")". Append `NFR-P1 of move-meeting-range-and-extend-past-midnight` to its implements comment and list it in proposal → Capabilities.
- Fix risk: none. The stable scenario (09:00–11:00, one step) and its test in `grid_view_meeting_budget.feature` stay unchanged.
- Status: open

### R4 — WARNING — NFR-P1 has no benchmark task
- Location: `openspec/changes/move-meeting-range-and-extend-past-midnight/tasks.md:48,85,89` (tasks 3.5, 8.2, 8.6)
- Rule: `.claude/rules/test-planning.md` ("Performance tests — … work bounds … as blocking unit BDD, plus a `*.bench.ts` benchmark reported by the non-blocking CI `benchmark` job")
- Problem: NFR-P1 is checked only by work bounds. No task adds or extends a `*.bench.ts` for a move step or a tail growth, though `src/test/benchmarks/meetingRange.bench.ts` already benchmarks the meeting state and `pnpm bench` exists (`packages/client/package.json:24`).
- Impact: the real cost of a move step over 50 rows and of a growing tail is never reported, so a timing regression of the new hot path goes unseen in the CI `benchmark` job, against the rule's required test types.
- Fix: add a task to group 8: "extend `src/test/benchmarks/meetingRange.bench.ts` with a move step and a tail growth over 50 rows (`// Verifies NFR-P1 of move-meeting-range-and-extend-past-midnight`). Verify: `npx vitest bench --run --mode test src/test/benchmarks/meetingRange.bench.ts` exits 0", with no timing assertion.
- Fix risk: low. If `benchBudgets` expects a budget for each benchmark name, the task must add the budget entry in the same file that holds the existing ones.
- Status: open

### R5 — WARNING — M4 is measured by no scenario
- Location: `openspec/changes/move-meeting-range-and-extend-past-midnight/proposal.md:165`; `specs/grid-view/spec.md:453-464,485-496`
- Rule: `.claude/rules/test-planning.md` (every metric needs an automated test)
- Problem: M4 says "With 12 locations at 390 × 844 px the meeting bar and the move handle are fully visible at the top, the middle and the bottom of the list: 3 of 3 positions". "The meeting bar stays in a long list" checks the bar only, at 390 × 844 middle and bottom (no top), and never the move handle. "The move handle sticks to the meeting bar" checks the handle's centre at scroll 0, 4, 7 and 400 px, not its full visibility at the bottom of the list. The screenshots of task 9.1 compare pixels but assert nothing about visibility.
- Impact: the metric G3 rests on is never measured. A move handle that is clipped or covered at the bottom of the list (see R1) passes every task.
- Fix: add to "Move handle on the frame" the Scenario Outline "The move handle stays in reach in a long list". GIVEN the Grid view at 390 by 844 px with 12 locations and the sample meeting; WHEN the page is scrolled to its `<position>` (top, middle, bottom); THEN the meeting bar and the move handle are fully inside the viewport, AND the topmost element at the centre of the move handle is the move handle. List it in task 8.7 with `@M4`, not in 6.5, because group 6 runs before the handle exists.
- Fix risk: none.
- Status: open

### R6 — WARNING — Stable Tab order of the meeting state contradicts the added move handle Tab stop
- Location: `openspec/specs/grid-view/spec.md:588`; `openspec/changes/move-meeting-range-and-extend-past-midnight/specs/grid-view/spec.md:509,533`
- Rule: `.claude/rules/delta-specs.md`
- Problem: the stable "Accessible meeting state" says "The Tab order MUST be: «Поделиться встречей», «Сбросить выбор встречи», then for each row its span button and its hour strip, then the meeting handles «Начало встречи», «Конец встречи»" — a closed list. The ADDED "Move handle is a slider" says "The move handle MUST be one Tab stop, after the end handle" (`:509`), and its scenario checks that the focus visits «Начало встречи», «Конец встречи» and «Сдвиг встречи» (`:533`). "Accessible meeting state" is neither MODIFIED in the delta nor listed in the proposal's Capabilities. This is the same class of contradiction as R3.
- Impact: after archive the stable grid-view spec holds two MUSTs that disagree about the Tab order of the meeting state: one ends the order at «Конец встречи», the other requires «Сдвиг встречи» after it. An implementer or a later change that tests the stable Tab order as written fails against the built move handle, or drops the move handle from the Tab order to satisfy it and breaks NFR-A1.
- Fix: add "Accessible meeting state" to the grid-view delta's MODIFIED requirements with its full stable text and every stable scenario. Change the order to "…then the meeting handles «Начало встречи», «Конец встречи», «Сдвиг встречи»", append `NFR-A1 of move-meeting-range-and-extend-past-midnight` to its implements comment, and list the requirement in proposal → Capabilities beside "Meeting state is fast" (R3).
- Fix risk: none. The delta's own Tab-order scenario (`:533`) and task 8.7 already test the new order, and the existing Tab-order steps stop at the end handle (`grid_view_meeting_share_e2e.steps.ts:143-146`, `grid_view_meeting_lock_e2e.steps.ts:92`), so they keep passing.
- Status: open

## Verdict

Needs revision. No CRITICAL finding: the change is faithful to the task, its model rules, tables and numbers check out against the code, and every task stays inside the implement stage's limits, with the one handoff item (H1, the ADR) properly justified. Blocking: R1, R2, R3, R4, R5, R6 (all WARNING). R3 and R6 are the two contradictions with stable grid-view MUSTs ("Meeting state is fast", "Accessible meeting state") that the delta must MODIFY before archive.
