# Spec Delta

## Purpose

Tools: optional capabilities of the app that a user turns on in the settings. The capability covers the tool registry, the tools group, the enabled tools kept on the device, the tool buttons of the header and the opening and leaving of a tool page.

Unless a scenario says otherwise, the interface language is Russian, nothing is stored in the preferences and the tool registry holds one tool, the Unix time converter («Конвертер Unix-времени»), which has a page.

## ADDED Requirements

### Requirement: Tool registry
The app SHALL keep one tool registry: the ordered list of the tools it offers. A tool has an id, a name in every interface language, an icon and, when it is a page, its tool page. The tools group and the header MUST list tools in registry order and MUST take every tool from the registry, so a tool added to the registry appears in the tools group with no other change. With an empty registry the tools group is not shown. <!-- implements FR1, G5 of add-unix-time-converter-tool -->

#### Scenario: A registered tool appears in the settings
- **WHEN** the user opens the settings page
- **THEN** the tools group shows exactly one toggle, named «Конвертер Unix-времени»

#### Scenario: Two tools keep registry order
- **GIVEN** a test registry with the tools A and B, in this order, both with a page and both enabled
- **WHEN** the main page is shown
- **THEN** the tools group lists A before B
- **AND** the header shows the tool button of A before the tool button of B

#### Scenario: Empty registry
- **GIVEN** a test registry with no tool
- **WHEN** the user opens the settings page
- **THEN** no group named «Инструменты» is shown
- **AND** the header shows the Add location button and the settings button only

### Requirement: Tools group
The settings page SHALL show the tools group, captioned «Инструменты» ("Tools"): one toggle per registered tool, shown by the tool's icon alone with no visible text. Each toggle MUST be independent: turning one on or off changes no other. Every tool MUST be off until the user turns it on. A toggle that is on has a pressed state; toggling takes effect at once, with no confirmation. Inputs: a toggle. Effects: the tool becomes enabled or disabled. Errors: none. <!-- implements FR2, G1, UX2 of add-unix-time-converter-tool -->

#### Scenario: Every tool is off at first
- **WHEN** the user opens the settings page for the first time
- **THEN** the toggle «Конвертер Unix-времени» is not pressed

#### Scenario: Turning a tool on and off
- **WHEN** the user turns on the toggle «Конвертер Unix-времени»
- **THEN** the toggle is pressed
- **WHEN** the user goes back to the main page
- **THEN** the header shows a button named «Конвертер Unix-времени»
- **WHEN** the user turns the toggle off in the settings and goes back
- **THEN** the header shows no button named «Конвертер Unix-времени»

#### Scenario: Toggles are independent
- **GIVEN** a test registry with the tools A and B, and A is on
- **WHEN** the user turns B on
- **THEN** A and B are both on
- **WHEN** the user turns A off
- **THEN** B stays on

#### Scenario: A toggle shows no text
- **WHEN** the settings page is shown
- **THEN** the toggle «Конвертер Unix-времени» shows an icon and no visible text

### Requirement: Enabled tools are kept on the device
The enabled tools SHALL be part of the preferences: kept on the device, read at the next start and shared between open tabs, as every other preference. A stored document written before this change MUST be read with no tool enabled and every other choice kept. A stored tool that is not in the registry MUST be ignored and MUST stay stored. Stored enabled tools that are not a list of non-empty texts make the document unreadable, as "Unreadable stored preferences" of `settings` describes. <!-- implements FR3 of add-unix-time-converter-tool -->

#### Scenario: Enabled tools survive a reload
- **GIVEN** the user turned on «Конвертер Unix-времени»
- **WHEN** the app is opened again
- **THEN** the header shows the button «Конвертер Unix-времени»

#### Scenario: A document from before this change
- **GIVEN** stored preferences of the previous schema version with the dark theme and the Grid view
- **WHEN** the app is opened
- **THEN** no tool is enabled
- **AND** the theme is dark and the view is Grid

#### Scenario: An unregistered stored tool
- **GIVEN** the stored enabled tools are `folders` and the Unix time converter, and `folders` is not registered
- **WHEN** the app is opened
- **THEN** the header shows exactly one tool button, «Конвертер Unix-времени»
- **WHEN** the user changes the theme
- **THEN** the stored enabled tools still hold `folders`

#### Scenario: Another tab turns a tool on
- **GIVEN** the app is open in two tabs with no tool enabled
- **WHEN** the user turns on «Конвертер Unix-времени» in the first tab
- **THEN** the header of the second tab shows the button «Конвертер Unix-времени»

#### Scenario: Unreadable enabled tools
- **GIVEN** the stored enabled tools are `<value>`
- **WHEN** the app is opened
- **THEN** the preferences are the defaults and no tool is enabled

| value |
|---|
| `"unixTimeConverter"` (a text, not a list) |
| `[""]` |
| `[1]` |

#### Scenario: Without storage
- **GIVEN** the storage is unavailable
- **WHEN** the user turns on «Конвертер Unix-времени»
- **THEN** the header shows its tool button until the app is closed
- **AND** the storage warning is shown as for every other preference

### Requirement: Tool buttons in the header
For every enabled tool that has a page, the header of the main page SHALL show one tool button, in registry order, between the Add location button and the settings button. A tool button MUST show the tool's icon with no visible text and MUST open its tool page. An enabled tool without a page adds no button. The header of a user with no enabled tool MUST be the same as before this change. <!-- implements FR4, G1, UX3 of add-unix-time-converter-tool -->

#### Scenario: No enabled tool
- **WHEN** the main page is shown
- **THEN** the header shows, from left to right, the title, the button «Добавить место» and the button «Настройки»

#### Scenario: One enabled tool
- **GIVEN** «Конвертер Unix-времени» is enabled
- **WHEN** the main page is shown
- **THEN** the header shows, from left to right, the title, «Добавить место», «Конвертер Unix-времени» and «Настройки»

#### Scenario: A tool without a page
- **GIVEN** a test registry with the enabled tool A, which has no page
- **WHEN** the main page is shown
- **THEN** the header shows no button named A

### Requirement: Open and leave a tool page
A tool button SHALL open its tool page. A tool page MUST show the tool's name as its only page heading and a back button «Назад» ("Back"), MUST NOT show the date bar, and MUST keep the notices region working. The back button and Esc MUST return to the main page with its locations and reference moment unchanged, and MUST move the focus to the tool button. A tool that is turned off while its page is shown MUST return the user to the main page. Inputs: a tool button, the back button, Esc. Output: the shown page. Errors: none. <!-- implements FR5, NFR-A2 of add-unix-time-converter-tool -->

#### Scenario: Open and leave
- **GIVEN** «Конвертер Unix-времени» is enabled and the reference moment is pinned to `2026-03-09T07:30:00Z`
- **WHEN** the user chooses the tool button
- **THEN** the page heading is «Конвертер Unix-времени» and the date bar is not shown
- **WHEN** the user leaves with `<way>`
- **THEN** the main page is shown with the reference moment still pinned to `2026-03-09T07:30:00Z`
- **AND** the focus is on the tool button

| way |
|---|
| the back button |
| Esc |

#### Scenario: Esc inside a field first restores the field
- **GIVEN** the tool page is shown and the user is typing in a field that restores its text on Esc
- **WHEN** the user presses Esc
- **THEN** the field restores its text and the tool page is still shown
- **WHEN** the user presses Esc again
- **THEN** the main page is shown

#### Scenario: Notices on a tool page
- **GIVEN** a new version of the app is available
- **WHEN** a tool page is shown
- **THEN** the update notice is announced in the notices region

#### Scenario: The tool is turned off in another tab
- **GIVEN** the tool page is shown in the first tab
- **WHEN** the user turns the tool off in the second tab
- **THEN** the first tab shows the main page and no tool button

### Requirement: A tool page loads on demand
A tool page SHALL NOT be part of the initial JavaScript of the main page: it is loaded when the user first opens it. While it loads, the page skeleton is shown. When loading fails, the page MUST show the error fallback of a view with Retry and the back button, and Retry MUST try again. Loading MUST work without a network once the app is offline-ready. <!-- implements NFR-P1, G6 of add-unix-time-converter-tool -->

#### Scenario: The page is not in the initial JavaScript
- **GIVEN** no tool is enabled
- **WHEN** the app is opened
- **THEN** no file of the Unix time converter is requested

#### Scenario: Loading fails, then succeeds
- **GIVEN** «Конвертер Unix-времени» is enabled and the first load of its page fails
- **WHEN** the user chooses the tool button
- **THEN** the error fallback with «Повторить» and the back button is shown
- **WHEN** the user chooses «Повторить» and the load succeeds
- **THEN** the page heading is «Конвертер Unix-времени»

#### Scenario: Offline
- **GIVEN** the app is offline-ready and there is no network
- **WHEN** the user chooses the tool button
- **THEN** the tool page is shown

### Requirement: Tools strings are localized
Every text of the tools group, of the tool buttons and of the tool page frame SHALL exist in Russian and English: the caption «Инструменты» / "Tools", the tool name «Конвертер Unix-времени» / "Unix time converter", «Назад» / "Back". A tool's name MUST be the same text in the tools group, on its tool button and in its page heading. <!-- implements FR18 of add-unix-time-converter-tool -->

#### Scenario: English interface
- **GIVEN** the interface language is English and the tool is enabled
- **WHEN** the user opens the settings page
- **THEN** the group is captioned "Tools" and its toggle is named "Unix time converter"
- **WHEN** the user opens the tool page from the header button named "Unix time converter"
- **THEN** the page heading is "Unix time converter"

### Requirement: Accessible and responsive tools
Every tool toggle and tool button SHALL have the tool's name as its accessible name and pointer hint and a target of at least 44 × 44 px; a toggle exposes its pressed state. Tab MUST reach Add location, then the tool buttons in order, then the settings button. axe-core MUST report no violation of the settings page with the tools group and of the header with a tool button, in the light and the dark theme. The header with one tool button MUST NOT scroll horizontally from 320 px to 2560 px. <!-- implements NFR-A1, NFR-A4, NFR-R1 of add-unix-time-converter-tool -->

#### Scenario: Names, states and sizes
- **GIVEN** «Конвертер Unix-времени» is enabled
- **WHEN** the settings page and then the main page are shown at `<width>` px in the `<theme>` theme
- **THEN** the toggle and the tool button are at least 44 × 44 px and named «Конвертер Unix-времени»
- **AND** the toggle is exposed as pressed
- **AND** axe-core reports no violations on both pages

| width | theme |
|---|---|
| 320 | light |
| 375 | dark |
| 1024 | light |

#### Scenario: Tab order of the header
- **GIVEN** «Конвертер Unix-времени» is enabled
- **WHEN** the user presses Tab from the title
- **THEN** the focus reaches «Добавить место», then «Конвертер Unix-времени», then «Настройки»

#### Scenario: Narrow and wide header
- **GIVEN** «Конвертер Unix-времени» is enabled
- **WHEN** the main page is `<width>` px wide
- **THEN** the page does not scroll horizontally, the title is on one line and the title and the three buttons are fully visible

| width |
|---|
| 320 |
| 360 |
| 2560 |
