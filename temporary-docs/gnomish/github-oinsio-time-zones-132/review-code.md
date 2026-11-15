# Review: add-day-colouring-setting

## Summary

| Item | Value |
|---|---|
| Tasks verified | 32/33 |
| Requirements traced | 99/101 |
| CRITICAL | 1 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Tasks

Paths are relative to `packages/client/` unless they start with `docs/`.

- ✅ 1.1 Glossary: `docs/glossary/settings.md:22-24` (Day colouring, Working hours, Time range group), `docs/glossary/time-selection.md:33-35` (Working day, Working time, Day colour), `docs/glossary/views.md:10` points to Day colouring; no "Cell colouring" left in `views.md`.
- ✅ 1.2 Architecture docs: `docs/architecture/domain-model.md`, `views.md`, `open-questions.md` each carry the change/non-working lines; `grep -rniE "morning, working hours|around working hours|working hours for day-period" docs` prints nothing.
- ✅ 2.1 `src/preferences/workingHours.ts` (`WorkingHours`, `DEFAULT_WORKING_HOURS`, `WorkingHoursError`, `checkWorkingHours`, `isWorkingHours`) with `workingHours.test.ts`; exported from `src/preferences/index.ts:22-28`.
- ✅ 2.2 `DayColouring` in `src/preferences/preferences.ts:31-35`, defaults at `:58-59`; `SET_DAY_COLOURING`/`SET_WORKING_HOURS` in `preferencesCommands.ts` (`reduceWorkingHours` refuses invalid ranges); `DAY_COLOURING_ORDER` in `src/constants/preferences.ts:101-105`; tests in `preferences.dayColouring.test.ts`.
- ✅ 2.3 `PREFERENCES_SCHEMA_VERSION = 6`, migration step 5 and serialization in `src/adapters/preferencesDocument.ts:48-52,66-67`; parsing in `parseStoredPreferences.ts`; fixtures in `preferencesDocument.dayColouring.test.ts`.
- ✅ 3.1 `getClockChangesAround` moved and exported in `src/model/clockChange.ts:131-151` (function at `:137`), imported by `dayPeriodStops.ts:3`.
- ✅ 3.2 `src/constants/workingTime.ts`, `src/model/workingTime.ts` (`isWorkingDay`, `isWorkingTime`, `getWorkingTimeSpans`, `getWorkingTimeStops`, `getHourCellWorkingFlags`, memoized `getEntry` at `:173-199`), 18 cases in `workingTime.test.ts`; exported from `src/model/index.ts:143-151`.
- ✅ 4.1 `src/presenter/dayColours.ts` (`DayColour`, `presentDayColourStops` with `WeakMap` memo, `presentHourCellColour`, `getHourFrameColour`), `dayColours.test.ts`; exported from `src/presenter/index.ts:21-28`.
- ✅ 4.2 `DayTrackContext`/`LocationRowsContext` gain both fields (`presenter/dayTrack.ts:42-43`, `presentZoneMoment.ts:31-34`); `stops` from `presentDayColourStops` (`dayTrack.ts:123`); fixtures and `dayColourChecks.ts` updated.
- ✅ 4.3 `presenter/hourStrip.ts`: cache key gains colouring and hours (`:122-124`), `dayColour` from `presentHourCellColour` and `getHourCellWorkingFlags` (`:132-145`); cases in `hourStrip.test.ts`.
- ✅ 4.4 `presenter/workingHours.ts` with `workingHours.test.ts` (24-hour, 12-hour, Russian markers, "build no formatter on a repeated call" at `:42`). See R3 for the duplicated formatting body.
- ✅ 5.1 `setDayColouring`/`setWorkingHours` in `controller/preferencesContext.ts:29-32` and `PreferencesProvider.tsx` (189 lines); `useDayColouring.ts`; `PreferencesProvider.dayColouring.test.tsx`.
- ✅ 5.2 `controller/useWorkingHoursInput.ts` with `WorkingHoursInputOutcome`, `useWorkingHoursInput.test.tsx` (6 cases); exported from `controller/index.ts`.
- ✅ 5.3 `useLocations.ts` and `useHourGrid.ts` read `useDayColouring()` and add both to the memo deps; `useHourGrid` returns `hourFrameColour`; `useDayColouring.presenting.test.tsx`.
- ✅ 6.1 `--color-day-non-working` in all three blocks of `src/styles/tokens.css`, `day.non-working`/`day.work` in `tailwind.config.ts`; `tokens.test.ts:127-172` asserts digits ≥ 4.5:1, handle ≥ 3:1, grey ≠ accent and UX4 orders per theme.
- ✅ 6.2 `views/shared/dayTrackGradient.ts`: `DAY_COLOUR_VARIABLES`, `DAY_COLOUR_FOREGROUND_CLASS_NAMES`, single stop drawn at 0% and 100%; cases in `dayTrackGradient.test.ts`.
- ✅ 6.3 `HourCellView.tsx` uses both maps; `HourFrame.tsx` takes `colour` (`BORDER_CLASS_NAMES`); `GridView.tsx:97` passes `hourFrameColour`; tests in `HourStrip.test.tsx`, `HourFrame.test.tsx`.
- ✅ 6.4 Work-period rename in `time_selection_day_colours.feature`, `dayColourChecks.ts`, `grid_view_hour_cells_unit.feature`/`_e2e.feature` and their steps (diff lines in those files).
- ✅ 7.1 `src/test/features/day_colouring/day_colouring_day_tracks.feature` (8 scenarios) with steps.
- ✅ 7.2 `day_colouring_hour_cells.feature` (4 scenarios, 5-row outline) with steps.
- ✅ 7.3 `day_colouring_budget.feature` (3 scenarios) with steps; Working hours cases added to `src/test/benchmarks/hourStrip.bench.ts` and `rowPresenting.bench.ts`.
- ✅ 8.1 D9 keys in `src/locales/en.json:149-156` and `ru.json:149-156`.
- ✅ 8.2 `app/settings/SettingsTimeRangeGroup.tsx` with `SettingsTimeRangeGroup.test.tsx` (12 cases: Esc restore/bubble, blur inside/outside, separator, Enter).
- ✅ 8.3 `DayColouringGroup.tsx`, `WorkingHoursGroup.tsx`, placed after `ViewModeGroup` in `SettingsPage.tsx:142-143`; `DayColouringGroup.test.tsx`, `WorkingHoursGroup.test.tsx`.
- ✅ 8.4 `settings_day_colouring_unit.feature`, `settings_working_hours.feature`, `settings_day_colouring_storage.feature` (with the 3-row outline "Each colouring is kept and shared") with steps.
- ✅ 9.1 `settings_day_colouring_e2e.feature` (names, arrows, described hint, size/focus/axe outline, compact rows, no movement, no scroll, Esc restores then leaves).
- ✅ 9.2 `day_colouring_e2e.feature` (accent/grey, one-colour tracks, 8 axe rows, 8 screenshot rows; 16 new PNGs under `__screenshots__/`); `grid_view_hour_frame_e2e.feature:76-96` adds both frame scenarios.
- ✅ 9.3 `day_colouring_view_contract_e2e.feature` tagged `@view-contract` with `steps/day_colouring_view_contract_e2e.steps.ts` and `view_contract/steps/viewContractDayColours.ts`.
- ❌ 9.4 Only the 375 px settings baselines were re-approved. The 1024 px baselines `__screenshots__/{chromium,mobile-chrome}/Approved-screenshots-of-the-settings-at-1024-px-in-the-{light,dark}-theme.png` are untouched by the branch and show no colouring group (R1).
- ✅ 10.1 Whole unit suite: CI green on the branch (the stage starts after green CI).
- ✅ 10.2 Scoped mutation runs: re-measured here, every listed file ≥ 97% (see Mutation).
- ✅ 10.3 Traceability: every FR/NFR/UX id has at least one `add-day-colouring-setting` file under `src` (grep in this review); no *Never:* word for these concepts in `src/locales`, `src/views`, `src/presenter`, `src/app`.
- ✅ 10.4 Lint, typecheck, build: CI green; `PaintBucket`, `SunMoon`, `BriefcaseBusiness` imported in `DayColouringGroup.tsx:1`.

## Requirements

- ✅ FR1 — `DayColouringGroup.tsx` with `DAY_COLOURING_ORDER`, placed after `ViewModeGroup` (`SettingsPage.tsx:142`); `settings_day_colouring_unit.feature` "Time of day by default".
- ✅ FR2 — `DEFAULT_PREFERENCES.dayColouring = TIME_OF_DAY`, migration step 5; Time of day maps `getDayPeriodStops` 1:1 (`dayColours.ts`); existing Cards/Grid baselines unchanged; `day_colouring_day_tracks.feature` "Time of day by default".
- ✅ FR3 — `SET_DAY_COLOURING` through `applyChange` (`PreferencesProvider.tsx:156`); `useLocations`/`useHourGrid` deps; storage feature reload/tab scenarios.
- ✅ FR4 — `WorkingHoursGroup` renders only for `WORKING_HOURS`, default 10:00–18:00; "The row follows the colouring".
- ✅ FR5 — `useWorkingHoursInput` parses with `parseWallTimeInput`, texts via `presentWorkingHoursTexts`; "A minute-exact start", "The 12-hour format".
- ✅ FR6 — `checkWorkingHours` + outcomes + hints in `WorkingHoursGroup.tsx:14-27`; reducer refuses invalid ranges; "Refused ranges keep the last valid hours".
- ✅ FR7 — serialized in `preferencesDocument.ts:66-67`; "Working hours are kept across colourings", "Another tab changes the working hours".
- ✅ FR8 — `isWorkingTime`/`getWorkingTimeSpans` (`model/workingTime.ts:35-162`); Cairo clock-change and gap cases in `workingTime.test.ts` and `day_colouring_day_tracks.feature`.
- ✅ FR9 — `PLAIN_STOPS`, `DayColour.PLAIN` → `--color-accent`; "A plain track", "Plain hour cells".
- ✅ FR10 — hard edges as two stops at one fraction (`workingTime.ts:228-231`), grey token; "Working-time stops on a Monday".
- ✅ FR11 — `buildFlags` with `WORKING_CELL_MIN_SHARE` (`workingTime.ts:245-265`); "Half of the hour decides" (09:07, 09:40, Kolkata, Kathmandu).
- ✅ FR12 — both views read the same presenter owners; `day_colouring_view_contract_e2e.feature`.
- ✅ FR13 — `getHourFrameColour` and `HourFrame` `BORDER_CLASS_NAMES`; `grid_view_hour_frame_e2e.feature:76-96`.
- ✅ FR14 — `SettingsOptionGroup` reused with icons; reusable `SettingsTimeRangeGroup` (caption, two named fields, texts, `onConfirm`, hint); `SettingsTimeRangeGroup.test.tsx`.
- ✅ FR15 — eight keys in both locale files; "Both languages of the colouring settings".
- ✅ NFR-P1 — memoized spans/stops/flags and strip cache key; `day_colouring_budget.feature` (3 scenarios); bench cases added.
- ✅ NFR-A1 — `settings_day_colouring_e2e.feature` "Names and checked state…", "Arrow keys change the colouring", "Size, focus and no violations".
- ✅ NFR-A2 — field names, `aria-invalid`, `aria-describedby`, `role="status" aria-live="polite"` (`SettingsTimeRangeGroup.tsx:85-131`); "Named fields and a described hint".
- ✅ NFR-A3 — `tokens.test.ts:127-150` per theme and day colour; `DAY_COLOUR_FOREGROUND_CLASS_NAMES`.
- ✅ NFR-A4 — axe rows in `settings_day_colouring_e2e.feature` (4) and `day_colouring_e2e.feature` (8).
- ✅ NFR-R1 — "Compact rows at <width> px…", "No horizontal scrolling with the row" in `settings_day_colouring_e2e.feature`.
- ⚠️ NFR-R2 — new Cards/Grid colouring screenshots added and 375 px settings baselines re-approved, but the 1024 px settings baselines were not re-approved (R1).
- ✅ UX1 — icons `PaintBucket`, `SunMoon`, `BriefcaseBusiness`; `title={option.label}` in `SettingsOptionGroup.tsx:76`.
- ✅ UX2 — row rendered after the colouring group with `MEETING_SPAN_SEPARATOR`; "The row appears without moving the groups above".
- ✅ UX3 — hints `settings.workingHoursOrderError` and reused `locations.wallTimeInputError`; `settings_working_hours.feature` outline rows.
- ✅ UX4 — grey tokens and luminance-order tests `tokens.test.ts:160-172`.
- ✅ UX5 — canonical texts after save (`WorkingHoursGroup.tsx:56,70`); `WorkingHoursGroup.test.tsx:76` "show it in canonical form".
- ✅ M1 — `settings_day_colouring_storage.feature` outline "Each colouring is kept and shared" (3 rows) and "Working hours are kept across colourings".
- ✅ M2 — no existing Cards/Grid baseline PNG is modified by the branch (only settings/language baselines and new colouring PNGs).
- ✅ M3 — the 7 cases are in `day_colouring_hour_cells.feature` (5-row outline, weekend/Friday, Cairo); the cell counts check out against the offsets (e.g. Kathmandu 9:45–10:45 is 45 min → working).
- ✅ M4 — 4 settings axe runs + 8 main-page axe runs (see NFR-A4).
- ✅ M5 — `tokens.test.ts` `describe.each(["light","dark"])` × 7 `DAY_COLOUR_TOKENS` for digits and handle = 14 + 14 checks.
- ✅ M6 — measured in this review: all listed files ≥ 97.30% (Mutation).
- ✅ Scenario: Time of day by default — `day_colouring_day_tracks.feature:6`.
- ✅ Scenario: Changing the colouring keeps the moment — `day_colouring_day_tracks.feature:15`.
- ✅ Scenario: Each location reads the working hours in its own time — `day_colouring_day_tracks.feature:36`.
- ✅ Scenario: Weekends are never working time — `day_colouring_day_tracks.feature:49`.
- ✅ Scenario: A plain track — `day_colouring_day_tracks.feature:26`.
- ✅ Scenario: One-colour tracks are drawn in a real browser — `day_colouring_e2e.feature:21`.
- ✅ Scenario: Plain hour cells — `day_colouring_hour_cells.feature:6`.
- ✅ Scenario: Working-time stops on a Monday — `day_colouring_day_tracks.feature:55`.
- ✅ Scenario: Friday still works where Saturday has not begun — `day_colouring_day_tracks.feature:71`.
- ✅ Scenario: Working time after a clock change — `day_colouring_day_tracks.feature:81`.
- ✅ Scenario: Half of the hour decides — `day_colouring_hour_cells.feature:12`.
- ✅ Scenario: Weekend cells and Friday cells across the reference day — `day_colouring_hour_cells.feature:28`.
- ✅ Scenario: Hour cells on a clock change day — `day_colouring_hour_cells.feature:36`.
- ✅ Scenario: Digit contrast on every cell colour — `src/styles/tokens.test.ts:127-172`.
- ✅ Scenario: Accent and grey in a real browser — `day_colouring_e2e.feature:6`.
- ✅ Scenario: No violations in every colouring — `day_colouring_e2e.feature:37`.
- ✅ Scenario: Plain colouring from the view — `day_colouring_view_contract_e2e.feature:10`.
- ✅ Scenario: Working hours colouring from the view — `day_colouring_view_contract_e2e.feature:17`.
- ✅ Scenario: Screenshots of the colourings — `day_colouring_e2e.feature:58` with 16 new PNGs.
- ✅ Scenario: First presentation is bounded per zone — `day_colouring_budget.feature:6`.
- ✅ Scenario: A minute tick re-presents nothing — `day_colouring_budget.feature:12`.
- ✅ Scenario: Switching the colouring builds no formatter — `day_colouring_budget.feature:20`.
- ✅ Scenario: Day periods of Almaty — `grid_view_hour_cells_unit.feature:26` (work rename).
- ✅ Scenario: Theme colours of the cells — `grid_view_hour_cells_e2e.feature:14`.
- ✅ Scenario: Frame on the current hour — `grid_view_hour_frame_unit.feature:6` (unchanged, default colouring).
- ✅ Scenario: Live frame follows the clock — `grid_view_hour_frame_unit.feature:13`.
- ✅ Scenario: Pinned frame stays — `grid_view_hour_frame_unit.feature:19`.
- ✅ Scenario: Now returns the frame — `grid_view_hour_frame_unit.feature:31`.
- ✅ Scenario: Frame crosses every row in the accent colour — `grid_view_hour_frame_e2e.feature:6` (Time of day).
- ✅ Scenario: No hour frame during a meeting — `grid_view_meeting_unit.feature:73`, `grid_view_meeting_e2e.feature:114`.
- ✅ Scenario: The frame stays visible on accent cells — `grid_view_hour_frame_e2e.feature:96`.
- ✅ Scenario: Frame in the foreground colour on accent cells — `grid_view_hour_frame_e2e.feature:77`.
- ✅ Scenario: Time of day by default — `settings_day_colouring_unit.feature:6`.
- ✅ Scenario: Choosing a colouring applies at once — `settings_day_colouring_unit.feature:13`.
- ✅ Scenario: The row follows the colouring — `settings_day_colouring_unit.feature:21`.
- ✅ Scenario: A minute-exact start — `settings_working_hours.feature:6`.
- ✅ Scenario: The 12-hour format — `settings_working_hours.feature:14`.
- ✅ Scenario: Refused ranges keep the last valid hours — `settings_working_hours.feature:23`.
- ✅ Scenario: Esc restores the stored texts — `settings_working_hours.feature:37`.
- ✅ Scenario: A group reports the confirmed texts — `SettingsTimeRangeGroup.test.tsx:42` (task 8.2 places it in the component test).
- ✅ Scenario: A group shows the hint it is given — `SettingsTimeRangeGroup.test.tsx:58`.
- ✅ Scenario: Colouring and working hours survive a reload — `settings_day_colouring_storage.feature:6`.
- ✅ Scenario: Each colouring is kept and shared — `settings_day_colouring_storage.feature:14`.
- ✅ Scenario: Working hours are kept across colourings — `settings_day_colouring_storage.feature:28`.
- ✅ Scenario: Existing users get Time of day — `settings_day_colouring_storage.feature:35`.
- ✅ Scenario: A broken stored range is unreadable — `settings_day_colouring_storage.feature:43`.
- ✅ Scenario: Another tab changes the colouring — `settings_day_colouring_storage.feature:50`.
- ✅ Scenario: Another tab changes the working hours — `settings_day_colouring_storage.feature:57`.
- ✅ Scenario: Names and checked state of the colouring group — `settings_day_colouring_e2e.feature:6`.
- ✅ Scenario: Arrow keys change the colouring — `settings_day_colouring_e2e.feature:13`.
- ✅ Scenario: Named fields and a described hint — `settings_day_colouring_e2e.feature:22`.
- ✅ Scenario: Size, focus and no violations — `settings_day_colouring_e2e.feature:31`.
- ✅ Scenario: Compact colouring rows — `settings_day_colouring_e2e.feature:51`.
- ✅ Scenario: The row appears without moving the groups above — `settings_day_colouring_e2e.feature:66`.
- ✅ Scenario: No horizontal scrolling with the row — `settings_day_colouring_e2e.feature:75`.
- ✅ Scenario: Both languages of the colouring settings — `settings_day_colouring_unit.feature:30`.
- ✅ Scenario: Open and leave settings — `settings_e2e.feature:7` (unchanged).
- ✅ Scenario: Esc leaves settings — `settings_e2e.feature:20` (unchanged).
- ✅ Scenario: Notices on the settings page — `src/app/AppShell.settings.test.tsx:155` (unchanged).
- ✅ Scenario: Esc in a working hours field restores first, then leaves — `settings_day_colouring_e2e.feature:88`.
- ✅ Scenario: Narrow and wide screens — `settings_e2e.feature:80` (unchanged).
- ✅ Scenario: Compact groups — `settings_option_group_e2e.feature:72` (unchanged).
- ❌ Scenario: Approved screenshots — `settings_e2e.feature:97` is tagged, but the 1024 px baselines still lack the colouring group the requirement says they show (R1).
- ✅ Scenario: Colour stops of Almaty and New York — `time_selection_day_colours.feature:6` (work rename).
- ✅ Scenario: Colours follow the local period outside blend windows — `time_selection_day_colours.feature:19`.
- ✅ Scenario: Boundaries of a skipped local date are left out — `time_selection_day_colours.feature:28`.
- ✅ Scenario: A period change across an offset change is a hard edge — `time_selection_day_colours.feature:38`.
- ✅ Scenario: Colours come from the theme tokens — `time_selection_layout_e2e.feature:75`.

## Mutation

Measured in this review with `npx stryker run --mutate …` from `packages/client`, one run at a time:

- `src/model/workingTime.ts` — 99.42% (172 killed, 1 survived: `isWorkingTime: spans.length > 0` → `false` in `buildStops` at `:226`. That is a span covering a whole reference day with no edge inside, which only happens with a 23-hour reference day and a nearly full-day range. Not worth a finding.)
- `src/presenter/dayColours.ts` — 100%
- `src/presenter/workingHours.ts` — 100%
- `src/preferences/workingHours.ts` — 100% (3 timeouts counted as killed)
- `src/preferences/preferencesCommands.ts` — 100%
- `src/preferences/parseStoredPreferences.ts` — 100%
- `src/adapters/preferencesDocument.ts` — 97.30% (1 survivor: a `BlockStatement` emptying the whole load function body at `:79`, which this branch did not change)
- `src/controller/useWorkingHoursInput.ts` — 100%
- `src/presenter/hourStrip.ts` — 100%
- `src/views/shared/dayTrackGradient.ts` — 100%

A combined run of `hourStrip.ts`, `dayTrackGradient.ts` and `dayTrack.ts` hit the 590 s timeout and was stopped. I re-ran `dayTrackGradient.ts` and `hourStrip.ts` alone. `src/presenter/dayTrack.ts` (a 6-line pass-through change) was not measured.

## Findings

### R1 — CRITICAL — 1024 px settings screenshots were not re-approved and lack the colouring group
- Location: `packages/client/src/test/features/__screenshots__/chromium/Approved-screenshots-of-the-settings-at-1024-px-in-the-light-theme.png:1`
- Rule: `openspec/changes/add-day-colouring-setting/specs/settings/spec.md` (MODIFIED "Settings page layout"), task 9.4, NFR-R2
- Problem: The modified requirement says: "The approved screenshots of the settings page at 375 px and 1024 px in both themes MUST match. They show … the colouring group as three icons in the order Plain, Time of day, Working hours with Time of day checked … They are re-approved once for this change." Task 9.4 is ticked. The branch only re-approved the 375 px baselines (chromium and mobile-chrome, light and dark). All four `Approved-screenshots-of-the-settings-at-1024-px-in-the-{light,dark}-theme.png` files (chromium and mobile-chrome) are unchanged since `02d95d8`. The light chromium one shows Theme, Hour format, View, Timezone label and Language, with no Colouring row. They still pass only because `toHaveScreenshot` allows `maxDiffPixelRatio: 0.025` (`playwright.bdd.config.ts:62`), and `--update-snapshots` by default rewrites only failing baselines.
- Impact: A ticked task is not done and a spec requirement is not met. The 1024 px baselines record a page without the new group, so a regression that drops or breaks the colouring group at 1024 px stays within tolerance and is not caught. NFR-R2 is only half delivered.
- Fix: From `packages/client`, run `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts src/test/features/settings/settings_e2e.feature --grep "Approved screenshots of the settings" --update-snapshots=all` once. Read the four new 1024 px PNGs and confirm the Colouring row with Time of day checked follows View and no working hours row is shown. Then run the same command again without the flag.
- Fix risk: `--update-snapshots=all` also rewrites the 375 px baselines of that scenario. They should come out pixel-identical, but read them to make sure. The scope stays limited to that one outline, so no other baseline changes.
- Status: open

### R2 — WARNING — Confirming the working hours with Enter drops keyboard focus to the page body
- Location: `packages/client/src/app/settings/WorkingHoursGroup.tsx:42`
- Rule: `—` (WCAG 2.4.3 Focus Order; NFR-A2 of add-day-colouring-setting covers the fields' keyboard use)
- Problem: `WorkingHoursGroup` renders `<WorkingHoursRow key={`${start}|${end}|${preferences.hourFormat}`} />`, and `WorkingHoursRow` renders `<SettingsTimeRangeGroup key={savedCount} …/>` (`:56`), bumping `savedCount` on every `SAVED` outcome (`:70`). When the user types `9:07` in "Start of working hours" and presses Enter, `onConfirm` (`SettingsTimeRangeGroup.tsx:74`) saves, both keys change, and React unmounts both `<input>` elements and mounts new ones. The focused element is removed, so focus falls to `document.body`. No code restores it: the only `.focus()` calls in `src/app/settings` are in `InterfaceLanguageGroup` and `SettingsPage` (heading on open).
- Impact: After every successful Enter, a keyboard or screen-reader user loses their place. The next Tab starts from the top of the page instead of moving to the end field, and the screen reader announces nothing about where focus went. No test catches it: `WorkingHoursGroup.test.tsx` and `settings_day_colouring_e2e.feature` never check focus after a saved Enter.
- Fix: Reset the typed texts without remounting. In `SettingsTimeRangeGroup`, keep the last given `startText`/`endText` in state and reset `typedStart`/`typedEnd` during render when the given texts change (React's "adjusting state when a prop changes" pattern). Let `onConfirm` return whether the pair was accepted, and reset the typed texts to the given ones when it was, so an equivalent entry such as `9:00` → `09:00` with an unchanged store still shows canonical text (UX5). In `WorkingHoursGroup`, drop `savedCount` and the inner `key`. Replace the outer `key` with a reset of `refusal` when the stored range or hour format changes. Add a `WorkingHoursGroup.test.tsx` case asserting that the start field still has focus after `9:07{Enter}`. Add a step "the field "Start of working hours" keeps the focus" to the existing Enter scenario in `settings_day_colouring_e2e.feature`, where `bdd-unit.md` puts focus management.
- Fix risk: The current remount also covers "a change from another tab or a new hour format resets the texts" (`WorkingHoursGroup.test.tsx`, "Another tab changes the working hours"), so the prop-change reset must keep that behaviour and also clear the hint. `SettingsTimeRangeGroup`'s `onConfirm` signature changes, but it has no other caller yet. The Esc and blur paths are unchanged.
- Status: open

### R3 — WARNING — `formatWorkingHoursTime` re-implements `formatWallClockTime`
- Location: `packages/client/src/presenter/workingHours.ts:19`
- Rule: `.claude/rules/antipatterns.md` ("Second owner of a concept"), `.claude/rules/glossary.md` ("Do not write a new function … for the same concept")
- Problem: `formatWorkingHoursTime` places a wall time on the epoch date in UTC and formats it with `getDateTimeFormatter(language, UTC_ZONE_ID, DateTimeLabelKind.LOCAL_TIME, hourFormat)`. `formatWallClockTime(time: Temporal.PlainTime, language, hourFormat)` in `src/presenter/localDateTime.ts:51-62` already does exactly that. Its doc says "A requested wall-clock time in the hour format … read as milliseconds since midnight through the cached UTC formatter". It is the owner used by `wallTimeHint.ts`, `clockChangeNote.ts` and `dateBar.ts`.
- Impact: The project now has two formatters for a wall-clock time in the hour format. A future change to how wall times are written, such as a marker or a separator, would reach the hint, the date bar and the clock-change note but not the working hours fields. The fields could then show a text the wall-time hint writes differently, breaking FR5's "same texts as the wall-time input".
- Fix: Keep the design-named `formatWorkingHoursTime` (D5), but make its body `return formatWallClockTime(Temporal.PlainTime.from(wallTime), language, hourFormat);`. Drop the `EPOCH_DATE` constant and the direct `getDateTimeFormatter` import. The existing `workingHours.test.ts` cases, including "build no formatter on a repeated call", stay as they are.
- Fix risk: None found. Both paths use the same cached UTC `LOCAL_TIME` formatter on the same milliseconds since midnight, so the output texts are identical. `formatWallClockTime` drops seconds, which canonical `HH:MM` never has.
- Status: open

### R4 — WARNING — New `workingTime.ts` and its test exceed the 200-line file limit
- Location: `packages/client/src/model/workingTime.ts:1`
- Rule: `CLAUDE.md` ("Files must stay under 200 lines for AI context quality"), `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity")
- Problem: The new production file `src/model/workingTime.ts` is 276 lines, and its new test `src/model/workingTime.test.ts` is 294. The file has a clean seam: the span computation (`getLocalDates`, `clip`, `getSpansWithOneOffset`, `getSpansAcrossOffsetChanges`, lines 55–162) is separate from the public rule, the memo and the stop/flag builders (lines 29–53 and 164–276). Splitting would not hurt clarity. Other new files are also over 200: `settings_day_colouring_e2e.steps.ts` (272), `settings_day_colouring_storage.steps.tsx` (263) and `dayColouringSettingsWorld.tsx` (218).
- Impact: This breaks a `CLAUDE.md` rule on the central new model file. The test is 6 lines from the hard cap, so the next case added for this owner (for example the full-day-span mutant noted under Mutation) would break the cap.
- Fix: Move the span computation into a new `src/model/workingTimeSpans.ts`, exporting `computeWorkingTimeSpans(timeZoneId, day, workingHours, clockChanges)`, and have `workingTime.ts` import it within the same module. `src/model/index.ts` keeps exporting only from `./workingTime`. Split `workingTime.test.ts` the same way into `workingTime.spans.test.ts` (spans and stops) and `workingTime.test.ts` (days, `isWorkingTime`, flags, memoization).
- Fix risk: This is a pure move with no behaviour change. The memo stays in `workingTime.ts`, so the identity tests are unaffected. Imports between files inside `src/model/` are allowed, since the rule restricts imports from sibling modules, not from files within one module. Re-run `npx vitest run src/model/workingTime.test.ts` and the new test file one at a time.
- Status: open

### R5 — SUGGESTION — Traceability comments in `views/shared/index.ts` now label the wrong exports
- Location: `packages/client/src/views/shared/index.ts:19`
- Rule: `.claude/rules/traceability.md`
- Problem: The branch replaced the `DAY_PERIOD_COLOR_VARIABLES` export with `DAY_COLOUR_FOREGROUND_CLASS_NAMES`/`DAY_COLOUR_VARIABLES` at lines 4–7 with no comment. The two comments that described the old export ("Implements FR2 of show-here-entry-for-device-time", "Implements FR1, FR4, FR12 of add-grid-hour-cells-and-hour-frame") moved to lines 19–20, above `getTypedTimeFieldText`, which those changes did not add.
- Impact: The traceability grep from task 10.3 attributes `getTypedTimeFieldText` to two unrelated changes and finds no link on the day colour exports in this index.
- Fix: Put `// Implements FR9, FR10, NFR-A3 of add-day-colouring-setting (D4).` above the `DAY_COLOUR_*` export, and delete the two misplaced comments above `getTypedTimeFieldText`, leaving its own `add-day-colouring-setting` line.
- Fix risk: none
- Status: open

## Verdict

Not ready. R1 (CRITICAL) blocks: task 9.4 and the "Approved screenshots" requirement are not done at 1024 px. R2, R3 and R4 are WARNINGs that should be fixed in the same round. R5 is optional.
