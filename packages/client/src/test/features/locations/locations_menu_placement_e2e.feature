Feature: The location menu stays in view in a real browser
  Implements change keep-location-menu-in-view-and-clear-range-after-share.
  An open location menu lies inside the screen: under its button when it fits, otherwise above it, otherwise on the larger side with items that scroll.

  @keep-location-menu-in-view-and-clear-range-after-share @FR1 @FR4 @NFR-R1 @UX1 @M1 @M2
  Scenario Outline: The menu of the last row opens above its button in <view> at <width> by <height> px
    Given the locations interface language is English
    And the view mode is <view>
    And the list has 12 locations
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    And the user scrolls to the end
    And the page scroll offset is noted
    And the user opens the location menu of the last row
    Then the menu lies above its button
    And the open menu lies inside the screen
    And the page scroll offset is the same as before the menu opened

    Examples:
      | view  | width | height |
      | Cards | 320   | 568    |
      | Cards | 390   | 844    |
      | Cards | 844   | 390    |
      | Grid  | 320   | 568    |
      | Grid  | 390   | 844    |
      | Grid  | 844   | 390    |

  @keep-location-menu-in-view-and-clear-range-after-share @FR1 @FR4 @NFR-R1 @UX1 @M1 @M2
  Scenario Outline: The menu of the first row opens under its button in <view> at <width> by <height> px
    Given the locations interface language is English
    And the view mode is <view>
    And the list has 12 locations
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    And the page scroll offset is noted
    And the user opens the location menu of the first row
    Then the menu lies under its button
    And the open menu lies inside the screen
    And the page scroll offset is the same as before the menu opened

    Examples:
      | view  | width | height |
      | Cards | 320   | 568    |
      | Cards | 390   | 844    |
      | Cards | 844   | 390    |
      | Grid  | 320   | 568    |
      | Grid  | 390   | 844    |
      | Grid  | 844   | 390    |

  @keep-location-menu-in-view-and-clear-range-after-share @FR3
  Scenario: The menu follows a scroll
    Given the locations interface language is English
    And the view mode is Grid
    And the list has 12 locations
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user opens the location menu of the first row
    And the page is scrolled by 100 px
    Then the menu stays next to its button
    And the open menu lies inside the screen

  @keep-location-menu-in-view-and-clear-range-after-share @FR2 @NFR-A2 @UX2
  Scenario Outline: Every item of a limited menu can be reached by the keyboard in <view>
    Given the locations interface language is English
    And the view mode is <view>
    And the list has 12 locations
    And the screen is 844 by 300 px for the locations
    When the user opens the locations app
    And the page is scrolled so that a row's location menu button is in the middle of the viewport
    And the user opens the location menu of the middle row
    Then the open menu lies inside the screen
    And the menu items can be reached one by one with the arrow keys inside the screen

    Examples:
      | view  |
      | Cards |
      | Grid  |

  @keep-location-menu-in-view-and-clear-range-after-share @NFR-A1
  Scenario Outline: The menu lies over the date bar in <view>
    Given the locations interface language is English
    And the view mode is <view>
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the page is scrolled so that the menu of "Tokyo" opens under its button and reaches over the date bar
    And the user opens the location menu of "Tokyo"
    Then the menu of "Tokyo" lies under its button
    And every menu item over the date bar has that menu item on top

    Examples:
      | view  |
      | Cards |
      | Grid  |

  @keep-location-menu-in-view-and-clear-range-after-share @NFR-A1 @M5
  Scenario Outline: No accessibility violations with the menu opened above in <view>, <theme> theme
    Given the locations interface language is English
    And the view mode is <view>
    And the locations screen uses the <theme> theme
    And the list has 12 locations
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user scrolls to the end
    And the user opens the location menu of the last row
    Then the menu lies above its button
    And the locations screen has no accessibility violations

    Examples:
      | view  | theme |
      | Cards | light |
      | Cards | dark  |
      | Grid  | light |
      | Grid  | dark  |
