Feature: Enabled tools are kept on the device
  Implements change add-unix-time-converter-tool.
  As a user the tools I turned on are kept with my other preferences, read at
  the next start and shared between my open tabs.

  @add-unix-time-converter-tool @FR3
  Scenario: A document from before this change
    Given stored preferences of the previous schema version with the dark theme and the Grid view
    When the main page is shown
    Then no tool button is shown
    And the theme is dark and the view is Grid

  @add-unix-time-converter-tool @FR3
  Scenario: An unregistered tool stays stored
    Given the stored enabled tools are "folders" and "unixTimeConverter"
    When the main page is shown
    And the user changes the theme to dark
    Then the stored enabled tools still hold "folders"

  @add-unix-time-converter-tool @FR3
  Scenario: Another tab turns a tool on
    Given the tool registry holds the Unix time converter
    When the main page is shown
    And another tab turns on the tool "Конвертер Unix-времени"
    Then the header shows the tool button "Конвертер Unix-времени"

  @add-unix-time-converter-tool @FR3
  Scenario: Without storage
    Given the storage is unavailable
    When the main page is shown
    And the user turns on the tool "Конвертер Unix-времени" in the settings and goes back
    Then the header shows the tool button "Конвертер Unix-времени"
    And the storage warning is shown
