Feature: Home location as the reference
  Implements change set-home-location-and-show-differences.
  As a user I see the day, the marks and the moment counted from my home.

  @set-home-location-and-show-differences @FR4
  Scenario: The day follows home while travelling
    Given the device time zone is "Europe/Moscow"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, Moscow"
    And "Almaty" is home
    When the user opens the app
    Then every card shows a track for the day from "2026-03-07T19:00:00Z" to "2026-03-08T19:00:00Z"

  @set-home-location-and-show-differences @FR4
  Scenario: Clearing home returns to the device day
    Given the device time zone is "Europe/Moscow"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, Moscow"
    And "Almaty" is home
    And the app is open
    When the user clears home
    Then every card shows a track for the day from "2026-03-07T21:00:00Z" to "2026-03-08T21:00:00Z"
    And the moment is live

  @set-home-location-and-show-differences @FR4
  Scenario: A pinned moment keeps its instant
    Given the device time zone is "Europe/Moscow"
    And the current instant is "2026-03-07T20:30:00Z"
    And the list contains "Almaty, Moscow"
    And the app is open
    And the user moved to the next day
    When the user makes "Almaty" home
    Then the moment is pinned to "2026-03-08T20:30:00Z"
    And the date bar shows the date "2026-03-09"

  @set-home-location-and-show-differences @FR4
  Scenario: A home change drops the gap note
    Given the device time zone is "America/New_York"
    And the current instant is "2026-03-07T07:30:00Z"
    And the list contains "New York, Almaty"
    And the app is open
    And the user moved to the next day, so the bar shows the gap note
    When the user makes "Almaty" home
    Then the moment is pinned to "2026-03-08T07:30:00Z"
    And the bar shows no note

  @set-home-location-and-show-differences @FR7 @UX2
  Scenario: Only the home row shows the home mark
    Given the list contains "Almaty, Moscow"
    And "Almaty" is home
    When the user opens the app
    Then "Almaty" shows the home mark
    And "Moscow" shows no home mark

  @set-home-location-and-show-differences @FR7
  Scenario: Home in the device time zone
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, Moscow"
    And "Almaty" is home
    When the user opens the app
    Then the "Almaty" row has exactly 1 leading mark
    And the "Almaty" row shows no "here" caption

  @set-home-location-and-show-differences @FR7
  Scenario: Travelling
    Given the device time zone is "Europe/Moscow"
    And the list contains "Almaty, Moscow"
    And "Almaty" is home
    When the user opens the app
    Then "Almaty" shows the home mark
    And "Moscow" shows the Here mark and the caption "here"
