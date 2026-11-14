# Tasks

Paths are relative to `packages/client/` unless they start with `docs/`.

Rules for every task:

- Run tests strictly one command at a time, never in the background, scoped to the files named (`CLAUDE.md`).
- Every new or touched production file gets a JSDoc line `Implements <ids> of add-day-colouring-setting (D<n>).`.
- Every touched test file gets a `// Verifies <ids> of add-day-colouring-setting.` comment.
- Every scenario is tagged `@add-day-colouring-setting @<id>`, with the same tag comment above its `f.Scenario` in the steps.
- RED then GREEN means: write the test, run it and see it fail, then implement and see it pass (`.claude/rules/tdd-workflow.md`).

## 1. Glossary and architecture docs (FR1, FR4, FR8, FR13, FR14; design D1, D3, D4, D7, D8)

- [ ] 1.1 `docs/glossary/settings.md`: add these terms:
  - **Day colouring**: *RU:* «Раскраска»: «Обычная», «По времени суток», «По рабочему времени»; English "Colouring", "Plain", "Time of day", "Working hours"; *Code:* `DayColouring`, `DAY_COLOURING_ORDER`, `Preferences.dayColouring`, `SET_DAY_COLOURING`, `useDayColouring`, `DayColouringGroup`, `settings.dayColouringLabel`; *Never:* colour scheme.
  - **Working hours**: one start and one end for every location, read in each location's local time, 10:00–18:00 by default; *RU:* «Рабочие часы»; *Code:* `WorkingHours`, `DEFAULT_WORKING_HOURS`, `checkWorkingHours`, `SET_WORKING_HOURS`, `useWorkingHoursInput`, `WorkingHoursGroup`, `settings.workingHoursLabel`; *Not:* the work day period 09:00–18:00; *Never:* business hours, office hours.
  - **Time range group**: *RU:* группа диапазона времени; *Code:* `SettingsTimeRangeGroup`.

  Then extend **Preferences** and **Settings page** with both settings.

  In `docs/glossary/time-selection.md`, add:
  - **Working day** (*Code:* `WORKING_WEEKDAYS`, `isWorkingDay`);
  - **Working time** (*Code:* `isWorkingTime`, `getWorkingTimeSpans`, `getWorkingTimeStops`, `getHourCellWorkingFlags`, `WORKING_CELL_MIN_SHARE`);
  - **Day colour** (*Code:* `DayColour`, `DayColourStop`, `presentDayColourStops`, `presentHourCellColour`, `DAY_COLOUR_VARIABLES`).

  Change these entries:
  - **Colour stop**: a position and a day colour;
  - **Hour cell**: coloured by the day colouring;
  - **Day period**: *Not:* the working hours;
  - **Hour frame**: foreground colour on accent cells, `getHourFrameColour`.

  In `docs/glossary/views.md`, replace the *(planned)* **Cell colouring** entry with a pointer to **Day colouring**.

  Verify: `grep -n "Day colouring\|Working time\|Time range group" docs/glossary/*.md` lists all three files, `grep -n "Cell colouring" docs/glossary/views.md` prints nothing, and each touched glossary file stays under 200 lines (`wc -l docs/glossary/*.md`).
- [ ] 1.2 `docs/architecture/domain-model.md`:
  - add `DayColouring dayColouring` and `WorkingHours workingHours` to the `Preferences` class;
  - add `SET_DAY_COLOURING` and `SET_WORKING_HOURS` to the preference commands;
  - extend "Day periods" with the day colouring and the working time rule (Monday to Friday by local date, local time at every instant, half-cell rule).

  `docs/architecture/views.md`:
  - the "Cell colouring" bullet of Grid becomes "Day colouring" and covers the three colourings for both views (the Cards section gets the same pointer);
  - "Day-period colors" applies to Time of day;
  - "Visual style" gets the non-working grey of D6 and the hour frame colour of D7;
  - "Overlays → Settings" lists the colouring group and the working hours row.

  `docs/architecture/open-questions.md`: amend Q3's decision. Time of day keeps the constants, and the Working hours colouring uses the user's working hours, as in this change.

  Verify: `grep -n "add-day-colouring-setting\|WORKING_HOURS\|non-working" docs/architecture/domain-model.md docs/architecture/views.md docs/architecture/open-questions.md` prints a line in each file, and `grep -rni "cell colouring" docs/architecture docs/glossary` prints nothing.

## 2. Preferences model and stored document (FR2, FR3, FR6, FR7; design D1, D2)

- [ ] 2.1 RED then GREEN, `src/preferences/workingHours.ts` with `src/preferences/workingHours.test.ts`:
  - `WorkingHours`, `DEFAULT_WORKING_HOURS`, `WorkingHoursError`, `checkWorkingHours`, `isWorkingHours`;
  - `it.each` over `10:00–18:00` (valid), `09:07–17:30` (valid), `12:00–12:00`, `18:00–10:00`, `25:00–18:00`, `9:00–18:00` (not canonical), and non-strings.

  Export the new names from `src/preferences/index.ts`.

  Verify: `npx vitest run src/preferences/workingHours.test.ts` fails, then passes.
- [ ] 2.2 RED then GREEN, `src/preferences/preferences.ts` and `preferencesCommands.ts` with new `src/preferences/preferences.dayColouring.test.ts`:
  - `DayColouring`;
  - the default `TIME_OF_DAY` and `DEFAULT_WORKING_HOURS`;
  - `SET_DAY_COLOURING` (an unchanged value returns the same object);
  - `SET_WORKING_HOURS`: an unchanged value or a range refused by `checkWorkingHours` returns the same object; a valid one replaces the range and keeps `dayColouring`;
  - `SET_DAY_COLOURING` keeps `workingHours`.

  Add `DAY_COLOURING_ORDER` to `src/constants/preferences.ts` and export it from `src/constants/index.ts`.

  Verify: `npx vitest run src/preferences/preferences.dayColouring.test.ts` fails, then passes.
- [ ] 2.3 RED then GREEN, `parseStoredPreferences.ts` and `src/adapters/preferencesDocument.ts` with new `src/adapters/preferencesDocument.dayColouring.test.ts`:
  - `PREFERENCES_SCHEMA_VERSION = 6`, migration step 5;
  - serialization of both fields;
  - fixture tests:
    - a version-5 document with Dark, 12-hour, `ru`, Grid and only the UTC offset keeps them all and gets Time of day and 10:00–18:00;
    - a version-1 document runs every step;
    - a version-6 document with an unknown `dayColouring`, with `18:00–10:00`, or without `workingHours` is `UNREADABLE`.

  Update the expectations of the existing `preferencesDocument*.test.ts` and `preferences*.test.ts` files that spell out the whole payload. Run each one.

  Verify: `npx vitest run src/adapters/preferencesDocument.dayColouring.test.ts`, then `npx vitest run src/adapters/preferencesDocument.test.ts`, then `npx vitest run src/adapters/preferencesRepository.test.ts`, then `npx vitest run src/preferences`, one at a time, all pass.

## 3. Working time in the model (FR8, FR10, FR11, NFR-P1; design D3)

- [ ] 3.1 Characterization first: run `npx vitest run src/model/dayPeriodStops.test.ts` and see it pass. Move `getClockChangesAround` from `src/model/dayPeriodStops.ts` to `src/model/clockChange.ts`, exported, and import it back. The behaviour is unchanged.

  Verify: `npx vitest run src/model/dayPeriodStops.test.ts` passes again.
- [ ] 3.2 RED then GREEN, `src/constants/workingTime.ts` (`WORKING_WEEKDAYS`, `WORKING_CELL_MIN_SHARE`) and `src/model/workingTime.ts` with `src/model/workingTime.test.ts`:
  - `isWorkingDay` for every weekday;
  - `isWorkingTime`: the table of the `day-colouring` scenario "Each location reads the working hours in its own time", a Saturday, the start included and the end excluded;
  - `getWorkingTimeSpans` and `getWorkingTimeStops`: the scenario tables "Working-time stops on a Monday", "Friday still works where Saturday has not begun" and "Working time after a clock change" (Cairo, `2026-04-24`); a start inside a DST gap (`Africa/Cairo`, working hours `00:30–18:00`, Friday 2026-04-24, whose 00:00–01:00 is skipped): the span starts at the clock change instant `2026-04-23T22:00:00Z`; a property check that every stop's colour equals `isWorkingTime` at a quarter-hour sample on each side;
  - `getHourCellWorkingFlags`: the tables of "Half of the hour decides", "Weekend cells and Friday cells across the reference day" and "Hour cells on a clock change day";
  - memoization: a second call returns the same array, and a different working hours key returns a new one.

  Export the new names from `src/model/index.ts`.

  Verify: `npx vitest run src/model/workingTime.test.ts` fails, then passes.

## 4. Presenter: day colours and working hours texts (FR2, FR5, FR9–FR13, NFR-P1, UX5; design D4, D5)

- [ ] 4.1 RED then GREEN, `src/presenter/dayColours.ts` with `src/presenter/dayColours.test.ts`:
  - `DayColour`, `DayColourStop`, `presentDayColourStops`: Plain is one stop `0` plain; Time of day equals the mapped `getDayPeriodStops`; Working hours equals the mapped `getWorkingTimeStops`; the same array on a repeated call;
  - `presentHourCellColour`;
  - `getHourFrameColour`, which is `ACCENT` only for Time of day.

  Export them from `src/presenter/index.ts`.

  Verify: `npx vitest run src/presenter/dayColours.test.ts` fails, then passes.
- [ ] 4.2 RED then GREEN, `src/presenter/dayTrack.ts`, `presentZoneMoment.ts` and `presentLocationRows.ts`:
  - `DayTrackContext` and `LocationRowsContext` gain `dayColouring` and `workingHours`;
  - `PresentedDayTrack.stops` becomes `readonly DayColourStop[]`, from `presentDayColourStops`.

  Add cases to `src/presenter/dayTrack.test.ts` (Plain: one stop; Working hours: the Almaty Monday stops) and update its existing period expectations to `DayColour` values. Update `src/views/shared/dayTrackFixture.tsx`, `src/test/features/time_selection/steps/dayColourChecks.ts` and every other reader found by `grep -rn "stops" src --include=*.ts --include=*.tsx`. Their default colouring is Time of day.

  Verify: `npx vitest run src/presenter/dayTrack.test.ts`, then `npx vitest run src/presenter/presentLocationRows.test.ts`, one at a time, pass.
- [ ] 4.3 RED then GREEN, `src/presenter/hourStrip.ts`:
  - `HourStripContext` gains `dayColouring` and `workingHours`, and they join the strip cache key;
  - `PresentedHourCell.dayPeriod` is replaced by `dayColour`, from `presentHourCellColour` and `getHourCellWorkingFlags`.

  Add cases to `src/presenter/hourStrip.test.ts` (Plain: every cell plain; Working hours: the Almaty 09:07 columns; the same strip on a repeated call; a new strip after a colouring change). Update `src/views/grid/hourStripFixture.tsx`, `src/test/features/grid_view/steps/hourCellsWorld.ts` and the other readers found by `grep -rn "dayPeriod\b" src --include=*.ts --include=*.tsx`.

  Verify: `npx vitest run src/presenter/hourStrip.test.ts` passes.
- [ ] 4.4 RED then GREEN, `src/presenter/workingHours.ts` with `src/presenter/workingHours.test.ts`:
  - `formatWorkingHoursTime` and `presentWorkingHoursTexts`: `10:00` / `18:00` and `09:07` in 24-hour; `10:00 AM` / `6:00 PM` and `5:30 PM` in English 12-hour; the Russian 12-hour markers from `getDayPeriodMarkers`;
  - a repeated call builds no formatter (`startWorkCount` from `src/test/workCounters.ts`).

  Export from `src/presenter/index.ts`.

  Verify: `npx vitest run src/presenter/workingHours.test.ts` fails, then passes.

## 5. Controller (FR3, FR5, FR6, FR7, FR13; design D4, D5)

- [ ] 5.1 RED then GREEN, `src/controller/preferencesContext.ts` and `PreferencesProvider.tsx`:
  - `setDayColouring` and `setWorkingHours`;
  - new `src/controller/useDayColouring.ts`, returning `{ dayColouring, workingHours }`, with the default outside a provider.

  Tests in new `src/controller/PreferencesProvider.dayColouring.test.tsx`: a change applies at once and is written once after the debounce (manual write scheduler), another tab's change is applied (two `createInMemoryPreferencesRepository` instances on one `createInMemoryPreferencesBackend`), and `useDayColouring` outside a provider returns the defaults. `PreferencesProvider.tsx` stays under 200 lines.

  Verify: `npx vitest run src/controller/PreferencesProvider.dayColouring.test.tsx` fails, then passes.
- [ ] 5.2 RED then GREEN, new `src/controller/useWorkingHoursInput.ts` with `useWorkingHoursInput.test.tsx`:
  - the outcome enum `WorkingHoursInputOutcome`;
  - `SAVED` for `907` / `18:00` (stores `09:07`);
  - `INVALID_START_TEXT` for `25:00`;
  - `INVALID_END_TEXT` for `abc`;
  - `START_NOT_BEFORE_END` for `18:00` / `10:00` and `12:00` / `12:00`, with the stored range unchanged;
  - `5:30 pm` accepted in the 12-hour format;
  - the texts follow the hour format.

  Export from `src/controller/index.ts`.

  Verify: `npx vitest run src/controller/useWorkingHoursInput.test.tsx` fails, then passes.
- [ ] 5.3 RED then GREEN, `src/controller/useLocations.ts` and `useHourGrid.ts`:
  - pass `dayColouring` and `workingHours` from `useDayColouring` to the presenter and add them to the memo dependencies;
  - `useHourGrid` returns `hourFrameColour`.

  Add cases to `src/controller/useLocations.dayTrack.test.tsx` and `src/controller/useHourGrid.test.tsx`: a colouring change re-presents the rows, and a minute tick in Working hours returns the same stops and strip.

  Verify: `npx vitest run src/controller/useLocations.dayTrack.test.tsx`, then `npx vitest run src/controller/useHourGrid.test.tsx`, one at a time, pass.

## 6. Tokens and views (FR9–FR13, NFR-A3, UX4; design D4, D6, D7)

- [ ] 6.1 RED then GREEN, `src/styles/tokens.css`: `--color-day-non-working` in all three theme blocks (D6), and its `day.non-working` entry next to `day.working` in the `colors` of `tailwind.config.ts`.

  `src/styles/tokens.test.ts`, for both themes: for each of the seven day colours, the digit colour of D6 against the cell colour is ≥ 4.5:1, and the handle's surface fill or foreground border against the cell colour is ≥ 3:1 (NFR-A3, M5). The non-working grey differs from the accent. The existing "same values in both dark blocks" check covers the new token.

  Verify: `npx vitest run src/styles/tokens.test.ts` fails, then passes.
- [ ] 6.2 RED then GREEN, `src/views/shared/dayTrackGradient.ts`:
  - `DAY_COLOUR_VARIABLES` (plain and working time → `--color-accent`, non-working → `--color-day-non-working`, the periods unchanged);
  - `DAY_COLOUR_FOREGROUND_CLASS_NAMES`;
  - `buildDayTrackGradient(stops: readonly DayColourStop[])`, where one stop gives a single-colour gradient, not `none`.

  Export from `src/views/shared/index.ts`. Update `dayTrackGradient.test.ts` with a single plain stop and a hard working edge.

  Verify: `npx vitest run src/views/shared/dayTrackGradient.test.ts` passes, then `npx vitest run src/views/shared/DayTrack.test.tsx` passes.
- [ ] 6.3 RED then GREEN, `src/views/grid/HourCellView.tsx`: the background comes from `DAY_COLOUR_VARIABLES[cell.dayColour]` and the digit class from `DAY_COLOUR_FOREGROUND_CLASS_NAMES`. `src/views/grid/HourFrame.tsx` takes `colour` and `GridView.tsx` passes `hourFrameColour`.

  Tests in `src/views/grid/HourStrip.test.tsx` (a plain cell gets the accent variable and the accent-foreground class) and `src/views/grid/HourFrame.test.tsx` (the foreground border for `FOREGROUND`).

  Verify: `npx vitest run src/views/grid/HourStrip.test.tsx`, then `npx vitest run src/views/grid/HourFrame.test.tsx`, one at a time, pass.

## 7. Unit BDD for the colouring rules (FR2, FR8–FR12, NFR-P1, M3)

- [ ] 7.1 New `src/test/features/day_colouring/day_colouring_day_tracks.feature` with `steps/day_colouring_day_tracks.steps.ts`. It holds the `day-colouring` scenarios "Time of day by default", "Changing the colouring keeps the moment", "A plain track", "Each location reads the working hours in its own time", "Weekends are never working time", "Working-time stops on a Monday", "Friday still works where Saturday has not begun" and "Working time after a clock change". The steps use the real presenter and model with `fakeClock`, no mocks.

  Verify: `npx vitest run src/test/features/day_colouring/steps/day_colouring_day_tracks.steps.ts` passes, then `npx vitest run src/test/features/time_selection/steps/time_selection_day_colours.steps.tsx` passes unchanged in its scenarios.
- [ ] 7.2 New `src/test/features/day_colouring/day_colouring_hour_cells.feature` with `steps/day_colouring_hour_cells.steps.ts`: "Plain hour cells", "Half of the hour decides" (all five rows), "Weekend cells and Friday cells across the reference day", "Hour cells on a clock change day".

  Verify: `npx vitest run src/test/features/day_colouring/steps/day_colouring_hour_cells.steps.ts` passes, then `npx vitest run src/test/features/grid_view/steps/grid_view_hour_cells_unit.steps.tsx` still passes.
- [ ] 7.3 New `src/test/features/day_colouring/day_colouring_budget.feature` with `steps/day_colouring_budget.steps.ts` (`startWorkCount`, `MAX_TRANSITION_LOOKUPS_PER_ZONE`, `MAX_FORMATTERS_PER_ZONE` and the 10 zones of `hourStripBudgetWorld.ts`): the three scenarios of "Day colouring is fast". Add Working hours cases to `src/test/benchmarks/hourStrip.bench.ts` and `src/test/benchmarks/rowPresenting.bench.ts`.

  Verify: `npx vitest run src/test/features/day_colouring/steps/day_colouring_budget.steps.ts` passes, then `pnpm bench` runs without error.

## 8. Settings controls (FR1, FR4–FR6, FR14, FR15, UX1–UX3, UX5; design D8, D9)

- [ ] 8.1 Add the keys of D9 to `src/locales/en.json` and `src/locales/ru.json`.

  Verify: `npx vitest run src/locales/locales.test.ts` passes (its "should have identical key sets in every locale file" check covers the new keys).
- [ ] 8.2 RED then GREEN, new `src/app/settings/SettingsTimeRangeGroup.tsx` with `SettingsTimeRangeGroup.test.tsx`: the two scenarios of the `settings` requirement "Time range group", plus these cases:
  - Esc calls `onRestore`;
  - blur inside the row does not confirm, and blur out of it does;
  - typed digits get the separator;
  - field keys do not bubble.

  Verify: `npx vitest run src/app/settings/SettingsTimeRangeGroup.test.tsx` fails, then passes.
- [ ] 8.3 RED then GREEN, new `src/app/settings/DayColouringGroup.tsx` and `WorkingHoursGroup.tsx`, placed in `SettingsPage.tsx` after `ViewModeGroup` (export from `src/app/settings/index.ts` if the module lists its parts). Tests: `DayColouringGroup.test.tsx` (options in order, Time of day checked by default, a choice calls `setDayColouring`) and `WorkingHoursGroup.test.tsx` (absent unless Working hours, texts in both hour formats, each outcome's hint, Esc restores, a change from outside resets the texts).

  Verify: `npx vitest run src/app/settings/DayColouringGroup.test.tsx`, then `npx vitest run src/app/settings/WorkingHoursGroup.test.tsx`, then `npx vitest run src/app/settings/SettingsPage.test.tsx`, one at a time, pass.
- [ ] 8.4 Unit BDD:
  - `src/test/features/settings/settings_day_colouring_unit.feature` with `steps/settings_day_colouring_unit.steps.tsx`: "Time of day by default" (the colouring group follows the view group), "Choosing a colouring applies at once", "The row follows the colouring", "Both languages of the colouring settings";
  - `settings_working_hours.feature` with `steps/settings_working_hours.steps.tsx`: "A minute-exact start", "The 12-hour format", "Refused ranges keep the last valid hours" (three rows), "Esc restores the stored texts";
  - `settings_day_colouring_storage.feature` with `steps/settings_day_colouring_storage.steps.tsx`: every scenario of "Day colouring and working hours are kept on the device", using `createLocalStoragePreferencesRepository`, the manual write scheduler and two tabs on one channel, as `zoneLabelWorld.tsx` does.

  These scenarios assert values, texts and stored documents only. Names, ARIA state, focus and layout are in group 9.

  Verify: the three steps files, each with `npx vitest run <file>`, one at a time, pass.

## 9. BDD E2E, accessibility and screenshots (FR12, FR13, NFR-A1–NFR-A4, NFR-R1, NFR-R2, M2, M4)

- [ ] 9.1 New `src/test/features/settings/settings_day_colouring_e2e.feature` with `steps/settings_day_colouring_e2e.steps.ts`:
  - every scenario of "Accessible colouring group and working hours row": names, checked state, arrow keys, `aria-invalid` and `aria-describedby`, 44 px, focus outlines, axe-core light, dark and with the hint;
  - every scenario of "Colouring settings layout": four width × language × hour format rows, no movement, no horizontal scroll.

  Verify: `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_day_colouring_e2e.feature` passes.
- [ ] 9.2 New `src/test/features/day_colouring/day_colouring_e2e.feature` with `steps/day_colouring_e2e.steps.ts`:
  - "Accent and grey in a real browser" (computed background of the cells);
  - "No violations in every colouring" (eight rows);
  - "Screenshots of the colourings" (eight rows).

  In `src/test/features/grid_view/grid_view_hour_frame_e2e.feature`, add the `grid-view` scenarios "Frame in the foreground colour on accent cells" and "The frame stays visible on accent cells", and keep the existing outline "Frame crosses every row in the <theme> theme" (the spec's "Frame crosses every row in the accent colour") in the default Time of day colouring.

  Run with `--update-snapshots` once, read the new 375 px and 1280 px PNGs with the Read tool, and check them:
  - plain tracks and cells are one accent colour;
  - working cells are accent and the others grey;
  - the frame is visible.

  Then run again without the flag.

  Verify: `npx playwright test -c playwright.bdd.config.ts src/test/features/day_colouring/day_colouring_e2e.feature`, then the same for `src/test/features/grid_view/grid_view_hour_frame_e2e.feature`, one at a time, pass.
- [ ] 9.3 New `src/test/features/day_colouring/day_colouring_view_contract_e2e.feature`, tagged `@view-contract`, with `Background: Given the view under contract is shown` and the two scenarios of "Day colouring in every view". Its steps go in `steps/day_colouring_view_contract_e2e.steps.ts`. They read the day track's background gradient in Cards and the cells' computed background in Grid, through a per-view helper in the existing view contract fixtures (`src/test/features/view_contract/steps/`).

  Verify: `npx playwright test -c playwright.bdd.config.ts src/test/features/day_colouring/day_colouring_view_contract_e2e.feature` passes for Cards and Grid.
- [ ] 9.4 Re-approve the settings screenshots once (NFR-R2): add `@add-day-colouring-setting @NFR-R2` to "Approved screenshots of the settings at <width> px in the <theme> theme" in `settings_e2e.feature`, and run it with `--update-snapshots`. Read the 375 px PNGs and confirm that the colouring group follows the view group with "Time of day" checked, and that there is no working hours row. Run it again without the flag. Then run `npx playwright test -c playwright.bdd.config.ts --grep "Approved|Screenshot of the|screenshot"` once without `--update-snapshots`: every other approved Cards, Grid, search and settings screenshot matches unchanged (M2).

  Verify: both runs pass.

## 10. Integration checks (all ids)

- [ ] 10.1 Run the whole unit suite once: `pnpm test`. It passes.
- [ ] 10.2 Scoped mutation testing (M6), at most 5 files per run, one run at a time, from `packages/client`:
  1. `npx stryker run --mutate 'src/model/workingTime.ts,src/presenter/dayColours.ts,src/presenter/workingHours.ts,src/preferences/workingHours.ts,src/preferences/preferencesCommands.ts'`;
  2. `npx stryker run --mutate 'src/preferences/parseStoredPreferences.ts,src/adapters/preferencesDocument.ts,src/controller/useWorkingHoursInput.ts,src/presenter/hourStrip.ts,src/views/shared/dayTrackGradient.ts'`.

  Read `reports/mutation/mutation-report.json` after each run and add tests until each run scores ≥ 95% (at least 90%).
- [ ] 10.3 Traceability: from `packages/client`, for each id in `FR1`–`FR15`, `NFR-P1`, `NFR-A1`–`NFR-A4`, `NFR-R1`, `NFR-R2` and `UX1`–`UX5`, run `grep -rln "add-day-colouring-setting" src | xargs grep -l "<id>"` and see at least one file.

  Glossary review: `grep -rniE "cell colouring|business hours|office hours|colour scheme" src/locales src/views src/presenter src/app` prints nothing.
- [ ] 10.4 Run `pnpm run lint`, then `pnpm run typecheck` (it also proves that `PaintBucket`, `SunMoon` and `BriefcaseBusiness` exist in the installed `lucide-react`), then `pnpm run build`, one at a time. All pass.

## Human follow-up

None. Every step of this change fits inside the implement stage:
- the docs are ordinary tasks under `docs/`;
- the mutation runs are scoped;
- the CI commands run locally in group 10;
- no ADR, CI job, rule or `CLAUDE.md` line is needed (design, Context).

## Workflow follow-up

- Archive the change after review with `/opsx:archive` (path `openspec/changes/archive/YYYY/MM/`).
