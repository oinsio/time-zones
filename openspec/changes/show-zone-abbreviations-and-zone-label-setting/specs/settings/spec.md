## ADDED Requirements

### Requirement: Zone label
The settings page SHALL have a "Zone label" («Подпись пояса») group, between the hour format group and the language group, that decides which zone parts the zone line of every location row shows: "UTC offset" («Смещение UTC») and "Abbreviation" («Сокращение»). The two are independent toggles: any of the four combinations is allowed, both off included, and both are on by default. A toggle MUST apply at once, in the same render, to every location row, the device time location's meta line and the wall-time hint (see the `locations` and `time-selection` capabilities), and MUST NOT change the search. Under the toggles a live example MUST show the zone line of Kolkata (country India, `Asia/Kolkata`) at the effective instant, in the interface language, with the elements the toggles allow, and MUST change with every toggle. Inputs: the toggles. Output: the zone label in force. Errors: a failed save follows "Preferences without storage". <!-- implements FR12, FR13, FR14, FR15, UX2 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Both parts by default
- **GIVEN** no preferences document is stored
- **AND** the interface language is English
- **WHEN** the settings page is shown
- **THEN** the "UTC offset" and "Abbreviation" toggles are both on
- **AND** the example shows `India`, `IST`, `UTC+5:30`

#### Scenario: The example follows the toggles
- **GIVEN** the interface language is `<language>`
- **WHEN** the zone label shows `<parts>`
- **THEN** the example shows `<example>`

| language | parts | example |
|---|---|---|
| English | the UTC offset and the zone abbreviation | India, IST, UTC+5:30 |
| English | the UTC offset only | India, UTC+5:30 |
| English | the zone abbreviation only | India, IST |
| English | nothing | India |
| Russian | the UTC offset and the zone abbreviation | Индия, IST, UTC+5:30 |

#### Scenario: Both off leaves the country
- **GIVEN** the list contains Moscow
- **WHEN** the user turns both toggles off and goes back
- **THEN** the Moscow row's zone line is `Russia` alone

#### Scenario: A toggle writes the preferences once
- **WHEN** the user turns the zone abbreviation off
- **THEN** the stored preferences document holds the zone label with the UTC offset only, after the debounce

### Requirement: Toggle group
The zone label group SHALL be built from one reusable toggle group: a caption and any number of options, each an independent toggle that is on or off, shown in one row after the caption. The group MUST take the options and the set of options that are on, and report each toggle the user makes, so a later setting can use it with other options without a new component. The theme and hour format groups keep their radio layout. <!-- implements FR16 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: A group with three options
- **GIVEN** a toggle group with the caption "Sample" and the options A, B and C, of which B is on
- **WHEN** the user turns A on
- **THEN** the group reports that A is now on
- **AND** B stays on and C stays off

### Requirement: Accessible zone label
The zone label group SHALL be a group named by its caption ("Zone label", «Подпись пояса»). Each toggle MUST be a button named by its label that exposes its pressed state, MUST be its own Tab stop, and MUST toggle with Space and with Enter. Each toggle MUST be at least 44 × 44 px, show its pressed state by a check icon as well as by colour, and keep a visible focus outline. The live example MUST be the group's accessible description. axe-core MUST report no violations on the settings page in the light and the dark theme. <!-- implements NFR-A1 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Names and pressed state
- **GIVEN** the interface language is Russian
- **WHEN** the settings page is shown
- **THEN** a group named «Подпись пояса» holds the pressed toggle buttons «Смещение UTC» and «Сокращение»
- **AND** its description contains «Индия»

#### Scenario: Toggle with the keyboard
- **GIVEN** the settings page is shown with both toggles on
- **WHEN** the user tabs to "Abbreviation" and presses Space
- **THEN** "Abbreviation" is not pressed and the example shows `India`, `UTC+5:30`
- **WHEN** the user presses Enter
- **THEN** "Abbreviation" is pressed again

#### Scenario: No violations with the zone label group
- **WHEN** axe-core checks the settings page in the `<theme>` theme with `<parts>`
- **THEN** it reports no violations

| theme | parts |
|---|---|
| light | both toggles on |
| dark | both toggles off |

### Requirement: Zone label layout
The zone label group SHALL take one row of the settings page: its caption and both toggles side by side from 640 px. Below 640 px the toggles MAY move under the caption, but they MUST stay in one row together. The example MUST be under the toggles. The settings page MUST NOT scroll horizontally at 320 px and 2560 px in English and Russian. <!-- implements NFR-R2 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: One row on wide screens
- **WHEN** the settings page is shown `<width>` px wide in `<language>`
- **THEN** the caption and both toggles share one row

| width | language |
|---|---|
| 640 | Russian |
| 1024 | English |

#### Scenario: Narrow screens
- **WHEN** the settings page is shown `<width>` px wide in Russian
- **THEN** both toggles share one row
- **AND** the page does not scroll horizontally

| width |
|---|
| 320 |
| 375 |
| 2560 |

## MODIFIED Requirements

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

### Requirement: Preferences are kept on the device
The theme preference, the hour format, the zone label and the interface language SHALL be saved on the device as one versioned document and restored when the app is opened again, also offline. A stored Light or Dark choice and a stored interface language MUST be in force when the main page is first shown. Nothing MUST be written for the preferences until the user changes a setting. A chosen setting MUST apply at once; its write MUST be debounced and MUST NOT block the interface, and a pending write MUST be flushed when the page is hidden. The preferences MUST NOT be part of the locations document, and a change of the preferences MUST NOT write the locations document. Without a chosen interface language the document records none, and the browser-driven language applies (see the `app-shell` capability). A document written by an earlier version of the app MUST be migrated step by step: a document without an interface language gets the one from the legacy `language` key when that key exists, otherwise none is chosen; a document without a zone label gets the zone label with both the UTC offset and the zone abbreviation shown; every other stored choice is kept. When no preferences document exists but the legacy key does, its value MUST be the chosen interface language, without a write. The next write or Reset MUST remove the legacy key, and the app MUST NOT write the legacy key again. Inputs: the stored document, the legacy key. Output: the preferences in force. <!-- implements FR4, FR7 of add-settings-page-and-device-time-location; implements FR7, FR8 of add-interface-language-selection; FR15 of show-zone-abbreviations-and-zone-label-setting -->

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
- **THEN** the "Abbreviation" toggle is off and the "UTC offset" toggle is on
- **AND** no location row shows a zone abbreviation from the first render

#### Scenario: Existing users get both parts
- **GIVEN** the stored preferences document was written before the zone label existed, with the theme Dark, the hour format 12-hour and the language `ru`
- **WHEN** the app is opened
- **THEN** both zone label toggles are on
- **AND** the theme Dark, the hour format 12-hour and the language «Русский» are in force
- **AND** the stored document is not rewritten until the user changes a setting

#### Scenario: Another tab changes the zone label
- **GIVEN** the app is open in two tabs
- **WHEN** the user turns the UTC offset off in the first tab
- **THEN** the second tab shows no UTC offset on its location rows without a reload

### Requirement: Unreadable stored preferences
When the stored preferences document is not valid JSON, does not match the expected document, holds an unknown option (an unknown zone label part or the same part twice included), or was written by a newer version of the app, the app SHALL start with the default preferences (System, 24-hour, the zone label with both the UTC offset and the zone abbreviation shown, no chosen interface language, so the browser-driven language applies) and MUST NOT show a blank page or block the main page. The settings page MUST then show a note that the settings could not be read, with a Reset action. Reset MUST clear the stored preferences document and the legacy `language` key and remove the note. Reset MUST also bring back the browser-driven interface language at once. The app MUST NOT overwrite the unreadable document by itself; a change of a setting, the interface language included, replaces it. <!-- implements FR7 of add-settings-page-and-device-time-location; implements FR12 of add-interface-language-selection; FR15 of show-zone-abbreviations-and-zone-label-setting -->

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

### Requirement: Settings strings are localized
Every string of the settings button, the settings page, its options, its notes, its Reset action, its Gnomish Factory credit and its language group SHALL exist in every locale file, and Russian MUST use the glossary names: «Настройки», «Тема», «Светлая», «Тёмная», «Системная», «Формат времени», «12 часов», «24 часа», «Подпись пояса», «Смещение UTC», «Сокращение», «Создано с помощью Gnomish Factory». The name of the Gnomish Factory is a brand name: in the credit of every interface language, English, Russian and any language added later, it MUST read exactly `Gnomish Factory`, in Latin letters, and MUST NOT be translated or transliterated into the interface language. The language button's accessible name is "Language: <native name>" («Язык: <native name>»), the search field label "Search languages" («Поиск языка») and the empty search text "No languages found" («Языки не найдены»). Language names in the list are never translated. <!-- implements FR16 of add-settings-page-and-device-time-location; implements FR2 of add-gnomish-factory-credit; implements FR1, FR2 of keep-gnomish-factory-name-untranslated-in-credit; implements FR13, UX1 of add-interface-language-selection; FR12 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Both languages
- **WHEN** the settings page is shown in `<language>`
- **THEN** the heading is `<heading>` and the groups are `<theme>`, `<hour format>`, `<zone label>` and `<language group>`
- **AND** the zone label toggles are `<utc offset>` and `<abbreviation>`
- **AND** the credit is `<credit>`

| language | heading | theme | hour format | zone label | utc offset | abbreviation | language group | credit |
|---|---|---|---|---|---|---|---|---|
| English | Settings | Theme | Hour format | Zone label | UTC offset | Abbreviation | Language | Built with Gnomish Factory |
| Russian | Настройки | Тема | Формат времени | Подпись пояса | Смещение UTC | Сокращение | Язык | Создано с помощью Gnomish Factory |

#### Scenario: The factory name is never translated
- **GIVEN** the app supports the interface languages English and Russian, and any language added later
- **WHEN** the credit is read in each supported interface language
- **THEN** each credit contains `Gnomish Factory`, written exactly as in English

### Requirement: Settings page layout
The settings page SHALL use the app's design tokens: the page background, the groups on surface cards with the theme border, the Manrope font and the accent colour for the checked option. Its text MUST be at least 4.5:1 against its background in both themes. The page MUST NOT scroll horizontally at 320 px and 2560 px. The approved screenshots of the settings page at 375 px and 1024 px in both themes MUST match; they show the zone label group with both toggles on and its example, and the language group collapsed, with the 🇺🇸 flag for English; they are re-approved once for the zone label group. <!-- implements NFR-A3, NFR-R1, NFR-R3, UX2 of add-settings-page-and-device-time-location; implements NFR-R2 of add-interface-language-selection; NFR-R3 of show-zone-abbreviations-and-zone-label-setting -->

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
