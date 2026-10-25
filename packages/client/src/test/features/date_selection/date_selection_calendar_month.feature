Feature: Calendar range and month layout
  Implements change select-date-with-calendar-and-now.
  As a user I see the calendar open on the pinned date, laid out by locale, and stop at the supported range.

  @select-date-with-calendar-and-now @FR3
  Scenario: The calendar opens on the pinned date
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the moment is pinned by picking "2026-07-15"
    When the user opens the calendar
    Then it shows July 2026 with 15 July selected
    And no day of July 2026 is marked as today

  @select-date-with-calendar-and-now @FR3 @FR9 @M4
  Scenario: March 2026 in English and Russian
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    When the calendar shows March 2026
    Then in English the heading is "March 2026", there are 5 week rows and the first row starts with Sunday 1 March
    And in Russian there are 6 week rows, the first row ends with Sunday 1 March and the second row starts with Monday 2 March

  @select-date-with-calendar-and-now @FR2 @FR10
  Scenario: A move beyond the supported range changes nothing
    Given the moment is pinned to the last date the platform supports
    When the user moves to the next day in the store
    Then the move is rejected as out of range
    And the moment is unchanged in the store

