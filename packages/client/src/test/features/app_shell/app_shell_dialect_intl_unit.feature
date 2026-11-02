Feature: Intl data of a dialect
  Implements change show-city-labels-in-interface-language.
  As a user of a dialect I read dates and country names in its base language,
  never in the language of my device.

  @show-city-labels-in-interface-language @FR5
  Scenario: Intl data of a dialect Intl does not know
    Given a dialect "tlh" with base language "ru", a code Intl supports no data for
    And the device's own locale is English
    When the interface language is "tlh"
    Then the country of "KZ" is named "Казахстан"
    And the local date of a row and the date bar weekday equal their Russian texts
