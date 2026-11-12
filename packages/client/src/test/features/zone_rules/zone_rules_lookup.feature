Feature: Zone rules lookup
  As a user I see the same time everywhere in the app, from the zone rules and not from my engine's own data.

  @add-zone-rules-from-iana @FR4 @M3
  Scenario Outline: Lookup across the three ranges
    When the local time type of <zone> at <instant> is read
    Then the offset is <offset> and the designation is <designation>

    Examples:
      | zone                  | instant              | offset | designation |
      | America/New_York      | 1999-07-15T12:00:00Z | −05:00 | EST         |
      | America/New_York      | 2006-07-15T12:00:00Z | −04:00 | EDT         |
      | America/New_York      | 2026-03-08T06:59:59Z | −05:00 | EST         |
      | America/New_York      | 2026-03-08T07:00:00Z | −04:00 | EDT         |
      | America/New_York      | 2040-07-15T12:00:00Z | −04:00 | EDT         |
      | Asia/Almaty           | 2024-02-29T17:59:59Z | +06:00 | +06         |
      | Asia/Almaty           | 2024-02-29T18:00:00Z | +05:00 | +05         |
      | Asia/Almaty           | 2040-07-15T12:00:00Z | +05:00 | +05         |
      | Europe/Dublin         | 2040-07-15T12:00:00Z | +01:00 | IST         |
      | America/Ciudad_Juarez | 2026-07-15T12:00:00Z | −06:00 | MDT         |
      | UTC                   | 2026-07-15T12:00:00Z | +00:00 | UTC         |

  @add-zone-rules-from-iana @FR4
  Scenario: Before the cutoff the cutoff type holds
    When the local time type of "Europe/Moscow" at "1995-07-15T12:00:00Z" is read
    Then it is the type in force at "2000-01-01T00:00:00Z", UTC+3 "MSK"

  @add-zone-rules-from-iana @FR1 @UX1 @M3
  Scenario: A stale engine shows the current rules
    Given the engine's own data places "Asia/Almaty" at UTC+6
    And the list contains Almaty
    When the rows are presented at "2026-07-15T08:00:00Z"
    Then the Almaty row shows "13:00" and "UTC+5"

  @add-zone-rules-from-iana @FR1 @UX1 @M3
  Scenario: Temporal and the presenter agree
    Given the engine's own data places "Asia/Almaty" at UTC+6
    When the local time, the hour labels, the wall-time hint and the date bar of Almaty are presented at "2026-07-15T08:00:00Z"
    Then every one of them shows the "13:00" local time of UTC+5

  @add-zone-rules-from-iana @FR1 @UX1
  Scenario: Wall-clock resolution uses the rules
    Given the engine's own data places "Asia/Almaty" at UTC+6
    When the wall-clock time "2026-07-15T13:00" in "Asia/Almaty" is resolved
    Then it resolves to "2026-07-15T08:00:00Z" with the status "UNIQUE"
