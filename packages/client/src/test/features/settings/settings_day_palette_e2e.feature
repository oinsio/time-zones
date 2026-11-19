Feature: Colours group of the settings page in a real browser
  Implements change redesign-cards-grid-and-day-palettes.
  The Colours group offers the Vivid and the Muted day palette as colour swatches, only in the Time of day colouring.

  @redesign-cards-grid-and-day-palettes @FR5 @UX2
  Scenario: Showing the group moves nothing above it
    Given the locations interface language is English
    And the day colouring is "Plain"
    And the screen is 375 px wide for the locations
    And the user opens the settings
    When the user notes the positions of the groups down to the colouring group
    And the user chooses the option "Time of day"
    Then the groups down to the colouring group keep their positions
    And the Colours group is shown

  @redesign-cards-grid-and-day-palettes @FR5 @UX2
  Scenario Outline: The row appears without moving the groups above when "<from>" becomes "<to>"
    Given the locations interface language is English
    And the day colouring is "<from>"
    And the screen is 375 px wide for the locations
    And the user opens the settings
    When the user notes the positions of the groups down to the colouring group
    And the user chooses the option "<to>"
    Then the groups down to the colouring group keep their positions

    Examples:
      | from          | to            |
      | Time of day   | Working hours |
      | Plain         | Time of day   |
      | Time of day   | Plain         |

  @redesign-cards-grid-and-day-palettes @FR5
  Scenario: Vivid is checked by default
    Given the locations interface language is English
    When the user opens the settings
    Then the option "Vivid" of the Colours group is checked

  @redesign-cards-grid-and-day-palettes @FR5 @UX2
  Scenario Outline: Swatches show the palette of the active theme in the <theme> theme
    Given the locations interface language is English
    And the locations screen uses the <theme> theme
    When the user opens the settings
    Then the swatch of "Vivid" starts with "<vivid>" and the swatch of "Muted" with "<muted>"
    And each swatch is 24 by 24 px with four stripes of equal width

    Examples:
      | theme | vivid   | muted   |
      | light | #a4afd4 | #a3afd3 |
      | dark  | #4c5efa | #56679a |

  @redesign-cards-grid-and-day-palettes @FR5
  Scenario: Choosing Muted recolours the main page
    Given the day colouring is "Time of day"
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    And the user opens the locations app
    When the user opens the settings, chooses the option "Muted" and goes back
    Then the night colour used by "Almaty" is "#a3afd3"

  @redesign-cards-grid-and-day-palettes @FR5 @NFR-A1
  Scenario: Keyboard choice
    Given the locations interface language is English
    And the user opens the settings
    When the user tabs to the Colours group
    And the user presses the key "ArrowRight"
    Then the option "Muted" of the Colours group is checked and focused

  @redesign-cards-grid-and-day-palettes @FR5 @NFR-A1 @NFR-A3
  Scenario: Names and sizes
    Given the locations interface language is Russian
    When the user opens the settings
    Then the Colours group named "Цвета" has the options "Яркие" and "Приглушённые", each at least 44 by 44 px
    And no swatch is exposed to assistive technology

  @redesign-cards-grid-and-day-palettes @NFR-A1
  Scenario Outline: No violations with the <palette> palette in the <theme> theme
    Given the locations interface language is English
    And the day colouring is "Time of day"
    And the day palette is "<palette>"
    And the locations screen uses the <theme> theme
    When the user opens the settings
    Then the locations screen has no accessibility violations

    Examples:
      | theme | palette |
      | light | Vivid   |
      | light | Muted   |
      | dark  | Vivid   |
      | dark  | Muted   |

  @redesign-cards-grid-and-day-palettes @NFR-R1 @UX2
  Scenario Outline: Compact colouring rows at <width> px in <language> with the <hour format> format and <colouring>
    Given the locations interface language is <language>
    And the day colouring is "<colouring>" and the hour format is <hour format>
    And the screen is <width> px wide for the locations
    When the user opens the settings
    Then the colouring group and the row under it are each at most 56 px high with their caption and controls on one row

    Examples:
      | width | language | hour format | colouring     |
      | 375   | Russian  | "H12"       | Working hours |
      | 375   | English  | "H24"       | Time of day   |
      | 375   | Russian  | "H24"       | Time of day   |
      | 1024  | Russian  | "H24"       | Working hours |
      | 2560  | English  | "H12"       | Time of day   |

  @redesign-cards-grid-and-day-palettes @NFR-R1
  Scenario Outline: No horizontal scrolling with the row at <width> px and <colouring>
    Given the locations interface language is Russian
    And the day colouring is "<colouring>" and the hour format is "H12"
    And the screen is <width> px wide for the locations
    When the user opens the settings
    Then the settings page needs no horizontal scrolling

    Examples:
      | width | colouring     |
      | 320   | Working hours |
      | 2560  | Working hours |
      | 320   | Time of day   |
      | 2560  | Time of day   |

  @redesign-cards-grid-and-day-palettes @FR1
  Scenario Outline: Groups use the control border in the <theme> theme
    Given the locations interface language is English
    And the locations screen uses the <theme> theme
    When the user opens the settings
    Then the border of every option group's joined control is the <theme> control border

    Examples:
      | theme |
      | light |
      | dark  |
