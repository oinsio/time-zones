Feature: Preferences defaults
  Implements change add-settings-page-and-device-time-location.
  As a user I find the settings page with sensible choices and nothing is
  stored until I change one.

  @add-settings-page-and-device-time-location @FR4
  Scenario: Default is System
    Given no preferences are stored
    When the user opens the settings
    Then the theme option "System" is checked

  @add-settings-page-and-device-time-location @FR5
  Scenario: Default is 24-hour
    Given no preferences are stored
    When the user opens the settings
    Then the hour format option "24-hour" is checked

  @add-settings-page-and-device-time-location @FR7
  Scenario: Opening writes nothing
    Given no preferences are stored
    When the user opens the app and the settings page and changes nothing
    Then no preferences document is stored
