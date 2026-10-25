# Select a date with the calendar and return to now

## Why

The Cards view shows every location's time and date only for the current instant (`openspec/specs/locations/spec.md`, "Local time and date on location rows"). A user cannot answer "what time will it be in New York next Monday at my 12:30?" or check how a DST change on another day moves the offsets — README MVP feature 6 ("Date selection — pick a date; UTC offsets and daylight saving time are resolved for the selected date, not for today") is missing. The approved screens (README "Screenshots", `docs/design/screens/phone-light.png`, `tablet-light.png`) and `docs/architecture/views.md` ("Date control", "Now control") put a bottom bar `[<] Sun, 8 March [>]  [Now]` under the list: arrows switch to the previous / next day, tapping the date opens a calendar, Now returns to the current time. ADR-0002 "View contract" requires every view to "select a date, return to 'now'".

Audience: every user, on phones and wide screens. The pinned reference moment introduced here (ADR-0003 "Two modes") is also the base for the later time slider and typed time.

## What Changes

- ADDED: the reference moment of [ADR-0003](../../../docs/adr/0003-reference-instant-time-model.md): `LIVE` (follows the clock, the start mode on every open) or `PINNED` (a fixed instant chosen by the user). It is never stored.
- ADDED: a bottom date bar on the main page: previous-day button, the shown date (a button that opens a calendar), next-day button, and a Now button shown only while the moment is pinned.
- ADDED: previous / next day and a date picked in the calendar move the reference moment to that date, keeping its wall-clock time in the reference zone ([ADR-0007](../../../docs/adr/0007-reference-zone-and-device-time.md); the device time zone, since home locations do not exist yet). Wall-clock times that do not exist or occur twice on the new date are resolved with `compatible` disambiguation and reported as `UNIQUE | GAP | AMBIGUOUS` by the model; when a time does not exist on the new date, the bar tells the user which time is shown instead (ADR-0003: "the view tells the user").
- ADDED: a calendar dialog: month grid in the interface language, today and the shown date marked, previous / next month, full keyboard operation.
- MODIFIED: location rows show time, date and UTC offset at the reference moment (equal to the current instant in `LIVE`); while pinned, minute updates no longer change them.
- MODIFIED: the main page's empty bottom bar slot now holds the date bar; the notices region stays above it.
- No stored data changes ([ADR-0004](../../../docs/adr/0004-local-persistence-strategy.md) schema version stays 1).

## Capabilities

### New Capabilities

- `date-selection`: the reference moment (`LIVE` / `PINNED`), previous / next day, choosing a date in the calendar, returning to now, the date bar and the calendar's text, keyboard and layout.

### Modified Capabilities

- `locations`: modifies "Local time and date on location rows", "UTC offset on location rows" and "Local time and date follow the clock" — values are computed at the reference moment, and minute updates do not change them while pinned.
- `main-page`: modifies "Main page regions" — the bottom bar slot holds the date bar, with the notices above it.

## Impact

- `packages/client/src/`: `model/` (reference moment, wall-clock resolution, calendar month and focus moves, new commands), `constants/` (date format options, week constants), `presenter/` (date bar and calendar labels), `controller/` (`useReferenceMoment`, rows at the effective instant in `useLocations`), `views/shared/` (`DateBar`, `CalendarDialog`), `app/MainPage.tsx` and `app/AppShell.tsx` (bottom bar slot), `locales/en.json`, `locales/ru.json`.
- Tests: new unit BDD and E2E features under `src/test/features/date_selection/`; every existing "list", "empty", "suggestions" and "IST results" screenshot baseline is re-approved because the bar appears on the page.
- No new dependencies, no network, no storage schema change.

## Goals

- G1: A user reaches any date with at most 1 action per day for neighbouring days and at most 3 actions (open calendar, change month as needed, pick a day) within the shown month ±1.
- G2: After any date change, 100% of rows show time, date and UTC offset resolved for the new moment, in the same render.
- G3: The user returns from any pinned date to the current time with 1 action.

## Non-Goals

- NG1: Choosing a time of day (slider, typed time, `SELECT_INSTANT`, `SET_WALL_TIME`, `SHIFT_TIME`) — README MVP feature 5, a later change.
- NG2: The wall-time hint text in the cards (`views.md` "Wall-time hint") and offering the later instant of an `AMBIGUOUS` time. Both belong to typed time (README MVP feature 5), and ADR-0003 makes the offer optional ("the view may offer the later one"). This change shows only the `GAP` note in the bar (FR4, Q1).
- NG3: Home location and the derived Here entry (ADR-0007): the reference zone is the device time zone, the only one that exists today.
- NG4: Differences from the reference zone and day-shift hints on rows.
- NG5: A day strip for wide screens (open-questions Q5: decided with the Grid view).
- NG6: Storing or sharing the selected date (URL, storage) — ADR-0003: "The reference moment is not persisted".
- NG7: Date limits narrower than Temporal's own range; past and future dates are both allowed.

## Users & Scenarios

- U1: A user in Almaty plans a call for tomorrow: taps the next-day arrow and reads New York's time and date for tomorrow at the same Almaty wall-clock time.
- U2: A user checks a date two months ahead: opens the calendar, moves two months on, picks the 15th; all cards show that date, with offsets valid for it (New York `UTC−4` in July, `UTC−5` in January).
- U3: After browsing dates, the user taps Now; the cards show the current time again and follow the clock.
- U4: A keyboard user reaches the bar with Tab, changes the day with the arrow buttons, opens the calendar with Enter, moves with arrow keys and picks a day with Enter.
- U5: A Russian-speaking user sees `вс, 8 марта`, a calendar starting on Monday and `Сейчас`.

## Requirements

### Functional

- FR1: The reference moment is `LIVE` whenever the app opens; in `LIVE` every row shows the current instant. The reference moment is never written to storage and is never shared between tabs.
- FR2: Previous day / next day move the reference moment exactly one calendar day back / forward in the reference zone (the device time zone), keeping the wall-clock time it has there, and pin it (`PINNED`); from `LIVE` they start from the current instant.
- FR3: Tapping the shown date opens a calendar on the month of the shown date, with the shown date marked as selected and today (in the reference zone) marked as today. Previous / next month change the month shown without changing the reference moment. Picking a day moves the reference moment to that date, keeping its wall-clock time in the reference zone, pins it and closes the calendar. Picking the date already shown, or closing the calendar without picking, changes nothing (a `LIVE` moment stays `LIVE`).
- FR4: A wall-clock time that does not exist on the new date (DST gap) is moved forward by the gap; one that occurs twice resolves to the earlier instant (`compatible` disambiguation, ADR-0003). The model reports the outcome as `UNIQUE`, `GAP` or `AMBIGUOUS` with the pinned moment. On `GAP` the date bar shows a note naming the requested and the shown wall-clock time (`02:30 does not exist on this day because of a clock change; showing 03:30.`) until the next date change or Now; `UNIQUE` and `AMBIGUOUS` show no note.
- FR5: While pinned, every row's time, date and UTC offset are those of the pinned instant, so offsets and DST are resolved for the selected date; minute updates and returns to the visible page do not change them (the device time zone is still re-read).
- FR6: The Now button is shown only while the moment is pinned. It returns the moment to `LIVE`: rows show the current instant at once and follow the clock again, and the Now button disappears.
- FR7: The date bar shows the date of the reference moment in the reference zone: short weekday, day and month name below 768 px (`Sun, March 8`, `вс, 8 марта`), full weekday from 768 px (`Sunday, March 8`, `воскресенье, 8 марта`), with the year appended when it differs from the current year in the reference zone (`Mon, March 8, 2027`). In `LIVE` it follows the clock, so it changes at local midnight.
- FR8: The date bar is shown at the bottom of the main page in every state of the page — view loading, view error, empty list, unreadable stored list, storage unavailable, offline — and the notices stay visible above it.
- FR9: Every date bar and calendar string exists in English and Russian; month and weekday names follow the interface language; the calendar week starts on Sunday in English and on Monday in Russian.
- FR10: A date change whose date or instant is malformed, or that would leave the range Temporal supports is rejected with a typed error and changes nothing.

### Non-Functional

#### Performance

- NFR-P1: A date change re-presents 50 location rows in at most 50 ms, synchronously, with no loading state.

#### Accessibility

- NFR-A1: axe-core reports no violations with the bar in `LIVE`, with the bar pinned, and with the calendar open, in the light and the dark theme.
- NFR-A2: Keyboard: Tab reaches previous day, date, next day and Now in that order; Enter and Space activate them. In the calendar the focus starts on the selected date; arrow keys move by a day / a week, Home / End to the start / end of the week, PageUp / PageDown by a month (the shown month follows the focus); Enter or Space picks the focused day; Esc closes without change. When the calendar closes, and after Now, the focus is on the date button.
- NFR-A3: Every control has an accessible name: "Previous day", "Next day", "Now", the date button "Choose date, Sunday, March 8, 2026"; each calendar day is named by its full date, today carries `aria-current="date"` and the selected day `aria-selected="true"`. Each date change is announced once through a polite live region ("Monday, March 9, 2026").

#### Responsive

- NFR-R1: With the bar in `LIVE`, pinned, and with the calendar open, the page does not scroll horizontally at 320 px and 2560 px.
- NFR-R2: The bar stays at the bottom of the viewport while the list scrolls, and the last card can be scrolled fully above it. Below 768 px the day arrows and date sit at the left and Now at the right; from 768 px they form one centered group. The calendar is full screen below 640 px and a centered dialog from 640 px, as the search is.
- NFR-R3: The approved screenshots at 375 px and 1024 px in both themes show the bar: the existing "list", "empty", "suggestions" and "IST results" baselines are re-approved, and new "pinned" and "calendar" states are added.

## UX Acceptance Criteria

- UX1: Every control of the bar and every calendar day is at least 44 × 44 px.
- UX2: Now is the accent-filled button with a clock icon and the label, as on the approved screens; the arrows are icon buttons.
- UX3: The date text in the bar is the most prominent text of the bar and uses the main foreground colour.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | `LIVE` | bar with arrows and today's date, no Now; rows follow the clock |
| any | `PINNED` | bar with the selected date and Now; rows show the pinned moment and do not tick (FR5, FR6) |
| any | calendar open | dialog with the month grid; the page behind is inert |
| any | view loading (skeleton) | bar shown and usable; rows appear at the reference moment when the view loads |
| any | view failed to load | bar shown; the error with Retry is unchanged |
| any | no locations | empty state unchanged; bar shown and usable |
| any | stored list unreadable | error with Reset unchanged; bar shown; Reset keeps the reference moment |
| any | storage unavailable | warning above the bar; the date works as with storage (nothing is stored either way) |
| any | pinned in a DST gap | bar with the selected date, Now and the gap note (FR4) |
| any | date out of range or malformed | nothing changes (FR10) |
| offline | any of the above | same behaviour: date selection needs no network |

## Behavior

Feature files under `packages/client/src/test/features/date_selection/`, tagged `@select-date-with-calendar-and-now`:

- `date_selection_reference_moment.feature` — `LIVE` on open, previous / next day, DST gap (with its note) and overlap, Now, pinned rows ignore ticks, nothing stored (vitest-cucumber);
- `date_selection_calendar_unit.feature` — calendar month, week start, today and selected marks, picking a date, closing without change (vitest-cucumber);
- `date_selection_date_bar_unit.feature` — bar labels in English and Russian, year, Now visibility, bar in every page state (vitest-cucumber);
- `date_selection_e2e.feature` — keyboard, focus, accessible names, announcements, axe-core, layout and screenshots (playwright-bdd);
- view-contract scenarios "Select a date" and "Return to now" tagged `@view-contract` in `date_selection_view_contract_e2e.feature`;
- "User opens the app" and "Notices stay available" in `main_page/main_page_unit.feature` gain the date bar; "Notice above the bar" added to `main_page/main_page_e2e.feature`, and `pinned` / `calendar` states added to the screenshot outline of `locations/locations_ui_e2e.feature`.

## Visual Reference

README "Screenshots" — `docs/design/screens/phone-light.png`, `phone-dark.png`, `tablet-light.png` and their HTML twins (bottom bar). Sliders, differences, home icon and the wall-time hint on those screens are out of scope (NG1–NG4). Design tokens are the source of truth for colours.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR10, NFR-P1, NFR-A1–NFR-A3, NFR-R1–NFR-R3 and UX1–UX3 have at least one automated test tagged or commented with `select-date-with-calendar-and-now`.
- M2: Device zone `Asia/Almaty`, opened at `2026-03-08T07:30:00Z`, English: next day pins `2026-03-09T07:30:00Z` and rows read Almaty `12:30` / `Mon, Mar 9`, New York `03:30` / `Mon, Mar 9` / `UTC−4`; previous day from the start pins `2026-03-07T07:30:00Z` and New York reads `02:30` / `Sat, Mar 7` / `UTC−5`; picking `2026-07-15` pins `2026-07-15T07:30:00Z` and New York reads `03:30` / `Wed, Jul 15` (3 of 3).
- M3: Device zone `America/New_York`: next day from `2026-03-07T07:30:00Z` (02:30 local) pins `2026-03-08T07:30:00Z` with `GAP`; next day from `2026-10-31T05:30:00Z` (01:30 local) pins `2026-11-01T05:30:00Z` with `AMBIGUOUS`; next day from `2026-06-01T14:00:00Z` pins `2026-06-02T14:00:00Z` with `UNIQUE` (3 of 3); in English only the `GAP` case shows the note `02:30 does not exist on this day because of a clock change; showing 03:30.` (1 of 3).
- M4: The bar reads `Sun, March 8` at 375 px and `Sunday, March 8` at 1024 px in English, `вс, 8 марта` / `воскресенье, 8 марта` in Russian, and `Mon, March 8, 2027` for `2027-03-08` (5 of 5). The March 2026 calendar has 5 week rows starting with Sunday 1 March in English and 6 week rows starting with Monday (2 March in the second row) in Russian.
- M5: 0 storage writes caused by 10 date changes and a Now.
- M6: Mutation score of the new or changed model, presenter, controller and view code ≥ 95% (minimum 90%).
- M7: axe-core reports 0 violations in 3 bar states × 2 themes; 0 horizontal scrolling at 320 px and 2560 px; the re-approved and new screenshot baselines (375 / 1024 px × light / dark × `chromium` / `mobile-chrome`) pass without `--update-snapshots`.

## Open Questions

- Q1: Should a date change that lands in an overlap offer the later instant? Decided: not in this change (NG2). ADR-0003 says "the view may offer the later one", so the offer is optional. The model already reports `AMBIGUOUS`, so the typed-time change can add it. A gap is always told to the user (FR4), as ADR-0003 requires ("moved forward to 03:30; the view tells the user").
- Q2: The bar uses the interface language's own `Intl` conventions (`вс, 8 марта`), which differ in case from the screens (`Вс, 8 марта`), as decided in Q2 of the archived `show-local-time-and-date-on-location-cards`. No custom pattern is introduced.
