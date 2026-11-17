Feature: Watched zones read
  The zones the user can see are the zones of the list and the device time zone.

  @apply-data-updates-silently @FR9
  Scenario: Zones of the list and of the device
    Given the list holds Lisbon and Porto, both in "Europe/Lisbon", and Cairo, and the device time zone is "Europe/Moscow"
    When the watched zones are read
    Then they are "Europe/Lisbon", "Africa/Cairo" and "Europe/Moscow"

  @apply-data-updates-silently @FR9
  Scenario: An empty list
    Given the list is empty and the device time zone is "Africa/Cairo"
    When the watched zones are read
    Then they are "Africa/Cairo" alone
