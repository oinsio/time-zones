# Specs review: add-country-to-zone-label

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 23/23 |
| Contradictions | 1 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 2 |

## Freshness

- ✅ `proposal.md:3` "No other change is active" — `openspec/changes/` holds only `add-country-to-zone-label` and `archive`.
- ✅ `design.md:13` `ZoneLabelPart` has `UTC_OFFSET`, `ZONE_ABBREVIATION` and `DEFAULT_PREFERENCES.zoneLabelParts` is `Object.values(ZoneLabelPart)` — `packages/client/src/preferences/preferences.ts:22-25,42`.
- ✅ `design.md:14` `ZONE_LABEL_PART_ORDER` is `[ZONE_ABBREVIATION, UTC_OFFSET]` and is read by `ZoneLabelGroup` and `presentZoneLine` — `src/constants/preferences.ts:22-25`, `src/app/settings/ZoneLabelGroup.tsx:31`, `src/presenter/zoneLine.ts:62`.
- ✅ `design.md:15` the reducer keeps enum order for any part — `src/preferences/preferencesCommands.ts:37-51` (`ZONE_LABEL_PARTS_IN_ORDER = Object.values(ZoneLabelPart)`); `parseStoredPreferences` rejects unknown and repeated parts — `src/preferences/parseStoredPreferences.ts:17-20` (`new Set(value).size === value.length`).
- ✅ `design.md:16` `PREFERENCES_SCHEMA_VERSION` is `4` and the migrations have steps 1, 2, 3, step 2 setting `Object.values(ZoneLabelPart)` — `src/constants/preferences.ts:5`, `src/adapters/preferencesDocument.ts:20-32`.
- ✅ `design.md:17` `presentZoneLine` always emits `PLACE` when `placeText` is non-empty; `presentLocationRows` passes `locations.deviceTimeMeta` for the device time location, else the country name; `presentZoneLabelExample` passes the country of `ZONE_LABEL_EXAMPLE` — `src/presenter/zoneLine.ts:60-63,90-91`, `src/presenter/presentLocationRows.ts:74-77`.
- ✅ `design.md:18` `ZoneRowContent` renders no `ZoneLine` for empty parts — `src/views/shared/ZoneRowContent.tsx:130`.
- ✅ `design.md:19` the toggles sit in `flex flex-nowrap gap-2` — `src/app/settings/SettingsToggleGroup.tsx:51`.
- ✅ `design.md:33` `LocationRow.countryName` is read by no view — no `countryName` reference under `src/views/` or `src/app/` besides a JSDoc line in `LocationRow.tsx:51`.
- ✅ `design.md:41` the settings `main` is `max-w-xl` — `src/app/settings/SettingsPage.tsx:94`.
- ✅ NG1 / NG4: the search and the wall-time hint do not read the country through the zone label — `presentSearchResults.ts:49` calls `presentCountryName` directly; `presentWallTimeHint` gets only the UTC offset and the zone abbreviation (`presentZoneMoment.ts:155-163`).
- ✅ Every file `tasks.md` names as existing exists: `preferences.zoneLabel.test.ts`, `constants/preferences.test.ts`, `preferencesDocument.zoneLabel.test.ts`, `preferencesDocument.test.ts`, `preferencesRepository.test.ts`, `zoneLine.test.ts`, `presentLocationRows.zoneLine.test.ts`, `renderSettingsPage.tsx`, `SettingsToggleGroup.test.tsx`, `SettingsPage.test.tsx`, `i18n.test.ts`, `zoneLineWorld.tsx`, `settingsE2eHelpers.ts`, `zoneLabelWorld.tsx`, all named `.feature` and step files, `playwright.bdd.config.ts`, `__screenshots__/chromium/`; `ZoneLabelGroup.test.tsx` is created by task 5.2 (it does not exist yet, as the task says).
- ✅ `tasks.md:37` phrase maps `ZONE_LABEL_PART_NAMES` and `ZONE_LABEL_PART_VALUES` / `ALL_ZONE_LABEL_PARTS` exist with the old phrases — `zoneLineWorld.tsx:37-45`, `settingsE2eHelpers.ts:55-65`; seeds write `PREFERENCES_SCHEMA_VERSION` (`locationsSeedHelpers.ts:104`, `settingsE2eHelpers.ts:80`), so D6's reasoning holds.
- ✅ `tasks.md:32` `[data-zone-line]` is the zone line's marker — `src/views/shared/ZoneLine.tsx:22`.
- ✅ `tasks.md:55` the "Both languages" outline today has the step `the zone label toggles are "<abbreviation>" and "<utc offset>"` — `settings_e2e.feature:53`.
- ✅ `tasks.md:57` the screenshot outlines exist — `settings_e2e.feature:95`, `settings_language_e2e.feature:121`.
- ✅ Every MODIFIED requirement exists in `openspec/specs/` under the same name ("Zone label", "Toggle group", "Accessible zone label", "Zone label layout", "Preferences are kept on the device", "Unreadable stored preferences", "Settings strings are localized" in `settings`; "Zone line on location rows", "Device time location" in `locations`), and every stable scenario of those requirements is restated in the delta (none dropped).
- ✅ Glossary entries to change exist as described — `docs/glossary/settings.md:10` (Zone label), `docs/glossary/locations.md:13` (Zone line), `docs/architecture/domain-model.md:35` (`"UTC_OFFSET | ZONE_ABBREVIATION, each optional"`).
- ✅ Nothing is already implemented: no `COUNTRY` member, no `zoneLabelCountry` key in `src/locales/en.json:152-155`, no archived change adds a country toggle.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ settings "Zone label", "Settings strings are localized" | ✅ 2.1–2.2, 5.1–5.3, 6.2, 7.2 |
| FR2 | ✅ | ✅ "Zone label", "Accessible zone label" | ✅ 2.1, 5.2, 6.2, 7.1 |
| FR3 | ✅ | ✅ locations "Zone line on location rows" | ✅ 4.1–4.2, 6.4 |
| FR4 | ✅ | ✅ locations "Device time location" | ✅ 4.1–4.2, 6.4 |
| FR5 | ✅ | ✅ "Zone label", "Accessible zone label" | ✅ 4.1, 5.2–5.3, 6.2, 7.1 |
| FR6 | ✅ | ✅ "Preferences are kept on the device", "Unreadable stored preferences" | ✅ 2.1, 3.1–3.2, 6.2–6.3 |
| NFR-A1 | ✅ | ✅ "Accessible zone label" | ✅ 7.1 |
| NFR-R1 | ✅ | ✅ "Toggle group", "Zone label layout" | ✅ 5.2–5.3, 7.1, 7.4 |
| UX1 | ✅ | ✅ "Zone label", "Settings strings are localized" | ✅ 5.2, 7.2 |
| UX2 | ✅ | ✅ "Zone line on location rows" | ✅ 4.1, 6.2, 6.4 |
| M1 | ✅ | ✅ example and zone line tables | ✅ 6.2, 6.4 |
| M2 | ✅ | ✅ "Existing users keep the country" | ✅ 3.1, 6.2 |
| M3 | ✅ | ✅ "No violations with the zone label group" | ✅ 7.1 |
| M4 | ✅ | ✅ "Narrow screens" | ✅ 7.1 |
| M5 | ✅ | n/a | ✅ 8.1 |
| G1 | ✅ | n/a met by FR1, FR3, FR6 | n/a met by FR1, FR3, FR6 |
| G2 | ✅ | n/a met by FR2, UX1 | n/a met by FR2, UX1 |
| G3 | ✅ | n/a met by FR1, FR6, M2 | n/a met by FR1, FR6, M2 |
| NG1 | ✅ | n/a | n/a no artifact changes the search |
| NG2 | ✅ | n/a | n/a D3 keeps "Device time" |
| NG3 | ✅ | n/a | n/a no new budget is added |
| NG4 | ✅ | n/a | n/a `countryName`, the hint and the accessible names are left alone (D3) |
| NG5 | ✅ | n/a | n/a the zone line order stays country, abbreviation, offset |

## Consistency

- `tasks.md:37` (6.1) rewrites every old-phrase feature row "unless the scenario is changed in 6.2–6.4", which turns the seed `And the zone label shows only the UTC offset` of "Toggle size, focus and pressed icon" (`settings_zone_label_e2e.feature:32`) and the axe row `| dark | nothing |` (`:48`) into country-on variants, while `tasks.md:49,51` (7.1) require that scenario with only the UTC offset on and the axe rows with all toggles off.

## Findings

### R1 — SUGGESTION — Task 6.1's phrase rewrite collides with task 7.1 and its grep hits unrelated features
- Location: `openspec/changes/add-country-to-zone-label/tasks.md:37`
- Rule: —
- Problem: Task 6.1 says to rewrite every feature row that used an old phrase "unless the scenario is changed in 6.2–6.4", and gives the grep `grep -rn "...\|| nothing" src/test/features`. The E2E scenarios "Toggle size, focus and pressed icon" (`settings_zone_label_e2e.feature:32`, `only the UTC offset`) and "No violations with the zone label group" (`:48`, `nothing`) are rewritten again by task 7.1 (`tasks.md:49,51`) to the opposite meaning (only the UTC offset on; all toggles off). The grep's `| nothing` also matches `meeting_range/meeting_range_share.feature:35-39`, whose `nothing` column has nothing to do with the zone label.
- Impact: Following 6.1 literally first changes the two E2E seeds to "the country and the UTC offset" / "the country only", then 7.1 has to undo it; an implementer who stops at 6.1 leaves the E2E scenarios asserting the wrong state, and the grep invites editing `meeting_range_share.feature` rows that must not change.
- Fix: In `tasks.md` 6.1 change "unless the scenario is changed in 6.2–6.4" to "unless the scenario is changed in 6.2–6.4 or 7.1", and narrow the grep to `src/test/features/settings src/test/features/locations`.
- Fix risk: none — no other zone label phrase lives outside those two folders (the only other `nothing` hits are `meeting_range_share.feature` and the `main_page` "notices region shows nothing" step).
- Status: open

### R2 — SUGGESTION — Code comments that describe two parts are not updated by any task
- Location: `openspec/changes/add-country-to-zone-label/tasks.md:17`, `tasks.md:22`
- Rule: `.claude/rules/glossary.md` ("A change that shifts a term's meaning … updates the entry in the same change")
- Problem: Tasks 2.2 and 3.2 change the code but not three comments that become false: `src/preferences/preferences.ts:32` ("empty leaves only the country"), `src/constants/preferences.ts:17-19` ("the zone abbreviation, then the UTC offset") and `src/adapters/preferencesDocument.ts:14` ("Version 2 had no zone label: the step shows both parts").
- Impact: After the change `zoneLabelParts: []` hides the country too and step 2 shows three parts, so these JSDoc lines state the old behaviour and mislead the next reader of the owner of the zone label.
- Fix: Add to task 2.2: "update the JSDoc of `Preferences.zoneLabelParts` to 'empty shows no zone line part' and of `ZONE_LABEL_PART_ORDER` to 'the country, the zone abbreviation, then the UTC offset'"; add to task 3.2: "update the migration JSDoc: step 2 shows every part, step 4 adds the country to a version 4 document".
- Fix risk: none — comments only.
- Status: open

## Verdict

Ready to implement. No blocking findings; R1 and R2 are SUGGESTION-level polish.
