# Specs review: show-city-labels-in-interface-language

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 24/24 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 2 |

## Freshness

- ✅ `Location.label` comes from the search result's `cityName` on add (design.md:7): `views/shared/LocationSearch.tsx:42` passes `label: result.cityName`; the ID is `buildLocationId(timeZoneId, label)` (`model/locationId.ts:6`).
- ✅ `presentLocationRows` shows the stored `label` for every city location (proposal.md:7, design.md:8): `presenter/presentLocationRows.ts` sets `cityLabel` to `location.label` unless the location is the device time location, and passes it to `presentZoneMoment`.
- ✅ Every view text that names the city reads `row.cityLabel` (design.md:8): `views/shared/LocationRow.tsx:153,159,185`, `views/shared/ZoneRowContent.tsx:61,109`, `views/shared/useReorderAnnouncements.ts:27`, `views/cards/CardsView.tsx:56,67` (removal, home), `presenter/presentZoneMoment.ts:133-134` (`wallTimeInputLabel`). Outside tests, `location.label` is read only by `presenter/presentLocationRows.ts:62` (the `cityLabel` fallback), `presenter/presentSearchResults.ts:45` (`isAdded`) and the serializer `adapters/locationsDocument.ts:50`.
- ✅ `parseZoneCityRecords` rejects a record without both `en` and `ru` (design.md:9): `adapters/city-search/fetchCitySearch.ts` `isZoneCityData` checks `names.en` and `names.ru`.
- ✅ `presentSearchResults`' `isAdded` uses `Object.values(record.names).includes(location.label)` (design.md:10): `presenter/presentSearchResults.ts:42-46`.
- ✅ `resolveCityNameLanguage` and `resolveLanguageFallbacks` own the order code → base language → English, and `useActiveInterfaceLanguage()` exposes `cityNameLanguage` (design.md:11): `locales/languageFallbacks.ts:15-49`, `controller/useActiveInterfaceLanguage.ts:24-31`; both exported from `locales/index.ts`.
- ✅ Only `useExemplarCity` and `useCitySearch` start a load through `loadCitySearchOnce` / `readLoadedCitySearch` (design.md:12): `controller/useExemplarCity.ts:24-27`, `controller/useCitySearch.ts:46`, `controller/cityDataCache.ts`.
- ✅ The `Intl` call points named in design.md:13 take the interface language code: `presenter/countryName.ts:12` (`new Intl.DisplayNames(language, …)`), `presenter/dateTimeFormatters.ts:60`, `presenter/dateBar.ts:59,66,70` (three `toLocaleString`), `presenter/calendarMonth.ts:77,81,87,96` (four). A tree-wide grep finds no other `Intl`/`toLocaleString` call with the interface language.
- ✅ The caches are `displayNamesByLanguage` and `formattersByKey` (design.md:61): `presenter/countryName.ts:4`, `presenter/dateTimeFormatters.ts:36`.
- ✅ `createCompositeCitySearch` holds `recordsById` keyed by `record.id` and is the only `CitySearch` implementation (design.md:41-42): `adapters/city-search/createCompositeCitySearch.ts:54-56`; a grep for `getExemplarCity` implementers finds only it.
- ✅ The shared contract `describeCitySearchContract` in `adapters/city-search/citySearch.contract.ts` is run by `createCompositeCitySearch.exemplarCity.test.ts` (design.md:42): `createCompositeCitySearch.exemplarCity.test.ts:3,6`.
- ✅ The service worker precaches `json` (design.md:84): `packages/client/vite.config.ts:63` `globPatterns: ["**/*.{js,mjs,css,html,ico,png,svg,json,woff2}"]`.
- ✅ The test helpers named in tasks.md exist: `buildRegisteredLocale` and `DIALECT_REGISTRY` (`test/factories/localeFixtures.ts:4,30`), `buildBudgetLocations` (`test/features/locations/steps/rowBudgetWorld.ts:24`), `startWorkCount` (`test/workCounters.ts:33`), `KNOWN_CITIES` (`locationsE2eHelpers.ts:19`), "the locations screen has no accessibility violations" (`locations_view_a11y_e2e.steps.ts:34`), `Given the stored list is empty` (`locations_view_contract_e2e.steps.ts:156`), `rowPresenting.bench.ts`, `scripts/check-bench-budgets.mjs`, `check-legacy-build.mjs`, `check-bundle-size.mjs`, the `bench`/`typecheck`/`lint`/`test:bdd` scripts of `@time-zones/client`.
- ✅ The scenarios D6 rewrites exist as described: `locations_device_time_data_unit.feature:26-30` ("No load without the device time location", `the list is "Almaty"`), `locations_ui_e2e.feature:33-38` and `locations_search_shortcut_e2e.feature:20-24` (`Given the stored locations are "Almaty"`), `settings_language_unit.feature:14` ("keeps its city label"). The cache that shares one load drops a rejected load, so the next call loads again: `controller/cityDataCache.ts:21-24`.
- ✅ The MODIFIED requirements are restated from `openspec/specs/`: "List in the Cards view" (`locations/spec.md:74`), "Exemplar city of the device time location" (`locations/spec.md:1089`), "Search is fast and lazy" (`location-search/spec.md:162`), "Open the search with the slash key" (`location-search/spec.md:225`), "Interface language choice" (`settings/spec.md:402`), "Dialect fallback" (`app-shell/spec.md:218`); a diff of each block shows only the edits the proposal declares.
- ✅ A locale list passes through the iOS 12 path (design.md:15, ADR-0009): the legacy zone shim's constructor takes `locales?: string | string[]` and forwards it unchanged (`lib/legacy/zoneShim.ts:44-49`).
- ✅ D3's choice of the city name in a controller hook has a precedent that ADR-0002 already lives with: `useExemplarCity` picks `getExemplarCity(timeZoneId, cityNameLanguage)` in the controller (`controller/useExemplarCity.ts:19,31-34`) and passes the result to the presenter as `deviceTimeCityLabel` (`controller/useLocations.ts:53-55,70,81`); `useCityLabels` follows the same shape.
- ✅ Nothing is already implemented: no `getCityLabel`, `isCityNameOfRecord` or `useCityLabels` in `packages/client/src`, and no archived change localizes stored city labels.
- ❌ D6 claims to list the tests that encode the old rule (design.md:67-73), but five more scenarios store a city label in another language than the interface, let the zone cities data load, and then find the row by its stored label; under FR1 that row reads the localized name once the data is loaded. E2E (the data really loads in the background, FR4): `home_location/home_location_e2e.feature:42-48` (Russian, stored "Almaty", "Moscow"; `the location menu named "Действия: Moscow"`, `the row of "Almaty"`), `locations/locations_clock_change_note_e2e.feature:43-57` (Russian, stored "Almaty", "Belgrade", "Lord Howe Island"; `the clock change note of "<city>"` with `Belgrade` / `Lord Howe Island`), `time_selection/time_selection_card_layout_e2e.feature:82-89` (Russian, stored "Москва", "Kolkata"; `the hour labels of "Москва", "Kolkata"`), `locations/locations_device_time_e2e.feature:42-55` ("The exemplar city keeps the height at <width> px": Russian, stored "Moscow", `When the zone cities data finishes loading`, then `the Moscow card has not moved`, which finds the card with `listRow(page, MOSCOW)`, `const MOSCOW = "Moscow"`, `steps/locations_device_time_e2e.steps.ts:22,134,151`). Unit: `locations/locations_device_time_unit.feature:6-16` (`"ru"`, `the zone cities data is loaded` through the real `virtual:zone-cities` loader of `steps/deviceTimeDataLoader.ts`, list "the device time location, Moscow, Kolkata, New York", then `the rows show the offset differences "Moscow −2 ч, Kolkata +0:30, New York −9 ч"`, which finds each card through `world.cardOf(city)`, the button named `i18n.t("locations.locationMenu", { city })`, `steps/deviceTimeQueries.ts:32-35`). See R1.

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ locations "City label in the interface language" | ✅ 2.1–2.2, 3.1–3.4, 5.1 |
| FR2 | ✅ | ✅ locations "City label in the interface language"; settings "Interface language choice" | ✅ 3.3, 5.1, 5.5, 6.1 |
| FR3 | ✅ | ✅ scenario "Texts that name the city follow" | ✅ 3.1, 5.1, 6.1 |
| FR4 | ✅ | ✅ locations "Exemplar city…"; location-search "Search is fast and lazy", "slash key" | ✅ 3.3–3.4, 5.1, 5.5, 6.1–6.3 (device time + Tokyo scenarios untested, R3) |
| FR5 | ✅ | ✅ app-shell "Dialect fallback", scenario "Intl data of a dialect Intl does not know" | ✅ 4.1–4.2, 5.4 |
| NFR-P1 | ✅ | ✅ locations "City labels are fast" | ✅ 3.3, 5.2, 5.3 |
| NFR-A1 | ✅ | ✅ scenario "Accessible after a switch" | ✅ 6.1 |
| UX1 | ✅ | ✅ scenario "Stored label until the data is loaded" | ✅ 5.1 |
| UX2 | ✅ | ✅ "Added in Russian, shown in English" (no loading state in the SHALL) | ✅ 5.1 |
| M1 | ✅ | n/a | ✅ 5.1, 6.1 |
| M2 | ✅ | n/a | ✅ 6.1, 6.2 |
| M3 | ✅ | n/a | ✅ 5.2 |
| M4 | ✅ | n/a | ✅ 4.1 |
| M5 | ✅ | n/a | ✅ 6.1 |
| M6 | ✅ | n/a | ✅ 7.1 |
| G1 | ✅ | n/a — met by FR1, FR2 | n/a — met by FR1, FR2, M1 |
| G2 | ✅ | n/a — met by FR1, FR5 | n/a — met by FR5, M4 |
| G3 | ✅ | n/a — met by FR2 | n/a — met by FR2, M1 |
| NG1 | ✅ | n/a | n/a — no artifact adds a city-name language |
| NG2 | ✅ | n/a | n/a — no artifact touches the stored document, ID or duplicate rule |
| NG3 | ✅ | n/a | n/a — no artifact repeats announcements |
| NG4 | ✅ | n/a | n/a — no artifact touches the manifest |
| NG5 | ✅ | n/a | n/a — no new string, layout or screen |
| NG6 | ✅ | n/a | n/a — unknown labels stay as stored (`getCityLabel` returns `storedLabel`) |

## Consistency

- The ADDED requirement says a switch "MUST NOT write to storage" (`specs/locations/spec.md:78`) and FR2 says "nothing is written to storage" (`proposal.md:70`), while the restated "Interface language choice" names "the stored choice" as its output (`specs/settings/spec.md:4`) and the stable settings spec saves the interface language on the device (`openspec/specs/settings/spec.md:124`; `controller/PreferencesProvider.tsx:84,137`). See R2.
- Task 7.3's glossary check `grep -rniE "city ?title|cityName" … src/controller/useCityLabels.ts` must print nothing (`tasks.md:87`), while design D3 has `useCityLabels` call `getCityLabel(…, cityNameLanguage)` (`design.md:50`), and `cityNameLanguage` matches `cityName` case-insensitively. See R4.

## Findings

### R1 — WARNING — Existing scenarios that encode the stored-label rule are not planned for update
- Location: `openspec/changes/show-city-labels-in-interface-language/design.md:67` (D6), `tasks.md:61` (5.5), `tasks.md:76` (6.2) and `tasks.md:77` (6.3)
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it"); the suite must stay green (task 7.2)
- Problem: D6 lists the tests that encoded the old rule (a row keeps its stored label in every language), but misses five scenarios that store a label in another language than the interface, let the zone cities data load, and then look the row up by its stored label (all paths under `packages/client/src/test/features/`):
  - `home_location/home_location_e2e.feature:42-48`: Russian, stored "Almaty", "Moscow"; `When the user opens the location menu named "Действия: Moscow"`, `the row of "Almaty"`. The stable `home-location` spec already expects «Действия: Москва» (`openspec/specs/home-location/spec.md:215`).
  - `locations/locations_clock_change_note_e2e.feature:43-57`: Russian, stored "Almaty", "Belgrade", "Lord Howe Island"; `the clock change note of "<city>"` with the examples `Belgrade` and `Lord Howe Island`.
  - `time_selection/time_selection_card_layout_e2e.feature:82-89`: Russian, stored "Москва", "Kolkata"; `the hour labels of "Москва", "Kolkata"`.
  - `locations/locations_device_time_e2e.feature:42-55` ("The exemplar city keeps the height at <width> px"): Russian, stored "the device time location", "Moscow"; after `When the zone cities data finishes loading` it checks `And the Moscow card has not moved`. Both steps find the card with `listRow(page, MOSCOW)` (`steps/locations_device_time_e2e.steps.ts:134,151`, `const MOSCOW = "Moscow"` at line 22); the check at line 151 runs after the data is released, when the row reads «Москва», so the locator finds no card.
  - `locations/locations_device_time_unit.feature:6-16` ("Device time location on the design sample"): `"ru"`, `the zone cities data is loaded` (the real `virtual:zone-cities` data, `steps/deviceTimeDataLoader.ts`), list "the device time location, Moscow, Kolkata, New York", then `the rows show the offset differences "Moscow −2 ч, Kolkata +0:30, New York −9 ч"`, which finds each card by the menu button named «Действия: Moscow» (`steps/deviceTimeQueries.ts:32-35`).

  Task 5.5 rewrites only the data and settings unit scenarios, 6.2 only the two "load only when the search opens" scenarios, and 6.3 allows rewriting only "an extra zone cities request" expectations and says "Fix any other failure in the code".
- Impact: implemented as written, five scenarios fail (the E2E ones also race: they pass or fail depending on when the data arrives), and 6.3 sends the implementer to change production code so that an obsolete expectation passes, i.e. to undo FR1, or leaves the implement stage stuck on a red suite.
- Fix: add the five scenarios to D6 and to the tasks, each tagged also `@show-city-labels-in-interface-language @FR1`:
  - Task 6.2 (E2E): store each label in the scenario's interface language, so no row changes when the data arrives (UX1). Reuse the existing `KNOWN_CITIES` entries of `test/features/locations/steps/locationsE2eHelpers.ts` — «Москва» (lines 22-26), «Белград» (lines 44-48) and «Остров Лорд-Хау» (lines 54-58) — and add only «Алматы» (`Asia/Almaty`, `KZ`) and «Калькутта» (`Asia/Kolkata`, `IN`). Before using an entry, check that its label equals the `names.ru` of its zone's record in the zone cities data (`virtual:zone-cities`, built from the Russian CLDR exemplar city) and correct the entry if it differs; «Белград» and «Остров Лорд-Хау» are used by no feature today, so nothing has checked them. Then: `home_location_e2e.feature:44,46,48` → `"Алматы", "Москва" and home is "Алматы"`, `named "Действия: Москва"`, `the row of "Алматы"`; `locations_clock_change_note_e2e.feature:48` → `"Алматы", "Белград", "Остров Лорд-Хау"` and the `city` column of its examples → `Белград` / `Остров Лорд-Хау`; `time_selection_card_layout_e2e.feature:85,88` → `"Москва", "Калькутта"`; `locations_device_time_e2e.feature:45` → `"the device time location", "Москва"`, and in `steps/locations_device_time_e2e.steps.ts` the two card lookups at lines 134 and 151 use a new constant for «Москва», while line 91 (the English "Narrow and wide screens" scenario) keeps `MOSCOW`.
  - Task 5.5 (unit): `locations_device_time_unit.feature:16` expects the localized names, `the rows show the offset differences "Москва −2 ч, Калькутта +0:30, Нью-Йорк −9 ч"` (the `names.ru` of each record), because the data is loaded before the check; `DIFFERENCE_ENTRY_PATTERN` (`/^(.+?) ([+−].+)$/u`, `locations_device_time_unit.steps.tsx:12`) already splits Cyrillic names.
  - Task 6.3, add: "A scenario that looks a row up by a stored label in another language than the interface is rewritten to the FR1 rule (store the label in the interface language, or expect the localized name), with a `// Verifies FR1 of show-city-labels-in-interface-language` comment; it is not fixed in the code."
- Fix risk: the Russian names are longer than the English ones, so the clock-change-note and hour-label layouts are measured with different text; that is what a Russian user sees, and the tasks already run each rewritten feature. If a `KNOWN_CITIES` label is not a name of its record, the row keeps the stored label: the scenario stays stable but no longer exercises FR1, which is why the Fix asks to check each label against the data. The unit expectation depends on the `names.ru` of three records; the implementer reads them from the data, not from this report.
- Status: fixed
- Resolution: design.md D6 now lists the five scenarios and the FR1 rewrite rule; tasks.md 5.5 rewrites `locations_device_time_unit.feature` to the localized names, 6.2 adds «Алматы»/«Калькутта» to `KNOWN_CITIES`, checks each Russian entry against `names.ru` and rewrites the four E2E scenarios (with a «Москва» constant in `locations_device_time_e2e.steps.ts`), and 6.3 says such failures are rewritten to FR1, not fixed in the code.

### R2 — WARNING — "Nothing is written to storage" on a language switch contradicts the stored language choice
- Location: `openspec/changes/show-city-labels-in-interface-language/specs/locations/spec.md:78`, `specs/locations/spec.md:96-102`, `proposal.md:70`
- Rule: `.claude/rules/delta-specs.md` (an ADDED requirement must not contradict a stable one)
- Problem: the ADDED requirement says a switch "MUST NOT write to storage" and FR2 says "nothing is written to storage", but choosing a language saves it in the preferences document (`openspec/specs/settings/spec.md:124`; `PreferencesProvider.tsx:137` `setInterfaceLanguage` → `repository.save` at line 84). The scenario that should check it, "A switch keeps the stored list", contains no switch at all: it only opens the app in English.
- Impact: a test written to the SHALL (no `localStorage.setItem` during a switch) fails against correct behaviour, or the implementer suppresses the preference write and breaks the stored language choice; the scenario as written never verifies the switch.
- Fix: in `specs/locations/spec.md:78` replace "and MUST NOT write to storage" with "and MUST NOT write the stored location list"; in `proposal.md:70` replace "and nothing is written to storage" with "and the location list is not written to storage". In the scenario at line 96 add, after the first THEN, "**WHEN** the user switches the interface language to Russian and back to English" and change "nothing was written to storage" to "the stored location list was not written".
- Fix risk: none; task 5.1 already compares the location repository's document, and 6.1 the `localStorage` locations document.
- Status: open

### R3 — WARNING — The device time location + Tokyo request scenarios have no test
- Location: `openspec/changes/show-city-labels-in-interface-language/specs/locations/spec.md:60`, `specs/location-search/spec.md:17`
- Rule: `.claude/rules/test-planning.md` ("If a scenario is in Gherkin — it must have step definitions")
- Problem: the delta adds "One request for city labels and the device time location" (device time location + Tokyo, data requested exactly once) and changes the Given of "The Here entry's request is the only one" to "the device time location and Tokyo". This is the case where both triggers (`useExemplarCity` and `useCityLabels`) run on the page. No task touches the matching tests: `locations_device_time_data_unit.feature:32-38` and `locations_ui_e2e.feature:40-47` still list only the device time location; task 6.1's request scenario holds Tokyo alone, and 3.3 checks the shared load only with `renderHook`, outside the real `LocationsProvider` and search.
- Impact: a double request when both hooks start in the same commit (for example an effect that calls the loader without going through `loadCitySearchOnce`) passes every planned test, though FR4 and M2 forbid it.
- Fix: in task 5.5 add a scenario "One request for city labels and the device time location" (`@show-city-labels-in-interface-language @FR4 @M2`) to `locations_device_time_data_unit.feature`, reusing `the list is {string}` with "the device time location, Tokyo" (the unit worlds already resolve Tokyo through `KNOWN_CITIES` of `test/factories/buildLocation.ts:29`, and the loader of `steps/deviceTimeDataLoader.ts` serves the real zone cities data), the existing "When the user opens the app, the zone cities data finishes loading, and the user opens the search" and "the zone cities data was requested exactly once" steps. In task 6.2 change `locations_ui_e2e.feature:42` to `Given the stored locations are "the device time location", "Tokyo"` (an existing entry, `locationsE2eHelpers.ts:33`) and tag it `@show-city-labels-in-interface-language @FR4`.
- Fix risk: none for ordering (both entries exist today); the E2E scenario then also relabels Tokyo if the interface is Russian, which its request count does not look at.
- Status: open

### R4 — WARNING — Task 7.3's glossary grep cannot pass with the designed hook
- Location: `openspec/changes/show-city-labels-in-interface-language/tasks.md:87`
- Rule: `.claude/rules/glossary.md` (review checklist)
- Problem: 7.3 requires `grep -rniE "city ?title|cityName" src/presenter/presentLocationRows.ts src/controller/useCityLabels.ts` to print nothing. D3 (`design.md:50`) has `useCityLabels` read `cityNameLanguage` from `useActiveInterfaceLanguage()` (as `useExemplarCity.ts:19` does) and pass it to `getCityLabel`; `-i` makes `cityName` match `cityNameLanguage`.
- Impact: the final check fails on correct code, so the implementer either renames the existing `CityNameLanguage` concept in the hook (a glossary violation) or cannot tick 7.3.
- Fix: make the pattern whole-word: `grep -rniwE "city ?title|cityName" src/presenter/presentLocationRows.ts src/controller/useCityLabels.ts`.
- Fix risk: none; `cityName` as a whole word still fails the check, and neither file uses it today.
- Status: open

### R5 — SUGGESTION — "No retry" depends on effect dependencies D3 does not fix
- Location: `openspec/changes/show-city-labels-in-interface-language/design.md:49`
- Rule: —
- Problem: D3 says "A rejection is swallowed: no error state, no retry", but `loadCitySearchOnce` drops a rejected load (`controller/cityDataCache.ts:21-24`: `pendingLoads.delete(load); throw error;`), so the next call requests again. If the effect depends on `locations`, every removal or reorder after a failed load starts a new request. Task 3.3 only checks "no second load on re-render" with the same inputs.
- Impact: offline with uncached data, each list change re-requests the file, contrary to FR4's "no retry"; the planned test does not catch it.
- Fix: in D3 state the effect's dependencies as `[hasCityLocation, load]` (a boolean computed from `locations`), and in task 3.3 add the case "after a rejected load, removing or reordering a location starts no second load".
- Fix risk: none; opening the search still retries through `useCitySearch`, as today.
- Status: open

### R6 — SUGGESTION — M6 points to a task that does not exist
- Location: `openspec/changes/show-city-labels-in-interface-language/proposal.md:127`
- Rule: `.claude/rules/antipatterns.md` ("Vague traceability — … If the reference is not explicit, it does not exist.")
- Problem: M6 says Stryker scores "on each production file this change adds logic to (task 8.1 lists them)", but `tasks.md` has no section 8; the Stryker runs and their file lists are task 7.1 (`tasks.md:81-85`).
- Impact: the metric's link to its file list points nowhere, so whoever checks M6 has to guess which list it means.
- Fix: in `proposal.md:127` replace "task 8.1" with "task 7.1".
- Fix risk: none.
- Status: open

## Verdict

Needs revision. Blocking: R1, R2, R3, R4 (WARNING). R5 and R6 are optional polish. The design (localize at presentation, the `Intl` locale list, no stored-schema change) fits ADR-0002, ADR-0004, ADR-0006, ADR-0008 and the task; the fixes are local edits to D3, D6, the spec text, M6 and tasks 3.3, 5.5, 6.2, 6.3 and 7.3.
