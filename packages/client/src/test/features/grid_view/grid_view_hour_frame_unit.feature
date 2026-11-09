Feature: Hour frame of the Grid view
  Implements change add-grid-hour-cells-and-hour-frame.
  As a user I see which hour of every location the shown moment falls in, and a tap on a cell changes nothing yet.

  @add-grid-hour-cells-and-hour-frame @FR8
  Scenario: Frame on the current hour
    Given the view mode is Grid, the reference zone is "Asia/Almaty", the current time is "2026-03-08T07:30:00Z" and the stored locations are Almaty and Moscow
    When the main page is shown
    Then the hour frame is on column 12
    And the texts of column 12 are bold in both rows and the texts of column 11 are not

  @add-grid-hour-cells-and-hour-frame @FR9
  Scenario: Live frame follows the clock
    Given the Grid view shows the frame on column 12 at "2026-03-08T07:30:00Z", live
    When the clock reaches "2026-03-08T08:00:00Z"
    Then the hour frame is on column 13

  @add-grid-hour-cells-and-hour-frame @FR9
  Scenario Outline: Pinned frame stays
    Given the Grid view at "2026-03-08T07:30:00Z", live
    When the user <pins>
    And the clock reaches "2026-03-08T08:00:00Z"
    Then the hour frame is on column <column>

    Examples:
      | pins                                  | column |
      | types 12:15 into the time of Almaty   | 12     |
      | selects the next day in the date bar  | 12     |

  @add-grid-hour-cells-and-hour-frame @FR9
  Scenario: Now returns the frame
    Given the Grid view pinned at "2026-03-08T02:00:00Z" and the current time "2026-03-08T07:30:00Z"
    When the user returns to now
    Then the hour frame is on column 12

  @add-grid-hour-cells-and-hour-frame @FR11
  Scenario: A tap on a cell changes nothing
    Given the Grid view at "2026-03-08T07:30:00Z", live
    When the user taps column 3 of Moscow
    Then the store receives no command
    And Almaty still shows "12:30" and the frame is still on column 12
