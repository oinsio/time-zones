# Spec Delta

## MODIFIED Requirements

### Requirement: Date bar layout
The date bar SHALL stay at the bottom of the viewport while the list scrolls, and the last location card MUST be scrollable fully above it. At every width from 320 px to 2560 px the day arrows, the date and Now MUST form one group centred in the bar, with the same gaps between them at every width, and the group MUST keep at least 8 px from each side of the viewport, so no control sticks to a screen edge and the group never jumps between layouts while the window is resized. The calendar MUST fill the screen below 640 px and be a centred dialog from 640 px. Every control of the bar and every calendar day MUST be at least 44 × 44 px. Now MUST keep the same place and the same size, within 1 px, while live and while pinned. Now MUST show a clock icon and its label in both modes: while active it MUST be the accent-filled button (the theme accent colour with the accent foreground colour); while inactive it MUST use the theme grey fill with the theme muted foreground colour, never the accent colours, and its label MUST be at least 4.5:1 against that fill; the arrows MUST be icon buttons without visible text. The shown date MUST be the most prominent text of the bar — no other text in the bar has a larger font size or a heavier font weight — and MUST use the theme's main foreground colour. The page MUST NOT scroll horizontally at 320 px and 2560 px with the bar live, pinned, or with the calendar open. The approved screenshots at 375 px and 1024 px in both themes MUST show the bar, including new "pinned" and "calendar" states taken at `2026-03-08T07:30:00Z`; the screenshots of states with a live moment MUST show the inactive Now. <!-- implements NFR-R1, NFR-R2, NFR-R3, UX1, UX2, UX3 of select-date-with-calendar-and-now; FR4, NFR-A3, NFR-R1, NFR-R2, UX1, UX2 of keep-now-button-visible-when-live; FR15, NFR-R2, UX4 of add-settings-page-and-device-time-location -->

#### Scenario: Bar on a narrow screen
- **GIVEN** the moment is pinned
- **WHEN** the page is 375 px wide
- **THEN** the arrows, the date and Now form one group centred in the bar
- **AND** the bar touches the bottom of the viewport

#### Scenario: Bar on a wide screen
- **GIVEN** the moment is pinned
- **WHEN** the page is 1024 px wide
- **THEN** the arrows, the date and Now form one group centred in the bar

#### Scenario: The group stays centred while the window is resized
- **GIVEN** the moment is pinned
- **WHEN** the page is `<width>` px wide
- **THEN** the group's free space on the left and on the right of the bar differs by at most 1 px
- **AND** the gap between the next-day button and Now equals the gap at 375 px within 1 px
- **AND** the group keeps at least 8 px from each side of the viewport

| width |
|---|
| 320 |
| 375 |
| 767 |
| 768 |
| 1024 |
| 2560 |

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

### Requirement: Wall-clock resolution on the new date
When a date change keeps a wall-clock time that does not exist on the new date in the reference zone (a DST gap), the moment SHALL move forward by the length of the gap; when the wall-clock time occurs twice (a DST overlap), the moment MUST be the earlier of the two instants. The outcome MUST be reported with the pinned moment as `UNIQUE`, `GAP` or `AMBIGUOUS`. On `GAP` the date bar MUST tell the user, in the interface language, which wall-clock time was kept and which time is shown instead. The note MUST stay until the next date change, the next time selection on a day track, the next wall-time input (see the `time-selection` capability), Now, or a change of the reference zone; a time selection pins an exact instant and is reported as `UNIQUE`. A change of the reference zone keeps the pinned instant; a moment that a date change reported as `GAP` is then reported as `UNIQUE`. The status of a moment pinned by a wall-time input follows the `time-selection` capability: it stays for a location, and on the device time location it ends when the device time zone changes. A wall-time input never produces this note: its outcome is told by the wall-time hint in the row where it was typed, so the date bar and a row never both show a note about a wall-clock time. `UNIQUE` and `AMBIGUOUS` MUST show no note. <!-- implements FR4 of select-date-with-calendar-and-now; FR5 of add-time-sliders-to-location-cards; FR4 of set-home-location-and-show-differences; FR7 of add-wall-time-input-with-hint; FR9 of add-settings-page-and-device-time-location -->

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

