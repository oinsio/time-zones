Feature: App shell with offline and update notices
  Implements change setup-app-shell-and-pages-deploy; the registry scenario is
  updated by add-main-page-scaffold (FR1).
  The shell names the app in the user's language, tells the user when the app
  works offline or a new version is waiting, and recovers from unexpected errors.

  @setup-app-shell-and-pages-deploy @FR2
  Scenario Outline: User sees the app title in their language
    Given the active UI language is <language>
    When the user opens the app
    Then the page heading reads "<title>"
    And the document title reads "<title>"
    And the page language is <language>

    Examples:
      | language | title         |
      | en       | Time Zones    |
      | ru       | Часовые пояса |

  @setup-app-shell-and-pages-deploy @FR11
  Scenario: Shell with no registered views
    Given no views are registered
    When the user opens the app
    Then the app title is shown with an empty content region
    And no error is reported

  @setup-app-shell-and-pages-deploy @FR6
  Scenario: App becomes ready to work offline
    Given the app is ready to work offline for the first time
    When the user opens the app
    Then the offline-ready notice is announced politely

  @setup-app-shell-and-pages-deploy @FR6
  Scenario: User dismisses the offline-ready notice
    Given the app is ready to work offline for the first time
    And the user has opened the app
    When the user dismisses the notice
    Then the notice is cleared

  @setup-app-shell-and-pages-deploy @FR7
  Scenario: New version becomes available
    Given a new version of the app is waiting
    When the user opens the app
    Then the update notice is announced politely with a reload action
    And the app has not reloaded by itself

  @setup-app-shell-and-pages-deploy @FR7
  Scenario: User accepts the update
    Given a new version of the app is waiting
    And the user has opened the app
    When the user chooses to reload into the new version
    Then the app switches to the new version

  @setup-app-shell-and-pages-deploy @FR7
  Scenario: User postpones the update
    Given a new version of the app is waiting
    And the user has opened the app
    When the user dismisses the notice
    Then the notice is cleared
    And the app has not reloaded by itself

  @setup-app-shell-and-pages-deploy @FR7 @NFR-A2
  Scenario: User postpones the update from the keyboard
    Given a new version of the app is waiting
    And the user has opened the app
    When the user presses Escape
    Then the notice is cleared

  @setup-app-shell-and-pages-deploy @FR8
  Scenario: A part of the page fails to render
    Given a part of the page fails to render
    When the user opens the app
    Then the recovery screen explains the problem in plain language
    And it offers a reload action

  @setup-app-shell-and-pages-deploy @FR8
  Scenario: User recovers by reloading
    Given a part of the page fails to render
    And the user has opened the app
    When the user chooses to reload the app
    Then the app is loaded again
