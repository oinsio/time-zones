Feature: Main page header in a real browser
  Implements change add-settings-page-and-device-time-location.
  Implements change fix-location-card-and-header-layout.
  Implements change redesign-cards-grid-and-day-palettes.
  As a user I add a location and open the settings from the header on every
  screen size, with a mouse, a finger and the keyboard.

  @redesign-cards-grid-and-day-palettes @FR6 @UX1
  Scenario Outline: Narrow header at <width> px
    Given the locations interface language is Russian
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the header shows, from left to right, the title "Часовые пояса", the button named "Добавить место" and the button named "Настройки"
    And both header buttons show an icon in the accent colour and no visible text
    And the header has no bottom border

    Examples:
      | width |
      | 320   |
      | 390   |

  @redesign-cards-grid-and-day-palettes @FR6 @FR12 @UX1
  Scenario Outline: Wide header at <width> px
    Given the locations interface language is Russian
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the header shows, from left to right, the title "Часовые пояса", the button named "Добавить место" and the button named "Настройки"
    And the title starts at the left edge of the content column and the settings button ends at its right edge
    And both header buttons show an icon in the accent colour and no visible text
    And the header has no bottom border

    Examples:
      | width |
      | 768   |
      | 1024  |
      | 1440  |
      | 2560  |

  @redesign-cards-grid-and-day-palettes @FR6
  Scenario Outline: Title size by width at <width> px
    Given the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the title font size is <size> px and its weight 700

    Examples:
      | width | size |
      | 320   | 23   |
      | 360   | 23   |
      | 390   | 27   |
      | 1024  | 27   |

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
  @fix-location-card-and-header-layout @FR4
  Scenario Outline: No Add location button on an unreadable list at <width> px
    Given the stored list is unreadable
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the load error with Reset is shown
    And the header shows the button named "Settings" and no button named "Add location"
    And the title is left of the button named "Settings"
    And the button named "Settings" is the rightmost header control

    Examples:
      | width |
      | 375   |
      | 768   |
      | 1024  |
      | 1440  |
      | 2560  |

  @redesign-cards-grid-and-day-palettes @NFR-A3 @NFR-R1
  @add-settings-page-and-device-time-location @NFR-A1 @NFR-A2 @NFR-A3 @NFR-R1 @UX1 @M1
  @fix-location-card-and-header-layout @NFR-A1
  Scenario Outline: Header sizes and accessibility at <width> px in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then both header buttons are at least 44 by 44 px and their icons 27 px
    And Tab reaches the button named "Add location" before the button named "Settings"
    And the locations screen has no accessibility violations

    Examples:
      | width | theme |
      | 375   | light |
      | 375   | dark  |
      | 1024  | light |
      | 1024  | dark  |

  @add-grid-meeting-range-and-share @FR13
  Scenario: The meeting bar replaces the header
    Given the locations interface language is Russian
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the header shows the meeting bar, with no button named "Добавить место" or "Настройки" and no title "Часовые пояса"
    And pressing "/" opens no search
    When the user clears the meeting
    Then the header shows, from left to right, the title "Часовые пояса", the button named "Добавить место" and the button named "Настройки"

  @add-grid-meeting-range-and-share @FR13
  Scenario: Cards keeps its header with a meeting range
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the view mode becomes Cards in another tab
    Then the header shows, from left to right, the title "Time Zones", the button named "Add location" and the button named "Settings"

  @add-unix-time-converter-tool @FR4 @NFR-R1
  Scenario Outline: Header with a tool button at <width> px
    Given the locations interface language is Russian
    And the tool "Конвертер Unix-времени" is enabled
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the header lists the title "Часовые пояса" and the three buttons "Добавить место", "Конвертер Unix-времени" and "Настройки" in this order
    And the three header buttons show an icon in the accent colour and no visible text, each at least 44 by 44 px
    And the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 390   |
      | 1024  |
      | 2560  |

  @add-unix-time-converter-tool @FR4 @NFR-R1
  Scenario Outline: Title size with a tool button at <width> px
    Given the locations interface language is Russian
    And the tool "Конвертер Unix-времени" is enabled
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the title font size is <size> px and its weight 700
    And the title is on one line

    Examples:
      | width | size |
      | 320   | 20   |
      | 337   | 20   |
      | 338   | 23   |
      | 367   | 23   |
      | 368   | 27   |
      | 1024  | 27   |

  @add-unix-time-converter-tool @FR4
  Scenario: The meeting bar hides the tool buttons
    Given the locations interface language is Russian
    And the view mode is Grid
    And the tool "Конвертер Unix-времени" is enabled
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the meeting bar is shown and no header button is named "Конвертер Unix-времени"
    When the user clears the meeting
    Then the header lists the button "Конвертер Unix-времени" between "Добавить место" and "Настройки"
