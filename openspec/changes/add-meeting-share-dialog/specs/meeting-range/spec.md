## MODIFIED Requirements

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
