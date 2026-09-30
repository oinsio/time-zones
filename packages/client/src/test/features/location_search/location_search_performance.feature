Feature: Location search performance
  As a user I see results while typing without delay

  @add-locations-via-search @NFR-P1 @M6
  Scenario: Query timing
    When each of 10 sample queries is run over the full data
    Then each completes in at most 50 milliseconds
