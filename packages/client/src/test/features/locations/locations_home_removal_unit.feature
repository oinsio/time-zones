Feature: Removing the home location
  Implements change set-home-location-and-show-differences.
  As a user I remove the place I marked as home and no home remains.

  @set-home-location-and-show-differences @FR3
  Scenario: Remove the home location
    Given the list is Almaty, Moscow and Almaty is home
    When the user removes Almaty
    Then the list is Moscow
    And no location is home
