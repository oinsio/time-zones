# Add the country to the zone label

No other change is active in `openspec/changes/`, so no other change touches the `settings` or `locations` capabilities this change modifies.

## Why

The zone label setting lets the user switch the zone abbreviation and the UTC offset of the zone line on and off, but the country name is always shown. A user who knows where their cities are, or who wants the shortest cards and grid rows, cannot hide it; a user who wants only the zone parts gets "Russia" in front of every `MSK`. The task asks for a third toggle that switches the country, placed before the abbreviation toggle.

Audience: every user who reads location rows, and keyboard and screen reader users of the settings page.

## What Changes

- MODIFIED `settings`: the zone label group gets a third independent toggle, "Country" («Страна»), the first of the group, before "Abbreviation" and "UTC offset". All three are on by default, also for existing users: a stored preferences document written before this change gets the country shown and keeps every other choice. With all three off the live example reads "City only" («Только город»). The toggles wrap onto a second row on narrow screens instead of overflowing.
- MODIFIED `locations`: the country name in the zone line of a city location row is shown only while the zone label shows the country. A hidden country leaves no element and no gap; with every part hidden the row shows no zone line. The device time location's meta line "Device time" is not a country name and stays.
- Glossary (changed terms, no new term):
  - **Zone label** (`docs/glossary/settings.md`): it decides the country, the zone abbreviation and the UTC offset; *RU:* «Страна» added; English "Country"; owner list gains `settings.zoneLabelCountry` and `settings.zoneLabelExampleCityOnly`.
  - **Zone line** (`docs/glossary/locations.md`): the country name is shown as the zone label allows, like the other parts; the device time location's "Device time" always stays.
  - `docs/architecture/domain-model.md`: `zoneLabelParts` lists `COUNTRY` too.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `settings`: MODIFIED "Zone label", "Toggle group", "Accessible zone label", "Zone label layout", "Preferences are kept on the device", "Unreadable stored preferences", "Settings strings are localized".
- `locations`: MODIFIED "Zone line on location rows", "Device time location".

## Impact

- `src/preferences/` (the zone label part enum, defaults, parsing), `src/constants/preferences.ts` (part order, schema version), `src/adapters/preferencesDocument.ts` (migration step), `src/presenter/zoneLine.ts` and `presentLocationRows.ts`, `src/app/settings/ZoneLabelGroup.tsx` and `SettingsToggleGroup.tsx`, `src/locales/en.json` and `ru.json`, the zone label features and their step helpers, the approved settings screenshots, the glossary and the domain model doc.
- No new dependency, no new port, no new storage key.

## Goals

- G1: The user decides in one place whether the zone line shows the country, the zone abbreviation and the UTC offset, each on or off.
- G2: The country toggle is the first of the group, before "Abbreviation", in every interface language.
- G3: Nobody's screen changes by this update: existing users and new users see the country until they turn it off.

## Non-Goals

- NG1: The search results keep their country name; the zone label does not change the search.
- NG2: The device time location's "Device time" text is not affected by the country toggle.
- NG3: No new performance budget; the existing "Zone line is fast" bound stays as it is.
- NG4: The city label, the local time, the offset difference, the day track, the wall-time hint and accessible names do not change with the country toggle.
- NG5: No change to the order of the zone line itself (country, zone abbreviation, UTC offset).

## Users & Scenarios

- U1: A user with Moscow, Kolkata and New York knows where the cities are and turns the country off; each card reads `MSK, UTC+3` under the city.
- U2: A user turns every part off to get the shortest rows; each row shows the city alone, and the settings example reads "City only".
- U3: An existing user who had turned the abbreviation off updates the app; the rows still show `Russia, UTC+3`, and the "Country" toggle is on.
- U4: A keyboard user tabs through "Country", "Abbreviation" and "UTC offset" in this order and toggles each with Space or Enter.

## Requirements

### Functional

- FR1: The zone label SHALL have a third zone part, the country, with the toggle "Country" («Страна»). The three toggles are independent: any of the eight combinations is allowed, all off included. All three are on by default.
- FR2: The toggles SHALL come in the order of the zone line, "Country", "Abbreviation", "UTC offset", in every interface language; the Tab order follows it.
- FR3: The zone line of a city location row SHALL show the country name only while the zone label shows the country. A hidden country leaves no element, no empty space and no separator; with the country, the zone abbreviation and the UTC offset all hidden or unknown the row shows no zone line. A change applies to every row in the same render, without a reload, and changes nothing else in the row.
- FR4: The device time location's meta line SHALL keep its first element "Device time" («Время устройства») whatever the country toggle; its zone abbreviation and UTC offset follow the zone label as before.
- FR5: The live example under the toggles SHALL show the country of the example (Russia) only while the country is shown, and SHALL read "City only" («Только город») while no part of its zone line is shown.
- FR6: The country choice SHALL be kept with the zone label in the stored preferences, restored on reload, offline too, and shared with other open tabs. A stored document written before this change SHALL be migrated so the country is shown and every other stored choice is kept, without a write until the user changes a setting. A document with an unknown or repeated zone label part stays unreadable, and the defaults it falls back to show all three parts.

### Non-Functional

#### Performance

None beyond the existing "Zone line is fast" bound (NG3).

#### Accessibility

- NFR-A1: The "Country" toggle SHALL be a button named by its label that exposes its pressed state, is its own Tab stop, toggles with Space and Enter, is at least 44 × 44 px, shows its pressed state by a check icon as well as by colour and keeps a visible focus outline. The live example, "City only" included, stays the group's accessible description. axe-core reports no violations on the settings page in the light and dark themes with all parts on and all parts off.

#### Responsive

- NFR-R1: From 640 px the three toggles SHALL share one row. Below 640 px they MAY wrap onto further rows, never shrinking below 44 × 44 px. The settings page MUST NOT scroll horizontally at 320, 375 and 2560 px in English and Russian. Turning a toggle on or off MUST NOT move or resize any toggle. The approved settings screenshots are re-approved once with the third toggle and then match.

## UX Acceptance Criteria

- UX1: The new toggle is named with the glossary word, "Country" / «Страна», and is the first toggle of the group, so the toggles read left to right like the zone line.
- UX2: With the country hidden the zone line starts with the zone abbreviation (or the UTC offset) with no leading gap; with every part hidden the row shows the city with no blank line under it.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| online or offline | no stored preferences | all three toggles on; rows show country, zone abbreviation, UTC offset |
| online or offline | stored document from before this change | country on, the stored abbreviation and offset choices kept |
| online or offline | all three parts off (empty zone line) | rows show the city with no zone line; the example reads "City only" |
| online or offline | unreadable stored document (error) | defaults with all three parts on, the existing note with Reset |
| online or offline | storage unavailable | toggles apply in memory, the existing "changes will not be saved" note |
| any | loading | none: preferences are read synchronously before the first render, the toggles apply in the same render |

## Behavior

- `packages/client/src/test/features/settings/settings_zone_label_unit.feature`, `settings_zone_label_e2e.feature`, `settings_view_mode_unit.feature`, `settings_storage_unit.feature`, `settings_e2e.feature`, `settings_language_e2e.feature` — scenarios tagged `@add-country-to-zone-label`.
- `packages/client/src/test/features/locations/locations_zone_line_unit.feature` (its "Meta line follows the zone label" covers the device time location) — scenarios tagged `@add-country-to-zone-label`.

## Visual Reference

No Figma frame; the settings page has no approved design screen (`docs/design/README.md`, "Not covered yet"). Design tokens and the existing toggle group are the source of truth.

## Affected IA

No changes.

## Success Metrics

- M1: 8 of 8 combinations of the three toggles give the expected settings example and the expected Kolkata zone line elements in unit BDD.
- M2: 4 of 4 stored preferences fixtures of versions 1, 2, 3 and 4 load with the country shown and every other stored choice kept.
- M3: 0 axe-core violations on the settings page in 2 themes × 2 states (all parts on, all parts off).
- M4: 0 px of horizontal scrolling on the settings page at 320, 375 and 2560 px in English and Russian (6 checks).
- M5: Mutation score ≥ 95% (minimum acceptable 90%) on the changed production files of `src/preferences/`, `src/presenter/zoneLine.ts` and `src/adapters/preferencesDocument.ts`.

## Open Questions

None. The one judgement call — whether the country toggle also hides "Device time" on the device time location — is decided by FR4 and design D3.
