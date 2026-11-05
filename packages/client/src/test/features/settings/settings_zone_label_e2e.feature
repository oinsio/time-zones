Feature: Zone label in a real browser
  Implements change show-zone-abbreviations-and-zone-label-setting.
  As a user I switch the parts of the zone label with the mouse or the keyboard on any screen.

  @show-zone-abbreviations-and-zone-label-setting @FR12
  Scenario: Names and pressed state
    Given the locations interface language is Russian
    When the user opens the settings
    Then the group "Подпись пояса" holds the pressed toggle buttons "Смещение UTC" and "Сокращение"
    And the description of the group "Подпись пояса" contains "Индия"

  @show-zone-abbreviations-and-zone-label-setting @NFR-A1
  Scenario: Toggle with the keyboard
    Given the locations interface language is English
    And the user opens the settings
    When the user tabs to the toggle "Abbreviation" and presses "Space"
    Then the toggle "Abbreviation" is not pressed
    And the example shows "India, UTC+5:30"
    When the user presses the key "Enter"
    Then the toggle "Abbreviation" is pressed

  @show-zone-abbreviations-and-zone-label-setting @NFR-A1
  Scenario: Toggle size, focus and pressed icon
    Given the locations interface language is English
    And the zone label shows only the UTC offset
    And the user opens the settings
    Then each zone label toggle is at least 44 px wide and 44 px high
    And the toggle "UTC offset" shows a focus outline when focused with the keyboard
    And only the toggle "UTC offset" shows the check icon

  @show-zone-abbreviations-and-zone-label-setting @NFR-A1 @M7
  Scenario Outline: No violations with the zone label group in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the zone label shows <parts>
    And the user opens the settings
    Then the locations screen has no accessibility violations

    Examples:
      | theme | parts                                    |
      | light | the UTC offset and the zone abbreviation |
      | dark  | nothing                                  |

  @show-zone-abbreviations-and-zone-label-setting @NFR-R2
  Scenario Outline: One row on wide screens at <width> px in <language>
    Given the screen is <width> px wide for the locations
    And the locations interface language is <language>
    When the user opens the settings
    Then the zone label caption and both toggles share one row

    Examples:
      | width | language |
      | 640   | Russian  |
      | 1024  | English  |

  @show-zone-abbreviations-and-zone-label-setting @NFR-R2
  Scenario Outline: Narrow screens at <width> px
    Given the screen is <width> px wide for the locations
    And the locations interface language is Russian
    When the user opens the settings
    Then both zone label toggles share one row
    And the settings page needs no horizontal scrolling

    Examples:
      | width |
      | 320   |
      | 375   |
      | 2560  |

  @show-zone-abbreviations-and-zone-label-setting @NFR-R2 @UX2
  Scenario Outline: Toggling does not move the toggles at <width> px
    Given the screen is <width> px wide for the locations
    And the user opens the settings
    When the user turns the toggle "Abbreviation" off
    Then both zone label toggles keep their position and size

    Examples:
      | width |
      | 375   |
      | 1024  |
