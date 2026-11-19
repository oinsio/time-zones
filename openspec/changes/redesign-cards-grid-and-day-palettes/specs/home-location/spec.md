## MODIFIED Requirements

### Requirement: Home mark
The home location's row SHALL show the home mark in the leading mark slot, with the accessible label "Home location" («Домашнее место») and no caption. No other row MAY show it. The mark MUST be the Lucide `House` icon, the size of the Here mark icon (23 px in a card, 20 px in a grid row from 768 px), drawn as an outline in the accent colour of the active theme (`--color-accent`): its inside MUST NOT be painted, so the row's surface shows through it, in the light and in the dark theme. The drawn glyph MUST be hidden from assistive technology, and the mark MUST be exposed as one image named by its accessible label. The Here mark is the Lucide `MapPin` (see the `locations` capability). Inputs: the home location and the active colour theme. Output: the mark on the home row. Errors: none. The glyph needs no network and looks the same offline. <!-- implements FR7, UX2 of set-home-location-and-show-differences ; FR1, FR2, FR3, FR4, NFR-A1, UX1, UX2 of match-home-mark-to-design; FR10 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Only the home row shows the home mark
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row shows the home mark
- **AND** the Moscow row shows no home mark

#### Scenario: The house is the design's outline
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the home mark of Almaty draws the Lucide `House` glyph
- **AND** nothing inside its outline is painted

#### Scenario: Outlined in the accent colour in the light theme
- **GIVEN** the screen uses the light theme
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the list is shown 390 px wide
- **THEN** the house of Almaty has no fill
- **AND** its outline has the light accent colour `#3159e7`
- **AND** it is 23 × 23 px

#### Scenario: Outlined in the accent colour in the dark theme
- **GIVEN** the screen uses the dark theme
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the list is shown 390 px wide
- **THEN** the house of Almaty has no fill
- **AND** its outline has the dark accent colour `#4dd5f4`
- **AND** it is 23 × 23 px

#### Scenario: The Here mark next to the house
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** Almaty shows the outlined house
- **AND** Moscow shows the map pin in the accent colour and no caption

#### Scenario: The mark keeps its name
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row has one image named "Home location"
- **AND** the drawn house is hidden from assistive technology

### Requirement: Home mark takes precedence over the Here mark
A row that is home and whose zone is the device time zone SHALL show the home mark only, without the Here mark. A row in the device time zone that is not home MUST show the Here mark. Neither mark has a visible caption. <!-- implements FR7 of set-home-location-and-show-differences; FR10 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Home in the device time zone
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row has exactly 1 leading mark, of the kind "home"

#### Scenario: Travelling
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row shows the home mark
- **AND** the Moscow row shows the Here mark and no text "here"

### Requirement: Home actions in the location menu
Each row's location menu SHALL offer, as its first item, "Make home" («Сделать домашним») on a row that is not home and "Clear home" («Убрать отметку дома») on the home row, followed by "Move up", "Move down" and "Remove" (see the `locations` capability). A row whose zone is unknown MUST have no home item. Setting and clearing home MUST be announced politely without moving focus away from the row. <!-- implements FR11 of set-home-location-and-show-differences; FR16 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Menu of a row that is not home
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens Moscow's location menu
- **THEN** it offers "Make home", "Move up", "Move down" and "Remove", in this order

#### Scenario: Menu of the home row
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens Almaty's location menu
- **THEN** it offers "Clear home", "Move up", "Move down" and "Remove", in this order

#### Scenario: Setting home is announced
- **GIVEN** the interface language is English
- **WHEN** the user makes Almaty home from its location menu
- **THEN** "Almaty is now home" is announced politely
- **AND** the focus is on Almaty's location menu button

#### Scenario: No home item for an unknown zone
- **GIVEN** the list holds Moscow and a location whose zone the browser does not know
- **WHEN** the user opens that location's menu
- **THEN** it offers "Move up", "Move down" and "Remove" and no home item
