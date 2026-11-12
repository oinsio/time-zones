Feature: Zone rules delivery in a real browser
  Implements change add-remote-zone-rules-updates.
  A newer zone rules release reaches a running app without an app release, and the app keeps working offline.

  @add-remote-zone-rules-updates @FR2 @NFR-P1
  Scenario: The site serves the zone rules files outside the precache
    When the user opens the app
    Then the site serves the zone rules version file and the bundled release file
    And the service worker precaches neither of them

  @add-remote-zone-rules-updates @FR4 @G2 @M2
  Scenario: A newer release is delivered and used after a reload
    Given the user has a location in Almaty
    And a newer zone rules release is published for delivery
    When the user opens the app
    And the user reloads after the zone rules update notice appears
    Then the settings page names the published release
    And the Almaty location shows UTC+4

  @add-remote-zone-rules-updates @FR4 @FR6
  Scenario: Offline after a first visit
    Given the zone rules version file requests are counted
    And the user has visited the app once
    When the user goes offline and reloads the app
    Then the page heading reads "Time Zones"
    And no zone rules version file was requested after going offline
