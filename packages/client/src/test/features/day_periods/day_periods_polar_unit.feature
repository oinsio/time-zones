Feature: Day periods at the poles
  Implements change bind-day-periods-to-sun.
  As a user I see polar day, polar night and nights that never get dark as the same rule as everywhere.

  @bind-day-periods-to-sun @FR2 @UX3
  Scenario Outline: The polar cases
    Given <city> at <coordinates> on <date>
    When the day periods of that day are computed
    Then the periods of the day are <periods>

    Examples:
      | city         | coordinates | date       | periods                                                                                                                                      |
      | Longyearbyen | 78.2, 15.6  | 2026-12-21 | night only                                                                                                                                   |
      | Longyearbyen | 78.2, 15.6  | 2026-06-21 | day only                                                                                                                                     |
      | Murmansk     | 69.0, 33.1  | 2026-12-21 | night, morning from about 10:22, evening from solar noon at about 12:45, night from about 15:08 (Europe/Moscow, within 10 minutes)           |
      | Murmansk     | 69.0, 33.1  | 2026-06-21 | evening until solar midnight at about 00:49, morning until about 03:12, day, evening from about 22:26 (Europe/Moscow, within 10 minutes), no night |

  @bind-day-periods-to-sun @FR2 @FR4
  Scenario: A night that barely gets dark
    Given Saint Petersburg at 59.9, 30.3 on 21 June 2026
    When the day periods are computed
    Then night lasts from about 00:09 to about 01:51 in "Europe/Moscow", each within 10 minutes
