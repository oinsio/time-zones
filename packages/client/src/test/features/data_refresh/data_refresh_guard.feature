Feature: Data refresh guard
  The refreshed data is compared with the committed data before a data refresh pull request is opened or updated.

  @refresh-data-through-scheduled-pull-requests @FR2
  Scenario: Nothing but the dump date changed
    Given the committed city data was compiled from the dump of "2026-11-14"
    And the dump of "2026-12-02" gives the same cities, names, zones, regions, populations and coordinates
    When the city data refresh is compared with the committed city data
    Then the verdict is "UNCHANGED"

  @refresh-data-through-scheduled-pull-requests @FR2
  Scenario: Only the dump date differs
    Given two compiled files with the dump dates "2026-11-14" and "2026-12-02" and the same cities
    When they are compared for a refresh
    Then they hold the same city data

  @refresh-data-through-scheduled-pull-requests @FR7
  Scenario Outline: The guard decides
    Given the committed city data holds 6000 cities
    When a refresh lacks "<lost>" cities, "<largeLost>" large city and "<zoneLost>" zone, and adds "<added>" cities
    Then the verdict is "<verdict>"
    And the reasons are "<reasons>"

    Examples:
      | lost | largeLost | zoneLost | added | verdict      | reasons                  |
      | 30   | no        | no       | 0     | MERGE        | none                     |
      | 60   | no        | no       | 0     | MERGE        | none                     |
      | 61   | no        | no       | 0     | NEEDS_REVIEW | the count and the share  |
      | 0    | yes       | no       | 0     | NEEDS_REVIEW | the city                 |
      | 0    | no        | yes      | 0     | NEEDS_REVIEW | the zone                 |
      | 0    | no        | no       | 200   | MERGE        | none                     |

  @refresh-data-through-scheduled-pull-requests @FR7
  Scenario: Zone rules that lose a zone
    Given the committed release holds the identifier "Europe/Kyiv"
    When the refreshed release has no entry "Europe/Kyiv", neither a zone nor a link
    Then the zone rules verdict is "NEEDS_REVIEW" and names "Europe/Kyiv"

  @refresh-data-through-scheduled-pull-requests @FR7
  Scenario: Zone rules that lose coordinates
    Given the committed zone coordinates hold "Asia/Almaty"
    When the refreshed zone coordinates do not
    Then the zone rules verdict is "NEEDS_REVIEW" and names "Asia/Almaty"
