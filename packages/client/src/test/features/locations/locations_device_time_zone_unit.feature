Feature: Device time zone badge on location rows
  Implements change mark-device-time-zone-in-location-list.
  As a user I see which row matches my own time zone so I find it at a glance.

  @mark-device-time-zone-in-location-list @FR1 @FR2 @M2
  Scenario: One row matches
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, Moscow"
    When the user opens the app
    Then the "Almaty" row shows the badge
    And the "Moscow" row shows no badge

  @mark-device-time-zone-in-location-list @FR2 @M2
  Scenario: No row matches
    Given the device time zone is "Asia/Tokyo"
    And the list contains "Almaty, Moscow"
    When the user opens the app
    Then no row shows the badge

  @mark-device-time-zone-in-location-list @FR2 @M2
  Scenario: Several rows match
    Given the device time zone is "Europe/Moscow"
    And the list contains "Moscow, Saint Petersburg, Almaty"
    When the user opens the app
    Then the "Moscow" row shows the badge
    And the "Saint Petersburg" row shows the badge
    And the "Almaty" row shows no badge

  @mark-device-time-zone-in-location-list @FR3 @M2
  Scenario: Legacy device identifier
    Given the device time zone is "Asia/Calcutta"
    And the list contains "Kolkata, Moscow"
    When the user opens the app
    Then the "Kolkata" row shows the badge
    And the "Moscow" row shows no badge

  @mark-device-time-zone-in-location-list @FR3 @M2
  Scenario: Unknown device identifier
    Given the device time zone is "Mars/Olympus_Mons"
    And the list contains "UTC, Moscow"
    When the user opens the app
    Then the "UTC" row shows the badge
    And the "Moscow" row shows no badge

  @mark-device-time-zone-in-location-list @FR4
  Scenario: Badge follows changes of the list
    Given the device time zone is "Asia/Almaty"
    And the list contains "Moscow"
    When the user opens the app
    And the user adds "Almaty"
    Then the "Almaty" row shows the badge
    When the user removes "Almaty"
    Then no row shows the badge

  @mark-device-time-zone-in-location-list @FR3
  Scenario: Device zone is read once
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, Moscow"
    When the user opens the app
    And the device time zone becomes "Europe/Moscow"
    And the user adds "Tokyo"
    Then the "Almaty" row shows the badge
    And the "Moscow" row shows no badge

  @mark-device-time-zone-in-location-list @FR3
  Scenario: Device zone is not stored
    Given the device time zone is "Asia/Almaty"
    And the list contains "Moscow"
    When the user opens the app
    And the user adds "Almaty"
    Then the stored list document holds only the locations

  @mark-device-time-zone-in-location-list @FR5
  Scenario: English interface
    Given the interface language is "en"
    And the device time zone is "Asia/Almaty"
    And the list contains "Almaty"
    When the user opens the app
    Then the "Almaty" row shows "Your time zone"

  @mark-device-time-zone-in-location-list @FR5
  Scenario: Russian interface
    Given the interface language is "ru"
    And the device time zone is "Asia/Almaty"
    And the list contains "Almaty"
    When the user opens the app
    Then the "Almaty" row shows the Russian badge text

  @mark-device-time-zone-in-location-list @NFR-P1 @replace-wall-clock-row-budgets-with-deterministic-checks @FR2
  Scenario: 50 rows within the budget
    Given the device time zone is "Asia/Almaty"
    And 50 locations of which some are in the device time zone
    And no row has been presented yet
    When their rows are presented
    Then at most 3 date and time formatters are built per distinct time zone
    And at most 1 region name formatter is built
