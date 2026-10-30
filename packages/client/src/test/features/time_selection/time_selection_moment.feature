Feature: Time selection and the reference moment
  Implements change add-time-sliders-to-location-cards.
  As a user I return to now, change the date and open other tabs without losing or storing the selected time.

  @add-time-sliders-to-location-cards @FR5
  Scenario: Now after selecting a time
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    And the app is open
    When the user selects three quarters of a track
    Then the Now button is shown
    When the user returns to now
    Then the moment is live
    And the "Almaty" card shows "12:30"
    And every handle stands at 0.520833

  @add-time-sliders-to-location-cards @FR5
  Scenario: A date change keeps the selected time
    Given the device time zone is "Asia/Almaty"
    And the current instant is "2026-03-08T07:30:00Z"
    And the list contains "Almaty"
    And the app is open
    And the user selects three quarters of a track
    When the user moves to the next day
    Then the moment is pinned to "2026-03-09T13:00:00Z"
    And every handle stands at 0.75

  @add-time-sliders-to-location-cards @FR8 @M7
  Scenario: Time selections store nothing
    Given the list contains "Almaty"
    And the app is open
    When the user makes 20 time selections and then returns to now
    Then the stored list was not written

  @add-time-sliders-to-location-cards @FR8
  Scenario: The selected time survives a list change in another tab
    Given the device time zone is "Asia/Almaty"
    And the list contains "Almaty"
    And the app is open
    And the user selects three quarters of a track
    When another tab adds "Moscow" to the list
    Then the moment is pinned to "2026-03-08T13:00:00Z"
    And the "Moscow" card shows "16:00"

  @add-time-sliders-to-location-cards @NFR-P1 @replace-wall-clock-row-budgets-with-deterministic-checks @FR1 @fix-day-track-handle-overlap-and-end-of-day @NFR-P1
  Scenario: 50 rows within the time-selection budget
    Given 50 locations whose rows have been presented at "2026-03-08T07:30:00Z" with the device time zone "UTC"
    When a time selection pins "2026-03-08T18:00:00Z" and the rows are presented again
    Then no date, time or region name formatter is built
    And no time zone transition is looked up
    And every row's handle stands at 0.75
