## MODIFIED Requirements

### Requirement: Hour cells of the reference day
Every grid row SHALL show, after its row header, an hour strip of hour cells over the reference day. The cells MUST be consecutive one-hour spans of absolute time starting at the reference zone's local midnight: 24 cells on an ordinary day, 23 or 25 on a day with a clock change in the reference zone; a reference day whose length is not a whole number of hours ends with one shorter cell. Column `n` of every row MUST cover the same absolute hour, so the cells of all rows stand one under another. Inputs: the location's IANA time zone ID, the reference day. Output: the ordered cells, each with its start instant. Errors: a zone the engine rejects gives no hour strip for that row; the other rows are unaffected.

While a meeting range is set, every hour strip MUST show its cells through the cell after the last cell that the range overlaps. Cells after the end of the reference day are the **strip tail**: consecutive one-hour cells of the next reference day, the same in every row, never more than that day has. A range whose last overlapped cell is not the last cell of the reference day gives no tail, and with no meeting range there is no tail. A tail cell is an hour cell in every respect: its label, colour, midnight marker and offset edge follow the same rules. <!-- implements FR1, FR2 of add-grid-hour-cells-and-hour-frame; FR6, FR7 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Four rows of 24 aligned cells
- **GIVEN** the view mode is Grid, the device time zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z`
- **AND** the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the main page is shown
- **THEN** every row has 24 hour cells
- **AND** column 12 starts at `2026-03-08T07:00:00Z` in every row

#### Scenario: Clock change days in the reference zone
- **GIVEN** the reference zone is `America/New_York`
- **WHEN** the reference day is `<date>`
- **THEN** every row has `<count>` hour cells

| date | count |
|---|---|
| 2026-03-08 | 23 |
| 2026-11-01 | 25 |
| 2026-06-01 | 24 |

#### Scenario: Cells in a real layout stand in columns
- **GIVEN** the view mode is Grid and the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the main page is 1440 px wide
- **THEN** the cells of column 12 of all rows have the same left edge and the same width

#### Scenario: Strip tail of a meeting past midnight
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York on 2026-03-08, reference zone `Asia/Almaty`
- **WHEN** the meeting range is `<range>` in Almaty
- **THEN** every row has `<count>` hour cells, `<tail>` of them in the strip tail
- **AND** column 24, when shown, starts at `2026-03-08T19:00:00Z` in every row

| range | count | tail |
|---|---|---|
| 09:00–11:00 | 24 | 0 |
| 21:00–23:00 | 24 | 0 |
| 22:00–23:30 | 25 | 1 |
| 22:00–24:00 | 25 | 1 |
| 22:00–00:15 of the next day | 26 | 2 |
| 23:00–02:00 of the next day | 27 | 3 |

#### Scenario: The tail goes away with the meeting
- **GIVEN** the meeting range is 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
- **WHEN** the user chooses «Сбросить выбор встречи»
- **THEN** every row has 24 hour cells

### Requirement: Midnight marker in the hour strip
The cell whose start is the first instant of a new local date of the location SHALL be the midnight cell of its row: it MUST show the short month name of that date in upper case without a trailing full stop over the day of the month, in the interface language, instead of the time, and MUST be shaded with the midnight cell shade of the active theme (`rgba(24, 24, 27, 0.10)` light, `rgba(15, 23, 41, 0.22)` dark). A row whose zone is the reference zone MUST show a plain `0` on its first cell and has no midnight cell inside the reference day; the first cell of its strip tail is its midnight cell, like in any other row. Any other row has at most one midnight cell per local date change inside the reference day. <!-- implements FR5 of add-grid-hour-cells-and-hour-frame; FR7 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Midnight cells of the sample day
- **GIVEN** the reference zone is `Asia/Almaty`, the reference day is 2026-03-08 and the interface language is Russian
- **WHEN** the hour cells are presented
- **THEN** the midnight cell of `<city>` is column `<column>` with `МАР` over `8`

| city | column |
|---|---|
| Moscow | 2 |
| Kolkata | 0 |
| New York | 10 |

#### Scenario: The reference zone's row starts with 0
- **GIVEN** the reference zone is `Asia/Almaty` and the reference day is 2026-03-08
- **WHEN** the hour cells of Almaty are presented
- **THEN** column 0 shows `0` and no cell of Almaty is a midnight cell

#### Scenario: English month
- **GIVEN** the reference zone is `Asia/Almaty`, the reference day is 2026-03-08 and the interface language is English
- **WHEN** the hour cells of Moscow are presented
- **THEN** column 2 shows `MAR` over `8`

#### Scenario: Midnight cells of the strip tail
- **GIVEN** the reference zone is `Asia/Almaty`, the interface language is Russian and the meeting range is 23:00 on 2026-03-08 to 02:00 on 2026-03-09
- **WHEN** the hour cells are presented
- **THEN** the cell of `<city>` in column `<column>` shows `МАР` over `9`

| city | column |
|---|---|
| Almaty | 24 |
| Kolkata | 24 |
| Moscow | 26 |

### Requirement: Hour strip width
When the hour strip's width divided by its cell count, the strip tail included, is at least 32 px, every cell SHALL take an equal share of the strip, less the 3 px gap between cells, and all cells of the strip MUST be visible without scrolling. Otherwise every cell MUST be 38 px wide, and the strips of all rows MUST scroll horizontally together while the row headers and row notes stay in place; the page itself MUST NOT scroll horizontally. On opening, the strips MUST be scrolled so that the hour frame is fully visible, and when the frame moves to a column outside the visible part they MUST scroll to show it. <!-- implements NFR-R1, NFR-R2, UX3 of add-grid-hour-cells-and-hour-frame; FR17, NFR-R1 of redesign-cards-grid-and-day-palettes; FR8, NFR-R1 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: All hours fit
- **GIVEN** the view mode is Grid and the stored locations are Almaty, Moscow, Kolkata and New York at `2026-03-08T07:30:00Z`
- **WHEN** the main page is `<width>` by `<height>` px
- **THEN** all 24 cells of every row are inside the panel and the strips do not scroll

| width | height |
|---|---|
| 2560 | 1440 |
| 1440 | 900 |
| 1180 | 820 |
| 844 | 390 |

#### Scenario: Phone in portrait scrolls all strips together
- **GIVEN** the view mode is Grid and the stored locations are Almaty, Moscow, Kolkata and New York at `2026-03-08T07:30:00Z`
- **WHEN** the main page is 390 by 844 px
- **THEN** every cell is 38 px wide and 8 to 10 cells of each row are visible
- **AND** the hour frame is fully visible
- **AND** the page does not scroll horizontally
- **WHEN** the user scrolls Moscow's strip to its end
- **THEN** all four strips show their last cell and Almaty's city stays at its place

#### Scenario: Frame moved out of view is scrolled into view
- **GIVEN** the Grid view at 390 by 844 px at `2026-03-08T07:30:00Z`
- **WHEN** the user focuses Almaty's hour strip and presses End
- **THEN** the hour frame is on column 23 and fully visible

#### Scenario: Strip width with a tail
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York and the meeting range 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
- **WHEN** the main page is `<width>` by `<height>` px
- **THEN** the 27 cells of every row `<fit>`

| width | height | fit |
|---|---|---|
| 2560 | 1440 | are inside the panel and the strips do not scroll |
| 1440 | 900 | are inside the panel and the strips do not scroll |
| 1280 | 800 | are inside the panel and the strips do not scroll |
| 844 | 390 | are 38 px wide and the strips scroll together |
| 390 | 844 | are 38 px wide and the strips scroll together |

### Requirement: Tap or Enter sets a one-hour meeting range
A tap or click on an hour cell SHALL set a one-hour meeting range starting at the cell's start. On the last cell of a reference day that is not a whole number of hours, the range ends at the end of the day. Enter or Space on a focused hour strip MUST set the same range for the cell of the hour frame. A tap MUST work without Pointer Events (a plain click). A tap on a cell of the meeting range replaces the range with the one-hour range of that cell. A click that ends a press on a meeting handle is not a tap, wherever the pointer is released ("Drag a meeting handle"). A tap or click on a cell of the strip tail MUST change nothing. <!-- implements FR5, NFR-A2 of add-grid-meeting-range-and-share; FR8 of refine-meeting-range-entry-and-handles; FR9 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Tap on column 9
- **GIVEN** the view mode is Grid, the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z`, live, and the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the user taps column 9 of Moscow
- **THEN** the meeting range is 09:00–10:00 in Almaty
- **AND** Almaty shows `09:00–10:00` and the title is «Встреча · 1 ч»

#### Scenario: Enter on an hour strip
- **GIVEN** the Grid view at `2026-03-08T07:30:00Z`, live, with Almaty and Moscow
- **WHEN** the user focuses Almaty's hour strip and presses Enter
- **THEN** the meeting range is 12:00–13:00 in Almaty

#### Scenario: A tap on a tail cell changes nothing
- **GIVEN** the Grid view with the meeting range 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
- **WHEN** the user taps column 26 of Moscow
- **THEN** the meeting range is unchanged and the date bar still shows 8 March

### Requirement: Drag across hour cells sets a meeting range
Dragging across hour cells with a mouse or a pen SHALL set a meeting range from the start of the first cell to the end of the last cell touched, in either direction, and MUST update it each time the pointer enters another cell. While all cells of the strips, the strip tail included, fit without scrolling, a finger drag MUST do the same, also when it starts inside the meeting frame, as long as the finger enters another cell before it has been held for 250 ms; a finger held for 250 ms inside the frame without moving more than 5 px starts a move instead ("Move the meeting range by its frame") and sets no range from the cells it then touches. Where the strips scroll horizontally, a finger swipe MUST scroll the strips and set no meeting range. A drag that starts on a cell of the reference day MAY run onto the cells of the strip tail shown at the press; that tail MUST stay until the drag ends. The end of a range set by a drag MUST NOT lie more than 24 hours after its start: a drag that touches more cells ends the range 24 hours after its start. A drag that starts on a tail cell MUST change nothing. A mouse or pen press on an hour cell inside the meeting frame does not start such a drag: it follows "Move the meeting range by its frame". <!-- implements FR6 of add-grid-meeting-range-and-share; FR9, FR15 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Drag from column 9 to column 10
- **GIVEN** the Grid view at 1440 by 900 px at `2026-03-08T07:30:00Z` with Almaty, Moscow, Kolkata and New York
- **WHEN** the user drags with the mouse from column 9 of Almaty to column 10 of Almaty
- **THEN** the meeting range is 09:00–11:00 in Almaty and the title is «Встреча · 2 ч»

#### Scenario: Drag to the left
- **GIVEN** the Grid view at 1440 by 900 px at `2026-03-08T07:30:00Z`
- **WHEN** the user drags with the mouse from column 10 to column 8 of Almaty
- **THEN** the meeting range is 08:00–11:00 in Almaty

#### Scenario: A swipe on a scrolling strip sets nothing
- **GIVEN** the Grid view at 390 by 844 px at `2026-03-08T07:30:00Z`, live
- **WHEN** the user swipes Moscow's strip to the left with a finger
- **THEN** the strips scroll and no meeting range is set

#### Scenario: Drag onto the strip tail
- **GIVEN** the Grid view at 1440 by 900 px with the meeting range 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
- **WHEN** the user drags with the mouse from column 21 of Almaty to column 24 of Almaty
- **THEN** the meeting range is 21:00 on 2026-03-08 to 01:00 on 2026-03-09 in Almaty

#### Scenario: A drag across more than 24 hours
- **GIVEN** the Grid view at 1440 by 900 px with the meeting range 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
- **WHEN** the user drags with the mouse from column 0 of Almaty to column 26 of Almaty
- **THEN** the meeting range is 00:00 on 2026-03-08 to 00:00 on 2026-03-09 in Almaty and the title is «Встреча · 24 ч»

#### Scenario: A finger drag inside the frame on fitting strips
- **GIVEN** the Grid view at 1440 by 900 px on a touch screen with the meeting range 13:00–15:00 in Almaty on 2026-03-08
- **WHEN** the user drags a finger from column 14 to column 17 of Almaty without holding it first
- **THEN** the meeting range is 14:00–18:00 in Almaty

### Requirement: Meeting frame and dimmed cells
While a meeting range is set, a meeting frame SHALL surround the range across all rows of the panel, from its start to its end, in the meeting colour of the active theme (`#00AA00` light, `#3DD13D` dark), and no hour frame MUST be shown. Hour cells that do not overlap the range MUST be dimmed to opacity 0.4; a cell that overlaps it even in part is not dimmed. Cells of the strip tail are dimmed by the same rule. The meeting frame MUST lie above the hour cells and behind the row header texts and row notes; its border MUST NOT take pointer events, and a press on the hour cells inside it follows "Move the meeting range by its frame"; like the hour frame ("Hour frame lies behind texts") it MUST be hidden only behind text glyphs, the row notes and an open input, and drawn at every other point of its border inside a row header. With no rows, no frame is shown. <!-- implements FR7, UX1 of add-grid-meeting-range-and-share; FR8, UX3 of fix-grid-meeting-range-lock-and-layering; FR7, FR15 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Frame and dimming of the sample meeting
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York and the meeting range 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the main page is shown
- **THEN** the meeting frame encloses columns 9 and 10 of every row
- **AND** 22 cells of every row are dimmed and columns 9 and 10 are not
- **AND** no hour frame is shown

#### Scenario: A quarter-hour range
- **GIVEN** the meeting range is 09:15–10:30 in Almaty on 2026-03-08
- **WHEN** the Grid view is shown
- **THEN** columns 9 and 10 are not dimmed and every other column is

#### Scenario: Meeting frame colour and layers
- **GIVEN** the Grid view at 390 by 844 px with Almaty and New York, the meeting range 09:00–11:00 in Almaty and the `<theme>` theme
- **WHEN** the main page is shown
- **THEN** the meeting frame has the `<theme>` meeting colour
- **AND** where the frame crosses New York's clock change note or a row header text, the topmost element is the note or the text

| theme |
|---|
| light |
| dark |

#### Scenario: Frame over the strip tail
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York and the meeting range 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
- **WHEN** the main page is shown
- **THEN** the meeting frame encloses columns 23, 24 and 25 of every row
- **AND** column 26 and columns 0 to 22 are dimmed

### Requirement: Meeting handles on the frame
While a meeting range is set and the list has rows, the Grid view SHALL show the start and the end meeting handles in the meeting colour (the move handle has its own requirement, "Move handle on the frame"): the start handle centred on the left edge of the meeting frame, the end handle centred on its right edge, each over the hour strip of a row.

The handles MUST stand on the rows the user can see. The candidate rows are those on which a meeting handle, centred on the row's hour strip, lies fully inside the viewport, below the meeting bar and above the date bar; the handle is taller than a strip, so the handle's box decides, not the strip's. When no row is a candidate, every row of the list is a candidate. With `k` candidate rows, counted from 1 in list order, the end handle stands on candidate row `⌈k / 2⌉` and the start handle on the candidate row after it. With one candidate row, both handles stand on it.

When the page scrolls or resizes, the handles MUST move to the rows of the new candidates. Re-placing the handles MUST measure the strips at most once per animation frame and MUST re-render a handle only when its row changes. While a meeting handle is being dragged, neither handle changes its row.

The handles MUST lie above everything in the panel, the row header texts and row notes included, and below an open location menu. <!-- implements FR9, NFR-R1, UX1 of add-grid-meeting-range-and-share; FR7, NFR-P1, NFR-R1 of refine-meeting-range-entry-and-handles; FR13 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Handles of the sample meeting
- **GIVEN** the Grid view at 1440 by 900 px with Almaty, Moscow, Kolkata and New York and the meeting range 09:00–11:00
- **WHEN** the main page is shown
- **THEN** the end handle stands on Moscow's strip at the right edge of the frame and the start handle on Kolkata's strip at its left edge
- **AND** the topmost element at the centre of each handle is that handle

#### Scenario: Handles stay on screen in a long list
- **GIVEN** the Grid view at `<width>` by `<height>` px with 12 locations and the meeting range 09:00–11:00 in Almaty
- **WHEN** the page is scrolled to its `<position>`
- **THEN** both meeting handles lie fully inside the viewport, below the meeting bar and above the date bar
- **AND** the topmost element at the centre of each handle is that handle

| width | height | position |
|---|---|---|
| 390 | 844 | top |
| 390 | 844 | middle |
| 390 | 844 | bottom |
| 844 | 390 | top |
| 844 | 390 | middle |
| 844 | 390 | bottom |

#### Scenario: Handle rows among the visible rows
- **GIVEN** the candidate rows, on which a centred meeting handle lies fully inside the viewport below the meeting bar and above the date bar, are rows `<first>` to `<last>` of the list
- **WHEN** the handle rows are chosen
- **THEN** the end handle stands on row `<end>` and the start handle on row `<start>`

| first | last | end | start |
|---|---|---|---|
| 1 | 4 | 2 | 3 |
| 7 | 12 | 9 | 10 |
| 5 | 5 | 5 | 5 |
| 3 | 4 | 3 | 4 |

#### Scenario: Scrolling re-places the handles cheaply
- **GIVEN** the Grid view with 12 locations and the meeting range 09:00–11:00 in Almaty
- **WHEN** three scroll events arrive before the next animation frame
- **THEN** the hour strips are measured once
- **AND** a scroll that leaves the candidate rows unchanged re-renders no meeting handle

### Requirement: Meeting handles are sliders
Each meeting handle SHALL be a slider for assistive technology and the keyboard, named «Начало встречи» / «Конец встречи» ("Meeting start" / "Meeting end"). Its value MUST be the minutes from the start of the reference day to its end of the range, which may be off the track step and, for the end handle, more than the length of the day. Its minimum and maximum MUST be the limits of "Meeting handle moves" of `meeting-range`, and its value text the local time of that end in the reference zone in the hour format setting. Each key MUST move the handle as those rules say, each limited by them:
- Arrow Right / Arrow Up and Arrow Left / Arrow Down: to the next or previous track step position;
- Page Up / Page Down: by one hour;
- Home / End: to its earliest / latest position.

Each handle MUST be one Tab stop, the start handle before the end handle, both after the last row's controls. Each MUST have a visible focus ring in the accent colour and a hit area of at least 44 × 44 px centred on the frame's edge. Its visible grip MUST keep its size. <!-- implements FR12, NFR-A1, NFR-A2 of add-grid-meeting-range-and-share; FR4, NFR-A2, UX2 of refine-meeting-range-entry-and-handles; FR4 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Slider values of the handles
- **GIVEN** the interface language is English, the hour format is 24-hour and the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the Grid view is shown
- **THEN** the slider "Meeting start" has the value 540, the minimum 0, the maximum 645 and the value text `09:00`
- **AND** the slider "Meeting end" has the value 660, the minimum 555, the maximum 1980 and the value text `11:00`

#### Scenario: Slider values off the track step
- **GIVEN** the interface language is English, the hour format is 24-hour and the meeting range is 09:05–09:28 in Almaty on 2026-03-08
- **WHEN** the Grid view is shown
- **THEN** the slider "Meeting start" has the value 545, the minimum 0, the maximum 553 and the value text `09:05`
- **AND** the slider "Meeting end" has the value 568, the minimum 560, the maximum 1985 and the value text `09:28`

#### Scenario: Keys on the handles
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user focuses «Начало встречи» and presses Arrow Right
- **THEN** the meeting range is 09:15–11:00 and the title is «Встреча · 1 ч 45 мин»
- **WHEN** the user focuses «Конец встречи» and presses Page Up
- **THEN** the meeting range is 09:15–12:00

#### Scenario: Arrow keys bring an off-step end onto the track step
- **GIVEN** the meeting range is 09:05–11:00 in Almaty on 2026-03-08
- **WHEN** the user focuses «Начало встречи» and presses Arrow Right
- **THEN** the meeting range is 09:15–11:00
- **WHEN** the user presses Arrow Left twice
- **THEN** the meeting range is 08:45–11:00

#### Scenario: The hit area is at least 44 by 44 px
- **GIVEN** the Grid view at `<width>` by `<height>` px with the sample meeting
- **WHEN** the main page is shown
- **THEN** the box of each slider «Начало встречи» and «Конец встречи» is at least 44 px wide and 44 px high and centred on its frame edge

| width | height |
|---|---|
| 1440 | 900 |
| 390 | 844 |

#### Scenario: Slider values of a meeting past midnight
- **GIVEN** the interface language is English, the hour format is 24-hour and the meeting range is 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
- **WHEN** the Grid view is shown
- **THEN** the slider "Meeting start" has the value 1380, the minimum 120, the maximum 1425 and the value text `23:00`
- **AND** the slider "Meeting end" has the value 1560, the minimum 1395, the maximum 2820 and the value text `02:00`

#### Scenario: End on the end handle
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user focuses «Конец встречи» and presses End
- **THEN** the meeting range is 09:00 on 2026-03-08 to 09:00 on 2026-03-09 and the title is «Встреча · 24 ч»

### Requirement: Handle drag scrolls the strips
When the strips scroll horizontally and a dragged meeting handle comes within 32 px of the left or right edge of the strips' visible part, the strips SHALL keep scrolling in that direction while the handle stays in that zone, until they reach their end or the drag ends. The handle's end of the range follows the scrolled position by the rule of "Drag a meeting handle": the position of the handle at the press, plus the pointer's horizontal travel along the strips since the press (the strips' scroll included), rounded to the nearest track step. The handle therefore keeps the horizontal distance from the pointer it had at the press, within one track step, and its end never jumps by more than one track step per pointer move or scroll frame. While a meeting range is set, the strips MUST NOT scroll on their own to follow the hour frame (the pinned start); once the range is cleared, they scroll the hour frame into view if it is hidden. When the strip tail grows or shrinks during a drag, the dragged end of the range MUST NOT change at that moment; the handle then keeps the distance from the pointer it has after the change. The same rules hold while the whole range is moved ("Moving the meeting range"). <!-- implements FR10, FR11, NFR-R1, UX2 of add-grid-meeting-range-and-share; FR8 of refine-meeting-range-entry-and-handles; FR6, FR19 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Dragging the end handle to the right edge on a phone
- **GIVEN** the Grid view at 390 by 844 px with the meeting range 09:00–11:00 in Almaty and the strips scrolled so that the frame is visible
- **WHEN** the user drags the end handle to the right edge of the visible strips and holds it there
- **THEN** the strips scroll to the right
- **AND** the meeting range ends later than 11:00 when the drag ends
- **AND** the end handle keeps the horizontal distance from the finger it had at the press, within one track step

#### Scenario: Dragging the start handle to the left edge on a phone
- **GIVEN** the Grid view at 390 by 844 px with the meeting range 09:00–11:00 in Almaty and the strips scrolled so that the frame is visible
- **WHEN** the user drags the start handle to the left edge of the visible strips and holds it there
- **THEN** the strips scroll to the left
- **AND** the meeting range starts earlier than 09:00 when the drag ends
- **AND** the start changes by at most one track step per move and the start handle keeps the horizontal distance from the finger it had at the press, within one track step

#### Scenario: The hour frame comes back into view after Clear
- **GIVEN** the Grid view at 390 by 844 px with a meeting range whose start column is scrolled out of view
- **WHEN** the user chooses «Сбросить выбор встречи»
- **THEN** the hour frame is shown on the former start column, fully visible

#### Scenario: The tail grows under a dragged end handle
- **GIVEN** the Grid view at 1440 by 900 px with the meeting range 21:00–23:00 in Almaty on 2026-03-08
- **WHEN** the user drags the end handle to the right, past the last cell of the reference day
- **THEN** each time the strip tail grows, the end of the meeting range is the same just before and just after
- **AND** the meeting range ends on 2026-03-09 when the drag ends

### Requirement: Meeting range input
While a meeting range is set, the span of every grid row SHALL be a button named «Ввести время встречи — {city}, {span}» ("Enter meeting time — {city}, {span}"). The button MUST open the meeting range input in place of the span, with:
- the start time field «Время начала — {city}» ("Start time — {city}") and the end time field «Время окончания — {city}» ("End time — {city}");
- a dash `–` between them;
- both fields filled with the row's local start and end in the hour format setting.

The start field MUST take the focus with its text selected. Each field MUST accept the texts the wall-time input accepts, at any minute, and MUST insert the time separator while digits are typed ("Time separator while typing" of `time-selection`).

Enter in either field, or the focus leaving both fields after a text changed, MUST confirm. The row's location, the local date the row showed when the input opened and the two times then set the meeting range as "Set a meeting range from wall-clock times" of `meeting-range` says.

A field whose text is not a time MUST show «Введите время в формате ЧЧ:ММ» ("Enter the time as HH:MM") and keep the input open. A pair that is refused MUST mark both fields invalid, keep the input open and change nothing, showing:
- for `MEETING_START_EQUALS_END`: «Начало и окончание встречи совпадают» ("The meeting start and end are the same");
- for `INVALID_MEETING_RANGE`: «Начало встречи должно быть внутри дня» ("The meeting must start within the day").

No message mentions a step. A pair that sets the range MUST close the input and return the focus to the row's span. Esc, or the focus leaving both fields with their texts unchanged, MUST close the input without a change. Moving the focus from one field to the other MUST NOT confirm. <!-- implements FR3, FR4, UX2 of fix-grid-meeting-range-lock-and-layering; FR2, FR3, NFR-A1, UX3 of refine-meeting-range-entry-and-handles; FR3, FR10 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Type the meeting in another location's time
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York, Russian interface, 24-hour format and the meeting range 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user opens the meeting range input of `<city>` and enters `<start>` and `<end>`
- **THEN** the meeting range is `<range>` in Almaty and the input is closed

| city | start | end | range |
|---|---|---|---|
| Almaty | 10 | 12:30 | 10:00–12:30 |
| Moscow | 8 | 10:30 | 10:00–12:30 |
| Kolkata | 9:30 | 11:30 | 09:00–11:00 |
| New York | 23 | 1 | 09:00–11:00 |

#### Scenario: A meeting at any minute
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York, Russian interface, 24-hour format and the meeting range 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user opens the meeting range input of `<city>` and enters `<start>` and `<end>`
- **THEN** the meeting range is `<range>` in Almaty, the title is `<title>` and the input is closed

| city | start | end | range | title |
|---|---|---|---|---|
| Almaty | 9:05 | 9:10 | 09:05–09:10 | «Встреча · 5 мин» |
| Almaty | 9 | 9:23 | 09:00–09:23 | «Встреча · 23 мин» |
| Moscow | 7:05 | 9:28 | 09:05–11:28 | «Встреча · 2 ч 23 мин» |
| Kolkata | 9:37 | 10 | 09:07–09:30 | «Встреча · 23 мин» |
| New York | 23:10 | 0:40 | 09:10–10:40 | «Встреча · 1 ч 30 мин» |

#### Scenario: Twelve-hour texts
- **GIVEN** the sample meeting, English interface and 12-hour format
- **WHEN** the user opens the meeting range input of Almaty and enters `10 am` and `12:30 pm`
- **THEN** the meeting range is 10:00–12:30 in Almaty

#### Scenario: Wrong input keeps the input open
- **GIVEN** the sample meeting in the Grid view, Russian interface
- **WHEN** the user opens the meeting range input of `<city>` and enters `<start>` and `<end>`
- **THEN** the input stays open with the error `<error>`
- **AND** the meeting range is still 09:00–11:00

| city | start | end | error |
|---|---|---|---|
| Almaty | abc | 11 | «Введите время в формате ЧЧ:ММ» |
| Almaty | 10 | 10 | «Начало и окончание встречи совпадают» |
| New York | 13 | 14 | «Начало встречи должно быть внутри дня» |

#### Scenario: Esc closes the input without a change
- **GIVEN** the sample meeting and Moscow's meeting range input open with `8` typed in the start field
- **WHEN** the user presses Esc
- **THEN** the input is closed, the meeting range is still 09:00–11:00 and the focus is on Moscow's span

#### Scenario: No accessibility violations with each range message
- **GIVEN** the sample meeting in the `<theme>` theme and Almaty's meeting range input open
- **WHEN** the user enters a pair refused with `<error>` and axe-core checks the page
- **THEN** it reports no violations
- **AND** both fields are `aria-invalid` and described by the message

| theme | error |
|---|---|
| light | MEETING_START_EQUALS_END |
| light | INVALID_MEETING_RANGE |
| dark | MEETING_START_EQUALS_END |
| dark | INVALID_MEETING_RANGE |

#### Scenario: A meeting past midnight is typed
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York, Russian interface, 24-hour format and the meeting range 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user opens the meeting range input of `<city>` and enters `<start>` and `<end>`
- **THEN** the meeting range is 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty, the title is «Встреча · 3 ч» and the input is closed
- **AND** the date bar still shows 8 March

| city | start | end |
|---|---|---|
| Almaty | 23 | 2 |
| Moscow | 21 | 0 |

### Requirement: Approved screenshots of the meeting state
Screenshots of the Grid view in the meeting state with the design's sample data (8 March 2026, home Almaty, Almaty, Moscow, Kolkata, New York, Russian interface, meeting 09:00–11:00 in Almaty) at 1440 × 900, 1180 × 820, 844 × 390 and 390 × 844, in the light and the dark theme, SHALL be re-taken once for the move handle and then match their approved baselines on every run. <!-- implements NFR-R2, UX1 of add-grid-meeting-range-and-share; NFR-R2 of redesign-cards-grid-and-day-palettes; UX1 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Approved screenshots of the meeting state
- **WHEN** the Grid view with the sample meeting is rendered at `<size>` in the `<theme>` theme
- **THEN** it matches the approved screenshot

| size | theme |
|---|---|
| 1440 × 900 | light |
| 1440 × 900 | dark |
| 1180 × 820 | light |
| 1180 × 820 | dark |
| 844 × 390 | light |
| 844 × 390 | dark |
| 390 × 844 | light |
| 390 × 844 | dark |

### Requirement: Meeting state is fast
After the rows of 50 locations in 10 zones were presented with a meeting range, a meeting handle move within the same reference day, interface language and hour format SHALL re-present every row's span and day shift without building a formatter and without a time zone transition lookup, and every hour strip MUST stay the same object while the strip tail keeps its cell count; when the strip tail grows or shrinks, only the added cells are presented ("Moves and the strip tail are fast"). Real timings are reported by a benchmark and never asserted by a test. <!-- implements NFR-P1 of add-grid-meeting-range-and-share; NFR-P1 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: A handle move re-presents the spans cheaply
- **GIVEN** the rows and hour strips of 50 locations in 10 zones were presented with the meeting range 09:00–11:00 on 2026-03-08
- **WHEN** the end handle moves one track step and the rows are presented again
- **THEN** no formatter is built and no time zone transition is looked up
- **AND** every row gets the same hour strip as before

### Requirement: Accessible meeting state
With a meeting range set, axe-core SHALL report no violations on the Grid view in the light and the dark theme, with and without a share notice, with a meeting range input open and with its error shown. The Tab order MUST be: «Поделиться встречей», «Сбросить выбор встречи», then for each row its span button and its hour strip, then the meeting handles «Начало встречи», «Конец встречи», «Сдвиг встречи»; no location menu button MUST be a Tab stop, and the grab area is never one. While a row's meeting range input is open, its fields «Время начала — {city}» and «Время окончания — {city}» MUST take the place of that row's span button in the Tab order, start before end, followed by that row's hour strip and so before the meeting handles. After Clear meeting the location menu buttons MUST be Tab stops again. The fields of the meeting range input MUST have accessible names, and a field with an error MUST be `aria-invalid` and described by its error. <!-- implements NFR-A1, NFR-A2 of add-grid-meeting-range-and-share; NFR-A1, NFR-A2 of fix-grid-meeting-range-lock-and-layering; FR15, NFR-A3 of redesign-cards-grid-and-day-palettes; NFR-A1 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: No accessibility violations in the meeting state
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York and the sample meeting in the `<theme>` theme
- **WHEN** axe-core checks the page, before and after the copied notice appears
- **THEN** it reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: No accessibility violations with the meeting range input
- **GIVEN** the sample meeting in the `<theme>` theme and Moscow's meeting range input open
- **WHEN** axe-core checks the page, before and after the text error appears
- **THEN** it reports no violations

| theme |
|---|
| light |
| dark |

#### Scenario: Tab order skips the locked controls
- **GIVEN** the Grid view with Almaty and Moscow and the sample meeting
- **WHEN** the user presses Tab from the page start through the panel
- **THEN** the focus visits «Поделиться встречей», «Сбросить выбор встречи», Almaty's span, Almaty's hour strip, Moscow's span, Moscow's hour strip, the meeting handles «Начало встречи», «Конец встречи» and «Сдвиг встречи» in this order
- **WHEN** the user clears the meeting range and presses Tab through the panel
- **THEN** each row's location menu button is a Tab stop again

#### Scenario: The open input's fields sit in place of the span in the Tab order
- **GIVEN** the Grid view with Almaty and Moscow, the sample meeting and Almaty's meeting range input open with the focus in «Время начала — Almaty»
- **WHEN** the user presses Tab three times without changing a text
- **THEN** the focus visits «Время окончания — Almaty», Almaty's hour strip and Moscow's span in this order
- **AND** Almaty's input is closed and the meeting range is still 09:00–11:00

#### Scenario: The keyboard alone sets the meeting
- **GIVEN** the Grid view with Almaty and Moscow, Russian interface, and the sample meeting
- **WHEN** the user tabs to Moscow's span, presses Enter, types `8`, presses Tab, types `10:30` and presses Enter
- **THEN** the title is «Встреча · 2 ч 30 мин» and the focus is on Moscow's span

#### Scenario: The open input fits on a phone
- **GIVEN** the sample meeting at `<width>` by `<height>` px
- **WHEN** the user opens Moscow's meeting range input
- **THEN** both fields are fully inside the viewport and the page does not scroll horizontally

| width | height |
|---|---|
| 320 | 640 |
| 390 | 844 |

## ADDED Requirements

### Requirement: Meeting bar stays at the top of the viewport
While a meeting range is set and the Grid view shows at least one row, the meeting bar SHALL stay at the top edge of the viewport when the page scrolls vertically, above the grid panel and every row, and below an open dialog and an open location menu. Its height and content do not change. With no meeting range the header behaves as before and scrolls away with the page. When the keyboard focus moves to a control that lies under the meeting bar, the page MUST scroll so that the control is fully visible below the bar. <!-- implements FR12, NFR-A3, NFR-R2 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: The meeting bar stays in a long list
- **GIVEN** the Grid view at `<width>` by `<height>` px with 12 locations and the meeting range 09:00–11:00 in Almaty
- **WHEN** the page is scrolled to its `<position>`
- **THEN** the meeting bar is fully visible at the top of the viewport with «Поделиться встречей» and «Сбросить выбор встречи»
- **AND** at least one grid row is fully visible between the meeting bar and the date bar

| width | height | position |
|---|---|---|
| 390 | 844 | middle |
| 390 | 844 | bottom |
| 844 | 390 | middle |
| 1440 | 900 | bottom |

#### Scenario: The normal header still scrolls away
- **GIVEN** the Grid view at 390 by 844 px with 12 locations and no meeting range
- **WHEN** the page is scrolled to its bottom
- **THEN** the header is not in the viewport

#### Scenario: Focus is not hidden under the bar
- **GIVEN** the Grid view at 390 by 844 px with 12 locations, the meeting range 09:00–11:00 in Almaty and the page scrolled to its bottom
- **WHEN** the user presses Shift+Tab until the focus is on the span of the third row
- **THEN** that span is fully visible below the meeting bar

### Requirement: Move handle on the frame
While a meeting range is set and the list has rows, the Grid view SHALL show a third meeting handle, the move handle, in the meeting colour: a grip like the start and end handles turned by a quarter turn, 36 px wide and 12 px high with a 4 px radius, with no icon. It MUST be centred horizontally on the meeting frame. Its vertical centre MUST be on the axis of the frame's top line, but never above the axis of the bottom line of the meeting bar: while the top of the frame is visible the handle stands on the frame's top line, and once the page has scrolled the top of the frame under the meeting bar the handle stands on the bar's bottom line. The handle MUST follow the frame when the strips scroll horizontally, in both positions. It MUST lie above everything in the panel and above the meeting bar's line, and below an open location menu and an open dialog. Its hit area MUST NOT cover a location menu button. <!-- implements FR17, UX1, UX2 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: The move handle of the sample meeting
- **GIVEN** the Grid view at 390 by 844 px with Almaty, Moscow, Kolkata and New York and the meeting range 09:00–11:00 in Almaty
- **WHEN** the main page is shown
- **THEN** the move handle is 36 px wide and 12 px high and its centre is the centre of the frame's top line
- **AND** it does not overlap the text of the first row header

#### Scenario: The move handle sticks to the meeting bar
- **GIVEN** the Grid view at 390 by 844 px with 12 locations and the meeting range 09:00–11:00 in Almaty
- **WHEN** the page is scrolled down by `<scroll>` px
- **THEN** the vertical centre of the move handle is `<where>`
- **AND** its horizontal centre is the horizontal centre of the meeting frame
- **AND** the topmost element at the centre of the move handle is the move handle

| scroll | where |
|---|---|
| 0 | on the axis of the frame's top line |
| 4 | on the axis of the frame's top line |
| 7 | on the axis of the meeting bar's bottom line |
| 400 | on the axis of the meeting bar's bottom line |

#### Scenario: The move handle follows the strips
- **GIVEN** the Grid view at 390 by 844 px with 12 locations, the meeting range 09:00–11:00 in Almaty and the page scrolled to the middle
- **WHEN** the user scrolls the strips by two cells
- **THEN** the horizontal centre of the move handle is again the horizontal centre of the meeting frame

### Requirement: Move handle is a slider
The move handle SHALL be a slider for assistive technology and the keyboard, named «Сдвиг встречи» ("Move meeting"). Its value MUST be the minutes from the start of the reference day to the start of the range, its minimum 0 and its maximum the last track step position of the reference day, and its value text the span of the range in the reference zone in the hour format setting. Each key MUST move the whole range as "Move the whole meeting range" of `meeting-range` says:
- Arrow Right / Arrow Up and Arrow Left / Arrow Down: to the next or previous track step position;
- Page Up / Page Down: by one hour;
- Home / End: to the earliest / latest position.

The move handle MUST be one Tab stop, after the end handle. It MUST have a visible focus ring in the accent colour and a hit area of at least 44 × 44 px centred on its grip. <!-- implements FR18, NFR-A1, NFR-A2 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Slider values of the move handle
- **GIVEN** the interface language is English, the hour format is 24-hour and the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the Grid view is shown
- **THEN** the slider "Move meeting" has the value 540, the minimum 0, the maximum 1425 and the value text `09:00–11:00`

#### Scenario: Keys on the move handle
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user focuses «Сдвиг встречи» and presses `<key>`
- **THEN** the meeting range is `<range>` and the title is still «Встреча · 2 ч»

| key | range |
|---|---|
| Arrow Right | 09:15–11:15 |
| Arrow Left | 08:45–10:45 |
| Page Up | 10:00–12:00 |
| Page Down | 08:00–10:00 |
| Home | 00:00–02:00 |
| End | 23:45–01:45 of the next day |

#### Scenario: Tab order of the three handles
- **GIVEN** the Grid view with the sample meeting
- **WHEN** the user presses Tab from the last row's last control three times
- **THEN** the focus visits «Начало встречи», «Конец встречи» and «Сдвиг встречи», in that order

#### Scenario: The hit area of the move handle
- **GIVEN** the Grid view at `<width>` by `<height>` px with the sample meeting
- **WHEN** the main page is shown
- **THEN** the box of the slider «Сдвиг встречи» is at least 44 px wide and 44 px high and centred on its grip
- **AND** it does not overlap the location menu button of any row

| width | height |
|---|---|
| 1440 | 900 |
| 390 | 844 |

#### Scenario: No accessibility violations with the move handle
- **GIVEN** the Grid view with 12 locations and the sample meeting in the `<theme>` theme, the page scrolled to its `<position>`
- **WHEN** axe-core checks the page
- **THEN** it reports no violations

| theme | position |
|---|---|
| light | top |
| light | middle |
| dark | top |
| dark | middle |

### Requirement: Move the meeting range by its frame
A press on the move handle SHALL move the whole meeting range at once, by mouse, pen and finger. A mouse or pen press on an hour cell inside the meeting frame, followed by a movement of at least 4 px, MUST move the whole range too, and the pointer over those cells MUST be a grab cursor. A finger held for 250 ms on an hour cell inside the frame, without moving more than 5 px, MUST start a move, whether the strips scroll or fit, and from then on the finger sets no range from the cells it touches. A finger that moves earlier does what it did before this change: where the strips scroll it scrolls the strips or the page, and where all cells fit it sets a range from the cells it touches ("Drag across hour cells sets a meeting range"). While the pointer moves, the start of the range goes to its position at the press plus the pointer's horizontal travel along the strips since the press (the strips' scroll included), rounded and limited as "Move the whole meeting range" of `meeting-range` says. A press and release without movement on a cell inside the frame stays a tap ("Tap or Enter sets a one-hour meeting range"); a press and release without movement on the move handle changes nothing. A press outside the frame behaves as before. A move MUST work by finger also on an engine without Pointer Events. During a finger hold inside the frame the browser MUST NOT start a text selection or open its callout. <!-- implements FR15, FR16, FR17 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Drag the frame with the mouse
- **GIVEN** the Grid view at 1440 by 900 px with Almaty, Moscow, Kolkata and New York and the meeting range 13:00–15:00 in Almaty on 2026-03-08
- **WHEN** the user presses the mouse on column 13 of Moscow, moves it one and a half cells to the right and releases it
- **THEN** the meeting range is 14:30–16:30 in Almaty and the title is «Встреча · 2 ч»

#### Scenario: Drag the move handle
- **GIVEN** the Grid view at `<width>` by `<height>` px with the meeting range 13:00–15:00 in Almaty
- **WHEN** the user drags the move handle one cell to the left with `<pointer>`
- **THEN** the meeting range is 12:00–14:00

| width | height | pointer |
|---|---|---|
| 1440 | 900 | the mouse |
| 390 | 844 | a finger |

#### Scenario: Hold and drag with a finger
- **GIVEN** the Grid view at 390 by 844 px with the meeting range 13:00–15:00 in Almaty
- **WHEN** the user holds a finger on column 13 of Almaty for 250 ms and then moves it one cell to the right
- **THEN** the meeting range is 14:00–16:00 and the strips did not scroll by the finger's travel

#### Scenario: Hold and drag with a finger on fitting strips
- **GIVEN** the Grid view at 1440 by 900 px on a touch screen with the meeting range 13:00–15:00 in Almaty
- **WHEN** the user holds a finger on column 13 of Almaty for 250 ms and then moves it two cells to the right
- **THEN** the meeting range is 15:00–17:00 and the title is «Встреча · 2 ч»

#### Scenario: A swipe inside the frame still scrolls
- **GIVEN** the Grid view at 390 by 844 px with the meeting range 13:00–15:00 in Almaty
- **WHEN** the user swipes to the left from column 13 of Almaty without holding
- **THEN** the strips scroll and the meeting range is still 13:00–15:00

#### Scenario: A click inside the frame is still a tap
- **GIVEN** the Grid view at 1440 by 900 px with the meeting range 13:00–15:00 in Almaty
- **WHEN** the user clicks column 14 of Almaty without moving the mouse
- **THEN** the meeting range is 14:00–15:00

#### Scenario: A press outside the frame sets a new range
- **GIVEN** the Grid view at 1440 by 900 px with the meeting range 13:00–15:00 in Almaty
- **WHEN** the user drags with the mouse from column 9 to column 10 of Almaty
- **THEN** the meeting range is 09:00–11:00

#### Scenario: Finger move without Pointer Events
- **GIVEN** an engine without Pointer Events and the meeting range 13:00–15:00
- **WHEN** the user drags the move handle with a finger by one cell to the right
- **THEN** the meeting range is 14:00–16:00
- **AND** the end of the finger drag produces no click

### Requirement: Moving the meeting range
While the whole range is being moved, the meeting frame SHALL look lifted: a shadow around it, and the move handle 44 px wide and 14 px high with the same shadow. The meeting frame, the dimming, the start and end handles, every row's span and day shift mark and the date bar MUST follow at each step; the duration in the meeting bar MUST NOT change. Near the left or right edge of the strips' visible part the strips MUST scroll as "Handle drag scrolls the strips" says, and a range moved towards midnight MUST run into the strip tail, which grows and shrinks as "Hour cells of the reference day" says. Releasing MUST NOT count as a tap or click on an hour cell, wherever the pointer or finger is released, and MUST return the frame and the move handle to their resting look. While the range is moved, no meeting handle changes its row. <!-- implements FR19, FR20, UX3 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Rows follow the move
- **GIVEN** the Grid view at 1440 by 900 px with Almaty, Moscow, Kolkata and New York and the meeting range 13:00–15:00 in Almaty on 2026-03-08
- **WHEN** the user holds the move handle one and a half cells to the right of its place
- **THEN** Almaty shows `14:30–16:30`, Moscow `12:30–14:30`, Kolkata `15:00–17:00` and New York `05:30–07:30`
- **AND** the title is «Встреча · 2 ч»
- **AND** the frame has its lifted look

#### Scenario: A move into the strip tail
- **GIVEN** the Grid view at 390 by 844 px with the meeting range 21:00–23:00 in Almaty on 2026-03-08
- **WHEN** the user drags the move handle to the right edge of the visible strips and holds it there
- **THEN** the strips scroll to the right and the strip tail appears
- **AND** when the drag ends the meeting range is 2 hours long, starts on 2026-03-08 and ends on 2026-03-09

#### Scenario: A release after a move is not a tap
- **GIVEN** the Grid view with the meeting range 13:00–15:00 in Almaty
- **WHEN** the user drags the frame one cell to the right and the browser then sends the click of that gesture to an hour cell of column 9
- **THEN** the meeting range is 14:00–16:00

### Requirement: Moves and the strip tail are fast
Re-placing the move handle on a page scroll SHALL measure the layout at most once per animation frame. One step of a move or of a handle drag MUST present the span of each row once and MUST build no new `Intl` formatter. Growing or shrinking the strip tail MUST present only the cells that are added, never the cells of the reference day again. <!-- implements NFR-P1 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Scrolling re-places the move handle cheaply
- **GIVEN** the Grid view with 12 locations and the meeting range 09:00–11:00 in Almaty
- **WHEN** three scroll events arrive before the next animation frame
- **THEN** the layout is measured once for the move handle

#### Scenario: A move step is bounded
- **GIVEN** the Grid view with 50 locations and the meeting range 09:00–11:00 in Almaty
- **WHEN** the meeting range makes the move "next step"
- **THEN** the span of each row is presented once and no `Intl` formatter is built

#### Scenario: A growing tail presents only its cells
- **GIVEN** the Grid view with 50 locations and the meeting range 21:00–23:00 in Almaty
- **WHEN** the end of the meeting range moves to 23:30
- **THEN** one new hour cell per row is presented and no cell of the reference day is presented again

### Requirement: Approved screenshots of the moved and extended meeting
The Grid view SHALL have approved screenshots, compared on every run, with the design's sample data and the Russian interface: the move handle with the list at the top, in the middle and at the bottom of a list of 12 locations at 390 × 844 in the light theme; the range being moved at 390 × 844 in the light theme; and the meeting range 23:00–02:00 in Almaty with its strip tail at 390 × 844 in the light theme and at 1280 × 800 in the dark theme. <!-- implements UX1, UX2, UX3, NFR-R1 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Approved screenshots of the move handle and the strip tail
- **WHEN** the Grid view is rendered in the state `<state>` at `<size>` in the `<theme>` theme
- **THEN** it matches the approved screenshot

| state | size | theme |
|---|---|---|
| sample meeting, 12 locations, list at the top | 390 × 844 | light |
| sample meeting, 12 locations, list in the middle | 390 × 844 | light |
| sample meeting, 12 locations, list at the bottom | 390 × 844 | light |
| the range being moved | 390 × 844 | light |
| meeting 23:00–02:00 with its strip tail | 390 × 844 | light |
| meeting 23:00–02:00 with its strip tail | 1280 × 800 | dark |
