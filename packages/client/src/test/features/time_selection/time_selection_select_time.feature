Feature: Select a time on a day track
  Implements change add-time-sliders-to-location-cards.
  As a user I pick a time of day on any card and every card follows.

  @add-time-sliders-to-location-cards @FR3 @M2
  Scenario: Dragging one track moves every card
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, Moscow, Kolkata, New York"
    And the app is open
    When the user selects three quarters of a track
    Then the moment is pinned to "2026-03-08T13:00:00Z"
    And the cards show:
      | city     | time  | date       | offset |
      | Almaty   | 18:00 | Sun, Mar 8 | UTC+5  |
      | Moscow   | 16:00 | Sun, Mar 8 | UTC+3  |
      | Kolkata  | 18:30 | Sun, Mar 8 | UTC+5:30 |
      | New York | 09:00 | Sun, Mar 8 | UTC−4  |
    And every handle stands at 0.75

  @add-time-sliders-to-location-cards @FR3 @M2
  Scenario Outline: Selections snap to quarter hours and stay inside the day
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    And the app is open
    When the user selects the fraction <fraction> of a track
    Then the moment is pinned to <pinned>

    Examples:
      | fraction | pinned               |
      | 0.52     | 2026-03-08T07:30:00Z |
      | 1.0      | 2026-03-08T18:45:00Z |
      | 0        | 2026-03-07T19:00:00Z |

  @add-time-sliders-to-location-cards @FR3 @M4
  Scenario: Selection on a 23-hour day
    Given the device time zone is "America/New_York"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "New York"
    And the app is open
    When the user selects the middle of a track
    Then the moment is pinned to "2026-03-08T16:30:00Z"
    And the "New York" card shows "12:30"

  @add-time-sliders-to-location-cards @FR8
  Scenario: A malformed instant changes nothing
    Given the moment is live in the store
    When a time selection arrives with the instant "2026-03-08T07:30:00"
    Then the selection is rejected as an invalid instant
    And the moment is still live in the store

  @add-time-sliders-to-location-cards @FR4 @M3
  Scenario Outline: Keys from a pinned quarter hour
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    And the app is open
    And the moment is pinned at its current position
    When the user moves the handle with <key>
    Then the moment is pinned to <pinned>

    Examples:
      | key              | pinned               |
      | next step        | 2026-03-08T07:45:00Z |
      | previous step    | 2026-03-08T07:15:00Z |
      | one hour forward | 2026-03-08T08:30:00Z |
      | one hour back    | 2026-03-08T06:30:00Z |
      | start of day     | 2026-03-07T19:00:00Z |
      | end of day       | 2026-03-08T18:45:00Z |

  @add-time-sliders-to-location-cards @FR4 @M3
  Scenario: Keys from a live moment between steps
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:37:00Z"
    And the list contains "Almaty"
    And the app is open
    When the user moves the handle to the next step
    Then the moment is pinned to "2026-03-08T07:45:00Z"
    When the user returns to now
    And the user moves the handle to the previous step
    Then the moment is now pinned to "2026-03-08T07:30:00Z"

  @add-time-sliders-to-location-cards @FR4
  Scenario: Keys stop at the ends of the day
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T18:45:00Z"
    And the list contains "Almaty"
    And the app is open
    And the moment is pinned at its current position
    When the user moves the handle to the next step
    Then the moment is pinned to "2026-03-08T18:45:00Z"

