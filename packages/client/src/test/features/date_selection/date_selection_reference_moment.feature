Feature: Reference moment
  Implements change select-date-with-calendar-and-now.
  As a user I see every location at the date I choose and return to now.

  @select-date-with-calendar-and-now @FR1 @M2 @keep-now-button-visible-when-live @FR1
  Scenario: The app opens live
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    When the user opens the app
    Then the moment is live
    And the "Almaty" row shows the time "12:30" and the date "Sun, Mar 8"
    And the Now button is inactive

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

  @select-date-with-calendar-and-now @FR6 @M2 @keep-now-button-visible-when-live @FR3
  Scenario: Now after browsing dates
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    And the app is open
    And the user moved to the next day
    Then the Now button is active
    When the user returns to now
    Then the moment is live
    And the "Almaty" row shows the time "12:30" and the date "Sun, Mar 8"
    And the Now button is inactive

  @keep-now-button-visible-when-live @FR2 @M5
  Scenario: An inactive Now changes nothing
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    And the app is open
    When the user activates the inactive Now button
    Then the moment is live
    And the "Almaty" row shows the time "12:30" and the date "Sun, Mar 8"
    And the Now button is inactive

  @set-home-location-and-show-differences @FR4
  Scenario: A home change keeps the pinned moment
    Given the device time zone is "Europe/Moscow"
    And the list contains "Almaty, Moscow"
    And the moment is pinned to "2026-03-08T20:30:00Z"
    When the user makes "Almaty" home
    Then the moment is pinned to "2026-03-08T20:30:00Z"
    And the date bar shows Monday, March 9
