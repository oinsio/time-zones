## MODIFIED Requirements

### Requirement: Compiling a release
A script SHALL compile a release by name: download `tzdata<release>.tar.gz`, `tzcode<release>.tar.gz` and their `.asc` from `https://data.iana.org/time-zones/releases/`, never a `-latest` link; verify both signatures against the pinned fingerprint of the tz coordinator's key and stop on a mismatch; build the zone tools (`zic` and `zdump`) from the code archive; compile with that `zic -b slim`, never with a `zic` of the operating system; read the 64-bit block and the footer of every TZif file; truncate to the cutoff; write the release with its name. The name in the `version` file of each archive MUST equal the requested name. <!-- implements FR7 of add-zone-rules-from-iana; FR1, FR2, FR3, FR5 of build-zic-from-tzcode -->

#### Scenario: A valid archive compiles
- **GIVEN** a tzdata archive, a tzcode archive and signatures that verify against the pinned fingerprint
- **WHEN** the release `2026f` is compiled
- **THEN** a release named `2026f` is written with the zone rules of every zone id of the archive

#### Scenario: The archive comes from the release address
- **WHEN** the release `2026f` is compiled
- **THEN** the compiler downloads `https://data.iana.org/time-zones/releases/tzdata2026f.tar.gz`, `https://data.iana.org/time-zones/releases/tzcode2026f.tar.gz` and the `.asc` of each
- **AND** no address it requests contains `-latest`

#### Scenario: A bad signature stops the compiler
- **GIVEN** an archive whose signature does not verify
- **WHEN** the release is compiled
- **THEN** the compiler stops without writing a release and names the failed check

#### Scenario: A signature by another key stops the compiler
- **GIVEN** an archive whose signature verifies, but by a key whose fingerprint is not the pinned one
- **WHEN** the release is compiled
- **THEN** the compiler stops without writing a release and names both fingerprints

#### Scenario: A version mismatch stops the compiler
- **GIVEN** an archive whose `version` file reads `2026e`
- **WHEN** the release `2026f` is compiled
- **THEN** the compiler stops without writing a release and names both versions

#### Scenario: A bad code signature stops the compiler
- **GIVEN** a tzdata archive whose signature verifies and a tzcode archive whose signature does not
- **WHEN** the release `2026f` is compiled
- **THEN** the compiler stops without writing a release and names the tzcode archive

#### Scenario: A code version mismatch stops the compiler
- **GIVEN** a tzcode archive whose `version` file reads `2026e`
- **WHEN** the release `2026f` is compiled
- **THEN** the compiler stops without writing a release and names both versions

#### Scenario: The release's own zic compiles
- **WHEN** the release `2026f` is compiled
- **THEN** the `zic` that compiles it was built from `tzcode2026f.tar.gz`
- **AND** no `zic` or `zdump` of the operating system is run

#### Scenario: A failed build of the zone tools stops the compiler
- **GIVEN** a tzcode archive whose `make` fails
- **WHEN** the release `2026f` is compiled
- **THEN** the compiler stops without writing a release and names the failed build with its exit code

#### Scenario: Truncation keeps the cutoff type
- **GIVEN** a TZif file of `Europe/Moscow` with clock changes before and after `2000-01-01T00:00:00Z`
- **WHEN** it is truncated to the cutoff
- **THEN** the cutoff type is UTC+3 `MSK` and no clock change before the cutoff is kept

### Requirement: Zone rules check against zdump
A check SHALL compare the app's lookup over the committed release with `zdump -v` of the same release compiled by `zic`, for every zone, at every clock change in 2000–2040 and one second before it, and MUST fail on one difference in offset or designation. Both `zic` and `zdump` MUST be the zone tools built from the code archive of the committed release, never those of the operating system. CI MUST run it on every pull request, and the committed release MUST pass it. <!-- implements FR8, G4 of add-zone-rules-from-iana; FR1 of add-remote-zone-rules-updates; FR4, FR6 of build-zic-from-tzcode -->

#### Scenario: The committed release passes
- **WHEN** the zone rules check runs on the committed release
- **THEN** it reports 0 differences

#### Scenario: A wrong rule fails the check
- **GIVEN** a release in which the future rule of `America/New_York` ends daylight time on the first Sunday of October
- **WHEN** the zone rules check runs
- **THEN** it fails and names `America/New_York` and the first differing instant

#### Scenario: The release's own zdump checks
- **GIVEN** the committed release is `2026f`
- **WHEN** the zone rules check runs, with or without an already compiled directory
- **THEN** the `zdump` it runs was built from `tzcode2026f.tar.gz`
- **AND** no `zic` or `zdump` of the operating system is run

#### Scenario: Ojinaga in November 2022
- **GIVEN** the committed release
- **WHEN** the local time type of `America/Ojinaga` is looked up at `<instant>`
- **THEN** it is UTC−6 `CST`, standard time

| instant |
|---|
| 2022-10-30T08:00:00Z |
| 2022-11-03T12:00:00Z |
