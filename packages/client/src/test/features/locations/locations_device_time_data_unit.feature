Feature: Device time location data and outdated zone data
  Implements change add-settings-page-and-device-time-location.
  The device time location names the device zone by its exemplar city without
  making the user wait for it, and it works on every engine.

  @add-settings-page-and-device-time-location @FR8 @NFR-P2 @UX3
  Scenario: Derived city first, exemplar city after loading
    Given the device time zone is "Asia/Almaty"
    And the interface language is "ru"
    And the zone cities data has not been loaded
    And the list is "the device time location"
    When the user opens the app
    Then the device time location shows the derived city "Almaty"
    When the zone cities data finishes loading
    Then the device time location shows the exemplar city "Алматы"

  @add-settings-page-and-device-time-location @FR8
  Scenario: Loading fails
    Given the device time zone is "Asia/Almaty"
    And loading the zone cities data fails
    And the list is "the device time location"
    When the user opens the app
    Then the device time location shows the derived city "Almaty"
    And no error is shown

  @add-settings-page-and-device-time-location @show-city-labels-in-interface-language @FR8 @FR4 @NFR-P2
  Scenario: No load without the device time location
    Given the device time zone is "Asia/Almaty"
    And the list is empty
    When the user opens the app and does not open the search
    Then the zone cities data is not requested

  @add-settings-page-and-device-time-location @FR8 @NFR-P2
  Scenario: The search reuses the data of the device time location
    Given the device time zone is "Asia/Almaty"
    And the list is "the device time location"
    When the user opens the app, the zone cities data finishes loading, and the user opens the search
    Then the suggestions are shown
    And the zone cities data was requested exactly once

  @show-city-labels-in-interface-language @FR4 @M2
  Scenario: One request for city labels and the device time location
    Given the device time zone is "Asia/Almaty"
    And the list is "the device time location, Tokyo"
    When the user opens the app, the zone cities data finishes loading, and the user opens the search
    Then the zone cities data was requested exactly once

  @add-settings-page-and-device-time-location @FR8
  Scenario: Unreadable stored list
    Given the stored location list is unreadable
    When the user opens the app
    Then the load error with Reset is shown

  @add-settings-page-and-device-time-location @FR8
  Scenario: Storage unavailable
    Given storage is unavailable
    And the device time zone is "Asia/Almaty"
    When the user opens the app
    Then the storage warning is shown
    And the device time location for "Asia/Almaty" is shown

  @add-settings-page-and-device-time-location @FR8 @M7
  Scenario: Renamed device time zone
    Given the engine rejects "Europe/Kyiv" and accepts "Europe/Kiev"
    And the device reports the time zone "Europe/Kiev"
    And the interface language is "en"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is "the device time location"
    When the user opens the app
    Then the device time location shows "Kyiv", the time "09:30" and the meta line "Device time · UTC+2"
    And the device time zone is kept as "Europe/Kyiv"

  @add-settings-page-and-device-time-location @NFR-P1
  Scenario: Presenting again builds no formatter
    Given 50 locations and the device time location have been presented
    When the same rows are presented again for the next minute tick
    Then no formatter is built
    And the device time location uses at most the transition lookups of one location row
