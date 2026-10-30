# date-selection Specification

## Purpose
Lets the user see every location at another date than today — the previous or next day, or any date picked in a calendar — and return to the current time, through one reference moment that is either live or pinned.

## Requirements

### Requirement: Reference moment
The app SHALL keep one reference moment from which every location's time, date and UTC offset are derived. The moment MUST be either live — equal to the current instant of the clock — or pinned to one instant chosen by the user. It MUST be live whenever the app opens. It MUST NOT be written to storage and MUST NOT be passed to other open tabs; a change of the location list in another tab MUST keep it. Reset of an unreadable list MUST keep it. The reference zone is the home location's time zone when home is set, otherwise the device time zone (canonical IANA identifier, never a raw offset; see the `home-location` capability). Setting, moving or clearing home MUST keep the moment: live stays live, pinned keeps its instant. Inputs: the clock's current instant (ISO 8601 with `Z`), the device time zone and the home location. Output: the effective instant — the current instant while live, the pinned instant while pinned. Errors: none. <!-- implements FR1 of select-date-with-calendar-and-now ; FR4 of set-home-location-and-show-differences; FR1 of keep-now-button-visible-when-live -->

#### Scenario: The app opens live
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty
- **WHEN** the user opens the app
- **THEN** the moment is live
- **AND** the Almaty row shows `12:30` and `Sun, Mar 8`
- **AND** the Now button is shown and inactive

#### Scenario: Date changes store nothing
- **GIVEN** the list contains Almaty and the app is open
- **WHEN** the user moves to the next day 5 times, to the previous day 5 times and then returns to now
- **THEN** the stored list was not written

#### Scenario: The pinned moment survives a list change in another tab
- **GIVEN** the moment is pinned to `2026-03-09T07:30:00Z`
- **WHEN** another tab adds Moscow to the list
- **THEN** the moment is still pinned to `2026-03-09T07:30:00Z`
- **AND** the Moscow row shows `10:30` and `Mon, Mar 9`

#### Scenario: A home change keeps the pinned moment
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the moment is pinned to `2026-03-08T20:30:00Z`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user makes Almaty home
- **THEN** the moment is still pinned to `2026-03-08T20:30:00Z`
- **AND** the date bar shows Monday, March 9

### Requirement: Previous and next day
The previous-day and next-day actions SHALL move the reference moment exactly one calendar day back or forward in the reference zone, keeping the wall-clock time the moment has there, and MUST pin the moment. From a live moment they MUST start from the current instant. Inputs: the effective instant, the reference zone, the direction (−1 or +1 day). Output: the pinned instant and its wall-clock status (see "Wall-clock resolution on the new date"). Errors: a move with a malformed current instant MUST be rejected as invalid; a move that would leave the range of dates the platform's date arithmetic supports MUST be rejected and MUST change nothing. <!-- implements FR2, FR10 of select-date-with-calendar-and-now -->

#### Scenario: Next day from live
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York (`America/New_York`)
- **WHEN** the user moves to the next day
- **THEN** the moment is pinned to `2026-03-09T07:30:00Z`
- **AND** the Almaty row shows `12:30` and `Mon, Mar 9`
- **AND** the New York row shows `03:30`, `Mon, Mar 9` and `UTC−4`

#### Scenario: Previous day resolves the offset for that day
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains New York (`America/New_York`)
- **WHEN** the user moves to the previous day
- **THEN** the moment is pinned to `2026-03-07T07:30:00Z`
- **AND** the New York row shows `02:30`, `Sat, Mar 7` and `UTC−5`

#### Scenario: Moves add up from the pinned moment
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the user moves to the next day twice and to the previous day once
- **THEN** the moment is pinned to `2026-03-09T07:30:00Z`

#### Scenario: A move beyond the supported range changes nothing
- **GIVEN** the moment is pinned to the last date the platform supports
- **WHEN** the user moves to the next day
- **THEN** the move is rejected as out of range
- **AND** the moment is unchanged

### Requirement: Wall-clock resolution on the new date
When a date change keeps a wall-clock time that does not exist on the new date in the reference zone (a DST gap), the moment SHALL move forward by the length of the gap; when the wall-clock time occurs twice (a DST overlap), the moment MUST be the earlier of the two instants. The outcome MUST be reported with the pinned moment as `UNIQUE`, `GAP` or `AMBIGUOUS`. On `GAP` the date bar MUST tell the user, in the interface language, which wall-clock time was kept and which time is shown instead. The note MUST stay until the next date change, the next time selection on a day track, the next wall-time input (see the `time-selection` capability), Now, or a change of the reference zone; a time selection pins an exact instant and is reported as `UNIQUE`. A change of the reference zone keeps the pinned instant; a moment that a date change reported as `GAP` is then reported as `UNIQUE`. The status of a moment pinned by a wall-time input follows the `time-selection` capability: it stays for a location, and on the Here entry it ends when the device time zone changes. A wall-time input never produces this note: its outcome is told by the wall-time hint in the row where it was typed, so the date bar and a row never both show a note about a wall-clock time. `UNIQUE` and `AMBIGUOUS` MUST show no note. <!-- implements FR4 of select-date-with-calendar-and-now; FR5 of add-time-sliders-to-location-cards; FR4 of set-home-location-and-show-differences; FR7 of add-wall-time-input-with-hint -->

#### Scenario: A gap is told in the bar
- **GIVEN** the device time zone is `America/New_York`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-07T07:30:00Z`
- **WHEN** the user moves to the next day
- **THEN** the bar shows `02:30 does not exist on this day because of a clock change; showing 03:30.`
- **WHEN** the user moves to the next day again
- **THEN** the bar shows no note

#### Scenario: A time selection ends the gap note
- **GIVEN** the device time zone is `America/New_York`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-07T07:30:00Z`
- **AND** the user moved to the next day, so the bar shows the gap note
- **WHEN** the user moves a day track to the next 15-minute step
- **THEN** the moment is pinned to `2026-03-08T07:45:00Z` with the status `UNIQUE`
- **AND** the bar shows no note

#### Scenario: A wall-time input ends the gap note
- **GIVEN** the device time zone is `America/New_York`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-07T07:30:00Z`
- **AND** the list contains New York
- **AND** the user moved to the next day, so the bar shows the gap note
- **WHEN** the user types `10:00` in New York
- **THEN** the moment is pinned to `2026-03-08T14:00:00Z` with the status `UNIQUE`
- **AND** the bar shows no note

#### Scenario: A gap from a wall-time input stays out of the bar
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains New York
- **WHEN** the user types `02:30` in New York
- **THEN** the moment is pinned to `2026-03-08T07:30:00Z` with the status `GAP`
- **AND** the bar shows no note

#### Scenario: Wall-clock outcomes
- **GIVEN** the device time zone is `America/New_York`
- **WHEN** the user moves to the next day from the moment `<from>`
- **THEN** the moment is pinned to `<pinned>` with the status `<status>`
- **AND** the bar shows `<note>`

| from | pinned | status | note |
|---|---|---|---|
| `2026-06-01T14:00:00Z` | `2026-06-02T14:00:00Z` | `UNIQUE` | no note |
| `2026-03-07T07:30:00Z` | `2026-03-08T07:30:00Z` | `GAP` | `02:30 does not exist on this day because of a clock change; showing 03:30.` |
| `2026-10-31T05:30:00Z` | `2026-11-01T05:30:00Z` | `AMBIGUOUS` | no note |

#### Scenario: A malformed date changes nothing
- **GIVEN** the moment is live
- **WHEN** a date change arrives with the date `2026-13-01`
- **THEN** the change is rejected as an invalid date
- **AND** the moment is still live

#### Scenario: A device time zone change drops the gap note
- **GIVEN** no home is set
- **AND** the device time zone is `America/New_York`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-07T07:30:00Z`
- **AND** the user moved to the next day, so the moment is pinned to `2026-03-08T07:30:00Z` and the bar shows the gap note
- **WHEN** the device time zone changes to `Asia/Almaty`
- **THEN** the moment is still pinned to `2026-03-08T07:30:00Z`
- **AND** the bar shows no note

### Requirement: Choose a date in the calendar
Activating the shown date SHALL open a calendar showing the month of the reference moment's date in the reference zone, with that date marked as selected and today's date in the reference zone marked as today. The calendar MUST let the user show the previous and the next month without changing the reference moment. Picking a day MUST move the reference moment to that date, keeping its wall-clock time in the reference zone (with the resolution of "Wall-clock resolution on the new date"), pin it and close the calendar. Picking the date already shown, or closing the calendar without picking, MUST change nothing: a live moment stays live. Inputs: the picked ISO date (`2026-07-15`), the effective instant, the reference zone. Output: the pinned instant. Errors: a malformed date or a date outside the supported range MUST be rejected and change nothing. <!-- implements FR3, FR10 of select-date-with-calendar-and-now -->

#### Scenario: Pick a date in a later month
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains New York (`America/New_York`)
- **WHEN** the user opens the calendar
- **THEN** it shows March 2026
- **WHEN** the user shows the next month 4 times and picks the 15th
- **THEN** the calendar is closed
- **AND** the moment is pinned to `2026-07-15T07:30:00Z`
- **AND** the New York row shows `03:30` and `Wed, Jul 15`

#### Scenario: Picking the shown date changes nothing
- **GIVEN** the current instant is `2026-03-08T07:30:00Z` and the moment is live
- **WHEN** the user opens the calendar and picks 8 March 2026
- **THEN** the calendar is closed
- **AND** the moment is still live

#### Scenario: Closing the calendar changes nothing
- **GIVEN** the moment is pinned to `2026-03-09T07:30:00Z`
- **WHEN** the user opens the calendar, shows the next month and closes the calendar without picking
- **THEN** the moment is still pinned to `2026-03-09T07:30:00Z`

#### Scenario: The calendar opens on the pinned date
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the moment is pinned to `2026-07-15T07:30:00Z`
- **WHEN** the user opens the calendar
- **THEN** it shows July 2026 with 15 July selected
- **AND** no day of July 2026 is marked as today

### Requirement: Calendar month layout
The calendar SHALL show the month name and year as its heading in the interface language, a row of weekday names, and the days of the month in week rows. Weeks MUST start on Sunday in English and on Monday in Russian. Days of the neighbouring months MUST NOT be shown as days of the month (their cells stay empty). <!-- implements FR3, FR9 of select-date-with-calendar-and-now -->

#### Scenario: March 2026 in English and Russian
- **WHEN** the calendar shows March 2026
- **THEN** in English the heading is `March 2026`, there are 5 week rows and the first row starts with Sunday 1 March
- **AND** in Russian there are 6 week rows, the first row ends with Sunday 1 March and the second row starts with Monday 2 March

### Requirement: Return to now
The Now button SHALL be shown in both modes of the reference moment. While the moment is pinned, Now MUST be active: activating it MUST make the moment live, every row shows the current instant at once and follows the clock again, and Now becomes inactive. While the moment is live, Now MUST be inactive: activating it by pointer, touch, Enter or Space MUST change nothing — the moment stays live, the shown date stays and nothing is announced. Errors: none. <!-- implements FR6 of select-date-with-calendar-and-now; FR1, FR2, FR3 of keep-now-button-visible-when-live -->

#### Scenario: Now after browsing dates
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty
- **AND** the user moved to the next day
- **THEN** the Now button is active
- **WHEN** the user returns to now
- **THEN** the moment is live
- **AND** the Almaty row shows `12:30` and `Sun, Mar 8`
- **AND** the Now button is inactive

#### Scenario: An inactive Now changes nothing
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty
- **AND** the moment is live
- **WHEN** the user activates the inactive Now button
- **THEN** the moment is still live
- **AND** the date bar shows Sunday, March 8
- **AND** the Almaty row shows `12:30` and `Sun, Mar 8`

### Requirement: Date bar
The main page SHALL show a date bar with a previous-day button, the shown date, a next-day button and the Now button, in both modes of the reference moment (active while pinned, inactive while live; see "Return to now"). The shown date is the date of the reference moment in the reference zone, written by the interface language's own conventions: below 768 px the short weekday, the day and the full month name (English `Sun, March 8`, Russian `вс, 8 марта`); from 768 px the full weekday (`Sunday, March 8`, `воскресенье, 8 марта`). When its year differs from the current year in the reference zone, the year MUST be appended (`Mon, March 8, 2027`). While live, the shown date MUST follow the clock and change at local midnight of the reference zone. Every string of the bar and the calendar MUST exist in English and Russian. <!-- implements FR7, FR9 of select-date-with-calendar-and-now; FR1 of keep-now-button-visible-when-live -->

#### Scenario: Date text by screen width and language
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the bar is shown in `<language>` at `<width>` px
- **THEN** the shown date reads `<text>`

| language | width | text |
|---|---|---|
| English | 375 | `Sun, March 8` |
| English | 1024 | `Sunday, March 8` |
| Russian | 375 | `вс, 8 марта` |
| Russian | 1024 | `воскресенье, 8 марта` |

#### Scenario: Another year
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the user picks 8 March 2027
- **THEN** the shown date reads `Mon, March 8, 2027` at 375 px in English

#### Scenario: Live date changes at midnight
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the app was opened at `2026-03-08T18:59:30Z`, so the bar shows `Sun, March 8`
- **WHEN** the next minute starts at `2026-03-08T19:00:00Z`
- **THEN** the bar shows `Mon, March 9`

### Requirement: Date bar on every page state
The date bar SHALL be shown at the bottom of the main page in every state of the page: while the view loads, when the view failed to load, with an empty list, with an unreadable stored list, with storage unavailable, and offline. In every one of these states the bar MUST hold the Now button, inactive while the moment is live and active while it is pinned (see "Return to now"). The notices (offline-ready, update, update-check-failed, storage warning) MUST stay visible above the bar and MUST NOT cover it. Date selection needs no network. <!-- implements FR8 of select-date-with-calendar-and-now; FR1 of keep-now-button-visible-when-live -->

#### Scenario: Bar in each state
- **WHEN** the main page is in the `<state>` state, with the moment live as the app opens
- **THEN** the date bar is shown with the previous-day, date and next-day buttons and an inactive Now

| state |
|---|
| view loading |
| view error |
| empty |
| unreadable |
| storage unavailable |
| offline |

#### Scenario: Notice above the bar
- **GIVEN** storage is unavailable
- **WHEN** the main page is shown
- **THEN** the storage warning is above the date bar and does not overlap it

### Requirement: Date changes are fast
A date change SHALL re-present 50 location rows in at most 50 ms, in the same render, with no loading state. The 50 ms budget MUST cover working out the new reference moment and re-presenting every row's labels (local time, local date with its ISO date, UTC offset, device time zone badge) for rows that were already presented once, as they are while the app is open. Drawing the rows into the page is not part of the budget. It MUST still happen in the same render as the date change, with no loading state in between. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: the date change and the re-presentation MUST build no date, time or region name formatter. Inputs: 50 locations with canonical IANA identifiers, the current instant (ISO 8601 with `Z`), the device time zone, a move to the next day. Output: every row carries its local date at the new moment. A date change needs no network and behaves the same offline. <!-- implements NFR-P1 of select-date-with-calendar-and-now; NFR-P1, FR1, UX1 of fix-date-change-row-budget-measurement; FR3, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks -->

#### Scenario: 50 rows within the budget
- **GIVEN** 50 locations whose rows have been presented at the current instant `2026-03-08T07:30:00Z` with the device time zone `UTC`
- **WHEN** the date moves to the next day and the rows are presented again
- **THEN** no date, time or region name formatter is built
- **AND** every row carries its local date at `2026-03-09T07:30:00Z`

#### Scenario: The new date shows in the same render
- **GIVEN** 50 locations
- **AND** the app is open
- **WHEN** the user moves to the next day
- **THEN** the rows show the new date at once, without waiting for a later render

### Requirement: Keyboard-operable date selection
Tab SHALL reach the previous-day button, the date button, the next-day button and, only while it is active, the Now button, in that order; an inactive Now MUST NOT be a Tab stop. Enter and Space MUST activate each control Tab reaches. In the open calendar the focus MUST start on the selected day; ArrowLeft / ArrowRight MUST move it by one day, ArrowUp / ArrowDown by one week, Home / End to the first / last day of the week, PageUp / PageDown by one month, and the shown month MUST follow the focused day. Enter or Space MUST pick the focused day; Esc MUST close the calendar without change. When the calendar closes, and after Now is activated, the focus MUST be on the date button. <!-- implements NFR-A2 of select-date-with-calendar-and-now; NFR-A2 of keep-now-button-visible-when-live -->

#### Scenario: Next day and Now with the keyboard
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the user tabs to the next-day button and presses Enter
- **THEN** the shown date is the next day
- **WHEN** the user tabs to Now and presses Enter
- **THEN** the shown date is today and the focus is on the date button

#### Scenario: Tab order of the bar
- **GIVEN** the moment is pinned
- **WHEN** the user moves the focus to the previous-day button and presses Tab three times
- **THEN** the focus visits the date button, the next-day button and Now, in that order

#### Scenario: Tab skips an inactive Now
- **GIVEN** the moment is live
- **WHEN** the user moves the focus to the next-day button and presses Tab
- **THEN** the focus has left the next-day button and is not on Now

#### Scenario: Space activates the bar and the calendar
- **GIVEN** the current instant is `2026-03-08T07:30:00Z` and the moment is live
- **WHEN** the user moves the focus to the next-day button and presses Space
- **THEN** the shown date is 9 March 2026
- **WHEN** the user moves the focus to the previous-day button and presses Space
- **THEN** the shown date is 8 March 2026
- **WHEN** the user opens the calendar with Space, presses ArrowRight and presses Space
- **THEN** the calendar is closed and the shown date is 9 March 2026

#### Scenario: Pick a date with the keyboard
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the user opens the calendar with Enter
- **THEN** the focus is on 8 March 2026
- **WHEN** the user presses ArrowDown, ArrowRight and Enter
- **THEN** the calendar is closed, the shown date is 16 March 2026 and the focus is on the date button

#### Scenario: Focus crosses into the next month
- **GIVEN** the calendar is open on 31 March 2026
- **WHEN** the user presses ArrowRight
- **THEN** the calendar shows April 2026 with the focus on 1 April

#### Scenario: Page keys and week ends
- **GIVEN** the calendar is open in English on 8 March 2026
- **WHEN** the user presses PageDown, then End
- **THEN** the focus is on Saturday 11 April 2026

#### Scenario: Esc closes without change
- **GIVEN** the calendar is open and the moment is live
- **WHEN** the user moves the focus to another day and presses Esc
- **THEN** the calendar is closed, the moment is still live and the focus is on the date button

### Requirement: Accessible date selection
The bar's controls SHALL have accessible names in the interface language: "Previous day", "Next day", "Now" (active and inactive alike; Russian «Сейчас»), and the date button "Choose date, " followed by the full date with weekday and year ("Choose date, Sunday, March 8, 2026"). The calendar MUST be a modal dialog named by its title, each day named by its full date, today's day button carrying `aria-current="date"` and the grid cell of the selected day `aria-selected="true"`. Each change of the shown date MUST be announced once through a polite live region with the full date ("Monday, March 9, 2026"). An inactive Now MUST be exposed as disabled; an active Now MUST NOT be. axe-core MUST report no violations with the bar live, with the bar pinned, and with the calendar open, in the light and the dark theme. <!-- implements NFR-A1, NFR-A3 of select-date-with-calendar-and-now; NFR-A1 of keep-now-button-visible-when-live -->

#### Scenario: Names and marks
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z` in `Asia/Almaty`
- **WHEN** the user opens the calendar
- **THEN** the date button was named "Choose date, Sunday, March 8, 2026"
- **AND** the day named "Sunday, March 8, 2026" is marked as today
- **AND** the grid cell holding that day is marked as selected

#### Scenario: Now is named in both modes
- **GIVEN** the interface language is `<language>`
- **WHEN** the bar is `<state>`
- **THEN** the bar has a button named `<name>` that is `<availability>`

| language | state | name | availability |
|---|---|---|---|
| English | live | Now | disabled |
| English | pinned | Now | enabled |
| Russian | live | Сейчас | disabled |

#### Scenario: Date change is announced
- **GIVEN** the current instant is `2026-03-08T07:30:00Z` in `Asia/Almaty`
- **WHEN** the user moves to the next day
- **THEN** "Monday, March 9, 2026" is announced politely once

#### Scenario: No accessibility violations
- **WHEN** the page is checked with axe-core with the bar `<state>` in the `<theme>` theme
- **THEN** no violations are reported

| state | theme |
|---|---|
| live | light |
| live | dark |
| pinned | light |
| pinned | dark |
| with the calendar open | light |
| with the calendar open | dark |

### Requirement: Date bar layout
The date bar SHALL stay at the bottom of the viewport while the list scrolls, and the last location card MUST be scrollable fully above it. Below 768 px the day arrows and the date MUST sit at the left of the bar and Now at the right; from 768 px they MUST form one group centred in the bar. The calendar MUST fill the screen below 640 px and be a centred dialog from 640 px. Every control of the bar and every calendar day MUST be at least 44 × 44 px. Now MUST keep the same place and the same size, within 1 px, while live and while pinned. Now MUST show a clock icon and its label in both modes: while active it MUST be the accent-filled button (the theme accent colour with the accent foreground colour); while inactive it MUST use the theme grey fill with the theme muted foreground colour, never the accent colours, and its label MUST be at least 4.5:1 against that fill; the arrows MUST be icon buttons without visible text. The shown date MUST be the most prominent text of the bar — no other text in the bar has a larger font size or a heavier font weight — and MUST use the theme's main foreground colour. The page MUST NOT scroll horizontally at 320 px and 2560 px with the bar live, pinned, or with the calendar open. The approved screenshots at 375 px and 1024 px in both themes MUST show the bar, including new "pinned" and "calendar" states taken at `2026-03-08T07:30:00Z`; the screenshots of states with a live moment MUST show the inactive Now. <!-- implements NFR-R1, NFR-R2, NFR-R3, UX1, UX2, UX3 of select-date-with-calendar-and-now; FR4, NFR-A3, NFR-R1, NFR-R2, UX1, UX2 of keep-now-button-visible-when-live -->

#### Scenario: Bar on a narrow screen
- **GIVEN** the moment is pinned
- **WHEN** the page is 375 px wide
- **THEN** the arrows and the date are at the left of the bar and Now is at the right
- **AND** the bar touches the bottom of the viewport

#### Scenario: Bar on a wide screen
- **GIVEN** the moment is pinned
- **WHEN** the page is 1024 px wide
- **THEN** the arrows, the date and Now form one group centred in the bar

#### Scenario: Last card above the bar
- **GIVEN** the list has 12 locations and the page is 375 px wide
- **WHEN** the user scrolls to the end
- **THEN** the last card is fully above the bar

#### Scenario: Calendar on a narrow and a wide screen
- **WHEN** the calendar is open on a page `<width>` px wide
- **THEN** the calendar is `<layout>`

| width | layout |
|---|---|
| 375 | full screen |
| 639 | full screen |
| 640 | a dialog centred in the viewport and narrower than it |
| 1024 | a dialog centred in the viewport and narrower than it |

#### Scenario: Bar controls look as approved
- **GIVEN** the moment is pinned
- **WHEN** the bar is shown in the `<theme>` theme
- **THEN** Now shows a clock icon and the label "Now" in the theme's accent foreground colour on the theme's accent colour
- **AND** the previous-day and next-day buttons show an icon and no visible text

| theme |
|---|
| light |
| dark |

#### Scenario: An inactive Now is grey
- **GIVEN** the moment is live
- **WHEN** the bar is shown in the `<theme>` theme
- **THEN** Now shows a clock icon and the label "Now" in the theme's muted foreground colour on the theme's grey fill

| theme |
|---|
| light |
| dark |

#### Scenario: Now keeps its place
- **GIVEN** the page is `<width>` px wide in the `<theme>` theme
- **AND** the moment is live
- **WHEN** the user moves to the next day
- **THEN** Now's box is the same as while live, within 1 px

| width | theme |
|---|---|
| 375 | light |
| 375 | dark |
| 1024 | light |
| 1024 | dark |

#### Scenario: The date is the most prominent text of the bar
- **GIVEN** the moment is pinned
- **WHEN** the bar is shown in the `<theme>` theme on a page `<width>` px wide
- **THEN** no other text in the bar has a larger font size or a heavier font weight than the shown date
- **AND** the shown date uses the theme's main foreground colour

| theme | width |
|---|---|
| light | 375 |
| dark | 375 |
| light | 1024 |
| dark | 1024 |

#### Scenario: Touch targets
- **WHEN** the bar is pinned and the calendar is open at 375 px
- **THEN** each bar control and each calendar day is at least 44 × 44 px

#### Scenario: Calendar days fit the narrowest screen
- **WHEN** the calendar is open on a page 320 px wide
- **THEN** each calendar day is at least 44 × 44 px
- **AND** the calendar does not scroll horizontally

#### Scenario: No horizontal scrolling
- **WHEN** the page is `<width>` px wide with the bar live, pinned, or with the calendar open
- **THEN** the page does not scroll horizontally

| width |
|---|
| 320 |
| 2560 |
