# Review: add-city-coordinates-to-locations

## Summary

| Item | Value |
|---|---|
| Tasks verified | 37/38 |
| Requirements traced | 78/80 |
| CRITICAL | 1 |
| WARNING | 1 |
| SUGGESTION | 0 |

## Tasks

Paths are relative to `packages/client/` unless they start with `docs/` or `temporary-docs/`.

- ✅ 1.1 — `docs/glossary/locations.md:7` (**Coordinates**, *Code:* `Coordinates`, `parseCoordinates`, *Never:* position, geolocation, lat/lng), `:11` (schema version 4); `docs/glossary/search.md:17` (**Zone coordinates**); `docs/glossary/zone-rules.md:20` (**Zone table**, `ZONE_TABLE_FILE`, `parseZoneTable`); the three files are 21, 20 and 20 lines.
- ✅ 1.2 — `docs/architecture/domain-model.md:22` (`Coordinates? coordinates` on `Location`) and `:138` (city record "coordinates when known").
- ✅ 2.1 — `src/constants/coordinates.ts:6-9` (three constants, no imports), re-exported in `src/constants/index.ts`.
- ✅ 2.2 — `src/model/coordinates.ts:7-20` (`Coordinates`, `parseCoordinates`), exported from `src/model/index.ts`; `src/model/coordinates.test.ts` (`it.each` over limits and rejects); Stryker 100%.
- ✅ 3.1 — `scripts/cityData/parseGeoNamesRows.ts:67-84,107-118` (columns 4/5, empty/non-numeric/out of range throws with the line); `src/test/cityData/parseGeoNamesRows.test.ts`; `src/test/cityData/compile.test.ts:59` (latitude 91 → non-zero, nothing written).
- ✅ 3.2 — `scripts/cityData/toCityTuple.ts:16-38` (tenths via `COORDINATE_TENTHS_PER_DEGREE`, before the region index), `cityDataTypes.ts` (9-field tuple), `constants.ts:10` (`DATASET_FORMAT_VERSION = 2`); Kazan 558/491 in `src/test/cityData/compile.test.ts:15` and `compileCityData.test.ts`.
- ✅ 3.3 — `scripts/cityData/toServedCityData.ts:43-45` (`latitudeTenths`, `longitudeTenths`, region index moved to column 8); `src/test/cityData/toServedCityData.test.ts`.
- ✅ 3.4 — `scripts/cityData/checkCityData.ts:39-40,108` and `checkCityCoordinates.ts:20-40` (no coordinates, ±900/±1800 tenths, format version); `src/test/cityData/checkCityData.coordinates.test.ts:68`, `checkCityData.format.test.ts`.
- ✅ 3.5 — `city-data/geonames-cities.json` regenerated (format version 2, 6 102 cities); `city-data/README.md` updated (dump 2026-11-15, 141.5 KB served); `src/test/cityData/check.test.ts` runs the check on it.
- ✅ 3.6 — `src/test/features/city_data/city_data_coordinates.feature` + `city_data_coordinates_check.feature` with steps `steps/city_data_coordinates.steps.ts`, `steps/city_data_coordinates_check.steps.ts` (compile cases, Kazan/Quito/Murmansk outline, missing and out-of-range rows, broken file rows, committed file passes).
- ✅ 4.1 — `scripts/zoneRules/parseZoneTable.ts:13-71` (ISO 6709 both forms, `#` lines skipped, malformed row throws with line); `src/test/zoneRules/parseZoneTable.test.ts`; Stryker 96.92%.
- ✅ 4.2 — `scripts/zoneRules/compileWithZic.ts:28,131-157` (`ZONE_TABLE_FILE`, `CompiledZones.zoneTable`, `tar` call unchanged); `src/test/zoneRules/compileFakes.ts:43,87` (fake `zone.tab`); `scripts/zoneRules/writeZoneCoordinates.ts`, `zoneCoordinateOverrides.ts` (empty); `src/test/zoneRules/writeZoneCoordinates.test.ts` (override case).
- ✅ 4.3 — `scripts/zoneRules/compile.ts:63-71` (both files written after every step), `app.config.ts:81` (`ZONE_COORDINATES_FILE`); `src/test/zoneRules/compile.valid.test.ts:9`, `compile.stops.test.ts:105,112` (no `zone.tab`, malformed row → neither file).
- ✅ 4.4 — `scripts/zoneRules/checkZoneCoordinates.ts:66-87` (format, release, ranges, coverage, UTC exempt, no overrides); `scripts/zoneRules/check.ts:117-125`; `src/test/zoneRules/checkZoneCoordinates.test.ts`, `src/test/zoneRules/check.test.ts:20-33`.
- ✅ 4.5 — `zone-rules/zone-coordinates.json` (release `2026f`, 418 zones); `release.json` not in the diff; `zone-rules/README.md` updated.
- ✅ 4.6 — `src/test/zoneRules/zoneCoordinates.committed.test.ts:16` (check passes on committed files), `:26` (`it.each` of the seven M3 zone cities), `:38` (no UTC).
- ✅ 4.7 — `src/test/features/zone_rules/zone_rules_coordinates.feature` + `zone_rules_coordinates_check.feature` with steps (Moscow, Kolkata, the seven samples, failed compile, no network at build time, broken file rows, UTC).
- ✅ 5.1 — `scripts/zoneData/loadCitySearchData.ts:30-45` (join by zone ID, UTC none); `src/test/zoneData/loadCitySearchData.test.ts:11,18,25`.
- ✅ 5.2 — `src/adapters/city-search/parseGeoNamesCityData.ts` (`parseTenthsCoordinates` → `parseCoordinates`), `fetchCitySearch.ts` (`parseCitySearchData` maps zone city tenths); `fetchCitySearch.parse.test.ts`, `fetchCitySearch.parse.more.test.ts`.
- ✅ 5.3 — `app.config.ts:67` (`CITY_SEARCH_DATA_BUDGET_KB = 150`); measured in this review: `pnpm run build` ok, `check:bundle-size` reports search data 141.5 KB, initial JS 148.9 KB, matching `city-data/README.md`.
- ✅ 6.1 — `src/ports/citySearch.ts` (`CityRecord.coordinates?`, `getCoordinates`); `geoNamesCitySource.ts:43`, `zoneCitiesSource.ts:54`; tests in `geoNamesCitySource.test.ts`, `zoneCitiesSource.test.ts`, `abbreviationSource.test.ts`.
- ✅ 6.2 — `src/adapters/city-search/createCompositeCitySearch.ts:137-144,162-169` (`findRecordOfLocation` shared with `getCityLabel`, zone city fallback); `createCompositeCitySearch.coordinates.test.ts:39,65` (Kazan, Moscow, "Old Town", UTC; 0 normalizations).
- ✅ 6.3 — `src/test/features/location_search/location_search_coordinates.feature` with `steps/location_search_coordinates.steps.ts` (GeoNames, zone, abbreviation, suggestion, UTC, 13 queries unchanged).
- ✅ 7.1 — `src/model/locations.ts` (`Location.coordinates?`), `locationCommands.ts` (`ADD_LOCATION.coordinates?`), `src/model/reduceAddLocation.ts:32-43` (identity from zone and label, coordinates through `parseCoordinates`); `src/model/locations.coordinates.test.ts`, `locations.lists.test.ts`.
- ✅ 7.2 — `src/model/reduceLocationCoordinates.ts:18-33` (city locations without coordinates only, same state when unchanged), wired at `src/model/locations.ts:153`; `src/model/locations.coordinates.test.ts`.
- ✅ 7.3 — `src/constants/locations.ts:2` (version 4), `src/adapters/locationsDocument.ts:35,57` (step 3 → 4, writer stores coordinates of city entries only), `src/model/parseStoredLocations.ts:50-55,73-76`; `localStorageLocationRepository.migration.test.ts:75` (version 5 unreadable), `migration.coordinates.test.ts:38`, `locationRepository.contract.ts:33` (round-trip).
- ✅ 7.4 — `src/test/features/locations/locations_coordinates_storage.feature` + `locations_coordinates_storage_more.feature` with steps (reload offline, version 3, version 5, malformed outline, device time entry, two tabs).
- ✅ 8.1 — `src/views/shared/LocationSearch.tsx:44`, `src/presenter/presentSearchResults.ts` (`coordinates` of the record), `src/controller/locationsContext.ts` (`AddLocationInput.coordinates?`); `LocationSearch.test.tsx`.
- ✅ 8.2 — `src/controller/useLocationCoordinatesFill.ts:19-47`, exported in `src/controller/index.ts`, called at `src/controller/useLocations.ts:70`; `useLocationCoordinatesFill.test.tsx` (one test is weak, see R2).
- ✅ 8.3 — `src/test/features/locations/locations_coordinates.feature` + `locations_coordinates_rows.feature` with `steps/locations_coordinates.steps.tsx:57-100` (search, `IST`, UTC through `searchAndChoose`) and `steps/locations_coordinates_rows.steps.tsx` (device time, namesake duplicate, rows outline).
- ✅ 8.4 — `src/test/features/locations/locations_coordinates_fill.feature` + `locations_coordinates_fill_more.feature` with steps (write counts through the in-memory repository); the existing no-write scenarios (`locations_city_label_language_unit`, `home_location_storage_unit`, `locations_migration_unit`) pass unchanged in CI, so no fixture needed coordinates.
- ✅ 8.5 — `src/test/features/locations/locations_coordinates_budget.feature` with `steps/locations_coordinates_budget.steps.ts:54-132` (lookup counter wrapper, `startWorkCount()`, formatters/collators/transition lookups equal).
- ✅ 8.6 — `src/test/features/location_search/location_search_performance.feature:24` ("Coordinates of stored locations do no search work") with its step in `steps/location_search_performance.steps.ts`.
- ✅ 9.1 — `pnpm run build` passes and `check:bundle-size` passes (148.9 KB / 141.5 KB), run in this review.
- ✅ 9.2 — no file under `src/test/features/__screenshots__` in the branch diff; CI (E2E, axe-core, screenshots) is green.
- ❌ 9.3 — only partly verified. Measured in this review (see Mutation): 15 of the 24 files the task lists, plus `checkCityCoordinates.ts`. `reduceLocationCoordinates.ts` was also run but has no final score. Every measured score is ≥ 90%. Not measured, because each run hit the 10-minute limit: `src/model/locations.ts`, `src/adapters/locationsDocument.ts`, `src/adapters/city-search/createCompositeCitySearch.ts`, `fetchCitySearch.ts`, `parseGeoNamesCityData.ts`, `geoNamesCitySource.ts`, `zoneCitiesSource.ts`, `src/controller/createLocationsActions.ts`, `src/controller/useLocations.ts`. The task also says "kill survivors, re-run … Target ≥ 95%", but four measured files are still below the 95% target, and their survivors were not killed: `checkCityCoordinates.ts` 90.32%, `compile.ts` 90.48%, `loadCitySearchData.ts` 91.67% and `checkZoneCoordinates.ts` 93.67%. The task is ticked but not done (R1).
- ✅ 9.4 — `grep -rn "add-city-coordinates-to-locations" src scripts | grep -oE …` lists FR1–FR9, NFR-P1–NFR-P3, UX1, UX2.
- ✅ 10.1 — `temporary-docs/gnomish/github-oinsio-time-zones-135/handoff/H1-adr-coordinates-notes.patch` passes `git apply --check`; `handoff/README.md` holds the H1 section; `docs/adr` untouched.

## Requirements

- ✅ FR1 — `scripts/cityData/parseGeoNamesRows.ts:67-118`, `toCityTuple.ts:16-38`; `city_data_coordinates.feature`, `parseGeoNamesRows.test.ts`, `compile.test.ts:59`.
- ✅ FR2 — `scripts/zoneRules/parseZoneTable.ts`, `writeZoneCoordinates.ts`, `compile.ts:63-71`; `zone_rules_coordinates.feature`, `compile.valid.test.ts:9`, `compile.stops.test.ts:105,112`.
- ✅ FR3 — `zoneCoordinateOverrides.ts`, `writeZoneCoordinates.ts:22-24`, `checkZoneCoordinates.ts:80-85`; `writeZoneCoordinates.test.ts` (override), `checkZoneCoordinates.test.ts`.
- ✅ FR4 — `scripts/cityData/checkCityCoordinates.ts`, `scripts/zoneRules/checkZoneCoordinates.ts`; on the committed files in `src/test/cityData/check.test.ts` and `src/test/zoneRules/zoneCoordinates.committed.test.ts:16`.
- ✅ FR5 — `geoNamesCitySource.ts:43`, `zoneCitiesSource.ts:54`, `loadCitySearchData.ts:30-45`; `location_search_coordinates.feature`.
- ✅ FR6 — `LocationSearch.tsx:44`, `reduceAddLocation.ts:32-43`; `locations_coordinates.feature`, `locations_coordinates_rows.feature` (namesake duplicate).
- ✅ FR7 — `locationsDocument.ts:35,57`, `parseStoredLocations.ts:73-76`; `locations_coordinates_storage*.feature`, `migration.coordinates.test.ts`, `locationRepository.contract.ts:33`.
- ✅ FR8 — `useLocationCoordinatesFill.ts`, `createLocationsActions.ts` (`fillLocationCoordinates`, one immediate write only on change), `createCompositeCitySearch.ts:165-169`; `locations_coordinates_fill*.feature`.
- ✅ FR9 — `parseStoredLocations.ts:50-55` (device entry with coordinates rejected), `reduceLocationCoordinates.ts:23-27` (city locations only); `locations_coordinates_rows.feature` (device time), `locations_coordinates_storage*.feature`.
- ✅ NFR-P1 — `app.config.ts:67`; `check:bundle-size` measured 141.5 KB search data, 148.9 KB initial JS.
- ⚠️ NFR-P2 — counted lookups and 0 normalizations are tested (`locations_coordinates_budget.feature`, `location_search_performance.feature:24`), but the "once per load" guard of `useLocationCoordinatesFill.ts:37` is not caught by any test (R2).
- ✅ NFR-P3 — `steps/locations_coordinates_budget.steps.ts:129-132` (formatters, collators, transition lookups equal with and without coordinates).
- ✅ NFR-A1 — no element, role or text changed; existing axe-core E2E scenarios green in CI.
- ✅ NFR-R1 — no layout change; no screenshot file changed in the diff.
- ✅ UX1 — "Results are unchanged" (`location_search_coordinates.feature`) and "Rows are unchanged" (`locations_coordinates_rows.feature`).
- ✅ UX2 — `locations_coordinates_fill_more.feature` ("Order and home are kept", failed load shows no error).
- ✅ M1 — `src/test/cityData/check.test.ts` and "The committed city data passes" (`city_data_coordinates_check.feature`) on 6 102 cities.
- ✅ M2 — `zoneCoordinates.committed.test.ts:16` (every zone city but UTC covered, 418 zones).
- ✅ M3 — three GeoNames samples in `city_data_coordinates.feature` outline, seven zone samples in `zoneCoordinates.committed.test.ts:26` and `zone_rules_coordinates.feature`.
- ✅ M4 — measured in this review: 141.5 KB and 148.9 KB, both ≤ 150 KB.
- ✅ M5 — 0 screenshot files changed; axe-core scenarios green in CI.
- ⚠️ M6 — only partly verified. Every file measured here is ≥ 90% (the minimum acceptable). Four are below the 95% target: `checkCityCoordinates.ts` 90.32%, `compile.ts` 90.48%, `loadCitySearchData.ts` 91.67% and `checkZoneCoordinates.ts` 93.67%. These changed production files have no score: `src/model/locations.ts`, `reduceAddLocation.ts`, `reduceLocationCoordinates.ts`, `locationsDocument.ts`, `createCompositeCitySearch.ts`, `fetchCitySearch.ts`, `parseGeoNamesCityData.ts`, `geoNamesCitySource.ts`, `zoneCitiesSource.ts`, `createLocationsActions.ts` and `useLocations.ts`. See Mutation and R1, which covers all four files below target and the unmeasured ones.
- ✅ Scenario: A city carries its coordinates — `city_data_coordinates.feature:5`.
- ✅ Scenario: Southern and western coordinates are negative — `city_data_coordinates.feature:10`.
- ✅ Scenario: Sample cities of the committed city data — `city_data_coordinates.feature:15` (outline).
- ✅ Scenario: A row without coordinates stops the compile — `city_data_coordinates.feature:26`.
- ✅ Scenario: A row out of range stops the compile — `city_data_coordinates_check.feature:5` (outline).
- ✅ Scenario: A zone carries the coordinates of its principal place — `zone_rules_coordinates.feature:5`.
- ✅ Scenario: Coordinates written in degrees and minutes — `zone_rules_coordinates.feature:12`.
- ✅ Scenario: Sample zone cities of the committed zone coordinates — `zone_rules_coordinates.feature:18` (outline).
- ✅ Scenario: A failed compile writes nothing — `zone_rules_coordinates.feature:33`.
- ✅ Scenario: No network at build time — `zone_rules_coordinates.feature:39`.
- ✅ Scenario: The committed files pass — `city_data_coordinates_check.feature:17`, `zone_rules_coordinates_check.feature:5`.
- ✅ Scenario: A broken file fails — `city_data_coordinates_check.feature:22`, `zone_rules_coordinates_check.feature:10` (outlines).
- ✅ Scenario: UTC needs no coordinates — `zone_rules_coordinates_check.feature:22`.
- ✅ Scenario: Home survives a reload — `home_location/home_location_storage_unit.feature:6` (unchanged).
- ✅ Scenario: A list from the previous version — `home_location/home_location_storage_unit.feature:14` (unchanged, "nothing is written").
- ✅ Scenario: A GeoNames city result — `location_search_coordinates.feature:5`.
- ✅ Scenario: A zone city result — `location_search_coordinates.feature:10`.
- ✅ Scenario: An abbreviation result — `location_search_coordinates.feature:15`.
- ✅ Scenario: UTC has no coordinates — `location_search_coordinates.feature:25`.
- ✅ Scenario: Results are unchanged — `location_search_coordinates.feature:30`.
- ✅ Scenario: Query timing — `location_search_performance.feature:5` (unchanged).
- ✅ Scenario: Preparing the data for search — `location_search_performance.feature:13` (unchanged).
- ✅ Scenario: Loading without a query does no search work — `location_search_performance.feature:18` (unchanged).
- ✅ Scenario: Data loads only when the search opens — `locations/locations_ui_e2e.feature:34` (unchanged).
- ✅ Scenario: The Here entry's request is the only one — `locations/locations_ui_e2e.feature:43` ("The device time location's request is the only one", unchanged).
- ✅ Scenario: Bundle budget — no step definitions by design (task 8.6); `check:bundle-size` passes at 141.5 / 148.9 KB.
- ✅ Scenario: Abbreviation query within the work bound — `location_search_performance.feature:30` (unchanged).
- ✅ Scenario: Coordinates of stored locations do no search work — `location_search_performance.feature:24`.
- ✅ Scenario: A city added from the search — `locations_coordinates.feature:5`.
- ✅ Scenario: A city added by its zone abbreviation — `locations_coordinates.feature:10`.
- ✅ Scenario: UTC — `locations_coordinates.feature:15`.
- ✅ Scenario: The device time location — `locations_coordinates_rows.feature:5`.
- ✅ Scenario: A namesake of the same zone is still a duplicate — `locations_coordinates_rows.feature:11`.
- ✅ Scenario: Rows are unchanged — `locations_coordinates_rows.feature:18` (outline over both views).
- ✅ Scenario: Coordinates survive a reload — `locations_coordinates_storage.feature:5`.
- ✅ Scenario: A list stored before coordinates — `locations_coordinates_storage.feature:11`.
- ✅ Scenario: A document newer than the app — `locations_coordinates_storage.feature:19`.
- ✅ Scenario: Malformed coordinates make the list unreadable — `locations_coordinates_storage_more.feature:5` (outline, four rows).
- ✅ Scenario: The device time location is stored without coordinates — `locations_coordinates_storage_more.feature:19`.
- ✅ Scenario: A stored device time location with coordinates — `locations_coordinates_storage_more.feature:25`.
- ✅ Scenario: Another tab receives the coordinates — `locations_coordinates_storage_more.feature:31`.
- ✅ Scenario: An older list gains coordinates — `locations_coordinates_fill.feature:5`.
- ✅ Scenario: A label no record bears — `locations_coordinates_fill.feature:13`.
- ✅ Scenario: UTC stays without coordinates — `locations_coordinates_fill.feature:19`.
- ✅ Scenario: Nothing to give — `locations_coordinates_fill.feature:26`.
- ✅ Scenario: Order and home are kept — `locations_coordinates_fill_more.feature:5`.
- ✅ Scenario: The city data fails to load — `locations_coordinates_fill_more.feature:12`.
- ✅ Scenario: One lookup per location that lacks coordinates — `locations_coordinates_budget.feature:5`.
- ✅ Scenario: No lookup when nothing is missing — `locations_coordinates_budget.feature:12`.
- ✅ Scenario: A minute tick looks up nothing — `locations_coordinates_budget.feature:18` (as specified, with Kazan; see R2 for the uncovered guard).
- ✅ Scenario: Presenting the list does the same work — `locations_coordinates_budget.feature:24`.
- ✅ Scenario: List survives a reload — `locations/locations_persistence.feature:6` (unchanged).
- ✅ Scenario: First launch writes nothing — `locations/locations_persistence.feature:12` (unchanged).
- ✅ Scenario: Legacy identifier is canonicalized on load — `locations/locations_persistence.feature:17` (unchanged).
- ✅ Scenario: Offline reopen — `locations/locations_sync_offline_e2e.feature:20` (unchanged).
- ✅ Scenario: Previous document version is migrated — `locations/locations_migration_unit.feature:6` (unchanged).
- ✅ Scenario: Version 2 document is migrated — `locations/locations_device_time_storage_unit.feature:23` (unchanged); version 3 by `locations_coordinates_storage.feature:11`.
- ✅ Scenario: The device time zone is not stored — `locations/locations_device_time_storage_unit.feature:31` (unchanged).

## Mutation

Run in this review, one at a time: `cd packages/client && npx stryker run --mutate '<files>'`, with `--concurrency 4` on the later runs. Each run ends at the 10-minute foreground limit. The initial test run alone takes about 2.5 minutes, so runs over model, adapter or controller files hit that limit and write no report.

| File | Score | Notes |
|---|---|---|
| `src/model/coordinates.ts` | 100.00% | 21 killed, 2 timeout |
| `src/controller/useLocationCoordinatesFill.ts` | 95.45% | 1 survivor reported at line 36 (the filter is at line 37): the `.filter(({ id }) => !lookedUpIds.has(id))` can be removed with no test failing (R2) |
| `src/model/parseStoredLocations.ts` | 99.15% | 1 survivor at line 109 (home id guard, older code) |
| `scripts/zoneRules/parseZoneTable.ts` | 96.92% | 1 survivor (`zoneId === undefined` half of the guard), 1 no-coverage |
| `scripts/zoneRules/checkZoneCoordinates.ts` | 93.67% | 5 survivors in the `parseDocument` guards (catch body, `document === null`, `zones === null`). The minimum is met; the 95% target is not (R1) |
| `scripts/zoneRules/writeZoneCoordinates.ts` | 100.00% | |
| `scripts/cityData/parseGeoNamesRows.ts` | 96.67% | 1 survivor (`text.trim()` → `text`), 1 no-coverage |
| `scripts/cityData/toCityTuple.ts` | 100.00% | |
| `scripts/cityData/checkCityCoordinates.ts` | 90.32% | 3 survivors on `latitude === undefined \|\| longitude === undefined`. Only a tuple missing *both* fields is tested; with one field missing, the mutants still report the city, under the latitude/longitude message. The minimum is met; the 95% target is not (R1) |
| `scripts/cityData/checkCityData.ts` | 98.31% | 3 survivors (lines 52, 75, 151) |
| `scripts/cityData/compileCityData.ts` | 97.87% | 2 survivors (array literals at lines 101, 114) |
| `scripts/cityData/serializeCityDataset.ts` | 100.00% | |
| `scripts/cityData/toServedCityData.ts` | 100.00% | |
| `scripts/zoneData/loadCitySearchData.ts` | 91.67% | Re-measured this round (11 killed, 1 survived). The survivor is the cache guard `cachedCitySearchData === undefined` → `true` at line 50:7. It is **not** equivalent: the mutant re-reads both JSON files and builds a new object on every call. That breaks the "read once" contract in the file's doc comment (`:3`). No test calls the loader twice, so nothing catches it (R1) |
| `scripts/zoneRules/check.ts` | 96.08% | 1 survivor (line 153), 1 no-coverage (line 128) |
| `scripts/zoneRules/compile.ts` | 90.48% | Re-measured this round (19 killed, 2 survived, both equivalent). Line 44:7: `release === undefined` → `false`. `parseReleaseName(undefined)` runs `/^\d{4}[a-z]+$/.test(undefined)`, which tests the text "undefined" and returns `undefined`, so the usage path is taken anyway. Line 82:55: `force: true` → `false` in `rm(workDirectory, …)`. `force` only matters when the path is missing, and `mkdtemp` at line 48 always creates the directory, which no step removes. Neither can be killed by a test; each needs an equivalence annotation (R1) |
| `scripts/zoneRules/compileWithZic.ts` | 97.37% | 2 survivors (line 106, the options object of a process call) |

Not measured (no score is claimed for these):
- `src/model/reduceLocationCoordinates.ts`: a first run was stopped at the time limit with 19 of 20 mutants tested (14 killed, 5 timeout, 0 survived), so it has no final score.
- `src/adapters/city-search/parseGeoNamesCityData.ts` and `fetchCitySearch.ts`: the run was stopped at 80 of 236 mutants (2 survived, 8 timeout), so they have no score.
- `src/model/locations.ts`, `src/adapters/locationsDocument.ts`, `src/model/reduceLocationCoordinates.ts` and `src/model/reduceAddLocation.ts` were run together; the run was stopped at the 10-minute limit with no report written.
- `src/adapters/city-search/geoNamesCitySource.ts` and `zoneCitiesSource.ts` were run together; the run was stopped at the 10-minute limit with no report written.
- `src/adapters/city-search/createCompositeCitySearch.ts`, `src/controller/createLocationsActions.ts` and `src/controller/useLocations.ts` were not run. The runs over adapter and model files above did not finish within the limit, so these were not tried.

## Findings

### R1 — CRITICAL — Task 9.3 is ticked but not done: survivors left below the 95% target, nine files unmeasured
- Location: `packages/client/scripts/cityData/checkCityCoordinates.ts:26`
- Rule: task 9.3 of add-city-coordinates-to-locations (`tasks.md:66`: "kill survivors, re-run … Stryker mutates whole files, so survivors left by earlier changes in these files count too and need tests as well. Target ≥ 95%, minimum 90% (M6)"); `.claude/rules/tdd-workflow.md` ("Analyze survived mutants — each survivor indicates a missed scenario or a weak assertion")
- Problem: task 9.3 is ticked (`- [x] 9.3`), but four files it lists are below its 95% target. Their survivors were never killed or justified:
  (1) `scripts/cityData/checkCityCoordinates.ts:26` (`if (latitude === undefined || longitude === undefined)`) scores 90.32% with 3 survivors. The `it.each` at `src/test/cityData/checkCityData.coordinates.test.ts:64-102` only tests a tuple missing *both* fields (`base`). With only one field missing, the mutants skip the "has no coordinates" error and report "has the latitude undefined" or "has the longitude undefined" instead.
  (2) `scripts/zoneRules/checkZoneCoordinates.ts:42,45` (`document === null`, `zones === null`) survive, and the file scores 93.67%. The `it.each` at `src/test/zoneRules/checkZoneCoordinates.test.ts:30-38` never feeds the JSON `null` or a `zones` of `null`. Without these guards, both inputs throw a `TypeError` (destructuring `null`, `Object.values(null)`) instead of returning the format error.
  (3) `scripts/zoneData/loadCitySearchData.ts:50` (`cachedCitySearchData === undefined` → `true`) survives, and the file scores 91.67%. The mutant re-reads the dataset and the zone coordinates file and builds a new object on every call. That breaks the "read once" contract in the doc comment at `:3`. `src/test/zoneData/loadCitySearchData.test.ts` calls the loader only once (`:6`), so no test sees it.
  (4) `scripts/zoneRules/compile.ts` scores 90.48%. Both of its survivors are equivalent (see Mutation): `:44` (`release === undefined` → `false`; `parseReleaseName(undefined)` already returns `undefined`) and `:82` (`force: true` → `false`; the directory from `mkdtemp` at `:48` always exists). They are not annotated as equivalent, so the file keeps reporting below target.
  Nine files the task lists also have no score: `src/model/locations.ts`, `src/adapters/locationsDocument.ts`, `src/adapters/city-search/createCompositeCitySearch.ts`, `fetchCitySearch.ts`, `parseGeoNamesCityData.ts`, `geoNamesCitySource.ts`, `zoneCitiesSource.ts`, `src/controller/createLocationsActions.ts` and `src/controller/useLocations.ts` (see Mutation).
- Impact: a ticked task is not done, and M6 (target 95%) is unmet for these files. Each gap lets a concrete break go unnoticed. A city tuple missing only one coordinate would be reported under a misleading message. A zone coordinates file reading `null` or `{"release":"2026f","zones":null}` would crash the zone-rules check with a stack trace instead of the FR4 format error. A broken cache would make every caller of the search data loader (the build plugin, tests) re-read and re-parse both committed JSON files on every call, and no test would fail.
- Fix: four changes, then a re-run.
  (1) In `src/test/cityData/checkCityData.coordinates.test.ts`, add two rows to the `it.each` at `:64`, both expecting `` `The city Alpha (${FRESH_ID}) has no coordinates` ``: `["a missing longitude", [...base, 558], …]` and `["a missing latitude", [...base, undefined, 491], …]`.
  (2) In `src/test/zoneRules/checkZoneCoordinates.test.ts`, add two rows to the `it.each` at `:30`: `["that is null", "null"]` and `["with zones null", JSON.stringify({ release: "2026f", zones: null })]`.
  (3) In `src/test/zoneData/loadCitySearchData.test.ts`, add `it("should read the search data once and return the same data on every call", () => { expect(loadCitySearchData(DATASET_PATH)).toBe(loadCitySearchData(DATASET_PATH)); });`. The mutant builds a new object on every call, so `toBe` fails.
  (4) In `scripts/zoneRules/compile.ts`, mark the two equivalent mutants the way the project already does (`src/presenter/dateTimeFormatters.ts:42`, `scripts/benchBudgets.ts:22`). Above `:44`, add `// Stryker disable next-line ConditionalExpression: equivalent — parseReleaseName(undefined) tests the text "undefined" and returns undefined`. Above `:82`, add `// Stryker disable next-line BooleanLiteral: equivalent — mkdtemp created the work directory and no step removes it, so force never applies`.
  Then re-run `cd packages/client && npx stryker run --mutate 'scripts/cityData/checkCityCoordinates.ts,scripts/zoneRules/checkZoneCoordinates.ts,scripts/zoneData/loadCitySearchData.ts,scripts/zoneRules/compile.ts'` and confirm each file is ≥ 95%. After that, run the nine unmeasured files, at most five per run and one run at a time, and kill or annotate what survives there.
- Fix risk: fixes (1)–(3) add test rows and one test to unit test files that already exist. `.claude/rules/bdd-unit.md` asks for no new Gherkin: the BDD scenario "A broken file fails" already covers the checks, and the cache is not a spec behaviour. `checkCityData.coordinates.test.ts` is 117 lines and stays under 200. The tuple reaches `checkCityData` unchanged (`checkCityData.ts:108` reads indexes 6 and 7 directly), so an `undefined` entry reaches the check as `undefined`. The cache test reuses the module-level cache the file already fills at `:6`, so it adds no file read. Fix (4) adds comments only and changes no behaviour. It hides those two lines from future mutation runs, which is acceptable because no input can tell the mutants apart. The catch-body survivor at `checkZoneCoordinates.ts:40` is also equivalent (`document` stays `undefined` and is rejected at `:42`), so that file cannot reach 100%, but it passes 95%. In this review the runs on the nine unmeasured files took 6–10 minutes each and did not finish within a 10-minute foreground limit. Per CLAUDE.md ("ask the user to run it and share the report"), a user may need to run them outside the agent.
- Status: fixed
- Resolution: added one-field-missing rows, null/zones-null rows and a same-object cache test; annotated the two equivalent compile.ts mutants. Scoped Stryker: checkCityCoordinates 100%, loadCitySearchData 100%, compile 100%, checkZoneCoordinates 97.47%. The nine unmeasured files did not finish within the foreground limit; per CLAUDE.md a full-length run is for the user.

### R2 — WARNING — The "look each location up once per load" guard is untested
- Location: `packages/client/src/controller/useLocationCoordinatesFill.test.tsx:137`
- Rule: `.claude/rules/tdd-workflow.md` ("Analyze survived mutants — each survivor indicates a missed scenario or a weak assertion"); NFR-P2 of add-city-coordinates-to-locations ("once per load of the city data")
- Problem: `useLocationCoordinatesFill.ts:37` skips locations already looked up (`.filter(({ id }) => !lookedUpIds.has(id))`). This guard keeps a location that never gains coordinates from being looked up again on every list change: UTC, or a zone the zone coordinates lack. The test meant to cover it, "should not look UTC up a second time after the others gained coordinates" (`:137-150`), calls `rerender()` and then asserts `getCoordinates` was called twice *synchronously*. The second lookup only happens in the `.then` of `loadCitySearchOnce`, after the assertion has already run, so the assertion holds with or without the guard. The test at `:119-134` rerenders with the same `locations` array, so the effect never re-runs at all. The BDD scenario "A minute tick looks up nothing" (`steps/locations_coordinates_budget.steps.ts:91-99`) uses Kazan, which has its coordinates before the tick, so the hook returns early there too. Stryker confirms this: the mutant that removes the filter survives.
- Impact: if the guard is removed or broken, every list change (add, remove, reorder, home) looks UTC and any uncovered zone up again. That breaks NFR-P2's "once per load of the city data", and no test fails.
- Fix: in the test at `useLocationCoordinatesFill.test.tsx:137-150`, after `rerender()` add `await waitFor(() => expect(fill).toHaveBeenCalledTimes(2));`, then keep `expect(getCoordinates).toHaveBeenCalledTimes(2);`. With the guard, the second effect run still calls `fill` (with an empty map, because UTC is still missing), and `getCoordinates` stays at 2. Without the guard it reaches 3. Then re-run `npx stryker run --mutate 'src/controller/useLocationCoordinatesFill.ts'` and check that the mutant at lines 36–37 is killed.
- Fix risk: none for production code; only a test changes. The `fill` mock assigns a new `locations` array again on its second call. That is harmless: `renderHook` reads `locations` only on a rerender, and the test triggers no further rerender. The test stays a hook unit test in its current file, where `.claude/rules/bdd-unit.md` puts no requirement.
- Status: fixed
- Resolution: the test now waits for the second fill call before asserting getCoordinates stays at 2, so removing the guard fails it; useLocationCoordinatesFill.ts scores 100% under Stryker.

## Verdict

Not ready. Blocking: R1 (CRITICAL). Task 9.3 is ticked but not done. `checkCityCoordinates.ts`, `compile.ts`, `loadCitySearchData.ts` and `checkZoneCoordinates.ts` are below the 95% target, and their survivors are neither killed nor annotated. Nine listed files have no measured score. R2 (WARNING) is a test-strength gap with no wrong behaviour today; fix it in the same pass. 37 of 38 tasks have full evidence. Every FR, NFR and UX id is implemented and traced. NFR-P2 is only partly guarded by tests (R2), and M6 is only partly verified (R1). The build and the bundle budgets pass, and every mutation score measured is at least 90%.
