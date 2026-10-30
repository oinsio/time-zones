# Specs review: fix-stale-now-button-checks-in-drag-tests

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 11/11 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 0 |

## Freshness

- ✅ `packages/client/src/test/features/time_selection/steps/dragSteps.ts:27` calls `world.isNowShown()` inside `createThenPinned` (lines 24–29). Its JSDoc on line 24 reads "the Now button is shown for the given instant" (proposal.md:10–14, design.md:9).
- ✅ `steps/timeSelectionWorld.tsx:186` defines `isNowActive: () => current().reference.dateBar.isPinned`. Commit `e0d1df9` (#77) renamed it from `isNowShown`, which had the same body (proposal.md:14, design.md:9).
- ✅ `isNowShown` appears nowhere in `packages/client/src` except `dragSteps.ts:27` (design.md:9). `grep -rn "isNowShown\|the Now button is not shown" packages/client/src` gives exactly 2 matches today, `dragSteps.ts:27` and `time_selection_drag_e2e.feature:45` (M4 "today: 2").
- ✅ `steps/time_selection_drag_unit.steps.tsx:11,41` imports `createThenPinned` and binds it as `thenPinned`. No other file imports `dragSteps` (design.md:10).
- ✅ `steps/time_selection_pointer_e2e.steps.ts:135-143` defines "the Now button is active" (`toBeEnabled`) and "the Now button is inactive" (`toBeDisabled`). No definition of "the Now button is not shown" remains. `git log -S` shows #77 (`e0d1df9`) removed it (proposal.md:16, design.md:11).
- ✅ `time_selection_drag_e2e.feature:45` is `And the Now button is not shown`, in scenario "A vertical swipe without Pointer Events still scrolls" (lines 35–45). That scenario's tag line is `@fix-day-track-drag-continuity-and-smoothness @FR2 @FR4 @FR5` (design.md:12).
- ✅ `selectTimeSteps.ts:25`, `wallTimeStepHandlers.ts:23,29,30` and `time_selection_moment.steps.tsx:30,50,53` already use `world.isNowActive()` (design.md:18).
- ✅ The pointer E2E steps and the drag E2E steps share the `locationsWorld` fixture (`time_selection_drag_e2e.steps.ts:82`, `time_selection_pointer_e2e.steps.ts:135`). `playwright.bdd.config.ts` loads both through `steps: "src/test/features/**/steps/*_e2e.{steps,fixtures}.ts"`, so the reused step binds (design.md D2).
- ✅ The stable spec `openspec/specs/time-selection/spec.md:505-510`, scenario "A vertical swipe on a track scrolls without selecting a time", ends with "the moment is still live and the Now button is inactive". Its scenario at :197-203 ("A vertical swipe without Pointer Events still scrolls") ends with "the moment is still live" (proposal.md:16, design.md:21).
- ✅ `openspec/specs/date-selection/spec.md:180` says the Now button is shown in both modes, active while pinned and inactive while live (proposal.md:24,35).
- ✅ Both #77 and #78 are archived: `openspec/changes/archive/2026/10/2026-10-30-keep-now-button-visible-when-live` and `.../2026-10-30-fix-day-track-drag-continuity-and-smoothness` (proposal.md:3).
- ✅ CI (`.github/workflows/ci.yml:38-58`) runs `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, then `test:bdd` in the same job. `test:bdd` is `bddgen -c playwright.bdd.config.ts && playwright test …` (`packages/client/package.json:19`) (proposal.md:16, G1).
- ✅ `docs/glossary/date-selection.md:8` still says the Now button "is shown only while the moment is pinned" (NG3).
- ✅ `packages/client/vitest.config.ts:13` includes `src/**/*.{test,steps}.{ts,tsx}`, so the M3 command `npx vitest run src/test/features/time_selection/steps/time_selection_drag_unit.steps.tsx` reaches the drag unit BDD.
- ✅ `skip_specs: true` is a supported flag (`.gnomish/stages/archive/instructions.md:18`, `.gnomish/stages/specify/instructions.md:187`). Nothing in the change is already implemented: `dragSteps.ts:27` and the feature at line 45 still have the stale text.

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ proposal.md:57 | ✅ no delta (`skip_specs: true`); the unit scenarios in `time_selection_drag_unit.feature` that use "the moment is pinned to {string}" are the scenarios | ✅ 1.1 (typecheck, drag unit vitest, grep) |
| FR2 | ✅ proposal.md:58 | ✅ no delta; the E2E scenario "A vertical swipe without Pointer Events still scrolls", tagged `@FR2`, matches stable time-selection spec :505-510 | ✅ 2.1 (bddgen, playwright run, tag grep) |
| G1 | ✅ proposal.md:39 | n/a — met by FR1, FR2, M1, M3 | ✅ 3.2 runs lint, typecheck, the time_selection vitest suite and build. That suite is a scoped stand-in for `pnpm test`, and the only importer of `dragSteps.ts` lies inside it |
| G2 | ✅ proposal.md:40 | n/a — met by FR2, M2 | ✅ 2.1 (bddgen) |
| NG1 | ✅ proposal.md:44 | n/a | n/a — no artifact touches drag, scroll or selection behaviour |
| NG2 | ✅ proposal.md:45 | n/a | n/a — no artifact touches production code or a spec requirement |
| NG3 | ✅ proposal.md:46 | n/a | n/a — no task writes under `docs/` |
| M1 | ✅ proposal.md:70 | n/a | ✅ 1.1, 3.2 |
| M2 | ✅ proposal.md:71 | n/a | ✅ 2.1 |
| M3 | ✅ proposal.md:72 | n/a | ✅ 1.1 |
| M4 | ✅ proposal.md:73 | n/a | ✅ 3.1 |

## Consistency

None.

## Findings

None.

## Verdict

Ready to implement. There are no blocking ids.

The proposal has every required section. Non-Functional, UX and Open Questions are each stated as "None" with a reason. Behavior and Affected IA are present. No UI States Matrix is needed, because nothing the user sees changes. Every checkbox task stays inside `packages/` and names an automated command. No task depends on a handoff item, and there is no human follow-up. Design D1–D3 link to FR1 and FR2. The fix reuses the existing owners (`isNowActive`, the "the Now button is inactive" step) instead of adding a second name. That follows `.claude/rules/glossary.md` and the stable `date-selection` "Return to now" requirement. No ADR, layer boundary, stored offset or date math is involved.
