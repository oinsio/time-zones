Feature: Coordinates of a city location (duplicates and rows)
  As a user my cities know where they are, and nothing about my list changes.

  @add-city-coordinates-to-locations @FR6
  Scenario: The device time location
    Given the device time zone is "Europe/Moscow"
    When the user adds the device time location
    Then the device time location holds no coordinates

  @add-city-coordinates-to-locations @FR6
  Scenario: A namesake of the same zone is still a duplicate
    Given the list holds "Springfield" in "America/Chicago" with the coordinates 39.8, -89.6
    When the user adds "Springfield" in "America/Chicago" with the coordinates 37.2, -93.3
    Then the location is rejected as a duplicate
    And the listed "Springfield" keeps the coordinates 39.8, -89.6

  @add-city-coordinates-to-locations @FR9 @UX1
  Scenario Outline: Rows are unchanged
    Given the list holds "Kazan" with coordinates
    When the list is shown for the <view>
    Then every row shows the same content as for "Kazan" without coordinates, apart from the colours of its day track

    Examples:
      | view                                |
      | Cards view                          |
      | Grid view with differences from home |
