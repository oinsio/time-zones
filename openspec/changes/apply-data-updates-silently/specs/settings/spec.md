# Spec Delta: settings

## MODIFIED Requirements

### Requirement: City data attribution
The settings page SHALL show the city data attribution as its last line, below every settings group, on every width, in the interface language: "City data: GeoNames (`<date>`), CC BY 4.0" («Данные о городах: GeoNames (`<date>`), CC BY 4.0»); `GeoNames` and `CC BY 4.0` stay untranslated. The date is the date of the city data in use: the dump date recorded in the committed city data, fixed into the build, the same online, offline and after a reload, changing only with a new build. It MUST be written with the day, the month name and the year in the interface language, as a calendar date that does not depend on the device time zone, and MUST follow a change of the interface language at once, without a reload. A build whose city data records no valid date MUST fail. The whole line MUST be one link to `https://www.geonames.org/` that opens in a new browsing context with no reference to the app's window. The app MUST NOT request that address itself. The text MUST exist in every locale file. The line MUST build at most one date formatter per interface language and none on a minute tick. Inputs: the date of the city data, the interface language. Output: the attribution line. Errors: none at run time. <!-- implements FR13, UX4 of add-geonames-city-source; FR12, FR13, NFR-P3, UX4 of apply-data-updates-silently -->

#### Scenario: The attribution in both languages
- **GIVEN** the city data in use records the dump date `2026-11-14`
- **AND** the interface language is `<language>`
- **WHEN** the user opens the settings
- **THEN** a link named `<attribution>` to `https://www.geonames.org/` is shown
- **AND** it stands below the last settings group

| language | attribution |
|---|---|
| English | City data: GeoNames (November 14, 2026), CC BY 4.0 |
| Russian | Данные о городах: GeoNames (14 ноября 2026 г.), CC BY 4.0 |

#### Scenario: The date does not depend on the device time zone
- **GIVEN** the city data in use records the dump date `2026-11-14`
- **AND** the device time zone is `<zone>`
- **WHEN** the settings page is shown in English
- **THEN** the attribution names November 14, 2026

| zone |
|---|
| Pacific/Kiritimati |
| Pacific/Pago_Pago |

#### Scenario: The date follows the language at once
- **GIVEN** the settings page shows the attribution in English
- **WHEN** the user chooses Russian
- **THEN** the attribution reads «Данные о городах: GeoNames (14 ноября 2026 г.), CC BY 4.0» without a reload

#### Scenario: The date follows the build
- **GIVEN** the running build fixes the dump date `2026-12-14`, whatever date the device stores or the network serves
- **WHEN** the user opens the settings in English
- **THEN** the attribution names December 14, 2026

#### Scenario: City data without a date
- **GIVEN** the committed city data records the dump date `<value>`
- **WHEN** the app is built
- **THEN** the build fails and names the dump date

| value |
|---|
| an empty text |
| 14.11.2026 |
| 2026-13-40 |

#### Scenario: Following the attribution keeps the app
- **GIVEN** the settings page is shown
- **WHEN** the user follows the attribution
- **THEN** a new tab opens at `https://www.geonames.org/`
- **AND** the app's tab still shows the settings page

#### Scenario: Offline
- **GIVEN** the device is offline
- **WHEN** the user opens the settings
- **THEN** the attribution is shown with its date
- **AND** the app has requested nothing from `geonames.org`

#### Scenario: Accessible and fitting
- **WHEN** the settings page is shown at 320 px and 2560 px in English and Russian, in the light and dark themes
- **THEN** the attribution is one link named exactly by its visible text, date included, at least 44 px high
- **AND** its text is shown in full and the page does not scroll horizontally
- **AND** axe-core reports no violations

#### Scenario: No formatter on a tick
- **GIVEN** the settings page is shown
- **WHEN** a minute passes
- **THEN** no date formatter was built
