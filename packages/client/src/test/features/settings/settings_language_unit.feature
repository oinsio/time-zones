Feature: Interface language in the preferences
  Implements change add-interface-language-selection.
  As a user I choose the interface language on the settings page; it applies at
  once, is kept on the device and follows the same rules as the other settings.

  @add-interface-language-selection @show-city-labels-in-interface-language @FR5 @FR2 @UX3
  Scenario: Choosing Russian applies at once
    Given the interface language is English
    And the current instant is "2026-03-08T07:30:00Z"
    And the list is Almaty
    When the user chooses «Русский» in the language group
    Then the list collapses and the button shows "🇷🇺 Русский"
    And the settings heading reads «Настройки» without a reload
    And after going back Almaty reads «Алматы» and shows the country «Казахстан»
    And the date shows the Russian weekday
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

  @add-interface-language-selection @FR7
  Scenario: A chosen code that is no longer registered
    Given the chosen interface language is "xx", which no locale file has
    And the browser language is "ru-RU"
    When the app is opened again
    Then the main page is in Russian from its first render
    And nothing is written to the preferences document
