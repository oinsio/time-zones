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
  Scenario: First launch
    Given the active UI language is en
    When the user opens the app with no locations
    Then the empty state explanation is shown in the current language
