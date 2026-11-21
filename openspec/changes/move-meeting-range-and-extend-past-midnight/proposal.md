# Move the whole meeting range, let it run past midnight, keep the meeting bar in view

The design was discussed with the owner on 20–21 November 2026 and is recorded in `docs/design/proposals/meeting-range/meeting-past-midnight.md` (part 2) and `move-meeting.md` (part 3). This change builds both parts, because the move depends on the range past midnight: a moved range must be able to cross midnight. Part 1, `add-meeting-share-dialog`, has already landed and is archived. It modified other requirements of the same capabilities ("Share meeting from the meeting bar", "Share meeting text"), so it does not overlap with this change.

## Why

1. **A meeting cannot cross midnight of the reference zone.** The meeting range must lie inside the reference day (`isValidMeetingRange` in `packages/client/src/model/meetingRange.ts`; ADR-0011). A user in Belgrade cannot plan 23:00–02:00: the meeting range input answers «Окончание встречи должно быть позже начала». The limit holds for the reference zone only — in other rows the same range already crosses midnight — so it reads as a defect, and ADR-0011 names it as a known cost.
2. **A meeting of a fixed length cannot be moved.** To try another time the user drags two meeting handles in turn or types two times. On a call with a shared screen, where two people look for a time that suits both, that is slow, and showing is easier than saying when they share no fluent language.
3. **The meeting bar leaves the screen in a long list.** It scrolls away with the page, so Share meeting and Clear meeting are out of reach, and a handle on the top of the meeting frame would be out of reach too.

Audience: everyone who plans a meeting in the Grid view; evening meetings and long lists above all. No urgency from a regression: the owner asked for it as the next step of meeting planning.

## What Changes

- **MODIFIED** the **meeting range**: its start lies inside the reference day, its end may lie in the next day, and it is at most 24 hours long.
- **ADDED** the **strip tail**: hour cells of the next reference day that every hour strip shows while the meeting range reaches the last cell of the reference day or runs past it.
- **MODIFIED** typed meeting times: an end time earlier than the start time ends the range on the next date; the refusal `MEETING_END_BEFORE_START` and its message are removed.
- **MODIFIED** the **meeting handles**: the end handle goes past the end of the reference day; Home and End go to the earliest and the latest position.
- **MODIFIED** a date change with a meeting range: the length is kept, the end is no longer clamped.
- **ADDED** the **meeting move**: moving the whole meeting range without changing its length — by dragging the meeting frame, by a finger hold inside it, and by a third meeting handle, the **move handle**, which is also a slider for the keyboard.
- **MODIFIED** the **meeting bar**: it stays at the top of the viewport while a meeting range is set; the move handle rests on its bottom line once the top of the frame has scrolled under it.
- **MODIFIED** the rows on which the start and end handles stand: a row under the meeting bar is not a visible row.
- New glossary terms: strip tail, meeting move, move handle. Changed terms: meeting range, reference day, hour strip, hour cell, meeting handle, meeting frame, meeting bar, meeting range input.
- A new ADR refines ADR-0011: the range may end after the reference day and may be moved as a whole. The factory may not write `docs/adr/`, so the ADR reaches the branch as a patch that the owner applies before the merge (handoff H1 in `tasks.md`).

No stored data changes: the meeting range is never stored.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `meeting-range`: "Meeting range invariants", "Set and clear a meeting range", "Meeting handle moves", "Set a meeting range from wall-clock times"; "Commands that remove or move the meeting range" is replaced by "Commands that remove the meeting range or carry it to another date" (its clamping rule and scenario go); new "Move the whole meeting range".
- `grid-view`: "Hour cells of the reference day", "Midnight marker in the hour strip", "Hour strip width", "Tap or Enter sets a one-hour meeting range", "Drag across hour cells sets a meeting range", "Meeting frame and dimmed cells", "Meeting handles on the frame", "Meeting handles are sliders", "Handle drag scrolls the strips", "Meeting range input", "Approved screenshots of the meeting state"; new requirements for the sticky meeting bar, the move handle, the move gestures, the moving state, their work bounds and their screenshots.

## Goals

- **G1** A user sets a meeting range that starts on one date of the reference zone and ends on the next, by typing, by the end handle and by a drag across cells.
- **G2** A user moves a meeting range of a fixed length to another time in one gesture or one key press, and every row shows its time at each step.
- **G3** The meeting bar and a way to move the range are in reach at every scroll position of a long list.
- **G4** Everything a pointer can do with the range, the keyboard and a screen reader can do too.
- **G5** The build does not drift from the agreed screens: the sizes of the new elements are tied to the existing ones.

## Non-Goals

- **NG1** No meeting range longer than 24 hours.
- **NG2** No sliding window: the Grid view still shows the reference day, plus the strip tail when the range needs it.
- **NG3** A move never goes before the start of the reference day; the user changes the date for that.
- **NG4** No «‹ ›» buttons in the meeting bar.
- **NG5** No trace ("ghost") of the previous position while the range is moved.
- **NG6** A tap or a drag that starts on a tail cell does nothing: a range cannot be started in the strip tail.
- **NG7** Nothing changes in the Cards view, and the meeting range stays unstored.
- **NG8** The meeting share text does not change; that is `add-meeting-share-dialog`.

## Users & Scenarios

- **U1** Milan in Belgrade plans a three-hour release window from 23:00 to 02:00 with colleagues in Almaty. He types `23` and `2` in his row and sees the tail of the next day with the range in it.
- **U2** Daria shares her screen with a colleague abroad. The meeting must last two hours. She drags the frame by half an hour, the colleague looks at his row and says "yes".
- **U3** Oleg watches twelve locations on a phone. Scrolled to the bottom of the list, he still sees the meeting bar, moves the range by the handle on its line and shares.
- **U4** Anna uses the keyboard only. She tabs to «Сдвиг встречи» and presses Arrow Right until the range suits.

## Requirements

### Functional

#### A meeting range past midnight

- **FR1** The start of the meeting range lies inside the reference day; the end may lie after the end of that day; the range is at most 24 hours long and at least one minute.
- **FR2** Setting a range from instants accepts a range that ends after the reference day and refuses one longer than 24 hours.
- **FR3** Setting a range from wall-clock times ends it on the next date when the end time is earlier than the start time; that case is no longer refused. A start outside the reference day is still refused.
- **FR4** The end handle moves past the end of the reference day, up to 24 hours after the start; the start handle stays inside the reference day and keeps the range within 24 hours. Home and End go to the earliest and the latest position of a handle.
- **FR5** A date change keeps the start's wall-clock time and the exact length of the range; the end is not clamped.
- **FR6** While the meeting range overlaps the last cell of the reference day or runs past it, every hour strip shows the strip tail: the cells of the next reference day through the cell after the last one the range overlaps.
- **FR7** A tail cell is an hour cell in every respect — label, colour, midnight marker, offset edge, dimming — and the first tail cell of the reference zone's row is a midnight cell.
- **FR8** The strip width rule counts the tail cells: the cells shrink while the strip width divided by the cell count stays at least 32 px, otherwise the strips scroll.
- **FR9** A drag across cells that starts in the reference day may run onto the tail shown at the press, and the range it sets ends at most 24 hours after its start; a tap or a drag that starts on a tail cell changes nothing.
- **FR10** The meeting range input no longer shows «Окончание встречи должно быть позже начала»; for a start outside the reference day it shows «Начало встречи должно быть внутри дня» ("The meeting must start within the day").
- **FR11** A range past midnight does not change the date: the reference day, the date bar and the day shift marks follow the start.

#### The meeting bar in a long list

- **FR12** While a meeting range is set, the meeting bar stays at the top of the viewport when the page scrolls.
- **FR13** The start and end handles stand on rows that are fully visible below the meeting bar and above the date bar.

#### Moving the whole range

- **FR14** A move shifts the start and the end by the same amount and pins the reference moment to the new start. Moves: next and previous track step, an hour forward and back, the earliest and the latest position, and a pointer position. The start lands on the track step (an hour move keeps its minute) and stays inside the reference day.
- **FR15** A mouse or pen press on an hour cell inside the meeting frame, followed by a movement, moves the whole range; a press outside the frame sets a new range as before; a click without movement stays a tap.
- **FR16** A finger held for 250 ms on an hour cell inside the frame starts a move, on scrolling and on fitting strips alike. A finger that moves before the hold does what it did before: it scrolls where the strips scroll and sets a range from the cells touched where all cells fit.
- **FR17** The move handle stands on the top line of the meeting frame and moves the whole range at once by mouse, pen and finger. When the top of the frame is under the meeting bar, it stands on the bar's bottom line.
- **FR18** The move handle is a slider named «Сдвиг встречи» ("Move meeting") with the keys of FR14, one Tab stop after the end handle.
- **FR19** While the range is moved, the frame looks lifted, every row's span and day shift mark, the dimming, the other handles and the date bar follow at each step, the strips scroll near their edges, and the release is not a tap.
- **FR20** A move may take the range past midnight, into the strip tail.

### Non-Functional

#### Performance

- **NFR-P1** Work bounds (ADR-0008): one step of a move or of a handle drag presents the span of each row once and builds no `Intl` formatter; a growing tail presents only its new cells; re-placing the move handle on scroll measures the layout at most once per animation frame.

#### Accessibility

- **NFR-A1** The move handle is a slider with a name, a value, limits and a value text, operable by the keys of FR18; it is the non-dragging alternative WCAG 2.5.7 asks for.
- **NFR-A2** The move handle has a hit area of at least 44 × 44 px and a visible focus ring in the accent colour; axe-core reports no violation in the light and the dark theme, with the list at the top and scrolled.
- **NFR-A3** A focused control is never hidden under the sticky meeting bar (WCAG 2.4.11): the page scrolls it into view.

#### Responsive

- **NFR-R1** From 320 px to 2560 px wide the page never scrolls horizontally, with and without a strip tail.
- **NFR-R2** At 844 × 390 px with the meeting bar and the date bar in place, at least one grid row is fully visible between them.

## UX Acceptance Criteria

- **UX1** The move handle is the start handle turned by a quarter turn: a grip 36 × 12 px with a 4 px radius in the meeting colour, with no icon. The frame's top line runs through it, as the side lines run through the start and end handles.
- **UX2** The centre of the move handle is on the axis of the frame's top line, but never above the axis of the meeting bar's bottom line. With the list at the top it ends above the texts of the first row header and does not reach into the meeting bar.
- **UX3** While the range is moved, the frame has a shadow and the move handle is 44 × 14 px with the same shadow. Nothing else marks the move.
- **UX4** Tail cells look like the other hour cells; only the midnight cell with its date marks the new day.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | no meeting range | no tail, no move handle, the normal header that scrolls away |
| any | range inside the reference day, not in its last cell | meeting frame, three handles, no tail, sticky meeting bar |
| any | range overlaps the last cell of the reference day | one tail cell |
| any | range ends in the next day | tail through the cell after the range's last cell |
| any | range of 24 hours | the handles stop; End on the end handle and Home on the start handle change nothing |
| any | list longer than the screen, top of the frame visible | move handle on the frame's top line |
| any | list scrolled, top of the frame under the bar | move handle on the bar's bottom line |
| any | range being moved | lifted frame, larger move handle, rows follow |
| any | no rows | no frame, no handles, the normal header (as today) |
| offline | any | the same as online |

There is no loading or error state: every state above is computed from data in memory.

## Behavior

- `packages/client/src/test/features/meeting_range/meeting_range_past_midnight.feature` — invariants, instants, wall-clock times, handles, date change (`@move-meeting-range-and-extend-past-midnight @FR1`–`@FR5`, `@FR11`).
- `packages/client/src/test/features/meeting_range/meeting_range_move.feature` — the move (`@FR14`, `@FR20`).
- `packages/client/src/test/features/grid_view/grid_view_strip_tail.feature` — the tail, its cells, the width rule, taps and drags, the messages (`@FR6`–`@FR10`).
- `packages/client/src/test/features/grid_view/grid_view_meeting_move_unit.feature` — the gestures that need no real layout, the moving state, the work bounds (`@FR15`, `@FR16`, `@FR19`, `@NFR-P1`).
- `packages/client/src/test/features/grid_view/grid_view_meeting_move_e2e.feature` — the sticky bar, handle positions, the move handle's slider values, keys and Tab order, real gestures, finger holds on scrolling and fitting strips, focus, axe-core, widths (`@FR12`, `@FR13`, `@FR15`, `@FR16`, `@FR17`, `@FR18`, `@NFR-A1`–`@NFR-A3`, `@NFR-R1`, `@NFR-R2`, `@UX1`–`@UX3`).
- `packages/client/src/test/features/grid_view/grid_view_meeting_handles_e2e.feature` — slider values and keys of the start and end handles past midnight, the tail under a dragged end handle, drags and taps on the tail (`@FR4`, `@FR6`, `@FR9`).
- `packages/client/src/test/features/grid_view/grid_view_meeting_screenshots_e2e.feature` — the approved screenshots (`@UX1`–`@UX4`, `@NFR-R1`).

Existing features of `meeting_range` and `grid_view` are updated where their requirement is modified, keeping their tags.

## Visual Reference

`docs/design/proposals/meeting-range/` — six screens of the Grid view (`screens/grid-*.png`). They are screenshots of the running app at commit `3485c6e` with only the new elements drawn on top, and the measured sizes are in `move-meeting.md`. One difference from this change: the "moving" screen shows a dashed trace of the previous position, which NG5 leaves out. Design tokens are the source of truth for colours; the approved screens of this change are produced by its screenshot tests.

## Affected IA

No changes: the project has no `docs/ia/` documents.

## Success Metrics

- **M1** `23:00`–`02:00` typed in the reference zone's row sets a three-hour range in 100 % of runs; the refusal count for an end time earlier than the start time is 0.
- **M2** Every row of the move tables of the delta specs passes: 6 moves of the sample meeting, 3 off the track step, 4 pointer positions, 4 limits.
- **M3** A move by the move handle changes the length of the range by 0 minutes in every scenario.
- **M4** With 12 locations at 390 × 844 px the meeting bar and the move handle are fully visible at the top, the middle and the bottom of the list: 3 of 3 positions.
- **M5** The move handle's centre is within 0.5 px of the rule of UX2 at scroll offsets 0, 4, 7 and 400 px.
- **M6** axe-core reports 0 violations in 4 of 4 theme and scroll combinations.
- **M7** 27 cells fit without scrolling at 1280, 1440 and 2560 px wide, and scroll at 844 and 390 px: 5 of 5 widths.
- **M8** Mutation score of the changed model files is at least 95 % (minimum 90 %).
- **M9** `pnpm check:bundle-size` passes without raising a budget.

## Open Questions

- **Q1** Should a trace of the previous position be shown while the range is moved? The screen has it; this change leaves it out (NG5) until the owner asks for it.
- **Q2** Should one spare tail cell be enough, or should the tail show more room after the range? One cell is built; the end handle and a move grow the tail as they go.

## Impact

- Model: `meetingRange.ts` (invariants, handle limits, the move, the date change), `reduceMeetingRange.ts`, `reduceMeetingRangeWallTimes.ts`, `hourCells.ts` (the tail), a new command for the move.
- Presenter: hour strip presentation with tail cells; `meetingHandles.ts` for the third slider; refusal messages.
- Controller: `useMeetingRange` gains the move; `useHourGrid` counts the tail cells.
- Views: `HourStrip`, `MeetingFrame`, `MeetingHandle`, `useMeetingHandleDrag`, `useHourCellSelection`, `useHourStripScroll`, `useVisibleStripRows`, `meetingHandleRow.ts`, `views/shared/MeetingRangeInput.tsx` (the messages), `MainPage` (sticky header while the meeting bar is shown).
- Translations: `ru.json`, `en.json` — the move handle's name, the changed refusal message, the removed one.
- Docs: glossary (`time-selection.md`), `docs/architecture/overview.md`, `docs/architecture/views.md`, `docs/architecture/domain-model.md`, approved screens in `docs/design/screens`. Handed over as a patch (H1): the new ADR in `docs/adr/`, the "Refined by" line of ADR-0011 and the ADR list of `CLAUDE.md`.
- No new dependency.
