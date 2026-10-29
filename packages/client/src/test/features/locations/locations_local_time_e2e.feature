Feature: Local time and date on location rows in a real browser
  Implements change show-local-time-and-date-on-location-cards.
  The time sits beside the city on narrow screens and in its own column on wide
  ones, fits every screen, is accessible in both themes and is not announced.

  @show-local-time-and-date-on-location-cards @NFR-R2 @UX1 @UX2 @FR1 @FR2
  Scenario: Time beside the city on a narrow screen
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is 375 px wide for the locations
    And the stored locations are "Almaty", "Moscow"
    When the user opens the locations app
    Then the time of "Almaty" reads "12:30" with the ISO date "2026-03-08"
    And the time of "Moscow" reads "10:30" with the ISO date "2026-03-08"
    And the time of "Almaty" is at the right end of its city line with the date right-aligned under it

  @show-local-time-and-date-on-location-cards @NFR-R2
  Scenario: Time in its own column on a wide screen
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is 1024 px wide for the locations
    And the stored locations are "Almaty", "Moscow"
    When the user opens the locations app
    Then the time of "Almaty" reads "12:30" with the ISO date "2026-03-08"
    And the time of "Moscow" reads "10:30" with the ISO date "2026-03-08"
    And the time of "Almaty" follows its place column in the left half of the card with the date left-aligned under it

  @show-local-time-and-date-on-location-cards @NFR-R1 @M5
  Scenario Outline: Times fit a <width> px wide screen
    Given the screen is <width> px wide for the locations
    And the stored locations are "Almaty", "Kathmandu", "New York", "Tokyo"
    When the user opens the locations app
    Then the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 2560  |

  @show-local-time-and-date-on-location-cards @NFR-A1 @M5
  Scenario Outline: No accessibility violations with times in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the stored locations are "Almaty", "Kathmandu", "New York", "Tokyo"
    When the user opens the locations app
    Then the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @show-local-time-and-date-on-location-cards @NFR-A2
  @match-here-mark-to-design @NFR-A1
  @set-home-location-and-show-differences @NFR-A3
  Scenario: Time does not change the row name
    Given the stored locations are "Almaty", "Moscow"
    When the user opens the locations app
    Then the row of "Almaty" is named "Almaty You are here"
    And the row of "Moscow" is named "Moscow 2 hours behind"
    And the time of "Almaty" is not inside a live region
