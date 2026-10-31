## MODIFIED Requirements

### Requirement: Day track layout
Below 768 px the track SHALL sit on its own line under the city and time line, spanning the card's content width, 10 px high and without hour labels. From 768 px it MUST sit on the city line, right of the time column, filling the remaining width, 12 px high, with the hour labels under it; every track of the list MUST then have the same width, within 1 px, whatever the local times of the cards and in both hour formats. The handle's centre MUST be exactly at the effective instant's position, with the start of the day at the track's left edge and its end at the right edge. The one exception is the dragged handle during an active drag: its centre MUST be at the pointer's horizontal position, within 1 px, clamped to the track's edges, and MUST be at the effective instant's position again, within 1 px, once the drag ends ("Handle position"). The visible handle is a circle, 28 px below 768 px and 32 px from 768 px, filled with the fill of the card it stands on and outlined with the foreground colour, in the light and the dark theme, whether the dark theme comes from the system or from the Dark theme preference. The slider's hit area MUST be at least 44 px high and its handle at least 44 × 44 px. The hour labels are muted text with tabular figures; the first stands under the track's left edge and the last under its right edge, within 1 px, and every label MUST be on one line in both hour formats and both interface languages.

From 768 px the handle MUST NOT cover the elements beside its track at any position of the reference day: with the handle at the start of the day, its 44 × 44 px hit area stays inside the slider's hit area and at least 12 px of free space separates the visible handle from the row's time; with the handle at the track end, the same holds for the element right of the track (the location menu button of a location card). The time and the location menu button stay fully visible and operable. Below 768 px the track keeps spanning the card's content width.

A horizontal drag on a track MUST NOT scroll the page and MUST NOT move the card in the list. A vertical swipe that starts on a track still scrolls the page and MUST NOT select a time; a finger tap on a track selects the time at that position. The page with tracks MUST NOT scroll horizontally at 320 px, 768 px and 2560 px. The approved screenshots at 375 px and 1024 px in both themes MUST show the tracks: the "list", "pinned", "calendar" and "time-selected" states, and a new "12-hour" state with the 12-hour format.

<!-- implements FR3, NFR-R1, NFR-R2, NFR-R3, UX1, UX2, UX3 of add-time-sliders-to-location-cards; FR1, FR4, NFR-R1, NFR-R2, UX1 of fix-day-track-handle-overlap-and-end-of-day; FR2, FR3 of keep-now-button-visible-when-live; FR3, NFR-R1, UX2 of fix-day-track-drag-continuity-and-smoothness; FR2, FR5, FR6, NFR-R1, UX3, UX4 of fix-location-card-and-header-layout -->

#### Scenario: Track under the text on a narrow screen
- **GIVEN** the list contains Almaty and Moscow
- **WHEN** the list is shown 375 px wide
- **THEN** the Almaty track is below its city and time and spans the card's content width
- **AND** the track is 10 px high and the visible handle 28 px wide

#### Scenario: Track beside the time on a wide screen
- **GIVEN** the list contains Almaty and Moscow
- **WHEN** the list is shown 1024 px wide
- **THEN** the Almaty track is right of its time column, on the same line, and its hour labels are under it
- **AND** the track is 12 px high and the visible handle 32 px wide

#### Scenario: Handle centre matches the instant
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **WHEN** the list is shown 375 px or 1024 px wide
- **THEN** the centre of the Almaty handle is at `0.520833` of the track's width from its left edge, within 1 px

#### Scenario: The dragged handle stays under the pointer
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the list is shown 375 px or 1024 px wide
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
- **THEN** the Almaty handle's hit area lies inside its slider's hit area
- **AND** at least 12 px separate the visible handle from the Almaty time and from the Almaty location menu button

| width | end |
|---|---|
| 768 | start |
| 768 | track end |
| 1024 | start |
| 1024 | track end |

#### Scenario: A vertical swipe on a track scrolls without selecting a time
- **GIVEN** the moment is live
- **AND** the list is long enough to scroll on a 375 px wide screen
- **WHEN** the user swipes up with a finger starting on the Almaty track
- **THEN** the page has scrolled
- **AND** the moment is still live and the Now button is inactive

#### Scenario: A finger tap on a track selects a time
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the list is shown 375 px wide
- **WHEN** the user taps three quarters of the Almaty track with a finger
- **THEN** the Almaty card shows `18:00` and the Now button is active

#### Scenario: Touch targets
- **WHEN** the list with tracks is shown at 320 px or 1024 px
- **THEN** every slider's hit area is at least 44 px high and every handle's hit area at least 44 × 44 px

#### Scenario: Tracks fit narrow and wide screens
- **GIVEN** the list is Almaty, Kathmandu, New York and Tokyo
- **WHEN** the list is shown at 320 px, 768 px or 2560 px
- **THEN** the page does not scroll horizontally

#### Scenario: Screenshots show the tracks
- **GIVEN** the current time is `2026-03-08T07:30:00Z`
- **WHEN** the "list", "pinned", "calendar", "time-selected" and "12-hour" states are shown at 375 px or 1024 px in the light or the dark theme
- **THEN** each matches its approved screenshot

#### Scenario: The handle is filled with its card's fill
- **GIVEN** the list contains Almaty and Moscow
- **AND** the theme is `<theme>`
- **WHEN** the list is shown `<width>` px wide
- **THEN** the inside of the Almaty handle has the colour of the Almaty card's fill
- **AND** in the dark theme that colour differs from the page background

| theme | width |
|---|---|
| dark from the system | 375 |
| dark from the system | 1024 |
| Dark preference with a light system | 375 |
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
- **WHEN** the list is shown at 320 px, 768 px or 2560 px
- **THEN** the page does not scroll horizontally

### Requirement: Wall-time input layout
With the field open or a hint shown, the page SHALL NOT scroll horizontally at 320 px and 2560 px. The open field MUST take the place of the time and MUST NOT change the card's size. The hint MUST be the last element of its card on every width: under the day track (and its hour labels from 768 px) and under the location menu button, spanning the card's content width. It MUST wrap inside the card and take colours from design tokens. While a hint is shown, the city, the time, the day track and the location menu button of that card MUST keep their positions and sizes, within 1 px, compared to the same card without the hint; only the card's height grows by the hint. The hint MUST stay a polite status, and its place in the card MUST NOT change what is announced. Screenshots at 375 and 1024 px, in both themes, MUST include an open field and a hint. <!-- implements NFR-R1, NFR-R2, UX2, UX3 of add-wall-time-input-with-hint; FR1, NFR-A2, NFR-R1, UX1 of fix-location-card-and-header-layout -->

#### Scenario: No horizontal scrolling
- **GIVEN** the viewport is `<width>` px wide
- **AND** New York shows a wall-time hint
- **WHEN** the user opens the wall-time input of Almaty
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 2560 |


#### Scenario: The hint is the bottom line of its card
- **GIVEN** the viewport is `<width>` px wide
- **AND** the list contains Almaty and New York
- **AND** the positions and sizes of the New York city, time, day track and location menu button are noted
- **WHEN** a wall-time input of `02:30` in New York on `2026-03-08` shows the GAP hint
- **THEN** the hint is below the New York day track and its location menu button, inside the card
- **AND** the New York city, time, day track and location menu button keep their noted positions and sizes, within 1 px
- **AND** the hint is announced as a polite status

| width |
|---|
| 375 |
| 1024 |

#### Scenario: Hint screenshots
- **GIVEN** New York shows the GAP hint
- **WHEN** the page is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** it matches the re-approved "wall-time-hint" screenshot
