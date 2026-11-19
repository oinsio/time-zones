## MODIFIED Requirements

### Requirement: Date bar layout
The date bar SHALL stay at the bottom of the viewport while the list scrolls, and the last location card MUST be scrollable fully above it. The bar MUST have the page background colour (never transparent) and no line above it. At every width from 320 px to 2560 px the day arrows, the date and Now MUST form one group centred in the bar, inside the content column (see the `main-page` capability), with no divider before Now and the same gaps between the controls at every width, and the group MUST keep at least 8 px from each side of the viewport, so no control sticks to a screen edge and the group never jumps between layouts while the window is resized. The calendar MUST fill the screen below 640 px and be a centred dialog from 640 px. Every control of the bar and every calendar day MUST be at least 44 × 44 px. The shown date MUST be 16 px with weight 700 in the theme's foreground colour, written by the interface language's conventions, and no other text in the bar has a larger font size or a heavier font weight. Now MUST be an outlined button: 44 px high, radius 13 px, a 1 px border, a clock icon of 18 px and its label at 16 px with weight 600, and no fill of its own. While active, Now MUST have the control border and a label in the foreground colour; while inactive, it MUST have the inactive control border and a label in the muted foreground colour, whose contrast against the page background is at least 4.5:1 (5.7:1 in the light theme, 8.1:1 in the dark theme). Now MUST keep the same place and the same size, within 1 px, while live and while pinned. When Now is active is unchanged ("Return to now"). The arrows MUST be icon buttons without visible text. The page MUST NOT scroll horizontally at 320 px and 2560 px with the bar live, pinned, or with the calendar open. The approved screenshots of the main page MUST show this bar. <!-- implements NFR-R1, NFR-R2, NFR-R3, UX1, UX2, UX3 of select-date-with-calendar-and-now; FR4, NFR-A3, NFR-R1, NFR-R2, UX1, UX2 of keep-now-button-visible-when-live; FR15, NFR-R2, UX4 of add-settings-page-and-device-time-location; FR14, NFR-A2 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Bar on a narrow screen
- **GIVEN** the moment is pinned and the `<theme>` theme
- **WHEN** the page is 390 px wide
- **THEN** the arrows, the date and Now form one group centred in the bar
- **AND** the bar touches the bottom of the viewport
- **AND** the bar's background is the page background colour `<background>` and it has no top border

| theme | background |
|---|---|
| light | `#f7f7f5` |
| dark | `#0b1628` |

#### Scenario: Bar on a wide screen
- **GIVEN** the moment is pinned
- **WHEN** the page is 1440 px wide
- **THEN** the arrows, the date and Now form one group centred in the bar, inside the content column

#### Scenario: The group stays centred while the window is resized
- **GIVEN** the moment is pinned
- **WHEN** the page is `<width>` px wide
- **THEN** the group's free space on the left and on the right of the bar differs by at most 1 px
- **AND** the gap between the next-day button and Now equals the gap at 390 px within 1 px
- **AND** the group keeps at least 8 px from each side of the viewport

| width |
|---|
| 320 |
| 390 |
| 767 |
| 768 |
| 1024 |
| 2560 |

#### Scenario: Last card above the bar
- **GIVEN** the list has 12 locations and the page is 390 px wide
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
- **THEN** Now is an outlined button 44 px high with a 13 px radius, a 1 px border of `<border>`, no fill of its own, an 18 px clock icon and the label "Now" at 16 px, weight 600, in `<label>`
- **AND** the previous-day and next-day buttons show an icon and no visible text

| theme | border | label |
|---|---|---|
| light | `#8a8a93` | `#1c1c20` |
| dark | `#6b7a99` | `#f7f8fc` |

#### Scenario: An inactive Now is grey
- **GIVEN** the moment is live
- **WHEN** the bar is shown in the `<theme>` theme
- **THEN** Now shows a clock icon and the label "Now" in `<label>` with a 1 px border of `<border>` and no fill of its own
- **AND** the label has a contrast of at least 4.5:1 against the page background

| theme | border | label |
|---|---|---|
| light | `#c9ccd4` | `#60616c` |
| dark | `#33415c` | `#9aaed1` |

#### Scenario: Now keeps its place
- **GIVEN** the page is `<width>` px wide in the `<theme>` theme
- **AND** the moment is live
- **WHEN** the user moves to the next day
- **THEN** Now's box is the same as while live, within 1 px

| width | theme |
|---|---|
| 390 | light |
| 390 | dark |
| 1024 | light |
| 1024 | dark |

#### Scenario: The date is the most prominent text of the bar
- **GIVEN** the moment is pinned and the interface language is Russian at `2026-03-08T07:30:00Z`
- **WHEN** the bar is shown in the `<theme>` theme on a page `<width>` px wide
- **THEN** the shown date is 16 px with weight 700 in the theme's main foreground colour, and below 768 px reads `вс, 8 марта`
- **AND** no other text in the bar has a larger font size or a heavier font weight than the shown date

| theme | width |
|---|---|
| light | 390 |
| dark | 390 |
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
