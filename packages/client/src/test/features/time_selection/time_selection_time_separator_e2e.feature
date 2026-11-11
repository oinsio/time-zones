Feature: The time separator while typing in a real browser
  Implements change refine-meeting-range-entry-and-handles.
  As a user I type the digits of a time on the keyboard and the field keeps the ":" between the hours and the minutes, with the caret at the end.

  Background:
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "New York"
    And the screen is 1440 by 900 px for the locations

  @refine-meeting-range-entry-and-handles @FR6 @UX1
  Scenario Outline: Digits typed one by one: <digits> in <input>
    When the user opens the locations app
    And the user opened <input> of Almaty and its text is selected
    And the user types the digits "<digits>" one by one
    Then the field shows <shown> after each digit
    And the caret is after the last character

    Examples:
      | input                                      | digits | shown                      |
      | the wall-time input                        | 1030   | 1, 10, 10:3, 10:30         |
      | the wall-time input                        | 930    | 9, 9:3, 9:30               |
      | the wall-time input                        | 0930   | 0, 09, 09:3, 09:30         |
      | the wall-time input                        | 2359   | 2, 23, 23:5, 23:59         |
      | the wall-time input                        | 12345  | 1, 12, 12:3, 12:34, 12:345 |
      | the wall-time input                        | 130    | 1, 13, 13:0                |
      | the start field of the meeting range input | 905    | 9, 9:0, 9:05               |
      | the end field of the meeting range input   | 1130   | 1, 11, 11:3, 11:30         |

  @refine-meeting-range-entry-and-handles @FR6 @UX1
  Scenario: Backspace removes the separator
    When the user opens the locations app
    And the user opened the wall-time input of Almaty and its text is selected
    And the user types the digits "103" one by one
    And the user presses Backspace twice
    Then the field shows "10"
    When the user types the digits "4" one by one
    Then the field shows "10:4"

  @refine-meeting-range-entry-and-handles @FR6 @UX1
  Scenario: A typed time with the separator is confirmed
    When the user opens the locations app
    And the user opens the wall-time input of "New York"
    And the user types "1040" on the keyboard and presses Enter
    Then "New York" shows the time "10:40"

  @refine-meeting-range-entry-and-handles @FR6 @UX1
  Scenario Outline: Rejected texts stay rejected: <typed>
    When the user opens the locations app
    And the user opens the wall-time input of "New York"
    And the user types "<typed>" on the keyboard and presses Enter
    Then the field shows the error "Enter the time as HH:MM"

    Examples:
      | typed |
      | 24:00 |
      | 12345 |
      | 9:60  |
      | 130   |

  @refine-meeting-range-entry-and-handles @FR2 @FR3
  Scenario Outline: A meeting at any minute from <start> to <end> in <city>
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "<city>"
    And the user types "<start>", presses Tab, types "<end>" and presses Enter
    Then the meeting title reads "<title>"

    Examples:
      | city   | start | end | title                 |
      | Almaty | 905   | 928 | Meeting · 23 min      |
      | Moscow | 7:05  | 9:28 | Meeting · 2 h 23 min |
