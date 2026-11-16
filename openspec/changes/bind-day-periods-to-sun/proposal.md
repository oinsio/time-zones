# Bind day periods to the sun

Builds on `add-city-coordinates-to-locations`, which has landed (archived 2026-11-16): `Coordinates`, `Location.coordinates` and `zone-rules/zone-coordinates.json` exist. That change touched `city-data`, `location-search` and `locations`; this one touches `time-selection`, `grid-view` and `day-colouring` and adds `day-periods`, so the two do not edit the same requirements.

## Why

The "Time of day" day colouring, the default, paints every city by the same clock: night until 07:00, morning until 09:00, work until 18:00, evening until 22:00. It was a proof of concept, and it is wrong in two ways. It does not show the day as it is at the place: on 21 December the sun rises in Moscow at about 08:57 and sets at 15:57, in June the night in Saint Petersburg lasts under two hours, and Murmansk has no day at all in December. And its "work" period duplicates the working hours, which now have their own day colouring with a range the user sets.

Audience: every user of the default day colouring, in the Cards view and in the Grid view.

## What Changes

- ADDED `day-periods`: the day periods of a location are decided by the sun's elevation at the location's coordinates — night below −6°, day at +6° and above, morning in between while the sun rises, evening in between while it sets. Polar day, polar night and nights that never get dark follow from the same rule. The sun is computed on the device from the coordinates and the date; no data is downloaded.
- MODIFIED `time-selection`: in the Time of day colouring a day track is coloured by these day periods, with soft blends at the boundaries. A clock change no longer makes a colour edge.
- MODIFIED `grid-view`: in the Time of day colouring an hour cell takes the day period that holds most of the cell.
- MODIFIED `day-colouring`: a location without coordinates — UTC, or a zone that only a zone rules update knows — has no day periods and is coloured in one neutral colour, the non-working grey. The approved Time of day screenshots are re-approved once.
- The device time location takes the coordinates of its zone's principal place.
- **BREAKING** for the look, not for data: the default colours of every track and strip change. Nothing stored changes.
- REMOVED: the day-period schedule by the clock (07:00, 09:00, 18:00, 22:00) and the work period.
- Glossary (`docs/glossary/time-selection.md`), changed terms:
  - **Day period** — night, morning, day, evening, decided by the sun's elevation at the location. *RU:* ночь, утро, день, вечер. *Code:* `DayPeriod.NIGHT | MORNING | DAY | EVENING`. The member `WORK` becomes `DAY`; the token `--color-day-work` becomes `--color-day-daylight`. *Never:* work, working hours, business hours (for this period).
  - **Blend window** — the span around a day-period boundary where two colours blend: 30 minutes, shortened so it never passes the midpoint to the next boundary.
  - **Offset edge** — only the line in the hour strip at a clock change; no longer a colour edge of a day track.
  - **Colour stop** — unchanged meaning; a location without day periods has one neutral stop.
- Glossary, new terms: **Sun elevation** — the angle of the sun's centre above the horizon at given coordinates and instant, in degrees; **Day-period boundary** — an instant at which a location's day period changes; **Solar day** — the span from one solar midnight to the next at given coordinates, with its solar noon (the sun highest) and solar midnight (the sun lowest); **Zone coordinates of the device** is not a term: the device time location uses the zone coordinates.
- Glossary, removed term: **Day-period schedule**.
- Glossary (`docs/glossary/search.md`): **Zone coordinates** gains the code owner `getZoneCoordinates` (`src/model/sunCoordinates.ts`), which reads them in the app.
- Glossary (`docs/glossary/settings.md`): **Working hours** drops "*Not:* the work period 09:00–18:00 of the day periods"; **Day colouring** says that Time of day follows the sun.
- A new ADR, ADR-0016, records the long-lived decision: day periods follow the sun's elevation, computed on the device with the NOAA solar equations, no library and no network. It is delivered as the handoff patch H1, because the implementing stage may not write `docs/adr/` or `CLAUDE.md`. `docs/architecture/open-questions.md` Q3 is closed with a pointer to it.

## Capabilities

### New Capabilities

- `day-periods`: what the day periods of a location are, how the sun's elevation decides them, the polar cases, the accuracy, and what a location without coordinates has.

### Modified Capabilities

- `time-selection`: REMOVED "Day-period colours"; ADDED "Day-period colours by the sun".
- `grid-view`: MODIFIED "Hour cell colour".
- `day-colouring`: ADDED "Locations without day periods", "Day periods are fast"; MODIFIED "Day colouring" (it names the new `time-selection` requirement and takes the coordinates), "Approved screenshots of the colourings".

## Goals

- G1: In the Time of day colouring, 100% of city locations with coordinates are coloured by the sun at their place.
- G2: Day-period boundaries are within 3 minutes of published civil twilight times for places up to 66° of latitude.
- G3: No request, no library and no data file is added for the sun.
- G4: One concept, one owner: no day-period boundary by the clock remains in the code.

## Non-Goals

- NG1: No change to the Plain and the Working hours day colourings, to the working hours or to the settings page.
- NG2: Sunrise and sunset times are not shown as text or as marks.
- NG3: No use of the browser's geolocation; the device time location uses its zone's coordinates.
- NG4: No correction for altitude, terrain or weather.
- NG5: No new design tokens: the four day-period colours and the non-working grey keep their values; one token is renamed.
- NG6: No user-defined thresholds.

## Users & Scenarios

- U1: A user in Moscow looks at the Moscow card on 21 December: the track is night until about 08:10, morning until about 10:16, day until about 14:38, evening until about 16:44, then night.
- U2: The same user has Kazan and Moscow in the list. Both are in `Europe/Moscow`, but Kazan's day starts about 46 minutes earlier, and the two tracks show it.
- U3: A user with Murmansk in the list sees, on 21 December, night with a short morning and evening around noon and no day; on 21 June, no night.
- U4: A user plans a call in the Grid view: each row's cells show where it is dark and where it is light at that place on that date.
- U5: A user has UTC in the list: its track and cells are one neutral colour.
- U6: A user switches to the Working hours colouring: nothing about it changed.

## Requirements

### Functional

- FR1: The day period of a location at an instant SHALL be decided by the sun's elevation at the location's coordinates: night below −6°; day at +6° and above; between −6° and +6°, morning from solar midnight to solar noon and evening from solar noon to solar midnight.
- FR2: When the sun does not cross a threshold on a day, the periods SHALL follow FR1 without special cases: all night when it stays below −6°; all day when it stays at or above +6°; morning then evening with no day when it does not reach +6°; evening then morning with no night when it does not go below −6°.
- FR3: The sun's elevation SHALL be computed on the device from the coordinates and the instant only. The time zone SHALL NOT enter the calculation, and a clock change SHALL NOT move a day-period boundary.
- FR4: Day-period boundaries SHALL be within 3 minutes of published civil twilight (−6°) times for latitudes up to 66°, and within 10 minutes above, for dates from 2000 to 2100.
- FR5: In the Time of day colouring a day track SHALL be coloured by the location's day periods over the reference day. Each boundary inside the day blends the two colours linearly over a 30-minute blend window centred on it; a window SHALL NOT pass the midpoint to the neighbouring boundary.
- FR6: In the Time of day colouring an hour cell SHALL take the day period that covers the largest part of the cell; on a tie, the earlier one.
- FR7: A city location SHALL use its own coordinates; a city location that has none yet SHALL use the zone coordinates of its zone. The device time location SHALL use the zone coordinates of the device time zone.
- FR8: A location for which no coordinates are known — UTC, or a zone without zone coordinates — SHALL have no day periods. In the Time of day colouring its track and its cells SHALL be the non-working grey, with the text colour of that grey.
- FR9: The work period, the day-period schedule by the clock and the colour edge at a clock change SHALL be removed. The line at a clock change in the hour strip stays.
- FR10: The Plain and the Working hours day colourings, the handle, the hour labels, the midnight markers, the hour frame and the meeting range SHALL be unchanged.

### Non-Functional

#### Performance

- NFR-P1: Presenting the day tracks and hour strips of 50 rows for the first time in a reference day SHALL compute the sun for at most 3 solar days per distinct coordinates and build no additional formatter. Presenting them again within the same reference day SHALL compute nothing for the sun and return the same colour stops and the same cells. Real timings are reported by a benchmark and never asserted (ADR-0008).
- NFR-P2: The sun calculation SHALL add no request and no dependency; the initial JavaScript SHALL stay at most 150 KB gzipped.
- NFR-P3: A minute tick SHALL compute nothing for the sun.

#### Accessibility

- NFR-A1: Digits and texts on every cell colour, including the grey of a location without day periods, SHALL keep a contrast of at least 4.5:1 in both themes, and the handle at least 3:1 against every track colour. The main page in Cards and in Grid in the Time of day colouring SHALL have no axe-core violations in both themes.
- NFR-A2: Colour stays decorative: the accessible names, values and roles of day tracks and hour strips SHALL be unchanged.

#### Responsive

- NFR-R1: Time of day is the default colouring, so every approved screenshot that shows a day track or an hour strip in it SHALL be re-approved once and then match — among them the Time of day screenshots of Cards at 375 px and Grid at 1280 px in both themes. The Plain and the Working hours screenshots and those without tracks or strips SHALL match unchanged; no layout changes from 320 px to 2560 px.
- NFR-R2: The work on legacy iOS 12 Safari SHALL be unchanged: the calculation uses plain numbers and milliseconds, no BigInt.

## UX Acceptance Criteria

- UX1: Morning and evening are visible bands, not hairlines: at middle latitudes each is about an hour wide on a track.
- UX2: Two cities of one zone look different when their sun differs (Moscow and Kazan).
- UX3: The polar cases look deliberate: a whole track of one colour, never a broken gradient.
- UX4: A location without day periods is quiet and neutral, not an error.
- UX5: The colours themselves are the ones users know.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | location with coordinates | track and cells by the sun |
| any | city location stored before coordinates, city data not loaded yet | by the zone coordinates of its zone; by its own coordinates once it gains them |
| any | UTC, or a zone without zone coordinates | one neutral colour |
| any | device time location | by the zone coordinates of the device time zone |
| offline | any | the same: nothing is requested for the sun |
| any | list empty | no tracks, as today |

## Behavior

- `packages/client/src/test/features/day_periods/` new `day_periods_sun_unit.feature`, `day_periods_polar_unit.feature`, `day_periods_budget_unit.feature` — tagged `@bind-day-periods-to-sun`.
- `packages/client/src/test/features/time_selection/time_selection_day_colours.feature`, `grid_view/grid_view_hour_cells_unit.feature` and `grid_view_hour_cells_e2e.feature`, `day_colouring/day_colouring_e2e.feature` — changed scenarios tagged `@bind-day-periods-to-sun`.

## Visual Reference

No Figma frame. The existing tracks and strips are the reference; design tokens are the source of truth (`docs/architecture/views.md`, colour table).

## Affected IA

No changes.

## Success Metrics

- M1: 12 of 12 reference cases match published or independently computed civil twilight within 3 minutes (10 minutes above 66°): Almaty, Moscow (June, December), Kazan, Saint Petersburg, Quito, Sydney, New York, Kolkata, Murmansk (June, December), Longyearbyen.
- M2: 0 occurrences of `DayPeriod.WORK`, `--color-day-work`, `DAY_PERIOD_SCHEDULE` and the four wall-time boundary constants in `packages/client/src`, `docs` and `openspec/specs`.
- M3: 0 network requests and 0 new runtime dependencies for the sun; initial JavaScript at most 150 KB gzipped.
- M4: 0 axe-core violations in the Time of day colouring in 2 views and 2 themes.
- M5: Mutation score ≥ 95% (minimum acceptable 90%) on the new and changed files of `src/model/` and `src/presenter/`.
- M6: At 55.8° N on 8 March the morning band is between 3% and 7% of a 24-hour track.

## Open Questions

None. Decided in the discussion: thresholds −6° and +6°; UTC in the neutral grey; the device time location by its zone; no geolocation.
