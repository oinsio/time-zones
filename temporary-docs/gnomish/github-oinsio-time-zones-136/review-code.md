# Review: bind-day-periods-to-sun

## Summary

| Item | Value |
|---|---|
| Tasks verified | 26/26 |
| Requirements traced | 59/62 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 Glossary: `grep -rniE "day-period schedule|work period|color-day-work" docs/glossary` prints nothing; `getSunElevation`, `NO_DAY_PERIOD`, `DAY_PERIOD_BLEND_MINUTES`, `getSolarDay`, `getDayPeriodBoundaries` are in `docs/glossary/time-selection.md`, `getSunCoordinates` in `docs/glossary/locations.md`, `getZoneCoordinates` in `docs/glossary/search.md` (each count ≥ 1).
- ✅ 1.2 Architecture docs: no 07:00/09:00/22:00 day-period boundary in `docs/architecture/domain-model.md` / `views.md`; no `day-period schedule|getDayPeriod\b` in `docs/architecture`, `docs/design`; `docs/architecture/open-questions.md:14` Q3 reads "Day periods and working hours", Closed, pointing to ADR-0016.
- ✅ 2.1 `packages/client/src/constants/sun.ts:6-7` `NIGHT_SUN_ELEVATION_DEGREES = -6`, `DAY_SUN_ELEVATION_DEGREES = 6` plus the named NOAA coefficients, exported from `src/constants/index.ts`.
- ✅ 2.2 `src/model/sun.ts:39` `getSunElevation` (calculation in `src/model/sunPosition.ts`); `src/model/sun.elevation.test.ts:7` `it.each` noon/midnight for Almaty, Quito, Sydney, `:27` equinox zenith within 1°.
- ✅ 2.3 `src/model/sun.ts:49` `getSolarDay` → `src/model/sunCalculation.ts:119`; `src/model/sun.solarDay.test.ts:159` far date 2090-12-21 05:10Z; stays-below/above for Longyearbyen in the same file; no `new Date`/`BigInt` in `sun*.ts`.
- ✅ 2.4 `src/model/sun.referenceCases.test.ts:162` `it.each` over 12 cases with the source comment at lines 2-4 (Longyearbyen's polar states are asserted in `sun.solarDay.test.ts`, a second New York crossing takes its row here).
- ✅ 2.5 `src/test/solarDayCounter.ts` (`countSunCalls`, `startSolarDayCount`, `MISSING_SUN_MOCK_MESSAGE`); `src/test/solarDayCounter.test.ts:21,32,39`; `src/test/solarDayCounter.unwrapped.test.ts:9`.
- ✅ 3.1 `src/model/dayPeriods.ts:17-22` `DayPeriod.DAY`, `:32` `getDayPeriodAt`; `src/constants/dayPeriods.ts` holds only `DAY_PERIOD_BLEND_MINUTES = 30`; `DAY_PERIOD_SCHEDULE`/`getDayPeriod` gone from `src`.
- ✅ 3.2 `src/model/dayPeriodBoundaries.ts:23` memoized per day and `getCoordinatesKey`; calculation `src/model/dayPeriodBoundaryCalculation.ts:26` + `dayPeriodTransitions.ts:18`; memo test `src/model/dayPeriodBoundaries.memo.test.ts:32,41,50,59`; 5-minute property test `src/model/dayPeriodBoundaries.test.ts:16,26`.
- ✅ 3.3 `src/model/dayPeriodWindows.ts:29` `collectBlendWindows` with midpoint clipping; `collectOffsetEdges`/`OffsetEdge` deleted; `findOffsetTransitions` moved to `src/model/clockChange.ts`; tests `dayPeriodWindows.test.ts:30,55`.
- ✅ 3.4 `src/model/dayPeriodStops.ts:40` (undefined without coordinates, one stop without boundaries, keyed on coordinates); `dayPeriodStops.test.ts:64,80,86,99` with the `vi.mock` line at `:5`.
- ✅ 4.1 `scripts/zoneData/zoneDataPlugin.ts:30` `virtual:zone-coordinates`, typed at `src/vite-env.d.ts:54`, tested by `src/test/zoneData/zoneCoordinatesModule.test.ts`; `node scripts/check-bundle-size.mjs` on the current `dist` prints "Initial JS: 149.8 KB gzipped (budget 150 KB)" (the coordinates ship in the lazy `sunSupport` chunk, design change handed off as H2 — see R1).
- ✅ 4.2 `src/model/sunCoordinates.ts:15,26`; `src/model/sunCoordinates.test.ts:15-62`; `src/test/features/browser_compatibility/steps/legacyZoneWorld.ts:44` uses `model.getZoneCoordinates(DEVICE_ZONE_ID)`.
- ✅ 5.1 `src/model/hourCells.ts:96` `getHourCells(..., coordinates)`, cache key `timeZoneId|coordinates`; largest share with earlier-wins tie in `src/model/hourCellPeriod.ts:9`; tests `hourCells.test.ts`, `hourCellPeriod.test.ts`, sharing test `hourCells.sharing.test.ts:30`.
- ✅ 6.1 `src/presenter/dayColours.ts:24,29` `DayColour.DAY`, `NO_DAY_PERIOD`; `:84` neutral stop without day periods; `dayColours.test.ts` updated.
- ✅ 6.2 `src/presenter/dayTrack.ts` `DayTrackContext.coordinates`; `src/presenter/presentZoneMoment.ts:162` and `src/controller/useHourGrid.ts:52` pass `getSunCoordinates`; `src/presenter/hourStrip.ts:135` strip key `timeZoneId|coordinates`; `src/presenter/hourStrip.test.ts:218,225` Moscow/Kazan and with/without coordinates.
- ✅ 6.3 `src/views/shared/dayTrackGradient.ts` maps `DAY`→`--color-day-daylight`, `NO_DAY_PERIOD`→`--color-day-non-working` / `text-foreground`; `src/styles/tokens.css:22,49,76`; `tailwind.config.ts:58`; the 6.3 grep over `src tailwind.config.ts` prints nothing.
- ✅ 7.1 `src/test/features/day_periods/day_periods_sun_unit.feature`, `day_periods_polar_unit.feature` (+ `day_periods_coordinates_unit.feature`, `day_periods_sun_reach_unit.feature`) with step files under `steps/`.
- ✅ 7.2 `src/test/features/day_periods/day_periods_budget_unit.feature` + `steps/day_periods_budget_unit.steps.ts` (solar days ≤ 10×3, formatters per zone, a minute later 0/0 and equal stops/cells); `src/test/benchmarks/dayPeriods.bench.ts`.
- ✅ 7.3 `time_selection_day_colours.feature`, `grid_view_hour_cells_unit.feature` rewritten; UTC scenarios in `day_colouring_day_tracks.feature:90,99,113` and `day_colouring_hour_cells.feature`; the M2 grep over `src` prints nothing.
- ✅ 8.1 `grid_view_hour_cells_e2e.feature` columns 3, 6, 9, 17 with daylight colour; `day_colouring_e2e.feature` "Readable digits on the grey" and axe rows for Time of day in Cards/Grid × light/dark.
- ✅ 8.2 Time of day rows added to the screenshot outline in `day_colouring_e2e.feature`; new `Screenshot-of-{Cards-at-375,Grid-at-1280}-px-in-the-Time-of-day-colouring-…png` (chromium and mobile-chrome) and re-approved Grid dark screenshots in the diff.
- ✅ 9.1 The M2 grep over `packages/client/src docs/glossary docs/architecture docs/design` prints nothing; bundle check passes on the current build (149.8 KB).
- ✅ 9.2 Every file the task names was measured by this review with scoped Stryker runs (see Mutation): `sun.ts` 100%, `dayPeriods.ts` 100%, `dayPeriodWindows.ts` 97.14%, `dayPeriodStops.ts` 100%, `hourCells.ts` 100%, `sunCoordinates.ts` 100%, `presenter/dayColours.ts` 100%, `presenter/hourStrip.ts` 100%, `views/shared/dayTrackGradient.ts` 100% — each ≥ 95%. No surviving coefficient mutant in these files, so the comment listing equivalent mutants is not needed.
- ✅ 9.3 For every id FR1–FR10, NFR-P1–P3, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1–UX5 the traceability grep lists at least one file (e.g. NFR-A2 → `src/presenter/presentZoneMoment.ts`, NFR-R1 → `day_colouring_e2e.feature`).
- ✅ 10.1 `temporary-docs/gnomish/github-oinsio-time-zones-136/handoff/H1-adr-day-periods-follow-the-sun.patch` passes `git apply --check`, adds ADR-0016 with status Accepted; README `## H1` present. (H2 also applies cleanly.)

## Requirements

- ✅ FR1 — `src/model/dayPeriods.ts:32` `getDayPeriodAt` (−6/+6, solar noon split); tests `dayPeriods.test.ts`, `day_periods_sun_unit.feature` "A day at a middle latitude".
- ✅ FR2 — `src/model/dayPeriodTransitions.ts:18` (noon as morning→evening, midnight via next day's initial period); `dayPeriodBoundaries.test.ts:71,84`; `day_periods_polar_unit.feature`.
- ✅ FR3 — `src/model/sunCalculation.ts:119`, `sunPosition.ts` take only coordinates and epoch ms; `dayPeriodBoundaries.test.ts:115` "should not move a boundary at a clock change"; scenario "A clock change does not move the sun".
- ✅ FR4 — `src/model/sun.referenceCases.test.ts` (3/10 min tolerances), `sun.solarDay.test.ts:159` (2090).
- ✅ FR5 — `src/model/dayPeriodWindows.ts:29`, `dayPeriodStops.ts:40`; `time_selection_day_colours.feature` stop scenarios.
- ✅ FR6 — `src/model/hourCellPeriod.ts:9`, `hourCells.ts:38`; `grid_view_hour_cells_unit.feature` "The larger part decides", "A tie takes the earlier period".
- ✅ FR7 — `src/model/sunCoordinates.ts:26`; `sunCoordinates.test.ts:32-54`; `day_periods_coordinates_unit.feature`.
- ✅ FR8 — `src/model/sunCoordinates.ts:15` (undefined for UTC/unknown), `src/presenter/dayColours.ts:84`, `dayTrackGradient.ts` grey mapping; `day_colouring_day_tracks.feature:90`, `day_colouring_hour_cells.feature`, `day_colouring_e2e.feature` grey contrast.
- ✅ FR9 — wall-time constants, `DAY_PERIOD_SCHEDULE`, `collectOffsetEdges`, `OffsetEdge`, `DayPeriod.WORK` absent from `src` (greps empty); `hasOffsetEdge` kept in `hourCells.ts`.
- ✅ FR10 — Plain/Working hours branches of `dayColours.ts` unchanged; "UTC in the other colourings" (`day_colouring_day_tracks.feature:99`) and the unchanged Plain/Working hours screenshot rows.
- ✅ NFR-P1 — memoization `dayPeriodBoundaries.ts:23`, `dayPeriodStops.ts:40`, `hourCells.ts:96`, `hourStrip.ts:135`; `day_periods_budget_unit.feature` "First presentation of 50 rows" (≤ 30 solar days, formatters per zone); bench `src/test/benchmarks/dayPeriods.bench.ts`.
- ⚠️ NFR-P2 — no new dependency, `fetch` never called (`day_periods_sun_reach_unit.feature` "Offline"), initial JS 149.8 KB; but the `sunSupport` chunk (6.6 KB gzipped) gates the first render yet is outside every budget — R1.
- ✅ NFR-P3 — `day_periods_budget_unit.feature` "A minute later": `solarDays()` 0 and `elevations()` 0 after a one-minute `fakeClock` advance.
- ✅ NFR-A1 — `src/styles/tokens.test.ts:129,141` digits 4.5:1 and handle 3:1 over `day-daylight`/`day-non-working`; `day_colouring_e2e.feature` "Readable digits on the grey" and axe rows for Time of day.
- ✅ NFR-A2 — accessible name/value code (`presentDayTrack` `valueText`) untouched; unchanged `time_selection_e2e.feature` slider scenarios; trace in `presentZoneMoment.ts`.
- ✅ NFR-R1 — Time of day screenshot rows in `day_colouring_e2e.feature` and the re-approved PNGs in `src/test/features/__screenshots__/`.
- ✅ NFR-R2 — no `BigInt`/`Date` in `src/model/sun*.ts`; plain-number math in `sunPosition.ts`/`sunCalculation.ts`.
- ✅ UX1 — `time_selection_day_colours.feature` "Morning and evening are visible bands"; `dayPeriodStops.test.ts:57`.
- ✅ UX2 — `hourStrip.test.ts:218` Moscow morning / Kazan day at 04:00; `day_periods_sun_unit.feature` "Two cities of one zone differ".
- ✅ UX3 — `time_selection_day_colours.feature` "A polar track is one colour"; `dayPeriodStops.test.ts:72`.
- ✅ UX4 — UTC one neutral stop (`day_colouring_day_tracks.feature:90`), no message rendered; grey contrast e2e.
- ✅ UX5 — token values unchanged except the rename (`tokens.css:22,49,76` keep the old `--color-day-work` values); `grid_view_hour_cells_e2e.feature` theme colours.
- ✅ M1 — `sun.referenceCases.test.ts` 12 `it.each` cases plus Longyearbyen stays-below/above in `sun.solarDay.test.ts`.
- ✅ M2 — the M2 grep over `packages/client/src`, `docs` (outside ADRs) prints nothing; `openspec/specs/grid-view/spec.md:62` still names "work" but is synced at archive.
- ⚠️ M3 — 0 new dependencies and 0 `fetch` calls; the 150 KB figure excludes the render-blocking sun chunk — R1.
- ✅ M4 — `day_colouring_e2e.feature` "No violations in the <view> view, the <colouring> colouring and the <theme> theme" with the four Time of day rows.
- ⚠️ M5 — every new/changed production file of `src/model/` and `src/presenter/` was measured (see Mutation). `sunSupport.ts` and `index.ts` only re-export and have no mutants. Of the other 19 files, 18 are ≥ 95%, and `src/model/dayPeriodBoundaryCalculation.ts` is 93.94%. That is above the 90% minimum but below the 95% target, because two mutants of the half-window margin survive — R2.
- ✅ M6 — `time_selection_day_colours.feature` "Morning and evening are visible bands" (Moscow, 8 March, 3–7%).
- ✅ Scenario: A day at a middle latitude — `day_periods_sun_unit.feature:6` + steps.
- ✅ Scenario: Boundaries of the day — `day_periods_sun_unit.feature:20` (six rows).
- ✅ Scenario: Two cities of one zone differ — `day_periods_sun_unit.feature:35`.
- ✅ Scenario: The polar cases — `day_periods_polar_unit.feature:6`.
- ✅ Scenario: A night that barely gets dark — `day_periods_polar_unit.feature:19`.
- ✅ Scenario: A clock change does not move the sun — `day_periods_sun_unit.feature:41`.
- ✅ Scenario: Offline — `day_periods_sun_reach_unit.feature:6` (stubbed `fetch` never called).
- ✅ Scenario: A far date — `day_periods_sun_reach_unit.feature:12`.
- ✅ Scenario: A city with its own coordinates — `day_periods_coordinates_unit.feature:6`.
- ✅ Scenario: A city stored before coordinates — `day_periods_coordinates_unit.feature:12`.
- ✅ Scenario: The device time location — `day_periods_coordinates_unit.feature:18`.
- ✅ Scenario: No coordinates — `day_periods_coordinates_unit.feature:25` (outline).
- ✅ Scenario: Day periods of Almaty — `grid_view_hour_cells_unit.feature`.
- ✅ Scenario: The larger part decides — `grid_view_hour_cells_unit.feature`.
- ✅ Scenario: A tie takes the earlier period — `grid_view_hour_cells_unit.feature`.
- ✅ Scenario: Theme colours of the cells — `grid_view_hour_cells_e2e.feature` outline, columns 3, 6, 9, 17.
- ✅ Scenario: Colour stops of Almaty and New York — `time_selection_day_colours.feature`.
- ✅ Scenario: Colours follow the day period outside blend windows — `time_selection_day_colours.feature`.
- ✅ Scenario: Morning and evening are visible bands — `time_selection_day_colours.feature`.
- ✅ Scenario: A blend window stops at the midpoint — `time_selection_day_colours.feature`; `dayPeriodWindows.test.ts:55`.
- ✅ Scenario: A clock change makes no colour edge — `time_selection_day_colours.feature`.
- ✅ Scenario: A polar day is one colour — `time_selection_day_colours.feature` outline "A polar track is one colour".
- ✅ Scenario: A polar night is one colour — same outline, December row.
- ✅ Scenario: Colours come from the theme tokens — `time_selection_layout_e2e.feature:75` reads `--color-day-daylight` (`time_selection_labels_e2e.steps.ts:22`).
- ✅ Scenario: UTC in the Time of day colouring — `day_colouring_day_tracks.feature:90` (track) and `day_colouring_hour_cells.feature` "UTC hour cells in the Time of day colouring".
- ✅ Scenario: UTC in the other colourings — `day_colouring_day_tracks.feature:99`.
- ✅ Scenario: A location gains coordinates — `day_colouring_day_tracks.feature:113` (track recoloured without reload); the cells follow through `useHourGrid.ts:52` on each snapshot and the coordinate-keyed strip cache tested at `hourStrip.test.ts:225`.
- ✅ Scenario: Readable digits on the grey — `day_colouring_e2e.feature` "Readable digits on the grey in the <theme> theme".
- ✅ Scenario: First presentation of 50 rows — `day_periods_budget_unit.feature:6`.
- ✅ Scenario: A minute later — `day_periods_budget_unit.feature:13`.
- ✅ Scenario: Bundle budget — `node scripts/check-bundle-size.mjs`: "Initial JS: 149.8 KB gzipped (budget 150 KB)" (with the caveat of R1).
- ✅ Scenario: Time of day by default — `day_colouring_day_tracks.feature:6`.
- ✅ Scenario: Changing the colouring keeps the moment — `day_colouring_day_tracks.feature:15`.
- ✅ Scenario: Screenshots of the colourings — `day_colouring_e2e.feature` outline with the four Time of day rows and new PNGs.

## Mutation

All runs were made from `packages/client`, one at a time in the foreground, each with at most five files and `--mutate` only. The three "earlier round" rows come from the previous round of this review, which used plain `npx stryker run --mutate '<files>'`. Runs A–E are this round's: `npx stryker run --mutate '<files>' --ignoreStatic --concurrency 4 --reporters json,clear-text`. `--ignoreStatic` (a standard Stryker option) let each run finish within the 10-minute foreground limit. The previous round's runs without it had timed out. No report from A–E listed any mutant as `Ignored`, so every mutant below was run against the tests. After each run I read `reports/mutation/mutation-report.json`. Runs A–E each exited 0, in 3–9 minutes.

| Run | File | Score | Notes |
|---|---|---|---|
| earlier round | `src/model/dayPeriodWindows.ts` | 97.14% (33 killed, 1 survived) | survivor `:53:45` `start <= day.end` → `<`: a window that starts exactly at the day end; no visible effect, not a finding |
| earlier round | `src/model/dayPeriodStops.ts` | 100% (29/29) | |
| earlier round | `src/model/dayPeriodTransitions.ts` | 100% (36/36) | |
| A | `src/model/dayPeriods.ts` | 100% (13/13) | |
| A | `src/model/sunCoordinates.ts` | 100% (11/11) | |
| A | `src/views/shared/dayTrackGradient.ts` | 100% (36/36) | |
| B | `src/model/sun.ts` | 100% (2/2) | |
| B | `src/model/hourCells.ts` | 100% (65/65) | |
| B | `src/model/hourCellPeriod.ts` | 100% (31/31) | |
| C | `src/presenter/dayColours.ts` | 100% (33/33) | |
| C | `src/presenter/hourStrip.ts` | 100% (54/54) | |
| D | `src/model/sunCalculation.ts` | 98.68% (72 killed, 3 timeout, 1 survived) | survivor `:41:26`: the module-level arrow function `getHourAngleSpan` replaced by `() => undefined`. That would turn every crossing into `NaN`, and the reference cases (`sun.referenceCases.test.ts`, FR4) assert every crossing to within minutes, so the requirement is tested. Above target; not a finding |
| D | `src/model/sunPosition.ts` | 100% (68 killed, 3 timeout) | |
| D | `src/model/dayPeriodBoundaries.ts` | 100% (9/9) | |
| D | `src/model/dayPeriodBoundaryCalculation.ts` | **93.94%** (31 killed, 2 survived) | survivors `:24:3` `… / 2` → `… * 2` and `:24:4` `DAY_PERIOD_BLEND_MINUTES * MILLISECONDS_PER_MINUTE` → `/`. Both change `HALF_WINDOW_MILLISECONDS`, and no test notices — R2 |
| D | `src/model/clockChange.ts` | 96.74% (89 killed, 3 survived) | survivors `:141:9`, `:141:9`, `:142:9` are in the equal-distance tie-break of the nearest clock change, last changed in `fced3ce`, which is before the task started (`git merge-base --is-ancestor fced3ce 4047ae2`). Out of scope |
| E | `src/model/coordinates.ts` | 100% (29/29) | |
| E | `src/model/sunRegistry.ts` | 100% (8/8) | |
| E | `src/presenter/dayTrack.ts` | 100% (24/24) | |
| E | `src/presenter/presentZoneMoment.ts` | 100% (33/33) | |
| E | `src/model/sunSupport.ts` | — | re-exports only, no mutants |

`src/model/index.ts` (re-exports only) was not mutated. Every file is above the 90% minimum. One file (`dayPeriodBoundaryCalculation.ts`) is below the 95% target — R2.

## Findings

### R1 — WARNING — The render-blocking sun chunk has no size budget
- Location: `packages/client/src/app/mountApp.tsx:22`
- Rule: NFR-P2 / M3 of `bind-day-periods-to-sun` (initial JavaScript at most 150 KB gzipped); `packages/client/scripts/check-bundle-size.mjs` ("lazily imported chunks are not counted")
- Problem: `mountApp` awaits `loadSunSupport()` (`src/model/sunRegistry.ts:48`, `await import("./sunSupport")`) before the first `root.render`, so the `sunSupport` chunk (NOAA calculation plus the 418 zone coordinates) is code the first paint must download and evaluate. `check-bundle-size.mjs` counts only the entry script and its modulepreload links, so this chunk is in no budget: on the current build the counted initial JS is 149.8 KB and `dist/assets/sunSupport-*.js` is 6.6 KB gzipped, i.e. 156.4 KB stand between a cold start and the first paint. The chunk is also requested only after `main` has been evaluated (no preload), one more round trip before the first paint on a first visit. The decision to use a lazy chunk itself is handed off as H2 and is not contested here.
- Impact: the 150 KB check passes while what the first paint waits for exceeds it, and any growth of the sun chunk (more zone coordinates, more calculation) delays every first paint without failing a check — exactly the regression NFR-P2's budget is meant to catch.
- Fix: give the chunk its own budget, as the zone rules asset already has one: add `SUN_SUPPORT_CHUNK_BUDGET_KB` (e.g. 8) to `packages/client/app.config.ts` beside `ZONE_RULES_ASSET_BUDGET_KB`, and in `check-bundle-size.mjs` find the `sunSupport-*.js` asset in `dist/assets`, fail when it is missing or its gzipped size exceeds the budget, and print its size on its own line ("Sun support: X KB gzipped (budget 8 KB)").
- Fix risk: low — a build-script check only; it relies on Vite naming the chunk after `sunSupport.ts`, so renaming that file breaks the check (intended, the message names the file). It does not change the initial-JS figure, and it does not settle whether H2's lazy chunk is acceptable, which stays with the H2 reviewer.
- Status: fixed
- Resolution: added SUN_SUPPORT_CHUNK_BUDGET_KB = 8 to app.config.ts and a sunSupport-*.js check in check-bundle-size.mjs (missing or over budget fails, prints "Sun support: 6.4 KB gzipped (budget 8 KB)"); verified by pnpm check:bundle-size on the fresh build.

### R2 — WARNING — No test pins the half-window margin of the day-period boundaries
- Location: `packages/client/src/model/dayPeriodBoundaryCalculation.ts:23-24`
- Rule: `.claude/rules/tdd-workflow.md` ("Target mutation score: >=95%. Minimum acceptable: >=90%"); M5 of `bind-day-periods-to-sun`; `design.md` D2 ("lists the boundaries inside the reference day, widened by half a blend window (`DAY_PERIOD_BLEND_MINUTES` / 2) at each end")
- Problem: `HALF_WINDOW_MILLISECONDS = (DAY_PERIOD_BLEND_MINUTES * MILLISECONDS_PER_MINUTE) / 2` sets how far `computeDayPeriodBoundaries` (lines 31-32, 38) reaches past the reference day. Two Stryker mutants survive: `/ 2` → `* 2` (a 60-minute margin) and `*` → `/` (a margin of about 0 ms). The file scores 93.94%, under the 95% target of M5, and none of `dayPeriodBoundaries.test.ts`, `dayPeriodBoundaries.memo.test.ts`, the day-period features or the stop tests notices either change.
- Impact: a regression that shrinks the margin goes unnoticed. For example, a boundary at 00:10 of the next local day, whose 30-minute blend window starts at 23:55 of the reference day (for example evening→night after midnight in a high-latitude summer), would drop out of the list. The day track would then end on a hard colour edge instead of the start of the blend that D2 and FR5 call for. Widening the margin likewise goes unchecked.
- Fix: add `packages/client/src/model/dayPeriodBoundaryCalculation.test.ts` (a plain Vitest unit test beside the module, like `dayPeriodWindows.test.ts`). It calls `computeDayPeriodBoundaries` with a stub `SolarDayReader` that returns one solar day whose `night`/`day` thresholds place a crossing at a chosen instant relative to `day.end` (and to `day.start`). Use `it.each` to assert that a crossing `DAY_PERIOD_BLEND_MINUTES / 2 − 1` minutes after `day.end` (and before `day.start`) is listed, and one at `DAY_PERIOD_BLEND_MINUTES / 2 + 1` minutes is not. Then re-run `npx stryker run --mutate 'src/model/dayPeriodBoundaryCalculation.ts'` and confirm both mutants are killed.
- Fix risk: low — a test only, no production change. The stub must satisfy `getSolarDayPeriods` (`dayPeriodTransitions.ts:18`), which reads `solarNoon`, both solar midnights and the two thresholds, and the loop at lines 48-54 must end: the stub's `solarMidnightAfter` has to exceed the window end, or the stub must advance on each call.
- Status: fixed
- Resolution: added dayPeriodBoundaryCalculation.test.ts (it.each, crossings half a blend window minus/plus one minute beyond day end and start); moved the margin into getHalfWindowMilliseconds() so the mutants are not static; Stryker on the file now scores 100% (31 killed, 0 survived).

### R3 — SUGGESTION — A test label still names the day period "work"
- Location: `packages/client/src/styles/tokens.test.ts:114`
- Rule: `.claude/rules/glossary.md` ("Words listed under *Never:* must not appear for that concept in code, comments, specs…"); the glossary *Day period* lists *Never:* work
- Problem: this branch changed the row to `["work", "day-daylight", "hour-cell-foreground"]`, so the test titles read "should give the digits on work at least 4.5:1" and "keep the handle at least 3:1 against work" for the daylight colour of the `DAY` period.
- Impact: the test output keeps the removed concept alive and the M2 intent ("no work period") is contradicted in the one file that checks NFR-A1's contrast for the day period.
- Fix: rename the label to `"day"` (`["day", "day-daylight", "hour-cell-foreground"]`).
- Fix risk: none — only test titles change; the tokens checked stay the same.
- Status: fixed
- Resolution: renamed the label to "day" in tokens.test.ts DAY_COLOUR_TOKENS; the tokens checked are unchanged and the file passes in pnpm test.

## Verdict

Ready. No CRITICAL finding, and every task and requirement has evidence. The mutation scores that task 9.2 and M5 ask for are now measured (Mutation): every file is at or above the 90% minimum, and all the files 9.2 names are at or above 95%. R1 and R2 (WARNING) and R3 (SUGGESTION) are worth fixing but block nothing. R2 lifts the one file that sits between the minimum and the target.
