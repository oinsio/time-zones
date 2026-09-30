Feature: Locations storage states in the Cards view
  Implements change add-locations-via-search.
  As a user I am told when my list cannot be read or saved, and I can start over.

  @add-locations-via-search @FR12
  Scenario: Corrupted document
    Given the stored list is not valid JSON
    When the user opens the app
    Then an error message with a reset action is shown

  @add-locations-via-search @FR12
  Scenario: Reset
    Given the stored list is not valid JSON
    And the user opened the app
    When the user resets the list
    Then the empty state with the "Add location" action is shown
    And no list document is stored

  @add-locations-via-search @FR13
  Scenario: Private mode
    Given writing to storage fails
    And the user opened the app
    When the user searches for "Moscow" and chooses "Moscow"
    Then the list contains "Moscow"
    And the storage warning is shown

  @add-locations-via-search @FR13
  Scenario: Saving the list fails later
    Given only saving the list fails
    And the user opened the app
    And no storage warning is shown
    When the user searches for "Moscow" and chooses "Moscow"
    Then the list contains "Moscow"
    And the storage warning is shown

  @add-locations-via-search @FR18
  Scenario: Russian interface
    Given the interface language is Russian
    And the stored list is "Moscow"
    When the user opens the app
    Then the row shows "Россия"
    And the "Add location" action reads in Russian
