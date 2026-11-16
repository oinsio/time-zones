# Spec Delta: day-colouring

## ADDED Requirements

### Requirement: Locations without day periods
In the Time of day colouring, the day track and every hour cell of a location without day periods (see the `day-periods` requirement "Coordinates of a location for the sun") SHALL be the non-working grey of the active theme, as one colour with no blend, and the digits of its cells MUST take the text colour that "Day colours are readable" sets for that grey. No message, mark or error is shown for it. In the Plain and the Working hours colourings such a location is coloured as every other location. When the location later gains coordinates, its track and cells MUST be recoloured without a reload. <!-- implements FR8, UX4, NFR-A1 of bind-day-periods-to-sun -->

#### Scenario: UTC in the Time of day colouring
- **GIVEN** the day colouring is Time of day and the list holds UTC
- **WHEN** the list is shown in the Cards view and in the Grid view
- **THEN** the whole track of UTC is the non-working grey
- **AND** every hour cell of UTC is the non-working grey

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

#### Scenario: Readable digits on the grey
- **GIVEN** the view mode is Grid, the list holds UTC and the day colouring is Time of day
- **WHEN** the main page is shown in the light and in the dark theme
- **THEN** the digits of the UTC cells have a contrast of at least 4.5:1 against the cell colour
- **AND** axe-core reports no violations

### Requirement: Day periods are fast
Presenting the day tracks and the hour strips of 50 rows in the Time of day colouring for the first time in a reference day SHALL compute the sun for at most 3 solar days per distinct coordinates and MUST build no formatter beyond those the rows build today. Presenting them again within the same reference day, for example one minute later, MUST compute nothing for the sun and MUST return the same colour stops and the same cells for every row. A minute tick MUST compute nothing for the sun. The sun calculation MUST add no request and no runtime dependency, and the initial JavaScript MUST stay at most 150 KB gzipped. Real timings are reported by a benchmark and never asserted by a test (ADR-0008). <!-- implements NFR-P1, NFR-P2, NFR-P3 of bind-day-periods-to-sun -->

#### Scenario: First presentation of 50 rows
- **GIVEN** 50 rows at 10 distinct coordinates in the Time of day colouring
- **WHEN** their day tracks and hour strips are presented for the first time in a reference day
- **THEN** the sun was computed for at most 30 solar days

#### Scenario: A minute later
- **GIVEN** the rows of the previous scenario were presented
- **WHEN** they are presented again one minute later within the same reference day
- **THEN** nothing was computed for the sun
- **AND** every row has the same colour stops and the same cells as before

#### Scenario: Bundle budget
- **WHEN** the app is built
- **THEN** the initial JavaScript is at most 150 KB gzipped

## MODIFIED Requirements

### Requirement: Day colouring
The app SHALL colour the day tracks and the hour cells by one day colouring chosen in the settings: Plain, Time of day or Working hours. Time of day is the default. It colours by the day periods exactly as the `time-selection` requirement "Day-period colours by the sun" and the `grid-view` requirement "Hour cell colour" define. Plain and Working hours colour as the requirements below define. A change of the day colouring MUST recolour every day track and every hour cell at once, without a reload, and MUST NOT change the reference moment, the meeting range, the location list or the hour labels. Inputs: the day colouring, the working hours, the location's IANA identifier and coordinates, the reference day. Output: the colours of the location's day track and hour cells. Errors: none for known zones. <!-- implements FR2, FR3, FR9, FR10, FR11 of add-day-colouring-setting; FR5, FR10 of bind-day-periods-to-sun -->

#### Scenario: Time of day by default
- **GIVEN** no preferences document is stored
- **AND** the device time zone is `Asia/Almaty` and the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the tracks of Almaty and New York are presented
- **THEN** their colour stops are the day-period stops of the `time-selection` scenario "Colour stops of Almaty and New York"

#### Scenario: Changing the colouring keeps the moment
- **GIVEN** the list contains Almaty and the moment is pinned to `2026-03-09T06:00:00Z`
- **WHEN** the user chooses the Plain colouring
- **THEN** the moment is still pinned to `2026-03-09T06:00:00Z`
- **AND** the Almaty track has one colour, plain

### Requirement: Approved screenshots of the colourings
The approved screenshots of Grid at 1280 px and of Cards at 375 px, with Almaty, Moscow, Kolkata and New York at `2026-03-09T06:00:00Z`, MUST match in the Plain, the Time of day and the Working hours (10:00–18:00) colourings, in the light and the dark theme. The Time of day screenshots show the day periods by the sun and are re-approved once when day periods are bound to the sun; the Plain and the Working hours screenshots MUST match unchanged. <!-- implements NFR-R2, UX4 of add-day-colouring-setting; NFR-R1, FR10 of bind-day-periods-to-sun -->

#### Scenario: Screenshots of the colourings
- **WHEN** the `<view>` view is rendered at `<width>` px in the `<colouring>` colouring and the `<theme>` theme
- **THEN** it matches the approved screenshot

| view | width | colouring | theme |
|---|---|---|---|
| Grid | 1280 | Plain | light |
| Grid | 1280 | Plain | dark |
| Grid | 1280 | Time of day | light |
| Grid | 1280 | Time of day | dark |
| Grid | 1280 | Working hours | light |
| Grid | 1280 | Working hours | dark |
| Cards | 375 | Plain | light |
| Cards | 375 | Plain | dark |
| Cards | 375 | Time of day | light |
| Cards | 375 | Time of day | dark |
| Cards | 375 | Working hours | light |
| Cards | 375 | Working hours | dark |
