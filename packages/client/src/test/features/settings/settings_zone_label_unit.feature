Feature: Zone label setting
  Implements change show-zone-abbreviations-and-zone-label-setting.
  As a user I choose which parts of a zone the location rows show, and I see the effect on a live example.

  @show-zone-abbreviations-and-zone-label-setting @FR12 @FR14
  Scenario: Both parts by default
    Given no preferences are stored
    And the interface language is "en"
    When the user opens the settings
    Then the zone label shows "the UTC offset and the zone abbreviation"
    And the example shows "India", "IST", "UTC+5:30"

  @show-zone-abbreviations-and-zone-label-setting @FR12 @FR14 @M4
  Scenario Outline: The example follows the toggles
    Given the interface language is "<language>"
    And the stored zone label is "<parts>"
    When the user opens the settings
    Then the example shows "<example>"

    Examples:
      | language | parts                                    | example               |
      | en       | the UTC offset and the zone abbreviation | India, IST, UTC+5:30  |
      | en       | the UTC offset only                      | India, UTC+5:30       |
      | en       | the zone abbreviation only               | India, IST            |
      | en       | nothing                                  | India                 |
      | ru       | the UTC offset and the zone abbreviation | Индия, IST, UTC+5:30  |

  @show-zone-abbreviations-and-zone-label-setting @FR13
  Scenario: Both off leaves the country
    Given the list contains "Moscow"
    And the interface language is "en"
    When the user opens the settings
    And the user turns both toggles off
    Then the "Moscow" row's zone line is "Russia"

  @show-zone-abbreviations-and-zone-label-setting @FR15
  Scenario: A toggle writes the preferences once
    Given no preferences are stored
    When the user opens the settings
    And the user turns the zone abbreviation off
    Then the stored preferences document holds the zone label with the UTC offset only, after the debounce

  @show-zone-abbreviations-and-zone-label-setting @FR15
  Scenario: The zone label survives a reload
    Given the list contains "Moscow"
    And the user turned the zone abbreviation off
    When the app is opened again
    Then the zone label shows "the UTC offset only"
    And no location row shows a zone abbreviation from the first render

  @show-zone-abbreviations-and-zone-label-setting @FR15 @M6
  Scenario: Existing users get both parts
    Given the stored preferences document was written before the zone label existed, with the theme "Dark", the hour format "12-hour" and the language "ru"
    When the user opens the settings
    Then the zone label shows "the UTC offset and the zone abbreviation"
    And the theme "Dark", the hour format "12-hour" and the language "ru" are in force
    And the stored document is not rewritten until the user changes a setting

  @show-zone-abbreviations-and-zone-label-setting @FR15
  Scenario: Another tab changes the zone label
    Given the list contains "Moscow"
    And the app is open in two tabs
    When the user turns the UTC offset off in the first tab
    Then the second tab shows no UTC offset on its location rows without a reload

  @show-zone-abbreviations-and-zone-label-setting @FR16
  Scenario: A group with three options
    Given a toggle group with the caption "Sample" and the options "A", "B" and "C", of which "B" is on
    When the user turns "A" on
    Then the group reports that "A" is now on
    And "B" stays on and "C" stays off
