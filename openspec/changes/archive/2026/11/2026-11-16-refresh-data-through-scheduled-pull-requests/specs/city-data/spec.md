# Spec Delta: city-data

## MODIFIED Requirements

### Requirement: Compiled once, committed, no network at build time
The city data SHALL be compiled from the GeoNames dumps by one compile command into one committed file that records the date of the dump and the licence. The command is run by a maintainer or by the city data refresh (see the `app-delivery` capability); no other automated run MUST contact GeoNames: building the app, running the tests, the checks of a pull request and the deploy MUST NOT request anything from GeoNames. Compiling the same dumps twice MUST give byte-identical files. A failed download or an unreadable dump MUST fail the command and leave the committed file unchanged. Two compiled files that differ in nothing but the recorded dump date hold the same city data, and the city data refresh MUST NOT publish the newer one. <!-- implements FR12, FR13 of add-geonames-city-source; FR2 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: Deterministic output
- **WHEN** the same dumps are compiled twice
- **THEN** the two files are byte-identical

#### Scenario: The file records its source
- **WHEN** the city data is compiled from the dump of `2026-11-13`
- **THEN** the file records the dump date `2026-11-13` and the licence "CC BY 4.0"

#### Scenario: A failed download
- **GIVEN** a GeoNames dump cannot be downloaded
- **WHEN** the compile command runs
- **THEN** the command fails with an error that names the dump
- **AND** the committed file is unchanged

#### Scenario: The build is offline
- **WHEN** the app is built without network access
- **THEN** the build succeeds and the search data file holds the cities of the committed file

#### Scenario: Pull request checks are offline
- **WHEN** the checks of a data refresh pull request run
- **THEN** they request nothing from GeoNames

#### Scenario: Only the dump date differs
- **GIVEN** two compiled files with the dump dates `2026-11-14` and `2026-12-02` and the same cities
- **WHEN** they are compared for a refresh
- **THEN** they hold the same city data
