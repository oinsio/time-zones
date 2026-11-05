# Specs review: show-zone-abbreviations-and-zone-label-setting

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 45/46 |
| Contradictions | 3 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 2 |

## Freshness

Paths under `packages/client/` unless stated.

- ✅ `src/adapters/city-search/timeZoneAbbreviations.ts` holds `TIME_ZONE_ABBREVIATIONS` with `ET` (line 13), `PT` (20), `GMT: ["UTC", "Europe/London"]` (10), `BST: ["Europe/London", "Asia/Dhaka"]` (24), `IST: ["Asia/Kolkata", "Asia/Jerusalem", "Europe/Dublin"]` (32), and `findAbbreviationsOfZone` (55), as design.md:7 says.
- ✅ `abbreviationSource.ts` matches a query equal to a key of that table, and `zoneCitiesSource.ts:69` fills `aliases` with `findAbbreviationsOfZone`. Only these two files import the table, so the deletion in task 6.2 leaves no other caller.
- ✅ `createCompositeCitySearch.ts:73-74` keeps abbreviation results in table order (`return 0; // the sort is stable: table order is kept`).
- ✅ `presentZoneMoment.ts` computes `utcOffsetLabel` with `getUtcOffsetMinutes` + `formatUtcOffset` (lines 87, 105-108) and passes it to `presentWallTimeHint` (141-145). `locations.wallTimeHintAmbiguous` interpolates `{{utcOffset}}` (`src/locales/en.json:34`, `ru.json:34`).
- ✅ `presentLocationRows.ts:72-73` builds `metaLabel` from `locations.deviceTimeMeta` ("Device time · {{utcOffset}}", `en.json:44`). `LocationRow.tsx:164-167` builds `secondaryTexts`, and `ZoneRowContent.tsx:91` renders them in a `flex flex-wrap gap-x-2` line.
- ✅ `Preferences` holds `theme`, `hourFormat` and `interfaceLanguage` (`src/preferences/preferences.ts:20-23`). `PREFERENCES_SCHEMA_VERSION = 2` (`src/constants/preferences.ts:4`), `createPreferencesMigrations` has step `1` (`src/adapters/preferencesDocument.ts:15`), and `useHourFormat` falls back to `DEFAULT_PREFERENCES` outside a provider (`useHourFormat.ts:12`).
- ✅ `SettingsPage.tsx` renders two `SettingsOptionGroup`s (lines 107, 117), then `InterfaceLanguageGroup` (126).
- ✅ `scripts/zoneData/zoneDataPlugin.ts` serves `virtual:time-zone-aliases` and `virtual:zone-cities`, and `loadZoneData().zoneCities` exists (line 70). The model imports the aliases (`src/model/timeZoneId.ts:1`), `src/vite-env.d.ts` declares the modules, and `vitest.config.ts:8` runs the plugin. Vitest includes only `src/**` (`vitest.config.ts:13`), so D9's placement of the extraction test under `src/test/zoneData/` is needed.
- ✅ `POPULAR_TIME_ZONE_IDS` (`src/constants/search.ts:14-27`) contains `Asia/Kolkata` and `America/New_York` but not Dublin, Jerusalem or Panama. Ranking popular-first, then by collator, therefore gives Kolkata, Dublin, Jerusalem for `IST` (M2), and New York first for `est` / `EDT`.
- ✅ `compositeCityFixtures.ts` has neither `Europe/London` nor `Asia/Dhaka`, as task 6.1 says (Jerusalem, Dublin and New York are at lines 14, 15, 19).
- ✅ `SAMPLE_QUERIES` in `src/test/features/location_search/steps/searchWorld.ts:44` already contains `"IST"`, so the "add `IST` … if absent" part of task 8.3 does nothing.
- ✅ Each MODIFIED requirement exists under the same name in `openspec/specs/`: `locations/spec.md:233, 994, 1089, 1130`, `time-selection/spec.md:743`, `location-search/spec.md:62, 78, 206`, `settings/spec.md:8, 123, 162, 212, 268`. Every stable scenario of these requirements is restated in the delta (scenario-by-scenario diff, none dropped).
- ✅ The work counters the tasks name exist. `startWorkCount()` counts transitions through a `getTimeZoneTransition` spy (`src/test/workCounters.ts:96-104`). `startZoneLookupCount()` (`src/test/zoneLookupCounter.ts`) counts only `Instant#toZonedDateTimeISO` and `PlainDateTime#toZonedDateTime` (see R1).
- ✅ Existing expectations that this change alters are all named by tasks: the "Device time · …" meta line in `locations_device_time_unit.feature` and `locations_device_time_data_unit.feature` (task 8.2); the "(UTC−4)" hint in `time_selection_wall_time_input_unit.feature:154,172` (task 8.5); the old `IST` order in `location_search_by_abbreviation.feature:7`, `location_search_ranking.feature:7` (task 8.3) and `locations_ui_e2e.feature:73` (task 9.3).
- ✅ Every helper, steps file and script the tasks reuse exists, including `settingsWorld.tsx`, `settingsE2eHelpers.ts`, `settings_language_layout_e2e.steps.ts`, `locations_view_a11y_e2e.steps.ts`, `browser_compatibility_legacy_engine_e2e.steps.ts`, `rowBudgetWorld.ts`, `rowPresenting.bench.ts`, `scripts/check-bench-budgets.mjs`, `scripts/check-legacy-build.mjs` and `scripts/check-bundle-size.mjs`. The bundle-size script carries the 150 KB and 30 KB budgets at lines 18 and 27.
- ✅ The screenshot features listed in task 9.4 are all the `.feature` files that hold screenshot scenarios: `locations_ui_e2e`, `locations_12_hour_screenshots_e2e`, `locations_device_time_zone_e2e`, `settings_e2e` and `settings_language_e2e`. `locations_utc_offset_e2e` mentions screenshots only in its description.
- ✅ The glossary today has no "Zone abbreviation", "Zone line", "Zone label" or "Toggle group" term. **Abbreviation source** points to `timeZoneAbbreviations` (`docs/glossary/search.md:10`), the Russian **Wall-time hint** example ends in "(UTC−4)" (`docs/glossary/date-selection.md:10`), and **Preferences** lists three choices (`docs/glossary/settings.md:7`), so the edits in task 1.1 are needed.
- ✅ `utcOffsetPrefix` is `"UTC"` in both locales (`en.json:30`, `ru.json:30`). The `UTC` zone's offset text is therefore `UTC`, the same as its tzdb abbreviation, which is the case FR5's "not shown twice" rule handles.
- ✅ The only other active change, `add-pr-preview-deploy`, has delta specs only for `app-delivery`, as the note at the top of the proposal says.
- ✅ The design screens show "MSK" (`docs/design/screens/phone-dark.html`, `phone-travel.html`, `tablet-light.html`), as "Visual Reference" says.
- ✅ All ADRs in `docs/adr/` (0001–0010) are `Accepted`. The design follows them:
  - D1 stores no offsets and ships no transitions (ADR-0003 "do not ship our own tzdata").
  - D2 uses no BigInt (ADR-0009).
  - D4 adds a versioned migration with fixtures (ADR-0004).
  - D9 counts work bounds and moves timing to a benchmark (ADR-0008).

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ zone-abbreviations "Zone abbreviation at a moment" | ✅ 2.2, 2.4, 3.1, 8.1 |
| FR2 | ✅ | ✅ zone-abbreviations "Zone abbreviation at a moment"; locations "The abbreviation follows the reference moment" | ✅ 3.1, 8.1, 8.2 |
| FR3 | ✅ | ✅ zone-abbreviations "Abbreviation spelling per interface language" | ✅ 5.1, 5.2, 8.1 |
| FR4 | ✅ | ✅ zone-abbreviations "One offline abbreviation table" | ✅ 2.3, 2.4, 8.1 |
| FR5 | ✅ | ✅ locations "Zone line on location rows", "UTC offset on location rows" | ✅ 5.1, 5.3, 7.1, 8.2 |
| FR6 | ✅ | ✅ locations "Device time location" and two more | ✅ 5.3, 7.1, 8.2 |
| FR7 | ✅ | ✅ time-selection "Wall-time hint texts" | ✅ 5.1, 5.2, 8.5 |
| FR8 | ✅ | ✅ location-search "Search by abbreviation" | ✅ 6.1, 6.2, 8.3 |
| FR9 | ✅ | ✅ location-search "Search by abbreviation" | ✅ 6.1, 8.3 |
| FR10 | ✅ | ✅ location-search "Result order and content" | ✅ 6.1, 7.2, 8.3 |
| FR11 | ✅ | ✅ location-search "Search by abbreviation", "Result order and content" | ✅ 6.1, 6.2, 8.3, 9.3 |
| FR12 | ✅ | ✅ settings "Zone label", "Open the settings page", "Settings strings are localized" | ✅ 7.4, 8.4, 9.2 (the localized-strings outline has no task, R4) |
| FR13 | ✅ | ✅ settings "Zone label"; locations "Zone line on location rows" | ✅ 4.1, 5.3, 8.2, 8.4 |
| FR14 | ✅ | ✅ settings "Zone label" | ✅ 5.1, 7.4, 8.4 |
| FR15 | ✅ | ✅ settings "Preferences are kept on the device", "Unreadable stored preferences"; location-search "Search by abbreviation" | ✅ 4.1–4.3, 8.4 |
| FR16 | ✅ | ✅ settings "Toggle group" | ✅ 7.3, 8.4 |
| NFR-P1 | ✅ | ✅ locations "Zone line is fast" | ✅ 8.6, 8.7 (the per-row lookup scenario cannot fail, R1) |
| NFR-P2 | ✅ | ✅ zone-abbreviations "One offline abbreviation table" | ✅ 2.4, 10.2 |
| NFR-P3 | ✅ | ❌ no delta requirement traces it; the stable "Search is fast and lazy" already holds the bound (R6) | ✅ 8.3 |
| NFR-A1 | ✅ | ✅ settings "Accessible zone label" | ✅ 7.3, 9.2 |
| NFR-A2 | ✅ | ✅ location-search "Accessible and responsive search" | ✅ 7.2, 9.3 |
| NFR-R1 | ✅ | ✅ locations "Zone line layout" | ✅ 7.1, 9.1 |
| NFR-R2 | ✅ | ✅ settings "Zone label layout" | ✅ 7.3, 9.2 |
| NFR-R3 | ✅ | ✅ locations "Zone line layout"; settings "Settings page layout"; location-search "Accessible and responsive search" | ✅ 9.4 |
| UX1 | ✅ | ✅ locations "Zone line on location rows", "Zone line layout" | ✅ 7.1, 8.2 |
| UX2 | ✅ | ✅ settings "Zone label", "Zone label layout"; locations "Zone line on location rows" | ✅ 7.3, 8.2, 9.2 |
| UX3 | ✅ | ✅ location-search "Result order and content", "Accessible and responsive search" | ✅ 7.2, 8.3, 9.3 |
| M1 | ✅ | n/a | ✅ 8.1 |
| M2 | ✅ | n/a | ✅ 8.3, 9.3 |
| M3 | ✅ | n/a | ✅ 6.1, 8.3 |
| M4 | ✅ | n/a | ✅ 8.2, 8.4 |
| M5 | ✅ | n/a | ✅ 9.1 |
| M6 | ✅ | n/a | ✅ 4.1, 8.4 |
| M7 | ✅ | n/a | ✅ 9.2, 9.3 |
| M8 | ✅ | n/a | ✅ 2.4, 10.2 |
| M9 | ✅ | n/a | ✅ 10.1 |
| G1 | ✅ | n/a, met by FR1, FR2, FR5, M1 | n/a, met by FR1, FR2, FR5, M1 |
| G2 | ✅ | n/a, met by FR8, FR9, FR11, M2, M3 | n/a, met by FR8, FR9, FR11, M2, M3 |
| G3 | ✅ | n/a, met by FR12–FR16, M4 | n/a, met by FR12–FR16, M4 |
| NG1 | ✅ | n/a | n/a, nothing builds non-tzdb abbreviations; 6.1 asserts they no longer match |
| NG2 | ✅ | n/a | n/a, nothing builds prefix matching; "Partial abbreviation" scenario guards it |
| NG3 | ✅ | n/a | n/a, theme and hour format keep `SettingsOptionGroup` |
| NG4 | ✅ | n/a | n/a, no artifact uses `Intl` names; 10.3 greps `timeZoneName` |
| NG5 | ✅ | n/a | n/a, matching is on the tzdb form (D3, D8) |
| NG6 | ✅ | n/a | n/a, table holds abbreviations only (D1) |
| NG7 | ✅ | n/a | n/a, D8 does not read the zone label; accessible names untouched |

The proposal defines no `Q` id ("Open Questions: None."; D1–D3 decide the open points).

## Consistency

- The stable `openspec/specs/settings/spec.md:403` (requirement "Interface language choice") says "The settings page SHALL show the group "Language" («Язык») directly below the hour format group". The delta `specs/settings/spec.md:4` and `design.md:88` (D7) put the zone label group "between the hour format group and the language group". The delta does not modify "Interface language choice" (R2).
- In `specs/locations/spec.md:90-94` ("Extra zone lookups per row"), New York must have at most 2 more zone lookups "with it shown than with it hidden". `design.md:72` (D5) computes `zoneAbbreviationLabel` "whatever the zone label", so shown and hidden cost the same. `design.md:50` (D2) counts the 2 `ZonedDateTime#with` probes as the zone lookups, but `src/test/zoneLookupCounter.ts` does not count `with` (R1).
- `tasks.md:32` (task 2.4) tells the implement stage to "correct the expectation in this test, the spec scenarios and the feature files together". `.gnomish/stages/specify/handoff.md` says the implement stage "never writes … anything under `openspec/` other than the checkboxes of `tasks.md`" (R3).

## Findings

### R1 — WARNING — The NFR-P1 per-row lookup scenario cannot fail
- Location: `openspec/changes/show-zone-abbreviations-and-zone-label-setting/specs/locations/spec.md:90`; `design.md:72` (D5); `design.md:50` (D2); `tasks.md:70` (task 8.6)
- Rule: `.claude/rules/test-planning.md` (work bounds as blocking unit BDD); ADR-0008
- Problem: The scenario "Extra zone lookups per row" compares New York's zone lookups with the zone abbreviation shown and with it hidden. It asserts "at most 2 more" for New York and "the same number" for Moscow. Two parts of the design make this comparison meaningless:
  - D5 computes `zoneAbbreviationLabel` "whatever the zone label, so the wall-time hint can ask for it". The abbreviation work is therefore identical in both runs, and the difference is always 0.
  - D2 counts its cost as "at most the 2 `with` calls". The `startZoneLookupCount()` that task 8.6 uses (`src/test/zoneLookupCounter.ts`) counts only `Instant#toZonedDateTimeISO` and `PlainDateTime#toZonedDateTime`, so it cannot see those calls at all.
- Impact: The second half of NFR-P1 ("at most 2 extra zone lookups when its zone has an abbreviation pair, and 0 otherwise") is untested. A `getZoneAbbreviation` that converts the instant 10 times per row, or probes a single-abbreviation zone, still passes. Both scenarios of task 8.6 stay green whatever the owner does.
- Fix: Rewrite the scenario so it measures the abbreviation against a baseline row with the abbreviation computed in both:
  - In `specs/locations/spec.md`, replace it with:
    - GIVEN the list contains New York (an abbreviation pair, a clock change), Santiago (`America/Santiago`, a clock change with numeric designations only), Moscow (one abbreviation) and Almaty (none), at `2026-07-15T12:00:00Z`
    - WHEN the rows are presented with the zone abbreviation shown
    - THEN New York has at most 2 more zone lookups than Santiago
    - AND Moscow has as many zone lookups as Almaty
  - In task 8.6, extend `startZoneLookupCount()` with a separate per-zone count of `Temporal.ZonedDateTime.prototype.with`, for example `adjustmentsIn(timeZoneId)`, leaving `lookupsIn` unchanged. Assert on `lookupsIn + adjustmentsIn`.
- Fix risk: Other per-row code may call `with` or convert per zone differently for zones with and without a clock change. That is why the baseline for New York is Santiago, a zone with a clock change but no table entry, and not Almaty. If the counts still differ for reasons outside the abbreviation, the implementer has to choose the instant further from a clock change. Keeping `lookupsIn` unchanged leaves the existing budget scenarios that use it (`locations_offset_difference_budget_unit`, `time_selection_wall_time_budget`) unaffected.
- Status: fixed
- Resolution: specs/locations/spec.md scenario "Extra zone lookups per row" now presents New York, Santiago, Moscow and Almaty at 2026-07-15T12:00:00Z with the abbreviation shown and asserts New York has at most 2 more zone lookups than Santiago and Moscow as many as Almaty; design.md D2 explains the baseline and the new counter; task 8.6 extends src/test/zoneLookupCounter.ts with a per-zone adjustmentsIn count of ZonedDateTime#with (lookupsIn unchanged, own test) and asserts on lookupsIn + adjustmentsIn.

### R2 — WARNING — "Interface language choice" still puts the language group directly below the hour format group
- Location: `openspec/specs/settings/spec.md:403`; `openspec/changes/show-zone-abbreviations-and-zone-label-setting/specs/settings/spec.md:4`
- Rule: `.claude/rules/delta-specs.md`; review check 6 (an ADDED requirement must not contradict one in `openspec/specs/`)
- Problem: The stable requirement "Interface language choice" says "The settings page SHALL show the group "Language" («Язык») directly below the hour format group". The delta's "Zone label" requirement (and D7, task 7.4) puts the new group between the hour format group and the language group. The delta modifies "Open the settings page", "Settings strings are localized" and other settings requirements, but not "Interface language choice".
- Impact: After the archive, `openspec/specs/settings/spec.md` holds two requirements that contradict each other on the group order: one says the language group is directly below hour format, the other says zone label sits between them. A later change that follows "Interface language choice" would move the language group back above the zone label group. The existing check (`settings_language_e2e.steps.ts`, "the language group follows the hour format group", which only asserts `languageBox.y >= hourFormatBox.y + height`) would not catch it.
- Fix: Add `### Requirement: Interface language choice` under `## MODIFIED Requirements` in `specs/settings/spec.md`. Copy the stable text and all its scenarios verbatim, with two edits:
  - "directly below the hour format group" becomes "directly below the zone label group";
  - the trace comment gets `; FR12 of show-zone-abbreviations-and-zone-label-setting` appended.
  The scenario "Collapsed group" ("below the hour format group a group "Language"…") can stay as it is, because it is still true.
- Fix risk: The restatement must keep every stable scenario of that requirement, or the archive drops them. No code or test changes, because the existing E2E step only asserts "below".
- Status: fixed
- Resolution: specs/settings/spec.md restates "Interface language choice" under MODIFIED Requirements verbatim with all four stable scenarios, except "directly below the zone label group" and FR12 of this change appended to its trace comment; proposal.md "Modified Capabilities" lists it.

### R3 — WARNING — Task 2.4 tells the implement stage to edit the spec scenarios
- Location: `openspec/changes/show-zone-abbreviations-and-zone-label-setting/tasks.md:32`
- Rule: `.gnomish/stages/specify/handoff.md` ("It never writes … anything under `openspec/` other than the checkboxes of `tasks.md`")
- Problem: Task 2.4 ends with "If a real value differs from these expectations, stop and correct the expectation in this test, the spec scenarios and the feature files together (M1, M2)". The spec scenarios live under `openspec/changes/…/specs/`, which the implement stage may not write.
- Impact: If this branch is taken, the implement stage must either break its write limits, or leave the spec and the code disagreeing on the abbreviation of a zone. In the second case the box cannot honestly be ticked, and the stage is blocked.
- Fix: Replace that sentence with: "These are the tzdb values the spec states; if a real value differs, fix the extraction (D1) or its adapter of `moment.tz.zone`, not the expectation." All listed values agree with current tzdb (numeric `+05` for Almaty, `+04` for Dubai, `+08` for Singapore, `-03` for São Paulo, `+06` for Dhaka; letter pairs for the others), so the branch exists only to catch an extraction bug.
- Fix risk: If the pinned `moment-timezone` data really did differ from tzdb for one of these zones, the task would stay red until a fix-specs round corrects the spec. That is the right owner for a spec change.
- Status: fixed
- Resolution: task 2.4 in tasks.md now says these are the tzdb values the spec states and a differing value is fixed in the extraction (D1) or its moment.tz.zone adapter, not in the expectation; the instruction to edit the spec scenarios is gone.

### R4 — WARNING — The modified "Both languages" outline of "Settings strings are localized" has no task
- Location: `openspec/changes/show-zone-abbreviations-and-zone-label-setting/specs/settings/spec.md:217`; `tasks.md:68` (8.4) and `tasks.md:76` (9.2)
- Rule: `.claude/rules/test-planning.md` ("If a scenario is in Gherkin — it must have step definitions"; every FR has an automated test)
- Problem: The delta restates the outline "Both languages" with three new columns: `<zone label>` ("Zone label" / «Подпись пояса»), `<utc offset>` ("UTC offset" / «Смещение UTC») and `<abbreviation>` ("Abbreviation" / «Сокращение»). No task updates the existing outline in `packages/client/src/test/features/settings/settings_e2e.feature:43-54`, which still checks only Theme, Hour format and Language through the step "the groups are named {string}, {string} and {string}" (`settings_e2e.steps.ts:129`). Tasks 8.4 and 9.2 list every other settings scenario of the delta, but not this one. Task 9.4 only tags the screenshot outlines of that file.
- Impact: In a real browser, the English accessible names "Zone label" and "UTC offset" of FR12 are never asserted. Task 9.2's "Names and pressed state" checks only Russian, and "Toggle with the keyboard" checks only "Abbreviation". After the archive, the stable spec scenario promises a check that the feature file does not make.
- Fix: Add to task 9.2 the following. Extend the outline "Both languages" in `settings_e2e.feature` with the columns `zone label`, `utc offset` and `abbreviation`, taking the values of the delta table, and tag it `@show-zone-abbreviations-and-zone-label-setting @FR12`. In `settings_e2e.steps.ts`, add two steps:
  - "the groups are named {string}, {string}, {string} and {string}", which checks the zone label as a `group` by name, as the language group is checked;
  - "the zone label toggles are {string} and {string}", which uses `getByRole("button", { name })` inside that group.
  Keep the existing three-name step for any other caller. Verify with the task 9.2 command run on `settings_e2e.feature --grep "Both languages"`.
- Fix risk: Accessible names belong to E2E (`.claude/rules/bdd-unit.md`, "aria-labels, focus management": unit no, E2E yes), so the placement is correct. The cost is one more E2E outline with two examples.
- Status: fixed
- Resolution: task 9.2 in tasks.md gains a step that extends the settings_e2e.feature outline "Both languages" with the zone label, utc offset and abbreviation columns and the FR12 tags, adds the four-group-name and zone-label-toggle steps to settings_e2e.steps.ts, keeps the old step, and runs it with --grep "Both languages".

### R5 — SUGGESTION — With only the abbreviation shown, the `UTC` row's zone line is empty
- Location: `openspec/changes/show-zone-abbreviations-and-zone-label-setting/specs/locations/spec.md:4`; `design.md:72` (D5)
- Rule: —
- Problem: The spec says "A zone abbreviation that reads the same as the UTC offset text MUST NOT be shown, so the `UTC` zone reads `UTC` once". D5 sets `zoneAbbreviationLabel` to `""` whenever it equals `utcOffsetLabel`, before the zone label is applied. When the user shows the abbreviation and hides the offset, the `UTC` row then has no country, no abbreviation and no offset, so its zone line is empty. The same happens to the device time location in an unknown device zone: it shows only "Device time". The task (item 05) removes only an element that is switched off or unknown, and `UTC` is neither.
- Impact: In the "abbreviation only" combination, the `UTC` row shows no zone at all, although its abbreviation is known and switched on.
- Fix: In the spec, change the sentence to "While the UTC offset is shown, a zone abbreviation that reads the same as the UTC offset text MUST NOT be shown, so the `UTC` zone reads `UTC` once". Add the row "| the zone abbreviation only | UTC |" for the `UTC` row in a scenario. In D5, move the equality check from `presentZoneMoment` into `presentZoneLine`: drop the abbreviation part only when the `UTC_OFFSET` part is shown with the same text.
- Fix risk: `presentZoneLabelExample` and the device time meta line go through `presentZoneLine`, so both follow the new rule. The wall-time hint reads `zoneAbbreviationLabel`, which no longer has the equality applied. This is harmless because the `UTC` zone has no DST overlap and so never shows the ambiguous hint.
- Status: fixed
- Resolution: specs/locations/spec.md "Zone line on location rows" now drops a same-text abbreviation only while the UTC offset is shown and adds scenario "UTC with the zone abbreviation only" (elements UTC); design.md D5 moves the equality check from presentZoneMoment into presentZoneLine; tasks 5.1, 5.3 and 8.2 test both UTC cases and the new scenario. The proposal FR5 wording ("not shown twice") already fits.

### R6 — SUGGESTION — NFR-P3 has no delta requirement
- Location: `openspec/changes/show-zone-abbreviations-and-zone-label-setting/proposal.md:93`
- Rule: `.claude/rules/traceability.md` ("For every FR/NFR/UX in `proposal.md`, at least one implementing entity must exist")
- Problem: No requirement in the change's `specs/` carries `NFR-P3 of show-zone-abbreviations-and-zone-label-setting`. The bound itself already exists in the stable `openspec/specs/location-search/spec.md:162` ("Search is fast and lazy": one normalization, at most one collator per query), and `IST` is already a sample query (`searchWorld.ts:44`).
- Impact: The Coverage column for NFR-P3 has no spec entry, and after the archive the stable spec does not show that this change relies on that bound for the new abbreviation path. Only task 8.3's tag records the link.
- Fix: In `specs/location-search/spec.md`, add `### Requirement: Search is fast and lazy` under `## MODIFIED Requirements`. Restate the stable text and its scenarios unchanged, and append `; NFR-P3 of show-zone-abbreviations-and-zone-label-setting` to its trace comment.
- Fix risk: The restatement must copy every stable scenario of that requirement verbatim, or the archive drops them. Nothing else changes.
- Status: fixed
- Resolution: specs/location-search/spec.md restates "Search is fast and lazy" under MODIFIED Requirements with all stable scenarios, a sentence that an abbreviation query is no exception, NFR-P3 of this change in its trace, and a new scenario "Abbreviation query within the work bound" (IST); task 8.3 adds that scenario to location_search_performance.feature and runs its steps; proposal.md "Modified Capabilities" lists it.

## Verdict

Needs revision. Nothing is CRITICAL. The WARNING findings R1, R2, R3 and R4 should be fixed before implementation: R1 leaves half of NFR-P1 untested, R2 leaves the stable settings spec contradicting itself, R3 puts a task outside the implement stage's limits, and R4 leaves a modified scenario without a task. R5 and R6 are optional polish.
