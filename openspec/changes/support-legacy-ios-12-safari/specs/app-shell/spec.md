# Spec Delta

## MODIFIED Requirements

### Requirement: New version notice
When a new version of the app is available, the shell SHALL show a non-blocking notice with a reload action and a dismiss control. The reload action MUST switch the app to the new version. The app MUST NOT reload by itself. The notice MUST NOT cover the page heading. The app MUST check for a new version when it starts, and again each time the page becomes visible once at least 15 minutes have passed since the last check; no check MUST run while the page is hidden. A failed check MUST be reported as in "Update check failure note". <!-- implements FR7, UX2, NFR-A2 of setup-app-shell-and-pages-deploy; FR10 of support-legacy-ios-12-safari -->

#### Scenario: New version becomes available
- **WHEN** a new version of the app is waiting
- **THEN** the update notice is shown with a reload action
- **AND** the page keeps working without reloading

#### Scenario: User accepts the update
- **WHEN** the update notice is shown and the user chooses reload
- **THEN** the app switches to the new version

#### Scenario: User postpones the update
- **WHEN** the update notice is shown and the user dismisses it
- **THEN** the notice disappears and the current version keeps running

#### Scenario: Keyboard user handles the notice
- **WHEN** the update notice is shown and the user uses only the keyboard
- **THEN** the reload action and the dismiss control are reachable with Tab and work with Enter
- **AND** Esc dismisses the notice

#### Scenario: Returning to the app checks again
- **GIVEN** the app last checked for a new version 16 minutes ago
- **WHEN** the page becomes visible
- **THEN** the app checks for a new version

#### Scenario: Returning soon after a check does not check
- **GIVEN** the app last checked for a new version 5 minutes ago
- **WHEN** the page becomes visible
- **THEN** no check runs

#### Scenario: Hiding the page does not check
- **GIVEN** the app last checked for a new version 16 minutes ago
- **WHEN** the page becomes hidden
- **THEN** no check runs

#### Scenario: A check on return fails offline
- **GIVEN** the network is unreachable
- **AND** the app last checked for a new version 16 minutes ago
- **WHEN** the page becomes visible
- **THEN** the note that the latest version could not be fetched is shown
