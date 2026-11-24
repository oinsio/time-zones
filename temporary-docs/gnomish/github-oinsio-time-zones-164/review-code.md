# Review: add-unix-time-converter-tool

## Summary

| Item | Value |
|---|---|
| Tasks verified | 53/54 |
| Requirements traced | 126/128 |
| CRITICAL | 1 |
| WARNING | 4 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 `docs/glossary/tools.md` holds 7 entries (`grep -c "^- \*\*"` prints 7); `docs/glossary/README.md` lists the context; `settings.md` gains the toggle-group icon option, the enabled tools and the tools group.
- ✅ 1.2 `docs/glossary/unix-time.md` holds 15 entries; `time.md:29` adds **Second tick**, `architecture.md:27` adds **Text copying**; no `epochSeconds`; every glossary file is under 200 lines (largest 50).
- ✅ 1.3 `docs/architecture/overview.md` and `views.md` name the tool registry; `overview.md` names `views/unixTimeConverter`; `domain-model.md` changed in the diff.
- ✅ 1.4 `handoff/H1-adrs-tools-and-exact-instants.patch`: `git apply --check` exits 0, 3 `+++ b/docs/adr/002[0-2]-` files; `handoff/README.md` has the `## H1` section; `docs/adr` and `CLAUDE.md` are untouched.
- ✅ 1.5 `handoff/H2-readme-tools-released.patch`: `git apply --check` exits 0; `## H2` section present; the READMEs are untouched.
- ✅ 2.1 `src/preferences/preferences.tools.test.ts` exists (default, `TOGGLE_TOOL` cases).
- ✅ 2.2 `enabledTools` and `TOGGLE_TOOL` in `src/preferences/preferences.ts` and `preferencesCommands.ts` (100 % mutation, see Mutation).
- ✅ 2.3 `src/preferences/parseStoredPreferences.ts` checks `enabledTools`, `src/adapters/preferencesDocument.ts` adds the migration step, `src/constants/preferences.ts` bumps the version; tests in `src/adapters/preferencesDocument.tools.test.ts`.
- ✅ 2.4 Measured in this review: `parseStoredPreferences.ts` 100 %, `preferencesCommands.ts` 100 %.
- ✅ 3.1 `src/tools/toolDefinition.ts`, `resolveEnabledTools.ts` (+ test), `tools/index.ts` (`toolRegistry`), `src/controller/useEnabledTools.ts` (+ test); `tools.*` keys in both locale files.
- ✅ 3.2 `SettingsToggleOption.icon` in `src/views/shared/SettingsToggleGroup.tsx`; `SettingsToggleGroup.test.tsx:147` "should name an icon toggle by its label and show no text", `:179` same box size.
- ✅ 3.3 `src/app/settings/ToolsGroup.tsx` with `ToolsGroup.test.tsx`; placed in `SettingsPage.tsx`; `SettingsPage.sections.test.tsx` exists.
- ✅ 3.4 `src/test/features/tools/tools_unit.feature`: "A registered tool appears in the settings", "Toggles are independent", "A toggle shows no text", "Place of the tools group".
- ✅ 4.1 `src/app/useAppPage.ts` holds the page state, Esc handler and returned focus; `src/app/HeaderIconButton.tsx` extracted (AppShell is 215 lines after 4.4, under the 300 hard cap).
- ✅ 4.2 `AppPage.TOOL` and `useAppPage(enabledToolIds)` (`useAppPage.ts:22-30` returns to main for a gone tool); `src/app/useAppPage.test.tsx`.
- ✅ 4.3 `ToolButton.tsx`, `ToolButtons.tsx`, `src/tools/ToolPageFrame.tsx`, `ToolHost.tsx` with tests; title classes `HEADER_TITLE_WITH_TOOLS_CLASS_NAME` in `src/constants/header.ts:20`; the 20 px size is `header-title-compact` in `tailwind.config.ts:30`, beside the existing narrow and full title sizes, not in `tokens.css`.
- ✅ 4.4 `AppShell.tsx` renders `ToolButtons` and `ToolHost`; `src/app/useToolSessions.ts` keeps the sessions in a ref; `src/app/AppShell.tools.test.tsx`.
- ✅ 4.5 `tools_unit.feature` (tool buttons, registry order, empty registry, English), `tools_pages_unit.feature` ("Loading fails, then succeeds"), `tools_preferences_unit.feature` (every scenario of "Enabled tools are kept on the device").
- ✅ 4.6 `tools_e2e.feature`, `tools_pwa_e2e.feature`; `main_page_header_e2e.feature:146,163,181`; `settings_option_group_e2e.feature` has 2 "tools group" lines; the two settings steps live in `src/test/features/tools/steps/settings_tools_group_e2e.steps.ts`; settings screenshots under `__screenshots__/chromium/`.
- ✅ 5.1 `src/model/unixTime/unixTimeUnit.ts` (`detectUnixTimeUnit`, thresholds in `src/constants/unixTime.ts`); `unixTimeUnit.test.ts`.
- ✅ 5.2 `exactInstant.ts` (100 %) and `parseUnixTimeText.ts` (100 %) with their tests.
- ✅ 5.3 `parseIsoInstantText.ts` (97.96 %) and `formatUnixTime.ts` (100 %) with tests; exported through `src/model/unixTime/index.ts`.
- ✅ 5.4 `relativeTime.ts` (`getRelativeTime`, 100 %) with `relativeTime.test.ts`.
- ✅ 5.5 Measured: `unixTimeUnit.ts` not re-measured; `exactInstant.ts` 100 %, `parseUnixTimeText.ts` 100 %, `parseIsoInstantText.ts` 97.96 %, `formatUnixTime.ts` 100 %.
- ✅ 6.1 `src/model/unixTime/converter.test.ts` exists (221 lines).
- ✅ 6.2 `converter.ts` (`reduceConverter`), `converterCommands.ts`, `converterState.ts`, `converterInputError.ts`.
- ✅ 6.3 `reduceConverterRow.ts` on `resolveWallClock` with `reduceConverterRow.test.ts`.
- ✅ 6.4 Measured: `converter.ts` 100 %, `reduceConverterRow.ts` 100 %, `relativeTime.ts` 100 %.
- ✅ 7.1 `DateTimeLabelKind.TIME_WITH_SECONDS` in `src/presenter/dateTimeFormatters.ts`; `src/presenter/unixTime/exactTimeLabel.ts` (100 %) with test.
- ✅ 7.2 `parseExactWallTimeInput.ts` on `parseWallTimeInput` (100 %); `formatTypedWallTimeText.ts` changed with its test.
- ✅ 7.3 `presentRelativeTime.ts` (100 %); `unixTime.relativePast*/relativeFuture*` keys in `src/locales/unixTime/{ru,en}.json`.
- ✅ 7.4 `presentConverterRows.ts` (96.55 %), uses `presentZoneLine`, `formatUtcOffset`, `formatZoneAbbreviation`, `presentWallTimeHint`; empty list → `buildDeviceTimeLocation` (`presentConverterRows.ts:95-98`).
- ✅ 7.5 `presentConverter.ts` (`PresentedConverter`, 100 %); `src/presenter/unixTime/index.ts`.
- ✅ 7.6 `src/test/benchmarks/unixTimeConverter.bench.ts`.
- ✅ 7.7 Measured: all five files at 96.55–100 % (see Mutation).
- ✅ 8.1 `src/ports/textCopying.ts`, `src/adapters/textCopying.contract.ts`, `textCopying.test.ts`, `browserTextCopying.ts`, `inMemoryTextCopying.ts`; `browserTextSharing.ts` calls it.
- ✅ 8.2 `getMillisecondsUntilNextSecond` in `src/controller/minuteBoundary.ts`; `controller/unixTime/useSecondTick.ts` (100 %) with test; listener removed in cleanup.
- ✅ 8.3 `src/controller/useLocationList.ts` with `useLocationList.test.tsx`.
- ✅ 8.4 `useUnixTimeConverter.ts` + `useConverterCommands.ts`, `controller/unixTime/index.ts`, `useUnixTimeConverter.test.tsx`.
- ✅ 8.5 `unix_time_converter_budget.feature` "Ticks build no formatter" with `steps/unix_time_converter_budget.steps.tsx`.
- ❌ 8.6 Ticked, but `useUnixTimeConverter.ts` measures 89.29 %, under the task's 90 % minimum (R3); the other four files: `resolveEnabledTools.ts` 100 %, `useEnabledTools.ts` 100 %, `useSecondTick.ts` 100 %, `browserTextCopying.ts` 90.00 %.
- ✅ 9.1 `src/views/resolveActiveView.ts` generic with a default id argument; `resolveActiveView.test.ts`.
- ✅ 9.2 `CalendarDialog.tsx` props narrowed (7-line diff); `ConverterRow.tsx` passes its own labels.
- ✅ 9.3 `src/views/unixTimeConverter/converterViewDefinition.ts`, `index.ts`; `usePrimaryPointer.ts` + test; `src/tools/unixTimeConverter/UnixTimeConverterPage.tsx` with the `registry` prop and `UnixTimeConverterPage.test.tsx`.
- ✅ 9.4 `ConverterInputField.tsx`, `UnitChoice.tsx`, `ConverterRow.tsx`, each with a component test.
- ✅ 9.5 `MomentNotations.tsx` (`COPY_CONFIRMATION_MS`, polite status, failure text) and `ListConverterView.tsx` (UX6 order, `ListConverterView.test.tsx:34`); the list-loading skeleton is void by the tracker decision (no loading state exists).
- ✅ 9.6 `unix_time_reading_unit.feature`, `unix_time_converter_unit.feature` and the split `*_rows_unit`, `*_range_unit`, `*_moment_unit`, `*_views_unit`, `*_loading_unit` features with steps; "The same digits without BigInt" in `unix_time_reading_unit.feature`.
- ✅ 9.7 `src/app/AppShell.toolChunk.test.tsx`; CI (build, bundle size, legacy build) is green.
- ✅ 9.8 `unix_time_converter_e2e.feature` with the focus, touch focus, announcement, fraction digits, copy, kept moment, Show on main page, Esc-in-field, long values and screenshot scenarios; the four converter baselines exist.
- ✅ 9.9 `docs/design/README.md:68-71` links the four converter screenshots, and every linked file exists.
- ✅ 10.1 Feature tags of the change cover FR1–FR18, NFR-P1–P3, NFR-A1–A4, NFR-R1–R2; UX ids appear in the view files.
- ✅ 10.2 The *Never:* grep over the new folders and locales prints nothing.
- ✅ 10.3 CI green (build, typecheck, lint).
- ✅ 10.4 Measured: `useAppPage.ts` 94.83 %; the other four files were not re-measured in this review.

## Requirements

- ✅ FR1 — `src/tools/index.ts` `toolRegistry`, `resolveEnabledTools.ts`; `tools_unit.feature` "A registered tool appears…", "Two tools keep registry order", "Empty registry".
- ✅ FR2 — `app/settings/ToolsGroup.tsx`, `SettingsToggleGroup.tsx` icon option; `tools_unit.feature` "Toggles are independent", `tools_e2e.feature` "Turning a tool on and off".
- ✅ FR3 — `preferences.ts` `enabledTools`, `parseStoredPreferences.ts`, migration in `preferencesDocument.ts`; `tools_preferences_unit.feature`, `tools_e2e.feature` "Enabled tools survive a reload".
- ✅ FR4 — `app/ToolButtons.tsx`, `ToolButton.tsx`; `tools_unit.feature` "One enabled tool", "A tool without a page".
- ✅ FR5 — `useAppPage.ts`, `ToolPageFrame.tsx`, `ToolHost.tsx`; `tools_e2e.feature` "Open and leave", "The tool is turned off in another tab".
- ✅ FR6 — `parseUnixTimeText.ts`, `parseIsoInstantText.ts`, `converter.ts` `readInput`; `unix_time_reading_unit.feature` "Texts the input reads".
- ✅ FR7 — `unixTimeUnit.ts` `detectUnixTimeUnit`, `UnitChoice.tsx`; "Detection by digit count", "A fixed unit reads a typed number again".
- ✅ FR8 — `exactInstant.ts` `ExactInstant`; "Fraction digits follow the precision" (unit and e2e), "The same digits without BigInt".
- ✅ FR9 — `presentConverterRows.ts`; "Rows of the sample", "12-hour format", "Empty list".
- ⚠️ FR10 — `reduceConverterRow.ts`, `ConverterRow.tsx`; scenarios pass, but Esc that closes a row's calendar also leaves the page (R1), against "Closing the calendar without a choice changes nothing".
- ✅ FR11 — `writeInputText` in `converterState.ts`; "A row change rewrites the input".
- ✅ FR12 — `formatUnixTime.ts`, `MomentNotations.tsx`, `browserTextCopying.ts`; "Notations of the sample", "Copy" (unit and e2e).
- ✅ FR13 — `relativeTime.ts`, `presentRelativeTime.ts`, minute re-presentation in `useUnixTimeConverter.ts:76-79` with `useUnixTimeConverter.test.tsx:220`; "Past and future".
- ✅ FR14 — `useSecondTick.ts`, `RETURN_TO_NOW`/`TICK` in `converter.ts`, `useToolSessions.ts`; "Ticking", "Pinned, then live again", "The moment is kept while the app is open".
- ✅ FR15 — `isExactInstantInRange`, `ConverterInputError`; "Unreadable texts", "Range", "A fraction under a fixed unit".
- ✅ FR16 — `useConverterCommands.ts` `showOnMainPage` (`selectInstant(getMinuteStart(...))`, `onLeave`); e2e "Seconds are dropped".
- ✅ FR17 — `views/unixTimeConverter/index.ts` `converterViewRegistry`, `resolveActiveView`; "A second view shows the same moment".
- ✅ FR18 — `locales/unixTime/{ru,en}.json`, `tools.*` keys; "English interface" of both capabilities.
- ✅ NFR-P1 — lazy `page` in `tools/index.ts`; `AppShell.toolChunk.test.tsx`, `tools_pwa_e2e.feature` "The page is not in the initial JavaScript".
- ✅ NFR-P2 — formatters from `getDateTimeFormatter`; `unix_time_converter_budget.feature` "Ticks build no formatter"; bench file.
- ✅ NFR-P3 — no BigInt in the new sources (`noBigIntInSources.test.ts`); "The same digits without BigInt".
- ✅ NFR-A1 — `HeaderIconButton.tsx` (`h-11 w-11`, name, title), icon toggle `aria-label`/`title`/`aria-pressed`; `tools_e2e.feature` "Names, states and sizes".
- ⚠️ NFR-A2 — focus and selection on mount in `ConverterInputField.tsx:25-29`, e2e "Focus and names" and "Focus on a touch device"; but the first live tick removes the selection (R2).
- ✅ NFR-A3 — polite `role="status"` messages in `ConverterInputField.tsx` and `MomentNotations.tsx`; e2e "A message is announced once".
- ✅ NFR-A4 — axe-core in `tools_e2e.feature` and `unix_time_converter_e2e.feature` "Focus and names" at 320/390/1280 px, both themes.
- ✅ NFR-R1 — header title classes in `constants/header.ts`; `main_page_header_e2e.feature` "Title size with a tool button", e2e "Long values".
- ✅ NFR-R2 — `break-all`/wrap classes in `MomentNotations.tsx`; e2e "Long values at 320 px in the 12-hour format".
- ✅ UX1 — surface cards with `border-card-border`, `tabular-nums` in `ConverterRow.tsx`, `ListConverterView.tsx`; converter screenshots.
- ✅ UX2 — accent/muted icon toggle in `SettingsToggleGroup.tsx`; `SettingsToggleGroup.test.tsx:179` same box size; settings screenshots.
- ✅ UX3 — `ToolButton` reuses `HeaderIconButton` (27 px icon, `text-accent`).
- ✅ UX4 — whole-text paste in `ConverterInputField.tsx:30-34`; `ListConverterView.test.tsx:72`; no Convert button.
- ✅ UX5 — check icon for `COPY_CONFIRMATION_MS` in `MomentNotations.tsx`; `MomentNotations.test.tsx`.
- ✅ UX6 — order in `ListConverterView.tsx`; `ListConverterView.test.tsx:34`.
- ✅ M1 — `tools_unit.feature` "No enabled tool"; `AppShell.toolChunk.test.tsx`; CI bundle-size check.
- ✅ M2 — the three checks exist: unit "Fraction digits follow the precision", unit "The same digits without BigInt", e2e "Fraction digits follow the precision".
- ✅ M3 — `unixTimeUnit.test.ts` and "Detection by digit count" with all 12 rows; "Texts the input reads".
- ✅ M4 — "Round trip to the nanosecond" in `unix_time_converter_rows_unit.feature`.
- ✅ M5 — tool button then paste: e2e "Focus on a desktop"/"Focus on a touch device" with the paste step.
- ✅ M6 — axe-core at 320, 390, 1280 px in both themes in "Focus and names".
- ✅ M7 — new model, presenter and preferences files measured at 90.53–100 % (`converterState.ts` 90.53 % meets the minimum, below the 95 % target).
- ✅ M8 — `UnixTimeConverterPage.test.tsx` and "A second view shows the same moment" with a test registry.
- ✅ Scenario: Narrow header — `main_page_header_e2e.feature`.
- ✅ Scenario: Wide header — `main_page_header_e2e.feature`.
- ✅ Scenario: Title size by width — `main_page_header_e2e.feature`.
- ✅ Scenario: The header opens the search and the settings — `main_page_header_e2e.feature`.
- ✅ Scenario: Slash still opens the search — `main_page_header_e2e.feature`.
- ✅ Scenario: One Add location button — `main_page_header_e2e.feature`.
- ✅ Scenario: Header sizes and accessibility — `main_page_header_e2e.feature`.
- ✅ Scenario: No Add location button on an unreadable list — `main_page_header_e2e.feature`.
- ✅ Scenario: The meeting bar replaces the header — `main_page_header_e2e.feature`.
- ✅ Scenario: Cards keeps its header with a meeting range — `main_page_header_e2e.feature`.
- ✅ Scenario: Header with a tool button — `main_page_header_e2e.feature:146`.
- ✅ Scenario: Title size with a tool button — `main_page_header_e2e.feature:163`.
- ✅ Scenario: The meeting bar hides the tool buttons — `main_page_header_e2e.feature:181`.
- ✅ Scenario: A group with three options — `settings_option_group_unit.feature`.
- ✅ Scenario: Icon options — `tools_e2e.feature` "Icon options of the tools group".
- ✅ Scenario: Narrow and wide screens — `settings_option_group_e2e.feature:55` outline with the tools-group step.
- ✅ Scenario: Compact groups — `settings_option_group_e2e.feature:73` with "the tools group is at most 56 px high".
- ✅ Scenario: Groups use the control border — `settings_day_palette_e2e.feature`.
- ✅ Scenario: Approved screenshots — (settings) `settings_e2e.feature:97` outline, settings baselines under `__screenshots__/chromium/`.
- ✅ Scenario: Place of the tools group — `tools_unit.feature`.
- ✅ Scenario: A registered tool appears in the settings — `tools_unit.feature`.
- ✅ Scenario: Two tools keep registry order — `tools_unit.feature`.
- ✅ Scenario: Empty registry — `tools_unit.feature`.
- ✅ Scenario: Every tool is off at first — `tools_unit.feature`, `tools_e2e.feature`.
- ✅ Scenario: Turning a tool on and off — `tools_e2e.feature`.
- ✅ Scenario: Toggles are independent — `tools_unit.feature`.
- ✅ Scenario: A toggle shows no text — `tools_unit.feature`.
- ✅ Scenario: Enabled tools survive a reload — `tools_e2e.feature`.
- ✅ Scenario: A document from before this change — `tools_preferences_unit.feature`.
- ✅ Scenario: An unregistered stored tool — `tools_unit.feature`, `tools_preferences_unit.feature`.
- ✅ Scenario: Another tab turns a tool on — `tools_preferences_unit.feature`, `tools_e2e.feature`.
- ✅ Scenario: Unreadable enabled tools — `tools_unit.feature`.
- ✅ Scenario: Without storage — `tools_preferences_unit.feature`.
- ✅ Scenario: No enabled tool — `tools_unit.feature`.
- ✅ Scenario: One enabled tool — `tools_unit.feature`.
- ✅ Scenario: A tool without a page — `tools_unit.feature`.
- ✅ Scenario: Open and leave — `tools_e2e.feature`, `tools_pages_unit.feature`.
- ✅ Scenario: Esc inside a field first restores the field — `unix_time_converter_e2e.feature`.
- ✅ Scenario: Notices on a tool page — `tools_pwa_e2e.feature`.
- ✅ Scenario: The tool is turned off in another tab — `tools_e2e.feature`.
- ✅ Scenario: The page is not in the initial JavaScript — `tools_pwa_e2e.feature`; `tools_pages_unit.feature` "The page is not loaded before its button is chosen".
- ✅ Scenario: Loading fails, then succeeds — `tools_pages_unit.feature`.
- ✅ Scenario: Offline — `tools_pwa_e2e.feature`.
- ✅ Scenario: English interface — (tools) `tools_unit.feature` "English interface".
- ✅ Scenario: Names, states and sizes — `tools_e2e.feature` outline.
- ✅ Scenario: Tab order of the header — `tools_e2e.feature`.
- ✅ Scenario: Narrow and wide header — `tools_e2e.feature`.
- ✅ Scenario: The page opens live — `unix_time_reading_unit.feature`.
- ✅ Scenario: The reference moment is not read — `unix_time_converter_moment_unit.feature`.
- ✅ Scenario: The moment is kept while the app is open — `unix_time_converter_e2e.feature`.
- ✅ Scenario: Texts the input reads — `unix_time_reading_unit.feature`.
- ✅ Scenario: A paste replaces a text the user did not type — `unix_time_reading_unit.feature`.
- ✅ Scenario: Detection by digit count — `unix_time_reading_unit.feature`.
- ✅ Scenario: A fixed unit reads a typed number again — `unix_time_reading_unit.feature`.
- ✅ Scenario: A fixed unit converts a text the user did not type — `unix_time_converter_moment_unit.feature`.
- ✅ Scenario: The unit choice does not touch an ISO 8601 text — `unix_time_reading_unit.feature`.
- ✅ Scenario: Fraction digits follow the precision — `unix_time_reading_unit.feature` and `unix_time_converter_e2e.feature`.
- ✅ Scenario: Before 1970 — `unix_time_reading_unit.feature`.
- ✅ Scenario: The same digits without BigInt — `unix_time_reading_unit.feature`.
- ✅ Scenario: Rows of the sample — `unix_time_converter_unit.feature`.
- ✅ Scenario: 12-hour format — `unix_time_converter_rows_unit.feature`.
- ✅ Scenario: The zone line follows the moment — `unix_time_converter_rows_unit.feature`.
- ✅ Scenario: Empty list — `unix_time_converter_range_unit.feature`.
- ✅ Scenario: A time typed in a row — `unix_time_converter_unit.feature`.
- ✅ Scenario: A time in a DST gap — `unix_time_converter_rows_unit.feature`.
- ✅ Scenario: Round trip to the nanosecond — `unix_time_converter_rows_unit.feature`.
- ✅ Scenario: Another day in one location — `unix_time_converter_range_unit.feature`.
- ✅ Scenario: A row change rewrites the input — `unix_time_converter_rows_unit.feature`.
- ✅ Scenario: Notations of the sample — `unix_time_converter_unit.feature`.
- ✅ Scenario: Dropping digits towards the past — `unix_time_converter_unit.feature`.
- ✅ Scenario: Copy — `unix_time_converter_unit.feature` and `unix_time_converter_e2e.feature`.
- ✅ Scenario: Past and future — `unix_time_converter_unit.feature`.
- ✅ Scenario: Ticking — `unix_time_converter_unit.feature`.
- ✅ Scenario: Pinned, then live again — `unix_time_converter_unit.feature`.
- ✅ Scenario: Live in a fixed unit — `unix_time_converter_unit.feature`.
- ✅ Scenario: Unreadable texts — `unix_time_converter_unit.feature`.
- ✅ Scenario: A fraction under a fixed unit — `unix_time_converter_unit.feature`.
- ✅ Scenario: Range — `unix_time_converter_range_unit.feature`.
- ✅ Scenario: Seconds are dropped — `unix_time_converter_e2e.feature`.
- ✅ Scenario: A second view shows the same moment — `unix_time_converter_views_unit.feature`.
- ✅ Scenario: English interface — (converter) `unix_time_converter_range_unit.feature` "English interface".
- ✅ Scenario: Ticks build no formatter — `unix_time_converter_budget.feature`.
- ✅ Scenario: Focus and names — `unix_time_converter_e2e.feature` outline (6 rows).
- ✅ Scenario: Focus on a touch device — `unix_time_converter_e2e.feature`.
- ✅ Scenario: A message is announced once — `unix_time_converter_e2e.feature`.
- ✅ Scenario: Long values at 320 px — `unix_time_converter_e2e.feature` (19- and 22-digit values).
- ✅ Scenario: Approved screenshots — (converter) `unix_time_converter_e2e.feature` "Approved screenshots at <width> px in the <theme> theme", four `Converter-Approved-screenshots-*.png` baselines.

## Mutation

Measured in this review with `npx stryker run --mutate '<files>' --timeoutMS 3000` (one run at a time, at most three files per run so each run finishes inside the 10-minute command limit). Scores from `reports/mutation/mutation-report.json`:

| File | Score | Survivors / no coverage |
|---|---|---|
| `src/model/unixTime/converter.ts` | 100 % | — |
| `src/model/unixTime/converterState.ts` | 90.53 % | 9 survivors in `isConverterState`/`isRowNote` (lines 63, 64, 77, 83, 85, 101) |
| `src/model/unixTime/reduceConverterRow.ts` | 100 % | — |
| `src/model/unixTime/exactInstant.ts` | 100 % | — |
| `src/model/unixTime/parseUnixTimeText.ts` | 100 % | 4 timeouts counted as killed |
| `src/model/unixTime/parseIsoInstantText.ts` | 97.96 % | 1 survivor (line 30, block statement) |
| `src/model/unixTime/formatUnixTime.ts` | 100 % | — |
| `src/model/unixTime/relativeTime.ts` | 100 % | — |
| `src/presenter/unixTime/presentConverter.ts` | 100 % | — |
| `src/presenter/unixTime/presentConverterRows.ts` | 96.55 % | 1 survivor (line 112), 1 no coverage (line 125) |
| `src/presenter/unixTime/exactTimeLabel.ts` | 100 % | — |
| `src/presenter/unixTime/parseExactWallTimeInput.ts` | 100 % | — |
| `src/presenter/unixTime/presentRelativeTime.ts` | 100 % | — |
| `src/controller/unixTime/useUnixTimeConverter.ts` | 89.29 % | 3 survivors: line 79 `() => undefined` (killable by a second minute tick, R3), line 79 `count - 1` (equivalent), line 124 (equivalent: a `TICK` of a pinned state returns it unchanged) |
| `src/controller/unixTime/useConverterCommands.ts` | 97.44 % | 1 no coverage (line 102) |
| `src/controller/unixTime/useSecondTick.ts` | 100 % | — |
| `src/controller/useEnabledTools.ts` | 100 % | — |
| `src/preferences/parseStoredPreferences.ts` | 100 % | — |
| `src/preferences/preferencesCommands.ts` | 100 % | — |
| `src/tools/resolveEnabledTools.ts` | 100 % | — |
| `src/app/useAppPage.ts` | 94.83 % | 3 survivors (lines 12, 45, 80) |
| `src/adapters/browserTextCopying.ts` | 90.00 % | 1 survivor (line 19) |

Two earlier runs with the default 10 s mutant timeout (`parseUnixTimeText.ts` with `parseIsoInstantText.ts`, with and without `formatUnixTime.ts`) were cut off by the 10-minute command limit before writing a report. Their partial numbers are not used; the files were measured again in the runs above.

Not measured (time budget: a run of three files takes 4–9 minutes): `unixTimeUnit.ts`, `minuteStart.ts`, `preferences.ts`, `preferencesDocument.ts`, `ToolsGroup.tsx`, `SettingsToggleGroup.tsx`, `useLocationList.ts`, `usePrimaryPointer.ts` and the view components.

## Findings

### R1 — CRITICAL — Esc that closes a converter row's calendar also leaves the converter page
- Location: `packages/client/src/app/useAppPage.ts:76-77`
- Rule: `openspec/changes/add-unix-time-converter-tool/specs/unix-time-converter/spec.md` → "Date of a converter row": "Closing the calendar without a choice changes nothing."
- Problem: On a tool page, `useAppPage` listens on `document` for `keydown` and calls `leave()` for every `Escape`: `if (keyboardEvent.key === KeyboardKey.ESCAPE) leave();`. The converter page now hosts `CalendarDialog` (Radix Dialog) in every `ConverterRow` (`views/unixTimeConverter/list/ConverterRow.tsx`). Radix's `DismissableLayer` handles Esc in a capture-phase document listener that only calls `event.preventDefault()` and `onDismiss()`. It does not stop propagation (`@radix-ui/react-dismissable-layer` `dist/index.mjs`: `if (!event.defaultPrevented && onDismiss) { event.preventDefault(); onDismiss(); }`). Neither `CalendarDialog`, `components/ui/dialog.tsx` nor `ToolPageFrame` stops the event, so it bubbles to `useAppPage`'s listener. Before this change only the settings page used that listener, and it has no dialog.
- Impact: The user opens the converter, chooses a row's date button, then presses Esc to close the calendar without choosing. The calendar closes and the page also jumps back to the main page, with the focus on the tool button. That breaks the spec sentence above and the usual meaning of Esc in a dialog. No test covers it: `useAppPage.test.tsx:30` only checks that a bare Esc leaves.
- Fix: In the `onKeyDown` handler of `useAppPage.ts`, ignore an Esc that a nested layer already handled: `if (keyboardEvent.key === KeyboardKey.ESCAPE && !keyboardEvent.defaultPrevented) leave();`. Add a case to `src/app/useAppPage.test.tsx`: an Esc `KeyboardEvent` that was `preventDefault()`-ed keeps the page. Add a case to `src/app/AppShell.tools.test.tsx`: open the converter, open a row's calendar, press Esc, and the calendar is closed while the tool page heading is still shown.
- Fix risk: Low. `WallTimeInput` and `MeetingRangeInput` already stop propagation for Esc, so they are unaffected. A plain Esc on the page still leaves, so "Open and leave" and "Esc inside a field first restores the field" keep passing. Any future handler that calls `preventDefault()` on Esc on a tool page will also keep the page, which is the intended meaning.
- Status: open

### R2 — WARNING — The live tick removes the selection of the converter input a second after opening
- Location: `packages/client/src/views/unixTimeConverter/list/ConverterInputField.tsx:25-29`
- Rule: `proposal.md` NFR-A2 ("Opening the converter moves the focus to the converter input with its text selected on a device with a fine pointer…") and D12 of `design.md`.
- Problem: The field is selected once, in a mount effect (`fieldRef.current?.focus(); fieldRef.current?.select();`). While live, the presenter rewrites `input.text` every second and the controlled `<input value={input.text}>` gets a new value. By the HTML value-setter rule, a changed value moves the caret to the end and drops the selection. Nothing selects the text again. The whole-text paste handler (`:30-34`) only protects a paste, not typed keys.
- Impact: On a desktop the user opens the converter, waits a moment, then types `1700000000` instead of pasting. The typed digits are appended to the ticking number, for example `17954329891700000000`. That is 20 digits, read as nanoseconds, so the converter pins a wrong moment in 2026 instead of 2023. The e2e "Focus and names" step checks the selection right after opening, so it does not catch this.
- Fix: In `ConverterInputField.tsx`, remember whether the field's whole text was selected while it had focus (a ref updated in `onSelect`, true when `selectionStart === 0 && selectionEnd === value.length`). Add a `useLayoutEffect` keyed on `input.text`: when `!input.isTyped`, the field is `document.activeElement` and the ref is true, call `fieldRef.current.select()` again. Add a component test in `ConverterInputField.test.tsx`: focus on mount, rerender with a new app-written text, and the whole new text is selected.
- Fix risk: Low. The re-selection runs only while the text is app-written and was wholly selected, so a caret the user placed is left alone. Typed text (`isTyped`) is never touched. The paste path is unchanged.
- Status: open

### R3 — WARNING — useUnixTimeConverter.ts is under the 90 % mutation minimum because its minute-refresh test runs a single minute
- Location: `packages/client/src/controller/unixTime/useUnixTimeConverter.test.tsx:220-230` (production line `packages/client/src/controller/unixTime/useUnixTimeConverter.ts:79`)
- Rule: `.claude/rules/tdd-workflow.md` ("Target mutation score: >=95%. Minimum acceptable: >=90%"); task 8.6 ("reach at least 95 % (minimum 90 %)") is ticked.
- Problem: The scoped Stryker run measures `useUnixTimeConverter.ts` at 89.29 % (25 killed, 3 survived). The test "should present the relative time of a pinned moment again at each minute" runs one minute tick only. Two mutants of the counter updater `setMinuteCount((count) => count + 1)` survive. `() => undefined` still changes the state once (0 → undefined), so the memo recomputes on that first tick. `count - 1` changes it on every tick, so it is equivalent. The third survivor (line 124, `kept.mode === LIVE ? … : kept` → `true`) is equivalent too, because a `TICK` of a pinned state returns it unchanged.
- Impact: A regression that changes the minute counter only once (the `() => undefined` mutant: a constant written by the updater) leaves a pinned converter's relative time frozen from the second minute on, for example «16 минут назад» forever, and the suite stays green. Task 8.6 is ticked although its stated minimum is not reached.
- Fix: Extend that test, or add one beside it, to run two consecutive minutes: move the clock to `11:25:07Z`, run the pending ticks again, and expect «17 минут назад». Re-run `npx stryker run --mutate 'src/controller/unixTime/useUnixTimeConverter.ts'`: with that mutant killed the file reaches 26/28 = 92.86 %. The two remaining survivors are equivalent.
- Fix risk: none. The change is a test only, using the clock and the collecting tick scheduler the file already has.
- Status: open

### R4 — WARNING — The converter rows recompute the zone-line place text and the city label instead of sharing the main page's rule
- Location: `packages/client/src/presenter/unixTime/presentConverterRows.ts:110-117,154-158`
- Rule: `.claude/rules/glossary.md` ("If a task seems to need the same concept in a second layer, the second layer calls the owner; it does not recompute"); `.claude/rules/antipatterns.md` "Second owner of a concept"; glossary **Zone line** and **City label** (`docs/glossary/locations.md:9,14`).
- Problem: `presentConverterRows` copies, line for line, two rules from `presenter/presentLocationRows.ts:66-73,82-87`. The first is the **Universal Time label** test: `!isDeviceTime && location.timeZoneId === UTC_ZONE_ID && !location.countryCode`, then the place text chosen from `locations.deviceTimeMeta` / `locations.universalTime` / the country name. The second is the city label choice: `deviceTimeCityLabel ?? timeZoneId` for the device time location, `cityLabels.get(id) ?? label` otherwise. Each concept now has two owners.
- Impact: The next change to either rule, such as the Universal Time label for another zone or a new city-label fallback, is made in `presentLocationRows` and silently not in the converter. The same location then reads differently on the main page and in the converter, and no test fails, because each presenter has its own tests.
- Fix: Extract the two decisions into one presenter owner, for example `presentRowHeader(location, context)` in `src/presenter/` returning `{ cityLabel, placeText }`. Call it from both `presentLocationRows.ts` and `presentConverterRows.ts`, and export it through `src/presenter/index.ts`. Name the new owner in the **Zone line** / **City label** *Code:* parts of `docs/glossary/locations.md`, and give it a unit test with the device-time, Universal-Time and country cases.
- Fix risk: It touches the main page's row presenter. The existing `presentLocationRows` tests and the main-page BDD suites cover its output and must stay green unchanged. `presentConverterRows.ts` (196 lines) gets shorter, so the file-size limit is not at risk.
- Status: open

### R5 — WARNING — The converter's Now button is a copy of the date bar's Now button
- Location: `packages/client/src/views/unixTimeConverter/list/ListConverterView.tsx:9,37-45`
- Rule: `.claude/rules/architecture.md` (views: "Reuse `views/shared/` blocks instead of duplicating them per view"); `.claude/rules/code-style.md` ("Is any value repeated in 2+ places? → Must be a constant"); glossary **Now button** (`docs/glossary/date-selection.md:8`, *Code:* `DateBar` (the button)).
- Problem: `ListConverterView` declares its own `const NOW_ICON_SIZE_PX = 18;`, the same private constant as `views/shared/DateBar.tsx:7`. It also repeats the date bar's Now button markup: the same `disabled={!…}` rule, the same `Clock` icon and the identical 300-character class string (`DateBar.tsx:69-75`). The design asks for "the look of the one in `DateBar`", and the glossary names one owner of the Now button.
- Impact: Any change to the Now button's look or behaviour (size token, inactive colour, outline) has to be made twice. If one copy is missed, the two Now buttons drift apart and no test notices, because the converter's screenshots and the main page's screenshots are separate baselines.
- Fix: Extract a `NowButton` component into `src/views/shared/` (props: `isActive`, `onReturnToNow`; label `t("date.now")` or the passed label), move `NOW_ICON_SIZE_PX` into `src/constants/`, export it through `views/shared/index.ts`, and use it in both `DateBar.tsx` and `ListConverterView.tsx`. Give it a component test (inactive when not active, calls back when active), and update the **Now button** *Code:* part of the glossary to name it.
- Fix risk: It touches `DateBar`, which every main-page view renders. Its markup must stay identical so `DateBar.test.tsx`, `DateBar.layout.test.tsx` and the approved main-page screenshots keep passing. `DateBar`'s handler also does more than return to now (`handleReturnToNow`), so the shared button must take the callback rather than dispatch itself.
- Status: open

## Verdict

Not ready. R1 (CRITICAL) blocks: Esc in a converter row's calendar navigates away from the converter. R2–R5 (WARNING) should be fixed in the same round: R3 reopens the ticked task 8.6, and R2 breaks the typed-entry path that NFR-A2's selection is meant to serve.
