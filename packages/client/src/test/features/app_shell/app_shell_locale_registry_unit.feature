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

  @add-interface-language-selection @FR7
  Scenario Outline: Browser language decides without a choice
    Given no interface language is chosen
    When the app starts with the browser languages "<browser>"
    Then the interface language is "<language>"

    Examples:
      | browser   | language |
      | ru-RU     | ru       |
      | de-DE, ru | ru       |
      | en-US     | en       |
      | de-DE     | en       |

  @add-interface-language-selection @FR7
  Scenario: A chosen language wins over the browser
    Given the chosen interface language is "ru"
    When the app starts with the browser languages "en-US"
    Then the interface language is "ru"

  @add-interface-language-selection @FR7 @FR10
  Scenario: A dialect is not picked by its base language
    Given the registry has "ru" and a dialect "ru-KZ" with base language "ru"
    When the app starts with the browser languages "ru-RU"
    Then the interface language is "ru"

  @add-interface-language-selection @FR10
  Scenario: Fallback order of a dialect
    Given a dialect "ru-KZ" with base language "ru"
    And the key "a" is translated in "ru-KZ", "ru" and "en"
    And the key "b" is translated in "ru" and "en" only
    And the key "c" is translated in "en" only
    When the interface language is "ru-KZ"
    Then "a" shows the "ru-KZ" text, "b" the "ru" text and "c" the "en" text

  @add-interface-language-selection @FR10
  Scenario: Language-keyed data of a dialect
    Given a dialect "ru-KZ" with base language "ru"
    When the interface language is "ru-KZ"
    Then the city of "Asia/Almaty" is named "Алматы"
    And calendar weeks start on Monday
