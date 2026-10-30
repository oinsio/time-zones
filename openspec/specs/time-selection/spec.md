# time-selection Specification

## Purpose
Lets the user pick a time of day by dragging, tapping or moving the day track (slider) on any location card. Every card follows the one reference moment. Each track is coloured by that location's local day periods.

## Requirements

### Requirement: Day track spans the reference day
Every location card in the Cards view whose time zone is known SHALL show a day track. Every track MUST span the same reference day. The day starts at the start of the day that contains the effective instant in the reference zone, and ends at the start of the next day of that zone, measured in absolute time. A day is therefore 23, 24 or 25 hours long around DST changes and is never assumed to be 24 hours. The reference zone is the home location's time zone when home is set, otherwise the device time zone (see the `home-location` capability); it is a canonical IANA identifier, never a raw UTC offset. A row whose zone the browser does not know MUST show no track, and the other rows MUST be unaffected. An empty list shows no track. Inputs: the effective instant (ISO 8601 with `Z`) and the reference zone. Output: the start and end instants of the reference day. Errors: none. The track needs no network and behaves the same offline. <!-- implements FR1 of add-time-sliders-to-location-cards ; FR4 of set-home-location-and-show-differences -->

#### Scenario: A 24-hour reference day
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty, Moscow, Kolkata and New York
- **WHEN** the user opens the app
- **THEN** every card shows a track for the day from `2026-03-07T19:00:00Z` to `2026-03-08T19:00:00Z`

#### Scenario: Days of 23 and 25 hours
- **GIVEN** the device time zone is `America/New_York`
- **WHEN** the moment is on `<date>` in New York
- **THEN** the reference day is `<minutes>` minutes long

| date | minutes |
|---|---|
| `2026-03-08` | 1380 |
| `2026-06-01` | 1440 |
| `2026-11-01` | 1500 |

#### Scenario: No track for an unknown zone
- **GIVEN** the list holds Moscow and a location whose zone the browser does not know (for example `Mars/Olympus_Mons`)
- **WHEN** the list is presented
- **THEN** that location's card shows no track
- **AND** the Moscow card shows its track

#### Scenario: The day of the home location
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** every card shows a track for the day from `2026-03-07T19:00:00Z` to `2026-03-08T19:00:00Z`

### Requirement: Handle position
The handle of every track SHALL stand at the position of the effective instant within the reference day. The position is the elapsed absolute time since the start of the day divided by the day's length, a fraction from 0 to 1, and it MUST be the same on every card. While the moment is live the handle MUST follow the clock at every minute update, and when the day changes at midnight of the reference zone the track moves to the new day. While the moment is pinned the handle MUST stay where it is. Inputs: the reference day and the effective instant. Output: the fraction. Errors: none. <!-- implements FR2 of add-time-sliders-to-location-cards -->

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
A focused track SHALL move the reference moment by keys, counted in steps from the start of the reference day. Arrow Right and Arrow Up go to the first 15-minute step after the current value, and Arrow Left and Arrow Down to the last step before it. Page Up goes 60 minutes forward from the current step and Page Down 60 minutes back. Home goes to the start of the reference day and End to its last 15-minute step. Every result MUST be clamped to the reference day and pinned as a pointer selection is. The keys MUST NOT scroll the page and MUST NOT start a card reorder. Inputs: the key, the effective instant, the reference day. Output: the pinned instant. Errors: none; other keys change nothing. <!-- implements FR4 of add-time-sliders-to-location-cards -->

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
| end of day | `2026-03-08T18:45:00Z` |

#### Scenario: Keys from a live moment between steps
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:37:00Z` and the moment is live
- **WHEN** the user moves the handle to the next step
- **THEN** the moment is pinned to `2026-03-08T07:45:00Z`
- **WHEN** the user returns to now and moves the handle to the previous step
- **THEN** the moment is pinned to `2026-03-08T07:30:00Z`

#### Scenario: Keys stop at the ends of the day
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the moment is pinned to `2026-03-08T18:45:00Z`
- **WHEN** the user moves the handle to the next step
- **THEN** the moment is still pinned to `2026-03-08T18:45:00Z`

### Requirement: Time selection works with the date bar
A time selection from a live moment SHALL pin the moment, so the date bar shows the Now button. Now MUST return the moment to live: every handle shows the current instant at once and follows the clock again. A date change after a time selection keeps the selected wall-clock time in the reference zone (see the `date-selection` capability). The handles therefore keep their position, unless the new day's length or a DST gap moves them. Errors: none. <!-- implements FR5 of add-time-sliders-to-location-cards -->

#### Scenario: Now after selecting a time
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty
- **WHEN** the user selects three quarters of the Almaty track
- **THEN** the Now button is shown
- **WHEN** the user returns to now
- **THEN** the moment is live
- **AND** the Almaty card shows `12:30` and its handle stands at `0.520833` (±0.000001)

#### Scenario: A date change keeps the selected time
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the moment is pinned to `2026-03-08T13:00:00Z`
- **WHEN** the user moves to the next day
- **THEN** the moment is pinned to `2026-03-09T13:00:00Z`
- **AND** every handle still stands at `0.75`

### Requirement: Time selection is never stored
A time selection SHALL NOT write anything to storage and MUST NOT be passed to other open tabs. A change of the location list in another tab MUST keep the selected moment. A time selection works the same when storage is unavailable. Errors: none. <!-- implements FR8 of add-time-sliders-to-location-cards -->

#### Scenario: Time selections store nothing
- **GIVEN** the list contains Almaty and the app is open
- **WHEN** the user makes 20 time selections and then returns to now
- **THEN** the stored list was not written

#### Scenario: The selected time survives a list change in another tab
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the moment is pinned to `2026-03-08T13:00:00Z` by a time selection
- **WHEN** another tab adds Moscow to the list
- **THEN** the moment is still pinned to `2026-03-08T13:00:00Z`
- **AND** the Moscow card shows `16:00`

### Requirement: Day-period colours
Each track SHALL be coloured by its location's day periods in the location's own local time: night from 22:00 to 07:00, morning from 07:00 to 09:00, working hours from 09:00 to 18:00, evening from 18:00 to 22:00. The colour at a position MUST be the colour of the period of the location's local time at that position's instant, except inside blend windows. Each boundary that occurs during the reference day blends the colours of the two periods linearly over a window of absolute time centred on the boundary's instant. The window is 60 minutes for 07:00 and 22:00, and 15 minutes for 09:00 and 18:00.

A boundary whose local time does not exist on that local date (a DST gap) MUST be skipped. A boundary whose local time occurs twice uses the earlier instant. An offset change inside the reference day after which the local time falls in another period than just before it MUST be a hard colour edge at the instant of the change. The colours MUST be the night, morning, working-hours and evening design tokens of the active theme, light or dark. Colours also differ in lightness, as the tokens do.

Inputs: the location's IANA identifier and the reference day. Output: the colour stops, each a position (fraction of the day) and a period. Positions may lie slightly outside 0–1 for a window that crosses an end of the day. Errors: none for known zones; unknown zones have no track.

<!-- implements FR6 of add-time-sliders-to-location-cards -->

#### Scenario: Colour stops of Almaty and New York
- **GIVEN** the device time zone is `Asia/Almaty`
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

### Requirement: Local hour labels
On screens 768 px and wider, every track SHALL show five local hour labels. They are placed at the start of the reference day, at 6, 12 and 18 hours of absolute time after it, and at its end, each at its position on the track. Each label MUST be the location's local time at that instant, in two-digit 24-hour hours (`04`), followed by the minutes when they are not zero (`00:30`, `05:45`). The labels MUST be derived from the location's IANA identifier for those instants, so DST and :30 / :45 offsets are respected. Below 768 px no labels are shown. The labels are decorative: they MUST NOT be read by assistive technology, because the slider's value text names the time. Inputs: the location's IANA identifier and the reference day. Output: five label texts with their positions. Errors: none for known zones. <!-- implements FR7 of add-time-sliders-to-location-cards -->

#### Scenario: Hour labels of four zones
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty, Moscow, Kolkata and New York
- **WHEN** the list is presented
- **THEN** the hour labels of `<city>` are `<labels>`

| city | labels |
|---|---|
| Almaty | `00 06 12 18 00` |
| Moscow | `22 04 10 16 22` |
| Kolkata | `00:30 06:30 12:30 18:30 00:30` |
| New York | `14 20 03 09 15` |

#### Scenario: Labels only on wide screens
- **GIVEN** the list contains Almaty and Moscow
- **WHEN** the list is shown 375 px wide
- **THEN** no hour labels are visible
- **WHEN** the list is shown 1024 px wide
- **THEN** every track shows its five hour labels under it

### Requirement: Track strings are localized
Every new user-visible or accessible string of the track SHALL exist in English and Russian. These are the slider name and its value text. Dates in the value text MUST follow the interface language, as the card's date does. <!-- implements FR9 of add-time-sliders-to-location-cards -->

#### Scenario: Slider name and value in both languages
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty
- **WHEN** the interface language is `<language>`
- **THEN** the Almaty slider is named `<name>` with the value text `<value>`

| language | name | value |
|---|---|---|
| English | `Time in Almaty` | `12:30, Sun, Mar 8` |
| Russian | `Время — Almaty` | `12:30, вс, 8 мар.` |

### Requirement: Time selection is fast
One time selection SHALL work out the new reference moment and re-present 50 location rows, with their track positions, in at most 50 ms. A date change SHALL re-present 50 rows, including the new colour stops and hour labels of their tracks, in at most 50 ms. Both budgets cover the model and presenter work for rows that were already presented once. Drawing into the page is not part of the budgets, but it MUST happen in the same render as the change, with no loading state. A selection that keeps the reference day MUST NOT compute the colour stops again. Both budgets MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking checks are work bounds: a selection that keeps the reference day MUST build no date, time or region name formatter and MUST look up no time zone transition; a date change MUST build no date, time or region name formatter and MUST look up at most 2 time zone transitions per zone, and presenting that new day a second time MUST look up none. Inputs: 50 locations with canonical IANA identifiers, the current instant (ISO 8601 with `Z`), the device time zone. Output: every row at the new moment. <!-- implements NFR-P1, NFR-P2 of add-time-sliders-to-location-cards; FR1, FR3, FR5, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks -->

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

### Requirement: Accessible day tracks
The page with tracks SHALL have no axe-core violations in the light and dark themes, with the moment live and pinned by a time selection. Each track MUST be one Tab stop, in card order, and MUST show a visible focus ring around its handle while focused. Each track MUST be exposed as a slider. Its accessible name is "Time in {city}" in English or "Время — {city}" in Russian. Its value is the minutes elapsed since the start of the reference day: the minimum is 0 and the maximum is the last 15-minute step of the day (1425 on a 24-hour day). Its value text is the card's local time and date ("12:30, Sun, Mar 8"). The time and date of the card MUST stay outside any live region, so selections and minute updates are not announced beyond the slider's own value. <!-- implements NFR-A1, NFR-A2, NFR-A3 of add-time-sliders-to-location-cards -->

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
- **THEN** the slider "Time in Almaty" has the value 750 within 0 to 1425 and the value text `12:30, Sun, Mar 8`

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
Below 768 px the track SHALL sit on its own line under the city and time line, spanning the card's content width, 10 px high and without hour labels. From 768 px it MUST sit on the city line, right of the time column, filling the remaining width, 12 px high, with the hour labels under it. The handle's centre MUST be exactly at the effective instant's position, with the start of the day at the track's left edge and its end at the right edge. The visible handle is a circle, 28 px below 768 px and 32 px from 768 px, filled with the surface colour and outlined with the foreground colour. The slider's hit area MUST be at least 44 px high and its handle at least 44 × 44 px. The hour labels are muted text with tabular figures.

A horizontal drag on a track MUST NOT scroll the page and MUST NOT move the card in the list. A vertical swipe that starts on a track still scrolls the page and MUST NOT select a time; a finger tap on a track selects the time at that position. The page with tracks MUST NOT scroll horizontally at 320 px and 2560 px. The approved screenshots at 375 px and 1024 px in both themes MUST show the tracks: the "list", "pinned" and "calendar" states and a new "time-selected" state.

<!-- implements FR3, NFR-R1, NFR-R2, NFR-R3, UX1, UX2, UX3 of add-time-sliders-to-location-cards -->

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
- **AND** every card shows the moment of the last step of the reference day

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
- **WHEN** the list is shown at 320 px or 2560 px
- **THEN** the page does not scroll horizontally

#### Scenario: Screenshots show the tracks
- **GIVEN** the current time is `2026-03-08T07:30:00Z`
- **WHEN** the "list", "pinned", "calendar" and "time-selected" states are shown at 375 px or 1024 px in the light or the dark theme
- **THEN** each matches its approved screenshot

### Requirement: Select a time in every view
Selecting a time is part of the view contract (ADR-0002). For every registered view, a time selection in any location MUST change the time shown for every location, and Now MUST return them to the current time. <!-- implements FR3, FR5 of add-time-sliders-to-location-cards -->

#### Scenario: Select a time
- **GIVEN** the view under contract is shown
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the stored locations are Almaty and Moscow
- **WHEN** the user moves the time of Moscow one hour forward
- **THEN** Almaty shows `13:30` and Moscow shows `11:30`
- **WHEN** the user returns to now
- **THEN** Almaty shows `12:30` and Moscow shows `10:30`

### Requirement: Wall-time input on every row
The time of every location card whose time zone is known, and the time of the Here entry, SHALL be a wall-time input. Activating it by tap, click, Enter or Space MUST open a field that holds the row's current time, fully selected. A row whose zone the browser does not know shows no time and MUST have no wall-time input. The input needs no network. <!-- implements FR1 of add-wall-time-input-with-hint -->

#### Scenario: Open the field
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **WHEN** the user opens the wall-time input of New York
- **THEN** the field holds `03:30`, fully selected

#### Scenario: No input for an unknown zone
- **GIVEN** the list holds Moscow and a location whose zone the browser does not know (for example `Mars/Olympus_Mons`)
- **WHEN** the list is presented
- **THEN** Moscow has a wall-time input
- **AND** the other location has none

### Requirement: Closing the wall-time input
Escape, or leaving the field without changing its text, SHALL close the field and change nothing. After Enter or Escape, focus MUST return to the row's time. <!-- implements FR5 of add-wall-time-input-with-hint -->

#### Scenario: Cancel
- **GIVEN** the moment is live
- **AND** the user opened the wall-time input of New York
- **WHEN** the user cancels
- **THEN** the moment is still live
- **AND** focus is on the time of New York

### Requirement: Accepted wall-time text
A wall-time input SHALL accept a 24-hour wall-clock time written as `H`, `HH`, `HMM`, `HHMM`, `H:MM`, `HH:MM`, `H.MM` or `HH.MM`. One or two digits name whole hours with minutes `00`. Hours MUST be 0–23 and minutes 0–59, written with two digits. Spaces before and after the text MUST be ignored. Inputs: the typed text. Output: a wall-clock time of hours and minutes. <!-- implements FR2 of add-wall-time-input-with-hint -->

#### Scenario: Accepted texts
- **WHEN** the user confirms the text `<text>`
- **THEN** the typed wall-clock time is `<time>`

| text | time |
|---|---|
| `9` | `09:00` |
| `09` | `09:00` |
| `930` | `09:30` |
| `0930` | `09:30` |
| `9:30` | `09:30` |
| `09:30` | `09:30` |
| `09.30` | `09:30` |
| ` 9:30 ` | `09:30` |
| `0:00` | `00:00` |
| `23:59` | `23:59` |

### Requirement: Invalid wall-time text
Any text that is not an accepted wall-time text, including the empty text, SHALL change nothing, whether it is confirmed with Enter or by leaving the field. The field MUST stay open and MUST show the error "Enter the time as HH:MM" / «Введите время в формате ЧЧ:ММ», linked to the field. <!-- implements FR6 of add-wall-time-input-with-hint -->

#### Scenario: Rejected texts
- **GIVEN** the interface language is English
- **AND** the moment is live
- **WHEN** the user confirms the text `<text>`
- **THEN** the field shows the error "Enter the time as HH:MM"
- **AND** the moment is still live

| text |
|---|
| `24:00` |
| `9:60` |
| `abc` |
| `12345` |
| `9:3` |
| (empty) |

### Requirement: A wall-time input pins the reference moment
Confirming an accepted time SHALL pin the reference moment to that wall-clock time in the row's zone (the device time zone for the Here entry), on the local date the row showed when the field opened. A time in a DST gap MUST move forward by the gap; a time in a DST overlap MUST take the earlier instant. The outcome MUST be reported as `UNIQUE`, `GAP` or `AMBIGUOUS`. <!-- implements FR3 of add-wall-time-input-with-hint -->

#### Scenario: Type a time in another city
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty, Moscow, Kolkata and New York
- **WHEN** the user types `10:40` in New York
- **THEN** the moment is pinned to `2026-03-08T14:40:00Z` with the status `UNIQUE`
- **AND** Almaty shows `19:40`, Moscow `17:40` and Kolkata `20:10`

#### Scenario: Wall-clock outcomes of a typed time
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `<now>`
- **AND** the list contains New York
- **WHEN** the user types `<typed>` in New York
- **THEN** the moment is pinned to `<pinned>` with the status `<status>`

| now | typed | pinned | status |
|---|---|---|---|
| `2026-06-01T07:30:00Z` | `10:00` | `2026-06-01T14:00:00Z` | `UNIQUE` |
| `2026-03-08T07:30:00Z` | `02:30` | `2026-03-08T07:30:00Z` | `GAP` |
| `2026-11-01T07:30:00Z` | `01:30` | `2026-11-01T05:30:00Z` | `AMBIGUOUS` |

#### Scenario: Type a time in the Here entry
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains only Moscow, so the Here entry is shown
- **WHEN** the user types `08:00` in the Here entry
- **THEN** the moment is pinned to `2026-03-08T03:00:00Z`
- **AND** Moscow shows `06:00`

### Requirement: The pinned wall-time moment drives every row
After a wall-time input, every row's time, date, UTC offset and handle SHALL show the new moment in the same render. When the instant lies outside the current reference day, the day tracks and the date bar MUST move to the reference day that contains it. From live, the input MUST show the Now button, and Now MUST return to live. Typing the instant already pinned, with the same outcome in the same row, MUST change nothing. <!-- implements FR4, FR8 of add-wall-time-input-with-hint -->

#### Scenario: The typed instant leaves the reference day
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **WHEN** the user types `23:00` in New York
- **THEN** the moment is pinned to `2026-03-09T03:00:00Z`
- **AND** the date bar shows 9 March
- **AND** the reference day runs from `2026-03-08T19:00:00Z` to `2026-03-09T19:00:00Z`
- **AND** the Now button is shown

### Requirement: Wall-time input is never stored
A wall-time input SHALL NOT be written to storage and SHALL NOT be passed to other open tabs. A change of the list in another tab MUST keep the moment. When the typed row no longer exists (the location was removed, or a location now shows the device time instead of the Here entry), nothing MUST change and the field MUST close without a message. A command with a malformed time or date MUST be rejected and change nothing. <!-- implements FR9, FR10 of add-wall-time-input-with-hint -->

#### Scenario: Nothing is stored or shared
- **GIVEN** the list contains Almaty and New York
- **WHEN** the user types 20 times in New York and then returns to now
- **THEN** nothing is written to storage
- **AND** no other tab receives a change

#### Scenario: The location is gone while typing
- **GIVEN** the user opened the wall-time input of Moscow
- **AND** Moscow was removed in another tab
- **WHEN** the user confirms `10:00`
- **THEN** the field closes without a message
- **AND** the reference moment is unchanged

#### Scenario: A malformed command changes nothing
- **GIVEN** the moment is live
- **WHEN** a wall-time input arrives with the time `25:00` or the date `2026-13-01`
- **THEN** it is rejected
- **AND** the moment is still live

### Requirement: Wall-time hint texts
When a wall-time input resolves to `GAP` or `AMBIGUOUS`, only the row where the time was typed SHALL show the wall-time hint, in the interface language. On `GAP` it MUST name the typed time and the shown time. On `AMBIGUOUS` it MUST name the typed time and the UTC offset of the shown instant in that row's zone. `UNIQUE` MUST show no hint. The exact texts are in the scenarios. <!-- implements FR7 of add-wall-time-input-with-hint -->

#### Scenario: Hint for a DST gap
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York
- **WHEN** the user types `02:30` in New York
- **THEN** New York shows the hint "02:30 does not exist on this day — clocks moved forward. Showing 03:30."
- **AND** Almaty shows no hint

#### Scenario: Hint for a DST overlap
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the current instant is `2026-11-01T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user types `01:30` in New York
- **THEN** New York shows the hint «01:30 бывает дважды — показано первое (UTC−4)»

#### Scenario: Hint texts in Russian for a DST gap
- **GIVEN** the interface language is Russian
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user types `02:30` in New York
- **THEN** New York shows the hint «02:30 не существует в этот день — часы переведены вперёд. Показано 03:30»

#### Scenario: Hint texts in English for a DST overlap
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-11-01T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user types `01:30` in New York
- **THEN** New York shows the hint "01:30 occurs twice — showing the first (UTC−4)."

### Requirement: Wall-time hint lifetime
The wall-time hint SHALL stay until the next wall-time input, time selection, date change or Now. A change of the reference zone (home set or cleared) MUST keep a hint on a location. A change of the device time zone MUST end a hint on the Here entry and keep the pinned instant. When its row is removed, or the Here entry that carries it disappears, the hint MUST disappear and the moment MUST stay. <!-- implements FR7, FR9 of add-wall-time-input-with-hint -->

#### Scenario: The hint ends with the next change
- **GIVEN** New York shows a wall-time hint
- **WHEN** the user <change>
- **THEN** no row shows a wall-time hint

| change |
|---|
| types `10:00` in New York |
| moves a day track to the next step |
| moves to the next day |
| returns to now |

#### Scenario: The hint leaves with its row
- **GIVEN** New York shows a wall-time hint
- **WHEN** New York is removed
- **THEN** no row shows a wall-time hint
- **AND** the moment stays pinned

#### Scenario: A home change keeps the hint
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow and New York
- **AND** the user typed `02:30` in New York, so New York shows a wall-time hint
- **WHEN** the user makes Moscow home
- **THEN** New York still shows the wall-time hint
- **AND** the moment is still pinned to `2026-03-08T07:30:00Z` with the status `GAP`
- **AND** the date bar shows no note

#### Scenario: A device time zone change ends the hint on the Here entry
- **GIVEN** the device time zone is `America/New_York`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains only Moscow, so the Here entry is shown
- **AND** the user typed `02:30` in the Here entry, so it shows a wall-time hint
- **WHEN** the device time zone changes to `Asia/Almaty`
- **THEN** no row shows a wall-time hint
- **AND** the date bar shows no note
- **AND** the moment is still pinned to `2026-03-08T07:30:00Z`

### Requirement: One wall-clock note at a time
At most one note about a wall-clock time SHALL be visible: a wall-time hint in one row, or the gap note in the date bar, never both. A date change never produces a wall-time hint, and a wall-time input never produces the gap note. <!-- implements FR7 of add-wall-time-input-with-hint -->

#### Scenario: A wall-time input ends the gap note
- **GIVEN** the device time zone is `America/New_York`
- **AND** the current instant is `2026-03-07T07:30:00Z`
- **AND** the list contains New York
- **AND** the user moved to the next day, so the date bar shows the gap note
- **WHEN** the user types `02:45` in New York
- **THEN** the moment is pinned to `2026-03-08T07:45:00Z` with the status `GAP`
- **AND** the date bar shows no note
- **AND** only New York shows a wall-time hint

### Requirement: Wall-time input strings are localized
The input's name, the input error and both wall-time hints SHALL exist in English and Russian. The time button and its field MUST be named "Enter time — {city}, {time}" / «Ввести время — {city}, {time}», with the row's city label and shown time, so no two rows share a name. <!-- implements FR11, NFR-A2 of add-wall-time-input-with-hint -->

#### Scenario: Names in both languages
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow
- **WHEN** the interface language is `<language>`
- **THEN** the time of Moscow is named `<name>`

| language | name |
|---|---|
| English | `Enter time — Moscow, 10:30` |
| Russian | `Ввести время — Москва, 10:30` |

### Requirement: Wall-time input is fast
A wall-time input followed by presenting 50 rows SHALL stay within fixed work bounds. Presenting the rows again after the input MUST build no new date or time formatter, also while a wall-time hint is shown. Resolving the typed time MUST convert wall-clock time to an instant in the typed row's zone only. Timing is reported by a non-blocking benchmark, never asserted in unit tests (ADR-0008). <!-- implements NFR-P1 of add-wall-time-input-with-hint -->

#### Scenario: No new formatter after a wall-time input
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** 50 rows are presented, one of them New York
- **AND** the user typed `02:30` in New York, so New York shows a wall-time hint
- **WHEN** the rows are presented again
- **THEN** no date or time formatter is built

#### Scenario: The typed time is resolved in its row's zone only
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** 50 rows are presented, one of them New York
- **WHEN** the user types `10:40` in New York
- **THEN** wall-clock time is converted to an instant only in `America/New_York`

### Requirement: Accessible wall-time input
The wall-time input SHALL pass axe-core with the time as a button, the field open, the field with an error, and a `GAP` and an `AMBIGUOUS` hint, in the light and dark themes. The hint MUST be announced politely; times that change in other rows MUST NOT be announced. The time button MUST show a visible focus ring and have a hit area of at least 44 × 44 px. <!-- implements NFR-A1, NFR-A3, UX1 of add-wall-time-input-with-hint -->

#### Scenario: No accessibility violations
- **WHEN** the page shows `<state>` in the `<theme>` theme
- **THEN** axe-core reports no violations

| state | theme |
|---|---|
| the time buttons | light |
| the time buttons | dark |
| an open field | light |
| an open field | dark |
| a field with an error | light |
| a field with an error | dark |
| a `GAP` hint | light |
| a `GAP` hint | dark |
| an `AMBIGUOUS` hint | light |
| an `AMBIGUOUS` hint | dark |

### Requirement: Keyboard-safe wall-time input
Keys typed in the field SHALL NOT start a card reorder and SHALL NOT scroll the page. Tab MUST leave the field and confirm it as Enter does. The field MUST request a numeric keyboard and no autocompletion. <!-- implements NFR-A4, NFR-A2 of add-wall-time-input-with-hint -->

#### Scenario: Keyboard-only input
- **GIVEN** the list contains Almaty and New York
- **WHEN** the user focuses the time of New York with Tab, presses Enter, types `1040` and presses Enter
- **THEN** New York shows `10:40`
- **AND** focus is on the time of New York
- **AND** the order of the cards is unchanged

#### Scenario: Tab confirms the field
- **GIVEN** the list contains Almaty and New York
- **AND** the user opened the wall-time input of New York
- **WHEN** the user types `1040` and presses Tab
- **THEN** New York shows `10:40`
- **AND** the moment is pinned

### Requirement: Wall-time input layout
With the field open or a hint shown, the page SHALL NOT scroll horizontally at 320 px and 2560 px. The open field MUST take the place of the time and MUST NOT change the card's size. The hint MUST sit between the country line and the day track, wrap inside the card and take colours from design tokens. Screenshots at 375 and 1024 px, in both themes, MUST include an open field and a hint. <!-- implements NFR-R1, NFR-R2, UX2, UX3 of add-wall-time-input-with-hint -->

#### Scenario: No horizontal scrolling
- **GIVEN** the viewport is `<width>` px wide
- **AND** New York shows a wall-time hint
- **WHEN** the user opens the wall-time input of Almaty
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 2560 |

### Requirement: Wall-time input opens without Pointer Events
On an engine without Pointer Events (iOS Safari 12.5), a tap on a row's time SHALL open the wall-time input: the time responds to a plain click, never to pointer events. The field MUST be a text field that requests a numeric keyboard, never a native time field, whose format follows the system. <!-- implements FR13 of add-wall-time-input-with-hint -->

#### Scenario: Tap opens the field without Pointer Events
- **GIVEN** the engine has no Pointer Events
- **AND** the list contains New York
- **WHEN** the user taps the time of New York
- **THEN** the wall-time input of New York is open

### Requirement: Wall-time input in a renamed zone
On an engine that rejects a canonical zone ID and accepts its legacy zone name (see the `browser-compatibility` capability), a wall-time input in that zone SHALL pin the same instant, with the same wall-clock status, as on a modern engine. The zone MUST stay stored and compared by its canonical ID. Resolving a wall-time input MUST NOT use BigInt at run time. <!-- implements FR13 of add-wall-time-input-with-hint -->

#### Scenario: A renamed zone on outdated zone data
- **GIVEN** the engine rejects `Europe/Kyiv` and accepts `Europe/Kiev`
- **AND** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Kyiv (`Europe/Kyiv`)
- **WHEN** the user types `10:00` in Kyiv
- **THEN** the moment is pinned to `2026-03-08T08:00:00Z` with the status `UNIQUE`
- **AND** the stored zone of Kyiv is still `Europe/Kyiv`

### Requirement: Type an exact time in every view
Typing an exact time is part of the view contract (ADR-0002). For every registered view, a wall-time input in any row MUST change the time shown for every row, and Now MUST return them to the current time. <!-- implements FR12 of add-wall-time-input-with-hint -->

#### Scenario: Type an exact time
- **GIVEN** the view under contract is shown
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the stored locations are Almaty and Moscow
- **WHEN** the user types `11:45` in Moscow
- **THEN** Almaty shows `13:45` and Moscow shows `11:45`
- **WHEN** the user returns to now
- **THEN** Almaty shows `12:30` and Moscow shows `10:30`
