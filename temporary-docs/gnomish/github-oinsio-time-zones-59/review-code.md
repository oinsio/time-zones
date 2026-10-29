# Review: set-home-location-and-show-differences

## Summary

| Item | Value |
|---|---|
| Tasks verified | 37/37 |
| Requirements traced | 133/134 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 2 |

## Tasks

All paths are under `packages/client/src/` unless stated otherwise.

- ✅ 1.1 — `constants/locations.ts:2` `LOCATIONS_SCHEMA_VERSION = 2`; every listed key is in `locales/en.json:34-52` and `locales/ru.json:34-52` (Russian `_one/_few/_many`, English `_one/_other`); `grep -rniE "локаци" src/locales` prints nothing.
- ✅ 2.1 — `model/locations.ts:38` `homeLocationId`, `:154` REMOVE clears home, `:159-170` REPLACE drops a dangling home; `model/reduceHomeLocation.ts:20-35`; `model/locationId.ts:13-20` `canonicalizeLocationId`; tests in `model/homeLocation.test.ts`.
- ✅ 2.2 — `model/referenceMoment.ts:35-40` reads home; `model/followReferenceZone.ts:13-35` called from `reduceLocations` (`model/locations.ts:108-115`); `model/followReferenceZone.test.ts`, M3 in `model/dayTrack.test.ts`; `referenceMomentPicking.test.ts` only gains a field.
- ✅ 2.3 — `model/locationMark.ts:10,20-29` `HOME` first; `model/locationMark.test.ts` table.
- ✅ 2.4 — `model/offsetDifference.ts:12-43`; `model/offsetDifference.test.ts` (M2 values, 300 for Almaty/Moscow, home row, device row, Minsk 0, unknown).
- ✅ 2.5 — `model/parseStoredLocations.ts:60-80` (`parseHomeLocationId`: null/missing → null, wrong type → rejected, alias canonicalized, dangling → null); `model/parseStoredLocations.test.ts`.
- ✅ 2.6 — measured in this review: `locations.ts`, `reduceHomeLocation.ts`, `referenceMoment.ts`, `locationMark.ts`, `offsetDifference.ts`, `followReferenceZone.ts` all 100% (see Mutation).
- ✅ 3.1 — `ports/locationRepository.ts:7-10,20,38` (`StoredLocations`, `LOADED`, `save(snapshot)`); `adapters/locationRepository.contract.ts` covers home save/load, clear, external change.
- ✅ 3.2 — `adapters/locationsDocument.ts:21-23` migration, `:41` serializer; `adapters/localStorageLocationRepository.defaults.test.ts:20-89` (v1 fixture, dangling v2, v3 unreadable).
- ✅ 3.3 — measured: `locationsDocument.ts` 97.06%, `localStorageLocationRepository.ts` 98.39%, `inMemoryLocationRepository.ts` 100%, `parseStoredLocations.ts` 100%.
- ✅ 4.1 — `presenter/utcOffset.ts:11-25` `formatSignedHoursMinutes`, used by `formatUtcOffset` (`:34-41`) and `presenter/offsetDifference.ts:46-47`; `presenter/offsetDifference.test.ts`.
- ✅ 4.2 — `presenter/presentLocationRows.ts:49-51,87-96,112-114`; `presenter/presentLocationRows.home.test.ts`.
- ✅ 4.3 — measured: `utcOffset.ts` 94.44%, `offsetDifference.ts` 97.56%, `presentLocationRows.ts` 96%, `locationMark.ts` 92.31%. The survivors are equivalent mutants (see Mutation).
- ✅ 5.1 — `controller/createLocationsActions.ts:87-88` `setHomeLocation`, `:55-56` writes home; `controller/locationsContext.ts:40-41`; `controller/useLocations.ts:46-55` passes `homeLocationId` and `getReferenceOffsetMinutes`; `controller/useLocations.home.test.tsx`.
- ✅ 5.2 — measured: `LocationsProvider.tsx` 97.22%, `createLocationsActions.ts` 100%, `useLocations.ts` 100%.
- ✅ 6.1 — `views/shared/locationMenuKeys.ts`; `views/shared/locationMenuKeys.test.ts`.
- ✅ 6.2 — `views/shared/LocationMenu.tsx`; `LocationMenu.test.tsx`, `LocationMenu.legacy.test.tsx:29-87` (click, remove, touchstart outside, `focusout` with null `relatedTarget`, `tabIndex` -1).
- ✅ 6.3 — `views/shared/LocationRow.tsx:89-110,141-158`; `LocationRow.home.test.tsx`; `LocationMarkIcon.test.tsx:22-27` (house, `text-accent`).
- ✅ 6.4 — no × button in `LocationRow.tsx`; the menu is at `:189-193`; `menuButtons` in `LocationList.tsx:76,122`; `test/removeLocationThroughMenu.ts`; the locale key is gone. The task's grep prints one line, `controller/useLocations.home.test.tsx:122` (`locations.removeLocation(` is the hook action that stays, not the locale key). The intent of the check holds.
- ✅ 6.5 — `views/shared/LocationList.menu.test.tsx`, `views/cards/CardsView.home.test.tsx`; `CardsView.tsx:56-65` announces.
- ✅ 6.6 — `test/locationMenuDependencies.test.ts` (header `Verifies NFR-P2`).
- ✅ 6.7 — measured: `LocationMenu.tsx` 93.83%, `locationMenuKeys.ts` 100%, `LocationRow.tsx` 97.56%, `LocationList.tsx` 100%, `CardsView.tsx` 100%, `LocationMarkIcon.tsx` 100%.
- ✅ 7.1 — `test/features/home_location/home_location_unit.feature`, `home_location_reference_unit.feature`, `home_location_storage_unit.feature`, and the menu scenarios in `home_location_menu_unit.feature`, each with a steps file. The work is split over four features instead of one; every listed scenario is present and tagged.
- ✅ 7.2 — `test/features/locations/locations_offset_difference_unit.feature` and `locations_offset_difference_budget_unit.feature` with steps; `test/zoneLookupCounter.ts`; `test/benchmarks/rowPresenting.bench.ts` extended.
- ✅ 7.3 — `test/features/home_location/home_location_menu_unit.feature:28-41` and `steps/home_location_menu_unit.steps.tsx`.
- ✅ 7.4 — the scenarios are in `locations/locations_home_removal_unit.feature`, `locations_migration_unit.feature`, `locations_storage_ui_unit.feature:44-45`, `locations_home_mark_unit.feature`, `time_selection/time_selection_day_track.feature:80-81`, `date_selection/date_selection_reference_moment.feature:79-80` and `date_selection_wall_clock.feature:47-48`. The first three are new sibling features instead of the named files; the behaviour is covered.
- ✅ 8.1 — `test/features/home_location/home_location_e2e.feature` (Keyboard, reorder, announcements, Russian, UX1, UX3, axe in 4 states × 2 themes, 320/2560 with the menu open) and `steps/home_location_e2e.steps.ts`, `home_location_layout_e2e.steps.ts`.
- ✅ 8.2 — `test/features/home_location/home_location_legacy_e2e.feature`, `steps/home_location_legacy_e2e.steps.ts`.
- ✅ 8.3 — `test/features/home_location/home_location_view_contract_e2e.feature:9-10` (`@view-contract @FR13`).
- ✅ 8.4 — tagged changes in `locations_device_time_zone_e2e.feature:8`, `locations_local_time_e2e.feature:52`, `locations_ui_e2e.feature:40`, `locations_view_contract_e2e.feature:48`; helpers in `locationsE2eHelpers.ts` and `locationsReorderE2eHelpers.ts`.
- ✅ 8.5 — `locations/steps/locationsStates.ts:53-54`; `locations_ui_e2e.feature:150-157` adds the `home` and `travelling` rows; baselines exist under `test/features/__screenshots__/{chromium,mobile-chrome}/Screenshot-of-the-{home,travelling}-state-*`.
- ✅ 9.1 — `git apply --check` of `handoff/H1-glossary-home-location.patch` succeeds.
- ✅ 9.2 — `git apply --check` of `handoff/H2-architecture-docs-home-location.patch` succeeds.
- ✅ 9.3 — `grep -c "^## H" handoff/README.md` prints 3.
- ✅ 10.1 — the traceability loop prints nothing (run in this review).
- ✅ 10.2 — in this review, `pnpm run build`, then `check:bundle-size` printed "Initial JS: 144.2 KB gzipped (budget 150 KB)", and `check:legacy-build` printed "Legacy build check passed: 15 files". CI is green for typecheck, lint, test and BDD.
- ✅ 10.3 — `grep -rniE "локаци" src/locales`, `grep -rn "GMT" src/locales` and `grep -rniE "context menu|kebab" src` print nothing.

## Requirements

- ✅ FR1 — `model/reduceHomeLocation.ts:23-34`; `home_location_unit.feature` "Make Almaty home", "Home moves…", "Location already gone"; `model/homeLocation.test.ts`.
- ✅ FR2 — `reduceHomeLocation.ts` with `id: null`; `LocationRow.tsx:91-95`; "Clear home" scenario.
- ✅ FR3 — `model/locations.ts:154-155` (remove), `createLocationsActions.ts:92-96` (reset with `null`); `home_location_unit.feature:40-61`, `locations_home_removal_unit.feature`.
- ✅ FR4 — `model/referenceMoment.ts:35-40`, `model/followReferenceZone.ts`; `home_location_reference_unit.feature:6-45`, `date_selection_wall_clock.feature:48`, `date_selection_reference_moment.feature:80`, `time_selection_day_track.feature:81`.
- ✅ FR5 — `model/offsetDifference.ts:28-43`, `controller/useLocations.ts:53`; `locations_offset_difference_unit.feature:6-59`.
- ✅ FR6 — `presenter/offsetDifference.ts:34-61`; "Texts in both languages" outline.
- ✅ FR7 — `model/locationMark.ts:25`, `presenter/locationMark.ts:31`, `LocationMarkIcon.tsx:22`; `locations_home_mark_unit.feature`, `home_location_reference_unit.feature:48-71`.
- ✅ FR8 — `adapters/locationsDocument.ts:21-23,41`; `home_location_storage_unit.feature:6-20`, `locations_migration_unit.feature`, `useLocations.home.test.tsx` (no write for v1).
- ✅ FR9 — `model/parseStoredLocations.ts:70-80`; `home_location_storage_unit.feature:22`, `locations_storage_ui_unit.feature:45`.
- ✅ FR10 — `LocationsProvider.tsx` subscription dispatches `REPLACE_LOCATIONS` with `storedOf(result)`; `home_location_storage_unit.feature:30`, contract tests.
- ✅ FR11 — `views/shared/LocationMenu.tsx`, `LocationRow.tsx:89-105`, `CardsView.tsx:56-65`; `home_location_menu_unit.feature:6-27`, `home_location_e2e.feature:24-39`.
- ✅ FR12 — keys in both locales; `src/locales/locales.test.ts` checks identical key sets; "Russian interface" E2E.
- ✅ FR13 — `home_location_view_contract_e2e.feature:10`.
- ✅ FR14 — `LocationMenu.tsx:26-28,109-118,141`; `LocationMenu.legacy.test.tsx`, `home_location_menu_unit.feature:29-41`, `home_location_legacy_e2e.feature`.
- ✅ NFR-P1 — reference offset read once in `useLocations.ts:53`; `locations_offset_difference_budget_unit.feature` (formatter count 0 and per-zone lookup comparison); `rowPresenting.bench.ts`.
- ✅ NFR-P2 — no new dependency (`test/locationMenuDependencies.test.ts`); measured 144.2 KB gzipped against 150 KB; `check:legacy-build` passes.
- ✅ NFR-A1 — `home_location_e2e.feature:62-78` (list, home, travelling, menu open × light, dark).
- ✅ NFR-A2 — `locationMenuKeys.ts`, `LocationMenu.tsx:75-107`; `home_location_e2e.feature:8` "Keyboard", `LocationList.menu.test.tsx`.
- ✅ NFR-A3 — `LocationRow.tsx:106-110,141-158`, `presenter/offsetDifference.ts:56-60`; "Accessible texts" outline, `locations_device_time_zone_e2e.feature:9`, `locations_local_time_e2e.feature:53`.
- ⚠️ NFR-R1 — 320/2560 px is checked only with home set and the menu open (`home_location_e2e.feature:80-91`). The travelling state that NFR-R1 names is never checked for horizontal scrolling (R1).
- ✅ NFR-R2 — `locations_ui_e2e.feature:150-157`, and the baselines are approved for both projects.
- ✅ UX1 — `LocationRow.tsx:141-158` (`text-sm font-semibold text-muted-foreground`, before the caption); `home_location_e2e.feature:50`.
- ✅ UX2 — `LocationMarkIcon.tsx:22`; `LocationMarkIcon.test.tsx:22-27`.
- ✅ UX3 — `LocationMenu.tsx:142` `min-h-11 min-w-11`; `home_location_e2e.feature:17,57`.
- ✅ M1 — the traceability loop of task 10.1 prints nothing.
- ✅ M2 — `model/offsetDifference.test.ts` and "Differences from home" / "DST changes the difference" (`−2 ч`, `+0:30`, `−9 ч`, `−10 ч`).
- ✅ M3 — `model/dayTrack.test.ts` (header `M3`), `home_location_reference_unit.feature:6-24`.
- ✅ M4 — `localStorageLocationRepository.defaults.test.ts:20-89`, `home_location_storage_unit.feature:14-28`.
- ✅ M5 — `LocationMenu.legacy.test.tsx:29-42`; 144.2 KB ≤ 150 KB measured.
- ✅ M6 — every changed production file measured at ≥ 90% (lowest 92.31%, untouched line), and the remaining survivors are equivalent; axe in 4 states × 2 themes in `home_location_e2e.feature:62-78`.
- ✅ Scenario: The app opens live — existing `date_selection_reference_moment.feature:6`.
- ✅ Scenario: Date changes store nothing — `date_selection_reference_moment.feature:16`.
- ✅ Scenario: The pinned moment survives a list change in another tab — `date_selection_reference_moment.feature:23`.
- ✅ Scenario: A home change keeps the pinned moment — `date_selection_reference_moment.feature:80`.
- ✅ Scenario: A gap is told in the bar — `date_selection_wall_clock.feature:6`.
- ✅ Scenario: A time selection ends the gap note — `date_selection_wall_clock.feature:16`.
- ✅ Scenario: Wall-clock outcomes — `date_selection_wall_clock.feature:26`.
- ✅ Scenario: A malformed date changes nothing — `date_selection_wall_clock.feature:41`.
- ✅ Scenario: A device time zone change drops the gap note — `date_selection_wall_clock.feature:48`.
- ✅ Scenario: Make Almaty home — `home_location_unit.feature:6`.
- ✅ Scenario: Home moves to another location — `home_location_unit.feature:13`.
- ✅ Scenario: Location already gone — `home_location_unit.feature:22`.
- ✅ Scenario: Clear home — `home_location_unit.feature:32`.
- ✅ Scenario: Removing home clears it — `home_location_unit.feature:40`.
- ✅ Scenario: The first added location is not home — `home_location_unit.feature:48`.
- ✅ Scenario: Reorder keeps home in place — `home_location_unit.feature:55`.
- ✅ Scenario: The day follows home while travelling — `home_location_reference_unit.feature:6`.
- ✅ Scenario: Clearing home returns to the device day — `home_location_reference_unit.feature:15`.
- ✅ Scenario: A pinned moment keeps its instant — `home_location_reference_unit.feature:26`.
- ✅ Scenario: A home change drops the gap note — `home_location_reference_unit.feature:37`.
- ✅ Scenario: Only the home row shows the home mark — `home_location_reference_unit.feature:48`.
- ✅ Scenario: Home in the device time zone — `home_location_reference_unit.feature:56`.
- ✅ Scenario: Travelling — `home_location_reference_unit.feature:65`.
- ✅ Scenario: Home survives a reload — `home_location_storage_unit.feature:6`.
- ✅ Scenario: A list from the previous version — `home_location_storage_unit.feature:14`.
- ✅ Scenario: Home points to a missing location — `home_location_storage_unit.feature:22`.
- ✅ Scenario: Home set in another tab — `home_location_storage_unit.feature:30`.
- ✅ Scenario: Menu of a row that is not home — `home_location_menu_unit.feature:6`.
- ✅ Scenario: Menu of the home row — `home_location_menu_unit.feature:14`.
- ✅ Scenario: Setting home is announced — `home_location_e2e.feature:24`.
- ✅ Scenario: No home item for an unknown zone — `home_location_menu_unit.feature:22`.
- ✅ Scenario: Russian interface — `home_location_e2e.feature:41`.
- ✅ Scenario: Set and clear home — `home_location_view_contract_e2e.feature:10`.
- ✅ Scenario: No accessibility violations — `home_location_e2e.feature:63` outline.
- ✅ Scenario: Narrow and wide screens — `home_location_e2e.feature:81` outline (home Almaty, menu open, 320/2560).
- ✅ Scenario: Screenshots — `locations_ui_e2e.feature:119`, rows `home` and `travelling`.
- ✅ Scenario: Differences from home — `locations_offset_difference_unit.feature:6`.
- ✅ Scenario: DST changes the difference — `locations_offset_difference_unit.feature:20`.
- ✅ Scenario: Differences from the device time zone without home — `locations_offset_difference_unit.feature:32`.
- ✅ Scenario: Same offset, another zone — `locations_offset_difference_unit.feature:40`.
- ✅ Scenario: Unknown zone — `locations_offset_difference_unit.feature:47`.
- ✅ Scenario: A home change updates the differences at once — `locations_offset_difference_unit.feature:53`.
- ✅ Scenario: Texts in both languages — `locations_offset_difference_unit.feature:62`.
- ✅ Scenario: Accessible texts — `locations_offset_difference_unit.feature:77`.
- ✅ Scenario: 50 rows within the work bound — `locations_offset_difference_budget_unit.feature:6`.
- ✅ Scenario: Keyboard — `home_location_e2e.feature:8`.
- ✅ Scenario: The menu does not start a reorder — `home_location_e2e.feature:17`.
- ✅ Scenario: Remove without Pointer Events — `home_location_menu_unit.feature:29`, `home_location_legacy_e2e.feature:6`.
- ✅ Scenario: Close by tapping outside — `home_location_menu_unit.feature:36`, `home_location_legacy_e2e.feature:15`.
- ✅ Scenario: Bundle budget — `check:bundle-size`: 144.2 KB ≤ 150 KB (measured here); `test/locationMenuDependencies.test.ts`.
- ✅ Scenario: Remove from the middle — existing `locations_management.feature`.
- ✅ Scenario: Remove the last location — `locations_management.feature`.
- ✅ Scenario: Location already gone — `locations_management.feature`.
- ✅ Scenario: Remove the home location — `locations_home_removal_unit.feature:6`.
- ✅ Scenario: Rows show city and country — `locations_ui_unit.feature`.
- ✅ Scenario: Empty state after the last removal — `locations_ui_unit.feature` (removal through the menu helper in `locationsUiWorld.tsx`).
- ✅ Scenario: Remove action names the city — `locations_ui_e2e.feature:41`.
- ✅ Scenario: Focus after removal — `locations_view_contract_e2e.feature:49`.
- ✅ Scenario: Focus after the last removal — `locations_view_contract_e2e.feature:55`.
- ✅ Scenario: List survives a reload — `locations_persistence.feature`.
- ✅ Scenario: First launch writes nothing — `locations_persistence.feature`.
- ✅ Scenario: Legacy identifier is canonicalized on load — `locations_persistence.feature`.
- ✅ Scenario: Offline reopen — `locations_ui_e2e.feature:181`.
- ✅ Scenario: Previous document version is migrated — `locations_migration_unit.feature:6`.
- ✅ Scenario: Corrupted document — `locations_storage_ui_unit.feature:6`.
- ✅ Scenario: Newer version — `locations_persistence.feature:31` example "written by a newer version"; `localStorageLocationRepository.test.ts:68`.
- ✅ Scenario: Invalid zone in the document — `locations_persistence.feature:32` example "holding a location in `+05:00`".
- ✅ Scenario: Reset — `locations_storage_ui_unit.feature:12`; the reset passes `homeLocationId: null` (`createLocationsActions.ts:92-96`).
- ✅ Scenario: Home of the wrong type — `locations_storage_ui_unit.feature:45`.
- ✅ Scenario: Added in another tab — `locations_persistence.feature`, `locations_ui_e2e.feature:167`.
- ✅ Scenario: Removed in another tab — `locations_persistence.feature`, `locations_ui_e2e.feature:174`.
- ✅ Scenario: One row matches — `locations_device_time_zone_unit.feature`.
- ✅ Scenario: Icon before the city, caption after it — `locations_here_mark_unit.feature`.
- ✅ Scenario: The former pill is gone — `locations_here_mark_unit.feature`.
- ✅ Scenario: No row matches — `locations_device_time_zone_unit.feature`.
- ✅ Scenario: Several rows match — `locations_device_time_zone_unit.feature`.
- ✅ Scenario: Legacy device identifier — `locations_device_time_zone_unit.feature`.
- ✅ Scenario: Unknown device identifier — `locations_device_time_zone_unit.feature`.
- ✅ Scenario: Badge follows changes of the list — `locations_device_time_zone_unit.feature`.
- ✅ Scenario: Device zone is read once — `locations_device_time_zone_unit.feature`.
- ✅ Scenario: Device zone is read again at the minute boundary — `locations_clock_tick.feature`.
- ✅ Scenario: Device zone is read again when the page becomes visible — `locations_clock_tick.feature`.
- ✅ Scenario: Device zone is not stored — `locations_device_time_zone_unit.feature`.
- ✅ Scenario: The home row shows no here mark — `locations_home_mark_unit.feature:6`.
- ✅ Scenario: Row name includes the badge — `locations_device_time_zone_e2e.feature:9` ("Moscow 2 hours behind").
- ✅ Scenario: 50 rows within the budget — `locations_device_time_zone_unit.feature` (Here mark work bound).
- ✅ Scenario: No accessibility violations with the badge — `locations_device_time_zone_e2e.feature:17` outline.
- ✅ Scenario: Badge fits narrow and wide screens — `locations_device_time_zone_e2e.feature:31` outline.
- ✅ Scenario: List screenshots show the badge — `locations_device_time_zone_e2e.feature:45` outline.
- ✅ Scenario: A marked row has exactly one leading icon — `locations_here_mark_unit.feature:23`; `LocationRow.tsx:137` renders one icon.
- ✅ Scenario: Every mark kind is fully defined — `locations_here_mark_unit.feature`; the exhaustive records `presenter/locationMark.ts:31` and `LocationMarkIcon.tsx:22` include `HOME`.
- ✅ Scenario: Home wins over here — `locations_home_mark_unit.feature:14`.
- ✅ Scenario: Narrow screen — `locations_local_time_e2e.feature:7`.
- ✅ Scenario: Wide screen — `locations_local_time_e2e.feature:17`.
- ✅ Scenario: Times fit narrow and wide screens — `locations_local_time_e2e.feature:27` outline.
- ✅ Scenario: List screenshots show the time and the date — `locations_ui_e2e.feature:119` outline.
- ✅ Scenario: 50 rows within the budget — `locations_local_time_unit.feature` (local time work bound).
- ✅ Scenario: Labels are unchanged by formatter reuse — `locations_local_time_unit.feature`.
- ✅ Scenario: No accessibility violations with times — `locations_local_time_e2e.feature:39`.
- ✅ Scenario: Time does not change the row name and is not announced — `locations_local_time_e2e.feature:53`.
- ✅ Scenario: A 24-hour reference day — `time_selection_day_track.feature:6`.
- ✅ Scenario: Days of 23 and 25 hours — `time_selection_day_track.feature:14`.
- ✅ Scenario: No track for an unknown zone — `time_selection_day_track.feature:27`.
- ✅ Scenario: The day of the home location — `time_selection_day_track.feature:81`.

## Mutation

Measured in this review with `npx stryker run --mutate '<files>'` from `packages/client/`. There were five runs of at most five files each, one at a time:

| File | Score | Survivors |
|---|---|---|
| `src/model/reduceHomeLocation.ts` | 100% | — |
| `src/model/followReferenceZone.ts` | 100% | — |
| `src/model/offsetDifference.ts` | 100% | — |
| `src/model/locationId.ts` | 100% | — |
| `src/model/parseStoredLocations.ts` | 100% | — |
| `src/model/locations.ts` | 100% | — |
| `src/model/referenceMoment.ts` | 100% | — |
| `src/model/locationMark.ts` | 100% | — |
| `src/adapters/locationsDocument.ts` | 97.06% | 1, `if (!migrate)` → `false` at :56 (untouched code; equivalent, because the call then throws and the catch returns `UNREADABLE`) |
| `src/controller/createLocationsActions.ts` | 100% | — |
| `src/presenter/utcOffset.ts` | 94.44% | 1, `< 0` → `<= 0` at :16 (equivalent: both callers return before zero) |
| `src/presenter/offsetDifference.ts` | 97.56% | 1, `> 0` → `>= 0` at :56 (equivalent: zero returns at :38) |
| `src/presenter/presentLocationRows.ts` | 96.00% | 1, at :114 (equivalent: `marks[undefined]` is `undefined`) |
| `src/views/shared/locationMenuKeys.ts` | 100% | — |
| `src/views/shared/LocationMenu.tsx` | 93.83% | 4 survivors and 1 without coverage. The `case NEXT` mutant at :85 is equivalent for the menu's two items. The listener cleanup at :58-59 and the object-ref branch at :132 (no caller passes an object ref) are not observable. |
| `src/views/shared/LocationRow.tsx` | 97.56% | 2 (`:86` untouched country check; `:114` ref callback block) |
| `src/views/shared/LocationList.tsx` | 100% | — |
| `src/views/cards/CardsView.tsx` | 100% | — |
| `src/views/shared/LocationMarkIcon.tsx` | 100% | — |
| `src/controller/useLocations.ts` | 100% | — |
| `src/controller/LocationsProvider.tsx` | 97.22% | 1 (`:131` untouched minute tick counter) |
| `src/presenter/locationMark.ts` | 92.31% | 1 (`:47`, untouched line) |
| `src/adapters/inMemoryLocationRepository.ts` | 100% | — |
| `src/adapters/localStorageLocationRepository.ts` | 98.39% | 1 (`:38`, untouched string) |

Every file is ≥ 90%. No survivor exposes an untested requirement, so this section has no finding.

## Findings

### R1 — WARNING — The travelling state is never checked for horizontal scrolling (NFR-R1)
- Location: `packages/client/src/test/features/home_location/home_location_e2e.feature:80`
- Rule: `.claude/rules/traceability.md` (every NFR has an implementing test), `.claude/rules/test-planning.md` rule 1
- Problem: NFR-R1 reads "There is no horizontal scrolling at 320 px and 2560 px with home set, in the travelling state and with the menu open. The city, the difference and the 'here' caption wrap instead of being cut." The only width check this change adds is the outline at `home_location_e2e.feature:80-91`. It seeds Almaty, Kathmandu and New York with home Almaty, opens a menu and checks 320/2560 px, with no device zone in the list. No scenario seeds the travelling state, whose header row is the longest: Here icon, city, difference and caption. The existing "The <state> state fits" outline at `locations_ui_e2e.feature:77-96` has no `travelling` row, and the `travelling` state is used only by the screenshot outline (375/1024 px) and axe.
- Impact: a layout change that makes the travelling row overflow at 320 px (for example `whitespace-nowrap` on the difference, or removing `flex-wrap` from the header span `LocationRow.tsx:136`) passes CI. That is the exact NFR-R1 condition, so the requirement has no failing test.
- Fix: in `home_location_e2e.feature`, add a scenario outline tagged `@set-home-location-and-show-differences @NFR-R1`, "The travelling state fits a <width> px wide screen". Reuse the existing steps "the screen is <width> px wide for the locations", "the user opens the locations app", "When the locations are in the travelling state" (from `locationsStates.ts`, `LocationsState.TRAVELLING`) and "the locations screen does not scroll horizontally", with examples 320 and 2560.
- Fix risk: low. It only adds E2E examples built from existing steps and an existing state, in the E2E feature where `bdd-e2e.md` puts layout checks. It adds two Playwright runs per project.
- Status: fixed
- Resolution: added the scenario outline "The travelling state fits a <width> px wide screen" (320 and 2560) tagged @NFR-R1 to home_location_e2e.feature, built from existing steps.

### R2 — WARNING — Three test files grew past the 200-line limit
- Location: `packages/client/src/adapters/localStorageLocationRepository.defaults.test.ts:20`
- Rule: `.claude/rules/process-invariants.md` ("Target 100–200 lines per file"), `CLAUDE.md` ("Files must stay under 200 lines"), `tasks.md` "File size: every file stays under 200 lines … Files already near or over that limit get new sibling files instead of more lines"
- Problem: this branch pushed three files over 200 lines. `localStorageLocationRepository.defaults.test.ts` went from 140 to 223: the new `describe("…migration to version 2")` block is lines 20-89. `test/features/date_selection/steps/dateSelectionWorld.tsx` went from 176 to 205 (`setStoredHome`, `useRepository`, `getLocations`, `getBackend`). `test/features/date_selection/steps/date_selection_wall_clock.steps.tsx` went from 178 to 207 (the new scenario "A device time zone change drops the gap note").
- Impact: this breaks the change's own file-size task constraint and the project invariant. The cost is larger files for later changes that touch the same date-selection worlds and the repository tests, which `show-here-entry-for-device-time` will extend next.
- Fix: move the `describe("local storage location repository migration to version 2")` block (lines 20-89) into a new sibling `adapters/localStorageLocationRepository.migration.test.ts`. Move the stored-home seeding of `dateSelectionWorld.tsx` (`setStoredHome`, `useRepository` and the `LOADED` document builder) into a sibling helper module under `test/features/date_selection/steps/`. Move the shared step bodies of `date_selection_wall_clock.steps.tsx` (`givenZone`, `givenInstant`, `givenAppOpen`, `whenNextDay`, `thenNoNote`, lines 35-60, today closures over `world`) into a sibling helper module as functions that take the world, as `time_selection/steps/dayTrackSteps.ts` does. The feature file does not change.
- Fix risk: low. These are pure moves with no behaviour change, and the same tests run before and after. Keep each steps file paired with its feature (`bdd-unit.md`); only helpers move.
- Status: fixed
- Resolution: moved the migration describe to localStorageLocationRepository.migration.test.ts (defaults 151 lines); moved bar/row queries to dateSelectionQueries.tsx and wall-clock helpers to wallClockStepHelpers.ts; every touched file is under 200 lines, same tests run.

### R3 — SUGGESTION — `formatDuration` recomputes the hours and minutes split that `formatSignedHoursMinutes` owns
- Location: `packages/client/src/presenter/offsetDifference.ts:16`
- Rule: `.claude/rules/glossary.md` ("Duplicated logic"), design.md D5 / task goal ("Sign, hours and minutes are shared with formatUtcOffset, not copied")
- Problem: `formatDuration` computes `Math.floor(absoluteMinutes / MINUTES_PER_HOUR)` and `absoluteMinutes % MINUTES_PER_HOUR` (lines 17-18). `formatSignedHoursMinutes` in `presenter/utcOffset.ts:18-20` already computes the same split, and `formatOffsetDifference` calls it at line 46-47 for the same difference. The split is computed twice per row.
- Impact: two owners of the hours/minutes split. A change to it, such as rounding seconds-level offsets, has to be made twice, or the visible label and the accessible text disagree for the same row.
- Fix: return the numeric `minutes` from `formatSignedHoursMinutes` next to `hours` and `minutesPart`. Have `formatDuration` take `hours` and `minutes` from that result instead of dividing again.
- Fix risk: low. `formatSignedHoursMinutes` gains one field, and `presenter/utcOffset.test.ts` and `presenter/offsetDifference.test.ts` keep their expectations.
- Status: fixed
- Resolution: formatSignedHoursMinutes now also returns minutes and formatDuration takes hours and minutes from it; the existing utcOffset and offsetDifference tests keep passing.

### R4 — SUGGESTION — The row decides "can be home" from the presence of a day track
- Location: `packages/client/src/views/shared/LocationRow.tsx:90`
- Rule: `.claude/rules/architecture.md` ("Views … Render presenter output and emit events only"; "One owner per concept")
- Problem: the model owns the rule that a location with an unknown zone cannot be home (`model/reduceHomeLocation.ts:26-29`, `canonicalizeTimeZoneId`). The view re-derives it with `else if (row.dayTrack)` and the comment "A row without a day track has an unknown zone and cannot be home". So the rule now has a second, indirect owner: the presence of a day track.
- Impact: if the presenter ever omits the day track for another reason, the "Make home" item silently disappears from a valid row. If the model's rule changes, the menu offers an item that the reducer rejects with `LOCATION_NOT_FOUND`, and nothing is announced.
- Fix: add a boolean `canBeHome` to the presenter's `LocationRow`, set in `presentLocationRows` from the same zone check the reducer uses (a small exported model predicate, called by `reduceHomeLocation` too). `LocationRow.tsx` then reads `row.canBeHome` instead of `row.dayTrack`.
- Fix risk: moderate scope. It touches the model, the presenter type and the row, and `locationRowFixture.tsx` plus the row tests need the new field. Behaviour is unchanged today.
- Status: rejected (not-worth-it)
- Resolution: behaviour is unchanged today and the reviewer rates the fix as moderate scope (model, presenter type, row, fixtures); a day track exists exactly when the zone is valid, and the reducer rejects an invalid one safely. A suggestion not worth widening the change.

## Verdict

Ready. There are no CRITICAL findings, every task has evidence, and every requirement except NFR-R1 (⚠️, R1) is traced and tested. No finding blocks. R1 and R2 are WARNINGs that should be fixed in the fix-code stage; R3 and R4 are optional.
