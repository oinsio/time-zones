## ADDED Requirements

### Requirement: Tap or Enter sets a one-hour meeting range
A tap or click on an hour cell SHALL set a one-hour meeting range starting at the cell's start; on the last cell of a reference day that is not a whole number of hours, it ends at the end of the day. Enter or Space on a focused hour strip MUST set the same range for the cell of the hour frame. A tap MUST work without Pointer Events (a plain click). A tap on a cell of the meeting range replaces the range by the one-hour range of that cell. <!-- implements FR5, NFR-A2 of add-grid-meeting-range-and-share -->

#### Scenario: Tap on column 9
- **GIVEN** the view mode is Grid, the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z`, live, and the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the user taps column 9 of Moscow
- **THEN** the meeting range is 09:00–10:00 in Almaty
- **AND** Almaty shows `09:00–10:00` and the title is «Встреча · 1 ч»

#### Scenario: Enter on an hour strip
- **GIVEN** the Grid view at `2026-03-08T07:30:00Z`, live, with Almaty and Moscow
- **WHEN** the user focuses Almaty's hour strip and presses Enter
- **THEN** the meeting range is 12:00–13:00 in Almaty

### Requirement: Drag across hour cells sets a meeting range
Dragging across hour cells with a mouse or a pen SHALL set a meeting range from the start of the first cell to the end of the last cell touched, in either direction, and MUST update it each time the pointer enters another cell. While all cells of the reference day fit without scrolling, a finger drag MUST do the same. Where the strips scroll horizontally, a finger swipe MUST scroll the strips and set no meeting range. <!-- implements FR6 of add-grid-meeting-range-and-share -->

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

### Requirement: Meeting frame and dimmed cells
While a meeting range is set, a meeting frame SHALL surround the range across all rows of the panel, from its start to its end, in the meeting colour of the active theme (`#00AA00` light, `#3DD13D` dark), and no hour frame MUST be shown. Hour cells that do not overlap the range MUST be dimmed to opacity 0.4; a cell that overlaps it even in part is not dimmed. The meeting frame MUST lie above the hour cells and behind the row header texts and row notes, which keep their background and stay fully visible, and MUST NOT take pointer events. With no rows, no frame is shown. <!-- implements FR7, UX1 of add-grid-meeting-range-and-share -->

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

### Requirement: Meeting span in grid rows
While a meeting range is set, every grid row SHALL show its local span of the range, `start–end`, in the hour format setting and in the meeting time colour (`#008800` light, `#5EDB5E` dark) in place of its time; its date MUST be the local date of the start. When that date differs from the reference zone's date of the start, the row MUST show the day shift mark «днём раньше» / «днём позже» ("a day earlier" / "a day later") before the date, bold, in the danger colour of the active theme. Without a meeting range Grid shows no day shift mark. The span stays the button that opens the wall-time input. <!-- implements FR8, UX1 of add-grid-meeting-range-and-share -->

#### Scenario: Spans of the sample meeting
- **GIVEN** the interface language is Russian, the hour format is 24-hour and the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the Grid view is shown
- **THEN** `<city>` shows `<span>` and `<mark>`

| city | span | mark |
|---|---|---|
| Almaty | 09:00–11:00 | no day shift mark |
| Moscow | 07:00–09:00 | no day shift mark |
| Kolkata | 09:30–11:30 | no day shift mark |
| New York | 23:00–01:00 | «днём раньше» before its date of 7 March |

#### Scenario: Clear returns the times
- **GIVEN** the sample meeting is set
- **WHEN** the user clears the meeting range
- **THEN** every row shows its single time again and no row shows a day shift mark

### Requirement: Meeting handles on the frame
While a meeting range is set and the list has rows, the Grid view SHALL show two meeting handles in the meeting colour: the start handle centred on the left edge of the meeting frame, the end handle centred on its right edge, each over the hour strip of a row. With two or more rows they MUST stand on different rows: with `n` rows the end handle on row `⌈n / 2⌉` and the start handle on the row after it (rows counted from 1); with one row both stand on it. The handles MUST lie above everything in the panel, the row header texts and row notes included, and below an open location menu. <!-- implements FR9, NFR-R1, UX1 of add-grid-meeting-range-and-share -->

#### Scenario: Handles of the sample meeting
- **GIVEN** the Grid view at 1440 by 900 px with Almaty, Moscow, Kolkata and New York and the meeting range 09:00–11:00
- **WHEN** the main page is shown
- **THEN** the end handle stands on Moscow's strip at the right edge of the frame and the start handle on Kolkata's strip at its left edge
- **AND** the topmost element at the centre of each handle is that handle

### Requirement: Drag a meeting handle
Dragging a meeting handle SHALL move its end of the range to the nearest track step under the pointer, limited as "Meeting handle moves" of `meeting-range` says. While it moves, the meeting frame, the dimming, every row's span and day shift mark and the duration in the meeting bar MUST follow at each step. A drag MUST work by mouse, pen and finger, and by finger also on an engine without Pointer Events. <!-- implements FR10, UX2 of add-grid-meeting-range-and-share -->

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

### Requirement: Handle drag scrolls the strips
When the strips scroll horizontally and a dragged meeting handle comes within 32 px of the left or right edge of the strips' visible part, the strips SHALL keep scrolling in that direction while the handle stays in that zone, until they reach their end or the drag ends; the handle's end of the range follows the scrolled position and stays the track step under the pointer, never jumping by more than one track step per pointer move or scroll frame. While a meeting range is set, the strips MUST NOT scroll on their own to follow the hour frame (the pinned start); once the range is cleared, they scroll the hour frame into view if it is hidden. <!-- implements FR10, FR11, NFR-R1, UX2 of add-grid-meeting-range-and-share -->

#### Scenario: Dragging the end handle to the right edge on a phone
- **GIVEN** the Grid view at 390 by 844 px with the meeting range 09:00–11:00 in Almaty and the strips scrolled so that the frame is visible
- **WHEN** the user drags the end handle to the right edge of the visible strips and holds it there
- **THEN** the strips scroll to the right
- **AND** the meeting range ends later than 11:00 when the drag ends
- **AND** the end handle stays within one track step of the finger

#### Scenario: Dragging the start handle to the left edge on a phone
- **GIVEN** the Grid view at 390 by 844 px with the meeting range 09:00–11:00 in Almaty and the strips scrolled so that the frame is visible
- **WHEN** the user drags the start handle to the left edge of the visible strips and holds it there
- **THEN** the strips scroll to the left
- **AND** the meeting range starts earlier than 09:00 when the drag ends
- **AND** the start changes by at most one track step per move and the start handle stays within one track step of the finger

#### Scenario: The hour frame comes back into view after Clear
- **GIVEN** the Grid view at 390 by 844 px with a meeting range whose start column is scrolled out of view
- **WHEN** the user chooses «Сбросить выбор встречи»
- **THEN** the hour frame is shown on the former start column, fully visible

### Requirement: Meeting handles are sliders
Each meeting handle SHALL be a slider for assistive technology and the keyboard, named «Начало встречи» / «Конец встречи» ("Meeting start" / "Meeting end"). Its value MUST be the minutes from the start of the reference day to its end of the range, its minimum and maximum the limits of "Meeting handle moves" of `meeting-range`, and its value text the local time of that end in the reference zone in the hour format setting. Arrow Right / Arrow Up and Arrow Left / Arrow Down MUST move it by one track step, Page Up / Page Down by one hour, Home / End to the start / end of the reference day, each limited by those rules. Each handle MUST be one Tab stop, the start handle before the end handle, both after the last row's controls, with a visible focus ring in the accent colour and a hit area of at least 24 × 44 px. <!-- implements FR12, NFR-A1, NFR-A2 of add-grid-meeting-range-and-share -->

#### Scenario: Slider values of the handles
- **GIVEN** the interface language is English, the hour format is 24-hour and the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the Grid view is shown
- **THEN** the slider "Meeting start" has the value 540, the minimum 0, the maximum 645 and the value text `09:00`
- **AND** the slider "Meeting end" has the value 660, the minimum 555, the maximum 1440 and the value text `11:00`

#### Scenario: Keys on the handles
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user focuses «Начало встречи» and presses Arrow Right
- **THEN** the meeting range is 09:15–11:00 and the title is «Встреча · 1 ч 45 мин»
- **WHEN** the user focuses «Конец встречи» and presses Page Up
- **THEN** the meeting range is 09:15–12:00

### Requirement: Meeting bar
While a meeting range is set and the Grid view shows at least one row, the page header SHALL be the meeting bar: the meeting bar background (`#E0F5E0` light, `#13301D` dark) with a bottom border in the meeting colour, the title «Встреча · {duration}» ("Meeting · {duration}") centred, and at its right «Поделиться встречей» ("Share meeting", Lucide `Share2`) then «Сбросить выбор встречи» ("Clear meeting", Lucide `X`), icon buttons in the meeting colour of at least 44 × 44 px. The duration MUST read `2 ч`, `1 ч 45 мин`, `45 мин` ("2 h", "1 h 45 min", "45 min"). Clear meeting MUST clear the range, bring back the hour frame and the normal header and move the focus to the Add location button. Now MUST clear it too. <!-- implements FR13, NFR-A1, NFR-A2, NFR-R1, UX1 of add-grid-meeting-range-and-share -->

#### Scenario: Durations in the title
- **GIVEN** the interface language is `<language>`
- **WHEN** the meeting range lasts `<minutes>` minutes
- **THEN** the title is `<title>`

| language | minutes | title |
|---|---|---|
| Russian | 120 | Встреча · 2 ч |
| Russian | 105 | Встреча · 1 ч 45 мин |
| Russian | 45 | Встреча · 45 мин |
| English | 120 | Meeting · 2 h |
| English | 105 | Meeting · 1 h 45 min |

#### Scenario: Clear meeting
- **GIVEN** the Grid view with the sample meeting
- **WHEN** the user chooses «Сбросить выбор встречи»
- **THEN** no meeting range is set, the hour frame is on column 9 and the header shows «Часовые пояса» with Add location and Settings
- **AND** the Add location button has the focus

#### Scenario: Meeting bar on a narrow phone
- **GIVEN** the Grid view at 320 px wide with the sample meeting
- **WHEN** the main page is shown
- **THEN** the title and both buttons of the meeting bar are on one line and the page does not scroll horizontally

### Requirement: Share meeting from the meeting bar
«Поделиться встречей» SHALL share the meeting share text as `meeting-range` → "Share meeting text" and "Share meeting outcome" say. The outcome "copied" MUST show the copied notice «Текст встречи скопирован» ("Meeting text copied") and the outcome "failed" the share failed notice «Не удалось поделиться встречей» ("Could not share the meeting") in the notices region, announced politely and never taking the focus; the outcomes "shared" and "cancelled" show nothing. A notice MUST disappear on its Dismiss button, on Esc, on the next share, on a change of the meeting range and when the range is cleared. <!-- implements FR15, NFR-A2 of add-grid-meeting-range-and-share -->

#### Scenario: Share where the browser can share
- **GIVEN** a browser with a system share and the Grid view with the sample meeting
- **WHEN** the user chooses «Поделиться встречей»
- **THEN** the system share receives the meeting share text and no notice is shown

#### Scenario: Closing the share sheet
- **GIVEN** a browser whose system share reports that the user closed the sheet
- **WHEN** the user chooses «Поделиться встречей»
- **THEN** nothing changes and no notice is shown

#### Scenario: Copy where the browser cannot share
- **GIVEN** a browser without a system share and the Grid view with the sample meeting
- **WHEN** the user chooses «Поделиться встречей»
- **THEN** the clipboard holds the meeting share text
- **AND** the notice «Текст встречи скопирован» is shown and the focus stays on «Поделиться встречей»

#### Scenario: Neither share nor clipboard
- **GIVEN** a browser without a system share and without clipboard access
- **WHEN** the user chooses «Поделиться встречей»
- **THEN** the notice «Не удалось поделиться встречей» is shown

### Requirement: Meeting scenarios of the view contract
The Grid view SHALL pass the meeting scenarios of the view contract in a real browser: set a meeting range (tap, drag, Enter), resize it (handle drag and handle keys), share it and clear it (Clear meeting and Now). A view that does not show the meeting range (Cards, NG4) is not held to these scenarios. <!-- implements FR17 of add-grid-meeting-range-and-share -->

#### Scenario: Set, resize, share and clear
- **GIVEN** the Grid view with Almaty and Moscow at `2026-03-08T07:30:00Z` in a browser without a system share
- **WHEN** the user taps column 9 of Almaty, presses Page Up on «Конец встречи», shares the meeting and clears it
- **THEN** the meeting was 09:00–10:00, then 09:00–11:00, the clipboard held its text, and after Clear the hour frame is back

### Requirement: Accessible meeting state
With a meeting range set, axe-core SHALL report no violations on the Grid view in the light and the dark theme, with and without a share notice. The Tab order MUST be: «Поделиться встречей», «Сбросить выбор встречи», the rows' controls, «Начало встречи», «Конец встречи». <!-- implements NFR-A1, NFR-A2 of add-grid-meeting-range-and-share -->

#### Scenario: No accessibility violations in the meeting state
- **GIVEN** the Grid view with Almaty, Moscow, Kolkata and New York and the sample meeting in the `<theme>` theme
- **WHEN** axe-core checks the page, before and after the copied notice appears
- **THEN** it reports no violations

| theme |
|---|
| light |
| dark |

### Requirement: Meeting state is fast
After the rows of 50 locations in 10 zones were presented with a meeting range, a meeting handle move within the same reference day, interface language and hour format SHALL re-present every row's span and day shift without building a formatter and without a time zone transition lookup, and every hour strip MUST stay the same object. Real timings are reported by a benchmark and never asserted by a test. <!-- implements NFR-P1 of add-grid-meeting-range-and-share -->

#### Scenario: A handle move re-presents the spans cheaply
- **GIVEN** the rows and hour strips of 50 locations in 10 zones were presented with the meeting range 09:00–11:00 on 2026-03-08
- **WHEN** the end handle moves one track step and the rows are presented again
- **THEN** no formatter is built and no time zone transition is looked up
- **AND** every row gets the same hour strip as before

### Requirement: Approved screenshots of the meeting state
Screenshots of the Grid view in the meeting state with the design's sample data (8 March 2026, home Almaty, Almaty, Moscow, Kolkata, New York, Russian interface, meeting 09:00–11:00 in Almaty) at 1440 × 900, 1180 × 820, 844 × 390 and 390 × 844, in the light and the dark theme, SHALL match their approved baselines on every run. <!-- implements NFR-R2, UX1 of add-grid-meeting-range-and-share -->

#### Scenario: Approved screenshots of the meeting state
- **GIVEN** the sample data with the meeting range 09:00–11:00 in Almaty in the `<theme>` theme
- **WHEN** the main page is `<width>` by `<height>` px
- **THEN** the page matches the approved screenshot

| width | height | theme |
|---|---|---|
| 1440 | 900 | light |
| 1440 | 900 | dark |
| 1180 | 820 | light |
| 1180 | 820 | dark |
| 844 | 390 | light |
| 844 | 390 | dark |
| 390 | 844 | light |
| 390 | 844 | dark |

## MODIFIED Requirements

### Requirement: Hour frame
An hour frame in the accent colour of the active theme SHALL surround, across all rows of the panel, the column of the hour cell that contains the effective instant; the texts of the framed cells MUST be bold. While the reference moment is live, the frame MUST move to the next column when the clock reaches the next cell. While it is pinned, the frame MUST stay on the pinned instant's column. Now MUST return it to the column of the current time. With no rows, no frame is shown. While a meeting range is set, no hour frame MUST be shown (the meeting frame takes its place); clearing the range MUST bring it back on the column of the effective instant. <!-- implements FR8, FR9, UX2 of add-grid-hour-cells-and-hour-frame; FR7, FR13 of add-grid-meeting-range-and-share -->

#### Scenario: Frame on the current hour
- **GIVEN** the view mode is Grid, the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z` and the stored locations are Almaty and Moscow
- **WHEN** the main page is shown
- **THEN** the hour frame is on column 12
- **AND** the texts of column 12 are bold in both rows and the texts of column 11 are not

#### Scenario: Live frame follows the clock
- **GIVEN** the Grid view shows the frame on column 12 at `2026-03-08T07:30:00Z`, live
- **WHEN** the clock reaches `2026-03-08T08:00:00Z`
- **THEN** the hour frame is on column 13

#### Scenario: Pinned frame stays
- **GIVEN** the Grid view at `2026-03-08T07:30:00Z`, live
- **WHEN** the user `<pins>`
- **AND** the clock reaches `2026-03-08T08:00:00Z`
- **THEN** the hour frame is on column `<column>`

| pins | column |
|---|---|
| types `12:15` into the time of Almaty | 12 |
| selects the next day in the date bar | 12 |

#### Scenario: Now returns the frame
- **GIVEN** the Grid view pinned at `2026-03-08T02:00:00Z` and the current time `2026-03-08T07:30:00Z`
- **WHEN** the user returns to now
- **THEN** the hour frame is on column 12

#### Scenario: Frame crosses every row in the accent colour
- **GIVEN** the view mode is Grid, the stored locations are Almaty, Moscow, Kolkata and New York and the `<theme>` theme is active
- **WHEN** the main page is shown at `2026-03-08T07:30:00Z`
- **THEN** one hour frame in the `<theme>` accent colour reaches from the first row to the last
- **AND** its left and right edges enclose column 12 of every row

| theme |
|---|
| light |
| dark |

#### Scenario: No hour frame during a meeting
- **GIVEN** the Grid view at `2026-03-08T07:30:00Z` with the meeting range 09:00–11:00 in Almaty
- **WHEN** the main page is shown
- **THEN** no hour frame is shown
- **WHEN** the user clears the meeting range
- **THEN** the hour frame is on column 9

## REMOVED Requirements

### Requirement: Hour cells take no pointer selection yet
**Reason**: A tap on an hour cell now sets a one-hour meeting range and a drag sets a longer one (ADR-0011; FR5, FR6 of add-grid-meeting-range-and-share).
**Migration**: Replaced by "Tap or Enter sets a one-hour meeting range" and "Drag across hour cells sets a meeting range"; the keyboard time selection of "Time selection on the hour strip" is unchanged.
