# Spec Delta

## MODIFIED Requirements

### Requirement: Exemplar city of the device time location
The device time location SHALL be named by the exemplar city of the device time zone in the interface language. The zone cities data MUST be loaded in the background only while the list holds at least one location of any kind or the search is open, and showing the device time location MUST NOT wait for it. Until the data is loaded, or when loading fails, the city MUST be derived from the time zone ID, with no error shown. On an engine that rejects the canonical device time zone while the zone rules release knows it (see the `zone-rules` capability), the exemplar city MUST be looked up by the canonical ID and the time, date and day track MUST come from the zone rules. The search MUST reuse data already loaded, so the page requests the data at most once while no load fails; the city labels of city locations share the same request. <!-- implements FR8, NFR-P2 of add-settings-page-and-device-time-location; FR4 of show-city-labels-in-interface-language; FR6 of show-zone-abbreviations-and-zone-label-setting; FR1, FR5 of add-zone-rules-from-iana -->

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
