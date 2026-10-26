Feature: Reference moment rows
  Implements change select-date-with-calendar-and-now.
  Implements change fix-date-change-row-budget-measurement.
  As a user I see the rows keep the chosen moment and follow the clock again after now.

  @select-date-with-calendar-and-now @NFR-P1 @fix-date-change-row-budget-measurement @replace-wall-clock-row-budgets-with-deterministic-checks @FR3
  Scenario: 50 rows within the budget
    Given 50 locations whose rows have been presented at the current instant "2026-03-08T07:30:00Z" with the device time zone "UTC"
    When the date moves to the next day and the rows are presented again
    Then no date, time or region name formatter is built
    And every row carries its local date at "2026-03-09T07:30:00Z"

  @fix-date-change-row-budget-measurement @FR1 @UX1
  Scenario: The new date shows in the same render
    Given 50 locations
    And the app is open
    When the user moves to the next day
    Then the rows show the new date at once

  @select-date-with-calendar-and-now @FR5
  Scenario: Rows at a pinned moment
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    And the app is open
    When the user moves to the previous day
    Then the rows show:
      | city     | time  | date       |
      | Almaty   | 12:30 | Sat, Mar 7 |
      | New York | 02:30 | Sat, Mar 7 |

  @select-date-with-calendar-and-now @FR5
  Scenario: A pinned moment ignores minute updates
    Given the device time zone is "UTC"
    And the current instant is "2026-07-15T12:00:42.500Z"
    And the list contains "UTC"
    And the app is open
    And the user moved to the next day
    When the next minute starts at "2026-07-15T12:01:00Z"
    Then the "UTC" row shows the time "12:00" and the date "Thu, Jul 16"
    When the page becomes hidden and visible again at "2026-07-15T12:10:20Z"
    Then the "UTC" row still shows the time "12:00" and the date "Thu, Jul 16"

  @select-date-with-calendar-and-now @FR6
  Scenario: Rows follow the clock again after now
    Given the device time zone is "UTC"
    And the current instant is "2026-07-15T12:00:42.500Z"
    And the list contains "UTC"
    And the app is open
    And the user moved to the next day
    When the current instant is "2026-07-15T12:00:50Z" and the user returns to now
    Then the "UTC" row shows the time "12:00" and the date "Wed, Jul 15"
    When the next minute starts at "2026-07-15T12:01:00Z"
    Then the "UTC" row now shows the time "12:01" and the date "Wed, Jul 15"
