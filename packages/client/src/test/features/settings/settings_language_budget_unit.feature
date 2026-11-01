Feature: Interface language switch is cheap
  Implements change add-interface-language-selection.
  As a user with many locations I can switch the interface language without the
  rows rebuilding more than they must.

  @add-interface-language-selection @NFR-P1
  Scenario: Presenting again with the same language builds no formatter
    Given 50 locations have been presented in English
    When the same rows are presented again in English
    Then no formatter is built

  @add-interface-language-selection @NFR-P1
  Scenario: Switching the language builds one formatter per zone and kind
    Given 50 locations in 50 different time zones have been presented in English
    When the interface language becomes Russian and the rows are presented
    Then at most one formatter per time zone and label kind in use is built
