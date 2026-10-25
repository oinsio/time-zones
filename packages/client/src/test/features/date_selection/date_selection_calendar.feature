Feature: Calendar
  Implements change select-date-with-calendar-and-now.
  As a user I choose any date in a calendar and nothing changes unless I pick one.

  @select-date-with-calendar-and-now @FR3
  Scenario: Pick a date in a later month
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "New York"
    And the app is open
    When the user opens the calendar
    Then it shows "March 2026"
    When the user shows the next month 4 times and picks the 15th
    Then the calendar is closed
    And the shown date is "2026-07-15"
    And the "New York" row shows the time "03:30" and the date "Wed, Jul 15"

  @select-date-with-calendar-and-now @FR3
  Scenario: Picking the shown date changes nothing
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the app is open
    When the user opens the calendar and picks the 8th
    Then the calendar is closed
    And the moment is live

  @select-date-with-calendar-and-now @FR3
  Scenario: Closing the calendar changes nothing
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the app is open
    And the user moved to the next day
    When the user opens the calendar, shows the next month and closes the calendar without picking
    Then the calendar is closed
    And the shown date is "2026-03-09"
    And the Now button is shown
