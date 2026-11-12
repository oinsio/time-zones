# Spec Delta

## MODIFIED Requirements

### Requirement: One offline abbreviation table
Cards, the device time location, the wall-time hint, the settings example and the search SHALL read the zone abbreviation from one table built into the app from the zone rules release when the app is built: the tzdb designations of each zone's local time types in the rules year. Reading it MUST need no network and MUST NOT wait for the search data, so it behaves the same offline and on the first render. The table MUST add at most 5 KB gzipped to the initial JavaScript, and the initial JavaScript MUST stay at most 150 KB gzipped. <!-- implements FR4, NFR-P2 of show-zone-abbreviations-and-zone-label-setting; FR9 of add-zone-rules-from-iana -->

#### Scenario: Available on the first render offline
- **GIVEN** the app is opened without a network connection
- **AND** the list contains New York and the current instant is `2026-07-15T12:00:00Z`
- **THEN** the New York row shows `EDT` in the same render, without a loading state

#### Scenario: Table size
- **WHEN** the app is built
- **THEN** the zone abbreviation table is at most 5 KB gzipped
- **AND** the initial JavaScript is at most 150 KB gzipped

#### Scenario: Table built from the release
- **WHEN** the abbreviation table is built from the zone rules release
- **THEN** `America/New_York` has the pair `EST, EDT`, `Europe/Dublin` has `GMT, IST`, `Asia/Kolkata` has `IST`
- **AND** `Asia/Almaty` has no abbreviation
- **AND** the table equals the one built from the same release's tzdb periods before this change
