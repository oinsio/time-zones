Feature: Coordinates cost no extra work
  As a user I keep a fast app: giving my cities coordinates adds a bounded number of lookups and no other work.

  @add-city-coordinates-to-locations @NFR-P2
  Scenario: One lookup per location that lacks coordinates
    Given the stored list holds Moscow with coordinates and Kazan and Almaty without
    When the city data finishes loading
    Then exactly 2 coordinate lookups were made
    And no text was normalized

  @add-city-coordinates-to-locations @NFR-P2
  Scenario: No lookup when nothing is missing
    Given every city location of the stored list holds coordinates
    When the city data finishes loading
    Then no coordinate lookup was made

  @add-city-coordinates-to-locations @NFR-P2
  Scenario: A minute tick looks up nothing
    Given the city data is loaded and the list holds Kazan
    When a minute passes
    Then no coordinate lookup was made

  @add-city-coordinates-to-locations @NFR-P3
  Scenario: Presenting the list does the same work
    Given the list holds Kazan and Moscow with coordinates
    When the list is presented
    Then as many formatters, collators and transition lookups were built as for the same list without coordinates
