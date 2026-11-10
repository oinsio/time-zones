Feature: Main page Grid view
  Implements change add-view-mode-setting-and-grid-skeleton and add-grid-hour-cells-and-hour-frame.
  The Grid view shows the location rows with the shared row headers, each over its hour strip.

  @add-view-mode-setting-and-grid-skeleton @FR7 @UX3
  @add-grid-hour-cells-and-hour-frame @FR1
  Scenario: Rows in one panel with hour strips
    Given the view mode is Grid and the stored locations are Almaty and Moscow
    When the main page is shown
    Then the Grid view shows the rows of Almaty and Moscow, in this order, inside one panel
    And every row has an hour strip after its row header and no day track

  @add-view-mode-setting-and-grid-skeleton @FR7
  Scenario: Typing a time in Grid
    Given the view mode is Grid, the current time is "2026-03-08T07:30:00Z" and the stored locations are Almaty and Moscow
    When the user types "1145" into the time of Moscow
    Then Almaty shows "13:45" and Moscow shows "11:45"

  @add-view-mode-setting-and-grid-skeleton @FR7
  Scenario: Empty Grid
    Given the view mode is Grid and the stored location list is empty
    When the main page is shown
    Then it shows the empty-state explanation
    And the header "Add location" action is available
    And no hour strip and no hour frame are shown

  @add-view-mode-setting-and-grid-skeleton @FR7
  Scenario: Unreadable list in Grid
    Given the view mode is Grid and the stored location list is unreadable
    When the main page is shown
    Then it shows the load error with a Reset action

  @add-view-mode-setting-and-grid-skeleton @FR4 @UX2
  Scenario: Switching keeps the selected moment
    Given the current time is "2026-03-08T07:30:00Z" and the stored locations are Almaty and Moscow
    And the user chose the next day in Cards
    When the user chooses Grid in the settings
    Then the row of Almaty still carries the next day
