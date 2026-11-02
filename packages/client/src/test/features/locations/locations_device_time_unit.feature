Feature: Device time location
  Implements change add-settings-page-and-device-time-location.
  As a user I see the time on my own device as a location of the list, with
  the controls of every card.

  @add-settings-page-and-device-time-location @show-city-labels-in-interface-language @FR8 @FR1 @UX3
  Scenario: Device time location on the design sample
    Given the device time zone is "Asia/Almaty"
    And the interface language is "ru"
    And the zone cities data is loaded
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is "the device time location, Moscow, Kolkata, New York"
    When the user opens the app
    Then the device time location shows "Алматы", the caption "здесь", the meta line "Время устройства · UTC+5", the time "12:30" and the date "вс, 8 мар."
    And the device time location shows no offset difference
    And the rows show the offset differences "Москва −2 ч, Калькутта +0:30, Нью-Йорк −9 ч"

  @add-settings-page-and-device-time-location @FR1 @FR8
  Scenario: The device's city next to the device time location
    Given the device time zone is "Asia/Almaty"
    And the list is "the device time location"
    When the user opens the app
    And the user adds "Almaty"
    Then the list is "the device time location, Almaty"

  @add-settings-page-and-device-time-location @FR8
  Scenario: The device moves to another zone
    Given the device time zone is "Asia/Almaty"
    And the interface language is "en"
    And the list is "the device time location, New York"
    When the user opens the app
    And the device time zone becomes "Europe/Moscow" and the minute tick reads it
    Then the device time location shows "Moscow" and the meta line "Device time · UTC+3"
    And the list is still "the device time location, New York"

  @add-settings-page-and-device-time-location @FR8
  Scenario: Unknown device time zone
    Given the device reports the time zone "Mars/Olympus_Mons"
    And the interface language is "en"
    And the list is "the device time location"
    When the user opens the app
    Then the device time location shows "UTC", the caption "here" and the meta line "Device time · UTC"

  @add-settings-page-and-device-time-location @FR9 @UX3
  Scenario: Same menu as a city card
    Given the interface language is "en"
    And the list is "the device time location, Moscow"
    When the user opens the app
    Then the menu of the device time location offers "Make home" and "Remove", as the menu of "Moscow" does

  @add-settings-page-and-device-time-location @FR9
  Scenario: Remove the device time location
    Given the list is "the device time location, Moscow"
    When the user opens the app
    And the user removes "the device time location"
    Then the list is "Moscow"

  @add-settings-page-and-device-time-location @FR11
  Scenario: Add it back
    Given the list is "Moscow"
    When the user opens the app
    And the user adds the device time location
    Then the list is "Moscow, the device time location"

  @add-settings-page-and-device-time-location @FR11
  Scenario: Already listed
    Given the list is "the device time location, Moscow"
    When the user opens the app
    And the user adds the device time location
    Then the addition is rejected as a duplicate location
    And the list is "the device time location, Moscow"

  @add-settings-page-and-device-time-location @FR8
  @keep-now-button-visible-when-live @FR3
  Scenario: Time selection from the device time location
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is "the device time location, Moscow"
    When the user opens the app
    And the user moves the device time location's day track one hour forward
    Then the device time location shows the time "13:30"
    And the "Moscow" row shows the time "11:30"
    And the Now button is active

  @add-settings-page-and-device-time-location @FR16
  Scenario: Both languages
    Given the device time zone is "Asia/Almaty"
    And the list is "the device time location"
    When the user opens the app
    And the interface language is switched between English and Russian
    Then the meta line reads "Device time · UTC+5" and "Время устройства · UTC+5"
