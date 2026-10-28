## RENAMED Requirements

- FROM: `### Requirement: Device time zone badge on location rows`
- TO: `### Requirement: Here mark on location rows`

- FROM: `### Requirement: Device time zone badge text`
- TO: `### Requirement: Here mark text`

- FROM: `### Requirement: Device time zone badge is accessible and fits every screen`
- TO: `### Requirement: Here mark is accessible and fits every screen`

## MODIFIED Requirements

### Requirement: Here mark on location rows
A location row SHALL show the "here" mark when the location's canonical IANA identifier equals the device time zone. Every matching row MUST show it and no other row MAY show it. The mark MUST have two parts on the city line: a location-arrow icon before the city name, and a "here" caption right after the city name. A row without the mark MUST show neither part, and its city MUST start the line with no empty space reserved for an icon. No row MAY show the former "Your time zone" pill in any language. Equality MUST be by canonical IANA identifier, never by UTC offset or equal rules. The device time zone MUST be read through the app's time abstraction when the app starts, at the start of every minute while the page is visible, and when the page becomes visible again, and canonicalized each time. An identifier the browser does not know MUST be treated as `UTC`. The device time zone MUST NOT be stored and MUST NOT be read on list changes between those moments. Adding, removing, moving or resetting locations and changes from another tab MUST keep the rule true for every row. Inputs: the listed locations' canonical identifiers and the device time zone identifier. Output: which rows show the mark. Errors: none; an unknown device identifier falls back to `UTC`. The mark needs no network and behaves the same offline. <!-- implements FR1, FR2, FR3, FR4, UX1 of mark-device-time-zone-in-location-list; FR4 of show-local-time-and-date-on-location-cards; FR1, FR2, FR5, UX3 of match-here-mark-to-design -->

#### Scenario: One row matches
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty (`Asia/Almaty`) and Moscow (`Europe/Moscow`)
- **WHEN** the user opens the app
- **THEN** the Almaty row shows the here mark
- **AND** the Moscow row shows no here mark

#### Scenario: Icon before the city, caption after it
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** on the Almaty row the location-arrow icon comes before the city name and the caption "here" comes right after it
- **AND** the Moscow row's city line starts with the city name

#### Scenario: The former pill is gone
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the list contains Moscow, Saint Petersburg and Almaty
- **WHEN** the user opens the app
- **THEN** exactly 2 rows show the here mark
- **AND** no row shows the text "Your time zone"

#### Scenario: No row matches
- **GIVEN** the device time zone is `Asia/Tokyo`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** no row shows the here mark

#### Scenario: Several rows match
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the list contains Moscow (`Europe/Moscow`), Saint Petersburg (`Europe/Moscow`) and Almaty (`Asia/Almaty`)
- **WHEN** the user opens the app
- **THEN** the Moscow and the Saint Petersburg rows show the here mark
- **AND** the Almaty row shows no here mark

#### Scenario: Legacy device identifier
- **GIVEN** the device reports the time zone `Asia/Calcutta`
- **AND** the list contains Kolkata (`Asia/Kolkata`) and Moscow
- **WHEN** the user opens the app
- **THEN** the Kolkata row shows the here mark
- **AND** the Moscow row shows no here mark

#### Scenario: Unknown device identifier
- **GIVEN** the device reports the time zone `Mars/Olympus_Mons`
- **AND** the list contains UTC (`UTC`) and Moscow
- **WHEN** the user opens the app
- **THEN** the UTC row shows the here mark
- **AND** the Moscow row shows no here mark

#### Scenario: Badge follows changes of the list
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Moscow
- **WHEN** the user adds Almaty
- **THEN** the Almaty row shows the here mark
- **WHEN** the user removes Almaty
- **THEN** no row shows the here mark

#### Scenario: Device zone is read once
- **GIVEN** the device time zone is `Asia/Almaty` when the app opens
- **AND** the list contains Almaty and Moscow
- **WHEN** the device time zone becomes `Europe/Moscow` before the next minute starts
- **AND** the user adds Tokyo
- **THEN** the Almaty row still shows the here mark
- **AND** the Moscow row shows no here mark

#### Scenario: Device zone is read again at the minute boundary
- **GIVEN** the device time zone is `Asia/Almaty` when the app opens
- **AND** the list contains Almaty and Moscow
- **WHEN** the device time zone becomes `Europe/Moscow`
- **AND** the next minute starts
- **THEN** the Moscow row shows the here mark
- **AND** the Almaty row shows no here mark

#### Scenario: Device zone is read again when the page becomes visible
- **GIVEN** the device time zone is `Asia/Almaty` when the app opens
- **AND** the list contains Almaty and Moscow
- **AND** the page is hidden
- **WHEN** the device time zone becomes `Europe/Moscow`
- **AND** the page becomes visible
- **THEN** the Moscow row shows the here mark
- **AND** the Almaty row shows no here mark

#### Scenario: Device zone is not stored
- **GIVEN** the device time zone is `Asia/Almaty`
- **WHEN** the user adds Almaty
- **THEN** the stored list document holds only the locations, without the device time zone

### Requirement: Here mark text
The mark's texts SHALL come from the locale files and exist in English and Russian with identical key sets. The visible caption MUST be "here" in English and "здесь" in Russian. The accessible label MUST be "You are here" in English and "Вы здесь" in Russian. No locale MAY keep the former "Your time zone" text. The icon MUST be the filled location arrow in the accent colour. The caption MUST be accent-coloured text without a background or a border, bold, and smaller than the city name. <!-- implements FR5, UX2 of mark-device-time-zone-in-location-list; FR2, FR3, UX1, UX2 of match-here-mark-to-design -->

#### Scenario: English interface
- **GIVEN** the interface language is English
- **AND** the device time zone is `Asia/Almaty` and the list contains Almaty
- **WHEN** the user opens the app
- **THEN** the Almaty row shows the caption "here"

#### Scenario: Russian interface
- **GIVEN** the interface language is Russian
- **AND** the device time zone is `Asia/Almaty` and the list contains Almaty
- **WHEN** the user opens the app
- **THEN** the Almaty row shows the caption "здесь"

### Requirement: Here mark is accessible and fits every screen
The accessible name of a row that shows the mark SHALL be its city followed by the mark's accessible label ("Almaty You are here"). A row without the mark MUST be named by its city alone. The icon MUST be exposed to assistive technology as an image named by the accessible label. The caption MUST be hidden from assistive technology, so the mark is not announced twice. Presenting 50 locations with the mark rule MUST take at most 50 ms, and the mark MUST appear in the same render as its row, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: presenting 50 rows for the first time in a language MUST build at most 3 date and time formatters per distinct time zone and at most 1 region name formatter. A list with a marked row MUST have no axe-core violations in the light and dark themes, MUST NOT scroll horizontally at 320 px and 2560 px, and the approved screenshots of the list, pinned, calendar and time-selected states at 375 px and 1024 px in both themes MUST show the mark on the matching row. <!-- implements NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2 of mark-device-time-zone-in-location-list; FR2, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks; NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2 of match-here-mark-to-design -->

#### Scenario: Row name includes the badge
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** the Almaty row is named "Almaty You are here"
- **AND** the Moscow row is named "Moscow"

#### Scenario: 50 rows within the budget
- **GIVEN** 50 locations and a device time zone that matches some of them
- **AND** no row has been presented yet
- **WHEN** their rows are presented
- **THEN** at most 3 date and time formatters are built per distinct time zone
- **AND** at most 1 region name formatter is built

#### Scenario: No accessibility violations with the badge
- **GIVEN** the device time zone is `Asia/Almaty` and the list contains Almaty and Moscow
- **WHEN** the list is shown in the light or the dark theme
- **THEN** axe-core reports no violations

#### Scenario: Badge fits narrow and wide screens
- **GIVEN** the device time zone is `Asia/Almaty` and the list contains Almaty, Kathmandu and New York
- **WHEN** the list is shown at 320 px or 2560 px
- **THEN** the page does not scroll horizontally

#### Scenario: List screenshots show the badge
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow
- **WHEN** the list, pinned, calendar or time-selected state is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the Almaty row shows the here mark and the Moscow row does not
- **AND** the screen matches the re-approved screenshot

### Requirement: Local time and date are fast and accessible
Presenting 50 locations with their time, date, offset and here mark SHALL take at most 50 ms, and the time and the date MUST appear in the same render as their row, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: presenting 50 rows again, in the same language and for the same reference day, MUST build no date, time or region name formatter. The time and date labels MUST stay identical, character for character, in English and Russian. A list with times and dates MUST have no axe-core violations in the light and dark themes. The time and the date MUST be readable text of the card but MUST NOT be a live region, so minute updates are not announced. A row's accessible name MUST stay its city, followed by the here mark's accessible label when the mark is shown. <!-- implements NFR-P1, NFR-A1, NFR-A2 of show-local-time-and-date-on-location-cards; FR1, FR5, FR6, NFR-P1, UX1 of replace-wall-clock-row-budgets-with-deterministic-checks; NFR-A1 of match-here-mark-to-design -->

#### Scenario: 50 rows within the budget
- **GIVEN** 50 locations whose rows have been presented with time and date once
- **WHEN** their rows are presented with time and date again
- **THEN** no date, time or region name formatter is built

#### Scenario: Labels are unchanged by formatter reuse
- **GIVEN** the list contains Kolkata, Kathmandu and New York
- **WHEN** their rows are presented at `2026-07-15T12:00:00Z` in English and then in Russian
- **THEN** each row shows the same time and date labels as the platform's own date formatting gives for that zone, with each label's format, in the same language, without the shared formatters

#### Scenario: No accessibility violations with times
- **GIVEN** the list contains locations with times and dates
- **WHEN** the list is shown in the light or the dark theme
- **THEN** axe-core reports no violations

#### Scenario: Time does not change the row name and is not announced
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** the Almaty row is named "Almaty You are here" and the Moscow row is named "Moscow"
- **AND** the time of Almaty is not inside a live region

### Requirement: Local time and date follow the clock
While the reference moment is live and the page is visible, the time and the date of every row SHALL change at the start of every minute of the clock: the first update MUST come at the next minute boundary after the app opens (not 60 seconds after opening), and each later one at the following minute boundary. While the page is hidden, no update MUST happen. When the page becomes visible again, every row MUST show the time and date of that instant at once, and the updates MUST resume at the next minute boundary. Every update and every return to the visible page MUST also compute the UTC offset again and read the device time zone again (see "UTC offset on location rows" and "Here mark on location rows"). Updates MUST NOT write anything to storage. While the reference moment is pinned, minute updates and returns to the visible page MUST NOT change the time, the date or the UTC offset of any row — they stay those of the pinned instant — but MUST still read the device time zone again; after a return to now, the rows show the current instant at once and the minute updates change them again. <!-- implements FR3, FR4 of show-local-time-and-date-on-location-cards; FR5, FR6 of select-date-with-calendar-and-now; FR5 of match-here-mark-to-design -->

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

## ADDED Requirements

### Requirement: One leading mark per row
A location row SHALL show at most one leading mark, in the slot before the city name. The mark's kind MUST decide its icon, its accessible label and whether it has a visible caption. Every kind the app knows MUST have an icon and an accessible label defined in both locales. A kind with a caption MUST have the caption defined in both locales too. In this change the only kind is "here" (location arrow, label "You are here", caption "here"). Inputs: the row's location and the device time zone. Output: the row's mark kind, or none. Errors: none. A later kind, such as home, MUST take the same slot and MUST NOT add a second leading icon to a row. <!-- implements FR4 of match-here-mark-to-design -->

#### Scenario: A marked row has exactly one leading icon
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** the Almaty row has exactly 1 leading mark, of the kind "here"
- **AND** the Moscow row has no leading mark

#### Scenario: Every mark kind is fully defined
- **GIVEN** the set of mark kinds the app knows
- **WHEN** each kind is presented in English and in Russian
- **THEN** each kind has an icon and a non-empty accessible label
- **AND** each kind with a caption has a non-empty caption
