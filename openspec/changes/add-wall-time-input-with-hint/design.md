# Design: Add wall-time input with hint

## Context

Driven by FR1–FR13, NFR-P1, NFR-A1–NFR-A4, NFR-R1, NFR-R2 and UX1–UX3 of `proposal.md`. The change starts after `support-legacy-ios-12-safari`, `set-home-location-and-show-differences` and `show-here-entry-for-device-time` are archived. The state below is the code today plus what those changes add.

Current owners, checked in `packages/client/src/`. The glossary (`docs/glossary/`) names each one:

- **Wall-clock time → instant, wall-clock status**: `resolveWallClock(timeZoneId, plainDateTime)` and `WallClockStatus` in `model/wallClock.ts`. It resolves with `compatible` and classifies `UNIQUE`, `GAP` or `AMBIGUOUS`. `SET_DATE` / `SHIFT_DATE` already call it from `model/reduceReferenceMoment.ts`.
- **Reference moment**: `ReferenceMoment` in `model/referenceMoment.ts`. `PINNED` carries `instant`, `wallClockStatus` and `requestedWallTime`. `getReferenceZone` and `getEffectiveInstant` live there too.
- **Time selection**: `SELECT_INSTANT` in `model/reduceSelectInstant.ts`. It returns the same state object for the instant already pinned, and its status is always `UNIQUE`.
- **Commands and reducer**: `LocationCommandType`, `LocationErrorCode` and `reduceLocations` in `model/locations.ts` (161 lines). The file is near the size limit, so new reducer bodies go to their own files, as `reduceSelectInstant` did.
- **Gap note**: `controller/useReferenceMoment.ts` decides `gap` from `reference.wallClockStatus === GAP`, and `presenter/dateBar.ts` formats it. It formats the requested time with an inline `time.toLocaleString(language, LOCAL_TIME_FORMAT_OPTIONS)`.
- **Local time label**: `formatLocalTime` in `presenter/localDateTime.ts`, built on the cached `getDateTimeFormatter` (`presenter/dateTimeFormatters.ts`, ADR-0008).
- **UTC offset**: `getUtcOffsetMinutes` (model) and `formatUtcOffset(offsetMinutes, utcPrefix)` (presenter), prefix `locations.utcOffsetPrefix`.
- **Rows**: `presentLocationRows` with the zone-level part shared with the Here entry (from `show-here-entry-for-device-time`), `useLocations`, `LocationsContext` (`addLocation`, `removeLocation`, `moveLocation`, …).
- **Time display**: `views/shared/LocalDateTime.tsx` (30 lines) renders the time and date as plain text. It is used by `LocationRow` and `HereEntryRow` through the shared card layout block.
- **Legacy engines** (from `support-legacy-ios-12-safari`): `IS_POINTER_EVENTS_SUPPORTED` in `lib/legacy/`; the `Intl.DateTimeFormat` legacy zone shim installed before `temporal-polyfill`; a source scan that fails on BigInt literals, `BigInt(` and `epochNanoseconds`.

Binding decisions: ADR-0002 (commands as JSON, view state in the view), ADR-0003 (wall-clock input and DST, the moment is never stored), ADR-0004 (only repositories write), ADR-0007 (reference zone), ADR-0008 (work bounds). No global decision is needed.

## Goals / Non-Goals

**Goals:** add the wall-time input by extending the existing owners. The only new model state is the wall-time target. One parser for typed text, one rule for "which note is shown", one formatter for a wall-clock time in a note.

**Non-Goals:** a generic time-field component; any change to storage, tab sync or the date bar's layout; smooth dragging on iOS 12.

## Decisions

### D1. Model: `SET_WALL_TIME` resolves through `resolveWallClock` (FR3, FR4, FR10, FR13)

New command in `model/locations.ts`, reduced in new `model/reduceWallTime.ts`:

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

The reducer:

1. Validates the form: `time` must match `HH:MM` with hours 0–23 and minutes 0–59, else `INVALID_TIME` (new `LocationErrorCode`). `Temporal.PlainDate.from(date)` failing gives the existing `INVALID_DATE`. This checks the command's shape only. The lenient formats belong to the parser (D3) and are not repeated here.
2. Resolves the zone of the target: the location's `timeZoneId` (not found → `LOCATION_NOT_FOUND`), or `deviceTimeZoneId` for the Here entry.
3. Calls `resolveWallClock(zone, date.toPlainDateTime(time))`. A `RangeError` beyond Temporal's range gives the existing `DATE_OUT_OF_RANGE`.
4. Pins `{ mode: PINNED, instant, wallClockStatus: status, requestedWallTime: time, wallTimeTarget: target }`. When the state already holds the same instant, status and target, it returns the same state object, so the store does not notify.

There is no second `toZonedDateTime` with a disambiguation option anywhere. `requestedWallTime` keeps one meaning: "the wall-clock time the user asked for". For a date change it is a time of the reference zone; for a wall-time input it is a time of the target's zone. `wallTimeTarget` says which.

No BigInt: the reducer compares instants with `Temporal.Instant#equals`, never through `epochNanoseconds`, so the legacy source scan stays green (FR13).

### D2. Model: the wall-time target and where a note goes (FR7, FR9)

New in `model/referenceMoment.ts`:

```ts
export enum WallTimeTargetKind { LOCATION = "LOCATION", HERE_ENTRY = "HERE_ENTRY" }
export type WallTimeTarget =
  | { kind: WallTimeTargetKind.LOCATION; locationId: string }
  | { kind: WallTimeTargetKind.HERE_ENTRY };
```

`ReferenceMoment.PINNED` gains an optional `wallTimeTarget`. `SELECT_INSTANT` and the date commands build their pinned moment without it, so any later time selection or date change ends the hint without extra code in those reducers. `RESET_TO_NOW` returns live.

One selector decides the note, `getWallClockNote(state)` in new `model/wallClockNote.ts`:

- live, or `UNIQUE` → none;
- no `wallTimeTarget` and `GAP` → the date bar (today's gap note);
- no `wallTimeTarget` and `AMBIGUOUS` → none (as today);
- a `wallTimeTarget` and `GAP` / `AMBIGUOUS` → that target, but only while it is shown: the location is still in the list, or `getHereEntry(state)` (from `show-here-entry-for-device-time`) still returns the Here entry. Otherwise → none, and the moment stays (FR9).

`useReferenceMoment` builds the gap note from this selector instead of reading `wallClockStatus` itself. `useLocations` passes the selector's target to the presenter. So "one note at a time" lives in one function of the model, and neither presenter nor view re-decides it. The removal of a row needs no change in `REMOVE_LOCATION`, which `set-home-location-and-show-differences` also edits.

### D3. Presenter: one parser for typed text (FR2, FR6)

New `presenter/parseWallTimeInput.ts`: `parseWallTimeInput(text: string): string | undefined` returns the canonical `HH:MM` or `undefined`. It trims, then matches one anchored pattern per form of FR2. The patterns and limits come from new constants in `constants/timeSelection.ts` (`WALL_TIME_INPUT_PATTERNS`, `MAX_HOUR = 23`, `MAX_MINUTE = 59`). Pure, locale-independent, tested with `it.each` over M4. It lives in the presenter because it reads user text, not a model rule. The model checks only the canonical form (D1).

### D4. Presenter: the wall-time hint and one formatter for a wall-clock time (FR7, FR11, NFR-A2)

- New `formatWallClockTime(time: Temporal.PlainTime, language)` in `presenter/localDateTime.ts`, next to `formatLocalTime`, with `LOCAL_TIME_FORMAT_OPTIONS`. The requested time of a gap or overlap is not an instant, so it cannot use the zone-bound cached formatter. `presentDateBar` switches its inline `toLocaleString` to this function, so the gap note and the hint share one owner for "a wall-clock time in a note".
- New `presentWallTimeHint({ status, requestedWallTime, shownZoned, language, translate })` in `presenter/wallTimeHint.ts`. `GAP` → `locations.wallTimeHint.gap` with `{ requestedTime, shownTime }`, where `shownTime` is `formatLocalTime(shownZoned)`. `AMBIGUOUS` → `locations.wallTimeHint.ambiguous` with `{ requestedTime, utcOffset }`, where `utcOffset` is `formatUtcOffset(getUtcOffsetMinutes(...), translate("locations.utcOffsetPrefix"))`. It does not reuse `date.gapNote`: the glossary keeps the gap note and the wall-time hint apart.
- Row data gains `wallTimeHint?: string` and `wallTimeInputLabel` ("Enter time — {{city}}, {{time}}"). They are filled where the zone-level row part is presented, once for location rows and the Here entry.
- Locale keys: `locations.wallTimeInputLabel`, `locations.wallTimeInputError`, `locations.wallTimeHint.gap`, `locations.wallTimeHint.ambiguous`, in `en.json` and `ru.json`.

### D5. Controller: `setWallTime` (FR3, FR8, FR9, FR10)

`LocationsContextValue` gains `setWallTime(target, time, date)`, dispatched straight to the store like the date commands (`useReferenceMoment`), never through the write scheduler, so nothing is stored or broadcast. It returns the reduce result. The view closes the field on `ok` and also on `LOCATION_NOT_FOUND` (FR10). No hook duplicates `useTimeSelection`.

### D6. View: `WallTimeInput` inside `LocalDateTime` (FR1, FR5, FR13, NFR-A2, NFR-A4, UX1, UX2)

- `LocalDateTime` renders the time as a `<button type="button">` with `onClick`. A plain `click` fires after a tap on iOS 12 without Pointer Events. No `onPointer*` handler opens the field. The button is named by `wallTimeInputLabel`.
- On click it renders `WallTimeInput` in place (view state: open / text / error). It is an `<input type="text" inputmode="numeric" autocomplete="off">` with the same label, never `type="time"`. Focus and full selection on open.
- Enter / blur with changed text → `parseWallTimeInput` → `setWallTime`. Invalid → the error under the field with `aria-describedby` and `aria-invalid`, field stays open. Escape / blur without change → close. Focus returns to the button after Enter and Escape.
- `onKeyDown` stops propagation for Space, Enter and arrows, so the `KeyboardSensor` of the reorder never sees them. The field is outside the drag handle, as `DayTrack` is.
- New `WallTimeHint` (`role="status"`) renders the row's hint between the country line and the track, with new tokens `--color-hint-warning-bg` / `--color-hint-warning-fg` for both themes if no token fits.

### D7. Where each test goes

- Model: `reduceWallTime.test.ts`, `wallClockNote.test.ts` (Vitest, `it.each`).
- Presenter: `parseWallTimeInput.test.ts`, `wallTimeHint.test.ts`, `dateBar.test.ts` (unchanged gap note after the refactor).
- View: `LocalDateTime.test.tsx`, `WallTimeInput.test.tsx`, plus `WallTimeInput.legacy.test.tsx` that removes `PointerEvent` with `vi.stubGlobal`, re-imports the module and checks that a `click` opens the field.
- Unit BDD: `time_selection_wall_time_input.feature`; E2E: `time_selection_wall_time_input_e2e.feature`; the `@view-contract` scenario; screenshot states.

## Consequences

Positive:
- Every DST rule stays in `resolveWallClock`; the hint and the gap note share one formatter and one placement rule.
- The legacy rules hold by construction: click instead of pointer events, a text field, no BigInt.
- Rows of both kinds get the input from the shared layout block, so the Here entry needs no second implementation.

Negative:
- `ReferenceMoment.PINNED` grows by an optional field that only one command sets.
- Every screenshot with rows is re-approved, because the time becomes a button.

## Alternatives Considered

**Target by zone ID instead of a location or the Here entry**: simpler, but two locations may share a zone (identity is zone plus city label), and the hint would show in both. Rejected.

**A hint flag set by `SET_WALL_TIME` and cleared by every other reducer**: spreads one rule over five reducers, including `REMOVE_LOCATION`, which another change edits. Rejected for the selector of D2.

**Parsing in the model**: keeps one layer, but the model would learn user-text formats (dots, missing colon), which are presentation. Rejected; the model checks only the canonical form.

**`<input type="time">`**: native pickers differ per OS, follow the system 12/24-hour setting (NG1) and look different on iOS 12. Rejected (proposal Q2).

**Reusing `date.gapNote` for the hint**: same words for two glossary concepts; the hint also needs the overlap text. Rejected.

## Risks / Trade-offs

- **Legacy zone shim and wall-clock resolution (proposal Q5).** The spike of `support-legacy-ios-12-safari` (its task 1.1) checks `Instant#toZonedDateTimeISO("Europe/Kyiv")` only. `resolveWallClock` takes `PlainDateTime#toZonedDateTime(zone, { disambiguation })` three times. It most likely reaches the same captured `Intl.DateTimeFormat`, but this is not proven. Mitigation: task 2.2 adds a `resolveWallClock` test with an engine stub that rejects `Europe/Kyiv` and accepts `Europe/Kiev`. It expects `10:00` on `2026-03-08` to resolve to `2026-03-08T08:00:00Z` `UNIQUE`, and `03:30` on `2026-03-29` (DST start in Kyiv) to resolve as `GAP`. If it fails, the fix belongs to the shim owner (`lib/legacy/zoneShim.ts`), not to a second path in `resolveWallClock`.
- **BigInt.** Temporal's `epochNanoseconds` is tempting for equality checks. The legacy source scan fails CI on it. All comparisons use `Instant#equals` or `epochMilliseconds`.
- **Blur on iOS 12.** Closing the numeric keyboard on iOS blurs the field. Blur with changed text confirms (FR3), so typing then tapping elsewhere commits, as intended. It is checked manually on the owner's device together with the legacy change's M7.
- **`model/locations.ts` size.** Adding one command type and one error code keeps it under 200 lines; the reducer body is in `reduceWallTime.ts`.

## Migration Plan

None: no stored data changes. Docs to update in the same change: glossary (`time-selection.md`, `date-selection.md`), `views.md` ("Time display", "Wall-time hint" with `UTC−4`), `domain-model.md` (`SET_WALL_TIME(target, time, date)`), `open-questions.md` Q4.
