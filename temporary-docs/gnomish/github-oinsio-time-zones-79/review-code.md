# Review: fix-stale-now-button-checks-in-drag-tests

## Summary

| Item | Value |
|---|---|
| Tasks verified | 4/4 |
| Requirements traced | 6/6 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 — `packages/client/src/test/features/time_selection/steps/dragSteps.ts:27` now calls `world.isNowActive()`, which is defined at `steps/timeSelectionWorld.tsx:186` (`isNowActive: () => current().reference.dateBar.isPinned`). The JSDoc at `dragSteps.ts:24` reads "the Now button is active for the given instant". The first-line comment at `dragSteps.ts:1` names "FR1 of fix-stale-now-button-checks-in-drag-tests". `isNowShown` was not added to the world. I re-ran: `pnpm --filter @time-zones/client typecheck` exits 0, and `npx vitest run src/test/features/time_selection/steps/time_selection_drag_unit.steps.tsx` passes 60/60.
- ✅ 2.1 — `packages/client/src/test/features/time_selection/time_selection_drag_e2e.feature:45` reads `And the Now button is inactive`. Its tag line at `:35` keeps the existing tags and adds `@fix-stale-now-button-checks-in-drag-tests @FR2`. No step definition was added. The step binds to the existing `Then("the Now button is inactive", …)` at `steps/time_selection_pointer_e2e.steps.ts:141`, which asserts `toBeDisabled()`. I re-ran `npx bddgen -c playwright.bdd.config.ts`: it exits 0, and the generated `.features-gen/time_selection/time_selection_drag_e2e.feature.spec.js:67` calls `And('the Now button is inactive', …)`. I did not run the Playwright scenario in this stage. CI is green.
- ✅ 3.1 — `grep -rn "isNowShown\|the Now button is not shown" packages/client/src` finds 0 matches (re-run).
- ✅ 3.2 — I re-ran from the repository root: `pnpm lint` (biome: 0 errors; the 7 warnings are in files this branch does not touch, and `biome check` on `dragSteps.ts` is clean), `pnpm typecheck` (exit 0), the drag unit BDD (60/60) and `pnpm build` (exit 0).

## Requirements

- ✅ FR1 — `steps/dragSteps.ts:25-29` (`createThenPinned`) asserts `world.isNowActive()` is `true` and `world.shownInstant()` equals the timestamp. Traceability is at `dragSteps.ts:1`. The binding is in `steps/time_selection_drag_unit.steps.tsx:41` and is used by every "the moment is pinned to {string}" step in `time_selection_drag_unit.feature`. Typecheck exits 0, and the 60 tests pass.
- ✅ FR2 — In `time_selection_drag_e2e.feature:35-45`, the scenario "A vertical swipe without Pointer Events still scrolls" carries `@fix-stale-now-button-checks-in-drag-tests @FR2` and ends with `And the Now button is inactive`. That step is bound to the existing definition `time_selection_pointer_e2e.steps.ts:141` (`toBeDisabled`), which matches the stable spec wording "the moment is still live and the Now button is inactive". bddgen generates the scenario.
- ✅ M1 — `pnpm --filter @time-zones/client typecheck` exits 0 with no TS2339 (measured in this review).
- ✅ M2 — `npx bddgen -c playwright.bdd.config.ts` in `packages/client` exits 0 with no missing step (measured).
- ✅ M3 — `npx vitest run src/test/features/time_selection/steps/time_selection_drag_unit.steps.tsx`: 1 file, 60 tests passed, 0 failures (measured).
- ✅ M4 — `grep -rn "isNowShown\|the Now button is not shown" packages/client/src` finds 0 matches (measured).

## Mutation

Not measured. The branch changes no production file. It changes only `src/test/features/time_selection/steps/dragSteps.ts` (a step helper) and `src/test/features/time_selection/time_selection_drag_e2e.feature`. Stryker mutates production modules, so these files have nothing to mutate (design D3). No Stryker run was made.

## Findings

None.

The mechanical checks on the diff were clean: no `Date`, no raw offsets, no timers or listeners, no `as any`, `@ts-ignore` or `eslint-disable`, no `.only`/`.skip`, and no new constants or helpers. `dragSteps.ts` is 153 lines, and the feature file is 82 lines. The duplicate `@FR2` on the tag line at `time_selection_drag_e2e.feature:35` follows the repository's convention of listing several changes' ids on one tag line (for example `time_selection_e2e.feature:6`), and bddgen collapses it to one tag. The stale wording in `docs/glossary/date-selection.md` is excluded by NG3, and this branch did not change that file.

## Verdict

Ready. No blocking findings.
