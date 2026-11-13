# Design: Add the country to the zone label

All decisions are local to this change. They follow the layers of ADR-0002 and `.claude/rules/architecture.md` (the preferences model in `src/preferences/` is pure; formatting lives in `src/presenter/`; views render presenter output) and the persistence rules of ADR-0004 ("a schema change requires a migration and fixture tests"). No global decision is needed, so no ADR is written.

## Context

- FR1, FR2, FR6 of the proposal: the zone label gets a third part that is stored, migrated and ordered first.
- FR3, FR4, FR5, UX2: the zone line and the settings example hide the country; "Device time" stays; an empty example reads "City only".
- NFR-R1: three toggles do not fit one row at 320 and 375 px in Russian.

What exists today (checked in the code):

- `ZoneLabelPart` (`src/preferences/preferences.ts`) has `UTC_OFFSET` and `ZONE_ABBREVIATION`; its declaration order is the stored order; `DEFAULT_PREFERENCES.zoneLabelParts` is `Object.values(ZoneLabelPart)`.
- `ZONE_LABEL_PART_ORDER` (`src/constants/preferences.ts`) is the display order `[ZONE_ABBREVIATION, UTC_OFFSET]`; `ZoneLabelGroup` and `presentZoneLine` both read it.
- `reducePreferences` handles `SET_ZONE_LABEL_PART` for any part and keeps the enum order (`src/preferences/preferencesCommands.ts`); `parseStoredPreferences` rejects unknown and repeated parts.
- `PREFERENCES_SCHEMA_VERSION` is `4`; `createPreferencesMigrations` (`src/adapters/preferencesDocument.ts`) has steps 1, 2, 3; step 2 sets `zoneLabelParts: Object.values(ZoneLabelPart)`.
- `presentZoneLine` (`src/presenter/zoneLine.ts`) always emits the `PLACE` part when `placeText` is not empty; `presentLocationRows` passes `translate("locations.deviceTimeMeta")` as `placeText` for the device time location and the country name otherwise; `presentZoneLabelExample` passes the country name of `ZONE_LABEL_EXAMPLE`.
- `ZoneRowContent` already renders no `ZoneLine` when `zoneLineParts` is empty.
- `SettingsToggleGroup` lays its toggles out with `flex flex-nowrap gap-2`.

## Decision

### D1: The country is a third `ZoneLabelPart`

Add `ZoneLabelPart.COUNTRY = "COUNTRY"` as the last enum member, so the stored order of the existing parts does not change and `DEFAULT_PREFERENCES.zoneLabelParts` becomes all three without code. `ZONE_LABEL_PART_ORDER` becomes `[COUNTRY, ZONE_ABBREVIATION, UTC_OFFSET]`. `SET_ZONE_LABEL_PART`, `parseStoredPreferences`, `useZoneLabelParts` and `setZoneLabelPart` need no new branch; their tests gain the third part. `ZoneLabelGroup` maps `COUNTRY` to the new key `settings.zoneLabelCountry` ("Country", «Страна»).

### D2: Schema version 5 with a step that adds the country

`PREFERENCES_SCHEMA_VERSION` becomes `5`. `createPreferencesMigrations` gains step `4`: when `zoneLabelParts` is an array that does not include `COUNTRY`, append `COUNTRY`; otherwise leave the payload as it is (a malformed value stays malformed so `parseStoredPreferences` still rejects it). The guard matters: after D1, step 2 already produces all three parts through `Object.values(ZoneLabelPart)`, so a version 2 document reaches step 4 with the country in it, and adding it twice would make the document unreadable. `parseStoredPreferences` sorts parts into enum order, so appending is enough. Fixture tests cover versions 1, 2, 3 and 4 (M2). Loading never writes (ADR-0004), so the migrated document is not rewritten until a change.

### D3: `presentZoneLine` hides the country, never "Device time"

`ZoneLineInput` gains `isDeviceTimeMeta: boolean`. The `PLACE` part is emitted when `placeText` is not empty and either `isDeviceTimeMeta` is true or `zoneLabelParts` includes `COUNTRY`. The `PLACE` part keeps its place before `ZONE_LABEL_PART_ORDER`'s other parts; the zone parts loop maps only the two zone parts (`COUNTRY` has no zone part entry). `presentLocationRows` passes `isDeviceTimeMeta: isDeviceTime`; `presentZoneLabelExample` passes `false`. `LocationRow.countryName` (used by no view today) stays unchanged, so nothing else reads the zone label.

### D4: The "City only" example is the view's empty state

`ZoneLabelGroup` renders `t("settings.zoneLabelExampleCityOnly")` ("City only", «Только город») in place of the `ZoneLine` when `useZoneLabelExample()` returns no part; the sr-only "Example:" prefix stays, so the group's accessible description reads "Example: City only". This is an empty state of the view, like the empty list text; no presenter concept changes.

### D5: Toggles may wrap

`SettingsToggleGroup`'s toggle container changes from `flex-nowrap` to `flex-wrap` (with the same `gap-2`). Wide screens keep one row of toggles (the settings `main` is `max-w-xl`, 576 px, and three toggles in Russian need about 400 px); narrow screens wrap instead of overflowing. The check-icon slot already keeps its size when a toggle is off, so toggling still moves nothing. The "Toggle group" requirement is reworded to allow the wrap.

### D6: Test phrases keep their meaning

The step helpers that turn a zone label phrase into parts — `ZONE_LABEL_PART_NAMES` in `src/test/features/locations/steps/zoneLineWorld.tsx` and `ZONE_LABEL_PART_VALUES` in `src/test/features/settings/steps/settingsE2eHelpers.ts` — and every feature using them switch to phrases that name the country explicitly ("the country, the zone abbreviation and the UTC offset", "the country and the UTC offset", "the country only", …, "nothing" = no part), as the spec scenarios do. Seeds of the current schema version that list parts without the country would otherwise hide the country in unrelated scenarios.

## Consequences

Positive:
- One concept, one owner: the country is a zone label part like the others, so storage, reducer, cross-tab sync and parsing reuse the existing code.
- Existing users see no change after the update.

Negative:
- Every test fixture and step helper that lists zone label parts must name the country; a missed one shows up as a failing scenario, not silently.
- The approved settings screenshots change and are re-approved once.

## Alternatives Considered

**A separate boolean preference `isCountryShown`**: no enum change, but the zone label would be split over two fields, two commands and two parsers — a smeared concept (`.claude/rules/glossary.md`).

**Store the hidden parts instead of the shown ones**: a new part would be shown for old documents without a migration, but it inverts the stored meaning of an existing field and still needs a migration of every stored document.

**Let the country toggle also hide "Device time"**: the device time location would then read only its city, the same as a city location of that zone, and lose the only visible sign of what it is; rejected (FR4).

**Show nothing in the example when all parts are off**: the group's accessible description would be "Example:" with nothing after it; rejected (FR5, NFR-A1).
