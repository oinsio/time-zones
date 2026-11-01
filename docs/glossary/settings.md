# Settings

The user's preferences and the page that changes them. Stored by their own repository (`src/preferences/`). See [README](README.md) for the entry format.

- **Settings page** — the page with the Gnomish Factory credit, the theme preference and the hour format. *Code:* `SettingsPage`, `AppPage.SETTINGS`. *RU:* «Настройки».
- **Settings button** — the header button that opens the settings page. *Code:* `SettingsButton`. *RU:* «Настройки».
- **Preferences** — the user's choices kept on the device, apart from the location list. *Code:* `Preferences`, `src/preferences/`, `PreferencesRepository`.
- **Theme preference** — light, dark or system. System follows the system color scheme. *Code:* `ThemePreference`. *RU:* «Тема»: «Светлая», «Тёмная», «Системная».
- **Hour format** — how times of day are written, 12-hour or 24-hour. *Code:* `HourFormat`. *RU:* «Формат времени»: «12 часов», «24 часа».
- **Gnomish Factory** — the tool the app is built with; its landing page is linked from the settings page. A brand name: written `Gnomish Factory` in every interface language, never translated. *Code:* `GNOMISH_FACTORY_LANDING_URL`. *RU:* «Gnomish Factory».
- **Gnomish Factory credit** — the line of the settings page above the theme preference, one link "Built with Gnomish Factory" to the factory's landing page, opened in a new tab. *Code:* `GnomishFactoryCredit`, `settings.gnomishFactoryCredit`. *RU:* «Создано с помощью Gnomish Factory».
