# Specs review: redesign-cards-grid-and-day-palettes

## Summary

| Item | Value |
|---|---|
| Stale claims | 3 |
| Requirements fully covered | 47/54 |
| Contradictions | 3 |
| CRITICAL | 0 |
| WARNING | 5 |
| SUGGESTION | 3 |

## Freshness

- ✅ `packages/client/src/styles/tokens.css` repeats every dark value twice: `:root[data-theme="dark"]` (line 37) and `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` (lines 63–64); `src/styles/tokens.test.ts` reads both blocks (lines 12–13, 176–192) — design D1.
- ✅ Muted is today's palette: light `#a3afd3 #f8cbbe #f8e6a6 #d4c6ee` and dark `#56679a #e0b1a4 #eedba3 #b9aadb` (`tokens.css:20-23`, `47-50`); `--color-hour-cell-foreground` already exists (`tokens.css:26`, `53`) and `DAY_COLOUR_FOREGROUND_CLASS_NAMES` gives night `text-foreground` and morning/day/evening `text-hour-cell-foreground` (`src/views/shared/dayTrackGradient.ts:27-35`) — D1, D2.
- ✅ `useThemePreference` writes `data-theme` in a layout effect and deletes it for System (`src/controller/useThemePreference.ts:12-23`); `AppShell` calls it — D1, D2.
- ✅ `scripts/legacyCss/expandInsetShorthand.mjs` + `.d.mts` exist and are registered in `postcss.config.js`; their test lives in `src/test/legacyBuild/expandInsetShorthand.test.ts` — D1, task 2.1.
- ✅ `PREFERENCES_SCHEMA_VERSION = 6` (`src/constants/preferences.ts:10`); `createPreferencesMigrations` holds steps 1–5 and `serializePreferencesDocument` writes the payload field by field (`src/adapters/preferencesDocument.ts`) — D2.
- ✅ Nothing of the day palette exists yet: `DayPalette` / `dayPalette` appear nowhere under `src/`, and no archived change builds it.
- ✅ `SettingsOption` is `{ value, label, Icon?, pictogram? }` (`src/app/settings/SettingsOptionGroup.tsx:9-16`); `WorkingHoursGroup` and `DayColouringGroup` are rendered by `SettingsPage` — D3.
- ✅ `MainPage` has the three-column header with `border-b border-border` (`src/app/MainPage.tsx:17`), a centred `h1` (line 56), the `max-w-screen-2xl` wrapper (line 46) and a `sticky bottom-0 -mx-4 border-t border-border bg-surface` footer (line 68); `SettingsButton` imports `SlidersHorizontal` and `AddLocationButton` carries `order-1 col-start-1` — D4.
- ❌ D4 says the footer "spans the viewport width (negative margins as today)". Today the footer, like the meeting header (`MEETING_HEADER_CLASS_NAMES`, `MainPage.tsx:20`, `-mx-4`), lies inside the page wrapper (`MainPage.tsx:46`). Its `-mx-4` only widens it by the wrapper padding. Once D4 turns the wrapper into `max-w-content` (1120 px), the footer and the meeting bar are 1152 px wide, not the viewport width (R1).
- ✅ The one-row card classes exist: `place: "md:w-64 md:flex-none"`, `dateTime: "… md:w-44"` (`src/views/shared/locationRowVariant.ts:62-64`), and the track is `md:basis-0 md:flex-1` (`src/views/shared/DayTrack.tsx:82`) — D5.
- ✅ `LOCATION_MARK_ICONS` maps `HERE` to a filled `Navigation` and `HOME` to a custom house node (`src/views/shared/LocationMarkIcon.tsx:5`, `17-23`, `43`). `locations.hereMarkCaption` is the caption key in `src/presenter/locationMark.ts:29` and in both locales — D7.
- ✅ `presentZoneLine` takes `placeText` and `isDeviceTimeMeta` (`src/presenter/zoneLine.ts:31-60`); `UTC_ZONE_ID` exists — D7.
- ✅ `getDayPeriodMarkers` is exported from `@/presenter` and used by `useWallTimeInput`. `formatLocalTime` uses the cached `getDateTimeFormatter` (`src/presenter/localDateTime.ts:9-21`) — D5.
- ✅ `REORDER_POINTER_ACTIVATION_DISTANCE_PX = 4`, `REORDER_TOUCH_ACTIVATION_DELAY_MS = 250`, `REORDER_TOUCH_ACTIVATION_TOLERANCE_PX = 5` (`src/constants/reorder.ts:7,19,22`). `LocationList` picks Pointer or Touch sensor by engine and adds `KeyboardSensor` (`src/views/shared/LocationList.tsx:41-44`, `111-116`) — D6.
- ✅ `useReorderAnnouncements` returns `screenReaderInstructions` (`useReorderAnnouncements.ts:55-58`). `locations.reorderMovedOver` reads "{{city}} moved to position {{position}} of {{total}}", and `moveLocation`, `reorderRoleDescription` and `reorderInstructions` exist (`src/locales/en.json:71-79`) — D6.
- ✅ `LocationMenuItem` is `{ label, onSelect }` (no per-item disabled state; the menu-level `isDisabled` prop is separate, `LocationMenu.tsx:16-27`). `useLocationMenuItems(row, onSetHome, onRemove)` returns the home action and Remove (`useLocationMenuItems.ts:10-33`); `MOVE_LOCATION` exists in the model — D6.
- ❌ D6 says `ViewLocationList` returns focus to the moved row's menu button "through the existing `menuButtons` refs". `menuButtons` is a private `useRef` inside `LocationList` (`src/views/shared/LocationList.tsx:105`, `156`), and `ViewLocationList` cannot reach it (R6).
- ✅ `HOUR_CELL_GAP_PX = 2` and `NARROW_VISIBLE_HOUR_CELLS = 9`, `NARROW_HOUR_CELL_MIN_PX = 36`, `NARROW_HOUR_CELL_MAX_PX = 40` (`src/constants/grid.ts:7-11`); `MIN_FITTING_HOUR_CELL_PX` exists, and the `getHourCellLayout` pitch includes the gap (`src/views/grid/hourCellLayout.ts:11`) — D5.
- ✅ `NOW_ICON_SIZE_PX = 16` is a local constant in `src/views/shared/DateBar.tsx:7`; Now is `rounded-full bg-accent` (line 69) — D8.
- ✅ The legacy support installs `ResizeObserver` (`src/lib/legacy/needsLegacySupport.ts:13`), and `useHourStripScroll` uses it — D5.
- ✅ The seed helpers `src/test/features/settings/steps/settingsE2eHelpers.ts` and `src/test/features/locations/steps/locationsSeedHelpers.ts` exist. So do the features the tasks rewrite: `time_selection_layout_e2e`, `time_selection_card_layout_e2e`, `main_page_header_e2e`, `date_selection_layout_e2e`, `locations_reorder_e2e`, `locations_reorder_legacy_touch_e2e`, `locations_zone_line_e2e`, `day_colouring_budget`, `main_page_grid_view_e2e`, `grid_view_*`. `DragHandle.tsx` and its test exist too — D9, tasks.
- ✅ Every requirement the deltas mark MODIFIED or REMOVED exists under the same name in `openspec/specs/<capability>/spec.md` (50 names checked, exact heading match), and no ADDED name already exists there.
- ❌ Task 11.7 treats "the entry script that `dist/index.html` loads" as the initial JavaScript. The entry is `src/boot.ts` (`index.html:12`), which loads `./main` lazily (`boot.ts:20`). The build adds `modulepreload` links for the main chunk (`scripts/legacyBoot/addMainChunkPreloads.ts`), and the bundle check counts entry plus modulepreloads as initial (`scripts/bundle/initialScripts.ts`, `collectInitialScriptUrls`) (R3).

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ settings "Settings page layout", main-page "Grid view rows", locations "Narrow card layout" | ✅ 2.3, 2.4 |
| FR2 | ✅ | ❌ no requirement or scenario says the dark values are written once (R5) | ✅ 2.1–2.4 |
| FR3 | ✅ | ✅ settings "Day palette is kept on the device" | ✅ 3.1–3.3 |
| FR4 | ✅ | ✅ day-colouring "Day palette", "Day colours are readable" | ✅ 4.1–4.5 |
| FR5 | ✅ | ✅ settings "Colours group", "Option group" | ✅ 5.1–5.4 |
| FR6 | ✅ | ✅ main-page "Header actions" | ✅ 6.1–6.3 |
| FR7 | ✅ | ✅ locations "Narrow card layout" | ✅ 9.1–9.3 |
| FR8 | ✅ | ✅ locations "Card growth" | ✅ 7.1, 9.3 |
| FR9 | ✅ | ✅ locations "Zone line layout" | ✅ 8.1–8.3 |
| FR10 | ✅ | ✅ home-location "Home mark", locations "Here mark on location rows" | ✅ 7.1–7.3, 9.3 |
| FR11 | ✅ | ✅ locations "Wide card layout" | ✅ 9.1–9.4 |
| FR12 | ✅ | ✅ main-page "Content column" (D4 does not meet it, R1) | ✅ 6.2, 6.3 |
| FR13 | ✅ | ✅ time-selection "Day track layout" | ✅ 9.1, 9.4 |
| FR14 | ✅ | ✅ date-selection "Date bar layout" | ✅ 10.1–10.3 |
| FR15 | ✅ | ✅ locations "Reorder cards by dragging" | ✅ 11.3–11.6 |
| FR16 | ✅ | ✅ locations "Move a location from its location menu" | ✅ 11.1, 11.2, 11.5 |
| FR17 | ✅ | ✅ grid-view "Hour cell look", main-page "Grid view rows" | ✅ 12.1–12.3 |
| FR18 | ✅ | ✅ locations "Device time location layout" | ✅ 7.1, 7.3, 9.3 |
| FR19 | ✅ | ✅ locations "Zone line on location rows" | ✅ 7.1–7.3 |
| FR20 | ✅ | ✅ time-selection "Earlier layout defects stay fixed" | ✅ 13.1 |
| FR21 | ✅ | ✅ time-selection "Earlier layout defects stay fixed" | ✅ 13.1 |
| FR22 | ✅ | ✅ time-selection "Earlier layout defects stay fixed" | ✅ 13.1 |
| FR23 | ✅ | ✅ time-selection "Earlier layout defects stay fixed" | ✅ 13.1 |
| FR24 | ✅ | ✅ time-selection "Earlier layout defects stay fixed" | ✅ 13.1 |
| FR25 | ✅ | ❌ documentation-only requirement; no capability describes docs, and tasks verify it by grep (no finding) | ✅ 1.1–1.3, 14.1 |
| NFR-P1 | ✅ | ❌ no delta scenario for the palette switch or the 12-hour formatter bound (R5) | ✅ 4.4, 7.4 |
| NFR-P2 | ✅ | ✅ locations "Reorder stays out of the initial bundle" | ❌ 11.7 checks only the boot entry (R3) |
| NFR-A1 | ✅ | ✅ day-colouring "No violations for every theme and palette", settings "Accessible Colours group" | ✅ 5.4, 13.2 |
| NFR-A2 | ✅ | ✅ day-colouring "Day colours are readable", date-selection "Date bar layout" | ✅ 2.3, 4.3 |
| NFR-A3 | ✅ | ✅ settings "Accessible Colours group", locations "Reorder is accessible and fits every screen" | ✅ 5.1, 5.4, 6.3, 11.1, 11.6 |
| NFR-R1 | ✅ | ✅ main-page "Grid view rows", time-selection "Day track layout", settings "Settings page layout" | ✅ 13.3 |
| NFR-R2 | ✅ | ✅ approved-screenshot scenarios of main-page, day-colouring, settings | ❌ 13.4 misses `settings_language_e2e.feature` (R2) |
| UX1 | ✅ | ✅ screenshot scenarios "re-taken once for the redesign" | ✅ 15.4 (handoff H1) |
| UX2 | ✅ | ✅ settings "Colouring settings layout" | ✅ 5.4 |
| UX3 | ✅ | ✅ locations "Smooth reorder transitions" | ✅ 11.6 |
| UX4 | ✅ | ✅ main-page "Content column" | ✅ 6.3 |
| M1 | ✅ | n/a | ✅ 5.4, 13.2 |
| M2 | ✅ | n/a | ✅ 13.3 |
| M3 | ✅ | n/a | ✅ 13.1 |
| M4 | ✅ | n/a | ✅ 2.3 |
| M5 | ✅ | n/a | ❌ no Stryker run for the preferences, adapter and controller files (R4) |
| M6 | ✅ | n/a | ✅ 15.3, 11.5 |
| M7 | ✅ | n/a | ✅ 15.3 (leaves out UX1, R7) |
| G1 | ✅ | n/a — met by FR1–FR19, NFR-R2, UX1 | n/a — via those ids' tasks |
| G2 | ✅ | n/a — met by FR1, FR2, M4 | n/a — via 2.3, 2.4, 4.2 |
| G3 | ✅ | n/a — met by FR15, FR16 | n/a — via 11.x |
| G4 | ✅ | n/a — met by FR20–FR24, M3 | n/a — via 13.1 |
| NG1 | ✅ | n/a | n/a — no artifact changes search, calendar, meeting range or states beyond tokens |
| NG2 | ✅ | n/a | n/a — font, other groups and date writing untouched |
| NG3 | ✅ | n/a | n/a — day periods, reference day and handle positions untouched; only the cell gap constant moves |
| NG4 | ✅ | n/a | n/a — no editing UI, no third palette |
| NG5 | ✅ | n/a | ❌ D4 narrows the meeting bar's background to the 1120 px column (R1) |
| Q1 | ✅ | n/a | n/a — answered in design D7 |
| Q2 | ✅ | n/a | n/a — left open on purpose (owner, §13) |

## Consistency

- `design.md:55-57` (D4) puts the whole page in a `max-w-content` wrapper and keeps the footer at "negative margins as today". Three sources say the bars stay full width: `specs/main-page/spec.md:4` ("The date bar keeps the page background across the whole viewport width"), `proposal.md` NG5 ("No change to the meeting bar"), and the screen `docs/design/redesign/screens/grid-desktop-meeting-light.html:139,170`, where the meeting bar lies outside `.column`. With the D4 wrapper, both bars are clipped to 1152 px.
- `proposal.md` M7 says "Every FR, NFR and UX id of this proposal is referenced by at least one test or feature file". `tasks.md:106` (task 15.3) checks only UX2–UX4 and says "UX1 is covered by H1".
- Three scenario titles contradict their bodies and the design. `specs/time-selection/spec.md:85` "Track beside the time on a wide screen" has a body that puts the track on its own line. `specs/home-location/spec.md:34` "The Here mark stays filled next to the house" conflicts with `design.md:93` (D7: `MapPin`, outline, `fill="none"`). `specs/locations/spec.md:315` "Icon before the city, caption after it" has a body that says no caption.

## Findings

### R1 — WARNING — The content column wrapper narrows the meeting bar and the date bar
- Location: `openspec/changes/redesign-cards-grid-and-day-palettes/design.md:55-57`
- Rule: `—` (proposal NG5, `specs/main-page/spec.md:4`)
- Problem: D4 changes the page wrapper (`MainPage.tsx:46`, today `max-w-screen-2xl`) to `max-w-content` (1120 px). It also says the footer "spans the viewport width (negative margins as today)". Both the footer (`MainPage.tsx:68`) and the meeting bar (`MEETING_HEADER_CLASS_NAMES`, `MainPage.tsx:20`) sit inside that wrapper, and their `-mx-4` only covers the wrapper's 16 px padding. With D4 as written, both bars are 1152 px wide at 1440 px. Today they span the full 1440 px viewport. The redesign screen `grid-desktop-meeting-light.html` draws the meeting bar outside the column, across the screen.
- Impact: At every width above 1152 px, the green meeting bar becomes a centred strip with page background on both sides. That breaks NG5 ("No change to the meeting bar"), spec §4 ("The meeting bar keeps its built layout") and the meeting screens. The date bar fails the main-page "Content column" sentence "keeps the page background across the whole viewport width". No scenario checks either width, so the drift reaches the re-approved meeting screenshots unnoticed.
- Fix: In D4, make the outer wrapper full width (`min-h-dvh w-full flex flex-col`, no max width). Put `mx-auto w-full max-w-content px-4` on three inner elements: the header's title and actions row, `main`, and the footer's inner group. The meeting header and the footer then keep their full-width backgrounds. Correct the sentence about negative margins to match. Add to the main-page "Content column" requirement a scenario "The bars span the viewport": at 1440 px, the date bar and (in Grid, with a meeting range) the meeting bar are as wide as the viewport, within 1 px. List that scenario in task 6.3.
- Fix risk: The header row and the list must keep the same side padding so the title still lines up with the cards. The existing "The column is centred on a wide screen" scenario of task 6.3 already checks that. Nothing else changes.
- Status: fixed
- Resolution: design.md D4 now keeps the outer wrapper full width and puts `mx-auto w-full max-w-content px-4` on the header row, `main` and the footer inner group, so the meeting header and the footer span the viewport (their `-mx-4` goes). specs/main-page/spec.md "Content column" says the meeting bar keeps its background across the viewport and gains the scenario "The bars span the viewport" (1440 px, Grid with a meeting range); task 6.3 lists it.

### R2 — WARNING — Task 13.4 leaves the settings language screenshots out of the re-take
- Location: `openspec/changes/redesign-cards-grid-and-day-palettes/tasks.md:96`
- Rule: `.claude/rules/test-planning.md`
- Problem: Task 13.4 lists the features whose baselines are re-taken. It leaves out `src/test/features/settings/settings_language_e2e.feature`, which owns the baselines `Approved-language-screenshots-in-the-{light,dark}-theme-with-the-list-{collapsed,expanded}.png` (chromium and mobile-chrome). Those screens show the settings page, which takes new values for the foreground (`#18181b` → `#1c1c20`), the dark background, surface, foreground and muted foreground, and the control border tokens (FR1).
- Impact: The language screenshot scenarios fail on the next full E2E run (CI), and the implement stage does not see it, because tasks 15.1 and 15.2 run no E2E outside the view-contract projects.
- Fix: Add `settings_language_e2e.feature` ("Approved language screenshots") to the list of task 13.4. Also extend its Verify with a guard: every feature from `grep -rl "screenshot" src/test/features --include=*_e2e.feature` was run without `--update-snapshots` and passed.
- Fix risk: none (one more feature to re-take and run, one command at a time).
- Status: fixed
- Resolution: task 13.4 now re-takes `settings_language_e2e.feature` ("Approved language screenshots") and its Verify adds a guard: every feature from `grep -rl "screenshot" src/test/features --include=*_e2e.feature` is run without `--update-snapshots`, one at a time, and passes.

### R3 — WARNING — The NFR-P2 bundle check inspects only the boot entry
- Location: `openspec/changes/redesign-cards-grid-and-day-palettes/tasks.md:81`
- Rule: `.claude/rules/test-planning.md`
- Problem: Task 11.7 checks "no drag-and-drop code in the initial JavaScript" by grepping the first `src="….js"` of `dist/index.html`. That script is the `src/boot.ts` entry, which loads `./main` with a dynamic import. The build adds `<link rel="modulepreload">` for the main chunk (`scripts/legacyBoot/addMainChunkPreloads.ts`), and the project counts entry plus modulepreloads as initial (`scripts/bundle/initialScripts.ts`, `collectInitialScriptUrls`). The grep never reads the preloaded main chunk.
- Impact: Suppose the new `MouseSensor`/`TouchSensor` wiring or a `views/shared` re-export pulls dnd-kit into the main chunk. The check still prints 0 and NFR-P2 and the locations scenario "Reorder stays out of the initial bundle" pass while being false. No other test covers this scenario today.
- Fix: Change the Verify of 11.7 to check every initial script. Take every `src="…js"` and every `rel="modulepreload"` `href` of `dist/index.html`, the same set `collectInitialScriptUrls` returns. Each such file under `dist/` must give `grep -c DndDescribedBy` = 0, and `grep -rl DndDescribedBy dist/assets` must still find a lazy chunk.
- Fix risk: If dnd-kit really is in a preloaded chunk today, the task now fails and the implement stage must move the import behind the lazy views. That is the behaviour NFR-P2 asks for.
- Status: fixed
- Resolution: task 11.7 now checks every initial script, the set `collectInitialScriptUrls` (`scripts/bundle/initialScripts.ts`) returns: the module script plus every `rel="modulepreload"` href of `dist/index.html`; each must give `grep -c DndDescribedBy` = 0 (at least two files checked), and the lazy-chunk sanity check stays.

### R4 — WARNING — M5 has no mutation run for the preferences, the adapter and the controller
- Location: `openspec/changes/redesign-cards-grid-and-day-palettes/tasks.md:19-27`
- Rule: `.claude/rules/tdd-workflow.md` (Step 5 — Mutate), proposal M5
- Problem: M5 asks for a mutation score of at least 95 % "on each new or changed model, presenter and controller file". Sections 3 and 4 change `src/preferences/preferences.ts`, `preferencesCommands.ts`, `parseStoredPreferences.ts` and `src/adapters/preferencesDocument.ts` (migration step 6, serialization), and add `src/controller/useDayPalettePreference.ts`. They also change `PreferencesProvider.tsx`. None of these files is in a Stryker task: the runs at 7.5, 9.5, 11.8 and 12.4 cover only presenter, view and grid files.
- Impact: The migration that sets `dayPalette` to `VIVID` and the validation that rejects an unknown palette are the persistence-critical code of FR3. They ship without the mutation check that M5 and `tdd-workflow.md` require, so M5 cannot be reported as met.
- Fix: Add a task after 4.3: "4.6 Mutation (M5): `cd packages/client && npx stryker run --mutate 'src/preferences/preferencesCommands.ts,src/preferences/parseStoredPreferences.ts,src/adapters/preferencesDocument.ts,src/controller/useDayPalettePreference.ts,src/controller/PreferencesProvider.tsx'`, score ≥ 95 % (minimum 90 %)." That is 5 files, within the CLAUDE.md limit.
- Fix risk: none (one more scoped run, within the 5-file limit).
- Status: fixed
- Resolution: new task 4.6 runs scoped Stryker on `preferences.ts`, `preferencesCommands.ts`, `parseStoredPreferences.ts`, `adapters/preferencesDocument.ts`, `controller/useDayPalettePreference.ts` (5 files), then separately on `controller/PreferencesProvider.tsx`, target ≥ 95 % (min 90 %, M5).

### R5 — WARNING — FR2 and NFR-P1 have no scenario in any delta spec
- Location: `openspec/changes/redesign-cards-grid-and-day-palettes/proposal.md:73` (FR2), `proposal.md:102` (NFR-P1)
- Rule: `.claude/rules/traceability.md` ("For every FR/NFR/UX in `proposal.md`, at least one implementing entity must exist"), `.claude/rules/delta-specs.md`
- Problem: FR2 has no requirement or scenario in `specs/`: the dark values are written once and serve both the Dark preference and the system dark theme, and no colour value lives in a component. NFR-P1 is the same. The bounds it adds (a day palette change re-presents no colour stops and builds no formatter; 50 rows in the 12-hour format with the day period marker build no formatter) are planned only as Gherkin in tasks 4.4 and 7.4 ("Changing the day palette re-presents no colour stops", "Presenting 50 rows again in the 12-hour format builds no formatter"). Neither appears in a delta spec. No delta carries `FR2` or `NFR-P1` of this change.
- Impact: At archive, the stable specs lose two rules this change introduces. Nothing in `openspec/specs/` then stops a later change from re-adding a second dark block or a palette switch that re-presents rows. The feature scenarios of 4.4 and 7.4 also trace to no spec requirement, which `traceability.md` treats as a missing link.
- Fix: (a) Add an ADDED requirement "Colour tokens are defined once" to `specs/settings/spec.md` (the theme's capability), tagged `FR2, M4`. It needs two scenarios: "Each colour is one value" (the token source declares the dark values in one block and no colour twice) and "The system dark theme uses the same values" (with Theme System and a dark system, the page background is `#0b1628`). Name it on the `settings` line of "Modified Capabilities". (b) Add the scenario "Changing the day palette re-presents nothing" to `specs/day-colouring/spec.md` "Day palette". Add the scenario "Presenting 50 rows again in the 12-hour format builds no formatter" to `specs/locations/spec.md` "Card growth" (the day period marker). Tag both requirements' implements comments with `NFR-P1`.
- Fix risk: The capability list in `proposal.md` and the task 2.3/4.4/7.4 texts must name the new scenarios. Placement still follows `bdd-unit.md`: the token-source and work-bound scenarios are unit, the system-theme one is E2E.
- Status: fixed
- Resolution: specs/settings/spec.md adds the requirement "Colour tokens are defined once" (FR2, M4) with "Each colour is one value" (unit, task 2.3) and "The system dark theme uses the same values" (E2E, new task 2.5 in settings_e2e.feature); proposal "Modified Capabilities" names it. specs/day-colouring "Day palette" gains "Changing the day palette re-presents nothing" and specs/locations "Card growth" gains "Presenting 50 rows again in the 12-hour format builds no formatter", both requirements now tagged NFR-P1; tasks 4.4 and 7.4 name these scenarios.

### R6 — SUGGESTION — D6 points focus handling at refs ViewLocationList does not own
- Location: `openspec/changes/redesign-cards-grid-and-day-palettes/design.md:81`
- Rule: `—`
- Problem: D6 has `ViewLocationList` own `onMoveByStep` and return focus "through the existing `menuButtons` refs". Those refs are a private `useRef` of `LocationList` (`src/views/shared/LocationList.tsx:105`, filled at line 156). Task 11.1 also expects the focus assertion in `ViewLocationList.test.tsx`.
- Impact: The implementer must restructure on the fly: lift the refs, or handle the step move inside `LocationList` next to `handleRemove`, which already focuses through them. The design does not say which.
- Fix: In D6, have `LocationList` turn a step move into `onMove(id, rowIndex ± 1)` and focus `menuButtons.current[targetIndex]` after the rows change, the same way `focusIndexAfterRemoval` works. `ViewLocationList` only sets the polite announcement. Point the focus assertion of task 11.1 at `LocationList.menu.test.tsx`.
- Fix risk: none.
- Status: fixed
- Resolution: design.md D6 now has `LocationList`, which owns the `menuButtons` refs, turn a step move into `onMove(id, rowIndex ± 1)` and focus the target menu button after the rows change (as `focusIndexAfterRemoval` does); `ViewLocationList` only sets the announcement. Task 11.1 puts the focus assertion in `LocationList.menu.test.tsx` and keeps the announcement in `ViewLocationList.test.tsx`.

### R7 — SUGGESTION — M7 counts UX1, which task 15.3 leaves to a human
- Location: `openspec/changes/redesign-cards-grid-and-day-palettes/proposal.md:156`, `tasks.md:106`
- Rule: `—`
- Problem: M7 requires every FR, NFR and UX id to be referenced by a test or a feature file. Task 15.3 checks only UX2–UX4, because UX1 is the manual comparison of handoff H1.
- Impact: As written, M7 can never be reported as met, and the archive reports a failed metric.
- Fix: Reword M7 as "Every FR, NFR and UX id except UX1 (handoff H1) …".
- Fix risk: none.
- Status: fixed
- Resolution: proposal.md M7 now reads "Every FR, NFR and UX id of this proposal except UX1 (the human visual comparison, handoff H1) …", matching task 15.3.

### R8 — SUGGESTION — Three scenario titles describe the removed design
- Location: `specs/time-selection/spec.md:85`, `specs/home-location/spec.md:34`, `specs/locations/spec.md:315`
- Rule: `.claude/rules/gherkin.md`
- Problem: "Track beside the time on a wide screen" has a body that puts the track on its own line. "The Here mark stays filled next to the house" conflicts with D7, which makes the map pin an outline. "Icon before the city, caption after it" has a body that says no caption.
- Impact: Tasks 9.3 and 9.4 copy these titles into the feature files. The archived specs and the features then name a layout, a filled mark and a caption that no longer exist.
- Fix: Rename them to "Track on its own line on a wide screen", "The Here mark next to the house" and "Icon before the city, no caption". Update the scenario names quoted in tasks 9.3 and 9.4.
- Fix risk: none.
- Status: rejected (harmful)
- Resolution: renaming the three titles makes `openspec validate --strict` fail: a MODIFIED block must keep every scenario name of the stable spec ("MODIFIED "Home mark" omits scenario(s) the current spec still has: "The Here mark stays filled next to the house" … archive refuses to drop them"), same for "Day track layout" and "Here mark on location rows". The bodies already state the new layout (own line, outline map pin, no caption), so the old titles stay as stable ids; the rename was tried and reverted.

## Verdict

Needs revision, with no CRITICAL findings. Fix the WARNINGs R1–R5 before implementation:
- R1 changes the page structure and protects NG5.
- R2 and R3 are tests that would fail or prove nothing.
- R4 and R5 are traceability and quality gaps.

R6–R8 are polish.
