# Tasks

Depends on: `support-legacy-ios-12-safari`, `set-home-location-and-show-differences`, `show-here-entry-for-device-time`. Start only after all three are archived.

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`.

- **Running tests:** one command at a time, never in the background. Mutation runs take at most 5 files per run. The report is in `reports/mutation/mutation-report.json`.
- **Time in tests:** only `fakeClock(instant, timeZone)` of `@/lib/temporal` or `createSwitchableClock`. Never `vi.setSystemTime()` or `vi.useFakeTimers()`.
- **No BigInt:** no BigInt literal, `BigInt(` or `epochNanoseconds` in production code. The legacy source scan (`test/noBigIntInSources.test.ts`) must stay green.
- **Traceability:** every new test, step file and feature carries `add-wall-time-input-with-hint`:
  - `@add-wall-time-input-with-hint @FR-X` tags above scenarios;
  - `// Verifies NFR-X of add-wall-time-input-with-hint` in E2E steps;
  - `Implements FR-X of add-wall-time-input-with-hint` in the JSDoc of new or changed production code.
- **Glossary:** names come from `docs/glossary/`. Wall-time input, wall-time target, wall-time hint, gap note, wall-clock time, wall-clock status. Never "time picker", "slider" for the input, or `GMT` in new text.
- **File size:** every file stays under 200 lines.
- **Design references:** "design Dn" refers to `design.md`.

## 1. Glossary, constants and locale keys (no TDD: docs, constants and translations)

- [ ] 1.1 Glossary entries (proposal "What Changes"): add **Wall-time input** and **Wall-time target** to `docs/glossary/time-selection.md`; remove *(planned)* from **Wall-time hint** in `docs/glossary/date-selection.md` and set its *RU:* and *Code:* (`presentWallTimeHint`, `WallTimeHint`); add "or a wall-time input" to the end of **Gap note**. Keep each file under 200 lines.
- [ ] 1.2 Add `WALL_TIME_INPUT_PATTERNS`, `MAX_HOUR = 23`, `MAX_MINUTE = 59` and `WALL_TIME_COMMAND_PATTERN` (`HH:MM`) to `constants/timeSelection.ts` and re-export them from `constants/index.ts` (design D1, D3; FR2). Verify with `pnpm --filter @time-zones/client typecheck`.
- [ ] 1.3 Add `locations.wallTimeInputLabel` ("Enter time — {{city}}, {{time}}" / «Ввести время — {{city}}, {{time}}»), `locations.wallTimeInputError` ("Enter the time as HH:MM" / «Введите время в формате ЧЧ:ММ»), `locations.wallTimeHint.gap` ("{{requestedTime}} does not exist on this day — clocks moved forward. Showing {{shownTime}}." / «{{requestedTime}} не существует в этот день — часы переведены вперёд. Показано {{shownTime}}») and `locations.wallTimeHint.ambiguous` ("{{requestedTime}} occurs twice — showing the first ({{utcOffset}})." / «{{requestedTime}} бывает дважды — показано первое ({{utcOffset}})») to `locales/en.json` and `locales/ru.json` (design D4, FR11). Verify with `npx vitest run src/locales/locales.test.ts`.

## 2. Model (TDD)

- [ ] 2.1 TDD `WallTimeTargetKind`, `WallTimeTarget` and the optional `wallTimeTarget` of `ReferenceMoment.PINNED` in `model/referenceMoment.ts`; `SET_WALL_TIME` and `LocationErrorCode.INVALID_TIME` in `model/locations.ts`; the reducer in new `model/reduceWallTime.ts`, delegated from `reduceLocations` (design D1). Tests in new `model/reduceWallTime.test.ts` with `it.each`, header `// Verifies FR3, FR4, FR9, FR10 of add-wall-time-input-with-hint (D1).`:
  - device `Asia/Almaty`, now `2026-03-08T07:30:00Z`, New York target, `10:40` on `2026-03-08` → `2026-03-08T14:40:00Z` `UNIQUE`, target set (M2);
  - `23:00` on `2026-03-08` → `2026-03-09T03:00:00Z` (M2);
  - `02:30` on `2026-03-08` → `07:30:00Z` `GAP`, `requestedWallTime` `02:30`; `01:30` on `2026-11-01` → `05:30:00Z` `AMBIGUOUS` (M3);
  - Here entry target, device `Asia/Almaty`, `08:00` on `2026-03-08` → `2026-03-08T03:00:00Z`;
  - the same command twice → the same state object (`toBe`);
  - unknown location → `LOCATION_NOT_FOUND`; `25:00`, `9:30`, `09:5` → `INVALID_TIME`; date `2026-13-01` → `INVALID_DATE`; nothing changes;
  - after it, `SELECT_INSTANT`, `SHIFT_DATE +1` and `RESET_TO_NOW` leave no `wallTimeTarget`;
  - the command equals `JSON.parse(JSON.stringify(command))`.

  Verify red, then green, with `npx vitest run src/model/reduceWallTime.test.ts`.
- [ ] 2.2 TDD the legacy zone name through `resolveWallClock` (design "Risks", FR13, M8). Add to `model/wallClock.test.ts` a case with an `Intl.DateTimeFormat` stub that rejects `Europe/Kyiv` and accepts `Europe/Kiev`, with the legacy zone shim of `lib/legacy/` installed and `temporal-polyfill` imported fresh (`vi.resetModules()`), as in `lib/legacy/zoneShim.test.ts`: `resolveWallClock("Europe/Kyiv", 2026-03-08T10:00)` → `2026-03-08T08:00:00Z` `UNIQUE`; `2026-03-29T03:30` → `GAP`. Verify with `npx vitest run src/model/wallClock.test.ts`. If it fails, stop and fix the shim in `lib/legacy/zoneShim.ts` (its owner), not `resolveWallClock`.
- [ ] 2.3 TDD `getWallClockNote(state)` in new `model/wallClockNote.ts` (design D2, FR7, FR9). Tests in `model/wallClockNote.test.ts` with `it.each`: live → none; `UNIQUE` → none; date-change `GAP` → date bar; date-change `AMBIGUOUS` → none; wall-time `GAP` / `AMBIGUOUS` on a listed location → that location; on a removed location → none; Here entry target while `getHereEntry` returns it → Here entry; after a location matching the device zone is added → none. Export from `model/index.ts`. Verify with `npx vitest run src/model/wallClockNote.test.ts`, then `npx vitest run src/model`.
- [ ] 2.4 Mutation run (M6). Verify that `npx stryker run --mutate 'src/model/reduceWallTime.ts,src/model/wallClockNote.ts,src/model/referenceMoment.ts,src/model/locations.ts'` scores ≥ 95% (minimum 90%).

## 3. Presenter (TDD)

- [ ] 3.1 TDD `parseWallTimeInput` in new `presenter/parseWallTimeInput.ts` (design D3, FR2). Tests with `it.each` over the 10 accepted and 6 rejected texts of M4. Verify with `npx vitest run src/presenter/parseWallTimeInput.test.ts`.
- [ ] 3.2 TDD `formatWallClockTime` in `presenter/localDateTime.ts` and switch `presentDateBar` to it (design D4). Keep `presenter/dateBar.test.ts` green unchanged (gap note text). Verify with `npx vitest run src/presenter/localDateTime.test.ts`, then `npx vitest run src/presenter/dateBar.test.ts`.
- [ ] 3.3 TDD `presentWallTimeHint` in new `presenter/wallTimeHint.ts` (design D4, FR7, FR11). Tests: English `GAP` for New York `02:30` → `03:30` gives the exact FR7 text; Russian `AMBIGUOUS` for `01:30` at `2026-11-01T05:30:00Z` gives «01:30 бывает дважды — показано первое (UTC−4)»; `UNIQUE` → `undefined`. Verify with `npx vitest run src/presenter/wallTimeHint.test.ts`.
- [ ] 3.4 TDD the row fields `wallTimeHint` and `wallTimeInputLabel` in the zone-level row presenter shared by location rows and the Here entry (design D4, NFR-A2). Tests: "Enter time — Moscow, 10:30" / «Ввести время — Москва, 10:30»; the hint only on the row named by `getWallClockNote`. Verify with `npx vitest run src/presenter`.
- [ ] 3.5 Work bound (NFR-P1, ADR-0008): extend the row work-bound scenario with a wall-time input in one of 50 rows: presenting again builds 0 formatters, and transition lookups touch only the typed zone. Add the case to the existing row benchmark under `test/benchmarks/`. Verify with the feature run of section 5.
- [ ] 3.6 Mutation run. Verify that `npx stryker run --mutate 'src/presenter/parseWallTimeInput.ts,src/presenter/wallTimeHint.ts,src/presenter/localDateTime.ts,src/presenter/dateBar.ts'` scores ≥ 95% (minimum 90%).

## 4. Controller and views (TDD)

- [ ] 4.1 TDD `setWallTime(target, time, date)` in `controller/locationsContext.ts` and `LocationsProvider.tsx`, dispatched without the write scheduler (design D5, FR9). Switch `useReferenceMoment` to `getWallClockNote` for the gap note, and pass the note target to the row presenter in `useLocations`. Tests: 20 inputs and a Now cause 0 writes (`createManualWriteScheduler`, M5); the gap note disappears after a wall-time input. Verify with `npx vitest run src/controller/useReferenceMoment.test.ts`, then `npx vitest run src/controller/useLocations.test.tsx`.
- [ ] 4.2 TDD the time button and `WallTimeInput` in `views/shared/LocalDateTime.tsx` and new `views/shared/WallTimeInput.tsx` (design D6, FR1, FR5, FR6, FR10, NFR-A2, NFR-A4). Tests in `WallTimeInput.test.tsx`: click opens a text field with `inputmode="numeric"`, `autocomplete="off"`, never `type="time"`, value selected; Enter with `1040` calls `setWallTime` with `10:40` and the row's date; invalid text shows the error with `aria-describedby` and calls nothing; Escape closes; focus returns to the button; `LOCATION_NOT_FOUND` closes silently; Space and arrows do not reach a parent `keydown` listener. Verify with `npx vitest run src/views/shared/WallTimeInput.test.tsx`.
- [ ] 4.3 TDD the legacy open path (FR13, M8). New `views/shared/WallTimeInput.legacy.test.tsx`: `vi.stubGlobal("PointerEvent", undefined)`, re-import the module, fire a plain `click` (no pointer events) on the time button → the field is open. Verify with `npx vitest run src/views/shared/WallTimeInput.legacy.test.tsx`.
- [ ] 4.4 TDD `WallTimeHint` (`role="status"`) in new `views/shared/WallTimeHint.tsx` and place it between the country line and the day track of the shared card layout block, for cards and the Here entry (design D6, FR7, NFR-A3, UX3). Add hint colour tokens to `styles/tokens.css` for both themes if none fits. Verify with `npx vitest run src/views/shared/WallTimeHint.test.tsx`, then `npx vitest run src/views/shared`.
- [ ] 4.5 Mutation run. Verify that `npx stryker run --mutate 'src/views/shared/WallTimeInput.tsx,src/views/shared/LocalDateTime.tsx,src/views/shared/WallTimeHint.tsx,src/controller/useReferenceMoment.ts'` scores ≥ 95% (minimum 90%).

## 5. Behaviour features

- [ ] 5.1 Write `test/features/time_selection/time_selection_wall_time_input.feature` (vitest-cucumber) with steps under `steps/`, covering the `time-selection` delta scenarios that need no real browser: accepted and rejected texts, pinning, leaving the reference day, outcomes, the Here entry, the gone location, nothing stored, both hints, the hint's end and its row's removal, the gap note ended by an input, names in both languages, the work bound, the renamed zone. Add the two new `date-selection` scenarios to the existing date-selection feature. Tags `@add-wall-time-input-with-hint @FR-X`. Verify with `npx vitest run src/test/features/time_selection`, then `npx vitest run src/test/features/date_selection`.
- [ ] 5.2 Write `time_selection_wall_time_input_e2e.feature` (playwright-bdd): open and cancel, keyboard-only input with focus return and unchanged card order, axe-core in the 5 states × 2 themes, no horizontal scrolling at 320 and 2560 px with an open field and a hint (NFR-A1, NFR-A4, NFR-R1, UX1, UX2). Verify with `pnpm --filter @time-zones/client test:e2e -- --grep @add-wall-time-input-with-hint`.
- [ ] 5.3 Add the `@view-contract` scenario "Type an exact time" to `time_selection_view_contract_e2e.feature` (FR12). Verify with the view-contract project run.
- [ ] 5.4 Add the states "wall-time-input" and "wall-time-hint" to the screenshot outline of `locations/locations_ui_e2e.feature`; re-approve the baselines with rows in `chromium` and `mobile-chrome` (NFR-R2, M7). Verify by a second run without `--update-snapshots`.

## 6. Documents and final checks

- [ ] 6.1 Update `docs/architecture/views.md` ("Time display", "Wall-time hint": `UTC−4`, the input's name), `docs/architecture/domain-model.md` (`SET_WALL_TIME(target, time, date)`, `INVALID_TIME`) and `docs/architecture/open-questions.md` Q4 (the Here entry is a valid target).
- [ ] 6.2 Run `pnpm run build`, then `npx vitest run src/test/noBigIntInSources.test.ts` (legacy scan green), then the legacy build check script of `support-legacy-ios-12-safari`.
- [ ] 6.3 Traceability check: every FR1–FR13, NFR-P1, NFR-A1–NFR-A4, NFR-R1, NFR-R2 and UX1–UX3 appears with `add-wall-time-input-with-hint` in at least one test (`grep -rn "add-wall-time-input-with-hint" src/test src --include=*.ts*`) (M1).
