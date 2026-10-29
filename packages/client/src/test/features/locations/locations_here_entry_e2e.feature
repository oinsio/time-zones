Feature: Here entry in a real browser
  Implements change show-here-entry-for-device-time.
  As a user I see my device time first, apart from my locations, and I can
  use it with a mouse, a finger and the keyboard on every screen size. The E2E
  device time zone is Asia/Almaty.

  @show-here-entry-for-device-time @FR4
  Scenario: Reorder keeps the Here entry first
    Given the stored locations are "Moscow", "New York"
    And the user opens the locations app
    When the user picks up "New York" with the keyboard
    And the user moves the picked-up card up 1 time
    And the user drops the picked-up card with the keyboard
    Then the rows are the Here entry, "New York", "Moscow"
    And the reorder announcement reads "New York dropped at position 1 of 2"

  @show-here-entry-for-device-time @FR5
  Scenario: Time selection from the Here entry with the keyboard
    Given the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Moscow"
    And the user opens the locations app
    When the user presses ArrowRight on the slider of "Almaty"
    Then the slider of "Almaty" moved one track step
    And the Here entry shows the time "12:45"
    And the card of "Moscow" shows the time "10:45"

  @show-here-entry-for-device-time @FR12
  Scenario: Tap on the Here entry's day track without Pointer Events
    Given the engine has no Pointer Events
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Moscow"
    And the user opens the locations app
    When the user taps three quarters of the Here entry's day track
    Then the Here entry shows the time "18:00"
    And the card of "Moscow" shows the time "16:00"

  @show-here-entry-for-device-time @NFR-A2
  @add-wall-time-input-with-hint @NFR-A2
  Scenario: Name and list size
    Given the locations interface language is Russian
    And the stored locations are "Moscow", "New York"
    And the user opens the locations app
    Then the Here entry is named "Алматы, Вы здесь, Время устройства"
    And the location list has 2 items
    And the Here entry's slider is named "Время — Алматы"

  @show-here-entry-for-device-time @NFR-A2
  @add-wall-time-input-with-hint @NFR-A2
  Scenario: One Tab stop on the Here entry
    Given the locations interface language is Russian
    And the stored locations are "Moscow"
    And the user opens the locations app
    And the Here entry's slider is named "Время — Алматы"
    When the user moves the focus through the page with Tab
    Then exactly two elements of the Here entry take the focus: the button named "Ввести время — Алматы" and then the slider named "Время — Алматы"
    And the next Tab moves the focus out of the Here entry

  @show-here-entry-for-device-time @NFR-A1
  Scenario Outline: Accessibility of the Here entry in the <state> state in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the user opens the locations app
    When the locations are in the <state> state
    Then the Here entry is shown
    And the locations screen has no accessibility violations

    Examples:
      | state             | theme |
      | here-entry        | light |
      | here-entry        | dark  |
      | empty             | light |
      | empty             | dark  |
      | here-entry-travel | light |
      | here-entry-travel | dark  |

  @show-here-entry-for-device-time @NFR-R1 @UX1
  Scenario: Narrow and wide screens
    Given the stored locations are "Moscow"
    And the user opens the locations app
    When the viewport is 320 px and then 2560 px wide
    Then the page did not scroll horizontally
    And the Here entry's layout matches the Moscow card's layout

  @show-here-entry-for-device-time @UX3 @NFR-P2
  Scenario Outline: The exemplar city keeps the height at <width> px
    Given the locations interface language is Russian
    And the screen is <width> px wide for the locations
    And the search data is slow to load
    And the stored locations are "Moscow"
    When the user opens the locations app
    Then the Here entry shows the city "Almaty"
    When the zone cities data finishes loading
    Then the Here entry shows the city "Алматы"
    And the Here entry's height is the same as before the load
    And the Moscow card has not moved

    Examples:
      | width |
      | 375   |
      | 1024  |
