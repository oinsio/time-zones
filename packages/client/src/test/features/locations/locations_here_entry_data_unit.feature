Feature: Here entry data, page states and outdated zone data
  Implements change show-here-entry-for-device-time.
  The Here entry names the device zone by its exemplar city without making the
  user wait for it, and it works on every page state and engine.

  @show-here-entry-for-device-time @FR8 @NFR-P2 @UX3
  Scenario: Derived city first, exemplar city after loading
    Given the device time zone is "Asia/Almaty"
    And the interface language is "ru"
    And the zone cities data has not been loaded
    When the user opens the app
    Then the Here entry shows the derived city "Almaty"
    When the zone cities data finishes loading
    Then the Here entry shows the exemplar city "Алматы"

  @show-here-entry-for-device-time @FR8
  Scenario: Loading fails
    Given the device time zone is "Asia/Almaty"
    And loading the zone cities data fails
    When the user opens the app
    Then the Here entry shows the derived city "Almaty"
    And no error is shown

  @show-here-entry-for-device-time @FR8 @NFR-P2
  Scenario: No load without a Here entry
    Given the device time zone is "Asia/Almaty"
    And the list is "Almaty"
    When the user opens the app and does not open the search
    Then the zone cities data is not requested

  @show-here-entry-for-device-time @FR8 @NFR-P2
  Scenario: The search reuses the Here entry's data
    Given the device time zone is "Asia/Almaty"
    And the list is "Moscow"
    When the user opens the app, the zone cities data finishes loading, and the user opens the search
    Then the suggestions are shown
    And the zone cities data was requested exactly once

  @show-here-entry-for-device-time @FR9
  Scenario: Unreadable stored list
    Given the stored location list is unreadable
    When the user opens the app
    Then the load error with Reset is shown
    And no Here entry is shown
    And the zone cities data is not requested

  @show-here-entry-for-device-time @FR9
  Scenario: Storage unavailable
    Given storage is unavailable
    And the device time zone is "Asia/Almaty"
    When the user opens the app
    Then the storage warning is shown
    And the Here entry for "Asia/Almaty" is shown

  @show-here-entry-for-device-time @FR12 @M7
  Scenario: Renamed device time zone
    Given the engine rejects "Europe/Kyiv" and accepts "Europe/Kiev"
    And the device reports the time zone "Europe/Kiev"
    And the interface language is "en"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is "Moscow"
    When the user opens the app
    Then the Here entry shows "Kyiv", the time "09:30" and the meta line "Device time · UTC+2"
    And the device time zone is kept as "Europe/Kyiv"

  @show-here-entry-for-device-time @NFR-P1
  Scenario: Presenting again builds no formatter
    Given 50 locations, none in the device time zone, have been presented with the Here entry
    When the same rows and the Here entry are presented again for the next minute tick
    Then no formatter is built
    And the Here entry uses at most the transition lookups of one location row
