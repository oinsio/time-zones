# Spec Delta: locations

## ADDED Requirements

### Requirement: Coordinates of a city location
A city location added from a search result or a suggestion SHALL hold the coordinates of that city record. Inputs: the coordinates of the city record, or none. Effects: the added location holds them. Errors: none of its own — a location added without coordinates is valid. Coordinates MUST NOT be part of the location identity: a namesake of the same zone stays a duplicate whatever its coordinates. A location in UTC MUST hold no coordinates, and the device time location MUST never hold any. Coordinates MUST NOT be shown and MUST NOT change any row, mark, order or text of the list. <!-- implements FR6, FR9, UX1 of add-city-coordinates-to-locations -->

#### Scenario: A city added from the search
- **WHEN** the user adds Kazan from the search
- **THEN** the location Kazan holds the coordinates 55.8, 49.1

#### Scenario: A city added by its zone abbreviation
- **WHEN** the user searches for `IST` and adds Kolkata
- **THEN** the location Kolkata holds the coordinates 22.5, 88.4

#### Scenario: UTC
- **WHEN** the user adds UTC
- **THEN** the location UTC holds no coordinates

#### Scenario: The device time location
- **GIVEN** the device time zone is `Europe/Moscow`
- **WHEN** the user adds the device time location
- **THEN** the device time location holds no coordinates

#### Scenario: A namesake of the same zone is still a duplicate
- **GIVEN** the list holds Springfield in `America/Chicago` with the coordinates 39.8, −89.6
- **WHEN** the user adds Springfield in `America/Chicago` with the coordinates 37.2, −93.3
- **THEN** the location is rejected as a duplicate
- **AND** the listed Springfield keeps the coordinates 39.8, −89.6

#### Scenario: Rows are unchanged
- **GIVEN** the list holds Kazan with coordinates
- **WHEN** the list is shown in the Cards view and in the Grid view
- **THEN** every row shows the same content as for Kazan without coordinates

### Requirement: Coordinates are kept on the device
The stored list SHALL hold the coordinates of every city location that has them and SHALL restore them when the app is opened again, also offline. The stored document version MUST be 4. A version 3 list, which holds no coordinates, MUST be migrated on load to the same locations, order and home without coordinates, with no write on load. A stored city entry without coordinates MUST be read as a location without coordinates. A stored entry whose coordinates are present but incomplete, not numbers or out of range (latitude −90 to 90, longitude −180 to 180) MUST make the stored list unreadable, as every other invalid entry does: the load error with Reset is shown and the stored value is not overwritten. An entry of the device time location that holds coordinates MUST make the stored list unreadable as well. Coordinates MUST reach the other open tabs with the list. <!-- implements FR7, FR9 of add-city-coordinates-to-locations -->

#### Scenario: Coordinates survive a reload
- **GIVEN** the user added Kazan
- **WHEN** the app is opened again without a network connection
- **THEN** the location Kazan holds the coordinates 55.8, 49.1

#### Scenario: A list stored before coordinates
- **GIVEN** a version 3 stored list holds the device time location, Moscow and Almaty, and Moscow is home
- **WHEN** the app is opened
- **THEN** the list is the device time location, Moscow, Almaty without coordinates
- **AND** Moscow is home
- **AND** the stored list was not written on load

#### Scenario: A document newer than the app
- **GIVEN** the stored list has the document version 5
- **WHEN** the app is opened
- **THEN** the stored list is unreadable

#### Scenario: Malformed coordinates make the list unreadable
- **GIVEN** the stored entry of Moscow has `<coordinates>`
- **WHEN** the app is opened
- **THEN** the stored list is unreadable
- **AND** the stored value is not overwritten

| coordinates |
|---|
| a latitude and no longitude |
| the latitude "55.8" as text |
| the latitude 91 |
| the longitude −181 |

#### Scenario: The device time location is stored without coordinates
- **GIVEN** the list is the device time location and Kazan
- **WHEN** the list is written
- **THEN** the stored entry of the device time location holds no coordinates

#### Scenario: A stored device time location with coordinates
- **GIVEN** the stored entry of the device time location holds coordinates
- **WHEN** the app is opened
- **THEN** the stored list is unreadable

#### Scenario: Another tab receives the coordinates
- **GIVEN** the app is open in two tabs
- **WHEN** the user adds Kazan in the first tab
- **THEN** the location Kazan of the second tab holds the coordinates 55.8, 49.1

### Requirement: Stored locations gain coordinates
When the city data is loaded, every city location without coordinates SHALL gain the coordinates of the city record that names its city label; when no city record of its zone bears the stored label, it MUST gain those of the zone city of its zone; when that has none either, as for UTC, it stays without. The list MUST then be written once, and the other open tabs receive it. When no location gained coordinates, nothing MUST be written. Order, home location, identity and every visible row MUST stay unchanged, and no message is shown. A failed load of the city data MUST leave the list as it is, with no error; a later load gives the coordinates. <!-- implements FR8, UX2, G2 of add-city-coordinates-to-locations -->

#### Scenario: An older list gains coordinates
- **GIVEN** the stored list holds Moscow and Kazan without coordinates
- **WHEN** the app is opened and the city data finishes loading
- **THEN** Moscow holds the coordinates 55.8, 37.6
- **AND** Kazan holds the coordinates 55.8, 49.1
- **AND** the list was written exactly once

#### Scenario: A label no record bears
- **GIVEN** the stored list holds a location labelled "Old Town" in `Europe/Moscow` without coordinates
- **WHEN** the city data finishes loading
- **THEN** the location holds the coordinates 55.8, 37.6 of the zone city Moscow

#### Scenario: UTC stays without coordinates
- **GIVEN** the stored list holds UTC
- **WHEN** the city data finishes loading
- **THEN** UTC holds no coordinates
- **AND** the list was not written

#### Scenario: Nothing to give
- **GIVEN** every city location of the stored list holds coordinates
- **WHEN** the city data finishes loading
- **THEN** the list was not written

#### Scenario: Order and home are kept
- **GIVEN** the stored list is Almaty, Moscow, Kazan without coordinates and Moscow is home
- **WHEN** the city data finishes loading
- **THEN** the list is Almaty, Moscow, Kazan in that order
- **AND** Moscow is home

#### Scenario: The city data fails to load
- **GIVEN** the stored list holds Moscow without coordinates
- **WHEN** the city data fails to load
- **THEN** Moscow holds no coordinates
- **AND** no error is shown
- **AND** the list was not written

### Requirement: Coordinates cost no extra work
Giving stored locations their coordinates SHALL look up one city record per city location that lacks coordinates, once per load of the city data, and MUST normalize no text. When every city location holds coordinates, loading the city data MUST look up no coordinates. A minute tick MUST look up none. Presenting the list MUST do the same counted work as without coordinates. <!-- implements NFR-P2, NFR-P3 of add-city-coordinates-to-locations -->

#### Scenario: One lookup per location that lacks coordinates
- **GIVEN** the stored list holds Moscow with coordinates and Kazan and Almaty without
- **WHEN** the city data finishes loading
- **THEN** exactly 2 coordinate lookups were made

#### Scenario: No lookup when nothing is missing
- **GIVEN** every city location of the stored list holds coordinates
- **WHEN** the city data finishes loading
- **THEN** no coordinate lookup was made

#### Scenario: A minute tick looks up nothing
- **GIVEN** the city data is loaded and the list holds Kazan
- **WHEN** a minute passes
- **THEN** no coordinate lookup was made

## MODIFIED Requirements

### Requirement: List is kept on the device
The list SHALL be saved on the device as a versioned document, together with the home location, and restored in the same order when the app is opened again, also offline. The device time location is stored as an entry of its kind without a zone, so the device time zone itself is never stored. When no locations document is stored, the list MUST be the first-launch list (see "First-launch list"). A stored empty list MUST be restored as an empty list. A document of version 1, 2 or 3 MUST be migrated on load: the device time location is put first, the other locations keep their order, a version 2 or 3 home is kept, a version 1 document has no home and a version 3 document holds no coordinates. Nothing MUST be written for the list until the user first changes it or the home location, or until city locations gain their coordinates (see "Stored locations gain coordinates"). A stored identifier that is a known legacy alias MUST be canonicalized on load. <!-- implements FR9, FR11, FR16, UX4 of add-locations-via-search ; FR8 of set-home-location-and-show-differences; FR12, FR13, FR14 of add-settings-page-and-device-time-location ; FR7, FR8 of add-city-coordinates-to-locations -->

#### Scenario: List survives a reload
- **GIVEN** the user added Almaty, then Moscow
- **WHEN** the app is opened again
- **THEN** the list is the device time location, Almaty, Moscow in that order

#### Scenario: First launch writes nothing
- **WHEN** the user opens the app for the first time and adds nothing
- **THEN** no list document is stored

#### Scenario: Legacy identifier is canonicalized on load
- **GIVEN** the stored list holds Kolkata in `Asia/Calcutta`
- **WHEN** the app is opened
- **THEN** the list holds Kolkata in `Asia/Kolkata`

#### Scenario: Offline reopen
- **GIVEN** the user added Almaty on an earlier visit
- **WHEN** the app is opened without a network connection
- **THEN** Almaty is shown

#### Scenario: Previous document version is migrated
- **GIVEN** the stored list is a version 1 document with Almaty, Moscow and Kolkata
- **WHEN** the app is opened
- **THEN** the list is the device time location, Almaty, Moscow, Kolkata in that order
- **AND** no location is home
- **AND** the stored list was not written

#### Scenario: Version 2 document is migrated
- **GIVEN** the stored list is a version 2 document with Moscow and New York and Moscow as home
- **WHEN** the app is opened
- **THEN** the list is the device time location, Moscow, New York in that order
- **AND** Moscow is home
- **AND** the stored list was not written

#### Scenario: The device time zone is not stored
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is the device time location
- **WHEN** the user adds Moscow and the list is written
- **THEN** the stored document holds no `Asia/Almaty`
