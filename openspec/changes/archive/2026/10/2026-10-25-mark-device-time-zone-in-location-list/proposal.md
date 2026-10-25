# Mark the device's own time zone in the location list

## Why

With several locations in the list, the user cannot tell at a glance which row is their own time zone: every row in the Cards view looks the same (city, country, UTC offset — `openspec/specs/locations/spec.md`, requirements "List in the Cards view" and "UTC offset on location rows"). Marking the row whose zone is the device's zone answers "which one is me?" without reading every offset.

Audience: every user with at least one location, most of all users who keep their own city in a list of several. [ADR-0007](../../../docs/adr/0007-reference-zone-and-device-time.md) already decides that "a location whose canonical zone ID equals the device zone gets a 'here' mark" and that the device zone reaches the model only through the `Clock` port and the `SET_DEVICE_TIME_ZONE` command. No code reads the device zone yet (`clock.timeZoneId()` has no production caller in `packages/client/src/`), so this change is the first step of ADR-0007: the mark on matching rows, with the zone read once when the app starts.

## What Changes

- ADDED: a location row whose canonical IANA zone equals the device time zone shows a "Your time zone" badge next to the city name; any number of rows can carry it, and none does when nothing matches.
- ADDED: the device time zone is read once when the app starts, through the existing time abstraction (`@/lib/temporal`), canonicalized, and kept in memory only; an identifier the browser does not know is treated as `UTC` (ADR-0007).
- ADDED: the badge is part of the row's accessible name, and its text is localized in English and Russian.
- No stored data changes: the list document keeps IANA identifiers, labels and country codes ([ADR-0004](../../../docs/adr/0004-local-persistence-strategy.md) schema version stays 1); the device zone is never persisted.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `locations`: adds the requirements "Device time zone badge on location rows", "Device time zone badge text" and "Device time zone badge is accessible and fits every screen".

## Impact

- `packages/client/src/`: `model/` (device zone in the locations state, the `SET_DEVICE_TIME_ZONE` command, the match rule), `constants/` (fallback zone), `presenter/presentLocationRows.ts` (badge label on a row), `controller/LocationsProvider.tsx` and `controller/useLocations.ts` (read the zone once, pass it to the presenter), `views/shared/LocationRow.tsx` (renders the badge, names the row), `locales/en.json` and `locales/ru.json` (badge text).
- Tests: a new unit BDD feature and a new E2E feature under `src/test/features/locations/`; `src/test/setup.ts` pins the device zone of unit tests; `playwright.bdd.config.ts` pins the browser time zone of E2E runs; the 8 approved "list" screenshots under `src/test/features/__screenshots__/` are re-approved because the Almaty row gains the badge.
- No new dependencies, no storage schema change, no network.

## Goals

- G1: 100% of rows whose canonical zone equals the device zone show the badge, and 0% of the other rows do, with no setup by the user.
- G2: The badge is announced by screen readers as part of the row's name in 100% of matching rows.

## Non-Goals

- NG1: Choosing or showing a reference zone or a home location, and differences from it ([ADR-0007](../../../docs/adr/0007-reference-zone-and-device-time.md) "Reference zone").
- NG2: Reordering rows — the matching row stays where the user put it.
- NG3: Detecting a change of the device zone while the app is open (re-reading on a clock tick or on `visibilitychange`); the zone is read once at startup. The app has no clock tick yet.
- NG4: The derived **Here** entry shown when no location matches (ADR-0007); without a match nothing is added to the screen.
- NG5: Matching by UTC offset or by equal rules: `Europe/Minsk` does not match a device in `Europe/Moscow` (ADR-0007 "Equality is by canonical zone ID").
- NG6: Marks in search results.

## Users & Scenarios

- U1: A user in Almaty with Almaty, Moscow and New York in the list sees "Your time zone" next to Almaty only.
- U2: A user travelling in Tokyo with Almaty and Moscow in the list sees no badge.
- U3: A user in Moscow who keeps both "Moscow" and "Saint Petersburg" (both `Europe/Moscow`) sees the badge on both rows.
- U4: A screen reader user hears "Almaty, Your time zone" as the name of the Almaty row.
- U5: A user with the Russian interface sees the badge text from the Russian locale.

## Requirements

### Functional

- FR1: A location row whose canonical IANA zone identifier equals the device time zone shows a "Your time zone" badge next to the city name.
- FR2: When no location matches the device zone, no row shows the badge; when several locations match, every one of them shows it.
- FR3: The device time zone is read once when the app starts, through the time abstraction of `@/lib/temporal`, never derived from a UTC offset; it is canonicalized (a legacy identifier such as `Asia/Calcutta` matches `Asia/Kolkata`), an identifier the browser does not know is treated as `UTC`, and it is never stored.
- FR4: The badge follows the list: a location added, removed, moved or changed in another tab, and a list reset keep the badge rule true for every row without reading the device zone again.
- FR5: The badge text comes from the locale files and exists in English ("Your time zone") and Russian ("Ваш часовой пояс").

### Non-Functional

#### Performance

- NFR-P1: Presenting 50 locations with the badge rule takes at most 50 ms; the badge appears in the same render as its row, with no loading state.

#### Accessibility

- NFR-A1: The accessible name of a matching row is the city followed by the badge text; a non-matching row's name is the city alone.
- NFR-A2: axe-core reports no violations for a list with a badge in the light and dark themes (including colour contrast of the badge).

#### Responsive

- NFR-R1: A list with a badged row causes no horizontal scrolling at 320 px and at 2560 px.
- NFR-R2: The approved "list" screenshots at 375 px and 1024 px in both themes show the badge on the matching row.

## UX Acceptance Criteria

- UX1: The badge sits on the city line, right after the city name, and visually reads as a tag (filled, rounded, smaller than the city), so the city stays the most prominent text.
- UX2: The badge carries the location-arrow icon that ADR-0007 names for the "here" mark, hidden from screen readers; only the text is announced.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | locations, one or more match the device zone | each matching row: city + badge; other rows unchanged (FR1, FR2) |
| any | locations, none matches the device zone | rows without any badge (FR2) |
| any | no locations | empty state unchanged, no badge |
| any | stored list unreadable | error with Reset unchanged; after Reset the empty state |
| any | device zone unknown to the browser | rows in `UTC` get the badge, others do not (FR3) |
| any | loading | none: the zone is read synchronously at startup and the badge renders with its row; the existing view skeleton is unchanged |
| offline | any of the above | same behaviour: the badge needs no network |

## Behavior

Feature files under `packages/client/src/test/features/locations/`, tagged `@mark-device-time-zone-in-location-list`:

- `locations_device_time_zone_unit.feature` — match, no match, several matches, legacy and unknown device zone, list changes, Russian text, performance (vitest-cucumber, jsdom, `fakeClock` with a time zone);
- `locations_device_time_zone_e2e.feature` — accessible name, axe-core in both themes, layout at 320 px and 2560 px, the list state behind the screenshots (playwright-bdd).

## Visual Reference

[docs/design](../../../docs/design/README.md) — the "Travelling" screen shows the "here" mark (location arrow) on the matching row. This change uses the text "Your time zone" the task asks for, with the same arrow icon; see Q1. Design tokens are the source of truth.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR5, NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1 and UX2 have at least one automated test tagged or commented with `mark-device-time-zone-in-location-list`.
- M2: The unit BDD scenarios give exactly these badge counts with `fakeClock`: device `Asia/Almaty`, list Almaty, Moscow → 1 (Almaty); device `Asia/Tokyo`, list Almaty, Moscow → 0; device `Europe/Moscow`, list Moscow, Saint Petersburg, Almaty → 2 (Moscow, Saint Petersburg); device `Asia/Calcutta`, list Kolkata, Moscow → 1 (Kolkata); device `Mars/Olympus_Mons`, list UTC, Moscow → 1 (UTC) — 5 of 5.
- M3: Mutation score of the new or changed model, presenter, controller and view code is at least 95% (minimum 90%).
- M4: axe-core reports 0 violations for a list with a badge in 2 themes (2 checks); 0 horizontal scrolling at 320 px and 2560 px (2 checks).
- M5: 8 of 8 "list" screenshot baselines (375 / 1024 px × light / dark × `chromium` / `mobile-chrome`) are re-approved with the badge on Almaty and pass without `--update-snapshots`.

## Open Questions

- Q1: ADR-0007 and the design screens call the mark "here"; the task asks for the text "Your time zone". This change follows the task and keeps the ADR's arrow icon; aligning `docs/design` and `docs/architecture/views.md` wording is left to a docs change.
- Q2: ADR-0007 says the controller re-reads the device zone on every clock tick and when the page becomes visible. The app has no clock tick yet and the task puts zone-change detection out of scope (NG3); the re-read is added by the change that introduces the clock tick, through the same `SET_DEVICE_TIME_ZONE` command.
