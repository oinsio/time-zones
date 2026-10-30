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
