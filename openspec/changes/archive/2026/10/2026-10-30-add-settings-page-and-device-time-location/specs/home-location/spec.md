# Spec Delta

## ADDED Requirements

### Requirement: Device time location as home
The user SHALL be able to make the device time location the home location and clear it, like any location. While it is home, its row MUST show the Home mark instead of the Here mark, and the reference zone MUST be the device time zone. When the device time zone changes while it is home, the reference zone, the reference day and every offset difference MUST follow the new device time zone in the same render, and the reference moment MUST be kept (live stays live, pinned keeps its instant). Removing it while it is home MUST clear home. The stored home MUST name the device time location, not the device time zone. Inputs: the device time location. Effects: it is the home location. Errors: location not found when it is no longer in the list. <!-- implements FR10 of add-settings-page-and-device-time-location -->

#### Scenario: Make the device time location home
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the list is the device time location, Moscow, and no location is home
- **WHEN** the user makes the device time location home
- **THEN** it shows the Home mark
- **AND** Moscow shows `−2 h`

#### Scenario: Home follows the device
- **GIVEN** the device time location is home and the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list is the device time location, New York
- **WHEN** the device time zone becomes `Europe/Moscow` and the minute tick reads it
- **THEN** the reference day is `2026-03-07T21:00:00Z`–`2026-03-08T21:00:00Z`
- **AND** New York shows `−7 h`
- **AND** the device time location is still home

#### Scenario: Home survives a reload
- **GIVEN** the device time location is home
- **WHEN** the app is opened again on a device in another time zone
- **THEN** the device time location is home
- **AND** the reference zone is the new device time zone
