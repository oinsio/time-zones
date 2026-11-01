# Specs review: add-interface-language-selection

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 39/39 |
| Contradictions | 1 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 1 |

## Freshness

- ✅ `src/i18n.ts` imports `en.json` and `ru.json` one by one and passes the whole files, `_meta` included, as resources (`packages/client/src/i18n.ts:4-17`); `SUPPORTED_LANGUAGES = ["en", "ru"]`, `SupportedLanguage`, `DEFAULT_LANGUAGE`, `LANGUAGE_STORAGE_KEY = "language"`, `load: "languageOnly"` and the detector with `caches: ["localStorage"]` are all there (`i18n.ts:8-35`). This matches proposal.md:7 and design.md:7-11.
- ✅ The detector writes to the `language` key, and `i18n.test.ts:43-47` "should store the chosen language under the language key" asserts it (design.md:11, task 3.2).
- ✅ `Preferences { theme, hourFormat }`, `DEFAULT_PREFERENCES`, `reducePreferences` with `SET_THEME` / `SET_HOUR_FORMAT`, and `parseStoredPreferences` rejecting a missing or unknown value (`src/preferences/preferences.ts:19-27`, `preferencesCommands.ts:7-31`, `parseStoredPreferences.ts:14-35`); design.md:12-15.
- ✅ The local-storage preferences adapter writes `{ schemaVersion: PREFERENCES_SCHEMA_VERSION, payload: { theme, hourFormat } }`, treats any other version as `UNREADABLE` and has no migrations (`src/adapters/localStoragePreferencesRepository.ts:25-55`); `PREFERENCES_SCHEMA_VERSION = 1` (`src/constants/preferences.ts:2`); design.md:17-19.
- ✅ `PreferencesProvider` loads once, writes debounced, flushes on `pagehide`, reports `UNREADABLE` and `hasSaveFailed`, offers `resetPreferences` and applies other tabs' changes (`src/controller/PreferencesProvider.tsx:66-141`); design.md:20.
- ✅ ADR-0002 lists "language, hour format, view mode" under Preferences (`docs/adr/0002-model-presenter-swappable-views.md:61`), `docs/architecture/overview.md:104` does the same, and `docs/architecture/domain-model.md:29` and `:70` plan `string language` and `SET_LANGUAGE` (design.md:21, task 1.1).
- ✅ City data is English and Russian only: `CityRecord.names: Record<SupportedLanguage, string>` (`src/ports/citySearch.ts:18`), `ZoneCityData.names: { en: string; ru: string }` (`src/adapters/city-search/citySource.ts:6`), `zoneCitiesSource.ts:83,106` iterates `SUPPORTED_LANGUAGES`, `FIRST_DAY_OF_WEEK_BY_LANGUAGE: Record<SupportedLanguage, number>` (`src/constants/date.ts:36`), and `scripts/zoneData/extractZoneData.ts` exists (design.md:22-26).
- ✅ Six controller hooks cast `(i18n.resolvedLanguage ?? i18n.language) as SupportedLanguage` (`useCitySearch.ts:34`, `useWallTimeInput.ts:34`, `useExemplarCity.ts:20`, `useReferenceMoment.ts:67`, `useCalendarMonth.ts:29`, `useLocations.ts:50`), and `useDocumentLanguage.ts:11` reads the value without the cast (design.md:27).
- ✅ `AppShell` leaves the settings page on any `Escape` through a `document` `keydown` listener (`src/app/AppShell.tsx:73-82`), and `useThemePreference()` is called in `AppShellContent` (`AppShell.tsx:51-53`) (design.md:28, :91; task 7.3).
- ✅ `seedLanguage` writes `localStorage["language"]` through `addInitScript`, with a local `LANGUAGE_STORAGE_KEY = "language"` (`src/test/features/locations/steps/locations_ui_e2e.fixtures.ts:11,108-114`) (design.md:29, :185; task 10.1).
- ✅ `test/setup.ts` imports `languageResolutionOptions` and `localeResources` from `@/i18n` and inits i18next with `lng: "ru"`, `fallbackLng: "ru"` (`src/test/setup.ts:5,32-38`) (design.md:180, task 3.3).
- ✅ `i18n.test.ts` already stubs `vi.spyOn(navigator, "languages", "get")` and calls `vi.restoreAllMocks()` in `afterEach` (`src/i18n.test.ts:9,24-26`) (design.md:181, tasks 6.6, 7.3).
- ✅ The jsdom suites named in task 7.3 exist and switch the language themselves: `app/AppShell.test.tsx:33,44` (`i18n.changeLanguage("en")` / `("ru")`), `AppShell.settings.test.tsx`, `AppShell.notices.test.tsx`, `AppShell.pageNotices.test.tsx`, `deviceTimeWorld.tsx`, `main_page_unit.steps.ts`, `app_shell_update_recheck.steps.ts`.
- ✅ `PayloadMigrations` (exported) and a private `migratePayload` live in `src/adapters/locationsDocument.ts:16,64`, and `localStorageLocationRepository.migration.test.ts` exists (design.md:67, task 6.1).
- ✅ The E2E seeds that write the current preferences version with a `{ theme, hourFormat }` payload are `settings_theme_e2e.steps.ts:28-35` and `locationsSeedHelpers.ts:99-108`. The only other writers are `AppShell.settings.test.tsx:130-136`, which writes a literal `schemaVersion: 1` that D2 migrates, and `settingsWorld.tsx:71`, which writes a non-JSON value (design.md:184, task 10.1).
- ✅ `normalizeSearchText` is exported from `@/adapters` (`src/adapters/index.ts:5`) and does NFD, strips combining marks, lowercases and trims (`src/adapters/city-search/normalizeSearchText.ts:9-15`), so `francais` → Français, ` ru ` → `ru` and `рус` → Русский hold as specified (design.md:157, task 2.7).
- ✅ `KeyboardKey.ESCAPE`, `ARROW_DOWN` and `ARROW_UP` exist (`src/constants/keyboard.ts:3-5`) (design.md:152-153).
- ✅ `tsconfig.app.json` has `vite/client` in `types` and `ES2020` in `lib` (lines 7, 21), and `locales.test.ts:18` already uses `import.meta.glob("./*.json", { eager: true, import: "default" })` (design.md:119).
- ✅ The en/ru `_meta` blocks have the five fields, `en.json` has emoji 🇬🇧 and `ru.json` has 🇷🇺 (`src/locales/en.json:2-8`, `ru.json:2-8`).
- ✅ The reused test infrastructure exists: `src/test/workCounters.ts`, `src/test/benchmarks/rowPresenting.bench.ts`, `test/features/settings/steps/hourFormatBudgetWorld.ts`, `settingsWorld.tsx`, `settingsE2eHelpers.ts`, `test/factories/`, `test/writeSchedulers.ts`. The steps "the screen is {int} px wide for the locations" (`locations_layout_e2e.steps.ts:15`), "the locations screen matches the approved screenshot" (`:63`), "the locations screen uses the (light|dark) theme" (`locations_view_a11y_e2e.steps.ts:18`), "the user presses the key {string}" (`time_selection_pointer_e2e.steps.ts:81`) and "the groups are named {string} and {string}" (`settings_e2e.steps.ts:128`) exist. So do `AxeBuilder` in `locations_view_a11y_e2e.steps.ts:1` and the outline "User sees the app in their browser language" (`app_shell_smoke_e2e.feature:18`).
- ✅ `useExemplarCity.test.tsx:2,5,10` builds `createCompositeCitySearch(zoneCities)` from `virtual:zone-cities` (task 4.5).
- ✅ The package scripts named in tasks exist: `typecheck`, `bench`, `test:bdd`, `check:bundle-size`, `check:legacy-build` (`packages/client/package.json:11-22`).
- ✅ Every MODIFIED requirement exists in `openspec/specs/` under the same name, and its existing scenarios are kept: settings "Open the settings page" (:8), "Preferences are kept on the device" (:123), "Unreadable stored preferences" (:141), "Preferences without storage" (:156), "Preferences are shared between open tabs" (:165), "Settings strings are localized" (:173), "Settings page layout" (:224), "Preferences are fast" (:247); app-shell "Shell shows the app title in the active language" (:9) and "Locale files describe themselves" (:126).
- ✅ Nothing is implemented yet: there is no `src/locales/index.ts`, no `useActiveInterfaceLanguage`, and no archived change that adds a language choice. The only other active change, `add-pr-preview-deploy`, touches `app-delivery` only (proposal.md:3).
- ✅ The glossary has no Interface language, Locale metadata, Locale registry or Dialect entry yet. `docs/glossary/settings.md:5` (Settings page) and `README.md:24` (Settings row) read as task 1.1 quotes them, `locations.md:9` says "per interface language", and `docs/architecture/views.md:111` says "language and view mode later".

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ settings "Interface language choice", "Open the settings page" | ✅ 8.3, 10.3 "Collapsed group" |
| FR2 | ✅ | ✅ "Collapsed group", "Expand and collapse" | ✅ 8.2, 10.3 |
| FR3 | ✅ | ✅ "Expand and collapse", "Names are not translated" | ✅ 8.2, 8.4 |
| FR4 | ✅ | ✅ "Expand and collapse" | ✅ 8.2, 10.3 |
| FR5 | ✅ | ✅ "Choosing Russian applies at once", app-shell "The language changes while the app is open" | ✅ 7.4, 10.3 |
| FR6 | ✅ | ✅ "Language list search" (3 scenarios) | ✅ 2.7, 8.2, 8.4 |
| FR7 | ✅ | ✅ app-shell "Interface language at start", settings "The language survives a reload" | ✅ 2.6, 6.6, 7.4, 10.3, 10.4 |
| FR8 | ✅ | ✅ "Migration of the previous document", "Legacy key without a document" | ✅ 6.2–6.5, 7.4, 10.3 |
| FR9 | ✅ | ✅ app-shell "Registry from locale files", "Rejected locale files", "Metadata is not a translation" | ✅ 2.1–2.4, 2.8, 3.2–3.3 |
| FR10 | ✅ | ✅ app-shell "Fallback order of a dialect", "Language-keyed data of a dialect" | ✅ 2.5, 3.4, 4.3, 4.5 (4.3/4.5 as written cannot pass, R2) |
| FR11 | ✅ | ✅ "American flag for English" | ✅ 2.3–2.4, 10.3 |
| FR12 | ✅ | ✅ "Reset returns to the browser language", "Language without storage", "Another tab changes the language" | ✅ 7.2, 7.4 |
| FR13 | ✅ | ✅ "Settings strings are localized" / "Both languages" | ✅ 8.1, 10.2 |
| NFR-P1 | ✅ | ✅ "Preferences are fast" (2 new scenarios) | ✅ 9.1, 9.2 |
| NFR-A1 | ✅ | ✅ "Name and state of the button" | ✅ 8.2, 10.3 |
| NFR-A2 | ✅ | ✅ "Choosing with the keyboard", "Escape collapses first" | ✅ 8.2, 10.3 |
| NFR-A3 | ✅ | ✅ "No violations" (4 rows) | ✅ 10.3 |
| NFR-R1 | ✅ | ✅ "Same width as the other groups", "Narrow and wide screens with the list expanded" | ✅ 10.3 |
| NFR-R2 | ✅ | ✅ "Approved language screenshots", "Settings page layout" | ✅ 10.2, 10.3 |
| UX1 | ✅ | ✅ "Names are not translated" | ✅ 8.4 |
| UX2 | ✅ | ✅ "Language choice layout" | ✅ 10.3 "Expand and collapse" |
| UX3 | ✅ | ✅ "Interface language choice" (no reload, no loading state) | ✅ 10.3 (scrollY, focus) |
| UX4 | ✅ | ✅ "Language choice layout" | ✅ 8.2 (no `gray-`), 10.3 screenshots |
| M1 | ✅ | n/a | ✅ 2.3, 8.2 |
| M2 | ✅ | n/a | ✅ 10.3 |
| M3 | ✅ | n/a | ✅ 10.3 |
| M4 | ✅ | n/a | ✅ 2.3, 2.8 |
| M5 | ✅ | n/a | ✅ 3.2, 3.4 |
| M6 | ✅ | n/a | ✅ 11.1 (33 files listed) |
| M7 | ✅ | n/a | ✅ 10.2, 10.3 |
| G1 | ✅ | n/a — met by FR1, FR2, FR5 | n/a — met by FR1, FR2, FR5 |
| G2 | ✅ | n/a — met by FR7, FR8 | n/a — met by FR7, FR8 |
| G3 | ✅ | n/a — met by FR9, M4 | n/a — met by FR9, M4 |
| NG1 | ✅ | n/a — only a `ru-KZ` test fixture, no real dialect file | n/a — nothing builds it |
| NG2 | ✅ | n/a — only the 4 language-group keys are added | n/a — nothing builds it |
| NG3 | ✅ | n/a — no "follow the browser" row | n/a — nothing builds it |
| NG4 | ✅ | n/a — city data stays `en`/`ru` (`CITY_NAME_LANGUAGES`) | n/a — nothing builds it |
| NG5 | ✅ | n/a — the theme/hour format groups and the credit are unchanged; only the test step of 10.2 changes | n/a — nothing builds it |
| NG6 | ✅ | n/a — no prompt, no URL parameter | n/a — nothing builds it |

The proposal defines no `Q` ids ("Open Questions: None", proposal.md:177). The storage question is answered in design.md D1/D2.

## Consistency

- design.md:128-129 (D5) gives `pickByLanguageFallback(code, valuesByLanguage)` and `resolveCityNameLanguage(code)` no registry parameter, and `presentCalendarMonth` keeps its `{ focusedDate, selectedDate, today, language }` context (`src/presenter/calendarMonth.ts:50-55`). Yet tasks.md:72-75 (2.5) passes the fixture registry to these functions as "the `registry` argument", and tasks.md:135 (4.3) and tasks.md:140 (4.5) expect `presentCalendarMonth` to start weeks on Monday for the fixture dialect `ru-KZ`, which is absent from the real registry. D5 says such a code resolves to `[DEFAULT_LANGUAGE]` (design.md:125).

## Findings

### R1 — WARNING — Task 10.1's `interfaceLanguage: null` seed turns the Russian card-layout E2E scenario into English
- Location: `openspec/changes/add-interface-language-selection/tasks.md:244` (with `design.md:75` and `:184`)
- Rule: `.claude/rules/process-invariants.md` (an artifact must not silently break what the code and tests already enforce)
- Problem: Task 10.1 makes both E2E preference seeds (`settings_theme_e2e.steps.ts:28-35` "the stored preferences are theme {word} and hour format {word}", and `seedTwelveHourState` in `locationsSeedHelpers.ts:99-108`) write a version 2 document with `interfaceLanguage: null`. D2 decides that for a version 2 document "the legacy key is ignored" (design.md:75). The existing scenario "Hour labels on one line in Russian" (`src/test/features/time_selection/time_selection_card_layout_e2e.feature:82-87`) does both: it sets the language through `seedLanguage("ru")` (the legacy key) and seeds the preferences with that step. After the change, the app reads `interfaceLanguage: null`, ignores the legacy `ru` and resolves the browser language. `playwright.bdd.config.ts` sets no `locale`, so the browser language is Chromium's default, `en-US`, and the scenario runs in English.
- Impact: The scenario guards the stable time-selection requirement that every hour label is on one line "in both hour formats and both interface languages" (`openspec/specs/time-selection/spec.md:461`). Implemented as written, it no longer renders Russian day-period markers. It either fails on its Russian expectations, or it passes while testing English, so the Russian coverage of a stable requirement is lost without notice. Any future scenario that combines the language seed with a preference seed has the same trap.
- Fix: Edit task 10.1 and design.md D8 (line 184). `seedLanguage` also records the seeded language on the `LocationsWorld` (e.g. a `seededInterfaceLanguage` field), and both preference seeds write `interfaceLanguage: world.seededInterfaceLanguage ?? null` instead of a fixed `null`. Add to 10.1's verification: run `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/time_selection/time_selection_card_layout_e2e.feature --grep "Hour labels on one line in Russian"`, and add an assertion that `<html lang>` is `ru` in that scenario, so it cannot pass in English.
- Fix risk: The seeds become order-dependent: the language step must run before the preference step. That holds in `time_selection_card_layout_e2e.feature:83-84`. `seedTwelveHourState` already takes the world, and the step in `settings_theme_e2e.steps.ts` has `locationsWorld` in scope. No production code changes, and D2's rule that a version 2 document ignores the legacy key stays as it is.
- Status: fixed
- Resolution: task 10.1 now has `seedLanguage` record `seededInterfaceLanguage` on the world, and both preference seeds write it (or `null`) instead of a fixed `null`. "Hour labels on one line in Russian" gains the step `the locations page language is "ru"` (asserting `<html lang>`), and 10.1's verification runs that scenario. design.md D8's touched-tests list states the same rule and its reason.

### R2 — WARNING — The dialect week-start and city-name tests cannot reach the fixture registry
- Location: `openspec/changes/add-interface-language-selection/design.md:128-129`, `tasks.md:72-75`, `tasks.md:135`, `tasks.md:140`
- Rule: `.claude/rules/test-planning.md` (every scenario needs step definitions that can pass); `.claude/rules/glossary.md` (one owner of the fallback order)
- Problem: D5 gives only `resolveLanguageFallbacks` a `registry = localeRegistry` parameter. `pickByLanguageFallback(code, valuesByLanguage)` and `resolveCityNameLanguage(code)` have none, and D5 says an unknown code resolves to `[DEFAULT_LANGUAGE]` (design.md:125). Task 2.5 nevertheless tests all three functions with a fixture registry "passed as the `registry` argument" (`resolveCityNameLanguage("ru-KZ")` → `"ru"`). Task 4.3 adds a `presenter/calendarMonth.test.ts` case in which the fixture dialect `ru-KZ` starts weeks on Monday. Task 4.5's step for "Language-keyed data of a dialect" uses `presentCalendarMonth` (Monday first). But `presentCalendarMonth` takes only `{ focusedDate, selectedDate, today, language }` (`src/presenter/calendarMonth.ts:50-55`), so through D5 it reads the real registry. That registry has only `en` and `ru`, so `ru-KZ` falls back to `en`, and weeks start on Sunday (`FIRST_DAY_OF_WEEK_BY_LANGUAGE.en = 7`).
- Impact: Tasks 4.3 and 4.5 fail as written, or the implementer invents an injection path (a registry argument through the presenter context, or a module mock) that no artifact describes. The FR10 language-keyed data rule ("the first day of the week ... follows the same order") then ends up tested in a way nobody planned, or not at all.
- Fix: In design.md D5, give `pickByLanguageFallback(code, valuesByLanguage, registry = localeRegistry)` and `resolveCityNameLanguage(code, registry = localeRegistry)` the same optional `registry` parameter as `resolveLanguageFallbacks`. In task 4.3, replace the `presentCalendarMonth` dialect case with a test in `locales/languageFallbacks.test.ts`: `pickByLanguageFallback("ru-KZ", FIRST_DAY_OF_WEEK_BY_LANGUAGE, fixtureRegistry)` is `1` (Monday). Keep a `calendarMonth.test.ts` case for `ru`, which proves the presenter reads the value through `pickByLanguageFallback`. In task 4.5, the step asserts the week start with `pickByLanguageFallback(..., fixtureRegistry)` and the city with `getExemplarCity("Asia/Almaty", resolveCityNameLanguage("ru-KZ", fixtureRegistry))`.
- Fix risk: The scenario "Language-keyed data of a dialect" is then proven at the level of the fallback owner, not through a rendered calendar for a dialect. That is acceptable, because no real dialect exists (NG1) and the presenter's use of the owner is covered for `ru`. No production behaviour changes, and the default parameter keeps every production call site as D5 describes.
- Status: fixed
- Resolution: design.md D5 gives `pickByLanguageFallback` and `resolveCityNameLanguage` the optional `registry = localeRegistry` parameter and says the dialect order is tested at these owners. Task 2.5 adds `pickByLanguageFallback("ru-KZ", FIRST_DAY_OF_WEEK_BY_LANGUAGE, fixture)` → 1 and the no-registry case → 7. Task 4.3 tests the presenter with `ru` (Monday) and `en` (Sunday) only. Task 4.5's steps pass the fixture registry to `resolveCityNameLanguage` and `pickByLanguageFallback` instead of using `presentCalendarMonth`.

### R3 — SUGGESTION — An existing unit BDD step compares the whole stored payload and is missing from the planned test updates
- Location: `openspec/changes/add-interface-language-selection/design.md:178-185`, `tasks.md:170-175`
- Rule: `.claude/rules/tdd-workflow.md` (verify existing tests when modifying code)
- Problem: The design lists the existing tests this change touches, and task 6.5 updates only `adapters/preferencesRepository.contract.ts` and `adapters/preferencesRepository.test.ts`. But `src/test/features/settings/steps/settings_storage_unit.steps.tsx:92-95` asserts `expect(JSON.parse(world.storedDocument()).payload).toEqual({ theme: ThemePreference.DARK, hourFormat: HourFormat.H12 })`. With D1 the payload also holds `interfaceLanguage: null`. `toEqual` ignores only `undefined` properties, not `null` ones, so the step fails.
- Impact: The failure first shows up in the full run of task 11.2, after the preferences tasks are ticked. The fix is a one-line expectation change, so the stakes are low, but the plan does not name it.
- Fix: In task 6.5 (and the list in design.md D8), add: "in `test/features/settings/steps/settings_storage_unit.steps.tsx`, the expected payload adds `interfaceLanguage: null`", and add `npx vitest run src/test/features/settings/steps/settings_storage_unit.steps.tsx` to 6.5's verification.
- Fix risk: none
- Status: fixed
- Resolution: task 6.5 now updates the expected payload in `test/features/settings/steps/settings_storage_unit.steps.tsx` with `interfaceLanguage: null` and runs that steps file in its verification; design.md D8's list of touched tests names the file and why `toEqual` breaks.

## Verdict

Needs revision. Blocking: R1 and R2. R3 is optional polish.
