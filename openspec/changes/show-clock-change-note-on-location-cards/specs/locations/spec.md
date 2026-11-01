## ADDED Requirements

### Requirement: Clock change note on location rows
A location row in the Cards view SHALL show a clock change note when the UTC offset of its zone changes at least once inside the clock change window. The window spans the instants from the start of the day seven days before the date in the date bar to the end of the day seven days after it, both days included; the days are counted in the reference zone (the home location's zone if home is set, otherwise the device time zone). The window follows the date in the date bar in the live mode (today) and in the pinned mode. Every change of the zone's UTC offset counts, whatever its cause: a daylight saving time change and a permanent change alike.

The note MUST name: the local date of the change, as the day and the short month in the interface language; the local time at which the clocks are moved, as the wall-clock time of the location just before the change, in the hour format; the direction, forward when the offset after the change is greater than before it and back when it is smaller; the amount, the absolute difference of the two offsets in hours and minutes. The note MUST be in the past tense when the change instant is not after the effective instant of the reference moment, and in the future tense when it is after it, also when the change falls on the reference day. When the window holds several changes, the note MUST be about the change nearest to the effective instant; at equal distance, about the earlier one.

Every row whose zone qualifies shows the note, including the home location and the device time location. A row whose zone has no change inside the window MUST show no note. When the zone's identifier is unknown to the browser, the row MUST show no note and the rest of the list MUST be unaffected. The note MUST appear, change and disappear in the same render as a change of the date in the date bar, the reference moment, the reference zone, the interface language or the hour format, with no loading state. It cannot be dismissed; it disappears only when no change of its zone is inside the window any more. Inputs: the location's canonical IANA identifier, the effective instant (ISO 8601 with `Z`), the reference zone, the interface language, the hour format. Output: the note text or none. The offsets are derived from the identifier at each instant and are never stored; nothing about the note is stored, and it needs no network. <!-- implements FR1, FR2, FR3, FR4, FR5, FR7 of show-clock-change-note-on-location-cards -->

#### Scenario: A past change at the lower bound of the window
- **GIVEN** the interface language is Russian and the hour format is 24-hour
- **AND** the device time zone is `Europe/Belgrade` and no home location is set
- **AND** the current instant is `2026-11-01T09:00:00Z`
- **AND** the list contains Belgrade (`Europe/Belgrade`)
- **WHEN** the user opens the app
- **THEN** the Belgrade row shows the clock change note «25 окт. в 03:00 часы переведены на 1 ч назад»

#### Scenario: A future change at the upper bound of the window
- **GIVEN** the interface language is Russian and the hour format is 24-hour
- **AND** the device time zone is `Europe/Belgrade` and no home location is set
- **AND** the list contains Belgrade
- **WHEN** the reference moment is pinned to `2027-03-21T09:00:00Z`
- **THEN** the Belgrade row shows the clock change note «28 мар. в 02:00 часы переведут на 1 ч вперёд»

#### Scenario: Window bounds
- **GIVEN** the device time zone is `Europe/Belgrade` and no home location is set
- **AND** the list contains Belgrade
- **WHEN** the reference moment is pinned to 09:00 UTC of each date in the date bar below
- **THEN** the Belgrade row shows a clock change note exactly when the table says so

| date in the date bar | note |
|---|---|
| 2026-10-17 | no |
| 2026-10-18 | yes |
| 2026-10-25 | yes |
| 2026-11-01 | yes |
| 2026-11-02 | no |
| 2027-03-20 | no |
| 2027-03-21 | yes |

#### Scenario: The window is counted in the reference zone
- **GIVEN** the device time zone is `Asia/Almaty` and no home location is set
- **AND** the list contains Belgrade
- **WHEN** the reference moment is pinned to `2026-11-01T20:00:00Z` (2 November in Almaty, 1 November in Belgrade)
- **THEN** the Belgrade row shows no clock change note
- **WHEN** Belgrade is made the home location
- **THEN** the Belgrade row shows a clock change note

#### Scenario: A change on the reference day, before and after it
- **GIVEN** the interface language is English and the hour format is 24-hour
- **AND** the device time zone is `Europe/Belgrade` and no home location is set
- **AND** the list contains Belgrade
- **WHEN** the reference moment is pinned to `2026-10-25T00:30:00Z`
- **THEN** the Belgrade row shows "On Oct 25 at 03:00 clocks will go back 1 h"
- **WHEN** the reference moment is pinned to `2026-10-25T01:00:00Z`
- **THEN** the Belgrade row shows "On Oct 25 at 03:00 clocks went back 1 h"

#### Scenario: Nearest of two changes
- **GIVEN** the interface language is Russian and the hour format is 24-hour
- **AND** the device time zone is `UTC` and no home location is set
- **AND** the list contains Boa Vista (`America/Boa_Vista`), whose offset changed on `2000-10-08T04:00:00Z` (−4 to −3) and on `2000-10-15T03:00:00Z` (−3 to −4)
- **WHEN** the reference moment is pinned to `2000-10-10T12:00:00Z`
- **THEN** the Boa Vista row shows «8 окт. в 00:00 часы переведены на 1 ч вперёд»
- **WHEN** the reference moment is pinned to `2000-10-13T12:00:00Z`
- **THEN** the Boa Vista row shows «15 окт. в 00:00 часы переведут на 1 ч назад»

#### Scenario: A change of 30 minutes
- **GIVEN** the device time zone is `Europe/Belgrade` and no home location is set
- **AND** the list contains Lord Howe Island (`Australia/Lord_Howe`)
- **WHEN** the reference moment is pinned to `2026-10-01T09:00:00Z`
- **THEN** in Russian the Lord Howe Island row shows «4 окт. в 02:00 часы переведут на 30 мин вперёд»
- **AND** in English it shows "On Oct 4 at 02:00 clocks will go forward 30 min"

#### Scenario: A permanent change of the offset
- **GIVEN** the interface language is Russian and the hour format is 24-hour
- **AND** the device time zone is `Asia/Almaty` and no home location is set
- **AND** the list contains Almaty (`Asia/Almaty`), whose offset changed permanently from +6 to +5 on `2024-02-29T18:00:00Z`
- **WHEN** the reference moment is pinned to `2024-03-01T06:00:00Z`
- **THEN** the Almaty row shows «1 мар. в 00:00 часы переведены на 1 ч назад»

#### Scenario: No note for a zone without changes
- **GIVEN** the device time zone is `Europe/Belgrade` and no home location is set
- **AND** the list contains Belgrade, Tokyo (`Asia/Tokyo`) and Almaty
- **WHEN** the reference moment is pinned to `2026-10-25T09:00:00Z`
- **THEN** the Belgrade row shows a clock change note
- **AND** the Tokyo row and the Almaty row show none

#### Scenario: Home location and device time location show the note
- **GIVEN** the device time zone is `Europe/Belgrade`
- **AND** the list contains the device time location and New York (`America/New_York`), and New York is the home location
- **WHEN** the reference moment is pinned to `2026-10-28T12:00:00Z`
- **THEN** the device time location shows a clock change note about `25 Oct` in the past tense
- **AND** the New York row shows a clock change note about `1 Nov` in the future tense

#### Scenario: Unknown zone
- **GIVEN** the list contains a location whose zone identifier the browser does not know, and Belgrade
- **WHEN** the reference moment is pinned to `2026-10-25T09:00:00Z`
- **THEN** that row shows no clock change note
- **AND** the Belgrade row shows its clock change note

#### Scenario: The note follows the date bar and the settings
- **GIVEN** the device time zone is `Europe/Belgrade` and no home location is set
- **AND** the list contains Belgrade
- **AND** the reference moment is pinned to `2026-11-01T09:00:00Z`, so the Belgrade row shows a clock change note
- **WHEN** the date moves to the next day
- **THEN** the Belgrade row shows no clock change note
- **WHEN** the date moves to the previous day and the hour format becomes 12-hour in English
- **THEN** the Belgrade row shows "On Oct 25 at 3:00 AM clocks went back 1 h"

### Requirement: Clock change note and the wall-time hint
A location row SHALL show at most one note after its day track. A row that shows a wall-time hint MUST NOT show a clock change note, even when its zone has a change inside the window; every other row MUST keep its clock change note. When the wall-time hint ends (see the `time-selection` capability), the row MUST show its clock change note again if its zone still qualifies. The wall-time hint keeps its texts, its lifetime, its `role="status"` and its relation to the gap note; the gap note in the date bar does not hide any clock change note. <!-- implements FR6 of show-clock-change-note-on-location-cards -->

#### Scenario: The wall-time hint wins in its row only
- **GIVEN** the device time zone is `Asia/Almaty` and no home location is set
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains New York and Belgrade
- **WHEN** the user types `02:30` in New York
- **THEN** New York shows the wall-time hint and no clock change note
- **AND** Belgrade shows no note, since its next change on `2026-03-29` is outside the window

#### Scenario: Other rows keep their notes next to a hint
- **GIVEN** the device time zone is `Asia/Almaty` and no home location is set
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains New York and Chicago (`America/Chicago`)
- **WHEN** the user types `02:30` in New York
- **THEN** New York shows the wall-time hint and no clock change note
- **AND** Chicago shows its clock change note

#### Scenario: The note returns when the hint ends
- **GIVEN** New York shows a wall-time hint and its zone has a change inside the window
- **WHEN** the user selects a time on a day track of the same reference day
- **THEN** New York shows no wall-time hint
- **AND** New York shows its clock change note

### Requirement: Clock change note text
The clock change note SHALL be one sentence in the interface language, built from the date, the time, the tense, the direction and the amount. English: past "On {date} at {time} clocks went forward {amount}" / "On {date} at {time} clocks went back {amount}"; future "On {date} at {time} clocks will go forward {amount}" / "On {date} at {time} clocks will go back {amount}". Russian: past «{date} в {time} часы переведены на {amount} вперёд» / «… назад»; future «{date} в {time} часы переведут на {amount} вперёд» / «… назад». The amount MUST be `{h} h`, `{m} min` or `{h} h {m} min` in English and `{h} ч`, `{m} мин` or `{h} ч {m} мин` in Russian, without a zero part. The note MUST NOT name daylight saving, summer or winter time, or a zone abbreviation. All texts come from translation keys present in both locale files. <!-- implements FR2, FR8, UX2 of show-clock-change-note-on-location-cards -->

#### Scenario: Texts in both languages
- **GIVEN** the device time zone is `Europe/Belgrade`, no home location is set and the hour format is 24-hour
- **AND** the list contains Belgrade
- **WHEN** the reference moment is pinned to the instant below, in the language below
- **THEN** the Belgrade row shows the text below

| instant | language | text |
|---|---|---|
| 2026-11-01T09:00:00Z | Russian | 25 окт. в 03:00 часы переведены на 1 ч назад |
| 2026-11-01T09:00:00Z | English | On Oct 25 at 03:00 clocks went back 1 h |
| 2026-10-20T09:00:00Z | Russian | 25 окт. в 03:00 часы переведут на 1 ч назад |
| 2026-10-20T09:00:00Z | English | On Oct 25 at 03:00 clocks will go back 1 h |
| 2027-03-25T09:00:00Z | Russian | 28 мар. в 02:00 часы переведут на 1 ч вперёд |
| 2027-03-25T09:00:00Z | English | On Mar 28 at 02:00 clocks will go forward 1 h |
| 2027-03-30T09:00:00Z | Russian | 28 мар. в 02:00 часы переведены на 1 ч вперёд |
| 2027-03-30T09:00:00Z | English | On Mar 28 at 02:00 clocks went forward 1 h |

#### Scenario: Amount with hours and minutes
- **WHEN** a clock change of 90 minutes forward in the future is presented in English and in Russian
- **THEN** the amount reads `1 h 30 min` and `1 ч 30 мин`

### Requirement: Clock change note is fast, accessible and fits every screen
Presenting 50 location rows again at another minute of the same reference day SHALL look up no time zone transition and build no date, time or region name formatter, also when rows show clock change notes; the clock changes of a zone are searched at most once per reference day. A date change MUST keep looking up at most 2 time zone transitions per zone for the 50 rows of the time-selection budget (see "Time selection is fast" of the `time-selection` capability). The timing MUST be checked by the timing benchmark, whose result does not fail the pull request check. The clock change note MUST be readable text at the bottom of its card, after the day track and the location menu button, in the look of the wall-time hint; showing it MUST NOT move or resize the city, time, day track or location menu button of the card. It MUST NOT be a live region and MUST NOT be part of the row's accessible name, so a date change or a minute tick is not announced. The list with clock change notes, also next to a wall-time hint, MUST have no axe-core violations in the light and dark themes, and MUST NOT scroll horizontally at 320 px, 768 px and 2560 px in Russian, the longer of the two texts. The approved screenshots whose list shows a clock change note MUST show it at the bottom of its card. <!-- implements NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1 of show-clock-change-note-on-location-cards -->

#### Scenario: 50 rows with notes within the work bound
- **GIVEN** 50 locations, some of them with a clock change inside the window, whose rows have been presented once
- **WHEN** their rows are presented again at another minute of the same reference day
- **THEN** no time zone transition is looked up
- **AND** no date, time or region name formatter is built

#### Scenario: A new reference day searches each zone once
- **GIVEN** 50 locations whose rows have been presented at `2026-03-08T07:30:00Z` with the device time zone `UTC`
- **WHEN** the date moves to the next day and the rows are presented again
- **THEN** at most 2 time zone transitions are looked up per zone

#### Scenario: The note is not announced
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-10-20T08:00:00Z`
- **AND** the list contains Almaty and Belgrade
- **WHEN** the user opens the app
- **THEN** the Belgrade card shows "On Oct 25 at 03:00 clocks will go back 1 h" as its bottom line
- **AND** the note is not inside a live region and has no status role
- **AND** the Belgrade row's accessible name does not contain the note
- **AND** the Almaty card shows no note

#### Scenario: Showing the note moves nothing in its card
- **GIVEN** the device time zone is `Asia/Almaty` and the screen is 1024 px wide
- **AND** the current instant is `2026-10-10T08:00:00Z`
- **AND** the list contains Almaty and Belgrade, and the Belgrade card shows no clock change note
- **AND** the positions and sizes of the Belgrade city, time, day track and location menu button are noted
- **WHEN** the user picks 20 October 2026 in the calendar
- **THEN** the Belgrade card shows its clock change note
- **AND** the noted parts of the Belgrade card keep their positions and sizes within 1 px

#### Scenario: No accessibility violations with notes
- **GIVEN** the device time zone is `Asia/Almaty` and the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty, New York and Chicago
- **AND** the user typed `02:30` in New York, so New York shows the wall-time hint and Chicago its clock change note
- **WHEN** the list is shown in the light or the dark theme
- **THEN** axe-core reports no violations

#### Scenario: No horizontal scrolling with notes
- **GIVEN** the device time zone is `Asia/Almaty` and the interface language is Russian
- **AND** the list contains Almaty, Belgrade and Lord Howe Island
- **AND** the current instant is `2026-10-20T08:00:00Z` (Belgrade shows a note) or `2026-10-01T08:00:00Z` (Lord Howe Island shows a note)
- **WHEN** the screen is 320 px, 768 px or 2560 px wide
- **THEN** the locations screen does not scroll horizontally
- **AND** the note is the bottom line of the card that shows it
