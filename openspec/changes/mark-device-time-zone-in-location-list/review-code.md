# Review: mark-device-time-zone-in-location-list

## Summary

| Item | Value |
|---|---|
| Tasks verified | 20/20 |
| Requirements traced | 33/33 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 `packages/client/src/constants/deviceTimeZone.ts:7` `DEVICE_TIME_ZONE_FALLBACK_ID = UTC_ZONE_ID` (reuses `constants/search.ts`), re-exported at `constants/index.ts:1`.
- ✅ 1.2 `locales/en.json:31` `"deviceTimeZoneBadge": "Your time zone"`, `locales/ru.json:31` `"Ваш часовой пояс"`.
- ✅ 1.3 `test/deviceTimeZone.ts:5` `UNIT_TEST_DEVICE_TIME_ZONE = "Pacific/Kiritimati"`; `test/setup.ts:36` plain assignment `systemClock.timeZoneId = () => UNIT_TEST_DEVICE_TIME_ZONE`; `locations_utc_offset_unit.steps.tsx:45` and the `BeforeEachScenario` pass it to `fakeClock`.
- ✅ 1.4 `playwright.bdd.config.ts:39` `E2E_DEVICE_TIME_ZONE = "Asia/Almaty"`, `:80` `timezoneId: E2E_DEVICE_TIME_ZONE` in the top-level `use`.
- ✅ 2.1 `model/locations.ts:21-30` state field and `INITIAL_LOCATIONS_STATE`; `:122-130` `SET_DEVICE_TIME_ZONE` (canonicalize, fallback, same object when unchanged); every branch spreads `...state` (`:103`, `:113`, `:121`, `model/moveLocation.ts:39`); tests `model/locations.test.ts:185-235` (`it.each` of Almaty / Calcutta→Kolkata / Mars→UTC / `+05:00`→UTC, identity, add/remove/replace keep the zone), `model/moveLocation.test.ts:80-89`; fixtures updated in `locations_management.steps.ts` and `locations_reorder_unit.steps.ts`; exported at `model/index.ts:9`.
- ✅ 2.2 `model/deviceTimeZone.ts:8-13` strict canonical-ID equality; `model/deviceTimeZone.test.ts:7-17` `it.each` with Almaty/Tokyo/Minsk-vs-Moscow; exported at `model/index.ts:6`.
- ✅ 2.3 Re-measured in this review: `locations.ts` 98.44%, `moveLocation.ts` 100%, `deviceTimeZone.ts` 100% (see Mutation).
- ✅ 3.1 `presenter/presentLocationRows.ts:18-27` new `deviceTimeZoneLabel` / `deviceTimeZoneId`, `:41` translated once, `:52-57` per row; tests `presentLocationRows.test.ts:120-156` (match / no match / multiple via `it.each`, stub `translate` → `XYZ`, Russian); callers in `locations_reorder_unit.steps.ts` and `locations_utc_offset_unit.steps.tsx` pass `UNIT_TEST_DEVICE_TIME_ZONE`.
- ✅ 3.2 Re-measured: `presentLocationRows.ts` 100%.
- ✅ 4.1 `controller/LocationsProvider.tsx:42-55` `createLocationsStore(initialResult, deviceTimeZoneId)` dispatches `SET_DEVICE_TIME_ZONE` before `REPLACE_LOCATIONS`; `:77-79` `clock.timeZoneId()` in the `useState` initializer; `controller/useLocations.ts:25-40` reads `deviceTimeZoneId`, passes it, adds it to the `useMemo` key. Whole-row `toEqual` updated at `useLocations.test.tsx:66`; the new cases live in a separate file `controller/useLocations.deviceTimeZone.test.tsx:36-84` (match / no match / multiple, a `vi.fn` `timeZoneId` called exactly once after add/remove/reset, saved document keys `locations`, `status` only) — same behaviours, split to keep the file small.
- ✅ 4.2 Re-measured: `LocationsProvider.tsx` 100%, `useLocations.ts` 100%; the controller suites ran green under Stryker's dry run.
- ✅ 5.1 `views/shared/LocationRow.tsx:48-50` `useId` ids, `:72-74` `aria-labelledby`, `:86-98` city line with `bg-accent`/`text-accent-foreground` badge and `Navigation aria-hidden="true"`; tests `LocationRow.test.tsx:81-119` (position after city, accent classes, decorative svg, name with/without badge, no badge element); fixtures updated in `LocationList.test.tsx`, `LocationRow.dragging.test.tsx`, `useReorderAnnouncements.test.tsx`, `LocationList.drop.test.tsx`, `locations_reorder_unit.steps.ts`.
- ✅ 5.2 Re-measured: `LocationRow.tsx` 95.74%; both survivors are on lines this branch did not touch (see Mutation).
- ✅ 6.1 `test/factories/buildLocation.ts:23` Saint Petersburg (and Minsk for 2.2); `locations_device_time_zone_unit.feature` holds all 11 scenarios with `@mark-device-time-zone-in-location-list` and FR/NFR/`@M2` tags; `steps/locations_device_time_zone_unit.steps.tsx` uses `LocationsProvider` + `createInMemoryLocationRepository({ backend })` + switchable `Clock` + `LocationList`; this review ran it: 58 tests passed.
- ✅ 6.2 `test/setup.ts:36` pins the zone so the other feature steps see no badge; CI is green for `src/test/features` (not re-run here beyond the new steps file).
- ✅ 7.1 `locations_device_time_zone_e2e.feature:6-53` (name, axe light/dark, 320/2560, list state 375/1024 × light/dark, no `@view-contract`); `steps/locations_device_time_zone_e2e.steps.ts:11-44` the three steps with the `// Verifies NFR-A1, NFR-A2, NFR-R1, NFR-R2` comment and `englishLocale.locations.deviceTimeZoneBadge`. Passing run per green CI.
- ✅ 7.2 The 8 `Screenshot-of-the-list-state-*` PNGs under `__screenshots__/chromium/` and `mobile-chrome/` changed in this branch (`git diff --stat`: 14–17 KB → 16–19 KB each); passing comparison per green CI.
- ✅ 8.1 The task's traceability loop, run from the repository root in this review, prints nothing.
- ✅ 8.2 `grep -rn "deviceTimeZone" packages/client/src/adapters packages/client/src/ports` prints nothing; `LocationsProvider` saves `store.getSnapshot().locations` only.
- ✅ 8.3 Full unit, lint, build and BDD E2E are what the green CI of the implement stage ran; not re-run here (rules: one scoped run at a time).

## Requirements

- ✅ FR1 — `model/deviceTimeZone.ts:8` + `presentLocationRows.ts:52-57` + `LocationRow.tsx:90-97`; tests `deviceTimeZone.test.ts:7`, `presentLocationRows.test.ts:132`, unit BDD "One row matches".
- ✅ FR2 — every row evaluated independently (`presentLocationRows.ts:43-58`), empty label renders nothing (`LocationRow.tsx:90`); tests no-match / multiple-match `it.each` in `presentLocationRows.test.ts:132-143`, `useLocations.deviceTimeZone.test.tsx:36-48`, unit BDD "No row matches", "Several rows match".
- ✅ FR3 — read once via `clock.timeZoneId()` in the `useState` initializer (`LocationsProvider.tsx:77-79`), canonicalized with UTC fallback (`locations.ts:122-130`), never saved; tests `locations.test.ts:201-210`, `useLocations.deviceTimeZone.test.tsx:50-58` and `:70-84`, unit BDD "Legacy/Unknown device identifier", "Device zone is read once", "Device zone is not stored".
- ✅ FR4 — `...state` in add/remove/replace/move (`locations.ts:103,113,121`, `moveLocation.ts:39`); tests `locations.test.ts:217-234`, `moveLocation.test.ts:80-89`, `useLocations.deviceTimeZone.test.tsx:60-67`, unit BDD "Badge follows changes of the list".
- ✅ FR5 — key in `en.json:31` and `ru.json:31`, translated in the presenter (`presentLocationRows.ts:41`); tests `presentLocationRows.test.ts:145-155`, unit BDD "English interface", "Russian interface".
- ✅ NFR-P1 — synchronous read before first render (`LocationsProvider.tsx:77`); unit BDD "50 rows within the budget" times `presentLocationRows` over 50 locations with `performance.now()` ≤ 50 ms.
- ✅ NFR-A1 — `aria-labelledby` city id + badge id (`LocationRow.tsx:72-74`); `LocationRow.test.tsx:100-112`, E2E "Row name includes the badge".
- ✅ NFR-A2 — E2E outline "No accessibility violations with the badge in the <theme> theme" (light, dark) with the existing axe step.
- ✅ NFR-R1 — E2E outline "Badge fits a <width> px wide screen" (320, 2560), badge wraps via `flex-wrap` (`LocationRow.tsx:86`).
- ✅ NFR-R2 — 8 re-approved `list` baselines + E2E outline "The list state shows the badge at <width> px in the <theme> theme".
- ✅ UX1 — city line `flex flex-wrap items-center gap-x-2`, badge `rounded-full bg-accent text-xs …` right after the city (`LocationRow.tsx:86-97`); `LocationRow.test.tsx:84-89`.
- ✅ UX2 — `Navigation` icon `aria-hidden="true"` inside the badge (`LocationRow.tsx:95`); `LocationRow.test.tsx:91-97`.
- ✅ M1 — the 8.1 traceability loop prints nothing for FR1–FR5, NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1, UX2.
- ✅ M2 — the five count scenarios tagged `@M2` in `locations_device_time_zone_unit.feature` (Almaty→1, Tokyo→0, Moscow→2, Calcutta→1, Mars→1) pass (58/58 tests in this review).
- ✅ M3 — measured here: model 98.44–100%, presenter 100%, controller 100%, view 95.74% (all ≥ 95%).
- ✅ M4 — `@M4` axe outline (2 themes) and no-scroll outline (320, 2560) in `locations_device_time_zone_e2e.feature:13-38`.
- ✅ M5 — 8 of 8 `list` baselines changed in this branch (chromium + mobile-chrome × 375/1024 × light/dark), compared by the existing screenshot outline in CI.
- ✅ Scenario: One row matches — unit BDD scenario + steps `locations_device_time_zone_unit.steps.tsx:127`.
- ✅ Scenario: No row matches — unit BDD scenario + steps.
- ✅ Scenario: Several rows match — unit BDD scenario + steps (Moscow, Saint Petersburg badged; Almaty not).
- ✅ Scenario: Legacy device identifier — unit BDD (`Asia/Calcutta` → Kolkata badged).
- ✅ Scenario: Unknown device identifier — unit BDD (`Mars/Olympus_Mons` → UTC badged).
- ✅ Scenario: Badge follows changes of the list — unit BDD add then remove.
- ✅ Scenario: Device zone is read once — unit BDD with the switchable clock changed to `Europe/Moscow` before an add; Almaty keeps the badge, Moscow gets none.
- ✅ Scenario: Device zone is not stored — unit BDD reads `backend.document` keys (`locations`, `status`).
- ✅ Scenario: English interface — unit BDD.
- ✅ Scenario: Russian interface — unit BDD against `ru.json`'s key.
- ✅ Scenario: Row name includes the badge — E2E `the row of {string} is named {string}` with `exact: true`.
- ✅ Scenario: 50 rows within the budget — unit BDD with `performance.now()`.
- ✅ Scenario: No accessibility violations with the badge — E2E outline, light and dark.
- ✅ Scenario: Badge fits narrow and wide screens — E2E outline, 320 and 2560 px.
- ✅ Scenario: List screenshots show the badge — E2E outline + re-approved baselines of `locations_ui_e2e.feature`'s screenshot outline.

## Mutation

Measured in this review (`cd packages/client && npx stryker run --mutate …`, two runs, one at a time):

- Run 1 (`src/model/locations.ts, src/model/moveLocation.ts, src/model/deviceTimeZone.ts, src/presenter/presentLocationRows.ts, src/views/shared/LocationRow.tsx`): overall 98.17% (161 killed, 3 survived).
  - `model/deviceTimeZone.ts` 100% (4/4)
  - `model/locations.ts` 98.44% (63/64) — survivor: `ObjectLiteral {}` on `INITIAL_LOCATIONS_STATE` (`locations.ts:27`). `locations.test.ts:186-191` asserts the exact value with `toEqual`, so this is a static (module-load) mutant the vitest runner does not re-evaluate, not a missing test.
  - `model/moveLocation.ts` 100% (39/39)
  - `presenter/presentLocationRows.ts` 100% (10/10)
  - `views/shared/LocationRow.tsx` 95.74% (45/47) — survivors at `:59` (`draggingClassName` string) and `:63` (`ref` callback body), both lines this branch did not change.
- Run 2 (`src/controller/LocationsProvider.tsx, src/controller/useLocations.ts, src/constants/deviceTimeZone.ts`): 100% (68 killed). `LocationsProvider.tsx` 100% (59/59), `useLocations.ts` 100% (9/9); `constants/deviceTimeZone.ts` produced no mutants (a re-export of an existing constant).

No file is below 90%; no survivor exposes an untested requirement.

## Findings

### R1 — SUGGESTION — New unit BDD steps file exceeds the 200-line limit
- Location: `packages/client/src/test/features/locations/steps/locations_device_time_zone_unit.steps.tsx:35`
- Rule: `CLAUDE.md` Process Invariants ("Files must stay under 200 lines for AI context quality"); `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity")
- Problem: the new steps file is 258 lines. About 90 of them (lines 35–125: the scenario state, `switchableClock`, `openApp`, `rowOf`, `badgeText` and the shared Given/When/Then handlers) are a scenario world, not step bindings; the remaining lines are the 11 `f.Scenario` bindings.
- Impact: the file breaks the 200-line limit that `CLAUDE.md` sets without the "splitting would hurt clarity" reason, and the steps folder already has the pattern that avoids it (`steps/locationsUiWorld.tsx`, 100 lines, holds the shared world of `locations_ui_unit.steps.tsx`).
- Fix: move the world into a new `steps/deviceTimeZoneWorld.tsx` that exports a `createDeviceTimeZoneWorld()` factory returning the state accessors, `openApp`, `rowOf`, `badgeText` and the shared step handlers; keep the `loadFeature`, `describeFeature`, hooks and `f.Scenario` bindings (with their `// @mark-device-time-zone-in-location-list @FR-X` comments) in `locations_device_time_zone_unit.steps.tsx`. Re-run `npx vitest run src/test/features/locations/steps/locations_device_time_zone_unit.steps.tsx`.
- Fix risk: test-only change; the handlers close over per-scenario variables (`deviceZone`, `storedCities`, `backend`, `latestLocations`), so the factory must keep them as mutable fields reset in `BeforeEachScenario` — a slip there leaks state between scenarios. `.claude/rules/bdd-unit.md` "one steps file per feature file" stays satisfied because the world module is a helper, as `locationsUiWorld.tsx` already is. No production code changes.
- Status: open

## Verdict

Ready. No CRITICAL or WARNING findings; R1 is a non-blocking SUGGESTION.
