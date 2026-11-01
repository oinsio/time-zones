## ADDED Requirements

### Requirement: Interface language choice
The settings page SHALL show the group "Language" («Язык») directly below the hour format group, with a caption styled like the captions of the theme and hour format groups. Collapsed, the group MUST show one button with the emoji and native name of the active interface language and a chevron pointing down. Activating the button MUST expand the language list directly under it, in the page flow, with no dialog, popover or overlay, and the chevron MUST turn; activating it again MUST collapse the list. The list MUST have one row per registered locale, showing the locale's metadata emoji and native name, never translated, sorted by the metadata `name`. The row of the active interface language MUST be marked by the accent border and a check icon at its end, like the checked option of the theme group. Choosing a row MUST apply that language at once, without a reload and without a loading state, and collapse the list. Every interface text, country name, date, month and weekday name, city name in the search results, exemplar city of the device time location, the page `lang` attribute and the document title MUST follow the new language at once. Inputs: the button, the chosen row. Output: the interface language in force, the stored choice. Errors: none. <!-- implements FR1, FR2, FR3, FR4, FR5, UX1, UX2, UX3 of add-interface-language-selection -->

#### Scenario: Collapsed group
- **GIVEN** the interface language is English
- **WHEN** the user opens the settings
- **THEN** below the hour format group a group "Language" shows a button "🇺🇸 English" with a chevron
- **AND** no language list is shown

#### Scenario: Expand and collapse
- **GIVEN** the settings page is shown
- **WHEN** the user expands the language group
- **THEN** the list shows "🇺🇸 English" and then "🇷🇺 Русский", right under the button
- **AND** "🇺🇸 English" is marked as chosen
- **WHEN** the user activates the button again
- **THEN** the list is not shown

#### Scenario: Names are not translated
- **GIVEN** the interface language is Russian
- **WHEN** the user expands the language group
- **THEN** the rows read "🇺🇸 English" and "🇷🇺 Русский"

#### Scenario: Choosing Russian applies at once
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Almaty
- **WHEN** the user chooses «Русский» in the language group
- **THEN** the list collapses and the button shows "🇷🇺 Русский"
- **AND** the settings heading reads «Настройки» without a reload
- **AND** after going back Almaty keeps its city label and shows the country «Казахстан», and the date bar shows a Russian weekday
- **AND** searching `Алм` offers «Алматы»

### Requirement: Language list search
When the locale registry holds at least `LANGUAGE_SEARCH_MIN_LOCALES` (10) locales, the expanded language list SHALL show a search field above its rows, labelled "Search languages" («Поиск языка»). Typing MUST keep only the rows whose native name, `name` or `code` contains the typed text, ignoring letter case, diacritics and leading or trailing whitespace; an empty text keeps every row. When no row matches, the list MUST show "No languages found" («Языки не найдены») instead of rows. With fewer locales there MUST be no search field. Inputs: the typed text, the registry. Output: the shown rows. Errors: none. <!-- implements FR6 of add-interface-language-selection -->

#### Scenario: No search field below the threshold
- **GIVEN** the registry holds 2 locales
- **WHEN** the user expands the language group
- **THEN** no search field is shown

#### Scenario: Filtering at the threshold
- **GIVEN** the registry holds 10 locales, `en`, `ru`, `de`, `fr`, `es`, `it`, `pt`, `ja`, `uk` and `pl` with their usual native and English names (`de` "Deutsch" / German, `fr` "Français" / French, `ru` "Русский" / Russian, `uk` "Українська" / Ukrainian)
- **WHEN** the user expands the language group and types `<text>`
- **THEN** the rows are `<rows>`

| text | rows |
|---|---|
| `deu` | Deutsch |
| `GERMAN` | Deutsch |
| ` ru ` | Русский |
| `рус` | Русский |
| `francais` | Français |

#### Scenario: Nothing found
- **GIVEN** the registry holds 10 locales
- **WHEN** the user expands the language group and types `zzz`
- **THEN** the list shows "No languages found"

### Requirement: Accessible language choice
The language button SHALL expose its expanded state (`aria-expanded`) and control the list (`aria-controls`). Its accessible name MUST contain the group caption and the active language: "Language: English", «Язык: Русский». The emoji MUST be hidden from assistive technology; each row's accessible name MUST be the native name alone, and the native name MUST carry the locale's `lang`. The active row MUST be exposed as current. Tab and Shift+Tab MUST reach the button, the search field when shown, and every row. Arrow Down and Arrow Up MUST move the focus to the next and the previous row. Enter or Space MUST choose the focused row, collapse the list and return the focus to the button. Escape MUST collapse the list and return the focus to the button without leaving the settings page; Escape with the list collapsed MUST leave the settings page as before. The button and every row MUST be at least 44 px high. axe-core MUST report no violations on the settings page in the light and the dark theme with the list collapsed and expanded. <!-- implements NFR-A1, NFR-A2, NFR-A3 of add-interface-language-selection -->

#### Scenario: Name and state of the button
- **GIVEN** the interface language is English
- **WHEN** the settings page is shown
- **THEN** a button named "Language: English" is collapsed
- **WHEN** the user expands it
- **THEN** it is expanded and controls a list whose current row is "English"

#### Scenario: Choosing with the keyboard
- **GIVEN** the language list is expanded with the focus on the button
- **WHEN** the user presses Tab, then Arrow Down, then Enter
- **THEN** the interface language is Russian
- **AND** the list is collapsed and the focus is on the button named «Язык: Русский»

#### Scenario: Escape collapses first
- **GIVEN** the language list is expanded with the focus on a row
- **WHEN** the user presses Escape
- **THEN** the list is collapsed, the focus is on the language button and the settings page is still shown
- **WHEN** the user presses Escape again
- **THEN** the main page is shown

#### Scenario: No violations
- **WHEN** axe-core checks the settings page in the `<theme>` theme with the language list `<state>`
- **THEN** it reports no violations

| theme | state |
|---|---|
| light | collapsed |
| light | expanded |
| dark | collapsed |
| dark | expanded |

### Requirement: Language choice layout
The language group SHALL use only the app's design tokens: the button and the rows on surface cards with the theme border, rounded corners, a minimum height of 44 px, the accent border and accent check for the active row, and the accent focus outline; it MUST NOT introduce a colour the tokens do not define, and it MUST follow the dark theme. The group MUST be as wide as the theme and hour format groups. The expanded list MUST push the content below it down and MUST NOT cover any other part of the page. The page MUST NOT scroll horizontally at 320 px and 2560 px, collapsed or expanded. The approved screenshots of the settings page at 375 px with the list collapsed and expanded, in the light and the dark theme, MUST match, and they show the 🇺🇸 flag for English. <!-- implements NFR-R1, NFR-R2, UX2, UX4 of add-interface-language-selection -->

#### Scenario: Same width as the other groups
- **WHEN** the settings page is shown with the language list `<state>`
- **THEN** the language group is as wide as the theme group

| state |
|---|
| collapsed |
| expanded |

#### Scenario: Narrow and wide screens with the list expanded
- **WHEN** the settings page is `<width>` px wide and the language list is expanded
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 2560 |

#### Scenario: Approved language screenshots
- **WHEN** the settings page is rendered at 375 px in the `<theme>` theme with the language list `<state>`
- **THEN** it matches the approved screenshot

| theme | state |
|---|---|
| light | collapsed |
| light | expanded |
| dark | collapsed |
| dark | expanded |

## MODIFIED Requirements

### Requirement: Open the settings page
The header's settings button SHALL open the settings page. The settings page MUST show the heading "Settings" («Настройки») as its only page heading, a back button "Back" («Назад»), the theme group, the hour format group and the language group, and MUST NOT show the date bar. The notices region MUST keep working on the settings page. The back button and Esc MUST return to the main page with its locations and reference moment unchanged; while the language list is expanded, Esc first collapses it. Opening the settings page MUST move the focus to its heading, and returning MUST move the focus to the settings button. Inputs: the settings button, the back button, Esc. Output: the shown page. Errors: none. <!-- implements FR1, FR3, NFR-A2 of add-settings-page-and-device-time-location; implements FR1, NFR-A2 of add-interface-language-selection -->

#### Scenario: Open and leave settings
- **GIVEN** the interface language is English
- **AND** the moment is pinned to `2026-03-09T07:30:00Z`
- **WHEN** the user opens the settings
- **THEN** the page heading is "Settings"
- **AND** the date bar is not shown
- **AND** the focus is on the heading
- **WHEN** the user goes back
- **THEN** the main page is shown with the moment still pinned to `2026-03-09T07:30:00Z`
- **AND** the focus is on the settings button

#### Scenario: Esc leaves settings
- **GIVEN** the settings page is shown
- **WHEN** the user presses Esc
- **THEN** the main page is shown
- **AND** the focus is on the settings button

#### Scenario: Notices on the settings page
- **GIVEN** a new version of the app is available
- **WHEN** the settings page is shown
- **THEN** the update notice is announced in the notices region

### Requirement: Preferences are kept on the device
The theme preference, the hour format and the interface language SHALL be saved on the device as one versioned document and restored when the app is opened again, also offline. A stored Light or Dark choice and a stored interface language MUST be in force when the main page is first shown. Nothing MUST be written for the preferences until the user changes a setting. A chosen setting MUST apply at once; its write MUST be debounced and MUST NOT block the interface, and a pending write MUST be flushed when the page is hidden. The preferences MUST NOT be part of the locations document, and a change of the preferences MUST NOT write the locations document. Without a chosen interface language the document records none, and the browser-driven language applies (see the `app-shell` capability). A document written by the previous version of the app MUST be migrated: its theme and hour format are kept, and the interface language is taken from the legacy `language` key when that key exists, otherwise none is chosen. When no preferences document exists but the legacy key does, its value MUST be the chosen interface language, without a write. The next write or Reset MUST remove the legacy key, and the app MUST NOT write the legacy key again. Inputs: the stored document, the legacy key. Output: the preferences in force. <!-- implements FR4, FR7 of add-settings-page-and-device-time-location; implements FR7, FR8 of add-interface-language-selection -->

#### Scenario: Choices survive a reload
- **GIVEN** the user chose the theme Dark and the hour format 12-hour
- **WHEN** the app is opened again
- **THEN** the theme Dark and the hour format 12-hour are checked
- **AND** the main page uses the dark token values from its first render

#### Scenario: The language survives a reload
- **GIVEN** the browser language is `en-US`
- **AND** the user chose «Русский» in the language group
- **WHEN** the app is opened again
- **THEN** the main page is in Russian from its first render
- **AND** the language button shows "🇷🇺 Русский"

#### Scenario: Opening writes nothing
- **WHEN** the user opens the app and the settings page and changes nothing
- **THEN** no preferences document is stored

#### Scenario: Offline reopen
- **GIVEN** the user chose the hour format 12-hour on an earlier visit
- **WHEN** the app is opened without a network connection
- **THEN** the location rows show 12-hour times

#### Scenario: Migration of the previous document
- **GIVEN** the previous version stored the theme Dark and the hour format 12-hour, and the legacy `language` key holds `ru`
- **WHEN** the app is opened
- **THEN** the theme Dark, the hour format 12-hour and the language «Русский» are in force
- **WHEN** the user chooses the hour format 24-hour
- **THEN** the stored document holds the theme Dark, the hour format 24-hour and the language `ru`
- **AND** the legacy `language` key is gone

#### Scenario: Legacy key without a document
- **GIVEN** no preferences document is stored and the legacy `language` key holds `ru`
- **WHEN** the app is opened with the browser language `en-US`
- **THEN** the interface language is Russian
- **AND** no preferences document is stored

### Requirement: Unreadable stored preferences
When the stored preferences document is not valid JSON, does not match the expected document, holds an unknown option, or was written by a newer version of the app, the app SHALL start with the default preferences (System, 24-hour, no chosen interface language, so the browser-driven language applies) and MUST NOT show a blank page or block the main page. The settings page MUST then show a note that the settings could not be read, with a Reset action. Reset MUST clear the stored preferences document and the legacy `language` key and remove the note. Reset MUST also bring back the browser-driven interface language at once. The app MUST NOT overwrite the unreadable document by itself; a change of a setting, the interface language included, replaces it. <!-- implements FR7 of add-settings-page-and-device-time-location; implements FR12 of add-interface-language-selection -->

#### Scenario: Corrupted preferences
- **GIVEN** the stored preferences document is not valid JSON
- **WHEN** the user opens the app and the settings page
- **THEN** the main page was shown with the default preferences
- **AND** the settings page shows the note with a Reset action

#### Scenario: Reset
- **GIVEN** the note about unreadable settings is shown
- **WHEN** the user resets
- **THEN** no preferences document is stored
- **AND** the note is not shown

#### Scenario: Reset returns to the browser language
- **GIVEN** the browser language is `en-US`
- **AND** the stored preferences document is not valid JSON
- **AND** the user chose «Русский» in the language group
- **WHEN** the user resets
- **THEN** the interface language is English at once

### Requirement: Preferences without storage
When the preferences cannot be saved (storage unavailable or a failed write), a chosen setting, the interface language included, SHALL still apply for the rest of the session, and the settings page MUST show a note that changes will not be saved. Errors: none are thrown to the user. <!-- implements FR7 of add-settings-page-and-device-time-location; implements FR12 of add-interface-language-selection -->

#### Scenario: Storage unavailable
- **GIVEN** storage is unavailable
- **WHEN** the user chooses the hour format 12-hour
- **THEN** the location rows show 12-hour times
- **AND** the settings page says changes will not be saved

#### Scenario: Language without storage
- **GIVEN** storage is unavailable
- **WHEN** the user chooses «Русский» in the language group
- **THEN** the interface is in Russian
- **AND** the settings page says changes will not be saved

### Requirement: Preferences are shared between open tabs
A change of the preferences, the interface language included, in one tab SHALL be applied in every other open tab of the app without a reload. Conflict policy: the last write wins. <!-- implements FR7 of add-settings-page-and-device-time-location; implements FR12 of add-interface-language-selection -->

#### Scenario: Another tab changes the hour format
- **GIVEN** the app is open in two tabs
- **WHEN** the user chooses the hour format 12-hour in the first tab
- **THEN** the second tab shows 12-hour times without a reload

#### Scenario: Another tab changes the language
- **GIVEN** the app is open in two tabs in English
- **WHEN** the user chooses «Русский» in the first tab
- **THEN** the second tab is in Russian without a reload

### Requirement: Settings strings are localized
Every string of the settings button, the settings page, its options, its notes, its Reset action, its Gnomish Factory credit and its language group SHALL exist in every locale file, and Russian MUST use the glossary names: «Настройки», «Тема», «Светлая», «Тёмная», «Системная», «Формат времени», «12 часов», «24 часа», «Язык», «Создано с помощью Гномской фабрики». The language button's accessible name is "Language: <native name>" («Язык: <native name>»), the search field label "Search languages" («Поиск языка») and the empty search text "No languages found" («Языки не найдены»). Language names in the list are never translated. <!-- implements FR16 of add-settings-page-and-device-time-location; implements FR2 of add-gnomish-factory-credit; implements FR13, UX1 of add-interface-language-selection -->

#### Scenario: Both languages
- **WHEN** the settings page is shown in `<language>`
- **THEN** the heading is `<heading>` and the groups are `<theme>`, `<hour format>` and `<language group>`
- **AND** the credit is `<credit>`

| language | heading | theme | hour format | language group | credit |
|---|---|---|---|---|---|
| English | Settings | Theme | Hour format | Language | Built with Gnomish Factory |
| Russian | Настройки | Тема | Формат времени | Язык | Создано с помощью Гномской фабрики |

### Requirement: Settings page layout
The settings page SHALL use the app's design tokens: the page background, the groups on surface cards with the theme border, the Manrope font and the accent colour for the checked option. Its text MUST be at least 4.5:1 against its background in both themes. The page MUST NOT scroll horizontally at 320 px and 2560 px. The approved screenshots of the settings page at 375 px and 1024 px in both themes MUST match; they show the language group collapsed, with the 🇺🇸 flag for English. <!-- implements NFR-A3, NFR-R1, NFR-R3, UX2 of add-settings-page-and-device-time-location; implements NFR-R2 of add-interface-language-selection -->

#### Scenario: Narrow and wide screens
- **WHEN** the settings page is `<width>` px wide
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 2560 |

#### Scenario: Approved screenshots
- **WHEN** the settings page is rendered at `<width>` px in the `<theme>` theme
- **THEN** it matches the approved screenshot

| width | theme |
|---|---|
| 375 | light |
| 375 | dark |
| 1024 | light |
| 1024 | dark |
