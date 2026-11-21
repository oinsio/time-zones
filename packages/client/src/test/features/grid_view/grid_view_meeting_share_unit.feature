Feature: Sharing the meeting from the Grid view
  Implements changes add-grid-meeting-range-and-share and add-meeting-share-dialog.
  As a user I open the share dialog from the meeting bar and share the picked meeting through the system share or the clipboard.

  @add-meeting-share-dialog @FR1 @FR9
  Scenario: Share meeting opens the share dialog
    Given a browser with a system share and the Grid view with the sample meeting
    When the user chooses "Share meeting"
    Then the share dialog is open
    And the system share has received nothing and the clipboard is unchanged

  @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR9
  Scenario: Share where the browser can share
    Given a browser with a system share and the share dialog open for the sample meeting
    When the user chooses "Share" in the dialog
    Then the system share receives the meeting share text and no notice is shown

  @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR9
  Scenario: Closing the share sheet
    Given a browser whose system share reports that the user closed the sheet and the share dialog open for the sample meeting
    When the user chooses "Share" in the dialog
    Then the share dialog stays open and no notice is shown

  @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR9
  Scenario: Copy where the browser cannot share
    Given a browser without a system share and the share dialog open for the sample meeting
    When the user chooses "Share" in the dialog
    Then the clipboard holds the meeting share text
    And the share dialog is closed and the notice "Meeting text copied" is shown

  @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR9
  Scenario: Neither share nor clipboard
    Given a browser without a system share and without clipboard access and the share dialog open for the sample meeting
    When the user chooses "Share" in the dialog
    Then the share dialog is closed and the notice "Could not share the meeting" is shown

  @add-grid-meeting-range-and-share @FR15 @add-meeting-share-dialog @FR1 @FR9
  Scenario: Opening the dialog again removes the notice
    Given the notice "Meeting text copied" is shown
    When the user chooses "Share meeting"
    Then the notice is gone and the share dialog is open
