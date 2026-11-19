Feature: Reorder locations from the menu
  Implements change redesign-cards-grid-and-day-palettes.
  As a user I move a location up or down from its menu, with the keyboard too

  @reorder-locations-by-drag-and-drop @FR8 @redesign-cards-grid-and-day-palettes @FR16
  Scenario: Russian interface
    Given the interface language is Russian
    When the list "Moscow, Almaty" is shown
    Then the menu of "Moscow" offers the Russian move actions "Поднять выше" and "Опустить ниже"

  @redesign-cards-grid-and-day-palettes @FR16
  Scenario: Move up from the menu
    Given the list "Almaty, Moscow, Kolkata" is shown
    When the user chooses "Move up" in the menu of "Moscow"
    Then the list was asked to move "Moscow" to position 1
    And the focus stays on the menu button of "Moscow"

  @redesign-cards-grid-and-day-palettes @FR16
  Scenario: Move down with the keyboard only
    Given the list "Almaty, Moscow, Kolkata" is shown
    When the user opens the menu of "Almaty" with the keyboard and chooses "Move down" with the arrow keys and Enter
    Then the list was asked to move "Almaty" to position 2

  @redesign-cards-grid-and-day-palettes @FR16
  Scenario: Items that cannot apply are disabled
    Given the list "Almaty, Moscow, Kolkata" is shown
    Then in the menu of "Almaty" "Move up" is disabled and "Move down" is enabled
    And in the menu of "Kolkata" "Move down" is disabled and "Move up" is enabled

  @redesign-cards-grid-and-day-palettes @FR16
  Scenario: Menu order
    Given the list "Almaty, Moscow" is shown
    Then the menu of "Moscow" offers "Make home, Move up, Move down, Remove" in that order
