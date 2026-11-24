Feature: Reading a Unix time
  Implements change add-unix-time-converter-tool.
  As a user I type a Unix time or an ISO 8601 date and see the moment in the
  places of my list, to the digit.

  @add-unix-time-converter-tool @FR14
  Scenario: The page opens live
    When the user opens the converter
    Then the converter input shows "1795432987" and the unit in force is "Секунды"
    And the Moscow row shows "14:23:07"

  @add-unix-time-converter-tool @FR6
  Scenario Outline: Texts the input reads
    When the user types "<text>" into the converter input
    Then the ISO 8601 notation is "<iso>"
    And the converter input still shows "<text>"

    Examples:
      | text                              | iso                             |
      | 1795432987                        | 2026-11-23T11:23:07Z            |
      | 1 795 432 987                     | 2026-11-23T11:23:07Z            |
      | 1_795_432_987                     | 2026-11-23T11:23:07Z            |
      | 1,795,432,987                     | 2026-11-23T11:23:07Z            |
      | 1 795 432 987.5                   | 2026-11-23T11:23:07.500Z        |
      | -1                                | 1969-12-31T23:59:59Z            |
      | 0                                 | 1970-01-01T00:00:00Z            |
      | 1795432987.123456                 | 2026-11-23T11:23:07.123456Z     |
      | 2026-11-23T14:23:07+03:00         | 2026-11-23T11:23:07Z            |
      | 2026-11-23T14:23:07.123456+03:00  | 2026-11-23T11:23:07.123456Z     |
      | 2026-11-23T11:23:07.123456789Z    | 2026-11-23T11:23:07.123456789Z  |

  @add-unix-time-converter-tool @FR6
  Scenario: A paste replaces a text the user did not type
    Given the converter is live
    When the user pastes "1700000000" into the converter input
    Then the converter input shows "1700000000" and the moment is pinned

  @add-unix-time-converter-tool @FR7
  Scenario Outline: Detection by digit count
    When the user types "<text>" into the converter input
    Then the unit in force is "<unit>" and the ISO 8601 notation is "<iso>"

    Examples:
      | text                 | unit         | iso                              |
      | 5                    | Секунды      | 1970-01-01T00:00:05Z             |
      | 17954329870          | Секунды      | 2538-12-13T17:51:10Z             |
      | 179543298712         | Миллисекунды | 1975-09-10T01:08:18.712Z         |
      | 1795432987123        | Миллисекунды | 2026-11-23T11:23:07.123Z         |
      | 179543298712345      | Микросекунды | 1975-09-10T01:08:18.712345Z      |
      | 1795432987123456789  | Наносекунды  | 2026-11-23T11:23:07.123456789Z   |
      | -1795432987123       | Миллисекунды | 1913-02-08T12:36:52.877Z         |

  @add-unix-time-converter-tool @FR7
  Scenario: A fixed unit reads a typed number again
    Given the user typed "1795432987"
    When the user chooses the unit "Миллисекунды"
    Then the ISO 8601 notation is "1970-01-21T18:43:52.987Z" and the converter input still shows "1795432987"
    When the user returns to the unit "Авто"
    Then the ISO 8601 notation is "2026-11-23T11:23:07Z"

  @add-unix-time-converter-tool @FR7
  Scenario: The unit choice does not touch an ISO 8601 text
    Given the user typed "2026-11-23T11:23:07.123Z"
    When the user chooses the unit "Наносекунды"
    Then the converter input still shows "2026-11-23T11:23:07.123Z" and the Moscow row shows "14:23:07.123"

  @add-unix-time-converter-tool @FR8
  Scenario Outline: Fraction digits follow the precision
    When the user types "<text>" into the converter input
    Then the Moscow row shows "<time>"

    Examples:
      | text                       | time                |
      | 1795432987                 | 14:23:07            |
      | 1795432987123              | 14:23:07.123        |
      | 1795432987123456           | 14:23:07.123456     |
      | 1795432987123456789        | 14:23:07.123456789  |
      | 1795432987.5               | 14:23:07.500        |
      | 2026-11-23T11:23:07.1234Z  | 14:23:07.123400     |

  @add-unix-time-converter-tool @FR8
  Scenario: Before 1970
    When the user types "-1" into the converter input
    And the user chooses the unit "Наносекунды"
    Then the ISO 8601 notation is "1969-12-31T23:59:59.999999999Z"

  @add-unix-time-converter-tool @FR8 @NFR-P3
  Scenario: The same digits without BigInt
    Given the engine has no BigInt
    When the user types "1795432987123456789" into the converter input
    Then the Moscow row shows "14:23:07.123456789"
    And the notation "Наносекунды" is "1795432987123456789"
