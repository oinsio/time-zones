Feature: Meeting state work bound
  Implements change add-grid-meeting-range-and-share.
  As a user I move a meeting handle across 50 locations without a slowdown.

  @add-grid-meeting-range-and-share @NFR-P1
  Scenario: A handle move re-presents the spans cheaply
    Given the rows and hour strips of 50 locations in 10 zones were presented with the meeting range 09:00–11:00 on 2026-03-08
    When the end handle moves one track step and the rows are presented again
    Then no formatter is built and no time zone transition is looked up
    And every row gets the same hour strip as before
