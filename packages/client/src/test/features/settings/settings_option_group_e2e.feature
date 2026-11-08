Feature: Compact theme and hour format in a real browser
  Implements change compact-settings-controls.
  As a user I choose the theme by three icons and the hour format by two
  pictograms, each group in one compact row, with names for assistive technology.

  @compact-settings-controls @FR1 @FR2 @M2
  Scenario Outline: Icons only, in the order System, Light, Dark in <language>
    Given the locations interface language is <language>
    And the user opens the settings
    Then the theme options are named "<system>", "<light>" and "<dark>", in this order
    And the theme options show the monitor, the sun and the moon icon and no visible text
    And every option has a pointer hint equal to its name

    Examples:
      | language | system    | light    | dark   |
      | English  | System    | Light    | Dark   |
      | Russian  | Системная | Светлая  | Тёмная |

  @compact-settings-controls @FR4 @NFR-A3 @M2
  Scenario Outline: Pictograms in every language in <language>
    Given the locations interface language is <language>
    And the user opens the settings
    Then the hour format options show "12" and "24", in this order
    And the hour format options are named "<twelve>" and "<twenty-four>", in this order

    Examples:
      | language | twelve   | twenty-four |
      | English  | 12-hour  | 24-hour     |
      | Russian  | 12 часов | 24 часа     |

  @compact-settings-controls @FR2 @NFR-A1
  Scenario: Arrow keys follow the visual order
    Given the user opens the settings
    When the user focuses the "System" option and presses "ArrowRight"
    Then the option "Light" is checked
    When the user presses the key "ArrowRight"
    Then the option "Dark" is checked

  @compact-settings-controls @NFR-A1 @NFR-A2 @UX2 @M3
  Scenario Outline: Size, focus and checked fill in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the user opens the settings
    Then every theme and hour format option is at least 44 by 44 px
    And the checked options are filled with the accent colour and the unchecked options with the <theme> surface colour
    When the user tabs to the theme group
    Then the focused option shows a focus outline
    And the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @compact-settings-controls @FR5 @NFR-R1 @UX1
  Scenario Outline: Caption and options in one row at <width> px in <language>
    Given the screen is <width> px wide for the locations
    And the locations interface language is <language>
    And the user opens the settings
    Then the caption and the options of the theme group share one row
    And the caption and the options of the hour format group share one row
    And the settings page needs no horizontal scrolling

    Examples:
      | width | language |
      | 320   | Russian  |
      | 375   | English  |
      | 1024  | Russian  |
      | 2560  | English  |

  @compact-settings-controls @NFR-R1 @M1
  Scenario Outline: Compact groups at 375 px in <language>
    Given the screen is 375 px wide for the locations
    And the locations interface language is <language>
    And the user opens the settings
    Then the theme group and the hour format group are at most 56 px high

    Examples:
      | language |
      | English  |
      | Russian  |

  @compact-settings-controls @UX2
  Scenario: Choosing moves nothing
    Given the screen is 375 px wide for the locations
    And the user opens the settings
    And the positions of the theme options are noted
    When the user chooses the option "Dark"
    Then the theme options keep their position and size
