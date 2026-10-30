## MODIFIED Requirements

### Requirement: Handle position
The handle of every track SHALL stand at the position of the effective instant within the reference day. The position is the elapsed absolute time since the start of the day divided by the day's length, a fraction from 0 to 1, and it MUST be the same on every card. While the moment is live the handle MUST follow the clock at every minute update, and when the day changes at midnight of the reference zone the track moves to the new day. While the moment is pinned the handle MUST stay where it is. The one exception is a drag. While a drag is active on a track, that track's handle MUST stand at the pointer's horizontal position as a fraction of the track's width, clamped to 0–1, and not at the rounded track step. Every other handle MUST keep standing at the effective instant. When the drag ends, by release or by a cancel from the browser, the dragged handle MUST stand at the effective instant again. Inputs: the reference day and the effective instant, plus the pointer's position during a drag. Output: the fraction. Errors: none. <!-- implements FR2 of add-time-sliders-to-location-cards; FR3, UX2 of fix-day-track-drag-continuity-and-smoothness -->

#### Scenario: All handles stand at the same position
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty, Moscow, Kolkata and New York
- **WHEN** the user opens the app
- **THEN** the handle of every card stands at `0.520833` (±0.000001) of its track

#### Scenario: A live handle follows the clock
- **GIVEN** the device time zone is `UTC`
- **AND** the list contains UTC and the app was opened at `2026-07-15T12:00:42.500Z`
- **WHEN** the next minute starts at `2026-07-15T12:01:00Z`
- **THEN** the UTC handle stands at `0.500694` (±0.000001)

#### Scenario: A pinned handle ignores minute updates
- **GIVEN** the device time zone is `UTC`
- **AND** the list contains UTC and the moment is pinned to `2026-07-15T18:00:00Z`
- **WHEN** the next minute starts
- **THEN** the UTC handle still stands at `0.75`

#### Scenario: The dragged handle follows the pointer between track steps
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **WHEN** the user drags the Almaty handle and holds the pointer at `0.512` of the track
- **THEN** the Almaty handle stands at `0.512` (±1 px)
- **AND** the moment is pinned to `2026-03-08T07:15:00Z`
- **AND** the New York handle stands at `0.510417` (±0.000001)

#### Scenario: The handle settles on the selected step at release
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the user drags the Almaty handle and holds the pointer at `0.512` of the track
- **WHEN** the user releases the pointer
- **THEN** the Almaty handle stands at `0.510417` (±0.000001)
- **AND** the moment is still pinned to `2026-03-08T07:15:00Z`

### Requirement: Select a time on a track
Pressing a track with the pointer, or dragging its handle, SHALL pin the reference moment to the instant at the pointer's position. That instant MUST be rounded to the nearest 15-minute step counted from the start of the reference day. It MUST be clamped between the start of the day and the track end, so a selection never leaves the reference day. The track end is the last minute of the reference day: one minute before the day's end, in absolute time (23:59 in the reference zone on a day of 23, 24 or 25 hours that ends at local midnight). A position that rounds to the end of the day therefore pins the track end, so the right end of a track reaches 23:59 and the whole day from 00:00 can be selected. Every card's time, date, UTC offset and handle MUST show the new moment in the same render as the selection, with no loading state. Selecting the instant that is already pinned MUST change nothing. A selection is reported with the pinned moment as `UNIQUE`. A mouse or pen MUST select on press. A touch MUST select only once the finger has moved horizontally along the track, or when it lifts after a tap that the browser did not cancel. A touch gesture that moves mostly vertically before any horizontal move, or that the browser cancels to scroll before a drag has started, MUST select nothing, and the page MUST scroll as usual.

A drag starts with a mouse or pen press on a track, or when a touch has moved horizontally along it. Once a drag has started, every pointer move until the pointer is released MUST select the instant at the pointer's horizontal position. This holds wherever the pointer is: above or below the track, over another card, or past either end of the track. A position past an end is clamped as above. While a drag is active the page MUST NOT scroll, whatever the direction of the moves. The drag ends when the pointer is released, or when the browser cancels the pointer. A cancelled drag keeps the last selection.

On an engine without Pointer Events, a finger drag MUST work the same way: it starts once the finger has moved horizontally along the track, follows the finger until it lifts wherever it goes, and keeps the page from scrolling. A mostly vertical swipe there MUST scroll the page and select nothing. A tap there (a click at the tapped position) MUST select as a press does, with the same rounding and clamping, and a finger drag MUST NOT add a selection of its own when the finger lifts. On engines with Pointer Events a click MUST NOT add a selection of its own.

Inputs: the pointer's position as a fraction of the track's width, measured from the track's left edge to its right edge, the reference day, and the reference zone. The pointer's vertical position is not an input. Output: the pinned instant (ISO 8601 with `Z`). Errors: a selection whose instant is malformed (not ISO 8601 with `Z`) MUST be rejected as an invalid instant and MUST change nothing.

<!-- implements FR3, FR8 of add-time-sliders-to-location-cards; FR8, NFR-A2, UX1 of support-legacy-ios-12-safari; FR1, FR4 of fix-day-track-handle-overlap-and-end-of-day; FR1, FR2, FR4, FR5, UX1, UX3 of fix-day-track-drag-continuity-and-smoothness -->

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

#### Scenario: A drag continues when the pointer leaves the track
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **AND** the page is taller than the screen
- **WHEN** the user starts a `<pointer>` drag on the New York track at a quarter of it
- **AND** moves the pointer to three quarters of the track's width while 120 px below the track
- **AND** releases the pointer there
- **THEN** the moment is pinned to `2026-03-08T13:00:00Z`
- **AND** the Almaty card shows `18:00`
- **AND** the page has not scrolled

| pointer |
|---|
| mouse |
| finger |
| finger on an engine without Pointer Events |

#### Scenario: A drag past the right end pins the track end
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the user drags a finger along the Almaty track and on past its right end, 60 px above it
- **AND** lifts the finger there
- **THEN** the moment is pinned to `2026-03-08T18:59:00Z`
- **AND** the Almaty card shows `23:59`

#### Scenario: A finger drag adds no selection when the finger lifts
- **GIVEN** the engine has no Pointer Events
- **AND** the moment is live
- **WHEN** the user drags a finger along a track and lifts it
- **THEN** the moment is pinned to the instant of the last position before the lift
- **AND** no further selection follows the lift

#### Scenario: A vertical swipe without Pointer Events still scrolls
- **GIVEN** the engine has no Pointer Events
- **AND** the page is taller than the screen
- **AND** the moment is live
- **WHEN** the user swipes up from a track with a finger
- **THEN** the page has scrolled down
- **AND** the moment is still live

### Requirement: Time selection is fast
One time selection SHALL work out the new reference moment and re-present 50 location rows, with their track positions, in at most 50 ms. A date change SHALL re-present 50 rows, including the new colour stops and hour labels of their tracks, in at most 50 ms. Both budgets cover the model and presenter work for rows that were already presented once. Drawing into the page is not part of the budgets, but it MUST happen in the same render as the change, with no loading state. A selection that keeps the reference day MUST NOT compute the colour stops again. Both budgets MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking checks are work bounds: a selection that keeps the reference day MUST build no date, time or region name formatter and MUST look up no time zone transition; a date change MUST build no date, time or region name formatter and MUST look up at most 2 time zone transitions per zone, and presenting that new day a second time MUST look up none. Inputs: 50 locations with canonical IANA identifiers, the current instant (ISO 8601 with `Z`), the device time zone. Output: every row at the new moment. A drag move whose position rounds to the track step that is already pinned MUST re-present no row: the rows MUST stay the same objects and no date, time or region name formatter is built, while only the dragged handle follows the pointer. <!-- implements NFR-P1, NFR-P2 of add-time-sliders-to-location-cards; FR1, FR3, FR5, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks; NFR-P1 of fix-day-track-drag-continuity-and-smoothness -->

#### Scenario: 50 rows within the time-selection budget
- **GIVEN** 50 locations whose rows have been presented at `2026-03-08T07:30:00Z` with the device time zone `UTC`
- **WHEN** a time selection pins `2026-03-08T18:00:00Z` and the rows are presented again
- **THEN** no date, time or region name formatter is built
- **AND** no time zone transition is looked up
- **AND** every row's handle stands at `0.75`

#### Scenario: 50 tracks within the date-change budget
- **GIVEN** 50 locations whose rows have been presented at `2026-03-08T07:30:00Z` with the device time zone `UTC`
- **WHEN** the date moves to the next day and the rows are presented again
- **THEN** no date, time or region name formatter is built
- **AND** at most 2 time zone transitions are looked up per zone
- **AND** every row carries colour stops and hour labels for the day starting `2026-03-09T00:00:00Z`

#### Scenario: The new day's tracks are computed once
- **GIVEN** 50 locations whose rows have been presented for the day starting `2026-03-09T00:00:00Z`
- **WHEN** their rows are presented again for that day
- **THEN** no time zone transition is looked up

#### Scenario: Hour labels are unchanged by formatter reuse
- **GIVEN** the list contains Kolkata, Kathmandu and New York
- **WHEN** their tracks are presented for the day starting `2026-03-08T00:00:00Z` in English and then in Russian
- **THEN** each track shows the same hour labels as the platform's own date formatting gives for that zone, with the hour label's format, in the same language, without the shared formatters


#### Scenario: A drag move inside the pinned track step re-presents no row
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty, Moscow, Kolkata and New York
- **AND** a drag on the Almaty track has pinned `2026-03-08T07:15:00Z` at `0.512` of the track
- **WHEN** the pointer moves on to `0.514` of the track
- **THEN** the moment is still pinned to `2026-03-08T07:15:00Z`
- **AND** every row is the same object as before the move
- **AND** no date, time or region name formatter is built
