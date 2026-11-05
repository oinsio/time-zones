## ADDED Requirements

### Requirement: Zone line on location rows
The line under the city of every city location row, its zone line, SHALL consist of separate elements in this order: the country name in the interface language, the zone abbreviation at the effective instant (see the `zone-abbreviations` capability) and the UTC offset. The zone abbreviation MUST be shown only while the zone label shows the zone abbreviation, and the UTC offset only while it shows the UTC offset (see the `settings` capability). An element that is hidden or unknown — a zone without a country, a zone without a zone abbreviation, an offset that cannot be computed — MUST leave no element, no empty space and no separator character behind. A zone abbreviation that reads the same as the UTC offset text MUST NOT be shown, so the `UTC` zone reads `UTC` once. A change of the zone label MUST apply to every row in the same render, without a reload and without a loading state; it MUST NOT change the city label, the local time, the offset difference, the day track or any accessible name. Inputs: the location, the effective instant, the interface language, the zone label. Output: the zone line elements. Errors: none beyond the existing rule for an unknown zone. <!-- implements FR5, FR13, UX1, UX2 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Country, abbreviation and offset
- **GIVEN** the interface language is Russian
- **AND** the zone label shows the UTC offset and the zone abbreviation
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
| the UTC offset and the zone abbreviation | India, IST, UTC+5:30 |
| the UTC offset only | India, UTC+5:30 |
| the zone abbreviation only | India, IST |
| nothing | India |

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

#### Scenario: A change applies to every row at once
- **GIVEN** the list contains Moscow, Kolkata and the device time location
- **WHEN** the user turns the zone abbreviation off in the settings and goes back
- **THEN** no row shows a zone abbreviation
- **AND** the city labels, local times and offset differences are unchanged

### Requirement: Zone line layout
The zone line SHALL wrap only between its elements. The zone abbreviation and the UTC offset MUST each stay on one line; the country name MAY wrap between its words. No element MUST be cut or end in an ellipsis: the card grows in height instead. Elements MUST be spaced evenly, with no separator character. At 320, 375, 768, 1024 and 1440 px the page MUST NOT scroll horizontally and no zone line element MUST be clipped, also in the heaviest case: Adelaide in January (`ACDT`, `UTC+10:30`) in a list with a location whose country name has at least 20 characters. Every approved screenshot that shows a card (for example the "list", "pinned", "device-time" and 12-hour states, and the language screenshots of the settings capability) MUST be re-approved once with the zone line of this change and then match. <!-- implements NFR-R1, NFR-R3, UX1 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: No overflow and no clipping
- **GIVEN** the interface language is `<language>`
- **AND** the current instant is `2026-01-15T12:00:00Z`
- **AND** the list contains Adelaide and St. Vincent
- **WHEN** the list is shown `<width>` px wide
- **THEN** the page does not scroll horizontally
- **AND** no zone line element is clipped or ends in an ellipsis
- **AND** Adelaide shows `ACDT` and `UTC+10:30`, each on one line

| language | width |
|---|---|
| Russian | 320 |
| Russian | 375 |
| English | 768 |
| English | 1024 |
| Russian | 1440 |

#### Scenario: Wrapping between elements only
- **GIVEN** the list is shown 320 px wide in Russian
- **AND** the list contains St. Vincent and the current instant is `2026-01-15T12:00:00Z`
- **WHEN** its zone line does not fit on one line
- **THEN** it wraps between elements or between words of the country name
- **AND** `AST` and `UTC−4` are each on one line

#### Scenario: Re-approved screenshots
- **GIVEN** an approved screenshot state that shows a card
- **WHEN** it is rendered at its approved width and theme
- **THEN** it matches the screenshot re-approved for this change

### Requirement: Zone line is fast
Presenting 50 location rows again at another minute of the same day, with the zone abbreviation and the UTC offset shown, SHALL build no date, time or region name formatter and MUST look up no time zone transition. Reading the zone abbreviation of a row MUST cost at most 2 extra zone lookups when its zone has an abbreviation pair and none when it has one or no abbreviation. These bounds are counted, never timed; the time of presenting 50 rows is measured by the timing benchmark, whose result does not fail the pull request check. <!-- implements NFR-P1 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: 50 rows within the work bound
- **GIVEN** 50 locations whose rows have been presented once with the zone abbreviation and the UTC offset
- **WHEN** their rows are presented again at another minute of the same day
- **THEN** no date, time or region name formatter is built
- **AND** no time zone transition is looked up

#### Scenario: Extra zone lookups per row
- **GIVEN** the list contains New York (`America/New_York`, an abbreviation pair and a clock change), Santiago (`America/Santiago`, a clock change with numeric designations only), Moscow (`Europe/Moscow`, one abbreviation) and Almaty (`Asia/Almaty`, no abbreviation)
- **AND** the current instant is `2026-07-15T12:00:00Z`
- **WHEN** the rows are presented with the zone abbreviation and the UTC offset shown
- **THEN** New York has at most 2 more zone lookups than Santiago
- **AND** Moscow has as many zone lookups as Almaty

## MODIFIED Requirements

### Requirement: UTC offset on location rows
Every location row in the Cards view SHALL show the location's UTC offset as the last element of its zone line, after the country name and the zone abbreviation, while the zone label shows the UTC offset (see the `settings` capability); while it does not, the row MUST show no offset and MUST leave no gap for it. The offset MUST be derived from the location's canonical IANA identifier for the reference moment — the current instant while the moment is live, the pinned instant while it is pinned (see the `date-selection` capability) — so daylight saving time is respected for the shown date; a raw offset MUST NOT be stored or used to identify a location. The offset MUST be computed when the list is presented (the app opens, a location is added or removed, the list changes in another tab, the interface language changes, the reference moment changes), at the start of every minute while the page is visible, and when the page becomes visible again; it MUST NOT be refreshed while the page is hidden. Inputs: the location's IANA identifier, the reference moment (ISO 8601 with `Z`), the interface language. Output: the offset text. Errors: when the offset cannot be computed for the identifier, the row MUST be shown without the offset and the rest of the list MUST be unaffected. The offset needs no network and behaves the same offline. <!-- implements FR1, FR2, FR4, FR6, UX1 of show-utc-offset-on-location-rows; FR4 of show-local-time-and-date-on-location-cards; FR5 of select-date-with-calendar-and-now; FR5, FR13 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Whole-hour zone
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Moscow (`Europe/Moscow`)
- **WHEN** the user opens the app
- **THEN** the Moscow row shows `UTC+3`

#### Scenario: Half-hour zone
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Kolkata (`Asia/Kolkata`)
- **WHEN** the user opens the app
- **THEN** the Kolkata row shows `UTC+5:30`

#### Scenario: 45-minute zone
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Kathmandu (`Asia/Kathmandu`)
- **WHEN** the user opens the app
- **THEN** the Kathmandu row shows `UTC+5:45`

#### Scenario: Daylight saving time is respected
- **GIVEN** the list contains New York (`America/New_York`)
- **WHEN** the user opens the app at `2026-07-15T12:00:00Z`
- **THEN** the New York row shows `UTC−4`
- **WHEN** the user opens the app at `2026-01-15T12:00:00Z`
- **THEN** the New York row shows `UTC−5`

#### Scenario: Zero offset
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains UTC (`UTC`)
- **WHEN** the user opens the app
- **THEN** the UTC row shows `UTC`

#### Scenario: Offset is computed again when the list changes
- **GIVEN** the list contains New York (`America/New_York`)
- **AND** the app was opened at `2026-01-15T12:00:00Z`, so the New York row shows `UTC−5`
- **WHEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the user adds Kolkata
- **THEN** the New York row shows `UTC−4`
- **AND** the Kolkata row shows `UTC+5:30`

#### Scenario: Offset is computed again at the minute boundary
- **GIVEN** the list contains New York (`America/New_York`)
- **AND** the app was opened at `2026-03-08T06:59:30Z`, so the New York row shows `UTC−5`
- **WHEN** the next minute starts at `2026-03-08T07:00:00Z`
- **THEN** the New York row shows `UTC−4`

#### Scenario: Offset that cannot be computed
- **GIVEN** the list holds Moscow and a location whose zone the browser does not know (for example `Mars/Olympus_Mons`)
- **WHEN** the list is presented
- **THEN** that location's row shows its city and remove action without an offset
- **AND** the Moscow row shows `UTC+3`

#### Scenario: Offset hidden by the zone label
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the zone label shows the zone abbreviation and not the UTC offset
- **AND** the list contains Moscow
- **WHEN** the user opens the app
- **THEN** the Moscow row shows `Russia` and `MSK` and no offset

### Requirement: Device time location
The device time location SHALL be a location of the list whose zone is the device time zone. Its row MUST show the Here mark with its "here" caption (the Home mark instead while it is home), the city of the device time zone, the meta line in place of the country name: "Device time" («Время устройства»), then the zone abbreviation and the UTC offset as separate elements, each shown as the zone label allows (see "Zone line on location rows"), the local time and date at the effective instant, its offset difference by the rule of every location row, and a day track on the shared reference day. Its zone MUST change in the same render whenever the device time zone is read with a new value: at start, at every minute tick and when the page becomes visible. An unknown device time zone MUST be shown as `UTC`. Inputs: the device time zone, the effective instant, the reference zone. Output: the row. Errors: none. <!-- implements FR8, UX3 of add-settings-page-and-device-time-location; FR6 of show-zone-abbreviations-and-zone-label-setting -->

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
| the UTC offset and the zone abbreviation | Время устройства, МСК, UTC+3 |
| the UTC offset only | Время устройства, UTC+3 |
| the zone abbreviation only | Время устройства, МСК |
| nothing | Время устройства |

### Requirement: Exemplar city of the device time location
The device time location SHALL be named by the exemplar city of the device time zone in the interface language. The zone cities data MUST be loaded in the background only while the list holds at least one location of any kind or the search is open, and showing the device time location MUST NOT wait for it. Until the data is loaded, or when loading fails, the city MUST be derived from the time zone ID, with no error shown. On an engine that rejects the canonical device time zone but accepts a legacy name of it, the exemplar city MUST be looked up by the canonical ID and the time, date and day track shown through the legacy name. The search MUST reuse data already loaded, so the page requests the data at most once while no load fails; the city labels of city locations share the same request. <!-- implements FR8, NFR-P2 of add-settings-page-and-device-time-location; FR4 of show-city-labels-in-interface-language; FR6 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Derived city first, exemplar city after loading
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the zone cities data has not been loaded
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the device time location shows `Almaty`
- **WHEN** the zone cities data finishes loading
- **THEN** the device time location shows `Алматы`

#### Scenario: Loading fails
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** loading the zone cities data fails
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the device time location shows `Almaty`
- **AND** no error is shown

#### Scenario: No load without the device time location
- **GIVEN** the stored list is empty
- **WHEN** the user opens the app and does not open the search
- **THEN** the zone cities data is not requested

#### Scenario: One request for city labels and the device time location
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the stored list is the device time location, Tokyo
- **WHEN** the user opens the app, the zone cities data finishes loading, and the user opens the search
- **THEN** the zone cities data was requested exactly once

#### Scenario: Renamed device time zone
- **GIVEN** the engine rejects `Europe/Kyiv` and accepts `Europe/Kiev`
- **AND** the device reports the time zone `Europe/Kiev`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the device time location shows `Kyiv`, the time `09:30` and the meta line `Device time`, `EET`, `UTC+2`

### Requirement: Device time location strings are localized
Every string of the device time location SHALL exist in English and Russian: the meta line "Device time" («Время устройства») and its accessible name. The meta line's first element is that text alone; the zone abbreviation and the UTC offset follow it as separate elements. <!-- implements FR16 of add-settings-page-and-device-time-location; FR6 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Both languages
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is the device time location
- **WHEN** the interface language is switched between English and Russian
- **THEN** the meta line reads `Device time`, `UTC+5` and `Время устройства`, `UTC+5`
