## MODIFIED Requirements

### Requirement: Accessible Here entry
The Here entry SHALL be outside the numbered location list, so assistive technology does not count it as a location. Its accessible name MUST include the city, the Here mark label and "Device time". Its time MUST be a wall-time input named like a card's (see the `time-selection` capability), and its day track MUST be one Tab stop named like a card's: Tab reaches the time button first, then the slider, then leaves the Here entry. axe-core MUST report no violations with the Here entry shown. <!-- implements NFR-A1, NFR-A2 of show-here-entry-for-device-time; NFR-A2 of add-wall-time-input-with-hint -->

#### Scenario: Name and list size
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the zone cities data is loaded
- **AND** the list is Moscow, New York
- **WHEN** the user opens the app
- **THEN** the Here entry is named `Алматы, Вы здесь, Время устройства`
- **AND** the location list has 2 items
- **AND** the Here entry's slider is named `Время — Алматы`

#### Scenario: One Tab stop on the Here entry
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the interface language is Russian
- **AND** the list is Moscow
- **WHEN** the user moves the focus through the page with Tab
- **THEN** exactly two elements of the Here entry take the focus, in this order: the time button whose name starts with `Ввести время — Алматы`, then the slider named `Время — Алматы`, so the day track is one Tab stop
- **AND** the next Tab moves the focus out of the Here entry

#### Scenario: No violations
- **GIVEN** the Here entry is shown above a list, in the empty state, or while travelling with home set
- **WHEN** axe-core checks the page in the light and dark themes
- **THEN** it reports no violations
