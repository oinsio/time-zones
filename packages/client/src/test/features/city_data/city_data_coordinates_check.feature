Feature: Coordinates of the GeoNames cities (committed data)
  As a user I want every city of the city data to know where it is, so that later features can use its sun.

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
