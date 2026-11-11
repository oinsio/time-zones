Feature: Meeting range from wall-clock times
  Implements change fix-grid-meeting-range-lock-and-layering.
  As a user I type the meeting in the wall-clock time of any location and the range is set exactly as a drag sets it.

  @fix-grid-meeting-range-lock-and-layering @FR5 @refine-meeting-range-entry-and-handles @FR1
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
      | Almaty   | 2026-03-08 | 09:05 | 09:10 | 09:05–09:10 |
      | Almaty   | 2026-03-08 | 09:00 | 09:23 | 09:00–09:23 |
      | Moscow   | 2026-03-08 | 07:05 | 09:28 | 09:05–11:28 |
      | Kolkata  | 2026-03-08 | 09:37 | 10:00 | 09:07–09:30 |
      | New York | 2026-03-07 | 23:10 | 00:40 | 09:10–10:40 |

  @fix-grid-meeting-range-lock-and-layering @FR5 @refine-meeting-range-entry-and-handles @FR2
  Scenario Outline: Times that break the invariants are refused
    Given the reference zone is "Asia/Almaty", the current time is "2026-03-08T07:30:00Z" and the meeting range is 09:00–11:00 in Almaty
    When the meeting range is set from "<start>" to "<end>" in "<city>" on "<date>"
    Then the command fails with "<error>"
    And the state is unchanged

    Examples:
      | city     | date       | start | end   | error                 |
      | Almaty   | 2026-03-08 | 10:00 | 10:00 | MEETING_START_EQUALS_END |
      | Almaty   | 2026-03-08 | 12:00 | 10:00 | MEETING_END_BEFORE_START |
      | Almaty   | 2026-03-08 | 22:00 | 02:00 | MEETING_END_BEFORE_START |
      | New York | 2026-03-07 | 13:00 | 14:00 | INVALID_MEETING_RANGE |
      | New York | 2026-03-07 | 13:00 | 01:00 | INVALID_MEETING_RANGE |
      | Almaty   | 2026-03-08 | 25:00 | 11:00 | INVALID_TIME          |
      | Almaty   | 2026-13-08 | 09:00 | 11:00 | INVALID_DATE          |
      | Tokyo    | 2026-03-08 | 09:00 | 11:00 | LOCATION_NOT_FOUND    |

  @fix-grid-meeting-range-lock-and-layering @FR5 @refine-meeting-range-entry-and-handles @FR2
  Scenario: The whole reference day
    Given the reference zone is "Asia/Almaty" and the current time is "2026-03-08T07:30:00Z"
    When the meeting range is set from "00:00" to "00:00" in "Almaty" on "2026-03-08"
    Then the command fails with "MEETING_START_EQUALS_END" and no meeting range is set
    And the state is unchanged

  @fix-grid-meeting-range-lock-and-layering @FR5
  Scenario: A range typed in wall-clock times is never stored
    Given the reference zone is "Asia/Almaty" and the list holds Almaty and Moscow in storage
    When the meeting range is typed from "08:00" to "10:30" in "Moscow" on "2026-03-08" and the list is written to storage
    Then the stored document has no meeting range
