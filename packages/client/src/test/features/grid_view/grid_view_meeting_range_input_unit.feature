Feature: The meeting range input in the Grid view
  Implements change fix-grid-meeting-range-lock-and-layering.
  As a user I type the meeting in the time of any location.

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

