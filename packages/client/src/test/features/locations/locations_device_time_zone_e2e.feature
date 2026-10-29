Feature: Here mark in a real browser
  Implements changes mark-device-time-zone-in-location-list and match-here-mark-to-design.
  The here mark names its row, is accessible in both themes, fits every screen and
  appears in the list state that is compared to the approved screenshots.

  @mark-device-time-zone-in-location-list @NFR-A1 @FR1
  @match-here-mark-to-design @NFR-A1
  @set-home-location-and-show-differences @NFR-A3
  Scenario: Row name includes the badge
    Given the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    Then the row of "Almaty" is named "Almaty You are here"
    And the row of "Moscow" is named "Moscow 2 hours behind"

  @mark-device-time-zone-in-location-list @NFR-A2 @M4
  @match-here-mark-to-design @NFR-A2 @M4
  Scenario Outline: No accessibility violations with the here mark in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    Then the row of "Almaty" shows the here mark
    And the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @mark-device-time-zone-in-location-list @NFR-R1 @M4
  @match-here-mark-to-design @NFR-R1 @M4
  Scenario Outline: Badge fits a <width> px wide screen
    Given the screen is <width> px wide for the locations
    And the stored locations are "Almaty", "Kathmandu", "New York"
    And the user opens the locations app
    Then the row of "Almaty" shows the here mark
    And the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 2560  |

  @mark-device-time-zone-in-location-list @NFR-R2 @M5
  @match-here-mark-to-design @NFR-R2
  Scenario Outline: The list state shows the badge at <width> px in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the locations are in the list state
    Then the row of "Almaty" shows the here mark
    And the row of "Moscow" shows no here mark

    Examples:
      | width | theme |
      | 375   | light |
      | 375   | dark  |
      | 1024  | light |
      | 1024  | dark  |

  @match-here-mark-to-design @NFR-A1 @FR1
  Scenario: The mark icon is named and the caption is not announced
    Given the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    Then the row of "Almaty" has a mark icon named "You are here"
    And the here caption of "Almaty" is hidden from assistive technology
