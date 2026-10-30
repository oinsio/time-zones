Feature: Device time location in a real browser
  Implements change add-settings-page-and-device-time-location.
  As a user I use the time on my own device like any other card, with a mouse,
  a finger and the keyboard, on every screen size. The E2E device time zone is
  Asia/Almaty.

  @add-settings-page-and-device-time-location @FR8 @NFR-A2
  Scenario: Name and list size
    Given the locations interface language is Russian
    And the stored locations are "the device time location", "Moscow", "New York"
    When the user opens the locations app
    Then the first list item is named "Алматы, Вы здесь, Время устройства"
    And the location list has 3 items
    And the location menu button of the device time location is named "Действия: Алматы"

  @add-settings-page-and-device-time-location @FR8 @NFR-A1
  Scenario Outline: Accessibility of the device time location in the <state> state in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the user opens the locations app
    When the locations are in the <state> state
    Then the device time location is shown
    And the locations screen has no accessibility violations

    Examples:
      | state            | theme |
      | first-launch     | light |
      | first-launch     | dark  |
      | device-time      | light |
      | device-time      | dark  |
      | device-time-home | light |
      | device-time-home | dark  |

  @add-settings-page-and-device-time-location @NFR-R1 @UX3
  Scenario: Narrow and wide screens
    Given the stored locations are "the device time location", "Moscow"
    And the user opens the locations app
    When the viewport is 320 px and then 2560 px wide
    Then the page did not scroll horizontally
    And the device time location's layout matches the Moscow card's layout

  @add-settings-page-and-device-time-location @UX3 @NFR-P2
  Scenario Outline: The exemplar city keeps the height at <width> px
    Given the locations interface language is Russian
    And the screen is <width> px wide for the locations
    And the search data is slow to load
    And the stored locations are "the device time location", "Moscow"
    When the user opens the locations app
    Then the device time location shows the city "Almaty"
    When the zone cities data finishes loading
    Then the device time location shows the city "Алматы"
    And the device time location's height is the same as before the load
    And the Moscow card has not moved

    Examples:
      | width |
      | 375   |
      | 1024  |

  @add-settings-page-and-device-time-location @FR9 @M3
  Scenario: Reorder below a city with the keyboard
    Given the stored locations are "the device time location", "Moscow", "New York"
    And the user opens the locations app
    When the user picks up "Almaty" with the keyboard
    And the user moves the picked-up card down 2 times
    And the user drops the picked-up card with the keyboard
    Then the locations list order is "Moscow", "New York", "Almaty"
    And the reorder announcement reads "Almaty dropped at position 3 of 3"

  @add-settings-page-and-device-time-location @FR9 @M3
  Scenario: Reorder below a city with the mouse
    Given the stored locations are "the device time location", "Moscow", "New York"
    And the user opens the locations app
    When the user drags "Almaty" below "New York" with the mouse
    Then the locations list order is "Moscow", "New York", "Almaty"

  @add-settings-page-and-device-time-location @FR13 @M4
  Scenario: Remove everything and reopen
    Given the stored locations are "the device time location", "Moscow"
    And the user opens the locations app
    When the user removes "Moscow"
    And the user removes "Almaty"
    And the user reloads the app
    Then the empty-state explanation is shown
    And the locations list holds 0 locations

  @add-settings-page-and-device-time-location @FR11 @FR12
  Scenario: Choose the device time option in the search
    Given the stored locations are "Moscow"
    And the user opens the locations app
    When the user opens the search
    And the user chooses the "Device time" option
    Then the search is closed
    And the locations list order is "Moscow", "Almaty"
    And the polite announcement says "Device time added"
