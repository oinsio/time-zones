## MODIFIED Requirements

### Requirement: Select a time on a track
Pressing a track with the pointer, or dragging its handle, SHALL pin the reference moment to the instant at the pointer's position. That instant MUST be rounded to the nearest 15-minute step counted from the start of the reference day. It MUST be clamped between the start of the day and the track end, so a selection never leaves the reference day. The track end is the last minute of the reference day: one minute before the day's end, in absolute time (23:59 in the reference zone on a day of 23, 24 or 25 hours that ends at local midnight). A position that rounds to the end of the day therefore pins the track end, so the right end of a track reaches 23:59 and the whole day from 00:00 can be selected. Every card's time, date, UTC offset and handle MUST show the new moment in the same render as the selection, with no loading state. Selecting the instant that is already pinned MUST change nothing. A selection is reported with the pinned moment as `UNIQUE`. A mouse or pen MUST select on press. A touch MUST select only once the finger has moved horizontally along the track, or when it lifts after a tap that the browser did not cancel. A touch gesture that moves mostly vertically, or that the browser cancels to scroll, MUST select nothing. On an engine without Pointer Events, a tap (a click at the tapped position) MUST select as a press does, with the same rounding and clamping; dragging along the track is not available there. On engines with Pointer Events a click MUST NOT add a selection of its own.

Inputs: the pointer's position as a fraction of the track's width, measured from the track's left edge to its right edge, the reference day, and the reference zone. Output: the pinned instant (ISO 8601 with `Z`). Errors: a selection whose instant is malformed (not ISO 8601 with `Z`) MUST be rejected as an invalid instant and MUST change nothing.

<!-- implements FR3, FR8 of add-time-sliders-to-location-cards; FR8, NFR-A2, UX1 of support-legacy-ios-12-safari; FR1, FR4 of fix-day-track-handle-overlap-and-end-of-day -->

#### Scenario: Dragging one track moves every card
- **GIVEN** the interface language is English
- **AND** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty, Moscow, Kolkata and New York
- **WHEN** the user selects three quarters of the New York track
- **THEN** the moment is pinned to `2026-03-08T13:00:00Z`
- **AND** the cards show Almaty `18:00`, Moscow `16:00`, Kolkata `18:30` and New York `09:00` `Sun, Mar 8` `UTC−4`
- **AND** every handle stands at `0.75`

#### Scenario: Selections snap to quarter hours and stay inside the day
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the user selects the fraction `<fraction>` of a track
- **THEN** the moment is pinned to `<pinned>`

| fraction | pinned |
|---|---|
| `0.52` | `2026-03-08T07:30:00Z` |
| `0.99` | `2026-03-08T18:45:00Z` |
| `0.996` | `2026-03-08T18:59:00Z` |
| `1.0` | `2026-03-08T18:59:00Z` |
| `0` | `2026-03-07T19:00:00Z` |

#### Scenario: The right end reaches the last minute of 23- and 25-hour days
- **GIVEN** the device time zone is `America/New_York`
- **AND** the moment is on `<date>` in New York
- **WHEN** the user selects the right end of a track
- **THEN** the New York card shows `23:59` on `<date>`

| date |
|---|
| `2026-03-08` |
| `2026-11-01` |

#### Scenario: Selection on a 23-hour day
- **GIVEN** the device time zone is `America/New_York`
- **AND** the moment is pinned to `2026-03-08T07:30:00Z`
- **WHEN** the user selects the middle of a track
- **THEN** the moment is pinned to `2026-03-08T16:30:00Z`
- **AND** the New York card shows `12:30`

#### Scenario: A malformed instant changes nothing
- **GIVEN** the moment is live
- **WHEN** a time selection arrives with the instant `2026-03-08T07:30:00` (no `Z`)
- **THEN** the selection is rejected as an invalid instant
- **AND** the moment is still live

#### Scenario: A tap selects a time without Pointer Events
- **GIVEN** the engine has no Pointer Events
- **AND** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **WHEN** the user taps three quarters of the New York track
- **THEN** the moment is pinned to `2026-03-08T13:00:00Z`
- **AND** the Almaty card shows `18:00`

#### Scenario: A finger tap keeps the slider accessible without Pointer Events
- **GIVEN** the engine has no Pointer Events
- **AND** the list contains Almaty and New York
- **WHEN** the user taps three quarters of the New York track with a finger
- **THEN** the moment is pinned to the time at that position
- **AND** the track keeps its slider role, accessible name and value range
- **AND** the arrow keys still move the selection by one track step

#### Scenario: A click adds nothing where Pointer Events exist
- **GIVEN** the engine has Pointer Events
- **AND** the moment is live
- **WHEN** a click arrives on a track with no pointer press before it
- **THEN** the moment is still live

### Requirement: Move the handle with the keyboard
A focused track SHALL move the reference moment by keys, counted in steps from the start of the reference day. Arrow Right and Arrow Up go to the first 15-minute step after the current value, and Arrow Left and Arrow Down to the last step before it. Page Up goes 60 minutes forward from the current step and Page Down 60 minutes back. Home goes to the start of the reference day and End to the track end, the last minute of the reference day. Every result MUST be clamped between the start of the day and the track end and pinned as a pointer selection is: a step or an hour forward that would reach or pass the end of the day pins the track end, and the previous step from the track end goes to the day's last 15-minute step. The keys MUST NOT scroll the page and MUST NOT start a card reorder. Inputs: the key, the effective instant, the reference day. Output: the pinned instant. Errors: none; other keys change nothing. <!-- implements FR4 of add-time-sliders-to-location-cards; FR2 of fix-day-track-handle-overlap-and-end-of-day -->

#### Scenario: Keys from a pinned quarter hour
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the moment is pinned to `2026-03-08T07:30:00Z`
- **WHEN** the user moves the handle with `<key>`
- **THEN** the moment is pinned to `<pinned>`

| key | pinned |
|---|---|
| next step | `2026-03-08T07:45:00Z` |
| previous step | `2026-03-08T07:15:00Z` |
| one hour forward | `2026-03-08T08:30:00Z` |
| one hour back | `2026-03-08T06:30:00Z` |
| start of day | `2026-03-07T19:00:00Z` |
| end of day | `2026-03-08T18:59:00Z` |

#### Scenario: Keys from a live moment between steps
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:37:00Z` and the moment is live
- **WHEN** the user moves the handle to the next step
- **THEN** the moment is pinned to `2026-03-08T07:45:00Z`
- **WHEN** the user returns to now and moves the handle to the previous step
- **THEN** the moment is pinned to `2026-03-08T07:30:00Z`

#### Scenario: Keys stop at the ends of the day
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the moment is pinned to `2026-03-08T18:59:00Z`
- **WHEN** the user moves the handle to the next step
- **THEN** the moment is still pinned to `2026-03-08T18:59:00Z`

#### Scenario: Keys around the track end
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the moment is pinned to `<from>`
- **WHEN** the user moves the handle with `<key>`
- **THEN** the moment is pinned to `<pinned>`

| from | key | pinned |
|---|---|---|
| `2026-03-08T18:45:00Z` | next step | `2026-03-08T18:59:00Z` |
| `2026-03-08T18:30:00Z` | one hour forward | `2026-03-08T18:59:00Z` |
| `2026-03-08T18:59:00Z` | previous step | `2026-03-08T18:45:00Z` |
| `2026-03-08T18:59:00Z` | one hour back | `2026-03-08T18:00:00Z` |

### Requirement: Accessible day tracks
The page with tracks SHALL have no axe-core violations in the light and dark themes, with the moment live and pinned by a time selection. Each track MUST be one Tab stop, in card order, and MUST show a visible focus ring around its handle while focused. Each track MUST be exposed as a slider. Its accessible name is "Time in {city}" in English or "Время — {city}" in Russian. Its value is the minutes elapsed since the start of the reference day: the minimum is 0 and the maximum is the track end, the last minute of the day (1439 on a 24-hour day, 1379 on a 23-hour day, 1499 on a 25-hour day). Its value text is the card's local time and date ("12:30, Sun, Mar 8"). The time and date of the card MUST stay outside any live region, so selections and minute updates are not announced beyond the slider's own value. <!-- implements NFR-A1, NFR-A2, NFR-A3 of add-time-sliders-to-location-cards; FR3, NFR-A1 of fix-day-track-handle-overlap-and-end-of-day -->

#### Scenario: No accessibility violations with tracks
- **GIVEN** the list contains Almaty and New York
- **WHEN** the list is shown live and after a time selection, in the light or the dark theme
- **THEN** axe-core reports no violations

#### Scenario: Slider name, range and value
- **GIVEN** the interface language is English
- **AND** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty
- **WHEN** the user opens the app
- **THEN** the slider "Time in Almaty" has the value 750 within 0 to 1439 and the value text `12:30, Sun, Mar 8`

#### Scenario: End of the day on the slider
- **GIVEN** the interface language is English
- **AND** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty
- **WHEN** the user focuses the Almaty slider and presses End
- **THEN** the slider "Time in Almaty" has the value 1439 and the value text `23:59, Sun, Mar 8`

#### Scenario: Keyboard moves every card
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user focuses the Moscow slider with Tab and presses Page Up twice and Arrow Right once
- **THEN** the Almaty card shows `14:45` and the Moscow card shows `12:45`
- **AND** the page has not scrolled and the list order is unchanged

#### Scenario: Visible focus
- **WHEN** a slider receives focus from the keyboard
- **THEN** a focus ring in the accent colour is visible around its handle

### Requirement: Day track layout
Below 768 px the track SHALL sit on its own line under the city and time line, spanning the card's content width, 10 px high and without hour labels. From 768 px it MUST sit on the city line, right of the time column, filling the remaining width, 12 px high, with the hour labels under it. The handle's centre MUST be exactly at the effective instant's position, with the start of the day at the track's left edge and its end at the right edge. The visible handle is a circle, 28 px below 768 px and 32 px from 768 px, filled with the surface colour and outlined with the foreground colour. The slider's hit area MUST be at least 44 px high and its handle at least 44 × 44 px. The hour labels are muted text with tabular figures; the first stands under the track's left edge and the last under its right edge.

From 768 px the handle MUST NOT cover the elements beside its track at any position of the reference day: with the handle at the start of the day, its 44 × 44 px hit area stays inside the slider's hit area and at least 12 px of free space separates the visible handle from the row's time; with the handle at the track end, the same holds for the element right of the track (the location menu button of a location card). The time and the location menu button stay fully visible and operable. Below 768 px the track keeps spanning the card's content width.

A horizontal drag on a track MUST NOT scroll the page and MUST NOT move the card in the list. A vertical swipe that starts on a track still scrolls the page and MUST NOT select a time; a finger tap on a track selects the time at that position. The page with tracks MUST NOT scroll horizontally at 320 px, 768 px and 2560 px. The approved screenshots at 375 px and 1024 px in both themes MUST show the tracks: the "list", "pinned" and "calendar" states and a new "time-selected" state.

<!-- implements FR3, NFR-R1, NFR-R2, NFR-R3, UX1, UX2, UX3 of add-time-sliders-to-location-cards; FR1, FR4, NFR-R1, NFR-R2, UX1 of fix-day-track-handle-overlap-and-end-of-day -->

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
- **AND** the moment is still live and the Now button is not shown

#### Scenario: A finger tap on a track selects a time
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the list is shown 375 px wide
- **WHEN** the user taps three quarters of the Almaty track with a finger
- **THEN** the Almaty card shows `18:00` and the Now button is shown

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

