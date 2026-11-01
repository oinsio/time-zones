Feature: Settings page in a real browser
  Implements change add-settings-page-and-device-time-location.
  As a user I open the settings, choose a theme and an hour format with a
  mouse, a finger or the keyboard, and the app keeps my choices.

  @add-settings-page-and-device-time-location @FR1 @UX2
  Scenario: Open and leave settings
    Given the current time is "2026-03-09T07:30:00Z"
    And the stored locations are "Moscow"
    And the user opens the locations app
    When the user chooses the header button named "Settings"
    Then the settings page is shown
    And the date bar is not shown
    And the focus is on the settings heading
    When the user goes back from the settings
    Then the focus is on the settings button
    And the date bar is shown

  @add-settings-page-and-device-time-location @FR1
  Scenario: Esc leaves settings
    Given the stored locations are "Moscow"
    And the user opens the locations app
    And the user chooses the header button named "Settings"
    When the user presses Escape
    Then the focus is on the settings button
    And the date bar is shown

  @add-settings-page-and-device-time-location @FR3 @NFR-A1
  Scenario: Arrow keys change the theme
    Given the system colour scheme is light
    And the user opens the settings
    When the user focuses the "System" option and presses "ArrowUp"
    Then the option "Dark" is checked
    And the page background is the dark token colour

  @add-settings-page-and-device-time-location @FR3 @FR5 @NFR-A1
  Scenario: Names and checked state
    Given the user opens the settings
    Then the option "System" of the group "Theme" is checked
    And the option "24-hour" of the group "Hour format" is checked
    And the options "Light", "Dark" and "System" are named in the group "Theme"

  @add-settings-page-and-device-time-location @FR16 @add-gnomish-factory-credit @FR2
  Scenario Outline: Both languages
    Given the locations interface language is <language>
    And the user opens the settings
    Then the settings heading is "<heading>"
    And the groups are named "<theme>" and "<hour format>"
    And the Gnomish Factory credit is "<credit>"

    Examples:
      | language | heading   | theme | hour format    | credit                             |
      | Russian  | Настройки | Тема  | Формат времени | Создано с помощью Гномской фабрики |
      | English  | Settings  | Theme | Hour format    | Built with Gnomish Factory         |

  @add-settings-page-and-device-time-location @NFR-A1 @NFR-A3 @add-gnomish-factory-credit @NFR-A1 @move-and-restyle-gnomish-factory-credit @NFR-A2
  Scenario Outline: Settings have no accessibility violations in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the user opens the settings
    Then the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @add-settings-page-and-device-time-location @NFR-A1 @FR7 @move-and-restyle-gnomish-factory-credit @NFR-A2
  Scenario: No violations with the unreadable note
    Given the stored preferences are unreadable
    And the user opens the settings
    Then the settings show the unreadable note with Reset
    And the locations screen has no accessibility violations

  @add-settings-page-and-device-time-location @NFR-R1 @add-gnomish-factory-credit @NFR-R1
  Scenario Outline: Settings fit a screen <width> px wide
    Given the screen is <width> px wide for the locations
    And the user opens the settings
    Then the settings page needs no horizontal scrolling
    And every settings option is at least 44 px high

    Examples:
      | width |
      | 320   |
      | 2560  |

  @add-settings-page-and-device-time-location @NFR-R3 @M6 @add-gnomish-factory-credit @NFR-R2 @move-and-restyle-gnomish-factory-credit @NFR-R2
  Scenario Outline: Approved screenshots of the settings at <width> px in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    And the user opens the settings
    Then the locations screen matches the approved screenshot

    Examples:
      | width | theme |
      | 375   | light |
      | 375   | dark  |
      | 1024  | light |
      | 1024  | dark  |

  @add-settings-page-and-device-time-location @FR4
  Scenario: Dark on a light system
    Given the system colour scheme is light
    And the user opens the settings
    When the user chooses the option "Dark"
    Then the page background is the dark token colour

  @add-settings-page-and-device-time-location @FR4
  Scenario: Light on a dark system
    Given the system colour scheme is dark
    And the user opens the settings
    When the user chooses the option "Light"
    Then the page background is the light token colour

  @add-settings-page-and-device-time-location @FR4
  Scenario: System follows a change of the system preference
    Given the system colour scheme is light
    And the user opens the settings
    When the user chooses the option "System"
    And the system colour scheme becomes dark
    Then the page background is the dark token colour

  @add-settings-page-and-device-time-location @FR4 @FR7
  Scenario: Stored Dark on a light system
    Given the system colour scheme is light
    And the stored preferences are theme Dark and hour format 12-hour
    And the stored theme is recorded when the header first appears
    When the user opens the locations app
    Then the dark theme was applied when the header first appeared

  @add-settings-page-and-device-time-location @FR5 @UX5
  Scenario: Switching to 12-hour
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is 1024 px wide for the locations
    And the stored locations are "Almaty", "New York"
    And the user opens the locations app
    When the user opens the settings, chooses the option "12-hour" and goes back
    Then the time of "Almaty" reads "12:30 PM"
    And the time of "New York" reads "3:30 AM"
    And the hour labels of "Almaty" are "12 AM, 6 AM, 12 PM, 6 PM, 12 AM"

  @add-settings-page-and-device-time-location @FR7
  Scenario: Choices survive a reload
    Given the system colour scheme is light
    And the user opens the settings
    When the user chooses the option "Dark"
    And the user chooses the option "12-hour"
    And the preferences are stored
    And the user reloads the app
    And the user opens the settings
    Then the option "Dark" is checked
    And the option "12-hour" is checked
    And the page background is the dark token colour

  @add-settings-page-and-device-time-location @FR7
  Scenario: Offline reopen
    Given the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    And the stored preferences are theme System and hour format 12-hour
    And the user opens the locations app
    And the app is installed for offline use
    When the user reopens the locations app without network
    Then the time of "Almaty" reads "12:30 PM"
