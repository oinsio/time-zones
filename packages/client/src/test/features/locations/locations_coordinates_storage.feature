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

  @add-city-coordinates-to-locations @FR7
  Scenario Outline: Malformed coordinates make the list unreadable
    Given the stored entry of Moscow has <coordinates>
    When the app is opened
    Then the stored list is unreadable
    And the stored value is not overwritten

    Examples:
      | coordinates                   |
      | a latitude and no longitude   |
      | the latitude "55.8" as text   |
      | the latitude 91               |
      | the longitude -181            |

  @add-city-coordinates-to-locations @FR7 @FR9
  Scenario: The device time location is stored without coordinates
    Given the list is the device time location and Kazan
    When the list is written
    Then the stored entry of the device time location holds no coordinates

  @add-city-coordinates-to-locations @FR7
  Scenario: A stored device time location with coordinates
    Given the stored entry of the device time location holds coordinates
    When the app is opened
    Then the stored list is unreadable

  @add-city-coordinates-to-locations @FR7
  Scenario: Another tab receives the coordinates
    Given the app is open in two tabs
    When the user adds Kazan with the coordinates 55.8, 49.1 in the first tab
    Then the location Kazan of the second tab holds the coordinates 55.8, 49.1
