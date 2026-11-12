Feature: Zone rules known zones
  As a user I add any city of the IANA release, whatever my engine's own zone data knows.

  @add-zone-rules-from-iana @FR5 @M3
  Scenario: A zone the engine rejects is known
    Given the engine rejects "America/Ciudad_Juarez"
    When the user adds "Ciudad Juárez" with the zone "America/Ciudad_Juarez"
    Then the location is added with the zone "America/Ciudad_Juarez"
    And at "2026-07-15T08:00:00Z" its row shows "02:00" and "UTC−6"

  @add-zone-rules-from-iana @FR5 @M3
  Scenario: A legacy name stays canonical
    Given the engine rejects "Europe/Kyiv"
    When the user adds "Kyiv" with the zone "Europe/Kiev"
    Then the location is stored with the zone "Europe/Kyiv"
    And at "2026-03-08T07:30:00Z" its row shows "09:30" and "UTC+2"

  @add-zone-rules-from-iana @FR5
  Scenario: A name in neither is unknown
    When a location with the zone "Mars/Olympus_Mons" is added
    Then the location is rejected as an unknown time zone
