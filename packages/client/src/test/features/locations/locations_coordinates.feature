Feature: Coordinates of a city location
  As a user my cities know where they are, and nothing about my list changes.

  @add-city-coordinates-to-locations @FR6
  Scenario: A city added from the search
    When the user adds "Kazan" from the search
    Then the location "Kazan" holds the coordinates 55.8, 49.1

  @add-city-coordinates-to-locations @FR6
  Scenario: A city added by its zone abbreviation
    When the user searches for "IST" and adds "Kolkata"
    Then the location "Kolkata" holds the coordinates 22.5, 88.4

  @add-city-coordinates-to-locations @FR6
  Scenario: UTC
    When the user adds "UTC" from the search
    Then the location "UTC" holds no coordinates
