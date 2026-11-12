# Spec Delta

## ADDED Requirements

### Requirement: Zones offered by search come from the release
The zones the search offers SHALL be the zone ids of the zone rules release, with their CLDR exemplar cities, and MUST NOT depend on the list of zones the engine knows. A zone id of the release the engine rejects MUST be offered and addable like any other. <!-- implements FR5, FR9 of add-zone-rules-from-iana -->

#### Scenario: A zone the engine rejects is offered
- **GIVEN** the engine rejects `America/Ciudad_Juarez`
- **WHEN** the user searches for "Ciudad"
- **THEN** Ciudad Juárez in `America/Ciudad_Juarez` is among the results

#### Scenario: The engine's own list plays no part
- **GIVEN** the engine cannot list its zones
- **WHEN** the user searches for "Moscow"
- **THEN** Moscow in `Europe/Moscow` is among the results
