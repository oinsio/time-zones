## MODIFIED Requirements

### Requirement: Meeting range invariants
The world clock state SHALL hold at most one meeting range: a start instant and an end instant with `start < end`. Both MUST lie a whole number of minutes after the start of the reference day that contains the start. The start MUST NOT be before that day's start, and the end MUST NOT be after that day's end (the next local midnight of the reference zone). The ends need not lie on the track step: the shortest range is one minute, the longest the whole reference day. While a meeting range is set, the reference moment MUST be pinned at its start. The meeting range MUST NOT be stored: the location list document holds no meeting range, and the app always opens without one. <!-- implements FR1 of add-grid-meeting-range-and-share; FR1 of refine-meeting-range-entry-and-handles -->

#### Scenario: A stored list never carries a meeting range
- **GIVEN** the reference zone is `Asia/Almaty` and the meeting range is 09:00–11:00 on 2026-03-08
- **WHEN** the location list is written to storage and the app is opened again
- **THEN** the stored document has no meeting range
- **AND** the app opens live without a meeting range

#### Scenario: A meeting at any minute
- **GIVEN** the reference zone is `Asia/Almaty` and the current time is `2026-03-08T07:30:00Z`, live
- **WHEN** the meeting range is set from `<start>` to `<end>`
- **THEN** the meeting range is `<range>` in Almaty, `<minutes>` minutes long

| start | end | range | minutes |
|---|---|---|---|
| 2026-03-08T04:05:00Z | 2026-03-08T04:10:00Z | 09:05–09:10 | 5 |
| 2026-03-08T04:05:00Z | 2026-03-08T04:28:00Z | 09:05–09:28 | 23 |
| 2026-03-08T04:00:00Z | 2026-03-08T04:01:00Z | 09:00–09:01 | 1 |

### Requirement: Set and clear a meeting range
Setting a meeting range SHALL take a start and an end as ISO 8601 instants with `Z`, replace any previous meeting range and pin the reference moment to the start with the wall-clock status unique. A malformed instant, or a range that breaks "Meeting range invariants", MUST be refused with the error `INVALID_MEETING_RANGE` and MUST leave the state unchanged. Clearing the meeting range MUST remove it and keep the reference moment pinned at the former start; clearing when no range is set changes nothing. <!-- implements FR2 of add-grid-meeting-range-and-share; FR1 of refine-meeting-range-entry-and-handles -->

#### Scenario: Set a two-hour meeting
- **GIVEN** the reference zone is `Asia/Almaty` and the current time is `2026-03-08T07:30:00Z`, live
- **WHEN** the meeting range is set from `2026-03-08T04:00:00Z` to `2026-03-08T06:00:00Z`
- **THEN** the meeting range is 09:00–11:00 in Almaty
- **AND** the reference moment is pinned at `2026-03-08T04:00:00Z`

#### Scenario: Invalid ranges are refused
- **GIVEN** the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z` and no meeting range is set
- **WHEN** the meeting range is set from `<start>` to `<end>`
- **THEN** the command fails with `INVALID_MEETING_RANGE`
- **AND** the state is unchanged

| start | end |
|---|---|
| 2026-03-08T06:00:00Z | 2026-03-08T04:00:00Z |
| 2026-03-08T04:00:00Z | 2026-03-08T04:00:00Z |
| 2026-03-08T04:10:30Z | 2026-03-08T06:00:00Z |
| 2026-03-08T17:00:00Z | 2026-03-08T19:15:00Z |
| 2026-03-08 04:00 | 2026-03-08T06:00:00Z |

#### Scenario: Clear keeps the moment pinned
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the meeting range is cleared
- **THEN** no meeting range is set
- **AND** the reference moment is pinned at 09:00 in Almaty

### Requirement: Commands that remove or move the meeting range
Now SHALL remove the meeting range and make the reference moment live. A time selection and a wall-time input MUST remove the meeting range, also when they pick the instant of its start. A date change (previous day, next day, a date from the calendar) MUST move the meeting range with the date. The start keeps its exact wall-clock time in the reference zone on the new date, also when that time is off the track step, resolved like the reference moment of a date change (`compatible` disambiguation). The duration is kept, and the end is clamped to the end of the new reference day. <!-- implements FR3 of add-grid-meeting-range-and-share; FR5 of refine-meeting-range-entry-and-handles -->

#### Scenario: Commands that remove the range
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user `<does>`
- **THEN** no meeting range is set

| does |
|---|
| returns to now |
| selects a time on a day track or an hour strip |
| types `12:15` into the time of Almaty |

#### Scenario: Next day keeps the meeting
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user selects the next day in the date bar
- **THEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-09

#### Scenario: Next day keeps a meeting off the track step
- **GIVEN** the meeting range is 09:05–09:28 in Almaty on 2026-03-08
- **WHEN** the user selects the next day in the date bar
- **THEN** the meeting range is 09:05–09:28 in Almaty on 2026-03-09

#### Scenario: A shorter day clamps the end
- **GIVEN** the reference zone is `America/New_York` and the meeting range is the whole reference day of 2026-03-07, 24 hours long
- **WHEN** the user selects the next day in the date bar
- **THEN** the meeting range starts at 00:00 on 2026-03-08 and ends at the end of that 23-hour day, 23 hours long

### Requirement: Meeting handle moves
A meeting handle SHALL move one end of the meeting range: the start handle the start, the end handle the end. The target of each move lies on the track step:
- a move by one step goes to the next or previous track step position of the reference day, counted from its start, so an end off the step reaches the nearest step in that direction;
- a move by one hour goes 60 minutes forward or back;
- a move to the start or the end of the reference day goes there;
- a pointer position goes to the nearest track step.

The target MUST then be limited so that:
- the range is never shorter than one track step, or than its current length when that is already shorter;
- the start is not before the start of the reference day;
- the end is not after its end.

The other end never moves. <!-- implements FR10, FR12 of add-grid-meeting-range-and-share; FR4 of refine-meeting-range-entry-and-handles -->

#### Scenario: Keyboard moves of the handles
- **GIVEN** the reference zone is `Asia/Almaty` and the meeting range is 09:00–11:00 on 2026-03-08
- **WHEN** the `<handle>` handle makes the move `<move>`
- **THEN** the meeting range is `<range>`

| handle | move | range |
|---|---|---|
| start | next step | 09:15–11:00 |
| start | an hour back | 08:00–11:00 |
| start | day end | 10:45–11:00 |
| start | day start | 00:00–11:00 |
| end | day start | 09:00–09:15 |
| end | an hour forward | 09:00–12:00 |
| end | day end | 09:00 to the end of the reference day |

#### Scenario: Moves from an end off the track step
- **GIVEN** the reference zone is `Asia/Almaty` and the meeting range is `<before>` on 2026-03-08
- **WHEN** the `<handle>` handle makes the move `<move>`
- **THEN** the meeting range is `<range>`

| before | handle | move | range |
|---|---|---|---|
| 09:05–11:00 | start | next step | 09:15–11:00 |
| 09:05–11:00 | start | previous step | 09:00–11:00 |
| 09:05–11:00 | start | an hour back | 08:05–11:00 |
| 09:00–10:50 | end | previous step | 09:00–10:45 |
| 09:00–09:05 | end | day start | 09:00–09:05 |
| 09:00–09:05 | start | next step | 09:00–09:05 |
| 09:00–09:05 | end | next step | 09:00–09:15 |

#### Scenario: A drag cannot cross the other end
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the end handle is dragged to the position of 07:40
- **THEN** the meeting range is 09:00–09:15

#### Scenario: A drag lands an off-step end on the track step
- **GIVEN** the meeting range is 09:05–11:00 in Almaty on 2026-03-08
- **WHEN** the start handle is dragged to the position of 09:11
- **THEN** the meeting range is 09:15–11:00

### Requirement: Set a meeting range from wall-clock times
Setting a meeting range from wall-clock times SHALL take a location of the list, a local date (ISO date) and a start and an end wall-clock time (`HH:MM`), each at any minute. The start MUST be the instant of that date and the start time in the location's zone. The end MUST be the first instant after the start with the end time in that zone: on the same date, or on the next date when the end time is earlier than the start time. A wall-clock time in a gap or an overlap MUST resolve as the wall-time input resolves it (`compatible`: forward over a gap, the earlier of two). The command MUST be refused, checked in this order, with:
1. `INVALID_TIME` for a malformed time, `INVALID_DATE` for a malformed date, and `LOCATION_NOT_FOUND` for a location that is not in the list;
2. `MEETING_START_EQUALS_END` when the start and the end time are equal;
3. `MEETING_END_BEFORE_START` when the end time is earlier than the start time, the start lies inside the reference day and the end on the next date lies after the end of that day;
4. `INVALID_MEETING_RANGE` when the range otherwise breaks "Meeting range invariants".

Every refusal MUST leave the state unchanged. A range that is not refused MUST be set exactly as "Set and clear a meeting range" sets a range: it replaces any previous one and pins the reference moment to the start. The meeting range stays unstored. <!-- implements FR5 of fix-grid-meeting-range-lock-and-layering; FR1, FR2 of refine-meeting-range-entry-and-handles -->

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
| Almaty | 2026-03-08 | 09:05 | 09:10 | 09:05–09:10 |
| Almaty | 2026-03-08 | 09:00 | 09:23 | 09:00–09:23 |
| Moscow | 2026-03-08 | 07:05 | 09:28 | 09:05–11:28 |
| Kolkata | 2026-03-08 | 09:37 | 10:00 | 09:07–09:30 |
| New York | 2026-03-07 | 23:10 | 00:40 | 09:10–10:40 |

#### Scenario: Times that break the invariants are refused
- **GIVEN** the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z` and the meeting range is 09:00–11:00 in Almaty
- **WHEN** the meeting range is set from `<start>` to `<end>` in `<city>` on `<date>`
- **THEN** the command fails with `<error>`
- **AND** the state is unchanged

| city | date | start | end | error |
|---|---|---|---|---|
| Almaty | 2026-03-08 | 10:00 | 10:00 | MEETING_START_EQUALS_END |
| Almaty | 2026-03-08 | 12:00 | 10:00 | MEETING_END_BEFORE_START |
| Almaty | 2026-03-08 | 22:00 | 02:00 | MEETING_END_BEFORE_START |
| New York | 2026-03-07 | 13:00 | 14:00 | INVALID_MEETING_RANGE |
| New York | 2026-03-07 | 13:00 | 01:00 | INVALID_MEETING_RANGE |
| Almaty | 2026-03-08 | 25:00 | 11:00 | INVALID_TIME |
| Almaty | 2026-13-08 | 09:00 | 11:00 | INVALID_DATE |
| Tokyo | 2026-03-08 | 09:00 | 11:00 | LOCATION_NOT_FOUND |

#### Scenario: The whole reference day
- **GIVEN** the reference zone is `Asia/Almaty` and the current time is `2026-03-08T07:30:00Z`
- **WHEN** the meeting range is set from 00:00 to 00:00 in Almaty on 2026-03-08
- **THEN** the command fails with `MEETING_START_EQUALS_END` and no meeting range is set
- **AND** the state is unchanged
