Feature: Location menu button as vertical dots in a real browser
  Implements change make-location-menu-button-vertical.
  The location menu button of a card and of a Grid row shows three vertical dots, takes little room next to the time and keeps its hit area.

  @make-location-menu-button-vertical @FR1 @NFR-A1 @UX2
  Scenario Outline: Vertical dots on the button in <view>
    Given the view mode is <view>
    And the stored locations are "Almaty", "Moscow"
    And the screen is 1440 px wide for the locations
    When the user opens the locations app
    Then each location menu button shows three dots one above the other and no text
    And the dots of "Almaty" and "Moscow" are vertically centred on the time

    Examples:
      | view  |
      | Cards |
      | Grid  |

  @make-location-menu-button-vertical @FR2 @FR3 @NFR-R1
  Scenario Outline: Compact button in Cards at <width> px
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then in every row the time is at most 32 px from the right content edge
    And every location menu button is at least 44 px square and inside its row
    And no location menu button overlaps the time, the date, the city, the offset difference or the zone line

    Examples:
      | width |
      | 320   |
      | 390   |
      | 411   |
      | 768   |
      | 1024  |
      | 1440  |

  @make-location-menu-button-vertical @FR2 @FR3 @NFR-R1
  Scenario Outline: Compact button in Grid at <width> px
    Given the view mode is Grid
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then in every row the time is at most 32 px from the right content edge
    And every location menu button is at least 44 px square and inside its row
    And no location menu button overlaps the time, the date, the city, the offset difference or the zone line

    Examples:
      | width |
      | 390   |
      | 844   |
      | 1180  |
      | 1440  |

  @make-location-menu-button-vertical @FR2 @FR3
  Scenario: Compact button next to a meeting time
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the screen is 390 px wide for the locations
    When the user opens the locations app
    And the user sets the meeting range 09:00–11:00 in Almaty
    Then in every row the meeting time is at most 32 px from the right content edge
    And no location menu button overlaps the time, the date, the city, the offset difference or the zone line

  @make-location-menu-button-vertical @UX1 @NFR-R1
  Scenario Outline: Even spacing around the dots in <view> at <width> px
    Given the view mode is <view>
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then in every row the dots are about as far from the time as from the right border

    Examples:
      | view  | width |
      | Cards | 320   |
      | Cards | 390   |
      | Cards | 411   |
      | Cards | 768   |
      | Cards | 1024  |
      | Cards | 1440  |
      | Grid  | 390   |
      | Grid  | 844   |
      | Grid  | 1180  |
      | Grid  | 1440  |

  @make-location-menu-button-vertical @FR3 @NFR-R1
  Scenario: Long city at 320 px
    Given the locations interface language is Russian
    And the stored locations are "Петропавловск-Камчатский"
    And the screen is 320 px wide for the locations
    When the user opens the locations app
    Then the time and the location menu button are on a line of their own at the right edge
    And no location menu button overlaps the time, the date, the city, the offset difference or the zone line
    And every location menu button is at least 44 px square and inside its row

  @make-location-menu-button-vertical @FR3
  Scenario Outline: Open menu inside the screen in <view> at <width> px
    Given the view mode is <view>
    And the stored locations are "Almaty", "Moscow"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    And the user opens the location menu of "Moscow"
    Then the open menu lies inside the screen

    Examples:
      | view  | width |
      | Cards | 320   |
      | Grid  | 390   |

  @make-location-menu-button-vertical @NFR-A1
  Scenario Outline: No accessibility violations with the vertical dots in <view>
    Given the view mode is <view>
    And the stored locations are "Almaty", "Moscow"
    And the screen is 390 px wide for the locations
    When the user opens the locations app
    Then the locations screen has no accessibility violations

    Examples:
      | view  |
      | Cards |
      | Grid  |
