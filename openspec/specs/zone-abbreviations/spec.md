# zone-abbreviations Specification

## Purpose
TBD - created by archiving change show-zone-abbreviations-and-zone-label-setting. Update Purpose after archive.

## Requirements

### Requirement: Zone abbreviation at a moment
The app SHALL know the zone abbreviation of a zone at an instant. Inputs: the zone's canonical IANA identifier and an instant (ISO 8601 with `Z`). Output: a letter abbreviation from the IANA time zone database (tzdb), or none. Only tzdb designations made of the letters A–Z and a–z are zone abbreviations; a zone whose tzdb designation is numeric (`+05`, `-03`, `+0530`) MUST have none. A zone uses at most two abbreviations in a year, its abbreviation pair, in order of increasing UTC offset. The abbreviation at an instant MUST be the one of the pair in force at that instant, decided from the zone's UTC offset at that instant (derived from the identifier, never stored): the second of the pair when the zone is at the higher of its two offsets of that year, otherwise the first. A zone with one abbreviation has it all year. Errors: an identifier the browser does not know, or one that tzdb does not name with letters, has no zone abbreviation, and nothing else is affected. Abbreviations produced by the browser (`Intl` short zone names) MUST NOT be used. <!-- implements FR1, FR2 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: The abbreviation follows the moment
- **WHEN** the zone abbreviation of `<zone>` at `<instant>` is read
- **THEN** it is `<abbreviation>`

| zone | instant | abbreviation |
|---|---|---|
| America/New_York | 2026-01-15T12:00:00Z | EST |
| America/New_York | 2026-07-15T12:00:00Z | EDT |
| Europe/Dublin | 2026-01-15T12:00:00Z | GMT |
| Europe/Dublin | 2026-07-15T12:00:00Z | IST |
| Australia/Sydney | 2026-01-15T12:00:00Z | AEDT |
| Australia/Sydney | 2026-07-15T12:00:00Z | AEST |
| Australia/Adelaide | 2026-01-15T12:00:00Z | ACDT |
| Asia/Kolkata | 2026-07-15T12:00:00Z | IST |
| Europe/Moscow | 2026-07-15T12:00:00Z | MSK |
| America/Panama | 2026-07-15T12:00:00Z | EST |
| UTC | 2026-07-15T12:00:00Z | UTC |

#### Scenario: The abbreviation changes at the clock change
- **GIVEN** New York moves its clocks forward at `2026-03-08T07:00:00Z`
- **WHEN** the zone abbreviation of `America/New_York` is read at `2026-03-08T06:59:00Z` and at `2026-03-08T07:30:00Z`
- **THEN** it is `EST` and then `EDT`

#### Scenario: Numeric designations are no abbreviation
- **WHEN** the zone abbreviation of `Asia/Almaty`, `Asia/Dubai`, `Asia/Singapore` or `America/Sao_Paulo` is read at `2026-07-15T12:00:00Z`
- **THEN** there is none

#### Scenario: Unknown zone
- **WHEN** the zone abbreviation of `Mars/Olympus_Mons` is read
- **THEN** there is none

#### Scenario: Abbreviation pairs
- **WHEN** the abbreviation pair of `<zone>` is read
- **THEN** it is `<pair>`

| zone | pair |
|---|---|
| America/New_York | EST, EDT |
| Europe/Dublin | GMT, IST |
| Asia/Jerusalem | IST, IDT |
| Australia/Sydney | AEST, AEDT |
| Asia/Kolkata | IST |
| America/Panama | EST |

### Requirement: One offline abbreviation table
Cards, the device time location, the wall-time hint, the settings example and the search SHALL read the zone abbreviation from one table built into the app from tzdb when the app is built. Reading it MUST need no network and MUST NOT wait for the search data, so it behaves the same offline and on the first render. The table MUST add at most 5 KB gzipped to the initial JavaScript, and the initial JavaScript MUST stay at most 150 KB gzipped. <!-- implements FR4, NFR-P2 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Available on the first render offline
- **GIVEN** the app is opened without a network connection
- **AND** the list contains New York and the current instant is `2026-07-15T12:00:00Z`
- **WHEN** the list is first shown
- **THEN** the New York row shows `EDT` in the same render, without a loading state

#### Scenario: Table size
- **WHEN** the app is built
- **THEN** the zone abbreviation table is at most 5 KB gzipped
- **AND** the initial JavaScript is at most 150 KB gzipped

### Requirement: Abbreviation spelling per interface language
A zone abbreviation SHALL be shown in the Latin letters of tzdb in every interface language, with one exception: the Russian interface MUST show `MSK` as «МСК». The spelling MUST come from the locale files and exist in English (`MSK`) and Russian («МСК»); a dialect follows its base language, then English. The spelling changes the displayed text only: matching, ordering and the abbreviation pair are decided on the tzdb form. <!-- implements FR3 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Moscow in Russian and English
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Moscow
- **WHEN** the interface language is Russian
- **THEN** the Moscow row shows «МСК»
- **WHEN** the interface language is English
- **THEN** the Moscow row shows `MSK`

#### Scenario: Other abbreviations stay Latin in Russian
- **GIVEN** the interface language is Russian
- **AND** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Kolkata and New York
- **WHEN** the list is shown
- **THEN** Kolkata shows `IST` and New York shows `EDT`
