# Design

## Context

See `proposal.md` for the motivation. Driven by FR1–FR9 and NFR-P1–NFR-P3 of the proposal.

Current state, read from the code:

- `scripts/cityData/parseGeoNamesRows.ts` reads columns 0, 1, 7, 8, 10, 14, 17 of `cities15000.txt`; latitude and longitude are columns 4 and 5 of the same line.
- The committed city data is one tuple per city (`CityTuple`, `DATASET_FORMAT_VERSION = 1`); the served form is columns (`toServedCityData.ts`), parsed in the app by `parseCitySearchData`.
- Zone cities come from CLDR at build time (`scripts/zoneData/loadZoneData.ts`): names and a country code, no coordinates. GeoNames matches only 289 of the 419 zone cities (measured on `cities15000` of 2026-11-14).
- `compileArchive` in `scripts/zoneRules/compileWithZic.ts` unpacks the whole signed tzdata archive into `sourceDirectory` (`tar -xzf`), checks `version` and passes only the nine `TZDATA_SOURCE_FILES` to `zic`; `zone.tab` is already unpacked there, but nothing reads it today. The archive of 2026f also holds `zone.tab` with 418 rows — exactly the zone cities except UTC (measured). `zone1970.tab` lacks 107 of them and is not used.
- `CityRecord` (`src/ports/citySearch.ts`) and `Location` (`src/model/locations.ts`) have no coordinates. A location's identity is zone plus label; it stores no record ID.
- The stored list is a version 3 document (`LOCATIONS_SCHEMA_VERSION` in `src/constants/locations.ts`) migrated step by step by `LOCATION_MIGRATIONS` (`src/adapters/locationsDocument.ts`) without a write on load; `parseStoredLocations` rejects the whole document on an invalid entry and ignores unknown fields of a city entry. `localStorageLocationRepository.migration.test.ts` loads a version 4 document as unreadable today.
- `useCityLabels` already loads the city data once in the background while the list holds a city location, and `CitySearch.getCityLabel(timeZoneId, storedLabel, language)` already resolves a stored location to a city record.
- Remote zone rules updates deliver only the release file (`zone-rules/<release>.json`).

## Goals / Non-Goals

**Goals:**

- One owner of the concept "coordinates" in the model, reused by the port, the adapters and the stored document.
- Zone coordinates that need no name matching and no second download.
- A stored list that is migrated, not rewritten, on its first load by the new build.

**Non-Goals:**

- Any consumer of coordinates (the sun, day periods) — `bind-day-periods-to-sun`.
- Coordinates inside the zone rules release file or the remote update.

## Decisions

### D1. `Coordinates` is a model type with one validator (FR5, FR6, FR7)

`src/model/coordinates.ts` owns `Coordinates = { latitude: number; longitude: number }` (decimal degrees, north and east positive) and `parseCoordinates(value: unknown): Coordinates | undefined`, which accepts only two finite numbers in range. Limits live in `src/constants/coordinates.ts`: `MAX_LATITUDE_DEGREES = 90`, `MAX_LONGITUDE_DEGREES = 180`, `COORDINATE_TENTHS_PER_DEGREE = 10`. The port, the adapters and `parseStoredLocations` all call `parseCoordinates`; no second range check exists in the app.

The constants file imports nothing, so the Node scripts import it by relative path, as `scripts/zoneRules/precacheExclusion.ts` and `scripts/check-bundle-size.mjs` already import `src/constants/zoneRules.ts`.

Alternative rejected: a tuple `[latitude, longitude]` — unreadable at call sites and easy to swap.

### D2. Committed and served files hold integer tenths of a degree (FR1, NFR-P1)

Files store `Math.round(degrees * 10)` as integers (`558`, `491`); the app divides by `COORDINATE_TENTHS_PER_DEGREE` when it parses the search data. Integers of at most four digits compress better than decimals and cannot carry float noise.

- `CityTuple` becomes `[geonameId, en, ru | 0, countryCode, zoneIndex, population, latitudeTenths, longitudeTenths, regionIndex?]`; the optional region index stays last. `DATASET_FORMAT_VERSION` becomes 2.
- `ServedCityData.columns` gains `latitudeTenths` and `longitudeTenths`.

`parseCityRow` rejects a row whose latitude or longitude is empty, not a number or outside ±`MAX_LATITUDE_DEGREES` / ±`MAX_LONGITUDE_DEGREES` (constants imported by relative path, as D1 describes), throwing with the line number. `compile.ts` parses every city line before `compileCityData` and `writeFile` run, and already turns a parser throw into a non-zero exit (`compile.test.ts`: "should return non-zero naming the line for a malformed city line"), so an out-of-range row writes nothing. `checkCityData` repeats the range check on the committed file (D4).

0.1° is at most 24 s of solar time in longitude and about 11 km; the follow-up change blends day-period colours over tens of minutes.

### D3. Zone coordinates come from `zone.tab`, in their own committed file (FR2, FR3)

`compileWithZic` also reads the already unpacked `zone.tab` from `sourceDirectory` (the `tar` call is unchanged), `zone-rules:compile` parses it (`scripts/zoneRules/parseZoneTable.ts`) and writes `zone-rules/zone-coordinates.json`: `{"release":"2026f","zones":{"Africa/Abidjan":[53,-40],…}}`, one zone per line in alphabetical order, so a release bump reads as a diff. Both files are written only after every step succeeded.

`zone.tab` coordinates are ISO 6709 strings, `±DDMM±DDDMM` or `±DDMMSS±DDDMMSS`; degrees = D + M/60 + S/3600, then rounded to tenths. A row that does not match either form stops the compile and names the line.

At build time `scripts/zoneData/loadCitySearchData.ts` joins the file to the zone cities by zone ID, so a served zone city carries `latitudeTenths` and `longitudeTenths`. The file is not served on its own and is not part of the remote update. Overrides for a zone city that `zone.tab` does not list live in `scripts/zoneRules/zoneCoordinateOverrides.ts` (empty today).

Alternatives rejected:

- Coordinates inside `release.json`: changes the release format that the remote update and the stored release envelope validate; needs a schema bump and a migration for a table that changes once in several years.
- GeoNames for zone cities: 130 of 419 are not in `cities15000`; a larger dump and name matching would be needed.
- `zone1970.tab`: lacks 107 zone cities.
- Preferring GeoNames where both exist: 3 of 289 compared zones differ by more than 0.25° (largest: `Asia/Aqtau`, 0.9°). Two sources for one table is not worth a few minutes of solar time.

### D4. Pure checks, run on the committed files by the unit tests (FR4)

`checkCityData` (`scripts/cityData/checkCityData.ts`) validates the two new tuple fields; `src/test/cityData/check.test.ts` already runs `runCityDataCheck` on the committed `city-data/geonames-cities.json` inside `pnpm test`, so the city data check reaches every pull request without a new step. The new pure `checkZoneCoordinates(zoneCoordinatesText, release, zoneCities, overrides)` (`scripts/zoneRules/checkZoneCoordinates.ts`) checks the format, the release against `release.json`, the ranges, and the coverage of every zone city of `loadZoneData()` except UTC after overrides. A new `src/test/zoneRules/zoneCoordinates.committed.test.ts` runs it on the committed files inside `pnpm test`. `zone-rules:check` also calls it and prints its errors, but that command downloads the release and needs `zdump`, so it is not what guards a pull request. No new command and no new CI step.

### D5. City records get coordinates from their source (FR5)

`CityRecord.coordinates?: Coordinates`. `createGeoNamesCitySource` and `createZoneCitiesSource` fill it from the parsed search data; UTC and a zone the release knows but the file does not (a zone of a remote update) get none. Matching, ranking and texts do not read it.

### D6. A location stores coordinates; identity is untouched (FR6, FR7, FR9)

`Location.coordinates?: Coordinates`. `ADD_LOCATION` gains optional `coordinates`; the reducer passes them through `parseCoordinates` and builds the ID from zone and label as today. `LocationSearch.tsx` passes `record.coordinates` with the other fields of the chosen record.

The stored entry gains `coordinates: { latitude, longitude }`. `LOCATIONS_SCHEMA_VERSION` becomes 4, as `.claude/rules/architecture.md` requires ("a schema change requires a migration and fixture tests") and as the preferences document did for each added field (`PREFERENCES_SCHEMA_VERSION = 6`). `LOCATION_MIGRATIONS` in `src/adapters/locationsDocument.ts` gains the step 3 → 4, which returns the payload unchanged: a version 3 entry has no coordinates, which version 4 reads as "none". As for the earlier steps, the load writes nothing. `parseStoredLocations` reads the field with `parseCoordinates`: absent → no coordinates; present but rejected by `parseCoordinates` → the whole document is rejected, as for any invalid entry (ADR-0004: "a value of the wrong type stays unreadable"); a device time entry with `coordinates` is rejected like one with zone fields.

Alternative rejected: keep version 3 and drop malformed coordinates silently — the previous build would read the new documents, but it contradicts the migration rule of `.claude/rules/architecture.md` and the load normalization of ADR-0004, which clears only dangling references silently.

### D7. One command and one hook give stored locations their coordinates (FR8, NFR-P2)

- Port: `CitySearch.getCoordinates(timeZoneId, storedLabel): Coordinates | undefined`. It resolves the record exactly as `getCityLabel` does (both call one private `findRecordOfLocation`) and falls back to the zone's zone city. It compares exact names, so it normalizes no text.
- Model: `FILL_LOCATION_COORDINATES { coordinatesByLocationId }` sets coordinates on city locations that have none and returns the same state object when nothing changed, so the controller schedules no write.
- Controller: `useLocationCoordinatesFill` (one hook, the only side-effect owner) waits for `loadCitySearchOnce`, calls `getCoordinates` once per city location without coordinates, and dispatches one command when at least one lookup returned coordinates. It reuses the load that `useCityLabels` starts; it starts none itself when every city location has coordinates.

The work-bound scenarios count coordinate lookups with a counting wrapper around the `CitySearch` that the test hands to the controller through its `LoadCitySearch` (it counts calls of `getCoordinates`), and count normalizations with `startWorkCount()` of `src/test/workCounters.ts` (ADR-0008). Production code never imports from `src/test/`.

Alternative rejected: deriving coordinates at render time from the city data instead of storing them — the follow-up colouring would then wait for a 120 KB lazy file on every start and have no data offline on a first visit.

### D8. Budget 150 KB, with a named fallback (NFR-P1)

Estimate: two columns of 6 102 integers add about 20 KB gzipped to 119.4 KB. `CITY_SEARCH_DATA_BUDGET_KB` becomes 150. If the measured file exceeds it, store each GeoNames city's coordinates as the difference from its zone's coordinates (small numbers repeat more) before considering a coarser step; M3 of the proposal must still hold. The measured size goes into `city-data/README.md`.

## Risks / Trade-offs

- [`zone.tab` places are approximate, up to 0.9° from the city] → accepted; a few minutes of solar time for the zone city only.
- [A future tzdata release drops `zone.tab`, which IANA calls a backward-compatibility table] → the compile fails loudly; switch to `zone1970.tab` plus overrides then.
- [A zone that only a remote zone rules update knows has no coordinates] → the location has none until the next deploy; consumers must treat missing coordinates as a normal case (the follow-up change does).
- [A tab still on the previous build receives a version 4 list from another tab, or the previous build is restored by a rollback] → it reads the document as newer and shows the load error with Reset, which ADR-0004 prescribes for a newer version; the new-version notice of that tab offers the reload. A rollback is therefore done as a forward fix that keeps reading version 4.
- [The search data grows past 150 KB] → fallback of D8.
- [The zone rules publication workflow commits only `release.json`] → `refresh-data-through-scheduled-pull-requests` commits both files; until then a manual release bump commits both.

## Migration Plan

1. Land the compilers and both regenerated committed files in one pull request, so checks never see a half-updated pair.
2. Deploy. Existing lists are read unchanged; they gain coordinates after the first load of the city data.
3. Rollback: not by reverting alone — a build without the version 4 reader shows the load error for every list written since the deploy. Roll forward with a fix that keeps `LOCATIONS_SCHEMA_VERSION = 4` and its migration.

## Open Questions

None. The 150 KB budget is agreed; D8 holds the fallback.
