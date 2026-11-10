Feature: Share meeting from the Grid view in a real browser
  Implements change add-grid-meeting-range-and-share.
  Share meeting sends the meeting share text by the system share, or copies it, and the meeting state is accessible.

  Background:
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations

  @add-grid-meeting-range-and-share @FR15
  Scenario: Share where the browser can share
    Given a browser with a system share
    When the user opens the locations app
    And the user sets the sample meeting
    And the user chooses Share meeting
    Then the system share received a text without a link, exactly these lines:
      | line                                               |
      | Meeting on Sunday, March 8, 2026, 2 h              |
      | Almaty: 09:00–11:00                                |
      | Moscow: 07:00–09:00                                |
      | Kolkata: 09:30–11:30                               |
      | New York: 23:00–01:00 (a day earlier, Sat, Mar 7)  |
    And no share notice is shown

  @add-grid-meeting-range-and-share @FR15
  Scenario: Closing the share sheet
    Given a browser whose system share reports that the user closed the sheet
    When the user opens the locations app
    And the user sets the sample meeting
    And the user chooses Share meeting
    Then no share notice is shown
    And the meeting range is from "09:00" to "11:00"

  @add-grid-meeting-range-and-share @FR15 @NFR-A2
  Scenario: Copy where the browser cannot share
    Given a browser without a system share
    When the user opens the locations app
    And the user sets the sample meeting
    And the user chooses Share meeting
    Then the clipboard holds the meeting share text
    And the share notice "Meeting text copied" is shown
    And the focus stays on Share meeting

  @add-grid-meeting-range-and-share @FR15
  Scenario: Neither share nor clipboard
    Given a browser without a system share and without clipboard access
    When the user opens the locations app
    And the user sets the sample meeting
    And the user chooses Share meeting
    Then the share notice "Could not share the meeting" is shown

  @add-grid-meeting-range-and-share @NFR-A1 @NFR-A2
  Scenario Outline: No accessibility violations in the meeting state in the <theme> theme
    Given a browser without a system share
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    And the user sets the sample meeting
    Then the meeting state has no accessibility violations
    When the user chooses Share meeting
    Then the share notice "Meeting text copied" is shown
    And the meeting state has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @add-grid-meeting-range-and-share @NFR-A1
  Scenario: Tab order of the meeting state
    When the user opens the locations app
    And the user sets the sample meeting
    Then tabbing from Share meeting visits Share meeting, Clear meeting, the rows' controls, Meeting start and Meeting end in this order
