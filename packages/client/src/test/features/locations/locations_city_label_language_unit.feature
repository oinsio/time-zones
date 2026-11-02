Feature: City label in the interface language
  Implements change show-city-labels-in-interface-language.
  As a user I read every city in the language of the interface, whatever
  language I added it in, and switching the language never changes my list.

  @show-city-labels-in-interface-language @FR1 @FR2 @UX2
  Scenario: Added in Russian, shown in English
    Given the interface language is "ru"
    And the zone cities data is loaded
    And the list is "Токио"
    When the user opens the app
    Then the row reads "Токио"
    When the user switches the interface language to "en"
    Then the row now reads "Tokyo"
    When the user switches the interface language to "ru"
    Then the row reads "Токио" again

  @show-city-labels-in-interface-language @FR1 @FR2 @UX2
  Scenario: Added in English, shown in Russian
    Given the interface language is "en"
    And the zone cities data is loaded
    And the list is "Tokyo"
    When the user opens the app
    Then the row reads "Tokyo"
    When the user switches the interface language to "ru"
    Then the row now reads "Токио"

  @show-city-labels-in-interface-language @FR2
  Scenario: A switch keeps the stored list
    Given the interface language is "en"
    And the zone cities data is loaded
    And the list is "Токио"
    And the home location is "Токио"
    When the user opens the app
    Then the row reads "Tokyo"
    And the row is the home location
    And the stored list holds "Токио" stored as home
    When the user switches the interface language to "ru"
    And the user switches the interface language to "en"
    Then the row reads "Tokyo" again
    And the stored list still holds "Токио" stored as home
    And the stored location list was not written

  @show-city-labels-in-interface-language @FR4 @UX1
  Scenario: Stored label until the data is loaded
    Given the interface language is "en"
    And the zone cities data has not been loaded
    And the list is "Токио"
    When the user opens the app
    Then the row reads "Токио"
    When the zone cities data finishes loading
    Then the row now reads "Tokyo"

  @show-city-labels-in-interface-language @FR4
  Scenario: Loading fails
    Given the interface language is "en"
    And loading the zone cities data fails
    And the list is "Токио"
    When the user opens the app
    Then the row reads "Токио"
    And no error is shown

  @show-city-labels-in-interface-language @FR1
  Scenario: A label the data does not know
    Given the interface language is "ru"
    And the zone cities data has not been loaded
    And the list is "Edo"
    When the user opens the app
    And the zone cities data finishes loading
    Then the row reads "Edo"

  @show-city-labels-in-interface-language @FR1
  Scenario: A dialect reads its base language
    Given a dialect "ru-KZ" with base language "ru"
    And the zone cities data is loaded
    When the city label of "Asia/Tokyo" stored as "Tokyo" is read in "ru-KZ"
    Then the city label is "Токио"

  @show-city-labels-in-interface-language @FR3
  Scenario: Removal is announced with the new city label
    Given the interface language is "ru"
    And the zone cities data is loaded
    And the list is "Токио"
    When the user opens the app
    And the user switches the interface language to "en"
    And the user removes "Tokyo"
    Then "Tokyo removed" is announced politely
