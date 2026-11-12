# Spec Delta

## ADDED Requirements

### Requirement: Zone rules update notice
When a check finds a newer zone rules release than the active one, stored or downloaded, the shell SHALL show a non-blocking notice naming the release, with a Reload action and a dismiss control, in the notices region after the update notice. Reload MUST reload the page, and when a new version is also waiting, Reload MUST apply that version as the update notice's Reload does, so either Reload applies both. The app MUST NOT reload by itself. The notice MUST NOT cover the page heading and MUST behave as the update notice for keyboard and focus. <!-- implements FR7, UX1, UX2, NFR-A1 of add-remote-zone-rules-updates -->

#### Scenario: Notice names the release
- **WHEN** a check finds the newer release `2026g`
- **THEN** the notice reads "Time zone rules 2026g are ready. Reload to use them." and offers a Reload action and a dismiss control

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
- **AND** the page heading stays visible

#### Scenario: Both notices at once
- **WHEN** a new version is waiting and a check finds a newer zone rules release
- **THEN** both notices are shown, each with its own Reload
- **AND** the Reload of the zone rules update notice applies the waiting version

#### Scenario: Russian notice
- **GIVEN** the interface language is Russian
- **WHEN** a check finds the newer release `2026g`
- **THEN** the notice reads «Доступны правила часовых поясов 2026g. Перезагрузите, чтобы применить.»

#### Scenario: No accessibility violations
- **WHEN** the zone rules update notice is shown in the `<theme>` theme
- **THEN** axe-core reports no violations

| theme |
|---|
| light |
| dark |
