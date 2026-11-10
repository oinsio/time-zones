# Add the meeting range, meeting handles and Share meeting to the Grid view

Task #108 asked for the meeting handles and Share meeting. Neither the meeting range nor any active change that brings it exists (`grep -rn "MeetingRange\|MEETING_RANGE" packages/client/src` finds nothing; the archived `add-grid-hour-cells-and-hour-frame` defers it in its NG1). By the tracker's decision this change therefore specifies the whole meeting range of ADR-0011 — model commands, tap and drag on hour cells, meeting frame, dimming, local ranges, the meeting bar with Clear — together with the handles and Share. The only other active change, `add-pr-preview-deploy`, changes `app-delivery` only.

## Why

Grid is the view for "when can we meet?" (`docs/architecture/views.md` → Catalog), but today it can only show one moment: a tap on an hour cell does nothing (`openspec/specs/grid-view/spec.md` → "Hour cells take no pointer selection yet"), there is no start and end, and nothing can be passed to the other participants. The behaviour is decided and the screens are approved: ADR-0011 (meeting range, its commands and the Grid interaction), `docs/architecture/views.md` → Hour frame and meeting frame (Meeting, Meeting handles, Meeting bar, Layers), `docs/design/README.md` → Grid, the "Meeting" column. Open question Q8 (`docs/architecture/open-questions.md`) leans to "text first"; the task decides it: Share sends text only.

After this change a user picks a span with a tap or a drag, adjusts each end by 15 minutes with a handle or the keyboard, reads the local span of every location, and sends it as text. Grid then matches its whole design.

Audience: people who plan meetings across zones on a desktop, tablet or phone, including keyboard and screen reader users.

## What Changes

- ADDED capability `meeting-range` (model behaviour, view-independent):
  - the optional **meeting range** of the world clock state: start and end instants on the track step inside the reference day, `start < end`, never stored; `SET_MEETING_RANGE` (error `INVALID_MEETING_RANGE`) pins the reference moment to the start, `CLEAR_MEETING_RANGE` removes it and keeps the moment pinned;
  - Now (`RESET_TO_NOW`), a time selection (`SELECT_INSTANT`) and a wall-time input (`SET_WALL_TIME`) remove it; a date change (`SET_DATE`, `SHIFT_DATE`) moves it with the date; a change of the reference zone or an empty location list removes it;
  - **meeting handle** moves: start and end by the track step, by an hour and to the ends of the reference day, never shorter than one step;
  - the **day shift** of a location at an instant;
  - **Share meeting** sends text only (Q8): the date, the duration and every location's local span in list order; system share where the browser has it, the clipboard otherwise, and a cancelled share is silent.
- ADDED to `grid-view`: tap and Enter set a one-hour meeting range, a drag across cells sets a longer one; the **meeting frame** with the dimmed cells outside it; every row's local span and day shift mark; the meeting handles (pointer, touch, keyboard, auto-scroll on a phone in portrait); the **meeting bar** (duration, Share meeting, Clear meeting); the copied and failure notices; work bounds; screenshots of the meeting state.
- MODIFIED `grid-view` → **Hour frame**: no hour frame while a meeting range is set.
- REMOVED `grid-view` → **Hour cells take no pointer selection yet**: a tap now sets a meeting range.
- MODIFIED `main-page` → **Header actions**: while the meeting bar is shown it takes the header's place; Add location and Settings come back after Clear.
- Glossary: **Meeting range**, **Meeting frame**, **Meeting handle**, **Meeting bar**, **Share meeting** (`time-selection.md`) and **Day shift** (`time.md`) lose *(planned)* and get *Code:* owners; **Hour cell** says a tap sets a one-hour meeting range; new **Meeting share text** (`time-selection.md`), **Text sharing** port (`architecture.md`), **Meeting copied notice** and **Share failed notice** (`app-shell.md`).
- Docs: `docs/architecture/open-questions.md` (Q8 moves to Resolved: text only), `docs/architecture/views.md` (Catalog status, hour cells, meeting share text, layers with the handles), `docs/architecture/domain-model.md` (the meeting selectors with their real inputs, the reference-zone and empty-list rules).

## Capabilities

### New Capabilities

- `meeting-range`: the meeting range in the model — its invariants, the commands that set, move and remove it, the meeting handle moves, the day shift, and what Share meeting sends and how.

### Modified Capabilities

- `grid-view`: pointer, touch and keyboard selection of a meeting range on hour cells, the meeting frame and dimming, local spans and the day shift mark in rows, meeting handles, the meeting bar, share notices, work bounds and screenshots; "Hour frame" changes; "Hour cells take no pointer selection yet" is removed.
- `main-page`: "Header actions" — the meeting bar replaces the header content while it is shown.

## Goals

- G1: In Grid, a meeting range is set in one gesture (tap, drag or Enter) and each of its ends is moved by 15 minutes with a handle or a key.
- G2: Every location's local span of the meeting, with its day shift, is readable in one look and changes live while a handle moves.
- G3: The meeting is passed on as text in any messenger, online or offline, in one action.
- G4: Grid matches the approved "Meeting" screens and passes every meeting scenario of the view contract (set, resize, share, clear).

## Non-Goals

- NG1: No link that opens the same meeting range in the app (Q8 decided: text only).
- NG2: No meeting range that crosses the end of the reference day (ADR-0011: "the user picks the next day instead").
- NG3: No setting for cell colouring.
- NG4: Cards does not show the meeting range (ADR-0011: "Cards ignore the range"); it keeps showing the reference moment, which is the start.
- NG5: The meeting range is never stored and never synced between tabs.
- NG6: No undo of a cleared meeting range.

## Users & Scenarios

- U1: A desktop user in Almaty taps column 9: «Встреча · 1 ч», every row shows its local span, the other cells dim. They drag the end handle one column right: «Встреча · 2 ч», 09:00–11:00, New York shows «днём раньше» and 23:00–01:00.
- U2: A phone user in portrait drags the end handle to the right edge of the visible strip; the strips scroll on so the handle can go further.
- U3: A keyboard user tabs to Almaty's hour strip, presses Enter to set a one-hour meeting, tabs to «Конец встречи» and presses Page Up: the meeting lasts 2 hours.
- U4: The user chooses «Поделиться встречей»: on a phone the system share sheet opens with the text; on a desktop the text is copied and «Текст встречи скопирован» appears.
- U5: The user chooses «Сбросить выбор встречи»: the hour frame, the title and the Add location and Settings buttons are back.

## Requirements

### Functional

- FR1: The world clock state holds an optional meeting range: a start instant and an end instant with `start < end`, both a whole number of track steps (15 minutes) after the start of the reference day of the start, the end at most the end of that day. It is never stored: the app always opens without one.
- FR2: Setting a meeting range (start, end as ISO 8601 instants with `Z`) replaces any previous one and pins the reference moment to the start (status unique). A malformed instant or a range that breaks FR1 is refused with `INVALID_MEETING_RANGE` and changes nothing. Clearing it removes the range and keeps the reference moment pinned at the former start.
- FR3: Now removes the meeting range and makes the moment live. A time selection and a wall-time input remove it (the user picked one moment). A date change moves it: the start keeps its wall-clock time in the reference zone on the new date (resolved as the reference moment is), the duration is kept and the end is clamped to the end of the new reference day.
- FR4: A change of the reference zone (home set, changed or cleared, the device time zone changed while no home is set, a list from another tab with another home) removes the meeting range; the reference moment stays pinned at the former start. A location list that becomes empty removes it too.
- FR5: In Grid, a tap or click on an hour cell sets a one-hour meeting range starting at the cell's start (the last cell of a day that is not a whole number of hours: up to the day's end). Enter or Space on a focused hour strip sets the same range for the cell of the hour frame. Both work without Pointer Events.
- FR6: In Grid, dragging across hour cells with a mouse or a pen — or with a finger while all cells fit and the strips do not scroll — sets a meeting range from the start of the first cell to the end of the last cell touched, in either direction, and updates it while the drag goes on. Where the strips scroll (phone in portrait), a finger swipe scrolls the strips and sets nothing.
- FR7: While a meeting range is set, a meeting frame in the meeting colour (`#00AA00` light, `#3DD13D` dark) surrounds the range across all rows, from the start to the end, with no hour frame shown; hour cells that do not overlap the range are dimmed to opacity 0.4. The meeting frame lies above the cells and behind the row header texts and row notes, and takes no pointer events.
- FR8: While a meeting range is set, every grid row shows its local span in place of its time, `start–end` in the hour format setting and in the meeting time colour (`#008800` light, `#5EDB5E` dark), and its date is the local date of the start. When that date differs from the reference zone's date of the start, the row shows the day shift mark «днём раньше» / «днём позже» ("a day earlier" / "a day later") before the date, in the danger colour. Without a meeting range no day shift mark is shown in Grid.
- FR9: While a meeting range is set and the list has rows, two meeting handles stand on the meeting frame: the start handle on its left edge, the end handle on its right edge, on different rows when there are two or more rows. They lie above everything in the panel, the row header texts and row notes included.
- FR10: Dragging a meeting handle moves its end of the range to the nearest track step under the pointer. The start stays at least one track step before the end and the end at least one step after the start; neither leaves the reference day (start from its first instant, end up to its end). While a handle moves, the frame, the dimming, every row's span and day shift mark and the duration in the meeting bar follow at each step. A handle can be dragged by touch also on an engine without Pointer Events (iOS Safari 12).
- FR11: When the strips scroll (phone in portrait) and a dragged handle comes within 32 px of the visible part's left or right edge, the strips keep scrolling in that direction until the handle leaves that zone, the strips reach their end or the drag ends.
- FR12: Each meeting handle is a slider named «Начало встречи» / «Конец встречи» ("Meeting start" / "Meeting end"). Its value is the minutes from the start of the reference day to its end of the range, and its value text that instant's local time in the reference zone in the hour format setting. Arrow Right / Up and Arrow Left / Down move it by one track step, Page Up / Page Down by one hour, Home / End to the start / end of the reference day, each limited by FR10.
- FR13: While a meeting range is set and the Grid view with at least one row is shown, the page header is the meeting bar: the meeting bar background, the title «Встреча · {duration}» ("Meeting · {duration}"; durations `2 ч`, `1 ч 45 мин`, `45 мин` / `2 h`, `1 h 45 min`, `45 min`), then «Поделиться встречей» (Lucide `Share2`) and «Сбросить выбор встречи» (Lucide `X`) as icon buttons in the meeting colour. The Add location and Settings buttons are not shown meanwhile. Clear meeting clears the range, brings back the hour frame and the normal header, and moves the focus to the Add location button. In Cards the header stays as it is.
- FR14: Share meeting builds a text in the interface language: the first line names the date of the start in the reference zone (the date bar's full date) and the duration; then one line per location of the list, in list order, with its city and its local span in the hour format setting; a location whose local date of the start differs from the reference zone's shows its day shift and local date on its line.
- FR15: Where the browser can share, Share meeting opens the system share with the text. Where it cannot, or the system share fails for another reason than the user closing it, the text is copied to the clipboard and the copied notice «Текст встречи скопирован» ("Meeting text copied") appears in the notices region. If the user closes the share sheet, nothing happens and no notice is shown. If neither sharing nor copying works, the share failed notice «Не удалось поделиться встречей» ("Could not share the meeting") appears. Each notice disappears on Dismiss, Esc, the next share, a change of the meeting range or its clearing.
- FR16: The decision on Q8 ("what Share meeting sends": text only, no link) is recorded in `docs/architecture/open-questions.md` (moved to Resolved) and in the glossary entry Share meeting.
- FR17: Grid passes the meeting scenarios of the view contract: set, resize, share and clear a meeting range.

### Non-Functional

#### Performance

- NFR-P1: After presenting the rows of 50 locations in 10 zones once, a meeting handle move within the same reference day, language and hour format re-presents every row's span without building a formatter and without a time zone transition lookup, and keeps every hour strip the same object. Timings come from a `*.bench.ts` benchmark (ADR-0008), never from a blocking test.

#### Accessibility

- NFR-A1: axe-core reports no violations on Grid with a meeting range in the light and the dark theme. Share meeting and Clear meeting have accessible names and are at least 44 × 44 px; a meeting handle's hit area is at least 24 × 44 px with a visible focus ring in the accent colour.
- NFR-A2: The keyboard alone sets (Enter on an hour strip), resizes (handle keys), shares and clears a meeting range. Tab order: the meeting bar's Share then Clear first, then the rows, then the start handle, then the end handle. The copied and share failed notices are announced by the polite notices region and never take the focus.

#### Responsive

- NFR-R1: At 320 px the meeting bar's title and both buttons fit on one line without page scrolling. At 390 × 844 the two handles stand on different rows and each can be dragged with a finger.
- NFR-R2: Approved screenshots of Grid in the meeting state with the design's sample data (8 March 2026, home Almaty, Almaty, Moscow, Kolkata, New York, Russian interface, meeting 09:00–11:00 Almaty) at 1440 × 900, 1180 × 820, 844 × 390 and 390 × 844, each in the light and the dark theme, match on every run.

## UX Acceptance Criteria

- UX1: The meeting state reads like `docs/design/screens/grid-*-meeting-light.png` and `grid-desktop-meeting-dark.png`: the green bar with the bordered bottom, the 3 px green frame with rounded corners, green spans in bold digits, the red «днём раньше», green 12 × 36 px grips on two rows.
- UX2: A handle feels attached to the pointer: it jumps from step to step under the finger and never jumps over the other end.
- UX3: The shared text reads well in a plain-text messenger: one line per place, no markup, no link.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | Grid, list present, no meeting range | hour frame, normal header; a tap, drag or Enter sets a range (FR5, FR6) |
| any | Grid, meeting range set | meeting bar, meeting frame, dimmed cells, spans, day shift marks, handles (FR7–FR13) |
| any | Grid, list becomes empty while a range is set | range removed; empty-state explanation and the normal header with Add location (FR4) |
| any | Grid, stored list unreadable | load error with Reset; no range can be set (unchanged) |
| any | Grid chunk loading / failed | `ViewSkeleton` / `ViewErrorFallback` with Retry (unchanged) |
| offline | meeting range set | everything works; Share sends text through the system share or the clipboard (FR15) |
| any | share sheet closed by the user | nothing happens (FR15) |
| any | no system share | text copied, copied notice (FR15) |
| any | neither share nor clipboard | share failed notice (FR15) |
| any | Cards with a range set | Cards shows the start as the reference moment; normal header (FR13, NG4) |
| any | storage unavailable | storage warning; the range works for the session and is never stored anyway |

## Behavior

- New unit BDD under `packages/client/src/test/features/meeting_range/` (model commands, handle moves, day shift, share text and outcomes) and under `src/test/features/grid_view/` (tap and Enter, meeting frame column and dimming, row spans, meeting bar, work bounds), tagged `@add-grid-meeting-range-and-share`.
- New playwright-bdd features under `src/test/features/grid_view/` (`grid_view_meeting_e2e.feature`, `grid_view_meeting_handles_e2e.feature`, `grid_view_meeting_share_e2e.feature`, `grid_view_meeting_screenshots_e2e.feature`) with the meeting scenarios of the view contract.
- Changed `main_page_header_e2e.feature` (the meeting bar replaces the header) and the grid features that asserted "a tap changes nothing".

## Visual Reference

No Figma. Screens: `docs/design/screens/grid-desktop-meeting-light.*`, `grid-desktop-meeting-dark.*`, `grid-tablet-meeting-light.*`, `grid-phone-landscape-meeting-light.*`, `grid-phone-portrait-meeting-light.*`. Colours from the design tokens of `docs/architecture/views.md` → Visual style → Grid.

## Affected IA

No changes.

## Success Metrics

- M1: With the sample data (current time `2026-03-08T07:30:00Z`, reference zone `Asia/Almaty`), a tap on Almaty's column 9 then a drag of the end handle to column 11's left edge gives 09:00–11:00 and the spans Almaty `09:00–11:00`, Moscow `07:00–09:00`, Kolkata `09:30–11:30`, New York `23:00–01:00` with «днём раньше» before its local date of 7 March, no day shift mark in the 3 other rows, title «Встреча · 2 ч» — 4 of 4 rows right.
- M2: In that state the meeting frame encloses columns 9–10 of every row, 22 cells per row (88 of 96) are dimmed, and no hour frame is shown.
- M3: Handle keys from 09:00–11:00: start Arrow Right → 09:15–11:00 («1 ч 45 мин»); start End → 10:45–11:00; end Home → 09:00–09:15; end End → 09:00 to the end of the reference day; start Home → the day's start — 5 of 5 ranges right, none shorter than 15 minutes.
- M4: `SET_MEETING_RANGE` refuses 5 of 5 invalid ranges (end before start, equal ends, a start off the 15-minute step, an end after the day's end, a malformed instant) with `INVALID_MEETING_RANGE` and leaves the state object unchanged.
- M5: Of the commands Now, time selection, wall-time input, home change, emptying the list, 5 of 5 remove the range; next day keeps 09:00–11:00 on 9 March; clear keeps the moment pinned at 09:00.
- M6: Share with English, 24-hour format, produces exactly the 5 lines `Meeting on Sunday, March 8, 2026, 2 h`, `Almaty: 09:00–11:00`, `Moscow: 07:00–09:00`, `Kolkata: 09:30–11:30`, `New York: 23:00–01:00 (a day earlier, Sat, Mar 7)`.
- M7: Share outcomes in 4 of 4 cases: system share → no notice; closed sheet → no notice; no system share → clipboard holds the text and the copied notice shows; neither → the share failed notice shows.
- M8: axe-core 0 violations in the meeting state in 2 of 2 themes; 8 of 8 meeting screenshots pass on every run of each Playwright project.
- M9: A handle move re-presents 50 rows with 0 formatter builds and 0 transition lookups.
- M10: `docs/architecture/open-questions.md` lists Q8 under Resolved and 0 times in the open table; `grep -c "(planned" docs/glossary/time-selection.md` finds 0 meeting entries.

## Open Questions

None. Q8 is decided by the task (text only). Where the handles stand, how a touch drag and a scroll share the strips, where the meeting bar is rendered and how sharing reaches the browser are settled in `design.md`.

## Impact

- `packages/client/src/model/` (new `meetingRange.ts`, `reduceMeetingRange.ts`, `dayShift.ts`; `locations.ts`, `locationCommands.ts`, `reduceReferenceMoment.ts`, `reduceSelectInstant.ts`, `reduceWallTime.ts`), `src/presenter/` (new `locationMeetingRange.ts`, `meetingBar.ts`, `meetingHandles.ts`, `meetingShareText.ts`), `src/ports/` (new `textSharing.ts`), `src/adapters/` (new `browserTextSharing.ts`, `inMemoryTextSharing.ts`, `textSharing.contract.ts`), `src/controller/` (new `useMeetingRange.ts`, `useMeetingShare.ts`, `useMeetingBar.ts`), `src/constants/` (new `meeting.ts`), `src/styles/tokens.css` and `tailwind.config.ts`, `src/views/` (`viewDefinition.ts`, `index.ts`; grid: new `MeetingFrame.tsx`, `MeetingHandle.tsx`, `useMeetingHandleDrag.ts`, `useHourCellSelection.ts`, changed `GridView.tsx`, `HourStrip.tsx`; shared: new `MeetingBar.tsx`, `RowNotes.tsx`, changed `LocalDateTime.tsx`, `ZoneRowContent.tsx`, `LocationRow.tsx`, `hourGridSlots.ts`, `locationRowVariant.ts`), `src/app/` (`AppShell.tsx`, `MainPage.tsx`, new `MeetingShareNotice.tsx`), `src/locales/en.json` and `ru.json`.
- Tests: new features under `src/test/features/meeting_range/` and `grid_view/`, changed grid and header features, new meeting screenshot baselines, new `src/test/benchmarks/meetingRange.bench.ts`.
- Docs: `docs/glossary/time-selection.md`, `time.md`, `architecture.md`, `app-shell.md`, `views.md`; `docs/architecture/views.md`, `domain-model.md`, `open-questions.md`.
- No new dependency, no stored data change.
