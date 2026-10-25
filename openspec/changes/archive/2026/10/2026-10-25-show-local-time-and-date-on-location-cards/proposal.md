# Show the local time and date on location cards

## Why

The Cards view lists the user's locations with city, country, UTC offset and the "Your time zone" badge (`openspec/specs/locations/spec.md`, requirements "List in the Cards view", "UTC offset on location rows", "Device time zone badge on location rows"), but it never shows what time it is there. The main question of a world clock — "what time and what day is it in Moscow right now?" — still has to be worked out from the offset in the user's head. The approved screens (README "Screenshots", `docs/design/screens/phone-light.png`, `tablet-light.png`) and `docs/architecture/views.md` ("Time display": "time of the reference moment in large digits: follows the clock in `LIVE`") put the time in large digits and the date under it on every card.

Audience: every user with at least one location, on phones and on wide screens. Every later feature (sliders, Now, date selection) builds on this time display, so it comes first.

## What Changes

- ADDED: every location card shows the location's current local time (hours and minutes, large digits) and its local date (weekday, day, month) under the time, both derived from the location's IANA identifier at the current instant with Temporal, so DST and :30 / :45 offsets are respected.
- ADDED: the time and the date follow the clock: they change at the start of every minute, stop updating while the page is hidden and catch up at once when it is shown again ([ADR-0003](../../../docs/adr/0003-reference-instant-time-model.md) "Clock tick is a side effect").
- ADDED: layout per the approved screens — below 768 px the time sits on the city line at the right end of the card with the date right-aligned under it; from 768 px the time and the date form a column right after the city and country column.
- ADDED: the date text is localized (English, Russian) by the interface language's own conventions, and carries a machine-readable ISO date (`2026-03-08`).
- MODIFIED: the UTC offset is computed again at every minute tick (today: "MUST NOT be refreshed on a timer"), so a DST change while the app is open shows the new offset together with the new time.
- MODIFIED: the device time zone is read again at every minute tick and when the page becomes visible, as [ADR-0007](../../../docs/adr/0007-reference-zone-and-device-time.md) prescribes ("The controller re-reads it on every clock tick and when the page becomes visible"); today it is read once at start because no tick existed (Q2 of the archived `mark-device-time-zone-in-location-list`). It is still never stored.
- No stored data changes ([ADR-0004](../../../docs/adr/0004-local-persistence-strategy.md) schema version stays 1): neither the time, the date nor the instant is persisted.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `locations`: adds the requirements "Local time and date on location rows", "Local time and date follow the clock", "Local time and date layout" and "Local time and date are fast and accessible"; modifies "UTC offset on location rows" (offset refreshed at each minute tick) and "Device time zone badge on location rows" (device zone re-read at each minute tick and when the page becomes visible).

## Impact

- `packages/client/src/`: `model/` (local date-time of a location at an instant), `constants/` (format options, minute length), `presenter/` (time and date labels on `LocationRow`), `controller/` (minute tick with visibility pause in `LocationsProvider`, re-presentation in `useLocations`), `views/shared/` (time display block on the card, responsive layout of `LocationRow`).
- Tests: new unit BDD and E2E features under `src/test/features/locations/`; existing scenarios touched: the exact-text "Zero offset" step of `locations_utc_offset_unit.steps.tsx`, the test "should read the device zone once across list changes" of `controller/useLocations.deviceTimeZone.test.tsx` and the unit BDD scenario "Device zone is read once" (both still hold between ticks; they now run with a manual tick scheduler), and the screenshot outline in `locations_ui_e2e.feature` (pinned time; the 8 "list" baselines are re-approved).
- No new dependencies, no storage schema change, no network.

## Goals

- G1: 100% of location cards show a local time and date that equal the location's wall-clock time at the current instant, with no setup by the user.
- G2: The shown time is never more than 1 second behind a minute change while the page is visible.
- G3: The card layout matches the approved phone and tablet screens at 375 px and 1024 px, without horizontal scrolling from 320 px to 2560 px.

## Non-Goals

- NG1: Day tracks / time sliders and choosing a time by dragging (README MVP feature 5) — out of scope by the task.
- NG2: The Now control and the pinned (`PINNED`) reference moment — out of scope by the task; the app stays in `LIVE`.
- NG3: The date control (previous / next day, calendar) — out of scope by the task.
- NG4: The 12 / 24-hour preference (README MVP feature 7); this change shows 24-hour time (Q1).
- NG5: Differences from the reference zone (`−2 h`, `+0:30`), the day-shift hint, the home location and the derived Here entry (ADR-0007 "Reference zone", "Here marker").
- NG6: Typing a time into a card ("tap to type an exact time" in `views.md`) and the wall-time hint.
- NG7: Seconds in the time display.

## Users & Scenarios

- U1: A user in Almaty with Moscow and New York in the list sees "10:30" and "03:30" next to the cities when it is 12:30 in Almaty, each with its own date.
- U2: A user with Tokyo and New York in the list late on Sunday (UTC) sees Tokyo already on Monday and New York still on Sunday.
- U3: A user keeps the app open on a second screen; at every new minute the time on every card changes.
- U4: A user switches to another tab for 10 minutes and back; the cards show the right time at once.
- U5: A user with the Russian interface reads the date in Russian.
- U6: A phone user sees the time on the city line at the right; a tablet user sees city, then time and date, in columns.

## Requirements

### Functional

- FR1: Every location row shows the location's current local time as hours and minutes in 24-hour form with two-digit hours (`03:30`), derived from its canonical IANA identifier at the current instant with Temporal (DST and :30 / :45 offsets respected; never from a stored offset).
- FR2: Every location row shows the location's local date at the current instant — short weekday, day and short month as written in the interface language (English `Sun, Mar 8`, Russian `вс, 8 мар.`) — together with its machine-readable ISO date (`2026-03-08`); rows of zones on different sides of midnight show different dates.
- FR3: While the page is visible, the time and the date of every row change at the start of every minute (aligned to the minute boundary of the clock, not 60 s after opening). While the page is hidden nothing is updated; when it becomes visible again, every row shows the current time at once and the minute updates resume.
- FR4: At every minute update and when the page becomes visible, the UTC offset of every row is computed again and the device time zone is read again (canonicalized, unknown → `UTC`, never stored), so a DST change or a change of the device zone while the app is open is shown together with the new time.
- FR5: The time and the date are also computed again whenever the list is presented anew — the app opens, a location is added, removed or moved, the list changes in another tab, the list is reset, the interface language changes.
- FR6: A location whose identifier the browser does not know shows its city and remove action without time and date; the other rows are unaffected.

### Non-Functional

#### Performance

- NFR-P1: Presenting 50 locations with time, date, offset and badge takes at most 50 ms; the time and the date appear in the same render as their row, with no loading state.

#### Accessibility

- NFR-A1: axe-core reports no violations for a list with times and dates in the light and the dark theme.
- NFR-A2: The time and the date are plain readable text of the card, not a live region: minute updates are not announced, and a row's accessible name stays its city (plus the device time zone badge when shown).

#### Responsive

- NFR-R1: A list with Almaty, Kathmandu, New York and Tokyo causes no horizontal scrolling at 320 px and at 2560 px.
- NFR-R2: Below 768 px the time is on the city line at the right end of the card's content and the date is right-aligned under it; from 768 px the time follows the city and country column, in the left half of the card, with the date left-aligned under it.
- NFR-R3: The approved "list" screenshots at 375 px and 1024 px in both themes, taken at the pinned instant `2026-03-08T07:30:00Z`, show "12:30" on Almaty and "10:30" on Moscow, each with its date.

## UX Acceptance Criteria

- UX1: The time is the most prominent text of the card — larger and bolder than the city — and uses tabular figures, so the card does not shift when the digits change.
- UX2: The date is secondary text (smaller, muted colour, as the country line) and sits directly under the time.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | locations | every card: city, country, offset, badge as today, plus time and date (FR1, FR2) |
| any | no locations | empty state unchanged, no time shown |
| any | stored list unreadable | error with Reset unchanged; after Reset the empty state |
| any | storage unavailable | warning unchanged; cards show time and date as with storage |
| any | location with an unknown identifier | that card without time and date, others unchanged (FR6) |
| any | loading | none of its own: time and date are computed synchronously with the row; the existing view skeleton is unchanged |
| any | page hidden, then visible | no updates while hidden; current time on every card as soon as it is visible (FR3) |
| offline | any of the above | same behaviour: time and date need no network |

## Behavior

Feature files under `packages/client/src/test/features/locations/`, tagged `@show-local-time-and-date-on-location-cards`:

- `locations_local_time_unit.feature` — time and date per zone, day boundary, Russian date, list changes, unknown zone, performance (vitest-cucumber, jsdom, `fakeClock`);
- `locations_clock_tick.feature` — minute updates, hidden page, DST change while open, device zone re-read at the tick and on return to the page, no writes (vitest-cucumber, jsdom, a switchable clock and an injected tick scheduler);
- `locations_local_time_e2e.feature` — layout at 375 px and 1024 px, no horizontal scrolling at 320 px and 2560 px, axe-core in both themes, accessible name and no live region (playwright-bdd);
- the existing screenshot outline of `locations_ui_e2e.feature` (pinned instant, re-approved "list" baselines).

## Visual Reference

README "Screenshots" — `docs/design/screens/phone-light.png`, `phone-dark.png`, `tablet-light.png` and their HTML twins. The sliders, differences, home icon, wall-time hint and the bottom date bar on those screens are out of scope (NG1–NG6). Design tokens are the source of truth for colours and fonts.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR6, NFR-P1, NFR-A1, NFR-A2, NFR-R1–NFR-R3, UX1 and UX2 have at least one automated test tagged or commented with `show-local-time-and-date-on-location-cards`.
- M2: The unit BDD scenarios show exactly these values in English: at `2026-03-08T07:30:00Z` Almaty `12:30` / `Sun, Mar 8`, Moscow `10:30` / `Sun, Mar 8`, Kathmandu `13:15` / `Sun, Mar 8`, New York `03:30` / `Sun, Mar 8` (4 of 4); at `2026-03-08T16:00:00Z` Tokyo `01:00` / `Mon, Mar 9` and New York `12:00` / `Sun, Mar 8` (2 of 2); in Russian Almaty at `2026-03-08T07:30:00Z` `12:30` / `вс, 8 мар.` (1 of 1).
- M3: Minute alignment: opened at `2026-07-15T12:00:42.500Z`, the first update is scheduled in exactly 17 500 ms and each later one in 60 000 ms; 0 updates are scheduled while the page is hidden; a New York card opened at `2026-03-08T06:59:30Z` reads `01:59` / `UTC−5` and after the next minute `03:00` / `UTC−4`.
- M4: Mutation score of the new or changed model, presenter, controller and view code is at least 95% (minimum 90%).
- M5: axe-core reports 0 violations in 2 themes; 0 horizontal scrolling at 320 px and 2560 px; the layout checks pass at 375 px and 1024 px in the `chromium` and `mobile-chrome` projects.
- M6: 8 of 8 "list" screenshot baselines (375 / 1024 px × light / dark × `chromium` / `mobile-chrome`) are re-approved and pass without `--update-snapshots`.

## Open Questions

- Q1: The app has no hour-format preference yet (domain-model.md `HourFormat`, README MVP feature 7). This change shows 24-hour time with two-digit hours, as the approved screens do; the preference change will switch the presenter's format.
- Q2: The date follows the interface language's own `Intl` conventions (`Sun, Mar 8`, `вс, 8 мар.`), which differ in order, case and punctuation from the samples in `docs/architecture/views.md` (`Mon, 28 Sep`) and the screens (`Вс, 8 мар`). Aligning those docs is left to a docs change; no custom date pattern is introduced.
