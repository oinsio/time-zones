Feature: Zone rules date and time formatting
  As a user I see every date and time field from the zone rules, in my language.

  @add-zone-rules-from-iana @FR6
  Scenario: Parts come from the rules
    Given the engine's own data places "Asia/Almaty" at UTC+6
    When "2026-07-15T08:00:00Z" is split into parts in "Asia/Almaty" with hour, minute, day, month and year
    Then the hour part is "13", the minute part "00", the day "15", the month "7" and the year "2026"

  @add-zone-rules-from-iana @FR6
  Scenario: Formatting in Russian keeps the locale
    When "2026-07-15T08:00:00Z" is formatted in "Asia/Almaty" for the "ru" locale with the long date and the short time
    Then the text reads "15 июля 2026 г. в 13:00"

  @add-zone-rules-from-iana @FR6
  Scenario Outline: Zone names
    When the timeZoneName of <zone> at 2026-07-15T12:00:00Z is formatted
    Then it is <name>

    Examples:
      | zone             | name     |
      | America/New_York | EDT      |
      | Asia/Almaty      | GMT+5    |
      | Asia/Kolkata     | IST      |
      | Asia/Kathmandu   | GMT+5:45 |

  @add-zone-rules-from-iana @FR6
  Scenario Outline: Resolved options keep the requested id
    When a formatter for <requested> is created
    Then its resolved timeZone is <resolved>

    Examples:
      | requested     | resolved      |
      | Europe/Kyiv   | Europe/Kyiv   |
      | europe/kyiv   | Europe/Kyiv   |
      | Europe/Oslo   | Europe/Oslo   |
      | Asia/Calcutta | Asia/Calcutta |

  @add-zone-rules-from-iana @FR6
  Scenario: Unknown zones fall through
    When a formatter for a zone the release does not know is created
    Then the native constructor receives that zone unchanged

  @add-zone-rules-from-iana @FR6
  Scenario: A formatter without a date formats the current instant
    Given the current instant is "2026-07-15T08:00:00Z"
    When a formatter for "Asia/Almaty" with hour and minute formats without a date
    Then the text reads "13:00"
