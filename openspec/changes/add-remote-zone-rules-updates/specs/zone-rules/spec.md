# Spec Delta

## MODIFIED Requirements

### Requirement: Rules load before the app
The zone rules SHALL load before the app on every engine from one asset the service worker precaches, so the app works offline after the first visit, or from the stored release when it is newer than that asset or the asset cannot be loaded (zone-rules-updates "Active release at start"). If neither the asset nor a valid stored release can be loaded, the app MUST still start, with the engine's data, and MUST log the failure. <!-- implements FR10, NFR-P2 of add-zone-rules-from-iana; FR6 of add-remote-zone-rules-updates -->

#### Scenario: Offline start with the rules
- **GIVEN** the app was opened online once
- **WHEN** it is opened without a network connection
- **THEN** the main page shows the stored locations with times from the rules
- **AND** the zone rules asset is served from the service worker's precache
- **AND** no zone rules load failure is logged

#### Scenario: The asset is requested with the app
- **WHEN** the app is opened online
- **THEN** the zone rules asset is requested once, in parallel with the app's first chunks

#### Scenario: A failed load still starts the app
- **GIVEN** the zone rules asset cannot be loaded
- **AND** no valid stored release is kept
- **WHEN** the app starts
- **THEN** the main page is shown with the engine's data
- **AND** the failure is logged
