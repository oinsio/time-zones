Feature: Working hours row
  Implements change add-day-colouring-setting.
  As a user I enter my working hours to the minute, in my hour format.

  @add-day-colouring-setting @FR5 @FR6
  Scenario: A minute-exact start
    Given the colouring "Working hours" is stored
    And the settings page is shown
    When the user types "907" as the start and confirms
    Then the start field shows "09:07"
    And the working hours in force are 09:07-18:00

  @add-day-colouring-setting @FR5
  Scenario: The 12-hour format
    Given the hour format is 12-hour and the colouring "Working hours" is stored
    And the settings page is shown
    Then the fields show "10:00 AM" and "6:00 PM"
    When the user types "5:30 pm" as the end and confirms
    Then the end field shows "5:30 PM"
    And the working hours in force are 10:00-17:30

  @add-day-colouring-setting @FR7
  Scenario Outline: Refused ranges keep the last valid hours
    Given the colouring "Working hours" is stored
    And the settings page is shown
    When the user types <start> as the start and <end> as the end and confirms
    Then the hint reads <hint>
    And the working hours in force and the stored working hours are still 10:00-18:00

    Examples:
      | start   | end     | hint                               |
      | "18:00" | "10:00" | "The start must be before the end" |
      | "12:00" | "12:00" | "The start must be before the end" |
      | "25:00" | "18:00" | "Enter the time as HH:MM"          |

  @add-day-colouring-setting @FR6
  Scenario: Esc restores the stored texts
    Given the colouring "Working hours" is stored
    And the settings page is shown
    And the user typed "18:00" as the start, which was refused
    When the user presses Esc in the field
    Then the fields show "10:00" and "18:00" and no hint is shown
