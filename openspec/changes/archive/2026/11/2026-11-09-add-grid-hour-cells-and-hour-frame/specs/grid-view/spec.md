## ADDED Requirements

### Requirement: Hour cells of the reference day
Every grid row SHALL show, after its row header, an hour strip of hour cells over the reference day. The cells MUST be consecutive one-hour spans of absolute time starting at the reference zone's local midnight: 24 cells on an ordinary day, 23 or 25 on a day with a clock change in the reference zone; a reference day whose length is not a whole number of hours ends with one shorter cell. Column `n` of every row MUST cover the same absolute hour, so the cells of all rows stand one under another. Inputs: the location's IANA time zone ID, the reference day. Output: the ordered cells, each with its start instant. Errors: a zone the engine rejects gives no hour strip for that row; the other rows are unaffected. <!-- implements FR1, FR2 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: Four rows of 24 aligned cells
- **GIVEN** the view mode is Grid, the device time zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z`
- **AND** the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the main page is shown
- **THEN** every row has 24 hour cells
- **AND** column 12 starts at `2026-03-08T07:00:00Z` in every row

#### Scenario: Clock change days in the reference zone
- **GIVEN** the reference zone is `America/New_York`
- **WHEN** the reference day is `<date>`
- **THEN** every row has `<count>` hour cells

| date | count |
|---|---|
| 2026-03-08 | 23 |
| 2026-11-01 | 25 |
| 2026-06-01 | 24 |

#### Scenario: Cells in a real layout stand in columns
- **GIVEN** the view mode is Grid and the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the main page is 1440 px wide
- **THEN** the cells of column 12 of all rows have the same left edge and the same width

### Requirement: Hour cell label
An hour cell SHALL show the location's local wall-clock time at the cell's start: the hour without a leading zero, with the minutes when they are not zero (`9`, `9:30`, `5:45`). In the 12-hour format the hour MUST be the 12-hour clock hour with the interface language's day-period marker; in the 24-hour format no marker is shown. A change of the hour format MUST relabel every cell at once. <!-- implements FR3 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: Local start hours of the sample day
- **GIVEN** the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z` and the hour format is 24-hour
- **WHEN** the hour cells are presented
- **THEN** column `<column>` of `<city>` shows `<label>`

| city | column | label |
|---|---|---|
| Almaty | 0 | 0 |
| Almaty | 9 | 9 |
| Moscow | 0 | 22 |
| Kolkata | 23 | 23:30 |
| New York | 11 | 1 |
| New York | 12 | 3 |

#### Scenario: Quarter-hour zone
- **GIVEN** the reference zone is `Asia/Almaty` and the reference day is 2026-03-08
- **WHEN** the hour cells of Kathmandu are presented
- **THEN** column 0 is its midnight cell and column 1 shows `1:45`

#### Scenario: 12-hour format
- **GIVEN** the reference zone is `Asia/Almaty`, the reference day is 2026-03-08, the interface language is English and the hour format is 12-hour
- **WHEN** the hour cells of Almaty are presented
- **THEN** column 9 shows `9` with the marker `AM` and column 21 shows `9` with the marker `PM`

### Requirement: Hour cell colour
An hour cell SHALL be coloured by the location's day period at the cell's start (night, morning, working hours, evening, by the day-period schedule) with the day-period colour of the active theme that the day track uses. In the dark theme the digits on morning, working-hours and evening cells MUST be `#0F1729`. <!-- implements FR4 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: Day periods of Almaty
- **GIVEN** the reference zone is `Asia/Almaty` and the reference day is 2026-03-08
- **WHEN** the hour cells of Almaty are presented
- **THEN** columns 0–6 and 22–23 are night, 7–8 morning, 9–17 working hours and 18–21 evening

#### Scenario: Theme colours of the cells
- **GIVEN** the view mode is Grid, the stored location is Almaty and the `<theme>` theme is active
- **WHEN** the main page is shown at `2026-03-08T07:30:00Z`
- **THEN** column 3 has the `<theme>` night colour, column 7 the morning colour, column 9 the working-hours colour and column 18 the evening colour

| theme |
|---|
| light |
| dark |

### Requirement: Midnight marker in the hour strip
The cell whose start is the first instant of a new local date of the location SHALL be the midnight cell of its row: it MUST show the short month name of that date in upper case without a trailing full stop over the day of the month, in the interface language, instead of the time, and MUST be shaded with the midnight cell shade of the active theme (`rgba(24, 24, 27, 0.10)` light, `rgba(15, 23, 41, 0.22)` dark). A row whose zone is the reference zone MUST show a plain `0` on its first cell and has no midnight cell. Any other row has at most one midnight cell per local date change inside the reference day. <!-- implements FR5 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: Midnight cells of the sample day
- **GIVEN** the reference zone is `Asia/Almaty`, the reference day is 2026-03-08 and the interface language is Russian
- **WHEN** the hour cells are presented
- **THEN** the midnight cell of `<city>` is column `<column>` with `МАР` over `8`

| city | column |
|---|---|
| Moscow | 2 |
| Kolkata | 0 |
| New York | 10 |

#### Scenario: The reference zone's row starts with 0
- **GIVEN** the reference zone is `Asia/Almaty` and the reference day is 2026-03-08
- **WHEN** the hour cells of Almaty are presented
- **THEN** column 0 shows `0` and no cell of Almaty is a midnight cell

#### Scenario: English month
- **GIVEN** the reference zone is `Asia/Almaty`, the reference day is 2026-03-08 and the interface language is English
- **WHEN** the hour cells of Moscow are presented
- **THEN** column 2 shows `MAR` over `8`

### Requirement: Offset edge in the hour strip
When the location's UTC offset changes inside the reference day, the first cell that starts at or after the change SHALL show an offset edge: a line in the foreground colour of the active theme on its left side. A row without a clock change inside the reference day MUST show no offset edge. <!-- implements FR6 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: New York moves its clocks forward
- **GIVEN** the reference zone is `Asia/Almaty` and the reference day is 2026-03-08
- **WHEN** the hour cells are presented
- **THEN** New York's column 12 has the offset edge
- **AND** no other cell of New York, Almaty, Moscow or Kolkata has one

### Requirement: Hour frame
An hour frame in the accent colour of the active theme SHALL surround, across all rows of the panel, the column of the hour cell that contains the effective instant; the texts of the framed cells MUST be bold. While the reference moment is live, the frame MUST move to the next column when the clock reaches the next cell. While it is pinned, the frame MUST stay on the pinned instant's column. Now MUST return it to the column of the current time. With no rows, no frame is shown. <!-- implements FR8, FR9, UX2 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: Frame on the current hour
- **GIVEN** the view mode is Grid, the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z` and the stored locations are Almaty and Moscow
- **WHEN** the main page is shown
- **THEN** the hour frame is on column 12
- **AND** the texts of column 12 are bold in both rows and the texts of column 11 are not

#### Scenario: Live frame follows the clock
- **GIVEN** the Grid view shows the frame on column 12 at `2026-03-08T07:30:00Z`, live
- **WHEN** the clock reaches `2026-03-08T08:00:00Z`
- **THEN** the hour frame is on column 13

#### Scenario: Pinned frame stays
- **GIVEN** the Grid view at `2026-03-08T07:30:00Z`, live
- **WHEN** the user `<pins>`
- **AND** the clock reaches `2026-03-08T08:00:00Z`
- **THEN** the hour frame is on column `<column>`

| pins | column |
|---|---|
| types `12:15` into the time of Almaty | 12 |
| selects the next day in the date bar | 12 |

#### Scenario: Now returns the frame
- **GIVEN** the Grid view pinned at `2026-03-08T02:00:00Z` and the current time `2026-03-08T07:30:00Z`
- **WHEN** the user returns to now
- **THEN** the hour frame is on column 12

#### Scenario: Frame crosses every row in the accent colour
- **GIVEN** the view mode is Grid, the stored locations are Almaty, Moscow, Kolkata and New York and the `<theme>` theme is active
- **WHEN** the main page is shown at `2026-03-08T07:30:00Z`
- **THEN** one hour frame in the `<theme>` accent colour reaches from the first row to the last
- **AND** its left and right edges enclose column 12 of every row

| theme |
|---|
| light |
| dark |

### Requirement: Hour frame lies behind texts
The hour frame SHALL lie above the hour cells and behind the row header texts and the row notes: the city, the offset difference, the zone line, the date, the time and the notes MUST keep their background and stay fully visible where the frame passes, and the frame MUST NOT receive pointer events. <!-- implements FR10 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: Notes and header texts cover the frame
- **GIVEN** the view mode is Grid, the stored locations are Almaty and New York and the current time is `2026-03-08T07:30:00Z`
- **WHEN** the main page is 390 by 844 px
- **THEN** where the hour frame crosses New York's clock change note, the topmost element is the note, not the frame
- **AND** where the frame's border crosses a row header text (city, zone line, date, time), the topmost element is that text

### Requirement: Hour cells take no pointer selection yet
A tap, click or drag on an hour cell SHALL change nothing: no command is dispatched, and the reference moment, the hour frame and every row's time stay as they were. <!-- implements FR11 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: A tap on a cell changes nothing
- **GIVEN** the Grid view at `2026-03-08T07:30:00Z`, live
- **WHEN** the user taps column 3 of Moscow
- **THEN** the store receives no command
- **AND** Almaty still shows `12:30` and the frame is still on column 12

### Requirement: Time selection on the hour strip
The hour strip of every row SHALL be a slider for assistive technology and the keyboard, with the day track's accessible name "Time in {city}" / «Время — {city}», the value in minutes since the start of the reference day from 0 to the track end, and the value text of the row's local time and date. Arrow Right / Arrow Up and Arrow Left / Arrow Down MUST move the reference moment by one track step, Page Up / Page Down by one hour, Home to the start of the reference day and End to the track end, as on a day track. Each move MUST pin the reference moment, change every row's time and move the hour frame. Each strip MUST be one Tab stop, after its row's location menu button, with a visible focus ring in the accent colour; its cells MUST NOT be separate Tab stops. <!-- implements FR12, NFR-A1, NFR-A2 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: Page Up on Moscow's strip
- **GIVEN** the view mode is Grid, the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z` and the stored locations are Almaty and Moscow
- **WHEN** the user focuses Moscow's hour strip and presses Page Up
- **THEN** Almaty shows `13:30` and Moscow shows `11:30`
- **AND** the hour frame is on column 13

#### Scenario: Slider name and value of a strip
- **GIVEN** the interface language is English, the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z` and the stored location is Almaty
- **WHEN** the Grid view is shown
- **THEN** the slider "Time in Almaty" has the value 750 within 0 to 1439 and the value text `12:30, Sun, Mar 8`

#### Scenario: Tab order and focus ring
- **GIVEN** the Grid view with Almaty and Moscow
- **WHEN** the user tabs from Almaty's location menu button
- **THEN** Almaty's hour strip has focus with a focus ring in the accent colour
- **AND** the next Tab leaves the strip for Moscow's row

#### Scenario: No accessibility violations with hour cells
- **GIVEN** the view mode is Grid and the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the main page is shown live and after a time selection on an hour strip, in the `<theme>` theme
- **THEN** axe-core reports no violations

| theme |
|---|
| light |
| dark |

### Requirement: Hour strip width
When the hour strip's width divided by its cell count is at least 32 px, every cell SHALL take an equal share of the strip and all cells of the reference day MUST be visible without scrolling. Otherwise every cell MUST take the width that shows 9 cells in the strip, kept between 36 px and 40 px, and the strips of all rows MUST scroll horizontally together while the row headers and row notes stay in place; the page itself MUST NOT scroll horizontally. On opening, the strips MUST be scrolled so that the hour frame is fully visible, and when the frame moves to a column outside the visible part they MUST scroll to show it. <!-- implements NFR-R1, NFR-R2, UX3 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: All hours fit
- **GIVEN** the view mode is Grid and the stored locations are Almaty, Moscow, Kolkata and New York at `2026-03-08T07:30:00Z`
- **WHEN** the main page is `<width>` by `<height>` px
- **THEN** all 24 cells of every row are inside the panel and the strips do not scroll

| width | height |
|---|---|
| 1440 | 900 |
| 1180 | 820 |
| 844 | 390 |

#### Scenario: Phone in portrait scrolls all strips together
- **GIVEN** the view mode is Grid and the stored locations are Almaty, Moscow, Kolkata and New York at `2026-03-08T07:30:00Z`
- **WHEN** the main page is 390 by 844 px
- **THEN** every cell is 36 to 40 px wide and 8 to 10 cells of each row are visible
- **AND** the hour frame is fully visible
- **AND** the page does not scroll horizontally
- **WHEN** the user scrolls Moscow's strip to its end
- **THEN** all four strips show their last cell and Almaty's city stays at its place

#### Scenario: Frame moved out of view is scrolled into view
- **GIVEN** the Grid view at 390 by 844 px at `2026-03-08T07:30:00Z`
- **WHEN** the user focuses Almaty's hour strip and presses End
- **THEN** the hour frame is on column 23 and fully visible

### Requirement: Hour strips are fast
Presenting the hour strips of 50 rows a second time within the same reference day, interface language and hour format SHALL build no formatter, look up no time zone transition and return the same strip for every row. Presenting them the first time MUST look up at most 2 time zone transitions and build at most 3 formatters per zone. Real timings are reported by a benchmark and never asserted by a test. <!-- implements NFR-P1 of add-grid-hour-cells-and-hour-frame -->

#### Scenario: A minute tick re-presents nothing
- **GIVEN** the hour strips of 50 rows in 10 zones were presented for 2026-03-08
- **WHEN** they are presented again one minute later
- **THEN** no formatter is built and no time zone transition is looked up
- **AND** every row gets the same strip as before

#### Scenario: First presentation is bounded per zone
- **WHEN** the hour strips of 50 rows in 10 zones are presented for the first time
- **THEN** each zone has at most 2 time zone transition lookups and at most 3 formatter builds
