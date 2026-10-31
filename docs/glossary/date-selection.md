# Glossary: Date selection

Choosing the day the reference moment falls on, and returning to now. Decisions: ADR-0003 (wall-clock input and DST), `docs/architecture/open-questions.md` Q5 and Q7. See [README](README.md) for the entry format.

- **Date bar** — the bar at the bottom of the main page: previous day, the date that opens the calendar, next day, and the Now button. *Code:* `DateBar`, `presentDateBar`. *RU:* «Дата» (its accessible name). *Never:* date control, date picker, footer.
- **Date change** — moving the reference moment to another date while keeping the wall-clock time of the reference zone: by a day step or from the calendar. *Code:* `SET_DATE`, `SHIFT_DATE`. *Not:* a time selection.
- **Calendar** — the dialog that picks a distant date, month by month. *Code:* `CalendarDialog`, `presentCalendarMonth`. *RU:* «Выберите дату». *Never:* datepicker.
- **Now button** — the button that returns the reference moment to live. It is always shown in the date bar: active while the moment is pinned, inactive while live (grey, skipped by Tab, activating it does nothing). *Code:* `DateBar` (the button), `RESET_TO_NOW` (the command). *RU:* «Сейчас». *Never:* Now control, Today button, reset.
- **Gap note** — the note in the date bar after a date change lands in a DST gap: which wall-clock time was asked for and which is shown. It disappears on the next date change, time selection, wall-time input, change of the reference zone or Now. *Code:* `DateBarGap`, `date.gapNote`, `getWallClockNote`. *Not:* the wall-time hint.
- **Wall-time hint** — the note in the row where a wall-time input was typed, when the typed time resolves to a DST gap or overlap. *RU:* «02:30 не существует в этот день — часы переведены вперёд. Показано 03:30» / «01:30 бывает дважды — показано первое (UTC−4)». *Code:* `getWallClockNote`, `presentWallTimeHint`, `WallTimeHint`. *Not:* the gap note.
- **Wall-clock note** — the one note about a wall-clock time on screen: the gap note in the date bar or the wall-time hint in a row, never both. *Code:* `getWallClockNote`, `WallClockNote`, `WallClockNotePlacement`.
