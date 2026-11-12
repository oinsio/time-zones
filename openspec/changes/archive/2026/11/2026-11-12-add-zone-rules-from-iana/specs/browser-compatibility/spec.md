# Spec Delta

## MODIFIED Requirements

### Requirement: Polyfills only where needed
Built-ins missing on a legacy engine SHALL be installed before any application module or library runs. An engine that has every required built-in MUST NOT download the polyfills. The polyfills MUST NOT count towards the initial JavaScript budget. A legacy engine is recognised by its missing built-ins only; the state of the engine's zone data plays no part, because the zone rules of the app replace it on every engine. <!-- implements FR2, NFR-P1, NFR-P2 of support-legacy-ios-12-safari; FR5 of add-zone-rules-from-iana -->

#### Scenario: Modern engine skips the polyfills
- **GIVEN** the engine has every required built-in
- **WHEN** the app starts
- **THEN** the polyfills are not requested
- **AND** the app starts

#### Scenario: Legacy engine installs the polyfills first
- **GIVEN** the engine lacks `Array.prototype.at`
- **WHEN** the app starts
- **THEN** the polyfills are installed before the app modules are loaded
- **AND** `Array.prototype.at` works in the app

#### Scenario: Initial JavaScript stays in budget
- **WHEN** the production build is measured
- **THEN** its initial JavaScript is at most 150 KB gzipped
- **AND** the polyfills are not part of it

#### Scenario: Outdated zone data alone needs no polyfills
- **GIVEN** the engine has every required built-in
- **AND** the engine rejects `Europe/Kyiv`
- **WHEN** the app starts
- **THEN** the polyfills are not requested
- **AND** Kyiv shows its time from the zone rules

## REMOVED Requirements

### Requirement: Renamed zones on outdated zone data
**Reason**: The legacy zone shim retried a rejected canonical zone under its legacy names and depended on the engine's data for everything else. The zone rules of the app (capability `zone-rules`) answer for every zone id of the release on every engine, so a renamed or new id needs no retry and an outdated engine shows current rules. <!-- implements FR5 of add-zone-rules-from-iana -->
**Migration**: The scenarios move to `zone-rules`, "Known zones come from the release": adding `America/Ciudad_Juarez` and `Europe/Kyiv` on an engine that rejects them, their times and wall-clock resolution, and the unknown zone `Mars/Olympus_Mons`. Stored identifiers were canonical before and stay canonical; no stored data changes.
