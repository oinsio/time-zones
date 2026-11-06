## ADDED Requirements

### Requirement: Deploy time
The settings page SHALL show the deploy time as the last line of its content, directly after the language group, also while the language list is expanded. The deploy time is the instant at which the running build of the app was made; it MUST be fixed into the build, MUST be the same online and offline and after a reload, and MUST change only with a new build. The line MUST read "Deployed `<date>` at `<time>`" («Развёрнуто `<date>` в `<time>`»): the date with the day, the month name and the year, and the time in the hour format, both in the interface language and in the device time zone. It MUST follow a change of the interface language and of the hour format at once, without a reload. The line MUST be plain text: not a link, not a Tab stop and not a live region. Its colour MUST be the accent colour of the settings page icons (the back button's chevron) in the light and the dark theme, and axe-core MUST report no violations on the settings page in both themes. The line MUST fit one line from 320 px. Inputs: the build instant, the interface language, the hour format, the device time zone. Output: the deploy time line. Errors: none; the build instant is always present. <!-- implements FR5, FR6, NFR-A1, NFR-R1, UX2 of polish-settings-and-remove-offline-update-notice -->

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

## MODIFIED Requirements

### Requirement: Zone label
The settings page SHALL have a "Timezone label" («Обозначение часового пояса») group, between the hour format group and the language group, that decides which zone parts the zone line of every location row shows: "Abbreviation" («Аббревиатура») and "UTC offset" («Смещение UTC»). The toggles MUST come in the order of the zone line: "Abbreviation" first, then "UTC offset", in every interface language. The two are independent toggles: any of the four combinations is allowed, both off included, and both are on by default. A toggle MUST apply at once, in the same render, to every location row, the device time location's meta line and the wall-time hint (see the `locations` and `time-selection` capabilities), and MUST NOT change the search. Under the toggles a live example MUST show the zone line of Moscow (country Russia, `Europe/Moscow`) at the effective instant, in the interface language, with the elements the toggles allow, and MUST change with every toggle. Inputs: the toggles. Output: the zone label in force. Errors: a failed save follows "Preferences without storage". <!-- implements FR12, FR13, FR14, FR15, UX2 of show-zone-abbreviations-and-zone-label-setting; FR1, FR2, FR3, FR4, UX1 of polish-settings-and-remove-offline-update-notice -->

#### Scenario: Both parts by default
- **GIVEN** no preferences document is stored
- **AND** the interface language is English
- **WHEN** the settings page is shown
- **THEN** the "Abbreviation" and "UTC offset" toggles are both on, in this order
- **AND** the example shows `Russia`, `MSK`, `UTC+3`

#### Scenario: The example follows the toggles
- **GIVEN** the interface language is `<language>`
- **WHEN** the zone label shows `<parts>`
- **THEN** the example shows `<example>`

| language | parts | example |
|---|---|---|
| English | the UTC offset and the zone abbreviation | Russia, MSK, UTC+3 |
| English | the UTC offset only | Russia, UTC+3 |
| English | the zone abbreviation only | Russia, MSK |
| English | nothing | Russia |
| Russian | the UTC offset and the zone abbreviation | Россия, МСК, UTC+3 |

#### Scenario: Both off leaves the country
- **GIVEN** the list contains Moscow
- **WHEN** the user turns both toggles off and goes back
- **THEN** the Moscow row's zone line is `Russia` alone

#### Scenario: A toggle writes the preferences once
- **WHEN** the user turns the zone abbreviation off
- **THEN** the stored preferences document holds the zone label with the UTC offset only, after the debounce

### Requirement: Accessible zone label
The zone label group SHALL be a group named by its caption ("Timezone label", «Обозначение часового пояса»). Each toggle MUST be a button named by its label that exposes its pressed state, MUST be its own Tab stop, and MUST toggle with Space and with Enter. The Tab order of the toggles MUST be their visual order: "Abbreviation", then "UTC offset". Each toggle MUST be at least 44 × 44 px, show its pressed state by a check icon as well as by colour, and keep a visible focus outline. The live example MUST be the group's accessible description. axe-core MUST report no violations on the settings page in the light and the dark theme. <!-- implements NFR-A1 of show-zone-abbreviations-and-zone-label-setting; NFR-A2 of polish-settings-and-remove-offline-update-notice -->

#### Scenario: Names and pressed state
- **GIVEN** the interface language is Russian
- **WHEN** the settings page is shown
- **THEN** a group named «Обозначение часового пояса» holds the pressed toggle buttons «Аббревиатура» and «Смещение UTC», in this order
- **AND** its description contains «Россия»

#### Scenario: Toggle with the keyboard
- **GIVEN** the settings page is shown with both toggles on
- **WHEN** the user tabs to "Abbreviation" and presses Space
- **THEN** "Abbreviation" is not pressed and the example shows `Russia`, `UTC+3`
- **WHEN** the user presses Enter
- **THEN** "Abbreviation" is pressed again

#### Scenario: Tab order follows the zone line
- **GIVEN** the settings page is shown in English
- **WHEN** the user tabs from "Abbreviation" once
- **THEN** "UTC offset" has the focus

#### Scenario: Toggle size, focus and pressed icon
- **WHEN** the settings page is shown with the "UTC offset" toggle on and the "Abbreviation" toggle off
- **THEN** each toggle is at least 44 × 44 px
- **AND** the focused toggle shows a focus outline
- **AND** only the "UTC offset" toggle shows the check icon

#### Scenario: No violations with the zone label group
- **WHEN** axe-core checks the settings page in the `<theme>` theme with `<parts>`
- **THEN** it reports no violations

| theme | parts |
|---|---|
| light | both toggles on |
| dark | both toggles off |

### Requirement: Settings strings are localized
Every string of the settings button, the settings page, its options, its notes, its Reset action, its Gnomish Factory credit, its language group and its deploy time SHALL exist in every locale file, and Russian MUST use the glossary names: «Настройки», «Тема», «Светлая», «Тёмная», «Системная», «Формат времени», «12 часов», «24 часа», «Обозначение часового пояса», «Аббревиатура», «Смещение UTC», «Развёрнуто», «Создано с помощью Gnomish Factory». The name of the Gnomish Factory is a brand name: in the credit of every interface language, English, Russian and any language added later, it MUST read exactly `Gnomish Factory`, in Latin letters, and MUST NOT be translated or transliterated into the interface language. The language button's accessible name is "Language: <native name>" («Язык: <native name>»), the search field label "Search languages" («Поиск языка») and the empty search text "No languages found" («Языки не найдены»). Language names in the list are never translated. <!-- implements FR16 of add-settings-page-and-device-time-location; implements FR2 of add-gnomish-factory-credit; implements FR1, FR2 of keep-gnomish-factory-name-untranslated-in-credit; implements FR13, UX1 of add-interface-language-selection; FR12 of show-zone-abbreviations-and-zone-label-setting; FR1, FR2, FR3, FR5 of polish-settings-and-remove-offline-update-notice -->

#### Scenario: Both languages
- **WHEN** the settings page is shown in `<language>`
- **THEN** the heading is `<heading>` and the groups are `<theme>`, `<hour format>`, `<zone label>` and `<language group>`
- **AND** the zone label toggles are `<abbreviation>` and `<utc offset>`, in this order
- **AND** the credit is `<credit>`

| language | heading | theme | hour format | zone label | abbreviation | utc offset | language group | credit |
|---|---|---|---|---|---|---|---|---|
| English | Settings | Theme | Hour format | Timezone label | Abbreviation | UTC offset | Language | Built with Gnomish Factory |
| Russian | Настройки | Тема | Формат времени | Обозначение часового пояса | Аббревиатура | Смещение UTC | Язык | Создано с помощью Gnomish Factory |

#### Scenario: The factory name is never translated
- **GIVEN** the app supports the interface languages English and Russian, and any language added later
- **WHEN** the credit is read in each supported interface language
- **THEN** each credit contains `Gnomish Factory`, written exactly as in English

### Requirement: Settings page layout
The settings page SHALL use the app's design tokens: the page background, the groups on surface cards with the theme border, the Manrope font and the accent colour for the checked option and the deploy time. Its text MUST be at least 4.5:1 against its background in both themes. The page MUST NOT scroll horizontally at 320 px and 2560 px. The approved screenshots of the settings page at 375 px and 1024 px in both themes MUST match; they show the zone label group with both toggles on, "Abbreviation" first, and its Russia example, and the language group collapsed, with the 🇺🇸 flag for English; the deploy time keeps its place in them but its text is hidden, because it changes with every build. They are re-approved once for this change. <!-- implements NFR-A3, NFR-R1, NFR-R3, UX2 of add-settings-page-and-device-time-location; implements NFR-R2 of add-interface-language-selection; NFR-R3 of show-zone-abbreviations-and-zone-label-setting; NFR-R2 of polish-settings-and-remove-offline-update-notice -->

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
