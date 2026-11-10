Feature: Locked row controls and the meeting range input in the Grid view
  Implements change fix-grid-meeting-range-lock-and-layering.
  As a user I type the meeting in the time of any location, and the controls that would change the time or the list stay locked while the meeting is set.

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @UX1
  Scenario: Controls are locked during the meeting and free after it
    Given the Grid view with Almaty, Moscow, Kolkata and New York at "2026-03-08T07:30:00Z"
    When the user sets the meeting range 09:00–11:00 in Almaty
    Then every drag handle and every location menu button is disabled and dimmed
    And no row offers the wall-time input
    When the user clears the meeting range
    Then every drag handle and every location menu button is enabled
    And every row's time opens the wall-time input

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @UX1
  Scenario: Setting a meeting range closes an open location menu
    Given the Grid view with Almaty and Moscow and Moscow's location menu open
    When the user taps column 9 of Almaty
    Then the meeting range is 09:00–10:00 in Almaty and no location menu is open

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @UX1
  Scenario: Cards keeps its controls with a meeting range
    Given the meeting range 09:00–11:00 in Almaty was set in Grid
    When the view mode is changed to Cards
    Then every drag handle and every location menu button is enabled and every time opens the wall-time input

  @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @FR3
  Scenario: No wall-time input in Grid while a meeting range is set
    Given the Grid view with Almaty and Moscow and the meeting range 09:00–11:00 in Almaty on 2026-03-08
    When the user activates Moscow's span
    Then the meeting range input of Moscow opens and no wall-time input opens
    When the user clears the meeting range and activates Moscow's time
    Then the wall-time input of Moscow opens
