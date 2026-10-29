Feature: Missing browser APIs on a legacy engine
  Implements change support-legacy-ios-12-safari.
  As a user of iOS Safari 12 I see the same views, with the country names and motion preferences the engine cannot give left out.

  @support-legacy-ios-12-safari @FR5 @UX3
  Scenario: Rows without country names
    Given the environment has no country names
    And the list contains "Almaty"
    When the rows are presented
    Then the "Almaty" row has an empty country name
    And no error is thrown

  @support-legacy-ios-12-safari @FR5 @UX3
  Scenario: Search results without country names
    Given the environment has no country names
    When the user searches for "Almaty"
    Then "Almaty" is among the presented results with an empty country name

  @support-legacy-ios-12-safari @FR6
  Scenario: View selection without ResizeObserver
    Given the environment has no native width observation
    When the app starts
    Then width observation is available to the app
    And the Cards view is shown

  @support-legacy-ios-12-safari @FR7
  Scenario: Preference followed through addListener
    Given the reduced-motion query list has only the old listener methods
    And the reduced-motion preference is off
    When the reduced-motion preference turns on
    Then the app treats motion as reduced

  @support-legacy-ios-12-safari @FR7
  Scenario: Listener removed on unmount
    Given the reduced-motion query list has only the old listener methods
    When the component that reads the preference unmounts
    Then its listener is removed
