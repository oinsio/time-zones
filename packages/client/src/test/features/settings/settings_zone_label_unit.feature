Feature: Zone label setting
  Implements change show-zone-abbreviations-and-zone-label-setting.
  As a user I choose which parts of a zone the location rows show, and I see the effect on a live example.

  @show-zone-abbreviations-and-zone-label-setting @FR12 @FR14 @polish-settings-and-remove-offline-update-notice @FR3 @FR4 @UX1 @M1 @add-country-to-zone-label @FR1 @FR2 @UX1
  Scenario: Both parts by default
    Given no preferences are stored
    And the interface language is "en"
    When the user opens the settings
    Then the "Country", "Abbreviation" and "UTC offset" toggles are on, in this order
    And the example shows "Russia, MSK, UTC+3"

  @show-zone-abbreviations-and-zone-label-setting @FR12 @FR14 @M4 @polish-settings-and-remove-offline-update-notice @FR4 @M1 @add-country-to-zone-label @FR5 @M1
  Scenario Outline: The example follows the toggles
    Given the interface language is "<language>"
    And the stored zone label is "<parts>"
    When the user opens the settings
    Then the example shows "<example>"

    Examples:
      | language | parts                                                 | example            |
      | en       | the country, the zone abbreviation and the UTC offset | Russia, MSK, UTC+3 |
      | en       | the country and the UTC offset                        | Russia, UTC+3      |
      | en       | the country and the zone abbreviation                 | Russia, MSK        |
      | en       | the country only                                      | Russia             |
      | en       | the zone abbreviation and the UTC offset              | MSK, UTC+3         |
      | en       | the UTC offset only                                   | UTC+3              |
      | en       | the zone abbreviation only                            | MSK                |
      | en       | nothing                                               | City only          |
      | ru       | the country, the zone abbreviation and the UTC offset | Россия, МСК, UTC+3 |
      | ru       | nothing                                               | Только город       |

  @show-zone-abbreviations-and-zone-label-setting @FR13 @add-country-to-zone-label @FR3
  Scenario: Both off leaves the country
    Given the list contains "Moscow"
    And the interface language is "en"
    When the user opens the settings
    And the user turns both toggles off
    Then the "Moscow" row's zone line is "Russia"

  @add-country-to-zone-label @FR3 @UX2
  Scenario: All off leaves the city alone
    Given the list contains "Moscow"
    And the interface language is "en"
    When the user opens the settings
    And the user turns all three toggles off
    Then the "Moscow" row shows its city and no zone line

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

  @show-zone-abbreviations-and-zone-label-setting @FR16
  Scenario: A group with three options
    Given a toggle group with the caption "Sample" and the options "A", "B" and "C", of which "B" is on
    When the user turns "A" on
    Then the group reports that "A" is now on
    And "B" stays on and "C" stays off
