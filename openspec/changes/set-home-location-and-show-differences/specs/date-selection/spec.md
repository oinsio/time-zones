## MODIFIED Requirements

### Requirement: Reference moment
The app SHALL keep one reference moment from which every location's time, date and UTC offset are derived. The moment MUST be either live — equal to the current instant of the clock — or pinned to one instant chosen by the user. It MUST be live whenever the app opens. It MUST NOT be written to storage and MUST NOT be passed to other open tabs; a change of the location list in another tab MUST keep it. Reset of an unreadable list MUST keep it. The reference zone is the home location's time zone when home is set, otherwise the device time zone (canonical IANA identifier, never a raw offset; see the `home-location` capability). Setting, moving or clearing home MUST keep the moment: live stays live, pinned keeps its instant. Inputs: the clock's current instant (ISO 8601 with `Z`), the device time zone and the home location. Output: the effective instant — the current instant while live, the pinned instant while pinned. Errors: none. <!-- implements FR1 of select-date-with-calendar-and-now ; FR4 of set-home-location-and-show-differences -->

#### Scenario: The app opens live
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty
- **WHEN** the user opens the app
- **THEN** the moment is live
- **AND** the Almaty row shows `12:30` and `Sun, Mar 8`
- **AND** the Now button is not shown

#### Scenario: Date changes store nothing
- **GIVEN** the list contains Almaty and the app is open
- **WHEN** the user moves to the next day 5 times, to the previous day 5 times and then returns to now
- **THEN** the stored list was not written

#### Scenario: The pinned moment survives a list change in another tab
- **GIVEN** the moment is pinned to `2026-03-09T07:30:00Z`
- **WHEN** another tab adds Moscow to the list
- **THEN** the moment is still pinned to `2026-03-09T07:30:00Z`
- **AND** the Moscow row shows `10:30` and `Mon, Mar 9`

#### Scenario: A home change keeps the pinned moment
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the moment is pinned to `2026-03-08T20:30:00Z`
- **AND** the list contains Almaty and Moscow
- **WHEN** the user makes Almaty home
- **THEN** the moment is still pinned to `2026-03-08T20:30:00Z`
- **AND** the date bar shows Monday, March 9
