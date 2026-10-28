# Glossary: Date selection

Choosing the day the reference moment falls on, and returning to now. Decisions: ADR-0003 (wall-clock input and DST), `docs/architecture/open-questions.md` Q5 and Q7. See [README](README.md) for the entry format.

- **Date bar** — the bar at the bottom of the main page: previous day, the date that opens the calendar, next day, and the Now button. *Code:* `DateBar`, `presentDateBar`. *RU:* «Дата» (its accessible name). *Never:* date control, date picker, footer.
- **Date change** — moving the reference moment to another date while keeping the wall-clock time of the reference zone: by a day step or from the calendar. *Code:* `SET_DATE`, `SHIFT_DATE`. *Not:* a time selection.
- **Calendar** — the dialog that picks a distant date, month by month. *Code:* `CalendarDialog`, `presentCalendarMonth`. *RU:* «Выберите дату». *Never:* datepicker.
- **Now button** — the button that returns the reference moment to live. It is shown only while the moment is pinned. *Code:* `RESET_TO_NOW`. *RU:* «Сейчас». *Never:* Now control, Today button, reset.
- **Gap note** — the note in the date bar after a date change lands in a DST gap: which wall-clock time was asked for and which is shown. It disappears on the next date change, time selection or Now. *Code:* `DateBarGap`, `date.gapNote`. *Not:* the wall-time hint.
- **Wall-time hint** *(planned)* — the note in a card after a typed wall-clock time resolves to gap or ambiguous. *Code:* `SET_WALL_TIME`. *Not:* the gap note.
