Feature: Hour cells of the Grid view
  Implements change add-grid-hour-cells-and-hour-frame.
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

  @add-grid-hour-cells-and-hour-frame @FR4
  Scenario: Day periods of Almaty
    Given the reference zone is "Asia/Almaty" and the reference day is 2026-03-08
    When the hour cells of Almaty are presented
    Then columns 0-6 and 22-23 are night, 7-8 morning, 9-17 working hours and 18-21 evening
