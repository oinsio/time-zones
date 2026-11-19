# locations Specification

## Purpose
The user's own list of locations: which places the app shows, how they are added and removed, how each is identified by a canonical IANA time zone identifier, and how the list is kept on the device and across open tabs.

## Requirements

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
Removing a location SHALL take it out of the list immediately and MUST keep the order of the remaining locations. Inputs: the location. Effects: the list shrinks by that location; when it was the home location, no location is home afterwards (see the `home-location` capability). Errors: location not found (it is no longer in the list, for example removed in another tab). <!-- implements FR10 of add-locations-via-search ; FR3 of set-home-location-and-show-differences -->

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

#### Scenario: Remove the home location
- **GIVEN** the list is Almaty, Moscow and Almaty is home
- **WHEN** the user removes Almaty
- **THEN** the list is Moscow
- **AND** no location is home

### Requirement: List in the Cards view
The Cards view SHALL show one row per location, in list order, the device time location included. A city location's row shows the city label and the country name in the interface language (see "City label in the interface language"). Every row has a location menu whose accessible name includes the city ("Actions for Moscow", «Действия: Москва»). The menu holds, in this order, the home action of the `home-location` capability, "Move up" and "Move down" (see "Move a location from its location menu") and the remove action "Remove" («Удалить»). The header's Add location button opens the search (see the `main-page` capability). After a removal, focus MUST move to the next location's menu button, or the previous one, or the header's Add location button when the list becomes empty. Adding and removing MUST be announced politely without moving focus. Adding and removing a location are part of the view contract: these behaviours MUST hold for every registered view, not only Cards. <!-- implements FR10, FR17, NFR-A3, UX5 of add-locations-via-search ; FR11, NFR-A2 of set-home-location-and-show-differences; FR2, FR9, FR13 of add-settings-page-and-device-time-location; FR1 of show-city-labels-in-interface-language; FR16 of redesign-cards-grid-and-day-palettes -->

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
- **AND** the open menu offers "Remove" as its last item

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
The list SHALL be saved on the device as a versioned document, together with the home location, and restored in the same order when the app is opened again, also offline. The device time location is stored as an entry of its kind without a zone, so the device time zone itself is never stored. When no locations document is stored, the list MUST be the first-launch list (see "First-launch list"). A stored empty list MUST be restored as an empty list. A document of version 1, 2 or 3 MUST be migrated on load: the device time location is put first, the other locations keep their order, a version 2 or 3 home is kept, a version 1 document has no home and a version 3 document holds no coordinates. Nothing MUST be written for the list until the user first changes it or the home location, or until city locations gain their coordinates (see "Stored locations gain coordinates"). A stored identifier that is a known legacy alias MUST be canonicalized on load. <!-- implements FR9, FR11, FR16, UX4 of add-locations-via-search ; FR8 of set-home-location-and-show-differences; FR12, FR13, FR14 of add-settings-page-and-device-time-location ; FR7, FR8 of add-city-coordinates-to-locations -->

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
A change to the list or to the home location in one open tab or window of the app SHALL appear in every other open tab without a reload. When two tabs write, the last write MUST win. <!-- implements FR14 of add-locations-via-search ; FR10 of set-home-location-and-show-differences -->

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
Every location row SHALL show the location's UTC offset as the last element of its zone line, after the country name and the zone abbreviation, while the zone label shows the UTC offset (see the `settings` capability); while it does not, the row MUST show no offset and MUST leave no gap for it. A city location in the zone `UTC` shows the Universal Time label in place of its country name (see "Zone line on location rows"); its zone abbreviation and UTC offset follow the zone label as on every row. The offset MUST be derived from the location's canonical IANA identifier for the reference moment — the current instant while the moment is live, the pinned instant while it is pinned (see the `date-selection` capability) — so daylight saving time is respected for the shown date; a raw offset MUST NOT be stored or used to identify a location. The offset MUST be computed when the list is presented (the app opens, a location is added or removed, the list changes in another tab, the interface language changes, the reference moment changes), at the start of every minute while the page is visible, and when the page becomes visible again; it MUST NOT be refreshed while the page is hidden. Inputs: the location's IANA identifier, the reference moment (ISO 8601 with `Z`), the interface language. Output: the offset text. Errors: when the offset cannot be computed for the identifier, the row MUST be shown without the offset and the rest of the list MUST be unaffected. The offset needs no network and behaves the same offline. <!-- implements FR1, FR2, FR4, FR6, UX1 of show-utc-offset-on-location-rows; FR4 of show-local-time-and-date-on-location-cards; FR5 of select-date-with-calendar-and-now; FR5, FR13 of show-zone-abbreviations-and-zone-label-setting; FR19 of redesign-cards-grid-and-day-palettes -->

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
- **AND** the list contains Reykjavik (`Atlantic/Reykjavik`)
- **WHEN** the user opens the app
- **THEN** the Reykjavik row's zone line ends with `UTC`

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
- **THEN** that location's row shows its city and location menu without an offset
- **AND** the Moscow row shows `UTC+3`

#### Scenario: Offset hidden by the zone label
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the zone label shows the zone abbreviation and not the UTC offset
- **AND** the list contains Moscow
- **WHEN** the user opens the app
- **THEN** the Moscow row shows `Russia` and `MSK` and no offset

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
Presenting 50 locations with their offsets SHALL take at most 50 ms, and the offset MUST appear in the same render as its row, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: presenting 50 rows again, in the same language and for the same reference day, MUST build no date, time or region name formatter and MUST look up no time zone transition. The list with offsets MUST have no axe-core violations in the light and dark themes. A list whose offsets include `UTC+5:30`, `UTC+5:45` and a negative offset MUST NOT scroll horizontally at 320 px and 2560 px, and the approved "list" screenshots at 375 px and 1024 px in both themes MUST show the offsets. <!-- implements NFR-P1, NFR-A1, NFR-R1, NFR-R2 of show-utc-offset-on-location-rows; FR1, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks -->

#### Scenario: 50 rows within the budget
- **GIVEN** 50 locations whose rows have been presented with offsets once
- **WHEN** their rows are presented with offsets again at another minute of the same day
- **THEN** no date, time or region name formatter is built
- **AND** no time zone transition is looked up

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

### Requirement: Move a location
Moving a location SHALL put it at the target position and MUST keep the relative order of every other location. Inputs: the location and the target position, counted from the top of the list after the move (first = 1). Effects: the list holds the same locations, with the moved one at the target position. Moving a location to the position it already holds MUST leave the list unchanged and MUST NOT write anything to storage. Errors: location not found (it is no longer in the list, for example removed in another tab), position out of range (below 1 or above the number of locations); on an error the list MUST stay unchanged. Locations stay identified by their canonical IANA identifier and label; a move stores no UTC offset. <!-- implements FR2, FR3 of reorder-locations-by-drag-and-drop -->

#### Scenario: Move to every kind of position
- **GIVEN** the list is Almaty, Moscow, Kolkata, Tokyo
- **WHEN** the user moves <city> to position <position>
- **THEN** the list is <order>
- **EXAMPLES**: Almaty to 4 → Moscow, Kolkata, Tokyo, Almaty; Tokyo to 1 → Tokyo, Almaty, Moscow, Kolkata; Moscow to 3 → Almaty, Kolkata, Moscow, Tokyo; Kolkata to 2 → Almaty, Kolkata, Moscow, Tokyo

#### Scenario: Move to its own position
- **GIVEN** the list is Almaty, Moscow, Kolkata, Tokyo
- **WHEN** the user moves Moscow to position 2
- **THEN** the list is Almaty, Moscow, Kolkata, Tokyo
- **AND** nothing is written to storage

#### Scenario: Position outside the list
- **GIVEN** the list is Almaty, Moscow, Kolkata, Tokyo
- **WHEN** the user moves Moscow to position 0 or to position 5
- **THEN** the move is rejected as position out of range
- **AND** the list is unchanged

#### Scenario: Location already gone
- **GIVEN** Moscow was removed in another tab
- **WHEN** a move of Moscow arrives
- **THEN** it is reported as location not found
- **AND** the list is unchanged

### Requirement: Reorder cards by dragging
No card of the Cards view and no row of the Grid view SHALL show a drag handle. When the list holds at least 2 locations, a location MUST be picked up by its grab area — the place part of its row header: the leading mark, the city, the offset difference and the zone line — and dropping it over another row's position MUST move that location there. The time, the location menu button, the day track and the hour cells MUST NOT start a drag. A finger MUST start a drag only after holding the grab area for 250 ms while moving at most 5 px; a finger that moves further before that MUST scroll the page as usual, and the page MUST NOT scroll while a card is dragged. A mouse or a pen MUST start a drag only after moving at least 4 CSS px with the button pressed, so a click on the grab area moves nothing. Over the grab area the pointer cursor MUST be `grab`, and text selection and the long-press callout of iOS MUST be off there. A drag cancelled with Esc, dropped outside the list or dropped at the row's own position MUST leave the list as it was and MUST NOT write anything to storage. A list with 1 location MUST NOT start a drag. Reorder needs no network and behaves the same offline, also on an engine without Pointer Events. In the Grid view, while a meeting range is set, the grab area MUST be locked as "Row controls are locked while a meeting range is set" of `grid-view` says: no drag MUST start from it, and it MUST work again once the meeting range is removed. The Cards view never locks it. <!-- implements FR1, FR3, NFR-R2, UX3 of reorder-locations-by-drag-and-drop; FR9, UX2 of support-legacy-ios-12-safari; FR1, FR2 of fix-grid-meeting-range-lock-and-layering; FR15 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Drag a card to the top with the mouse
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user drags New York by its city above Moscow with the mouse
- **THEN** the list is New York, Moscow, Almaty in that order

#### Scenario: Drag a card down by touch
- **GIVEN** the list is Moscow, Almaty, New York on a phone-sized touch screen
- **WHEN** the user holds Moscow's city with a finger for 250 ms and drags it below New York
- **THEN** the list is Almaty, New York, Moscow in that order
- **AND** the page did not scroll during the drag

#### Scenario: Scrolling over a card scrolls the page
- **GIVEN** the list is Almaty, Moscow, Kolkata, Tokyo, New York on a touch screen too short to show the whole page
- **WHEN** the user swipes up with a finger over the time of Almaty
- **THEN** the page scrolls down
- **AND** the list is Almaty, Moscow, Kolkata, Tokyo, New York in that order
- **AND** nothing is written to storage

#### Scenario: A single location has no handle
- **GIVEN** the list contains only Moscow
- **WHEN** the user drags Moscow by its city with the mouse
- **THEN** no drag starts, the Moscow card is not lifted and it shows no drag handle

#### Scenario: A quick swipe over the handle scrolls without Pointer Events
- **GIVEN** the engine has no Pointer Events
- **AND** the list is Almaty, Moscow, Kolkata, Tokyo, New York on a touch screen too short to show the whole page
- **WHEN** the user swipes up over Almaty's city without holding it first
- **THEN** the page scrolls down
- **AND** the list is Almaty, Moscow, Kolkata, Tokyo, New York in that order

#### Scenario: A swipe without a hold scrolls the page
- **GIVEN** the list is Almaty, Moscow, Kolkata, Tokyo, New York on a touch screen too short to show the whole page
- **WHEN** the user swipes up with a finger over the city name of Almaty without holding it first
- **THEN** the page scrolls down
- **AND** the list is Almaty, Moscow, Kolkata, Tokyo, New York in that order
- **AND** nothing is written to storage

#### Scenario: A click on the city moves nothing
- **GIVEN** the list is Moscow, Almaty
- **WHEN** the user presses the mouse on Moscow's city, moves it 3 px and releases it
- **THEN** the list is Moscow, Almaty in that order and nothing is written to storage

#### Scenario: Only the grab area starts a drag
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user presses the mouse on `<part>` of New York and moves it above Moscow
- **THEN** the list is Moscow, Almaty, New York in that order

| part |
|---|
| the time |
| the location menu button |
| the day track |

#### Scenario: Cancel a drag
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user drags Almaty by its city below New York and presses Esc before dropping
- **THEN** the list is Moscow, Almaty, New York in that order
- **AND** nothing is written to storage

#### Scenario: No drag handle anywhere
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the list is shown in the `<view>` view
- **THEN** no row shows a drag handle
- **AND** the cursor over Moscow's city is `grab`

| view |
|---|
| Cards |
| Grid |

#### Scenario: Drag by finger without Pointer Events
- **GIVEN** the engine has no Pointer Events
- **AND** the list is Moscow, Almaty, New York
- **WHEN** the user holds New York's city with a finger and drags it above Moscow
- **THEN** the list is New York, Moscow, Almaty in that order
- **AND** the page did not scroll during the drag

#### Scenario: No drag in Grid while a meeting range is set
- **GIVEN** the Grid view with Moscow, Almaty, New York and the meeting range 09:00–11:00 in Almaty
- **WHEN** the user drags New York by its city above Moscow with the mouse
- **THEN** the list is Moscow, Almaty, New York in that order
- **AND** nothing is written to storage

### Requirement: Smooth reorder transitions
While a card is dragged, it SHALL be lifted: raised above the other rows, drawn with the lift shadow token and scaled to 1.02. The cards it passes MUST slide to their new places with a 200 ms transform transition before the drop, and the dropped card MUST settle into its slot with an animation of the same duration, so no card jumps between positions. The dragged card MUST stay on the list's vertical axis and keep its slot open until the drop, and the cards it has not passed MUST stay where they are, so the list keeps its height. When the system asks to reduce motion, cards MUST change places without a slide transition and without a drop animation, and reordering MUST still work. <!-- implements NFR-A4, UX1, UX2 of reorder-locations-by-drag-and-drop; FR15, UX3 of redesign-cards-grid-and-day-palettes -->

#### Scenario: The picked-up card is lifted
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user drags Moscow by its city with the mouse
- **THEN** the Moscow card is raised above the others, has the lift shadow and is scaled to 1.02
- **WHEN** the user drops it
- **THEN** the Moscow card has no lift shadow and no scale

#### Scenario: Displaced card slides
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user drags Moscow by its city below Almaty with the mouse, before dropping
- **THEN** the Almaty card runs a 200 ms transform transition

#### Scenario: Dropped card settles into its slot
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user drags Moscow below Almaty with the mouse and releases it away from the centre of its new slot
- **THEN** the Moscow card settles into its slot with a 200 ms transform transition
- **AND** the list is Almaty, Moscow, New York in that order

#### Scenario: The dragged card keeps its width and its slot
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user drags Moscow with the mouse to the right and slightly down without passing another card
- **THEN** the Moscow card stays in its column, keeps its width (scaled by 1.02) and is raised above the others
- **AND** the list keeps its height and the Almaty card stays where it was

#### Scenario: Reduced motion
- **GIVEN** the system asks to reduce motion
- **AND** the list is Moscow, Almaty, New York
- **WHEN** the user drags Moscow by its city below Almaty with the mouse, before dropping
- **THEN** the Almaty card runs no transition
- **AND** after the drop the list is Almaty, Moscow, New York in that order

#### Scenario: Reduced motion has no drop animation
- **GIVEN** the system asks to reduce motion
- **AND** the list is Moscow, Almaty, New York
- **WHEN** the user drags Moscow below Almaty with the mouse and releases it away from the centre of its new slot
- **THEN** the Moscow card runs no transition
- **AND** the list is Almaty, Moscow, New York in that order

### Requirement: New order is kept and shared
After a move, the new order SHALL be saved on the device in the existing versioned list document (schema version unchanged) and restored in the same order when the app is opened again, also without a network. A move made in one open tab MUST appear in every other open tab without a reload; when two tabs write, the last write MUST win. When storage cannot be written, moving MUST still work for the session and the existing storage warning MUST be shown. <!-- implements FR4, FR5, FR6 of reorder-locations-by-drag-and-drop -->

#### Scenario: Order survives a reload
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user moves New York to the top
- **AND** the app is opened again
- **THEN** the list is New York, Moscow, Almaty in that order

#### Scenario: Order survives an offline reopen
- **GIVEN** the user moved New York to the top of Moscow, Almaty, New York
- **WHEN** the app is opened again without a network connection
- **THEN** the list is New York, Moscow, Almaty in that order

#### Scenario: Moved in another tab
- **GIVEN** the app is open in two tabs with the list Moscow, Almaty
- **WHEN** the user moves Almaty to the top in the first tab
- **THEN** the second tab shows Almaty, Moscow in that order without a reload

#### Scenario: Storage cannot be written
- **GIVEN** writing to storage fails
- **AND** the list is Moscow, Almaty
- **WHEN** the user moves Almaty to the top
- **THEN** the list is Almaty, Moscow in that order
- **AND** the storage warning is shown

### Requirement: Reorder is accessible and fits every screen
The list SHALL have no axe-core violations at rest, with a location menu open and while a card is dragged, in the light and dark themes. The grab area MUST NOT be a Tab stop and MUST NOT carry a button role or a reorder role description; the keyboard way to reorder is the location menu ("Move a location from its location menu"). The location menu button and its items MUST be at least 44 × 44 CSS px. A list of 5 locations MUST NOT scroll horizontally at 320 px and 2560 px, also while a card is dragged. Moving a location in a list of 50 and presenting the rows again MUST take at most 50 ms, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: moving a location and presenting the 50 rows again MUST build no date, time or region name formatter and MUST look up no time zone transition. The drag-and-drop code MUST NOT be part of the initial JavaScript, which stays at most 150 KB gzipped. The approved screenshots of the list MUST show the cards without drag handles. <!-- implements NFR-P1, NFR-P2, NFR-A1, NFR-A5, NFR-R1, NFR-R3 of reorder-locations-by-drag-and-drop; FR1, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks; FR15, NFR-A1, NFR-A3, NFR-P2 of redesign-cards-grid-and-day-palettes -->

#### Scenario: No accessibility violations
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the list is checked with axe-core in the light or the dark theme, at rest, with Moscow's location menu open and while Moscow is dragged with the mouse
- **THEN** no violations are reported

#### Scenario: The grab area is not a Tab stop
- **GIVEN** the list is Moscow, Almaty
- **WHEN** the user tabs through the Moscow card
- **THEN** the focus reaches the time, the location menu button and the day track, and nothing else of the card

#### Scenario: Handle target size
- **WHEN** the list is Moscow, Almaty and Moscow's location menu is open
- **THEN** the location menu button and each menu item are at least 44 × 44 CSS px
- **AND** no drag handle is shown

#### Scenario: List screenshots show the handles
- **GIVEN** the list state with Almaty and Moscow
- **WHEN** it is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the cards show no drag handle
- **AND** the screen matches the list screenshot re-taken once for the redesign

#### Scenario: Narrow and wide screens
- **GIVEN** the list is Almaty, Moscow, Kolkata, Tokyo, New York
- **WHEN** it is shown at 320 px or 2560 px and Almaty is dragged down by one position
- **THEN** the page does not scroll horizontally

#### Scenario: 50 locations within the budget
- **GIVEN** 50 locations whose rows have been presented once
- **WHEN** the last one is moved to the top and the rows are presented
- **THEN** no date, time or region name formatter is built
- **AND** no time zone transition is looked up
- **AND** the first row is the location that was last

#### Scenario: Reorder stays out of the initial bundle
- **WHEN** the app is built for production
- **THEN** the initial JavaScript is at most 150 KB gzipped
- **AND** it contains no drag-and-drop code

### Requirement: Reorder strings are localized
Every reorder string — the menu items "Move up" and "Move down" and the pick-up, move, drop and cancel announcements — SHALL exist in English and Russian with identical key sets and MUST be shown in the interface language. Russian MUST use «Поднять выше» and «Опустить ниже». The former handle name ("Move Moscow"), its role description and its keyboard instructions MUST NOT remain in any locale file. <!-- implements FR8 of reorder-locations-by-drag-and-drop; FR16 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Russian interface
- **GIVEN** the interface language is Russian
- **WHEN** the list contains Moscow and Almaty and the user opens Moscow's location menu
- **THEN** it offers «Поднять выше» and «Опустить ниже»

#### Scenario: No handle strings remain
- **WHEN** the locale files are read
- **THEN** no locale has a key for the drag handle's name, role description or keyboard instructions

### Requirement: Here mark on location rows
A location row SHALL show the "here" mark when the location's canonical IANA identifier equals the device time zone. Every matching row MUST show it, except the home location's row, which shows the home mark instead (see the `home-location` capability); no other row MAY show it. The mark MUST be the Lucide `MapPin` icon before the city name, 23 px (20 px in a grid row from 768 px), in the accent colour of the active theme, with no visible caption. A row without the mark MUST show no icon, and its city MUST start the line with no empty space reserved for an icon. Equality MUST be by canonical IANA identifier, never by UTC offset or equal rules. The device time zone MUST be read through the app's time abstraction when the app starts, at the start of every minute while the page is visible, and when the page becomes visible again, and canonicalized each time. An identifier the browser does not know MUST be treated as `UTC`. The device time zone MUST NOT be stored and MUST NOT be read on list changes between those moments. Adding, removing, moving or resetting locations and changes from another tab MUST keep the rule true for every row. Inputs: the listed locations' canonical identifiers and the device time zone identifier. Output: which rows show the mark. Errors: none; an unknown device identifier falls back to `UTC`. The mark needs no network and behaves the same offline. <!-- implements FR1, FR2, FR3, FR4, UX1 of mark-device-time-zone-in-location-list; FR4 of show-local-time-and-date-on-location-cards; FR1, FR2, FR5, UX3 of match-here-mark-to-design ; FR7 of set-home-location-and-show-differences; FR10 of redesign-cards-grid-and-day-palettes -->

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
- **THEN** on the Almaty row the map pin icon comes before the city name, 23 px, in the accent colour
- **AND** no caption comes after the city: no row shows the text "here"
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

#### Scenario: The home row shows no here mark
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row shows the home mark and no here mark

### Requirement: Here mark text
The mark's accessible label SHALL come from the locale files and exist in English and Russian with identical key sets: "You are here" in English and "Вы здесь" in Russian. No locale MAY keep a visible caption text for the mark ("here", «здесь») or the former "Your time zone" text. <!-- implements FR5, UX2 of mark-device-time-zone-in-location-list; FR2, FR3, UX1, UX2 of match-here-mark-to-design; FR10 of redesign-cards-grid-and-day-palettes -->

#### Scenario: English interface
- **GIVEN** the interface language is English
- **AND** the device time zone is `Asia/Almaty` and the list contains Almaty
- **WHEN** the user opens the app
- **THEN** the Almaty row has one image named "You are here" and no visible text "here"

#### Scenario: Russian interface
- **GIVEN** the interface language is Russian
- **AND** the device time zone is `Asia/Almaty` and the list contains Almaty
- **WHEN** the user opens the app
- **THEN** the Almaty row has one image named «Вы здесь» and no visible text «здесь»

#### Scenario: No caption key remains
- **WHEN** the locale files are read
- **THEN** no locale has a key for a visible caption of the Here mark

### Requirement: Here mark is accessible and fits every screen
The accessible name of a row SHALL be its city, followed by its leading mark's accessible label when it has one, followed by its offset difference's accessible text when it has one ("Almaty You are here", "Moscow 2 hours behind"). A row with neither MUST be named by its city alone. The icon MUST be exposed to assistive technology as an image named by the accessible label, and the drawn glyph MUST be hidden from it. Presenting 50 locations with the mark rule MUST take at most 50 ms, and the mark MUST appear in the same render as its row, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: presenting 50 rows for the first time in a language MUST build at most 3 date and time formatters per distinct time zone and at most 1 region name formatter. A list with a marked row MUST have no axe-core violations in the light and dark themes and MUST NOT scroll horizontally at 320 px and 2560 px, and the approved screenshots of the list MUST show the mark on the matching row. <!-- implements NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2 of mark-device-time-zone-in-location-list; FR2, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks; NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2 of match-here-mark-to-design ; NFR-A3 of set-home-location-and-show-differences; FR10, NFR-A1 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Row name includes the badge
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** the Almaty row is named "Almaty You are here"
- **AND** the Moscow row is named "Moscow 2 hours behind"

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
- **WHEN** the list is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the Almaty row shows the here mark and the Moscow row does not
- **AND** the screen matches the screenshot re-taken once for the redesign

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

### Requirement: Local time and date layout
The time SHALL be the most prominent text of a card — larger and bolder than the city — and MUST use tabular figures. Below 768 px the time MUST be on the city's line at the right end of the card's content, followed by the location menu button, and the date MUST be on the next line at the right end, opposite the zone line (see "Narrow card layout"). From 768 px the date, the time and the location menu button MUST stand in this order at the right end of the card's first line (see "Wide card layout"). Every time of either hour format (for example `12:59 PM`) MUST be shown in full, on one line, with its day period marker as "Card growth" says. A list with times and dates MUST NOT scroll horizontally at 320 px and 2560 px, and the approved list screenshots, taken at the pinned instant `2026-03-08T07:30:00Z`, MUST show `12:30` on Almaty and `10:30` on Moscow with their dates. <!-- implements NFR-R1, NFR-R2, NFR-R3, UX1, UX2 of show-local-time-and-date-on-location-cards ; UX3 of set-home-location-and-show-differences; FR5, UX3 of fix-location-card-and-header-layout; FR7, FR11 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Narrow screen
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and Moscow
- **WHEN** the list is shown 390 px wide in Russian
- **THEN** Moscow's `10:30` is on its city's line, left of its location menu button
- **AND** Moscow's `вс, 8 мар.` is on the next line at the right end of the card's content

#### Scenario: Wide screen
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and Moscow
- **WHEN** the list is shown 1024 px wide in Russian
- **THEN** Moscow's `вс, 8 мар.`, `10:30` and location menu button are on its city's line, in this order, at the right end of the card's content

#### Scenario: One time column width in the 12-hour format
- **GIVEN** the interface language is English
- **AND** the hour format is 12-hour
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow, New York, Tokyo and Kolkata
- **WHEN** the list is shown `<width>` px wide
- **THEN** the cards show `10:30 AM`, `3:30 AM`, `4:30 PM` and `1:00 PM`
- **AND** each time is shown in full on one line
- **AND** the right edges of the four location menu buttons line up, within 1 px

| width |
|---|
| 390 |
| 768 |
| 1024 |
| 1440 |

#### Scenario: Times fit narrow and wide screens
- **GIVEN** the hour format is 12-hour and the list is Almaty, Kathmandu, New York and Tokyo
- **WHEN** the list is shown at 320 px or 2560 px
- **THEN** the page does not scroll horizontally and every time is on one line

#### Scenario: List screenshots show the time and the date
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list state with Almaty and Moscow
- **WHEN** it is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the Almaty row shows `12:30` and the Moscow row shows `10:30`, each with its date
- **AND** the screen matches the list screenshot re-taken once for the redesign

### Requirement: Local time and date are fast and accessible
Presenting 50 locations with their time, date, offset and here mark SHALL take at most 50 ms, and the time and the date MUST appear in the same render as their row, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: presenting 50 rows again, in the same language and for the same reference day, MUST build no date, time or region name formatter. The time and date labels MUST stay identical, character for character, in English and Russian. A list with times and dates MUST have no axe-core violations in the light and dark themes. The time and the date MUST be readable text of the card but MUST NOT be a live region, so minute updates are not announced. A row's accessible name MUST stay its city, followed by its leading mark's accessible label when it has one and by its offset difference's accessible text when it has one (see "Here mark is accessible and fits every screen"); the time and the date MUST NOT be part of it. <!-- implements NFR-P1, NFR-A1, NFR-A2 of show-local-time-and-date-on-location-cards; FR1, FR5, FR6, NFR-P1, UX1 of replace-wall-clock-row-budgets-with-deterministic-checks; NFR-A1 of match-here-mark-to-design; NFR-A3 of set-home-location-and-show-differences -->

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
- **THEN** the Almaty row is named "Almaty You are here" and the Moscow row is named "Moscow 2 hours behind"
- **AND** the time of Almaty is not inside a live region

### Requirement: One leading mark per row
A location row SHALL show at most one leading mark, in the slot before the city name. The mark's kind MUST decide its icon and its accessible label; no kind has a visible caption. Every kind the app knows MUST have an icon and an accessible label defined in both locales. The kinds are "here" (Lucide `MapPin`, label "You are here" / «Вы здесь») and "home" (Lucide `House`, label "Home location" / «Домашнее место»). A row that is both home and in the device time zone MUST show "home". Inputs: the row's location, the home location and the device time zone. Output: the row's mark kind, or none. Errors: none. Every kind MUST take the same slot, be the same size and MUST NOT add a second leading icon to a row. <!-- implements FR4 of match-here-mark-to-design ; FR7 of set-home-location-and-show-differences; FR10 of redesign-cards-grid-and-day-palettes -->

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
- **AND** no kind has a visible caption

#### Scenario: Home wins over here
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row has exactly 1 leading mark, of the kind "home"

#### Scenario: Both kinds take the same slot
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the list is Almaty and Moscow and Almaty is home
- **WHEN** the list is shown 390 px wide
- **THEN** Almaty's house and Moscow's map pin are both 23 × 23 px and stand before their cities

### Requirement: Offset difference on location rows
Every row whose zone is known SHALL show its offset difference: its UTC offset minus the reference zone's UTC offset at the effective instant. The home location's row MUST show none. Without home, a row with the Here mark MUST show none. Any other row whose offset equals the reference zone's MUST show a zero difference. A row with an unknown zone shows none. Inputs: the location's zone, the reference zone, the effective instant. <!-- implements FR5 of set-home-location-and-show-differences -->

#### Scenario: Differences from home
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Almaty, Moscow, Kolkata and New York and Almaty is home
- **WHEN** the user opens the app
- **THEN** Moscow shows `−2 h`, Kolkata `+0:30` and New York `−9 h`
- **AND** Almaty shows no difference

#### Scenario: DST changes the difference
- **GIVEN** the list is Almaty and New York and Almaty is home
- **WHEN** the moment is pinned to `<instant>`
- **THEN** New York shows `<difference>`

| instant | difference |
|---|---|
| `2026-03-08T06:30:00Z` | `−10 h` |
| `2026-03-08T07:30:00Z` | `−9 h` |

#### Scenario: Differences from the device time zone without home
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is Almaty and Moscow and no location is home
- **WHEN** the user opens the app
- **THEN** Moscow shows `−2 h`
- **AND** Almaty, which shows the Here mark, shows no difference

#### Scenario: Same offset, another zone
- **GIVEN** the list is Moscow and Minsk and Moscow is home
- **WHEN** the user opens the app
- **THEN** Minsk shows `0 h`

#### Scenario: Unknown zone
- **GIVEN** the list holds Moscow and a location whose zone the browser does not know
- **WHEN** the list is presented
- **THEN** that location shows no difference

### Requirement: Offset difference follows the reference moment
The offset difference SHALL be computed whenever the UTC offset is: on open, on a list change, on a language change, on a reference moment change, at every minute tick, on a device time zone change and on a home change. It MUST NOT be stored. <!-- implements FR4, FR5 of set-home-location-and-show-differences -->

#### Scenario: A home change updates the differences at once
- **GIVEN** the list is Almaty and Moscow and Almaty is home
- **WHEN** the user makes Moscow home
- **THEN** Almaty shows `+2 h` in the same render
- **AND** Moscow shows no difference

### Requirement: Offset difference text
The difference text SHALL have a sign and the hours. Whole hours MUST carry the unit (`−2 h`, «−2 ч»). Hours with minutes MUST have no unit (`+0:30`, `−5:30`, `+5:45`). Zero MUST be `0 h` («0 ч») without a sign. The minus MUST be the typographic minus `−`. The text MUST stand right after the city, in the muted foreground colour, 16 px with weight 600 in a card (in a grid row: the size of its row header's zone line, weight 600); when the city wraps, it follows the last word of the city. <!-- implements FR6, UX1 of set-home-location-and-show-differences; FR7, FR8 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Texts in both languages
- **WHEN** a difference of `<minutes>` minutes is shown in `<language>`
- **THEN** the text is `<text>`

| minutes | language | text |
|---|---|---|
| -120 | English | `−2 h` |
| 180 | Russian | `+3 ч` |
| 30 | English | `+0:30` |
| -330 | English | `−5:30` |
| 345 | Russian | `+5:45` |
| 0 | English | `0 h` |
| 0 | Russian | `0 ч` |

#### Scenario: Difference look in a card
- **GIVEN** the list is Almaty and Moscow and home is Almaty
- **WHEN** the list is shown 390 px wide
- **THEN** Moscow's difference stands right after its city, 16 px, weight 600, in the muted foreground colour

### Requirement: Offset difference accessible text
The visible difference SHALL be hidden from assistive technology and replaced by an accessible text read as part of the row name: "{duration} ahead" («на {duration} позже»), "{duration} behind" («на {duration} раньше») or "same time" («то же время»), with plural forms of hours and minutes. <!-- implements NFR-A3 of set-home-location-and-show-differences -->

#### Scenario: Accessible texts
- **WHEN** a difference of `<minutes>` minutes is read in `<language>`
- **THEN** the accessible text is `<text>`

| minutes | language | text |
|---|---|---|
| -120 | English | 2 hours behind |
| 30 | English | 30 minutes ahead |
| 330 | English | 5 hours 30 minutes ahead |
| -120 | Russian | на 2 часа раньше |
| 345 | Russian | на 5 часов 45 минут позже |
| 0 | Russian | то же время |

### Requirement: Offset differences are fast
Presenting 50 rows with offset differences SHALL build no more formatters than without them: at most 3 date and time formatters per distinct time zone and at most 1 region name formatter the first time, none when presented again. The reference zone's UTC offset MUST be computed once per presentation, not once per row. <!-- implements NFR-P1 of set-home-location-and-show-differences -->

#### Scenario: 50 rows within the work bound
- **GIVEN** 50 locations, one of them home
- **AND** the home location is the only one in `Asia/Almaty` and one other location is the only one in `Europe/Moscow`
- **AND** the rows were presented once
- **WHEN** the rows are presented again
- **THEN** no date, time or region name formatter is built
- **AND** the reference zone's UTC offset is computed once: the time zone lookups in `Asia/Almaty` exceed those in `Europe/Moscow` by at most 1

### Requirement: Location menu
Each card and grid row SHALL have a location menu button showing three vertical dots («⋮»), with no other text and a hit area of at least 44 × 44 px, on the first line of its row header, after the time. The dots are decorative and hidden from assistive technology; the button's accessible name stays "Actions for <city>" / «Действия: <city>». The dots MUST be vertically centred on the line of the time and drawn in the current text colour, so a locked button dims them. In the Cards and the Grid view the space from the right edge of the time (in Grid while a meeting range is set: the meeting time) to the right content edge of the row MUST be at most 32 px. Measured from the centre of the dots, the distance to the time's right edge and the distance to the row's right border (the card border or the Grid panel border) MUST differ by at most 10 px. The button's hit area MUST NOT overlap the time, the local date, the city, the offset difference or the zone line of its row, and it MUST lie inside the border box of its card or inside the Grid panel. The open menu MUST lie inside the screen. The menu has the surface background, the control border and the lift shadow, and its items are the home action, "Move up", "Move down" and "Remove", in this order. It MUST follow the WAI-ARIA menu button pattern: Enter, Space or Arrow Down open it on the first enabled item, the arrows move between enabled items, Enter activates, Esc closes it and returns focus to the button. Opening it MUST NOT start a reorder or move a day track's handle. In the Grid view, while a meeting range is set, the location menu button MUST be locked as "Row controls are locked while a meeting range is set" of `grid-view` says: it MUST NOT be a Tab stop, no pointer, finger or key MUST open the menu, and a menu open when the range is set MUST close; once the meeting range is removed the button MUST work again. The Cards view never locks it. <!-- implements FR11, NFR-A2, UX3 of set-home-location-and-show-differences; FR1, FR2 of fix-grid-meeting-range-lock-and-layering; FR1, FR7, FR16, NFR-A3 of redesign-cards-grid-and-day-palettes; FR1, FR2, FR3, NFR-A1, NFR-R1, UX1, UX2 of make-location-menu-button-vertical -->

#### Scenario: Vertical dots on the button
- **GIVEN** the list is Almaty and Moscow
- **WHEN** the list is shown in the Cards view and then in the Grid view
- **THEN** each row's location menu button shows three dots one above the other and no text
- **AND** its accessible name is "Actions for Almaty" and "Actions for Moscow"
- **AND** the dots are vertically centred on the line of the time

#### Scenario: Compact button in Cards
- **GIVEN** the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the Cards view is shown `<width>` px wide
- **THEN** in every card the time's right edge is at most 32 px from the card's right content edge
- **AND** every location menu button is at least 44 × 44 px and inside its card
- **AND** no location menu button overlaps the time, the local date, the city, the offset difference or the zone line of its card

| width |
|---|
| 320 |
| 390 |
| 411 |
| 768 |
| 1024 |
| 1440 |

#### Scenario: Compact button in Grid
- **GIVEN** the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the Grid view is shown `<width>` px wide
- **THEN** in every row the time's right edge is at most 32 px from the row's right content edge
- **AND** every location menu button is at least 44 × 44 px and inside the Grid panel
- **AND** no location menu button overlaps the time, the local date, the city, the offset difference or the zone line of its row

| width |
|---|
| 390 |
| 844 |
| 1180 |
| 1440 |

#### Scenario: Compact button next to a meeting time
- **GIVEN** the Grid view 390 px wide with Almaty and Moscow and the meeting range 09:00–11:00 in Almaty
- **THEN** in every row the meeting time's right edge is at most 32 px from the row's right content edge
- **AND** no location menu button overlaps the meeting time of its row

#### Scenario: Even spacing around the dots
- **GIVEN** the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the `<view>` view is shown `<width>` px wide
- **THEN** in every row, measured from the centre of the dots, the distance to the time's right edge and the distance to the row's right border differ by at most 10 px

| view | width |
|---|---|
| Cards | 320 |
| Cards | 390 |
| Cards | 411 |
| Cards | 768 |
| Cards | 1024 |
| Cards | 1440 |
| Grid | 390 |
| Grid | 844 |
| Grid | 1180 |
| Grid | 1440 |

#### Scenario: Long city at 320 px
- **GIVEN** the interface language is Russian and the stored location is Петропавловск-Камчатский
- **WHEN** the Cards view is shown 320 px wide
- **THEN** the time and the location menu button are on a line of their own at the right edge of the card
- **AND** the button does not overlap the time and lies inside the card

#### Scenario: Open menu inside the screen
- **GIVEN** the stored locations are Almaty and Moscow
- **WHEN** the user opens Moscow's location menu `<width>` px wide in the `<view>` view
- **THEN** the open menu lies inside the screen

| view | width |
|---|---|
| Cards | 320 |
| Grid | 390 |

#### Scenario: Keyboard
- **GIVEN** the list is Almaty and Moscow
- **WHEN** the user focuses Moscow's location menu button and presses Enter
- **THEN** the menu opens with focus on its first enabled item
- **WHEN** the user presses Esc
- **THEN** the menu is closed and focus is on Moscow's location menu button

#### Scenario: The menu does not start a reorder
- **GIVEN** the list is Almaty and Moscow
- **WHEN** the user opens Moscow's location menu with a pointer
- **THEN** the list order is unchanged

#### Scenario: The menu is locked in Grid while a meeting range is set
- **GIVEN** the Grid view with Almaty and Moscow and the meeting range 09:00–11:00 in Almaty
- **WHEN** the user clicks Moscow's location menu button
- **THEN** no menu opens and the button is disabled
- **WHEN** the user clears the meeting range and clicks Moscow's location menu button
- **THEN** the menu opens with "Move up" and "Move down"

#### Scenario: Keyboard opens the menu on the first enabled item
- **GIVEN** the list is Almaty, Moscow and home is Almaty
- **WHEN** the user focuses Almaty's location menu button and presses Arrow Down
- **THEN** the menu is open with focus on "Clear home"
- **WHEN** the user presses Arrow Down
- **THEN** focus is on "Move down", skipping the disabled "Move up"
- **WHEN** the user presses Esc
- **THEN** the menu is closed and focus is on Almaty's location menu button

#### Scenario: Opening the menu moves nothing
- **GIVEN** the list is Almaty, Moscow
- **WHEN** the user opens Moscow's location menu with the mouse
- **THEN** the list order and every day track's handle are unchanged

### Requirement: Location menu without Pointer Events
On an engine without Pointer Events (iOS Safari 12.5), a tap on the location menu button SHALL open the menu, a tap on an item MUST activate it, and a tap outside the menu or Esc MUST close it. Removing a location and the home actions MUST work there as on other engines. <!-- implements FR14 of set-home-location-and-show-differences -->

#### Scenario: Remove without Pointer Events
- **GIVEN** the engine has no Pointer Events
- **AND** the list is Almaty and Moscow
- **WHEN** the user taps Moscow's location menu button and then "Remove"
- **THEN** the list is Almaty

#### Scenario: Close by tapping outside
- **GIVEN** the engine has no Pointer Events
- **AND** Moscow's location menu is open
- **WHEN** the user taps outside the menu
- **THEN** the menu is closed and the list is unchanged

### Requirement: Location menu keeps the initial JavaScript budget
The location menu SHALL keep the initial JavaScript of the build at most 150 KB gzipped. <!-- implements NFR-P2 of set-home-location-and-show-differences -->

#### Scenario: Bundle budget
- **WHEN** the app is built with the location menu
- **THEN** the initial JavaScript is at most 150 KB gzipped

### Requirement: Device time location
The device time location SHALL be a location of the list whose zone is the device time zone. Its row MUST show the Here mark without a caption (the Home mark instead while it is home), the city of the device time zone, the zone line with "Device time" («Время устройства») in place of the country name, then the zone abbreviation and the UTC offset, each shown as the zone label allows ("Время устройства · CET · UTC+1", see "Zone line on location rows"), the local time and date at the effective instant, its offset difference by the rule of every location row, and a day track on the shared reference day. "Device time" is not a country name: it MUST stay the first element of the zone line whether or not the zone label shows the country. Its zone MUST change in the same render whenever the device time zone is read with a new value: at start, at every minute tick and when the page becomes visible. An unknown device time zone MUST be shown as `UTC`. Inputs: the device time zone, the effective instant, the reference zone. Output: the row. Errors: none. <!-- implements FR8, UX3 of add-settings-page-and-device-time-location; FR6 of show-zone-abbreviations-and-zone-label-setting; FR4 of add-country-to-zone-label; FR18 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Device time location on the design sample
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the zone cities data is loaded
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is the device time location, Moscow, Kolkata, New York
- **WHEN** the user opens the app
- **THEN** the first row shows the map pin, `Алматы`, no caption, the zone line `Время устройства · UTC+5` (Almaty has no zone abbreviation), the time `12:30`, the date `вс, 8 мар.` and no offset difference
- **AND** Moscow shows `−2 ч`, Kolkata `+0:30` and New York `−9 ч`

#### Scenario: Device time zone line
- **GIVEN** the interface language is Russian, the device time zone is `Europe/Berlin` and the current time is `2026-03-08T07:30:00Z`
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** its zone line reads «Время устройства · CET · UTC+1»
- **AND** it shows the map pin and no text «здесь»

#### Scenario: The device moves to another zone
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is English
- **AND** the list is the device time location, New York
- **WHEN** the device time zone becomes `Europe/Moscow` and the minute tick reads it
- **THEN** the first row shows `Moscow` and the zone line elements `Device time`, `MSK`, `UTC+3`
- **AND** the list is still the device time location, New York

#### Scenario: Unknown device time zone
- **GIVEN** the device reports the time zone `Mars/Olympus_Mons`
- **AND** the interface language is English
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the row shows `UTC`, the map pin, no caption and the zone line elements `Device time`, `UTC`

#### Scenario: Meta line follows the zone label
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the interface language is Russian
- **AND** the list is the device time location
- **WHEN** the zone label shows `<parts>`
- **THEN** the zone line is `<meta line>`

| parts | meta line |
|---|---|
| the country, the zone abbreviation and the UTC offset | Время устройства · МСК · UTC+3 |
| the zone abbreviation and the UTC offset | Время устройства · МСК · UTC+3 |
| the country and the UTC offset | Время устройства · UTC+3 |
| the country and the zone abbreviation | Время устройства · МСК |
| the country only | Время устройства |
| nothing | Время устройства |

### Requirement: Device time location has the controls of every card
The device time location's row SHALL have the same controls as a city location's row: a grab area, a location menu with the home action (Make home or Clear home), Move up, Move down and Remove. It MUST be an item of the numbered location list, and reorder positions and announcements MUST count it like any location. Removing it MUST take it out of the list and keep the order of the others. Inputs: the user's reorder, home and remove actions. Effects: as for any location. Errors: location not found when it is no longer in the list. <!-- implements FR9, UX3 of add-settings-page-and-device-time-location; FR15, FR16 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Same menu as a city card
- **GIVEN** the interface language is English
- **AND** the list is the device time location, Moscow
- **WHEN** the user opens the device time location's menu
- **THEN** it offers "Make home", "Move up", "Move down" and "Remove", the same items as Moscow's menu

#### Scenario: Reorder below a city
- **GIVEN** the list is the device time location, Moscow, New York
- **WHEN** the user chooses "Move down" twice in the device time location's menu
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
The device time location SHALL be named by the exemplar city of the device time zone in the interface language. The zone cities data MUST be loaded in the background only while the list holds at least one location of any kind or the search is open, and showing the device time location MUST NOT wait for it. Until the data is loaded, or when loading fails, the city MUST be derived from the time zone ID, with no error shown. On an engine that rejects the canonical device time zone while the zone rules release knows it (see the `zone-rules` capability), the exemplar city MUST be looked up by the canonical ID and the time, date and day track MUST come from the zone rules. The search MUST reuse data already loaded, so the page requests the data at most once while no load fails; the city labels of city locations share the same request. <!-- implements FR8, NFR-P2 of add-settings-page-and-device-time-location; FR4 of show-city-labels-in-interface-language; FR6 of show-zone-abbreviations-and-zone-label-setting; FR1, FR5 of add-zone-rules-from-iana -->

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
- **GIVEN** the stored list is empty
- **WHEN** the user opens the app and does not open the search
- **THEN** the zone cities data is not requested

#### Scenario: One request for city labels and the device time location
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the stored list is the device time location, Tokyo
- **WHEN** the user opens the app, the zone cities data finishes loading, and the user opens the search
- **THEN** the zone cities data was requested exactly once

#### Scenario: Renamed device time zone
- **GIVEN** the engine rejects `Europe/Kyiv` and accepts `Europe/Kiev`
- **AND** the device reports the time zone `Europe/Kiev`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the device time location shows `Kyiv`, the time `09:30` and the meta line `Device time`, `EET`, `UTC+2`

### Requirement: Device time location strings are localized
Every string of the device time location SHALL exist in English and Russian: the meta line "Device time" («Время устройства») and its accessible name. The meta line's first element is that text alone; the zone abbreviation and the UTC offset follow it as separate elements. <!-- implements FR16 of add-settings-page-and-device-time-location; FR6 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Both languages
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is the device time location
- **WHEN** the interface language is switched between English and Russian
- **THEN** the meta line reads `Device time`, `UTC+5` and `Время устройства`, `UTC+5`

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
The device time location's row SHALL be an item of the numbered location list. Its accessible name MUST include the city, the Here mark label (or the Home mark label while it is home) and "Device time". Its location menu button MUST be named like a city card's ("Actions for Almaty"). Its time MUST be a wall-time input and its day track one Tab stop, named like a city card's. In the Grid view, while a meeting range is set, its grab area, location menu button and wall-time input MUST be locked as a city card's are ("Row controls are locked while a meeting range is set" of `grid-view`). axe-core MUST report no violations with the device time location shown, alone, above cities and as home, in the light and the dark theme. <!-- implements NFR-A1, NFR-A2 of add-settings-page-and-device-time-location; FR1, FR2 of fix-grid-meeting-range-lock-and-layering; FR15 of redesign-cards-grid-and-day-palettes -->

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
The device time location SHALL use the card layout of every location row ("Narrow card layout", "Wide card layout") and the grid row layout of every row. The page MUST NOT scroll horizontally at 320 px and 2560 px with it shown. Replacing the derived city with the exemplar city MUST NOT change its height. The approved screenshots that show the device time location MUST match. <!-- implements NFR-R1, NFR-R3, UX3 of add-settings-page-and-device-time-location; FR18 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Narrow and wide screens
- **GIVEN** the list is the device time location, Moscow
- **WHEN** the viewport is `<width>` px wide
- **THEN** the page does not scroll horizontally
- **AND** the device time location's card has the same line structure and height as the Moscow card, within 1 px

| width |
|---|
| 320 |
| 390 |
| 1024 |
| 2560 |

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
- **THEN** it matches the approved screenshot, re-taken once for the redesign

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
| 2026-10-19 | yes |
| 2026-10-20 | yes |
| 2026-10-21 | yes |
| 2026-10-22 | yes |
| 2026-10-23 | yes |
| 2026-10-24 | yes |
| 2026-10-25 | yes |
| 2026-10-26 | yes |
| 2026-10-27 | yes |
| 2026-10-28 | yes |
| 2026-10-29 | yes |
| 2026-10-30 | yes |
| 2026-10-31 | yes |
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

### Requirement: City label in the interface language
A city location's row SHALL show as its city label the name of a city record of its zone in the city-name language of the interface language, when the stored label equals that record's name in any city-name language; the record may be the zone city or any other city of the city data in that zone, and when several records of the zone have the stored label as a name, the zone city wins, then the larger population. The city-name language follows the dialect fallback: the interface language, its base language, then English. When no city record of the zone has the stored label as a name, the row MUST show the stored label. Until the zone cities data is loaded, or when loading fails, the row MUST show the stored label, with no error and no retry. Switching the interface language MUST change the city label of every listed city location at once, without a reload and without a loading state. A switch MUST NOT change the stored list, any location ID, the order or the home location, and MUST NOT write the stored location list. Every text that names a row's city MUST use this city label: the location menu name, the time button and field name, and the removal, home and reorder announcements. Inputs: the location list, the interface language, the zone cities data. Output: the city label of each row. Errors: none. <!-- implements FR1, FR2, FR3, UX1, UX2 of show-city-labels-in-interface-language; FR9 of add-geonames-city-source -->

#### Scenario: Added in Russian, shown in English
- **GIVEN** the interface language is Russian
- **AND** the zone cities data is loaded
- **AND** the user has added Tokyo, shown as «Токио»
- **WHEN** the user switches the interface language to English
- **THEN** the row reads "Tokyo"
- **WHEN** the user switches the interface language back to Russian
- **THEN** the row reads «Токио»

#### Scenario: Added in English, shown in Russian
- **GIVEN** the interface language is English
- **AND** the zone cities data is loaded
- **AND** the user has added Tokyo, shown as "Tokyo"
- **WHEN** the user switches the interface language to Russian
- **THEN** the row reads «Токио»

#### Scenario: A city that is not the zone city
- **GIVEN** the interface language is Russian
- **AND** the zone cities data is loaded
- **AND** the user has added Kazan in `Europe/Moscow`, shown as «Казань»
- **WHEN** the user switches the interface language to English
- **THEN** the row reads "Kazan"
- **AND** a Moscow row in the same list still reads "Moscow"

#### Scenario: Namesakes in one zone read the same
- **GIVEN** the stored list is `America/Chicago` stored as "Springfield"
- **WHEN** the interface language is Russian and the zone cities data is loaded
- **THEN** the row reads the Russian name of Springfield, Missouri, the larger of the two namesakes of that zone

#### Scenario: A switch keeps the stored list
- **GIVEN** the stored list is Tokyo stored as «Токио», as home
- **AND** the interface language is English
- **WHEN** the user opens the app and the zone cities data finishes loading
- **THEN** the row reads "Tokyo" and is the home location
- **AND** the stored list still holds Tokyo stored as «Токио», as home
- **WHEN** the user switches the interface language to Russian and back to English
- **THEN** the row reads "Tokyo" again
- **AND** the stored location list was not written

#### Scenario: Stored label until the data is loaded
- **GIVEN** the stored list is Tokyo stored as «Токио»
- **AND** the interface language is English
- **AND** the zone cities data has not been loaded
- **WHEN** the user opens the app
- **THEN** the row reads «Токио»
- **WHEN** the zone cities data finishes loading
- **THEN** the row reads "Tokyo"

#### Scenario: Loading fails
- **GIVEN** the stored list is Tokyo stored as «Токио»
- **AND** the interface language is English
- **AND** loading the zone cities data fails
- **WHEN** the user opens the app
- **THEN** the row reads «Токио»
- **AND** no error is shown

#### Scenario: A label the data does not know
- **GIVEN** the stored list is `Asia/Tokyo` stored as "Edo"
- **AND** the interface language is Russian
- **WHEN** the user opens the app and the zone cities data finishes loading
- **THEN** the row reads "Edo"

#### Scenario: A dialect reads its base language
- **GIVEN** a dialect `ru-KZ` with base language `ru`
- **AND** the stored list is Tokyo stored as "Tokyo"
- **WHEN** the interface language is `ru-KZ` and the zone cities data is loaded
- **THEN** the row reads «Токио»

#### Scenario: Texts that name the city follow
- **GIVEN** the interface language is Russian
- **AND** the zone cities data is loaded
- **AND** the list is Tokyo added as «Токио»
- **WHEN** the user switches the interface language to English
- **THEN** the location menu button is named "Actions for Tokyo"
- **AND** the time button's name starts with "Enter time — Tokyo"
- **WHEN** the user removes Tokyo
- **THEN** "Tokyo removed" is announced politely

#### Scenario: Accessible after a switch
- **GIVEN** the list is Tokyo added as «Токио»
- **WHEN** the user switches the interface language to English in the light and the dark theme
- **THEN** axe-core reports no violations on the main page
- **AND** the location menu button is named "Actions for Tokyo"

### Requirement: City labels are fast
City labels SHALL cost no repeated work: presenting 50 rows again for the next minute tick, with an unchanged list, interface language and zone cities data, MUST ask the city search for no city label and MUST build no formatter. A language switch MUST ask the city search for at most one city label per city location. These bounds are counted, never timed (ADR-0008). <!-- implements NFR-P1 of show-city-labels-in-interface-language -->

#### Scenario: A minute tick asks for no city label
- **GIVEN** 50 city locations have been presented with the zone cities data loaded
- **WHEN** the same rows are presented again for the next minute tick
- **THEN** the city search was asked for no city label
- **AND** no formatter is built

#### Scenario: A switch asks once per location
- **GIVEN** 50 city locations have been presented with the zone cities data loaded
- **WHEN** the interface language is switched
- **THEN** the city search was asked for at most 50 city labels

### Requirement: Zone line on location rows
The line of every city location row after its city, its zone line, SHALL consist of separate elements in this order: the country name in the interface language, the zone abbreviation at the effective instant (see the `zone-abbreviations` capability) and the UTC offset. The country name MUST be shown only while the zone label shows the country, the zone abbreviation only while it shows the zone abbreviation, and the UTC offset only while it shows the UTC offset (see the `settings` capability). An element that is hidden or unknown — a hidden part, a zone without a country, a zone without a zone abbreviation, an offset that cannot be computed — MUST leave no element, no empty space and no separator behind; when no element is left, the row MUST show no zone line and no empty line. While the UTC offset is shown, a zone abbreviation that reads the same as the UTC offset text MUST NOT be shown, so the `UTC` zone reads `UTC` once; while the UTC offset is hidden, that zone abbreviation MUST be shown, so the `UTC` zone still reads `UTC`. A city location in the zone `UTC` MUST show the Universal Time label — "Universal Time" in English, «Всемирное время» in Russian — in place of the country name; the label MUST be shown only while the zone label shows the country, and the zone abbreviation and UTC offset of that row MUST follow the zone label unchanged. A change of the zone label MUST apply to every row in the same render, without a reload and without a loading state; it MUST NOT change the city label, the local time, the offset difference, the day track or any accessible name. Inputs: the location, the effective instant, the interface language, the zone label. Output: the zone line elements. Errors: none beyond the existing rule for an unknown zone. <!-- implements FR5, FR13, UX1, UX2 of show-zone-abbreviations-and-zone-label-setting; FR3, UX2 of add-country-to-zone-label; FR19 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Country, abbreviation and offset
- **GIVEN** the interface language is Russian
- **AND** the zone label shows the country, the zone abbreviation and the UTC offset
- **AND** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Kolkata
- **WHEN** the user opens the app
- **THEN** the Kolkata row's zone line elements are `Индия`, `IST`, `UTC+5:30`

#### Scenario: The zone label decides the elements
- **GIVEN** the interface language is English
- **AND** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Kolkata
- **WHEN** the zone label shows `<parts>`
- **THEN** the Kolkata row's zone line elements are `<elements>`

| parts | elements |
|---|---|
| the country, the zone abbreviation and the UTC offset | India, IST, UTC+5:30 |
| the country and the UTC offset | India, UTC+5:30 |
| the country and the zone abbreviation | India, IST |
| the country only | India |
| the zone abbreviation and the UTC offset | IST, UTC+5:30 |
| the UTC offset only | UTC+5:30 |
| the zone abbreviation only | IST |
| nothing | no element |

#### Scenario: No zone line when every part is hidden
- **GIVEN** the list contains Kolkata
- **WHEN** the zone label shows nothing
- **THEN** the Kolkata row shows its city, its local time and its offset difference, and no zone line

#### Scenario: The abbreviation follows the reference moment
- **GIVEN** the list contains New York and Dublin
- **AND** the current instant is `2026-01-15T12:00:00Z`
- **WHEN** the user opens the app
- **THEN** New York shows `EST` and Dublin shows `GMT`
- **WHEN** the user pins the moment to `2026-07-15T12:00:00Z`
- **THEN** New York shows `EDT` and Dublin shows `IST`

#### Scenario: Unknown elements leave nothing behind
- **GIVEN** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Almaty and a location whose zone the browser does not know (for example `Mars/Olympus_Mons`)
- **WHEN** the user opens the app
- **THEN** the Almaty row's zone line elements are `Kazakhstan`, `UTC+5`
- **AND** the other row shows no zone line and no empty line

#### Scenario: UTC with the zone abbreviation only
- **GIVEN** the interface language is English
- **AND** the zone label shows the zone abbreviation only
- **AND** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains UTC
- **WHEN** the user opens the app
- **THEN** the UTC row's zone line elements are `UTC`

#### Scenario: Universal Time on the UTC row
- **GIVEN** the interface language is `<language>`
- **AND** the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Almaty and UTC
- **WHEN** the zone label shows `<parts>`
- **THEN** the Almaty row's zone line elements are `<almaty>`
- **AND** the UTC row's zone line elements are `<utc>`

| language | parts | almaty | utc |
|---|---|---|---|
| English | the country, the zone abbreviation and the UTC offset | Kazakhstan, UTC+5 | Universal Time, UTC |
| Russian | the country, the zone abbreviation and the UTC offset | Казахстан, UTC+5 | Всемирное время, UTC |
| English | the zone abbreviation and the UTC offset | UTC+5 | UTC |
| English | the country only | Kazakhstan | Universal Time |
| English | nothing | no element | no element |

#### Scenario: A change applies to every row at once
- **GIVEN** the list contains Moscow, Kolkata and the device time location
- **WHEN** the user turns the zone abbreviation off in the settings and goes back
- **THEN** no row shows a zone abbreviation
- **AND** the city labels, local times and offset differences are unchanged

#### Scenario: Hiding the country applies to every row at once
- **GIVEN** the interface language is English
- **AND** the list contains Moscow, Kolkata, UTC and the device time location
- **WHEN** the user turns the country off in the settings and goes back
- **THEN** no row shows `Russia`, `India` or `Universal Time`
- **AND** the UTC row's zone line elements are `UTC`
- **AND** the device time location still shows `Device time`
- **AND** the city labels, local times and offset differences are unchanged

### Requirement: Zone line layout
The zone line SHALL join its elements with a middle dot (` · `) at even spacing, in the muted foreground colour. It MUST wrap only between its elements; the zone abbreviation and the UTC offset MUST each stay on one line, and the country name MAY wrap between its words. Where the line wraps no dot MUST be shown: no line of the zone line starts or ends with a dot. The dots MUST be hidden from assistive technology, so the accessible text of the zone line is its elements separated by spaces. No element MUST be cut or end in an ellipsis: the card grows in height instead. At 320, 390, 768, 820, 1024 and 1440 px the page MUST NOT scroll horizontally and no zone line element MUST be clipped, also in the heaviest case: Adelaide in January (`ACDT`, `UTC+10:30`) in a list with a location whose country name has at least 20 characters. <!-- implements NFR-R1, NFR-R3, UX1 of show-zone-abbreviations-and-zone-label-setting; FR9, NFR-R1 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Elements joined by middle dots
- **GIVEN** the interface language is Russian and the current instant is `2026-07-15T12:00:00Z`
- **AND** the list contains Moscow
- **WHEN** the list is shown 390 px wide
- **THEN** Moscow's zone line reads «Россия · МСК · UTC+3», the dots in the muted foreground colour

#### Scenario: No dot at a wrap
- **GIVEN** the interface language is Russian and the current instant is `2026-01-15T12:00:00Z`
- **AND** the list contains St. Vincent
- **WHEN** the list is shown 320 px wide and its zone line takes more than one line
- **THEN** no line of the zone line starts or ends with a dot
- **AND** `AST` and `UTC−4` are each on one line

#### Scenario: No overflow and no clipping
- **GIVEN** the interface language is `<language>`
- **AND** the current instant is `2026-01-15T12:00:00Z`
- **AND** the list contains Adelaide and St. Vincent
- **WHEN** the list is shown `<width>` px wide
- **THEN** the page does not scroll horizontally
- **AND** no zone line element is clipped or ends in an ellipsis
- **AND** Adelaide shows `ACDT` and `UTC+10:30`, each on one line

| language | width |
|---|---|
| Russian | 320 |
| Russian | 390 |
| English | 768 |
| English | 820 |
| English | 1024 |
| Russian | 1440 |

#### Scenario: Wrapping between elements only
- **GIVEN** the list is shown 320 px wide in Russian
- **AND** the list contains St. Vincent and the current instant is `2026-01-15T12:00:00Z`
- **WHEN** its zone line does not fit on one line
- **THEN** it wraps between elements or between words of the country name
- **AND** `AST` and `UTC−4` are each on one line

#### Scenario: Re-approved screenshots
- **GIVEN** an approved screenshot state that shows a card
- **WHEN** it is rendered at its approved width and theme
- **THEN** it matches the screenshot re-taken once for the redesign, with the zone line joined by middle dots

#### Scenario: Dots are not read
- **GIVEN** the interface language is English and the list contains Kolkata
- **WHEN** the zone line's accessible text is read
- **THEN** it contains no middle dot

### Requirement: Zone line is fast
Presenting 50 location rows again at another minute of the same day, with the zone abbreviation and the UTC offset shown, SHALL build no date, time or region name formatter and MUST look up no time zone transition. Reading the zone abbreviation of a row MUST cost at most 2 extra zone lookups when its zone has an abbreviation pair and none when it has one or no abbreviation. These bounds are counted, never timed; the time of presenting 50 rows is measured by the timing benchmark, whose result does not fail the pull request check. <!-- implements NFR-P1 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: 50 rows within the work bound
- **GIVEN** 50 locations whose rows have been presented once with the zone abbreviation and the UTC offset
- **WHEN** their rows are presented again at another minute of the same day
- **THEN** no date, time or region name formatter is built
- **AND** no time zone transition is looked up

#### Scenario: Extra zone lookups per row
- **GIVEN** the list contains New York (`America/New_York`, an abbreviation pair and a clock change), Santiago (`America/Santiago`, a clock change with numeric designations only), Moscow (`Europe/Moscow`, one abbreviation) and Almaty (`Asia/Almaty`, no abbreviation)
- **AND** the current instant is `2026-07-15T12:00:00Z`
- **WHEN** the rows are presented with the zone abbreviation and the UTC offset shown
- **THEN** New York has at most 2 more zone lookups than Santiago
- **AND** Moscow has as many zone lookups as Almaty

### Requirement: Coordinates of a city location
A city location added from a search result or a suggestion SHALL hold the coordinates of that city record. Inputs: the coordinates of the city record, or none. Effects: the added location holds them. Errors: none of its own — a location added without coordinates is valid. Coordinates MUST NOT be part of the location identity: a namesake of the same zone stays a duplicate whatever its coordinates. A location in UTC MUST hold no coordinates, and the device time location MUST never hold any. Coordinates MUST NOT be shown and MUST NOT change any row, mark, order or text of the list. <!-- implements FR6, FR9, UX1 of add-city-coordinates-to-locations -->

#### Scenario: A city added from the search
- **WHEN** the user adds Kazan from the search
- **THEN** the location Kazan holds the coordinates 55.8, 49.1

#### Scenario: A city added by its zone abbreviation
- **WHEN** the user searches for `IST` and adds Kolkata
- **THEN** the location Kolkata holds the coordinates 22.5, 88.4

#### Scenario: UTC
- **WHEN** the user adds UTC
- **THEN** the location UTC holds no coordinates

#### Scenario: The device time location
- **GIVEN** the device time zone is `Europe/Moscow`
- **WHEN** the user adds the device time location
- **THEN** the device time location holds no coordinates

#### Scenario: A namesake of the same zone is still a duplicate
- **GIVEN** the list holds Springfield in `America/Chicago` with the coordinates 39.8, −89.6
- **WHEN** the user adds Springfield in `America/Chicago` with the coordinates 37.2, −93.3
- **THEN** the location is rejected as a duplicate
- **AND** the listed Springfield keeps the coordinates 39.8, −89.6

#### Scenario: Rows are unchanged
- **GIVEN** the list holds Kazan with coordinates
- **WHEN** the list is shown in the Cards view and in the Grid view
- **THEN** every row shows the same content as for Kazan without coordinates

### Requirement: Coordinates are kept on the device
The stored list SHALL hold the coordinates of every city location that has them and SHALL restore them when the app is opened again, also offline. The stored document version MUST be 4. A version 3 list, which holds no coordinates, MUST be migrated on load to the same locations, order and home without coordinates, with no write on load. A stored city entry without coordinates MUST be read as a location without coordinates. A stored entry whose coordinates are present but incomplete, not numbers or out of range (latitude −90 to 90, longitude −180 to 180) MUST make the stored list unreadable, as every other invalid entry does: the load error with Reset is shown and the stored value is not overwritten. An entry of the device time location that holds coordinates MUST make the stored list unreadable as well. Coordinates MUST reach the other open tabs with the list. <!-- implements FR7, FR9 of add-city-coordinates-to-locations -->

#### Scenario: Coordinates survive a reload
- **GIVEN** the user added Kazan
- **WHEN** the app is opened again without a network connection
- **THEN** the location Kazan holds the coordinates 55.8, 49.1

#### Scenario: A list stored before coordinates
- **GIVEN** a version 3 stored list holds the device time location, Moscow and Almaty, and Moscow is home
- **WHEN** the app is opened
- **THEN** the list is the device time location, Moscow, Almaty without coordinates
- **AND** Moscow is home
- **AND** the stored list was not written on load

#### Scenario: A document newer than the app
- **GIVEN** the stored list has the document version 5
- **WHEN** the app is opened
- **THEN** the stored list is unreadable

#### Scenario: Malformed coordinates make the list unreadable
- **GIVEN** the stored entry of Moscow has `<coordinates>`
- **WHEN** the app is opened
- **THEN** the stored list is unreadable
- **AND** the stored value is not overwritten

| coordinates |
|---|
| a latitude and no longitude |
| the latitude "55.8" as text |
| the latitude 91 |
| the longitude −181 |

#### Scenario: The device time location is stored without coordinates
- **GIVEN** the list is the device time location and Kazan
- **WHEN** the list is written
- **THEN** the stored entry of the device time location holds no coordinates

#### Scenario: A stored device time location with coordinates
- **GIVEN** the stored entry of the device time location holds coordinates
- **WHEN** the app is opened
- **THEN** the stored list is unreadable

#### Scenario: Another tab receives the coordinates
- **GIVEN** the app is open in two tabs
- **WHEN** the user adds Kazan in the first tab
- **THEN** the location Kazan of the second tab holds the coordinates 55.8, 49.1

### Requirement: Stored locations gain coordinates
When the city data is loaded, every city location without coordinates SHALL gain the coordinates of the city record that names its city label; when no city record of its zone bears the stored label, it MUST gain those of the zone city of its zone; when that has none either, as for UTC, it stays without. The list MUST then be written once, and the other open tabs receive it. When no location gained coordinates, nothing MUST be written. Order, home location, identity and every visible row MUST stay unchanged, and no message is shown. A failed load of the city data MUST leave the list as it is, with no error; a later load gives the coordinates. <!-- implements FR8, UX2, G2 of add-city-coordinates-to-locations -->

#### Scenario: An older list gains coordinates
- **GIVEN** the stored list holds Moscow and Kazan without coordinates
- **WHEN** the app is opened and the city data finishes loading
- **THEN** Moscow holds the coordinates 55.8, 37.6
- **AND** Kazan holds the coordinates 55.8, 49.1
- **AND** the list was written exactly once

#### Scenario: A label no record bears
- **GIVEN** the stored list holds a location labelled "Old Town" in `Europe/Moscow` without coordinates
- **WHEN** the city data finishes loading
- **THEN** the location holds the coordinates 55.8, 37.6 of the zone city Moscow

#### Scenario: UTC stays without coordinates
- **GIVEN** the stored list holds UTC
- **WHEN** the city data finishes loading
- **THEN** UTC holds no coordinates
- **AND** the list was not written

#### Scenario: Nothing to give
- **GIVEN** every city location of the stored list holds coordinates
- **WHEN** the city data finishes loading
- **THEN** the list was not written

#### Scenario: Order and home are kept
- **GIVEN** the stored list is Almaty, Moscow, Kazan without coordinates and Moscow is home
- **WHEN** the city data finishes loading
- **THEN** the list is Almaty, Moscow, Kazan in that order
- **AND** Moscow is home

#### Scenario: The city data fails to load
- **GIVEN** the stored list holds Moscow without coordinates
- **WHEN** the city data fails to load
- **THEN** Moscow holds no coordinates
- **AND** no error is shown
- **AND** the list was not written

### Requirement: Coordinates cost no extra work
Giving stored locations their coordinates SHALL look up one city record per city location that lacks coordinates, once per load of the city data, and MUST normalize no text. When every city location holds coordinates, loading the city data MUST look up no coordinates. A minute tick MUST look up none. Presenting the list MUST do the same counted work as without coordinates. <!-- implements NFR-P2, NFR-P3 of add-city-coordinates-to-locations -->

#### Scenario: One lookup per location that lacks coordinates
- **GIVEN** the stored list holds Moscow with coordinates and Kazan and Almaty without
- **WHEN** the city data finishes loading
- **THEN** exactly 2 coordinate lookups were made

#### Scenario: No lookup when nothing is missing
- **GIVEN** every city location of the stored list holds coordinates
- **WHEN** the city data finishes loading
- **THEN** no coordinate lookup was made

#### Scenario: A minute tick looks up nothing
- **GIVEN** the city data is loaded and the list holds Kazan
- **WHEN** a minute passes
- **THEN** no coordinate lookup was made

#### Scenario: Presenting the list does the same work
- **GIVEN** the list holds Kazan and Moscow with coordinates
- **WHEN** the list is presented
- **THEN** as many formatters, collators and transition lookups were built as for the same list without coordinates

### Requirement: Narrow card layout
Below 768 px wide, every card of the Cards view SHALL have the surface background, a 1 px border in the card border token colour, a radius of 14 px and a padding of 10 px at the top, 15 px at the sides and 11 px at the bottom; from 411 px wide the side padding is 18 px, and up to 360 px wide the padding is 13 px. Cards MUST stand 12 px apart and the list MUST have a side padding of 13 px. Line 1 MUST hold the leading mark, the city (24 px, weight 700) and the offset difference, and at the right the local time (26 px, weight 700, tabular figures) followed, 14 px after it, by the location menu button. Line 2 MUST hold the zone line at the left and the local date at the right (14 px, muted foreground colour). The day track MUST stand 12 px under line 2. From 411 px wide the city is 26 px, the time 28 px and line 2 15 px; up to 360 px wide the city is 21 px, the time 24 px and line 2 13 px. The card MUST show no drag handle and no visible "here" caption. The surface is one flat colour with no gradient. The wall-time hint and the clock change note stay the last element of the card, under the track. Inputs: the presented location row and the viewport width. Output: the card. Errors: none. <!-- implements FR1, FR7, FR10, FR15, NFR-R1 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Card sizes on a phone
- **GIVEN** the stored locations are Almaty, Moscow, Kolkata and New York and home is Almaty
- **WHEN** the list is shown `<width>` px wide
- **THEN** each card has a 14 px radius and a 1 px border in the card border colour
- **AND** the city is `<city>` px, the time `<time>` px and the zone line and the date `<meta>` px
- **AND** neighbouring cards are 12 px apart

| width | city | time | meta |
|---|---|---|---|
| 320 | 21 | 24 | 13 |
| 390 | 24 | 26 | 14 |
| 411 | 26 | 28 | 15 |

#### Scenario: Lines of a narrow card
- **GIVEN** the stored locations are Almaty and Moscow and home is Almaty
- **WHEN** the list is shown 390 px wide
- **THEN** Moscow's city, offset difference, time and location menu button are on one line, the button right of the time
- **AND** Moscow's zone line and date are on the next line, the date at the right edge of the card's content
- **AND** Moscow's day track is under that line

### Requirement: Wide card layout
From 768 px wide, every card SHALL have two lines and no other layout: line 1 holds the leading mark, the city (26 px), the offset difference and the zone line (15 px) on one baseline, and at the right the local date (15 px), the local time (28 px) and the location menu button; line 2 holds the day track across the card's content width with the hour labels under it. The card padding MUST be 12 px at the top and bottom and 20 px at the sides; the other values are those of "Narrow card layout". The former one-row layout, with the city, the time and the track in one row, MUST NOT be shown at any width. Inputs: the presented location row and the viewport width. Output: the card. Errors: none. <!-- implements FR11, NFR-R1 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Two lines from 768 px
- **GIVEN** the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the list is shown `<width>` px wide
- **THEN** Moscow's city, zone line, date, time and location menu button are on one line
- **AND** Moscow's day track is under that line and spans the card's content width, within 1 px

| width |
|---|
| 768 |
| 820 |
| 1024 |
| 1440 |
| 2560 |

### Requirement: Card growth
A card SHALL grow in height instead of cutting any text. A long city MUST wrap onto more lines, never be cut and never end in an ellipsis, and the offset difference follows it. When the city and the time do not fit on one line, the time with the location menu button MUST move to its own line at the right of the card. The zone line wraps between its parts (see "Zone line layout"). In the 12-hour format the day period marker (`AM`, `PM`) MUST be 14 px, weight 700, 4 px after the digits, at every width. Splitting the day period marker from the digits MUST reuse the formatter that writes the local time: presenting the rows again in the same language and reference day builds no date, time or region name formatter. Inputs: the presented row, the viewport width, the hour format. Output: the card's lines. Errors: none. <!-- implements FR8, NFR-R1, NFR-P1 of redesign-cards-grid-and-day-palettes -->

#### Scenario: A long city wraps and the time drops
- **GIVEN** the interface language is Russian, the hour format is 12-hour and the list contains Petropavlovsk-Kamchatsky («Петропавловск-Камчатский», `Asia/Kamchatka`)
- **WHEN** the list is shown 320 px wide
- **THEN** the city is shown whole, without an ellipsis, on one or more lines
- **AND** the time and the location menu button are on a line of their own at the right edge of the card
- **AND** the page does not scroll horizontally

#### Scenario: Small day period marker
- **GIVEN** the interface language is English and the hour format is 12-hour
- **AND** the current time is `2026-03-08T07:30:00Z` and the list contains Almaty
- **WHEN** the list is shown `<width>` px wide
- **THEN** Almaty's time reads `12:30 PM`
- **AND** `PM` is 14 px with weight 700 and starts 4 px after the digits, within 1 px

| width |
|---|
| 390 |
| 820 |

#### Scenario: Presenting 50 rows again in the 12-hour format builds no formatter
- **GIVEN** the interface language is English, the hour format is 12-hour and 50 location rows have been presented once
- **WHEN** the same 50 rows are presented again in the same language and reference day
- **THEN** every row's local time has its day period marker split from the digits
- **AND** no date, time or region name formatter is built

### Requirement: Move a location from its location menu
The location menu of every row SHALL offer "Move up" («Поднять выше») and "Move down" («Опустить ниже») between the home action and "Remove". Move up MUST move the location one position up and Move down one position down, by the rule of "Move a location"; Move up MUST be disabled on the first row and Move down on the last, and both on a list of one location. A disabled item MUST be exposed as disabled, MUST be skipped by the arrow keys and MUST do nothing when activated. After a move the menu closes and focus MUST be on the moved location's menu button. The move MUST be announced politely with the city and the new position ("Moscow moved to position 1 of 3"). These items are the keyboard way and the single-pointer alternative to dragging. In the Grid view, while a meeting range is set, the menu is locked with them. Inputs: the location and the chosen item. Effects: the list order as "Move a location"; the new order is kept and shared. Errors: location not found; the list stays unchanged. <!-- implements FR16, NFR-A3 of redesign-cards-grid-and-day-palettes -->

#### Scenario: Move up from the menu
- **GIVEN** the list is Almaty, Moscow, New York
- **WHEN** the user chooses "Move up" in Moscow's location menu
- **THEN** the list is Moscow, Almaty, New York in that order
- **AND** focus is on Moscow's location menu button
- **AND** the announcement reads "Moscow moved to position 1 of 3"

#### Scenario: Move down with the keyboard only
- **GIVEN** the list is Almaty, Moscow, New York
- **WHEN** the user opens Almaty's location menu with Enter, moves to "Move down" with the arrow keys and presses Enter
- **THEN** the list is Moscow, Almaty, New York in that order
- **AND** focus is on Almaty's location menu button

#### Scenario: Items that cannot apply are disabled
- **GIVEN** the list is Almaty, Moscow
- **WHEN** the user opens Almaty's location menu
- **THEN** "Move up" is disabled and "Move down" is enabled
- **WHEN** the user opens Moscow's location menu
- **THEN** "Move up" is enabled and "Move down" is disabled

#### Scenario: Menu order
- **GIVEN** the interface language is Russian and the list is Almaty, Moscow, New York
- **WHEN** the user opens Moscow's location menu
- **THEN** it offers «Сделать домашним», «Поднять выше», «Опустить ниже», «Удалить» in that order
