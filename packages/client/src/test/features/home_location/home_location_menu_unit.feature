Feature: Home location menu
  Implements change set-home-location-and-show-differences.
  As a user I make a location home, or clear it, from the menu of its card.

  @set-home-location-and-show-differences @FR11
  Scenario: Menu of a row that is not home
    Given the list contains "Almaty, Moscow"
    And "Almaty" is home
    And the app is open
    When the user opens the location menu of "Moscow"
    Then the menu offers "Make home, Remove"

  @set-home-location-and-show-differences @FR11
  Scenario: Menu of the home row
    Given the list contains "Almaty, Moscow"
    And "Almaty" is home
    And the app is open
    When the user opens the location menu of "Almaty"
    Then the menu offers "Clear home, Remove"

  @set-home-location-and-show-differences @FR11
  Scenario: No home item for an unknown zone
    Given the list holds Moscow and a location whose zone the browser does not know
    And the app is open
    When the user opens the location menu of "Olympus"
    Then the menu offers "Remove"
