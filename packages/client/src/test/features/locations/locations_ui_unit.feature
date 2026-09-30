Feature: Locations in the Cards view
  Implements change add-locations-via-search.
  As a user I keep a list of places: I add them from the search, see them with their country and remove them.

  @add-locations-via-search @FR10 @UX4
  Scenario: Rows show city and country
    Given the interface language is English
    And the stored list is "Almaty", "Moscow"
    When the user opens the app
    Then the rows are "Almaty" with "Kazakhstan" and "Moscow" with "Russia"

  @add-locations-via-search @FR10 @FR17
  Scenario: Empty state after the last removal
    Given the stored list is "Moscow"
    And the user opened the app
    When the user removes "Moscow"
    Then the empty state with the "Add location" action is shown

  @add-locations-via-search @FR6 @UX1
  Scenario: Search opened
    Given the user opened the app
    When the user opens the search
    Then popular locations are shown as suggestions

  @add-locations-via-search @FR8 @UX4
  Scenario: Add from results
    Given the user opened the app
    When the user searches for "New York" and chooses "New York"
    Then the search is closed
    And the list contains "New York"

  @add-locations-via-search @FR8
  Scenario: Already added
    Given the stored list is "Moscow"
    And the user opened the app
    When the user searches for "Moscow"
    Then "Moscow" is marked as added and cannot be chosen

  @add-locations-via-search @FR5 @UX2
  Scenario: Results follow typing
    Given the user opened the app
    When the user types "Mos" one character at a time
    Then the results change after each character

  @add-locations-via-search @FR6 @UX1
  Scenario: Query cleared
    Given the user opened the app
    And the user typed "Mos" in the search
    When the user clears the query
    Then popular locations are shown as suggestions

  @add-locations-via-search @FR7 @UX1
  Scenario: Nothing found
    Given the user opened the app
    When the user searches for "qqqq"
    Then the no-results message and the hint are shown
