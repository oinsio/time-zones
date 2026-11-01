Feature: Clock change note on location rows
  Implements change show-clock-change-note-on-location-cards.
  As a user I see on a location row when the clocks of its zone were or will be moved around the date I look at.

  @show-clock-change-note-on-location-cards @FR1 @FR2
  Scenario: A past change at the lower bound of the window
    Given the interface language is "Russian"
    And the hour format is "24-hour"
    And the device time zone is "Europe/Belgrade" and no home location is set
    And the current instant is "2026-11-01T09:00:00Z"
    And the list contains "Belgrade"
    When the user opens the app
    Then the "Belgrade" row shows the clock change note "25 окт. в 03:00 часы переведены на 1 ч назад"

  @show-clock-change-note-on-location-cards @FR1 @FR2
  Scenario: A future change at the upper bound of the window
    Given the interface language is "Russian"
    And the hour format is "24-hour"
    And the device time zone is "Europe/Belgrade" and no home location is set
    And the list contains "Belgrade"
    When the reference moment is pinned to "2027-03-21T09:00:00Z"
    Then the "Belgrade" row shows the clock change note "28 мар. в 02:00 часы переведут на 1 ч вперёд"

  @show-clock-change-note-on-location-cards @FR1
  Scenario Outline: Window bounds
    Given the device time zone is "Europe/Belgrade" and no home location is set
    And the list contains "Belgrade"
    When the reference moment is pinned to 09:00 UTC of "<date>"
    Then whether the "Belgrade" row shows a clock change note is "<note>"

    Examples:
      | date       | note |
      | 2026-10-17 | no   |
      | 2026-10-18 | yes  |
      | 2026-10-19 | yes  |
      | 2026-10-20 | yes  |
      | 2026-10-21 | yes  |
      | 2026-10-22 | yes  |
      | 2026-10-23 | yes  |
      | 2026-10-24 | yes  |
      | 2026-10-25 | yes  |
      | 2026-10-26 | yes  |
      | 2026-10-27 | yes  |
      | 2026-10-28 | yes  |
      | 2026-10-29 | yes  |
      | 2026-10-30 | yes  |
      | 2026-10-31 | yes  |
      | 2026-11-01 | yes  |
      | 2026-11-02 | no   |
      | 2027-03-20 | no   |
      | 2027-03-21 | yes  |

  @show-clock-change-note-on-location-cards @FR1
  Scenario: The window is counted in the reference zone
    Given the device time zone is "Asia/Almaty" and no home location is set
    And the list contains "Belgrade"
    When the reference moment is pinned to "2026-11-01T20:00:00Z"
    Then the "Belgrade" row shows no clock change note
    When "Belgrade" is made the home location
    Then the "Belgrade" row shows a clock change note

  @show-clock-change-note-on-location-cards @FR3
  Scenario: A change on the reference day, before and after it
    Given the interface language is "English"
    And the hour format is "24-hour"
    And the device time zone is "Europe/Belgrade" and no home location is set
    And the list contains "Belgrade"
    When the reference moment is pinned to "2026-10-25T00:30:00Z"
    Then the "Belgrade" row shows the clock change note "On Oct 25 at 03:00 clocks will go back 1 h"
    When the reference moment is then pinned to "2026-10-25T01:00:00Z"
    Then the "Belgrade" row now shows the clock change note "On Oct 25 at 03:00 clocks went back 1 h"

  @show-clock-change-note-on-location-cards @FR2 @FR8 @UX2
  Scenario Outline: Texts in both languages
    Given the device time zone is "Europe/Belgrade" and no home location is set
    And the hour format is "24-hour"
    And the list contains "Belgrade"
    When the reference moment is pinned to "<instant>" in "<language>"
    Then the "Belgrade" row shows the clock change note "<text>"

    Examples:
      | instant              | language | text                                         |
      | 2026-11-01T09:00:00Z | Russian  | 25 окт. в 03:00 часы переведены на 1 ч назад |
      | 2026-11-01T09:00:00Z | English  | On Oct 25 at 03:00 clocks went back 1 h      |
      | 2026-10-20T09:00:00Z | Russian  | 25 окт. в 03:00 часы переведут на 1 ч назад  |
      | 2026-10-20T09:00:00Z | English  | On Oct 25 at 03:00 clocks will go back 1 h   |
      | 2027-03-25T09:00:00Z | Russian  | 28 мар. в 02:00 часы переведут на 1 ч вперёд |
      | 2027-03-25T09:00:00Z | English  | On Mar 28 at 02:00 clocks will go forward 1 h |
      | 2027-03-30T09:00:00Z | Russian  | 28 мар. в 02:00 часы переведены на 1 ч вперёд |
      | 2027-03-30T09:00:00Z | English  | On Mar 28 at 02:00 clocks went forward 1 h   |

  @show-clock-change-note-on-location-cards @FR2 @FR8 @UX2
  Scenario: Amount with hours and minutes
    When a clock change of 90 minutes forward in the future is presented in English and in Russian
    Then the amount reads "1 h 30 min" and "1 ч 30 мин"
