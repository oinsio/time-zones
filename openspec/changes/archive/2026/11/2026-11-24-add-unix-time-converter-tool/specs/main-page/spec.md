# Spec Delta

## MODIFIED Requirements

### Requirement: Header actions
The header SHALL hold the Add location button, which opens the location search, and the settings button, which opens the settings page (see the `settings` capability). On every width the header MUST show the app title at the left and, at the right, the Add location button followed by the settings button; between them it MUST show the tool buttons of the enabled tools that have a page, in registry order (see the `tools` capability), and with no such tool nothing stands between them. The title MUST be 27 px with weight 700, and 23 px up to 360 px wide. While at least one tool button is shown, the title MUST instead be 20 px up to 337 px wide, 23 px from 338 px to 367 px and 27 px from 368 px, so that it stays on one line; with no tool button its sizes do not change. The Add location button MUST show the Lucide `Plus` icon and the settings button the Lucide `Settings` icon (the gear), and each tool button its tool's icon, all 27 px, in the accent colour of the active theme, with no visible text, each in a target of at least 44 × 44 px. The header MUST have no divider line under it. The settings button has the accessible name "Settings" («Настройки») and the Add location button "Add location" («Добавить место») on every width. While the stored location list is unreadable, the Add location button MUST NOT be shown; the title MUST stay at the left and the settings button at the right. The slash shortcut MUST keep opening the search, and the content region MUST NOT show a second Add location button. Tab MUST reach the Add location button, then the tool buttons, then the settings button, which is their visual order. The page MUST NOT scroll horizontally at 320 px and 2560 px. axe-core MUST report no violations with the header in the light and the dark theme at 375 px and 1024 px. The approved screenshots of the main page states MUST show this header. While the meeting bar is shown (`grid-view` → Meeting bar: a meeting range is set and the Grid view shows at least one row), it MUST take the place of the title and every header button, keeping its built layout: the Add location button, the tool buttons, the settings button and the title are not shown, and the slash shortcut opens nothing; once the meeting range is cleared or the view without the meeting bar is shown, this header comes back unchanged. <!-- implements FR1, FR2, NFR-A1, NFR-A2, NFR-A3, NFR-R1, NFR-R3, UX1 of add-settings-page-and-device-time-location; FR13 of add-grid-meeting-range-and-share; FR6, NFR-A3, NFR-R1 of redesign-cards-grid-and-day-palettes; FR4, NFR-A1, NFR-R1, UX3 of add-unix-time-converter-tool -->

#### Scenario: Narrow header
- **GIVEN** the interface language is Russian
- **WHEN** the page is `<width>` px wide
- **THEN** the header shows, from left to right, the title «Часовые пояса», the button named «Добавить место» and the button named «Настройки»
- **AND** both buttons show an icon in the accent colour and no visible text
- **AND** the header has no bottom border

| width |
|---|
| 320 |
| 390 |

#### Scenario: Wide header
- **GIVEN** the interface language is Russian
- **WHEN** the page is `<width>` px wide
- **THEN** the header shows, from left to right, the title «Часовые пояса», the button named «Добавить место» and the button named «Настройки»
- **AND** the title starts at the left edge of the content column and the settings button ends at its right edge
- **AND** both buttons show an icon in the accent colour and no visible text
- **AND** the header has no bottom border

| width |
|---|
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
- **THEN** the header shows the meeting bar and no button named «Добавить место» or «Настройки», no tool button and no title «Часовые пояса»
- **AND** pressing `/` opens no search
- **WHEN** the user clears the meeting range
- **THEN** the header shows, from left to right, the title «Часовые пояса», the button named «Добавить место» and the button named «Настройки»

#### Scenario: Cards keeps its header with a meeting range
- **GIVEN** a meeting range was set in the Grid view
- **WHEN** the view mode becomes Cards (chosen in another tab)
- **THEN** the header shows the title «Часовые пояса», the "+" button and the settings button

#### Scenario: Header with a tool button
- **GIVEN** the interface language is Russian and the tool «Конвертер Unix-времени» is enabled
- **WHEN** the page is `<width>` px wide
- **THEN** the header shows, from left to right, the title «Часовые пояса» and the buttons named «Добавить место», «Конвертер Unix-времени» and «Настройки»
- **AND** the three buttons show a 27 px icon in the accent colour and no visible text, each in a target of at least 44 × 44 px
- **AND** the page does not scroll horizontally

| width |
|---|
| 320 |
| 390 |
| 1024 |
| 2560 |

#### Scenario: Title size with a tool button
- **GIVEN** the interface language is Russian and the tool «Конвертер Unix-времени» is enabled
- **WHEN** the page is `<width>` px wide
- **THEN** the title's font size is `<size>` px, its weight 700, and the title «Часовые пояса» stays on one line

| width | size |
|---|---|
| 320 | 20 |
| 337 | 20 |
| 338 | 23 |
| 367 | 23 |
| 368 | 27 |
| 1024 | 27 |

#### Scenario: The meeting bar hides the tool buttons
- **GIVEN** the tool «Конвертер Unix-времени» is enabled and the Grid view shows Almaty and Moscow
- **WHEN** the user sets a meeting range
- **THEN** the header shows the meeting bar and no button named «Конвертер Unix-времени»
- **WHEN** the user clears the meeting range
- **THEN** the header shows the button «Конвертер Unix-времени» between «Добавить место» and «Настройки»
