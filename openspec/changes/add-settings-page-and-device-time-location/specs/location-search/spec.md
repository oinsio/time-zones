# Spec Delta

## ADDED Requirements

### Requirement: Device time in the search
While the location list holds no device time location, the search SHALL show a "Device time" («Время устройства») option before every suggestion and result. It MUST be shown when the query is empty or only whitespace, and when a word of "Device time" or «Время устройства» starts with the query under the search's query normalization, whatever the interface language. It MUST be shown in every search data state: loading, failed and ready, and offline. Choosing it MUST add the device time location to the end of the list, close the search and announce the addition politely. While the list holds a device time location, the option MUST NOT be shown. The option does not count towards the 50-result limit and does not change the order of city results. Inputs: the query, whether the list holds the device time location. Output: whether the option is shown. Errors: none. <!-- implements FR11 of add-settings-page-and-device-time-location -->

#### Scenario: Offered after removal
- **GIVEN** the list is Moscow
- **WHEN** the user opens the search
- **THEN** the first option is "Device time"
- **AND** the popular suggestions follow it

#### Scenario: Matched by a word in either language
- **GIVEN** the list is Moscow
- **AND** the interface language is English
- **WHEN** the user searches for `<query>`
- **THEN** the "Device time" option is shown first

| query |
|---|
| `dev` |
| `time` |
| `врем` |
| `устр` |

#### Scenario: Not matched
- **GIVEN** the list is Moscow
- **WHEN** the user searches for "Moscow"
- **THEN** no "Device time" option is shown

#### Scenario: Shown while the search data loads or failed
- **GIVEN** the list is Moscow
- **AND** the search data is `<state>`
- **WHEN** the user opens the search
- **THEN** the "Device time" option is shown

| state |
|---|
| loading |
| failed to load |

#### Scenario: Choose it
- **GIVEN** the list is Moscow
- **WHEN** the user opens the search and chooses "Device time"
- **THEN** the search is closed
- **AND** the list is Moscow, the device time location
- **AND** the addition is announced politely

#### Scenario: Hidden while listed
- **GIVEN** the list is the device time location, Moscow
- **WHEN** the user opens the search
- **THEN** no "Device time" option is shown
