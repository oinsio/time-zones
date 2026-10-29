# Design: Show the Here entry for the device time zone

## Context

Driven by FR1–FR12, NFR-P1, NFR-P2, NFR-A1, NFR-A2, NFR-R1, NFR-R2 and UX1–UX3 of `proposal.md` (see proposal.md — Why). Both changes this one builds on are archived, so everything below was checked in `packages/client/src/` on the current `main`:

- `model/deviceTimeZone.ts`: `isLocationInDeviceTimeZone(location: Location, deviceTimeZoneId)` is the one matching rule. `model/locationMark.ts`: `getLocationMarkKind(location, deviceTimeZoneId, homeLocationId)` returns `LocationMarkKind.HOME` before `LocationMarkKind.HERE`.
- `model/offsetDifference.ts`: `getReferenceOffsetMinutes(state, instant)` and `getOffsetDifferenceMinutes(location: Location, rowOffsetMinutes, referenceOffsetMinutes, { deviceTimeZoneId, homeLocationId })`. The latter reads only `location.id` (the home row has none) and `location.timeZoneId` (through `isLocationInDeviceTimeZone`: without home, the device zone row has none).
- `model/locations.ts`: `SET_DEVICE_TIME_ZONE` canonicalizes the reported zone and falls back to `DEVICE_TIME_ZONE_FALLBACK_ID`. `LocationsProvider.tsx` dispatches it at start and in the `useMinuteTick` callback, which also ticks when the page becomes visible.
- `presenter/presentLocationRows.ts` (131 lines): `presentLocationRows(locations, LocationRowsContext)` maps each `Location` to a `LocationRow`. Per row it computes the UTC offset (`getUtcOffsetMinutes`, `formatUtcOffset`), the mark (`getLocationMarkKind`, `presentLocationMarks`), the offset difference (`getOffsetDifferenceMinutes`, `formatOffsetDifference` → `offsetDifferenceLabel`, `offsetDifferenceAccessibleLabel`), local time and date (`getLocalDateTime`, `formatLocalTime`, `formatLocalDate`, `localIsoDate`) and the day track (`presentDayTrack`). Only `id`, `cityLabel`, `countryName`, the mark and the home check of the difference depend on the `Location`; the rest depends on the time zone ID. Formatters are cached at module level (`presenter/dateTimeFormatters.ts`, `formattersByKey`).
- `controller/useLocations.ts`: presents the rows in one `useMemo` with one `clock.instant()` read, keyed by the state, language and `minuteTick`. `AppShell`, `CardsView` and `LocationSearch` call it.
- `controller/useCitySearch.ts`: caches a *resolved* `CitySearch` per loader in a module-level `WeakMap` (`loadedSearches`). A failed load is not cached. It is called only inside `OpenLocationSearch`, so the data is fetched only while the search is open. The default loader is `loadCitySearch` (`adapters/loadCitySearch.ts`, `createFetchCitySearchLoader()`).
- `ports/citySearch.ts`: `CitySearch` has `search` and `suggest`. Its only implementation is `createCompositeCitySearch` (`adapters/city-search/createCompositeCitySearch.ts`), which keeps `recordsById`. No `CitySearch` contract suite exists; `citySource.contract.ts` is the contract of `CitySource`.
- `adapters/city-search/zoneCitiesSource.ts`: builds a record for every listed zone plus `UTC`. Names come from the CLDR data, else from the private `deriveNameFromZoneId` (with the private `ZONE_ID_SEPARATOR` and `UNDERSCORES`). `readCountryTexts` keeps the `Intl.DisplayNames` guard of the legacy change.
- `views/cards/CardsView.tsx`: shows the `views.cardsEmptyState` paragraph when `rows.length === 0`, otherwise `LocationList`, then `LocationSearch`. It returns `LocationsLoadError` before that for `LocationsStatus.UNREADABLE`. `views/shared/LocationList.tsx` renders the `<ul>` inside `DndContext` / `SortableContext`. `views/shared/LocationRow.tsx` (197 lines) holds the sortable `<li>`, `DragHandle`, the place column, `LocalDateTime`, `DayTrack` (`track`, `city`, `onSelectFraction`, `onMoveTrack`) and `LocationMenu`.
- Tests: unit tests run with the device zone `UNIT_TEST_DEVICE_TIME_ZONE` (`Pacific/Kiritimati`, `src/test/deviceTimeZone.ts`), which no test lists. So every existing unit test that renders `CardsView` will show a Here entry. E2E runs in `Asia/Almaty` (`E2E_DEVICE_TIME_ZONE`, `playwright.bdd.config.ts`). The E2E states `empty`, `suggestions`, `IST results`, `search loading`, `search error`, `results` and `no matches` (`locationsStates.ts`) start from the empty list, so they will show a Here entry. The scenarios "Data loads only when the search opens" (`locations_ui_e2e.feature`) and "The slash key loads the search data only when it opens the search" (`locations_search_shortcut_e2e.feature`) assert no request at start.
- Legacy: the zone shim is `lib/legacy/zoneShim.ts`. `IS_POINTER_EVENTS_SUPPORTED` (`lib/legacy`) selects the tap fallback in `DayTrack` and `LocationList`. The outdated-engine stub for unit BDD is `test/features/browser_compatibility/steps/legacyZoneWorld.ts`. `emulateEngineWithoutPointerEvents` is in `src/test/e2e/withoutPointerEvents.ts`.

Binding decisions, all read for this design: ADR-0002 (layers, view contract), ADR-0003 (canonical IDs), ADR-0004 (only repositories write), ADR-0005 (shared blocks), ADR-0006 (`CitySearch` port, lazy sources), ADR-0007 (Here entry), ADR-0008 (work bounds). No global decision is needed.

## Goals / Non-Goals

**Goals:**
- Every concept the Here entry shows keeps its one owner (`.claude/rules/glossary.md`). The Here entry calls those owners and adds only what is new: whether it is shown, the meta line, the exemplar city and its own row.

**Non-Goals:**
- A second row type in the model state, a new port, a second loader of the city data, or a view-level copy of the card layout.

## Decision

### D1. Model: `getHereEntry` and zone-level matching (FR1, FR3, FR6)

- `getHereEntry(state): HereEntry | undefined` in new `model/hereEntry.ts`, with `type HereEntry = { timeZoneId: string }`. It returns `undefined` when `state.locations.some((location) => isLocationInDeviceTimeZone(location, state.deviceTimeZoneId))`, otherwise `{ timeZoneId: state.deviceTimeZoneId }`. It is the only place that decides whether the Here entry exists, and it reuses the Here mark's rule, so the mark and the entry cannot disagree. Commands and reducer do not change.
- `isLocationInDeviceTimeZone` takes `Pick<Location, "timeZoneId">`. `getOffsetDifferenceMinutes` takes `{ id?: string; timeZoneId: string }` as its first argument. Every existing caller passes a `Location`, which still fits. The Here entry passes `{ timeZoneId }` with no ID, so it is never the home row, and without home it is in the device zone and gets no difference. With home it gets `rowOffset − homeOffset`, `0` included. This is the existing rule, applied to one more subject; no second rule is written.

### D2. Presenter: `presentZoneMoment` shared by rows and the Here entry (FR2, FR3, NFR-P1)

- New `presenter/presentZoneMoment.ts`: `presentZoneMoment(subject: { id?: string; timeZoneId: string }, context: LocationRowsContext)` returns `utcOffsetLabel`, `offsetDifferenceLabel`, `offsetDifferenceAccessibleLabel`, `localTimeLabel`, `localDateLabel`, `localIsoDate` and `dayTrack`. The code moves out of `presentLocationRows` unchanged, so it calls the same owners.
- `presentLocationRows` becomes `{ id, cityLabel, countryName, mark, ...presentZoneMoment(location, context) }`.
- New `presenter/presentHereEntry.ts`: `presentHereEntry(hereEntry, cityLabel, context): PresentedHereEntry` returns `presentZoneMoment(hereEntry, context)` plus `cityLabel`, `mark: presentLocationMarks(translate)[LocationMarkKind.HERE]`, `metaLabel` (`translate("locations.deviceTimeMeta", { utcOffset: utcOffsetLabel })`) and `accessibleName` (`translate("locations.hereEntryName", { city, hereMark })`).
- Both presenters use the same module-level formatter cache, so the NFR-P1 bound covers both with no second cache.

### D3. Exemplar city: a `CitySearch` method and one name-derivation owner (FR8, FR12)

- `deriveNameFromZoneId` moves from `zoneCitiesSource.ts`, with its two constants, to new `adapters/city-search/deriveCityNameFromTimeZoneId.ts` as `deriveCityNameFromTimeZoneId`. It is exported from `adapters/city-search/index.ts` and `adapters/index.ts`. The zone cities source and the controller both call it. It stays in the adapter layer, next to the data it stands in for: the model returns no human-readable strings (`architecture.md`).
- `CitySearch` gets `getExemplarCity(timeZoneId, language): string`. `createCompositeCitySearch` answers `recordsById.get(timeZoneId)?.names[language] ?? deriveCityNameFromTimeZoneId(timeZoneId)`. Callers pass the canonical ID, so the renamed zone is named `Kyiv`.
- New `adapters/city-search/citySearch.contract.ts` (`describeCitySearchContract`) holds the `getExemplarCity` cases. It runs against `createCompositeCitySearch` (the overview's "shared contract tests per port").

### D4. Controller: one cached load, started only for a shown Here entry (FR8, FR9, NFR-P2)

- New `controller/cityDataCache.ts`: `loadCitySearchOnce(load)` caches the *pending or resolved* promise per loader in a `WeakMap`. It drops the entry when the promise rejects, so a retry loads again. `readLoadedCitySearch(load)` returns the resolved search or `undefined`. `useCitySearch` switches to it with unchanged behaviour. An in-flight background load is then shared by a search opened meanwhile, so the page requests the file once.
- `LocationsProvider` takes `loadCitySearch?: LoadCitySearch` (default: the `loadCitySearch` adapter) and puts it into `LocationsContextValue`. Tests inject a deferred loader there. In the app it is the same instance `LocationSearch` uses by default, so both share the cache.
- `useLocations` builds `LocationRowsContext` once in its memo and returns it as `rowsContext`, with `rows`. It also returns `hereEntry`: `getHereEntry(state)`, or `undefined` while `loadStatus` is `UNREADABLE` (FR9).
- New `controller/useExemplarCity.ts`: `useExemplarCity(timeZoneId | undefined, load)` returns `deriveCityNameFromTimeZoneId(timeZoneId)` at once, or the loaded name if the cache already holds the search. For a defined zone, it starts `loadCitySearchOnce(load)` in a `useEffect`, so after the first render. Once resolved it returns `search.getExemplarCity(timeZoneId, language)`. On rejection it keeps the derived name, with no error state and no retry.
- New `controller/useHereEntry.ts`: `useHereEntry(): PresentedHereEntry | undefined` calls `useLocations()`, then `useExemplarCity(hereEntry?.timeZoneId, loadCitySearch)`. It returns `useMemo(() => presentHereEntry(hereEntry, cityLabel, rowsContext))`, keyed by `hereEntry?.timeZoneId`, `cityLabel` and `rowsContext`. The context comes from the same memo pass as the rows, so the Here entry and the rows share one instant and appear in the same render (FR6). Only views that render the Here entry call `useHereEntry`, so `AppShell` and the search never start the load.

### D5. View: `HereEntryRow` outside the sortable list, shared row layout (FR4, FR5, UX1, UX3, NFR-A2, NFR-R1)

- The place column, `LocalDateTime` and `DayTrack` layout, including the 768 px breakpoint, moves from `LocationRow` into `views/shared/ZoneRowContent.tsx`. Its props are the city, the mark, the offset difference, the secondary line (country and offset, or the meta line), the time and the track handlers. `LocationRow` keeps the sortable `<li>`, `DragHandle` and `LocationMenu` around it.
- `views/shared/HereEntryRow.tsx` is a `<section aria-label={accessibleName}>` with the card's surface classes (`rounded-md border border-border bg-surface px-4 py-3`). It wraps `ZoneRowContent` with `metaLabel` in place of country and offset, and has no handle and no menu. Its `DayTrack` gets `onSelectFraction` / `onMoveTrack` from `useTimeSelection`, and `city={cityLabel}`, so the slider is named "Time in Almaty".
- `CardsView` calls `useHereEntry()` and renders `HereEntryRow` first, before `LocationList` or the empty-state paragraph. It is never inside `DndContext` or the `<ul>`, so it cannot be a drop target, `useReorderAnnouncements` counts locations only, and the list keeps its size for assistive technology.
- The city slot is one clamped line (`truncate`), so swapping the derived for the exemplar city keeps the height (UX3).

### D6. Empty state (FR7, UX2)

`CardsView` renders the Here entry, then the existing `views.cardsEmptyState` paragraph. `LocationSearch` with "Add location" stays where it is. Focus after removing the last location still goes to "Add location" (`rows.length` still counts locations only).

### D7. Outdated zone data and legacy input (FR12)

The Here entry adds no legacy handling of its own:

- `SET_DEVICE_TIME_ZONE` already canonicalizes `Europe/Kiev` to `Europe/Kyiv`, so `getHereEntry` returns the canonical ID and the Here mark keeps matching.
- Time, date, UTC offset and day track go through `presentZoneMoment`, which calls the same model owners as location rows. On an outdated engine, those reach `Intl.DateTimeFormat` through the legacy zone shim.
- `getExemplarCity` and `deriveCityNameFromTimeZoneId` take the canonical ID (`Kyiv`).
- The Here entry's `DayTrack` is the shared block, so the tap fallback chosen once from `IS_POINTER_EVENTS_SUPPORTED` applies to it as to any card.
- The moved `deriveCityNameFromTimeZoneId` keeps the same code. No BigInt is added (`src/test/noBigIntInSources.test.ts` scans production sources).

### D8. Strings (FR10)

New keys in `locales/en.json` and `locales/ru.json`:

- `locations.deviceTimeMeta`: "Device time · {{utcOffset}}" / «Время устройства · {{utcOffset}}»;
- `locations.hereEntryName`: "{{city}}, {{hereMark}}, Device time" / «{{city}}, {{hereMark}}, Время устройства», where `hereMark` is the existing `locations.hereMarkLabel`.

The `{{utcOffset}}` value comes from `formatUtcOffset`, so it is `UTC+5`, never `GMT+5`.

### D9. Existing tests that meet the Here entry

- Unit tests that render `CardsView` now see one more slider and time for `Pacific/Kiritimati`. Those that count sliders or times page-wide scope the query to the location list. Those that count search data requests (`stubZoneCitiesFetch`) pass a loader through `LocationsProvider`.
- E2E search states and the two lazy-data scenarios seed a location in `Asia/Almaty` first, so no Here entry loads the data. This is exactly the modified `location-search` precondition. The screenshot baselines `empty`, `suggestions` and `IST results` are re-approved.

## Consequences

Positive:
- One matching rule, one difference rule, one zone presenter and one data cache serve both rows and the Here entry.
- The search opens instantly after the Here entry has loaded the data.

Negative:
- In the Russian interface the derived name is English (`Almaty`) until the data loads. The load starts right after the first render, and the file is precached after the first visit.
- Users without a matching location download the zone cities file at start (at most 30 KB gzipped, one request, only while the Here entry is shown).
- Moving the layout out of `LocationRow` touches existing card tests. The extraction is a refactor step with the tests green before new behaviour.
- `Europe/Minsk` next to Moscow shows a Here entry with the same time. ADR-0007 accepts this (equality by time zone ID).

## Alternatives Considered

**A flag in the presenter or a check in `CardsView`**: a second owner of "does a location match the device time zone". Rejected for D1.

**A fake `Location` for the device time zone passed through `presentLocationRows`**: anything that trusts `Location` would count, store or reorder it, which contradicts the glossary ("not a location"), and it needs a fake country code. Rejected for D2.

**A separate small port or bundled map `zone → name`**: a second source of the same CLDR names, and 10–15 KB more in the bundle. `Intl.DisplayNames` has no exemplar cities. Rejected for D3.

**`deriveCityNameFromTimeZoneId` in the model next to `canonicalizeTimeZoneId`**: it returns display text, which model selectors must not (`architecture.md`). Rejected for D3.

**Load the city inside `useLocations`**: `AppShell` and the open search also call `useLocations`, so they would start the load, also behind the unreadable-list error. Rejected for D4.

**The Here entry as the first `<li>` with sorting disabled**: dnd-kit would still count it in positions and announcements, and the list size would be wrong for screen readers. A copy of the `LocationRow` markup would put the layout in two places. Both rejected for D5.

## Migration Plan

No stored data changes, so there is no migration. Rollback is a code revert.
