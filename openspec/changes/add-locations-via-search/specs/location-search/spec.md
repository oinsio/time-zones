# Spec Delta

## Purpose

Finding a place to add to the list by typing a city, a country or a time zone abbreviation, over data bundled with the app so that search works offline.

## ADDED Requirements

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
Every time zone of a country SHALL match when the country name in English or Russian, or any word of it, starts with the query. <!-- implements FR3 of add-locations-via-search -->

#### Scenario: Country with several zones
- **WHEN** the user searches for "Kazakhstan"
- **THEN** every result has the country Kazakhstan
- **AND** Almaty is among the results

#### Scenario: Country name in Russian
- **WHEN** the user searches for "Казахстан"
- **THEN** Almaty is among the results

### Requirement: Search by abbreviation
When the whole query equals an abbreviation from the app's own abbreviation table (case-insensitive), every zone that abbreviation maps to SHALL match, in the table's order. Abbreviations produced by the browser for display MUST NOT be used for matching. <!-- implements FR4 of add-locations-via-search -->

#### Scenario: Ambiguous abbreviation
- **WHEN** the user searches for "IST"
- **THEN** the first three results are Kolkata, Jerusalem and Dublin in that order
- **AND** each of them shows "IST"

#### Scenario: Single-zone abbreviation
- **WHEN** the user searches for "est"
- **THEN** the first result is New York and it shows "EST"

#### Scenario: Partial abbreviation does not match by abbreviation
- **WHEN** the user searches for "IS"
- **THEN** no result shows an abbreviation

### Requirement: Result order and content
Results SHALL be ordered by match kind — abbreviation, city name starting with the query, a later word of the city name starting with the query, country — then popular locations first, then alphabetically by city name in the interface language. Each time zone MUST appear at most once, and at most 50 results MUST be shown. Each result MUST show the city and the country in the interface language, and the abbreviation when it matched by abbreviation. The number of results MUST be announced politely. <!-- implements FR5, UX3, NFR-A3 of add-locations-via-search -->

#### Scenario: Abbreviation before city prefix
- **WHEN** the user searches for "IST"
- **THEN** Istanbul appears after Kolkata, Jerusalem and Dublin

#### Scenario: City before country
- **GIVEN** a city whose name starts with the query and a country whose name starts with the query
- **WHEN** the user searches
- **THEN** the city is listed before the zones of that country

#### Scenario: One entry per zone
- **WHEN** a zone matches both by city and by country
- **THEN** it appears once, at the position of its best match

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
The search data SHALL be loaded when the search is first opened. While it loads, the search MUST show a loading placeholder; if loading fails, it MUST show an error message with a retry action, and retry MUST load it again. After the first visit the search MUST work without a network connection. <!-- implements FR15, FR16, UX1 of add-locations-via-search -->

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

#### Scenario: Offline search
- **GIVEN** the user visited the app before
- **WHEN** the user searches for "Moscow" without a network connection
- **THEN** Moscow is among the results

### Requirement: Search is fast and lazy
Computing the results of one query over the full bundled data SHALL take at most 50 ms. The search data MUST NOT be part of the initial JavaScript; it MUST be a separate chunk of at most 30 KB gzipped, and the initial JavaScript MUST stay at most 150 KB gzipped. <!-- implements NFR-P1, NFR-P2 of add-locations-via-search -->

#### Scenario: Query timing
- **WHEN** each of 10 sample queries is run over the full data
- **THEN** each completes in at most 50 ms

#### Scenario: Data loads only when the search opens
- **WHEN** the user opens the app and has not opened the search
- **THEN** the search data has not been requested
- **AND** it is requested when the user opens the search

#### Scenario: Bundle budget
- **WHEN** the app is built
- **THEN** the search data is a separate chunk of at most 30 KB gzipped
- **AND** the initial JavaScript is at most 150 KB gzipped

### Requirement: Keyboard-operable search
The search SHALL be fully operable with the keyboard: it opens from the "Add location" action with Enter, the query field has focus when it opens, arrow keys move through results, Enter adds the highlighted result, and Esc closes the search. Closing, with Esc or by adding, MUST return focus to the action that opened it. <!-- implements NFR-A2 of add-locations-via-search -->

#### Scenario: Add with the keyboard
- **WHEN** the user opens the search with Enter, types "Tokyo", presses Down and Enter
- **THEN** Tokyo is in the list
- **AND** focus is on the "Add location" action

#### Scenario: Close with Esc
- **WHEN** the user opens the search and presses Esc
- **THEN** the search is closed
- **AND** focus is on the "Add location" action

### Requirement: Accessible and responsive search
The search in each of its states (suggestions, results, no matches, loading, error) SHALL have no automated accessibility violations in light and dark themes and MUST NOT scroll horizontally from 320 px to 2560 px. Below 640 px it MUST fill the screen; from 640 px it MUST be a centered dialog. Its suggestions and results states MUST match the approved screenshots at 375 px and 1024 px in both themes. <!-- implements NFR-A1, NFR-R1, NFR-R2, UX5 of add-locations-via-search -->

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
