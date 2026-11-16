Feature: Zone coordinates (committed files)
  As the maintainer I want the principal place of every zone committed with the zone rules, so that no build needs the network for it.

  @add-city-coordinates-to-locations @FR4 @M2
  Scenario: The committed zone coordinates pass
    When the zone coordinates check runs on the committed files without network access
    Then it passes

  @add-city-coordinates-to-locations @FR4 @M2
  Scenario Outline: A broken zone coordinates file fails
    Given committed zone coordinates with <defect>
    When the zone coordinates check runs
    Then it fails with an error that names <named>

    Examples:
      | defect                                                               | named                  |
      | zone coordinates that name the release 2026e while 2026f is bundled | both releases          |
      | a zone with the latitude -91                                         | the zone and the latitude |
      | a zone city other than UTC whose zone has no coordinates             | the zone               |

  @add-city-coordinates-to-locations @FR4
  Scenario: UTC needs no coordinates
    Given the zone coordinates hold no entry for "UTC"
    When the zone coordinates check runs
    Then it passes
