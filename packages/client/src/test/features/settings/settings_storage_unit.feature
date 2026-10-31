Feature: Preferences storage
  Implements change add-settings-page-and-device-time-location.
  As a user my choices are kept on the device, shared between tabs, and a
  broken or missing storage never blocks the app.

  @add-settings-page-and-device-time-location @FR7
  Scenario: Corrupted preferences
    Given the stored preferences document is not valid JSON
    When the user opens the app and the settings page
    Then the main page was shown with the default preferences
    And the settings page shows the note with a Reset action

  @add-settings-page-and-device-time-location @FR7
  Scenario: Reset
    Given the note about unreadable settings is shown
    When the user resets
    Then no preferences document is stored
    And the note is not shown

  @add-settings-page-and-device-time-location @FR7
  Scenario: Storage unavailable
    Given storage is unavailable
    When the user chooses the hour format "12-hour"
    Then the hour format "12-hour" is in force
    And the settings page says changes will not be saved

  @add-settings-page-and-device-time-location @FR7
  Scenario: Choices are written after the debounce
    Given no preferences are stored
    When the user chooses the theme "Dark" and the hour format "12-hour"
    Then nothing is stored until the pending write runs
    And then the stored document holds the theme Dark and the hour format 12-hour

  @add-settings-page-and-device-time-location @FR7
  Scenario: Another tab changes the hour format
    Given the app is open in two tabs
    When the user chooses the hour format "12-hour" in the first tab
    Then the second tab shows the hour format "12-hour" without a reload
