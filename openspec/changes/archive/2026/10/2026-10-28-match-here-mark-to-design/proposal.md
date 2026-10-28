# Match the "here" mark on location rows to the approved design

## Why

The approved screens `docs/design/screens/phone-no-home.{html,png}` and `phone-travel.{html,png}` show the device-zone mark as a location-arrow icon in the accent colour **before** the city name and a short accent word "здесь" / "here" **after** it (the HTML gives the icon `aria-label="Вы здесь"`). The app shows something else: a filled, rounded accent pill with a small arrow and the text "Your time zone" right after the city (`packages/client/src/views/shared/LocationRow.tsx`, requirement "Device time zone badge on location rows" in `openspec/specs/locations/spec.md`). The archived change `mark-device-time-zone-in-location-list` chose that text knowingly and left the alignment open (its Q1). `docs/design/README.md` lists both screens as the visual target, and `docs/architecture/views.md` ("Row header") already names the same slot: "home icon, "here" icon (location arrow) or difference from the reference zone".

The same leading slot will later hold the home mark (house icon, `aria-label="Домашняя локация"` in `phone-travel.html`). Home does not exist yet. If this fix hard-codes the arrow, the home change has to rebuild the row header. So the mark is planned as one slot whose kind decides the icon and the texts.

Audience: every user whose list contains a city in the device time zone, and screen-reader users, who now hear "You are here".

## What Changes

- MODIFIED: a row in the device time zone shows a leading location-arrow icon before the city and a short "here" caption right after the city, both in the accent colour. The filled "Your time zone" pill is removed.
- MODIFIED: the texts become "here" / "здесь" (visible caption) and "You are here" / "Вы здесь" (accessible label, taken from the design's `aria-label`). The row's accessible name becomes the city followed by "You are here".
- ADDED: a row has at most one leading mark. Its kind (only "here" today) decides the icon, the accessible label and the caption, so a later home mark takes the same slot without changing the row layout.
- Unchanged: which rows are marked (equality by canonical IANA identifier, any number of matches), when the device zone is read (startup, minute boundary, page visible again), and that nothing about it is stored.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `locations`: the requirements "Device time zone badge on location rows", "Device time zone badge text" and "Device time zone badge is accessible and fits every screen" are renamed to the "here" mark and changed. "Local time and date are fast and accessible" changes the row name it expects. "Local time and date follow the clock" points its cross-reference at "Here mark on location rows", with no behaviour change. A new requirement, "One leading mark per row", is added.

## Impact

- `packages/client/src/`: `model/` (mark kind enum and the selector picking a row's mark), `presenter/presentLocationRows.ts` and `presenter/index.ts` (a presented mark replaces `deviceTimeZoneLabel`), `views/shared/LocationRow.tsx` and a new `views/shared/LocationMarkIcon.tsx` (leading slot and caption), `constants/` (icon size), `locales/en.json` and `locales/ru.json` (two new keys replace `locations.deviceTimeZoneBadge`).
- Tests: unit tests and fixtures that use `deviceTimeZoneLabel` or "Your time zone"; the unit BDD features `locations_device_time_zone_unit.feature` and `locations_clock_tick.feature`; the E2E features `locations_device_time_zone_e2e.feature` and `locations_local_time_e2e.feature`; a new `locations_here_mark_unit.feature`; 32 screenshot baselines re-approved (the list, pinned, calendar and time-selected states × 375 / 1024 px × light / dark × `chromium` / `mobile-chrome`).
- No new dependencies (`lucide-react` already provides `Navigation`), no storage schema change, no network.

## Goals

- G1: 100% of rows in the device time zone show the design's arrow icon before the city and the "here" caption after it. 0 rows show the old "Your time zone" pill.
- G2: A later home mark is added by adding one enum member, its icon entry, its locale keys and its selection rule. The row layout in `LocationRow.tsx` does not change.

## Non-Goals

- NG1: Setting, clearing or showing a home location, and the house icon itself (ADR-0007 "Home is optional"). Only the slot is prepared.
- NG2: The derived **Here** entry with the "Device time · GMT+5" line, shown when no location matches the device zone (`phone-no-home` top card, ADR-0007).
- NG3: Differences from the reference zone ("−2 ч", "+0:30"), which the design places between the city and the caption.
- NG4: Other visual differences between the cards and the screens (city and time font sizes, card padding, meta line wording).
- NG5: Any change to which rows are marked or when the device zone is read.
- NG6: Marks in search results.

## Users & Scenarios

- U1: A user in Almaty with Almaty and Moscow in the list sees the arrow before "Almaty" and "here" after it. Moscow has no mark, and its city starts the line.
- U2: A user in Moscow who keeps Moscow and Saint Petersburg (both `Europe/Moscow`) sees the mark on both rows.
- U3: A screen-reader user hears the Almaty row as "Almaty You are here", without the caption read a second time.
- U4: A user with the Russian interface sees "здесь" and hears "Вы здесь".

## Requirements

### Functional

- FR1: A row whose canonical IANA zone equals the device time zone shows the "here" mark. The mark has two parts: a location-arrow icon at the start of the city line, before the city name, and a "here" caption right after the city name on the same line. Rows that do not match show neither part. The match rules of the "Device time zone badge on location rows" requirement are unchanged.
- FR2: No row shows the "Your time zone" pill or text in any language.
- FR3: The mark's texts come from the locale files. Caption: "here" (English) and "здесь" (Russian). Accessible label: "You are here" (English) and "Вы здесь" (Russian). The old "Your time zone" key no longer exists in either locale.
- FR4: A row shows at most one leading mark. The mark's kind decides its icon, its accessible label and whether it has a caption. "Here" is the only kind in this change, and every kind has an icon and both texts defined.
- FR5: The mark keeps following the list and the device zone: adding, removing, moving or resetting locations, changes from another tab, a new minute and a return to the visible page keep it on exactly the matching rows. Nothing about it is stored.

### Non-Functional

#### Performance

- NFR-P1: Presenting 50 rows for the first time in a language, some in the device zone, builds at most 3 date and time formatters per distinct time zone and at most 1 region name formatter (the existing work bound of ADR-0008). The mark appears in the same render as its row, with no loading state.

#### Accessibility

- NFR-A1: The accessible name of a marked row is its city followed by the mark's accessible label ("Almaty You are here"). An unmarked row is named by its city alone. The icon is exposed as an image named by the accessible label. The caption is hidden from assistive technology, so it is not announced twice.
- NFR-A2: axe-core reports no violations for a list with a marked row in the light and dark themes, including colour contrast of the caption.

#### Responsive

- NFR-R1: A list with a marked row does not scroll horizontally at 320 px and at 2560 px.
- NFR-R2: The approved screenshots of the list, pinned, calendar and time-selected states at 375 px and 1024 px in both themes show the new mark on the Almaty row and are re-approved.

## UX Acceptance Criteria

- UX1: The arrow icon is filled, in the accent colour, about the height of the city text (18 px in the screens), and sits before the city name with a small gap, as in `phone-no-home.png`.
- UX2: The caption is plain accent-coloured text with no background and no border, bold and smaller than the city. It sits right after the city name, so the city stays the most prominent text.
- UX3: An unmarked row reserves no empty space for the icon: its city starts the line, as for Moscow in `phone-no-home.png`.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | locations, one or more in the device zone | each matching row: arrow + city + "here"; other rows: city only (FR1, UX3) |
| any | locations, none in the device zone | no row shows a mark (FR1) |
| any | no locations | empty state unchanged, no mark |
| any | stored list unreadable | error with Reset unchanged; after Reset the empty state |
| any | device zone unknown to the browser | rows in `UTC` show the mark (unchanged fallback) |
| any | loading | none: the mark renders with its row; the existing view skeleton is unchanged |
| offline | any of the above | same behaviour: the mark needs no network |

## Behavior

Feature files under `packages/client/src/test/features/locations/`, tagged `@match-here-mark-to-design`:

- New `locations_here_mark_unit.feature` (vitest-cucumber, jsdom) covers: icon before the city and caption after it, no pill, one leading mark per row, unmarked rows without the slot, and every mark kind defined in both locales.
- Existing `locations_device_time_zone_unit.feature` and `locations_clock_tick.feature` switch their steps and expected texts from the badge to the "here" mark. Their match, list-change, re-read, language and budget scenarios gain `@match-here-mark-to-design` tags.
- Existing `locations_device_time_zone_e2e.feature` (playwright-bdd) switches to the here mark and gains `@match-here-mark-to-design` tags. It covers the row accessible name, a new scenario for the icon image name with the hidden caption, axe-core in both themes, and layout at 320 px and 2560 px.
- Existing `locations_local_time_e2e.feature` expects the new row name. The screenshot outline in `locations_ui_e2e.feature` is re-approved.

## Visual Reference

[`docs/design/screens/phone-no-home`](../../../docs/design/screens/phone-no-home.html) (mark on a row without home) and [`phone-travel`](../../../docs/design/screens/phone-travel.html) (the "here" mark on Moscow, the house icon in the same slot on Almaty). The colours come from the design tokens (`--color-accent`), not from the screens' inline values.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR5, NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2 and UX1–UX3 have at least one automated test tagged or commented with `match-here-mark-to-design`.
- M2: With the device zone `Europe/Moscow` and the list Moscow, Saint Petersburg, Almaty, exactly 2 rows show the arrow icon and the "here" caption, and 0 rows show the text "Your time zone" (unit BDD).
- M3: 1 of 1 mark kinds (`HERE`) has an icon, an accessible label and a caption key, checked by a test that iterates over every member of the mark kind enum. The test fails if a later kind is added without them.
- M4: axe-core reports 0 violations with a marked row in 2 themes (2 checks). The page scrolls horizontally 0 times at 320 px and 2560 px (2 checks).
- M5: 32 of 32 screenshot baselines of the list, pinned, calendar and time-selected states are re-approved and pass without `--update-snapshots`.
- M6: The mutation score of the new or changed model, presenter and view files is at least 95% (minimum 90%).

## Open Questions

- Q1: When home is set and the device is in the home zone, which mark takes the slot: the house or the arrow? And does the "here" caption stay? The screens do not show this case. This change leaves the decision to the change that introduces home. That change only adds a kind and a priority rule in the selector (design D1).
- Q2: Once differences from the reference zone exist (NG3), the design puts "here" after the difference ("Москва −2 ч здесь"). The change that adds differences places them between the city and the caption.
