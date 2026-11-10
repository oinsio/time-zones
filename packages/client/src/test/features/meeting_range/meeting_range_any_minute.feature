Feature: Meeting range at any minute
  Implements change refine-meeting-range-entry-and-handles.
  As a user I type a meeting of any length, and the handles still move on the track step.

  @refine-meeting-range-entry-and-handles @FR1
  Scenario Outline: A meeting at any minute
    Given the reference zone is "Asia/Almaty" and the current time is "2026-03-08T07:30:00Z", live
    When the meeting range is set from "<start>" to "<end>"
    Then the meeting range is "<range>" in Almaty, <minutes> minutes long

    Examples:
      | start                | end                  | range       | minutes |
      | 2026-03-08T04:05:00Z | 2026-03-08T04:10:00Z | 09:05–09:10 | 5       |
      | 2026-03-08T04:05:00Z | 2026-03-08T04:28:00Z | 09:05–09:28 | 23      |
      | 2026-03-08T04:00:00Z | 2026-03-08T04:01:00Z | 09:00–09:01 | 1       |

  @refine-meeting-range-entry-and-handles @FR5
  Scenario: Next day keeps a meeting off the track step
    Given the meeting range is 09:05–09:28 in Almaty on 2026-03-08
    When the user selects the next day in the date bar
    Then the meeting range is 09:05–09:28 in Almaty on 2026-03-09

  @refine-meeting-range-entry-and-handles @FR4
  Scenario Outline: Moves from an end off the track step
    Given the reference zone is "Asia/Almaty" and the meeting range is "<before>" on 2026-03-08
    When the "<handle>" handle makes the move "<move>"
    Then the meeting range is "<range>"

    Examples:
      | before      | handle | move          | range       |
      | 09:05–11:00 | start  | next step     | 09:15–11:00 |
      | 09:05–11:00 | start  | previous step | 09:00–11:00 |
      | 09:05–11:00 | start  | an hour back  | 08:05–11:00 |
      | 09:00–10:50 | end    | previous step | 09:00–10:45 |
      | 09:00–09:05 | end    | day start     | 09:00–09:05 |
      | 09:00–09:05 | start  | next step     | 09:00–09:05 |
      | 09:00–09:05 | end    | next step     | 09:00–09:15 |
      | 09:05–09:28 | start  | next step     | 09:13–09:28 |

  @refine-meeting-range-entry-and-handles @FR4
  Scenario: A drag lands an off-step end on the track step
    Given the meeting range is 09:05–11:00 in Almaty on 2026-03-08
    When the start handle is dragged to the position of 09:11
    Then the meeting range is 09:15–11:00
