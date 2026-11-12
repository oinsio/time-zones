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
    And the user turns the abbreviation and the UTC offset off
    Then the "Moscow" row's zone line is "Russia"

  @add-country-to-zone-label @FR3 @UX2
  Scenario: All off leaves the city alone
    Given the list contains "Moscow"
    And the interface language is "en"
    When the user opens the settings
    And the user turns all three toggles off
    Then the "Moscow" row shows its city and no zone line

  @show-zone-abbreviations-and-zone-label-setting @FR16
  Scenario: A group with three options
    Given a toggle group with the caption "Sample" and the options "A", "B" and "C", of which "B" is on
    When the user turns "A" on
    Then the group reports that "A" is now on
    And "B" stays on and "C" stays off
