# Open Questions

Architecture decisions that are not made yet. When one is resolved, record the decision in an ADR or in the relevant architecture document and move it to Resolved.

| # | Question | Options | Current leaning |
|---|---|---|---|
| — | No open questions | | |

## Resolved

| # | Question | Decision |
|---|---|---|
| Q1 | Which views ship in the MVP? | Cards first, Grid next, plugged in via the view registry — [ADR-0005](../adr/0005-view-registry.md) |
| Q2 | City database for search | Minimal zone-cities source first, richer sources added later — [ADR-0006](../adr/0006-city-data-sources.md) |
| Q3 | Working hours for day-period colors | Constants in the MVP: night 00-07 and 22-24, morning 07-09, work 09-18, evening 18-22 (local time of each location). Passed to `getDayPeriod` as a parameter, so a user setting can replace them later — [domain model](domain-model.md#day-periods) |
| Q4 | How to enter a time for a zone that is not in the list ("08:00 UTC") | The user adds the zone as a regular location first. No temporary rows and no separate converter field; `SET_WALL_TIME` works only with locations from the list |
| Q5 | Where the date control lives | MVP: bottom bar with previous / next day, a date button opening a calendar, and the Now control — a shared block in `views/shared/`. A day strip for wide screens is decided together with the Grid view |
| Q6 | What the time in the row header shows | The reference moment: equals the current time in `LIVE`, the selected moment in `PINNED`; the Now control appears only when the moment is pinned |
| Q7 | How to show `GAP` / `AMBIGUOUS` results of wall-clock input | Inline hint in the affected card until the next change; no toast and no "show the other instant" action in the MVP — see the wall-time hint in [views](views.md) |
