Feature: Locations in every registered view
  Implements change add-locations-via-search.
  Adding and removing a location is part of the view contract: these
  scenarios run once for every registered view and name none of them.

  Background:
    Given the view under contract is shown

  @add-locations-via-search @view-contract @FR8 @UX4
  Scenario: Add a location from the search
    When the user adds "Moscow" from the search
    Then the search is closed
    And the locations list shows "Moscow"

  @add-locations-via-search @view-contract @NFR-A2
  Scenario: Add with the keyboard
    Given the stored locations are "Moscow"
    When the user opens the search with Enter, types "Tokyo", presses Down and Enter
    Then the locations list shows "Tokyo"
    And focus is on the "Add location" action

  @add-locations-via-search @view-contract @NFR-A2 @FR17
  Scenario: Add the first location with the keyboard
    When the user opens the search with Enter, types "Tokyo", presses Down and Enter
    Then the locations list shows "Tokyo"
    And the locations list holds 1 location
    And focus is on the "Add location" action

  @add-locations-via-search @view-contract @NFR-A2
  Scenario: Close with Esc
    When the user opens the search with Enter and presses Esc
    Then the search is closed
    And focus is on the "Add location" action

  @add-locations-via-search @view-contract @NFR-A2
  Scenario: The active search option stays in view
    When the user opens the search, types "a" and presses Down 15 times
    Then the active search option is in view

  @add-locations-via-search @view-contract @FR10
  Scenario: Remove a location
    Given the stored locations are "Almaty", "Moscow"
    When the user removes "Moscow"
    Then the locations list holds 1 location
    And the locations list does not show "Moscow"

  @add-locations-via-search @view-contract @NFR-A3
  Scenario: Focus after removal
    Given the stored locations are "Almaty", "Moscow", "Kolkata"
    When the user removes "Moscow" with the keyboard
    Then focus is on the remove action of "Kolkata"

  @add-locations-via-search @view-contract @NFR-A3
  Scenario: Focus after the last removal
    Given the stored locations are "Moscow"
    When the user removes "Moscow" with the keyboard
    Then focus is on the "Add location" action

  @add-locations-via-search @view-contract @NFR-A1 @UX5 @M3
  Scenario Outline: Accessibility in the <state> state in the <theme> theme
    Given the locations screen uses the <theme> theme
    When the locations are in the <state> state
    Then the locations screen has no accessibility violations
    And the list and the search use the <theme> theme token colours

    Examples:
      | state               | theme |
      | list                | light |
      | list                | dark  |
      | empty               | light |
      | empty               | dark  |
      | unreadable          | light |
      | unreadable          | dark  |
      | storage unavailable | light |
      | storage unavailable | dark  |
      | search loading      | light |
      | search loading      | dark  |
      | search error        | light |
      | search error        | dark  |
      | suggestions         | light |
      | suggestions         | dark  |
      | results             | light |
      | results             | dark  |
      | no matches          | light |
      | no matches          | dark  |
