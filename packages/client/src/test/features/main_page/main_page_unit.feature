Feature: Main page regions and notices
  Implements change add-main-page-scaffold.
  The main page keeps its regions and stacks notices without moving the header; connectivity and storage problems are told politely.

  @add-main-page-scaffold @FR1
  Scenario: User opens the app
    When the user opens the app
    Then the header shows the app title as the only heading
    And the content region shows the active view

  @add-main-page-scaffold @FR1 @FR8
  Scenario: Notices stay available
    Given a new version of the app is waiting
    When the user opens the app
    Then the update notice is announced politely in the notices region

  @add-main-page-scaffold @FR1 @UX3
  Scenario: Header keeps its position
    Given the update check has failed and storage is unavailable
    When the user opens the app
    Then the notices are out of the document flow
    And the header is not part of the notices

  @add-main-page-scaffold @FR8 @NFR-A2
  Scenario: Update cannot be fetched
    Given the update check fails because the network is unreachable
    When the user opens the app
    Then the update-check-failed note is announced politely
    And the view stays usable

  @add-main-page-scaffold @FR8
  Scenario: Offline without a pending check
    Given the user has opened the app
    When the browser goes offline
    Then no note is shown

  @add-main-page-scaffold @FR8
  Scenario: Connection restored
    Given the update check failed and the browser is offline
    When the browser goes back online
    Then the update-check-failed note disappears

  @add-main-page-scaffold @FR9 @NFR-A2
  Scenario: Private mode
    Given writing to local storage fails
    When the user opens the app
    Then the storage warning is shown
    And the view is still shown

  @add-main-page-scaffold @FR10
  Scenario: Russian user sees the empty state
    Given the active UI language is ru
    When the user opens the app with no locations
    Then the empty state explanation is shown in Russian
