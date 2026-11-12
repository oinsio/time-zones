Feature: Zone rules release
  As the maintainer I compile and check a zone rules release from a signed IANA archive.

  @add-zone-rules-from-iana @FR2
  Scenario: A local time type
    When a local time type of the release is read
    Then it holds a UTC offset in seconds, a tzdb designation and a daylight saving flag

  @add-zone-rules-from-iana @FR2
  Scenario: A zone with a future rule
    When the zone rules of "America/New_York" are read from the release
    Then its cutoff type is UTC−5 "EST"
    And its listed clock changes end in 2007
    And its future rule is "EST5EDT,M3.2.0,M11.1.0"

  @add-zone-rules-from-iana @FR2
  Scenario: A zone whose last type holds forever
    When the zone rules of "Asia/Almaty" are read from the release "2026f"
    Then its listed clock changes end with "2024-02-29T18:00:00Z" to UTC plus 5 "+05"
    And it has a standard-only future rule "<+05>-5"

  @add-zone-rules-from-iana @FR2
  Scenario: A zone whose listed changes end before the cutoff
    When the zone rules of "Europe/Dublin" are read from the release "2026f"
    Then it lists no clock change after the cutoff
    And its cutoff type is UTC plus 0 "GMT" with the daylight saving flag set, as its future rule "IST-1GMT0,M10.5.0,M3.5.0/1" gives at "2000-01-01T00:00:00Z"

  @add-zone-rules-from-iana @FR2
  Scenario: A link resolves to its target's rules
    When the zone rules of "Asia/Calcutta" are read
    Then they equal the zone rules of "Asia/Kolkata"

  @add-zone-rules-from-iana @FR2
  Scenario: The release carries its name
    When a release compiled from "tzdata2026f.tar.gz" is read
    Then its release name is "2026f"

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

  @add-zone-rules-from-iana @FR8 @G4
  Scenario: The committed release passes
    When the zone rules check runs on the committed release "2026f"
    Then it reports 0 differences

  @add-zone-rules-from-iana @FR8 @G4
  Scenario: A wrong rule fails the check
    Given a release in which the future rule of "America/New_York" ends daylight time on the first Sunday of October
    When the zone rules check runs
    Then it fails and names "America/New_York" and the first differing instant
