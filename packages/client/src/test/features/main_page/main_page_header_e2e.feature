Feature: Main page header in a real browser
  Implements change add-settings-page-and-device-time-location.
  As a user I add a location and open the settings from the header on every
  screen size, with a mouse, a finger and the keyboard.

  @add-settings-page-and-device-time-location @FR2 @NFR-R1 @UX1
  Scenario: Narrow header
    Given the locations interface language is Russian
    And the screen is 375 px wide for the locations
    When the user opens the locations app
    Then the header shows, from left to right, the button named "Добавить место", the title "Часовые пояса" and the button named "Настройки"
    And the button named "Добавить место" shows no visible text

  @add-settings-page-and-device-time-location @FR2 @NFR-R1 @UX1
  Scenario: Wide header
    Given the locations interface language is Russian
    And the screen is 1024 px wide for the locations
    When the user opens the locations app
    Then the header shows, from left to right, the title "Часовые пояса", the button named "Добавить место" and the button named "Настройки"
    And the button named "Добавить место" shows the visible text "Добавить"

  @add-settings-page-and-device-time-location @FR1 @FR2
  Scenario: The header opens the search and the settings
    Given the stored locations are "Moscow"
    And the user opens the locations app
    When the user chooses the header button named "Add location"
    Then the search is open with focus in an empty query field
    When the user closes the search with Esc and chooses the header button named "Settings"
    Then the settings page is shown

  @add-settings-page-and-device-time-location @FR3
  Scenario: Slash still opens the search
    Given the stored locations are "Moscow"
    And the user opens the locations app
    When the user presses "/" on the main page
    Then the search is open with focus in an empty query field

  @add-settings-page-and-device-time-location @FR3
  Scenario: Settings page shown
    Given the stored locations are "Moscow"
    And the user opens the locations app
    When the user chooses the header button named "Settings"
    And the user presses "/"
    Then the settings page is shown
    And the search does not open

  @add-settings-page-and-device-time-location @FR2
  Scenario: One Add location button
    Given the stored locations are "Moscow"
    When the user opens the locations app
    Then exactly one button is named "Add location"

  @add-settings-page-and-device-time-location @FR2
  Scenario: No Add location button on an unreadable list
    Given the stored list is unreadable
    When the user opens the locations app
    Then the load error with Reset is shown
    And the header shows the button named "Settings" and no button named "Add location"

  @add-settings-page-and-device-time-location @NFR-A1 @NFR-A2 @NFR-A3 @NFR-R1 @UX1 @M1
  Scenario Outline: Header sizes and accessibility at <width> px in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then both header buttons are at least 44 by 44 px
    And the locations screen has no accessibility violations

    Examples:
      | width | theme |
      | 375   | light |
      | 375   | dark  |
      | 1024  | light |
      | 1024  | dark  |
