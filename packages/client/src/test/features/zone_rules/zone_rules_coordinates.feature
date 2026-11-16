Feature: Zone coordinates
  As the maintainer I want the principal place of every zone committed with the zone rules, so that no build needs the network for it.

  @add-city-coordinates-to-locations @FR2 @M3
  Scenario: A zone carries the coordinates of its principal place
    Given a release archive whose zone table lists "Europe/Moscow" at "+554521+0373704"
    When the zone rules compile command runs
    Then the zone coordinates hold "Europe/Moscow" at 55.8, 37.6
    And the file names the release of the archive

  @add-city-coordinates-to-locations @FR2 @M3
  Scenario: Coordinates written in degrees and minutes
    Given a release archive whose zone table lists "Asia/Kolkata" at "+2232+08822"
    When the zone rules compile command runs
    Then the zone coordinates hold "Asia/Kolkata" at 22.5, 88.4

  @add-city-coordinates-to-locations @FR2 @M3
  Scenario Outline: Sample zone cities of the committed zone coordinates
    When the committed zone coordinates of the release 2026f are read
    Then <zone> carries exactly the coordinates <latitude>, <longitude>

    Examples:
      | zone               | latitude | longitude |
      | Europe/Moscow      | 55.8     | 37.6      |
      | Asia/Almaty        | 43.3     | 77.0      |
      | America/New_York   | 40.7     | -74.0     |
      | Australia/Sydney   | -33.9    | 151.2     |
      | Atlantic/Reykjavik | 64.2     | -21.8     |
      | Pacific/Auckland   | -36.9    | 174.8     |
      | Pacific/Honolulu   | 21.3     | -157.9    |

  @add-city-coordinates-to-locations @FR3
  Scenario: A failed compile writes nothing
    Given a release archive whose signature does not verify
    When the zone rules compile command runs
    Then neither the release file nor the zone coordinates file is changed

  @add-city-coordinates-to-locations @FR3
  Scenario: No network at build time
    When the search data is loaded without network access
    Then no request is made
    And the search data holds the coordinates of the zone cities
