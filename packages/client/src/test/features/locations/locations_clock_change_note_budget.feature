Feature: Clock change note work bound
  Implements change show-clock-change-note-on-location-cards.
  As a user I see the clock change notes of 50 locations without a slowdown.

  @show-clock-change-note-on-location-cards @NFR-P1
  Scenario: 50 rows with notes within the work bound
    Given 50 locations, some of them with a clock change inside the window, whose rows have been presented once
    When their rows are presented again at another minute of the same reference day
    Then no time zone transition is looked up
    And no date, time or region name formatter is built

  @show-clock-change-note-on-location-cards @NFR-P1
  Scenario: A new reference day searches each zone once
    Given 50 locations whose rows have been presented at "2026-03-08T07:30:00Z" with the device time zone "UTC"
    When the date moves to the next day and the rows are presented again
    Then at most 2 time zone transitions are looked up per zone
