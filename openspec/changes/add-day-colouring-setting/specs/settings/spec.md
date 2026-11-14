## ADDED Requirements

### Requirement: Colouring group
The settings page SHALL show a colouring group captioned "Colouring" («Раскраска») directly after the view group. It has three options in this order: "Plain" («Обычная»), "Time of day" («По времени суток») and "Working hours" («По рабочему времени»). The checked option is the day colouring in force; with none stored, it is "Time of day". Each option is shown by an icon, a paint bucket, a sun with a moon and a briefcase, and its name is its accessible name and its pointer hint. The group MUST be the option group of the requirement "Option group", with no new kind of control. Choosing an option MUST apply that day colouring to the main page at once, without a reload. Inputs: the stored day colouring, the user's choice. Output: the checked option and the day colouring in force. Errors: none. <!-- implements FR1, FR2, FR3, FR14, UX1 of add-day-colouring-setting -->

#### Scenario: Time of day by default
- **GIVEN** no preferences document is stored
- **WHEN** the settings page is shown
- **THEN** the colouring group follows the view group
- **AND** its options are "Plain", "Time of day" and "Working hours", in this order, with "Time of day" checked

#### Scenario: Choosing a colouring applies at once
- **GIVEN** the stored location is Almaty
- **WHEN** the user chooses the colouring "Plain" and goes back
- **THEN** the Almaty day track is plain
- **AND** no reload happened

### Requirement: Working hours row
While the day colouring is Working hours, the settings page SHALL show a working hours row captioned "Working hours" («Рабочие часы») directly under the colouring group, with a start field and an end field. In the other day colourings the row MUST be absent. The fields show the stored working hours, 10:00–18:00 when none are stored, written in the chosen hour format: `10:00` and `18:00` in the 24-hour format, `10:00 AM` and `6:00 PM` in the 12-hour format in English. A change of the hour format MUST rewrite both fields. The fields MUST accept every text the wall-time input accepts (the `time-selection` requirement "Accepted wall-time text"), and MUST insert the separator while digits are typed, as the wall-time input does. Pressing Enter in a field, or leaving the row, confirms both fields. Esc in a field whose texts differ from the stored texts, or while the hint is shown, restores the stored texts, removes the hint and keeps the settings page open; otherwise Esc is not held by the field and leaves the settings page, as the requirement "Open the settings page" says. A confirmed range is used to the minute, exactly as typed, with no rounding: `9:07` is 09:07. A confirmed field is shown again in the canonical form of the hour format. The range MUST be refused when a text is not a time ("Enter the time as HH:MM", «Введите время в формате ЧЧ:ММ») or when the start is not before the end ("The start must be before the end", «Начало должно быть раньше конца»). A refused range is not applied, its fields keep the typed texts and show the hint, and the stored working hours stay the last valid ones. Inputs: the typed texts, the hour format, the interface language. Output: the working hours in force or the hint. Errors: an unreadable time; a start at or after the end. <!-- implements FR4, FR5, FR6, FR7, UX2, UX3, UX5 of add-day-colouring-setting -->

#### Scenario: The row follows the colouring
- **GIVEN** the settings page is shown with the colouring "Time of day"
- **THEN** there is no working hours row
- **WHEN** the user chooses the colouring "Working hours"
- **THEN** the working hours row shows `10:00` and `18:00` directly under the colouring group
- **WHEN** the user chooses the colouring "Plain"
- **THEN** there is no working hours row

#### Scenario: A minute-exact start
- **GIVEN** the colouring is "Working hours"
- **WHEN** the user types `907` as the start and confirms
- **THEN** the start field shows `09:07`
- **AND** the working hours in force are 09:07–18:00

#### Scenario: The 12-hour format
- **GIVEN** the hour format is 12-hour, the interface language is English and the colouring is "Working hours"
- **THEN** the fields show `10:00 AM` and `6:00 PM`
- **WHEN** the user types `5:30 pm` as the end and confirms
- **THEN** the end field shows `5:30 PM` and the working hours in force are 10:00–17:30

#### Scenario: Refused ranges keep the last valid hours
- **GIVEN** the colouring is "Working hours" and the working hours in force are 10:00–18:00
- **WHEN** the user types `<start>` and `<end>` and confirms
- **THEN** the hint reads `<hint>`
- **AND** the working hours in force and the stored working hours are still 10:00–18:00

| start | end | hint |
|---|---|---|
| 18:00 | 10:00 | The start must be before the end |
| 12:00 | 12:00 | The start must be before the end |
| 25:00 | 18:00 | Enter the time as HH:MM |

#### Scenario: Esc restores the stored texts
- **GIVEN** the colouring is "Working hours" and the user typed `18:00` as the start, which was refused
- **WHEN** the user presses Esc in the field
- **THEN** the fields show `10:00` and `18:00` and no hint is shown

### Requirement: Time range group
The working hours row SHALL be built from one reusable time range group: a caption, a start field and an end field, each with its own name, joined by a dash. The group MUST take the caption, the field names, the texts it shows and a hint, and MUST report the pair of texts the user confirms, so a later setting can use it without a new component. It MUST share the row layout of the toggle group and the option group: caption at the start, fields at the end. The group itself MUST NOT read or interpret times. Inputs: the caption, the field names, the texts, the hint. Output: the confirmed pair of texts. Errors: none. <!-- implements FR14, UX2 of add-day-colouring-setting -->

#### Scenario: A group reports the confirmed texts
- **GIVEN** a time range group captioned "Sample" with the fields "From" and "To" showing `08:00` and `09:00`
- **WHEN** the user types `10:30` into "To" and presses Enter
- **THEN** the group reports `08:00` and `10:30`

#### Scenario: A group shows the hint it is given
- **GIVEN** a time range group captioned "Sample" with the hint "Wrong"
- **WHEN** the group is shown
- **THEN** both fields are marked invalid and the text "Wrong" is shown under them

### Requirement: Day colouring and working hours are kept on the device
The day colouring and the working hours SHALL be saved in the versioned preferences document with the other preferences and restored when the app is opened again, also offline. A stored day colouring MUST be in force when the main page is first shown. The existing rules of the requirement "Preferences are kept on the device" apply: nothing is written until the user changes a setting, a change applies at once and its write is debounced. A change in one tab MUST be applied in every other open tab without a reload, and the last write wins. The working hours MUST be kept when the day colouring changes. They are stored as two wall-clock times in the ISO 8601 form `HH:MM`, never as offsets or instants. A document written before the day colouring existed MUST be migrated: it gets the day colouring Time of day and the working hours 10:00–18:00, and every other stored choice is kept. A document whose day colouring is unknown, or whose working hours are not two valid `HH:MM` times with the start before the end, is unreadable, and the existing unreadable note with Reset applies. Inputs: the stored document. Output: the day colouring and the working hours in force. <!-- implements FR2, FR3, FR7 of add-day-colouring-setting -->

#### Scenario: Colouring and working hours survive a reload
- **GIVEN** the user chose the colouring "Working hours" and confirmed 09:07–17:30
- **WHEN** the app is opened again
- **THEN** the colouring "Working hours" is checked and the fields show `09:07` and `17:30`
- **AND** the main page shows the Working hours colouring from its first render

#### Scenario: Each colouring is kept and shared
- **GIVEN** the app is open in two tabs with the colouring "<other>"
- **WHEN** the user chooses "<colouring>" in the first tab
- **THEN** the second tab has "<colouring>" in force without a reload
- **AND** when the app is opened again, "<colouring>" is checked and in force from the first render

| colouring | other |
|---|---|
| Plain | Time of day |
| Time of day | Working hours |
| Working hours | Plain |

#### Scenario: Working hours are kept across colourings
- **GIVEN** the user confirmed 09:07–17:30 in the colouring "Working hours"
- **WHEN** the user chooses "Time of day" and then "Working hours" again
- **THEN** the fields show `09:07` and `17:30`

#### Scenario: Existing users get Time of day
- **GIVEN** the stored preferences document was written before the day colouring existed, with the theme Dark, the hour format 12-hour, the language `ru`, the view "Grid" and only the UTC offset in the zone label
- **WHEN** the app is opened
- **THEN** the day colouring is Time of day and the working hours are 10:00–18:00
- **AND** the theme Dark, the hour format 12-hour, the language «Русский», the view "Grid" and the zone label with only the UTC offset are in force
- **AND** the stored document is not rewritten until the user changes a setting

#### Scenario: A broken stored range is unreadable
- **GIVEN** the stored preferences hold the working hours 18:00–10:00
- **WHEN** the app is opened
- **THEN** the settings page shows the unreadable note with Reset
- **AND** the day colouring Time of day is in force

#### Scenario: Another tab changes the colouring
- **GIVEN** the app is open in two tabs with the colouring "Time of day"
- **WHEN** the user chooses "Plain" in the first tab
- **THEN** the second tab shows plain day colours without a reload

#### Scenario: Another tab changes the working hours
- **GIVEN** the app is open in two tabs with the colouring "Working hours"
- **WHEN** the user confirms 09:00–17:00 in the first tab
- **THEN** the second tab uses 09:00–17:00 and its fields show `09:00` and `17:00` without a reload

### Requirement: Accessible colouring group and working hours row
The colouring group SHALL be a radio group named by its visible caption "Colouring" («Раскраска»), with the checked option exposed as checked and each option named by its option name. It MUST be one Tab stop, and the arrow keys MUST move the choice in display order. The working hours fields MUST be text fields named "Start of working hours" («Начало рабочего дня») and "End of working hours" («Конец рабочего дня»), with a numeric keyboard, reached by Tab in the order start, end. A refused field MUST be marked invalid and described by the hint, and the hint MUST be in a polite live region. Every option and field MUST be at least 44 px high (options at least 44 × 44 px) and MUST show a visible focus outline when focused with the keyboard. axe-core MUST report no violations on the settings page with the working hours row in the light and the dark theme, and with the hint shown. <!-- implements NFR-A1, NFR-A2, NFR-A4 of add-day-colouring-setting -->

#### Scenario: Names and checked state of the colouring group
- **GIVEN** the interface language is Russian
- **WHEN** the settings page is shown with no stored preferences
- **THEN** a radio group named «Раскраска» has the radios «Обычная», «По времени суток» (checked) and «По рабочему времени»

#### Scenario: Arrow keys change the colouring
- **GIVEN** the settings page is shown with "Time of day" checked
- **WHEN** the user tabs into the colouring group and presses Arrow Right
- **THEN** "Working hours" is checked and the working hours row is shown

#### Scenario: Named fields and a described hint
- **GIVEN** the colouring is "Working hours"
- **WHEN** the user types `18:00` into the field "Start of working hours" and presses Enter
- **THEN** the fields "Start of working hours" and "End of working hours" are marked invalid
- **AND** both are described by "The start must be before the end"

#### Scenario: Size, focus and no violations
- **GIVEN** the colouring is "Working hours" and the `<theme>` theme is active
- **WHEN** the settings page is shown
- **THEN** every colouring option is at least 44 × 44 px and both working hours fields are at least 44 px high
- **AND** a keyboard-focused option and a keyboard-focused field show a focus outline
- **AND** axe-core reports no violations
- **WHEN** the user confirms `18:00` – `10:00` and the hint is shown
- **THEN** axe-core again reports no violations

| theme |
|---|
| light |
| dark |

### Requirement: Colouring settings layout
The colouring group and the working hours row SHALL each take one row at most 56 px high at 375, 1024 and 2560 px wide, in English and Russian, in the 24-hour and the 12-hour format, without the hint. Showing or hiding the working hours row MUST NOT move the groups above it. The settings page MUST NOT scroll horizontally at 320 and 2560 px with the working hours row shown. <!-- implements NFR-R1, UX2 of add-day-colouring-setting -->

#### Scenario: Compact colouring rows
- **GIVEN** the colouring is "Working hours" and the hour format is `<hour format>`
- **WHEN** the settings page is shown `<width>` px wide in `<language>`
- **THEN** the colouring group and the working hours row are each at most 56 px high, with their caption and controls on one row

| width | language | hour format |
|---|---|---|
| 375 | Russian | 12-hour |
| 375 | English | 24-hour |
| 1024 | Russian | 24-hour |
| 2560 | English | 12-hour |

#### Scenario: The row appears without moving the groups above
- **GIVEN** the settings page is shown 375 px wide with "Time of day" checked
- **WHEN** the user chooses "Working hours"
- **THEN** the theme, hour format, view and colouring groups keep their position

#### Scenario: No horizontal scrolling with the row
- **GIVEN** the colouring is "Working hours", the hour format is 12-hour and the language is Russian
- **WHEN** the settings page is `<width>` px wide
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 2560 |

### Requirement: Colouring strings are localized
Every string of the colouring group, its options, the working hours row, its fields and its hints SHALL exist in every locale file. Russian MUST use the glossary names «Раскраска», «Обычная», «По времени суток», «По рабочему времени», «Рабочие часы», «Начало рабочего дня», «Конец рабочего дня». <!-- implements FR15 of add-day-colouring-setting -->

#### Scenario: Both languages of the colouring settings
- **GIVEN** the colouring is "Working hours"
- **WHEN** the settings page is shown in `<language>`
- **THEN** the colouring group is `<colouring>` with the options `<plain>`, `<time of day>` and `<working>`
- **AND** the working hours row is `<row>` with the fields `<start>` and `<end>`

| language | colouring | plain | time of day | working | row | start | end |
|---|---|---|---|---|---|---|---|
| English | Colouring | Plain | Time of day | Working hours | Working hours | Start of working hours | End of working hours |
| Russian | Раскраска | Обычная | По времени суток | По рабочему времени | Рабочие часы | Начало рабочего дня | Конец рабочего дня |

## MODIFIED Requirements

### Requirement: Open the settings page
The header's settings button SHALL open the settings page. The settings page MUST show the heading "Settings" («Настройки») as its only page heading, a back button "Back" («Назад»), the theme group, the hour format group, the zone label group and the language group, and MUST NOT show the date bar. The notices region MUST keep working on the settings page. The back button and Esc MUST return to the main page with its locations and reference moment unchanged; while the language list is expanded, Esc first collapses it; while a working hours field holds texts that differ from the stored working hours, or the working hours hint is shown, Esc first restores the stored texts, removes the hint and keeps the settings page open. Opening the settings page MUST move the focus to its heading, and returning MUST move the focus to the settings button. Inputs: the settings button, the back button, Esc. Output: the shown page. Errors: none. <!-- implements FR1, FR3, NFR-A2 of add-settings-page-and-device-time-location; implements FR1, NFR-A2 of add-interface-language-selection; FR12 of show-zone-abbreviations-and-zone-label-setting; FR4, FR6 of add-day-colouring-setting -->

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

#### Scenario: Esc in a working hours field restores first, then leaves
- **GIVEN** the colouring is "Working hours" and the user typed `18:00` as the start, which was refused
- **WHEN** the user presses Esc in the field
- **THEN** the fields show `10:00` and `18:00`, no hint is shown and the settings page is still shown
- **WHEN** the user presses Esc again in the field
- **THEN** the main page is shown
- **AND** the focus is on the settings button

### Requirement: Settings page layout
The settings page SHALL use the app's design tokens: the page background, the groups on surface cards with the theme border, the Manrope font and the accent colour for the checked option and the deploy time. Its text MUST be at least 4.5:1 against its background in both themes. The theme group, the hour format group and the view group MUST each take one row at 320, 375, 1024 and 2560 px in English and Russian. The page MUST NOT scroll horizontally at 320 px and 2560 px. The approved screenshots of the settings page at 375 px and 1024 px in both themes MUST match. They show the theme group as three icons in the order System, Light, Dark with System checked, the hour format group as `12` and `24` with 24 checked, the view group as "Cards" and "Grid" with Cards checked, the colouring group as three icons in the order Plain, Time of day, Working hours with Time of day checked and no working hours row, the zone label group with both toggles on, "Abbreviation" first, and its Russia example, and the language group collapsed, with the 🇺🇸 flag for English. The deploy time keeps its place in them but its text is hidden, because it changes with every build. They are re-approved once for this change. <!-- implements NFR-A3, NFR-R1, NFR-R3, UX2 of add-settings-page-and-device-time-location; implements NFR-R2 of add-interface-language-selection; NFR-R3 of show-zone-abbreviations-and-zone-label-setting; NFR-R2 of polish-settings-and-remove-offline-update-notice; NFR-R1, NFR-R2 of compact-settings-controls; NFR-R1, NFR-R2 of add-view-mode-setting-and-grid-skeleton; NFR-R2 of add-day-colouring-setting -->

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
