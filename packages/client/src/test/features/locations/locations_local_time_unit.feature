Feature: Local time and date on location rows
  Implements change show-local-time-and-date-on-location-cards.
  As a user I see the local time and date of each location so I can tell what time it is there.

  @show-local-time-and-date-on-location-cards @FR1 @FR2 @M2
  Scenario: Time and date of each location
    Given the interface language is English
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, Moscow, Kathmandu, New York"
    When the user opens the app
    Then the rows show:
      | city      | time  | date       |
      | Almaty    | 12:30 | Sun, Mar 8 |
      | Moscow    | 10:30 | Sun, Mar 8 |
      | Kathmandu | 13:15 | Sun, Mar 8 |
      | New York  | 03:30 | Sun, Mar 8 |
    And every date carries the ISO date "2026-03-08"

  @show-local-time-and-date-on-location-cards @FR1 @FR2 @M2
  Scenario: Zones on both sides of midnight
    Given the interface language is English
    And the current instant is "2026-03-08T16:00:00Z"
    And the list contains "Tokyo, New York"
    When the user opens the app
    Then the "Tokyo" row shows the time "01:00" and the date "Mon, Mar 9" with the ISO date "2026-03-09"
    And the "New York" row shows the time "12:00" and the date "Sun, Mar 8" with the ISO date "2026-03-08"

  @show-local-time-and-date-on-location-cards @FR2
  Scenario: Russian interface
    Given the interface language is Russian
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    When the user opens the app
    Then the "Almaty" row shows the time "12:30" and the date "вс, 8 мар."

  @show-local-time-and-date-on-location-cards @FR5
  Scenario: Time is computed again when the list changes
    Given the current instant is "2026-07-15T12:00:42.500Z"
    And the list contains "UTC"
    When the user opens the app
    Then the "UTC" row shows the time "12:00"
    When the current instant becomes "2026-07-15T12:05:10Z"
    And the user adds "Moscow"
    Then the rows show the times:
      | city   | time  |
      | UTC    | 12:05 |
      | Moscow | 15:05 |

  @show-local-time-and-date-on-location-cards @FR6
  Scenario: Time that cannot be computed
    Given the current instant is "2026-07-15T12:00:00Z"
    And the list holds "Moscow" and a location in the zone "Mars/Olympus_Mons"
    When the user opens the app
    Then the "Olympus" row shows no time and date but keeps its remove action
    And the "Moscow" row shows the time "15:00" and the date "Wed, Jul 15"

  @show-local-time-and-date-on-location-cards @NFR-P1
  Scenario: 50 rows within the budget
    Given 50 locations
    When their rows are presented with time and date
    Then it takes at most 50 ms
