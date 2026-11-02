## MODIFIED Requirements

### Requirement: Dialect fallback
A locale whose base language differs from its code SHALL be a dialect; easter-egg languages are dialects too. Every text of a dialect MUST come from the dialect's own locale file, and a key the dialect does not translate MUST come from its base language, then from English. Language-keyed data that has no entry for the dialect (city names, the first day of the week) MUST follow the same order: the dialect, its base language, English. Dates, weekdays, months and country names formatted through `Intl` MUST be formatted with that order as their locale list, so a dialect whose code `Intl` does not support reads its base language, or else English, and never the device's own locale. Inputs: the interface language, the locale registry. Output: the shown text. Errors: none; a key missing everywhere shows as in any other language. <!-- implements FR10 of add-interface-language-selection; FR5 of show-city-labels-in-interface-language -->

#### Scenario: Fallback order of a dialect
- **GIVEN** a dialect `ru-KZ` with base language `ru`
- **AND** the key `a` is translated in `ru-KZ`, `ru` and `en`
- **AND** the key `b` is translated in `ru` and `en` only
- **AND** the key `c` is translated in `en` only
- **WHEN** the interface language is `ru-KZ`
- **THEN** `a` shows the `ru-KZ` text, `b` the `ru` text and `c` the `en` text

#### Scenario: Language-keyed data of a dialect
- **GIVEN** a dialect `ru-KZ` with base language `ru`
- **WHEN** the interface language is `ru-KZ`
- **THEN** the city of `Asia/Almaty` is named «Алматы»
- **AND** calendar weeks start on Monday

#### Scenario: Intl data of a dialect Intl does not know
- **GIVEN** a dialect `tlh` with base language `ru`, a code `Intl` supports no data for
- **AND** the device's own locale is English
- **WHEN** the interface language is `tlh`
- **THEN** the country of `KZ` is named «Казахстан»
- **AND** the local date of a row and the date bar weekday equal their Russian texts
