# Open Questions

Architecture decisions that are not made yet. When one is resolved, record the decision in an ADR or in the relevant architecture document and move it to Resolved.

| # | Question | Options | Current leaning |
|---|---|---|---|

## Resolved

| # | Question | Decision |
|---|---|---|
| Q1 | Which views ship in the MVP? | Cards first, Grid next, plugged in via the view registry — [ADR-0005](../adr/0005-view-registry.md) |
| Q2 | City database for search | Minimal zone-cities source first, richer sources added later — [ADR-0006](../adr/0006-city-data-sources.md) |
| Q3 | Day periods and working hours | Closed. Day periods follow the sun, decided by `bind-day-periods-to-sun` and recorded in ADR-0016 (`docs/adr/0016-day-periods-follow-the-sun.md`, added through handoff H1). The Working hours colouring uses the user's working hours (change add-day-colouring-setting) — [domain model](domain-model.md#day-periods) |
| Q4 | How to enter a time for a zone that is not in the list ("08:00 UTC") | The user adds the zone as a regular location first. No temporary rows and no separate converter field; `SET_WALL_TIME` works only with locations from the list |
| Q5 | Where the date bar lives | Bottom bar with previous / next day, a date button opening a calendar, and the Now button — a shared block in `views/shared/`, used by Cards and Grid alike; no day strip |
| Q6 | What the time in the row header shows | The reference moment: equals the current time in `LIVE`, the selected moment in `PINNED`; the Now button is always shown and is active only when the moment is pinned |
| Q7 | How to show `GAP` / `AMBIGUOUS` results of wall-clock input | Inline hint in the affected card until the next change; no toast and no "show the other instant" action in the MVP — see the wall-time hint in [views](views.md) |
| Q8 | What Share meeting sends | Text only: the date, the duration and every location's local span; no link — [views](views.md#meeting-bar) |
