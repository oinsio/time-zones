# Review: show-here-entry-for-device-time

## Summary

| Item | Value |
|---|---|
| Tasks verified | 30/31 |
| Requirements traced | 74/77 |
| CRITICAL | 1 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 — `locations.deviceTimeMeta` and `locations.hereEntryName` in `packages/client/src/locales/en.json:33-34` and `ru.json:33-34`; no `GMT` in `src/locales`.
- ✅ 2.1 — `isLocationInDeviceTimeZone(location: Pick<Location, "timeZoneId">, …)` (`model/deviceTimeZone.ts:10`); `getOffsetDifferenceMinutes` takes `{ id?: string; timeZoneId: string }` (`model/offsetDifference.ts`); the three no-ID cases are in `model/offsetDifference.test.ts:87-108`.
- ✅ 2.2 — `getHereEntry` in `model/hereEntry.ts:13-18`, built on `isLocationInDeviceTimeZone`; `it.each` cases (empty, Moscow, Minsk, matching, matching home) and the `Mars/Olympus_Mons` → `UTC` case in `model/hereEntry.test.ts:30-72`; exported from `model/index.ts:43`.
- ✅ 2.3 — Measured in this review: `hereEntry.ts` 4/4, `offsetDifference.ts` 20/20, `deviceTimeZone.ts` 4/4 (Mutation section).
- ✅ 3.1 — `adapters/city-search/deriveCityNameFromTimeZoneId.ts:10-15` with the moved constants; `it.each` test with the 4 cases in `deriveCityNameFromTimeZoneId.test.ts`; `zoneCitiesSource.ts:69` calls it; exported from `adapters/city-search/index.ts` and `adapters/index.ts`.
- ✅ 3.2 — `CitySearch.getExemplarCity` (`ports/citySearch.ts:44-49`), implemented in `createCompositeCitySearch.ts:83-85`; `describeCitySearchContract` in `citySearch.contract.ts` with `// FR8` / `// FR12` cases, run from `createCompositeCitySearch.exemplarCity.test.ts` with `virtual:zone-cities` (Almaty en/ru, `Europe/Kyiv` → `Kyiv`, derived name).
- ✅ 3.3 — Measured: `createCompositeCitySearch.ts` 97.67% (the one no-coverage mutant is the untouched `suggest` line 91), `zoneCitiesSource.ts` 98.90%, `deriveCityNameFromTimeZoneId.ts` 100%.
- ✅ 4.1 — `presenter/presentZoneMoment.ts:51-105` holds the moved code; `presentLocationRows.ts:48-54` spreads `presentZoneMoment(location, context)`.
- ✅ 4.2 — `presentHereEntry` in `presenter/presentHereEntry.ts:28-47`; M2, M4, `0 ч`, UTC, accessible name, Kolkata cases in `presentHereEntry.test.ts:35-110`; exported from `presenter/index.ts:33-36`.
- ✅ 4.3 — Measured: `presentZoneMoment.ts` 100%, `presentHereEntry.ts` 100%, `presentLocationRows.ts` 83.33% (5/6; the survivor at line 52, `markKind === undefined ? …` → `false`, is equivalent because `marks[undefined]` is `undefined`, and the line is unchanged by this branch).
- ✅ 5.1 — `controller/cityDataCache.ts` (`loadCitySearchOnce`, `readLoadedCitySearch`); three cases in `cityDataCache.test.ts:10-39`; `useCitySearch.ts:27,34-36` uses it.
- ✅ 5.2 — `loadCitySearch` prop with the adapter default (`LocationsProvider.tsx:38,92,149`) and in `LocationsContextValue` (`locationsContext.ts:36-37`); `useLocations.ts:47-68` returns `rowsContext` and `hereEntry` (`undefined` while `UNREADABLE`); six cases in `useLocations.hereEntry.test.tsx:48-108`.
- ✅ 5.3 — `controller/useExemplarCity.ts` (derived name at once, load in `useEffect`, no retry); cases in `useExemplarCity.test.tsx:35-107` with a deferred loader.
- ✅ 5.4 — `controller/useHereEntry.ts`, exported from `controller/index.ts:9`; cases in `useHereEntry.test.tsx:55-84`.
- ✅ 5.5 — Measured: `cityDataCache.ts` 100%, `useExemplarCity.ts` 100%, `useHereEntry.ts` 100%, `useLocations.ts` 100%, `useCitySearch.ts` 97.37%, `LocationsProvider.tsx` 97.22% (survivors are untouched counter lines).
- ✅ 6.1 — `views/shared/ZoneRowContent.tsx` holds the place column, `LocalDateTime` and `DayTrack`; `LocationRow.tsx` (156 lines) wraps it; the removed class names match the ones in `ZoneRowContent` with `isCityOneLine` unset.
- ✅ 6.2 — `views/shared/HereEntryRow.tsx` is a `<section aria-label={entry.accessibleName}>` with no button and `isCityOneLine`; tests in `HereEntryRow.test.tsx:38-97` (content, no button, slider name); exported from `views/shared/index.ts:4`.
- ✅ 6.3 — `CardsView.tsx:81-87` renders `HereEntryRow` before the list or empty paragraph; `LocationSearch.tsx:30-37` falls back to the provider's loader; the five cases in `CardsView.hereEntry.test.tsx:59-119`.
- ✅ 6.4 — Measured: `HereEntryRow.tsx` 100%, `ZoneRowContent.tsx` 100%, `CardsView.tsx` 100%, `LocationSearch.tsx` 91.30% (both survivors, lines 57 and 88, are in lines this branch did not change).
- ✅ 7.1 — The scenarios are split over `locations_here_entry_unit.feature`, `locations_here_entry_changes_unit.feature` and `locations_here_entry_data_unit.feature`, each with its own steps file; all listed scenarios are present with tags; the work bound uses `startWorkCount()` and `MAX_TRANSITION_LOOKUPS_PER_ZONE` (`steps/hereEntryEngineWorld.ts:94-106`).
- ✅ 7.2 — `main_page/main_page_states_unit.feature` "First launch": Here entry first, explanation and "Add location" below, no list stored; steps in `main_page_states_unit.steps.tsx`.
- ✅ 7.3 — `test/benchmarks/rowPresenting.bench.ts` adds "present 50 rows and the Here entry".
- ✅ 8.1 — `locations_here_entry_e2e.feature` holds reorder, keyboard time selection, tap without Pointer Events, name and list size, one Tab stop, the axe outline (3 states × 2 themes), narrow/wide screens and the kept-height outline at 375/1024 px; steps in `locations_here_entry_e2e.steps.ts`.
- ✅ 8.2 — `locations_view_contract_e2e.feature:29-34` "See the Here entry without home", tagged `@view-contract @FR11`.
- ✅ 8.3 — `locations_ui_e2e.feature:32-47` (Almaty stored first, new "The Here entry's request is the only one" with `@M5`), `locations_search_shortcut_e2e.feature:19-24`, and `storeDeviceCity` before `SEARCH_LOADING` / `SEARCH_ERROR` in `steps/locationsStates.ts:68-73,125,131`.
- ❌ 8.4 — The two states and their 16 baselines were added (`locationsStates.ts:60-61,178-191`, `locations_ui_e2e.feature:177-184`), but the `empty`, `suggestions` and `IST results` baselines were not re-approved: none of them is changed on the branch, and the committed `empty` baseline shows no Here entry (finding R1).
- ✅ 9.1 — `handoff/H1-glossary-here-entry.patch` and `H1-glossary-location-row.patch` pass `git apply --check` on `HEAD` and apply with `-C0` after the predecessor's patches in a scratch copy; `README.md` states the order.
- ✅ 9.2 — `handoff/H2-architecture-here-entry.patch` passes `git apply --check`; in the scratch copy `getHereEntry` count is 1, `is-derived` count is 0, `Device time · UTC+5` count is 1.
- ✅ 10.1 — The traceability loop over FR1–FR12, NFR-*, UX1–UX3 run in `packages/client` prints nothing.
- ✅ 10.2 — CI is green per the stage input; this review ran the screenshot scenario, all four scoped Stryker runs and their tests without failures.
- ✅ 10.3 — `grep -rniE "default location|auto-added location" src` and `grep -rn GMT src/locales` print nothing.

## Requirements

- ✅ FR1 — `getHereEntry` (`model/hereEntry.ts:13`), rendered first in `CardsView.tsx:81-87`; tests `hereEntry.test.ts`, `CardsView.hereEntry.test.tsx:59`, unit BDD `locations_here_entry_unit.feature:6-37`.
- ✅ FR2 — `presentHereEntry` + `HereEntryRow`; `presentHereEntry.test.ts:35`, `HereEntryRow.test.tsx`, BDD "Here entry on the design sample".
- ✅ FR3 — `presentZoneMoment` calls `getOffsetDifferenceMinutes` with the ID-less subject; `offsetDifference.test.ts:87-108`, `presentHereEntry.test.ts:62-84`, BDD "No home" / "Travelling with home set".
- ✅ FR4 — `HereEntryRow` has no handle/menu and sits outside `LocationList`; `HereEntryRow.test.tsx:66`, BDD "Nothing to remove or move", E2E "Reorder keeps the Here entry first".
- ✅ FR5 — `HereEntryRow` wires `DayTrack` to `selectTrackFraction` / `moveTrack`; BDD "Time selection from the Here entry", E2E keyboard variant.
- ✅ FR6 — `getHereEntry` in the same render as rows (`useLocations.ts:64-67`); `useLocations.hereEntry.test.tsx:54-94`, the four FR6 BDD scenarios.
- ✅ FR7 — `CardsView.tsx:81-93`; `CardsView.hereEntry.test.tsx:73`, `main_page_states_unit.feature` "First launch".
- ✅ FR8 — `useExemplarCity`, `cityDataCache`, provider loader shared by `LocationSearch`; `useExemplarCity.test.tsx`, `CardsView.hereEntry.test.tsx:102`, data BDD scenarios, E2E "The Here entry's request is the only one". See R3 for a gap after a failed load.
- ✅ FR9 — `hereEntry` is `undefined` while `UNREADABLE` (`useLocations.ts:64-67`); `CardsView.hereEntry.test.tsx:90`, BDD "Unreadable stored list" / "Storage unavailable".
- ✅ FR10 — keys in both locales; BDD "Both languages", `presentHereEntry.test.ts:85-110`.
- ✅ FR11 — `locations_view_contract_e2e.feature:29-34`.
- ✅ FR12 — canonical ID reaches `getExemplarCity`; BDD "Renamed device time zone" (`@M7`), E2E "Tap on the Here entry's day track without Pointer Events", contract `Europe/Kyiv` case.
- ✅ NFR-P1 — BDD "Presenting again builds no formatter" (0 formatters, lookups ≤ `MAX_TRANSITION_LOOKUPS_PER_ZONE`), `rowPresenting.bench.ts`.
- ✅ NFR-P2 — load in `useEffect` after first render (`useExemplarCity.ts:26-29`); `useExemplarCity.test.tsx:35`, BDD "Derived city first, exemplar city after loading".
- ✅ NFR-A1 — axe outline in `locations_here_entry_e2e.feature:55-70` (above a list, empty, travelling × light/dark).
- ✅ NFR-A2 — `<section aria-label>` outside the `<ul>`; E2E "Name and list size", "One Tab stop on the Here entry"; `HereEntryRow.test.tsx:82`.
- ✅ NFR-R1 — E2E "Narrow and wide screens" (320/2560 px, layout matches Moscow card).
- ❌ NFR-R2 — The two new states have baselines, but "the existing baselines whose list is empty ('empty', 'suggestions', 'IST results') are re-approved with the Here entry" is not met (R1).
- ✅ UX1 — Shared `ZoneRowContent`; E2E "Narrow and wide screens", `here-entry` baselines.
- ✅ UX2 — `CardsView.hereEntry.test.tsx:73` checks order; `main_page_states_unit.feature` "First launch".
- ✅ UX3 — `isCityOneLine` truncation; E2E outline "The exemplar city keeps the height at <width> px".
- ✅ M1 — The traceability loop (task 10.1) finds every FR/NFR/UX with the change name in `src`.
- ✅ M2 — BDD "Here entry on the design sample" (Алматы, здесь, `Время устройства · UTC+5`, 12:30, `вс, 8 мар.`) and "No home" (Moscow `−2 ч`, Kolkata `+0:30`, New York `−9 ч`).
- ✅ M3 — BDD "Adding the device's city hides the Here entry" (exactly 1 Here mark) and "Removing the device's city shows the Here entry"; `useLocations.hereEntry.test.tsx:54`.
- ✅ M4 — BDD "Travelling with home set" (`Москва`, `−2 ч`, `Время устройства · UTC+3`, reference day 19:00Z–19:00Z).
- ✅ M5 — `useLocations.hereEntry.test.tsx:101` (nothing written), `CardsView.hereEntry.test.tsx:102` (one loader call), E2E "The Here entry's request is the only one" (exactly 1 request).
- ⚠️ M6 — Mutation ≥ 90% on every changed production file (measured below) and the axe outline exists; but the "re-approved screenshot baselines" part is not true: the old baselines pass only because of the 2.5% pixel tolerance (R1).
- ✅ M7 — BDD "Renamed device time zone" (`Kyiv`, `09:30`, `Device time · UTC+2`).
- ✅ Scenario: Query timing — unchanged; `location_search/location_search_performance.feature:5`.
- ✅ Scenario: Data loads only when the search opens — `locations_ui_e2e.feature:32-39`, Almaty stored first.
- ✅ Scenario: The Here entry's request is the only one — `locations_ui_e2e.feature:41-47`.
- ✅ Scenario: Bundle budget — unchanged; `scripts/check-bundle-size.mjs`, run in CI (`ci.yml` "Check initial JS budget").
- ✅ Scenario: Open the search and add a location with the keyboard — `locations_search_shortcut_e2e.feature:8-16`.
- ✅ Scenario: Suggestions are shown — `locations_search_shortcut_e2e.feature:12` ("the suggestions are shown").
- ✅ Scenario: Data is requested only when the search opens — `locations_search_shortcut_e2e.feature:20-24` with Almaty stored.
- ✅ Scenario: Typing in a text field — `locations_search_shortcut_e2e.feature:27` outline.
- ✅ Scenario: Slash typed in the open search — `locations_search_shortcut_e2e.feature:40`.
- ✅ Scenario: Search already open — `locations_search_shortcut_e2e.feature:47`.
- ✅ Scenario: Modifier keys held — `locations_search_shortcut_e2e.feature:55`.
- ✅ Scenario: Shift on layouts that need it — `locations_search_shortcut_e2e.feature:66`.
- ✅ Scenario: Stored list unreadable — `locations_search_shortcut_e2e.feature:71`.
- ✅ Scenario: Shortcut announced on the action — `locations_search_shortcut_e2e.feature:16`.
- ✅ Scenario: No location matches — `locations_here_entry_unit.feature:7`.
- ✅ Scenario: A location matches — `locations_here_entry_unit.feature:15`.
- ✅ Scenario: The home location matches — `locations_here_entry_unit.feature:23`.
- ✅ Scenario: Matching is by time zone ID, not by offset — `locations_here_entry_unit.feature:32`.
- ✅ Scenario: Here entry on the design sample — `locations_here_entry_unit.feature:40`, handle-position step at `steps/locations_here_entry_unit.steps.tsx:116`.
- ✅ Scenario: English meta line — `locations_here_entry_unit.feature:51`.
- ✅ Scenario: No home — `locations_here_entry_unit.feature:59`.
- ✅ Scenario: Travelling with home set — `locations_here_entry_unit.feature:70`.
- ✅ Scenario: Nothing to remove or move — `locations_here_entry_changes_unit.feature:7`.
- ✅ Scenario: Reorder keeps the Here entry first — `locations_here_entry_e2e.feature:8`.
- ✅ Scenario: Nothing is stored for the Here entry — `locations_here_entry_changes_unit.feature:14`.
- ✅ Scenario: Time selection from the Here entry — `locations_here_entry_changes_unit.feature:21`, keyboard variant `locations_here_entry_e2e.feature:18`.
- ✅ Scenario: Adding the device's city hides the Here entry — `locations_here_entry_changes_unit.feature:32`.
- ✅ Scenario: Removing the device's city shows the Here entry — `locations_here_entry_changes_unit.feature:41`.
- ✅ Scenario: The device moves to another zone — `locations_here_entry_changes_unit.feature:49`.
- ✅ Scenario: Unknown device time zone — `locations_here_entry_changes_unit.feature:58`.
- ✅ Scenario: Derived city first, exemplar city after loading — `locations_here_entry_data_unit.feature:7`.
- ✅ Scenario: Loading fails — `locations_here_entry_data_unit.feature:17`.
- ✅ Scenario: No load without a Here entry — `locations_here_entry_data_unit.feature:25`.
- ✅ Scenario: The search reuses the Here entry's data — `locations_here_entry_data_unit.feature:32`.
- ✅ Scenario: Unreadable stored list — `locations_here_entry_data_unit.feature:40`.
- ✅ Scenario: Storage unavailable — `locations_here_entry_data_unit.feature:48`.
- ✅ Scenario: Renamed device time zone — `locations_here_entry_data_unit.feature:56`.
- ✅ Scenario: Tap on the Here entry's day track without Pointer Events — `locations_here_entry_e2e.feature:28`.
- ✅ Scenario: Both languages — `locations_here_entry_changes_unit.feature:66`.
- ✅ Scenario: See the Here entry without home — `locations_view_contract_e2e.feature:30`.
- ✅ Scenario: Presenting again builds no formatter — `locations_here_entry_data_unit.feature:67`.
- ✅ Scenario: Name and list size — `locations_here_entry_e2e.feature:38`.
- ✅ Scenario: One Tab stop on the Here entry — `locations_here_entry_e2e.feature:47`.
- ✅ Scenario: No violations — `locations_here_entry_e2e.feature:56` outline.
- ✅ Scenario: Narrow and wide screens — `locations_here_entry_e2e.feature:73`.
- ✅ Scenario: The exemplar city keeps the height — `locations_here_entry_e2e.feature:81` outline.
- ❌ Scenario: Approved screenshots — the `here-entry` / `here-entry-travel` rows have baselines, but the scenario's `empty` state is compared against a baseline without the Here entry (R1).
- ✅ Scenario: First launch — `main_page/main_page_states_unit.feature:27`.
- ✅ Scenario: Add location from the empty state — `main_page/main_page_states_unit.feature:36` (unchanged scenario, still passing with the Here entry above).

## Mutation

Scoped runs from `packages/client`, one at a time, at most 5 files each; scores from `reports/mutation/mutation-report.json` (killed + timeout over killed + timeout + survived + no coverage):

| File | Score |
|---|---|
| `src/model/hereEntry.ts` | 100% (4/4) |
| `src/model/offsetDifference.ts` | 100% (20/20) |
| `src/model/deviceTimeZone.ts` | 100% (4/4) |
| `src/adapters/city-search/deriveCityNameFromTimeZoneId.ts` | 100% (5/5) |
| `src/adapters/city-search/createCompositeCitySearch.ts` | 97.67% (42/43) |
| `src/adapters/city-search/zoneCitiesSource.ts` | 98.90% (90/91) |
| `src/presenter/presentZoneMoment.ts` | 100% (21/21) |
| `src/presenter/presentHereEntry.ts` | 100% (6/6) |
| `src/presenter/presentLocationRows.ts` | 83.33% (5/6) |
| `src/controller/cityDataCache.ts` | 100% (7/7) |
| `src/controller/useExemplarCity.ts` | 100% (12/12) |
| `src/controller/useHereEntry.ts` | 100% (9/9) |
| `src/controller/useLocations.ts` | 100% (13/13) |
| `src/controller/useCitySearch.ts` | 97.37% (37/38) |
| `src/controller/LocationsProvider.tsx` | 97.22% (35/36) |
| `src/views/shared/HereEntryRow.tsx` | 100% (3/3) |
| `src/views/shared/ZoneRowContent.tsx` | 100% (30/30) |
| `src/views/cards/CardsView.tsx` | 100% (52/52) |
| `src/views/shared/LocationSearch.tsx` | 91.30% (21/23) |
| `src/views/shared/LocationRow.tsx` | 98.11% (52/53) |

Survivors, none in a line this branch changed and none exposing an untested requirement:

- `presentLocationRows.ts:52` `markKind === undefined ? undefined : marks[markKind]` → `false`: equivalent (`marks[undefined]` is `undefined`); the file has only 6 mutants, so one equivalent mutant drops it below 90%. Not a finding.
- `createCompositeCitySearch.ts:91` (`suggest` fallback `[]`, no coverage), `zoneCitiesSource.ts:99`, `useCitySearch.ts:51`, `LocationsProvider.tsx:139`, `LocationSearch.tsx:57,88`, `LocationRow.tsx:112`: pre-existing lines.

## Findings

### R1 — CRITICAL — Empty-list screenshot baselines were not re-approved with the Here entry
- Location: `packages/client/src/test/features/__screenshots__/chromium/Screenshot-of-the-empty-state-at-375-px-in-the-light-theme.png` (row `packages/client/src/test/features/locations/locations_ui_e2e.feature:145`), and the other `empty`, `suggestions` and `IST results` baselines of both projects
- Rule: `tasks.md` 8.4 (ticked) and proposal NFR-R2: "The existing baselines whose list is empty ('empty', 'suggestions', 'IST results') are re-approved with the Here entry."
- Problem: Task 8.4 is ticked, but none of the 24 `empty` / `suggestions` / `IST results` baselines is changed on the branch (`git diff --name-status` lists only the 16 new `here-entry*` files). The committed `empty` baseline shows "No locations added yet." and "Add location" right under the title, with no Here entry, and the `suggestions` baseline at 1024 px shows an empty page behind the dialog. Re-generating the `empty` 375 px light baseline with `--update-snapshots=all` in this review produced an image with the Almaty Here entry card above the explanation. The scenario still passes because `SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.025` and Playwright's per-pixel colour threshold leave the near-white card surface unchanged, so only text and track pixels count. A plain `--update-snapshots` run (mode "changed") does not rewrite them, which is likely why they were missed.
- Impact: The approved baselines document a screen the app no longer shows. That breaks a ticked task and an NFR. The screenshot check also cannot catch a regression that drops the Here entry from the empty state, because the baselines and a broken build would match. The next real change to these screens would be compared against an outdated layout.
- Fix: From `packages/client`, run `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "Screenshot of the (empty|suggestions|IST results) state" --update-snapshots=all` (both `chromium` and `mobile-chrome`). Look at the 24 rewritten PNGs to confirm the Here entry is in them, then run the same command without the flag and commit the baselines.
- Fix risk: Only baseline files change. The baselines will then be rendered by this environment's Chromium. The config comment notes a macOS-vs-Linux gap of up to 1.31%, which is inside the 2.5% tolerance, the same as for the 16 baselines this branch already added.
- Status: fixed
- Resolution: regenerated the empty, suggestions and IST results baselines with --update-snapshots=all in both projects; 16 PNGs changed (the 375 px dialog states are fully covered by the dialog and stayed identical), the empty 375 px baseline now shows the Almaty Here entry, and the scenario passes without the flag (24 passed).

### R2 — WARNING — Five changed test files exceed the 200-line limit
- Location: `packages/client/src/test/features/locations/steps/locations_here_entry_e2e.steps.ts:1` (265 lines), `packages/client/src/test/features/locations/steps/hereEntryWorld.tsx:1` (242), `packages/client/src/test/features/locations/steps/locations_here_entry_data_unit.steps.tsx:1` (205), `packages/client/src/test/features/locations/steps/locationsStates.ts:1` (206, was 172), `packages/client/src/test/features/locations/locations_ui_e2e.feature:1` (212, was 193)
- Rule: `CLAUDE.md` ("Files must stay under 200 lines for AI context quality"), `.claude/rules/process-invariants.md` ("Target 100–200 lines per file"), `tasks.md` header ("every file stays under 200 lines").
- Problem: The branch added three files over 200 lines and pushed two existing files from under 200 to over 200. The task plan's own invariant says every file stays under 200 lines.
- Impact: This breaks a project invariant stated in CLAUDE.md and in the change's own task header. The project gives the cost directly: long files degrade AI context quality for later changes in the same area.
- Fix: Move the self-contained helpers into the existing small helper modules, which keeps the step texts unchanged:
  - the axe, layout and height helpers of `locations_here_entry_e2e.steps.ts` go to `hereEntryE2eHelpers.ts` (40 lines);
  - the rendering/assertion helpers of `hereEntryWorld.tsx` and `locations_here_entry_data_unit.steps.tsx` go to `hereEntryChecks.ts` (68 lines) or a new `hereEntryLoaderWorld.ts`;
  - in `locationsStates.ts`, move the bodies of the two new cases `HERE_ENTRY` / `HERE_ENTRY_TRAVEL` (lines 178-191), the constants `HERE_ENTRY_CITY_NAMES` / `HERE_ENTRY_HOME_CITY_NAME` (lines 37-38) and `storeDeviceCity` (lines 69-73) into a new `hereEntryStates.ts` helper module that the switch calls; that removes about 20 lines, so the file ends near 187;
  - for `locations_ui_e2e.feature` (212 lines), keep every scenario of this change where it is and split the file by aspect instead: move the four untouched cross-tab and offline scenarios "Added in another tab", "Removed in another tab" (`@FR14`), "Offline reopen" and "Offline search" (`@FR16`), lines 185-212 with their tags, to a new `locations/locations_sync_offline_e2e.feature` with its own `Feature:` header ("Implements change add-locations-via-search."), and drop "follows other tabs and works offline" from the description at lines 4-5. That removes 28 lines, so `locations_ui_e2e.feature` ends at about 184 lines and the new file at about 33. Moving only "The Here entry's request is the only one" (lines 41-48, 8 lines with the blank line) would not be enough: it leaves about 204 lines. It would also move the scenario out of the file that task 8.3 names ("add 'The Here entry's request is the only one' to `locations_ui_e2e.feature`"). This fix avoids both problems.

  After the moves, check every file listed in Location with `wc -l`. Each must be under 200 lines.
- Fix risk: Step definitions in playwright-bdd are global. `playwright.bdd.config.ts:13-14` picks up every `src/test/features/**/*_e2e.feature` and every `steps/*_e2e.{steps,fixtures}.ts`. So moving helpers, but not step texts, cannot cause duplicate-step errors, and the new feature file is found without a config change. `npx bddgen` must be rerun. The four moved scenarios belong to the archived change add-locations-via-search. Their texts and tags stay as they are and only their file changes, so their traceability tags still resolve. The screenshot outline and its rows stay in `locations_ui_e2e.feature`, for two reasons: task 8.4 of this change and task 5.4 of the active change add-wall-time-input-with-hint both name "the screenshot outline of `locations/locations_ui_e2e.feature`", and the baseline names come from the test title (`locations_layout_e2e.steps.ts:65-69`). Task 8.3 stays true because the Here entry scenario does not move. The rows that add-wall-time-input-with-hint plans for the outline will use up part of the roughly 16 lines of headroom. The unit and E2E runs of the touched files must pass unchanged.
- Status: fixed
- Resolution: split by moving helpers and steps, text of steps unchanged: layout steps to locations_here_entry_layout_e2e.steps.ts, loader to hereEntryDataLoader.ts, queries to hereEntryQueries.ts, seeding to locationsSeedHelpers.ts, and the four sync/offline scenarios to locations_sync_offline_e2e.feature; all five files are now under 200 lines.

### R3 — SUGGESTION — The Here entry keeps the derived city after the search loads the data following a failed background load
- Location: `packages/client/src/controller/useExemplarCity.ts:23-35`
- Rule: proposal FR8 ("Until it is loaded, or when loading fails, the city is derived from the time zone ID")
- Problem: `useExemplarCity` stores the search in local state only from its own effect (`loadCitySearchOnce(load).then(setLoadedSearch, () => undefined)`), and the effect re-runs only when `timeZoneId` or `load` change. If the background load fails, `cityDataCache` drops the entry. When the user then opens the search, `useCitySearch` loads the data again and `readLoadedCitySearch(load)` now returns it, but the hook's `loadedSearch` stays `undefined`.
- Impact: Russian interface, device in `Asia/Almaty`, a transient network failure on the first load, then the user opens the search and it succeeds. The Here entry keeps showing `Almaty` instead of `Алматы` for the rest of the session, although the data is in memory. This happens only after a failed first load, so the stakes are low.
- Fix: In `useExemplarCity`, resolve the search on render as `const search = loadedSearch ?? readLoadedCitySearch(load);` and use it for `getExemplarCity`. Add a case to `useExemplarCity.test.tsx`: a rejected first load, then a successful `loadCitySearchOnce(load)` from outside, then a rerender gives `Алматы`. The hook stays without a retry of its own (design D4).
- Fix risk: The name updates on the next render of `CardsView` (the minute tick or any list change), not at the moment the search resolves. That is enough here. Without the new test, Stryker would report a survivor on the `??`.
- Status: fixed
- Resolution: useExemplarCity reads readLoadedCitySearch(load) on render; covered by the new useExemplarCity.test.tsx case "after a failed load when the data is loaded elsewhere", which failed before the fix.

## Verdict

Not ready. Blocking: R1, because task 8.4 is ticked but the `empty`, `suggestions` and `IST results` baselines were not re-approved (NFR-R2). R2 should be fixed in the same round. R3 is optional.
