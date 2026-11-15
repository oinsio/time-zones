# Specs review: add-city-coordinates-to-locations

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 30/32 |
| Contradictions | 3 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 3 |

## Freshness

- ✅ "`parseGeoNamesRows.ts` reads columns 0, 1, 7, 8, 10, 14, 17" (design.md:9) — `packages/client/scripts/cityData/parseGeoNamesRows.ts:14-23` (`CITY_COLUMNS`: 0, 1, 7, 8, 10, 14, 17, count 18); latitude and longitude are not read.
- ✅ "one tuple per city (`CityTuple`, `DATASET_FORMAT_VERSION = 1`)", region index optional and last (design.md:10, D2) — `scripts/cityData/cityDataTypes.ts:6-9`, `scripts/cityData/constants.ts:10`.
- ✅ Served form is columns, parsed by `parseCitySearchData` (design.md:10) — `scripts/cityData/toServedCityData.ts:12-19`, `src/adapters/city-search/fetchCitySearch.ts:41`; `parseGeoNamesCityData.ts` reads named columns (`:23`).
- ✅ Zone cities come from CLDR without coordinates (design.md:11) — `scripts/zoneData/loadZoneData.ts:21-27`, `ZoneCityRecord` = `timeZoneId`, `names`, `countryCode` (`scripts/zoneData/extractZoneData.ts:8-12`).
- ✅ `compileArchive` unpacks the whole archive with `tar -xzf` into `sourceDirectory`, checks `version`, passes only `TZDATA_SOURCE_FILES` to `zic`; nothing reads `zone.tab` (design.md:12) — `scripts/zoneRules/compileWithZic.ts:13,25,95-123`; `CompiledZones` holds only `zones` and `links` (`:29-33`).
- ✅ `CityRecord` and `Location` have no coordinates; identity is zone plus label (design.md:13) — `src/ports/citySearch.ts:14-35`; `src/model/parseStoredLocations.ts:68-76` builds `kind`, `id` (`buildLocationId(timeZoneId, label)`), `timeZoneId`, `label`, `countryCode`.
- ✅ Stored list is version 3, migrated by `LOCATION_MIGRATIONS` without a write (design.md:14) — `src/constants/locations.ts:2`, `src/adapters/locationsDocument.ts:21-30`; writer `serializeLocationsDocument` (`:37-55`) stores only kind/zone/label/country.
- ✅ `parseStoredLocations` rejects a device time entry with zone fields and ignores unknown fields of a city entry (design.md:14, D6) — `src/model/parseStoredLocations.ts:47-62`.
- ✅ `localStorageLocationRepository.migration.test.ts` loads a version 4 document as unreadable today (design.md:14, task 7.3) — `src/adapters/localStorageLocationRepository.migration.test.ts:76-77`.
- ✅ `useCityLabels` loads the city data once in the background while the list holds a city location (design.md:15) — `src/controller/useCityLabels.ts:28-31`; `getCityLabel(timeZoneId, storedLabel, language)` resolves through `recordsByZone`, zone city first, exact names only (`src/adapters/city-search/createCompositeCitySearch.ts:81-98,152-156`).
- ✅ A failed load is retried by the next load (proposal.md:101 "the next load tries again") — `src/controller/cityDataCache.ts:7-27` drops a rejected load.
- ✅ Remote zone rules updates deliver only the version file and `zone-rules/<release>.json` (design.md:16) — `scripts/zoneRules/servedZoneRulesFiles.ts:16-31`.
- ✅ Node scripts import `src/constants/zoneRules.ts` by relative path (design.md:37) — `scripts/zoneRules/precacheExclusion.ts:9`, `scripts/check-bundle-size.mjs:31`.
- ✅ `compile.ts` parses every city line before `compileCityData` and `writeFile`; test "should return non-zero naming the line for a malformed city line" exists (design.md:48, task 3.1) — `scripts/cityData/compile.ts:59-83`, `src/test/cityData/compile.test.ts:53`.
- ✅ `check.test.ts` runs `runCityDataCheck` on the committed `city-data/geonames-cities.json` (design.md:69, task 3.5) — `src/test/cityData/check.test.ts:4-12`.
- ✅ `runZoneRulesCompile`, `runCityDataCompile`, and the `tar` fake of `compileFakes.ts` exist (tasks 3.6, 4.2, 4.7) — `scripts/zoneRules/compile.ts:34`, `scripts/cityData/compile.ts:49`, `src/test/zoneRules/compileFakes.ts:109-115`.
- ✅ `startWorkCount()` counts normalizations (design.md:89, task 6.2) — `src/test/workCounters.ts:19,33`.
- ✅ `PREFERENCES_SCHEMA_VERSION = 6` (design.md:79) — `src/constants/preferences.ts:10`.
- ✅ `CITY_SEARCH_DATA_BUDGET_KB = 130` and `ZONE_RULES_RELEASE_FILE` in `app.config.ts` (tasks 4.3, 5.3) — `packages/client/app.config.ts:66,73`.
- ✅ Committed city data is the dump of 2026-11-14 with 6 102 cities (proposal.md:128) — `city-data/geonames-cities.json` `dumpDate`, `city-data/README.md:14,19`.
- ✅ "No test covers [`loadCitySearchData`] yet" (task 5.1) — no file under `src/` imports it; only `scripts/zoneData/zoneDataPlugin.ts:19` does.
- ✅ Every other file named as existing exists: the tests of tasks 2–8 (`parseGeoNamesRows.test.ts`, `compileCityData.test.ts`, `serializeCityDataset.test.ts`, `toServedCityData.test.ts`, `checkCityData*.test.ts`, `compile.valid/stops.test.ts`, `src/test/zoneRules/check.test.ts`, `fetchCitySearch.test.ts`, `geoNamesCitySource.test.ts`, `zoneCitiesSource.test.ts`, `abbreviationSource.test.ts`, `createCompositeCitySearch.cityLabel.test.ts`, `locations.test.ts`, `deviceTimeLocation.test.ts`, `parseStoredLocations.test.ts`, `locationRepository.test.ts`, `LocationSearch.test.tsx`, `useCityLabels.test.tsx`), `src/presenter/presentLocationRows.ts:50`, `docs/architecture/domain-model.md` ("State" :5, "Out of the model" :132), `docs/glossary/locations.md`, `docs/glossary/search.md`.
- ✅ The MODIFIED "Search is fast and lazy" (specs/location-search/spec.md:30-75) restates the stable requirement of `openspec/specs/location-search/spec.md` with only the budget (130 → 150 KB) and the coordinates wording changed, and keeps all seven stable scenarios.
- ✅ Nothing is implemented yet — no `coordinates`/`latitude` in `packages/client/src` or `scripts` (only `sortableKeyboardCoordinates` of dnd-kit in `LocationList.tsx:12`); no archived change adds them.
- ✅ ADR-0010 still says "The document schema version is 3" (`docs/adr/0010-device-time-location.md:17`), so the H1 status note is needed.
- ❌ "the bundle budget … of `location_search_performance.feature`" (proposal.md:113) and "`location_search_performance.feature`: bundle budget scenario at 150 KB" (tasks.md:60) — that feature has only the scenarios Query timing, Preparing the data for search, Loading without a query does no search work, Abbreviation query within the work bound (`src/test/features/location_search/location_search_performance.feature:5,13,18,24`); the bundle budget is enforced by `scripts/check-bundle-size.mjs` (`check:bundle-size`), not by any feature file.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ city-data "Coordinates of the GeoNames cities" | ✅ 3.1–3.6 |
| FR2 | ✅ | ✅ city-data "Zone coordinates" | ✅ 4.1–4.3, 4.5, 4.7 |
| FR3 | ✅ | ✅ city-data "Zone coordinates", "Coordinates are checked" | ✅ 4.4, 4.6, 5.1 |
| FR4 | ✅ | ✅ city-data "Coordinates are checked" | ✅ 3.4, 3.6, 4.4, 4.6, 4.7 |
| FR5 | ✅ | ✅ location-search "City records carry coordinates" | ✅ 5.2, 6.1–6.3 |
| FR6 | ✅ | ✅ locations "Coordinates of a city location" | ✅ 7.1, 8.1, 8.3 |
| FR7 | ✅ | ✅ locations "Coordinates are kept on the device" | ✅ 7.3, 7.4 |
| FR8 | ✅ | ✅ locations "Stored locations gain coordinates" (see R1) | ✅ 7.2, 8.2, 8.4 |
| FR9 | ✅ | ✅ locations "Coordinates of a city location", "Coordinates are kept on the device" | ✅ 7.1, 7.3, 7.4, 8.3 |
| NFR-P1 | ✅ | ✅ location-search MODIFIED "Search is fast and lazy" | ✅ 5.3, 9.1 (8.6 names a scenario that does not exist, R3) |
| NFR-P2 | ✅ | ✅ locations "Coordinates cost no extra work"; location-search "Coordinates of stored locations do no search work" | ✅ 6.2, 8.2, 8.5, 8.6 |
| NFR-P3 | ✅ | ❌ named in the text of "Coordinates cost no extra work", no scenario (R2) | ✅ 8.5 |
| NFR-A1 | ✅ | ✅ existing stable axe-core requirements of `openspec/specs/location-search/spec.md:309` and the list, unchanged (no UI change) | ✅ 9.2 |
| NFR-R1 | ✅ | ✅ existing stable screenshot requirements, unchanged (no UI change) | ✅ 9.2 |
| UX1 | ✅ | ✅ "Results are unchanged", "Rows are unchanged" | ✅ 6.3, 8.3 |
| UX2 | ✅ | ✅ "Stored locations gain coordinates" (order, home, no error) | ✅ 8.4 |
| G1 | ✅ | n/a — met by FR1, FR3, M1, M2 | n/a — via FR1/FR3 tasks |
| G2 | ✅ | ✅ tagged on "Stored locations gain coordinates" (UTC exception, R6) | ✅ 8.4 |
| G3 | ✅ | n/a — met by UX1, NFR-R1, M5 | n/a — via 9.2 |
| NG1 | ✅ | n/a | n/a — nothing builds solar or day-period changes |
| NG2 | ✅ | n/a | n/a — `DayPeriod.WORK` untouched |
| NG3 | ✅ | n/a | n/a — device time location never gets coordinates; no geolocation |
| NG4 | ✅ | n/a | n/a — coordinates are not shown, searched or edited |
| NG5 | ✅ | n/a | n/a — identity stays zone plus label |
| NG6 | ✅ | n/a | n/a — zone coordinates are not served or remotely updated |
| NG7 | ✅ | n/a | n/a — checks run in `pnpm test`; no CI step added |
| M1 | ✅ | ✅ | ✅ 3.5, 3.6 |
| M2 | ✅ | ✅ | ✅ 4.5, 4.6 |
| M3 | ✅ | ✅ | ✅ 3.6, 4.6, 4.7 |
| M4 | ✅ | ✅ | ✅ 5.3, 9.1 |
| M5 | ✅ | n/a | ✅ 9.2 |
| M6 | ✅ | n/a | ❌ 9.3 omits changed production files (R4) |

## Consistency

- The delta `specs/locations/spec.md:85` ("The list MUST then be written once" after the city data loads) contradicts two stable requirements this change neither modifies nor mentions: `openspec/specs/locations/spec.md:105` "List is kept on the device" ("Nothing MUST be written for the list until the user first changes it or the home location"; "A document of version 1 or 2 MUST be migrated on load") and `openspec/specs/home-location/spec.md:152` "Home is kept on the device" ("Nothing MUST be written until the user changes the list or home").
- `proposal.md:38` G2 ("100% of the city locations in a user's list have coordinates") contradicts `proposal.md:72` FR9 ("a location in UTC SHALL have none") and `specs/locations/spec.md:99-103` ("UTC stays without coordinates").
- `design.md:58` and `tasks.md:27` (task 4.2) apply the zone coordinate overrides when the file is written, while `design.md:69` and `tasks.md:29` (task 4.4) apply them again inside `checkZoneCoordinates(…, overrides)`; the build join (`design.md:58`, task 5.1) reads only the file.

## Findings

### R1 — WARNING — Writing the list after the city data loads contradicts two stable no-write requirements
- Location: `openspec/changes/add-city-coordinates-to-locations/specs/locations/spec.md:85`; `openspec/changes/add-city-coordinates-to-locations/proposal.md:33-34`
- Rule: `.claude/rules/delta-specs.md` (a changed rule is a MODIFIED requirement); `.claude/rules/process-invariants.md`
- Problem: FR8 and the ADDED requirement "Stored locations gain coordinates" write the list once after the city data loads, with no user change. The stable requirement "List is kept on the device" (`openspec/specs/locations/spec.md:105`) says "Nothing MUST be written for the list until the user first changes it or the home location" and "A document of version 1 or 2 MUST be migrated on load". "Home is kept on the device" (`openspec/specs/home-location/spec.md:152`) says "Nothing MUST be written until the user changes the list or home". The change's Capabilities section (`proposal.md:32-34`) lists only ADDED requirements for `locations` and does not list `home-location` at all.
- Impact: Once archived, the stable specs require both "never write before a user change" and "write once after the city data loads", and still list only versions 1 and 2 as migrated. The implementer has no single rule to test against. Existing scenarios that assert no write while city locations lack coordinates and the city data is loaded may also break without any task naming them. For example, "A switch keeps the stored list" in `src/test/features/locations/locations_city_label_language_unit.feature:47-60` loads the full city data through `deviceTimeWorld` and asserts "the stored location list was not written".
- Fix: In `specs/locations/spec.md`, add a `## MODIFIED Requirements` section that restates "List is kept on the device" in full, with every stable scenario and its traceability comment. Change two sentences: "A document of version 1, 2 or 3 MUST be migrated on load; a version 3 document holds no coordinates" and "Nothing MUST be written for the list until the user first changes it or the home location, or until city locations gain their coordinates (see 'Stored locations gain coordinates')". Add `specs/home-location/spec.md` with a MODIFIED "Home is kept on the device" that carries the same exception. In `proposal.md`, list both MODIFIED requirements under Capabilities and What Changes. In task 8.4, add `npx vitest run src/test/features/locations/steps/locations_city_label_language_unit.steps.tsx` and `npx vitest run src/test/features/home_location/steps/home_location_storage_unit.steps.tsx` to Verify. Where a fixture's city location now gains coordinates and gets written, give the fixture coordinates so the scenario keeps testing what it was written for.
- Fix risk: A MODIFIED requirement replaces the whole stable text at archive, so a scenario left out of the restatement is lost. Copy the stable requirement verbatim and change only the two sentences. No other active change modifies either requirement (checked by grep over `openspec/changes/`).
- Status: open

### R2 — WARNING — NFR-P3 has no scenario
- Location: `openspec/changes/add-city-coordinates-to-locations/specs/locations/spec.md:124-139`
- Rule: `.claude/rules/delta-specs.md`; `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test")
- Problem: "Coordinates cost no extra work" implements NFR-P2 and NFR-P3. Its text says "Presenting the list MUST do the same counted work as without coordinates", but its three scenarios only count coordinate lookups (NFR-P2). No scenario in any delta spec covers presenting the list (NFR-P3). Only task 8.5 mentions the check.
- Impact: Task 8.5 says to write "the scenarios of 'Coordinates cost no extra work'". An implementer following the spec writes the three lookup scenarios, so the NFR-P3 check survives only as a side clause. After archive, the stable spec holds an untested MUST that no scenario names, and traceability task 9.4 can match NFR-P3 from a tag without a test behind it.
- Fix: Add to `specs/locations/spec.md` under "Coordinates cost no extra work": `#### Scenario: Presenting the list does the same work` — **GIVEN** the list holds Kazan and Moscow with coordinates — **WHEN** the list is presented — **THEN** as many formatters, collators and transition lookups were built as for the same list without coordinates.
- Fix risk: none. Task 8.5 already plans exactly this comparison with `startWorkCount()`, a unit work bound as ADR-0008 requires.
- Status: open

### R3 — WARNING — The bundle-budget scenario the tasks edit does not exist in the named feature
- Location: `openspec/changes/add-city-coordinates-to-locations/tasks.md:60`; `openspec/changes/add-city-coordinates-to-locations/proposal.md:113`
- Rule: `.claude/rules/test-planning.md`; `.claude/rules/gherkin.md`
- Problem: Task 8.6 says "`location_search_performance.feature`: bundle budget scenario at 150 KB", and the proposal's Behavior says the bundle budget is a scenario of that feature. The feature holds only Query timing, Preparing the data for search, Loading without a query does no search work, and Abbreviation query within the work bound (`src/test/features/location_search/location_search_performance.feature:5,13,18,24`). The budget is checked only by `scripts/check-bundle-size.mjs` (`check:bundle-size`, `CITY_SEARCH_DATA_BUDGET_KB`), which task 5.3 already updates.
- Impact: The implementer either cannot complete 8.6 as written, or adds a new unit BDD scenario with step definitions that would have to run a production build inside `vitest`. That second budget check duplicates `check:bundle-size` and is slow.
- Fix: In task 8.6, delete "bundle budget scenario at 150 KB, and" and keep only the new scenario "Coordinates of stored locations do no search work" (NFR-P2). In `proposal.md:113`, write "the new work-bound scenario of `location_search_performance.feature` — NFR-P2; the search data budget (NFR-P1) is checked by `check:bundle-size` (tasks 5.3, 9.1)". Leave the delta spec's "Bundle budget" scenario as it is: it is the stable scenario, verified by the script.
- Fix risk: none. The stable "Bundle budget" scenario was already verified only by `check-bundle-size.mjs`.
- Status: open

### R4 — WARNING — The scoped mutation runs leave changed production files out of M6
- Location: `openspec/changes/add-city-coordinates-to-locations/tasks.md:66`; `openspec/changes/add-city-coordinates-to-locations/proposal.md:133`
- Rule: `.claude/rules/tdd-workflow.md` ("Run … mutation on the changed files"); `CLAUDE.md` (at most 5 files per Stryker run)
- Problem: M6 requires ≥ 95% (minimum 90%) on "the new and changed production files of `scripts/cityData/`, `scripts/zoneRules/`, `src/adapters/`, `src/model/` and `src/controller/`". The four runs of task 9.3 leave out files that tasks 3.2, 4.2–4.4, 5.2, 6.1 and 8.1–8.2 change with logic: `scripts/cityData/serializeCityDataset.ts`, `scripts/zoneRules/compileWithZic.ts`, `scripts/zoneRules/compile.ts`, `scripts/zoneRules/check.ts`, `src/adapters/city-search/parseGeoNamesCityData.ts`, `src/adapters/city-search/geoNamesCitySource.ts`, `src/adapters/city-search/zoneCitiesSource.ts`, `src/controller/createLocationsActions.ts`, `src/controller/useLocations.ts`.
- Impact: M6 cannot be shown to hold. Surviving mutants in the served-column decoding, the `zone.tab` read, the both-or-neither write of the compile, or the passing of coordinates to `addLocation` go unnoticed.
- Fix: Add two runs to task 9.3: `scripts/cityData/serializeCityDataset.ts,scripts/zoneRules/compileWithZic.ts,scripts/zoneRules/compile.ts,scripts/zoneRules/check.ts` and `src/adapters/city-search/parseGeoNamesCityData.ts,src/adapters/city-search/geoNamesCitySource.ts,src/adapters/city-search/zoneCitiesSource.ts,src/controller/createLocationsActions.ts,src/controller/useLocations.ts`. Each run stays at five files or fewer, one at a time.
- Fix risk: Two more Stryker runs add implement time. Stryker mutates whole files, so survivors from earlier changes in those files count too, and the implement stage may need extra tests to reach the threshold.
- Status: open

### R5 — SUGGESTION — Overrides are applied both when writing and when checking the zone coordinates
- Location: `openspec/changes/add-city-coordinates-to-locations/design.md:69`; `openspec/changes/add-city-coordinates-to-locations/tasks.md:29`
- Rule: —
- Problem: Task 4.2 writes the overrides of `zoneCoordinateOverrides.ts` into `zone-rules/zone-coordinates.json`. `checkZoneCoordinates(zoneCoordinatesText, release, zoneCities, overrides)` (D4, task 4.4) checks coverage "after overrides". The build join of task 5.1 reads only the file.
- Impact: If a maintainer adds an override without recompiling (recompiling needs the network, `gpg` and `zic`), the committed check passes while the served zone city has no coordinates. That breaks FR3 without any test failing. Today the overrides are empty, so nothing breaks yet.
- Fix: In D4 and task 4.4, drop the `overrides` parameter: `checkZoneCoordinates(zoneCoordinatesText, release, zoneCities)` checks coverage on the committed file alone. Move the case "overrides fill a zone the table lacks" to `writeZoneCoordinates.test.ts` (task 4.2). The spec sentence "without one the check fails" still holds, because without an override the file lacks the zone.
- Fix risk: none. The spec text and the other check rows stay the same.
- Status: open

### R6 — SUGGESTION — G2 promises coordinates for every city location, including UTC
- Location: `openspec/changes/add-city-coordinates-to-locations/proposal.md:38`
- Rule: —
- Problem: G2 reads "100% of the city locations in a user's list have coordinates after the city data was loaded once". A location in UTC is a city location (added through `ADD_LOCATION` from the UTC zone city record), and FR9 (`proposal.md:72`) and the scenario "UTC stays without coordinates" (`specs/locations/spec.md:99-103`) require it to have none. NG6 also leaves zones known only from a remote update without coordinates.
- Impact: A test written from G2 would fail on any list that holds UTC, or the implementer might give UTC coordinates and break FR9.
- Fix: G2 → "100% of the city locations in a user's list have coordinates after the city data was loaded once, including locations stored before this change, except a location in UTC (FR9) and one whose zone the zone coordinates lack (NG6)."
- Fix risk: none.
- Status: open

### R7 — SUGGESTION — "Zone table" is a new concept with no glossary entry
- Location: `openspec/changes/add-city-coordinates-to-locations/tasks.md:7`; `openspec/changes/add-city-coordinates-to-locations/proposal.md:19-21`
- Rule: `.claude/rules/glossary.md` ("A change that introduces a new domain concept adds its glossary entry in the same change")
- Problem: The proposal, design, specs and code names (`parseZoneTable`, `ZONE_TABLE_FILE`) use "zone table" for IANA's `zone.tab`. Task 1.1 adds only **Coordinates** and **Zone coordinates**. The glossary already uses "zone abbreviation table" for a different table (`docs/glossary/search.md:10`).
- Impact: The two "zone … table" concepts have no recorded distinction, and the glossary review checklist of the implement stage flags `parseZoneTable` and `ZONE_TABLE_FILE` as names without a term.
- Fix: In task 1.1 and in the proposal's glossary bullets, add a term to `docs/glossary/zone-rules.md`: **Zone table** — the `zone.tab` file of the IANA release archive that lists each zone's country code and the coordinates of its principal place; *Code:* `ZONE_TABLE_FILE`, `parseZoneTable`; *Never:* zone abbreviation table (that table maps abbreviations). Extend the task 1.1 verification with `grep -n "Zone table" docs/glossary/zone-rules.md`.
- Fix risk: none. `docs/glossary/` is inside the implement stage's limits.
- Status: open

## Verdict

Needs revision. No CRITICAL findings. Blocking: R1 (the automatic write contradicts the stable no-write requirements of `locations` and `home-location`), R2 (NFR-P3 has no scenario), R3 (task 8.6 edits a scenario that does not exist), R4 (M6's mutation runs leave changed files out). R5–R7 are polish.
