Feature: Main page view states
  Implements change add-main-page-scaffold.
  The content region shows loading, error, retry and empty states of the active view.

  @add-main-page-scaffold @FR5 @UX1
  Scenario: View is loading
    Given the active view has not finished loading
    When the user opens the app
    Then a skeleton is shown in the content region
    And the app title is visible

  @add-main-page-scaffold @FR6 @NFR-A2 @UX1
  Scenario: View fails
    Given the active view fails to load
    When the user opens the app
    Then an error message with a Retry action is announced
    And the app title stays visible

  @add-main-page-scaffold @FR6
  Scenario: User retries
    Given the active view failed to load and the failure cause is gone
    When the user activates Retry
    Then the view is shown

  @add-main-page-scaffold @FR7 @UX1
  @add-settings-page-and-device-time-location @FR2 @FR13
  Scenario: Empty list
    Given the stored location list is empty
    When the user opens the app
    Then the explanation is shown in the current language
    And no location row is shown
    And the header shows the Add location button

  @add-main-page-scaffold @FR7 @UX1
  @add-settings-page-and-device-time-location @FR13
  Scenario: First launch
    Given no location list is stored
    When the user opens the app
    Then the device time location is shown
    And the explanation is not shown
    And no location list is stored

  @add-settings-page-and-device-time-location @FR13
  Scenario: No explanation with locations
    Given the stored list is the device time location and Moscow
    When the user opens the app
    Then the explanation is not shown

  @add-locations-via-search @FR17
  @add-settings-page-and-device-time-location @FR2
  Scenario: Add location from the empty state
    Given the location list is empty
    When the user chooses the header's Add location button
    Then the search opens with popular suggestions
