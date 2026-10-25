## ADDED Requirements

### Requirement: Device time zone badge on location rows
A location row SHALL show a "Your time zone" badge next to its city name when the location's canonical IANA identifier equals the device time zone; every matching row MUST show it and no other row MAY show it. Equality MUST be by canonical IANA identifier, never by UTC offset or equal rules. The device time zone MUST be read once when the app starts, through the app's time abstraction, and canonicalized; an identifier the browser does not know MUST be treated as `UTC`. The device time zone MUST NOT be stored and MUST NOT be read again while the app stays open. Adding, removing, moving or resetting locations and changes from another tab MUST keep the rule true for every row. Inputs: the listed locations' canonical identifiers and the device time zone identifier. Output: which rows show the badge. Errors: none — an unknown device identifier falls back to `UTC`. The badge needs no network and behaves the same offline. <!-- implements FR1, FR2, FR3, FR4, UX1 of mark-device-time-zone-in-location-list -->

#### Scenario: One row matches
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty (`Asia/Almaty`) and Moscow (`Europe/Moscow`)
- **WHEN** the user opens the app
- **THEN** the Almaty row shows the badge
- **AND** the Moscow row shows no badge

#### Scenario: No row matches
- **GIVEN** the device time zone is `Asia/Tokyo`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** no row shows the badge

#### Scenario: Several rows match
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the list contains Moscow (`Europe/Moscow`), Saint Petersburg (`Europe/Moscow`) and Almaty (`Asia/Almaty`)
- **WHEN** the user opens the app
- **THEN** the Moscow and the Saint Petersburg rows show the badge
- **AND** the Almaty row shows no badge

#### Scenario: Legacy device identifier
- **GIVEN** the device reports the time zone `Asia/Calcutta`
- **AND** the list contains Kolkata (`Asia/Kolkata`) and Moscow
- **WHEN** the user opens the app
- **THEN** the Kolkata row shows the badge
- **AND** the Moscow row shows no badge

#### Scenario: Unknown device identifier
- **GIVEN** the device reports the time zone `Mars/Olympus_Mons`
- **AND** the list contains UTC (`UTC`) and Moscow
- **WHEN** the user opens the app
- **THEN** the UTC row shows the badge
- **AND** the Moscow row shows no badge

#### Scenario: Badge follows changes of the list
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Moscow
- **WHEN** the user adds Almaty
- **THEN** the Almaty row shows the badge
- **WHEN** the user removes Almaty
- **THEN** no row shows the badge

#### Scenario: Device zone is read once
- **GIVEN** the device time zone is `Asia/Almaty` when the app opens
- **AND** the list contains Almaty and Moscow
- **WHEN** the device time zone becomes `Europe/Moscow` while the app stays open
- **AND** the user adds Tokyo
- **THEN** the Almaty row still shows the badge
- **AND** the Moscow row shows no badge

#### Scenario: Device zone is not stored
- **GIVEN** the device time zone is `Asia/Almaty`
- **WHEN** the user adds Almaty
- **THEN** the stored list document holds only the locations, without the device time zone

### Requirement: Device time zone badge text
The badge text SHALL come from the locale files and exist in English ("Your time zone") and Russian ("Ваш часовой пояс"). The badge MUST carry the location-arrow icon of the "here" mark, hidden from assistive technology. <!-- implements FR5, UX2 of mark-device-time-zone-in-location-list -->

#### Scenario: English interface
- **GIVEN** the interface language is English
- **AND** the device time zone is `Asia/Almaty` and the list contains Almaty
- **WHEN** the user opens the app
- **THEN** the Almaty row shows "Your time zone"

#### Scenario: Russian interface
- **GIVEN** the interface language is Russian
- **AND** the device time zone is `Asia/Almaty` and the list contains Almaty
- **WHEN** the user opens the app
- **THEN** the Almaty row shows "Ваш часовой пояс"

### Requirement: Device time zone badge is accessible and fits every screen
The accessible name of a row that shows the badge SHALL be its city followed by the badge text; a row without the badge MUST be named by its city alone. Presenting 50 locations with the badge rule MUST take at most 50 ms, and the badge MUST appear in the same render as its row, with no loading state. A list with a badge MUST have no axe-core violations in the light and dark themes, MUST NOT scroll horizontally at 320 px and 2560 px, and the approved "list" screenshots at 375 px and 1024 px in both themes MUST show the badge on the matching row. <!-- implements NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2 of mark-device-time-zone-in-location-list -->

#### Scenario: Row name includes the badge
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** the Almaty row is named "Almaty Your time zone"
- **AND** the Moscow row is named "Moscow"

#### Scenario: 50 rows within the budget
- **GIVEN** 50 locations and a device time zone that matches some of them
- **WHEN** their rows are presented
- **THEN** it takes at most 50 ms

#### Scenario: No accessibility violations with the badge
- **GIVEN** the device time zone is `Asia/Almaty` and the list contains Almaty and Moscow
- **WHEN** the list is shown in the light or the dark theme
- **THEN** axe-core reports no violations

#### Scenario: Badge fits narrow and wide screens
- **GIVEN** the device time zone is `Asia/Almaty` and the list contains Almaty, Kathmandu and New York
- **WHEN** the list is shown at 320 px or 2560 px
- **THEN** the page does not scroll horizontally

#### Scenario: List screenshots show the badge
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list state with Almaty and Moscow
- **WHEN** it is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the Almaty row shows the badge and the Moscow row does not
- **AND** the screen matches the re-approved "list" screenshot
