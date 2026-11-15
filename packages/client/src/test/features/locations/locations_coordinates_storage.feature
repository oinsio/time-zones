Feature: Coordinates are kept on the device
  As a user my cities keep their place on Earth when I reopen the app, offline and in every tab.

  @add-city-coordinates-to-locations @FR7
  Scenario: Coordinates survive a reload
    Given the user added Kazan with the coordinates 55.8, 49.1
    When the app is opened again without a network connection
    Then the location Kazan holds the coordinates 55.8, 49.1

  @add-city-coordinates-to-locations @FR7
  Scenario: A list stored before coordinates
    Given a version 3 stored list holds the device time location, Moscow and Almaty, and Moscow is home
    When the app is opened
    Then the list is the device time location, Moscow, Almaty without coordinates
    And Moscow is home
    And the stored list was not written on load

  @add-city-coordinates-to-locations @FR7
  Scenario: A document newer than the app
    Given the stored list has the document version 5
    When the app is opened
    Then the stored list is unreadable
