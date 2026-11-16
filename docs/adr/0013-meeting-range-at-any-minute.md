# ADR-0013: Meeting range — the ends lie on any whole minute

## Status
Accepted (2026-11-11)

Refines [ADR-0011](0011-meeting-range-in-grid-view.md): the ends lie on any whole minute; the handles keep the track step.

## Context

ADR-0011 puts both ends of a meeting range on the 15-minute track step, so a meeting typed as 09:00–09:05 or 10:00–10:23 was refused. People plan meetings of any length (task #114), while the handles and the hour-cell tap are a fast way to pick a time and stay on the step.

## Decision

Both ends of a meeting range lie on any whole minute inside the reference day; the shortest range is one minute. The meeting handles, the hour-cell tap and drag, and the strip keys still move on the 15-minute track step and whole hours. A handle never shortens a range below one track step, or below its length when that is already shorter. A date change keeps the start's wall-clock time.

## Consequences

Positive:
- A meeting can be typed at any minute; refusals name their reason.
- One invariant in `model/meetingRange.ts` serves every path.

Negative:
- A range shorter than one step can only be lengthened by a handle.

## Alternatives Considered

- Rounding typed times to the step: silently changes what the user typed.
- A configurable step: more settings for no extra capability.

## Related

- [ADR-0011](0011-meeting-range-in-grid-view.md)
