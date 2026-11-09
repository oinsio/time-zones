## ADDED Requirements

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

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: View host resolves the active view
**Reason**: The view is no longer chosen by container width: `AUTO`, the minimum width per view and re-resolving on resize are removed (FR5, FR6 of add-view-mode-setting-and-grid-skeleton; ADR-0012 by handoff H1).
**Migration**: Replaced by "View host shows the chosen view": the host shows the view of the view mode, and Cards when none is chosen or the chosen id is not registered.
