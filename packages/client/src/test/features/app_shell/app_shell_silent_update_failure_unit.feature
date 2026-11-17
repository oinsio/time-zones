Feature: Silent update of the app when the app revision cannot be read
  A waiting build whose app revision file cannot be read raises no notice and is read again at the next check.

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

