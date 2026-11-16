Feature: Day periods are fast
  Implements change bind-day-periods-to-sun.
  As a user I see the day periods of 50 locations without a slowdown.

  @bind-day-periods-to-sun @NFR-P1
  Scenario: First presentation of 50 rows
    Given 50 rows at 10 distinct coordinates in the Time of day colouring
    When their day tracks and hour strips are presented for the first time in a reference day
    Then the sun was computed for at most 30 solar days
    And at most 3 formatters were built per zone

  @bind-day-periods-to-sun @NFR-P1 @NFR-P3
  Scenario: A minute later
    Given the rows of the previous scenario were presented
    When they are presented again one minute later within the same reference day
    Then nothing was computed for the sun
    And every row has the same colour stops and the same cells as before
