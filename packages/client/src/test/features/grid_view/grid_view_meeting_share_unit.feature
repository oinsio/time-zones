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

  @keep-location-menu-in-view-and-clear-range-after-share @FR5 @FR7 @M3
  Scenario Outline: The ways out of the share dialog
    Given the Grid view with the meeting range 09:00–11:00 in Almaty and the share dialog open
    When the user leaves the dialog by <way>
    Then the share dialog is <dialog> and the meeting range is <range>

    Examples:
      | way                                         | dialog | range       |
      | "Share" with the outcome shared             | closed | none        |
      | the close button                            | closed | 09:00–11:00 |
      | Esc                                         | closed | 09:00–11:00 |
      | "Share" with the outcome cancelled          | open   | 09:00–11:00 |
      | "Share" with the outcome copied             | closed | 09:00–11:00 |
      | "Share" with the outcome failed             | closed | 09:00–11:00 |

  @keep-location-menu-in-view-and-clear-range-after-share @FR5
  Scenario: A shared meeting stores nothing
    Given the meeting range 09:00–11:00 in Almaty and the share dialog open
    When the share ends with the outcome shared
    Then the location list and the preferences are unchanged
