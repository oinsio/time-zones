## MODIFIED Requirements

### Requirement: Locations without day periods
In the Time of day colouring, the day track and every hour cell of a location without day periods (see the `day-periods` requirement "Coordinates of a location for the sun") SHALL be the accent colour of the active theme, light or dark, as one colour with no blend, and the digits of its cells MUST take the text colour that "Day colours are readable" sets for the accent colour. The accent is the same colour as a plain track and a working cell of that theme; the non-working grey MUST NOT be used for such a location in the Time of day colouring. No message, mark or error is shown for it. In the Plain and the Working hours colourings such a location is coloured as every other location. When the location later gains coordinates, its track and cells MUST be recoloured without a reload. <!-- implements FR8, UX4, NFR-A1 of bind-day-periods-to-sun; FR1, FR2, FR3, UX1, UX2, NFR-A1 of colour-locations-without-day-periods-in-accent -->

#### Scenario: UTC in the Time of day colouring
- **GIVEN** the day colouring is Time of day and the list holds UTC
- **WHEN** the list is shown in the Cards view and in the Grid view
- **THEN** the whole track of UTC is one colour stop at position 0 in the accent colour
- **AND** every hour cell of UTC is the accent colour

#### Scenario: UTC in the other colourings
- **GIVEN** the list holds UTC and the working hours are 10:00–18:00
- **WHEN** the day colouring is `<colouring>`
- **THEN** UTC is coloured `<how>`

| colouring | how |
|---|---|
| Plain | plain, as every location |
| Working hours | working from 10:00 to 18:00 on working days, as every location |

#### Scenario: A location gains coordinates
- **GIVEN** the day colouring is Time of day and a city location in a zone without zone coordinates holds no coordinates
- **WHEN** the location gains the coordinates 55.8, 49.1
- **THEN** its track and cells are coloured by the day periods of 55.8, 49.1 without a reload

#### Scenario: UTC track in the accent in a real browser
- **GIVEN** the day colouring is Time of day, the stored location is UTC and the `<theme>` theme is active
- **WHEN** the main page is shown in the Cards view at `2026-03-14T09:00:00Z`
- **THEN** the track of UTC is a gradient with the `<theme>` accent colour at its left end and at its right end

| theme |
|---|
| light |
| dark |

#### Scenario: Readable digits on the accent
- **GIVEN** the view mode is Grid, the list holds UTC and the day colouring is Time of day
- **WHEN** the main page is shown in the `<theme>` theme at `2026-03-09T06:00:00Z`
- **THEN** every cell of UTC has the `<theme>` accent colour
- **AND** the digits of the UTC cells have a contrast of at least 4.5:1 against the cell colour
- **AND** axe-core reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: Readable digits on the grey
- **GIVEN** the view mode is Grid, the reference zone is `Asia/Almaty`, the list holds UTC and the day colouring is Working hours with 10:00–18:00
- **WHEN** the main page is shown in the `<theme>` theme at `2026-03-09T06:00:00Z`
- **THEN** the cell of UTC in column 15 (10:00 UTC, Monday) has the `<theme>` accent colour and the cell in column 13 (08:00 UTC) the `<theme>` non-working grey
- **AND** the digits of every UTC cell have a contrast of at least 4.5:1 against the cell colour

| theme |
|---|
| light |
| dark |
