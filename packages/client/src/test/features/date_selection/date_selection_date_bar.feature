Feature: Date bar
  Implements change select-date-with-calendar-and-now.
  As a user I read the shown date in my language and use the bar in every state of the page.

  @select-date-with-calendar-and-now @FR7 @FR9 @M4
  Scenario Outline: Date text by screen width and language
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the interface language is <language>
    And the app is open
    When the bar is shown at <width> px
    Then the shown date reads <text>

    Examples:
      | language | width | text                  |
      | en       | 375   | Sun, March 8          |
      | en       | 1024  | Sunday, March 8       |
      | ru       | 375   | вс, 8 марта           |
      | ru       | 1024  | воскресенье, 8 марта  |

  @select-date-with-calendar-and-now @FR7
  Scenario: Another year
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the app is open
    When the user picks the date "2027-03-08"
    Then the shown date reads "Mon, March 8, 2027" at 375 px in English

  @select-date-with-calendar-and-now @FR7
  Scenario: Live date changes at midnight
    Given the device time zone is "Asia/Almaty"
    And the app was opened at "2026-03-08T18:59:30Z", so the bar shows "Sun, March 8"
    When the next minute starts at "2026-03-08T19:00:00Z"
    Then the bar shows "Mon, March 9"

  @select-date-with-calendar-and-now @FR8
  Scenario Outline: Bar in each state
    When the main page is in the <state> state
    Then the date bar is shown with the previous-day, date and next-day buttons

    Examples:
      | state               |
      | view loading        |
      | view error          |
      | empty               |
      | unreadable          |
      | storage unavailable |
      | offline             |
