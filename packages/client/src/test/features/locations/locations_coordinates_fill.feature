Feature: Stored locations gain coordinates
  As a user my older list quietly learns where its cities are; nothing I can see changes.

  @add-city-coordinates-to-locations @FR8 @UX2 @G2
  Scenario: An older list gains coordinates
    Given the stored list holds Moscow and Kazan without coordinates
    When the app is opened and the city data finishes loading
    Then Moscow holds the coordinates 55.8, 37.6
    And Kazan holds the coordinates 55.8, 49.1
    And the list was written exactly once

  @add-city-coordinates-to-locations @FR8
  Scenario: A label no record bears
    Given the stored list holds a location labelled "Old Town" in "Europe/Moscow" without coordinates
    When the app is opened and the city data finishes loading
    Then the location "Old Town" holds the coordinates 55.8, 37.6 of the zone city Moscow

  @add-city-coordinates-to-locations @FR8
  Scenario: UTC stays without coordinates
    Given the stored list holds UTC
    When the app is opened and the city data finishes loading
    Then UTC holds no coordinates
    And the list was not written

  @add-city-coordinates-to-locations @FR8
  Scenario: Nothing to give
    Given every city location of the stored list holds coordinates
    When the app is opened and the city data finishes loading
    Then the list was not written

  @add-city-coordinates-to-locations @FR8 @UX2
  Scenario: Order and home are kept
    Given the stored list is Almaty, Moscow, Kazan without coordinates and Moscow is home
    When the app is opened and the city data finishes loading
    Then the list is Almaty, Moscow, Kazan in that order
    And Moscow is home

  @add-city-coordinates-to-locations @FR8
  Scenario: The city data fails to load
    Given the stored list holds Moscow without coordinates
    When the city data fails to load
    Then Moscow holds no coordinates
    And no error is shown
    And the list was not written

  @add-city-coordinates-to-locations @FR8
  Scenario: The other open tab receives the coordinates
    Given the stored list holds Kazan without coordinates and a second tab shows the list
    When the app is opened and the city data finishes loading
    Then Kazan holds the coordinates 55.8, 49.1 in the second tab
