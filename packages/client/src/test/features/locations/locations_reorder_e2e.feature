Feature: Reorder locations in a real browser
  Implements change reorder-locations-by-drag-and-drop.
  As a user I drag a card with a mouse, a finger or the keyboard, the other
  cards slide out of the way, and the order is there when I come back.

  @reorder-locations-by-drag-and-drop @FR1 @NFR-R2
  Scenario: Drag a card to the top with the mouse
    Given the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    When the user drags "New York" above "Moscow" with the mouse
    Then the locations list order is "New York", "Moscow", "Almaty"

  @reorder-locations-by-drag-and-drop @FR1 @NFR-R2
  Scenario: Drag a card down by touch
    Given the screen is 375 px wide for the locations
    And the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    When the user drags "Moscow" below "New York" with a finger
    Then the locations list order is "Almaty", "New York", "Moscow"

  @reorder-locations-by-drag-and-drop @FR3 @M5
  Scenario: Cancel a drag
    Given the stored locations are "Moscow", "Almaty", "New York"
    And location writes are counted
    And the user opens the locations app
    When the user drags "Almaty" below "New York" with the mouse and presses Escape before dropping
    Then the locations list order is "Moscow", "Almaty", "New York"
    And no location write happened

  @reorder-locations-by-drag-and-drop @FR1
  Scenario: A single location has no handle
    Given the stored locations are "Moscow"
    And the user opens the locations app
    Then the list offers no move handle "Move Moscow"

  @reorder-locations-by-drag-and-drop @UX3
  Scenario: A click on the handle is not a drag
    Given the stored locations are "Moscow", "Almaty", "New York"
    And location writes are counted
    And the user opens the locations app
    When the user clicks the move handle "Move Almaty"
    Then the locations list order is "Moscow", "Almaty", "New York"
    And no location write happened
    When the user removes "New York"
    Then the locations list order is "Moscow", "Almaty"

  @reorder-locations-by-drag-and-drop @UX3
  Scenario: Scrolling over a card scrolls the page
    Given the screen is 375 by 300 px for the locations
    And the stored locations are "Almaty", "Moscow", "Kolkata", "Tokyo", "New York"
    And location writes are counted
    And the user opens the locations app
    And the page is taller than the screen
    When the user swipes up over the city name of "Almaty" with a finger
    Then the page has scrolled down
    And the locations list order is "Almaty", "Moscow", "Kolkata", "Tokyo", "New York"
    And no location write happened

  @reorder-locations-by-drag-and-drop @NFR-A5
  Scenario: Handle names the city and is large enough
    Given the stored locations are "Moscow", "Almaty"
    And the user opens the locations app
    Then the list offers the move handle "Move Moscow"
    And the list offers the move handle "Move Almaty"
    And every move handle is at least 44 by 44 px

  @reorder-locations-by-drag-and-drop @FR7 @NFR-A2 @NFR-A3
  Scenario: Move a card down with the keyboard
    Given the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    When the user picks up "Moscow" with the keyboard
    And the user moves the picked-up card down 2 times
    And the user drops the picked-up card with the keyboard
    Then the locations list order is "Almaty", "New York", "Moscow"
    And focus is on the move handle "Move Moscow"
    And the reorder announcement reads "Moscow dropped at position 3 of 3"

  @reorder-locations-by-drag-and-drop @NFR-A3
  Scenario: Pick-up and move are announced
    Given the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    When the user picks up "Moscow" with the keyboard
    Then the reorder announcement reads "Moscow picked up at position 1 of 3"
    When the user moves the picked-up card down 1 time
    Then the reorder announcement reads "Moscow moved to position 2 of 3"

  @reorder-locations-by-drag-and-drop @FR7 @NFR-A2 @NFR-A3
  Scenario: Cancel a keyboard move
    Given the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    When the user picks up "Moscow" with the keyboard
    And the user moves the picked-up card down 1 time
    And the user presses Escape
    Then the locations list order is "Moscow", "Almaty", "New York"
    And focus is on the move handle "Move Moscow"
    And the reorder announcement reads "Moving Moscow cancelled"

  @reorder-locations-by-drag-and-drop @UX1 @M6
  Scenario: Displaced card slides
    Given the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    When the user picks up "Moscow" with the keyboard
    And the user moves the picked-up card down 1 time
    Then the "Almaty" card has a 200 ms transform transition

  @reorder-locations-by-drag-and-drop @NFR-A4 @M6
  Scenario: Reduced motion
    Given the system asks to reduce motion
    And the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    When the user picks up "Moscow" with the keyboard
    And the user moves the picked-up card down 1 time
    Then the "Almaty" card has no transition
    When the user drops the picked-up card with the keyboard
    Then the locations list order is "Almaty", "Moscow", "New York"

  @reorder-locations-by-drag-and-drop @UX1 @M6
  Scenario: Dropped card settles into its slot
    Given the stored locations are "Moscow", "Almaty", "New York"
    And transition runs are recorded
    And the user opens the locations app
    When the user drags "Moscow" below "Almaty" with the mouse
    Then the "Moscow" card settles into its slot with a 200 ms transform transition
    And the locations list order is "Almaty", "Moscow", "New York"

  @reorder-locations-by-drag-and-drop @NFR-A4 @M6
  Scenario: Reduced motion has no drop animation
    Given the system asks to reduce motion
    And the stored locations are "Moscow", "Almaty", "New York"
    And transition runs are recorded
    And the user opens the locations app
    When the user drags "Moscow" below "Almaty" with the mouse
    Then the "Moscow" card ran no transition after the drop
    And the locations list order is "Almaty", "Moscow", "New York"

  @reorder-locations-by-drag-and-drop @UX2
  Scenario: The dragged card keeps its width and its slot
    Given the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    When the user starts dragging "Moscow" with the mouse to the right and down
    Then the dragged "Moscow" card stays in its column, keeps its width and is raised
    And the list keeps its height and the "Almaty" card stays where it was

  @reorder-locations-by-drag-and-drop @FR4 @M5
  Scenario: Order survives a reload
    Given the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    When the user picks up "New York" with the keyboard
    And the user moves the picked-up card up 2 times
    And the user drops the picked-up card with the keyboard
    And the user reopens the locations app
    Then the locations list order is "New York", "Moscow", "Almaty"

  @reorder-locations-by-drag-and-drop @FR4 @M5
  Scenario: Order survives an offline reopen
    Given the stored locations are "Moscow", "Almaty", "New York"
    And the service worker controls the locations app
    When the user picks up "New York" with the keyboard
    And the user moves the picked-up card up 2 times
    And the user drops the picked-up card with the keyboard
    And the user reopens the locations app without network
    Then the locations list order is "New York", "Moscow", "Almaty"

  @reorder-locations-by-drag-and-drop @FR5
  Scenario: Moved in another tab
    Given the stored locations are "Moscow", "Almaty"
    And the app is open in two tabs
    When the user picks up "Almaty" with the keyboard
    And the user moves the picked-up card up 1 time
    And the user drops the picked-up card with the keyboard
    Then the other tab shows the order "Almaty", "Moscow" without a reload

  @reorder-locations-by-drag-and-drop @FR6
  Scenario: Storage cannot be written
    Given the stored locations are "Moscow", "Almaty"
    And writing to storage fails
    And the user opens the locations app
    When the user picks up "Almaty" with the keyboard
    And the user moves the picked-up card up 1 time
    And the user drops the picked-up card with the keyboard
    Then the locations list order is "Almaty", "Moscow"
    And the storage warning is shown

  @reorder-locations-by-drag-and-drop @NFR-A1 @M4
  Scenario Outline: No accessibility violations at rest in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    Then the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @reorder-locations-by-drag-and-drop @NFR-A1 @M4
  Scenario Outline: No accessibility violations while a card is picked up in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    When the user picks up "Moscow" with the keyboard
    Then the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @reorder-locations-by-drag-and-drop @NFR-R1
  Scenario Outline: Reorder fits a <width> px wide screen
    Given the screen is <width> px wide for the locations
    And the stored locations are "Almaty", "Moscow", "Kolkata", "Tokyo", "New York"
    And the user opens the locations app
    When the user picks up "Almaty" with the keyboard
    And the user moves the picked-up card down 1 time
    Then the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 2560  |

  @reorder-locations-by-drag-and-drop @NFR-R3
  Scenario Outline: The list state shows handles at <width> px in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the locations are in the list state
    Then the list offers the move handle "Move Almaty"
    And the list offers the move handle "Move Moscow"

    Examples:
      | width | theme |
      | 375   | light |
      | 375   | dark  |
      | 1024  | light |
      | 1024  | dark  |
