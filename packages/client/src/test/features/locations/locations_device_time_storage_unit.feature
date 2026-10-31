Feature: Device time location in the stored list
  Implements change add-settings-page-and-device-time-location.
  As a user my list comes back as I left it, with the time on my device only
  where I have it, and an emptied list stays empty.

  @add-settings-page-and-device-time-location @FR12
  Scenario: First launch
    Given no locations document is stored
    And the device time zone is "Asia/Almaty"
    When the user opens the app
    Then the list is the device time location only
    And no location is home
    And no list document is stored

  @add-settings-page-and-device-time-location @FR13
  Scenario: Remove everything and reopen
    Given the list is the device time location, Moscow
    When the user removes "Moscow" and the device time location
    And the app is opened again
    Then the list is empty

  @add-settings-page-and-device-time-location @FR14
  Scenario: Version 2 document is migrated
    Given the stored list is a version 2 document with "Moscow" and "New York" and "Moscow" as home
    When the user opens the app
    Then the list is the device time location, "Moscow", "New York" in that order
    And "Moscow" is home
    And the stored list was not written

  @add-settings-page-and-device-time-location @FR12
  Scenario: The device time zone is not stored
    Given the device time zone is "Asia/Almaty"
    And the list is the device time location
    When the user adds "Moscow" and the list is written
    Then the stored document holds no "Asia/Almaty"

  @add-settings-page-and-device-time-location @FR12
  Scenario: Two device time locations
    Given the stored list holds two device time location entries
    When the user opens the app
    Then the list is reported as unreadable

  @add-settings-page-and-device-time-location @FR12
  Scenario: Reset
    Given the stored list is not valid JSON
    And the user opens the app
    When the user resets the list
    Then the list is the device time location only
    And no list document is stored
