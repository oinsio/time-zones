# Spec Delta

## ADDED Requirements

### Requirement: Zone rules update notice
When a newer zone rules release has been stored, the shell SHALL show a non-blocking notice naming the release, with a Reload action and a dismiss control. Reload MUST reload the page; the app MUST NOT reload by itself. The notice MUST NOT cover the page heading and MUST behave as the update notice for keyboard and focus. <!-- implements FR7, UX1, UX2, NFR-A1 of add-remote-zone-rules-updates -->

#### Scenario: Notice names the release
- **WHEN** the release `2026d` has been stored
- **THEN** the notice reads "Time zone rules 2026d are ready. Reload to use them." and offers a Reload action and a dismiss control

#### Scenario: User reloads
- **WHEN** the zone rules update notice is shown and the user chooses Reload
- **THEN** the page reloads

#### Scenario: User dismisses
- **WHEN** the zone rules update notice is shown and the user dismisses it
- **THEN** the notice disappears and the page keeps running

#### Scenario: Keyboard user handles the notice
- **WHEN** the zone rules update notice is shown and the user uses only the keyboard
- **THEN** Reload and the dismiss control are reachable with Tab and work with Enter
- **AND** Esc dismisses the notice

#### Scenario: Both notices at once
- **WHEN** a new version is waiting and a newer zone rules release has been stored
- **THEN** both notices are shown, each with its own Reload
- **AND** either Reload applies both

#### Scenario: Russian notice
- **GIVEN** the interface language is Russian
- **WHEN** the release `2026d` has been stored
- **THEN** the notice reads «Доступны правила часовых поясов 2026d. Перезагрузите, чтобы применить.»

#### Scenario: No accessibility violations
- **WHEN** the zone rules update notice is shown
- **THEN** an accessibility check reports no violations
