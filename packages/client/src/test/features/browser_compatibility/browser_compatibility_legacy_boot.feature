Feature: Start on a legacy engine
  Implements change support-legacy-ios-12-safari.
  As a user of iOS Safari 12 I open the app and see my cities, while a modern browser downloads no polyfills.

  @support-legacy-ios-12-safari @FR1
  Scenario: Main page renders on a legacy engine
    Given the engine lacks country names, width observation, Pointer Events and media query listeners
    And the stored list is "Almaty", "Moscow"
    When the user opens the app
    Then the cards of "Almaty" and "Moscow" show their times
    And no error is shown

  @support-legacy-ios-12-safari @FR2
  Scenario: Modern engine skips the polyfills
    Given the engine has every required built-in
    When the app starts
    Then the polyfills are not loaded
    And the app is loaded

  @support-legacy-ios-12-safari @FR2
  Scenario: Legacy engine installs the polyfills first
    Given the engine lacks "Array.prototype.at"
    When the app starts
    Then the polyfills are loaded before the app
    And the polyfills include "es.array.at"
