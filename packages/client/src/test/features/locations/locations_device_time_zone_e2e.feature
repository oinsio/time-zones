Feature: Device time zone badge in a real browser
  Implements change mark-device-time-zone-in-location-list.
  The badge names its row, is accessible in both themes, fits every screen and
  appears in the list state that is compared to the approved screenshots.

  @mark-device-time-zone-in-location-list @NFR-A1 @FR1
  Scenario: Row name includes the badge
    Given the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    Then the row of "Almaty" is named "Almaty Your time zone"
    And the row of "Moscow" is named "Moscow"

  @mark-device-time-zone-in-location-list @NFR-A2 @M4
  Scenario Outline: No accessibility violations with the badge in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    Then the row of "Almaty" shows the device time zone badge
    And the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @mark-device-time-zone-in-location-list @NFR-R1 @M4
  Scenario Outline: Badge fits a <width> px wide screen
    Given the screen is <width> px wide for the locations
    And the stored locations are "Almaty", "Kathmandu", "New York"
    And the user opens the locations app
    Then the row of "Almaty" shows the device time zone badge
    And the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 2560  |

  @mark-device-time-zone-in-location-list @NFR-R2 @M5
  Scenario Outline: The list state shows the badge at <width> px in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the locations are in the list state
    Then the row of "Almaty" shows the device time zone badge
    And the row of "Moscow" shows no device time zone badge

    Examples:
      | width | theme |
      | 375   | light |
      | 375   | dark  |
      | 1024  | light |
      | 1024  | dark  |
