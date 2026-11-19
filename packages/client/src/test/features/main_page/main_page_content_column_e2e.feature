Feature: Content column of the main page in a real browser
  Implements change redesign-cards-grid-and-day-palettes.
  The header, the list and the date bar group sit in one centred column of at most 1120 px.

  @redesign-cards-grid-and-day-palettes @FR12 @NFR-R1 @UX4
  Scenario Outline: The column is centred on a wide screen at <width> px in <view>
    Given the view mode is <view>
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the header, the list and the date bar group are at most 1120 px wide
    And their centre is the centre of the page width
    And the main page does not scroll horizontally

    Examples:
      | width | view  |
      | 1440  | Cards |
      | 2560  | Cards |
      | 1440  | Grid  |
      | 2560  | Grid  |

  @redesign-cards-grid-and-day-palettes @FR12 @UX4
  Scenario: The bars span the viewport
    Given the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow"
    And the screen is 1440 by 900 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    Then the meeting bar is as wide as the viewport
    And the date bar is as wide as the viewport
    And the date bar group is at most 1120 px wide and centred

  @redesign-cards-grid-and-day-palettes @FR12 @UX4
  Scenario: The empty state sits in the column
    Given the stored list is empty
    And the screen is 2560 px wide for the locations
    When the user opens the locations app
    Then the empty-state explanation lies inside a centred column at most 1120 px wide
