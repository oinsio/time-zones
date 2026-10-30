Feature: Day track layout in a real browser
  Implements change add-time-sliders-to-location-cards.
  As a user I see the track under the text on a phone and beside the time on a
  wide screen, coloured by the theme, with the handle at the right place.

  @add-time-sliders-to-location-cards @NFR-R2 @UX1 @M9
  Scenario: Track under the text on a narrow screen
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 375 px wide for the locations
    When the user opens the locations app
    Then the track of "Almaty" is below its city and time and spans the card's content width
    And the track of "Almaty" is 10 px high and its visible handle 28 px wide

  @add-time-sliders-to-location-cards @NFR-R2 @UX1 @UX3 @M9
  Scenario: Track beside the time on a wide screen
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 1024 px wide for the locations
    When the user opens the locations app
    Then the track of "Almaty" is right of its time column on the same line with its hour labels under it
    And the track of "Almaty" is 12 px high and its visible handle 32 px wide
    And the hour labels of "Almaty" are muted text with tabular figures

  @add-time-sliders-to-location-cards @FR7 @NFR-R2
  Scenario: Labels only on wide screens
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 375 px wide for the locations
    When the user opens the locations app
    Then no hour label is visible
    When the screen becomes 1024 px wide
    Then every track shows 5 hour labels under its bar

  @add-time-sliders-to-location-cards @UX2 @M9
  Scenario Outline: Handle centre matches the instant at <width> px
    Given the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the centre of the handle of "Almaty" is at 0.520833 of its track within 1 px

    Examples:
      | width |
      | 375   |
      | 1024  |

  @add-time-sliders-to-location-cards @UX1 @NFR-R2
  Scenario Outline: Touch targets at <width> px
    Given the stored locations are "Almaty", "Moscow"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then every slider is at least 44 px high and every handle at least 44 by 44 px

    Examples:
      | width |
      | 320   |
      | 1024  |

  @add-time-sliders-to-location-cards @NFR-R1 @M9
  Scenario Outline: Tracks fit a <width> px wide screen
    Given the stored locations are "Almaty", "Kathmandu", "New York", "Tokyo"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 2560  |

    @fix-day-track-handle-overlap-and-end-of-day @NFR-R1
    Examples:
      | width |
      | 768   |

  @add-time-sliders-to-location-cards @FR6
  Scenario Outline: Colours come from the <theme> theme tokens
    Given the stored locations are "Almaty"
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    Then the colours of the track of "Almaty" are the day-period token colours

    Examples:
      | theme |
      | light |
      | dark  |

  @add-time-sliders-to-location-cards @UX1
  Scenario: The visible handle follows the surface and foreground tokens
    Given the stored locations are "Almaty"
    When the user opens the locations app
    Then the visible handle of "Almaty" is filled with the surface colour and outlined with the foreground colour

  @fix-day-track-handle-overlap-and-end-of-day @FR4 @UX1
  Scenario Outline: The handle stays clear of the time and the menu at <width> px with <key>
    Given the stored locations are "Almaty", "Moscow"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    And the user focuses the slider of "Almaty" with the keyboard
    And the user presses the key "<key>"
    Then the handle of "Almaty" lies inside its slider and clear of its time and its menu

    Examples:
      | width | key  |
      | 768   | Home |
      | 768   | End  |
      | 1024  | Home |
      | 1024  | End  |
