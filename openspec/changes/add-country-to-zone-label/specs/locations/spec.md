## MODIFIED Requirements

### Requirement: Zone line on location rows
The line under the city of every city location row, its zone line, SHALL consist of separate elements in this order: the country name in the interface language, the zone abbreviation at the effective instant (see the `zone-abbreviations` capability) and the UTC offset. The country name MUST be shown only while the zone label shows the country, the zone abbreviation only while it shows the zone abbreviation, and the UTC offset only while it shows the UTC offset (see the `settings` capability). An element that is hidden or unknown — a hidden part, a zone without a country, a zone without a zone abbreviation, an offset that cannot be computed — MUST leave no element, no empty space and no separator character behind; when no element is left, the row MUST show no zone line and no empty line under the city. While the UTC offset is shown, a zone abbreviation that reads the same as the UTC offset text MUST NOT be shown, so the `UTC` zone reads `UTC` once; while the UTC offset is hidden, that zone abbreviation MUST be shown, so the `UTC` zone still reads `UTC`. A change of the zone label MUST apply to every row in the same render, without a reload and without a loading state; it MUST NOT change the city label, the local time, the offset difference, the day track or any accessible name. Inputs: the location, the effective instant, the interface language, the zone label. Output: the zone line elements. Errors: none beyond the existing rule for an unknown zone. <!-- implements FR5, FR13, UX1, UX2 of show-zone-abbreviations-and-zone-label-setting; FR3, UX2 of add-country-to-zone-label -->

#### Scenario: Country, abbreviation and offset
- **GIVEN** the interface language is Russian
- **AND** the zone label shows the country, the zone abbreviation and the UTC offset
- **AND** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Kolkata
- **WHEN** the user opens the app
- **THEN** the Kolkata row's zone line elements are `Индия`, `IST`, `UTC+5:30`

#### Scenario: The zone label decides the elements
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Kolkata
- **WHEN** the zone label shows `<parts>`
- **THEN** the Kolkata row's zone line elements are `<elements>`

| parts | elements |
|---|---|
| the country, the zone abbreviation and the UTC offset | India, IST, UTC+5:30 |
| the country and the UTC offset | India, UTC+5:30 |
| the country and the zone abbreviation | India, IST |
| the country only | India |
| the zone abbreviation and the UTC offset | IST, UTC+5:30 |
| the UTC offset only | UTC+5:30 |
| the zone abbreviation only | IST |
| nothing | no element |

#### Scenario: No zone line when every part is hidden
- **GIVEN** the list contains Kolkata
- **WHEN** the zone label shows nothing
- **THEN** the Kolkata row shows its city, its local time and its offset difference, and no zone line

#### Scenario: The abbreviation follows the reference moment
- **GIVEN** the list contains New York and Dublin
- **AND** the current instant is `2026-01-15T12:00:00Z`
- **WHEN** the user opens the app
- **THEN** New York shows `EST` and Dublin shows `GMT`
- **WHEN** the user pins the moment to `2026-07-15T12:00:00Z`
- **THEN** New York shows `EDT` and Dublin shows `IST`

#### Scenario: Unknown elements leave nothing behind
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Almaty and UTC
- **WHEN** the user opens the app
- **THEN** the Almaty row's zone line elements are `Kazakhstan`, `UTC+5`
- **AND** the UTC row's zone line elements are `UTC`

#### Scenario: UTC with the zone abbreviation only
- **GIVEN** the interface language is English
- **AND** the zone label shows the zone abbreviation only
- **AND** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains UTC
- **WHEN** the user opens the app
- **THEN** the UTC row's zone line elements are `UTC`

#### Scenario: A change applies to every row at once
- **GIVEN** the list contains Moscow, Kolkata and the device time location
- **WHEN** the user turns the zone abbreviation off in the settings and goes back
- **THEN** no row shows a zone abbreviation
- **AND** the city labels, local times and offset differences are unchanged

#### Scenario: Hiding the country applies to every row at once
- **GIVEN** the interface language is English
- **AND** the list contains Moscow, Kolkata and the device time location
- **WHEN** the user turns the country off in the settings and goes back
- **THEN** no row shows `Russia` or `India`
- **AND** the device time location still shows `Device time`
- **AND** the city labels, local times and offset differences are unchanged

### Requirement: Device time location
The device time location SHALL be a location of the list whose zone is the device time zone. Its row MUST show the Here mark with its "here" caption (the Home mark instead while it is home), the city of the device time zone, the meta line in place of the country name: "Device time" («Время устройства»), then the zone abbreviation and the UTC offset as separate elements, each shown as the zone label allows (see "Zone line on location rows"), the local time and date at the effective instant, its offset difference by the rule of every location row, and a day track on the shared reference day. "Device time" is not a country name: it MUST stay the first element of the meta line whether or not the zone label shows the country. Its zone MUST change in the same render whenever the device time zone is read with a new value: at start, at every minute tick and when the page becomes visible. An unknown device time zone MUST be shown as `UTC`. Inputs: the device time zone, the effective instant, the reference zone. Output: the row. Errors: none. <!-- implements FR8, UX3 of add-settings-page-and-device-time-location; FR6 of show-zone-abbreviations-and-zone-label-setting; FR4 of add-country-to-zone-label -->

#### Scenario: Device time location on the design sample
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the zone cities data is loaded
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is the device time location, Moscow, Kolkata, New York
- **WHEN** the user opens the app
- **THEN** the first row shows `Алматы`, the caption `здесь`, the meta line `Время устройства`, `UTC+5` (Almaty has no zone abbreviation), the time `12:30`, the date `вс, 8 мар.` and no offset difference
- **AND** Moscow shows `−2 ч`, Kolkata `+0:30` and New York `−9 ч`

#### Scenario: The device moves to another zone
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is English
- **AND** the list is the device time location, New York
- **WHEN** the device time zone becomes `Europe/Moscow` and the minute tick reads it
- **THEN** the first row shows `Moscow` and the meta line `Device time`, `MSK`, `UTC+3`
- **AND** the list is still the device time location, New York

#### Scenario: Unknown device time zone
- **GIVEN** the device reports the time zone `Mars/Olympus_Mons`
- **AND** the interface language is English
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the row shows `UTC`, the caption `here` and the meta line `Device time`, `UTC`

#### Scenario: Meta line follows the zone label
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the interface language is Russian
- **AND** the list is the device time location
- **WHEN** the zone label shows `<parts>`
- **THEN** the meta line is `<meta line>`

| parts | meta line |
|---|---|
| the country, the zone abbreviation and the UTC offset | Время устройства, МСК, UTC+3 |
| the zone abbreviation and the UTC offset | Время устройства, МСК, UTC+3 |
| the country and the UTC offset | Время устройства, UTC+3 |
| the country and the zone abbreviation | Время устройства, МСК |
| the country only | Время устройства |
| nothing | Время устройства |
