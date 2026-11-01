# Specs review: show-city-labels-in-interface-language

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 24/24 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 1 |

## Freshness

- ✅ `Location.label` comes from the search result's `cityName` on add (design.md:7): `views/shared/LocationSearch.tsx:42` passes `label: result.cityName`; the ID is `buildLocationId(timeZoneId, label)` (`model/locationId.ts:6`).
- ✅ `presentLocationRows` shows the stored `label` for every city location (proposal.md:7, design.md:8): `presenter/presentLocationRows.ts` sets `cityLabel` to `location.label` unless the location is the device time location, and passes it to `presentZoneMoment`.
- ✅ Every view text that names the city reads `row.cityLabel` (design.md:8): `views/shared/LocationRow.tsx:153,159,185`, `views/shared/ZoneRowContent.tsx:61,109`, `views/shared/useReorderAnnouncements.ts:27`, `views/cards/CardsView.tsx:56,67` (removal, home), `presenter/presentZoneMoment.ts:133-134` (`wallTimeInputLabel`). No other non-test file reads `location.label` except `presentSearchResults.ts:45`.
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
- ✅ The scenarios D6 rewrites exist as described: `locations_device_time_data_unit.feature:27-31` ("No load without the device time location", `the list is "Almaty"`), `locations_ui_e2e.feature:33-38` and `locations_search_shortcut_e2e.feature:20-24` (`Given the stored locations are "Almaty"`), `settings_language_unit.feature:14` ("keeps its city label").
- ✅ The MODIFIED requirements are restated from `openspec/specs/`: "List in the Cards view" (`locations/spec.md:74`), "Exemplar city of the device time location" (`locations/spec.md:1089`), "Search is fast and lazy" (`location-search/spec.md:162`), "Open the search with the slash key" (`location-search/spec.md:225`), "Interface language choice" (`settings/spec.md:402`), "Dialect fallback" (`app-shell/spec.md:218`); a diff of each block shows only the edits the proposal declares.
- ✅ A locale list passes through the iOS 12 path (design.md:15, ADR-0009): the legacy zone shim's constructor takes `locales?: string | string[]` and forwards it unchanged (`lib/legacy/zoneShim.ts:44-49`).
- ✅ D3's choice of the city name in a controller hook has a precedent that ADR-0002 already lives with: `useExemplarCity` picks `getExemplarCity(timeZoneId, cityNameLanguage)` in the controller (`controller/useExemplarCity.ts:19,31-34`) and passes the result to the presenter as `deviceTimeCityLabel` (`controller/useLocations.ts:89-92,106`); `useCityLabels` follows the same shape.
- ✅ Nothing is already implemented: no `getCityLabel`, `isCityNameOfRecord` or `useCityLabels` in `packages/client/src`, and no archived change localizes stored city labels.
- ❌ D6 claims to list the tests that encode the old rule (design.md:67-73), but at least three more E2E scenarios assert a stored English label under the Russian interface and will see the localized name once the data loads: `home_location/home_location_e2e.feature:42-48` ("Russian interface": stored "Almaty", "Moscow", expects the menu "Действия: Moscow" and the row of "Almaty"), `locations/locations_clock_change_note_e2e.feature:43-50` (Russian, stored "Almaty", "Belgrade", "Lord Howe Island", then looks up the card of "<city>"), `time_selection/time_selection_card_layout_e2e.feature:82-88` (Russian, stored "Москва", "Kolkata", then "the hour labels of … "Kolkata""). See R1.

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

### R1 — WARNING — Existing E2E scenarios that encode the stored-label rule are not planned for update
- Location: `openspec/changes/show-city-labels-in-interface-language/design.md:67` (D6) and `tasks.md:77` (6.3)
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test"; the suite must stay green)
- Problem: D6 lists the tests that encoded the old rule (a row keeps its stored label in every language), but misses E2E scenarios that store English labels under the Russian interface and assert the English text: `packages/client/src/test/features/home_location/home_location_e2e.feature:42-48` (stored "Almaty", "Moscow"; `When the user opens the location menu named "Действия: Moscow"`, `the row of "Almaty"`), `locations/locations_clock_change_note_e2e.feature:43-50` (stored "Almaty", "Belgrade", "Lord Howe Island"; `the clock change note of "<city>"`), `time_selection/time_selection_card_layout_e2e.feature:82-88` (stored "Москва", "Kolkata"; `the hour labels of "Москва", "Kolkata"`). Once FR4 loads the zone cities data for any non-empty list, these rows switch to the Russian names (the stable `home-location` spec already expects «Действия: Москва», `openspec/specs/home-location/spec.md:215`). Task 6.3 only allows rewriting expectations about an extra request and says "Fix any other failure in the code".
- Impact: the implementer hits failures (or races: the label flips when the data arrives) in three suites, and 6.3 directs them to change production code to make an obsolete expectation pass, i.e. to undo FR1, or leaves the implement stage stuck.
- Fix: add these three scenarios to D6 and to task 6.2: store each label in the scenario's interface language (add «Алматы», «Белград», «Лорд-Хау», «Калькутта» or the exact Russian names of the zone cities data to `KNOWN_CITIES` in `locationsE2eHelpers.ts`) and reference them in the steps, so no row changes when the data arrives (UX1); tag them `@show-city-labels-in-interface-language @FR1`. In 6.3 (and 7.2 for `pnpm test`), add: "A scenario that asserts a stored label in another language than the interface is rewritten to the FR1 rule, with a `// Verifies FR1 of show-city-labels-in-interface-language` comment."
- Fix risk: a Russian label that differs from the zone cities data still shows as stored, so the rewritten scenarios stay stable either way; the clock-change-note and layout scenarios check layout, so longer Russian names may change wrapping — run each rewritten feature once.
- Status: open

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
- Problem: the delta adds "One request for city labels and the device time location" (device time location + Tokyo, data requested exactly once) and changes the Given of "The Here entry's request is the only one" to "the device time location and Tokyo". This is the case where both triggers (`useExemplarCity` and `useCityLabels`) run on the page. No task touches the matching tests: `locations_device_time_data_unit.feature:34-39` and `locations_ui_e2e.feature:41-47` still list only the device time location; task 6.1's request scenario holds Tokyo alone, and 3.3 checks only the hook in isolation.
- Impact: a double request when both hooks start in the same commit (for example an effect that calls the loader without going through `loadCitySearchOnce`) passes every planned test, though FR4 and M2 forbid it.
- Fix: in task 5.5 add a scenario "One request for city labels and the device time location" (`@show-city-labels-in-interface-language @FR4 @M2`) to `locations_device_time_data_unit.feature`, reusing `the list is {string}` with "the device time location, Tokyo" (extend `deviceTimeWorld.tsx` `givenList` / the fixture loader to resolve Tokyo if needed), the existing "When the user opens the app, the zone cities data finishes loading, and the user opens the search" and "the zone cities data was requested exactly once" steps. In task 6.2 change `locations_ui_e2e.feature:42` to `Given the stored locations are "the device time location", "Токио"` (the entry 6.1 adds) and tag it `@show-city-labels-in-interface-language @FR4`.
- Fix risk: the unit world may need a Tokyo fixture record; 6.2 then depends on 6.1's `KNOWN_CITIES` entry, which comes earlier, so ordering holds.
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
- Problem: D3 says "A rejection is swallowed: no error state, no retry", but `loadCitySearchOnce` drops a rejected load (`controller/cityDataCache.ts:227-229`), so the next call requests again. If the effect depends on `locations`, every removal or reorder after a failed load starts a new request. Task 3.3 only checks "no second load on re-render" with the same inputs.
- Impact: offline with uncached data, each list change re-requests the file, contrary to FR4's "no retry"; the planned test does not catch it.
- Fix: in D3 state the effect's dependencies as `[hasCityLocation, load]` (a boolean computed from `locations`), and in task 3.3 add the case "after a rejected load, removing or reordering a location starts no second load".
- Fix risk: none; opening the search still retries through `useCitySearch`, as today.
- Status: open

## Verdict

Needs revision. Blocking: R1, R2, R3, R4 (WARNING). R5 is optional polish. The design (localize at presentation, the `Intl` locale list, no stored-schema change) fits ADR-0002, ADR-0004, ADR-0006, ADR-0008 and the task; the fixes are local edits to D6, the spec text and tasks 5.5, 6.2, 6.3 and 7.3.
