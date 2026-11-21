Feature: Move the whole meeting range
  Implements change move-meeting-range-and-extend-past-midnight.
  As a user I move the whole meeting range and its length stays the same.

  @move-meeting-range-and-extend-past-midnight @FR14
  Scenario Outline: Moves of the sample meeting
    Given the reference zone is "Asia/Almaty" and the meeting range is 09:00–11:00 on 2026-03-08
    When the meeting range makes the move <move>
    Then the meeting range is <range>, 120 minutes long
    And the reference moment is pinned at its start

    Examples:
      | move            | range                       |
      | next step       | 09:15–11:15                 |
      | previous step   | 08:45–10:45                 |
      | an hour forward | 10:00–12:00                 |
      | an hour back    | 08:00–10:00                 |
      | day start       | 00:00–02:00                 |
      | day end         | 23:45–01:45 of the next day |

  @move-meeting-range-and-extend-past-midnight @FR14
  Scenario Outline: Moves of a meeting off the track step
    Given the reference zone is "Asia/Almaty" and the meeting range is 09:05–09:28 on 2026-03-08
    When the meeting range makes the move <move>
    Then the meeting range is <range>, 23 minutes long

    Examples:
      | move          | range       |
      | next step     | 09:15–09:38 |
      | previous step | 09:00–09:23 |
      | an hour back  | 08:05–08:28 |

  @move-meeting-range-and-extend-past-midnight @FR20
  Scenario Outline: A pointer position lands the start on the track step
    Given the meeting range is 13:00–15:00 in Almaty on 2026-03-08
    When the meeting range is moved so that its start is at the position of <position>
    Then the meeting range is <range>

    Examples:
      | position                                      | range                       |
      | 14:37                                         | 14:30–16:30                 |
      | 14:38                                         | 14:45–16:45                 |
      | 23:58                                         | 23:45–01:45 of the next day |
      | an hour before the start of the reference day | 00:00–02:00                 |

  @move-meeting-range-and-extend-past-midnight @FR14
  Scenario Outline: A move stops at the limits
    Given the meeting range is <before> in Almaty on 2026-03-08
    When the meeting range makes the move <move>
    Then the meeting range is <range>

    Examples:
      | before                      | move            | range                       |
      | 00:00–02:00                 | previous step   | 00:00–02:00                 |
      | 00:30–02:30                 | an hour back    | 00:00–02:00                 |
      | 23:45–01:45 of the next day | next step       | 23:45–01:45 of the next day |
      | 23:20–23:50                 | an hour forward | 23:45–00:15 of the next day |

  @move-meeting-range-and-extend-past-midnight @FR14
  Scenario: A move on a clock change day keeps the length
    Given the reference zone is "America/New_York" and the meeting range is 00:30–01:30 on 2026-03-08, a 23-hour day
    When the meeting range makes the move "an hour forward" twice
    Then the meeting range is 60 minutes long and starts 120 minutes of absolute time later

  @move-meeting-range-and-extend-past-midnight @FR14
  Scenario: No meeting range
    Given no meeting range is set
    When a move of the meeting range is asked for
    Then the state is unchanged
