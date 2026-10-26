Feature: Location search performance
  As a user I see results while typing without delay

  @add-locations-via-search @NFR-P1 @M6 @replace-wall-clock-row-budgets-with-deterministic-checks @FR4
  Scenario: Query timing
    When each of 10 sample queries is run over the full data
    Then each query normalizes exactly one text
    And each query builds at most one collator
