Feature: Zone rules update check
  The app looks for a newer zone rules release at start and when the user returns, and stays silent when anything fails.

  @add-remote-zone-rules-updates @FR3
  Scenario: A newer release is published
    Given the active release is "2026f" and the version file names "2026g"
    When the app checks for a zone rules update
    Then the release file of "2026g" is requested once
    And "2026g" becomes the stored release
    And the zone rules update notice names "2026g"

  @add-remote-zone-rules-updates @FR3
  Scenario Outline: The published release is not newer
    Given the active release is "2026f" and the version file names "<release>"
    When the app checks for a zone rules update
    Then exactly one request was made and no notice is shown

    Examples:
      | release |
      | 2026f   |
      | 2026e   |

  @add-remote-zone-rules-updates @FR3
  Scenario: The newer release is already stored
    Given the active release is "2026f", "2026g" is the stored release and the version file names "2026g"
    When the app checks for a zone rules update
    Then no release file is requested and nothing is written
    And the zone rules update notice names "2026g"

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

  @add-remote-zone-rules-updates @FR4
  Scenario Outline: Failures change nothing
    Given the active release is "2026f" and <failure>
    When the app checks for a zone rules update
    Then no notice is shown and nothing is written

    Examples:
      | failure                                                           |
      | the version file request fails                                    |
      | the version file returns status 404                               |
      | the version file is not JSON                                      |
      | the version file names the invalid release name "latest"          |
      | the release file of "2026g" is not a valid zone rules release     |
      | the release file of "2026g" names the release "2026h"             |

