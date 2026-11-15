Feature: Day colouring in a real browser
  Implements change add-day-colouring-setting.
  The accent and the non-working grey are what the user sees, readably, in both themes.

  @add-day-colouring-setting @FR11 @FR12
  Scenario Outline: Accent and grey in a real browser in the <theme> theme
    Given the view mode is Grid
    And the day colouring is "Working hours"
    And the current time is "2026-03-09T06:00:00Z"
    And the stored locations are "Almaty"
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    Then the cell of "Almaty" in column 10 has the <theme> accent colour and the cell in column 8 the <theme> non-working grey

    Examples:
      | theme |
      | light |
      | dark  |

  @add-day-colouring-setting @FR9 @FR12
  Scenario Outline: One-colour tracks are drawn in a real browser in the <theme> theme with <colouring>
    Given the day colouring is "<colouring>"
    And the current time is "2026-03-14T09:00:00Z"
    And the stored locations are "Moscow"
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    Then the track of "Moscow" is a gradient with the <theme> <colour> at its left end and at its right end

    Examples:
      | theme | colouring     | colour           |
      | light | Plain         | accent colour    |
      | dark  | Plain         | accent colour    |
      | light | Working hours | non-working grey |
      | dark  | Working hours | non-working grey |

  @add-day-colouring-setting @NFR-A3 @NFR-A4
  Scenario Outline: No violations in the <view> view, the <colouring> colouring and the <theme> theme
    Given the view mode is <view>
    And the day colouring is "<colouring>"
    And the current time is "2026-03-09T06:00:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    Then the locations screen has no accessibility violations

    Examples:
      | view  | colouring     | theme |
      | Cards | Plain         | light |
      | Cards | Plain         | dark  |
      | Cards | Working hours | light |
      | Cards | Working hours | dark  |
      | Grid  | Plain         | light |
      | Grid  | Plain         | dark  |
      | Grid  | Working hours | light |
      | Grid  | Working hours | dark  |

  @add-day-colouring-setting @NFR-R2 @UX4
  Scenario Outline: Screenshot of <view> at <width> px in the <colouring> colouring and the <theme> theme
    Given the view mode is <view>
    And the day colouring is "<colouring>"
    And the current time is "2026-03-09T06:00:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the locations screen matches the approved screenshot

    Examples:
      | view  | width | colouring     | theme |
      | Grid  | 1280  | Plain         | light |
      | Grid  | 1280  | Plain         | dark  |
      | Grid  | 1280  | Working hours | light |
      | Grid  | 1280  | Working hours | dark  |
      | Cards | 375   | Plain         | light |
      | Cards | 375   | Plain         | dark  |
      | Cards | 375   | Working hours | light |
      | Cards | 375   | Working hours | dark  |
