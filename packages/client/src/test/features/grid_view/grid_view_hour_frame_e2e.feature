Feature: Hour frame and hour strip keys of the Grid view in a real browser
  Implements change add-grid-hour-cells-and-hour-frame.
  The hour frame crosses every row behind the texts, and the hour strip works from the keyboard.

  @add-grid-hour-cells-and-hour-frame @FR8 @UX2
  Scenario Outline: Frame crosses every row in the <theme> theme
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the locations screen uses the <theme> theme
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    Then one hour frame in the <theme> accent colour reaches from the first row to the last
    And its left and right edges enclose column 12 of every row

    Examples:
      | theme |
      | light |
      | dark  |

  @add-grid-hour-cells-and-hour-frame @FR10
  Scenario: Notes and header texts cover the frame
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "New York"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    Then where the hour frame crosses the clock change note of "New York", the topmost element is the note
    And where the frame's border crosses a header text of "Almaty", the topmost element is that text

  @add-grid-hour-cells-and-hour-frame @FR12
  Scenario: Page Up on Moscow's strip
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    When the user opens the locations app
    And the user moves the time of "Moscow" one hour forward
    Then the card of "Almaty" shows the time "13:30"
    And the card of "Moscow" shows the time "11:30"
    And the hour frame is on column 13

  @add-grid-hour-cells-and-hour-frame @FR12 @NFR-A1
  Scenario: Slider name and value of a strip
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    When the user opens the locations app
    Then the slider "Time in Almaty" has the value 750 within 0 to 1439 and the value text "12:30, Sun, Mar 8"

  @add-grid-hour-cells-and-hour-frame @NFR-A1 @NFR-A2
  Scenario: Tab order and focus ring
    Given the view mode is Grid
    And the stored locations are "Almaty", "Moscow"
    When the user opens the locations app
    And the user tabs from the location menu button of "Almaty"
    Then the hour strip of "Almaty" has focus with a focus ring in the accent colour
    When the user presses Tab
    Then focus is in the row of "Moscow"

  @add-grid-hour-cells-and-hour-frame @NFR-A1
  Scenario Outline: No accessibility violations with hour cells in the <theme> theme
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    Then the locations screen has no accessibility violations
    When the user moves the time of "Moscow" one hour forward
    Then the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |
