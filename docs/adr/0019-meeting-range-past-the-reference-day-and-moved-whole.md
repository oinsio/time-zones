# ADR-0019: Meeting range past the reference day, the strip tail and the move of the whole range

## Status
Accepted (2026-11-21)

Refines [ADR-0011](0011-meeting-range-in-grid-view.md): the end of a meeting range may lie in the next reference day, at most 24 hours after the start; the range can be moved as a whole.

## Context

ADR-0011 keeps a meeting range inside the reference day and rejects "a range across days: needs a scrolling multi-day grid; the reference day is the unit of every view today". An evening meeting that ends after midnight of the reference zone (23:00–02:00) therefore could not be planned in one range; the user had to pick a shorter range or another date. A typed `12:00`–`10:00` was an error for the same reason.

The reference day stays the unit of the date bar, the day tracks, the cards and the hour cells. What blocks the evening meeting is the end of the range, not the start.

## Decision

- **The start lies inside the reference day, the end at most 24 hours after the start.** A range is valid when `start < end`, both lie on whole minutes, the start is inside its reference day and `end − start ≤ 24 hours`. The end may lie after the end of the day. A date change keeps the exact length.
- **A strip tail instead of a multi-day grid.** The hour strips gain the first cells of the next reference day, as many as the range needs plus one spare cell. They are cells of the same kind, computed by the same code path; nothing else of the grid becomes multi-day. With no meeting range there is no tail.
- **The move of the whole range is a command every view with a meeting range offers.** `MOVE_MEETING_RANGE` shifts the start and the end by the same amount, keeps the length in absolute time and limits only the start to the reference day. Every view that shows a meeting range offers it in its own control.

## Consequences

Positive:
- An evening meeting in the reference zone can be planned, typed or dragged.
- The model loses a refusal that users met as an error.
- The tail reuses the hour cell code path; there is no second kind of cell and no multi-day grid.

Negative:
- The cell count is no longer a property of the reference day alone; it comes from one function that every reader uses.
- On a wide screen the cells shrink when a tail appears.
- A typed `12:00`–`10:00` now sets a 22-hour meeting instead of an error; only equal times stay an error.

## Alternatives Considered

**A sliding 24-hour window from any hour**: breaks the reference day, on which the cards, the day tracks and the date bar rest.

**Typed input only, the frame clipped at the edge of the day**: the end of the range and its handle are out of sight.

**A tail of a fixed length, always shown**: 25 or more cells on every screen for a rare case.

**A multi-day scrolling grid**: the reference day is the unit of every view; the tail gives the same reach at a bounded cost.
