# locations Specification

## Purpose
The user's own list of locations: which places the app shows, how they are added and removed, how each is identified by a canonical IANA time zone identifier, and how the list is kept on the device and across open tabs.

## Requirements

### Requirement: Location identity
A location SHALL consist of a canonical IANA time zone identifier, a city label and an ISO 3166-1 alpha-2 country code (empty for zones without a country, such as UTC). The list MUST NOT contain two locations with the same canonical identifier and the same label. A raw UTC offset MUST NOT be stored as a location's zone. <!-- implements FR8, FR9 of add-locations-via-search -->

#### Scenario: Legacy identifier is canonicalized on input
- **WHEN** a location with the zone `Asia/Calcutta` is added
- **THEN** the list holds it with the zone `Asia/Kolkata`

#### Scenario: Duplicate by canonical identifier
- **GIVEN** the list contains "Kyiv" in `Europe/Kyiv`
- **WHEN** "Kyiv" in `Europe/Kiev` is added
- **THEN** the addition is rejected as a duplicate location
- **AND** the list is unchanged

#### Scenario: Raw offset is rejected
- **WHEN** a location with the zone `+05:00` is added
- **THEN** the addition is rejected as an unknown time zone
- **AND** the list is unchanged

#### Scenario: Unknown zone is rejected
- **WHEN** a location with the zone `Mars/Olympus_Mons` is added
- **THEN** the addition is rejected as an unknown time zone

### Requirement: Add a location
Adding a location SHALL append it to the end of the list and MUST leave the order of existing locations unchanged. Inputs: time zone identifier, city label, country code. Effects: the list grows by one location at its end. Errors: duplicate location (same canonical zone and label already listed), unknown time zone (not a valid IANA identifier). <!-- implements FR8, UX4 of add-locations-via-search -->

#### Scenario: First location
- **GIVEN** the list is empty
- **WHEN** the user adds New York
- **THEN** the list contains exactly New York

#### Scenario: Order is kept
- **GIVEN** the list contains Almaty and Moscow
- **WHEN** the user adds Kolkata
- **THEN** the list is Almaty, Moscow, Kolkata in that order

### Requirement: Remove a location
Removing a location SHALL take it out of the list immediately and MUST keep the order of the remaining locations. Inputs: the location. Effects: the list shrinks by that location. Errors: location not found (it is no longer in the list, for example removed in another tab). <!-- implements FR10 of add-locations-via-search -->

#### Scenario: Remove from the middle
- **GIVEN** the list is Almaty, Moscow, Kolkata
- **WHEN** the user removes Moscow
- **THEN** the list is Almaty, Kolkata in that order

#### Scenario: Remove the last location
- **GIVEN** the list contains only Moscow
- **WHEN** the user removes Moscow
- **THEN** the list is empty

#### Scenario: Location already gone
- **GIVEN** Moscow was removed in another tab
- **WHEN** a removal of Moscow arrives
- **THEN** it is reported as location not found
- **AND** the list is unchanged

### Requirement: List in the Cards view
The Cards view SHALL show one row per location, in list order, with the city label, the country name in the interface language and a remove action whose accessible name includes the city. It MUST also offer an "Add location" action that opens the search. After a removal, focus MUST move to the next location's remove action, or the previous one, or the "Add location" action when the list becomes empty. Adding and removing MUST be announced politely without moving focus. Adding and removing a location are part of the view contract: these behaviours MUST hold for every registered view, not only Cards. <!-- implements FR10, FR17, NFR-A3, UX5 of add-locations-via-search -->

#### Scenario: Rows show city and country
- **GIVEN** the list is Almaty and Moscow and the interface language is English
- **WHEN** the user opens the app
- **THEN** two rows are shown: "Almaty" with "Kazakhstan" and "Moscow" with "Russia"

#### Scenario: Empty state after the last removal
- **GIVEN** the list contains only Moscow
- **WHEN** the user removes Moscow
- **THEN** the empty state with the "Add location" action is shown

#### Scenario: Remove action names the city
- **WHEN** the list contains Moscow
- **THEN** its remove action is announced as "Remove Moscow"

#### Scenario: Focus after removal
- **GIVEN** the list is Almaty, Moscow, Kolkata
- **WHEN** the user removes Moscow with the keyboard
- **THEN** focus is on the remove action of Kolkata
- **AND** the removal is announced politely

#### Scenario: Focus after the last removal
- **GIVEN** the list contains only Moscow
- **WHEN** the user removes Moscow with the keyboard
- **THEN** focus is on the "Add location" action

### Requirement: List is kept on the device
The list SHALL be saved on the device as a versioned document and restored in the same order when the app is opened again, also offline. Nothing MUST be written for the list until the user first changes it. A stored identifier that is a known legacy alias MUST be canonicalized on load. <!-- implements FR9, FR11, FR16, UX4 of add-locations-via-search -->

#### Scenario: List survives a reload
- **GIVEN** the user added Almaty, then Moscow
- **WHEN** the app is opened again
- **THEN** the list is Almaty, Moscow in that order

#### Scenario: First launch writes nothing
- **WHEN** the user opens the app for the first time and adds nothing
- **THEN** no list document is stored

#### Scenario: Legacy identifier is canonicalized on load
- **GIVEN** the stored list holds Kolkata in `Asia/Calcutta`
- **WHEN** the app is opened
- **THEN** the list holds Kolkata in `Asia/Kolkata`

#### Scenario: Offline reopen
- **GIVEN** the user added Almaty on an earlier visit
- **WHEN** the app is opened without a network connection
- **THEN** Almaty is shown

### Requirement: Unreadable stored list
When the stored list is not valid JSON, does not match the expected document, contains an identifier that is not a valid IANA zone, or was written by a newer version of the app, the Cards view SHALL show an error message with a reset action and MUST NOT show a blank page. Reset MUST clear the stored list and show the empty state. <!-- implements FR12 of add-locations-via-search -->

#### Scenario: Corrupted document
- **GIVEN** the stored list is not valid JSON
- **WHEN** the app is opened
- **THEN** an error message with a reset action is shown

#### Scenario: Newer version
- **GIVEN** the stored list was written with a newer document version
- **WHEN** the app is opened
- **THEN** an error message with a reset action is shown

#### Scenario: Invalid zone in the document
- **GIVEN** the stored list holds a location with the zone `+05:00`
- **WHEN** the app is opened
- **THEN** an error message with a reset action is shown

#### Scenario: Reset
- **GIVEN** the error message is shown
- **WHEN** the user resets
- **THEN** the empty state is shown
- **AND** the stored list is cleared

### Requirement: Working without storage
When storage cannot be written — unavailable from the start, or failing only when the list is saved — adding and removing SHALL still work for the session, and the existing storage warning MUST be shown. <!-- implements FR13 of add-locations-via-search -->

#### Scenario: Private mode
- **GIVEN** writing to storage fails
- **WHEN** the user adds Moscow
- **THEN** Moscow is shown in the list
- **AND** the storage warning is shown

#### Scenario: Saving the list fails later
- **GIVEN** storage worked when the app was opened and no storage warning is shown
- **AND** saving the list now fails
- **WHEN** the user adds Moscow
- **THEN** Moscow is shown in the list
- **AND** the storage warning is shown

### Requirement: Sync between open tabs
A change to the list in one open tab or window of the app SHALL appear in every other open tab without a reload. When two tabs write, the last write MUST win. <!-- implements FR14 of add-locations-via-search -->

#### Scenario: Added in another tab
- **GIVEN** the app is open in two tabs with the same list
- **WHEN** the user adds Moscow in the first tab
- **THEN** the second tab shows Moscow without a reload

#### Scenario: Removed in another tab
- **GIVEN** the app is open in two tabs and both show Moscow
- **WHEN** the user removes Moscow in the second tab
- **THEN** the first tab no longer shows Moscow

### Requirement: Location strings are localized
Every string of the list, the search and their states SHALL exist in English and Russian with identical key sets, with plural forms wherever a count is shown. <!-- implements FR18 of add-locations-via-search -->

#### Scenario: Russian interface
- **GIVEN** the interface language is Russian
- **WHEN** the list contains Moscow
- **THEN** the row shows "Россия"
- **AND** the "Add location" action reads in Russian

### Requirement: Accessible and responsive list
The list in each of its states (with locations, empty, unreadable stored list, storage unavailable) SHALL have no automated accessibility violations in light and dark themes, MUST NOT scroll horizontally from 320 px to 2560 px, and MUST match the approved screenshots at 375 px and 1024 px in both themes. <!-- implements NFR-A1, NFR-R1, NFR-R2, UX5 of add-locations-via-search -->

#### Scenario: Accessibility check
- **WHEN** each list state is checked with axe-core in light and dark theme
- **THEN** no violations are reported

#### Scenario: Narrow and wide screens
- **WHEN** each list state (with 5 locations, unreadable stored list) is shown at 320 px and 2560 px
- **THEN** there is no horizontal scrolling

#### Scenario: Screenshots
- **WHEN** the list with locations and the empty state are shown at 375 px and 1024 px in each theme
- **THEN** they match the approved screenshots

### Requirement: UTC offset on location rows
Every location row in the Cards view SHALL show the location's UTC offset on its secondary line, after the country name. The offset MUST be derived from the location's canonical IANA identifier for the current instant, so daylight saving time is respected; a raw offset MUST NOT be stored or used to identify a location. The offset MUST be computed when the list is presented (the app opens, a location is added or removed, the list changes in another tab, the interface language changes) and MUST NOT be refreshed on a timer while the page stays open. Inputs: the location's IANA identifier, the current instant (ISO 8601 with `Z`), the interface language. Output: the offset text. Errors: when the offset cannot be computed for the identifier, the row MUST be shown without the offset and the rest of the list MUST be unaffected. The offset needs no network and behaves the same offline. <!-- implements FR1, FR2, FR4, FR6, UX1 of show-utc-offset-on-location-rows -->

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

#### Scenario: Offset that cannot be computed
- **GIVEN** the list holds Moscow and a location whose zone the browser does not know (for example `Mars/Olympus_Mons`)
- **WHEN** the list is presented
- **THEN** that location's row shows its city and remove action without an offset
- **AND** the Moscow row shows `UTC+3`

### Requirement: UTC offset text
The offset text SHALL be the localized prefix followed by a sign and the whole hours, followed by `:` and the minutes as two digits only when the minutes are not zero. A positive offset MUST use `+`; a negative offset MUST use the minus sign U+2212 (`−`), never the hyphen-minus (`-`). A zero offset MUST be the prefix alone. The prefix MUST come from the locale files and exist in English and Russian (`UTC` in both). <!-- implements FR3, FR5, UX2 of show-utc-offset-on-location-rows -->

#### Scenario: Offsets are written in one form
- **WHEN** offsets of +3:00, +5:30, +5:45, −4:00, −5:30 and 0:00 are shown
- **THEN** they read `UTC+3`, `UTC+5:30`, `UTC+5:45`, `UTC−4`, `UTC−5:30` and `UTC`

#### Scenario: Negative offset uses the minus sign
- **WHEN** an offset of −5:00 is shown
- **THEN** its text contains U+2212 and no hyphen-minus

#### Scenario: Russian interface
- **GIVEN** the interface language is Russian
- **AND** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Moscow
- **WHEN** the user opens the app
- **THEN** the Moscow row shows the Russian locale's prefix followed by `+3`

### Requirement: Offsets are fast, accessible and fit every screen
Presenting 50 locations with their offsets SHALL take at most 50 ms, and the offset MUST appear in the same render as its row, with no loading state. The list with offsets MUST have no axe-core violations in the light and dark themes. A list whose offsets include `UTC+5:30`, `UTC+5:45` and a negative offset MUST NOT scroll horizontally at 320 px and 2560 px, and the approved "list" screenshots at 375 px and 1024 px in both themes MUST show the offsets. <!-- implements NFR-P1, NFR-A1, NFR-R1, NFR-R2 of show-utc-offset-on-location-rows -->

#### Scenario: 50 rows within the budget
- **GIVEN** 50 locations
- **WHEN** their rows are presented with offsets
- **THEN** it takes at most 50 ms

#### Scenario: No accessibility violations with offsets
- **GIVEN** the list contains locations with offsets
- **WHEN** the list is shown in the light or the dark theme
- **THEN** axe-core reports no violations

#### Scenario: Offsets fit narrow and wide screens
- **GIVEN** the list is Kolkata, Kathmandu and New York
- **WHEN** the list is shown at 320 px or 2560 px
- **THEN** the page does not scroll horizontally

#### Scenario: List screenshots show the offsets
- **GIVEN** the list state with Almaty and Moscow
- **WHEN** it is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the Almaty row shows `UTC+5` and the Moscow row shows `UTC+3`
- **AND** the screen matches the re-approved "list" screenshot
