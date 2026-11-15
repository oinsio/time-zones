Feature: Colouring settings in a real browser
  Implements change add-day-colouring-setting.
  The colouring group and the working hours row are operable by keyboard and screen reader, compact, and free of violations.

  @add-day-colouring-setting @NFR-A1
  Scenario: Names and checked state of the colouring group
    Given the locations interface language is Russian
    And the user opens the settings
    Then the colouring options are named "Обычная", "По времени суток" and "По рабочему времени", in this order
    And the option "По времени суток" of the colouring group is checked

  @add-day-colouring-setting @NFR-A1
  Scenario: Arrow keys change the colouring
    Given the locations interface language is English
    And the user opens the settings
    When the user tabs to the colouring group
    And the user presses the key "ArrowRight"
    Then the option "Working hours" of the colouring group is checked
    And the working hours row is shown

  @add-day-colouring-setting @NFR-A1 @NFR-A2
  Scenario: Named fields and a described hint
    Given the locations interface language is English
    And the day colouring is "Working hours"
    And the user opens the settings
    When the user types "18:00" into the field "Start of working hours" and presses Enter
    Then the fields "Start of working hours" and "End of working hours" are marked invalid
    And both fields are described by "The start must be before the end"

  @add-day-colouring-setting @NFR-A2
  Scenario: A saved range keeps the focus in the field
    Given the locations interface language is English
    And the day colouring is "Working hours"
    And the user opens the settings
    When the user types "9:07" into the field "Start of working hours" and presses Enter
    Then the field "Start of working hours" keeps the focus

  @add-day-colouring-setting @NFR-A1 @NFR-A2 @NFR-A4
  Scenario Outline: Size, focus and no violations in the <theme> theme
    Given the locations interface language is English
    And the day colouring is "Working hours"
    And the locations screen uses the <theme> theme
    And the user opens the settings
    Then every colouring option is at least 44 by 44 px and both working hours fields are at least 44 px high
    When the user tabs to the colouring group
    Then the focused option shows a focus outline
    When the user focuses the field "End of working hours"
    Then the focused field shows a focus outline
    And the locations screen has no accessibility violations
    When the user types "18:00" into the field "Start of working hours" and presses Enter
    Then the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @add-day-colouring-setting @NFR-R1 @UX2
  Scenario Outline: Compact rows at <width> px in <language> with the <hour format> format
    Given the locations interface language is <language>
    And the day colouring is "Working hours" and the hour format is <hour format>
    And the screen is <width> px wide for the locations
    And the user opens the settings
    Then the colouring group and the working hours row are each at most 56 px high with their caption and controls on one row

    Examples:
      | width | language | hour format |
      | 375   | Russian  | "H12"       |
      | 375   | English  | "H24"       |
      | 1024  | Russian  | "H24"       |
      | 2560  | English  | "H12"       |

  @add-day-colouring-setting @NFR-R1 @UX2
  Scenario: The row appears without moving the groups above
    Given the locations interface language is English
    And the screen is 375 px wide for the locations
    And the user opens the settings
    When the user notes the positions of the groups above the colouring row
    And the user chooses the option "Working hours"
    Then the groups above the working hours row keep their positions

  @add-day-colouring-setting @NFR-R1
  Scenario Outline: No horizontal scrolling with the row at <width> px
    Given the locations interface language is Russian
    And the day colouring is "Working hours" and the hour format is "H12"
    And the screen is <width> px wide for the locations
    And the user opens the settings
    Then the settings page needs no horizontal scrolling

    Examples:
      | width |
      | 320   |
      | 2560  |

  @add-day-colouring-setting @FR4 @FR6
  Scenario: Esc in a working hours field restores first, then leaves
    Given the locations interface language is English
    And the day colouring is "Working hours"
    And the user opens the settings
    When the user types "18:00" into the field "Start of working hours" and presses Enter
    And the user presses Esc in the field "Start of working hours"
    Then the working hours fields show "10:00" and "18:00" and no hint is shown
    And the working hours row is still shown
    When the user presses Esc in the field "Start of working hours"
    Then the main page is shown
    And the focus is on the settings button
