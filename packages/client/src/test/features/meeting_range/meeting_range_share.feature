Feature: Share meeting text and outcome
  Implements changes add-grid-meeting-range-and-share and add-meeting-share-dialog.
  As a user I send the meeting as plain text, through the system share or the clipboard.

  Background:
    Given the home location is Almaty and the list is Almaty, Moscow, Kolkata, New York
    And the meeting range is 09:00–11:00 in Almaty on 2026-03-08

  @add-grid-meeting-range-and-share @FR14 @FR16 @UX3 @add-meeting-share-dialog @FR3 @FR6 @FR7
  Scenario: English text of the sample meeting
    Given the share language is "English"
    And the hour format is "24-hour"
    And every location is included
    When the meeting share text is built
    Then it is exactly these lines:
      | line                                                           |
      | Meeting on Sunday, March 8, 2026, 2 h                          |
      | Almaty (UTC+5): 09:00–11:00                                    |
      | Moscow (MSK, UTC+3): 07:00–09:00                               |
      | Kolkata (IST, UTC+5:30): 09:30–11:30                           |
      | New York (EST, UTC−5): 23:00–01:00 (a day earlier, Sat, Mar 7) |
    And no line holds a link

  @add-meeting-share-dialog @FR3 @FR4 @FR6 @FR7
  Scenario: Russian text of the sample meeting
    Given the share language is "Russian"
    And the hour format is "24-hour"
    And every location is included
    When the meeting share text is built
    Then it is exactly these lines:
      | line                                                           |
      | Встреча в воскресенье, 8 марта 2026 г., 2 ч                    |
      | Алматы (UTC+5): 09:00–11:00                                    |
      | Москва (МСК, UTC+3): 07:00–09:00                               |
      | Калькутта (IST, UTC+5:30): 09:30–11:30                         |
      | Нью-Йорк (EST, UTC−5): 23:00–01:00 (днём раньше, сб, 7 мар.)   |

  @add-grid-meeting-range-and-share @FR14 @add-meeting-share-dialog @FR3
  Scenario: The text follows the hour format
    Given the share language is "English"
    And the hour format is "12-hour"
    And every location is included
    When the meeting share text is built
    Then every span is written in the 12-hour format, as the rows show their times

  @add-meeting-share-dialog @FR3
  Scenario: Only included locations get a line
    Given the share language is "English"
    And the hour format is "24-hour"
    And only "Almaty" and "New York" are included
    When the meeting share text is built
    Then it has the heading and exactly two more lines, for Almaty and then New York

  @add-meeting-share-dialog @FR4
  Scenario: The share language differs from the interface language
    Given the interface language is Russian
    And the share language is "English"
    And the hour format is "24-hour"
    And every location is included
    When the meeting share text is built
    Then it is the English text of the sample meeting
    And no line contains a Cyrillic letter

  @add-meeting-share-dialog @FR6
  Scenario Outline: Zone parts follow the share zone label
    Given the share language is "English"
    And the hour format is "24-hour"
    And every location is included
    And the share zone label is "<parts>"
    When the meeting share text is built
    Then the Moscow line is "<moscow>" and the Almaty line is "<almaty>"

    Examples:
      | parts                       | moscow                           | almaty                      |
      | abbreviation and UTC offset | Moscow (MSK, UTC+3): 07:00–09:00 | Almaty (UTC+5): 09:00–11:00 |
      | abbreviation only           | Moscow (MSK): 07:00–09:00        | Almaty: 09:00–11:00         |
      | UTC offset only             | Moscow (UTC+3): 07:00–09:00      | Almaty (UTC+5): 09:00–11:00 |
      | neither                     | Moscow: 07:00–09:00              | Almaty: 09:00–11:00         |

  @add-meeting-share-dialog @FR6
  Scenario: A UTC location does not repeat UTC
    Given the list is Almaty and the UTC location
    And the share language is "English"
    And every location is included
    When the meeting share text is built
    Then the UTC line is "UTC: 04:00–06:00"

  @add-meeting-share-dialog @FR6
  Scenario Outline: Zone parts are those at the start of the meeting
    Given the home location is Belgrade
    And the share language is "English"
    When the meeting share text is built for a meeting range that starts on <date> at 10:00 in Belgrade
    Then the Belgrade line starts with "<prefix>"

    Examples:
      | date       | prefix                 |
      | 2026-01-15 | Belgrade (CET, UTC+1): |
      | 2026-07-15 | Belgrade (CEST, UTC+2): |

  @add-meeting-share-dialog @FR7
  Scenario Outline: Russian heading by weekday
    Given the home location is Almaty
    And the share language is "Russian"
    When the meeting share text is built for a two-hour meeting range that starts on <date>
    Then the heading is "<heading>"

    Examples:
      | date       | heading                                      |
      | 2026-03-09 | Встреча в понедельник, 9 марта 2026 г., 2 ч  |
      | 2026-03-10 | Встреча во вторник, 10 марта 2026 г., 2 ч    |
      | 2026-03-11 | Встреча в среду, 11 марта 2026 г., 2 ч       |
      | 2026-03-12 | Встреча в четверг, 12 марта 2026 г., 2 ч     |
      | 2026-03-13 | Встреча в пятницу, 13 марта 2026 г., 2 ч     |
      | 2026-03-14 | Встреча в субботу, 14 марта 2026 г., 2 ч     |
      | 2026-03-15 | Встреча в воскресенье, 15 марта 2026 г., 2 ч |

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
