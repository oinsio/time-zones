Feature: Locations document migration
  Implements change set-home-location-and-show-differences.
  As a user my list from the previous version is still there after the update.

  @set-home-location-and-show-differences @FR8
  Scenario: Previous document version is migrated
    Given the stored list is a version 1 document with Almaty, Moscow and Kolkata
    When the app is opened
    Then the list is Almaty, Moscow, Kolkata in that order
    And no location is home
    And the stored list was not written
