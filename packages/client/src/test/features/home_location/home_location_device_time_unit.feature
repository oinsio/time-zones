Feature: Device time location as home
  Implements change add-settings-page-and-device-time-location.
  As a user I make the time on my own device my home, and home follows the
  device when I travel.

  @add-settings-page-and-device-time-location @FR10
  Scenario: Make the device time location home
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "the device time location, Moscow"
    And the app is open
    When the user makes the device time location home
    Then the device time location is the home location
    And "Moscow" shows the offset difference "−2 h"

  @add-settings-page-and-device-time-location @FR10
  Scenario: Home follows the device
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "the device time location, New York"
    And "the device time location" is home
    And the app is open
    When the device time zone becomes "Europe/Moscow" and the minute tick reads it
    Then every card shows a track for the day from "2026-03-07T21:00:00Z" to "2026-03-08T21:00:00Z"
    And "New York" shows the offset difference "−7 h"
    And the device time location is the home location

  @add-settings-page-and-device-time-location @FR10
  Scenario: Home survives a reload
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the browser storage holds the list "Moscow"
    And the app is open
    And the user makes the device time location home
    When the app is opened again on a device in "Asia/Tokyo"
    Then the device time location is the home location
    And every card shows a track for the day from "2026-03-07T15:00:00Z" to "2026-03-08T15:00:00Z"
