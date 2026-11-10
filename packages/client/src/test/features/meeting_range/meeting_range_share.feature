Feature: Share meeting text and outcome
  Implements change add-grid-meeting-range-and-share.
  As a user I send the meeting as plain text, through the system share or the clipboard.

  Background:
    Given the interface language is English, the hour format is 24-hour, the home location is Almaty and the list is Almaty, Moscow, Kolkata, New York
    And the meeting range is 09:00–11:00 in Almaty on 2026-03-08

  @add-grid-meeting-range-and-share @FR14 @FR16 @UX3
  Scenario: English text of the sample meeting
    When the meeting share text is built
    Then it is exactly these lines:
      | line                                               |
      | Meeting on Sunday, March 8, 2026, 2 h              |
      | Almaty: 09:00–11:00                                |
      | Moscow: 07:00–09:00                                |
      | Kolkata: 09:30–11:30                               |
      | New York: 23:00–01:00 (a day earlier, Sat, Mar 7)  |
    And no line holds a link

  @add-grid-meeting-range-and-share @FR14
  Scenario: The text follows the hour format
    Given the hour format is 12-hour
    When the meeting share text is built
    Then every span is written in the 12-hour format, as the rows show their times

  @add-grid-meeting-range-and-share @FR15 @UX3
  Scenario Outline: Outcomes of sharing
    When the user shares the meeting and the browser <behaves>
    Then the outcome is <outcome>
    And the clipboard holds <clipboard>

    Examples:
      | behaves                                  | outcome   | clipboard              |
      | shares the text                          | shared    | nothing                |
      | reports that the user closed the sheet   | cancelled | nothing                |
      | has no system share                      | copied    | the meeting share text |
      | fails to share for another reason        | copied    | the meeting share text |
      | has neither share nor clipboard          | failed    | nothing                |
