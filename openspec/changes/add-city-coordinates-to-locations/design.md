# Design

## Context

See `proposal.md` for the motivation. Driven by FR1–FR9 and NFR-P1–NFR-P3 of the proposal.

Current state, read from the code:

- `scripts/cityData/parseGeoNamesRows.ts` reads columns 0, 1, 7, 8, 10, 14, 17 of `cities15000.txt`; latitude and longitude are columns 4 and 5 of the same line.
- The committed city data is one tuple per city (`CityTuple`, `DATASET_FORMAT_VERSION = 1`); the served form is columns (`toServedCityData.ts`), parsed in the app by `parseCitySearchData`.
- Zone cities come from CLDR at build time (`scripts/zoneData/loadZoneData.ts`): names and a country code, no coordinates. GeoNames matches only 289 of the 419 zone cities (measured on `cities15000` of 2026-11-14).
- `scripts/zoneRules/compileWithZic.ts` unpacks only the nine source files and `version` from the signed tzdata archive. The archive of 2026f also holds `zone.tab` with 418 rows — exactly the zone cities except UTC (measured). `zone1970.tab` lacks 107 of them and is not used.
- `CityRecord` (`src/ports/citySearch.ts`) and `Location` (`src/model/locations.ts`) have no coordinates. A location's identity is zone plus label; it stores no record ID.
- The stored list is a version 3 document; `parseStoredLocations` rejects the whole document on an invalid entry and ignores unknown fields of a city entry.
- `useCityLabels` already loads the city data once in the background while the list holds a city location, and `CitySearch.getCityLabel(timeZoneId, storedLabel, language)` already resolves a stored location to a city record.
- Remote zone rules updates deliver only the release file (`zone-rules/<release>.json`).

## Goals / Non-Goals

**Goals:**

- One owner of the concept "coordinates" in the model, reused by the port, the adapters and the stored document.
- Zone coordinates that need no name matching and no second download.
- A stored list that stays readable by the previous app build during a rollout.

**Non-Goals:**

- Any consumer of coordinates (the sun, day periods) — `bind-day-periods-to-sun`.
- Coordinates inside the zone rules release file or the remote update.

## Decisions

### D1. `Coordinates` is a model type with one validator (FR5, FR6, FR7)

`src/model/coordinates.ts` owns `Coordinates = { latitude: number; longitude: number }` (decimal degrees, north and east positive) and `parseCoordinates(value: unknown): Coordinates | undefined`, which accepts only two finite numbers in range. Limits live in `src/constants/coordinates.ts`: `MAX_LATITUDE_DEGREES = 90`, `MAX_LONGITUDE_DEGREES = 180`, `COORDINATE_TENTHS_PER_DEGREE = 10`. The port, the adapters and `parseStoredLocations` all call `parseCoordinates`; no second range check exists in the app.

The constants file imports nothing, so the Node scripts import it by relative path, as `scripts/zoneRules/` already imports `src/lib/zoneRules/core`.

Alternative rejected: a tuple `[latitude, longitude]` — unreadable at call sites and easy to swap.

### D2. Committed and served files hold integer tenths of a degree (FR1, NFR-P1)

Files store `Math.round(degrees * 10)` as integers (`558`, `491`); the app divides by `COORDINATE_TENTHS_PER_DEGREE` when it parses the search data. Integers of at most four digits compress better than decimals and cannot carry float noise.

- `CityTuple` becomes `[geonameId, en, ru | 0, countryCode, zoneIndex, population, latitudeTenths, longitudeTenths, regionIndex?]`; the optional region index stays last. `DATASET_FORMAT_VERSION` becomes 2.
- `ServedCityData.columns` gains `latitudeTenths` and `longitudeTenths`.

0.1° is at most 24 s of solar time in longitude and about 11 km; the follow-up change blends day-period colours over tens of minutes.

### D3. Zone coordinates come from `zone.tab`, in their own committed file (FR2, FR3)

`zone-rules:compile` also unpacks `zone.tab`, parses it (`scripts/zoneRules/parseZoneTable.ts`) and writes `zone-rules/zone-coordinates.json`: `{"release":"2026f","zones":{"Africa/Abidjan":[53,-40],…}}`, one zone per line in alphabetical order, so a release bump reads as a diff. Both files are written only after every step succeeded.

`zone.tab` coordinates are ISO 6709 strings, `±DDMM±DDDMM` or `±DDMMSS±DDDMMSS`; degrees = D + M/60 + S/3600, then rounded to tenths. A row that does not match either form stops the compile and names the line.

At build time `scripts/zoneData/loadCitySearchData.ts` joins the file to the zone cities by zone ID, so a served zone city carries `latitudeTenths` and `longitudeTenths`. The file is not served on its own and is not part of the remote update. Overrides for a zone city that `zone.tab` does not list live in `scripts/zoneRules/zoneCoordinateOverrides.ts` (empty today).

Alternatives rejected:

- Coordinates inside `release.json`: changes the release format that the remote update and the stored release envelope validate; needs a schema bump and a migration for a table that changes once in several years.
- GeoNames for zone cities: 130 of 419 are not in `cities15000`; a larger dump and name matching would be needed.
- `zone1970.tab`: lacks 107 zone cities.
- Preferring GeoNames where both exist: 3 of 289 compared zones differ by more than 0.25° (largest: `Asia/Aqtau`, 0.9°). Two sources for one table is not worth a few minutes of solar time.

### D4. Checks extend the two existing commands (FR4)

`city-data:check` (`checkCityData.ts`) validates the two new tuple fields. `zone-rules:check` gains `checkZoneCoordinates.ts`: format, release equal to `release.json`, ranges, and coverage of every zone city of `loadZoneData()` except UTC, after overrides. No new command and no new CI step.

### D5. City records get coordinates from their source (FR5)

`CityRecord.coordinates?: Coordinates`. `createGeoNamesCitySource` and `createZoneCitiesSource` fill it from the parsed search data; UTC and a zone the release knows but the file does not (a zone of a remote update) get none. Matching, ranking and texts do not read it.

### D6. A location stores coordinates; identity is untouched (FR6, FR7, FR9)

`Location.coordinates?: Coordinates`. `ADD_LOCATION` gains optional `coordinates`; the reducer passes them through `parseCoordinates` and builds the ID from zone and label as today. `LocationSearch.tsx` passes `record.coordinates` with the other fields of the chosen record.

The stored entry gains `coordinates: { latitude, longitude }`. `LOCATIONS_SCHEMA_VERSION` stays 3: `parseStoredLocations` reads the field with `parseCoordinates` and drops a malformed value instead of rejecting the document. The previous build ignores the unknown field, so a tab still running it reads the list; if it rewrites the list without coordinates, D7 gives them back.

Alternative rejected: version 4 with a migration — a migration that only adds an optional field buys nothing and makes the previous build reject the document.

### D7. One command and one hook give stored locations their coordinates (FR8, NFR-P2)

- Port: `CitySearch.getCoordinates(timeZoneId, storedLabel): Coordinates | undefined`. It resolves the record exactly as `getCityLabel` does (both call one private `findRecordOfLocation`) and falls back to the zone's zone city. It compares exact names, so it normalizes no text.
- Model: `FILL_LOCATION_COORDINATES { coordinatesByLocationId }` sets coordinates on city locations that have none and returns the same state object when nothing changed, so the controller schedules no write.
- Controller: `useLocationCoordinatesFill` (one hook, the only side-effect owner) waits for `loadCitySearchOnce`, calls `getCoordinates` once per city location without coordinates, and dispatches one command when at least one lookup returned coordinates. It reuses the load that `useCityLabels` starts; it starts none itself when every city location has coordinates.

A lookup counter in `src/test/workCounters.ts` backs the work-bound scenarios (ADR-0008).

Alternative rejected: deriving coordinates at render time from the city data instead of storing them — the follow-up colouring would then wait for a 120 KB lazy file on every start and have no data offline on a first visit.

### D8. Budget 150 KB, with a named fallback (NFR-P1)

Estimate: two columns of 6 102 integers add about 20 KB gzipped to 119.4 KB. `CITY_SEARCH_DATA_BUDGET_KB` becomes 150. If the measured file exceeds it, store each GeoNames city's coordinates as the difference from its zone's coordinates (small numbers repeat more) before considering a coarser step; M3 of the proposal must still hold. The measured size goes into `city-data/README.md`.

## Risks / Trade-offs

- [`zone.tab` places are approximate, up to 0.9° from the city] → accepted; a few minutes of solar time for the zone city only.
- [A future tzdata release drops `zone.tab`, which IANA calls a backward-compatibility table] → the compile fails loudly; switch to `zone1970.tab` plus overrides then.
- [A zone that only a remote zone rules update knows has no coordinates] → the location has none until the next deploy; consumers must treat missing coordinates as a normal case (the follow-up change does).
- [A tab on the previous build rewrites the list without coordinates] → the fill gives them back at the next load of the city data.
- [The search data grows past 150 KB] → fallback of D8.
- [The zone rules publication workflow commits only `release.json`] → `refresh-data-through-scheduled-pull-requests` commits both files; until then a manual release bump commits both.

## Migration Plan

1. Land the compilers and both regenerated committed files in one pull request, so checks never see a half-updated pair.
2. Deploy. Existing lists are read unchanged; they gain coordinates after the first load of the city data.
3. Rollback: revert the pull request. Stored lists with coordinates stay readable by the previous build, which ignores the field.

## Open Questions

None. The 150 KB budget is agreed; D8 holds the fallback.
