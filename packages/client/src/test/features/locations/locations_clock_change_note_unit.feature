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

  @show-clock-change-note-on-location-cards @FR4
  Scenario: Nearest of two changes
    Given the interface language is "Russian"
    And the hour format is "24-hour"
    And the device time zone is "UTC" and no home location is set
    And the list contains "Boa Vista", whose offset changed on "2000-10-08T04:00:00Z" from -4 h to -3 h and on "2000-10-15T03:00:00Z" from -3 h to -4 h
    When the reference moment is pinned to "2000-10-10T12:00:00Z"
    Then the "Boa Vista" row shows the clock change note "8 окт. в 00:00 часы переведены на 1 ч вперёд"
    When the reference moment is then pinned to "2000-10-13T12:00:00Z"
    Then the "Boa Vista" row now shows the clock change note "15 окт. в 00:00 часы переведут на 1 ч назад"

  @show-clock-change-note-on-location-cards @FR2 @FR8
  Scenario: A change of 30 minutes
    Given the device time zone is "Europe/Belgrade" and no home location is set
    And the list contains "Lord Howe Island"
    When the reference moment is pinned to "2026-10-01T09:00:00Z"
    Then in "Russian" the "Lord Howe Island" row shows "4 окт. в 02:00 часы переведут на 30 мин вперёд"
    And in "English" it shows "On Oct 4 at 02:00 clocks will go forward 30 min"

  @show-clock-change-note-on-location-cards @FR2
  Scenario: A permanent change of the offset
    Given the interface language is "Russian"
    And the hour format is "24-hour"
    And the device time zone is "Asia/Almaty" and no home location is set
    And the list contains "Almaty"
    When the reference moment is pinned to "2024-03-01T06:00:00Z"
    Then the "Almaty" row shows the clock change note "1 мар. в 00:00 часы переведены на 1 ч назад"

  @show-clock-change-note-on-location-cards @FR5
  Scenario: No note for a zone without changes
    Given the device time zone is "Europe/Belgrade" and no home location is set
    And the list contains "Belgrade, Tokyo, Almaty"
    When the reference moment is pinned to "2026-10-25T09:00:00Z"
    Then the "Belgrade" row shows a clock change note
    And the rows "Tokyo, Almaty" show no clock change note

  @show-clock-change-note-on-location-cards @FR5
  Scenario: Home location and device time location show the note
    Given the device time zone is "Europe/Belgrade"
    And the list contains "the device time location, New York"
    And "New York" is the home location
    When the reference moment is pinned to "2026-10-28T12:00:00Z"
    Then the device time location shows a clock change note about "Oct 25" in the past tense
    And the "New York" row shows a clock change note about "Nov 1" in the future tense

  @show-clock-change-note-on-location-cards @FR5
  Scenario: Unknown zone
    Given the device time zone is "Europe/Belgrade" and no home location is set
    And the list contains "Nowhere, Belgrade", where "Nowhere" has a zone the browser does not know
    When the reference moment is pinned to "2026-10-25T09:00:00Z"
    Then the "Nowhere" row shows no clock change note
    And the "Belgrade" row shows a clock change note

  @show-clock-change-note-on-location-cards @FR7
  Scenario: The note follows the date bar and the settings
    Given the device time zone is "Europe/Belgrade" and no home location is set
    And the list contains "Belgrade"
    And the reference moment is pinned to "2026-11-01T09:00:00Z"
    Then the "Belgrade" row shows a clock change note
    When the date moves to the next day
    Then the "Belgrade" row shows no clock change note
    When the date moves to the previous day
    And the hour format becomes "12-hour" in "English"
    Then the "Belgrade" row shows the clock change note "On Oct 25 at 3:00 AM clocks went back 1 h"

  @show-clock-change-note-on-location-cards @FR6
  Scenario: The wall-time hint wins in its row only
    Given the device time zone is "Asia/Almaty" and no home location is set
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "New York, Belgrade"
    When the user types "02:30" in "New York"
    Then "New York" shows the wall-time hint and no clock change note
    And the "Belgrade" row shows no clock change note

  @show-clock-change-note-on-location-cards @FR6
  Scenario: Other rows keep their notes next to a hint
    Given the device time zone is "Asia/Almaty" and no home location is set
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "New York, Chicago"
    When the user types "02:30" in "New York"
    Then "New York" shows the wall-time hint and no clock change note
    And the "Chicago" row shows a clock change note

  @show-clock-change-note-on-location-cards @FR6
  Scenario: The note returns when the hint ends
    Given the device time zone is "Asia/Almaty" and no home location is set
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "New York"
    And the user typed "02:30" in "New York"
    When the user selects "2026-03-08T12:00:00Z" on a day track of the same reference day
    Then "New York" shows no wall-time hint
    And the "New York" row shows a clock change note

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
