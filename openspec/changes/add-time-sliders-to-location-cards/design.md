# Design: Add time sliders to location cards

## Context

Driven by FR1–FR9, NFR-P1, NFR-P2, NFR-A1–NFR-A3, NFR-R1–NFR-R3 and UX1–UX3 of `proposal.md` (see proposal.md — Why). Current state, checked in `packages/client/src/`:

- `model/locations.ts` (153 lines): `LocationsState = { locations, deviceTimeZoneId, reference }`. `LocationCommandType` has `ADD_LOCATION`, `REMOVE_LOCATION`, `REPLACE_LOCATIONS`, `MOVE_LOCATION`, `SET_DEVICE_TIME_ZONE`, `SET_DATE`, `SHIFT_DATE` and `RESET_TO_NOW`. `LocationErrorCode` ends with `INVALID_DATE` and `DATE_OUT_OF_RANGE`. There is no `SELECT_INSTANT` and no `INVALID_INSTANT`.
- `model/referenceMoment.ts`: `ReferenceMoment` is either `{ mode: LIVE }` or `{ mode: PINNED; instant; wallClockStatus; requestedWallTime }`. It also holds `getReferenceZone(state)`, which returns `deviceTimeZoneId` because no home exists, and `getEffectiveInstant(state, now)`. `model/reduceReferenceMoment.ts` (101 lines) reduces the three date commands and returns the same state object when nothing changes.
- `model/wallClock.ts`: `resolveWallClock` and `WallClockStatus` (`UNIQUE`, `GAP`, `AMBIGUOUS`).
- `model/store.ts`: `createStore` notifies subscribers only when the reducer returns a new state object.
- `controller/LocationsProvider.tsx`: list commands go through `dispatchAndSchedule`, which schedules a storage write. `controller/useReferenceMoment.ts` dispatches the date commands with `store.dispatch` directly, so they are never written. It builds the date bar, and its gap note is shown while `reference.wallClockStatus === GAP`.
- `controller/useLocations.ts` (47 lines) presents rows with `presentLocationRows(locations, { language, instant: getEffectiveInstant(state, clock.instant()), translate, deviceTimeZoneId })` in a `useMemo` that also depends on `minuteTick`.
- `presenter/presentLocationRows.ts` (77 lines): `LocationRow` has `id`, `cityLabel`, `countryName`, `utcOffsetLabel`, `deviceTimeZoneLabel`, `localTimeLabel`, `localDateLabel` and `localIsoDate`. `presenter/localDateTime.ts` holds `formatLocalTime` and `formatLocalDate`.
- `views/shared/LocationRow.tsx` (129 lines): an `<li>` with a flex row holding `DragHandle` (dnd-kit `listeners` are on the handle only), the place column (`md:w-64`), `LocalDateTime` and the remove button. `views/shared/LocationList.tsx` uses a `PointerSensor` with `REORDER_POINTER_ACTIVATION_DISTANCE_PX` and a `KeyboardSensor`. Both are attached through the drag handle, so pointer and key events on other card elements do not start a reorder. `views/cards/CardsView.tsx` reads `useLocations()` and passes `rows` to `LocationList`.
- `styles/tokens.css` defines `--color-day-night`, `--color-day-morning`, `--color-day-working` and `--color-day-evening` for light and dark. `tailwind.config.ts` maps them to `day.night`, `day.morning`, `day.working` and `day.evening`.
- `constants/keyboard.ts`: `KeyboardKey` already has `ARROW_LEFT`, `ARROW_RIGHT`, `ARROW_UP`, `ARROW_DOWN`, `HOME`, `END`, `PAGE_UP` and `PAGE_DOWN`. `constants/utcOffset.ts` exports `MINUTES_PER_HOUR`.
- `lib/temporal.ts`: `Clock` and `fakeClock(isoTimestamp, timeZone)`. `temporal-polyfill` is 0.3.2 (lockfile). `tsconfig.app.json` sets `lib` to `ES2020`, `ES2022.Intl`, `DOM` and `DOM.Iterable`, and `target` to `ES2020`. That covers `Element.setPointerCapture`, `PointerEvent` and `Intl.DateTimeFormat` with `hour` / `minute` / `hourCycle`. The Temporal types come from the polyfill package.
- E2E (`playwright.bdd.config.ts`): the device zone is `Asia/Almaty` (`E2E_DEVICE_TIME_ZONE`). The projects are `chromium`, `mobile-chrome` and one `view-contract-<id>` per registered view. Time is fixed with the step "the current time is {string}" (`locations/steps/locations_local_time_e2e.steps.ts`).

Binding decisions followed (all `Accepted`):

- ADR-0002: layers, commands as JSON data, memoized selectors, view state in the view, view contract.
- ADR-0003: one reference instant, `selectInstant` pins it, not persisted. Its "Hour cells are absolute hours" rule is applied here to the track.
- ADR-0004: only repositories write, and the reference moment is never written.
- ADR-0005: shared blocks live in `views/shared/`.
- ADR-0007: "the day shown on every slider track" starts at local midnight of the reference zone, which is the device zone while no home exists.
- ADR-0001: browser-only checks go in `*_e2e.feature`.
- ADR-0006: not touched.

No global decision is needed. Every decision below is local to this change.

## Goals / Non-Goals

**Goals:** keep all day, step and colour arithmetic in the pure model. Compute colour stops once per zone and reference day, not on every drag step. Make the track a shared block, so a later Grid or other view can reuse it.

**Non-Goals:** a generic slider component for other features. Any change to the stored schema, the repositories or the date bar's layout.

## Decisions

### D1. Model: `SELECT_INSTANT` (FR3, FR5, FR8)

Add `SELECT_INSTANT` with `{ instant: string }` (ISO 8601 with `Z`) to `LocationCommandType` / `LocationCommand`, and `INVALID_INSTANT` to `LocationErrorCode`. `reduceLocations` delegates to a new `model/reduceSelectInstant.ts`, which does the following:

- It parses with `Temporal.Instant.from`. A `RangeError` returns `INVALID_INSTANT` with the state unchanged. `Instant.from` rejects a timestamp without an offset.
- If the moment is already pinned to an equal instant, it returns the same state object, so the store does not notify (FR3).
- Otherwise it returns `{ mode: PINNED, instant, wallClockStatus: UNIQUE, requestedWallTime: instant in the reference zone .toPlainTime() }`.

The `UNIQUE` status ends the gap note without touching `useReferenceMoment` (FR5, `date-selection` delta). `requestedWallTime` is the wall time that a later `SET_DATE` / `SHIFT_DATE` keeps, because `moveToDate` reads the effective instant's wall time.

The command carries only an ISO string, so `JSON.parse(JSON.stringify(command))` replays it (ADR-0002). It needs no `now`, because it never reads the current instant. Keyboard moves also become `SELECT_INSTANT`: the controller works out the target with D2 (see "Alternatives Considered" for `SHIFT_TIME`).

### D2. Model: reference day and track arithmetic (FR1–FR4)

New `model/dayTrack.ts` (pure):

```
type ReferenceDay = { start: Temporal.Instant; end: Temporal.Instant; lengthMinutes: number }
getReferenceDay(state, now): ReferenceDay
    // zdt = getEffectiveInstant(state, now) in getReferenceZone(state)
    // start = zdt.startOfDay(), end = zdt.add({ days: 1 }).startOfDay(), length in absolute minutes
getTrackFraction(day, instant): number                // elapsed ns / length ns
getTrackValueMinutes(day, instant): number            // floor of elapsed minutes (aria-valuenow)
getLastTrackStepMinutes(day): number                  // lengthMinutes − TRACK_STEP_MINUTES (aria-valuemax)
getInstantAtTrackFraction(day, fraction): Temporal.Instant
    // round(fraction × lengthMinutes / step) × step, clamped to [0, last step], added to start
enum TrackMove { NEXT_STEP, PREVIOUS_STEP, HOUR_FORWARD, HOUR_BACK, DAY_START, DAY_END }
getInstantAfterTrackMove(day, instant, move): Temporal.Instant
    // v = elapsed minutes (may be fractional)
    // NEXT_STEP: floor(v/step)·step + step, PREVIOUS_STEP: ceil(v/step)·step − step
    // HOUR_FORWARD: floor(v/step)·step + 60, HOUR_BACK: ceil(v/step)·step − 60
    // DAY_START: 0, DAY_END: last step; each clamped to [0, last step]
```

`ZonedDateTime.startOfDay()` handles zones whose midnight is skipped. Lengths come from absolute instants, so 23- and 25-hour days work (`temporal.md`: "Assume a day has 24 hours" is forbidden). Elapsed minutes come from `day.start.until(instant).total({ unit: "minute" })`. Constants go in a new `constants/timeSelection.ts`: `TRACK_STEP_MINUTES = 15`, `TRACK_HOUR_MOVE_MINUTES = 60`, `HOUR_LABEL_INTERVAL_HOURS = 6` (and `TRACK_TOUCH_SLOP_PX` of D7). The steps count from the start of the reference day, not from local hours, so every zone, including :30 and :45 zones, lands on quarter hours of the reference zone.

### D3. Model: day periods and their schedule (FR6)

New `model/dayPeriods.ts` holds `enum DayPeriod { NIGHT, MORNING, WORK, EVENING }` (the names in `domain-model.md`), the `DayPeriodBoundary` type and `getDayPeriod(wallTime: Temporal.PlainTime, schedule)`. The schedule is a parameter, as `domain-model.md` "Day periods" requires.

The enum stays next to the domain model, as the `code-style.md` table places enums. The business values go in a new `constants/dayPeriods.ts` as primitives:

- `MORNING_START_WALL_TIME = "07:00"`, `WORK_START_WALL_TIME = "09:00"`, `EVENING_START_WALL_TIME = "18:00"`, `NIGHT_START_WALL_TIME = "22:00"`;
- `NIGHT_BOUNDARY_BLEND_MINUTES = 60` and `WORK_BOUNDARY_BLEND_MINUTES = 15`.

`model/dayPeriods.ts` builds the MVP schedule from them:

```
DAY_PERIOD_SCHEDULE: readonly DayPeriodBoundary[] = [
  { wallTime: MORNING_START_WALL_TIME, from: NIGHT,   to: MORNING, blendMinutes: NIGHT_BOUNDARY_BLEND_MINUTES },
  { wallTime: WORK_START_WALL_TIME,    from: MORNING, to: WORK,    blendMinutes: WORK_BOUNDARY_BLEND_MINUTES },
  { wallTime: EVENING_START_WALL_TIME, from: WORK,    to: EVENING, blendMinutes: WORK_BOUNDARY_BLEND_MINUTES },
  { wallTime: NIGHT_START_WALL_TIME,   from: EVENING, to: NIGHT,   blendMinutes: NIGHT_BOUNDARY_BLEND_MINUTES },
]
```

`constants/` therefore never imports `@/model`. `model/locations.ts` already imports `@/constants`, so the reverse import would be a cycle.

### D4. Model: colour stops, collected and assembled separately (FR6, NFR-P2)

New `model/dayPeriodStops.ts`:

```
type DayPeriodStop = { fraction: number; period: DayPeriod }
collectBlendWindows(timeZoneId, day, schedule): BlendWindow[]
    // for each local date from (start's local date − 1) to end's local date,
    // for each boundary: wanted = PlainDateTime(date, wallTime)
    //   zdt = wanted.toZonedDateTime(zone, { disambiguation: "earlier" })
    //   zdt.toPlainDateTime() differs from wanted → the wall time is in a gap → skip the boundary (FR6)
    //   an overlap yields the earlier instant (FR6); "reject" is not used because it throws for overlaps too
    //   window = [boundary − blend/2, boundary + blend/2] in absolute time; keep it if it intersects [start, end]
collectOffsetEdges(timeZoneId, day, schedule): OffsetEdge[]
    // zdt.getTimeZoneTransition("next") from start until past end; for each transition t:
    //   period before = getDayPeriod(local time at t − 1 ns), after = getDayPeriod(local time at t)
    //   keep only when they differ
assembleDayPeriodStops(windows, edges, day): DayPeriodStop[]     // pure on plain data
    // each window → two stops (fraction of its start, from) and (fraction of its end, to)
    // each edge → two stops at the same fraction (before, after) = hard edge
    // sorted by fraction, stable
getDayPeriodStops(timeZoneId, day, schedule): readonly DayPeriodStop[]   // memoized
```

The split makes the hard-edge rule testable with synthetic edges (proposal Q4). No current IANA transition crosses a period boundary. No start or end stop is added: CSS paints before the first stop with its colour and after the last stop with its colour, so the window lists alone describe the track. A window crossing a day end keeps its out-of-range fraction, which CSS accepts.

Memoization (ADR-0002 "memoized selectors"): `getDayPeriodStops` keeps a cache keyed by `${timeZoneId}|${day.start}|${day.end}`. The cache is cleared whenever a call arrives for another day key, so it holds one reference day. Drag steps and minute ticks within a day get the same array object. A date change recomputes the stops, and NFR-P2 bounds that cost.

### D5. Presenter: track data on each row (FR2, FR7, FR9, NFR-A3)

`LocationRowsContext` gains `referenceDay: ReferenceDay`. `LocationRow` gains `dayTrack: PresentedDayTrack | undefined`, which is `undefined` when the zone is unknown, as `localTimeLabel` is empty today:

```
PresentedDayTrack = {
  fraction: number              // getTrackFraction
  valueMinutes: number          // getTrackValueMinutes
  maxMinutes: number            // getLastTrackStepMinutes
  valueText: string             // t("locations.timeSliderValue", { time: localTimeLabel, date: localDateLabel })
  stops: readonly DayPeriodStop[]                   // getDayPeriodStops, same array per day
  hourLabels: readonly { fraction: number; label: string }[]
}
```

New `presenter/dayTrack.ts` holds `presentDayTrack` and `formatHourLabel`. The labels are taken at `start + k × HOUR_LABEL_INTERVAL_HOURS` for k = 0..3, and at `end`. The hours are formatted with a new `HOUR_LABEL_FORMAT_OPTIONS` (`{ hour: "2-digit", hourCycle: "h23" }`, in `constants/localDateTime.ts`). When the local minute is not zero, the label uses the existing `LOCAL_TIME_FORMAT_OPTIONS` instead. Hour labels are memoized like the stops, keyed by zone, day and language. The slider's name (`locations.timeSliderLabel`) is built in the view with `t()`, as `LocationRow` already builds `locations.removeLocation`. The new keys are `locations.timeSliderLabel` ("Time in {{city}}" / "Время — {{city}}") and `locations.timeSliderValue` ("{{time}}, {{date}}" in both languages). They go in the existing `locations` namespace, since `i18n.md` says "Do not create new namespaces unless it's clearly a new domain".

### D6. Controller: reference day for rows, `useTimeSelection` (FR3, FR4, FR8)

`useLocations` computes `getReferenceDay(state, clock.instant())` inside the existing `useMemo` and passes it in the presenter context. The `minuteTick` dependency already moves a live day past midnight.

New `controller/useTimeSelection.ts` returns `{ selectTrackFraction(fraction), moveTrack(move: TrackMove) }`. Each action reads the current snapshot and `clock.instant()`, computes the reference day and target instant with D2, and calls `store.dispatch({ type: SELECT_INSTANT, instant: target.toString() })` directly. It does not go through `dispatchAndSchedule`, so nothing is ever written (FR8, as `useReferenceMoment` does for dates). `TrackMove` is re-exported from `controller/index.ts`, as `CalendarMove` is, so views import it from `@/controller`.

### D7. View: a custom `role="slider"`, not `<input type="range">` (UX2, NFR-A2, NFR-R2)

New `views/shared/DayTrack.tsx`: a `div` with `role="slider"`, `tabIndex={0}`, `aria-label`, `aria-valuemin={0}`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`. It is 44 px high (UX1) and contains the coloured bar and the handle. The handle is a 44 × 44 transparent hit box centred at `left: fraction × 100%`, holding the visible circle (28 px, 32 px from `md`).

- **Pointer (mouse, pen):** `onPointerDown` calls `setPointerCapture` and reports `(clientX − rect.left) / rect.width`, clamped to 0–1, through `onSelectFraction`. `onPointerMove` does the same while captured, and `onPointerUp` / `onPointerCancel` release the capture. Moves that land on the same step dispatch an equal instant, and D1 returns the same state, so there are no extra renders.
- **Touch (FR3, NFR-R2):** the slider sets `touch-action: pan-y` (Tailwind `touch-pan-y`), but the browser still sends `pointerdown` before it decides to scroll, and may send `pointermove` inside its slop before `pointercancel`. So for `pointerType === "touch"`, `onPointerDown` only records the start point and pointer id; it neither selects nor captures. Each `onPointerMove` asks the pure `views/shared/dayTrackTouch.ts` `getTouchGestureDecision(start, current)` → `enum TouchGestureDecision { WAIT, SELECT, ABANDON }`: `SELECT` when the horizontal distance exceeds `TRACK_TOUCH_SLOP_PX` (10, in `constants/timeSelection.ts`) and the vertical one; `ABANDON` when the vertical distance exceeds the slop and is at least the horizontal one; `WAIT` otherwise. The first non-`WAIT` decision holds for the rest of the gesture. On `SELECT` the track captures the pointer and reports fractions as for the mouse from then on; after `ABANDON` it ignores the gesture. `onPointerUp` with neither decision reports the fraction (a tap). `onPointerCancel` discards everything, so a scroll never pins the moment.
- **Keyboard:** `onKeyDown` maps the key with the pure `views/shared/dayTrackKeys.ts` (`KeyboardKey` → `TrackMove | undefined`). A mapped key calls `preventDefault()`, so the page does not scroll, and then calls `onMoveTrack(move)`.
- **Colours:** the pure `views/shared/dayTrackGradient.ts` turns stops into `linear-gradient(to right, var(--color-day-night) 27.0833%, …)`. It uses a `DAY_PERIOD_COLOR_VARIABLES: Record<DayPeriod, string>` map. The `style` attribute carries only this computed gradient and the handle's `left` percentage. Both are data, and colours are reached only through the tokens (`ui-states.md`: "No inline styles or magic numbers — use design tokens").
- **Focus:** `focus-visible` draws an accent outline around the visible handle.

Why not a native range input: see "Alternatives Considered".

### D8. Layout in `LocationRow` (NFR-R1, NFR-R2, UX3)

`LocationRow` takes two new callbacks, `onSelectTrackFraction` and `onMoveTrack`. `LocationList` passes them through, and `CardsView` takes them from `useTimeSelection()`. The row's content becomes a wrapping flex container.

- Below `md` (768 px), `DayTrack` gets `basis-full` and goes to its own line under the city and time line, spanning the card's content width.
- From `md` it gets `md:basis-0 md:flex-1` and sits right of the time column, filling the width before the remove button. The hour-label row (`hidden md:flex`, `aria-hidden="true"`, `text-muted-foreground tabular-nums text-xs`) sits under it. Each label is absolutely positioned at its fraction, and the outer labels are aligned to the track edges.
- The track height is `h-2.5` / `md:h-3` (10 / 12 px, `views.md` "Visual style").

`DayTrack` is not rendered when `row.dayTrack` is `undefined`. `LocationRow` must stay under 200 lines, so the track and its labels live entirely in `DayTrack.tsx`.

### D9. Where each test goes

- Model, presenter and controller arithmetic: Vitest (TDD) with `it.each` and `fakeClock`.
- Business scenarios: unit BDD under `test/features/time_selection/` without a suffix, because `bdd-unit.md` says "The `_unit` suffix is added only when a paired `_e2e` file exists for the same aspect". Each scenario acts through controller actions or the store and asserts presented values.
- Anything about pointer drag geometry, real key events, focus, `role` / `aria-*`, layout, sizes, computed colours, scrolling and screenshots goes in `time_selection_e2e.feature` (`bdd-unit.md` table: keyboard, aria and focus, and responsive layout are "E2E BDD").

View unit tests in jsdom check only rendering and callback wiring. jsdom returns a zero-size `getBoundingClientRect`, so pointer geometry is proven in the browser.

## Consequences

Positive:
- One command, `SELECT_INSTANT`, serves pointer, touch and keys, so the model gains one reducer and one error code (D1).
- Same-step moves keep the same state and the colour stops are reused within a day, so drags and minute ticks cause no extra work (D1, D4).
- The track arithmetic, period stops, gradient, key map and touch decision are pure functions, testable without a browser (D2–D4, D7).

Negative:
- Every card adds one Tab stop (D7).
- Every screenshot baseline that shows rows must be re-approved (task 7.4).
- A custom slider means the view owns its pointer, touch and key handling instead of the browser (D7).

## Alternatives Considered

**Native `<input type="range">` (D7)**: considered because the browser would supply keys and the slider role. Rejected: its thumb centre runs from half a thumb width to `width − ½ thumb`, so the handle would not match the gradient position (UX2, the screens put the handle at exactly `left: 52.1%`); painting a gradient track needs vendor pseudo-elements; and its arrow, Page and Home / End keys differ by browser.

**A separate `SHIFT_TIME` command for keyboard moves (D1)**: considered to keep "move by a step" in the model. Rejected: the controller already computes the target instant with D2, so `SELECT_INSTANT` covers pointer and keys with one reducer and one replayable command shape.

## Risks / Trade-offs

- [`ZonedDateTime.prototype.getTimeZoneTransition` may be missing from the `temporal-polyfill` 0.3.2 types] → Task 2.4 starts by calling it in a test and running `typecheck`. If it is missing, `collectOffsetEdges` finds edges by comparing `offsetNanoseconds` at every 15-minute sample of the day and bisecting to the minute. That handles every IANA transition, all of which are on whole minutes.
- [Pointer events fire faster than renders] → Same-step moves return the same state (D1), and stops are reused within a day (D4). NFR-P1 bounds one step at 50 ms for 50 rows.
- [Touch selects late] → A touch tap pins on release, a short horizontal drag below `TRACK_TOUCH_SLOP_PX` selects nothing until it passes it, and a slightly diagonal swipe may still select once it does (D7). Mouse and pen are unchanged.
- [Many tab stops: one per card] → This is accepted by the WAI-ARIA slider pattern and matches the "one Tab stop per track" requirement. The date bar stays after the list in tab order.
- [Screens and docs differ on the 09:00 / 18:00 blend width] → Docs win (proposal Q3). The visual baselines are re-approved from the implementation, not from the PNGs.
- [Every screenshot baseline with rows changes] → They are re-approved in one task (7.4) with `--update-snapshots`, then verified without it.

## Migration Plan

None. No stored data changes and nothing is persisted, so a rollback is a plain revert.
