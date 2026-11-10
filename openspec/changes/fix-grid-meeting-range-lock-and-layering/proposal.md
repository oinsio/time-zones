# Lock row controls and type the meeting range in Grid; keep the grid panel under the page's bars and dialogs

Task #112 («Исправление внешнего вида Сетка») reports five defects of the Grid view after `add-grid-meeting-range-and-share`: two in the meeting state, three in the layers of the grid panel. No active change touches the Grid view (the only other one, `add-pr-preview-deploy`, changes `app-delivery`).

## Why

The meeting state was built for the pointer: a meeting range can be set only with a tap, a drag or a meeting handle, and while it is set every row still offers its drag handle, its location menu and its wall-time input. The wall-time input silently ends the meeting (`SET_WALL_TIME` removes the meeting range, ADR-0011), a reorder or a removal changes the rows under the frame, and a user who knows the times ("10:00 to 12:30 in Moscow") has to drag them step by step.

The grid panel also paints over the rest of the page. Its frame (`z-[1]`), row header boxes (`z-[2]`, `focus-within:z-[4]`) and meeting handles (`z-[3]`) are positioned layers of the page's root stacking context (`packages/client/src/views/shared/locationRowVariant.ts`, `views/grid/HourFrame.tsx`, `MeetingFrame.tsx`, `MeetingHandle.tsx`), while the search and calendar dialogs (`src/components/ui/dialog.tsx`: `fixed`, no z-index) and the date bar (`src/app/MainPage.tsx`: `<footer className="sticky bottom-0 …">`, no z-index) have none. So the row texts, the frame and the handles show through the dialogs and over the calendar and Now buttons. And the frame breaks where there is no text: the zone line's whole box carries the surface background (`ZoneRowContent` passes `bg-surface` to the `ZoneLine` container, which spans the full place column on a phone), and so does the 44 × 44 px time button (`LocalDateTime.tsx`).

Audience: everyone who plans a meeting in Grid, and keyboard users, who cannot drag.

## What Changes

- ADDED to `grid-view`: while a meeting range is set, the drag handle, the location menu and the wall-time input of every grid row are locked; they come back when the range is removed.
- ADDED to `grid-view`: the **meeting range input** — the span of a grid row opens two fields, start and end, in the row's local time; confirming them sets the meeting range.
- ADDED to `meeting-range`: setting the meeting range from a location's wall-clock start and end.
- ADDED to `grid-view`: the grid panel lies under the date bar, its notices and every dialog; the frame is hidden only behind text, never behind the empty part of a text's box.
- MODIFIED `grid-view` → **Meeting span in grid rows**: the span opens the meeting range input instead of the wall-time input.
- MODIFIED `grid-view` → **Accessible meeting state**: the Tab order skips the locked controls and includes the meeting range input; axe-core also checks the open input.
- Glossary: new **Meeting range input** (`time-selection.md`) with its *RU:* names «Ввести время встречи», «Время начала» and «Время окончания», distinct from the **Meeting handle**'s «Начало встречи» / «Конец встречи»; **Meeting range**, **Wall-time input** (`time-selection.md`), **Drag handle** and **Location menu** (`locations.md`) say they are locked in Grid while a meeting range is set.
- Docs: `docs/architecture/views.md` (Grid → Hour frame and meeting frame: locked controls, the meeting range input, the layers of the page), `docs/architecture/domain-model.md` (the new command).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `grid-view`: locked row controls in the meeting state, the meeting range input, the layers of the grid panel against the page, the frame visible beside texts; "Meeting span in grid rows" and "Accessible meeting state" change.
- `meeting-range`: a meeting range set from a location's wall-clock start and end.

## Goals

- G1: In the meeting state no row control can change the list or end the meeting by accident; after the meeting all of them work again.
- G2: A meeting range is set with the keyboard alone by typing its start and end in any row's local time.
- G3: Nothing of the grid panel is drawn over a dialog, the date bar or a notice, in any state and at any scroll position.
- G4: The hour frame and the meeting frame are drawn everywhere except behind text glyphs and row notes.

## Non-Goals

- NG1: Cards does not change: it ignores the meeting range (ADR-0011), so its row controls stay available and its wall-time input still ends the meeting.
- NG2: No meeting range across the end of the reference day through the input (ADR-0011: "the user picks the next day instead").
- NG3: The hour strip's own keys (time selection) and its Enter keep their behaviour.
- NG4: No new date control inside the meeting range input: it uses the date the row shows.
- NG5: No change of the date bar, the dialogs or the notices themselves, other than their layer.

## Users & Scenarios

- U1: A user has set a meeting 09:00–11:00 in Almaty. The drag handles and «⋯» buttons are dimmed and do nothing; tapping a time opens start and end fields. After «Сбросить выбор встречи» they work again.
- U2: A keyboard user tabs to Moscow's span `07:00–09:00`, presses Enter, types `8` in the start field and `10:30` in the end field and presses Enter: the meeting is 10:00–12:30 in Almaty and «Встреча · 2 ч 30 мин».
- U3: A phone user with twelve locations scrolls the grid: the rows pass under the date bar, and the calendar and Now buttons stay on top.
- U4: A user opens the search: the dialog covers the grid, with no city or frame showing through.

## Requirements

### Functional

- FR1: In the Grid view, while a meeting range is set, the drag handle, the location menu button and the wall-time input of every grid row are locked: they are shown dimmed, do not react to pointer, touch or keyboard, are not Tab stops and are exposed as disabled; no reorder can start. An open location menu closes and an open wall-time input closes without a change when a meeting range is set.
- FR2: When the meeting range is removed (Clear meeting, Now, a time selection, a reference zone change, an emptied list), every control of FR1 is available again. Cards never locks them (NG1).
- FR3: While a meeting range is set, the span of a grid row is a button named «Ввести время встречи — {city}, {span}» ("Enter meeting time — {city}, {span}"). It opens the meeting range input in place of the span: two text fields, the start time field «Время начала — {city}» and the end time field «Время окончания — {city}» ("Start time — {city}", "End time — {city}"; distinct from the meeting handles «Начало встречи» / «Конец встречи»), with the row's local start and end in the hour format setting, the start field focused and its text selected. The fields accept the texts the wall-time input accepts.
- FR4: Enter in either field, or the focus leaving both fields after a text changed, confirms. A field whose text is not a time shows «Введите время в формате ЧЧ:ММ» and the input stays open. Typed times that do not make a valid meeting range show «Встреча должна быть внутри дня, с шагом 15 минут» ("The meeting must lie within the day, in 15-minute steps"), the input stays open and nothing changes. A valid pair sets the meeting range, closes the input and returns the focus to the span. Esc, or the focus leaving both unchanged fields, closes the input without a change.
- FR5: Setting a meeting range from wall-clock times takes a location, the local date the row showed when the input opened and a start and an end wall-clock time. The start is that date and time in the location's zone; the end is the first instant after the start with the end wall-clock time (on the same date, or the next one when it is not later). Both resolve as the wall-time input resolves a gap or an overlap. The result follows "Set and clear a meeting range" of `meeting-range`: it is refused with `INVALID_MEETING_RANGE` when it breaks the meeting range invariants, and with `LOCATION_NOT_FOUND`, `INVALID_TIME` or `INVALID_DATE` for a missing row or a malformed time or date; a refusal changes nothing.
- FR6: Every dialog of the main page (the search, opened from Add location while no meeting range is set, and the calendar, in any state) and its backdrop lie above everything of the grid panel — row header texts, hour strips, row notes, the hour frame, the meeting frame and the meeting handles — in every state of the grid and at every scroll position.
- FR7: The date bar and the notices region above it lie above everything of the grid panel while rows scroll under them; an open location menu still lies above the date bar.
- FR8: The hour frame and the meeting frame are hidden only behind the glyphs of the row header texts (city, offset difference, Here caption, every zone line part, date, day shift mark, time or span), behind the row notes and behind an open wall-time input or meeting range input. Where a frame's border crosses a row header and no text is drawn — between zone line parts, beside a short time inside its 44 × 44 px button, beside the drag handle and the menu button — the border is drawn.

### Non-Functional

#### Performance

None: the change adds no work per row or per tick.

#### Accessibility

- NFR-A1: axe-core reports no violations on the Grid view with a meeting range set, with and without an open meeting range input and with an input error shown, in the light and the dark theme. The fields have accessible names, an error is tied to its field (`aria-invalid`, `aria-describedby`), and each locked control is exposed as disabled.
- NFR-A2: The keyboard alone opens, fills, confirms and cancels the meeting range input. In the meeting state the Tab order is «Поделиться встречей», «Сбросить выбор встречи», then per row its span button and its hour strip, then the meeting handles «Начало встречи», «Конец встречи». While a row's meeting range input is open, its two fields take the place of that row's span button in this order: «Время начала — {city}», «Время окончания — {city}», then that row's hour strip; no drag handle and no location menu button is a Tab stop. After Clear meeting the drag handles and menu buttons are Tab stops again.

#### Responsive

- NFR-R1: At 320 × 640 and 390 × 844 the open meeting range input fits in its row header without horizontal page scrolling, both fields visible.
- NFR-R2: Approved screenshots match on every run: Grid with the hour frame and the search dialog open at 390 × 844, and with the sample meeting and the calendar dialog open at 1440 × 900, light theme; the existing Grid and meeting-state baselines are re-approved where the frame now shows beside texts.

## UX Acceptance Criteria

- UX1: Locked controls read as unavailable at a glance: dimmed to opacity 0.4, the default cursor, no hover or pressed effect.
- UX2: The meeting range input reads like the wall-time input (accent border, bold digits) with a dash `–` between the two fields, in the meeting time colour.
- UX3: A frame line runs unbroken through the empty parts of a row header; it breaks only where a word or a number is.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | Grid, no meeting range | every row control available; the span is the time button of the wall-time input (FR2) |
| any | Grid, meeting range set | drag handles, menu buttons and wall-time inputs locked; spans open the meeting range input (FR1, FR3) |
| any | meeting range input open | two fields; Enter confirms, Esc cancels (FR4) |
| any | input text not a time | field error, input stays open (FR4) |
| any | times not a valid meeting range | range error, input stays open, nothing changes (FR4, FR5) |
| any | the row vanishes while its input is open (list from another tab) | the input closes with the row; nothing changes (FR5: `LOCATION_NOT_FOUND`) |
| any | list becomes empty while a range is set | range removed, empty state; nothing locked (FR2) |
| any | stored list unreadable | load error with Reset (unchanged) |
| any | Grid chunk loading / failed | `ViewSkeleton` / `ViewErrorFallback` (unchanged) |
| offline | any of the above | unchanged: everything is local |
| any | a dialog open / rows scrolled under the date bar | the dialog or the date bar lies on top (FR6, FR7) |
| any | Cards with a range set | nothing locked; wall-time input as before (NG1) |

## Behavior

- New unit BDD, tagged `@fix-grid-meeting-range-lock-and-layering`: `packages/client/src/test/features/meeting_range/meeting_range_wall_times.feature` (FR5) and `src/test/features/grid_view/grid_view_meeting_lock_unit.feature` (FR1–FR4 in jsdom: disabled state, the input's confirm, errors, cancel).
- New playwright-bdd features: `src/test/features/grid_view/grid_view_meeting_lock_e2e.feature` (Tab order, keyboard entry, layout of the input, axe-core — FR1–FR4, NFR-A1, NFR-A2, NFR-R1) and `grid_view_layers_e2e.feature` (dialogs, date bar, frame lines, screenshots — FR6–FR8, NFR-R2, UX3).

## Visual Reference

No Figma. The meeting screens of `docs/design/README.md` → Grid; colours and the dimming value from `docs/architecture/views.md` → Visual style and the existing `opacity-40` of dimmed hour cells.

## Affected IA

No changes.

## Success Metrics

- M1: With the sample meeting (09:00–11:00 Almaty on 2026-03-08; Almaty, Moscow, Kolkata, New York) 0 of 8 drag handles and menu buttons are Tab stops or react to a click, 0 of 4 spans open the wall-time input; after Clear meeting 8 of 8 are Tab stops and 4 of 4 times open the wall-time input.
- M2: Typed in the meeting range input, 5 of 5 valid pairs set the expected range in Almaty: Almaty `10`–`12:30` → 10:00–12:30; Moscow `8`–`10:30` → 10:00–12:30; Kolkata `9:30`–`11:30` → 09:00–11:00; New York `23`–`1` → 09:00–11:00; Almaty `9 am`–`11 am` (English) → 09:00–11:00.
- M3: 4 of 4 invalid inputs are refused with the state unchanged: Almaty `abc`–`11` (text error), Almaty `9:10`–`11` (off the track step), Almaty `22`–`2` (past the day's end), New York `13`–`14` (before the day's start).
- M4: At 390 × 844, in 3 of 3 cases (the search over the hour frame, the calendar over the hour frame, the calendar over the sample meeting) 0 of the sampled centres of row header texts, hour cells and meeting handles inside the dialog's backdrop show a grid element on top.
- M5: With 12 locations at 390 × 844 scrolled so that rows pass under the date bar, the topmost element at the centre of the calendar button and of the Now button is that button, and at 0 sampled points of the date bar a grid element is on top; with no meeting range and a location menu opened just above the date bar, the topmost element is the menu item at the centre of each of its items over the date bar, with at least 1 item over the date bar.
- M6: At 390 × 844 and 1440 × 900, 0 sampled points of the frame borders across the 4 sample rows are covered by a non-transparent background outside the glyph boxes of texts and the row notes, for the hour frame and the meeting frame.

## Open Questions

None. How the lock reaches the rows, where the wall-clock times become instants, and how the layers are ordered are settled in `design.md`.

## Impact

- `packages/client/src/model/` (new `reduceMeetingRangeWallTimes.ts`; `locationCommands.ts`, `locations.ts`), `src/controller/useMeetingRange.ts`, `src/presenter/locationMeetingRange.ts`, `src/views/shared/` (new `MeetingRangeInput.tsx`, `wallTimeFieldKeys.ts`, `useSortableLocationRow.ts`; `LocalDateTime.tsx`, `ZoneRowContent.tsx`, `ZoneLine.tsx`, `LocationRow.tsx`, `LocationList.tsx`, `DragHandle.tsx`, `LocationMenu.tsx`, `hourGridSlots.ts`, `locationRowVariant.ts`), `src/views/grid/` (`GridView.tsx`, `HourFrame.tsx`, `MeetingFrame.tsx`, `MeetingHandle.tsx`), `src/components/ui/dialog.tsx`, `src/app/MainPage.tsx`, `tailwind.config.ts`, `src/locales/en.json` and `ru.json`.
- Tests: new unit and E2E features above, new and re-approved screenshot baselines.
- Docs: `docs/glossary/time-selection.md`, `locations.md`; `docs/architecture/views.md`, `domain-model.md`.
- No new dependency, no stored data change.
