Feature: Approved screenshots of the share dialog
  Implements change add-meeting-share-dialog.
  The share dialog looks the same on every run.

  @add-meeting-share-dialog @UX1 @UX2 @UX3 @UX4 @UX5 @NFR-R1
  Scenario Outline: Approved screenshots of the share dialog: <state> at <width> by <height> px in the <theme> theme
    Given the locations interface language is Russian
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the locations screen uses the <theme> theme
    And the screen is <width> by <height> px for the locations
    And a browser with a system share
    And the user opened the locations app with the sample meeting and the share dialog
    When the share dialog is in the state "<state>"
    Then the share dialog matches the approved screenshot
    And no row of the share dialog has a remove control

    Examples:
      | state                            | width | height | theme |
      | defaults                         | 390   | 844    | light |
      | Kolkata unticked, English pinned | 390   | 844    | dark  |
      | no location ticked               | 390   | 844    | light |
      | defaults                         | 1280  | 800    | light |
