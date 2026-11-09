Feature: Hour strip width of the Grid view in a real browser
  Implements change add-grid-hour-cells-and-hour-frame.
  All hours fit where each cell is at least 32 px wide; on a narrow screen the strips scroll together.

  @add-grid-hour-cells-and-hour-frame @NFR-R1
  Scenario Outline: All hours fit at <width> by <height> px
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    Then all 24 cells of every row are inside the panel and the strips do not scroll

    Examples:
      | width | height |
      | 1440  | 900    |
      | 1180  | 820    |
      | 844   | 390    |

  @add-grid-hour-cells-and-hour-frame @NFR-R2 @UX3
  Scenario: Phone in portrait scrolls all strips together
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    Then every cell is 36 to 40 px wide and 8 to 10 cells of each row are visible
    And the hour frame is fully visible
    And the locations screen does not scroll horizontally
    When the user scrolls the strip of "Moscow" to its end
    Then all four strips show their last cell and the city of "Almaty" stays at its place

  @add-grid-hour-cells-and-hour-frame @NFR-R2
  Scenario: Frame moved out of view is scrolled into view
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user focuses the hour strip of "Almaty" and presses End
    Then the hour frame is on column 23
    And the hour frame is fully visible
