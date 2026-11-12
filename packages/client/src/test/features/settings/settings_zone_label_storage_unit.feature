Feature: Zone label persistence
  Implements changes show-zone-abbreviations-and-zone-label-setting and add-country-to-zone-label.
  As a user my zone label choice is stored, survives a reload and follows me across tabs.

  @show-zone-abbreviations-and-zone-label-setting @FR15 @add-country-to-zone-label @FR6
  Scenario: A toggle writes the preferences once
    Given no preferences are stored
    When the user opens the settings
    And the user turns the country off
    Then the stored preferences document holds the zone label with the zone abbreviation and the UTC offset, after the debounce

  @show-zone-abbreviations-and-zone-label-setting @FR15
  Scenario: The zone label survives a reload
    Given the list contains "Moscow"
    And the user turned the zone abbreviation off
    When the app is opened again
    Then the zone label shows "the country and the UTC offset"
    And no location row shows a zone abbreviation from the first render

  @add-country-to-zone-label @FR6
  Scenario: The country choice survives a reload
    Given the list contains "Moscow"
    And the user turned the country off
    When the app is opened again
    Then the zone label shows "the zone abbreviation and the UTC offset"
    And no location row shows a country name from the first render

  @show-zone-abbreviations-and-zone-label-setting @FR15 @M6
  Scenario: Existing users get both parts
    Given the stored preferences document was written before the zone label existed, with the theme "Dark", the hour format "12-hour" and the language "ru"
    When the user opens the settings
    Then the zone label shows "the country, the zone abbreviation and the UTC offset"
    And the theme "Dark", the hour format "12-hour" and the language "ru" are in force
    And the stored document is not rewritten until the user changes a setting

  @show-zone-abbreviations-and-zone-label-setting @FR15
  Scenario: Another tab changes the zone label
    Given the list contains "Moscow"
    And the app is open in two tabs
    When the user turns the UTC offset off in the first tab
    Then the second tab shows no UTC offset on its location rows without a reload

  @add-country-to-zone-label @FR6 @M2
  Scenario: Existing users keep the country
    Given the stored preferences document was written before the zone label had the country, with the theme "Dark", the hour format "12-hour", the language "ru" and only the UTC offset in the zone label
    When the user opens the settings
    Then the zone label shows "the country and the UTC offset"
    And the theme "Dark", the hour format "12-hour" and the language "ru" are in force
    And the stored document is not rewritten until the user changes a setting

  @add-country-to-zone-label @FR6
  Scenario: Another tab changes the country
    Given the list contains "Moscow"
    And the app is open in two tabs
    When the user turns the country off in the first tab
    Then the second tab shows no country name on its Moscow row without a reload
