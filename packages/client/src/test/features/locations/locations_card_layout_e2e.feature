Feature: Location card layout in a real browser
  Implements change redesign-cards-grid-and-day-palettes.
  A card has two lines from 768 px, a narrow layout below it, grows instead of cutting text, and marks home and Here with outline icons.

  @redesign-cards-grid-and-day-palettes @FR7 @UX1
  Scenario Outline: Card sizes on a phone at <width> px
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then each card has a 14 px radius and a 1 px border in the card border colour
    And the city is <city> px, the time <time> px and the zone line and the date <meta> px
    And neighbouring cards are 12 px apart

    Examples:
      | width | city | time | meta |
      | 320   | 21   | 24   | 13   |
      | 390   | 24   | 26   | 14   |
      | 411   | 26   | 28   | 15   |

  @redesign-cards-grid-and-day-palettes @FR7
  Scenario: Lines of a narrow card
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 390 px wide for the locations
    When the user opens the locations app
    Then the city, time and menu button of "Moscow" are on one line, the button right of the time
    And the zone line and the date of "Moscow" are on the next line, the date at the right edge
    And the day track of "Moscow" is under that line

  @redesign-cards-grid-and-day-palettes @FR11 @NFR-R1
  Scenario Outline: Two lines from 768 px at <width> px
    Given the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the city, zone line, date, time and menu button of "Moscow" are on one line
    And the day track of "Moscow" is under that line and spans the content width of the card

    Examples:
      | width |
      | 768   |
      | 820   |
      | 1024  |
      | 1440  |
      | 2560  |

  @redesign-cards-grid-and-day-palettes @FR8 @NFR-R1
  Scenario: A long city wraps and the time drops
    Given the locations interface language is Russian
    And the day colouring is "Time of day" and the hour format is "H12"
    And the stored locations are "Петропавловск-Камчатский"
    And the screen is 320 px wide for the locations
    When the user opens the locations app
    Then the city "Петропавловск-Камчатский" is shown whole without an ellipsis
    And the time and the menu button are on a line of their own at the right edge of the card
    And the locations screen does not scroll horizontally

  @redesign-cards-grid-and-day-palettes @FR8
  Scenario Outline: Small day period marker at <width> px
    Given the locations interface language is English
    And the day colouring is "Time of day" and the hour format is "H12"
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the time of "Almaty" reads "12:30 PM" with a marker of 14 px and weight 700, 4 px after the digits

    Examples:
      | width |
      | 390   |
      | 820   |

  @redesign-cards-grid-and-day-palettes @FR8
  Scenario: Difference look in a card
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 390 px wide for the locations
    When the user opens the locations app
    Then the difference of "Moscow" is 16 px, weight 600, in the muted foreground colour

  @redesign-cards-grid-and-day-palettes @FR7 @NFR-R1
  Scenario Outline: One time column width in the 12-hour format at <width> px
    Given the locations interface language is English
    And the day colouring is "Time of day" and the hour format is "H12"
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Moscow", "New York", "Tokyo", "Kolkata"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the cards show "10:30 AM", "3:30 AM", "4:30 PM" and "1:00 PM"
    And the right edges of the four menu buttons line up

    Examples:
      | width |
      | 390   |
      | 768   |
      | 1024  |
      | 1440  |

  @redesign-cards-grid-and-day-palettes @FR10 @UX1
  Scenario Outline: Home house outlined in the accent colour in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the stored locations "Almaty", "Moscow" have home "Almaty"
    And the screen is 390 px wide for the locations
    When the user opens the locations app
    Then the house of "Almaty" has no fill, the <theme> accent outline and is 23 by 23 px

    Examples:
      | theme |
      | light |
      | dark  |

  @redesign-cards-grid-and-day-palettes @FR10
  Scenario: Icon before the city, caption after it
    Given the stored locations are "Almaty", "Moscow"
    And the screen is 390 px wide for the locations
    When the user opens the locations app
    Then the map pin of "Almaty" is 23 by 23 px, before its city and no row shows the text "here"
