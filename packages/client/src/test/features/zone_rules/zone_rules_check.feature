Feature: Zone rules check with the zone tools of the release
  As the maintainer I check the committed zone rules release against the zdump of that release, never against the zdump of my operating system.

  @build-zic-from-tzcode @FR4
  Scenario Outline: The release's own zdump checks
    Given the committed release is "2026f"
    When the zone rules check runs <mode>
    Then the zdump it runs was built from "tzcode2026f.tar.gz"
    And no zic or zdump of the operating system is run

    Examples:
      | mode                          |
      | without a compiled directory  |
      | with a compiled directory     |
