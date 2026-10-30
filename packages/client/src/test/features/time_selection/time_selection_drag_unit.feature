Feature: Drag a day track
  Implements change fix-day-track-drag-continuity-and-smoothness.
  As a user I drag a handle and it follows my pointer until I let go.

  @fix-day-track-drag-continuity-and-smoothness @FR1 @FR4 @UX1 @UX3
  Scenario Outline: A drag continues when the pointer leaves the track
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "New York, Almaty"
    And the app is open
    When the user drags the <pointer> from a quarter to three quarters of the New York track, 120 px below it
    Then the moment is pinned to "2026-03-08T13:00:00Z"
    And the "Almaty" card shows "18:00"

    Examples:
      | pointer                                    |
      | mouse                                      |
      | finger                                     |
      | finger on an engine without Pointer Events |

  @fix-day-track-drag-continuity-and-smoothness @FR1
  Scenario: A drag past the right end pins the track end
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    And the app is open
    When the user drags the finger from a quarter to past the right end of the "Almaty" track, 60 px above it
    Then the moment is pinned to "2026-03-08T18:59:00Z"
    And the "Almaty" card shows "23:59"

  @fix-day-track-drag-continuity-and-smoothness @FR3 @UX2
  Scenario: The dragged handle follows the pointer between track steps
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    And the app is open
    When the user holds the mouse at 0.512 of the "Almaty" track during a drag
    Then the "Almaty" handle stands at "51.2%"
    And the moment is pinned to "2026-03-08T07:15:00Z"
    And the "New York" handle stands at 0.510417

  @fix-day-track-drag-continuity-and-smoothness @FR3 @UX2
  Scenario: The handle settles on the selected step at release
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    And the app is open
    And the user holds the mouse at 0.512 of the "Almaty" track during a drag
    When the user releases the pointer
    Then the "Almaty" handle stands at 0.510417
    And the moment is pinned to "2026-03-08T07:15:00Z"

  @fix-day-track-drag-continuity-and-smoothness @FR4
  Scenario: A finger drag adds no selection when the finger lifts
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    And the app is open
    And the user drags the finger without Pointer Events to three quarters of the "Almaty" track
    When the user lifts the finger and a click follows
    Then the moment is pinned to "2026-03-08T13:00:00Z"

  @fix-day-track-drag-continuity-and-smoothness @NFR-P1
  Scenario: A drag move inside the pinned track step re-presents no row
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, Moscow, Kolkata, New York"
    And the app is open
    And the user holds the mouse at 0.512 of the "Almaty" track during a drag
    When the pointer moves on to 0.514 of the track, counting work
    Then the moment is pinned to "2026-03-08T07:15:00Z"
    And every row is the same object as before the move
    And no formatter is built
