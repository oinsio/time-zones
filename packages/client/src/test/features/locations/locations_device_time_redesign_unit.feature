Feature: Device time location in the redesigned cards
  Implements change redesign-cards-grid-and-day-palettes.
  As a user I see the device time location with the Here mark without a caption, and I move it with its menu.

  @redesign-cards-grid-and-day-palettes @FR15 @FR16
  Scenario: Reorder below a city
    Given the device time zone is "Asia/Almaty"
    And the interface language is "en"
    And the list is "the device time location, Moscow, New York"
    When the user opens the app
    And the user chooses "Move down" 2 times in the menu of the device time location
    Then the list is "Moscow, New York, the device time location"
    And the announcement says the device time location "Almaty" is at position 3 of 3

  @redesign-cards-grid-and-day-palettes @FR18
  Scenario: Device time zone line and Here mark without a caption
    Given the device time zone is "Europe/Berlin"
    And the interface language is "en"
    And the current instant is "2026-01-15T12:00:00Z"
    And the list is "the device time location"
    When the user opens the app
    Then the device time zone line elements are "Device time", "CET" and "UTC+1"
    And the device time location shows the Here mark without a visible caption
