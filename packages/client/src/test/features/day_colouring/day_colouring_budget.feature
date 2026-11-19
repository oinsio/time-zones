Feature: Day colouring work bound
  Implements change add-day-colouring-setting.
  As a user I see the day colouring of 50 locations without a slowdown.

  @add-day-colouring-setting @NFR-P1
  Scenario: First presentation is bounded per zone
    Given the day colouring is Working hours with 10:00-18:00
    When the day tracks and the hour strips of 50 rows in 10 zones are presented for the first time
    Then each zone has at most 2 time zone transition lookups and at most 3 formatter builds

  @add-day-colouring-setting @NFR-P1
  Scenario: A minute tick re-presents nothing
    Given the day colouring is Working hours with 10:00-18:00
    And the day tracks and the hour strips of 50 rows in 10 zones were presented
    When they are presented again one minute later
    Then no formatter is built and no time zone transition is looked up
    And every row gets the same colour stops and the same strip as before

  @add-day-colouring-setting @NFR-P1
  Scenario: Switching the colouring builds no formatter
    Given the day tracks and the hour strips of 50 rows in 10 zones were presented in the Time of day colouring
    When they are presented in the Plain colouring
    Then no formatter is built

  @redesign-cards-grid-and-day-palettes @NFR-P1
  Scenario: Changing the day palette re-presents nothing
    Given the day tracks and the hour strips of 50 rows in 10 zones were presented in the Time of day colouring
    When the day palette changes to Muted and they are presented again
    Then no formatter is built and no time zone transition is looked up
    And every row gets the same colour stops and the same strip as before
