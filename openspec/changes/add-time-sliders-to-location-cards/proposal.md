# Add time sliders to location cards

## Why

The Cards view shows each location's time and date at the reference moment, and the date bar can move that moment to another day (`openspec/specs/date-selection/spec.md`). The user still cannot pick a time of day. A user cannot answer "if I call at 18:00 my time, what time is it in New York?" or see at a glance whose working day overlaps whose. README MVP features 4 and 5 are missing. Feature 4 is "every location is a card with its time and a slider colored by its local time of day (night / morning / working hours / evening)". Feature 5 is "drag the slider … in any location; all other locations are recalculated".

The approved screens (README "Screenshots": `docs/design/screens/phone-light.png`, `phone-dark.png`, `tablet-light.png`) and `docs/architecture/views.md` ("Cards", "Day-period colors", "Visual style") give every card a day track with a handle. Every track spans 00–24 of the reference zone, so all handles stand at the same position. Dragging any handle changes the reference moment and all handles move together. ADR-0002 "View contract" requires every view to "let the user select a time".

Audience: every user, on phones and wide screens. It builds directly on the pinned reference moment of the archived `select-date-with-calendar-and-now`.

## What Changes

- ADDED: a day track (slider) on every location card that has a known time. It spans the reference day: from local midnight of the reference zone to the next local midnight, so it is 23, 24 or 25 hours long. The handle stands at the position of the reference moment within that day, at the same position on every card.
- ADDED: dragging or tapping any track, or moving its handle with the keyboard, pins the reference moment to the chosen instant, in 15-minute steps from the start of the reference day. Every card's time, date, UTC offset and handle update in the same render. From a live moment the first move pins it and the date bar's Now button appears. Now returns to live as today.
- ADDED: each track is coloured by the location's own day periods. The periods are night 22:00–07:00, morning 07:00–09:00, working hours 09:00–18:00 and evening 18:00–22:00, in the location's local time. Colours come from the existing day-period design tokens, light and dark. Transitions are soft: 1 hour around 07:00 and 22:00, 15 minutes around 09:00 and 18:00 (`views.md` "Day-period colors"). An offset change that moves the local time into another period is a hard colour edge.
- ADDED: on screens 768 px and wider, the track sits right of the time column and shows local hour labels under it. The labels are the location's local time at the start of the reference day, then +6 h, +12 h, +18 h, and at its end (`22 · 04 · 10 · 16 · 22`, `00:30 · 06:30 …` for :30 zones). Below 768 px the track takes its own line under the city and time, without labels, as on the phone screens.
- MODIFIED: the date bar's DST gap note now also disappears when the user selects a time (today it stays "until the next date change or Now").
- No stored data changes: the reference moment is still never stored (ADR-0003, ADR-0004 schema version stays 1).

## Capabilities

### New Capabilities

- `time-selection`: the day track on location cards. Covers the reference day it spans, the handle position, selecting a time by pointer and keyboard, the day-period colours, hour labels, layout, accessibility and performance.

### Modified Capabilities

- `date-selection`: modifies "Wall-clock resolution on the new date". The gap note also ends with a time selection.

## Impact

- `packages/client/src/`: `constants/` (day-period schedule, track steps), `model/` (`SELECT_INSTANT` command, reference day, day periods, track position and colour stops), `presenter/` (track data on location rows, hour labels, slider value text), `controller/` (`useTimeSelection`, reference day passed when rows are presented in `useLocations`), `views/shared/` (`DayTrack`, its key mapping and gradient builder; `LocationRow` layout), `locales/en.json`, `locales/ru.json`.
- Tests: new unit BDD and E2E features under `src/test/features/time_selection/`. Every existing screenshot baseline with rows ("list", "pinned", "calendar") is re-approved, and a new "time-selected" state is added.
- No new dependencies, no network, no storage schema change.

## Goals

- G1: A user sets any 15-minute time of the shown day with 1 drag or tap, or at most 4 key presses for a jump of up to 4 hours (Page keys) plus at most 3 presses for the remaining quarter hours.
- G2: After any time selection, 100% of cards show the new time, date, offset and handle position in the same render.
- G3: The colours of every track match the location's local day periods at 100% of positions outside the transition windows.

## Non-Goals

- NG1: Typing an exact time (`SET_WALL_TIME`) and the wall-time hint in the card (`views.md` "Time display", "Wall-time hint"). They belong to a later change.
- NG2: Home location, the derived Here entry and differences from the reference zone (ADR-0007). The reference zone stays the device time zone, the only one that exists today.
- NG3: The midnight marker with the new date on the track (`views.md` "Midnight marker"). The hour labels show local midnight as `00` on wide screens. A dedicated marker is a later change.
- NG4: A user-defined day-period schedule and marking weekends (`domain-model.md` "Day periods": "Weekends are not marked in the MVP").
- NG5: The Grid view and its hour cells.
- NG6: Storing or sharing the selected time (ADR-0003: "The reference moment is not persisted").
- NG7: Moving past the ends of the reference day by dragging or keys. The day changes only through the date bar.
- NG8: A 12-hour time format. All labels stay 24-hour, as the existing card times are.

## Users & Scenarios

- U1: A user in Almaty drags the Almaty handle to 18:00. Moscow reads 16:00 and New York 09:00 at once. All handles stand at three quarters of their tracks.
- U2: A user scans the cards on a tablet. New York's track is yellow (working hours) where Almaty's is blue (night), and the hour labels under each track show the local hours.
- U3: A keyboard user tabs to the Moscow slider, presses Page Up twice and Arrow Right once. The moment moves 2 h 15 min forward and every card follows.
- U4: After browsing times, the user presses Now in the date bar. The handles jump to the current time and follow the clock again.
- U5: A user on a 320 px phone drags a track horizontally without scrolling the page and without moving the card in the list.

## Requirements

### Functional

- FR1: Every location card whose zone is known shows a day track. The track spans the reference day: from the start of the day of the effective instant in the reference zone (the device time zone) to the start of the next day, in absolute time. A row whose zone is unknown shows no track. The empty list shows no track.
- FR2: The handle of every track stands at the position of the effective instant within the reference day, as a fraction 0–1 of its length. This fraction is the same on every card. While live it follows the clock at every minute update. While pinned it stays.
- FR3: Selecting a position on any track (pressing or dragging the pointer) pins the reference moment to the instant at that position, rounded to the nearest 15-minute step from the start of the reference day. The result is clamped between the start of the day and the last step before its end. Every card's time, date, UTC offset and handle show the new moment in the same render. Repeating the instant already pinned changes nothing. A mouse or pen selects on press. A touch selects only once the finger has moved horizontally along the track, or when it lifts after a tap the browser did not cancel; a touch that moves mostly vertically, or that the browser cancels to scroll, selects nothing.
- FR4: A focused slider moves the moment by keys. Arrow Right / Arrow Up go to the next 15-minute step and Arrow Left / Arrow Down to the previous one. Page Up / Page Down move 1 hour forward / back from the current step. Home goes to the start of the reference day and End to its last step. Every result is clamped to the reference day and pinned as in FR3.
- FR5: A time selection is reported as `UNIQUE` (an exact instant) and ends a date bar gap note. A time selection from live shows the Now button. Now returns to live as before: the handles show the current instant and follow the clock. A later date change keeps the wall-clock time selected in the reference zone, so the handles keep their position unless DST changes the day's length.
- FR6: Each track is coloured by the location's day periods in its own local time: night from 22:00 to 07:00, morning from 07:00 to 09:00, working hours from 09:00 to 18:00, evening from 18:00 to 22:00. Each boundary blends the two colours over a window centred on the boundary instant: 60 minutes for 07:00 and 22:00, 15 minutes for 09:00 and 18:00. A boundary whose local time does not exist that day (DST gap) is skipped. An offset change inside the reference day that changes the period of the local time is a hard colour edge. The colours are the day-period design tokens of the active theme.
- FR7: From 768 px every track shows five local hour labels at their positions: at the start of the reference day, at +6 h, +12 h and +18 h of absolute time, and at its end. Each label is the location's local time, two-digit 24-hour hours (`04`), with minutes when they are not zero (`00:30`, `05:45`).
- FR8: A time selection whose instant is malformed is rejected with a typed error and changes nothing. A time selection writes nothing to storage and is not shared with other tabs. A change of the list in another tab keeps the selected moment.
- FR9: Every new string (slider name and value text) exists in English and Russian.

### Non-Functional

#### Performance

- NFR-P1: One time selection works out the new moment and re-presents 50 location rows, with their track positions, in at most 50 ms (model and presenter work, as in the existing date-change budget). There is no loading state.
- NFR-P2: A date change re-presents 50 rows together with new colour stops and hour labels for their tracks in at most 50 ms.

#### Accessibility

- NFR-A1: axe-core reports no violations with the tracks shown live, pinned by a time selection, and in the light and dark themes.
- NFR-A2: Each track is one Tab stop, operable with the keys of FR4 in a real browser. A focused handle shows a visible focus ring. Keys on the slider never scroll the page and never start a card reorder.
- NFR-A3: Each slider is named "Time in {city}" ("Время — {city}"). It exposes its value as minutes since the start of the reference day (`aria-valuemin` 0, `aria-valuemax` the last step) and a value text of the local time and date of its card ("12:30, Sun, Mar 8"). The time and date are not a live region, as today.

#### Responsive

- NFR-R1: With tracks shown, the page does not scroll horizontally at 320 px and 2560 px.
- NFR-R2: Below 768 px the track is on its own line under the city and time line, spanning the card's content width, without hour labels. From 768 px the track is on the same line, right of the time column, filling the remaining width, with the hour labels under it. The track is 10 px high below 768 px and 12 px from 768 px. A horizontal drag on a track does not scroll the page and does not move the card. A vertical swipe that starts on a track scrolls the page and selects no time.
- NFR-R3: The approved screenshots at 375 px and 1024 px, in both themes and both projects (`chromium`, `mobile-chrome`), show the tracks. The existing "list", "pinned" and "calendar" baselines are re-approved, and a new "time-selected" state is added.

## UX Acceptance Criteria

- UX1: The slider's touch target is at least 44 px high and the handle at least 44 × 44 px of hit area. The visible handle is a circle, 28 px below 768 px and 32 px from 768 px, filled with the surface colour and outlined with the foreground colour, as on the approved screens.
- UX2: The handle's centre is exactly at the instant's position: the start of the day is the left edge of the track and its end is the right edge. A handle at an end may overhang the track by half its width, as on the screens.
- UX3: The hour labels are secondary text (the muted foreground colour) with tabular figures, so they do not compete with the card's time.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | live, list with locations | every known-zone card has a track; handles follow the clock |
| any | pinned by a time or date selection | handles at the pinned position; Now shown in the date bar (FR5) |
| any | pinned in a DST gap by a date change | gap note shown; the next time selection removes it (FR5) |
| any | row with an unknown zone | that row has no track; other rows unaffected (FR1) |
| any | no locations (empty) | empty state unchanged; no tracks |
| any | view loading (skeleton) | skeleton unchanged; tracks appear with the rows |
| any | view failed to load / stored list unreadable | error with Retry / Reset unchanged; no tracks; the moment is kept |
| any | storage unavailable | warning shown; tracks work the same (nothing is stored either way) |
| any | malformed time selection | nothing changes (FR8) |
| offline | any of the above | same behaviour: time selection needs no network |

## Behavior

Feature files under `packages/client/src/test/features/time_selection/`, tagged `@add-time-sliders-to-location-cards`:

- `time_selection_select_time.feature`: selecting a position, key moves, pinning, Now, the gap note, a date change keeping the position, 23/25-hour days, malformed instant, nothing stored, the other tab, the time-selection budget (vitest-cucumber).
- `time_selection_day_track.feature`: handle position, colour stops, colours at sampled positions, skipped boundaries, hour labels, unknown zone, the date-change budget (vitest-cucumber).
- `time_selection_e2e.feature`: pointer drag, keyboard, accessible names and values, focus, axe-core, layout on narrow and wide screens, no horizontal scrolling, touch targets, gradient colours from tokens, drag without reorder (playwright-bdd).
- `time_selection_view_contract_e2e.feature`: the `@view-contract` scenario "Select a time".
- The "time-selected" state is added to the screenshot outline of `locations/locations_ui_e2e.feature`.

## Visual Reference

README "Screenshots": `docs/design/screens/phone-light.png`, `phone-dark.png`, `tablet-light.png` and their HTML twins. Use them for the track, the handle, the gradient and the hour labels. Differences, the home icon, the Here entry and the wall-time hint on those screens are out of scope (NG1, NG2). `docs/design/README.md` says documents win over screens. The screens blend 09:00 and 18:00 over 20 minutes, while `views.md` says 15 minutes, so FR6 uses 15. Design tokens (`--color-day-*` in `styles/tokens.css`) are the source of truth for colours.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR9, NFR-P1, NFR-P2, NFR-A1–NFR-A3, NFR-R1–NFR-R3 and UX1–UX3 have at least one automated test that names `add-time-sliders-to-location-cards` together with the id.
- M2: Device zone `Asia/Almaty`, current instant `2026-03-08T07:30:00Z`, English. The reference day is `2026-03-07T19:00:00Z`–`2026-03-08T19:00:00Z` and the handle fraction is `0.520833` (±0.000001) on all 4 cards: Almaty, Moscow, Kolkata, New York. Selecting fraction `0.75` pins `2026-03-08T13:00:00Z`: Almaty `18:00`, Moscow `16:00`, Kolkata `18:30`, New York `09:00` `Sun, Mar 8` `UTC−4`. Selecting fraction `0.52` pins `2026-03-08T07:30:00Z`, `1.0` pins `2026-03-08T18:45:00Z` and `0` pins `2026-03-07T19:00:00Z` (4 of 4).
- M3: Device zone `Asia/Almaty`, pinned at `2026-03-08T07:30:00Z` (value 750). Next step → `07:45:00Z`, previous step → `07:15:00Z`, Page Up → `08:30:00Z`, Page Down → `06:30:00Z`, Home → `2026-03-07T19:00:00Z`, End → `2026-03-08T18:45:00Z`. Live at `2026-03-08T07:37:00Z`: next step → `07:45:00Z`, previous step → `07:30:00Z` (8 of 8).
- M4: Device zone `America/New_York`. The reference day of `2026-03-08` is 1380 minutes long (`aria-valuemax` 1365) and fraction `0.5` pins `2026-03-08T16:30:00Z` (`12:30`). The day of `2026-11-01` is 1500 minutes long (`aria-valuemax` 1485). From the gap state of `2026-03-08T07:30:00Z`, the next step pins `2026-03-08T07:45:00Z` with `UNIQUE` and the gap note is gone (3 of 3).
- M5: Reference day of M2. Almaty's colour stops are `0.270833` night, `0.3125` morning, `0.369792` morning, `0.380208` working, `0.744792` working, `0.755208` evening, `0.895833` evening, `0.9375` night. New York's are `0.161458` working, `0.171875` evening, `0.3125` evening, `0.354167` night, `0.645833` night, `0.6875` morning, `0.744792` morning, `0.755208` working (16 of 16, ±0.000001). At each of the 96 quarter-hour positions of the day that lies outside a blend window, the colour of both tracks equals the period of the local time. For `Pacific/Apia` on the UTC reference day `2011-12-30`, no stop comes from a boundary of the skipped local date `2011-12-30`.
- M6: Hour labels for the M2 day: Almaty `00 06 12 18 00`, Moscow `22 04 10 16 22`, Kolkata `00:30 06:30 12:30 18:30 00:30`, New York `14 20 03 09 15` (4 of 4).
- M7: 0 storage writes caused by 20 time selections and a Now.
- M8: Mutation score of the new or changed model, presenter, controller and view code ≥ 95% (minimum 90%).
- M9: axe-core reports 0 violations in 2 track states × 2 themes. There is 0 horizontal scrolling at 320 px and 2560 px. The re-approved and new screenshot baselines (375 / 1024 px × light / dark × `chromium` / `mobile-chrome`) pass without `--update-snapshots`.

## Open Questions

- Q1: Which keys move the handle? Decided: the WAI-ARIA slider pattern (FR4). Arrows move one 15-minute step, Page keys 1 hour, Home / End go to the day's ends. `domain-model.md` lists "keyboard: ±1 h, ±15 min" for `SHIFT_TIME`, and FR4 offers both step sizes. `views.md` gives "arrows 1 hour, Shift 15 minutes" only for the Grid view, which does not exist yet.
- Q2: The Russian slider name cannot decline the city ("Время в Москве"), because city labels are stored in the nominative case. Decided: "Время — {city}" (NFR-A3). Case-aware names wait for richer city data (ADR-0006).
- Q3: The screens blend 09:00 and 18:00 over 20 minutes. Decided: 15 minutes, as `views.md` says (documents win, `docs/design/README.md`).
- Q4: No current IANA transition moves a local time across a period boundary. The hard-edge rule of FR6 is therefore proven by the sampled-colour check of M5 (colour equals the local period outside blend windows) and by a model unit test that feeds synthetic offset changes to the pure step that assembles the stops (design D4), not by a scenario with real zone data.
