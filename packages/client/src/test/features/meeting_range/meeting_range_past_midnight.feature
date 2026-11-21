Feature: Meeting range past midnight
  Implements change move-meeting-range-and-extend-past-midnight.
  As a user I plan an evening meeting that ends in the next day of the reference zone, at most 24 hours long.

  @move-meeting-range-and-extend-past-midnight @FR1 @FR11
  Scenario Outline: A meeting past midnight of the reference zone
    Given the reference zone is "Asia/Almaty" and the current time is "2026-03-08T07:30:00Z", live
    When the meeting range is set from "<start>" to "<end>"
    Then the meeting range is "<range>" in Almaty, <minutes> minutes long
    And the reference day is 2026-03-08

    Examples:
      | start                | end                  | range                        | minutes |
      | 2026-03-08T18:00:00Z | 2026-03-08T21:00:00Z | 23:00–02:00 of the next day  | 180     |
      | 2026-03-08T17:00:00Z | 2026-03-08T19:15:00Z | 22:00–00:15 of the next day  | 135     |
      | 2026-03-08T04:00:00Z | 2026-03-09T04:00:00Z | 09:00–09:00 of the next day  | 1440    |

  @move-meeting-range-and-extend-past-midnight @FR2
  Scenario: Set a meeting that ends after midnight
    Given the reference zone is "Asia/Almaty" and the current time is "2026-03-08T07:30:00Z", live
    When the meeting range is set from "2026-03-08T18:00:00Z" to "2026-03-08T21:00:00Z"
    Then the meeting range is "23:00–02:00 of the next day" in Almaty, 180 minutes long
    And the reference moment is pinned at "2026-03-08T18:00:00Z"

  @move-meeting-range-and-extend-past-midnight @FR4
  Scenario Outline: Handles of a meeting past midnight
    Given the reference zone is "Asia/Almaty" and the meeting range is 23:00–02:00 of the next day
    When the <handle> handle makes the move <move>
    Then the meeting range is <range>

    Examples:
      | handle | move            | range                       |
      | end    | next step       | 23:00–02:15 of the next day |
      | end    | an hour back    | 23:00–01:00 of the next day |
      | end    | day start       | 23:00–23:15                 |
      | end    | day end         | 23:00–23:00 of the next day |
      | start  | next step       | 23:15–02:00 of the next day |
      | start  | day end         | 23:45–02:00 of the next day |
      | start  | day start       | 02:00–02:00 of the next day |

  @move-meeting-range-and-extend-past-midnight @FR4
  Scenario: The end handle is dragged past midnight
    Given the reference zone is "Asia/Almaty" and the meeting range is 22:00–23:00
    When the end handle is dragged to 40 minutes after midnight of the next day
    Then the meeting range is 22:00–00:45 of the next day

  @move-meeting-range-and-extend-past-midnight @FR5
  Scenario: Next day keeps a meeting past midnight
    Given the reference zone is "Asia/Almaty" and the meeting range is 23:00–02:00 of the next day
    When the user selects the next day in the date bar
    Then the meeting range is 23:00–02:00 of the next day starting on 2026-03-09
