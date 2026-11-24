Feature: The Unix time converter in a real browser
  Implements change add-unix-time-converter-tool.
  As a user I open the converter, type a Unix time and read it without
  scrolling sideways, with the keyboard or a pointer.

  @add-unix-time-converter-tool @NFR-A2 @desktop-only
  Scenario: Focus on a desktop
    Given the converter tool is enabled
    When the user opens the converter tool
    Then the converter input is focused and its text is selected

  @add-unix-time-converter-tool @NFR-A3 @NFR-R2
  Scenario: A typed value is shown in the notations
    Given the converter tool is enabled
    When the user opens the converter tool
    And the user types "1795432987123456789" into the converter input in the browser
    Then the notation "Seconds" shows "1795432987" in the browser

  @add-unix-time-converter-tool @NFR-R1 @NFR-R2 @NFR-A3
  Scenario Outline: Long values at <width> px
    Given the converter tool is enabled
    And the screen is <width> px wide for the locations
    When the user opens the converter tool
    And the user types "1795432987123456789" into the converter input in the browser
    Then the converter page does not scroll horizontally
    And the converter page has no accessibility violations

    Examples:
      | width |
      | 320   |
      | 375   |
      | 2560  |
