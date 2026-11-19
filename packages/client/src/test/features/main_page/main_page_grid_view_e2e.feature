Feature: Grid view in a real browser
  Implements change add-view-mode-setting-and-grid-skeleton and add-grid-hour-cells-and-hour-frame.
  Implements change redesign-cards-grid-and-day-palettes.
  The Grid view fits every screen, keeps the row header in one line on a wide screen, uses the theme tokens and works offline.

  @add-view-mode-setting-and-grid-skeleton @NFR-R1
  @redesign-cards-grid-and-day-palettes @NFR-R1 @FR17
  Scenario Outline: Grid fits a <width> px wide screen in the <format> format
    Given the view mode is Grid
    And the day colouring is "Time of day" and the hour format is "<format>"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the locations screen does not scroll horizontally

    Examples:
      | width | format |
      | 320   | H24    |
      | 390   | H12    |
      | 768   | H24    |
      | 820   | H12    |
      | 1024  | H24    |
      | 1440  | H12    |
      | 2560  | H24    |

  @redesign-cards-grid-and-day-palettes @FR15 @FR17
  @add-view-mode-setting-and-grid-skeleton @FR7 @UX3
  Scenario: Grid row header in one line
    Given the view mode is Grid
    And the stored locations are "Almaty", "Moscow"
    And the screen is 1024 px wide for the locations
    When the user opens the locations app
    Then the zone line of "Almaty" is on the same line as its city
    And the date of "Almaty" is on the same line as its time and before it
    And the city of "Almaty" is 22 px and its time 26 px, both weight 700

  @redesign-cards-grid-and-day-palettes @FR17 @UX3
  @add-view-mode-setting-and-grid-skeleton @UX3
  Scenario Outline: Grid rows use the <theme> theme token colours
    Given the view mode is Grid
    And the stored locations are "Almaty", "Moscow"
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    Then every Grid row has the surface colour of the <theme> theme
    And the Grid panel has the border colour of the <theme> theme
    And the Grid panel has a radius of 14 px
    And the divider between the Grid rows has the <theme> card border colour

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

  @add-grid-hour-cells-and-hour-frame @FR7
  Scenario: Row notes after the hour strip
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "New York"
    When the user opens the locations app
    Then the clock change note of "New York" comes after its hour strip, in the document and on the screen

  @add-grid-hour-cells-and-hour-frame @NFR-R3
  @redesign-cards-grid-and-day-palettes @FR15 @FR17
  Scenario: Grid row header in two lines on a phone
    Given the view mode is Grid
    And the stored locations are "Almaty", "Moscow"
    And the screen is 390 px wide for the locations
    When the user opens the locations app
    Then the time of "Almaty" is on the line of its city, right of it
    And the date of "Almaty" is on the line of its zone line, under its time
    And the city of "Almaty" is 20 px and its time 24 px

  @add-grid-hour-cells-and-hour-frame @FR1
  Scenario Outline: The location menu of <city> is fully visible at <width> by <height> px
    Given the view mode is Grid
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> by <height> px for the locations
    And the user opens the locations app
    When the user opens the location menu of "<city>"
    Then the whole menu lies inside the viewport
    And at the centre of every menu item the topmost element is that item

    Examples:
      | width | height | city     |
      | 1440  | 900    | Almaty   |
      | 1440  | 900    | New York |
      | 390   | 844    | New York |

  @add-grid-hour-cells-and-hour-frame @NFR-R4 @UX1
  Scenario Outline: Approved screenshots of Grid at <width> by <height> px in the <theme> theme
    Given the view mode is Grid
    And the locations interface language is Russian
    And the current time is "2026-03-08T07:30:00Z"
    And the list holds "Almaty", "Moscow", "Kolkata", "New York" and home is "Almaty"
    And the locations screen uses the <theme> theme
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    Then the locations screen matches the approved screenshot

    Examples:
      | width | height | theme |
      | 1440  | 900    | light |
      | 1440  | 900    | dark  |
      | 1180  | 820    | light |
      | 1180  | 820    | dark  |
      | 844   | 390    | light |
      | 844   | 390    | dark  |
      | 390   | 844    | light |
      | 390   | 844    | dark  |

  @add-view-mode-setting-and-grid-skeleton @FR7 @NFR-A2
  Scenario: Move a Grid row down from the menu
    Given the view mode is Grid
    And the stored locations are "Moscow", "Almaty", "New York"
    And the user opens the locations app
    When the user moves "Moscow" down 2 times with its location menu
    Then the locations list order is "Almaty", "New York", "Moscow"
    And focus is on the location menu button of "Moscow"
