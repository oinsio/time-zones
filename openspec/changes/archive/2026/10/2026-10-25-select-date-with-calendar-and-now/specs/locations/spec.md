## MODIFIED Requirements

### Requirement: UTC offset on location rows
Every location row in the Cards view SHALL show the location's UTC offset on its secondary line, after the country name. The offset MUST be derived from the location's canonical IANA identifier for the reference moment — the current instant while the moment is live, the pinned instant while it is pinned (see the `date-selection` capability) — so daylight saving time is respected for the shown date; a raw offset MUST NOT be stored or used to identify a location. The offset MUST be computed when the list is presented (the app opens, a location is added or removed, the list changes in another tab, the interface language changes, the reference moment changes), at the start of every minute while the page is visible, and when the page becomes visible again; it MUST NOT be refreshed while the page is hidden. Inputs: the location's IANA identifier, the reference moment (ISO 8601 with `Z`), the interface language. Output: the offset text. Errors: when the offset cannot be computed for the identifier, the row MUST be shown without the offset and the rest of the list MUST be unaffected. The offset needs no network and behaves the same offline. <!-- implements FR1, FR2, FR4, FR6, UX1 of show-utc-offset-on-location-rows; FR4 of show-local-time-and-date-on-location-cards; FR5 of select-date-with-calendar-and-now -->

#### Scenario: Whole-hour zone
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Moscow (`Europe/Moscow`)
- **WHEN** the user opens the app
- **THEN** the Moscow row shows `UTC+3`

#### Scenario: Half-hour zone
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Kolkata (`Asia/Kolkata`)
- **WHEN** the user opens the app
- **THEN** the Kolkata row shows `UTC+5:30`

#### Scenario: 45-minute zone
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Kathmandu (`Asia/Kathmandu`)
- **WHEN** the user opens the app
- **THEN** the Kathmandu row shows `UTC+5:45`

#### Scenario: Daylight saving time is respected
- **GIVEN** the list contains New York (`America/New_York`)
- **WHEN** the user opens the app at `2026-07-15T12:00:00Z`
- **THEN** the New York row shows `UTC−4`
- **WHEN** the user opens the app at `2026-01-15T12:00:00Z`
- **THEN** the New York row shows `UTC−5`

#### Scenario: Zero offset
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains UTC (`UTC`)
- **WHEN** the user opens the app
- **THEN** the UTC row shows `UTC`

#### Scenario: Offset is computed again when the list changes
- **GIVEN** the list contains New York (`America/New_York`)
- **AND** the app was opened at `2026-01-15T12:00:00Z`, so the New York row shows `UTC−5`
- **WHEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the user adds Kolkata
- **THEN** the New York row shows `UTC−4`
- **AND** the Kolkata row shows `UTC+5:30`

#### Scenario: Offset is computed again at the minute boundary
- **GIVEN** the list contains New York (`America/New_York`)
- **AND** the app was opened at `2026-03-08T06:59:30Z`, so the New York row shows `UTC−5`
- **WHEN** the next minute starts at `2026-03-08T07:00:00Z`
- **THEN** the New York row shows `UTC−4`

#### Scenario: Offset that cannot be computed
- **GIVEN** the list holds Moscow and a location whose zone the browser does not know (for example `Mars/Olympus_Mons`)
- **WHEN** the list is presented
- **THEN** that location's row shows its city and remove action without an offset
- **AND** the Moscow row shows `UTC+3`

### Requirement: Local time and date on location rows
Every location row in the Cards view SHALL show the location's local time and local date at the reference moment: the current instant while the moment is live, the pinned instant while it is pinned (see the `date-selection` capability). The time MUST be hours and minutes in 24-hour form with two-digit hours (`03:30`), without seconds. The date MUST be the short weekday, the day and the short month as written by the interface language's own conventions (English `Sun, Mar 8`, Russian `вс, 8 мар.`) and MUST carry the machine-readable ISO date (`2026-03-08`). Both MUST be derived from the location's canonical IANA identifier at the reference moment, so daylight saving time and :30 / :45 offsets are respected; a raw UTC offset MUST NOT be stored or used to compute them. Both MUST be computed whenever the list is presented: the app opens, a location is added, removed or moved, the list changes in another tab, the list is reset, the interface language changes, the reference moment changes. Inputs: the location's IANA identifier, the reference moment (ISO 8601 with `Z`), the interface language. Output: the time text, the date text and its ISO date. Errors: when the identifier is unknown to the browser, the row MUST be shown with its city and remove action but without time and date, and the rest of the list MUST be unaffected. Time and date need no network and behave the same offline; nothing about them is stored. <!-- implements FR1, FR2, FR5, FR6 of show-local-time-and-date-on-location-cards; FR5 of select-date-with-calendar-and-now -->

#### Scenario: Time and date of each location
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty (`Asia/Almaty`), Moscow (`Europe/Moscow`), Kathmandu (`Asia/Kathmandu`) and New York (`America/New_York`)
- **WHEN** the user opens the app
- **THEN** the rows show Almaty `12:30` `Sun, Mar 8`, Moscow `10:30` `Sun, Mar 8`, Kathmandu `13:15` `Sun, Mar 8` and New York `03:30` `Sun, Mar 8`
- **AND** every date carries the ISO date `2026-03-08`

#### Scenario: Zones on both sides of midnight
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-03-08T16:00:00Z`
- **AND** the list contains Tokyo (`Asia/Tokyo`) and New York (`America/New_York`)
- **WHEN** the user opens the app
- **THEN** the Tokyo row shows `01:00` and `Mon, Mar 9` with the ISO date `2026-03-09`
- **AND** the New York row shows `12:00` and `Sun, Mar 8` with the ISO date `2026-03-08`

#### Scenario: Russian interface
- **GIVEN** the interface language is Russian
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty
- **WHEN** the user opens the app
- **THEN** the Almaty row shows `12:30` and `вс, 8 мар.`

#### Scenario: Time is computed again when the list changes
- **GIVEN** the list contains UTC (`UTC`)
- **AND** the app was opened at `2026-07-15T12:00:42.500Z`, so the UTC row shows `12:00`
- **WHEN** the current instant is `2026-07-15T12:05:10Z` and no minute update has run since the app opened
- **AND** the user adds Moscow
- **THEN** the UTC row shows `12:05`
- **AND** the Moscow row shows `15:05`

#### Scenario: Time that cannot be computed
- **GIVEN** the list holds Moscow and a location whose zone the browser does not know (for example `Mars/Olympus_Mons`)
- **WHEN** the list is presented
- **THEN** that location's row shows its city and remove action without time and date
- **AND** the Moscow row shows its time and date

#### Scenario: Rows at a pinned moment
- **GIVEN** the interface language is English
- **AND** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and New York (`America/New_York`)
- **WHEN** the moment is pinned to `2026-03-07T07:30:00Z`
- **THEN** the Almaty row shows `12:30` and `Sat, Mar 7` with the ISO date `2026-03-07`
- **AND** the New York row shows `02:30` and `Sat, Mar 7`

### Requirement: Local time and date follow the clock
While the reference moment is live and the page is visible, the time and the date of every row SHALL change at the start of every minute of the clock: the first update MUST come at the next minute boundary after the app opens (not 60 seconds after opening), and each later one at the following minute boundary. While the page is hidden, no update MUST happen. When the page becomes visible again, every row MUST show the time and date of that instant at once, and the updates MUST resume at the next minute boundary. Every update and every return to the visible page MUST also compute the UTC offset again and read the device time zone again (see "UTC offset on location rows" and "Device time zone badge on location rows"). Updates MUST NOT write anything to storage. While the reference moment is pinned, minute updates and returns to the visible page MUST NOT change the time, the date or the UTC offset of any row — they stay those of the pinned instant — but MUST still read the device time zone again; after a return to now, the rows show the current instant at once and the minute updates change them again. <!-- implements FR3, FR4 of show-local-time-and-date-on-location-cards; FR5, FR6 of select-date-with-calendar-and-now -->

#### Scenario: The time changes at the minute boundary
- **GIVEN** the list contains UTC (`UTC`)
- **AND** the app was opened at `2026-07-15T12:00:42.500Z`, so the UTC row shows `12:00`
- **THEN** the next update is due in 17 500 ms
- **WHEN** the next minute starts at `2026-07-15T12:01:00Z`
- **THEN** the UTC row shows `12:01`
- **AND** the next update is due in 60 000 ms

#### Scenario: No updates while the page is hidden
- **GIVEN** the list contains UTC (`UTC`) and the app was opened at `2026-07-15T12:00:42.500Z`
- **WHEN** the page becomes hidden
- **THEN** no update is due
- **WHEN** the page becomes visible at `2026-07-15T12:10:20Z`
- **THEN** the UTC row shows `12:10` at once
- **AND** the next update is due in 40 000 ms

#### Scenario: The offset follows a DST change while the app is open
- **GIVEN** the list contains New York (`America/New_York`)
- **AND** the app was opened at `2026-03-08T06:59:30Z`, so the New York row shows `01:59` and `UTC−5`
- **WHEN** the next minute starts at `2026-03-08T07:00:00Z`
- **THEN** the New York row shows `03:00` and `UTC−4`

#### Scenario: Updates write nothing
- **GIVEN** the list contains UTC and the app is open
- **WHEN** three minute updates happen
- **THEN** the stored list was not written

#### Scenario: A pinned moment ignores minute updates
- **GIVEN** the device time zone is `UTC`
- **AND** the list contains UTC (`UTC`)
- **AND** the app was opened at `2026-07-15T12:00:42.500Z` and the user moved to the next day, so the UTC row shows `12:00` and `Thu, Jul 16`
- **WHEN** the next minute starts at `2026-07-15T12:01:00Z`
- **THEN** the UTC row still shows `12:00` and `Thu, Jul 16`
- **WHEN** the page becomes hidden and visible again at `2026-07-15T12:10:20Z`
- **THEN** the UTC row still shows `12:00` and `Thu, Jul 16`

#### Scenario: Rows follow the clock again after now
- **GIVEN** the device time zone is `UTC`
- **AND** the list contains UTC (`UTC`)
- **AND** the app was opened at `2026-07-15T12:00:42.500Z` and the user moved to the next day
- **WHEN** the current instant is `2026-07-15T12:00:50Z` and the user returns to now
- **THEN** the UTC row shows `12:00` and `Wed, Jul 15`
- **WHEN** the next minute starts at `2026-07-15T12:01:00Z`
- **THEN** the UTC row shows `12:01`
