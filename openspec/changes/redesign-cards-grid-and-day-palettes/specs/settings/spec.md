## ADDED Requirements

### Requirement: Colours group
While the day colouring is Time of day, the settings page SHALL show a group captioned "Colours" («Цвета») directly under the colouring group, with two options in this order: "Vivid" («Яркие») and "Muted" («Приглушённые»). In the Plain and the Working hours colourings the group MUST be absent; in Working hours the working hours row stands in its place, as built. It MUST appear and disappear the way the working hours row does: at once when the colouring changes, without moving any group above it. The checked option is the day palette in force; with none stored, it is "Vivid". Each option MUST show a palette swatch instead of an icon: a square of 24 × 24 px with a radius of 5 px, split into four equal vertical stripes in the night, morning, day and evening colours of that option's palette in the active theme, left to right, with a 2 px outline in the surface colour. The option's name is its accessible name and its pointer hint, as for the icon options of the other groups, and the swatch is hidden from assistive technology. The checked option has the accent fill, as built. The group MUST be the option group of "Option group", a plain row like its neighbours, with no frame or highlight of its own. Choosing an option MUST apply that day palette to the main page at once, without a reload. Inputs: the day colouring, the stored day palette, the active theme, the user's choice. Output: the checked option and the day palette in force. Errors: none. <!-- implements FR5, UX2 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Shown only in the Time of day colouring
- **GIVEN** the interface language is Russian
- **WHEN** the colouring is `<colouring>`
- **THEN** the group «Цвета» is `<shown>`
- **AND** the working hours row is `<hours>`

| colouring | shown | hours |
|---|---|---|
| По времени суток | shown directly under «Раскраска» | absent |
| Обычная | absent | absent |
| По рабочему времени | absent | shown directly under «Раскраска» |

#### Scenario: Showing the group moves nothing above it
- **GIVEN** the settings page is shown 375 px wide with the colouring Plain
- **WHEN** the user chooses the colouring Time of day
- **THEN** every group above the colouring group and the colouring group itself keep their positions, within 1 px

#### Scenario: Vivid is checked by default
- **GIVEN** no preferences document is stored
- **WHEN** the settings page is opened
- **THEN** the option "Vivid" is checked

#### Scenario: Swatches show the palette of the active theme
- **GIVEN** the `<theme>` theme
- **WHEN** the settings page is shown
- **THEN** the swatch of "Vivid" shows `<vivid>` as its first stripe and the swatch of "Muted" shows `<muted>`
- **AND** each swatch is 24 × 24 px with four stripes of equal width

| theme | vivid | muted |
|---|---|---|
| light | `#a4afd4` | `#a3afd3` |
| dark | `#4c5efa` | `#56679a` |

#### Scenario: Choosing Muted recolours the main page
- **GIVEN** the list contains Almaty and the colouring is Time of day
- **WHEN** the user chooses "Muted" in the Colours group and goes back
- **THEN** the Almaty track uses the Muted colours without a reload

### Requirement: Accessible Colours group
The Colours group SHALL be a radio group named by its visible caption "Colours" («Цвета»), with the checked option exposed as checked and each option named by its option name ("Vivid", "Muted"; «Яркие», «Приглушённые»). It MUST be one Tab stop, and the arrow keys MUST move the choice in display order. Every option MUST be at least 44 × 44 px and MUST show a visible focus outline when focused with the keyboard. axe-core MUST report no violations on the settings page with the Colours group in the light and the dark theme, with either option checked. <!-- implements FR5, NFR-A1, NFR-A3 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Keyboard choice
- **GIVEN** the colouring is Time of day and "Vivid" is checked
- **WHEN** the user tabs into the Colours group and presses Arrow Right
- **THEN** "Muted" is checked and focused

#### Scenario: Names and sizes
- **GIVEN** the interface language is Russian
- **WHEN** the settings page is shown
- **THEN** the radio group «Цвета» has the options «Яркие» and «Приглушённые», each at least 44 × 44 px
- **AND** no swatch is exposed to assistive technology

#### Scenario: No accessibility violations
- **WHEN** the settings page is checked with axe-core in the `<theme>` theme with "`<palette>`" checked
- **THEN** no violations are reported

| theme | palette |
|---|---|
| light | Vivid |
| light | Muted |
| dark | Vivid |
| dark | Muted |

### Requirement: Day palette is kept on the device
The day palette SHALL be saved in the versioned preferences document with the other preferences and restored when the app is opened again, also offline. A stored day palette MUST be in force when the main page is first shown. The existing rules of the requirement "Preferences are kept on the device" apply: nothing is written until the user changes a setting, a change applies at once and its write is debounced. A change in one tab MUST be applied in every other open tab without a reload, and the last write wins. The day palette MUST be kept when the day colouring changes. A document written before the day palette existed MUST be migrated: it gets the day palette Vivid, and every other stored choice is kept. A document whose day palette is unknown is unreadable, and the existing unreadable note with Reset applies. Inputs: the stored document. Output: the day palette in force. <!-- implements FR3 of redesign-cards-grid-and-day-palettes -->

#### Scenario: The palette survives a reload
- **GIVEN** the user chose the Muted day palette
- **WHEN** the app is opened again
- **THEN** the Muted day palette is in force on the first render

#### Scenario: Existing users get Vivid
- **GIVEN** a stored preferences document of the previous version with the theme Dark and the colouring Working hours
- **WHEN** the app is opened
- **THEN** the day palette is Vivid, the theme Dark and the colouring Working hours

#### Scenario: Unknown palette is unreadable
- **GIVEN** a stored preferences document of the current version whose day palette is `PASTEL`
- **WHEN** the app is opened
- **THEN** the unreadable preferences note with Reset is shown

#### Scenario: Another tab changes the palette
- **GIVEN** the app is open in two tabs
- **WHEN** the user chooses the Muted day palette in the first tab
- **THEN** the second tab uses the Muted day palette without a reload

#### Scenario: The palette survives a colouring change
- **GIVEN** the Muted day palette
- **WHEN** the user chooses Plain and then Time of day again
- **THEN** the Muted day palette is in force

## MODIFIED Requirements

### Requirement: Option group
The theme group, the hour format group, the view group, the colouring group and the Colours group SHALL be built from one reusable option group: a caption and any number of mutually exclusive options, of which exactly one is checked. Each option has a value, a name, and either an icon, a palette swatch or a pictogram, or none of them. The icon, the swatch or the pictogram is what the option shows. With none, the option shows its name as text; the view options have none. The option's name is always its accessible name and its pointer hint. The group MUST take the options in their display order and the checked value, and MUST report each choice the user makes, so a later setting can use it with other options without a new component. The option group MUST show its caption and its options in one row, with the same row layout as the toggle group: caption at the start, options at the end. The options of one group MUST sit together as one joined control with the control border. Choosing an option MUST NOT move or resize any option. Inputs: the caption, the options, the checked value, the user's choice. Output: the reported value. Errors: none. <!-- implements FR5, FR6, UX1, UX2, UX3 of compact-settings-controls; FR1, UX1 of add-view-mode-setting-and-grid-skeleton; FR1, FR5 of redesign-cards-grid-and-day-palettes -->

#### Scenario: A group with three options
- **GIVEN** an option group with the caption "Sample" and the options A, B and C, of which B is checked
- **WHEN** the user chooses A
- **THEN** the group reports A
- **AND** the options are A, B and C, in this order

#### Scenario: An option without an icon or a pictogram shows its name
- **GIVEN** an option group with the caption "Sample" and an option named "Plain" that has neither an icon, a palette swatch nor a pictogram
- **WHEN** the group is shown
- **THEN** the option shows the text "Plain"

#### Scenario: An option with a swatch
- **GIVEN** an option group with the caption "Sample" and an option named "Vivid" that has a palette swatch
- **WHEN** the group is shown
- **THEN** the option shows the swatch and no visible text, and is named "Vivid" with the pointer hint "Vivid"

#### Scenario: Caption and options in one row
- **WHEN** the settings page is shown `<width>` px wide in `<language>`
- **THEN** the caption and the options of the theme group, the hour format group, the view group, the colouring group and the Colours group each share one row

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

### Requirement: Settings page layout
The settings page SHALL use the app's design tokens: the page background, the groups on surface cards with the control border, the Manrope font and the accent colour for the checked option and the deploy time. Its text MUST be at least 4.5:1 against its background in both themes, and the control border at least 3:1 against the surface. The theme group, the hour format group, the view group, the colouring group and the Colours group MUST each take one row at 320, 375, 1024 and 2560 px in English and Russian. The page MUST NOT scroll horizontally at 320, 390, 768, 820, 1024, 1440 and 2560 px. The approved screenshots of the settings page at 375 px and 1024 px in both themes MUST match. They show the theme group as three icons in the order System, Light, Dark with System checked, the hour format group as `12` and `24` with 24 checked, the view group as "Cards" and "Grid" with Cards checked, the colouring group as three icons in the order Plain, Time of day, Working hours with Time of day checked, the Colours group with the swatches of Vivid and Muted and Vivid checked, no working hours row, the zone label group with its toggles on and its example, and the language group collapsed. A further approved screenshot at 375 px in the light theme shows the Working hours colouring with its working hours row and no Colours group. The deploy time keeps its place in them but its text is hidden, because it changes with every build. They are re-taken once for the redesign. <!-- implements NFR-A3, NFR-R1, NFR-R3, UX2 of add-settings-page-and-device-time-location; implements NFR-R2 of add-interface-language-selection; NFR-R3 of show-zone-abbreviations-and-zone-label-setting; NFR-R2 of polish-settings-and-remove-offline-update-notice; NFR-R1, NFR-R2 of compact-settings-controls; NFR-R1, NFR-R2 of add-view-mode-setting-and-grid-skeleton; NFR-R2 of add-day-colouring-setting; FR1, FR5, NFR-R1, NFR-R2 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Narrow and wide screens
- **WHEN** the settings page is `<width>` px wide
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 390 |
| 768 |
| 820 |
| 1024 |
| 1440 |
| 2560 |

#### Scenario: Compact groups
- **WHEN** the settings page is shown 375 px wide in `<language>`
- **THEN** the theme group, the hour format group, the view group, the colouring group and the Colours group are each at most 56 px high

| language |
|---|
| English |
| Russian |

#### Scenario: Groups use the control border
- **WHEN** the settings page is shown in the `<theme>` theme
- **THEN** the border of every option group's joined control is `<border>`

| theme | border |
|---|---|
| light | `#8a8a93` |
| dark | `#6b7a99` |

#### Scenario: Approved screenshots
- **WHEN** the settings page is rendered at `<width>` px in the `<theme>` theme with the colouring `<colouring>`
- **THEN** it matches the approved screenshot

| width | theme | colouring |
|---|---|---|
| 375 | light | Time of day |
| 375 | dark | Time of day |
| 1024 | light | Time of day |
| 1024 | dark | Time of day |
| 375 | light | Working hours |

### Requirement: Colouring settings layout
The colouring group, the Colours group and the working hours row SHALL each take one row at most 56 px high at 375, 1024 and 2560 px wide, in English and Russian, in the 24-hour and the 12-hour format, without the hint. Showing or hiding the Colours group or the working hours row MUST NOT move the groups above it. The settings page MUST NOT scroll horizontally at 320 and 2560 px with the Colours group or the working hours row shown. <!-- implements NFR-R1, UX2 of add-day-colouring-setting; NFR-R1, UX2 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Compact colouring rows
- **GIVEN** the colouring is `<colouring>` and the hour format is `<hour format>`
- **WHEN** the settings page is shown `<width>` px wide in `<language>`
- **THEN** the colouring group and the row under it (the Colours group or the working hours row) are each at most 56 px high, with their caption and controls on one row

| width | language | hour format | colouring |
|---|---|---|---|
| 375 | Russian | 12-hour | Working hours |
| 375 | English | 24-hour | Time of day |
| 375 | Russian | 24-hour | Time of day |
| 1024 | Russian | 24-hour | Working hours |
| 2560 | English | 12-hour | Time of day |

#### Scenario: The row appears without moving the groups above
- **GIVEN** the settings page is shown 375 px wide with "`<from>`" checked
- **WHEN** the user chooses "`<to>`"
- **THEN** the theme, hour format, view and colouring groups keep their position

| from | to |
|---|---|
| Time of day | Working hours |
| Plain | Time of day |
| Time of day | Plain |

#### Scenario: No horizontal scrolling with the row
- **GIVEN** the colouring is `<colouring>`, the hour format is 12-hour and the language is Russian
- **WHEN** the settings page is `<width>` px wide
- **THEN** the page does not scroll horizontally

| width | colouring |
|---|---|
| 320 | Working hours |
| 2560 | Working hours |
| 320 | Time of day |
| 2560 | Time of day |

### Requirement: Colouring strings are localized
Every string of the colouring group, its options, the Colours group, its options, the working hours row, its fields and its hints SHALL exist in every locale file. Russian MUST use the glossary names «Раскраска», «Обычная», «По времени суток», «По рабочему времени», «Цвета», «Яркие», «Приглушённые», «Рабочие часы», «Начало рабочего дня», «Конец рабочего дня»; English "Colours", "Vivid" and "Muted" for the day palette. <!-- implements FR15 of add-day-colouring-setting; FR5 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Both languages of the colouring settings
- **GIVEN** the colouring is "Working hours"
- **WHEN** the settings page is shown in `<language>`
- **THEN** the colouring group is `<colouring>` with the options `<plain>`, `<time of day>` and `<working>`
- **AND** the working hours row is `<row>` with the fields `<start>` and `<end>`

| language | colouring | plain | time of day | working | row | start | end |
|---|---|---|---|---|---|---|---|
| English | Colouring | Plain | Time of day | Working hours | Working hours | Start of working hours | End of working hours |
| Russian | Раскраска | Обычная | По времени суток | По рабочему времени | Рабочие часы | Начало рабочего дня | Конец рабочего дня |

#### Scenario: Both languages of the Colours group
- **GIVEN** the colouring is "Time of day"
- **WHEN** the settings page is shown in `<language>`
- **THEN** the Colours group is `<caption>` with the options `<vivid>` and `<muted>`

| language | caption | vivid | muted |
|---|---|---|---|
| English | Colours | Vivid | Muted |
| Russian | Цвета | Яркие | Приглушённые |

#### Scenario: Every locale has the keys
- **WHEN** the locale files are read
- **THEN** every locale file has the keys of the Colours group and its two options
