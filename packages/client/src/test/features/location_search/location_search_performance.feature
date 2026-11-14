Feature: Location search performance
  As a user I see results while typing without delay

  @add-locations-via-search @NFR-P1 @M6 @replace-wall-clock-row-budgets-with-deterministic-checks @FR4 @add-geonames-city-source @NFR-P2
  Scenario: Query timing
    Given the full data is prepared for search
    When each of 13 sample queries is run over the full data
    Then each query normalizes exactly one text
    And each query builds at most one collator
    And no query builds a country-name formatter

  @add-geonames-city-source @NFR-P2
  Scenario: Preparing the data for search
    When the first query is run over freshly loaded search data
    Then at most one country-name formatter per city-name language was built

  @add-geonames-city-source @NFR-P3
  Scenario: Loading without a query does no search work
    Given the list holds Kazan and the search was not opened
    When the search data finishes loading and the Kazan row shows its city label
    Then no text was normalized

  @show-zone-abbreviations-and-zone-label-setting @NFR-P3
  Scenario: Abbreviation query within the work bound
    Given the full data is prepared for search
    When the query "IST" is run over the full data
    Then it normalizes exactly one text
    And it builds at most one collator
