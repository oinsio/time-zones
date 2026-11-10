# meeting-range Specification

## Purpose
Holds the optional meeting range of the world clock state — a span from a start to an end inside the reference day, on the 15-minute track step — with the commands that set, move and remove it, the moves of its meeting handles, the day shift of each location, and what Share meeting sends (ADR-0011).

## Requirements

### Requirement: Meeting range invariants
The world clock state SHALL hold at most one meeting range: a start instant and an end instant with `start < end`. Both MUST lie a whole number of track steps (15 minutes) after the start of the reference day that contains the start, the start MUST NOT be before that day's start and the end MUST NOT be after that day's end (the next local midnight of the reference zone). The shortest range is one track step, the longest the whole reference day. While a meeting range is set, the reference moment MUST be pinned at its start. The meeting range MUST NOT be stored: the location list document holds no meeting range, and the app always opens without one. <!-- implements FR1 of add-grid-meeting-range-and-share -->

#### Scenario: A stored list never carries a meeting range
- **GIVEN** the reference zone is `Asia/Almaty` and the meeting range is 09:00–11:00 on 2026-03-08
- **WHEN** the location list is written to storage and the app is opened again
- **THEN** the stored document has no meeting range
- **AND** the app opens live without a meeting range

### Requirement: Set and clear a meeting range
Setting a meeting range SHALL take a start and an end as ISO 8601 instants with `Z`, replace any previous meeting range and pin the reference moment to the start with the wall-clock status unique. A malformed instant or a range that breaks "Meeting range invariants" MUST be refused with the error `INVALID_MEETING_RANGE` and MUST leave the state unchanged. Clearing the meeting range MUST remove it and keep the reference moment pinned at the former start; clearing when no range is set changes nothing. <!-- implements FR2 of add-grid-meeting-range-and-share -->

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
| 2026-03-08T04:10:00Z | 2026-03-08T06:00:00Z |
| 2026-03-08T17:00:00Z | 2026-03-08T19:15:00Z |
| 2026-03-08 04:00 | 2026-03-08T06:00:00Z |

#### Scenario: Clear keeps the moment pinned
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the meeting range is cleared
- **THEN** no meeting range is set
- **AND** the reference moment is pinned at 09:00 in Almaty

### Requirement: Commands that remove or move the meeting range
Now SHALL remove the meeting range and make the reference moment live. A time selection and a wall-time input MUST remove the meeting range, also when they pick the instant of its start. A date change (previous day, next day, a date from the calendar) MUST move the meeting range with the date: the start keeps its wall-clock time in the reference zone on the new date, resolved like the reference moment of a date change (`compatible` disambiguation), the duration is kept, and the end is clamped to the end of the new reference day. <!-- implements FR3 of add-grid-meeting-range-and-share -->

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

#### Scenario: A shorter day clamps the end
- **GIVEN** the reference zone is `America/New_York` and the meeting range is the whole reference day of 2026-03-07, 24 hours long
- **WHEN** the user selects the next day in the date bar
- **THEN** the meeting range starts at 00:00 on 2026-03-08 and ends at the end of that 23-hour day, 23 hours long

### Requirement: Reference zone change removes the meeting range
A change of the reference zone SHALL remove the meeting range and keep the reference moment pinned at its former start: setting, changing or clearing the home location to a location of another zone, a change of the device time zone while no home is set, and a list from another tab with another home. A location list that becomes empty MUST remove the meeting range as well. Other list changes (adding, removing or moving a location of another zone than the reference zone) keep it. <!-- implements FR4 of add-grid-meeting-range-and-share -->

#### Scenario: Another home removes the range
- **GIVEN** the home location is Almaty and the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user makes Moscow the home location
- **THEN** no meeting range is set
- **AND** the reference moment is pinned at `2026-03-08T04:00:00Z`

#### Scenario: Removing the last location removes the range
- **GIVEN** the list holds only Almaty and the meeting range is 09:00–11:00
- **WHEN** the user removes Almaty
- **THEN** no meeting range is set

#### Scenario: Adding a location keeps the range
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the user adds Tokyo
- **THEN** the meeting range is still 09:00–11:00 in Almaty

### Requirement: Meeting handle moves
A meeting handle SHALL move one end of the meeting range: the start handle the start, the end handle the end. A move by one track step, by one hour, to the start of the reference day or to its end, or to a position of the reference day rounded to the nearest track step MUST be limited so that the start stays at least one track step before the end, the end at least one track step after the start, the start not before the start of the reference day and the end not after its end. The other end never moves. <!-- implements FR10, FR12 of add-grid-meeting-range-and-share -->

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

#### Scenario: A drag cannot cross the other end
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the end handle is dragged to the position of 07:40
- **THEN** the meeting range is 09:00–09:15

### Requirement: Day shift of a location
The day shift of a location at an instant SHALL compare the location's local date at that instant with the reference zone's local date at the same instant: earlier, the same or later. Inputs: the location's time zone ID, the instant, the reference zone. Output: earlier, same or later; no error for a valid zone. <!-- implements FR8 of add-grid-meeting-range-and-share -->

#### Scenario: Day shifts at the start of the sample meeting
- **GIVEN** the reference zone is `Asia/Almaty`
- **WHEN** the day shift at `2026-03-08T04:00:00Z` is read for `<city>`
- **THEN** it is `<shift>`

| city | shift |
|---|---|
| Almaty | same |
| Moscow | same |
| Kolkata | same |
| New York | earlier |
| Tokyo | same |

### Requirement: Share meeting text
Share meeting SHALL send only text, without a link: the first line names the reference zone's date of the start as the date bar's full date, and the duration; then one line per location of the list, in list order, with its city label and its local span `start–end` in the hour format setting; a location whose local date of the start differs from the reference zone's date adds its day shift and its local date on its line. All words come from the interface language. <!-- implements FR14, FR16, UX3 of add-grid-meeting-range-and-share -->

#### Scenario: English text of the sample meeting
- **GIVEN** the interface language is English, the hour format is 24-hour, the home location is Almaty and the list is Almaty, Moscow, Kolkata, New York
- **AND** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the meeting share text is built
- **THEN** it is exactly these lines:

| line |
|---|
| Meeting on Sunday, March 8, 2026, 2 h |
| Almaty: 09:00–11:00 |
| Moscow: 07:00–09:00 |
| Kolkata: 09:30–11:30 |
| New York: 23:00–01:00 (a day earlier, Sat, Mar 7) |

#### Scenario: The text follows the hour format
- **GIVEN** the sample meeting and the hour format is 12-hour
- **WHEN** the meeting share text is built
- **THEN** every span is written in the 12-hour format, as the rows show their times

### Requirement: Share meeting outcome
Where the browser can share text, Share meeting SHALL hand the text to the system share. If the user closes the share sheet, nothing more MUST happen and no notice is shown. If the browser cannot share, or the system share fails for any other reason, the text MUST be copied to the clipboard and the outcome is "copied". If copying fails too, the outcome is "failed". Sharing needs no network. <!-- implements FR15 of add-grid-meeting-range-and-share -->

#### Scenario: Outcomes of sharing
- **GIVEN** the sample meeting
- **WHEN** the user shares the meeting and the browser `<behaves>`
- **THEN** the outcome is `<outcome>`
- **AND** the clipboard holds `<clipboard>`

| behaves | outcome | clipboard |
|---|---|---|
| shares the text | shared | nothing |
| reports that the user closed the sheet | cancelled | nothing |
| has no system share | copied | the meeting share text |
| fails to share for another reason | copied | the meeting share text |
| has neither share nor clipboard | failed | nothing |

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
