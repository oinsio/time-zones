## MODIFIED Requirements

### Requirement: Home mark
The home location's row SHALL show the home mark in the leading mark slot, with the accessible label "Home location" («Домашнее место») and no caption. No other row MAY show it. The mark MUST be a house glyph the size of the Here mark icon. The glyph MUST be one closed outline made of a pitched roof, two vertical walls and a flat base. It MUST have no door, window, chimney or any other line inside or outside that outline. Only the outline MUST be drawn: its inside MUST NOT be painted, so the row's surface shows through it, in the light and in the dark theme. The outline MUST be drawn in the accent colour of the active theme (`--color-accent`), with rounded joins and a line 2 units thick on the glyph's 24-unit grid. The drawn glyph MUST be hidden from assistive technology, and the mark MUST be exposed as one image named by its accessible label. The Here mark MUST keep its filled location arrow. Inputs: the home location and the active colour theme. Output: the mark on the home row. Errors: none. The glyph needs no network and looks the same offline. <!-- implements FR7, UX2 of set-home-location-and-show-differences ; FR1, FR2, FR3, FR4, NFR-A1, UX1, UX2 of match-home-mark-to-design -->

#### Scenario: Only the home row shows the home mark
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row shows the home mark
- **AND** the Moscow row shows no home mark

#### Scenario: The house is the design's outline
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the home mark of Almaty draws exactly one closed outline: a pitched roof, two walls and a flat base
- **AND** it draws no door and no other line
- **AND** nothing inside the outline is painted

#### Scenario: Outlined in the accent colour in the light theme
- **GIVEN** the screen uses the light theme
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the house of Almaty has no fill
- **AND** its outline has the light accent colour `#2f5bd3`
- **AND** it is 18 × 18 px

#### Scenario: Outlined in the accent colour in the dark theme
- **GIVEN** the screen uses the dark theme
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the house of Almaty has no fill
- **AND** its outline has the dark accent colour `#5ec2e8`
- **AND** it is 18 × 18 px

#### Scenario: The Here mark stays filled next to the house
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** Almaty shows the outlined house
- **AND** Moscow shows the location arrow filled in the accent colour and the caption "here"

#### Scenario: The mark keeps its name
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row has one image named "Home location"
- **AND** the drawn house is hidden from assistive technology
