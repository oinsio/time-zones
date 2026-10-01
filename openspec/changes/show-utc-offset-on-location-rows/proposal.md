# Show the UTC offset on each location row

## Why

Each location row in the Cards view shows only the city and the country (`openspec/specs/locations/spec.md`, requirement "List in the Cards view"). To compare zones the user has to know or look up every offset. Showing the current UTC offset next to the city lets the user compare zones at a glance — the first piece of time information on the rows, before the reference-moment change brings times, differences and day tracks.

Audience: every user with at least one location. The offset is derived from the location's IANA identifier for the current instant ([ADR-0003](../../../docs/adr/0003-reference-instant-time-model.md): "Everything else — local time, date, UTC offset, abbreviation, day period — is derived per location by selectors"), so nothing new is stored and DST is respected.

## What Changes

- ADDED: every location row in the Cards view shows the location's current UTC offset (`UTC+3`, `UTC−5:30`, `UTC+5:45`, `UTC` for zero) next to the city and the country.
- ADDED: the `UTC` prefix is a localized string in English and Russian.
- No stored data changes: the list document keeps only IANA identifiers, labels and country codes ([ADR-0004](../../../docs/adr/0004-local-persistence-strategy.md) schema version stays 1).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `locations`: adds the requirement "UTC offset on location rows" — rows of the list show the current UTC offset of their zone.

## Impact

- `packages/client/src/`: `model/` (offset of a zone at an instant), `presenter/` (offset text), `controller/` (the clock instant used when the rows are presented), `views/shared/LocationRow.tsx` (renders the offset), `constants/` (offset formatting constants), `locales/en.json` and `locales/ru.json` (prefix key).
- Tests: new unit BDD and E2E feature files under `src/test/features/locations/`; the 8 approved "list" screenshots under `src/test/features/__screenshots__/` are re-approved because the rows gain the offset.
- No new dependencies, no storage schema change, no network.

## Goals

- G1: 100% of listed locations whose zone the browser knows show their current UTC offset in the Cards view, with no extra action.
- G2: The offset is correct for the instant the list is shown in all 6 reference cases of M2 (whole-hour, :30, :45, both sides of a DST switch, zero), with 0 offsets stored.

## Non-Goals

- NG1: Differences from a home location or the reference zone (`-2`, `+0:30`) — they come with home and the reference zone ([ADR-0007](../../../docs/adr/0007-reference-zone-and-device-time.md)).
- NG2: A live clock: the offset is not refreshed while the page stays open; it is computed when the list is presented.
- NG3: Time of day, date, day track or zone abbreviation (`MSK`, `EDT`) on the rows.
- NG4: Offsets in search results, the reference moment (LIVE / PINNED) and the derived Here entry.
- NG5: Searching or identifying a location by offset; offsets are display-only and never stored.

## Users & Scenarios

- U1: A user in Moscow with New York and Kolkata in the list sees `UTC+3`, `UTC−4` and `UTC+5:30` in July and can tell the gaps at a glance.
- U2: A user with New York in the list opens the app in January and sees `UTC−5`; in July they see `UTC−4`.
- U3: A user with a UTC location sees `UTC`, not `UTC+0`.
- U4: A user with the Russian interface sees the offset with the prefix from the Russian locale.

## Requirements

### Functional

- FR1: Every location row in the Cards view shows the location's UTC offset next to the city and the country.
- FR2: The offset is the zone's offset from UTC at the current instant, derived from the location's canonical IANA identifier with Temporal; DST is respected (America/New_York is `UTC−4` on 2026-07-15 and `UTC−5` on 2026-01-15). No offset is stored.
- FR3: The offset text is the prefix followed by a sign and the hours, plus `:` and two-digit minutes only when the minutes are not zero: `UTC+3`, `UTC+5:30`, `UTC+5:45`, `UTC−5:30`. A negative offset uses the minus sign U+2212 (`−`), never the hyphen-minus. A zero offset is the prefix alone: `UTC`.
- FR4: The offset is computed when the list is presented — when the app opens and whenever the rows are presented again (a location is added or removed, the list changes in another tab, the interface language changes). It is not refreshed on a timer while the page stays open.
- FR5: The `UTC` prefix comes from the locale files and exists in English and Russian.
- FR6: When the offset of a location cannot be computed (the browser does not know its zone), the row still shows the city, the country and the remove action, without an offset; the app does not crash.

### Non-Functional

#### Performance

- NFR-P1: Presenting 50 locations with their offsets takes at most 50 ms; the offset appears in the same render as the row, with no loading state.

#### Accessibility

- NFR-A1: axe-core reports no violations for the list with offsets in the light and dark themes; the offset is text, read by screen readers together with its row.

#### Responsive

- NFR-R1: A list of locations whose offsets include `UTC+5:30`, `UTC+5:45` and a negative offset causes no horizontal scrolling at 320 px and at 2560 px.
- NFR-R2: The approved "list" screenshots at 375 px and 1024 px in both themes show the offsets.

## UX Acceptance Criteria

- UX1: The offset sits on the row's secondary line after the country, in the same muted style, so the city stays the most prominent text.
- UX2: Offsets are written exactly as in FR3 in both languages, so the same zone reads the same everywhere.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | at least one location | each row: city; country and UTC offset; remove action |
| any | a location whose offset cannot be computed | that row without the offset; other rows unchanged (FR6) |
| any | no locations | empty state unchanged (no offsets) |
| any | stored list unreadable | error with Reset unchanged (no offsets) |
| any | loading | none: the list and the offsets are computed synchronously when the view renders; the existing view skeleton is unchanged |
| offline | any of the above | same behaviour: the offset needs no network |

## Behavior

Feature files under `packages/client/src/test/features/locations/`, tagged `@show-utc-offset-on-location-rows`:

- `locations_utc_offset_unit.feature` — offsets per zone, DST, zero offset, Russian prefix, missing offset, performance (vitest-cucumber, jsdom, `fakeClock`);
- `locations_utc_offset_e2e.feature` — axe-core in both themes and layout at 320 px and 2560 px (playwright-bdd).

## Visual Reference

[docs/design](../../../docs/design/README.md) screens show the zone on the row's secondary line ("Kazakhstan | GMT+5" in [views.md](../../../docs/architecture/views.md)). This change uses the `UTC±H[:MM]` form the task asks for; see Q1. Design tokens are the source of truth.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR6, NFR-P1, NFR-A1, NFR-R1, NFR-R2, UX1 and UX2 have at least one automated test tagged or commented with `show-utc-offset-on-location-rows`.
- M2: The unit BDD scenarios produce exactly these labels with `fakeClock`: Europe/Moscow `UTC+3`, Asia/Kolkata `UTC+5:30`, Asia/Kathmandu `UTC+5:45`, America/New_York `UTC−4` at 2026-07-15T12:00:00Z and `UTC−5` at 2026-01-15T12:00:00Z, UTC `UTC` — 6 of 6.
- M3: Mutation score of the new or changed model, presenter, controller and view code is at least 95% (minimum 90%).
- M4: axe-core reports 0 violations for the list with offsets in 2 themes (2 checks).
- M5: 0 horizontal scrolling at 320 px and 2560 px (2 checks); 0 hyphen-minus characters in any negative offset label (asserted by the presenter tests).

## Open Questions

- Q1: [views.md](../../../docs/architecture/views.md) describes the row's meta line as "country and zone abbreviation or `GMT+N`". This change follows the task's `UTC±H[:MM]` format; updating views.md and whether abbreviations join the offset later is left to a docs change.
- Q2: The Russian locale uses the same `UTC` prefix as English (the international designation; Russian sources commonly write `UTC+3`). Changing it later needs only the locale file.
