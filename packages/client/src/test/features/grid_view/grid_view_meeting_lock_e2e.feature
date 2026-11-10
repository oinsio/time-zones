Feature: Locked row controls and the meeting range input in a real browser
  Implements change fix-grid-meeting-range-lock-and-layering.
  While a meeting range is set the drag handles, the location menus and the wall-time inputs are locked, the keyboard alone can type the meeting, and the input is accessible and fits a phone.

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @NFR-A2
  Scenario: Tab order skips the locked controls
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user tabs through the panel from the meeting bar
    Then the focus visited, in this order:
      | Share meeting                               |
      | Clear meeting                               |
      | Enter meeting time — Almaty, 09:00–11:00    |
      | Time in Almaty                              |
      | Enter meeting time — Moscow, 07:00–09:00    |
      | Time in Moscow                              |
      | Meeting start                               |
      | Meeting end                                 |
    When the user clears the meeting
    And the user tabs through the page
    Then the Tab stops include "Move Almaty", "Actions for Almaty", "Move Moscow" and "Actions for Moscow"

  @fix-grid-meeting-range-lock-and-layering @FR3 @NFR-A2
  Scenario: The open input's fields sit in place of the span in the Tab order
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Almaty"
    And the user presses Tab 3 times and notes the focus each time
    Then the focus visited, in this order:
      | End time — Almaty                        |
      | Time in Almaty                           |
      | Enter meeting time — Moscow, 07:00–09:00 |
    And the meeting range input of "Almaty" is closed
    And the meeting range is from "09:00" to "11:00"

  @fix-grid-meeting-range-lock-and-layering @FR4 @NFR-A2
  Scenario: The keyboard alone sets the meeting
    Given the locations interface language is Russian
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user tabs to the meeting range button of "Moscow" and presses Enter
    And the user types "8", presses Tab, types "10:30" and presses Enter
    Then the meeting title reads "Встреча · 2 ч 30 мин"
    And the focus is on the meeting range button of "Moscow"

  @fix-grid-meeting-range-lock-and-layering @NFR-R1
  Scenario Outline: The open input fits on a phone
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Moscow"
    Then both fields of the meeting range input are fully inside the viewport
    And the page has no horizontal scroll

    Examples:
      | width | height |
      | 320   | 640    |
      | 390   | 844    |

  @fix-grid-meeting-range-lock-and-layering @NFR-A1
  Scenario Outline: No accessibility violations with the meeting range input in the <theme> theme
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "Moscow"
    Then the meeting state has no accessibility violations
    When the user confirms "abc" and "11" in the meeting range input of "Moscow"
    Then the meeting range input of "Moscow" shows an error
    And the meeting state has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @UX1
  Scenario: Controls are locked during the meeting and free after it
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then every drag handle and every location menu button is disabled
    When the user clicks the location menu button of "Moscow" in spite of the lock
    Then no location menu is open
    And no row offers the wall-time input
    When the user clears the meeting
    Then every drag handle and every location menu button is enabled
    When the user taps the time of "Moscow"
    Then the wall-time input of "Moscow" is open

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2
  Scenario: No drag in Grid while a meeting range is set
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Moscow", "Almaty", "New York"
    And location writes are counted
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the meeting range 09:00–11:00 in Almaty
    And the user drags "New York" above "Moscow" with the mouse
    Then the locations list order is "Moscow", "Almaty", "New York"
    And no location write happened

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2
  Scenario: No keyboard reorder in Grid while a meeting range is set
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Moscow", "Almaty", "New York"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the meeting range 09:00–11:00 in Almaty
    And the user tabs through the page
    Then no Tab stop is a handle "Move …"
    When the user clears the meeting
    And the user tabs through the page
    Then the Tab stops include "Move Moscow"

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2
  Scenario: The menu is locked in Grid while a meeting range is set
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the user clicks the location menu button of "Moscow" in spite of the lock
    Then no location menu is open
    And the location menu button of "Moscow" is disabled
    When the user clears the meeting
    And the user taps the location menu button of "Moscow"
    Then the menu offers the item "Remove"
