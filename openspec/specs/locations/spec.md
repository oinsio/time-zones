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
When the list holds at least 2 locations, every card in the Cards view SHALL have a drag handle, and dragging a card by its handle with a mouse, a pen or a finger and dropping it over another card's position MUST move that location there. Dragging MUST start only from the handle, so scrolling over a card and the remove action keep working; a mouse drag MUST start only after the pointer moved at least 4 CSS px. A drag cancelled with Esc, dropped outside the list or dropped at the card's own position MUST leave the list as it was and MUST NOT write anything to storage. A list with 1 location MUST show no handle. Reorder needs no network and behaves the same offline. <!-- implements FR1, FR3, NFR-R2, UX3 of reorder-locations-by-drag-and-drop -->

#### Scenario: Drag a card to the top with the mouse
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user drags New York above Moscow with the mouse
- **THEN** the list is New York, Moscow, Almaty in that order

#### Scenario: Drag a card down by touch
- **GIVEN** the list is Moscow, Almaty, New York on a phone-sized touch screen
- **WHEN** the user drags Moscow below New York with a finger
- **THEN** the list is Almaty, New York, Moscow in that order

#### Scenario: Cancel a drag
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user drags Almaty below New York and presses Esc before dropping
- **THEN** the list is Moscow, Almaty, New York in that order
- **AND** nothing is written to storage

#### Scenario: Scrolling over a card scrolls the page
- **GIVEN** the list is Almaty, Moscow, Kolkata, Tokyo, New York on a touch screen too short to show the whole page
- **WHEN** the user swipes up with a finger over the city name of Almaty
- **THEN** the page scrolls down
- **AND** the list is Almaty, Moscow, Kolkata, Tokyo, New York in that order
- **AND** nothing is written to storage

#### Scenario: A single location has no handle
- **GIVEN** the list contains only Moscow
- **WHEN** the user opens the app
- **THEN** the Moscow card shows no drag handle

### Requirement: Reorder cards with the keyboard
The drag handle SHALL be reachable with Tab and operable with the keyboard: Space or Enter MUST pick the card up, the Up and Down arrow keys MUST move it by one position, Space or Enter MUST drop it, and Esc MUST cancel and restore the original order. After a drop or a cancel, focus MUST stay on the moved card's handle. Picking up, moving over a new position, dropping and cancelling MUST be announced through a live region with the city and the position, for example "Moscow moved to position 1 of 3". The handle's accessible name MUST include the city ("Move Moscow"). <!-- implements FR7, NFR-A2, NFR-A3, NFR-A5 of reorder-locations-by-drag-and-drop -->

#### Scenario: Move a card down with the keyboard
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user picks up Moscow with the keyboard, moves it down twice and drops it
- **THEN** the list is Almaty, New York, Moscow in that order
- **AND** focus is on the handle "Move Moscow"
- **AND** the announcement reads "Moscow dropped at position 3 of 3"

#### Scenario: Cancel a keyboard move
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user picks up Moscow with the keyboard, moves it down once and presses Esc
- **THEN** the list is Moscow, Almaty, New York in that order
- **AND** focus is on the handle "Move Moscow"

#### Scenario: Handle names the city
- **WHEN** the list is Moscow, Almaty
- **THEN** the list offers the actions "Move Moscow" and "Move Almaty"

### Requirement: Smooth reorder transitions
While a card is dragged, the cards it passes SHALL slide to their new places with a 200 ms transform transition, and the dropped card MUST settle into its slot with an animation of the same duration, so no card jumps between positions. The dragged card MUST stay on the list's vertical axis and keep its width, and the cards it has not passed MUST stay where they are, so the list keeps its height and the slot the card left stays open until the drop. When the system asks to reduce motion, cards MUST change places without a slide transition and without a drop animation, and reordering MUST still work. <!-- implements NFR-A4, UX1, UX2 of reorder-locations-by-drag-and-drop -->

#### Scenario: Displaced card slides
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user picks up Moscow with the keyboard and moves it down once
- **THEN** the Almaty card runs a 200 ms transform transition

#### Scenario: Dropped card settles into its slot
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user drags Moscow below Almaty with the mouse and releases it away from the centre of its new slot
- **THEN** the Moscow card settles into its slot with a 200 ms transform transition
- **AND** the list is Almaty, Moscow, New York in that order

#### Scenario: The dragged card keeps its width and its slot
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user drags Moscow with the mouse to the right and slightly down without passing another card
- **THEN** the Moscow card stays in its column, keeps its width and is raised above the others
- **AND** the list keeps its height and the Almaty card stays where it was

#### Scenario: Reduced motion
- **GIVEN** the system asks to reduce motion
- **AND** the list is Moscow, Almaty, New York
- **WHEN** the user picks up Moscow with the keyboard and moves it down once
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
The list with handles SHALL have no axe-core violations at rest and while a card is picked up with the keyboard, in the light and dark themes. The handle's target size MUST be at least 44 × 44 CSS px. A list of 5 locations with handles MUST NOT scroll horizontally at 320 px and 2560 px, also while a card is dragged. Moving a location in a list of 50 and presenting the rows again MUST take at most 50 ms, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: moving a location and presenting the 50 rows again MUST build no date, time or region name formatter and MUST look up no time zone transition. The drag-and-drop code MUST NOT be part of the initial JavaScript, which stays at most 150 KB gzipped. The approved "list" screenshots at 375 px and 1024 px in both themes MUST show the handles. <!-- implements NFR-P1, NFR-P2, NFR-A1, NFR-A5, NFR-R1, NFR-R3 of reorder-locations-by-drag-and-drop; FR1, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks -->

#### Scenario: No accessibility violations
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the list is checked with axe-core in the light or the dark theme, at rest and while Moscow is picked up with the keyboard
- **THEN** no violations are reported

#### Scenario: Handle target size
- **WHEN** the list is Moscow, Almaty
- **THEN** each handle is at least 44 × 44 CSS px

#### Scenario: Narrow and wide screens
- **GIVEN** the list is Almaty, Moscow, Kolkata, Tokyo, New York
- **WHEN** it is shown at 320 px or 2560 px and Almaty is picked up and moved down once
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

#### Scenario: List screenshots show the handles
- **GIVEN** the list state with Almaty and Moscow
- **WHEN** it is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the cards show the handles "Move Almaty" and "Move Moscow"
- **AND** the screen matches the re-approved "list" screenshot

### Requirement: Reorder strings are localized
Every reorder string — the handle name, the screen-reader instructions and the pick-up, move, drop and cancel announcements — SHALL exist in English and Russian with identical key sets and MUST be shown in the interface language. <!-- implements FR8 of reorder-locations-by-drag-and-drop -->

#### Scenario: Russian interface
- **GIVEN** the interface language is Russian
- **WHEN** the list contains Moscow and Almaty
- **THEN** the handle of Moscow is named with the Russian locale's move text for Moscow

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
