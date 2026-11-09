# Specs review: add-view-mode-setting-and-grid-skeleton

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 32/32 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Freshness

- ✅ "the view host picks a view by container width (`AUTO`)" (proposal.md:7) — `packages/client/src/app/ViewHost.tsx:29-35` defaults `mode = AutoViewMode.AUTO` and calls `resolveActiveView(registry, mode, containerWidth)` with `useContainerWidth(containerRef)`.
- ✅ "the preferences hold no view mode" — `src/preferences/preferences.ts` `Preferences` has `theme`, `hourFormat`, `interfaceLanguage`, `zoneLabelParts` only; `src/adapters/preferencesDocument.ts:31-42` serializes those four.
- ✅ "the settings page has no view group" — `src/app/settings/SettingsPage.tsx` renders two `SettingsOptionGroup`s (theme, hour format), `ZoneLabelGroup`, `InterfaceLanguageGroup`; no view group.
- ✅ Removed names exist today: `AutoViewMode`, `ViewMode`, `ViewDefinition.autoMinWidth` (`src/views/viewDefinition.ts:9-28`), `CARDS_AUTO_MIN_WIDTH` (`src/views/index.ts:13`), `useContainerWidth` + test + export (`src/controller/useContainerWidth.ts`, `src/controller/index.ts:13`), `src/test/viewContractViewport.ts` + test, `getContractViewportWidth` used in `playwright.bdd.config.ts:10,69`.
- ✅ Callers named in task 3.3 are the real users of `buildTestView`/`buildTextView` and `autoMinWidth`: `src/app/ViewHost.test.tsx`, `main_page_states_unit.steps.tsx`, `date_selection_date_bar.steps.tsx`, `main_page_view_host_unit.steps.tsx`, and `src/app/AppShell.test.tsx:27`.
- ✅ `PREFERENCES_SCHEMA_VERSION = 3` (`src/constants/preferences.ts`), migrations `1`, `2` in `createPreferencesMigrations` (`src/adapters/preferencesDocument.ts:18-29`); step `3` is new.
- ✅ D7's version-dependent test locations are accurate: `preferencesDocument.test.ts:64` (`schemaVersion: 4`), `:105` (`3`), `preferencesDocument.zoneLabel.test.ts:60` (`4`), `preferencesRepository.test.ts:60,112` (`3`), `settings_zone_label_unit.steps.tsx:25` (`LEGACY_SCHEMA_VERSION = PREFERENCES_SCHEMA_VERSION - 1`) used at `:179`; current-version seeds at `zoneLabelWorld.tsx:136`, `settings_theme_e2e.steps.ts:33`, `settingsE2eHelpers.ts:80`, `locationsSeedHelpers.ts:104`; `settings_deploy_time_world.tsx:46` spreads `DEFAULT_PREFERENCES`. A tree-wide grep for `schemaVersion` finds no other current-version preferences seed.
- ✅ `useHourFormat` returns `DEFAULT_PREFERENCES` outside a provider (`src/controller/useHourFormat.ts`); `PreferencesContextValue` in `src/controller/preferencesContext.ts:15-27`; `createInMemoryPreferencesBackend` in `src/adapters/inMemoryPreferencesRepository.ts:19`; `src/test/writeSchedulers.ts` exists.
- ✅ `SettingsOptionGroup` shows the name as text when neither `Icon` nor `pictogram` is set (`src/app/settings/SettingsOptionGroup.tsx:11,30`).
- ✅ `src/test/registryOverride.ts` exports `withRegistryOverride` and `registryOverride`.
- ✅ `views.cardsTitle` ("Cards" / «Карточки») and `views.cardsEmptyState` exist in `src/locales/en.json:25-26`, `ru.json:25-26`; the D4 rename list matches every file that references `cardsEmptyState` (`grep -rln cardsEmptyState src`).
- ✅ `LocationRow.tsx` is 194 lines; its `<li>` carries `rounded-md border border-border bg-surface` (`src/views/shared/LocationRow.tsx:148`); "Make home" depends on `row.dayTrack` (`:115`); `LocationList` `<ul className="flex flex-col gap-2">` (`LocationList.tsx:128`); `ZoneRowContent` renders `DayTrack` only when `dayTrack` is set (`ZoneRowContent.tsx:111`); `LocalDateTime` uses `md:w-44` and renders the time button before `<time>` (`LocalDateTime.tsx:47-66`).
- ✅ The date bar is rendered by `AppShell` outside the view (`src/app/AppShell.tsx:108` `bottomBar={<DateBar />}`), so Grid gets it unchanged (D4).
- ✅ `CardsView` holds the view-independent list logic D4 moves to `ViewLocationList` (load error, empty state, announcements, focus after last removal) — `src/views/cards/CardsView.tsx`.
- ✅ The contract theme-colour step reads the first `listitem` background (`src/test/features/locations/steps/locations_view_a11y_e2e.steps.ts:73-79`); `readThemeColours` lives in `src/test/features/main_page/steps/themeTokens.ts`.
- ✅ Reused E2E steps exist: "the current time is {string}" (`locations_local_time_e2e.steps.ts:45`), "the app is installed for offline use" (`settings_theme_e2e.steps.ts:56`), "the user reopens the locations app without network" (`locations_tabs_offline_e2e.steps.ts:56`).
- ✅ Only "Select a time" uses the day track slider among `@view-contract` scenarios (`time_selection_view_contract_e2e.steps.ts:13` `sliderOf`); "Type an exact time" uses the wall-time input; the storage-unavailable contract state only makes `setItem` throw (`locations_ui_e2e.fixtures.ts:139-144`), so a preferences document seeded on the first load keeps Grid selected.
- ✅ `seedPreferences` writes only when the key is missing (`settingsE2eHelpers.ts:44-52`), as D5 says; no `@view-contract` scenario seeds preferences today.
- ✅ The settings E2E scenarios task 6.4 extends exist: "Caption and options in one row" and "Compact groups" (`settings_option_group_e2e.feature:55,71`), "Both languages" (`settings_e2e.feature:46`), "Approved screenshots of the settings" (`settings_e2e.feature:92`).
- ✅ Every `MODIFIED` requirement exists in `openspec/specs/` under the same name and keeps all its stable scenarios: settings "Preferences are kept on the device" (9 stable scenarios kept), "Unreadable stored preferences" (3), "Settings strings are localized" (2), "Settings page layout" (3), "Option group" (4); main-page "Cards view is registered and lazy"; browser-compatibility "Width measurement on legacy engines". The `REMOVED` main-page "View host resolves the active view" exists (`openspec/specs/main-page/spec.md:26`).
- ✅ ADR-0004 load normalization quoted in D1 exists verbatim (`docs/adr/0004-local-persistence-strategy.md:56`).
- ✅ Docs task 1.4 covers every `AUTO` / container-width mention in `docs/architecture` and `docs/glossary` (`views.md:3,13`, `domain-model.md:36,49`, glossary `views.md:6,7`); `views.md:125` "view mode later" exists.
- ✅ Package scripts named in tasks exist: `typecheck`, `test:bdd:gen`, `check:bundle-size`, `check:legacy-build`, `lint`, `test` (`packages/client/package.json`).
- ✅ Not implemented yet: no `viewMode`, `GridView`, `ViewModeGroup` in `src/`, and no archived change under `openspec/changes/archive/` adds a view mode setting.
- ✅ Only other active change `add-pr-preview-deploy` touches `app-delivery` only (`openspec/changes/add-pr-preview-deploy/specs/`).
- ❌ Task 7.2 says `pnpm check:bundle-size` shows "NFR-P1: the Grid chunk is not in the initial JavaScript" (`tasks.md:62`) — the script only checks the total initial size and that a `CardsView-` chunk exists (`packages/client/scripts/check-bundle-size.mjs:24,58-61,92`); it knows nothing about a Grid chunk.

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ settings: View mode, Settings strings, Option group | ✅ 6.1, 6.2, 6.4 |
| FR2 | ✅ | ✅ settings: View mode ("A newly registered view…") | ✅ 6.1, 6.3 |
| FR3 | ✅ | ✅ settings: View mode, Preferences kept, Unreadable; main-page: View host | ✅ 2.1–2.4, 3.1, 3.3, 6.3 |
| FR4 | ✅ | ✅ settings: View mode, Preferences kept; main-page: View host | ✅ 2.5, 3.3, 6.3, 6.4 |
| FR5 | ✅ | ✅ settings: View mode (width, orientation); main-page: View host | ✅ 3.3, 6.4 |
| FR6 | ✅ | ✅ main-page: REMOVED + View host; browser-compatibility | ✅ 1.1–1.4, 3.2, 3.3, 5.2, 7.3, 8.1 |
| FR7 | ✅ | ✅ main-page: Grid view skeleton, Cards view is registered | ✅ 3.2, 4.1–4.4 |
| FR8 | ✅ | ✅ main-page: View contract runs for every registered view (see R1 for the time-selection spec it leaves untouched) | ✅ 5.1–5.3 |
| NFR-P1 | ✅ | ✅ main-page: Cards view is registered and lazy | ✅ 3.1, 3.3, 7.2 |
| NFR-A1 | ✅ | ✅ settings: Accessible view group | ✅ 6.4 |
| NFR-A2 | ✅ | ✅ main-page: View contract | ✅ 5.3 |
| NFR-R1 | ✅ | ✅ main-page: Grid view skeleton; settings: layout, Option group | ✅ 4.4, 6.4 |
| NFR-R2 | ✅ | ✅ settings: Settings page layout | ✅ 6.5 (see R3) |
| UX1 | ✅ | ✅ settings: Option group, Settings page layout (accent fill) | ✅ 6.4 |
| UX2 | ✅ | ✅ settings: View mode ("Switching keeps the selected moment") | ✅ 4.3 |
| UX3 | ✅ | ✅ main-page: Grid view skeleton | ✅ 4.1, 4.4 |
| M1 | ✅ | n/a | ✅ 6.1, 6.3 |
| M2 | ✅ | n/a | ✅ 6.3 |
| M3 | ✅ | n/a | ✅ 6.3, 6.4 |
| M4 | ✅ | n/a | ✅ 1.4, 7.3 |
| M5 | ✅ | n/a | ✅ 5.2, 5.3 |
| M6 | ✅ | n/a | ✅ 5.3, 6.4 |
| G1 | ✅ | n/a — met by FR1, FR4, FR5 | n/a — M3 |
| G2 | ✅ | n/a — met by FR2 | n/a — M1 |
| G3 | ✅ | n/a — met by FR7, FR8 | n/a — M5 |
| G4 | ✅ | n/a — met by FR6 | n/a — M4 |
| NG1 | ✅ | n/a | n/a — no artifact builds hour cells or meeting parts |
| NG2 | ✅ | n/a | n/a — D4 leaves out the day shift mark |
| NG3 | ✅ | n/a | n/a — nothing chooses a view automatically |
| NG4 | ✅ | n/a | n/a — Cards keeps its classes (`rowVariant` defaults to `CARD`, tasks 4.1) |
| NG5 | ✅ | n/a | n/a — polyfill kept (D3, task 3.4) |
| NG6 | ✅ | n/a | n/a — `ViewModeGroup` passes no `Icon` (D2, task 6.1) |

## Consistency

- The change excludes Grid from "Select a time" (`specs/main-page/spec.md:74`, `proposal.md:82`), but the stable `openspec/specs/time-selection/spec.md:591` ("Select a time in every view") says "For every registered view, a time selection in any location MUST change the time shown for every location", and the change has no `time-selection` delta (`proposal.md:42-46`).
- `design.md:100` / `tasks.md:47-48` exclude a contract scenario for one view, while ADR-0005 (Accepted) states under Consequences "A new view cannot skip the contract scenarios" (`docs/adr/0005-view-registry.md`) and `.claude/rules/architecture.md` says "Every view passes the shared view-contract BDD E2E scenarios"; the ADR-0012 content of H1 (`tasks.md:68`) does not record the exception.

## Findings

### R1 — WARNING — Grid exclusion contradicts the stable time-selection contract requirement
- Location: `openspec/changes/add-view-mode-setting-and-grid-skeleton/proposal.md:42-46`; `openspec/specs/time-selection/spec.md:589-591`
- Rule: `.claude/rules/delta-specs.md`; `.gnomish/stages/review-specs/instructions.md` check 6 (external consistency)
- Problem: The stable requirement "Select a time in every view" reads "Selecting a time is part of the view contract (ADR-0002). For every registered view, a time selection in any location MUST change the time shown for every location, and Now MUST return them to the current time." This change registers Grid and deliberately excludes it from the "Select a time" contract scenario (FR8, `specs/main-page/spec.md:74`, task 5.1), yet "Modified Capabilities" lists only `settings`, `main-page` and `browser-compatibility` and there is no `specs/time-selection/spec.md` delta.
- Impact: After archive, `openspec/specs/` says every registered view, Grid included, MUST support a time selection, while the code and the main-page spec say Grid is excluded; the hour-cells change and any reviewer read two contradictory stable specs, and the archived change breaks a stable requirement undeclared.
- Fix: Add `openspec/changes/add-view-mode-setting-and-grid-skeleton/specs/time-selection/spec.md` with `## MODIFIED Requirements` → `### Requirement: Select a time in every view`, copying the full stable text and its scenario "Select a time", and appending: "A view that has no time selection control yet MAY be excluded from this scenario by the marker of `main-page` → View contract runs for every registered view; Grid is excluded until the hour cells change." with `FR8 of add-view-mode-setting-and-grid-skeleton` added to the implements comment. Add `time-selection` to "Modified Capabilities" and a MODIFIED bullet to "What Changes" in `proposal.md`.
- Fix risk: none for code or tests (wording only); the copied requirement must keep the stable scenario unchanged, or the archive drops it.
- Status: open

### R2 — WARNING — ADR-0012 (H1) does not record the per-view contract exclusion that ADR-0005 forbids
- Location: `openspec/changes/add-view-mode-setting-and-grid-skeleton/tasks.md:68`, `tasks.md:72`; `design.md:100`
- Rule: `.claude/rules/architecture.md` ("Every view passes the shared view-contract BDD E2E scenarios"); `docs/adr/0005-view-registry.md` (Consequences: "A new view cannot skip the contract scenarios.")
- Problem: D5 introduces a pending tag `@grid-pending-hour-cells` that removes a contract scenario from the Grid project via `grepInvert`, as task item 08 asks. The global decision record for this change, ADR-0012 written by H1, lists only the removal of `AUTO`, the stored view mode and "the view contract selects each view through the stored view mode"; the status line H1 adds to ADR-0005 supersedes only "`AUTO`, `autoMinWidth` and the settings entry `Auto`". ADR-0005's "A new view cannot skip the contract scenarios" therefore stays in force unchanged.
- Impact: Once merged, an Accepted ADR still forbids what the code does; the next view or the hour-cells change has no ADR that allows or bounds pending exclusions, and the mechanism can spread silently (any view can tag scenarios away) with no recorded rule that it must name the change that brings the scenario back.
- Fix: In task 8.1 add to the ADR-0012 Decision: "A view-contract scenario that a view cannot pass yet because a part of its design is not built may be excluded for that view only, by a pending tag that names the view and the change that re-enables it; every other view still runs it." Extend the ADR-0005 status line H1 writes to "Partly superseded by ADR-0012: `AUTO`, `autoMinWidth`, the settings entry `Auto`, and the consequence that a new view cannot skip contract scenarios (pending exclusions are allowed)." Mention the exclusion in the `## Human follow-up` H1 bullet.
- Fix risk: none for the checkbox tasks — it only grows the H1 patch content; `.claude/rules/architecture.md` stays as it is (a view still passes every scenario it is not pending for).
- Status: open

### R3 — WARNING — The settings-page language screenshots will change but no task re-approves them
- Location: `openspec/changes/add-view-mode-setting-and-grid-skeleton/tasks.md:57`
- Rule: `.claude/rules/test-planning.md` ("The `tasks.md` verification section must list concrete test commands")
- Problem: Task 6.5 re-approves with `--grep "Approved screenshots of the settings"`, which matches only `settings_e2e.feature:92`. The outline "Approved language screenshots in the <theme> theme with the list <state>" (`packages/client/src/test/features/settings/settings_language_e2e.feature:121-133`) takes a whole-page screenshot of the settings page at 375 px ("Then the locations screen matches the approved screenshot"; baselines `src/test/features/__screenshots__/chromium/Approved-language-screenshots-*.png`). The new view group adds a row above the language group, so those 4 baselines per project change. No task command runs them: 6.4 greps `@add-view-mode-setting-and-grid-skeleton`, 7.2 runs `pnpm test` (Vitest only); the "re-approve any other screenshot … that changes" clause gives the implementer no command that would reveal them.
- Impact: The implement stage finishes green while 8 language screenshot scenarios (chromium and mobile-chrome) fail in CI on the pull request.
- Fix: In task 6.5 use `--grep "Approved screenshots of the settings|Approved language screenshots"` for both `--project chromium` and `--project mobile-chrome` with `--update-snapshots`, then the same command without it passes; name the updated `Approved-language-screenshots-*` PNGs in the commit message.
- Fix risk: 8 more PNGs are regenerated, on the same machine type as the other baselines (the existing `SCREENSHOT_MAX_DIFF_PIXEL_RATIO` tolerance applies); no spec change is needed, since "Language choice layout" only requires the approved screenshots to match.
- Status: open

### R4 — SUGGESTION — Task 7.2 claims a bundle check for the Grid chunk that the script does not make
- Location: `openspec/changes/add-view-mode-setting-and-grid-skeleton/tasks.md:62`
- Rule: `.claude/rules/traceability.md` (verification must be explicit)
- Problem: Task 7.2 annotates `pnpm check:bundle-size` with "(NFR-P1: the Grid chunk is not in the initial JavaScript)". `packages/client/scripts/check-bundle-size.mjs` checks the gzipped size of the entry script plus modulepreloads and that a `CardsView-` chunk exists (`:24`, `:58-61`, `:92`); it never looks for a Grid chunk.
- Impact: NFR-P1's traceability points to a check that cannot fail for Grid; a static import of `views/grid/GridView` from shared code would pass 7.2 (only the unit `_payload` check in task 3.1 would remain).
- Fix: In task 7.2 add a step: extend `scripts/check-bundle-size.mjs` to require a separate chunk for every view component, `["CardsView-", "GridView-"]` instead of the single `CARDS_VIEW_CHUNK_PREFIX`, with its failure message naming the view; then run `pnpm run build && pnpm check:bundle-size`.
- Fix risk: the chunk name follows the file name `GridView.tsx`, as `CardsView-` follows `CardsView.tsx`; renaming the file later would need the prefix updated.
- Status: open

## Verdict

Needs revision. No CRITICAL finding; the WARNINGs R1, R2 and R3 should be fixed before implementation: R1 leaves a stable spec contradicting the change, R2 leaves an Accepted ADR contradicting it, and R3 lets CI fail on screenshots the tasks never run. R4 is optional polish.
