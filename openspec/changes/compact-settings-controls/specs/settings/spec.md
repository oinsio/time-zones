## ADDED Requirements

### Requirement: Option group
The theme group and the hour format group SHALL be built from one reusable option group: a caption and any number of mutually exclusive options, of which exactly one is checked. Each option has a value, a name, and either an icon or a pictogram. The icon or the pictogram is what the option shows. With neither, the option shows its name as text. The option's name is always its accessible name and its pointer hint. The group MUST take the options in their display order and the checked value, and MUST report each choice the user makes, so a later setting can use it with other options without a new component. The option group MUST show its caption and its options in one row, with the same row layout as the toggle group: caption at the start, options at the end. The options of one group MUST sit together as one joined control. Choosing an option MUST NOT move or resize any option. Inputs: the caption, the options, the checked value, the user's choice. Output: the reported value. Errors: none. <!-- implements FR5, FR6, UX1, UX2, UX3 of compact-settings-controls -->

#### Scenario: A group with three options
- **GIVEN** an option group with the caption "Sample" and the options A, B and C, of which B is checked
- **WHEN** the user chooses A
- **THEN** the group reports A
- **AND** the options are A, B and C, in this order

#### Scenario: An option without an icon or a pictogram shows its name
- **GIVEN** an option group with the caption "Sample" and an option named "Plain" that has neither an icon nor a pictogram
- **WHEN** the group is shown
- **THEN** the option shows the text "Plain" and is named "Plain"

#### Scenario: Caption and options in one row
- **WHEN** the settings page is shown `<width>` px wide in `<language>`
- **THEN** the caption and the options of the theme group share one row
- **AND** the caption and the options of the hour format group share one row

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

## MODIFIED Requirements

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
The settings page SHALL use the app's design tokens: the page background, the groups on surface cards with the theme border, the Manrope font and the accent colour for the checked option and the deploy time. Its text MUST be at least 4.5:1 against its background in both themes. The theme group and the hour format group MUST each take one row at 320, 375, 1024 and 2560 px in English and Russian. The page MUST NOT scroll horizontally at 320 px and 2560 px. The approved screenshots of the settings page at 375 px and 1024 px in both themes MUST match. They show the theme group as three icons in the order System, Light, Dark with System checked, the hour format group as `12` and `24` with 24 checked, the zone label group with both toggles on, "Abbreviation" first, and its Russia example, and the language group collapsed, with the 🇺🇸 flag for English. The deploy time keeps its place in them but its text is hidden, because it changes with every build. They are re-approved once for this change. <!-- implements NFR-A3, NFR-R1, NFR-R3, UX2 of add-settings-page-and-device-time-location; implements NFR-R2 of add-interface-language-selection; NFR-R3 of show-zone-abbreviations-and-zone-label-setting; NFR-R2 of polish-settings-and-remove-offline-update-notice; NFR-R1, NFR-R2 of compact-settings-controls -->

#### Scenario: Narrow and wide screens
- **WHEN** the settings page is `<width>` px wide
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 2560 |

#### Scenario: Compact groups
- **WHEN** the settings page is shown 375 px wide in `<language>`
- **THEN** the theme group and the hour format group are each at most 56 px high

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

### Requirement: Toggle group
The zone label group SHALL be built from one reusable toggle group: a caption and any number of options, each an independent toggle that is on or off, shown in one row after the caption. The group MUST take the options and the set of options that are on, and report each toggle the user makes, so a later setting can use it with other options without a new component. The toggle group and the option group MUST share one row layout. The toggle group's options stay separate toggle buttons, so they read as independent switches. <!-- implements FR16 of show-zone-abbreviations-and-zone-label-setting; FR6, UX3 of compact-settings-controls -->

#### Scenario: A group with three options
- **GIVEN** a toggle group with the caption "Sample" and the options A, B and C, of which B is on
- **WHEN** the user turns A on
- **THEN** the group reports that A is now on
- **AND** B stays on and C stays off
