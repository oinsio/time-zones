# Design: Mark the device's own time zone in the location list

## Context

Driven by FR1–FR5, NFR-P1, NFR-A1, NFR-R2, UX1 and UX2 of `proposal.md` (see proposal.md — Why). Current state, checked in `packages/client/src/`:

- `lib/temporal.ts` defines the `Clock` port (`instant()`, `plainDateISO()`, `timeZoneId()`), `systemClock` (`timeZoneId: () => Temporal.Now.timeZoneId()`) and `fakeClock(isoTimestamp, timeZone = "UTC")`. No production module calls `timeZoneId()`; only the test clocks in `controller/useLocations.test.tsx` and `test/features/locations/steps/locations_utc_offset_unit.steps.tsx` delegate it.
- `model/locations.ts`: `LocationsState = { locations }`; commands `ADD_LOCATION`, `REMOVE_LOCATION`, `REPLACE_LOCATIONS`, `MOVE_LOCATION`; every branch builds a new state as `{ locations: … }` (so does `model/moveLocation.ts`). `model/timeZoneId.ts` exports `canonicalizeTimeZoneId(input): string | undefined`.
- `controller/LocationsProvider.tsx` creates the store in a `useState` initializer (`createLocationsStore(initialResult)` → `createStore(reduceLocations, { locations: [] })` + `REPLACE_LOCATIONS`), takes `clock?: Clock` (default `systemClock`) and passes it through `LocationsContextValue`. Writes go through `repository.save(store.getSnapshot().locations)` — the `LocationRepository` port stores locations only.
- `controller/useLocations.ts` reads `{ locations }` with `useSyncExternalStore` and calls `presentLocationRows(locations, { language, instant, translate })` in a `useMemo` keyed on `[locations, language, t, clock]`.
- `presenter/presentLocationRows.ts`: `LocationRow { id, cityLabel, countryName, utcOffsetLabel }`.
- `views/shared/LocationRow.tsx` renders the `<li>` with the drag handle, a column with the city (`font-semibold`) and a muted secondary line, and the remove button. The `<li>` has no accessible name today.
- `constants/search.ts` exports `UTC_ZONE_ID = "UTC"`.
- E2E: `playwright.bdd.config.ts` sets no `timezoneId`, so the browser zone is the host's. Unit tests that render `AppShell` (e.g. `test/features/locations/steps/locationsUiWorld.tsx`) or `LocationsProvider` without a clock use `systemClock`, so the device zone is the host's too.

Binding rules: ADR-0007 — "The device zone is read only through the `Clock` port (`clock.timeZoneId()`), canonicalized, and passed to the model by the controller with `SET_DEVICE_TIME_ZONE`", "It is not persisted. An unknown value falls back to `UTC`", "A location whose canonical zone ID equals the device zone gets a 'here' mark (location arrow icon)". `.claude/rules/architecture.md` — the model must "never read the device time zone directly — it arrives as state via `SET_DEVICE_TIME_ZONE` (ADR-0007)"; "Selectors return Temporal values, enums and numbers — never human-readable strings"; the presenter is "the only layer that formats times and dates, applies i18n"; the controller "owns side effects: … re-reading the device time zone". `.claude/rules/temporal.md` — "Read the device time zone only through `clock.timeZoneId()`"; "Canonicalize IANA IDs on input and on load … compare canonical IDs only"; "Use `fakeClock` in tests". ADR-0004 — storage only through repository ports.

## Goals / Non-Goals

**Goals:** put the device zone into the model the way ADR-0007 prescribes, so the later clock-tick change only adds more dispatches of the same command; make the device zone deterministic in every test runner.

**Non-Goals:** the reference zone, home, the derived Here entry, re-reading the zone (proposal NG1, NG3, NG4). No global architectural decision is made: ADR-0007 already decides the command, the canonical-ID equality and the fallback, so no new ADR is needed.

## Decisions

### D1. Model: device zone as state, set by a command

- `LocationsState` becomes `{ locations: readonly Location[]; deviceTimeZoneId: string }`. `model/locations.ts` exports `INITIAL_LOCATIONS_STATE: LocationsState = { locations: [], deviceTimeZoneId: DEVICE_TIME_ZONE_FALLBACK_ID }`.
- New `LocationCommandType.SET_DEVICE_TIME_ZONE` with `{ timeZoneId: string }`. The reducer stores `canonicalizeTimeZoneId(command.timeZoneId) ?? DEVICE_TIME_ZONE_FALLBACK_ID` (FR3) and returns the very same state object when the value is unchanged (no re-render). It never fails.
- Every existing branch keeps the device zone: `ADD_LOCATION`, `REMOVE_LOCATION`, `REPLACE_LOCATIONS` and `moveLocationInList` build `{ ...state, locations: … }` (FR4 — otherwise an add, a reset or another tab's change would silently drop the device zone back to `undefined`).
- New `model/deviceTimeZone.ts` exports `isLocationInDeviceTimeZone(location: Location, deviceTimeZoneId: string): boolean` — strict equality of canonical identifiers (FR1, FR2; ADR-0007, NG5). Both sides are canonical by invariant (locations are canonicalized on input and load; the device zone by the command), so no canonicalization happens in the selector. Exported from `model/index.ts` together with `INITIAL_LOCATIONS_STATE`.

Alternatives: a separate device-environment store — rejected, one more subscription for one string; ADR-0002/domain-model.md keep `deviceTimeZoneId` in the domain state. Comparing UTC offsets — forbidden (ADR-0007, CLAUDE.md).

### D2. Constants

New `constants/deviceTimeZone.ts`, re-exported from `constants/index.ts`: `DEVICE_TIME_ZONE_FALLBACK_ID = UTC_ZONE_ID` (reuses the existing `"UTC"` constant from `constants/search.ts`; `.claude/rules/code-style.md`: business constants live in `src/constants/`).

### D3. Controller: read once, at store creation

`createLocationsStore(initialResult, deviceTimeZoneId)` starts from `INITIAL_LOCATIONS_STATE`, dispatches `SET_DEVICE_TIME_ZONE` with `deviceTimeZoneId`, then `REPLACE_LOCATIONS`. `LocationsProvider` calls it in its existing `useState` initializer as `createLocationsStore(initialResult, clock.timeZoneId())`, so the zone is read exactly once per app start, before the first render (FR3, NFR-P1: no loading state). `resetLocations` and the repository subscription keep using `REPLACE_LOCATIONS`, which now keeps the zone (FR4). The command is dispatched with `store.dispatch`, not `dispatchAndSchedule`, so it never schedules a write; and `repository.save` receives only `locations` — the zone is never stored.

`useLocations` reads `{ locations, deviceTimeZoneId }` from the snapshot and passes `deviceTimeZoneId` to the presenter; the `useMemo` key becomes `[locations, deviceTimeZoneId, language, t, clock]`.

Alternatives: reading the zone in `useLocations` on each presentation — rejected, it would re-read the zone on every list change, against FR3/NG3 and against ADR-0007 (the model gets the zone only through the command). A `useEffect` dispatch after mount — rejected, the first render would lack the badge.

### D4. Presenter: the badge label on the row

`LocationRowsContext` gains `deviceTimeZoneId: string`. `LocationRow` gains `deviceTimeZoneLabel: string` — `translate("locations.deviceTimeZoneBadge")` when `isLocationInDeviceTimeZone(location, deviceTimeZoneId)` is true, otherwise `""` (same empty-string convention as `utcOffsetLabel`). The text is translated in the presenter (FR5), which keeps i18n there, as D2 of the archived `show-utc-offset-on-location-rows` did for the offset prefix.

### D5. View: badge on the city line, row named by city and badge

`views/shared/LocationRow.tsx`:

- The city line becomes a wrapping flex line (`flex flex-wrap items-center gap-x-2`) holding the city `<span>` and, when `deviceTimeZoneLabel !== ""`, a badge `<span>` right after it (UX1): `inline-flex items-center gap-1 rounded-full bg-accent px-2 text-xs font-medium text-accent-foreground`, containing lucide-react's `Navigation` icon (`aria-hidden="true"`, the location arrow of ADR-0007, UX2) and the label text. Colours come from the existing `accent` / `accent-foreground` tokens of `tailwind.config.ts`; no new tokens.
- Accessible name (NFR-A1): two ids from React `useId()`; the city `<span>` and the badge `<span>` carry them, and the `<li>` gets `aria-labelledby` = the city id, plus the badge id when the badge is shown. The row is then named "Almaty Your time zone"; a row without the badge is named by its city.
- Because `LocationRow` is a shared block (ADR-0005), any later view that reuses it gets the badge.

The existing assertion "Rows show city and country" (`toHaveTextContent(`${firstCity}${firstCountry}`)` in `test/features/locations/steps/locations_ui_unit.steps.tsx`) stays valid only when no listed row matches the device zone — D6 makes that deterministic.

Alternatives: `aria-label` on the `<li>` built from strings — rejected, it duplicates visible text and can drift from it. A visually hidden suffix in the city span — rejected, it changes the city's text content for every reader.

### D6. Deterministic device zone in tests

- **Unit (Vitest):** `src/test/setup.ts` replaces `systemClock.timeZoneId` with `() => UNIT_TEST_DEVICE_TIME_ZONE` (plain assignment, not `vi.spyOn`: several suites call `vi.restoreAllMocks()`, which would undo a spy). `UNIT_TEST_DEVICE_TIME_ZONE = "Pacific/Kiritimati"` lives in new `src/test/deviceTimeZone.ts` — a valid zone no test lists, so tests that render with the default clock show no badge on any host. Tests that need a device zone inject `fakeClock(instant, zone)` into `LocationsProvider`.
- `fakeClock`'s default zone is `"UTC"`. `locations_utc_offset_unit.steps.tsx` creates `fakeClock(instant)` and its "Zero offset" scenario asserts the exact row text of a `UTC` location; that steps file passes `UNIT_TEST_DEVICE_TIME_ZONE` as the zone so the row text stays `UTCUTC`.
- **E2E (playwright-bdd):** `playwright.bdd.config.ts` sets `use.timezoneId` to `E2E_DEVICE_TIME_ZONE = "Asia/Almaty"` for every project, so the browser's `Intl` zone (read by `temporal-polyfill`'s `Temporal.Now.timeZoneId()`) is the same on every machine. The "list" state of the screenshot outline (Almaty and Moscow, `test/features/locations/steps/locationsStates.ts`) then shows the badge on Almaty — the 8 `list` baselines are re-approved once (NFR-R2). The other screenshot states seed no list and do not change.

### D7. Tests and their placement

- Pure functions (`reduceLocations` with `SET_DEVICE_TIME_ZONE`, `isLocationInDeviceTimeZone`, `presentLocationRows`) — Vitest with `it.each`.
- Unit BDD `src/test/features/locations/locations_device_time_zone_unit.feature` + `steps/locations_device_time_zone_unit.steps.tsx` (`_unit` because a paired `_e2e` file exists, `.claude/rules/bdd-unit.md`): `LocationsProvider` with `createInMemoryLocationRepository` (from `@/adapters`) and `fakeClock(instant, deviceZone)`, rendering `useLocations().rows` through `LocationList` from `@/views/shared`; assertions read rendered text in jsdom. "Device zone is read once" uses a switchable test `Clock` whose `timeZoneId` delegates to a variable that the step changes, so a controller re-reading the zone fails it.
- E2E `src/test/features/locations/locations_device_time_zone_e2e.feature` + `steps/locations_device_time_zone_e2e.steps.ts`: accessible names, axe-core and layout need a real browser (`.claude/rules/bdd-e2e.md`, ADR-0001). The device zone is the config's `Asia/Almaty` (D6).

## Consequences

Positive:
- The device zone enters the model exactly as ADR-0007 prescribes; the later clock-tick change only dispatches `SET_DEVICE_TIME_ZONE` again.
- The model stays pure and string-free; the badge text is translated in the presenter.
- Every test runner has a fixed device zone, so badges never depend on the developer's machine.

Negative:
- `presentLocationRows` gets one more context field and `LocationRow` one more field; callers and fixtures (`useLocations.ts`, `presentLocationRows.test.ts`, the whole-row `toEqual` in `controller/useLocations.test.tsx`, the row fixtures in `views/shared/LocationList.test.tsx` and `views/shared/LocationRow.test.tsx`) are updated.
- The 8 approved "list" screenshots change once and must be re-approved.

## Alternatives Considered

**Re-read the zone on every presentation**: always current, but contradicts FR3/NG3 and bypasses the model command (D3).
**Badge flag in the presenter, text in the view via `t()`**: fewer presenter changes, but moves i18n of row content out of the presenter, unlike the offset prefix (D4).
**`aria-label` on the row**: simpler markup, but duplicates the visible text (D5).
**Per-scenario browser time zone (CDP `Emulation.setTimezoneOverride`)**: finer control, but Chromium-only plumbing; one pinned zone also fixes the screenshot baselines on every machine (D6).

## Risks / Trade-offs

- [The user travels with the app open] → the badge stays on the old zone until the next start; accepted by NG3, fixed by the clock-tick change (proposal Q2).
- [Zones with equal rules] → `Europe/Minsk` does not match a device in `Europe/Moscow`; accepted by ADR-0007 ("Equality is by canonical zone ID").
- [Pinning `timezoneId` for all E2E] → any existing scenario with Almaty in its list now shows a badge; no existing E2E step compares a row's full text (they filter rows with `hasText` or count them), and the full BDD run in tasks 8.3 proves it.
- [`LocationsState` gains a required field] → test fixtures that build `{ locations: [] }` (`model/locations.test.ts`, `model/moveLocation.test.ts`, `test/features/locations/steps/locations_management.steps.ts`) switch to `INITIAL_LOCATIONS_STATE`.

## Migration Plan

None: no stored data changes; rollback is reverting the code.
