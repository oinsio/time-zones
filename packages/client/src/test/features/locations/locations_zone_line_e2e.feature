Feature: Zone line in a real browser
  Implements change show-zone-abbreviations-and-zone-label-setting.
  As a user I read the country, the abbreviation and the offset of every card on any screen, cut off by nothing.

  @show-zone-abbreviations-and-zone-label-setting @NFR-R1 @M5
  Scenario Outline: No overflow and no clipping at <width> px in <language>
    Given the locations interface language is <language>
    And the current time is "2026-01-15T12:00:00Z"
    And the stored locations are "Adelaide", "St. Vincent"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the locations screen does not scroll horizontally
    And no zone line element is clipped or ends in an ellipsis
    And "Adelaide" shows "ACDT" and "UTC+10:30", each on one line

    Examples:
      | language | width |
      | Russian  | 320   |
      | Russian  | 375   |
      | English  | 768   |
      | English  | 1024  |
      | Russian  | 1440  |

  @show-zone-abbreviations-and-zone-label-setting @NFR-R1
  Scenario: Wrapping between elements only
    Given the locations interface language is Russian
    And the current time is "2026-01-15T12:00:00Z"
    And the stored locations are "St. Vincent"
    And the screen is 320 px wide for the locations
    When the user opens the locations app
    Then "St. Vincent" shows "AST" and "UTC−4", each on one line
