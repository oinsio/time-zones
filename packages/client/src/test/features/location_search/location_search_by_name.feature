Feature: Location search by city name
  As a user I find a place by typing part of its city name

  @add-locations-via-search @FR1
  Scenario: Diacritics are ignored
    When the user searches for "sao paulo"
    Then "São Paulo" is among the results

  @add-locations-via-search @FR1
  Scenario: Other language than the interface
    Given the interface language is English
    When the user searches for "Москва"
    Then the first result is "Moscow" shown as "Moscow"

  @add-locations-via-search @FR1
  Scenario: Case and spaces
    When the user searches for "  MOSCOW "
    Then the first result is in "Europe/Moscow"

  @add-locations-via-search @FR2
  Scenario: Full city name
    When the user searches for "Moscow"
    Then the first result is in "Europe/Moscow"

  @add-locations-via-search @FR2
  Scenario: Later word of the name
    When the user searches for "york"
    Then "New York" is among the results

  @add-locations-via-search @FR2
  Scenario: Prefix of the name
    When the user searches for "alm"
    Then "Almaty" is among the results
