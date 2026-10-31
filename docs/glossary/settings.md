# Settings

The user's preferences and the page that changes them. Stored by their own repository (`src/preferences/`). See [README](README.md) for the entry format.

- **Settings page** — the page with the theme preference and the hour format. *Code:* `SettingsPage`, `AppPage.SETTINGS`. *RU:* «Настройки».
- **Settings button** — the header button that opens the settings page. *Code:* `SettingsButton`. *RU:* «Настройки».
- **Preferences** — the user's choices kept on the device, apart from the location list. *Code:* `Preferences`, `src/preferences/`, `PreferencesRepository`.
- **Theme preference** — light, dark or system. System follows the system color scheme. *Code:* `ThemePreference`. *RU:* «Тема»: «Светлая», «Тёмная», «Системная».
- **Hour format** — how times of day are written, 12-hour or 24-hour. *Code:* `HourFormat`. *RU:* «Формат времени»: «12 часов», «24 часа».
