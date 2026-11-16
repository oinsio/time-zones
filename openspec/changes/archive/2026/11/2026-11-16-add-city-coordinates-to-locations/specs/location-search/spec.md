# Spec Delta: location-search

## ADDED Requirements

### Requirement: City records carry coordinates
Every city record the search offers SHALL carry coordinates, except the UTC record, which carries none. A GeoNames city MUST carry the coordinates of the city data; a zone city MUST carry the zone coordinates of its zone. A result matched by a zone abbreviation and a suggestion are zone cities and MUST carry the coordinates of their zone. Coordinates MUST NOT change which results a query returns, their order or their text, and MUST NOT be searchable or shown. <!-- implements FR5, UX1 of add-city-coordinates-to-locations -->

#### Scenario: A GeoNames city result
- **WHEN** the user searches for "Kazan"
- **THEN** the result Kazan carries the coordinates 55.8, 49.1

#### Scenario: A zone city result
- **WHEN** the user searches for "Moscow"
- **THEN** the result Moscow carries the coordinates 55.8, 37.6

#### Scenario: An abbreviation result
- **WHEN** the user searches for `IST`
- **THEN** the result Kolkata carries the coordinates 22.5, 88.4

#### Scenario: UTC has no coordinates
- **WHEN** the user searches for "UTC"
- **THEN** the result UTC carries no coordinates

#### Scenario: Results are unchanged
- **WHEN** each of the 13 sample queries is run over the full data
- **THEN** the results, their order and their texts are the same as without coordinates

## MODIFIED Requirements

### Requirement: Search is fast and lazy
Computing the results of one query over the full bundled data SHALL take at most 50 ms. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound with two parts. Preparing loaded search data for search happens once, during the first query over that data, and MUST build at most one country-name formatter per city-name language. Every non-empty query over prepared search data MUST normalize exactly one text, the query itself, MUST build at most one collator and MUST build no country-name formatter; an abbreviation query, which is matched against the zone abbreviation table, is no exception. Loading the search data without a query — for city labels, the exemplar city or the coordinates of stored locations — MUST normalize no text. The search data MUST NOT be part of the initial JavaScript; it MUST be one separate file of at most 150 KB gzipped that holds the zone cities and the other cities of the city data with their coordinates, and the initial JavaScript MUST stay at most 150 KB gzipped. While the list is empty, the page MUST NOT request the search data before the search is first opened. While the list holds at least one location of any kind, the page MAY request it once in the background for the city labels and the coordinates of city locations and the exemplar city of the device time location, and the search MUST reuse that data without a second request. The service worker MAY download and cache it in the background for offline use. <!-- implements NFR-P1, NFR-P2 of add-locations-via-search; FR4, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks; FR8 of show-here-entry-for-device-time; NFR-P2 of add-settings-page-and-device-time-location; FR4 of show-city-labels-in-interface-language; NFR-P3 of show-zone-abbreviations-and-zone-label-setting; FR14, NFR-P1, NFR-P2, NFR-P3, NFR-P4, M2 of add-geonames-city-source; NFR-P1, NFR-P2, M4 of add-city-coordinates-to-locations -->

#### Scenario: Query timing
- **GIVEN** the full data is prepared for search
- **WHEN** each of 13 sample queries is run over the full data
- **THEN** each query normalizes exactly one text
- **AND** each query builds at most one collator
- **AND** no query builds a country-name formatter

#### Scenario: Preparing the data for search
- **WHEN** the first query is run over freshly loaded search data
- **THEN** at most one country-name formatter per city-name language was built

#### Scenario: Loading without a query does no search work
- **GIVEN** the list holds Kazan and the search was not opened
- **WHEN** the search data finishes loading and the Kazan row shows its city label
- **THEN** no text was normalized

#### Scenario: Data loads only when the search opens
- **GIVEN** the stored list is empty
- **WHEN** the user opens the app and has not opened the search
- **THEN** the page has not requested the search data
- **AND** the page requests it when the user opens the search

#### Scenario: The Here entry's request is the only one
- **GIVEN** the list holds the device time location and Tokyo
- **WHEN** the user opens the app, the search data finishes loading, and the user opens the search
- **THEN** the page has requested the search data exactly once

#### Scenario: Bundle budget
- **WHEN** the app is built
- **THEN** the search data is one separate file of at most 150 KB gzipped
- **AND** that file is not part of the initial JavaScript
- **AND** the initial JavaScript is at most 150 KB gzipped

#### Scenario: Abbreviation query within the work bound
- **GIVEN** the full data is prepared for search
- **WHEN** the query `IST` is run over the full data
- **THEN** it normalizes exactly one text
- **AND** it builds at most one collator

#### Scenario: Coordinates of stored locations do no search work
- **GIVEN** the list holds Kazan without coordinates and the search was not opened
- **WHEN** the search data finishes loading and Kazan gains its coordinates
- **THEN** no text was normalized
