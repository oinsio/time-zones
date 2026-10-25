Feature: Wall-clock resolution
  Implements change select-date-with-calendar-and-now.
  As a user I am told when the time I keep does not exist on the new date.

  @select-date-with-calendar-and-now @FR4
  Scenario: A gap is told in the bar
    Given the device time zone is "America/New_York"
    And the current instant is "2026-03-07T07:30:00Z"
    And the app is open
    When the user moves to the next day
    Then the bar shows the note "02:30 does not exist on this day because of a clock change; showing 03:30."
    When the user moves to the next day again
    Then the bar shows no note

  @select-date-with-calendar-and-now @FR4 @M3
  Scenario Outline: Wall-clock outcomes
    Given the device time zone is "America/New_York"
    And the current instant is <from>
    And the app is open
    When the user moves to the next day
    Then the moment is pinned to <pinned>
    And the bar note is <note>

    Examples:
      | from                 | pinned               | note                                                                        |
      | 2026-06-01T14:00:00Z | 2026-06-02T14:00:00Z | no note                                                                     |
      | 2026-03-07T07:30:00Z | 2026-03-08T07:30:00Z | 02:30 does not exist on this day because of a clock change; showing 03:30. |
      | 2026-10-31T05:30:00Z | 2026-11-01T05:30:00Z | no note                                                                     |

  @select-date-with-calendar-and-now @FR10
  Scenario: A malformed date changes nothing
    Given the moment is live in the store
    When a date change arrives with the date "2026-13-01"
    Then the change is rejected as an invalid date
    And the moment is still live in the store
