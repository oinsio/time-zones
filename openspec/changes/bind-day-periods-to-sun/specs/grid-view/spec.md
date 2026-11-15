# Spec Delta: grid-view

## MODIFIED Requirements

### Requirement: Hour cell colour
While the day colouring is Time of day (the default, see the `day-colouring` capability), an hour cell SHALL be coloured by the location's day period (night, morning, day, evening, as the `day-periods` capability defines them) that covers the largest part of the cell, and on a tie by the earlier one, with the day-period colour of the active theme that the day track uses. A cell of a location without day periods is coloured as the `day-colouring` requirement "Locations without day periods" defines. In the dark theme the digits on morning, day and evening cells MUST be `#0F1729`. In the Plain day colouring every cell is plain, and in the Working hours day colouring each cell is working or non-working, as the `day-colouring` capability defines; the digits then take the colour that the requirement "Day colours are readable" of that capability sets for the cell colour. A change of the day colouring MUST recolour every cell at once. <!-- implements FR4 of add-grid-hour-cells-and-hour-frame; FR2, FR9, FR11, FR12 of add-day-colouring-setting; FR6 of bind-day-periods-to-sun -->

#### Scenario: Day periods of Almaty
- **GIVEN** the day colouring is Time of day, the reference zone is `Asia/Almaty` and the reference day is 2026-03-08
- **WHEN** the hour cells of Almaty at 43.3, 76.9 are presented
- **THEN** columns 0–5 and 18–23 are night, column 6 is morning, columns 7–16 are day and column 17 is evening

#### Scenario: The larger part decides
- **GIVEN** a location whose night ends at 06:05 and whose day starts at 06:55 local time
- **WHEN** its hour cells are presented in the Time of day colouring
- **THEN** the cell that starts at 06:00 is morning
- **AND** the cell that starts at 07:00 is day

#### Scenario: A tie takes the earlier period
- **GIVEN** a location whose night ends at 06:30 local time and whose day starts after 07:00
- **WHEN** its hour cells are presented in the Time of day colouring
- **THEN** the cell that starts at 06:00 is night

#### Scenario: Theme colours of the cells
- **GIVEN** the view mode is Grid, the stored location is Almaty at 43.3, 76.9 and the `<theme>` theme is active
- **WHEN** the main page is shown at `2026-03-08T07:30:00Z`
- **THEN** column 3 has the `<theme>` night colour, column 6 the morning colour, column 9 the daylight colour and column 17 the evening colour

| theme |
|---|
| light |
| dark |
