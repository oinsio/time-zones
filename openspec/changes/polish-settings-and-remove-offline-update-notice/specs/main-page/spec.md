## ADDED Requirements

### Requirement: Offline without notes
While the browser is offline, in airplane mode included, the main page SHALL keep working with the same content and MUST NOT show any note because of the missing network or because a check for a new version failed. Going offline and coming back online MUST NOT show or remove anything in the notices region. The update notice, the offline-ready notice and the storage warning keep their own rules. Inputs: the network state, the result of the update check. Output: none. Errors: none. <!-- implements FR7, FR8, UX3 of polish-settings-and-remove-offline-update-notice -->

#### Scenario: Update cannot be fetched
- **GIVEN** the app was installed on an earlier visit
- **WHEN** the user opens it offline and its check for a new version fails
- **THEN** the notices region shows nothing
- **AND** the view is shown

#### Scenario: Going offline and back online
- **GIVEN** the user has opened the app
- **WHEN** the browser goes offline and then back online
- **THEN** the notices region shows nothing

## MODIFIED Requirements

### Requirement: Main page regions
The main page SHALL consist of a header with the app title as the only page heading, the Add location button and the settings button (see "Header actions"), a content region hosting the active view, a bottom bar holding the date bar (see the `date-selection` capability) that stays at the bottom of the viewport and is the page's footer landmark, and a polite notices region, out of the document flow, that keeps the offline-ready and update notices and stacks the storage warning with them. The notices region MUST sit above the bottom bar and MUST NOT cover it. <!-- implements FR1, UX3 of add-main-page-scaffold; FR8 of select-date-with-calendar-and-now; FR1, FR2 of add-settings-page-and-device-time-location; FR7 of polish-settings-and-remove-offline-update-notice -->

#### Scenario: User opens the app
- **WHEN** the user opens the app
- **THEN** the header shows the app title as the only heading, the Add location button and the settings button
- **AND** the content region shows the active view
- **AND** the bottom bar shows the date bar

#### Scenario: Notices stay available
- **WHEN** a new version becomes available while a view is shown
- **THEN** the update notice is announced politely in the notices region
- **AND** the bottom bar still shows the date bar

#### Scenario: Header keeps its position
- **WHEN** the page shows the storage warning
- **THEN** the header keeps its position

## REMOVED Requirements

### Requirement: Update check failed note
**Reason**: The note shown when the latest version could not be fetched offline told the user nothing useful in an offline-first app and covered part of the page (FR7, FR8 of polish-settings-and-remove-offline-update-notice).
**Migration**: None. "Offline without notes" states the new behaviour: offline and a failed update check show nothing.
