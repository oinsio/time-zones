## ADDED Requirements

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
While a card is dragged, the cards it passes SHALL slide to their new places with a 200 ms transform transition, and the dropped card MUST settle into its slot with an animation of the same duration, so no card jumps between positions. The dragged card MUST stay on the list's vertical axis and keep its width. When the system asks to reduce motion, cards MUST change places without a slide transition and without a drop animation, and reordering MUST still work. <!-- implements NFR-A4, UX1, UX2 of reorder-locations-by-drag-and-drop -->

#### Scenario: Displaced card slides
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the user picks up Moscow with the keyboard and moves it down once
- **THEN** the Almaty card runs a 200 ms transform transition

#### Scenario: Reduced motion
- **GIVEN** the system asks to reduce motion
- **AND** the list is Moscow, Almaty, New York
- **WHEN** the user picks up Moscow with the keyboard and moves it down once
- **THEN** the Almaty card runs no transition
- **AND** after the drop the list is Almaty, Moscow, New York in that order

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
The list with handles SHALL have no axe-core violations at rest and while a card is picked up with the keyboard, in the light and dark themes. The handle's target size MUST be at least 44 × 44 CSS px. A list of 5 locations with handles MUST NOT scroll horizontally at 320 px and 2560 px, also while a card is dragged. Moving a location in a list of 50 and presenting the rows again MUST take at most 50 ms, with no loading state. The approved "list" screenshots at 375 px and 1024 px in both themes MUST show the handles. <!-- implements NFR-P1, NFR-A1, NFR-A5, NFR-R1, NFR-R3 of reorder-locations-by-drag-and-drop -->

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
- **GIVEN** 50 locations
- **WHEN** the last one is moved to the top and the rows are presented
- **THEN** it takes at most 50 ms

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
