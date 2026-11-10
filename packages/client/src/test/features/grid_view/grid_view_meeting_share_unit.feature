Feature: Sharing the meeting from the Grid view
  Implements change add-grid-meeting-range-and-share.
  As a user I share the picked meeting through the system share or the clipboard.

  @add-grid-meeting-range-and-share @FR15
  Scenario: Share where the browser can share
    Given a browser with a system share and the Grid view with the sample meeting
    When the user chooses "Share meeting"
    Then the system share receives the meeting share text and no notice is shown

  @add-grid-meeting-range-and-share @FR15
  Scenario: Closing the share sheet
    Given a browser whose system share reports that the user closed the sheet
    When the user chooses "Share meeting"
    Then nothing changes and no notice is shown

  @add-grid-meeting-range-and-share @FR15
  Scenario: Copy where the browser cannot share
    Given a browser without a system share and the Grid view with the sample meeting
    When the user chooses "Share meeting"
    Then the clipboard holds the meeting share text
    And the notice "Meeting text copied" is shown and the focus stays on "Share meeting"

  @add-grid-meeting-range-and-share @FR15
  Scenario: Neither share nor clipboard
    Given a browser without a system share and without clipboard access
    When the user chooses "Share meeting"
    Then the notice "Could not share the meeting" is shown
