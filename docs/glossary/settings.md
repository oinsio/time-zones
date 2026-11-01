# Settings

The user's preferences and the page that changes them. Stored by their own repository (`src/preferences/`). See [README](README.md) for the entry format.

- **Settings page** — the page with the Gnomish Factory credit, the theme preference, the hour format and the interface language. *Code:* `SettingsPage`, `AppPage.SETTINGS`. *RU:* «Настройки».
- **Settings button** — the header button that opens the settings page. *Code:* `SettingsButton`. *RU:* «Настройки».
- **Preferences** — the user's choices kept on the device, apart from the location list: the theme preference, the hour format and the interface language. *Code:* `Preferences`, `src/preferences/`, `PreferencesRepository`.
- **Theme preference** — light, dark or system. System follows the system color scheme. *Code:* `ThemePreference`. *RU:* «Тема»: «Светлая», «Тёмная», «Системная».
- **Hour format** — how times of day are written, 12-hour or 24-hour. *Code:* `HourFormat`. *RU:* «Формат времени»: «12 часов», «24 часа».
- **Gnomish Factory** — the tool the app is built with; its landing page is linked from the settings page. A brand name: written `Gnomish Factory` in every interface language, never translated. *Code:* `GNOMISH_FACTORY_LANDING_URL`. *RU:* «Gnomish Factory».
- **Gnomish Factory credit** — the line of the settings page above the theme preference, one link "Built with Gnomish Factory" to the factory's landing page, opened in a new tab. *Code:* `GnomishFactoryCredit`, `settings.gnomishFactoryCredit`. *RU:* «Создано с помощью Gnomish Factory».
- **Interface language** — the language of every interface text, date, country name and city name of search results. It is chosen in the language group of the settings page, or, when none is chosen, it follows the browser language and then falls back to English. *Code:* `Preferences.interfaceLanguage`, `SET_INTERFACE_LANGUAGE`, `resolveInterfaceLanguage`, `useInterfaceLanguage`, `useActiveInterfaceLanguage`, `InterfaceLanguageGroup`, `settings.languageLabel`. *RU:* «Язык интерфейса»; the group caption is «Язык».
- **Locale metadata** — the `_meta` block of a locale file: `code` (equal to the file name, a canonical language tag), `name` (English name, the sort key), `nativeName`, `baseLanguage`, `emoji`. It is never a translation. *Code:* `LocaleMetadata`, `parseLocaleMetadata`.
- **Locale registry** — every locale file whose locale metadata is complete and valid, collected automatically and sorted by `name`. It is the only source of the supported languages, the i18next resources and the settings list. City data is kept for `CITY_NAME_LANGUAGES` only. *Code:* `localeRegistry`, `buildLocaleRegistry`, `RegisteredLocale`, `SUPPORTED_LANGUAGES`.
- **Dialect** — a locale whose `baseLanguage` differs from its `code`; easter-egg languages are dialects. A missing text or language-keyed value comes from the base language, then English. *Code:* `resolveLanguageFallbacks`, `pickByLanguageFallback`.
