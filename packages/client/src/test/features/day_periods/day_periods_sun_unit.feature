Feature: Day periods follow the sun
  Implements change bind-day-periods-to-sun.
  As a user I read night, morning, day and evening of a place from the sun at that place.

  @bind-day-periods-to-sun @FR1
  Scenario Outline: A day at a middle latitude
    Given Almaty at 43.3, 76.9 on 8 March 2026
    When the day period is read at <local time> in Asia/Almaty
    Then it is <period>

    Examples:
      | local time | period  |
      | 03:00      | night   |
      | 06:20      | morning |
      | 12:00      | day     |
      | 17:45      | evening |
      | 21:00      | night   |

  @bind-day-periods-to-sun @FR1 @FR4
  Scenario Outline: Boundaries of the day
    Given <city> at <coordinates> on <date>
    When the day-period boundaries of that day are computed
    Then in <zone> night ends at <dawn>, day starts at <day start>, day ends at <day end> and night starts at <dusk>, each within 3 minutes

    Examples:
      | city     | coordinates   | date       | zone              | dawn  | day start | day end | dusk  |
      | Almaty   | 43.3, 76.9    | 2026-03-08 | Asia/Almaty       | 05:48 | 06:55     | 17:11   | 18:18 |
      | Moscow   | 55.8, 37.6    | 2026-12-21 | Europe/Moscow     | 08:10 | 10:16     | 14:38   | 16:44 |
      | Moscow   | 55.8, 37.6    | 2026-06-21 | Europe/Moscow     | 02:42 | 04:48     | 20:14   | 22:20 |
      | Quito    | -0.2, -78.5   | 2026-03-20 | America/Guayaquil | 05:57 | 06:45     | 17:57   | 18:45 |
      | Sydney   | -33.9, 151.2  | 2026-12-21 | Australia/Sydney  | 05:11 | 06:17     | 19:28   | 20:34 |
      | Kolkata  | 22.5, 88.4    | 2026-03-08 | Asia/Kolkata      | 05:29 | 06:21     | 17:13   | 18:05 |

  @bind-day-periods-to-sun @FR1 @FR7 @UX2
  Scenario: Two cities of one zone differ
    Given Moscow at 55.8, 37.6 and Kazan at 55.8, 49.1, both in "Europe/Moscow", on 21 June 2026
    When the day-period boundaries are computed
    Then the day starts at 04:48 in Moscow and at 04:02 in Kazan, each within 3 minutes

  @bind-day-periods-to-sun @FR3
  Scenario: A clock change does not move the sun
    Given New York at 40.7, -74.0 on 8 March 2026, when its clocks go forward
    When the day-period boundaries are computed
    Then night ends at 06:51 and the day starts at 07:55 local time, each within 3 minutes
    And the absolute instants are the same as if the clocks had not changed

  @bind-day-periods-to-sun @FR3 @NFR-P2
  Scenario: Offline
    Given the device has no network connection
    When the day periods of Almaty are computed
    Then they are the same as online and nothing was requested

  @bind-day-periods-to-sun @FR4
  Scenario: A far date
    Given Moscow at 55.8, 37.6
    When the day-period boundaries of 21 December 2090 are computed
    Then night ends at "2090-12-21T05:10:00Z", which is 08:10 in "Europe/Moscow", within 3 minutes
