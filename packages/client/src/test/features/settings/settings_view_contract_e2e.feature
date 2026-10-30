Feature: Settings in every registered view
  Implements change add-settings-page-and-device-time-location.
  Switching the hour format and the theme is part of the view contract: the
  scenarios run once for every registered view and name none of them.

  Background:
    Given the view under contract is shown

  @add-settings-page-and-device-time-location @view-contract @FR17
  Scenario: Switch the hour format from the view
    Given the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty"
    When the user opens the settings, chooses the option "12-hour" and goes back
    Then the time of "Almaty" reads "12:30 PM"

  @add-settings-page-and-device-time-location @view-contract @FR17
  Scenario: Switch the theme from the view
    Given the system colour scheme is light
    When the user opens the settings
    And the user chooses the option "Dark"
    Then the page background is the dark token colour
