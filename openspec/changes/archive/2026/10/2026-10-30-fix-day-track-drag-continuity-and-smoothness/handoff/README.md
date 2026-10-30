# Handoff: fix-day-track-drag-continuity-and-smoothness

The implement stage writes only under `packages/` and this folder. These items need a human.

## H1: Glossary entries for the dragged handle

Apply `H1-glossary-track-end.patch` of the archived change `fix-day-track-handle-overlap-and-end-of-day` first; the command below does it when it is not applied yet.

- **Apply:** { git apply --check --reverse openspec/changes/archive/2026/10/2026-10-30-fix-day-track-handle-overlap-and-end-of-day/handoff/H1-glossary-track-end.patch 2>/dev/null || git apply openspec/changes/archive/2026/10/2026-10-30-fix-day-track-handle-overlap-and-end-of-day/handoff/H1-glossary-track-end.patch; } && git apply -C0 openspec/changes/fix-day-track-drag-continuity-and-smoothness/handoff/H1-glossary-handle-drag.patch
- **Patch:** `H1-glossary-handle-drag.patch` (same folder as this README)
- **Changes:** **Day track** and **Handle** in `docs/glossary/time-selection.md`: a dragged handle follows the pointer and settles at the reference moment when released.
- **Serves:** FR3, UX2.
- **Why manual:** the glossary lives in `docs/`, which the implement stage does not edit.
- **Automated part:** `git apply --check` of the patch on the committed file, and the scratch check of task 6.2: apply the track-end patch, then `git apply -C0` of this patch (both in order; `-C0` ignores the context lines that the track-end patch changes), on a clean copy of `docs`.
- **Verify:** `grep -q "except a handle that is being dragged" docs/glossary/time-selection.md`.

## H2: Drag on real iOS devices

No patch. Device checklist, on an iPhone with iOS 12.5 and on one with iOS 13 or later:

- [ ] Drag the Almaty handle with a finger, let the finger drift 2 cm down over the next card, and lift. The handle follows to the lift and the page does not scroll.
- [ ] A vertical swipe that starts on a track scrolls the page.
- [ ] A tap selects the tapped time.

- **Serves:** FR1, FR2, FR4, UX1, UX3.
- **Verify:** the checklist.
- **Why manual:** the sandbox and CI have no iOS Safari engine. Playwright's WebKit is a current desktop build, and the iOS 12 E2E runs in Chromium with Pointer Events emulated away.
- **Automated part:** the E2E scenarios of `time_selection_drag_e2e.feature` run the same gestures in Chromium, with and without Pointer Events, and the Vitest files `DayTrack.drag.test.tsx` and `DayTrack.touchFallback.test.tsx` cover both input paths.
- **Fallback:** if a step fails on iOS 12.5 (the page scrolls during a finger drag, or a vertical swipe on a track no longer scrolls), remove the `useDayTrackTouchFallback` call and its `onClick` guard from `DayTrack.tsx`, together with the tests of the drag without Pointer Events, so iOS 12 keeps today's tap-only behaviour; the Pointer Events path stays as it is. Before archive, also revise the change's artifacts as design "Consequences" lists: remove the no-Pointer-Events finger drag from `specs/time-selection/spec.md` (its words in "Select a time on a track", the outline row `finger on an engine without Pointer Events`, and the scenario "A finger drag adds no selection when the finger lifts"); restate FR4, UX3, U3 and G1 in `proposal.md` as "iOS 12 keeps tap-only selection", and M1 as 4 of 4 E2E drag scenarios; add `@FR4 @UX3` to "A tap selects a time without Pointer Events".
