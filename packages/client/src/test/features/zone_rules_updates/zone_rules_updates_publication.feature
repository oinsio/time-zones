Feature: Zone rules publication
  The publication compiles a newer IANA release and serves it; its decision and its served files are tested here.

  @add-remote-zone-rules-updates @FR1
  Scenario: The newest release in the listing
    Given the releases listing holds "tzdata2026f.tar.gz", "tzdata2026z.tar.gz", "tzdata2026aa.tar.gz" and "tzcode2026ab.tar.gz"
    When the newest release is determined
    Then it is "2026aa"

  @add-remote-zone-rules-updates @FR1
  Scenario Outline: Already current
    Given the committed release is "<committed>" and the newest listed release is "2026f"
    When the workflow decides which release to publish
    Then it stops reporting "already current" and commits nothing

    Examples:
      | committed |
      | 2026f     |
      | 2026g     |

  @add-remote-zone-rules-updates @FR1
  Scenario: A newer release
    Given the committed release is "2026f" and the newest listed release is "2026g"
    When the workflow decides which release to publish
    Then "2026g" is the release to compile, check, commit and deploy

  @add-remote-zone-rules-updates @FR2
  Scenario: Files in the build
    When the served files are built for the bundled release
    Then "zone-rules/version.json" names the bundled release and a "publishedAt" ending in "Z"
    And the release file equals the bundled release asset

  @add-remote-zone-rules-updates @FR2 @NFR-P1
  Scenario: Not precached
    When the precache manifest of a service worker is read
    Then it lists neither "zone-rules/version.json" nor a release file
    And it still lists the bundled release asset
