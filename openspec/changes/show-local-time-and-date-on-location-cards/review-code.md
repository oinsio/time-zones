# Review: show-local-time-and-date-on-location-cards

## Summary

| Item | Value |
|---|---|
| Tasks verified | 23/23 |
| Requirements traced | 53/54 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Tasks

All paths are under `packages/client/src/`.

- ✅ 1.1 — `constants/localDateTime.ts:2-12` (`LOCAL_TIME_FORMAT_OPTIONS` with `hourCycle: "h23"`, `LOCAL_DATE_FORMAT_OPTIONS`), `constants/clock.ts:2` (`MILLISECONDS_PER_MINUTE = 60_000`), both re-exported in `constants/index.ts:1,5-8`.
- ✅ 1.2 — `test/pageVisibility.ts:7-19` `setPageVisibility` / `resetPageVisibility`, DOM only.
- ✅ 2.1 — `model/localDateTime.ts:8-18` (`toZonedDateTimeISO`, `RangeError` → `undefined`, other errors rethrown); `model/localDateTime.test.ts` with `it.each` plus Tokyo plain date, unknown zone, rethrow cases; exported in `model/index.ts:8`.
- ✅ 2.2 — measured in this review: `model/localDateTime.ts` 100% (5/5).
- ✅ 3.1 — `presenter/localDateTime.ts:13-28` `formatLocalTime` / `formatLocalDate` via `ZonedDateTime.toLocaleString` (no `Date`); `presenter/localDateTime.test.ts` two `it.each` tables (en/ru, Tokyo, UTC).
- ✅ 3.2 — `presenter/presentLocationRows.ts:22-27,53,68-74` (`localTimeLabel`, `localDateLabel`, `localIsoDate`, `""` for an unknown zone); tests at `presenter/presentLocationRows.test.ts:159-209`; fixtures updated in `controller/useLocations.test.tsx`, `views/shared/LocationRow.test.tsx`, `LocationRow.dragging.test.tsx`, `LocationList.test.tsx`, `LocationList.drop.test.tsx`, `useReorderAnnouncements.test.tsx`, `steps/locations_reorder_unit.steps.ts` (`useLocations.deviceTimeZone.test.tsx:32` only projects `deviceTimeZoneLabel`, so it needed no fixture change).
- ✅ 3.3 — measured: `presenter/localDateTime.ts` 100% (2/2), `presenter/presentLocationRows.ts` 100% (13/13).
- ✅ 4.1 — `controller/minuteBoundary.ts:9-16`, `controller/minuteBoundary.test.ts` (`it.each`: 17 500 / 60 000 / 1); `controller/tickScheduler.ts:5-14`, `controller/tickScheduler.test.ts:8-21` (real 0 ms timers, run and cancel); type export `controller/index.ts:2`; `test/tickSchedulers.ts` `createManualTickScheduler()`.
- ✅ 4.2 — `controller/useMinuteTick.ts:20-58`; `controller/useMinuteTick.test.tsx:34-101` covers first boundary, tick + 60 000, hidden cancel, visible tick + 40 000, mount while hidden, unmount cleanup, stable `onTick` ref.
- ✅ 4.3 — `controller/LocationsProvider.tsx:34,81,89,163-173` (prop, `minuteTick` state, `onTick` dispatches `SET_DEVICE_TIME_ZONE` via `store.dispatch` and increments); `controller/locationsContext.ts:27`; `controller/useLocations.ts:26,34,43` (memo key with the `biome-ignore` of D4); `test/renderLocations.tsx` fourth argument; `controller/useLocations.tick.test.tsx:48-115` (new minute, DST offset, badge move, no write, list change). A gap in this task's tests is R1.
- ✅ 4.4 — measured: `minuteBoundary.ts`, `tickScheduler.ts`, `useMinuteTick.ts`, `useLocations.ts` 100%; `LocationsProvider.tsx` 96.88% (see Mutation and R1).
- ✅ 5.1 — `views/shared/LocalDateTime.tsx:15-30` (`text-2xl font-bold leading-none tabular-nums md:text-4xl`, `<time dateTime>` with `text-sm text-muted-foreground`, `null` for `""`, no `aria-live`); `views/shared/LocalDateTime.test.tsx:15-42`.
- ✅ 5.2 — `views/shared/LocationRow.tsx:88-116` (wrapper `flex min-w-0 flex-1 items-start gap-3`, place column `min-w-0 flex-1 break-words md:w-64 md:flex-none`, `LocalDateTime` after it); new tests in `views/shared/LocationRow.test.tsx` (text order, `font-bold` vs `font-semibold`, row name, remove action without time).
- ✅ 5.3 — measured: `LocalDateTime.tsx` 100% (5/5), `LocationRow.tsx` 95.74% (both survivors in lines this branch did not touch).
- ✅ 6.1 — `steps/locations_utc_offset_unit.steps.tsx` exact text `${city}${offset}12:00Wed, Jul 15`; `steps/deviceTimeZoneWorld.tsx` passes `createManualTickScheduler()`.
- ✅ 6.2 — `steps/localTimeWorld.tsx:33-137` (in-memory repository, switchable clock, manual tick scheduler, `LocationList`, `resetPageVisibility()` in `reset`); `locations_local_time_unit.feature` with six scenarios and `steps/locations_local_time_unit.steps.tsx` (NFR-P1 timed with `performance.now()`, `:172-195`).
- ✅ 6.3 — `locations_clock_tick.feature` (7 scenarios, tags FR3/FR4/@M3) with `steps/locations_clock_tick.steps.tsx:55-168`.
- ✅ 7.1 — `steps/locations_local_time_e2e.steps.ts:43-102` (fixed time, time + ISO `datetime`, narrow and wide bounding-box steps, no live region).
- ✅ 7.2 — `locations_local_time_e2e.feature` holds the five scenarios and outlines named in the task, with the listed tags.
- ✅ 7.3 — `locations_ui_e2e.feature:111-114` (tags and `Given the current time is "2026-03-08T07:30:00Z"`); the 8 `Screenshot-of-the-list-state-*` baselines under `__screenshots__/chromium/` and `mobile-chrome/` are re-approved. The 375 px and 1024 px light baselines show Almaty `12:30` / Moscow `10:30` with `Sun, Mar 8`, in the narrow and wide layouts.
- ✅ 8.1 — the task's grep loop, run in this review, prints nothing.
- ✅ 8.2 — the `new Date|Date\.now|setInterval` grep over production code and the `minuteTick|localTimeLabel` grep over `src/adapters src/ports` print nothing (run in this review).
- ✅ 8.3 — this stage starts on green CI (unit, lint, build, BDD E2E). Not re-run here.

## Requirements

- ✅ FR1 — `model/localDateTime.ts:13`, `presenter/localDateTime.ts:13-18`, `constants/localDateTime.ts:2-6`; tests `presenter/localDateTime.test.ts`, `locations_local_time_unit.feature` "Time and date of each location".
- ✅ FR2 — `presenter/localDateTime.ts:24-28`, `presentLocationRows.ts:71-74`, `LocalDateTime.tsx:25-27` (`<time dateTime>`); tests `presentLocationRows.test.ts:172-194`, unit BDD "Russian interface" and "Zones on both sides of midnight".
- ⚠️ FR3 — `controller/useMinuteTick.ts:33-56`, `LocationsProvider.tsx:163-173`, `useLocations.ts:43`. Boundary alignment, the hidden pause and the visible catch-up are tested (`useMinuteTick.test.tsx`, `locations_clock_tick.feature`), but no test checks the rows after a second consecutive tick ("each later one at the following minute boundary"). See R1.
- ✅ FR4 — `LocationsProvider.tsx:167-170` re-reads `clock.timeZoneId()` at every tick and on visibility; `useLocations.ts` re-presents offsets; tests `useLocations.tick.test.tsx:58-95`, clock-tick BDD "Offset is computed again at the minute boundary", "Device zone is read again …".
- ✅ FR5 — `useLocations.ts:34-43` reads `clock.instant()` inside the memo keyed on the list and language; tests `useLocations.tick.test.tsx:97`, unit BDD "Time is computed again when the list changes".
- ✅ FR6 — `presentLocationRows.ts:68-74` gives `""`, `LocalDateTime.tsx:19` renders nothing; tests `presentLocationRows.test.ts:196-208`, `LocalDateTime.test.tsx:33`, unit BDD "Time that cannot be computed".
- ✅ NFR-P1 — `steps/locations_local_time_unit.steps.tsx:172-195` times `presentLocationRows` over 50 rows against 50 ms; rows are synchronous (no loading state).
- ✅ NFR-A1 — `locations_local_time_e2e.feature` outline "No accessibility violations with times in the <theme> theme" (light/dark).
- ✅ NFR-A2 — `LocalDateTime.tsx` has no `aria-live`; `LocalDateTime.test.tsx:38`, `LocationRow.test.tsx` row name; E2E "Time does not change the row name" with `steps/locations_local_time_e2e.steps.ts:93-102`.
- ✅ NFR-R1 — `LocationRow.tsx:88-89` (`min-w-0`, `break-words`), `LocalDateTime.tsx:21` (`shrink-0`); E2E outline "Times fit a <width> px wide screen" 320 / 2560.
- ✅ NFR-R2 — `LocationRow.tsx:89` (`md:w-64 md:flex-none`), `LocalDateTime.tsx:21` (`items-end md:items-start`); E2E bounding-box steps `locations_local_time_e2e.steps.ts:61-90`.
- ✅ NFR-R3 — `locations_ui_e2e.feature:111-114` pinned instant; 8 baselines re-approved and checked visually in this review.
- ✅ UX1 — `LocalDateTime.tsx:22` (`text-2xl md:text-4xl font-bold tabular-nums` vs city `font-semibold`); `LocalDateTime.test.tsx:15-23`, `LocationRow.test.tsx` "should show the time bolder than the semibold city".
- ✅ UX2 — `LocalDateTime.tsx:25` (`text-sm text-muted-foreground`, under the time in a column); `LocalDateTime.test.tsx:25`, E2E "date under the time" assertions.
- ✅ M1 — the task 8.1 grep loop over tests and features finds every FR/NFR/UX id with the change name.
- ✅ M2 — unit BDD "Time and date of each location" (4 of 4), "Zones on both sides of midnight" (2 of 2), "Russian interface" (1 of 1) assert exactly the listed values.
- ✅ M3 — clock-tick BDD: 17 500 then 60 000 ms; "no update is due" while hidden; New York `01:59` / `UTC−5` → `03:00` / `UTC−4`.
- ✅ M4 — measured in this review: every new or changed production file ≥ 95% (lowest `LocationRow.tsx` 95.74%, `LocationsProvider.tsx` 96.88%).
- ✅ M5 — E2E feature tags `@M5` on the axe and no-scroll outlines; layout scenarios run in both projects per `playwright.bdd.config.ts`.
- ✅ M6 — 8 of 8 "list" baselines changed in this branch (`__screenshots__/{chromium,mobile-chrome}/Screenshot-of-the-list-state-*`).
- ✅ Scenario: Time and date of each location — `locations_local_time_unit.feature:6`, steps `locations_local_time_unit.steps.tsx:57`.
- ✅ Scenario: Zones on both sides of midnight — `locations_local_time_unit.feature:20`, steps `:84`.
- ✅ Scenario: Russian interface — `locations_local_time_unit.feature:29`, steps `:105`.
- ✅ Scenario: Time is computed again when the list changes — `locations_local_time_unit.feature:37`, steps `:119`.
- ✅ Scenario: Time that cannot be computed — `locations_local_time_unit.feature:50`, steps `:141`.
- ✅ Scenario: The time changes at the minute boundary — `locations_clock_tick.feature:6`, steps `locations_clock_tick.steps.tsx:55`.
- ✅ Scenario: No updates while the page is hidden — `locations_clock_tick.feature:17`, steps `:70`.
- ✅ Scenario: The offset follows a DST change while the app is open — `locations_clock_tick.feature:28`, steps `:93`.
- ✅ Scenario: Updates write nothing — `locations_clock_tick.feature:37`, steps `:112`.
- ✅ Scenario: Narrow screen — E2E "Time beside the city on a narrow screen", `locations_local_time_e2e.feature:7`.
- ✅ Scenario: Wide screen — E2E "Time in its own column on a wide screen", `locations_local_time_e2e.feature:17`.
- ✅ Scenario: Times fit narrow and wide screens — E2E outline "Times fit a <width> px wide screen".
- ✅ Scenario: List screenshots show the time and the date — `locations_ui_e2e.feature:111-114` and the re-approved baselines.
- ✅ Scenario: 50 rows within the budget — `locations_local_time_unit.feature:58`, steps `:172`.
- ✅ Scenario: No accessibility violations with times — E2E outline, light / dark.
- ✅ Scenario: Time does not change the row name and is not announced — E2E "Time does not change the row name".
- ✅ Scenario: Whole-hour zone — `locations_utc_offset_unit.feature:6` (unchanged, still green).
- ✅ Scenario: Half-hour zone — `locations_utc_offset_unit.feature:13`.
- ✅ Scenario: 45-minute zone — `locations_utc_offset_unit.feature:20`.
- ✅ Scenario: Daylight saving time is respected — `locations_utc_offset_unit.feature:27` (outline).
- ✅ Scenario: Zero offset — `locations_utc_offset_unit.feature:39`, exact text updated in `locations_utc_offset_unit.steps.tsx`.
- ✅ Scenario: Offset is computed again when the list changes — `locations_utc_offset_unit.feature:46`.
- ✅ Scenario: Offset is computed again at the minute boundary — `locations_clock_tick.feature:45`, steps `locations_clock_tick.steps.tsx:127`.
- ✅ Scenario: Offset that cannot be computed — `locations_utc_offset_unit.feature:55`.
- ✅ Scenario: One row matches — `locations_device_time_zone_unit.feature:6`.
- ✅ Scenario: No row matches — `locations_device_time_zone_unit.feature:14`.
- ✅ Scenario: Several rows match — `locations_device_time_zone_unit.feature:21`.
- ✅ Scenario: Legacy device identifier — `locations_device_time_zone_unit.feature:30`.
- ✅ Scenario: Unknown device identifier — `locations_device_time_zone_unit.feature:38`.
- ✅ Scenario: Badge follows changes of the list — `locations_device_time_zone_unit.feature:46`.
- ✅ Scenario: Device zone is read once — `locations_device_time_zone_unit.feature:56`; its world now injects the manual tick scheduler (`steps/deviceTimeZoneWorld.tsx`).
- ✅ Scenario: Device zone is read again at the minute boundary — `locations_clock_tick.feature:54`, steps `:140`.
- ✅ Scenario: Device zone is read again when the page becomes visible — `locations_clock_tick.feature:64`, steps `:154`.
- ✅ Scenario: Device zone is not stored — `locations_device_time_zone_unit.feature:66`.

## Mutation

Measured in this review with `npx stryker run --mutate …` from `packages/client`, in three runs of at most five files:

| File | Score | Killed / total | Survivors |
|---|---|---|---|
| `src/model/localDateTime.ts` | 100% | 5/5 | — |
| `src/presenter/localDateTime.ts` | 100% | 2/2 | — |
| `src/presenter/presentLocationRows.ts` | 100% | 13/13 | — |
| `src/constants/localDateTime.ts` | 100% | 8/8 | — |
| `src/constants/clock.ts` | no mutants | 0/0 | — |
| `src/controller/minuteBoundary.ts` | 100% | 3/3 | — |
| `src/controller/tickScheduler.ts` | 100% | 3/3 | — |
| `src/controller/useMinuteTick.ts` | 100% | 19/19 | — |
| `src/controller/useLocations.ts` | 100% | 9/9 | — |
| `src/controller/LocationsProvider.tsx` | 96.88% | 62/64 | line 171 `setMinuteTick(() => undefined)`; line 171 `previousTick - 1` (equivalent: any change of the key re-presents) |
| `src/views/shared/LocalDateTime.tsx` | 100% | 5/5 | — |
| `src/views/shared/LocationRow.tsx` | 95.74% | 45/47 | lines 62 and 66: string literal and block statement in code this branch did not change (out of scope) |

Every file is above 95%. The `() => undefined` survivor at `LocationsProvider.tsx:171` shows an untested FR3 behaviour. It is reported as R1.

## Findings

### R1 — WARNING — No test catches rows that stop updating after the first minute tick
- Location: `packages/client/src/controller/LocationsProvider.tsx:171`
- Rule: `.claude/rules/tdd-workflow.md` ("Analyze survived mutants — each survivor indicates a missed scenario or a weak assertion")
- Problem: `onTick` re-presents the rows only because `setMinuteTick((previousTick) => previousTick + 1)` changes the `minuteTick` key of the rows memo in `useLocations.ts:43`. Stryker's mutant `setMinuteTick(() => undefined)` survives. Under it the first tick changes the key `0 → undefined`, but every later tick leaves the key `undefined`, so the memo returns the stale rows. Every test of the tick (`controller/useLocations.tick.test.tsx`, `locations_clock_tick.feature`, `useMinuteTick.test.tsx`) checks the rows after one tick only. "Updates write nothing" runs three ticks but asserts only that no write happened.
- Impact: FR3 requires the time to change "at the start of every minute" and the spec says "each later one at the following minute boundary". A regression that makes the counter non-incrementing (a constant, a boolean toggle that is reset, the mutant above) freezes every card after its first update while the page stays visible. The whole suite would stay green.
- Fix: add a test to `packages/client/src/controller/useLocations.tick.test.tsx`, using its existing `setup`, `moveClockTo` and `runTick`: open `["UTC"]` at `2026-07-15T12:00:42.500Z`, `moveClockTo("2026-07-15T12:01:00Z")`, `runTick()`, `moveClockTo("2026-07-15T12:02:00Z")`, `runTick()`, then expect `result.current.rows[0]?.localTimeLabel` to be `"12:02"`. Then re-run `npx stryker run --mutate 'src/controller/LocationsProvider.tsx'` and confirm the `() => undefined` mutant is killed.
- Fix risk: none — a test-only addition in a 115-line file, using helpers the file already has. Production code does not change, and the manual tick scheduler keeps it free of real timers, as design D6 requires.
- Status: open

### R2 — SUGGESTION — presentLocationRows.test.ts grows past the 200-line limit
- Location: `packages/client/src/presenter/presentLocationRows.test.ts:159`
- Rule: `CLAUDE.md` ("Files must stay under 200 lines for AI context quality"); `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity"); `tasks.md` preamble ("Keep every file under 200 lines")
- Problem: the branch adds the `describe("present the local time and date")` block (lines 159–209) to a 156-line file, which now has 209 lines. Every other file this branch created or grew stays at or under 200 lines.
- Impact: the file breaks the project's file-size invariant, and the change's own tasks repeat that invariant. Each further row field (hour format, differences) will push it toward the 300-line hard cap.
- Fix: move the `describe("present the local time and date")` block to a new `packages/client/src/presenter/presentLocationRows.localDateTime.test.ts`. That follows the existing `<module>.<aspect>.test` split (`controller/useLocations.tick.test.tsx`, `views/shared/LocationRow.dragging.test.tsx`). Give it its own copy of the 17-line `present` helper (lines 17–31) and the header `// Verifies FR1, FR2, FR6 of show-local-time-and-date-on-location-cards (D3).`, and remove that header line from the original file.
- Fix risk: low — test-only. It duplicates the small `present` helper, unless the helper moves to `packages/client/src/test/`, which touches the other describe blocks. Mutation coverage of `presentLocationRows.ts` is unchanged, because Vitest still runs both files.
- Status: open

## Verdict

Ready. There are no CRITICAL findings, and every requirement is implemented with traceability and tests. R1 (WARNING) should be fixed so FR3's "every minute" behaviour is guarded against regression. R2 is optional polish. Neither blocks.
