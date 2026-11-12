Feature: Zone rules load before the app in a real browser
  Implements change add-zone-rules-from-iana.
  As a user I get the app on the zone rules of one IANA release, online and offline.

  @add-zone-rules-from-iana @NFR-P2
  Scenario: The asset is requested with the app
    Given the requests of the page are recorded
    When the user opens the locations app
    Then the zone rules asset was requested once, before the entry chunk finished loading

  @add-zone-rules-from-iana @FR10
  Scenario: Offline start with the rules
    Given the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    And the app is installed for offline use
    And the console of the page is recorded
    When the user reopens the app without a network connection
    Then the "Almaty" card shows a time
    And the zone rules asset is served from the service worker's precache
    And no zone rules load failure is logged

  @add-zone-rules-from-iana @FR10
  Scenario: A failed load still starts the app
    Given the zone rules asset cannot be loaded
    And the console of the page is recorded
    And the stored locations are "Almaty"
    When the user opens the locations app
    Then the main page is shown with the "Almaty" card
    And the failure is logged

  @add-zone-rules-from-iana @NFR-A1 @UX2
  Scenario: No accessibility violations on the main page
    Given the stored locations are "Almaty", "Moscow"
    When the user opens the locations app
    Then the locations screen has no accessibility violations
