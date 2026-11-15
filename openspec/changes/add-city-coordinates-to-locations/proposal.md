# Add city coordinates to locations

Three other changes are active in `openspec/changes/`. `bind-day-periods-to-sun` depends on this change and lands after it. `refresh-data-through-scheduled-pull-requests` publishes the zone coordinates file this change adds together with the release file; it modifies the `city-data` requirement "Compiled once, committed, no network at build time", which this change does not modify. `apply-data-updates-silently` touches none of the capabilities of this change. No active change modifies a requirement this change modifies, and this change depends on none of them.

## Why

The "Time of day" day colouring paints night, morning, work and evening by the clock: 07:00, 09:00, 18:00 and 22:00 in every city, on every date. It was a proof of concept. The product now wants these day periods to follow the sun at the location — dawn, sunrise, sunset, dusk — and the sun can only be computed for a place with known coordinates. Today no part of the app knows where a city is: the city data compiler skips the latitude and longitude columns of GeoNames, the city record has no coordinates, and a location stores only its zone, city label and country code.

This change is the data foundation. It gives every city record and every city location its coordinates and changes nothing the user can see. The follow-up change `bind-day-periods-to-sun` uses them.

Audience: every user of the "Time of day" day colouring, after the follow-up change; in this change, nobody sees a difference.

## What Changes

- MODIFIED `city-data`: every GeoNames city of the committed city data carries its coordinates, rounded to 0.1°. A second committed file, the zone coordinates, holds the coordinates of the principal place of every IANA zone, read from the zone table (`zone.tab`) of the signed release archive that the zone rules compiler already downloads. The coordinates of both committed files are checked by the unit tests, without network access, on every pull request.
- MODIFIED `location-search`: a city record carries coordinates — from GeoNames for a GeoNames city, from the zone coordinates for a zone city. The UTC record has none. The search data file grows from at most 130 KB to at most 150 KB gzipped. Search results look and order exactly as today.
- MODIFIED `locations`: a city location added from the search keeps the coordinates of its city record, and they are stored with the list. The stored document version becomes 4; a version 3 list is migrated on load, without a write. A city location stored before this change gains its coordinates once the city data is loaded. This is the one write without a user change, so the no-write rules of "List is kept on the device" (`locations`) and "Home is kept on the device" (`home-location`) gain this exception. The device time location and UTC have no coordinates. Location identity, order and every visible row stay as they are.
- Unchanged: day periods, day colouring, colours, the settings page, the interface texts.
- Glossary (`docs/glossary/locations.md`), new term: **Coordinates** — the latitude and longitude of a place in decimal degrees, north and east positive, rounded to 0.1°; carried by a city record and by a city location. *Never:* position (a list position), geolocation (the browser feature), lat/lng in names.
- Glossary (`docs/glossary/search.md`), new term: **Zone coordinates** — the committed table of the coordinates of each zone's principal place, compiled from the IANA zone table; the coordinates of zone cities.
- Glossary, changed terms: **City record** (carries coordinates, absent for UTC), **City data** (GeoNames cities carry coordinates), **Location** (a city location may carry coordinates; they are not part of its identity), **Location list** (schema version 4).
- ADR-0006 gets a status note (the record format gains optional coordinates) and ADR-0010 one (the document schema version becomes 4); both are delivered as a handoff patch, because `docs/adr/` is outside what the implement stage writes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `city-data`: ADDED "Coordinates of the GeoNames cities", "Zone coordinates", "Coordinates are checked". No existing `city-data` requirement is modified.
- `location-search`: ADDED "City records carry coordinates"; MODIFIED "Search is fast and lazy" (the search data budget becomes 150 KB gzipped).
- `locations`: ADDED "Coordinates of a city location", "Coordinates are kept on the device", "Stored locations gain coordinates", "Coordinates cost no extra work"; MODIFIED "List is kept on the device" (a version 3 document is migrated; the list is also written when city locations gain their coordinates).
- `home-location`: MODIFIED "Home is kept on the device" (the same exception to "nothing is written until the user changes the list or home").

## Goals

- G1: 100% of the GeoNames cities of the city data and 100% of the zone cities except UTC have coordinates.
- G2: 100% of the city locations in a user's list have coordinates after the city data was loaded once, including locations stored before this change.
- G3: The user sees no change: 0 changed screenshots, 0 changed interface texts.

## Non-Goals

- NG1: No solar calculation and no change to day periods, day colouring or colours (`bind-day-periods-to-sun`).
- NG2: No renaming of the work period (`DayPeriod.WORK`); the follow-up change does it.
- NG3: No coordinates for the device time location and no use of the browser's geolocation.
- NG4: Coordinates are never shown, searched or edited.
- NG5: No change to location identity: two namesakes in one zone stay one location.
- NG6: Remote zone rules updates do not deliver zone coordinates; a zone that only a newer remote release knows has none until the next app deploy.
- NG7: No new CI step: the coordinate checks run inside `pnpm test`, which CI already runs.

## Users & Scenarios

- U1: A user adds Kazan from the search. The stored list now holds Kazan with the coordinates 55.8, 49.1; nothing on screen differs.
- U2: A user who added Moscow and Almaty last month opens the updated app. The version 3 list is read as before. After the city data loads in the background, both stored locations hold their coordinates; the list is written once.
- U3: A user types `IST` and adds Kolkata. The location holds the coordinates of the zone `Asia/Kolkata`.
- U4: A user adds UTC. The location holds no coordinates.
- U5: A maintainer refreshes the city data or bumps the zone rules release; the same two compile commands rewrite the coordinates, and the unit tests fail when a city or a zone city lacks them.

## Requirements

### Functional

- FR1: Every GeoNames city of the committed city data SHALL carry the latitude and longitude that GeoNames gives it, rounded to 0.1°: latitude from −90 to 90, longitude from −180 to 180, north and east positive. The city data compile command SHALL stop, naming the line, and write nothing when a city row has no latitude or longitude or one out of range.
- FR2: A committed zone coordinates file SHALL hold, for every zone listed in the zone table (`zone.tab`) of the IANA release archive, the coordinates of its principal place rounded to 0.1°, and SHALL name the release it was read from. The zone rules compile command SHALL write it from the archive whose signature it verified; building, testing and CI SHALL NOT use the network for it.
- FR3: Every zone city of the search data except UTC SHALL have coordinates. A zone city whose zone the zone table does not list SHALL take the coordinates of a named override; without one the check fails.
- FR4: The city data check SHALL fail, naming the city, when a GeoNames city has no coordinates or coordinates out of range. The zone coordinates check SHALL fail, naming the zone, when the zone coordinates file is malformed, names another release than the bundled one, holds coordinates out of range, or leaves a zone city other than UTC without coordinates. Both checks SHALL run on the committed files in the unit tests, without network access.
- FR5: A city record SHALL carry coordinates: those of the city data for a GeoNames city, those of the zone coordinates for a zone city. The UTC record SHALL carry none. A result matched by a zone abbreviation is a zone city and carries the zone's coordinates.
- FR6: Adding a location from a search result or a suggestion SHALL give the location the coordinates of that city record. Coordinates SHALL NOT be part of the location identity: adding a namesake of the same zone stays a duplicate.
- FR7: The stored list SHALL hold the coordinates of every city location that has them, and SHALL be read back with them, also offline. The stored document version SHALL become 4; a version 3 list SHALL be migrated on load to the same locations without coordinates, with no write on load. A stored entry whose coordinates are present but incomplete, not numbers or out of range SHALL make the stored list unreadable, as every other invalid entry does (ADR-0004): the load error with Reset is shown and the stored value is not overwritten.
- FR8: When the city data is loaded, every city location without coordinates SHALL gain the coordinates of the city record that names its city label; when no record of its zone bears the label, those of the zone's zone city. The list SHALL then be written once. When no location gained coordinates, nothing SHALL be written. A failed load SHALL leave the list as it is, with no error shown.
- FR9: The device time location SHALL never hold or store coordinates, and a location in UTC SHALL have none.

### Non-Functional

#### Performance

- NFR-P1: The search data SHALL be one separate file of at most 150 KB gzipped (130 KB today, measured 119.4 KB); the initial JavaScript SHALL stay at most 150 KB gzipped, and the search data SHALL stay out of it.
- NFR-P2: Giving stored locations their coordinates SHALL look up one city record per city location that lacks coordinates, once per load of the city data. When every city location has coordinates, loading the city data SHALL look up no coordinates and write nothing. A minute tick SHALL look up none. Looking up coordinates SHALL normalize no text.
- NFR-P3: Presenting the list SHALL do the same counted work as today: no formatter, collator or lookup is added per row.

#### Accessibility

- NFR-A1: No element, name or role changes. The existing axe-core scenarios of the search and the list SHALL pass unchanged, with 0 violations in both themes.

#### Responsive

- NFR-R1: No layout changes. Every approved screenshot of the search, the Cards view and the Grid view SHALL match without re-approval, from 320 px to 2560 px.

## UX Acceptance Criteria

- UX1: Nothing the user sees changes: the search results, the list rows and the settings page look and read as before.
- UX2: A user of an older list notices nothing when it gains coordinates: no message, no flicker, no reordering.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| online | city data not loaded yet (loading) | the list as stored; locations without coordinates stay so |
| online or offline | city data loaded | the list as stored; locations without coordinates gain them; the list is written once |
| online | city data failed to load (error) | the list as stored, no error; the next load tries again |
| any | stored entry with malformed coordinates (error) | the existing load error with Reset, as for every invalid entry |
| offline | visited before, search data cached | as "city data loaded" |
| offline | never loaded | the list as stored, without coordinates for older locations |
| any | list empty | nothing is looked up or written |

## Behavior

All scenarios are unit BDD (vitest-cucumber; no `_e2e` pair, so no `_unit` suffix) and carry the tags `@add-city-coordinates-to-locations @<id>`:

- `packages/client/src/test/features/city_data/city_data_coordinates.feature` (new folder) — FR1, FR4.
- `packages/client/src/test/features/zone_rules/zone_rules_coordinates.feature` — FR2, FR3, FR4.
- `packages/client/src/test/features/location_search/location_search_coordinates.feature` — FR5; the bundle budget and the new work-bound scenario of `location_search_performance.feature` — NFR-P1, NFR-P2.
- `packages/client/src/test/features/locations/locations_coordinates.feature` (FR6, FR9, UX1), `locations_coordinates_storage.feature` (FR7, FR9), `locations_coordinates_fill.feature` (FR8, UX2), `locations_coordinates_budget.feature` (NFR-P2, NFR-P3).

The existing E2E, axe-core and screenshot scenarios cover NFR-A1 and NFR-R1 unchanged.

## Visual Reference

None: no screen changes. Design tokens stay the source of truth.

## Affected IA

No changes.

## Success Metrics

- M1: 100% of the GeoNames cities of the committed city data have coordinates in range (6 102 of 6 102 in the dump of 2026-11-14).
- M2: 100% of the zone cities of the search data except UTC have coordinates (418 of 418 with the release 2026f, whose `zone.tab` lists exactly the zone cities except UTC).
- M3: 10 of 10 sample city records carry exactly these coordinates. GeoNames cities: Kazan 55.8, 49.1; Quito −0.2, −78.5; Murmansk 69.0, 33.1. Zone cities, from `zone.tab` of 2026f: Moscow 55.8, 37.6 (`+554521+0373704`); Almaty 43.3, 77.0 (`+4315+07657`); New York 40.7, −74.0 (`+404251-0740023`); Sydney −33.9, 151.2 (`-3352+15113`); Reykjavik 64.2, −21.8 (`+6409-02151`); Auckland −36.9, 174.8 (`-3652+17446`); Honolulu 21.3, −157.9 (`+211825-1575130`).
- M4: The built search data file is at most 150 KB gzipped and the initial JavaScript at most 150 KB gzipped.
- M5: 0 approved screenshots change; 0 axe-core violations in the existing scenarios.
- M6: Mutation score ≥ 95% (minimum acceptable 90%) on the new and changed production files of `scripts/cityData/`, `scripts/zoneRules/`, `src/adapters/`, `src/model/` and `src/controller/`.

## Open Questions

None. Decided by the owner: the search data budget becomes 150 KB gzipped. The design names the fallback if the measured size is higher.
