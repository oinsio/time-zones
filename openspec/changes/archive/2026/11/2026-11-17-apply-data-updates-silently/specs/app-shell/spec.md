# Spec Delta: app-shell

## MODIFIED Requirements

### Requirement: New version notice
When a waiting build differs from the running build in the app itself, the shell SHALL show a non-blocking notice with a reload action and a dismiss control. A waiting build differs in the app itself when the app revision file of the site names another app revision than the running build's (see app-delivery "App revision file"). A waiting build with the running build's app revision is a silent update: it MUST show no notice and MUST be the running version at the next start, once every window of the app was closed. The reload action MUST switch the app to the waiting build. The app MUST NOT reload by itself and MUST NOT switch builds while it is open. The notice MUST NOT cover the page heading. The app MUST check for a new build when it starts, and again each time the page becomes visible once at least 15 minutes have passed since the last check; no check MUST run while the page is hidden. The app MUST read the app revision file when a build becomes waiting and at each such check while a build is waiting, only while online, with a request that revalidates the HTTP cache; while no build is waiting it MUST NOT request the file. A failed check or a failed read of the app revision file, because the network is unreachable, the status is not 2xx, the file cannot be parsed or names no revision, or for any other reason, MUST show nothing: no note, no notice and no error, and the app MUST keep working as before; a notice shown before MUST stay; the next check runs by the same rule. A dismissed notice MUST stay hidden until the app revision file names yet another app revision. Inputs: whether a build is waiting, the running build's app revision, the app revision the file names. Output: the notice shown or not. Errors: none shown. <!-- implements FR7, UX2, NFR-A2 of setup-app-shell-and-pages-deploy; FR10 of support-legacy-ios-12-safari; FR7 of polish-settings-and-remove-offline-update-notice; FR3, FR4, FR5, FR6, FR7, NFR-P1, UX1, UX2 of apply-data-updates-silently -->

#### Scenario: New version becomes available
- **GIVEN** the running build has the app revision `a1`
- **WHEN** a build is waiting and the app revision file names `b2`
- **THEN** the update notice is shown with a reload action
- **AND** the page keeps working without reloading

#### Scenario: A data-only build is waiting
- **GIVEN** the running build has the app revision `a1`
- **WHEN** a build is waiting and the app revision file names `a1`
- **THEN** the notices region stays empty
- **AND** the page keeps working without reloading

#### Scenario: A silent update is in use at the next start
- **GIVEN** a build with the running build's app revision and a later deploy time is waiting
- **WHEN** every window of the app is closed and the app is started again
- **THEN** the app runs the waiting build
- **AND** the settings page names the deploy time of the waiting build
- **AND** no notice was shown

#### Scenario: Reloading does not switch to a silent update
- **GIVEN** a build with the running build's app revision is waiting
- **WHEN** the user reloads the page
- **THEN** the app runs the same build as before and shows no notice

#### Scenario: User accepts the update
- **WHEN** the update notice is shown and the user chooses reload
- **THEN** the app switches to the waiting build

#### Scenario: User postpones the update
- **WHEN** the update notice is shown and the user dismisses it
- **THEN** the notice disappears and the current build keeps running

#### Scenario: A dismissed notice returns for yet another revision
- **GIVEN** the user dismissed the update notice while the app revision file named `b2`
- **WHEN** a later check finds that the file names `<revision>`
- **THEN** the update notice is `<shown>`

| revision | shown |
|---|---|
| b2 | not shown |
| c3 | shown |

#### Scenario: Keyboard user handles the notice
- **WHEN** the update notice is shown and the user uses only the keyboard
- **THEN** the reload action and the dismiss control are reachable with Tab and work with Enter
- **AND** Esc dismisses the notice

#### Scenario: Returning to the app checks again
- **GIVEN** the app last checked for a new build 16 minutes ago
- **WHEN** the page becomes visible
- **THEN** the app checks for a new build

#### Scenario: Returning soon after a check does not check
- **GIVEN** the app last checked for a new build 5 minutes ago
- **WHEN** the page becomes visible
- **THEN** no check runs

#### Scenario: Hiding the page does not check
- **GIVEN** the app last checked for a new build 16 minutes ago
- **WHEN** the page becomes hidden
- **THEN** no check runs

#### Scenario: No build is waiting
- **GIVEN** no build is waiting
- **WHEN** the app starts and later returns to the screen after 16 minutes
- **THEN** the app revision file was not requested

#### Scenario: The app revision is read once per check
- **GIVEN** a build with the running build's app revision is waiting and the last check was 16 minutes ago
- **WHEN** the page becomes visible
- **THEN** the app revision file is requested exactly once
- **AND** a return 5 minutes after that requests nothing

#### Scenario: An app change arrives after a silent update
- **GIVEN** a build with the running build's app revision `a1` is waiting and no notice is shown
- **WHEN** a later check finds that the app revision file names `b2`
- **THEN** the update notice is shown

#### Scenario: The app revision cannot be read
- **GIVEN** a build is waiting and `<failure>`
- **WHEN** the app reads the app revision file
- **THEN** the notices region stays empty
- **AND** the next check reads the file again

| failure |
|---|
| the device is offline |
| the request fails |
| the file returns status 404 |
| the file is not JSON |
| the file names no revision |

#### Scenario: A shown notice survives a failed read
- **GIVEN** the update notice is shown
- **WHEN** a later read of the app revision file fails
- **THEN** the update notice stays shown

#### Scenario: A check on return fails offline
- **GIVEN** the start-up check for a new build succeeded 16 minutes ago
- **AND** the network is now unreachable
- **WHEN** the page becomes visible
- **THEN** the app checks for a new build
- **AND** the notices region stays empty

#### Scenario: The start-up check fails
- **GIVEN** the network is unreachable
- **WHEN** the app starts and its check for a new build fails
- **THEN** the notices region stays empty
- **AND** a shown update or offline-ready notice stays visible

#### Scenario: No accessibility violations
- **WHEN** the update notice is shown in the `<theme>` theme
- **THEN** axe-core reports no violations

| theme |
|---|
| light |
| dark |

### Requirement: Zone rules update notice
When a newer zone rules release than the active one is the stored release (stored before or by a check; see zone-rules-updates "Stored release document") and it changes the rules of a watched zone (see zone-rules-updates "Releases that change a watched zone"), the shell SHALL show a non-blocking notice naming the release, with a Reload action and a dismiss control, in the notices region after the update notice. A stored release that changes no watched zone MUST show no notice. Reload MUST reload the page, and when a build is waiting, whether or not the update notice is shown, Reload MUST switch to that build as the update notice's Reload does, so either Reload applies both. The app MUST NOT reload by itself. The notice MUST NOT cover the page heading and MUST behave as the update notice for keyboard and focus. <!-- implements FR7, UX1, UX2, NFR-A1 of add-remote-zone-rules-updates; FR8, FR10, FR11, NFR-A1, UX3 of apply-data-updates-silently -->

#### Scenario: Notice names the release
- **GIVEN** the list holds Lisbon
- **WHEN** a check finds the newer release `2026g`, which changes the rules of `Europe/Lisbon`
- **THEN** the notice reads "Time zone rules 2026g are ready. Reload to use them." and offers a Reload action and a dismiss control

#### Scenario: A release that changes no watched zone
- **GIVEN** the list holds Lisbon and the device time zone is `Europe/Moscow`
- **WHEN** a check finds the newer release `2026g`, which changes only the rules of `America/Asuncion`
- **THEN** the notices region stays empty

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
- **WHEN** a build with another app revision is waiting and a check finds a newer zone rules release that changes a watched zone
- **THEN** both notices are shown, each with its own Reload
- **AND** the Reload of the zone rules update notice switches to the waiting build

#### Scenario: Reload applies a silent update too
- **GIVEN** a build with the running build's app revision is waiting and the update notice is not shown
- **WHEN** the zone rules update notice is shown and the user chooses Reload
- **THEN** the app switches to the waiting build

#### Scenario: Russian notice
- **GIVEN** the interface language is Russian and the list holds Lisbon
- **WHEN** a check finds the newer release `2026g`, which changes the rules of `Europe/Lisbon`
- **THEN** the notice reads «Доступны правила часовых поясов 2026g. Перезагрузите, чтобы применить.»

#### Scenario: No accessibility violations
- **WHEN** the zone rules update notice is shown in the `<theme>` theme
- **THEN** axe-core reports no violations

| theme |
|---|
| light |
| dark |
