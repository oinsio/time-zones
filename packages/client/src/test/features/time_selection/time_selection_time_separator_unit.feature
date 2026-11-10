Feature: The time separator while typing, in jsdom
  Implements change refine-meeting-range-entry-and-handles.
  As a user I type the digits of a time and the field keeps the ":" between the hours and the minutes.

  @refine-meeting-range-entry-and-handles @FR6 @UX1
  Scenario Outline: Digits typed one by one
    Given the user opened <input> of Almaty and its text is selected
    When the user types the digits <digits> one by one
    Then the field shows <shown> after each digit

    Examples:
      | input                                      | digits | shown                    |
      | the wall-time input                        | 1030   | 1, 10, 10:3, 10:30       |
      | the wall-time input                        | 930    | 9, 9:3, 9:30             |
      | the wall-time input                        | 0930   | 0, 09, 09:3, 09:30       |
      | the wall-time input                        | 2359   | 2, 23, 23:5, 23:59       |
      | the wall-time input                        | 12345  | 1, 12, 12:3, 12:34, 12:345 |
      | the wall-time input                        | 130    | 1, 13, 13:0              |
      | the start field of the meeting range input | 905    | 9, 9:0, 9:05             |
      | the end field of the meeting range input   | 1130   | 1, 11, 11:3, 11:30       |

  @refine-meeting-range-entry-and-handles @FR6 @UX1
  Scenario Outline: Texts left as typed
    Given the user opened the wall-time input of Almaty
    When the user types "<typed>"
    Then the field shows "<shown>"

    Examples:
      | typed   | shown   |
      | 9:30    | 9:30    |
      | 09.30   | 09.30   |
      | 9:30 PM | 9:30 PM |
      | abc     | abc     |
      | 24:00   | 2:4:00  |

  @refine-meeting-range-entry-and-handles @FR6 @UX1
  Scenario: Backspace removes the separator
    Given the wall-time input of Almaty shows "10:3" after typing "103"
    When the user presses Backspace twice
    Then the field shows "10"
    When the user types "4"
    Then the field then shows "10:4"

  @refine-meeting-range-entry-and-handles @FR6 @UX1
  Scenario: A pasted time gets its separator
    Given the user opened the wall-time input of Almaty with its text selected
    When the user pastes "0930"
    Then the field shows "09:30"

  @refine-meeting-range-entry-and-handles @FR6 @UX1
  Scenario Outline: Rejected texts stay rejected
    Given the user opened the wall-time input of Almaty
    When the user types "<typed>" and presses Enter
    Then the field shows the error "Enter the time as HH:MM"

    Examples:
      | typed |
      | 24:00 |
      | 12345 |
      | 9:60  |
      | 130   |
