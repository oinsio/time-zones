# Open Questions

Architecture decisions that are not made yet. When one is resolved, record the decision in an ADR or in the relevant architecture document and remove it from this list.

| # | Question | Options | Current leaning |
|---|---|---|---|
| Q1 | Which views ship in the MVP? | a) Grid + Cards + Auto; b) one view first, the second later | a — two views prove the model is really view-independent |
| Q2 | City database for search | a) ~400 IANA zones with their representative cities, no external data; b) GeoNames cities (15-25k) with regions and RU/EN names, lazy-loaded | a in the MVP, b as a separate initiative; only the `CitySearch` adapter changes |
| Q3 | Working hours for day-period colors | a) constant 09:00-18:00; b) user setting | a in the MVP |
| Q4 | How to enter a time for a zone that is not in the list ("08:00 UTC") | a) temporary row; b) dedicated converter field; c) require adding the location first | — the model already supports it via `SET_WALL_TIME` |
| Q5 | Where the date control lives | a) day strip in the header; b) bottom bar with previous / next and a date button | b on phones (thumb reach), a on wide screens |
| Q6 | What the time in the row header shows | a) reference moment; b) current time | a — "now" is shown by a marker and the Now control |
| Q7 | How to show `GAP` / `AMBIGUOUS` results of wall-clock input | inline hint, toast, or choice of the second instant | — |

## Also affected

- `README.md` feature 4 still describes the grid as the only interface; update it once Q1 is decided.
