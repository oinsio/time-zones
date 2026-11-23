# Specs review: add-unix-time-converter-tool

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 59/59 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 0 |

## Freshness

- ✅ Nothing of the change is implemented yet: no file under `packages/client/src` names Unix time (only `sunPosition.ts`, `zoneRulesConstants.ts` and `constants/sun.ts` match "unix", all unrelated), and `openspec/specs/tools/` and `openspec/specs/unix-time-converter/` do not exist; no archived change builds tools.
- ✅ `design.md:7` — `AppPage` is `MAIN | SETTINGS` in `packages/client/src/app/appPage.ts:6-9`; `AppShell.tsx` is 198 lines and holds the page state (`useState(AppPage.MAIN)`, line 112), the Esc handler (lines 138-142) and the returned focus (`settingsButtonRef`, line 113); it renders `LocationSearch` and `SettingsButton` (lines 189-192) and takes `textSharing` (line 70) in `AppShellDependencies` (line 68).
- ✅ `design.md:7,21` — `useMinuteTick` (`controller/useMinuteTick.ts:18`), `TickScheduler` (`controller/tickScheduler.ts:5`), `getMillisecondsUntilNextMinute` (`controller/minuteBoundary.ts:9`) exist; `noBigIntInSources.test.ts` exists at `src/test/`.
- ✅ `design.md:14`, `tasks.md:205` — `PREFERENCES_SCHEMA_VERSION = 8` (`src/constants/preferences.ts:11`); `createPreferencesMigrations` is in `src/adapters/preferencesDocument.ts:32` with steps `1:`…`7:`, so the new step is `8:`; `parseStoredPreferences` (`src/preferences/parseStoredPreferences.ts:48`) and `reducePreferences` (`src/preferences/preferencesCommands.ts:114`) exist.
- ✅ `design.md:16`, `tasks.md:261` — `viewRegistry` (`views/index.ts:33`), `resolveActiveView(registry, viewMode)` hard-wired to `DEFAULT_VIEW_ID` (`views/resolveActiveView.ts:9-18`), `createRetryableLazyView` exported from `views/index.ts`, `ViewErrorBoundary`, `ViewSkeleton` and `ViewHost` in `src/app/`.
- ✅ `design.md:17` — `ReferenceMode` (`model/referenceMoment.ts:6`); `SELECT_INSTANT` (`model/locationCommands.ts:28`) is reduced by `reduceSelectInstant`, which pins the exact instant and clears the meeting range (`model/reduceSelectInstant.ts:44-50`), so Show on main page can pin `11:23:00Z` as the spec says.
- ✅ `design.md:18` — `resolveWallClock`, `WallClockStatus` (`model/wallClock.ts`), `presentWallTimeHint` (`presenter/wallTimeHint.ts:30`), `WallTimeHint` (`views/shared/WallTimeHint.tsx`), `parseWallTimeInput(text, dayPeriodMarkers)` (`presenter/parseWallTimeInput.ts:65-68`), `formatTypedWallTimeText(text)` (`presenter/formatTypedWallTimeText.ts:29`).
- ✅ `design.md:19` — `presentZoneLine`, `getUtcOffsetMinutes`, `formatUtcOffset`, `formatZoneAbbreviation`, `useCityLabels`, `useExemplarCity`, `getLocalDateTime`, `getDateTimeFormatter`, `DateTimeLabelKind`, `presentZoneMoment` all exist under the named layers.
- ✅ `design.md:20,98` — `CalendarDialog` takes a `dateBar` prop of type `PresentedDateBar` and reads `chooseDateLabel`, `isoDate`, `shortLabel`, `longLabel` (`views/shared/CalendarDialog.tsx:10-51`); `useCalendarMonth` exists.
- ✅ `design.md:22`, `tasks.md:252` — `TextSharing` (`ports/textSharing.ts:18`), `browserTextSharing` (`adapters/browserTextSharing.ts:59`) and `adapters/textSharing.test.ts` exist.
- ✅ `design.md:23` — `WorldClockState` has `deviceTimeZoneId` and `homeLocationId` (`model/locations.ts:70,74`); `LocationsContext` (`controller/locationsContext.ts:57`); `useLocations` (`controller/useLocations.ts:52`).
- ✅ `design.md:144` — `usePrefersReducedMotion` reads `window.matchMedia` (`controller/usePrefersReducedMotion.ts:7-8`); `app_shell_smoke_e2e.fixtures.ts` opens its own context with `browser.newContext` (line 27).
- ✅ `design.md:167-168` — `localTimeParts` is used by shipped code; `browser_compatibility_legacy_zones.feature:6` holds "Zone checks work without BigInt"; `browser_compatibility_legacy_engine_e2e.feature:7` records page requests; `playwright.bdd.config.ts` has the projects `chromium`, `mobile-chrome` and `view-contract-*` only.
- ✅ `tasks.md:223` — `settings_option_group_e2e.feature` has the outlines "Caption and options in one row at <width> px in <language>" (line 55) and "Compact groups at 375 px in <language>" (line 72); its steps file is 233 lines; `settings_zone_label_e2e.steps.ts` exists; "Approved screenshots of the settings" is `settings_e2e.feature:97`.
- ✅ `tasks.md:199`, `proposal.md:193` — both READMEs hold the Tools item with ` *(in development)*` / ` *(в разработке)*` and links to `openspec/specs/tools/spec.md` and `openspec/specs/unix-time-converter/spec.md` (`README.md:35`, `README.ru.md:35`).
- ✅ `tasks.md:267` — `AppShell.noticesChunk.test.tsx`, `check:bundle-size` and `check:legacy-build` (`packages/client/package.json:11-12`), `typecheck` and `lint` scripts exist; `src/test/benchmarks/` holds `*.bench.ts` files.
- ✅ `tasks.md:196` — glossary `time.md:5` lists *Never:* "timestamp in the model (only in storage), epoch" for **Instant**; `docs/glossary/` has `settings.md`, `architecture.md`, `views.md`, `time.md`, and no `tools.md` or `unix-time.md` yet.
- ✅ MODIFIED requirements match `openspec/specs/`: "Header actions" of `main-page` and "Toggle group" and "Settings page layout" of `settings` restate the stable text word for word, with only the tool additions changed (diffed sentence by sentence).
- ✅ `design.md:9` — ADRs 0001–0011 and 0013–0019 are all `Accepted`; none is superseded; the persistence rule "F -- newer --> E" of ADR-0004 backs the rollback note of `design.md:174`.
- ❌ `design.md:76` — "Range: |`unixSeconds`| ≤ 8.64e12, the range of `Temporal.Instant`". Reality: `Temporal.Instant` ends exactly at ±8.64e21 ns, i.e. at `unixSeconds = 8.64e12` with `nanoseconds = 0`. A moment with `unixSeconds = 8 640 000 000 000` and a non-zero `nanoseconds` passes this check but lies past the upper limit, and `Temporal.Instant.fromEpochMilliseconds(8.64e15 + 500)` throws `RangeError` (see R1).

## Coverage

| Id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ tools "Tool registry" | ✅ 3.1, 3.4 |
| FR2 | ✅ | ✅ tools "Tools group"; settings "Toggle group", "Settings page layout" | ✅ 3.2, 3.3, 3.4, 4.6 |
| FR3 | ✅ | ✅ tools "Enabled tools are kept on the device" | ✅ 2.1–2.5, 4.6 |
| FR4 | ✅ | ✅ tools "Tool buttons in the header"; main-page "Header actions" | ✅ 4.3, 4.4, 4.5, 4.6 |
| FR5 | ✅ | ✅ tools "Open and leave a tool page" | ✅ 4.2, 4.4, 4.6, 9.8 |
| FR6 | ✅ | ✅ "Converter input" | ✅ 5.2, 5.3, 6.1, 9.6 |
| FR7 | ✅ | ✅ "Unit detection and unit choice" | ✅ 5.1, 6.1, 9.6 |
| FR8 | ✅ | ✅ "Exact instants" | ✅ 5.2, 5.3, 9.6, 9.8 |
| FR9 | ✅ | ✅ "Converter rows" | ✅ 7.4, 9.6 |
| FR10 | ✅ | ✅ "Exact wall-time input", "Date of a converter row" | ✅ 6.3, 7.2, 9.2, 9.6 |
| FR11 | ✅ | ✅ "Linked fields", "Date of a converter row" | ✅ 6.1–6.3, 9.6 |
| FR12 | ✅ | ✅ "Moment notations" | ✅ 5.3, 8.1, 9.5, 9.8 |
| FR13 | ✅ | ✅ "Relative time" | ✅ 5.4, 7.3, 9.6 |
| FR14 | ✅ | ✅ "Converter moment", "Live and Now" | ✅ 6.1, 8.2, 8.4, 9.6, 9.8 |
| FR15 | ✅ | ✅ "Converter messages" | ✅ 5.2, 6.1, 9.6 (range bound wrong in D4, R1) |
| FR16 | ✅ | ✅ "Show on main page" | ✅ 8.4, 9.8 |
| FR17 | ✅ | ✅ "Converter views" | ✅ 9.1, 9.3, 9.6 |
| FR18 | ✅ | ✅ tools "Tools strings are localized"; "Converter strings are localized" | ✅ 3.1, 3.4, 7.3, 7.5, 9.6 |
| NFR-P1 | ✅ | ✅ tools "A tool page loads on demand" | ✅ 4.5, 4.6, 9.7 |
| NFR-P2 | ✅ | ✅ "Live work bounds" | ✅ 7.6, 8.5 |
| NFR-P3 | ✅ | ✅ "Exact instants", "Live work bounds" | ✅ 5.3, 9.6 |
| NFR-A1 | ✅ | ✅ tools "Accessible and responsive tools"; settings "Toggle group" | ✅ 3.2, 4.6 |
| NFR-A2 | ✅ | ✅ tools "Open and leave a tool page"; "Accessible converter" | ✅ 4.2, 4.6, 9.3, 9.8 |
| NFR-A3 | ✅ | ✅ "Accessible converter", "Moment notations" | ✅ 9.4, 9.5, 9.8 |
| NFR-A4 | ✅ | ✅ tools "Accessible and responsive tools"; "Accessible converter" | ✅ 4.6, 9.8 |
| NFR-R1 | ✅ | ✅ tools "Accessible and responsive tools"; main-page "Header actions"; settings "Settings page layout"; "Converter layout" | ✅ 4.3, 4.6, 9.8 |
| NFR-R2 | ✅ | ✅ "Converter layout" → "Long values at 320 px" | ✅ 9.8 |
| UX1 | ✅ | ✅ "Converter rows", "Converter layout" | ✅ 9.5, 9.8 |
| UX2 | ✅ | ✅ tools "Tools group"; settings "Toggle group" | ✅ 3.2, 4.6 |
| UX3 | ✅ | ✅ tools "Tool buttons in the header"; main-page "Header actions" | ✅ 4.1, 4.3, 4.6 |
| UX4 | ✅ | ✅ "Converter input", "Accessible converter" | ✅ 9.3, 9.8 |
| UX5 | ✅ | ✅ "Moment notations" | ✅ 9.5, 9.8 |
| UX6 | ✅ | ✅ "Converter layout" | ✅ 9.5, 9.8 |
| M1 | ✅ | n/a | ✅ 4.6, 9.7 |
| M2 | ✅ | n/a | ✅ 9.6, 9.7, 9.8 |
| M3 | ✅ | n/a | ✅ 5.1, 5.2 |
| M4 | ✅ | n/a | ✅ 6.3, 9.6 |
| M5 | ✅ | n/a | ✅ 9.8 ("Focus and names", "Focus on a touch device") |
| M6 | ✅ | n/a | ✅ 9.8 |
| M7 | ✅ | n/a | ✅ 2.5, 5.5, 6.4, 7.7, 8.6, 10.4 |
| M8 | ✅ | n/a | ✅ 9.3 |
| G1 | ✅ | n/a — met by FR2, FR4, M1 | n/a |
| G2 | ✅ | n/a — met by FR6, FR8, FR9, M2 | n/a |
| G3 | ✅ | n/a — met by FR10, FR12, M4 | n/a |
| G4 | ✅ | n/a — met by FR8, NFR-P3, M2 | n/a |
| G5 | ✅ | n/a — met by FR1, FR17, M8 | n/a |
| G6 | ✅ | n/a — met by NFR-P1, M1 | n/a |
| NG1 | ✅ | n/a | n/a — only the converter is registered |
| NG2 | ✅ | n/a | n/a — no caption, no features page built |
| NG3 | ✅ | n/a | n/a — notations are the four units and ISO 8601 only |
| NG4 | ✅ | n/a | n/a — no URL state; session is in memory (D8) |
| NG5 | ✅ | n/a | n/a — location search untouched |
| NG6 | ✅ | n/a | n/a — converter never reads the reference moment ("The reference moment is not read") |
| NG7 | ✅ | n/a | n/a — no converter view setting |
| NG8 | ✅ | n/a | n/a — tool session is a ref in the shell, never written to storage |
| NG9 | ✅ | n/a | n/a — no tool menu |
| NG10 | ✅ | n/a | n/a — no leap-second logic |
| Q1 | ✅ | n/a | n/a — left open (Risks of design.md) |
| Q2 | ✅ | n/a | n/a — left open (Risks of design.md) |

## Consistency

- `design.md:76` admits every moment with |`unixSeconds`| ≤ 8.64e12, while `specs/unix-time-converter/spec.md:258` requires the range message for "a value outside ±8 640 000 000 000 seconds from 1970": a value such as 8 640 000 000 000.5 s is outside by the spec and inside by the design (R1).
- `tasks.md:206` (2.4) and `tasks.md:214` (3.4) run unit BDD scenarios whose THEN steps read the header tool buttons and the tool page heading (`specs/tools/spec.md:19-28,59-62,70-80,93-96,172-177`), which only `tasks.md:220-221` (4.3 `ToolButtons`, `ToolPageFrame`; 4.4 wiring in `AppShell`) build later (R2).

## Findings

### R1 — WARNING — The range check of D4 admits fractional moments past the end of `Temporal.Instant`
- Location: `openspec/changes/add-unix-time-converter-tool/design.md:76`
- Rule: —
- Problem: D4 defines the range as "|`unixSeconds`| ≤ 8.64e12, the range of `Temporal.Instant`", and `toInstant` (`design.md:74`) calls `Temporal.Instant.fromEpochMilliseconds(unixSeconds * 1000 + Math.floor(nanoseconds / 1e6))`. `Temporal.Instant` ends at exactly 8.64e21 ns, so at the upper bound only `nanoseconds = 0` is valid. A moment with `unixSeconds = 8 640 000 000 000` and `nanoseconds > 0` (for example `8640000000000.5`, or `8640000000000500` under «Миллисекунды», or `+275760-09-13T00:00:00.5Z`) passes `isExactInstantInRange` but is past the limit. At the lower bound the floor already rejects such values, so only the upper bound is wrong. The spec (`specs/unix-time-converter/spec.md:258`) is correct; its "Range" scenario (`spec.md:281-286`) only tests whole seconds, and tasks 5.2/9.6 build their tests from that table, so the defect would pass every planned test.
- Impact: As written, the reducer accepts the text, then `toInstant` throws `RangeError` in the presenter or row reducer. The page falls into the view error fallback, or the app throws, instead of showing «Значение вне поддерживаемого диапазона дат» with every field unchanged (FR15).
- Fix: In `design.md:76` replace the range line with "**Range**: `-8.64e12 ≤ unixSeconds` and (`unixSeconds < 8.64e12`, or `unixSeconds = 8.64e12` with `nanoseconds = 0`) — exactly the range of `Temporal.Instant`." In `specs/unix-time-converter/spec.md:285-286`, extend the "Range" scenario with one more step pair: "**WHEN** the user types `8640000000000.5` **THEN** the message «Значение вне поддерживаемого диапазона дат» is shown". In `tasks.md:228` (5.2), add "the upper bound with a non-zero fraction is out of range" to the `isExactInstantInRange` cases.
- Fix risk: none — the spec already states the correct range; the edit only aligns D4 and adds one test row. `8640000000000.5` is a decimal-seconds text, which the spec reads under Auto and «Секунды» (`spec.md:62`), so the new row fits the scenario's `GIVEN` of «Секунды».
- Status: fixed
- Resolution: `design.md` D4 Range now reads `-8.64e12 ≤ unixSeconds` and (`unixSeconds < 8.64e12`, or `= 8.64e12` with `nanoseconds = 0`); `specs/unix-time-converter/spec.md` scenario "Range" gains the step `8640000000000.5` → «Значение вне поддерживаемого диапазона дат»; task 5.2 adds `isExactInstantInRange` cases at both bounds, the upper bound with a non-zero fraction among them.

### R2 — WARNING — Unit BDD tasks 2.4 and 3.4 depend on header buttons and the tool page built later in 4.3–4.4
- Location: `openspec/changes/add-unix-time-converter-tool/tasks.md:206`, `openspec/changes/add-unix-time-converter-tool/tasks.md:214`
- Rule: `.gnomish/stages/review-specs/instructions.md` check 5 ("tasks ordered so none depends on a later one"); `.claude/rules/tdd-workflow.md`
- Problem: Task 2.4 runs "every scenario of `tools` → 'Enabled tools are kept on the device'". Four of those six scenarios assert the header: "Enabled tools survive a reload" and "Another tab turns a tool on" (`specs/tools/spec.md:62,80`), "An unregistered stored tool" (`spec.md:73`) and "Without storage" (`spec.md:96`). Task 3.4 runs "Tool registry (all three scenarios)". Two of them assert header buttons: "Two tools keep registry order" (`spec.md:22`) and "Empty registry" (`spec.md:28`). Task 3.4 also runs "Tools strings are localized", which opens the tool page from the header button and reads its heading (`spec.md:176-177`). The registry only exists from 3.1. `ToolButton`/`ToolButtons` and `ToolPageFrame` are built in 4.3, and the shell renders them only after 4.4 (`tasks.md:220-221`).
- Impact: The implementer cannot make 2.4 or 3.4 pass when they are reached. Each verify command (`npx vitest run …tools_preferences_unit.steps.tsx`, `…tools_unit.steps.tsx`) fails until group 4 is done. So either the boxes stay unticked out of order, or the implementer builds the header buttons early, outside the task that owns them.
- Fix: In `tasks.md`, move task 2.4 to after 4.4 (for example as a new 4.5a, keeping its text). Cut task 3.4 down to the scenarios that need no header or page: "Toggles are independent", "A toggle shows no text", "A registered tool appears in the settings" and "Place of the tools group". Move "Two tools keep registry order", "Empty registry" and "Tools strings are localized" into task 4.5, next to "Tool buttons in the header". Keep their tags (`@FR1 @FR3 @FR18`).
- Fix risk: none — only the order and grouping of tasks change. The scenarios, feature files and verify commands stay the same, and no scenario changes between unit BDD and E2E.
- Status: fixed
- Resolution: in `tasks.md` the old 2.4 (`tools_preferences_unit.feature`, every "Enabled tools are kept on the device" scenario) moved into 4.5, after the 4.4 wiring, and the mutation task became 2.4; 3.4 keeps only "A registered tool appears in the settings", "Toggles are independent", "A toggle shows no text" and "Place of the tools group"; "Two tools keep registry order", "Empty registry" (`@FR1`) and "Tools strings are localized" (`@FR18`) moved into 4.5, whose verify command runs both steps files. Group 4 heading now lists FR1, FR3, FR18.

## Verdict

Needs revision: R1 and R2. No CRITICAL finding; the change is faithful to the task, its MODIFIED requirements match the stable specs, every requirement has a scenario and a task, and the human follow-up items H1 (ADRs, `CLAUDE.md`) and H2 (root READMEs) have valid `Why manual:` reasons and checkbox tasks that write their patches.
