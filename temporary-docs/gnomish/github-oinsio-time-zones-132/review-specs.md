# Specs review: add-day-colouring-setting

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 44/44 |
| Contradictions | 3 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 2 |

## Freshness

Paths are relative to `packages/client/` unless they start with `openspec/` or `docs/`.

- ✅ `DAY_PERIOD_SCHEDULE` / `getDayPeriod` in `src/model/dayPeriods.ts`, `WORK_START_WALL_TIME = "09:00"` in `src/constants/dayPeriods.ts:3` (design.md:9).
- ✅ `getClockChangesAround` is a private helper in `src/model/dayPeriodStops.ts:62`, and `getClockChanges` is exported, memoized per window, from `src/model/clockChange.ts:81` (design.md:48).
- ❌ design.md:48 says `getClockChangesAround` "makes no `getTimeZoneTransition` call", and design.md:58 says "The spans add none". On a cache miss, `getClockChanges` → `searchClockChanges` → `findOffsetTransitions` (`src/model/clockChange.ts:68`) → `getTimeZoneTransition("next")` (`src/model/dayPeriodWindows.ts:56`). The call is memoized and is the same lookup Time of day makes today through `getDayPeriodStops`, so the 2-lookup bound still holds and nothing goes wrong if implemented as written; the wording is wrong but not raised as a finding.
- ✅ `getHourCells` makes one `findOffsetTransitions` call per zone and sets `dayPeriod` from `getDayPeriod(localStart.toPlainTime(), DAY_PERIOD_SCHEDULE)` (`src/model/hourCells.ts:42,61`). `getHourCellStart` and `getHourCellCount` exist (`hourCells.ts:72,114`).
- ✅ The hour strip cache key is day start, day end, reference zone, language and hour format (`src/presenter/hourStrip.ts:111-117`). `DayTrackContext` (`dayTrack.ts:36`), `HourStripContext` (`hourStrip.ts:40`) and `LocationRowsContext` (`presentZoneMoment.ts:23`) exist.
- ✅ `DAY_PERIOD_COLOR_VARIABLES` and `buildDayTrackGradient` are in `src/views/shared/dayTrackGradient.ts`. A single stop gives `linear-gradient(to right, var(...) 0%)` today, a one-stop gradient (design.md:82).
- ✅ `HourCellView` uses `text-foreground` for night and `text-hour-cell-foreground` otherwise. `HourFrame` is `border-2 border-accent` (`src/views/grid/HourFrame.tsx:21`).
- ✅ The handle is `border-2 border-foreground bg-surface` (`src/views/shared/DayTrack.tsx:122`), as design.md:107 says.
- ✅ The tokens match design.md:16 and D6: accent `#2f5bd3`/`#5ec2e8`, accent-foreground `#ffffff`/`#0b1220`, foreground `#18181b`/`#eef2fa`, hour-cell-foreground `#18181b`/`#0f1729`, surface `#ffffff`/`#16213a`, day colours as listed in D6. There are three theme blocks (`src/styles/tokens.css:13-78`).
- ✅ `tokens.test.ts` computes contrast ratios (`:60`) and already checks that the two dark blocks hold the same values (`:110`).
- ✅ The preferences claims hold. `PREFERENCES_SCHEMA_VERSION = 5` (`src/constants/preferences.ts:5`). Migration steps 1–4 are in `src/adapters/preferencesDocument.ts:25-42`. `PreferencesProvider.tsx` is 176 lines. `useHourFormat` and `useZoneLabelParts` exist and are read by `useLocations`/`useHourGrid`.
- ✅ `src/preferences/` imports nothing from `@/`, and `src/constants/preferences.ts:1` imports `@/preferences`. So `DEFAULT_WORKING_HOURS` cannot live in constants (design.md:27), and a type-only `model → preferences` import makes no cycle. No `src/model` file imports `@/preferences` today, which matches "now imports one type" (design.md:171).
- ✅ The settings parts exist: `SettingsOptionGroup`, `SettingsToggleGroup`, `ViewModeGroup` and `ZoneLabelGroup` are in `src/app/settings/`, and `SETTINGS_GROUP_ROW_CLASS_NAME` and `SETTINGS_GROUP_CAPTION_CLASS_NAME` are used by both groups. `ViewModeGroup` is followed by `ZoneLabelGroup` in `SettingsPage.tsx:138-139`.
- ✅ The time-input helpers exist. `parseWallTimeInput` is in `src/presenter/parseWallTimeInput.ts`, `getDayPeriodMarkers` in `src/presenter/dayPeriodMarkers.ts`, `getTypedTimeFieldText` in `src/views/shared/typedTimeFieldText.ts` and `isKeyKeptInField` in `src/views/shared/wallTimeFieldKeys.ts`. `MeetingRangeInputOutcome` is exported from `src/controller/index.ts`. `getDateTimeFormatter` and `DateTimeLabelKind.LOCAL_TIME` are in `src/presenter/dateTimeFormatters.ts`, and `UTC_ZONE_ID` is in `src/constants/search.ts`.
- ✅ `locations.wallTimeInputError` reads "Enter the time as HH:MM" / «Введите время в формате ЧЧ:ММ» (`src/locales/en.json:35`, `ru.json:35`), as UX3 quotes.
- ✅ The test helpers named in tasks exist: `createInMemoryPreferencesRepository`, `createInMemoryPreferencesBackend`, `createLocalStoragePreferencesRepository`, `zoneLabelWorld.tsx`, `startWorkCount` in `src/test/workCounters.ts`, `MAX_TRANSITION_LOOKUPS_PER_ZONE`, `MAX_FORMATTERS_PER_ZONE`, `hourStripBudgetWorld.ts`, `hourCellsWorld.ts`, `hourStrip.bench.ts`, `rowPresenting.bench.ts`, the `bench` script in `package.json:20`, and the "identical key sets" check in `src/locales/locales.test.ts`.
- ✅ The task 6.1 list of `--color-day-working` readers is complete: `tokens.css`, `tailwind.config.ts:58`, `dayTrackGradient.ts:8` with its test, `HourStrip.test.tsx:122`, `themeTokens.ts:18,76`, `grid_view_hour_cells_e2e.steps.ts:48` and `time_selection_labels_e2e.steps.ts:22`.
- ✅ Run today, the task 6.4 verification grep prints 11 lines, as tasks.md:192 says.
- ✅ The e2e targets exist: the outline "Frame crosses every row in the …" in `grid_view_hour_frame_e2e.feature`, "Approved screenshots of the settings at …" in `settings_e2e.feature`, and `src/test/features/view_contract/steps/`.
- ✅ `lucide-react` is `^0.577.0` (`package.json:41`). `node_modules` is absent in this checkout, so the three icon names are checked by the typecheck in task 10.4.
- ✅ The MODIFIED requirements exist as restated, with their scenarios kept. "Day-period colours" is at `openspec/specs/time-selection/spec.md:295`, with 5 scenarios. "Hour cell colour" is at `openspec/specs/grid-view/spec.md:61`, with 2. "Hour frame" is at `grid-view/spec.md:112`, with 6. The only changes are the "working" → "work" rename and the colouring clauses.
- ✅ The docs lines the rename tasks name exist: `docs/glossary/views.md:10` (Cell colouring, planned), `docs/glossary/time-selection.md:14`, `docs/architecture/views.md:36,86`, `docs/architecture/open-questions.md:14` (Q3 "Working hours for day-period colors"), `docs/architecture/domain-model.md:124` and `docs/design/README.md:35`.
- ✅ No part is implemented yet: no `DayColouring` or `workingHours` in `src/`, and no archived change covers it. The only active change is this one (proposal.md:3).

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ settings "Colouring group" | ✅ 8.3, 8.4 |
| FR2 | ✅ | ✅ day-colouring "Day colouring"; settings "…kept on the device" (migration) | ✅ 2.2, 2.3, 7.1 |
| FR3 | ✅ | ✅ settings "Colouring group", "…kept on the device" | ✅ 5.1, 8.4 |
| FR4 | ✅ | ✅ settings "Working hours row" | ✅ 8.3, 8.4 |
| FR5 | ✅ | ✅ settings "Working hours row" | ✅ 4.4, 5.2, 8.4 |
| FR6 | ✅ | ✅ settings "Working hours row" | ✅ 2.1, 5.2, 8.4 |
| FR7 | ✅ | ✅ settings "…kept on the device" | ✅ 2.3, 5.1, 8.4 |
| FR8 | ✅ | ✅ day-colouring "Working time" | ✅ 3.2, 7.1, 7.2 |
| FR9 | ✅ | ✅ day-colouring "Plain day colouring" | ✅ 4.1, 6.2, 7.1, 7.2 |
| FR10 | ✅ | ✅ day-colouring "Working-hours colouring of day tracks" | ✅ 3.2, 6.2, 7.1, 9.2 |
| FR11 | ✅ | ✅ day-colouring "Working-hours colouring of hour cells" | ✅ 3.2, 4.3, 7.2 |
| FR12 | ✅ | ✅ day-colouring "Day colouring in every view" | ✅ 9.3 |
| FR13 | ✅ | ✅ grid-view "Hour frame" | ✅ 4.1, 6.3, 9.2 |
| FR14 | ✅ | ✅ settings "Colouring group", "Time range group" | ✅ 8.2, 8.3 |
| FR15 | ✅ | ✅ settings "Colouring strings are localized" | ✅ 8.1, 8.4 |
| NFR-P1 | ✅ | ✅ day-colouring "Day colouring is fast" | ✅ 7.3 |
| NFR-A1 | ✅ | ✅ settings "Accessible colouring group…" | ✅ 9.1 |
| NFR-A2 | ✅ | ✅ settings "Accessible colouring group…" | ✅ 9.1 |
| NFR-A3 | ✅ | ✅ day-colouring "Day colours are readable" | ✅ 6.1 |
| NFR-A4 | ✅ | ✅ settings "Accessible…"; day-colouring "Day colours are readable" | ✅ 9.1, 9.2 |
| NFR-R1 | ✅ | ✅ settings "Colouring settings layout" | ✅ 9.1 |
| NFR-R2 | ✅ | ✅ day-colouring "Approved screenshots of the colourings"; settings "Colouring settings layout" (see R2) | ✅ 9.2, 9.4 |
| UX1 | ✅ | ✅ settings "Colouring group" | ✅ 8.3, 9.4 (screenshot) |
| UX2 | ✅ | ✅ settings "Time range group", "Colouring settings layout" | ✅ 8.2, 9.1 |
| UX3 | ✅ | ✅ settings "Working hours row" | ✅ 8.3, 8.4 |
| UX4 | ✅ | ✅ day-colouring "Day colours are readable" | ✅ 6.1, 9.2 |
| UX5 | ✅ | ✅ settings "Working hours row" | ✅ 4.4, 8.4 |
| G1 | ✅ | n/a — met by FR1, FR3 | n/a — FR1, FR3 tasks |
| G2 | ✅ | n/a — met by FR8, FR10, FR11 | n/a — FR8, FR10, FR11 tasks |
| G3 | ✅ | n/a — met by FR2, M2 | n/a — FR2, M2 tasks |
| G4 | ✅ | n/a — met by FR14, NFR-R1 | n/a — FR14, NFR-R1 tasks |
| NG1 | ✅ | n/a | n/a — nothing builds holidays |
| NG2 | ✅ | n/a | n/a — `WORKING_WEEKDAYS` is fixed Mon–Fri |
| NG3 | ✅ | n/a | n/a — one `workingHours` for all locations |
| NG4 | ✅ | n/a | n/a — start-before-end is enforced |
| NG5 | ✅ | n/a | n/a — the day-period schedule stays constant |
| NG6 | ✅ | n/a | n/a — the meeting frame, handles, dimming and midnight shade are untouched |
| NG7 | ✅ | n/a | n/a — no legend is built |
| M1 | ✅ | n/a | ✅ 8.4 |
| M2 | ✅ | n/a | ✅ 9.4 |
| M3 | ✅ | n/a | ✅ 7.2 |
| M4 | ✅ | n/a | ✅ 9.1, 9.2 |
| M5 | ✅ | n/a | ✅ 6.1 |
| M6 | ✅ | n/a | ✅ 10.2 |

## Consistency

- Esc in a working hours field conflicts with Esc on the settings page. The change says Esc in a field restores the stored texts (settings delta `specs/settings/spec.md:19,53`; design.md:133-134, through `isKeyKeptInField`, which stops Escape: `src/views/shared/MeetingRangeInput.tsx:74`, `wallTimeFieldKeys.ts:6`). The stable `openspec/specs/settings/spec.md:9` says "The back button and Esc MUST return to the main page …; while the language list is expanded, Esc first collapses it", which is the only exception it allows (R1).
- The ADDED "Colouring settings layout" (`specs/settings/spec.md:154`) re-approves the settings screenshots with the colouring group. The stable "Settings page layout" (`openspec/specs/settings/spec.md:384`), which is left unmodified, lists exactly what those screenshots show and has no colouring group (R2).
- design.md:103-106 (D6) names different digit tokens for the non-working grey by theme: `--color-hour-cell-foreground` in light, `--color-foreground` in dark. design.md:83 (D4) makes `DAY_COLOUR_FOREGROUND_CLASS_NAMES` a `Record<DayColour, string>`, which is one theme-independent class per day colour (R3).

## Findings

### R1 — WARNING — Esc in a working hours field vs Esc leaving the settings page is undecided
- Location: `openspec/changes/add-day-colouring-setting/specs/settings/spec.md:19` (also `:53`), `design.md:133-134`, `tasks.md:212`
- Rule: `.claude/rules/delta-specs.md` (a change to a stable requirement is declared as MODIFIED)
- Problem: The "Working hours row" requirement and D8 say Esc in a field restores the stored texts and removes the hint. D8 also says the group "keeps keys with `isKeyKeptInField`", and `MeetingRangeInput.tsx:74` shows what that means: `if (isKeyKeptInField(event.key)) event.stopPropagation()`, with `ESCAPE` in the set (`wallTimeFieldKeys.ts:6`). The settings page leaves on Esc through a document `keydown` listener (`src/app/AppShell.tsx:126-135`). The stable requirement "Open the settings page" (`openspec/specs/settings/spec.md:9`) says "The back button and Esc MUST return to the main page …; while the language list is expanded, Esc first collapses it". That is the only exception, and `InterfaceLanguageGroup.tsx:54-57` stops Esc only while the list is expanded. The change neither modifies that requirement nor says what Esc does in a field whose texts are unchanged.
- Impact: Implemented as written, the field stops every Escape. With the focus in a working hours field, Esc never leaves the settings page, which breaks the stable requirement without declaring it. The existing "Esc leaves settings" e2e scenario (`settings_e2e.feature:20`) presses Esc with the focus on the heading, so it does not catch this. If the implementer does not stop Escape, the restore scenario cannot be seen in the real app, because the page closes on the same key.
- Fix: Decide it as the language list does. In D8 and in the "Working hours row" requirement, write: "Esc in a field whose texts differ from the stored texts, or while the hint is shown, restores the stored texts, removes the hint and keeps the page open. Otherwise Esc is not stopped and leaves the settings page." In `SettingsTimeRangeGroup`, call `stopPropagation` for Escape only in that case, instead of relying on `isKeyKeptInField` for Escape. Add `## MODIFIED Requirements` → "Open the settings page" to the settings delta: restate the stable text in full and extend the exception to "while a working hours field holds unconfirmed or refused text, Esc first restores it". Add a scenario "Esc restores first, then leaves" to `settings_day_colouring_e2e.feature` (task 9.1), because it needs the real `AppShell` listener. Add a unit case to task 8.2 that Escape propagates when the texts equal the given ones. List the MODIFIED requirement in proposal.md "Capabilities".
- Fix risk: The MODIFIED block must copy the long stable requirement verbatim apart from the added clause, or it silently changes other behaviour. `SettingsTimeRangeGroup` must still stop Enter and the arrow keys as `isKeyKeptInField` does today.
- Status: open

### R2 — WARNING — "Settings page layout" is changed but not declared MODIFIED
- Location: `openspec/changes/add-day-colouring-setting/specs/settings/spec.md:154`; stable `openspec/specs/settings/spec.md:384`
- Rule: `.claude/rules/delta-specs.md`
- Problem: The ADDED requirement "Colouring settings layout" ends with "The approved screenshots of the requirement 'Settings page layout' (375 and 1024 px, both themes) are re-approved once with the colouring group shown and 'Time of day' checked". The stable "Settings page layout" says those screenshots "MUST match". It lists what they show (theme group, hour format group, view group, zone label group, language group) and which groups must each take one row. It is not modified. The previous change that added a settings group did modify it (`openspec/changes/archive/2026/11/2026-11-09-add-view-mode-setting-and-grid-skeleton/specs/settings/spec.md:197`, under `## MODIFIED Requirements`).
- Impact: After the archive, the stable spec describes the approved settings screenshots without the colouring group. Next to it sits an ADDED requirement whose last sentence is a one-time instruction ("are re-approved once"). The next change that touches the settings page reads a stale screenshot description, and the two requirements disagree on what the approved images contain.
- Fix: Add `### Requirement: Settings page layout` under `## MODIFIED Requirements` in the settings delta. Restate the stable text and add to the screenshot list: "the colouring group as three icons in the order Plain, Time of day, Working hours with Time of day checked, and no working hours row". Also add the `add-day-colouring-setting` NFR-R2 id to its implements comment. Remove the re-approval sentence from the ADDED "Colouring settings layout". Name the MODIFIED requirement in proposal.md "Capabilities" (line 27) and in task 9.4.
- Fix risk: The restated text must keep every stable clause and scenario. Do not add the colouring group to the stable "one row at 320 px" list, because NFR-R1 does not ask for 320 px.
- Status: open

### R3 — SUGGESTION — The digit token on the non-working grey cannot be expressed by the planned class map
- Location: `openspec/changes/add-day-colouring-setting/design.md:103-106` and `:83`; `tasks.md:171,176,184`
- Rule: —
- Problem: D6 sets the digits on the non-working grey to `--color-hour-cell-foreground` in the light theme and `--color-foreground` in the dark theme. D4 maps each `DayColour` to one class (`DAY_COLOUR_FOREGROUND_CLASS_NAMES: Record<DayColour, string>`), which cannot switch tokens by theme. Task 6.1's `tokens.test.ts` asserts D6's token pairs, not the class the view uses. If `NON_WORKING_TIME` maps to `text-hour-cell-foreground`, the dark digits are `#0f1729` on `#3b4660`, about 1.9:1 (`tokens.css:51`).
- Impact: The implementer must guess. The wrong guess passes the unit tests and fails only at the axe-core Grid × Working hours × dark run of task 9.2, late in the plan.
- Fix: In D6, write that the digits on the non-working grey use `--color-foreground` in both themes. The light value `#18181b` equals the light hour-cell foreground (about 14.8:1), and the dark value `#eef2fa` gives about 8.4:1. In D4 and task 6.2, spell out the map: night and non-working → `text-foreground`, the other three periods → `text-hour-cell-foreground` (as today), plain and working time → `text-accent-foreground`. Add to task 6.3 that a non-working cell gets `text-foreground`.
- Fix risk: none. The light value is unchanged, and Time of day keeps today's classes.
- Status: open

### R4 — SUGGESTION — The Working hours frame rows run on a Sunday with no accent cells
- Location: `openspec/changes/add-day-colouring-setting/specs/grid-view/spec.md:77-88`
- Rule: —
- Problem: The scenario "Frame in the foreground colour on accent cells" runs at `2026-03-08T07:30:00Z`. That is Sunday in Almaty, Moscow and Kolkata, and Saturday into Sunday in New York. So in the Working hours rows every cell is the non-working grey, and the frame is never checked on accent cells in that colouring.
- Impact: The real-browser check of the Working hours rows never covers the case the scenario is named for. A regression that only affects frames over working cells would not be caught.
- Fix: For the two Working hours rows, use `2026-03-09T06:00:00Z` and column 11 (Almaty 11:00, Monday, working). Do this by adding `<instant>` and `<column>` columns to the outline, and keep the Plain rows as they are.
- Fix risk: none. The steps already take the instant and the column as parameters in the other frame scenarios.
- Status: open

## Verdict

Needs revision. Blocking ids: R1 and R2, both WARNING. R1 leaves the Esc behaviour of the new fields in conflict with the stable "Open the settings page" requirement. R2 leaves the stable "Settings page layout" stale. R3 and R4 are optional polish. No CRITICAL finding, and every requirement id has a scenario and an automated task.
