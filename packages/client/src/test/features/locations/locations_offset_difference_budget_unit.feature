Feature: Offset difference work bound
  Implements change set-home-location-and-show-differences.
  As a user I see the differences of 50 locations without a slowdown.

  @set-home-location-and-show-differences @NFR-P1
  Scenario: 50 rows within the work bound
    Given 50 locations, one of them home
    And the home location is the only one in "Asia/Almaty" and one other location is the only one in "Europe/Moscow"
    And the rows were presented once
    When the rows are presented again
    Then no date, time or region name formatter is built
    And the reference zone's UTC offset is computed once
