## MODIFIED Requirements

### Requirement: Empty state
When there are no locations, the Cards view SHALL show the Here entry for the device time zone first, then an explanation that no locations are added and an "Add location" action that opens the search. It MUST NOT show an action that does nothing, and it MUST NOT write anything to storage. <!-- implements FR7, UX1 of add-main-page-scaffold; FR17 of add-locations-via-search; FR7, UX2 of show-here-entry-for-device-time -->

#### Scenario: First launch
- **WHEN** the user opens the app with no locations
- **THEN** the Here entry for the device time zone is shown first
- **AND** the explanation is shown in the current language below it
- **AND** the "Add location" action is shown below it
- **AND** no location list is stored

#### Scenario: Add location from the empty state
- **GIVEN** there are no locations
- **WHEN** the user chooses "Add location"
- **THEN** the search opens with popular suggestions
