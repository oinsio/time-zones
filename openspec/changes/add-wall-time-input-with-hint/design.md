# Design: Add wall-time input with hint

## Context

Driven by FR1–FR13, NFR-P1, NFR-A1–NFR-A4, NFR-R1, NFR-R2 and UX1–UX3 of `proposal.md`. The three changes it builds on (`support-legacy-ios-12-safari`, `set-home-location-and-show-differences`, `show-here-entry-for-device-time`) are archived and on `main`. Every owner below was opened on `main` in `packages/client/src/`; the glossary (`docs/glossary/`) names each one.

- **Wall-clock time → instant, wall-clock status**: `resolveWallClock(timeZoneId, plainDateTime)` and `WallClockStatus` in `model/wallClock.ts`. It resolves with `compatible` and classifies with `earlier` / `later` (three `PlainDateTime#toZonedDateTime` calls). `reduceReferenceMoment.ts` (`SET_DATE`, `SHIFT_DATE`) calls it.
- **Legacy zone names**: `lib/legacy/zoneShim.ts` wraps `Intl.DateTimeFormat`. `lib/legacy/zoneShim.temporal.test.ts` already proves that `resolveWallClock("Europe/Kyiv", …)` gives `UNIQUE`, `GAP` and `AMBIGUOUS` on an engine that accepts only `Europe/Kiev`. So the shim covers `PlainDateTime#toZonedDateTime` (proposal Q5).
- **Pointer Events**: `IS_POINTER_EVENTS_SUPPORTED` in `lib/legacy/pointerEvents.ts`, exported by `lib/legacy/index.ts`. The E2E helper `emulateEngineWithoutPointerEvents` is in `test/e2e/withoutPointerEvents.ts`. `test/noBigIntInSources.test.ts` fails on BigInt literals, `BigInt(` and `epochNanoseconds` in production sources.
- **Reference moment**: `ReferenceMoment` in `model/referenceMoment.ts`. `PINNED` carries `instant`, `wallClockStatus` and `requestedWallTime` (a `Temporal.PlainTime`). `getReferenceZone` and `getEffectiveInstant` live there too.
- **Reference-zone rule**: `model/followReferenceZone.ts`. `reduceLocations` runs it after every command. When the reference zone changed and the moment is `GAP`, it keeps the instant, sets `UNIQUE` and rewrites `requestedWallTime`, which ends the gap note.
- **Time selection**: `reduceSelectInstant` in `model/reduceSelectInstant.ts` returns the same state object for the instant already pinned; its status is always `UNIQUE`. The controller is `useTimeSelection` (`controller/useTimeSelection.ts`), which dispatches straight to the store.
- **Commands and reducer**: `LocationCommandType`, `LocationErrorCode`, `LocationCommand` and `reduceLocations` in `model/locations.ts`, **192 lines** today.
- **Here entry**: `getHereEntry(state)` in `model/hereEntry.ts`; `useLocations` returns it, `useHereEntry` presents it with `presentHereEntry`.
- **Gap note**: `buildDateBar` in `controller/useReferenceMoment.ts` decides `gap` from `reference.wallClockStatus === GAP`; `presentDateBar` in `presenter/dateBar.ts` formats both times with an inline `time.toLocaleString(language, LOCAL_TIME_FORMAT_OPTIONS)`, which builds a formatter per call (ADR-0008, Context).
- **Local time label**: `formatLocalTime` in `presenter/localDateTime.ts`, on the cached `getDateTimeFormatter(language, timeZoneId, kind)` of `presenter/dateTimeFormatters.ts`.
- **UTC offset**: `getUtcOffsetMinutes` (model) and `formatUtcOffset(offsetMinutes, utcPrefix)` (presenter) with the prefix `locations.utcOffsetPrefix` and the minus sign `UTC_OFFSET_MINUS_SIGN` (`−`).
- **Zone part of a row**: `presentZoneMoment(subject, context)` in `presenter/presentZoneMoment.ts` (105 lines), with `LocationRowsContext`. Both `presentLocationRows` and `presentHereEntry` spread it, so a field added there reaches location rows and the Here entry.
- **Card layout block**: `views/shared/ZoneRowContent.tsx` (114 lines) renders the place column, `LocalDateTime` and `DayTrack` for `LocationRow` and `HereEntryRow`. `LocalDateTime.tsx` (30 lines) renders the time as a plain `<span>`. The reorder `KeyboardSensor` (`LocationList.tsx`) listens on the drag handle only (`DragHandle` gets the sortable `listeners`).
- **Tokens**: `styles/tokens.css` has `--color-notice` / `--color-notice-foreground` for both themes (Tailwind `bg-notice`, `text-notice-foreground`): a warm yellow background with dark text, used for app notices. There is no other warning token.

Binding decisions: ADR-0002 (commands as JSON, views emit events, view state in the view), ADR-0003 (wall-clock input and DST, the moment is never stored), ADR-0004 (only repositories write), ADR-0007 (reference zone, the Here entry), ADR-0008 (work bounds). No global decision is needed.

## Goals / Non-Goals

**Goals:** add the wall-time input by extending the existing owners. The only new model state is the wall-time target. One parser for typed text, one rule for "which note is shown", one formatter for a wall-clock time in a note.

**Non-Goals:** a generic time-field component; any change to storage, tab sync or the date bar's layout.

## Decisions

### D1. Model: `SET_WALL_TIME` resolves through `resolveWallClock` (FR3, FR4, FR10, FR13)

`model/locations.ts` would pass 200 lines with one more command and error. First, without changing behaviour, `LocationCommandType`, `LocationErrorCode` and the `LocationCommand` union move to new `model/locationCommands.ts`; `locations.ts` re-exports them, so every import stays as it is. Then the new command:

```ts
| {
    type: LocationCommandType.SET_WALL_TIME;
    target: WallTimeTarget;
    /** "HH:MM", 24-hour. */
    time: string;
    /** ISO date: the row's local date when the field opened. */
    date: string;
  }
```

It is reduced in new `model/reduceWallTime.ts`:

1. Checks the shape: `time` must match `WALL_TIME_COMMAND_PATTERN` (`HH:MM`, hours 0–23, minutes 0–59), else new `LocationErrorCode.INVALID_TIME`. A `date` that `Temporal.PlainDate.from` rejects gives the existing `INVALID_DATE`. The lenient formats belong to the parser (D3) and are not repeated here.
2. Finds the zone of the target: the location's `timeZoneId` (no such location → `LOCATION_NOT_FOUND`), or `getHereEntry(state)?.timeZoneId` for the Here entry (no Here entry, because a location now shows the device time → `LOCATION_NOT_FOUND`, the same "row is gone" answer).
3. Calls `resolveWallClock(zone, date.toPlainDateTime(time))`. A `RangeError` beyond Temporal's range gives the existing `DATE_OUT_OF_RANGE`.
4. Pins `{ mode: PINNED, instant, wallClockStatus: status, requestedWallTime: time, wallTimeTarget: target }`. When the state already holds an equal instant (`Instant#equals`), status and target, it returns the same state object, so the store does not notify (FR4).

There is no second `toZonedDateTime` with a disambiguation option. `requestedWallTime` keeps one meaning, "the wall-clock time the user asked for": for a date change a time of the reference zone, for a wall-time input a time of the target's zone; `wallTimeTarget` says which. No BigInt: instants are compared with `Instant#equals`, never through `epochNanoseconds` (FR13).

### D2. Model: the wall-time target and where a note goes (FR7, FR9)

New in `model/referenceMoment.ts`:

```ts
export enum WallTimeTargetKind { LOCATION = "LOCATION", HERE_ENTRY = "HERE_ENTRY" }
export type WallTimeTarget =
  | { kind: WallTimeTargetKind.LOCATION; locationId: string }
  | { kind: WallTimeTargetKind.HERE_ENTRY };
```

`ReferenceMoment.PINNED` gains an optional `wallTimeTarget`. `SELECT_INSTANT` and the date commands build their pinned moment without it, so a later time selection or date change ends the hint with no extra code in those reducers; `RESET_TO_NOW` returns live.

One selector decides the note, `getWallClockNote(state)` in new `model/wallClockNote.ts`. It returns a `WallClockNote`: `{ placement: NONE }`, `{ placement: DATE_BAR, requestedWallTime }` or `{ placement: ROW, target, status, requestedWallTime }` (`WallClockNotePlacement` enum):

- live, or `UNIQUE` → `NONE`;
- no `wallTimeTarget` and `GAP` → `DATE_BAR` (today's gap note);
- no `wallTimeTarget` and `AMBIGUOUS` → `NONE` (as today);
- a `wallTimeTarget` and `GAP` / `AMBIGUOUS` → `ROW` while the target is shown: the location is in the list, or `getHereEntry(state)` returns the Here entry. Otherwise `NONE`, and the moment stays (FR9).

`followReferenceZone` keeps the note consistent with the zone it is about. It already compares the previous and next state after every command:

- no target, `GAP`, reference zone changed → `UNIQUE` (unchanged behaviour, the gap note ends);
- a location target → nothing; the reference zone is not the row's zone, and a location's zone never changes, so a home change keeps the hint;
- a Here entry target and the device time zone changed → the target is dropped, the status becomes `UNIQUE` and `requestedWallTime` the instant's wall time in the reference zone, exactly as in the first rule. The instant stays. Dropping the target alone would turn the hint into a gap note.

`useReferenceMoment` builds the gap note from `getWallClockNote` instead of reading `wallClockStatus`. `useLocations` puts the note into `LocationRowsContext`. So "one note at a time" is one function of the model, and neither presenter nor view re-decides it. `REMOVE_LOCATION` and `REPLACE_LOCATIONS` need no change.

### D3. Presenter: one parser for typed text (FR2, FR6)

New `presenter/parseWallTimeInput.ts`: `parseWallTimeInput(text: string): string | undefined` returns the canonical `HH:MM` or `undefined`. It trims, then matches the anchored patterns of FR2 and checks the limits. The patterns and limits are new constants in `constants/timeSelection.ts` (`WALL_TIME_INPUT_PATTERNS`, `MAX_WALL_TIME_HOUR = 23`, `MAX_WALL_TIME_MINUTE = 59`, `WALL_TIME_COMMAND_PATTERN`), re-exported from `constants/index.ts`. Pure and locale-independent. It lives in the presenter because it reads user text, not a model rule; the model checks only the canonical form (D1).

### D4. Presenter: the hint, the name and one formatter for a wall-clock time (FR7, FR11, NFR-A2, NFR-P1)

- New `formatWallClockTime(time: Temporal.PlainTime, language)` in `presenter/localDateTime.ts`, next to `formatLocalTime`. A requested time is not an instant, so it is formatted by the cached `getDateTimeFormatter(language, UTC_ZONE_ID, LOCAL_TIME)` at the time's milliseconds since midnight (`Temporal.PlainTime` difference, no zone lookup). Presenting again therefore builds no formatter (NFR-P1). `presentDateBar` switches its inline `toLocaleString` for the gap note to it, so the gap note and the hint share one owner, and the date bar stops building a formatter per call.
- New `presentWallTimeHint({ status, requestedWallTime, shownZoned, language, translate })` in `presenter/wallTimeHint.ts`. `GAP` → `locations.wallTimeHintGap` with `{ requestedTime, shownTime }`, where `shownTime` is `formatLocalTime(shownZoned)`. `AMBIGUOUS` → `locations.wallTimeHintAmbiguous` with `{ requestedTime, utcOffset }`, where `utcOffset` is `formatUtcOffset(getUtcOffsetMinutes(...), translate("locations.utcOffsetPrefix"))`. `UNIQUE` → `undefined`. It does not reuse `date.gapNote`: the glossary keeps the gap note and the wall-time hint apart.
- `PresentedZoneMoment` gains `wallTimeInputLabel` ("Enter time — {{city}}, {{time}}") and `wallTimeHint?: string`. `presentZoneMoment`'s subject gains `cityLabel` (`presentLocationRows` passes the location's label, `presentHereEntry` its city label). `LocationRowsContext` gains `wallClockNote`; the hint is filled only when the note is `ROW` and its target is this subject (a location by `id`, the Here entry by having no `id`).
- Locale keys: `locations.wallTimeInputLabel`, `locations.wallTimeInputError`, `locations.wallTimeHintGap`, `locations.wallTimeHintAmbiguous`, in `en.json` and `ru.json`.

### D5. Controller: `useWallTimeInput` (FR3, FR6, FR8, FR9, FR10)

New hook `controller/useWallTimeInput.ts` returns `confirmWallTime(target, text, date): WallTimeInputOutcome`. It calls `parseWallTimeInput`; `undefined` → `INVALID_TEXT` and nothing is dispatched. Otherwise it dispatches `SET_WALL_TIME` straight to the store, like `useTimeSelection` and the date actions of `useReferenceMoment`, never through the write scheduler, so nothing is stored or broadcast. Any result of the store, `ok` or a rejection such as `LOCATION_NOT_FOUND`, gives `CLOSED` (FR10). `WallTimeInputOutcome` is an enum in the hook's module; `controller/index.ts` exports the hook, the enum, `WallTimeTarget` and `WallTimeTargetKind` (as it does `TrackMove`). The view thus only emits the typed text (ADR-0002). A separate hook, not a function of `useTimeSelection`, because the glossary keeps wall-time input and time selection apart.

### D6. View: the time button and `WallTimeInput` (FR1, FR5, FR6, FR13, NFR-A2, NFR-A4, UX1, UX2)

- `LocalDateTime` renders the time as a `<button type="button">` with `onClick`, named by `wallTimeInputLabel`. A plain `click` fires after a tap on iOS 12 without Pointer Events; no `onPointer*` handler opens the field.
- On click it renders new `views/shared/WallTimeInput.tsx` in place, with view state open / text / error. It is `<input type="text" inputmode="numeric" autocomplete="off">` with the same name, never `type="time"`; focus and full selection on open.
- Enter, Tab or blur with changed text → `onConfirm(text)`. `INVALID_TEXT` → the error under the field with `aria-describedby` and `aria-invalid`, the field stays open. `CLOSED` → close. Escape, or blur without change → close. Focus returns to the button after Enter and Escape.
- `onKeyDown` stops propagation of Space, Enter and the arrow keys, and the field sits outside the drag handle, so the reorder `KeyboardSensor` never sees them.
- `ZoneRowContent` gains `wallTimeInputLabel`, `wallTimeHint` and `onConfirmWallTime(text, date)`; `LocationRow` binds the location target and `HereEntryRow` the Here entry target, and `CardsView` passes `confirmWallTime` from `useWallTimeInput` through `LocationList`.
- New `views/shared/WallTimeHint.tsx` (`role="status"`, an "i" icon from `lucide-react`) renders under the place column, before the day track. Colours: the existing `bg-notice` / `text-notice-foreground` tokens, which are the warm warning pair of both themes; no new token (UX3).

### D7. Where each test goes

- Model: `locationCommands` move covered by the existing `locations.test.ts`; `reduceWallTime.test.ts`, `wallClockNote.test.ts`, `followReferenceZone.test.ts` (Vitest, `it.each`).
- Presenter: `parseWallTimeInput.test.ts`, `wallTimeHint.test.ts`, `localDateTime.test.ts`, `dateBar.test.ts` unchanged, a new `presentZoneMoment.wallTime.test.ts`.
- Controller and views: `useReferenceMoment.test.tsx` (the gap note), new `useLocations.wallTime.test.tsx` (`rowsContext.wallClockNote`), `useWallTimeInput.test.tsx`, `WallTimeInput.test.tsx`, `WallTimeInput.legacy.test.tsx` (no `PointerEvent`), `WallTimeHint.test.tsx`.
- Unit BDD (jsdom, no focus or names): `time_selection_wall_time_input_unit.feature`, the work bounds in `time_selection_wall_time_budget.feature`, the two scenarios in `date_selection_wall_clock.feature`.
- E2E (focus, selection, names, axe-core, layout, the legacy tap, screenshots): `time_selection_wall_time_input_e2e.feature`, the `@view-contract` scenario, the screenshot outline.

## Consequences

Positive:
- Every DST rule stays in `resolveWallClock`; the hint and the gap note share one formatter and one placement rule.
- The legacy rules hold by construction: click instead of pointer events, a text field, no BigInt.
- Rows of both kinds get the input and the hint from `presentZoneMoment` and `ZoneRowContent`, so the Here entry needs no second implementation.

Negative:
- `ReferenceMoment.PINNED` grows by an optional field that only one command sets.
- `followReferenceZone` gains a third rule.
- Every screenshot with rows is re-approved, because the time becomes a button.

## Alternatives Considered

**Target by zone ID instead of a location or the Here entry**: simpler, but two locations may share a zone (identity is zone plus city label), and the hint would show in both. Rejected.

**A hint flag set by `SET_WALL_TIME` and cleared by every other reducer**: spreads one rule over several reducers, including `REMOVE_LOCATION` and `REPLACE_LOCATIONS`. Rejected for the selector of D2.

**Parsing in the model or in the view**: the model would learn user-text formats (dots, missing colon), which are presentation; the view would call the presenter and the store itself, against ADR-0002. Rejected; the controller calls the presenter's parser and the model checks only the canonical form.

**`setWallTime` in `useTimeSelection` or in `LocationsContextValue`**: the first mixes two glossary concepts; the second sits next to the actions that schedule writes. Rejected for `useWallTimeInput`.

**`<input type="time">`**: native pickers differ per OS, follow the system 12/24-hour setting (NG1) and look different on iOS 12. Rejected (proposal Q2).

**Reusing `date.gapNote` for the hint**: same words for two glossary concepts; the hint also needs the overlap text. Rejected.

**New hint colour tokens**: the notice pair is already the warm warning colour in both themes. Rejected as a duplicate.

## Risks / Trade-offs

- **Legacy zone names.** Covered on `main` (Context, proposal Q5). Task 2.2 adds a `SET_WALL_TIME` case with the same engine stub. If it ever fails, the fix belongs to `lib/legacy/zoneShim.ts`, not to a second path in `resolveWallClock`.
- **BigInt.** Temporal's `epochNanoseconds` is tempting for equality checks; the source scan fails on it. All comparisons use `Instant#equals`.
- **Blur on iOS 12.** Closing the numeric keyboard on iOS blurs the field; blur with changed text confirms (FR3), so typing then tapping elsewhere commits. The E2E scenario with `emulateEngineWithoutPointerEvents` covers the tap; blur-confirms is covered by the jsdom blur cases of task 5.1 (commit on change, close without change, error kept) and by the E2E scenario "Tab confirms the field" (task 6.4).

## Migration Plan

None: no stored data changes. The documents are updated by handoff patches H1 (glossary) and H2 (architecture docs), because the implement stage writes only under `packages/` (`tasks.md`, section 7).
