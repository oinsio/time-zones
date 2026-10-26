## MODIFIED Requirements

### Requirement: Wall-clock resolution on the new date
When a date change keeps a wall-clock time that does not exist on the new date in the reference zone (a DST gap), the moment SHALL move forward by the length of the gap; when the wall-clock time occurs twice (a DST overlap), the moment MUST be the earlier of the two instants. The outcome MUST be reported with the pinned moment as `UNIQUE`, `GAP` or `AMBIGUOUS`. On `GAP` the date bar MUST tell the user, in the interface language, which wall-clock time was kept and which time is shown instead. The note MUST stay until the next date change, the next time selection on a day track (see the `time-selection` capability) or Now; a time selection pins an exact instant and is reported as `UNIQUE`. `UNIQUE` and `AMBIGUOUS` MUST show no note. <!-- implements FR4 of select-date-with-calendar-and-now; FR5 of add-time-sliders-to-location-cards -->

#### Scenario: A gap is told in the bar
- **GIVEN** the device time zone is `America/New_York`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-07T07:30:00Z`
- **WHEN** the user moves to the next day
- **THEN** the bar shows `02:30 does not exist on this day because of a clock change; showing 03:30.`
- **WHEN** the user moves to the next day again
- **THEN** the bar shows no note

#### Scenario: A time selection ends the gap note
- **GIVEN** the device time zone is `America/New_York`
- **AND** the interface language is English
- **AND** the current instant is `2026-03-07T07:30:00Z`
- **AND** the user moved to the next day, so the bar shows the gap note
- **WHEN** the user moves a day track to the next 15-minute step
- **THEN** the moment is pinned to `2026-03-08T07:45:00Z` with the status `UNIQUE`
- **AND** the bar shows no note

#### Scenario: Wall-clock outcomes
- **GIVEN** the device time zone is `America/New_York`
- **WHEN** the user moves to the next day from the moment `<from>`
- **THEN** the moment is pinned to `<pinned>` with the status `<status>`
- **AND** the bar shows `<note>`

| from | pinned | status | note |
|---|---|---|---|
| `2026-06-01T14:00:00Z` | `2026-06-02T14:00:00Z` | `UNIQUE` | no note |
| `2026-03-07T07:30:00Z` | `2026-03-08T07:30:00Z` | `GAP` | `02:30 does not exist on this day because of a clock change; showing 03:30.` |
| `2026-10-31T05:30:00Z` | `2026-11-01T05:30:00Z` | `AMBIGUOUS` | no note |

#### Scenario: A malformed date changes nothing
- **GIVEN** the moment is live
- **WHEN** a date change arrives with the date `2026-13-01`
- **THEN** the change is rejected as an invalid date
- **AND** the moment is still live

