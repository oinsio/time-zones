## MODIFIED Requirements

### Requirement: Reorder cards by dragging
When the list holds at least 2 locations, every card in the Cards view SHALL have a drag handle, and dragging a card by its handle with a mouse, a pen or a finger and dropping it over another card's position MUST move that location there. Dragging MUST start only from the handle, so scrolling over a card and the remove action keep working; a mouse drag MUST start only after the pointer moved at least 4 CSS px. A drag cancelled with Esc, dropped outside the list or dropped at the card's own position MUST leave the list as it was and MUST NOT write anything to storage. A list with 1 location MUST show no handle. Reorder needs no network and behaves the same offline. On an engine without Pointer Events, a finger drag MUST start after the finger has held the handle for a short delay without moving away, and the page MUST NOT scroll while the card is dragged; a swipe that moves away before the delay MUST scroll the page as usual. On engines with Pointer Events the drag sensors MUST NOT change. Grid rows carry the same drag handle; in the Grid view, while a meeting range is set, every drag handle MUST be locked as "Row controls are locked while a meeting range is set" of `grid-view` says: no drag MUST start from it, and it MUST work again once the meeting range is removed. The Cards view never locks it. <!-- implements FR1, FR3, NFR-R2, UX3 of reorder-locations-by-drag-and-drop; FR9, UX2 of support-legacy-ios-12-safari; FR1, FR2 of fix-grid-meeting-range-lock-and-layering -->

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

#### Scenario: Drag by finger without Pointer Events
- **GIVEN** the engine has no Pointer Events
- **AND** the list is Moscow, Almaty, New York
- **WHEN** the user holds the New York handle with a finger and drags it above Moscow
- **THEN** the list is New York, Moscow, Almaty in that order
- **AND** the page did not scroll during the drag

#### Scenario: A quick swipe over the handle scrolls without Pointer Events
- **GIVEN** the engine has no Pointer Events
- **AND** the list is Almaty, Moscow, Kolkata, Tokyo, New York on a touch screen too short to show the whole page
- **WHEN** the user swipes up over the Almaty handle without holding it first
- **THEN** the page scrolls down
- **AND** the list is Almaty, Moscow, Kolkata, Tokyo, New York in that order

#### Scenario: No drag in Grid while a meeting range is set
- **GIVEN** the Grid view with Moscow, Almaty, New York and the meeting range 09:00–11:00 in Almaty
- **WHEN** the user drags New York's handle above Moscow with the mouse
- **THEN** the list is Moscow, Almaty, New York in that order
- **AND** nothing is written to storage

### Requirement: Reorder cards with the keyboard
The drag handle SHALL be reachable with Tab and operable with the keyboard: Space or Enter MUST pick the card up, the Up and Down arrow keys MUST move it by one position, Space or Enter MUST drop it, and Esc MUST cancel and restore the original order. After a drop or a cancel, focus MUST stay on the moved card's handle. Picking up, moving over a new position, dropping and cancelling MUST be announced through a live region with the city and the position, for example "Moscow moved to position 1 of 3". The handle's accessible name MUST include the city ("Move Moscow"). In the Grid view, while a meeting range is set, the drag handle MUST NOT be a Tab stop and MUST NOT react to any key, and it MUST be reachable and operable again once the meeting range is removed. <!-- implements FR7, NFR-A2, NFR-A3, NFR-A5 of reorder-locations-by-drag-and-drop; FR1, FR2 of fix-grid-meeting-range-lock-and-layering -->

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

#### Scenario: No keyboard reorder in Grid while a meeting range is set
- **GIVEN** the Grid view with Moscow, Almaty, New York and the meeting range 09:00–11:00 in Almaty
- **WHEN** the user tabs through the rows
- **THEN** no handle "Move …" receives the focus
- **WHEN** the user clears the meeting range
- **THEN** the handle "Move Moscow" is a Tab stop again

### Requirement: Location menu
Each card SHALL have a location menu button showing "⋯" with a hit area of at least 44 × 44 px, in place of the former remove button. It MUST follow the WAI-ARIA menu button pattern: Enter, Space or Arrow Down open it on the first item, the arrows move between items, Enter activates, Esc closes it and returns focus to the button. Opening it MUST NOT start a reorder or move a day track's handle. In the Grid view, while a meeting range is set, the location menu button MUST be locked as "Row controls are locked while a meeting range is set" of `grid-view` says: it MUST NOT be a Tab stop, no pointer, finger or key MUST open the menu, and a menu open when the range is set MUST close; once the meeting range is removed the button MUST work again. The Cards view never locks it. <!-- implements FR11, NFR-A2, UX3 of set-home-location-and-show-differences; FR1, FR2 of fix-grid-meeting-range-lock-and-layering -->

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

#### Scenario: The menu is locked in Grid while a meeting range is set
- **GIVEN** the Grid view with Almaty and Moscow and the meeting range 09:00–11:00 in Almaty
- **WHEN** the user clicks Moscow's location menu button
- **THEN** no menu opens and the button is disabled
- **WHEN** the user clears the meeting range and clicks Moscow's location menu button
- **THEN** the menu opens

### Requirement: Accessible device time location
The device time location's row SHALL be an item of the numbered location list. Its accessible name MUST include the city, the Here mark label (or the Home mark label while it is home) and "Device time". Its location menu button MUST be named like a city card's ("Actions for Almaty"). Its time MUST be a wall-time input and its day track one Tab stop, named like a city card's. In the Grid view, while a meeting range is set, its drag handle, location menu button and wall-time input MUST be locked as a city card's are ("Row controls are locked while a meeting range is set" of `grid-view`). axe-core MUST report no violations with the device time location shown, alone, above cities and as home, in the light and the dark theme. <!-- implements NFR-A1, NFR-A2 of add-settings-page-and-device-time-location; FR1, FR2 of fix-grid-meeting-range-lock-and-layering -->

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
