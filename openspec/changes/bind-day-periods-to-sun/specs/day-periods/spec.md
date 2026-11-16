# Spec Delta: day-periods

## Purpose
Defines the day periods of a location — night, morning, day and evening — by the sun's elevation at the location's coordinates, including the polar cases, the accuracy of the boundaries and what a location without coordinates has.

## ADDED Requirements

### Requirement: Day periods follow the sun
The day period of a location at an instant SHALL be decided by the sun's elevation at the location's coordinates at that instant: night while the elevation is below −6°; day while it is +6° or more; between −6° and +6° it is morning from solar midnight to solar noon and evening from solar noon to solar midnight. Inputs: coordinates, an instant. Output: night, morning, day or evening. Errors: none. <!-- implements FR1 of bind-day-periods-to-sun -->

#### Scenario: A day at a middle latitude
- **GIVEN** Almaty at 43.3, 76.9 on 8 March 2026
- **WHEN** the day period is read at `<local time>` in `Asia/Almaty`
- **THEN** it is `<period>`

| local time | period |
|---|---|
| 03:00 | night |
| 06:20 | morning |
| 12:00 | day |
| 17:45 | evening |
| 21:00 | night |

#### Scenario: Boundaries of the day
- **GIVEN** `<city>` at `<coordinates>` on `<date>`
- **WHEN** the day-period boundaries of that day are computed
- **THEN** in `<zone>` night ends at `<dawn>`, day starts at `<day start>`, day ends at `<day end>` and night starts at `<dusk>`, each within 3 minutes

| city | coordinates | date | zone | dawn | day start | day end | dusk |
|---|---|---|---|---|---|---|---|
| Almaty | 43.3, 76.9 | 2026-03-08 | `Asia/Almaty` | 05:48 | 06:55 | 17:11 | 18:18 |
| Moscow | 55.8, 37.6 | 2026-12-21 | `Europe/Moscow` | 08:10 | 10:16 | 14:38 | 16:44 |
| Moscow | 55.8, 37.6 | 2026-06-21 | `Europe/Moscow` | 02:42 | 04:48 | 20:14 | 22:20 |
| Quito | −0.2, −78.5 | 2026-03-20 | `America/Guayaquil` | 05:57 | 06:45 | 17:57 | 18:45 |
| Sydney | −33.9, 151.2 | 2026-12-21 | `Australia/Sydney` | 05:11 | 06:17 | 19:28 | 20:34 |
| Kolkata | 22.5, 88.4 | 2026-03-08 | `Asia/Kolkata` | 05:29 | 06:21 | 17:13 | 18:05 |

#### Scenario: Two cities of one zone differ
- **GIVEN** Moscow at 55.8, 37.6 and Kazan at 55.8, 49.1, both in `Europe/Moscow`, on 21 June 2026
- **WHEN** the day-period boundaries are computed
- **THEN** the day starts at 04:48 in Moscow and at 04:02 in Kazan, each within 3 minutes

### Requirement: Polar days and nights
When the sun does not cross a threshold during a day, the day periods SHALL follow the same rule with no special case. While the sun stays below −6° the period is night the whole day. While it stays at +6° or above the period is day the whole day. When it rises above −6° but not to +6°, morning lasts until solar noon and evening follows, with no day. When it does not go below −6°, evening lasts until solar midnight and morning follows, with no night. <!-- implements FR2 of bind-day-periods-to-sun -->

#### Scenario: The polar cases
- **GIVEN** `<city>` at `<coordinates>` on `<date>`
- **WHEN** the day periods of that day are computed
- **THEN** the periods of the day are `<periods>`

| city | coordinates | date | periods |
|---|---|---|---|
| Longyearbyen | 78.2, 15.6 | 2026-12-21 | night only |
| Longyearbyen | 78.2, 15.6 | 2026-06-21 | day only |
| Murmansk | 69.0, 33.1 | 2026-12-21 | night, morning from about 10:22, evening from solar noon at about 12:45, night from about 15:08 (`Europe/Moscow`, within 10 minutes) |
| Murmansk | 69.0, 33.1 | 2026-06-21 | evening until solar midnight at about 00:49, morning until about 03:12, day, evening from about 22:26 (`Europe/Moscow`, within 10 minutes), no night |

#### Scenario: A night that barely gets dark
- **GIVEN** Saint Petersburg at 59.9, 30.3 on 21 June 2026
- **WHEN** the day periods are computed
- **THEN** night lasts from about 00:09 to about 01:51 in `Europe/Moscow`, each within 10 minutes

### Requirement: The sun is computed on the device
The sun's elevation SHALL be computed from the coordinates and the instant alone, on the device, with no request, no data file and no runtime dependency. The time zone of the location MUST NOT enter the calculation: a clock change MUST NOT move a day-period boundary in absolute time. The boundaries MUST be within 3 minutes of published civil twilight times for latitudes up to 66° and within 10 minutes above, for dates from 2000 to 2100. The calculation MUST work in the supported legacy browsers, with no BigInt. <!-- implements FR3, FR4, NFR-P2, NFR-R2 of bind-day-periods-to-sun -->

#### Scenario: A clock change does not move the sun
- **GIVEN** New York at 40.7, −74.0 on 8 March 2026, when its clocks go forward
- **WHEN** the day-period boundaries are computed
- **THEN** night ends at 06:51 and the day starts at 07:55 local time, each within 3 minutes
- **AND** the absolute instants are the same as if the clocks had not changed

#### Scenario: Offline
- **GIVEN** the device has no network connection
- **WHEN** the day periods of Almaty are computed
- **THEN** they are the same as online and nothing was requested

#### Scenario: A far date
- **GIVEN** Moscow at 55.8, 37.6
- **WHEN** the day-period boundaries of 21 December 2090 are computed
- **THEN** night ends at `2090-12-21T05:10:00Z` (08:10 in `Europe/Moscow`), within 3 minutes

### Requirement: Coordinates of a location for the sun
A city location SHALL use its own coordinates. A city location that has none MUST use the zone coordinates of its zone. The device time location MUST use the zone coordinates of the device time zone and MUST NOT request the device's coordinates. A location for which no coordinates are known — a location in UTC, or in a zone without zone coordinates — has no day periods. <!-- implements FR7, FR8 of bind-day-periods-to-sun -->

#### Scenario: A city with its own coordinates
- **GIVEN** the location Kazan holds the coordinates 55.8, 49.1
- **WHEN** its day periods are computed
- **THEN** they are those of 55.8, 49.1, not those of the zone city Moscow

#### Scenario: A city stored before coordinates
- **GIVEN** the location Kazan in `Europe/Moscow` holds no coordinates
- **WHEN** its day periods are computed
- **THEN** they are those of the zone coordinates of `Europe/Moscow`

#### Scenario: The device time location
- **GIVEN** the device time zone is `Europe/Minsk`
- **WHEN** the day periods of the device time location are computed
- **THEN** they are those of the zone coordinates of `Europe/Minsk`
- **AND** the device's coordinates were not requested

#### Scenario: No coordinates
- **GIVEN** `<location>`
- **WHEN** its day periods are computed
- **THEN** it has no day periods

| location |
|---|
| UTC |
| a city location in a zone without zone coordinates and without its own coordinates |
| the device time location while the device time zone has no zone coordinates |
