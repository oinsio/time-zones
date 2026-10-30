# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter` or say "from the repository root". "design Dn" refers to `design.md`.

- **Running tests:** one command at a time, never in the background. Wait for each run to finish before starting the next.
- **No TDD cycle and no Stryker run:** only test code changes, and no production module changes (design D3).
- **Traceability:** every changed file carries `fix-stale-now-button-checks-in-drag-tests`: `Implements FR-X of fix-stale-now-button-checks-in-drag-tests` in step files, and `@fix-stale-now-button-checks-in-drag-tests @FR-X` tags above scenarios.
- **Glossary:** the Now button is "active" or "inactive", never "shown" or "not shown" (`openspec/specs/date-selection/spec.md`, "Return to now").

## 1. Drag unit BDD uses the current world query (FR1)

- [x] 1.1 In `test/features/time_selection/steps/dragSteps.ts`, make `createThenPinned` call `world.isNowActive()` instead of `world.isNowShown()` (design D1). Change its JSDoc to "the Now button is active for the given instant", and extend the file's first-line comment with `; FR1 of fix-stale-now-button-checks-in-drag-tests`. Do not add `isNowShown` to `timeSelectionWorld.tsx`. Verify, one at a time:
  - `pnpm --filter @time-zones/client typecheck` exits 0 (M1);
  - `npx vitest run src/test/features/time_selection/steps/time_selection_drag_unit.steps.tsx` passes every scenario (M3);
  - `grep -c "fix-stale-now-button-checks-in-drag-tests" src/test/features/time_selection/steps/dragSteps.ts` prints 1 or more.

## 2. Drag E2E swipe scenario checks an inactive Now (FR2)

- [x] 2.1 In `test/features/time_selection/time_selection_drag_e2e.feature`, scenario "A vertical swipe without Pointer Events still scrolls": replace `And the Now button is not shown` with `And the Now button is inactive`, and add `@fix-stale-now-button-checks-in-drag-tests @FR2` to the scenario's tag line, keeping its existing tags (design D2). Add no new step definition: the step is already defined in `steps/time_selection_pointer_e2e.steps.ts`. Verify, one at a time:
  - `npx bddgen -c playwright.bdd.config.ts` exits 0 and reports no missing step (M2);
  - `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "A vertical swipe without Pointer Events still scrolls"` passes. If Chromium is not installed, run `npx playwright install chromium` first;
  - `grep -B1 "Scenario: A vertical swipe without Pointer Events still scrolls" src/test/features/time_selection/time_selection_drag_e2e.feature | grep -c "@fix-stale-now-button-checks-in-drag-tests @FR2"` prints 1.

## 3. CI steps pass locally

- [x] 3.1 From the repository root, `grep -rn "isNowShown\|the Now button is not shown" packages/client/src` finds 0 matches (M4).
- [x] 3.2 Run the CI steps that this change affects, one at a time, from the repository root: `pnpm lint`, then `pnpm typecheck`, then `pnpm --filter @time-zones/client exec vitest run src/test/features/time_selection`, then `pnpm build`. Each exits 0 (G1).
