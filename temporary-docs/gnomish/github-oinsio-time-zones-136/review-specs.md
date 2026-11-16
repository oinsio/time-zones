# Specs review: bind-day-periods-to-sun

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 38/38 |
| Contradictions | 1 |
| CRITICAL | 1 |
| WARNING | 2 |
| SUGGESTION | 1 |

## Freshness

- ✅ `add-city-coordinates-to-locations` has landed: `Coordinates` and `parseCoordinates` in `packages/client/src/model/coordinates.ts:7`, `zone-rules/zone-coordinates.json` exists under `packages/client/` with 418 zones as integer tenths (`"Europe/Moscow":[558,376]`), about 5 KB gzipped (5066 bytes), and `COORDINATE_TENTHS_PER_DEGREE = 10` is in `src/constants/coordinates.ts:9` (design D4).
- ✅ Nothing in `src/` or `scripts/` reads `zone-coordinates.json` yet (grep for `zone-coordinates`), so `virtual:zone-coordinates` (task 4.1) is new. `zoneDataPlugin.ts:22-25` already serves `virtual:time-zone-aliases` and `virtual:zone-abbreviations`. `vitest.config.ts:6,12` loads `zoneDataPlugin()` (design Context, task 4.1).
- ✅ `src/model/dayPeriods.ts` has `DayPeriod.NIGHT | MORNING | WORK | EVENING`, `DayPeriodBoundary { wallTime, from, to, blendMinutes }`, `DAY_PERIOD_SCHEDULE` and `getDayPeriod(wallTime, schedule)`. `src/constants/dayPeriods.ts` has the four `*_START_WALL_TIME` constants and the two `*_BOUNDARY_BLEND_MINUTES` constants (design Context, D2, D7).
- ✅ `src/model/dayPeriodWindows.ts` has `collectBlendWindows`, `collectOffsetEdges`, `OffsetEdge` and `findOffsetTransitions`. `findOffsetTransitions` is used outside it by `hourCells.ts:12` and `clockChange.ts` (design D3).
- ✅ `getDayPeriodStops(timeZoneId, day, schedule)` is memoized per reference day in a map keyed by zone ID (`dayPeriodStops.ts:53-78`). `assembleDayPeriodStops(windows, edges, day)` exists (design Context, D3, D5).
- ✅ `hourCells.ts:60` sets `dayPeriod: getDayPeriod(localStart.toPlainTime(), DAY_PERIOD_SCHEDULE)`, and `getHourCells` caches by zone ID (`hourCells.ts:35,87-90`) (design Context, D5).
- ✅ `presenter/dayColours.ts` has `DayColour.WORK`, `WORKING_TIME`, `NON_WORKING_TIME`, `presentDayColourStops(timeZoneId, day, dayColouring, workingHours)` (line 63) and `presentHourCellColour` (line 94) (design Context, D6, D7).
- ✅ `presentZoneMoment(subject: { id; timeZoneId; cityLabel }, …)` (`presentZoneMoment.ts:90`) is called as `presentZoneMoment({ ...location, cityLabel }, context)` (`presentLocationRows.ts:67`). `useHourGrid.ts:49` calls `presentHourStrip(location.timeZoneId, {…})` for every location of the state (design Context, D4, D5).
- ✅ `src/test/zoneLookupCounter.ts` and `src/test/workCounters.ts` exist. ADR-0008 says `WorkCount` counts `Intl` constructors and Temporal methods, so the sun needs its own counter (design D5, task 2.5).
- ✅ Tokens `--color-day-work` and `--color-day-non-working` are in the three theme blocks of `src/styles/tokens.css` (lines 22/24, 49/51, 76/78). `tailwind.config.ts:58` has `work: "var(--color-day-work)"` (design D7, task 6.3).
- ✅ The line references in the tasks hold: `themeTokens.ts:18` and `:77` (`dayWork`, `"day-work"`), `grid_view_hour_cells_e2e.steps.ts:48` (`colours.dayWork`), `dayColouringChecks.ts:15` (`work: DayColour.WORK`), `grid_view_hour_cells_unit.steps.tsx:67` (`["9-17", DayColour.WORK]`), `dayColours.test.ts:53` (`DayColour.WORK`) and `legacyZoneWorld.ts:43` (`model.getDayPeriodStops(DEVICE_ZONE_ID, day)`) (tasks 4.2, 6.1, 6.3, 7.3).
- ✅ Every file that tasks 6.2, 6.3, 7.3, 8.1 and 8.2 name exists. The full grep of today's callers of `getDayPeriodStops(`, `getHourCells(`, `presentHourStrip(`, `presentDayColourStops(` and `presentDayTrack(` finds no caller outside the files these tasks list. The grep for the removed names (`DayPeriod.WORK`, `DAY_PERIOD_SCHEDULE`, `getDayPeriod`, `day-work`, `dayWork`, `collectOffsetEdges`, `OffsetEdge`) finds only listed files and `docs/glossary/time-selection.md`, `docs/architecture/domain-model.md` and `docs/architecture/open-questions.md`, which tasks 1.1 and 1.2 rewrite. The `hasOffsetEdge` matches stay, as task 6.3 says.
- ✅ Every screenshot feature that shows the main list in the default colouring is in task 8.2. The settings screenshots (`settings_e2e.feature:97`, `settings_language_e2e.feature:122`) show the settings page with no track (`__screenshots__/chromium/Approved-screenshots-of-the-settings-at-1024-px-in-the-light-theme.png`), so task 8.2's claim that they match unchanged holds.
- ✅ The `package.json` scripts `check:bundle-size`, `typecheck`, `lint` and `bench` exist (tasks 4.1, 9.1).
- ✅ The REMOVED requirement `time-selection` "Day-period colours" exists as restated (`openspec/specs/time-selection/spec.md:295`). The MODIFIED requirements `grid-view` "Hour cell colour" (`grid-view/spec.md:61`) and `day-colouring` "Day colouring" (`:8`) and "Approved screenshots of the colourings" (`:184`) exist. The stable "Day colouring" names the removed requirement "Day-period colours" (`day-colouring/spec.md:9`), and the delta re-points it to "Day-period colours by the sun".
- ✅ Nothing is already implemented: no `sun.ts`, `sunCoordinates.ts` or `getDayPeriodAt` exists, and no archived change binds day periods to the sun.
- ✅ The glossary entries that the change rewrites exist as described: Day period, Day-period schedule, Blend window, Offset edge, Colour stop and Day colour (line 35) in `docs/glossary/time-selection.md:14-18,35`; Zone coordinates in `search.md:17`; Coordinates in `locations.md:7`; Q3 "Day-period schedule and working hours" in `docs/architecture/open-questions.md:14`.
- ✅ I recomputed the spec's reference times with the NOAA hour-angle formula, and they hold within 1–2 minutes. Examples: Moscow on 21 December (08:10/10:16/14:38/16:44), Murmansk in December (10:22, 12:45, 15:08) and June (00:49, 03:12, 22:26), Saint Petersburg's night (00:09–01:51), Kazan versus Moscow (04:02 versus 04:48), Almaty, Kolkata, Sydney and New York. The Almaty hour columns of the grid-view scenario (6 morning, 7–16 day, 17 evening) follow from them.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ day-periods "Day periods follow the sun" | ✅ 2.2–2.4, 3.1, 7.1 |
| FR2 | ✅ | ✅ day-periods "Polar days and nights" | ✅ 3.1, 3.2, 7.1 |
| FR3 | ✅ | ✅ day-periods "The sun is computed on the device" | ✅ 2.3, 7.1 |
| FR4 | ✅ | ✅ day-periods "The sun is computed on the device" (far-date scenario untestable, see R3) | ✅ 2.3, 2.4 |
| FR5 | ✅ | ✅ time-selection "Day-period colours by the sun" | ✅ 3.3, 3.4, 6.1, 7.3 |
| FR6 | ✅ | ✅ grid-view "Hour cell colour" | ✅ 5.1, 7.3, 8.1 |
| FR7 | ✅ | ✅ day-periods "Coordinates of a location for the sun" | ✅ 4.2, 6.2, 7.1 (strip cache gap, see R1) |
| FR8 | ✅ | ✅ day-colouring "Locations without day periods" | ✅ 4.2, 6.1, 6.3, 7.3, 8.1 |
| FR9 | ✅ | ✅ time-selection REMOVED + ADDED | ✅ 3.1, 3.3, 6.3, 7.3, 9.1 |
| FR10 | ✅ | ✅ day-colouring "Day colouring", "Approved screenshots of the colourings" | ✅ 8.2 |
| NFR-P1 | ✅ | ✅ day-colouring "Day periods are fast" | ✅ 2.5, 3.4, 7.2 (bound unreachable as designed, see R2) |
| NFR-P2 | ✅ | ✅ "Day periods are fast", "The sun is computed on the device" | ✅ 4.1, 9.1 |
| NFR-P3 | ✅ | ✅ "Day periods are fast" | ✅ 7.2 |
| NFR-A1 | ✅ | ✅ "Locations without day periods" scenario "Readable digits on the grey" | ✅ 6.3, 8.1 |
| NFR-A2 | ✅ | ✅ the stable time-selection "Accessible day tracks" stays unchanged, so no delta is needed | ✅ 8.1 |
| NFR-R1 | ✅ | ✅ day-colouring "Approved screenshots of the colourings" | ✅ 8.2 |
| NFR-R2 | ✅ | ✅ day-periods "The sun is computed on the device" (no BigInt) | ✅ 2.3 |
| UX1 | ✅ | ✅ time-selection "Morning and evening are visible bands" | ✅ 7.3 |
| UX2 | ✅ | ✅ day-periods "Two cities of one zone differ" | ✅ 7.1 |
| UX3 | ✅ | ✅ time-selection "A polar day/night is one colour" | ✅ 7.1, 7.3 |
| UX4 | ✅ | ✅ day-colouring "Locations without day periods" | ✅ 8.1 |
| UX5 | ✅ | ✅ time-selection "Colours come from the theme tokens" | ✅ 6.3 |
| M1 | ✅ | n/a | ✅ 2.4 |
| M2 | ✅ | n/a | ✅ 7.3, 9.1 |
| M3 | ✅ | n/a | ✅ 9.1 |
| M4 | ✅ | n/a | ✅ 8.1 |
| M5 | ✅ | n/a | ✅ 9.2 |
| M6 | ✅ | n/a — appears as the scenario "Morning and evening are visible bands" | ✅ 7.3 |
| G1 | ✅ | n/a — met by FR1, FR7 | n/a — met by FR1, FR7 |
| G2 | ✅ | n/a — met by FR4, M1 | n/a — met by FR4, M1 |
| G3 | ✅ | n/a — met by NFR-P2, M3 | n/a — met by NFR-P2, M3 |
| G4 | ✅ | n/a — met by FR9, M2 | n/a — met by FR9, M2 |
| NG1 | ✅ | n/a | n/a — no artifact changes Plain, Working hours or settings |
| NG2 | ✅ | n/a | n/a — no sunrise text or mark is built |
| NG3 | ✅ | n/a | n/a — the device time location uses its zone's coordinates (D4) |
| NG4 | ✅ | n/a | n/a — no altitude or weather correction |
| NG5 | ✅ | n/a | n/a — only the rename; `NO_DAY_PERIOD` reuses `--color-day-non-working` (D6) |
| NG6 | ✅ | n/a | n/a — the thresholds are constants (D1) |

## Consistency

- `proposal.md` FR7 and UX2 and the day-periods spec "Two cities of one zone differ" require Kazan's colours to differ from Moscow's within `Europe/Moscow`. But design D5 (`design.md:72-77`) and task 6.2 (`tasks.md:37`) re-key only the model caches. The presenter strip cache keyed by zone ID (`packages/client/src/presenter/hourStrip.ts:56,130,147`) is left as it is, so in the Grid view both rows get one strip (R1).

## Findings

### R1 — CRITICAL — The hour strip cache stays keyed by zone, so two cities of one zone share their cells
- Location: `openspec/changes/bind-day-periods-to-sun/design.md:72-77` (D5); `openspec/changes/bind-day-periods-to-sun/tasks.md:37` (task 6.2); the code at `packages/client/src/presenter/hourStrip.ts:56,130,147`
- Rule: —
- Problem: `presentHourStrip` memoizes the whole presented strip in `cachedStripsByZone`, a map keyed by `timeZoneId`. Its invalidation key (`hourStrip.ts:117-125`) lists the day, the reference zone, the language, the hour format, the day colouring and the working hours, but no coordinates. D5 says the caches key on the coordinates, but it re-keys only `getDayPeriodStops` and `getHourCells`. Task 6.2 adds a required `coordinates` key to the strip context but does not change this cache. The tests the tasks plan do not catch the problem. The grid unit scenarios use one location per zone, and the budget scenario "A minute later" compares each row with itself.
- Impact: if the change is implemented as written, the first location presented in a zone fixes the hour cells for every other location of that zone in the Grid view. Kazan's row shows Moscow's sun. A city location with coordinates and the device time location in the same zone also share their cells. So does a location with coordinates and one without, which should be grey. This breaks FR7 and UX2 in Grid (U4), while the Cards view is right, and no planned test fails.
- Fix: in design D5, add a bullet: "`presentHourStrip` keys its strip cache on the zone ID and the coordinates (`timeZoneId` plus `latitude,longitude`, or a fixed marker for `undefined`)". In task 6.2, add to the `hourStrip.ts` item: "re-key `cachedStripsByZone` on the zone ID and the coordinates. Test in `src/presenter/hourStrip.test.ts`: Moscow at 55.8, 37.6 and Kazan at 55.8, 49.1, both in `Europe/Moscow`, presented in one call sequence on 2026-06-21 in the Time of day colouring, get different cells at the column of 04:00 local time, and a second presentation returns the same strip objects."
- Fix risk: low. The stable `grid-view` "Hour strips are fast" bounds formatters and transition lookups per zone. Those are cached in `dateTimeFormatters.ts` and `clockChange.ts`, so more strip entries per zone build no extra formatter. The new cache branch must be killed by mutation (ADR-0008), and task 9.2 should then add `src/presenter/hourStrip.ts` to its second Stryker run, which leaves that run at 4 files, within the 5-file limit.
- Status: fixed
- Resolution: design.md D5 gains a bullet: `presentHourStrip` keys `cachedStripsByZone` on the zone ID plus `"latitude,longitude"` (a fixed marker for `undefined`); the day track's zone-keyed cache holds only hour labels and its stops come from the model keyed by coordinates, so it stays. tasks.md 6.2 re-keys the cache and adds a `src/presenter/hourStrip.test.ts` case (Moscow vs Kazan in `Europe/Moscow` on 2026-06-21, reference zone Moscow, differ at the 04:00 cell; with vs without coordinates differ; repeat returns the same object); task 9.2 adds `src/presenter/hourStrip.ts` to the second Stryker run (4 files).

### R2 — WARNING — The 3-solar-days-per-coordinates bound cannot hold with two separate boundary computations
- Location: `openspec/changes/bind-day-periods-to-sun/design.md:72-78` (D5); `openspec/changes/bind-day-periods-to-sun/specs/day-colouring/spec.md:36-41` (the scenario "First presentation of 50 rows"); `openspec/changes/bind-day-periods-to-sun/tasks.md:21,43` (tasks 3.2, 7.2)
- Rule: `docs/adr/0008-performance-budgets-as-work-bounds.md`
- Problem: NFR-P1 and the scenario require at most 3 solar days per distinct coordinates when presenting both the day tracks and the hour strips (≤ 30 for 10 coordinates). In D5, `getDayPeriodStops` and `getHourCells` each derive their periods from `getDayPeriodBoundaries`, and each has its own cache. D2 builds the boundaries "from the solar days that overlap" the span. A 24-hour reference day almost always contains one solar midnight, so it overlaps 2 solar days, and 3 when the blend windows reach past its ends. Nothing in the design shares the boundaries or the solar days between the two callers.
- Impact: if the design is implemented as written, a first presentation computes 4–6 solar days per coordinates, 40–60 for the scenario's 10 coordinates. The blocking budget scenario of task 7.2 then fails, and the implementer has to invent a shared cache that no design decision or test describes.
- Fix: in design D2/D5, add: "`getDayPeriodBoundaries` is memoized per reference day and coordinates key (`latitude,longitude`), and both `getDayPeriodStops` and `getHourCells` read their boundaries from it". In task 3.2, add a test that declares the `vi.mock` line of task 2.5: a second call of `getDayPeriodBoundaries` for the same coordinates and day gives `solarDays()` 0.
- Fix risk: one more module-level cache, whose cache-hit mutants must be killed (ADR-0008), in `dayPeriods.ts`, which is already in the first Stryker run of task 9.2. The memo must reset when the reference day changes, as `getDayPeriodStops` does today, so NFR-P3 and the minute-tick scenario keep holding.
- Status: fixed
- Resolution: design.md D2 now makes `getDayPeriodBoundaries(coordinates, day)` cover the reference day widened by half a blend window, memoized per reference day keyed by `"latitude,longitude"`, and the only reader of `getSolarDay` for `getDayPeriodStops` and `getHourCells` (D5 bullet says so; hour cells lie inside the reference day, checked in `hourCells.ts`). tasks.md 3.2 adds a memo test with `startSolarDayCount()` (first call ≤ 3 solar days, repeat 0, other coordinates and next day recompute) and 5.1 a sharing test (`getHourCells` after `getDayPeriodStops` for the same coordinates gives `solarDays()` 0).

### R3 — WARNING — The far-date scenario names no expected time, so FR4's 2000–2100 range is untested
- Location: `openspec/changes/bind-day-periods-to-sun/specs/day-periods/spec.md:77-80`; `openspec/changes/bind-day-periods-to-sun/tasks.md:14` (task 2.3, "the far date 2090-12-21")
- Rule: `.claude/rules/test-planning.md` (every FR has an automated test that covers it)
- Problem: "A far date" expects night to end "within 3 minutes of the published civil dawn of that date" but gives no time. Every other accuracy scenario states its times. Task 2.3 tests the far date, but the artifacts give no reference value to compare with, and no source is named.
- Impact: the implementer must either invent a reference value or compare the code's output with itself. In either case FR4's "for dates from 2000 to 2100" has no independent check, and a drift in the Julian century terms of D1 would pass.
- Fix: rewrite the THEN as "night ends at `2090-12-21T05:10:00Z` (08:10 in `Europe/Moscow`), within 3 minutes". The instant comes from the same NOAA hour-angle calculation that reproduces the 2026 row "Moscow 2026-12-21 … dawn 08:10" of "Boundaries of the day", because the sun's position on 21 December changes by well under a minute between those years. In task 2.3, name that instant as the expected value.
- Fix risk: low. The value is stated in UTC, so it does not depend on Moscow's future zone rules. If an independent ephemeris differs from it by more than a minute, the implementer has to cite that source instead.
- Status: fixed
- Resolution: the "A far date" scenario in specs/day-periods/spec.md now expects night to end at `2090-12-21T05:10:00Z` (08:10 in `Europe/Moscow`) within 3 minutes; I recomputed it with the NOAA equations (05:10–05:11Z, the same as the 2026 row). tasks.md 2.3 names that instant as the expected value.

### R4 — SUGGESTION — The spec uses "position", a Never word for coordinates
- Location: `openspec/changes/bind-day-periods-to-sun/specs/day-periods/spec.md:83,99`
- Rule: `.claude/rules/glossary.md` ("Words listed under *Never:* must not appear for that concept"); `docs/glossary/locations.md:7` (Coordinates, *Never:* position, geolocation)
- Problem: the requirement "Coordinates of a location for the sun" says the device time location "MUST NOT ask for the device's position", and its scenario says "the device's position was not requested". The concept is the device's coordinates, and the glossary forbids "position" for it.
- Impact: when the spec is synced to `openspec/specs/`, the Never word goes with it, and the Gherkin steps that task 7.1 copies from the scenario carry it into the test code. The glossary review check (`grep` for the Never words) then flags it.
- Fix: replace "the device's position" with "the device's coordinates" in both lines ("MUST NOT request the device's coordinates"; "the device's coordinates were not requested").
- Fix risk: none. Proposal NG3 names the browser API ("geolocation"), which is a different, external term and can stay.
- Status: fixed
- Resolution: specs/day-periods/spec.md "Coordinates of a location for the sun" now says "MUST NOT request the device's coordinates" and its scenario "the device's coordinates were not requested"; the other "position" uses in the change mean a place on the track, not coordinates.

## Verdict

Needs revision. Blocking: R1 (CRITICAL). R2 and R3 should be fixed in the same revision. R4 is optional polish.
