## MODIFIED Requirements

### Requirement: Tap or Enter sets a one-hour meeting range
A tap or click on an hour cell SHALL set a one-hour meeting range starting at the cell's start. On the last cell of a reference day that is not a whole number of hours, the range ends at the end of the day. Enter or Space on a focused hour strip MUST set the same range for the cell of the hour frame. A tap MUST work without Pointer Events (a plain click). A tap on a cell of the meeting range replaces the range with the one-hour range of that cell. A click that ends a press on a meeting handle is not a tap, wherever the pointer is released ("Drag a meeting handle"). <!-- implements FR5, NFR-A2 of add-grid-meeting-range-and-share; FR8 of refine-meeting-range-entry-and-handles -->

#### Scenario: Tap on column 9
- **GIVEN** the view mode is Grid, the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z`, live, and the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the user taps column 9 of Moscow
- **THEN** the meeting range is 09:00–10:00 in Almaty
- **AND** Almaty shows `09:00–10:00` and the title is «Встреча · 1 ч»

#### Scenario: Enter on an hour strip
- **GIVEN** the Grid view at `2026-03-08T07:30:00Z`, live, with Almaty and Moscow
- **WHEN** the user focuses Almaty's hour strip and presses Enter
- **THEN** the meeting range is 12:00–13:00 in Almaty

### Requirement: Meeting handles on the frame
While a meeting range is set and the list has rows, the Grid view SHALL show two meeting handles in the meeting colour: the start handle centred on the left edge of the meeting frame, the end handle centred on its right edge, each over the hour strip of a row.

The handles MUST stand on the rows the user can see. The candidate rows are those on which a meeting handle, centred on the row's hour strip, lies fully inside the viewport and above the date bar; the handle is taller than a strip, so the handle's box decides, not the strip's. When no row is a candidate, every row of the list is a candidate. With `k` candidate rows, counted from 1 in list order, the end handle stands on candidate row `⌈k / 2⌉` and the start handle on the candidate row after it. With one candidate row, both handles stand on it.

When the page scrolls or resizes, the handles MUST move to the rows of the new candidates. Re-placing the handles MUST measure the strips at most once per animation frame and MUST re-render a handle only when its row changes. While a meeting handle is being dragged, neither handle changes its row.

The handles MUST lie above everything in the panel, the row header texts and row notes included, and below an open location menu. <!-- implements FR9, NFR-R1, UX1 of add-grid-meeting-range-and-share; FR7, NFR-P1, NFR-R1 of refine-meeting-range-entry-and-handles -->

#### Scenario: Handles of the sample meeting
- **GIVEN** the Grid view at 1440 by 900 px with Almaty, Moscow, Kolkata and New York and the meeting range 09:00–11:00
- **WHEN** the main page is shown
- **THEN** the end handle stands on Moscow's strip at the right edge of the frame and the start handle on Kolkata's strip at its left edge
- **AND** the topmost element at the centre of each handle is that handle

#### Scenario: Handles stay on screen in a long list
- **GIVEN** the Grid view at `<width>` by `<height>` px with 12 locations and the meeting range 09:00–11:00 in Almaty
- **WHEN** the page is scrolled to its `<position>`
- **THEN** both meeting handles lie fully inside the viewport and above the date bar
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
- **GIVEN** the candidate rows, on which a centred meeting handle lies fully inside the viewport above the date bar, are rows `<first>` to `<last>` of the list
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

### Requirement: Drag a meeting handle
A press anywhere within a meeting handle's hit area SHALL drag that handle and MUST NOT select hour cells. While the pointer moves, the handle's end goes to the position of the handle at the press, plus the pointer's horizontal travel along the strips since the press (the strips' scroll included), rounded to the nearest track step and limited as "Meeting handle moves" of `meeting-range` says. A press and release without movement changes nothing. While the end moves, the meeting frame, the dimming, every row's span and day shift mark and the duration in the meeting bar MUST follow at each step. Releasing the handle MUST NOT count as a tap or click on an hour cell, wherever the pointer or finger is released: on any row's hour cell, on a row header or outside the panel. A drag MUST work by mouse, pen and finger, and by finger also on an engine without Pointer Events; there the end of a finger drag MUST NOT produce a click. <!-- implements FR10, UX2 of add-grid-meeting-range-and-share; FR8 of refine-meeting-range-entry-and-handles -->

#### Scenario: Drag the end handle one hour right
- **GIVEN** the Grid view at 1440 by 900 px and the meeting range 09:00–10:00 in Almaty on 2026-03-08
- **WHEN** the user drags the end handle to the left edge of column 11
- **THEN** the meeting range is 09:00–11:00, the title is «Встреча · 2 ч» and New York shows `23:00–01:00`

#### Scenario: Drag the start handle past the end
- **GIVEN** the Grid view at 1440 by 900 px and the meeting range 09:00–11:00
- **WHEN** the user drags the start handle to the right edge of column 12
- **THEN** the meeting range is 10:45–11:00

#### Scenario: Finger drag without Pointer Events
- **GIVEN** an engine without Pointer Events and the meeting range 09:00–10:00
- **WHEN** the user drags the end handle with a finger by one cell to the right
- **THEN** the meeting range is 09:00–11:00
- **AND** the end of the finger drag produces no click

#### Scenario: A press beside the grip drags the handle
- **GIVEN** the Grid view at 1440 by 900 px with Almaty, Moscow, Kolkata and New York and the meeting range 09:00–11:00 in Almaty
- **WHEN** the user presses the mouse 16 px right of the end handle's centre, moves it one cell to the right and releases it over an hour cell of another row
- **THEN** the meeting range is 09:00–12:00

#### Scenario: Press and release without movement
- **GIVEN** the Grid view at 1440 by 900 px with the meeting range 09:00–11:00 in Almaty
- **WHEN** the user presses the end handle 10 px right of its centre and releases it without moving
- **THEN** the meeting range is still 09:00–11:00

#### Scenario: A click after a handle drag is not a tap
- **GIVEN** the Grid view with the meeting range 09:00–11:00 in Almaty
- **WHEN** the user drags the end handle one cell to the right and the browser then sends the click of that gesture to an hour cell of column 14
- **THEN** the meeting range is 09:00–12:00

### Requirement: Handle drag scrolls the strips
When the strips scroll horizontally and a dragged meeting handle comes within 32 px of the left or right edge of the strips' visible part, the strips SHALL keep scrolling in that direction while the handle stays in that zone, until they reach their end or the drag ends. The handle's end of the range follows the scrolled position by the rule of "Drag a meeting handle": the position of the handle at the press, plus the pointer's horizontal travel along the strips since the press (the strips' scroll included), rounded to the nearest track step. The handle therefore keeps the horizontal distance from the pointer it had at the press, within one track step, and its end never jumps by more than one track step per pointer move or scroll frame. While a meeting range is set, the strips MUST NOT scroll on their own to follow the hour frame (the pinned start); once the range is cleared, they scroll the hour frame into view if it is hidden. <!-- implements FR10, FR11, NFR-R1, UX2 of add-grid-meeting-range-and-share; FR8 of refine-meeting-range-entry-and-handles -->

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

### Requirement: Meeting handles are sliders
Each meeting handle SHALL be a slider for assistive technology and the keyboard, named «Начало встречи» / «Конец встречи» ("Meeting start" / "Meeting end"). Its value MUST be the minutes from the start of the reference day to its end of the range, which may be off the track step. Its minimum and maximum MUST be the limits of "Meeting handle moves" of `meeting-range`, and its value text the local time of that end in the reference zone in the hour format setting. Each key MUST move the handle as those rules say, each limited by them:
- Arrow Right / Arrow Up and Arrow Left / Arrow Down: to the next or previous track step position;
- Page Up / Page Down: by one hour;
- Home / End: to the start / end of the reference day.

Each handle MUST be one Tab stop, the start handle before the end handle, both after the last row's controls. Each MUST have a visible focus ring in the accent colour and a hit area of at least 44 × 44 px centred on the frame's edge. Its visible grip MUST keep its size. <!-- implements FR12, NFR-A1, NFR-A2 of add-grid-meeting-range-and-share; FR4, NFR-A2, UX2 of refine-meeting-range-entry-and-handles -->

#### Scenario: Slider values of the handles
- **GIVEN** the interface language is English, the hour format is 24-hour and the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the Grid view is shown
- **THEN** the slider "Meeting start" has the value 540, the minimum 0, the maximum 645 and the value text `09:00`
- **AND** the slider "Meeting end" has the value 660, the minimum 555, the maximum 1440 and the value text `11:00`

#### Scenario: Slider values off the track step
- **GIVEN** the interface language is English, the hour format is 24-hour and the meeting range is 09:05–09:28 in Almaty on 2026-03-08
- **WHEN** the Grid view is shown
- **THEN** the slider "Meeting start" has the value 545, the minimum 0, the maximum 553 and the value text `09:05`
- **AND** the slider "Meeting end" has the value 568, the minimum 560, the maximum 1440 and the value text `09:28`

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

### Requirement: Meeting range input
While a meeting range is set, the span of every grid row SHALL be a button named «Ввести время встречи — {city}, {span}» ("Enter meeting time — {city}, {span}"). The button MUST open the meeting range input in place of the span, with:
- the start time field «Время начала — {city}» ("Start time — {city}") and the end time field «Время окончания — {city}» ("End time — {city}");
- a dash `–` between them;
- both fields filled with the row's local start and end in the hour format setting.

The start field MUST take the focus with its text selected. Each field MUST accept the texts the wall-time input accepts, at any minute, and MUST insert the time separator while digits are typed ("Time separator while typing" of `time-selection`).

Enter in either field, or the focus leaving both fields after a text changed, MUST confirm. The row's location, the local date the row showed when the input opened and the two times then set the meeting range as "Set a meeting range from wall-clock times" of `meeting-range` says.

A field whose text is not a time MUST show «Введите время в формате ЧЧ:ММ» ("Enter the time as HH:MM") and keep the input open. A pair that is refused MUST mark both fields invalid, keep the input open and change nothing, showing:
- for `MEETING_START_EQUALS_END`: «Начало и окончание встречи совпадают» ("The meeting start and end are the same");
- for `MEETING_END_BEFORE_START`: «Окончание встречи должно быть позже начала» ("The meeting must end after it starts");
- for `INVALID_MEETING_RANGE`: «Встреча должна быть внутри дня» ("The meeting must lie within the day").

No message mentions a step. A pair that sets the range MUST close the input and return the focus to the row's span. Esc, or the focus leaving both fields with their texts unchanged, MUST close the input without a change. Moving the focus from one field to the other MUST NOT confirm. <!-- implements FR3, FR4, UX2 of fix-grid-meeting-range-lock-and-layering; FR2, FR3, NFR-A1, UX3 of refine-meeting-range-entry-and-handles -->

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
| Almaty | 12 | 10 | «Окончание встречи должно быть позже начала» |
| Almaty | 22 | 2 | «Окончание встречи должно быть позже начала» |
| New York | 13 | 14 | «Встреча должна быть внутри дня» |

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
| light | MEETING_END_BEFORE_START |
| light | INVALID_MEETING_RANGE |
| dark | MEETING_START_EQUALS_END |
| dark | MEETING_END_BEFORE_START |
| dark | INVALID_MEETING_RANGE |
