Feature: Select a time by tap on an engine without Pointer Events
  Implements change support-legacy-ios-12-safari.
  As a user of iOS Safari 12 I tap a day track and every card follows.

  @support-legacy-ios-12-safari @FR8 @UX1 @fix-day-track-drag-continuity-and-smoothness @FR5
  Scenario: A tap selects a time without Pointer Events
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    And the app is open
    And the engine has no Pointer Events
    When the user taps three quarters of the "New York" track
    Then the moment is pinned to "2026-03-08T13:00:00Z"
    And the "Almaty" card shows "18:00"

  @support-legacy-ios-12-safari @FR8 @fix-day-track-drag-continuity-and-smoothness @FR5
  Scenario: A click adds nothing where Pointer Events exist
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty, New York"
    And the app is open
    And the engine has Pointer Events
    When the user taps three quarters of the "New York" track
    Then the moment is not pinned
