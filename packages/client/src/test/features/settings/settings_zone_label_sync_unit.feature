Feature: Zone label across tabs
  Implements changes show-zone-abbreviations-and-zone-label-setting and add-country-to-zone-label.
  As a user my zone label choice reaches my other open tabs without a reload.

  @show-zone-abbreviations-and-zone-label-setting @FR15
  Scenario: Another tab changes the zone label
    Given the list contains "Moscow"
    And the app is open in two tabs
    When the user turns the UTC offset off in the first tab
    Then the second tab shows no UTC offset on its location rows without a reload


  @add-country-to-zone-label @FR6
  Scenario: Another tab changes the country
    Given the list contains "Moscow"
    And the app is open in two tabs
    When the user turns the country off in the first tab
    Then the second tab shows no country name on its Moscow row without a reload
