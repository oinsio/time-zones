Feature: Locked row controls and the meeting range input in the Grid view
  Implements change fix-grid-meeting-range-lock-and-layering.
  As a user I type the meeting in the time of any location, and the controls that would change the time or the list stay locked while the meeting is set.

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @UX1
  Scenario: Controls are locked during the meeting and free after it
    Given the Grid view with Almaty, Moscow, Kolkata and New York at "2026-03-08T07:30:00Z"
    When the user sets the meeting range 09:00–11:00 in Almaty
    Then every drag handle and every location menu button is disabled and dimmed
    And no row offers the wall-time input
    When the user clears the meeting range
    Then every drag handle and every location menu button is enabled
    And every row's time opens the wall-time input

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @UX1
  Scenario: Setting a meeting range closes an open location menu
    Given the Grid view with Almaty and Moscow and Moscow's location menu open
    When the user taps column 9 of Almaty
    Then the meeting range is 09:00–10:00 in Almaty and no location menu is open

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @UX1
  Scenario: Cards keeps its controls with a meeting range
    Given the meeting range 09:00–11:00 in Almaty was set in Grid
    When the view mode is changed to Cards
    Then every drag handle and every location menu button is enabled and every time opens the wall-time input

  @fix-grid-meeting-range-lock-and-layering @FR3 @FR4
  Scenario Outline: Type the meeting in another location's time
    Given the Grid view with Almaty, Moscow, Kolkata and New York, Russian interface, 24-hour format and the meeting range 09:00–11:00 in Almaty on 2026-03-08
    When the user opens the meeting range input of "<city>" and enters "<start>" and "<end>"
    Then the meeting range is "<range>" in Almaty and the input is closed

    Examples:
      | city     | start | end   | range       |
      | Almaty   | 10    | 12:30 | 10:00–12:30 |
      | Moscow   | 8     | 10:30 | 10:00–12:30 |
      | Kolkata  | 9:30  | 11:30 | 09:00–11:00 |
      | New York | 23    | 1     | 09:00–11:00 |

  @fix-grid-meeting-range-lock-and-layering @FR4
  Scenario: Twelve-hour texts
    Given the sample meeting, English interface and 12-hour format
    When the user opens the meeting range input of "Almaty" and enters "10 am" and "12:30 pm"
    Then the meeting range is "10:00 AM–12:30 PM" in Almaty and the input is closed

  @fix-grid-meeting-range-lock-and-layering @FR4
  Scenario Outline: Wrong input keeps the input open
    Given the sample meeting in the Grid view, Russian interface
    When the user opens the meeting range input of "<city>" and enters "<start>" and "<end>"
    Then the input stays open with the error "<error>"
    And the meeting range is still 09:00–11:00

    Examples:
      | city     | start | end | error                                            |
      | Almaty   | abc   | 11  | Введите время в формате ЧЧ:ММ                    |
      | Almaty   | 9:10  | 11  | Встреча должна быть внутри дня, с шагом 15 минут |
      | Almaty   | 22    | 2   | Встреча должна быть внутри дня, с шагом 15 минут |
      | New York | 13    | 14  | Встреча должна быть внутри дня, с шагом 15 минут |

  @fix-grid-meeting-range-lock-and-layering @FR4
  Scenario: Esc closes the input without a change
    Given the sample meeting and Moscow's meeting range input open with "8" typed in the start field
    When the user presses Esc
    Then the input is closed, the meeting range is still 09:00–11:00 and the focus is on Moscow's span

  @fix-grid-meeting-range-lock-and-layering @FR3 @FR4
  Scenario: The span opens the meeting range input
    Given the sample meeting is set
    When the user activates Moscow's span
    Then the meeting range input of Moscow opens with "07:00" and "09:00"
    And no wall-time input opens

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @FR3
  Scenario: No wall-time input in Grid while a meeting range is set
    Given the Grid view with Almaty and Moscow and the meeting range 09:00–11:00 in Almaty on 2026-03-08
    When the user activates Moscow's span
    Then the meeting range input of Moscow opens and no wall-time input opens
    When the user clears the meeting range and activates Moscow's time
    Then the wall-time input of Moscow opens
