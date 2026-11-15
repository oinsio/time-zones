# day-colouring Specification

## Purpose
Decides how every day track and every hour cell is coloured: plainly, by the time of day, or by the user's working hours read in each location's local time, and keeps the colours readable and cheap to compute.

## Requirements

### Requirement: Day colouring
The app SHALL colour the day tracks and the hour cells by one day colouring chosen in the settings: Plain, Time of day or Working hours. Time of day is the default. It colours by the day periods exactly as the `time-selection` requirement "Day-period colours" and the `grid-view` requirement "Hour cell colour" define. Plain and Working hours colour as the requirements below define. A change of the day colouring MUST recolour every day track and every hour cell at once, without a reload, and MUST NOT change the reference moment, the meeting range, the location list or the hour labels. Inputs: the day colouring, the working hours, the location's IANA identifier, the reference day. Output: the colours of the location's day track and hour cells. Errors: none for known zones. <!-- implements FR2, FR3, FR9, FR10, FR11 of add-day-colouring-setting -->

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

### Requirement: Working time
An instant SHALL be working time for a location when the location's local date at that instant is a working day (Monday to Friday) and its local wall-clock time is at or after the start of the working hours and before their end. Saturday and Sunday MUST never be working time. There is one set of working hours for every location, and each location reads it in its own local time, so 10:00–18:00 in Moscow and 10:00–18:00 in Tokyo are different instants. The working day is decided by each location's own local date, not by the reference zone's date. After a clock change inside the reference day, the local time after the change decides; no UTC offset is stored or assumed. Inputs: the working hours (start and end wall-clock times, start before end), the location's IANA identifier, the instant. Output: working time or not. Errors: none. <!-- implements FR8 of add-day-colouring-setting -->

#### Scenario: Each location reads the working hours in its own time
- **GIVEN** the working hours are 10:00–18:00
- **WHEN** working time is read for `<city>` at `<instant>`
- **THEN** it is `<working>`

| city | instant | working |
|---|---|---|
| Moscow | `2026-03-09T07:00:00Z` | working time |
| Tokyo | `2026-03-09T07:00:00Z` | working time |
| Moscow | `2026-03-09T06:59:00Z` | not working time |
| Tokyo | `2026-03-09T09:00:00Z` | not working time |

#### Scenario: Weekends are never working time
- **GIVEN** the working hours are 10:00–18:00
- **WHEN** working time is read for Moscow at `2026-03-14T09:00:00Z`, a Saturday 12:00 in Moscow
- **THEN** it is not working time

### Requirement: Plain day colouring
While the day colouring is Plain, every day track and every hour cell SHALL be filled with the accent colour of the active theme, the light accent in the light theme and the dark accent in the dark theme, over the whole reference day. No day period, working time, blend or offset edge colour is shown. A track MUST present a single colour stop at position 0, plain. A track with a single colour stop, here or in the Working hours colouring, MUST be drawn in that colour from its left end to its right end in every supported engine (ADR-0009), never left without a background. The midnight shade and the offset edge line of hour cells stay as they are. Inputs: the location's IANA identifier, the reference day. Output: one plain colour stop; every hour cell plain. <!-- implements FR9, FR10 of add-day-colouring-setting -->

#### Scenario: A plain track
- **GIVEN** the day colouring is Plain and the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the tracks of Almaty and New York are presented
- **THEN** each has exactly one colour stop, `0` plain

#### Scenario: One-colour tracks are drawn in a real browser
- **GIVEN** the device time zone is `Europe/Moscow`, the view mode is Cards, the stored location is Moscow, the `<theme>` theme is active and the day colouring is `<colouring>` with the working hours 10:00–18:00
- **WHEN** the main page is shown at `2026-03-14T09:00:00Z`, a Saturday in Moscow
- **THEN** the computed background of the Moscow track is a gradient, not `none`
- **AND** the track has the `<theme>` `<colour>` at its left end and at its right end

| theme | colouring | colour |
|---|---|---|
| light | Plain | accent colour |
| dark | Plain | accent colour |
| light | Working hours | non-working grey |
| dark | Working hours | non-working grey |

#### Scenario: Plain hour cells
- **GIVEN** the day colouring is Plain, the reference zone is `Asia/Almaty` and the reference day is 2026-03-08
- **WHEN** the hour cells of Almaty, Moscow, Kolkata and New York are presented
- **THEN** every cell of every row is plain

### Requirement: Working-hours colouring of day tracks
While the day colouring is Working hours, a day track SHALL show working time in the accent colour of the active theme and all other time in the non-working grey of the active theme. The edge between them MUST be hard, with no blend: two colour stops at the same position, the colour before and the colour after the edge, at the exact instant where working time starts or ends, to the minute. Only edges inside the reference day are stops. A track without an edge MUST present one colour stop at position 0 with its colour. An offset change that does not move the local time into or out of working time adds no stop. Inputs: the working hours, the location's IANA identifier, the reference day. Output: the colour stops, each a position (fraction of the reference day) and a colour, working or non-working. <!-- implements FR8, FR10 of add-day-colouring-setting -->

#### Scenario: Working-time stops on a Monday
- **GIVEN** the day colouring is Working hours and the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-09T06:00:00Z`, Monday
- **AND** the working hours are `<hours>`
- **WHEN** the track of `<city>` is presented
- **THEN** its colour stops are `<stops>` (±0.000001)

| hours | city | stops |
|---|---|---|
| 10:00–18:00 | Almaty | `0.416667` non-working, `0.416667` working, `0.75` working, `0.75` non-working |
| 09:07–18:00 | Almaty | `0.379861` non-working, `0.379861` working, `0.75` working, `0.75` non-working |
| 10:00–18:00 | Moscow | `0.5` non-working, `0.5` working, `0.833333` working, `0.833333` non-working |
| 10:00–18:00 | New York | `0.791667` non-working, `0.791667` working |

#### Scenario: Friday still works where Saturday has not begun
- **GIVEN** the day colouring is Working hours, the working hours are 10:00–18:00 and the device time zone is `Europe/Moscow`
- **AND** the current instant is `2026-03-14T09:00:00Z`, Saturday in Moscow
- **WHEN** the tracks of Moscow and New York are presented
- **THEN** the Moscow track has one colour stop, `0` non-working
- **AND** the New York track has the stops `0.041667` working, `0.041667` non-working (±0.000001), since its reference day starts at 17:00 on Friday

#### Scenario: Working time after a clock change
- **GIVEN** the day colouring is Working hours, the working hours are 10:00–18:00 and the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-04-24T06:00:00Z`, Friday, the day Cairo moves its clocks forward at 00:00
- **WHEN** the track of Cairo (`Africa/Cairo`) is presented
- **THEN** its colour stops are `0.5` non-working, `0.5` working, `0.833333` working, `0.833333` non-working (±0.000001), the 10:00 and 18:00 of Cairo's time after the change

### Requirement: Working-hours colouring of hour cells
While the day colouring is Working hours, an hour cell SHALL be working when working time covers at least half of the cell's span of absolute time (at least 30 minutes of a one-hour cell), and non-working otherwise. A working cell MUST be filled with the accent colour of the active theme, a non-working cell with the non-working grey of the active theme. The rule MUST hold alike for cells that start on the hour, at :30 and at :45, and on clock change days. Inputs: the working hours, the location's IANA identifier, the reference day, the reference zone. Output: each cell working or non-working. <!-- implements FR8, FR11 of add-day-colouring-setting -->

#### Scenario: Half of the hour decides
- **GIVEN** the day colouring is Working hours and the reference zone is `Asia/Almaty`
- **AND** the reference day is 2026-03-09, Monday
- **AND** the working hours are `<hours>`
- **WHEN** the hour cells of `<city>` are presented
- **THEN** exactly the columns `<columns>` are working

| hours | city | columns |
|---|---|---|
| 09:07–18:00 | Almaty | 9–17 |
| 09:40–18:00 | Almaty | 10–17 |
| 10:00–18:00 | Kolkata | 9–17 |
| 10:15–18:00 | Kolkata | 10–17 |
| 10:00–18:00 | Kathmandu | 9–16 |

#### Scenario: Weekend cells and Friday cells across the reference day
- **GIVEN** the day colouring is Working hours, the working hours are 10:00–18:00 and the reference zone is `Europe/Moscow`
- **AND** the reference day is 2026-03-14, Saturday in Moscow
- **WHEN** the hour cells of Moscow and New York are presented
- **THEN** no Moscow cell is working
- **AND** only column 0 of New York, 17:00 on Friday, is working

#### Scenario: Hour cells on a clock change day
- **GIVEN** the day colouring is Working hours, the working hours are 10:00–18:00 and the reference zone is `Asia/Almaty`
- **AND** the reference day is 2026-04-24, Friday
- **WHEN** the hour cells of Cairo are presented
- **THEN** exactly the columns 12–19 are working

### Requirement: Day colours are readable
In every day colouring and in both themes, the digits and texts of an hour cell SHALL have a contrast of at least 4.5:1 against the cell's colour: the four day-period colours, the accent colour and the non-working grey. The handle of a day track MUST keep its fill or its border at a contrast of at least 3:1 against every track colour under it. The non-working grey MUST differ from the accent colour. In the light theme it MUST be a light grey with a higher relative luminance than each of the four light day-period colours. In the dark theme it MUST be a muted grey of its own with a lower relative luminance than each of the four dark day-period colours, so it does not glare on the dark background. axe-core MUST report no violations on the main page in Cards and in Grid in the Plain and the Working hours colourings, in the light and the dark theme. <!-- implements NFR-A3, NFR-A4, UX4 of add-day-colouring-setting -->

#### Scenario: Digit contrast on every cell colour
- **WHEN** the design tokens of the `<theme>` theme are read
- **THEN** the hour cell digit colour of each day colour has at least 4.5:1 against that colour
- **AND** the handle's fill or border has at least 3:1 against each track colour
- **AND** the non-working grey is `<lightness>` than each of the four day-period colours of that theme

| theme | lightness |
|---|---|
| light | lighter (higher relative luminance) |
| dark | darker (lower relative luminance) |

#### Scenario: Accent and grey in a real browser
- **GIVEN** the view mode is Grid, the stored location is Almaty, the `<theme>` theme is active and the day colouring is Working hours with 10:00–18:00
- **WHEN** the main page is shown at `2026-03-09T06:00:00Z`
- **THEN** the cell of Almaty in column 10 has the `<theme>` accent colour and the cell in column 8 the `<theme>` non-working grey

| theme |
|---|
| light |
| dark |

#### Scenario: No violations in every colouring
- **GIVEN** the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** axe-core checks the main page in the `<view>` view, the `<colouring>` colouring and the `<theme>` theme
- **THEN** it reports no violations

| view | colouring | theme |
|---|---|---|
| Cards | Plain | light |
| Cards | Plain | dark |
| Cards | Working hours | light |
| Cards | Working hours | dark |
| Grid | Plain | light |
| Grid | Plain | dark |
| Grid | Working hours | light |
| Grid | Working hours | dark |

### Requirement: Day colouring in every view
The day colouring is part of the view contract (ADR-0002). For every registered view, choosing a day colouring in the settings and going back MUST show that colouring on the view's day colours: the day tracks of Cards and the hour cells of Grid. <!-- implements FR12 of add-day-colouring-setting -->

#### Scenario: Plain colouring from the view
- **GIVEN** the view under contract is shown with the stored location Almaty
- **WHEN** the user opens the settings, chooses the colouring "Plain" and goes back
- **THEN** every day colour of the Almaty row is the accent colour

#### Scenario: Working hours colouring from the view
- **GIVEN** the view under contract is shown with the stored location Almaty at `2026-03-09T06:00:00Z`
- **WHEN** the user opens the settings, chooses the colouring "Working hours" and goes back
- **THEN** the Almaty row shows the accent colour at 12:00 and the non-working grey at 20:00 of Almaty

### Requirement: Approved screenshots of the colourings
The approved screenshots of Grid at 1280 px and of Cards at 375 px, with Almaty, Moscow, Kolkata and New York at `2026-03-09T06:00:00Z`, MUST match in the Plain and the Working hours (10:00–18:00) colourings, in the light and the dark theme. The existing approved Cards and Grid screenshots, taken in the default Time of day colouring, MUST match unchanged. <!-- implements NFR-R2, UX4 of add-day-colouring-setting -->

#### Scenario: Screenshots of the colourings
- **WHEN** the `<view>` view is rendered at `<width>` px in the `<colouring>` colouring and the `<theme>` theme
- **THEN** it matches the approved screenshot

| view | width | colouring | theme |
|---|---|---|---|
| Grid | 1280 | Plain | light |
| Grid | 1280 | Plain | dark |
| Grid | 1280 | Working hours | light |
| Grid | 1280 | Working hours | dark |
| Cards | 375 | Plain | light |
| Cards | 375 | Plain | dark |
| Cards | 375 | Working hours | light |
| Cards | 375 | Working hours | dark |

### Requirement: Day colouring is fast
Presenting the day tracks and the hour strips of 50 rows in 10 zones in the Working hours colouring for the first time SHALL look up at most 2 time zone transitions and build at most 3 formatters per zone. Presenting them again within the same reference day, day colouring and working hours, for example one minute later, MUST build no formatter, look up no time zone transition and return the same colour stops and the same strip for every row. Changing the day colouring MUST build no date-time formatter. Real timings are reported by a benchmark and never asserted by a test (ADR-0008). <!-- implements NFR-P1 of add-day-colouring-setting -->

#### Scenario: First presentation is bounded per zone
- **GIVEN** the day colouring is Working hours with 10:00–18:00
- **WHEN** the day tracks and the hour strips of 50 rows in 10 zones are presented for the first time
- **THEN** each zone has at most 2 time zone transition lookups and at most 3 formatter builds

#### Scenario: A minute tick re-presents nothing
- **GIVEN** the day tracks and the hour strips of 50 rows in 10 zones were presented in the Working hours colouring
- **WHEN** they are presented again one minute later
- **THEN** no formatter is built and no time zone transition is looked up
- **AND** every row gets the same colour stops and the same strip as before

#### Scenario: Switching the colouring builds no formatter
- **GIVEN** the day tracks and the hour strips of 50 rows in 10 zones were presented in the Time of day colouring
- **WHEN** they are presented in the Plain colouring
- **THEN** no formatter is built
