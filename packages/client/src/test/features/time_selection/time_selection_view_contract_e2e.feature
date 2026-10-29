Feature: Time selection in every registered view
  Implements change add-time-sliders-to-location-cards.
  Selecting a time and returning to now is part of the view contract: this
  scenario runs once for every registered view and names none of them.

  Background:
    Given the view under contract is shown
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"

  @add-time-sliders-to-location-cards @view-contract @FR3 @FR5
  Scenario: Select a time
    When the user moves the time of "Moscow" one hour forward
    Then the card of "Almaty" shows the time "13:30"
    And the card of "Moscow" shows the time "11:30"
    When the user returns to now with the bar
    Then the card of "Almaty" shows the time "12:30"
    And the card of "Moscow" shows the time "10:30"

  @add-wall-time-input-with-hint @view-contract @FR12
  Scenario: Type an exact time
    When the user types "1145" in the wall-time input of "Moscow"
    Then the card of "Almaty" shows the time "13:45"
    And the card of "Moscow" shows the time "11:45"
    When the user returns to now with the bar
    Then the card of "Almaty" shows the time "12:30"
    And the card of "Moscow" shows the time "10:30"
