# Review: add-settings-page-and-device-time-location

## Summary

| Item | Value |
|---|---|
| Tasks verified | 57/57 |
| Requirements traced | 191/200 |
| CRITICAL | 1 |
| WARNING | 1 |
| SUGGESTION | 2 |

## Tasks

All paths below are under `packages/client/src/` unless they say otherwise.

- ✅ 1.1 — `constants/locations.ts:2` `LOCATIONS_SCHEMA_VERSION = 3`, `:8` `DEVICE_TIME_LOCATION_ID = "device-time"`, re-exported from `constants/index.ts`.
- ✅ 1.2 — `model/deviceTimeLocation.test.ts` (new) and the device time cases in `model/locations.test.ts`.
- ✅ 1.3 — `model/locationKind.ts` (`LocationKind`), `kind` on `Location` (`model/locations.ts:43`), `ADD_DEVICE_TIME_LOCATION` (`model/locationCommands.ts:18,59`), `model/deviceTimeLocation.ts` (`buildDeviceTimeLocation`, `isDeviceTimeLocation`, `withDeviceTimeZone`, `buildFirstLaunchLocations`, `reduceAddDeviceTimeLocation`), exported through `model/index.ts`.
- ✅ 1.4 — `model/hereEntry.ts` deleted; `WallTimeTargetKind.HERE_ENTRY` gone from `model/referenceMoment.ts`, `reduceWallTime.ts`, `wallClockNote.ts`; `model/followReferenceZone.ts:34` ends the hint on `DEVICE_TIME_LOCATION_ID` when the device zone changes.
- ✅ 1.5 — `{ kind: "DEVICE_TIME" }` fixtures in `model/parseStoredLocations.test.ts` and `adapters/localStorageLocationRepository.migration.test.ts:158-174` (two device entries, unknown kind).
- ✅ 1.6 — `model/parseStoredLocations.ts:47-58,95-97`, `adapters/locationsDocument.ts:26-34` (`LOCATION_MIGRATIONS[2]`) and `:48-58` (serializer writes `kind`).
- ✅ 1.7 — measured here: `deviceTimeLocation.ts` 100 %, `locations.ts` 100 %, `parseStoredLocations.ts` 99.07 %, `followReferenceZone.ts` 100 %, `locationsDocument.ts` 93.48 % (see Mutation).
- ✅ 2.1 — `constants/storage.ts:7,14` (`STORAGE_KEYS.PREFERENCES`, `PREFERENCES_SYNC_CHANNEL_NAME`), `constants/preferences.ts` (`PREFERENCES_SCHEMA_VERSION`, `PREFERENCES_WRITE_DEBOUNCE_MS`).
- ✅ 2.2 — `preferences/preferences.test.ts`.
- ✅ 2.3 — `preferences/preferences.ts`, `preferencesCommands.ts`, `parseStoredPreferences.ts`, `index.ts`; imports only each other.
- ✅ 2.4 — `adapters/storageDocumentSync.ts` (`createStorageDocumentSync`), used by `adapters/localStorageLocationRepository.ts:48`.
- ✅ 2.5 — `ports/preferencesRepository.ts:21` with FR7 JSDoc; `adapters/preferencesRepository.contract.ts` and `adapters/preferencesRepository.test.ts`.
- ✅ 2.6 — `adapters/inMemoryPreferencesRepository.ts:41`, `adapters/localStoragePreferencesRepository.ts` (uses `createStorageDocumentSync`), exported from `adapters/index.ts:13-30` and `ports/index.ts:16-18`.
- ✅ 2.7 — measured here: `localStoragePreferencesRepository.ts` 100 %, `storageDocumentSync.ts` 97.22 %, `parseStoredPreferences.ts` 100 %; `preferences.ts` (enums/constants) and `inMemoryPreferencesRepository.ts` were not re-measured in this review.
- ✅ 3.1 — H12 cases in `presenter/dateTimeFormatters.test.ts` (18 `HourFormat` references).
- ✅ 3.2 — `presenter/dateTimeFormatters.ts:15-58` (`FORMAT_OPTIONS_BY_KIND_AND_HOUR_FORMAT`, `hourFormat` in the cache key), `constants/localDateTime.ts:22-41`.
- ✅ 3.3 — `hourFormat` threaded through `presenter/localDateTime.ts`, `dayTrack.ts` (labels key includes it), `wallTimeHint.ts`, `dateBar.ts`, `presentZoneMoment.ts` (`LocationRowsContext.hourFormat`).
- ✅ 3.4 — `presenter/parseWallTimeInput.test.ts` 12-hour `it.each` tables.
- ✅ 3.5 — `presenter/dayPeriodMarkers.ts`, `parseWallTimeInput(text, dayPeriodMarkers)`, `constants/timeSelection.ts:46-55`, caller `controller/useWallTimeInput.ts:43`.
- ✅ 3.6 — device time row cases in `presenter/presentLocationRows.test.ts`.
- ✅ 3.7 — `presenter/presentLocationRows.ts:58-79` (`metaLabel`, `accessibleName`), `locations.deviceTimeName` in both locale files, `presenter/presentHereEntry.ts` deleted.
- ✅ 3.8 — measured here: `dateTimeFormatters.ts` 100 %, `parseWallTimeInput.ts` 96.55 %, `dayPeriodMarkers.ts` 93.75 %, `presentLocationRows.ts` 94.12 % (`localDateTime.ts` not re-measured).
- ✅ 4.1 — `controller/PreferencesProvider.test.tsx`, `controller/useThemePreference.test.tsx`.
- ✅ 4.2 — `controller/PreferencesProvider.tsx`, `preferencesContext.ts`, `usePreferences.ts`, `useThemePreference.ts` (plus `useHourFormat.ts`), exported by `controller/index.ts`.
- ✅ 4.3 — device time cases in `controller/useLocations.test.tsx`.
- ✅ 4.4 — `controller/LocationsProvider.tsx:47-56` (EMPTY → `buildFirstLaunchLocations`), `createLocationsActions.ts:81-84,100-102`, `useLocations.ts:52-56` (`useExemplarCity` only for a listed device time location); `useHereEntry.ts` deleted.
- ✅ 4.5 — `controller/useCitySearch.ts:82-100` `isDeviceTimeOptionShown`, cases in `controller/useCitySearch.test.ts`.
- ✅ 4.6 — measured here: `PreferencesProvider.tsx` 90.70 %, `useThemePreference.ts` 100 %, `createLocationsActions.ts` 100 %, `useCitySearch.ts` 98.36 %, `LocationsProvider.tsx` 100 %.
- ✅ 5.1 — `styles/tokens.test.ts:10-37` reads the light, forced dark and system dark blocks by selector.
- ✅ 5.2 — `styles/tokens.css` `:root`, `:root[data-theme="dark"]`, `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`.
- ✅ 6.1 — `views/cards/CardsView.deviceTime.test.tsx`, `views/shared/LocationRow.deviceTime.test.tsx`; `HereEntryRow.tsx` and its test deleted.
- ✅ 6.2 — `views/cards/CardsView.tsx` (no Here entry, no search, `document.getElementById(ADD_LOCATION_BUTTON_ID)` after the last removal), `views/shared/LocationRow.tsx:135-160`, `constants/dom.ts:19`.
- ✅ 6.3 — `views/shared/AddLocationButton.test.tsx`, `LocationSearch.test.tsx`; `locations.addShort` in both locales; announcement region in `views/shared/LocationSearch.tsx:113-115`.
- ✅ 6.4 — `app/SettingsButton.test.tsx`, `app/settings/SettingsPage.test.tsx`, `app/AppShell.settings.test.tsx` (incl. `:84` pinned moment, `:96` slash, `:109` unreadable list, `:155` notices).
- ✅ 6.5 — `app/appPage.ts`, `app/SettingsButton.tsx`, `app/settings/SettingsPage.tsx` + `SettingsOptionGroup.tsx`, `app/MainPage.tsx` (`headerActions`), `app/AppShell.tsx`; `settings.*` keys in both locales. The wide-header placement defect is R1.
- ✅ 6.6 — `views/shared/DateBar.tsx:41-42` (`justify-center gap-3`, `px-2`), `views/shared/DateBar.layout.test.tsx`.
- ✅ 6.7 — measured here: `SettingsPage.tsx` 91.67 %, `AppShell.tsx` 90.38 %, `CardsView.tsx` 100 %, `LocationSearch.tsx` 93.10 %, `AddLocationButton.tsx` 100 %.
- ✅ 7.1 — `test/features/settings/settings_preferences_unit.feature` + steps.
- ✅ 7.2 — `test/features/settings/settings_storage_unit.feature` + steps.
- ✅ 7.3 — `test/features/settings/settings_hour_format_unit.feature` + steps (work counts via `startWorkCount`).
- ✅ 7.4 — `locations_device_time_unit.feature`, `locations_device_time_data_unit.feature`, `home_location/home_location_device_time_unit.feature`; `time_selection_wall_time_input_unit.feature:80,217` updated; Here entry features deleted.
- ✅ 7.5 — `locations/locations_device_time_storage_unit.feature` + steps; `locations_persistence.feature:36-40` Reset expects the device time location.
- ✅ 7.6 — `location_search/location_search_device_time.feature` + steps.
- ✅ 7.7 — `main_page/main_page_states_unit.feature:27-51`.
- ✅ 7.8 — no remaining `hereEntry`/`HERE_ENTRY` under `src` (grep of task 10.2 prints nothing); unit suite green per CI.
- ✅ 8.1 — `main_page/main_page_header_e2e.feature` + steps (the order-only assertion is too weak, see R1).
- ✅ 8.2 — `settings/settings_e2e.feature` (all listed scenarios present; "Arrow keys change the theme" deviates, see R4).
- ✅ 8.3 — `settings/settings_view_contract_e2e.feature`.
- ✅ 8.4 — `locations/locations_device_time_e2e.feature` (incl. `:87` "Choose the device time option in the search"), `locations_view_contract_e2e.feature` "Device time location under contract", `locations_ui_e2e.feature:41`.
- ✅ 8.5 — `date_selection/date_selection_layout_e2e.feature:7,16`.
- ✅ 8.6 — `device-time`, `device-time-home`, `first-launch` baselines added and `here-entry*` baselines deleted under `test/features/__screenshots__/`.
- ✅ 8.7 — E2E suite green per CI; no Here entry steps remain.
- ✅ 9.1 — `handoff/H1-adr-device-time-location.patch` passes `git apply --check`; `## H1` in `handoff/README.md`.
- ✅ 9.2 — `handoff/H2-glossary-and-architecture-docs.patch` passes `git apply --check`; `## H2` in `handoff/README.md`.
- ✅ 10.1 — the traceability loop, run from `packages/client/`, printed nothing.
- ✅ 10.2 — the `hereEntry|HERE_ENTRY|…` grep printed nothing; `DateBar.tsx` has no `justify-between`.
- ✅ 10.3 — CI is green (stage input); not re-run in this review.

## Requirements

- ✅ FR1 — `app/SettingsButton.tsx` (`SlidersHorizontal`, `settings.open`), rightmost via `order-3`/`col-start-3`; `main_page_header_e2e.feature` "The header opens the search and the settings".
- ⚠️ FR2 — "+" before the title below 768 px works, but from 768 px "+ Add" sits next to the title on the left instead of right before the settings button (R1).
- ✅ FR3 — `app/settings/SettingsPage.tsx` (heading focus `:50-52`, Back, notices region), Esc in `app/AppShell.tsx:73-82`; `settings_e2e.feature` "Open and leave settings", "Esc leaves settings"; `AppShell.settings.test.tsx:155`.
- ✅ FR4 — `controller/useThemePreference.ts`, `styles/tokens.css`; `settings_e2e.feature` "Dark on a light system", "Light on a dark system", "System follows…", "Stored Dark on a light system".
- ✅ FR5 — `presenter/dateTimeFormatters.ts` + threaded `hourFormat`; `settings_hour_format_unit.feature`, `settings_e2e.feature` "Switching to 12-hour".
- ✅ FR6 — `presenter/parseWallTimeInput.ts`, `dayPeriodMarkers.ts`; `settings_hour_format_unit.feature` accepted/rejected/round-trip outlines.
- ✅ FR7 — `controller/PreferencesProvider.tsx`, `adapters/localStoragePreferencesRepository.ts`; `settings_storage_unit.feature`, `settings_preferences_unit.feature` "Opening writes nothing". Stale unreadable note after a save: R3.
- ✅ FR8 — `model/deviceTimeLocation.ts`, `presenter/presentLocationRows.ts:58-79`; `locations_device_time_unit.feature`, `locations_device_time_data_unit.feature`.
- ✅ FR9 — device time row rendered by `LocationList` like any row; `locations_device_time_unit.feature` "Same menu as a city card", `locations_device_time_e2e.feature:60,70`.
- ✅ FR10 — `home_location/home_location_device_time_unit.feature` (three scenarios).
- ✅ FR11 — `controller/useCitySearch.ts:82-100`, `views/shared/LocationSearchResults.tsx`; `location_search_device_time.feature`, `locations_device_time_e2e.feature:87`. Keyboard path test gap: R2.
- ✅ FR12 — `controller/LocationsProvider.tsx:47-56`, `createLocationsActions.ts:100-102`; `locations_device_time_storage_unit.feature` "First launch", "Reset".
- ✅ FR13 — stored `[]` stays empty (`LOADED` path), `views/cards/CardsView.tsx` empty state on `rows.length === 0`; `locations_device_time_e2e.feature:77`, `main_page_states_unit.feature`.
- ✅ FR14 — `adapters/locationsDocument.ts:26-34`; `locations_device_time_storage_unit.feature` "Version 2 document is migrated", `locations_migration_unit.feature`.
- ✅ FR15 — `views/shared/DateBar.tsx:41-42`; `date_selection_layout_e2e.feature:16`.
- ✅ FR16 — `locales/en.json`, `locales/ru.json` (`settings.*`, `search.deviceTimeOption`, `locations.addShort`, `locations.deviceTimeAddedAnnouncement`); `settings_e2e.feature` "Both languages".
- ✅ FR17 — `settings_view_contract_e2e.feature`, `locations_view_contract_e2e.feature` "Device time location under contract".
- ✅ NFR-P1 — formatter cache keyed by hour format; `settings_hour_format_unit.feature` two work-count scenarios.
- ✅ NFR-P2 — `controller/useLocations.ts:52-56`; `locations_ui_e2e.feature:33,41`, `locations_device_time_data_unit.feature:27`.
- ✅ NFR-A1 — axe scenarios in `settings_e2e.feature`, `main_page_header_e2e.feature` "Header sizes and accessibility", `locations_device_time_e2e.feature:17`.
- ✅ NFR-A2 — native radios in `role="radiogroup"` (`app/settings/SettingsOptionGroup.tsx`); `settings_e2e.feature` "Names and checked state", "Arrow keys change the theme".
- ✅ NFR-A3 — `min-h-11`/`min-w-11` on header buttons and options, `Check` icon on the checked option; `settings_e2e.feature` "Settings fit a screen…" asserts ≥ 44 px.
- ⚠️ NFR-R1 — no horizontal scroll is tested, but from 768 px the header does not show "+ Add" and the settings button at the right (R1).
- ✅ NFR-R2 — `date_selection_layout_e2e.feature:16` at 6 widths.
- ✅ NFR-R3 — re-approved main page baselines and new settings baselines under `test/features/__screenshots__/`.
- ⚠️ UX1 — the 1024 px header does not look like `docs/design/screens/tablet-light.png` (R1).
- ✅ UX2 — `SettingsOptionGroup.tsx` uses `bg-surface`, `border-border`, `border-accent`, accent check; settings screenshots.
- ✅ UX3 — device time row uses `LocationRow` with only `metaLabel`/`accessibleName` differing; `CardsView.deviceTime.test.tsx`.
- ✅ UX4 — `date_selection_layout_e2e.feature:16`.
- ✅ UX5 — preferences apply synchronously from context; `settings_e2e.feature` "Switching to 12-hour" (`@UX5`).
- ⚠️ M1 — the header checks only assert left-to-right order, which passes although "+ Add" is not at the design position at 1024 px (R1).
- ✅ M2 — `settings_e2e.feature` "Choices survive a reload" (settings button + option, then reload).
- ✅ M3 — `locations_device_time_unit.feature` "Same menu as a city card"; `locations_device_time_e2e.feature:60,70` keyboard and pointer reorder.
- ✅ M4 — `main_page_states_unit.feature` "First launch", "No explanation with locations"; `locations_device_time_e2e.feature:77`.
- ✅ M5 — `date_selection_layout_e2e.feature:16` outline over 320/375/767/768/1024/2560.
- ✅ M6 — axe scenarios on main page, settings and device time location in both themes.
- ✅ M7 — `settings_hour_format_unit.feature` work-count scenarios.
- ⚠️ M8 — 25 files measured, all ≥ 90 % (minimum acceptable); 8 are below the 95 % target (see Mutation). The survivor worth killing is R2.
- ✅ M9 — the task 10.1 loop printed nothing.
- ⚠️ Scenario: System prefers dark — covered only by `styles/tokens.test.ts` (block equality) and `app_shell_smoke_e2e.feature:43` axe in the dark scheme; no dedicated "first paint" assertion. Its wording is unchanged from an older change, and this branch keeps the media-query block, so this is not a finding here.
- ✅ Scenario: System prefers light — `settings_e2e.feature` "System follows a change of the system preference" starts in light with System and asserts token colours.
- ✅ Scenario: Stored Dark on a light system — `settings_e2e.feature:121` (MutationObserver records `data-theme` when the header first appears).
- ⚠️ Scenario: Font works offline — `app_shell_smoke_e2e.feature:37` only checks the heading text offline, not Manrope; pre-existing gap in an unchanged scenario, out of scope.
- ✅ Scenario: Bar on a narrow screen — `date_selection_layout_e2e.feature:7`.
- ✅ Scenario: Bar on a wide screen — `date_selection_layout_e2e.feature:37`.
- ✅ Scenario: The group stays centred while the window is resized — `date_selection_layout_e2e.feature:16`.
- ✅ Scenario: Last card above the bar — `date_selection_layout_e2e.feature:45`.
- ✅ Scenario: Calendar on a narrow and a wide screen — `date_selection_layout_e2e.feature:54`.
- ✅ Scenario: Bar controls look as approved — `date_selection_layout_e2e.feature:69`.
- ✅ Scenario: An inactive Now is grey — `date_selection_now_e2e.feature`.
- ✅ Scenario: Now keeps its place — `date_selection_now_e2e.feature`.
- ✅ Scenario: The date is the most prominent text of the bar — `date_selection_layout_e2e.feature:83`.
- ✅ Scenario: Touch targets (date-selection) — `date_selection_layout_e2e.feature:100`.
- ✅ Scenario: Calendar days fit the narrowest screen — `date_selection_layout_e2e.feature:110`.
- ✅ Scenario: No horizontal scrolling — `date_selection_layout_e2e.feature:120`.
- ✅ Scenario: A gap is told in the bar — `date_selection_wall_clock.feature`.
- ✅ Scenario: A time selection ends the gap note — `date_selection_wall_clock.feature`.
- ✅ Scenario: A wall-time input ends the gap note — `date_selection_wall_clock.feature`.
- ✅ Scenario: A gap from a wall-time input stays out of the bar — `date_selection_wall_clock.feature`.
- ✅ Scenario: Wall-clock outcomes — `date_selection_wall_clock.feature`.
- ✅ Scenario: A malformed date changes nothing — `date_selection_wall_clock.feature`.
- ✅ Scenario: A device time zone change drops the gap note — `date_selection_wall_clock.feature`.
- ✅ Scenario: Make the device time location home — `home_location_device_time_unit.feature:7`.
- ✅ Scenario: Home follows the device — `home_location_device_time_unit.feature:17`.
- ✅ Scenario: Home survives a reload — `home_location_device_time_unit.feature:29`.
- ✅ Scenario: Query timing — `location_search/location_search_performance.feature`.
- ✅ Scenario: Data loads only when the search opens — `locations_ui_e2e.feature:33` (stored list "Almaty", no device time location).
- ✅ Scenario: The Here entry's request is the only one — `locations_ui_e2e.feature:41` "The device time location's request is the only one".
- ✅ Scenario: Bundle budget — `check:bundle-size` script (`packages/client/package.json:11`), run in CI.
- ✅ Scenario: Open the search and add a location with the keyboard — `locations_search_shortcut_e2e.feature:8`.
- ✅ Scenario: Suggestions are shown — `locations_search_shortcut_e2e.feature:8` and `main_page_header_e2e.feature` "Slash still opens the search".
- ✅ Scenario: Data is requested only when the search opens — `locations_search_shortcut_e2e.feature:20` (stored "Almaty").
- ✅ Scenario: Typing in a text field — `locations_search_shortcut_e2e.feature:27`.
- ✅ Scenario: Slash typed in the open search — `locations_search_shortcut_e2e.feature:40`.
- ✅ Scenario: Search already open — `locations_search_shortcut_e2e.feature:47`.
- ✅ Scenario: Modifier keys held — `locations_search_shortcut_e2e.feature:55`.
- ✅ Scenario: Shift on layouts that need it — `locations_search_shortcut_e2e.feature:66`.
- ✅ Scenario: Stored list unreadable (location-search) — `locations_search_shortcut_e2e.feature:71`.
- ✅ Scenario: Settings page shown — `main_page_header_e2e.feature` "Settings page shown"; `AppShell.settings.test.tsx:96`.
- ✅ Scenario: Shortcut announced on the action — `views/shared/AddLocationButton.test.tsx` (`aria-keyshortcuts="/"`, name "Add location").
- ✅ Scenario: Offered after removal — `location_search_device_time.feature`.
- ✅ Scenario: Matched by a word in either language — `location_search_device_time.feature`.
- ✅ Scenario: Not matched — `location_search_device_time.feature`.
- ✅ Scenario: Shown while the search data loads or failed — `location_search_device_time.feature`.
- ✅ Scenario: Choose it — `locations_device_time_e2e.feature:87`.
- ✅ Scenario: Hidden while listed — `location_search_device_time.feature`.
- ✅ Scenario: Legacy identifier is canonicalized on input — `locations_management.feature`.
- ✅ Scenario: Duplicate by canonical identifier — `locations_management.feature`.
- ✅ Scenario: Raw offset is rejected — `locations_management.feature`.
- ✅ Scenario: Unknown zone is rejected — `locations_management.feature`.
- ✅ Scenario: The device's city next to the device time location — `locations_device_time_unit.feature`.
- ✅ Scenario: Rows show city and country — `locations_ui_unit.feature`.
- ✅ Scenario: Empty state after the last removal — `locations_ui_unit.feature`.
- ✅ Scenario: Remove action names the city — `locations_ui_e2e.feature`.
- ✅ Scenario: Focus after removal — `locations_view_contract_e2e.feature`.
- ✅ Scenario: Focus after the last removal — `locations_view_contract_e2e.feature`; `CardsView.deviceTime.test.tsx` focuses `#add-location-button`.
- ✅ Scenario: List survives a reload — `locations_persistence.feature`.
- ✅ Scenario: First launch writes nothing — `locations_persistence.feature`.
- ✅ Scenario: Legacy identifier is canonicalized on load — `locations_persistence.feature`.
- ✅ Scenario: Offline reopen (locations) — `locations_sync_offline_e2e.feature`.
- ✅ Scenario: Previous document version is migrated — `locations_migration_unit.feature`.
- ✅ Scenario: Version 2 document is migrated — `locations_device_time_storage_unit.feature`.
- ✅ Scenario: The device time zone is not stored — `locations_device_time_storage_unit.feature`.
- ✅ Scenario: Corrupted document — `locations_storage_ui_unit.feature`, `locations_persistence.feature:23` outline.
- ✅ Scenario: Newer version — `locations_persistence.feature:23` outline row "written by a newer version".
- ✅ Scenario: Invalid zone in the document — `locations_persistence.feature:23` outline row `"+05:00"`.
- ✅ Scenario: Two device time locations — `locations_device_time_storage_unit.feature`; `localStorageLocationRepository.migration.test.ts:172`.
- ✅ Scenario: Reset (locations) — `locations_persistence.feature:36` and `locations_device_time_storage_unit.feature` (first-launch list).
- ✅ Scenario: Home of the wrong type — `locations_storage_ui_unit.feature`.
- ✅ Scenario: Time and date of each location — `locations_local_time_unit.feature`.
- ✅ Scenario: Time in the 12-hour format — `settings_hour_format_unit.feature`.
- ✅ Scenario: Zones on both sides of midnight — `locations_local_time_unit.feature`.
- ✅ Scenario: Russian interface — `locations_local_time_unit.feature`.
- ✅ Scenario: Time is computed again when the list changes — `locations_local_time_unit.feature`.
- ✅ Scenario: Time that cannot be computed — `locations_local_time_unit.feature`.
- ✅ Scenario: Rows at a pinned moment — `date_selection_reference_moment_rows.feature`.
- ✅ Scenario: Device time location on the design sample — `locations_device_time_unit.feature`.
- ✅ Scenario: The device moves to another zone — `locations_device_time_unit.feature`.
- ✅ Scenario: Unknown device time zone — `locations_device_time_unit.feature`.
- ✅ Scenario: Same menu as a city card — `locations_device_time_unit.feature`.
- ✅ Scenario: Reorder below a city — `locations_device_time_e2e.feature:60` (keyboard), `:70` (mouse).
- ✅ Scenario: Remove the device time location — `locations_device_time_unit.feature`.
- ✅ Scenario: Add it back — `locations_device_time_unit.feature`.
- ✅ Scenario: Already listed — `locations_device_time_unit.feature`.
- ✅ Scenario: First launch (locations) — `locations_device_time_storage_unit.feature`.
- ✅ Scenario: Remove everything and reopen — `locations_device_time_storage_unit.feature`, `locations_device_time_e2e.feature:77`.
- ✅ Scenario: Time selection from the device time location — `locations_device_time_unit.feature`.
- ✅ Scenario: Derived city first, exemplar city after loading — `locations_device_time_data_unit.feature`.
- ✅ Scenario: Loading fails — `locations_device_time_data_unit.feature`.
- ✅ Scenario: No load without the device time location — `locations_device_time_data_unit.feature:27`.
- ✅ Scenario: Renamed device time zone — `locations_device_time_data_unit.feature`.
- ✅ Scenario: Both languages (locations) — `locations_device_time_unit.feature`.
- ✅ Scenario: Device time location under contract — `locations_view_contract_e2e.feature`.
- ✅ Scenario: Presenting again builds no formatter (locations) — `locations_device_time_data_unit.feature`.
- ✅ Scenario: Name and list size — `locations_device_time_e2e.feature:8`.
- ✅ Scenario: No violations (locations) — `locations_device_time_e2e.feature:17` outline.
- ✅ Scenario: Narrow and wide screens (locations) — `locations_device_time_e2e.feature:34`.
- ✅ Scenario: The exemplar city keeps the height — `locations_device_time_e2e.feature:42`.
- ✅ Scenario: Approved screenshots (locations) — `locations_ui_e2e.feature` outline "Screenshot of the <state> state…" with `device-time`, `device-time-home`.
- ✅ Scenario: User opens the app — `main_page_unit.feature`.
- ✅ Scenario: Notices stay available — `main_page_unit.feature:13`.
- ✅ Scenario: Header keeps its position — `main_page_e2e.feature`, `main_page_unit.feature`.
- ✅ Scenario: Empty list — `main_page_states_unit.feature:27`.
- ✅ Scenario: First launch (main-page) — `main_page_states_unit.feature:36`.
- ✅ Scenario: No explanation with locations — `main_page_states_unit.feature:44`.
- ✅ Scenario: Add location from the empty state — `main_page_states_unit.feature:51`.
- ✅ Scenario: Narrow header — `main_page_header_e2e.feature:7`.
- ⚠️ Scenario: Wide header — `main_page_header_e2e.feature:15` passes on order alone; the spec's "title at the left … settings at the right" with "+ Add" directly before settings is not met (R1).
- ✅ Scenario: The header opens the search and the settings — `main_page_header_e2e.feature`.
- ✅ Scenario: Slash still opens the search — `main_page_header_e2e.feature:32`.
- ✅ Scenario: One Add location button — `main_page_header_e2e.feature`.
- ✅ Scenario: Header sizes and accessibility — `main_page_header_e2e.feature` outline 375/1024 × light/dark.
- ✅ Scenario: No Add location button on an unreadable list — `main_page_header_e2e.feature`; `AppShell.settings.test.tsx:109`.
- ✅ Scenario: Open and leave settings — `settings_e2e.feature:7`; pinned moment kept: `AppShell.settings.test.tsx:84`.
- ✅ Scenario: Esc leaves settings — `settings_e2e.feature:19`.
- ✅ Scenario: Notices on the settings page — `AppShell.settings.test.tsx:155`.
- ✅ Scenario: Default is System — `settings_preferences_unit.feature`.
- ✅ Scenario: Dark on a light system — `settings_e2e.feature:99`.
- ✅ Scenario: Light on a dark system — `settings_e2e.feature:106`.
- ✅ Scenario: System follows a change of the system preference — `settings_e2e.feature`.
- ✅ Scenario: Default is 24-hour — `settings_preferences_unit.feature`.
- ✅ Scenario: Switching to 12-hour — `settings_e2e.feature` (1024 px, labels asserted).
- ✅ Scenario: Gap note in 12-hour format — `settings_hour_format_unit.feature`.
- ✅ Scenario: Accepted 12-hour texts — `settings_hour_format_unit.feature`.
- ✅ Scenario: Rejected 12-hour texts — `settings_hour_format_unit.feature`.
- ✅ Scenario: The shown time is accepted unchanged — `settings_hour_format_unit.feature`.
- ✅ Scenario: Choices survive a reload — `settings_e2e.feature`.
- ✅ Scenario: Opening writes nothing — `settings_preferences_unit.feature`.
- ✅ Scenario: Offline reopen (settings) — `settings_e2e.feature` last scenario.
- ✅ Scenario: Corrupted preferences — `settings_storage_unit.feature`.
- ✅ Scenario: Reset (settings) — `settings_storage_unit.feature`.
- ✅ Scenario: Storage unavailable — `settings_storage_unit.feature`.
- ✅ Scenario: Another tab changes the hour format — `settings_storage_unit.feature`.
- ✅ Scenario: Both languages (settings) — `settings_e2e.feature` outline.
- ✅ Scenario: Switch the hour format from the view — `settings_view_contract_e2e.feature`.
- ✅ Scenario: Switch the theme from the view — `settings_view_contract_e2e.feature`.
- ⚠️ Scenario: Arrow keys change the theme — `settings_e2e.feature:28` presses ArrowDown and expects Light, and never checks the token colours; the spec presses Arrow Up and expects Dark with the dark token values (R4).
- ✅ Scenario: Names and checked state — `settings_e2e.feature:35` (English; Russian names in "Both languages").
- ✅ Scenario: No violations (settings) — `settings_e2e.feature` light/dark outline and "No violations with the unreadable note".
- ✅ Scenario: Narrow and wide screens (settings) — `settings_e2e.feature` "Settings fit a screen <width> px wide" (320, 2560).
- ✅ Scenario: Approved screenshots (settings) — `settings_e2e.feature:85`.
- ✅ Scenario: Presenting again builds no formatter (settings) — `settings_hour_format_unit.feature`.
- ✅ Scenario: Switching the hour format builds one formatter per zone and kind — `settings_hour_format_unit.feature`.
- ✅ Scenario: Hour labels of four zones — `time_selection_day_colours.feature`.
- ✅ Scenario: Hour labels in the 12-hour format — `settings_hour_format_unit.feature`.
- ✅ Scenario: Labels only on wide screens — `time_selection_layout_e2e.feature`.
- ✅ Scenario: Accepted texts — `time_selection_wall_time_input_unit.feature`.
- ✅ Scenario: Open the field — `time_selection_wall_time_input_e2e.feature`.
- ✅ Scenario: Open the field in the 12-hour format — `settings_hour_format_unit.feature`.
- ✅ Scenario: No input for an unknown zone — `time_selection_wall_time_input_unit.feature`.
- ✅ Scenario: Type a time in another city — `time_selection_wall_time_input_unit.feature`.
- ✅ Scenario: Wall-clock outcomes of a typed time — `time_selection_wall_time_input_unit.feature`.
- ✅ Scenario: Type a time in the Here entry — `time_selection_wall_time_input_unit.feature:80` "Type a time in the device time location".
- ✅ Scenario: The hint ends with the next change — `time_selection_wall_time_input_unit.feature`.
- ✅ Scenario: The hint leaves with its row — `time_selection_wall_time_input_unit.feature`.
- ✅ Scenario: A home change keeps the hint — `time_selection_wall_time_input_unit.feature`.
- ✅ Scenario: A device time zone change ends the hint on the Here entry — `time_selection_wall_time_input_unit.feature:217`.
- ✅ Scenario: Nothing is stored or shared — `time_selection_wall_time_input_unit.feature`.
- ✅ Scenario: The location is gone while typing — `time_selection_wall_time_input_unit.feature`.
- ✅ Scenario: A malformed command changes nothing — `time_selection_wall_time_input_unit.feature`.

## Mutation

Measured in this review with `npx stryker run --mutate '<5 files>'` from `packages/client/`, five runs, one at a time (scores from `reports/mutation/mutation-report.json`):

| File | Score | Survivors |
|---|---|---|
| `src/model/deviceTimeLocation.ts` | 100.00 % | — |
| `src/model/parseStoredLocations.ts` | 99.07 % | 1 (`:99` conditional) |
| `src/model/locations.ts` | 100.00 % | — |
| `src/model/followReferenceZone.ts` | 100.00 % | — |
| `src/adapters/locationsDocument.ts` | 93.48 % | 3 (`:29` array guard of migration 2, `:73`) |
| `src/adapters/localStoragePreferencesRepository.ts` | 100.00 % | — |
| `src/adapters/storageDocumentSync.ts` | 97.22 % | 1 (message string) |
| `src/preferences/parseStoredPreferences.ts` | 100.00 % | — |
| `src/controller/PreferencesProvider.tsx` | 90.70 % | 4 (hook dependency arrays) |
| `src/controller/useCitySearch.ts` | 98.36 % | 1 |
| `src/controller/LocationsProvider.tsx` | 100.00 % | — |
| `src/controller/createLocationsActions.ts` | 100.00 % | — |
| `src/controller/useThemePreference.ts` | 100.00 % | — |
| `src/presenter/parseWallTimeInput.ts` | 96.55 % | 2 (whitespace collapse, equivalent because the pattern allows `\s?`) |
| `src/presenter/presentLocationRows.ts` | 94.12 % | 1 (`:58`, equivalent) |
| `src/presenter/dayPeriodMarkers.ts` | 93.75 % | 1 (`:41` memo hit) |
| `src/presenter/dateTimeFormatters.ts` | 100.00 % | — |
| `src/presenter/presentDeviceTimeOptionLabels.ts` | 100.00 % | — |
| `src/app/settings/SettingsPage.tsx` | 91.67 % | 2 (heading focus effect) |
| `src/app/AppShell.tsx` | 90.38 % | 5 (`:68-69` return-focus guard, `:74` Esc listener only on settings, `:81` listener cleanup) |
| `src/views/shared/LocationSearch.tsx` | 93.10 % | 2 (`:100` close auto-focus body) |
| `src/views/shared/LocationSearchDialog.tsx` | 95.37 % | 4 + 1 no coverage (`:78`, `:82` → R2) |
| `src/views/shared/LocationSearchResults.tsx` | 100.00 % | — |
| `src/views/shared/AddLocationButton.tsx` | 100.00 % | — |
| `src/views/cards/CardsView.tsx` | 100.00 % | — |

Every measured file is at or above the 90 % minimum; none is a WARNING by score. Eight files sit below the 95 % target; apart from R2, their survivors are equivalent mutants or React dependency arrays. Not measured: `src/preferences/preferences.ts`, `src/preferences/preferencesCommands.ts`, `src/adapters/inMemoryPreferencesRepository.ts`, `src/presenter/localDateTime.ts`, `src/presenter/dayTrack.ts`, `src/app/SettingsButton.tsx`, `src/app/settings/SettingsOptionGroup.tsx`, `src/views/shared/LocationRow.tsx`, `src/views/shared/DateBar.tsx`.

## Findings

### R1 — CRITICAL — From 768 px "+ Add" sits beside the title instead of at the right next to Settings
- Location: `packages/client/src/app/SettingsButton.tsx:22` (`md:ml-auto`), with `packages/client/src/app/MainPage.tsx:30` (title) and `packages/client/src/views/shared/AddLocationButton.tsx:24` (`md:order-2`)
- Rule: spec `main-page` "Header actions" and proposal NFR-R1/UX1 of this change
- Problem: From `md`, the header is a flex row: title (`md:order-1`), Add location (`md:order-2`), settings (`md:order-3 md:ml-auto`). `md:ml-auto` on the settings button pushes only that button right. "+ Add" stays right next to the title on the left, with an empty gap before Settings. This is visible in the re-approved baseline `test/features/__screenshots__/chromium/Screenshot-of-the-list-state-at-1024-px-in-the-light-theme.png`. NFR-R1 says: "From 768 px it shows the title at the left and "+ Add" and the settings button at the right". The `main-page` spec says "+ Add" is "placed right of the title and directly before the settings button, with the title at the left". `docs/design/screens/tablet-light.png` shows "+ Добавить" next to the sliders icon at the right edge. The E2E step `main_page_header_e2e.steps.ts:37-46` only sorts the left edges, so it passes.
- Impact: Every user on a tablet or desktop sees a header that does not match the approved design, the task's item 5 ("Кнопка добавления … должна соответствовать дизайну") and FR2/NFR-R1/UX1/M1. The approved screenshots lock the wrong layout in.
- Fix: Remove `md:ml-auto` from the settings button class in `SettingsButton.tsx`. Add `md:mr-auto` to the `h1` in `MainPage.tsx`, so the title takes the left and both buttons group at the right. On an unreadable list, where the Add button is absent, the settings button still lands at the right. In `main_page_header_e2e.steps.ts`, add a step to "Wide header", for example `the button named "Добавить место" is directly before the button named "Настройки"`. It asserts that the gap between the Add button's right edge and the settings button's left edge is smaller than the gap between the title's right edge and the Add button's left edge. Re-approve the 1024 px main-page baselines once in Linux (`npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "Screenshot of the" --update-snapshots`).
- Fix risk: Every 1024 px main-page screenshot baseline (list, home, device-time, device-time-home, first-launch, empty, pinned, calendar, suggestions, IST results, time-selected, travelling, wall-time-hint, wall-time-input, chromium and mobile-chrome) changes and needs re-approval. The narrow grid is unaffected because `md:` classes do not apply below 768 px, and DOM and Tab order do not change. A unit test that asserts the settings button's exact class string would need updating; none asserts `md:ml-auto` today (grep finds it only in `SettingsButton.tsx`).
- Status: open

### R2 — WARNING — Enter on a city result while the Device time option is shown is untested
- Location: `packages/client/src/views/shared/LocationSearchDialog.tsx:78`
- Rule: `.claude/rules/tdd-workflow.md` (survived mutants mark missed scenarios); review rule "a test that would not catch a regression"
- Problem: With the Device time option first, `handleKeyDown` treats index 0 as the option and reads city results at `activeOptionIndex - optionOffset` (`:82`). Stryker keeps two mutants alive here. `:78` replaced by `true` makes Enter always add the device time location. `:82` `- optionOffset` → `+ optionOffset` picks the wrong city. No unit test or E2E scenario presses Arrow Down and Enter on a city result while the option is shown. The option shows with an empty query, together with the suggestions, so this is the normal keyboard path after the user removed the device time location.
- Impact: A regression in this offset arithmetic would add the wrong city or the device time location when a keyboard user picks a suggestion, and CI would stay green. This breaks FR11 ("Device time option first") together with the existing keyboard selection of results.
- Fix: In `views/shared/LocationSearchDialog.test.tsx`, add an `it.each` over the active index with a `deviceTimeOption` and two presented results. Enter at index 0 calls `deviceTimeOption.onChoose` and not `onChoose`. Arrow Down then Enter calls `onChoose` with the first result. Arrow Down twice then Enter calls it with the second result. Re-run `npx stryker run --mutate 'src/views/shared/LocationSearchDialog.tsx'` and see `:78` and `:82` killed.
- Fix risk: none. The change is test-only, and the behaviour it pins is the current, correct one.
- Status: open

### R3 — SUGGESTION — The unreadable-settings note stays after the user's change has replaced the document
- Location: `packages/client/src/controller/PreferencesProvider.tsx:81-86`
- Rule: spec `settings` "Unreadable stored preferences" ("a change of a setting replaces it")
- Problem: `flushWrite` saves the changed preferences but never sets `loadStatus` back to `READY`. After the stored document was unreadable and the user picks, for example, Dark, the valid document is written. The settings page (`app/settings/SettingsPage.tsx:75-89`) keeps saying "The saved settings could not be read" and keeps offering Reset until the next launch.
- Impact: The note is false once the save succeeds. A user who trusts it and presses Reset clears the choice they just saved (`resetPreferences` calls `repository.clear()`), so the app falls back to System/24-hour and their Dark choice is lost.
- Fix: In `flushWrite`, when `repository.save(...)` returns `SaveOutcome.SAVED`, also call `setLoadStatus(PreferencesStatus.READY)`. Add a case to `controller/PreferencesProvider.test.tsx`: start with an unreadable document, change the theme, run the scheduled write with `createManualWriteScheduler()`, and expect `loadStatus` to be `READY`.
- Fix risk: The "Corrupted preferences", "Reset" and "No violations with the unreadable note" scenarios open the page without changing a setting, so they are unaffected. A failed save keeps the note, which is correct because the unreadable document is still stored.
- Status: open

### R4 — SUGGESTION — "Arrow keys change the theme" tests a different key and skips the theme assertion
- Location: `packages/client/src/test/features/settings/settings_e2e.feature:27-33`
- Rule: `.claude/rules/bdd-e2e.md` / `gherkin.md` (the feature implements the spec-delta scenario of the same intent); spec `settings` "Accessible settings"
- Problem: The spec scenario is "the user tabs into the theme group and presses Arrow Up → the theme Dark is checked and the page uses the dark token values". The E2E scenario presses ArrowDown from System, expects Light, and never checks the page colours.
- Impact: The spec scenario's outcome, a keyboard choice that applies the dark tokens, is not executed. Today the scenario only proves that the native radio moved. It would stay green if a keyboard-moved radio stopped reaching `setTheme`, for example if the option group switched to custom `role="radio"` elements without an `onChange` path.
- Fix: Parameterize the step `the user focuses the {string} option and presses ArrowDown` (`settings/steps/settings_e2e.steps.ts:59-65`) to `the user focuses the {string} option and presses {string}`, passing the key to `keyboard.press`. Then change the scenario to `Given the system colour scheme is light`, `And the user opens the settings`, `When the user focuses the "System" option and presses "ArrowUp"`, `Then the option "Dark" is checked` and `And the page background is the dark token colour`. The last two reuse existing steps (`settings_e2e.feature:99-104`).
- Fix risk: Low. On native radios, Arrow Up moves to the previous option (System → Dark) in Chromium. The step text changes, so `npx bddgen` must regenerate before the run. No other feature uses the old step text (only `settings_e2e.feature` matches).
- Status: open

## Verdict

Not ready. R1 (CRITICAL) blocks: the wide header does not meet FR2, NFR-R1, UX1 and M1, nor the approved tablet design. R2 should be fixed in the same round. R3 and R4 are low-stakes improvements.
