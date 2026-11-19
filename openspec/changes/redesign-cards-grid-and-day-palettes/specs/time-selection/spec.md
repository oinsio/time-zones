## ADDED Requirements

### Requirement: Earlier layout defects stay fixed
The redesigned cards SHALL keep out the five defects fixed earlier (`spec.md` §12 of the redesign), each checked by one automated scenario in a real browser: (1) the visible handle MUST NOT cover the time or the location menu button of its card at any position of the reference day, on every width (`fix-day-track-handle-overlap-and-end-of-day`); (2) every day track of the list MUST have the same width, within 1 px, in the 12-hour and the 24-hour format (`fix-location-card-and-header-layout`); (3) every hour label MUST be on one line and no two hour labels of a track MUST touch; (4) the visible handle MUST be filled with the surface colour of its own card; (5) a wall-time hint or a clock change note MUST stay the last element of its card and MUST NOT move or resize the city, the time, the day track or the location menu button, within 1 px. Inputs: the list, the width, the hour format, the theme and the day palette. Output: the measured layout. Errors: none. <!-- implements FR20, FR21, FR22, FR23, FR24 of redesign-cards-grid-and-day-palettes -->

#### Scenario: The handle never covers the time or the menu button
- **GIVEN** the list contains Almaty and Moscow
- **AND** the list is shown `<width>` px wide
- **WHEN** the user moves the Almaty handle to the `<end>` of the day
- **THEN** the visible Almaty handle does not overlap the Almaty time or the Almaty location menu button
- **AND** the visible handle lies inside the Almaty card

| width | end |
|---|---|
| 320 | start |
| 320 | track end |
| 390 | track end |
| 768 | start |
| 768 | track end |
| 1440 | track end |

#### Scenario: Tracks of equal width in both hour formats
- **GIVEN** the interface language is English, the hour format is `<format>` and the current time is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow, New York, Tokyo and Kolkata
- **WHEN** the list is shown `<width>` px wide
- **THEN** the four day tracks have the same width, within 1 px

| format | width |
|---|---|
| 12-hour | 390 |
| 12-hour | 768 |
| 12-hour | 1440 |
| 24-hour | 820 |

#### Scenario: Hour labels on one line and apart
- **GIVEN** the interface language is `<language>`, the hour format is 12-hour and the current time is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow, Kolkata and Kathmandu
- **WHEN** the list is shown `<width>` px wide
- **THEN** every hour label is on one line
- **AND** between any two neighbouring hour labels of a track there is at least 1 px of free space

| language | width |
|---|---|
| English | 768 |
| Russian | 768 |
| English | 1024 |

#### Scenario: The handle has the fill of its own card
- **GIVEN** the list contains Almaty and Moscow, the `<theme>` theme and the `<palette>` day palette
- **WHEN** the list is shown `<width>` px wide
- **THEN** the inside of each visible handle has the background colour of its own card

| theme | palette | width |
|---|---|---|
| light | Vivid | 390 |
| dark | Vivid | 390 |
| light | Muted | 1024 |
| dark | Muted | 1024 |

#### Scenario: A hint does not reshape its card
- **GIVEN** the current time is `2026-03-08T07:30:00Z` and the list contains New York and Moscow
- **AND** the list is shown `<width>` px wide
- **WHEN** the user types `0230` into New York's time
- **THEN** New York's wall-time hint is the last element of its card
- **AND** New York's city, time, day track and location menu button keep their positions and sizes, within 1 px, compared with before the input

| width |
|---|
| 390 |
| 1024 |

## MODIFIED Requirements

### Requirement: Day track layout
On every width the track SHALL sit on its own line, spanning the card's content width: below 768 px under the zone line and the date, 12 px below them, without hour labels; from 768 px under the first line of the card, with the hour labels under it. The bar MUST be 12 px high and fully rounded on every width. The handle's centre MUST be exactly at the effective instant's position, with the start of the day at the track's left edge and its end at the right edge. The one exception is the dragged handle during an active drag: its centre MUST be at the pointer's horizontal position, within 1 px, clamped to the track's edges, and MUST be at the effective instant's position again, within 1 px, once the drag ends ("Handle position"). The visible handle is a circle of 23 px on every width, filled with the surface colour of the card it stands on and outlined with the handle border token (2 px in the light theme, 3 px in the dark theme), whether the dark theme comes from the system or from the Dark theme preference. The slider's hit area MUST be at least 44 px high and its handle's hit area at least 44 × 44 px, as built; the bar spans the card's content width, and the visible handle MUST stay inside its card at every position. The hour labels are 12 px, muted, with tabular figures; the first stands under the track's left edge and the last under its right edge, within 1 px, and every label MUST be on one line in both hour formats and both interface languages.
A horizontal drag on a track MUST NOT scroll the page and MUST NOT move the card in the list. A vertical swipe that starts on a track still scrolls the page and MUST NOT select a time; a finger tap on a track selects the time at that position. The page with tracks MUST NOT scroll horizontally at 320, 390, 768, 820, 1024, 1440 and 2560 px, in both hour formats. The approved screenshots of the main page in Cards MUST show the tracks. <!-- implements FR3, NFR-R1, NFR-R2, NFR-R3, UX1, UX2, UX3 of add-time-sliders-to-location-cards; FR1, FR4, NFR-R1, NFR-R2, UX1 of fix-day-track-handle-overlap-and-end-of-day; FR2, FR3 of keep-now-button-visible-when-live; FR3, NFR-R1, UX2 of fix-day-track-drag-continuity-and-smoothness; FR2, FR5, FR6, NFR-R1, UX3, UX4 of fix-location-card-and-header-layout; FR13, NFR-R1 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Track under the text on a narrow screen
- **GIVEN** the list contains Almaty and Moscow
- **WHEN** the list is shown 390 px wide
- **THEN** the Almaty track is below its zone line and date and spans the card's content width
- **AND** the bar is 12 px high and the visible handle 23 px wide
- **AND** no hour label is shown

#### Scenario: Track on its own line on a wide screen
- **GIVEN** the list contains Almaty and Moscow
- **WHEN** the list is shown 1024 px wide
- **THEN** the Almaty track is on its own line below the line of its city and time, spans the card's content width and has its hour labels under it
- **AND** the bar is 12 px high and the visible handle 23 px wide

#### Scenario: Handle border by theme
- **GIVEN** the list contains Almaty
- **WHEN** the list is shown in the `<theme>` theme
- **THEN** the visible handle's border is `<width>` px in the colour `<colour>`

| theme | width | colour |
|---|---|---|
| light | 2 | `#1c1c20` |
| dark | 3 | `#f8f9ff` |

#### Scenario: Handle centre matches the instant
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **WHEN** the list is shown 390 px or 1024 px wide
- **THEN** the centre of the Almaty handle is at `0.520833` of the track's width from its left edge, within 1 px

#### Scenario: The dragged handle stays under the pointer
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the list is shown 390 px or 1024 px wide
- **WHEN** the user drags the Almaty handle and holds the pointer at `0.512` of the track's width
- **THEN** the centre of the Almaty handle is at `0.512` of the track's width from its left edge, within 1 px
- **AND** after the release it is at `0.510417` of the track's width, within 1 px

#### Scenario: Drag without scrolling or reordering
- **GIVEN** the list contains Almaty, Moscow and New York
- **WHEN** the user drags the Moscow handle horizontally to the right end of its track
- **THEN** the page has not scrolled and the list order is still Almaty, Moscow, New York
- **AND** every card shows the moment of the track end, Almaty `23:59`

#### Scenario: The handle stays clear of the time and the menu
- **GIVEN** the list contains Almaty and Moscow
- **AND** the list is shown `<width>` px wide
- **WHEN** the user moves the Almaty handle to the `<end>` of the day
- **THEN** the visible Almaty handle lies inside the Almaty card
- **AND** the visible handle does not overlap the Almaty time or the Almaty location menu button

| width | end |
|---|---|
| 390 | start |
| 390 | track end |
| 1024 | start |
| 1024 | track end |

#### Scenario: A vertical swipe on a track scrolls without selecting a time
- **GIVEN** the moment is live
- **AND** the list is long enough to scroll on a 390 px wide screen
- **WHEN** the user swipes up with a finger starting on the Almaty track
- **THEN** the page has scrolled
- **AND** the moment is still live and the Now button is inactive

#### Scenario: A finger tap on a track selects a time
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the list is shown 390 px wide
- **WHEN** the user taps three quarters of the Almaty track with a finger
- **THEN** the Almaty card shows `18:00` and the Now button is active

#### Scenario: Touch targets
- **WHEN** the list with tracks is shown at 320 px or 1024 px
- **THEN** every slider's hit area is at least 44 px high and every handle's hit area at least 44 × 44 px

#### Scenario: Tracks fit narrow and wide screens
- **GIVEN** the list is Almaty, Kathmandu, New York and Tokyo
- **WHEN** the list is shown at 320, 390, 768, 820, 1024, 1440 and 2560 px
- **THEN** the page does not scroll horizontally

#### Scenario: Screenshots show the tracks
- **GIVEN** the current time is `2026-03-08T07:30:00Z`
- **WHEN** the main page in Cards is shown at 375 px or 1024 px in the light or the dark theme, live, pinned and in the 12-hour format
- **THEN** each matches its approved screenshot, re-taken once for the redesign

#### Scenario: The handle is filled with its card's fill
- **GIVEN** the list contains Almaty and Moscow
- **AND** the theme is `<theme>`
- **WHEN** the list is shown `<width>` px wide
- **THEN** the inside of the Almaty handle has the colour of the Almaty card's fill
- **AND** in the dark theme that colour differs from the page background

| theme | width |
|---|---|
| dark from the system | 390 |
| dark from the system | 1024 |
| Dark preference with a light system | 390 |
| Dark preference with a light system | 1024 |
| light | 1024 |

#### Scenario: Equal tracks in the 12-hour format
- **GIVEN** the interface language is English
- **AND** the hour format is 12-hour
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow, New York, Tokyo and Kolkata
- **WHEN** the list is shown `<width>` px wide
- **THEN** the four day tracks have the same width, within 1 px
- **AND** every hour label of the four tracks is on one line
- **AND** the last hour label of each track ends under the track's right edge, within 1 px

| width |
|---|
| 768 |
| 1024 |
| 1440 |

#### Scenario: Hour labels on one line in Russian
- **GIVEN** the interface language is Russian
- **AND** the hour format is 12-hour
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow and Kolkata
- **WHEN** the list is shown 1024 px wide
- **THEN** every hour label of both tracks is on one line

#### Scenario: Tracks in the 12-hour format fit narrow and wide screens
- **GIVEN** the hour format is 12-hour
- **AND** the list is Almaty, Kathmandu, New York and Tokyo
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** New York shows a wall-time hint
- **WHEN** the list is shown at 320, 390, 768, 820, 1024, 1440 and 2560 px
- **THEN** the page does not scroll horizontally
