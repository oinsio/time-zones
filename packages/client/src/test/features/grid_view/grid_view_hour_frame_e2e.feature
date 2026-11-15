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

  @add-day-colouring-setting @FR13
  Scenario Outline: Frame in the foreground colour on accent cells in the <theme> theme with <colouring> at <instant>
    Given the view mode is Grid
    And the day colouring is "<colouring>"
    And the current time is "<instant>"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the locations screen uses the <theme> theme
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    Then one hour frame in the <theme> foreground colour reaches from the first row to the last
    And the frame encloses column <column> of every row

    Examples:
      | theme | colouring     | instant              | column |
      | light | Plain         | 2026-03-08T07:30:00Z | 12     |
      | dark  | Plain         | 2026-03-08T07:30:00Z | 12     |
      | light | Working hours | 2026-03-09T06:00:00Z | 11     |
      | dark  | Working hours | 2026-03-09T06:00:00Z | 11     |

  @add-day-colouring-setting @FR13
  Scenario: The frame stays visible on accent cells
    Given the view mode is Grid
    And the day colouring is "Time of day"
    And the current time is "2026-03-09T06:00:00Z"
    And the stored locations are "Almaty"
    And the locations screen uses the light theme
    When the user opens the locations app
    And the user opens the settings, chooses the option "Plain" and goes back
    Then the hour frame is on column 11 in the light foreground colour
    And the texts of column 11 are bold in the "Almaty" row
