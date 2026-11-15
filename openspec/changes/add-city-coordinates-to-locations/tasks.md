# Tasks

Paths are relative to `packages/client/` unless they start with `docs/` or `.github/`. Run tests strictly one command at a time and never in the background (`CLAUDE.md`). Every new or touched production file gets a JSDoc line `Implements <ids> of add-city-coordinates-to-locations (D<n>).`, every touched test file a `// Verifies <ids> of add-city-coordinates-to-locations.` comment, and every new or changed Gherkin scenario the tags `@add-city-coordinates-to-locations @<id>`. Use the glossary terms: coordinates, zone coordinates, city record, zone city, city data, location. Keep every file under 200 lines. Tests of `scripts/cityData/` live under `src/test/cityData/`, tests of `scripts/zoneRules/` under `src/test/zoneRules/`. Scripts run under Node's type stripping: no `enum` or `namespace` in `scripts/`. Each implementation task is RED (failing test shown) then GREEN.

## 1. Glossary and architecture docs (FR1, FR2, FR5, FR6; design D1, D3)

- [ ] 1.1 `docs/glossary/locations.md`: add **Coordinates** (*Code:* `Coordinates`, `parseCoordinates`, `src/model/coordinates.ts`; *Never:* position, geolocation, lat/lng in names) and extend **Location** (a city location may carry coordinates; not part of its identity). `docs/glossary/search.md`: add **Zone coordinates** (*Code:* `zone-rules/zone-coordinates.json`, `parseZoneTable`, `checkZoneCoordinates`) and extend **City record** and **City data**. Verify: `grep -n "Coordinates" docs/glossary/locations.md docs/glossary/search.md` shows the entries; each file stays under 200 lines.
- [ ] 1.2 `docs/architecture/domain-model.md`: add coordinates to the city record description under "Out of the model" and to the `Location` description. Verify: `grep -n "coordinates" docs/architecture/domain-model.md`.

## 2. Coordinates in the model (FR5, FR6, FR7; design D1)

- [ ] 2.1 `src/constants/coordinates.ts` (`MAX_LATITUDE_DEGREES`, `MAX_LONGITUDE_DEGREES`, `COORDINATE_TENTHS_PER_DEGREE`; no imports) exported from `src/constants/index.ts`. Verify: `pnpm run build`.
- [ ] 2.2 `src/model/coordinates.ts` with `src/model/coordinates.test.ts`: `Coordinates` and `parseCoordinates` (accepts two finite numbers in range; rejects a missing field, text, `NaN`, 91, −181; `it.each`). Export from `src/model/index.ts`. Verify: `npx vitest run src/model/coordinates.test.ts`.

## 3. City data compiler (FR1, FR4; design D2, D4)

- [ ] 3.1 `scripts/cityData/parseGeoNamesRows.ts`: read columns 4 and 5 into `GeoNamesCityRow.latitude`, `.longitude`; an empty or non-numeric value throws with the line number. Verify: `npx vitest run src/test/cityData/parseGeoNamesRows.test.ts`.
- [ ] 3.2 `scripts/cityData/cityDataTypes.ts`, `compileCityData.ts`, `serializeCityDataset.ts`: tuple fields `latitudeTenths`, `longitudeTenths` before the optional region index; `DATASET_FORMAT_VERSION = 2`; rounding uses `COORDINATE_TENTHS_PER_DEGREE`. Cases: Kazan 55.78874, 49.12214 → 558, 491; Quito −0.22985, −78.52495 → −2, −785. Verify: `npx vitest run src/test/cityData/compileCityData.test.ts`, then `npx vitest run src/test/cityData/serializeCityDataset.test.ts`.
- [ ] 3.3 `scripts/cityData/toServedCityData.ts`: columns `latitudeTenths`, `longitudeTenths`. Verify: `npx vitest run src/test/cityData/toServedCityData.test.ts`.
- [ ] 3.4 `scripts/cityData/checkCityData.ts`: fail, naming the city, on missing coordinates, latitude outside ±900 tenths, longitude outside ±1800 tenths, and on format version 1. Verify: `npx vitest run src/test/cityData/checkCityData.test.ts`, then `npx vitest run src/test/cityData/checkCityData.format.test.ts`.
- [ ] 3.5 Regenerate the committed file: `pnpm --filter @time-zones/client city-data:compile`, then `pnpm --filter @time-zones/client city-data:check` passes. Add a test of the committed file for the five sample cities of the `city-data` delta spec (M3). Update `city-data/README.md`: contents, dump date, sizes.

## 4. Zone coordinates (FR2, FR3, FR4; design D3, D4)

- [ ] 4.1 `scripts/zoneRules/parseZoneTable.ts` with `src/test/zoneRules/parseZoneTable.test.ts`: skips `#` lines; parses `+554521+0373704` → 558, 376 and `+2232+08822` → 225, 884; southern and western signs; a malformed row throws with its line number.
- [ ] 4.2 `scripts/zoneRules/compileWithZic.ts`: unpack `zone.tab` with the source files and return its text; `scripts/zoneRules/writeZoneCoordinates.ts` with a test: one zone per line, alphabetical, the release name first, overrides from `zoneCoordinateOverrides.ts` applied. Verify: `npx vitest run src/test/zoneRules/writeZoneCoordinates.test.ts`.
- [ ] 4.3 `scripts/zoneRules/compile.ts`: write `zone-rules/zone-coordinates.json` together with `release.json`, neither on failure (path constant in `app.config.ts`). Verify: `npx vitest run src/test/zoneRules/compile.valid.test.ts`, then `npx vitest run src/test/zoneRules/compile.stops.test.ts`.
- [ ] 4.4 `scripts/zoneRules/checkZoneCoordinates.ts`, called from `check.ts`, with tests for every defect row of the "Coordinates are checked" scenario and the UTC case. Verify: `npx vitest run src/test/zoneRules/check.test.ts`.
- [ ] 4.5 Regenerate: `pnpm --filter @time-zones/client zone-rules:compile 2026f` (needs `zic` and the network; `release.json` must come out byte-identical: `git diff --stat packages/client/zone-rules/release.json` prints nothing), then `pnpm --filter @time-zones/client zone-rules:check` passes. Update `zone-rules/README.md` with the new file.

## 5. Search data and budget (FR3, FR5, NFR-P1; design D2, D3, D8)

- [ ] 5.1 `scripts/zoneData/loadCitySearchData.ts`: join the zone coordinates to the zone cities by zone ID; UTC gets none. `src/adapters/city-search/fetchCitySearch.ts` (`parseCitySearchData`): decode tenths to `Coordinates` through `parseCoordinates`. Verify with the existing parser tests extended, one file per run.
- [ ] 5.2 Raise `CITY_SEARCH_DATA_BUDGET_KB` to 150 in `app.config.ts`. Verify: `pnpm run build`, then `node scripts/check-bundle-size.mjs`; record the measured size in `city-data/README.md`. If it exceeds 150 KB, apply the fallback of design D8 before continuing.

## 6. City records and the port (FR5, NFR-P2; design D5, D7)

- [ ] 6.1 `src/ports/citySearch.ts`: `CityRecord.coordinates?` and `CitySearch.getCoordinates`. `createGeoNamesCitySource`, `createZoneCitiesSource`: fill coordinates. Verify: the source contract tests, one file per run.
- [ ] 6.2 `createCompositeCitySearch.ts`: `getCoordinates` shares `findRecordOfLocation` with `getCityLabel`; falls back to the zone city; counts lookups through `src/test/workCounters.ts`. Tests: Kazan, Moscow, "Old Town" in `Europe/Moscow`, UTC. Verify: `npx vitest run src/adapters/city-search/createCompositeCitySearch.test.ts`.

## 7. Locations in the model and the stored list (FR6, FR7, FR9; design D6, D7)

- [ ] 7.1 `src/model/locations.ts`, `locationCommands.ts`: `Location.coordinates?`; `ADD_LOCATION` takes optional coordinates; a namesake of the same zone stays `DUPLICATE_LOCATION`; the device time location never gets any. Verify: the reducer tests, one file per run.
- [ ] 7.2 `FILL_LOCATION_COORDINATES`: fills only city locations without coordinates; same state object when nothing changed. Verify: a new `src/model/locations.coordinates.test.ts`.
- [ ] 7.3 `src/model/parseStoredLocations.ts` and `src/adapters/locationsDocument.ts`: read and write `coordinates`; malformed values are dropped, the document stays readable; the device time entry never holds coordinates; schema version stays 3. Verify: the parser tests and the location repository contract tests, one file per run.

## 8. Controller (FR6, FR8, NFR-P2, NFR-P3; design D6, D7)

- [ ] 8.1 `src/views/shared/LocationSearch.tsx` and `createLocationsActions.ts`: pass the chosen record's coordinates to `addLocation`. Verify: `npx vitest run src/views/shared/LocationSearch.test.tsx`.
- [ ] 8.2 `src/controller/useLocationCoordinatesFill.ts` with a test: one lookup per city location without coordinates, one dispatch, no dispatch and no write when nothing is missing, silence on a failed load, no lookup on a minute tick. Mount it where `useCityLabels` is mounted. Verify: `npx vitest run src/controller/useLocationCoordinatesFill.test.tsx`.

## 9. Unit BDD (FR5–FR9, NFR-P2, UX1, UX2)

- [ ] 9.1 `src/test/features/location_search/location_search_coordinates_unit.feature` with steps: the scenarios of "City records carry coordinates". Verify: `npx vitest run src/test/features/location_search/steps/location_search_coordinates_unit.steps.ts`.
- [ ] 9.2 `src/test/features/locations/locations_coordinates_unit.feature` and `locations_coordinates_storage_unit.feature` with steps: the scenarios of the four `locations` requirements, including the work bounds. Verify: one steps file per run.
- [ ] 9.3 Update the bundle budget scenario of `location_search_performance.feature` to 150 KB and add "Coordinates of stored locations do no search work". Verify: its steps file.

## 10. Integration checks (all ids)

- [ ] 10.1 `pnpm run build` passes; `get_file_problems` is clean for the changed files.
- [ ] 10.2 The existing E2E, axe-core and screenshot suites of the search, the Cards view and the Grid view pass with no re-approved screenshot (NFR-A1, NFR-R1, M5): run each affected e2e feature group on its own.
- [ ] 10.3 Mutation testing, at most five files per run, each run finished before the next: `scripts/cityData/parseGeoNamesRows.ts`, `compileCityData.ts`, `checkCityData.ts`; `scripts/zoneRules/parseZoneTable.ts`, `writeZoneCoordinates.ts`, `checkZoneCoordinates.ts`; `src/model/coordinates.ts`, `locations.ts`, `parseStoredLocations.ts`; `src/controller/useLocationCoordinatesFill.ts`, `src/adapters/city-search/createCompositeCitySearch.ts`. Target ≥ 95%, minimum 90% (M6).
- [ ] 10.4 Traceability: `grep -rn "add-city-coordinates-to-locations" packages/client/src packages/client/scripts | wc -l` shows every FR, NFR-P and UX id of the proposal at least once.

## 11. Handoff patch (FR5)

- [ ] 11.1 When the implementing stage may not write `docs/adr/`, deliver as a handoff patch (the convention of `add-geonames-city-source`, group 10); otherwise edit directly: a status note in `docs/adr/0006-city-data-sources.md` — "The record format gains optional `coordinates` (add-city-coordinates-to-locations)". Verify: `git apply --check` on the patch, or `grep -n "coordinates" docs/adr/0006-city-data-sources.md`.

## Human follow-up

- H1 (FR5): apply the ADR-0006 status note when it was delivered as a patch.
  Why manual: the factory may not write `docs/adr/`.
- H2 (FR2): until `refresh-data-through-scheduled-pull-requests` lands, a zone rules release bump must commit `zone-rules/zone-coordinates.json` together with `release.json`.
