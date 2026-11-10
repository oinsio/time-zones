# Design: refine-meeting-range-entry-and-handles

## Context

The motivation is in proposal.md → Why. The behaviour is in the spec deltas: `meeting-range`, `grid-view` and `time-selection`.

The change follows these ADRs, all read for this change:
- ADR-0002: model, presenter, controller, views. The reducer returns typed errors, and the presenter alone formats text.
- ADR-0003: absolute instants, and `compatible` disambiguation of wall-clock times.
- ADR-0004: the meeting range is never written to storage.
- ADR-0007: the reference zone and the reference day.
- ADR-0008: work bounds, never timings, in tests.
- ADR-0009: iOS Safari 12 has no Pointer Events. `IS_POINTER_EVENTS_SUPPORTED` and the touch fallback in `useMeetingHandleDrag.ts` exist for it.
- ADR-0011: the meeting range.

One global decision changes. ADR-0011 says "Both ends lie on the 15-minute track step of the reference day … The shortest range is one step". FR1 drops that for the range itself and keeps the step only for the handles. This is a decision for every future view, so it gets a new ADR-0013 that refines ADR-0011 (D9). The factory may not write `docs/adr/`, so ADR-0013 is handoff H1.

Owners of the concepts this change touches, from `docs/glossary/time-selection.md`:
- **Meeting range**: `MeetingRange` and its rules in `model/meetingRange.ts`, `SET_MEETING_RANGE_WALL_TIMES`, `useMeetingRange`.
- **Meeting handle**: `MeetingHandle`, `getMeetingRangeAfterHandleMove`, `MeetingHandleSlider`. Their row rule lives in `views/grid/meetingHandleRow.ts`.
- **Meeting range input**: `confirmMeetingRangeInput`, `MeetingRangeInput`.
- **Wall-time input**: `parseWallTimeInput` in `presenter/parseWallTimeInput.ts`, `WallTimeInput`.
- **Hour cell** tap: `useHourCellSelection`.

Every decision below extends one of these owners. None adds a second owner.

## Goals / Non-Goals

**Goals:** each of FR1–FR8 has one owner in the right layer. The four reported symptoms are covered by tests that fail on the current code.

**Non-Goals:** no new component library, no masking dependency (NG6), no change to the stored document.

## Decision

### D1. The invariants allow any minute; handles land on the step (FR1, FR4, FR5)

Changes in `model/meetingRange.ts`:

- `isValidMeetingRange`: `isOnTrackStep` becomes `isOnWholeMinute`, the minutes from the day's start being an integer (`MILLISECONDS_PER_MINUTE` from `@/constants`). The other conditions stay. `reduceSetMeetingRange` keeps calling it, so every path (tap, drag, handles, typed times, date change) keeps one rule.
- `getMeetingHandleLimits`: the minimum length is `Math.min(TRACK_STEP_MINUTES, endMinutes - startMinutes)` instead of `TRACK_STEP_MINUTES`. A range that is already shorter than one step keeps valid limits (`min ≤ value ≤ max`), and a handle can only lengthen it.
- `getMeetingRangeAfterHandleMove`: `NEXT_STEP` becomes `(Math.floor(current / step) + 1) * step` and `PREVIOUS_STEP` becomes `(Math.ceil(current / step) - 1) * step`. These are new private helpers `getNextTrackStep` and `getPreviousTrackStep` in the same file. On-step values move by exactly one step, as before. Hour moves stay `± TRACK_HOUR_MOVE_MINUTES`, and the day start and end are unchanged.
- `getMeetingRangeAtHandleMinutes`: unchanged; it already rounds to the nearest step.
- `moveMeetingRangeToDay`: the floor to the step is removed, and the start is the instant it is given. That instant is the reference moment `reduceReferenceMoment.ts` resolves from the start's wall-clock time, so the date-change rule already in the spec ("keeps its wall-clock time") holds for off-step starts.

**Alternative rejected:** keep the step in the model and round typed times to it. That would silently change what the user typed, which is the defect reported.

### D2. Wall-clock refusals are typed model errors (FR2)

`LocationErrorCode` in `model/locationCommands.ts` gains `MEETING_START_EQUALS_END` and `MEETING_END_BEFORE_START`. `reduceMeetingRangeWallTimes.ts` checks, after the existing time, date and location checks:

1. `Temporal.PlainTime.compare(startTime, endTime) === 0` → `MEETING_START_EQUALS_END`.
2. It resolves the start, and the end on the same date or, when the end time is earlier, on the next date. This is today's code with `<= 0` becoming the wall-clock `< 0`, because equal times are already refused.
3. If the range is outside the shown reference day: the end time earlier than the start time and the start inside the day → `MEETING_END_BEFORE_START`; otherwise `INVALID_MEETING_RANGE`.
4. Otherwise → `reduceSetMeetingRange`, as now.

"Inside the day" reuses the day `isInShownDay` already computes, split into a start check and an end check. The rule stays in the model and is not split between model and controller (`.claude/rules/glossary.md`, "Smeared logic").

**Alternative rejected:** the controller compares the two parsed texts. That would be a second owner of the meeting range rules.

### D3. Controller outcomes and messages (FR3, UX3)

In `controller/useMeetingRange.ts`, `MeetingRangeInputOutcome.INVALID_RANGE` is replaced by three outcomes: `SAME_START_AND_END`, `END_BEFORE_START` and `OUTSIDE_REFERENCE_DAY`. `confirmMeetingRangeInput` maps the three model errors one to one through a `Record<…>` constant. Every other result stays `CLOSED`.

`MeetingRangeInput.tsx` marks both fields invalid for any of the three outcomes and picks the message key through a `Record<MeetingRangeInputOutcome, string>`. The i18n keys in `ru.json` and `en.json`:
- new `meeting.rangeInputSameTimesError`: «Начало и окончание встречи совпадают» / "The meeting start and end are the same";
- new `meeting.rangeInputEndBeforeStartError`: «Окончание встречи должно быть позже начала» / "The meeting must end after it starts";
- `meeting.rangeInputError` is renamed `meeting.rangeInputOutsideDayError`: «Встреча должна быть внутри дня» / "The meeting must lie within the day".

The old text with «шагом 15 минут» disappears from both locale files.

### D4. The separator is a presenter rule applied by a shared view helper (FR6, UX1)

- **The rule.** The text form of a typed time belongs to the presenter, beside `parseWallTimeInput`. New `presenter/formatTypedWallTimeText.ts` exports a pure `formatTypedWallTimeText(text: string): string`. It returns the text unchanged unless the text is digits only (`/^\d+$/`). Then it finds the hour length: 1 when the first digit is 3–9, or 2 followed by 4–9; otherwise 2. When the text is longer than the hour, it returns hour + `:` + the rest. The `:` is a new constant `WALL_TIME_SEPARATOR` in `constants/timeSelection.ts`, the digit limits are named constants there too, and the function is exported through `presenter/index.ts`.
- **When to apply it.** That is a DOM question, so it lives in `views/shared`. New `views/shared/typedTimeFieldText.ts` exports `getTypedTimeFieldText(event: ChangeEvent<HTMLInputElement>, previousText: string): string`. It applies `formatTypedWallTimeText` only when both hold:
  - the edit is an insertion: `nativeEvent.inputType` starts with `insert`, or, on an engine without `inputType`, the new text is not a shorter prefix of the previous one;
  - `selectionEnd === value.length`.

  Otherwise it returns the raw value.
- **Where it is used.** `WallTimeInput` and both fields of `MeetingRangeInput` call it in `onChange`. The controlled value then ends with the caret at the end, which is where the typed character was. The open-time text and its selection are unchanged.

Best practice that was weighed:
- Segmented hour and minute spinbuttons (React Aria `TimeField`) need a dependency or a new component, and they change the accepted texts and the 12-hour typing (NG3, NG6).
- `type="time"` is ruled out by the existing spec, and its format follows the system.
- A mask library (Cleave.js, IMask) is a dependency for one rule.

An insert-only, digits-only mask keeps every accepted and rejected text of `time-selection` as it is. It needs no `:` key, so the numeric keyboard stays. It never reformats an edit the user is making inside the text.

### D5. Handles stand on the visible rows (FR7, NFR-P1, NFR-R1)

- **The row rule.** `getMeetingHandleRow(handle, candidateRows)` in `views/grid/meetingHandleRow.ts` takes `{ firstRow, lastRow }` (1-based, inclusive) instead of a row count. The end handle stands on `firstRow + ⌈k / 2⌉ - 1` and the start handle on `min(end + 1, lastRow)`, where `k = lastRow - firstRow + 1`. With `{ 1, n }` this is today's rule.
- **The measurement.** New `views/grid/useVisibleStripRows.ts` takes the panel ref, the row count and `isFrozen`, and returns the candidate rows. It reads every `[data-hour-strip]` rect and the date bar's top. The date bar is found through the new `data-date-bar` attribute on the sticky bottom element of `app/MainPage.tsx` that holds it, by the constant `DATE_BAR_SELECTOR` (`"[data-date-bar]"`) in `constants/date.ts`, beside the other date bar constants; without a date bar, `window.innerHeight` is used. The E2E steps locate the date bar by the same constant, and the local `DATE_BAR_SELECTOR = "footer"` of `grid_view_layers_e2e.steps.ts` gives way to it. The candidates are the contiguous run of strips whose centred handle box fits: `centre - MEETING_HANDLE_HEIGHT_PX / 2 >= 0` and `centre + MEETING_HANDLE_HEIGHT_PX / 2 <= barTop`, where `centre` is the middle of the strip's rect. The handle (48 px, `h-12`) is taller than a strip (44 px below `md`, 38 px from `md`, `HourCellView.tsx`), so the strip box alone would let a handle reach above the viewport or under the date bar. `MEETING_HANDLE_HEIGHT_PX` (48) is a new constant in `constants/meeting.ts` beside the handle's other sizes, and `MeetingHandle.test.tsx` pins that the `<li>` keeps `h-12`. With no candidate, they are `{ 1, rowCount }`.
- **When it measures.** On mount, on `window` `scroll` (passive) and `resize`, and through a `ResizeObserver` on the panel, as `MeetingHandle.tsx` already uses. At most one `requestAnimationFrame` is pending at a time. It calls `setState` only when `firstRow` or `lastRow` changed (NFR-P1). While `isFrozen`, it keeps the last value.
- **Wiring.** `GridView.tsx` calls the hook once and passes the candidates to both `MeetingHandleSlider`s in place of `rowCount`. A slider reports a drag's start and end through a new `onDragActiveChange`, and `GridView` keeps that boolean as view state and passes it as `isFrozen`.

**Alternative rejected:** `position: sticky` handles. The handle must stand over a strip, so the frame edge is readable, and sticky does not follow a horizontal scroll container's children vertically.

### D6. A 44 × 44 px hit area with the same grip (FR8, NFR-A2, UX2)

The handle `<li>` in `MeetingHandle.tsx` grows from `h-12 w-6` to `h-12 w-11` (48 × 44 px), still `-translate-x-1/2` on the edge. The grip `<span className="h-9 w-3 …">` is unchanged. A press 16 px beside the grip's centre now lands on the handle (22 px half width), where it used to land on the hour cell (12 px half width). That is the first cause in proposal.md → Why.

### D7. The drag keeps the grab offset (FR8)

`useMeetingHandleDrag` gains the option `valueMinutes`: the handle's current minutes, passed by `MeetingHandleSlider` from `presented.valueMinutes`. On press it records `pressMinutes = valueMinutes` and `pressOffsetPx = clientX - strip.left`. `applyPointer` then sends `pressMinutes + (clientX - strip.left - pressOffsetPx) / cellPitchPx * MINUTES_PER_HOUR`. The strip rect carries the scroll, so auto-scroll still moves the end, and the handle keeps its press offset from the pointer while the strips scroll. That is why the `grid-view` delta also modifies "Handle drag scrolls the strips": its old wording ("stays the track step under the pointer") would contradict the grab offset of a press up to 22 px from the grip's centre. The press itself sends nothing, so a press and release changes nothing.

### D8. A handle release is never a tap (FR8)

- **Pointer path.** `endDrag`, called from `onPointerUp` and from the fallback's `touchend`, arms a one-shot `click` listener on `window` in the capture phase. The listener calls `stopPropagation()` and `preventDefault()`, so the click that ends the gesture never reaches an hour cell's `onClick` (`useHourCellSelection.onCellClick`), whatever element the engine targets. The listener is removed after `MEETING_HANDLE_RELEASE_CLICK_WINDOW_MS` (50 ms, `constants/meeting.ts`) if no click came, and on unmount.
- **Touch fallback** (no Pointer Events). `touchend` also calls `preventDefault()` when `cancelable`, so iOS Safari 12 synthesizes no mouse events and no click at the finger's end position. The listener is registered with the existing `TRACK_TOUCH_MOVE_LISTENER_OPTIONS` (`passive: false`).
- **Where the rule lives.** Only in the handle's drag hook. `useHourCellSelection` does not learn about handles.

**Alternative rejected:** `stopPropagation` on the handle's `pointerup`. The click is a separate event, and it targets the hour cell on the affected engines.

### D9. ADR-0013 refines ADR-0011 (handoff H1)

Patch `H1-adr-0013-meeting-range-any-minute.patch` adds `docs/adr/0013-meeting-range-at-any-minute.md` in the format of `.claude/rules/adr.md`:
- **Status:** "Accepted (<date applied>)" and "Refines [ADR-0011](0011-meeting-range-in-grid-view.md)".
- **Context:** typed meetings at any minute, task #114.
- **Decision:** both ends of a meeting range lie on any whole minute inside the reference day; the shortest range is one minute. The meeting handles, the hour-cell tap and drag, and the strip keys still move on the 15-minute track step and whole hours, and a handle never shortens a range below one track step, or below its length when that is already shorter. A date change keeps the start's wall-clock time.
- **Consequences**, and **Alternatives:** rounding typed times to the step; a configurable step.

The patch touches `docs/adr/0011-meeting-range-in-grid-view.md` only on its Status line ("Refined by ADR-0013: the ends lie on any minute; the handles keep the track step"). It also adds 0013 to the ADR list in `CLAUDE.md`. Its Decision is not edited (`.claude/rules/adr.md`: "Never edit an accepted ADR to change the decision").

The number is 0013, not 0012. `docs/architecture/overview.md` and `views.md` already link an ADR-0012 (user-chosen view), and the archived `add-grid-meeting-range-and-share` planned a second ADR-0012 (capability-scoped contract scenarios). Neither file is in `docs/adr/` today. The README of H1 asks the human to renumber if those land differently.

### D10. Where each test lives

| What | Test | Why there |
|---|---|---|
| D1, D2 | Vitest `model/meetingRange.test.ts`, `model/reduceMeetingRangeWallTimes.test.ts`, `model/referenceMoment.test.ts` (date change of an off-step range); new unit BDD `meeting_range/meeting_range_any_minute.feature` | pure model |
| D3 | Vitest `controller/useMeetingRange.input.test.tsx`, `views/shared/MeetingRangeInput.test.tsx`; unit BDD `grid_view_meeting_range_input_unit.feature` | jsdom renders text and `aria-*` values |
| D4 | Vitest `presenter/formatTypedWallTimeText.test.ts`, `views/shared/typedTimeFieldText.test.ts`, `WallTimeInput.test.tsx`; unit BDD `time_selection/time_selection_time_separator_unit.feature` (user-event typing); E2E `time_selection_time_separator_e2e.feature` (real keyboard, caret) | caret and real key input need a browser |
| D5 | Vitest `meetingHandleRow.test.ts`, `useVisibleStripRows.test.tsx` (stubbed rects and `requestAnimationFrame`); E2E `grid_view_meeting_handle_reach_e2e.feature` | real layout and scrolling |
| D6–D8 | Vitest `useMeetingHandleDrag.test.tsx`, `MeetingHandle.test.tsx`; E2E `grid_view_meeting_handle_reach_e2e.feature`, and the auto-scroll scenarios of `grid_view_meeting_handles_e2e.feature` (grab offset while the strips scroll) | real hit testing and scrolling |

## Consequences

Positive:
- A meeting can be typed at any minute, and the reason for a refusal is named (FR1–FR3).
- Typed times read `HH:MM` with no `:` key (FR6).
- The handles stay in reach and keep the grab offset, and a release cannot reset the range (FR7, FR8).
- Every rule keeps its one owner: the invariants in `meetingRange.ts`, the refusals in `reduceMeetingRangeWallTimes.ts`, the separator in `formatTypedWallTimeText`, the row choice in `getMeetingHandleRow`.

Negative and risks:

- [The handle rows change at 844 × 390, where not all four sample rows may be fully visible] → the screenshot run of task 6.3 re-approves only the baselines that change for that reason, and H2 lists them for a human look.
- [A 44 px hit area of the start and end handles overlaps on one row with a meeting shorter than about one cell] → the end handle is rendered after the start handle and lies on top. The keyboard reaches both. With two or more candidate rows, the handles stand on different rows.
- [The 50 ms click window could swallow a real click] → no person clicks twice within 50 ms of releasing a drag, and the listener is one-shot.
- [`inputType` is missing on an old engine] → the prefix fallback of D4 treats a shorter prefix as a deletion. Any other change counts as an insertion and is masked only if it is digits alone.
- [Scroll measurement cost] → one pending animation frame and a state update only on a change (NFR-P1).

## Migration Plan

No stored data changes. Rollback is a revert of the code and the docs.

## Alternatives Considered

- **Round typed times to the track step** (D1): rejected. It silently changes what the user typed, which is the reported defect.
- **The controller compares the typed texts** (D2): rejected. That makes a second owner of the meeting range rules.
- **Segmented time fields, `type="time"`, or a mask library** (D4): rejected. They change accepted texts or add a dependency, and `type="time"` is forbidden by the `time-selection` spec.
- **Sticky handles** (D5): rejected. A handle must stand over a strip at the frame's edge.
- **Stopping propagation on `pointerup`** (D8): rejected. The click is a separate event and targets the hour cell.
