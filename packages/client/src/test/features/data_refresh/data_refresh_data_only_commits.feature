Feature: Data-only commits
  The commit a data refresh pull request leaves on main ends with the trailer, and a data refresh branch changes only the data paths of its source.

  @refresh-data-through-scheduled-pull-requests @FR5
  Scenario: The commit of a zone rules refresh
    When the pull request "Update zone rules to 2026g" with the number 140 merges
    Then the commit on main has the subject "Update zone rules to 2026g (#140)"
    And the last line of its message is "Data-Only: true"

  @refresh-data-through-scheduled-pull-requests @FR5
  Scenario: The commit of a city data refresh
    When the pull request "Refresh city data to the dump of 2026-12-02" merges
    Then the last line of the commit's message on main is "Data-Only: true"

  @refresh-data-through-scheduled-pull-requests @FR5
  Scenario: The commit of a CLDR update
    When the CLDR pull request "Bump the cldr group with 2 updates" of the dependency bot with the number 150 merges
    Then the subject of the commit on main is the dependency bot's title followed by "(#150)"
    And the last line of its message is "Data-Only: true"

  @refresh-data-through-scheduled-pull-requests @FR6
  Scenario: Data paths of each source
    When the data paths of a source are named
    Then they are the zone rules directory for the zone rules, the city data directory for the city data, and the two CLDR version entries of the client package manifest with the lockfile for CLDR

  @refresh-data-through-scheduled-pull-requests @FR6
  Scenario Outline: A data refresh branch with other changes
    Given a pull request on the data refresh branch of "<source>" that changes "<path>"
    When the pull request checks run
    Then the data-only check "<outcome>"

    Examples:
      | source     | path                                          | outcome                      |
      | zone-rules | packages/client/zone-rules/release.json       | passes                       |
      | zone-rules | packages/client/zone-rules/zone-coordinates.json | passes                    |
      | zone-rules | packages/client/src/main.tsx                  | fails and names the file     |
      | city-data  | packages/client/city-data/geonames-cities.json | passes                      |
      | city-data  | packages/client/zone-rules/release.json       | fails and names the file     |
      | cldr       | pnpm-lock.yaml                                | passes                       |
      | cldr       | "react": "19.1.0",                            | fails and names the entry    |

  @refresh-data-through-scheduled-pull-requests @FR5
  Scenario: An ordinary pull request
    When a pull request on the branch "feature/search-by-region" is merged
    Then the automation added no "Data-Only" trailer to its commit
