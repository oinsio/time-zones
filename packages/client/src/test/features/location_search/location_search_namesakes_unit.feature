Feature: Namesake cities are told apart by region
  As a user I tell Springfield, Missouri from Springfield, Illinois in the search results

  @add-geonames-city-source @FR7 @UX1 @M5
  Scenario: Namesakes are told apart
    Given the interface language is English
    When the user searches for "Springfield"
    Then three results are named "Springfield"
    And their secondary lines are "Missouri, United States", "Massachusetts, United States" and "Illinois, United States", in this order

  @add-geonames-city-source @FR7 @UX1
  Scenario: The region in Russian
    Given the interface language is Russian
    When the user searches for "Springfield"
    Then the first result's secondary line is "Миссури, Соединенные Штаты"

  @add-geonames-city-source @FR7 @UX2
  Scenario: No region without a namesake
    Given the interface language is English
    When the user searches for "Kazan"
    Then the "Kazan" result's secondary line is "Russia"

  @add-geonames-city-source @FR7 @M5
  Scenario: No two results look the same
    When each of 13 sample queries is run over the full data
    Then no two results of one query have the same city, region and country text

  @add-geonames-city-source @FR8
  Scenario: Add a GeoNames city
    Given the interface language is Russian and the list is empty
    When the user searches for "Казань" and chooses it
    Then the list contains a location in "Europe/Moscow" labelled "Казань" with the country "RU"

  @add-geonames-city-source @FR8
  Scenario: Namesakes in the same zone
    Given the user added Springfield, Missouri, in "America/Chicago"
    When the user searches for "Springfield"
    Then Springfield, Missouri and Springfield, Illinois are marked as added
    And Springfield, Massachusetts, in "America/New_York", can be chosen

  @add-geonames-city-source @FR8
  Scenario: A city and the zone city of its zone are different locations
    Given the list contains Moscow
    When the user searches for "Kazan"
    Then Kazan is not marked as added and can be chosen
