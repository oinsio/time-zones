Feature: Silent update of the app
  A waiting build with the running build's app revision raises no notice; the app revision file is read only while a build is waiting.

  @apply-data-updates-silently @FR3 @UX1
  Scenario: A data-only build is waiting
    Given the running build has the app revision "a1"
    When a build is waiting and the app revision file names "a1"
    Then the notices region stays empty
    And the page keeps working without reloading

  @apply-data-updates-silently @FR3 @FR5
  Scenario: An app change arrives after a silent update
    Given the running build has the app revision "a1"
    And a build is waiting and the app revision file names "a1"
    When a later check finds that the app revision file names "b2"
    Then the update notice is shown

  @apply-data-updates-silently @FR5 @NFR-P1 @M4
  Scenario: No build is waiting
    Given no build is waiting
    When the app starts and later returns to the screen after 16 minutes
    Then the app revision file was not requested

  @apply-data-updates-silently @FR5 @NFR-P1 @M4
  Scenario: The app revision is read once per check
    Given the running build has the app revision "a1"
    And a build is waiting and the app revision file names "a1"
    When the page becomes visible after 16 minutes
    Then the app revision file is requested exactly once for that check
    And a return 5 minutes after that requests nothing

  @apply-data-updates-silently @FR6 @UX2
  Scenario Outline: The app revision cannot be read
    Given a build is waiting and <failure>
    When the app reads the app revision file
    Then the notices region stays empty
    And the next check reads the file again

    Examples:
      | failure                          |
      | the device is offline            |
      | the request fails                |
      | the file returns status 404      |
      | the file is not JSON             |
      | the file names no revision       |

  @apply-data-updates-silently @FR6 @UX2
  Scenario: A shown notice survives a failed read
    Given the update notice is shown
    When a later read of the app revision file fails
    Then the update notice stays shown

  @apply-data-updates-silently @FR7
  Scenario Outline: A dismissed notice returns for yet another revision
    Given the user dismissed the update notice while the app revision file named "b2"
    When a later check finds that the file names "<revision>"
    Then the update notice is <shown>

    Examples:
      | revision | shown     |
      | b2       | not shown |
      | c3       | shown     |
