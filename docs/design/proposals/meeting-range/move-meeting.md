# Part 3. Moving the whole meeting range

## Why

A call with a shared screen: the length of the meeting is set (say, 2 hours), and a time that suits both sides has to be found. Today that means dragging two handles in turn or typing the times. The frame should move as a whole, with every row showing its time at once — showing is easier than saying when the two sides share no fluent language.

## Today

- The range changes by its start and end handles and by typed input.
- A mouse drag across hour cells always sets a new range, even when it starts inside the frame.
- On a phone a swipe over the strips scrolls the grid.
- The meeting frame takes no pointer events.
- The meeting bar stands in place of the header and scrolls away with the list; only the date bar sticks to an edge of the screen.

## Decision

Three ways, one result:

| Way | How |
|---|---|
| Finger | Hold inside the frame for 250 ms, then drag. The frame lifts with a shadow. The same gesture that reorders cards. A tap and a swipe work as today |
| Mouse and pen | Press inside the frame and drag at once; a grab cursor. A press outside the frame and a drag set a new range, as today. A click with no movement works as today |
| Move handle | A third handle on the top line of the frame. Drags at once, with no hold, by mouse, pen and finger |

The move handle:

- Looks like the start and end handles turned sideways, with no icon.
- Stands in the middle of the top line of the frame; the line runs through it, as the side lines run through the start and end handles.
- Grows a little and gets a shadow, together with the frame, while the range is moved.
- Shows that the frame can be moved, gives a finger a way to drag with no hold, and holds the keyboard and screen-reader focus.
- Is a slider named "Move the meeting": arrows move by 15 minutes, Page Up / Page Down by an hour, Home / End to the earliest and the latest position.
- The meeting bar gets no "‹ ›" buttons for now.

The keyboard path also meets WCAG 2.5.7 (an alternative to dragging).

Why: dragging the body of a range is a settled pattern (calendar events, two-handle sliders); on touch screens calendars start it after a hold, so that it does not fight scrolling. A separate move handle is rarer, but we need it as a hint and as a place for the focus. Rejected: a tab with six dots sticking out above the frame — it looked detached from the frame.

## Long list: the meeting bar sticks to the top

While a meeting range is set, the meeting bar (title, Share, Clear) stays at the top edge of the screen when the list scrolls.

- The top of the frame is visible: the move handle stands on the top line of the frame.
- The top of the frame is under the bar: the handle stands on the bottom line of the bar, on the vertical of the frame. The side lines of the frame run up to it.
- One rule for both: the centre of the handle is on the axis of the frame's top line, but never above the axis of the bar's bottom line.
- The change is smooth: the handle travels with the frame, reaches the bar's line and stays on it.
- When the strips scroll horizontally the handle follows the frame, stuck or not.
- The start and end handles keep their rule, but a visible row is now one below the meeting bar and above the date bar.
- With no meeting range the header behaves as today.

Rejected: moving the handle to the bottom line of the frame (in the middle of a long list no line is visible, so there is no handle at all); a sticky top line of the frame drawn over the rows (the handle covers the texts of the row under it).

Known cost: the bar takes 85 px of height; a stuck handle covers 6 px of whatever is scrolling under the bar at that moment.

## Sizes (measured in the running app, 390 × 844 px)

New elements are tied to existing ones so that the build does not drift from the screens.

| What | Value | Source |
|---|---|---|
| Meeting bar | 85 px high, bottom line 1 px in the meeting colour | exists |
| Grid panel | starts right under the meeting bar, 1 px border | exists |
| Meeting frame | 4 px from the inner edge of the panel, line 3 px, radius 6 px | exists |
| Start and end handles | visible part 12 × 36 px, radius 4 px, hit area 44 × 48 px | exists |
| Move handle | visible part 36 × 12 px, radius 4 px, meeting colour; hit area 48 × 44 px | new: a start handle turned by 90° |
| Move handle while moving | 44 × 14 px, shadow | new |
| Axis of the frame's top line | 6.5 px below the meeting bar (list at the top) | follows from the above |
| Axis of the bar's bottom line | 0.5 px above its lower edge | follows from the above |
| Travel before sticking | 7 px of scrolling | the difference of the two axes |
| Gap to the texts of the first row | the handle ends 0.5 px above the row header (row padding 12 px) | follows from the above |

Notes for the build:

- The grid panel clips what leaves it (it scrolls horizontally). A stuck handle is drawn over the meeting bar, so it cannot be an element inside the panel.
- With the list at the top, the upper 0.5 px of the handle falls on the border of the panel; no visible difference.
- The hit area of the move handle must not cover the location menu button when the frame is at the right edge.

## Rules of a move

- The length never changes.
- The step is 15 minutes. The start lands on a step even if the range was typed off the step (09:05–09:28).
- The start stays inside the reference day; the end may run into the tail of the next day ([part 2](meeting-past-midnight.md)).
- The frame does not go before 00:00 of the reference zone. To reach yesterday, change the date.
- Near the edge of the visible part the strips scroll by themselves, as for the other handles.
- While the frame moves, every step updates the span of each row, the day shift marks, the dimmed cells and the date bar.
- A release after a move is not a tap on an hour cell.

## To check in the build

- A hold inside the frame on iOS: no text selection and no system callout, as in the grab area of the cards.
- The sticky bar on a phone in landscape: is the height enough for the rows.
- The sticky bar and the top safe area.

## Tests

- A move by each of the three ways, including a finger on an engine with no Pointer Events.
- A move of a range typed off the step.
- The stops at the start of the reference day and at the limit of the end.
- A move past midnight: the frame runs into the tail.
- A swipe inside the frame with no hold scrolls the strips and moves nothing.
- Keys on the move handle; the value and the value text of the slider.
- Scrolling of the strips near the edge during a move.
- Long list: the position of the move handle with the list at the top, after 7 px of scrolling, in the middle and at the bottom; a move by the stuck handle.
- The start and end handles never stand on a row covered by the meeting bar.
- Screenshots: the list at the top, in the middle and at the bottom.

## Requirements to rewrite

- `meeting-range`: a new command that moves the range.
- `grid-view`: "Drag across hour cells sets a meeting range" (a press inside the frame), "Meeting frame and dimmed cells" (the frame takes pointer events), "Meeting handles on the frame" (the move handle; candidate rows below the meeting bar), "Meeting handles are sliders", "Handle drag scrolls the strips", "Approved screenshots of the meeting state".
- `main-page`: the meeting bar sticks to the top while a meeting range is set.
- Glossary: a new term for the move and its handle.

## Open questions

- Names of the new terms in the glossary and the code.
- Whether the ghost of the previous position is shown during a move (the screen has it).
