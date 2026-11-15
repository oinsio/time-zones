# Spec Delta: city-data

## ADDED Requirements

### Requirement: Coordinates of the GeoNames cities
Every GeoNames city of the committed city data SHALL carry coordinates: the latitude and longitude that GeoNames gives the city, in decimal degrees, north and east positive, rounded to 0.1°. The latitude MUST be from −90 to 90 and the longitude from −180 to 180. The compile command MUST stop without writing the file when a city row has no latitude or longitude or one out of range. <!-- implements FR1, M1, M3 of add-city-coordinates-to-locations -->

#### Scenario: A city carries its coordinates
- **WHEN** the city data is compiled from a dump in which Kazan stands at 55.78874, 49.12214
- **THEN** Kazan carries the coordinates 55.8, 49.1

#### Scenario: Southern and western coordinates are negative
- **WHEN** the city data is compiled from a dump in which Quito stands at −0.22985, −78.52495
- **THEN** Quito carries the coordinates −0.2, −78.5

#### Scenario: Sample cities of the committed city data
- **WHEN** the committed city data is read
- **THEN** `<city>` carries exactly the coordinates `<latitude>`, `<longitude>`

| city | latitude | longitude |
|---|---|---|
| Kazan | 55.8 | 49.1 |
| Quito | −0.2 | −78.5 |
| Murmansk | 69.0 | 33.1 |

#### Scenario: A row without coordinates stops the compile
- **GIVEN** a dump in which one city row has an empty latitude
- **WHEN** the compile command runs
- **THEN** it fails and names the line
- **AND** the committed city data is not changed

#### Scenario: A row out of range stops the compile
- **GIVEN** a dump in which one city row has `<value>`
- **WHEN** the compile command runs
- **THEN** it fails and names the line
- **AND** the committed city data is not changed

| value |
|---|
| the latitude 91 |
| the longitude −181 |

### Requirement: Zone coordinates
A committed zone coordinates file SHALL hold the coordinates of the principal place of every zone that the zone table (`zone.tab`) of the IANA release archive lists, in decimal degrees, north and east positive, rounded to 0.1°, and MUST name the release it was read from. The zone rules compile command SHALL write it together with the release file, from the archive whose signature it verified, and MUST write neither file when any step fails. Building the app, running the tests and running CI MUST NOT request anything from IANA for it. A zone that only a zone rules update received at run time knows has no coordinates until the next app deploy. <!-- implements FR2, FR3, M3 of add-city-coordinates-to-locations -->

#### Scenario: A zone carries the coordinates of its principal place
- **GIVEN** a release archive whose zone table lists `Europe/Moscow` at `+554521+0373704`
- **WHEN** the zone rules compile command runs
- **THEN** the zone coordinates hold `Europe/Moscow` at 55.8, 37.6
- **AND** the file names the release of the archive

#### Scenario: Coordinates written in degrees and minutes
- **GIVEN** a release archive whose zone table lists `Asia/Kolkata` at `+2232+08822`
- **WHEN** the zone rules compile command runs
- **THEN** the zone coordinates hold `Asia/Kolkata` at 22.5, 88.4

#### Scenario: Sample zone cities of the committed zone coordinates
- **WHEN** the committed zone coordinates of the release 2026f are read
- **THEN** `<zone>` carries exactly the coordinates `<latitude>`, `<longitude>`

| zone | latitude | longitude |
|---|---|---|
| Europe/Moscow | 55.8 | 37.6 |
| Asia/Almaty | 43.3 | 77.0 |
| America/New_York | 40.7 | −74.0 |
| Australia/Sydney | −33.9 | 151.2 |
| Atlantic/Reykjavik | 64.2 | −21.8 |
| Pacific/Auckland | −36.9 | 174.8 |
| Pacific/Honolulu | 21.3 | −157.9 |

#### Scenario: A failed compile writes nothing
- **GIVEN** a release archive whose signature does not verify
- **WHEN** the zone rules compile command runs
- **THEN** neither the release file nor the zone coordinates file is changed

#### Scenario: No network at build time
- **WHEN** the app is built and the tests run without network access
- **THEN** both succeed and the search data holds the coordinates of the zone cities

### Requirement: Coordinates are checked
The city data check SHALL fail, naming the city, when a GeoNames city of the committed city data has no coordinates or coordinates out of range. The zone coordinates check SHALL fail, naming the offender, when the committed zone coordinates file is malformed, names another release than the bundled zone rules release, holds coordinates out of range, or leaves a zone city of the search data other than UTC without coordinates. A zone city whose zone the zone table does not list MUST take its coordinates from a named override kept with the compiler; without one the check fails. Both checks MUST run on the committed files without network access, as part of the unit tests that every pull request runs. <!-- implements FR3, FR4, M1, M2 of add-city-coordinates-to-locations -->

#### Scenario: The committed files pass
- **WHEN** the city data check and the zone coordinates check run on the committed files without network access
- **THEN** both pass

#### Scenario: A broken file fails
- **GIVEN** committed data with `<defect>`
- **WHEN** the check of that file runs
- **THEN** it fails with an error that names `<named>`

| defect | named |
|---|---|
| a GeoNames city without coordinates | the city |
| a GeoNames city with the latitude 91 | the city and the latitude |
| a GeoNames city with the longitude −181 | the city and the longitude |
| zone coordinates that name the release 2026e while 2026f is bundled | both releases |
| a zone with the latitude −91 | the zone and the latitude |
| a zone city other than UTC whose zone has no coordinates | the zone |

#### Scenario: UTC needs no coordinates
- **GIVEN** the zone coordinates hold no entry for `UTC`
- **WHEN** the zone coordinates check runs
- **THEN** it passes
