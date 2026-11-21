# Part 2. A meeting range past midnight of the reference zone

## Today

- The Grid view shows exactly one reference day: 24 hour cells from midnight of the reference zone (23 or 25 on a clock-change day).
- The meeting range must lie inside the reference day (ADR-0011): its end is no later than the next midnight of the reference zone.
- ADR-0011 rejected "a range across days" on purpose: it needs a multi-day grid.
- The limit holds for the reference zone only. In other rows the range already crosses midnight (`New York: 23:00–01:00`).
- `23:00–01:00` typed in the row of the reference zone is refused with "The meeting must lie within the day".

## Decision: a tail of next-day cells

The grid stays the reference day. When the meeting range runs past midnight, the hour strip of every row grows cells of the next day.

| What | Decision |
|---|---|
| Start of the range | Inside the reference day, as today |
| End of the range | May lie in the next day |
| Longest range | 24 hours from its start. Nothing longer for now |
| Cells in the tail | Up to the end of the range, plus one spare cell so the end handle can be dragged on. No range past midnight — no tail |
| Wide screen | Cells shrink while the strip width divided by the cell count is at least 32 px; below that the strips scroll, as on a phone today. Example: 1280 px, 27 cells — cell pitch 39.3 px instead of 44.2 px, no scrolling |
| Phone | The strips scroll already; the tail only makes them longer (cell pitch stays 41 px) |
| Start of the next day | The midnight cell with its date (`НОЯБ 21`), as non-reference rows already show it |

Rejected:

- A sliding 24-hour window from any hour: it breaks the reference day, which the cards, the day tracks and the date bar rest on.
- Typed input only, the frame clipped at the edge: the end of the range and its handle are out of sight.

## What changes

- **Typed input.** `23:00–01:00` in the row of the reference zone sets a range to 01:00 of the next day. "The meeting must lie within the day" and "The meeting must end after it starts" no longer apply to it; a range whose start and end are the same time is still refused.
- **End handle.** Drags past the right edge of the reference day; the tail grows with it. The End key goes to 24 hours from the start, not to the end of the day.
- **Drag across cells.** May run onto tail cells while the tail is shown.
- **Change of date.** The start keeps its wall-clock time in the reference zone and the length is kept. Clamping to the end of the day is no longer needed.
- **Clock change.** The tail may fall on a clock-change night. Cells are absolute hours and the length is counted between instants.
- **Date of the meeting.** Stays the date of the start in the reference zone: the date bar, the heading of the invitation and the day shift marks follow the start. Calendars do the same: an evening event that ends after midnight belongs to the day it starts.
- **Invitation text.** Unchanged: `Belgrade: 23:00–02:00` reads without doubt, and such lines exist today for non-reference zones.
- **Cards view.** Unchanged: it shows the reference moment, the start of the range.

## Tests

- A range past midnight of the reference zone set three ways: typed input, the end handle, a drag across cells.
- The tail on a clock-change night (days of 23 and 25 hours).
- A change of date with such a range.
- The 24-hour limit: typed input, the handle, the End key.
- The invitation text and the day shift marks for such a range.
- Cell width with a tail: shrinking to 32 px and the switch to scrolling.
- Screenshots: phone and wide screen, light and dark.

## Requirements to rewrite

- A new ADR refining ADR-0011: the invariant "inside the reference day" and the rejected alternative "a range across days".
- `meeting-range`: "Meeting range invariants", "Set and clear a meeting range" (the refusals), "Commands that remove or move the meeting range" (clamping on a change of date), "Meeting handle moves" (the limit of the end, the End key), "Set a meeting range from wall-clock times" (`MEETING_END_BEFORE_START`, `INVALID_MEETING_RANGE`).
- `grid-view`: "Hour cells of the reference day", "Hour strip width", "Drag across hour cells sets a meeting range", "Meeting range input" (the messages), "Approved screenshots of the meeting state".
- Glossary: "Reference day" (the hour strip may be longer than the day); a new term for the tail.

## Open questions

- The name of the tail in the glossary and the code.
- The exact number of spare cells (one for now).
