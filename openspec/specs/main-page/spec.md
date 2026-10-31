# main-page Specification

## Purpose
The main page of the app: the page frame (header, content region hosting the active view, bottom bar slot, notices region) that later MVP features plug into.

## Requirements

### Requirement: Main page regions
The main page SHALL consist of a header with the app title as the only page heading, the Add location button and the settings button (see "Header actions"), a content region hosting the active view, a bottom bar holding the date bar (see the `date-selection` capability) that stays at the bottom of the viewport and is the page's footer landmark, and a polite notices region, out of the document flow, that keeps the offline-ready and update notices and stacks the update-check-failed note and the storage warning with them. The notices region MUST sit above the bottom bar and MUST NOT cover it. <!-- implements FR1, UX3 of add-main-page-scaffold; FR8 of select-date-with-calendar-and-now; FR1, FR2 of add-settings-page-and-device-time-location -->

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
When the location list is empty, the Cards view SHALL show an explanation that no locations are added, and the header's Add location button MUST stay available to open the search. The explanation MUST NOT be shown while the list holds any location, including when it holds only the device time location. The content region MUST NOT show an action that does nothing, and showing the empty state MUST NOT write the location list. <!-- implements FR7, UX1 of add-main-page-scaffold; FR17 of add-locations-via-search; FR2, FR13 of add-settings-page-and-device-time-location -->

#### Scenario: Empty list
- **GIVEN** the stored location list is empty
- **WHEN** the user opens the app
- **THEN** the explanation is shown in the current language
- **AND** no location row is shown
- **AND** the header shows the Add location button

#### Scenario: First launch
- **GIVEN** no location list is stored
- **WHEN** the user opens the app
- **THEN** the device time location is shown
- **AND** the explanation is not shown

#### Scenario: No explanation with locations
- **GIVEN** the stored list is the device time location and Moscow
- **WHEN** the user opens the app
- **THEN** the explanation is not shown

#### Scenario: Add location from the empty state
- **GIVEN** the location list is empty
- **WHEN** the user chooses the header's Add location button
- **THEN** the search opens with popular suggestions

### Requirement: Update check failed note
While the browser is offline, the page MUST keep working with the same content and MUST NOT show a note because of the missing network alone. When a check for a new version fails because the network is unreachable, the page SHALL show a short non-blocking note that the latest version could not be fetched, announced politely and without taking focus. The note MUST disappear when the connection returns. <!-- implements FR8, NFR-A2 of add-main-page-scaffold -->

#### Scenario: Update cannot be fetched
- **WHEN** the app checks for a new version while offline
- **THEN** the note is announced politely
- **AND** the view stays usable

#### Scenario: Offline without a pending check
- **WHEN** the browser goes offline
- **THEN** no note is shown

#### Scenario: Connection restored
- **WHEN** the browser goes back online
- **THEN** the update-check-failed note disappears

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

### Requirement: Header actions
The header SHALL hold the Add location button, which opens the location search, and the settings button, which opens the settings page (see the `settings` capability). The settings button MUST be the rightmost control of the header on every width. It shows the settings (sliders) icon in the accent colour and has the accessible name "Settings" («Настройки»). Below 768 px the Add location button MUST be an icon-only "+" in the accent colour, placed before the title, with the title centred between the two buttons. From 768 px it MUST show "+" and the visible label "Add" («Добавить»), placed right of the title and directly before the settings button, with the title at the left. The Add location button's accessible name MUST be "Add location" («Добавить место») on every width. While the stored location list is unreadable, the Add location button MUST NOT be shown; the settings button MUST stay. The slash shortcut MUST keep opening the search, and the content region MUST NOT show a second Add location button. Both buttons MUST be at least 44 × 44 px, and Tab MUST reach them in their visual order. The page MUST NOT scroll horizontally at 320 px and 2560 px. axe-core MUST report no violations with the narrow and the wide header in the light and the dark theme. The approved screenshots of the main page states MUST show the new header. <!-- implements FR1, FR2, NFR-A1, NFR-A2, NFR-A3, NFR-R1, NFR-R3, UX1 of add-settings-page-and-device-time-location -->

#### Scenario: Narrow header
- **GIVEN** the interface language is Russian
- **WHEN** the page is 375 px wide
- **THEN** the header shows, from left to right, the "+" button named «Добавить место», the title «Часовые пояса» and the button named «Настройки»
- **AND** the "+" button shows no visible text

#### Scenario: Wide header
- **GIVEN** the interface language is Russian
- **WHEN** the page is 1024 px wide
- **THEN** the header shows the title «Часовые пояса» at the left, then the button «Добавить» named «Добавить место», then the button named «Настройки» at the right

#### Scenario: The header opens the search and the settings
- **WHEN** the user chooses the Add location button
- **THEN** the search opens
- **WHEN** the user closes the search and chooses the settings button
- **THEN** the settings page is shown

#### Scenario: Slash still opens the search
- **GIVEN** the focus is not in a text field
- **WHEN** the user presses `/`
- **THEN** the search opens

#### Scenario: One Add location button
- **GIVEN** the stored list is Moscow
- **WHEN** the user opens the app
- **THEN** exactly one button is named "Add location"

#### Scenario: Header sizes and accessibility
- **WHEN** the page is `<width>` px wide in the `<theme>` theme
- **THEN** both header buttons are at least 44 × 44 px
- **AND** axe-core reports no violations

| width | theme |
|---|---|
| 375 | light |
| 375 | dark |
| 1024 | light |
| 1024 | dark |

#### Scenario: No Add location button on an unreadable list
- **GIVEN** the stored list is unreadable
- **WHEN** the user opens the app
- **THEN** the load error with Reset is shown
- **AND** the header shows the settings button and no Add location button
