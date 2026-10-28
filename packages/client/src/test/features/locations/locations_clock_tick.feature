Feature: Location rows follow the clock
  Implements change show-local-time-and-date-on-location-cards.
  As a user I see the time of each location change at every minute, and nothing change while the page is hidden.

  @show-local-time-and-date-on-location-cards @FR3 @M3
  Scenario: The time changes at the minute boundary
    Given the current instant is "2026-07-15T12:00:42.500Z"
    And the list contains "UTC"
    When the user opens the app
    Then the "UTC" row shows the time "12:00"
    And the next update is due in 17500 ms
    When the next minute starts at "2026-07-15T12:01:00Z"
    Then the "UTC" row now shows the time "12:01"
    And the next update is then due in 60000 ms

  @show-local-time-and-date-on-location-cards @FR3 @M3
  Scenario: No updates while the page is hidden
    Given the current instant is "2026-07-15T12:00:42.500Z"
    And the list contains "UTC"
    When the user opens the app
    And the page becomes hidden
    Then no update is due
    When the page becomes visible at "2026-07-15T12:10:20Z"
    Then the "UTC" row shows the time "12:10"
    And the next update is due in 40000 ms

  @show-local-time-and-date-on-location-cards @FR3 @FR4 @M3
  Scenario: The offset follows a DST change while the app is open
    Given the current instant is "2026-03-08T06:59:30Z"
    And the list contains "New York"
    When the user opens the app
    Then the "New York" row shows the time "01:59" and the offset "UTC−5"
    When the next minute starts at "2026-03-08T07:00:00Z"
    Then the "New York" row now shows the time "03:00" and the offset "UTC−4"

  @show-local-time-and-date-on-location-cards @FR3 @FR4
  Scenario: Updates write nothing
    Given the current instant is "2026-07-15T12:00:00Z"
    And the list contains "UTC"
    When the user opens the app
    And three minute updates happen
    Then the stored list was not written

  @show-local-time-and-date-on-location-cards @FR4
  Scenario: Offset is computed again at the minute boundary
    Given the current instant is "2026-03-08T06:59:30Z"
    And the list contains "New York"
    When the user opens the app
    Then the "New York" row shows the offset "UTC−5"
    When the next minute starts at "2026-03-08T07:00:00Z"
    Then the "New York" row now shows the offset "UTC−4"

  @match-here-mark-to-design @FR5
  @show-local-time-and-date-on-location-cards @FR4
  Scenario: Device zone is read again at the minute boundary
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, Moscow"
    When the user opens the app
    And the device time zone becomes "Europe/Moscow"
    And the next minute starts at "2026-07-15T12:01:00Z"
    Then the "Moscow" row shows the here mark
    And the "Almaty" row shows no here mark

  @match-here-mark-to-design @FR5
  @show-local-time-and-date-on-location-cards @FR4
  Scenario: Device zone is read again when the page becomes visible
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty, Moscow"
    When the user opens the app
    And the page becomes hidden
    And the device time zone becomes "Europe/Moscow"
    And the page becomes visible
    Then the "Moscow" row shows the here mark
    And the "Almaty" row shows no here mark
