# Review: reorder-locations-by-drag-and-drop

## Summary

| Item | Value |
|---|---|
| Tasks verified | 24/24 |
| Requirements traced | 55/56 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 2 |

## Tasks

All paths below are under `packages/client/` unless stated.

- ✅ 1.1 — `package.json:23-25` adds `@dnd-kit/core` `^6.3.1`, `@dnd-kit/sortable` `^10.0.0`, `@dnd-kit/utilities` `^3.2.2` to `dependencies`; `pnpm-lock.yaml` updated.
- ✅ 1.2 — `src/constants/reorder.ts:2-12` holds the 5 constants with the planned values; re-exported at `src/constants/index.ts:7-13`.
- ✅ 1.3 — the 7 keys are in `src/locales/en.json:33-39` and `src/locales/ru.json:33-39` with the texts of design D6.
- ✅ 2.1 — `src/model/moveLocation.ts:12-40` (`moveLocationInList(state, id, targetIndex)`); `src/model/moveLocation.test.ts` covers the 4 moves, same-object return (`:35` `toBe(state)`), `-1, 4, 1.5` (`:38`) and the unknown id (`:53`).
- ✅ 2.2 — `src/model/locations.ts:25` `MOVE_LOCATION`, `:32` `LOCATION_POSITION_OUT_OF_RANGE`, `:105-106` delegation; `src/model/locations.test.ts:142-166` (`reduceLocations MOVE_LOCATION`); exported from `src/model/index.ts:14`.
- ✅ 2.3 — re-measured in this review: `moveLocation.ts` 100%, `locations.ts` 100% (see Mutation).
- ✅ 3.1 — `src/controller/LocationsProvider.tsx:89-91` writes only when the snapshot changed, `:105-110` `moveLocation`, `:147`; `src/controller/locationsContext.ts:30-31`; `src/controller/useLocations.reorder.test.tsx:24-93` (reorder + one save, own index saves nothing, range and not-found errors, `SaveOutcome.FAILED` flags `hasSaveFailed`); `src/controller/useLocations.test.tsx:29` adds `"moveLocation"`.
- ✅ 3.2 — `src/controller/usePrefersReducedMotion.ts:23-25` (`useSyncExternalStore`, `false` without `matchMedia`); `src/controller/usePrefersReducedMotion.test.ts:34-79` covers match, change event, listener removal and missing `matchMedia`; exported at `src/controller/index.ts:7`.
- ✅ 3.3 — re-measured: `LocationsProvider.tsx` 100%, `usePrefersReducedMotion.ts` 100%.
- ✅ 4.1 — `src/views/shared/reorderTarget.ts`, `reorderTransition.ts`, `reorderModifiers.ts` with their `*.test.ts` files (all 100% mutation score).
- ✅ 4.2 — `src/views/shared/useReorderAnnouncements.ts:16-56`; `useReorderAnnouncements.test.tsx` covers English and Russian (`:118`) and `screenReaderInstructions.draggable` (`:112`, `:123`).
- ✅ 4.3 — `src/views/shared/DragHandle.tsx:21-36`; `DragHandle.test.tsx:34` ("Move Moscow"), `:51` (`aria-roledescription`), `:64` (`min-h-11 min-w-11 touch-none`).
- ✅ 4.4 — `src/views/shared/LocationList.tsx:40-102` (`DndContext`, `SortableContext`, sensors, `restrictToVerticalAxis`, announcements, `usePrefersReducedMotion`); `LocationRow.tsx:31-67` (`useSortable`, handle first); `LocationList.test.tsx:108-123` (handles with 2 rows, `/^Move /` null with 1 row); `LocationRow.test.tsx:76` (no handle when `isReorderable` is `false`); `locations_utc_offset_unit.steps.tsx:54` passes `onMove`. Extra `LocationList.drop.test.tsx` covers what a drop emits.
- ✅ 4.5 — `src/views/cards/CardsView.tsx:55-59` passes `moveLocation` as `onMove`; `CardsView.test.tsx:136-139` asserts both handles.
- ✅ 4.6 — re-measured: `reorderTarget.ts`, `reorderTransition.ts`, `reorderModifiers.ts`, `DragHandle.tsx`, `LocationList.tsx` 100%; `useReorderAnnouncements.ts` 97.44%; `LocationRow.tsx` 94.87% (above the 90% minimum, below the 95% target).
- ✅ 5.1 — `src/test/features/locations/locations_reorder_unit.feature` holds the 9 planned scenarios with tags; `steps/locations_reorder_unit.steps.ts:40-269` with `steps/locationsReorderUnitWorld.ts`. The "Location already gone" scenario omits the spec's "list is unchanged" step (R2).
- ✅ 5.2 — existing locations feature files are unchanged apart from `locations_utc_offset_unit.steps.tsx:54`; CI is green on this branch.
- ✅ 6.1 — `locations_reorder_e2e.feature` (all planned scenarios and outlines, tagged, no `@view-contract`); steps split into `steps/locations_reorder_drag_e2e.steps.ts`, `locations_reorder_checks_e2e.steps.ts`, `locations_reorder_motion_e2e.steps.ts` and `steps/locationsReorderE2eHelpers.ts` (exact handle locator `:38-39`, write counter `:66-79`, `transitionrun` recorder `:85-108`, CDP touch `:146-176`).
- ✅ 6.2 — the 8 `Screenshot-of-the-list-state-…` baselines under `src/test/features/__screenshots__/{chromium,mobile-chrome}/` were re-approved on this branch.
- ✅ 6.3 — `locations_ui_e2e.feature` and the other add-locations features are unchanged; CI is green.
- ✅ 7.1 — `grep -rln "@dnd-kit" src/app src/main.tsx` prints nothing; `@dnd-kit` is imported only from `src/views/shared/`, reached through the lazy `import("./cards/CardsView")` in `src/views/index.ts`; `check:bundle-size` runs in `.github/workflows/ci.yml:48`.
- ✅ 7.2 — `src/constants/locations.ts:2` `LOCATIONS_SCHEMA_VERSION = 1`; no adapter file changed.
- ✅ 7.3 — the task's traceability loop, run in this review, prints nothing.
- ✅ 7.4 — CI (unit, lint, build) is green on this branch.

## Requirements

- ✅ FR1 — `LocationList.tsx:95` (`rows.length >= MIN_LOCATIONS_TO_REORDER`), `LocationRow.tsx:67-74`; tests `LocationList.test.tsx:108-123`, `CardsView.test.tsx:136-139`, E2E "Drag a card to the top with the mouse", "Drag a card down by touch", "A single location has no handle".
- ✅ FR2 — `model/moveLocation.ts:12-40`, `model/locations.ts:105-106`; `moveLocation.test.ts`, unit BDD "Move to every kind of position", "Position outside the list", "Location already gone".
- ✅ FR3 — `reorderTarget.ts:6-14`, `LocationList.tsx:76-83`, `LocationsProvider.tsx:89-91`; `LocationList.drop.test.tsx`, `useLocations.reorder.test.tsx:41`, unit BDD "Move to its own position", E2E "Cancel a drag".
- ✅ FR4 — existing save path via `dispatchAndSchedule`; unit BDD and E2E "Order survives a reload", E2E "Order survives an offline reopen".
- ✅ FR5 — existing broadcast + `REPLACE_LOCATIONS`; unit BDD and E2E "Moved in another tab".
- ✅ FR6 — `useLocations.reorder.test.tsx:83-93`; unit BDD and E2E "Storage cannot be written" (E2E asserts the visible warning).
- ✅ FR7 — `KeyboardSensor` + `sortableKeyboardCoordinates` at `LocationList.tsx:53-55`; E2E "Move a card down with the keyboard", "Cancel a keyboard move".
- ✅ FR8 — keys in both locales, `DragHandle.tsx:29-30`, `useReorderAnnouncements.ts`; `useReorderAnnouncements.test.tsx:118-127`, `DragHandle.test.tsx`, unit BDD "Russian interface".
- ✅ NFR-P1 — unit BDD "50 locations within the budget" (`locations_reorder_unit.steps.ts:233-268`, `performance.now()`, ≤ 50 ms).
- ✅ NFR-P2 — `@dnd-kit` only in lazy `views/shared` code; CI `check:bundle-size` (`ci.yml:48`).
- ✅ NFR-A1 — E2E outlines "No accessibility violations at rest/while a card is picked up in the <theme> theme".
- ✅ NFR-A2 — E2E "Move a card down with the keyboard" and "Cancel a keyboard move" assert focus on "Move Moscow".
- ✅ NFR-A3 — `useReorderAnnouncements.ts`; unit test plus E2E "Pick-up and move are announced" and the keyboard drop/cancel scenarios.
- ✅ NFR-A4 — `usePrefersReducedMotion.ts`, `reorderTransition.ts:13-22`, `useDropSettleAnimation.ts:50`; E2E "Reduced motion", "Reduced motion has no drop animation".
- ✅ NFR-A5 — `DragHandle.tsx:29,31` (name with city, `min-h-11 min-w-11`); E2E "Handle names the city and is large enough".
- ✅ NFR-R1 — `reorderModifiers.ts:7-10`; E2E outline "Reorder fits a <width> px wide screen" (320 / 2560).
- ✅ NFR-R2 — `DragHandle.tsx:31` `touch-none`; E2E mouse drag (chromium) and finger drag (375 px).
- ✅ NFR-R3 — re-approved list baselines (8 PNGs) and E2E outline "The list state shows handles at <width> px in the <theme> theme".
- ✅ UX1 — `reorderTransition.ts`, `useDropSettleAnimation.ts:29-81`, `LocationRow.tsx:60-64`; E2E "Displaced card slides", "Dropped card settles into its slot".
- ✅ UX2 — `restrictToVerticalAxis`, `LocationRow.tsx:53` (`relative z-10 shadow-lg`); E2E "The dragged card keeps its width and its slot".
- ✅ UX3 — handle-only listeners (`DragHandle.tsx:27-28`), activation distance (`LocationList.tsx:49-51`); E2E "A click on the handle is not a drag", "Scrolling over a card scrolls the page".
- ✅ M1 — the traceability loop of task 7.3 prints nothing; NFR-P2 via CI `check:bundle-size`.
- ✅ M2 — `moveLocation.test.ts` (4 moves, same position, `-1`/`4` out of range, unknown id) and the unit BDD outlines with positions 4, 1, 3, 2, 0, 5.
- ✅ M3 — measured in this review: model and controller files 100%, view files 94.87–100% (all at or above the 90% minimum; only `LocationRow.tsx` is below the 95% target).
- ✅ M4 — the two E2E axe-core outlines × light/dark = 4 checks.
- ✅ M5 — unit BDD "Move to its own position" (0 writes), E2E "Cancel a drag" (0 writes), E2E reload and offline reopen run in both projects.
- ✅ M6 — E2E "Displaced card slides", "Dropped card settles into its slot", "Reduced motion", "Reduced motion has no drop animation".
- ✅ M7 — CI `check:bundle-size` passes.
- ✅ Scenario: Move to every kind of position — unit BDD outline `locations_reorder_unit.feature:6`.
- ✅ Scenario: Move to its own position — unit BDD `:19` (list unchanged, 0 writes).
- ✅ Scenario: Position outside the list — unit BDD outline `:27` (rejected, list unchanged).
- ⚠️ Scenario: Location already gone — unit BDD `:39` checks the not-found error but not the spec's "AND the list is unchanged" (R2).
- ✅ Scenario: Drag a card to the top with the mouse — E2E `locations_reorder_e2e.feature:7`.
- ✅ Scenario: Drag a card down by touch — E2E `:14`.
- ✅ Scenario: Cancel a drag — E2E `:22`.
- ✅ Scenario: Scrolling over a card scrolls the page — E2E `:48`.
- ✅ Scenario: A single location has no handle — E2E `:31`; `LocationList.test.tsx:123`.
- ✅ Scenario: Move a card down with the keyboard — E2E `:68`.
- ✅ Scenario: Cancel a keyboard move — E2E `:88`.
- ✅ Scenario: Handle names the city — E2E `:60` (exact locators for "Move Moscow" and "Move Almaty").
- ✅ Scenario: Displaced card slides — E2E `:99`.
- ✅ Scenario: Dropped card settles into its slot — E2E `:118`.
- ✅ Scenario: The dragged card keeps its width and its slot — E2E `:137`.
- ✅ Scenario: Reduced motion — E2E `:107`.
- ✅ Scenario: Reduced motion has no drop animation — E2E `:127`.
- ✅ Scenario: Order survives a reload — E2E `:145`, unit BDD `:46`.
- ✅ Scenario: Order survives an offline reopen — E2E `:155`.
- ✅ Scenario: Moved in another tab — E2E `:165`, unit BDD `:53`.
- ✅ Scenario: Storage cannot be written — E2E `:174`, unit BDD `:59`.
- ✅ Scenario: No accessibility violations — E2E outlines `:185`, `:197`.
- ✅ Scenario: Handle target size — E2E `:60` ("every move handle is at least 44 by 44 px").
- ✅ Scenario: Narrow and wide screens — E2E outline `:210`.
- ✅ Scenario: 50 locations within the budget — unit BDD `:73`.
- ✅ Scenario: Reorder stays out of the initial bundle — CI `check:bundle-size`; no `@dnd-kit` import in `src/app` or `src/main.tsx`.
- ✅ Scenario: List screenshots show the handles — E2E outline `:224` plus the re-approved baselines.
- ✅ Scenario: Russian interface — unit BDD `:67`.

## Mutation

Measured in this review with `npx stryker run --mutate '<files>'` from `packages/client/`, three runs of at most five files:

| File | Score | Survivors |
|---|---|---|
| `src/model/moveLocation.ts` | 100.00% | 0 |
| `src/model/locations.ts` | 100.00% | 0 |
| `src/controller/LocationsProvider.tsx` | 100.00% | 0 |
| `src/controller/usePrefersReducedMotion.ts` | 100.00% | 0 |
| `src/views/cards/CardsView.tsx` | 100.00% | 0 |
| `src/views/shared/LocationList.tsx` | 100.00% | 0 |
| `src/views/shared/DragHandle.tsx` | 100.00% | 0 |
| `src/views/shared/useDropSettleAnimation.ts` | 98.04% | 1 (optional chaining at `:61`) |
| `src/views/shared/useReorderAnnouncements.ts` | 97.44% | 1 (optional chaining `over?.id` at `:41`) |
| `src/views/shared/LocationRow.tsx` | 94.87% | 2 (pre-existing `""` literal at `:52`; ref callback emptied at `:56`, not observable in jsdom) |
| `src/views/shared/reorderTarget.ts` | 100.00% | 0 |
| `src/views/shared/reorderTransition.ts` | 100.00% | 0 |
| `src/views/shared/reorderModifiers.ts` | 100.00% | 0 |
| `src/constants/reorder.ts` | 0.00% | 2 (both string literals, R1) |

Every file is at or above the 90% minimum except `src/constants/reorder.ts` (R1).

## Findings

### R1 — WARNING — Reorder string constants are not pinned by any unit test
- Location: `packages/client/src/constants/reorder.ts:12`
- Rule: `CLAUDE.md` "Mutation testing … minimum acceptable >=90%"; `.claude/rules/tdd-workflow.md` Step 5
- Problem: `constants/reorder.ts` scores 0% (2 of 2 mutants survive): replacing `REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)"` (`:12`) or `REORDER_TRANSITION_EASING = "ease"` (`:4`) with `""` fails no unit test. `usePrefersReducedMotion.test.ts:37` asserts `toHaveBeenCalledWith(REDUCED_MOTION_MEDIA_QUERY)` and `reorderTransition.test.ts:10-13` asserts `easing: REORDER_TRANSITION_EASING`, so both compare the constant with itself.
- Impact: a typo in the media query (e.g. `prefers-reduce-motion`) makes `matchMedia` never match, so users who asked to reduce motion get the slide and drop animations again (NFR-A4 broken), and the unit suite and mutation gate stay green; only the slower E2E run would notice. The file is below the 90% project minimum.
- Fix: in `src/controller/usePrefersReducedMotion.test.ts` assert `matchMedia` was called with the literal `"(prefers-reduced-motion: reduce)"`, and in `src/views/shared/reorderTransition.test.ts` assert `{ duration: 200, easing: "ease" }` with literals (the values design D6 and task 4.1 fix). Re-run `npx stryker run --mutate 'src/constants/reorder.ts'`.
- Fix risk: the tests repeat two spec values as literals; `.claude/rules/code-style.md` allows literals in tests. No production code changes.
- Status: fixed
- Resolution: pinned the literals "(prefers-reduced-motion: reduce)", 200 and "ease" in usePrefersReducedMotion.test.ts and reorderTransition.test.ts; Stryker on constants/reorder.ts now 100% (was 0%).

### R2 — SUGGESTION — "Location already gone" does not check that the list is unchanged
- Location: `packages/client/src/test/features/locations/locations_reorder_unit.feature:39`
- Rule: `.claude/rules/test-planning.md` (every spec scenario fully covered by an automated test)
- Problem: the delta spec scenario "Location already gone" (`specs/locations/spec.md:24-28`) ends with "AND the list is unchanged", but the unit scenario stops at `Then the move is rejected as location not found`; its step definitions (`steps/locations_reorder_unit.steps.ts:131-150`) never read the list after the rejected move.
- Impact: a regression where a not-found move still changes or empties the first tab's list (e.g. the reducer returning a new state alongside the error) would pass this scenario; the spec line has no executable check.
- Fix: add `And the list is "Almaty"` to the scenario in `locations_reorder_unit.feature` and an `And("the list is {string}", (_ctx, labels: string) => expectList(labels))` handler in the `f.Scenario("Location already gone", …)` block (the same helper the other scenarios use; `app` is the first tab).
- Fix risk: none — the first tab already receives the second tab's removal through the in-memory channel before the move (the scenario's not-found assertion depends on it).
- Status: fixed
- Resolution: added "And the list is \"Almaty\"" to the Location already gone scenario and its step handler; the BDD unit suite passes.

### R3 — SUGGESTION — design.md D5 describes a drop animation the code does not use
- Location: `packages/client/src/views/shared/useDropSettleAnimation.ts:29`
- Rule: `.claude/rules/design-decisions.md` (design.md records the decision actually made)
- Problem: design D5 (`design.md:54`) says the drop animation "is `useSortable`'s default `animateLayoutChanges`". The code instead adds an 81-line hook, `useDropSettleAnimation`, called at `LocationRow.tsx:45`, that measures the card's top on release, starts it at `translate3d(0, offset, 0)` and transitions it to 0, overriding dnd-kit's `transform`/`transition` (`LocationRow.tsx:60-64`). Neither design.md nor tasks.md mention this hook.
- Impact: design.md is archived as the record of this change; a later change that touches the sortable list will trust D5, may remove the hook as unexplained, and lose UX1's drop animation, which only the E2E "Dropped card settles into its slot" would catch.
- Fix: update the D5 bullet in `openspec/changes/reorder-locations-by-drag-and-drop/design.md` to describe `useDropSettleAnimation` (why the default did not settle a card dragged without an overlay, what it measures, that it adds nothing under reduced motion and resets when a new sort starts) and add the file to the D7 test list.
- Fix risk: none — documentation only; no code or test changes.
- Status: rejected (out-of-scope)
- Resolution: fix-code may edit only packages/client/ and this file; design.md is an upstream planning artifact and stays untouched. The hook is documented in its own JSDoc; the doc update belongs in a new change.

## Verdict

Ready. No CRITICAL findings; every task and requirement has evidence. None of the findings blocks. R1 (WARNING) should be fixed so that the unit suite catches a broken reduced-motion query; R2 and R3 are low-stakes follow-ups.
