Feature: Interface language in the preferences
  Implements change add-interface-language-selection.
  As a user I choose the interface language on the settings page; it applies at
  once, is kept on the device and follows the same rules as the other settings.

  @add-interface-language-selection @FR5 @UX3
  Scenario: Choosing Russian applies at once
    Given the interface language is English
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is Almaty
    When the user chooses «Русский» in the language group
    Then the list collapses and the button shows "🇷🇺 Русский"
    And the settings heading reads «Настройки» without a reload
    And after going back Almaty keeps its city label and shows the country «Казахстан»
    And searching "Алм" offers «Алматы»

  @add-interface-language-selection @FR3 @UX1
  Scenario: Names are not translated
    Given the interface language is Russian
    When the user expands the language group
    Then the rows read "🇺🇸 English" and "🇷🇺 Русский"

  @add-interface-language-selection @FR7
  Scenario: The language survives a reload
    Given the browser language is "en-US"
    And the user chose «Русский» in the language group
    When the app is opened again
    Then the main page is in Russian from its first render
    And the language button shows "🇷🇺 Русский"

  @add-interface-language-selection @FR8
  Scenario: Migration of the previous document
    Given the previous version stored the theme Dark and the hour format 12-hour, and the legacy language key holds "ru"
    When the app is opened again
    Then the language «Русский» is in force
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

  @add-interface-language-selection @FR7
  Scenario: A chosen code that is no longer registered
    Given the chosen interface language is "xx", which no locale file has
    And the browser language is "ru-RU"
    When the app is opened again
    Then the main page is in Russian from its first render
    And nothing is written to the preferences document

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
