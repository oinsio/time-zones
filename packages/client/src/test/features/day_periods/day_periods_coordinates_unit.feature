Feature: Coordinates of a location for the sun
  Implements change bind-day-periods-to-sun.
  As a user I see each location coloured by the sun at its own place, or by its zone's place.

  @bind-day-periods-to-sun @FR7
  Scenario: A city with its own coordinates
    Given the location Kazan holds the coordinates 55.8, 49.1
    When its day periods are computed
    Then they are those of 55.8, 49.1, not those of the zone city Moscow

  @bind-day-periods-to-sun @FR7
  Scenario: A city stored before coordinates
    Given the location Kazan in "Europe/Moscow" holds no coordinates
    When its day periods are computed
    Then they are those of the zone coordinates of "Europe/Moscow"

  @bind-day-periods-to-sun @FR7
  Scenario: The device time location
    Given the device time zone is "Europe/Minsk"
    When the day periods of the device time location are computed
    Then they are those of the zone coordinates of "Europe/Minsk"
    And the device's coordinates were not requested

  @bind-day-periods-to-sun @FR8
  Scenario Outline: No coordinates
    Given <location>
    When its day periods are computed
    Then it has no day periods

    Examples:
      | location                                                                      |
      | UTC                                                                           |
      | a city location in a zone without zone coordinates and without its own coordinates |
      | the device time location while the device time zone has no zone coordinates   |
