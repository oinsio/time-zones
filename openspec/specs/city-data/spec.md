# city-data Specification

## Purpose
The compiled city data behind the location search: which cities it holds, how they are named, which zone, country, population and region each carries, and how the dataset is compiled from GeoNames, committed and checked.

## Requirements

### Requirement: Cities of the city data
The city data SHALL hold every GeoNames city with a population of at least 100 000 and every country capital, each with its GeoNames ID, ISO 3166-1 alpha-2 country code and population. A city that is the exemplar city of its zone MUST be held once, as the zone city with that population, and MUST NOT appear a second time as a GeoNames city. No GeoNames ID may appear twice. <!-- implements FR1 of add-geonames-city-source -->

#### Scenario: A large city that is not a zone city
- **WHEN** the city data is compiled
- **THEN** it holds Kazan in `Europe/Moscow` with the country `RU` and a population of at least 1 000 000

#### Scenario: A capital below the population threshold
- **GIVEN** a capital with a population below 100 000 that is not the exemplar city of its zone
- **WHEN** the city data is compiled
- **THEN** it holds that capital

#### Scenario: A city below the threshold
- **GIVEN** a city with a population of 99 999 that is not a capital
- **WHEN** the city data is compiled
- **THEN** it does not hold that city

#### Scenario: The exemplar city is one record
- **WHEN** the city data is compiled
- **THEN** Moscow is held once, as the zone city of `Europe/Moscow`, with a population above 10 000 000
- **AND** no GeoNames city of `Europe/Moscow` is named "Moscow"

### Requirement: City names in English and Russian
Every city of the city data SHALL have an English and a Russian name. The English name is the preferred English name of GeoNames, or the GeoNames main name when there is none. The Russian name is the preferred Russian name of GeoNames, or its first Russian name that is neither historic nor colloquial; a city with no such name MUST use its English name as the Russian one. Names MUST be non-empty. <!-- implements FR2 of add-geonames-city-source -->

#### Scenario: Both names
- **WHEN** the city data is compiled
- **THEN** the city Munich in `Europe/Berlin` is named "Munich" in English and «Мюнхен» in Russian

#### Scenario: No Russian name in GeoNames
- **GIVEN** a city whose GeoNames entry has no Russian name
- **WHEN** the city data is compiled
- **THEN** its Russian name equals its English name

#### Scenario: Historic names are not used
- **GIVEN** a city whose only preferred-less Russian names are one historic name and one current name
- **WHEN** the city data is compiled
- **THEN** its Russian name is the current name

### Requirement: Zones of the city data
Every city of the city data SHALL carry a canonical IANA zone ID that is a zone of the bundled zone rules release. A GeoNames zone ID that is an alias MUST be replaced by its canonical ID. Compiling MUST fail, naming the city and the zone, when a city's zone is not in the release. <!-- implements FR11 of add-geonames-city-source -->

#### Scenario: An alias is canonicalized
- **GIVEN** a GeoNames city whose zone is `Asia/Calcutta`
- **WHEN** the city data is compiled
- **THEN** that city's zone is `Asia/Kolkata`

#### Scenario: A zone the release does not hold
- **GIVEN** a GeoNames city whose zone is `Mars/Olympus`
- **WHEN** the city data is compiled
- **THEN** compiling fails with an error that names the city and `Mars/Olympus`
- **AND** no file is written

### Requirement: Regions of namesakes
A city of the city data, zone cities included, SHALL carry a region — its first-level administrative division, in English and Russian, the Russian one falling back to English — exactly when it is a namesake: another city of the city data has the same country and the same name in English or in Russian under the search's query normalization. A city that is not a namesake MUST carry no region. <!-- implements FR7 of add-geonames-city-source -->

#### Scenario: Namesakes carry regions
- **WHEN** the city data is compiled
- **THEN** the three cities named "Springfield" in the country `US` carry the regions "Illinois", "Missouri" and "Massachusetts"

#### Scenario: The same name in different countries
- **GIVEN** two cities named "Victoria" in different countries and no third in either country
- **WHEN** the city data is compiled
- **THEN** neither carries a region

#### Scenario: A unique name
- **WHEN** the city data is compiled
- **THEN** Kazan carries no region

### Requirement: Compiled once, committed, no network at build time
The city data SHALL be compiled from the GeoNames dumps by one maintainer command into one committed file that records the date of the dump and the licence. Compiling the same dumps twice MUST give byte-identical files. Building the app, running the tests and running CI MUST NOT request anything from GeoNames. A failed download or an unreadable dump MUST fail the command and leave the committed file unchanged. <!-- implements FR12, FR13 of add-geonames-city-source -->

#### Scenario: Deterministic output
- **WHEN** the same dumps are compiled twice
- **THEN** the two files are byte-identical

#### Scenario: The file records its source
- **WHEN** the city data is compiled from the dump of `2026-11-13`
- **THEN** the file records the dump date `2026-11-13` and the licence "CC BY 4.0"

#### Scenario: A failed download
- **GIVEN** a GeoNames dump cannot be downloaded
- **WHEN** the maintainer runs the compile command
- **THEN** the command fails with an error that names the dump
- **AND** the committed file is unchanged

#### Scenario: The build is offline
- **WHEN** the app is built without network access
- **THEN** the build succeeds and the search data file holds the cities of the committed file

### Requirement: The committed city data is checked
A check command SHALL validate the committed city data without network access and MUST run in CI on every pull request. It MUST fail, naming the first offender, when the file breaks its format or any rule of this capability, holds fewer than 6 000 GeoNames cities, or has fewer than 95% of Russian names written in Cyrillic. <!-- implements FR12, M1, M4 of add-geonames-city-source -->

#### Scenario: The committed file passes
- **WHEN** the check runs on the committed city data
- **THEN** it passes

#### Scenario: A broken file fails
- **GIVEN** a city data file with `<defect>`
- **WHEN** the check runs
- **THEN** it fails with an error that names `<named>`

| defect | named |
|---|---|
| a city whose zone is not in the zone rules release | the city and the zone |
| a repeated GeoNames ID | the ID |
| a city with an empty English name | the city's GeoNames ID |
| a namesake without a region | the city |
| 5 999 GeoNames cities | the count and the minimum |
| 94% of Russian names in Cyrillic | the share and the minimum |

#### Scenario: A zone removed by a newer release
- **GIVEN** the bundled zone rules release no longer holds a zone that a committed city uses
- **WHEN** the check runs
- **THEN** it fails and names the city and the zone

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
