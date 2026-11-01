# Tasks

Paths are relative to `packages/client/` unless they start with `docs/`. Run tests strictly one command at a time (`CLAUDE.md`).

## 1. Glossary and architecture docs (FR1, FR4, FR5)

- [x] 1.1 Update the glossary in the same change (`.claude/rules/glossary.md`):
  - `docs/glossary/locations.md` **City label**: "the city name a location is shown with, in the nominative case. Stored as the user added it; a row shows the name of its zone's city record in the interface language when the stored label is one of that record's names, otherwise the stored label." *Code:* `label` (stored), `cityLabel` (row), `CitySearch.getCityLabel`, `isCityNameOfRecord`, `useCityLabels`. Keep the *Never:* list.
  - `docs/glossary/settings.md` **Interface language**: add "city label of a city location" to the list of what it governs.
  - `docs/glossary/settings.md` **Dialect**: add "dates, weekdays, months and country names formatted through `Intl` use the same order as their locale list".
  - `docs/glossary/search.md` **Exemplar city**: add `CitySearch.getCityLabel` to *Code:*.
  - `docs/architecture/domain-model.md`: next to `string label "city name"`, note that the label is stored as added and shown in the interface language by the presenter.

  Verify from the repository root: `grep -n "getCityLabel" docs/glossary/locations.md docs/glossary/search.md` and `grep -n "Intl" docs/glossary/settings.md` each print a line, and `wc -l docs/glossary/*.md` shows every file under 200 lines.

## 2. Port and adapter: the city label of a stored label (FR1; TDD, design D2)

- [x] 2.1 RED: create `ports/citySearch.test.ts` (`// Verifies FR1 of show-city-labels-in-interface-language (D2).`) with `it.each` cases for `isCityNameOfRecord`: a Tokyo record (`{ en: "Tokyo", ru: "Токио" }`) with "Tokyo" → true, "Токио" → true, "Edo" → false, "" → false. In `presenter/presentSearchResults.test.ts` keep the existing `isAdded` tests (they must stay green). In `adapters/city-search/citySearch.contract.ts` add `getCityLabel` cases (`// FR1: city label in the city-name language`): `Asia/Tokyo` stored "Токио" with `en` → "Tokyo"; stored "Tokyo" with `ru` → «Токио»; stored "Edo" → "Edo"; a zone without a record (`Mars/Olympus_Mons`) stored "Base" → "Base". Run `npx vitest run src/ports/citySearch.test.ts`, then `npx vitest run src/adapters/city-search/createCompositeCitySearch.exemplarCity.test.ts`, and see the new tests fail.
- [x] 2.2 GREEN: add `isCityNameOfRecord` to `ports/citySearch.ts` (exported from `ports/index.ts`) and `getCityLabel` to the `CitySearch` interface, with the JSDoc `Implements FR1 of show-city-labels-in-interface-language (D2).` Implement it in `adapters/city-search/createCompositeCitySearch.ts` through `recordsById`. Switch `presentSearchResults`' `isAdded` to `isCityNameOfRecord`. Verify, one at a time: `npx vitest run src/ports`, `npx vitest run src/adapters/city-search`, `npx vitest run src/presenter/presentSearchResults.test.ts`.

## 3. Controller and presenter: rows follow the language (FR1–FR4, NFR-P1; TDD, design D3, D4)

- [x] 3.1 RED: in `presenter/presentLocationRows.test.ts` add (`// Verifies FR1, FR3 of show-city-labels-in-interface-language (D4).`): with `cityLabels` mapping Tokyo's ID to "Tokyo", a Tokyo location stored as «Токио» gets `cityLabel` "Tokyo" and a `wallTimeInputLabel` starting "Enter time — Tokyo"; without `cityLabels`, or with no entry for its ID, it keeps «Токио»; the device time location ignores `cityLabels`. Run `npx vitest run src/presenter/presentLocationRows.test.ts` and see them fail.
- [x] 3.2 GREEN: add `cityLabels?: ReadonlyMap<string, string>` to `LocationRowsContext` (`presenter/presentZoneMoment.ts`) and use it in `presentLocationRows` (design D4). Add `Implements FR1, FR3 of show-city-labels-in-interface-language (D4).` to its JSDoc. Verify `npx vitest run src/presenter`.
- [x] 3.3 RED: create `controller/useCityLabels.test.tsx` (`// Verifies FR1, FR2, FR4, NFR-P1 of show-city-labels-in-interface-language (D3).`). Use `renderHook` with a loader resolving to `createCompositeCitySearch` over fixture zone cities that include Tokyo, and a counting `vi.fn` loader. Cases:
  - `undefined` before the load resolves;
  - the map in English, then in Russian after `i18n.changeLanguage("ru")`;
  - a rejected load keeps `undefined` and starts no second load on re-render, nor after removing or reordering a location;
  - no load for an empty list or a list with only the device time location;
  - a re-render with the same inputs returns the same map instance and calls `getCityLabel` 0 times (`vi.spyOn` on the loaded search);
  - one load shared with `useExemplarCity` (the loader called once).

  Run `npx vitest run src/controller/useCityLabels.test.tsx` and see it fail.
- [x] 3.4 GREEN: create `controller/useCityLabels.ts` (design D3), export it from `controller/index.ts`, and call it from `useLocations` with `rest.loadCitySearch`. Pass the map in the rows context and add it to the `useMemo` dependencies. Extend the JSDoc of both with `Implements FR1, FR2, FR4, NFR-P1 of show-city-labels-in-interface-language (D3).` Verify `npx vitest run src/controller/useCityLabels.test.tsx`, then `npx vitest run src/controller`. A test there that asserted "no load for a city list" is updated to an empty list, with a `// Verifies FR4 of show-city-labels-in-interface-language` comment.

## 4. Presenter: `Intl` uses the fallback order (FR5; TDD, design D5)

- [x] 4.1 RED: create `presenter/intlDialectFallback.test.ts` (`// Verifies FR5, M4 of show-city-labels-in-interface-language (D5).`). It uses `vi.mock("@/locales/localeRegistry", …)`, adding a `tlh` locale with base `ru` built by `buildRegisteredLocale` (`test/factories/localeFixtures.ts`). First it asserts `Intl.DateTimeFormat.supportedLocalesOf(["tlh"])` is empty. Then, with `it.each`:
  - `presentCountryName("KZ", "tlh")` equals `presentCountryName("KZ", "ru")`;
  - `formatLocalDate` of a fixed `ZonedDateTime` with `tlh` equals it with `ru`;
  - the `presentDateBar` weekday labels and the `presentCalendarMonth` weekday labels with `tlh` equal those with `ru`;
  - `en`, `ru` and `ru-KZ` outputs are unchanged.

  Run `npx vitest run src/presenter/intlDialectFallback.test.ts` and see the `tlh` cases fail.
- [x] 4.2 GREEN: pass `[...resolveLanguageFallbacks(language)]` as the locale argument in `presenter/countryName.ts`, `presenter/dateTimeFormatters.ts`, `presenter/dateBar.ts` and `presenter/calendarMonth.ts` (design D5), keeping the cache keys. Add `Implements FR5 of show-city-labels-in-interface-language (D5).` to each touched JSDoc. Verify, one at a time: `npx vitest run src/presenter/intlDialectFallback.test.ts`, `npx vitest run src/presenter`, `npx vitest run src/test/features/settings/steps/settings_language_budget_unit.steps.ts` (the formatter bounds of the language switch still hold), and `pnpm --filter @time-zones/client typecheck`.

## 5. Unit BDD (FR1–FR5, NFR-P1, UX1, UX2)

- [x] 5.1 Create `test/features/locations/locations_city_label_language_unit.feature` ("Implements change show-city-labels-in-interface-language."). It holds the scenarios of the spec requirement "City label in the interface language" that assert visible text and storage:
  - "Added in Russian, shown in English" and "Added in English, shown in Russian" (`@FR1 @FR2 @UX2`);
  - "A switch keeps the stored list" (`@FR2`);
  - "Stored label until the data is loaded" (`@FR4 @UX1`) and "Loading fails" (`@FR4`);
  - "A label the data does not know" (`@FR1`);
  - "A dialect reads its base language" (`@FR1`, using `DIALECT_REGISTRY` and `resolveCityNameLanguage`);
  - "Removal is announced with the new city label" (`@FR3`): the polite announcement text, not an accessible name.

  Tag each with `@show-city-labels-in-interface-language`. Write the steps in `steps/locations_city_label_language_unit.steps.tsx`: the real `LocationsProvider`, the in-memory location repository, a loader over fixture zone cities, `fakeClock` and `i18n.changeLanguage`. The storage check compares the location repository's stored document before and after the switches, and "A switch keeps the stored list" switches to Russian and back to English before it. Verify `npx vitest run src/test/features/locations/steps/locations_city_label_language_unit.steps.tsx`.
- [x] 5.2 Create `test/features/locations/locations_city_label_budget_unit.feature` with "A minute tick asks for no city label" and "A switch asks once per location" (`@show-city-labels-in-interface-language @NFR-P1 @M3`). It uses 50 city locations from `buildBudgetLocations` (`steps/rowBudgetWorld.ts`), the loaded search's `getCityLabel` counted with `vi.spyOn`, and formatter builds from `startWorkCount()` (`test/workCounters.ts`). Steps in `steps/locations_city_label_budget_unit.steps.tsx`. Verify `npx vitest run src/test/features/locations/steps/locations_city_label_budget_unit.steps.tsx`.
- [x] 5.3 Benchmark (NFR-P1, ADR-0008): create `test/benchmarks/cityLabels.bench.ts` (`// Verifies NFR-P1 of show-city-labels-in-interface-language.`). It times building the city labels of 50 city locations after a language switch, as `rowPresenting.bench.ts` times rows. Verify that `pnpm bench` lists it in `reports/bench/bench.json` and that `node scripts/check-bench-budgets.mjs` exits 0.
- [x] 5.4 Create `test/features/app_shell/app_shell_dialect_intl_unit.feature` with "Intl data of a dialect Intl does not know" (`@show-city-labels-in-interface-language @FR5`). Write its steps in `steps/app_shell_dialect_intl_unit.steps.ts` with the `vi.mock` of task 4.1 (design D5). Verify `npx vitest run src/test/features/app_shell/steps/app_shell_dialect_intl_unit.steps.ts`.
- [x] 5.5 Update the scenarios that encoded the old rules (design D6), adding `@show-city-labels-in-interface-language @FR4` (or `@FR2` for the settings one) to each:
  - `locations_device_time_data_unit.feature` "No load without the device time location" → `Given the list is empty` (a new step next to `the list is {string}` in `steps/locations_device_time_data_unit.steps.tsx`);
  - `settings_language_unit.feature` "Choosing Russian applies at once" → `after going back Almaty reads «Алматы» and shows the country «Казахстан»`, with its step expecting «Алматы»;
  - `locations_device_time_unit.feature` "Device time location on the design sample" (`@show-city-labels-in-interface-language @FR1`, design D6): the zone cities data is loaded before the check, so `the rows show the offset differences` expects the localized names, `"Москва −2 ч, Калькутта +0:30, Нью-Йорк −9 ч"`, with each name read from the `names.ru` of its record in the zone cities data (correct the expectation if a name differs). `DIFFERENCE_ENTRY_PATTERN` of its steps already splits Cyrillic names;
  - add to `locations_device_time_data_unit.feature` the scenario "One request for city labels and the device time location" (`@show-city-labels-in-interface-language @FR4 @M2`) of the locations spec delta: `Given the device time zone is "Asia/Almaty"`, `the list is "the device time location, Tokyo"` (the unit worlds resolve Tokyo through `KNOWN_CITIES` of `test/factories/buildLocation.ts`), the existing `When the user opens the app, the zone cities data finishes loading, and the user opens the search` and `Then the zone cities data was requested exactly once`. Both triggers (`useExemplarCity` and `useCityLabels`) run under the real `LocationsProvider` here.

  Verify, one at a time: `npx vitest run src/test/features/locations/steps/locations_device_time_data_unit.steps.tsx`, `npx vitest run src/test/features/settings/steps/settings_language_unit.steps.tsx`, `npx vitest run src/test/features/locations/steps/locations_device_time_unit.steps.tsx`, then `npx vitest run src/test/features`.

## 6. E2E (FR2, FR3, FR4, NFR-A1)

- [x] 6.1 Add «Токио» (`Asia/Tokyo`, label «Токио», `JP`) to `KNOWN_CITIES` in `test/features/locations/steps/locationsE2eHelpers.ts`, next to «Москва». Create `test/features/locations/locations_city_label_language_e2e.feature` with:
  - "Switching relabels the row" (`@FR2 @M1`): stored «Токио», interface English via the settings language group, the card reads "Tokyo"; back to Russian it reads «Токио»; the stored `localStorage` locations document is unchanged (the preferences document may change);
  - "Texts that name the city follow" (`@FR3 @NFR-A1`): the location menu button named "Actions for Tokyo" and the time button's name starting with "Enter time — Tokyo";
  - an outline "Accessible after a switch in the <theme> theme" (`@NFR-A1 @M5`) for light and dark, reusing "the locations screen has no accessibility violations" (`locations_view_a11y_e2e.steps.ts`);
  - "One request for city labels and the search" (`@FR4 @M2`): stored Tokyo, the search data requested exactly once after the first render and a later opening of the search.

  Tag every scenario with `@show-city-labels-in-interface-language`. Put new steps in `steps/locations_city_label_language_e2e.steps.ts`, and reuse the settings language steps of `settings/steps/settings_language_e2e.steps.ts`. Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/locations/locations_city_label_language_e2e.feature`.
- [x] 6.2 In `locations_ui_e2e.feature` "Data loads only when the search opens" and `locations_search_shortcut_e2e.feature` "The slash key loads the search data only when it opens the search", replace `Given the stored locations are "Almaty"` with the existing `Given the stored list is empty`. Add `@show-city-labels-in-interface-language @FR4` (design D6). In `locations_ui_e2e.feature` "The device time location's request is the only one" (the location-search delta's "The Here entry's request is the only one"), change the Given to `Given the stored locations are "the device time location", "Tokyo"` and add `@show-city-labels-in-interface-language @FR4 @M2`, so the page's two triggers share one request. Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/locations/locations_ui_e2e.feature`, then the same for `locations_search_shortcut_e2e.feature`.

  Then rewrite the E2E scenarios of design D6 that look a row up by a stored label in another language than the interface, adding `@show-city-labels-in-interface-language @FR1` to each. First add «Алматы» (`Asia/Almaty`, `KZ`) and «Калькутта» (`Asia/Kolkata`, `IN`) to `KNOWN_CITIES` in `steps/locationsE2eHelpers.ts`, and check that every Russian entry used below («Алматы», «Москва», «Белград», «Остров Лорд-Хау», «Калькутта») equals the `names.ru` of its zone's record in `virtual:zone-cities`; correct an entry that differs.
  - `home_location/home_location_e2e.feature` "Russian interface": `the list holds "Алматы", "Москва" and home is "Алматы"`, `the location menu named "Действия: Москва"`, `the row of "Алматы"`;
  - `locations/locations_clock_change_note_e2e.feature` "No horizontal scrolling with notes at <width> px at <moment>": `the stored locations are "Алматы", "Белград", "Остров Лорд-Хау"`, and the `city` column of its examples `Белград` / `Остров Лорд-Хау`;
  - `time_selection/time_selection_card_layout_e2e.feature` "Hour labels on one line in Russian": `the stored locations are "Москва", "Калькутта"` and `the hour labels of "Москва", "Калькутта"`;
  - `locations/locations_device_time_e2e.feature` "The exemplar city keeps the height at <width> px": `the stored locations are "the device time location", "Москва"`; in `steps/locations_device_time_e2e.steps.ts` the two card lookups of this scenario (the position recorded before the load and `the Moscow card has not moved`) use a new constant for «Москва», while the English "Narrow and wide screens" scenario keeps `MOSCOW`.

  Verify each rewritten feature file, one at a time, with `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts <feature file>`.
- [ ] 6.3 Run the whole E2E suite once: `pnpm --filter @time-zones/client test:bdd`. If a scenario now sees an extra zone cities request because its list holds a city, rewrite its expectation to the FR4 rule, with a `// Verifies FR4 of show-city-labels-in-interface-language` comment. A scenario that looks a row up by a stored label in another language than the interface is rewritten to the FR1 rule (store the label in the interface language, or expect the localized name), with a `// Verifies FR1 of show-city-labels-in-interface-language` comment; it is not fixed in the code. Fix any other failure in the code. Re-run the failing feature files one at a time until the suite passes.

## 7. Final checks

- [ ] 7.1 Stryker, scoped, one run at a time, from `packages/client/`:
  - `npx stryker run --mutate 'src/ports/citySearch.ts,src/adapters/city-search/createCompositeCitySearch.ts,src/controller/useCityLabels.ts,src/controller/useLocations.ts,src/presenter/presentLocationRows.ts'`;
  - then `npx stryker run --mutate 'src/presenter/presentSearchResults.ts,src/presenter/countryName.ts,src/presenter/dateTimeFormatters.ts,src/presenter/dateBar.ts,src/presenter/calendarMonth.ts'`.

  Read `reports/mutation/mutation-report.json` after each. Kill survivors, including the memo mutants of `useCityLabels` with the budget scenario (ADR-0008), until each run scores at least 95 % (minimum acceptable 90 %, M6).
- [ ] 7.2 Run, one at a time: `pnpm --filter @time-zones/client typecheck`, `pnpm --filter @time-zones/client lint`, `pnpm --filter @time-zones/client test`, `pnpm run build` (from the repository root), `node scripts/check-legacy-build.mjs` and `node scripts/check-bundle-size.mjs`. All pass.
- [ ] 7.3 Traceability, from `packages/client/`: `for id in FR1 FR2 FR3 FR4 FR5 NFR-P1 NFR-A1 UX1 UX2 M1 M2 M3 M4 M5; do grep -rlE "show-city-labels-in-interface-language.*\b$id\b|\b$id\b.*show-city-labels-in-interface-language" src >/dev/null || echo "missing $id"; done` prints nothing. Glossary check: `grep -rniwE "city ?title|cityName" src/presenter/presentLocationRows.ts src/controller/useCityLabels.ts` prints nothing (the row concept is `cityLabel`; `-w` lets the existing `cityNameLanguage` through).

## Human follow-up

None. Every step above runs inside the implement stage, and the deliver stage pushes the branch and opens the pull request.
