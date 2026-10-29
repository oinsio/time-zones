# Set home location and show differences

Builds on `support-legacy-ios-12-safari`, archived on 2026-10-29 (`openspec/changes/archive/2026/10/2026-10-29-support-legacy-ios-12-safari/`), so it does not block this change. From that change, this one uses:
- iOS Safari 12.5 as a supported engine (`openspec/specs/browser-compatibility/spec.md`);
- the legacy zone shim (`src/lib/legacy/zoneShim.ts`), which is installed before `temporal-polyfill`, so `getUtcOffsetMinutes` also works for a renamed zone on outdated zone data;
- the Pointer Events flag `IS_POINTER_EVENTS_SUPPORTED` (`src/lib/legacy/pointerEvents.ts`, exported from `src/lib/legacy/index.ts`);
- the 150 KB gzipped budget for initial JavaScript (`scripts/check-bundle-size.mjs`, package script `check:bundle-size`).

Its handoff patches H2 (ADR-0009) and H3 (the `browser-compatibility` glossary context) have not been applied on main yet. This change does not rely on them.

## Why

README MVP feature 3 says: "optionally mark one location as home; every other location shows its offset difference from it (`−2 h`, `+0:30`). Without home, differences are counted from the device time zone". Neither part exists yet. `getReferenceZone()` in `model/referenceMoment.ts` always returns the device time zone ("until a home exists"). As a result:

- a traveller cannot keep the reference day and the date bar on their own city (`docs/design/screens/phone-travel.png`);
- no user can see how far ahead or behind another location is without working it out from two UTC offsets.

ADR-0007 already decides the model: home is optional, only the user sets it, and the reference zone is the home location's zone, otherwise the device time zone. ADR-0003 shows differences with minutes when needed. `views.md` ("Row header") puts a home icon, the Here mark icon or the difference on each row, and its "View contract" requires "set and clear home". The approved screens `phone-light`, `phone-no-home` and `phone-travel` show the home icon and the differences.

Audience: every user. It is the next MVP feature, and two later changes build on it: `show-here-entry-for-device-time` and `add-wall-time-input-with-hint`.

## What Changes

- ADDED: the user marks one location of the list as the home location, or clears it, from a new location menu on each card.
- ADDED: the home location's row shows the home mark, a house icon in the leading mark slot.
- ADDED: every row except the row of the reference zone shows its offset difference from the reference zone (`−2 h`, `+0:30`, `0 h`).
- MODIFIED: the reference zone is the home location's zone when home is set, otherwise the device time zone. It drives the reference day of every day track, the date bar's date, the wall-clock time a date change keeps, and the gap note.
- MODIFIED: the location menu ("⋯") replaces the card's remove button. The menu holds "Make home" or "Clear home", and "Remove".
- MODIFIED: the stored location list also holds the home location. **BREAKING** for stored data: the document moves to schema version 2. A version 1 document is migrated on load. A version 2 document is unreadable for an older app version (ADR-0004 "newer" rule).
- MODIFIED: a stored home that points to a missing location is cleared silently on load, instead of making the list unreadable.
- MODIFIED: the leading mark slot gets its second kind, home. A row that is both home and in the device time zone shows only the home mark.
- MODIFIED: a row's accessible name adds the offset difference's accessible text after the city and the mark ("Moscow 2 hours behind").

### Glossary terms (`docs/glossary/`)

The implement stage writes only under `packages/`, so the glossary entries below ship in this change as the handoff patch H1 (`tasks.md`, "Human follow-up"). Code, specs and translations use these names from the first task on.

| Term | Change |
|---|---|
| Home location | implemented; *RU:* «домашнее место»; *Code:* `homeLocationId`, `SET_HOME_LOCATION` |
| Offset difference | implemented; *RU:* `−2 ч`, `+0:30`, `0 ч`; *Code:* `getOffsetDifferenceMinutes`, `formatOffsetDifference` |
| Reference zone | same meaning; *Code:* `getReferenceZone` now reads the home location |
| Home mark (new) | the house icon on the home location's row; *RU:* «Домашнее место»; *Code:* `LocationMarkKind.HOME`; *Not:* the Here mark |
| Location menu (new) | the "⋯" menu of a card with the home and remove actions; *RU:* «Действия: {city}»; *Code:* `LocationMenu`; *Never:* context menu, kebab |
| World clock state | holds the home location |
| Location list | schema version 2, stores the home location too |
| Unreadable stored list | *Not:* a stored home that points to a missing location (cleared silently) |
| Shared block | adds the location menu |

## Capabilities

### New Capabilities

- `home-location`: marking and clearing the home location, the home mark, the reference zone it defines, keeping and sharing home, the location menu's home actions.

### Modified Capabilities

- `locations`: ADDED offset difference on rows and the location menu. MODIFIED: removal (clears home), the Cards list (the location menu replaces the remove button), storage (schema 2), the unreadable list (dangling home), tab sync (home), the Here mark (yields to the home mark), the row name (in "Here mark is accessible and fits every screen" and "Local time and date are fast and accessible"), the leading mark kinds, and the card layout.
- `time-selection`: MODIFIED "Day track spans the reference day". The reference zone may be the home location's zone.
- `date-selection`: MODIFIED "Reference moment". The reference zone may be the home location's zone.

## Impact

- `packages/client/src/`: `model/` (`WorldClockState.homeLocationId`, `SET_HOME_LOCATION`, `getReferenceZone`, `LocationMarkKind.HOME`, `getOffsetDifferenceMinutes`, `parseStoredLocations`), `adapters/` (`locationsDocument.ts` schema 2 and migration, both repositories), `ports/` (`LocationRepository` loads and saves home), `constants/` (`LOCATIONS_SCHEMA_VERSION = 2`), `presenter/` (`formatOffsetDifference`, a shared signed-offset core with `formatUtcOffset`, `presentLocationRows`, `LOCATION_MARK_TEXT_KEYS`), `controller/` (`setHomeLocation`), `views/shared/` (`LocationMenu`, `LocationRow`, `LocationList` focus, `LocationMarkIcon`), `locales/en.json`, `locales/ru.json`.
- No new dependency. The location menu must open by tap on iOS Safari 12.5, which has no Pointer Events, and must keep the initial JavaScript within its budget (FR14, NFR-P2; the choice is in design.md).
- Docs, as handoff patches (the implement stage writes only under `packages/`): H1 `docs/glossary/`; H2 `docs/architecture/views.md`, `docs/architecture/domain-model.md` and a load normalization note in `docs/adr/0004-local-persistence-strategy.md`. That note refines ADR-0004 and does not change its decision.
- Tests: new unit BDD and E2E features under `src/test/features/home_location/` and `src/test/features/locations/`. Existing features that use the former remove button or the old row names are updated. Every screenshot baseline with rows is re-approved, and the "home" and "travelling" states are added.

## Goals

- G1: A user marks or clears home in at most 2 actions from any card, by mouse, touch or keyboard.
- G2: After a home change, 100% of cards show the new reference day, date bar date and offset differences in the same render.
- G3: Offset differences are correct across DST changes and for :30 and :45 zones at 100% of the checked instants.

## Non-Goals

- NG1: The Here entry for a device time zone that no location matches (ADR-0007). It is the next change, `show-here-entry-for-device-time`.
- NG2: Assigning home automatically. The app never sets home (ADR-0007).
- NG3: The day shift hint (`−1 / 0 / +1`) next to a row's date.
- NG4: Pinning home to the top of the list. Home stays where the user put it and is reordered like any location.
- NG5: Typing a wall-clock time, a 12-hour format, settings and the Grid view.
- NG6: Changing the approved design screens. Their "Домашняя локация" and `GMT` texts are corrected in the app, not in the screens.

## Users & Scenarios

- U1: A user in Almaty makes Almaty home. Moscow shows `−2 h`, Kolkata `+0:30`, New York `−9 h`, and Almaty shows the home mark.
- U2: The same user flies to Moscow (`phone-travel`). The day tracks and the date bar stay on Almaty. Moscow shows the Here mark, `−2 h` and the caption "here".
- U3: The user clears home. Differences and day tracks follow the device time zone again.
- U4: The user removes the home location. Home is cleared and the reference zone is the device time zone.
- U5: Home is set in one tab, and a second open tab shows it without a reload.

## Requirements

### Functional

- FR1: Any location of the list whose zone is known can be made the home location from its location menu. At most one location is home. Making another location home moves home to it. Making the current home home again changes nothing. A request for a location that is no longer in the list fails as location not found and changes nothing.
- FR2: Home can be cleared from the home location's menu. The reference zone is then the device time zone.
- FR3: Removing the home location clears home. Resetting an unreadable list leaves no home. Adding a location never sets home, also for the first location. Reordering keeps home and does not move the home location.
- FR4: The reference zone is the home location's canonical time zone ID when home is set, otherwise the device time zone. A change of the reference zone keeps the reference moment: a live moment stays live, a pinned moment keeps its instant. The reference day, the date bar's date and the gap note follow the new zone in the same render.
- FR5: Every row whose zone is known shows its offset difference: its UTC offset minus the reference zone's UTC offset at the effective instant. The home location's row shows none. Without home, a row with the Here mark shows none. Another row whose offset equals the reference zone's shows `0 h`. The difference is recomputed whenever the UTC offset is: on open, on list changes, on a language change, on a reference moment change, at every minute tick and on a device time zone change.
- FR6: The difference text has a sign and the hours. Whole hours carry the unit (`−2 h` / `−2 ч`, `+3 h` / `+3 ч`). Hours with minutes have no unit (`+0:30`, `−5:30`, `+5:45`). Zero is `0 h` / `0 ч` without a sign. The minus is the typographic minus `−`.
- FR7: The home mark takes the leading mark slot: a house icon with the accessible label "Home location" / «Домашнее место» and no caption. A row shows at most one leading mark. A row that is home and in the device time zone shows the home mark only. A row in the device time zone that is not home shows the Here mark, its offset difference and the caption "here".
- FR8: Home is saved on the device with the list and restored on the next open, also offline. A list stored by the previous version opens with the same locations, in the same order, without home. Nothing is written until the user changes the list or home.
- FR9: A stored home that points to a location not in the stored list is cleared on load without an error and without a write. The corrected document is written with the user's next change.
- FR10: A home change in one open tab appears in every other open tab without a reload. The last write wins.
- FR11: The location menu replaces the card's remove button. It is named "Actions for {city}" / «Действия: {city}» and holds "Make home" / «Сделать домашним» (or "Clear home" / «Убрать отметку дома» on the home row) and "Remove" / «Удалить». A row with an unknown zone has no home item. Setting and clearing home are announced politely ("Almaty is now home" / «Алматы — теперь домашнее место», "Home cleared" / «Отметка дома снята»).
- FR12: Every new string exists in English and Russian with identical key sets.
- FR13: The `@view-contract` scenario "Set and clear home" passes in the Cards view.
- FR14: On every supported engine, including iOS Safari 12.5 without Pointer Events, a tap on the location menu button opens the menu, a tap on an item activates it, and a tap outside or Esc closes it. Removing a location MUST stay possible on iOS Safari 12.5.

### Non-Functional

#### Performance

- NFR-P1: Presenting 50 rows with offset differences builds no more formatters than today: at most 3 date and time formatters per distinct time zone and 1 region name formatter on the first presentation, none on a repeated one. The reference zone's UTC offset is computed once per presentation, not once per row (work bounds, ADR-0008). The timing is reported by the existing `rowPresenting.bench.ts`, extended with home.
- NFR-P2: The location menu keeps the initial JavaScript of the build within 150 KB gzipped (NFR-P1 of `support-legacy-ios-12-safari`, checked by `scripts/check-bundle-size.mjs` through `check:bundle-size` after `build`). The build stays free of syntax that Safari 12 cannot parse (`check:legacy-build`).

#### Accessibility

- NFR-A1: axe-core reports no violations with and without home, in the travelling state and with the location menu open, in the light and dark themes.
- NFR-A2: The location menu is one Tab stop per card and follows the WAI-ARIA menu button pattern: Enter, Space and Arrow Down open it on the first item, the arrows move between items, Enter activates, Esc closes it and returns focus to the button. After a home change the focus is on the same card's menu button. After a removal it moves as removal does today, to the next card's menu button.
- NFR-A3: A row's accessible name is its city, then the mark's label if any, then the difference's accessible text if any ("Moscow 2 hours behind", "Moscow You are here 2 hours behind"). The visible difference is hidden from assistive technology, so it is not read twice. Accessible texts: "{duration} ahead" / «на {duration} позже», "{duration} behind" / «на {duration} раньше», "same time" / «то же время», with plural forms of hours and minutes.

#### Responsive

- NFR-R1: There is no horizontal scrolling at 320 px and 2560 px with home set, in the travelling state and with the menu open. The city, the difference and the "here" caption wrap instead of being cut.
- NFR-R2: The approved screenshots at 375 px and 1024 px, in both themes and both projects (`chromium`, `mobile-chrome`), add the "home" and "travelling" states. Every existing baseline with rows is re-approved, because rows gain differences and the menu button.

## UX Acceptance Criteria

- UX1: The difference stands right after the city, before the "here" caption, as secondary text (the muted foreground colour), semi-bold and smaller than the city, as on `phone-light` and `phone-travel`.
- UX2: The house icon is outlined in the accent colour and has the size of the Here mark icon.
- UX3: The menu button shows "⋯", has a hit area of at least 44 × 44 px, and takes the remove button's place at the end of the card. The menu opens over the content, does not start a reorder and does not move a day track's handle.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | no home, a row in the device time zone | that row: Here mark, no difference; others: difference from the device time zone |
| any | no home, no row in the device time zone | every row shows a difference from the device time zone (until NG1) |
| any | home, device in the same zone | home row: home mark only; others: difference from home |
| any | home, device elsewhere (travelling) | home row: home mark; device row: Here mark, difference, "here" |
| any | loading | no loading state: the list and its home are read synchronously before the first render (`LocationRepository.load()`), so marks and differences appear in the first render |
| any | empty list | empty state unchanged |
| any | row with an unknown zone | no difference; no "Make home" item |
| any | storage unavailable | home works for the session; the storage warning is shown |
| any | stored home points to a missing location | home cleared, list shown (FR9) |
| any | stored list otherwise unreadable | error with Reset, unchanged |
| offline | any of the above | same behaviour |

## Behavior

Feature files tagged `@set-home-location-and-show-differences`:

- `src/test/features/home_location/home_location_unit.feature`: set, move, clear, remove, reset, reference zone, home mark and priority, storage, migration, dangling home, tabs, the menu items (vitest-cucumber).
- `src/test/features/locations/locations_offset_difference_unit.feature`: values, text, accessible text, recomputation, the work bound (vitest-cucumber).
- `src/test/features/home_location/home_location_menu_unit.feature`: the location menu by click with `PointerEvent` removed from the environment (FR14) (vitest-cucumber).
- `src/test/features/home_location/home_location_e2e.feature`: the location menu by pointer and keyboard, focus, accessible names, announcements, the Russian interface, axe-core, layout (playwright-bdd).
- `src/test/features/home_location/home_location_legacy_e2e.feature`: the location menu by tap in Chromium with Pointer Events suppressed (FR14) (playwright-bdd).
- `src/test/features/home_location/home_location_view_contract_e2e.feature`: the `@view-contract` scenario "Set and clear home".
- Existing features that gain the modified scenarios: `locations_management.feature`, `locations_persistence.feature`, `locations_storage_ui_unit.feature`, `locations_here_mark_unit.feature`, `locations_device_time_zone_e2e.feature`, `locations_local_time_e2e.feature`, `locations_ui_e2e.feature`, `locations_view_contract_e2e.feature`, `time_selection_day_track.feature`, `date_selection_reference_moment.feature`, and the screenshot outline.

## Visual Reference

`docs/design/screens/phone-light`, `phone-no-home`, `phone-travel` and `tablet-light` (PNG and HTML). The screens have no menu: UX3 and FR11 define it. Documents win over screens (`docs/design/README.md`), so the app shows `UTC` instead of `GMT` and «Домашнее место» instead of «Домашняя локация». Design tokens are the source of truth for colours.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR14, NFR-P1, NFR-P2, NFR-A1–NFR-A3, NFR-R1, NFR-R2 and UX1–UX3 have at least one automated test that names `set-home-location-and-show-differences` with the id.
- M2: Home Almaty, device `Asia/Almaty`, instant `2026-03-08T07:30:00Z`, Russian: Moscow `−2 ч`, Kolkata `+0:30`, New York `−9 ч`, Almaty the home mark and no difference (4 of 4). At `2026-03-08T06:30:00Z` New York shows `−10 ч`.
- M3: Home Almaty, device `Europe/Moscow`: reference day `2026-03-07T19:00:00Z`–`2026-03-08T19:00:00Z`, Moscow shows the Here mark and `−2 h`. After clearing home: `2026-03-07T21:00:00Z`–`2026-03-08T21:00:00Z`, Almaty shows `+2 h`.
- M4: A schema 1 document with 3 locations opens with the same 3 locations in the same order and no home, with 0 writes until the user acts. A schema 2 document whose home is missing from its list opens with no home and 0 writes.
- M5: With `PointerEvent` removed from the test environment, a click on the menu button opens the menu and "Remove" removes the location (2 of 2). The initial JavaScript stays ≤ 150 KB gzipped.
- M6: Mutation score of the new and changed code ≥ 95% (minimum 90%). axe-core reports 0 violations in 4 states × 2 themes.

## Open Questions

All decided:

- Q1: How is home set? Decided: through the location menu "⋯", which replaces the remove button (FR11, UX3).
- Q2: Which difference format? Decided: the design screens' format (FR6). `views.md` is aligned in this change; README is already aligned.
- Q2a: A row with the same offset as the reference zone but another ID? Decided: it shows `0 h` (FR5).
- Q3: A stored home that points to a missing location? Decided: cleared silently on load (FR9), recorded in ADR-0004 as a load normalization.
- Q4: The Here entry? Decided: a separate change right after this one (NG1).
- Q5: Is home pinned to the top? Decided: no (NG4). This answers Q2 of the archived `reorder-locations-by-drag-and-drop`.
