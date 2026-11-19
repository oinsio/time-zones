Feature: Earlier layout defects stay fixed in a real browser
  Implements change redesign-cards-grid-and-day-palettes.
  The redesigned cards keep out the five defects fixed earlier, one scenario each.

  @redesign-cards-grid-and-day-palettes @FR20
  Scenario Outline: The handle never covers the time or the menu button at <width> px at the <end>
    Given the stored locations are "Almaty", "Moscow"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    And the user focuses the slider of "Almaty" with the keyboard
    And the user presses the key "<key>"
    Then the handle of "Almaty" lies inside its card and clear of its time and its menu

    Examples:
      | width | end       | key  |
      | 320   | start     | Home |
      | 320   | track end | End  |
      | 390   | track end | End  |
      | 768   | start     | Home |
      | 768   | track end | End  |
      | 1440  | track end | End  |

  @redesign-cards-grid-and-day-palettes @FR21
  Scenario Outline: Tracks of equal width in the <format> format at <width> px
    Given the locations interface language is English
    And the stored preferences are theme System and hour format <format>
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Moscow", "New York", "Tokyo", "Kolkata"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the tracks of the cards are equally long

    Examples:
      | format  | width |
      | 12-hour | 390   |
      | 12-hour | 768   |
      | 12-hour | 1440  |
      | 24-hour | 820   |

  @redesign-cards-grid-and-day-palettes @FR22
  Scenario Outline: Hour labels on one line and apart in English at <width> px
    Given the locations interface language is English
    And the stored preferences are theme System and hour format 12-hour
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Moscow", "Kolkata", "Kathmandu"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the hour labels of "Moscow", "Kolkata", "Kathmandu" are on one line and end at the track's right edge
    And no two neighbouring hour labels of a track touch

    Examples:
      | width |
      | 768   |
      | 1024  |

  @redesign-cards-grid-and-day-palettes
  @FR22
  Scenario: Hour labels on one line and apart in Russian at 768 px
    Given the locations interface language is Russian
    And the stored preferences are theme System and hour format 12-hour
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Москва", "Калькутта", "Катманду"
    And the screen is 768 px wide for the locations
    When the user opens the locations app
    Then the hour labels of "Москва", "Калькутта", "Катманду" are on one line and end at the track's right edge
    And no two neighbouring hour labels of a track touch

  @redesign-cards-grid-and-day-palettes @FR23
  Scenario Outline: The handle has the fill of its own card in the <theme> theme with the <palette> palette at <width> px
    Given the day colouring is "Time of day"
    And the day palette is "<palette>"
    And the stored locations are "Almaty", "Moscow"
    And the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the visible handle of "Almaty" is filled with the fill of its card
    And the visible handle of "Moscow" is filled with the fill of its card

    Examples:
      | theme | palette | width |
      | light | Vivid   | 390   |
      | dark  | Vivid   | 390   |
      | light | Muted   | 1024  |
      | dark  | Muted   | 1024  |

  @redesign-cards-grid-and-day-palettes @FR24
  Scenario Outline: A hint does not reshape its card at <width> px
    Given the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "New York", "Moscow"
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    And the place, time, track and menu of "New York" are noted
    When the page shows a GAP hint
    Then the hint is the bottom line of the card of "New York"
    And the place, time, track and menu of "New York" have not moved

    Examples:
      | width |
      | 390   |
      | 1024  |
