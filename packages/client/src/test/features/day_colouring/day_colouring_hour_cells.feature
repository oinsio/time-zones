Feature: Day colouring of the hour cells
  Implements change add-day-colouring-setting and bind-day-periods-to-sun.
  As a user I see my hour cells coloured plainly or by my working hours.

  @add-day-colouring-setting @FR9 @FR11
  Scenario: Plain hour cells
    Given the day colouring is Plain, the reference zone is "Asia/Almaty" and the reference day is 2026-03-08
    When the hour cells of Almaty, Moscow, Kolkata and New York are presented
    Then every cell of every row is plain

  @add-day-colouring-setting @FR8 @FR11
  Scenario Outline: Half of the hour decides
    Given the day colouring is Working hours and the reference zone is "Asia/Almaty"
    And the reference day is 2026-03-09
    And the working hours are <hours>
    When the hour cells of <city> are presented
    Then exactly the columns <columns> are working

    Examples:
      | hours       | city      | columns |
      | 09:07-18:00 | Almaty    | 9-17    |
      | 09:40-18:00 | Almaty    | 10-17   |
      | 10:00-18:00 | Kolkata   | 9-17    |
      | 10:15-18:00 | Kolkata   | 10-17   |
      | 10:00-18:00 | Kathmandu | 9-16    |

  @add-day-colouring-setting @FR8 @FR11
  Scenario: Weekend cells and Friday cells across the reference day
    Given the day colouring is Working hours with 10:00-18:00 and the reference zone is "Europe/Moscow"
    And the reference day is 2026-03-14
    When the hour cells of Moscow and New York are presented
    Then no Moscow cell is working
    And only column 0 of New York is working

  @add-day-colouring-setting @FR8 @FR11
  Scenario: Hour cells on a clock change day
    Given the day colouring is Working hours with 10:00-18:00 and the reference zone is "Asia/Almaty"
    And the reference day is 2026-04-24
    When the hour cells of Cairo are presented
    Then exactly the columns 12-19 are working

  @bind-day-periods-to-sun @FR8 @UX4 @colour-locations-without-day-periods-in-accent @FR2
  Scenario: UTC hour cells in the Time of day colouring
    Given the day colouring is Time of day, the reference zone is "Asia/Almaty" and the reference day is 2026-03-08
    When the hour cells of UTC are presented
    Then every cell of UTC has no day period
