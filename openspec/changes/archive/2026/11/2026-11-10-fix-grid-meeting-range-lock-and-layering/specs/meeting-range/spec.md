## ADDED Requirements

### Requirement: Set a meeting range from wall-clock times
Setting a meeting range from wall-clock times SHALL take a location of the list, a local date (ISO date) and a start and an end wall-clock time (`HH:MM`). The start MUST be the instant of that date and the start time in the location's zone; the end MUST be the first instant after the start with the end time in that zone: on the same date, or on the next date when the end time is not later than the start time. A wall-clock time in a gap or an overlap MUST resolve as the wall-time input resolves it (`compatible`: forward over a gap, the earlier of two). The resulting range MUST then be set exactly as "Set and clear a meeting range" sets a range: it replaces any previous one and pins the reference moment to the start, or it is refused with `INVALID_MEETING_RANGE` when it breaks "Meeting range invariants". A location that is not in the list MUST be refused with `LOCATION_NOT_FOUND`, a malformed time with `INVALID_TIME` and a malformed date with `INVALID_DATE`. Every refusal MUST leave the state unchanged. The meeting range stays unstored. <!-- implements FR5 of fix-grid-meeting-range-lock-and-layering -->

#### Scenario: Wall-clock times of any location set the range
- **GIVEN** the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z` and the list holds Almaty, Moscow, Kolkata and New York
- **WHEN** the meeting range is set from `<start>` to `<end>` in `<city>` on `<date>`
- **THEN** the meeting range is `<range>` in Almaty on 2026-03-08
- **AND** the reference moment is pinned at its start

| city | date | start | end | range |
|---|---|---|---|---|
| Almaty | 2026-03-08 | 10:00 | 12:30 | 10:00–12:30 |
| Moscow | 2026-03-08 | 08:00 | 10:30 | 10:00–12:30 |
| Kolkata | 2026-03-08 | 09:30 | 11:30 | 09:00–11:00 |
| New York | 2026-03-07 | 23:00 | 01:00 | 09:00–11:00 |

#### Scenario: Times that break the invariants are refused
- **GIVEN** the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z` and the meeting range is 09:00–11:00 in Almaty
- **WHEN** the meeting range is set from `<start>` to `<end>` in `<city>` on `<date>`
- **THEN** the command fails with `<error>`
- **AND** the state is unchanged

| city | date | start | end | error |
|---|---|---|---|---|
| Almaty | 2026-03-08 | 09:10 | 11:00 | INVALID_MEETING_RANGE |
| Almaty | 2026-03-08 | 22:00 | 02:00 | INVALID_MEETING_RANGE |
| New York | 2026-03-07 | 13:00 | 14:00 | INVALID_MEETING_RANGE |
| Almaty | 2026-03-08 | 25:00 | 11:00 | INVALID_TIME |
| Almaty | 2026-13-08 | 09:00 | 11:00 | INVALID_DATE |
| Tokyo | 2026-03-08 | 09:00 | 11:00 | LOCATION_NOT_FOUND |

#### Scenario: The whole reference day
- **GIVEN** the reference zone is `Asia/Almaty` and the current time is `2026-03-08T07:30:00Z`
- **WHEN** the meeting range is set from 00:00 to 00:00 in Almaty on 2026-03-08
- **THEN** the meeting range is the whole reference day, from `2026-03-07T19:00:00Z` to `2026-03-08T19:00:00Z`
