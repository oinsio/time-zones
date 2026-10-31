## MODIFIED Requirements

### Requirement: Local time and date layout
The time SHALL be the most prominent text of a card — larger and bolder than the city — and MUST use tabular figures; the date MUST be secondary text directly under the time. On screens narrower than 768 px the time MUST be on the city line at the right end of the card's content, before the location menu button, with the date right-aligned under it. On screens 768 px and wider the time and the date MUST form a column right after the city and country column, within the left half of the card, with the date left-aligned under the time. From 768 px this time column MUST have the same width on every card of the list, whatever the time it shows and in both hour formats, and MUST show every time of either hour format (for example `12:59 PM`) in full, on one line. A list with times and dates MUST NOT scroll horizontally at 320 px and 2560 px, and the approved "list" screenshots at 375 px and 1024 px in both themes, taken at the pinned instant `2026-03-08T07:30:00Z`, MUST show `12:30` on Almaty and `10:30` on Moscow with their dates. <!-- implements NFR-R1, NFR-R2, NFR-R3, UX1, UX2 of show-local-time-and-date-on-location-cards ; UX3 of set-home-location-and-show-differences; FR5, UX3 of fix-location-card-and-header-layout -->

#### Scenario: Narrow screen
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and Moscow
- **WHEN** the list is shown 375 px wide
- **THEN** the time `12:30` of Almaty is on its city line, right of the city, at the right end of the card's content
- **AND** the date of Almaty is under the time, right-aligned with it

#### Scenario: Wide screen
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and Moscow
- **WHEN** the list is shown 1024 px wide
- **THEN** the time `12:30` of Almaty is right of its city and country, within the left half of the card
- **AND** the date of Almaty is under the time, left-aligned with it

#### Scenario: One time column width in the 12-hour format
- **GIVEN** the interface language is English
- **AND** the hour format is 12-hour
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Moscow, New York, Tokyo and Kolkata
- **WHEN** the list is shown `<width>` px wide
- **THEN** the cards show `10:30 AM`, `3:30 AM`, `4:30 PM` and `1:00 PM`
- **AND** the time columns of the four cards have the same width, within 1 px
- **AND** each time is shown in full on one line

| width |
|---|
| 768 |
| 1024 |
| 1440 |

#### Scenario: Times fit narrow and wide screens
- **GIVEN** the list is Almaty, Kathmandu, New York and Tokyo
- **WHEN** the list is shown at 320 px or 2560 px
- **THEN** the page does not scroll horizontally

#### Scenario: List screenshots show the time and the date
- **GIVEN** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list state with Almaty and Moscow
- **WHEN** it is shown at 375 px or 1024 px in the light or the dark theme
- **THEN** the Almaty row shows `12:30` and the Moscow row shows `10:30`, each with its date
- **AND** the screen matches the re-approved "list" screenshot
