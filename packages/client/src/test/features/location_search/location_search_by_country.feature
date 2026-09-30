Feature: Location search by country
  As a user I find every time zone of a country by typing its name

  @add-locations-via-search @FR3
  Scenario: Country with several zones
    When the user searches for "Kazakhstan"
    Then every result has the country code "KZ"
    And "Almaty" is among the results

  @add-locations-via-search @FR3
  Scenario: Country name in Russian
    When the user searches for "Казахстан"
    Then "Almaty" is among the results
