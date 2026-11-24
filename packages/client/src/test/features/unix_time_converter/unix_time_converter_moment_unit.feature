Feature: The converter moment
  Implements change add-unix-time-converter-tool.
  As a user the converter has a moment of its own that the date of the main
  page does not move, and a unit I fix converts the moment I see.

  @add-unix-time-converter-tool @FR14
  Scenario: The reference moment is not read
    Given the reference moment is pinned to "2026-03-09"
    When the user opens the converter
    Then the converter input shows "1795432987"

  @add-unix-time-converter-tool @FR7
  Scenario: A fixed unit converts a text the user did not type
    Given the user set the Moscow row to "14:23:07" on the current day, so the converter input shows "1795432987"
    When the user chooses the unit "Миллисекунды"
    Then the converter input shows "1795432987000" and the Moscow row shows "14:23:07"
