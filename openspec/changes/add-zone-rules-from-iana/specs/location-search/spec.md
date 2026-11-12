# Spec Delta

## ADDED Requirements

### Requirement: Zones offered by search come from the release
The zones the search offers SHALL be the zone ids of the zone rules release that have an area (contain `/`) outside the `Etc` area, plus `UTC` as today, with their CLDR exemplar cities; offset-only zones (`Etc/GMT+5`) and area-less ids (`EST5EDT`, `CET`) MUST NOT be offered. The offered zones MUST NOT depend on the list of zones the engine knows. A zone id of the release the engine rejects MUST be offered and addable like any other. <!-- implements FR5, FR9 of add-zone-rules-from-iana -->

#### Scenario: A zone the engine rejects is offered
- **GIVEN** the engine rejects `America/Ciudad_Juarez`
- **WHEN** the user searches for "Ciudad"
- **THEN** Ciudad Juárez in `America/Ciudad_Juarez` is among the results

#### Scenario: The engine's own list plays no part
- **GIVEN** the engine cannot list its zones
- **WHEN** the user searches for "Moscow"
- **THEN** Moscow in `Europe/Moscow` is among the results

#### Scenario: Offset-only zones are not offered
- **GIVEN** the zone rules release holds `Etc/GMT+5`, `Etc/GMT-14` and `EST5EDT`
- **WHEN** the user searches for "GMT+5"
- **THEN** no result has a zone in the `Etc` area
- **AND** no result has an area-less zone other than `UTC`
