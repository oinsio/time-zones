Feature: Locale registry and the interface language at start
  Implements change add-interface-language-selection.
  As a maintainer I add a language with one locale file, and as a user I see the
  app in my language from the first render.

  @add-interface-language-selection @FR9
  Scenario: Registry from locale files
    Given locale files "en", "ru" and "de" with complete metadata
    When the registry is built
    Then it lists "en", "de" and "ru" in this order

  @add-interface-language-selection @FR9
  Scenario Outline: Rejected locale files
    Given a locale file "<file>" whose metadata "<defect>"
    When the registry is built
    Then the registry does not contain "<file>"

    Examples:
      | file      | defect                                  |
      | de        | has no nativeName                       |
      | fr        | has an empty emoji                      |
      | es        | has the code pt                         |
      | en_pirate | has the code en_pirate, not a language tag |

  @add-interface-language-selection @FR9
  Scenario: Metadata is not a translation
    When the registry gives the English translations to the interface
    Then they contain no "_meta" key

  @add-interface-language-selection @FR11
  Scenario: American flag for English
    When the English locale file is read
    Then its metadata emoji is "🇺🇸"
