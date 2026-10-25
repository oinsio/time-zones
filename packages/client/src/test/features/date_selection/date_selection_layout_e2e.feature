Feature: Date bar layout in a real browser
  Implements change select-date-with-calendar-and-now.
  The bar stays at the bottom, fits every screen and looks as approved.

  @select-date-with-calendar-and-now @NFR-R2
  Scenario: Bar on a narrow screen
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is 375 px wide for the locations
    And the user opens the locations app
    When the user moved to the next day with the bar
    Then the arrows and the date are at the left of the bar and Now is at the right
    And the bar touches the bottom of the viewport

  @select-date-with-calendar-and-now @NFR-R2
  Scenario: Bar on a wide screen
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is 1024 px wide for the locations
    And the user opens the locations app
    When the user moved to the next day with the bar
    Then the arrows, the date and Now form one group centred in the bar

  @select-date-with-calendar-and-now @NFR-R2
  Scenario: Last card above the bar
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is 375 px wide for the locations
    And the list has 12 locations
    And the user opens the locations app
    When the user scrolls to the end
    Then the last card is fully above the bar

  @select-date-with-calendar-and-now @NFR-R2
  Scenario Outline: Calendar on a <width> px screen
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the user opens the calendar with the mouse
    Then the calendar is laid out as <layout>

    Examples:
      | width | layout                                                |
      | 375   | full screen                                           |
      | 639   | full screen                                           |
      | 640   | a dialog centred in the viewport and narrower than it |
      | 1024  | a dialog centred in the viewport and narrower than it |

  @select-date-with-calendar-and-now @UX2
  Scenario Outline: Bar controls look as approved in the <theme> theme
    Given the current time is "2026-03-08T07:30:00Z"
    And the locations screen uses the <theme> theme
    And the user opens the locations app
    When the user moved to the next day with the bar
    Then Now shows a clock icon and the label "Now" in the accent colours
    And the previous-day and next-day buttons show an icon and no visible text

    Examples:
      | theme |
      | light |
      | dark  |

  @select-date-with-calendar-and-now @UX3
  Scenario Outline: The date is the most prominent text of the bar in the <theme> theme at <width> px
    Given the current time is "2026-03-08T07:30:00Z"
    And the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the user moved to the next day with the bar
    Then no other text in the bar is larger or heavier than the shown date
    And the shown date uses the main foreground colour

    Examples:
      | theme | width |
      | light | 375   |
      | dark  | 375   |
      | light | 1024  |
      | dark  | 1024  |

  @select-date-with-calendar-and-now @UX1
  Scenario: Touch targets
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is 375 px wide for the locations
    And the user opens the locations app
    When the user moved to the next day with the bar
    Then each bar control is at least 44 by 44 px
    When the user opens the calendar with the mouse
    Then each calendar day is at least 44 by 44 px

  @select-date-with-calendar-and-now @NFR-R1 @UX1
  Scenario: Calendar days fit the narrowest screen
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is 320 px wide for the locations
    And the user opens the locations app
    When the user opens the calendar with the mouse
    Then each calendar day is at least 44 by 44 px
    And the calendar does not scroll horizontally

  @select-date-with-calendar-and-now @NFR-R1 @M7
  Scenario Outline: No horizontal scrolling at <width> px in the <bar state> state
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the date bar is put in the <bar state> state
    Then the locations screen does not scroll horizontally

    Examples:
      | width | bar state              |
      | 320   | live                   |
      | 320   | pinned                 |
      | 320   | calendar open           |
      | 2560  | live                   |
      | 2560  | pinned                 |
      | 2560  | calendar open           |
