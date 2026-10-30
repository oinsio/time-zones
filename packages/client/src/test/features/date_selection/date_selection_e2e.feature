Feature: Date selection in a real browser
  Implements change select-date-with-calendar-and-now.
  The date bar and the calendar work with the keyboard, are named and announced,
  pass axe-core, fit every screen and look as approved.

  @select-date-with-calendar-and-now @NFR-A2
  @keep-now-button-visible-when-live @NFR-A2
  Scenario: Tab order of the bar
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    And the user moved to the next day with the bar
    When the user moves the focus to the previous-day button and presses Tab 3 times
    Then the focus visits the date button, the next-day button and Now, in that order

  @select-date-with-calendar-and-now @NFR-A2
  Scenario: Space activates the bar and the calendar
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    When the user focuses the next-day button and presses Space
    Then the bar shows the date "2026-03-09"
    When the user focuses the previous-day button and presses Space
    Then the bar shows the date "2026-03-08"
    When the user opens the calendar with Space, presses ArrowRight and presses Space
    Then the calendar is closed
    And the bar shows the date "2026-03-09"

  @select-date-with-calendar-and-now @NFR-A2
  Scenario: Next day and Now with the keyboard
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    When the user tabs to the next-day button and presses Enter
    Then the bar shows the date "2026-03-09"
    When the user tabs to Now and presses Enter
    Then the bar shows the date "2026-03-08"
    And the focus is on the date button

  @select-date-with-calendar-and-now @NFR-A2
  Scenario: Pick a date with the keyboard
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    When the user opens the calendar with Enter
    Then the focus is on the day "Sunday, March 8, 2026"
    When the user presses ArrowDown, ArrowRight and Enter
    Then the calendar is closed
    And the bar shows the date "2026-03-16"
    And the focus is on the date button

  @select-date-with-calendar-and-now @NFR-A2
  Scenario: Focus crosses into the next month
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    And the calendar is open on the day "Tuesday, March 31, 2026"
    When the user presses ArrowRight
    Then the calendar shows "April 2026"
    And the focus is on the day "Wednesday, April 1, 2026"

  @select-date-with-calendar-and-now @NFR-A2
  Scenario: Page keys and week ends
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    And the calendar is open on the day "Sunday, March 8, 2026"
    When the user presses PageDown, then End
    Then the focus is on the day "Saturday, April 11, 2026"

  @select-date-with-calendar-and-now @NFR-A2
  Scenario: Esc closes without change
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    And the calendar is open on the day "Sunday, March 8, 2026"
    When the user presses ArrowRight and then Escape
    Then the calendar is closed
    And the bar is live
    And the focus is on the date button

  @select-date-with-calendar-and-now @NFR-A3
  Scenario: Names and marks
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    When the user opens the calendar with the mouse
    Then the date button was named "Choose date, Sunday, March 8, 2026"
    And the day "Sunday, March 8, 2026" is marked as today
    And the grid cell holding the day "Sunday, March 8, 2026" is marked as selected

  @select-date-with-calendar-and-now @NFR-A3
  Scenario: Date change is announced
    Given the current time is "2026-03-08T07:30:00Z"
    And the user opens the locations app
    When the user moves to the next day with the bar
    Then "Monday, March 9, 2026" is announced politely once

  @select-date-with-calendar-and-now @NFR-A1 @M7
  @keep-now-button-visible-when-live @NFR-A1 @M4
  Scenario Outline: No accessibility violations in the <bar state> state in the <theme> theme
    Given the current time is "2026-03-08T07:30:00Z"
    And the locations screen uses the <theme> theme
    And the user opens the locations app
    When the date bar is put in the <bar state> state
    Then the locations screen has no accessibility violations

    Examples:
      | bar state              | theme |
      | live                   | light |
      | live                   | dark  |
      | pinned                 | light |
      | pinned                 | dark  |
      | calendar open           | light |
      | calendar open           | dark  |

  @select-date-with-calendar-and-now @FR7
  Scenario Outline: The visible date text at <width> px is the <label> one
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the visible date text is the <label> one reading "<text>"

    Examples:
      | width | label | text            |
      | 375   | short | Sun, March 8    |
      | 1024  | long  | Sunday, March 8 |
