# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`, or say "from the repository root". "design Dn" refers to `design.md`.

- **Running tests:** one command at a time, never in the background. Stryker runs only with `--mutate`, at most 5 files per run. Its report is `reports/mutation/mutation-report.json`.
- **E2E runs:** every Playwright command after a `.feature` edit starts with `npx bddgen -c playwright.bdd.config.ts && ` (the order of the `test:bdd` script).
- **Traceability:** every new or changed test, step and scenario carries `add-interface-language-selection`:
  - `@add-interface-language-selection @FR-X` tags above scenarios; a changed existing scenario keeps its old tags and adds these;
  - `// @add-interface-language-selection @FR-X` above `f.Scenario` in unit steps;
  - `// Verifies FR-X of add-interface-language-selection` above E2E steps and in Vitest files;
  - `Implements FR-X of add-interface-language-selection (Dn)` in the JSDoc of new or changed production code.
- **Glossary:** use the terms of `docs/glossary/`: interface language, locale metadata, locale registry, dialect, preferences, settings page, city label, country code.
- **File size:** every file stays under 200 lines; split by aspect when one would grow past it.
- **TDD:** for production code, write the named test first, run it and see it fail, then implement (`.claude/rules/tdd-workflow.md`).

## 1. Glossary and architecture docs (FR1, FR9, FR10)

- [x] 1.1 Update the docs (repository root), design D9:
  - `docs/glossary/settings.md`:
    - add **Interface language** — the language of every interface text, date, country name and city name of search results. It is chosen in the language group of the settings page, or, when none is chosen, it follows the browser language and then falls back to English. *Code:* the owners of design D9. *RU:* «Язык интерфейса»; the group caption is «Язык».
    - add **Locale metadata** — the `_meta` block of a locale file: `code` (equal to the file name, a canonical language tag), `name` (English name, the sort key), `nativeName`, `baseLanguage`, `emoji`. It is never a translation. *Code:* `LocaleMetadata`, `parseLocaleMetadata`.
    - add **Locale registry** — every locale file whose locale metadata is complete and valid, collected automatically and sorted by `name`. It is the only source of the supported languages, the i18next resources and the settings list. City data is kept for `CITY_NAME_LANGUAGES` only. *Code:* `localeRegistry`, `buildLocaleRegistry`, `RegisteredLocale`, `SUPPORTED_LANGUAGES`.
    - add **Dialect** — a locale whose `baseLanguage` differs from its `code`; easter-egg languages are dialects. A missing text or language-keyed value comes from the base language, then English. *Code:* `resolveLanguageFallbacks`, `pickByLanguageFallback`.
    - change **Settings page** to "the page with the Gnomish Factory credit, the theme preference, the hour format and the interface language".
    - change **Preferences** to name "the theme preference, the hour format and the interface language".
  - `docs/glossary/README.md`: the Settings row of the context table becomes "the settings page, the theme preference, the hour format, the interface language, the locale registry".
  - `docs/glossary/locations.md`, **Country code**: keep "per interface language" and link it as `[interface language](settings.md)`.
  - `docs/architecture/domain-model.md`:
    - `string language "planned: ru | en | dialect code"` becomes `string? interfaceLanguage "registered locale code; null = follow the browser"`;
    - the preferences command list says `SET_INTERFACE_LANGUAGE` instead of `SET_LANGUAGE`;
    - the commands bullet adds `SET_INTERFACE_LANGUAGE`.
  - `docs/architecture/views.md`, Settings overlay row: "language and view mode later" becomes "interface language (collapsible list of the locale registry); view mode later".
  - `docs/architecture/overview.md`, "Where things live": the `locales/` line becomes `locales/  locale files and the locale registry (index.ts), dialects`.

  Verify from the repository root:
  - `grep -c "Interface language\|Locale metadata\|Locale registry\|Dialect" docs/glossary/settings.md` prints at least `4`;
  - `grep -c "SET_LANGUAGE\b\|language and view mode later" docs/architecture/domain-model.md docs/architecture/views.md` prints `0` for each file;
  - `wc -l docs/glossary/settings.md` is under 200.

## 2. Locale registry (FR3, FR9, FR11; design D4)

- [x] 2.1 RED: `locales/localeMetadata.test.ts` for `parseLocaleMetadata(meta, fileCode)`. Cases, with `it.each`:
  - complete metadata → returned;
  - each of the 5 fields missing, empty, or not a string → `undefined`;
  - `code` ≠ `fileCode` → `undefined`;
  - `code` `en_pirate` (with `fileCode` `en_pirate`) → `undefined`;
  - `code` `en-us` (not canonical) → `undefined`;
  - `meta` `null` or a string → `undefined`.

  Run `npx vitest run src/locales/localeMetadata.test.ts` and see it fail.
- [x] 2.2 GREEN: `locales/localeMetadata.ts` with `LocaleMetadata` and `parseLocaleMetadata`; the tag check is `Intl.getCanonicalLocales(code)[0] === code` inside `try`. Verify the test passes.
- [x] 2.3 RED: `locales/localeRegistry.test.ts` for `buildLocaleRegistry(localeModules)`, with fixture module maps keyed `./<code>.json`:
  - 3 valid files `ru` (Russian), `de` (German), `en` (English) → codes `en`, `de`, `ru`, sorted by `name`;
  - translations contain no `_meta` key, and other keys are kept;
  - an invalid file is skipped while the others stay;
  - a path not matching `./<code>.json` is skipped.

  Also test the real `localeRegistry`:
  - it contains `DEFAULT_LANGUAGE`;
  - `SUPPORTED_LANGUAGES` equals its codes (`["en", "ru"]`);
  - its English entry has `metadata.emoji` 🇺🇸 (FR11);
  - `findRegisteredLocale("ru")?.metadata.nativeName` is «Русский»;
  - `findRegisteredLocale("xx")` is `undefined`.

  Run it and see it fail.
- [x] 2.4 GREEN: `locales/localeRegistry.ts`:
  - `RegisteredLocale`, `buildLocaleRegistry` (sorting with one `Intl.Collator(DEFAULT_LANGUAGE)`);
  - `localeRegistry` from `import.meta.glob("./*.json", { eager: true, import: "default" })`;
  - `DEFAULT_LANGUAGE = "en"`, `type InterfaceLanguageCode = string`, `SUPPORTED_LANGUAGES`, `findRegisteredLocale`.

  In `locales/en.json`, change `_meta.emoji` to 🇺🇸. Verify the test passes.
- [x] 2.5 RED → GREEN: `locales/languageFallbacks.test.ts`, then `locales/languageFallbacks.ts` (design D5). Use a fixture registry with `en`, `ru` and a dialect `ru-KZ` (`baseLanguage` `ru`), passed as the `registry` argument:
  - `resolveLanguageFallbacks`: `ru-KZ` → `["ru-KZ", "ru", "en"]`; `ru` → `["ru", "en"]`; `en` → `["en"]`; `xx` → `["en"]`.
  - `pickByLanguageFallback`: picks the first defined value along the order, so `ru-KZ` over `{ en: 7, ru: 1 }` → `1`; with the real `FIRST_DAY_OF_WEEK_BY_LANGUAGE` and the fixture registry, `ru-KZ` → `1` (Monday); without the `registry` argument, `ru-KZ` (absent from the real registry) → `7`.
  - `resolveCityNameLanguage`: `ru-KZ` → `"ru"`; `de` (registered in the fixture, base `de`) → `"en"`.
  - `CITY_NAME_LANGUAGES = ["en", "ru"] as const` and `type CityNameLanguage` go into `constants/search.ts`.
- [x] 2.6 RED → GREEN: `locales/resolveInterfaceLanguage.test.ts`, then `locales/resolveInterfaceLanguage.ts` (design D3). Cases with a fixture registry `en`, `ru`, `ru-KZ`:
  - the chosen `ru` with browser `en-US` → `ru`;
  - the chosen `xx` with browser `ru-RU` → `ru`;
  - no choice with browser `ru-RU` → `ru`; `de-DE`, `ru` → `ru`; `en-US` → `en`; `de-DE` → `en`; `[]` → `en`;
  - `ru-KZ` → `ru-KZ` (exact match); `ru-kz` → `ru-KZ` (canonicalized);
  - a malformed browser value such as `"ru_RU"` is skipped without throwing.
- [x] 2.7 RED → GREEN: `locales/filterLocales.test.ts`, then `locales/filterLocales.ts`. It uses `normalizeSearchText` from `@/adapters`. The fixture is the 10 locales of the spec: `en` English, `ru` Русский/Russian, `de` Deutsch/German, `fr` Français/French, `es` Español/Spanish, `it` Italiano/Italian, `pt` Português/Portuguese, `ja` 日本語/Japanese, `uk` Українська/Ukrainian, `pl` Polski/Polish. Put the fixture in `test/factories/localeFixtures.ts`, so tasks 2.8, 8.4 and 9.2 reuse it. Expected results:
  - `deu` → `de`; `GERMAN` → `de`; ` ru ` → `ru`; `рус` → `ru`; `francais` → `fr`;
  - `zzz` → none; an empty text → all 10, in registry order.
- [x] 2.8 `locales/index.ts` exports the public API of tasks 2.2–2.7, then add the unit BDD feature:
  - `test/features/app_shell/app_shell_locale_registry_unit.feature`, with the scenarios "Registry from locale files" (its step asserts the exact order `en`, `de`, `ru`), "Rejected locale files" (all 4 rows), "Metadata is not a translation", "American flag for English" and "Browser language decides without a choice" (all 4 rows);
  - "A chosen language wins over the browser" and "A dialect is not picked by its base language" assert the resolved code here (the first render is checked in 7.4 and 10.3);
  - steps in `steps/app_shell_locale_registry_unit.steps.ts`, using `buildLocaleRegistry` with fixture module maps and `resolveInterfaceLanguage`.

  Update `locales/locales.test.ts` to import `SUPPORTED_LANGUAGES` from `@/locales`.

  Verify, one at a time: `npx vitest run src/locales` passes, and `npx vitest run src/test/features/app_shell/steps/app_shell_locale_registry_unit.steps.ts` passes.

## 3. i18next from the registry, dialect fallback, no detector (FR7, FR9, FR10; design D3, D4, D5)

- [x] 3.1 `lib/browserLanguages.ts` exports `readBrowserLanguages(navigatorLike = globalThis.navigator)`. It returns `navigatorLike.languages` when non-empty, else `[navigatorLike.language]`, and `[]` when neither exists. Test it first in `lib/browserLanguages.test.ts` with fake navigator objects, then implement.
- [x] 3.2 RED: rewrite `i18n.test.ts` for `createI18nOptions(registry)`, with `i18next.createInstance().init(createI18nOptions(fixture))` and no detector:
  - the resources hold no `_meta`;
  - `supportedLngs` are the registry codes;
  - `load` is `currentOnly`;
  - `escapeValue` is `false`;
  - `app.title` is "Time Zones" for `en` and «Часовые пояса» for `ru`, with the real registry;
  - the dialect fallback with the `ru-KZ` fixture: key `a` from `ru-KZ`, `b` from `ru`, `c` from `en` (M5).

  Remove the test "should store the chosen language under the language key" (design D2). Run `npx vitest run src/i18n.test.ts` and see it fail.
- [x] 3.3 GREEN: rewrite `i18n.ts`:
  - `createI18nOptions(registry)` builds `resources`, `supportedLngs`, `fallbackLng` (from `resolveLanguageFallbacks(code, registry).slice(1)` per code, plus `default: [DEFAULT_LANGUAGE]`), `load: "currentOnly"` and `interpolation`.
  - Initialization uses `lng: resolveStartInterfaceLanguage()`, an exported function returning `resolveInterfaceLanguage(readStoredInterfaceLanguage(), readBrowserLanguages())`. `readStoredInterfaceLanguage` returns `preferences.interfaceLanguage` of a `LOADED` `localStoragePreferencesRepository.load()` and `null` otherwise. Until task 6 lands, it returns `null`; task 6.6 completes it.
  - Remove `LanguageDetector`, `LANGUAGE_STORAGE_KEY`, `languageResolutionOptions`, `localeResources` and the hand-written `SUPPORTED_LANGUAGES` / `SupportedLanguage` / `DEFAULT_LANGUAGE`. They now come from `@/locales`. Until task 4.4 moves the importers, `i18n.ts` keeps temporary re-exports for them: `DEFAULT_LANGUAGE`, `SUPPORTED_LANGUAGES`, the `InterfaceLanguageCode` type, and the alias `export type SupportedLanguage = InterfaceLanguageCode`, so the ~20 modules that `import type { SupportedLanguage } from "@/i18n"` still resolve.
  - The registry types `SUPPORTED_LANGUAGES` as `readonly string[]`, so `zoneCitiesSource.ts` (indexing `names: { en; ru }`) does not typecheck again until task 4.2 retypes the city data. `pnpm --filter @time-zones/client typecheck` is therefore verified at the end of task 4.4, not here; Vitest (esbuild, no type check) runs the suites in between.

  - `test/setup.ts` imports `languageResolutionOptions` and `localeResources` from `@/i18n` for the global i18next init that every Vitest test runs (design D8). Change it to import `createI18nOptions` from `@/i18n` and `localeRegistry` from `@/locales`, and init with `{ ...createI18nOptions(localeRegistry), lng: "ru", fallbackLng: "ru" }`, so jsdom tests keep the translation resources and today's fallback.

  Run `pnpm --filter @time-zones/client remove i18next-browser-languagedetector`. Verify, one at a time:
  - `npx vitest run src/i18n.test.ts` passes;
  - `grep -rn "languageResolutionOptions\|localeResources\|languagedetector" src package.json` prints nothing;
  - `npx vitest run src/app/settings` passes (jsdom suites that render translated text through `test/setup.ts`, so they fail if the setup loses its resources).
- [x] 3.4 Add "Fallback order of a dialect" to `test/features/app_shell/app_shell_locale_registry_unit.feature`, with steps using `createI18nOptions` and the `ru-KZ` fixture. Verify that steps file passes.

## 4. One active interface language; city names and weeks through the fallback order (FR5, FR10; design D3, D5)

- [x] 4.1 RED → GREEN: `controller/useActiveInterfaceLanguage.ts` (with `useActiveInterfaceLanguage.test.tsx`) returns `{ code, locale, cityNameLanguage }` from `i18n.resolvedLanguage ?? i18n.language` via `findRegisteredLocale` and `resolveCityNameLanguage`. Test it with a test i18next instance switched between `en` and `ru`. Export it from `controller/index.ts`.
- [x] 4.2 Retype the city data:
  - `CityRecord.names` (`ports/citySearch.ts`) and `ZoneCityData.names` (`adapters/city-search/citySource.ts`) become `Record<CityNameLanguage, string>`;
  - `CitySearch.search(query, cityNameLanguage)` and `getExemplarCity(timeZoneId, cityNameLanguage)` take `CityNameLanguage`;
  - `zoneCitiesSource.ts` iterates `CITY_NAME_LANGUAGES` instead of `SUPPORTED_LANGUAGES`;
  - `createCompositeCitySearch.ts` keeps `new Intl.Collator(...)` on the city-name language;
  - `presentSearchResults(results, locations, language)` gets the context `{ language, cityNameLanguage }`, with `names[cityNameLanguage]` for the city and `language` for `presentCountryName`.

  Update `citySearch.contract.ts`, `compositeCityFixtures.ts` and `test/features/location_search/steps/searchWorld.ts` types. No module under `ports/` or `adapters/` imports `@/i18n` afterwards. Verify:
  - `grep -rn "@/i18n" src/ports src/adapters` prints nothing;
  - `npx vitest run src/adapters/city-search` passes;
  - `npx vitest run src/presenter` passes.
- [x] 4.3 `FIRST_DAY_OF_WEEK_BY_LANGUAGE` (`constants/date.ts`) becomes `Readonly<Record<string, number>>`. `presenter/calendarMonth.ts` and `controller/useCalendarMonth.ts` read it through `pickByLanguageFallback`. Add tests to `presenter/calendarMonth.test.ts`: with the language `ru` weeks start on Monday, with `en` on Sunday. The presenter reads the value through `pickByLanguageFallback`; the dialect order is tested at that owner (task 2.5, design D5). Verify `npx vitest run src/presenter` passes.
- [x] 4.4 Replace the cast `(i18n.resolvedLanguage ?? i18n.language) as SupportedLanguage` with `useActiveInterfaceLanguage()` in `useCitySearch`, `useWallTimeInput`, `useExemplarCity`, `useReferenceMoment`, `useCalendarMonth`, `useLocations`, and use its `code` in `useDocumentLanguage`. `useExemplarCity` and `useCitySearch` pass `cityNameLanguage` to the search. Rename every remaining `SupportedLanguage` to `InterfaceLanguageCode` (imported from `@/locales`) in `presenter/` (production and test files), `adapters/city-search/`, `ports/`, `constants/date.ts` and `test/features/**/steps/` (task 4.2 retypes the city-name uses to `CityNameLanguage` first). Every import of `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE` or the language type from `@/i18n` (for example `views/viewRegistry.test.ts` and the steps under `test/features/`) moves to `@/locales`; the default `i18n` export stays in `@/i18n`. Remove the temporary re-exports from `i18n.ts`, the `SupportedLanguage` alias included. Verify, one at a time (this is the first typecheck since task 3.3):
  - `grep -rn "SupportedLanguage\|as SupportedLanguage\|resolvedLanguage ??" src` lists only `controller/useActiveInterfaceLanguage.ts`;
  - `pnpm --filter @time-zones/client typecheck` passes;
  - `npx vitest run src/controller` passes.
- [x] 4.5 Add "Language-keyed data of a dialect" to `app_shell_locale_registry_unit.feature`. Its steps build a fixture registry with `en`, `ru` and the dialect `ru-KZ` (base `ru`) and pass it as the `registry` argument (design D5): with the city search built by `createCompositeCitySearch(zoneCities)` from `virtual:zone-cities`, as `controller/useExemplarCity.test.tsx` does, `getExemplarCity("Asia/Almaty", resolveCityNameLanguage("ru-KZ", fixtureRegistry))` is «Алматы», and `pickByLanguageFallback("ru-KZ", FIRST_DAY_OF_WEEK_BY_LANGUAGE, fixtureRegistry)` is `1` (Monday first). Verify the steps file passes.

## 5. Preferences model (FR7, FR8; design D1)

- [ ] 5.1 RED: in `preferences/preferences.test.ts`:
  - `DEFAULT_PREFERENCES.interfaceLanguage` is `null`;
  - `SET_INTERFACE_LANGUAGE` sets the code, and the same code returns the same object;
  - `parseStoredPreferences` accepts `interfaceLanguage` `null` or `"ru"`, and rejects a missing field, `""`, `42` and `{}`.

  Run `npx vitest run src/preferences` and see it fail.
- [ ] 5.2 GREEN: add `interfaceLanguage: string | null` to `Preferences` and `DEFAULT_PREFERENCES`, `SET_INTERFACE_LANGUAGE` to `PreferencesCommandType` / `PreferencesCommand` / `reducePreferences`, and the check to `parseStoredPreferences`. Export the type through `preferences/index.ts`. Verify `npx vitest run src/preferences` passes.

## 6. Preferences document version 2 and the legacy key (FR8, FR12; design D2)

- [ ] 6.1 Move `PayloadMigrations` and `migratePayload` from `adapters/locationsDocument.ts` to a new `adapters/payloadMigrations.ts` (exported), and import them back in `locationsDocument.ts`. No behaviour change. Verify `npx vitest run src/adapters/localStorageLocationRepository.migration.test.ts` passes.
- [ ] 6.2 In `constants/preferences.ts`, set `PREFERENCES_SCHEMA_VERSION = 2`, add `LANGUAGE_SEARCH_MIN_LOCALES = 10` (with JSDoc naming FR6). In `constants/storage.ts`, add `LEGACY_STORAGE_KEYS = { LANGUAGE: "language" } as const`, with JSDoc saying i18next wrote it before this change. Export all three by name from `constants/index.ts`.
- [ ] 6.3 RED: `adapters/preferencesDocument.test.ts` with fixtures of old data:
  - version 1 `{ theme: "DARK", hourFormat: "H12" }` with legacy `"ru"` → `LOADED`, `interfaceLanguage` `"ru"`;
  - the same with no legacy value → `interfaceLanguage` `null`;
  - version 2 round-trips through `serializePreferencesDocument`;
  - version 3 → `UNREADABLE`, and so is version 2 with a missing `interfaceLanguage`, and invalid JSON;
  - `null` → `EMPTY`.

  Run it and see it fail.
- [ ] 6.4 GREEN: `adapters/preferencesDocument.ts` with `serializePreferencesDocument`, `deserializePreferencesDocument(rawDocument, legacyInterfaceLanguage)` and `createPreferencesMigrations(legacyInterfaceLanguage)`, built on `payloadMigrations.ts`. Then change `adapters/localStoragePreferencesRepository.ts`:
  - `load` reads the legacy key too: no document plus a non-empty legacy key → `LOADED` with defaults and that language;
  - `save` writes the document and removes `LEGACY_STORAGE_KEYS.LANGUAGE`;
  - `clear` removes both.

  Verify `npx vitest run src/adapters/preferencesDocument.test.ts` passes.
- [ ] 6.5 Update the existing tests:
  - in `adapters/preferencesRepository.contract.ts` and `adapters/preferencesRepository.test.ts`, the stored document is version 2 with `interfaceLanguage`;
  - add "should load the legacy key without a document and write nothing", "should remove the legacy key on save" and "should remove the legacy key on clear" for the local-storage adapter;
  - add an `interfaceLanguage` round trip to the shared contract, for both adapters;
  - in `test/features/settings/steps/settings_storage_unit.steps.tsx`, the expected payload of "then the stored document holds the theme Dark and the hour format 12-hour" adds `interfaceLanguage: null`.

  Verify, one at a time: `npx vitest run src/adapters` passes; `npx vitest run src/test/features/settings/steps/settings_storage_unit.steps.tsx` passes.
- [ ] 6.6 Complete `readStoredInterfaceLanguage` in `i18n.ts` (task 3.3) with `localStoragePreferencesRepository.load()`. Add to `i18n.test.ts`: with `localStorage` holding a version 2 document with `"ru"` and browser `en-US` (stubbed with `vi.spyOn(navigator, "languages", "get")`, as `i18n.test.ts` does today), the start language computed by the exported `resolveStartInterfaceLanguage()` is `ru`; with only the legacy key `"ru"` it is `ru` too. Verify `npx vitest run src/i18n.test.ts` passes.

## 7. Controller: choose, apply, reset (FR5, FR7, FR12; design D1, D3)

- [ ] 7.1 RED → GREEN: in `controller/PreferencesProvider.test.tsx`, `setInterfaceLanguage("ru")` updates `preferences.interfaceLanguage` at once and writes once after the debounce. Then add `setInterfaceLanguage` to `PreferencesContextValue` (`controller/preferencesContext.ts`) and `PreferencesProvider`.
- [ ] 7.2 RED: `controller/useInterfaceLanguage.test.tsx`. With a test i18next instance, the in-memory preferences repository and the browser languages stubbed per test with `vi.spyOn(navigator, "languages", "get").mockReturnValue([...])` (this overrides the setup pin of task 7.3):
  - a choice of `ru` switches `i18n.language` to `ru` before the next paint (`useLayoutEffect`; assert right after `act`);
  - Reset with browser `en-US` brings back `en`;
  - an external change to `ru` through a shared backend applies `ru`;
  - an unchanged resolved language does not call `changeLanguage` again (spy).

  Run it and see it fail.
- [ ] 7.3 GREEN: `controller/useInterfaceLanguage.ts`. Export it from `controller/index.ts` and call it in `AppShellContent` (`app/AppShell.tsx`) next to `useThemePreference()`. Pin the browser languages for jsdom (design D8). jsdom reports `navigator.languages` as `["en-US"]`, so without a pin every rendered `AppShell` with no chosen language would switch i18next to `en`, while the jsdom suites set the language themselves with `i18n.changeLanguage("ru")` or `("en")` before rendering `AppShell` (for example `app/AppShell.test.tsx`, `app/AppShell.settings.test.tsx`, `app/AppShell.notices.test.tsx`, `app/AppShell.pageNotices.test.tsx`, `test/features/locations/steps/deviceTimeWorld.tsx`, `test/features/main_page/steps/main_page_unit.steps.ts`, `test/features/app_shell/steps/app_shell_update_recheck.steps.ts`). In `test/setup.ts`, after the i18next init, define `navigator.languages` and `navigator.language` as configurable getters returning the active i18next language (`[i18n.language]` and `i18n.language`). With no chosen language, the resolved language then equals the one the test set, so `useInterfaceLanguage` calls nothing, and today's behaviour holds. Tests that need a specific browser language override the getter with `vi.spyOn` (tasks 6.6, 7.2, 7.4); restoring the spy (`vi.restoreAllMocks()` in `afterEach`) brings the pin back.

  Verify, one at a time, that these pass: `npx vitest run src/controller/useInterfaceLanguage.test.tsx`; `npx vitest run src/app`; `npx vitest run src/test/features/main_page src/test/features/locations src/test/features/app_shell` (unit BDD worlds that render `AppShell`).
- [ ] 7.4 Unit BDD `test/features/settings/settings_language_unit.feature`, steps in `steps/settings_language_unit.steps.tsx` (reuse `settingsWorld.tsx`; split the steps file if it passes 200 lines). Scenarios from the spec delta:
  - "Choosing Russian applies at once" — rendered `AppShell` in jsdom: the heading «Настройки», then after going back the country «Казахстан», the Russian weekday, and the search offering «Алматы»;
  - "The language survives a reload" — re-render a new `AppShell` over the same storage: the main heading «Часовые пояса» in the first commit;
  - "Migration of the previous document";
  - "Legacy key without a document";
  - "A chosen code that is no longer registered";
  - "Reset returns to the browser language";
  - "Language without storage";
  - "Another tab changes the language".

  Scenarios that name a browser language ("Reset returns to the browser language", "Legacy key without a document") stub it with `vi.spyOn(navigator, "languages", "get")` over the setup pin of task 7.3.

  Verify `npx vitest run src/test/features/settings/steps/settings_language_unit.steps.tsx` passes.

## 8. The language group on the settings page (FR1–FR6, FR13, NFR-A1, NFR-A2, UX1–UX4; design D6)

- [ ] 8.1 Add the keys to every locale file:
  - `settings.languageLabel`: "Language" / «Язык»;
  - `settings.languageButton`: "Language: {{language}}" / «Язык: {{language}}»;
  - `settings.languageSearch`: "Search languages" / «Поиск языка»;
  - `settings.languageNotFound`: "No languages found" / «Языки не найдены».

  Verify `npx vitest run src/locales/locales.test.ts` passes (identical key sets).
- [ ] 8.2 RED: `app/settings/InterfaceLanguageGroup.test.tsx` (RTL, jsdom; split into `InterfaceLanguageGroup.keyboard.test.tsx` if it passes 200 lines):
  - header comment `// Verifies FR2, FR3, FR4, FR6, NFR-A1, NFR-A2, UX1, UX4 of add-interface-language-selection (D6).`;
  - collapsed: one button whose text holds "🇺🇸" and "English", `aria-expanded="false"`, no list;
  - expanding → `aria-expanded="true"`, `aria-controls` equals the list `id`, the rows "English" then "Русский" by accessible name (emoji `aria-hidden`), the active row has `aria-current="true"` and the classes `border-accent` and a check icon, the other has `border-border`;
  - the chevron has `rotate-180` only while expanded;
  - the native name span has `lang="ru"`;
  - choosing "Русский" calls `onChoose("ru")`, collapses and focuses the button;
  - Arrow Down / Arrow Up move the focus between rows;
  - Escape collapses, focuses the button, and a `document` keydown listener does not see the event; Escape while collapsed reaches it;
  - with the 10-locale fixture a `searchbox` named "Search languages" exists, with 2 locales none;
  - typing filters per task 2.7, and `zzz` shows "No languages found";
  - no class name contains `gray-`.

  Run it and see it fail.
- [ ] 8.3 GREEN: `app/settings/InterfaceLanguageGroup.tsx` and `app/settings/InterfaceLanguageList.tsx` per design D6. In `SettingsPage.tsx`, render `<InterfaceLanguageGroup activeCode={useActiveInterfaceLanguage().code} onChoose={setInterfaceLanguage} />` after the hour format group, and extend the JSDoc. Verify, one at a time:
  - `npx vitest run src/app/settings` passes;
  - `npx vitest run src/app/AppShell.settings.test.tsx` passes.
- [ ] 8.4 Unit BDD `test/features/settings/settings_language_search_unit.feature`, steps in `steps/settings_language_search_unit.steps.tsx`: "No search field below the threshold", "Filtering at the threshold" (all 5 rows, with the 10-locale fixture through the `locales` prop) and "Nothing found". Add "Names are not translated" (`@add-interface-language-selection @FR3 @UX1`) to `settings_language_unit.feature` (task 7.4). "Collapsed group" and "Expand and collapse" assert the place of the group and of the list, so they live in the E2E feature (task 10.3). Verify both steps files pass, one at a time.

## 9. Performance bound (NFR-P1; design D7)

- [ ] 9.1 Add `test/features/settings/settings_language_budget_unit.feature` for the two language scenarios of the MODIFIED requirement "Preferences are fast" (settings spec delta), with steps in `steps/settings_language_budget_unit.steps.ts` that reuse `hourFormatBudgetWorld.ts` and `startWorkCount()`:
  - "Presenting again with the same language builds no formatter" (50 locations in `en`, presented again: 0 formatter builds);
  - "Switching the language builds one formatter per zone and kind" (50 locations in 50 zones in `en`, then `ru`: at most one formatter per zone and label kind in use).

  Tag both `@add-interface-language-selection @NFR-P1`. Verify the steps file passes.
- [ ] 9.2 Add a case "present 50 rows after a language switch" to `test/benchmarks/rowPresenting.bench.ts`, with a `// Verifies NFR-P1 of add-interface-language-selection` comment. Verify `pnpm --filter @time-zones/client bench` runs it; it reports timings and never fails on them.

## 10. E2E in a real browser (FR2, FR5, FR7, FR8, NFR-A1–NFR-A3, NFR-R1, NFR-R2)

- [ ] 10.1 Fix the seeds that write the current preferences version with the old payload. A version 2 document ignores the legacy key (design D2), so a fixed `interfaceLanguage: null` would drop a language set by `seedLanguage` in the same scenario (for example "Hour labels on one line in Russian" in `time_selection/time_selection_card_layout_e2e.feature` would run in English):
  - `seedLanguage` in `locations_ui_e2e.fixtures.ts` also records the language on the world as `seededInterfaceLanguage: string | null` (initially `null`);
  - the step "the stored preferences are theme {word} and hour format {word}" in `test/features/settings/steps/settings_theme_e2e.steps.ts` and `seedTwelveHourState` in `test/features/locations/steps/locationsSeedHelpers.ts` write `interfaceLanguage: world.seededInterfaceLanguage` (so `null` when no language was seeded); the language step runs before the preference step, as it does in that scenario;
  - "Hour labels on one line in Russian" gets a last step `And the locations page language is "ru"`, a new step next to "the locations interface language is Russian" in `test/features/home_location/steps/home_location_e2e.steps.ts` that asserts `<html lang>` on `locationsWorld.page`, so the scenario cannot pass in English.

  Keep `seedLanguage` writing the legacy key, but replace its local `const LANGUAGE_STORAGE_KEY = "language"` with `LEGACY_STORAGE_KEYS.LANGUAGE` from `@/constants` (task 6.2), and change its comment to "the legacy key, migrated by the app (FR8 of add-interface-language-selection)". Then `grep -rn "LANGUAGE_STORAGE_KEY" src` prints nothing. Verify, one at a time: `pnpm --filter @time-zones/client typecheck` passes; `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/time_selection/time_selection_card_layout_e2e.feature --grep "Hour labels on one line in Russian"` passes.
- [ ] 10.2 In `test/features/settings/settings_e2e.feature`, change the outline "Both languages":
  - add the column `language group` (Language / Язык);
  - "the groups are named "<theme>" and "<hour format>"" becomes "the groups are named "<theme>", "<hour format>" and "<language group>"" (update the step in `settings_e2e.steps.ts`);
  - add `@add-interface-language-selection @FR13`.

  Add `@add-interface-language-selection @NFR-R2` to "Approved screenshots of the settings at <width> px in the <theme> theme" and re-approve: `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_e2e.feature --grep "Approved screenshots of the settings" --update-snapshots`. Then run the same command without `--update-snapshots` and see it pass.
- [ ] 10.3 New `test/features/settings/settings_language_e2e.feature` with steps in `steps/settings_language_e2e.steps.ts` (keyboard and layout steps in `steps/settings_language_layout_e2e.steps.ts` if needed), using `settingsE2eHelpers.ts`, `AxeBuilder` as in `locations_view_a11y_e2e.steps.ts`, and the existing steps "the locations screen uses the <theme> theme", "the screen is {int} px wide for the locations", "the locations screen matches the approved screenshot" and `the user presses the key {string}`. Scenarios:
  - "Collapsed group" (FR1, FR2; the group follows the hour format group by box position);
  - "Expand and collapse" (FR2, FR3, FR4, UX2: the list's box top is at or below the button's box bottom, and the box of the following content moves down by the list's height);
  - "Choosing Russian applies at once" (FR5, M2, UX3: count `framenavigated` events of the main frame during the choice, expecting 0, and `window.scrollY` is unchanged by the choice);
  - "The language survives a reload" (FR7; also the `<html lang>` `ru` and the title «Часовые пояса» right after reload);
  - "Legacy key without a document" (FR8, via `seedLanguage("ru")` and browser `en-US`);
  - "The language changes while the app is open" (app-shell);
  - "Name and state of the button" (NFR-A1);
  - "Choosing with the keyboard", "Escape collapses first" (NFR-A2);
  - "No violations" with all 4 rows (NFR-A3, M3), plus every row and the button at least 44 px high;
  - "Same width as the other groups" (NFR-R1: the group's box width equals the theme radio group's, ±1 px);
  - "Narrow and wide screens with the list expanded" (NFR-R1);
  - "Approved language screenshots" with all 4 rows (NFR-R2, M7);
  - a step asserting the button text contains "🇺🇸 English" (FR11), independent of fonts.

  Approve the new screenshots with `--update-snapshots` scoped by `--grep "Approved language screenshots"`. Open the 375 px PNGs under `src/test/features/__screenshots__/chromium/` with the Read tool and confirm:
  - the group is under the hour format group, at the same width;
  - the expanded list sits in the flow, with the chosen row marked by the accent border and the check;
  - the dark theme uses the dark tokens;
  - the flag glyph for English is the one the runner draws for 🇺🇸.

  Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_language_e2e.feature` passes.
- [ ] 10.4 Add `@add-interface-language-selection @FR7` to the outline "User sees the app in their browser language" of `test/features/app_shell/app_shell_smoke_e2e.feature`. Run that feature: `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/app_shell/app_shell_smoke_e2e.feature`. It must pass with the detector gone, because the browser language is now read by `readBrowserLanguages`.

## 11. Final checks

- [ ] 11.1 Stryker, scoped, one run at a time, at most 5 files per run:
  - `npx stryker run --mutate 'src/locales/localeMetadata.ts,src/locales/localeRegistry.ts,src/locales/languageFallbacks.ts,src/locales/resolveInterfaceLanguage.ts,src/locales/filterLocales.ts'`;
  - `npx stryker run --mutate 'src/i18n.ts,src/lib/browserLanguages.ts,src/adapters/preferencesDocument.ts,src/adapters/payloadMigrations.ts,src/adapters/localStoragePreferencesRepository.ts'`;
  - `npx stryker run --mutate 'src/preferences/preferencesCommands.ts,src/preferences/parseStoredPreferences.ts,src/controller/useInterfaceLanguage.ts,src/controller/useActiveInterfaceLanguage.ts,src/controller/PreferencesProvider.tsx'`;
  - `npx stryker run --mutate 'src/app/settings/InterfaceLanguageGroup.tsx,src/app/settings/InterfaceLanguageList.tsx,src/app/settings/SettingsPage.tsx,src/presenter/presentSearchResults.ts,src/presenter/calendarMonth.ts'`;
  - `npx stryker run --mutate 'src/adapters/locationsDocument.ts,src/preferences/preferences.ts,src/adapters/city-search/zoneCitiesSource.ts,src/adapters/city-search/createCompositeCitySearch.ts,src/locales/index.ts'`;
  - `npx stryker run --mutate 'src/controller/useCitySearch.ts,src/controller/useWallTimeInput.ts,src/controller/useExemplarCity.ts,src/controller/useReferenceMoment.ts,src/controller/useCalendarMonth.ts'`;
  - `npx stryker run --mutate 'src/controller/useLocations.ts,src/controller/useDocumentLanguage.ts,src/app/AppShell.tsx'`.

  These 33 files are every production file of this change with new or changed logic (M6). Left out, because the change adds no mutable code to them: the files touched only by the `SupportedLanguage` → `InterfaceLanguageCode` type rename (the other `presenter/` files, `ports/citySearch.ts`), the type-only `controller/preferencesContext.ts`, the constants-only `constants/date.ts`, `constants/preferences.ts`, `constants/storage.ts`, and the re-export barrels `constants/index.ts`, `controller/index.ts`, `preferences/index.ts`.

  After each run, read `reports/mutation/mutation-report.json`. Kill survivors with tests until each file scores at least 95 % (minimum acceptable 90 %), and note the scores in this task (M6). A survivor that existed before this change may be noted as pre-existing, with its line.
- [ ] 11.2 Run, one at a time:
  - `pnpm --filter @time-zones/client typecheck`;
  - `pnpm --filter @time-zones/client lint`;
  - `pnpm --filter @time-zones/client test`;
  - `pnpm run build` (from the repository root);
  - `pnpm --filter @time-zones/client check:bundle-size`;
  - `pnpm --filter @time-zones/client check:legacy-build`;
  - `pnpm --filter @time-zones/client test:bdd`.

  All pass.
- [ ] 11.3 Traceability, from `packages/client/`: `for id in FR1 FR2 FR3 FR4 FR5 FR6 FR7 FR8 FR9 FR10 FR11 FR12 FR13 NFR-P1 NFR-A1 NFR-A2 NFR-A3 NFR-R1 NFR-R2 UX1 UX2 UX3 UX4; do grep -rlE "add-interface-language-selection.*\b$id\b|\b$id\b.*add-interface-language-selection" src >/dev/null || echo "missing $id"; done` prints nothing. Also check that `wc -l` of every new or changed file under `src/` is under 200.

## Human follow-up

None. Every step of this change is a checkbox task above: the docs edits, the dependency removal, the screenshot approval and the scoped Stryker runs. The deliver stage pushes the branch and opens the pull request.
