# Tasks

Prerequisite: `add-city-coordinates-to-locations` is implemented (`Coordinates`, `Location.coordinates`, `zone-rules/zone-coordinates.json` exist). Paths are relative to `packages/client/` unless they start with `docs/` or `openspec/`. Run tests strictly one command at a time and never in the background (`CLAUDE.md`). Every new or touched production file gets a JSDoc line `Implements <ids> of bind-day-periods-to-sun (D<n>).`, every touched test file a `// Verifies <ids> of bind-day-periods-to-sun.` comment, and every new or changed Gherkin scenario the tags `@bind-day-periods-to-sun @<id>`. Use the glossary terms: day period, sun elevation, day-period boundary, blend window, colour stop, coordinates, zone coordinates. Keep every file under 200 lines. Each implementation task is RED (failing test shown) then GREEN. Mock time with `fakeClock`.

## 1. Glossary and architecture docs (FR1, FR8, FR9; design D2, D6, D7)

- [ ] 1.1 `docs/glossary/time-selection.md`: rewrite **Day period** (night, morning, day, evening by the sun's elevation; *RU:* ночь, утро, день, вечер; *Code:* `DayPeriod.NIGHT | MORNING | DAY | EVENING`, `getDayPeriodAt`, token `--color-day-daylight`; *Never:* work, working hours, business hours for this period), **Blend window** (30 minutes, clipped at the midpoint), **Offset edge** (the hour-strip line only), **Colour stop**; add **Sun elevation** (*Code:* `getSunElevation`, `src/model/sun.ts`) and **Day-period boundary** (*Code:* `DayPeriodBoundary`, `getDayPeriodBoundaries`); remove **Day-period schedule**. `docs/glossary/settings.md`: update **Working hours** and **Day colouring**. Verify: `grep -rniE "day-period schedule|work period" docs/glossary` prints nothing.
- [ ] 1.2 `docs/architecture/domain-model.md` ("Day periods" section and the selector table), `docs/architecture/views.md` (colour table, the track sketch, "Day-period colors" row), `docs/design/README.md` (colours line), `docs/architecture/open-questions.md` (close Q3). Verify: `grep -rnE "07:00|09:00|22:00" docs/architecture/domain-model.md docs/architecture/views.md` shows no day-period boundary.

## 2. The sun (FR1–FR4, NFR-P2, NFR-R2; design D1)

- [ ] 2.1 `src/constants/sun.ts`: the named NOAA coefficients and `NIGHT_SUN_ELEVATION_DEGREES`, `DAY_SUN_ELEVATION_DEGREES`; export from `src/constants/index.ts`. Verify: `pnpm run build`.
- [ ] 2.2 `src/model/sun.ts` with `src/model/sun.elevation.test.ts`: `getSunElevation` — positive at local noon and negative at local midnight for Almaty, Quito and Sydney; the equinox noon elevation at the equator within 1° of 90°; `it.each`. Verify: `npx vitest run src/model/sun.elevation.test.ts`.
- [ ] 2.3 `getSolarDay` with `src/model/sun.solarDay.test.ts`: solar noon and the −6° and +6° crossings for the six rows of the "Boundaries of the day" scenario within 3 minutes; "stays below" for Longyearbyen in December, "stays above" for Longyearbyen in June; the far date 2090-12-21. No `Date`, no BigInt (assert by `grep -nE "new Date|BigInt|[0-9]n\b" src/model/sun.ts` printing nothing). Verify: `npx vitest run src/model/sun.solarDay.test.ts`.
- [ ] 2.4 Cross-check the twelve reference cases of M1 against an independently published civil twilight source (the NOAA solar calculator or the USNO tables) and record the source and the values in a comment block of `src/model/sun.solarDay.test.ts`. Verify: the test file names the source for every row.

## 3. Day periods (FR1, FR2, FR5, FR9; design D2, D3)

- [ ] 3.1 `src/model/dayPeriods.ts`: `DayPeriod.DAY` replaces `WORK`; `getDayPeriodAt(coordinates, epochMilliseconds)`; delete `DAY_PERIOD_SCHEDULE`, `getDayPeriod(wallTime, schedule)` and the wall-time constants of `src/constants/dayPeriods.ts`; add `DAY_PERIOD_BLEND_MINUTES`. Tests: the Almaty table of "A day at a middle latitude" and the four polar rows. Verify: `npx vitest run src/model/dayPeriods.test.ts`.
- [ ] 3.2 `getDayPeriodBoundaries(coordinates, span)`: the four crossings, solar noon as morning→evening, solar midnight as evening→morning. Property test: between neighbouring boundaries `getDayPeriodAt` is constant and equals the earlier boundary's `to`, for the twelve reference cases at 5-minute steps. Verify: `npx vitest run src/model/dayPeriodBoundaries.test.ts`.
- [ ] 3.3 `src/model/dayPeriodWindows.ts`: `collectBlendWindows(boundaries, day)` with midpoint clipping; delete `collectOffsetEdges` and `OffsetEdge`; keep or move `findOffsetTransitions` for its other users. Tests: 30-minute windows, two boundaries 20 minutes apart meet at the midpoint. Verify: `npx vitest run src/model/dayPeriodWindows.test.ts`.
- [ ] 3.4 `src/model/dayPeriodStops.ts`: `getDayPeriodStops(coordinates | undefined, day)`; one stop for a day without boundaries; `undefined` without coordinates; the cache keys on coordinates; solar days counted through `src/test/workCounters.ts`. Verify: `npx vitest run src/model/dayPeriodStops.test.ts`.

## 4. Coordinates for the sun (FR7, FR8, NFR-P2; design D4)

- [ ] 4.1 `virtual:zone-coordinates` in `scripts/zoneData/zoneDataPlugin.ts` from `zone-rules/zone-coordinates.json`, typed in `src/vite-env.d.ts` and stubbed for Vitest as `virtual:time-zone-aliases` is. Verify: `pnpm run build`, then `node scripts/check-bundle-size.mjs` shows the initial JavaScript at most 150 KB; if not, apply the fallback of design D4's risk before continuing.
- [ ] 4.2 `src/model/sunCoordinates.ts` with a test: `getZoneCoordinates`, `getSunCoordinates` for a city location with coordinates, a city location without, the device time location, UTC. Verify: `npx vitest run src/model/sunCoordinates.test.ts`.

## 5. Hour cells (FR6, NFR-P1; design D5)

- [ ] 5.1 `src/model/hourCells.ts`: `getHourCells(timeZoneId, day, referenceZoneId, coordinates | undefined)`; `HourCell.dayPeriod` by the largest share, ties to the earlier, `undefined` without coordinates; cache key with coordinates. Tests: the Almaty columns, "The larger part decides", "A tie takes the earlier period". Verify: `npx vitest run src/model/hourCells.test.ts`.

## 6. Presenter and views (FR5, FR6, FR8, FR9, FR10; design D5, D6, D7)

- [ ] 6.1 `src/presenter/dayColours.ts`: `DayColour.DAY`, `DayColour.NO_DAY_PERIOD`; `presentDayColourStops` and `presentHourCellColour` take the coordinates and return the neutral colour without day periods. Verify: `npx vitest run src/presenter/dayColours.test.ts`.
- [ ] 6.2 `src/presenter/dayTrack.ts`, `presentZoneMoment.ts`, `hourStrip.ts`, `src/controller/useHourGrid.ts`: pass `getSunCoordinates(location)`. Verify: their tests, one file per run.
- [ ] 6.3 `src/views/shared/dayTrackGradient.ts`, `src/styles/tokens.css`, `tailwind.config.ts`, `src/views/grid/HourCellView.tsx`, fixtures (`dayTrackFixture.tsx`, `hourStripFixture.tsx`): token `--color-day-daylight`, `NO_DAY_PERIOD` mapped to `--color-day-non-working` with its text class. Verify: `npx vitest run src/views/shared/dayTrackGradient.test.ts`, then `grep -rnE "DayPeriod\.WORK|DayColour\.WORK|color-day-work|DAY_PERIOD_SCHEDULE|WORK_START_WALL_TIME" src` prints nothing (M2).

## 7. Unit BDD (FR1–FR8, NFR-P1, NFR-P3)

- [ ] 7.1 New `src/test/features/day_periods/day_periods_sun_unit.feature` and `day_periods_polar_unit.feature` with steps: the scenarios of the `day-periods` spec. Verify: one steps file per run.
- [ ] 7.2 `day_periods_budget_unit.feature`: the scenarios of "Day periods are fast"; add `src/test/benchmarks/dayPeriods.bench.ts`. Verify: its steps file.
- [ ] 7.3 Rewrite `time_selection/time_selection_day_colours.feature` and `grid_view/grid_view_hour_cells_unit.feature` to the modified requirements; add the "Locations without day periods" scenarios to `day_colouring/day_colouring_day_tracks.feature` and `day_colouring_hour_cells.feature`. Verify: one steps file per run.

## 8. E2E, accessibility and screenshots (NFR-A1, NFR-A2, NFR-R1, UX1–UX5)

- [ ] 8.1 Update `grid_view_hour_cells_e2e.feature` (theme colours of columns 3, 6, 9, 17) and `day_colouring_e2e.feature` (UTC in the neutral grey, axe-core in the Time of day colouring in both views and themes). Verify: each e2e feature on its own.
- [ ] 8.2 Re-approve the Time of day screenshots of Cards at 375 px and Grid at 1280 px in both themes on Linux (the Docker recipe of the project); confirm that the Plain and the Working hours screenshots match unchanged. Verify: the screenshot scenarios of "Approved screenshots of the colourings".

## 9. Integration checks (all ids)

- [ ] 9.1 `pnpm run build` passes; `get_file_problems` is clean for the changed files; `grep -rniE "DayPeriod\.WORK|color-day-work|day-period schedule" packages/client/src docs openspec/specs` prints nothing after the specs are synced.
- [ ] 9.2 Mutation testing, at most five files per run, each run finished before the next: `src/model/sun.ts`, `dayPeriods.ts`, `dayPeriodWindows.ts`, `dayPeriodStops.ts`, `hourCells.ts`; then `src/model/sunCoordinates.ts`, `src/presenter/dayColours.ts`. Target ≥ 95%, minimum 90% (M5). Equivalent mutants of coefficient constants are listed with a reason.
- [ ] 9.3 Traceability: every FR, NFR and UX id of the proposal appears in at least one code or test file (`grep -rn "bind-day-periods-to-sun" packages/client/src | wc -l`).

## 10. Handoff patch (FR1, FR3)

- [ ] 10.1 A new ADR with the next free number, "Day periods follow the sun": elevation thresholds −6° and +6°, the NOAA equations on the device, no library and no network; alternatives (clock schedule, sunrise and sunset, a library, a lookup table); related: ADR-0003, ADR-0008. Add it to the ADR list in `CLAUDE.md`. Deliver as a handoff patch when the implementing stage may not write `docs/adr/` or `CLAUDE.md` (the convention of `add-geonames-city-source`, group 10); otherwise edit directly. Verify: `git apply --check` on the patch, or the file exists in the format of `.claude/rules/adr.md`.

## Human follow-up

- H1 (FR1, FR3): apply the ADR patch when it was delivered as a patch.
  Why manual: the factory may not write `docs/adr/` or `CLAUDE.md`.
- H2 (NFR-R1): look at the re-approved Time of day screenshots once before merging; this is the one visual decision of the change.
