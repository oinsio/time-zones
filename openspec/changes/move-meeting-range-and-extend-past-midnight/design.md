# Design: move-meeting-range-and-extend-past-midnight

## Context

The motivation is in proposal.md → Why. The behaviour is in the spec deltas: `meeting-range` and `grid-view`.

ADRs that bind this change, all read for it:
- ADR-0002: model, presenter, controller, views. Rules of the range live in the model; the views only translate gestures into commands.
- ADR-0003: absolute instants; `compatible` disambiguation of wall-clock times.
- ADR-0004: the meeting range is never stored.
- ADR-0007: the reference zone and the reference day.
- ADR-0008: work bounds, never timings, in tests (NFR-P1).
- ADR-0009: iOS Safari 12 has no Pointer Events; `useMeetingHandleDrag` has a touch fallback for it.
- ADR-0011 and ADR-0013: the meeting range inside the reference day, at any minute.

One global decision changes. ADR-0011 says the range lies inside the reference day and rejects "a range across days" because it needs a multi-day grid. FR1 and FR6 lift that with a bounded tail instead of a multi-day grid, and FR14 adds a way to change the range that every future view must offer. That is a decision beyond this change, so it gets a new ADR that refines ADR-0011 (D12).

Owners of the concepts this change touches (`docs/glossary/time-selection.md`):
- **Meeting range**: `MeetingRange`, `isValidMeetingRange`, `getMeetingHandleLimits`, `getMeetingRangeAfterHandleMove`, `getMeetingRangeAtHandleMinutes`, `moveMeetingRangeToDay` in `model/meetingRange.ts`; `reduceSetMeetingRange`, `followMeetingRange` in `model/reduceMeetingRange.ts`; `reduceMeetingRangeWallTimes.ts`; `useMeetingRange`.
- **Reference day**: `ReferenceDay`, `getReferenceDay`. **Hour cell** / **hour strip**: `HourCell`, `getHourCells`, `getHourCellCount` in `model/hourCells.ts`; `presentHourStrip`; `HourStrip`, `useHourGrid`, `useHourStripScroll`, `HourGridCssVariable`.
- **Track step** / **track move**: `TRACK_STEP_MINUTES`, `TrackMove`, `getMinutesAfterTrackStep`.
- **Meeting frame**: `MeetingFrame`. **Meeting handle**: `MeetingHandle` (model enum), `MeetingHandleSlider`, `useMeetingHandleDrag`, `getMeetingHandleRow`, `useVisibleStripRows`.
- **Meeting bar**: `MeetingBar`, `presentMeetingBar`, `useMeetingBar`; the header of `MainPage`.
- **Meeting range input**: `confirmMeetingRangeInput`, `MeetingRangeInput`.
- **Grab area** gesture constants: `REORDER_POINTER_ACTIVATION_DISTANCE_PX`, `REORDER_TOUCH_ACTIVATION_DELAY_MS`, `REORDER_TOUCH_ACTIVATION_TOLERANCE_PX`.

Every decision below extends one of these owners or adds an owner for a new glossary term (strip tail, meeting move, move handle).

## Goals / Non-Goals

**Goals:** each of FR1–FR20 has one owner in the right layer; one drag core serves the two handles and the move; the sizes of the new elements come from the existing ones (G5).

**Non-Goals:** a multi-day grid; changing how a range is stored (it is not); changing the Cards view.

## Decision

### D1. Invariants and limits (FR1, FR2, FR4, FR11)

In `model/meetingRange.ts`: a constant `MEETING_RANGE_MAX_MINUTES` (24 hours) in `constants/meeting.ts`. `isValidMeetingRange` checks `start < end`, whole minutes, the start inside its reference day and `end − start ≤ MEETING_RANGE_MAX_MINUTES`; it no longer compares the end with the end of the day. `getMeetingHandleLimits` returns, in minutes from the start of the reference day, values that may exceed the day's length for the end handle:

```
start: min = max(0, endMinutes − MAX),            max = min(endMinutes − minLength, lastTrackStepOfDay)
end:   min = startMinutes + minLength,            max = startMinutes + MAX
```

`TrackMove.DAY_START` / `DAY_END` keep their names in the day track, where they mean the day's ends; for a meeting handle they resolve to `limits.minMinutes` / `limits.maxMinutes` ("earliest" / "latest" in the specs). No second enum.

### D2. Wall-clock times (FR3, FR10)

`reduceMeetingRangeWallTimes` drops the `MEETING_END_BEFORE_START` branch: the end on the next date is valid whenever D1 allows it, and with a 24-hour limit it always is. The error code, the controller outcome and the locale key `rangeInputEndBeforeStartError` are removed; `rangeInputOutsideDayError` gets the new wording. The check "the start lies inside the reference day shown now" stays and still gives `INVALID_MEETING_RANGE`.

### D3. The move is a model rule with one command (FR14, FR20)

`getMeetingRangeAfterMove(range, referenceDay, move)` and `getMeetingRangeAtStartMinutes(range, referenceDay, minutes)` in a new `model/meetingRangeMove.ts` (the file `meetingRange.ts` is near its size limit). Both compute the new start through `getMinutesAfterTrackStep` (the owner of "next or previous track step"), clamp it to `[0, lastTrackStepOfDay]` and add the unchanged length in absolute time. A new command `MOVE_MEETING_RANGE` in `reduceMeetingRange.ts` applies it and pins the reference moment, like `reduceSetMeetingRange`. `useMeetingRange` exposes `moveMeeting(move)` and `moveMeetingToStartMinutes(minutes)`.

The length is kept in absolute minutes, so a move across a clock change keeps the duration, not the wall-clock end.

### D4. The strip tail is more cells of the same kind (FR6–FR8)

`model/hourCells.ts` gains `getStripTailCellCount(meetingRange, referenceDay)`: zero without a range; otherwise the index of the last cell the range overlaps, plus two, minus the cell count of the day, clamped to `[0, cells of the next reference day]`. `getHourCells` takes that count and appends the first cells of the next reference day, computed by the same code path as today's cells, so labels, colours, offset edges and day periods need no second implementation. The midnight rule changes in one place: "the reference zone's row has no midnight cell" becomes "column 0 of the reference zone's row is a plain cell".

`useHourGrid` (controller) returns `cellCount` as the cell count of the day plus the tail; today it returns `getHourCellCount(day)`. Nothing else changes in the width rule: `useHourStripScroll` already passes `cellCount` to `getHourCellLayout` (`views/grid/hourCellLayout.ts`, the owner of `MIN_FITTING_HOUR_CELL_PX` / `HOUR_CELL_SCROLL_WIDTH_PX`) and writes `HourGridCssVariable.CELL_COUNT` and `CELL_PITCH`. The frame and the handles already place themselves by minutes × pitch, so they follow.

Presentation is incremental (NFR-P1): `presentHourStrip` keeps the cells of the reference day by identity when only the tail count changes.

### D5. One drag core for the handles and the move (FR15–FR17, FR19)

`useMeetingHandleDrag` already turns "minutes at the press + pointer travel ÷ pitch, strips' scroll included" into a target, scrolls the strips near the edges (`MEETING_HANDLE_AUTO_SCROLL_EDGE_PX`), suppresses the click after a release (`MEETING_HANDLE_RELEASE_CLICK_WINDOW_MS`) and has the touch fallback. Its core is extracted to `views/grid/useMeetingRangeDrag.ts` with the target as a parameter (start, end or the whole range); `useMeetingHandleDrag` and the new `useMeetingFrameMove` are thin callers. No second copy of the travel, scroll and release rules.

**Re-anchoring.** When the pitch or the tail changes during a drag (a growing tail shrinks the cells on a wide screen), the core re-bases: the minutes at "the press" become the current target and the press point becomes the current pointer. The dragged end therefore does not jump at that moment ("Handle drag scrolls the strips").

### D6. Gestures inside the frame (FR15, FR16)

`useMeetingFrameMove` listens on the hour strips, like `useHourCellSelection`, and decides by the pointer's column whether a press is inside the frame:
- mouse or pen: a movement of `REORDER_POINTER_ACTIVATION_DISTANCE_PX` starts a move; without it the release is a click and `useHourCellSelection` handles the tap as today;
- finger: `REORDER_TOUCH_ACTIVATION_DELAY_MS` within `REORDER_TOUCH_ACTIVATION_TOLERANCE_PX` starts a move; earlier movement is left to native scrolling.

The reorder constants are reused because the owner asked for "the same gesture as the cards"; one value for both. `useHourCellSelection` gets one new guard: a mouse or pen press inside the frame does not begin a cell drag. The hold disables text selection and the iOS callout on the strips with the classes the grab area already uses.

The frame itself keeps `pointer-events: none` on its border; the cells under it receive the events, so nothing new can block a row control.

### D7. The move handle is a third meeting handle (FR17, FR18, UX1)

`MeetingHandle` (model enum) gains `MOVE`. `MeetingHandleSlider` renders it with the grip turned (`h-3 w-9` instead of `h-9 w-3`), a hit area of 48 × 44 px, the name `meeting.moveHandle`, and `presenter/meetingHandles.ts` gives its slider values (value = start minutes, max = last track step of the day, value text = the span). Its keys map `TrackMove` to `moveMeeting`. It is rendered as the last handle element of the panel, so it is the Tab stop after the end handle.

### D8. Placing the move handle (FR17, UX2, NFR-P1)

The grid panel scrolls horizontally, so it clips whatever leaves it; a handle that must lie over the meeting bar cannot be positioned inside the panel's box. The move handle is therefore `position: fixed`, still a DOM child of the panel (Tab order, D7), and placed by a pure function:

```
getMoveHandleCentre(frameRect, frameBorderPx, meetingBarRect):
  x = frameRect.left + frameRect.width / 2
  y = max(frameRect.top + frameBorderPx / 2, meetingBarRect.bottom − barLinePx / 2)
```

in `views/grid/moveHandlePlacement.ts`. `useMoveHandlePlacement` measures the two rectangles on page scroll, strip scroll, resize and a change of the range, at most once per animation frame — the pattern of `useVisibleStripRows` — and writes the centre to CSS variables on the handle, so a scroll re-renders nothing.

With today's sizes (bar 85 px, panel border 1 px, frame inset 4 px, frame line 3 px) the two axes are 7 px apart and the resting handle ends 0.5 px above the first row header: the numbers of `docs/design/proposals/meeting-range/move-meeting.md`. They are consequences, not constants: the code holds only the grip size.

Risk: an ancestor with a transform would make `fixed` relative to it. The sortable list applies transforms to rows, not to the panel; the E2E position scenarios (M5) guard this.

### D9. The sticky meeting bar (FR12, FR13, NFR-A3, NFR-R2)

`MainPage` gives its header `sticky top-0` and the page-bar layer (`z-page-bar`, the layer of the date bar) while it shows the meeting bar. A new `MEETING_BAR_SELECTOR` beside `DATE_BAR_SELECTOR` lets `useVisibleStripRows` treat the bar's bottom as the top of the visible area (FR13) and `useMoveHandlePlacement` read its rectangle.

Focus under the bar (NFR-A3): while the bar is sticky, the scrolling element gets `scroll-padding-top` equal to the bar's measured height, so the browser's own focus scrolling stops below it. This is layout state of the page, so it stays out of the controller: `useMeetingRange`/`useMeetingBar` only decide whether there is a bar. One effect in `MainPage` (`src/app/`), the component that owns the header, measures the header with the `ResizeObserver` pattern of `useHourStripScroll`. It sets the padding while `meetingBar` is given and clears it when it is not.

### D10. Taps and drags on the tail (FR9)

`useHourCellSelection` ignores a press that starts on a tail cell and, during a cell drag, freezes the tail count of the press (a view-state override passed to `useHourGrid`), so cells never disappear under the pointer. The freeze ends with the drag.

### D11. The lifted look (FR19, UX3)

`MeetingFrame` and the move handle take a `data-moving` attribute from the drag core; the shadow is a new token beside the reorder lift shadow in `tokens.css`. No trace of the previous position (NG5).

### D12. A new ADR refines ADR-0011

`docs/adr/0019-meeting-range-past-the-reference-day-and-moved-whole.md`, in the format of `.claude/rules/adr.md`: the start inside the reference day, the 24-hour limit, the strip tail as the bounded alternative to a multi-day grid, the move as a command every view with a meeting range offers, and the rejected alternatives of this design. ADR-0011 gets a "Refined by ADR-0019" line under its status, as it already has one for ADR-0013, and the ADR list of `CLAUDE.md` gains "0019 meeting range past the reference day".

This design does not settle the global decision; the ADR does. The implement stage may not write `docs/adr/` or `CLAUDE.md`, so it writes the three edits as a patch (handoff H1, `tasks.md`). The ADR is `Accepted` in the patch, because the owner applies the patch to the branch before the merge, and that application is the acceptance. Until then the code on the branch and ADR-0011 disagree, and the pull request names that. The ADR table of `docs/architecture/overview.md` is an architecture doc, so it is an ordinary task, not part of the patch.

### D13. Where each test lives

- Unit (Vitest, TDD): `meetingRange`, `meetingRangeMove`, both reducers, `hourCells` (tail count and cells), `moveHandlePlacement`, `meetingHandles` presenter.
- Unit BDD: the model scenarios of `meeting-range`; the tail cells, typed messages, gestures that need no real layout, the moving state of the rows and the work bounds of `grid-view`.
- BDD E2E (`bdd-unit.md`: keyboard, aria and focus need a real browser): the slider values, keys and Tab order of all three handles, as the start and end handle sliders already are in `grid_view_meeting_handles_e2e.feature`; the sticky bar, handle positions at scroll offsets, real mouse and touch gestures, focus not obscured, axe-core, widths, screenshots.

## Consequences

Positive:
- An evening meeting in the reference zone can be planned at last, and the model loses a refusal that users met as an error (FR3).
- The tail reuses the hour cell code path: no second kind of cell, no multi-day grid.
- One drag core for three targets: the travel, auto-scroll, release and legacy-touch rules stay in one place.
- The move has a keyboard and screen-reader path from the first build (NFR-A1).
- Share meeting and Clear meeting are always in reach.

Negative:
- The cell count is no longer a property of the reference day alone; every reader of `getHourCellCount` must take the tail into account. Mitigation: the count comes from one function, and the width scenarios cover 24 to 27 cells.
- On a wide screen the cells shrink when a tail appears, also during a drag. Mitigation: re-anchoring (D5) keeps the dragged end still; the shrink is at most 24 ÷ 25 per added cell.
- A range that touches the last hour of the day already shows one tail cell, so the layout changes for 23:00–24:00 meetings too. Accepted: without the spare cell the end handle could not be dragged past midnight.
- The sticky bar takes 85 px of a short viewport. Mitigation: NFR-R2 keeps one full row visible at 844 × 390 px.
- A `fixed` handle depends on no transformed ancestor (D8). Guarded by E2E.
- A typed `12:00`–`10:00` now sets a 22-hour meeting instead of an error. Accepted with the owner: only equal times stay an error.

## Migration Plan

No stored data. The locale key `rangeInputEndBeforeStartError` and the error code are removed in the same commit as their last use. Rollback: revert the change.

## Alternatives Considered

**A sliding 24-hour window from any hour**: breaks the reference day, on which the cards, the day tracks and the date bar rest.

**Typed input only, the frame clipped at the edge of the day**: the end of the range and its handle are out of sight.

**A tail of a fixed length, always shown**: 25 or more cells on every screen for a rare case; shrinks every cell on wide screens for nothing.

**A third handle on a grid row**: on a phone an hour is about 40 px wide, and the start and end handles already need two rows not to collide.

**A tab with a grip icon above the frame**: built as a mock-up and rejected by the owner — it looked detached from the frame.

**The move handle on the bottom line of the frame when the top is out of view**: in the middle of a long list neither line is visible, so there is no handle.

**A sticky top line of the frame drawn over the rows**: the handle covers the texts of whichever row is under it.

**Two move handle elements, one in the panel and one in the meeting bar**: two sliders for one concept, and the focus is lost at the swap.

**A portal for the move handle**: breaks the Tab order after the end handle.

**A separate drag hook for the move**: a copy of the travel, auto-scroll and release rules of `useMeetingHandleDrag`.

**New gesture constants for the hold**: a second owner of "how long a finger holds before a drag"; the reorder constants already say it.

## Open Questions

- The exact shadow of the lifted frame is chosen against the approved screenshots; it does not change the specs.
