## MODIFIED Requirements

### Requirement: Offsets are fast, accessible and fit every screen
Presenting 50 locations with their offsets SHALL take at most 50 ms, and the offset MUST appear in the same render as its row, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: presenting 50 rows again, in the same language and for the same reference day, MUST build no date, time or region name formatter and MUST look up no time zone transition. The list with offsets MUST have no axe-core violations in the light and dark themes. A list whose offsets include `UTC+5:30`, `UTC+5:45` and a negative offset MUST NOT scroll horizontally at 320 px and 2560 px, and the approved "list" screenshots at 375 px and 1024 px in both themes MUST show the offsets. <!-- implements NFR-P1, NFR-A1, NFR-R1, NFR-R2 of show-utc-offset-on-location-rows; FR1, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks -->

#### Scenario: 50 rows within the budget
- **GIVEN** 50 locations whose rows have been presented with offsets once
- **WHEN** their rows are presented with offsets again at another minute of the same day
- **THEN** no date, time or region name formatter is built
- **AND** no time zone transition is looked up

#### Scenario: No accessibility violations with offsets
- **GIVEN** the list contains locations with offsets
- **WHEN** the list is shown in the light or the dark theme
- **THEN** axe-core reports no violations

#### Scenario: Offsets fit narrow and wide screens
- **GIVEN** the list is Kolkata, Kathmandu and New York
- **WHEN** the list is shown at 320 px or 2560 px
- **THEN** the page does not scroll horizontally

#### Scenario: List screenshots show the offsets
- **GIVEN** the list state with Almaty and Moscow
- **WHEN** it is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the Almaty row shows `UTC+5` and the Moscow row shows `UTC+3`
- **AND** the screen matches the re-approved "list" screenshot

### Requirement: Reorder is accessible and fits every screen
The list with handles SHALL have no axe-core violations at rest and while a card is picked up with the keyboard, in the light and dark themes. The handle's target size MUST be at least 44 × 44 CSS px. A list of 5 locations with handles MUST NOT scroll horizontally at 320 px and 2560 px, also while a card is dragged. Moving a location in a list of 50 and presenting the rows again MUST take at most 50 ms, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: moving a location and presenting the 50 rows again MUST build no date, time or region name formatter and MUST look up no time zone transition. The drag-and-drop code MUST NOT be part of the initial JavaScript, which stays at most 150 KB gzipped. The approved "list" screenshots at 375 px and 1024 px in both themes MUST show the handles. <!-- implements NFR-P1, NFR-P2, NFR-A1, NFR-A5, NFR-R1, NFR-R3 of reorder-locations-by-drag-and-drop; FR1, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks -->

#### Scenario: No accessibility violations
- **GIVEN** the list is Moscow, Almaty, New York
- **WHEN** the list is checked with axe-core in the light or the dark theme, at rest and while Moscow is picked up with the keyboard
- **THEN** no violations are reported

#### Scenario: Handle target size
- **WHEN** the list is Moscow, Almaty
- **THEN** each handle is at least 44 × 44 CSS px

#### Scenario: Narrow and wide screens
- **GIVEN** the list is Almaty, Moscow, Kolkata, Tokyo, New York
- **WHEN** it is shown at 320 px or 2560 px and Almaty is picked up and moved down once
- **THEN** the page does not scroll horizontally

#### Scenario: 50 locations within the budget
- **GIVEN** 50 locations whose rows have been presented once
- **WHEN** the last one is moved to the top and the rows are presented
- **THEN** no date, time or region name formatter is built
- **AND** no time zone transition is looked up
- **AND** the first row is the location that was last

#### Scenario: Reorder stays out of the initial bundle
- **WHEN** the app is built for production
- **THEN** the initial JavaScript is at most 150 KB gzipped
- **AND** it contains no drag-and-drop code

#### Scenario: List screenshots show the handles
- **GIVEN** the list state with Almaty and Moscow
- **WHEN** it is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the cards show the handles "Move Almaty" and "Move Moscow"
- **AND** the screen matches the re-approved "list" screenshot

### Requirement: Device time zone badge is accessible and fits every screen
The accessible name of a row that shows the badge SHALL be its city followed by the badge text; a row without the badge MUST be named by its city alone. Presenting 50 locations with the badge rule MUST take at most 50 ms, and the badge MUST appear in the same render as its row, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: presenting 50 rows for the first time in a language MUST build at most 3 date and time formatters per distinct time zone and at most 1 region name formatter. A list with a badge MUST have no axe-core violations in the light and dark themes, MUST NOT scroll horizontally at 320 px and 2560 px, and the approved "list" screenshots at 375 px and 1024 px in both themes MUST show the badge on the matching row. <!-- implements NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2 of mark-device-time-zone-in-location-list; FR2, FR6, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks -->

#### Scenario: Row name includes the badge
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** the Almaty row is named "Almaty Your time zone"
- **AND** the Moscow row is named "Moscow"

#### Scenario: 50 rows within the budget
- **GIVEN** 50 locations and a device time zone that matches some of them
- **AND** no row has been presented yet
- **WHEN** their rows are presented
- **THEN** at most 3 date and time formatters are built per distinct time zone
- **AND** at most 1 region name formatter is built

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

### Requirement: Local time and date are fast and accessible
Presenting 50 locations with their time, date, offset and badge SHALL take at most 50 ms, and the time and the date MUST appear in the same render as their row, with no loading state. The 50 ms budget MUST be checked by the timing benchmark, whose result does not fail the pull request check. The blocking check is a work bound: presenting 50 rows again, in the same language and for the same reference day, MUST build no date, time or region name formatter. The time and date labels MUST stay identical, character for character, in English and Russian. A list with times and dates MUST have no axe-core violations in the light and dark themes. The time and the date MUST be readable text of the card but MUST NOT be a live region, so minute updates are not announced; a row's accessible name MUST stay its city, followed by the device time zone badge text when the badge is shown. <!-- implements NFR-P1, NFR-A1, NFR-A2 of show-local-time-and-date-on-location-cards; FR1, FR5, FR6, NFR-P1, UX1 of replace-wall-clock-row-budgets-with-deterministic-checks -->

#### Scenario: 50 rows within the budget
- **GIVEN** 50 locations whose rows have been presented with time and date once
- **WHEN** their rows are presented with time and date again
- **THEN** no date, time or region name formatter is built

#### Scenario: Labels are unchanged by formatter reuse
- **GIVEN** the list contains Kolkata, Kathmandu and New York
- **WHEN** their rows are presented at `2026-07-15T12:00:00Z` in English and then in Russian
- **THEN** each row shows the same time and date labels as the same zone formatted on its own, in the same language

#### Scenario: No accessibility violations with times
- **GIVEN** the list contains locations with times and dates
- **WHEN** the list is shown in the light or the dark theme
- **THEN** axe-core reports no violations

#### Scenario: Time does not change the row name and is not announced
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user opens the app
- **THEN** the Almaty row is named "Almaty Your time zone" and the Moscow row is named "Moscow"
- **AND** the time of Almaty is not inside a live region
