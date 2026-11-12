Feature: Zone rules stored release and dismissed notice
  A downloaded release is stored under its own key, and a dismissed notice stays dismissed.

  @add-remote-zone-rules-updates @FR9 @NFR-P1
  Scenario: Envelope
    Given the active release is "2026f" and the version file names "2026g"
    When the app checks for a zone rules update
    Then the document under the zone rules key has schema version 1 and a payload whose release is "2026g"
    And the locations and preferences documents are unchanged

  @add-remote-zone-rules-updates @FR9
  Scenario: Storage unavailable
    Given storage is unavailable and the version file names a newer release
    When the app checks for a zone rules update
    Then the zone rules update notice is not shown
    And nothing is written

  @add-remote-zone-rules-updates @FR9
  Scenario: An unstored release is not downloaded again
    Given a save of the newer release "2026g" failed
    When the app checks again for a zone rules update and the version file still names "2026g"
    Then only the version file is requested
    And the zone rules update notice is not shown

  @add-remote-zone-rules-updates @FR7
  Scenario: Dismiss then recheck
    Given the notice for "2026g" was dismissed
    When the next check finds "2026g" still published
    Then no notice is shown

  @add-remote-zone-rules-updates @FR7
  Scenario: A newer release after dismissal
    Given the notice for "2026g" was dismissed
    When a check stores "2026h"
    Then the notice names "2026h"
