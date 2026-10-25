# Specs review: mark-device-time-zone-in-location-list

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 27/27 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 0 |

## Freshness

- ✅ `lib/temporal.ts` defines `Clock` with `instant()`, `plainDateISO()`, `timeZoneId()`, `systemClock.timeZoneId = () => Temporal.Now.timeZoneId()` and `fakeClock(isoTimestamp, timeZone = "UTC")` (`packages/client/src/lib/temporal.ts:9-37`).
- ✅ No production module calls `timeZoneId()` (proposal.md:7, design.md:7) — the only hits outside tests are the port and `systemClock` in `lib/temporal.ts:12,22`; `controller/useLocations.test.tsx:77` delegates it in a test clock.
- ✅ `LocationsState = { locations }`, commands `ADD_LOCATION`, `REMOVE_LOCATION`, `REPLACE_LOCATIONS`, `MOVE_LOCATION`, every branch builds `{ locations: … }` (`model/locations.ts:19-26,88,96,104`; `model/moveLocation.ts:39`).
- ✅ `model/timeZoneId.ts` exports `canonicalizeTimeZoneId(input): string | undefined`; raw offsets and unknown names give `undefined` (`model/timeZoneId.ts:12-25`); `Asia/Calcutta` → `Asia/Kolkata` is covered (`model/timeZoneId.test.ts:7`).
- ✅ `LocationsProvider` creates the store in a `useState` initializer via `createLocationsStore(initialResult)` → `createStore(reduceLocations, { locations: [] })` + `REPLACE_LOCATIONS`, takes `clock = systemClock`, passes it in the context value, saves `store.getSnapshot().locations` only (`controller/LocationsProvider.tsx:37-44,60-63,77,139-151`).
- ✅ `resetLocations` and the repository subscription dispatch `REPLACE_LOCATIONS` with plain `store.dispatch`; user commands go through `dispatchAndSchedule` (`controller/LocationsProvider.tsx:86-93,111-131`).
- ✅ `useLocations` reads `{ locations }` with `useSyncExternalStore` and memoizes `presentLocationRows(locations, { language, instant, translate })` on `[locations, language, t, clock]` (`controller/useLocations.ts:23-38`).
- ✅ `LocationRow { id, cityLabel, countryName, utcOffsetLabel }` with empty-string convention for the offset (`presenter/presentLocationRows.ts:8-14,39-42`).
- ✅ `views/shared/LocationRow.tsx` renders the `<li>` with drag handle, a `font-semibold` city span, a muted secondary line and the remove button; the `<li>` has no `aria-label`/`aria-labelledby` (`views/shared/LocationRow.tsx:55-93`).
- ✅ `UTC_ZONE_ID = "UTC"` in `constants/search.ts:5`, re-exported from `constants/index.ts:19`; the model already imports from `@/constants` (`model/utcOffset.ts:1`), so D2's fallback constant fits the existing layering.
- ✅ `playwright.bdd.config.ts` sets no `timezoneId` (`playwright.bdd.config.ts:77-83`); `devices["Desktop Chrome"]`/`["Pixel 5"]` in the projects do not override it.
- ✅ Exactly 8 `Screenshot-of-the-list-state-*` baselines exist (4 under `src/test/features/__screenshots__/chromium/`, 4 under `mobile-chrome/`); the list state seeds Almaty and Moscow (`test/features/locations/steps/locationsStates.ts:20,49-53`).
- ✅ No existing E2E step compares a row's full text (design.md:97): rows are found with `filter({ hasText })` (`locationsE2eHelpers.ts:64-65`, `locations_utc_offset_e2e.steps.ts:15-16`) and the order is read from remove-button labels (`locationsReorderE2eHelpers.ts:49-56`).
- ✅ All E2E steps task 7.1 reuses exist ("the stored locations are …", "the user opens the locations app", "the locations screen uses the … theme", "the screen is {int} px wide for the locations", "the locations screen does not scroll horizontally", "the locations are in the … state", "the locations screen has no accessibility violations") under `test/features/locations/steps/*_e2e*.ts`; the screenshot outline is at `locations_ui_e2e.feature:111-123`.
- ✅ "Rows show city and country" asserts `toHaveTextContent(`${firstCity}${firstCountry}`)` (`locations_ui_unit.steps.tsx:67-68`); "Zero offset" asserts the exact text `${city}${offset}` of a `UTC` row with `fakeClock(instant)` (`locations_utc_offset_unit.steps.tsx:44,91,148-158`).
- ✅ Several suites call `vi.restoreAllMocks()` (e.g. `controller/useLocations.test.tsx:16`, `i18n.test.ts:24`); `src/test/setup.ts` is the vitest setup file (`vitest.config.ts:11`); no test uses `Pacific/Kiritimati` yet.
- ✅ `createInMemoryLocationRepository({ initialDocument })` is exported from `@/adapters` (`adapters/index.ts:7`, `adapters/inMemoryLocationRepository.ts:27-44`); `LocationList` from `@/views/shared` (`views/shared/index.ts:2`); `renderLocations(repository, scheduler, clock)` in `test/renderLocations.tsx:22-37`; `englishLocale` in `test/features/main_page/steps/englishTexts.ts:7`; `locales/locales.test.ts` exists.
- ✅ `KNOWN_CITIES` holds Almaty, Moscow, Kolkata, New York, Kyiv, Tokyo, Kathmandu, UTC and no Saint Petersburg (`test/factories/buildLocation.ts:17-29`), as task 6.1 assumes.
- ✅ `accent` / `accent-foreground` tokens exist (`tailwind.config.ts:17-19`); `lucide-react` is a dependency (`package.json:33`).
- ✅ ADR-0007 (Accepted) states the quoted rules: read through `clock.timeZoneId()`, canonicalized, sent with `SET_DEVICE_TIME_ZONE`, not persisted, unknown → `UTC`, "here" mark with location arrow, equality by canonical ID (`docs/adr/0007-reference-zone-and-device-time.md`); `docs/architecture/domain-model.md:13,37` names `deviceTimeZoneId` as non-persisted state.
- ✅ The "Travelling" screen shows the "here" mark (`docs/design/README.md:30`); `docs/architecture/views.md:79` names the location-arrow "here" icon.
- ✅ Nothing of this change is implemented yet: no `SET_DEVICE_TIME_ZONE`, `deviceTimeZone` or badge string in `packages/client/src/` or `openspec/specs/`, and no archived change under `openspec/changes/archive/2026/` builds it.
- ✅ The `{ locations: [] }`-style `LocationsState` fixtures design.md:98 names exist (`model/locations.test.ts:10`, `model/moveLocation.test.ts:10`, `test/features/locations/steps/locations_management.steps.ts:8`).
- ❌ The inventory of code that must follow the new required fields is incomplete (design.md:83, design.md:98, tasks.md:9). Not listed anywhere: `test/features/locations/steps/locations_reorder_unit.steps.ts:248-249` (`reduceLocations({ locations }, …)` — a `LocationsState` without `deviceTimeZoneId`), `:257-261` (`presentLocationRows` context without `deviceTimeZoneId`) and `:209-214` (a `LocationRow` without `deviceTimeZoneLabel`); `test/features/locations/steps/locations_utc_offset_unit.steps.tsx:240-244` (`presentLocationRows` context; task 1.3 only edits its `fakeClock` calls); `LocationRow` fixtures in `views/shared/LocationRow.dragging.test.tsx:16`, `views/shared/useReorderAnnouncements.test.tsx:13` and `views/shared/LocationList.drop.test.tsx:34-38`.

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ "Device time zone badge on location rows", "One row matches" | ✅ 2.2, 3.1, 4.1, 5.1, 6.1, 7.1 |
| FR2 | ✅ | ✅ "No row matches", "Several rows match" | ✅ 2.2, 3.1, 4.1, 5.1, 6.1 |
| FR3 | ✅ | ✅ "Legacy device identifier", "Unknown device identifier", "Device zone is read once", "Device zone is not stored" | ✅ 1.1, 2.1, 4.1, 6.1, 8.2 |
| FR4 | ✅ | ✅ "Badge follows changes of the list" (move, reset, other tab covered at reducer level) | ✅ 2.1, 4.1, 6.1 |
| FR5 | ✅ | ✅ "English interface", "Russian interface" | ✅ 1.2, 3.1, 6.1 |
| NFR-P1 | ✅ | ✅ "50 rows within the budget" | ✅ 6.1 |
| NFR-A1 | ✅ | ✅ "Row name includes the badge" | ✅ 7.1 |
| NFR-A2 | ✅ | ✅ "No accessibility violations with the badge" | ✅ 7.1 |
| NFR-R1 | ✅ | ✅ "Badge fits narrow and wide screens" | ✅ 7.1 |
| NFR-R2 | ✅ | ✅ "List screenshots show the badge" | ✅ 7.1, 7.2 |
| UX1 | ✅ | ✅ requirement text "next to its city name" | ✅ 5.1 |
| UX2 | ✅ | ✅ "Device time zone badge text" requirement text (icon hidden from AT) | ✅ 5.1 |
| G1 | ✅ | n/a — met by FR1, FR2 | n/a — met by FR1, FR2 |
| G2 | ✅ | n/a — met by NFR-A1 | n/a — met by NFR-A1 |
| NG1 | ✅ | n/a | n/a — no artifact builds a reference zone or home |
| NG2 | ✅ | n/a | n/a — no artifact reorders rows |
| NG3 | ✅ | n/a | n/a — zone read once in the `useState` initializer (D3), no re-read |
| NG4 | ✅ | n/a | n/a — no derived Here entry is built |
| NG5 | ✅ | n/a | n/a — equality by canonical ID; task 2.2 tests Minsk ≠ Moscow |
| NG6 | ✅ | n/a | n/a — search results are untouched |
| M1 | ✅ | n/a | ✅ 8.1 |
| M2 | ✅ | n/a | ✅ 6.1 (`@M2` on the five count scenarios) |
| M3 | ✅ | n/a | ✅ 2.3, 3.2, 4.2, 5.2 |
| M4 | ✅ | n/a | ✅ 7.1 |
| M5 | ✅ | n/a | ✅ 7.2 |
| Q1 | ✅ | n/a | n/a — answered in proposal.md:122 (follow the task text, keep the arrow icon; docs wording left to a docs change) |
| Q2 | ✅ | n/a | n/a — answered in proposal.md:123 and design.md:95 (re-read deferred to the clock-tick change) |

## Consistency

None.

## Findings

### R1 — WARNING — Callers and fixtures of the widened types are missing from design and tasks
- Location: `openspec/changes/mark-device-time-zone-in-location-list/design.md:83`
- Rule: `.claude/rules/tdd-workflow.md` ("When modifying existing code: verify a test exists first"); CLAUDE.md Post-Edit Workflow (`pnpm run build`)
- Problem: D1 makes `deviceTimeZoneId` a required field of `LocationsState`, and D4 makes `deviceTimeZoneId` required in `LocationRowsContext` and `deviceTimeZoneLabel` required in `LocationRow`. design.md:83 and design.md:98 list the callers and fixtures to update, and tasks 1.3, 2.1, 3.1, 4.1 and 5.1 edit only those. Other existing code that builds these types is not listed: `test/features/locations/steps/locations_reorder_unit.steps.ts:248-249` (`reduceLocations({ locations }, …)`), `:257-261` (`presentLocationRows(…, { language, instant, translate })`) and `:209-214` (row objects without `deviceTimeZoneLabel`); `test/features/locations/steps/locations_utc_offset_unit.steps.tsx:240-244` (`presentLocationRows` context; task 1.3 only touches its `fakeClock` calls); and the `LocationRow` fixtures in `views/shared/LocationRow.dragging.test.tsx:16`, `views/shared/useReorderAnnouncements.test.tsx:13` and `views/shared/LocationList.drop.test.tsx:34-38`.
- Impact: `tsconfig.json` references `tsconfig.app.json` (`"include": ["src"]`) and `tsconfig.test.json` (`src/**/*.test.ts(x)`, `src/test/**/*`), so `tsc -b` in `pnpm build` / `typecheck` fails on these six files. That failure first shows up at task 8.3 (or the post-edit build), after every task's own checks have passed. Vitest does not type-check, so the per-task test runs do not catch it.
- Fix: In design.md "Consequences → Negative" (line 83), add `test/features/locations/steps/locations_reorder_unit.steps.ts`, `test/features/locations/steps/locations_utc_offset_unit.steps.tsx` (the `presentLocationRows` call), `views/shared/LocationRow.dragging.test.tsx`, `views/shared/useReorderAnnouncements.test.tsx` and `views/shared/LocationList.drop.test.tsx` to the updated callers and fixtures. In design.md "Risks" (line 98), add `locations_reorder_unit.steps.ts` (`reduceLocations({ locations }, …)` → `{ ...INITIAL_LOCATIONS_STATE, locations }`). In tasks.md, extend task 2.1 with that state fixture. Extend task 3.1 with the two `presentLocationRows` calls in the steps files (`deviceTimeZoneId: UNIT_TEST_DEVICE_TIME_ZONE`). Extend task 5.1 with `deviceTimeZoneLabel: ""` in the four row fixtures. End each of these tasks with `pnpm --filter @time-zones/client typecheck` next to its vitest command.
- Fix risk: none. `deviceTimeZoneLabel: ""` and a non-matching `UNIT_TEST_DEVICE_TIME_ZONE` render no badge, so the reorder and UTC-offset scenarios keep their current assertions (including the exact `UTCUTC` row text). The edits touch only test fixtures, and adding `typecheck` to each task is one more sequential command, which agrees with the one-at-a-time rule in CLAUDE.md.
- Status: fixed
- Resolution: design.md Consequences→Negative now lists the reorder and UTC-offset steps files and the three views/shared row fixtures, and Risks lists the `reduceLocations({ locations })` fixture in locations_reorder_unit.steps.ts; tasks.md 2.1 (state fixture), 3.1 (both `presentLocationRows` calls get `deviceTimeZoneId: UNIT_TEST_DEVICE_TIME_ZONE`) and 5.1 (`deviceTimeZoneLabel: ""` in the four row fixtures) now name them and end with `pnpm --filter @time-zones/client typecheck`.

## Verdict

Ready to implement. No finding blocks: R1 (WARNING) is an incomplete edit list that the build in task 8.3 would expose. Fixing it first saves a late round of type errors.
