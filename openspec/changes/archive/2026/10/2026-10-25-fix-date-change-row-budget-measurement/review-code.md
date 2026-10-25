# Review: fix-date-change-row-budget-measurement

## Summary

| Item | Value |
|---|---|
| Tasks verified | 9/9 |
| Requirements traced | 9/9 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 0 |

## Tasks

All paths are relative to `packages/client/src/test/features/date_selection/`.

- ✅ 1.1 — `date_selection_reference_moment_rows.feature:3` adds `Implements change fix-date-change-row-budget-measurement.`. Lines 6–11 hold the reworded scenario "50 rows within the budget" with the four steps from the spec delta and the tags `@select-date-with-calendar-and-now @NFR-P1 @fix-date-change-row-budget-measurement`.
- ✅ 1.2 — `steps/date_selection_reference_moment_rows.steps.tsx:42-60` has the comment `// @select-date-with-calendar-and-now @fix-date-change-row-budget-measurement @NFR-P1` and delegates to `steps/referenceMomentRowsWorld.ts:59-114`. Given (`prepare`, lines 77-89) builds 50 `buildLocation` entries from `firstZones()` into `{ ...INITIAL_LOCATIONS_STATE, locations, deviceTimeZoneId }` and does an untimed warm-up `presentRows` (D2). When (`measureDateChange`, lines 90-107) puts `reduceLocations(SHIFT_DATE, ONE_DAY, now)` + `presentLocationRows(…getEffectiveInstant…)` between two `performance.now()` reads (D1). Then checks `elapsedMs <= ROW_BUDGET_MS` (steps line 54), and `expectRowsCarryDateAt` (lines 108-113) checks all 50 `localIsoDate` values (D3). Imports come only from `@/constants`, `@/lib/temporal`, `@/model`, `@/presenter`. No production file imports from internals.
- ✅ 1.3 — The artifacts do not record the one-off red run. The code shows the check would fail: anything added between `startedAt` (`referenceMomentRowsWorld.ts:91`) and `elapsedMs = performance.now() - startedAt` (line 106) is counted in full, and the Then step asserts `toBeLessThanOrEqual(50)` (steps line 54). A 60 ms busy-wait there makes `elapsedMs >= 60`, so the step fails. The busy-wait is not left in the code.
- ✅ 2.1 — `date_selection_reference_moment_rows.feature:13-18`: scenario "The new date shows in the same render", tagged `@fix-date-change-row-budget-measurement @FR1 @UX1`, with the four specified steps.
- ✅ 2.2 — `steps/date_selection_reference_moment_rows.steps.tsx:62-81`: has the comment `// @fix-date-change-row-budget-measurement @FR1 @UX1`. It stores 50 locations via `world.setStoredLocations`, then `givenAppOpen`, then a single synchronous `act(() => world.getReference().showNextDay())`, then `expectRowsShowDateAt`. `referenceMomentRowsWorld.ts:36-53` does one `document.querySelectorAll("button[aria-label]")` mapped to `closest("li")` and looks each zone up by its exact `i18n.t("locations.removeLocation", { city: zone })`. For each row it asserts the row exists and its `<time datetime>` matches. There is no `await`, no `waitFor`, no `rowOf` and no `aria-*` assertion. File sizes: steps 149 lines, world 115 lines.
- ✅ 3.1 — I ran `npx vitest run src/test/features/date_selection/steps/date_selection_reference_moment_rows.steps.tsx` 6 times in a row, one after another, during this review. Every run passed 32/32.
- ✅ 3.2 — The traceability grep from the task prints nothing for FR1, NFR-P1 or UX1 (run during this review).
- ✅ 3.3 — `git diff --name-only 4bbe340 -- src/model src/presenter src/controller src/views` prints nothing (`4bbe340` is the branch's base commit; `origin/main` is not available in this checkout).
- ✅ 3.4 — The stage instructions state that CI (build + `pnpm test`) is green for this branch. The diff touches no production or config file that could affect the build.

## Requirements

- ✅ FR1 — `steps/date_selection_reference_moment_rows.steps.tsx:62-81` with `steps/referenceMomentRowsWorld.ts:36-53` (JSDoc `Implements FR1, UX1 of fix-date-change-row-budget-measurement`). After one synchronous `act`, all 50 rows show `datetime` = the zone's local date at `2026-03-09T07:30:00Z`. The check is untimed. It passed in this review's runs.
- ✅ NFR-P1 — `steps/referenceMomentRowsWorld.ts:55-114` (JSDoc `Implements NFR-P1 of fix-date-change-row-budget-measurement`) times the reducer and the presenter on 50 rows after a warm-up. Steps line 54 asserts ≤ 50 ms, and lines 108-113 check every row's `localIsoDate`.
- ✅ UX1 — Same test as FR1. A loading state such as the `ViewSkeleton` would replace the rows, so the exact-label lookup would find no row and the `toBeTruthy` assertion would fail (`referenceMomentRowsWorld.ts:47`).
- ✅ M1 — 6 sequential local runs during this review all passed (32/32). The stage instructions report the full CI job as green.
- ✅ M2 — The task-3.2 grep prints nothing. Matching lines: feature lines 6 and 13, steps lines 42 and 62.
- ✅ M3 — Shown by the code structure (see task 1.3): the timed block is a plain `performance.now()` difference with a 50 ms assertion, so a 60 ms delay inside it fails deterministically.
- ✅ M4 — There are no files under `src/model`, `src/presenter`, `src/controller` or `src/views` in the branch diff (see task 3.3).
- ✅ Scenario: 50 rows within the budget — feature lines 6-11. Step definitions are at steps lines 42-60, and the scenario passes.
- ✅ Scenario: The new date shows in the same render — feature lines 13-18. Step definitions are at steps lines 62-81, and the scenario passes.

## Mutation

Not measured: there was nothing to mutate. The branch changes no production file (M4: the diff only touches `src/test/features/date_selection/**` and OpenSpec files). `stryker.config` excludes `!src/test/**` from `mutate`, so the three changed files are not mutation targets.

## Findings

None.

## Verdict

Ready. There are no blocking findings. The change re-scopes the NFR-P1 timing to the model and presenter, as `locations_reorder_unit.steps.ts` already does. The same-render promise stays under test through the real page. All tasks and requirements are traced.
