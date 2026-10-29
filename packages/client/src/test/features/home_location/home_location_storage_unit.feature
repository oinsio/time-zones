Feature: Home location is kept
  Implements change set-home-location-and-show-differences.
  As a user I find my home again on the next visit and in my other tabs.

  @set-home-location-and-show-differences @FR8
  Scenario: Home survives a reload
    Given the browser storage holds the list "Almaty, Moscow"
    And the app is open
    And the user makes "Moscow" home
    When the app is opened again
    Then "Moscow" is the home location

  @set-home-location-and-show-differences @FR8
  Scenario: A list from the previous version
    Given the browser storage holds a version 1 list "Almaty, Moscow, Kolkata"
    When the user opens the app
    Then the list is "Almaty, Moscow, Kolkata"
    And no location is home
    And nothing is written

  @set-home-location-and-show-differences @FR9
  Scenario: Home points to a missing location
    Given the browser storage holds the list "Almaty, Moscow" with home pointing to "Tokyo"
    When the user opens the app
    Then the list is "Almaty, Moscow"
    And no location is home
    And no error is shown and nothing is written

  @set-home-location-and-show-differences @FR10
  Scenario: Home set in another tab
    Given the list contains "Almaty, Moscow"
    And the app is open
    And the app is open in a first tab too
    When the user makes "Moscow" home in the first tab
    Then "Moscow" shows the home mark
