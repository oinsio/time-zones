Feature: Grid view in a real browser
  Implements change add-view-mode-setting-and-grid-skeleton.
  The Grid view fits every screen, keeps the row header in one line on a wide screen, uses the theme tokens and works offline.

  @add-view-mode-setting-and-grid-skeleton @NFR-R1
  Scenario Outline: Grid fits a <width> px wide screen
    Given the view mode is Grid
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 2560  |

  @add-view-mode-setting-and-grid-skeleton @FR7 @UX3
  Scenario: Grid row header in one line
    Given the view mode is Grid
    And the stored locations are "Almaty", "Moscow"
    And the screen is 1024 px wide for the locations
    When the user opens the locations app
    Then the zone line of "Almaty" is on the same line as its city
    And the date of "Almaty" is on the same line as its time and before it

  @add-view-mode-setting-and-grid-skeleton @UX3
  Scenario Outline: Grid rows use the <theme> theme token colours
    Given the view mode is Grid
    And the stored locations are "Almaty", "Moscow"
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    Then every Grid row has the surface colour of the <theme> theme
    And the Grid panel has the border colour of the <theme> theme

    Examples:
      | theme |
      | light |
      | dark  |

  @add-view-mode-setting-and-grid-skeleton @FR7
  Scenario: Grid works offline
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the service worker controls the locations app
    When the user reopens the locations app without network
    Then the Grid view shows the rows of "Almaty" and "Moscow"
    And the card of "Almaty" shows the time "12:30"
    And no note or alert about the network is shown
    When the user removes "Moscow"
    Then the Grid view shows only the row of "Almaty"

  @add-view-mode-setting-and-grid-skeleton @UX3
  Scenario Outline: Approved screenshots of Grid at <width> px in the <theme> theme
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the locations screen matches the approved screenshot

    Examples:
      | width | theme |
      | 1024  | light |
      | 1024  | dark  |
