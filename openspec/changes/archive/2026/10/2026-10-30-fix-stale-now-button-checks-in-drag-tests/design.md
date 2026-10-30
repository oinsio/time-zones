# Design: fix stale Now button checks in the drag tests

## Context

Driven by FR1 and FR2 of the proposal. Two archived changes landed on `main` together. `keep-now-button-visible-when-live` renamed the test vocabulary for the Now button from shown or not shown to active or inactive. `fix-day-track-drag-continuity-and-smoothness` added new drag tests that still use the old vocabulary. Only test code under `packages/client/src/test/features/time_selection/` is affected. No production module, port, ADR or layer boundary is touched (`.claude/rules/architecture.md`).

Current code, checked in this round:

- `steps/timeSelectionWorld.tsx:186` defines `isNowActive: () => current().reference.dateBar.isPinned`. No `isNowShown` exists anywhere in `packages/client/src` except the call at `steps/dragSteps.ts:27`.
- `steps/time_selection_drag_unit.steps.tsx` imports `createThenPinned` from `./dragSteps` and binds it as `thenPinned`.
- `steps/time_selection_pointer_e2e.steps.ts` defines `Then("the Now button is active", …)` (`toBeEnabled`) and `Then("the Now button is inactive", …)` (`toBeDisabled`). No definition of "the Now button is not shown" remains.
- `time_selection_drag_e2e.feature:45` is `And the Now button is not shown`.

## Decision

### D1: Call the existing world query, do not bring back `isNowShown`

`createThenPinned` calls `world.isNowActive()` and expects `true`. Its JSDoc changes from "the Now button is shown" to "the Now button is active". This is the same query, with the same meaning (the date bar is pinned), that every other time-selection step already uses (`selectTimeSteps.ts`, `wallTimeStepHandlers.ts`, `time_selection_moment.steps.tsx`).
### D2: Reuse the step "the Now button is inactive" in the swipe scenario

The scenario's last step becomes `And the Now button is inactive`. It reuses the definition in `time_selection_pointer_e2e.steps.ts`, so no new step text or step definition is needed. The check keeps its intent: the swipe selected no time, so the moment is still live. That matches the stable spec scenario "A vertical swipe on a track scrolls without selecting a time": "the moment is still live and the Now button is inactive". The scenario gets the tags `@fix-stale-now-button-checks-in-drag-tests @FR2` next to its existing tags (`.claude/rules/traceability.md`: "Gherkin Scenario | tags `@<change-name> @FR-X` above scenario").

### D3: No spec delta and no mutation run

Both edits change tests, not behaviour, so the change sets `skip_specs: true`. Stryker mutates production modules. Nothing in production changes, so there are no mutants to kill. The proof is the typecheck, the generated BDD suite, and the drag unit and E2E runs listed in `tasks.md`.

## Consequences

Positive:
- `pnpm typecheck` passes again, and the drag tests use the same Now-button words as the rest of the suite and the stable specs.
- No new step definition or world query is added. Each concept keeps one owner.

Negative:
- The E2E run needs a Chromium installed for Playwright. If the implement sandbox cannot launch it, `bddgen` (no browser needed) still proves FR2's step binding. The CI E2E job runs the scenario after delivery.

## Alternatives Considered

**Add `isNowShown` back to the time-selection world as an alias of `isNowActive`**: this would fix the typecheck without touching `dragSteps.ts`. Rejected, because it gives one concept a second name, and `.claude/rules/glossary.md` says "A name that carries a glossary concept under a different word is a bug, even if the code works". It would also bring back the "shown" wording that #77 removed.

**Restore a "the Now button is not shown" E2E step**: rejected. The Now button is always shown now, so that step could never pass.

**Delete the last step of the swipe scenario**: rejected. The scenario would no longer check that the swipe selected no time, which the stable spec scenario asserts.
