# Show the Here entry for the device time zone

Builds on `support-legacy-ios-12-safari` and `set-home-location-and-show-differences`, both archived (`openspec/changes/archive/2026/10/`).

## Why

ADR-0007 makes the device time zone always visible: a location whose time zone ID equals the device time zone gets the Here mark, and "if no location matches, a derived **Here** entry is shown first". Only the Here mark exists today (`openspec/specs/locations/spec.md`, "Here mark on location rows"). When no location matches, the user cannot see their own time:

- without a home location, every offset difference is counted from the device time zone (`openspec/specs/locations/spec.md`, "Offset difference on location rows"), a zone that is not on the screen;
- while travelling with a home location set (home Almaty, device in Moscow, Moscow not in the list), the local time is nowhere;
- on first launch the screen shows only an explanation, although `docs/architecture/views.md` ("UI states", Empty) and ADR-0007 ("First launch") promise the Here entry with an explanation and an "Add location" action.

`views.md` ("Here entry") and the approved screen `docs/design/screens/phone-no-home.png` describe the row. The view contract (`views.md`) requires "see the Here entry without home". Audience: every user, most of all new users and travellers.

## What Changes

- ADDED: a derived Here entry for the device time zone, shown first whenever no location in the location list has the Here mark. It is not stored, cannot be removed, reordered or made home, and is not a location.
- ADDED: the Here entry shows the Here mark and its "here" caption, the exemplar city of the device time zone, the meta line "Device time · UTC+5" («Время устройства · UTC+5») in place of the country and UTC offset, the local time and date at the effective instant, and a day track on the shared reference day. Its offset difference follows the rule of location rows (`locations`, "Offset difference on location rows"): none while it is the reference zone, the difference from home otherwise.
- ADDED: the exemplar city comes from the zone cities data, loaded in the background only while the Here entry is shown. Until it is loaded, or when loading fails, the city is derived from the time zone ID (`Asia/Almaty` → `Almaty`).
- MODIFIED: the empty state shows the Here entry, then the explanation and the "Add location" action (`main-page`, "Empty state").
- MODIFIED: the search data stays lazy only while no Here entry is shown. The Here entry's background load is the one request, and the search then reuses it (`location-search`, "Search is fast and lazy" and "Open the search with the slash key").
- ADDED: on an engine with outdated zone data (iOS Safari 12.5), the Here entry works for a renamed device time zone through the legacy zone shim, like any location row.
- No stored data changes: nothing is written for the Here entry (ADR-0004 schema unchanged).

Glossary terms (`docs/glossary/`, written as a handoff patch, see `tasks.md`):

- **Here entry** (`locations.md`): drop *(planned)*. Add *RU:* (строка «Здесь», мета «Время устройства») and *Code:* `getHereEntry`, `presentHereEntry`, `useHereEntry`, `HereEntryRow`.
- **Exemplar city** (`search.md`): add *Code:* `CitySearch.getExemplarCity` and `deriveCityNameFromTimeZoneId`. Today the term has no code owner, and deriving a name from a time zone ID is a private `deriveNameFromZoneId` in `adapters/city-search/zoneCitiesSource.ts`.
- **Location row** (`locations.md`): *Code:* adds `presentZoneMoment` (the zone part shared with the Here entry). *Not:* the Here entry.
- **View contract** (`views.md`): add the Here entry.
- **Here mark**, **Offset difference**, **Location menu**: unchanged. The Here entry uses the same mark kind and the same matching rule.

## Capabilities

### New Capabilities

None. The Here entry belongs to the Locations context.

### Modified Capabilities

- `locations`: ADDED requirements for the Here entry: when it is shown, its content, its offset difference, what it cannot do, time selection, how it follows the device time zone, its exemplar city, other page states, outdated zone data, strings, the view contract, work bounds, accessibility and layout.
- `main-page`: MODIFIED "Empty state". The Here entry comes first, then the explanation and "Add location".
- `location-search`: MODIFIED "Search is fast and lazy" and "Open the search with the slash key". The search data is not requested before the search first opens while no Here entry is shown. While the Here entry is shown, its background load is the only request, and the search reuses it.

## Impact

- `packages/client/src/`:
  - `model/`: `getHereEntry` selector. `isLocationInDeviceTimeZone` and `getOffsetDifferenceMinutes` accept a zone without a location ID;
  - `presenter/`: `presentZoneMoment`, shared by location rows and the Here entry, and `presentHereEntry`;
  - `ports/` and `adapters/city-search/`: `CitySearch.getExemplarCity`, a `CitySearch` contract suite, and `deriveCityNameFromTimeZoneId` moved out of `zoneCitiesSource.ts`;
  - `controller/`: a shared city data cache, `useExemplarCity`, `useHereEntry`. `useLocations` returns the Here entry zone and its presentation context. `LocationsProvider` takes the city data loader;
  - `views/shared/`: `HereEntryRow` and `ZoneRowContent`, the row layout shared with `LocationRow`;
  - `views/cards/`: `CardsView`;
  - `locales/en.json`, `locales/ru.json`.
- Tests:
  - new unit BDD and E2E features under `src/test/features/locations/`;
  - the view contract feature;
  - main page empty-state scenarios;
  - existing E2E search scenarios that assume no request before the search opens;
  - screenshot baselines whose list is empty are re-approved, and two new states are added.
- Docs, as handoff patches (the implement stage writes only under `packages/`):
  - the glossary entries above;
  - `docs/architecture/views.md` ("Here entry": outside the numbered list, in the empty state, `UTC+5` instead of `GMT+5`).
- No new dependencies and no storage schema change. No new network: the zone cities data is the existing lazy file, precached by the PWA (`globPatterns` include `json` in `vite.config.ts`).

## Goals

- G1: In 100% of list states (empty, no matching location, home set elsewhere) the device time is on the screen without any user action.
- G2: The Here entry appears, changes and disappears in the same render as the change of the location list or the device time zone that causes it.
- G3: On first launch the user sees their own time, and 0 storage writes happen.

## Non-Goals

- NG1: An "Add to list" action on the Here entry. The user adds the city through the search.
- NG2: Typing a wall-clock time into the Here entry. This is planned for `add-wall-time-input-with-hint`.
- NG3: Prompts or notices when the device time zone changes (ADR-0007 rejects them).
- NG4: Matching by UTC offset or by equal rules (`Europe/Minsk` and `Europe/Moscow`). Matching stays by canonical time zone ID (ADR-0007).
- NG5: The Grid view, settings, the day shift and the midnight marker.
- NG6: The build-time zone data extraction (`scripts/zoneData/extractZoneData.ts`), which has its own name derivation for the generated file. It runs in Node at build time, outside `src/`, and is not changed.

## Users & Scenarios

- U1: First launch in Almaty. The screen shows "Almaty · here · Device time · UTC+5" with the time and a day track, with the explanation and "Add location" below it.
- U2: The device is in Almaty, and the list is Moscow, Kolkata, New York with no home. The Here entry is first. The other cards show `−2 h`, `+0:30` and `−9 h` (as on `phone-no-home`).
- U3: The user adds Almaty. The Here entry disappears, and the added Almaty gets the Here mark.
- U4: Home is Almaty and the device has moved to Moscow, which is not in the list. The first row is "Moscow · here · −2 h · Device time · UTC+3". The day tracks still span Almaty's day.
- U5: The user drags the handle on the Here entry's day track. Every card follows, as with any day track.

## Requirements

### Functional

- FR1: When no location in the location list has a time zone ID equal to the device time zone (canonical IANA IDs), a Here entry is shown before the first location. When at least one location matches, no Here entry is shown, because that location already has the Here mark.
- FR2: The Here entry shows:
  - the Here mark in the leading slot;
  - the exemplar city of the device time zone (FR8);
  - the "here" caption;
  - in place of the country and the UTC offset, the meta line "Device time · {UTC offset}" («Время устройства · {UTC offset}»), with the UTC offset at the effective instant;
  - the local time and date at the effective instant;
  - a day track on the shared reference day.
- FR3: The Here entry's offset difference follows the rule of location rows (`locations`, "Offset difference on location rows"). Without a home location it is the reference zone and shows no difference. With a home location it shows the difference from home, `0 h` when the UTC offsets are equal.
- FR4: The Here entry cannot be removed, reordered or made home. It has no drag handle and no Location menu. It is never a drop target: locations are reordered only among themselves, and the Here entry always stays first. Positions in reorder announcements count locations only.
- FR5: A time selection on the Here entry's day track works as on a card's day track: by pointer and by keys, with the same pinning of the reference moment.
- FR6: The Here entry follows the device time zone. The zone is read at the same moments as today: at start, at every minute tick, and when the page becomes visible. The Here entry appears, changes or disappears in the same render as the Here mark. The same holds when a location is added, removed or reordered, when the list changes in another tab, and when the list is reset. An unknown device time zone is `UTC`, shown as "UTC · here · Device time · UTC".
- FR7: With an empty location list, the Here entry is shown first, then the explanation and the "Add location" action, which opens the search as today. Nothing is written to storage.
- FR8: The city of the Here entry is the exemplar city of the device time zone in the interface language, from the zone cities data. That data is loaded in the background after the first render, only while the Here entry is shown. Until it is loaded, or when loading fails, the city is derived from the time zone ID (`Asia/Almaty` → `Almaty`), with no error shown. Showing the Here entry never waits for the data. The search reuses data the Here entry loaded, so the page requests the data at most once until a load fails.
- FR9: The unreadable stored list keeps its load error with Reset and shows no Here entry, and the zone cities data is not requested for it. The view skeleton is unchanged, and the Here entry appears together with the rows. With storage unavailable, the Here entry is shown as usual.
- FR10: Every new string ("Device time", the Here entry's accessible name) exists in English and Russian.
- FR11: The view contract scenario "See the Here entry without home" (`@view-contract`) passes in the Cards view.
- FR12: On an engine that rejects the canonical device time zone but accepts its legacy name (`Europe/Kyiv` / `Europe/Kiev`, `browser-compatibility` capability), the Here entry shows its time, date, UTC offset and day track through the same owners as a location row, so through the legacy zone shim. Its exemplar city is looked up by the canonical time zone ID. On engines without Pointer Events, its day track selects a time by tap through the shared fallback, with no fallback of its own.

### Non-Functional

#### Performance

- NFR-P1: The Here entry costs no more work than one location row: the same formatters and time zone transition lookups (work bounds, ADR-0008). Presenting 50 location rows plus the Here entry again builds no formatter. The existing `rowPresenting.bench.ts` includes the Here entry.
- NFR-P2: The zone cities data does not delay the first render of the Here entry. The Here entry is shown with the derived city before the data is loaded.

#### Accessibility

- NFR-A1: axe-core reports no violations with the Here entry above a list, in the empty state, and while travelling with home set, in the light and dark themes.
- NFR-A2: The Here entry is not an item of the numbered location list, so a screen reader does not count it as a location. Its accessible name reads "Almaty, You are here, Device time" («Алматы, Вы здесь, Время устройства»). Its day track is one Tab stop named "Time in Almaty" («Время — Алматы»).

#### Responsive

- NFR-R1: With the Here entry shown, the page does not scroll horizontally at 320 px and 2560 px. The Here entry has the card layout: text above the day track below 768 px, the day track right of the time with hour labels from 768 px.
- NFR-R2: New screenshot states "here-entry" and "here-entry-travel" at 375 px and 1024 px, in both themes and both projects (`chromium`, `mobile-chrome`). The existing baselines whose list is empty ("empty", "suggestions", "IST results") are re-approved with the Here entry.

## UX Acceptance Criteria

- UX1: The Here entry looks like a card (`phone-no-home`). It differs only by the meta line "Device time · UTC+5" in place of "country · zone" and by having no drag handle and no Location menu.
- UX2: In the empty state, the explanation and "Add location" stand below the Here entry, not in place of it.
- UX3: Replacing the derived city with the exemplar city does not change the Here entry's height or move the cards below it.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | empty location list | Here entry, then the explanation and "Add location" (FR7) |
| any | no location in the device time zone | Here entry first, then the locations (FR1) |
| any | a location in the device time zone | no Here entry; that location has the Here mark (FR1) |
| any | home set, device time zone not in the list | Here entry with the offset difference from home (FR3) |
| any | zone cities data loading or failed | Here entry with the derived city, no error (FR8) |
| any | unknown device time zone | Here entry for `UTC` (FR6) |
| any | view loading (skeleton) | skeleton unchanged (FR9) |
| any | unreadable stored list | load error with Reset unchanged, no Here entry, no data request (FR9) |
| any | storage unavailable | Here entry shown, warning shown (FR9) |
| any | iOS Safari 12.5, device time zone renamed after the engine's zone data (`Europe/Kyiv`) | Here entry works through the legacy name, city by the canonical ID (FR12) |
| offline | any of the above | same: the zone cities data is precached; without it, the derived city |

## Behavior

Feature files under `packages/client/src/test/features/`, tagged `@show-here-entry-for-device-time`:

- `locations/locations_here_entry_unit.feature` (vitest-cucumber): when the Here entry is shown, content, offset difference with and without home, nothing to remove or move, following the device time zone and list changes, the derived and the exemplar city, page states, the renamed device time zone on outdated zone data, strings, the work bound.
- `locations/locations_here_entry_e2e.feature` (playwright-bdd): reorder keeps it first with announcements, time selection by keys, tap without Pointer Events, accessible name and list size, axe-core, layout and no horizontal scrolling.
- `locations/locations_view_contract_e2e.feature`: the `@view-contract` scenario "See the Here entry without home".
- `main_page/main_page_states_unit.feature`: the empty state with the Here entry.
- `locations/locations_ui_e2e.feature` and `locations/locations_search_shortcut_e2e.feature`: the modified lazy-data scenarios, and the screenshot outline with the two new states.

## Visual Reference

`docs/design/screens/phone-no-home.png` and its HTML twin show the Here entry (Almaty, location arrow, "здесь", "Время устройства · GMT+5"). `docs/design/screens/phone-travel.png` shows the Here mark on a listed location while travelling. The app writes UTC offsets as `UTC+5`, not `GMT+5` (glossary, UTC offset). Documents win over screens (`docs/design/README.md`). Design tokens are the source of truth for colours.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR12, NFR-P1, NFR-P2, NFR-A1, NFR-A2, NFR-R1, NFR-R2 and UX1–UX3 have at least one automated test under `packages/client/src/` that names `show-here-entry-for-device-time` together with the ID.
- M2: Device time zone `Asia/Almaty`, current instant `2026-03-08T07:30:00Z`, Russian, list Moscow, Kolkata, New York, no home, zone cities data loaded. The first row is the Here entry: `Алматы`, `здесь`, `Время устройства · UTC+5`, `12:30`, `вс, 8 мар.`, no offset difference. Moscow shows `−2 ч`, Kolkata `+0:30`, New York `−9 ч` (4 of 4).
- M3: After Almaty is added, exactly 1 row has the Here mark: the stored Almaty. After it is removed, the Here entry is first again. Both transitions happen in one render (2 of 2).
- M4: Home Almaty, device time zone `Europe/Moscow`, Moscow not in the list, Russian. The first row is the Here entry `Москва` with `−2 ч` and `Время устройства · UTC+3`. The reference day is `2026-03-07T19:00:00Z`–`2026-03-08T19:00:00Z`.
- M5: First launch: 0 storage writes, and the Here entry is shown with the derived city before the zone cities data resolves. Opening the search after that load makes 0 further requests for the data (1 request in total).
- M6: Mutation score of the new or changed model, presenter, adapter, controller and view code ≥ 95% (minimum 90%), in scoped Stryker runs. axe-core reports 0 violations in 3 states × 2 themes. The new and re-approved screenshot baselines pass without `--update-snapshots`.
- M7: With the engine stub that rejects `Europe/Kyiv` and accepts `Europe/Kiev`, device time zone reported as `Europe/Kiev`, English, current instant `2026-03-08T07:30:00Z`, list Moscow: the Here entry shows `Kyiv`, `09:30` and `Device time · UTC+2`.

## Open Questions

All decided:

- Q1: Where does the city come from? Decided: the exemplar city from the zone cities data, loaded in the background only while the Here entry is shown. The city derived from the time zone ID is shown before and on failure (FR8).
- Q2: An "Add to list" action on the Here entry? Decided: no (NG1). The search already shows suggestions before typing.
- Q3: Typing a time into the Here entry? Decided: yes, in `add-wall-time-input-with-hint`, whose wall-time target is a location or the Here entry (NG2).
- Q4: The Here entry on the load error of an unreadable stored list? Decided: no. The error screen is about recovery (FR9).
- Q5: The background load conflicts with the stable rule "the page MUST NOT request the search data before the search is first opened" (`location-search`). Decided by FR8 (task decision "loaded in the background"): the rule holds while no Here entry is shown. The Here entry's load is the one request, and the search reuses it.
