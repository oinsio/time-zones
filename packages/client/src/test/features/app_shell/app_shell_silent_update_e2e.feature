@mode:serial
Feature: Silent update of the app in a real browser
  As a user I am told about a new build only when the app itself changed; a build that carries only data waits quietly and runs at the next start.

  @apply-data-updates-silently @FR3 @FR4 @M1
  Scenario: A data-only build is waiting
    Given build A of the app is running and controls the page
    When a data-only build is published and the app checks for a new build
    Then the data-only build is waiting
    And the notices region stays empty

  @apply-data-updates-silently @FR3 @M1
  Scenario: A silent update is in use at the next start
    Given build A of the app is running and controls the page
    And a data-only build is published and waiting
    When every window of the app is closed and the app is started again
    Then the app runs the data-only build
    And the settings page names the deploy time of the data-only build

  @apply-data-updates-silently @FR3 @M1
  Scenario: Reloading does not switch to a silent update
    Given build A of the app is running and controls the page
    And a data-only build is published and waiting
    When the user reloads the page
    Then the app runs build A
    And the notices region stays empty

  @apply-data-updates-silently @FR3 @FR4 @M1
  Scenario: New version becomes available
    Given build A of the app is running and controls the page
    When a build with another app revision is published and the app checks for a new build
    Then the update notice is shown with a reload action
    And the app still runs build A

  @apply-data-updates-silently @FR11 @M1
  Scenario: Reload applies a silent update too
    Given build A of the app is running and controls the page
    And a data-only build is published and waiting
    And a newer zone rules release is published and the app checks for it
    When the user chooses Reload on the zone rules update notice
    Then the app runs the data-only build

  @apply-data-updates-silently @NFR-A1
  Scenario Outline: No accessibility violations with the update notice in the <color scheme> theme
    Given the system prefers the <color scheme> color scheme for the update notice
    And build A of the app is running and controls the page
    When a build with another app revision is published and the app checks for a new build
    Then the update notice is shown with a reload action
    And axe-core finds no violations with the update notice shown

    Examples:
      | color scheme |
      | light        |
      | dark         |
