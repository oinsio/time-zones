## MODIFIED Requirements

### Requirement: Select a time on the Here entry
The Here entry's day track SHALL select a time exactly as a card's day track does, by pointer and by keys. A time selection on it MUST pin the reference moment and update every card in the same render, and the date bar's Now button MUST become active. <!-- implements FR5 of show-here-entry-for-device-time; FR3 of keep-now-button-visible-when-live -->

#### Scenario: Time selection from the Here entry
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is Moscow
- **WHEN** the user moves the Here entry's day track one hour forward
- **THEN** the Here entry shows `13:30`
- **AND** Moscow shows `11:30`
- **AND** the Now button is active

