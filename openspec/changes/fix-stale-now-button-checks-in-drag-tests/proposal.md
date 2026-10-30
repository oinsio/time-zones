# Fix stale Now button checks in the drag tests

Repairs two test files left behind when `keep-now-button-visible-when-live` (#77) and `fix-day-track-drag-continuity-and-smoothness` (#78) reached `main` together. Both changes are archived (`openspec/changes/archive/2026/10/`), so nothing blocks this one.

## Why

CI fails at `pnpm typecheck`:

```
src/test/features/time_selection/steps/dragSteps.ts(27,18): error TS2339:
Property 'isNowShown' does not exist on type '{ clock: () => SwitchableClock; ... }'.
```

#77 renamed the test-world query `isNowShown` to `isNowActive` in `packages/client/src/test/features/time_selection/steps/timeSelectionWorld.tsx`, because the Now button is now always shown and is only active or inactive. #78 was written against the old world. It added `createThenPinned` in `steps/dragSteps.ts`, which still calls `world.isNowShown()`. The two changes did not conflict in git, so the break showed up only after both landed.

#78 also left a second stale check from the same mismatch. The last step of the scenario "A vertical swipe without Pointer Events still scrolls" in `time_selection_drag_e2e.feature` is `And the Now button is not shown`. #77 replaced that step definition in `steps/time_selection_pointer_e2e.steps.ts` with "the Now button is active" and "the Now button is inactive". So `bddgen` (the first part of `test:bdd`, the CI job after `pnpm build`) cannot find a step for it. Also, the stable `time-selection` spec says the Now button is always shown. In that spec, a vertical swipe leaves "the moment is still live and the Now button is inactive" (`openspec/specs/time-selection/spec.md`, scenario "A vertical swipe on a track scrolls without selecting a time").

Audience: every contributor. `main` does not build in CI until this is fixed. Urgency: high.

## What Changes

- The drag unit BDD step "the moment is pinned to {string}" (`createThenPinned` in `steps/dragSteps.ts`) asks the world whether the Now button is active (`isNowActive`) instead of the removed `isNowShown`.
- The E2E scenario "A vertical swipe without Pointer Events still scrolls" in `time_selection_drag_e2e.feature` ends with the existing step `And the Now button is inactive` instead of `And the Now button is not shown`.
- No production code, spec requirement, stored data or user-visible behaviour changes. The change declares `skip_specs: true`, because both edits only bring tests in line with the stable `time-selection` and `date-selection` specs.
- Glossary: no new or changed terms. Used as they are: Now button, live, pinned, day track, time selection.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The tests are aligned with the requirements already in `openspec/specs/time-selection/spec.md` and `openspec/specs/date-selection/spec.md`.

## Goals

- G1: `main` passes the CI steps `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` again.
- G2: Every step of the drag E2E feature has a step definition, so `bddgen` generates the suite.

## Non-Goals

- NG1: Changing how the day track drags, scrolls or selects a time.
- NG2: Changing the Now button, the date bar or any spec requirement.
- NG3: Updating `docs/glossary/date-selection.md`, which still says the Now button "is shown only while the moment is pinned". That text belongs to the handoff patch H1 of the archived `keep-now-button-visible-when-live`, and the implement stage may not write under `docs/`.

## Users & Scenarios

- U1: A contributor opens a pull request on `main`. The CI `typecheck` step passes.
- U2: The CI E2E job runs `test:bdd`. `bddgen` finds every step of `time_selection_drag_e2e.feature`, and the vertical-swipe scenario checks that the Now button is inactive.

## Requirements

### Functional

- FR1: The drag unit BDD check "the moment is pinned to {string}" passes only when the Now button is active and the shown instant is the given timestamp. It uses the time-selection world query that exists today (`isNowActive`), and `pnpm typecheck` reports no error for it.
- FR2: The E2E scenario "A vertical swipe without Pointer Events still scrolls" ends by checking that the Now button is inactive (the moment is still live). This uses an existing step definition, as the stable `time-selection` spec requires.

### Non-Functional

None. No performance, accessibility or responsive behaviour changes.

## UX Acceptance Criteria

None. Nothing the user sees changes.

## Success Metrics

- M1: `pnpm --filter @time-zones/client typecheck` exits 0, with 0 `TS2339` errors (today: 1 error, printed twice).
- M2: `npx bddgen -c playwright.bdd.config.ts` exits 0 in `packages/client`, with 0 missing step definitions in `time_selection_drag_e2e.feature` (today: 1).
- M3: `npx vitest run src/test/features/time_selection/steps/time_selection_drag_unit.steps.tsx` passes all scenarios (0 failures).
- M4: `grep -rn "isNowShown\|the Now button is not shown" packages/client/src` finds 0 matches (today: 2).

## Behavior

- `packages/client/src/test/features/time_selection/time_selection_drag_unit.feature` (FR1, through its step file and `steps/dragSteps.ts`).
- `packages/client/src/test/features/time_selection/time_selection_drag_e2e.feature`, scenario "A vertical swipe without Pointer Events still scrolls", tagged `@fix-stale-now-button-checks-in-drag-tests @FR2` (FR2).

## Affected IA

No changes.

## Open Questions

None.
