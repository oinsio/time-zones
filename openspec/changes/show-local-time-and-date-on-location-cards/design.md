# Design: Show the local time and date on location cards

## Context

Driven by FR1–FR6, NFR-P1, NFR-A1, NFR-A2, NFR-R1–NFR-R3, UX1 and UX2 of `proposal.md` (see proposal.md — Why). Current state, checked in `packages/client/src/`:

- `lib/temporal.ts`: `Clock` port (`instant()`, `plainDateISO()`, `timeZoneId()`), `systemClock`, `fakeClock(isoTimestamp, timeZone = "UTC")`.
- `model/utcOffset.ts`: `getUtcOffsetMinutes(timeZoneId, instant)` — `instant.toZonedDateTimeISO(timeZoneId)`, `RangeError` → `undefined`. `model/locations.ts`: `LocationsState = { locations, deviceTimeZoneId }`, command `SET_DEVICE_TIME_ZONE` canonicalizes and falls back to `UTC`, returning the same state when unchanged.
- `presenter/presentLocationRows.ts`: `LocationRow { id, cityLabel, countryName, utcOffsetLabel, deviceTimeZoneLabel }`, context `{ language, instant, translate, deviceTimeZoneId }`.
- `controller/LocationsProvider.tsx` (174 lines): creates the store, reads `clock.timeZoneId()` once in a `useState` initializer, handles writes (`WriteScheduler` from `controller/writeScheduler.ts`), `pagehide` flush and the repository subscription. No timer other than the write debounce exists; nothing listens to `visibilitychange` (`grep -rn visibilitychange src` is empty).
- `controller/useLocations.ts`: presents rows in a `useMemo` with `instant: clock.instant()` keyed on `[locations, deviceTimeZoneId, language, t, clock]` — so the instant is read again only when the list or the language changes.
- `views/shared/LocationRow.tsx` (119 lines): `<li aria-labelledby=city [badge]>` with drag handle, a column (city line with badge, muted secondary line with country and offset) and the remove button.
- `constants/`: `NANOSECONDS_PER_MINUTE`, `MINUTES_PER_HOUR` in `utcOffset.ts`; no millisecond-per-minute constant.
- Tests: `test/setup.ts` pins `systemClock.timeZoneId` to `UNIT_TEST_DEVICE_TIME_ZONE` and sets i18n to `ru`; `test/writeSchedulers.ts` has `immediateWriteScheduler` and `createManualWriteScheduler()`; `test/renderLocations.tsx` renders `useLocations` inside `LocationsProvider`. E2E: `playwright.bdd.config.ts` pins `timezoneId: "Asia/Almaty"` but not the time; the screenshot step is in `test/features/locations/steps/locations_layout_e2e.steps.ts`; the "list" state seeds Almaty and Moscow (`locationsStates.ts`).
- `tsconfig.app.json`: `lib: ["ES2020", "ES2022.Intl", "DOM", "DOM.Iterable"]` — `Intl.DateTimeFormatOptions` with `hourCycle` is declared (ES2020.Intl).
- Biome `recommended` preset; `controller/useCitySearch.ts` already suppresses `useExhaustiveDependencies` with a reason for a re-run key.

Binding rules: ADR-0003 — "The model never runs timers. It reads 'now' through the `Clock` port. The controller: ticks on minute boundaries, not every 60 s from start; pauses while the page is hidden (`visibilitychange`) and re-reads the clock immediately when it becomes visible". ADR-0007 — "The controller re-reads it on every clock tick and when the page becomes visible. The model never reads it directly." ADR-0002 — selectors return "Temporal values, enums, numbers. No strings meant for humans"; the presenter "is the only place that knows about the active language and hour format". `.claude/rules/architecture.md` — controller "owns side effects: clock tick on minute boundaries, pause on `visibilitychange`, re-reading the device time zone"; views "render presenter output and emit events only"; "Reuse `views/shared/` blocks". `.claude/rules/temporal.md` — "Use `Temporal.ZonedDateTime` with an IANA time zone ID for any wall-clock time in a location"; "Use `fakeClock` in tests, never `vi.setSystemTime()` or `vi.useFakeTimers()`". ADR-0005 — "views compose `views/shared/` components". ADR-0004 — storage only through repository ports.

## Goals / Non-Goals

**Goals:** the first clock tick of the app, built as ADR-0003/ADR-0007 prescribe, so later changes (Now, sliders) reuse it; a shared time-display block every future view can compose.

**Non-Goals:** the reference moment in the model (`LIVE` / `PINNED`), differences, the Here entry, the hour-format preference (proposal NG1–NG5). No global architectural decision is made — ADR-0003 and ADR-0007 already decide the tick, the pause and the re-read; no new ADR is needed.

## Decisions

### D1. Model: local date-time selector

New `model/localDateTime.ts` exports `getLocalDateTime(timeZoneId: string, instant: Temporal.Instant): Temporal.ZonedDateTime | undefined` — `instant.toZonedDateTimeISO(timeZoneId)`, `RangeError` → `undefined` (FR6), the same contract as `getUtcOffsetMinutes`. Exported from `model/index.ts`. It returns a Temporal value, no strings (ADR-0002). No reference-moment state is added: in `LIVE` the effective instant is "now" (domain-model.md `getEffectiveInstant`), and only `LIVE` exists until the Now/slider changes (NG2).

Alternative: add `reference: { mode: LIVE }` to `LocationsState` now — rejected, a state with one possible value is dead weight; the change introducing `PINNED` adds it.

### D2. Constants

- New `constants/localDateTime.ts`: `LOCAL_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }` (FR1, Q1) and `LOCAL_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }` (FR2, Q2).
- New `constants/clock.ts`: `MILLISECONDS_PER_MINUTE = 60_000` (FR3).
- Both re-exported from `constants/index.ts` (`.claude/rules/code-style.md`: business constants live in `src/constants/`).

### D3. Presenter: time and date labels

New `presenter/localDateTime.ts`: `formatLocalTime(zonedDateTime, language)` and `formatLocalDate(zonedDateTime, language)` = `zonedDateTime.toLocaleString(language, LOCAL_TIME_FORMAT_OPTIONS | LOCAL_DATE_FORMAT_OPTIONS)` — `Intl` formatting in the zone of the `ZonedDateTime`, no `Date`. `LocationRow` gains `localTimeLabel: string`, `localDateLabel: string` and `localIsoDate: string` (`zonedDateTime.toPlainDate().toString()`, ISO date-only per CLAUDE.md); all three are `""` when `getLocalDateTime` returns `undefined` (the convention of `utcOffsetLabel`). `presentLocationRows` computes the `ZonedDateTime` once per row. Expected strings (Node ICU 78, checked): `12:30` / `Sun, Mar 8` / `вс, 8 мар.` for Almaty at `2026-03-08T07:30:00Z`; `01:00` / `Mon, Mar 9` for Tokyo at `2026-03-08T16:00:00Z`.

If the `temporal-polyfill` typings reject the options object, the fallback with the same output is `new Intl.DateTimeFormat(language, { ...options, timeZone: zonedDateTime.timeZoneId }).format(zonedDateTime.epochMilliseconds)` — still no `Date`.

Alternative: a hand-written date pattern matching `views.md` (`Sun, 8 Mar`) — rejected, it would need per-language patterns and month names in locale files; `Intl` already writes each language correctly (Q2).

### D4. Controller: minute tick with visibility pause

- New `controller/tickScheduler.ts`: `TickScheduler = { schedule(callback, delayMs): () => void }` and `timeoutTickScheduler` (`setTimeout` / `clearTimeout`) — the same shape as `WriteScheduler`, kept separate so each side effect is named for what it does. Exported from `controller/index.ts` as a type.
- New `controller/minuteBoundary.ts`: `getMillisecondsUntilNextMinute(instant)` = `MILLISECONDS_PER_MINUTE − (instant.epochMilliseconds mod MILLISECONDS_PER_MINUTE)`; exactly on a boundary it returns a full minute (`12:00:42.500` → 17 500; `12:01:00.000` → 60 000).
- New `controller/useMinuteTick.ts`: `useMinuteTick({ clock, tickScheduler, onTick })`. On mount, when `document.visibilityState` is `"visible"`, it schedules the next tick at `getMillisecondsUntilNextMinute(clock.instant())`; when a tick fires it calls `onTick()` and schedules the next one the same way (re-aligning every minute, so timer drift never accumulates). On `visibilitychange` to `hidden` it cancels the pending tick; to `visible` it calls `onTick()` at once and schedules the next one. Cleanup cancels the tick and removes the listener. `onTick` is held in a ref, so a new callback does not reschedule.
- `LocationsProvider` gains the prop `tickScheduler?: TickScheduler` (default `timeoutTickScheduler`) and a `minuteTick` state (a counter). Its `onTick` dispatches `SET_DEVICE_TIME_ZONE` with `clock.timeZoneId()` through `store.dispatch` — not `dispatchAndSchedule`, so a tick never writes (FR4, "Updates write nothing") — and increments `minuteTick`. `minuteTick` goes into `LocationsContextValue`.
- `useLocations` adds `minuteTick` to the `useMemo` key of the rows and keeps reading `clock.instant()` inside the memo, so the rows are presented anew at every tick and at every list or language change (FR3, FR5 and the existing FR4 of `show-utc-offset-on-location-rows`). Biome's `useExhaustiveDependencies` flags `minuteTick` as unused; it is suppressed with `// biome-ignore lint/correctness/useExhaustiveDependencies: minuteTick re-presents the rows at each minute`, as `useCitySearch.ts` does for `attempt`.

Alternatives: keep the instant in React state set by the tick — rejected, a list change between ticks would then present a stale instant and break FR5 and "Offset is computed again when the list changes". A `setInterval(60 000)` from mount — rejected by ADR-0003 ("ticks on minute boundaries, not every 60 s from start"). A tick per card — rejected, N timers and rows changing at different moments.

### D5. View: shared time display and responsive row

- New `views/shared/LocalDateTime.tsx` (the "Time display" block of `views.md`, reusable by later views, ADR-0005): renders nothing when `localTimeLabel` is `""` (FR6); otherwise a column with the time in a `<span>` (`text-2xl font-bold leading-none tabular-nums`, `md:text-4xl`) and the date in `<time dateTime={localIsoDate}>` (`text-sm text-muted-foreground`, the token of the country line) (UX1, UX2, FR2). The column is `items-end` below `md` and `md:items-start` from `md`. No `aria-live`, no role (NFR-A2); `LocationRow`'s `aria-labelledby` is unchanged, so the row name stays city (+ badge).
- `LocationRow.tsx`: the existing place column and the new `LocalDateTime` go into one wrapper `flex min-w-0 flex-1 items-start gap-3`. The place column becomes `min-w-0 flex-1 break-words md:w-64 md:flex-none`: below 768 px it takes the free width and pushes the time to the right end of the content, before the remove button (NFR-R2 narrow); from 768 px (Tailwind `md`) it has a fixed width, so the time column follows it in the left half of the card (NFR-R2 wide). `min-w-0` + `break-words` let long city names wrap instead of widening the page (NFR-R1). The time column is `shrink-0`, so the digits never wrap. Tailwind's default `md` breakpoint (768 px) is the only breakpoint; no new design tokens.
- DOM order is city line, secondary line, time, date: screen readers read the place first, as on screen.

Alternative: CSS grid with the time in the first row — rejected, the date and the country line would share a grid row and the city line height would grow to the size of the time digits.

### D6. Deterministic time in tests

- **Unit:** `fakeClock` and a switchable `Clock` (its `instant()` and `timeZoneId()` delegate to variables a step changes) — never `vi.setSystemTime()` / `vi.useFakeTimers()`. New `test/tickSchedulers.ts`: `createManualTickScheduler()` (holds the pending tick; `lastDelayMs()`, `hasPending()`, `runPending()`). New `test/pageVisibility.ts`: `setPageVisibility(state)` redefines `document.visibilityState` (configurable) and dispatches `visibilitychange`; `resetPageVisibility()` restores `"visible"`. `test/renderLocations.tsx` gains an optional `tickScheduler` argument. Only `controller/tickScheduler.test.ts` touches the production `timeoutTickScheduler`, with real 0 ms timers (run, and cancel before the delay), so its mutants are killed without fake timers.
- **E2E:** a new step `the current time is {string}` calls `page.clock.setFixedTime(iso)` before the app opens — `Date.now()` is fixed, timers keep running; `temporal-polyfill`'s `Temporal.Now` reads `Date.now()`, and the step that asserts `12:30` fails if it does not. The existing outline "Screenshot of the <state> state at <width> px in the <theme> theme" in `locations_ui_e2e.feature` gets `Given the current time is "2026-03-08T07:30:00Z"` as its first step, so its baselines are stable; the 8 "list" baselines are re-approved once (NFR-R3). The other states show no rows and do not change.
- The exact-text assertion of "Zero offset" (`locations_utc_offset_unit.steps.tsx`, `expect(rowOf(city).textContent).toBe(`${city}${offset}`)`) now also contains the time and the date; it becomes `${city}${offset}12:00Wed, Jul 15` (the steps file runs in English; the instant is `2026-07-15T12:00:00Z` in `UTC`).

### D7. Tests and their placement

- Pure functions (`getLocalDateTime`, `formatLocalTime`, `formatLocalDate`, `presentLocationRows`, `getMillisecondsUntilNextMinute`) — Vitest with `it.each`.
- `useMinuteTick` — Vitest with `renderHook`, the manual tick scheduler, a switchable clock and `setPageVisibility`.
- Unit BDD (vitest-cucumber, jsdom): `test/features/locations/locations_local_time_unit.feature` (paired with an `_e2e` file, so `_unit`, `.claude/rules/bdd-unit.md`) for values, midnight, Russian, list change, unknown zone and performance; `test/features/locations/locations_clock_tick.feature` (no E2E pair, no suffix) for the minute boundary, the hidden page, the DST offset change, the device zone re-read at the tick and on visibility, and "updates write nothing". Both render `LocationsProvider` with `createInMemoryLocationRepository` and the manual tick scheduler, and `LocationList` from `@/views/shared`, through one shared world `steps/localTimeWorld.tsx`.
- E2E (playwright-bdd): `test/features/locations/locations_local_time_e2e.feature` — layout (bounding boxes), horizontal scrolling, axe-core, accessible names and the absence of a live region need a real browser (`.claude/rules/bdd-e2e.md`, ADR-0001).

## Consequences

Positive:
- The app gets its first clock tick exactly as ADR-0003 and ADR-0007 prescribe; the Now and slider changes only add a pinned moment on top of it.
- The model stays pure (a Temporal value per row); formatting and language stay in the presenter.
- The time display is a shared block, so the Grid view composes it instead of duplicating it.

Negative:
- `LocationRow` gets three more fields; every row fixture is updated: `presenter/presentLocationRows.test.ts`, `controller/useLocations.test.tsx` (whole-row `toEqual`), `controller/useLocations.deviceTimeZone.test.tsx`, `views/shared/LocationRow.test.tsx`, `views/shared/LocationRow.dragging.test.tsx`, `views/shared/LocationList.test.tsx`, `views/shared/LocationList.drop.test.tsx`, `views/shared/useReorderAnnouncements.test.tsx` and `test/features/locations/steps/locations_reorder_unit.steps.ts`. Vitest does not type-check, so the tasks that widen a type also run `typecheck`.
- The 8 approved "list" screenshots change once and must be re-approved.
- One `biome-ignore` comment for the tick key of the rows memo.

## Alternatives Considered

**Instant in React state set by the tick**: simpler memo key, but stale between ticks on list changes (D4).
**`setInterval` of 60 s from mount**: fewer lines, but forbidden by ADR-0003 (D4).
**Custom date pattern per language**: matches the `views.md` sample, but duplicates what `Intl` does (D3, Q2).
**Reference-moment state in the model now**: prepares `PINNED`, but has a single value in this change (D1).

## Risks / Trade-offs

- [ICU differences between Node and Chromium in date text] → unit tests assert exact strings under Node; E2E asserts the time digits and the ISO `dateTime` attribute only, never the date wording.
- [A tick re-presents every row] → all rows change anyway because the time changes; NFR-P1 bounds 50 rows to 50 ms.
- [`page.clock.setFixedTime` freezes `Date.now()` for the whole screenshot scenario] → only the screenshot outline and the new E2E feature use it; reorder and other E2E scenarios keep real time.
- [Long city names at 320 px] → `min-w-0` and `break-words` wrap the name; NFR-R1 checks Kathmandu, New York and Tokyo with the Almaty badge.
- [Unit tests that render `AppShell` (for example `test/features/locations/steps/locationsUiWorld.tsx`) use the default `timeoutTickScheduler` with the real clock] → a tick can fire during such a test only when it crosses a minute boundary; it re-presents the same rows with the new minute, and none of those tests asserts a time. Hook tests and the time features inject the manual scheduler (tasks 4.3, 6.1, 6.2).
- [Re-reading the device zone at each tick changes the existing "read once" behaviour] → intended by ADR-0007; the reducer returns the same state for an unchanged zone, so ticks cause no extra renders from the store.

## Migration Plan

None: no stored data changes; rollback is reverting the code.
