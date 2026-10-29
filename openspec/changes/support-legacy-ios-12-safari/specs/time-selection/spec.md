# Spec Delta

## MODIFIED Requirements

### Requirement: Select a time on a track
Pressing a track with the pointer, or dragging its handle, SHALL pin the reference moment to the instant at the pointer's position. That instant MUST be rounded to the nearest 15-minute step counted from the start of the reference day. It MUST be clamped between the start of the day and the last step before the day's end, so a selection never leaves the reference day. Every card's time, date, UTC offset and handle MUST show the new moment in the same render as the selection, with no loading state. Selecting the instant that is already pinned MUST change nothing. A selection is reported with the pinned moment as `UNIQUE`. A mouse or pen MUST select on press. A touch MUST select only once the finger has moved horizontally along the track, or when it lifts after a tap that the browser did not cancel. A touch gesture that moves mostly vertically, or that the browser cancels to scroll, MUST select nothing. On an engine without Pointer Events, a tap (a click at the tapped position) MUST select as a press does, with the same rounding and clamping; dragging along the track is not available there. On engines with Pointer Events a click MUST NOT add a selection of its own.

Inputs: the pointer's position as a fraction of the track's width, the reference day, and the reference zone. Output: the pinned instant (ISO 8601 with `Z`). Errors: a selection whose instant is malformed (not ISO 8601 with `Z`) MUST be rejected as an invalid instant and MUST change nothing.

<!-- implements FR3, FR8 of add-time-sliders-to-location-cards; FR8, NFR-A2, UX1 of support-legacy-ios-12-safari -->

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
| `1.0` | `2026-03-08T18:45:00Z` |
| `0` | `2026-03-07T19:00:00Z` |

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

#### Scenario: The tap fallback keeps the slider accessible
- **GIVEN** the engine has no Pointer Events
- **WHEN** the user reaches a day track
- **THEN** it is a slider with the same accessible name, value range and value text as with Pointer Events
- **AND** the arrow keys still move its handle

#### Scenario: A click adds nothing where Pointer Events exist
- **GIVEN** the engine has Pointer Events
- **AND** the moment is live
- **WHEN** a click arrives on a track with no pointer press before it
- **THEN** the moment is still live
