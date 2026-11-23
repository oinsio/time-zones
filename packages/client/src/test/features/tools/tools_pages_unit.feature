Feature: Tool pages
  Implements change add-unix-time-converter-tool.
  As a user I open the page of a tool from its button in the header and come
  back to the main page.

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
