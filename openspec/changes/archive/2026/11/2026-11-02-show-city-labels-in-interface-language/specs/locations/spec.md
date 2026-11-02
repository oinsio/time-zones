## MODIFIED Requirements

### Requirement: List in the Cards view
The Cards view SHALL show one row per location, in list order, the device time location included. A city location's row shows the city label and the country name in the interface language (see "City label in the interface language"). Every row has a location menu whose accessible name includes the city ("Actions for Moscow", «Действия: Москва»). The menu holds the remove action "Remove" («Удалить») and the home action of the `home-location` capability. The header's Add location button opens the search (see the `main-page` capability). After a removal, focus MUST move to the next location's menu button, or the previous one, or the header's Add location button when the list becomes empty. Adding and removing MUST be announced politely without moving focus. Adding and removing a location are part of the view contract: these behaviours MUST hold for every registered view, not only Cards. <!-- implements FR10, FR17, NFR-A3, UX5 of add-locations-via-search ; FR11, NFR-A2 of set-home-location-and-show-differences; FR2, FR9, FR13 of add-settings-page-and-device-time-location; FR1 of show-city-labels-in-interface-language -->

#### Scenario: Rows show city and country
- **GIVEN** the list is Almaty and Moscow and the interface language is English
- **WHEN** the user opens the app
- **THEN** two rows are shown: "Almaty" with "Kazakhstan" and "Moscow" with "Russia"

#### Scenario: Empty state after the last removal
- **GIVEN** the list contains only Moscow
- **WHEN** the user removes Moscow
- **THEN** the empty-state explanation is shown
- **AND** the header's Add location button is shown

#### Scenario: Remove action names the city
- **WHEN** the list contains Moscow
- **THEN** its location menu button is announced as "Actions for Moscow"
- **AND** the open menu offers "Remove"

#### Scenario: Focus after removal
- **GIVEN** the list is Almaty, Moscow, Kolkata
- **WHEN** the user removes Moscow with the keyboard
- **THEN** focus is on the location menu button of Kolkata
- **AND** the removal is announced politely

#### Scenario: Focus after the last removal
- **GIVEN** the list contains only Moscow
- **WHEN** the user removes Moscow with the keyboard
- **THEN** focus is on the header's Add location button


### Requirement: Exemplar city of the device time location
The device time location SHALL be named by the exemplar city of the device time zone in the interface language. The zone cities data MUST be loaded in the background only while the list holds at least one location of any kind or the search is open, and showing the device time location MUST NOT wait for it. Until the data is loaded, or when loading fails, the city MUST be derived from the time zone ID, with no error shown. On an engine that rejects the canonical device time zone but accepts a legacy name of it, the exemplar city MUST be looked up by the canonical ID and the time, date and day track shown through the legacy name. The search MUST reuse data already loaded, so the page requests the data at most once while no load fails; the city labels of city locations share the same request. <!-- implements FR8, NFR-P2 of add-settings-page-and-device-time-location; FR4 of show-city-labels-in-interface-language -->

#### Scenario: Derived city first, exemplar city after loading
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the zone cities data has not been loaded
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the device time location shows `Almaty`
- **WHEN** the zone cities data finishes loading
- **THEN** the device time location shows `Алматы`

#### Scenario: Loading fails
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** loading the zone cities data fails
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the device time location shows `Almaty`
- **AND** no error is shown

#### Scenario: No load without the device time location
- **GIVEN** the stored list is empty
- **WHEN** the user opens the app and does not open the search
- **THEN** the zone cities data is not requested

#### Scenario: One request for city labels and the device time location
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the stored list is the device time location, Tokyo
- **WHEN** the user opens the app, the zone cities data finishes loading, and the user opens the search
- **THEN** the zone cities data was requested exactly once

#### Scenario: Renamed device time zone
- **GIVEN** the engine rejects `Europe/Kyiv` and accepts `Europe/Kiev`
- **AND** the device reports the time zone `Europe/Kiev`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is the device time location
- **WHEN** the user opens the app
- **THEN** the device time location shows `Kyiv`, the time `09:30` and the meta line `Device time · UTC+2`

## ADDED Requirements

### Requirement: City label in the interface language
A city location's row SHALL show as its city label the name of its zone's city record in the city-name language of the interface language, when the stored label equals that record's name in any city-name language. The city-name language follows the dialect fallback: the interface language, its base language, then English. When the zone has no city record, or the stored label is none of its names, the row MUST show the stored label. Until the zone cities data is loaded, or when loading fails, the row MUST show the stored label, with no error and no retry. Switching the interface language MUST change the city label of every listed city location at once, without a reload and without a loading state. A switch MUST NOT change the stored list, any location ID, the order or the home location, and MUST NOT write the stored location list. Every text that names a row's city MUST use this city label: the location menu name, the time button and field name, and the removal, home and reorder announcements. Inputs: the location list, the interface language, the zone cities data. Output: the city label of each row. Errors: none. <!-- implements FR1, FR2, FR3, UX1, UX2 of show-city-labels-in-interface-language -->

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

### Requirement: City labels are fast
City labels SHALL cost no repeated work: presenting 50 rows again for the next minute tick, with an unchanged list, interface language and zone cities data, MUST ask the city search for no city label and MUST build no formatter. A language switch MUST ask the city search for at most one city label per city location. These bounds are counted, never timed (ADR-0008). <!-- implements NFR-P1 of show-city-labels-in-interface-language -->

#### Scenario: A minute tick asks for no city label
- **GIVEN** 50 city locations have been presented with the zone cities data loaded
- **WHEN** the same rows are presented again for the next minute tick
- **THEN** the city search was asked for no city label
- **AND** no formatter is built

#### Scenario: A switch asks once per location
- **GIVEN** 50 city locations have been presented with the zone cities data loaded
- **WHEN** the interface language is switched
- **THEN** the city search was asked for at most 50 city labels
