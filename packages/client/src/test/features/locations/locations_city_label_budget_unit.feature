Feature: City label work bound
  Implements change show-city-labels-in-interface-language.
  As a user I see the city labels of 50 locations without a slowdown.

  @show-city-labels-in-interface-language @NFR-P1 @M3
  Scenario: A minute tick asks for no city label
    Given 50 city locations have been presented with the zone cities data loaded
    When the same rows are presented again for the next minute tick
    Then the city search was asked for no city label
    And no formatter is built

  @show-city-labels-in-interface-language @NFR-P1 @M3
  Scenario: A switch asks once per location
    Given 50 city locations have been presented with the zone cities data loaded
    When the interface language is switched
    Then the city search was asked for at most 50 city labels
