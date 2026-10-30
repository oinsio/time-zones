# Fix day track drag continuity and smoothness

Builds on the archived `add-time-sliders-to-location-cards`, `support-legacy-ios-12-safari` and `fix-day-track-handle-overlap-and-end-of-day`, which are all on `main`. No other active change exists under `openspec/changes/`, so nothing blocks this change.

## Why

Users of the Cards view on phones say dragging a day track handle feels broken:

1. **A drag stops when the finger slides off the track.** The user grabs the handle and moves it along the track. If the finger drifts up or down off the 44 px track, the browser may take over the gesture as a page scroll. The handle then stops and the page moves instead. A drag should end only when the user lifts the finger.
2. **The handle jumps.** A time selection is rounded to the 15-minute track step, and the handle is drawn at the selected moment. So during a drag the handle jumps from step to step instead of moving under the finger.
3. **On iOS 12 the handle cannot be dragged at all.** That engine has no Pointer Events. `support-legacy-ios-12-safari` gave it tap selection only and put smooth dragging out of scope (its NG4). The owner asks for the same drag there as on newer systems, or, where that is not possible, no change to what works today.

Audience: every Cards view user who drags a handle, mostly on touch screens. Mouse drags already continue off the track, and this change keeps it that way.

## What Changes

- MODIFIED `time-selection` "Select a time on a track":
  - Once a drag has started, it keeps selecting until the pointer is released, wherever the pointer goes: above or below the track, or past either end. The page does not scroll during the drag.
  - On an engine without Pointer Events, a finger drag selects the same way as on other engines. A tap still selects through the click, as today.
- MODIFIED `time-selection` "Handle position": during a drag, the dragged handle follows the pointer's position along the track. When the drag ends, it settles at the effective instant. The other handles keep showing the effective instant. "Select a time on a track" names the dragged handle as the one exception to "every handle shows the new moment in the same render".
- MODIFIED `time-selection` "Time selection is fast": a drag move that stays inside the current track step re-presents no row.
- MODIFIED `time-selection` "Day track layout": the handle's centre stands exactly at the effective instant, except the dragged handle during a drag, whose centre is within 1 px of the pointer and returns to the effective instant at release.
- Unchanged: the 15-minute rounding and the clamp to the track end. Also unchanged: a mouse or pen still selects on press, and a touch still selects once it moves horizontally or lifts after a tap. A vertical swipe that starts on a track still scrolls the page. Keys, the slider's accessible name and value, the colours, the hour labels and the layout all stay as they are.
- No stored data changes. The reference moment is never stored (ADR-0003, ADR-0004), and the drag needs no network.

Glossary terms (`docs/glossary/time-selection.md`). The change goes in as handoff patch H1, because the implement stage writes only under `packages/`:

- CHANGED **Handle**: adds "During a drag, the handle follows the pointer along the track. When released, it settles at the reference moment."
- CHANGED **Day track**: "All handles stand at the same position" becomes "All handles stand at the same position, except a handle that is being dragged."
- Used as they are: day track, handle, time selection, track step, track fraction, track value, reference day, reference moment. **Track end** is defined in the `time-selection` spec. Its glossary entry is still the pending patch `H1-glossary-track-end.patch` of the archived `fix-day-track-handle-overlap-and-end-of-day`, and this change uses that wording. That patch is applied before H1, since H1 changes lines it keeps as context (tasks.md 6.2).
- No new term: "drag" stays plain English, as the **Handle** entry already says ("Dragging it, or tapping the track, selects a time").

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `time-selection`: MODIFIED "Select a time on a track", "Handle position", "Time selection is fast" and "Day track layout".

## Goals

- G1: A drag that has started ends only when the user releases the pointer. This holds for mouse, pen and finger, on engines with and without Pointer Events.
- G2: During a drag, the dragged handle stays under the pointer instead of jumping by track steps.
- G3: Everything else the day track does today stays the same: rounding, clamping, taps, vertical swipes, keys, accessibility and layout.

## Non-Goals

- NG1: Changing the 15-minute track step, the rounding or the clamp to the track end. Only the handle's drawing during a drag changes. The selected moment, the cards' times and the slider value still move by track steps.
- NG2: Making the other cards' handles follow the pointer. They show the effective instant, as every handle does today.
- NG3: Continuing a drag after the browser itself cancels the pointer, for example when the system takes the gesture for an edge swipe or a call. A cancelled drag keeps the last selection, as today.
- NG4: Changing the tap path on engines without Pointer Events (a click selects), or the card reorder by drag handle.
- NG5: Changing the layout, the size of the handle or the slider's hit area.

## Users & Scenarios

- U1: On a phone, a user puts a finger on the Almaty handle and drags it right to plan a late call. Their finger drifts 2 cm down over the next card. The handle keeps following the finger, the page stays still, and the time is the one under the finger when they lift it.
- U2: The user drags slowly. The handle glides under the finger. The cards' times change every 15 minutes, and on release the handle settles on the selected quarter hour.
- U3: On an iPhone with iOS 12, the user drags the handle with a finger and gets the same result as U1. A tap on the track still selects the tapped time, as today.
- U4: On a laptop, a user drags with the mouse and moves it far below the track. The drag continues until they release the button, as today.

## Requirements

### Functional

- FR1: Once a drag has started (a mouse or pen press on a track, or a finger that has moved horizontally along it), every pointer move until release selects the time at the pointer's horizontal position. The pointer's vertical position does not matter, and a position past either end is clamped to the start of the reference day or the track end, as today. The drag ends at release, or when the browser cancels the pointer.
- FR2: While a drag is active, the page does not scroll, whatever the direction of the pointer's moves. A touch gesture that is not a drag (a vertical swipe before any horizontal move, as today) still scrolls the page and selects nothing.
- FR3: During a drag, the dragged handle stands at the pointer's position along its track, clamped to the track, and not at the rounded track step. When the drag ends, the handle stands at the effective instant again. The selected moment, every card's time and the slider value keep the rounding to the track step.
- FR4: On an engine without Pointer Events, a finger drag on a track works as FR1–FR3 say. It starts once the finger has moved horizontally along the track. A mostly vertical swipe scrolls the page and selects nothing. A tap selects through the click as today, and a drag adds no extra selection when the finger lifts.
- FR5: Every other behaviour of the day track stays as it is: a mouse or pen selects on press, a touch tap selects on lift, and a click adds nothing on engines with Pointer Events. Rounding, the clamp to the track end, the keys, the hour labels, the colours and the layout do not change.

### Non-Functional

#### Performance

- NFR-P1: A drag move whose position rounds to the track step that is already pinned re-presents no row. The rows stay the same objects, and no date, time or region name formatter is built. The work bounds of "Time selection is fast" still pass.

#### Accessibility

- NFR-A1: During and after a drag, the slider keeps its role, accessible name and value range. Its value (`aria-valuenow`) and value text are those of the selected track step, not of the pointer position. The page with tracks has no axe-core violations after a drag, in the light and dark themes.

#### Responsive

- NFR-R1: A finger drag behaves as FR1–FR3 say on a phone screen 375 px wide (the viewport the scenario sets, in the `mobile-chrome` project, Pixel 5). A mouse drag behaves the same on a desktop screen (`chromium` project). The dragged handle stays under the pointer at 375 px and 1024 px wide.

## UX Acceptance Criteria

- UX1: A finger that grabs the handle and drifts off the track, up or down, keeps moving the handle until it lifts. The page does not move under it.
- UX2: The dragged handle moves continuously with the finger. On release it settles on the selected quarter hour, at most half a track step away.
- UX3: On iOS 12 a finger drag feels like it does on newer systems. Taps there work as they did before this change.

## UI States Matrix

The change adds no data loading. The existing states stay as they are:

| Network | Data | UI |
|---|---|---|
| offline or online | locations with known zones | tracks drag as specified here; nothing needs the network |
| offline or online | empty list | only the Here entry's track, which drags the same way |
| offline or online | a zone the browser does not know | that row has no track; the others are unaffected |
| offline or online | stored list unreadable | the existing error state; no track |

## Behavior

Feature files are in `packages/client/src/test/features/time_selection/` and tagged `@fix-day-track-drag-continuity-and-smoothness`:

- `time_selection_drag_unit.feature` (unit BDD): the drag continues off the track and past its ends, the handle follows the pointer and settles at release, the drag without Pointer Events, and a move inside one track step (FR1, FR3, FR4, NFR-P1, UX1–UX3).
- `time_selection_drag_e2e.feature` (playwright-bdd): mouse and finger drags that leave the track with no page scroll, the handle under the pointer, the drag without Pointer Events, and slider values with axe-core after a drag (FR1–FR4, NFR-A1, NFR-R1, UX1–UX3).
- The existing `time_selection_e2e.feature`, `time_selection_touch_e2e.feature`, `time_selection_legacy_tap.feature` and `time_selection_legacy_touch_e2e.feature` keep passing with no change to their expected values (FR5).

## Visual Reference

No new screens. The handle keeps its look from `docs/design/screens/phone-light.png`. Design tokens stay the source of truth.

## Affected IA

No changes.

## Success Metrics

- M1: 5 of 5 E2E drag scenarios pass: a mouse leaving the track, a finger leaving the track, a finger past the right end, a finger without Pointer Events leaving the track, and a vertical swipe without Pointer Events. In each drag scenario, the selected time is the one at the release position, and `scrollY` stays 0 from the start of the gesture to its end.
- M2: During a drag, the centre of the visible handle is within 1 px of the pointer's horizontal position at 3 of 3 positions that are not on a track step. After release, it is within 1 px of the selected step's position.
- M3: 0 changes to the expected values of existing time-selection scenarios. `git diff` on the existing `.feature` files of `time_selection/` shows only added tag lines.
- M4: Stryker scoped to the changed `views/shared/` files scores at least 95% (minimum acceptable 90%).
- M5: The traceability loop of task 6.1 prints nothing. Each of FR1–FR5, NFR-P1, NFR-A1, NFR-R1 and UX1–UX3 has at least one test tagged with this change.

## Open Questions

None. Real devices (iOS 12 and a newer iOS) are checked once by the operator, as handoff item H2. If the drag cannot work on iOS 12 as FR4 says, iOS 12 keeps today's tap-only behaviour, as the owner allows (Why, item 3), and H2 names how to fall back.
