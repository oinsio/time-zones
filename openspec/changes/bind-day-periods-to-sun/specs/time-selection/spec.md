# Spec Delta: time-selection

## REMOVED Requirements

### Requirement: Day-period colours
**Reason**: Day periods are no longer bounded by the clock (07:00, 09:00, 18:00, 22:00): the work period, the boundaries of skipped or repeated local times and the hard colour edge at a clock change are gone (FR5, FR9 of bind-day-periods-to-sun).
**Migration**: Replaced by "Day-period colours by the sun": a track in the Time of day colouring is coloured by the day periods of the `day-periods` capability, with 30-minute blend windows and no colour edge at a clock change.

## ADDED Requirements

### Requirement: Day-period colours by the sun
While the day colouring is Time of day (the default, see the `day-colouring` capability), each track SHALL be coloured by its location's day periods as the `day-periods` capability defines them: night, morning, day and evening by the sun's elevation at the location's coordinates. The colour at a position MUST be the colour of the day period at that position's instant, except inside blend windows. Each day-period boundary that occurs during the reference day blends the colours of the two periods linearly over a blend window of 30 minutes of absolute time centred on the boundary's instant. A blend window MUST NOT pass the midpoint between its boundary and the neighbouring boundary; it is shortened on that side instead.

A clock change inside the reference day MUST NOT make a colour edge and MUST NOT move a boundary in absolute time. A day in which the sun crosses no threshold has no boundary, and the track is one colour. The colours MUST be the night, morning, daylight and evening design tokens of the active theme, light or dark. Colours also differ in lightness, as the tokens do. A location without day periods is coloured as the `day-colouring` requirement "Locations without day periods" defines.

Inputs: the location's coordinates and the reference day. Output: the colour stops, each a position (fraction of the day) and a period. Positions may lie slightly outside 0–1 for a window that crosses an end of the day. Errors: none.

In the Plain and the Working hours day colourings the track is coloured as the `day-colouring` capability defines, and this requirement does not apply.

<!-- implements FR5, FR9, UX1 of bind-day-periods-to-sun; continues FR6 of add-time-sliders-to-location-cards and FR2, FR9, FR10 of add-day-colouring-setting -->

#### Scenario: Colour stops of Almaty and New York
- **GIVEN** the day colouring is Time of day and the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the tracks of Almaty at 43.3, 76.9 and New York at 40.7, −74.0 are presented
- **THEN** the colour stops of `<city>` change period, in order, around `<boundaries>` in the time of `Asia/Almaty`
- **AND** each pair of stops is 30 minutes apart and centred within 3 minutes of that time

| city | boundaries |
|---|---|
| Almaty | night to morning 05:48, morning to day 06:55, day to evening 17:11, evening to night 18:18 |
| New York | day to evening 03:17, evening to night 04:21, night to morning 15:51, morning to day 16:55 |

#### Scenario: Colours follow the day period outside blend windows
- **GIVEN** the reference day of the previous scenario
- **WHEN** the colour of the Almaty and New York tracks is read at each quarter-hour position of the day that lies outside a blend window
- **THEN** it is the colour of that location's day period at that instant

#### Scenario: Morning and evening are visible bands
- **GIVEN** the day colouring is Time of day and Moscow at 55.8, 37.6
- **WHEN** its track is presented for 8 March 2026
- **THEN** the morning band, between its two boundaries, is between 3% and 7% of the track

#### Scenario: A blend window stops at the midpoint
- **GIVEN** two day-period boundaries 20 minutes apart inside the reference day
- **WHEN** the colour stops are assembled
- **THEN** the blend windows of the two boundaries meet at the midpoint between them and do not overlap

#### Scenario: A clock change makes no colour edge
- **GIVEN** the day colouring is Time of day and the device time zone is `America/New_York`
- **AND** the moment is pinned to noon of 8 March 2026, when the clocks of New York go forward
- **WHEN** the track of New York is presented
- **THEN** no two colour stops stand at the position of the clock change
- **AND** the stops are those of the four day-period boundaries of that day

#### Scenario: A polar day is one colour
- **GIVEN** the day colouring is Time of day and the location Longyearbyen at 78.2, 15.6
- **WHEN** its track is presented for 21 June 2026
- **THEN** the whole track is the daylight colour

#### Scenario: A polar night is one colour
- **GIVEN** the day colouring is Time of day and the location Longyearbyen at 78.2, 15.6
- **WHEN** its track is presented for 21 December 2026
- **THEN** the whole track is the night colour

#### Scenario: Colours come from the theme tokens
- **GIVEN** the list contains Almaty
- **WHEN** the list is shown in the light or the dark theme
- **THEN** the colours of the Almaty track are the night, morning, daylight and evening token colours of that theme
