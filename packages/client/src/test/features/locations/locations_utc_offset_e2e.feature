Feature: UTC offset on location rows in a real browser
  Implements change show-utc-offset-on-location-rows.
  The offsets are readable in both themes, fit every screen and appear in the
  list state that is compared to the approved screenshots.

  @show-utc-offset-on-location-rows @NFR-A1 @M4
  Scenario Outline: Offsets have no accessibility violations in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the stored locations are "Kolkata", "Kathmandu", "New York"
    And the user opens the locations app
    Then the row of "Kolkata" shows the offset "UTC+5:30"
    And the row of "Kathmandu" shows the offset "UTC+5:45"
    And the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @show-utc-offset-on-location-rows @NFR-R1 @M5
  Scenario Outline: Offsets fit a <width> px wide screen
    Given the screen is <width> px wide for the locations
    And the stored locations are "Kolkata", "Kathmandu", "New York"
    And the user opens the locations app
    Then the row of "Kathmandu" shows the offset "UTC+5:45"
    And the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 2560  |

  @show-utc-offset-on-location-rows @NFR-R2
  Scenario Outline: The list state shows offsets at <width> px in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the locations are in the list state
    Then the row of "Almaty" shows the offset "UTC+5"
    And the row of "Moscow" shows the offset "UTC+3"

    Examples:
      | width | theme |
      | 375   | light |
      | 375   | dark  |
      | 1024  | light |
      | 1024  | dark  |
