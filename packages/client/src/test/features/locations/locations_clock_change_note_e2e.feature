Feature: Clock change note in a real browser
  Implements change show-clock-change-note-on-location-cards.
  The clock change note is readable text at the bottom of its card, not announced, and fits every screen.

  @show-clock-change-note-on-location-cards @FR2 @NFR-A1 @UX1
  Scenario: The note is not announced
    Given the current time is "2026-10-20T08:00:00Z"
    And the stored locations are "Almaty", "Belgrade"
    When the user opens the locations app
    Then the "Belgrade" card shows "On Oct 25 at 03:00 clocks will go back 1 h" as its bottom line
    And the note of "Belgrade" is not inside a live region and has no status role
    And the accessible name of the "Belgrade" row does not contain its note
    And the "Almaty" card shows no clock change note

  @show-clock-change-note-on-location-cards @UX1
  Scenario: Showing the note moves nothing in its card
    Given the current time is "2026-10-10T08:00:00Z"
    And the screen is 1024 px wide for the locations
    And the stored locations are "Almaty", "Belgrade"
    And the user opens the locations app
    And the "Belgrade" card shows no clock change note
    And the place, time, track and menu of "Belgrade" are noted
    When the user picks "Tuesday, October 20, 2026" in the calendar
    Then the "Belgrade" card shows a clock change note
    And the place, time, track and menu of "Belgrade" have not moved

  @show-clock-change-note-on-location-cards @NFR-A2 @FR6
  Scenario Outline: No accessibility violations with notes in the <theme> theme
    Given the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "New York", "Chicago"
    And the locations screen uses the <theme> theme
    And the user opens the locations app
    When the page shows a GAP hint
    Then the "New York" card shows the wall-time hint and no clock change note
    And the "Chicago" card shows a clock change note
    And the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @show-clock-change-note-on-location-cards @NFR-R1 @UX1
  @show-city-labels-in-interface-language @FR1
  Scenario Outline: No horizontal scrolling with notes at <width> px at <moment>
    Given the current time is "<moment>"
    And the locations interface language is Russian
    And the screen is <width> px wide for the locations
    And the stored locations are "Алматы", "Белград", "Лорд-Хау"
    When the user opens the locations app
    Then the locations screen does not scroll horizontally
    And the clock change note of "<city>" is the bottom line of its card

    Examples:
      | width | moment               | city             |
      | 320   | 2026-10-20T08:00:00Z | Белград           |
      | 320   | 2026-10-01T08:00:00Z | Лорд-Хау          |
      | 768   | 2026-10-20T08:00:00Z | Белград           |
      | 768   | 2026-10-01T08:00:00Z | Лорд-Хау          |
      | 2560  | 2026-10-20T08:00:00Z | Белград           |
      | 2560  | 2026-10-01T08:00:00Z | Лорд-Хау          |
