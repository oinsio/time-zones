Feature: Hour strip work bound
  Implements change add-grid-hour-cells-and-hour-frame.
  As a user I see the hour strips of 50 locations without a slowdown.

  @add-grid-hour-cells-and-hour-frame @NFR-P1
  Scenario: A minute tick re-presents nothing
    Given the hour strips of 50 rows in 10 zones were presented for 2026-03-08
    When they are presented again one minute later
    Then no formatter is built and no time zone transition is looked up
    And every row gets the same strip as before

  @add-grid-hour-cells-and-hour-frame @NFR-P1
  Scenario: First presentation is bounded per zone
    When the hour strips of 50 rows in 10 zones are presented for the first time
    Then each zone has at most 2 time zone transition lookups and at most 3 formatter builds
