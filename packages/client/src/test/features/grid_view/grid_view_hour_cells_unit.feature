Feature: Hour cells of the Grid view
  Implements change add-grid-hour-cells-and-hour-frame and bind-day-periods-to-sun.
  As a user I read the local hour, the day period and the date change of every location from its hour strip.

  @add-grid-hour-cells-and-hour-frame @FR1
  Scenario: Four rows of 24 aligned cells
    Given the reference zone is "Asia/Almaty" and the current time is "2026-03-08T07:30:00Z"
    And the locations are Almaty, Moscow, Kolkata and New York
    When the hour cells are presented
    Then every row has 24 hour cells
    And column 12 starts at "2026-03-08T07:00:00Z" in every row

  @add-grid-hour-cells-and-hour-frame @FR2
  Scenario Outline: Clock change days in the reference zone
    Given the reference zone is "America/New_York"
    When the reference day is <date>
    Then every row has <count> hour cells

    Examples:
      | date       | count |
      | 2026-03-08 | 23    |
      | 2026-11-01 | 25    |
      | 2026-06-01 | 24    |

  @bind-day-periods-to-sun @FR6
  Scenario: Day periods of Almaty
    Given the day colouring is Time of day, the reference zone is "Asia/Almaty" and the reference day is 2026-03-08
    When the hour cells of Almaty at 43.3, 76.9 are presented
    Then columns 0-5 and 18-23 are night, column 6 is morning, columns 7-16 are day and column 17 is evening

  @bind-day-periods-to-sun @FR6
  Scenario: The larger part decides
    Given a location whose night ends at 06:05 and whose day starts at 06:55 local time
    When its hour cells are presented in the Time of day colouring
    Then the cell that starts at 06:00 is morning
    And the cell that starts at 07:00 is day

  @bind-day-periods-to-sun @FR6
  Scenario: A tie takes the earlier period
    Given a location whose night ends at 06:30 local time and whose day starts after 07:00
    When its hour cells are presented in the Time of day colouring
    Then the cell that starts at 06:00 is night
