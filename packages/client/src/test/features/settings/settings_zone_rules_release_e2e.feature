Feature: Zone rules release line in a real browser
  Implements change add-remote-zone-rules-updates.
  As a user I read which zone rules release the app runs on, in the colour of the deploy time, on any screen.

  @add-remote-zone-rules-updates @NFR-A1 @UX3
  Scenario Outline: Plain text in the accent colour in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the user opens the settings
    Then the zone rules release line has the colour of the deploy time
    And the zone rules release line is not a Tab stop
    And the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @add-remote-zone-rules-updates @NFR-R1 @UX3
  Scenario Outline: The line fits one line at 375 px in <language>
    Given the screen is 375 px wide for the locations
    And the locations interface language is <language>
    And the user opens the settings
    Then the zone rules release line takes one line

    Examples:
      | language |
      | English  |
      | Russian  |

  @add-remote-zone-rules-updates @NFR-R1
  Scenario: The line at 320 px
    Given the screen is 320 px wide for the locations
    And the locations interface language is Russian
    And the user opens the settings
    Then the settings page needs no horizontal scrolling
