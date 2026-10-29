Feature: Offset difference on location rows
  Implements change set-home-location-and-show-differences.
  As a user I see how far every place is ahead of or behind my home.

  @set-home-location-and-show-differences @FR5
  Scenario: Differences from home
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, Moscow, Kolkata, New York"
    And "Almaty" is home
    When the user opens the app
    Then the differences are:
      | city     | difference |
      | Moscow   | −2 h       |
      | Kolkata  | +0:30      |
      | New York | −9 h       |
    And "Almaty" shows no difference

  @set-home-location-and-show-differences @FR5
  Scenario Outline: DST changes the difference
    Given the list contains "Almaty, New York"
    And "Almaty" is home
    When the moment is pinned to <instant>
    Then "New York" shows the difference <difference>

    Examples:
      | instant                | difference |
      | 2026-03-08T06:30:00Z | −10 h    |
      | 2026-03-08T07:30:00Z | −9 h     |

  @set-home-location-and-show-differences @FR5
  Scenario: Differences from the device time zone without home
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, Moscow"
    When the user opens the app
    Then "Moscow" shows the difference "−2 h"
    And "Almaty" shows no difference

  @set-home-location-and-show-differences @FR5
  Scenario: Same offset, another zone
    Given the list contains "Moscow, Minsk"
    And "Moscow" is home
    When the user opens the app
    Then "Minsk" shows the difference "0 h"

  @set-home-location-and-show-differences @FR5
  Scenario: Unknown zone
    Given the list holds Moscow and a location whose zone the browser does not know
    When the user opens the app
    Then the location with the unknown zone shows no difference

  @set-home-location-and-show-differences @FR4 @FR5
  Scenario: A home change updates the differences at once
    Given the list contains "Almaty, Moscow"
    And "Almaty" is home
    And the app is open
    When the user makes "Moscow" home
    Then "Almaty" shows the difference "+2 h"
    And "Moscow" shows no difference

  @set-home-location-and-show-differences @FR6
  Scenario Outline: Texts in both languages
    When a difference of <minutes> minutes is shown in <language>
    Then the text is <text>

    Examples:
      | minutes | language  | text    |
      | -120    | English | −2 h  |
      | 180     | Russian | +3 ч  |
      | 30      | English | +0:30 |
      | -330    | English | −5:30 |
      | 345     | Russian | +5:45 |
      | 0       | English | 0 h   |
      | 0       | Russian | 0 ч   |

  @set-home-location-and-show-differences @NFR-A3
  Scenario Outline: Accessible texts
    When a difference of <minutes> minutes is read in <language>
    Then the accessible text is <text>

    Examples:
      | minutes | language  | text                            |
      | -120    | English | 2 hours behind                |
      | 30      | English | 30 minutes ahead              |
      | 330     | English | 5 hours 30 minutes ahead      |
      | -120    | Russian | на 2 часа раньше              |
      | 345     | Russian | на 5 часов 45 минут позже     |
      | 0       | Russian | то же время                   |

  @set-home-location-and-show-differences @NFR-P1
  Scenario: 50 rows within the work bound
    Given 50 locations, one of them home
    And the home location is the only one in "Asia/Almaty" and one other location is the only one in "Europe/Moscow"
    And the rows were presented once
    When the rows are presented again
    Then no date, time or region name formatter is built
    And the reference zone's UTC offset is computed once
