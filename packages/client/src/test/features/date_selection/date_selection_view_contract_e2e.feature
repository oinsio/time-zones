Feature: Date selection in every registered view
  Implements change select-date-with-calendar-and-now.
  Selecting a date and returning to now is part of the view contract: these
  scenarios run once for every registered view and name none of them.

  Background:
    Given the view under contract is shown
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"

  @select-date-with-calendar-and-now @view-contract @FR2 @FR3
  Scenario: Select a date
    When the user moves to the next day with the bar
    Then the row of "Almaty" carries the ISO date "2026-03-09"
    When the user picks "Wednesday, July 15, 2026" in the calendar
    Then the row of "Almaty" carries the ISO date "2026-07-15"

  @select-date-with-calendar-and-now @view-contract @FR6
  Scenario: Return to now
    Given the user moved to the next day with the bar
    When the user returns to now with the bar
    Then the row of "Almaty" carries the ISO date "2026-03-08"
