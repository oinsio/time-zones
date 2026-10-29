Feature: Day track by finger tap on an engine without Pointer Events
  Implements change support-legacy-ios-12-safari.
  As a user of iOS Safari 12 I tap a track to pick a time, and the slider keeps its name, range and keys.

  @support-legacy-ios-12-safari @FR8 @NFR-A2 @UX1
  Scenario: A finger tap keeps the slider accessible without Pointer Events
    Given the engine has no Pointer Events
    And the current time is "2026-03-08T07:30:00Z"
    And the screen is 375 px wide for the locations
    And the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    When the user taps 75 percent of the "Almaty" track with a finger
    Then the card of "Almaty" shows the time "18:00"
    And the slider of "Almaty" keeps its role, name and range
    When the user presses ArrowRight on the slider of "Almaty"
    Then the slider of "Almaty" moved one track step
