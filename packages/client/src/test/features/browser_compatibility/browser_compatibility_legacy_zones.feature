Feature: Time zones on a legacy engine
  Implements change support-legacy-ios-12-safari.
  As a user of iOS Safari 12 I keep cities whose time zone was renamed after my engine's zone data.

  @support-legacy-ios-12-safari @FR3
  Scenario: Zone checks work without BigInt
    Given the engine has no BigInt
    When the zone "Asia/Almaty" is checked and its day-period colours are computed for "2026-03-08"
    Then the zone is accepted
    And the colour stops equal those computed with BigInt present

  @support-legacy-ios-12-safari @FR4
  Scenario: Adding a renamed zone
    Given the engine rejects "Europe/Kyiv" and accepts "Europe/Kiev"
    When the user adds "Kyiv" with the zone "Europe/Kyiv"
    Then the location is added with the zone "Europe/Kyiv"
    And the stored list holds "Europe/Kyiv"

  @support-legacy-ios-12-safari @FR4
  Scenario: A renamed zone shows its time
    Given the engine rejects "Europe/Kyiv" and accepts "Europe/Kiev"
    And the stored list contains "Kyiv" with the zone "Europe/Kyiv"
    And the current instant is "2026-03-08T07:30:00Z"
    When the app starts
    Then the "Kyiv" card shows "09:30" and "UTC+2"
    And the stored list is read without error

  @support-legacy-ios-12-safari @FR4 @M3
  Scenario Outline: A wall-clock time in a renamed zone
    Given the engine rejects "Europe/Kyiv" and accepts "Europe/Kiev"
    When the wall-clock time <wall clock> in "Europe/Kyiv" is resolved
    Then it resolves to <instant> with the status <status>

    Examples:
      | wall clock       | instant              | status    |
      | 2026-03-08T10:00 | 2026-03-08T08:00:00Z | UNIQUE    |
      | 2026-03-29T03:30 | 2026-03-29T01:30:00Z | GAP       |
      | 2026-10-25T03:30 | 2026-10-25T00:30:00Z | AMBIGUOUS |

  @support-legacy-ios-12-safari @FR4
  Scenario: A zone rejected under every name
    Given the engine rejects "America/Ciudad_Juarez" under every name
    When the user adds "Juarez" with the zone "America/Ciudad_Juarez"
    Then the location is rejected as an unknown time zone
