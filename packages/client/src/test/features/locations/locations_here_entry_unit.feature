Feature: Here entry for the device time
  Implements change show-here-entry-for-device-time.
  As a user I always see the time on my own device, even when none of my
  locations is in my time zone.

  @show-here-entry-for-device-time @FR1
  Scenario: No location matches
    Given the device time zone is "Asia/Almaty"
    And the list is "Moscow, Kolkata, New York"
    When the user opens the app
    Then the first row is the Here entry for "Asia/Almaty"
    And the locations follow in list order "Moscow, Kolkata, New York"

  @show-here-entry-for-device-time @FR1
  Scenario: A location matches
    Given the device time zone is "Asia/Almaty"
    And the list is "Almaty, Moscow"
    When the user opens the app
    Then no Here entry is shown
    And the "Almaty" row shows the Here mark

  @show-here-entry-for-device-time @FR1
  Scenario: The home location matches
    Given the device time zone is "Asia/Almaty"
    And the list is "Almaty, Moscow"
    And "Almaty" is the home location
    When the user opens the app
    Then no Here entry is shown
    And the "Almaty" row shows the Home mark

  @show-here-entry-for-device-time @FR1
  Scenario: Matching is by time zone ID, not by offset
    Given the device time zone is "Europe/Minsk"
    And the list is "Moscow"
    When the user opens the app
    Then the first row is the Here entry for "Europe/Minsk"
    And the locations follow in list order "Moscow"

  @show-here-entry-for-device-time @FR2 @UX1
  Scenario: Here entry on the design sample
    Given the device time zone is "Asia/Almaty"
    And the interface language is "ru"
    And the zone cities data is loaded
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is "Moscow, Kolkata, New York"
    When the user opens the app
    Then the Here entry shows "Алматы", the caption "здесь", the meta line "Время устройства · UTC+5", the time "12:30" and the date "вс, 8 мар."
    And its handle stands at the same position as on every card

  @show-here-entry-for-device-time @FR2
  Scenario: English meta line
    Given the device time zone is "Asia/Kolkata"
    And the interface language is "en"
    And the list is empty
    When the user opens the app
    Then the Here entry's meta line is "Device time · UTC+5:30"

  @show-here-entry-for-device-time @FR3
  Scenario: No home
    Given the device time zone is "Asia/Almaty"
    And no home location is set
    And the interface language is "ru"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is "Moscow, Kolkata, New York"
    When the user opens the app
    Then the Here entry shows no offset difference
    And the rows show the offset differences "Moscow −2 ч, Kolkata +0:30, New York −9 ч"

  @show-here-entry-for-device-time @FR3
  Scenario: Travelling with home set
    Given "Almaty" is the home location
    And the device time zone is "Europe/Moscow"
    And the interface language is "ru"
    And the zone cities data is loaded
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is "Almaty, Kolkata, New York"
    When the user opens the app
    Then the Here entry shows "Москва" with the offset difference "−2 ч" and the meta line "Время устройства · UTC+3"
    And the reference day is "2026-03-07T19:00:00Z" to "2026-03-08T19:00:00Z"
