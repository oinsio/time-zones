Feature: Day palette persistence
  Implements change redesign-cards-grid-and-day-palettes.
  As a user my day palette is stored, survives a reload and follows me across tabs.

  @redesign-cards-grid-and-day-palettes @FR3
  Scenario: The palette survives a reload
    Given the user chose the day palette "Muted"
    When the app is opened again
    Then the day palette "Muted" is checked

  @redesign-cards-grid-and-day-palettes @FR3
  Scenario: Existing users get Vivid
    Given a stored preferences document of the previous version with the theme "DARK" and the colouring "WORKING_HOURS"
    When the app is opened again
    Then the stored day palette is "VIVID", the theme "DARK" and the colouring "WORKING_HOURS"

  @redesign-cards-grid-and-day-palettes @FR3
  Scenario: Unknown palette is unreadable
    Given a stored preferences document of the current version whose day palette is "PASTEL"
    When the app is opened again
    Then the settings page shows the unreadable note

  @redesign-cards-grid-and-day-palettes @FR3
  Scenario: Another tab changes the palette
    Given the app is open in two tabs
    When the user chooses the day palette "Muted" in the first tab
    Then the second tab has the day palette "Muted" checked without a reload

  @redesign-cards-grid-and-day-palettes @FR3
  Scenario: The palette survives a colouring change
    Given the user chose the day palette "Muted"
    When the user chooses the colouring "Plain"
    And the user chooses the colouring "Time of day"
    Then the day palette "Muted" is checked
