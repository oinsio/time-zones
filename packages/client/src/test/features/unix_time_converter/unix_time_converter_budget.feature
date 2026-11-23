Feature: Live work bounds of the Unix time converter
  Implements change add-unix-time-converter-tool.
  As a user I want the live converter to stay light, so a tick does only the
  work of showing a new second.

  @add-unix-time-converter-tool @NFR-P2
  Scenario: Ticks build no formatter
    Given the converter is live with 20 locations and was presented once
    When 10 seconds pass
    Then no Intl formatter was built
