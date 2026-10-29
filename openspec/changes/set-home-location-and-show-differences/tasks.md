# Tasks

Builds on the archived `support-legacy-ios-12-safari`: `IS_POINTER_EVENTS_SUPPORTED` (`src/lib/legacy/`), the legacy zone shim, `emulateEngineWithoutPointerEvents` and the `check:bundle-size` / `check:legacy-build` scripts are on main. Nothing blocks the start.

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`.

- **Running tests:** run one command at a time, never in the background. A mutation run takes at most 5 files, and the target is ≥ 95% (minimum 90%, `.claude/rules/tdd-workflow.md`). The report is in `reports/mutation/mutation-report.json`.
- **Time in tests:** use only `fakeClock(instant, timeZone)` or `createSwitchableClock`. Ticks come from `createManualTickScheduler()`, and writes are observed with `createManualWriteScheduler()`.
- **Traceability:** every new test, step file and feature carries `set-home-location-and-show-differences`:
  - `@set-home-location-and-show-differences @FR-X` tags;
  - `// Verifies FR-X of set-home-location-and-show-differences` headers;
  - `Implements FR-X of set-home-location-and-show-differences` in the JSDoc of new or changed production code.
- **Glossary:** names come from `docs/glossary/` and the proposal's "Glossary terms": home location, home mark, offset difference, location menu, reference zone, world clock state. *Never:* words are banned, and the interface says «место», never «локация».
- **File size:** every file stays under 200 lines. Files already near or over that limit get new sibling files instead of more lines: `model/locations.test.ts` (237), `views/shared/LocationRow.test.tsx` (224), `views/shared/LocationList.test.tsx` (196), `controller/LocationsProvider.tsx` (195). **Design references:** "Dn" refers to `design.md`.
- **Test placement:** accessible names, focus, keyboard and layout go into `*_e2e.feature` (`.claude/rules/bdd-unit.md`, "When to Use Unit BDD vs E2E BDD"). Unit BDD covers model, storage and presented values.

## 1. Constants and locale keys (no TDD)

- [ ] 1.1 Set `LOCATIONS_SCHEMA_VERSION = 2` in `constants/locations.ts` (D6). In `locales/en.json` and `locales/ru.json`, add `locations.homeMarkLabel` ("Home location" / «Домашнее место»), `locationMenu` ("Actions for {{city}}" / «Действия: {{city}}»), `makeHome` («Сделать домашним»), `clearHome` («Убрать отметку дома»), `remove` («Удалить»), `homeSetAnnouncement` ("{{city}} is now home" / «{{city}} — теперь домашнее место»), `homeClearedAnnouncement` ("Home cleared" / «Отметка дома снята»), `offsetDifferenceHours`, `offsetDifferenceAhead`, `offsetDifferenceBehind`, `offsetDifferenceSame`, and `durationHours_*` / `durationMinutes_*` (Russian `_one`, `_few`, `_many`; English `_one`, `_other`). Delete the unused `locations.removeLocation` (D5, D7, FR11, FR12). Verify with `npx vitest run src/locales/locales.test.ts`, and check that `grep -rniE "локаци" src/locales` prints nothing.

## 2. Model (TDD)

- [ ] 2.1 TDD the home location (D1): `homeLocationId` and `REMOVE_LOCATION` clearing home in `model/locations.ts`, `SET_HOME_LOCATION` in new `model/reduceHomeLocation.ts`, `REPLACE_LOCATIONS { locations, homeLocationId }` dropping a home that is not in the list, and `canonicalizeLocationId`. Test in new `model/homeLocation.test.ts`:
  - set;
  - move to another location;
  - set again → the same state object;
  - clear;
  - unknown id → `LOCATION_NOT_FOUND`;
  - unknown zone → `LOCATION_NOT_FOUND`;
  - remove home → `null`;
  - add and move keep home;
  - replace with a dangling id → `null`;
  - `canonicalizeLocationId("Europe/Kiev|Kyiv")` → `"Europe/Kyiv|Kyiv"`, and an unknown zone → `undefined`;
  - the command equals `JSON.parse(JSON.stringify(command))`.

  Covers FR1, FR2, FR3, FR10. Verify red, then green, with `npx vitest run src/model/homeLocation.test.ts src/model/locations.test.ts`.
- [ ] 2.2 TDD the body of `getReferenceZone` (D2) in `model/referenceMoment.test.ts`: the home zone when home is set, otherwise the device zone. Extend `model/dayTrack.test.ts` with M3 (home Almaty, device Moscow → `2026-03-07T19:00:00Z`–`2026-03-08T19:00:00Z`). Covers FR4. Verify with `npx vitest run src/model/referenceMoment.test.ts src/model/dayTrack.test.ts`.
- [ ] 2.3 TDD `LocationMarkKind.HOME` and the new `getLocationMarkKind(location, deviceTimeZoneId, homeLocationId)` (D3) in `model/locationMark.test.ts`, with `it.each`: home only, here only, home in the device zone → home, neither → `undefined`. Covers FR7. Verify with `npx vitest run src/model/locationMark.test.ts`.
- [ ] 2.4 TDD new `model/offsetDifference.ts` (D4) in `model/offsetDifference.test.ts`:
  - M2 values: Moscow −120, Kolkata 30, New York −540, and New York −600 at `06:30Z`;
  - `getReferenceOffsetMinutes` with home Almaty and device Moscow → 300;
  - the home row → `undefined`;
  - without home, a row in the device zone → `undefined`;
  - Minsk with Moscow home → 0;
  - an unknown row offset → `undefined`.

  Covers FR5. `src/test/noBigIntInSources.test.ts` must stay green. Verify with `npx vitest run src/model/offsetDifference.test.ts src/test/noBigIntInSources.test.ts`.
- [ ] 2.5 TDD the v2 payload in `model/parseStoredLocations.ts` (D6), in `model/parseStoredLocations.test.ts`:
  - `homeLocationId` as a string or `null` is read;
  - a missing one → `null`;
  - a number → rejected;
  - a legacy-alias id → canonical;
  - a dangling id → `null`.

  Covers FR8, FR9. Verify with `npx vitest run src/model/parseStoredLocations.test.ts`.
- [ ] 2.6 Mutation run (M6): `npx stryker run --mutate 'src/model/locations.ts,src/model/reduceHomeLocation.ts,src/model/referenceMoment.ts,src/model/locationMark.ts,src/model/offsetDifference.ts'` scores ≥ 95% (minimum 90%). Add tests for the survivors and run it again.

## 3. Ports and adapters (TDD)

- [ ] 3.1 TDD `StoredLocations`, `LocationsLoadResult.LOADED { locations, homeLocationId }` and `save({ locations, homeLocationId })` in `ports/locationRepository.ts` (D6). Extend `adapters/locationRepository.contract.ts` so that it runs against both adapters: save and load home, `clear` drops it, and an external change carries home (FR8, FR10). Verify with `npx vitest run src/adapters/locationRepository.test.ts src/adapters/localStorageLocationRepository.test.ts`.
- [ ] 3.2 TDD the migration `LOCATION_MIGRATIONS[1]` and the v2 serializer in `adapters/locationsDocument.ts` (D6), in `adapters/localStorageLocationRepository.defaults.test.ts`:
  - a v1 fixture with 3 locations loads as `LOADED` in the same order, with `homeLocationId: null` (M4);
  - a v2 document whose home is missing from its list loads with `null` (M4);
  - a v3 document stays `UNREADABLE`.

  Verify with `npx vitest run src/adapters/localStorageLocationRepository.defaults.test.ts`.
- [ ] 3.3 Mutation run: `npx stryker run --mutate 'src/adapters/locationsDocument.ts,src/adapters/localStorageLocationRepository.ts,src/adapters/inMemoryLocationRepository.ts,src/model/parseStoredLocations.ts'` scores ≥ 95%.

## 4. Presenter (TDD)

- [ ] 4.1 Extract `formatSignedHoursMinutes` from `presenter/utcOffset.ts` (D5). The existing `presenter/utcOffset.test.ts` stays green without changes, which proves the refactor kept the behaviour. Then TDD new `presenter/offsetDifference.ts` (`formatOffsetDifference`) with the text and accessible-text tables of the `locations` delta ("Offset difference text", "Offset difference accessible text"), in English and Russian. Covers FR6, NFR-A3. Verify with `npx vitest run src/presenter/utcOffset.test.ts src/presenter/offsetDifference.test.ts`.
- [ ] 4.2 TDD `presentLocationRows` with `homeLocationId` and `referenceOffsetMinutes` in `LocationRowsContext` (D4, D5), in new `presenter/presentLocationRows.home.test.ts`:
  - `offsetDifferenceLabel` and `offsetDifferenceAccessibleLabel` for M2;
  - the home mark through `LOCATION_MARK_TEXT_KEYS[HOME]`, labelled «Домашнее место», with no caption;
  - travelling: Moscow has the Here mark and `−2 h`.

  Covers FR5, FR7. Verify with `npx vitest run src/presenter/presentLocationRows.home.test.ts src/presenter/presentLocationRows.test.ts src/presenter/locationMark.test.ts`.
- [ ] 4.3 Mutation run: `npx stryker run --mutate 'src/presenter/utcOffset.ts,src/presenter/offsetDifference.ts,src/presenter/presentLocationRows.ts,src/presenter/locationMark.ts'` scores ≥ 95%.

## 5. Controller (TDD)

- [ ] 5.1 TDD `setHomeLocation` (D1, D4, D6). Move the action builders of `controller/LocationsProvider.tsx` into new `controller/createLocationsActions.ts`, add `setHomeLocation` there, and expose it through `controller/locationsContext.ts` and `useLocations.ts`. `useLocations` passes `homeLocationId` and `getReferenceOffsetMinutes(state, instant)`. Add `setHomeLocation` to the key list in `controller/useLocations.test.tsx`. Test in new `controller/useLocations.home.test.tsx`, with the in-memory repository, the switchable clock and the manual write scheduler:
  - setting home schedules 1 write that carries home;
  - setting the same home writes nothing;
  - opening with a v1 document writes nothing;
  - an external change with home applies it;
  - the reset leaves no home;
  - a home change keeps a pinned instant (`useReferenceMoment`).

  Covers FR3, FR4, FR8, FR10. Verify with `npx vitest run src/controller/useLocations.home.test.tsx src/controller/useLocations.test.tsx`.
- [ ] 5.2 Mutation run: `npx stryker run --mutate 'src/controller/LocationsProvider.tsx,src/controller/createLocationsActions.ts,src/controller/useLocations.ts'` scores ≥ 95%.

## 6. Views (TDD)

- [ ] 6.1 TDD new `views/shared/locationMenuKeys.ts` with `it.each` over the WAI-ARIA menu button keys of D7: Enter, Space, ArrowDown, ArrowUp, Home, End, Esc, Tab, and any other key → `undefined` (NFR-A2). Verify with `npx vitest run src/views/shared/locationMenuKeys.test.ts`.
- [ ] 6.2 TDD new `views/shared/LocationMenu.tsx` (D7) in `views/shared/LocationMenu.test.tsx`:
  - roles and `aria-expanded`;
  - a click opens it;
  - Enter opens it on the first item;
  - Esc closes it and focuses the trigger again;
  - an item click calls its action and closes the menu;
  - `pointerdown` outside closes it.

  Add a second file, `views/shared/LocationMenu.legacy.test.tsx`. It removes `PointerEvent` with `vi.stubGlobal("PointerEvent", undefined)`, calls `vi.resetModules()` and imports the module again, as `views/shared/DayTrack.legacy.test.tsx` does. There, a click opens the menu, "Remove" calls remove, and `touchstart` outside closes it (FR14, M5). Verify with `npx vitest run src/views/shared/LocationMenu.test.tsx src/views/shared/LocationMenu.legacy.test.tsx`.
- [ ] 6.3 TDD the row changes (D3, D8) in new `views/shared/LocationRow.home.test.tsx`:
  - the menu replaces the remove button;
  - "Make home" / "Clear home", and no home item for an unknown zone;
  - the difference after the city and before the caption, with `aria-hidden`;
  - `aria-labelledby` lists the city, mark and difference ids.

  Extend `views/shared/LocationMarkIcon.test.tsx`: test that `HOME` renders the house icon in the accent colour at `LOCATION_MARK_ICON_SIZE_PX`. Update the remove clicks in `views/shared/LocationRow.test.tsx` to go through the menu. Covers FR7, FR11, NFR-A3, UX1, UX2. Verify with `npx vitest run src/views/shared/LocationRow.home.test.tsx src/views/shared/LocationMarkIcon.test.tsx src/views/shared/LocationRow.test.tsx`.
- [ ] 6.4 TDD focus and announcements in new `views/shared/LocationList.menu.test.tsx` and in `views/cards/CardsView.test.tsx`:
  - after a removal, focus goes to the next row's menu button;
  - after a home change, focus stays on the same row's menu button;
  - "Almaty is now home" and "Home cleared" are announced politely.

  Update the "Remove Tokyo" and "Remove Alpha" clicks of `LocationList.test.tsx` and `CardsView.test.tsx` to go through the menu. Covers FR11, NFR-A2. Verify with `npx vitest run src/views/shared/LocationList.menu.test.tsx src/views/shared/LocationList.test.tsx src/views/cards/CardsView.test.tsx`.
- [ ] 6.5 Write new `test/locationMenuDependencies.test.ts` (`// Verifies NFR-P2 of set-home-location-and-show-differences`). It reads `package.json` and `src/views/shared/LocationMenu.tsx` as text. It asserts that no `@radix-ui/react-dropdown-menu` or other menu package is a dependency, and that the menu imports only `react`, `react-i18next`, `lucide-react` and `@/` modules (D7). The spec scenario "Bundle budget" itself is verified by `check:bundle-size` in 10.2. Verify with `npx vitest run src/test/locationMenuDependencies.test.ts`.
- [ ] 6.6 Mutation run: `npx stryker run --mutate 'src/views/shared/LocationMenu.tsx,src/views/shared/locationMenuKeys.ts,src/views/shared/LocationRow.tsx,src/views/shared/LocationList.tsx,src/views/cards/CardsView.tsx'` scores ≥ 95%. Then run `npx stryker run --mutate 'src/views/shared/LocationMarkIcon.tsx'` alone.

## 7. Unit BDD (vitest-cucumber)

- [ ] 7.1 Write `test/features/home_location/home_location_unit.feature` and `steps/home_location_unit.steps.tsx` with the `home-location` scenarios that need no browser:
  - "Make Almaty home", "Home moves to another location", "Location already gone", "Clear home";
  - "Removing home clears it", "The first added location is not home", "Reorder keeps home in place";
  - "The day follows home while travelling", "Clearing home returns to the device day", "A pinned moment keeps its instant";
  - "Only the home row shows the home mark", "Home in the device time zone", "Travelling";
  - "Home survives a reload", "A list from the previous version", "Home points to a missing location", "Home set in another tab";
  - "Menu of a row that is not home", "Menu of the home row", "No home item for an unknown zone".

  Tag each scenario with `@set-home-location-and-show-differences` and its FR. Covers FR1–FR4, FR7–FR11. Verify with `npx vitest run src/test/features/home_location/steps/home_location_unit.steps.tsx`.
- [ ] 7.2 Write `test/features/locations/locations_offset_difference_unit.feature` and its steps with these `locations` delta scenarios:
  - "Differences from home", "DST changes the difference", "Differences from the device time zone without home", "Same offset, another zone", "Unknown zone";
  - "A home change updates the differences at once";
  - "Texts in both languages", "Accessible texts";
  - "50 rows within the work bound": `startWorkCount()` (ADR-0008) plus the `toZonedDateTimeISO` count of D4.

  Covers FR5, FR6, NFR-A3, NFR-P1. Extend `test/benchmarks/rowPresenting.bench.ts` with a home set. Verify with `npx vitest run src/test/features/locations/steps/locations_offset_difference_unit.steps.tsx`, then run the benchmark once with `npx vitest bench --run --mode test src/test/benchmarks/rowPresenting.bench.ts` (it reports the timing and does not fail on it, ADR-0008).
- [ ] 7.3 Write `test/features/home_location/home_location_menu_unit.feature` and its steps with "Remove without Pointer Events" and "Close by tapping outside" (FR14). The steps use the legacy setup of 6.2. Verify with `npx vitest run src/test/features/home_location/steps/home_location_menu_unit.steps.tsx`.
- [ ] 7.4 Add the modified scenarios of the deltas to their existing unit features and steps, one feature file per run:
  - "Remove the home location" → `locations/locations_management.feature`;
  - "Previous document version is migrated" → `locations/locations_persistence.feature`;
  - "Home of the wrong type" → `locations/locations_storage_ui_unit.feature`;
  - "The home row shows no here mark", "Home wins over here" → `locations/locations_here_mark_unit.feature`;
  - "The day of the home location" → `time_selection/time_selection_day_track.feature`;
  - "A home change keeps the pinned moment" → `date_selection/date_selection_reference_moment.feature`.

  Update the steps that remove a location through the former button (`locations_management.steps.ts`, `locations_persistence.steps.ts`, the `*World.tsx` helpers). Covers FR3, FR4, FR7, FR8. Verify each feature's steps file alone with `npx vitest run <steps file>`.

## 8. E2E BDD (playwright-bdd) and screenshots

- [ ] 8.1 Write `test/features/home_location/home_location_e2e.feature` and `steps/home_location_e2e.steps.ts`. It covers:
  - the menu by pointer and keyboard ("Keyboard", "The menu does not start a reorder");
  - "Setting home is announced" (the announcement and the focus);
  - "Russian interface" (menu and mark names);
  - axe-core in the states no home, home, travelling and menu open, in both themes (NFR-A1);
  - "Narrow and wide screens": no horizontal scrolling at 320 px and 2560 px with the menu open (NFR-R1);
  - the difference placed after the city and before the caption (UX1);
  - a hit area of 44 px or more (UX3).

  Covers FR11, FR12, NFR-A1, NFR-A2, NFR-R1, UX1, UX3. Verify with `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "@set-home-location-and-show-differences"`.
- [ ] 8.2 Write `test/features/home_location/home_location_legacy_e2e.feature` and its steps. With `emulateEngineWithoutPointerEvents(page)` (`src/test/e2e/withoutPointerEvents.ts`) and taps through `startTouch` / `dispatchTouch`, it runs "Remove without Pointer Events" and "Close by tapping outside" in Chromium (FR14). Verify with the command of 8.1.
- [ ] 8.3 Write `test/features/home_location/home_location_view_contract_e2e.feature` with the `@view-contract` scenario "Set and clear home" (FR13). Verify with `npx playwright test -c playwright.bdd.config.ts --project view-contract-cards --grep "@set-home-location-and-show-differences"`.
- [ ] 8.4 Update the existing E2E features and steps to the modified scenarios:
  - "Row name includes the badge" in `locations_device_time_zone_e2e.feature`: Moscow is named "Moscow 2 hours behind";
  - "Time does not change the row name" in `locations_local_time_e2e.feature`: the same;
  - "Remove action names the city" in `locations_ui_e2e.feature`: "Actions for Moscow" and "Remove";
  - "Focus after removal" in `locations_view_contract_e2e.feature`: the menu button of Kolkata;
  - `removeButton` in `locationsE2eHelpers.ts` opens the menu first.

  Tag each changed scenario with `@set-home-location-and-show-differences @NFR-A3` or `@FR11`. Covers NFR-A3, FR11. Verify with `npx playwright test -c playwright.bdd.config.ts --grep "Row name includes|Time does not change the row name|Remove action names|Focus after"`.
- [ ] 8.5 Add the `home` and `travelling` states to `test/features/locations/steps/locationsStates.ts`, and add them to the screenshot outline of `locations_ui_e2e.feature` (375 / 1024 px × light / dark). Re-approve every existing baseline with rows under `test/features/__screenshots__/{chromium,mobile-chrome}/` with `--update-snapshots` (NFR-R2). Then check that `npx playwright test -c playwright.bdd.config.ts --grep Screenshot` passes without that flag.

## 9. Handoff patches (files the implement stage may not edit)

- [ ] 9.1 Handoff H1: write `handoff/H1-glossary-home-location.patch` and its README section (`.gnomish/stages/specify/handoff.md`, "Handoff items"). The patch updates `docs/glossary/`:
  - `time.md`: Home location and Offset difference lose *(planned)* and get *RU:* and *Code:* (`homeLocationId`, `SET_HOME_LOCATION`; `getOffsetDifferenceMinutes`, `formatOffsetDifference`). The examples become `−2 h` / `+0:30`. The *Code:* of Reference zone notes that it reads the home location;
  - `locations.md`: new Home mark (`LocationMarkKind.HOME`) and Location menu (`LocationMenu`, *Never:* context menu, kebab). World clock state holds home. Location list is schema version 2 and stores home. Unreadable stored list gets the *Not:* for a dangling home;
  - `views.md`: Shared block lists the location menu and the home mark icon.

  Verify from the repository root with `git apply --check openspec/changes/set-home-location-and-show-differences/handoff/H1-glossary-home-location.patch` and `git status --short docs` (it must print nothing).
- [ ] 9.2 Handoff H2: write `handoff/H2-architecture-docs-home-location.patch` and its README section. The patch updates:
  - `docs/architecture/views.md`: in "Row header", the difference format `−2 h` / `+0:30` / `0 h`, with home over here; in "Shared building blocks", the location menu;
  - `docs/architecture/domain-model.md`: `REPLACE_LOCATIONS(locations, homeLocationId)`, the mark priority home > here, and the load normalization next to invariant 1;
  - `docs/adr/0004-local-persistence-strategy.md`: a note under "Versioned schema from day one" on the load normalization of a dangling reference (D6).

  Verify from the repository root with `git apply --check openspec/changes/set-home-location-and-show-differences/handoff/H2-architecture-docs-home-location.patch` and `git status --short docs` (it must print nothing).
- [ ] 9.3 Handoff H3: write the README section "H3: Device acceptance on iOS 12.5.7" (no patch). Its steps: open a location menu by tap, make a location home, clear home, remove a location, and tap outside an open menu. Verify from the repository root with `grep -c "^## H" openspec/changes/set-home-location-and-show-differences/handoff/README.md` (it must print 3).

## 10. Final verification

- [ ] 10.1 Traceability (M1): this loop must print nothing.

  ```
  for id in FR1 FR2 FR3 FR4 FR5 FR6 FR7 FR8 FR9 FR10 FR11 FR12 FR13 FR14 NFR-P1 NFR-P2 NFR-A1 NFR-A2 NFR-A3 NFR-R1 NFR-R2 UX1 UX2 UX3; do
    grep -rqE "set-home-location-and-show-differences.*(^|[^A-Za-z0-9-])@?$id([^0-9]|$)|(^|[^A-Za-z0-9-])@?$id([^0-9]|$).*set-home-location-and-show-differences" src || echo "missing $id"
  done
  ```
- [ ] 10.2 Run each command alone, in this order: `pnpm --filter @time-zones/client typecheck`, `pnpm --filter @time-zones/client lint`, `pnpm --filter @time-zones/client test`, `pnpm run build`, then `pnpm --filter @time-zones/client check:bundle-size` (initial JavaScript ≤ 150 KB gzipped, NFR-P2, M5) and `pnpm --filter @time-zones/client check:legacy-build`. Then run `pnpm --filter @time-zones/client test:bdd` once, alone, and fix any existing feature that still used the former remove button.
- [ ] 10.3 Check the glossary (`.claude/rules/glossary.md`, "Review checklist"). `grep -rniE "локаци" src/locales`, `grep -rn "GMT" src/locales` and `grep -rniE "context menu|kebab" src` print nothing.

## Human follow-up

The operator reviews these on the PR that the deliver stage opens, then applies the patches.

- H1 (FR5, FR7, FR11): apply `handoff/H1-glossary-home-location.patch`. It adds Home mark and Location menu and implements Home location and Offset difference in `docs/glossary/`.
  Why manual: the implement stage writes only under `packages/`, and the glossary lives in `docs/glossary/`.
  Automated part: the code names are checked by `typecheck` and by the greps in 10.3, and `git apply --check` in 9.1 proves that the patch applies.
- H2 (FR4, FR7, FR9, FR11): apply `handoff/H2-architecture-docs-home-location.patch`. It updates `docs/architecture/views.md` and `docs/architecture/domain-model.md`, and adds the load normalization note to `docs/adr/0004-local-persistence-strategy.md`.
  Why manual: the factory may not write `docs/adr/`, and the implement stage writes only under `packages/`.
  Automated part: the behaviour these documents describe is covered by the unit and E2E features of sections 7 and 8, and `git apply --check` in 9.2 proves that the patch applies.
- H3 (FR14): run the device acceptance in the `handoff/README.md` section H3 on the owner's iOS 12.5.7 device.
  Why manual: no automated runner provides iOS Safari 12 (NG9 of `support-legacy-ios-12-safari`), and the check needs the owner's physical device.
  Automated part: the menu is tested with `PointerEvent` removed in jsdom (6.2, 7.3) and by tap in Chromium with Pointer Events suppressed (8.2).
