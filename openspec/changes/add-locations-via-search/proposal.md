# Add locations via search

## Why

The main page exists, but the Cards view can only say "No locations added yet": the user has no way to choose which places they care about. Every later feature (times per location, home, reference moment, grid) works on a list of locations, so the list and the way to fill it come first.

Users think in cities ("Almaty"), countries ("Kazakhstan") and abbreviations they see in invitations ("EST", "IST"), not in IANA identifiers. This change lets them find a place in any of these ways, add it, remove it, and keep the list across visits — while the app stores only IANA identifiers ([ADR-0003](../../../docs/adr/0003-reference-instant-time-model.md)), never a raw UTC offset, which breaks on the next DST transition.

Audience: every user of the app; without this change the app shows no useful content.

## What Changes

- ADDED: location list in the domain model — add and remove, stored by canonical IANA identifier with a city label and a country code.
- ADDED: search overlay — search by city, country or time zone abbreviation over data bundled with the app; suggestions before typing, no-results, loading and error states.
- ADDED: local persistence of the list with a versioned document, recovery from corrupted data, work without storage, and sync between open tabs ([ADR-0004](../../../docs/adr/0004-local-persistence-strategy.md)).
- ADDED: Cards view shows the list: one row per location with city, country and a remove action; an "Add location" action opens the search.
- MODIFIED: `main-page` empty state — besides the explanation it now offers the "Add location" action (resolves Q1 of `add-main-page-scaffold`).

## Capabilities

### New Capabilities

- `locations`: the user's list of locations — adding, removing, identity by canonical IANA identifier, persistence, recovery and cross-tab sync.
- `location-search`: finding a location by city, country or abbreviation — matching, ranking, suggestions and the search states.

### Modified Capabilities

- `main-page`: requirement "Empty state" — the empty state now offers the "Add location" action.

## Impact

- `packages/client/src/`: `model/` (first domain state), `ports/`, `adapters/` (location repository, city search), `presenter/`, `controller/`, `views/cards/`, `views/shared/`, `components/ui/`, `constants/`, `locales/`.
- New dependencies: a dialog primitive for the search overlay; CLDR data packages as dev dependencies for a build-time extraction script (see design.md).
- Build: one more lazily loaded chunk (search data); the bundle-size check is extended.

## Goals

- G1: A user can go from an empty list to a list of 3 chosen locations using only search, in under 30 seconds and with the keyboard alone (NFR-A2).
- G2: The list survives reloads, app updates and corrupted storage without a white screen.
- G3: Every stored location is identified by a canonical IANA identifier; no stored document contains a raw UTC offset.

## Non-Goals

- NG1: Showing the time, date, UTC offset, difference or day track of a location — the rows show city and country only; time display comes with the reference-moment change.
- NG2: Home location, the derived Here entry and the "here" mark ([ADR-0007](../../../docs/adr/0007-reference-zone-and-device-time.md)).
- NG3: Reordering locations, renaming labels, or adding a custom label.
- NG4: Richer city data (GeoNames, regions, cities that are not IANA exemplar cities, e.g. "Brooklyn") — a later source per [ADR-0006](../../../docs/adr/0006-city-data-sources.md).
- NG5: Search by raw offset ("UTC+5", "GMT-3") or by IANA identifier text; offsets are never an input for identity.
- NG6: Storybook stories (see Q2); visual regression is covered by E2E screenshots instead.
- NG7: The Grid view; only the Cards view renders the list.

## Users & Scenarios

- U1: A user in Almaty works with a team in New York: they type "New", pick New York, and see it in the list.
- U2: A user receives an invitation "10:00 IST", types "IST" and sees India, Israel and Ireland, each marked with IST, and picks the right one.
- U3: A user types "Kazakhstan" and sees every Kazakh time zone.
- U4: A user types in Russian ("Москва") while the interface is in English and still finds Moscow.
- U5: A user removes a city they no longer need.
- U6: A user reopens the app a week later, offline, and finds the same list in the same order.
- U7: A user with the app open in two tabs adds a city in one; the other tab shows it too.
- U8: A user whose stored data got corrupted sees an explanation and can reset instead of a blank page.

## Requirements

### Functional

- FR1: Search accepts free text and matches it case-insensitively, ignoring diacritics (`sao` finds São Paulo) and treating `ё` as `е`. City and country names are matched in English and Russian whatever the interface language.
- FR2: City match — a location matches when its city name, or any word of it, starts with the query (`york` finds New York).
- FR3: Country match — every time zone of a country matches when the country name in English or Russian, or any word of it, starts with the query (`Kazakhstan` finds Almaty and the other Kazakh zones).
- FR4: Abbreviation match — the whole query equals an abbreviation from the app's own abbreviation table (case-insensitive); an ambiguous abbreviation returns every zone it maps to (`IST` → Kolkata, Jerusalem, Dublin). Abbreviations produced by the browser are never used for matching.
- FR5: Results are ordered: abbreviation matches (in the table's order), then city names starting with the query, then city names with a later word starting with the query, then country matches; ties go to popular locations first, then alphabetically by city name in the interface language. Each time zone appears at most once; at most 50 results are shown. Each result shows the city and the country in the interface language, and the abbreviation when it matched by abbreviation.
- FR6: Before the user types (empty or whitespace-only query), the search shows a fixed list of popular locations as suggestions.
- FR7: When nothing matches, the search shows a message that nothing was found and a hint that a city, country or abbreviation can be searched.
- FR8: Choosing a result adds a location — canonical IANA identifier, city label in the interface language, country code — to the end of the list; the search closes and the new location is shown. A result is marked as added and cannot be added again when the list already has a location with its time zone and its city name in any supported language.
- FR9: Time zone identifiers are canonicalized on input and on load (`Asia/Calcutta` → `Asia/Kolkata`, `Europe/Kiev` → `Europe/Kyiv`) and duplicates are detected on canonical identifiers. An identifier that is not a valid IANA zone, including a raw offset such as `+05:00`, is rejected and never stored.
- FR10: Each location in the list has a remove action; removing takes effect immediately and keeps the order of the remaining locations.
- FR11: The list is saved on the device and restored in the same order when the app is opened again. Until the user first adds a location, nothing is written for the list.
- FR12: When the stored list cannot be read (corrupted, invalid, or written by a newer app version), the Cards view shows an error message with a reset action; reset clears the stored list and shows the empty state. The app never shows a blank page because of stored data.
- FR13: When storage is unavailable, adding and removing still work for the session and the existing storage warning tells the user changes will not be saved.
- FR14: A change to the list in one open tab or window appears in every other open tab of the app without a reload; the last write wins.
- FR15: While the search data is loading, the search shows a loading placeholder; if loading fails, it shows an error message with a retry action.
- FR16: Search, adding and removing work offline after the first visit.
- FR17: The empty state shows the explanation and an "Add location" action that opens the search; with at least one location the Cards view shows the list and the same action.
- FR18: Every new string exists in English and Russian, with plural forms where a count is shown.

### Non-Functional

#### Performance

- NFR-P1: Computing the results for one query over the full bundled data takes at most 50 ms.
- NFR-P2: Initial JavaScript stays at most 150 KB gzipped; the search data is loaded in a separate chunk of at most 30 KB gzipped, only when the search is opened.

#### Accessibility

- NFR-A1: axe-core reports no violations in each state of the UI States Matrix below, in light and dark themes.
- NFR-A2: The whole flow works with the keyboard: open the search, type, move through results with arrow keys, add with Enter, close with Esc; closing returns focus to the action that opened the search.
- NFR-A3: Each remove action has an accessible name that includes the city ("Remove Moscow"); after a removal focus moves to the next location's remove action, or the previous one, or the "Add location" action when the list becomes empty. Adding, removing and the number of results are announced politely.

#### Responsive

- NFR-R1: No horizontal scrolling from 320 px to 2560 px in any state; the search fills the screen below 640 px and is a centered dialog from 640 px.
- NFR-R2: The list and the search in their main states match approved screenshots at 375 px and 1024 px in both themes.

## UX Acceptance Criteria

- UX1: The search screen is never blank: it always shows suggestions, results, the no-results message, the loading placeholder or the error.
- UX2: Results update as the user types, without a submit action.
- UX3: Abbreviation results show the matched abbreviation next to the city, so an ambiguous `IST` explains itself.
- UX4: A new location appears at the end of the list; the order the user built is kept across reloads.
- UX5: The list, the search and all their states use design tokens only and follow the system theme.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | at least one location | list rows (city, country, remove) and "Add location" |
| any | no locations | empty-state explanation and "Add location" |
| any | stored list unreadable | error message with Reset |
| any | storage unavailable | list works for the session; storage warning shown |
| any | search data loading | loading placeholder in the search |
| any | search data failed to load | error message with Retry in the search |
| any | empty query | popular suggestions |
| any | query without matches | no-results message with hint |
| offline | any of the above | same behaviour; search data comes from the offline cache |

## Behavior

Feature files under `packages/client/src/test/features/`, tagged `@add-locations-via-search`:

- `location_search/` — matching by name, country and abbreviation, ranking, suggestions, performance (vitest-cucumber);
- `locations/` — adding, removing, persistence (vitest-cucumber), the Cards view list in jsdom (`locations_ui_unit.feature`) and in a real browser (`locations_ui_e2e.feature`: axe-core, keyboard, focus, announcements, layout, screenshots, cross-tab, offline).

## Visual Reference

No screen exists for search, the empty state or the error state ([docs/design](../../../docs/design/README.md#not-covered-yet)); they follow [views.md](../../../docs/architecture/views.md) (Overlays, UI states). Design tokens are the source of truth.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR18, NFR-P1–NFR-R2 and UX1–UX5 have at least one automated test tagged `@add-locations-via-search`.
- M2: Mutation score of the new model, search matching and ranking, and repository code is at least 95% (minimum 90%).
- M3: axe-core reports 0 violations across 8 states × 2 themes = 16 checks.
- M4: On the bundled data, `IST` returns Kolkata, Jerusalem and Dublin as its first 3 results in that order; `EST` returns New York first; `Moscow` and `Москва` return Moscow first; every result for `Kazakhstan` has country KZ and Almaty is among them.
- M5: 0 raw offsets stored: a stored document with a legacy identifier (`Asia/Calcutta`) loads as `Asia/Kolkata`, and adding `+05:00` is rejected — both covered by tests.
- M6: Each of 10 sample queries completes in at most 50 ms in the performance scenario.
- M7: Initial JavaScript at most 150 KB gzipped; the search chunk exists separately and is at most 30 KB gzipped.

## Open Questions

- Q1: A city label keeps the language that was active when the location was added; relabelling on a language switch is left to a later change.
- Q2: Storybook is still not set up (Q2 of `add-main-page-scaffold`); UI states are covered by jsdom scenarios and E2E screenshots. Introducing Storybook is a separate tooling change.
- Q3: The abbreviation table and the popular-locations list are a first version (see design.md); extending them needs no spec change.
