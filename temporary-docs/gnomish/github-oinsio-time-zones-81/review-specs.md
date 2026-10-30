# Specs review: add-settings-page-and-device-time-location

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 49/50 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 2 |

## Freshness

- ✅ The Here entry path exists as described in `design.md:7`: `model/hereEntry.ts`, `presenter/presentHereEntry.ts`, `controller/useHereEntry.ts`, `views/shared/HereEntryRow.tsx`, exported from `model/index.ts:43`, `presenter/index.ts:40-42`, `controller/index.ts:9`, `views/shared/index.ts:4`. `WallTimeTargetKind.HERE_ENTRY` is at `model/referenceMoment.ts:14`, and `reduceWallTime.ts`, `followReferenceZone.ts`, `wallClockNote.ts` and `presentZoneMoment.ts` all reference it.
- ✅ `CardsView.tsx` renders `HereEntryRow` outside `LocationList`, renders `views.cardsEmptyState` whenever `rows.length === 0` (beside the Here entry), renders `LocationSearch` below the list and focuses `addLocationButtonRef` after the last removal (`views/cards/CardsView.tsx:44-50,82-113`). This backs proposal Why bullets 1 and 3.
- ✅ `app/MainPage.tsx:24-27`: the header holds the `h1` title and an empty `div` slot. `AppShell.tsx` already imports `DateBar` from `@/views/shared`.
- ✅ `views/shared/DateBar.tsx:40` uses `justify-between gap-2 md:justify-center md:gap-4`, which is the jump in proposal Why bullet 5 and design D13.
- ✅ `constants/locations.ts:2` is `LOCATIONS_SCHEMA_VERSION = 2`, re-exported by `constants/index.ts:32`. `adapters/locationsDocument.ts:21-23` has `LOCATION_MIGRATIONS` with only key `1`. `serializeLocationsDocument` writes `{timeZoneId,label,countryCode}` only.
- ✅ `adapters/localStorageLocationRepository.ts:72-82` returns `LocationsLoadStatus.EMPTY` when no document is stored and also when storage throws. The same file owns the `BroadcastChannel`/`storage`-event sync (`:113-140`) that D6 moves out.
- ✅ `controller/LocationsProvider.tsx:46-49` `storedOf` maps every non-`LOADED` result to `{ locations: [], homeLocationId: null }`. The store dispatches `SET_DEVICE_TIME_ZONE` before `REPLACE_LOCATIONS` (`:54-62`), so D1's `withDeviceTimeZone` inside `REPLACE_LOCATIONS` sees the device zone.
- ✅ Location writes are debounced (`LOCATIONS_WRITE_DEBOUNCE_MS`, `controller/createLocationsActions.ts:58-62`), flushed on `pagehide` (`LocationsProvider.tsx:30,69`), and happen only after the user's own commands. `resetLocations` calls `repository.clear()`.
- ✅ `presenter/dateTimeFormatters.ts:33-38` `getDateTimeFormatter(language, timeZoneId, kind)` is the one cached formatter owner, with cache key `[language, timeZoneId, kind]`. `constants/localDateTime.ts` holds `LOCAL_TIME_FORMAT_OPTIONS` and `HOUR_LABEL_FORMAT_OPTIONS`, both `hourCycle: "h23"`. `presenter/dayTrack.ts:47-56` switches to `LOCAL_TIME` for non-zero minutes, so the H12 options of D8 yield `12:30 AM`.
- ✅ `presenter/parseWallTimeInput.ts:16` is `parseWallTimeInput(text)` over `WALL_TIME_INPUT_PATTERNS` (`constants/timeSelection.ts:36`), and its caller is `controller/useWallTimeInput.ts:36`.
- ✅ `styles/tokens.css` has a light `:root` block and one `@media (prefers-color-scheme: dark)` block, with no `data-theme` and no `color-scheme`. `tailwind.config.ts:11` has `darkMode: "media"`, and no `dark:` variant is used under `src/`. `styles/tokens.test.ts:8` splits at the media marker. `index.html:10` gives `body` the classes `bg-background`.
- ✅ No `src/preferences/`, no preferences port and no settings UI exist. `STORAGE_KEYS` holds only `LOCATIONS` (`constants/storage.ts:5-7`). ADR-0004 and ADR-0002 already plan a `PreferencesRepository` port.
- ✅ `normalizeSearchText` and `splitIntoWords` live in `adapters/city-search/normalizeSearchText.ts` and are exported by neither `adapters/city-search/index.ts` nor `adapters/index.ts`, as `design.md:80` and `tasks.md:129` say.
- ✅ The named owners exist: `useExemplarCity` and `cityDataCache.ts` (controller), `deriveCityNameFromTimeZoneId` (adapters index), the `secondaryTexts` slot (`views/shared/ZoneRowContent.tsx`), `LocationRowsContext` (`presenter/presentZoneMoment.ts`, exported at `presenter/index.ts:48`), `presentLocationMarks`, `presentDateBar` (used by `useReferenceMoment`), `presentWallTimeHint`, `formatLocalTime`/`formatWallClockTime`, `getLocationMarkKind`, `isLocationInDeviceTimeZone`, `getReferenceZone`, `buildLocationId`/`canonicalizeLocationId`, `createStore`, `SaveOutcome`, `useStorageAvailability`, and `AddLocationButton` with `Plus` and `aria-keyshortcuts`.
- ✅ The locale keys `locations.deviceTimeMeta` ("Device time · {{utcOffset}}"), `locations.hereEntryName` ("{{city}}, {{hereMark}}, Device time"), `locations.addLocation` ("Добавить место") and `views.cardsEmptyState` («Места пока не добавлены.») exist in both locale files.
- ✅ The test infrastructure named in `design.md:15` exists: `test/workCounters.ts`, `localStorageMock.ts`, `inMemoryChannel.ts`, `switchableClock.ts`, `stubZoneCitiesFetch.ts` and `renderLocations.tsx`. `playwright.bdd.config.ts:39` sets the E2E zone to `Asia/Almaty`. The screenshot outline is at `locations/locations_ui_e2e.feature:133`, and `app_shell_smoke_e2e.steps.ts:62` uses `emulateMedia`. There is no Storybook (no `.storybook`, no dependency).
- ✅ Every test and feature file that the tasks name as existing exists: `main_page_states_unit.feature`, `locations_migration_unit.feature`, `locations_persistence.feature`, `locations_view_contract_e2e.feature`, `date_selection_layout_e2e.feature`, the three `locations_here_entry_*_unit.feature` and `locations_here_entry_e2e.feature` with their steps, `hereEntryEngineWorld.ts`, `locationsSeedHelpers.ts`, and `home_location_view_contract_e2e.feature`.
- ✅ The `package.json` scripts `typecheck`, `lint`, `test`, `test:bdd` and `check:bundle-size` exist, and `lucide-react` is a dependency. `tsconfig.app.json` lib includes `ES2020` (D9).
- ✅ The MODIFIED requirements exist under these exact names in `openspec/specs/`:
  - `locations`: Location identity, List in the Cards view, List is kept on the device, Unreadable stored list, Local time and date on location rows;
  - `main-page`: Main page regions, Empty state;
  - `app-shell`: Theme follows the system and uses design tokens;
  - `location-search`: Search is fast and lazy, Open the search with the slash key;
  - `date-selection`: Date bar layout;
  - `time-selection`: Local hour labels, Accepted wall-time text, Wall-time input on every row, A wall-time input pins the reference moment, Wall-time hint lifetime.

  No MODIFIED block drops a stable scenario.
- ✅ The 14 REMOVED "Here entry …" requirements are exactly the 14 at `openspec/specs/locations/spec.md:945-1210`.
- ✅ ADR-0007 is Accepted and contains the "Here marker" (derived Here entry) and "First launch" sections that the change partly supersedes through handoff H1. "It is not persisted" (the device time zone) is kept by D1 and D2.
- ✅ No archived change already implements a settings page, a theme preference, an hour format or a device time location. The archives the proposal names as bases are on `main` under `openspec/changes/archive/2026/09|10/`. `add-pr-preview-deploy` touches CI and `scripts/` only.
- ✅ `docs/ia/` is absent (proposal "Affected IA"). `docs/architecture/domain-model.md:26,39` plans `HourFormat.LOCALE` (NG2), and `docs/architecture/views.md:109` plans the Settings row.

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ main-page Header actions; settings Open the settings page | ✅ 6.4, 6.5, 8.1 |
| FR2 | ✅ | ✅ main-page Header actions, Empty state; location-search slash key | ✅ 6.2, 6.3, 7.7, 8.1 |
| FR3 | ✅ | ✅ settings Open the settings page | ❌ 6.4, 8.2 cover heading, back, Esc and focus, but nothing covers "notices are still shown" (R2) |
| FR4 | ✅ | ✅ settings Theme preference; app-shell Theme | ✅ 2.2, 4.1, 5.1, 8.2 |
| FR5 | ✅ | ✅ settings Hour format; time-selection; locations Local time | ✅ 3.1–3.3, 7.3, 8.2 |
| FR6 | ✅ | ✅ settings 12-hour wall-time text; time-selection Accepted wall-time text | ✅ 3.4, 3.5, 7.3 |
| FR7 | ✅ | ✅ settings kept / unreadable / without storage / tabs | ✅ 2.5, 2.6, 4.1, 7.2, 8.2 |
| FR8 | ✅ | ✅ locations Device time location, Exemplar city | ✅ 1.2, 3.6, 4.3, 7.4 |
| FR9 | ✅ | ✅ locations Device time location has the controls of every card | ✅ 1.2, 6.1, 7.4, 8.4 |
| FR10 | ✅ | ✅ home-location Device time location as home | ✅ 1.2, 7.4 |
| FR11 | ✅ | ✅ location-search Device time in the search | ✅ 4.5, 6.3, 7.6, 8.4 |
| FR12 | ✅ | ✅ locations First-launch list, Unreadable stored list | ✅ 1.2, 4.3, 7.5 |
| FR13 | ✅ | ✅ locations An emptied list stays empty; main-page Empty state | ✅ 4.3, 6.1, 7.5, 7.7, 8.4 |
| FR14 | ✅ | ✅ locations List is kept on the device | ✅ 1.5, 1.6, 7.5 |
| FR15 | ✅ | ✅ date-selection Date bar layout | ✅ 6.6, 8.5 |
| FR16 | ✅ | ✅ settings strings; locations strings; main-page Header actions | ✅ 4.5, 6.3, 6.4, 8.2 |
| FR17 | ✅ | ✅ settings Settings in every view; locations Device time location in every view | ✅ 8.3, 8.4 |
| NFR-P1 | ✅ | ✅ settings Preferences are fast; locations Device time location is fast | ✅ 3.1, 7.3, 7.4 |
| NFR-P2 | ✅ | ✅ locations Exemplar city; location-search Search is fast and lazy | ✅ 4.3, 7.4 |
| NFR-A1 | ✅ | ✅ settings Accessible settings; main-page Header actions; locations Accessible device time location | ✅ 8.1, 8.2, 8.4 |
| NFR-A2 | ✅ | ✅ settings Accessible settings, Open the settings page | ✅ 8.1, 8.2, 8.4 |
| NFR-A3 | ✅ | ✅ settings Accessible settings, layout; main-page Header actions | ✅ 5.1, 8.1, 8.2 |
| NFR-R1 | ✅ | ✅ settings layout; main-page Header actions; locations layout | ✅ 8.1, 8.2, 8.4 |
| NFR-R2 | ✅ | ✅ date-selection Date bar layout | ✅ 8.5 |
| NFR-R3 | ✅ | ✅ settings layout; locations layout; main-page Header actions | ✅ 8.2, 8.6 |
| UX1 | ✅ | ✅ main-page Header actions | ✅ 8.1 |
| UX2 | ✅ | ✅ settings layout, Accessible settings | ✅ 8.2 |
| UX3 | ✅ | ✅ locations Device time location, controls, layout | ✅ 3.6, 6.1, 8.4 |
| UX4 | ✅ | ✅ date-selection Date bar layout | ✅ 8.5 |
| UX5 | ✅ | ✅ settings Theme preference, Hour format | ✅ 8.2 |
| M1 | ✅ | n/a | ✅ 8.1 |
| M2 | ✅ | n/a | ✅ 8.2 |
| M3 | ✅ | n/a | ✅ 8.4 |
| M4 | ✅ | n/a | ✅ 7.5, 7.7, 8.4 |
| M5 | ✅ | n/a | ✅ 8.5 |
| M6 | ✅ | n/a | ✅ 8.1, 8.2, 8.4 |
| M7 | ✅ | n/a | ✅ 7.3 |
| M8 | ✅ | n/a | ✅ 1.7, 2.7, 3.8, 4.6, 6.7 |
| M9 | ✅ | n/a | ✅ 10.1 |
| G1 | ✅ | n/a, met by FR1, FR2 | n/a, met by M1 |
| G2 | ✅ | n/a, met by FR3–FR7 | n/a, met by M2 |
| G3 | ✅ | n/a, met by FR9 | n/a, met by M3 |
| G4 | ✅ | n/a, met by FR12, FR13 | n/a, met by M4 |
| G5 | ✅ | n/a, met by FR15 | n/a, met by M5 |
| NG1 | ✅ | n/a | n/a, no artifact adds a language or view-mode setting |
| NG2 | ✅ | n/a | n/a, `HourFormat` is only `H12 \| H24` (D5) |
| NG3 | ✅ | n/a | n/a, D10 uses shell state, not a URL |
| NG4 | ✅ | n/a | n/a, `getReferenceZone` and the Here mark rule are unchanged (D1) |
| NG5 | ✅ | n/a | n/a, no design screen is edited |
| NG6 | ✅ | n/a | n/a, no task touches `add-pr-preview-deploy` or `.github/` |

## Consistency

- `design.md:52` (D5: "writes at once on a user change (a setting is one click, so it needs no debounce)") contradicts the Accepted `docs/adr/0004-local-persistence-strategy.md` "Writes" section: "Writes are debounced and never block the UI". See R1.
- `design.md:72` (D10: the shell renders `SettingsPage` "inside the same providers and notices region") and `specs/settings/spec.md:10` ("The notices region MUST keep working on the settings page") do not match the code. The notices region is part of `MainPage` (`app/MainPage.tsx:30-38`), and no task in `tasks.md:154-173` moves it or gives it to `SettingsPage`. See R2.

## Findings

### R1 — WARNING — Preferences are written without the debounce that ADR-0004 requires
- Location: `openspec/changes/add-settings-page-and-device-time-location/design.md:52`
- Rule: `docs/adr/0004-local-persistence-strategy.md` (Accepted), section "Writes": "Writes are debounced and never block the UI"
- Problem: D5 says `PreferencesProvider` "writes at once on a user change (a setting is one click, so it needs no debounce)". Task 4.1/4.2 (`tasks.md:107`, "`setHourFormat(H12)` saves once") builds that. ADR-0004 makes debounced writes the rule for every stored document, and the locations follow it (`LOCATIONS_WRITE_DEBOUNCE_MS` in `controller/createLocationsActions.ts:58-62`, flushed on `pagehide` in `LocationsProvider.tsx`). The design neither follows the ADR nor records a superseding decision.
- Impact: Implemented as written, the second stored document of the app writes synchronously on every click, against an Accepted ADR. A user who flips options quickly (each a `localStorage.setItem` plus a broadcast to every tab) triggers one write and one cross-tab reload per click instead of one.
- Fix: In D5, replace "writes at once … needs no debounce" with "writes after `PREFERENCES_WRITE_DEBOUNCE_MS`, flushed on `pagehide`, the same mechanism as `createLocationsActions`/`LocationsProvider`". Add `PREFERENCES_WRITE_DEBOUNCE_MS` to `constants/preferences.ts` in task 2.1. In task 4.1, change "`setHourFormat(H12)` saves once" to "two quick changes save once, after the debounce, and a `pagehide` flushes a pending write". Drive the debounce the way the existing locations write tests do, never with `vi.useFakeTimers()` (`tdd-workflow.md`).
- Fix risk: The E2E scenarios "Choices survive a reload" and "Another tab changes the hour format" must wait for the write: a reload fires `pagehide`, which flushes, and the other tab updates after the delay. The unit storage steps of task 7.2 must advance past the debounce. The choice still applies at once in the current tab (UX5), because only the write is delayed.
- Status: open

### R2 — WARNING — Nothing plans or tests the notices region on the settings page
- Location: `openspec/changes/add-settings-page-and-device-time-location/specs/settings/spec.md:10`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: FR3 (`proposal.md:86`, "notices are still shown"), the UI States Matrix (`proposal.md:140`) and the requirement "Open the settings page" ("The notices region MUST keep working on the settings page") all require the notices on the settings page. D10 (`design.md:72`) says `SettingsPage` renders "inside the same … notices region". In the code, that region is the `role="status"` element inside `MainPage`'s footer (`app/MainPage.tsx:30-38`), which `AppShell` fills through the `notices` prop. No requirement scenario exercises it. Task 6.5 changes `MainPage` and `AppShell` without moving the region or passing it to `SettingsPage`, and no test in 6.4, 8.2 or 7.2 checks a notice on the settings page.
- Impact: The natural implementation of 6.5 (render `<SettingsPage />` instead of `<MainPage notices=… />`) drops the update notice, the offline-ready notice, the update-check-failed note and the storage warning while settings are open, and every listed test still passes. FR3 ends up unverified.
- Fix: In D10, state that `SettingsPage` takes the same `notices` prop as `MainPage` and renders it in a polite `role="status"` region. Add to the "Open the settings page" requirement the scenario "Notices on the settings page": GIVEN a new version is available, WHEN the settings page is shown, THEN the update notice is announced in the notices region. Add that case to `app/AppShell.settings.test.tsx` in task 6.4, tagged FR3, with the `useRegisterSW` mock that `app/AppShell.notices.test.tsx` already uses.
- Fix risk: none. A prop leaves `MainPage`'s footer placement untouched, and the notice is plain text in a `role="status"` region, which jsdom can assert as the existing notices tests do.
- Status: open

### R3 — WARNING — Two stable requirements keep the removed Here entry
- Location: `openspec/specs/date-selection/spec.md:72` and `openspec/specs/time-selection/spec.md:656`
- Rule: `.claude/rules/glossary.md` ("Renaming the concept means renaming the code, specs and translations in the same change")
- Problem: The change removes the Here entry concept (14 REMOVED requirements, and H2 deletes the glossary term). It does not modify two stable requirements whose text depends on it:
  - `date-selection` "Wall-clock resolution on the new date" says "on the Here entry it ends when the device time zone changes";
  - `time-selection` "Wall-time input is never stored" says "When the typed row no longer exists (the location was removed, or a location now shows the device time instead of the Here entry)".

  Neither appears in any delta of the change or in the proposal's "What Changes" (`proposal.md:26`).
- Impact: After archive, `openspec/specs/` describes a concept that no longer exists. In time-selection, the second disappearance case can no longer happen, and the case that replaces it is not stated. After H2 removes the glossary term, these are the only spec texts still using it.
- Fix: Add MODIFIED blocks, restating each requirement with all its scenarios unchanged:
  - in `specs/date-selection/spec.md`, "Wall-clock resolution on the new date", with "on the Here entry" replaced by "on the device time location";
  - in `specs/time-selection/spec.md`, "Wall-time input is never stored", with "(the location was removed, or a location now shows the device time instead of the Here entry)" replaced by "(the location was removed)".

  Each block gets the comment `FR9 of add-settings-page-and-device-time-location`. List both in `proposal.md` "What Changes" and "Modified Capabilities".
- Fix risk: A MODIFIED block replaces the whole requirement on archive, so every existing scenario (`date-selection/spec.md:74-120`, `time-selection/spec.md:658-…`) must be copied verbatim. No behaviour or test changes.
- Status: open

### R4 — WARNING — Task 7.4 duplicates two time-selection scenarios instead of updating their existing feature
- Location: `openspec/changes/add-settings-page-and-device-time-location/tasks.md:191`
- Rule: `.claude/rules/bdd-unit.md` (one step implementation per scenario) and `.claude/rules/test-planning.md`
- Problem: Task 7.4 adds "Type a time in the Here entry" and "A device time zone change ends the hint on the Here entry" to the new `locations_device_time_unit.feature`. Both scenarios already exist in `test/features/time_selection/time_selection_wall_time_input_unit.feature:79,215`, with Here-entry givens ("the list contains only Moscow, so the Here entry is shown"). Their steps (`time_selection/steps/wallTimeWorld.tsx`, `time_selection_wall_time_input_unit.steps.tsx`) use `WallTimeTargetKind.HERE_ENTRY`, which task 1.4 deletes. No task names that feature. The same applies to `locations/locations_ui_e2e.feature:41` "The Here entry's request is the only one", whose given changes in `specs/location-search/spec.md`.
- Impact: The implementer either writes each scenario twice (the old copy still asserting the Here entry and failing typecheck once 1.4 lands) or discovers the gap only in the catch-all runs of 7.8/10.3. In both cases the time-selection feature drifts from its spec.
- Fix: In task 7.4, drop those two names from the new feature's list. Add a bullet: "update in place `time_selection/time_selection_wall_time_input_unit.feature` 'Type a time in the Here entry' and 'A device time zone change ends the hint on the Here entry' to the givens of `specs/time-selection/spec.md`, and replace `HERE_ENTRY` in `wallTimeWorld.tsx` and `time_selection_wall_time_input_unit.steps.tsx` with the device time location". Verify with `npx vitest run src/test/features/time_selection`. In task 8.4, add: "update `locations_ui_e2e.feature` 'The Here entry's request is the only one' to the given 'the list holds the device time location'".
- Fix risk: none. It narrows what 7.8 and 8.7 would otherwise have to find.
- Status: open

### R5 — SUGGESTION — The design has the controller read translated labels for the device time option
- Location: `openspec/changes/add-settings-page-and-device-time-location/design.md:80`
- Rule: `.claude/rules/architecture.md` ("Presenter (`src/presenter/`): The only layer that formats times and dates, applies i18n and the 12/24h preference")
- Problem: D12 (and task 4.5, `tasks.md:129`) puts the lookup of `search.deviceTimeOption` through `i18n.getFixedT("en"|"ru")` inside `controller/useCitySearch.ts`. Today the controller only obtains `t` and the language and hands them to presenter functions (`useLocations.ts:45`), and no presenter or controller calls `getFixedT`.
- Impact: Localized text is resolved in the controller, a second place that applies i18n. The search option's label would come from the controller while every other label comes from the presenter.
- Fix: In D12 and task 4.5, add a presenter function, for example `presentDeviceTimeOptionLabels(translators)` in `presenter/` exported through `presenter/index.ts`. It receives the fixed `t` functions and returns the English and Russian labels. `useCitySearch` passes `i18n.getFixedT("en")` and `i18n.getFixedT("ru")` and keeps only the word matching with `normalizeSearchText`/`splitIntoWords`.
- Fix risk: One more small presenter file and test. `isDeviceTimeOptionShown` stays the glossary owner, so H2 is unchanged.
- Status: open

### R6 — SUGGESTION — No task creates the settings page screenshot baselines
- Location: `openspec/changes/add-settings-page-and-device-time-location/tasks.md:205`
- Rule: `.claude/rules/test-planning.md` (the verification lists concrete commands)
- Problem: Task 8.2 adds "Approved screenshots" (settings page at 375/1024 × light/dark, "new baselines"), but its verification runs Playwright without `--update-snapshots`. The only update run, task 8.6 (`tasks.md:218`), is filtered by `--grep "Screenshot of the"`, which does not match a scenario titled "Approved screenshots".
- Impact: Task 8.2's verification fails on missing baselines, and the implementer has to invent the update step.
- Fix: Either name the settings outline "Screenshot of the settings page at <width> px in the <theme> theme", so that 8.6's update and re-run cover it, or add to 8.2: "Approve once in Linux: `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep \"Approved screenshots\" --update-snapshots`, then run without the flag and see it pass."
- Fix risk: The rename changes only the scenario title in `specs/settings/spec.md:231` and the feature. Baselines must be taken in Linux, as in 8.6.
- Status: open

## Verdict

Ready to implement. There are no CRITICAL findings, so nothing blocks. The fix-specs stage should apply R1–R4 (WARNING) before the implement stage. R5 and R6 are optional polish.
