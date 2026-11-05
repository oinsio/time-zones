# Design: Show zone abbreviations and the zone label setting

## Context

Driven by FR1–FR16, NFR-P1–NFR-P3, NFR-A1, NFR-A2, NFR-R1–NFR-R3 of the proposal. What the code does today (all paths under `packages/client/`):

- `src/adapters/city-search/timeZoneAbbreviations.ts` holds `TIME_ZONE_ABBREVIATIONS`, a hand-written map abbreviation → zones (it includes `ET`, `PT`, `ALMT`, `ICT`, `SGT`, `GST`, `BRT`, `ART`, maps `GMT` to `UTC` and `Europe/London`, and `BST` to `Europe/London` and `Asia/Dhaka`), and `findAbbreviationsOfZone`. `abbreviationSource.ts` matches a query equal to a key of that map; `zoneCitiesSource.ts` fills `CityRecord.aliases` with `findAbbreviationsOfZone`. `createCompositeCitySearch.ts` keeps abbreviation results in table order (`return 0; // the sort is stable`).
- `presentZoneMoment` (`src/presenter/presentZoneMoment.ts`) computes `utcOffsetLabel` with `getUtcOffsetMinutes` + `formatUtcOffset`, the local `ZonedDateTime` with `getLocalDateTime`, and passes `utcOffsetLabel` to `presentWallTimeHint`, whose `locations.wallTimeHintAmbiguous` text interpolates `{{utcOffset}}`.
- `presentLocationRows` returns `countryName`, `utcOffsetLabel` and, for the device time location only, `metaLabel` = `locations.deviceTimeMeta` ("Device time · {{utcOffset}}"). `LocationRow.tsx` builds `secondaryTexts` as `[countryName, utcOffsetLabel]` or `[metaLabel]`, and `ZoneRowContent.tsx` renders each as a `<span>` in a `flex flex-wrap gap-x-2` line.
- `Preferences` (`src/preferences/preferences.ts`) holds `theme`, `hourFormat`, `interfaceLanguage`; `PREFERENCES_SCHEMA_VERSION = 2` (`src/constants/preferences.ts`); `createPreferencesMigrations` (`src/adapters/preferencesDocument.ts`) has the step `1`. `useHourFormat` reads the preferences context with the default outside a provider.
- `SettingsPage.tsx` renders `SettingsOptionGroup` (a radio group, one full-width row per option) for theme and hour format, then `InterfaceLanguageGroup`.
- `scripts/zoneData/zoneDataPlugin.ts` serves CLDR-derived data as virtual modules; `virtual:time-zone-aliases` is bundled and imported by the model (`src/model/timeZoneId.ts`). `src/vite-env.d.ts` declares the modules. Vitest runs the same plugin (`vitest.config.ts`).
- No installed package carries tzdb abbreviations: `temporal-polyfill` and `luxon` (transitive) read zone names from `Intl`.

Glossary owners this change touches and extends: **UTC offset** (`getUtcOffsetMinutes`, `formatUtcOffset`), **Location row** (`presentLocationRows`, `presentZoneMoment`), **Country code** (`presentCountryName`), **Wall-clock status** / the wall-time hint (`presentWallTimeHint`), **Abbreviation source** (`createAbbreviationSource`), **Search result** (`PresentedSearchResult`), **Preferences** (`Preferences`, `reducePreferences`, `parseStoredPreferences`), **Hour format** (its hook pattern `useHourFormat`), **Settings page** (`SettingsPage`).

ADRs read and followed: ADR-0002 (model / presenter / controller / views), ADR-0003 (IANA IDs, `Intl` abbreviations never used for matching, no own tzdata), ADR-0004 (versioned documents, migrations with fixtures), ADR-0006 (the abbreviation source is a city source), ADR-0008 (work bounds, benchmarks), ADR-0009 (no BigInt, legacy zone shim, ES2020 output). ADR-0001, 0005, 0007 and 0010 are unaffected: no view registration, device zone reading or location kind changes.

## Goals / Non-Goals

**Goals:** the proposal's G1–G3; one owner for the zone abbreviation, the zone line and the zone label.

**Non-Goals:** the proposal's NG1–NG7.

## Decision

### D1. The zone abbreviation table is generated from tzdb at build time and bundled (FR1, FR4, NFR-P2)

- Add the devDependency `moment-timezone` to `@time-zones/client` (`pnpm --filter @time-zones/client add -D moment-timezone`). It ships tzdb compiled by `zic`: per zone, the periods with their designation, UTC offset and end. It is read only by the Vite plugin in Node; no application module imports it, so it adds nothing to any chunk.
- New pure module `scripts/zoneData/extractZoneAbbreviations.ts`:
  `extractZoneAbbreviations(zoneIds: readonly string[], readZonePeriods: (zoneId) => readonly ZonePeriod[] | undefined): ZoneAbbreviationTable`, with `ZonePeriod = { designation: string; utcOffsetMinutes: number; untilEpochMilliseconds: number }`.
  - It keeps the periods in force during the rules year `ZONE_ABBREVIATION_RULES_YEAR = 2026` (a constant of the script; periods that end after 2026-01-01 and start before 2027-01-01).
  - It takes their distinct UTC offsets in increasing order; a zone with more than two keeps the last two in time.
  - For each offset it takes the designation; a designation that is not letters only (`/^[A-Za-z]+$/`) becomes `""`.
  - Output: `Record<canonical zone ID, readonly string[]>`: one entry `[abbreviation]` for a zone with one offset, two entries `[atLowerOffset, atHigherOffset]` otherwise. A zone with no letter designation is left out.
- `zoneDataPlugin.ts` adds the bundled virtual module `virtual:zone-abbreviations` (`export default <table>`), built from the zone IDs of the existing zone cities data plus `UTC`, with `readZonePeriods` adapting `moment.tz.zone(id)` (`abbrs`, `offsets` in minutes west of UTC, `untils`). The adapter negates the offsets. `src/vite-env.d.ts` declares the module.
- The table is keyed by the zone ID, and holds abbreviations only: no UTC offset and no transition is stored, so `CLAUDE.md` ("never store raw UTC offsets") and `.claude/rules/temporal.md` ("never cache or hardcode offsets") hold. Transitions still come from the browser (ADR-0003, NG6).
- Size: about 420 zones of 3–5 letter strings. A unit test gzips `JSON.stringify` of the table and asserts at most 5 KB (NFR-P2); `check:bundle-size` keeps the 150 KB budget.

### D2. One model owner picks the abbreviation at a moment (FR1, FR2, NFR-P1)

New `src/model/zoneAbbreviation.ts`, exported through `src/model/index.ts`:

- `getZoneAbbreviations(timeZoneId: string): readonly string[]` — the abbreviation pair, the table entry without `""` slots; `[]` for a zone not in the table. Pure lookup, no Temporal.
- `getZoneAbbreviation(timeZoneId: string, localDateTime: Temporal.ZonedDateTime): string | undefined` —
  - the table entry of `timeZoneId` (canonical; the `ZonedDateTime` may carry a legacy name on an old engine, ADR-0009);
  - a one-slot entry gives its abbreviation with no Temporal work;
  - a two-slot entry compares `localDateTime.offsetNanoseconds` with the offsets of `localDateTime.with({ month: 1, day: 1 })` and `localDateTime.with({ month: 7, day: 1 })`. At the higher of those two (and they differ) it returns the second slot, otherwise the first. Jan 1 and Jul 1 each fall in a different half for every zone with a clock change in either hemisphere;
  - an empty slot gives `undefined`.
- It works in numbers (`offsetNanoseconds`), never BigInt (ADR-0009). `ZonedDateTime#with` makes no `toZonedDateTimeISO` call and no transition lookup, so a pair costs at most the 2 `with` calls and a single abbreviation costs none (NFR-P1). Because `zoneAbbreviationLabel` is computed whatever the zone label (D5), the work bound does not compare "shown" with "hidden": it compares a zone with a pair against a baseline zone without one in the same presentation (New York against Santiago, which also has a clock change; Moscow against Almaty). The test counter `startZoneLookupCount()` today counts only `Instant#toZonedDateTimeISO` and `PlainDateTime#toZonedDateTime`, so it gets a per-zone count of `ZonedDateTime#with` (`adjustmentsIn(timeZoneId)`, keyed by the receiver's `timeZoneId`), and a row's zone lookups are `lookupsIn + adjustmentsIn`. `lookupsIn` stays unchanged, so the existing budget scenarios that read it are unaffected.

The rejected alternatives are listed under "Alternatives Considered".

### D3. The spelling lives in the presenter and the locale files (FR3)

- `src/constants/zoneAbbreviations.ts` (exported from `src/constants/index.ts`): `LOCALIZED_ZONE_ABBREVIATION_KEYS: Readonly<Record<string, string>> = { MSK: "locations.zoneAbbreviationMsk" }`.
- New `src/presenter/zoneAbbreviation.ts`: `formatZoneAbbreviation(abbreviation: string, translate: TFunction): string` returns `translate(key)` for a listed abbreviation, otherwise the abbreviation itself. `en.json` gets `"zoneAbbreviationMsk": "MSK"`, `ru.json` `"zoneAbbreviationMsk": "МСК"`. Dialects follow i18next's fallback already set up by the locale registry.
- Matching and ordering never see the spelling (NG5): the model and the adapter work on the tzdb form.

### D4. The zone label is a preference with its own command (FR12, FR13, FR15)

- `src/preferences/preferences.ts`: `enum ZoneLabelPart { UTC_OFFSET = "UTC_OFFSET", ZONE_ABBREVIATION = "ZONE_ABBREVIATION" }`; `Preferences.zoneLabelParts: readonly ZoneLabelPart[]`, kept in enum order without duplicates; `DEFAULT_PREFERENCES.zoneLabelParts = [UTC_OFFSET, ZONE_ABBREVIATION]`.
- `src/preferences/preferencesCommands.ts`: `SET_ZONE_LABEL_PART { part: ZoneLabelPart; isShown: boolean }`. The reducer returns the same object when nothing changes, otherwise the parts in enum order.
- `parseStoredPreferences` rejects a `zoneLabelParts` that is not an array, holds an unknown value or a duplicate.
- `PREFERENCES_SCHEMA_VERSION` becomes 3; `createPreferencesMigrations` gets step `2` adding both parts; `serializePreferencesDocument` writes the field. Load stays read-only until a change (the existing rule), so a migrated document is rewritten only on the next write.
- Controller: `PreferencesContextValue.setZoneLabelPart(part, isShown)` in `PreferencesProvider.tsx`; new hook `useZoneLabelParts()` (`src/controller/useZoneLabelParts.ts`) mirrors `useHourFormat` (default outside a provider). Cross-tab sync and storage failures come for free from the existing document path.

The rejected shape is listed under "Alternatives Considered".

### D5. One presenter owner of the zone line (FR5, FR6, FR7, FR13)

- `PresentedZoneMoment` gets `zoneAbbreviationLabel: string`: `formatZoneAbbreviation(getZoneAbbreviation(timeZoneId, localDateTime))`, `""` when there is none. It is computed whatever the zone label, so the wall-time hint can ask for it.
- New `src/presenter/zoneLine.ts`:
  - `enum ZoneLinePartKind { PLACE, ZONE_ABBREVIATION, UTC_OFFSET }`, `type ZoneLinePart = { kind: ZoneLinePartKind; text: string }`;
  - `presentZoneLine({ placeText, zoneAbbreviationLabel, utcOffsetLabel, zoneLabelParts }): ZoneLinePart[]` — the parts in order, without empty or hidden ones. It drops the `ZONE_ABBREVIATION` part only when the `UTC_OFFSET` part is shown with the same text (the `UTC` zone, FR5), so with the offset hidden the `UTC` zone still shows `UTC`. The wall-time hint reads the unfiltered `zoneAbbreviationLabel`, which is harmless: the `UTC` zone has no overlap and never shows the ambiguous hint;
  - `presentZoneLabelExample({ instant, language, translate, zoneLabelParts })` — the zone line of `ZONE_LABEL_EXAMPLE` (`{ timeZoneId: "Asia/Kolkata", countryCode: "IN" }`, in `src/constants/preferences.ts`) through the same owners (`getUtcOffsetMinutes`, `formatUtcOffset`, `getLocalDateTime`, `getZoneAbbreviation`, `presentCountryName`).
- `LocationRowsContext` gets `zoneLabelParts`. `LocationRow` (presenter type) gets `zoneLineParts: readonly ZoneLinePart[]` and loses `metaLabel`; the place text is `countryName` for a city location and `translate("locations.deviceTimeMeta")` ("Device time") for the device time location. `locations.deviceTimeMeta` loses its `{{utcOffset}}` in both locale files. `useLocations` passes `useZoneLabelParts()` and adds it to the `useMemo` dependencies.
- Wall-time hint: `WallTimeHintContext` gets `zoneAbbreviationLabel` and `isZoneAbbreviationShown`. The ambiguous text interpolates `{{zone}}`: `translate("locations.wallTimeHintZone", { zoneAbbreviation, utcOffset })` ("{{zoneAbbreviation}}, {{utcOffset}}" in both files) when shown and known, otherwise the offset label alone (FR7).

### D6. Views render typed parts (NFR-R1, UX1)

- `ZoneRowContent` takes `zoneLineParts` instead of `secondaryTexts`; `LocationRow.tsx` passes `row.zoneLineParts`. Each part is a `<span>` keyed by its kind in the existing `flex flex-wrap gap-x-2` line; `ZONE_ABBREVIATION` and `UTC_OFFSET` parts get `whitespace-nowrap`; the `PLACE` part wraps between words (`break-words` stays on the column). No `truncate`, no separator glyph.

### D7. A reusable toggle group and the zone label group (FR12, FR14, FR16, NFR-A1, NFR-R2)

- `src/app/settings/SettingsToggleGroup.tsx`, generic over `Value extends string`: props `caption`, `options: { value, label }[]`, `selectedValues: readonly Value[]`, `onToggle(value, isSelected)`, optional `description: ReactNode`. Markup: a `role="group"` with `aria-labelledby` (the caption) and `aria-describedby` (the description); the caption and a non-wrapping `flex` of `<button type="button" aria-pressed>` toggles in a `flex flex-wrap items-center justify-between` row, so below the width that fits all three the toggles move under the caption together (NFR-R2); `min-h-11 min-w-11` (44 px), a `Check` icon when pressed whose slot keeps its size when unpressed (the icon is not rendered, its box stays), so toggling moves and resizes nothing (UX2), the accent border and focus outline of `SettingsOptionGroup`; the description under the row.
- `src/app/settings/ZoneLabelGroup.tsx` uses it with the two parts and `settings.zoneLabelLabel`, `settings.zoneLabelUtcOffset`, `settings.zoneLabelAbbreviation`; its description is the example from `useZoneLabelExample()` (new `src/controller/useZoneLabelExample.ts`: the effective instant from `LocationsContext` store and clock, the active language, `useZoneLabelParts()`, `presentZoneLabelExample`), rendered as zone line parts after a visually hidden `settings.zoneLabelExample` ("Example:", «Пример:»).
- `SettingsPage` renders `ZoneLabelGroup` between the hour format group and `InterfaceLanguageGroup`.

### D8. The search reads the table (FR8–FR11, NFR-P3)

- `createAbbreviationSource(zoneRecords)` builds, once per loaded search, a map from the upper-cased abbreviation to the records whose `getZoneAbbreviations(record.timeZoneId)` contains it, and returns them with `matchedAbbreviation` set to the tzdb form from the pair. `zoneCitiesSource` fills `aliases` with `getZoneAbbreviations`. `timeZoneAbbreviations.ts` and its test are deleted.
- `createCompositeCitySearch` drops the table-order branch: abbreviation results sort by rank, then collator, like the other kinds (FR11). The query is still normalized once and one collator is built (NFR-P3).
- `SearchPresentationContext` gets `translate`; `PresentedSearchResult.matchedAbbreviation` is replaced by `abbreviationPair?: readonly { text: string; isMatched: boolean }[]`, built only for abbreviation matches from `getZoneAbbreviations` and `formatZoneAbbreviation`. The zone label is not read (FR15).
- `LocationSearchResults.tsx` renders the pair joined by " / ", the matched one in `font-bold text-foreground`, the other in `font-normal text-muted-foreground` (NFR-A2, UX3).

### D9. Where each test lives

- Pure extraction, model, presenter, reducer, parsing, migration: Vitest next to the code, and the extraction test under `src/test/zoneData/` (Vitest includes only `src/`).
- Business rules visible as text: unit BDD (`zone_abbreviations_unit.feature`, `locations_zone_line_unit.feature`, `settings_zone_label_unit.feature`, `location_search_by_abbreviation.feature`, the time-selection hint scenarios).
- Work bounds: unit BDD with `startWorkCount()` and `startZoneLookupCount()`; timing in `src/test/benchmarks/zoneLine.bench.ts` (ADR-0008).
- Accessible names, pressed state, keyboard, layout, overflow, axe-core, screenshots: playwright-bdd `*_e2e.feature` (`.claude/rules/bdd-unit.md` table).

## Consequences

Positive:

- Cards and search name zones the way invitations do, from one offline table, with no network and no new runtime dependency.
- The zone abbreviation, the zone line and the zone label each have one owner (D2, D5, D4), reused by the rows, the device time location, the wall-time hint, the settings example and the search.
- The next compact setting reuses `SettingsToggleGroup` (FR16).

Negative:


- [The browser's rules and tzdb disagree for a zone] → the pair still comes from tzdb and the half from the browser; at worst the card shows the other abbreviation of the pair. Accepted under ADR-0003's known limitation.
- [`moment-timezone` lags tzdb] → its data version is pinned by the lockfile; updating the package refreshes the table. `ZONE_ABBREVIATION_RULES_YEAR` is a constant to bump with it.
- [A zone that changes its rules during 2026] → only the last two offsets are kept; a moment before the change may show the abbreviation of the same half under the new rules.
- [Removing `ET`, `PT` and other invented abbreviations] → stated as **BREAKING** in the proposal; the cities are still found by name. The same holds for `GMT` → the `UTC` zone (tzdb abbreviation `UTC`) and `BST` → Dhaka (tzdb `+06`): both are found by name, not by those abbreviations.

## Alternatives Considered

- **`Intl.DateTimeFormat` with `timeZoneName: "short"`.** Rejected: `.claude/rules/temporal.md` forbids `Intl` abbreviations for search, ADR-0003 calls them locale-dependent, and they are `GMT+5:30` for most zones (FR1).
- **Keep and extend the hand-written table.** Rejected: FR8 requires tzdb, and a hand table drifts.
- **Key the table by UTC offset** (`{ "-300": "EST", "-240": "EDT" }`). Rejected: it stores offsets, against `.claude/rules/temporal.md`.
- **Ship tzdb transitions and look the period up.** Rejected: that is shipping our own tzdata (ADR-0003 "Alternatives"), and its rules could disagree with the browser's offset on the same card.
- **Put the table into the lazily fetched `city-search.json`.** Rejected: cards would wait for the search data, and FR4 requires the abbreviation on the first render.
- **Parse raw tzdb sources (`tzdata`-style packages).** Rejected: it means reimplementing `zic` rules and `%s` formats; `moment-timezone` data is already compiled.
- **Two booleans in the preferences (`isUtcOffsetShown`, `isZoneAbbreviationShown`).** Rejected: the toggle group (D7) works on a set of values; an enum set keeps one shape for future toggle settings.
- **A new radio group per combination (four options).** Rejected: it is the long layout the task wants to avoid, and it cannot grow to a third part.
- **Writing the ADR-0003 abbreviation note anew.** Not needed: ADR-0003 already requires "our own mapping" for search and forbids `Intl` abbreviations for matching; a generated mapping is still our own, and no zone rules are shipped. No `Accepted` ADR is contradicted, so no ADR change is part of this change.

## Migration Plan

Preferences schema version 2 → 3, step `2` in `createPreferencesMigrations`, covered by fixture tests (ADR-0004). No change to the locations document.
