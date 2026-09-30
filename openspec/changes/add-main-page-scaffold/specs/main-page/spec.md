## ADDED Requirements

### Requirement: Main page regions
The main page SHALL consist of a header with the app title as the only page heading and an empty slot for future controls, a content region hosting the active view, an empty bottom bar slot, and a polite notices region, out of the document flow, that keeps the offline-ready and update notices and stacks the update-check-failed note and the storage warning with them. <!-- implements FR1, UX3 of add-main-page-scaffold -->

#### Scenario: User opens the app
- **WHEN** the user opens the app
- **THEN** the header shows the app title as the only heading
- **AND** the content region shows the active view

#### Scenario: Notices stay available
- **WHEN** a new version becomes available while a view is shown
- **THEN** the update notice is announced politely in the notices region

#### Scenario: Header keeps its position
- **WHEN** the page shows the update-check-failed note or the storage warning
- **THEN** the header keeps its position

### Requirement: View host resolves the active view
The view host SHALL choose the view from the registry and the view mode. For `AUTO` it MUST pick the registered view with the largest minimum width not exceeding the container width, or the view with the smallest minimum width when none fits. A view id missing from the registry MUST resolve as `AUTO`. The host MUST re-resolve when the container width changes, without reloading the page. <!-- implements FR2, FR4 of add-main-page-scaffold -->

#### Scenario: Wide container picks the wider view
- **GIVEN** two registered views with minimum widths 0 px and 768 px
- **WHEN** the container is 1024 px wide in `AUTO` mode
- **THEN** the view with the 768 px minimum is shown

#### Scenario: Narrow container picks the narrower view
- **GIVEN** two registered views with minimum widths 0 px and 768 px
- **WHEN** the container is 320 px wide in `AUTO` mode
- **THEN** the view with the 0 px minimum is shown

#### Scenario: Only one view registered
- **WHEN** the container is 320 px wide in `AUTO` mode and only Cards is registered
- **THEN** the Cards view is shown

#### Scenario: Unknown view id
- **WHEN** the mode is a view id that is not registered
- **THEN** the host behaves as in `AUTO` mode

#### Scenario: Container is resized
- **WHEN** the container width crosses the minimum width of another registered view
- **THEN** the host shows that view without reloading the page

### Requirement: Cards view is registered and lazy
The registry SHALL contain the Cards view with a title key present in every locale file. Its component MUST be loaded lazily. <!-- implements FR3, NFR-P1 of add-main-page-scaffold -->

#### Scenario: Registry content
- **WHEN** the registry is read
- **THEN** it contains exactly one view, Cards

#### Scenario: Second view needs no page change
- **WHEN** a test view is added to the registry
- **THEN** the host can resolve to it without any change to the main page

### Requirement: Loading state
While the active view loads, the content region SHALL show a skeleton, and the header and notices MUST remain visible. <!-- implements FR5, UX1 of add-main-page-scaffold -->

#### Scenario: View is loading
- **WHEN** the active view has not finished loading
- **THEN** a skeleton is shown in the content region
- **AND** the app title is visible

### Requirement: Error state with retry
If the active view throws while rendering or fails to load, the content region SHALL show an error message with a Retry action and the rest of the page MUST stay usable. Retry MUST render the view again. <!-- implements FR6, NFR-A2, UX1 of add-main-page-scaffold -->

#### Scenario: View fails
- **WHEN** the active view fails to load
- **THEN** an error message with a Retry action is announced
- **AND** the app title stays visible

#### Scenario: User retries
- **GIVEN** the view failed and the failure cause is gone
- **WHEN** the user activates Retry
- **THEN** the view is shown

#### Scenario: User retries from the keyboard
- **GIVEN** the view failed and the failure cause is gone
- **WHEN** the user reaches Retry with Tab and presses Enter
- **THEN** the view is shown
- **AND** focus was not moved when the error appeared

### Requirement: Empty state
When there are no locations, the Cards view SHALL show an explanation that no locations are added. It MUST NOT show an action that does nothing. <!-- implements FR7, UX1 of add-main-page-scaffold -->

#### Scenario: First launch
- **WHEN** the user opens the app with no locations
- **THEN** the explanation is shown in the current language

### Requirement: Offline note
While the browser is offline, the page SHALL show a short non-blocking note that the app works offline, announced politely and without taking focus. The note MUST disappear when the connection returns. <!-- implements FR8, NFR-A2 of add-main-page-scaffold -->

#### Scenario: Connection lost
- **WHEN** the browser goes offline
- **THEN** the offline note is announced politely
- **AND** the view stays usable

#### Scenario: Connection restored
- **WHEN** the browser goes back online
- **THEN** the offline note disappears

### Requirement: Storage unavailable warning
When local storage cannot be used, the page SHALL show a warning that changes will not be saved, and the app MUST keep working. <!-- implements FR9, NFR-A2 of add-main-page-scaffold -->

#### Scenario: Private mode
- **WHEN** writing to local storage fails
- **THEN** the warning is shown
- **AND** the view is still shown

### Requirement: Page strings are localized
Every main page string SHALL exist in English and Russian, and both locale files MUST keep identical key sets. <!-- implements FR10 of add-main-page-scaffold -->

#### Scenario: Russian user sees the empty state
- **WHEN** the active language is Russian and there are no locations
- **THEN** the explanation is shown in Russian

### Requirement: Accessible and responsive main page
The main page in each state (loading, error, empty, offline, storage unavailable) SHALL have no automated accessibility violations in light and dark themes, and MUST NOT scroll horizontally from 320 px to 2560 px. <!-- implements NFR-A1, NFR-R1, UX2 of add-main-page-scaffold -->

#### Scenario: Accessibility check
- **WHEN** each state is checked with axe-core in light and dark theme
- **THEN** no violations are reported

#### Scenario: Narrow and wide screens
- **WHEN** the page is opened at 320 px and 2560 px in each state
- **THEN** there is no horizontal scrolling
