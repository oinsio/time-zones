Feature: Share meeting from the Grid view in a real browser
  Implements changes add-grid-meeting-range-and-share and add-meeting-share-dialog.
  Share meeting opens a dialog that sends the meeting share text by the system share, or copies it, and the meeting state is accessible.

  Background:
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations

  @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR9 @keep-location-menu-in-view-and-clear-range-after-share @FR5 @FR6 @NFR-A3
  Scenario: Share where the browser can share
    Given a browser with a system share
    When the user opens the locations app
    And the user sets the sample meeting
    And the user chooses Share meeting
    And the user chooses Share in the dialog
    Then the system share received a text without a link, exactly these lines:
      | line                                                           |
      | Meeting on Sunday, March 8, 2026, 2 h                          |
      | Almaty (UTC+5): 09:00–11:00                                    |
      | Moscow (MSK, UTC+3): 07:00–09:00                               |
      | Kolkata (IST, UTC+5:30): 09:30–11:30                           |
      | New York (EST, UTC−5): 23:00–01:00 (a day earlier, Sat, Mar 7) |
    And no share notice is shown
    And no meeting range is set
    And focus is on the "Add location" action

  @keep-location-menu-in-view-and-clear-range-after-share @FR5 @UX3
  Scenario: After a shared meeting the Grid view is back to normal
    Given a browser with a system share
    When the user opens the locations app
    And the user sets the sample meeting
    And the user chooses Share meeting
    And the user chooses Share in the dialog
    Then the page header shows the app title again
    And no meeting range is set
    And every location menu button is enabled
    And no share notice is shown

  @keep-location-menu-in-view-and-clear-range-after-share @FR7
  Scenario: Closing with the close button keeps the meeting
    Given a browser with a system share
    When the user opens the locations app
    And the user sets the sample meeting
    And the user chooses Share meeting
    And the user closes the share dialog with the close button
    Then the share dialog is closed
    And the meeting range is from "09:00" to "11:00"

  @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR9
  Scenario: Closing the share sheet
    Given a browser whose system share reports that the user closed the sheet
    When the user opens the locations app
    And the user sets the sample meeting
    And the user chooses Share meeting
    And the user chooses Share in the dialog
    Then the share dialog stays open
    And no share notice is shown

  @add-grid-meeting-range-and-share @FR15 @NFR-A2 @add-meeting-share-dialog @FR9
  Scenario: Copy where the browser cannot share
    Given a browser without a system share
    When the user opens the locations app
    And the user sets the sample meeting
    And the user chooses Share meeting
    And the user chooses Share in the dialog
    Then the clipboard holds the meeting share text
    And the share notice "Meeting text copied" is shown
    And the share dialog is closed
    And the focus returns to Share meeting

  @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR9
  Scenario: Neither share nor clipboard
    Given a browser without a system share and without clipboard access
    When the user opens the locations app
    And the user sets the sample meeting
    And the user chooses Share meeting
    And the user chooses Share in the dialog
    Then the share notice "Could not share the meeting" is shown

  @add-grid-meeting-range-and-share @NFR-A1 @NFR-A2
  Scenario Outline: No accessibility violations in the meeting state in the <theme> theme
    Given a browser without a system share
    And the locations screen uses the <theme> theme
    When the user opens the locations app
    And the user sets the sample meeting
    Then the meeting state has no accessibility violations
    When the user chooses Share meeting
    And the user chooses Share in the dialog
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
