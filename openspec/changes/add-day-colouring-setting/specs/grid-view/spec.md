## MODIFIED Requirements

### Requirement: Hour cell colour
While the day colouring is Time of day (the default, see the `day-colouring` capability), an hour cell SHALL be coloured by the location's day period at the cell's start (night, morning, work, evening, by the day-period schedule) with the day-period colour of the active theme that the day track uses. In the dark theme the digits on morning, work and evening cells MUST be `#0F1729`. In the Plain day colouring every cell is plain, and in the Working hours day colouring each cell is working or non-working, as the `day-colouring` capability defines; the digits then take the colour that the requirement "Day colours are readable" of that capability sets for the cell colour. A change of the day colouring MUST recolour every cell at once. <!-- implements FR4 of add-grid-hour-cells-and-hour-frame; FR2, FR9, FR11, FR12 of add-day-colouring-setting -->

#### Scenario: Day periods of Almaty
- **GIVEN** the day colouring is Time of day, the reference zone is `Asia/Almaty` and the reference day is 2026-03-08
- **WHEN** the hour cells of Almaty are presented
- **THEN** columns 0–6 and 22–23 are night, 7–8 morning, 9–17 work and 18–21 evening

#### Scenario: Theme colours of the cells
- **GIVEN** the view mode is Grid, the stored location is Almaty and the `<theme>` theme is active
- **WHEN** the main page is shown at `2026-03-08T07:30:00Z`
- **THEN** column 3 has the `<theme>` night colour, column 7 the morning colour, column 9 the work colour and column 18 the evening colour

| theme |
|---|
| light |
| dark |


### Requirement: Hour frame
An hour frame SHALL surround, across all rows of the panel, the column of the hour cell that contains the effective instant; the texts of the framed cells MUST be bold. While the reference moment is live, the frame MUST move to the next column when the clock reaches the next cell. While it is pinned, the frame MUST stay on the pinned instant's column. Now MUST return it to the column of the current time. The frame is in the accent colour of the active theme while the day colouring is Time of day, and in the foreground colour of the active theme while it is Plain or Working hours, where the cells themselves are accent-coloured; a change of the day colouring MUST recolour the frame at once. With no rows, no frame is shown. While a meeting range is set, no hour frame MUST be shown (the meeting frame takes its place); clearing the range MUST bring it back on the column of the effective instant. <!-- implements FR8, FR9, UX2 of add-grid-hour-cells-and-hour-frame; FR7, FR13 of add-grid-meeting-range-and-share; FR13 of add-day-colouring-setting -->

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
- **GIVEN** the view mode is Grid, the stored locations are Almaty, Moscow, Kolkata and New York, the `<theme>` theme is active and the day colouring is Time of day
- **WHEN** the main page is shown at `2026-03-08T07:30:00Z`
- **THEN** one hour frame in the `<theme>` accent colour reaches from the first row to the last
- **AND** its left and right edges enclose column 12 of every row

| theme |
|---|
| light |
| dark |

#### Scenario: No hour frame during a meeting
- **GIVEN** the Grid view at `2026-03-08T07:30:00Z` with the meeting range 09:00–11:00 in Almaty
- **WHEN** the main page is shown
- **THEN** no hour frame is shown
- **WHEN** the user clears the meeting range
- **THEN** the hour frame is on column 9


#### Scenario: The frame stays visible on accent cells
- **GIVEN** the Grid view at `2026-03-09T06:00:00Z` with Almaty and the day colouring "Time of day"
- **WHEN** the user chooses the day colouring "Plain" and goes back
- **THEN** the hour frame is on column 11 in the foreground colour
- **AND** the texts of column 11 are bold

#### Scenario: Frame in the foreground colour on accent cells
- **GIVEN** the view mode is Grid, the stored locations are Almaty, Moscow, Kolkata and New York, the `<theme>` theme is active and the day colouring is `<colouring>`
- **WHEN** the main page is shown at `<instant>`
- **THEN** one hour frame in the `<theme>` foreground colour reaches from the first row to the last
- **AND** its left and right edges enclose column `<column>` of every row

| theme | colouring | instant | column |
|---|---|---|---|
| light | Plain | 2026-03-08T07:30:00Z | 12 |
| dark | Plain | 2026-03-08T07:30:00Z | 12 |
| light | Working hours | 2026-03-09T06:00:00Z | 11 |
| dark | Working hours | 2026-03-09T06:00:00Z | 11 |
