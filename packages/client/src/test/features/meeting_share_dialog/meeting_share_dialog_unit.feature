Feature: Share dialog opening, rows and outcomes
  Implements change add-meeting-share-dialog.
  As a user I decide which locations, which language and which zone parts the meeting share text has, read it and send it.

  Background:
    Given the interface language is Russian, the hour format is 24-hour and nothing is stored in the preferences
    And the Grid view shows the sample meeting 09:00–11:00 in Almaty on 2026-03-08 with the list Almaty, Moscow, Kolkata, New York

  @add-meeting-share-dialog @FR1 @FR2 @FR4 @FR5 @FR6
  Scenario: The dialog opens with its defaults
    When the user chooses "Поделиться встречей"
    Then the share dialog is open with the title "Встреча · 2 ч" and the line "воскресенье, 8 марта 2026 г. · по времени Алматы"
    And every location is ticked, the share language is "Русский", no share language is pinned, and the share zone label shows the zone abbreviation and the UTC offset

  @add-meeting-share-dialog @FR1
  Scenario: The reference line without a home location
    Given the list is Moscow, Kolkata and New York
    When the user chooses "Поделиться встречей"
    Then the line under the title is "воскресенье, 8 марта 2026 г. · по времени Алматы"
    And it stays in Russian when the user chooses "English" as the share language

  @add-meeting-share-dialog @FR2 @FR3
  Scenario: Rows of the sample meeting
    When the user chooses "Поделиться встречей"
    Then its rows are, in order:
      | city      | zone parts     | span        | date                   |
      | Алматы    | UTC+5          | 09:00–11:00 | вс, 8 мар.             |
      | Москва    | МСК · UTC+3    | 07:00–09:00 | вс, 8 мар.             |
      | Калькутта | IST · UTC+5:30 | 09:30–11:30 | вс, 8 мар.             |
      | Нью-Йорк  | EST · UTC−5    | 23:00–01:00 | днём раньше сб, 7 мар. |

  @add-meeting-share-dialog @FR2 @FR3
  Scenario: Unticked locations are not remembered
    Given the user unticked "Калькутта" and "Нью-Йорк" and closed the share dialog
    When the user chooses "Поделиться встречей"
    Then every location is ticked

  @add-meeting-share-dialog @FR9 @UX5 @keep-location-menu-in-view-and-clear-range-after-share @FR5 @FR7
  Scenario Outline: Outcomes of a share from the dialog
    Given the share dialog is open with "Калькутта" unticked
    When the user chooses "Поделиться" and the browser <behaves>
    Then the dialog is <dialog>, the notice is <notice>, the meeting range is <range> and no confirmation dialog is open

    Examples:
      | behaves                                | dialog                           | notice                           | range       |
      | shares the text                        | closed                           | none                             | none        |
      | reports that the user closed the sheet | open, Калькутта still unticked   | none                             | 09:00–11:00 |
      | has no system share                    | closed                           | Текст встречи скопирован         | 09:00–11:00 |
      | has neither share nor clipboard        | closed                           | Не удалось поделиться встречей   | 09:00–11:00 |

  @add-meeting-share-dialog @FR10
  Scenario: A location is removed in another tab
    Given the share dialog is open with "Москва" unticked
    When "Калькутта" is removed from the list in another tab
    Then the dialog shows Алматы, Москва and Нью-Йорк, "Москва" is still unticked and the preview has no Kolkata line

  @add-meeting-share-dialog @FR10
  Scenario: The meeting range is removed in another tab
    Given the share dialog is open
    When another tab makes "Moscow" the home location
    Then the share dialog is closed and no meeting range is set

  @add-meeting-share-dialog @FR12
  Scenario: English interface
    Given the interface language is English
    When the share dialog is open
    Then its captions are "Send to", "Language of the invitation", "Timezone label" and "Text of the invitation", and its button is "Share"
