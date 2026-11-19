## ADDED Requirements

### Requirement: Content column
The header, the content region and the group of the date bar SHALL sit in one column of at most 1120 px, centred in the viewport; the page MUST NOT stretch them to the full width. Below 1120 px the column is the viewport width minus the side paddings of each page part. The date bar keeps the page background across the whole viewport width and stays stuck to the bottom of the viewport. This holds in every page state (loading, error, empty, storage unavailable) and in both views. Inputs: the viewport width. Output: the column's position and width. Errors: none. <!-- implements FR12, NFR-R1, UX4 of redesign-cards-grid-and-day-palettes -->

#### Scenario: The column is centred on a wide screen
- **GIVEN** the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the main page is `<width>` px wide in the `<view>` view
- **THEN** the header, the list and the date bar group are at most 1120 px wide
- **AND** their centre is the centre of the page width, within 1 px
- **AND** the page does not scroll horizontally

| width | view |
|---|---|
| 1440 | Cards |
| 2560 | Cards |
| 1440 | Grid |
| 2560 | Grid |

#### Scenario: The empty state sits in the column
- **GIVEN** the stored location list is empty
- **WHEN** the main page is 2560 px wide
- **THEN** the empty-state explanation lies inside a centred column at most 1120 px wide

## MODIFIED Requirements

### Requirement: Header actions
The header SHALL hold the Add location button, which opens the location search, and the settings button, which opens the settings page (see the `settings` capability). On every width the header MUST show the app title at the left and, at the right, the Add location button followed by the settings button. The title MUST be 27 px with weight 700, and 23 px up to 360 px wide. The Add location button MUST show the Lucide `Plus` icon and the settings button the Lucide `Settings` icon (the gear), both 27 px, in the accent colour of the active theme, with no visible text, each in a target of at least 44 × 44 px. The header MUST have no divider line under it. The settings button has the accessible name "Settings" («Настройки») and the Add location button "Add location" («Добавить место») on every width. While the stored location list is unreadable, the Add location button MUST NOT be shown; the title MUST stay at the left and the settings button at the right. The slash shortcut MUST keep opening the search, and the content region MUST NOT show a second Add location button. Tab MUST reach the Add location button before the settings button, which is their visual order. The page MUST NOT scroll horizontally at 320 px and 2560 px. axe-core MUST report no violations with the header in the light and the dark theme at 375 px and 1024 px. The approved screenshots of the main page states MUST show this header. While the meeting bar is shown (`grid-view` → Meeting bar: a meeting range is set and the Grid view shows at least one row), it MUST take the place of the title and both buttons, keeping its built layout: the Add location button, the settings button and the title are not shown, and the slash shortcut opens nothing; once the meeting range is cleared or the view without the meeting bar is shown, this header comes back unchanged. <!-- implements FR1, FR2, NFR-A1, NFR-A2, NFR-A3, NFR-R1, NFR-R3, UX1 of add-settings-page-and-device-time-location; FR13 of add-grid-meeting-range-and-share; FR6, NFR-A3, NFR-R1 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Header order on every width
- **GIVEN** the interface language is Russian
- **WHEN** the page is `<width>` px wide
- **THEN** the header shows, from left to right, the title «Часовые пояса», the button named «Добавить место» and the button named «Настройки»
- **AND** the title starts at the left edge of the content column and the settings button ends at its right edge
- **AND** both buttons show an icon in the accent colour and no visible text
- **AND** the header has no bottom border

| width |
|---|
| 320 |
| 390 |
| 768 |
| 1024 |
| 1440 |
| 2560 |

#### Scenario: Title size by width
- **WHEN** the page is `<width>` px wide
- **THEN** the title's font size is `<size>` px and its weight 700

| width | size |
|---|---|
| 320 | 23 |
| 360 | 23 |
| 390 | 27 |
| 1024 | 27 |

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
- **THEN** both header buttons are at least 44 × 44 px and their icons 27 px
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
- **AND** the header shows the title at the left, the settings button at the right and no Add location button

| width |
|---|
| 375 |
| 1024 |
| 2560 |

#### Scenario: The meeting bar replaces the header
- **GIVEN** the interface language is Russian and the Grid view shows Almaty and Moscow
- **WHEN** the user sets a meeting range
- **THEN** the header shows the meeting bar and no button named «Добавить место» or «Настройки» and no title «Часовые пояса»
- **AND** pressing `/` opens no search
- **WHEN** the user clears the meeting range
- **THEN** the header shows, from left to right, the title «Часовые пояса», the button named «Добавить место» and the button named «Настройки»

#### Scenario: Cards keeps its header with a meeting range
- **GIVEN** a meeting range was set in the Grid view
- **WHEN** the view mode becomes Cards (chosen in another tab)
- **THEN** the header shows the title «Часовые пояса», the "+" button and the settings button

### Requirement: Grid view rows
The Grid view SHALL show the location rows in list order, all inside one panel separated by dividers. The panel MUST have the surface token background of the active theme, a 1 px border in the card border token colour, a radius of 14 px, and dividers in the card border token colour; from 768 px it sits in the content column (see "Content column"). Each row MUST be the shared row header — home or Here mark, city, offset difference, zone line, local time and date, location menu, and no drag handle — followed by its hour strip (`grid-view` → Hour cells of the reference day) and then by its row note when it has one; it MUST NOT contain a day track. From 768 px the row header MUST be one line: the mark (20 px), the city (22 px, weight 700), the offset difference and the zone line (14 px) on the left, then the date (14 px), the time (26 px, weight 700) and the location menu on the right. Below 768 px the row header MUST take two lines: the city (20 px) and the offset difference on the left and the time (24 px) on the right on the first line, the zone line on the left and the date on the right on the second. The date bar MUST stay under the view. In Grid the user MUST be able to add and remove a location, set and clear home, reorder the list (by the grab area and by the location menu, see the `locations` capability), type an exact time into a row's time, select a time on an hour strip, change the date with the date bar and return to now. An open location menu of any grid row MUST be shown whole and above the other rows: the panel's horizontal scrolling MUST NOT clip it, and the next row's header MUST NOT cover it. Grid MUST show the same empty state, location load error, loading state and view error as Cards, and MUST work offline without a note. The page MUST NOT scroll horizontally at 320 px and at 2560 px; only the hour strips may. Inputs: the presented location rows and their hour strips. Output: one grid row per location. Errors: an unreadable stored list shows the load error with Reset. <!-- implements FR7, NFR-R1, UX3 of add-view-mode-setting-and-grid-skeleton; FR1, FR7, NFR-R2, NFR-R3, NFR-R4, UX1 of add-grid-hour-cells-and-hour-frame; FR15, FR17, NFR-R1 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Rows in one panel with hour strips
- **GIVEN** the view mode is Grid and the stored locations are Almaty and Moscow
- **WHEN** the main page is shown
- **THEN** the Grid view shows the rows of Almaty and Moscow, in this order, inside one panel
- **AND** every row has an hour strip after its row header and no day track
- **AND** no row shows a drag handle

#### Scenario: Row notes after the hour strip
- **GIVEN** the view mode is Grid, the current time is `2026-03-08T07:30:00Z` and the stored location is New York
- **WHEN** the main page is shown
- **THEN** New York's clock change note comes after its hour strip, in the document and on the screen

#### Scenario: The location menu of a grid row is fully visible
- **GIVEN** the view mode is Grid and the stored locations are Almaty, Moscow, Kolkata and New York
- **AND** the main page is `<width>` by `<height>` px
- **WHEN** the user opens the location menu of `<city>`
- **THEN** the whole menu lies inside the viewport
- **AND** at the centre of every menu item the topmost element is that item

| width | height | city |
|---|---|---|
| 1440 | 900 | Almaty |
| 1440 | 900 | New York |
| 390 | 844 | New York |

#### Scenario: Grid row header in one line
- **GIVEN** the view mode is Grid and the stored locations are Almaty and Moscow
- **WHEN** the main page is 1024 px wide
- **THEN** the zone line of Almaty is on the same line as its city
- **AND** the date of Almaty is on the same line as its time and before it
- **AND** the city is 22 px and the time 26 px, both weight 700

#### Scenario: Grid row header in two lines on a phone
- **GIVEN** the view mode is Grid and the stored locations are Almaty and Moscow
- **WHEN** the main page is 390 px wide
- **THEN** the time of Almaty is on the line of its city, right of it
- **AND** the date of Almaty is on the line of its zone line, under its time
- **AND** the city is 20 px and the time 24 px

#### Scenario: The Grid panel uses the card tokens
- **GIVEN** the view mode is Grid, the stored locations are Almaty and Moscow, and the `<theme>` theme is active
- **WHEN** the main page is shown
- **THEN** the panel's background is the `<theme>` surface token colour and its radius 14 px
- **AND** the panel's border and the divider between the rows are the `<theme>` card border token colour

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
- **WHEN** the main page is `<width>` px wide in the `<format>` format
- **THEN** the page does not scroll horizontally

| width | format |
|---|---|
| 320 | 24-hour |
| 390 | 12-hour |
| 768 | 24-hour |
| 820 | 12-hour |
| 1024 | 24-hour |
| 1440 | 12-hour |
| 2560 | 24-hour |

#### Scenario: Approved Grid screenshots
- **GIVEN** the view mode is Grid, the interface language is Russian, the current time is `2026-03-08T07:30:00Z`, the stored locations are Almaty, Moscow, Kolkata and New York and home is Almaty
- **WHEN** the main page is rendered at `<width>` by `<height>` px in the `<theme>` theme with the `<palette>` day palette
- **THEN** it matches the approved screenshot, re-taken once for the redesign

| width | height | theme | palette |
|---|---|---|---|
| 1440 | 900 | light | Vivid |
| 1440 | 900 | dark | Vivid |
| 1440 | 900 | dark | Muted |
| 1180 | 820 | light | Vivid |
| 1180 | 820 | dark | Vivid |
| 844 | 390 | light | Vivid |
| 844 | 390 | dark | Vivid |
| 390 | 844 | light | Vivid |
| 390 | 844 | dark | Vivid |
