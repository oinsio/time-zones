# Review: add-geonames-city-source

## Summary

| Item | Value |
|---|---|
| Tasks verified | 39/41 |
| Requirements traced | 119/124 |
| CRITICAL | 2 |
| WARNING | 4 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 Glossary: `docs/glossary/search.md:15-19` (GeoNames source, City data, Population, Namesake, Region), City record / Search result updated; `docs/glossary/settings.md:21` City data attribution, Settings page (l. 5) and Deploy time (l. 11) updated; GeoNames in the abbreviations table `docs/glossary/README.md:41`; both files under 200 lines (19 and 21).
- ✅ 1.2 `docs/architecture/domain-model.md:133` describes the city record (ID per city, population, region for namesakes); `docs/architecture/overview.md:83` lists `lib/searchText/`.
- ✅ 2.1 `packages/client/scripts/cityData/constants.ts` (threshold `100_000`, `PPLC`, dump URLs, languages, `MIN_CITY_COUNT`, `MIN_CYRILLIC_SHARE`, `DATASET_PATH`, format version) and `scripts/cityData/cityDataTypes.ts`.
- ✅ 2.2 `src/lib/searchText/index.ts` + `normalizeSearchText.ts` moved (rename in the diff); Node import proven by `src/test/cityData/searchTextNodeImport.test.ts`.
- ✅ 2.3 `scripts/cityData/parseGeoNamesRows.ts` with `src/test/cityData/parseGeoNamesRows.test.ts` (row parsers, line numbers in errors).
- ✅ 2.4 `scripts/cityData/selectCityNames.ts` with `it.each` cases in `src/test/cityData/selectCityNames.test.ts` (preferred, non-historic, fallback, override).
- ✅ 2.5 `scripts/cityData/markNamesakes.ts` with `src/test/cityData/markNamesakes.test.ts`; imports `normalizeSearchText` from `../../src/lib/searchText/index.ts`.
- ✅ 2.6 `scripts/cityData/compileCityData.ts` with `src/test/cityData/compileCityData.test.ts` (99 999 dropped l. 11, `Asia/Calcutta` l. 84, `Mars/Olympus` l. 112, exemplar merge l. 124-136, identical runs l. 70).
- ✅ 2.7 `scripts/cityData/download.ts`, `scripts/cityData/compile.ts` (`runCityDataCompile`, guarded block under `// Stryker disable all`), `package.json:15` `city-data:compile`; `src/test/cityData/download.test.ts`, `src/test/cityData/compile.test.ts` (success, failed download, failing unzip, zone outside the release). See R3 for the dump date.
- ✅ 2.8 `packages/client/city-data/geonames-cities.json` (6 102 cities, 3 × "Springfield", `dumpDate` 2026-11-14, recompiled in commit c71c8d5 "Recompile the GeoNames city data with city-data:compile") and `city-data/README.md` (source, licence, dump date, counts, refresh, gzipped size). See R4: the committed file is a reformatted version of the command's output.
- ✅ 3.1 `scripts/cityData/checkCityData.ts` with `src/test/cityData/checkCityData.test.ts` and `checkCityData.format.test.ts`; entry `scripts/cityData/check.ts` (`runCityDataCheck`) with `src/test/cityData/check.test.ts`; `package.json:16` `city-data:check`.
- ✅ 3.2 `scripts/zoneData/zoneDataPlugin.ts` serves `loadCitySearchData(datasetFilePath)` from the dev middleware, the build asset and `virtual:zone-cities` (named export `cityData`); `src/vite-env.d.ts` declares it; `src/test/zoneData/zoneDataPlugin.test.ts`. The served `cityData` is the columnar form of `scripts/cityData/toServedCityData.ts`, not the committed object without `source` (see R5).
- ✅ 3.3 `app.config.ts` `CITY_SEARCH_DATA_BUDGET_KB = 130`, imported by `scripts/check-bundle-size.mjs` (script-local `30` removed, header updated).
- ✅ 4.1 `src/ports/citySearch.ts` `population`, `region?`, `id` documented as unique per city; `GeoNamesCityData` and `EMPTY_GEONAMES_CITY_DATA` in `src/adapters/city-search/citySource.ts`; contract `citySource.contract.ts` checks unique IDs.
- ✅ 4.2 `parseCitySearchData` in `src/adapters/city-search/fetchCitySearch.ts` (with `parseGeoNamesCityData.ts`), re-exported from the adapter index; `fetchCitySearch.test.ts` and `src/test/stubZoneCitiesFetch.ts` answer `{ zoneCities, cityData }`.
- ✅ 4.3 `src/adapters/city-search/cityTextMatching.ts` (`listKnownZones`, `createCountryTextCache`, `createRecordMatcher`), `zoneCitiesSource.ts` signature `(zoneCities, listTimeZones = listKnownZones, cityData = EMPTY_GEONAMES_CITY_DATA, …)`; `cityTextMatching.test.ts`.
- ✅ 4.4 `src/adapters/city-search/geoNamesCitySource.ts` with `geoNamesCitySource.test.ts`; contract run in `citySources.test.ts`.
- ✅ 4.5 `src/adapters/city-search/createCompositeCitySearch.ts` (`keepFirstResultPerCity`, comparator kind → zone city among `COUNTRY` → rank → population → name, `groupRecordsByZone` for `getCityLabel`, exemplar and `suggest` from zone cities); tests `createCompositeCitySearch.cities.test.ts`, `.exemplarCity.test.ts`, `.cityLabel.test.ts`.
- ✅ 4.6 `searchWorld.ts`, `location_search_by_name.steps.ts`, `locations_city_label_language_unit.steps.tsx`, `locations_city_label_budget_unit.steps.tsx`, `cityLabels.bench.ts` pass `cityData` (diff of each).
- ✅ 5.1 `src/presenter/presentSearchResults.ts` adds `id` and `regionName`; `src/presenter/presentSearchResults.regions.test.ts`.
- ✅ 5.2 `src/views/shared/LocationSearchResults.tsx` keys by `result.id`, `REGION_COUNTRY_SEPARATOR`, wrapping line; new `LocationSearchResults.test.tsx`; fixture in `locationSearchDialogFixtures.tsx`.
- ✅ 6.1 `location_search_geonames_cities.feature` + `steps/location_search_geonames_cities.steps.ts` (10-row table, Russian, later word, abbreviation, suggestions, the two FR11 scenarios).
- ✅ 6.2 `location_search_by_country.feature` ("Other cities of the country", "Every zone of a large country stays within the limit"), `location_search_ranking.feature` ("One entry per zone" reworded, "A zone appears once per city", the three FR5 scenarios) with steps.
- ✅ 6.3 `steps/searchWorld.ts` (13 `SAMPLE_QUERIES`, preparation query, `countPreparationWork`); `location_search_performance.feature` says 13 and adds "Given the full data is prepared for search".
- ✅ 6.4 `location_search_namesakes_unit.feature` + `steps/location_search_namesakes_unit.steps.tsx`, `steps/namesakesWorld.tsx` (seven scenarios).
- ✅ 6.5 `location_search_performance.feature` / steps: no formatter per query, "Preparing the data for search", "Loading without a query does no search work".
- ✅ 6.6 `locations_city_label_language_unit.feature` adds "A city that is not the zone city" and "Namesakes in one zone read the same" with steps.
- ✅ 6.7 `src/test/benchmarks/citySearch.bench.ts` over the full data via `searchWorld`; README records the mean (~0.3 ms).
- ✅ 7.1 `GEONAMES_URL` in `src/constants/api.ts`, exported from `src/constants/index.ts`; `settings.cityDataAttribution` in `src/locales/en.json` and `ru.json` with the glossary texts.
- ✅ 7.2 `src/app/settings/CityDataAttribution.tsx` (+ test), rendered last in `SettingsPage.tsx`; `SettingsPage.test.tsx`, `ZoneRulesReleaseLine.test.tsx`, `DeployTime.test.tsx`, `settings_zone_rules_release_unit.feature`, `settings_deploy_time_unit.feature` updated.
- ✅ 8.1 `location_search_namesakes_e2e.feature` + `steps/location_search_namesakes_e2e.steps.ts`; eight new "Screenshots-with-regions" PNGs (chromium, mobile-chrome).
- ✅ 8.2 `settings_city_data_attribution_e2e.feature` + `steps/settings_city_data_attribution_e2e.steps.ts` (both languages, new tab, offline, keyboard, axe both themes, 320/2560 px).
- ❌ 8.3 Not done: `src/test/features/settings/settings_e2e.feature` and `settings_language_e2e.feature` carry no `@add-geonames-city-source` tag and no `Approved-screenshots-of-the-settings-*` PNG changed on the branch, so the approved settings screenshots do not show the attribution (R1). The IST results screenshots were re-approved (1024 px light, two projects) and `locations_ui_e2e.feature` tagged.
- ✅ 8.4 No change to the loading/error/retry/offline code paths (`createFetchCitySearchLoader` still one `fetch`, same errors); `locations_ui_e2e.feature` and its helpers adjusted for the new payload (`locationsE2eHelpers.ts`).
- ✅ 9.1 Unit suite: CI is green for the branch; scenarios were adjusted by expectations (e.g. ranking steps).
- ❌ 9.2 Not done (R2): survivors remain in four script files, three of them below the 95 % target (`compileCityData.ts` 90.29 %, `download.ts` 90.91 %, `selectCityNames.ts` 93.55 %, `parseGeoNamesRows.ts` 95.24 % with 1 survived and 1 no coverage), and `createCompositeCitySearch.ts` and `parseGeoNamesCityData.ts`, both named by the task, have no measured score (see Mutation). Survivors were killed only partly in 9aaacf9.
- ✅ 9.3 Every FR1–FR14, NFR-P1–P4, NFR-A1/A2, NFR-R1/R2, UX1–UX4 id is found in at least one file of `src`/`scripts` that names the change (grep run during this review).
- ✅ 9.4 Lint, typecheck, build and bundle size are part of the green CI; the README records 119.4 KB against the 130 KB budget.
- ✅ 10.1 `temporary-docs/gnomish/github-oinsio-time-zones-128/handoff/H1-adr-0015-city-data.patch` and its README section.
- ✅ 10.2 `handoff/H2-ci-city-data-check.patch` and its README section.
- ✅ 10.3 `handoff/H3-readme-geonames-credit.patch` and its README section.

## Requirements

- ✅ FR1 — `compileCityData.ts` `selectLargeCities` / exemplar merge; tests `compileCityData.test.ts:11`, `:124`; committed data holds 6 102 cities, `zoneCityPopulations` for 265 zones.
- ✅ FR2 — `selectCityNames.ts`, `selectCityNames.test.ts` (`it.each`); `checkCityData.ts` rejects empty names.
- ✅ FR3 — `cityTextMatching.ts` `createRecordMatcher` shared by both sources; `location_search_geonames_cities.feature` (10 cities, Russian, later word).
- ✅ FR4 — `keepFirstResultPerCity` in `createCompositeCitySearch.ts`; "A zone appears once per city" in `location_search_ranking.feature`; limit 50 unchanged.
- ✅ FR5 — `createResultComparator` (kind → rank → population → name); ranking scenarios "Popular locations before larger cities", "Larger cities first", "Equal population falls back to the name".
- ✅ FR6 — zone cities first among `COUNTRY` matches in the comparator; "Other cities of the country" in `location_search_by_country.feature`.
- ✅ FR7 — `markNamesakes.ts`, `presentSearchResults.ts` `regionName`, `LocationSearchResults.tsx` secondary line; `location_search_namesakes_unit.feature`, `presentSearchResults.regions.test.ts`.
- ✅ FR8 — `isAdded` via `isCityNameOfRecord`; "Add a GeoNames city", "Namesakes in the same zone", "A city and the zone city of its zone are different locations".
- ✅ FR9 — `getCityLabel` over `groupRecordsByZone`; `createCompositeCitySearch.cityLabel.test.ts`, `locations_city_label_language_unit.feature`.
- ✅ FR10 — abbreviation source and `suggest` read zone records only; "An abbreviation still finds zone cities only", "Suggestions are unchanged", `createCompositeCitySearch.exemplarCity.test.ts`.
- ✅ FR11 — `resolveZone` throws in the compiler; `geoNamesCitySource.ts` skips unknown zones; `checkCityData.ts` zone check; "A city of a zone the installed release lacks" / "… the engine rejects".
- ⚠️ FR12 — compile/check commands, committed file and offline build exist and are tested, the CI step is pending handoff H2; but the command records the run date as the dump date, so the same dumps compiled on two days differ (R3), and its output is not the committed (biome-formatted) file (R4).
- ✅ FR13 — `CityDataAttribution.tsx`, `GEONAMES_URL`, both locales; `city-data/README.md` credits GeoNames; root READMEs via handoff H3.
- ✅ FR14 — one file, one `fetch`, same errors in `fetchCitySearch.ts`; invalid payload throws `INVALID_RECORDS` (`fetchCitySearch.test.ts`).
- ✅ NFR-P1 — `CITY_SEARCH_DATA_BUDGET_KB = 130` in `app.config.ts` checked by `check-bundle-size.mjs`; README measures 119.4 KB.
- ✅ NFR-P2 — `createCountryTextCache` (one formatter per language), lazy `createRecordMatcher`; "Query timing", "Preparing the data for search" in `location_search_performance.feature`.
- ✅ NFR-P3 — records built without normalization; "Loading without a query does no search work".
- ✅ NFR-P4 — `src/test/benchmarks/citySearch.bench.ts` (non-blocking), README reports ~0.3 ms.
- ✅ NFR-A1 — region inside the option text (`LocationSearchResults.tsx`); `LocationSearchResults.test.tsx`; e2e "The region is in the result's name", axe in both themes.
- ✅ NFR-A2 — `settings_city_data_attribution_e2e.feature` (keyboard, 44 px, axe both themes); `min-h-11`, focus outline classes.
- ✅ NFR-R1 — `location_search_namesakes_e2e.feature` no-scroll 320/375/2560 and the eight approved "Screenshots with regions" PNGs.
- ⚠️ NFR-R2 — no-scroll at 320/2560 px in both languages is tested in `settings_city_data_attribution_e2e.feature`, but the approved settings screenshots were not re-approved with the attribution (R1).
- ✅ UX1 — region before the country, "Illinois, United States" (`secondaryLine` in `LocationSearchResults.tsx`); "Namesakes are told apart".
- ✅ UX2 — no region → country alone; "No region without a namesake", `LocationSearchResults.test.tsx`.
- ✅ UX3 — rank then population; "Popular locations before larger cities", "Larger cities first".
- ✅ UX4 — attribution last child of `<main>`; `SettingsPage.test.tsx` "should follow the zone rules release line as the last element of main".
- ✅ M1 — committed file holds 6 102 GeoNames cities (≥ 6 000), enforced by `MIN_CITY_COUNT` in `checkCityData.ts`.
- ✅ M2 — 119.4 KB gzipped recorded in `city-data/README.md`, budget enforced by `check-bundle-size.mjs`.
- ✅ M3 — the 10-row table of "Cities that are not zone cities are found" and "Found in Russian" in `location_search_geonames_cities.feature`.
- ✅ M4 — all zones checked against the release and the Cyrillic share (measured 99.6 % on the committed file) by `checkCityData.ts`.
- ✅ M5 — "No two results look the same" over 13 `SAMPLE_QUERIES` in `location_search_namesakes_unit.feature`.
- ✅ M6 — axe scenarios with regions (`location_search_namesakes_e2e.feature`) and on the settings page (`settings_city_data_attribution_e2e.feature`), two themes each.
- ⚠️ M7 — measured here: every measured file is ≥ 90 %, but `compileCityData.ts` (90.29 %), `download.ts` (90.91 %) and `selectCityNames.ts` (93.55 %) are below the 95 % target, and `createCompositeCitySearch.ts` and `parseGeoNamesCityData.ts` could not be measured in this environment (see Mutation; R6, R2).
- ✅ Scenario: A large city that is not a zone city — compiler keep rule in `compileCityData.test.ts`; committed file holds `[551487, "Kazan", "Казань", "RU", 226, 1243500]`.
- ✅ Scenario: A capital below the population threshold — `compileCityData.test.ts:23` (`PPLC` with population 500 kept).
- ✅ Scenario: A city below the threshold — `compileCityData.test.ts:11` drops 99 999.
- ✅ Scenario: The exemplar city is one record — `compileCityData.test.ts:124-136` (`"Europe/Moscow": 10_381_222`); committed file has the same value and no "Moscow" city.
- ✅ Scenario: Both names — `selectCityNames.test.ts` (Munich / «Мюнхен»); "Found in Russian" finds «Мюнхен».
- ✅ Scenario: No Russian name in GeoNames — `selectCityNames.test.ts` fallback case.
- ✅ Scenario: Historic names are not used — `selectCityNames.test.ts:62` "a historic name is skipped".
- ✅ Scenario: An alias is canonicalized — `compileCityData.test.ts:84` (`Asia/Calcutta` → `Asia/Kolkata`).
- ✅ Scenario: A zone the release does not hold — `compileCityData.test.ts:112`, `compile.test.ts:46` (no write).
- ✅ Scenario: Namesakes carry regions — `compileCityData.test.ts:167-174`, `markNamesakes.test.ts`, `location_search_namesakes_unit.feature` over the committed file.
- ✅ Scenario: The same name in different countries — `compileCityData.test.ts:225-229` (Victoria).
- ✅ Scenario: A unique name — Kazan has no region index in the committed file; "No region without a namesake".
- ⚠️ Scenario: Deterministic output — `compileCityData.test.ts:70` proves it for the pure compiler only; the command injects today's date, so the same dumps compiled on two days differ (R3).
- ⚠️ Scenario: The file records its source — the licence is recorded, but the "dump date" is the compile run's date (`readDumpDate` in `compile.ts`), not the dump's (R3).
- ✅ Scenario: A failed download — `compile.test.ts` "should return non-zero, log the dump and write nothing when a download fails"; `download.test.ts`.
- ✅ Scenario: The build is offline — `zoneDataPlugin.ts` reads the committed file; `src/test/zoneData/zoneDataPlugin.test.ts`.
- ✅ Scenario: The committed file passes — `checkCityData.test.ts` passing case; `check.test.ts`.
- ✅ Scenario: A broken file fails — every table row in `checkCityData.test.ts` / `checkCityData.format.test.ts`.
- ✅ Scenario: A zone removed by a newer release — `checkCityData.test.ts:35-38`, `check.test.ts:41-46`.
- ✅ Scenario: Cities that are not zone cities are found — `location_search_geonames_cities.feature`.
- ✅ Scenario: Found in Russian — `location_search_geonames_cities.feature`.
- ✅ Scenario: A later word of a GeoNames city — `location_search_geonames_cities.feature`.
- ✅ Scenario: An abbreviation still finds zone cities only — `location_search_geonames_cities.feature`.
- ✅ Scenario: Suggestions are unchanged — `location_search_geonames_cities.feature`.
- ✅ Scenario: Namesakes are told apart — `location_search_namesakes_unit.feature`.
- ✅ Scenario: The region in Russian — `location_search_namesakes_unit.feature`.
- ✅ Scenario: No region without a namesake — `location_search_namesakes_unit.feature`.
- ✅ Scenario: No two results look the same — `location_search_namesakes_unit.feature`.
- ✅ Scenario: A city of a zone the installed release lacks — `location_search_geonames_cities.feature`; `geoNamesCitySource.test.ts`.
- ✅ Scenario: A city of a zone the engine rejects — `location_search_geonames_cities.feature`.
- ✅ Scenario: Add a GeoNames city — `location_search_namesakes_unit.feature`.
- ✅ Scenario: Namesakes in the same zone — `location_search_namesakes_unit.feature`, `presentSearchResults.regions.test.ts`.
- ✅ Scenario: A city and the zone city of its zone are different locations — `location_search_namesakes_unit.feature`.
- ✅ Scenario: The region is in the result's name — `location_search_namesakes_e2e.feature`.
- ✅ Scenario: Accessibility check with regions — `location_search_namesakes_e2e.feature` (light, dark).
- ✅ Scenario: No horizontal scrolling with regions — `location_search_namesakes_e2e.feature` (320/375/2560, en/ru).
- ✅ Scenario: Screenshots with regions — `location_search_namesakes_e2e.feature` + eight PNGs.
- ✅ Scenario: Country with several zones — `location_search_by_country.feature` (unchanged).
- ✅ Scenario: Country name in Russian — `location_search_by_country.feature` (unchanged).
- ✅ Scenario: Other cities of the country — `location_search_by_country.feature` + `location_search_by_country.steps.ts`.
- ✅ Scenario: Every zone of a large country stays within the limit — `location_search_by_country.feature`.
- ✅ Scenario: No country names on a legacy engine — `location_search_by_country.feature` (unchanged).
- ✅ Scenario: City search on a legacy engine — `location_search_by_country.feature` (unchanged).
- ✅ Scenario: Abbreviation before city prefix — `location_search_ranking.feature`.
- ✅ Scenario: Ambiguous abbreviation with its pairs — `location_search_by_abbreviation.feature`.
- ✅ Scenario: The matched half of a pair is emphasised — `location_search_by_abbreviation.feature`.
- ✅ Scenario: Russian spelling in the result — `location_search_by_abbreviation.feature`.
- ✅ Scenario: City before country — `location_search_ranking.feature`.
- ✅ Scenario: One entry per zone — `location_search_ranking.feature` (reworded).
- ✅ Scenario: A zone appears once per city — `location_search_ranking.feature`.
- ✅ Scenario: Popular locations before larger cities — `location_search_ranking.feature`.
- ✅ Scenario: Larger cities first — `location_search_ranking.feature`.
- ✅ Scenario: Equal population falls back to the name — `location_search_ranking.feature`.
- ✅ Scenario: Result limit — `location_search_ranking.feature`.
- ✅ Scenario: Query timing — `location_search_performance.feature` (13 queries, no formatter).
- ✅ Scenario: Preparing the data for search — `location_search_performance.feature` via `countPreparationWork`.
- ✅ Scenario: Loading without a query does no search work — `location_search_performance.feature`.
- ✅ Scenario: Data loads only when the search opens — `locations_ui_e2e.feature` (unchanged).
- ✅ Scenario: The Here entry's request is the only one — `locations_ui_e2e.feature:43` "The device time location's request is the only one" (requested exactly 1 time), unchanged, payload adjusted in `locationsE2eHelpers.ts`.
- ✅ Scenario: Bundle budget — `scripts/check-bundle-size.mjs` with `CITY_SEARCH_DATA_BUDGET_KB` (130) and the initial JS budget.
- ✅ Scenario: Abbreviation query within the work bound — `location_search_performance.feature`.
- ✅ Scenario: Added in Russian, shown in English — `locations_city_label_language_unit.feature`.
- ✅ Scenario: Added in English, shown in Russian — `locations_city_label_language_unit.feature`.
- ✅ Scenario: A city that is not the zone city — `locations_city_label_language_unit.feature` + steps.
- ✅ Scenario: Namesakes in one zone read the same — `locations_city_label_language_unit.feature` + steps.
- ✅ Scenario: A switch keeps the stored list — `locations_city_label_language_unit.feature`.
- ✅ Scenario: Stored label until the data is loaded — `locations_city_label_language_unit.feature`.
- ✅ Scenario: Loading fails — `locations_city_label_language_unit.feature`.
- ✅ Scenario: A label the data does not know — `locations_city_label_language_unit.feature`; `createCompositeCitySearch.cityLabel.test.ts`.
- ✅ Scenario: A dialect reads its base language — `locations_city_label_language_unit.feature`.
- ✅ Scenario: Texts that name the city follow — `locations_city_label_language_e2e.feature`.
- ✅ Scenario: Accessible after a switch — `locations_city_label_language_e2e.feature`.
- ✅ Scenario: The attribution in both languages — `settings_city_data_attribution_e2e.feature:6`; `CityDataAttribution.test.tsx`.
- ✅ Scenario: Following the attribution keeps the app — `settings_city_data_attribution_e2e.feature:17`.
- ✅ Scenario: Offline — `settings_city_data_attribution_e2e.feature:29` "The attribution offline".
- ✅ Scenario: Keyboard — `settings_city_data_attribution_e2e.feature:40` "Keyboard order and focus".
- ✅ Scenario: Accessibility check — `settings_city_data_attribution_e2e.feature:49` (both themes).
- ✅ Scenario: Narrow and wide screens — `settings_city_data_attribution_e2e.feature:60` (320/2560 px, en/ru).
- ✅ Scenario: The deploy time in the interface language — `settings_deploy_time_unit.feature` (unchanged).
- ✅ Scenario: The deploy time follows the settings at once — `settings_deploy_time_unit.feature` (unchanged).
- ✅ Scenario: The deploy time is fixed into the build — `settings_deploy_time_unit.feature` (unchanged).
- ✅ Scenario: The deploy time in the icon colour — `settings_deploy_time_e2e.feature` (unchanged).
- ✅ Scenario: The deploy time fits one line — `settings_deploy_time_e2e.feature` (unchanged).
- ✅ Scenario: The deploy time at 320 px — `settings_deploy_time_e2e.feature` (unchanged).
- ✅ Scenario: Only the release line and the attribution follow the deploy time — `settings_deploy_time_unit.feature` + steps; `DeployTime.test.tsx`.
- ✅ Scenario: The line in both languages — `settings_zone_rules_release_unit.feature` (unchanged).
- ✅ Scenario: The line names the active release — `settings_zone_rules_release_unit.feature` (unchanged).
- ✅ Scenario: No active release — `settings_zone_rules_release_unit.feature` reworded ("last line before the city data attribution").
- ✅ Scenario: Plain text in the accent colour — `settings_zone_rules_release_e2e.feature` (unchanged).
- ✅ Scenario: The line fits one line — `settings_zone_rules_release_e2e.feature` (unchanged).
- ✅ Scenario: The line at 320 px — `settings_zone_rules_release_e2e.feature` (unchanged).

## Mutation

Measured with `cd packages/client && npx stryker run --mutate '<files>'`, one run at a time, in the foreground. Scores are from the clear-text table; survivors were read from `reports/mutation/mutation-report.json`.

| File | Score | Survivors / no coverage |
|---|---|---|
| `src/adapters/city-search/cityTextMatching.ts` | 100.00 % | — (73 killed, 1 timeout) |
| `src/adapters/city-search/geoNamesCitySource.ts` | 100.00 % | — |
| `src/presenter/presentSearchResults.ts` | 100.00 % | — |
| `src/views/shared/LocationSearchResults.tsx` | 100.00 % | — |
| `src/app/settings/CityDataAttribution.tsx` | 100.00 % | — |
| `scripts/cityData/check.ts` | 100.00 % | — |
| `scripts/cityData/toServedCityData.ts` | 100.00 % | — |
| `scripts/cityData/serializeCityDataset.ts` | 100.00 % | — |
| `scripts/cityData/checkCityData.ts` | 99.08 % | 2 survived |
| `src/adapters/city-search/fetchCitySearch.ts` | 98.15 % | 1 survived |
| `src/adapters/city-search/zoneCitiesSource.ts` | 97.30 % | 1 survived (l. 75 `if (canonicalZoneId !== undefined)` → `true`) |
| `scripts/cityData/markNamesakes.ts` | 97.14 % | 1 survived |
| `scripts/cityData/compile.ts` | 96.00 % | 1 survived (`recursive: true` of the temp-dir cleanup, l. 100) |
| `scripts/cityData/parseGeoNamesRows.ts` | 95.24 % | 1 survived (l. 98 `isShort` → `true`), 1 no coverage (l. 37 `readColumn` fallback) |
| `scripts/cityData/selectCityNames.ts` | 93.55 % | 2 survived (l. 11, 13: the `NAME_OVERRIDES` data entry → `{}`) |
| `scripts/cityData/download.ts` | 90.91 % | 2 survived (l. 121 `{ encoding: "utf8" }` → `{}` / `""`), 1 no coverage (l. 128 error text) |
| `scripts/cityData/compileCityData.ts` | 90.29 % | 10 survived: l. 61 and 67 (`collectWantedIds` admin1 IDs — R6), l. 107, 138 (`?? []` fallbacks), 159, 171 (×2), 188 |

No measured file is below the 90 % minimum. Survivors remain in four script files: three are below the 95 % target, and `parseGeoNamesRows.ts` is just above it (R2). The `compileCityData.ts` survivors at l. 61/67 expose an untested FR7 path (R6).

Not measured: `src/adapters/city-search/createCompositeCitySearch.ts` and `parseGeoNamesCityData.ts`. Their related tests load the full city data (the initial test run alone takes about 2 min for 5 029 tests, and each mutant runs about 930 tests). In this round a single-file run of `createCompositeCitySearch.ts` ended with `Terminated` (exit 124) at the 590 s foreground limit, with no report written. In the previous round a single-file run of `parseGeoNamesCityData.ts` ended the same way. These two scores must come from a full Stryker run by the user (CLAUDE.md forbids running one here). `scripts/zoneData/loadCitySearchData.ts` and `zoneDataPlugin.ts` were not run either.

## Findings

### R1 — CRITICAL — Settings screenshots not re-approved with the attribution (task 8.3 ticked, not done)
- Location: `packages/client/src/test/features/settings/settings_e2e.feature:95`
- Rule: `.claude/rules/test-planning.md` (visual regression for every UI change); NFR-R2 of the proposal
- Problem: Task 8.3 is ticked, but the "Approved screenshots of the settings" outline (`settings_e2e.feature:91-99`) and the approved-screenshot scenario of `settings_language_e2e.feature:121-126` carry no `@add-geonames-city-source @NFR-R2` tags, and no `__screenshots__/*/Approved-screenshots-of-the-settings-*.png` changed on the branch (last touched by b92d6a2, before this task). The 1024 px light baseline shows nothing between the Language select and the offline notice, where the attribution now renders. The scenarios still pass only because the attribution line is a few hundred pixels, under `SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.025` (`playwright.bdd.config.ts:62`). NFR-R2 says "the approved settings screenshots are re-approved once".
- Impact: The baselines approve a page without the attribution, so a regression that drops, misplaces or restyles the attribution (UX4, NFR-A2) is never caught by the visual check. A task is marked done with its deliverable missing.
- Fix: Add `@add-geonames-city-source @NFR-R2` to both approved-screenshot scenarios. Run them with `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_e2e.feature src/test/features/settings/settings_language_e2e.feature --grep "Approved" --update-snapshots=all`. `all` is needed because the default `changed` mode keeps baselines whose diff stays under the tolerance. Read the 1024 px PNGs to confirm the attribution is the last line, then run once more without the flag. Commit the changed PNGs.
- Fix risk: The re-approved PNGs also take in any other drift under tolerance since the last approval, so check each image by eye. At 375 px the attribution may sit below the 800 px viewport or behind the offline notice, so those PNGs may not change. That is acceptable, because the 1024 px ones show it.
- Status: fixed
- Resolution: Tagged both approved-screenshot scenarios `@add-geonames-city-source @NFR-R2`, re-approved all 12 PNGs with `--update-snapshots=all`, read the 1024 px light one (attribution is the last line) and re-ran the scenarios without the flag: 16 passed (commit 1b17558).

### R2 — CRITICAL — Task 9.2 ticked, but survivors remain and two named files have no score
- Location: `openspec/changes/add-geonames-city-source/tasks.md:66`
- Rule: `.claude/rules/tdd-workflow.md` ("Write additional tests to kill survived mutants … Target mutation score: >=95%. Minimum acceptable: >=90%."); M7 of the proposal
- Problem: Task 9.2 is `[x]`, but it requires "kill survivors and re-run" and "Score ≥ 95% (minimum 90%)" for the files it lists. This review measured `compileCityData.ts` 90.29 % (10 survived), `download.ts` 90.91 % (2 survived, 1 no coverage), `selectCityNames.ts` 93.55 % (2 survived) and `parseGeoNamesRows.ts` 95.24 % (1 survived at l. 98, `isShort` → `true`; 1 no coverage at l. 37, the `?? ""` of `readColumn`). `createCompositeCitySearch.ts` and `parseGeoNamesCityData.ts` have no measured score: scoped runs end at the foreground limit (see Mutation).
- Impact: A ticked task claims a mutation bar that has not been shown. The `compileCityData.ts` l. 61/67 survivors hide a real FR7 regression (R6). The `parseGeoNamesRows.ts` l. 98 survivor lets a parser that marks every alternate name as short pass the suite. The two unmeasured adapter files hold the FR4/FR5/FR6 ranking and the payload parse of FR14.
- Fix: Kill the survivors with tests in `src/test/cityData/`. For `compileCityData.ts` l. 61/67, see R6. For l. 107/138/159/171/188, add one case per branch: an admin1 row and a city without alternate names (l. 107, 138), two cities that match the same zone city where the first one is kept (l. 159), a zone city with an empty country code that is skipped (l. 171), and a zone city without a region that gets no `zoneCityRegions` entry (l. 188). For `parseGeoNamesRows.ts`, add an alternate-name row whose short flag is `0` and assert that `isShort` is `false`, plus a row with fewer columns than the format, which reads the missing column as `""` (l. 37). For `selectCityNames.ts` l. 11/13, assert that the Kazan override gives `"Kazan"`. Then re-run the scoped Stryker command of task 9.2 for these four files. The `download.ts` l. 121 mutants are equivalent (readline decodes UTF-8 by default), so record that in the task note. Until the user's full Stryker run gives scores for `createCompositeCitySearch.ts` and `parseGeoNamesCityData.ts`, untick 9.2 in `tasks.md` and add a note that names those two files and the measured scores.
- Fix risk: Tests only, plus a `tasks.md` checkbox. The new tests reuse the fixtures of `compileCityData.fixtures.ts` and `parseGeoNamesRows.test.ts`. An unticked 9.2 blocks archiving until the full run is shared, which is the intended effect.
- Status: fixed
- Resolution: Survivors killed by tests: compileCityData.wanted.test.ts, parseGeoNamesRows.test.ts (flags 0), selectCityNames.test.ts (Kazan), download.test.ts. Scoped Stryker: compileCityData 97.09, parseGeoNamesRows 97.62, selectCityNames 100, download 92.00; the rest are equivalent (readline UTF-8 default, unreachable `?? ""`/`?? []`). tasks.md and the two unmeasured adapter files stay as is: this stage may not edit tasks.md, and CLAUDE.md forbids a full Stryker run, so those scores need the user full run.

### R3 — WARNING — Compile command records the run date as the dump date
- Location: `packages/client/scripts/cityData/compile.ts:50`
- Rule: `city-data` spec "Compiled once, committed, no network at build time" (scenarios "Deterministic output", "The file records its source"); FR12
- Problem: `readDumpDate()` returns `Temporal.Now.plainDateISO("UTC")`, the day the command runs, and `runCityDataCompile` writes it as `source.dumpDate`. The spec requires the file to record "the date of the dump" and "Compiling the same dumps twice MUST give byte-identical files". `compileCityData.test.ts:70` checks determinism only for the pure compiler with a fixed `dumpDate`. `compile.test.ts:17` only checks the date's shape.
- Impact: The same dumps compiled on two days give two files that differ in `dumpDate`. A dump fetched late on one UTC day and compiled after midnight is dated wrongly. The README and the in-file record can then name a dump date that never existed, which is a CC BY provenance record.
- Fix: Derive the date from the dump, not the clock, through the dependencies task 2.7 already fixes (`{ runProcess, fetchDump, readFile, writeFile, log }`), so that no dependency is added. In `download.ts`, after the cities archive is fetched, run `runProcess(UNZIP_COMMAND, ["-Z", "-T", citiesArchivePath, "cities15000.txt"])` (Info-ZIP zipinfo mode; `-T` prints the entry time as `yyyymmdd.hhmmss`). Parse the date part into a `Temporal.PlainDate`, return it with the paths, and pass it as `dumpDate` in `runCityDataCompile` instead of `readDumpDate()`. Fail with the dump name on a non-zero exit or an unparsable listing. Put the flags and the entry name in `scripts/cityData/constants.ts`. In `download.test.ts` / `compile.test.ts`, stub the listing and assert that `dumpDate` equals its date. Also add a failing-listing case that writes nothing.
- Fix risk: The zip entry time has no zone, so it is the GeoNames server's local date. Take only the date part and do not convert it. Every `runProcess` fake in `src/test/cityData/compileWorld.ts` and in `compile.test.ts` must answer the extra listing call, or the existing success cases fail. The committed file keeps `2026-11-14` until the next `city-data:compile` run (see R4).
- Status: fixed
- Resolution: download.ts now reads the dump date from `unzip -Z -T` of the cities archive and compile.ts passes it as dumpDate; download.test.ts covers the date, a failing listing, an unparsable listing and an impossible date, compile.test.ts asserts dumpDate equals the listing date (commit d3eb92e).

### R4 — WARNING — Committed city data is biome-formatted, not the one-city-per-line output of `city-data:compile`
- Location: `packages/client/city-data/geonames-cities.json:429`
- Rule: design D5 ("Committed file `packages/client/city-data/geonames-cities.json` (compact, one city per line so diffs are reviewable)"); G5 of the proposal ("one maintainer command and one reviewable commit"); FR12
- Problem: `serializeCityDataset` (`scripts/cityData/serializeCityDataset.ts:8-21`) writes the D5 form: compact header lines and one city per line. Biome (`biome check .`, the `lint` script) rejects that form. Commit 5d4b6b7 "Format the compiled city data for the linter" therefore ran the formatter over the committed file, which is now 7 509 lines: every zone is on its own line, and 109 city tuples that exceed 80 columns are split over several lines (for example l. 429-436 for ID 99071; `grep -cE '^\s+\[\s*$'` prints 109). Checked in this round: the output of commit c71c8d5 (6 112 lines, one city per line) parses to the same JSON as the committed file, and piped through `biome format` it is byte-identical to it. `packages/client/biome.json` already excludes the other generated data file: `"includes": ["**", "!zone-rules/release.json"]`.
- Impact: The committed file breaks D5. A city whose line length crosses 80 columns after a refresh turns from one line into eight, so the data diff is not reviewable per city. The next maintainer who runs `city-data:compile` gets a whole-file rewrite back to the D5 form, and `pnpm run lint` then fails. The README "Refresh" section mentions no format step.
- Fix: Follow the `zone-rules/release.json` precedent. Change `packages/client/biome.json` to `"includes": ["**", "!zone-rules/release.json", "!city-data/geonames-cities.json"]`. Restore the command's own output with `git checkout c71c8d5 -- packages/client/city-data/geonames-cities.json`; it holds the same data as the committed file, only unformatted. If R3 is fixed in the same round, run `pnpm --filter @time-zones/client city-data:compile` once instead, as task 2.8 says, so that the file also records the dump's date. Re-measure the gzipped size and update `city-data/README.md`. Then `pnpm run lint` and `pnpm --filter @time-zones/client city-data:check` must pass. `serializeCityDataset` and the compile command do not change.
- Fix risk: Biome no longer checks the file, but `city-data:check` still validates its JSON and content, and `check.test.ts` / `checkCityData.test.ts` still read it. A fresh `city-data:compile` run needs the network and may yield a newer dump: per task 2.8, recheck the README counts and the Springfield, Kazan, Astana and Shymkent facts the scenarios use. The restored file has the same data, so the README counts stay valid, but its byte size changes.
- Status: fixed
- Resolution: Ran `pnpm --filter @time-zones/client city-data:compile` for real (6 102 cities, dump 2026-11-14 from the archive); the file is the command one-city-per-line output, biome.json excludes it like zone-rules/release.json, README size updated; lint and city-data:check pass. Committed together with R3 in d3eb92e.

### R5 — WARNING — Served city data format contradicts design D5 and task 3.2
- Location: `packages/client/scripts/cityData/toServedCityData.ts:23`
- Rule: `.claude/rules/design-decisions.md` (decisions in `design.md` describe what is built); `.claude/rules/process-invariants.md` (archived changes are immutable)
- Problem: Design D5 says "The served search data file is `{ "zoneCities": [...], "cityData": <the committed object without "source"> }`", and task 3.2 repeats it. The implementation (commit b3695ee) serves a different shape: `toServedCityData` turns the tuples into `columns` (`idDifferences`, `englishNames`, …, `regionIndexes` with `-1` for none), and `parseGeoNamesCityData.ts` reads that form. `design.md` was not updated: it has no mention of columns, and its "about 116 KB" estimate refers to the tuple form, which the README measures at 148 884 bytes gzipped for the committed file alone, over the 130 KB budget.
- Impact: Once the change is archived, its design is immutable and describes a wire format that does not exist. It also claims the tuple form fits the budget when it does not. A later change that follows D5 (for example, serving the committed object directly) would break `parseGeoNamesCityData` and exceed NFR-P1.
- Fix: Before archiving, update D5 in `openspec/changes/add-geonames-city-source/design.md`. Describe the served columnar form (ID differences, `-1` for no region, `0` for a Russian name equal to the English one), give the reason (the tuple form measured 148.9 KB gzipped, the columns 119.4 KB for the whole file), and add the rejected tuple form to "Alternatives Considered". Also align the JSDoc in `parseGeoNamesCityData.ts`, which still says "the city tuples".
- Fix risk: none — documentation only; no code or test changes.
- Status: rejected (contradicts-spec)
- Resolution: The fix edits design.md, which this stage must not touch (fix-code instructions: design.md, tasks.md and specs stay untouched). The JSDoc of parseGeoNamesCityData.ts already describes the served columns, so nothing in packages/client needs changing; the design update belongs to a new change.

### R6 — WARNING — `collectWantedIds` is untested, so losing the Russian region names goes unnoticed
- Location: `packages/client/scripts/cityData/compileCityData.ts:56`
- Rule: `.claude/rules/tdd-workflow.md` ("Analyze survived mutants — each survivor indicates a missed scenario"); FR7 of the proposal
- Problem: No test calls `collectWantedIds` (`grep -rn collectWantedIds src/test` finds nothing), and `compile.test.ts` never gives a city an admin1 division. Stryker confirms it: the mutants `admin1Rows.map(...)` → `[]` (l. 61) and `if (admin1Id !== undefined)` → `true` / `false` / `===` (l. 67) all survive. `runCityDataCompile` uses this set to decide which alternate-name rows to keep, and `readRegionNames` reads the Russian region name from those rows.
- Impact: If the admin1 IDs leave the wanted set (the surviving mutants), `readSelectedAlternateNames` drops the admin1 alternate names. Every region then falls back to its English name, so the Russian interface shows the region "Illinois" instead of «Иллинойс», against FR7 ("in the interface language"). `city-data:check` only checks that region names are non-empty, so no test and no check would fail.
- Fix: Add cases to `src/test/cityData/compileCityData.test.ts`. `collectWantedIds` returns the ID of a selected city plus the GeoNames ID of its admin1 row (matched by `<country>.<admin1Code>`). It does not return the admin1 ID of a city below the threshold. A city whose admin1 key has no row adds only its own ID. Re-run `npx stryker run --mutate 'scripts/cityData/compileCityData.ts'` and confirm l. 61 and 67 are killed.
- Fix risk: none. Tests only, with existing fixtures (`cityRow`, `ADMIN1_ROWS` of `compileCityData.fixtures.ts`).
- Status: fixed
- Resolution: Added compileCityData.wanted.test.ts cases for collectWantedIds (city plus admin1 ID, below threshold, missing admin1 row); Stryker now kills l. 61/67 (commit 09bd0d0).

## Verdict

Not ready: R1 and R2 (CRITICAL) block. Fix the warnings R3, R4, R5 and R6 in the same round.
