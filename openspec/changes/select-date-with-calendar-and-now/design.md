# Design: Select a date with the calendar and return to now

## Context

Driven by FR1–FR10, NFR-P1, NFR-A1–NFR-A3, NFR-R1–NFR-R3 and UX1–UX3 of `proposal.md` (see proposal.md — Why). Current state, checked in `packages/client/src/`:

- `model/locations.ts` (134 lines): `LocationsState = { locations, deviceTimeZoneId }`, `LocationCommandType` (`ADD_LOCATION`, `REMOVE_LOCATION`, `REPLACE_LOCATIONS`, `MOVE_LOCATION`, `SET_DEVICE_TIME_ZONE`), `LocationErrorCode`, `reduceLocations`. There is no reference moment, no `LIVE` / `PINNED` and no home location; `getEffectiveInstant` and `getReferenceZone` of `docs/architecture/domain-model.md` do not exist yet.
- `model/store.ts`: `createStore` notifies only when the reducer returns a new state object.
- `controller/LocationsProvider.tsx`: user commands go through `dispatchAndSchedule`, which schedules a write of `locations` when the snapshot changed; the tick and the cross-tab subscription use `store.dispatch` directly and never write. The context carries `store`, `clock`, `minuteTick`.
- `controller/useLocations.ts`: presents rows with `instant: clock.instant()` inside a `useMemo` keyed on `[locations, deviceTimeZoneId, language, t, clock, minuteTick]`.
- `presenter/presentLocationRows.ts` takes `{ language, instant, translate, deviceTimeZoneId }` — it already presents any instant, so rows need no presenter change.
- `app/MainPage.tsx`: header, `<main>` with `ViewHost`, an empty `<div>` bottom slot, and a `fixed bottom-0` notices region; `pb-32` keeps content clear of notices. `app/AppShell.tsx` calls the hooks and passes `notices` to `MainPage`.
- `components/ui/dialog.tsx`: Radix `Dialog`, `DialogContent` (full screen below `sm`, centred from `sm`), `DialogTitle`, `DialogClose` — used by the location search.
- `constants/keyboard.ts`: `KeyboardKey` has `ESCAPE`, `ARROW_DOWN`, `ARROW_UP`, `ENTER`, `SLASH`.
- `lib/temporal.ts`: `Clock` (`instant()`, `plainDateISO()`, `timeZoneId()`), `fakeClock(isoTimestamp, timeZone)`. `temporal-polyfill` 0.3.2 (lockfile).
- `tsconfig.app.json` `lib`: `ES2020`, `ES2022.Intl`, `DOM`, `DOM.Iterable` — enough for every `Intl.DateTimeFormatOptions` field used below (`weekday`, `day`, `month`, `year`).
- E2E (`playwright.bdd.config.ts`): device zone `Asia/Almaty`, projects `chromium`, `mobile-chrome` and one `view-contract-<id>` per registered view; time is pinned with `page.clock.setFixedTime` (step "the current time is {string}" in `locations_local_time_e2e.steps.ts`).

Binding decisions followed: ADR-0002 (layers, commands as data, view state in the view, view contract), ADR-0003 (one reference instant, `LIVE` / `PINNED`, `compatible` disambiguation with `UNIQUE | GAP | AMBIGUOUS`, not persisted), ADR-0004 (only repositories write; the reference moment is not persisted), ADR-0005 (shared blocks in `views/shared/`), ADR-0007 (reference zone = home ?? device; no home exists, so device), ADR-0001 (`*_e2e.feature` for browser-only checks).

## Goals / Non-Goals

**Goals:** add the reference moment to the existing model and store without a second store; keep every date computation in the pure model; make the date bar a shared block so every registered view gets it.

**Non-Goals:** a generic date-picker component library; any change to `presentLocationRows`, the repositories or the stored schema.

## Decisions

### D1. Model: reference moment inside `LocationsState`

New `model/referenceMoment.ts` (pure):

```
enum ReferenceMode { LIVE = "LIVE", PINNED = "PINNED" }
enum WallClockStatus { UNIQUE = "UNIQUE", GAP = "GAP", AMBIGUOUS = "AMBIGUOUS" }
type ReferenceMoment =
  | { mode: ReferenceMode.LIVE }
  | { mode: ReferenceMode.PINNED; instant: Temporal.Instant; wallClockStatus: WallClockStatus }
LIVE_REFERENCE_MOMENT: ReferenceMoment = { mode: LIVE }
getReferenceZone(state): string                      // state.deviceTimeZoneId (ADR-0007, no home yet)
getEffectiveInstant(state, now): Temporal.Instant    // now in LIVE, the pinned instant otherwise
```

`LocationsState` gains `reference: ReferenceMoment`; `INITIAL_LOCATIONS_STATE.reference` is `LIVE`. The union type keeps invariant 4 of `domain-model.md` ("instant present iff PINNED") true by construction. `REPLACE_LOCATIONS` and `SET_DEVICE_TIME_ZONE` already spread `state`, so the moment survives other tabs and resets (FR1).

New commands in `LocationCommandType` (one store, as `WorldClockState` in `domain-model.md`):

| Command | Fields | Effect |
|---|---|---|
| `SET_DATE` | `date: Temporal.PlainDate`, `now: Temporal.Instant` | date of `getEffectiveInstant(state, now)` in the reference zone equal to `date` → same state object; otherwise pin `resolveWallClock(zone, date + wall time)` |
| `SHIFT_DATE` | `days: number`, `now: Temporal.Instant` | `SET_DATE` with that date `.add({ days })` |
| `RESET_TO_NOW` | — | `LIVE`; already `LIVE` → same state object |

`now` travels in the command because the reducer is pure and reads no clock (ADR-0002, `architecture.md`: "Read 'now' only through the Clock port"); the controller fills it from `clock.instant()`. Temporal values serialize to ISO strings (`toString()`: `2026-03-08`, `2026-03-08T07:30:00Z`), so commands stay loggable data. Returning the same state object for "nothing changes" (FR3) means `createStore` does not notify.

`reduceLocations` delegates the three cases to `reduceReferenceMoment(state, command)` in `referenceMoment.ts`, keeping `locations.ts` under 200 lines.

New error `LocationErrorCode.DATE_OUT_OF_RANGE`: `PlainDate.add` and `PlainDateTime.toZonedDateTime` throw `RangeError` beyond Temporal's limits; the reducer catches only `RangeError` and returns the error (FR10), as `getLocalDateTime` does.

Alternatives: a separate reference store — rejected, rows need both values in one snapshot and `domain-model.md` puts both in one state. Reading the clock in the reducer — rejected, impure. ISO strings in commands — rejected, every consumer would parse and handle parse errors that cannot happen.

### D2. Model: wall-clock resolution

New `model/wallClock.ts`: `resolveWallClock(timeZoneId, plainDateTime) → { instant, status }`. It converts twice with explicit disambiguation: `earlier = plainDateTime.toZonedDateTime(zone, { disambiguation: "earlier" })`, `later = … "later"`. Equal instants → `UNIQUE`; different and `earlier.toPlainDateTime()` equals the input → `AMBIGUOUS`, result `earlier`; otherwise → `GAP`, result `later`. This is exactly `compatible` (earlier on overlap, later on gap, ADR-0003) and needs no `TimeZone` object, which the current Temporal spec and `temporal-polyfill` 0.3 no longer have. The wall time kept is `getEffectiveInstant(...).toZonedDateTimeISO(zone).toPlainTime()` (FR2, FR4).

### D3. Model: calendar month and focus moves

New `model/calendar.ts` (pure, no language):

- `getCalendarWeeks(month: Temporal.PlainDate, firstDayOfWeek: number): (Temporal.PlainDate | null)[][]` — `month` is any day of the month; rows of `DAYS_PER_WEEK` cells from the week containing day 1 to the week containing the last day; cells outside the month are `null` (FR3 "neighbouring months stay empty").
- `enum CalendarMove { PREVIOUS_DAY, NEXT_DAY, PREVIOUS_WEEK, NEXT_WEEK, WEEK_START, WEEK_END, PREVIOUS_MONTH, NEXT_MONTH }` and `getCalendarFocusTarget(date, move, firstDayOfWeek): Temporal.PlainDate` — `add({ days: ±1 })`, `add({ weeks: ±1 })`, week start/end from `dayOfWeek` and `firstDayOfWeek`, `add({ months: ±1 })` (Temporal clamps 31 → 30). A `RangeError` returns the input date unchanged.

`firstDayOfWeek` is an ISO weekday (1 = Monday … 7 = Sunday); the presenter maps the language to it (D4). March 2026 → 5 rows with Sunday start, 6 with Monday start (M4).

### D4. Presenter: date bar and calendar labels

New `constants/date.ts` (re-exported from `constants/index.ts`): `DATE_BAR_SHORT_FORMAT_OPTIONS` (`weekday: "short", day: "numeric", month: "long"`), `DATE_BAR_LONG_FORMAT_OPTIONS` (`weekday: "long"`, same rest), `FULL_DATE_FORMAT_OPTIONS` (`weekday: "long", day: "numeric", month: "long", year: "numeric"`), `CALENDAR_MONTH_FORMAT_OPTIONS` (`month: "long", year: "numeric"`), `CALENDAR_WEEKDAY_SHORT_FORMAT_OPTIONS` (`weekday: "short"`), `DAYS_PER_WEEK = 7`, `ONE_DAY = 1`, `FIRST_DAY_OF_WEEK_BY_LANGUAGE: Record<SupportedLanguage, number> = { en: 7, ru: 1 }`.

New `presenter/dateBar.ts`: `presentDateBar({ effectiveDate: Temporal.PlainDate, today: Temporal.PlainDate, isPinned, language, translate }) → { shortLabel, longLabel, isoDate, fullDateLabel, chooseDateLabel, isPinned }`. When `effectiveDate.year !== today.year`, both labels use the options plus `year: "numeric"` (FR7). `chooseDateLabel` = `translate("date.chooseDate", { date: fullDateLabel })`.

New `presenter/calendarMonth.ts`: `presentCalendarMonth({ focusedDate, selectedDate, today, language }) → { heading, weekdays: { shortLabel, fullLabel }[], weeks: (CalendarDayCell | null)[][] }` with `CalendarDayCell = { isoDate, dayNumber, fullLabel, isToday, isSelected, isFocused }`. The heading is formatted from day 1 as a `PlainDate`, never a `PlainYearMonth`: `PlainYearMonth.toLocaleString` throws for the ISO calendar against a Gregorian locale default.

All text is `PlainDate.toLocaleString(language, options)` — no `timeZone` is involved because the date is already in the reference zone. Bar and day labels follow `Intl` conventions (proposal Q2).

### D5. Controller: `useReferenceMoment` and rows at the effective instant

- `useLocations` reads `reference` from the snapshot and presents rows with `instant: getEffectiveInstant(state, clock.instant())`; `reference` joins the memo key. In `PINNED` a tick re-presents the same instant, so rows do not change (FR5); `SET_DEVICE_TIME_ZONE` still runs in the tick.
- New `controller/useReferenceMoment.ts` reads `store`, `clock`, `minuteTick` from `LocationsContext` and returns `{ dateBar, showPreviousDay, showNextDay, selectDate(isoDate), returnToNow }`. Actions call `store.dispatch` directly with `now: clock.instant()` — never `dispatchAndSchedule` — so no date action schedules a write (FR1, M5). `selectDate` takes the ISO date string from the view and parses it with `Temporal.PlainDate.from`. `minuteTick` is in the memo key of `dateBar`, so a `LIVE` bar changes at local midnight (FR7) and "today" stays current.
- New `controller/useCalendarMonth.ts`: `useCalendarMonth(focusedIsoDate) → { month, getFocusTarget(move): string }` built on `presentCalendarMonth` and `getCalendarFocusTarget`, with `selectedDate` and `today` from the store and clock and `firstDayOfWeek` from the language. The view never imports the model.
- Both hooks are exported from `controller/index.ts`, which also re-exports `CalendarMove`, so views import only from `@/controller` and `@/presenter` types, never from `@/model`.

### D6. Views: `DateBar` and `CalendarDialog` in `views/shared/`

- `views/shared/DateBar.tsx` calls `useReferenceMoment()` and renders a `role="group"` named `t("date.barLabel")`: previous-day icon button (`ChevronLeft`), the date button (`aria-haspopup="dialog"`, `aria-label` = `chooseDateLabel`, text: `<time dateTime={isoDate}>` holding `<span data-date-label="short" class="md:hidden">` and `<span data-date-label="long" class="hidden md:inline">`), next-day icon button (`ChevronRight`), and, only when `isPinned`, Now (`Clock` icon + `t("date.now")`, accent fill). Below `md` the bar is `justify-between` (arrows + date left, Now right); from `md` `justify-center` with a gap (NFR-R2). Controls have `min-h-11 min-w-11` (44 px, UX1). A polite `sr-only` live region shows `fullDateLabel` after a date change made from the bar or calendar — not on mount and not on ticks — so each change is announced once (NFR-A3).
- After Now, focus moves to the date button (`ref.focus()`), because the focused Now button unmounts (NFR-A2).
- `views/shared/CalendarDialog.tsx` uses `Dialog` / `DialogContent` / `DialogTitle` (`t("date.calendarTitle")`) from `@/components/ui` with the date button as `DialogTrigger`, so Radix returns focus to it on close and Esc closes (NFR-A2). View state `focusedIsoDate` (ADR-0002: view state stays in the view) starts at the selected date on open. Body: month heading (`aria-live="polite"`), previous / next month icon buttons (moving the focus by a month), and a `<table role="grid">` with `<th scope="col" abbr={fullLabel}>` weekday headers and one `<button>` per day (`aria-label` full date, `aria-selected` on the selected one, `aria-current="date"` on today, roving `tabIndex` 0 only on the focused day). `onKeyDown` maps keys through `views/shared/calendarKeys.ts` (`KeyboardKey` → `CalendarMove`); Enter / Space are native button activation. Picking calls `selectDate` and closes.
- `KeyboardKey` gains `ARROW_LEFT`, `ARROW_RIGHT`, `HOME`, `END`, `PAGE_UP`, `PAGE_DOWN`.
- Locale keys, new namespace `date` in both `en.json` and `ru.json`: `barLabel`, `previousDay`, `nextDay`, `chooseDate` (`"Choose date, {{date}}"`), `now`, `calendarTitle`, `previousMonth`, `nextMonth`.

### D7. Main page: bottom bar slot

`MainPage` gets a `bottomBar: ReactNode` prop. The empty bottom `<div>` becomes a `sticky bottom-0` bar (`border-t border-border bg-surface`), and the notices region moves inside it as `absolute inset-x-0 bottom-full` — still out of the flow, now stacked above the bar instead of over it (FR8). `pb-32` is replaced by the bar's own height in the flow, so the last card scrolls fully above it (NFR-R2). `AppShellContent` passes `bottomBar={<DateBar />}` (import via `@/views/shared`). The bar lives in the shell, not in `CardsView`, so it is shown in the view's loading and error states too and every registered view satisfies the "select a date, return to now" contract (ADR-0002); a Grid-specific day strip stays open (open-questions Q5).

### D8. Tests and their placement

- Pure model and presenter: Vitest with `it.each` (`model/referenceMoment.test.ts`, `model/wallClock.test.ts`, `model/calendar.test.ts`, `presenter/dateBar.test.ts`, `presenter/calendarMonth.test.ts`), time from `fakeClock` only.
- Behaviour in jsdom: `src/test/features/date_selection/*.feature` with vitest-cucumber steps in `steps/`, rendering `AppShell` or `LocationsProvider` with an in-memory repository, `fakeClock` / a switchable clock, `createManualTickScheduler()` and `createManualWriteScheduler()` (exact strings are asserted here, under Node's ICU).
- Real browser only (`bdd-unit.md` table: keyboard, aria, focus, layout): `date_selection_e2e.feature` (`chromium`, `mobile-chrome`) and `date_selection_view_contract_e2e.feature` (`@view-contract`, run per registered view). E2E asserts ISO `dateTime` attributes, `data-date-label` visibility, roles and names built from the full date, focus, boxes, axe-core and screenshots — the bar wording itself is asserted in unit features (Risks).

## Consequences

Positive:
- The model gets the reference moment of ADR-0003 with the exact commands of `domain-model.md` (`SET_DATE`, `SHIFT_DATE`, `RESET_TO_NOW`); the later slider and typed time add `SELECT_INSTANT` / `SET_WALL_TIME` / `SHIFT_TIME` on top of it.
- No date action can write to storage: they bypass `dispatchAndSchedule` by construction.
- One shared bar serves every registered view and every page state.

Negative:
- `LocationsState` and its test literals grow by one field.
- Every existing screenshot baseline is re-approved once.
- A hand-built calendar grid instead of a library component (D6) — more code to test, but no new dependency and no `Date` objects.

## Alternatives Considered

**Separate store for the reference moment**: isolates the write path, but rows need locations and the moment in one snapshot (D1).
**Native `<input type="date">`**: no grid code, but its picker cannot be styled as the screens, opens differently per browser, cannot be driven by Playwright and does not mark "today" in the reference zone (D6).
**`react-day-picker` (shadcn Calendar)**: ready-made grid, but a new dependency built on `Date`, which `temporal.md` forbids in production code (D6).
**Date bar inside `CardsView`**: closer to the view, but hidden while the view loads or fails and duplicated by every later view (D7).
**Commands carrying ISO strings**: stricter "serializable", but adds parse errors that cannot occur (D1).

## Risks / Trade-offs

- [Pinning from `LIVE` freezes the time of day the user had when they first changed the date] → intended by ADR-0003 (`PINNED` is a fixed instant); Now is always one action away (G3).
- [ICU differences between Node and Chromium] → the bar wording and the Russian forms are asserted only in unit tests; E2E asserts ISO `dateTime` attributes, `data-date-label` visibility and the English long full-date names (`Sunday, March 8, 2026`), whose CLDR form has no locale-dependent abbreviation.
- [The bar changes every approved screenshot] → all 32 existing baselines are re-approved once (tasks 7.x); new "pinned" and "calendar" baselines are added.
- [Moving the notices region into the bar changes its containing block] → existing notice tests (`AppShell.notices.test.tsx`, `AppShell.pageNotices.test.tsx`, `main_page_e2e.feature` "Header keeps its position") must stay green; the region keeps `role="status"` and `aria-live="polite"`.
- [`LocationsState` gains a field] → every `LocationsState` literal in tests gets `reference` (`model/locations.test.ts` expects `INITIAL_LOCATIONS_STATE` with `toEqual` at line 187); `pnpm --filter @time-zones/client typecheck` finds the rest.

## Migration Plan

None: nothing is stored, schema version stays 1. Rollback is a revert.
