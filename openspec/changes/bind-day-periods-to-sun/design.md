# Design

## Context

See `proposal.md` for the motivation. Driven by FR1–FR10 and NFR-P1–NFR-P3 of the proposal. This change builds on `add-city-coordinates-to-locations`, which has landed (`Coordinates`, `Location.coordinates`, `zone-rules/zone-coordinates.json`).

Current state, read from the code:

- `src/model/dayPeriods.ts`: `DayPeriod.NIGHT | MORNING | WORK | EVENING`, `DAY_PERIOD_SCHEDULE` of four wall-time boundaries (`src/constants/dayPeriods.ts`), `getDayPeriod(wallTime, schedule)`.
- `src/model/dayPeriodWindows.ts`: `collectBlendWindows` walks local dates × schedule and turns wall times into instants; `collectOffsetEdges` adds hard edges at clock changes. `src/model/dayPeriodStops.ts`: `getDayPeriodStops(timeZoneId, day)`, memoized per reference day **by zone ID**.
- `src/model/hourCells.ts`: `HourCell.dayPeriod = getDayPeriod(localStart, DAY_PERIOD_SCHEDULE)`, cells memoized by zone ID.
- `src/presenter/dayColours.ts` is the one place that turns a day colouring into colours: `presentDayColourStops(timeZoneId, day, dayColouring, workingHours)` and `presentHourCellColour(cell, isWorkingCell, dayColouring)`; `DayColour.WORK` mirrors `DayPeriod.WORK` by string value; `views/shared/dayTrackGradient.ts` maps colours to tokens (`--color-day-work`).
- Callers pass only a zone ID: `presentDayTrack` (from `presentZoneMoment.ts`) and `presentHourStrip` (from `useHourGrid.ts`).
- The Working hours colouring has its own model (`workingTime.ts`, `workingTimeSpans.ts`) and is not touched.
- `src/model/timeZoneId.ts` and `src/model/zoneAbbreviation.ts` already read build-time data through virtual modules (`virtual:time-zone-aliases`, `virtual:zone-abbreviations`) served by `scripts/zoneData/zoneDataPlugin.ts`; `vitest.config.ts` loads the same plugin, so tests read the real data.
- `presentZoneMoment(subject, context)` takes `subject: { id, timeZoneId, cityLabel }`; `presentLocationRows` passes `{ ...location, cityLabel }`, so the location's `kind` and `coordinates` are at hand. The device time location carries the device time zone as its `timeZoneId` in state (ADR-0010).

## Goals / Non-Goals

**Goals:**

- The sun has one owner in the model; the day periods have one definition used by both the track and the cells.
- No wall-time day-period boundary survives.
- The presenter and views change only where they name the period or pass the location.

**Non-Goals:**

- A general astronomy module (azimuth, moon, sunrise text).
- Any change to the working-time model.

## Decisions

### D1. One pure sun module, NOAA equations, epoch milliseconds (FR1–FR4, NFR-P2, NFR-R2)

`src/model/sun.ts` owns:

- `getSunElevation(coordinates, epochMilliseconds): number` — degrees;
- `getSolarDay(coordinates, epochMilliseconds): SolarDay` — for the solar day around an instant: `solarNoon`, `solarMidnightBefore`, `solarMidnightAfter`, and the rising and setting crossing instants of each threshold, each `undefined` when the sun does not cross it, plus whether it stays above or below.

The equations are the NOAA solar calculator's (Meeus-based): Julian century from epoch milliseconds, mean longitude and anomaly, equation of centre, obliquity, declination, equation of time; solar noon = 720 − 4·longitude − equation of time minutes UTC; hour angle of an elevation h: cos H = (sin h − sin φ · sin δ) / (cos φ · cos δ), |cos H| > 1 meaning no crossing. Each crossing is refined once with the declination at the crossing instant. Plain `number` arithmetic on milliseconds: no `Date`, no BigInt, and Temporal only at the edge (`Temporal.Instant.fromEpochMilliseconds`). The coefficients are named constants in `src/constants/sun.ts`, with the thresholds `NIGHT_SUN_ELEVATION_DEGREES = -6` and `DAY_SUN_ELEVATION_DEGREES = 6`.

Alternatives rejected:

- `suncalc` or another library: `Date`-based, a new runtime dependency, and about as much code as the equations.
- A lookup table per city: data to ship and refresh for something that is a formula.
- Sunrise and sunset (−0.833°) as boundaries: morning and evening would be the 30–40 minutes of twilight, about 2% of a track (UX1).

### D2. The day period is a function of elevation and half-day (FR1, FR2, NFR-P1)

`getDayPeriodAt(coordinates, epochMilliseconds): DayPeriod` in `src/model/dayPeriods.ts`: night below −6°, day at +6° or more, otherwise morning when the instant lies between solar midnight and solar noon, evening otherwise. This is the definition; the polar cases need no branch.

`getDayPeriodBoundaries(coordinates, day): DayPeriodBoundary[]` lists the boundaries inside the reference day, widened by half a blend window (`DAY_PERIOD_BLEND_MINUTES` / 2) at each end, from the solar days that overlap it: the four crossings where they exist; solar noon as morning→evening when the sun does not reach +6°; solar midnight as evening→morning when it does not go below −6°. A property test ties the two together: between two neighbouring boundaries `getDayPeriodAt` is constant and equals the earlier boundary's `to`.

`getDayPeriodBoundaries` is memoized per reference day in a map keyed by the coordinates (`"latitude,longitude"`), reset when the reference day changes, as `getDayPeriodStops` is today. `getDayPeriodStops` and `getHourCells` both read their boundaries from it and never call `getSolarDay` themselves, so a location's track and cells share one computation: the widened day overlaps at most 3 solar days, which is the bound of NFR-P1.

`DayPeriodBoundary` becomes `{ instant, from, to }`; `wallTime` and `blendMinutes` go away with `DAY_PERIOD_SCHEDULE` and `getDayPeriod(wallTime, schedule)`.

### D3. Blend windows keep their owner and lose the clock (FR5, FR9)

`collectBlendWindows(boundaries, day)` centres a window of `DAY_PERIOD_BLEND_MINUTES = 30` on each boundary and clips each side at the midpoint to the neighbouring boundary. `assembleDayPeriodStops` stays. `collectOffsetEdges` and the type `OffsetEdge` are deleted: boundaries are instants, so a clock change cannot move them. `findOffsetTransitions` stays where `hourCells.ts` and the clock change note use it; if nothing else imports it from `dayPeriodWindows.ts`, it moves to `clockChange.ts`.

When the reference day holds no boundary, `getDayPeriodStops` returns one stop with `getDayPeriodAt` of the day start.

### D4. Coordinates for the sun are resolved once, in the model (FR7, FR8)

`getSunCoordinates(location): Coordinates | undefined` in `src/model/sunCoordinates.ts`: `location.coordinates` for a city location that has them, else `getZoneCoordinates(location.timeZoneId)`; for the device time location always the latter.

The model never reads the device time zone itself: the device time location already holds it as `timeZoneId` (`architecture.md`: "it arrives as state via `SET_DEVICE_TIME_ZONE`"). `presentZoneMoment`'s `subject` type widens to carry `kind` and `coordinates`.

`getZoneCoordinates` reads a new virtual module `virtual:zone-coordinates`, built by the zone data plugin from `zone-rules/zone-coordinates.json` (418 zones as integer tenths of a degree, `COORDINATE_TENTHS_PER_DEGREE`; the file is about 5 KB gzipped, less once served as a module — to be measured against the 150 KB initial budget). It is eager, so the device time card and lists stored before coordinates are coloured on the first paint with no wait for the lazy search data.

Alternative rejected: reading zone coordinates from the lazy search data — the device time card would be grey on every start until 140 KB load.

### D5. Callers pass the location's coordinates; caches key on them (FR5, FR6, NFR-P1)

- `getDayPeriodStops(coordinates | undefined, day)` returns `undefined` without coordinates. Its per-day cache keys on `"latitude,longitude"`. It and `getHourCells` take their boundaries from the memoized `getDayPeriodBoundaries` (D2), so the track and the cells of one coordinates compute the sun once per reference day.
- `getHourCells(timeZoneId, day, referenceZoneId, coordinates | undefined)`: `HourCell.dayPeriod` becomes `DayPeriod | undefined`, decided by the largest share of the cell among the periods the boundaries cut it into (ties: earlier). The cache key gains the coordinates.
- `presentDayColourStops` and `presentHourStrip` take the coordinates beside the zone ID; `presentZoneMoment` and `useHourGrid` pass `getSunCoordinates(location)`.
- `presentHourStrip(timeZoneId, context)`: the context object gains a required `coordinates: Coordinates | undefined` key, so typecheck finds every caller; `presentDayTrack`'s `DayTrackContext` gains the same key.
- The work-bound scenarios count sun computations with a new test helper, `src/test/solarDayCounter.ts`, in the style of `src/test/zoneLookupCounter.ts`. `WorkCount` in `src/test/workCounters.ts` counts only `Intl` constructors and Temporal methods, and the sun module uses neither, so the helper cannot spy on a platform API. It wraps the module instead: a test file declares `vi.mock("@/model/sun", async (importOriginal) => (await import("@/test/solarDayCounter")).countSunCalls(await importOriginal()))`. `countSunCalls` returns the module with `getSolarDay` and `getSunElevation` wrapped to add to module-level counts. `startSolarDayCount()` returns `{ solarDays(), elevations(), stop() }` and counts the calls made from other modules between start and stop. It throws when the calling test file has not wrapped the module, so "nothing was computed for the sun" can never pass because a mock is missing. This needs no counting hook in production code. It works because `dayPeriods.ts` and `hourCells.ts` call the sun only through the exports of `sun.ts`. A `*.bench.ts` reports the timings (ADR-0008).

### D6. No day periods → one neutral colour, decided in the presenter (FR8)

`DayColour` gains `NO_DAY_PERIOD`. `presentDayColourStops` returns one `NO_DAY_PERIOD` stop when the model returns `undefined`; `presentHourCellColour` returns it for a cell without a period. `dayTrackGradient.ts` maps it to the existing token `--color-day-non-working` and to the text class of `NON_WORKING_TIME`. A separate member keeps the working-time concept out of the Time of day branch while reusing the colour the product asked for.

### D7. Renames (FR9)

`DayPeriod.WORK` → `DayPeriod.DAY`; `DayColour.WORK` → `DayColour.DAY` (the string values must stay equal, `periodColour` relies on it); token `--color-day-work` → `--color-day-daylight` in the three theme blocks of `src/styles/tokens.css` (`:root`, `:root[data-theme="dark"]`, the `prefers-color-scheme: dark` block), and the Tailwind colour `day.work` → `day.daylight` in `tailwind.config.ts`; `src/constants/dayPeriods.ts` loses the four wall-time constants and the two blend constants and gains `DAY_PERIOD_BLEND_MINUTES`. Russian and English interface texts do not name the periods, so no locale key changes. Nothing stored names a day period.

## Risks / Trade-offs

- [The default look changes for every user] → intended; announced by the normal update notice; screenshots re-approved once.
- [Zone coordinates are approximate for the device time location and old lists; a user in Kazan sees Moscow's sun on the device card] → accepted (NG3); a city location is exact.
- [Atmosphere, altitude and terrain shift the real sun by minutes] → within the stated accuracy; boundaries blend over 30 minutes.
- [Near the polar circles a threshold is crossed or not depending on fractions of a degree] → the rule has no special case, so the worst outcome is a boundary a few minutes off or a short band appearing a day early.
- [The eager zone coordinates push the initial JavaScript over 150 KB] → measured in the first task of the group; fallback: ship them as a preloaded JSON beside the zone rules.
- [Hour cells are hourly; a 50-minute morning near the equator fits one cell] → the largest-share rule keeps it visible.

## Migration Plan

1. `add-city-coordinates-to-locations` has landed, so lists gain coordinates; a location stored before it uses its zone coordinates (D4).
2. One pull request: model, presenter, renames, specs, glossary and re-approved screenshots together; the glossary never names a concept the code lacks. The ADR (ADR-0016) and its `CLAUDE.md` line come as the handoff patch H1, applied on the branch before merging; recording a long-lived decision is a global ADR, not settled here.
3. Rollback: revert the pull request; no stored data depends on it.

## Open Questions

None.
