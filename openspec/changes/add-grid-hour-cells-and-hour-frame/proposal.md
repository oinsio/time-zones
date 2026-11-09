# Add hour cells and the hour frame to the Grid view

No other active change touches the capabilities this change modifies: the only one, `add-pr-preview-deploy`, changes `app-delivery`. It builds on the archived `add-view-mode-setting-and-grid-skeleton` (2026-11-09), which left the Grid view as rows of row headers without hour cells.

## Why

The Grid view exists today only as a skeleton: one panel of row headers, no hour cells (`openspec/specs/main-page/spec.md` → "Grid view skeleton": "MUST NOT contain a day track or hour cells"). A user who picks Grid sees nothing Cards does not show better. The design of Grid without a meeting is approved (`docs/design/README.md` → Grid, the "Now" screens; `docs/architecture/views.md` → Grid, Hour frame and meeting frame, Visual style), and the time model it needs is decided: hour cells are absolute hours of the reference day labelled with each location's local start time (ADR-0003 → "Hour cells are absolute hours"; ADR-0007 → the reference day starts at the reference zone's midnight).

This change makes Grid usable for its purpose: under every location a strip of hour cells over the reference day, aligned across all rows and coloured by day period, so working hours that overlap are seen at a glance, and an hour frame on the hour of the reference moment. The meeting range (ADR-0011) is the next change and builds on these cells.

Audience: users who plan across zones on a desktop, tablet or phone; the developer of the meeting range change, who adds taps and drags to these cells.

## What Changes

- ADDED capability `grid-view`:
  - **Hour cells**: each grid row shows an hour strip, one hour cell per hour of the reference day (24, or 23 / 25 on a clock change day in the reference zone), in the same columns in every row; each cell shows the location's local start time (`9`, `9:30`, 12 / 24-hour format), is coloured by the location's day period, shows the midnight marker (`МАР` / `8`, shaded) where the location's date changes except in the reference zone's row, and an offset edge (a line on its left side) after a clock change inside the reference day.
  - **Hour frame**: an accent frame across all rows around the column of the effective instant, bold text inside it; it follows the clock while live, stays on the pinned moment's hour, and returns with Now; it lies behind the row header texts and row notes.
  - **Time selection on the hour strip**: the hour strip of each row is the Grid view's time selection control for the keyboard — a slider with the name, value and keys of the day track; a tap or click on a cell changes nothing in this change.
  - **Hour strip width**: all cells visible when each gets at least 32 px; otherwise cells of 36–40 px, about 9 visible, all strips scrolling horizontally together, scrolled on opening so that the hour frame is visible.
  - **Hour strips are fast**: work bounds for presenting the strips.
- REMOVED `main-page` → **Grid view skeleton**, replaced by ADDED `main-page` → **Grid view rows**: the same rows, and they carry their hour strips; row notes come after the strip; below 768 px the row header takes two lines as in the phone design; the page itself still never scrolls horizontally, only the strips may.
- REMOVED `main-page` → **View contract runs for every registered view**, replaced by ADDED `main-page` → **View contract runs every scenario for every registered view**: no scenario is excluded for Grid any more; the exclusion marker `@grid-pending-hour-cells` and its configuration entry are removed.
- MODIFIED `time-selection` → **Select a time in every view**: Grid passes "Select a time" through the slider of its hour strip.
- Glossary (`docs/glossary/time-selection.md`, `docs/glossary/views.md`):
  - **Hour cell**, **Hour frame**, **Midnight marker** lose *(planned)* and get their *Code:* owners; **Hour cell** no longer says that a tap sets a meeting range "now" — that comes with the meeting range change;
  - new **Hour strip** — the row of hour cells under a grid row's header; the Grid view's slider for the keyboard;
  - **Offset edge** also names the line on the left side of the first hour cell after a clock change inside the reference day;
  - **Grid view**, **Grid row** and **View contract** drop "until the hour cells exist" and the pending tag.
- Docs: `docs/architecture/views.md` (Catalog status of Grid, the view contract paragraph without the pending tag, Hour frame: the hour strip as keyboard slider), `docs/architecture/domain-model.md` (`getHourCells` with its real inputs, `getHourFrameIndex`).

## Capabilities

### New Capabilities

- `grid-view`: the hour cells of the Grid view, the hour frame, the keyboard time selection on the hour strip, the width and horizontal scrolling of the strips, and their work bounds.

### Modified Capabilities

- `main-page`: "Grid view skeleton" is replaced by "Grid view rows" (the hour strips, the order of the row notes, the two-line row header below 768 px, screenshots at four sizes); "View contract runs for every registered view" is replaced by "View contract runs every scenario for every registered view" (no exclusion for Grid).
- `time-selection`: "Select a time in every view" — Grid passes it with its hour strip.

## Goals

- G1: Grid answers "where do working hours overlap?" in one look: every location's day periods over the same absolute hours, aligned in columns, matching the approved design without a meeting.
- G2: The reference moment is visible in Grid as the hour frame, in live and pinned mode alike.
- G3: Grid passes every view-contract scenario, with no pending exclusion left.
- G4: The meeting range change only adds pointer gestures and the meeting frame on top of these cells, without reshaping them.

## Non-Goals

- NG1: No meeting range: no tap or drag on cells that sets one, no meeting frame, meeting handles, meeting bar, Share meeting or Clear meeting (ADR-0011; the next change).
- NG2: No day shift mark («днём раньше / днём позже») in the row header.
- NG3: No setting for cell colouring (working hours only, none); cells are coloured by day period only.
- NG4: No change to the Cards view, its day track or its hour labels.
- NG5: No pointer time selection on the hour strip: a tap, click or drag on a cell changes nothing yet.
- NG6: No weekend marking and no user-defined day-period schedule (`DAY_PERIOD_SCHEDULE` stays the constants).

## Users & Scenarios

- U1: A desktop user in Almaty with colleagues in Moscow, Kolkata and New York opens Grid and sees four strips of 24 cells; the yellow working-hour cells of Almaty and Moscow overlap from 11 to 18 Almaty time, and the blue frame stands on 12, the current hour.
- U2: On 8 March 2026 the New York row shows a dark line before its `3` cell (clocks moved forward at 02:00) and `МАР` / `8` where its new date starts; the Almaty row starts with a plain `0`.
- U3: A user selects the next day with the date bar; every strip shows the next reference day and the frame stays on the same hour; Now brings the frame back to the current hour.
- U4: A phone user in portrait sees about 9 cells per row, already scrolled so that the frame is visible, and swipes one strip: all strips move together.
- U5: A keyboard user tabs to the hour strip of Moscow and presses Page Up: every row's time moves one hour forward and the frame moves one column right.

## Requirements

### Functional

- FR1: In Grid, every row is the row header followed by its hour strip, all rows in one panel with dividers. The hour cells of all rows stand in the same columns: the cells in one column of every row cover the same absolute hour.
- FR2: An hour strip has one hour cell for every hour of the reference day, counted in absolute time from the reference zone's local midnight: 24 cells on an ordinary day, 23 or 25 on a day with a clock change in the reference zone. A reference day whose length is not a whole number of hours ends with one shorter cell.
- FR3: A cell shows the location's local wall-clock time at the cell's start: the hour without a leading zero (`9`, `0`), with the minutes when they are not zero (`9:30`, `5:45`). In the 12-hour format the hour is the 12-hour clock hour (`9`, `12`) with the interface language's day-period marker; in the 24-hour format there is no marker. The format follows the hour format setting and changes at once when it changes.
- FR4: A cell is coloured by the location's day period at the cell's start (night, morning, working hours, evening — the day-period schedule), with the day-period colours of the active theme, the same colours the day track uses; in the dark theme the digits on morning, working-hours and evening cells use `#0F1729`.
- FR5: The cell whose start is the first instant of a new local date of the location (the cell that would show `0`, or `0:30` in a :30 zone, or the first hour after a skipped midnight) is the midnight cell of the row: it shows the short month name in upper case without a trailing full stop over the day of the month (`МАР` / `8`, `MAR` / `8`) instead of the time, and is shaded with the midnight cell shade of the active theme. The row of a location in the reference zone shows a plain `0` on its first cell and has no midnight cell.
- FR6: When the location's UTC offset changes inside the reference day, the first cell that starts at or after the change shows an offset edge: a line in the foreground colour on its left side. A row with no clock change inside the reference day shows none.
- FR7: The row notes of a grid row (the wall-time hint, the clock change note) come after its hour strip.
- FR8: An hour frame in the accent colour of the active theme surrounds, across all rows, the column of the hour cell that contains the effective instant. The texts of the framed cells are bold.
- FR9: While the reference moment is live, the hour frame moves to the next column when the clock reaches the next hour cell. While it is pinned (a date chosen in the date bar, a time typed, a time selected on an hour strip), the frame stays on the pinned instant's column. Now returns it to the column of the current time.
- FR10: The hour frame lies behind the row header texts and the row notes: they keep the surface (or note) background, the frame is interrupted behind them and never covers them, and it never takes a pointer event.
- FR11: A tap, click or drag on an hour cell changes nothing: no command is dispatched, the reference moment and the frame stay where they were.
- FR12: The hour strip of each row is a slider for the keyboard with the day track's name, value and keys: its accessible name is "Time in {city}" / «Время — {city}», its value the minutes since the start of the reference day (0 to the track end), its value text the row's local time and date; Arrow keys move the reference moment by the track step, Page Up / Page Down by one hour, Home / End to the start of the reference day / the track end. Each move pins the reference moment and moves every row's time and the hour frame.
- FR13: The view contract runs every `@view-contract` scenario for Grid, "Select a time" included; no pending exclusion tag remains for any view.

### Non-Functional

#### Performance

- NFR-P1: Presenting the hour strips of 50 rows a second time within the same reference day, language and hour format (as every minute tick does) builds no formatter, looks up no time zone transition and returns the same strip object for every row. Presenting them the first time looks up at most `MAX_TRANSITION_LOOKUPS_PER_ZONE` (2) transitions and builds at most `MAX_FORMATTERS_PER_ZONE` (3) formatters per zone. Timings come from a `*.bench.ts` benchmark (ADR-0008), never from a blocking test.

#### Accessibility

- NFR-A1: With hour cells, Grid has no axe-core violations in the light and the dark theme, live and after a time selection on an hour strip. Each hour strip is one Tab stop, right after its row's location menu button and before the next row's controls, with a visible focus ring in the accent colour; the cells inside it are not separate Tab stops and are not read one by one (the slider's value text speaks for them).
- NFR-A2: The keyboard alone selects a time in Grid (FR12) and the view contract's keyboard scenarios pass for Grid.

#### Responsive

- NFR-R1: When the hour strip's width divided by its cell count is at least 32 px, all cells of the reference day are visible without scrolling (desktop 1440 px, tablet 1180 px, phone in landscape 844 px).
- NFR-R2: Otherwise (phone in portrait) every cell takes the width that shows 9 cells, kept between 36 px and 40 px; the strips of all rows scroll horizontally together, the page itself does not scroll horizontally, and on opening the strips are scrolled so that the hour frame is fully visible. When the frame moves to a column outside the visible part, the strips scroll to show it.
- NFR-R3: Below 768 px the row header takes two lines as in the phone design: city and offset difference with the time on the first line, the zone line with the date on the second; from 768 px it stays one line.
- NFR-R4: Approved screenshots of Grid with the design's sample data (8 March 2026, 12:30 in Almaty, home Almaty, Almaty, Moscow, Kolkata, New York, Russian interface) at desktop 1440 × 900, tablet 1180 × 820, phone in landscape 844 × 390 and phone in portrait 390 × 844, each in the light and the dark theme, match on every run; they replace the two skeleton screenshots at 1024 px.

## UX Acceptance Criteria

- UX1: The cells read like the design's "Now" screens (`docs/design/screens/grid-*-light.png`, `grid-desktop-dark.png`): rounded pastel cells with a small gap, the :30 minutes smaller under the hour, the month small and bold over the day in the midnight cell, the frame with rounded corners a little wider than the cell.
- UX2: The frame reads as one column across the whole panel: it is not drawn per row, and it runs through the dividers and behind the row header lines.
- UX3: On a phone in portrait the strips feel like one sheet: a swipe on any row moves all rows, and the header and the notes of each row stay in place while the strips move.

## UI States Matrix

Grid adds no data loading; the cells are computed from the location list and the reference moment. Every other state is the main page's:

| Network | Data | UI |
|---|---|---|
| any | Grid, list present, live | hour strips, frame on the current hour, following the clock (FR8, FR9) |
| any | Grid, list present, pinned | frame on the pinned instant's hour; Now active (FR9) |
| any | Grid, list empty | the empty-state explanation and the header "Add location" action; no strips, no frame (unchanged) |
| any | Grid, stored list unreadable | the load error with Reset; no strips, no frame (unchanged) |
| any | Grid chunk loading | the view skeleton (`ViewSkeleton`, unchanged) |
| offline, Grid chunk not cached | Grid chunk fails to load | the view error with Retry (`ViewErrorFallback`, unchanged) |
| offline | Grid, list present | Grid works fully with its cells and frame; no note (unchanged) |
| any | storage unavailable | the storage warning; cells and frame work for the session (unchanged) |
| any | a zone the engine rejects | the row shows no hour strip, like a row without a day track today; the other rows are unaffected |

## Behavior

- New `packages/client/src/test/features/grid_view/` with `grid_view_hour_cells.feature`, `grid_view_hour_frame_unit.feature`, `grid_view_hour_strip_budget.feature` (unit BDD) and `grid_view_hour_cells_e2e.feature`, `grid_view_hour_frame_e2e.feature`, `grid_view_width_e2e.feature`, `grid_view_screenshots_e2e.feature` (playwright-bdd), tagged `@add-grid-hour-cells-and-hour-frame`.
- Changed `main_page_grid_view_unit.feature` and `main_page_grid_view_e2e.feature` (the skeleton's "no hour cells" and 1024 px screenshot scenarios), `time_selection_view_contract_e2e.feature` (the pending tag removed).

## Visual Reference

No Figma. Screens: `docs/design/screens/grid-desktop-light.*`, `grid-desktop-dark.*`, `grid-tablet-light.*`, `grid-phone-landscape-light.*`, `grid-phone-portrait-light.*` ("Now" column of `docs/design/README.md` → Grid). Colours from the design tokens; new tokens for the midnight cell shade and the dark cell digits from `docs/architecture/views.md` → Visual style.

## Affected IA

No changes.

## Success Metrics

- M1: With the sample data (current time `2026-03-08T07:30:00Z`, reference zone `Asia/Almaty`), 4 of 4 rows have 24 cells, and these columns (0-based) hold: Almaty column 0 `0`, no midnight cell; Moscow column 0 `22`, column 2 the midnight cell `МАР` / `8`; Kolkata column 0 the midnight cell `МАР` / `8`, column 23 `23:30`; New York column 10 the midnight cell, column 11 `1`, column 12 `3` with the offset edge, and 0 offset edges in the other 3 rows.
- M2: With the reference zone `America/New_York`, the reference day 2026-03-08 has 23 cells and 2026-11-01 has 25, in 2 of 2 checks.
- M3: The hour frame is on column 12 at `07:30Z` live, on column 13 after the clock passes `08:00Z` without any user action, stays on column 12 for 2 of 2 pinned moments (typed time, next day in the date bar) after the clock passes `08:00Z`, and is on the current column after Now — 5 of 5 checks.
- M4: At 1440, 1180 and 844 px wide all 24 cells are visible (3 of 3); at 390 × 844 every cell is 36–40 px wide, between 8 and 10 cells are visible, the frame is fully visible on opening, and one horizontal scroll moves 4 of 4 strips by the same distance.
- M5: The view contract for Grid runs 100 % of the `@view-contract` scenarios ("Select a time" included), and `grid-pending-hour-cells` has 0 matches under `packages/client/` and `docs/`.
- M6: axe-core reports 0 violations on Grid with cells in 2 of 2 themes, live and pinned.
- M7: 8 approved Grid screenshots (4 sizes × 2 themes) pass on every run of each Playwright project.
- M8: Re-presenting 50 hour strips builds 0 formatters and looks up 0 transitions.

## Open Questions

None. How the Grid view selects a time with the keyboard while a tap does nothing yet, and how the strips scroll together, are settled in `design.md` (D4, D5).

## Impact

- `packages/client/src/model/` (new `hourCells.ts`: `getHourCells`, `getHourFrameIndex`), `src/presenter/` (new `hourStrip.ts`: `presentHourStrip`), `src/controller/` (new `useHourGrid.ts`), `src/constants/` (new `grid.ts`), `src/styles/tokens.css` and `tailwind.config.ts` (midnight shade, dark cell digits), `src/views/grid/` (new `HourStrip.tsx`, `HourFrame.tsx`, `hourCellLayout.ts`, `useHourStripScroll.ts`; `GridView.tsx`), `src/views/shared/` (`ViewLocationList`, `LocationList`, `LocationRow`, `locationRowVariant.ts`, `index.ts` exports of `getTrackMoveForKey` and `DAY_PERIOD_COLOR_VARIABLES`).
- Tests: new `src/test/features/grid_view/`, changed skeleton Grid features and `ViewLocationList.test.tsx`, the view-contract feature and `playwright.bdd.config.ts`, new Grid screenshot baselines, a new `src/test/benchmarks/hourStrip.bench.ts`.
- Docs: `docs/glossary/time-selection.md`, `docs/glossary/views.md`, `docs/architecture/views.md`, `docs/architecture/domain-model.md`.
- No new dependency, no new locale key, no stored data change.
