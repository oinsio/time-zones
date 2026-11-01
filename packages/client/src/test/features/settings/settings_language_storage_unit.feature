Feature: Interface language storage
  Implements change add-interface-language-selection.
  The interface language is kept with the other settings: it is migrated from the
  previous document, reset, and kept in step with other tabs.

  @add-interface-language-selection @FR8
  Scenario: Migration of the previous document
    Given the previous version stored the theme Dark and the hour format 12-hour, and the legacy language key holds "ru"
    When the app is opened again
    Then the theme Dark, the hour format 12-hour and the language «Русский» are in force
    When the user chooses the hour format "24 часа"
    Then the stored document holds the theme Dark, the hour format 24-hour and the language "ru"
    And the legacy language key is gone

  @add-interface-language-selection @FR8
  Scenario: Legacy key without a document
    Given no preferences document is stored and the legacy language key holds "ru"
    And the browser language is "en-US"
    When the app is opened again
    Then the main page is in Russian from its first render
    And no preferences document is stored

  @add-interface-language-selection @FR12
  Scenario: Reset returns to the browser language
    Given the browser language is "en-US"
    And the stored preferences document is not valid JSON
    And the user chose «Русский» in the language group
    When the user resets
    Then the interface language is English at once

  @add-interface-language-selection @FR12
  Scenario: Language without storage
    Given storage is unavailable
    When the user chooses «Русский» in the language group
    Then the interface is in Russian
    And the settings page says changes will not be saved

  @add-interface-language-selection @FR12
  Scenario: Another tab changes the language
    Given the app is open in two tabs in English
    When the user chooses «Русский» in the first tab
    Then the second tab is in Russian without a reload
