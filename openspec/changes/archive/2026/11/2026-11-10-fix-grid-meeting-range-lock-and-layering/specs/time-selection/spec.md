## MODIFIED Requirements

### Requirement: Wall-time input on every row
The time of every location card whose time zone is known, the device time location included, SHALL be a wall-time input. Activating it by tap, click, Enter or Space MUST open a field that holds the row's current time as shown in the hour format, fully selected. A row whose zone the browser does not know shows no time and MUST have no wall-time input. The input needs no network. In the Grid view, while a meeting range is set, no row MUST offer the wall-time input: activating the span opens the meeting range input of `grid-view` instead, and a wall-time input open when the range is set MUST close without a change; once the meeting range is removed every row's time MUST be a wall-time input again. The Cards view keeps it in every state. <!-- implements FR1 of add-wall-time-input-with-hint; FR5, FR9 of add-settings-page-and-device-time-location; FR1, FR2 of fix-grid-meeting-range-lock-and-layering -->

#### Scenario: Open the field
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **WHEN** the user opens the wall-time input of New York
- **THEN** the field holds `03:30`, fully selected

#### Scenario: Open the field in the 12-hour format
- **GIVEN** the interface language is English
- **AND** the hour format is 12-hour
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user opens the wall-time input of New York
- **THEN** the field holds `3:30 AM`, fully selected

#### Scenario: No input for an unknown zone
- **GIVEN** the list holds Moscow and a location whose zone the browser does not know (for example `Mars/Olympus_Mons`)
- **WHEN** the list is presented
- **THEN** Moscow has a wall-time input
- **AND** the other location has none


#### Scenario: No wall-time input in Grid while a meeting range is set
- **GIVEN** the Grid view with Almaty and Moscow and the meeting range 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user activates Moscow's span
- **THEN** the meeting range input of Moscow opens and no wall-time input opens
- **WHEN** the user clears the meeting range and activates Moscow's time
- **THEN** the wall-time input of Moscow opens
