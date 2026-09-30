# Spec Delta

## Purpose

The user's own list of locations: which places the app shows, how they are added and removed, how each is identified by a canonical IANA time zone identifier, and how the list is kept on the device and across open tabs.

## ADDED Requirements

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
- **AND** nothing is stored

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
- **THEN** the list is empty and the empty state is shown

#### Scenario: Location already gone
- **GIVEN** Moscow was removed in another tab
- **WHEN** a removal of Moscow arrives
- **THEN** it is reported as location not found
- **AND** the list is unchanged

### Requirement: List in the Cards view
The Cards view SHALL show one row per location, in list order, with the city label, the country name in the interface language and a remove action whose accessible name includes the city. It MUST also offer an "Add location" action that opens the search. After a removal, focus MUST move to the next location's remove action, or the previous one, or the "Add location" action when the list becomes empty. Adding and removing MUST be announced politely without moving focus. <!-- implements FR10, FR17, NFR-A3, UX5 of add-locations-via-search -->

#### Scenario: Rows show city and country
- **GIVEN** the list is Almaty and Moscow and the interface language is English
- **WHEN** the user opens the app
- **THEN** two rows are shown: "Almaty" with "Kazakhstan" and "Moscow" with "Russia"

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
When storage cannot be written, adding and removing SHALL still work for the session, and the existing storage warning MUST be shown. <!-- implements FR13 of add-locations-via-search -->

#### Scenario: Private mode
- **GIVEN** writing to storage fails
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
- **THEN** the row shows "Россия" and the remove action and the "Add location" action are in Russian

### Requirement: Accessible and responsive list
The list in each of its states (with locations, empty, unreadable stored list, storage unavailable) SHALL have no automated accessibility violations in light and dark themes, MUST NOT scroll horizontally from 320 px to 2560 px, and MUST match the approved screenshots at 375 px and 1024 px in both themes. <!-- implements NFR-A1, NFR-R1, NFR-R2, UX5 of add-locations-via-search -->

#### Scenario: Accessibility check
- **WHEN** each list state is checked with axe-core in light and dark theme
- **THEN** no violations are reported

#### Scenario: Narrow and wide screens
- **WHEN** the list with 5 locations is shown at 320 px and 2560 px
- **THEN** there is no horizontal scrolling

#### Scenario: Screenshots
- **WHEN** the list with locations and the empty state are shown at 375 px and 1024 px in each theme
- **THEN** they match the approved screenshots
