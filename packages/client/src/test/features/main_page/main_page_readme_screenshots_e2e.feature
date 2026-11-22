Feature: Approved screenshots shown in the README
  Implements change keep-location-menu-in-view-and-clear-range-after-share.
  The screenshots of the root README files are approved baselines, so they never go stale: a visual change of the app fails this feature until the baselines are approved again.

  @keep-location-menu-in-view-and-clear-range-after-share @FR8 @M4 @desktop-only
  Scenario Outline: README screenshot <name>
    Given the locations interface language is <language>
    And the view mode is <view>
    And the current time is "2026-03-08T07:30:00Z"
    And the list holds "Almaty", "Moscow", "Kolkata", "New York" and home is "Almaty"
    And the locations screen uses the <theme> theme
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    Then the locations screen matches the approved screenshot

    Examples:
      | name                   | view  | language | theme | width | height |
      | cards-phone-light-en   | Cards | English  | light | 390   | 844    |
      | cards-phone-dark-en    | Cards | English  | dark  | 390   | 844    |
      | cards-tablet-light-en  | Cards | English  | light | 820   | 1180   |
      | grid-desktop-light-en  | Grid  | English  | light | 1440  | 900    |
      | cards-phone-light-ru   | Cards | Russian  | light | 390   | 844    |
      | cards-phone-dark-ru    | Cards | Russian  | dark  | 390   | 844    |
      | cards-tablet-light-ru  | Cards | Russian  | light | 820   | 1180   |
      | grid-desktop-light-ru  | Grid  | Russian  | light | 1440  | 900    |

  @keep-location-menu-in-view-and-clear-range-after-share @FR8 @M4 @desktop-only
  Scenario Outline: README screenshot <name>
    Given the locations interface language is <language>
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the list holds "Almaty", "Moscow", "Kolkata", "New York" and home is "Almaty"
    And the locations screen uses the dark theme
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the locations screen matches the approved screenshot

    Examples:
      | name                         | language |
      | grid-desktop-meeting-dark-en | English  |
      | grid-desktop-meeting-dark-ru | Russian  |
