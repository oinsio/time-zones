Feature: Zone abbreviations
  Implements change show-zone-abbreviations-and-zone-label-setting.
  As a user I recognise a zone by its abbreviation (IST, EST, MSK), the one that is in force at the moment I look at.

  @show-zone-abbreviations-and-zone-label-setting @FR2 @M1
  Scenario Outline: The abbreviation follows the moment
    When the zone abbreviation of "<zone>" at "<instant>" is read
    Then it is "<abbreviation>"

    Examples:
      | zone               | instant              | abbreviation |
      | America/New_York   | 2026-01-15T12:00:00Z | EST          |
      | America/New_York   | 2026-07-15T12:00:00Z | EDT          |
      | Europe/Dublin      | 2026-01-15T12:00:00Z | GMT          |
      | Europe/Dublin      | 2026-07-15T12:00:00Z | IST          |
      | Australia/Sydney   | 2026-01-15T12:00:00Z | AEDT         |
      | Australia/Sydney   | 2026-07-15T12:00:00Z | AEST         |
      | Australia/Adelaide | 2026-01-15T12:00:00Z | ACDT         |
      | Asia/Kolkata       | 2026-07-15T12:00:00Z | IST          |
      | Europe/Moscow      | 2026-07-15T12:00:00Z | MSK          |
      | America/Panama     | 2026-07-15T12:00:00Z | EST          |
      | UTC                | 2026-07-15T12:00:00Z | UTC          |

  @show-zone-abbreviations-and-zone-label-setting @FR2
  Scenario: The abbreviation changes at the clock change
    Given New York moves its clocks forward at "2026-03-08T07:00:00Z"
    When the zone abbreviation of "America/New_York" is read at "2026-03-08T06:59:00Z" and at "2026-03-08T07:30:00Z"
    Then it is "EST" and then "EDT"

  @show-zone-abbreviations-and-zone-label-setting @FR1
  Scenario Outline: Numeric designations are no abbreviation
    When the zone abbreviation of "<zone>" at "2026-07-15T12:00:00Z" is read
    Then there is none

    Examples:
      | zone              |
      | Asia/Almaty       |
      | Asia/Dubai        |
      | Asia/Singapore    |
      | America/Sao_Paulo |

  @show-zone-abbreviations-and-zone-label-setting @FR1
  Scenario: Unknown zone
    When the zone abbreviation of "Mars/Olympus_Mons" at "2026-07-15T12:00:00Z" is read
    Then there is none

  @show-zone-abbreviations-and-zone-label-setting @FR1
  Scenario Outline: Abbreviation pairs
    When the abbreviation pair of "<zone>" is read
    Then it is "<pair>"

    Examples:
      | zone             | pair     |
      | America/New_York | EST, EDT |
      | Europe/Dublin    | GMT, IST |
      | Asia/Jerusalem   | IST, IDT |
      | Australia/Sydney | AEST, AEDT |
      | Asia/Kolkata     | IST      |
      | America/Panama   | EST      |

  @show-zone-abbreviations-and-zone-label-setting @FR4
  Scenario: Available on the first render offline
    Given the app is opened without a network connection
    And the list contains "New York" and the current instant is "2026-07-15T12:00:00Z"
    When the list is first shown
    Then the "New York" row shows "EDT" in the same render, without a loading state

  @show-zone-abbreviations-and-zone-label-setting @FR3 @M1
  Scenario: Moscow in Russian and English
    Given the current instant is "2026-07-15T12:00:00Z"
    And the list contains "Moscow"
    When the interface language is Russian
    Then the "Moscow" row shows "МСК"
    When the interface language is English
    Then the "Moscow" row shows "MSK"

  @show-zone-abbreviations-and-zone-label-setting @FR3 @M1
  Scenario: Other abbreviations stay Latin in Russian
    Given the interface language is Russian
    And the current instant is "2026-07-15T12:00:00Z"
    And the list contains "Kolkata" and "New York"
    When the list is shown
    Then "Kolkata" shows "IST" and "New York" shows "EDT"

  @add-zone-rules-from-iana @FR9
  Scenario: Table built from the release
    When the abbreviation table is built from the zone rules release "2026f"
    Then "America/New_York" has the pair "EST, EDT", "Europe/Dublin" has "GMT, IST", "Asia/Kolkata" has "IST"
    And "Asia/Almaty" has no abbreviation

  @add-zone-rules-from-iana @FR9
  Scenario: Abbreviations kept from the table before
    Given the abbreviation table built before this change
    When it is compared with the table built from the zone rules release "2026f"
    Then every zone of the earlier table has the same abbreviations in both
    And the only exceptions are zones whose designations an IANA release note changed, each listed with that release
