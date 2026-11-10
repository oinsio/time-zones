Feature: Day shift of a location
  Implements change add-grid-meeting-range-and-share.
  As a user I see whether a location's date differs from the reference zone's at the start of the meeting.

  @add-grid-meeting-range-and-share @FR8
  Scenario Outline: Day shifts at the start of the sample meeting
    Given the reference zone is "Asia/Almaty"
    When the day shift at "2026-03-08T04:00:00Z" is read for <city>
    Then it is <shift>

    Examples:
      | city     | shift   |
      | Almaty   | same    |
      | Moscow   | same    |
      | Kolkata  | same    |
      | New York | earlier |
      | Tokyo    | same    |
