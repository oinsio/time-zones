Feature: Meeting move work bound
  Implements change move-meeting-range-and-extend-past-midnight.
  As a user I move the meeting range across 50 locations without a slowdown.

  @move-meeting-range-and-extend-past-midnight @NFR-P1
  Scenario: A move step is bounded
    Given the rows and hour strips of 50 locations in 10 zones were presented with the meeting range 09:00–11:00 on 2026-03-08
    When the meeting range moves one track step and the rows are presented again
    Then no formatter is built and no time zone transition is looked up
    And every row gets the same hour strip as before
