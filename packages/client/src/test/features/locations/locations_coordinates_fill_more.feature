Feature: Stored locations gain coordinates (fallbacks and tabs)
  As a user my older list quietly learns where its cities are; nothing I can see changes.

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
