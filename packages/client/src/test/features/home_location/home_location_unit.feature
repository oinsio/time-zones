Feature: Home location
  Implements change set-home-location-and-show-differences.
  As a user I mark one location as home, or clear it, and the list keeps it in place.

  @set-home-location-and-show-differences @FR1
  Scenario: Make Almaty home
    Given the list contains "Almaty, Moscow, Kolkata"
    And the app is open
    When the user makes "Almaty" home
    Then "Almaty" is the home location

  @set-home-location-and-show-differences @FR1
  Scenario: Home moves to another location
    Given the list contains "Almaty, Moscow"
    And "Almaty" is home
    And the app is open
    When the user makes "Moscow" home
    Then "Moscow" is the home location
    And "Almaty" is not the home location

  @set-home-location-and-show-differences @FR1
  Scenario: Location already gone
    Given the list contains "Almaty, Moscow"
    And "Almaty" is home
    And the app is open
    And "Moscow" was removed in another tab
    When a request to make "Moscow" home arrives
    Then it is reported as location not found
    And "Almaty" is the home location

  @set-home-location-and-show-differences @FR2
  Scenario: Clear home
    Given the list contains "Almaty, Moscow"
    And "Almaty" is home
    And the app is open
    When the user clears home
    Then no location is home

  @set-home-location-and-show-differences @FR3
  Scenario: Removing home clears it
    Given the list contains "Almaty, Moscow"
    And "Almaty" is home
    And the app is open
    When the user removes "Almaty"
    Then no location is home

  @set-home-location-and-show-differences @FR3
  Scenario: The first added location is not home
    Given the list is empty
    And the app is open
    When the user adds "Almaty"
    Then no location is home

  @set-home-location-and-show-differences @FR3
  Scenario: Reorder keeps home in place
    Given the list contains "Almaty, Moscow, Kolkata"
    And "Moscow" is home
    And the app is open
    When the user moves "Kolkata" to the first position
    Then the list is "Kolkata, Almaty, Moscow"
    And "Moscow" is the home location
