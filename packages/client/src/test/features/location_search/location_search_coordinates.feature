Feature: City records carry coordinates
  As a user I see the same search as before; the records behind it know where they are.

  @add-city-coordinates-to-locations @FR5
  Scenario: A GeoNames city result
    When the user searches for "Kazan"
    Then the result "Kazan" carries the coordinates 55.8, 49.1

  @add-city-coordinates-to-locations @FR5
  Scenario: A zone city result
    When the user searches for "Moscow"
    Then the result "Moscow" carries the coordinates 55.8, 37.6

  @add-city-coordinates-to-locations @FR5
  Scenario: An abbreviation result
    When the user searches for "IST"
    Then the result "Kolkata" carries the coordinates 22.5, 88.4

  @add-city-coordinates-to-locations @FR5
  Scenario: A suggestion carries the coordinates of its zone
    When the user opens the search without typing
    Then the suggestion "Moscow" carries the coordinates 55.8, 37.6

  @add-city-coordinates-to-locations @FR5
  Scenario: UTC has no coordinates
    When the user searches for "UTC"
    Then the result "UTC" carries no coordinates

  @add-city-coordinates-to-locations @FR5 @UX1
  Scenario: Results are unchanged
    When each of 13 sample queries is run over the full data
    Then the results, their order and their texts are the same as without coordinates
