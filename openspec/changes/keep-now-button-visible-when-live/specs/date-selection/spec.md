## MODIFIED Requirements

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

