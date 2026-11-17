Feature: Silent update of the app
  A data-only build is published as a file that names the app revision, which is not precached and not initial JavaScript.

  @apply-data-updates-silently @FR2 @NFR-P1
  Scenario: The file in the build
    Given a build with the app revision "c3"
    When the app revision file of the build is checked
    Then the file names the app revision "c3"
    And the file is at most 1 KB

  @apply-data-updates-silently @FR2 @NFR-P1
  Scenario: Not precached
    Given the precache manifest of the built service worker lists "app-revision.json"
    When the app revision file of the build is checked
    Then the check fails because the file is precached

  @apply-data-updates-silently @FR2 @NFR-P1
  Scenario: Not initial JavaScript
    Given the entry page of the build and its app revision file
    When the initial JavaScript of the build is collected
    Then "app-revision.json" is not among the initial scripts
