Feature: Failed data refresh is reported
  A failed data refresh run opens one issue for its source; the next successful run closes it.

  @refresh-data-through-scheduled-pull-requests @FR8
  Scenario: The first failure
    Given no issue of the zone rules refresh is open
    When the zone rules publication fails at the step "Compile the release"
    Then an issue "Data refresh failed: zone rules" is opened that names the step and links the run

  @refresh-data-through-scheduled-pull-requests @FR8
  Scenario: Recovery
    Given the issue "Data refresh failed: zone rules" is open
    When the zone rules publication succeeds reporting "already current"
    Then the issue is closed with a comment linking the run
