# ADR-0011: Meeting range — a span of time chosen in the Grid view

## Status
Accepted (2026-11-09)

Refines [ADR-0003](0003-reference-instant-time-model.md): the reference moment stays the single source of time; a meeting range is a second, optional span that pins the reference moment to its start.

## Context

The two views answer different questions ([views](../architecture/views.md)):

- **Cards** — "what time is it there now, or at this moment?" The user drags a handle and reads one time per location.
- **Grid** — "when can we meet?" The user needs a start and an end, sees them in every location at once, and passes them on to the other people.

A single reference moment cannot hold a start and an end. Meeting planners (World Time Buddy, Every Time Zone, Google Calendar's time zone view) all show the chosen span as one block across every row.

## Decision

### The meeting range

- The model holds an optional **meeting range**: a start instant and an end instant, `start < end`. It is not persisted, like the reference moment: the app always opens without one.
- Both ends lie on the 15-minute track step of the reference day, inside the reference day. The shortest range is one step, the longest is the reference day.
- While a meeting range is set, the reference moment is pinned to its start. The date bar, the differences and the day shift therefore describe the start of the meeting.

### Commands

| Command | Effect |
|---|---|
| `SET_MEETING_RANGE(start, end)` | sets or replaces the range; pins the reference moment to `start`; an invalid range returns `INVALID_MEETING_RANGE` |
| `CLEAR_MEETING_RANGE()` | removes the range; the reference moment stays pinned at the former start |
| `RESET_TO_NOW()` | also removes the range |
| `SET_DATE`, `SHIFT_DATE` | move the range with the date: the start keeps its wall-clock time in the reference zone, the duration is kept and clamped to the new reference day |
| `SELECT_INSTANT`, `SET_WALL_TIME`, `SHIFT_TIME` | remove the range: the user picked one moment instead of a span |

### Interaction in the Grid view

- Tapping an hour cell sets a one-hour meeting starting at that cell.
- Dragging across hour cells sets a meeting from the first to the last cell touched.
- Two **meeting handles** on the sides of the meeting frame move the start and the end by the track step. They are sliders for assistive technology: arrows ±15 minutes, Page Up / Page Down ±1 hour, Home / End the ends of the reference day.
- The header becomes the **meeting bar**: the duration, **Share meeting** and **Clear meeting**.
- The meeting frame and the meeting bar are green; the hour frame of the reference moment is the accent blue. The two frames never show at once.

### What the views show

- Each row shows its local start and end (`23:00–01:00`) instead of one time, and the day shift of the start.
- Hour cells outside the range are dimmed.
- Cards ignore the range: they show the reference moment, which equals the start of the meeting.

## Consequences

Positive:
- Planning a meeting and reading its local times are one gesture.
- The reference moment keeps its meaning, so the date bar, differences and notes need no second mode.
- The range is view state of the model, so a future view can show it without new commands.

Negative:
- The model gains a second time value and invariants between the two.
- A meeting that crosses the end of the reference day cannot be made in one range; the user picks the next day instead.

## Alternatives Considered

**Two reference moments (start and end) in place of one**: every selector would have to choose one of them, and Cards would lose its single answer.

**Keep the range inside the Grid view as UI state**: Share, the date bar and a later view could not read it, and switching the view would lose it silently.

**A range across days**: needs a scrolling multi-day grid; the reference day is the unit of every view today.

## Related

- [ADR-0003](0003-reference-instant-time-model.md) — reference moment, absolute hour cells
- [ADR-0005](0005-view-registry.md) — swappable views
- [ADR-0007](0007-reference-zone-and-device-time.md) — reference zone
- [Views](../architecture/views.md) — Grid layout and meeting mode
- [Domain model](../architecture/domain-model.md)
