Feature: Legacy engine support in a real browser
  Implements change support-legacy-ios-12-safari.
  As a user I download no polyfills on a modern browser, and the fallbacks for an engine without Pointer Events stay accessible.

  @support-legacy-ios-12-safari @NFR-P2 @M5
  Scenario: Modern engine requests no polyfills
    Given the page requests are recorded
    And the stored locations are "Almaty", "Moscow"
    When the user opens the locations app
    Then the page has requested no polyfill chunk

  @support-legacy-ios-12-safari @NFR-A1
  Scenario: No accessibility violations without Pointer Events
    Given the engine has no Pointer Events
    And the stored locations are "Almaty", "Moscow"
    When the user opens the locations app
    Then the locations screen has no accessibility violations
    When the user opens the search
    Then the search dialog has no accessibility violations
