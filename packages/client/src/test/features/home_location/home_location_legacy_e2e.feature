Feature: Home location menu without Pointer Events in a real browser
  Implements change set-home-location-and-show-differences.
  On an engine without Pointer Events, as iOS Safari 12.5, taps work the menu.

  @set-home-location-and-show-differences @FR14
  Scenario: Remove without Pointer Events
    Given the engine has no Pointer Events
    And the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    When the user taps the location menu button of "Moscow" and then "Remove"
    Then the locations list holds 1 location
    And the locations list does not show "Moscow"

  @set-home-location-and-show-differences @FR14
  Scenario: Close by tapping outside
    Given the engine has no Pointer Events
    And the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    And the user taps the location menu button of "Moscow"
    When the user taps outside the menu
    Then the menu is closed
    And the locations list holds 2 locations
