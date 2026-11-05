# Show zone abbreviations and the zone label setting

No other active change touches the capabilities this change modifies: the only one, `add-pr-preview-deploy`, changes `app-delivery`, not `locations`, `location-search`, `settings` or `time-selection`.

## Why

A location card names its zone only by the UTC offset (`UTC+5:30`). The offset is exact, but people recognise a zone by its abbreviation: invitations and calendars say `IST`, `EST`, `MSK`. The card cannot show one today. The search finds zones by abbreviation, but from the app's own hand-written table (`adapters/city-search/timeZoneAbbreviations.ts`). That table mixes real abbreviations with invented ones (`ET`, `PT`, `ALMT`, `ICT`, `SGT`, `GST`, `BRT`, `ART`) that the IANA time zone database (tzdb) does not use, maps two real abbreviations to zones that tzdb names otherwise (`GMT` to the `UTC` zone, whose tzdb abbreviation is `UTC`; `BST` to Dhaka, whose tzdb designation is the numeric `+06`), and it has no notion of which abbreviation is in force at a moment (`EST` in January, `EDT` in July).

Users also differ in what they want on the card. Some want the offset, some the abbreviation, some only the country. So the card's second line becomes a choice in the settings. Every settings group today is a column of full-width radio rows (`SettingsOptionGroup`), so each new setting makes the page longer. The new setting is therefore built as a compact one-row group that later settings can reuse.

Audience: every user who reads cards (all of them), users who add places from an invitation that names an abbreviation, and screen reader and keyboard users of the settings page.

## What Changes

- ADDED `zone-abbreviations` (new capability): the zone abbreviation of a zone at a moment, taken from tzdb letter abbreviations only, from one table built into the app and available offline. It is written in Latin letters in every interface language, except `MSK`, which the Russian interface writes «МСК».
- MODIFIED `locations`: the line under the city (the **zone line**) is made of separate elements: the country name, the zone abbreviation, the UTC offset. The zone label preference decides which of the last two are shown. A missing element leaves no gap. The device time location's meta line follows the same rule ("Device time", abbreviation, offset). The line wraps only between elements and never truncates.
- MODIFIED `time-selection`: the wall-time hint of a DST overlap names the abbreviation before the offset when the zone label shows the abbreviation: "(EDT, UTC−4)". It always names the offset.
- MODIFIED `location-search`: search by abbreviation uses the tzdb table instead of the app's own table. A query equal to an abbreviation finds every zone that uses it in either half of the year. A result matched by abbreviation shows the zone's abbreviation pair (`EST / EDT`), with the matched one emphasised. Abbreviation results are ordered like other results: popular locations first, then by city name. **BREAKING** for users who typed `ET`, `PT`, `ALMT`, `ICT`, `SGT`, `GST`, `BRT` or `ART`: those no longer match by abbreviation. Also **BREAKING**: `GMT` no longer finds the `UTC` zone (it still finds London, Dublin and the other zones that use `GMT`), and `BST` no longer finds Dhaka (it still finds London).
- MODIFIED `settings`: a new **Zone label** group («Подпись пояса») with two independent toggles, "UTC offset" («Смещение UTC») and "Abbreviation" («Сокращение»), and a live example of the zone line under them. Both are on by default, also for existing users (the stored preferences document is migrated from version 2 to 3). The group is a reusable **toggle group** component.
- REMOVED: the app's own abbreviation table `TIME_ZONE_ABBREVIATIONS` and `findAbbreviationsOfZone`.
- Glossary (new or changed terms):
  - new **Zone abbreviation** and **Abbreviation pair** (`docs/glossary/time.md`);
  - new **Zone line** (`docs/glossary/locations.md`); **Location row** gets the zone line and the zone abbreviation;
  - new **Zone label** and **Toggle group** (`docs/glossary/settings.md`); **Settings page** and **Preferences** list the zone label;
  - **Abbreviation source** (`docs/glossary/search.md`) changes owner: it reads the zone abbreviation table;
  - **Wall-time hint** (`docs/glossary/date-selection.md`) changes meaning: the overlap hint names the zone abbreviation before the UTC offset when the zone label shows it («(EDT, UTC−4)»), and its owner `presentWallTimeHint` reads the zone abbreviation and the zone label.
- New build-time dependency: a tzdb data package read only by the Vite zone-data plugin, never shipped as code (design D1).

## Capabilities

### New Capabilities

- `zone-abbreviations`: the zone abbreviation at a moment, its source and its spelling per interface language.

### Modified Capabilities

- `locations`: MODIFIED "UTC offset on location rows", "Device time location", "Exemplar city of the device time location", "Device time location strings are localized"; ADDED "Zone line on location rows", "Zone line layout", "Zone line is fast".
- `time-selection`: MODIFIED "Wall-time hint texts".
- `location-search`: MODIFIED "Search by abbreviation", "Result order and content", "Accessible and responsive search".
- `settings`: MODIFIED "Open the settings page", "Preferences are kept on the device", "Unreadable stored preferences", "Settings strings are localized", "Settings page layout"; ADDED "Zone label", "Toggle group", "Accessible zone label", "Zone label layout".

## Goals

- G1: Every card of a zone that has a tzdb letter abbreviation shows the abbreviation in force at the reference moment, next to its offset.
- G2: Every tzdb letter abbreviation finds every zone that uses it, and no other abbreviation matches.
- G3: The user decides what the zone line shows, in one compact settings row, and sees the result at once.

## Non-Goals

- NG1: No abbreviations outside tzdb, including «МСК+1», `ET` and `PT`.
- NG2: No search by the first letters of an abbreviation; the whole query must equal it.
- NG3: The theme and hour format groups keep their current radio layout.
- NG4: No abbreviations from `Intl` (`timeZoneName: "short"`), in display or in search (`.claude/rules/temporal.md`).
- NG5: The Russian spelling «МСК» is a display form only; a Cyrillic query «МСК» does not match by abbreviation (Moscow is found as «Москва»).
- NG6: No zone transition rules are shipped. Which half of the year a moment is in comes from the browser's zone rules, as every offset does (ADR-0003, "Known limitation").
- NG7: The zone label does not affect search results, accessible names, the offset difference or the day track.

## Users & Scenarios

- U1: An invitation says "10:00 EDT". The user types `EDT` in the search, sees "New York  EST / EDT" with EDT emphasised, and adds it.
- U2: A user with Dublin and Kolkata on the list sees `GMT` on Dublin in January and `IST` in July, and `IST` on Kolkata all year.
- U3: A user who finds the abbreviation noisy switches "Abbreviation" off; every card loses it at once and the example under the toggles reads "India  UTC+5:30".
- U4: A Russian-speaking user sees «Россия  МСК  UTC+3» on the Moscow card.
- U5: A keyboard user tabs to the "Abbreviation" toggle and presses Space; a screen reader announces it as a toggle button, not pressed.

## Requirements

### Functional

- FR1: The zone abbreviation SHALL come only from tzdb letter abbreviations (letters A–Z, a–z). A zone whose tzdb designation at the moment is numeric (`+05`, `-03`) has no zone abbreviation.
- FR2: The zone abbreviation SHALL be the one in force at the reference moment (the effective instant), not now: New York `EST` in January and `EDT` in July; Dublin `GMT` in January and `IST` in July; Sydney `AEDT` in January and `AEST` in July.
- FR3: The zone abbreviation SHALL be written in Latin letters in every interface language, with one exception: the Russian interface writes `MSK` as «МСК». A dialect follows its base language, then English.
- FR4: Cards and search SHALL read one zone abbreviation table, built into the app, that needs no network.
- FR5: The zone line of a city location SHALL consist of separate elements in this order: the country name, the zone abbreviation, the UTC offset. An element that the zone label hides, or that is unknown (no country, no abbreviation, an offset that cannot be computed), MUST leave no element, gap or separator behind. A zone abbreviation that reads the same as the UTC offset text (the `UTC` zone: `UTC`) is not shown twice.
- FR6: The meta line of the device time location SHALL follow FR5 with "Device time" («Время устройства») in place of the country name.
- FR7: The wall-time hint of a DST overlap SHALL always name the UTC offset of the shown instant, and SHALL name the zone abbreviation before it when the zone label shows the abbreviation and the zone has one: "(EDT, UTC−4)".
- FR8: Search by abbreviation SHALL use the zone abbreviation table of FR4 instead of the app's own table. `ET`, `PT`, `ALMT`, `ICT`, `SGT`, `GST`, `BRT` and `ART` MUST NOT match by abbreviation. `GMT` MUST NOT find the `UTC` zone and `BST` MUST NOT find Dhaka (`Asia/Dhaka`), because tzdb does not give those zones these abbreviations.
- FR9: A query whose whole text equals a zone abbreviation (case-insensitive) SHALL find every zone whose abbreviation pair contains it.
- FR10: A result matched by abbreviation SHALL show the zone's abbreviation pair in order of increasing UTC offset, separated by " / " ("New York  EST / EDT"), with the matched abbreviation emphasised. A zone with one abbreviation shows it alone (Panama: `EST`).
- FR11: An abbreviation used by several zones SHALL return each of them with its own pair (`IST`: Kolkata `IST`, Dublin `GMT / IST`, Jerusalem `IST / IDT`), ordered like every other result kind: popular locations first, then alphabetically by city name in the interface language.
- FR12: The settings page SHALL have a "Zone label" («Подпись пояса») group: its caption and two independent toggles, "UTC offset" («Смещение UTC») and "Abbreviation" («Сокращение»), in one row.
- FR13: Both toggles MAY be off; the zone line then shows only the country name (or "Device time"). A change SHALL apply to every row in the same render.
- FR14: Under the toggles a live example SHALL show the zone line of Kolkata («Индия  IST  UTC+5:30», "India  IST  UTC+5:30") and follow every change of the toggles.
- FR15: Both toggles SHALL be on by default, for new users and for users with a stored preferences document of an earlier version. The zone label SHALL be stored, restored, shared between tabs and reset like the other preferences. It MUST NOT change search results.
- FR16: The compact group SHALL be one reusable component, a toggle group, that takes a caption, any number of options and the set of options that are on.

### Non-Functional

#### Performance

- NFR-P1: Presenting 50 rows again at another minute of the same day SHALL build no formatter and look up no time zone transition, with the zone abbreviation shown. The zone abbreviation of a row SHALL cost at most 2 extra zone lookups when its zone has an abbreviation pair, and 0 otherwise. Bounds are counted, never timed; the timing is a benchmark (ADR-0008).
- NFR-P2: The zone abbreviation table SHALL add at most 5 KB gzipped to the initial JavaScript, which stays at most 150 KB gzipped; the search data file stays at most 30 KB gzipped.
- NFR-P3: An abbreviation query SHALL keep the search work bound: it normalizes exactly one text and builds at most one collator.

#### Accessibility

- NFR-A1: The zone label group SHALL be a group named by its caption; each toggle is a button that exposes its pressed state, is a Tab stop, toggles with Space and Enter, is at least 44 × 44 px, keeps a visible focus outline, and shows its pressed state by an icon as well as by colour. The live example is the group's description. axe-core reports no violations on the settings page in the light and dark themes.
- NFR-A2: The emphasised abbreviation of a search result SHALL differ by font weight as well as colour, and the result's accessible name contains the pair. axe-core reports no violations in the results for `IST` in both themes.

#### Responsive

- NFR-R1: The zone line SHALL wrap only between its elements; the zone abbreviation and the UTC offset never break inside; the country name may wrap between words; nothing is cut with an ellipsis, and the card grows in height instead. At 320, 375, 768, 1024 and 1440 px the page does not scroll horizontally and no zone line element is clipped, including the heaviest case: Adelaide in January (`ACDT`, `UTC+10:30`) next to a country name of at least 20 characters.
- NFR-R2: From 640 px the zone label caption and both toggles SHALL share one row; below it the toggles may move under the caption but stay in one row together. The settings page does not scroll horizontally at 320 px and 2560 px.
- NFR-R3: The approved screenshots that show cards, the device time location, the settings page and the `IST` search results SHALL be re-approved with the new zone line, group and pairs, and then match.

## UX Acceptance Criteria

- UX1: The zone abbreviation uses the zone line's text style and sits between the country name and the offset, spaced like them, with no separator character.
- UX2: Toggling updates the example and every card in the same render, with no loading state and no layout jump of the toggles.
- UX3: In a pair, only the matched abbreviation is emphasised; the other stays in the muted style.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| online or offline | location list loaded | every card shows its zone line from the built-in table; no request is made for it |
| online or offline | location list empty | empty state (existing); the zone label group and its example still work on the settings page |
| online or offline | stored list unreadable | load error with Reset (existing); no zone line is shown |
| online or offline | preferences document missing | both toggles on (default); nothing is written until a toggle changes |
| online or offline | preferences document of version 2 | migrated: both toggles on, other preferences kept |
| online or offline | preferences document unreadable | both toggles on (default), the unreadable note with Reset (existing) |
| storage unavailable | — | toggles apply for the session; the "will not be saved" note (existing) |
| online | search data loading / failed | search loading placeholder / error with Retry (existing); cards unaffected |
| offline after a visit | search data cached | abbreviation search works offline |
| online or offline | zone with no letter abbreviation | the zone line has no abbreviation element |
| online or offline | zone unknown to the browser | the row shows no offset and no abbreviation (existing rule) |

## Behavior

- `packages/client/src/test/features/zone_abbreviations/zone_abbreviations_unit.feature` — FR1–FR4.
- `packages/client/src/test/features/locations/locations_zone_line_unit.feature` — FR5, FR6, FR13, UX1.
- `packages/client/src/test/features/locations/locations_zone_line_budget_unit.feature` — NFR-P1.
- `packages/client/src/test/features/locations/locations_zone_line_e2e.feature` — NFR-R1.
- `packages/client/src/test/features/location_search/location_search_by_abbreviation.feature` — FR8–FR11, M3 (rewritten).
- `packages/client/src/test/features/settings/settings_zone_label_unit.feature` — FR12–FR15, UX2.
- `packages/client/src/test/features/settings/settings_zone_label_e2e.feature` — NFR-A1, NFR-R2, UX2.
- The existing screenshot outlines (task 9.4) — NFR-R3.
- `packages/client/src/test/features/time_selection/` wall-time hint scenarios — FR7.

All scenarios carry `@show-zone-abbreviations-and-zone-label-setting`.

## Visual Reference

No Figma frame. The design screens (`docs/design/screens/`) already show «Россия · MSK» on the Moscow card; this change follows the glossary instead (separate elements, no separator, `UTC` not `GMT`). Design tokens stay the source of truth.

## Affected IA

No changes: `docs/ia/` does not exist.

## Success Metrics

- M1: 8 of 8 sample cards show exactly the expected abbreviation: New York `EST` (2026-01-15) and `EDT` (2026-07-15), Dublin `GMT` and `IST` on the same dates, Sydney `AEDT` (2026-01-15), Kolkata `IST`, Almaty none, Moscow «МСК» in Russian (unit BDD).
- M2: The query `IST` returns exactly 3 abbreviation results, Kolkata `IST`, Dublin `GMT / IST`, Jerusalem `IST / IDT`, in that order, and 4 results in total (unit BDD and E2E).
- M3: 8 of 8 removed abbreviations (`ET`, `PT`, `ALMT`, `ICT`, `SGT`, `GST`, `BRT`, `ART`) return 0 abbreviation results, and 2 of 2 dropped matches are gone: `GMT` gives no abbreviation result for the `UTC` zone and `BST` none for Dhaka, while both still give one for London (unit BDD).
- M4: 4 of 4 toggle combinations give the expected Kolkata zone line on the card and in the example: "India IST UTC+5:30", "India UTC+5:30", "India IST", "India" (unit BDD).
- M5: 0 px of horizontal overflow and 0 clipped zone line elements at 5 of 5 widths (320, 375, 768, 1024, 1440 px) for the heaviest case (E2E).
- M6: A version 2 preferences document loads with 2 of 2 toggles on and its theme, hour format and interface language unchanged (unit test).
- M7: axe-core reports 0 violations on the settings page and on the `IST` results, in 2 of 2 themes (E2E).
- M8: The zone abbreviation table is at most 5 KB gzipped (unit test), and the initial JavaScript stays at most 150 KB gzipped (`check:bundle-size`).
- M9: Stryker scores at least 95 % (minimum acceptable 90 %) on each production file this change adds logic to (task 9.1 lists them).

## Open Questions

None. The source of the table, how the half of the year is decided, and the Russian spelling mechanism are decided in `design.md` (D1–D3). The Cyrillic query «МСК» is a non-goal (NG5).

## Impact

- Code under `packages/client/`:
  - `scripts/zoneData/`: a new pure extraction of the zone abbreviation table and a new virtual module in `zoneDataPlugin.ts`;
  - `src/model/`: the zone abbreviation owner;
  - `src/preferences/`, `src/adapters/preferencesDocument.ts`, `src/constants/preferences.ts`: the zone label preference and schema version 3;
  - `src/presenter/`: the zone line, the abbreviation spelling, the wall-time hint, the search result pair;
  - `src/adapters/city-search/`: the abbreviation source reads the new table; `timeZoneAbbreviations.ts` is removed;
  - `src/controller/`: the zone label hook and the settings example;
  - `src/views/shared/` and `src/app/settings/`: the zone line, the result pair, the toggle group and the zone label group;
  - `src/locales/en.json`, `ru.json`: new keys.
- Dependency: one new devDependency of `@time-zones/client`, `moment-timezone`, used only at build time (design D1).
- Docs: `docs/glossary/time.md`, `locations.md`, `settings.md`, `search.md`, `date-selection.md`; `docs/architecture/domain-model.md` (the preferences fields).
