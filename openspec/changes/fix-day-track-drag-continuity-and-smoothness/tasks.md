# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`, `git` or say "from the repository root". "design Dn" refers to `design.md`.

- **Running tests:** one command at a time, never in the background. Stryker runs only with `--mutate`, at most 5 files per run, and writes its report to `reports/mutation/mutation-report.json`.
- **Time in tests:** only `fakeClock(instant, timeZone)` of `@/lib/temporal` or the existing worlds built on it. Never `vi.setSystemTime()` or `vi.useFakeTimers()`.
- **E2E runs:** every Playwright command after a `.feature` edit starts with `npx bddgen -c playwright.bdd.config.ts && ` (the order of the `test:bdd` script).
- **Traceability:** every new or changed test, step file, feature and production module carries `fix-day-track-drag-continuity-and-smoothness`:
  - `@fix-day-track-drag-continuity-and-smoothness @FR-X` tags above scenarios, and `// @fix-day-track-drag-continuity-and-smoothness @FR-X` before `f.Scenario`;
  - `// Verifies FR-X of fix-day-track-drag-continuity-and-smoothness` at the top of Vitest files and E2E steps;
  - `Implements FR-X of fix-day-track-drag-continuity-and-smoothness` in the JSDoc of new or changed production code.
- **Glossary:** use the terms of `docs/glossary/time-selection.md`: day track, handle, time selection, track step, track fraction. Never "slider" for the day track outside its accessible role, and never "thumb", "knob", "scrubber" or "timeline".
- **File size:** every file stays under 200 lines.

## 1. Constants (no TDD: constants)

- [ ] 1.1 In `constants/timeSelection.ts`, add the enum `TrackTouchEvent` (`START = "touchstart"`, `MOVE = "touchmove"`, `END = "touchend"`, `CANCEL = "touchcancel"`) and `TRACK_TOUCH_MOVE_LISTENER_OPTIONS: AddEventListenerOptions = { passive: false }`, under the comment `// Implements FR1, FR2, FR4 of fix-day-track-drag-continuity-and-smoothness (D1, D3, D4).`. Re-export both from `constants/index.ts`. Verify with `pnpm --filter @time-zones/client typecheck`.

## 2. Pointer position helper (TDD)

- [ ] 2.1 RED: create `views/shared/dayTrackPointer.test.ts` for `getPointerTrackFraction(clientX, barBox)` (design D2). Use `it.each` for these cases: `{ left: 100, width: 400 }` with clientX 300 gives 0.5, with 50 gives 0, and with 900 gives 1. A box with width 0 gives `null`. Run `npx vitest run src/views/shared/dayTrackPointer.test.ts` and see it fail.
- [ ] 2.2 GREEN: create `views/shared/dayTrackPointer.ts` with that function, clamping with `MIN_TRACK_FRACTION`/`MAX_TRACK_FRACTION`. Make `selectAt` in `DayTrack.tsx` use it, with no change in behaviour. Verify, one at a time: `npx vitest run src/views/shared/dayTrackPointer.test.ts`, then `npx vitest run src/views/shared`.

## 3. Pointer drag: continuity and handle position (TDD)

- [ ] 3.1 RED: create `views/shared/DayTrack.drag.test.tsx`, using `setupInteractiveTrack` of `dayTrackFixture.tsx` (FR1, FR2, FR3, NFR-A1, design D1, D2):
  - a touch that moved horizontally (`SELECT`) and then moves to clientX 300, clientY 500 (far below the bar) selects 0.75;
  - during that drag, `fireEvent.touchMove(slider)` returns `false` (default cancelled), and it returns `true` before the press, during a vertical swipe (`ABANDON`), and after `pointerup`;
  - during a mouse drag to clientX 204.8 (0.512 of 400 px), the handle `[data-day-track-handle]` has `style.left` `51.2%`, while `aria-valuenow` still shows `ALMATY_TRACK.valueMinutes`;
  - after `pointerup`, and after `pointercancel`, the handle's `left` is `formatPercent(ALMATY_TRACK.fraction)` again;
  - a vertical swipe never changes the handle's `left`.

  Run `npx vitest run src/views/shared/DayTrack.drag.test.tsx` and see it fail.
- [ ] 3.2 GREEN: create `views/shared/useDayTrackDrag.ts`. Move the pointer handlers and the touch gesture ref out of `DayTrack.tsx` into it, add the `dragFraction` state and the native non-passive `touchmove` guard (design D1, D2, D4), and return the handlers and `dragFraction`. In `DayTrack.tsx`, place the handle at `formatPercent(dragFraction ?? track.fraction)` and extend the component JSDoc with `Implements FR1, FR2, FR3, FR5, NFR-A1 of fix-day-track-drag-continuity-and-smoothness`. Verify, one at a time: `npx vitest run src/views/shared/DayTrack.drag.test.tsx`, then `npx vitest run src/views/shared` (the existing `DayTrack.input.test.tsx`, `DayTrack.legacy.test.tsx` and `DayTrack.test.tsx` pass unchanged: FR5).

## 4. Finger drag without Pointer Events (TDD)

- [ ] 4.1 RED: create `views/shared/DayTrack.touchFallback.test.tsx`. Render with `vi.stubGlobal("PointerEvent", undefined)` and a fresh import, as `DayTrack.legacy.test.tsx` does (FR4, design D3):
  - `touchStart` at x 100, then `touchMove` to x 120, then to x 300 with y 500 (`changedTouches` with one `identifier`) selects 0.75. Those moves return `false` from `fireEvent.touchMove`;
  - a mostly vertical move (x 102, y 30) selects nothing, and its `touchMove` returns `true`;
  - during the drag the handle's `left` follows the finger, and after `touchEnd` or `touchCancel` it is back at `formatPercent(ALMATY_TRACK.fraction)`;
  - `touchEnd` selects nothing, and a `click` right after a drag adds no call to `onSelectFraction`;
  - a tap (`touchStart`, `touchEnd`, `click` at x 300) still selects 0.75 once;
  - a second finger's `touchStart` and moves during a drag are ignored;
  - with Pointer Events present, touch events select nothing.

  Run `npx vitest run src/views/shared/DayTrack.touchFallback.test.tsx` and see it fail.
- [ ] 4.2 GREEN: create `views/shared/useDayTrackTouchFallback.ts` (design D3). It adds its listeners only when `IS_POINTER_EVENTS_SUPPORTED` is false, removes them on unmount, and uses `TrackTouchEvent`, `TRACK_TOUCH_MOVE_LISTENER_OPTIONS`, `getTouchGestureDecision` and `getPointerTrackFraction`. Call it from `DayTrack.tsx`, share `dragFraction` with it, and make the `onClick` ignore the click after a touch drag. Wire D3 into `DayTrack.tsx` only through that one hook call and that one `onClick` guard, so that removing both (the H2 fallback, design "Consequences") restores today's tap-only behaviour and `DayTrack.legacy.test.tsx` still passes unchanged. Add `FR4, UX3 of fix-day-track-drag-continuity-and-smoothness` to the component JSDoc. Verify, one at a time: `npx vitest run src/views/shared/DayTrack.touchFallback.test.tsx`, then `npx vitest run src/views/shared`, then `npx vitest run src/test/features/time_selection/steps/time_selection_legacy_tap.steps.tsx`.

## 5. Behaviour features

- [ ] 5.1 Unit BDD: create `test/features/time_selection/time_selection_drag_unit.feature` and `steps/time_selection_drag_unit.steps.tsx`. Use `createTimeSelectionWorld` and `createDayTrackSteps`, and render `DayTrack` with `world.selectFraction` (400 px bar, measured as in `time_selection_legacy_tap.steps.tsx`). After every selection, call `rerender` with `track={world.trackOf(city)}`, so the handle is read from the rendered `[data-day-track-handle]` with the current presented track, never from `world.trackOf` alone. Write these scenarios, worded from the spec delta, with their numbers:
  - "A drag continues when the pointer leaves the track", as an outline over `mouse`, `finger` and `finger on an engine without Pointer Events`: New York pinned to `2026-03-08T13:00:00Z` and Almaty `18:00`, with no scroll step (`@FR1 @FR4 @UX1 @UX3`);
  - "A drag past the right end pins the track end": `2026-03-08T18:59:00Z`, Almaty `23:59` (`@FR1`);
  - "The dragged handle follows the pointer between track steps": Almaty handle `left` `51.2%`, pinned `2026-03-08T07:15:00Z`, New York track fraction `0.510417` (`@FR3 @UX2`);
  - "The handle settles on the selected step at release": `0.510417` (`@FR3 @UX2`);
  - "A finger drag adds no selection when the finger lifts", with no Pointer Events (`@FR4`);
  - "A drag move inside the pinned track step re-presents no row": Almaty, Moscow, Kolkata and New York; `0.512` then `0.514`. Every row from `world` is `toBe` the row from before the move, and `startWorkCount()` of `src/test/workCounters.ts` counts 0 formatter builds (`@NFR-P1`).

  If the steps file passes 200 lines, move helpers into `steps/dragSteps.ts`. Verify `npx vitest run src/test/features/time_selection/steps/time_selection_drag_unit.steps.tsx`.
- [ ] 5.2 E2E: create `test/features/time_selection/time_selection_drag_e2e.feature` and `steps/time_selection_drag_e2e.steps.ts`. Reuse "the engine has no Pointer Events", "the page is taller than the screen", "the page has scrolled down", "the page has not scrolled", "the card of {string} shows the time {string}" and "the locations screen has no accessibility violations". The new steps drive the mouse with `page.mouse` and the finger with `startTouch` and `dispatchTouch`. A drag first moves 20 px along the bar, then goes to the target. The scenarios, each tagged `@fix-day-track-drag-continuity-and-smoothness` plus the ids below:
  - "A drag continues when the pointer leaves the track" at 375 × 300 px with the stored locations "New York", "Almaty", "Moscow", "Kolkata", "Tokyo" (New York first, so its bar is near the top), as an outline over mouse, finger, and finger with no Pointer Events. The pointer ends at 75% of the New York bar, 120 px below it. Before the gesture, the step asserts that the start point and the end point both lie inside the viewport at scroll 0; if they do not fit, lower the offset here and in the spec scenario together. Almaty shows `18:00`, and the page has not scrolled (`@FR1 @FR2 @FR4 @UX1 @UX3 @NFR-R1`);
  - "A drag past the right end pins the track end": a finger 60 px above the Almaty bar, past its right end. Almaty shows `23:59`, and the page has not scrolled (`@FR1 @FR2`);
  - "A vertical swipe without Pointer Events still scrolls": the page has scrolled down, and the Now button is not shown (`@FR2 @FR4 @FR5`);
  - "The dragged handle stays under the pointer" (the "Day track layout" scenario of the same name), as an outline over 375 and 1024 px wide, set with the existing step "the screen becomes {int} px wide" of `steps/time_selection_labels_e2e.steps.ts`: a held mouse drag at 3 positions that are not on a step (51.2%, 30.1%, 80.3% of the Almaty bar). The centre of `visibleHandleOf` is within 1 px of the pointer's x each time. After release it is within 1 px of `pointOnBar` at the selected step's fraction, read from `aria-valuenow` / `aria-valuemax` (`@FR3 @UX2 @NFR-R1`);
  - "The slider reports the selected step after a drag", in the light and dark themes: after a finger drag to 75% of New York, the New York slider has `aria-valuenow` `1080`, value text `09:00, Sun, Mar 8`, and there are no axe-core violations (`@NFR-A1`).

  The steps carry `// Verifies FR1, FR2, FR3, FR4, NFR-A1, NFR-R1, UX1, UX2, UX3 of fix-day-track-drag-continuity-and-smoothness`. Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "@fix-day-track-drag-continuity-and-smoothness"` (runs in the `chromium` and `mobile-chrome` projects).
- [ ] 5.3 Regression of the existing behaviour (FR5, M3): add the tags `@fix-day-track-drag-continuity-and-smoothness @FR5` above these existing scenarios, with no other edit: "A vertical swipe on a track scrolls without selecting a time" and "A finger tap on a track selects a time" (`time_selection_touch_e2e.feature`), "A tap selects a time without Pointer Events" and "A click adds nothing where Pointer Events exist" (`time_selection_legacy_tap.feature`, with the matching `//` comments in its steps file), and "Dragging one track moves every card" (`time_selection_e2e.feature`). Verify, one at a time: `npx vitest run src/test/features/time_selection/steps/time_selection_legacy_tap.steps.tsx`, then `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "@support-legacy-ios-12-safari|@add-time-sliders-to-location-cards"`. Then `git diff -U0 -- src/test/features/time_selection/*.feature | grep -E '^[-+][^-+]' | grep -v '^+ *@'` prints nothing: the existing feature files gained only tag lines.
- [ ] 5.4 Mutation (M4): `npx stryker run --mutate 'src/views/shared/DayTrack.tsx,src/views/shared/useDayTrackDrag.ts,src/views/shared/useDayTrackTouchFallback.ts,src/views/shared/dayTrackPointer.ts'`. Read `reports/mutation/mutation-report.json`: the score over the four files is at least 95% (minimum acceptable 90%). Kill survivors with tests in the files of sections 2–4.

## 6. Handoff and final verification

- [ ] 6.1 Traceability (M5): run this loop from `packages/client/`. It must print nothing.

  ```
  for id in FR1 FR2 FR3 FR4 FR5 NFR-P1 NFR-A1 NFR-R1 UX1 UX2 UX3; do
    grep -rqE "fix-day-track-drag-continuity-and-smoothness.*(^|[^A-Za-z0-9-])@?$id([^0-9]|$)|(^|[^A-Za-z0-9-])@?$id([^0-9]|$).*fix-day-track-drag-continuity-and-smoothness" src || echo "missing $id"
  done
  ```
- [ ] 6.2 Handoff H1: write `openspec/changes/fix-day-track-drag-continuity-and-smoothness/handoff/H1-glossary-handle-drag.patch` and its section in `handoff/README.md`, following `.gnomish/stages/specify/handoff.md`. The patch edits `docs/glossary/time-selection.md` with the wording of the proposal ("What Changes"):
  - **Day track**: "All handles stand at the same position, except a handle that is being dragged.";
  - **Handle**: add "During a drag, the handle follows the pointer along the track. When released, it settles at the reference moment."

  The archived `fix-day-track-handle-overlap-and-end-of-day/handoff/H1-glossary-track-end.patch` is not applied yet. It edits the lines right below these (8–12), so make this patch without context, against the file as committed: `git diff -U0 -- docs/glossary/time-selection.md`. Restore the file afterwards.

  The two patches go in in one order only: the archived track-end patch first. Its hunk `@@ -5,11 +5,12 @@` keeps the Day track and Handle lines (6–7) as context, and this patch changes them, so after this patch the track-end patch no longer applies. The README's H1 section therefore:
  - opens with the sentence "Apply `H1-glossary-track-end.patch` of the archived change `fix-day-track-handle-overlap-and-end-of-day` first; the command below does it when it is not applied yet.";
  - has as its **Apply** line, on that one line, exactly this command, which applies the track-end patch unless it is already applied, then this patch:
    `- **Apply:** { git apply --check --reverse openspec/changes/archive/2026/10/2026-10-30-fix-day-track-handle-overlap-and-end-of-day/handoff/H1-glossary-track-end.patch 2>/dev/null || git apply openspec/changes/archive/2026/10/2026-10-30-fix-day-track-handle-overlap-and-end-of-day/handoff/H1-glossary-track-end.patch; } && git apply --unidiff-zero openspec/changes/fix-day-track-drag-continuity-and-smoothness/handoff/H1-glossary-handle-drag.patch`
  - gives this patch's path relative to the README as well (`H1-glossary-handle-drag.patch`, same folder); the track-end path stays the repository-root path, since that change is already archived and does not move.

  Verify from the repository root, one command at a time:
  - `git apply --check --unidiff-zero openspec/changes/fix-day-track-drag-continuity-and-smoothness/handoff/H1-glossary-handle-drag.patch`;
  - `scratch=$(mktemp -d) && git archive HEAD docs | tar -x -C "$scratch" && (cd "$scratch" && git apply "$OLDPWD/openspec/changes/archive/2026/10/2026-10-30-fix-day-track-handle-overlap-and-end-of-day/handoff/H1-glossary-track-end.patch" && git apply --unidiff-zero "$OLDPWD/openspec/changes/fix-day-track-drag-continuity-and-smoothness/handoff/H1-glossary-handle-drag.patch") && grep -q "except a handle that is being dragged" "$scratch/docs/glossary/time-selection.md" && grep -q "Track end" "$scratch/docs/glossary/time-selection.md"` exits 0. So both patches apply, in that order;
  - `grep -cE '^- \*\*Apply:\*\*.*H1-glossary-track-end\.patch.*H1-glossary-handle-drag\.patch' openspec/changes/fix-day-track-drag-continuity-and-smoothness/handoff/README.md` prints `1`, so the H1 **Apply** line names the track-end patch before this one;
  - `git status --short docs` prints nothing.
- [ ] 6.3 Handoff H2: add a `## H2: Drag on real iOS devices` section to `handoff/README.md`, with no patch. It has a device checklist for an iPhone on iOS 12.5 and one on iOS 13 or later. On each: drag the Almaty handle with a finger, let the finger drift 2 cm down over the next card, and lift. The handle follows to the lift and the page does not scroll. A vertical swipe that starts on a track scrolls the page. A tap selects the tapped time. **Serves:** FR1, FR2, FR4, UX1, UX3. **Verify:** the checklist. **Fallback:** if a step fails on iOS 12.5 (the page scrolls during a finger drag, or a vertical swipe on a track no longer scrolls), remove the `useDayTrackTouchFallback` call and its `onClick` guard from `DayTrack.tsx`, together with the tests of the drag without Pointer Events, so iOS 12 keeps today's tap-only behaviour (task requirement 3); the Pointer Events path stays as it is. Add **Why manual:** and **Automated part:** as in "Human follow-up" below. Verify with `grep -c "^## H[12]:" openspec/changes/fix-day-track-drag-continuity-and-smoothness/handoff/README.md`, which prints `2` (from the repository root).
- [ ] 6.4 Run each command alone, in this order: `pnpm --filter @time-zones/client typecheck`, `pnpm --filter @time-zones/client lint`, `pnpm --filter @time-zones/client test`, `pnpm run build`. Then run `pnpm --filter @time-zones/client test:bdd` once, alone, and fix every failing scenario.
- [ ] 6.5 Glossary check (`.claude/rules/glossary.md`, "Review checklist"): `grep -rniE "\b(thumb|knob|scrubber|timeline|time slider)\b" src/views/shared/DayTrack.tsx src/views/shared/useDayTrackDrag.ts src/views/shared/useDayTrackTouchFallback.ts src/views/shared/dayTrackPointer.ts src/test/features/time_selection/time_selection_drag_unit.feature src/test/features/time_selection/time_selection_drag_e2e.feature` prints nothing.

## Human follow-up

The operator reviews these items on the pull request the deliver stage opens.

- H1 (FR3, UX2): first apply `openspec/changes/archive/2026/10/2026-10-30-fix-day-track-handle-overlap-and-end-of-day/handoff/H1-glossary-track-end.patch` if it is not applied yet, then `handoff/H1-glossary-handle-drag.patch` with `git apply --unidiff-zero`. In the other order the track-end patch no longer applies. The **Apply** line of H1 in `handoff/README.md` (task 6.2) does both, in that order, in one command. It updates **Handle** and **Day track** in `docs/glossary/time-selection.md`: a dragged handle follows the pointer and settles at the reference moment when released.
  Why manual: the implement stage writes only under `packages/` and the change's `handoff/` folder, and the glossary lives in `docs/glossary/`.
  Automated part: `git apply --check` and the scratch check of task 6.2. The behaviour the entry describes is covered by tasks 3.1, 5.1 and 5.2.
- H2 (FR1, FR2, FR4, UX1, UX3): run the device checklist in `handoff/README.md` once, on an iPhone with iOS 12.5 and one with iOS 13 or later. If the iOS 12.5 part fails, apply the **Fallback:** of H2: remove the `useDayTrackTouchFallback` call and its `onClick` guard from `DayTrack.tsx`, with the tests of the drag without Pointer Events, so iOS 12 keeps today's tap-only behaviour.
  Why manual: the sandbox and CI have no iOS Safari engine. Playwright's WebKit is a current desktop build, not WebKit on iOS 12, and the iOS 12 E2E runs in Chromium with Pointer Events emulated away. Only a real device shows how iOS Safari hands a gesture to scrolling.
  Automated part: the E2E scenarios of task 5.2 run the same gestures in Chromium, with and without Pointer Events, and the Vitest files of sections 3–4 cover both input paths.
