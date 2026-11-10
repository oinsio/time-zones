Feature: Meeting range commands
  Implements change add-grid-meeting-range-and-share.
  As a user I set a meeting range, clear it, and it follows the date and the reference zone like ADR-0011 says.

  @add-grid-meeting-range-and-share @FR1
  Scenario: A stored list never carries a meeting range
    Given the reference zone is "Asia/Almaty" and the meeting range is 09:00–11:00 on 2026-03-08
    When the location list is written to storage and the app is opened again
    Then the stored document has no meeting range
    And the app opens live without a meeting range

  @add-grid-meeting-range-and-share @FR2
  Scenario: Set a two-hour meeting
    Given the reference zone is "Asia/Almaty" and the current time is "2026-03-08T07:30:00Z", live
    When the meeting range is set from "2026-03-08T04:00:00Z" to "2026-03-08T06:00:00Z"
    Then the meeting range is 09:00–11:00 in Almaty
    And the reference moment is pinned at "2026-03-08T04:00:00Z"

  @add-grid-meeting-range-and-share @FR2
  Scenario Outline: Invalid ranges are refused
    Given the reference zone is "Asia/Almaty", the current time is "2026-03-08T07:30:00Z" and no meeting range is set
    When the meeting range is set from "<start>" to "<end>"
    Then the command fails with INVALID_MEETING_RANGE
    And the state is unchanged

    Examples:
      | start                | end                  |
      | 2026-03-08T06:00:00Z | 2026-03-08T04:00:00Z |
      | 2026-03-08T04:00:00Z | 2026-03-08T04:00:00Z |
      | 2026-03-08T04:10:00Z | 2026-03-08T06:00:00Z |
      | 2026-03-08T17:00:00Z | 2026-03-08T19:15:00Z |
      | 2026-03-08 04:00     | 2026-03-08T06:00:00Z |

  @add-grid-meeting-range-and-share @FR2
  Scenario: Clear keeps the moment pinned
    Given the meeting range is 09:00–11:00 in Almaty on 2026-03-08
    When the meeting range is cleared
    Then no meeting range is set
    And the reference moment is pinned at 09:00 in Almaty

  @add-grid-meeting-range-and-share @FR3
  Scenario Outline: Commands that remove the range
    Given the meeting range is 09:00–11:00 in Almaty on 2026-03-08
    When the user <does>
    Then no meeting range is set

    Examples:
      | does                                              |
      | returns to now                                    |
      | selects a time on a day track or an hour strip    |
      | types 12:15 into the time of Almaty               |

  @add-grid-meeting-range-and-share @FR3
  Scenario: Next day keeps the meeting
    Given the meeting range is 09:00–11:00 in Almaty on 2026-03-08
    When the user selects the next day in the date bar
    Then the meeting range is 09:00–11:00 in Almaty on 2026-03-09

  @add-grid-meeting-range-and-share @FR3
  Scenario: A shorter day clamps the end
    Given the reference zone is "America/New_York" and the meeting range is the whole reference day of 2026-03-07, 24 hours long
    When the user selects the next day in the date bar
    Then the meeting range starts at 00:00 on 2026-03-08 and ends at the end of that 23-hour day, 23 hours long

  @add-grid-meeting-range-and-share @FR4
  Scenario: Another home removes the range
    Given the home location is Almaty and the meeting range is 09:00–11:00 in Almaty on 2026-03-08
    When the user makes Moscow the home location
    Then no meeting range is set
    And the reference moment is pinned at "2026-03-08T04:00:00Z"

  @add-grid-meeting-range-and-share @FR4
  Scenario: Removing the last location removes the range
    Given the list holds only Almaty and the meeting range is 09:00–11:00
    When the user removes Almaty
    Then no meeting range is set

  @add-grid-meeting-range-and-share @FR4
  Scenario: Adding a location keeps the range
    Given the meeting range is 09:00–11:00 in Almaty on 2026-03-08
    When the user adds Tokyo
    Then the meeting range is still 09:00–11:00 in Almaty
