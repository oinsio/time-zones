# Design: Show the Here entry for the device time zone

## Context

Driven by FR1–FR12, NFR-P1, NFR-P2, NFR-A1, NFR-A2, NFR-R1, NFR-R2 and UX1–UX3 of `proposal.md` (see proposal.md — Why). This change is implemented after `support-legacy-ios-12-safari` and then `set-home-location-and-show-differences` are archived. From the legacy change it relies on:

- the `Intl.DateTimeFormat` legacy zone shim (its FR4, D4);
- the tap fallback of day tracks without Pointer Events (its FR8, D8);
- the `Intl.DisplayNames` guard in `zoneCitiesSource.ts` (its D6).

From the home change it relies on the following. That change adds `homeLocationId` to `WorldClockState`, a home-aware `getReferenceZone`, the offset difference (`getOffsetDifferenceMinutes` in the model, `formatOffsetDifference` and `LocationRow.offsetDifferenceLabel` in the presenter), the Home mark and the Location menu.

Current state, checked in `packages/client/src/`:

- `model/deviceTimeZone.ts`: `isLocationInDeviceTimeZone(location, deviceTimeZoneId)` is the one matching rule. `model/locationMark.ts`: `getLocationMarkKind` returns `LocationMarkKind.HERE` through it.
- `presenter/presentLocationRows.ts` (103 lines): maps each `Location` to a `LocationRow`. Per row, it computes:
  - the UTC offset (`getUtcOffsetMinutes` + `formatUtcOffset`);
  - the mark (`presentLocationMarks`);
  - local time and date (`getLocalDateTime` + `formatLocalTime` / `formatLocalDate`);
  - the day track (`presentDayTrack`).

  Of these, only the city label, the country name and the mark depend on the `Location`. Everything else depends on the time zone ID alone.
- `controller/useLocations.ts`: presents the rows in one `useMemo` keyed by the state, language and `minuteTick`.
- `controller/useCitySearch.ts`: loads the search data through a `LoadCitySearch` and caches it per loader in a module-level `WeakMap` (`loadedSearches`). The data file is fetched only when the search opens (`adapters/loadCitySearch.ts`).
- `ports/citySearch.ts`: `CitySearch` has `search` and `suggest`. `adapters/city-search/createCompositeCitySearch.ts` keeps `recordsById`. `adapters/city-search/zoneCitiesSource.ts` builds each record's names from the CLDR data and falls back to a private `deriveNameFromZoneId` for zones without data.
- `views/cards/CardsView.tsx`: shows `<p>{views.cardsEmptyState}</p>` when there are no rows, otherwise `LocationList`, and handles the load error and the search. `views/shared/LocationList.tsx` renders a `<ul>` inside `DndContext` / `SortableContext`. `views/shared/LocationRow.tsx` holds the place column, `LocalDateTime` and `DayTrack` layout inside a sortable `<li>`.

Binding decisions: ADR-0002 (layers, view contract), ADR-0004 (only repositories write), ADR-0005 (shared blocks), ADR-0006 (city data sources, lazy), ADR-0007 (Here entry), ADR-0008 (work bounds). No global decision is needed.

## Goals / Non-Goals

**Goals:**
- Every concept the Here entry shows keeps its one glossary owner (`.claude/rules/glossary.md`). The Here entry calls those owners and adds only what is new: whether it is shown, the meta line and its own row.

**Non-Goals:**
- A second row type in the model state.
- A new port.
- A second loader of the city data.
- A view-level copy of the card layout.

## Decisions

### D1. Model: `getHereEntry` selector (FR1, FR6)

`getHereEntry(state): { timeZoneId: string } | undefined` in `model/hereEntry.ts`:

- it returns `undefined` when `state.locations.some((location) => isLocationInDeviceTimeZone(location, state.deviceTimeZoneId))`;
- otherwise it returns `{ timeZoneId: state.deviceTimeZoneId }`.

It is the only place that decides whether the Here entry is shown, and it reuses the Here mark's matching rule, so the mark and the entry can never disagree. The state, commands and reducer do not change. The Here entry is derived (ADR-0007), and `deviceTimeZoneId` is already canonical with the `UTC` fallback.

*Alternative rejected:* a flag in the presenter or a check in `CardsView`. That would be a second owner of "does a location match the device time zone".

### D2. Presenter: one zone-level owner shared by rows and the Here entry (FR2, FR3, NFR-P1)

The time-zone part of `presentLocationRows` moves into `presenter/presentZoneMoment.ts`. `presentZoneMoment(timeZoneId, context)` returns:

- `utcOffsetLabel`;
- `localTimeLabel`, `localDateLabel`, `localIsoDate`;
- `dayTrack`;
- `offsetDifferenceLabel`, through the owners added by `set-home-location-and-show-differences`.

`presentLocationRows` becomes `{ id, cityLabel, countryName, mark, ...presentZoneMoment(location.timeZoneId, context) }`. `presentHereEntry(hereEntry, cityLabel, context)` returns:

- the zone moment;
- `mark: marks[LocationMarkKind.HERE]`;
- `metaLabel`, built as `translate("locations.deviceTimeMeta", { utcOffset })` from the same `utcOffsetLabel`;
- `accessibleName` ("Almaty, You are here, Device time").

The rule "no offset difference while it is the reference zone" stays inside the offset-difference selector of the previous change, which is called with the device time zone ID. Both presenters run in the same `useMemo` pass with the same formatter caches. The unchanged-rows test of NFR-P1 therefore covers both, with no second cache.

*Alternative rejected:* building a fake `Location` for the device time zone and passing it through `presentLocationRows`. It would be counted, stored or reordered by any code that trusts `Location`, which contradicts the glossary ("not a location"). It would also need a fake country code.

### D3. Exemplar city: a `CitySearch` method and one name-derivation owner (FR8, NFR-P2)

- `deriveNameFromZoneId` moves from `zoneCitiesSource.ts` to the model as `deriveCityNameFromTimeZoneId` in `model/timeZoneId.ts`, next to `canonicalizeTimeZoneId`. The zone cities source and the controller both call it, so a name is derived from a time zone ID in one place.
- `CitySearch` gets `getExemplarCity(timeZoneId, language): string`. The composite adapter answers from `recordsById` and falls back to `deriveCityNameFromTimeZoneId`. The contract test of `CitySearch` covers it.
- The glossary entry "Exemplar city" gets these owners.

*Alternatives rejected:*
- A separate small port or bundle map (`zone → name`). That is a second source of the same CLDR names, and the bundle grows by 10–15 KB.
- `Intl.DisplayNames`. It has no exemplar cities.

### D4. Controller: one cached loader, background load only while shown (FR8, NFR-P2)

The per-loader cache (`loadedSearches`) and the load call move from `useCitySearch.ts` into `controller/cityDataCache.ts`, which both hooks use. A new `useExemplarCity(timeZoneId | undefined, load = loadCitySearch)`:

- returns `deriveCityNameFromTimeZoneId(timeZoneId)` at once;
- starts the cached load only when `timeZoneId` is defined, after the first render (`useEffect`);
- returns `search.getExemplarCity(timeZoneId, language)` once the data is loaded;
- leaves the derived name in place on failure, with no error state.

If the search loaded the data earlier, the name is ready at once, and vice versa. `useLocations` returns `hereEntry`, presented with the city from `useExemplarCity` (`undefined` when not shown).

*Alternative rejected:* a second fetch in `useLocations`. It would duplicate the loader and the retry semantics.

### D5. View: `HereEntryRow` outside the sortable list, shared row layout (FR4, FR5, UX1, NFR-A2, NFR-R1)

- The place column, `LocalDateTime` and `DayTrack` layout, including the 768 px breakpoint, moves from `LocationRow` into `views/shared/ZoneRowContent.tsx`.
- `LocationRow` keeps the sortable `<li>`, the `DragHandle` and the Location menu around it.
- `HereEntryRow` is a `<section>` with the card's surface classes and `aria-label={accessibleName}`. It wraps `ZoneRowContent`, with the meta line in place of country and offset, and has no handle and no menu. Its `DayTrack` receives the same `onSelectTrackFraction` / `onMoveTrack` from `useTimeSelection`.
- `CardsView` renders `HereEntryRow` first, before `LocationList` or before the empty-state explanation. It is never inside `DndContext` or the `<ul>`, so it cannot be a drop target, and reorder positions count locations only. The list keeps its own size for assistive technology.
- The meta line keeps one text line, and the city name has a single-line, clamped city slot. The swap from the derived to the exemplar city therefore keeps the height (UX3).

*Alternatives rejected:*
- The Here entry as the first `<li>` with sorting disabled. dnd-kit would still count it in positions and announcements, and the list size would be wrong for screen readers.
- A copy of the `LocationRow` markup. The layout would live twice.

### D6. Empty state (FR7, UX2)

`CardsView` renders the Here entry, then the existing `views.cardsEmptyState` explanation. `LocationSearch` with "Add location" stays where it is. Focus after removing the last location still goes to "Add location".

### D7. Outdated zone data and legacy input (FR12)

The Here entry adds no legacy handling of its own:

- `SET_DEVICE_TIME_ZONE` already canonicalizes the reported device time zone (`Europe/Kiev` → `Europe/Kyiv`). `getHereEntry` therefore returns the canonical ID, and the Here mark keeps matching.
- Time, date, UTC offset and day track go through `presentZoneMoment`, which calls the same model owners as location rows. On iOS 12 those owners reach the engine through the legacy zone shim of `support-legacy-ios-12-safari`. No call site maps the ID itself.
- `getExemplarCity` and `deriveCityNameFromTimeZoneId` take the canonical ID, so the name is `Kyiv`, not `Kiev`.
- D3 edits `zoneCitiesSource.ts` and `model/timeZoneId.ts` on top of the legacy change's versions. Those include the `Intl.DisplayNames` guard and the removal of BigInt from `timeZoneId.ts`. Moving `deriveNameFromZoneId` must keep both untouched and must add no BigInt.
- The Here entry's `DayTrack` is the shared block. The tap fallback of the legacy change (chosen once from Pointer Events support) applies to it as to any card, so the Here entry has no separate input fallback.

The unit scenario of FR12 uses the engine stub of the legacy change: a fake native `Intl.DateTimeFormat` that rejects `Europe/Kyiv`.

### D8. Strings (FR10)

New keys in `locales/en.json` and `locales/ru.json`:

- `locations.deviceTimeMeta`: "Device time · {{utcOffset}}" / «Время устройства · {{utcOffset}}»;
- `locations.hereEntryName`: "{{city}}, {{hereMark}}, Device time" / «{{city}}, {{hereMark}}, Время устройства», where `hereMark` is the existing `locations.hereMarkLabel`.

The `{{utcOffset}}` value comes from `formatUtcOffset`, so it is `UTC+5`, never `GMT+5`.

## Risks / Trade-offs

- [The derived name is English in the Russian interface until the data loads (`Almaty`)] → The load starts right after the first render, and the PWA precaches the file. After the first visit it usually resolves before the user reads the row.
- [Loading the city data on start for users without a match costs one request] → It happens only while the Here entry is shown, and the search reuses the loaded data afterwards.
- [Moving the layout out of `LocationRow` touches existing card tests] → Existing unit and screenshot tests run unchanged against `LocationRow`. The extraction is a refactor step before new behaviour, with tests green.
- [`Europe/Minsk` next to Moscow shows a Here entry with the same time] → Accepted by ADR-0007 (equality by time zone ID).

## Migration Plan

No stored data changes, so there is no migration. Rollback is a code revert.
