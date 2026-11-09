Feature: Hour cells of the Grid view in a real browser
  Implements change add-grid-hour-cells-and-hour-frame.
  The hour cells of all rows stand in columns and take the colours of the active theme.

  @add-grid-hour-cells-and-hour-frame @FR1 @UX2
  Scenario: Cells in a real layout stand in columns
    Given the view mode is Grid
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    Then the cells of column 12 of all rows have the same left edge and the same width

  @add-grid-hour-cells-and-hour-frame @FR4 @FR5 @FR6 @UX1
  Scenario Outline: Theme colours of the cells in the <theme> theme
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    Then the cells of "Almaty" in columns 3, 7, 9 and 18 have the <theme> night, morning, working hours and evening colours
    And the midnight cell of "Moscow" in column 2 has the <theme> midnight shade
    And the offset edge of "New York" in column 12 is a line in the <theme> foreground colour
    And the digits of the working hours cell of "Almaty" in column 9 have the <theme> cell digit colour

    Examples:
      | theme |
      | light |
      | dark  |
