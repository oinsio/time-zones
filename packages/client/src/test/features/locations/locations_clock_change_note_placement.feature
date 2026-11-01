Feature: Clock change note placement on location rows
  Implements change show-clock-change-note-on-location-cards.
  As a user I see the clock change note in every kind of row, and a wall-time hint takes its place in its own row only.

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
