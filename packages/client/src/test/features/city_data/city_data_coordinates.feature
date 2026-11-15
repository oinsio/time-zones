Feature: Coordinates of the GeoNames cities
  As a user I want every city of the city data to know where it is, so that later features can use its sun.

  @add-city-coordinates-to-locations @FR1 @M3
  Scenario: A city carries its coordinates
    When the city data is compiled from a dump in which "Kazan" stands at 55.78874, 49.12214
    Then "Kazan" carries the coordinates 55.8, 49.1

  @add-city-coordinates-to-locations @FR1 @M3
  Scenario: Southern and western coordinates are negative
    When the city data is compiled from a dump in which "Quito" stands at -0.22985, -78.52495
    Then "Quito" carries the coordinates -0.2, -78.5

  @add-city-coordinates-to-locations @FR1 @M3
  Scenario Outline: Sample cities of the committed city data
    When the committed city data is read
    Then <city> carries exactly the coordinates <latitude>, <longitude>

    Examples:
      | city     | latitude | longitude |
      | Kazan    | 55.8     | 49.1      |
      | Quito    | -0.2     | -78.5     |
      | Murmansk | 69.0     | 33.1      |

  @add-city-coordinates-to-locations @FR1 @FR4
  Scenario: A row without coordinates stops the compile
    Given a dump in which one city row has an empty latitude
    When the city data compile command runs
    Then it fails and names the line
    And the committed city data is not changed

  @add-city-coordinates-to-locations @FR1 @FR4
  Scenario Outline: A row out of range stops the compile
    Given a dump in which one city row has <value>
    When the city data compile command runs
    Then it fails and names the line
    And the committed city data is not changed

    Examples:
      | value              |
      | the latitude 91    |
      | the longitude -181 |

  @add-city-coordinates-to-locations @FR4 @M1
  Scenario: The committed city data passes
    When the city data check runs on the committed file
    Then it passes

  @add-city-coordinates-to-locations @FR4 @M1
  Scenario Outline: A broken city data file fails
    Given committed city data with <defect>
    When the check of the city data runs
    Then it fails with an error that names <named>

    Examples:
      | defect                                 | named                     |
      | a GeoNames city without coordinates    | the city                  |
      | a GeoNames city with the latitude 91   | the city and the latitude |
      | a GeoNames city with the longitude -181 | the city and the longitude |
