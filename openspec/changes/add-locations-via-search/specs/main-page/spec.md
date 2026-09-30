# Spec Delta

## MODIFIED Requirements

### Requirement: Empty state
When there are no locations, the Cards view SHALL show an explanation that no locations are added and an "Add location" action that opens the search. It MUST NOT show an action that does nothing. <!-- implements FR7, UX1 of add-main-page-scaffold; FR17 of add-locations-via-search -->

#### Scenario: First launch
- **WHEN** the user opens the app with no locations
- **THEN** the explanation is shown in the current language
- **AND** the "Add location" action is shown

#### Scenario: Add location from the empty state
- **GIVEN** there are no locations
- **WHEN** the user chooses "Add location"
- **THEN** the search opens with popular suggestions
