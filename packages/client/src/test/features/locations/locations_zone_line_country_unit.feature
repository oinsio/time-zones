Feature: Zone line when the country is hidden
  Implements change add-country-to-zone-label.
  As a user I can hide every part of the zone line, or just the country, and the rows stay readable.

  @add-country-to-zone-label @FR3 @UX2
  Scenario: No zone line when every part is hidden
    Given the interface language is "en"
    And the zone label shows "nothing"
    And the current instant is "2026-07-15T12:00:00Z"
    And the list contains "Kolkata"
    When the user opens the app
    Then the "Kolkata" row has no zone line
    And the "Kolkata" row shows its city, its local time and its offset difference

  @add-country-to-zone-label @FR3 @FR4
  Scenario: Hiding the country applies to every row at once
    Given the interface language is "en"
    And the list is "the device time location, Moscow, Kolkata"
    When the user opens the app
    And the user turns the country off in the settings and goes back
    Then no row shows a country name
    And the device time location still shows "Device time"
    And the city labels, local times and offset differences are unchanged
