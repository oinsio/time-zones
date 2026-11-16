Feature: Zone rules compiler with the zone tools of the release
  As the maintainer I compile a zone rules release with the zic of that release, never with the zic of my operating system.

  @build-zic-from-tzcode @FR1
  Scenario: A bad code signature stops the compiler
    Given a tzdata archive whose signature verifies and a tzcode archive whose signature does not
    When the release "2026f" is compiled
    Then the compiler stops without writing a release and names "tzcode2026f.tar.gz"

  @build-zic-from-tzcode @FR2
  Scenario: A code version mismatch stops the compiler
    Given a tzcode archive whose version file reads "2026e"
    When the release "2026f" is compiled
    Then the compiler stops without writing a release and names "2026e" and "2026f"

  @build-zic-from-tzcode @FR3
  Scenario: The release's own zic compiles
    When the release "2026f" is compiled
    Then the zic that compiles it was built from "tzcode2026f.tar.gz"
    And no zic or zdump of the operating system is run

  @build-zic-from-tzcode @FR5
  Scenario: A failed build of the zone tools stops the compiler
    Given a tzcode archive whose make fails with exit code 2
    When the release "2026f" is compiled
    Then the compiler stops without writing a release and names "make failed (exit 2)"
