# Spec Delta

## MODIFIED Requirements

### Requirement: Search by country
Every time zone of a country SHALL match when the country name in English or Russian, or any word of it, starts with the query. On an engine without `Intl.DisplayNames`, country names are unknown: a country query MUST match nothing by country and MUST NOT be an error, and search by city and by abbreviation MUST work as before. <!-- implements FR3 of add-locations-via-search; FR5 of support-legacy-ios-12-safari -->

#### Scenario: Country with several zones
- **WHEN** the user searches for "Kazakhstan"
- **THEN** every result has the country Kazakhstan
- **AND** Almaty is among the results

#### Scenario: Country name in Russian
- **WHEN** the user searches for "Казахстан"
- **THEN** Almaty is among the results

#### Scenario: No country names on a legacy engine
- **GIVEN** the environment has no `Intl.DisplayNames`
- **WHEN** the user searches for "Kazakhstan"
- **THEN** no result is matched by country
- **AND** no error is shown

#### Scenario: City search on a legacy engine
- **GIVEN** the environment has no `Intl.DisplayNames`
- **WHEN** the user searches for "Almaty"
- **THEN** Almaty is among the results
