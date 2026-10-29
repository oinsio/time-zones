Feature: Home location in every registered view
  Implements change set-home-location-and-show-differences.
  Setting and clearing home is part of the view contract: the scenario runs once
  for every registered view and names none of them.

  Background:
    Given the view under contract is shown

  @set-home-location-and-show-differences @view-contract @FR13
  Scenario: Set and clear home
    Given the stored locations are "Almaty", "Moscow"
    When the user chooses "Make home" in the location menu of "Moscow"
    Then the row of "Moscow" has a mark named "Home location"
    And the offset difference of "Almaty" reads "+2 h"
    When the user chooses "Clear home" in the location menu of "Moscow"
    Then the row of "Moscow" has no mark named "Home location"
