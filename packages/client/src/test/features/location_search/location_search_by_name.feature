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

  @add-zone-rules-from-iana @FR5 @FR9
  Scenario: A zone the engine rejects is offered
    Given the engine rejects "America/Ciudad_Juarez"
    When the user searches for "Ciudad"
    Then Ciudad Juárez in "America/Ciudad_Juarez" is among the results

  @add-zone-rules-from-iana @FR9
  Scenario: The engine's own list plays no part
    Given the engine cannot list its zones
    When the user searches for "Moscow"
    Then Moscow in "Europe/Moscow" is among the results

  @add-zone-rules-from-iana @FR9 @UX2
  Scenario: Offset-only zones are not offered
    Given the zone rules release holds "Etc/GMT+5", "Etc/GMT-14" and "EST5EDT"
    When the user searches for "GMT+5"
    Then no result has a zone in the "Etc" area
    And no result has an area-less zone other than "UTC"
