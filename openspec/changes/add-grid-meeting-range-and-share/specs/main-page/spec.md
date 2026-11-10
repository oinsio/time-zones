## MODIFIED Requirements

### Requirement: Header actions
The header SHALL hold the Add location button, which opens the location search, and the settings button, which opens the settings page (see the `settings` capability). On every width the header MUST show, from left to right, the Add location button, the app title and the settings button. The Add location button MUST be an icon-only "+" in the accent colour on every width, with no visible text, and MUST be the leftmost control of the header. The centre of the app title MUST be the centre of the page width, within 1 px, on every width. The settings button MUST be the rightmost control of the header on every width. It shows the settings (sliders) icon in the accent colour and has the accessible name "Settings" («Настройки»). The Add location button's accessible name MUST be "Add location" («Добавить место») on every width. While the stored location list is unreadable, the Add location button MUST NOT be shown; the settings button MUST stay at the right and the title MUST stay centred. The slash shortcut MUST keep opening the search, and the content region MUST NOT show a second Add location button. Both buttons MUST be at least 44 × 44 px, and Tab MUST reach them in their visual order. The page MUST NOT scroll horizontally at 320 px and 2560 px. axe-core MUST report no violations with the header in the light and the dark theme at 375 px and 1024 px. The approved screenshots of the main page states MUST show this header. While the meeting bar is shown (`grid-view` → Meeting bar: a meeting range is set and the Grid view shows at least one row), it MUST take the place of the title and both buttons: the Add location button, the settings button and the title are not shown, and the slash shortcut opens nothing; once the meeting range is cleared or the view without the meeting bar is shown, this header comes back unchanged. <!-- implements FR1, FR2, NFR-A1, NFR-A2, NFR-A3, NFR-R1, NFR-R3, UX1 of add-settings-page-and-device-time-location; FR3, FR4, NFR-A1, NFR-R2, UX2 of fix-location-card-and-header-layout; FR13 of add-grid-meeting-range-and-share -->

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

#### Scenario: The meeting bar replaces the header
- **GIVEN** the interface language is Russian and the Grid view shows Almaty and Moscow
- **WHEN** the user sets a meeting range
- **THEN** the header shows the meeting bar and no button named «Добавить место» or «Настройки» and no title «Часовые пояса»
- **AND** pressing `/` opens no search
- **WHEN** the user clears the meeting range
- **THEN** the header shows, from left to right, the "+" button named «Добавить место», the title «Часовые пояса» and the button named «Настройки»

#### Scenario: Cards keeps its header with a meeting range
- **GIVEN** a meeting range was set in the Grid view
- **WHEN** the view mode becomes Cards (chosen in another tab)
- **THEN** the header shows the "+" button, the title «Часовые пояса» and the settings button

### Requirement: View contract runs every scenario for every registered view
The view-contract scenarios SHALL run once for every view of the registry, each run showing its view through the stored view mode, independent of the viewport width. A contract scenario that a view cannot pass yet because a part of its design is not built MAY be excluded for that view only, by a marker on the scenario that names the view and the change that brings the scenario back; the run of every other view MUST still include it. No scenario is excluded for any registered view by a pending marker: Grid runs every `@view-contract` scenario, "Select a time" included. A contract scenario tagged `@meeting-range` belongs to the meeting range capability (ADR-0011) and is not a pending exclusion: it MUST run for every view whose registry entry shows the meeting range (`showsMeetingRange`) and for no other view, and a view without that flag MUST still run every other contract scenario. <!-- implements FR8, NFR-A2 of add-view-mode-setting-and-grid-skeleton; FR13 of add-grid-hour-cells-and-hour-frame; FR17 of add-grid-meeting-range-and-share -->

#### Scenario: One contract run per registered view
- **WHEN** the end-to-end projects are listed
- **THEN** there is one view-contract project for Cards and one for Grid
- **AND** the Grid project opens the app with the view mode Grid and fails unless Grid is shown

#### Scenario: Grid runs every contract scenario
- **WHEN** the view contract runs for Grid
- **THEN** every `@view-contract` scenario runs, "Select a time" included
- **AND** no `@view-contract` scenario carries a pending exclusion marker

#### Scenario: Meeting scenarios run only for views that show the meeting range
- **GIVEN** the Grid registry entry shows the meeting range and the Cards entry does not
- **WHEN** the end-to-end projects are listed
- **THEN** the Grid view-contract project lists the `@meeting-range` scenario "Set, resize, share and clear"
- **AND** the Cards view-contract project does not list it and lists every other `@view-contract` scenario
