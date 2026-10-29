Feature: Check for a new version when the app returns to the screen
  Implements change support-legacy-ios-12-safari.
  As the owner of an installed app on iOS, which never restarts it, I get the
  update notice after I switch back to the app, at most every 15 minutes.

  @support-legacy-ios-12-safari @FR10
  Scenario: Returning to the app checks again
    Given the app was opened and checked for a new version
    When the user returns to the app after 16 minutes
    Then the app has checked for a new version 2 times

  @support-legacy-ios-12-safari @FR10
  Scenario: Returning soon after a check does not check
    Given the app was opened and checked for a new version
    When the user returns to the app after 5 minutes
    Then the app has checked for a new version 1 times

  @support-legacy-ios-12-safari @FR10
  Scenario: Hiding the page does not check
    Given the app was opened and checked for a new version
    When the user leaves the app and 16 minutes pass
    Then the app has checked for a new version 1 times

  @support-legacy-ios-12-safari @FR10
  Scenario: A check on return fails offline
    Given the app was opened and the next check will fail because the network is unreachable
    And no update-check failure note is shown
    When the user returns to the app after 16 minutes
    Then the update-check failure note is shown
