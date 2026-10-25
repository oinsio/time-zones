Feature: Reference moment
  Implements change select-date-with-calendar-and-now.
  As a user I see every location at the date I choose and return to now.

  @select-date-with-calendar-and-now @FR1 @M2
  Scenario: The app opens live
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    When the user opens the app
    Then the moment is live
    And the "Almaty" row shows the time "12:30" and the date "Sun, Mar 8"
    And the Now button is not shown

  @select-date-with-calendar-and-now @FR1 @M5
  Scenario: Date changes store nothing
    Given the list contains "Almaty"
    And the app is open
    When the user moves to the next day 5 times, to the previous day 5 times and then returns to now
    Then the stored list was not written

  @select-date-with-calendar-and-now @FR1
  Scenario: The pinned moment survives a list change in another tab
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    And the app is open
    And the user moved to the next day
    When another tab adds "Moscow"
    Then the moment is pinned to "2026-03-09T07:30:00Z"
    And the "Moscow" row shows the time "10:30" and the date "Mon, Mar 9"

  @select-date-with-calendar-and-now @FR2 @FR5 @M2
  Scenario: Next day from live
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    And the app is open
    When the user moves to the next day
    Then the moment is pinned to "2026-03-09T07:30:00Z"
    And the rows show:
      | city     | time  | date       |
      | Almaty   | 12:30 | Mon, Mar 9 |
      | New York | 03:30 | Mon, Mar 9 |
    And the "New York" row shows the offset "UTC−4"

  @select-date-with-calendar-and-now @FR2 @FR5 @M2
  Scenario: Previous day resolves the offset for that day
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "New York"
    And the app is open
    When the user moves to the previous day
    Then the moment is pinned to "2026-03-07T07:30:00Z"
    And the "New York" row shows the time "02:30" and the date "Sat, Mar 7"
    And the "New York" row shows the offset "UTC−5"

  @select-date-with-calendar-and-now @FR2
  Scenario: Moves add up from the pinned moment
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the app is open
    When the user moves to the next day twice and to the previous day once
    Then the moment is pinned to "2026-03-09T07:30:00Z"

  @select-date-with-calendar-and-now @FR6 @M2
  Scenario: Now after browsing dates
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    And the app is open
    And the user moved to the next day
    Then the Now button is shown
    When the user returns to now
    Then the moment is live
    And the "Almaty" row shows the time "12:30" and the date "Sun, Mar 8"
    And the Now button is not shown

  @select-date-with-calendar-and-now @NFR-P1
  Scenario: 50 rows within the budget
    Given 50 locations
    And the app is open
    When the user moves to the next day
    Then the rows show the new date within 50 ms

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
