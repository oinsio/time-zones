Feature: Locations management
  As a user I keep a list of locations identified by canonical IANA zones


    @add-locations-via-search @FR9
    Scenario: Legacy identifier is canonicalized on input
      When a location with the zone "Asia/Calcutta" is added
      Then the list holds it with the zone "Asia/Kolkata"

    @add-locations-via-search @FR9
    Scenario: Duplicate by canonical identifier
      Given the list contains "Kyiv" in "Europe/Kyiv"
      When "Kyiv" in "Europe/Kiev" is added
      Then the addition is rejected as a duplicate location
      And the list is unchanged

    @add-locations-via-search @FR9
    Scenario: Raw offset is rejected
      When a location with the zone "+05:00" is added
      Then the addition is rejected as an unknown time zone
      And the list is unchanged

    @add-locations-via-search @FR9
    Scenario: Unknown zone is rejected
      When a location with the zone "Mars/Olympus_Mons" is added
      Then the addition is rejected as an unknown time zone


    @add-locations-via-search @FR8
    Scenario: First location
      Given the list is empty
      When the user adds New York
      Then the list contains exactly New York

    @add-locations-via-search @FR8
    Scenario: Order is kept
      Given the list contains Almaty and Moscow
      When the user adds Kolkata
      Then the list is Almaty, Moscow, Kolkata in that order


    @add-locations-via-search @FR10
    Scenario: Remove from the middle
      Given the list is Almaty, Moscow, Kolkata
      When the user removes Moscow
      Then the list is Almaty, Kolkata in that order

    @add-locations-via-search @FR10
    Scenario: Remove the last location
      Given the list contains only Moscow
      When the user removes Moscow
      Then the list is empty

    @add-locations-via-search @FR10
    Scenario: Location already gone
      Given Moscow was removed in another tab
      When a removal of Moscow arrives
      Then it is reported as location not found
      And the list is unchanged
