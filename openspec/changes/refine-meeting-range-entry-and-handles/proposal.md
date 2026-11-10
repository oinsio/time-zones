# Type any meeting minute, keep the time separator, keep the meeting handles in reach

Task #114 («Доработки приложения») reports four defects of the meeting range in the Grid view and of the time fields after `fix-grid-meeting-range-lock-and-layering`. No active change touches them (the only other active change, `add-pr-preview-deploy`, changes `app-delivery`).

## Why

1. **A meeting cannot start or end at any minute.** The meeting range input refuses `09:05`–`09:28` with «Встреча должна быть внутри дня, с шагом 15 минут», because the meeting range invariants require both ends on the 15-minute track step (`isValidMeetingRange` → `isOnTrackStep` in `packages/client/src/model/meetingRange.ts`; ADR-0011: "Both ends lie on the 15-minute track step"). Real meetings start at 10:05 or last 25 minutes. The 15-minute step is only a speed-up for the meeting handles, and the task wants it kept there.
2. **The `:` separator vanishes while typing.** A wall-time input and the fields of the meeting range input open with their text fully selected (`WallTimeInput.tsx`, `MeetingRangeInput.tsx`), so the first digit replaces `09:00` and the field shows `1030` instead of `10:30`. The fields request a numeric keyboard (`inputMode="numeric"`), and on a phone that keyboard often has no `:` key.
3. **The meeting handles leave the screen.** The handles stand on row ⌈n / 2⌉ and the row after it of the whole list (`getMeetingHandleRow` in `views/grid/meetingHandleRow.ts`). With many locations the page scrolls vertically, and those rows are often above or below the visible part, so the handles cannot be reached.
4. **The meeting range jumps to whole hours after a handle is released.** The handle's hit area is 24 px wide (`w-6` in `views/grid/MeetingHandle.tsx`) over the hour strip. A press just beside it lands on an hour cell, so a drag selects whole cells and a plain press-and-release is a tap that sets a one-hour range (`useHourCellSelection.ts`). Where the browser sends the click that ends a gesture to the element under the pointer, not to the handle that captured it, the release of a real handle drag also counts as a tap on the hour cell under the pointer. On engines without Pointer Events (iOS Safari 12, ADR-0009), the touch fallback never cancels the default of `touchend`, so nothing stops a click the browser synthesizes at the finger's end position. Both paths match the report: the frame "shrinks or grows to one hour and may move to another time".

Audience: everyone who plans a meeting in Grid, phone users above all (narrow handles, numeric keyboard, long lists).

## What Changes

- MODIFIED `meeting-range` → **Meeting range invariants**: the ends lie on any whole minute inside the reference day, not on the track step. The shortest range is one minute.
- MODIFIED `meeting-range` → **Set and clear a meeting range**: the invalid-range examples follow the new invariants.
- MODIFIED `meeting-range` → **Commands that remove or move the meeting range**: a date change keeps a start that is off the track step at its exact wall-clock time.
- MODIFIED `meeting-range` → **Meeting handle moves**: a handle lands on the track step. A move never shortens the range below one track step, or below its current length if it is already shorter.
- MODIFIED `meeting-range` → **Set a meeting range from wall-clock times**: any minute is accepted. Equal start and end times are refused with the new error `MEETING_START_EQUALS_END`. An end time not later than the start that cannot cross midnight inside the reference day is refused with the new error `MEETING_END_BEFORE_START`. A range outside the reference day is still refused with `INVALID_MEETING_RANGE`. "The whole reference day" scenario is replaced.
- MODIFIED `grid-view` → **Meeting range input**: the refusal messages name the actual problem. «…с шагом 15 минут» is removed.
- MODIFIED `grid-view` → **Meeting handles on the frame**, **Drag a meeting handle**, **Handle drag scrolls the strips**, **Meeting handles are sliders**: the handles stand on the rows visible on screen, the hit area is at least 44 × 44 px, the handle keeps its offset from the pointer (also while the strips auto-scroll), and a release never counts as a tap on an hour cell.
- MODIFIED `grid-view` → **Tap or Enter sets a one-hour meeting range**: a click that ends a meeting handle gesture is not a tap.
- ADDED `time-selection` → **Time separator while typing**: the wall-time input and both fields of the meeting range input insert `:` between hours and minutes as digits are typed.
- Glossary (`docs/glossary/time-selection.md`), changed terms: **Meeting range** (any minute, no longer "on the track step"), **Meeting handle** (lands on the track step, stands on the visible rows), **Wall-time input** (the separator; new owner `formatTypedWallTimeText`), **Track move** (its next / previous step rule gets the shared owner `getMinutesAfterTrackStep`). In `docs/glossary/date-selection.md`, **Date bar** gains the owner `DATE_BAR_SELECTOR`. No new term.
- Docs: `docs/architecture/domain-model.md` (invariant 5, the errors of `SET_MEETING_RANGE_WALL_TIMES`), `docs/architecture/views.md` (Meeting handles).
- ADR: ADR-0011 decides "Both ends lie on the 15-minute track step". A new ADR-0013 refines it: the ends lie on any minute, and the handles move on the track step. The factory may not write `docs/adr/`, so this goes through handoff H1.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `meeting-range`: the invariants (any minute), the invalid-range examples, a date change of an off-step range, handle moves landing on the track step, and the wall-clock refusals (`MEETING_START_EQUALS_END`, `MEETING_END_BEFORE_START`).
- `grid-view`: the meeting range input's messages; the handles' rows, hit area, grab offset (also during auto-scroll) and release; tap versus handle release.
- `time-selection`: the separator inserted while typing in a wall-time input and in the fields of the meeting range input.

## Goals

- G1: A meeting of any whole-minute start and length inside the reference day can be typed in any row's local time.
- G2: The meeting range input says why a pair of times is refused: same times, end before start, or outside the day.
- G3: While digits are typed, a time field shows `HH:MM` with its separator, with no `:` key needed.
- G4: Both meeting handles are on screen whenever the grid's rows are, at any vertical scroll position.
- G5: Grabbing and releasing a meeting handle changes only that handle's end, by the distance the pointer travelled.

## Non-Goals

- NG1: The handles, the hour-cell tap and drag, and the strip keys keep the 15-minute track step and whole hours (the task: "двигать по 15 минут — это надо оставить").
- NG2: No meeting range across the end of the reference day (ADR-0011: "the user picks the next day instead").
- NG3: No change to which texts a time field accepts when confirmed, and no new 12-hour typing aid. The one effect of the separator is declared in FR6: `130` typed digit by digit becomes `13:0` and is refused, so early-morning three-digit times need `0130` or `1:30`. The numeric keyboard stays.
- NG4: Horizontal reach of the handles is unchanged: when the strips scroll sideways and the frame's edge is off-screen, its handle is off-screen too. Dragging a handle to the edge already scrolls the strips (FR11 of `add-grid-meeting-range-and-share`).
- NG5: Cards ignores the meeting range (ADR-0011) and does not change, except for the separator in its wall-time input (FR6).
- NG6: No segmented hour and minute fields and no native `type="time"` field (`time-selection` → "Wall-time input opens without Pointer Events": "never a native time field").

## Users & Scenarios

- U1: A user types `9:05` and `9:28` in Almaty's meeting range input. The meeting is 09:05–09:28 and the title reads «Встреча · 23 мин».
- U2: A phone user taps Moscow's time, types `1`, `0`, `3`, `0` on the numeric keyboard and sees `10:30`.
- U3: A user with twelve locations scrolls to the bottom of the grid. Both handles stand on the rows now on screen, ready to grab.
- U4: A phone user presses a finger slightly beside the end handle's grip, drags one cell right and lifts the finger over another row's hour cell. The meeting ends one hour later. It does not collapse to that cell's hour.
- U5: A user types `12` and `10` in Almaty. The input says «Окончание встречи должно быть позже начала».

## Requirements

### Functional

- FR1: A meeting range may start and end at any whole minute inside the reference day: `start < end`, the start not before the day's start, the end not after the day's end, and both a whole number of minutes after the day's start. The shortest range is one minute. Every way of setting a range keeps these invariants.
- FR2: Setting a meeting range from wall-clock times accepts any minutes and refuses, with the state unchanged:
  - equal start and end times, with `MEETING_START_EQUALS_END`;
  - an end time not later than the start time whose next-day end leaves the reference day while the start lies inside it, with `MEETING_END_BEFORE_START`;
  - any other range outside the reference day, with `INVALID_MEETING_RANGE`.

  `LOCATION_NOT_FOUND`, `INVALID_TIME` and `INVALID_DATE` are unchanged.
- FR3: The meeting range input shows one message per refusal of FR2, on both fields and in the interface language:
  - «Начало и окончание встречи совпадают» ("The meeting start and end are the same");
  - «Окончание встречи должно быть позже начала» ("The meeting must end after it starts");
  - «Встреча должна быть внутри дня» ("The meeting must lie within the day").

  The input stays open and nothing changes. «Введите время в формате ЧЧ:ММ» for a text that is not a time is unchanged.
- FR4: Each meeting handle moves its end onto the track step:
  - Arrow Right / Arrow Up and Arrow Left / Arrow Down go to the next or previous track step position of the reference day (09:05 → 09:15 or 09:00);
  - Page Up / Page Down move by one hour;
  - Home / End go to the day's start or end;
  - a drag goes to the nearest track step.

  No move makes the range shorter than one track step, or shorter than its current length when that is already less than one track step. The other end never moves.
- FR5: A date change keeps a meeting range whose start is off the track step at its exact wall-clock start in the reference zone and its duration, clamped to the new reference day.
- FR6: While the user types into a wall-time input or a field of the meeting range input, a field text made only of digits shows the separator `:` after the hour as soon as a minute digit follows. The hour is one digit when the first digit is 3–9, or when it is 2 followed by 4–9; otherwise the hour is two digits. This applies when the typed or pasted characters end at the end of the text. Deleting, editing inside the text, and texts with a separator, a space or a letter are left as typed. Trade-off: a three-digit time whose hour is 0, 1 or 2 must be typed with a leading zero or a separator (`0130`, `1:30`), because `130` typed digit by digit reads `13:0`, which is refused as not a time.
- FR7: While a meeting range is set and the grid has rows, the two meeting handles stand on the candidate rows: the rows where a handle, centred on the row's hour strip, lies fully in the viewport above the date bar (the handle is taller than a strip, so the handle's box decides). The ⌈k / 2⌉ rule applies to those k candidate rows: the end handle on candidate row ⌈k / 2⌉, the start handle on the next one, or both on the one candidate row. With no candidate row, the rule applies to all rows as before. While a handle is dragged, neither handle changes its row.
- FR8: A press anywhere within a meeting handle's hit area, at least 44 × 44 px centred on the frame's edge, drags that handle and never selects hour cells. During the drag the handle's end follows the pointer's horizontal travel along the strips since the press (the strips' scroll included, also while they auto-scroll), rounded to the nearest track step, so a press and release without movement changes nothing. Releasing a handle, wherever the pointer or finger is, never counts as a tap or click on an hour cell: no one-hour range is set.

### Non-Functional

#### Performance

- NFR-P1: Re-placing the handles on scroll (FR7) re-measures the strips at most once per animation frame and re-renders a handle only when its row changes. The work bound of "Meeting state is fast" is unchanged: a handle move builds no formatter and looks up no time zone transition.

#### Accessibility

- NFR-A1: axe-core reports no violations on the Grid view with the meeting range input open showing each of the three FR3 messages, in the light and the dark theme. Each message is tied to both fields (`aria-invalid`, `aria-describedby`).
- NFR-A2: Each meeting handle keeps its slider role, name, keys and Tab order. Its value may be off the track step (`aria-valuenow` 545, value text `09:05`). Its hit area is at least 44 × 44 px.

#### Responsive

- NFR-R1: At 390 × 844 and 844 × 390 with 12 locations, at the page's top, middle and bottom scroll positions, both handles lie fully inside the viewport above the date bar, and each is the topmost element at its centre.
- NFR-R2: Approved screenshots of the meeting state keep matching. A baseline that changes only because a handle now stands on a visible row is re-approved and listed for review (H2).

## UX Acceptance Criteria

- UX1: The separator appears with no caret jump. The caret stays after the last typed character, and Backspace right after `10:` removes the `:`.
- UX2: The visible grip of a handle keeps its size and colour. Only the invisible hit area grows.
- UX3: The refusal messages are plain sentences with no technical words such as "step" or "invariant".

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | Grid, meeting range set, all rows fit | handles on rows ⌈n / 2⌉ and the next, as before (FR7) |
| any | Grid, meeting range set, rows scrolled | handles on the visible rows (FR7) |
| any | no candidate row (page scrolled past the grid) | handles on the rows of the whole list (FR7) |
| any | meeting range input open, a text not a time | «Введите время в формате ЧЧ:ММ» (unchanged) |
| any | same start and end / end before start / outside the day | the FR3 message, input open, nothing changed |
| any | handle released over another row's hour cell | range as at the last move (FR8) |
| any | list becomes empty while a range is set | range removed, empty state (unchanged) |
| any | stored list unreadable | load error with Reset (unchanged) |
| any | Grid chunk loading / failed | `ViewSkeleton` / `ViewErrorFallback` (unchanged) |
| offline | any of the above | unchanged: everything is local |

## Behavior

All paths below are under `packages/client/src/test/features/`, and every scenario is tagged `@refine-meeting-range-entry-and-handles`.

- Unit BDD (vitest-cucumber), new:
  - `meeting_range/meeting_range_any_minute.feature` (FR1, FR4, FR5);
  - `time_selection/time_selection_time_separator_unit.feature` (FR6);
  - `grid_view/grid_view_meeting_handle_reach_unit.feature` (FR7, FR8, NFR-P1).
- Unit BDD, updated:
  - `meeting_range/meeting_range_commands.feature` and `meeting_range_wall_times.feature` (FR1, FR2);
  - `grid_view/grid_view_meeting_range_input_unit.feature` (FR2, FR3).
- playwright-bdd, updated: the two auto-scroll scenarios of `grid_view/grid_view_meeting_handles_e2e.feature` (FR8, grab offset while the strips scroll).
- playwright-bdd, new:
  - `grid_view/grid_view_meeting_handle_reach_e2e.feature` (FR4, FR7, FR8, NFR-A2, NFR-R1);
  - `time_selection/time_selection_time_separator_e2e.feature` (FR6 with a real keyboard, FR2, FR3);
  - `grid_view/grid_view_meeting_range_messages_e2e.feature` (NFR-A1).

## Visual Reference

No Figma. The meeting screens of `docs/design/README.md` → Grid. Colours come from `docs/architecture/views.md` → Visual style. The grip is unchanged.

## Affected IA

No changes.

## Success Metrics

- M1: 6 of 6 typed pairs set the exact range in Almaty (reference zone `Asia/Almaty`, 2026-03-08, sample list):
  - Almaty `9:05`–`9:10` → 09:05–09:10, «Встреча · 5 мин»;
  - Almaty `9`–`9:23` → 09:00–09:23;
  - Moscow `7:05`–`9:28` → 09:05–11:28;
  - Kolkata `9:37`–`10` → 09:07–09:30;
  - New York `23:10`–`0:40` → 09:10–10:40;
  - Almaty digits `905`–`928` → 09:05–09:28.
- M2: 4 of 4 refusals show their message, with the range still 09:00–11:00:
  - Almaty `10`–`10`: same times;
  - Almaty `12`–`10`: end before start;
  - Almaty `22`–`2`: end before start;
  - New York `13`–`14`: outside the day.
- M3: Typed digit by digit, 5 of 5 sequences show the expected text in both input kinds: `1030` → `10:30`, `930` → `9:30`, `0930` → `09:30`, `2359` → `23:59`, `12345` → `12:345`.
- M4: With 12 locations at 390 × 844, at 3 of 3 scroll positions (top, middle, bottom), 2 of 2 handles lie inside the viewport above the date bar: 6 of 6 checks.
- M5: 3 of 3 handle gestures on the sample meeting leave the expected range (09:00–11:00 in Almaty at 1440 × 900):
  - a mouse press 16 px right of the end grip's centre, dragged one cell right and released over another row's hour cell → 09:00–12:00;
  - a press and release on the end handle without movement → 09:00–11:00;
  - from 09:00–10:00, a finger drag of the end handle one cell right with the fallback touch events → 09:00–11:00, with the touch end's default prevented.
- M6: From 09:05–11:00, Arrow Right on «Начало встречи» gives 09:15–11:00 and Arrow Left gives 09:00–11:00. From 09:00–09:05, Home on «Конец встречи» keeps 09:00–09:05.
- M7: Scoped Stryker scores at least 90 % (target 95 %) on every changed production file.

## Open Questions

None. Where the separator is computed, how the visible rows are measured, and how a release is kept from being a tap are settled in `design.md`.

## Impact

- `packages/client/src/model/`:
  - `meetingRange.ts`;
  - `dayTrack.ts` (the next / previous track step rule, extracted to be shared);
  - `reduceMeetingRangeWallTimes.ts`;
  - `locationCommands.ts` (2 error codes).
- `src/controller/useMeetingRange.ts` (outcomes).
- `src/presenter/`:
  - new `formatTypedWallTimeText.ts`;
  - `index.ts`.
- `src/views/shared/`:
  - `WallTimeInput.tsx`;
  - `MeetingRangeInput.tsx`.
- `src/views/grid/`:
  - `MeetingHandle.tsx`;
  - `meetingHandleRow.ts`;
  - `useMeetingHandleDrag.ts`;
  - `useHourCellSelection.ts`;
  - new `useVisibleStripRows.ts`.
- `src/app/MainPage.tsx` (a `data-date-bar` attribute on the element that holds the date bar).
- `src/constants/meeting.ts`, `src/constants/date.ts` (`DATE_BAR_SELECTOR`).
- `src/locales/ru.json` and `en.json`.
- Tests: the features above, plus updates of existing tests that assert the 15-minute refusal.
- Docs: `docs/glossary/time-selection.md`, `docs/glossary/date-selection.md`, `docs/architecture/domain-model.md`, `views.md`. ADR-0013 comes by handoff H1.
- No new dependency, no stored data change.
