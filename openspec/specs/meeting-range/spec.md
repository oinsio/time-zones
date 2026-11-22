# meeting-range Specification

## Purpose
Holds the optional meeting range of the world clock state — a span from a start to an end inside the reference day, on the 15-minute track step — with the commands that set, move and remove it, the moves of its meeting handles, the day shift of each location, and what Share meeting sends (ADR-0011).

## Requirements

### Requirement: Meeting range invariants
The world clock state SHALL hold at most one meeting range: a start instant and an end instant with `start < end`. Both MUST lie a whole number of minutes after the start of the reference day that contains the start. The start MUST lie inside that reference day: not before its start and before its end (the next local midnight of the reference zone). The end MAY lie after the end of that day and MUST NOT be more than 24 hours after the start. The ends need not lie on the track step: the shortest range is one minute, the longest 24 hours. While a meeting range is set, the reference moment MUST be pinned at its start. The meeting range MUST NOT be stored: the location list document holds no meeting range, and the app always opens without one. <!-- implements FR1 of add-grid-meeting-range-and-share; FR1 of refine-meeting-range-entry-and-handles; FR1, FR11 of move-meeting-range-and-extend-past-midnight -->

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

#### Scenario: A meeting past midnight of the reference zone
- **GIVEN** the reference zone is `Asia/Almaty` and the current time is `2026-03-08T07:30:00Z`, live
- **WHEN** the meeting range is set from `<start>` to `<end>`
- **THEN** the meeting range is `<range>` in Almaty, `<minutes>` minutes long
- **AND** the reference day is 2026-03-08

| start | end | range | minutes |
|---|---|---|---|
| 2026-03-08T18:00:00Z | 2026-03-08T21:00:00Z | 23:00 on 2026-03-08 – 02:00 on 2026-03-09 | 180 |
| 2026-03-08T17:00:00Z | 2026-03-08T19:15:00Z | 22:00 on 2026-03-08 – 00:15 on 2026-03-09 | 135 |
| 2026-03-08T04:00:00Z | 2026-03-09T04:00:00Z | 09:00 on 2026-03-08 – 09:00 on 2026-03-09 | 1440 |

### Requirement: Set and clear a meeting range
Setting a meeting range SHALL take a start and an end as ISO 8601 instants with `Z`, replace any previous meeting range and pin the reference moment to the start with the wall-clock status unique. A malformed instant, or a range that breaks "Meeting range invariants", MUST be refused with the error `INVALID_MEETING_RANGE` and MUST leave the state unchanged. Clearing the meeting range MUST remove it and keep the reference moment pinned at the former start; clearing when no range is set changes nothing. <!-- implements FR2 of add-grid-meeting-range-and-share; FR1 of refine-meeting-range-entry-and-handles; FR2 of move-meeting-range-and-extend-past-midnight -->

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
| 2026-03-08T04:00:00Z | 2026-03-09T04:01:00Z |
| 2026-03-08 04:00 | 2026-03-08T06:00:00Z |

#### Scenario: Clear keeps the moment pinned
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the meeting range is cleared
- **THEN** no meeting range is set
- **AND** the reference moment is pinned at 09:00 in Almaty

#### Scenario: Set a meeting that ends after midnight
- **GIVEN** the reference zone is `Asia/Almaty` and the current time is `2026-03-08T07:30:00Z`, live
- **WHEN** the meeting range is set from `2026-03-08T18:00:00Z` to `2026-03-08T21:00:00Z`
- **THEN** the meeting range is 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
- **AND** the reference moment is pinned at `2026-03-08T18:00:00Z`

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
A meeting handle SHALL move one end of the meeting range: the start handle the start, the end handle the end. A step move and a pointer position land on the track step, an hour move keeps the minute, and the earliest and the latest positions are exact:
- a move by one step goes to the next or previous track step position, counted from the start of the reference day and continuing past its end, so an end off the step reaches the nearest step in that direction;
- a move by one hour goes 60 minutes forward or back;
- a move to the earliest or the latest position goes to the first or the last position the limits below allow;
- a pointer position goes to the nearest track step.

The target MUST then be limited, which may stop it off the track step, so that:
- the range is never shorter than one track step, or than its current length when that is already shorter;
- the range is never longer than 24 hours;
- the start is not before the start of the reference day and not after the last track step position of that day;
- the end is not more than 24 hours after the start; it MAY lie after the end of the reference day.

The other end never moves. <!-- implements FR10, FR12 of add-grid-meeting-range-and-share; FR4 of refine-meeting-range-entry-and-handles; FR4 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Keyboard moves of the handles
- **GIVEN** the reference zone is `Asia/Almaty` and the meeting range is 09:00–11:00 on 2026-03-08
- **WHEN** the `<handle>` handle makes the move `<move>`
- **THEN** the meeting range is `<range>`

| handle | move | range |
|---|---|---|
| start | next step | 09:15–11:00 |
| start | an hour back | 08:00–11:00 |
| start | latest | 10:45–11:00 |
| start | earliest | 00:00–11:00 |
| end | earliest | 09:00–09:15 |
| end | an hour forward | 09:00–12:00 |
| end | latest | 09:00 on 2026-03-08 to 09:00 on 2026-03-09 |

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
| 09:00–09:05 | end | earliest | 09:00–09:05 |
| 09:00–09:05 | start | next step | 09:00–09:05 |
| 09:00–09:05 | end | next step | 09:00–09:15 |
| 09:05–09:28 | start | next step | 09:13–09:28 |

#### Scenario: A drag cannot cross the other end
- **GIVEN** the meeting range is 09:00–11:00 in Almaty on 2026-03-08
- **WHEN** the end handle is dragged to the position of 07:40
- **THEN** the meeting range is 09:00–09:15

#### Scenario: A drag lands an off-step end on the track step
- **GIVEN** the meeting range is 09:05–11:00 in Almaty on 2026-03-08
- **WHEN** the start handle is dragged to the position of 09:11
- **THEN** the meeting range is 09:15–11:00

#### Scenario: Handles of a meeting past midnight
- **GIVEN** the reference zone is `Asia/Almaty` and the meeting range is 23:00 on 2026-03-08 to 02:00 on 2026-03-09
- **WHEN** the `<handle>` handle makes the move `<move>`
- **THEN** the meeting range is `<range>`

| handle | move | range |
|---|---|---|
| end | next step | 23:00–02:15 of the next day |
| end | an hour back | 23:00–01:00 of the next day |
| end | earliest | 23:00–23:15 |
| end | latest | 23:00 on 2026-03-08 to 23:00 on 2026-03-09 |
| start | next step | 23:15–02:00 of the next day |
| start | latest | 23:45–02:00 of the next day |
| start | earliest | 02:00 on 2026-03-08 to 02:00 on 2026-03-09 |

#### Scenario: The end handle is dragged past midnight
- **GIVEN** the meeting range is 22:00–23:00 in Almaty on 2026-03-08
- **WHEN** the end handle is dragged to the position of 00:40 of the next day
- **THEN** the meeting range is 22:00 on 2026-03-08 to 00:45 on 2026-03-09

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
Share meeting SHALL send only text, without a link, built from the meeting invitation — the meeting range and the locations included in it — in the share language. The first line is the heading: it names the weekday and the date of the start in the reference zone, and the duration. Then comes one line per included location, in list order, with its city label, its zone parts and its local span `start–end` in the hour format setting; a location whose local date of the start differs from the reference zone's date adds its day shift and its local date on its line. A location that is not included MUST have no line. <!-- implements FR14, FR16, UX3 of add-grid-meeting-range-and-share; FR3 of add-meeting-share-dialog -->

Every word MUST come from the share language, whatever the interface language is: the heading, the city labels, the dates, the day shift words, the duration and the localized zone abbreviations. <!-- implements FR4 of add-meeting-share-dialog -->

The zone parts stand in brackets after the city label, as the share zone label allows: the zone abbreviation, then the UTC offset, joined by a comma. A zone with no zone abbreviation shows its UTC offset alone; when nothing is left to show, the line has no brackets. A location in `UTC` MUST NOT repeat `UTC` in brackets. Both parts are those in force at the start of the meeting range. A line never names the country and never writes `GMT` for an offset. <!-- implements FR6 of add-meeting-share-dialog -->

The heading MUST name the weekday in the grammatical form the share language needs. A language that needs no such form uses one heading for every weekday. <!-- implements FR7 of add-meeting-share-dialog -->

Inputs: the meeting invitation, the share language, the share zone label, the hour format. Output: the text. No error: a meeting invitation with no location gives no text, and the share dialog offers no share for it.

#### Scenario: English text of the sample meeting
- **GIVEN** the share language is English, the hour format is 24-hour, the home location is Almaty and the list is Almaty, Moscow, Kolkata, New York
- **AND** the meeting range is 09:00–11:00 in Almaty on 2026-03-08, every location is included and the share zone label shows the zone abbreviation and the UTC offset
- **WHEN** the meeting share text is built
- **THEN** it is exactly these lines:

| line |
|---|
| Meeting on Sunday, March 8, 2026, 2 h |
| Almaty (UTC+5): 09:00–11:00 |
| Moscow (MSK, UTC+3): 07:00–09:00 |
| Kolkata (IST, UTC+5:30): 09:30–11:30 |
| New York (EST, UTC−5): 23:00–01:00 (a day earlier, Sat, Mar 7) |

#### Scenario: Russian text of the sample meeting
- **GIVEN** the sample meeting with every location included and the share language is Russian
- **WHEN** the meeting share text is built
- **THEN** it is exactly these lines:

| line |
|---|
| Встреча в воскресенье, 8 марта 2026 г., 2 ч |
| Алматы (UTC+5): 09:00–11:00 |
| Москва (МСК, UTC+3): 07:00–09:00 |
| Калькутта (IST, UTC+5:30): 09:30–11:30 |
| Нью-Йорк (EST, UTC−5): 23:00–01:00 (днём раньше, сб, 7 мар.) |

#### Scenario: The text follows the hour format
- **GIVEN** the sample meeting and the hour format is 12-hour
- **WHEN** the meeting share text is built
- **THEN** every span is written in the 12-hour format, as the rows show their times

#### Scenario: Only included locations get a line
- **GIVEN** the sample meeting and the share language is English
- **WHEN** the meeting share text is built with only Almaty and New York included
- **THEN** it has the heading and exactly two more lines, for Almaty and then New York

#### Scenario: The share language differs from the interface language
- **GIVEN** the interface language is Russian and the sample meeting
- **WHEN** the meeting share text is built in the share language English
- **THEN** it is the English text of the sample meeting
- **AND** no line contains a Cyrillic letter

#### Scenario: Zone parts follow the share zone label
- **GIVEN** the sample meeting and the share language is English
- **WHEN** the meeting share text is built with the share zone label `<parts>`
- **THEN** the Moscow line is `<moscow>` and the Almaty line is `<almaty>`

| parts | moscow | almaty |
|---|---|---|
| abbreviation and UTC offset | Moscow (MSK, UTC+3): 07:00–09:00 | Almaty (UTC+5): 09:00–11:00 |
| abbreviation only | Moscow (MSK): 07:00–09:00 | Almaty: 09:00–11:00 |
| UTC offset only | Moscow (UTC+3): 07:00–09:00 | Almaty (UTC+5): 09:00–11:00 |
| neither | Moscow: 07:00–09:00 | Almaty: 09:00–11:00 |

#### Scenario: A UTC location does not repeat UTC
- **GIVEN** the list is Almaty and the `UTC` location, the meeting range is 09:00–11:00 in Almaty on 2026-03-08 and the share language is English
- **WHEN** the meeting share text is built with the zone abbreviation and the UTC offset shown
- **THEN** the `UTC` line is `UTC: 04:00–06:00`

#### Scenario: Zone parts are those at the start of the meeting
- **GIVEN** the home location is Belgrade and the share language is English
- **WHEN** the meeting share text is built for a meeting range that starts on `<date>` at 10:00 in Belgrade
- **THEN** the Belgrade line starts with `<prefix>`

| date | prefix |
|---|---|
| 2026-01-15 | Belgrade (CET, UTC+1): |
| 2026-07-15 | Belgrade (CEST, UTC+2): |

#### Scenario: Russian heading by weekday
- **GIVEN** the home location is Almaty and the share language is Russian
- **WHEN** the meeting share text is built for a two-hour meeting range that starts on `<date>`
- **THEN** the heading is `<heading>`

| date | heading |
|---|---|
| 2026-03-09 | Встреча в понедельник, 9 марта 2026 г., 2 ч |
| 2026-03-10 | Встреча во вторник, 10 марта 2026 г., 2 ч |
| 2026-03-11 | Встреча в среду, 11 марта 2026 г., 2 ч |
| 2026-03-12 | Встреча в четверг, 12 марта 2026 г., 2 ч |
| 2026-03-13 | Встреча в пятницу, 13 марта 2026 г., 2 ч |
| 2026-03-14 | Встреча в субботу, 14 марта 2026 г., 2 ч |
| 2026-03-15 | Встреча в воскресенье, 15 марта 2026 г., 2 ч |

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
Setting a meeting range from wall-clock times SHALL take a location of the list, a local date (ISO date) and a start and an end wall-clock time (`HH:MM`), each at any minute. The start MUST be the instant of that date and the start time in the location's zone. The end MUST be the first instant after the start with the end time in that zone: on the same date, or on the next date when the end time is earlier than the start time. A wall-clock time in a gap or an overlap MUST resolve as the wall-time input resolves it (`compatible`: forward over a gap, the earlier of two). The command MUST be refused, checked in this order, with:
1. `INVALID_TIME` for a malformed time, `INVALID_DATE` for a malformed date, and `LOCATION_NOT_FOUND` for a location that is not in the list;
2. `MEETING_START_EQUALS_END` when the start and the end time are equal;
3. `INVALID_MEETING_RANGE` when the start lies outside the reference day shown when the command is given, or the range otherwise breaks "Meeting range invariants".

An end time earlier than the start time is never refused for that reason: the range then ends on the next date, after midnight of the reference zone if need be. Every refusal MUST leave the state unchanged. A range that is not refused MUST be set exactly as "Set and clear a meeting range" sets a range: it replaces any previous one and pins the reference moment to the start. The meeting range stays unstored. <!-- implements FR5 of fix-grid-meeting-range-lock-and-layering; FR1, FR2 of refine-meeting-range-entry-and-handles; FR3 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Wall-clock times of any location set the range
- **GIVEN** the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z` and the list holds Almaty, Moscow, Kolkata and New York
- **WHEN** the meeting range is set from `<start>` to `<end>` in `<city>` on `<date>`
- **THEN** the meeting range is `<range>` in Almaty, starting on 2026-03-08
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
| Almaty | 2026-03-08 | 22:00 | 02:00 | 22:00–02:00 of the next day |
| Almaty | 2026-03-08 | 23:00 | 01:00 | 23:00–01:00 of the next day |
| Almaty | 2026-03-08 | 12:00 | 10:00 | 12:00–10:00 of the next day |
| Moscow | 2026-03-08 | 21:00 | 00:00 | 23:00–02:00 of the next day |

#### Scenario: Times that break the invariants are refused
- **GIVEN** the reference zone is `Asia/Almaty`, the current time is `2026-03-08T07:30:00Z` and the meeting range is 09:00–11:00 in Almaty
- **WHEN** the meeting range is set from `<start>` to `<end>` in `<city>` on `<date>`
- **THEN** the command fails with `<error>`
- **AND** the state is unchanged

| city | date | start | end | error |
|---|---|---|---|---|
| Almaty | 2026-03-08 | 10:00 | 10:00 | MEETING_START_EQUALS_END |
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

### Requirement: Commands that remove the meeting range or carry it to another date
Now SHALL remove the meeting range and make the reference moment live. A time selection and a wall-time input MUST remove the meeting range, also when they pick the instant of its start. A date change (previous day, next day, a date from the calendar) MUST move the meeting range with the date. The start keeps its exact wall-clock time in the reference zone on the new date, also when that time is off the track step, resolved like the reference moment of a date change (`compatible` disambiguation). The duration is kept exactly: the end is never clamped to the end of the new reference day. <!-- implements FR3 of add-grid-meeting-range-and-share; FR5 of refine-meeting-range-entry-and-handles; FR5 of move-meeting-range-and-extend-past-midnight -->

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

#### Scenario: A shorter day keeps the length
- **GIVEN** the reference zone is `America/New_York` and the meeting range is the whole reference day of 2026-03-07, 24 hours long
- **WHEN** the user selects the next day in the date bar
- **THEN** the meeting range starts at 00:00 on 2026-03-08 and ends at 01:00 on 2026-03-09, 24 hours long

#### Scenario: Next day keeps a meeting past midnight
- **GIVEN** the meeting range is 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty
- **WHEN** the user selects the next day in the date bar
- **THEN** the meeting range is 23:00 on 2026-03-09 to 02:00 on 2026-03-10 in Almaty

### Requirement: Move the whole meeting range
Moving the meeting range SHALL shift its start and its end by the same amount, so that its length never changes, and pin the reference moment to the new start. A step move and a pointer position land the start on the track step, an hour move keeps the minute of the start, and the earliest and the latest positions are exact:
- a move by one step puts the start on the next or previous track step position of the reference day, so a start off the step reaches the nearest step in that direction;
- a move by one hour goes 60 minutes forward or back;
- a move to the earliest position puts the start at the start of the reference day, and a move to the latest position at the last track step position of that day;
- a pointer position puts the start on the nearest track step.

The target MUST then be limited so that the start is not before the start of the reference day and not after its last track step position. The end MAY lie after the end of the reference day. The reference day never changes by a move: to reach another date the user changes the date. With no meeting range set, a move changes nothing. Inputs: the move, or the target position of the start in minutes from the start of the reference day. Output: the moved meeting range. Errors: none. <!-- implements FR14, FR20 of move-meeting-range-and-extend-past-midnight -->

#### Scenario: Moves of the sample meeting
- **GIVEN** the reference zone is `Asia/Almaty` and the meeting range is 09:00–11:00 on 2026-03-08
- **WHEN** the meeting range makes the move `<move>`
- **THEN** the meeting range is `<range>`, 120 minutes long
- **AND** the reference moment is pinned at its start

| move | range |
|---|---|
| next step | 09:15–11:15 |
| previous step | 08:45–10:45 |
| an hour forward | 10:00–12:00 |
| an hour back | 08:00–10:00 |
| earliest | 00:00–02:00 |
| latest | 23:45 on 2026-03-08 to 01:45 on 2026-03-09 |

#### Scenario: Moves of a meeting off the track step
- **GIVEN** the reference zone is `Asia/Almaty` and the meeting range is 09:05–09:28 on 2026-03-08
- **WHEN** the meeting range makes the move `<move>`
- **THEN** the meeting range is `<range>`, 23 minutes long

| move | range |
|---|---|
| next step | 09:15–09:38 |
| previous step | 09:00–09:23 |
| an hour back | 08:05–08:28 |

#### Scenario: A pointer position lands the start on the track step
- **GIVEN** the meeting range is 13:00–15:00 in Almaty on 2026-03-08
- **WHEN** the meeting range is moved so that its start is at the position of `<position>`
- **THEN** the meeting range is `<range>`

| position | range |
|---|---|
| 14:37 | 14:30–16:30 |
| 14:38 | 14:45–16:45 |
| 23:58 | 23:45 on 2026-03-08 to 01:45 on 2026-03-09 |
| an hour before the start of the reference day | 00:00–02:00 |

#### Scenario: A move stops at the limits
- **GIVEN** the meeting range is `<before>` in Almaty on 2026-03-08
- **WHEN** the meeting range makes the move `<move>`
- **THEN** the meeting range is `<range>`

| before | move | range |
|---|---|---|
| 00:00–02:00 | previous step | 00:00–02:00 |
| 00:30–02:30 | an hour back | 00:00–02:00 |
| 23:45–01:45 of the next day | next step | 23:45–01:45 of the next day |
| 23:20–23:50 | an hour forward | 23:45–00:15 of the next day |

#### Scenario: A move on a clock change day keeps the length
- **GIVEN** the reference zone is `America/New_York` and the meeting range is 00:30–01:30 on 2026-03-08, a 23-hour day
- **WHEN** the meeting range makes the move "an hour forward" twice
- **THEN** the meeting range is 60 minutes long and starts 120 minutes of absolute time later

#### Scenario: No meeting range
- **GIVEN** no meeting range is set
- **WHEN** a move of the meeting range is asked for
- **THEN** the state is unchanged
