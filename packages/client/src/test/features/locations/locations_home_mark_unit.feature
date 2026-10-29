Feature: Home mark wins over the here mark
  Implements change set-home-location-and-show-differences.
  As a user I see the house on my home row, even when it is in the device time zone.

  @set-home-location-and-show-differences @FR7
  Scenario: The home row shows no here mark
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, Moscow"
    And "Almaty" is home
    When the user opens the app
    Then the "Almaty" row shows no here mark and no caption "here"

  @set-home-location-and-show-differences @FR7
  Scenario: Home wins over here
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, Moscow"
    And "Almaty" is home
    When the user opens the app
    Then the "Almaty" row has exactly 1 leading mark, of the kind "home"
