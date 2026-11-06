Feature: Deploy time in a real browser
  Implements change polish-settings-and-remove-offline-update-notice.
  As a user I read when the running build of the app was made, in the colour of the page icons, on any screen.

  @polish-settings-and-remove-offline-update-notice @NFR-A1 @M4
  Scenario Outline: The deploy time in the icon colour in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the user opens the settings
    Then the deploy time has the colour of the back button's icon
    And the deploy time is not a Tab stop
    And the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @polish-settings-and-remove-offline-update-notice @NFR-R1
  Scenario Outline: The deploy time fits one line at <width> px in <language>
    Given the screen is <width> px wide for the locations
    And the locations interface language is <language>
    And the stored preferences are theme System and hour format <hour format>
    And the user opens the settings
    Then the deploy time takes one line

    Examples:
      | width | language | hour format |
      | 375   | English  | 12-hour     |
      | 375   | Russian  | 24-hour     |
      | 1024  | English  | 12-hour     |
      | 1024  | Russian  | 24-hour     |

  @polish-settings-and-remove-offline-update-notice @NFR-R1
  Scenario Outline: The deploy time at 320 px in <language>
    Given the screen is 320 px wide for the locations
    And the locations interface language is <language>
    And the stored preferences are theme System and hour format <hour format>
    And the user opens the settings
    Then the settings page needs no horizontal scrolling

    Examples:
      | language | hour format |
      | English  | 12-hour     |
      | Russian  | 24-hour     |
