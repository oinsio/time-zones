# Review: show-zone-abbreviations-and-zone-label-setting

## Summary

| Item | Value |
|---|---|
| Tasks verified | 34/34 |
| Requirements traced | 140/140 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 2 |

## Tasks

Paths under `packages/client/` unless they start with `docs/`.

- ✅ 1.1 Glossary and docs: `docs/glossary/time.md:21-22` (Zone abbreviation, Abbreviation pair), `docs/glossary/locations.md:13` (Zone line), `docs/glossary/settings.md:10-11` (Zone label, Toggle group), `docs/glossary/search.md:10` (owner `getZoneAbbreviations`, no `timeZoneAbbreviations`), `docs/glossary/date-selection.md:10` («(EDT, UTC−4)», `isZoneAbbreviationShown`), `docs/architecture/domain-model.md:30,42`; largest glossary file is far under 200 lines.
- ✅ 2.1 `package.json` devDependency `moment-timezone ^0.6.6`; it is required only from `scripts/zoneData/zoneDataPlugin.ts` (`ZONE_ABBREVIATIONS_PACKAGE`), never from `src/`.
- ✅ 2.2 `src/test/zoneData/extractZoneAbbreviations.test.ts` (fixtures with `it.each`: pairs, single, numeric, `["", "XDT"]`, pre-2026 periods, three offsets, unknown zone, `ChST` vs `+0530`, year bounds at lines 108/118).
- ✅ 2.3 `scripts/zoneData/extractZoneAbbreviations.ts` (`ZONE_ABBREVIATION_RULES_YEAR`, `LETTERS_ONLY_DESIGNATION`), `zoneDataPlugin.ts` (`virtual:zone-abbreviations`, `readTzdbZonePeriods` negates minutes-west offsets), `src/vite-env.d.ts` module declaration.
- ✅ 2.4 `src/test/zoneData/zoneAbbreviationTable.test.ts` real-data pairs, absent zones, removed abbreviations, IST zones, gzip budget at line 63.
- ✅ 3.1 `src/model/zoneAbbreviation.test.ts` and `src/model/zoneAbbreviation.slots.test.ts` (mocked `["", "XDT"]` entry).
- ✅ 3.2 `src/model/zoneAbbreviation.ts` (`getZoneAbbreviations`, `getZoneAbbreviation`, `JANUARY`/`JULY` constants, `offsetNanoseconds` numbers, no `Date`/BigInt), exported from `src/model/index.ts`.
- ✅ 4.1 `src/preferences/preferences.zoneLabel.test.ts`, `src/preferences/preferences.test.ts`, `src/adapters/preferencesDocument.zoneLabel.test.ts` (v2 → v3 migration, v1 both steps, v3 round-trip, v4 unreadable).
- ✅ 4.2 `src/preferences/preferences.ts` (`ZoneLabelPart`, default both parts), `preferencesCommands.ts` (`SET_ZONE_LABEL_PART`, same object when unchanged), `parseStoredPreferences.ts` (`isZoneLabelParts`), `src/constants/preferences.ts` (`PREFERENCES_SCHEMA_VERSION = 3`), `src/adapters/preferencesDocument.ts` (step `2`, serialization).
- ✅ 4.3 `src/controller/preferencesContext.ts`, `PreferencesProvider.tsx` (`setZoneLabelPart`), `src/controller/useZoneLabelParts.ts`; tests `PreferencesProvider.zoneLabel.test.tsx`, `useZoneLabelParts.test.tsx`.
- ✅ 5.1 `src/presenter/zoneAbbreviation.test.ts`, `src/presenter/zoneLine.test.ts`, `src/presenter/wallTimeHint.test.ts` (overlap with/without abbreviation).
- ✅ 5.2 `src/constants/zoneAbbreviations.ts` (`LOCALIZED_ZONE_ABBREVIATION_KEYS`), `ZONE_LABEL_EXAMPLE` in `src/constants/preferences.ts`, `src/presenter/zoneAbbreviation.ts`, `src/presenter/zoneLine.ts`, `wallTimeHint.ts` (`{{zone}}`), all locale keys in both `src/locales/en.json` and `ru.json`.
- ✅ 5.3 `src/presenter/presentLocationRows.zoneLine.test.ts`, `presentLocationRows.deviceTime.test.ts`; `presentZoneMoment.ts` (`zoneAbbreviationLabel`, hint inputs), `presentLocationRows.ts` (`zoneLineParts`, no `metaLabel`).
- ✅ 6.1 `src/adapters/city-search/abbreviationSource.test.ts`, `createCompositeCitySearch.results.test.ts` (London/Dhaka added to `compositeCityFixtures.ts`), `src/presenter/presentSearchResults.test.ts`.
- ✅ 6.2 `abbreviationSource.ts` reads `getZoneAbbreviations`, `zoneCitiesSource.ts` aliases, table-order branch removed from `createCompositeCitySearch.ts`, `presentSearchResults.ts` `abbreviationPair`, `useCitySearch.ts` passes `t`; `timeZoneAbbreviations.ts` and its test deleted.
- ✅ 7.1 `src/views/shared/ZoneRowContent.tsx:96-113`, `LocationRow.tsx:164`; tests `LocationRow.test.tsx:33-46` (nowrap, no `truncate`, no `·`), `LocationRow.deviceTime.test.tsx`, `LocationRow.countryless.test.tsx`.
- ✅ 7.2 `src/views/shared/LocationSearchResults.tsx:71-89`; `LocationSearchDialog.test.tsx:51-54`.
- ✅ 7.3 `src/app/settings/SettingsToggleGroup.tsx`, `SettingsToggleGroup.test.tsx`.
- ✅ 7.4 `src/controller/useZoneLabelExample.ts` (+ test with `fakeClock`), `src/app/settings/ZoneLabelGroup.tsx`, `SettingsPage.tsx` renders it before the language group; `SettingsPage.test.tsx:145` (group order) and `:179` (example text).
- ✅ 8.1 `src/test/features/zone_abbreviations/zone_abbreviations_unit.feature` + `steps/zone_abbreviations_unit.steps.tsx`.
- ✅ 8.2 `src/test/features/locations/locations_zone_line_unit.feature` + steps; device time features updated with `@FR6` (`locations_device_time_unit.feature:6,26,36,85`, `locations_device_time_data_unit.feature:62`).
- ✅ 8.3 `location_search_by_abbreviation.feature` rewritten + `.steps.tsx`; `location_search_ranking.feature`; `location_search_performance.feature` "Abbreviation query within the work bound".
- ✅ 8.4 `src/test/features/settings/settings_zone_label_unit.feature` + steps; `settings_storage_unit.feature:27` and `settings_language_storage_unit.feature:6` tagged `@FR15`.
- ✅ 8.5 `time_selection_wall_time_input_unit.feature:147,166,175` with `wallTimeHintScenarios.ts`.
- ✅ 8.6 `src/test/zoneLookupCounter.ts:14,60` (`adjustmentsIn`), `zoneLookupCounter.test.ts`, `locations_zone_line_budget_unit.feature` + steps (`lookupsIn + adjustmentsIn`).
- ✅ 8.7 `src/test/benchmarks/zoneLine.bench.ts`.
- ✅ 9.1 `locationsE2eHelpers.ts` Adelaide/St. Vincent; `locations_zone_line_e2e.feature` + `steps/locations_zone_line_e2e.steps.ts`.
- ✅ 9.2 `settings_zone_label_e2e.feature` + steps (size, focus outline, check icon, rows, no layout jump, axe); `settings_e2e.feature` "Both languages" with zone label columns.
- ✅ 9.3 `locations_ui_e2e.feature:69-93` (IST order + 4 results, axe outline for IST results, pair in accessible name).
- ✅ 9.4 `@NFR-R3` tags in `locations_ui_e2e.feature:157`, `locations_12_hour_screenshots_e2e.feature:7`, `settings_e2e.feature:88`, `settings_language_e2e.feature:119`; 54 re-approved PNGs in the diff (list, device-time, IST results, settings, language). The settings and IST-results 375 px screenshots show the zone label group with its example and `IST`, `GMT / IST`, `IST / IDT`. `locations_device_time_zone_e2e.feature` has no screenshot outline of its own.
- ✅ 9.5 The E2E expectations for the old meta line, hint and IST order are updated (see 8.2, 8.5, 9.3); CI is green.
- ✅ 10.1 Re-measured here: every listed file scores ≥ 93 % (see Mutation).
- ✅ 10.2 Every changed file is under the 300-line hard cap. CI (typecheck, lint, test, build, bundle size) is green.
- ✅ 10.3 Every id carries a `show-zone-abbreviations-and-zone-label-setting` link in `src/` or `scripts/`. `grep -rn timeZoneName` in production code finds nothing, and no *Never:* word appears in the new files.

## Requirements

- ✅ FR1 — `scripts/zoneData/extractZoneAbbreviations.ts` (`LETTERS_ONLY_DESIGNATION`), `src/model/zoneAbbreviation.ts`; tests `extractZoneAbbreviations.test.ts`, `zoneAbbreviationTable.test.ts`, `zone_abbreviations_unit.feature` (`@FR1`).
- ✅ FR2 — `getZoneAbbreviation` January/July comparison (`src/model/zoneAbbreviation.ts:28-52`); `zoneAbbreviation.test.ts`, `zone_abbreviations_unit.feature` outline + clock-change scenario.
- ✅ FR3 — `src/presenter/zoneAbbreviation.ts`, `LOCALIZED_ZONE_ABBREVIATION_KEYS`, `zoneAbbreviationMsk` in both locales; `zoneAbbreviation.test.ts`, BDD "Moscow in Russian and English".
- ✅ FR4 — bundled `virtual:zone-abbreviations` read by model, rows and search; BDD "Available on the first render offline".
- ✅ FR5 — `presentZoneLine` (`src/presenter/zoneLine.ts:39-61`) incl. UTC de-duplication; `zoneLine.test.ts`, `locations_zone_line_unit.feature`.
- ✅ FR6 — `presentLocationRows.ts` place text `locations.deviceTimeMeta`; "Meta line follows the zone label" and the updated device time features.
- ✅ FR7 — `wallTimeHint.ts:52-62`, `isZoneAbbreviationShown` from `presentZoneMoment.ts`; `wallTimeHint.test.ts`, `time_selection_wall_time_input_unit.feature:147,166,175`.
- ✅ FR8 — `abbreviationSource.ts` reads the table; outlines for the removed abbreviations and the London/UTC, London/Dhaka cases in `location_search_by_abbreviation.feature`.
- ✅ FR9 — whole-query upper-case map lookup in `abbreviationSource.ts`; "Either half of the year", "Partial abbreviation…".
- ✅ FR10 — `presentSearchResults.ts` `abbreviationPair`, `LocationSearchResults.tsx` " / " join; "The matched half of a pair is emphasised".
- ✅ FR11 — rank/collator order for abbreviation results (`createCompositeCitySearch.ts`); "Ambiguous abbreviation with its pairs", `locations_ui_e2e.feature:69`.
- ✅ FR12 — `ZoneLabelGroup.tsx`, `SettingsToggleGroup.tsx`, `SettingsPage.tsx`; `SettingsPage.test.tsx:145`, `settings_e2e.feature` "Both languages".
- ✅ FR13 — `reduceZoneLabelPart` allows none; `useLocations` passes `zoneLabelParts`; "Both off leaves the country", "A change applies to every row at once".
- ✅ FR14 — `presentZoneLabelExample`, `useZoneLabelExample`; "The example follows the toggles".
- ✅ FR15 — default both parts, migration step `2`, parsing, storage/channel; "Existing users get both parts", "Another tab…", "The zone label does not change the search".
- ✅ FR16 — generic `SettingsToggleGroup<Value>`; `SettingsToggleGroup.test.tsx`, "A group with three options".
- ✅ NFR-P1 — `locations_zone_line_budget_unit.feature` (no formatter, no transition lookup; per-row lookups via `adjustmentsIn`), `zoneLine.bench.ts`.
- ✅ NFR-P2 — gzip ≤ 5 KB assertion `zoneAbbreviationTable.test.ts:63`; `scripts/check-bundle-size.mjs:18,27` budgets.
- ✅ NFR-P3 — `location_search_performance.feature` "Abbreviation query within the work bound".
- ✅ NFR-A1 — `SettingsToggleGroup.tsx` (`role="group"`, `aria-labelledby`/`aria-describedby`, `aria-pressed`, `min-h-11 min-w-11`, check icon, focus outline); `settings_zone_label_e2e.feature` names, keyboard, size/focus/icon, axe.
- ✅ NFR-A2 — `font-bold` vs `font-normal` + colour in `LocationSearchResults.tsx:78-82`; `locations_ui_e2e.feature:76-93`.
- ✅ NFR-R1 — `whitespace-nowrap` on abbreviation/offset, no truncation (`ZoneRowContent.tsx:96-113`); `locations_zone_line_e2e.feature` (5 widths, Adelaide + St. Vincent).
- ✅ NFR-R2 — `flex flex-wrap … justify-between` row with `flex-nowrap` toggles; "One row on wide screens", "Narrow screens" (320/375/2560 px).
- ✅ NFR-R3 — re-approved PNGs and `@NFR-R3` tags (task 9.4).
- ✅ UX1 — zone line parts share the line style, `gap-x-2`, no separator; `LocationRow.test.tsx:46`, "Unknown elements leave nothing behind".
- ✅ UX2 — check-icon slot keeps its box (`SettingsToggleGroup.tsx:64-68`); "Toggling does not move the toggles", "A change applies to every row at once".
- ✅ UX3 — only the matched abbreviation is `font-bold text-foreground`; `LocationSearchDialog.test.tsx:51-54`, "The matched half of a pair is emphasised".
- ✅ M1 — `zone_abbreviations_unit.feature` outline `@M1` + Moscow scenario.
- ✅ M2 — "Ambiguous abbreviation with its pairs" (unit) and `locations_ui_e2e.feature:69` ("4 results").
- ✅ M3 — outlines "Abbreviations outside tzdb no longer match" and "Zones that tzdb names otherwise are no longer found".
- ✅ M4 — "The zone label decides the elements" and "The example follows the toggles" outlines.
- ✅ M5 — `locations_zone_line_e2e.feature` outline over 5 widths.
- ✅ M6 — `preferencesDocument.zoneLabel.test.ts` v2 fixture; "Existing users get both parts".
- ✅ M7 — axe outlines in `settings_zone_label_e2e.feature` and `locations_ui_e2e.feature:77`.
- ✅ M8 — `zoneAbbreviationTable.test.ts:63`, `check-bundle-size.mjs`.
- ✅ M9 — measured in this review: every file of task 10.1 ≥ 93 % (see Mutation).
- ✅ Scenario: Ambiguous abbreviation — `location_search_by_abbreviation.feature:6`.
- ✅ Scenario: Single-zone abbreviation — `location_search_by_abbreviation.feature:11`.
- ✅ Scenario: Either half of the year — `location_search_by_abbreviation.feature:16`.
- ✅ Scenario: Zones without a clock change — `location_search_by_abbreviation.feature:21`.
- ✅ Scenario: Abbreviations outside tzdb no longer match — `location_search_by_abbreviation.feature:26`.
- ✅ Scenario: Zones that tzdb names otherwise are no longer found — `location_search_by_abbreviation.feature:42`.
- ✅ Scenario: Partial abbreviation does not match by abbreviation — `location_search_by_abbreviation.feature:53`.
- ✅ Scenario: The zone label does not change the search — `location_search_by_abbreviation.feature:58`.
- ✅ Scenario: Abbreviation before city prefix — `location_search_ranking.feature`.
- ✅ Scenario: Ambiguous abbreviation with its pairs — `location_search_by_abbreviation.feature:65`.
- ✅ Scenario: The matched half of a pair is emphasised — `location_search_by_abbreviation.feature:73`.
- ✅ Scenario: Russian spelling in the result — `location_search_by_abbreviation.feature:81`.
- ✅ Scenario: City before country — `location_search_ranking.feature` (unchanged).
- ✅ Scenario: One entry per zone — `location_search_ranking.feature` (unchanged; `keepFirstResultPerZone`).
- ✅ Scenario: Result limit — `location_search_ranking.feature` (unchanged).
- ✅ Scenario: Accessibility check — `locations_ui_e2e.feature:77` adds the IST results in both themes; the other states are covered by the existing axe steps (unchanged).
- ✅ Scenario: Phone layout — `locations_ui_e2e.feature:130` (unchanged).
- ✅ Scenario: Wide layout — `locations_ui_e2e.feature:137` (unchanged).
- ✅ Scenario: Screenshots — `locations_ui_e2e.feature:158` rows "suggestions" and "IST results", PNGs re-approved.
- ✅ Scenario: The pair is in the result's name — `locations_ui_e2e.feature:89`.
- ✅ Scenario: Query timing — `location_search_performance.feature` (unchanged).
- ✅ Scenario: Data loads only when the search opens — `locations_ui_e2e.feature:34` (unchanged).
- ✅ Scenario: The Here entry's request is the only one — `locations_ui_e2e.feature:43` "The device time location's request is the only one" (unchanged).
- ✅ Scenario: Bundle budget — `scripts/check-bundle-size.mjs:18,27` (unchanged).
- ✅ Scenario: Abbreviation query within the work bound — `location_search_performance.feature` + `location_search_performance.steps.ts`.
- ✅ Scenario: Country, abbreviation and offset — `locations_zone_line_unit.feature:6`.
- ✅ Scenario: The zone label decides the elements — `locations_zone_line_unit.feature:15`.
- ✅ Scenario: The abbreviation follows the reference moment — `locations_zone_line_unit.feature:31`.
- ✅ Scenario: Unknown elements leave nothing behind — `locations_zone_line_unit.feature:40`.
- ✅ Scenario: UTC with the zone abbreviation only — `locations_zone_line_unit.feature:48`.
- ✅ Scenario: A change applies to every row at once — `locations_zone_line_unit.feature:57`.
- ✅ Scenario: No overflow and no clipping — `locations_zone_line_e2e.feature:6`.
- ✅ Scenario: Wrapping between elements only — `locations_zone_line_e2e.feature:26`.
- ✅ Scenario: Re-approved screenshots — `locations_ui_e2e.feature:157-158`, `locations_12_hour_screenshots_e2e.feature:7`, re-approved PNGs.
- ✅ Scenario: 50 rows within the work bound — `locations_zone_line_budget_unit.feature`.
- ✅ Scenario: Extra zone lookups per row — `locations_zone_line_budget_unit.feature` + `zoneLookupCounter.ts` `adjustmentsIn`.
- ✅ Scenario: Whole-hour zone — `locations_utc_offset_unit.feature` (unchanged).
- ✅ Scenario: Half-hour zone — `locations_utc_offset_unit.feature` (unchanged).
- ✅ Scenario: 45-minute zone — `locations_utc_offset_unit.feature` (unchanged).
- ✅ Scenario: Daylight saving time is respected — `locations_utc_offset_unit.feature` (unchanged).
- ✅ Scenario: Zero offset — `locations_utc_offset_unit.feature` (unchanged).
- ✅ Scenario: Offset is computed again when the list changes — `locations_utc_offset_unit.feature` (unchanged).
- ✅ Scenario: Offset is computed again at the minute boundary — `locations_clock_tick.feature` (unchanged).
- ✅ Scenario: Offset that cannot be computed — `locations_utc_offset_unit.feature` (unchanged).
- ✅ Scenario: Offset hidden by the zone label — `locations_zone_line_unit.feature:65`.
- ✅ Scenario: Device time location on the design sample — `locations_device_time_unit.feature:6` (updated parts, `@FR6`).
- ✅ Scenario: The device moves to another zone — `locations_device_time_unit.feature:26`.
- ✅ Scenario: Unknown device time zone — `locations_device_time_unit.feature:36`.
- ✅ Scenario: Meta line follows the zone label — `locations_zone_line_unit.feature:73`.
- ✅ Scenario: Derived city first, exemplar city after loading — `locations_device_time_data_unit.feature`.
- ✅ Scenario: Loading fails — `locations_device_time_data_unit.feature`.
- ✅ Scenario: No load without the device time location — `locations_device_time_data_unit.feature`.
- ✅ Scenario: One request for city labels and the device time location — `locations_device_time_data_unit.feature:42`.
- ✅ Scenario: Renamed device time zone — `locations_device_time_data_unit.feature:62` (`@FR6`).
- ✅ Scenario: Both languages (locations: device time strings) — `locations_device_time_unit.feature:85` (`@FR6`).
- ✅ Scenario: Both parts by default — `settings_zone_label_unit.feature:6`.
- ✅ Scenario: The example follows the toggles — `settings_zone_label_unit.feature:14`.
- ✅ Scenario: Both off leaves the country — `settings_zone_label_unit.feature:29`.
- ✅ Scenario: A toggle writes the preferences once — `settings_zone_label_unit.feature:37`.
- ✅ Scenario: A group with three options — `settings_zone_label_unit.feature:67`, `SettingsToggleGroup.test.tsx`.
- ✅ Scenario: Names and pressed state — `settings_zone_label_e2e.feature:6`.
- ✅ Scenario: Toggle with the keyboard — `settings_zone_label_e2e.feature:13`.
- ✅ Scenario: Toggle size, focus and pressed icon — `settings_zone_label_e2e.feature:23`.
- ✅ Scenario: No violations with the zone label group — `settings_zone_label_e2e.feature:32`.
- ✅ Scenario: Toggling does not move the toggles — `settings_zone_label_e2e.feature` outline at 375/1024 px.
- ✅ Scenario: One row on wide screens — `settings_zone_label_e2e.feature` outline at 640 (ru)/1024 (en).
- ✅ Scenario: Narrow screens — `settings_zone_label_e2e.feature` outline at 320/375/2560 px.
- ✅ Scenario: Open and leave settings — `settings_e2e.feature` (unchanged); group order in `SettingsPage.test.tsx:145`.
- ✅ Scenario: Esc leaves settings — `settings_e2e.feature` (unchanged).
- ✅ Scenario: Notices on the settings page — `SettingsPage.test.tsx:200` (unchanged).
- ✅ Scenario: Choices survive a reload — `settings_e2e.feature` (unchanged).
- ✅ Scenario: The language survives a reload — `settings_language_unit.feature` (unchanged).
- ✅ Scenario: Opening writes nothing — `settings_preferences_unit.feature` (unchanged).
- ✅ Scenario: Offline reopen — `settings_e2e.feature` (unchanged).
- ✅ Scenario: Migration of the previous document — `settings_language_storage_unit.feature:6` (`@FR15`, version 3).
- ✅ Scenario: Legacy key without a document — `settings_language_storage_unit.feature` (unchanged).
- ✅ Scenario: The zone label survives a reload — `settings_zone_label_unit.feature:44`.
- ✅ Scenario: Existing users get both parts — `settings_zone_label_unit.feature:52`.
- ✅ Scenario: Another tab changes the zone label — `settings_zone_label_unit.feature:60`.
- ✅ Scenario: Corrupted preferences — `settings_storage_unit.feature:27` (`@FR15`).
- ✅ Scenario: Reset — `settings_storage_unit.feature` (unchanged).
- ✅ Scenario: Reset returns to the browser language — `settings_language_storage_unit.feature` (unchanged).
- ✅ Scenario: Both languages (settings strings) — `settings_e2e.feature` "Both languages" outline with zone label columns and the step in `settings_e2e.steps.ts`.
- ✅ Scenario: The factory name is never translated — `settings_factory_name.feature:7` (unchanged).
- ✅ Scenario: Narrow and wide screens — `settings_language_e2e.feature` (unchanged) and `settings_zone_label_e2e.feature` "Narrow screens".
- ✅ Scenario: Approved screenshots — `settings_e2e.feature:87-88` (`@NFR-R3`), four settings PNGs re-approved.
- ✅ Scenario: Collapsed group — `settings_language_e2e.feature` (unchanged).
- ✅ Scenario: Expand and collapse — `settings_language_e2e.feature` (unchanged).
- ✅ Scenario: Names are not translated — `settings_language_unit.feature` (unchanged).
- ✅ Scenario: Choosing Russian applies at once — `settings_language_unit.feature` (unchanged).
- ✅ Scenario: Hint for a DST gap — `time_selection_wall_time_input_unit.feature:136`.
- ✅ Scenario: Hint for a DST overlap — `time_selection_wall_time_input_unit.feature:147` ("(EDT, UTC−4)").
- ✅ Scenario: Hint texts in Russian for a DST gap — `time_selection_wall_time_input_unit.feature:157`.
- ✅ Scenario: Hint texts in English for a DST overlap — `time_selection_wall_time_input_unit.feature:166`.
- ✅ Scenario: Overlap hint without the abbreviation — `time_selection_wall_time_input_unit.feature:175`.
- ✅ Scenario: The abbreviation follows the moment — `zone_abbreviations_unit.feature:6`.
- ✅ Scenario: The abbreviation changes at the clock change — `zone_abbreviations_unit.feature:25`.
- ✅ Scenario: Numeric designations are no abbreviation — `zone_abbreviations_unit.feature:31`.
- ✅ Scenario: Unknown zone — `zone_abbreviations_unit.feature:43`.
- ✅ Scenario: Abbreviation pairs — `zone_abbreviations_unit.feature:48`.
- ✅ Scenario: Available on the first render offline — `zone_abbreviations_unit.feature:62`.
- ✅ Scenario: Table size — `zoneAbbreviationTable.test.ts:63` (≤ 5 KB gzipped) and `check-bundle-size.mjs:18` (150 KB).
- ✅ Scenario: Moscow in Russian and English — `zone_abbreviations_unit.feature:69`.
- ✅ Scenario: Other abbreviations stay Latin in Russian — `zone_abbreviations_unit.feature:78`.

## Mutation

Measured in this review with `npx stryker run --mutate '<files>'` from `packages/client/`, in four scoped runs of five files, one at a time:

| File | Score |
|---|---|
| `scripts/zoneData/extractZoneAbbreviations.ts` | 95.65 % (2 survivors: the `"UTC"` literal and `{}` of the year-start helper, both equivalent) |
| `src/model/zoneAbbreviation.ts` | 100 % |
| `src/presenter/zoneAbbreviation.ts` | 100 % |
| `src/presenter/zoneLine.ts` | 93.33 % (2 NoCoverage: the `""` fallbacks in `presentZoneLabelExample` for a missing abbreviation or offset, unreachable for the constant Kolkata example) |
| `src/presenter/wallTimeHint.ts` | 100 % |
| `src/preferences/preferencesCommands.ts` | 100 % |
| `src/preferences/parseStoredPreferences.ts` | 100 % |
| `src/adapters/preferencesDocument.ts` | 96.15 % |
| `src/adapters/city-search/abbreviationSource.ts` | 100 % |
| `src/adapters/city-search/createCompositeCitySearch.ts` | 97.67 % |
| `src/presenter/presentLocationRows.ts` | 100 % |
| `src/presenter/presentZoneMoment.ts` | 100 % |
| `src/presenter/presentSearchResults.ts` | 100 % |
| `src/controller/useZoneLabelExample.ts` | 100 % |
| `src/controller/useZoneLabelParts.ts` | 100 % |
| `src/app/settings/SettingsToggleGroup.tsx` | 100 % |
| `src/app/settings/ZoneLabelGroup.tsx` | 100 % |
| `src/adapters/city-search/zoneCitiesSource.ts` | 98.90 % |
| `src/views/shared/LocationSearchResults.tsx` | 100 % |
| `src/views/shared/ZoneRowContent.tsx` | 100 % |

Every file is at or above the 90 % minimum. No survivor points to an untested requirement.

## Findings

### R1 — SUGGESTION — Wrong requirement ids in the search pair traceability links
- Location: `packages/client/src/presenter/presentSearchResults.ts:37`
- Rule: `.claude/rules/traceability.md`
- Problem: `presentSearchResults.ts:37` reads "Implements FR10, FR12, FR13, UX3 of show-zone-abbreviations-and-zone-label-setting (D8)", and `packages/client/src/views/shared/LocationSearchResults.tsx:23` reads "Implements FR10, FR12, FR13, NFR-A2, UX3 …". In the proposal, FR12 is the settings "Zone label" group and FR13 is "both toggles may be off". Neither concerns the search result pair. The requirement these files implement besides FR10 is FR11 (ambiguous abbreviation, each zone with its own pair).
- Impact: The traceability rule says "If the reference is not explicit, it does not exist" and that coverage is checked with `grep`. A grep for FR12/FR13 counts these search files as implementing the settings group, and a grep for FR11 misses them. A later reader or audit following the links lands in the wrong place.
- Fix: In both JSDoc lines, replace `FR12, FR13` with `FR11` (keep FR10, NFR-A2 and UX3).
- Fix risk: none. This is a comment-only change. FR12 and FR13 stay covered by `ZoneLabelGroup.tsx`, `SettingsToggleGroup.tsx` and the settings features, so task 10.3's id grep still passes.
- Status: fixed
- Resolution: replaced FR12, FR13 with FR11 in the JSDoc of presentSearchResults.ts and LocationSearchResults.tsx; comment-only, FR10/NFR-A2/UX3 kept.

### R2 — SUGGESTION — The zone line markup is rendered by two components
- Location: `packages/client/src/app/settings/ZoneLabelGroup.tsx:39-52`
- Rule: `.claude/rules/architecture.md` ("Reuse `views/shared/` blocks instead of duplicating them per view"), `.claude/rules/glossary.md` ("A UI block every view needs → one component in `views/shared/`")
- Problem: `ZoneLabelGroup` renders the example's zone line parts with its own copy of the markup in `ZoneRowContent.tsx:96-113`: a `data-zone-line` `flex flex-wrap gap-x-2` span, one span per part keyed by `part.kind`, and `whitespace-nowrap` on every kind but `PLACE`. The glossary's **Zone line** concept is therefore rendered by two components. FR14 requires the example to show the zone line itself.
- Impact: The NFR-R1 layout rule (abbreviation and offset never break, place wraps) lives in two places. A later change to the zone line's rendering, such as a new part kind or another wrap rule, must be made twice. If it is not, the settings example stops matching the card. The settings E2E checks do not catch this, because they assert text, not wrapping.
- Fix: Extract a `ZoneLine` component in `packages/client/src/views/shared/` (exported from its `index.ts`) that takes `parts: readonly ZoneLinePart[]` and an optional `className`. Use it in `ZoneRowContent.tsx`, with `text-sm text-muted-foreground`, and in `ZoneLabelGroup.tsx`. Code under `app/` may already import from `@/views/shared`; `app/AppShell.tsx:15` does. Keep the existing component tests passing.
- Fix risk: `ZoneLabelGroup` adds a `{" "}` text node after each part, which `SettingsPage.test.tsx:179` relies on ("Example: India IST UTC+5:30"). The card markup has no such spaces. The shared component must keep a separator space, or the test must match the parts. Adding spaces to the card changes its `textContent`, so recheck the row tests and the screenshot steps. Extra whitespace nodes in a flex container do not render, so the screenshots should not change.
- Status: fixed
- Resolution: extracted shared ZoneLine in views/shared/ZoneLine.tsx, used by ZoneRowContent and ZoneLabelGroup (isTextSeparated keeps the space nodes for the example description); covered by LocationRow.test.tsx and SettingsPage.test.tsx "Example: India IST UTC+5:30".

## Verdict

Ready. There are no CRITICAL or WARNING findings, so nothing blocks. R1 and R2 are low-stakes suggestions.
