Feature: Day track by touch in a real browser
  Implements change add-time-sliders-to-location-cards.
  As a user on a phone I scroll past tracks with a swipe and pick a time with a tap.

  @add-time-sliders-to-location-cards @FR3 @NFR-R2 @fix-day-track-drag-continuity-and-smoothness @FR5
  @keep-now-button-visible-when-live @FR2
  Scenario: A vertical swipe on a track scrolls without selecting a time
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is 375 by 300 px for the locations
    And the stored locations are "Almaty", "Moscow", "Kolkata", "Tokyo", "New York"
    And the user opens the locations app
    And the page is taller than the screen
    When the user swipes up from the "Almaty" track with a finger
    Then the page has scrolled down
    And the Now button is inactive
    And the time of "Almaty" still equals the live time

  @add-time-sliders-to-location-cards @FR3 @NFR-R2 @fix-day-track-drag-continuity-and-smoothness @FR5
  @keep-now-button-visible-when-live @FR3
  Scenario: A finger tap on a track selects a time
    Given the current time is "2026-03-08T07:30:00Z"
    And the screen is 375 px wide for the locations
    And the stored locations are "Almaty", "Moscow"
    And the user opens the locations app
    When the user taps 75 percent of the "Almaty" track with a finger
    Then the card of "Almaty" shows the time "18:00"
    And the Now button is active
