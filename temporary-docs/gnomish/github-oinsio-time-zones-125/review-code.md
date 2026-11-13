# Review: add-country-to-zone-label

## Summary

| Item | Value |
|---|---|
| Tasks verified | 22/22 |
| Requirements traced | 65/65 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 2 |

## Tasks

Paths are relative to `packages/client/` unless they start with `docs/` or `openspec/`.

- ✅ 1.1 Glossary and domain model updated: `docs/glossary/settings.md:10` (Zone label with «Страна», "City only", `settings.zoneLabelCountry`, `settings.zoneLabelExampleCityOnly`), `docs/glossary/locations.md:13` (Zone line, "which the zone label never hides"), `docs/architecture/domain-model.md:35` (`COUNTRY | ZONE_ABBREVIATION | UTC_OFFSET, each optional`).
- ✅ 2.1 RED tests: `src/preferences/preferences.zoneLabel.test.ts` (defaults with three parts, `SET_ZONE_LABEL_PART` on `COUNTRY`, parse accepts/rejects), `src/constants/preferences.test.ts` asserts `ZONE_LABEL_PART_ORDER` = `[COUNTRY, ZONE_ABBREVIATION, UTC_OFFSET]`.
- ✅ 2.2 `src/preferences/preferences.ts:25` adds `COUNTRY` as the last enum member, JSDoc at `:33`; `src/constants/preferences.ts:23-27` order and JSDoc citing FR2.
- ✅ 3.1 `src/adapters/preferencesDocument.zoneLabel.test.ts:74-160`: schema version 5, version 4 fixtures (`it.each`, line 78) keep theme/hour format/language/view, versions 3, 2, 1 (`it.each`, line 108), version 5 round trip without the country (line 128), duplicate/non-array cases (line 147).
- ✅ 3.2 `src/constants/preferences.ts:5` `PREFERENCES_SCHEMA_VERSION = 5`; `src/adapters/preferencesDocument.ts:34-43` step 4 appends `COUNTRY` only to an array without it; JSDoc lines 14-15, 20.
- ✅ 4.1 `src/presenter/zoneLine.test.ts` (117 → 180 lines) covers 8 combinations with and without `isDeviceTimeMeta`; `src/presenter/presentLocationRows.zoneLine.test.ts` covers the city row without `PLACE`, the device time row keeping "Device time", unchanged `countryName`.
- ✅ 4.2 `src/presenter/zoneLine.ts:36-37` (`isDeviceTimeMeta`), `:59-60` (`isPlaceShown`), `:25-27` zone parts without `COUNTRY`; `src/presenter/presentLocationRows.ts:82` passes `isDeviceTime`; `zoneLine.ts:117` passes `false` for the example.
- ✅ 5.1 `src/locales/en.json:154,157` and `src/locales/ru.json:154,157` (`zoneLabelCountry`, `zoneLabelExampleCityOnly`: "Country"/«Страна», "City only"/«Только город»).
- ✅ 5.2 `src/app/settings/ZoneLabelGroup.test.tsx` (order, Country removes "Russia", "Example: City only" with no `[data-zone-line]`); `src/app/settings/SettingsToggleGroup.test.tsx` asserts `flex-wrap`.
- ✅ 5.3 `src/app/settings/ZoneLabelGroup.tsx:13` maps `COUNTRY`, `:43-47` renders "City only" when the example is empty; `src/app/settings/SettingsToggleGroup.tsx:52` `flex flex-wrap gap-2`; `SettingsPage.test.tsx` updated.
- ✅ 6.1 `src/test/features/locations/steps/zoneLineWorld.tsx:41-61` and `src/test/features/settings/steps/settingsE2eHelpers.ts:56-79` phrase maps name the country; `ALL_ZONE_LABEL_PARTS` includes `COUNTRY`.
- ✅ 6.2 `src/test/features/settings/settings_zone_label_unit.feature` (three toggles, 10-row example table, "Both off leaves the country", "All off leaves the city alone") and `settings_zone_label_storage_unit.feature` ("The country choice survives a reload", "Existing users keep the country", "Another tab changes the country", "A toggle writes the preferences once", "Existing users get both parts"), with step files `steps/settings_zone_label_unit.steps.tsx`, `steps/settings_zone_label_storage_unit.steps.tsx`.
- ✅ 6.3 `settings_view_mode_unit.feature:38-44` ("Existing users get Cards" expects the country and the UTC offset; steps `settings_view_mode_unit.steps.tsx:166-185`); `settings_storage_unit.feature:13-17` "The country twice" with steps in `settings_storage_unit.steps.tsx`.
- ✅ 6.4 `src/test/features/locations/locations_zone_line_unit.feature`: 8-row outline (line 15), "No zone line when every part is hidden" (line 35), "Hiding the country applies to every row at once" (line 79), 6-row "Meta line follows the zone label" (line 97); steps in `locations_zone_line_unit.steps.tsx`.
- ✅ 6.5 The whole unit suite runs in CI, which is green; the scoped Stryker run of this review executed the unit suite (≈268 tests per mutant) without an initial-run failure.
- ✅ 7.1 `src/test/features/settings/settings_zone_label_e2e.feature` holds all nine listed scenarios with the tags; steps `settings_zone_label_e2e.steps.ts` ("share one row" at line 185, "keep their position and size" at line 220).
- ✅ 7.2 `src/test/features/settings/settings_e2e.feature:45-58` "Both languages" with the `country` column and the toggles step, tagged `@add-country-to-zone-label @FR1 @UX1`.
- ✅ 7.3 The E2E scenarios exist with step definitions; CI (which runs the BDD E2E suite) is green.
- ✅ 7.4 Tags added at `settings_e2e.feature:94` and `settings_language_e2e.feature:120`; 16 settings screenshots under `src/test/features/__screenshots__/` changed in the diff; no location screenshot changed.
- ✅ 8.1 Measured in this review: 96.81% on the five changed production files (see Mutation).
- ✅ 8.2 29 `@add-country-to-zone-label` tags in feature files; every FR/NFR/UX id appears in a file mentioning the change (e.g. `zoneLine.ts:46` FR3/FR4, `ZoneLabelGroup.tsx:22` FR1/FR2/FR5/UX1, `SettingsToggleGroup.tsx:30` NFR-R1, `settings_zone_label_e2e.feature` NFR-A1, `settings_zone_label_unit.feature:41` UX2).
- ✅ 8.3 Lint, typecheck and build are part of the green CI run.

## Requirements

- ✅ FR1 — `ZoneLabelPart.COUNTRY` (`src/preferences/preferences.ts:25`), defaults all three via `Object.values`; toggle key at `ZoneLabelGroup.tsx:13`; tests `preferences.zoneLabel.test.ts`, "Both parts by default" (`settings_zone_label_unit.feature:6`).
- ✅ FR2 — `ZONE_LABEL_PART_ORDER` (`src/constants/preferences.ts:23-27`); tests `constants/preferences.test.ts`, `ZoneLabelGroup.test.tsx`, E2E "Names and pressed state" and "Tab order follows the zone line".
- ✅ FR3 — `presentZoneLine` `isPlaceShown` (`src/presenter/zoneLine.ts:59-60,72-75`); `ZoneRowContent` renders no zone line for empty parts; tests `zoneLine.test.ts` 8 combinations, `locations_zone_line_unit.feature:15,35,79`.
- ✅ FR4 — `isDeviceTimeMeta` (`zoneLine.ts:36-37,60`, `presentLocationRows.ts:82`); tests `presentLocationRows.zoneLine.test.ts`, "Meta line follows the zone label" 6 rows (`locations_zone_line_unit.feature:97`).
- ✅ FR5 — `ZoneLabelGroup.tsx:43-47` "City only", `presentZoneLabelExample` passes `false` (`zoneLine.ts:117`); tests "The example follows the toggles" (10 rows), `ZoneLabelGroup.test.tsx`, E2E "City only is the description".
- ✅ FR6 — migration step 4 (`preferencesDocument.ts:34-43`), schema version 5; tests `preferencesDocument.zoneLabel.test.ts:74-160`, `settings_zone_label_storage_unit.feature`, "The country twice" (`settings_storage_unit.feature:13`).
- ✅ NFR-A1 — the toggle reuses `SettingsToggleGroup` (aria-pressed button, check icon); E2E scenarios "Names and pressed state", "Toggle with the keyboard", "Tab order…", "Toggle size, focus and pressed icon", "City only is the description", axe 4 rows (`settings_zone_label_e2e.feature`).
- ✅ NFR-R1 — `flex-wrap` (`SettingsToggleGroup.tsx:52`); E2E "One row on wide screens", "Narrow screens", "Toggling does not move the toggles"; re-approved screenshots.
- ✅ UX1 — "Country"/«Страна» first (`locales/*.json:154`, `ZONE_LABEL_PART_ORDER`); "Both languages" (`settings_e2e.feature:45-58`), `ZoneLabelGroup.test.tsx`.
- ✅ UX2 — no empty `PLACE` part (`zoneLine.ts:77` filter) and no zone line when empty; "All off leaves the city alone", "No zone line when every part is hidden".
- ✅ M1 — 8 combinations measured in `locations_zone_line_unit.feature:15` (Kolkata) and `settings_zone_label_unit.feature:14` (example), both tagged `@M1`.
- ✅ M2 — version 4, 3, 2, 1 fixtures in `preferencesDocument.zoneLabel.test.ts:78,108`; BDD "Existing users keep the country" tagged `@M2` (see R1 on its step).
- ✅ M3 — axe outline with 4 rows (light/dark × all on/all off) at `settings_zone_label_e2e.feature` "No violations with the zone label group", tagged `@M3`.
- ✅ M4 — "Narrow screens" 6 rows (320/375/2560 × Russian/English), `scrollWidth` check, tagged `@M4`.
- ✅ M5 — measured: 96.81% overall; `preferences.ts` 100%, `preferencesDocument.ts` 97.14%, `zoneLine.ts` 94.59% (≥ 90% minimum, survivors in unchanged lines).
- ✅ Scenario: Country, abbreviation and offset — `locations_zone_line_unit.feature:6`.
- ✅ Scenario: The zone label decides the elements — `locations_zone_line_unit.feature:15`, 8 rows.
- ✅ Scenario: No zone line when every part is hidden — `locations_zone_line_unit.feature:35`.
- ✅ Scenario: The abbreviation follows the reference moment — `locations_zone_line_unit.feature:45`.
- ✅ Scenario: Unknown elements leave nothing behind — `locations_zone_line_unit.feature:54`.
- ✅ Scenario: UTC with the zone abbreviation only — `locations_zone_line_unit.feature:62`.
- ✅ Scenario: A change applies to every row at once — `locations_zone_line_unit.feature:71`.
- ✅ Scenario: Hiding the country applies to every row at once — `locations_zone_line_unit.feature:79`.
- ✅ Scenario: Device time location on the design sample — `locations_device_time_unit.feature:7` (default zone label shows "Device time" first).
- ✅ Scenario: The device moves to another zone — `locations_device_time_unit.feature:27`.
- ✅ Scenario: Unknown device time zone — `locations_device_time_unit.feature:37`.
- ✅ Scenario: Meta line follows the zone label — `locations_zone_line_unit.feature:97`, 6 rows.
- ✅ Scenario: Both parts by default — `settings_zone_label_unit.feature:6`, three toggles in order.
- ✅ Scenario: The example follows the toggles — `settings_zone_label_unit.feature:14`, 10 rows incl. "City only"/«Только город».
- ✅ Scenario: Both off leaves the country — `settings_zone_label_unit.feature:34`.
- ✅ Scenario: All off leaves the city alone — `settings_zone_label_unit.feature:42`.
- ✅ Scenario: A toggle writes the preferences once — `settings_zone_label_storage_unit.feature:6`.
- ✅ Scenario: A group with three options — `settings_zone_label_unit.feature:50`, `settings_option_group_unit.feature`.
- ✅ Scenario: Names and pressed state — `settings_zone_label_e2e.feature:6`.
- ✅ Scenario: Toggle with the keyboard — `settings_zone_label_e2e.feature:13`.
- ✅ Scenario: Tab order follows the zone line — `settings_zone_label_e2e.feature:23`.
- ✅ Scenario: Toggle size, focus and pressed icon — `settings_zone_label_e2e.feature:32`, only the UTC offset on.
- ✅ Scenario: City only is the description — `settings_zone_label_e2e.feature:41`.
- ✅ Scenario: No violations with the zone label group — `settings_zone_label_e2e.feature:48`, 4 rows via `AxeBuilder`.
- ✅ Scenario: Toggling does not move the toggles — `settings_zone_label_e2e.feature` outline at 375 and 1024, turning "Country" off.
- ✅ Scenario: One row on wide screens — `settings_zone_label_e2e.feature`, 640 Russian / 1024 English; step `settings_zone_label_e2e.steps.ts:185`.
- ✅ Scenario: Narrow screens — `settings_zone_label_e2e.feature`, 6 rows.
- ✅ Scenario: Re-approved settings screenshots — "Approved screenshots of the settings at <width> px in the <theme> theme" (`settings_e2e.feature:95`) and "Approved language screenshots…" (`settings_language_e2e.feature:120`), PNGs re-approved in the diff.
- ✅ Scenario: Choices survive a reload — `settings_e2e.feature`.
- ✅ Scenario: The language survives a reload — `settings_language_unit.feature`, `settings_language_e2e.feature`.
- ✅ Scenario: Opening writes nothing — `settings_preferences_unit.feature`.
- ✅ Scenario: Offline reopen — `settings_e2e.feature`.
- ✅ Scenario: Migration of the previous document — `settings_language_storage_unit.feature`.
- ✅ Scenario: Legacy key without a document — `settings_language_storage_unit.feature`, `settings_language_e2e.feature`.
- ✅ Scenario: The zone label survives a reload — `settings_zone_label_storage_unit.feature:13`.
- ✅ Scenario: The country choice survives a reload — `settings_zone_label_storage_unit.feature:21`.
- ✅ Scenario: Existing users get both parts — `settings_zone_label_storage_unit.feature:29`, expects all three toggles on.
- ✅ Scenario: Existing users keep the country — `settings_zone_label_storage_unit.feature:44`; migration behaviour also asserted in `preferencesDocument.zoneLabel.test.ts:78` (see R1).
- ✅ Scenario: Another tab changes the zone label — `settings_zone_label_storage_unit.feature:37`.
- ✅ Scenario: Another tab changes the country — `settings_zone_label_storage_unit.feature:52`.
- ✅ Scenario: The view survives a reload — `settings_view_mode_unit.feature`, `settings_view_mode_e2e.feature`.
- ✅ Scenario: Existing users get Cards — `settings_view_mode_unit.feature:39`, zone label with the country and the UTC offset (`settings_view_mode_unit.steps.tsx:166-185`).
- ✅ Scenario: Another tab changes the view — `settings_view_mode_unit.feature`.
- ✅ Scenario: Corrupted preferences — `settings_storage_unit.feature`.
- ✅ Scenario: Reset — `settings_storage_unit.feature`.
- ✅ Scenario: Reset returns to the browser language — `settings_language_storage_unit.feature`.
- ✅ Scenario: A view mode of the wrong type — `settings_view_mode_unit.feature`.
- ✅ Scenario: The country twice — `settings_storage_unit.feature:13-17`.
- ✅ Scenario: Both languages — `settings_e2e.feature:45-58` with the `country` column.
- ✅ Scenario: The factory name is never translated — unchanged requirement scenario, covered by `settings_factory_name.feature:7` "The factory name in every supported interface language".

## Mutation

One scoped run: `cd packages/client && npx stryker run --mutate 'src/preferences/preferences.ts,src/adapters/preferencesDocument.ts,src/presenter/zoneLine.ts,src/constants/preferences.ts,src/app/settings/ZoneLabelGroup.tsx'` (9 min 46 s), report `packages/client/reports/mutation/mutation-report.json`.

| File | Score |
|---|---|
| `src/preferences/preferences.ts` | 100.00% |
| `src/adapters/preferencesDocument.ts` | 97.14% (1 survivor: `BlockStatement` at line 68, unchanged code outside the migration step) |
| `src/presenter/zoneLine.ts` | 94.59% (2 no-coverage `StringLiteral` mutants at lines 108 and 111, the unchanged empty-label fallbacks of `presentZoneLabelExample`) |
| `src/constants/preferences.ts` | 100.00% (2 timeouts counted as detected) |
| `src/app/settings/ZoneLabelGroup.tsx` | 100.00% |
| All files | 96.81% |

`src/presenter/presentLocationRows.ts` (one added line) and `src/app/settings/SettingsToggleGroup.tsx` (one class change) were not mutated; both changes are asserted directly by `presentLocationRows.zoneLine.test.ts` and `SettingsToggleGroup.test.tsx`. No survivor sits in a line this branch changed.

## Findings

### R1 — SUGGESTION — "Existing users keep the country" checks the language and view against the unchanged stored text
- Location: `packages/client/src/test/features/settings/steps/settings_zone_label_storage_unit.steps.tsx:195-208` (with `expectPreferencesInForce` at lines 56-72)
- Rule: `.claude/rules/tdd-workflow.md` / review instruction 7 (tests assert behaviour, not wiring)
- Problem: The step "the theme {string}, the hour format {string}, the language {string} and the view {string} are in force" asserts the language and the view with `expect(world.storedText()).toContain(...)`. The stored text is the legacy document the Given step itself wrote (`legacyDocumentText`), and the scenario's last step proves it is never rewritten, so these two assertions only re-read the fixture. Only the theme and hour format are checked against the rendered settings page.
- Impact: The `@M2` executable scenario would stay green if migration step 4, or the app path after it, dropped the stored interface language or view mode (e.g. step 4 returning `{ zoneLabelParts: [...] }` without spreading the payload). The regression is still caught by the adapter unit test `preferencesDocument.zoneLabel.test.ts:78-106`, so the cost is a misleading BDD step, not an untested requirement.
- Fix: In that step assert what is in force on the settings page instead of the stored text: the view radio `screen.getByRole("radio", { name: i18n.t("views.gridTitle") })` is checked, and the language button `screen.getByRole("button", { name: i18n.t("settings.languageButton", { language: "Русский" }) })` is present (the same assertion `settings_view_mode_unit.steps.tsx:174-178` uses), mapping the feature's `"ru"` to its native name with a small lookup constant in the step file.
- Fix risk: the scenario passes `"ru"` while the assertion needs the native name, so a lookup is needed; if the `zoneLabelWorld` render does not mount the language group the way the view-mode world does, the language assertion must stay on the view only. No production code changes.
- Status: fixed
- Resolution: the "Existing users keep the country" step now asserts the Grid view radio is checked on the rendered settings page (settings_zone_label_storage_unit.steps.tsx). The language stays asserted on the stored text: the zoneLabelWorld does not mount the app shell that applies the language, so the Russian button is absent there (tried, failed); migration is also covered by preferencesDocument.zoneLabel.test.ts.

### R2 — SUGGESTION — Two step files of this change exceed the 200-line target
- Location: `packages/client/src/test/features/settings/steps/settings_zone_label_storage_unit.steps.tsx:1` (new, 267 lines); `packages/client/src/test/features/locations/steps/locations_zone_line_unit.steps.tsx:1` (212 → 277 lines)
- Rule: `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity"), `CLAUDE.md` ("Files must stay under 200 lines")
- Problem: The new storage step file was created at 267 lines and the locations zone line step file grew by 65 lines to 277; both are under the 300 cap but over the target, and neither is a case where splitting hurts clarity (each holds several independent scenarios).
- Impact: Larger step files are what the project rule says degrade AI context quality; both files are within 25 lines of the hard cap, so the next scenario added to either breaks the cap.
- Fix: Move the locations scenarios this change added ("No zone line when every part is hidden", "Hiding the country applies to every row at once") into a new `locations_zone_line_country_unit.feature` with its own `steps/locations_zone_line_country_unit.steps.tsx` reusing `zoneLineWorld.tsx`; move the two cross-tab scenarios of `settings_zone_label_storage_unit.feature` into `settings_zone_label_sync_unit.feature` with their own steps file reusing `zoneLabelWorld.tsx`. Keep the tags.
- Fix risk: vitest-cucumber binds one step file to one feature file, so the scenarios must move with their Gherkin and keep their tags; shared helpers already live in the world files, so the split only duplicates the `vi.mock` / `loadFeature` boilerplate.
- Status: fixed
- Resolution: split by moving scenarios with their tags. The two cross-tab scenarios went to settings_zone_label_sync_unit.feature and its steps file, reusing zoneLabelWorld. The two country scenarios went to locations_zone_line_country_unit.feature and its steps file, with the same world helpers as zoneLineWorld. The steps files are now 217 and 219 lines, down from 270 and 277, and the new ones are 81 and 108. All moved scenarios pass unchanged.

## Verdict

Ready. All 22 tasks and every requirement id and delta-spec scenario have implementing code and tests; the production change follows design D1–D5 and the measured mutation score is 96.81%. No blocking findings; R1 and R2 are SUGGESTIONs.
