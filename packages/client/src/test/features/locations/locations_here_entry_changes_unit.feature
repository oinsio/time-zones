Feature: Here entry follows the device time and the list
  Implements change show-here-entry-for-device-time.
  As a user I always see the time on my own device, even when none of my
  locations is in my time zone.

  @show-here-entry-for-device-time @FR4
  Scenario: Nothing to remove or move
    Given the device time zone is "Asia/Almaty"
    And the list is "Moscow, New York"
    When the user opens the app
    Then the Here entry has no remove action, no drag handle and no Location menu

  @show-here-entry-for-device-time @FR4
  Scenario: Nothing is stored for the Here entry
    Given no location list is stored
    And the device time zone is "Asia/Almaty"
    When the user opens the app and selects a time on the Here entry's day track
    Then no location list is stored

  @show-here-entry-for-device-time @FR5
  Scenario: Time selection from the Here entry
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is "Moscow"
    When the user opens the app
    And the user moves the Here entry's day track one hour forward
    Then the Here entry shows the time "13:30"
    And the "Moscow" row shows the time "11:30"
    And the Now button is shown

  @show-here-entry-for-device-time @FR6
  Scenario: Adding the device's city hides the Here entry
    Given the device time zone is "Asia/Almaty"
    And the list is "Moscow"
    When the user opens the app
    And the user adds "Almaty"
    Then no Here entry is shown
    And exactly 1 row shows the Here mark: "Almaty"

  @show-here-entry-for-device-time @FR6
  Scenario: Removing the device's city shows the Here entry
    Given the device time zone is "Asia/Almaty"
    And the list is "Almaty, Moscow"
    When the user opens the app
    And the user removes "Almaty"
    Then the first row is the Here entry for "Asia/Almaty"

  @show-here-entry-for-device-time @FR6
  Scenario: The device moves to another zone
    Given the device time zone is "Asia/Almaty"
    And the list is "Moscow"
    When the user opens the app
    And the device time zone becomes "Europe/Moscow" and the minute tick reads it
    Then no Here entry is shown
    And the "Moscow" row shows the Here mark

  @show-here-entry-for-device-time @FR6
  Scenario: Unknown device time zone
    Given the device reports the time zone "Mars/Olympus_Mons"
    And the interface language is "en"
    And the list is "Moscow"
    When the user opens the app
    Then the Here entry shows "UTC", the caption "here" and the meta line "Device time · UTC"

  @show-here-entry-for-device-time @FR10
  Scenario: Both languages
    Given the device time zone is "Asia/Almaty"
    And the list is empty
    When the user opens the app
    And the interface language is switched between English and Russian
    Then the meta line reads "Device time · UTC+5" and "Время устройства · UTC+5"
