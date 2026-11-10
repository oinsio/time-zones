Feature: Meeting handle moves
  Implements change add-grid-meeting-range-and-share.
  As a user I move one end of the meeting range, never shorter than one track step and never out of the reference day.

  @add-grid-meeting-range-and-share @FR12
  Scenario Outline: Keyboard moves of the handles
    Given the reference zone is "Asia/Almaty" and the meeting range is 09:00–11:00 on 2026-03-08
    When the <handle> handle makes the move <move>
    Then the meeting range is <range>

    Examples:
      | handle | move          | range                                 |
      | start  | next step     | 09:15–11:00                           |
      | start  | an hour back  | 08:00–11:00                           |
      | start  | day end       | 10:45–11:00                           |
      | start  | day start     | 00:00–11:00                           |
      | end    | day start     | 09:00–09:15                           |
      | end    | an hour forward | 09:00–12:00                         |
      | end    | day end       | 09:00 to the end of the reference day |

  @add-grid-meeting-range-and-share @FR10
  Scenario: A drag cannot cross the other end
    Given the meeting range is 09:00–11:00 in Almaty on 2026-03-08
    When the end handle is dragged to the position of 07:40
    Then the meeting range is 09:00–09:15
