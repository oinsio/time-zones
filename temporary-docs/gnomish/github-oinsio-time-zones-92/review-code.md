# Review: add-interface-language-selection

## Summary

| Item | Value |
|---|---|
| Tasks verified | 40/43 |
| Requirements traced | 81/82 |
| CRITICAL | 1 |
| WARNING | 0 |
| SUGGESTION | 3 |

## Tasks

All paths below are under `packages/client/src/` unless they start with `docs/`.

- ✅ 1.1 Glossary and architecture docs: `docs/glossary/settings.md` has the entries Interface language, Locale metadata, Locale registry and Dialect, and the updated Settings page and Preferences entries. `docs/glossary/README.md` updates the Settings row, and `docs/glossary/locations.md` links Country code to the interface language. `docs/architecture/domain-model.md` now has `interfaceLanguage` and `SET_INTERFACE_LANGUAGE`, `views.md` has "interface language (collapsible list …)", and `overview.md` has the `locales/` line.
- ✅ 2.1 `locales/localeMetadata.test.ts` contains `it.each` cases for missing, empty and non-string fields, a foreign code, a non-tag code and a non-canonical code.
- ✅ 2.2 `locales/localeMetadata.ts:34-53` implements `parseLocaleMetadata`, and `isCanonicalLanguageTag` sits at `:21-27`.
- ✅ 2.3 `locales/buildLocaleRegistry.test.ts` has 12 tests: fixture maps, sorting, no `_meta`, skipped files, the real registry, 🇺🇸 and `findRegisteredLocale`. The file name differs from the plan because the registry was split (see 11.1).
- ✅ 2.4 `locales/buildLocaleRegistry.ts:35-47` sorts with a single `Intl.Collator(DEFAULT_LANGUAGE)`. `locales/localeRegistry.ts:13-26` builds the registry with `import.meta.glob`, and also holds `SUPPORTED_LANGUAGES`, `findRegisteredLocale` and `InterfaceLanguageCode`. `locales/en.json` has `"emoji": "🇺🇸"`.
- ✅ 2.5 `locales/languageFallbacks.ts:15-56` contains `resolveLanguageFallbacks`, `pickByLanguageFallback` and `resolveCityNameLanguage`. The tests are in `languageFallbacks.test.ts`. `CITY_NAME_LANGUAGES` and `CityNameLanguage` are in `constants/search.ts:29-31`.
- ✅ 2.6 `locales/resolveInterfaceLanguage.ts:35-48` implements the function, with tests in `resolveInterfaceLanguage.test.ts`. A malformed tag is skipped through `toCanonicalTag` at `:8-14`.
- ✅ 2.7 `locales/filterLocales.ts` uses `normalizeSearchText` from `@/adapters`. The 10-locale fixture is in `test/factories/localeFixtures.ts`.
- ✅ 2.8 `locales/index.ts` is the barrel. `test/features/app_shell/app_shell_locale_registry_unit.feature` and its steps cover the listed scenarios. `locales/locales.test.ts` imports from `@/locales`.
- ✅ 3.1 `lib/browserLanguages.ts:11-16` implements `readBrowserLanguages`, and `lib/browserLanguages.test.ts` has 6 tests.
- ✅ 3.2 `i18n.test.ts` was rewritten around `createI18nOptions`: no `_meta`, `supportedLngs`, `currentOnly`, `escapeValue` and the dialect fallback.
- ✅ 3.3 `i18n.ts:20-41` defines `createI18nOptions` and `i18n.ts:52-61` handles the start language. The detector is gone: `package.json` has no `i18next-browser-languagedetector`, and `test/setup.ts` uses `createI18nOptions(localeRegistry)`.
- ✅ 3.4 "Fallback order of a dialect" is at `app_shell_locale_registry_unit.feature:61`, and its steps use `createI18nOptions` (steps `:225`).
- ✅ 4.1 `controller/useActiveInterfaceLanguage.ts:25-33` implements the hook, with tests in `useActiveInterfaceLanguage.test.tsx`. It is exported from `controller/index.ts`.
- ✅ 4.2 City data is retyped to `CityNameLanguage`. `adapters/city-search/zoneCitiesSource.ts` iterates `CITY_NAME_LANGUAGES`, and `presenter/presentSearchResults.ts` takes `SearchPresentationContext`. `grep "@/i18n" src/ports src/adapters` finds nothing.
- ✅ 4.3 `FIRST_DAY_OF_WEEK_BY_LANGUAGE` is `Readonly<Record<string, number>>` (`constants/date.ts:34-36`). `presenter/calendarMonth.ts` reads it through `resolveFirstDayOfWeek` → `pickByLanguageFallback`. `presenter/calendarMonth.test.ts:23,43` tests Sunday for English and Monday for Russian.
- ✅ 4.4 The six hooks use `useActiveInterfaceLanguage()`, for example `controller/useCitySearch.ts` and `useCalendarMonth.ts`. `useDocumentLanguage.ts:13` uses its `code`. No `SupportedLanguage` is left.
- ✅ 4.5 "Language-keyed data of a dialect" is at `app_shell_locale_registry_unit.feature:70`. Its steps (`:252-261`) check «Алматы» and Monday.
- ✅ 5.1 `preferences/preferences.test.ts` has tests for the `interfaceLanguage` default, the command and parsing.
- ✅ 5.2 The field, `SET_INTERFACE_LANGUAGE` and the parse check are added. Stryker scores `parseStoredPreferences.ts` and `preferencesCommands.ts` at 100 %.
- ✅ 6.1 `adapters/payloadMigrations.ts` owns `migratePayload`, and `locationsDocument.ts` imports it.
- ✅ 6.2 `PREFERENCES_SCHEMA_VERSION = 2` and `LANGUAGE_SEARCH_MIN_LOCALES = 10` are in `constants/preferences.ts`, and `LEGACY_STORAGE_KEYS` is in `constants/storage.ts:20`. All three are exported from `constants/index.ts`.
- ✅ 6.3 `adapters/preferencesDocument.test.ts` has 6 tests covering version 1 with and without the legacy key, the version 2 round trip, version 3, invalid JSON and `null`.
- ✅ 6.4 `adapters/preferencesDocument.ts` is in place. `localStoragePreferencesRepository.ts:45-67` reads the legacy key without writing, `:81-88` makes save remove it, and `:89-93` makes clear remove it.
- ✅ 6.5 `adapters/preferencesRepository.test.ts:117-160` has the "legacy language key" tests. `preferencesRepository.contract.ts:49` round-trips `interfaceLanguage`, and the payload in `settings_storage_unit.steps.tsx` was updated.
- ✅ 6.6 `i18n.ts:45-50` reads `LOADED` preferences. `i18n.test.ts:101-134` tests `resolveStartInterfaceLanguage` with a v2 document, the legacy key, no choice and an unreadable document.
- ✅ 7.1 `controller/PreferencesProvider.tsx:137-141` adds `setInterfaceLanguage`, and `PreferencesProvider.test.tsx:81` tests it.
- ✅ 7.2 `controller/useInterfaceLanguage.test.tsx:47-83` has 5 cases: choice, Reset, another tab, no repeat call, and the browser.
- ✅ 7.3 `controller/useInterfaceLanguage.ts:16-28` uses `useLayoutEffect`. It is called in `app/AppShell.tsx:56`, and `test/setup.ts` pins `navigator.languages`.
- ❌ 7.4 All 8 scenarios plus "Names are not translated" exist in `settings_language_unit.feature`, and their steps are in `settings_language_unit.steps.tsx`. However, the task says "split the steps file if it passes 200 lines", and the file has 279 lines and was not split (R1).
- ✅ 8.1 The four `settings.language*` keys are in `locales/en.json` and `ru.json`, with the Russian glossary names.
- ❌ 8.2 `app/settings/InterfaceLanguageGroup.test.tsx` covers every listed case, including Escape from a row at `:168-179` and the absence of `gray-` at `:191`. However, the task says "split into `InterfaceLanguageGroup.keyboard.test.tsx` if it passes 200 lines", and the file has 254 lines (R1).
- ✅ 8.3 `app/settings/InterfaceLanguageGroup.tsx` and `InterfaceLanguageList.tsx` follow D6. `SettingsPage.tsx` renders the group after the hour format group.
- ✅ 8.4 `settings_language_search_unit.feature` has its 3 scenarios, with steps in `settings_language_search_unit.steps.tsx`. "Names are not translated" is at `settings_language_unit.feature:19`.
- ✅ 9.1 `settings_language_budget_unit.feature` has 2 scenarios tagged `@NFR-P1`, with steps in `settings_language_budget_unit.steps.ts`.
- ✅ 9.2 `test/benchmarks/rowPresenting.bench.ts:125-127` adds "present 50 rows after a language switch".
- ✅ 10.1 `seededInterfaceLanguage` is in `locations_ui_e2e.fixtures.ts:42,119`, `settings_theme_e2e.steps.ts:36` and `locationsSeedHelpers.ts:107`. `time_selection_card_layout_e2e.feature:81` is tagged `@FR8`, and no `LANGUAGE_STORAGE_KEY` is left.
- ✅ 10.2 `settings_e2e.feature:43-52` has the language group column and the tags, and `:86` adds `@NFR-R2`. The 8 re-approved PNGs (chromium and mobile-chrome) are in the diff.
- ✅ 10.3 `settings_language_e2e.feature` has all the listed scenarios, and the 4 approved screenshots exist per project. The chromium light expanded PNG shows 🇺🇸 and the inline list.
- ✅ 10.4 `app_shell_smoke_e2e.feature:17` is tagged `@add-interface-language-selection @FR7`.
- ✅ 11.1 The scores are recorded in `tasks.md:295`. My own runs confirm 100 % for every killable (non-static) mutant except equivalent ones (see Mutation).
- ✅ 11.2 The stage reports CI green.
- ❌ 11.3 The traceability grep finds every id. However, the second check of the task, "`wc -l` of every new or changed file under `src/` is under 200", fails. Four new files exceed it: `app/settings/InterfaceLanguageGroup.test.tsx` (254), `test/features/settings/steps/settings_language_unit.steps.tsx` (279), `test/features/app_shell/steps/app_shell_locale_registry_unit.steps.ts` (269) and `test/features/settings/steps/settings_language_e2e.steps.ts` (234). `controller/PreferencesProvider.test.tsx` grew from 188 to 206 lines. Two more changed files are over 200 lines, but they were already that long before the branch, which changed one line in each (a rename): `test/features/settings/steps/settings_hour_format_unit.steps.tsx` (216) and `test/features/time_selection/steps/time_selection_wall_time_input_unit.steps.tsx` (284) (R1).

## Requirements

- ✅ FR1 — `app/settings/SettingsPage.tsx:126-129` renders the group after the hour format group. The caption classes match the legend (`InterfaceLanguageGroup.tsx:81-86`). E2E "Collapsed group" checks the position.
- ✅ FR2 — The toggle with `aria-expanded`, the chevron with `rotate-180` and the inline list are at `InterfaceLanguageGroup.tsx:87-122`. Unit tests are at `InterfaceLanguageGroup.test.tsx:28-112`, and E2E "Expand and collapse" covers it in the browser.
- ✅ FR3 — Rows show the emoji (`aria-hidden`) and the native name with `lang`, sorted by `name`, at `InterfaceLanguageList.tsx:176-192` and `buildLocaleRegistry.ts:43-45`. Covered by E2E rows and unit BDD "Names are not translated".
- ✅ FR4 — `InterfaceLanguageList.tsx:186,193-195` adds `border-accent` and the `Check` icon. Tested at `InterfaceLanguageGroup.test.tsx:81` and in the E2E step "is marked as chosen".
- ✅ FR5 — `useInterfaceLanguage` (`useLayoutEffect`) plus `useActiveInterfaceLanguage` drive every hook. Unit BDD "Choosing Russian applies at once" checks the heading, «Казахстан», the weekday, «Алматы» and `lang`. E2E checks 0 navigations, the title and `lang`.
- ✅ FR6 — `InterfaceLanguageGroup.tsx:114` uses the threshold and `filterLocales.ts` filters. Covered by `settings_language_search_unit.feature` and `InterfaceLanguageGroup.test.tsx:207-246`.
- ✅ FR7 — `resolveInterfaceLanguage.ts` and `i18n.ts:52-61`. Covered by `resolveInterfaceLanguage.test.ts`, the registry feature's browser outline and E2E "The language survives a reload".
- ✅ FR8 — `localStoragePreferencesRepository.ts:45-93` and `preferencesDocument.ts:15-22`. Covered by `preferencesRepository.test.ts:117-160`, unit BDD Migration and Legacy key, and the E2E legacy scenario.
- ✅ FR9 — `buildLocaleRegistry.ts` and `localeMetadata.ts`. Covered by the registry feature "Registry from locale files", "Rejected locale files" and "Metadata is not a translation".
- ✅ FR10 — `languageFallbacks.ts` and `i18n.ts:30-38` (`fallbackLng`). Covered by "Fallback order of a dialect" and "Language-keyed data of a dialect".
- ✅ FR11 — `locales/en.json` has the emoji 🇺🇸. Covered by "American flag for English" and the E2E button text.
- ✅ FR12 — The preferences document covers the language. Covered by the unit BDD scenarios Reset, Language without storage and Another tab changes the language.
- ✅ FR13 — Keys are in both locale files. Covered by `settings_e2e.feature` "Both languages" with the language group column.
- ✅ NFR-P1 — `settings_language_budget_unit.feature` counts formatters, and there is a bench case.
- ✅ NFR-A1 — `aria-expanded`, `aria-controls`, `aria-label`, `aria-current`, `lang` and `aria-hidden` are set in the group and list files. Unit tests are at `InterfaceLanguageGroup.test.tsx:36-81` and E2E "Name and state of the button" covers it (partly, see R2).
- ✅ NFR-A2 — The arrow, Escape and choice handling is at `InterfaceLanguageGroup.tsx:53-71`. Covered by E2E "Choosing with the keyboard" and "Escape collapses first", and by unit tests `:119-190`.
- ✅ NFR-A3 — E2E "No violations …" in 4 states, plus the 44 px height step.
- ✅ NFR-R1 — E2E "Same width as the other groups" and the 320 and 2560 px outline.
- ✅ NFR-R2 — 4 new and 4 re-approved PNGs per Playwright project, and the PNG shows 🇺🇸.
- ✅ UX1 — Rows are never translated. Covered by "Names are not translated" (Russian interface, English and Russian names).
- ✅ UX2 — The list is in the flow with no portal (`InterfaceLanguageGroup.tsx:108-122`). E2E "the language list sits right under the language button".
- ✅ UX3 — `useLayoutEffect` switches the language. E2E checks the scroll position and that focus returns to the button.
- ✅ UX4 — Only tokens are used (`constants/preferences.ts` `LANGUAGE_BUTTON_CLASS_NAME`). The unit test checks there is no `gray-`, and the dark screenshots are approved.
- ✅ M1 — E2E "Expand and collapse" asserts "🇺🇸 English", then "🇷🇺 Русский".
- ✅ M2 — The E2E step counts `framenavigated` (0), and "The language survives a reload" covers the reload.
- ✅ M3 — The E2E outline "No violations" has 4 rows.
- ✅ M4 — "Registry from locale files" (3 fixtures) and "Rejected locale files" (4 rows).
- ✅ M5 — "Fallback order of a dialect" checks keys `a`, `b` and `c`.
- ⚠️ M6 — `tasks.md:295` records 93.9 % for `InterfaceLanguageGroup.tsx`, below the 95 % target but above the 90 % minimum. My run gives 95.83 % covered: its survivors are equivalent optional-chaining or empty-array mutants. I measured 15 of the 33 files. Nothing worth fixing.
- ✅ M7 — 4 new approved screenshots plus 4 re-approved ones, in both `chromium` and `mobile-chrome`.
- ✅ Scenario: Browser language decides without a choice — `app_shell_locale_registry_unit.feature:36` (4 rows).
- ✅ Scenario: A chosen language wins over the browser — registry feature `:49`, and the first render in `settings_language_unit` "The language survives a reload".
- ✅ Scenario: A chosen code that is no longer registered — `settings_language_unit.feature:50`. Its steps check Russian and that the stored `xx` is unchanged.
- ✅ Scenario: A dialect is not picked by its base language — registry feature `:55`.
- ✅ Scenario: Fallback order of a dialect — registry feature `:61`.
- ✅ Scenario: Language-keyed data of a dialect — registry feature `:70`.
- ✅ Scenario: English user opens the app — `app_shell_smoke_e2e.feature:17` outline (now `@FR7`).
- ✅ Scenario: Russian user opens the app — `main_page/main_page_unit.feature` and the smoke E2E outline.
- ✅ Scenario: The language changes while the app is open — `settings_language_e2e.feature:49`.
- ✅ Scenario: Locale metadata matches the file — `locales/locales.test.ts:48`.
- ✅ Scenario: No missing shell strings — `locales/locales.test.ts:63`.
- ✅ Scenario: Registry from locale files — registry feature `:7`.
- ✅ Scenario: Rejected locale files — registry feature `:13`.
- ✅ Scenario: Metadata is not a translation — registry feature `:26`.
- ✅ Scenario: American flag for English — registry feature `:31`.
- ✅ Scenario: Collapsed group — `settings_language_e2e.feature:7`.
- ✅ Scenario: Expand and collapse — `settings_language_e2e.feature:14`.
- ✅ Scenario: Names are not translated — `settings_language_unit.feature:19`.
- ✅ Scenario: Choosing Russian applies at once — `settings_language_unit.feature:7` and `settings_language_e2e.feature:24`.
- ✅ Scenario: No search field below the threshold — `settings_language_search_unit.feature:7`.
- ✅ Scenario: Filtering at the threshold — `settings_language_search_unit.feature:13` (5 rows).
- ✅ Scenario: Nothing found — `settings_language_search_unit.feature:27`.
- ✅ Scenario: Name and state of the button — `settings_language_e2e.feature:56`. The E2E step skips `aria-controls` and the current row, which only the unit tests check (R2).
- ✅ Scenario: Choosing with the keyboard — `settings_language_e2e.feature:63`.
- ✅ Scenario: Escape collapses first — `settings_language_e2e.feature:74`. The E2E presses Escape with the focus on the button, not on a row as the Given says. The focus-on-a-row case is covered only by `InterfaceLanguageGroup.test.tsx:168` (R4).
- ✅ Scenario: No violations — `settings_language_e2e.feature:85` (4 rows).
- ✅ Scenario: Same width as the other groups — `settings_language_e2e.feature:100` (collapsed) and `:105` (expanded at 320 and 2560 px).
- ✅ Scenario: Narrow and wide screens with the list expanded — `settings_language_e2e.feature:105`.
- ✅ Scenario: Approved language screenshots — `settings_language_e2e.feature:118`.
- ✅ Scenario: Open and leave settings — `settings_e2e.feature:7`, unchanged.
- ✅ Scenario: Esc leaves settings — `settings_e2e.feature:20`. Escape with the list expanded is covered by "Escape collapses first".
- ✅ Scenario: Notices on the settings page — `app/AppShell.settings.test.tsx` and `AppShell.pageNotices.test.tsx`, unchanged behaviour.
- ✅ Scenario: Choices survive a reload — `settings_e2e.feature:142`. The seeds now carry `interfaceLanguage`.
- ✅ Scenario: The language survives a reload — `settings_language_unit.feature:25` and `settings_language_e2e.feature:33`.
- ✅ Scenario: Opening writes nothing — `settings_preferences_unit.feature`, unchanged. The legacy path writes nothing (`preferencesRepository.test.ts:119`).
- ✅ Scenario: Offline reopen — `settings_e2e.feature:155`.
- ✅ Scenario: Migration of the previous document — `settings_language_unit.feature:33`.
- ✅ Scenario: Legacy key without a document — `settings_language_unit.feature:42` and `settings_language_e2e.feature:42`.
- ✅ Scenario: Corrupted preferences — `settings_storage_unit.feature`.
- ✅ Scenario: Reset — `settings_storage_unit.feature`. Clear also removes the legacy key (`localStoragePreferencesRepository.ts:89-93`, tested in `preferencesRepository.test.ts`).
- ✅ Scenario: Reset returns to the browser language — `settings_language_unit.feature:58`.
- ✅ Scenario: Storage unavailable — `settings_storage_unit.feature`.
- ✅ Scenario: Language without storage — `settings_language_unit.feature:66`.
- ✅ Scenario: Another tab changes the hour format — `settings_storage_unit.feature`.
- ✅ Scenario: Another tab changes the language — `settings_language_unit.feature:73`.
- ✅ Scenario: Both languages — `settings_e2e.feature:44` with the `language group` column.
- ✅ Scenario: Narrow and wide screens — `settings_e2e.feature:75` ("Settings fit a screen <width> px wide").
- ✅ Scenario: Approved screenshots — `settings_e2e.feature:87`, re-approved.
- ✅ Scenario: Presenting again builds no formatter — `settings_hour_format_unit.feature`.
- ✅ Scenario: Switching the hour format builds one formatter per zone and kind — `settings_hour_format_unit.feature`.
- ✅ Scenario: Presenting again with the same language builds no formatter — `settings_language_budget_unit.feature:7`.
- ✅ Scenario: Switching the language builds one formatter per zone and kind — `settings_language_budget_unit.feature:13`.

## Mutation

I ran three scoped runs, one at a time and without `--ignoreStatic`, from `packages/client/`. The scores below come from `reports/mutation/mutation-report.json`, as total score (covered score):

- Run 1:
  - `localeMetadata.ts` 94.74 %
  - `buildLocaleRegistry.ts` 82.76 %
  - `languageFallbacks.ts` 87.50 %
  - `resolveInterfaceLanguage.ts` 93.33 %
  - `filterLocales.ts` 100 %
- Run 2:
  - `InterfaceLanguageGroup.tsx` 93.88 % (95.83 % covered)
  - `InterfaceLanguageList.tsx` 100 %
  - `preferencesDocument.ts` 95.83 %
  - `localStoragePreferencesRepository.ts` 87.10 %
  - `useInterfaceLanguage.ts` 100 %
- Run 3:
  - `i18n.ts` 75 % (15/20, all mutants static)
  - `browserLanguages.ts` 83.33 %
  - `payloadMigrations.ts` 100 %
  - `parseStoredPreferences.ts` 100 %
  - `preferencesCommands.ts` 100 %

The survivors fall into two groups:

- **Static mutants.** Every survivor in `buildLocaleRegistry.ts`, `languageFallbacks.ts`, `localStoragePreferencesRepository.ts`, `preferencesDocument.ts`, `i18n.ts` and `browserLanguages.ts`, plus `localeMetadata.ts:46` and `resolveInterfaceLanguage.ts:41`, is a *static* mutant. That code runs at import, when the module-level `localeRegistry`, `localStoragePreferencesRepository` and the `i18n` init are built. The Vitest runner does not re-import for them; `tasks.md:295` scored with `--ignoreStatic` for this reason. The behaviour behind each of them has a direct test. For example, `i18n.ts:45` (`status === LOADED`) is exercised by `i18n.test.ts:111-134`, which calls `resolveStartInterfaceLanguage()` with a v2 document, the legacy key, no document and an unreadable document.
- **Non-static survivors.** Without static mutants, every measured file scores 100 % except the following. All of them are equivalent mutants, so none is a finding:
  - `localeMetadata.ts:24` and `resolveInterfaceLanguage.ts:11` are empty `catch` blocks that still return a falsy `undefined`.
  - `InterfaceLanguageGroup.tsx:50,62` are optional chaining on refs that are always set.
  - `InterfaceLanguageGroup.tsx:64` is the `?? []` array.

I did not measure the other 18 files of M6 (the rename-only hooks, the presenter, the city-search adapters, `AppShell.tsx`, `SettingsPage.tsx`, `PreferencesProvider.tsx`, `useActiveInterfaceLanguage.ts`, `locationsDocument.ts`, `preferences.ts`, `locales/index.ts`).

## Findings

### R1 — CRITICAL — Tasks 7.4, 8.2 and 11.3 are ticked but their file-size conditions are not met
- Location: `packages/client/src/test/features/settings/steps/settings_language_unit.steps.tsx:1`
- Rule: `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity"), `CLAUDE.md` ("Files must stay under 200 lines for AI context quality")
- Problem: Four files this branch added are over 200 lines:
  - `test/features/settings/steps/settings_language_unit.steps.tsx` (279);
  - `test/features/app_shell/steps/app_shell_locale_registry_unit.steps.ts` (269);
  - `app/settings/InterfaceLanguageGroup.test.tsx` (254);
  - `test/features/settings/steps/settings_language_e2e.steps.ts` (234).

  `controller/PreferencesProvider.test.tsx` also grew past the limit, from 188 to 206 lines. Tasks 7.4 ("split the steps file if it passes 200 lines") and 8.2 ("split into `InterfaceLanguageGroup.keyboard.test.tsx` if it passes 200 lines") required splits that were not done. Task 11.3 ("check that `wc -l` of every new or changed file under `src/` is under 200") is ticked although this check fails. The check also fails on two changed files that were already oversize before the branch: `settings_hour_format_unit.steps.tsx` (216) and `time_selection_wall_time_input_unit.steps.tsx` (284). The branch changed one line in each.
- Impact: Three tasks are marked `[x]` in `tasks.md`, yet a condition each one states is not met. The review-code instructions treat a ticked-but-undone task as CRITICAL, because a ticked task is a claim that the work was done. The files also break the project's AI-context size rule, and splitting them would not hurt clarity: each has natural aspect seams (keyboard vs rendering, storage vs choice, start language vs registry). No user-visible behaviour is affected.
- Fix: Split each file along its aspect seams:
  - Move the keyboard cases of `InterfaceLanguageGroup.test.tsx` (`:119-190`, `:236-244`) into `InterfaceLanguageGroup.keyboard.test.tsx`, as task 8.2 names it.
  - Move the keyboard and layout steps of `settings_language_e2e.steps.ts` (focus, 44 px height, width, "sits right under") into `settings_language_layout_e2e.steps.ts`, as task 10.3 names it. playwright-bdd steps are global, so the feature file stays as it is.
  - Split `settings_language_unit.feature` by aspect: keep choice, names, reload and not-registered, and move Migration, Legacy key, Reset, Language without storage and Another tab into a new `settings_language_storage_unit.feature`. Give each feature its own steps file, because `bdd-unit.md` asks for "one steps file per feature file".
  - Split `app_shell_locale_registry_unit.feature` the same way, moving the start-language and dialect scenarios into `app_shell_interface_language_unit.feature` with its own steps file.
  - Move the `setInterfaceLanguage` case of `PreferencesProvider.test.tsx` into a separate file, or trim shared setup.
  - Do not split the two pre-existing oversize files: they belong to other features, and splitting them would widen the change's scope. Instead, reword task 11.3 honestly to "every file under `src/` that this change adds or grows is under 200 lines". Both files changed by a one-line rename, so this wording excludes them and still covers the five files above.
  - Re-run the `wc -l` check, and leave 7.4, 8.2 and 11.3 ticked only once it passes.
  - List the new feature paths in the proposal's Behavior section only if the next stage may edit it; the code split itself needs no spec change.
- Fix risk: Scenario names in the steps files must keep matching the feature text exactly, and every moved scenario must keep its `@add-interface-language-selection @FR-X` tags and `// @… @FR-X` comments. Otherwise vitest-cucumber fails or traceability greps miss ids. The new feature files are not listed in `proposal.md`'s Behavior section, which is a small documentation drift. Moving shared world helpers must keep `settingsLanguageWorld.tsx` as the single world, without duplicating it.
- Status: open

### R2 — SUGGESTION — E2E "Name and state of the button" does not check what its spec scenario states
- Location: `packages/client/src/test/features/settings/steps/settings_language_e2e.steps.ts:172`
- Rule: `.claude/rules/bdd-unit.md` (table: "aria-labels, focus management — Unit BDD: no, E2E BDD: yes")
- Problem: The spec scenario ends "THEN it is expanded and controls a list whose current row is 'English'". The step "the language button is named {string} and {word}" only asserts `aria-expanded`. It never checks that `aria-controls` points at the list `id`, or that the English row has `aria-current="true"`. Those two attributes are asserted only in jsdom (`InterfaceLanguageGroup.test.tsx:44,81`).
- Impact: A real-browser regression of the button–list relation, such as a `useId` mismatch after a refactor, would pass E2E. NFR-A1's `aria-controls` and the current row would then be checked only where `bdd-unit.md` says ARIA should not be verified.
- Fix: In that step, when the state is expanded, read `aria-controls` from the button. Then assert that `page.locator(`[id="${controlsId}"]`)` is the list and that its button named "English" has `aria-current="true"`.
- Fix risk: The `useId` value contains colons, so use an attribute selector rather than `#id`. Otherwise none.
- Status: open

### R3 — SUGGESTION — Language-tag canonicalisation is written twice in the locales module
- Location: `packages/client/src/locales/resolveInterfaceLanguage.ts:8`
- Rule: `.claude/rules/antipatterns.md` ("Second owner of a concept")
- Problem: `resolveInterfaceLanguage.ts:8-14` (`toCanonicalTag`) and `localeMetadata.ts:21-27` (`isCanonicalLanguageTag`) each wrap `Intl.getCanonicalLocales(tag)[0]` in their own `try/catch`. The rule "a tag is compared in its canonical form, and a malformed one is no tag" therefore has two homes, in sibling files of the same module.
- Impact: A later change to canonicalisation could land in one file only. For example, rejecting `und` or private-use tags, or working around an engine that throws differently (ADR-0009 browsers). The registry would then accept codes that the browser matching treats differently, or the reverse. Each copy also leaves an equivalent `catch` mutant (`localeMetadata.ts:24`, `resolveInterfaceLanguage.ts:11`).
- Fix: Keep one helper, for example `toCanonicalLanguageTag(tag): string | undefined` in `localeMetadata.ts` (not exported from `index.ts`). Make `isCanonicalLanguageTag(code)` return `toCanonicalLanguageTag(code) === code`, and import the helper in `resolveInterfaceLanguage.ts` from `./localeMetadata`, which is the same module and allowed.
- Fix risk: Behaviour is unchanged. The existing tests in `localeMetadata.test.ts` and `resolveInterfaceLanguage.test.ts` (`en-us`, `ru_RU`, `en_pirate`) cover both callers.
- Status: open

### R4 — SUGGESTION — E2E "Escape collapses first" presses Escape from the button, not from a row
- Location: `packages/client/src/test/features/settings/settings_language_e2e.feature:74`
- Rule: `.claude/rules/bdd-e2e.md` / `.claude/rules/bdd-unit.md` (keyboard accessibility belongs in E2E)
- Problem: The spec Given is "the language list is expanded with the focus on a row". The E2E scenario expands the list by clicking, which leaves the focus on the toggle button, and then presses Escape. So it never checks in a real browser that Escape from a row collapses the list, refocuses the button and does not reach `AppShell`'s `document` listener. Only jsdom checks the row case (`InterfaceLanguageGroup.test.tsx:168`).
- Impact: A regression that handles Escape only on the toggle button, for example a handler moved from the group `div` to the button, would still pass the E2E suite. Keyboard users who press Escape from a row would then leave the settings page instead of collapsing the list.
- Fix: Add `And the user presses the key "Tab"` after `When the user expands the language group` in that scenario. The step already exists, and the next Tab stop after the button is the first row. Then keep the existing Then steps.
- Fix risk: none. The step is already used by "Choosing with the keyboard" in the same feature.
- Status: open

## Verdict

Not ready. Blocking: R1 (CRITICAL). Tasks 7.4, 8.2 and 11.3 are ticked, but the file splits they require were not done, and the 11.3 size check fails (40/43 tasks verified). The change is not ready until the five files are split, 11.3 is reworded honestly for the two pre-existing oversize files, and the three tasks match their text. Every requirement and scenario is implemented and tested, and the behaviour matches the specs and design D1–D9. R2–R4 are low-stakes improvements and do not block.
