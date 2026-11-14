Feature: Namesake regions in the search results in a real browser
  Implements change add-geonames-city-source.
  As a user I tell the cities named Springfield apart by their regions, on every screen and in both themes.

  @add-geonames-city-source @NFR-A1 @FR7 @UX1
  Scenario: The region is in the result's name
    Given the locations interface language is English
    And the user opens the locations app
    When the user searches for "Springfield"
    Then the first result's accessible name contains "Missouri"

  @add-geonames-city-source @NFR-A1 @M6
  Scenario Outline: Accessibility check with regions in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the locations interface language is English
    And the user opens the locations app
    When the user searches for "Springfield"
    Then the search dialog has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @add-geonames-city-source @NFR-R1
  Scenario Outline: No horizontal scrolling with regions at <width> px in <language>
    Given the locations interface language is <language>
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the user searches for "Springfield"
    Then the locations screen does not scroll horizontally

    Examples:
      | width | language |
      | 320   | English  |
      | 320   | Russian  |
      | 375   | English  |
      | 375   | Russian  |
      | 2560  | English  |
      | 2560  | Russian  |

  @add-geonames-city-source @NFR-R1 @M6
  Scenario Outline: Screenshots with regions at <width> px in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the locations interface language is English
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the user searches for "Springfield"
    Then the locations screen matches the approved screenshot

    Examples:
      | width | theme |
      | 375   | light |
      | 375   | dark  |
      | 1024  | light |
      | 1024  | dark  |
