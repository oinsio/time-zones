# Specs review: show-local-time-and-date-on-location-cards

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 32/32 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Freshness

- ✅ `lib/temporal.ts` exposes `Clock { instant(), plainDateISO(), timeZoneId() }`, `systemClock`, `fakeClock(isoTimestamp, timeZone = "UTC")` (design.md:7) — `packages/client/src/lib/temporal.ts:9-37`.
- ✅ `getUtcOffsetMinutes(timeZoneId, instant)` uses `instant.toZonedDateTimeISO(timeZoneId)` and maps `RangeError` to `undefined` (design.md:8) — `src/model/utcOffset.ts:9-17`.
- ✅ `SET_DEVICE_TIME_ZONE` canonicalizes, falls back to `UTC`, and returns the same state when unchanged (design.md:8, design.md:105) — `src/model/locations.ts:122-130`.
- ✅ `LocationRow { id, cityLabel, countryName, utcOffsetLabel, deviceTimeZoneLabel }` and context `{ language, instant, translate, deviceTimeZoneId }` (design.md:9) — `src/presenter/presentLocationRows.ts:12-27`.
- ✅ `LocationsProvider.tsx` is 174 lines, reads `clock.timeZoneId()` once in a `useState` initializer, and its only timer is the write debounce (design.md:10) — `src/controller/LocationsProvider.tsx:77-79, 95-101`.
- ✅ Nothing listens to `visibilitychange` (design.md:10): `grep -rn visibilitychange packages/client/src` finds nothing.
- ✅ `useLocations` presents rows in a `useMemo` with `instant: clock.instant()` keyed on `[locations, deviceTimeZoneId, language, t, clock]` (design.md:11) — `src/controller/useLocations.ts:32-41`.
- ✅ `LocationRow.tsx` is 119 lines: `<li aria-labelledby=…>`, drag handle, a column with the city line plus badge and a muted secondary line with country and offset, then the remove button (design.md:12) — `src/views/shared/LocationRow.tsx:72-114`.
- ✅ `constants/utcOffset.ts` has `NANOSECONDS_PER_MINUTE` and `MINUTES_PER_HOUR`, and no millisecond-per-minute constant exists (design.md:13) — `src/constants/utcOffset.ts:2-3`; grep for `MILLISECONDS|60_000` in production code finds only `NANOSECONDS_PER_MINUTE`.
- ✅ `test/setup.ts` pins `systemClock.timeZoneId` to `UNIT_TEST_DEVICE_TIME_ZONE` and starts i18n in `ru` (design.md:14) — `src/test/setup.ts:30,36`.
- ✅ `test/writeSchedulers.ts` has `immediateWriteScheduler` and `createManualWriteScheduler()` with `lastDelayMs()` / `runPending()`; `test/renderLocations.tsx` renders `useLocations` inside `LocationsProvider` with `(repository, writeScheduler, clock?)` (design.md:14, tasks.md 4.1/4.3) — `src/test/writeSchedulers.ts`, `src/test/renderLocations.tsx:22-37`.
- ✅ `playwright.bdd.config.ts` pins `timezoneId` to `Asia/Almaty` and has `chromium` and `mobile-chrome` projects (design.md:14, proposal M5) — `packages/client/playwright.bdd.config.ts:39,80,88,93`.
- ✅ The screenshot step lives in `locations_layout_e2e.steps.ts` and is the only `toHaveScreenshot` call; the "list" state seeds Almaty and Moscow (design.md:14) — `steps/locations_layout_e2e.steps.ts:63-68`, `steps/locationsStates.ts:20,48-52`.
- ✅ The screenshot outline in `locations_ui_e2e.feature` has 4 "list" examples (375/1024 × light/dark), giving 8 baselines across 2 projects; the other states are empty, suggestions and IST results (proposal M6, design D6) — `locations_ui_e2e.feature:111-135`, `__screenshots__/chromium/`.
- ✅ `tsconfig.app.json` `lib` is `["ES2020", "ES2022.Intl", "DOM", "DOM.Iterable"]` (design.md:15) — `packages/client/tsconfig.app.json:7`.
- ✅ `useCitySearch.ts` already suppresses `useExhaustiveDependencies` with a reason (design.md:16) — `src/controller/useCitySearch.ts:33`.
- ✅ The "Zero offset" step asserts `rowOf(city).textContent` equals `${city}${offset}`, and the steps file switches to English in `BeforeEachScenario` (design D6, tasks 6.1) — `steps/locations_utc_offset_unit.steps.tsx:101,160`; `2026-07-15` is a Wednesday, so `12:00Wed, Jul 15` is correct.
- ✅ The test "should read the device zone once across list changes" exists, goes through `renderLocations`, and asserts `timeZoneId` was called once (proposal Impact, tasks 4.3) — `src/controller/useLocations.deviceTimeZone.test.tsx:50-58`.
- ✅ The unit BDD scenario "Device zone is read once" exists (proposal Impact) — `locations_device_time_zone_unit.feature:56`; `deviceTimeZoneWorld.tsx` renders `LocationsProvider` directly (tasks 6.1) — `steps/deviceTimeZoneWorld.tsx:81-87`.
- ✅ The fixture files that build `LocationRow` values match design "Consequences" exactly — `grep -rl deviceTimeZoneLabel src` lists those 9 test/step files plus the two production files.
- ✅ The reused E2E steps "the stored locations are …", "the user opens the locations app", "the locations screen uses the <theme> theme", "the screen is {int} px wide for the locations", "the locations screen does not scroll horizontally", "the locations screen has no accessibility violations" and "the row of {string} is named {string}" exist (tasks 7.2) — `locations_view_contract_e2e.steps.ts:22`, `locations_layout_e2e.steps.ts:15,25`, `locations_view_a11y_e2e.steps.ts:18,34`, `locations_device_time_zone_e2e.steps.ts:13`; no `current time is` step exists yet.
- ✅ `createInMemoryLocationRepository` does not validate zones on load, so the world in tasks 6.2 can seed `Mars/Olympus_Mons`, as the existing offset scenario does — `src/adapters/inMemoryLocationRepository.ts:57`, `steps/locations_utc_offset_unit.steps.tsx:189-199`.
- ✅ The task 8.2 grep for `new Date|Date\.now|setInterval` in production code finds nothing today, so it can pass.
- ✅ The package scripts `typecheck`, `lint`, `test`, `test:bdd` and `build` exist under the name `@time-zones/client` (tasks.md commands) — `packages/client/package.json:2-20`.
- ✅ The expected strings hold under ICU 78: Almaty at `2026-03-08T07:30:00Z` gives `12:30`, `Sun, Mar 8` and `вс, 8 мар.`; New York gives `03:30` (design D3, proposal M2), checked with `Intl.DateTimeFormat` using the D2 options.
- ✅ The MODIFIED "UTC offset on location rows" and "Device time zone badge on location rows" exist in `openspec/specs/locations/spec.md:189,458` with the restated scenarios. Only the "not refreshed on a timer" / "read once" sentences change (plus wording in "Device zone is read once"), and new scenarios are added.
- ✅ Nothing is implemented yet: there is no `localTimeLabel`, `LocalDateTime`, `minuteTick` or `tickScheduler` in `packages/client/src`, and no archived change shows time or date.
- ✅ The layout claim matches the approved screens: on the phone the time is on the city line at the right with the date under it; on the tablet the time and date column follows the city and zone column (proposal NFR-R2) — `docs/design/screens/phone-light.png`, `tablet-light.png`.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ "Local time and date on location rows" | ✅ 2.1, 3.1, 3.2, 6.2, 7.2 |
| FR2 | ✅ | ✅ "Local time and date on location rows" | ✅ 2.1, 3.1, 3.2, 5.1, 6.2, 7.2 |
| FR3 | ✅ | ✅ "Local time and date follow the clock" | ✅ 4.1, 4.2, 6.3 |
| FR4 | ✅ | ✅ "Local time and date follow the clock" + MODIFIED offset and badge requirements | ✅ 4.3, 6.1, 6.3 |
| FR5 | ✅ | ✅ "Time is computed again when the list changes" | ✅ 4.3, 6.2 |
| FR6 | ✅ | ✅ "Time that cannot be computed" | ✅ 2.1, 3.2, 5.1, 5.2, 6.2 |
| NFR-P1 | ✅ | ✅ "50 rows within the budget" | ✅ 6.2 |
| NFR-A1 | ✅ | ✅ "No accessibility violations with times" | ✅ 7.2 |
| NFR-A2 | ✅ | ✅ "Time does not change the row name and is not announced" | ✅ 5.1, 5.2, 7.2 |
| NFR-R1 | ✅ | ✅ "Times fit narrow and wide screens" | ✅ 7.2 |
| NFR-R2 | ✅ | ✅ "Narrow screen", "Wide screen" | ✅ 7.1, 7.2 |
| NFR-R3 | ✅ | ✅ "List screenshots show the time and the date" | ✅ 7.3 |
| UX1 | ✅ | ✅ "Local time and date layout" | ✅ 5.1 (size and tabular figures; weight not asserted, R2) |
| UX2 | ✅ | ✅ "Local time and date layout" | ✅ 5.1, 7.1 |
| G1 | ✅ | n/a, met by FR1, FR2 | n/a, met by FR1, FR2, M2 |
| G2 | ✅ | n/a, met by FR3 | n/a, met by FR3, M3 |
| G3 | ✅ | n/a, met by NFR-R1–NFR-R3 | n/a, met by NFR-R1–NFR-R3, M5, M6 |
| NG1 | ✅ | n/a | n/a, no artifact builds sliders |
| NG2 | ✅ | n/a | n/a, no artifact builds Now or `PINNED` (design D1 rejects reference state) |
| NG3 | ✅ | n/a | n/a, no artifact builds a date control |
| NG4 | ✅ | n/a | n/a, 24-hour time is fixed by D2; no preference is built |
| NG5 | ✅ | n/a | n/a, no differences, home or Here entry are built |
| NG6 | ✅ | n/a | n/a, no time input or wall-time hint is built |
| NG7 | ✅ | n/a | n/a, D2 has no `second` option |
| M1 | ✅ | n/a | ✅ 8.1 |
| M2 | ✅ | n/a | ✅ 6.2 (`@M2`), 3.1 |
| M3 | ✅ | n/a | ✅ 4.1, 4.2, 4.3, 6.3 |
| M4 | ✅ | n/a | ✅ 2.2, 3.3, 4.4, 5.3 (see R1 for 4.4) |
| M5 | ✅ | n/a | ✅ 7.2 |
| M6 | ✅ | n/a | ✅ 7.3 |
| Q1 | ✅ | n/a | n/a, answered in the proposal and design D2 (`hourCycle: "h23"`) |
| Q2 | ✅ | n/a | n/a, answered in design D3 (Intl conventions; aligning the docs is left to a docs change) |

## Consistency

None.

## Findings

### R1 — WARNING — `tickScheduler.ts` is in a mutation run but no task tests it
- Location: `openspec/changes/show-local-time-and-date-on-location-cards/tasks.md:132` (task 4.1) and `tasks.md:135` (task 4.4)
- Rule: `.claude/rules/test-planning.md` ("Mutation testing (Stryker) — verify test quality, target >=95% score, minimum acceptable >=90%"), `.claude/rules/tdd-workflow.md` ("Never write implementation before its test exists")
- Problem: Task 4.1 adds `controller/tickScheduler.ts` (`timeoutTickScheduler`, a `setTimeout` / `clearTimeout` wrapper, design D4) with no test. Every test and feature the change plans injects `createManualTickScheduler()`, so no test checks the production scheduler. Task 4.4 still runs Stryker on `src/controller/tickScheduler.ts` with a ≥ 95% target (`stryker.config.mjs` mutates all of `src/**/*.ts`). The existing `writeScheduler.ts`, which has the same shape, also has no test, so this gap is copied from a precedent rather than solved by one.
- Impact: The scheduler's mutants (function body emptied, cancel turned into a no-op) survive or stay uncovered and pull down the 4.4 score, so M4 can fail at that step. A broken production tick, such as a cancel that does not clear the timeout, would ship with every test green. The implementer also has no task telling them to write the test that TDD requires first.
- Fix: In task 4.1, add `controller/tickScheduler.test.ts` (header `// Verifies FR3 of show-local-time-and-date-on-location-cards (D4).`). It uses real timers, not `vi.useFakeTimers()`, so it stays within `tdd-workflow.md`. Two cases: `timeoutTickScheduler.schedule(callback, 0)` runs the callback (await a promise that the callback resolves); and calling the returned cancel before a 0 ms delay elapses means the callback has not run after awaiting a second 0 ms timeout. Add `npx vitest run src/controller/tickScheduler.test.ts` to the task's verify commands.
- Fix risk: Two real 0 ms timers add a few milliseconds to the unit run. No rule is broken: the rules forbid only `vi.setSystemTime()` and `vi.useFakeTimers()`.
- Status: fixed
- Resolution: tasks.md 4.1 now TDDs `controller/tickScheduler.ts` in `controller/tickScheduler.test.ts` (FR3 header; real 0 ms timers: the callback runs, and a cancel before the delay keeps it from running) and adds `npx vitest run src/controller/tickScheduler.test.ts` to its verify commands. The Unit bullet of design.md D6 says this is the only test of the production scheduler.

### R2 — SUGGESTION — The "bolder than the city" part of UX1 is never asserted
- Location: `openspec/changes/show-local-time-and-date-on-location-cards/tasks.md:139` (task 5.1)
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: UX1 (`proposal.md:90`) and the "Local time and date layout" requirement (`specs/locations/spec.md:74`) say the time is "larger and bolder than the city". Task 5.1 asserts only `tabular-nums` and "a larger text class than the city's". The E2E scenario tagged `@UX1` in task 7.2 checks only positions. The weight (`font-bold` vs the city's `font-semibold`, design D5) is not tested anywhere.
- Impact: The time could be rendered in a normal or semibold weight with every test passing, so half of UX1 has no guard. Tasks 3–5 make every other UX/NFR clause testable, so this is the one clause left uncovered.
- Fix: In task 5.1, add the assertion "the time element has `font-bold` and the city element of `LocationRow` has `font-semibold`" next to the existing size assertion.
- Fix risk: none. The assertion uses the class names design D5 already fixes, in the same jsdom test that already checks classes.
- Status: fixed
- Resolution: tasks.md 5.1 now asserts `font-bold` on the time in `LocalDateTime.test.tsx`. Task 5.2 asserts, in `LocationRow.test.tsx`, that the time element has `font-bold` and the city element `font-semibold` (UX1), because the city lives in `LocationRow` (`LocationRow.tsx:87`) and not in `LocalDateTime`.

## Verdict

Ready to implement. There are no blocking findings. Fold R1 (WARNING) into task 4.1 before task 4.4 runs, and R2 (SUGGESTION) into task 5.1.
