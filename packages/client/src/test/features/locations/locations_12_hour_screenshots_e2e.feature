Feature: Locations screenshots in the 12-hour format
  Implements change fix-location-card-and-header-layout.
  The cards keep their layout in the 12-hour format on narrow and wide screens.

  @fix-location-card-and-header-layout @NFR-R2
  @show-clock-change-note-on-location-cards @NFR-R2
  Scenario Outline: Screenshot of the <state> state at <width> px in the <theme> theme
    Given the current time is "2026-03-08T07:30:00Z"
    And the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the locations are in the <state> state
    Then the locations screen matches the approved screenshot

    Examples:
      | state   | width | theme |
      | 12-hour | 375   | light |
      | 12-hour | 375   | dark  |
      | 12-hour | 1024  | light |
      | 12-hour | 1024  | dark  |
