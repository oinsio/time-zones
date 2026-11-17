Feature: Watched zones are compared when they can change
  The stored release is compared with the active one when it is stored or the watched zones change, never on a tick or a render.

  @apply-data-updates-silently @FR10
  Scenario: Adding a location compares again
    Given the stored release "2026g" changes only "Africa/Cairo", the list holds Lisbon and no notice is shown
    When the user adds Cairo
    Then the zone rules update notice names "2026g"

  @apply-data-updates-silently @FR10 @NFR-P2
  Scenario: Work bound
    Given the list holds 50 locations in 12 zones, the device time zone is none of them, and a newer release was just stored
    When the stored release is compared and 10 minutes pass
    Then 13 zones were compared, each once: the 12 zones of the list and the device time zone
    And no zone was compared on a minute tick
