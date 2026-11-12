Feature: Zone rules compiler
  As the maintainer I compile a zone rules release from a signed IANA archive.

  @add-zone-rules-from-iana @FR7
  Scenario: A valid archive compiles
    Given a tzdata archive and a signature that verifies against the pinned fingerprint
    When the release "2026f" is compiled
    Then a release named "2026f" is written with the zone rules of every zone id of the archive

  @add-zone-rules-from-iana @FR7
  Scenario: The archive comes from the release address
    When the release "2026f" is compiled
    Then the compiler downloads "https://data.iana.org/time-zones/releases/tzdata2026f.tar.gz" and "https://data.iana.org/time-zones/releases/tzdata2026f.tar.gz.asc"
    And no address it requests contains "-latest"

  @add-zone-rules-from-iana @FR7
  Scenario: A bad signature stops the compiler
    Given an archive whose signature does not verify
    When the release "2026f" is compiled
    Then the compiler stops without writing a release and names the failed check

  @add-zone-rules-from-iana @FR7
  Scenario: A signature by another key stops the compiler
    Given an archive whose signature verifies, but by a key whose fingerprint is not the pinned one
    When the release "2026f" is compiled
    Then the compiler stops without writing a release and names both fingerprints

  @add-zone-rules-from-iana @FR7
  Scenario: A version mismatch stops the compiler
    Given an archive whose version file reads "2026e"
    When the release "2026f" is compiled
    Then the compiler stops without writing a release and names both versions

  @add-zone-rules-from-iana @FR7
  Scenario: Truncation keeps the cutoff type
    Given a TZif file of "Europe/Moscow" with clock changes before and after "2000-01-01T00:00:00Z"
    When it is truncated to the cutoff
    Then the cutoff type is UTC plus 3 "MSK" and no clock change before the cutoff is kept
