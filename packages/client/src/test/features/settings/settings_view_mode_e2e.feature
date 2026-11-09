Feature: View mode in the settings in a real browser
  Implements change add-view-mode-setting-and-grid-skeleton.
  The view group is operable by keyboard and screen reader, and the chosen view never follows the screen.

  @add-view-mode-setting-and-grid-skeleton @NFR-A1
  Scenario: Names and checked state of the view group
    Given the user opens the settings
    Then the view options are named "Cards" and "Grid", in this order
    And the option "Cards" of the view group is checked

  @add-view-mode-setting-and-grid-skeleton @NFR-A1
  Scenario: Arrow keys change the view
    Given the user opens the settings
    When the user tabs to the view group
    And the user presses the key "ArrowRight"
    Then the option "Grid" of the view group is checked

  @add-view-mode-setting-and-grid-skeleton @NFR-A1 @UX1
  Scenario Outline: Size and focus of the view options in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the user opens the settings
    Then every view option is at least 44 by 44 px
    And the checked view option is filled with the accent colour
    When the user tabs to the view group
    Then the focused option shows a focus outline
    And the locations screen has no accessibility violations

    Examples:
      | theme |
      | light |
      | dark  |

  @add-view-mode-setting-and-grid-skeleton @FR5
  Scenario Outline: The view does not follow the width to <width> px
    Given the screen is 1280 px wide for the locations
    And the user opens the locations app
    When the user opens the settings, chooses the option "Grid" and goes back
    And the screen becomes <width> px wide
    Then the main page still shows the Grid view

    Examples:
      | width |
      | 375   |
      | 2560  |

  @add-view-mode-setting-and-grid-skeleton @FR5
  Scenario: The view does not follow the orientation
    Given the screen is 390 by 844 px for the locations
    And the user opens the locations app
    When the user opens the settings, chooses the option "Grid" and goes back
    And the phone is turned to landscape
    Then the main page still shows the Grid view

  @add-view-mode-setting-and-grid-skeleton @FR4
  Scenario: The view survives a reload
    Given the user opens the locations app
    When the user opens the settings, chooses the option "Grid" and goes back
    And the preferences are stored
    And the user reloads the app
    Then the main page still shows the Grid view
    When the user opens the settings
    Then the option "Grid" of the view group is checked
