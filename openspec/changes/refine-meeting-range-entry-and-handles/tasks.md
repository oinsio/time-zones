# Tasks

Paths are relative to `packages/client/` unless they start with `docs/` or `temporary-docs/`. `<task>` is `github-oinsio-time-zones-114`.

Run tests strictly one command at a time (`CLAUDE.md`). Traceability marks:
- every new or touched production file gets a JSDoc line `Implements <ids> of refine-meeting-range-entry-and-handles (D<n>).`;
- every new or touched test file gets the comment `// Verifies <ids> of refine-meeting-range-entry-and-handles.`;
- every new or changed Gherkin scenario gets the tags `@refine-meeting-range-entry-and-handles @<id>`;
- every unit step file gets the comment `// @refine-meeting-range-entry-and-handles @<id>` before `f.Scenario`.

Sample data:
- current time `2026-03-08T07:30:00Z`, device time zone `Asia/Almaty`, reference zone Almaty;
- locations Almaty, Moscow, Kolkata, New York;
- the sample meeting is 09:00–11:00 Almaty (`2026-03-08T04:00:00Z`–`06:00:00Z`).

Files stay under 200 lines where possible, 300 at most.

## 1. Glossary and architecture docs (FR1, FR2, FR4, FR6, FR7)

- [ ] 1.1 Glossary, in `docs/glossary/time-selection.md`:
  - **Meeting range**: "inside the reference day, on the track step" becomes "inside the reference day, at any whole minute; its meeting handles move its ends on the track step"; *Code:* gains `MEETING_START_EQUALS_END`, `MEETING_END_BEFORE_START`.
  - **Meeting handle**: "moves the start or the end by the track step" becomes "moves the start or the end onto the track step; stands on the grid rows visible on screen"; *Code:* gains `getMeetingHandleRow`, `useVisibleStripRows`.
  - **Wall-time input**: gains "While digits are typed, it inserts the `:` separator after the hour"; *Code:* gains `formatTypedWallTimeText`.
  - **Meeting range input**: gains "its fields insert the separator as the wall-time input does".
  - In `docs/glossary/date-selection.md`, **Date bar**: *Code:* gains `DATE_BAR_SELECTOR` (its locator on the main page).

  Verify from the repository root:
  - `grep -n "DATE_BAR_SELECTOR" docs/glossary/date-selection.md` prints a line;
  - `grep -n "at any whole minute" docs/glossary/time-selection.md`, `grep -n "formatTypedWallTimeText" docs/glossary/time-selection.md` and `grep -n "useVisibleStripRows" docs/glossary/time-selection.md` each print a line;
  - `grep -c "on the track step, chosen" docs/glossary/time-selection.md` prints 0;
  - `wc -l docs/glossary/time-selection.md` stays under 200.
- [ ] 1.2 Architecture docs:
  - `docs/architecture/domain-model.md`, invariant 5: "both ends lie on the track step inside the reference day" becomes "both ends lie on whole minutes inside the reference day". The errors cell of `SET_MEETING_RANGE_WALL_TIMES` gains `MEETING_START_EQUALS_END`, `MEETING_END_BEFORE_START`.
  - `docs/architecture/views.md` → Grid → **Meeting handles**: "move the start and the end by the 15-minute track step" becomes "move the start and the end onto the 15-minute track step, while a typed meeting may start and end at any minute (ADR-0013)". Add "they stand on the rows visible on screen and have a 44 × 44 px hit area".
  - `docs/architecture/overview.md`: add an ADR table row for ADR-0013.

  Verify:
  - `grep -n "MEETING_END_BEFORE_START" docs/architecture/domain-model.md` prints a line;
  - `grep -n "whole minutes inside the reference day" docs/architecture/domain-model.md` prints a line;
  - `grep -n "ADR-0013" docs/architecture/views.md docs/architecture/overview.md` prints 2 lines.

## 2. Model (FR1, FR2, FR4, FR5, M1, M2, M6; D1, D2)

- [ ] 2.1 RED, invariants and handle moves. In `src/model/meetingRange.test.ts`:
  - the case "start off the step" (`04:10`) becomes "start off a whole minute" (`04:10:30`);
  - new cases: `isValidMeetingRange` accepts `04:05`–`04:10` and `04:00`–`04:01`;
  - `getMeetingHandleLimits` of 09:00–09:05 gives start max 540 and end min 545;
  - `getMeetingRangeAfterHandleMove` gives the 7 rows of `meeting-range` → "Moves from an end off the track step";
  - `getMeetingRangeAtHandleMinutes` of 09:05–11:00, start at 551 minutes, gives 09:15–11:00;
  - `moveMeetingRangeToDay` keeps a 09:05–09:28 range at 09:05–09:28 on 2026-03-09.

  Run `npx vitest run src/model/meetingRange.test.ts`: fails.
- [ ] 2.2 GREEN: implement D1 in `src/model/meetingRange.ts`. Run `npx vitest run src/model/meetingRange.test.ts`, then `npx vitest run src/model/reduceMeetingRange.test.ts`, then `npx vitest run src/model/referenceMoment.test.ts`: all pass.
- [ ] 2.3 RED then GREEN, wall-clock refusals. In `src/model/reduceMeetingRangeWallTimes.test.ts` (`it.each`):
  - the 9 rows of `meeting-range` → "Wall-clock times of any location set the range";
  - the 8 rows of "Times that break the invariants are refused";
  - "The whole reference day" (00:00–00:00) → `MEETING_START_EQUALS_END`, same state object;
  - the existing `09:10` refusal becomes an accepted range.

  Implement D2: the two codes in `src/model/locationCommands.ts`, and the checks in `src/model/reduceMeetingRangeWallTimes.ts`. Run `npx vitest run src/model/reduceMeetingRangeWallTimes.test.ts`: passes.
- [ ] 2.4 Update the existing unit BDD to the modified requirements, keeping the old tags and adding `@refine-meeting-range-entry-and-handles @FR1` / `@FR2`:
  - `src/test/features/meeting_range/meeting_range_commands.feature`: the "Invalid ranges are refused" row `2026-03-08T04:10:00Z` becomes `2026-03-08T04:10:30Z`;
  - `src/test/features/meeting_range/meeting_range_wall_times.feature`: the tables of "Wall-clock times of any location set the range" and "Times that break the invariants are refused" become those of the delta, and "The whole reference day" expects `MEETING_START_EQUALS_END`. Extend the step definitions in `steps/meeting_range_wall_times.steps.ts` if a step text changed.

  Run `npx vitest run src/test/features/meeting_range/steps/meeting_range_commands.steps.ts`, then `npx vitest run src/test/features/meeting_range/steps/meeting_range_wall_times.steps.ts`: pass.
- [ ] 2.5 New unit BDD `src/test/features/meeting_range/meeting_range_any_minute.feature` with `steps/meeting_range_any_minute.steps.ts`. It reuses the store world of `steps/meetingRangeWorld.ts` and the real reducer. Scenarios:
  - "A meeting at any minute" (`@FR1`);
  - "Next day keeps a meeting off the track step" (`@FR5`);
  - "Moves from an end off the track step" and "A drag lands an off-step end on the track step" (`@FR4`).

  The unchanged rows of "Keyboard moves of the handles" in `meeting_range_handles.feature` keep passing. Run `npx vitest run src/test/features/meeting_range/steps/meeting_range_any_minute.steps.ts`, then `npx vitest run src/test/features/meeting_range/steps/meeting_range_handles.steps.ts`: pass.

## 3. Presenter, controller and refusal messages (FR2, FR3, FR6, M2, M3, NFR-A1, UX3; D3, D4)

- [ ] 3.1 RED then GREEN: `src/presenter/formatTypedWallTimeText.test.ts` (`it.each`):
  - `1`→`1`, `10`→`10`, `103`→`10:3`, `1030`→`10:30`;
  - `9`→`9`, `93`→`9:3`, `930`→`9:30`, `0930`→`09:30`;
  - `24`→`2:4`, `2359`→`23:59`, `12345`→`12:345`;
  - `9:3`, `09.30`, `9 am`, `abc` and the empty text unchanged.

  Implement `src/presenter/formatTypedWallTimeText.ts` with `WALL_TIME_SEPARATOR` and the digit limits as constants in `src/constants/timeSelection.ts`, exported through `src/constants/index.ts` and `src/presenter/index.ts`. Run `npx vitest run src/presenter/formatTypedWallTimeText.test.ts`: passes.
- [ ] 3.2 RED then GREEN, the outcomes and their messages (D3). Removing `MeetingRangeInputOutcome.INVALID_RANGE` touches the controller, the view that reads it and three test files, so they change together in this one task:
  - `src/controller/useMeetingRange.input.test.tsx`: the `9:10`/`11` row (`INVALID_RANGE` today) now gives `CLOSED` with the range 09:10–11:00; `10`/`10` → `SAME_START_AND_END`; `12`/`10` and `22`/`2` → `END_BEFORE_START`; New York `13`/`14` on `2026-03-07` → `OUTSIDE_REFERENCE_DAY`; in each refusal the range stays 09:00–11:00.
  - `src/views/shared/MeetingRangeInput.test.tsx`: the `INVALID_RANGE` cases (lines 150–195 today) are replaced by one case per new outcome, checking the Russian and the English text of D3, with both fields `aria-invalid` and `aria-describedby` on the message.
  - `src/views/shared/LocalDateTime.meetingInput.test.tsx`: the case at lines 80–92 (`INVALID_RANGE`, «…с шагом 15 минут») uses `OUTSIDE_REFERENCE_DAY` and «Встреча должна быть внутри дня».

  Run the three files one at a time: they fail. Implement D3 in `src/controller/useMeetingRange.ts` (`INVALID_RANGE` removed), the outcome-to-key `Record` in `src/views/shared/MeetingRangeInput.tsx` (lines 81–87 today read `INVALID_RANGE`), and the 3 keys of D3 in `src/locales/ru.json` and `src/locales/en.json` (`rangeInputError` renamed). Run `npx vitest run src/controller/useMeetingRange.input.test.tsx`, then `npx vitest run src/controller/useMeetingRange.test.tsx`, then `npx vitest run src/views/shared/MeetingRangeInput.test.tsx`, then `npx vitest run src/views/shared/LocalDateTime.meetingInput.test.tsx`, then `pnpm typecheck`: all pass. Then, test files included:
  - `grep -rn "INVALID_RANGE" src` prints nothing;
  - `grep -rn "шагом 15 минут\|15-minute steps" src` prints nothing;
  - `grep -c "rangeInputSameTimesError\|rangeInputEndBeforeStartError\|rangeInputOutsideDayError" src/locales/ru.json` prints 3.

## 4. Views (FR3, FR6–FR8, NFR-A2, NFR-P1, UX1, UX2; D4–D8)

- [ ] 4.1 RED then GREEN, the separator (D4):
  - `src/views/shared/typedTimeFieldText.test.ts` (new): an `insertText` change at the end with `103` gives `10:3`; a `deleteContentBackward` change gives the raw text; a change with `selectionEnd` before the end gives the raw text; without `inputType`, a shorter prefix gives the raw text.
  - `src/views/shared/WallTimeInput.test.tsx` adds, with `@testing-library/user-event`: typing `1030` over the selected text shows `10:30` with `selectionStart` 5; Backspace twice after `103` shows `10`.
  - `src/views/shared/MeetingRangeInput.test.tsx` adds: typing `905` in the start field shows `9:05`, and `1130` in the end field shows `11:30`.

  Implement `src/views/shared/typedTimeFieldText.ts` and use it in `WallTimeInput.tsx` and `MeetingRangeInput.tsx`. Run the three files one at a time: pass.
- [ ] 4.2 Unit BDD of the input (needs 3.2, 4.1):
  - `src/test/features/grid_view/grid_view_meeting_range_input_unit.feature`: the "Wrong input keeps the input open" table becomes the 5 rows of the delta and is tagged `@FR3 @UX3`; add "A meeting at any minute" (5 examples, `@FR2 @FR3`).
  - New `src/test/features/time_selection/time_selection_time_separator_unit.feature` with `steps/time_selection_time_separator_unit.steps.tsx` (user-event typing in the app world of the existing wall-time unit steps): "Digits typed one by one" (7 examples), "Texts left as typed" (5), "Backspace removes the separator", "A pasted time gets its separator" and "Rejected texts stay rejected" (3) (`@FR6 @UX1`). The unit copy of "Digits typed one by one" omits the step "the caret is after the last character": the caret is asserted only in the browser (5.2).

  Run `npx vitest run src/test/features/grid_view/steps/grid_view_meeting_range_input_unit.steps.tsx`, then `npx vitest run src/test/features/time_selection/steps/time_selection_time_separator_unit.steps.tsx`, then `npx vitest run src/test/features/time_selection/steps/time_selection_wall_time_input_unit.steps.tsx`: pass.
- [ ] 4.3 RED then GREEN, handle rows (D5):
  - `src/views/grid/meetingHandleRow.test.ts`: the existing cases call the new `getMeetingHandleRow(handle, { firstRow: 1, lastRow: n })`; add the 4 rows of `grid-view` → "Handle rows among the visible rows".
  - `src/views/grid/useVisibleStripRows.test.tsx` (new). It uses stubbed `getBoundingClientRect` of 12 strips and a `[data-date-bar]` element, and a stubbed `requestAnimationFrame` that counts frames. Cases:
    - at scroll top it returns rows 1–6;
    - after a scroll event it returns the new run;
    - three scroll events before one frame measure once (NFR-P1);
    - an unchanged run causes no re-render (a render counter);
    - a 38 px strip whose top is 2 px is not a candidate (its 48 px handle would start at −3 px), nor is a 38 px strip whose bottom is 2 px above the date bar;
    - with no candidate row it returns `{ 1, 12 }`;
    - with `isFrozen` it keeps the last value;
    - without `[data-date-bar]` it uses `window.innerHeight`.
  - `src/app/MainPage.test.tsx` asserts `data-date-bar` on the bottom element that holds the date bar.

  Implement `meetingHandleRow.ts`, `useVisibleStripRows.ts`, `MEETING_HANDLE_HEIGHT_PX` in `src/constants/meeting.ts`, `DATE_BAR_SELECTOR` in `src/constants/date.ts` (beside `DATE_BAR_SHORT_FORMAT_OPTIONS`, exported through `src/constants/index.ts`), the attribute in `src/app/MainPage.tsx`, and the wiring in `GridView.tsx` and `MeetingHandle.tsx` (`onDragActiveChange`). Run the three test files one at a time, then `npx vitest run src/views/grid/MeetingHandle.test.tsx`: pass.
- [ ] 4.4 RED then GREEN, hit area, grab offset and release (D6–D8):
  - `src/views/grid/MeetingHandle.test.tsx`: the `<li>` carries `w-11` and `h-12`, and the grip keeps `h-9 w-3` (UX2).
  - `src/views/grid/useMeetingHandleDrag.test.tsx` and `useMeetingHandleDrag.edges.test.tsx`: the assertions that expect the pointer's absolute minutes are updated to press-relative minutes. The fixture's `valueMinutes` 660 plus the travel: the touch drag from x 100 to 256 at the fixture pitch expects `660 + (256 - 100) / pitch * 60`.
  - New cases:
    - a press and release without a move calls `onDragHandleTo` 0 times;
    - after a pointer drag and `pointerup`, a `click` dispatched on an element outside the handle is stopped before it reaches that element's listener;
    - a `click` 60 ms later is not stopped;
    - `touchend` of a finger drag returns `false` from `fireEvent` (default prevented);
    - `onDragActiveChange` is called with `true` on press and `false` on release.

  Implement in `MeetingHandle.tsx` and `useMeetingHandleDrag.ts`, with `MEETING_HANDLE_RELEASE_CLICK_WINDOW_MS` in `src/constants/meeting.ts`. Run the three files one at a time, then `npx vitest run src/views/grid/HourStrip.selection.test.tsx`: pass.
- [ ] 4.5 Unit BDD of the handles: `src/test/features/grid_view/grid_view_meeting_handle_reach_unit.feature` with `steps/grid_view_meeting_handle_reach_unit.steps.tsx`, through the Grid world of `steps/meetingGridSession.ts` in jsdom. Scenarios:
  - "Handle rows among the visible rows" (`@FR7`);
  - "A click after a handle drag is not a tap": a pointer drag of the end handle by one cell, then a `click` on Almaty's column 14 cell; expect 09:00–12:00 (`@FR8`);
  - "Finger drag without Pointer Events": the touch fallback; expect 09:00–11:00 and the `touchend` default prevented (`@FR8`).

  Run `npx vitest run src/test/features/grid_view/steps/grid_view_meeting_handle_reach_unit.steps.tsx`: passes. Then `npx vitest run src/test/features/grid_view/steps/grid_view_meeting_unit.steps.tsx`: passes.

## 5. E2E in a real browser (FR3, FR4, FR6–FR8, NFR-A1, NFR-A2, NFR-R1, UX1; D4–D8)

- [ ] 5.1 `src/test/features/grid_view/grid_view_meeting_handle_reach_e2e.feature` with `steps/grid_view_meeting_handle_reach_e2e.steps.ts`, reusing:
  - the 12-location list and "the user sets the sample meeting" of `grid_view_layers_e2e.feature`;
  - `isTopmostAt` and `centreOf` from `steps/hourGridE2eHelpers.ts`;
  - "the screen is {int} by {int} px for the locations".

  Scenarios:
  - "Handles stay on screen in a long list" (6 examples; the date bar is located by `DATE_BAR_SELECTOR` from `@/constants`, `@FR7 @NFR-R1`);
  - "A press beside the grip drags the handle" (mouse down 16 px right of the end handle's centre, move one cell pitch right, release over the Kolkata row's hour cell; expect 09:00–12:00 and «Meeting · 3 h», `@FR8`);
  - "Press and release without movement" (`@FR8`);
  - "The hit area is at least 44 by 44 px" (2 examples, `@NFR-A2`);
  - "Slider values off the track step" (typed 09:05–09:28 through the meeting range input, `@FR4 @NFR-A2`);
  - "Arrow keys bring an off-step end onto the track step" (`@FR4`).

  In `steps/grid_view_layers_e2e.steps.ts`, the local `const DATE_BAR_SELECTOR = "footer"` is replaced by the import of `DATE_BAR_SELECTOR` from `@/constants`, so the date bar has one locator.

  The auto-scroll scenarios of `grid_view_meeting_handles_e2e.feature` follow the modified "Handle drag scrolls the strips" (grab offset):
  - "Dragging the end handle to the right edge on a phone" and "Dragging the start handle to the left edge on a phone" gain the tags `@refine-meeting-range-entry-and-handles @FR8`, and their last step becomes "the end handle keeps its distance from the finger at the press" / "the start handle keeps its distance from the finger at the press";
  - in `steps/grid_view_meeting_handles_e2e.steps.ts`, the finger drag presses `FINGER_PRESS_OFFSET_PX` (16 px, a new constant of the step file) right of the handle's centre and records that offset in `FingerDrag`; the step "the (end|start) handle is within a quarter of a cell of the finger" becomes "the (end|start) handle keeps its distance from the finger at the press" and asserts `|handleCentre.x - (lastX - pressOffsetPx)| ≤ pitch / CELLS_PITCH_FRACTION + EDGE_INSET_PX`.

  Run `pnpm test:bdd:gen && npx playwright test -c playwright.bdd.config.ts --project chromium --grep "@refine-meeting-range-entry-and-handles" --grep-invert "@FR6|@FR3"`: passes. It includes the two auto-scroll scenarios through their new tag. Then run `npx playwright test -c playwright.bdd.config.ts --project chromium grid_view_layers_e2e` (the generated spec of the layers feature): passes.

  Then confirm that the scenarios guard the fix:
  - change `getMeetingHandleRow`'s call in `GridView.tsx` back to `{ firstRow: 1, lastRow: rowCount }`, rerun "Handles stay on screen in a long list" and confirm it fails;
  - change the `<li>` width back to `w-6`, rerun "A press beside the grip drags the handle" and confirm it fails;
  - restore both files.
- [ ] 5.2 `src/test/features/time_selection/time_selection_time_separator_e2e.feature` with `steps/time_selection_time_separator_e2e.steps.ts`. Typing uses `page.keyboard.type` per digit, and the caret is read from `selectionStart`. Scenarios:
  - "Digits typed one by one" (the 7 examples);
  - "Backspace removes the separator";
  - "A typed time with the separator is confirmed";
  - "Rejected texts stay rejected" (`@FR6 @UX1`);
  - in Grid, "A meeting at any minute" with the examples Almaty `905`–`928` (typed as digits) → «Meeting · 23 min», and Moscow `7:05`–`9:28` (`@FR2 @FR3`).

  New `src/test/features/grid_view/grid_view_meeting_range_messages_e2e.feature` with `steps/grid_view_meeting_range_messages_e2e.steps.ts`: "No accessibility violations with each range message" (6 examples, `@axe-core/playwright`, `@NFR-A1 @FR3`).

  Run `pnpm test:bdd:gen && npx playwright test -c playwright.bdd.config.ts --project chromium --grep "@refine-meeting-range-entry-and-handles.*(@FR6|@FR3|@NFR-A1)"`: passes. Then run the same command with `--project mobile-chrome`: passes.
- [ ] 5.3 Existing browser suites keep passing:
  - `npx playwright test -c playwright.bdd.config.ts --project chromium --grep "Handles of the sample meeting|Drag the end handle one hour right|Drag the start handle past the end|Dragging the end handle to the right edge on a phone|Dragging the start handle to the left edge on a phone|Slider values of the handles|Keys on the handles"` (`grid_view_meeting_handles_e2e.feature`);
  - then `--grep "Keyboard-only input|Tab confirms the field|The keyboard alone sets the meeting|No accessibility violations with the meeting range input"` (`time_selection_wall_time_input_e2e.feature`, `grid_view_meeting_lock_e2e.feature`).

  Both pass.

## 6. Verification (all)

- [ ] 6.1 Scoped Stryker, at most 5 files per run, one run at a time, target ≥ 95 % (minimum 90 %, M7). From `packages/client`, run in this order:
  1. `npx stryker run --mutate 'src/model/meetingRange.ts,src/model/reduceMeetingRangeWallTimes.ts,src/presenter/formatTypedWallTimeText.ts,src/controller/useMeetingRange.ts'`;
  2. `npx stryker run --mutate 'src/views/shared/typedTimeFieldText.ts,src/views/shared/WallTimeInput.tsx,src/views/shared/MeetingRangeInput.tsx,src/views/grid/meetingHandleRow.ts,src/views/grid/useVisibleStripRows.ts'`;
  3. `npx stryker run --mutate 'src/views/grid/useMeetingHandleDrag.ts,src/views/grid/MeetingHandle.tsx,src/views/grid/GridView.tsx,src/app/MainPage.tsx'`.

  Read `reports/mutation/mutation-report.json` after each run, and add tests for survivors until each run scores ≥ 90 %.
- [ ] 6.2 Run `pnpm run build`, then `pnpm check:bundle-size`, then `pnpm check:legacy-build`, then `pnpm typecheck`, then `pnpm lint`, then `pnpm test`, one at a time: all pass.
- [ ] 6.3 Screenshots (NFR-R2): run `npx playwright test -c playwright.bdd.config.ts --grep "Approved screenshots"` (both projects). A meeting-state baseline that fails only because a meeting handle now stands on another row: re-write it with the same command plus `--update-snapshots` and that scenario's name in `--grep`, and list the re-written files of `__screenshots__/chromium/` and `__screenshots__/mobile-chrome/` in the H2 README section. A failure for any other reason is a defect to fix. Finally run `npx playwright test -c playwright.bdd.config.ts --grep "Approved screenshots"`: passes on every project.
- [ ] 6.4 Traceability:
  - `grep -rn "refine-meeting-range-entry-and-handles" packages/client/src | grep -oE "(FR|NFR-[APR]|UX)[0-9]+" | sort -u` lists FR1–FR8, NFR-A1, NFR-A2, NFR-P1, NFR-R1, UX1–UX3;
  - `grep -rn "isOnTrackStep" packages/client/src` prints nothing.

## 7. Handoff

- [ ] 7.1 Handoff H1: write `temporary-docs/gnomish/<task>/handoff/H1-adr-0013-meeting-range-any-minute.patch` and the `## H1: Add ADR-0013 (meeting range at any minute)` section of `temporary-docs/gnomish/<task>/handoff/README.md`. Make the patch as `.gnomish/stages/specify/handoff.md` says:
  1. Write `docs/adr/0013-meeting-range-at-any-minute.md` with the content of design D9.
  2. Add the Status line of `docs/adr/0011-meeting-range-in-grid-view.md`: "Refined by [ADR-0013](0013-meeting-range-at-any-minute.md): the ends lie on any whole minute; the handles keep the track step".
  3. Add "0013 meeting range at any minute" to the ADR list in `CLAUDE.md` → Architecture.
  4. `git add -N docs/adr/0013-meeting-range-at-any-minute.md`, `git diff --binary -- docs/adr/ CLAUDE.md > …`.
  5. `git checkout -- docs/adr/0011-meeting-range-in-grid-view.md CLAUDE.md`, and remove the new file.

  The README section holds:
  - **Serves:** FR1, FR4;
  - **Files:** `docs/adr/0013-meeting-range-at-any-minute.md` (new), `docs/adr/0011-meeting-range-in-grid-view.md` (Status line only), `CLAUDE.md`;
  - **Verify:** `git apply --check …`, then once applied `grep -n "Refines \[ADR-0011\]" docs/adr/0013-meeting-range-at-any-minute.md` and `grep -n "Refined by \[ADR-0013\]" docs/adr/0011-meeting-range-in-grid-view.md`;
  - the numbering note of D9;
  - **Why manual:** and **Automated part:** copied from H1.

  Verify:
  - `git apply --check temporary-docs/gnomish/<task>/handoff/H1-adr-0013-meeting-range-any-minute.patch` succeeds;
  - `git diff --quiet -- docs/adr/ CLAUDE.md` succeeds;
  - `test ! -e docs/adr/0013-meeting-range-at-any-minute.md` succeeds;
  - `grep -n "## H1" temporary-docs/gnomish/<task>/handoff/README.md` prints a line.
- [ ] 7.2 Handoff H2: write the `## H2: Review re-approved meeting screenshots` section of the same README (no patch). It holds:
  - **Serves:** NFR-R2, FR7;
  - **Files:** none;
  - **Verify:** the list of baselines re-written in 6.3, or "none re-written";
  - **Why manual:** and **Automated part:** copied from H2.

  Verify: `grep -n "## H2" temporary-docs/gnomish/<task>/handoff/README.md` prints a line.

## Human follow-up

- H1 (FR1, FR4): apply `H1-adr-0013-meeting-range-any-minute.patch`. It adds ADR-0013, which refines ADR-0011: the ends of a meeting range lie on any whole minute, and the meeting handles, the hour-cell tap and the strip keys keep the 15-minute track step. ADR-0011 gets only a Status-line "Refined by ADR-0013" pointer, and `CLAUDE.md` lists ADR-0013. If ADR-0012 has meanwhile landed under another number, renumber the new ADR before applying.
  Why manual: the factory may not write `docs/adr/` or `CLAUDE.md` (`.gnomish/stages/specify/handoff.md`).
  Automated part: the invariants the ADR records are tested by tasks 2.1–2.5. The docs that cite ADR-0013 are written and grepped in task 1.2.
- H2 (NFR-R2, FR7): before merging, open every meeting-state baseline listed as re-written in the H2 README section, under `packages/client/src/test/features/__screenshots__/chromium/` and `__screenshots__/mobile-chrome/`. Check that both meeting handles stand on rows visible in the screenshot, on the frame's left and right edges, with the grip unchanged, compared with `docs/design/screens/grid-*-meeting-light.png`. If the section says "none re-written", there is nothing to check.
  Why manual: deciding that a rendered page looks right against a design picture is a visual judgement only a human can make. The baselines are written from the implement stage's own render, so comparing them with themselves proves nothing about the design.
  Automated part: task 5.1 asserts the handle positions and the topmost elements, and every run compares the baselines.
