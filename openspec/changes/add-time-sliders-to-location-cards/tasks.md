# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`.

- **Running tests:** one command at a time, never in the background. Mutation runs take at most 5 files per run; the report is in `reports/mutation/mutation-report.json`.
- **Time in tests:** only `fakeClock(instant, timeZone)` of `@/lib/temporal` or `createSwitchableClock` (`test/switchableClock.ts`). Never `vi.setSystemTime()` or `vi.useFakeTimers()`. Ticks come only from `createManualTickScheduler()` (`test/tickSchedulers.ts`), and writes are observed with `createManualWriteScheduler()` (`test/writeSchedulers.ts`).
- **Traceability:** every new test, step file and feature carries `add-time-sliders-to-location-cards`:
  - `@add-time-sliders-to-location-cards @FR-X` tags above scenarios;
  - `// @add-time-sliders-to-location-cards @FR-X` before `f.Scenario`;
  - `// Verifies NFR-X of add-time-sliders-to-location-cards` in E2E steps;
  - `Implements FR-X of add-time-sliders-to-location-cards` in the JSDoc of new or changed production code.
- **File size:** every file stays under 200 lines.
- **Design references:** "design Dn" refers to `design.md`.

## 1. Constants and locale keys (no TDD: constants and translations)

- [x] 1.1 Add the constants of design D2 and D3:
  - new `constants/timeSelection.ts`: `TRACK_STEP_MINUTES = 15`, `TRACK_HOUR_MOVE_MINUTES = 60`, `HOUR_LABEL_INTERVAL_HOURS = 6`, `TRACK_TOUCH_SLOP_PX = 10` (design D7);
  - new `constants/dayPeriods.ts`: the four `*_START_WALL_TIME` strings, `NIGHT_BOUNDARY_BLEND_MINUTES = 60` and `WORK_BOUNDARY_BLEND_MINUTES = 15`;
  - `HOUR_LABEL_FORMAT_OPTIONS = { hour: "2-digit", hourCycle: "h23" }` in `constants/localDateTime.ts`.

  Re-export them all from `constants/index.ts` (FR3, FR4, FR6, FR7). Verify with `pnpm --filter @time-zones/client typecheck`.
- [x] 1.2 Add `locations.timeSliderLabel` ("Time in {{city}}" / "Время — {{city}}") and `locations.timeSliderValue` ("{{time}}, {{date}}" in both) to `locales/en.json` and `locales/ru.json` (design D5, FR9). Verify with `npx vitest run src/locales/locales.test.ts` (identical key sets). This task comes before sections 3–5, because their tests translate with the real locale resources loaded by `test/setup.ts`.

## 2. Model (TDD)

- [x] 2.1 TDD `SELECT_INSTANT { instant: string }` and `LocationErrorCode.INVALID_INSTANT` (design D1). Add them to `model/locations.ts` and implement them in new `model/reduceSelectInstant.ts`, delegated from `reduceLocations`. Tests in new `model/reduceSelectInstant.test.ts`, header `// Verifies FR3, FR5, FR8 of add-time-sliders-to-location-cards (D1).`:
  - from `LIVE`, `2026-03-08T13:00:00Z` → `PINNED` with that instant, `UNIQUE`, and `requestedWallTime` `18:00` for device `Asia/Almaty`;
  - the same instant again → the same state object (`toBe`);
  - from a `GAP` pin (device `America/New_York`, pinned `2026-03-08T07:30:00Z` by `SHIFT_DATE`), `2026-03-08T07:45:00Z` → `UNIQUE` (M4);
  - `2026-03-08T07:30:00` (no `Z`) and `not-an-instant` → `{ ok: false, error: INVALID_INSTANT }`;
  - the command equals `JSON.parse(JSON.stringify(command))`;
  - after `SELECT_INSTANT 2026-03-08T13:00:00Z`, `SHIFT_DATE +1` pins `2026-03-09T13:00:00Z`;
  - `REPLACE_LOCATIONS` keeps the pinned moment (FR8).

  Verify red, then green, with `npx vitest run src/model/reduceSelectInstant.test.ts`.
- [x] 2.2 TDD new `model/dayTrack.ts` (design D2): `ReferenceDay`, `getReferenceDay`, `getTrackFraction`, `getTrackValueMinutes`, `getLastTrackStepMinutes`, `getInstantAtTrackFraction`, `TrackMove`, `getInstantAfterTrackMove`. Tests in new `model/dayTrack.test.ts` with `it.each`, header `// Verifies FR1, FR2, FR3, FR4 of add-time-sliders-to-location-cards (D2).`:
  - `Asia/Almaty` at `2026-03-08T07:30:00Z` → day `2026-03-07T19:00:00Z`–`2026-03-08T19:00:00Z`, 1440 min, fraction `0.520833` (±1e-6), value 750, last step 1425;
  - fractions `0.75` / `0.52` / `1.0` / `0` → `13:00Z` / `07:30Z` / `18:45Z` / `2026-03-07T19:00:00Z` (M2);
  - the 8 moves of M3, including both moves from live `07:37:00Z`, and `NEXT_STEP` from `18:45Z` staying at `18:45Z`;
  - `America/New_York` on `2026-03-08` → 1380 min, last step 1365, fraction `0.5` → `16:30:00Z`; `2026-11-01` → 1500 min, last step 1485; `2026-06-01` → 1440 (M4);
  - `UTC` at `12:01:00Z` → fraction `0.500694`.

  Export everything from `model/index.ts`. Verify red, then green, with `npx vitest run src/model/dayTrack.test.ts`.
- [x] 2.3 TDD new `model/dayPeriods.ts` (design D3): `DayPeriod`, `DayPeriodBoundary`, `DAY_PERIOD_SCHEDULE`, `getDayPeriod`. Tests in `model/dayPeriods.test.ts` with `it.each`, header `// Verifies FR6 of add-time-sliders-to-location-cards (D3).`: `06:59` night, `07:00` morning, `08:59` morning, `09:00` work, `17:59` work, `18:00` evening, `21:59` evening, `22:00` night, `00:00` night. A custom one-boundary schedule passed as the parameter changes the result, which proves the schedule is not read internally. Export from `model/index.ts`. Verify red, then green, with `npx vitest run src/model/dayPeriods.test.ts`.
- [x] 2.4 TDD new `model/dayPeriodStops.ts` (design D4): `collectBlendWindows`, `collectOffsetEdges`, `assembleDayPeriodStops`, `getDayPeriodStops`. First write the `collectOffsetEdges` test that calls `ZonedDateTime.prototype.getTimeZoneTransition("next")`, and run `pnpm --filter @time-zones/client typecheck`. If the polyfill does not declare it, implement the sampling fallback of design "Risks". Tests in `model/dayPeriodStops.test.ts`, header `// Verifies FR6, NFR-P2 of add-time-sliders-to-location-cards (D4).`:
  - the Almaty and New York stops of M5 for the M2 day (±1e-6);
  - at every quarter-hour position of that day outside the blend windows, the period of the last stop at or before the position (or of the first stop before it) equals `getDayPeriod` of the local time;
  - `Pacific/Apia` on the `UTC` day `2011-12-30` gives exactly the 8 stops of the spec scenario "Boundaries of a skipped local date are left out";
  - `assembleDayPeriodStops` with a synthetic edge at `0.5` from `EVENING` to `NIGHT` yields two stops at `0.5`, evening then night, with nothing between them (proposal Q4);
  - `collectOffsetEdges` for New York on the M2 day is empty (night on both sides of `07:00Z`);
  - two calls for the same zone and day return the same array (`toBe`); a call for another day returns a new one.

  Export from `model/index.ts`. Verify red, then green, with `npx vitest run src/model/dayPeriodStops.test.ts`, then `npx vitest run src/model`.
- [x] 2.5 Mutation run (M8). Verify that `npx stryker run --mutate 'src/model/reduceSelectInstant.ts,src/model/dayTrack.ts,src/model/dayPeriods.ts,src/model/dayPeriodStops.ts,src/model/locations.ts'` scores ≥ 95% (minimum 90%).

## 3. Presenter (TDD)

- [x] 3.1 TDD new `presenter/dayTrack.ts`, `presentDayTrack` and `formatHourLabel` (design D5). Tests in `presenter/dayTrack.test.ts` with `it.each`, header `// Verifies FR2, FR7, FR9, NFR-A3 of add-time-sliders-to-location-cards (D5).`:
  - the hour labels of M6 for Almaty, Moscow, Kolkata and New York, with fractions `0`, `0.25`, `0.5`, `0.75`, `1`;
  - `Asia/Kathmandu` on the M2 day starts with `00:45`;
  - English value text `12:30, Sun, Mar 8`, Russian `12:30, вс, 8 мар.`;
  - `fraction`, `valueMinutes` 750 and `maxMinutes` 1425;
  - `stops` is the array from `getDayPeriodStops` (`toBe`).

  Verify red, then green, with `npx vitest run src/presenter/dayTrack.test.ts`.
- [x] 3.2 TDD the `dayTrack` field in `presenter/presentLocationRows.ts`, with `referenceDay` added to `LocationRowsContext`. Extend `presenter/presentLocationRows.test.ts` with the header line `// Verifies FR1 of add-time-sliders-to-location-cards (D5).`:
  - a known zone has `dayTrack` with the M2 fraction;
  - `Mars/Olympus_Mons` has `dayTrack` `undefined` while the Moscow row has one.

  Add `referenceDay` to every existing call of `presentLocationRows` in tests. Export `PresentedDayTrack` from `presenter/index.ts`. Verify with `npx vitest run src/presenter`, then `pnpm --filter @time-zones/client typecheck`.
- [x] 3.3 Mutation run (M8). Verify that `npx stryker run --mutate 'src/presenter/dayTrack.ts,src/presenter/presentLocationRows.ts'` scores ≥ 95% (minimum 90%).

## 4. Controller (TDD)

- [x] 4.1 TDD the reference day in `controller/useLocations.ts` (design D6). Use new `controller/useLocations.dayTrack.test.tsx`, built with the same `LocationsProvider` wrapper as `controller/useLocations.reference.test.tsx`, header `// Verifies FR1, FR2 of add-time-sliders-to-location-cards (D6).`:
  - with `fakeClock("2026-03-08T07:30:00Z", "Asia/Almaty")`, every row's `dayTrack.fraction` is `0.520833`;
  - with a switchable clock at `UTC 2026-07-15T12:00:42.500Z`, a tick at `12:01:00Z` gives `0.500694`;
  - pinned at `18:00Z`, a tick leaves `0.75`;
  - live at `2026-03-08T18:59:30Z` in `Asia/Almaty`, a tick at `19:00:00Z` moves the day start to `2026-03-08T19:00:00Z`.

  Verify red, then green, with `npx vitest run src/controller/useLocations.dayTrack.test.tsx`.
- [x] 4.2 TDD new `controller/useTimeSelection.ts` (design D6) in `controller/useTimeSelection.test.tsx`, with `renderHook(() => ({ locations: useLocations(), reference: useReferenceMoment(), time: useTimeSelection() }), { wrapper })`, header `// Verifies FR3, FR4, FR5, FR8 of add-time-sliders-to-location-cards (D6).`:
  - `selectTrackFraction(0.75)` gives the New York row `09:00` / `UTC−4` and `reference.dateBar.isPinned` true;
  - `moveTrack(TrackMove.HOUR_FORWARD)` twice and then `NEXT_STEP` give Almaty `14:45`;
  - from the NY gap state, `moveTrack(NEXT_STEP)` clears `dateBar.gapNote` (M4);
  - after `returnToNow` the fraction is the live one again;
  - 20 selections and a `returnToNow` leave `createManualWriteScheduler().lastDelayMs()` `undefined` (M7).

  Export `useTimeSelection` and re-export `TrackMove` from `controller/index.ts`. Verify red, then green, with `npx vitest run src/controller/useTimeSelection.test.tsx`, then `pnpm --filter @time-zones/client lint`.
- [x] 4.3 Mutation run (M8). Verify that `npx stryker run --mutate 'src/controller/useLocations.ts,src/controller/useTimeSelection.ts'` scores ≥ 95% (minimum 90%).

## 5. Views (TDD)

- [ ] 5.1 TDD new `views/shared/dayTrackGradient.ts` and its `DAY_PERIOD_COLOR_VARIABLES` (design D7) in `views/shared/dayTrackGradient.test.ts`, header `// Verifies FR6 of add-time-sliders-to-location-cards (D7).`:
  - the Almaty stops of M5 become `linear-gradient(to right, var(--color-day-night) 27.0833%, var(--color-day-morning) 31.25%, …)`;
  - the 4 periods map to `--color-day-night`, `--color-day-morning`, `--color-day-working` and `--color-day-evening`;
  - a stop at `-0.02` becomes `-2%`.

  Verify red, then green, with `npx vitest run src/views/shared/dayTrackGradient.test.ts`.
- [ ] 5.2 TDD new `views/shared/dayTrackKeys.ts` in `views/shared/dayTrackKeys.test.ts` with `it.each` (header `// Verifies FR4 of add-time-sliders-to-location-cards (D7).`). The table is: `ArrowRight` / `ArrowUp` → `NEXT_STEP`, `ArrowLeft` / `ArrowDown` → `PREVIOUS_STEP`, `PageUp` → `HOUR_FORWARD`, `PageDown` → `HOUR_BACK`, `Home` → `DAY_START`, `End` → `DAY_END`, and `Tab` / `Enter` → `undefined`. The test covers the mapping only; 7.1 proves key handling in the browser. Verify red, then green, with `npx vitest run src/views/shared/dayTrackKeys.test.ts`.

  In the same step, TDD new `views/shared/dayTrackTouch.ts` (`TouchGestureDecision`, `getTouchGestureDecision(start, current)`, design D7) in `views/shared/dayTrackTouch.test.ts` with `it.each`, header `// Verifies FR3, NFR-R2 of add-time-sliders-to-location-cards (D7).`: no movement → `WAIT`; 11 px right, 2 px down → `SELECT`; 11 px left → `SELECT`; 2 px right, 11 px down → `ABANDON`; 10 px right (equal to the slop) → `WAIT`; 12 px right, 12 px up → `ABANDON`. Then wire it into `DayTrack.tsx` for `pointerType === "touch"`; 7.1 proves the swipe and the tap in the browser. Verify red, then green, with `npx vitest run src/views/shared/dayTrackTouch.test.ts`.
- [ ] 5.3 TDD new `views/shared/DayTrack.tsx` (design D7) in `views/shared/DayTrack.test.tsx`, header `// Verifies FR1, FR2, FR7 of add-time-sliders-to-location-cards (D7).`. It is rendered with a presented track. Assert DOM content and attributes only:
  - the coloured bar's `style.backgroundImage` equals the `dayTrackGradient` output;
  - the handle's `style.left` is `52.0833%`;
  - five hour-label elements carry the M6 Almaty texts inside an `aria-hidden="true"` container.

  Pointer geometry, keys, focus, roles, names and layout are E2E (7.1). Verify red, then green, with `npx vitest run src/views/shared/DayTrack.test.tsx`.
- [ ] 5.4 Wire the track (design D8): `LocationRow` renders `DayTrack` when `row.dayTrack` is set and takes `onSelectTrackFraction` and `onMoveTrack`; `LocationList` passes them through; `CardsView` takes them from `useTimeSelection()`. Extend `views/shared/LocationRow.test.tsx` (header line `// Verifies FR1 of add-time-sliders-to-location-cards (D8).`):
  - a row with `dayTrack` renders one `[data-day-track]` element;
  - a row without `dayTrack` renders none.

  Keep the existing LocationRow, LocationList and CardsView tests green by adding the new props to their fixtures. Verify with `npx vitest run src/views`, then `pnpm --filter @time-zones/client typecheck`, `pnpm --filter @time-zones/client lint` and `pnpm run build`.
- [ ] 5.5 Mutation run (M8). Verify that `npx stryker run --mutate 'src/views/shared/DayTrack.tsx,src/views/shared/dayTrackGradient.ts,src/views/shared/dayTrackKeys.ts,src/views/shared/LocationRow.tsx,src/views/cards/CardsView.tsx'` scores ≥ 95% (minimum 90%). When that run has finished, run `npx stryker run --mutate 'src/views/shared/dayTrackTouch.ts'` alone and verify the same score.

## 6. Unit BDD (vitest-cucumber)

- [ ] 6.1 Write `test/features/time_selection/time_selection_select_time.feature` and `steps/time_selection_select_time.steps.tsx`. The steps render the hooks of 4.2 inside one `LocationsProvider` with an in-memory repository, a switchable clock, and the manual tick and write schedulers. They act through `useTimeSelection` / `useReferenceMoment` actions and dispatch the malformed command to the store.
  - Scenarios of the spec requirements "Select a time on a track", "Move the handle with the keyboard", "Time selection works with the date bar" and "Time selection is never stored". The other-tab scenario adds the city the way `addCityInAnotherTab` of `date_selection/steps/dateSelectionWorld.tsx` does.
  - Plus "50 rows within the time-selection budget". It times only `reduceLocations` + `presentLocationRows` with `performance.now()` ≤ 50 ms, as `referenceMomentRowsWorld.ts` does (NFR-P1).
  - Tags: `@add-time-sliders-to-location-cards` with only the ids each scenario asserts (`@FR3`, `@FR4`, `@FR5`, `@FR8`, `@NFR-P1`, `@M2`, `@M3`, `@M4`, `@M7`).

  Verify with `npx vitest run src/test/features/time_selection/steps/time_selection_select_time.steps.tsx`.
- [ ] 6.2 Write `test/features/time_selection/time_selection_day_track.feature` and `steps/time_selection_day_track.steps.tsx` with exactly these scenarios of `specs/time-selection/spec.md`: "A 24-hour reference day", "Days of 23 and 25 hours", "No track for an unknown zone" ("Day track spans the reference day"); "All handles stand at the same position", "A live handle follows the clock", "A pinned handle ignores minute updates" ("Handle position"); "Colour stops of Almaty and New York", "Colours follow the local period outside blend windows", "Boundaries of a skipped local date are left out", "A period change across an offset change is a hard edge" ("Day-period colours"); "Hour labels of four zones" ("Local hour labels"). The steps render `useLocations` (and `useTimeSelection` for pinning) in one `LocationsProvider` with a switchable clock and the manual tick scheduler, as 6.1 does, and read `row.dayTrack`. "A period change across an offset change is a hard edge" calls `assembleDayPeriodStops` with the synthetic edge directly. "Colours come from the theme tokens" and "Labels only on wide screens" are not in this feature: jsdom cannot compute colours or layout (`bdd-unit.md`), so both are E2E only, task 7.1. Add "Slider name and value in both languages" (the value text from the presenter; the name from `t("locations.timeSliderLabel")`) and "50 tracks within the date-change budget" (NFR-P2). Tags: `@add-time-sliders-to-location-cards` with `@FR1`, `@FR2`, `@FR6`, `@FR7`, `@FR9`, `@NFR-P2`, `@M5`, `@M6` as asserted. Verify with `npx vitest run src/test/features/time_selection/steps/time_selection_day_track.steps.tsx`.
- [ ] 6.3 Add the modified `date-selection` scenario "A time selection ends the gap note" (spec delta `specs/date-selection/spec.md`) to `test/features/date_selection/date_selection_wall_clock.feature`, tagged `@add-time-sliders-to-location-cards @FR5 @M4`, with its steps in `steps/date_selection_wall_clock.steps.tsx`. It asserts the bar's note element is absent after the move. Verify with `npx vitest run src/test/features/date_selection/steps/date_selection_wall_clock.steps.tsx`.

## 7. E2E BDD (playwright-bdd) and screenshots

- [ ] 7.1 Write `test/features/time_selection/time_selection_e2e.feature` and `steps/time_selection_e2e.steps.ts`. Use `createBdd(test)` on the `test` of `locations/steps/locations_ui_e2e.fixtures.ts`. Reuse the existing steps:
  - "the current time is {string}" (`locations_local_time_e2e.steps.ts`);
  - "the screen is {int} px wide for the locations" (`locations_layout_e2e.steps.ts`);
  - "the user opens the locations app" (`locations_ui_e2e.steps.ts`);
  - "the locations screen uses the (light|dark) theme" (`locations_view_a11y_e2e.steps.ts`);
  - "the stored locations are …" (`locations_view_contract_e2e.steps.ts`).

  The device zone is `Asia/Almaty`. Scenarios of `specs/time-selection/spec.md`, each tagged with `@add-time-sliders-to-location-cards` and only the ids it asserts:
  - pointer (`@FR3 @NFR-R2`): "Dragging one track moves every card" (`page.mouse` down on the New York handle, move to 75% of the track, up; then read the card times), and "Drag without scrolling or reordering" (`window.scrollX/scrollY` unchanged, row order unchanged, Almaty `23:45`);
  - keyboard (`@FR4 @NFR-A2`): "Keyboard moves every card" (`locator.focus()` on the Almaty slider, then `Tab` presses until `document.activeElement` is the Moscow slider, asserting the handle inside a slider is never focused on its own; Page Up ×2, Arrow Right → Almaty `14:45`, Moscow `12:45`, scroll unchanged, order unchanged), plus the six keys of "Keys from a pinned quarter hour" read from `aria-valuenow`;
  - focus (`@NFR-A2`): "Visible focus" (the computed `outline-color` of the focused handle equals the computed `color` of a probe styled `color: var(--color-accent)`, and `outline-style` is not `none`);
  - names (`@NFR-A3 @FR9`): "Slider name, range and value" (`getByRole("slider", { name: "Time in Almaty" })` with `aria-valuenow` 750, `aria-valuemin` 0, `aria-valuemax` 1425, `aria-valuetext` `12:30, Sun, Mar 8`); the card's time has no `[aria-live]` ancestor;
  - axe-core (`@NFR-A1 @M9`): "No accessibility violations with tracks" outline (live / time selected × light / dark, `@axe-core/playwright`);
  - colours (`@FR6`): "Colours come from the theme tokens" (the computed `background-image` of the Almaty bar contains the `rgb()` values of probes styled `color: var(--color-day-night|morning|working|evening)`, in light and dark);
  - layout (`@NFR-R1 @NFR-R2 @UX1 @UX2 @UX3 @M9` as they apply):
    - "Track under the text on a narrow screen": at 375 px the bar's top is at or below the bottom of the time element, the bar's width is the card's content width within 1 px, the bar is 10 px high and the visible handle 28 px wide, and no hour label is visible;
    - "Track beside the time on a wide screen": at 1024 px the bar's left is right of the time element's right, its vertical centre is within the card's first line box, it is 12 px high, the handle is 32 px, five labels are visible under the bar, and the labels' computed `color` equals a `var(--color-muted-foreground)` probe with `font-variant-numeric` containing `tabular-nums`;
    - "Labels only on wide screens" (`@FR7 @NFR-R2`): with Almaty and Moscow stored, at 375 px no hour label is visible, and at 1024 px every track shows its five labels, each label's top at or below the bottom of its bar;
    - "Handle centre matches the instant" at 375 and 1024 px, within 1 px;
    - "Touch targets": each slider's `boundingBox().height` ≥ 44 and each handle hit box ≥ 44 × 44 at 320 and 1024 px;
    - "Tracks fit narrow and wide screens": `scrollWidth` ≤ `clientWidth` at 320 and 2560 px;
  - touch (`@FR3 @NFR-R2`), driven with `startTouch` / `dragWithFinger` / `dispatchTouch` of `locations/steps/locationsReorderE2eHelpers.ts` (CDP `Input.dispatchTouchEvent`, since `page.touchscreen` only taps), reusing "the screen is {int} by {int} px for the locations" (`locations_reorder_drag_e2e.steps.ts`), "the page is taller than the screen" and "the page has scrolled down" (`locations_reorder_checks_e2e.steps.ts`):
    - "A vertical swipe on a track scrolls without selecting a time": at 375 × 300 px with five stored cities, a finger swipe up from the centre of the Almaty bar scrolls the page, and the Now button is absent and the Almaty time still equals the live time;
    - "A finger tap on a track selects a time": touch start and end at 75% of the Almaty bar → Almaty `18:00` and the Now button shown;
    - the visual handle is filled with `var(--color-surface)` and outlined with `var(--color-foreground)`, compared through probes (`@UX1`).

  Every step function carries `// Verifies <ids> of add-time-sliders-to-location-cards`. Verify with `pnpm --filter @time-zones/client test:bdd:gen`, then `npx playwright test -c playwright.bdd.config.ts --grep @add-time-sliders-to-location-cards --project chromium`, and after it has finished, the same command with `--project mobile-chrome`.
- [ ] 7.2 Write `test/features/time_selection/time_selection_view_contract_e2e.feature` with the `@view-contract` scenario "Select a time" (`@add-time-sliders-to-location-cards @view-contract @FR3 @FR5`). It starts with "the view under contract is shown". Put its steps in `steps/time_selection_view_contract_e2e.steps.ts`: "the user moves the time of {string} one hour forward" focuses that city's slider and presses Page Up; the time assertions read the card's time text. Reuse "the user returns to now with the bar" (`date_selection_view_contract_e2e.steps.ts`). Verify with `npx playwright test -c playwright.bdd.config.ts --project view-contract-cards --grep @add-time-sliders-to-location-cards`.
- [ ] 7.3 Add the `time-selected` state to `test/features/locations/steps/locationsStates.ts`: `LocationsState.TIME_SELECTED = "time-selected"`, which seeds the list, then clicks the Almaty bar at 75% of its width and waits for Almaty `18:00`. Add its 4 rows (375 / 1024 px × light / dark) to the screenshot outline in `test/features/locations/locations_ui_e2e.feature`, and add the tags `@add-time-sliders-to-location-cards @NFR-R3 @M9` above the outline. Verify with `npx playwright test -c playwright.bdd.config.ts --grep "time-selected state"`, run with `--update-snapshots` once to create its baselines.
- [ ] 7.4 Re-approve every existing screenshot baseline that shows rows ("list", "pinned", "calendar") and the new "time-selected" ones under `test/features/__screenshots__/{chromium,mobile-chrome}/`, with `--update-snapshots` (NFR-R3). Then verify that `npx playwright test -c playwright.bdd.config.ts --grep Screenshot` passes without it.

## 8. Final verification

- [ ] 8.1 Traceability (M1): every id of FR1–FR9, NFR-P1, NFR-P2, NFR-A1–NFR-A3, NFR-R1–NFR-R3 and UX1–UX3 must appear together with this change's name. Verify that `for id in FR1 FR2 FR3 FR4 FR5 FR6 FR7 FR8 FR9 NFR-P1 NFR-P2 NFR-A1 NFR-A2 NFR-A3 NFR-R1 NFR-R2 NFR-R3 UX1 UX2 UX3; do grep -rqE "add-time-sliders-to-location-cards.*\\b$id([^0-9]|$)|\\b$id([^0-9]|$).*add-time-sliders-to-location-cards" src --include="*.feature" --include="*.ts" --include="*.tsx" || echo "missing $id"; done` prints nothing. It matches only lines that name this change and the id together, so ids of earlier changes do not count.
- [ ] 8.2 Verify `pnpm --filter @time-zones/client typecheck`, `pnpm --filter @time-zones/client lint`, `pnpm --filter @time-zones/client test` and `pnpm run build`, one at a time. Then run the whole E2E suite once, alone and not in the background: `pnpm --filter @time-zones/client test:bdd` (bddgen plus every Playwright project, including `view-contract-cards`). The new row layout can break the existing E2E features of the stable `locations` spec ("Local time and date layout", the reorder features) and of `date-selection`; fix every failure before archiving and re-run until it passes. Ask the user to run the full `pnpm test:mutation` and share the report, since CLAUDE.md forbids running it here.
