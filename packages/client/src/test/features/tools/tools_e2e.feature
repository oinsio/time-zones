Feature: Tools in a real browser
  Implements change add-unix-time-converter-tool.
  As a user I turn a tool on in the settings, open it from the header and come
  back, with a keyboard or a pointer, at any width.

  @add-unix-time-converter-tool @FR2
  Scenario: Every tool is off at first
    Given the user opens the settings
    Then the tool toggle is not pressed

  @add-unix-time-converter-tool @FR2
  Scenario: Turning a tool on and off
    Given the user opens the settings
    When the user turns on the tool toggle
    Then the tool toggle is pressed
    When the user goes back to the main page
    Then the header shows the tool button
    When the user opens the settings and turns the tool toggle off and goes back
    Then the header shows no tool button

  @add-unix-time-converter-tool @FR3
  Scenario: Enabled tools survive a reload
    Given the tool is enabled
    When the app is opened again
    Then the header shows the tool button

  @add-unix-time-converter-tool @FR5
  Scenario Outline: Open and leave
    Given the tool is enabled
    When the user chooses the tool button
    Then the tool page heading is shown and the date bar is not
    When the user leaves the tool page with <way>
    Then the main page is shown and the focus is on the tool button

    Examples:
      | way         |
      | the back button |
      | Esc         |

  @add-unix-time-converter-tool @FR5 @NFR-A1 @NFR-A4
  Scenario: Tab order of the header
    Given the tool is enabled
    When the user presses Tab until the Add location button is focused
    Then the next three stops are the tool button and the settings button

  @add-unix-time-converter-tool @NFR-A1 @NFR-R1
  Scenario Outline: Names, states and sizes at <width> px
    Given the tool is enabled
    And the screen is <width> px wide for the locations
    And the locations screen uses the <theme> theme
    And the user opens the settings
    Then the tool toggle and the tool button are at least 44 by 44 px
    And the tool toggle is pressed
    And the locations screen has no accessibility violations on the tools pages

    Examples:
      | width | theme |
      | 320   | light |
      | 375   | dark  |
      | 1024  | light |

  @add-unix-time-converter-tool @NFR-R1
  Scenario Outline: Narrow and wide header
    Given the tool is enabled
    And the screen is <width> px wide for the locations
    When the app is opened again
    Then the page does not scroll horizontally and the header buttons are fully visible

    Examples:
      | width |
      | 320   |
      | 360   |
      | 2560  |
