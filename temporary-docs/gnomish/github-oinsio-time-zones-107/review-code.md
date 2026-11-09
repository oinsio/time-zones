# Review: add-grid-hour-cells-and-hour-frame

## Summary

| Item | Value |
|---|---|
| Tasks verified | 25/25 |
| Requirements traced | 74/74 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 `docs/glossary/time-selection.md:20-22,28,17` — Hour cell, new Hour strip, Hour frame, Midnight marker lost *(planned)* and carry the *Code:* owners; Offset edge names `HourCell.hasOffsetEdge`.
- ✅ 1.2 `docs/glossary/views.md:9,12,14,15` — Grid view without "until the hour cells exist", Grid row "row header, then its hour strip, then its row notes", Shared block names `HourGridSlots`, View contract "today no scenario is excluded".
- ✅ 1.3 `docs/architecture/views.md:12,34,137`; `docs/architecture/domain-model.md:106-107` (`getHourCells(timeZoneId, referenceDay, referenceZoneId)`, `getHourFrameIndex`). `grep -rn grid-pending-hour-cells docs packages/client` prints nothing.
- ✅ 2.1 `packages/client/src/model/hourCells.test.ts` (163 lines, `it.each` over the sample day, 23/25 cells, Lord Howe 24.5 h, midnight cells, offset edge, frame index, same array).
- ✅ 2.2 `packages/client/src/model/hourCells.ts:37-109`; exports `src/model/index.ts:58-64`; `HOUR_CELL_DURATION` in `src/constants/grid.ts:3`, re-exported from `src/constants/index.ts:28-44`.
- ✅ 3.1 `packages/client/src/presenter/hourStrip.test.ts` (24-h, 12-h, `МАР`/`MAR`, cache identity and new object on hour format change).
- ✅ 3.2 `packages/client/src/presenter/hourStrip.ts:107-131` `presentHourStrip` with per-day/language/format cache; exported `src/presenter/index.ts:26-32`.
- ✅ 4.1 `packages/client/src/controller/useHourGrid.ts:24-58`, test `useHourGrid.test.tsx`; exported `src/controller/index.ts:16`.
- ✅ 5.1 `src/test/features/grid_view/grid_view_hour_cells_unit.feature` + `steps/grid_view_hour_cells_unit.steps.tsx` (all listed scenarios with `// @add-grid-hour-cells-and-hour-frame @FRx` comments).
- ✅ 5.2 `grid_view_hour_frame_unit.feature` + steps; the tap scenario fires `pointerDown` and `click` on Moscow's column 3 (`steps/grid_view_hour_frame_unit.steps.tsx:139-142`) and asserts no command.
- ✅ 5.3 `grid_view_hour_strip_budget.feature` + `steps/grid_view_hour_strip_budget.steps.ts:55-110` (work counters, no `performance.now()`); `src/test/benchmarks/hourStrip.bench.ts`.
- ✅ 6.1 `src/styles/tokens.css` (`--color-midnight-shade`, `--color-hour-cell-foreground` in the three theme blocks), `tailwind.config.ts:39-40`, layout constants `src/constants/grid.ts:5-11`, `src/views/grid/hourCellLayout.ts` + test.
- ✅ 6.2 `src/views/grid/HourStrip.test.tsx`, `HourFrame.test.tsx`, `ViewLocationList.test.tsx` (dividers, `[data-day-track]`, slots order, `focus-within:z-[3]`), `LocationMenu.test.tsx:164-205` (fixed menu, follows a scroll, absolute without the flag).
- ✅ 6.3 `src/views/shared/hourGridSlots.ts`, `LocationList.tsx` (`panelRef`, `panelStyle`, `renderHourStrip`, frame last child), `LocationRow.tsx:143-195` (sticky header box, strip, notes box), `locationRowVariant.ts:234-275`, `useFixedMenuPosition.ts`, `LocationMenu.tsx` (189 lines), `views/shared/index.ts` exports, `views/grid/HourStrip.tsx`, `HourFrame.tsx`, `useHourStripScroll.ts`, `GridView.tsx`. All touched views stay under 200 lines (`LocationRow.tsx` 199).
- ✅ 6.4 `src/test/features/main_page/main_page_grid_view_unit.feature:5-11,24`; `steps/main_page_grid_view_unit.steps.tsx:55-57,115`.
- ✅ 7.1 `src/test/features/grid_view/grid_view_hour_cells_e2e.feature` + `steps/grid_view_hour_cells_e2e.steps.ts` (column alignment, day-period colours, midnight shade, offset edge, dark digit colour, both themes).
- ✅ 7.2 `grid_view_hour_frame_e2e.feature` + `steps/grid_view_hour_frame_e2e.steps.ts` (frame colour and extent, FR10 hit tests, Page Up, slider values, Tab order and focus ring, axe in two themes live and after Page Up).
- ✅ 7.3 `grid_view_width_e2e.feature` + `steps/grid_view_width_e2e.steps.ts` (1440/1180/844 fit, 390 × 844 widths, joint scroll, End scrolls the frame into view).
- ✅ 7.4 `main_page_grid_view_e2e.feature:54-107` (notes after strip, two-line header, menu fully visible, screenshot outline of 8 examples); old 1024 px PNGs deleted, 16 new baselines under `src/test/features/__screenshots__/{chromium,mobile-chrome}/`.
- ✅ 8.1 `time_selection_view_contract_e2e.feature:11` (pending tag gone, `@add-grid-hour-cells-and-hour-frame @FR13`), `playwright.bdd.config.ts:49` empty `VIEW_CONTRACT_PENDING_TAGS`, `grepInvert` kept at line 79.
- ✅ 9.1 Re-measured in this review: all eight new production files at 100 %, `LocationMenu.tsx` 95.45 % (see Mutation).
- ✅ 9.2 CI is green for this branch (stage precondition); build, typecheck, lint and unit suite are part of it.
- ✅ 9.3 `grep -rn "grid-pending-hour-cells" packages/client docs --exclude-dir=node_modules` prints nothing.
- ✅ 9.4 `grep -rn add-grid-hour-cells-and-hour-frame packages/client/src` yields FR1–FR13, NFR-P1, NFR-A1, NFR-A2, NFR-R1–R4, UX1–UX3.
- ✅ 10.1 `temporary-docs/gnomish/github-oinsio-time-zones-107/handoff/README.md` has `## H1: Compare the Grid screenshots with the design` with Serves, Files, Verify, Why manual, Automated part.

## Requirements

- ✅ FR1 — `views/shared/LocationRow.tsx:143-195` (header, strip, notes), one `<ul>` panel `locationRowVariant.ts:263-264`, aligned grid columns `HourStrip.tsx:117-120`; tests: unit "Four rows of 24 aligned cells", E2E "Cells in a real layout stand in columns".
- ✅ FR2 — `model/hourCells.ts:46-49,74-76` (`Math.ceil(lengthMinutes / 60)` cells from `day.start`); tests `hourCells.test.ts` (23/25/24.5 h), unit outline "Clock change days in the reference zone".
- ✅ FR3 — `presenter/hourStrip.ts:83-101` (hour from Temporal fields, `:30`/`:45`, AM/PM via `getDayPeriodMarkers`); cache key includes `hourFormat` (`hourStrip.ts:111-117`); tests `hourStrip.test.ts`, unit "Local start hours…", "Quarter-hour zone", "12-hour format".
- ✅ FR4 — `model/hourCells.ts:62` (`getDayPeriod`), `views/grid/HourStrip.tsx:54-60` (`DAY_PERIOD_COLOR_VARIABLES`, `text-hour-cell-foreground` = `#0f1729` in dark); E2E "Theme colours of the cells".
- ✅ FR5 — `model/hourCells.ts:53-58,68` (date differs from one hour earlier, never in the reference zone's row), `presenter/hourStrip.ts:58-76` (upper-case month without stop), `HourStrip.tsx:28,65-71` (shade); unit scenarios "Midnight cells…", "The reference zone's row starts with 0", "English month"; E2E shade check.
- ✅ FR6 — `model/hourCells.ts:42-44,63-67` (transitions strictly inside the day, first cell at or after), `HourStrip.tsx:29` (3 px inset foreground line); unit "New York moves its clocks forward", E2E offset edge colour.
- ✅ FR7 — `LocationRow.tsx:184-195` (strip before the notes box); E2E "Row notes after the hour strip".
- ✅ FR8 — `model/hourCells.ts:97-109`, `controller/useHourGrid.ts:52`, `views/grid/HourFrame.tsx` (accent border), bold via `HourStrip.tsx:47,126`; unit "Frame on the current hour", E2E "Frame crosses every row…".
- ✅ FR9 — `useHourGrid.ts:57` recomputes on `minuteTick` and `state`; `getEffectiveInstant`; unit "Live frame follows the clock", "Pinned frame stays" (2 examples), "Now returns the frame"; `useHourGrid.test.tsx`.
- ✅ FR10 — sticky boxes `z-[2]` (`locationRowVariant.ts:235-236,265-266`), texts `bg-surface` (`ZoneRowContent.tsx`, `ZoneLine.tsx`, `LocalDateTime.tsx`), frame `z-[1] pointer-events-none` (`HourFrame.tsx`); E2E "Notes and header texts cover the frame" (see R2 on its guard).
- ✅ FR11 — no pointer handler on `HourStrip.tsx:108-129`; unit "A tap on a cell changes nothing", `HourStrip.test.tsx` pointer case.
- ✅ FR12 — `HourStrip.tsx:101-116` (`role="slider"`, name, value, `getTrackMoveForKey`); E2E "Page Up on Moscow's strip", "Slider name and value of a strip"; `HourStrip.test.tsx`.
- ✅ FR13 — `playwright.bdd.config.ts:49`, `time_selection_view_contract_e2e.feature:11`; `view-contract-grid` project includes "Select a time".
- ✅ NFR-P1 — module caches `hourCells.ts:34-94`, `hourStrip.ts:51-131`; `grid_view_hour_strip_budget.feature` (2 scenarios), `hourStrip.bench.ts`.
- ✅ NFR-A1 — one Tab stop (`tabIndex={0}`, cells plain `div`s), accent focus ring `HourStrip.tsx:117`; E2E "Tab order and focus ring", axe outline (light/dark, live and after Page Up).
- ✅ NFR-A2 — keyboard selection `HourStrip.tsx:101-106`; E2E "Page Up on Moscow's strip" and the Grid view-contract run of "Select a time".
- ✅ NFR-R1 — `views/grid/hourCellLayout.ts:19-37` (shared pitch ≥ 32 px); E2E "All hours fit" at 1440, 1180, 844.
- ✅ NFR-R2 — `hourCellLayout.ts:27-36` (36–40 px, 9 visible), `useHourStripScroll.ts:52-83` (scroll framed column into view on mount and when it leaves view), one scrolling `<ul>`; E2E "Phone in portrait scrolls all strips together", "Frame moved out of view is scrolled into view".
- ✅ NFR-R3 — `locationRowVariant.ts:269-270` (`min-h-11` city line, `flex-col-reverse md:flex-row`); E2E "Grid row header in two lines on a phone".
- ✅ NFR-R4 — `main_page_grid_view_e2e.feature:87-107` outline with 8 examples; 8 baselines per project; visual comparison with the design is human follow-up H1.
- ✅ UX1 — pastel rounded cells, `:30` smaller under hour, `МАР` small bold over day (`HourStrip.tsx:47-81`), rounded frame (`HourFrame.tsx:151`); screenshot baselines (1440 × 900 viewed: matches the design's structure).
- ✅ UX2 — one `HourFrame` `<li>` per panel (`LocationList.tsx` renders `hourGrid.frame` once), dividers on the rows (`locationRowVariant.ts:264`); E2E "Frame crosses every row…".
- ✅ UX3 — sticky header and notes boxes (`locationRowVariant.ts:235-236`), single scroller; E2E "Phone in portrait scrolls…" checks Almaty's city stays.
- ✅ M1 — `hourCells.test.ts` and unit hour-cells scenarios assert Almaty col 0 `0`, Moscow col 0 `22` / col 2 midnight, Kolkata col 0 midnight / col 23 `23:30`, New York col 10 midnight / col 11 `1` / col 12 `3` with edge, no other edges.
- ✅ M2 — unit outline "Clock change days in the reference zone" (23 on 2026-03-08, 25 on 2026-11-01) and `hourCells.test.ts`.
- ✅ M3 — `grid_view_hour_frame_unit.feature`: col 12 live, col 13 after `08:00Z`, col 12 for typed time and next day, col 12 after Now (5 checks).
- ✅ M4 — `grid_view_width_e2e.feature` (3 fit sizes; 390 × 844 widths 36–40, 8–10 visible, frame visible, all strips at their end after one scroll).
- ✅ M5 — config empty, no `grid-pending-hour-cells` match under `packages/client/` and `docs/`.
- ✅ M6 — axe outline in `grid_view_hour_frame_e2e.feature` (2 themes, live and pinned).
- ✅ M7 — 8 screenshot examples × 2 Playwright projects, 16 baselines committed.
- ✅ M8 — "A minute tick re-presents nothing" asserts 0 formatters and 0 transition lookups for 50 strips.
- ✅ Scenario: Four rows of 24 aligned cells — `grid_view_hour_cells_unit.feature:6`, steps line 59.
- ✅ Scenario: Clock change days in the reference zone — `grid_view_hour_cells_unit.feature:14`, steps line 79.
- ✅ Scenario: Cells in a real layout stand in columns — `grid_view_hour_cells_e2e.feature`.
- ✅ Scenario: Local start hours of the sample day — `grid_view_hour_cells_unit.feature:26`.
- ✅ Scenario: Quarter-hour zone — `grid_view_hour_cells_unit.feature:41`.
- ✅ Scenario: 12-hour format — `grid_view_hour_cells_unit.feature:47`.
- ✅ Scenario: Day periods of Almaty — `grid_view_hour_cells_unit.feature:53`.
- ✅ Scenario: Theme colours of the cells — `grid_view_hour_cells_e2e.feature` outline (light, dark).
- ✅ Scenario: Midnight cells of the sample day — `grid_view_hour_cells_unit.feature:59`.
- ✅ Scenario: The reference zone's row starts with 0 — `grid_view_hour_cells_unit.feature:71`.
- ✅ Scenario: English month — `grid_view_hour_cells_unit.feature:77`.
- ✅ Scenario: New York moves its clocks forward — `grid_view_hour_cells_unit.feature:83`.
- ✅ Scenario: Frame on the current hour — `grid_view_hour_frame_unit.feature`, steps line 53.
- ✅ Scenario: Live frame follows the clock — `grid_view_hour_frame_unit.feature`, steps line 80.
- ✅ Scenario: Pinned frame stays — `grid_view_hour_frame_unit.feature` outline, steps line 93.
- ✅ Scenario: Now returns the frame — `grid_view_hour_frame_unit.feature`, steps line 115.
- ✅ Scenario: Frame crosses every row in the accent colour — `grid_view_hour_frame_e2e.feature` outline, steps lines 32-69.
- ✅ Scenario: Notes and header texts cover the frame — `grid_view_hour_frame_e2e.feature`, steps lines 71-122 (see R2).
- ✅ Scenario: A tap on a cell changes nothing — `grid_view_hour_frame_unit.feature`, steps lines 132-150.
- ✅ Scenario: Page Up on Moscow's strip — `grid_view_hour_frame_e2e.feature`.
- ✅ Scenario: Slider name and value of a strip — `grid_view_hour_frame_e2e.feature`.
- ✅ Scenario: Tab order and focus ring — `grid_view_hour_frame_e2e.feature`, steps lines 133-162.
- ✅ Scenario: No accessibility violations with hour cells — `grid_view_hour_frame_e2e.feature` outline (light, dark; live and after Page Up).
- ✅ Scenario: All hours fit — `grid_view_width_e2e.feature` outline (1440, 1180, 844).
- ✅ Scenario: Phone in portrait scrolls all strips together — `grid_view_width_e2e.feature`.
- ✅ Scenario: Frame moved out of view is scrolled into view — `grid_view_width_e2e.feature`.
- ✅ Scenario: A minute tick re-presents nothing — `grid_view_hour_strip_budget.feature`, steps line 56.
- ✅ Scenario: First presentation is bounded per zone — `grid_view_hour_strip_budget.feature`, steps line 86.
- ✅ Scenario: Rows in one panel with hour strips — `main_page_grid_view_unit.feature:7`, steps lines 33-57.
- ✅ Scenario: Row notes after the hour strip — `main_page_grid_view_e2e.feature:55`.
- ✅ Scenario: The location menu of a grid row is fully visible — `main_page_grid_view_e2e.feature:72` (3 examples).
- ✅ Scenario: Grid row header in one line — `main_page_grid_view_e2e.feature:19` (existing, still passes with the strips).
- ✅ Scenario: Grid row header in two lines on a phone — `main_page_grid_view_e2e.feature:63`.
- ✅ Scenario: Grid rows use the theme token colours — `main_page_grid_view_e2e.feature:28` outline.
- ✅ Scenario: Typing a time in Grid — `main_page_grid_view_unit.feature:14`.
- ✅ Scenario: Empty Grid — `main_page_grid_view_unit.feature:20-25` incl. "no hour strip and no hour frame are shown" (steps line 115).
- ✅ Scenario: Unreadable list in Grid — `main_page_grid_view_unit.feature:28`.
- ✅ Scenario: Grid works offline — `main_page_grid_view_e2e.feature:42`.
- ✅ Scenario: Grid fits narrow and wide screens — `main_page_grid_view_e2e.feature:6` outline.
- ✅ Scenario: Approved Grid screenshots — `main_page_grid_view_e2e.feature:88` outline, 8 examples, 16 baselines.
- ✅ Scenario: One contract run per registered view — `playwright.bdd.config.ts:76-80` (one `view-contract-<id>` project per registry view), `src/test/features/view_contract/steps/view_contract_e2e.fixtures.ts`.
- ✅ Scenario: Grid runs every contract scenario — `playwright.bdd.config.ts:49` (no `grepInvert` pattern for any view), no pending tag in any `*_view_contract_e2e.feature`.
- ✅ Scenario: Select a time — `time_selection_view_contract_e2e.feature:11-12`, runs in `view-contract-grid` through `sliderOf(page, city)` matching Grid's strip slider.

## Mutation

Measured in this review with scoped Stryker runs (two runs, one at a time):

- Run 1 (`src/model/hourCells.ts`, `src/presenter/hourStrip.ts`, `src/controller/useHourGrid.ts`, `src/views/grid/hourCellLayout.ts`, `src/views/grid/useHourStripScroll.ts`): 194 killed, 0 survived — 100 % on each file.
- Run 2 (`src/views/grid/HourStrip.tsx`, `src/views/grid/HourFrame.tsx`, `src/views/shared/useFixedMenuPosition.ts`, `src/views/shared/LocationMenu.tsx`, `src/views/grid/GridView.tsx`): `HourStrip.tsx` 100 %, `HourFrame.tsx` 100 %, `useFixedMenuPosition.ts` 100 %, `GridView.tsx` 100 %, `LocationMenu.tsx` 95.45 % (3 survived, 1 no coverage). The one survivor on a changed line is `isMenuFixedToViewport = false` → `true` (`LocationMenu.tsx:42`); it is equivalent in the app because `LocationRow.tsx:181` always passes the flag explicitly. The other survivors (lines 96, 143) are in code this branch did not touch.

All files are above the 90 % minimum; no finding.

## Findings

### R1 — WARNING — New unit steps file exceeds the 200-line limit
- Location: `packages/client/src/test/features/grid_view/steps/grid_view_hour_cells_unit.steps.tsx:1`
- Rule: `CLAUDE.md` → Process Invariants ("Files must stay under 200 lines for AI context quality"); `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity")
- Problem: the file is new in this branch and has 281 lines. It holds eleven scenarios of four distinct requirement groups (cell count/alignment FR1–FR2, labels FR3, colours FR4, midnight marker and offset edge FR5–FR6), so splitting would not hurt clarity.
- Impact: breaks the explicit project limit for a file this branch created; the next change (meeting range) will add to the grid unit steps and push it towards the 300-line hard cap.
- Fix: split `grid_view_hour_cells_unit.feature` into two features by aspect, e.g. `grid_view_hour_cells_unit.feature` (FR1, FR2, FR4 scenarios) and `grid_view_hour_cell_labels_unit.feature` (FR3, FR5, FR6 scenarios, keeping the `_unit` suffix only if a paired `_e2e` exists per `bdd-unit.md`, otherwise `grid_view_hour_cell_labels.feature`), each with its own steps file under `steps/`, and move the shared setup (sample locations, presenting helper) into the existing `steps/hourCellsWorld.ts`. Keep the scenario names, tags and `// @add-grid-hour-cells-and-hour-frame @FRx` comments unchanged.
- Fix risk: low — pure test reorganisation; the scenario names must stay byte-identical to the feature files (`bdd-unit.md`), and the task 5.1 run command in `tasks.md` names the old steps path, so the new path must be run instead.
- Status: fixed
- Resolution: split into grid_view_hour_cells_unit.feature (FR1, FR2, FR4; 83-line steps) and grid_view_hour_cell_labels.feature (FR3, FR5, FR6; 180-line steps); shared setup moved to createHourCellsSteps in steps/hourCellsWorld.ts. Scenario names and tags unchanged; both files pass in the unit suite.

### R2 — SUGGESTION — FR10 header-text hit test can pass without checking anything
- Location: `packages/client/src/test/features/grid_view/steps/grid_view_hour_frame_e2e.steps.ts:107-120`
- Rule: `.claude/rules/tdd-workflow.md` (tests assert behaviour); review checklist item 7 (a test that would not catch a regression)
- Problem: the step "where the frame's border crosses a header text of {string}, the topmost element is that text" `continue`s for every header text the frame border does not cross and has no assertion that at least one crossing was checked. Today it does check one (at 390 × 844 the frame borders cross Almaty's zone line), but nothing guarantees that.
- Impact: if a layout change (cell width, scroll target, header wrap) moves the frame clear of every Almaty header text, the FR10 header half of "Notes and header texts cover the frame" turns green without testing that header texts cover the frame.
- Fix: count the checked crossings in the loop and add `expect(checkedCrossings).toBeGreaterThan(0)` after it.
- Fix risk: none — the current baseline layout already produces a crossing with the zone line, so the scenario stays green.
- Status: fixed
- Resolution: the crossing loop in grid_view_hour_frame_e2e.steps.ts now counts checked crossings and asserts the count is above zero; the scenario passes in the BDD E2E run.

## Verdict

Ready. No CRITICAL findings; R1 (WARNING) and R2 (SUGGESTION) are non-blocking test-file housekeeping and can be fixed in the fix-code stage.
