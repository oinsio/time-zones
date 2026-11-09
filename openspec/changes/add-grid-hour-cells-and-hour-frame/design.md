# Design: Add hour cells and the hour frame to the Grid view

Paths are relative to `packages/client/` unless they start with `docs/`. Glossary owners reused or extended (`docs/glossary/`): **Reference day** (`getReferenceDay`), **Day period** (`getDayPeriod`, `DAY_PERIOD_SCHEDULE`), **Clock change** (`findOffsetTransitions`), **Offset edge**, **Reference zone** (`getReferenceZone`), **Effective instant** (`getEffectiveInstant`), **Track move** (`TrackMove`, `getInstantAfterTrackMove`), **Time selection** (`useTimeSelection`), **Day track** (its presented slider values `PresentedDayTrack`), **Hour cell**, **Hour frame**, **Midnight marker** (planned owners `getHourCells` and the new ones below), **Grid row**, **Shared block**. The day-period colours are owned once by `DAY_PERIOD_COLOR_VARIABLES` (`views/shared/dayTrackGradient.ts`), the 12-hour markers by `getDayPeriodMarkers` (`presenter/dayPeriodMarkers.ts`), the formatters by `getDateTimeFormatter` (`presenter/dateTimeFormatters.ts`), and the slider keys by `getTrackMoveForKey` (`views/shared/dayTrackKeys.ts`). No second owner is introduced.

The change follows ADR-0002 (model → presenter → controller → views; selectors return Temporal values and enums, never text), ADR-0003 (hour cells are absolute hours from the reference zone's midnight; :30 / :45 labels), ADR-0007 (the reference zone), ADR-0008 (work bounds, not timings), ADR-0009 (no BigInt; `ResizeObserver` is installed on legacy engines by `installLegacySupport`) and ADR-0011 (the meeting range comes later and builds on these cells). No global decision is made here, so no ADR is needed.

## D1. `getHourCells` and `getHourFrameIndex` in the model

### Context
FR1, FR2, FR5, FR6, FR8, M1, M2. `docs/architecture/domain-model.md` plans `getHourCells(location)` ("start instant, local start time, day period, offset edge, is-midnight flag with the new date (never set in the reference zone's row)").

### Decision
New `src/model/hourCells.ts`, exported from `src/model/index.ts`:

```ts
export type HourCell = {
  start: Temporal.Instant;                 // start of the absolute hour
  localStart: Temporal.ZonedDateTime;      // in the location's zone
  dayPeriod: DayPeriod;                    // getDayPeriod(localStart.toPlainTime())
  hasOffsetEdge: boolean;
  midnightDate?: Temporal.PlainDate;       // set on the midnight cell only
};
export function getHourCells(timeZoneId: string, day: ReferenceDay, referenceZoneId: string): readonly HourCell[];
export function getHourFrameIndex(day: ReferenceDay, instant: Temporal.Instant): number;
```

- Cells: `start = day.start + n hours` for every `n` with `start < day.end` (23 / 24 / 25, a shorter last cell when the day is not whole hours). All arithmetic on `Temporal.Instant`, no BigInt (ADR-0009).
- Day period: `getDayPeriod(localStart.toPlainTime(), DAY_PERIOD_SCHEDULE)`.
- Offset edge: the transitions of `findOffsetTransitions(timeZoneId, day, 0)` (`model/dayPeriodWindows.ts`, margin 0) strictly inside `(day.start, day.end)`; for each, the first cell with `start >= transition` gets `hasOffsetEdge: true`. Only these lookups read zone rules.
- Midnight: a cell is the midnight cell when `timeZoneId !== referenceZoneId` and the local date of its start differs from the local date one hour before its start (`start.subtract({ hours: 1 })`). This marks `0`, `0:30` / `0:45` in fractional zones and the first hour after a skipped midnight, once per date change; it matches the design (Kolkata's first cell `00:30` carries `МАР 8`). `midnightDate` is `localStart.toPlainDate()`.
- Memoization: one module-level cache keyed by `day.start` and `day.end` epoch milliseconds plus `referenceZoneId`, holding a `Map<timeZoneId, readonly HourCell[]>`, reset when the key changes — the same pattern as `getHourLabels` in `presenter/dayTrack.ts`. A second call in the same day returns the same array (NFR-P1).
- `getHourFrameIndex(day, instant)` = `Math.floor(minutes from day.start to instant / 60)`, clamped to `0 … cellCount − 1`. It is the column of the hour frame for every row.
- Constants: `MINUTES_PER_HOUR` exists in `src/constants`; a new `HOUR_CELL_DURATION = { hours: 1 }` goes to the new `src/constants/grid.ts` with the layout constants of D5.

### Consequences
Positive: one pure owner for the cells of every row; the meeting range change reads the same `start` instants.
Negative: the reference zone ID is an input, so the selector stays independent of the location kind (a device time location in the reference zone also shows a plain `0`, which is correct: its day starts there too).

### Alternatives Considered
**Derive the cells from the day track's colour stops**: the stops are gradient positions with blend windows, not hours; mapping back would make the day track a second owner of the hour.
**Midnight marker on the cell that contains local midnight**: for Kolkata it would mark `23:30` with the next date, against the design and against "instead of `0`" (FR5).

## D2. `presentHourStrip` in the presenter

### Context
FR3, FR4, FR5, NFR-P1. The presenter is "the only layer that formats times and dates, applies i18n and the 12/24h preference" (`.claude/rules/architecture.md`).

### Decision
New `src/presenter/hourStrip.ts`, exported from `src/presenter/index.ts`:

```ts
export type PresentedHourCell = {
  key: string;             // start instant ISO string
  hourText: string;        // "9", "12", "0"
  minuteText: string;      // ":30", ":45" or ""
  dayPeriodMarker: string; // "AM" / "PM" in H12, "" in H24
  dayPeriod: DayPeriod;
  hasOffsetEdge: boolean;
  midnightMarker?: { monthText: string; dayText: string };  // "МАР", "8"
};
export type PresentedHourStrip = { cells: readonly PresentedHourCell[] };
export function presentHourStrip(timeZoneId: string, context: HourStripContext): PresentedHourStrip;
```

- `HourStripContext` = `{ day, referenceZoneId, language, hourFormat }`.
- Hour and minute texts come from `localStart.hour` and `localStart.minute` (Temporal fields, no `Intl`): 24-hour `String(hour)`; 12-hour `hour % 12 || 12` (`TWELVE_HOUR_WRAP`); minutes `:` + two digits when not 0. This avoids the zero-padded hour some engines print for `hour: "numeric"` with `hourCycle: "h23"`.
- Day-period marker: `getDayPeriodMarkers(language).am / .pm` in H12, `""` in H24.
- Midnight marker: the `month` and `day` parts of `getDateTimeFormatter(language, timeZoneId, DateTimeLabelKind.LOCAL_DATE, hourFormat).formatToParts(localStart.epochMilliseconds)` — the formatter the row header already builds for its date — month without a trailing `.` and upper-cased with `toLocaleUpperCase(language)` (`мар.` → `МАР`, `Mar` → `MAR`). `formatToParts` is in the `ES2020` lib of `tsconfig.app.json`'s `"lib": ["ES2020", "ES2022.Intl", "DOM", "DOM.Iterable"]`.
- Cache: keyed by `day.start`, `day.end`, `referenceZoneId`, `language`, `hourFormat`, then per zone, like `getHourLabels`; a hit returns the same `PresentedHourStrip` object. No i18n key is added.

### Consequences
Positive: a minute tick re-presents no strip (NFR-P1); cells and Cards share the same formatters and markers.
Negative: a second module-level cache next to `getHourLabels`.

### Alternatives Considered
**Add the strip to every `LocationRow`**: Cards would pay for 24 cells per row it never shows, and the row budget scenarios of Cards would count Grid work.

## D3. `useHourGrid` in the controller

### Context
FR8, FR9, NFR-P1. The rows are presented in `useLocations()` (`src/controller/useLocations.ts`), which re-presents on every `minuteTick` and returns the rows' `rowsContext`.

### Decision
New `src/controller/useHourGrid.ts`, exported from `src/controller/index.ts`:

```ts
export function useHourGrid(): {
  strips: ReadonlyMap<string, PresentedHourStrip>;  // by location ID; absent for a zone the engine rejects
  hourFrameIndex: number;
  cellCount: number;
};
```

It reads `store`, `clock` and `minuteTick` from `LocationsContext` (`useSyncExternalStore(store.subscribe, store.getSnapshot)`), `useHourFormat()` and `useActiveInterfaceLanguage()`, and in one `useMemo` on `[state, minuteTick, language, hourFormat]` computes `now = clock.instant()`, `day = getReferenceDay(state, now)`, `referenceZoneId = getReferenceZone(state)`, `presentHourStrip(location.timeZoneId, …)` for every location (a `RangeError` from an unknown zone leaves that location out), and `getHourFrameIndex(day, getEffectiveInstant(state, now))`. It does not call `useLocations()` again, so the rows are not presented twice. The hour frame follows the clock through `minuteTick`; Now (`RESET_TO_NOW`), the date bar, a typed time and a strip move change `state` (FR9).

### Consequences
Positive: Cards never computes hour cells; Grid's strips update with the same tick as its rows.
Negative: Grid subscribes to the store twice (rows and strips); both read the same snapshot.

### Alternatives Considered
**Compute the strips in the view**: views "render presenter output and emit events only".

## D4. The hour strip is Grid's keyboard time selection; a tap does nothing

### Context
FR11, FR12, FR13, NFR-A2. "Select a time" (`src/test/features/time_selection/time_selection_view_contract_e2e.feature`) moves Moscow's time with `sliderOf(page, "Moscow")` and Page Up (`time_selection_view_contract_e2e.steps.ts`); the task requires Grid back in that scenario, while a tap on a cell must do nothing until the meeting range change. ADR-0002's view contract asks every view to "select a time" and be "fully keyboard operable".

### Decision
- New `views/grid/HourStrip.tsx`: `role="slider"`, `tabIndex={0}`, `aria-label={t("locations.timeSliderLabel", { city })}`, `aria-valuemin={TRACK_VALUE_MIN_MINUTES}`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` from the row's existing `row.dayTrack` (`maxMinutes`, `valueMinutes`, `valueText`), and `onKeyDown` → `getTrackMoveForKey(event.key)` → `onMoveTrack(move)` with `preventDefault()` for a handled key. `onMoveTrack` is `useTimeSelection().moveTrack`, already handed to every row by `ViewLocationList`. A row without `dayTrack` (unknown zone) renders no strip.
- No pointer, mouse or touch handler is attached to the strip or its cells, so a tap dispatches nothing (FR11). The cells are plain `div`s inside the slider (a slider's children are presentational).
- Focus ring: `focus-visible:outline-2 focus-visible:outline-accent` on the strip.
- `getTrackMoveForKey` is exported from `views/shared/index.ts` so `views/grid` imports it through the module's index.
- The pending tag `@grid-pending-hour-cells` and its comment line are removed from "Select a time", and `VIEW_CONTRACT_PENDING_TAGS` in `playwright.bdd.config.ts` becomes an empty record (the mechanism stays for a future view). The step keeps working unchanged because Grid's slider has the same name.

### Consequences
Positive: one time selection model (`TrackMove`) for both views; the contract step needs no per-view branch.
Negative: pointer users select a time in Grid only by typing or the date bar until the meeting range change.

### Alternatives Considered
**Keep the exclusion for "Select a time"**: contradicts the task and leaves Grid without a keyboard time selection.
**Cells as buttons that select their hour**: a tap would select a time, against FR11, and the meeting range change would have to remove it again.
**A per-view step implementation that types the time**: the contract would no longer prove that the view can select a time.

## D5. Layout: one scrolling panel, sticky headers, one frame

### Context
FR1, FR7, FR8, FR10, NFR-R1–R3, UX2, UX3. The design draws the frame once per panel (`docs/design/screens/grid-desktop-light.html`: an `aria-hidden` `<li>` with `position: absolute`, `border: 2px solid`, `z-index: 1`, `pointer-events: none`; header texts `position: relative; z-index: 2` with the surface background).

### Decision
- **Composition.** `ViewLocationList` and `LocationList` take an optional `hourGrid?: HourGridSlots` prop (type in `views/shared/hourGridSlots.ts`, exported): `{ renderHourStrip(row): ReactNode; frame: ReactNode; panelRef: RefCallback<HTMLUListElement>; panelStyle: CSSProperties }`. `LocationRow` takes `hourStrip?: ReactNode` and renders it after `LocationMenu` and before `WallTimeHint` / `ClockChangeNote` (FR7). `views/shared` never imports `views/grid`. `GridView` builds the slots from `useHourGrid()`, `useTimeSelection()` and the layout hook below; Cards passes nothing and is unchanged.
- **Panel.** For `GRID_ROW` the `<ul>` (still `data-row-variant="grid-row"`, border unchanged) is `relative overflow-x-auto overscroll-x-contain` and gets `panelRef` and `panelStyle`. Each row `<li>` is `min-w-full w-max`. The dividers move from the `<ul>` to the row `<li>`s: `LOCATION_ROW_VARIANT_CLASS_NAMES[GRID_ROW].list` drops `divide-y divide-border` and becomes `rounded-md border border-border`, and `.row` adds `border-t border-border first:border-t-0`. Tailwind's `.divide-y > :not([hidden]) ~ :not([hidden])` (specificity 0,3,0) would otherwise also match the frame `<li>`, which follows the rows, and override its `border-2 border-accent` with a 1 px top border in the border colour; with the dividers on the rows the frame, which is not a row, gets none. The divider pixels and Cards stay the same. The row header block (drag handle, `ZoneRowContent`, location menu) and the notes are wrapped, for `GRID_ROW` only, in a `sticky left-0` box whose width is the panel's client width (`--grid-panel-width`), so they stay in place while the strips scroll (UX3); autoprefixer already runs in `postcss.config.js` for legacy Safari. The class names live in `LOCATION_ROW_VARIANT_CLASS_NAMES` (`views/shared/locationRowVariant.ts`); `LocationRow.tsx` (183 lines today) stays under 200 lines.
- **Cell width.** New pure `views/grid/hourCellLayout.ts`: `getHourCellLayout(stripWidthPx, cellCount)` returns `{ cellPitchPx, isScrollable }`: `stripWidthPx / cellCount` when that is `>= MIN_FITTING_HOUR_CELL_PX` (32), otherwise `clamp(stripWidthPx / NARROW_VISIBLE_HOUR_CELLS, NARROW_HOUR_CELL_MIN_PX, NARROW_HOUR_CELL_MAX_PX)` (9, 36, 40). The pitch includes the `HOUR_CELL_GAP_PX` (2) gap, as the design's numbers do (phone in landscape: 844 px gives a pitch of 32.4 px). Constants in `src/constants/grid.ts`. `views/grid/useHourStripScroll.ts` measures the panel's client width with `ResizeObserver` (view state, never stored) and sets `--grid-panel-width`, `--hour-cell-pitch` and `--hour-cell-count` on `panelStyle`; the strip is a CSS grid `repeat(var(--hour-cell-count), …)` with the gap.
- **Scroll.** `useHourStripScroll` also scrolls the panel (`scrollLeft`) on mount and whenever `hourFrameIndex` changes to a column outside the visible part, so the framed column is centred where the strip allows (NFR-R2). Smooth scrolling is skipped when `usePrefersReducedMotion()` is true.
- **Frame.** New `views/grid/HourFrame.tsx`: the last child of the `<ul>`, an `<li aria-hidden="true">` with `absolute`, `top`/`bottom` 4 px, `left = row padding + index × pitch − inset`, width `pitch + 2 × inset`, `rounded-lg border-2 border-accent pointer-events-none z-[1]`, with `data-hour-frame-index` for tests. Hidden when there are no rows. The z-order is set on the sticky boxes themselves, because a `position: sticky` box always forms its own stacking context and a z-index on the texts inside it would only order them within that box: for `GRID_ROW` the sticky header box and the sticky notes box get `z-[2]` (no `relative`, which would replace `sticky`; a sticky box is already positioned, so `z-index` applies) and stay transparent, while the header texts (city, difference, zone line parts, date, time button) keep `bg-surface` and the notes `bg-notice`. The frame at `z-[1]` therefore paints under both boxes, shows only in the gaps between the texts and is interrupted behind them (FR10). The classes live in the variant map. The framed column's cells get `font-bold` (FR8).
- **Location menu over the panel.** The dropdown of `LocationMenu` is an `absolute` element inside the row, not a portal; inside the `overflow-x-auto` panel (whose `overflow-y` then computes to `auto`) it would be clipped at the panel's edge, and inside a row's `z-[2]` sticky header box it would be painted under the next row's box. For `GRID_ROW` only, through a new `isMenuFixedToViewport` flag of `LOCATION_ROW_VARIANT_CLASS_NAMES` (`false` for `CARD`) that `LocationRow` passes to `LocationMenu`: the open dropdown is `position: fixed`, right-aligned to the trigger and placed under it from the trigger's `getBoundingClientRect()`, re-read on `scroll` (capture phase, so the panel's scroll counts) and `resize` while open; a fixed box is not clipped by the panel's overflow. The sticky header box gets `focus-within:z-[3]`: an open menu always holds the focus (it opens on its first item and closes on blur), so the open row's box rises above the following rows' `z-[2]` boxes. `:focus-within`, `position: fixed` and `getBoundingClientRect()` all exist on iOS Safari 12 (ADR-0009); `:has()` is not used. The positioning lives in a small hook `views/shared/useFixedMenuPosition.ts` so that `LocationMenu.tsx` (177 lines today) stays under 200 lines. Cards keeps the `absolute` dropdown.
- **Two-line header below 768 px.** For `GRID_ROW` the date-and-time column is `flex-col-reverse` below `md` (time above date, right-aligned) and `md:flex-row` from it, keeping the date before the time in the DOM (NFR-R3).

### Consequences
Positive: native touch scrolling moves every strip together; one frame element crosses all rows, dividers included.
Negative: the row header of a grid row gains a wrapper and a measured width; `LocationList` and `LocationRow` gain optional props; the grid row's location menu positions itself from the trigger while open, a second code path beside Cards' `absolute` dropdown.

### Alternatives Considered
**One scroll container per strip, synchronised by `scroll` events**: jitters on touch devices, and the frame would have to be redrawn per row on every scroll event.
**CSS-only widths by media queries**: the 32 px rule depends on the cell count (23 / 24 / 25), which a media query does not know.

## D6. Tokens for the cells

### Context
FR4, FR5, FR6, UX1; `docs/architecture/views.md` → Visual style → Grid.

### Decision
- New tokens in `src/styles/tokens.css` for light, dark and the system-dark block: `--color-midnight-shade` (`rgba(24, 24, 27, 0.10)` / `rgba(15, 23, 41, 0.22)`) and `--color-hour-cell-foreground` (light `#18181b`, dark `#0f1729`), with `tailwind.config.ts` colour names `midnight-shade` and `hour-cell-foreground`.
- Cell background: `var(DAY_PERIOD_COLOR_VARIABLES[cell.dayPeriod])`. Digits: `hour-cell-foreground` on morning, working-hours and evening cells, `foreground` on night cells (dark night `#56679a` needs light digits for contrast). Midnight shade: an inset `box-shadow` of `--color-midnight-shade`. Offset edge: an inset 3 px left `box-shadow` of `--color-foreground`.
- Cell height and gap per the design: 52 px desktop, 48 px tablet, 38 px phone in landscape, 44 px phone in portrait, by breakpoint classes in `views/grid/HourStrip.tsx`.

### Consequences
Positive: both themes come from tokens; no colour literal in a component.
Negative: two more tokens to keep in sync across the three theme blocks.

### Alternatives Considered
**Reuse `--color-overlay` with opacity for the shade**: the design's dark shade is not the overlay colour.

## D7. Tests that change with the skeleton

### Context
FR1, FR13, NFR-R4. The skeleton's tests assert the absence of hour cells by the absence of any slider.

### Decision
- `src/views/shared/ViewLocationList.test.tsx` "should show no day track slider" and the step "no row has a day track" in `src/test/features/main_page/steps/main_page_grid_view_unit.steps.tsx` assert the absence of `[data-day-track]` (the `DayTrack` root attribute) instead of `role="slider"`; the unit scenario "Rows in one panel without hour cells" becomes "Rows in one panel with hour strips" with a new step "every row has an hour strip after its row header".
- The scenario outline "Approved screenshots of Grid at <width> px in the <theme> theme" in `main_page_grid_view_e2e.feature` is replaced by the outline of `main-page` → Grid view rows at four sizes, using the existing steps "the locations interface language is Russian", `/^the list holds (.+) and home is "([^"]+)"$/` (`home_location_e2e.steps.ts`), "the screen is {int} by {int} px for the locations" (`locations_reorder_drag_e2e.steps.ts`) and "the locations screen matches the approved screenshot" (`locations_layout_e2e.steps.ts`); the four old `Approved-screenshots-of-Grid-at-1024-px-*` PNGs under `src/test/features/__screenshots__/` are deleted.

### Consequences
Positive: the skeleton's guarantees stay tested; Cards' slider tests are untouched.
Negative: eight new baselines per Playwright project.
