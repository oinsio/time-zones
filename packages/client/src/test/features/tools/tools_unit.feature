Feature: Tools
  Implements change add-unix-time-converter-tool.
  As a user I turn on the tools I need in the settings and open each from a
  button in the header.

  @add-unix-time-converter-tool @FR1
  Scenario: A registered tool appears in the settings
    Given the tool registry holds the Unix time converter
    When the user opens the settings page
    Then the tools group shows exactly one toggle, named "Конвертер Unix-времени"

  @add-unix-time-converter-tool @FR1
  Scenario: Two tools keep registry order
    Given a test registry with the tools A and B, in this order, both with a page and both enabled
    When the main page is shown
    Then the header shows the tool button of A before the tool button of B

  @add-unix-time-converter-tool @FR1
  Scenario: Empty registry
    Given a test registry with no tool
    When the user opens the settings page
    Then no group named "Инструменты" is shown

  @add-unix-time-converter-tool @FR2
  Scenario: Every tool is off at first
    Given the tool registry holds the Unix time converter
    When the user opens the settings page
    Then the toggle "Конвертер Unix-времени" is not pressed

  @add-unix-time-converter-tool @FR2
  Scenario: Toggles are independent
    Given a test registry with the tools A and B, in this order, both with a page and A enabled
    When the user opens the settings page
    And the user turns on the toggle of B
    Then the toggles of A and B are both pressed
    When the user turns off the toggle of A
    Then the toggle of B is pressed

  @add-unix-time-converter-tool @FR2
  Scenario: A toggle shows no text
    Given the tool registry holds the Unix time converter
    When the user opens the settings page
    Then the toggle "Конвертер Unix-времени" shows an icon and no visible text

  @add-unix-time-converter-tool @FR3
  Scenario: An unregistered stored tool
    Given the stored enabled tools are "folders" and "unixTimeConverter"
    When the main page is shown
    Then the header shows exactly one tool button, "Конвертер Unix-времени"

  @add-unix-time-converter-tool @FR3
  Scenario Outline: Unreadable enabled tools
    Given the stored enabled tools are <value>
    When the main page is shown
    Then no tool button is shown

    Examples:
      | value                   |
      | "unixTimeConverter"     |
      | [""]                    |
      | [1]                     |

  @add-unix-time-converter-tool @FR4
  Scenario: No enabled tool
    Given the tool registry holds the Unix time converter
    When the main page is shown
    Then no tool button is shown

  @add-unix-time-converter-tool @FR4
  Scenario: A tool without a page
    Given a test registry with the enabled tool A, which has no page
    When the main page is shown
    Then no tool button is shown

  @add-unix-time-converter-tool @FR5
  Scenario Outline: Open and leave
    Given the tool registry holds the Unix time converter, enabled
    When the user chooses the tool button
    Then the page heading is "Конвертер Unix-времени" and the date bar is not shown
    When the user leaves with <way>
    Then the main page is shown and the focus is on the tool button

    Examples:
      | way         |
      | the back button |
      | Esc         |

  @add-unix-time-converter-tool @FR5
  Scenario: Loading fails, then succeeds
    Given the Unix time converter is enabled and the first load of its page fails
    When the user chooses the tool button
    Then the error fallback with "Повторить" and the back button is shown
    When the user chooses "Повторить" and the load succeeds
    Then the page heading is "Конвертер Unix-времени"

  @add-unix-time-converter-tool @FR5 @NFR-P1
  Scenario: The page is not loaded before its button is chosen
    Given the Unix time converter is enabled and the load of its page is watched
    When the main page is shown
    Then the page of the tool was not loaded
    When the user chooses the tool button
    Then the page of the tool was loaded once
