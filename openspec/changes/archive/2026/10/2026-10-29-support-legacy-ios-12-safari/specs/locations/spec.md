# Spec Delta

## MODIFIED Requirements

### Requirement: Reorder cards by dragging
When the list holds at least 2 locations, every card in the Cards view SHALL have a drag handle, and dragging a card by its handle with a mouse, a pen or a finger and dropping it over another card's position MUST move that location there. Dragging MUST start only from the handle, so scrolling over a card and the remove action keep working; a mouse drag MUST start only after the pointer moved at least 4 CSS px. A drag cancelled with Esc, dropped outside the list or dropped at the card's own position MUST leave the list as it was and MUST NOT write anything to storage. A list with 1 location MUST show no handle. Reorder needs no network and behaves the same offline. On an engine without Pointer Events, a finger drag MUST start after the finger has held the handle for a short delay without moving away, and the page MUST NOT scroll while the card is dragged; a swipe that moves away before the delay MUST scroll the page as usual. On engines with Pointer Events the drag sensors MUST NOT change. <!-- implements FR1, FR3, NFR-R2, UX3 of reorder-locations-by-drag-and-drop; FR9, UX2 of support-legacy-ios-12-safari -->

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
