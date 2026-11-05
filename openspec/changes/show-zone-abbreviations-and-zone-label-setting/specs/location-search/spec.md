## MODIFIED Requirements

### Requirement: Search by abbreviation
When the whole query equals a zone abbreviation of the app's zone abbreviation table (see the `zone-abbreviations` capability), compared without regard to case, every zone whose abbreviation pair contains it SHALL match by abbreviation, whichever half of the year uses it. Only abbreviations of that table match: abbreviations outside the IANA time zone database (`ET`, `PT`, `ALMT`, `ICT`, `SGT`, `GST`, `BRT`, `ART`) and the Russian display form «МСК» MUST NOT match by abbreviation, and abbreviations produced by the browser for display MUST NOT be used for matching. A query that is only the start of an abbreviation MUST NOT match by abbreviation. The zone label preference MUST NOT change which results are found or how they are shown. Inputs: the query. Output: the zones matched by abbreviation, each with its abbreviation pair. Errors: none; no match leaves only the other match kinds. <!-- implements FR4 of add-locations-via-search; FR8, FR9, FR11, FR15 of show-zone-abbreviations-and-zone-label-setting -->

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

#### Scenario: Partial abbreviation does not match by abbreviation
- **WHEN** the user searches for "IS"
- **THEN** no result shows an abbreviation

#### Scenario: The zone label does not change the search
- **GIVEN** the zone label shows neither the zone abbreviation nor the UTC offset
- **WHEN** the user searches for "IST"
- **THEN** the results are the same as with both shown, and each shows its abbreviation pair

### Requirement: Result order and content
Results SHALL be ordered by match kind — abbreviation, city name starting with the query, a later word of the city name starting with the query, country — then popular locations first, then alphabetically by city name in the interface language; results matched by abbreviation follow the same popularity and name order. Each time zone MUST appear at most once, and at most 50 results MUST be shown. Each result MUST show the city and the country in the interface language. A result matched by abbreviation MUST also show its zone's abbreviation pair in order of increasing UTC offset, separated by " / ", in the spelling of the interface language (see the `zone-abbreviations` capability), with the matched abbreviation emphasised and the other not; a zone with one abbreviation shows it alone. The number of results MUST be announced politely. <!-- implements FR5, UX3, NFR-A3 of add-locations-via-search; FR10, FR11, UX3 of show-zone-abbreviations-and-zone-label-setting -->

#### Scenario: Abbreviation before city prefix
- **WHEN** the user searches for "IST"
- **THEN** Istanbul appears after Kolkata, Dublin and Jerusalem

#### Scenario: Ambiguous abbreviation with its pairs
- **GIVEN** the interface language is English
- **WHEN** the user searches for "IST"
- **THEN** the first three results are Kolkata with `IST`, Dublin with `GMT / IST` and Jerusalem with `IST / IDT`, in that order
- **AND** `IST` is the emphasised abbreviation in each of them
- **AND** 4 results are announced

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
- **THEN** the city is listed before the zones of that country

#### Scenario: One entry per zone
- **WHEN** a zone matches both by city and by country
- **THEN** it appears once, at the position of its best match

#### Scenario: Result limit
- **WHEN** the user searches for a single letter
- **THEN** at most 50 results are shown

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
