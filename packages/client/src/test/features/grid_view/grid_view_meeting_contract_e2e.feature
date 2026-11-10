Feature: Meeting range in every view that shows it
  Implements change add-grid-meeting-range-and-share.
  Picking, resizing, sharing and clearing a meeting is part of the view contract
  for the views that show the meeting range: this scenario runs once for each of
  them and names none, and a view without the meeting range never runs it.

  Background:
    Given a browser without a system share
    And the view under contract is shown
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"

  @add-grid-meeting-range-and-share @view-contract @meeting-range @FR17
  Scenario: Set, resize, share and clear
    When the user taps column 9 of "Almaty"
    Then the meeting range is from "09:00" to "10:00"
    When the user presses "PageUp" on the end handle
    Then the meeting range is from "09:00" to "11:00"
    When the user chooses Share meeting
    Then the clipboard holds the meeting share text
    When the user clears the meeting
    Then no meeting range is set
    And the hour frame is on column 9
