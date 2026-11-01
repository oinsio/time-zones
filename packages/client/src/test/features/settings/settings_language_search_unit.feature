Feature: Language list search
  Implements change add-interface-language-selection.
  As a user with many languages to choose from I find mine by typing a part of
  its name or code.

  @add-interface-language-selection @FR6
  Scenario: No search field below the threshold
    Given the registry holds 2 locales
    When the user expands the language group
    Then no search field is shown

  @add-interface-language-selection @FR6
  Scenario Outline: Filtering at the threshold
    Given the registry holds 10 locales
    When the user expands the language group and types "<text>"
    Then the rows are "<rows>"

    Examples:
      | text   | rows     |
      | deu    | Deutsch  |
      | GERMAN | Deutsch  |
      | ru     | Русский  |
      | рус    | Русский  |
      | francais | Français |

  @add-interface-language-selection @FR6
  Scenario: Nothing found
    Given the registry holds 10 locales
    When the user expands the language group and types "zzz"
    Then the list shows "No languages found"
