Feature: Day colouring in every registered view
  Implements change add-day-colouring-setting.
  Choosing a day colouring is part of the view contract: the scenarios run once
  for every registered view and name none of them.

  Background:
    Given the view under contract is shown

  @add-day-colouring-setting @view-contract @FR12
  Scenario: Plain colouring from the view
    Given the current time is "2026-03-09T06:00:00Z"
    And the stored locations are "Almaty"
    When the user opens the settings, chooses the option "Plain" and goes back
    Then every day colour of the "Almaty" row is the accent colour

  @add-day-colouring-setting @view-contract @FR12
  Scenario: Working hours colouring from the view
    Given the current time is "2026-03-09T06:00:00Z"
    And the stored locations are "Almaty"
    When the user opens the settings, chooses the option "Working hours" and goes back
    Then the "Almaty" row shows the accent colour at 12:00 and the non-working grey at 20:00 of Almaty
