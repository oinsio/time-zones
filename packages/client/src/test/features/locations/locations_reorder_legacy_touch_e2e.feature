Feature: Reorder locations by finger on an engine without Pointer Events
  Implements change support-legacy-ios-12-safari.
  As a user of iOS Safari 12 I hold a card's handle and drag it with a finger,
  and a quick swipe over the handle still scrolls the page.

  @support-legacy-ios-12-safari @FR9 @UX2
  Scenario: Drag by finger without Pointer Events
    Given the engine has no Pointer Events
    And the screen is 375 by 600 px for the locations
    And the stored locations are "Almaty", "Moscow", "Kolkata", "Tokyo", "New York"
    And the user opens the locations app
    And the list makes the page taller than the screen
    When the user holds the handle of "Almaty" and drags it below "Moscow" with a finger
    Then the locations list order is "Moscow", "Almaty", "Kolkata", "Tokyo", "New York"
    And the page has not scrolled

  @support-legacy-ios-12-safari @FR9 @UX2
  Scenario: A quick swipe over the handle scrolls without Pointer Events
    Given the engine has no Pointer Events
    And the screen is 375 by 600 px for the locations
    And the stored locations are "Almaty", "Moscow", "Kolkata", "Tokyo", "New York"
    And the user opens the locations app
    And the list makes the page taller than the screen
    When the user swipes up over the handle of "Almaty" with a finger
    Then the page has scrolled down
    And the locations list order is "Almaty", "Moscow", "Kolkata", "Tokyo", "New York"
