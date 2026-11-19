Feature: Day palette in a real browser
  Implements change redesign-cards-grid-and-day-palettes.
  The day palette recolours the tracks of Cards and the hour cells of Grid in the Time of day colouring only.

  @redesign-cards-grid-and-day-palettes @FR4
  Scenario Outline: Palette colours in a real browser in the <theme> theme with the <palette> palette in <view>
    Given the view mode is <view>
    And the day colouring is "Time of day"
    And the day palette is "<palette>"
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    Then the night colour used by "Almaty" is "<night>"

    Examples:
      | theme | palette | view  | night   |
      | light | Vivid   | Cards | #a4afd4 |
      | light | Muted   | Cards | #a3afd3 |
      | dark  | Vivid   | Grid  | #4c5efa |
      | dark  | Muted   | Grid  | #56679a |

  @redesign-cards-grid-and-day-palettes @FR4
  Scenario Outline: Other colourings ignore the palette with <colouring>
    Given the day colouring is "<colouring>"
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    And the user opens the locations app
    When the user switches the day palette from Vivid to Muted
    Then the colours of the tracks have not changed

    Examples:
      | colouring     |
      | Plain         |
      | Working hours |

  @redesign-cards-grid-and-day-palettes @FR4
  Scenario: Changing the palette keeps the moment
    Given the day colouring is "Time of day"
    And the current time is "2026-03-09T06:00:00Z"
    And the stored locations are "Almaty"
    And the user opens the locations app
    When the user drags the handle of "Almaty" to 75 percent of its track
    And the user opens the settings, chooses the option "Muted" and goes back
    Then the time of "Almaty" reads "18:00" with the ISO date "2026-03-09"

  @redesign-cards-grid-and-day-palettes @FR17
  Scenario Outline: Theme colours of the cells in the <theme> theme with the <palette> palette
    Given the view mode is Grid
    And the day colouring is "Time of day"
    And the day palette is "<palette>"
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    Then column 3 of "Almaty" has the night colour, column 6 the morning, column 9 the daylight and column 17 the evening colour of the <theme> theme and the <palette> palette

    Examples:
      | theme | palette |
      | light | Vivid   |
      | light | Muted   |
      | dark  | Vivid   |
      | dark  | Muted   |

  @redesign-cards-grid-and-day-palettes @FR4
  Scenario Outline: Night digits in the dark theme with the <palette> palette
    Given the view mode is Grid
    And the day colouring is "Time of day"
    And the day palette is "<palette>"
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    And the locations screen uses the dark theme
    When the user opens the locations app
    Then the digits of the night cells of "Almaty" are "#f7f8fc" and those of its day cells "#0b1628"

    Examples:
      | palette |
      | Vivid   |
      | Muted   |
