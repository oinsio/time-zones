## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Preferences are kept on the device
The theme preference, the hour format, the zone label, the interface language and the view mode SHALL be saved on the device as one versioned document and restored when the app is opened again, also offline. A stored Light or Dark choice, a stored interface language and a stored view mode MUST be in force when the main page is first shown. Nothing MUST be written for the preferences until the user changes a setting. A chosen setting MUST apply at once; its write MUST be debounced and MUST NOT block the interface, and a pending write MUST be flushed when the page is hidden. The preferences MUST NOT be part of the locations document, and a change of the preferences MUST NOT write the locations document. Without a chosen interface language the document records none, and the browser-driven language applies (see the `app-shell` capability). Without a chosen view the document records none, and Cards is shown. A document written by an earlier version of the app MUST be migrated step by step: a document without an interface language gets the one from the legacy `language` key when that key exists, otherwise none is chosen; a document without a zone label gets the zone label with both the UTC offset and the zone abbreviation shown; a document without a view mode gets no chosen view; every other stored choice is kept. When no preferences document exists but the legacy key does, its value MUST be the chosen interface language, without a write. The next write or Reset MUST remove the legacy key, and the app MUST NOT write the legacy key again. Inputs: the stored document, the legacy key. Output: the preferences in force. <!-- implements FR4, FR7 of add-settings-page-and-device-time-location; implements FR7, FR8 of add-interface-language-selection; FR15 of show-zone-abbreviations-and-zone-label-setting; FR3, FR4 of add-view-mode-setting-and-grid-skeleton -->

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

#### Scenario: The view survives a reload
- **GIVEN** the user chose the view "Grid"
- **WHEN** the app is opened again
- **THEN** the main page shows the Grid view from its first render
- **AND** the view group checks "Grid"

#### Scenario: Existing users get Cards
- **GIVEN** the stored preferences document was written before the view mode existed, with the theme Dark, the hour format 12-hour, the language `ru` and only the UTC offset in the zone label
- **WHEN** the app is opened
- **THEN** the main page shows the Cards view and the view group checks «Карточки»
- **AND** the theme Dark, the hour format 12-hour, the language «Русский» and the zone label with only the UTC offset are in force
- **AND** the stored document is not rewritten until the user changes a setting

#### Scenario: Another tab changes the view
- **GIVEN** the app is open in two tabs, both showing Cards
- **WHEN** the user chooses the view "Grid" in the first tab
- **THEN** the second tab shows the Grid view without a reload

### Requirement: Unreadable stored preferences
When the stored preferences document is not valid JSON, does not match the expected document, holds an unknown option (an unknown zone label part or the same part twice included, a view mode that is neither a non-empty text nor "none chosen"), or was written by a newer version of the app, the app SHALL start with the default preferences (System, 24-hour, the zone label with both the UTC offset and the zone abbreviation shown, no chosen interface language, so the browser-driven language applies, and no chosen view, so Cards is shown) and MUST NOT show a blank page or block the main page. A stored view mode that names no registered view MUST NOT make the document unreadable. The settings page MUST then show a note that the settings could not be read, with a Reset action. Reset MUST clear the stored preferences document and the legacy `language` key and remove the note. Reset MUST also bring back the browser-driven interface language at once. The app MUST NOT overwrite the unreadable document by itself; a change of a setting, the interface language included, replaces it. <!-- implements FR7 of add-settings-page-and-device-time-location; implements FR12 of add-interface-language-selection; FR15 of show-zone-abbreviations-and-zone-label-setting; FR3, FR4 of add-view-mode-setting-and-grid-skeleton -->

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

### Requirement: Settings strings are localized
Every string of the settings button, the settings page, its options, its notes, its Reset action, its Gnomish Factory credit, its language group, its view group and its deploy time SHALL exist in every locale file, and Russian MUST use the glossary names: «Настройки», «Тема», «Светлая», «Тёмная», «Системная», «Формат времени», «12 часов», «24 часа», «Вид», «Карточки», «Сетка», «Обозначение часового пояса», «Аббревиатура», «Смещение UTC», «Развёрнуто», «Создано с помощью Gnomish Factory». The name of the Gnomish Factory is a brand name: in the credit of every interface language, English, Russian and any language added later, it MUST read exactly `Gnomish Factory`, in Latin letters, and MUST NOT be translated or transliterated into the interface language. The language button's accessible name is "Language: <native name>" («Язык: <native name>»), the search field label "Search languages" («Поиск языка») and the empty search text "No languages found" («Языки не найдены»). Language names in the list are never translated. <!-- implements FR16 of add-settings-page-and-device-time-location; implements FR2 of add-gnomish-factory-credit; implements FR1, FR2 of keep-gnomish-factory-name-untranslated-in-credit; implements FR13, UX1 of add-interface-language-selection; FR12 of show-zone-abbreviations-and-zone-label-setting; FR1, FR2, FR3, FR5 of polish-settings-and-remove-offline-update-notice; FR1 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: Both languages
- **WHEN** the settings page is shown in `<language>`
- **THEN** the heading is `<heading>` and the groups are `<theme>`, `<hour format>`, `<view>`, `<zone label>` and `<language group>`
- **AND** the zone label toggles are `<abbreviation>` and `<utc offset>`, in this order
- **AND** the view options are `<cards>` and `<grid>`, in this order
- **AND** the credit is `<credit>`

| language | heading | theme | hour format | view | cards | grid | zone label | abbreviation | utc offset | language group | credit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| English | Settings | Theme | Hour format | View | Cards | Grid | Timezone label | Abbreviation | UTC offset | Language | Built with Gnomish Factory |
| Russian | Настройки | Тема | Формат времени | Вид | Карточки | Сетка | Обозначение часового пояса | Аббревиатура | Смещение UTC | Язык | Создано с помощью Gnomish Factory |

#### Scenario: The factory name is never translated
- **GIVEN** the app supports the interface languages English and Russian, and any language added later
- **WHEN** the credit is read in each supported interface language
- **THEN** each credit contains `Gnomish Factory`, written exactly as in English

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
