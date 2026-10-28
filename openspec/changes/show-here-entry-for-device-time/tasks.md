# Tasks

Depends on: `support-legacy-ios-12-safari`, then `set-home-location-and-show-differences`. Start only after both are archived (proposal, design Context).

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`.

- **Running tests:** one command at a time, never in the background. Mutation runs take at most 5 files per run. The report is in `reports/mutation/mutation-report.json`.
- **Time in tests:** only `fakeClock(instant, timeZone)` of `@/lib/temporal` or `createSwitchableClock`. Never `vi.setSystemTime()` or `vi.useFakeTimers()`. Ticks come from `createManualTickScheduler()`, and writes are observed with `createManualWriteScheduler()`.
- **Traceability:** every new test, step file and feature carries `show-here-entry-for-device-time`:
  - `@show-here-entry-for-device-time @FR-X` tags above scenarios;
  - `// Verifies NFR-X of show-here-entry-for-device-time` in E2E steps;
  - `Implements FR-X of show-here-entry-for-device-time` in the JSDoc of new or changed production code.
- **Glossary:** use only `docs/glossary/` terms (Here entry, Here mark, exemplar city, device time zone, offset difference, Location menu). The Here entry is never called a location in code, specs or strings.
- **File size:** every file stays under 200 lines. "design Dn" refers to `design.md`.

## 1. Preconditions and strings

- [ ] 1.1 Confirm that both dependencies are archived:
  - `openspec list` shows neither `support-legacy-ios-12-safari` nor `set-home-location-and-show-differences` as active;
  - `model/` exports `getOffsetDifferenceMinutes`;
  - `presenter/` exports `formatOffsetDifference`;
  - `views/shared/` has the Location menu;
  - the legacy zone shim and the day-track tap fallback exist.

  Record the current owner names in this file if they differ from design D2–D4.
- [ ] 1.2 Add `locations.deviceTimeMeta` ("Device time · {{utcOffset}}" / «Время устройства · {{utcOffset}}») and `locations.hereEntryName` ("{{city}}, {{hereMark}}, Device time" / «{{city}}, {{hereMark}}, Время устройства») to `locales/en.json` and `locales/ru.json` (design D8, FR10). Verify with `npx vitest run src/locales/locales.test.ts`.

## 2. Model (TDD)

- [ ] 2.1 TDD `getHereEntry(state)` in new `model/hereEntry.ts`, built on `isLocationInDeviceTimeZone` (design D1, FR1, FR6). Tests in `model/hereEntry.test.ts` with `it.each`:
  - empty list → `{ timeZoneId }` of the device time zone;
  - list Moscow with device `Asia/Almaty` → `Asia/Almaty`;
  - list Almaty, Moscow → `undefined`;
  - device `Europe/Minsk` with Moscow → `Europe/Minsk` (NG4);
  - the device time zone after `SET_DEVICE_TIME_ZONE` with an unknown ID → `UTC`.

  Export from `model/index.ts`. Verify red, then green, with `npx vitest run src/model/hereEntry.test.ts`.
- [ ] 2.2 Move `deriveNameFromZoneId` from `adapters/city-search/zoneCitiesSource.ts` to `model/timeZoneId.ts` as `deriveCityNameFromTimeZoneId`. Build on the legacy change's version of both files and keep its `Intl.DisplayNames` guard and the BigInt-free code (design D3, D7). First write the characterization test in `model/timeZoneId.test.ts`:
  - `Asia/Almaty` → `Almaty`;
  - `America/New_York` → `New York`;
  - `America/Argentina/Buenos_Aires` → `Buenos Aires`;
  - `UTC` → `UTC`.

  Then switch the zone cities source to it. Verify `npx vitest run src/model/timeZoneId.test.ts`, then `npx vitest run src/adapters/city-search` (unchanged results).
- [ ] 2.3 Mutation run over `src/model/hereEntry.ts,src/model/timeZoneId.ts`. Verify a score ≥ 95% (minimum 90%), and kill survivors with tests.

## 3. Port and adapter: exemplar city (TDD)

- [ ] 3.1 TDD `getExemplarCity(timeZoneId, language)` on `CitySearch` (`ports/citySearch.ts`) and in `createCompositeCitySearch` (from `recordsById`, falling back to `deriveCityNameFromTimeZoneId`; design D3, FR8). Add to the shared contract `adapters/city-search/citySource.contract.ts` (or the `CitySearch` contract suite, wherever the contract tests of the port live):
  - `Asia/Almaty` → `Almaty` / `Алматы`;
  - `Europe/Kyiv` → the CLDR name, looked up by the canonical ID (FR12);
  - a zone without data → the derived name.

  Run it against every `CitySearch` implementation. Verify `npx vitest run src/adapters/city-search`.
- [ ] 3.2 Mutation run over `src/adapters/city-search/createCompositeCitySearch.ts,src/adapters/city-search/zoneCitiesSource.ts`. Verify a score ≥ 95% (minimum 90%).

## 4. Presenter (TDD)

- [ ] 4.1 Refactor without behaviour change: extract `presentZoneMoment(timeZoneId, context)` from `presentLocationRows` into `presenter/presentZoneMoment.ts`. It covers the UTC offset, local time and date, ISO date, day track and offset difference (design D2). `presentLocationRows` spreads its result. Verify that the existing `npx vitest run src/presenter` passes unchanged, and that `npx vitest run src/test/features/locations` stays green, including the row work-bound scenarios.
- [ ] 4.2 TDD `presentHereEntry(hereEntry, cityLabel, context)` in `presenter/presentHereEntry.ts` (design D2, D8; FR2, FR3, FR10, NFR-A2). Tests in `presenter/presentHereEntry.test.ts`:
  - M2: `Алматы`, mark kind `HERE` with caption `здесь`, `metaLabel` `Время устройства · UTC+5`, `12:30`, `вс, 8 мар.`, no offset difference, day track fraction equal to a location row's;
  - M4: `Москва` with `−2 ч` and `Время устройства · UTC+3`;
  - unknown zone → `UTC` with `Device time · UTC`;
  - `accessibleName` `Алматы, Вы здесь, Время устройства`;
  - English meta `Device time · UTC+5:30` for `Asia/Kolkata`.

  Export from `presenter/index.ts`. Verify red, then green, with `npx vitest run src/presenter/presentHereEntry.test.ts`.
- [ ] 4.3 Mutation run over `src/presenter/presentZoneMoment.ts,src/presenter/presentHereEntry.ts,src/presenter/presentLocationRows.ts`. Verify a score ≥ 95% (minimum 90%).

## 5. Controller (TDD)

- [ ] 5.1 Refactor without behaviour change: move the per-loader cache and load call of `useCitySearch` into `controller/cityDataCache.ts` (design D4). Verify that the existing `npx vitest run src/controller/useCitySearch.test.ts` passes unchanged.
- [ ] 5.2 TDD `useExemplarCity(timeZoneId, load)` in `controller/useExemplarCity.ts` (design D4, FR8, NFR-P2). Tests with a deferred fake loader:
  - first render returns `Almaty` before the load resolves;
  - after it resolves (ru) → `Алматы`;
  - a rejected load keeps `Almaty`, with no error state;
  - `undefined` zone → the loader is never called;
  - after `useCitySearch` loaded the same loader, the name is ready on the first render.

  Verify red, then green, with `npx vitest run src/controller/useExemplarCity.test.tsx`.
- [ ] 5.3 TDD `hereEntry` from `useLocations`: `presentHereEntry` in the same memo as the rows, with the city from `useExemplarCity` (design D2, D4; FR1, FR6). Tests in new `controller/useLocations.hereEntry.test.tsx`:
  - shown and hidden with list changes;
  - a device time zone change read at a minute tick;
  - a list change from another tab;
  - reset;
  - follows the reference moment;
  - nothing scheduled for writing (M5).

  Verify `npx vitest run src/controller/useLocations.hereEntry.test.tsx`.
- [ ] 5.4 Mutation run over `src/controller/useExemplarCity.ts,src/controller/cityDataCache.ts,src/controller/useLocations.ts`. Verify a score ≥ 95% (minimum 90%).

## 6. Views (TDD)

- [ ] 6.1 Refactor without behaviour change: extract the place column, `LocalDateTime` and `DayTrack` layout of `LocationRow` into `views/shared/ZoneRowContent.tsx` (design D5). Verify that `npx vitest run src/views/shared` passes unchanged.
- [ ] 6.2 TDD `views/shared/HereEntryRow.tsx`: a `<section>` named by `accessibleName`, with the Here mark, city, caption, meta line, time and date, and a day track wired to `useTimeSelection`. It has no drag handle, no Location menu and no remove action (design D5; FR2, FR4, FR5, UX1). Tests in `HereEntryRow.test.tsx`, with M2 data. Verify `npx vitest run src/views/shared/HereEntryRow.test.tsx`.
- [ ] 6.3 TDD `CardsView`:
  - the Here entry first, outside `LocationList` and its `<ul>`;
  - in the empty state, the Here entry, then the explanation, then "Add location";
  - no Here entry on the load error;
  - focus after removing the last location still goes to "Add location".

  Design D5, D6; FR1, FR7, FR9, UX2. Verify `npx vitest run src/views/cards`.

## 7. Unit BDD (vitest-cucumber)

- [ ] 7.1 Write `test/features/locations/locations_here_entry_unit.feature` from the `locations` delta: every scenario of the requirements from "Here entry when no location matches" to "Here entry is fast". That includes the renamed device time zone `Europe/Kiev` with the legacy engine stub (FR12), the exemplar city with a deferred loader, and the work-bound scenario wrapped in `startWorkCount()` (NFR-P1, ADR-0008). Add step definitions in `steps/`, reusing the existing worlds and steps. Verify `npx vitest run src/test/features/locations/locations_here_entry_unit.feature`.
- [ ] 7.2 Update `test/features/main_page/main_page_states_unit.feature` to the MODIFIED "Empty state" scenarios. Verify `npx vitest run src/test/features/main_page`.
- [ ] 7.3 Add the Here entry to `test/benchmarks/rowPresenting.bench.ts` (NFR-P1). Verify `pnpm bench` runs it, as a report only.

## 8. E2E, accessibility and screenshots (playwright-bdd)

- [ ] 8.1 Write `test/features/locations/locations_here_entry_e2e.feature`:
  - layout at 320 px and 2560 px with no horizontal scrolling;
  - no drag handle or menu;
  - reorder keeps the Here entry first, with announcements counting locations only;
  - time selection on its day track;
  - accessible name and list size;
  - axe-core in 3 states × 2 themes (NFR-A1, NFR-A2, NFR-R1, FR4, FR5).

  The E2E device zone `Asia/Almaty` gives the Here entry when Almaty is not stored. Verify with the project's single-feature E2E command.
- [ ] 8.2 Add the `@view-contract` scenario "See the Here entry without home" to `locations/locations_view_contract_e2e.feature` (FR11). Verify it in the `view-contract-cards` project.
- [ ] 8.3 Add the states "here-entry", "here-entry-empty" and "here-entry-travel" to the screenshot outline of `locations/locations_ui_e2e.feature`, at 375 / 1024 px × light / dark × `chromium` / `mobile-chrome`. Re-approve the baselines whose list has no location in `Asia/Almaty` (NFR-R2). Verify that a second run passes without `--update-snapshots`.

## 9. Documentation and glossary

- [ ] 9.1 Update `docs/glossary/`:
  - `locations.md`: Here entry — drop *(planned)*, add *RU:* and *Code:* `getHereEntry`, `presentHereEntry`, `HereEntryRow`; add to Location row's *Not:* that the Here entry is not a location row;
  - `search.md`: Exemplar city gets *Code:* `CitySearch.getExemplarCity`, `deriveCityNameFromTimeZoneId`;
  - `views.md`: View contract adds the Here entry.

  Verify the review checklist of `.claude/rules/glossary.md`, including `grep -rniE "default location|auto-added location" packages/client/src docs openspec/specs` returning nothing.
- [ ] 9.2 Update `docs/architecture/views.md` "Here entry" and "UI states" (outside the numbered list, shown in the empty state, meta "Device time · UTC+5" instead of `GMT+5`). Verify by reading the section against the `locations` delta.

## 10. Integration checks

- [ ] 10.1 Run `npx vitest run` once, and then `pnpm run build`. Verify both pass, and that `get_file_problems` (JetBrains MCP, when available) reports no errors in changed files.
- [ ] 10.2 Verify traceability: `grep -rn "show-here-entry-for-device-time" packages/client/src` finds each of FR1–FR12, NFR-P1, NFR-P2, NFR-A1, NFR-A2, NFR-R1, NFR-R2 and UX1–UX3 at least once (M1).

## Workflow follow-up

- Ask the owner to run the full Stryker suite and share the report.
- Archive with `/opsx:archive` after review. The archive merges the `locations` ADDED requirements and the `main-page` "Empty state" modification.
