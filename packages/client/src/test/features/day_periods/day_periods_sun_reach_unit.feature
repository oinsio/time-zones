Feature: Day periods follow the sun without a network and far ahead
  Implements change bind-day-periods-to-sun.
  As a user I read the day periods of a place offline and for a date far from today.

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
