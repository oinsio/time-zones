## MODIFIED Requirements

### Requirement: Time selection works with the date bar
A time selection from a live moment SHALL pin the moment, so the date bar's Now button becomes active. Now MUST return the moment to live: every handle shows the current instant at once and follows the clock again. A date change after a time selection keeps the selected wall-clock time in the reference zone (see the `date-selection` capability). The handles therefore keep their position, unless the new day's length or a DST gap moves them. Errors: none. <!-- implements FR5 of add-time-sliders-to-location-cards; FR3 of keep-now-button-visible-when-live -->

#### Scenario: Now after selecting a time
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty
- **WHEN** the user selects three quarters of the Almaty track
- **THEN** the Now button is active
- **WHEN** the user returns to now
- **THEN** the moment is live
- **AND** the Almaty card shows `12:30` and its handle stands at `0.520833` (±0.000001)

#### Scenario: A date change keeps the selected time
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the moment is pinned to `2026-03-08T13:00:00Z`
- **WHEN** the user moves to the next day
- **THEN** the moment is pinned to `2026-03-09T13:00:00Z`
- **AND** every handle still stands at `0.75`


### Requirement: Day track layout
Below 768 px the track SHALL sit on its own line under the city and time line, spanning the card's content width, 10 px high and without hour labels. From 768 px it MUST sit on the city line, right of the time column, filling the remaining width, 12 px high, with the hour labels under it. The handle's centre MUST be exactly at the effective instant's position, with the start of the day at the track's left edge and its end at the right edge. The visible handle is a circle, 28 px below 768 px and 32 px from 768 px, filled with the surface colour and outlined with the foreground colour. The slider's hit area MUST be at least 44 px high and its handle at least 44 × 44 px. The hour labels are muted text with tabular figures; the first stands under the track's left edge and the last under its right edge.

From 768 px the handle MUST NOT cover the elements beside its track at any position of the reference day: with the handle at the start of the day, its 44 × 44 px hit area stays inside the slider's hit area and at least 12 px of free space separates the visible handle from the row's time; with the handle at the track end, the same holds for the element right of the track (the location menu button of a location card). The time and the location menu button stay fully visible and operable. Below 768 px the track keeps spanning the card's content width.

A horizontal drag on a track MUST NOT scroll the page and MUST NOT move the card in the list. A vertical swipe that starts on a track still scrolls the page and MUST NOT select a time; a finger tap on a track selects the time at that position. The page with tracks MUST NOT scroll horizontally at 320 px, 768 px and 2560 px. The approved screenshots at 375 px and 1024 px in both themes MUST show the tracks: the "list", "pinned" and "calendar" states and a new "time-selected" state.

<!-- implements FR3, NFR-R1, NFR-R2, NFR-R3, UX1, UX2, UX3 of add-time-sliders-to-location-cards; FR1, FR4, NFR-R1, NFR-R2, UX1 of fix-day-track-handle-overlap-and-end-of-day; FR2, FR3 of keep-now-button-visible-when-live -->

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
- **WHEN** the "list", "pinned", "calendar" and "time-selected" states are shown at 375 px or 1024 px in the light or the dark theme
- **THEN** each matches its approved screenshot


### Requirement: The pinned wall-time moment drives every row
After a wall-time input, every row's time, date, UTC offset and handle SHALL show the new moment in the same render. When the instant lies outside the current reference day, the day tracks and the date bar MUST move to the reference day that contains it. From live, the input MUST make the Now button active, and Now MUST return to live. Typing the instant already pinned, with the same outcome in the same row, MUST change nothing. <!-- implements FR4, FR8 of add-wall-time-input-with-hint; FR3 of keep-now-button-visible-when-live -->

#### Scenario: The typed instant leaves the reference day
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **WHEN** the user types `23:00` in New York
- **THEN** the moment is pinned to `2026-03-09T03:00:00Z`
- **AND** the date bar shows 9 March
- **AND** the reference day runs from `2026-03-08T19:00:00Z` to `2026-03-09T19:00:00Z`
- **AND** the Now button is active


