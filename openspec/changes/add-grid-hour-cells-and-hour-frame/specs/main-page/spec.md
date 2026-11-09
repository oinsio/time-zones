## ADDED Requirements

### Requirement: Grid view rows
The Grid view SHALL show the location rows in list order, all inside one panel separated by dividers. Each row MUST have the surface token background of the active theme, and the panel's border the border token colour. Each row MUST be the shared row header — drag handle when the list can be reordered, home or Here mark, city, offset difference, zone line, local time and date, location menu — followed by its hour strip (`grid-view` → Hour cells of the reference day) and then by its row note when it has one; it MUST NOT contain a day track. From 768 px wide the row header MUST be one line: the city, the offset difference and the zone line on the left, then the date, the time and the location menu on the right. Below 768 px the row header MUST take two lines: the city and the offset difference on the left and the time on the right on the first line, the zone line on the left and the date on the right on the second. The date bar MUST stay under the view. In Grid the user MUST be able to add and remove a location, set and clear home, reorder the list, type an exact time into a row's time, select a time on an hour strip, change the date with the date bar and return to now. Grid MUST show the same empty state, location load error, loading state and view error as Cards, and MUST work offline without a note. The page MUST NOT scroll horizontally at 320 px and at 2560 px; only the hour strips may. Inputs: the presented location rows and their hour strips. Output: one grid row per location. Errors: an unreadable stored list shows the load error with Reset. <!-- implements FR7, NFR-R1, UX3 of add-view-mode-setting-and-grid-skeleton; FR1, FR7, NFR-R2, NFR-R3, NFR-R4, UX1 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: Rows in one panel with hour strips
- **GIVEN** the view mode is Grid and the stored locations are Almaty and Moscow
- **WHEN** the main page is shown
- **THEN** the Grid view shows the rows of Almaty and Moscow, in this order, inside one panel
- **AND** every row has an hour strip after its row header and no day track

#### Scenario: Row notes after the hour strip
- **GIVEN** the view mode is Grid, the current time is `2026-03-08T07:30:00Z` and the stored location is New York
- **WHEN** the main page is shown
- **THEN** New York's clock change note comes after its hour strip, in the document and on the screen

#### Scenario: Grid row header in one line
- **GIVEN** the view mode is Grid and the stored locations are Almaty and Moscow
- **WHEN** the main page is 1024 px wide
- **THEN** the zone line of Almaty is on the same line as its city
- **AND** the date of Almaty is on the same line as its time and before it

#### Scenario: Grid row header in two lines on a phone
- **GIVEN** the view mode is Grid and the stored locations are Almaty and Moscow
- **WHEN** the main page is 390 px wide
- **THEN** the time of Almaty is on the line of its city, right of it
- **AND** the date of Almaty is on the line of its zone line, under its time

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
- **AND** no hour strip and no hour frame are shown

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
- **GIVEN** the view mode is Grid, the interface language is Russian, the current time is `2026-03-08T07:30:00Z`, the stored locations are Almaty, Moscow, Kolkata and New York and home is Almaty
- **WHEN** the main page is rendered at `<width>` by `<height>` px in the `<theme>` theme
- **THEN** it matches the approved screenshot

| width | height | theme |
|---|---|---|
| 1440 | 900 | light |
| 1440 | 900 | dark |
| 1180 | 820 | light |
| 1180 | 820 | dark |
| 844 | 390 | light |
| 844 | 390 | dark |
| 390 | 844 | light |
| 390 | 844 | dark |

### Requirement: View contract runs every scenario for every registered view
The view-contract scenarios SHALL run once for every view of the registry, each run showing its view through the stored view mode, independent of the viewport width. A contract scenario that a view cannot pass yet because a part of its design is not built MAY be excluded for that view only, by a marker on the scenario that names the view and the change that brings the scenario back; the run of every other view MUST still include it. No scenario is excluded for any registered view: Grid runs every `@view-contract` scenario, "Select a time" included. <!-- implements FR8, NFR-A2 of add-view-mode-setting-and-grid-skeleton; FR13 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: One contract run per registered view
- **WHEN** the end-to-end projects are listed
- **THEN** there is one view-contract project for Cards and one for Grid
- **AND** the Grid project opens the app with the view mode Grid and fails unless Grid is shown

#### Scenario: Grid runs every contract scenario
- **WHEN** the view contract runs for Grid
- **THEN** every `@view-contract` scenario runs, "Select a time" included
- **AND** no `@view-contract` scenario carries a pending exclusion marker

## REMOVED Requirements

### Requirement: Grid view skeleton
**Reason**: Grid rows now carry their hour strips, so "MUST NOT contain … hour cells" and "below 768 px the city and the zone line MAY take two lines" no longer hold (FR1, FR7, NFR-R3 of add-grid-hour-cells-and-hour-frame).
**Migration**: Replaced by "Grid view rows": the same rows, panel, colours, states and offline behaviour, plus the hour strip after the row header, the row notes after the strip, the two-line row header below 768 px and the approved screenshots at four sizes.

### Requirement: View contract runs for every registered view
**Reason**: Grid no longer has a scenario excluded: "Select a time" runs for Grid through its hour strip (FR12, FR13 of add-grid-hour-cells-and-hour-frame).
**Migration**: Replaced by "View contract runs every scenario for every registered view": the same per-view runs and exclusion rule, with no scenario excluded for any view.
