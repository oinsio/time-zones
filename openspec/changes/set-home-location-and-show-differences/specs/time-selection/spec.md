## MODIFIED Requirements

### Requirement: Day track spans the reference day
Every location card in the Cards view whose time zone is known SHALL show a day track. Every track MUST span the same reference day. The day starts at the start of the day that contains the effective instant in the reference zone, and ends at the start of the next day of that zone, measured in absolute time. A day is therefore 23, 24 or 25 hours long around DST changes and is never assumed to be 24 hours. The reference zone is the home location's time zone when home is set, otherwise the device time zone (see the `home-location` capability); it is a canonical IANA identifier, never a raw UTC offset. A row whose zone the browser does not know MUST show no track, and the other rows MUST be unaffected. An empty list shows no track. Inputs: the effective instant (ISO 8601 with `Z`) and the reference zone. Output: the start and end instants of the reference day. Errors: none. The track needs no network and behaves the same offline. <!-- implements FR1 of add-time-sliders-to-location-cards ; FR4 of set-home-location-and-show-differences -->

#### Scenario: A 24-hour reference day
- **GIVEN** the device time zone is `Asia/Almaty`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty, Moscow, Kolkata and New York
- **WHEN** the user opens the app
- **THEN** every card shows a track for the day from `2026-03-07T19:00:00Z` to `2026-03-08T19:00:00Z`

#### Scenario: Days of 23 and 25 hours
- **GIVEN** the device time zone is `America/New_York`
- **WHEN** the moment is on `<date>` in New York
- **THEN** the reference day is `<minutes>` minutes long

| date | minutes |
|---|---|
| `2026-03-08` | 1380 |
| `2026-06-01` | 1440 |
| `2026-11-01` | 1500 |

#### Scenario: No track for an unknown zone
- **GIVEN** the list holds Moscow and a location whose zone the browser does not know (for example `Mars/Olympus_Mons`)
- **WHEN** the list is presented
- **THEN** that location's card shows no track
- **AND** the Moscow card shows its track

#### Scenario: The day of the home location
- **GIVEN** the device time zone is `Europe/Moscow`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **AND** the list contains Almaty and Moscow and Almaty is home
- **WHEN** the user opens the app
- **THEN** every card shows a track for the day from `2026-03-07T19:00:00Z` to `2026-03-08T19:00:00Z`
