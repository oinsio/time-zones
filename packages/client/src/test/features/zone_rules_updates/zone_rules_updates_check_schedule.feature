Feature: Zone rules update check schedule
  The app checks when the user returns after a while, and makes no request without an active release or while offline.

  @add-remote-zone-rules-updates @FR3
  Scenario: Checks follow the update recheck rule
    Given the app last checked 16 minutes ago
    When the page becomes visible
    Then the version file is requested once
    And a return 5 minutes after that check requests nothing

  @add-remote-zone-rules-updates @FR3
  Scenario: No active release
    Given the zone rules failed to load at start
    When a check is due
    Then no request is made

  @add-remote-zone-rules-updates @FR4
  Scenario: Offline
    Given the device is offline
    When a check is due
    Then no request is made and no notice is shown

