# Review: show-city-labels-in-interface-language

## Summary

| Item | Value |
|---|---|
| Tasks verified | 19/20 |
| Requirements traced | 56/58 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 Glossary and docs: `docs/glossary/locations.md:8` (**City label** with `CitySearch.getCityLabel`, `isCityNameOfRecord`, `useCityLabels`), `docs/glossary/settings.md:12` (Interface language governs the "city label of a city location"), `docs/glossary/settings.md:15` (Dialect: `Intl` uses the same order), `docs/glossary/search.md:9` (`CitySearch.getCityLabel`), `docs/architecture/domain-model.md:18`. All glossary files are under 200 lines (largest 25).
- ✅ 2.1 RED tests: `packages/client/src/ports/citySearch.test.ts:15` (`it.each` over Tokyo / Токио / Edo / ""), contract cases `packages/client/src/adapters/city-search/citySearch.contract.ts:52-62`, fed by `createCompositeCitySearch.exemplarCity.test.ts:16`.
- ✅ 2.2 GREEN: `isCityNameOfRecord` at `packages/client/src/ports/citySearch.ts:31-34`, exported at `ports/index.ts:5`; `getCityLabel` on the port (`ports/citySearch.ts:59-69`, method at l. 65) and in `adapters/city-search/createCompositeCitySearch.ts:89-94` via `recordsById`; `presentSearchResults.ts:45` uses `isCityNameOfRecord`.
- ✅ 3.1 RED presenter tests: `packages/client/src/presenter/presentLocationRows.cityLabels.test.ts:37-62` (map label, wall time input label, no map, missing ID, device time location ignores the map). They live in a new file instead of `presentLocationRows.test.ts`; the cases are the ones the task lists.
- ✅ 3.2 GREEN: `cityLabels?: ReadonlyMap<string, string>` at `presenter/presentZoneMoment.ts:33-34`; `presenter/presentLocationRows.ts:63` uses `context.cityLabels?.get(location.id) ?? location.label`; JSDoc at `presentLocationRows.ts:45`.
- ✅ 3.3 RED hook tests: `packages/client/src/controller/useCityLabels.test.tsx` covers undefined before load (l. 55), English then Russian (l. 62), rejected load with no reload after removal/reorder (l. 80), no load for an empty list / device-time-only list (l. 96), same map and 0 `getCityLabel` calls on re-render (l. 112), one load shared with `useExemplarCity` (l. 129).
- ❌ 3.4 `controller/useCityLabels.ts` exists and `useLocations.ts:60,75,87` calls it, puts the map into the rows context and the `useMemo` dependencies, with the JSDoc at `useLocations.ts:43-44`. But the task also says "export it from `controller/index.ts`", and `controller/index.ts` has no `useCityLabels` export (see R2).
- ✅ 4.1 RED: `packages/client/src/presenter/intlDialectFallback.test.ts:65` (precondition `supportedLocalesOf(["tlh"])` is empty), `:69` country, `:75` local date, `:81` date bar, `:92` calendar month, `:100` `it.each` for `en`, `ru`, `ru-KZ`.
- ✅ 4.2 GREEN: `[...resolveLanguageFallbacks(language)]` at `presenter/countryName.ts:16`, `presenter/dateTimeFormatters.ts:65`, `presenter/dateBar.ts:61`, `presenter/calendarMonth.ts:73`; cache keys unchanged (`countryName.ts:13`, `dateTimeFormatters.ts:59`); JSDoc lines present in all four.
- ✅ 5.1 `test/features/locations/locations_city_label_language_unit.feature` (8 scenarios, each tagged `@show-city-labels-in-interface-language`) with steps `steps/locations_city_label_language_unit.steps.tsx` (real `LocationsProvider` via `createDeviceTimeWorld`, in-memory backend, `i18n.changeLanguage`; the storage check compares the backend document before and after Russian→English at l. 104-117).
- ✅ 5.2 `test/features/locations/locations_city_label_budget_unit.feature` + `steps/locations_city_label_budget_unit.steps.tsx`: 50 locations from `buildBudgetLocations`, `vi.spyOn(search, "getCityLabel")`, `startWorkCount()` formatters = 0 (l. 93-99), ≤ 50 lookups on switch (l. 112-117).
- ✅ 5.3 `packages/client/src/test/benchmarks/cityLabels.bench.ts` (`// Verifies NFR-P1 …`, `bench(` at l. 22).
- ✅ 5.4 `test/features/app_shell/app_shell_dialect_intl_unit.feature` + `steps/app_shell_dialect_intl_unit.steps.ts` with the `vi.mock("@/locales/localeRegistry", …)` adding `tlh` with base `ru` (l. 14-27).
- ✅ 5.5 `locations_device_time_data_unit.feature:27-31` ("No load …" now `Given … the list is empty`), `:41-46` new "One request for city labels and the device time location"; `settings_language_unit.feature:14` and its step `settings_language_unit.steps.tsx:62-65` expect «Алматы»; `locations_device_time_unit.feature:6` tagged `@FR1`.
- ✅ 6.1 `KNOWN_CITIES` «Токио» at `steps/locationsE2eHelpers.ts:28`; `locations_city_label_language_e2e.feature` (4 scenarios, l. 7, 19, 28, 43) with steps `steps/locations_city_label_language_e2e.steps.ts`.
- ✅ 6.2 `locations_ui_e2e.feature:33-35` and `locations_search_shortcut_e2e.feature:20-22` use `Given the stored list is empty`; `locations_ui_e2e.feature:42-44` stores "the device time location", "Tokyo"; rewrites in `home_location_e2e.feature` («Алматы», «Москва»), `locations_clock_change_note_e2e.feature:49-61` («Алматы», «Белград», «Лорд-Хау» — the CLDR `ru` exemplar city of `Australia/Lord_Howe` is «Лорд-Хау», so the task's «Остров Лорд-Хау» was corrected as the task allows), `time_selection_card_layout_e2e.feature:86-89`, `locations_device_time_e2e.feature:47` with `MOSCOW_IN_RUSSIAN` at `steps/locations_device_time_e2e.steps.ts:23,135,152`.
- ✅ 6.3 E2E follow-ups present (e.g. `steps/timeSelectionE2eHelpers.ts`, `steps/time_selection_pointer_e2e.steps.ts`, `steps/locationsStates.ts` changed); CI is green per the stage input.
- ✅ 7.1 Scoped Stryker re-run by this review (see Mutation): every listed file ≥ 94.74 %, all ≥ 90 %.
- ✅ 7.2 Typecheck, lint, tests and build are part of the green CI the stage starts from.
- ✅ 7.3 The traceability loop over FR1–FR5, NFR-P1, NFR-A1, UX1, UX2, M1–M5 prints nothing from `packages/client/src`; the `cityName`/`city title` grep on `presentLocationRows.ts` and `useCityLabels.ts` prints nothing.

## Requirements

- ⚠️ FR1 — `createCompositeCitySearch.ts:89-94` (`getCityLabel`), `useCityLabels.ts:34-48`, `presentLocationRows.ts:63`; tested by the contract (`citySearch.contract.ts:52-62`), `presentLocationRows.cityLabels.test.ts`, `useCityLabels.test.tsx:62` and the unit feature. Gap: data loaded later by the search after a failed first load never reaches the rows (R1).
- ✅ FR2 — `useCityLabels.ts:48` recomputes on `cityNameLanguage`; no write path touched. Tests: unit "A switch keeps the stored list" (backend document identity, steps l. 115-117), E2E "Switching relabels the row" (localStorage document unchanged).
- ✅ FR3 — the row's `cityLabel` feeds `presentZoneMoment` (`presentLocationRows.ts:64`) and every view text. Tests: `presentLocationRows.cityLabels.test.ts:45` (wall time input label), unit "Removal is announced with the new city label", E2E "Texts that name the city follow" (menu and time button names).
- ✅ FR4 — `useCityLabels.ts:29-32` loads after the first render while a city location is listed, swallowing rejection; `useExemplarCity` covers the device time location. Tests: `useCityLabels.test.tsx:80,96,129`, unit "Stored label until the data is loaded", "Loading fails", E2E `locations_ui_e2e.feature:34` and `:43`, `locations_city_label_language_e2e.feature:43`.
- ✅ FR5 — fallback list at the four `Intl` call points (Tasks 4.2). Tests: `intlDialectFallback.test.ts`, `app_shell_dialect_intl_unit.feature`.
- ✅ NFR-P1 — memo over `[locations, cityNameLanguage, loadedSearch]` (`useCityLabels.ts:48`); budget feature asserts 0 lookups and 0 formatters on a tick and ≤ 50 on a switch; `cityLabels.bench.ts`.
- ✅ NFR-A1 — E2E "Texts that name the city follow" and outline "Accessible after a switch in the <theme> theme" (axe-core via "the locations screen has no accessibility violations", light and dark).
- ✅ UX1 — unit "Stored label until the data is loaded" (one change from «Токио» to "Tokyo"); E2E rewrites store labels in the interface language so no row changes on load.
- ✅ UX2 — unit "Added in Russian, shown in English" / "Added in English, shown in Russian" switch with no loading state (`@UX2`); the map is synchronous once loaded.
- ✅ M1 — unit "A switch keeps the stored list" and E2E "Switching relabels the row" (both directions, document unchanged).
- ✅ M2 — E2E `locations_city_label_language_e2e.feature:43` (exactly 1 request across render and search), `locations_ui_e2e.feature:34` (0 before the search with an empty list), unit `locations_device_time_data_unit.feature:42`.
- ✅ M3 — `locations_city_label_budget_unit.feature` (0 lookups / 0 formatters on a tick, ≤ 50 on a switch).
- ✅ M4 — `intlDialectFallback.test.ts:69,75,81` (country `KZ`, local date, date bar) for `tlh` equal `ru`.
- ✅ M5 — E2E outline "Accessible after a switch in the <theme> theme" (light, dark).
- ✅ M6 — measured by this review: all ten files ≥ 94.74 % (see Mutation).
- ✅ Scenario: Fallback order of a dialect — `app_shell/app_shell_interface_language_unit.feature:32`.
- ✅ Scenario: Language-keyed data of a dialect — `app_shell/app_shell_interface_language_unit.feature:41`.
- ✅ Scenario: Intl data of a dialect Intl does not know — `app_shell/app_shell_dialect_intl_unit.feature`, steps assert `supportedLocalesOf(["tlh"])` is empty and the outputs equal Russian.
- ✅ Scenario: Query timing — `location_search/location_search_performance.feature:5`.
- ✅ Scenario: Data loads only when the search opens — `locations/locations_ui_e2e.feature:34` with `Given the stored list is empty`.
- ✅ Scenario: The Here entry's request is the only one — `locations/locations_ui_e2e.feature:43` with "the device time location", "Tokyo".
- ✅ Scenario: Bundle budget — `packages/client/scripts/check-bundle-size.mjs:18,27` (150 KB initial, 30 KB search data).
- ✅ Scenario: Open the search and add a location with the keyboard — `locations/locations_search_shortcut_e2e.feature:8`.
- ✅ Scenario: Suggestions are shown — `locations/locations_search_shortcut_e2e.feature:12` ("the suggestions are shown" after `/`).
- ✅ Scenario: Data is requested only when the search opens — `locations/locations_search_shortcut_e2e.feature:21`, now with an empty list.
- ✅ Scenario: Typing in a text field — `locations/locations_search_shortcut_e2e.feature:28`.
- ✅ Scenario: Slash typed in the open search — `locations/locations_search_shortcut_e2e.feature:41`.
- ✅ Scenario: Search already open — `locations/locations_search_shortcut_e2e.feature:48`.
- ✅ Scenario: Modifier keys held — `locations/locations_search_shortcut_e2e.feature:56`.
- ✅ Scenario: Shift on layouts that need it — `locations/locations_search_shortcut_e2e.feature:67`.
- ✅ Scenario: Stored list unreadable — `locations/locations_search_shortcut_e2e.feature:72`.
- ✅ Scenario: Settings page shown — `main_page/main_page_header_e2e.feature:51`.
- ✅ Scenario: Shortcut announced on the action — `locations/locations_search_shortcut_e2e.feature:16`, step checks `aria-keyshortcuts` (`steps/locations_search_shortcut_e2e.steps.ts:122-125`).
- ✅ Scenario: Rows show city and country — `locations/locations_ui_unit.feature:6`.
- ✅ Scenario: Empty state after the last removal — `locations/locations_ui_unit.feature:13`.
- ✅ Scenario: Remove action names the city — `locations/locations_ui_e2e.feature:53`.
- ✅ Scenario: Focus after removal — `locations/locations_view_contract_e2e.feature:62`.
- ✅ Scenario: Focus after the last removal — `locations/locations_view_contract_e2e.feature:68`.
- ✅ Scenario: Derived city first, exemplar city after loading — `locations/locations_device_time_data_unit.feature:7`.
- ✅ Scenario: Loading fails (exemplar city) — `locations/locations_device_time_data_unit.feature:18`.
- ✅ Scenario: No load without the device time location — `locations/locations_device_time_data_unit.feature:27`, empty list.
- ✅ Scenario: One request for city labels and the device time location — `locations/locations_device_time_data_unit.feature:42`.
- ✅ Scenario: Renamed device time zone — `locations/locations_device_time_data_unit.feature:63`.
- ✅ Scenario: Added in Russian, shown in English — `locations/locations_city_label_language_unit.feature:7`, E2E `locations_city_label_language_e2e.feature:7`.
- ✅ Scenario: Added in English, shown in Russian — `locations/locations_city_label_language_unit.feature:19`.
- ✅ Scenario: A switch keeps the stored list — `locations/locations_city_label_language_unit.feature:29`.
- ✅ Scenario: Stored label until the data is loaded — unit feature, `DataMode.HELD` then `whenDataFinishesLoading`.
- ✅ Scenario: Loading fails (city label) — unit feature, `DataMode.FAILING`, no `alert`.
- ⚠️ Scenario: A label the data does not know — `locations/locations_city_label_language_unit.feature:64` exists, but its Then does not wait for the zone cities data to load (R3); the rule itself is covered by the contract case "Edo" → "Edo".
- ✅ Scenario: A dialect reads its base language — `locations/locations_city_label_language_unit.feature:72`, `getCityLabel` with `resolveCityNameLanguage("ru-KZ", DIALECT_REGISTRY)` gives «Токио» (the hook reads the same `cityNameLanguage`; no shipped `ru-KZ` locale exists to switch the provider to).
- ✅ Scenario: Texts that name the city follow — E2E `locations_city_label_language_e2e.feature:19`; the removal announcement in unit `locations_city_label_language_unit.feature:79`.
- ✅ Scenario: Accessible after a switch — E2E outline `locations_city_label_language_e2e.feature:28`.
- ✅ Scenario: A minute tick asks for no city label — `locations/locations_city_label_budget_unit.feature`.
- ✅ Scenario: A switch asks once per location — `locations/locations_city_label_budget_unit.feature`.
- ✅ Scenario: Collapsed group — `settings/settings_language_e2e.feature:7`.
- ✅ Scenario: Expand and collapse — `settings/settings_language_e2e.feature:14`.
- ✅ Scenario: Names are not translated — `settings/settings_language_unit.feature:19`.
- ✅ Scenario: Choosing Russian applies at once — `settings/settings_language_unit.feature:7`, step expects «Алматы» (`settings_language_unit.steps.tsx:65`).

## Mutation

Measured by this review in `packages/client`, two scoped runs, one at a time.

Run 1 (`src/ports/citySearch.ts, src/adapters/city-search/createCompositeCitySearch.ts, src/controller/useCityLabels.ts, src/controller/useLocations.ts, src/presenter/presentLocationRows.ts`):

- `ports/citySearch.ts` — 100 % (1 killed)
- `adapters/city-search/createCompositeCitySearch.ts` — 97.87 % (46 killed, 1 no coverage: an `ArrayDeclaration` at l. 100, untouched by this branch)
- `controller/useCityLabels.ts` — 100 % (20 killed)
- `controller/useLocations.ts` — 100 % (11 killed)
- `presenter/presentLocationRows.ts` — 94.74 % (18 killed, 1 survived: `markKind === undefined ? …` → `false ? …` at l. 59, untouched by this branch and equivalent, since `marks[undefined]` is `undefined`)

Run 2 (`src/presenter/presentSearchResults.ts, src/presenter/countryName.ts, src/presenter/dateTimeFormatters.ts, src/presenter/dateBar.ts, src/presenter/calendarMonth.ts`):

- `presentSearchResults.ts` — 100 %, `countryName.ts` — 100 %, `dateBar.ts` — 100 %, `calendarMonth.ts` — 100 % (1 timeout), `dateTimeFormatters.ts` — 100 % (5 timeouts, counted as detected)

No file is below 90 %, and no survivor sits on a line this branch changed.

## Findings

### R1 — WARNING — City labels ignore zone cities data loaded later by the search
- Location: `packages/client/src/controller/useCityLabels.ts:24-35`
- Rule: FR1 / FR4 of `show-city-labels-in-interface-language` (spec "City label in the interface language": the stored label is shown only "until the zone cities data is loaded, or when loading fails")
- Problem: `useCityLabels` takes the loaded search only from its `useState` initializer (`readLoadedCitySearch(load)` on mount) and from its own `loadCitySearchOnce(load).then(setLoadedSearch, () => undefined)` in an effect keyed on `[hasCityLocation, load]`. When that first load rejects, `cityDataCache.ts` drops the rejected promise, and opening the search makes `useCitySearch` (`useCitySearch.ts:43-56`) load again through the same loader. That second load succeeds and fills `readLoadedCitySearch(load)`, but `useCityLabels` never reads it: `loadedSearch` stays `undefined` and the effect does not run again while `hasCityLocation` stays true. `useExemplarCity.ts:31` avoids this with `(loadedSearch ?? readLoadedCitySearch(load))`. `useCityLabels` does not have that fallback.
- Impact: the app starts with a failed load (first launch offline before the service worker cached the file, or a network error). The user later opens the search and it loads the data. Then they switch the interface language. Every listed city keeps its stored label: Tokyo added in Russian still reads «Токио» in English. That is the reported bug, for the rest of the session, even though the data is in memory. The device time location in the same list does change language, so the screen mixes languages.
- Fix: in `useCityLabels`, compute `const availableSearch = loadedSearch ?? readLoadedCitySearch(load);` and build the map from `availableSearch` in the `useMemo`, with deps `[locations, cityNameLanguage, availableSearch]`. This is the pattern `useExemplarCity` already uses. Add a case to `controller/useCityLabels.test.tsx`: the loader rejects once, then `loadCitySearchOnce(load)` succeeds (as the search's retry does), and after a re-render with a language switch the map holds "Tokyo" for the Russian-stored Tokyo.
- Fix risk: low. `readLoadedCitySearch` returns the same instance on every call, so the memo stays stable on minute ticks and NFR-P1 (0 lookups on a tick) still holds. The rows pick up the data on the next re-render of `useLocations` (a list change, a language switch or a minute tick), not at the moment the search finishes loading. This matches `useExemplarCity` and is enough for the switch scenario.
- Status: open

### R2 — WARNING — Task 3.4 is ticked but `useCityLabels` is not exported from `controller/index.ts`
- Location: `packages/client/src/controller/index.ts:1-34`
- Rule: `.claude/rules/process-invariants.md` (module boundaries: "Import only through `index.ts` of a module"); `openspec/changes/show-city-labels-in-interface-language/tasks.md` task 3.4 ("create `controller/useCityLabels.ts` (design D3), export it from `controller/index.ts`, and call it from `useLocations`")
- Problem: task 3.4 is marked `[x]`, but `controller/index.ts` has no `useCityLabels` export. The hook is used only through the relative import `./useCityLabels` in `useLocations.ts:13` and its test.
- Impact: the task record claims work that was not done, so the change cannot be archived as fully implemented. Any later consumer outside `controller/` would have to import from the module's internals, which breaks the "imports only through `index.ts`" invariant (`process-invariants.md`). Today nothing breaks at runtime.
- Fix: add `export { useCityLabels } from "./useCityLabels";` to `packages/client/src/controller/index.ts`, in alphabetical order after the `useCalendarMonth` export.
- Fix risk: none functionally. It adds a public export that no code outside the module uses yet. The sibling `useExemplarCity` is not exported either, so the export makes the module a little less uniform.
- Status: open

### R3 — SUGGESTION — "A label the data does not know" passes before the zone cities data has loaded
- Location: `packages/client/src/test/features/locations/locations_city_label_language_unit.feature:64-69` and `packages/client/src/test/features/locations/steps/locations_city_label_language_unit.steps.tsx:160-166`
- Rule: `.claude/rules/bdd-unit.md` (the scenario must verify the spec scenario it names); spec scenario "A label the data does not know" ("**WHEN** the user opens the app and the zone cities data finishes loading **THEN** the row reads "Edo"")
- Problem: the feature drops the spec's "and the zone cities data finishes loading" step. With `DataMode.LOADED`, the world creates a new loader per `openApp`, so the data arrives asynchronously after the first render. Before that, the row already shows the stored "Edo". `expectRowReads` (`waitFor(getByText("Edo"))`) therefore passes on the first render, whether or not the label would change after the load.
- Impact: at the row level the scenario cannot catch a regression where an unknown label is replaced after the load (for example `getCityLabel` returning `record.names[language]` without the `isCityNameOfRecord` check). Only the adapter contract case `Edo` → `Edo` catches it today, and the executable spec does not prove what it claims.
- Fix: make the scenario follow the spec. Use `And the zone cities data has not been loaded` (`world.givenData(DataMode.HELD)`), then `When the user opens the app` and `And the zone cities data finishes loading` (`world.whenDataFinishesLoading`, already used by "Stored label until the data is loaded"), then `Then the row reads "Edo"`. Change the feature and steps file together, keeping the scenario name.
- Fix risk: none. Both steps already exist in the same steps file and world. The steps file is already 224 lines, and this adds about 4 more.
- Status: open

## Verdict

Not ready. The blocking finding is R1: in one reachable state (first load failed, then the search loaded the data), the reported bug comes back. R2 should be fixed together with R1 so that the ticked task is true. R3 is optional.

Out of scope, not a finding: i18next picks plural forms with `new Intl.PluralRules(code)` (`node_modules/i18next`, `getRule`). A future dialect whose code `Intl` does not know would get the device's plural rules for its base-language texts. No such dialect ships today, and the change does not touch i18next.
