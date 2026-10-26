Feature: Time selection in a real browser
  Implements change add-time-sliders-to-location-cards.
  As a user I drag, tap or key a day track, every card follows, and the tracks
  are named, focusable and free of accessibility violations.

  @add-time-sliders-to-location-cards @FR3 @NFR-R2
  Scenario: Dragging one track moves every card
    Given the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the user opens the locations app
    When the user drags the handle of "New York" to 75 percent of its track
    Then the time of "Almaty" reads "18:00" with the ISO date "2026-03-08"
    And the time of "Moscow" reads "16:00" with the ISO date "2026-03-08"
    And the time of "Kolkata" reads "18:30" with the ISO date "2026-03-08"
    And the time of "New York" reads "09:00" with the ISO date "2026-03-08"

  @add-time-sliders-to-location-cards @FR3 @NFR-R2
  Scenario: Drag without scrolling or reordering
    Given the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "New York"
    And the user opens the locations app
    When the user drags the handle of "Moscow" to 100 percent of its track
    Then the page has not scrolled
    And the locations list order is "Almaty", "Moscow", "New York"
    And the time of "Almaty" reads "23:45" with the ISO date "2026-03-08"

  @add-time-sliders-to-location-cards @FR4 @NFR-A2
  Scenario: Keyboard moves every card
    Given the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    When the user focuses the slider of "Almaty" and presses Tab until the slider of "Moscow" is focused
    And the user presses the key "PageUp"
    And the user presses the key "PageUp"
    And the user presses the key "ArrowRight"
    Then the time of "Almaty" reads "14:45" with the ISO date "2026-03-08"
    And the time of "Moscow" reads "12:45" with the ISO date "2026-03-08"
    And the page has not scrolled
    And the locations list order is "Almaty", "Moscow"

  @add-time-sliders-to-location-cards @FR4
  Scenario Outline: Keys from a pinned quarter hour
    Given the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    And the user opens the locations app
    When the user clicks 52 percent of the track of "Almaty"
    And the user presses the key "<key>"
    Then the slider of "Almaty" reads <value>

    Examples:
      | key        | value |
      | ArrowRight | 765   |
      | ArrowLeft  | 735   |
      | PageUp     | 810   |
      | PageDown   | 690   |
      | Home       | 0     |
      | End        | 1425  |

  @add-time-sliders-to-location-cards @NFR-A2
  Scenario: Visible focus
    Given the stored locations are "Almaty"
    And the user opens the locations app
    When the user focuses the slider of "Almaty" with the keyboard
    Then the handle of "Almaty" has an outline in the accent colour

  @add-time-sliders-to-location-cards @NFR-A3 @FR9
  Scenario: Slider name, range and value
    Given the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    And the user opens the locations app
    Then the slider "Time in Almaty" has the value 750 within 0 to 1425 and the value text "12:30, Sun, Mar 8"
    And the time of "Almaty" is not inside a live region

  @add-time-sliders-to-location-cards @NFR-A1 @M9
  Scenario Outline: No accessibility violations with tracks
    Given the current time is "2026-03-08T07:30:00Z"
    And the locations screen uses the <theme> theme
    And the user opens the locations app
    When the locations are in the <state> state
    Then the locations screen has no accessibility violations

    Examples:
      | state         | theme |
      | list          | light |
      | list          | dark  |
      | time-selected | light |
      | time-selected | dark  |
