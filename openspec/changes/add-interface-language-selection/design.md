# Design: Add interface language selection

## Context

Driven by FR1–FR13, NFR-P1, NFR-A1–NFR-A3 and NFR-R1–NFR-R2 from `proposal.md`. Current state, checked in the code:

- `src/i18n.ts` has these pieces:
  - It imports `en.json` and `ru.json` one by one, and the whole files, `_meta` included, become i18next resources.
  - `SUPPORTED_LANGUAGES = ["en", "ru"]` and `type SupportedLanguage` are hand-written.
  - `load: "languageOnly"` strips regions.
  - `i18next-browser-languagedetector` reads `localStorage["language"]` first, then `navigator`. Through `caches: ["localStorage"]` it writes its detection back to that key on every start, so the key holds a cached detection, not a choice (`i18n.test.ts` "should store the chosen language under the language key").
- `src/preferences/` is the pure preferences model:
  - `Preferences { theme, hourFormat }` and `DEFAULT_PREFERENCES`;
  - `reducePreferences` with `SET_THEME` and `SET_HOUR_FORMAT`;
  - `parseStoredPreferences`, which rejects any missing or unknown value.
- The `PreferencesRepository` port has `load`, `save`, `clear` and `subscribe`, and the `PreferencesLoadStatus` statuses `LOADED`, `EMPTY` and `UNREADABLE`.
- `createLocalStoragePreferencesRepository` (`src/adapters/`) has a fixed format:
  - it writes `{ schemaVersion: PREFERENCES_SCHEMA_VERSION (1), payload: { theme, hourFormat } }` under `STORAGE_KEYS.PREFERENCES`;
  - it reads any other version as `UNREADABLE` and has no migrations.
- `PreferencesProvider` (`src/controller/`) loads once and writes debounced. It reports `UNREADABLE` and `hasSaveFailed`, offers `resetPreferences`, and applies other tabs' changes.
- `docs/adr/0002` ("Preferences | language, hour format, view mode") and `docs/architecture/overview.md` ("Preferences: language, hour format, view mode | `preferences/` | yes") already put the language among the preferences. `docs/architecture/domain-model.md` plans `string language` and `SET_LANGUAGE`.
- City data is English and Russian only:
  - `CityRecord.names: Record<SupportedLanguage, string>` (`src/ports/citySearch.ts`) and `ZoneCityData.names: { en; ru }`;
  - the build script `scripts/zoneData/extractZoneData.ts` extracts `en` and `ru`;
  - `zoneCitiesSource.ts` iterates `SUPPORTED_LANGUAGES` for city and country texts;
  - `FIRST_DAY_OF_WEEK_BY_LANGUAGE` (`src/constants/date.ts`) is `Record<SupportedLanguage, number>`.
- Six controller hooks repeat `(i18n.resolvedLanguage ?? i18n.language) as SupportedLanguage`: `useCitySearch`, `useWallTimeInput`, `useExemplarCity`, `useReferenceMoment`, `useCalendarMonth` and `useLocations`. `useDocumentLanguage` reads the same value without the cast.
- `AppShell` leaves the settings page on any `Escape` through a `document` `keydown` listener.
- Several E2E steps seed the interface language through the legacy key: `seedLanguage` in `test/features/locations/steps/locations_ui_e2e.fixtures.ts` writes `localStorage["language"]`.

Glossary owners this change extends (`docs/glossary/settings.md`):

- **Preferences** — `Preferences`, `src/preferences/`, `PreferencesRepository`;
- **Settings page** — `SettingsPage`.

`docs/glossary/locations.md` **Country code** (`presentCountryName`) and **City label** (`label`) are used as they are. New owners are listed in D9.

## Goals / Non-Goals

**Goals:** one owner for each new concept (registry, fallback order, start language, the active interface language), with no new storage path besides the preferences document, and no change of the location document.

**Non-Goals:** `languagechange` events of the browser while the app is open (the start language is resolved at start and on every preference change, which is enough for FR7); per-language city data beyond `en` and `ru` (NG4); a new ADR — every decision below sits inside ADR-0002, ADR-0004 and ADR-0005's registry pattern.

## Decision

### D1. The interface language lives in the preferences document (FR7, FR8, FR12)

`Preferences` gets the field `interfaceLanguage: string | null`. `null` means "not chosen", and the browser decides. `DEFAULT_PREFERENCES.interfaceLanguage = null`. A new command `PreferencesCommandType.SET_INTERFACE_LANGUAGE` carries `interfaceLanguage: string`, and the reducer returns the same object for an unchanged value, like the other commands. `PreferencesContextValue` gets `setInterfaceLanguage(code)`. The model stays pure: it does not know the registry, so it accepts any non-empty string. Whether a code is registered is decided when the language is resolved (D3), so a code whose locale file was removed simply falls back, and nothing is rewritten (ADR-0004 load normalization, as ADR-0005 does for an unknown `ViewId`).

`parseStoredPreferences` requires `interfaceLanguage` to be `null` or a non-empty string, and rejects anything else as unreadable, like an unknown theme.

Why: ADR-0002 and the architecture overview already classify the language as a preference. The preferences document gives the language, for free, everything ADR-0004 requires and the task asks for:

- a versioned envelope;
- migrations;
- the unreadable note with Reset;
- the save-failed note;
- debounced writes;
- cross-tab sync through `createStorageDocumentSync`.

**Alternative — keep a separate `language` key** (as i18next writes it today): rejected. It would be a second storage path for preferences, with no schema version and no validation. It would have no cross-tab sync, so the other tab would keep its language. Reset would not cover it, and the existing notes would not apply. FR12 would need all of this rebuilt for one key. The key also cannot tell a choice from a cached detection.

### D2. Schema version 2 and the legacy key (FR8)

- `PREFERENCES_SCHEMA_VERSION` becomes `2` (`src/constants/preferences.ts`). The legacy key name moves to `LEGACY_STORAGE_KEYS = { LANGUAGE: "language" }` in `src/constants/storage.ts`, and `LANGUAGE_STORAGE_KEY` leaves `i18n.ts`.
- The migration loop of the locations document becomes the shared owner:
  - `PayloadMigrations` and the private `migratePayload` of `src/adapters/locationsDocument.ts` move to a new `src/adapters/payloadMigrations.ts`;
  - `locationsDocument.ts` imports them from there, with unchanged behaviour;
  - there is no second migration loop.
- A new `src/adapters/preferencesDocument.ts` holds `serializePreferencesDocument` and `deserializePreferencesDocument` (moved out of the adapter, which keeps it under 200 lines). It also holds `createPreferencesMigrations(legacyInterfaceLanguage: string | null)`, whose version 1 step adds `interfaceLanguage: legacyInterfaceLanguage` to the payload. The legacy value comes in as an argument, so the step stays a pure function with fixture tests.
- The adapter's `load` reads the document and the legacy key, both inside the existing `try`:
  - document absent, legacy key a non-empty string → `LOADED` with `{ ...DEFAULT_PREFERENCES, interfaceLanguage: legacy }`, without a write ("Opening writes nothing" keeps holding);
  - document absent, no legacy key → `EMPTY`, as today;
  - version 1 → migrated with the legacy value (or `null`), then validated;
  - version 2 → parsed, and the legacy key is ignored;
  - any other version or invalid payload → `UNREADABLE`, as today.
- `save` writes the version 2 document and removes the legacy key in the same `write` call. `clear` (Reset) removes both. The app never writes the legacy key, because the language detector is gone (D3).

Why the legacy value counts as a choice: the detector cached the language every existing user sees today. Treating it as chosen keeps that language after the update (U4). The user can now change it.

**Alternative — drop the legacy value**: rejected. A user whose browser language changed since the first visit would see the interface switch language on update, with no action of their own.

### D3. The app resolves the language itself; the detector goes (FR7, FR5)

- `resolveInterfaceLanguage(chosenLanguage: string | null, browserLanguages: readonly string[], registry = localeRegistry): string` (in `src/locales/`, pure) follows this order:
  1. the chosen code when it is registered;
  2. for each browser language in order, an exact code match (compared after `Intl.getCanonicalLocales`, so `en-us` equals `en-US`), then the registered non-dialect locale whose code equals the primary subtag;
  3. otherwise `DEFAULT_LANGUAGE` (`"en"`).
- `readBrowserLanguages()` in `src/lib/browserLanguages.ts` returns `navigator.languages`, or `[navigator.language]` when the list is empty. This is the only place that reads the browser language.
- `i18n.ts` resolves the start language synchronously before `init`, as `lng: resolveInterfaceLanguage(storedInterfaceLanguage, readBrowserLanguages())`. The stored value comes from `localStoragePreferencesRepository.load()`, and only a `LOADED` result carries one. The first render is already in the right language, with no flash (UX3, app-shell "Interface language at start").
- `useInterfaceLanguage()` (new, `src/controller/`, called in `AppShellContent` next to `useThemePreference`) applies changes after start. It resolves the language from `usePreferences().preferences.interfaceLanguage` and calls `i18n.changeLanguage(code)` in a `useLayoutEffect` when the code differs from the active one. The effect covers a choice, Reset, an external tab change and an unreadable load.
- `useActiveInterfaceLanguage()` (new, `src/controller/`) returns `{ code, locale, cityNameLanguage }` of the language i18next has applied. It replaces the six copies of the `resolvedLanguage` cast and is used by `useDocumentLanguage`. It is the one owner of "the active interface language".
- `i18next-browser-languagedetector` is removed with `pnpm remove`. Its only importers are `i18n.ts` and `i18n.test.ts`.

**Alternative — keep the detector with a custom detector plugin reading the preferences**: rejected. The detector would still cache into `localStorage` unless reconfigured. It hides the order rules of FR7 inside plugin options that can only be tested through i18next. A pure function is unit-testable and mutation-testable.

### D4. Locale registry in `src/locales/` (FR9, FR11, FR3)

`src/locales/` becomes a module with an `index.ts`. The JSON files stay where they are.

- `localeMetadata.ts`:
  - `type LocaleMetadata = { code; name; nativeName; baseLanguage; emoji }` (all `string`);
  - `parseLocaleMetadata(meta: unknown, fileCode: string): LocaleMetadata | undefined`.
  - Parsing rejects a missing or empty field and a `code` different from the file name. It also rejects a `code` that is not a canonical language tag, that is, where `Intl.getCanonicalLocales(code)[0] !== code` or the call throws. This last rule exists because the code becomes `<html lang>`, an i18next language and an `Intl` locale, and a malformed one would make `Intl` throw.
- `localeRegistry.ts`:
  - `type RegisteredLocale = { metadata: LocaleMetadata; translations: Record<string, unknown> }`, where `translations` is the file without `_meta`;
  - `buildLocaleRegistry(localeModules: Record<string, unknown>): readonly RegisteredLocale[]`, keyed by path like `import.meta.glob` returns, sorted by `metadata.name` with `Intl.Collator(DEFAULT_LANGUAGE)` once;
  - `localeRegistry = buildLocaleRegistry(import.meta.glob("./*.json", { eager: true, import: "default" }))`;
  - `SUPPORTED_LANGUAGES = localeRegistry.map(code)`, `DEFAULT_LANGUAGE = "en"`, `type InterfaceLanguageCode = string`, and `findRegisteredLocale(code)`.
  - `SupportedLanguage` is renamed to `InterfaceLanguageCode` everywhere it is used for the interface language.
- `i18n.ts` builds the i18next options from the registry, through an exported pure `createI18nOptions(registry)` for tests:
  - `resources` (`{ [code]: { translation } }`);
  - `supportedLngs`;
  - `fallbackLng`, which maps each code to its fallbacks after itself (D5), with `default: [DEFAULT_LANGUAGE]`;
  - `load: "currentOnly"`, so `en-GB` keeps its own resources;
  - `interpolation.escapeValue: false`, as today.
- `locales.test.ts` keeps its file checks. A new test asserts that `en` is registered and that `_meta.emoji` of `en.json` is 🇺🇸 (FR11).

`import.meta.glob` is already used by `locales.test.ts`, and `vite/client` is in the `types` of `tsconfig.app.json`, so the call compiles. `Intl.getCanonicalLocales` is declared by the `ES2020` lib of `tsconfig.app.json` and exists in iOS Safari 12 (ADR-0009).

**Alternative — keep a hand-written list next to the imports**: rejected by FR9 and G3.

### D5. One fallback order for texts and language-keyed data (FR10)

`resolveLanguageFallbacks(code, registry = localeRegistry): readonly string[]` returns `[code, baseLanguage, DEFAULT_LANGUAGE]` without duplicates, and `[DEFAULT_LANGUAGE]` for an unknown code. It is the single owner of the order:

- i18next's `fallbackLng` map is built from it (D4).
- `pickByLanguageFallback(code, valuesByLanguage)` returns the first value along it. It is used for `FIRST_DAY_OF_WEEK_BY_LANGUAGE` (now `Readonly<Record<string, number>>`, still `{ en: 7, ru: 1 }`) by `presenter/calendarMonth.ts` and `controller/useCalendarMonth.ts`.
- `resolveCityNameLanguage(code): CityNameLanguage` picks along the order among `CITY_NAME_LANGUAGES = ["en", "ru"]`, a new constant in `src/constants/search.ts` for the languages of the build-time city data.
  - `CityRecord.names` and `ZoneCityData.names` become `Record<CityNameLanguage, string>`.
  - `CitySearch.search` and `getExemplarCity` and `presentSearchResults` take the city-name language for `names[...]`.
  - `zoneCitiesSource.ts` iterates `CITY_NAME_LANGUAGES` instead of `SUPPORTED_LANGUAGES` for city and country texts. Matching therefore stays "English and Russian whatever the interface language" (location-search spec).
- Every `Intl` formatter (dates, country names, day-period markers) keeps receiving the interface language code itself. `Intl` resolves an unknown region or private-use subtag to the nearest locale it has.

After this change no module under `src/adapters/` or `src/ports/` imports from `@/i18n`, so `i18n.ts` can import the preferences adapter (D3) without a cycle.

### D6. Interface language group (FR1–FR6, NFR-A1–NFR-A3, UX1–UX4)

New `src/app/settings/InterfaceLanguageGroup.tsx` (plus `InterfaceLanguageList.tsx` to stay under 200 lines), rendered by `SettingsPage` after the hour format `SettingsOptionGroup`. Props: `locales` (default `localeRegistry`), `activeCode`, `onChoose`. Expanded state and the search text are view state, kept in the component (ADR-0002).

- **Structure:**
  - a `div` with `role="group"` and `aria-labelledby` pointing at its caption, a `<p>` with the classes of `SettingsOptionGroup`'s legend (`mb-2 text-sm font-semibold text-muted-foreground`). It is not a heading, so the settings page keeps one page heading.
  - The toggle `<button>` has these attributes:
    - `aria-expanded` and `aria-controls={listId}`;
    - `aria-label={t("settings.languageButton", { language: nativeName })}` ("Language: English"), which contains the visible name;
    - content: `<span aria-hidden>{emoji}</span>`, the native name with `lang={code}`, and `ChevronDown` (`aria-hidden`) with `motion-safe:transition-transform` and `rotate-180` while expanded.
  - The list is a `<ul id={listId} aria-label={caption}>` of `<li><button>` rows. A row holds the emoji (`aria-hidden`), the native name in a `<span lang={code}>`, and for the active row `aria-current="true"` and `Check` (`aria-hidden`, `text-accent`).
  - The list is rendered in the flow under the button, so it pushes the content down (UX2); there is no portal and no absolute positioning.
- **Classes:** button and rows use `flex min-h-11 w-full items-center gap-3 rounded-md border bg-surface px-4 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent`, with `border-accent` for the active row and `border-border` otherwise. These are the tokens of `SettingsOptionGroup`, with no `gray-*`.
- **Keyboard:**
  - Rows are native buttons, so Tab, Shift+Tab, Enter and Space work as they are.
  - A `keydown` handler on the list moves the focus with `KeyboardKey.ARROW_DOWN` and `ARROW_UP` (no wrap; from the search field, Arrow Down goes to the first row).
  - `KeyboardKey.ESCAPE` on the group collapses the list, focuses the button and calls `stopPropagation()`, so `AppShell`'s `document` listener does not leave the settings page. With the list collapsed nothing is stopped, and Escape leaves as before.
  - Choosing calls `onChoose(code)`, collapses the list and focuses the button.
- **Search:**
  - When `locales.length >= LANGUAGE_SEARCH_MIN_LOCALES` (new constant `10` in `src/constants/preferences.ts`), an `<input type="search" aria-label={t("settings.languageSearch")}>` stands above the rows.
  - Rows come from `filterLocales(locales, query)` (`src/locales/`). It matches `nativeName`, `name` and `code` by `includes` after `normalizeSearchText` (exported from `@/adapters`, the existing owner of search text normalization).
  - With no row left, a `<p>` shows `t("settings.languageNotFound")`.
- **States:** the unreadable and save-failed notes and Reset are `SettingsPage`'s existing ones. Since the language is a preference (D1), nothing new is rendered for them.

`SettingsPage` reads `activeCode` from `useActiveInterfaceLanguage()` and `onChoose` from `usePreferences().setInterfaceLanguage`.

**Alternative — reuse `SettingsOptionGroup` (a radio group)**: rejected. FR2 asks for a collapsed button, and NFR-A2 asks for Tab to reach every row, while a radio group is one Tab stop. **Alternative — `role="listbox"`**: rejected for the same Tab requirement and because it needs `aria-activedescendant` management; native buttons give Enter and Space for free.

### D7. Performance bound (NFR-P1)

Formatter caches in `src/presenter/dateTimeFormatters.ts` and `countryName.ts` are already keyed per language. A unit BDD scenario counts work with `startWorkCount()` from `src/test/workCounters.ts` (ADR-0008) around presenting 50 rows. The counts: 0 formatter builds when presented again with the same language, and at most one per time zone and label kind after the change to `ru`. No timing is asserted.

### D8. Tests and fixtures

- Unit BDD (vitest-cucumber) uses fixture module maps passed to `buildLocaleRegistry`, never real extra files:
  - registry building and rejection;
  - the start language and dialect fallback, with a `ru-KZ` fixture dialect whose translations hold keys `a`, `b`, `c` as in the spec, run through `i18next.createInstance().init(createI18nOptions(fixtureRegistry))`;
  - preferences, migration and states, with the in-memory and local-storage repositories;
  - search filtering, with a 10-locale fixture rendered through `InterfaceLanguageGroup` with the `locales` prop.
- Vitest unit tests cover each pure function and component branch for mutation.
- E2E (playwright-bdd) covers what needs a real browser (`bdd-unit.md` table): the accessible name, `aria-expanded`, focus, the keyboard, layout widths, axe-core and screenshots.
- Existing tests that the change touches:
  - `i18n.test.ts` is rewritten for `createI18nOptions`. "should store the chosen language under the language key" is removed on purpose (D2).
  - `test/setup.ts`, the Vitest setup file every jsdom test runs, imports `languageResolutionOptions` and `localeResources` from `@/i18n` for its global i18next init (`lng: "ru"`, `fallbackLng: "ru"`). Both disappear with D3, so it builds its options with `createI18nOptions(localeRegistry)` and keeps the `lng: "ru"` and `fallbackLng: "ru"` overrides.
  - The overrides alone do not keep today's behaviour once `useInterfaceLanguage` runs in `AppShellContent`. jsdom reports `navigator.languages` as `["en-US"]`, so with no chosen language every rendered `AppShell` would switch i18next to `en`, while many jsdom suites set the language with `i18n.changeLanguage("ru")` or `("en")` before rendering `AppShell` (`app/AppShell*.test.tsx`, `deviceTimeWorld.tsx`, `main_page_unit.steps.ts`, `app_shell_update_recheck.steps.ts` and others). So `test/setup.ts` also pins the browser languages to the active i18next language, as configurable `navigator.languages` / `navigator.language` getters. With no choice, the resolved language is the one the test set and nothing is switched. Tests of the browser-language rule override the getter with `vi.spyOn`, as `i18n.test.ts` already does.
  - Between the registry (task 3.3) and the retyped city data (task 4.2), `SUPPORTED_LANGUAGES` is `readonly string[]` and `i18n.ts` keeps a temporary `SupportedLanguage` alias; the typecheck is verified once all importers moved (task 4.4).
  - `adapters/preferencesRepository.test.ts` expectations of `schemaVersion: 1` become 2.
  - The E2E seeds that write the current version with the old payload add `interfaceLanguage: null`: `test/features/settings/steps/settings_theme_e2e.steps.ts` and `test/features/locations/steps/locationsSeedHelpers.ts`.
  - `seedLanguage` keeps writing the legacy key, which D2 migrates, and so also covers FR8 end to end. Its local `LANGUAGE_STORAGE_KEY` gives way to `LEGACY_STORAGE_KEYS.LANGUAGE`.

### D9. Glossary owners

| Term | *Code:* owner |
|---|---|
| Interface language | `Preferences.interfaceLanguage`, `SET_INTERFACE_LANGUAGE`, `resolveInterfaceLanguage`, `useInterfaceLanguage`, `useActiveInterfaceLanguage`, `InterfaceLanguageGroup`, `settings.languageLabel` |
| Locale metadata | `LocaleMetadata`, `parseLocaleMetadata`, the `_meta` block |
| Locale registry | `localeRegistry`, `buildLocaleRegistry`, `RegisteredLocale`, `SUPPORTED_LANGUAGES` |
| Dialect | `resolveLanguageFallbacks`, `pickByLanguageFallback` |

`CityNameLanguage` / `CITY_NAME_LANGUAGES` are named inside the **Locale registry** entry as the languages of the city data, not as a term of their own.

## Consequences

Positive:
- The language gets versioning, validation, Reset, the save-failed note and cross-tab sync from the existing preferences document, with no new storage path.
- A new language, dialect or easter egg is one locale file. The settings list, i18next and the supported languages follow from the registry.
- One owner each for the fallback order, the start language and the active interface language replaces six copies of the language cast.

Negative:
- The preferences document needs a migration and fixtures (schema version 2).
- `i18n.ts` now reads the preferences adapter at start.
- City names stay English and Russian; other languages read them through the fallback order.

## Alternatives Considered

- **A separate `language` key** instead of the preferences document: rejected in D1.
- **Dropping the legacy key's value** instead of migrating it: rejected in D2.
- **Keeping `i18next-browser-languagedetector`** with a custom detector: rejected in D3.
- **A hand-written language list**: rejected in D4.
- **`SettingsOptionGroup` or a `listbox`** for the list: rejected in D6.

## Risks / Trade-offs

- [Flag emoji rendering differs by platform; a CI runner without a colour emoji font may draw 🇺🇸 as letters] → The approved screenshots pin what the runner draws. The emoji itself is asserted as text in unit and E2E steps, so the 🇺🇸 requirement does not depend on fonts.
- [An old app version still open in another tab may write the legacy key after the update] → A version 2 document ignores the legacy key, and the next save or Reset removes it. Worst case the key lingers unused.
- [Rollback to the previous version reads a version 2 document as "newer", so the unreadable note appears there] → This is ADR-0004's documented behaviour. Reset recovers. It is accepted for a rollback.
- [Every locale file is bundled eagerly] → The same as today. Lazy locale loading is out of scope until the files grow.
- [`Intl` gets a dialect code it does not know] → It falls back to the nearest locale. A malformed code is rejected by the registry (D4), so `Intl` never throws.

## Migration Plan

- Deploy as usual. Each device migrates its document lazily on load, and the version 2 document is written only when the user next changes a setting.
- No server, no data outside the device.
- Rollback: see Risks.
