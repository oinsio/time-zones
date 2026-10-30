# Specs review: fix-day-track-drag-continuity-and-smoothness

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 23/24 |
| Contradictions | 1 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Freshness

- ✅ `views/shared/DayTrack.tsx` is 184 lines. The slider has `touch-pan-y`, `onPointerDown/Move/Up/Cancel`, `onKeyDown`, and `onClick={IS_POINTER_EVENTS_SUPPORTED ? undefined : selectAt}` (`packages/client/src/views/shared/DayTrack.tsx:137-145`).
- ✅ `selectAt` measures `[data-day-track-bar]` through the `barElement` ref, returns early when `width <= 0`, and clamps with `MIN_TRACK_FRACTION`/`MAX_TRACK_FRACTION` (`DayTrack.tsx:65-73`). This is the logic that design D2 moves into `getPointerTrackFraction`.
- ✅ A mouse or pen press captures and selects. A touch press records `{ pointerId, start, decision: WAIT }`. `SELECT` captures the pointer, and lifting in `WAIT` selects once. `pointercancel` only drops the gesture (`DayTrack.tsx:75-115, 141-143`).
- ✅ The handle is `pointer-events-none` with `left: formatPercent(track.fraction)` (`DayTrack.tsx:157-160`).
- ✅ `getTouchGestureDecision` and `TouchGestureDecision.WAIT/SELECT/ABANDON` live in `views/shared/dayTrackTouch.ts`, and `TRACK_TOUCH_SLOP_PX = 10` is in `constants/timeSelection.ts:5`.
- ✅ `getInstantAtTrackFraction` rounds to `TRACK_STEP_MINUTES` (`model/dayTrack.ts:82-87`), and `getTrackFraction` is the instant-to-fraction owner (`model/dayTrack.ts:54`).
- ✅ `IS_POINTER_EVENTS_SUPPORTED` is read once at module load in `lib/legacy/pointerEvents.ts`.
- ✅ The archived `support-legacy-ios-12-safari` has NG4 "Smooth dragging along a day track on iOS 12" (`proposal.md:68`) and names `touchstart/move/end` on `DayTrack` in D8 (`design.md:173`). `LocationList.tsx:6,38` uses `TouchSensor`.
- ✅ `reduceSelectInstant` returns the same state for an instant that is already pinned (`model/reduceSelectInstant.ts`). `createStore` notifies only when `outcome.state !== currentState` (`model/store.ts:32-34`). `useTimeSelection.selectTrackFraction` dispatches on every call (`controller/useTimeSelection.ts:37-40`).
- ✅ The test files and helpers exist under the stated names. `DayTrack.input.test.tsx` has 183 lines, and `DayTrack.legacy.test.tsx` has 81 lines and uses `vi.stubGlobal("PointerEvent", undefined)` with a fresh import. `dayTrackFixture.tsx` exports `setupInteractiveTrack` and `ALMATY_TRACK`, and `test/setup.ts` installs `FakePointerEvent`.
- ✅ The E2E helpers exist: `startTouch`, `dispatchTouch` and `dragWithFinger` in `locations/steps/locationsReorderE2eHelpers.ts`; `barOf`, `pointOnBar`, `handleOf`, `visibleHandleOf` and `sliderOf` in `time_selection/steps/timeSelectionE2eHelpers.ts`; `emulateEngineWithoutPointerEvents` in `src/test/e2e/withoutPointerEvents.ts`. The last one deletes `PointerEvent`, stops pointer events in the capture phase and forces `touch-action: auto`.
- ✅ The steps it reuses exist. "the engine has no Pointer Events" is in `locations_reorder_legacy_touch_e2e.steps.ts:24`. "the page is taller than the screen" and "the page has scrolled down" are in `locations_reorder_checks_e2e.steps.ts:19,30`. "the page has not scrolled", "the card of {string} shows the time {string}" and "the Now button is not shown" are in `time_selection_pointer_e2e.steps.ts:88,155,139`. "the screen becomes {int} px wide" is in `time_selection_labels_e2e.steps.ts:34`, and "the locations screen has no accessibility violations" is in `locations_view_a11y_e2e.steps.ts:34`.
- ✅ `createTimeSelectionWorld` (with `selectFraction`, `rows`, `trackOf`), `createDayTrackSteps` and `startWorkCount` (`src/test/workCounters.ts:33`) exist.
- ✅ The scenarios that task 5.3 re-tags exist with those exact names: `time_selection_touch_e2e.feature:6,18`, `time_selection_legacy_tap.feature:6,17` (with `// @` comments in `time_selection_legacy_tap.steps.tsx:66,85`) and `time_selection_e2e.feature:7`.
- ✅ The Playwright projects `chromium` (Desktop Chrome) and `mobile-chrome` (Pixel 5) exist in `playwright.bdd.config.ts:88-95`.
- ✅ `constants/index.ts` re-exports `./timeSelection` (`:74`), and `DayTrack` is not exported from `views/shared/index.ts`. `views/shared/` already holds view-local hooks (`useSearchShortcut.ts`, `useDropSettleAnimation.ts`).
- ✅ Each of the four MODIFIED requirements ("Handle position", "Select a time on a track", "Time selection is fast", "Day track layout") exists in `openspec/specs/time-selection/spec.md` (`:42, :64, :304, :367`). The delta restates each one with every existing scenario kept. A diff of the blocks shows only the body edits and the added scenarios.
- ✅ The glossary has no **Track end** entry yet (`docs/glossary/time-selection.md:5-14`). The archived `H1-glossary-track-end.patch` still applies with `git apply --check`. Its hunk `@@ -5,11 +5,12 @@` keeps lines 6–7 (Day track, Handle) as context and does not shift them, so a `-U0` patch on lines 6–7 applies after it.
- ✅ No *Never:* word of `docs/glossary/time-selection.md` ("time slider", "timeline", "scrubber", "thumb", "knob", "scrubbing", "seeking") appears in the change's artifacts.
- ✅ Every ADR in `docs/adr/` (0001–0008) is `Accepted`. The change stores nothing (ADR-0003, ADR-0004). It keeps drag position as view state (ADR-0002) and states NFR-P1 as a work bound (ADR-0008).

## Coverage

| Id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ "Select a time on a track" drag paragraph and two scenarios | ✅ 3.1, 5.1, 5.2 |
| FR2 | ✅ | ✅ "MUST NOT scroll" plus "A drag continues…" "the page has not scrolled" | ✅ 3.1, 5.2 |
| FR3 | ✅ | ✅ "Handle position" and "Day track layout" scenarios | ✅ 3.1, 3.2, 5.1, 5.2 |
| FR4 | ✅ | ✅ engine-without-Pointer-Events paragraph and three scenarios | ✅ 4.1, 4.2, 5.1, 5.2 |
| FR5 | ✅ | ✅ existing scenarios kept unchanged; listed in the implements comment | ✅ 3.2, 5.3 |
| NFR-P1 | ✅ | ✅ "A drag move inside the pinned track step re-presents no row" | ✅ 5.1 |
| NFR-A1 | ✅ | ❌ no delta requirement or scenario states the slider value or axe after a drag (R1) | ✅ 3.1, 5.2 |
| NFR-R1 | ✅ | ✅ "The dragged handle stays under the pointer" at 375/1024 px | ✅ 5.2 |
| UX1 | ✅ | ✅ "A drag continues when the pointer leaves the track" | ✅ 5.1, 5.2 |
| UX2 | ✅ | ✅ "follows the pointer" and "settles…" scenarios | ✅ 5.1, 5.2 |
| UX3 | ✅ | ✅ outline row "finger on an engine without Pointer Events" | ✅ 5.1, 5.2, 6.3 |
| G1 | ✅ | n/a met by FR1, FR2, FR4 | n/a met by FR1, FR2, FR4 |
| G2 | ✅ | n/a met by FR3 | n/a met by FR3 |
| G3 | ✅ | n/a met by FR5 | n/a met by FR5 |
| NG1 | ✅ | n/a | n/a nothing changes the rounding or the clamp; the model is untouched (design Non-Goals) |
| NG2 | ✅ | n/a | n/a only the dragged track holds `dragFraction` (D2) |
| NG3 | ✅ | n/a | n/a `pointercancel` still ends the drag (D1) |
| NG4 | ✅ | n/a | n/a a tap still selects through `onClick`; only a click after a touch drag is ignored, which FR4 requires |
| NG5 | ✅ | n/a | n/a only the handle's `left` changes (design Non-Goals) |
| M1 | ✅ | n/a | ✅ 5.2 |
| M2 | ✅ | n/a | ✅ 5.2 |
| M3 | ✅ | n/a | ✅ 5.3 |
| M4 | ✅ | n/a | ✅ 5.4 |
| M5 | ✅ | n/a | ✅ 6.1 |

## Consistency

- `proposal.md:123` (M1) says `scrollY` "stays at its value from before the gesture (0 px change)". Task 5.2 (`tasks.md:61-62`) reuses the step "the page has not scrolled", and that step asserts the absolute position `{ x: 0, y: 0 }` (`time_selection_pointer_e2e.steps.ts:88-94`), not a change relative to before the gesture.

## Findings

### R1 — WARNING — NFR-A1 has no requirement or scenario in the delta spec
- Location: `openspec/changes/fix-day-track-drag-continuity-and-smoothness/proposal.md:82`; `specs/time-selection/spec.md` (none of the implements comments at `:4, :51, :167, :211` lists NFR-A1)
- Rule: `.claude/rules/traceability.md` ("For every FR/NFR/UX in `proposal.md`, at least one implementing entity must exist"); `.claude/rules/delta-specs.md`
- Problem: NFR-A1 requires that during and after a drag, the slider's `aria-valuenow` and value text are those of the selected track step and not of the pointer position, with no axe-core violations after a drag in both themes. The delta spec states none of this. "Handle position" and "Day track layout" now let the dragged handle stand off the step, but no requirement says that the slider value keeps the step. Task 5.2 plans an E2E scenario "The slider reports the selected step after a drag" (`tasks.md:66`) that has no spec scenario behind it.
- Impact: once archived, the stable spec allows a drag-time `aria-valuenow` that follows the pointer, because nothing there contradicts it. The E2E scenario of task 5.2 then tests a rule that exists only in the proposal. The requirement → spec → test chain for NFR-A1 is broken.
- Fix: in `specs/time-selection/spec.md`, under the already MODIFIED "Select a time on a track", add one sentence to the body: "During and after a drag, the slider's value and value text MUST be those of the selected track step, not of the pointer position." Add `NFR-A1` to that requirement's implements comment. Then add the scenario "The slider reports the selected step after a drag" with the values of task 5.2:
  - Given the interface language is English, the device time zone is `Asia/Almaty` and the current instant is `2026-03-08T07:30:00Z`.
  - When the user drags a finger to three quarters of the New York track and lifts it.
  - Then the New York slider has the value `1080` and the value text `09:00, Sun, Mar 8`.
  - And axe-core reports no violations in the light or the dark theme.
- Fix risk: low. The edit goes into a requirement this change already modifies, so it opens no new MODIFIED block. Restating the stable "Accessible day tracks" as MODIFIED instead would risk dropping its scenarios. The values match the existing "Dragging one track moves every card" outcome (13:00Z = 09:00 EDT on 2026-03-08).
- Status: open

### R2 — WARNING — No plan for the task's iOS 12 fallback if the real-device check fails
- Location: `openspec/changes/fix-day-track-drag-continuity-and-smoothness/design.md:47,73`; `tasks.md:98,109-111`
- Rule: — (task requirement 3: "Оставить поддержку iOS 12, не сломав её. При невозможности реализовать её в таком же виде, как в более новых ОС, оставить её работу без изменений")
- Problem: the task allows the iOS 12 drag only if it does not break iOS 12. If the new drag cannot work there as it does on newer systems, iOS 12 must keep working as it does today. Design D3 cancels `touchmove` only after `getTouchGestureDecision` returns `SELECT`, which needs more than 10 px of horizontal movement. The first small `touchmove`s in `WAIT` are left uncancelled, and on iOS 12 `touch-action` is ignored. WebKit may commit to a page scroll on an uncancelled early `touchmove`, and later `preventDefault` calls are then ignored. The design itself says that the Chromium emulation "is not WebKit 12" (`design.md:73`) and leaves the engine proof to H2. H2 (`tasks.md:98,109`) is only a checklist: it says nothing about what happens when an iOS 12.5 step fails.
- Impact: if H2 shows that the page scrolls during an iOS 12 finger drag, or that a vertical swipe stops scrolling, the change ships a behaviour the task forbids: iOS 12 gets selection and page scroll at the same time instead of today's tap-only track. Nothing in the change tells the operator to fall back, and no automated test can catch it.
- Fix:
  - In `design.md` D3, add under Consequences: "If the iOS 12.5 check of H2 fails (the page scrolls during a finger drag, or a vertical swipe on a track no longer scrolls), remove the `useDayTrackTouchFallback` call and its click guard from `DayTrack.tsx`. iOS 12 then keeps today's tap-only behaviour (task requirement 3), and the Pointer Events path is unaffected."
  - In task 4.2, require that the fallback is wired through that single call and the `onClick` guard, so that removing them restores `DayTrack.legacy.test.tsx` behaviour.
  - In task 6.3, add to the H2 README section a **Fallback:** line with the same instruction.
- Fix risk: none for the code, because it only fixes where the fallback is wired and documents the revert. It adds one line to H2 and one Consequences bullet.
- Status: open

### R3 — WARNING — Unit BDD "The handle settles on the selected step at release" cannot pass as planned
- Location: `openspec/changes/fix-day-track-drag-continuity-and-smoothness/tasks.md:52,56`
- Rule: `.claude/rules/bdd-unit.md` (real implementations; a scenario must exercise what it names)
- Problem: task 5.1 says to render `DayTrack` "with `world.selectFraction` as `time_selection_legacy_tap.steps.tsx` does". That file renders `DayTrack` once with `track={world.trackOf(city)}` (`steps/time_selection_legacy_tap.steps.tsx:44-52`) and never renders it again, so the `track` prop stays the presented track from before the drag. In the scenario, Almaty is live at `07:30`, with fraction `0.520833`. After the release, `DayTrack` draws its handle at `formatPercent(track.fraction)` of that stale prop, which is `52.0833%`, while the scenario expects `0.510417`.
- Impact: the scenario fails against a correct implementation. To get past it, the implementer may read the handle from `world.trackOf` (the presenter) instead of the rendered handle. The settle-at-release rule (FR3, UX2) would then be untested at unit level.
- Fix: in task 5.1, replace "render `DayTrack` … as `time_selection_legacy_tap.steps.tsx` does" with: "render `DayTrack` with `world.selectFraction`, and after every selection call `rerender` with `track={world.trackOf(city)}`, so the handle is read from the rendered `[data-day-track-handle]` with the current presented track".
- Fix risk: none. The steps file stays in the test layer, and the 200-line limit is already handled by the task's `dragSteps.ts` clause.
- Status: open

### R4 — SUGGESTION — E2E drag-off-track geometry and the scroll check are not pinned
- Location: `openspec/changes/fix-day-track-drag-continuity-and-smoothness/tasks.md:62`; `proposal.md:123`
- Rule: —
- Problem: task 5.2 runs "A drag continues when the pointer leaves the track" at 375 × 300 px with 5 stored locations, ending 120 px below the New York bar. It does not give the stored order. The existing 375 × 300 scenario lists New York last (`time_selection_touch_e2e.feature:9`). The reused step "the page has not scrolled" asserts `scrollY === 0` absolutely, while M1 says "stays at its value from before the gesture".
- Impact: if New York is not near the top, its bar or the end point 120 px below it lies outside the 300 px viewport at scroll 0. The step then has to scroll first, which fails the absolute check, or it dispatches input outside the viewport.
- Fix: in task 5.2, give the stored order with New York first ("New York", "Almaty", "Moscow", "Kolkata", "Tokyo"). Also have the step assert that the start point and the end point both lie inside the viewport before the gesture, and change M1's wording to "`scrollY` stays 0".
- Fix risk: low. If New York's bar plus 120 px still does not fit in 300 px, the implementer has to lower the offset, and the spec's "120 px below" must change with it.
- Status: open

## Verdict

Needs revision. Nothing blocks: there are no CRITICAL findings. R1, R2 and R3 (WARNING) should be fixed before implementation. R4 is optional.
