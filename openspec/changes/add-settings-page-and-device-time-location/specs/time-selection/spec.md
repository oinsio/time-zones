# Spec Delta

## MODIFIED Requirements

### Requirement: Local hour labels
On screens 768 px and wider, every track SHALL show five local hour labels. They are placed at the start of the reference day, at 6, 12 and 18 hours of absolute time after it, and at its end, each at its position on the track. Each label MUST be the location's local time at that instant, written in the hour format (see the `settings` capability): in 24-hour format as two-digit hours (`04`), followed by the minutes when they are not zero (`00:30`, `05:45`); in 12-hour format as the hour with a day period marker by the interface language's conventions (`4 AM`), with the minutes when they are not zero (`12:30 AM`). The labels MUST be derived from the location's IANA identifier for those instants, so DST and :30 / :45 offsets are respected. Below 768 px no labels are shown. The labels are decorative: they MUST NOT be read by assistive technology, because the slider's value text names the time. Inputs: the location's IANA identifier, the reference day and the hour format. Output: five label texts with their positions. Errors: none for known zones. <!-- implements FR7 of add-time-sliders-to-location-cards; FR5 of add-settings-page-and-device-time-location -->

#### Scenario: Hour labels of four zones
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty, Moscow, Kolkata and New York
- **WHEN** the list is presented
- **THEN** the hour labels of `<city>` are `<labels>`

| city | labels |
|---|---|
| Almaty | `00 06 12 18 00` |
| Moscow | `22 04 10 16 22` |
| Kolkata | `00:30 06:30 12:30 18:30 00:30` |
| New York | `14 20 03 09 15` |

#### Scenario: Hour labels in the 12-hour format
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is English
- **AND** the hour format is 12-hour
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow and Kolkata
- **WHEN** the list is presented
- **THEN** the hour labels of Moscow are `10 PM 4 AM 10 AM 4 PM 10 PM`
- **AND** the hour labels of Kolkata are `12:30 AM 6:30 AM 12:30 PM 6:30 PM 12:30 AM`

#### Scenario: Labels only on wide screens
- **GIVEN** the list contains Almaty and Moscow
- **WHEN** the list is shown 375 px wide
- **THEN** no hour labels are visible
- **WHEN** the list is shown 1024 px wide
- **THEN** every track shows its five hour labels under it

### Requirement: Accepted wall-time text
A wall-time input SHALL accept a 24-hour wall-clock time written as `H`, `HH`, `HMM`, `HHMM`, `H:MM`, `HH:MM`, `H.MM` or `HH.MM`. One or two digits name whole hours with minutes `00`. Hours MUST be 0–23 and minutes 0–59, written with two digits. Spaces before and after the text MUST be ignored. It MUST also accept the 12-hour texts of the `settings` capability ("12-hour wall-time text"), in both hour formats. Inputs: the typed text. Output: a wall-clock time of hours and minutes. <!-- implements FR2 of add-wall-time-input-with-hint; FR6 of add-settings-page-and-device-time-location -->

#### Scenario: Accepted texts
- **WHEN** the user confirms the text `<text>`
- **THEN** the typed wall-clock time is `<time>`

| text | time |
|---|---|
| `9` | `09:00` |
| `09` | `09:00` |
| `930` | `09:30` |
| `0930` | `09:30` |
| `9:30` | `09:30` |
| `09:30` | `09:30` |
| `09.30` | `09:30` |
| ` 9:30 ` | `09:30` |
| `0:00` | `00:00` |
| `23:59` | `23:59` |
| `9:30 PM` | `21:30` |

### Requirement: Wall-time input on every row
The time of every location card whose time zone is known, the device time location included, SHALL be a wall-time input. Activating it by tap, click, Enter or Space MUST open a field that holds the row's current time as shown in the hour format, fully selected. A row whose zone the browser does not know shows no time and MUST have no wall-time input. The input needs no network. <!-- implements FR1 of add-wall-time-input-with-hint; FR5, FR9 of add-settings-page-and-device-time-location -->

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

### Requirement: A wall-time input pins the reference moment
Confirming an accepted time SHALL pin the reference moment to that wall-clock time in the row's zone (the device time zone for the device time location), on the local date the row showed when the field opened. A time in a DST gap MUST move forward by the gap; a time in a DST overlap MUST take the earlier instant. The outcome MUST be reported as `UNIQUE`, `GAP` or `AMBIGUOUS`. <!-- implements FR3 of add-wall-time-input-with-hint; FR9 of add-settings-page-and-device-time-location -->

#### Scenario: Type a time in another city
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty, Moscow, Kolkata and New York
- **WHEN** the user types `10:40` in New York
- **THEN** the moment is pinned to `2026-03-08T14:40:00Z` with the status `UNIQUE`
- **AND** Almaty shows `19:40`, Moscow `17:40` and Kolkata `20:10`

#### Scenario: Wall-clock outcomes of a typed time
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `<now>`
- **AND** the list contains New York
- **WHEN** the user types `<typed>` in New York
- **THEN** the moment is pinned to `<pinned>` with the status `<status>`

| now | typed | pinned | status |
|---|---|---|---|
| `2026-06-01T07:30:00Z` | `10:00` | `2026-06-01T14:00:00Z` | `UNIQUE` |
| `2026-03-08T07:30:00Z` | `02:30` | `2026-03-08T07:30:00Z` | `GAP` |
| `2026-11-01T07:30:00Z` | `01:30` | `2026-11-01T05:30:00Z` | `AMBIGUOUS` |

#### Scenario: Type a time in the Here entry
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains the device time location and Moscow
- **WHEN** the user types `08:00` in the device time location
- **THEN** the moment is pinned to `2026-03-08T03:00:00Z`
- **AND** Moscow shows `06:00`

### Requirement: Wall-time hint lifetime
The wall-time hint SHALL stay until the next wall-time input, time selection, date change or Now. A change of the reference zone (home set or cleared) MUST keep a hint on a location. A change of the device time zone MUST end a hint on the device time location and keep the pinned instant. When its row is removed, the hint MUST disappear and the moment MUST stay. <!-- implements FR7, FR9 of add-wall-time-input-with-hint; FR8, FR9 of add-settings-page-and-device-time-location -->

#### Scenario: The hint ends with the next change
- **GIVEN** New York shows a wall-time hint
- **WHEN** the user <change>
- **THEN** no row shows a wall-time hint

| change |
|---|
| types `10:00` in New York |
| moves a day track to the next step |
| moves to the next day |
| returns to now |

#### Scenario: The hint leaves with its row
- **GIVEN** New York shows a wall-time hint
- **WHEN** New York is removed
- **THEN** no row shows a wall-time hint
- **AND** the moment stays pinned

#### Scenario: A home change keeps the hint
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow and New York
- **AND** the user typed `02:30` in New York, so New York shows a wall-time hint
- **WHEN** the user makes Moscow home
- **THEN** New York still shows the wall-time hint
- **AND** the moment is still pinned to `2026-03-08T07:30:00Z` with the status `GAP`
- **AND** the date bar shows no note

#### Scenario: A device time zone change ends the hint on the Here entry
- **GIVEN** the device time zone is `America/New_York`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains the device time location and Moscow
- **AND** the user typed `02:30` in the device time location, so it shows a wall-time hint
- **WHEN** the device time zone changes to `Asia/Almaty`
- **THEN** no row shows a wall-time hint
- **AND** the date bar shows no note
- **AND** the moment is still pinned to `2026-03-08T07:30:00Z`
