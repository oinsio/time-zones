Feature: Day track of a location card
  Implements change add-time-sliders-to-location-cards.
  As a user I see each card's day as a coloured track with a handle at the shared moment.

  @add-time-sliders-to-location-cards @FR1
  Scenario: A 24-hour reference day
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, Moscow, Kolkata, New York"
    When the user opens the app
    Then every card shows a track for the day from "2026-03-07T19:00:00Z" to "2026-03-08T19:00:00Z"

  @add-time-sliders-to-location-cards @FR1 @M4
  Scenario Outline: Days of 23 and 25 hours
    Given the device time zone is "America/New_York"
    And the list contains "New York"
    When the moment is on <date> in New York
    Then the reference day is <minutes> minutes long

    Examples:
      | date         | minutes |
      | 2026-03-08 | 1380    |
      | 2026-06-01 | 1440    |
      | 2026-11-01 | 1500    |

  @add-time-sliders-to-location-cards @FR1
  Scenario: No track for an unknown zone
    Given the list holds Moscow and a location whose zone the browser does not know
    When the list is presented
    Then that location's card shows no track
    And the Moscow card shows its track

  @add-time-sliders-to-location-cards @FR2 @M2
  Scenario: All handles stand at the same position
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, Moscow, Kolkata, New York"
    When the user opens the app
    Then every handle stands at 0.520833

  @add-time-sliders-to-location-cards @FR2
  Scenario: A live handle follows the clock
    Given the device time zone is "UTC"
    And the current instant is "2026-07-15T12:00:42.500Z"
    And the list contains "UTC"
    And the app is open
    When the next minute starts at "2026-07-15T12:01:00Z"
    Then every handle stands at 0.500694

  @add-time-sliders-to-location-cards @FR2
  Scenario: A pinned handle ignores minute updates
    Given the device time zone is "UTC"
    And the current instant is "2026-07-15T18:00:00Z"
    And the list contains "UTC"
    And the app is open
    And the moment is pinned at its current position
    When the next minute starts at "2026-07-15T18:01:00Z"
    Then every handle stands at 0.75

  @add-time-sliders-to-location-cards @NFR-P2
  Scenario: 50 tracks within the date-change budget
    Given 50 locations presented at "2026-03-08T07:30:00Z" in the device time zone "UTC"
    When the date moves to the next day and the rows are presented again
    Then it takes at most 50 ms
    And every row carries colour stops and hour labels for the day starting "2026-03-09T00:00:00Z"
