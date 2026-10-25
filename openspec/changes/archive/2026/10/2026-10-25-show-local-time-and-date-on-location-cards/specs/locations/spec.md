## ADDED Requirements

### Requirement: Local time and date on location rows
Every location row in the Cards view SHALL show the location's local time and local date at the current instant. The time MUST be hours and minutes in 24-hour form with two-digit hours (`03:30`), without seconds. The date MUST be the short weekday, the day and the short month as written by the interface language's own conventions (English `Sun, Mar 8`, Russian `вс, 8 мар.`) and MUST carry the machine-readable ISO date (`2026-03-08`). Both MUST be derived from the location's canonical IANA identifier at the current instant, so daylight saving time and :30 / :45 offsets are respected; a raw UTC offset MUST NOT be stored or used to compute them. Both MUST be computed whenever the list is presented: the app opens, a location is added, removed or moved, the list changes in another tab, the list is reset, the interface language changes. Inputs: the location's IANA identifier, the current instant (ISO 8601 with `Z`), the interface language. Output: the time text, the date text and its ISO date. Errors: when the identifier is unknown to the browser, the row MUST be shown with its city and remove action but without time and date, and the rest of the list MUST be unaffected. Time and date need no network and behave the same offline; nothing about them is stored. <!-- implements FR1, FR2, FR5, FR6 of show-local-time-and-date-on-location-cards -->

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

### Requirement: Local time and date follow the clock
While the page is visible, the time and the date of every row SHALL change at the start of every minute of the clock: the first update MUST come at the next minute boundary after the app opens (not 60 seconds after opening), and each later one at the following minute boundary. While the page is hidden, no update MUST happen. When the page becomes visible again, every row MUST show the time and date of that instant at once, and the updates MUST resume at the next minute boundary. Every update and every return to the visible page MUST also compute the UTC offset again and read the device time zone again (see "UTC offset on location rows" and "Device time zone badge on location rows"). Updates MUST NOT write anything to storage. <!-- implements FR3, FR4 of show-local-time-and-date-on-location-cards -->

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

### Requirement: Local time and date layout
The time SHALL be the most prominent text of a card — larger and bolder than the city — and MUST use tabular figures; the date MUST be secondary text directly under the time. On screens narrower than 768 px the time MUST be on the city line at the right end of the card's content, before the remove action, with the date right-aligned under it. On screens 768 px and wider the time and the date MUST form a column right after the city and country column, within the left half of the card, with the date left-aligned under the time. A list with times and dates MUST NOT scroll horizontally at 320 px and 2560 px, and the approved "list" screenshots at 375 px and 1024 px in both themes, taken at the pinned instant `2026-03-08T07:30:00Z`, MUST show `12:30` on Almaty and `10:30` on Moscow with their dates. <!-- implements NFR-R1, NFR-R2, NFR-R3, UX1, UX2 of show-local-time-and-date-on-location-cards -->

#### Scenario: Narrow screen
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and Moscow
- **WHEN** the list is shown 375 px wide
- **THEN** the time `12:30` of Almaty is on its city line, right of the city, at the right end of the card's content
- **AND** the date of Almaty is under the time, right-aligned with it

#### Scenario: Wide screen
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and Moscow
- **WHEN** the list is shown 1024 px wide
- **THEN** the time `12:30` of Almaty is right of its city and country, within the left half of the card
- **AND** the date of Almaty is under the time, left-aligned with it

#### Scenario: Times fit narrow and wide screens
- **GIVEN** the list is Almaty, Kathmandu, New York and Tokyo
- **WHEN** the list is shown at 320 px or 2560 px
- **THEN** the page does not scroll horizontally

#### Scenario: List screenshots show the time and the date
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list state with Almaty and Moscow
- **WHEN** it is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the Almaty row shows `12:30` and the Moscow row shows `10:30`, each with its date
- **AND** the screen matches the re-approved "list" screenshot

### Requirement: Local time and date are fast and accessible
Presenting 50 locations with their time, date, offset and badge SHALL take at most 50 ms, and the time and the date MUST appear in the same render as their row, with no loading state. A list with times and dates MUST have no axe-core violations in the light and dark themes. The time and the date MUST be readable text of the card but MUST NOT be a live region, so minute updates are not announced; a row's accessible name MUST stay its city, followed by the device time zone badge text when the badge is shown. <!-- implements NFR-P1, NFR-A1, NFR-A2 of show-local-time-and-date-on-location-cards -->

#### Scenario: 50 rows within the budget
- **GIVEN** 50 locations
- **WHEN** their rows are presented with time and date
- **THEN** it takes at most 50 ms

#### Scenario: No accessibility violations with times
- **GIVEN** the list contains locations with times and dates
- **WHEN** the list is shown in the light or the dark theme
- **THEN** axe-core reports no violations

#### Scenario: Time does not change the row name and is not announced
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** the Almaty row is named "Almaty Your time zone" and the Moscow row is named "Moscow"
- **AND** the time of Almaty is not inside a live region

## MODIFIED Requirements

### Requirement: UTC offset on location rows
Every location row in the Cards view SHALL show the location's UTC offset on its secondary line, after the country name. The offset MUST be derived from the location's canonical IANA identifier for the current instant, so daylight saving time is respected; a raw offset MUST NOT be stored or used to identify a location. The offset MUST be computed when the list is presented (the app opens, a location is added or removed, the list changes in another tab, the interface language changes), at the start of every minute while the page is visible, and when the page becomes visible again; it MUST NOT be refreshed while the page is hidden. Inputs: the location's IANA identifier, the current instant (ISO 8601 with `Z`), the interface language. Output: the offset text. Errors: when the offset cannot be computed for the identifier, the row MUST be shown without the offset and the rest of the list MUST be unaffected. The offset needs no network and behaves the same offline. <!-- implements FR1, FR2, FR4, FR6, UX1 of show-utc-offset-on-location-rows; FR4 of show-local-time-and-date-on-location-cards -->

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

### Requirement: Device time zone badge on location rows
A location row SHALL show a "Your time zone" badge next to its city name when the location's canonical IANA identifier equals the device time zone; every matching row MUST show it and no other row MAY show it. Equality MUST be by canonical IANA identifier, never by UTC offset or equal rules. The device time zone MUST be read through the app's time abstraction when the app starts, at the start of every minute while the page is visible, and when the page becomes visible again, and canonicalized each time; an identifier the browser does not know MUST be treated as `UTC`. The device time zone MUST NOT be stored and MUST NOT be read on list changes between those moments. Adding, removing, moving or resetting locations and changes from another tab MUST keep the rule true for every row. Inputs: the listed locations' canonical identifiers and the device time zone identifier. Output: which rows show the badge. Errors: none — an unknown device identifier falls back to `UTC`. The badge needs no network and behaves the same offline. <!-- implements FR1, FR2, FR3, FR4, UX1 of mark-device-time-zone-in-location-list; FR4 of show-local-time-and-date-on-location-cards -->

#### Scenario: One row matches
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty (`Asia/Almaty`) and Moscow (`Europe/Moscow`)
- **WHEN** the user opens the app
- **THEN** the Almaty row shows the badge
- **AND** the Moscow row shows no badge

#### Scenario: No row matches
- **GIVEN** the device time zone is `Asia/Tokyo`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** no row shows the badge

#### Scenario: Several rows match
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the list contains Moscow (`Europe/Moscow`), Saint Petersburg (`Europe/Moscow`) and Almaty (`Asia/Almaty`)
- **WHEN** the user opens the app
- **THEN** the Moscow and the Saint Petersburg rows show the badge
- **AND** the Almaty row shows no badge

#### Scenario: Legacy device identifier
- **GIVEN** the device reports the time zone `Asia/Calcutta`
- **AND** the list contains Kolkata (`Asia/Kolkata`) and Moscow
- **WHEN** the user opens the app
- **THEN** the Kolkata row shows the badge
- **AND** the Moscow row shows no badge

#### Scenario: Unknown device identifier
- **GIVEN** the device reports the time zone `Mars/Olympus_Mons`
- **AND** the list contains UTC (`UTC`) and Moscow
- **WHEN** the user opens the app
- **THEN** the UTC row shows the badge
- **AND** the Moscow row shows no badge

#### Scenario: Badge follows changes of the list
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Moscow
- **WHEN** the user adds Almaty
- **THEN** the Almaty row shows the badge
- **WHEN** the user removes Almaty
- **THEN** no row shows the badge

#### Scenario: Device zone is read once
- **GIVEN** the device time zone is `Asia/Almaty` when the app opens
- **AND** the list contains Almaty and Moscow
- **WHEN** the device time zone becomes `Europe/Moscow` before the next minute starts
- **AND** the user adds Tokyo
- **THEN** the Almaty row still shows the badge
- **AND** the Moscow row shows no badge

#### Scenario: Device zone is read again at the minute boundary
- **GIVEN** the device time zone is `Asia/Almaty` when the app opens
- **AND** the list contains Almaty and Moscow
- **WHEN** the device time zone becomes `Europe/Moscow`
- **AND** the next minute starts
- **THEN** the Moscow row shows the badge
- **AND** the Almaty row shows no badge

#### Scenario: Device zone is read again when the page becomes visible
- **GIVEN** the device time zone is `Asia/Almaty` when the app opens
- **AND** the list contains Almaty and Moscow
- **AND** the page is hidden
- **WHEN** the device time zone becomes `Europe/Moscow`
- **AND** the page becomes visible
- **THEN** the Moscow row shows the badge
- **AND** the Almaty row shows no badge

#### Scenario: Device zone is not stored
- **GIVEN** the device time zone is `Asia/Almaty`
- **WHEN** the user adds Almaty
- **THEN** the stored list document holds only the locations, without the device time zone
