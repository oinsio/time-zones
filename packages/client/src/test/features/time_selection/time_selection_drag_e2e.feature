Feature: Drag a day track in a real browser
  Implements change fix-day-track-drag-continuity-and-smoothness.
  As a user I drag a handle and it follows my pointer until I let go, wherever the pointer goes.

  @fix-day-track-drag-continuity-and-smoothness @FR1 @FR2 @FR4 @UX1 @UX3 @NFR-R1
  Scenario Outline: A drag continues when the pointer leaves the track
    Given the pointer is "<pointer>"
    And the current time is "2026-03-08T07:30:00Z"
    And the screen is 375 by 340 px for the locations
    And the stored locations are "New York", "Almaty", "Moscow", "Kolkata", "Tokyo"
    And the user opens the locations app
    And the page is taller than the screen
    When the user drags from 25 percent to 75 percent of the "New York" track, 120 px below it, and releases
    Then the card of "Almaty" shows the time "18:00"
    And the page has not scrolled

    Examples:
      | pointer                                    |
      | mouse                                      |
      | finger                                     |
      | finger on an engine without Pointer Events |

  @fix-day-track-drag-continuity-and-smoothness @FR1 @FR2
  Scenario: A drag past the right end pins the track end
    Given the pointer is "finger"
    And the current time is "2026-03-08T07:30:00Z"
    And the screen is 375 by 340 px for the locations
    And the stored locations are "Almaty", "Moscow", "Kolkata", "Tokyo", "New York"
    And the user opens the locations app
    And the page is taller than the screen
    When the user drags from 25 percent to 105 percent of the "Almaty" track, 60 px above it, and releases
    Then the card of "Almaty" shows the time "23:59"
    And the page has not scrolled

  @fix-day-track-drag-continuity-and-smoothness @FR2 @FR4 @FR5
  Scenario: A vertical swipe without Pointer Events still scrolls
    Given the engine has no Pointer Events
    And the current time is "2026-03-08T07:30:00Z"
    And the screen is 375 by 340 px for the locations
    And the stored locations are "Almaty", "Moscow", "Kolkata", "Tokyo", "New York"
    And the user opens the locations app
    And the page is taller than the screen
    When the user swipes up from the "Almaty" track with a finger
    Then the page has scrolled down
    And the Now button is not shown

  @fix-day-track-drag-continuity-and-smoothness @FR3 @UX2 @NFR-R1
  Scenario Outline: The dragged handle stays under the pointer
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is <width> px wide for the locations
    And the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    When the user holds the mouse on the "Almaty" track at 51.2 percent
    Then the handle of "Almaty" is under the pointer
    When the user holds the mouse on the "Almaty" track at 30.1 percent
    Then the handle of "Almaty" is under the pointer
    When the user holds the mouse on the "Almaty" track at 80.3 percent
    Then the handle of "Almaty" is under the pointer
    When the user releases the mouse
    Then the handle of "Almaty" is on the selected step of its track

    Examples:
      | width |
      | 375   |
      | 1024  |

  @fix-day-track-drag-continuity-and-smoothness @NFR-A1
  Scenario Outline: The slider reports the selected step after a drag
    Given the locations screen uses the <theme> theme
    And the current time is "2026-03-08T07:30:00Z"
    And the screen is 375 px wide for the locations
    And the stored locations are "Almaty", "New York"
    And the user opens the locations app
    When the user drags from 25 percent to 75 percent of the "New York" track, 0 px below it, and releases
    Then the slider of "New York" reports the value 1080 and the text "09:00, Sun, Mar 8"
    And the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |
