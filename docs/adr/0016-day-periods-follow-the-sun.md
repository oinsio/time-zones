# ADR-0016: Day periods follow the sun

## Status
Accepted (2026-11-16)

## Context

Day periods were set by the clock (07:00, 09:00, 18:00, 22:00) for every city. That is wrong at the place: the sun rises in Moscow at about 08:57 on 21 December, the night in Saint Petersburg lasts under two hours in June, and Murmansk has no day in December. Driven by FR1 and FR3 of bind-day-periods-to-sun. Related: ADR-0003, ADR-0008, ADR-0014.

## Decision

The day period of a location at an instant is decided by the sun's elevation at its coordinates: night below −6°, day from +6°, between them morning until solar noon and evening after it. The elevation is computed on the device with the NOAA solar calculator equations in plain numbers and epoch milliseconds: no library, no data file, no network, no `Date`, no BigInt. The time zone never enters, so a clock change moves no boundary. The calculation and the zone coordinates load in a precached chunk before the first render, outside the initial JavaScript budget.

## Consequences

Positive:
- Tracks and cells show the day as it is at the place, including polar cases, with one rule and no special case.
- Works offline; accuracy within 3 minutes of civil twilight up to 66° latitude.

Negative:
- The default look of every track changes once.
- The first render waits for one small precached chunk.

## Alternatives Considered

**The clock schedule**: wrong at the place and duplicates the working hours.

**Sunrise and sunset (−0.833°)**: morning and evening would be hairlines of about 2% of a track.

**`suncalc` or another library**: `Date`-based, a new runtime dependency, about as much code as the equations.

**A lookup table per city**: data to ship and refresh for what is a formula.
