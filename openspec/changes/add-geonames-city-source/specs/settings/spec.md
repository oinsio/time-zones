# Spec Delta

## ADDED Requirements

### Requirement: City data attribution
The settings page SHALL show the city data attribution as its last line, below every settings group, on every width, in the interface language; `GeoNames` and `CC BY 4.0` stay untranslated. The whole line MUST be one link to `https://www.geonames.org/` that opens in a new browsing context with no reference to the app's window. The app MUST NOT request that address itself. <!-- implements FR13, UX4 of add-geonames-city-source -->

#### Scenario: The attribution in both languages
- **GIVEN** the interface language is `<language>`
- **WHEN** the user opens the settings
- **THEN** a link named `<attribution>` to `https://www.geonames.org/` is shown
- **AND** it stands below the last settings group

| language | attribution |
|---|---|
| English | City data: GeoNames, CC BY 4.0 |
| Russian | Данные о городах: GeoNames, CC BY 4.0 |

#### Scenario: Following the attribution keeps the app
- **GIVEN** the settings page is shown
- **WHEN** the user follows the attribution
- **THEN** a new tab opens at `https://www.geonames.org/`
- **AND** the app's tab still shows the settings page

#### Scenario: Offline
- **GIVEN** the device is offline
- **WHEN** the user opens the settings
- **THEN** the attribution is shown
- **AND** the app has requested nothing from `geonames.org`

### Requirement: Accessible and responsive attribution
The attribution SHALL be a link named exactly by its visible text, reachable with Tab after the last settings control, at least 44 px high, with a visible focus outline and a contrast of at least 4.5:1 in both themes. At 320 px and 2560 px its text MUST be shown in full in both languages and the page MUST NOT scroll horizontally. The approved settings screenshots are re-approved once. <!-- implements NFR-A2, NFR-R2, M6 of add-geonames-city-source -->

#### Scenario: Keyboard
- **WHEN** the user tabs past the last settings control
- **THEN** focus is on the attribution link with a visible focus outline
- **AND** the link is at least 44 px high

#### Scenario: Accessibility check
- **WHEN** the settings page is checked with axe-core in the light and dark themes
- **THEN** no violations are reported

#### Scenario: Narrow and wide screens
- **WHEN** the settings page is shown at 320 px and 2560 px in English and Russian
- **THEN** the attribution text is shown in full
- **AND** the page does not scroll horizontally
