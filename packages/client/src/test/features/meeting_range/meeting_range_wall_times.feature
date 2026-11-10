Feature: Meeting range from wall-clock times
  Implements change fix-grid-meeting-range-lock-and-layering.
  As a user I type the meeting in the wall-clock time of any location and the range is set exactly as a drag sets it.

  @fix-grid-meeting-range-lock-and-layering @FR5
  Scenario Outline: Wall-clock times of any location set the range
    Given the reference zone is "Asia/Almaty", the current time is "2026-03-08T07:30:00Z" and the list holds Almaty, Moscow, Kolkata and New York
    When the meeting range is set from "<start>" to "<end>" in "<city>" on "<date>"
    Then the meeting range is "<range>" in Almaty on 2026-03-08
    And the reference moment is pinned at its start

    Examples:
      | city     | date       | start | end   | range       |
      | Almaty   | 2026-03-08 | 10:00 | 12:30 | 10:00–12:30 |
      | Moscow   | 2026-03-08 | 08:00 | 10:30 | 10:00–12:30 |
      | Kolkata  | 2026-03-08 | 09:30 | 11:30 | 09:00–11:00 |
      | New York | 2026-03-07 | 23:00 | 01:00 | 09:00–11:00 |

  @fix-grid-meeting-range-lock-and-layering @FR5
  Scenario Outline: Times that break the invariants are refused
    Given the reference zone is "Asia/Almaty", the current time is "2026-03-08T07:30:00Z" and the meeting range is 09:00–11:00 in Almaty
    When the meeting range is set from "<start>" to "<end>" in "<city>" on "<date>"
    Then the command fails with "<error>"
    And the state is unchanged

    Examples:
      | city     | date       | start | end   | error                 |
      | Almaty   | 2026-03-08 | 09:10 | 11:00 | INVALID_MEETING_RANGE |
      | Almaty   | 2026-03-08 | 22:00 | 02:00 | INVALID_MEETING_RANGE |
      | New York | 2026-03-07 | 13:00 | 15:00 | INVALID_MEETING_RANGE |
      | Almaty   | 2026-03-08 | 25:00 | 11:00 | INVALID_TIME          |
      | Almaty   | 2026-13-08 | 09:00 | 11:00 | INVALID_DATE          |
      | Tokyo    | 2026-03-08 | 09:00 | 11:00 | LOCATION_NOT_FOUND    |

  @fix-grid-meeting-range-lock-and-layering @FR5
  Scenario: The whole reference day
    Given the reference zone is "Asia/Almaty" and the current time is "2026-03-08T07:30:00Z"
    When the meeting range is set from "00:00" to "00:00" in "Almaty" on "2026-03-08"
    Then the meeting range is the whole reference day, from "2026-03-07T19:00:00Z" to "2026-03-08T19:00:00Z"
