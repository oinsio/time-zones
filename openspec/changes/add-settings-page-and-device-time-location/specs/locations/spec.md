# Spec Delta

## MODIFIED Requirements

### Requirement: Location identity
A location SHALL be of one of two kinds. A city location consists of a canonical IANA time zone identifier, a city label and an ISO 3166-1 alpha-2 country code (empty for zones without a country, such as UTC). The device time location consists of its kind only: its zone is always the device time zone, and it has no stored zone, label or country (see "Device time location"). The list MUST NOT contain two city locations with the same canonical identifier and the same label, and MUST NOT contain more than one device time location. A city location and the device time location are never duplicates of each other, also when they are in the same zone. A raw UTC offset MUST NOT be stored as a location's zone. <!-- implements FR8, FR9 of add-locations-via-search; FR8 of add-settings-page-and-device-time-location -->

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

#### Scenario: The device's city next to the device time location
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is the device time location
- **WHEN** the user adds Almaty (`Asia/Almaty`)
- **THEN** the list is the device time location, Almaty

### Requirement: List in the Cards view
The Cards view SHALL show one row per location, in list order, the device time location included. A city location's row shows the city label and the country name in the interface language. Every row has a location menu whose accessible name includes the city ("Actions for Moscow", «Действия: Москва»). The menu holds the remove action "Remove" («Удалить») and the home action of the `home-location` capability. The header's Add location button opens the search (see the `main-page` capability). After a removal, focus MUST move to the next location's menu button, or the previous one, or the header's Add location button when the list becomes empty. Adding and removing MUST be announced politely without moving focus. Adding and removing a location are part of the view contract: these behaviours MUST hold for every registered view, not only Cards. <!-- implements FR10, FR17, NFR-A3, UX5 of add-locations-via-search ; FR11, NFR-A2 of set-home-location-and-show-differences; FR2, FR9, FR13 of add-settings-page-and-device-time-location -->

#### Scenario: Rows show city and country
- **GIVEN** the list is Almaty and Moscow and the interface language is English
- **WHEN** the user opens the app
- **THEN** two rows are shown: "Almaty" with "Kazakhstan" and "Moscow" with "Russia"

#### Scenario: Empty state after the last removal
- **GIVEN** the list contains only Moscow
- **WHEN** the user removes Moscow
- **THEN** the empty-state explanation is shown
- **AND** the header's Add location button is shown

#### Scenario: Remove action names the city
- **WHEN** the list contains Moscow
- **THEN** its location menu button is announced as "Actions for Moscow"
- **AND** the open menu offers "Remove"

#### Scenario: Focus after removal
- **GIVEN** the list is Almaty, Moscow, Kolkata
- **WHEN** the user removes Moscow with the keyboard
- **THEN** focus is on the location menu button of Kolkata
- **AND** the removal is announced politely

#### Scenario: Focus after the last removal
- **GIVEN** the list contains only Moscow
- **WHEN** the user removes Moscow with the keyboard
- **THEN** focus is on the header's Add location button

### Requirement: List is kept on the device
The list SHALL be saved on the device as a versioned document, together with the home location, and restored in the same order when the app is opened again, also offline. The device time location is stored as an entry of its kind without a zone, so the device time zone itself is never stored. When no locations document is stored, the list MUST be the first-launch list (see "First-launch list"). A stored empty list MUST be restored as an empty list. A document of version 1 or 2 MUST be migrated on load: the device time location is put first, the other locations keep their order, a version 2 home is kept and a version 1 document has no home. Nothing MUST be written for the list until the user first changes it or the home location. A stored identifier that is a known legacy alias MUST be canonicalized on load. <!-- implements FR9, FR11, FR16, UX4 of add-locations-via-search ; FR8 of set-home-location-and-show-differences; FR12, FR13, FR14 of add-settings-page-and-device-time-location -->

#### Scenario: List survives a reload
- **GIVEN** the user added Almaty, then Moscow
- **WHEN** the app is opened again
- **THEN** the list is the device time location, Almaty, Moscow in that order

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

#### Scenario: Previous document version is migrated
- **GIVEN** the stored list is a version 1 document with Almaty, Moscow and Kolkata
- **WHEN** the app is opened
- **THEN** the list is the device time location, Almaty, Moscow, Kolkata in that order
- **AND** no location is home
- **AND** the stored list was not written

#### Scenario: Version 2 document is migrated
- **GIVEN** the stored list is a version 2 document with Moscow and New York and Moscow as home
- **WHEN** the app is opened
- **THEN** the list is the device time location, Moscow, New York in that order
- **AND** Moscow is home
- **AND** the stored list was not written

#### Scenario: The device time zone is not stored
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is the device time location
- **WHEN** the user adds Moscow and the list is written
- **THEN** the stored document holds no `Asia/Almaty`

### Requirement: Unreadable stored list
When the stored list is not valid JSON, does not match the expected document, contains an identifier that is not a valid IANA zone, holds an entry of an unknown kind or more than one device time location, or was written by a newer version of the app, the Cards view SHALL show an error message with a reset action and MUST NOT show a blank page. A stored home location that points to a location missing from the stored list MUST NOT make the list unreadable: home is cleared on load and the list is shown (see the `home-location` capability). A home that is not a location identifier at all (for example a number) MUST make the list unreadable. Reset MUST clear the stored list and show the first-launch list without writing it. <!-- implements FR12 of add-locations-via-search ; FR9 of set-home-location-and-show-differences; FR12 of add-settings-page-and-device-time-location -->

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

#### Scenario: Two device time locations
- **GIVEN** the stored list holds two device time location entries
- **WHEN** the app is opened
- **THEN** an error message with a reset action is shown

#### Scenario: Reset
- **GIVEN** the error message is shown
- **WHEN** the user resets
- **THEN** the list is the device time location only
- **AND** the stored list is cleared

#### Scenario: Home of the wrong type
- **GIVEN** the stored list holds Almaty and its home is the number `5`
- **WHEN** the app is opened
- **THEN** an error message with a reset action is shown

### Requirement: Local time and date on location rows
Every location row in the Cards view SHALL show the location's local time and local date at the reference moment: the current instant while the moment is live, the pinned instant while it is pinned (see the `date-selection` capability). The time MUST be hours and minutes without seconds, written in the hour format (see the `settings` capability): in 24-hour format with two-digit hours (`03:30`), in 12-hour format with the hour and a day period marker by the interface language's conventions (`3:30 AM`). The date MUST be the short weekday, the day and the short month as written by the interface language's own conventions (English `Sun, Mar 8`, Russian `вс, 8 мар.`) and MUST carry the machine-readable ISO date (`2026-03-08`). Both MUST be derived from the location's canonical IANA identifier at the reference moment, so daylight saving time and :30 / :45 offsets are respected; a raw UTC offset MUST NOT be stored or used to compute them. Both MUST be computed whenever the list is presented: the app opens, a location is added, removed or moved, the list changes in another tab, the list is reset, the interface language or the hour format changes, the reference moment changes. Inputs: the location's IANA identifier, the reference moment (ISO 8601 with `Z`), the interface language, the hour format. Output: the time text, the date text and its ISO date. Errors: when the identifier is unknown to the browser, the row MUST be shown with its city and remove action but without time and date, and the rest of the list MUST be unaffected. Time and date need no network and behave the same offline; nothing about them is stored. <!-- implements FR1, FR2, FR5, FR6 of show-local-time-and-date-on-location-cards; FR5 of select-date-with-calendar-and-now; FR5 of add-settings-page-and-device-time-location -->

#### Scenario: Time and date of each location
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty (`Asia/Almaty`), Moscow (`Europe/Moscow`), Kathmandu (`Asia/Kathmandu`) and New York (`America/New_York`)
- **WHEN** the user opens the app
- **THEN** the rows show Almaty `12:30` `Sun, Mar 8`, Moscow `10:30` `Sun, Mar 8`, Kathmandu `13:15` `Sun, Mar 8` and New York `03:30` `Sun, Mar 8`
- **AND** every date carries the ISO date `2026-03-08`

#### Scenario: Time in the 12-hour format
- **GIVEN** the interface language is English
- **AND** the hour format is 12-hour
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Kathmandu (`Asia/Kathmandu`) and New York (`America/New_York`)
- **WHEN** the user opens the app
- **THEN** the rows show Kathmandu `1:15 PM` and New York `3:30 AM`

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

## ADDED Requirements

### Requirement: Device time location
The device time location SHALL be a location of the list whose zone is the device time zone. Its row MUST show the Here mark with its "here" caption (the Home mark instead while it is home), the city of the device time zone, the meta line "Device time · {UTC offset}" («Время устройства · {UTC offset}») in place of the country and UTC offset, the local time and date at the effective instant, its offset difference by the rule of every location row, and a day track on the shared reference day. Its zone MUST change in the same render whenever the device time zone is read with a new value: at start, at every minute tick and when the page becomes visible. An unknown device time zone MUST be shown as `UTC`. Inputs: the device time zone, the effective instant, the reference zone. Output: the row. Errors: none. <!-- implements FR8, UX3 of add-settings-page-and-device-time-location -->

#### Scenario: Device time location on the design sample
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the zone cities data is loaded
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is the device time location, Moscow, Kolkata, New York
- **WHEN** the user opens the app
- **THEN** the first row shows `Алматы`, the caption `здесь`, the meta line `Время устройства · UTC+5`, the time `12:30`, the date `вс, 8 мар.` and no offset difference
- **AND** Moscow shows `−2 ч`, Kolkata `+0:30` and New York `−9 ч`

#### Scenario: The device moves to another zone
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is English
- **AND** the list is the device time location, New York
- **WHEN** the device time zone becomes `Europe/Moscow` and the minute tick reads it
- **THEN** the first row shows `Moscow` and the meta line `Device time · UTC+3`
- **AND** the list is still the device time location, New York

#### Scenario: Unknown device time zone
- **GIVEN** the device reports the time zone `Mars/Olympus_Mons`
- **AND** the interface language is English
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the row shows `UTC`, the caption `here` and the meta line `Device time · UTC`

### Requirement: Device time location has the controls of every card
The device time location's row SHALL have the same controls as a city location's row: a drag handle, keyboard reorder and a location menu with the home action (Make home or Clear home) and Remove. It MUST be an item of the numbered location list, and reorder positions and announcements MUST count it like any location. Removing it MUST take it out of the list and keep the order of the others. Inputs: the user's reorder, home and remove actions. Effects: as for any location. Errors: location not found when it is no longer in the list. <!-- implements FR9, UX3 of add-settings-page-and-device-time-location -->

#### Scenario: Same menu as a city card
- **GIVEN** the interface language is English
- **AND** the list is the device time location, Moscow
- **WHEN** the user opens the device time location's menu
- **THEN** it offers "Make home" and "Remove", the same items as Moscow's menu

#### Scenario: Reorder below a city
- **GIVEN** the list is the device time location, Moscow, New York
- **WHEN** the user moves the device time location to the last position with the keyboard
- **THEN** the list is Moscow, New York, the device time location
- **AND** the announcement says it is at position 3 of 3

#### Scenario: Remove the device time location
- **GIVEN** the list is the device time location, Moscow
- **WHEN** the user removes the device time location
- **THEN** the list is Moscow

### Requirement: Add the device time location
Adding the device time location SHALL append it to the end of the list and MUST leave the order of existing locations unchanged. Inputs: none. Effects: the list grows by the device time location at its end. Errors: duplicate location when the list already holds the device time location. <!-- implements FR8, FR11 of add-settings-page-and-device-time-location -->

#### Scenario: Add it back
- **GIVEN** the list is Moscow
- **WHEN** the user adds the device time location
- **THEN** the list is Moscow, the device time location

#### Scenario: Already listed
- **GIVEN** the list is the device time location, Moscow
- **WHEN** the device time location is added
- **THEN** the addition is rejected as a duplicate location
- **AND** the list is unchanged

### Requirement: First-launch list
When no locations document is stored, the location list SHALL be the first-launch list: the device time location only, with no home. Showing it MUST NOT write the list. The first-launch list MUST also be shown after Reset of an unreadable stored list and when another tab clears the stored list. <!-- implements FR12 of add-settings-page-and-device-time-location -->

#### Scenario: First launch
- **GIVEN** no locations document is stored
- **AND** the device time zone is `Asia/Almaty`
- **WHEN** the user opens the app
- **THEN** the list is the device time location only
- **AND** no location is home
- **AND** no list document is stored

### Requirement: An emptied list stays empty
The user SHALL be able to remove every location, the device time location included. The empty list MUST be stored and restored as empty on the next launch, without the device time location. <!-- implements FR13 of add-settings-page-and-device-time-location -->

#### Scenario: Remove everything and reopen
- **GIVEN** the list is the device time location, Moscow
- **WHEN** the user removes Moscow and the device time location
- **AND** the app is opened again
- **THEN** the list is empty
- **AND** the empty-state explanation is shown

### Requirement: Select a time on the device time location
The device time location's day track and wall-time input SHALL select a time exactly as a city location's do, by pointer, by tap on engines without Pointer Events, and by keys. A wall-time hint on the device time location MUST end when the device time zone changes. <!-- implements FR8, FR9 of add-settings-page-and-device-time-location -->

#### Scenario: Time selection from the device time location
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is the device time location, Moscow
- **WHEN** the user moves the device time location's day track one hour forward
- **THEN** the device time location shows `13:30`
- **AND** Moscow shows `11:30`
- **AND** the Now button is active

### Requirement: Exemplar city of the device time location
The device time location SHALL be named by the exemplar city of the device time zone in the interface language. The zone cities data MUST be loaded in the background only while the device time location is in the list or the search is open, and showing the device time location MUST NOT wait for it. Until the data is loaded, or when loading fails, the city MUST be derived from the time zone ID, with no error shown. On an engine that rejects the canonical device time zone but accepts a legacy name of it, the exemplar city MUST be looked up by the canonical ID and the time, date and day track shown through the legacy name. The search MUST reuse data already loaded, so the page requests the data at most once while no load fails. <!-- implements FR8, NFR-P2 of add-settings-page-and-device-time-location -->

#### Scenario: Derived city first, exemplar city after loading
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the zone cities data has not been loaded
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the device time location shows `Almaty`
- **WHEN** the zone cities data finishes loading
- **THEN** the device time location shows `Алматы`

#### Scenario: Loading fails
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** loading the zone cities data fails
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the device time location shows `Almaty`
- **AND** no error is shown

#### Scenario: No load without the device time location
- **GIVEN** the stored list is Almaty
- **WHEN** the user opens the app and does not open the search
- **THEN** the zone cities data is not requested

#### Scenario: Renamed device time zone
- **GIVEN** the engine rejects `Europe/Kyiv` and accepts `Europe/Kiev`
- **AND** the device reports the time zone `Europe/Kiev`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the device time location shows `Kyiv`, the time `09:30` and the meta line `Device time · UTC+2`

### Requirement: Device time location strings are localized
Every string of the device time location SHALL exist in English and Russian: the meta line "Device time" («Время устройства») and its accessible name. <!-- implements FR16 of add-settings-page-and-device-time-location -->

#### Scenario: Both languages
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is the device time location
- **WHEN** the interface language is switched between English and Russian
- **THEN** the meta line reads `Device time · UTC+5` and `Время устройства · UTC+5`

### Requirement: Device time location in every view
Showing, reordering, making home and removing the device time location are part of the view contract (ADR-0002). For every registered view, the device time location MUST be shown at its list position with its time, and its remove, reorder and home actions MUST work. <!-- implements FR17 of add-settings-page-and-device-time-location -->

#### Scenario: Device time location under contract
- **GIVEN** the view under contract is shown
- **AND** the device time zone is `Asia/Almaty`
- **AND** the current time is `2026-03-08T07:30:00Z`
- **AND** the stored locations are Moscow, the device time location
- **WHEN** the user opens the app
- **THEN** the second row is the device time location showing `12:30`
- **WHEN** the user moves it to the first position, makes it home and then removes it
- **THEN** the list is Moscow and no location is home

### Requirement: Device time location is fast
The device time location SHALL cost no more work than one city location row: presenting 50 location rows with the device time location again MUST build no formatter, and the device time location MUST use no more time zone transition lookups than one city location row. <!-- implements NFR-P1 of add-settings-page-and-device-time-location -->

#### Scenario: Presenting again builds no formatter
- **GIVEN** 50 locations and the device time location have been presented
- **WHEN** the same rows are presented again for the next minute tick
- **THEN** no formatter is built

### Requirement: Accessible device time location
The device time location's row SHALL be an item of the numbered location list. Its accessible name MUST include the city, the Here mark label (or the Home mark label while it is home) and "Device time". Its location menu button MUST be named like a city card's ("Actions for Almaty"). Its time MUST be a wall-time input and its day track one Tab stop, named like a city card's. axe-core MUST report no violations with the device time location shown, alone, above cities and as home, in the light and the dark theme. <!-- implements NFR-A1, NFR-A2 of add-settings-page-and-device-time-location -->

#### Scenario: Name and list size
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the zone cities data is loaded
- **AND** the list is the device time location, Moscow, New York
- **WHEN** the user opens the app
- **THEN** the first list item is named `Алматы, Вы здесь, Время устройства`
- **AND** the location list has 3 items
- **AND** its location menu button is named `Действия: Алматы`

#### Scenario: No violations
- **GIVEN** the device time location is shown alone, above a list, or as home
- **WHEN** axe-core checks the page in the light and dark themes
- **THEN** it reports no violations

### Requirement: Device time location layout
The device time location SHALL use the card layout of every location row: text above the day track below 768 px, the day track right of the time with hour labels from 768 px, the drag handle and the location menu at the same places. The page MUST NOT scroll horizontally at 320 px and 2560 px with it shown. Replacing the derived city with the exemplar city MUST NOT change its height. The approved screenshots of the states "device-time" (the device time location, Moscow, Kolkata, New York), "device-time-home" (the same list with the device time location as home) and "first-launch" at 375 px and 1024 px in the light and dark themes MUST match. <!-- implements NFR-R1, NFR-R3, UX3 of add-settings-page-and-device-time-location -->

#### Scenario: Narrow and wide screens
- **GIVEN** the list is the device time location, Moscow
- **WHEN** the viewport is 320 px and then 2560 px wide
- **THEN** the page does not scroll horizontally
- **AND** the device time location's layout matches the Moscow card's layout

#### Scenario: The exemplar city keeps the height
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the zone cities data is held back
- **AND** the list is the device time location, Moscow
- **WHEN** the user opens the app and the device time location shows `Almaty`
- **AND** the zone cities data finishes loading and it shows `Алматы`
- **THEN** its height is the same as before the load
- **AND** the Moscow card has not moved

#### Scenario: Approved screenshots
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the state is "device-time", "device-time-home" or "first-launch"
- **WHEN** it is rendered at 375 px and 1024 px in the light and dark themes
- **THEN** it matches the approved screenshot

## REMOVED Requirements

### Requirement: Here entry when no location matches
**Reason**: The derived Here entry is replaced by the device time location, a location of the list that is shown by its list position, not by whether another location matches the device time zone (ADR-0009, handoff H1).
**Migration**: See "Device time location" and "First-launch list". Stored lists of versions 1 and 2 get the device time location first ("List is kept on the device").

### Requirement: Here entry content
**Reason**: Its content moves to the device time location.
**Migration**: See "Device time location".

### Requirement: Offset difference on the Here entry
**Reason**: The device time location follows the offset difference rule of every location row ("Offset difference on location rows").
**Migration**: See "Device time location" (no difference without home, the difference from home otherwise).

### Requirement: Here entry is not a location
**Reason**: The device time location is a location: stored, removable, reorderable and able to be home.
**Migration**: See "Device time location has the controls of every card" and "Device time location as home" in the `home-location` capability.

### Requirement: Select a time on the Here entry
**Reason**: Time selection on the device time location works as on every card.
**Migration**: See "Select a time on the device time location".

### Requirement: Here entry follows the device time zone
**Reason**: The device time location no longer appears or disappears with list changes; only its zone follows the device time zone.
**Migration**: See "Device time location".

### Requirement: Exemplar city of the Here entry
**Reason**: The exemplar city now names the device time location.
**Migration**: See "Exemplar city of the device time location".

### Requirement: Here entry in other page states
**Reason**: The device time location is a row of the list and follows the list's page states.
**Migration**: The load error shows no rows ("Unreadable stored list"); with storage unavailable the list is shown as usual ("Working without storage").

### Requirement: Here entry on outdated zone data
**Reason**: Covered for the device time location.
**Migration**: See "Exemplar city of the device time location" (renamed device time zone) and "Select a time on the device time location" (tap without Pointer Events).

### Requirement: Here entry strings are localized
**Reason**: The strings belong to the device time location.
**Migration**: See "Device time location strings are localized".

### Requirement: Here entry in every view
**Reason**: The view contract now covers the device time location.
**Migration**: See "Device time location in every view".

### Requirement: Here entry is fast
**Reason**: The work bound moves to the device time location.
**Migration**: See "Device time location is fast".

### Requirement: Accessible Here entry
**Reason**: The device time location is an item of the numbered list, not a region outside it.
**Migration**: See "Accessible device time location".

### Requirement: Here entry layout
**Reason**: The device time location uses the card layout with all card controls; the screenshot states are renamed.
**Migration**: See "Device time location layout" ("device-time", "device-time-home", "first-launch" replace "here-entry", "here-entry-travel" and the former "empty" state with the Here entry).
