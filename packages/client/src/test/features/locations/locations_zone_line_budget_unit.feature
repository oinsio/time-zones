Feature: Zone line work bound
  Implements change show-zone-abbreviations-and-zone-label-setting.
  As a user I see the zone abbreviations of 50 locations without a slowdown.

  @show-zone-abbreviations-and-zone-label-setting @NFR-P1
  Scenario: Extra zone lookups per row
    Given the list contains "New York", "Santiago", "Moscow" and "Almaty"
    And the current instant is "2026-07-15T12:00:00Z"
    When the rows are presented with the zone abbreviation and the UTC offset shown
    Then "New York" has at most 2 more zone lookups than "Santiago"
    And "Moscow" has as many zone lookups as "Almaty"

  @show-zone-abbreviations-and-zone-label-setting @NFR-P1
  Scenario: 50 rows within the work bound
    Given 50 locations whose rows have been presented once with the zone abbreviation and the UTC offset
    When their rows are presented again at another minute of the same day
    Then no date, time or region name formatter is built
    And no time zone transition is looked up

