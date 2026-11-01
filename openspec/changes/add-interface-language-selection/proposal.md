# Add interface language selection

No other active change touches the capabilities this change modifies: the only one, `add-pr-preview-deploy`, changes delivery, not `settings` or `app-shell`.

## Why

Today the interface language comes from the browser and cannot be changed. `src/i18n.ts` detects it from the `language` key of local storage, then from the browser language, and i18next writes its detection back to that key on every start. A person with an English system who wants the app in Russian, or the other way round, has no way to switch. Audience: every user whose system language differs from the language they want to read. The settings page now exists (theme, hour format), so the language belongs there. The choice must also scale: today `SUPPORTED_LANGUAGES` in `src/i18n.ts` is a hand-written list and each locale file is imported one by one. Future dialects and easter-egg languages should need only a new locale file.

## What Changes

- ADDED a **Language** group («Язык») on the settings page, below the hour format group. Collapsed, it is a button with the emoji and native name of the interface language and a chevron. Expanded, the list of languages opens right under the button, inline, with no dialog and no popover. Each row shows the emoji and native name from the locale's `_meta`, untranslated, sorted by `_meta.name`. The chosen row has the accent border and a check, like the other groups. A search field appears above the list once there are 10 or more languages.
- ADDED: choosing a language applies it at once, with no reload, to every text, country name, date, weekday, city search result, `<html lang>` and the document title. The list then collapses.
- MODIFIED preferences: the interface language becomes part of the preferences document. The schema version goes from 1 to 2. A version 1 document and the legacy `language` key are migrated, and the app stops writing the legacy key. Without an explicit choice, the browser language decides: a regional browser language matches by base language (`ru-RU` → `ru`). If nothing matches, the app uses English. The unreadable-preferences note, the save-failed note, Reset and cross-tab sync now cover the language too.
- ADDED **locale registry**. It collects every `locales/*.json` file automatically and reads its `_meta`. It gives i18next only the translations, without `_meta`. It derives the supported languages and the settings list. A file with incomplete `_meta`, or with a `code` that differs from its file name, is left out. The hand-written language list goes away.
- ADDED **dialects and easter eggs**: a locale whose `baseLanguage` differs from its `code`. A key it does not translate comes from its base language, then from English. Language-keyed data (city names, the first day of the week) follows the same order.
- MODIFIED `locales/en.json`: `_meta.emoji` changes from 🇬🇧 to 🇺🇸. The British flag is kept for a future `en-GB` dialect.
- The approved settings screenshots are re-approved, and new ones show the language list collapsed and expanded.
- Glossary (`docs/glossary/settings.md`):
  - new terms **Interface language** (*RU:* «Язык интерфейса», group caption «Язык»), **Locale metadata** (the `_meta` block), **Locale registry** and **Dialect** (defined through `baseLanguage`, easter eggs included);
  - the **Settings page** and **Preferences** entries list the language.
  - In `docs/glossary/locations.md`, "per interface language" in **Country code** stays as written, because it now names the defined term; it gets a link to it.
  - `docs/architecture/domain-model.md` and `views.md` replace the planned `language` / `SET_LANGUAGE` / "language later" with the implemented names.
- Dependency: `i18next-browser-languagedetector` is removed, because the app resolves the language itself (design D3).

## Capabilities

### New Capabilities

None. The language choice is part of `settings`, and the registry is part of `app-shell`.

### Modified Capabilities

- `settings`:
  - ADDED "Interface language choice", "Language list search", "Accessible language choice", "Language choice layout";
  - MODIFIED "Open the settings page", "Preferences are kept on the device", "Unreadable stored preferences", "Preferences without storage", "Preferences are shared between open tabs", "Settings strings are localized", "Settings page layout".
- `app-shell`:
  - ADDED "Interface language at start" and "Dialect fallback";
  - MODIFIED "Shell shows the app title in the active language" and "Locale files describe themselves".

## Goals

- G1: A user can switch the interface language from the settings page in at most 3 actions (open the settings, expand the group, choose), with no reload.
- G2: The choice survives a reload and the app's update, and it is migrated from the legacy key without a visible change of language for existing users.
- G3: Adding a language means adding one locale file, with no other source file edited.

## Non-Goals

- NG1: No real dialect or easter-egg locale is added; only a test fixture proves the fallback.
- NG2: No new interface translation beyond the strings of the language group.
- NG3: No "follow the browser" option in the list. Reset brings back the browser-driven default.
- NG4: No city names for languages other than English and Russian. Other languages take city names through the fallback order.
- NG5: No change of the theme or hour format groups, the credit or the main page layout.
- NG6: No language choice outside the settings page (no first-launch prompt, no URL parameter).

## Users & Scenarios

- U1: A Russian speaker on an English laptop opens the settings, expands «Language», chooses «🇷🇺 Русский». The page, the dates, the country names and the search results switch to Russian at once. They stay Russian after a reload.
- U2: A user who does not read the current interface language looks for their flag and native name in the list and finds it, because names are never translated.
- U3: A keyboard user tabs to the language button, presses Enter to expand, moves with the arrow keys, chooses with Enter, or closes with Escape and is back on the button.
- U4: An existing user whose app showed Russian before the update still sees Russian after it, and can now change it.

## Requirements

### Functional

- FR1: The settings page shows a group "Language" («Язык») directly below the hour format group. Its caption looks like the captions of the theme and hour format groups.
- FR2: Collapsed, the group shows one button: the emoji and native name of the active interface language, and a chevron pointing down. Activating it expands the language list directly under it, inside the page flow, with no dialog, popover or overlay. Activating it again collapses the list. While the list is expanded the chevron is rotated.
- FR3: The list has one row per registered locale. A row shows the locale's `_meta.emoji` and `_meta.nativeName` ("🇺🇸 English", "🇷🇺 Русский"), never translated. The emoji is decorative; the row's accessible name is the native name alone. Rows are sorted by `_meta.name`.
- FR4: The row of the active interface language is marked like the checked option of the theme and hour format groups: the accent border and a check icon at the end.
- FR5: Choosing a row applies that language at once, without a reload or a loading state, and collapses the list. All of these follow it at once:
  - every interface text;
  - country names;
  - dates, month and weekday names;
  - city names in the search results and the exemplar city of the device time location (a city location keeps the city label it was added with);
  - `<html lang>` and the document title.
- FR6: When the registry holds at least `LANGUAGE_SEARCH_MIN_LOCALES` (10) locales, a search field stands above the list. It keeps the rows whose `nativeName`, `name` or `code` contains the typed text, ignoring letter case and diacritics. If no row matches, the list shows "No languages found" («Языки не найдены»). Below the threshold there is no search field. With today's 2 locales it is not shown, but its behaviour is covered by tests.
- FR7: The chosen language is saved on the device and is in force from the first render after a reload, also offline. Without a chosen language, or when the chosen code is no longer registered, the app uses the first browser language that matches:
  - first, a locale whose `code` equals the browser language;
  - then a locale whose `code` equals its own `baseLanguage` and equals the browser language's primary subtag (`ru-RU` → `ru`).
  If no browser language matches, the app uses English. A dialect is picked from the browser only by an exact code match.
- FR8: The interface language is stored in the preferences document, which goes to schema version 2:
  - A version 1 document is migrated, and the value of the legacy `language` key becomes the chosen language.
  - If there is no preferences document but a legacy key exists, its value is the chosen language too, without a write.
  - The next save or Reset removes the legacy key, and the app never writes it again.
  - A document of a newer version stays unreadable, as before.
- FR9: The locale registry is built from every `src/locales/*.json` file, with no hand-written list:
  - It reads each file's `_meta` and gives i18next only the translations, without `_meta`.
  - It is the single source of the supported languages and of the settings list.
  - A file whose `_meta` lacks any of `code`, `name`, `nativeName`, `baseLanguage`, `emoji` as a non-empty string is left out, and so is a file whose `code` differs from its file name or is not a canonical language tag (it becomes `<html lang>` and an `Intl` locale).
- FR10: A locale whose `baseLanguage` differs from its `code` is a dialect (easter eggs included). For each key, the text comes from the dialect itself, then from its base language, then from English. Language-keyed data with no entry for the dialect, such as city names or the first day of the week, follows the same order.
- FR11: `locales/en.json` has `_meta.emoji` 🇺🇸.
- FR12: The existing settings states cover the language:
  - Unreadable preferences: the app starts with the browser-driven language, and the note with Reset is shown.
  - Reset clears the chosen language, and the browser-driven language applies at once.
  - Failed save: the chosen language applies for the session, and the save-failed note is shown.
  - Another open tab applies a language change without a reload.
- FR13: The new strings exist in every locale file, and Russian uses the glossary names:
  - the group caption «Язык»;
  - the button's accessible name «Язык: <name>»;
  - the search field label «Поиск языка»;
  - the empty search text «Языки не найдены».

### Non-Functional

#### Performance

- NFR-P1: Expanding or collapsing the list and presenting the location rows again with an unchanged language builds no formatter. After a language change, presenting 50 rows builds at most one formatter per time zone and label kind in use. These bounds are counted, never timed (ADR-0008).

#### Accessibility

- NFR-A1: The button exposes `aria-expanded` and controls the list (`aria-controls`). Its accessible name contains the group caption and the active language ("Language: English"). The emoji is `aria-hidden`. Each row's native name carries the locale's `lang`. The active row is exposed as current (`aria-current`) as well as marked by the check icon.
- NFR-A2: The list works from the keyboard:
  - Tab and Shift+Tab reach every row (and the search field when shown).
  - Arrow Down and Arrow Up move the focus to the next and the previous row.
  - Enter or Space chooses the focused row; the list collapses and the focus returns to the button.
  - Escape collapses the list and returns the focus to the button without leaving the settings page.
  - A second Escape leaves the settings page, as before.
- NFR-A3: axe-core reports no violations on the settings page in the light and the dark theme, with the list collapsed and expanded. The button and every row are at least 44 px high. Text contrast is at least 4.5:1 in both themes.

#### Responsive

- NFR-R1: The group has the width of the neighbouring groups (the `max-w-xl` column). The page does not scroll horizontally at 320 px and 2560 px, collapsed or expanded.
- NFR-R2: Visual regression:
  - The approved settings screenshots (375 px and 1024 px, light and dark) are re-approved with the collapsed group.
  - New approved screenshots show the page at 375 px with the list collapsed and expanded, in the light and the dark theme.
  - Every one shows the 🇺🇸 flag for English.

## UX Acceptance Criteria

- UX1: Language names are never translated, so a person who cannot read the current interface still finds their own language.
- UX2: The list opens inline, pushing the content below it down. It never covers other settings.
- UX3: The switch shows no loading state and no flash of the old language. The page keeps its scroll position, and after the choice the focus is on the button, which already shows the new language.
- UX4: The group uses only design tokens (`bg-surface`, `border-border`, `rounded-md`, `min-h-11`, `border-accent` / `text-accent`, `focus-visible:outline-accent`), with no `gray-*` or other colours outside the tokens, and works in the dark theme.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| online or offline | no language chosen | button and list show the browser-driven language as active |
| online or offline | language chosen and stored | the chosen language from the first render |
| online or offline | stored code no longer registered | the browser-driven language; nothing is rewritten until the user chooses |
| online or offline | preferences document unreadable | the browser-driven language; the unreadable note with Reset (existing) |
| online or offline | save fails or storage unavailable | the language applies for the session; the save-failed note (existing) |
| online or offline | search shown, no row matches | "No languages found" in place of the rows |
| loading | settings page chunk loading | the existing skeleton shown while the settings page loads; the registry itself is synchronous and has no loading state |

Every locale is bundled, so offline behaves exactly like online. The registry always contains English (a test enforces it), so the list is never empty without a search.

## Behavior

- `packages/client/src/test/features/settings/settings_language_unit.feature` — choice, persistence, migration, states (`@add-interface-language-selection`).
- `packages/client/src/test/features/settings/settings_language_search_unit.feature` — the search threshold and filtering.
- `packages/client/src/test/features/app_shell/app_shell_locale_registry_unit.feature` — the registry, the start language, the dialect fallback.
- `packages/client/src/test/features/settings/settings_language_e2e.feature` — switching and reloading, keyboard, axe-core, layout, screenshots.

## Visual Reference

No Figma frame. The design tokens and the existing settings groups (`SettingsOptionGroup`) are the reference. The approved screenshots of this change become the visual target.

## Affected IA

No changes: `docs/ia/` does not exist; the settings page keeps its place.

## Success Metrics

- M1: 2 of 2 registered locales are listed, in `_meta.name` order: "🇺🇸 English", then "🇷🇺 Русский".
- M2: Switching the language triggers 0 page navigations, and 1 reload keeps the chosen language (E2E).
- M3: axe-core reports 0 violations in 4 states: light and dark, collapsed and expanded.
- M4: A registry built from a fixture of 3 locale files lists 3 languages, with no other input. Fixtures with incomplete `_meta` or a foreign `code` add 0 entries.
- M5: For a dialect fixture, 3 of 3 lookups resolve in order: a key of the dialect, a key of its base language only, and a key of English only.
- M6: Stryker scores at least 95 % (minimum acceptable 90 %) on every new or changed production file of this change.
- M7: 4 new approved screenshots per Playwright project (375 px × collapsed / expanded × light / dark), and 4 re-approved existing ones.

## Open Questions

None. The storage question of the task is decided in `design.md` (D1, D2).

## Impact

- Code under `packages/client/src/`:
  - the new `locales/index.ts` module (registry, fallbacks, start-language resolution, filter), with `lib/browserLanguages.ts`;
  - `i18n.ts`;
  - `preferences/` (field, command, parsing) and the preferences adapters and port tests;
  - a new `adapters/preferencesDocument.ts`, with a shared `adapters/payloadMigrations.ts`;
  - `constants/` (schema version 2, the search threshold, city-name languages, the legacy key);
  - the controller (`PreferencesProvider`, `useInterfaceLanguage`, the hooks that read the language);
  - the city search port, adapters and presenter (city names keyed by city-name language);
  - `app/settings/` (the new group);
  - both locale files;
  - tests and screenshots.
- Dependency removed: `i18next-browser-languagedetector`.
- Docs: `docs/glossary/settings.md`, `docs/glossary/locations.md`, `docs/architecture/domain-model.md`, `docs/architecture/views.md`.
