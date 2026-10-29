Feature: Home location in a real browser
  Implements change set-home-location-and-show-differences.
  The location menu works by pointer and keyboard, sets home and says so, names
  everything in both languages, fits every screen and has no accessibility
  violations.

  @set-home-location-and-show-differences @FR11 @NFR-A2
  Scenario: Keyboard
    Given the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    When the user focuses the location menu button of "Moscow" and presses Enter
    Then the menu opens with focus on its first item
    When the user presses Esc
    Then the menu is closed and focus is on the location menu button of "Moscow"

  @set-home-location-and-show-differences @FR11 @UX3
  Scenario: The menu does not start a reorder
    Given the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    When the user opens the location menu of "Moscow"
    Then the list order is still "Almaty, Moscow"

  @set-home-location-and-show-differences @FR11 @NFR-A2
  @match-home-mark-to-design @NFR-A1
  Scenario: Setting home is announced
    Given the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    When the user chooses "Make home" in the location menu of "Almaty"
    Then the polite announcement reads "Almaty is now home"
    And focus is on the location menu button of "Almaty"
    And the row of "Almaty" has a mark named "Home location"

  @set-home-location-and-show-differences @FR11
  Scenario: Clearing home is announced
    Given the list holds "Almaty", "Moscow" and home is "Almaty"
    And the user opens the locations app
    When the user chooses "Clear home" in the location menu of "Almaty"
    Then the polite announcement reads "Home cleared"
    And the row of "Almaty" has no mark named "Home location"

  @set-home-location-and-show-differences @FR12
  Scenario: Russian interface
    Given the locations interface language is Russian
    And the list holds "Almaty", "Moscow" and home is "Almaty"
    And the user opens the locations app
    When the user opens the location menu named "Действия: Moscow"
    Then the menu offers the items "Сделать домашним, Удалить"
    And the row of "Almaty" has a mark named "Домашнее место"

  @set-home-location-and-show-differences @UX1 @FR7
  Scenario: The difference stands between the city and the caption
    Given the list holds "Almaty", "Moscow" and home is "Moscow"
    And the user opens the locations app
    Then the offset difference of "Almaty" stands after the city and before the caption
    And the offset difference of "Almaty" reads "+2 h"

  @set-home-location-and-show-differences @UX3
  Scenario: The menu button is large enough to tap
    Given the stored locations are "Almaty"
    And the user opens the locations app
    Then the location menu button of "Almaty" is at least 44 px wide and tall

  @set-home-location-and-show-differences @NFR-A1
  @match-home-mark-to-design @NFR-A1
  Scenario Outline: Accessibility in the <state> state in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the user opens the locations app
    When the locations are in the <state> state
    Then the locations screen has no accessibility violations

    Examples:
      | state      | theme |
      | list       | light |
      | list       | dark  |
      | home       | light |
      | home       | dark  |
      | travelling | light |
      | travelling | dark  |
      | menu open  | light |
      | menu open  | dark  |

  @set-home-location-and-show-differences @NFR-R1
  Scenario Outline: The list with home and an open menu fits a <width> px wide screen
    Given the list holds "Almaty", "Kathmandu", "New York" and home is "Almaty"
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the location menu of "Kathmandu" is open
    Then the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 2560  |

  @set-home-location-and-show-differences @NFR-R1
  Scenario Outline: The travelling state fits a <width> px wide screen
    Given the screen is <width> px wide for the locations
    And the user opens the locations app
    When the locations are in the travelling state
    Then the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 2560  |
