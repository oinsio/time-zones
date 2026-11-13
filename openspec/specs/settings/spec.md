# settings Specification

## Purpose
Lets the user open a settings page and choose how the app looks and writes time — the theme preference and the hour format — and keeps these preferences on the device, shared between open tabs and available offline.

## Requirements

### Requirement: Open the settings page
The header's settings button SHALL open the settings page. The settings page MUST show the heading "Settings" («Настройки») as its only page heading, a back button "Back" («Назад»), the theme group, the hour format group, the zone label group and the language group, and MUST NOT show the date bar. The notices region MUST keep working on the settings page. The back button and Esc MUST return to the main page with its locations and reference moment unchanged; while the language list is expanded, Esc first collapses it. Opening the settings page MUST move the focus to its heading, and returning MUST move the focus to the settings button. Inputs: the settings button, the back button, Esc. Output: the shown page. Errors: none. <!-- implements FR1, FR3, NFR-A2 of add-settings-page-and-device-time-location; implements FR1, NFR-A2 of add-interface-language-selection; FR12 of show-zone-abbreviations-and-zone-label-setting -->

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

### Requirement: Theme preference
The settings page SHALL offer the theme preference as three options, in this order: System, shown by a monitor icon; Light, shown by a sun icon; Dark, shown by a moon icon. The options MUST show no visible text. Their names, "System" («Системная»), "Light" («Светлая») and "Dark" («Тёмная»), MUST be their accessible names and their pointer hints. Exactly one option MUST be checked. Without a stored choice, System MUST be checked. Choosing Light or Dark MUST apply that theme's design token values to the whole app at once, whatever the system color-scheme preference is. Choosing System MUST make the theme follow the system color-scheme preference, also when the system preference changes while the app is open. The stored values and their effect MUST stay as before the change to icons only. Inputs: the chosen option, the system color-scheme preference. Output: the active theme. Errors: none. <!-- implements FR4, UX5 of add-settings-page-and-device-time-location; FR1, FR2, FR3 of compact-settings-controls -->

#### Scenario: Default is System
- **GIVEN** no preferences are stored
- **WHEN** the user opens the settings
- **THEN** the theme option System is checked

#### Scenario: Icons only, in the order System, Light, Dark
- **GIVEN** the interface language is `<language>`
- **WHEN** the settings page is shown
- **THEN** the theme options are `<system>`, `<light>` and `<dark>`, in this order
- **AND** they show the monitor, the sun and the moon icon and no visible text
- **AND** each option's pointer hint is its name

| language | system | light | dark |
|---|---|---|---|
| English | System | Light | Dark |
| Russian | Системная | Светлая | Тёмная |

#### Scenario: Dark on a light system
- **GIVEN** the system color-scheme preference is light
- **WHEN** the user chooses the theme Dark
- **THEN** the page uses the dark token values at once

#### Scenario: Light on a dark system
- **GIVEN** the system color-scheme preference is dark
- **WHEN** the user chooses the theme Light
- **THEN** the page uses the light token values at once

#### Scenario: System follows a change of the system preference
- **GIVEN** the theme System is chosen and the system color-scheme preference is light
- **WHEN** the system color-scheme preference becomes dark
- **THEN** the page uses the dark token values

#### Scenario: The stored theme is unchanged
- **GIVEN** no preferences are stored
- **WHEN** the user chooses the theme Dark and the preferences are written
- **THEN** the stored preferences hold the theme `DARK` and the hour format `H24`

### Requirement: Hour format
The settings page SHALL offer the hour format as two options, in this order: 12-hour, shown by the text pictogram `12`, and 24-hour, shown by the text pictogram `24`. The pictograms MUST be the same in every interface language. The options MUST be named "12-hour" («12 часов») and "24-hour" («24 часа»), as their accessible names and their pointer hints. Exactly one option MUST be checked. Without a stored choice, 24-hour MUST be checked. A choice MUST apply at once, without a reload and without a loading state, to every time text of the app: the local time of every location row, the day track hour labels, the wall-time input's initial text, the wall-time hint and the date bar's gap note. In 24-hour format a time is written with two-digit hours (`03:30`). In 12-hour format it is written by the interface language's conventions for a 12-hour clock, with the hour without a leading zero and a day period marker (English `3:30 AM`). Times MUST still be derived from each location's IANA identifier at the effective instant. Inputs: the chosen option, the interface language. Output: the time texts. Errors: none. <!-- implements FR5, UX5 of add-settings-page-and-device-time-location; FR4 of compact-settings-controls -->

#### Scenario: Default is 24-hour
- **GIVEN** no preferences are stored
- **WHEN** the user opens the settings
- **THEN** the hour format option 24-hour is checked

#### Scenario: Pictograms in every language
- **GIVEN** the interface language is `<language>`
- **WHEN** the settings page is shown
- **THEN** the hour format options show `12` and `24`, in this order
- **AND** they are named `<twelve>` and `<twenty-four>`

| language | twelve | twenty-four |
|---|---|---|
| English | 12-hour | 24-hour |
| Russian | 12 часов | 24 часа |

#### Scenario: Switching to 12-hour
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Almaty and New York
- **WHEN** the user chooses the hour format 12-hour
- **THEN** Almaty shows `12:30 PM` and New York shows `3:30 AM`
- **AND** on a 1024 px wide page Almaty's hour labels are `12 AM 6 AM 12 PM 6 PM 12 AM`

#### Scenario: Gap note in 12-hour format
- **GIVEN** the interface language is English
- **AND** the hour format is 12-hour
- **AND** the home location is New York
- **AND** the moment is pinned to 02:30 on 7 March 2026 in New York
- **WHEN** the user moves to the next day
- **THEN** the gap note names `2:30 AM` as the requested time and `3:30 AM` as the shown time

### Requirement: 12-hour wall-time text
In both hour formats, a wall-time input SHALL accept, in addition to the 24-hour texts of the `time-selection` capability, a 12-hour text: hours 1–12, optionally followed by `:MM` or `.MM` with two-digit minutes 0–59, then an `AM` or `PM` marker in any letter case, with or without any whitespace before it. `12 AM` MUST be read as `00` hours and `12 PM` as `12` hours. Any local time text the app shows, in either hour format and in either interface language, MUST be accepted unchanged and read as the time it shows. A 12-hour text with hour 0 or above 12 MUST be rejected like any invalid wall-time text. Inputs: the typed text. Output: a wall-clock time of hours and minutes. <!-- implements FR6 of add-settings-page-and-device-time-location -->

#### Scenario: Accepted 12-hour texts
- **WHEN** the user confirms the text `<text>`
- **THEN** the typed wall-clock time is `<time>`

| text | time |
|---|---|
| `9 PM` | `21:00` |
| `9pm` | `21:00` |
| `9:30 am` | `09:30` |
| `09.30 PM` | `21:30` |
| `12 AM` | `00:00` |
| `12:15 PM` | `12:15` |

#### Scenario: Rejected 12-hour texts
- **GIVEN** the interface language is English
- **AND** the moment is live
- **WHEN** the user confirms the text `<text>`
- **THEN** the field shows the error "Enter the time as HH:MM"
- **AND** the moment is still live

| text |
|---|
| `13 PM` |
| `0 AM` |
| `9:60 PM` |

#### Scenario: The shown time is accepted unchanged
- **GIVEN** the hour format is `<format>`
- **AND** the interface language is `<language>`
- **AND** the current instant is `2026-03-08T16:30:00Z`
- **AND** the list is Almaty
- **WHEN** the user opens Almaty's wall-time input and confirms its initial text
- **THEN** the moment is pinned to `2026-03-08T16:30:00Z`

| format | language |
|---|---|
| 12-hour | English |
| 12-hour | Russian |
| 24-hour | English |

### Requirement: Preferences are kept on the device
The theme preference, the hour format, the zone label, the interface language and the view mode SHALL be saved on the device as one versioned document and restored when the app is opened again, also offline. A stored Light or Dark choice, a stored interface language and a stored view mode MUST be in force when the main page is first shown. Nothing MUST be written for the preferences until the user changes a setting. A chosen setting MUST apply at once; its write MUST be debounced and MUST NOT block the interface, and a pending write MUST be flushed when the page is hidden. The preferences MUST NOT be part of the locations document, and a change of the preferences MUST NOT write the locations document. Without a chosen interface language the document records none, and the browser-driven language applies (see the `app-shell` capability). Without a chosen view the document records none, and Cards is shown. A document written by an earlier version of the app MUST be migrated step by step: a document without an interface language gets the one from the legacy `language` key when that key exists, otherwise none is chosen; a document without a zone label gets the zone label with the country, the zone abbreviation and the UTC offset shown; a document without a view mode gets no chosen view; a document written before the zone label had the country gets the country shown and keeps its zone abbreviation and UTC offset choices; every other stored choice is kept. When no preferences document exists but the legacy key does, its value MUST be the chosen interface language, without a write. The next write or Reset MUST remove the legacy key, and the app MUST NOT write the legacy key again. Inputs: the stored document, the legacy key. Output: the preferences in force. <!-- implements FR4, FR7 of add-settings-page-and-device-time-location; implements FR7, FR8 of add-interface-language-selection; FR15 of show-zone-abbreviations-and-zone-label-setting; FR3, FR4 of add-view-mode-setting-and-grid-skeleton; FR6 of add-country-to-zone-label -->

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

#### Scenario: The zone label survives a reload
- **GIVEN** the user turned the zone abbreviation off
- **WHEN** the app is opened again
- **THEN** the "Abbreviation" toggle is off and the "Country" and "UTC offset" toggles are on
- **AND** no location row shows a zone abbreviation from the first render

#### Scenario: The country choice survives a reload
- **GIVEN** the list contains Moscow
- **AND** the user turned the country off
- **WHEN** the app is opened again
- **THEN** the "Country" toggle is off
- **AND** the Moscow row shows no country name from the first render

#### Scenario: Existing users get both parts
- **GIVEN** the stored preferences document was written before the zone label existed, with the theme Dark, the hour format 12-hour and the language `ru`
- **WHEN** the app is opened
- **THEN** all three zone label toggles are on
- **AND** the theme Dark, the hour format 12-hour and the language «Русский» are in force
- **AND** the stored document is not rewritten until the user changes a setting

#### Scenario: Existing users keep the country
- **GIVEN** the stored preferences document was written before the zone label had the country, with the theme Dark, the hour format 12-hour, the language `ru`, the view "Grid" and only the UTC offset in the zone label
- **WHEN** the app is opened
- **THEN** the "Country" and "UTC offset" toggles are on and the "Abbreviation" toggle is off
- **AND** the theme Dark, the hour format 12-hour, the language «Русский» and the view "Grid" are in force
- **AND** the stored document is not rewritten until the user changes a setting

#### Scenario: Another tab changes the zone label
- **GIVEN** the app is open in two tabs
- **WHEN** the user turns the UTC offset off in the first tab
- **THEN** the second tab shows no UTC offset on its location rows without a reload

#### Scenario: Another tab changes the country
- **GIVEN** the list contains Moscow
- **AND** the app is open in two tabs
- **WHEN** the user turns the country off in the first tab
- **THEN** the second tab shows no country name on its Moscow row without a reload

#### Scenario: The view survives a reload
- **GIVEN** the user chose the view "Grid"
- **WHEN** the app is opened again
- **THEN** the main page shows the Grid view from its first render
- **AND** the view group checks "Grid"

#### Scenario: Existing users get Cards
- **GIVEN** the stored preferences document was written before the view mode existed, with the theme Dark, the hour format 12-hour, the language `ru` and only the UTC offset in the zone label
- **WHEN** the app is opened
- **THEN** the main page shows the Cards view and the view group checks «Карточки»
- **AND** the theme Dark, the hour format 12-hour, the language «Русский» and the zone label with the country and the UTC offset are in force
- **AND** the stored document is not rewritten until the user changes a setting

#### Scenario: Another tab changes the view
- **GIVEN** the app is open in two tabs, both showing Cards
- **WHEN** the user chooses the view "Grid" in the first tab
- **THEN** the second tab shows the Grid view without a reload

### Requirement: Unreadable stored preferences
When the stored preferences document is not valid JSON, does not match the expected document, holds an unknown option (an unknown zone label part or the same part twice included, a view mode that is neither a non-empty text nor "none chosen"), or was written by a newer version of the app, the app SHALL start with the default preferences (System, 24-hour, the zone label with the country, the zone abbreviation and the UTC offset shown, no chosen interface language, so the browser-driven language applies, and no chosen view, so Cards is shown) and MUST NOT show a blank page or block the main page. A stored view mode that names no registered view MUST NOT make the document unreadable. The settings page MUST then show a note that the settings could not be read, with a Reset action. Reset MUST clear the stored preferences document and the legacy `language` key and remove the note. Reset MUST also bring back the browser-driven interface language at once. The app MUST NOT overwrite the unreadable document by itself; a change of a setting, the interface language included, replaces it. <!-- implements FR7 of add-settings-page-and-device-time-location; implements FR12 of add-interface-language-selection; FR15 of show-zone-abbreviations-and-zone-label-setting; FR3, FR4 of add-view-mode-setting-and-grid-skeleton; FR6 of add-country-to-zone-label -->

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

#### Scenario: A view mode of the wrong type
- **GIVEN** the stored preferences document of the current version holds the view mode `42` as a number
- **WHEN** the user opens the app and the settings page
- **THEN** the main page was shown with the Cards view
- **AND** the settings page shows the note with a Reset action

#### Scenario: The country twice
- **GIVEN** the stored preferences document of the current version holds the country twice in the zone label
- **WHEN** the user opens the app and the settings page
- **THEN** the main page was shown with all three zone label parts
- **AND** the settings page shows the note with a Reset action

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
Every string of the settings button, the settings page, its options, its notes, its Reset action, its Gnomish Factory credit, its language group, its view group and its deploy time SHALL exist in every locale file, and Russian MUST use the glossary names: «Настройки», «Тема», «Светлая», «Тёмная», «Системная», «Формат времени», «12 часов», «24 часа», «Вид», «Карточки», «Сетка», «Обозначение часового пояса», «Страна», «Аббревиатура», «Смещение UTC», «Только город», «Развёрнуто», «Создано с помощью Gnomish Factory». The name of the Gnomish Factory is a brand name: in the credit of every interface language, English, Russian and any language added later, it MUST read exactly `Gnomish Factory`, in Latin letters, and MUST NOT be translated or transliterated into the interface language. The language button's accessible name is "Language: <native name>" («Язык: <native name>»), the search field label "Search languages" («Поиск языка») and the empty search text "No languages found" («Языки не найдены»). Language names in the list are never translated. <!-- implements FR16 of add-settings-page-and-device-time-location; implements FR2 of add-gnomish-factory-credit; implements FR1, FR2 of keep-gnomish-factory-name-untranslated-in-credit; implements FR13, UX1 of add-interface-language-selection; FR12 of show-zone-abbreviations-and-zone-label-setting; FR1, FR2, FR3, FR5 of polish-settings-and-remove-offline-update-notice; FR1 of add-view-mode-setting-and-grid-skeleton; FR1, FR5, UX1 of add-country-to-zone-label -->

#### Scenario: Both languages
- **WHEN** the settings page is shown in `<language>`
- **THEN** the heading is `<heading>` and the groups are `<theme>`, `<hour format>`, `<view>`, `<zone label>` and `<language group>`
- **AND** the zone label toggles are `<country>`, `<abbreviation>` and `<utc offset>`, in this order
- **AND** the view options are `<cards>` and `<grid>`, in this order
- **AND** the credit is `<credit>`

| language | heading | theme | hour format | view | cards | grid | zone label | country | abbreviation | utc offset | language group | credit |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| English | Settings | Theme | Hour format | View | Cards | Grid | Timezone label | Country | Abbreviation | UTC offset | Language | Built with Gnomish Factory |
| Russian | Настройки | Тема | Формат времени | Вид | Карточки | Сетка | Обозначение часового пояса | Страна | Аббревиатура | Смещение UTC | Язык | Создано с помощью Gnomish Factory |

#### Scenario: The factory name is never translated
- **GIVEN** the app supports the interface languages English and Russian, and any language added later
- **WHEN** the credit is read in each supported interface language
- **THEN** each credit contains `Gnomish Factory`, written exactly as in English

### Requirement: Settings in every view
Opening the settings and switching the theme and the hour format are part of the view contract (ADR-0002). For every registered view, the user MUST be able to open the settings from the main page, change both preferences, and return to the view showing the changed hour format. <!-- implements FR17 of add-settings-page-and-device-time-location -->

#### Scenario: Switch the hour format from the view
- **GIVEN** the view under contract is shown
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the stored locations are Almaty
- **WHEN** the user opens the settings, chooses the hour format 12-hour and goes back
- **THEN** Almaty shows `12:30 PM`

#### Scenario: Switch the theme from the view
- **GIVEN** the view under contract is shown in the light system color scheme
- **WHEN** the user opens the settings and chooses the theme Dark
- **THEN** the page uses the dark token values

### Requirement: Accessible settings
The theme options and the hour format options SHALL each be a radio group, named by its visible caption "Theme" («Тема») and "Hour format" («Формат времени»), with the checked option exposed as checked. Each group MUST be one Tab stop, and the arrow keys MUST move the choice within it in the visual order. The checked option MUST be marked by a fill in the accent colour with its icon or pictogram in the accent foreground colour, while the unchecked options keep the surface colour, so the mark is a change of fill and not of hue alone. Each option MUST keep a visible focus outline when focused with the keyboard. The visible pictogram of each hour format option MUST be part of its accessible name. Every option and the back button MUST be at least 44 × 44 px. axe-core MUST report no violations on the settings page in the light and the dark theme, with and without the unreadable-settings note. <!-- implements NFR-A1, NFR-A2, NFR-A3, UX2 of add-settings-page-and-device-time-location; NFR-A1, NFR-A2, NFR-A3 of compact-settings-controls -->

#### Scenario: Arrow keys change the theme
- **GIVEN** the settings page is shown and the theme System is checked
- **WHEN** the user tabs into the theme group and presses Arrow Up
- **THEN** the theme Dark is checked and the page uses the dark token values

#### Scenario: Arrow keys follow the visual order
- **GIVEN** the settings page is shown and the theme System is checked
- **WHEN** the user tabs into the theme group and presses Arrow Right
- **THEN** the theme Light is checked
- **WHEN** the user presses Arrow Right again
- **THEN** the theme Dark is checked

#### Scenario: Names and checked state
- **GIVEN** the interface language is Russian
- **WHEN** the settings page is shown
- **THEN** a radio group named «Тема» has the checked option «Системная»
- **AND** a radio group named «Формат времени» has the checked option «24 часа»

#### Scenario: Size, focus and checked fill
- **WHEN** the settings page is shown in the `<theme>` theme
- **THEN** every theme and hour format option is at least 44 × 44 px
- **AND** the checked option is filled with the accent colour and the unchecked options with the surface colour
- **AND** the focused option shows a focus outline when focused with the keyboard

| theme |
|---|
| light |
| dark |

#### Scenario: No violations
- **WHEN** axe-core checks the settings page in the `<theme>` theme
- **THEN** it reports no violations

| theme |
|---|
| light |
| dark |

### Requirement: Settings page layout
The settings page SHALL use the app's design tokens: the page background, the groups on surface cards with the theme border, the Manrope font and the accent colour for the checked option and the deploy time. Its text MUST be at least 4.5:1 against its background in both themes. The theme group, the hour format group and the view group MUST each take one row at 320, 375, 1024 and 2560 px in English and Russian. The page MUST NOT scroll horizontally at 320 px and 2560 px. The approved screenshots of the settings page at 375 px and 1024 px in both themes MUST match. They show the theme group as three icons in the order System, Light, Dark with System checked, the hour format group as `12` and `24` with 24 checked, the view group as "Cards" and "Grid" with Cards checked, the zone label group with both toggles on, "Abbreviation" first, and its Russia example, and the language group collapsed, with the 🇺🇸 flag for English. The deploy time keeps its place in them but its text is hidden, because it changes with every build. They are re-approved once for this change. <!-- implements NFR-A3, NFR-R1, NFR-R3, UX2 of add-settings-page-and-device-time-location; implements NFR-R2 of add-interface-language-selection; NFR-R3 of show-zone-abbreviations-and-zone-label-setting; NFR-R2 of polish-settings-and-remove-offline-update-notice; NFR-R1, NFR-R2 of compact-settings-controls; NFR-R1, NFR-R2 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: Narrow and wide screens
- **WHEN** the settings page is `<width>` px wide
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 2560 |

#### Scenario: Compact groups
- **WHEN** the settings page is shown 375 px wide in `<language>`
- **THEN** the theme group, the hour format group and the view group are each at most 56 px high

| language |
|---|
| English |
| Russian |

#### Scenario: Approved screenshots
- **WHEN** the settings page is rendered at `<width>` px in the `<theme>` theme
- **THEN** it matches the approved screenshot

| width | theme |
|---|---|
| 375 | light |
| 375 | dark |
| 1024 | light |
| 1024 | dark |

### Requirement: Preferences are fast
Presenting the location rows again with unchanged preferences and an unchanged interface language SHALL build no formatter. After the hour format or the interface language changes, presenting the rows MUST build at most one formatter per time zone and label kind in use. These bounds are checked by counting work, never by measuring time (ADR-0008). <!-- implements NFR-P1 of add-settings-page-and-device-time-location; implements NFR-P1 of add-interface-language-selection -->

#### Scenario: Presenting again builds no formatter
- **GIVEN** 50 locations have been presented in the hour format 24-hour
- **WHEN** the same rows are presented again for the next minute tick
- **THEN** no formatter is built

#### Scenario: Switching the hour format builds one formatter per zone and kind
- **GIVEN** 50 locations in 50 different time zones have been presented in the hour format 24-hour
- **WHEN** the hour format becomes 12-hour and the rows are presented
- **THEN** at most one formatter per time zone and label kind in use is built

#### Scenario: Presenting again with the same language builds no formatter
- **GIVEN** 50 locations have been presented in English
- **WHEN** the same rows are presented again in English
- **THEN** no formatter is built

#### Scenario: Switching the language builds one formatter per zone and kind
- **GIVEN** 50 locations in 50 different time zones have been presented in English
- **WHEN** the interface language becomes Russian and the rows are presented
- **THEN** at most one formatter per time zone and label kind in use is built

### Requirement: Gnomish Factory credit
The settings page SHALL show the Gnomish Factory credit as the line directly above the theme group, on every width: below the page header with the back button and the "Settings" heading, below any settings note (the unreadable-settings note with its Reset action, the save-failed note), and with nothing between the credit and the theme group. The credit MUST NOT be part of the page header. The credit MUST be one link whose text is the whole credit: "Built with Gnomish Factory" in English and «Создано с помощью Gnomish Factory» in Russian, following the interface language; in every language the factory name stays `Gnomish Factory`, untranslated. The link's address MUST be `https://oinsio.github.io/gnomish-factory/`. Activating it MUST open that page in a new browsing context (a new tab, or the system browser for the installed app) that gets no reference to the app's window, and the app's own tab MUST keep the settings page with its locations, reference moment and preferences unchanged. The app MUST NOT request the landing page itself, so the settings page works the same offline. Inputs: the interface language, the settings notes shown, activation of the link. Output: the credit line; a new tab at the landing page. Errors: none; offline, the new tab shows the browser's own offline page and the app tab is unaffected. <!-- implements FR1, FR2, FR3, UX1, UX3 of add-gnomish-factory-credit; implements FR1, UX1 of move-and-restyle-gnomish-factory-credit; implements FR1 of keep-gnomish-factory-name-untranslated-in-credit -->

The credit MUST use the app's design tokens in the light and the dark theme: the Manrope font, an underline, and at rest, on hover and on keyboard focus the accent colour of the active theme, the colour of the unchecked theme option icons. Its font size MUST be 15–20 % larger than 14 px, that is between 16.1 px and 16.8 px at the default root font size of 16 px, so the credit text is larger than the group captions and smaller than the "Settings" heading. It MUST follow the active theme, also when the theme changes while the settings page is open, and MUST NOT introduce a colour the tokens do not define. <!-- implements FR4, UX2 of add-gnomish-factory-credit; implements FR2, FR3, UX1, UX2 of move-and-restyle-gnomish-factory-credit; FR5, FR6 of compact-settings-controls -->

The credit MUST be exposed as a link named exactly by its visible text. It MUST be reachable with Tab and Shift+Tab, come after the back button and before the theme group in the Tab order, open with Enter, show a visible focus outline in the accent colour, and be at least 44 px high. Opening the settings page MUST still move the focus to the heading. Its text MUST have a contrast of at least 4.5:1 against the page background in both themes, at rest and on focus, and axe-core MUST report no violations on the settings page with the credit. At 320 px and 2560 px the credit text MUST be shown in full in both languages (it may wrap) and the page MUST NOT scroll horizontally. <!-- implements NFR-A1, NFR-A2, NFR-R1 of add-gnomish-factory-credit; implements NFR-A1, NFR-A2, NFR-R1 of move-and-restyle-gnomish-factory-credit -->

#### Scenario: The credit in both languages
- **GIVEN** the interface language is `<language>`
- **WHEN** the user opens the settings
- **THEN** a link named `<credit>` to `https://oinsio.github.io/gnomish-factory/` is shown
- **AND** the link stands below the "Settings" heading and directly above the theme group

| language | credit |
|---|---|
| English | Built with Gnomish Factory |
| Russian | Создано с помощью Gnomish Factory |

#### Scenario: The credit below a settings note
- **GIVEN** the stored preferences document is not valid JSON
- **WHEN** the user opens the settings
- **THEN** the note about unreadable settings stands above the credit
- **AND** the credit stands directly above the theme group

#### Scenario: Following the credit keeps the app
- **GIVEN** the current time is `2026-03-09T07:30:00Z`
- **AND** the list is Moscow
- **AND** the settings page is shown
- **WHEN** the user follows the Gnomish Factory credit
- **THEN** a new tab opens at `https://oinsio.github.io/gnomish-factory/`
- **AND** the app's tab still shows the settings page
- **WHEN** the user goes back
- **THEN** the main page is shown with Moscow at `10:30`

#### Scenario: The credit offline
- **GIVEN** the app is installed for offline use
- **WHEN** the user reopens the app without network
- **AND** the user opens the settings
- **THEN** the credit is "Built with Gnomish Factory"

#### Scenario: Token colours in both themes
- **GIVEN** the `<theme>` theme is active
- **WHEN** the user opens the settings
- **THEN** the credit text has the colour of the unchecked theme option icons and is underlined
- **WHEN** the credit gets the keyboard focus
- **THEN** the credit text still has the colour of the unchecked theme option icons, with a focus outline in the accent colour
- **WHEN** the pointer rests on the credit without the keyboard focus
- **THEN** the credit text still has the colour of the unchecked theme option icons

| theme |
|---|
| light |
| dark |

#### Scenario: The credit follows a theme change
- **GIVEN** the theme System is chosen and the system color-scheme preference is light
- **AND** the settings page is shown
- **WHEN** the system color-scheme preference becomes dark
- **THEN** the credit text has the colour of the unchecked theme option icons of the dark theme

#### Scenario: The larger credit text
- **WHEN** the user opens the settings
- **THEN** the credit's font size is between 1.15 and 1.20 times 14 px
- **AND** the credit text is larger than the group captions and smaller than the "Settings" heading

#### Scenario: Keyboard order and focus
- **GIVEN** the settings page is shown
- **THEN** the focus is on the "Settings" heading
- **WHEN** the user presses Tab
- **THEN** the focus is on the credit, with a focus outline in the accent colour
- **AND** the credit is at least 44 px high
- **WHEN** the user presses Shift+Tab
- **THEN** the focus is on the back button
- **WHEN** the user presses Tab and then Enter
- **THEN** a new tab opens at `https://oinsio.github.io/gnomish-factory/`

#### Scenario: The full credit on narrow and wide screens
- **GIVEN** the interface language is `<language>`
- **WHEN** the settings page is `<width>` px wide
- **THEN** the credit text is shown in full
- **AND** the page does not scroll horizontally

| language | width |
|---|---|
| English | 320 |
| Russian | 320 |
| Russian | 2560 |

### Requirement: Interface language choice
The settings page SHALL show the group "Language" («Язык») directly below the zone label group, with a caption styled like the captions of the theme and hour format groups. Collapsed, the group MUST show one button with the emoji and native name of the active interface language and a chevron pointing down. Activating the button MUST expand the language list directly under it, in the page flow, with no dialog, popover or overlay, and the chevron MUST turn; activating it again MUST collapse the list. The list MUST have one row per registered locale, showing the locale's metadata emoji and native name, never translated, sorted by the metadata `name`. The row of the active interface language MUST be marked by the accent border and a check icon at its end. Choosing a row MUST apply that language at once, without a reload and without a loading state, and collapse the list. Every interface text, country name, date, month and weekday name, city name in the search results, city label of a city location, exemplar city of the device time location, the page `lang` attribute and the document title MUST follow the new language at once. Inputs: the button, the chosen row. Output: the interface language in force, the stored choice. Errors: none. <!-- implements FR1, FR2, FR3, FR4, FR5, UX1, UX2, UX3 of add-interface-language-selection; FR2 of show-city-labels-in-interface-language; FR12 of show-zone-abbreviations-and-zone-label-setting; FR6 of compact-settings-controls -->

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
- **AND** after going back Almaty reads «Алматы» and shows the country «Казахстан», and the date bar shows a Russian weekday
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

### Requirement: Zone label
The settings page SHALL have a "Timezone label" («Обозначение часового пояса») group, between the hour format group and the language group, that decides which zone parts the zone line of every location row shows: "Country" («Страна»), "Abbreviation" («Аббревиатура») and "UTC offset" («Смещение UTC»). The toggles MUST come in the order of the zone line: "Country" first, then "Abbreviation", then "UTC offset", in every interface language. The three are independent toggles: any of the eight combinations is allowed, all off included, and all three are on by default. A toggle MUST apply at once, in the same render, to every location row, the device time location's meta line and the wall-time hint (see the `locations` and `time-selection` capabilities), and MUST NOT change the search. Under the toggles a live example MUST show the zone line of Moscow (country Russia, `Europe/Moscow`) at the effective instant, in the interface language, with the elements the toggles allow, and MUST change with every toggle; while no element of the example is shown, it MUST read "City only" («Только город»). Inputs: the toggles. Output: the zone label in force. Errors: a failed save follows "Preferences without storage". <!-- implements FR12, FR13, FR14, FR15, UX2 of show-zone-abbreviations-and-zone-label-setting; FR1, FR2, FR3, FR4, UX1 of polish-settings-and-remove-offline-update-notice; FR1, FR2, FR5, FR6, UX1 of add-country-to-zone-label -->

#### Scenario: Both parts by default
- **GIVEN** no preferences document is stored
- **AND** the interface language is English
- **WHEN** the settings page is shown
- **THEN** the "Country", "Abbreviation" and "UTC offset" toggles are all on, in this order
- **AND** the example shows `Russia`, `MSK`, `UTC+3`

#### Scenario: The example follows the toggles
- **GIVEN** the interface language is `<language>`
- **WHEN** the zone label shows `<parts>`
- **THEN** the example shows `<example>`

| language | parts | example |
|---|---|---|
| English | the country, the zone abbreviation and the UTC offset | Russia, MSK, UTC+3 |
| English | the country and the UTC offset | Russia, UTC+3 |
| English | the country and the zone abbreviation | Russia, MSK |
| English | the country only | Russia |
| English | the zone abbreviation and the UTC offset | MSK, UTC+3 |
| English | the UTC offset only | UTC+3 |
| English | the zone abbreviation only | MSK |
| English | nothing | City only |
| Russian | the country, the zone abbreviation and the UTC offset | Россия, МСК, UTC+3 |
| Russian | nothing | Только город |

#### Scenario: Both off leaves the country
- **GIVEN** the list contains Moscow
- **WHEN** the user turns the "Abbreviation" and "UTC offset" toggles off and goes back
- **THEN** the Moscow row's zone line is `Russia` alone

#### Scenario: All off leaves the city alone
- **GIVEN** the list contains Moscow
- **WHEN** the user turns all three toggles off and goes back
- **THEN** the Moscow row shows its city and no zone line

#### Scenario: A toggle writes the preferences once
- **WHEN** the user turns the country off
- **THEN** the stored preferences document holds the zone label with the zone abbreviation and the UTC offset, after the debounce

### Requirement: Toggle group
The zone label group SHALL be built from one reusable toggle group: a caption and any number of options, each an independent toggle that is on or off, shown after the caption in one row while they fit and wrapping onto further rows only when they do not. The group MUST take the options and the set of options that are on, and report each toggle the user makes, so a later setting can use it with other options without a new component. The toggle group and the option group MUST share one row layout. The toggle group's options stay separate toggle buttons, so they read as independent switches. <!-- implements FR16 of show-zone-abbreviations-and-zone-label-setting; FR6, UX3 of compact-settings-controls; NFR-R1 of add-country-to-zone-label -->

#### Scenario: A group with three options
- **GIVEN** a toggle group with the caption "Sample" and the options A, B and C, of which B is on
- **WHEN** the user turns A on
- **THEN** the group reports that A is now on
- **AND** B stays on and C stays off

### Requirement: Accessible zone label
The zone label group SHALL be a group named by its caption ("Timezone label", «Обозначение часового пояса»). Each toggle MUST be a button named by its label that exposes its pressed state, MUST be its own Tab stop, and MUST toggle with Space and with Enter. The Tab order of the toggles MUST be their visual order: "Country", then "Abbreviation", then "UTC offset". Each toggle MUST be at least 44 × 44 px, show its pressed state by a check icon as well as by colour, and keep a visible focus outline. The live example, "City only" included, MUST be the group's accessible description. axe-core MUST report no violations on the settings page in the light and the dark theme. <!-- implements NFR-A1 of show-zone-abbreviations-and-zone-label-setting; NFR-A2 of polish-settings-and-remove-offline-update-notice; FR2, NFR-A1 of add-country-to-zone-label -->

#### Scenario: Names and pressed state
- **GIVEN** the interface language is Russian
- **WHEN** the settings page is shown
- **THEN** a group named «Обозначение часового пояса» holds the pressed toggle buttons «Страна», «Аббревиатура» and «Смещение UTC», in this order
- **AND** its description contains «Россия»

#### Scenario: Toggle with the keyboard
- **GIVEN** the settings page is shown in English with all toggles on
- **WHEN** the user tabs to "Country" and presses Space
- **THEN** "Country" is not pressed and the example shows `MSK`, `UTC+3`
- **WHEN** the user presses Enter
- **THEN** "Country" is pressed again

#### Scenario: Tab order follows the zone line
- **GIVEN** the settings page is shown in English
- **WHEN** the user tabs from "Country" once and then once more
- **THEN** "Abbreviation" and then "UTC offset" has the focus

#### Scenario: Toggle size, focus and pressed icon
- **WHEN** the settings page is shown with the "UTC offset" toggle on and the "Country" and "Abbreviation" toggles off
- **THEN** each toggle is at least 44 × 44 px
- **AND** the focused toggle shows a focus outline
- **AND** only the "UTC offset" toggle shows the check icon

#### Scenario: City only is the description
- **GIVEN** the settings page is shown in English with all toggles off
- **THEN** the description of the group contains "City only"

#### Scenario: No violations with the zone label group
- **WHEN** axe-core checks the settings page in the `<theme>` theme with `<parts>`
- **THEN** it reports no violations

| theme | parts |
|---|---|
| light | all toggles on |
| light | all toggles off |
| dark | all toggles on |
| dark | all toggles off |

### Requirement: Zone label layout
The zone label group SHALL keep its three toggles in one row from 640 px; the caption shares that row where it fits and otherwise sits above it. Below 640 px the toggles MAY wrap onto further rows, but no toggle MUST shrink below 44 × 44 px. The example MUST be under the toggles. Turning a toggle on or off MUST NOT move or resize any toggle. The settings page MUST NOT scroll horizontally at 320 px, 375 px and 2560 px in English and Russian. <!-- implements NFR-R2, UX2 of show-zone-abbreviations-and-zone-label-setting; NFR-R1 of add-country-to-zone-label -->

#### Scenario: Toggling does not move the toggles
- **GIVEN** the settings page is shown `<width>` px wide with all toggles on
- **WHEN** the user turns "Country" off
- **THEN** all three toggles keep their position and size

| width |
|---|
| 375 |
| 1024 |

#### Scenario: One row on wide screens
- **WHEN** the settings page is shown `<width>` px wide in `<language>`
- **THEN** the three toggles share one row

| width | language |
|---|---|
| 640 | Russian |
| 1024 | English |

#### Scenario: Narrow screens
- **WHEN** the settings page is shown `<width>` px wide in `<language>`
- **THEN** every toggle is at least 44 × 44 px
- **AND** the page does not scroll horizontally

| width | language |
|---|---|
| 320 | Russian |
| 320 | English |
| 375 | Russian |
| 375 | English |
| 2560 | Russian |
| 2560 | English |

#### Scenario: Re-approved settings screenshots
- **GIVEN** an approved screenshot state of the settings page
- **WHEN** it is rendered at its approved width and theme
- **THEN** it matches the screenshot re-approved for this change with the "Country" toggle

### Requirement: Deploy time
The settings page SHALL show the deploy time directly after the language group, also while the language list is expanded; only the zone rules release line follows it. The deploy time is the instant at which the running build of the app was made; it MUST be fixed into the build, MUST be the same online and offline and after a reload, and MUST change only with a new build. The line MUST read "Deployed `<date>` at `<time>`" («Развёрнуто `<date>` в `<time>`»): the date with the day, the month name and the year, and the time in the hour format, both in the interface language and in the device time zone. It MUST follow a change of the interface language and of the hour format at once, without a reload. The line MUST be plain text: not a link, not a Tab stop and not a live region. Its colour MUST be the accent colour of the settings page icons (the back button's chevron) in the light and the dark theme, and axe-core MUST report no violations on the settings page in both themes. The line MUST fit one line from 375 px; at 320 px it MAY wrap between words but MUST NOT make the page scroll horizontally. Inputs: the build instant, the interface language, the hour format, the device time zone. Output: the deploy time line. Errors: none; the build instant is always present. <!-- implements FR5, FR6, NFR-A1, NFR-R1, UX2 of polish-settings-and-remove-offline-update-notice; FR8 of add-remote-zone-rules-updates -->

#### Scenario: The deploy time in the interface language
- **GIVEN** the build was made at `2026-03-08T07:30:00.000Z`
- **AND** the device time zone is `<zone>`
- **WHEN** the settings page is shown in `<language>` with the hour format `<hour format>`
- **THEN** the line after the language group reads `<text>`

| zone | language | hour format | text |
|---|---|---|---|
| UTC | English | 24-hour | Deployed March 8, 2026 at 07:30 |
| UTC | English | 12-hour | Deployed March 8, 2026 at 7:30 AM |
| UTC | Russian | 24-hour | Развёрнуто 8 марта 2026 г. в 07:30 |
| Asia/Kolkata | English | 24-hour | Deployed March 8, 2026 at 13:00 |

#### Scenario: The deploy time follows the settings at once
- **GIVEN** the settings page shows the deploy time in English with the hour format 24-hour
- **WHEN** the user chooses the hour format 12-hour
- **THEN** the deploy time shows its time in the 12-hour format without a reload

#### Scenario: The deploy time is fixed into the build
- **GIVEN** the app was built at an instant
- **WHEN** the settings page is shown later, online or offline
- **THEN** the deploy time shows the build instant, not the current time

#### Scenario: The deploy time in the icon colour
- **WHEN** the settings page is shown in the `<theme>` theme
- **THEN** the deploy time has the colour of the back button's icon
- **AND** it is not a Tab stop
- **AND** axe-core reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: The deploy time fits one line
- **WHEN** the settings page is `<width>` px wide in `<language>`
- **THEN** the deploy time takes one line

| width | language |
|---|---|
| 375 | English, 12-hour |
| 375 | Russian |
| 1024 | English, 12-hour |
| 1024 | Russian |

#### Scenario: The deploy time at 320 px
- **WHEN** the settings page is 320 px wide in English with the hour format 12-hour or in Russian
- **THEN** the settings page does not scroll horizontally

### Requirement: Option group
The theme group, the hour format group and the view group SHALL be built from one reusable option group: a caption and any number of mutually exclusive options, of which exactly one is checked. Each option has a value, a name, and either an icon or a pictogram, or neither. The icon or the pictogram is what the option shows. With neither, the option shows its name as text; the view options have neither. The option's name is always its accessible name and its pointer hint. The group MUST take the options in their display order and the checked value, and MUST report each choice the user makes, so a later setting can use it with other options without a new component. The option group MUST show its caption and its options in one row, with the same row layout as the toggle group: caption at the start, options at the end. The options of one group MUST sit together as one joined control. Choosing an option MUST NOT move or resize any option. Inputs: the caption, the options, the checked value, the user's choice. Output: the reported value. Errors: none. <!-- implements FR5, FR6, UX1, UX2, UX3 of compact-settings-controls; FR1, UX1 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: A group with three options
- **GIVEN** an option group with the caption "Sample" and the options A, B and C, of which B is checked
- **WHEN** the user chooses A
- **THEN** the group reports A
- **AND** the options are A, B and C, in this order

#### Scenario: An option without an icon or a pictogram shows its name
- **GIVEN** an option group with the caption "Sample" and an option named "Plain" that has neither an icon nor a pictogram
- **WHEN** the group is shown
- **THEN** the option shows the text "Plain"

#### Scenario: Caption and options in one row
- **WHEN** the settings page is shown `<width>` px wide in `<language>`
- **THEN** the caption and the options of the theme group share one row
- **AND** the caption and the options of the hour format group share one row
- **AND** the caption and the options of the view group share one row

| width | language |
|---|---|
| 320 | Russian |
| 375 | English |
| 1024 | Russian |
| 2560 | English |

#### Scenario: Choosing moves nothing
- **GIVEN** the settings page is shown 375 px wide
- **WHEN** the user chooses the theme Dark
- **THEN** all three theme options keep their position and size

### Requirement: View mode
The settings page SHALL show a view group captioned "View" («Вид») right after the hour format group, with one option per view of the view registry, in registry order, each named by its view title: "Cards" («Карточки») and "Grid" («Сетка») today. A view added to the registry MUST appear as an option with no change to the settings page. The checked option is the view the main page shows: the chosen view when it is registered, otherwise Cards. Without a chosen view, on the first launch and for an existing user whose stored preferences hold no view mode, Cards MUST be shown and checked. Choosing an option MUST apply that view to the main page at once, without a reload, and MUST keep the location list, home and the reference moment. The view MUST NOT change by itself: not when the window is resized and not when the screen is turned. Inputs: the view registry, the stored view mode, the user's choice. Output: the shown view and the checked option. Errors: none; a stored view that is not registered is treated as no choice. <!-- implements FR1, FR2, FR3, FR4, FR5, UX2 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: Cards by default
- **GIVEN** no preferences document is stored
- **WHEN** the user opens the app and the settings page
- **THEN** the main page showed the Cards view
- **AND** the view group has the options "Cards" and "Grid", in this order, with "Cards" checked

#### Scenario: Choosing Grid
- **GIVEN** the stored locations are Almaty and Moscow
- **WHEN** the user chooses the view "Grid" and goes back
- **THEN** the main page shows the Grid view with Almaty and Moscow

#### Scenario: Switching keeps the selected moment
- **GIVEN** the stored locations are Almaty
- **AND** the user moved to the next day with the date bar
- **WHEN** the user chooses the view "Grid" and goes back
- **THEN** the row of Almaty carries the next day's date

#### Scenario: A stored view that is not registered
- **GIVEN** the stored preferences hold the view mode `timeline`, which no registered view has
- **WHEN** the app is opened
- **THEN** the main page shows the Cards view
- **AND** the view group checks "Cards"

#### Scenario: A newly registered view appears in the settings
- **GIVEN** a test view titled "Sample" is added to the registry after Grid
- **WHEN** the settings page is shown
- **THEN** the view group has the options "Cards", "Grid" and "Sample", in this order

#### Scenario: The view does not follow the width
- **GIVEN** the user chose the view "Grid" at a viewport 1280 px wide
- **WHEN** the viewport becomes `<width>` px wide
- **THEN** the main page still shows the Grid view

| width |
|---|
| 375 |
| 2560 |

#### Scenario: The view does not follow the orientation
- **GIVEN** the user chose the view "Grid" on a phone in portrait
- **WHEN** the phone is turned to landscape
- **THEN** the main page still shows the Grid view

### Requirement: Accessible view group
The view group SHALL be a radio group named by its visible caption "View" («Вид»), with the checked option exposed as checked and each option named by its view title. The group MUST be one Tab stop, and the arrow keys MUST move the choice in display order. Every option MUST be at least 44 × 44 px and MUST keep a visible focus outline when focused with the keyboard. axe-core MUST report no violations on the settings page in the light and the dark theme. <!-- implements NFR-A1 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: Names and checked state of the view group
- **WHEN** the settings page is shown with no view chosen
- **THEN** there is a radio group named "View" with the radios "Cards" (checked) and "Grid"

#### Scenario: Arrow keys change the view
- **GIVEN** the settings page is shown and the view "Cards" is checked
- **WHEN** the user tabs into the view group and presses Arrow Right
- **THEN** the view "Grid" is checked

#### Scenario: Size and focus of the view options
- **WHEN** the settings page is shown in the `<theme>` theme
- **THEN** each view option is at least 44 × 44 px
- **AND** a keyboard-focused view option shows a focus outline
- **AND** axe-core reports no violations

| theme |
|---|
| light |
| dark |

### Requirement: Zone rules release line
The settings page SHALL show the zone rules release line directly after the deploy time, as the last line of its content: "Time zone rules: `<release>`" («Правила часовых поясов: `<release>`»), naming the active release. It MUST be plain text in the accent colour of the deploy time, not a link, not a Tab stop and not a live region, and its strings MUST exist in every locale file. When no release is active, the line MUST be absent. It MUST fit one line from 375 px and MUST NOT make the page scroll horizontally at 320 px. Inputs: the active release, the interface language. Output: the release line. <!-- implements FR8, UX3, NFR-A1, NFR-R1 of add-remote-zone-rules-updates -->

#### Scenario: The line in both languages
- **GIVEN** the active release is `2026f`
- **WHEN** the settings page is shown in `<language>`
- **THEN** the line after the deploy time reads `<text>`

| language | text |
|---|---|
| English | Time zone rules: 2026f |
| Russian | Правила часовых поясов: 2026f |

#### Scenario: The line names the active release
- **GIVEN** the bundled release is `2026f` and the stored release `2026g` is active
- **WHEN** the settings page is shown
- **THEN** the line names `2026g`

#### Scenario: No active release
- **GIVEN** the zone rules failed to load at start
- **WHEN** the settings page is shown
- **THEN** the deploy time is the last line and no release line is shown

#### Scenario: Plain text in the accent colour
- **WHEN** the settings page is shown in the `<theme>` theme
- **THEN** the release line has the colour of the deploy time
- **AND** it is not a Tab stop
- **AND** axe-core reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: The line fits one line
- **WHEN** the settings page is 375 px wide in `<language>`
- **THEN** the release line takes one line

| language |
|---|
| English |
| Russian |

#### Scenario: The line at 320 px
- **WHEN** the settings page is 320 px wide in Russian
- **THEN** the settings page does not scroll horizontally
