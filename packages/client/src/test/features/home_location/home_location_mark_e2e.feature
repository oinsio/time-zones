Feature: Home mark in a real browser
  Implements change match-home-mark-to-design.
  The house before the home city is drawn as the design draws it: an outline in
  the accent colour, in the light and the dark theme.

  @match-home-mark-to-design @FR1 @FR3 @UX1 @UX2 @M2
  Scenario Outline: The house is outlined in the accent colour in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the list holds "Almaty", "Moscow" and home is "Almaty"
    And the user opens the locations app
    Then the house of "Almaty" has no fill and an outline in the accent colour
    And the house of "Almaty" is 18 px wide and tall

    Examples:
      | theme |
      | light |
      | dark  |
