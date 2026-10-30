# Design: Fix day track drag continuity and smoothness

## Context

Driven by FR1–FR5, NFR-P1, NFR-A1, UX1–UX3 of `proposal.md` (motivation: proposal, Why). Every file below was opened on `main` under `packages/client/src/`.

- **The view**: `views/shared/DayTrack.tsx` (184 lines) is the shared day track block. The `role="slider"` element has `touch-pan-y` and the React handlers `onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`, `onKeyDown`, and `onClick` only when `IS_POINTER_EVENTS_SUPPORTED` is false. `selectAt` measures the bar (`barElement` ref on `[data-day-track-bar]`), clamps `(clientX - left) / width` to `MIN_TRACK_FRACTION`/`MAX_TRACK_FRACTION`, and calls `onSelectFraction`. A mouse or pen press calls `setPointerCapture` and selects. A touch press records a `TouchGesture` (`pointerId`, start point, `TouchGestureDecision.WAIT`). The first moves are decided by `getTouchGestureDecision` (`views/shared/dayTrackTouch.ts`, slop `TRACK_TOUCH_SLOP_PX = 10`). On `SELECT` it captures the pointer and selects on every move. On lift in `WAIT` it selects once (a tap). `pointercancel` drops the gesture. The handle `[data-day-track-handle]` is `pointer-events-none` and placed with `left: formatPercent(track.fraction)`.
- **Why a touch drag stops (FR1, FR2)**: nothing cancels the browser's default action during a drag. `touch-pan-y` lets the browser pan vertically for the whole gesture. If the finger drifts vertically after the drag has started, the browser may start a page scroll and fire `pointercancel`, and the gesture is dropped. A React `onTouchMove` cannot stop this: React attaches `touchmove` at its root as a passive listener, so `preventDefault` there is ignored. A mouse drag is not affected, because the pointer is captured on press.
- **Why the handle jumps (FR3)**: the handle is drawn at `track.fraction` from `presentDayTrack`. That is the effective instant, which `getInstantAtTrackFraction` (`model/dayTrack.ts`) rounds to `TRACK_STEP_MINUTES = 15`.
- **iOS 12 (FR4)**: `lib/legacy/pointerEvents.ts` exports `IS_POINTER_EVENTS_SUPPORTED`, read once at module load. Without Pointer Events only the click selects. The archived `support-legacy-ios-12-safari` design (D8) names `touchstart/move/end` on `DayTrack` as the way to smooth dragging, and left it out of scope there (NG4). Its `LocationList` uses dnd-kit's `TouchSensor`, which blocks `touchmove` with a non-passive listener. That is the same technique this change uses.
- **Store**: `reduceSelectInstant` (`model/reduceSelectInstant.ts`) returns the same state object for an already pinned instant, and `createStore` (`model/store.ts`) notifies subscribers only when the state object changes. The controller `useTimeSelection.selectTrackFraction` dispatches `SELECT_INSTANT` on every call.
- **Tests today**: `views/shared/DayTrack.input.test.tsx` (183 lines, pointer and keys, setup from `dayTrackFixture.tsx`), `DayTrack.legacy.test.tsx` (81 lines, click without Pointer Events through `vi.stubGlobal("PointerEvent", undefined)` and a fresh import), `dayTrackTouch.test.ts`. jsdom has no `PointerEvent`; `src/test/setup.ts` installs `FakePointerEvent` (`src/test/fakePointerEvent.ts`). The E2E helpers are `startTouch`, `dispatchTouch` and `dragWithFinger` (CDP touch, `locations/steps/locationsReorderE2eHelpers.ts`), `barOf`, `pointOnBar`, `handleOf`, `visibleHandleOf` and `sliderOf` (`time_selection/steps/timeSelectionE2eHelpers.ts`), and `emulateEngineWithoutPointerEvents` (`src/test/e2e/withoutPointerEvents.ts`). That helper deletes `PointerEvent`, stops pointer events in the capture phase, and forces `touch-action: auto`. The steps "the engine has no Pointer Events" (`locations_reorder_legacy_touch_e2e.steps.ts`), "the page is taller than the screen" and "the page has scrolled down" (`locations_reorder_checks_e2e.steps.ts`), and "the page has not scrolled" (`time_selection_pointer_e2e.steps.ts`) already exist.

Binding decisions:

- ADR-0002: views own view state and emit events. The drag position is view state, the selection still goes through `onSelectFraction` to the controller, and the model is untouched.
- ADR-0003: the reference moment is not stored.
- ADR-0008: the performance requirement is a work bound, not a timing.
- ADR-0001: browser behaviour (scroll, real touch, pixel positions, axe) is tested in playwright-bdd.

No global decision is needed, so no ADR.

## Goals / Non-Goals

**Goals:** fix both defects inside the shared `DayTrack` block, so location cards and the Here entry both get the fix. Reuse `getTouchGestureDecision` for both engines, so the swipe-or-drag rule keeps one owner.

**Non-Goals:** any change in `model/`, `presenter/` or `controller/`. No new design tokens, and no change to the slider's hit area or classes other than the handle's `left`.

## Decision

### D1. A drag cancels the browser's default `touchmove` (FR1, FR2, UX1)

While a drag is active, a native `touchmove` listener on the slider element, added with `{ passive: false }`, calls `preventDefault()`. With Pointer Events, "drag active" means a mouse or pen press, or a touch gesture whose decision is `SELECT`. The listener is added once in an effect and reads the gesture from a ref, so it does nothing outside a drag. A vertical swipe (`WAIT` or `ABANDON`) still scrolls. Browsers fire `pointermove` before the matching `touchmove`, so the move that turns a gesture into `SELECT` is already cancelled. Pointer capture stays as it is: on press for a mouse or pen, on `SELECT` for a touch. Together, capture and the cancelled default keep `pointermove` coming to the slider wherever the finger goes, until `pointerup`. If the browser still cancels the pointer (NG3), `pointercancel` ends the drag, as today.

### D2. The drag position is view state of `DayTrack` (FR3, NFR-A1, UX2)

A `dragFraction: number | null` state holds the pointer's clamped fraction while a drag is active. It is set on every selecting press or move, from the same measurement that `onSelectFraction` gets, and cleared to `null` on `pointerup`, `pointercancel`, `touchend` and `touchcancel`. The handle's `left` becomes `formatPercent(dragFraction ?? track.fraction)`. `aria-valuenow` and `aria-valuetext` keep reading `track.valueMinutes` and `track.valueText`, the selected step (NFR-A1). Other cards get no drag state, so their handles stay at the effective instant (NG2). The fraction from the pointer moves out of `selectAt` into a pure helper, `getPointerTrackFraction(clientX, barBox)` in new `views/shared/dayTrackPointer.ts`. It returns `null` for a bar with zero width and otherwise the clamped fraction. Both input paths use it. It is the same pointer-to-fraction mapping `selectAt` does today, moved and not repeated. The model's `getTrackFraction` (instant to fraction) stays the only owner of the other direction.

### D3. Touch Events drive the drag without Pointer Events (FR4, UX3)

When `IS_POINTER_EVENTS_SUPPORTED` is false, an effect adds native listeners to the slider: `touchstart` (passive), `touchmove` (`{ passive: false }`), `touchend` and `touchcancel`. They mirror the pointer path:

- `touchstart` with no gesture in progress records the touch's `identifier` and start point with `WAIT`. A second finger is ignored, as `pointerId` does today.
- `touchmove` finds that touch in `changedTouches`. In `WAIT` it decides with `getTouchGestureDecision`. On `SELECT`, it and every later move call `preventDefault()`, set `dragFraction` and call `onSelectFraction`. `ABANDON` leaves the browser to scroll.
- `touchend` and `touchcancel` of that touch clear the gesture and `dragFraction`, and select nothing.

Touch events always go to the element where the touch started, so the drag follows the finger anywhere, as on newer engines. A tap still selects through the existing `onClick`, unchanged (NG4). A click that arrives after a touch drag reached `SELECT` is ignored: a flag set on `SELECT` and cleared on the next `touchstart`. So a drag adds no selection of its own at the lift, even where the engine sends a click after a short drag. With Pointer Events none of these listeners are added, and the pointer path does not change. The legacy E2E emulation forces `touch-action: auto`, as iOS 12 ignores `pan-y`, so it shows that D3's `preventDefault` alone keeps the page still.

### D4. Files stay small (process invariants)

`DayTrack.tsx` would pass 200 lines, so the input handling moves into view-local hooks next to it. `views/shared/useDayTrackDrag.ts` holds the pointer path, `dragFraction` and the D1 guard. `views/shared/useDayTrackTouchFallback.ts` holds D3. `DayTrack.tsx` keeps the markup and the keys. The hooks are DOM gesture handling of one shared block. That is view state per ADR-0002, not a side effect around a domain concept, so they live in `views/shared/` and not in `controller/`. Like `DayTrack`, they are not exported from `views/shared/index.ts`. The listener options and event names go into `constants/timeSelection.ts`: `TRACK_TOUCH_MOVE_LISTENER_OPTIONS = { passive: false }`, plus a `TrackTouchEvent` enum for `touchstart`, `touchmove`, `touchend` and `touchcancel`. They are re-exported from `constants/index.ts`. Event-name strings stay out of the code.

### D5. No throttling: the store already skips unchanged steps (NFR-P1)

Every selecting move still calls `onSelectFraction`. A move that rounds to the pinned step returns the same state (`reduceSelectInstant`), and the store notifies nobody (`model/store.ts`). So only `DayTrack`'s own `dragFraction` re-renders it, and no row is presented again. A `requestAnimationFrame` throttle is not needed and would add a timer to a view. The unit BDD scenario of NFR-P1 locks this behaviour.

### D6. Where each test goes

- Vitest `views/shared/dayTrackPointer.test.ts`: the helper.
- Vitest `views/shared/DayTrack.drag.test.tsx` (new, so `DayTrack.input.test.tsx` stays under 200 lines): handle `left` during and after a drag, the `touchmove` default cancelled only while a drag is active (`fireEvent.touchMove` returns `false`), and a pointer move far outside the bar's box still selecting.
- Vitest `views/shared/DayTrack.touchFallback.test.tsx` (new): D3 with `vi.stubGlobal("PointerEvent", undefined)` and a fresh import, as `DayTrack.legacy.test.tsx` does.
- Unit BDD `time_selection_drag_unit.feature`: selection and handle rules with the real store (`createTimeSelectionWorld`), rendering `DayTrack` as `time_selection_legacy_tap.steps.tsx` does, and re-rendering it with `world.trackOf(city)` after every selection, so the rendered handle settles on the current presented track.
- E2E `time_selection_drag_e2e.feature`: scroll, real touch, pixels and axe.

## Consequences

Positive:
- One rule for swipe or drag (`getTouchGestureDecision`) serves both engines. Vertical swipes keep scrolling the page.
- The model, presenter and controller do not change. The selected moment and the slider value behave exactly as before.

Negative (risks and trade-offs):
- [WebKit on iOS might still cancel a pointer for its own gestures] → NG3. A cancelled drag keeps the last selection. H2 checks real devices once.
- [Chromium emulation is not WebKit 12] → accepted, as in `support-legacy-ios-12-safari` (its NG9). The E2E proves the code path, and H2 proves the engine.
- [WebKit 12 may commit to a page scroll on the early `touchmove`s that D3 leaves uncancelled in `WAIT`, and ignore later `preventDefault` calls] → fallback. If the iOS 12.5 check of H2 fails (the page scrolls during a finger drag, or a vertical swipe on a track no longer scrolls), remove the `useDayTrackTouchFallback` call and its click guard from `DayTrack.tsx`, together with the tests of the drag without Pointer Events. iOS 12 then keeps today's tap-only behaviour, as the task allows ("при невозможности … оставить её работу без изменений"), and the Pointer Events path is unaffected. D3 is wired through that one call and that one guard so that this revert is small. Before archive, the same fallback also revises this change's artifacts, so that no spec or requirement asks for a drag iOS 12 no longer has. In `specs/time-selection/spec.md` (requirement "Select a time on a track"), remove the first sentence of the no-Pointer-Events paragraph (the finger drag) and its words "and a finger drag MUST NOT add a selection of its own when the finger lifts", the outline row `finger on an engine without Pointer Events` of "A drag continues when the pointer leaves the track", and the scenario "A finger drag adds no selection when the finger lifts". In `proposal.md`, restate FR4 as "On an engine without Pointer Events (iOS 12) the track keeps tap-only selection: a tap selects through the click as today, and a mostly vertical swipe scrolls the page and selects nothing". Restate UX3 as "On iOS 12 taps on a track work as they did before this change; no finger drag is offered", U3 and G1 to match, and M1 as "4 of 4 E2E drag scenarios" without the no-Pointer-Events drag row. FR4 and UX3 then stay covered by "A vertical swipe without Pointer Events still scrolls" (`@FR4`) and by "A tap selects a time without Pointer Events", whose tags from task 5.3 gain `@FR4 @UX3`. So M5 keeps its id list, and the loop of task 6.1 still prints nothing.
- [In Chromium with `touch-pan-y`, a drag that starts horizontally may not scroll even without D1] → the E2E scenarios are a regression guard. The failing-first proof of D1 is the Vitest check that `touchmove` is cancelled during a drag.
- [The dragged handle can be up to half a track step away from the other handles during a drag] → accepted (NG2, UX2). It settles at release.

## Alternatives Considered

- **`touch-none` on the whole slider**: no scroll problem, but a vertical swipe on a track would no longer scroll the page. That breaks FR5 and the existing `time_selection_touch_e2e.feature`. Rejected.
- **Start a drag at once on a touch on the handle (`touch-none` on the handle)**: also blocks vertical swipes that start on the handle, and iOS 12 ignores `touch-action` anyway. Rejected in favour of D1, which works for both engines.
- **Select at minute resolution during a drag**: smooth, but it changes the track step and the selected moment (NG1). Rejected.
- **A Pointer Events polyfill for iOS 12**: rejected in `support-legacy-ios-12-safari` (unmaintained, partial capture support). Same verdict here.
