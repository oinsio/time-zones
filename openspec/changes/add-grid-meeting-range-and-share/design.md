# Design: Add the meeting range, meeting handles and Share meeting to the Grid view

Paths are relative to `packages/client/` unless they start with `docs/`. Glossary owners reused or extended (`docs/glossary/`): **Reference day** (`getReferenceDay`, `ReferenceDay`), **Track step** (`TRACK_STEP_MINUTES`), **Track move** (`TrackMove`), **Track end** (`getTrackEndMinutes`), **Reference zone** (`getReferenceZone`), **Effective instant** (`getEffectiveInstant`), **Reference moment** (`ReferenceMoment`, `ReferenceMode.PINNED`), **Wall-clock time** (`resolveWallClock`), **Date change** (`SET_DATE`, `SHIFT_DATE` in `reduceReferenceMoment`), **Time selection** (`SELECT_INSTANT`, `useTimeSelection`), **Wall-time input** (`SET_WALL_TIME`, `reduceWallTime`), **Hour cell** (`HourCell`, `getHourCells`, `getHourCellCount`), **Hour strip** (`HourStrip`, `useHourGrid`), **Hour frame** (`getHourFrameIndex`, `HourFrame`), **Date bar** (`presentDateBar` → `fullDateLabel`), **Notice** (`Notice`), **Port** / **Adapter**, **Work bound** (`startWorkCount`). Formatting goes through `formatLocalTime` / `formatLocalDate` (`presenter/localDateTime.ts`, built on `getDateTimeFormatter`), keys through `getTrackMoveForKey` (`views/shared/dayTrackKeys.ts`), the legacy check through `IS_POINTER_EVENTS_SUPPORTED` (`@/lib/legacy`). The planned owners **Meeting range** (`MeetingRange`, `SET_MEETING_RANGE`, `CLEAR_MEETING_RANGE`), **Meeting frame**, **Meeting handle**, **Meeting bar**, **Share meeting** and **Day shift** get their code here; `docs/architecture/domain-model.md` already plans `getMeetingSpan` and `getLocationMeetingRange`, which this change implements under those names. No second owner is introduced.

The change follows ADR-0002 (model → presenter → controller → views; the reducer returns typed errors; selectors return Temporal values, enums and numbers), ADR-0003 (absolute instants, `compatible` disambiguation), ADR-0004 (only repositories write storage; the meeting range is never written), ADR-0005 (views plug in through the registry), ADR-0007 (the reference zone), ADR-0008 (work bounds, not timings), ADR-0009 (no BigInt; iOS Safari 12 has no Pointer Events and no `navigator.clipboard`) and ADR-0011 (the meeting range itself). No global decision is made here: the text sharing port is one more port of the kind ADR-0002 lists, and Q8 is recorded in `docs/architecture/open-questions.md` as that file asks ("record the decision in an ADR or in the relevant architecture document").

## D1. The meeting range in the model

### Context
FR1–FR4, M4, M5. Invariant 5 of `docs/architecture/domain-model.md`; the command table of ADR-0011. Today `WorldClockState` (`src/model/locations.ts`) has `locations`, `deviceTimeZoneId`, `reference`, `homeLocationId`, and `LocationCommandType` (`src/model/locationCommands.ts`) has no meeting command. The code has no `SHIFT_TIME` command (keyboard moves dispatch `SELECT_INSTANT`), so "time selection" covers ADR-0011's `SHIFT_TIME`.

### Decision
- `WorldClockState` gains `meeting?: MeetingRange` (`undefined` when none; `INITIAL_WORLD_CLOCK_STATE` has none). New `src/model/meetingRange.ts`: `type MeetingRange = { start: Temporal.Instant; end: Temporal.Instant }` and `isValidMeetingRange(day, start, end)`: `start < end`, `day.start <= start`, `end <= day.end`, and the minutes from `day.start` to each end are a multiple of `TRACK_STEP_MINUTES` (millisecond arithmetic, no BigInt). `day` is `getReferenceDay` of the state pinned at `start`.
- Commands: `SET_MEETING_RANGE { start: string; end: string }` (ISO with `Z`, like `SELECT_INSTANT`) and `CLEAR_MEETING_RANGE`; error `LocationErrorCode.INVALID_MEETING_RANGE`. New `src/model/reduceMeetingRange.ts` reduces both: a valid range sets `meeting` and `reference = { mode: PINNED, instant: start, wallClockStatus: UNIQUE, requestedWallTime: start in the reference zone }`; setting the same range returns the same state object; clear returns `{ ...state, meeting: undefined }` (same object when none is set).
- Removal: `RESET_TO_NOW` in `reduceReferenceMoment`, `reduceSelectInstant` and `reduceWallTime` drop `meeting`. `reduceSelectInstant`'s early return for "the same instant is already pinned" applies only while no meeting is set, so selecting the start removes the range.
- Date change: `moveToDate` in `reduceReferenceMoment.ts` computes the new start with `resolveWallClock` as today (the pinned instant is the start), then calls `moveMeetingRangeToDay(meeting, newStart, newDay)` from `meetingRange.ts`: `end = min(newStart + duration, newDay.end)`. With `compatible` resolution the new start stays on the step, because the reference day starts at local midnight and every offset change of a supported zone is a multiple of 15 minutes; should a resolved start ever fall off the step, it is floored to the step before the end is computed.
- Reference zone and empty list: `reduceLocations` already wraps every outcome in `followReferenceZone(previous, next)`; a second wrapper `followMeetingRange(previous, next)` (in `reduceMeetingRange.ts`) clears `meeting` when `getReferenceZone(previous) !== getReferenceZone(next)` or `next.locations` is empty. The reference stays as it is (pinned at the start).
- Exports from `src/model/index.ts`. Not persisted: `createLocationsActions.flushWrite` saves only `locations` and `homeLocationId`, and the meeting commands are dispatched straight to the store (D5), never through `dispatchAndSchedule`.

### Consequences
Positive: one owner of the range and its invariant; every view reads it from the state (ADR-0011 "view state of the model").
Negative: three existing reducers learn to drop a field.

### Alternatives Considered
**Keep the range valid across a reference zone change by re-snapping it**: the old instants may fall off the new day's step and outside it; ADR-0011 defines the range only inside one reference day.

## D2. Handle moves, cell ranges, span and day shift

### Context
FR5, FR6, FR8, FR10, FR12, M1–M3.

### Decision
In `src/model/meetingRange.ts`:
- `enum MeetingHandle { START = "START", END = "END" }`.
- `getMeetingRangeOfCells(day, firstColumn, lastColumn)`: start of the lower column's cell, end of the higher column's cell (`min(cell start + HOUR_CELL_DURATION, day.end)`); a tap is `firstColumn === lastColumn`. Cell starts come from `getHourCells`' rule (`day.start + n hours`), exported as `getHourCellStart(day, column)` from `hourCells.ts` so the column arithmetic keeps one owner.
- `getMeetingHandleLimits(day, meeting, handle)` → `{ minMinutes, maxMinutes }`: start `0 … end − step`, end `start + step … day.lengthMinutes`.
- `getMeetingRangeAfterHandleMove(day, meeting, handle, move: TrackMove)`: step ±15, hour ±60, `DAY_START` → 0, `DAY_END` → `day.lengthMinutes` (not the track end: the range may end at the next midnight), clamped to the limits.
- `getMeetingRangeAtHandleMinutes(day, meeting, handle, minutes)`: rounded to the nearest step, clamped to the limits (pointer drag).
- `getMeetingSpan(day, meeting)` → `{ startMinutes, endMinutes, firstColumn, lastColumn }`; `lastColumn` is the column of the last cell that overlaps the range (`ceil(endMinutes / 60) − 1`), so dimming is "column outside `firstColumn … lastColumn`".
- New `src/model/dayShift.ts`: `enum DayShift { EARLIER = "EARLIER", SAME = "SAME", LATER = "LATER" }` and `getDayShift(timeZoneId, instant, referenceZoneId)` from `Temporal.PlainDate.compare` of the two local dates.
- `getLocationMeetingRange(timeZoneId, meeting, referenceZoneId)` → `{ localStart, localEnd: Temporal.ZonedDateTime; dayShift: DayShift }`.

### Consequences
Positive: every limit of FR10 / FR12 is pure and table-tested; the view only converts pixels to minutes.
Negative: two near-identical move functions (keys and pointer) — both end in the same clamp.

### Alternatives Considered
**Reuse `getInstantAfterTrackMove`**: it clamps to the track end (23:59) and knows one instant only; the end handle must reach the day's end and respect the other end.

## D3. Presenter

### Context
FR8, FR12–FR14, NFR-P1, M6. The presenter "is the only layer that formats times and dates, applies i18n and the 12/24h preference" (`.claude/rules/architecture.md`).

### Decision
- `src/presenter/locationMeetingRange.ts`: `presentLocationMeetingRange(location row id, zone, meeting, context)` → `PresentedLocationMeetingRange { spanLabel; dayShiftLabel?: string }`; `spanLabel = formatLocalTime(localStart) + MEETING_SPAN_SEPARATOR + formatLocalTime(localEnd)` (`"–"`), `dayShiftLabel` from `locations.dayShiftEarlier` / `locations.dayShiftLater` when the day shift is not `SAME`. The row's date stays `localDateLabel` of the row, which already describes the pinned start.
- `src/presenter/meetingBar.ts`: `formatMeetingDuration(minutes, translate)` with `meeting.durationHours` («{{hours}} ч»), `meeting.durationMinutes` («{{minutes}} мин»), `meeting.durationHoursMinutes` («{{hours}} ч {{minutes}} мин»); `presentMeetingBar(minutes, translate)` → `{ title: meeting.barTitle «Встреча · {{duration}}», shareLabel: meeting.share, clearLabel: meeting.clear }`.
- `src/presenter/meetingHandles.ts`: `presentMeetingHandles(day, meeting, referenceZoneId, language, hourFormat, translate)` → per handle `{ label, valueMinutes, minMinutes, maxMinutes, valueText, startFraction/endFraction }`, value text `formatLocalTime(end instant in the reference zone)`.
- `src/presenter/meetingShareText.ts`: `presentMeetingShareText({ fullDateLabel, durationLabel, rows })` joins with `"\n"` (`MEETING_SHARE_LINE_SEPARATOR`): `meeting.shareHeading` ("Meeting on {{date}}, {{duration}}" / «Встреча {{date}}, {{duration}}»), then per row `meeting.shareLine` ("{{city}}: {{span}}") or `meeting.shareLineShifted` ("{{city}}: {{span}} ({{dayShift}}, {{date}})"). `fullDateLabel` is the date bar's (`presentDateBar`), so the date has one owner.
- Formatters come from the `getDateTimeFormatter` cache; nothing new is cached. A handle move changes only instants, so the second presenting builds no formatter (NFR-P1).

### Consequences
Positive: the share text and the rows say the same spans with the same formatter.
Negative: four small presenter files.

### Alternatives Considered
**`Intl.DurationFormat` for the duration**: not in the `ES2020` / `ES2022.Intl` libs of `tsconfig.app.json` and missing on iOS Safari 12.

## D4. The text sharing port

### Context
FR15, M7. The controller "owns side effects" and views "never call ports directly"; the existing `StorageAvailability` port shows the pattern (`src/ports/storageAvailability.ts`, adapters `localStorageAvailability` / `inMemoryStorageAvailability`, `src/adapters/storageAvailability.contract.ts`). iOS Safari 12.5 has `navigator.share` but no `navigator.clipboard`.

### Decision
- `src/ports/textSharing.ts`: `enum ShareOutcome { SHARED, CANCELLED, COPIED, FAILED }`, `interface TextSharing { shareText(text: string): Promise<ShareOutcome> }`.
- `src/adapters/browserTextSharing.ts`: `createBrowserTextSharing(navigatorLike)`; `browserTextSharing` uses `navigator`. If `navigator.share` exists: `await share({ text })` → `SHARED`; a rejection with `name === SHARE_ABORT_ERROR_NAME` (`"AbortError"`) → `CANCELLED`; any other rejection falls through to copying. Copying: `navigator.clipboard?.writeText(text)` → `COPIED`, missing or rejected → `FAILED`. `share`, `clipboard.writeText` are in the `DOM` lib of `tsconfig.app.json`.
- `src/adapters/inMemoryTextSharing.ts`: `createInMemoryTextSharing({ canShare, isCancelled, canCopy })` that records shared and copied texts. `src/adapters/textSharing.contract.ts` runs the same cases against both (the browser one with a fake navigator).

### Consequences
Positive: E2E and unit tests drive every outcome without a real share sheet.
Negative: one more port and its contract.

### Alternatives Considered
**Call `navigator.share` from the button**: a view calling a browser side effect directly, and untestable outcomes.

## D5. Controller

### Context
FR2, FR5, FR6, FR10, FR12, FR13, FR15. `useTimeSelection` dispatches straight to the store, never through the write scheduler; `useHourGrid` presents strips per `minuteTick`.

### Decision
- `src/controller/useMeetingRange.ts`: reads `store`, `clock` from `LocationsContext` and returns the presented meeting state for Grid — `{ meeting?: { span, handles, bar, rowRanges: ReadonlyMap<locationId, PresentedLocationMeetingRange>, durationMinutes } }` — and the actions `selectCells(first, last)`, `selectFramedHour()`, `moveHandle(handle, move)`, `dragHandleTo(handle, minutes)`, `clearMeetingRange()`; each builds the range with D2 and dispatches `SET_MEETING_RANGE` / `CLEAR_MEETING_RANGE` straight to the store. A handle drag dispatches only when the step changes (same range → same state object, D1).
- `src/controller/useMeetingShare.ts`: `useMeetingShare(textSharing = browserTextSharing)` → `{ shareMeeting(), notice?: MeetingShareNotice, dismissNotice() }`; it builds the text with D3 from the current state (rows from `useLocations`), awaits the port, sets `MeetingShareNotice.COPIED` or `FAILED`, and clears the notice when `state.meeting` changes (effect on the range object) or on the next share. No timer, so no scheduler is needed.
- `src/controller/useMeetingBar.ts`: `useMeetingBar(showsMeetingRange)` → the presented bar while `state.meeting` is set, the active view shows the meeting range (D7) and the list is not empty; `undefined` otherwise.
- `useHourGrid` gains `hasMeetingRange`, so `GridView` hides the hour frame.

### Consequences
Positive: no new side effect besides the port; the range is never written.
Negative: Grid subscribes to the store a third time (strips, rows, meeting) — all read the same snapshot.

### Alternatives Considered
**Auto-hide the copied notice after a delay**: needs another injectable timer; the other notices of the shell also stay until dismissed.

## D6. Grid view: cells, frame, handles

### Context
FR5–FR12, NFR-R1, UX1, UX2. `HourStrip.tsx` is a `role="slider"` with plain `div` cells and no pointer handler; `useHourStripScroll` returns `layout.isScrollable` and the CSS variables `--hour-cell-pitch` and `--grid-row-padding` (`HourGridCssVariable`). The design draws the grips as `li`s with `z-index: 3` at the end of the panel (`docs/design/screens/grid-desktop-meeting-light.html`), the frame with `border: 3px solid`.

### Decision
- **Cells** (`views/grid/useHourCellSelection.ts`, used by `HourStrip`): `onClick` on a cell → `selectCells(column, column)` (works without Pointer Events). `onPointerDown` with `pointerType` mouse or pen, or touch while `!isScrollable`: capture the pointer on the strip; `onPointerMove` maps `clientX` to a column with the strip's `getBoundingClientRect()` and the pitch, and calls `selectCells(anchor, column)` when the column changes; the click after a drag is ignored. The strip's `touch-action` is `pan-y` while not scrollable and `pan-x pan-y` while scrollable, so a finger swipe scrolls and a `pointercancel` ends the gesture without selecting (FR6). `onKeyDown` Enter / Space → `selectFramedHour()` with `preventDefault()`; arrows keep `getTrackMoveForKey`. An `aria-describedby` hint `meeting.hourStripHint` («Enter — выбрать встречу на этот час») is added to the strip.
- **Dimming**: `HourStrip` takes `meetingColumns?: { first, last }`; a cell outside gets `opacity-40` (`MEETING_DIMMED_OPACITY_CLASS`). No cell is bold while a meeting is set (no hour frame).
- **Frame**: `views/grid/MeetingFrame.tsx`, like `HourFrame`: `li aria-hidden`, `absolute top-1 bottom-1 z-[1] pointer-events-none rounded-md border-[3px] border-meeting`, `left = row padding + startMinutes / 60 × pitch`, `width = (endMinutes − startMinutes) / 60 × pitch`, `data-meeting-frame-columns="9-10"` for tests. `GridView` renders it instead of `HourFrame` while a range is set.
- **Handles**: `views/grid/MeetingHandle.tsx`, two `li`s after the frame, `absolute z-[3]`, each with a `div role="slider" tabIndex=0` of 24 × 48 px holding a 12 × 36 px grip (`bg-meeting rounded`), `cursor-ew-resize`, `touch-action: none`, focus ring `focus-visible:outline-accent`. Row placement: the end handle on row `ceil(n / 2)`, the start handle on the next one (both on row 1 when `n = 1`); the vertical offset is the row `li`'s `offsetTop` plus its strip's `offsetTop`, read by a `ResizeObserver` (already used by `useHourStripScroll`). `aria-label`, `aria-valuemin/max/now/valuetext` from D3; keys through `getTrackMoveForKey` → `moveHandle`. The grid row's sticky header box changes `focus-within:z-[3]` to `focus-within:z-[4]` in `LOCATION_ROW_VARIANT_CLASS_NAMES` so an open location menu stays above the handles.
- **Drag** (`views/grid/useMeetingHandleDrag.ts`): pointer capture on the handle; minutes = `(clientX − strip left + panel scrollLeft) / pitch × 60`, then `dragHandleTo`. Auto-scroll: while the pointer is within `MEETING_HANDLE_AUTO_SCROLL_EDGE_PX` (32) of the panel's visible left / right edge and the layout is scrollable, a `requestAnimationFrame` loop scrolls the panel by `MEETING_HANDLE_AUTO_SCROLL_STEP_PX` (8) per frame and re-applies the last pointer position; it stops on leaving the zone, at the scroll end, or on `pointerup` / `pointercancel`. Without Pointer Events (`IS_POINTER_EVENTS_SUPPORTED` false), the same drag runs from `touchstart` / `touchmove` (non-passive, `preventDefault`) / `touchend` on the handle, with the listener options constants of `src/constants/timeSelection.ts`.
- **Slots**: `HourGridSlots` (`views/shared/hourGridSlots.ts`) gains `meetingRangeOf?(row): PresentedLocationMeetingRange | undefined` (D8) and the `frame` slot carries the meeting frame and the handles while a range is set.

### Consequences
Positive: one gesture model per input; the handles never compete with the strip's scroll (`touch-action: none` on the handles only).
Negative: handle positions are measured; a row height change needs one more observer callback.

### Alternatives Considered
**Long-press to start a finger drag on scrolling strips**: hidden gesture; the handles cover resizing.
**Handles as `button`s (as in the design HTML)**: a slider role is what assistive technology needs for value and keys (FR12).

## D7. Meeting bar in the page header

### Context
FR13, NFR-A2, NFR-R1. The header is built by `MainPage` (`src/app/MainPage.tsx`, title plus `headerActions`) inside `AppShellContent` (`src/app/AppShell.tsx`), which also owns the notices. ADR-0005 rejects a hard-coded switch over views.

### Decision
- `ViewDefinition` (`src/views/viewDefinition.ts`) gains `showsMeetingRange?: boolean`; the Grid entry in `src/views/index.ts` sets it. `AppShellContent` resolves the active view (`resolveActiveView(viewRegistry, useViewMode())`) and calls `useMeetingBar(activeView?.showsMeetingRange === true)`.
- `MainPage` gains `meetingBar?: ReactNode`; when given, the `header` gets `bg-meeting-bar border-meeting` and renders only it (no title, no `headerActions`), so `LocationSearch` and its slash shortcut are not mounted.
- New shared block `views/shared/MeetingBar.tsx` (exported from `views/shared/index.ts`): the three-column grid of the header, `h1` with the title in the centre column, two 44 × 44 px icon buttons (`Share2`, `X` from `lucide-react`, `text-meeting`) at the right; `onShare`, `onClear`. After Clear, `AppShellContent` focuses the Add location button (`ADD_LOCATION_BUTTON_ID`) in an effect once the normal header is back.
- `src/app/MeetingShareNotice.tsx` renders `Notice` with `meeting.copiedNotice` or `meeting.shareFailedNotice` in the existing polite notices region; `AppShell` takes `textSharing?: TextSharing` and hands it to `useMeetingShare`.

### Consequences
Positive: the registry still decides which view shows what; Cards needs no change.
Negative: `AppShellContent` grows by the bar and the notice (it stays under 200 lines).

### Alternatives Considered
**Render the bar inside `GridView` through a portal**: the header and the notices are the shell's; a portal hides that ownership.

## D8. Row header: span and day shift mark

### Context
FR8, UX1. `LocalDateTime.tsx` renders the time button and the date; `LocationRow.tsx` is 199 lines.

### Decision
- `LocalDateTime` takes `meetingRange?: PresentedLocationMeetingRange`: the time button shows `spanLabel` in `text-meeting-text` (same button, same `aria-label`, the wall-time input opens with the local time), and before the date a `span` with `dayShiftLabel` in `font-bold text-danger bg-surface`. `ZoneRowContent` passes it through; `LocationRow` takes `meetingRange` from `hourGrid.meetingRangeOf(row)` via `LocationList`.
- To keep `LocationRow.tsx` under 200 lines, its notes block moves to a new `views/shared/RowNotes.tsx` (wall-time hint, clock change note, the variant's notes box), unchanged in output.

### Consequences
Positive: Cards is untouched (no `meetingRange`); the span reuses the row's button and focus rules.
Negative: one more optional prop through three components.

### Alternatives Considered
**A separate span line under the row header**: not in the design, and it would leave the time button showing one moment beside the span.

## D9. Tokens, constants and texts

### Context
FR7, FR8, FR13, UX1; `docs/architecture/views.md` → Visual style → Grid; `.claude/rules/code-style.md` (constants in `src/constants/`), `.claude/rules/i18n.md` (both locale files).

### Decision
- `src/styles/tokens.css`, three theme blocks: `--color-meeting` (`#00aa00` / `#3dd13d`), `--color-meeting-text` (`#008800` / `#5edb5e`), `--color-meeting-bar` (`#e0f5e0` / `#13301d`); `tailwind.config.ts` names `meeting`, `meeting-text`, `meeting-bar`. `--color-danger` exists already.
- `src/constants/meeting.ts` (exported from `src/constants/index.ts`): `MEETING_SPAN_SEPARATOR = "–"`, `MEETING_SHARE_LINE_SEPARATOR = "\n"`, `SHARE_ABORT_ERROR_NAME = "AbortError"`, `MEETING_HANDLE_AUTO_SCROLL_EDGE_PX = 32`, `MEETING_HANDLE_AUTO_SCROLL_STEP_PX = 8`, `MEETING_DIMMED_OPACITY_CLASS = "opacity-40"`, `MEETING_HANDLE_ROW_DIVISOR = 2`.
- Keys in `src/locales/en.json` and `ru.json`: new namespace `meeting` (a new domain, the glossary's Meeting range): `barTitle`, `durationHours`, `durationMinutes`, `durationHoursMinutes`, `share` («Поделиться встречей» / "Share meeting"), `clear` («Сбросить выбор встречи» / "Clear meeting"), `startHandle` («Начало встречи» / "Meeting start"), `endHandle` («Конец встречи» / "Meeting end"), `hourStripHint`, `shareHeading`, `shareLine`, `shareLineShifted`, `copiedNotice` («Текст встречи скопирован» / "Meeting text copied"), `shareFailedNotice` («Не удалось поделиться встречей» / "Could not share the meeting"); in `locations`: `dayShiftEarlier` («днём раньше» / "a day earlier"), `dayShiftLater` («днём позже» / "a day later").

### Consequences
Positive: both themes come from tokens; every text is translated in both files.
Negative: three more tokens to keep in sync across the three theme blocks.

### Alternatives Considered
**Reuse `--color-accent` for the meeting**: ADR-0011 makes the meeting frame green and the hour frame accent blue, so the two must differ.

## D10. Tests that change

### Context
FR5, FR13, FR15. Existing tests assert that a tap on a cell does nothing, and no test can open a real share sheet.

### Decision
- "A tap on a cell changes nothing" in `src/test/features/grid_view/grid_view_hour_frame_unit.feature` (and its step) is replaced by "A tap on a cell sets a one-hour meeting range"; `src/views/grid/HourStrip.test.tsx` "should do nothing on a pointer down or a click on a cell" becomes "should select the cell's hour on a click".
- `src/test/features/main_page/main_page_header_e2e.feature` gains "The meeting bar replaces the header" and "Cards keeps its header with a meeting range" of `main-page`.
- E2E share scenarios stub the browser with `page.addInitScript` (`navigator.share` resolving or rejecting with an `AbortError`, `navigator.share` deleted, `navigator.clipboard.writeText` rejecting) and read the clipboard after `context.grantPermissions(["clipboard-read", "clipboard-write"])`.

### Consequences
Positive: the removed guarantee is replaced by its opposite in the same files; every share outcome runs in a real browser.
Negative: the system share sheet itself is never opened by a test (handoff H2).

### Alternatives Considered
**Keep the old tap scenario and add a new one**: the two would contradict each other.
