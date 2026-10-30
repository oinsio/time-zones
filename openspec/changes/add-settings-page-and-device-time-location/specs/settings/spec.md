# Spec Delta

## Purpose

Lets the user open a settings page and choose how the app looks and writes time — the theme preference and the hour format — and keeps these preferences on the device, shared between open tabs and available offline.

## ADDED Requirements

### Requirement: Open the settings page
The header's settings button SHALL open the settings page. The settings page MUST show the heading "Settings" («Настройки») as its only page heading, a back button "Back" («Назад»), the theme group and the hour format group, and MUST NOT show the date bar. The notices region MUST keep working on the settings page. The back button and Esc MUST return to the main page with its locations and reference moment unchanged. Opening the settings page MUST move the focus to its heading, and returning MUST move the focus to the settings button. Inputs: the settings button, the back button, Esc. Output: the shown page. Errors: none. <!-- implements FR1, FR3, NFR-A2 of add-settings-page-and-device-time-location -->

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

### Requirement: Theme preference
The settings page SHALL offer the theme preference as three options, each with an icon and a label: Light with a sun icon («Светлая»), Dark with a moon icon («Тёмная») and System with a monitor icon («Системная»). Exactly one option MUST be checked. Without a stored choice, System MUST be checked. Choosing Light or Dark MUST apply that theme's design token values to the whole app at once, whatever the system color-scheme preference is. Choosing System MUST make the theme follow the system color-scheme preference, also when the system preference changes while the app is open. Inputs: the chosen option, the system color-scheme preference. Output: the active theme. Errors: none. <!-- implements FR4, UX5 of add-settings-page-and-device-time-location -->

#### Scenario: Default is System
- **GIVEN** no preferences are stored
- **WHEN** the user opens the settings
- **THEN** the theme option System is checked

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

### Requirement: Hour format
The settings page SHALL offer the hour format as two options: 12-hour («12 часов») and 24-hour («24 часа»). Exactly one option MUST be checked. Without a stored choice, 24-hour MUST be checked. A choice MUST apply at once, without a reload and without a loading state, to every time text of the app: the local time of every location row, the day track hour labels, the wall-time input's initial text, the wall-time hint and the date bar's gap note. In 24-hour format a time is written with two-digit hours (`03:30`). In 12-hour format it is written by the interface language's conventions for a 12-hour clock, with the hour without a leading zero and a day period marker (English `3:30 AM`). Times MUST still be derived from each location's IANA identifier at the effective instant. Inputs: the chosen option, the interface language. Output: the time texts. Errors: none. <!-- implements FR5, UX5 of add-settings-page-and-device-time-location -->

#### Scenario: Default is 24-hour
- **GIVEN** no preferences are stored
- **WHEN** the user opens the settings
- **THEN** the hour format option 24-hour is checked

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
The theme preference and the hour format SHALL be saved on the device as one versioned document and restored when the app is opened again, also offline. A stored Light or Dark choice MUST be in force when the main page is first shown. Nothing MUST be written for the preferences until the user changes a setting. The preferences MUST NOT be part of the locations document, and a change of the preferences MUST NOT write the locations document. Inputs: the stored document. Output: the preferences in force. <!-- implements FR4, FR7 of add-settings-page-and-device-time-location -->

#### Scenario: Choices survive a reload
- **GIVEN** the user chose the theme Dark and the hour format 12-hour
- **WHEN** the app is opened again
- **THEN** the theme Dark and the hour format 12-hour are checked
- **AND** the main page uses the dark token values from its first render

#### Scenario: Opening writes nothing
- **WHEN** the user opens the app and the settings page and changes nothing
- **THEN** no preferences document is stored

#### Scenario: Offline reopen
- **GIVEN** the user chose the hour format 12-hour on an earlier visit
- **WHEN** the app is opened without a network connection
- **THEN** the location rows show 12-hour times

### Requirement: Unreadable stored preferences
When the stored preferences document is not valid JSON, does not match the expected document, holds an unknown option, or was written by a newer version of the app, the app SHALL start with the default preferences (System, 24-hour) and MUST NOT show a blank page or block the main page. The settings page MUST then show a note that the settings could not be read, with a Reset action. Reset MUST clear the stored preferences document and remove the note. The app MUST NOT overwrite the unreadable document by itself; a change of a setting replaces it. <!-- implements FR7 of add-settings-page-and-device-time-location -->

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

### Requirement: Preferences without storage
When the preferences cannot be saved (storage unavailable or a failed write), a chosen setting SHALL still apply for the rest of the session, and the settings page MUST show a note that changes will not be saved. Errors: none are thrown to the user. <!-- implements FR7 of add-settings-page-and-device-time-location -->

#### Scenario: Storage unavailable
- **GIVEN** storage is unavailable
- **WHEN** the user chooses the hour format 12-hour
- **THEN** the location rows show 12-hour times
- **AND** the settings page says changes will not be saved

### Requirement: Preferences are shared between open tabs
A change of the preferences in one tab SHALL be applied in every other open tab of the app without a reload. Conflict policy: the last write wins. <!-- implements FR7 of add-settings-page-and-device-time-location -->

#### Scenario: Another tab changes the hour format
- **GIVEN** the app is open in two tabs
- **WHEN** the user chooses the hour format 12-hour in the first tab
- **THEN** the second tab shows 12-hour times without a reload

### Requirement: Settings strings are localized
Every string of the settings button, the settings page, its options, its notes and its Reset action SHALL exist in English and Russian, and Russian MUST use the glossary names: «Настройки», «Тема», «Светлая», «Тёмная», «Системная», «Формат времени», «12 часов», «24 часа». <!-- implements FR16 of add-settings-page-and-device-time-location -->

#### Scenario: Both languages
- **WHEN** the settings page is shown in `<language>`
- **THEN** the heading is `<heading>` and the groups are `<theme>` and `<hour format>`

| language | heading | theme | hour format |
|---|---|---|---|
| English | Settings | Theme | Hour format |
| Russian | Настройки | Тема | Формат времени |

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
The theme options and the hour format options SHALL each be a radio group, named "Theme" («Тема») and "Hour format" («Формат времени»), with the checked option exposed as checked. Each group MUST be one Tab stop, and the arrow keys MUST move the choice within it. The checked option MUST be marked by a check icon as well as by colour. Every option and the back button MUST be at least 44 × 44 px. axe-core MUST report no violations on the settings page in the light and the dark theme, with and without the unreadable-settings note. <!-- implements NFR-A1, NFR-A2, NFR-A3, UX2 of add-settings-page-and-device-time-location -->

#### Scenario: Arrow keys change the theme
- **GIVEN** the settings page is shown and the theme System is checked
- **WHEN** the user tabs into the theme group and presses Arrow Up
- **THEN** the theme Dark is checked and the page uses the dark token values

#### Scenario: Names and checked state
- **GIVEN** the interface language is Russian
- **WHEN** the settings page is shown
- **THEN** a radio group named «Тема» has the checked option «Системная»
- **AND** a radio group named «Формат времени» has the checked option «24 часа»

#### Scenario: No violations
- **WHEN** axe-core checks the settings page in the `<theme>` theme
- **THEN** it reports no violations

| theme |
|---|
| light |
| dark |

### Requirement: Settings page layout
The settings page SHALL use the app's design tokens: the page background, the groups on surface cards with the theme border, the Manrope font and the accent colour for the checked option. Its text MUST be at least 4.5:1 against its background in both themes. The page MUST NOT scroll horizontally at 320 px and 2560 px. The approved screenshots of the settings page at 375 px and 1024 px in both themes MUST match. <!-- implements NFR-A3, NFR-R1, NFR-R3, UX2 of add-settings-page-and-device-time-location -->

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

### Requirement: Preferences are fast
Presenting the location rows again with unchanged preferences SHALL build no formatter. After the hour format changes, presenting the rows MUST build at most one formatter per time zone and label kind in use. These bounds are checked by counting work, never by measuring time (ADR-0008). <!-- implements NFR-P1 of add-settings-page-and-device-time-location -->

#### Scenario: Presenting again builds no formatter
- **GIVEN** 50 locations have been presented in the hour format 24-hour
- **WHEN** the same rows are presented again for the next minute tick
- **THEN** no formatter is built

#### Scenario: Switching the hour format builds one formatter per zone and kind
- **GIVEN** 50 locations in 50 different time zones have been presented in the hour format 24-hour
- **WHEN** the hour format becomes 12-hour and the rows are presented
- **THEN** at most one formatter per time zone and label kind in use is built
