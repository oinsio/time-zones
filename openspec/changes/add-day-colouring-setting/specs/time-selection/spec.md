## MODIFIED Requirements

### Requirement: Day-period colours
While the day colouring is Time of day (the default, see the `day-colouring` capability), each track SHALL be coloured by its location's day periods in the location's own local time: night from 22:00 to 07:00, morning from 07:00 to 09:00, working hours from 09:00 to 18:00, evening from 18:00 to 22:00. The colour at a position MUST be the colour of the period of the location's local time at that position's instant, except inside blend windows. Each boundary that occurs during the reference day blends the colours of the two periods linearly over a window of absolute time centred on the boundary's instant. The window is 60 minutes for 07:00 and 22:00, and 15 minutes for 09:00 and 18:00.

A boundary whose local time does not exist on that local date (a DST gap) MUST be skipped. A boundary whose local time occurs twice uses the earlier instant. An offset change inside the reference day after which the local time falls in another period than just before it MUST be a hard colour edge at the instant of the change. The colours MUST be the night, morning, working-hours and evening design tokens of the active theme, light or dark. Colours also differ in lightness, as the tokens do.

Inputs: the location's IANA identifier and the reference day. Output: the colour stops, each a position (fraction of the day) and a period. Positions may lie slightly outside 0–1 for a window that crosses an end of the day. Errors: none for known zones; unknown zones have no track.

In the Plain and the Working hours day colourings the track is coloured as the `day-colouring` capability defines, and this requirement does not apply.

<!-- implements FR6 of add-time-sliders-to-location-cards; FR2, FR9, FR10 of add-day-colouring-setting -->

#### Scenario: Colour stops of Almaty and New York
- **GIVEN** the day colouring is Time of day and the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the tracks of Almaty and New York are presented
- **THEN** the colour stops of `<city>` are `<stops>` (±0.000001)

| city | stops |
|---|---|
| Almaty | `0.270833` night, `0.3125` morning, `0.369792` morning, `0.380208` working, `0.744792` working, `0.755208` evening, `0.895833` evening, `0.9375` night |
| New York | `0.161458` working, `0.171875` evening, `0.3125` evening, `0.354167` night, `0.645833` night, `0.6875` morning, `0.744792` morning, `0.755208` working |

#### Scenario: Colours follow the local period outside blend windows
- **GIVEN** the reference day of the previous scenario
- **WHEN** the colour of the Almaty and New York tracks is read at each quarter-hour position of the day that lies outside a blend window
- **THEN** it is the colour of the period of that location's local time at that instant

#### Scenario: Boundaries of a skipped local date are left out
- **GIVEN** the device time zone is `UTC`
- **AND** the moment is pinned to `2011-12-30T12:00:00Z`
- **WHEN** the track of Apia (`Pacific/Apia`) is presented
- **THEN** no colour stop comes from a boundary of the local date `2011-12-30`, which Apia skipped
- **AND** the stops are `0.161458` working, `0.171875` evening, `0.3125` evening, `0.354167` night, `0.6875` night, `0.729167` morning, `0.786458` morning, `0.796875` working (±0.000001)

#### Scenario: A period change across an offset change is a hard edge
- **GIVEN** an offset change inside the reference day at the position `0.5`
- **AND** the local time is in the evening just before it and in the night just after it
- **WHEN** the colour stops are assembled
- **THEN** two stops at `0.5` change from evening to night, with no blend between them

#### Scenario: Colours come from the theme tokens
- **GIVEN** the list contains Almaty
- **WHEN** the list is shown in the light or the dark theme
- **THEN** the colours of the Almaty track are the night, morning, working-hours and evening token colours of that theme
