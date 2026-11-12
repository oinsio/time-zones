Feature: Time zones on a legacy engine
  Implements change support-legacy-ios-12-safari and change add-zone-rules-from-iana.
  As a user of iOS Safari 12 I keep cities whose time zone was renamed after my engine's zone data.

  @support-legacy-ios-12-safari @FR3
  Scenario: Zone checks work without BigInt
    Given the engine has no BigInt
    When the zone "Asia/Almaty" is checked and its day-period colours are computed for "2026-03-08"
    Then the zone is accepted
    And the colour stops equal those computed with BigInt present

  @add-zone-rules-from-iana @FR5
  Scenario: Outdated zone data alone needs no polyfills
    Given the engine has every required built-in
    And the engine rejects "Europe/Kyiv"
    When the app starts
    Then the polyfills are not requested
    And Kyiv shows its time from the zone rules
