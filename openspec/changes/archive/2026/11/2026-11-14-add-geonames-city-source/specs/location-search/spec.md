# Spec Delta

## ADDED Requirements

### Requirement: Search finds GeoNames cities
The search SHALL match every city of the city data (see the `city-data` capability), not only the zone cities, by the rules of "Query normalization" and "Search by city", in English and Russian whatever the interface language. A result MUST show its city in the interface language and carry the zone and country of its city record. Search by abbreviation, the suggestions and the device time option MUST keep using the zone cities only. <!-- implements FR3, FR10, M3 of add-geonames-city-source -->

#### Scenario: Cities that are not zone cities are found
- **GIVEN** the interface language is English
- **WHEN** the user searches for `<query>`
- **THEN** `<city>` in `<zone>` is among the results

| query | city | zone |
|---|---|---|
| Kazan | Kazan | Europe/Moscow |
| Saint Petersburg | Saint Petersburg | Europe/Moscow |
| Barcelona | Barcelona | Europe/Madrid |
| San Francisco | San Francisco | America/Los_Angeles |
| Boston | Boston | America/New_York |
| Munich | Munich | Europe/Berlin |
| Osaka | Osaka | Asia/Tokyo |
| Mumbai | Mumbai | Asia/Kolkata |
| Rio de Janeiro | Rio de Janeiro | America/Sao_Paulo |
| Milan | Milan | Europe/Rome |

#### Scenario: Found in Russian
- **GIVEN** the interface language is English
- **WHEN** the user searches for `<query>`
- **THEN** `<city>` is among the results, shown as `<city>`

| query | city |
|---|---|
| Казань | Kazan |
| Санкт-Петербург | Saint Petersburg |
| Мюнхен | Munich |
| Сан-Франциско | San Francisco |

#### Scenario: A later word of a GeoNames city
- **WHEN** the user searches for "francisco"
- **THEN** San Francisco is among the results

#### Scenario: An abbreviation still finds zone cities only
- **WHEN** the user searches for "MSK"
- **THEN** every result is a zone city matched by abbreviation
- **AND** Kazan is not among the results

#### Scenario: Suggestions are unchanged
- **WHEN** the user opens the search
- **THEN** the suggestions are the popular locations, one per zone, as before

### Requirement: Region of a namesake
A result whose city record carries a region (see the `city-data` capability) SHALL show the region before the country on its secondary line, separated by a comma and a space, in the interface language, falling back to English. A result whose city record carries no region MUST show the country alone, exactly as before. Errors: none. <!-- implements FR7, UX1, UX2, M5 of add-geonames-city-source -->

#### Scenario: Namesakes are told apart
- **GIVEN** the interface language is English
- **WHEN** the user searches for "Springfield"
- **THEN** three results are named "Springfield"
- **AND** their secondary lines are "Missouri, United States", "Massachusetts, United States" and "Illinois, United States", in this order

#### Scenario: The region in Russian
- **GIVEN** the interface language is Russian
- **WHEN** the user searches for "Springfield"
- **THEN** the first result's secondary line is «Миссури, Соединенные Штаты»

#### Scenario: No region without a namesake
- **GIVEN** the interface language is English
- **WHEN** the user searches for "Kazan"
- **THEN** the Kazan result's secondary line is "Russia"

#### Scenario: No two results look the same
- **WHEN** each of the 13 sample queries is run over the full data
- **THEN** no two results of one query have the same city, region and country text

### Requirement: Cities offered come from the release
The search SHALL offer a city of the city data only while its zone is a zone of the installed zone rules release. A city whose zone the installed release does not hold MUST NOT be offered and MUST NOT cause an error. <!-- implements FR11 of add-geonames-city-source -->

#### Scenario: A city of a zone the installed release lacks
- **GIVEN** the installed zone rules release does not hold `Europe/Moscow`
- **WHEN** the user searches for "Kazan"
- **THEN** Kazan is not among the results
- **AND** no error is shown

#### Scenario: A city of a zone the engine rejects
- **GIVEN** the engine rejects `America/Ciudad_Juarez` and the installed release holds it
- **WHEN** the user searches for a city of the city data in `America/Ciudad_Juarez`
- **THEN** that city is among the results

### Requirement: Namesakes in one zone are one location
Choosing a city of the city data SHALL add a location with the city's zone, the city's name in the interface language as the city label and the city's country; the region is not stored. Because a location is identified by its zone and its label, namesakes in one zone are one location: once one of them is in the list, each of them MUST be marked as added. A namesake in another zone MUST stay addable. <!-- implements FR8 of add-geonames-city-source -->

#### Scenario: Add a GeoNames city
- **GIVEN** the interface language is Russian and the list is empty
- **WHEN** the user searches for «Казань» and chooses it
- **THEN** the list contains a location in `Europe/Moscow` labelled «Казань» with the country `RU`

#### Scenario: Namesakes in the same zone
- **GIVEN** the user added Springfield, Missouri, in `America/Chicago`
- **WHEN** the user searches for "Springfield"
- **THEN** Springfield, Missouri and Springfield, Illinois are marked as added
- **AND** Springfield, Massachusetts, in `America/New_York`, can be chosen

#### Scenario: A city and the zone city of its zone are different locations
- **GIVEN** the list contains Moscow
- **WHEN** the user searches for "Kazan"
- **THEN** Kazan is not marked as added and can be chosen

### Requirement: Region in results is accessible and fits
A result with a region SHALL expose the region in its accessible name. The results with regions MUST have no automated accessibility violations in the light and dark themes and MUST NOT cause horizontal scrolling from 320 px to 2560 px; a secondary line that does not fit wraps. The results for "Springfield" MUST match approved screenshots at 375 px and 1024 px in both themes. <!-- implements NFR-A1, NFR-R1, M6 of add-geonames-city-source -->

#### Scenario: The region is in the result's name
- **GIVEN** the interface language is English
- **WHEN** the user searches for "Springfield"
- **THEN** the first result's accessible name contains "Missouri"

#### Scenario: Accessibility check with regions
- **WHEN** the results for "Springfield" are checked with axe-core in the light and dark themes
- **THEN** no violations are reported

#### Scenario: No horizontal scrolling with regions
- **WHEN** the results for "Springfield" are shown at 320 px, 375 px and 2560 px in English and Russian
- **THEN** the search does not scroll horizontally

#### Scenario: Screenshots with regions
- **WHEN** the results for "Springfield" are shown at 375 px and 1024 px in each theme
- **THEN** they match the approved screenshots

## MODIFIED Requirements

### Requirement: Search by country
Every city of a country SHALL match when the country name in English or Russian, or any word of it, starts with the query: its zone cities, so that every time zone of the country is found, and its other cities of the city data. On an engine without `Intl.DisplayNames`, country names are unknown: a country query MUST match nothing by country and MUST NOT be an error, and search by city and by abbreviation MUST work as before. <!-- implements FR3 of add-locations-via-search; FR5 of support-legacy-ios-12-safari; FR6 of add-geonames-city-source -->

#### Scenario: Country with several zones
- **WHEN** the user searches for "Kazakhstan"
- **THEN** every result has the country Kazakhstan
- **AND** Almaty is among the results

#### Scenario: Country name in Russian
- **WHEN** the user searches for "Казахстан"
- **THEN** Almaty is among the results

#### Scenario: Other cities of the country
- **WHEN** the user searches for "Kazakhstan"
- **THEN** Astana and Shymkent are among the results
- **AND** every zone city of Kazakhstan is listed before them

#### Scenario: Every zone of a large country stays within the limit
- **WHEN** the user searches for "Russia"
- **THEN** 50 results are shown
- **AND** every zone of Russia is among them

#### Scenario: No country names on a legacy engine
- **GIVEN** the environment has no `Intl.DisplayNames`
- **WHEN** the user searches for "Kazakhstan"
- **THEN** no result is matched by country
- **AND** no error is shown

#### Scenario: City search on a legacy engine
- **GIVEN** the environment has no `Intl.DisplayNames`
- **WHEN** the user searches for "Almaty"
- **THEN** Almaty is among the results

### Requirement: Result order and content
Results SHALL be ordered by match kind — abbreviation, city name starting with the query, a later word of the city name starting with the query, country — then, among results matched by country, zone cities before other cities, then popular locations first, then larger population first, then alphabetically by city name in the interface language; results matched by abbreviation follow the same popularity, population and name order. Each city MUST appear at most once, at the position of its best match; a time zone MAY appear once per matching city. At most 50 results MUST be shown. Each result MUST show the city and the country in the interface language. A result matched by abbreviation MUST also show its zone's abbreviation pair in order of increasing UTC offset, separated by " / ", in the spelling of the interface language (see the `zone-abbreviations` capability), with the matched abbreviation emphasised and the other not; a zone with one abbreviation shows it alone. The number of results MUST be announced politely. <!-- implements FR5, UX3, NFR-A3 of add-locations-via-search; FR10, FR11, UX3 of show-zone-abbreviations-and-zone-label-setting; FR4, FR5, FR6, UX3 of add-geonames-city-source -->

#### Scenario: Abbreviation before city prefix
- **WHEN** the user searches for "IST"
- **THEN** Istanbul appears after Kolkata, Dublin and Jerusalem

#### Scenario: Ambiguous abbreviation with its pairs
- **GIVEN** the interface language is English
- **WHEN** the user searches for "IST"
- **THEN** the first three results are Kolkata with `IST`, Dublin with `GMT / IST` and Jerusalem with `IST / IDT`, in that order
- **AND** `IST` is the emphasised abbreviation in each of them
- **AND** the number of results shown is announced

#### Scenario: The matched half of a pair is emphasised
- **WHEN** the user searches for "EDT"
- **THEN** the New York result shows `EST / EDT` with `EDT` emphasised
- **WHEN** the user searches for "EST"
- **THEN** the New York result shows `EST / EDT` with `EST` emphasised
- **AND** the Panama result shows `EST` alone

#### Scenario: Russian spelling in the result
- **GIVEN** the interface language is Russian
- **WHEN** the user searches for "MSK"
- **THEN** the Moscow result shows «МСК» emphasised

#### Scenario: City before country
- **GIVEN** a city whose name starts with the query and a country whose name starts with the query
- **WHEN** the user searches
- **THEN** the city is listed before the cities of that country

#### Scenario: One entry per zone
- **WHEN** a zone city matches both by its name and by its country
- **THEN** it appears once, at the position of its best match

#### Scenario: A zone appears once per city
- **WHEN** the user searches for "Kazakhstan"
- **THEN** no city appears twice
- **AND** `Asia/Almaty` is the zone of more than one result

#### Scenario: Popular locations before larger cities
- **WHEN** the user searches for "new"
- **THEN** the first result is New York

#### Scenario: Larger cities first
- **GIVEN** San Antonio has a larger population than San Francisco and neither is a popular location
- **WHEN** the user searches for "san"
- **THEN** San Antonio is listed before San Francisco

#### Scenario: Equal population falls back to the name
- **GIVEN** two cities with the same match kind, popularity and population
- **WHEN** both match the query
- **THEN** they are listed alphabetically by city name in the interface language

#### Scenario: Result limit
- **WHEN** the user searches for a single letter
- **THEN** at most 50 results are shown

### Requirement: Search is fast and lazy
Computing the results of one query over the full bundled data SHALL take at most 50 ms. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound with two parts. Preparing loaded search data for search happens once, during the first query over that data, and MUST build at most one country-name formatter per city-name language. Every non-empty query over prepared search data MUST normalize exactly one text, the query itself, MUST build at most one collator and MUST build no country-name formatter; an abbreviation query, which is matched against the zone abbreviation table, is no exception. Loading the search data without a query — for city labels or the exemplar city — MUST normalize no text. The search data MUST NOT be part of the initial JavaScript; it MUST be one separate file of at most 130 KB gzipped that holds the zone cities and the other cities of the city data, and the initial JavaScript MUST stay at most 150 KB gzipped. While the list is empty, the page MUST NOT request the search data before the search is first opened. While the list holds at least one location of any kind, the page MAY request it once in the background for the city labels of city locations and the exemplar city of the device time location, and the search MUST reuse that data without a second request. The service worker MAY download and cache it in the background for offline use. <!-- implements NFR-P1, NFR-P2 of add-locations-via-search; FR4, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks; FR8 of show-here-entry-for-device-time; NFR-P2 of add-settings-page-and-device-time-location; FR4 of show-city-labels-in-interface-language; NFR-P3 of show-zone-abbreviations-and-zone-label-setting; FR14, NFR-P1, NFR-P2, NFR-P3, NFR-P4, M2 of add-geonames-city-source -->

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
- **THEN** the search data is one separate file of at most 130 KB gzipped
- **AND** that file is not part of the initial JavaScript
- **AND** the initial JavaScript is at most 150 KB gzipped

#### Scenario: Abbreviation query within the work bound
- **GIVEN** the full data is prepared for search
- **WHEN** the query `IST` is run over the full data
- **THEN** it normalizes exactly one text
- **AND** it builds at most one collator
