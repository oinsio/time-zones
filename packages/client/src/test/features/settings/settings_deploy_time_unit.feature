Feature: Deploy time on the settings page
  Implements change polish-settings-and-remove-offline-update-notice.
  As a user I see when the running build of the app was made, in my language, hour format and time zone.

  @polish-settings-and-remove-offline-update-notice @FR5 @M3
  Scenario Outline: The deploy time in the interface language
    Given the build was made at "2026-03-08T07:30:00.000Z"
    And the device time zone is "<zone>"
    When the settings page is shown in "<language>" with the hour format "<hour format>"
    Then the line after the language group reads "<text>"

    Examples:
      | zone         | language | hour format | text                               |
      | UTC          | English  | 24-hour     | Deployed March 8, 2026 at 07:30    |
      | UTC          | English  | 12-hour     | Deployed March 8, 2026 at 7:30 AM  |
      | UTC          | Russian  | 24-hour     | Развёрнуто 8 марта 2026 г. в 07:30 |
      | Asia/Kolkata | English  | 24-hour     | Deployed March 8, 2026 at 13:00    |

  @polish-settings-and-remove-offline-update-notice @FR5
  Scenario: The deploy time follows the settings at once
    Given the settings page shows the deploy time in English with the hour format 24-hour
    When the user chooses the hour format 12-hour
    Then the deploy time shows its time in the 12-hour format

  @polish-settings-and-remove-offline-update-notice @FR6
  Scenario: The deploy time is fixed into the build
    Given the app was built at an instant
    And the clock is a day later
    And the browser is offline
    When the settings page is shown
    Then the deploy time shows the build instant, not the current time
