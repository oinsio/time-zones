# Design: Lock row controls and type the meeting range in Grid; keep the grid panel under the page's bars and dialogs

Motivation: proposal.md → Why. Every decision below is local to this change; none changes an ADR. Paths are under `packages/client/src/`. Owners named by the glossary are extended, never copied: the meeting range (`MeetingRange`, `useMeetingRange`), the wall-time input (`SET_WALL_TIME`, `parseWallTimeInput`, `WallTimeInput`), the drag handle (`DragHandle`), the location menu (`LocationMenu`), the hour grid slots (`HourGridSlots`).

## D1. The lock is a slot of the Grid view, derived from the meeting range

### Context
Driven by FR1, FR2, UX1 from proposal. The meeting range reaches Grid through `useMeetingRange` (`controller/useMeetingRange.ts`); `GridView` hands the shared row components a `HourGridSlots` object (`views/shared/hourGridSlots.ts`: `renderHourStrip`, `frame`, `meetingRangeOf`, `panelRef`, `panelStyle`), Cards passes none. `LocationRow` (`views/shared/LocationRow.tsx`, 199 lines) composes `DragHandle`, `ZoneRowContent` and `LocationMenu`; `useSortable` drives the reorder for pointer, touch and keyboard. `LocalDateTime` turns the time or span into the button of `WallTimeInput`, whose confirmation dispatches `SET_WALL_TIME`, which removes the meeting range (`model/reduceWallTime.ts` → `withoutMeetingRange`).

### Decision
- `HourGridSlots` gains `areRowControlsLocked: boolean`; `GridView` sets it to `meeting !== undefined`. `LocationList` passes it to every `LocationRow`.
- `LocationRow` calls `useSortable({ id, transition, disabled: areRowControlsLocked })`, so no sensor starts a reorder, and passes `isDisabled` to `DragHandle` and `LocationMenu`. Both render `disabled` on their buttons with `disabled:opacity-40 disabled:cursor-default` and no hover style. `LocationMenu` closes an open menu when `isDisabled` becomes true.
- `LocalDateTime` shows the meeting range input (D4), never `WallTimeInput`, while `meetingRange` is set. An open `WallTimeInput` is unmounted when `meetingRange` appears, without calling `onConfirm` (its opened date is reset by an effect on `meetingRange === undefined`).

### Consequences
Positive:
- One source: the model's meeting range; Clear, Now, a time selection, a zone change and an emptied list unlock the rows with no extra code.
- Cards is never locked (NG1).

Negative:
- A control that has the focus when the meeting starts loses it to `document.body`; a meeting starts by a tap or Enter on a strip, never from these buttons.

### Alternatives Considered
**`ViewLocationList` reads `useMeetingRange()` itself**: Cards would lock its controls too, though it ignores the meeting range (ADR-0011).
**Hide the controls**: the task asks for locked controls, and hiding them would shift every row header when a meeting starts.

## D2. A model command resolves the wall-clock times

### Context
Driven by FR5. `resolveWallClock` (`model/wallClock.ts`, `compatible`) resolves a wall-clock time; the canonical `HH:MM` check is the private `isCanonicalTime` of `reduceWallTime.ts`; `reduceSetMeetingRange` (`model/reduceMeetingRange.ts`) is the one place that validates a range (`isValidMeetingRange`) and returns `INVALID_MEETING_RANGE`.

### Decision
New `LocationCommandType.SET_MEETING_RANGE_WALL_TIMES` with `{ target: WallTimeTarget; date: string; start: string; end: string }`, reduced by new `model/reduceMeetingRangeWallTimes.ts` and routed by `reduceLocations` (`model/locations.ts`):

1. `start` and `end` must pass the canonical time check, else `INVALID_TIME`; `date` must parse as `Temporal.PlainDate`, else `INVALID_DATE`; the target must be in the list, else `LOCATION_NOT_FOUND`. The check moves from `reduceWallTime.ts` to `wallClock.ts` as exported `isCanonicalWallTime`, used by both reducers.
2. `start` = `resolveWallClock(zone, date + start).instant`; `end` = `resolveWallClock(zone, date + end).instant`, recomputed on `date + 1 day` when it is not after `start`.
3. Return `reduceSetMeetingRange(state, { start: start.toString(), end: end.toString() })`.

The command goes straight to the store like `SET_MEETING_RANGE`, never through the write scheduler.

### Consequences
Positive:
- Zone resolution stays in the model; invariants, the pin and `INVALID_MEETING_RANGE` keep a single owner.

Negative:
- One more command type in `LocationCommand`.

### Alternatives Considered
**The controller resolves the instants and dispatches `SET_MEETING_RANGE`**: time math belongs to the model (`.claude/rules/architecture.md`), and `resolveWallClock` would get a caller outside it.

## D3. The controller parses and reports an outcome

### Context
Driven by FR4. `useWallTimeInput` parses with `parseWallTimeInput(text, getDayPeriodMarkers(language))` and returns `WallTimeInputOutcome`.

### Decision
`useMeetingRange` gains `confirmMeetingRangeInput(locationId, startText, endText, date): MeetingRangeInputOutcome`; enum `MeetingRangeInputOutcome { INVALID_START_TEXT, INVALID_END_TEXT, INVALID_RANGE, CLOSED }`, exported from `controller/index.ts`. It parses both texts with the same parser and markers, returns the first text error, otherwise dispatches D2: `INVALID_MEETING_RANGE` → `INVALID_RANGE`; success or any other refusal (a vanished row) → `CLOSED`, as `useWallTimeInput` closes on a refusal.

### Consequences
Positive:
- The view only shows errors; parsing has one owner.

Negative:
- `useMeetingRange` grows by about 30 lines (now 140).

### Alternatives Considered
**A separate `useMeetingRangeInput` hook**: a second subscriber to the same store for one action; rejected for one more file with no new state.

## D4. The meeting range input is a shared view block

### Context
Driven by FR3, FR4, NFR-A1, NFR-A2, NFR-R1, UX2. `LocalDateTime` is a shared block (`views/shared/`); `PresentedLocationMeetingRange` (`presenter/locationMeetingRange.ts`) holds `spanLabel` and `dayShiftLabel`; `DragHandle` builds its accessible name in the view with `t()` and the row's city.

### Decision
- New `views/shared/MeetingRangeInput.tsx`: two `type="text"` `inputMode="numeric"` fields styled like `WallTimeInput` (accent border, bold tabular digits) in `text-meeting-text`, a `–` between them, both in one wrapper, widths `w-20 md:w-28`. The keys kept inside a field move from `WallTimeInput.tsx` to shared `wallTimeFieldKeys.ts`, used by both.
- A focus leaving the wrapper (`onBlur` with `relatedTarget` outside it) confirms when a text changed and closes otherwise; a move between the fields does nothing. The error is shown under the wrapper and tied to the invalid field (`aria-invalid`, `aria-describedby`); a range error marks both.
- i18n (both `ru.json` and `en.json`): `meeting.rangeInputLabel` «Ввести время встречи — {{city}}, {{span}}», `meeting.rangeInputStartLabel` «Начало встречи — {{city}}», `meeting.rangeInputEndLabel` «Конец встречи — {{city}}», `meeting.rangeInputError` «Встреча должна быть внутри дня, с шагом 15 минут»; the text error reuses `locations.wallTimeInputError`.
- `PresentedLocationMeetingRange` gains `startTimeLabel` and `endTimeLabel`, the two ends `spanLabel` already joins.
- New optional slot `HourGridSlots.onConfirmMeetingRange`, bound by `GridView` to `confirmMeetingRangeInput`; `LocationRow` forwards it with the row id, `ZoneRowContent` passes it and `cityLabel` to `LocalDateTime`, which holds the switch between the two inputs, keeping `LocationRow` under 200 lines.

### Consequences
Positive:
- Keyboard entry of a meeting where the user already looks (the span); the wall-time input and the new input share their key handling.

Negative:
- `LocalDateTime` gains a second editing mode.

### Alternatives Considered
**One field with a `start–end` text**: `inputMode="numeric"` on iOS shows no dash or space, so the separator could not be typed on a phone.
**Fields in the meeting bar, in the reference zone**: NFR-R1 of `add-grid-meeting-range-and-share` keeps the bar's title and buttons on one 320 px line; and typing in another location's time is the point of a world clock.

## D5. One layer scale for the page

### Context
Driven by FR6, FR7. `HourFrame` and `MeetingFrame` are `absolute z-[1]`, the sticky boxes `z-[2]` (`focus-within:z-[4]`, `views/shared/locationRowVariant.ts`), the handles `z-[3]`, a dragged row `relative z-10`, an open location menu `fixed z-20`. The grid panel `<ul>` has no z-index, so these compete in the root stacking context, where `DialogPrimitive.Overlay` / `Content` (`components/ui/dialog.tsx`, `fixed`) and the date bar `<footer>` (`app/MainPage.tsx`, `sticky bottom-0`) have `z-index: auto` and paint below every positive z-index.

### Decision
`tailwind.config.ts` gets `theme.extend.zIndex`, lowest first:

| Token | Value | Used by |
|---|---|---|
| `grid-frame` | 1 | `HourFrame`, `MeetingFrame` |
| `grid-box` | 2 | sticky header and notes boxes |
| `meeting-handle` | 3 | `MeetingHandleSlider` |
| `grid-box-focused` | 4 | header box `focus-within:` |
| `page-bar` | 10 | the date bar `<footer>` with its notices region |
| `dragged-row` | 15 | a dragged `LocationRow` |
| `location-menu` | 20 | an open location menu |
| `dialog` | 30 | dialog overlay and content |

Every `z-[n]`, `z-10` and `z-20` named above is replaced by its token.

### Consequences
Positive:
- The page's layer order is read in one place; an open menu and a dragged row stay above the date bar (FR7).

Negative:
- A future positioned layer must take a token, or it falls back to the root order.

### Alternatives Considered
**`isolation: isolate` on the grid panel**: the `fixed` location menu inside the panel would be trapped below the date bar.

## D6. Surface background only behind glyphs

### Context
Driven by FR8, UX3. `ZoneRowContent` passes `className="bg-surface text-sm text-muted-foreground"` to `ZoneLine`, whose container is a flex item stretched over the place column on a phone; the `LocalDateTime` time button carries `bg-surface` on its whole `min-h-11 min-w-11` box.

### Decision
`ZoneRowContent` passes `text-sm text-muted-foreground` to `ZoneLine` (its parts keep `bg-surface`); the time button drops `bg-surface` and wraps its label in `<span className="bg-surface">`. Open input fields keep their background (FR8 exception).

### Consequences
Positive:
- Frame borders run through the empty parts of a header.

Negative:
- Approved Grid screenshots may change and need re-approval (H1).

### Alternatives Considered
**Draw the frame above the header and mask the texts**: needs per-text masks; the backgrounds already carry the rule.

## D7. Where each test sits

### Context
Driven by `.claude/rules/bdd-unit.md` and `bdd-e2e.md`: keyboard, focus, layout and real-browser behaviour need a browser.

### Decision
jsdom (Vitest and unit BDD): the model command (M2, M3), the controller outcomes, `disabled` attributes and the disabled sortable, the input's confirm, cancel and errors, the layer token classes. Real browser (`*_e2e.feature`): Tab order and keyboard entry (NFR-A2), layout at 320 and 390 px (NFR-R1), axe-core (NFR-A1), topmost elements under dialogs and the date bar (FR6, FR7), the frame-border coverage check (FR8: for points along each frame border, every element from `document.elementsFromPoint` inside a grid row with a non-transparent `background-color` must hold the point in the client rect of one of its text nodes, or be a row note or an `input`), and the screenshots (NFR-R2).

### Consequences
Positive:
- Each test proves what its runner can see.

Negative:
- `elementsFromPoint` skips `pointer-events: none` elements, so the check reasons about what covers the frame, never about the frame itself.

### Alternatives Considered
**Pixel sampling of a screenshot**: no PNG decoder is installed, and colours depend on anti-aliasing.
