Feature: Reorder locations
  Implements change reorder-locations-by-drag-and-drop.
  As a user I put my locations in the order I want and find them there again

  @reorder-locations-by-drag-and-drop @FR2 @M2
  Scenario Outline: Move to every kind of position
    Given the list is "Almaty, Moscow, Kolkata, Tokyo"
    When the user moves "<city>" to position <position>
    Then the list is "<order>"

    Examples:
      | city      | position | order                                  |
      | Almaty  | 4        | Moscow, Kolkata, Tokyo, Almaty |
      | Tokyo   | 1        | Tokyo, Almaty, Moscow, Kolkata |
      | Moscow  | 3        | Almaty, Kolkata, Moscow, Tokyo |
      | Kolkata | 2        | Almaty, Kolkata, Moscow, Tokyo |

  @reorder-locations-by-drag-and-drop @FR2 @FR3 @M5
  Scenario: Move to its own position
    Given the list is "Almaty, Moscow, Kolkata, Tokyo"
    And location writes are counted
    When the user moves "Moscow" to position 2
    Then the list is "Almaty, Moscow, Kolkata, Tokyo"
    And no location write happened

  @reorder-locations-by-drag-and-drop @FR2 @M2
  Scenario Outline: Position outside the list
    Given the list is "Almaty, Moscow, Kolkata, Tokyo"
    When the user moves "Moscow" to position <position>
    Then the move is rejected as position out of range
    And the list is "Almaty, Moscow, Kolkata, Tokyo"

    Examples:
      | position |
      | 0        |
      | 5        |

  @reorder-locations-by-drag-and-drop @FR2 @M2
  Scenario: Location already gone
    Given the app is open in two tabs with "Moscow, Almaty"
    And "Moscow" was removed in the second tab
    When the user moves "Moscow" to position 2 in the first tab
    Then the move is rejected as location not found

  @reorder-locations-by-drag-and-drop @FR4
  Scenario: Order survives a reload
    Given the list is "Moscow, Almaty, New York"
    And the user moved "New York" to position 1
    When the app is opened again
    Then the list is "New York, Moscow, Almaty"

  @reorder-locations-by-drag-and-drop @FR5
  Scenario: Moved in another tab
    Given the app is open in two tabs with "Moscow, Almaty"
    When the user moves "Almaty" to position 1 in the first tab
    Then the second tab lists "Almaty, Moscow"

  @reorder-locations-by-drag-and-drop @FR6
  Scenario: Storage cannot be written
    Given the list is "Moscow, Almaty"
    And writing to storage fails
    When the user moves "Almaty" to position 1
    Then the list is "Almaty, Moscow"
    And the storage warning is flagged

  @reorder-locations-by-drag-and-drop @FR8
  Scenario: Russian interface
    Given the interface language is Russian
    When the list "Moscow, Almaty" is shown
    Then the list offers the Russian move action for "Moscow"

  @reorder-locations-by-drag-and-drop @NFR-P1
  Scenario: 50 locations within the budget
    Given a list of 50 locations
    When the last location is moved to position 1 and the rows are presented
    Then it takes at most 50 ms
