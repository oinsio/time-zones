## MODIFIED Requirements

### Requirement: Wall-time hint texts
When a wall-time input resolves to `GAP` or `AMBIGUOUS`, only the row where the time was typed SHALL show the wall-time hint, in the interface language. On `GAP` it MUST name the typed time and the shown time. On `AMBIGUOUS` it MUST name the typed time and the UTC offset of the shown instant in that row's zone, whatever the zone label shows; while the zone label shows the zone abbreviation and the zone has one at the shown instant, the abbreviation MUST come before the offset, separated by a comma: "(EDT, UTC−4)". `UNIQUE` MUST show no hint. The exact texts are in the scenarios. <!-- implements FR7 of add-wall-time-input-with-hint; FR7 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Hint for a DST gap
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **WHEN** the user types `02:30` in New York
- **THEN** New York shows the hint "02:30 does not exist on this day — clocks moved forward. Showing 03:30."
- **AND** Almaty shows no hint

#### Scenario: Hint for a DST overlap
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the current instant is `2026-11-01T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user types `01:30` in New York
- **THEN** New York shows the hint «01:30 бывает дважды — показано первое (EDT, UTC−4)»

#### Scenario: Hint texts in Russian for a DST gap
- **GIVEN** the interface language is Russian
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user types `02:30` in New York
- **THEN** New York shows the hint «02:30 не существует в этот день — часы переведены вперёд. Показано 03:30»

#### Scenario: Hint texts in English for a DST overlap
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-11-01T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user types `01:30` in New York
- **THEN** New York shows the hint "01:30 occurs twice — showing the first (EDT, UTC−4)."

#### Scenario: Overlap hint without the abbreviation
- **GIVEN** the interface language is English
- **AND** the zone label shows neither the zone abbreviation nor the UTC offset
- **AND** the current instant is `2026-11-01T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user types `01:30` in New York
- **THEN** New York shows the hint "01:30 occurs twice — showing the first (UTC−4)."
