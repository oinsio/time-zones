# Open Questions

Architecture decisions that are not made yet. When one is resolved, record the decision in an ADR or in the relevant architecture document and move it to Resolved.

| # | Question | Options | Current leaning |
|---|---|---|---|
| Q4 | How to enter a time for a zone that is not in the list ("08:00 UTC") | a) temporary row; b) dedicated converter field; c) require adding the location first | — the model already supports it via `SET_WALL_TIME` |
| Q5 | Where the date control lives | a) day strip in the header; b) bottom bar with previous / next and a date button | b on phones (thumb reach), a on wide screens |
| Q6 | What the time in the row header shows | a) reference moment; b) current time | a — "now" is shown by a marker and the Now control |
| Q7 | How to show `GAP` / `AMBIGUOUS` results of wall-clock input | inline hint, toast, or choice of the second instant | — |

## Resolved

| # | Question | Decision |
|---|---|---|
| Q1 | Which views ship in the MVP? | Cards first, Grid next, plugged in via the view registry — [ADR-0005](../adr/0005-view-registry.md) |
| Q2 | City database for search | Minimal zone-cities source first, richer sources added later — [ADR-0006](../adr/0006-city-data-sources.md) |
| Q3 | Working hours for day-period colors | Constants in the MVP: night 00-07 and 22-24, morning 07-09, work 09-18, evening 18-22 (local time of each location). Passed to `getDayPeriod` as a parameter, so a user setting can replace them later — [domain model](domain-model.md#day-periods) |
