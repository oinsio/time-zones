# Tasks

Depends on: `support-legacy-ios-12-safari`. Start this change only after that change is archived, because these tasks use its `IS_POINTER_EVENTS_SUPPORTED` (`src/lib/legacy/`), its legacy zone shim and its bundle check.

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`.

- **Running tests:** run one command at a time, never in the background. A mutation run takes at most 5 files. Its report is in `reports/mutation/mutation-report.json`.
- **Time in tests:** use only `fakeClock(instant, timeZone)` or `createSwitchableClock`. Ticks come from `createManualTickScheduler()`, and writes are observed with `createManualWriteScheduler()`.
- **Traceability:** every new test, step file and feature carries `set-home-location-and-show-differences`:
  - `@set-home-location-and-show-differences @FR-X` tags;
  - `// Verifies FR-X of set-home-location-and-show-differences` headers;
  - `Implements FR-X of set-home-location-and-show-differences` in the JSDoc of new or changed production code.
- **Glossary:** names come from `docs/glossary/`: home location, home mark, offset difference, location menu, reference zone, world clock state. *Never:* words are banned, and in the interface «место» is used, never «локация».
- **File size:** every file stays under 200 lines. **Design references:** "Dn" refers to `design.md`.

## 1. Glossary, constants and locale keys (no TDD)

- [ ] 1.1 Update `docs/glossary/`. Each entry follows the README format.
  - `time.md`: Home location and Offset difference lose *(planned)* and get *RU:* and *Code:*. Reference zone *Code:* notes the home.
  - `locations.md`: new Home mark and Location menu (with *Never:* context menu, kebab); World clock state holds home; Location list is schema version 2 and stores home; Unreadable stored list gets the *Not:* for a dangling home.
  - `views.md`: Shared block lists the location menu.

  Verify that `grep -rniE "context menu|kebab" packages/client/src docs/architecture openspec/specs` finds nothing new (proposal "Glossary terms").
- [ ] 1.2 Set `LOCATIONS_SCHEMA_VERSION = 2` in `constants/locations.ts` (D6). Add `locations.homeMarkLabel`, `locationMenu` ("Actions for {{city}}" / «Действия: {{city}}»), `makeHome`, `clearHome`, `remove`, `homeSetAnnouncement`, `homeClearedAnnouncement`, `offsetDifferenceHours`, `offsetDifferenceAhead`, `offsetDifferenceBehind`, `offsetDifferenceSame`, and `durationHours_*` / `durationMinutes_*` with every plural form to `locales/en.json` and `locales/ru.json` (D5, FR11, FR12). Verify with `npx vitest run src/locales/locales.test.ts`.

## 2. Model (TDD)

- [ ] 2.1 TDD the home location in `model/locations.ts` (D1): `homeLocationId`, `SET_HOME_LOCATION`, `REMOVE_LOCATION` clearing home, and `REPLACE_LOCATIONS { locations, homeLocationId }` dropping a home that is not in the list. Test in new `model/homeLocation.test.ts`:
  - set;
  - move to another location;
  - set again → the same state object;
  - clear;
  - unknown id → `LOCATION_NOT_FOUND`;
  - unknown zone → `LOCATION_NOT_FOUND`;
  - remove home → `null`;
  - add and move keep home;
  - replace with a dangling id → `null`;
  - the command equals `JSON.parse(JSON.stringify(command))`.

  Covers FR1, FR2, FR3, FR10. Verify red, then green, with `npx vitest run src/model/homeLocation.test.ts`.
- [ ] 2.2 TDD the body of `getReferenceZone` (D2) in `model/referenceMoment.test.ts`: home zone when set, device zone otherwise. Extend `model/dayTrack.test.ts` with M3 (home Almaty, device Moscow → `2026-03-07T19:00:00Z`–`2026-03-08T19:00:00Z`). Covers FR4. Verify with `npx vitest run src/model/referenceMoment.test.ts src/model/dayTrack.test.ts`.
- [ ] 2.3 TDD `LocationMarkKind.HOME` and the new `getLocationMarkKind(location, deviceTimeZoneId, homeLocationId)` (D3) in `model/locationMark.test.ts` with `it.each`: home only, here only, home in the device zone → home, neither → `undefined`. Covers FR7. Verify with `npx vitest run src/model/locationMark.test.ts`.
- [ ] 2.4 TDD new `model/offsetDifference.ts` (D4) in `model/offsetDifference.test.ts`:
  - M2 values: Moscow −120, Kolkata 30, New York −540, New York −600 at `06:30Z`;
  - the home row → `undefined`;
  - without home, a row in the device zone → `undefined`;
  - Minsk with Moscow home → 0;
  - an unknown zone → `undefined`.

  The test spies on `getUtcOffsetMinutes` to prove the reference offset is read once per presentation. The module uses no `epochNanoseconds` and no `toZonedDateTime` (legacy note in D4). Covers FR5, NFR-P1. Verify with `npx vitest run src/model/offsetDifference.test.ts`.
- [ ] 2.5 TDD the v2 payload in `model/parseStoredLocations.ts` (D6) in `model/parseStoredLocations.test.ts`: `homeLocationId` string, `null`, missing → `null`, a number → rejected, a legacy-alias id → canonical, a dangling id → `null`. Covers FR8, FR9. Verify with `npx vitest run src/model/parseStoredLocations.test.ts`.
- [ ] 2.6 Mutation run (M6). `npx stryker run --mutate 'src/model/locations.ts,src/model/referenceMoment.ts,src/model/locationMark.ts,src/model/offsetDifference.ts,src/model/parseStoredLocations.ts'` must score ≥ 95% (minimum 90%).

## 3. Ports and adapters (TDD)

- [ ] 3.1 TDD `LocationsLoadResult.LOADED { locations, homeLocationId }` and `save({ locations, homeLocationId })` in `ports/locationRepository.ts`. Extend `adapters/locationRepository.contract.ts` so that it runs against both adapters: save and load home, `clear` drops it, and an external change carries home (FR8, FR10). Verify with `npx vitest run src/adapters/locationRepository.test.ts src/adapters/localStorageLocationRepository.test.ts`.
- [ ] 3.2 TDD the migration `LOCATION_MIGRATIONS[1]` and the v2 serializer in `adapters/locationsDocument.ts` (D6). Use a v1 fixture with 3 locations: it loads as `LOADED` with the same order and `homeLocationId: null` (M4). A v3 document stays `UNREADABLE`. Verify with `npx vitest run src/adapters/localStorageLocationRepository.defaults.test.ts`.
- [ ] 3.3 Mutation run: `npx stryker run --mutate 'src/adapters/locationsDocument.ts,src/adapters/localStorageLocationRepository.ts,src/adapters/inMemoryLocationRepository.ts'` must score ≥ 95%.

## 4. Presenter (TDD)

- [ ] 4.1 TDD the extraction of `formatSignedHoursMinutes` from `presenter/utcOffset.ts` (D5). The existing `presenter/utcOffset.test.ts` stays green unchanged, which proves the refactor kept the behaviour. Then TDD new `presenter/offsetDifference.ts` (`formatOffsetDifference`) with the text and accessible-text tables of the `locations` delta ("Offset difference text", "Offset difference accessible text") in English and Russian. Covers FR6, NFR-A3. Verify with `npx vitest run src/presenter/utcOffset.test.ts src/presenter/offsetDifference.test.ts`.
- [ ] 4.2 TDD `presentLocationRows` (D5) in `presenter/presentLocationRows.test.ts`:
  - `offsetDifferenceLabel` and `offsetDifferenceAccessibleLabel` for M2;
  - the home mark through `LOCATION_MARK_TEXT_KEYS[HOME]`, with label «Домашнее место» and no caption;
  - travelling: Moscow has the here mark and `−2 h`.

  Covers FR5, FR7. Verify with `npx vitest run src/presenter/presentLocationRows.test.ts`.
- [ ] 4.3 Mutation run: `npx stryker run --mutate 'src/presenter/utcOffset.ts,src/presenter/offsetDifference.ts,src/presenter/presentLocationRows.ts,src/presenter/locationMark.ts'` must score ≥ 95%.

## 5. Controller (TDD)

- [ ] 5.1 TDD `setHomeLocation` in `controller/locationsContext.ts`, `LocationsProvider.tsx` and `useLocations.ts` (D1, D6). Use new `controller/useLocations.home.test.tsx` with the in-memory repository, the switchable clock and the manual write scheduler:
  - setting home schedules 1 write;
  - setting the same home writes nothing;
  - opening with a v1 document writes nothing;
  - an external change with home applies it;
  - a home change keeps a pinned instant (`useReferenceMoment`).

  Covers FR4, FR8, FR10. Verify with `npx vitest run src/controller/useLocations.home.test.tsx`.

## 6. Views (TDD)

- [ ] 6.1 TDD new `views/shared/locationMenuKeys.ts` with `it.each` over the WAI-ARIA menu button keys of D7: Enter, Space, ArrowDown, ArrowUp, Home, End, Esc, Tab, and the others → `undefined` (NFR-A2). Verify with `npx vitest run src/views/shared/locationMenuKeys.test.ts`.
- [ ] 6.2 TDD new `views/shared/LocationMenu.tsx` (D7) in `views/shared/LocationMenu.test.tsx`:
  - roles and `aria-expanded`;
  - a click opens it;
  - Enter opens it on the first item;
  - Esc closes it and refocuses the trigger;
  - an item click calls its action and closes the menu;
  - `pointerdown` outside closes it.

  Add a second file `views/shared/LocationMenu.legacy.test.tsx` that removes `PointerEvent` with `vi.stubGlobal("PointerEvent", undefined)` and re-imports the module (as `support-legacy-ios-12-safari` tests do). There, a click opens the menu, "Remove" calls remove, and `touchstart` outside closes it (FR14, M5). Verify with `npx vitest run src/views/shared/LocationMenu.test.tsx src/views/shared/LocationMenu.legacy.test.tsx`.
- [ ] 6.3 TDD the row changes in `views/shared/LocationRow.test.tsx` (D3, D8):
  - the menu replaces the remove button;
  - "Make home" / "Clear home" / no home item for an unknown zone;
  - the difference after the city, before the caption, with `aria-hidden`;
  - `aria-labelledby` reads city, mark and difference ("Moscow 2 hours behind");
  - `LocationMarkIcon` renders the house for `HOME`.

  Covers FR7, FR11, NFR-A3, UX1, UX2. Verify with `npx vitest run src/views/shared/LocationRow.test.tsx src/views/shared/LocationMarkIcon.test.tsx`.
- [ ] 6.4 TDD focus and announcements in `views/shared/LocationList.test.tsx` and `views/cards/CardsView.test.tsx`:
  - after a removal, focus goes to the next row's menu button;
  - after a home change, focus stays on the same row's menu button;
  - "Almaty is now home" and "Home cleared" are announced politely.

  Covers FR11, NFR-A2. Verify with `npx vitest run src/views/shared/LocationList.test.tsx src/views/cards/CardsView.test.tsx`.
- [ ] 6.5 Mutation run: `npx stryker run --mutate 'src/views/shared/LocationMenu.tsx,src/views/shared/locationMenuKeys.ts,src/views/shared/LocationRow.tsx,src/views/shared/LocationList.tsx,src/views/cards/CardsView.tsx'` must score ≥ 95%.

## 7. Unit BDD (vitest-cucumber)

- [ ] 7.1 Write `test/features/home_location/home_location_unit.feature` and its steps with the scenarios of `specs/home-location/spec.md` that need no browser: make, move, clear, gone, list changes, reference zone (3), home mark and precedence, kept on the device, previous version, dangling home, tabs, localized strings. Tag each scenario with `@set-home-location-and-show-differences` and its FR. Verify with `npx vitest run src/test/features/home_location`.
- [ ] 7.2 Write `test/features/locations/locations_offset_difference_unit.feature` and its steps with the `locations` delta scenarios "Differences from home", "DST changes the difference", "Differences from the device time zone without home", "Same offset, another zone", "Unknown zone", "A home change updates the differences at once", the two text tables, and "50 rows within the work bound" (`startWorkCount()`, ADR-0008). Covers FR5, FR6, NFR-A3, NFR-P1. Extend `test/benchmarks/rowPresenting.bench.ts` with home set. Verify with `npx vitest run src/test/features/locations/steps/locations_offset_difference_unit.steps.ts`.
- [ ] 7.3 Write `test/features/home_location/home_location_menu_unit.feature` with "Remove without Pointer Events" and "Close by tapping outside" (FR14), driven by the legacy setup of 6.2. Add the modified scenarios of the `locations`, `time-selection` and `date-selection` deltas to their existing unit features:
  - "Remove the home location";
  - "Previous document version is migrated";
  - "Home of the wrong type";
  - "The home row shows no here mark";
  - "Home wins over here";
  - "The day of the home location";
  - "A home change keeps the pinned moment".

  Also update "Row name includes the badge". Verify each feature file alone.

## 8. E2E BDD (playwright-bdd) and screenshots

- [ ] 8.1 Write `test/features/home_location/home_location_e2e.feature` and its steps. It covers:
  - the menu by pointer and keyboard ("Keyboard", "The menu does not start a reorder");
  - announcements;
  - axe-core in the states no home, home, travelling and menu open, in both themes (NFR-A1);
  - no horizontal scrolling at 320 px and 2560 px with the menu open (NFR-R1);
  - the difference placed before the caption (UX1);
  - a hit area of 44 px or more (UX3).

  Verify with `npx playwright test -c playwright.bdd.config.ts --grep @set-home-location-and-show-differences`.
- [ ] 8.2 Write `test/features/home_location/home_location_view_contract_e2e.feature` with the `@view-contract` scenario "Set and clear home" (FR13). Verify with `npx playwright test -c playwright.bdd.config.ts --project view-contract-cards --grep @set-home-location-and-show-differences`.
- [ ] 8.3 Add the `home` and `travelling` states to `test/features/locations/steps/locationsStates.ts` and to the screenshot outline (375 / 1024 px × light / dark). Re-approve every existing baseline with rows under `test/features/__screenshots__/{chromium,mobile-chrome}/` with `--update-snapshots` (NFR-R2). Then verify that `npx playwright test -c playwright.bdd.config.ts --grep Screenshot` passes without it.

## 9. Docs

- [ ] 9.1 Update the docs:
  - `docs/architecture/views.md`:
    - "Row header": the offset difference format `−2 h` / `+0:30` / `0 h`, and home over here;
    - "Shared building blocks": the location menu;
    - "View contract": set and clear home is already listed.
  - `docs/architecture/domain-model.md`:
    - `SET_HOME_LOCATION`, `REPLACE_LOCATIONS` with home, `getLocationMarkKind` with home;
    - invariant 1 with the load normalization.
  - `docs/adr/0004-local-persistence-strategy.md`: a note under "Versioned schema" on the load normalization of a dangling reference (D6).

  The README is already aligned and is not part of this task.

## 10. Final verification

- [ ] 10.1 Traceability (M1): every id of FR1–FR14, NFR-P1, NFR-P2, NFR-A1–NFR-A3, NFR-R1, NFR-R2 and UX1–UX3 appears together with `set-home-location-and-show-differences` in `src` (the same `grep` loop as in the archived `add-time-sliders-to-location-cards` task 8.1).
- [ ] 10.2 Run `pnpm --filter @time-zones/client typecheck`, `lint` and `test`, then `pnpm run build`, one at a time. `scripts/check-bundle-size.mjs` must report the initial JavaScript at 150 KB gzipped or less (NFR-P2, M5). Then run `pnpm --filter @time-zones/client test:bdd` once, alone. Fix the existing features that clicked the former remove button (`locations_ui_e2e`, `locations_view_contract_e2e`, reorder). Ask the user to run the full `pnpm test:mutation` and share the report.
- [ ] 10.3 Check the glossary (`.claude/rules/glossary.md` "Review checklist"). `grep -rniE "локаци" src/locales` finds nothing. `grep -rn "GMT" src --include=*.json` finds nothing new.

## Workflow follow-up

- Manual check on the iOS 12.5 device (as M7 of `support-legacy-ios-12-safari`): open a location menu by tap, make a location home, remove a location.
