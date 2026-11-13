Feature: Zone label in a real browser
  Implements change show-zone-abbreviations-and-zone-label-setting.
  As a user I switch the parts of the zone label with the mouse or the keyboard on any screen.

  @show-zone-abbreviations-and-zone-label-setting @FR12 @polish-settings-and-remove-offline-update-notice @FR1 @FR2 @FR3 @add-country-to-zone-label @FR2 @NFR-A1
  Scenario: Names and pressed state
    Given the locations interface language is Russian
    When the user opens the settings
    Then the group "Обозначение часового пояса" holds the pressed toggle buttons "Страна", "Аббревиатура" and "Смещение UTC" in this order
    And the description of the group "Обозначение часового пояса" contains "Россия"

  @show-zone-abbreviations-and-zone-label-setting @NFR-A1 @polish-settings-and-remove-offline-update-notice @FR3 @add-country-to-zone-label @NFR-A1
  Scenario: Toggle with the keyboard
    Given the locations interface language is English
    And the user opens the settings
    When the user tabs to the toggle "Country" and presses "Space"
    Then the toggle "Country" is not pressed
    And the example shows "MSK, UTC+3"
    When the user presses the key "Enter"
    Then the toggle "Country" is pressed

  @polish-settings-and-remove-offline-update-notice @NFR-A2 @add-country-to-zone-label @FR2 @NFR-A1
  Scenario: Tab order follows the zone line
    Given the locations interface language is English
    And the user opens the settings
    When the user focuses the toggle "Country" and presses "Tab"
    Then the toggle "Abbreviation" is focused
    When the user presses the key "Tab"
    Then the toggle "UTC offset" is focused

  @show-zone-abbreviations-and-zone-label-setting @NFR-A1 @add-country-to-zone-label @NFR-A1
  Scenario: Toggle size, focus and pressed icon
    Given the locations interface language is English
    And the zone label shows only the UTC offset
    And the user opens the settings
    Then each zone label toggle is at least 44 px wide and 44 px high
    And the toggle "UTC offset" shows a focus outline when focused with the keyboard
    And only the toggle "UTC offset" shows the check icon

  @add-country-to-zone-label @FR5 @NFR-A1
  Scenario: City only is the description
    Given the locations interface language is English
    And the zone label shows all toggles off
    And the user opens the settings
    Then the description of the group "Timezone label" contains "City only"

  @show-zone-abbreviations-and-zone-label-setting @NFR-A1 @M7 @add-country-to-zone-label @NFR-A1 @M3
  Scenario Outline: No violations with the zone label group in the <theme> theme with <parts>
    Given the locations screen uses the <theme> theme
    And the zone label shows <parts>
    And the user opens the settings
    Then the locations screen has no accessibility violations

    Examples:
      | theme | parts            |
      | light | all toggles on   |
      | light | all toggles off  |
      | dark  | all toggles on   |
      | dark  | all toggles off  |

  @show-zone-abbreviations-and-zone-label-setting @NFR-R2 @polish-settings-and-remove-offline-update-notice @NFR-R1 @add-country-to-zone-label @NFR-R1
  Scenario Outline: One row on wide screens at <width> px in <language>
    Given the screen is <width> px wide for the locations
    And the locations interface language is <language>
    When the user opens the settings
    Then the three zone label toggles share one row

    Examples:
      | width | language |
      | 640   | Russian  |
      | 1024  | English  |

  @show-zone-abbreviations-and-zone-label-setting @NFR-R2 @polish-settings-and-remove-offline-update-notice @NFR-R1 @add-country-to-zone-label @NFR-R1 @M4
  Scenario Outline: Narrow screens at <width> px in <language>
    Given the screen is <width> px wide for the locations
    And the locations interface language is <language>
    When the user opens the settings
    Then each zone label toggle is at least 44 px wide and 44 px high
    And the settings page needs no horizontal scrolling

    Examples:
      | width | language |
      | 320   | Russian  |
      | 320   | English  |
      | 375   | Russian  |
      | 375   | English  |
      | 2560  | Russian  |
      | 2560  | English  |

  @show-zone-abbreviations-and-zone-label-setting @NFR-R2 @UX2 @polish-settings-and-remove-offline-update-notice @NFR-R1 @add-country-to-zone-label @NFR-R1
  Scenario Outline: Toggling does not move the toggles at <width> px
    Given the screen is <width> px wide for the locations
    And the user opens the settings
    When the user turns the toggle "Country" off
    Then the three zone label toggles keep their position and size

    Examples:
      | width |
      | 375   |
      | 1024  |
