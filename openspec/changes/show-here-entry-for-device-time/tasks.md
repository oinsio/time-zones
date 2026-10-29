# Tasks

Both changes this one builds on, `support-legacy-ios-12-safari` and `set-home-location-and-show-differences`, are archived. The owners named below were checked on `main` (design, Context).

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter` or `git`.

- **Running tests:** one command at a time, never in the background. Stryker runs only with `--mutate`, at most 5 files per run, and its report is in `reports/mutation/mutation-report.json`.
- **Time in tests:** only `fakeClock(instant, timeZone)` of `@/lib/temporal` or `createSwitchableClock` (`test/switchableClock.ts`). Never `vi.setSystemTime()` or `vi.useFakeTimers()`. Ticks come from `createManualTickScheduler()` (`test/tickSchedulers.ts`), and writes are observed with `createManualWriteScheduler()` (`test/writeSchedulers.ts`).
- **E2E runs:** Playwright runs the specs that `bddgen` generates from the `.feature` files, so every Playwright command after a `.feature` edit starts with `npx bddgen -c playwright.bdd.config.ts && ` (the order of the `test:bdd` script).
- **Traceability:** every new or changed test, step file and feature carries `show-here-entry-for-device-time`:
  - `@show-here-entry-for-device-time @FR-X` tags above scenarios, and `// @show-here-entry-for-device-time @FR-X` before `f.Scenario`;
  - `// Verifies NFR-X of show-here-entry-for-device-time` in E2E steps;
  - `Implements FR-X of show-here-entry-for-device-time` in the JSDoc of new or changed production code.
- **Glossary:** use only `docs/glossary/` terms (Here entry, Here mark, exemplar city, device time zone, offset difference, Location menu; the last two as the pending predecessor patch defines them, section 9). The Here entry is never called a location in code, specs or strings, and never a "default location" or "auto-added location".
- **File size:** every file stays under 200 lines. "design Dn" refers to `design.md`.

## 1. Strings (no TDD)

- [ ] 1.1 Add `locations.deviceTimeMeta` ("Device time · {{utcOffset}}" / «Время устройства · {{utcOffset}}») and `locations.hereEntryName` ("{{city}}, {{hereMark}}, Device time" / «{{city}}, {{hereMark}}, Время устройства») to `locales/en.json` and `locales/ru.json` (design D8, FR10). Verify with `npx vitest run src/locales/locales.test.ts`.

## 2. Model (TDD)

- [ ] 2.1 Widen `isLocationInDeviceTimeZone` to `Pick<Location, "timeZoneId">` and the first argument of `getOffsetDifferenceMinutes` to `{ id?: string; timeZoneId: string }` (design D1, FR3). Add cases to `model/offsetDifference.test.ts`:
  - a subject without an ID in the device zone and no home → `undefined`;
  - the same with home Almaty and device `Europe/Moscow` → `−120`;
  - a subject without an ID and an equal offset to home → `0`.

  Verify red, then green, with `npx vitest run src/model/offsetDifference.test.ts src/model/deviceTimeZone.test.ts`.
- [ ] 2.2 TDD `getHereEntry(state)` in new `model/hereEntry.ts`, built on `isLocationInDeviceTimeZone` (design D1, FR1, FR6). Tests in `model/hereEntry.test.ts` with `it.each`:
  - empty list → `{ timeZoneId }` of the device time zone;
  - list Moscow with device `Asia/Almaty` → `Asia/Almaty`;
  - list Almaty, Moscow → `undefined`;
  - list Almaty, Moscow with home Almaty → `undefined` (the home location shows the device time);
  - device `Europe/Minsk` with Moscow → `Europe/Minsk` (NG4);
  - the device time zone after `SET_DEVICE_TIME_ZONE` with `Mars/Olympus_Mons` → `UTC`.

  Export `getHereEntry` and `HereEntry` from `model/index.ts`. Verify red, then green, with `npx vitest run src/model/hereEntry.test.ts`.
- [ ] 2.3 Run `npx stryker run --mutate 'src/model/hereEntry.ts,src/model/offsetDifference.ts,src/model/deviceTimeZone.ts'`. Verify a score ≥ 95% (minimum 90%) in the report, and kill survivors with tests.

## 3. Port and adapter: exemplar city (TDD)

- [ ] 3.1 Move `deriveNameFromZoneId` and its constants from `adapters/city-search/zoneCitiesSource.ts` to new `adapters/city-search/deriveCityNameFromTimeZoneId.ts` as `deriveCityNameFromTimeZoneId`, exported from `adapters/city-search/index.ts` and `adapters/index.ts` (design D3). First write `deriveCityNameFromTimeZoneId.test.ts` with `it.each`:
  - `Asia/Almaty` → `Almaty`;
  - `America/New_York` → `New York`;
  - `America/Argentina/Buenos_Aires` → `Buenos Aires`;
  - `UTC` → `UTC`.

  Then switch the zone cities source to it. Verify `npx vitest run src/adapters/city-search`, with the existing results unchanged.
- [ ] 3.2 TDD `getExemplarCity(timeZoneId, language)` on `CitySearch` (`ports/citySearch.ts`) and in `createCompositeCitySearch` (design D3, FR8, FR12). The contract goes in new `adapters/city-search/citySearch.contract.ts` (`describeCitySearchContract`), run from new `createCompositeCitySearch.exemplarCity.test.ts` with the extracted data (`virtual:zone-cities`, as in `controller/useCitySearch.test.ts`):
  - `Asia/Almaty` → `Almaty` / `Алматы`;
  - `Europe/Kyiv` (en) → `Kyiv`, looked up by the canonical ID (CLDR 48, `cldr-dates-full`);
  - a zone without data → the derived name.

  Comment `// FR8: …` / `// FR12: …` per case. Verify `npx vitest run src/adapters/city-search`.
- [ ] 3.3 Run `npx stryker run --mutate 'src/adapters/city-search/createCompositeCitySearch.ts,src/adapters/city-search/zoneCitiesSource.ts,src/adapters/city-search/deriveCityNameFromTimeZoneId.ts'`. Verify a score ≥ 95% (minimum 90%).

## 4. Presenter (TDD)

- [ ] 4.1 Refactor without behaviour change: extract `presentZoneMoment(subject, context)` from `presentLocationRows` into `presenter/presentZoneMoment.ts`. It covers the UTC offset, offset difference, local time and date, ISO date and day track (design D2). `presentLocationRows` spreads its result. Verify that `npx vitest run src/presenter` passes unchanged. Then verify that `npx vitest run src/test/features/locations` stays green, including the row work-bound scenarios.
- [ ] 4.2 TDD `presentHereEntry(hereEntry, cityLabel, context)` in `presenter/presentHereEntry.ts` (design D2, D8; FR2, FR3, FR10, NFR-A2). Tests in `presenter/presentHereEntry.test.ts`:
  - M2: `Алматы`, mark kind `HERE` with caption `здесь`, `metaLabel` `Время устройства · UTC+5`, `12:30`, `вс, 8 мар.`, no offset difference, day track equal to a location row's in the same zone;
  - M4: `Москва` with `−2 ч` and `Время устройства · UTC+3`;
  - home in the same offset → `0 ч`;
  - device `UTC` → `Device time · UTC`;
  - `accessibleName` `Алматы, Вы здесь, Время устройства`;
  - English meta `Device time · UTC+5:30` for `Asia/Kolkata`.

  Export from `presenter/index.ts`. Verify red, then green, with `npx vitest run src/presenter/presentHereEntry.test.ts`.
- [ ] 4.3 Run `npx stryker run --mutate 'src/presenter/presentZoneMoment.ts,src/presenter/presentHereEntry.ts,src/presenter/presentLocationRows.ts'`. Verify a score ≥ 95% (minimum 90%).

## 5. Controller (TDD)

- [ ] 5.1 TDD `controller/cityDataCache.ts` (`loadCitySearchOnce`, `readLoadedCitySearch`; design D4). Tests in `cityDataCache.test.ts`:
  - two calls during one pending load call the loader once;
  - a resolved search is read back synchronously;
  - after a rejection the next call loads again.

  Then switch `useCitySearch` to it. Verify `npx vitest run src/controller/cityDataCache.test.ts`, then `npx vitest run src/controller/useCitySearch.test.ts` unchanged.
- [ ] 5.2 Add `loadCitySearch?: LoadCitySearch` to `LocationsProvider` (default: the `loadCitySearch` adapter) and to `LocationsContextValue`. `useLocations` returns `rowsContext` and `hereEntry` (`undefined` while `UNREADABLE`; design D4, FR1, FR9). Tests in new `controller/useLocations.hereEntry.test.tsx`:
  - shown and hidden with add and remove;
  - a device time zone change read at a minute tick;
  - a list change from another tab;
  - reset;
  - `undefined` for an unreadable stored list;
  - nothing scheduled for writing (M5).

  Verify `npx vitest run src/controller/useLocations.hereEntry.test.tsx`.
- [ ] 5.3 TDD `useExemplarCity(timeZoneId, load)` in `controller/useExemplarCity.ts` (design D4, FR8, NFR-P2). Tests in `useExemplarCity.test.tsx` with a deferred fake loader:
  - the first render returns `Almaty` and the loader is not called before the effect;
  - after the load resolves (ru) → `Алматы`;
  - a rejected load keeps `Almaty`, with no error state and no second call;
  - an `undefined` zone → the loader is never called;
  - after `useCitySearch` loaded the same loader, the name is ready on the first render.

  Verify red, then green, with `npx vitest run src/controller/useExemplarCity.test.tsx`.
- [ ] 5.4 TDD `useHereEntry()` in `controller/useHereEntry.ts`, exported from `controller/index.ts` (design D4; FR2, FR6, FR8). Tests in `useHereEntry.test.tsx`:
  - the presented entry follows the reference moment after a time selection;
  - it is `undefined` while a location matches;
  - it uses the loader from `LocationsProvider`.

  Verify `npx vitest run src/controller/useHereEntry.test.tsx`.
- [ ] 5.5 Run `npx stryker run --mutate 'src/controller/cityDataCache.ts,src/controller/useExemplarCity.ts,src/controller/useHereEntry.ts,src/controller/useLocations.ts,src/controller/useCitySearch.ts'`. Verify a score ≥ 95% (minimum 90%).

## 6. Views (TDD)

- [ ] 6.1 Refactor without behaviour change: extract the place column, `LocalDateTime` and `DayTrack` layout of `LocationRow` into `views/shared/ZoneRowContent.tsx` (design D5). Verify that `npx vitest run src/views/shared` passes unchanged.
- [ ] 6.2 TDD `views/shared/HereEntryRow.tsx`, exported from `views/shared/index.ts` (design D5; FR2, FR4, FR5, UX1). It is a `<section>` named by `accessibleName`, with the Here mark, city, caption, meta line, time and date, and a day track wired to the track handlers. It has no drag handle, no Location menu and no remove action. It passes `isCityOneLine` to `ZoneRowContent`, so its city is one `truncate` line; `LocationRow` never sets it, so cards keep wrapping (design D5, UX3). Tests in `HereEntryRow.test.tsx` with M2 data:
  - the content;
  - no `button` (no drag handle, menu or remove action);
  - the slider named `Время — Алматы`.

  The kept height (UX3) and the Tab order (NFR-A2) are layout and keyboard checks, so they are E2E scenarios in task 8.1, not jsdom tests.

  Verify `npx vitest run src/views/shared/HereEntryRow.test.tsx`.
- [ ] 6.3 TDD `CardsView` (design D5, D6; FR1, FR7, FR9, UX2). Tests in new `views/cards/CardsView.hereEntry.test.tsx`, with a loader passed to `LocationsProvider`:
  - the Here entry first, outside the `<ul>`;
  - in the empty state, the Here entry, then the explanation, then "Add location";
  - no Here entry and no loader call on the load error;
  - with a deferred loader on `LocationsProvider` and no loader prop on `LocationSearch`, the Here entry and a search opened after the load call it exactly once (FR8, M5). To make it pass, `OpenLocationSearch` in `views/shared/LocationSearch.tsx` falls back to `useLocations().loadCitySearch` (design D4);
  - focus after removing the last location still goes to "Add location".

  Then fix existing `CardsView*.test.tsx` and other view tests that count sliders or times page-wide (design D9). Verify `npx vitest run src/views`.
- [ ] 6.4 Run `npx stryker run --mutate 'src/views/shared/HereEntryRow.tsx,src/views/shared/ZoneRowContent.tsx,src/views/cards/CardsView.tsx,src/views/shared/LocationSearch.tsx'`. Verify a score ≥ 95% (minimum 90%).

## 7. Unit BDD (vitest-cucumber)

- [ ] 7.1 Write `test/features/locations/locations_here_entry_unit.feature` and `steps/locations_here_entry_unit.steps.ts`, reusing the existing worlds and steps. It holds these scenarios of the `locations` delta:
  - "No location matches", "A location matches", "The home location matches", "Matching is by time zone ID, not by offset" (FR1);
  - "Here entry on the design sample", "English meta line" (FR2, UX1);
  - "No home", "Travelling with home set" (FR3);
  - "Nothing to remove or move", "Nothing is stored for the Here entry" (FR4);
  - "Time selection from the Here entry" (FR5);
  - the four scenarios of "Here entry follows the device time zone" (FR6);
  - the four scenarios of "Exemplar city of the Here entry", with a deferred loader (FR8, NFR-P2);
  - "Unreadable stored list", "Storage unavailable" (FR9);
  - "Renamed device time zone", with the outdated-engine stub of `browser_compatibility/steps/legacyZoneWorld.ts` (FR12, M7);
  - "Both languages" (FR10);
  - "Presenting again builds no formatter", wrapped in `startWorkCount()` (`test/workCounters.ts`), asserting 0 formatter builds and at most `MAX_TRANSITION_LOOKUPS_PER_ZONE` lookups for the Here entry (NFR-P1, ADR-0008).

  Verify `npx vitest run src/test/features/locations/steps/locations_here_entry_unit.steps.ts`.
- [ ] 7.2 Update `test/features/main_page/main_page_states_unit.feature` and its steps to the MODIFIED "Empty state" scenarios: the Here entry first, the explanation and "Add location" below, and no location list stored (FR7, UX2). Verify `npx vitest run src/test/features/main_page`.
- [ ] 7.3 Add the Here entry to `test/benchmarks/rowPresenting.bench.ts` (NFR-P1). Verify with `pnpm bench`, which only reports.

## 8. E2E, accessibility and screenshots (playwright-bdd)

- [ ] 8.1 Write `test/features/locations/locations_here_entry_e2e.feature` and `steps/locations_here_entry_e2e.steps.ts`. The E2E device time zone is `Asia/Almaty`, so the Here entry is shown whenever Almaty is not stored. It holds these `locations` delta scenarios:
  - "Reorder keeps the Here entry first", with the announcement (FR4);
  - a keyboard variant of "Time selection from the Here entry": arrow keys on its slider (FR5);
  - "Tap on the Here entry's day track without Pointer Events", with `emulateEngineWithoutPointerEvents` (FR12);
  - "Name and list size" (NFR-A2);
  - "One Tab stop on the Here entry" (NFR-A2): press Tab from the page start until the focus enters the Here entry `<section>`, assert that the focused element is the slider named `Время — Алматы`, then press Tab once and assert that the focus is outside the section;
  - "No violations" with axe-core, in 3 states × 2 themes (NFR-A1). Travelling is home Moscow with the list Moscow, Kolkata, New York;
  - "Narrow and wide screens", with no horizontal scrolling and the same layout as the Moscow card (NFR-R1, UX1);
  - "The exemplar city keeps the height" (UX3): hold the data with `holdSearchData()` (`steps/locations_ui_e2e.fixtures.ts`), read the Here entry's `boundingBox()` height and the Moscow card's `y` while it shows `Almaty`, call `releaseHeldRequests()`, wait for `Алматы`, and assert both values are equal at 375 px and 1024 px.

  Verify with `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "@show-here-entry-for-device-time"`.
- [ ] 8.2 Add the `@view-contract` scenario "See the Here entry without home" to `locations/locations_view_contract_e2e.feature` (FR11). Verify with `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --project view-contract-cards --grep "See the Here entry without home"`.
- [ ] 8.3 Update the lazy-data scenarios to the MODIFIED `location-search` delta (design D9, FR8):
  - "Data loads only when the search opens" in `locations_ui_e2e.feature` and "The slash key loads the search data only when it opens the search" in `locations_search_shortcut_e2e.feature` first store a location in `Asia/Almaty`;
  - add "The Here entry's request is the only one" to `locations_ui_e2e.feature`: the empty list, the data loaded, then the search opened, exactly 1 request (M5);
  - in `steps/locationsStates.ts`, the `search loading` and `search error` states store Almaty before they hold or fail the data.

  Tag each with `@show-here-entry-for-device-time @FR8`. Verify with `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "Data loads only when the search opens|The Here entry's request is the only one|loads the search data|search loading|search error"`.
- [ ] 8.4 Add the states `here-entry` (list Moscow, Kolkata, New York) and `here-entry-travel` (the same list, Moscow home) to `WorldClockState` in `steps/locationsStates.ts`. Add them to the screenshot outline of `locations_ui_e2e.feature` at 375 / 1024 px × light / dark, tagged `@show-here-entry-for-device-time @NFR-R2`. Re-approve `empty`, `suggestions` and `IST results` under `test/features/__screenshots__/{chromium,mobile-chrome}/` with `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep Screenshot --update-snapshots`. Then verify that `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep Screenshot` passes without that flag.

## 9. Handoff patches (files the implement stage may not edit)

**Apply order.** The archived `set-home-location-and-show-differences` left two patches that `main` does not carry yet:

- `handoff/H1-glossary-home-location.patch` adds **Location menu** and **Home mark** and gives **Offset difference** its *Code:* `getOffsetDifferenceMinutes`, `formatOffsetDifference`. On `main`, `docs/glossary/` has no Location menu entry, and Offset difference is still *(planned)* (`time.md:21`);
- `handoff/H2-architecture-docs-home-location.patch` adds the "Location menu" row right above "Here entry" in `docs/architecture/views.md`.

Both touch lines next to the ones H1 and H2 below change. H1 and H2 are made against `main` as committed, so they apply there with plain `git apply`. After the predecessor patches they apply with `git apply -C0`. `--3way` does not help, because the changes sit on adjacent lines and conflict. Each README section states this order.

**Scratch check** used by 9.1 and 9.2, run from the repository root. It copies `docs/` of `HEAD` into a temporary folder and touches no repository file. `<patch>` is the patch of the task:

```
pred=openspec/changes/archive/2026/10/2026-10-29-set-home-location-and-show-differences/handoff
scratch=$(mktemp -d) && git archive HEAD docs | tar -x -C "$scratch"
(cd "$scratch" && git apply "$OLDPWD/$pred/H1-glossary-home-location.patch" "$OLDPWD/$pred/H2-architecture-docs-home-location.patch" && git apply -C0 "$OLDPWD/<patch>")
```

- [ ] 9.1 Handoff H1: write `openspec/changes/show-here-entry-for-device-time/handoff/H1-glossary-here-entry.patch` and its README section (`.gnomish/stages/specify/handoff.md`, "In `openspec/changes/<name>/handoff/`"). The patch updates `docs/glossary/`:
  - `locations.md`: Here entry drops *(planned)*, adds *RU:* строка «Здесь», мета «Время устройства» and *Code:* `getHereEntry`, `presentHereEntry`, `useHereEntry`, `HereEntryRow`. Location row adds `presentZoneMoment` to *Code:* and "*Not:* the Here entry";
  - `search.md`: Exemplar city gets *Code:* `CitySearch.getExemplarCity`, `deriveCityNameFromTimeZoneId`;
  - `views.md`: View contract adds the Here entry.

  The README section states the apply order. Verify from the repository root:
  - `git apply --check openspec/changes/show-here-entry-for-device-time/handoff/H1-glossary-here-entry.patch`;
  - the scratch check with this patch exits 0, and then `grep -c "useHereEntry" "$scratch/docs/glossary/locations.md"` ≥ 1 and `grep -c "Location menu" "$scratch/docs/glossary/locations.md"` ≥ 1, so both changes' entries are there;
  - `git status --short docs` prints nothing.
- [ ] 9.2 Handoff H2: write `openspec/changes/show-here-entry-for-device-time/handoff/H2-architecture-here-entry.patch` and its README section. The patch updates:
  - `docs/architecture/views.md`, "Here entry" (line 80): outside the numbered list, shown in the empty state, meta "Device time · UTC+5";
  - `docs/architecture/domain-model.md`, "Selectors" (lines 89–90). Today the `getRows(state)` row says the display rows put "the derived Here entry first", and `getLocationSnapshot` lists an "is-derived" flag. The patch makes `getRows` return `locations` only, adds a `getHereEntry(state)` row (the Here entry's time zone when no location matches the device time zone, otherwise nothing; design D1), and drops "is-derived", because the Here entry is not a row (design D2, D5).

  The README section states the apply order. Verify from the repository root:
  - `git apply --check openspec/changes/show-here-entry-for-device-time/handoff/H2-architecture-here-entry.patch`;
  - the scratch check with this patch exits 0, and then `grep -c "getHereEntry" "$scratch/docs/architecture/domain-model.md"` = 1, `grep -c "is-derived" "$scratch/docs/architecture/domain-model.md"` = 0, `grep -c "Device time · UTC+5" "$scratch/docs/architecture/views.md"` = 1 and `grep -c "Location menu" "$scratch/docs/architecture/views.md"` ≥ 1;
  - `git status --short docs` prints nothing.

## 10. Final verification

- [ ] 10.1 Traceability (M1): this loop, run from `packages/client/`, must print nothing.

  ```
  for id in FR1 FR2 FR3 FR4 FR5 FR6 FR7 FR8 FR9 FR10 FR11 FR12 NFR-P1 NFR-P2 NFR-A1 NFR-A2 NFR-R1 NFR-R2 UX1 UX2 UX3; do
    grep -rqE "show-here-entry-for-device-time.*(^|[^A-Za-z0-9-])@?$id([^0-9]|$)|(^|[^A-Za-z0-9-])@?$id([^0-9]|$).*show-here-entry-for-device-time" src || echo "missing $id"
  done
  ```
- [ ] 10.2 Run each command alone, in this order: `pnpm --filter @time-zones/client typecheck`, `pnpm --filter @time-zones/client lint`, `pnpm --filter @time-zones/client test`, `pnpm run build`, `pnpm --filter @time-zones/client check:bundle-size` and `pnpm --filter @time-zones/client check:legacy-build`. Then run `pnpm --filter @time-zones/client test:bdd` once, alone. Fix every existing feature that counts sliders, times or requests page-wide and now meets the Here entry (design D9).
- [ ] 10.3 Check the glossary (`.claude/rules/glossary.md`, "Review checklist"). `grep -rniE "default location|auto-added location" src` and `grep -rn "GMT" src/locales` print nothing.

## Human follow-up

The operator reviews these on the PR that the deliver stage opens, then applies the patches. If the two pending patches of `set-home-location-and-show-differences` are applied first, H1 and H2 go on with `git apply -C0`; otherwise with plain `git apply` (section 9, "Apply order").

- H1 (FR2, FR8): apply `handoff/H1-glossary-here-entry.patch`. It sets the owners of Here entry, Exemplar city and Location row, and adds the Here entry to the View contract in `docs/glossary/`.
  Why manual: the implement stage writes only under `packages/`, and the glossary lives in `docs/glossary/`.
  Automated part: `git apply --check` and the scratch check in task 9.1. The owners it names are covered by the tests of sections 2–6.
- H2 (FR1, FR7, NFR-A2): apply `handoff/H2-architecture-here-entry.patch`. It updates "Here entry" in `docs/architecture/views.md` and the selectors in `docs/architecture/domain-model.md`.
  Why manual: the implement stage writes only under `packages/`, and both documents live in `docs/architecture/`.
  Automated part: `git apply --check` and the scratch check in task 9.2. The behaviour it describes is covered by the features of sections 7–8.
