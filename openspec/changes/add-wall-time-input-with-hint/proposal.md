# Add wall-time input with hint

Depends on: `support-legacy-ios-12-safari`, `set-home-location-and-show-differences`, `show-here-entry-for-device-time`. All three must be archived first. This change uses the reference zone with home, the Here entry (`HereEntryRow`), the card layout block shared by cards and the Here entry, and the legacy-engine rules of the `browser-compatibility` capability: no BigInt at run time, legacy zone names through the legacy zone shim, input fallbacks on engines without Pointer Events.

## Why

README MVP feature 5 is "drag the slider **or type a time** in any location; all other locations are recalculated". The day track exists (archived `add-time-sliders-to-location-cards`), but that change left typing a time out (its NG1). A time selection on a day track moves in 15-minute track steps and needs aiming. A user who must answer "my partner's call is at 10:40 in New York — what time is that for me?" needs an exact wall-clock time, not a position on a track.

The documents already decide the behaviour:

- ADR-0003: typing "08:00" in any zone pins the reference moment, resolved with `disambiguation: "compatible"` and reported as `UNIQUE`, `GAP` or `AMBIGUOUS`;
- `docs/architecture/domain-model.md`: the command `SET_WALL_TIME`;
- `docs/architecture/views.md`: "Time display — tap to type an exact time" and the "Wall-time hint" block;
- `docs/architecture/open-questions.md` Q7: the hint is inline in the affected card, with no toast and no "show the other instant" action.

The approved phone screens show the large time as a button and a wall-time hint under the New York card.

Audience: every user, on phones and wide screens.

## What Changes

- ADDED: the large time of every location card with a known zone, and of the Here entry, is a wall-time input. Activating it opens a field. A confirmed wall-clock time pins the reference moment in that row's zone, on the local date the row showed. Every card, day track and the date bar follow in the same render.
- ADDED: the wall-time hint in the row where the time was typed, when the typed time falls in a DST gap or a DST overlap.
- ADDED: an input error next to the field for text that is not a time. Nothing changes.
- ADDED: a view contract scenario for typing an exact time.
- ADDED: the wall-time input works on legacy engines (iOS Safari 12.5): it opens on a plain tap without Pointer Events, and a typed time resolves in a zone the engine knows only by its legacy name (`Europe/Kyiv` as `Europe/Kiev`).
- MODIFIED: the date bar's gap note also ends with a wall-time input. There is at most one note about a wall-clock time at a time: the gap note in the date bar or the wall-time hint in a row.
- MODIFIED (documents): `open-questions.md` Q4 — a wall-time input works in a location card and in the Here entry, not only "with locations from the list". `domain-model.md` — the `SET_WALL_TIME` signature takes a wall-time target. `views.md` — the hint shows `UTC−4`, not `GMT-4`.
- No stored data changes. The reference moment is never stored (ADR-0003, ADR-0004).

Glossary terms (`docs/glossary/`):

- NEW **Wall-time input** (`time-selection.md`) — typing an exact wall-clock time in a card or the Here entry. *RU:* «Ввести время». *Not:* a time selection, which is a choice on a day track in track steps. *Never:* time picker, time edit. *Code:* `SET_WALL_TIME`, `parseWallTimeInput`, `WallTimeInput`.
- NEW **Wall-time target** (`time-selection.md`) — the row a wall-time input was typed in: a location or the Here entry. It decides where the wall-time hint is shown. *Code:* `WallTimeTarget`.
- CHANGED **Wall-time hint** (`date-selection.md`) — no longer *(planned)*. *RU:* the texts of FR7. *Code:* `presentWallTimeHint`, `WallTimeHint`.
- CHANGED **Gap note** — also disappears after a wall-time input.
- Used as they are: wall-clock time, wall-clock status, DST gap, DST overlap, UTC offset, reference moment, pinned, Now button, Here entry.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `time-selection`: ADDED requirements for the wall-time input, the parsing of typed text, the wall-time hint, its accessibility, layout and work bounds, and the view contract scenario.
- `date-selection`: MODIFIED "Wall-clock resolution on the new date". The gap note also ends with a wall-time input and never shows together with a wall-time hint.

## Impact

- `packages/client/src/`:
  - `model/`: the `SET_WALL_TIME` command, `WallTimeTarget`, `INVALID_TIME`, a hint-placement selector;
  - `presenter/`: `parseWallTimeInput`, `presentWallTimeHint`, the accessible name of the time;
  - `controller/`: `setWallTime` in the locations context, the hint placement in `useReferenceMoment` and `useLocations`;
  - `views/shared/`: `WallTimeInput`, `WallTimeHint`, the time button in `LocalDateTime`;
  - `locales/en.json`, `locales/ru.json`, `styles/tokens.css` (hint colours if missing).
- Docs: `docs/glossary/time-selection.md`, `docs/glossary/date-selection.md`, `docs/architecture/views.md`, `docs/architecture/domain-model.md`, `docs/architecture/open-questions.md`.
- Tests: new unit BDD and E2E features under `src/test/features/time_selection/`, a `@view-contract` scenario, new screenshot states. The existing screenshot baselines with rows are re-approved, because the time becomes a button with a focus ring.
- No new dependencies, no network, no storage schema change.

## Goals

- G1: Any minute of any day is set in any row with one activation, at most 4 typed digits and one confirmation.
- G2: After a wall-time input, 100% of rows show the new time, date, UTC offset and handle position in the same render.
- G3: 100% of wall-time inputs that land in a DST gap or a DST overlap are explained by a wall-time hint in the row where they were typed.

## Non-Goals

- NG1: A 12-hour format and `AM` / `PM` input. Input and display stay 24-hour.
- NG2: Typing a date in a row. The date changes only through the date bar.
- NG3: Typing a time for a zone that is neither a location nor the Here entry, such as "08:00 UTC".
- NG4: A "show the other instant" action for a DST overlap (`open-questions.md` Q7).
- NG5: Any change to home, offset differences or the Here entry beyond adding the input to it. They come from the changes this one depends on.
- NG6: A wall-time input in the Grid view, which does not exist yet.
- NG7: A wall-time hint after a date change. A DST gap from a date change stays the gap note in the date bar.

## Users & Scenarios

- U1: A user in Almaty taps `03:30` on the New York card, types `10:40` and confirms. Almaty shows `19:40`, Moscow `17:40`, every handle moves, and the Now button appears.
- U2: The user types `02:30` in New York on 8 March 2026. New York shows `03:30` and the card says that 02:30 does not exist on this day.
- U3: The user types `01:30` in New York on 1 November 2026. New York shows `01:30` with `UTC−4`, and the card says that 01:30 occurs twice and the first one is shown.
- U4: The user opens the field and presses Escape. Nothing changes, and focus is back on the time.
- U5: The user types `9:7`. An error is shown under the field, and nothing changes.
- U6: A user without a matching location types `08:00` in the Here entry. The moment is pinned to 08:00 in the device time zone.

## Requirements

### Functional

- FR1: The time of every location card with a known zone, and of the Here entry, is a wall-time input. Activating it (tap, click, Enter or Space) opens a field that holds the row's current time, fully selected. A row whose zone the browser does not know shows no time and has no input.
- FR2: The field accepts a 24-hour wall-clock time: `H`, `HH` (minutes `00`), `HMM`, `HHMM`, and `H:MM`, `HH:MM`, `H.MM`, `HH.MM`. Hours are 0–23 and minutes 0–59 with two digits. Leading and trailing spaces are ignored. Any other text is invalid.
- FR3: Confirming (Enter, or leaving the field with a changed value) pins the reference moment to the typed wall-clock time in the row's zone: the location's zone, or the device time zone for the Here entry. The date is the local date the row showed when the field opened. The wall-clock time is resolved with `compatible` disambiguation: a time in a DST gap moves forward by the gap, a time in a DST overlap takes the earlier instant. The outcome is reported as `UNIQUE`, `GAP` or `AMBIGUOUS`.
- FR4: When the pinned instant falls outside the current reference day, the day tracks and the date bar move to the reference day that contains it, as for any pinned moment. Typing the instant already pinned, with the same outcome and in the same row, changes nothing.
- FR5: Escape, or leaving the field without a change, closes it without a change. Focus returns to the row's time after Enter and Escape.
- FR6: Invalid text changes nothing. The field stays open and shows the error "Enter the time as HH:MM" / «Введите время в формате ЧЧ:ММ», linked to the field.
- FR7: On `GAP` the row where the time was typed shows the wall-time hint "02:30 does not exist on this day — clocks moved forward. Showing 03:30." / «02:30 не существует в этот день — часы переведены вперёд. Показано 03:30». On `AMBIGUOUS` it shows "01:30 occurs twice — showing the first (UTC−4)." / «01:30 бывает дважды — показано первое (UTC−4)». The offset is the UTC offset of the shown instant in that row's zone. `UNIQUE` shows no hint. The hint stays until the next wall-time input, time selection, date change or Now. At most one note about a wall-clock time is shown: the wall-time hint in a row, or the gap note in the date bar, never both.
- FR8: A wall-time input from live pins the moment and shows the Now button. Now returns to live and removes the hint.
- FR9: A wall-time input writes nothing to storage and is not passed to other tabs. A change of the list in another tab keeps the moment. When the row with the hint is removed, or the Here entry with the hint disappears, the hint disappears and the moment stays.
- FR10: When the model rejects a wall-time input because its location no longer exists (removed in another tab), nothing changes and the field closes silently.
- FR11: Every new string — the input's name, the error and both hints — exists in English and Russian.
- FR12: Typing an exact time is part of the view contract: in every registered view, a wall-time input in one row changes the time of every row, and Now returns them to the current time.
- FR13: On an engine without Pointer Events (iOS Safari 12.5), a tap on a row's time MUST open the field, and the field MUST bring up a numeric keyboard. On an engine that knows a canonical zone only by its legacy name, a wall-time input in that zone MUST pin the same instant as on a modern engine, and the stored and compared zone stays canonical. A wall-time input MUST NOT use BigInt at run time (`browser-compatibility` "No BigInt at run time").

### Non-Functional

#### Performance

- NFR-P1: A wall-time input followed by presenting 50 rows stays within the work bounds of ADR-0008. Presenting the rows again after the input builds no new formatter. Resolving the typed time looks up time zone transitions of the typed row's zone only. The existing row benchmark (`*.bench.ts`) gains a wall-time input case.

#### Accessibility

- NFR-A1: axe-core reports no violations with the time as a button, with the field open, with the field showing an error, and with a `GAP` and an `AMBIGUOUS` hint, in the light and dark themes.
- NFR-A2: The time button is named "Enter time — {city}, {time}" / «Ввести время — {city}, {time}», so every row's button has a distinct name. The field has the same name, `inputmode="numeric"` and `autocomplete="off"`.
- NFR-A3: The wall-time hint is announced politely (`role="status"`). Times that change in other rows are not announced, as today.
- NFR-A4: Keys typed in the field do not start a card reorder and do not scroll the page. Tab leaves the field and confirms it as in FR3.

#### Responsive

- NFR-R1: With the field open or a hint shown, the page does not scroll horizontally at 320 px and 2560 px. The field takes the place of the time and does not change the card's width or height. The hint wraps inside the card.
- NFR-R2: The approved screenshots at 375 px and 1024 px, in both themes and both projects (`chromium`, `mobile-chrome`), gain the states "wall-time-input" and "wall-time-hint". The existing baselines with rows are re-approved.

## UX Acceptance Criteria

- UX1: The time button looks like the time today: large tabular figures, no border. It shows a focus ring and a text cursor on hover. Its hit area is at least 44 × 44 px.
- UX2: The open field has the same font size and width as the time, with a thin accent border. Phones show a numeric keyboard.
- UX3: The wall-time hint looks like the one on `docs/design/screens/phone-light.png`: a warm warning background, an "i" icon, 13 px text, between the country line and the day track. Colours come from design tokens for both themes.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | live | time buttons show the current time |
| any | field open | the rest unchanged; keys do not reorder or scroll |
| any | invalid text | error under the field; the moment unchanged |
| any | input resolved `UNIQUE` | every row follows; Now shown; no hint |
| any | input resolved `GAP` / `AMBIGUOUS` | wall-time hint in that row; Now shown |
| any | gap note in the date bar, then a wall-time input | the gap note is gone; a hint only if the input is `GAP` / `AMBIGUOUS` |
| any | row with the hint removed, or Here entry gone | hint gone; moment kept |
| any | location removed in another tab while typing | field closes; nothing changes |
| any | unknown zone | no time, no input |
| any | empty list | the Here entry has the input; no cards |
| any | view loading, unreadable list | unchanged; no input |
| any | storage unavailable | input works; nothing is stored either way |
| offline | any of the above | same behaviour; no network is needed |

## Behavior

Feature files under `packages/client/src/test/features/time_selection/`, tagged `@add-wall-time-input-with-hint`:

- `time_selection_wall_time_input.feature` (vitest-cucumber): parsing, pinning, the local date of the row, leaving the reference day, `GAP` / `AMBIGUOUS` outcomes and hint texts, the hint's life, one note at a time, the Here entry, the removed row, nothing stored, the work bound, the legacy zone name.
- `time_selection_wall_time_input_e2e.feature` (playwright-bdd): open, type, confirm, Escape, error, focus return, names, axe-core, layout at 320 / 2560 px, no reorder from keys.
- The `@view-contract` scenario "Type an exact time" in `time_selection_view_contract_e2e.feature`.
- The states "wall-time-input" and "wall-time-hint" in the screenshot outline of `locations/locations_ui_e2e.feature`.

## Visual Reference

`docs/design/screens/phone-light.png`, `phone-dark.png` and their HTML twins: the time button and the hint under New York. The screens name every time button just «Ввести время» and write `GMT`. Documents win (`docs/design/README.md`): NFR-A2 adds the city and time to the name, and the glossary bans `GMT` in new text. Design tokens are the source of truth for colours.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR13, NFR-P1, NFR-A1–NFR-A4, NFR-R1–NFR-R2 and UX1–UX3 have at least one automated test that names `add-wall-time-input-with-hint` together with the id.
- M2: Device zone `Asia/Almaty`, moment `2026-03-08T07:30:00Z`, rows Almaty, Moscow, Kolkata, New York. Typing `10:40` in New York pins `2026-03-08T14:40:00Z` with `UNIQUE`: Almaty `19:40`, Moscow `17:40`, Kolkata `20:10`, no hint. Typing `23:00` in New York from the same moment pins `2026-03-09T03:00:00Z`, and the date bar shows 9 March (2 of 2).
- M3: From `2026-03-08T07:30:00Z`, typing `02:30` in New York pins `2026-03-08T07:30:00Z` with `GAP` and the hint text of FR7. From `2026-11-01T07:30:00Z`, typing `01:30` in New York pins `2026-11-01T05:30:00Z` with `AMBIGUOUS` and `UTC−4` in the hint (2 of 2).
- M4: Parsing: the 10 texts `9`, `09`, `930`, `0930`, `9:30`, `09:30`, `09.30`, ` 9:30 `, `0:00`, `23:59` give the expected time, and the 6 texts `24:00`, `9:60`, `abc`, `12345`, `9:3` and the empty text are rejected (16 of 16).
- M5: 0 storage writes caused by 20 wall-time inputs and a Now.
- M6: Mutation score of the new or changed model, presenter, controller and view code ≥ 95% (minimum 90%).
- M7: axe-core reports 0 violations in 5 states × 2 themes; 0 horizontal scrolling at 320 px and 2560 px; the new and re-approved screenshot baselines pass without `--update-snapshots`.
- M8: With `PointerEvent` removed from the test environment, a click on the time of New York opens the field (1 of 1). With an engine stub that rejects `Europe/Kyiv` and accepts `Europe/Kiev`, typing `10:00` in Kyiv from `2026-03-08T07:30:00Z` pins `2026-03-08T08:00:00Z` with `UNIQUE` (1 of 1). The legacy change's BigInt source scan stays green.

## Open Questions

- Q1: Which date does a typed time use? Decided: the local date the row showed when the field opened (FR3). A moment outside the reference day moves the date bar (FR4).
- Q2: Which input? Decided: a text field with the lenient formats of FR2, not `<input type="time">`, which depends on the system's 12/24-hour setting.
- Q3: What happens when the model rejects the input because the location is gone? Decided: the field closes silently (FR10); the row disappears with the tab sync.
- Q4: Does a DST gap from a date change also show a hint in a row? Decided: no. It stays the gap note in the date bar (NG7, FR7).
- Q5: Does the legacy zone shim of `support-legacy-ios-12-safari` cover resolving a wall-clock time (`PlainDateTime` to an instant with `compatible` disambiguation), not only an instant to a zoned time? Its spike checks only the latter. Tracked as a risk in `design.md`, closed by the FR13 test (M8).
