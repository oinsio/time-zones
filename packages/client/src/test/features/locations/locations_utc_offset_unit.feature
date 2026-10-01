Feature: UTC offset on location rows
  Implements change show-utc-offset-on-location-rows.
  As a user I see the current UTC offset next to each location so I can compare zones at a glance.

  @show-utc-offset-on-location-rows @FR1 @FR2 @FR3
  Scenario: Whole-hour zone
    Given the current instant is "2026-07-15T12:00:00Z"
    And the list contains "Moscow"
    When the user opens the app
    Then the "Moscow" row shows "UTC+3"

  @show-utc-offset-on-location-rows @FR2 @FR3
  Scenario: Half-hour zone
    Given the current instant is "2026-07-15T12:00:00Z"
    And the list contains "Kolkata"
    When the user opens the app
    Then the "Kolkata" row shows "UTC+5:30"

  @show-utc-offset-on-location-rows @FR2 @FR3
  Scenario: 45-minute zone
    Given the current instant is "2026-07-15T12:00:00Z"
    And the list contains "Kathmandu"
    When the user opens the app
    Then the "Kathmandu" row shows "UTC+5:45"

  @show-utc-offset-on-location-rows @FR2 @FR3 @UX2
  Scenario Outline: Daylight saving time is respected
    Given the current instant is <instant>
    And the list contains "New York"
    When the user opens the app
    Then the "New York" row shows <offset>

    Examples:
      | instant                | offset  |
      | 2026-07-15T12:00:00Z   | UTC−4   |
      | 2026-01-15T12:00:00Z   | UTC−5   |

  @show-utc-offset-on-location-rows @FR3
  Scenario: Zero offset
    Given the current instant is "2026-07-15T12:00:00Z"
    And the list contains "UTC"
    When the user opens the app
    Then the "UTC" row shows "UTC"

  @show-utc-offset-on-location-rows @FR4
  Scenario: Offset is computed again when the list changes
    Given the list contains "New York"
    And the app was opened at "2026-01-15T12:00:00Z"
    When the current instant becomes "2026-07-15T12:00:00Z"
    And the user adds "Kolkata"
    Then the "New York" row shows "UTC−4"
    And the "Kolkata" row shows "UTC+5:30"

  @show-utc-offset-on-location-rows @FR6
  Scenario: Offset that cannot be computed
    Given the current instant is "2026-07-15T12:00:00Z"
    And the list holds "Moscow" and a location in the zone "Mars/Olympus_Mons"
    When the user opens the app
    Then the "Olympus" row shows no offset but keeps its remove action
    And the "Moscow" row shows "UTC+3"

  @show-utc-offset-on-location-rows @FR5
  Scenario: Russian interface
    Given the interface language is Russian
    And the current instant is "2026-07-15T12:00:00Z"
    And the list contains "Moscow"
    When the user opens the app
    Then the "Moscow" row shows the Russian prefix followed by "+3"

  @show-utc-offset-on-location-rows @NFR-P1 @M2
  Scenario: 50 rows within the budget
    Given 50 locations
    When their rows are presented with offsets
    Then it takes at most 50 ms
