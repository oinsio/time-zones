# Specs review: add-geonames-city-source

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 43/45 |
| Contradictions | 1 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Freshness

- ❌ `design.md:247` (D7) and `tasks.md:31` (task 4.3) say `createZoneCitiesSource(zoneCities, cityData = EMPTY_GEONAMES_CITY_DATA)` keeps "its existing callers compile unchanged". In the code the second parameter already exists and means something else: `createZoneCitiesSource(zoneCities, listTimeZones: ListTimeZones = listKnownZones)` (`packages/client/src/adapters/city-search/zoneCitiesSource.ts:102-104`). Tests pass a zone lister there, e.g. `zoneCitiesSource.test.ts:9` `createZoneCitiesSource([moscow, almaty], () => [...])`, `zoneCitiesSource.matching.test.ts:15,64,74,98,115,120,127` and `abbreviationSource.test.ts:29`.
- ✅ `createCompositeCitySearch(zoneCityRecords)` takes one parameter today and removes duplicates per zone with `keepFirstResultPerZone` keyed by `record.timeZoneId` (`createCompositeCitySearch.ts:31-41,51-53`). `getExemplarCity` and `getCityLabel` look a record up by zone ID (`:83-91`).
- ✅ `CityRecord.id` is the zone ID (`zoneCitiesSource.ts:76`, `buildRecord` at lines 68–81 as task 4.1 says). `CityRecord` has no `population` or `region` (`src/ports/citySearch.ts`).
- ✅ The contract check "`id` equals `timeZoneId`" is at `citySource.contract.ts:23-24`.
- ✅ Country texts build one `Intl.DisplayNames` per record and language (`zoneCitiesSource.ts:84-93`), and searchable texts are built eagerly when the source is built (`:110-116`), as design D6 says ("today: one formatter per record and language").
- ✅ `normalizeSearchText` / `splitIntoWords` live in `src/adapters/city-search/normalizeSearchText.ts`. That module's `index.ts` exports without extensions, and `src/locales/filterLocales.ts:1` and `src/controller/useCitySearch.ts:5` import them through `@/adapters` (design D11).
- ✅ `src/lib/zoneRules/core/index.ts` is the Node-safe index with `.ts` exports, imported by `scripts/zoneData/extractZoneData.ts:6`. It exports `parseZoneRulesRelease` (line 40).
- ✅ `extractZoneData` returns `{ zoneCities, timeZoneAliases }`, and its aliases map to IANA-canonical IDs (`entry._iana ?? cldrZoneId`, `extractZoneData.ts:111-147`).
- ✅ `scripts/zoneRules/compile.ts` / `check.ts` are shaped as tasks 2.7/3.1 describe: exported `runZoneRulesCompile` / `runZoneRulesCheck` and a guarded `process.argv[1] === fileURLToPath(import.meta.url)` block between `// Stryker disable all` and `// Stryker restore all`. `scripts/zoneRules/runChildProcess.ts` exists. `src/test/zoneRules/compileFakes.ts`, `compile.valid.test.ts` and `check.test.ts` exist.
- ✅ `scripts/check-bundle-size.mjs:43` holds the script-local `CITY_SEARCH_DATA_BUDGET_KB = 30` and imports `ZONE_RULES_ASSET_BUDGET_KB` from `app.config.ts` (`:21`, `app.config.ts:59`). `ZONE_RULES_RELEASE_FILE` is at `app.config.ts:66`.
- ✅ Vitest collects only `src/**/*.{test,steps}.{ts,tsx}` (`vitest.config.ts:21`). `tsconfig.node.json` includes `scripts` with `allowImportingTsExtensions`.
- ✅ `virtual:zone-cities` has only a default export (`src/vite-env.d.ts:16-24`). It has about 20 importers (21 source files plus the declaration), and nothing tests `zoneDataPlugin` yet (no `src/test/zoneData/`).
- ✅ The callers and line numbers of task 4.6 are correct: `searchWorld.ts:8,11`, `location_search_by_name.steps.ts:108`, `locations_city_label_language_unit.steps.tsx:185`, `locations_city_label_budget_unit.steps.tsx:51`, `cityLabels.bench.ts:17`. The bare-array callers it lists also exist.
- ✅ Task 4.1 names every `CityRecord` literal outside the adapter: `src/ports/citySearch.test.ts:5`, `src/presenter/presentSearchResults.test.ts:13,40` and `app_shell_dialect_intl_unit.steps.ts`.
- ✅ The `stubZoneCitiesFetch` users are the `AppShell.*`, `ViewLocationList.*` and `CardsView.home` tests, `settingsLanguageWorld.tsx` and `deviceTimeWorld.tsx`, as task 4.2 says.
- ✅ `LocationSearchResults.tsx:54` keys options by `${result.timeZoneId}-${result.cityName}`. `LocationSearchResults.test.tsx` does not exist, `locationSearchDialogFixtures.tsx` exists, and there is no Storybook (`package.json`).
- ✅ `presentSearchResults` marks `isAdded` by zone plus `isCityNameOfRecord` (`presentSearchResults.ts:57-60`).
- ✅ The settings tests that task 7.2 updates assert today that the release line or the deploy time is last: `DeployTime.test.tsx:47-52`, `ZoneRulesReleaseLine.test.tsx:61`, `settings_zone_rules_release_unit.steps.tsx:106-109`. No E2E step asserts a last line.
- ✅ The Gnomish Factory credit stands above the theme group (stable `settings` "Gnomish Factory credit"), so an attribution as the last line conflicts with no stable requirement.
- ✅ The approved screenshots that task 8.3 re-runs exist: `settings_e2e.feature:95`, `settings_language_e2e.feature:121`, and the `locations_ui_e2e.feature:159` outline with `suggestions` / `IST results` rows.
- ✅ `docs/architecture/domain-model.md:133` reads "City search data — `CitySearch` port and its adapter.", and `docs/architecture/overview.md:83` lists `lib/zoneRules/`.
- ✅ `docs/glossary/search.md` has none of the five new terms yet. **City label** is in `docs/glossary/locations.md:8`.
- ✅ Every MODIFIED requirement exists in `openspec/specs/` under the same name, with the text the delta changes: `location-search` "Search by country", "Result order and content", "Search is fast and lazy" (30 KB, 10 sample queries); `locations` "City label in the interface language"; `settings` "Deploy time", "Zone rules release line".
- ✅ Nothing is implemented yet: no `openspec/specs/city-data/`, no `scripts/cityData/`, no GeoNames code, and no archived change covers it. `openspec/changes/` holds only this change (proposal line 3).
- ✅ ADR-0006 (Accepted) says the composite adapter "removes duplicates by canonical `timeZoneId` and name" and "ranks by match quality, then by `rank`", as `design.md:171` quotes. Its record format already has `region?`.
- ✅ `.github/workflows/ci.yml:43` has the `pnpm test` step that the H2 patch inserts before. `README.md:288` and `README.ru.md:288` have the licence sections that H3 edits.
- ✅ `src/test/workCounters.ts` exposes `displayNames()` and `normalizations()`. `searchWorld.ts:36-47` has 10 `SAMPLE_QUERIES`, checked by `toHaveLength(sampleCount)` in `location_search_performance.steps.ts:26`. `benchBudgets.test.ts:2` spawns `node` with `execFileSync`.
- ✅ The project's URL constants live in `src/constants/api.ts` (`GNOMISH_FACTORY_LANDING_URL`), where `GEONAMES_URL` fits (task 7.1).
- ✅ JSON assets are precached by the service worker (`vite.config.ts:74`), so the "offline, visited before" row of the UI States Matrix holds.

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ city-data "Cities of the city data" | ✅ 2.6, 3.1 |
| FR2 | ✅ | ✅ city-data "City names in English and Russian" | ✅ 2.4, 3.1 |
| FR3 | ✅ | ✅ location-search "Search finds GeoNames cities" | ✅ 4.4, 6.1 |
| FR4 | ✅ | ✅ "Result order and content" (A zone appears once per city) | ✅ 4.5, 6.2 |
| FR5 | ✅ | ✅ "Result order and content" | ✅ 4.5, 6.2 |
| FR6 | ✅ | ✅ "Search by country" | ✅ 4.5, 6.2 |
| FR7 | ✅ | ✅ city-data "Regions of namesakes", location-search "Region of a namesake" | ✅ 2.5, 5.1, 5.2, 6.4 |
| FR8 | ✅ | ✅ "Namesakes in one zone are one location" | ✅ 5.1, 6.4 |
| FR9 | ✅ | ✅ locations "City label in the interface language" | ✅ 4.5, 6.6 |
| FR10 | ✅ | ✅ "Search finds GeoNames cities" (abbreviation, suggestions) | ✅ 4.5 (exemplar), 6.1 |
| FR11 | ✅ | ✅ city-data "Zones of the city data", location-search "Cities offered come from the release" | ✅ 2.6, 3.1, 4.4, 6.1 |
| FR12 | ✅ | ❌ the "or its size budget" clause has no scenario (see R3) | ✅ 2.7, 2.8, 3.1, 10.2 |
| FR13 | ✅ | ✅ settings "City data attribution" | ✅ 7.1, 7.2, 8.2, 2.8, 10.3 |
| FR14 | ✅ | ✅ "Search is fast and lazy" (one file, one request) | ✅ 4.2, 8.4 |
| NFR-P1 | ✅ | ✅ "Search is fast and lazy" / Bundle budget | ✅ 3.3, 9.4 |
| NFR-P2 | ✅ | ✅ Query timing, Preparing the data for search | ✅ 6.3, 6.5 |
| NFR-P3 | ✅ | ❌ "Asking for one city label SHALL NOT scan every city record" has no scenario (see R3) | ✅ 4.5, 6.5 |
| NFR-P4 | ✅ | ✅ "Search is fast and lazy" (50 ms benchmark) | ✅ 6.7 |
| NFR-A1 | ✅ | ✅ "Region in results is accessible and fits" | ✅ 5.2, 8.1 |
| NFR-A2 | ✅ | ✅ settings "Accessible and responsive attribution" | ✅ 7.2, 8.2 |
| NFR-R1 | ✅ | ✅ "Region in results is accessible and fits" | ✅ 8.1 |
| NFR-R2 | ✅ | ✅ "Accessible and responsive attribution" | ✅ 8.2, 8.3 |
| UX1 | ✅ | ✅ "Region of a namesake" | ✅ 5.2, 6.4 |
| UX2 | ✅ | ✅ "Region of a namesake" (No region without a namesake) | ✅ 5.2, 6.4 |
| UX3 | ✅ | ✅ "Result order and content" | ✅ 6.2 |
| UX4 | ✅ | ✅ settings "City data attribution", modified "Deploy time" / "Zone rules release line" | ✅ 7.2, 8.2 |
| M1 | ✅ | ✅ city-data "The committed city data is checked" | ✅ 3.1, 2.8 |
| M2 | ✅ | ✅ Bundle budget | ✅ 3.3, 9.4 |
| M3 | ✅ | ✅ "Cities that are not zone cities are found" | ✅ 6.1 |
| M4 | ✅ | ✅ city-data "The committed city data is checked" | ✅ 3.1 |
| M5 | ✅ | ✅ "No two results look the same" | ✅ 6.4 |
| M6 | ✅ | ✅ accessibility scenarios in location-search and settings | ✅ 8.1, 8.2 |
| M7 | ✅ | n/a | ✅ 9.2 |
| G1 | ✅ | n/a — met by FR1, FR2, FR3, M3 | n/a |
| G2 | ✅ | n/a — met by FR5, UX3 | n/a |
| G3 | ✅ | n/a — met by FR7, UX1, M5 | n/a |
| G4 | ✅ | n/a — met by NFR-P1, FR14, M2 | n/a |
| G5 | ✅ | n/a — met by FR12 | n/a |
| NG1 | ✅ | n/a — no artifact adds cities below 100 000 | n/a |
| NG2 | ✅ | n/a — matching stays prefix-based (FR3) | n/a |
| NG3 | ✅ | n/a — only `en`/`ru` names | n/a |
| NG4 | ✅ | n/a — no artifact stores a region or GeoNames ID in a location | n/a |
| NG5 | ✅ | n/a — FR10 keeps them on zone cities | n/a |
| NG6 | ✅ | n/a — no scheduled workflow; H2 adds only a check step | n/a |
| NG7 | ✅ | n/a — no coordinate lookup | n/a |

## Consistency

- `proposal.md:91` (FR12) says the check command "SHALL fail when the committed file breaks FR1, FR2, FR11, its format or its size budget". The `city-data` requirement "The committed city data is checked" (`specs/city-data/spec.md:100`) and task 3.1 (`tasks.md:23`) list format, rules, count and Cyrillic share, with no size budget.

## Findings

### R1 — WARNING — The planned `createZoneCitiesSource` signature collides with its existing second parameter
- Location: `openspec/changes/add-geonames-city-source/design.md:247`, `openspec/changes/add-geonames-city-source/tasks.md:31`
- Rule: `.claude/rules/tdd-workflow.md` (characterization first: existing tests must keep passing)
- Problem: Design D7 and task 4.3 set the signature to `createZoneCitiesSource(zoneCities, cityData = EMPTY_GEONAMES_CITY_DATA)` and claim "its existing callers compile unchanged". But the function already has a second parameter, `listTimeZones: ListTimeZones = listKnownZones` (`packages/client/src/adapters/city-search/zoneCitiesSource.ts:102-104`). About 20 test calls inject a zone lister through it (`zoneCitiesSource.test.ts:9,26,34,44,51,56,70,85,93,105,107,117`, `zoneCitiesSource.matching.test.ts:15,64,74,98,115,120`, `abbreviationSource.test.ts:29`). Design D6 also says the GeoNames source reuses `listKnownZones`, which is a module-private `const` (`zoneCitiesSource.ts:29`), not an export.
- Impact: Task 4.3 as written replaces the zone-lister parameter with `cityData`. Every call that passes `() => [...]` stops type-checking, and the seam that the FR9-of-add-zone-rules-from-iana tests use to fake the installed release disappears. The implementer has to redesign the signature mid-task, against a design that says nothing changes for callers. The characterization run of `zoneCitiesSource.matching.test.ts` in the same task then fails.
- Fix: In design D7 (third bullet) and task 4.3, make the signature `createZoneCitiesSource(zoneCities, listTimeZones = listKnownZones, cityData = EMPTY_GEONAMES_CITY_DATA)`. Say that `createCompositeCitySearch` passes `undefined` for the lister (keeping the default) and the parsed `cityData`. In design D6 and task 4.4, have `createGeoNamesCitySource(cityData, listTimeZones = listKnownZones)` take the same exported `ListTimeZones` default, and export `listKnownZones` from `zoneCitiesSource.ts` (or move it to `cityTextMatching.ts`). Task 4.4's "skips cities whose zone is not in the listed zones" test then injects the lister the same way the zone-cities tests do.
- Fix risk: Passing `undefined` positionally to reach a default is slightly awkward. An options object would read better but would touch all the call sites listed above, so it costs more. No other artifact depends on the two-parameter form.
- Status: open

### R2 — WARNING — The new "city data attribution" concept has no glossary entry, and the settings glossary entries are not updated
- Location: `openspec/changes/add-geonames-city-source/proposal.md:18-24`, `openspec/changes/add-geonames-city-source/tasks.md:7`
- Rule: `.claude/rules/glossary.md` ("A change that introduces a new domain concept adds its glossary entry in the same change … list new or changed terms in `proposal.md` … add a task for the glossary entries in `tasks.md`")
- Problem: The settings delta names a new concept, "the city data attribution" (`specs/settings/spec.md:5,47,104`), and tasks 7.1/7.2 create `CityDataAttribution` and `settings.cityDataAttribution`. The proposal's glossary list and task 1.1 cover only `docs/glossary/search.md` and `locations.md`. `docs/glossary/settings.md` keeps **Settings page** listing its contents up to "the zone rules release line" (line 5) and **Deploy time** "followed by the zone rules release line" (line 11). It gets no **City data attribution** entry (*Code:*, *RU:*).
- Impact: The change ships a domain name, a component and an i18n key with no glossary owner. The settings glossary then describes the page without its last line. The next change that touches the settings page has no term to reuse, and the Russian wording «Данные о городах» is not pinned as the *RU:* name (`.claude/rules/i18n.md`).
- Fix: Add to `proposal.md` "What Changes" a new term **City data attribution** in `docs/glossary/settings.md`, with changed terms **Settings page** (ends with the attribution) and **Deploy time** (followed by the release line, then the attribution). Extend task 1.1 (or add 1.3) to write them: *Code:* `CityDataAttribution`, `settings.cityDataAttribution`, `GEONAMES_URL`; *RU:* «Данные о городах: GeoNames, CC BY 4.0». Verify with `grep -n "City data attribution" docs/glossary/settings.md`.
- Fix risk: none. It is a docs-only edit under `docs/glossary/`, which the implement stage may write.
- Status: open

### R3 — WARNING — Two requirement clauses have no scenario and no test: FR12's size budget and NFR-P3's "no full scan"
- Location: `openspec/changes/add-geonames-city-source/proposal.md:91`, `openspec/changes/add-geonames-city-source/proposal.md:101`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: FR12 requires the check command to fail when the committed file breaks "its size budget". Neither the `city-data` requirement "The committed city data is checked" (`specs/city-data/spec.md:100-118`) nor task 3.1 defines that budget or tests it. NFR-P3's second sentence, "Asking for one city label SHALL NOT scan every city record", appears in no spec requirement or scenario: "Search is fast and lazy" (`specs/location-search/spec.md:221`) restates only "MUST normalize no text". No task tests it either; task 4.5 only builds the zone → records map.
- Impact: As written, `city-data:check` will not check any size, so FR12 is implemented only in part. The NFR-P3 scan bound has no blocking check, so a regression to a linear scan in `getCityLabel` passes every test. Task 9.3's traceability grep cannot show coverage for either clause.
- Fix: In `proposal.md` FR12, drop "or its size budget". The served file's size is NFR-P1, checked by `check:bundle-size` (tasks 3.3, 9.4). In NFR-P3, drop the second sentence and keep it as the rationale it already is in design D7 ("NFR-P3: one zone's records are scanned, never all"). If the bound should stay a requirement instead, add a unit test to task 4.5 (`createCompositeCitySearch.cityLabel.test.ts`) that builds the search over `cityData` with a large synthetic zone and asserts the lookup reads only that zone's records (for example through a counted `isCityNameOfRecord` spy), and add a matching scenario to "Search is fast and lazy".
- Fix risk: Dropping the clauses removes two promises the proposal made. Neither is a user-visible behaviour, and both stay enforced or recorded elsewhere (NFR-P1, design D7). The test alternative adds work to task 4.5 and needs a spy seam in the composite adapter.
- Status: open

### R4 — SUGGESTION — Task 4.2 renames `parseZoneCityRecords` without naming its re-export in the module index
- Location: `openspec/changes/add-geonames-city-source/tasks.md:30`
- Rule: `.claude/rules/process-invariants.md` (imports only through `index.ts`)
- Problem: Task 4.2 and design D5 rename `parseZoneCityRecords` to `parseCitySearchData`. The public index `packages/client/src/adapters/city-search/index.ts:4-7` re-exports `parseZoneCityRecords` by name, and the task does not mention updating it.
- Impact: The `typecheck` step of task 4.2 fails on the stale re-export until the implementer finds it. It costs one extra round, not a wrong build.
- Fix: Add to task 4.2: "update the re-export in `src/adapters/city-search/index.ts` to `parseCitySearchData` (no other module imports the old name)".
- Fix risk: none. `grep` finds no other importer of `parseZoneCityRecords` outside `fetchCitySearch.ts` and the index.
- Status: open

## Verdict

Needs revision. No CRITICAL finding. Blocking ids: R1, R2 and R3 (WARNING) should be fixed before implementing. R1 most of all: as written, task 4.3 cannot keep the existing callers compiling. R4 is optional polish.
