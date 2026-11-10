Feature: Meeting range in the Grid view
  Implements change add-grid-meeting-range-and-share.
  As a user I pick a meeting with a tap or Enter, see its frame, spans and bar, share it and clear it.

  @add-grid-meeting-range-and-share @FR5
  Scenario: Tap on column 9
    Given the view mode is Grid, the reference zone is "Asia/Almaty", the current time is "2026-03-08T07:30:00Z", live, and the stored locations are Almaty, Moscow, Kolkata and New York
    When the user taps column 9 of Moscow
    Then the meeting range is 09:00–10:00 in Almaty
    And Almaty shows "09:00–10:00" and the title is "Meeting · 1 h"

  @add-grid-meeting-range-and-share @FR5
  Scenario: Enter on an hour strip
    Given the Grid view at "2026-03-08T07:30:00Z", live, with Almaty and Moscow
    When the user focuses Almaty's hour strip and presses Enter
    Then the meeting range is 12:00–13:00 in Almaty

  @add-grid-meeting-range-and-share @FR7
  Scenario: Frame and dimming of the sample meeting
    Given the Grid view with Almaty, Moscow, Kolkata and New York and the meeting range 09:00–11:00 in Almaty on 2026-03-08
    When the main page is shown
    Then the meeting frame encloses columns 9 and 10 of every row
    And 22 cells of every row are dimmed and columns 9 and 10 are not
    And no hour frame is shown

  @add-grid-meeting-range-and-share @FR7
  Scenario: A quarter-hour range
    Given the meeting range is 09:15–10:30 in Almaty on 2026-03-08
    When the Grid view is shown
    Then columns 9 and 10 are not dimmed and every other column is

  @add-grid-meeting-range-and-share @FR8
  Scenario Outline: Spans of the sample meeting
    Given the interface language is Russian, the hour format is 24-hour and the meeting range is 09:00–11:00 in Almaty on 2026-03-08
    When the Grid view is shown
    Then <city> shows <span> and <mark>

    Examples:
      | city     | span        | mark                                       |
      | Almaty   | 09:00–11:00 | no day shift mark                          |
      | Moscow   | 07:00–09:00 | no day shift mark                          |
      | Kolkata  | 09:30–11:30 | no day shift mark                          |
      | New York | 23:00–01:00 | «днём раньше» before its date of 7 March   |

  @add-grid-meeting-range-and-share @FR8 @FR13
  Scenario: Clear returns the times
    Given the sample meeting is set
    When the user clears the meeting range
    Then every row shows its single time again and no row shows a day shift mark

  @add-grid-meeting-range-and-share @FR13
  Scenario Outline: Durations in the title
    Given the interface language is <language>
    When the meeting range lasts <minutes> minutes
    Then the title is <title>

    Examples:
      | language | minutes | title                |
      | Russian  | 120     | Встреча · 2 ч        |
      | Russian  | 105     | Встреча · 1 ч 45 мин |
      | Russian  | 45      | Встреча · 45 мин     |
      | English  | 120     | Meeting · 2 h        |
      | English  | 105     | Meeting · 1 h 45 min |

  @add-grid-meeting-range-and-share @FR13
  Scenario: Clear meeting
    Given the Grid view with the sample meeting
    When the user chooses "Clear meeting"
    Then no meeting range is set, the hour frame is on column 9 and the header shows "Time Zones" with Add location and Settings
    And the Add location button has the focus

  @add-grid-meeting-range-and-share @FR7 @FR13
  Scenario: No hour frame during a meeting
    Given the Grid view at "2026-03-08T07:30:00Z" with the meeting range 09:00–11:00 in Almaty
    When the main page is shown
    Then no hour frame is shown
    When the user clears the meeting range
    Then the hour frame is on column 9
