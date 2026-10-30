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
