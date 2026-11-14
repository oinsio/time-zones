# Spec Delta

## MODIFIED Requirements

### Requirement: City label in the interface language
A city location's row SHALL show as its city label the name of a city record of its zone in the city-name language of the interface language, when the stored label equals that record's name in any city-name language; the record may be the zone city or any other city of the city data in that zone, and when several records of the zone have the stored label as a name, the zone city wins, then the larger population. The city-name language follows the dialect fallback: the interface language, its base language, then English. When no city record of the zone has the stored label as a name, the row MUST show the stored label. Until the zone cities data is loaded, or when loading fails, the row MUST show the stored label, with no error and no retry. Switching the interface language MUST change the city label of every listed city location at once, without a reload and without a loading state. A switch MUST NOT change the stored list, any location ID, the order or the home location, and MUST NOT write the stored location list. Every text that names a row's city MUST use this city label: the location menu name, the time button and field name, and the removal, home and reorder announcements. Inputs: the location list, the interface language, the zone cities data. Output: the city label of each row. Errors: none. <!-- implements FR1, FR2, FR3, UX1, UX2 of show-city-labels-in-interface-language; FR9 of add-geonames-city-source -->

#### Scenario: Added in Russian, shown in English
- **GIVEN** the interface language is Russian
- **AND** the zone cities data is loaded
- **AND** the user has added Tokyo, shown as «Токио»
- **WHEN** the user switches the interface language to English
- **THEN** the row reads "Tokyo"
- **WHEN** the user switches the interface language back to Russian
- **THEN** the row reads «Токио»

#### Scenario: Added in English, shown in Russian
- **GIVEN** the interface language is English
- **AND** the zone cities data is loaded
- **AND** the user has added Tokyo, shown as "Tokyo"
- **WHEN** the user switches the interface language to Russian
- **THEN** the row reads «Токио»

#### Scenario: A city that is not the zone city
- **GIVEN** the interface language is Russian
- **AND** the zone cities data is loaded
- **AND** the user has added Kazan in `Europe/Moscow`, shown as «Казань»
- **WHEN** the user switches the interface language to English
- **THEN** the row reads "Kazan"
- **AND** a Moscow row in the same list still reads "Moscow"

#### Scenario: Namesakes in one zone read the same
- **GIVEN** the stored list is `America/Chicago` stored as "Springfield"
- **WHEN** the interface language is Russian and the zone cities data is loaded
- **THEN** the row reads the Russian name of Springfield, Missouri, the larger of the two namesakes of that zone

#### Scenario: A switch keeps the stored list
- **GIVEN** the stored list is Tokyo stored as «Токио», as home
- **AND** the interface language is English
- **WHEN** the user opens the app and the zone cities data finishes loading
- **THEN** the row reads "Tokyo" and is the home location
- **AND** the stored list still holds Tokyo stored as «Токио», as home
- **WHEN** the user switches the interface language to Russian and back to English
- **THEN** the row reads "Tokyo" again
- **AND** the stored location list was not written

#### Scenario: Stored label until the data is loaded
- **GIVEN** the stored list is Tokyo stored as «Токио»
- **AND** the interface language is English
- **AND** the zone cities data has not been loaded
- **WHEN** the user opens the app
- **THEN** the row reads «Токио»
- **WHEN** the zone cities data finishes loading
- **THEN** the row reads "Tokyo"

#### Scenario: Loading fails
- **GIVEN** the stored list is Tokyo stored as «Токио»
- **AND** the interface language is English
- **AND** loading the zone cities data fails
- **WHEN** the user opens the app
- **THEN** the row reads «Токио»
- **AND** no error is shown

#### Scenario: A label the data does not know
- **GIVEN** the stored list is `Asia/Tokyo` stored as "Edo"
- **AND** the interface language is Russian
- **WHEN** the user opens the app and the zone cities data finishes loading
- **THEN** the row reads "Edo"

#### Scenario: A dialect reads its base language
- **GIVEN** a dialect `ru-KZ` with base language `ru`
- **AND** the stored list is Tokyo stored as "Tokyo"
- **WHEN** the interface language is `ru-KZ` and the zone cities data is loaded
- **THEN** the row reads «Токио»

#### Scenario: Texts that name the city follow
- **GIVEN** the interface language is Russian
- **AND** the zone cities data is loaded
- **AND** the list is Tokyo added as «Токио»
- **WHEN** the user switches the interface language to English
- **THEN** the location menu button is named "Actions for Tokyo"
- **AND** the time button's name starts with "Enter time — Tokyo"
- **WHEN** the user removes Tokyo
- **THEN** "Tokyo removed" is announced politely

#### Scenario: Accessible after a switch
- **GIVEN** the list is Tokyo added as «Токио»
- **WHEN** the user switches the interface language to English in the light and the dark theme
- **THEN** axe-core reports no violations on the main page
- **AND** the location menu button is named "Actions for Tokyo"
