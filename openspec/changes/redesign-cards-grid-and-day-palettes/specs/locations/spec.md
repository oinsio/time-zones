## ADDED Requirements

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

## MODIFIED Requirements

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

#### Scenario: Icon before the city, no caption
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

### Requirement: Location menu
Each card and grid row SHALL have a location menu button showing "⋯" with a hit area of at least 44 × 44 px, on the first line of its row header, after the time. The menu has the surface background, the control border and the lift shadow, and its items are the home action, "Move up", "Move down" and "Remove", in this order. It MUST follow the WAI-ARIA menu button pattern: Enter, Space or Arrow Down open it on the first enabled item, the arrows move between enabled items, Enter activates, Esc closes it and returns focus to the button. Opening it MUST NOT start a reorder or move a day track's handle. In the Grid view, while a meeting range is set, the location menu button MUST be locked as "Row controls are locked while a meeting range is set" of `grid-view` says: it MUST NOT be a Tab stop, no pointer, finger or key MUST open the menu, and a menu open when the range is set MUST close; once the meeting range is removed the button MUST work again. The Cards view never locks it. <!-- implements FR11, NFR-A2, UX3 of set-home-location-and-show-differences; FR1, FR2 of fix-grid-meeting-range-lock-and-layering; FR1, FR7, FR16, NFR-A3 of redesign-cards-grid-and-day-palettes -->

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

## REMOVED Requirements

### Requirement: Reorder cards with the keyboard
**Reason**: `spec.md` §9 of the redesign removes the drag handle and with it the keyboard reorder through the handle (pick up with Space, move with arrows, drop).
**Migration**: The keyboard way to reorder is "Move up" and "Move down" in the location menu (requirement "Move a location from its location menu"); announcements of a move stay.
