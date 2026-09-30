Feature: Location search by time zone abbreviation
  As a user I find a place by the abbreviation I saw in an invitation

  @add-locations-via-search @FR4
  Scenario: Ambiguous abbreviation
    When the user searches for "IST"
    Then the first three results are in "Asia/Kolkata", "Asia/Jerusalem", "Europe/Dublin" in that order
    And each of the first three results shows "IST"

  @add-locations-via-search @FR4
  Scenario: Single-zone abbreviation
    When the user searches for "est"
    Then the first result is in "America/New_York"
    And the first result shows "EST"

  @add-locations-via-search @FR4
  Scenario: Partial abbreviation does not match by abbreviation
    When the user searches for "IS"
    Then no result shows an abbreviation
