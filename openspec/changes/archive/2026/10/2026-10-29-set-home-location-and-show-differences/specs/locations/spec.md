# Spec Delta

## ADDED Requirements

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
The difference text SHALL have a sign and the hours. Whole hours MUST carry the unit (`−2 h`, «−2 ч»). Hours with minutes MUST have no unit (`+0:30`, `−5:30`, `+5:45`). Zero MUST be `0 h` («0 ч») without a sign. The minus MUST be the typographic minus `−`. The text MUST stand right after the city and before the "here" caption, as secondary text, semi-bold and smaller than the city. <!-- implements FR6, UX1 of set-home-location-and-show-differences -->

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
Each card SHALL have a location menu button showing "⋯" with a hit area of at least 44 × 44 px, in place of the former remove button. It MUST follow the WAI-ARIA menu button pattern: Enter, Space or Arrow Down open it on the first item, the arrows move between items, Enter activates, Esc closes it and returns focus to the button. Opening it MUST NOT start a reorder or move a day track's handle. <!-- implements FR11, NFR-A2, UX3 of set-home-location-and-show-differences -->

#### Scenario: Keyboard
- **GIVEN** the list is Almaty and Moscow
- **WHEN** the user focuses Moscow's location menu button and presses Enter
- **THEN** the menu opens with focus on its first item
- **WHEN** the user presses Esc
- **THEN** the menu is closed and focus is on Moscow's location menu button

#### Scenario: The menu does not start a reorder
- **GIVEN** the list is Almaty and Moscow
- **WHEN** the user opens Moscow's location menu with a pointer
- **THEN** the list order is unchanged

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

## MODIFIED Requirements

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
The Cards view SHALL show one row per location, in list order, with the city label, the country name in the interface language and a location menu whose accessible name includes the city ("Actions for Moscow", «Действия: Москва»). The menu holds the remove action "Remove" («Удалить») and the home action of the `home-location` capability. It MUST also offer an "Add location" action that opens the search. After a removal, focus MUST move to the next location's menu button, or the previous one, or the "Add location" action when the list becomes empty. Adding and removing MUST be announced politely without moving focus. Adding and removing a location are part of the view contract: these behaviours MUST hold for every registered view, not only Cards. <!-- implements FR10, FR17, NFR-A3, UX5 of add-locations-via-search ; FR11, NFR-A2 of set-home-location-and-show-differences -->

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
- **THEN** focus is on the "Add location" action

### Requirement: List is kept on the device
The list SHALL be saved on the device as a versioned document, together with the home location, and restored in the same order when the app is opened again, also offline. A document of the previous version MUST be migrated on load: it keeps its locations and order and has no home. Nothing MUST be written for the list until the user first changes it or the home location. A stored identifier that is a known legacy alias MUST be canonicalized on load. <!-- implements FR9, FR11, FR16, UX4 of add-locations-via-search ; FR8 of set-home-location-and-show-differences -->

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

#### Scenario: Previous document version is migrated
- **GIVEN** the stored list is a version 1 document with Almaty, Moscow and Kolkata
- **WHEN** the app is opened
- **THEN** the list is Almaty, Moscow, Kolkata in that order
- **AND** no location is home
- **AND** the stored list was not written

### Requirement: Unreadable stored list
When the stored list is not valid JSON, does not match the expected document, contains an identifier that is not a valid IANA zone, or was written by a newer version of the app, the Cards view SHALL show an error message with a reset action and MUST NOT show a blank page. A stored home location that points to a location missing from the stored list MUST NOT make the list unreadable: home is cleared on load and the list is shown (see the `home-location` capability). A home that is not a location identifier at all (for example a number) MUST make the list unreadable. Reset MUST clear the stored list and show the empty state. <!-- implements FR12 of add-locations-via-search ; FR9 of set-home-location-and-show-differences -->

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

#### Scenario: Home of the wrong type
- **GIVEN** the stored list holds Almaty and its home is the number `5`
- **WHEN** the app is opened
- **THEN** an error message with a reset action is shown

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

### Requirement: Here mark on location rows
A location row SHALL show the "here" mark when the location's canonical IANA identifier equals the device time zone. Every matching row MUST show it, except the home location's row, which shows the home mark instead (see the `home-location` capability); no other row MAY show it. The mark MUST have two parts on the city line: a location-arrow icon before the city name, and a "here" caption right after the city name. A row without the mark MUST show neither part, and its city MUST start the line with no empty space reserved for an icon. No row MAY show the former "Your time zone" pill in any language. Equality MUST be by canonical IANA identifier, never by UTC offset or equal rules. The device time zone MUST be read through the app's time abstraction when the app starts, at the start of every minute while the page is visible, and when the page becomes visible again, and canonicalized each time. An identifier the browser does not know MUST be treated as `UTC`. The device time zone MUST NOT be stored and MUST NOT be read on list changes between those moments. Adding, removing, moving or resetting locations and changes from another tab MUST keep the rule true for every row. Inputs: the listed locations' canonical identifiers and the device time zone identifier. Output: which rows show the mark. Errors: none; an unknown device identifier falls back to `UTC`. The mark needs no network and behaves the same offline. <!-- implements FR1, FR2, FR3, FR4, UX1 of mark-device-time-zone-in-location-list; FR4 of show-local-time-and-date-on-location-cards; FR1, FR2, FR5, UX3 of match-here-mark-to-design ; FR7 of set-home-location-and-show-differences -->

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

#### Scenario: The home row shows no here mark
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row shows no here mark and no caption "here"

### Requirement: Here mark is accessible and fits every screen
The accessible name of a row SHALL be its city, followed by its leading mark's accessible label when it has one, followed by its offset difference's accessible text when it has one ("Almaty You are here", "Moscow 2 hours behind"). A row with neither MUST be named by its city alone. The icon MUST be exposed to assistive technology as an image named by the accessible label. The caption MUST be hidden from assistive technology, so the mark is not announced twice. Presenting 50 locations with the mark rule MUST take at most 50 ms, and the mark MUST appear in the same render as its row, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: presenting 50 rows for the first time in a language MUST build at most 3 date and time formatters per distinct time zone and at most 1 region name formatter. A list with a marked row MUST have no axe-core violations in the light and dark themes, MUST NOT scroll horizontally at 320 px and 2560 px, and the approved screenshots of the list, pinned, calendar and time-selected states at 375 px and 1024 px in both themes MUST show the mark on the matching row. <!-- implements NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2 of mark-device-time-zone-in-location-list; FR2, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks; NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2 of match-here-mark-to-design ; NFR-A3 of set-home-location-and-show-differences -->

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
- **WHEN** the list, pinned, calendar or time-selected state is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the Almaty row shows the here mark and the Moscow row does not
- **AND** the screen matches the re-approved screenshot

### Requirement: One leading mark per row
A location row SHALL show at most one leading mark, in the slot before the city name. The mark's kind MUST decide its icon, its accessible label and whether it has a visible caption. Every kind the app knows MUST have an icon and an accessible label defined in both locales. A kind with a caption MUST have the caption defined in both locales too. The kinds are "here" (location arrow, label "You are here", caption "here") and "home" (house, label "Home location" / «Домашнее место», no caption). A row that is both home and in the device time zone MUST show "home". Inputs: the row's location, the home location and the device time zone. Output: the row's mark kind, or none. Errors: none. Every kind MUST take the same slot and MUST NOT add a second leading icon to a row. <!-- implements FR4 of match-here-mark-to-design ; FR7 of set-home-location-and-show-differences -->

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

#### Scenario: Home wins over here
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** the Almaty row has exactly 1 leading mark, of the kind "home"

### Requirement: Local time and date layout
The time SHALL be the most prominent text of a card — larger and bolder than the city — and MUST use tabular figures; the date MUST be secondary text directly under the time. On screens narrower than 768 px the time MUST be on the city line at the right end of the card's content, before the location menu button, with the date right-aligned under it. On screens 768 px and wider the time and the date MUST form a column right after the city and country column, within the left half of the card, with the date left-aligned under the time. A list with times and dates MUST NOT scroll horizontally at 320 px and 2560 px, and the approved "list" screenshots at 375 px and 1024 px in both themes, taken at the pinned instant `2026-03-08T07:30:00Z`, MUST show `12:30` on Almaty and `10:30` on Moscow with their dates. <!-- implements NFR-R1, NFR-R2, NFR-R3, UX1, UX2 of show-local-time-and-date-on-location-cards ; UX3 of set-home-location-and-show-differences -->

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
