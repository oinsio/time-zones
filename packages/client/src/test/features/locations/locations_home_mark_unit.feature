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

  @match-home-mark-to-design @FR1 @FR2 @FR4 @M3
  Scenario: The home mark is the design's outlined house
    Given the device time zone is "Europe/Moscow"
    And the list contains "Almaty, Moscow"
    And "Almaty" is home
    When the user opens the app
    Then the house of "Almaty" draws exactly 1 closed outline and paints nothing inside
    And the arrow of "Moscow" is filled
