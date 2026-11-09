# main-page Specification

## Purpose
The main page of the app: the page frame (header, content region hosting the active view, bottom bar slot, notices region) that later MVP features plug into.

## Requirements

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

### Requirement: Cards view is registered and lazy
The registry SHALL contain the Cards view and the Grid view, in this order, each with a title key present in every locale file. Their components MUST be loaded lazily, so a view that is not shown is not part of the initial JavaScript. <!-- implements FR3, NFR-P1 of add-main-page-scaffold; FR7, NFR-P1 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: Registry content
- **WHEN** the registry is read
- **THEN** it contains exactly two views, Cards and Grid, in this order

#### Scenario: Second view needs no page change
- **WHEN** a test view is added to the registry and chosen as the view mode
- **THEN** the host shows it without any change to the main page

#### Scenario: Grid is not loaded while Cards is shown
- **GIVEN** no view is chosen
- **WHEN** the main page is shown
- **THEN** the Grid component has not been requested

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
The header SHALL hold the Add location button, which opens the location search, and the settings button, which opens the settings page (see the `settings` capability). On every width the header MUST show, from left to right, the Add location button, the app title and the settings button. The Add location button MUST be an icon-only "+" in the accent colour on every width, with no visible text, and MUST be the leftmost control of the header. The centre of the app title MUST be the centre of the page width, within 1 px, on every width. The settings button MUST be the rightmost control of the header on every width. It shows the settings (sliders) icon in the accent colour and has the accessible name "Settings" («Настройки»). The Add location button's accessible name MUST be "Add location" («Добавить место») on every width. While the stored location list is unreadable, the Add location button MUST NOT be shown; the settings button MUST stay at the right and the title MUST stay centred. The slash shortcut MUST keep opening the search, and the content region MUST NOT show a second Add location button. Both buttons MUST be at least 44 × 44 px, and Tab MUST reach them in their visual order. The page MUST NOT scroll horizontally at 320 px and 2560 px. axe-core MUST report no violations with the header in the light and the dark theme at 375 px and 1024 px. The approved screenshots of the main page states MUST show this header. <!-- implements FR1, FR2, NFR-A1, NFR-A2, NFR-A3, NFR-R1, NFR-R3, UX1 of add-settings-page-and-device-time-location; FR3, FR4, NFR-A1, NFR-R2, UX2 of fix-location-card-and-header-layout -->

#### Scenario: Narrow header
- **GIVEN** the interface language is Russian
- **WHEN** the page is 375 px wide
- **THEN** the header shows, from left to right, the "+" button named «Добавить место», the title «Часовые пояса» and the button named «Настройки»
- **AND** the "+" button shows no visible text
- **AND** the centre of the title is the centre of the page width, within 1 px

#### Scenario: Wide header
- **GIVEN** the interface language is Russian
- **WHEN** the page is `<width>` px wide
- **THEN** the header shows, from left to right, the "+" button named «Добавить место», the title «Часовые пояса» and the button named «Настройки»
- **AND** the "+" button shows no visible text
- **AND** the centre of the title is the centre of the page width, within 1 px

| width |
|---|
| 768 |
| 1024 |
| 1440 |
| 2560 |

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
- **AND** Tab reaches the Add location button before the settings button
- **AND** axe-core reports no violations

| width | theme |
|---|---|
| 375 | light |
| 375 | dark |
| 1024 | light |
| 1024 | dark |

#### Scenario: No Add location button on an unreadable list
- **GIVEN** the stored list is unreadable
- **WHEN** the user opens the app at `<width>` px
- **THEN** the load error with Reset is shown
- **AND** the header shows the settings button at the right and no Add location button
- **AND** the centre of the title is the centre of the page width, within 1 px

| width |
|---|
| 375 |
| 768 |
| 1024 |
| 1440 |
| 2560 |

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

### Requirement: Grid view skeleton
The Grid view SHALL show the location rows in list order, all inside one panel separated by dividers. Each row MUST have the surface token background of the active theme, and the panel's border the border token colour. Each row MUST be the shared row header — drag handle when the list can be reordered, home or Here mark, city, offset difference, zone line, local time and date, location menu — followed by its row note when it has one, and MUST NOT contain a day track or hour cells. From 768 px wide the row header MUST be one line: the city, the offset difference and the zone line on the left, then the date, the time and the location menu on the right; below 768 px the city and the zone line MAY take two lines. The date bar MUST stay under the view. In Grid the user MUST be able to add and remove a location, set and clear home, reorder the list, type an exact time into a row's time, change the date with the date bar and return to now. Grid MUST show the same empty state, location load error, loading state and view error as Cards, and MUST work offline without a note. Grid MUST NOT scroll horizontally at 320 px and at 2560 px. Inputs: the presented location rows. Output: one grid row per location. Errors: an unreadable stored list shows the load error with Reset. <!-- implements FR7, NFR-R1, UX3 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: Rows in one panel without hour cells
- **GIVEN** the view mode is Grid and the stored locations are Almaty and Moscow
- **WHEN** the main page is shown
- **THEN** the Grid view shows the rows of Almaty and Moscow, in this order, inside one panel
- **AND** no row has a day track

#### Scenario: Grid row header in one line
- **GIVEN** the view mode is Grid and the stored locations are Almaty and Moscow
- **WHEN** the main page is 1024 px wide
- **THEN** the zone line of Almaty is on the same line as its city
- **AND** the date of Almaty is on the same line as its time and before it

#### Scenario: Grid rows use the theme token colours
- **GIVEN** the view mode is Grid, the stored locations are Almaty and Moscow, and the `<theme>` theme is active
- **WHEN** the main page is shown
- **THEN** each row's background is the `<theme>` surface token colour
- **AND** the panel's border is the `<theme>` border token colour

| theme |
|---|
| light |
| dark |

#### Scenario: Typing a time in Grid
- **GIVEN** the view mode is Grid, the current time is `2026-03-08T07:30:00Z` and the stored locations are Almaty and Moscow
- **WHEN** the user types `1145` into the time of Moscow
- **THEN** Almaty shows `13:45` and Moscow shows `11:45`

#### Scenario: Empty Grid
- **GIVEN** the view mode is Grid and the stored location list is empty
- **WHEN** the main page is shown
- **THEN** it shows the empty-state explanation
- **AND** the header "Add location" action is available

#### Scenario: Unreadable list in Grid
- **GIVEN** the view mode is Grid and the stored location list is unreadable
- **WHEN** the main page is shown
- **THEN** it shows the load error with a Reset action

#### Scenario: Grid works offline
- **GIVEN** the view mode is Grid, the current time is `2026-03-08T07:30:00Z`, the stored locations are Almaty and Moscow, and the app was installed for offline use on an earlier visit
- **WHEN** the user reopens the app without network
- **THEN** the Grid view shows the rows of Almaty and Moscow, and Almaty shows `12:30`
- **AND** no note or alert about the network is shown
- **WHEN** the user removes Moscow
- **THEN** the Grid view shows only the row of Almaty

#### Scenario: Grid fits narrow and wide screens
- **GIVEN** the view mode is Grid and the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the main page is `<width>` px wide
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 2560 |

#### Scenario: Approved Grid screenshots
- **GIVEN** the view mode is Grid, the current time is `2026-03-08T07:30:00Z` and the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the main page is rendered at 1024 px in the `<theme>` theme
- **THEN** it matches the approved screenshot

| theme |
|---|
| light |
| dark |

### Requirement: View contract runs for every registered view
The view-contract scenarios SHALL run once for every view of the registry, each run showing its view through the stored view mode, independent of the viewport width. A contract scenario that a view cannot pass yet because a part of its design is not built MAY be excluded for that view only, by a marker on the scenario that names the view and the change that brings the scenario back; the run of every other view MUST still include it. For Grid, exactly the scenario "Select a time" is excluded, until the hour cells change. <!-- implements FR8, NFR-A2 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: One contract run per registered view
- **WHEN** the end-to-end projects are listed
- **THEN** there is one view-contract project for Cards and one for Grid
- **AND** the Grid project opens the app with the view mode Grid and fails unless Grid is shown

#### Scenario: Grid skips only the marked scenario
- **WHEN** the view contract runs for Grid
- **THEN** every `@view-contract` scenario runs except "Select a time"
- **AND** the view contract for Cards runs "Select a time"

### Requirement: View host shows the chosen view
The view host SHALL show the view of the view mode: the registered view whose id is the chosen view, otherwise the default view, Cards. When no view is chosen or the chosen id is not registered, it MUST show Cards, or the first registered view when Cards is not registered. The choice MUST NOT depend on the container width, the viewport width or the screen orientation, and the host MUST NOT measure its width. A change of the view mode MUST show the new view without reloading the page. <!-- implements FR2, FR4 of add-main-page-scaffold; FR3, FR4, FR5, FR6 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: Chosen view is shown
- **GIVEN** Cards and Grid are registered
- **WHEN** the view mode is Grid
- **THEN** the Grid view is shown

#### Scenario: No view chosen
- **GIVEN** Cards and Grid are registered
- **WHEN** no view is chosen
- **THEN** the Cards view is shown

#### Scenario: Unknown view id
- **GIVEN** Cards and Grid are registered
- **WHEN** the view mode is a view id that is not registered
- **THEN** the Cards view is shown

#### Scenario: Width does not choose the view
- **GIVEN** Cards and Grid are registered and the view mode is Grid
- **WHEN** the container is 320 px wide and then 2560 px wide
- **THEN** the Grid view is shown both times

#### Scenario: View mode changes
- **GIVEN** the Cards view is shown
- **WHEN** the view mode becomes Grid
- **THEN** the host shows the Grid view without reloading the page
