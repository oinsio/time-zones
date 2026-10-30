# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Header actions
The header SHALL hold the Add location button, which opens the location search, and the settings button, which opens the settings page (see the `settings` capability). The settings button MUST be the rightmost control of the header on every width. It shows the settings (sliders) icon in the accent colour and has the accessible name "Settings" («Настройки»). Below 768 px the Add location button MUST be an icon-only "+" in the accent colour, placed before the title, with the title centred between the two buttons. From 768 px it MUST show "+" and the visible label "Add" («Добавить»), placed right of the title and directly before the settings button, with the title at the left. The Add location button's accessible name MUST be "Add location" («Добавить место») on every width. The slash shortcut MUST keep opening the search, and the content region MUST NOT show a second Add location button. Both buttons MUST be at least 44 × 44 px, and Tab MUST reach them in their visual order. The page MUST NOT scroll horizontally at 320 px and 2560 px. axe-core MUST report no violations with the narrow and the wide header in the light and the dark theme. The approved screenshots of the main page states MUST show the new header. <!-- implements FR1, FR2, NFR-A1, NFR-A2, NFR-A3, NFR-R1, NFR-R3, UX1 of add-settings-page-and-device-time-location -->

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
