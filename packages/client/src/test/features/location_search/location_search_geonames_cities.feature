Feature: Location search finds cities of the city data
  As a user I find any large city by name, not only the exemplar city of a time zone

  @add-geonames-city-source @FR3 @M3
  Scenario Outline: Cities that are not zone cities are found
    Given the interface language is English
    When the user searches for "<query>"
    Then "<city>" in "<zone>" is among the results

    Examples:
      | query            | city             | zone                |
      | Kazan            | Kazan            | Europe/Moscow       |
      | Saint Petersburg | Saint Petersburg | Europe/Moscow       |
      | Barcelona        | Barcelona        | Europe/Madrid       |
      | San Francisco    | San Francisco    | America/Los_Angeles |
      | Boston           | Boston           | America/New_York    |
      | Munich           | Munich           | Europe/Berlin       |
      | Osaka            | Osaka            | Asia/Tokyo          |
      | Mumbai           | Mumbai           | Asia/Kolkata        |
      | Rio de Janeiro   | Rio de Janeiro   | America/Sao_Paulo   |
      | Milan            | Milan            | Europe/Rome         |

  @add-geonames-city-source @FR3 @M3
  Scenario Outline: Found in Russian
    Given the interface language is English
    When the user searches for "<query>"
    Then "<city>" is among the results shown as "<city>"

    Examples:
      | query           | city             |
      | Казань          | Kazan            |
      | Санкт-Петербург | Saint Petersburg |
      | Мюнхен          | Munich           |
      | Сан-Франциско   | San Francisco    |

  @add-geonames-city-source @FR3
  Scenario: A later word of a GeoNames city
    When the user searches for "francisco"
    Then "San Francisco" is among the results

  @add-geonames-city-source @FR10
  Scenario: An abbreviation still finds zone cities only
    When the user searches for "MSK"
    Then every result is a zone city matched by abbreviation
    And "Kazan" is not among the results

  @add-geonames-city-source @FR10
  Scenario: Suggestions are unchanged
    When the user opens the search
    Then the suggestions are the popular locations, one per zone

  @add-geonames-city-source @FR11
  Scenario: A city of a zone the installed release lacks
    Given the installed zone rules release does not hold "Europe/Moscow"
    When the user searches for "Kazan"
    Then "Kazan" is not among the results
    And no error is shown

  @add-geonames-city-source @FR11
  Scenario: A city of a zone the engine rejects
    Given the engine rejects "America/Ciudad_Juarez"
    When the user searches for "Ciudad Juárez"
    Then "Ciudad Juárez" in "America/Ciudad_Juarez" is among the results
