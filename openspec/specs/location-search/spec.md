# location-search Specification

## Purpose
Finding a place to add to the list by typing a city, a country or a time zone abbreviation, over data bundled with the app so that search works offline.

## Requirements

### Requirement: Query normalization
The search SHALL match case-insensitively, ignore diacritics, treat `ё` as `е`, and ignore leading and trailing whitespace. City and country names MUST be matched in English and Russian whatever the interface language. <!-- implements FR1 of add-locations-via-search -->

#### Scenario: Diacritics are ignored
- **WHEN** the user searches for "sao paulo"
- **THEN** São Paulo is among the results

#### Scenario: Other language than the interface
- **GIVEN** the interface language is English
- **WHEN** the user searches for "Москва"
- **THEN** the first result is Moscow, shown as "Moscow"

#### Scenario: Case and spaces
- **WHEN** the user searches for "  MOSCOW "
- **THEN** the first result is Moscow

### Requirement: Search by city
A location SHALL match when its city name, or any word of its city name, starts with the query. <!-- implements FR2 of add-locations-via-search -->

#### Scenario: Full city name
- **WHEN** the user searches for "Moscow"
- **THEN** the first result is Moscow in `Europe/Moscow`

#### Scenario: Later word of the name
- **WHEN** the user searches for "york"
- **THEN** New York is among the results

#### Scenario: Prefix of the name
- **WHEN** the user searches for "alm"
- **THEN** Almaty is among the results

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

### Requirement: Search by abbreviation
When the whole query equals a zone abbreviation of the app's zone abbreviation table (see the `zone-abbreviations` capability), compared without regard to case, every zone whose abbreviation pair contains it SHALL match by abbreviation, whichever half of the year uses it. Only abbreviations of that table match: abbreviations outside the IANA time zone database (`ET`, `PT`, `ALMT`, `ICT`, `SGT`, `GST`, `BRT`, `ART`) and the Russian display form «МСК» MUST NOT match by abbreviation; an abbreviation finds only the zones whose tzdb abbreviation pair contains it, so `GMT` no longer finds the `UTC` zone (tzdb: `UTC`) and `BST` no longer finds Dhaka (tzdb: `+06`); and abbreviations produced by the browser for display MUST NOT be used for matching. A query that is only the start of an abbreviation MUST NOT match by abbreviation. The zone label preference MUST NOT change which results are found or how they are shown. Inputs: the query. Output: the zones matched by abbreviation, each with its abbreviation pair. Errors: none; no match leaves only the other match kinds. <!-- implements FR4 of add-locations-via-search; FR8, FR9, FR11, FR15 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Ambiguous abbreviation
- **WHEN** the user searches for "IST"
- **THEN** exactly three results match by abbreviation: Kolkata, Dublin and Jerusalem

#### Scenario: Single-zone abbreviation
- **WHEN** the user searches for "est"
- **THEN** the first result is New York and it shows `EST / EDT`

#### Scenario: Either half of the year
- **WHEN** the user searches for "EDT"
- **THEN** the first result is New York and it matches by abbreviation

#### Scenario: Zones without a clock change
- **WHEN** the user searches for "EST"
- **THEN** Panama matches by abbreviation

#### Scenario: Abbreviations outside tzdb no longer match
- **WHEN** the user searches for `<query>`
- **THEN** no result matches by abbreviation

| query |
|---|
| ET |
| PT |
| ALMT |
| ICT |
| SGT |
| GST |
| BRT |
| ART |

#### Scenario: Zones that tzdb names otherwise are no longer found
- **WHEN** the user searches for `<query>`
- **THEN** `<kept>` matches by abbreviation
- **AND** `<dropped>` does not match by abbreviation

| query | kept | dropped |
|---|---|---|
| GMT | London | UTC |
| BST | London | Dhaka |

#### Scenario: Partial abbreviation does not match by abbreviation
- **WHEN** the user searches for "IS"
- **THEN** no result shows an abbreviation

#### Scenario: The zone label does not change the search
- **GIVEN** the zone label shows neither the zone abbreviation nor the UTC offset
- **WHEN** the user searches for "IST"
- **THEN** the results are the same as with both shown, and each shows its abbreviation pair

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

### Requirement: Suggestions before typing
When the query is empty or only whitespace, the search SHALL show a fixed list of popular locations instead of an empty screen. <!-- implements FR6, UX1 of add-locations-via-search -->

#### Scenario: Search opened
- **WHEN** the user opens the search
- **THEN** popular locations are shown as suggestions

#### Scenario: Query cleared
- **GIVEN** the user typed "Mos"
- **WHEN** the user clears the query
- **THEN** the suggestions are shown again

### Requirement: No matches
When no location matches, the search SHALL show a message that nothing was found and a hint that a city, a country or an abbreviation can be searched. <!-- implements FR7, UX1 of add-locations-via-search -->

#### Scenario: Nothing found
- **WHEN** the user searches for "qqqq"
- **THEN** the no-results message and the hint are shown

#### Scenario: Offsets are not a search input
- **WHEN** the user searches for "UTC+5"
- **THEN** the no-results message is shown

### Requirement: Adding from the search
Choosing a result SHALL add its location to the end of the list, close the search and show the location in the list. A result MUST be marked as added, and MUST NOT be addable again, when the list already has a location with its time zone and its city name in any supported language. Results MUST update as the user types, without a submit action. <!-- implements FR8, UX2, UX4 of add-locations-via-search -->

#### Scenario: Add from results
- **GIVEN** the list is empty
- **WHEN** the user searches for "New York" and chooses New York
- **THEN** the search is closed
- **AND** the list contains New York

#### Scenario: Already added
- **GIVEN** the list contains Moscow
- **WHEN** the user searches for "Moscow"
- **THEN** Moscow is marked as added and cannot be chosen

#### Scenario: Results follow typing
- **WHEN** the user types "Mos" one character at a time
- **THEN** the results change after each character without a submit action

### Requirement: Search data states
The search data SHALL be loaded when the search is first opened. While it loads, the search MUST show a loading placeholder; if loading fails, it MUST show an error message with a retry action, and retry MUST load it again without reloading the page. After the first visit the search MUST work without a network connection. <!-- implements FR15, FR16, UX1 of add-locations-via-search -->

#### Scenario: Data is loading
- **WHEN** the user opens the search and the data has not loaded yet
- **THEN** a loading placeholder is shown

#### Scenario: Data failed to load
- **GIVEN** the search data cannot be loaded
- **WHEN** the user opens the search
- **THEN** an error message with a retry action is shown

#### Scenario: Retry
- **GIVEN** the error message is shown and the data can now be loaded
- **WHEN** the user retries
- **THEN** the suggestions are shown
- **AND** the page was not reloaded

#### Scenario: Offline search
- **GIVEN** the user visited the app before
- **WHEN** the user searches for "Moscow" without a network connection
- **THEN** Moscow is among the results

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

### Requirement: Keyboard-operable search
The search SHALL be fully operable with the keyboard: it opens from the "Add location" action with Enter, the query field has focus when it opens, arrow keys move through results, Enter adds the highlighted result, and Esc closes the search. Closing, with Esc or by adding, MUST return focus to the action that opened it. <!-- implements NFR-A2 of add-locations-via-search -->

#### Scenario: Add with the keyboard
- **WHEN** the user opens the search with Enter, types "Tokyo", presses Down and Enter
- **THEN** Tokyo is in the list
- **AND** focus is on the "Add location" action

#### Scenario: Add the first location with the keyboard
- **GIVEN** the list is empty
- **WHEN** the user opens the search with Enter, types "Tokyo", presses Down and Enter
- **THEN** Tokyo is the only location in the list
- **AND** focus is on the "Add location" action

#### Scenario: Close with Esc
- **WHEN** the user opens the search and presses Esc
- **THEN** the search is closed
- **AND** focus is on the "Add location" action

### Requirement: Accessible and responsive search
The search in each of its states (suggestions, results, no matches, loading, error) SHALL have no automated accessibility violations in light and dark themes and MUST NOT scroll horizontally from 320 px to 2560 px. Below 640 px it MUST fill the screen; from 640 px it MUST be a centered dialog. Its suggestions and results states MUST match the approved screenshots at 375 px and 1024 px in both themes; the results for "IST" are re-approved once with the abbreviation pairs of this change. In a pair, the matched abbreviation MUST differ from the other by font weight as well as by colour, and the accessible name of a result MUST contain its pair. <!-- implements NFR-A1, NFR-R1, NFR-R2, UX5 of add-locations-via-search; NFR-A2, NFR-R3, UX3 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Accessibility check
- **WHEN** each search state is checked with axe-core in light and dark theme
- **THEN** no violations are reported

#### Scenario: Phone layout
- **WHEN** the search is opened on a 375 px wide screen
- **THEN** it fills the screen

#### Scenario: Wide layout
- **WHEN** the search is opened on a 1024 px wide screen
- **THEN** it is a centered dialog

#### Scenario: Screenshots
- **WHEN** the suggestions and the results for "IST" are shown at 375 px and 1024 px in each theme
- **THEN** they match the approved screenshots

#### Scenario: The pair is in the result's name
- **GIVEN** the interface language is English
- **WHEN** the user searches for "EDT"
- **THEN** the New York result's accessible name contains "EST / EDT"
- **AND** "EDT" is set in a bolder weight than "EST"

### Requirement: Open the search with the slash key
While the main page shows the header's "Add location" button, pressing `/` SHALL open the location search exactly as that button does: the suggestions are shown, focus is in the query field and the query is empty — the `/` MUST NOT be entered into the query field and the browser's own action for `/` MUST NOT start. Closing a search opened with `/`, with Esc or by adding a location, MUST return focus to the "Add location" button. Opening with `/` MUST keep the search data lazy: while the list is empty, it is requested only when the search first opens. <!-- implements FR1, FR5, NFR-P1, UX1, UX2 of open-location-search-with-slash-shortcut; FR8 of show-here-entry-for-device-time; FR2, NFR-P2 of add-settings-page-and-device-time-location; FR4 of show-city-labels-in-interface-language -->

The shortcut MUST be ignored — the search state does not change and the key keeps its usual effect — while focus is in a text input, a textarea or a contenteditable element, while the search is already open, when Ctrl, Meta or Alt is held, and while the "Add location" button is not on the page (the stored list is unreadable, or the settings page is shown). Shift MUST NOT be checked. <!-- implements FR2, FR3, FR4, FR6 of open-location-search-with-slash-shortcut; FR3 of add-settings-page-and-device-time-location -->

The "Add location" button MUST expose `/` as its keyboard shortcut to assistive technology (`aria-keyshortcuts="/"`) and keep the accessible name "Add location", with no automated accessibility violations. <!-- implements NFR-A1, NFR-R1 of open-location-search-with-slash-shortcut; FR2 of add-settings-page-and-device-time-location -->

#### Scenario: Open the search and add a location with the keyboard
- **GIVEN** the main page shows the "Add location" button and focus is not in a text field
- **WHEN** the user presses `/`, types "Tokyo", presses Down and Enter
- **THEN** the search opened with focus in an empty query field
- **AND** the key press did not reach the browser's own `/` action
- **AND** Tokyo is in the list
- **AND** focus is on the "Add location" button

#### Scenario: Suggestions are shown
- **WHEN** the user presses `/` on the main page
- **THEN** the search is open with popular suggestions
- **AND** the query field is empty

#### Scenario: Data is requested only when the search opens
- **GIVEN** the user has not opened the search
- **AND** the stored list is empty
- **WHEN** the user presses `/`
- **THEN** the search data is requested exactly once
- **AND** it was not requested before

#### Scenario: Typing in a text field
- **GIVEN** focus is in a text input, a textarea or a contenteditable element
- **WHEN** the user presses `/`
- **THEN** the search does not open
- **AND** the `/` is entered into that element

#### Scenario: Slash typed in the open search
- **GIVEN** the search was opened with `/` and focus is in its query field
- **WHEN** the user presses `/`
- **THEN** exactly one search is open
- **AND** the query field holds `/`

#### Scenario: Search already open
- **GIVEN** the search is open and focus is on its close action
- **WHEN** the user presses `/`
- **THEN** the search stays open
- **AND** the query does not change

#### Scenario: Modifier keys held
- **WHEN** the user presses `/` while holding Ctrl, Meta or Alt
- **THEN** the search does not open

#### Scenario: Shift on layouts that need it
- **GIVEN** a keyboard layout on which `/` is typed with Shift
- **WHEN** the user presses Shift and the key that produces `/`
- **THEN** the search opens

#### Scenario: Stored list unreadable
- **GIVEN** the stored list is unreadable and the error with Reset is shown
- **WHEN** the user presses `/`
- **THEN** the search does not open

#### Scenario: Settings page shown
- **GIVEN** the settings page is shown
- **WHEN** the user presses `/`
- **THEN** the search does not open

#### Scenario: Shortcut announced on the action
- **WHEN** the main page shows the "Add location" button
- **THEN** the button announces `/` as its keyboard shortcut
- **AND** its accessible name is "Add location"

### Requirement: Device time in the search
While the location list holds no device time location, the search SHALL show a "Device time" («Время устройства») option before every suggestion and result. It MUST be shown when the query is empty or only whitespace, and when a word of "Device time" or «Время устройства» starts with the query under the search's query normalization, whatever the interface language. It MUST be shown in every search data state: loading, failed and ready, and offline. Choosing it MUST add the device time location to the end of the list, close the search and announce the addition politely. While the list holds a device time location, the option MUST NOT be shown. The option does not count towards the 50-result limit and does not change the order of city results. Inputs: the query, whether the list holds the device time location. Output: whether the option is shown. Errors: none. <!-- implements FR11 of add-settings-page-and-device-time-location -->

#### Scenario: Offered after removal
- **GIVEN** the list is Moscow
- **WHEN** the user opens the search
- **THEN** the first option is "Device time"
- **AND** the popular suggestions follow it

#### Scenario: Matched by a word in either language
- **GIVEN** the list is Moscow
- **AND** the interface language is English
- **WHEN** the user searches for `<query>`
- **THEN** the "Device time" option is shown first

| query |
|---|
| `dev` |
| `time` |
| `врем` |
| `устр` |

#### Scenario: Not matched
- **GIVEN** the list is Moscow
- **WHEN** the user searches for "Moscow"
- **THEN** no "Device time" option is shown

#### Scenario: Shown while the search data loads or failed
- **GIVEN** the list is Moscow
- **AND** the search data is `<state>`
- **WHEN** the user opens the search
- **THEN** the "Device time" option is shown

| state |
|---|
| loading |
| failed to load |

#### Scenario: Choose it
- **GIVEN** the list is Moscow
- **WHEN** the user opens the search and chooses "Device time"
- **THEN** the search is closed
- **AND** the list is Moscow, the device time location
- **AND** the addition is announced politely

#### Scenario: Hidden while listed
- **GIVEN** the list is the device time location, Moscow
- **WHEN** the user opens the search
- **THEN** no "Device time" option is shown

### Requirement: Zones offered by search come from the release
The zones the search offers SHALL be the zone ids of the zone rules release that have an area (contain `/`) outside the `Etc` area, plus `UTC` as today, with their CLDR exemplar cities; offset-only zones (`Etc/GMT+5`) and area-less ids (`EST5EDT`, `CET`) MUST NOT be offered. The offered zones MUST NOT depend on the list of zones the engine knows. A zone id of the release the engine rejects MUST be offered and addable like any other. <!-- implements FR5, FR9 of add-zone-rules-from-iana -->

#### Scenario: A zone the engine rejects is offered
- **GIVEN** the engine rejects `America/Ciudad_Juarez`
- **WHEN** the user searches for "Ciudad"
- **THEN** Ciudad Juárez in `America/Ciudad_Juarez` is among the results

#### Scenario: The engine's own list plays no part
- **GIVEN** the engine cannot list its zones
- **WHEN** the user searches for "Moscow"
- **THEN** Moscow in `Europe/Moscow` is among the results

#### Scenario: Offset-only zones are not offered
- **GIVEN** the zone rules release holds `Etc/GMT+5`, `Etc/GMT-14` and `EST5EDT`
- **WHEN** the user searches for "GMT+5"
- **THEN** no result has a zone in the `Etc` area
- **AND** no result has an area-less zone other than `UTC`

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
