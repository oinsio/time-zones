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

  @add-geonames-city-source @FR6
  Scenario: Other cities of the country
    When the user searches for "Kazakhstan"
    Then "Astana" and "Shymkent" are among the results
    And every zone city of "KZ" is listed before them

  @add-geonames-city-source @FR6
  Scenario: Every zone of a large country stays within the limit
    When the user searches for "Russia"
    Then 50 results are shown
    And every zone of "RU" is among them

  @support-legacy-ios-12-safari @FR5
  Scenario: No country names on a legacy engine
    Given the environment has no country names
    When the user searches for "Kazakhstan"
    Then no result is matched by country
    And no error is shown

  @support-legacy-ios-12-safari @FR5
  Scenario: City search on a legacy engine
    Given the environment has no country names
    When the user searches for "Almaty"
    Then "Almaty" is among the results
