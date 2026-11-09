# Review: add-view-mode-setting-and-grid-skeleton

## Summary

| Item | Value |
|---|---|
| Tasks verified | 30/30 |
| Requirements traced | 76/78 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 `docs/glossary/views.md:6-15` — View registry has no width; View mode has the new definition, *RU:* «Вид», the *Code:* owners and *Never:* auto, layout; Cards view lists `views.cardsTitle`; Card (`LocationRowVariant.CARD`), Grid row, Row header are new; Grid view is no longer planned; Shared block lists `ViewLocationList`; View contract names the pending tag.
- ✅ 1.2 `docs/glossary/locations.md:12` names the view component `views/shared/LocationRow.tsx` and `LocationRowVariant`; `:20` Drag handle reads "the only element of a card or a grid row that starts a drag reorder".
- ✅ 1.3 `docs/glossary/settings.md:5,7,13` — Settings page lists the view, Preferences the view mode, Option group the view group shown by name.
- ✅ 1.4 `docs/architecture/views.md:3` (intro, ADR-0012), Catalog has no Auto row, Grid status "skeleton…", Overlays → Settings "view (Cards, Grid; names)", `:137` pending tag; `docs/architecture/domain-model.md:49`; `docs/architecture/overview.md:20`. `grep -rnE "AUTO|Auto\*\*|autoMinWidth|container width" docs/architecture docs/glossary` prints nothing (re-run in this review); glossary files are 15/20/19 lines.
- ✅ 2.1 `src/preferences/preferences.viewMode.test.ts:20-50` — default `null`, `SET_VIEW_MODE`, same object when unchanged, `it.each` accept `null`/`"grid"`/`"timeline"`, reject `undefined`/`""`/`42`/`{}`.
- ✅ 2.2 `src/preferences/preferences.ts:35,43`, `preferencesCommands.ts:76`, `parseStoredPreferences.ts:44`.
- ✅ 2.3 `src/adapters/preferencesDocument.viewMode.test.ts:25-92` — version 3 fixture, versions 1 and 2 (`it.each`), current-version write, `42` unreadable, `"timeline"` loaded.
- ✅ 2.4 `src/constants/preferences.ts:5` (`PREFERENCES_SCHEMA_VERSION = 4`), `src/adapters/preferencesDocument.ts:31,44`; D7 test fixes are in the diff (`preferencesDocument.test.ts`, `preferencesDocument.zoneLabel.test.ts`, `preferencesRepository.test.ts`, `settings_zone_label_unit.steps.tsx`, the seeds in `zoneLabelWorld.tsx`, `settings_theme_e2e.steps.ts`, `settingsE2eHelpers.ts`, `locationsSeedHelpers.ts`).
- ✅ 2.5 `src/controller/useViewMode.ts:10-13`, `preferencesContext.ts` (`setViewMode`), `PreferencesProvider.tsx:151`, export in `controller/index.ts`; `src/controller/useViewMode.test.tsx:35-78` covers outside provider, stored, debounced write and another tab.
- ✅ 3.1 `src/views/resolveActiveView.test.ts:24-48` and `src/views/viewRegistry.test.ts:7-40` (two views in order, lazy, title keys in every locale, `DEFAULT_VIEW_ID`, no `autoMinWidth`).
- ✅ 3.2 `src/views/viewDefinition.ts:6,13` (`ViewId.GRID`, `DEFAULT_VIEW_ID`; `AutoViewMode`, `ViewMode`, `autoMinWidth` gone), `src/views/resolveActiveView.ts`, `src/views/index.ts:20-32` (Grid entry with `Grid3x3`, lazy `./grid/GridView`).
- ✅ 3.3 `src/test/features/main_page/main_page_view_host_unit.feature` (8 scenarios) with `steps/main_page_view_host_unit.steps.tsx`; `src/app/ViewHost.tsx:26-28` reads `useViewMode()` and has no ref or width; `useContainerWidth.ts` and its test deleted; `viewFixtures.tsx` lost `autoMinWidth`.
- ✅ 3.4 `src/test/features/browser_compatibility/browser_compatibility_missing_apis.feature` keeps "View selection without ResizeObserver"; CI is green.
- ✅ 4.1 `src/views/shared/ViewLocationList.test.tsx:48-230` (card and grid-row cases), `LocalDateTime.test.tsx:81-130`, `ZoneRowContent.test.tsx:25-42`.
- ✅ 4.2 `src/views/shared/locationRowVariant.ts:7-55`, `ViewLocationList.tsx`, `rowVariant` through `LocationList.tsx:154,474`, `LocationRow.tsx:136`, `ZoneRowContent.tsx:65,125`, `LocalDateTime.tsx`; key `views.emptyState` in both locales, no `cardsEmptyState` left in the tree; `LocationRow.tsx` 183, `LocationList.tsx` 162, `ViewLocationList.tsx` 104 lines.
- ✅ 4.3 `src/views/cards/CardsView.tsx` and `src/views/grid/GridView.tsx` are one-line wrappers; `views.gridTitle` at `src/locales/en.json:26` / `ru.json:26`; `main_page_grid_view_unit.feature` has the five scenarios with steps.
- ✅ 4.4 `src/test/features/main_page/main_page_grid_view_e2e.feature` (fit at 320/2560, one-line header at 1024, token colours, offline, screenshots) with `steps/main_page_grid_view_e2e.steps.ts`; Grid baselines added under `__screenshots__`.
- ✅ 5.1 `src/test/features/time_selection/time_selection_view_contract_e2e.feature:11-12` — comment line and `@grid-pending-hour-cells`.
- ✅ 5.2 `playwright.bdd.config.ts:47-50,77-92` (`VIEW_CONTRACT_PENDING_TAGS`, `grepInvert`, per-view preferences document); `view_contract_e2e.fixtures.ts:49-63` (init script writes only when missing, 1280 × 800); `viewContractViewport.ts` and its test deleted.
- ✅ 5.3 The Grid contract project runs in CI (`pnpm test:bdd`, `.github/workflows/ci.yml:63`), CI green; the accessibility outline carries `@add-view-mode-setting-and-grid-skeleton @NFR-A2` (`locations_view_contract_e2e.feature:74`).
- ✅ 6.1 `src/app/settings/ViewModeGroup.test.tsx:46-112` (names, order, no `svg`, store, unregistered → Cards, Russian, registry override with a third view, empty registry); `SettingsPage.test.tsx` and `SettingsPage.russian.test.tsx` changed.
- ✅ 6.2 `src/app/settings/ViewModeGroup.tsx:14-28`, `SettingsPage.tsx:135`, `settings.viewModeLabel` at `en.json:122` / `ru.json:122`.
- ✅ 6.3 `src/test/features/settings/settings_view_mode_unit.feature` (8 scenarios) with `steps/settings_view_mode_unit.steps.tsx` and `viewModeWorld.tsx`.
- ✅ 6.4 `src/test/features/settings/settings_view_mode_e2e.feature` (names, arrows, size/focus/accent with axe in both themes, width 375/2560, orientation 390×844 → 844×390, reload); view group added to `settings_option_group_e2e.feature:61,76` and `settings_e2e.feature:51-52`.
- ✅ 6.5 Re-approved PNGs `Approved-screenshots-of-the-settings-*` and `Approved-language-screenshots-*` for both projects are in the diff.
- ✅ 7.1 Re-measured in this review (see Mutation): every file named in 7.1 is at 96.43–100 %.
- ✅ 7.2 `scripts/check-bundle-size.mjs:25,59-65,94-99` — `VIEW_CHUNK_PREFIXES` with `CardsView-` and `GridView-`, failure names the missing prefix; CI green.
- ✅ 7.3 `grep -rnE "AutoViewMode|autoMinWidth|useContainerWidth|getContractViewportWidth|AUTO mode" src playwright.bdd.config.ts` prints nothing (re-run).
- ✅ 7.4 The change name tags under `src/` cover FR1–FR8, NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1–UX3 (e.g. `@NFR-R2` on the screenshot scenarios, `@NFR-A2` on the contract accessibility outline).
- ✅ 8.1 `temporary-docs/gnomish/github-oinsio-time-zones-106/handoff/H1-adr-0012-user-chosen-view.patch` and `README.md`; `git apply --check` succeeds (re-run); `docs/adr/` and `CLAUDE.md` are untouched.

## Requirements

- ✅ FR1 — `ViewModeGroup.tsx:14-28` (caption `settings.viewModeLabel`, options by name, no icon) after the hour format at `SettingsPage.tsx:135`; tests `ViewModeGroup.test.tsx`, `settings_e2e.feature` "Both languages", `settings_option_group_e2e.feature:55-76`.
- ✅ FR2 — options from `viewRegistry.map` in `ViewModeGroup.tsx:22`; "A newly registered view appears in the settings" (`settings_view_mode_unit.feature`) and `ViewModeGroup.test.tsx:98`.
- ✅ FR3 — `DEFAULT_PREFERENCES.viewMode = null`, migration step 3, `resolveActiveView` falls back to `DEFAULT_VIEW_ID`; "Cards by default", "Existing users get Cards", "No view chosen".
- ✅ FR4 — `setViewMode` through the provider's debounced write and cross-tab sync; "Choosing Grid", "The view survives a reload" (unit and E2E), "Another tab changes the view", "A stored view that is not registered".
- ✅ FR5 — `ViewHost.tsx` has no measurement; "Width does not choose the view" (unit), "The view does not follow the width" / "…orientation" (E2E).
- ✅ FR6 — code: M4 greps print nothing; docs: views.md, domain-model.md, glossary changed; ADR-0002/0005 part delivered as handoff H1 (patch applies cleanly), as the proposal defines.
- ⚠️ FR7 — Grid is registered and shows the shared row header in one panel (`locationRowVariant.ts:46-54`, `GridView.tsx`); add, remove, home, typing a time, date bar, Now and the states are covered by the Grid contract run and `main_page_grid_view_*`, and a keyboard pick-up, move and drop runs in Grid in the contract scenario "Device time location under contract" (`locations_view_contract_e2e.feature:30-40`, `@view-contract`, run by the `view-contract-grid` project of `playwright.bdd.config.ts:77-92`), but **no Grid test checks the list order after a reorder** (see R1).
- ✅ FR8 — `@grid-pending-hour-cells` with its comment (`time_selection_view_contract_e2e.feature:11-12`) and `VIEW_CONTRACT_PENDING_TAGS` / `grepInvert` (`playwright.bdd.config.ts:47-50,80`).
- ✅ NFR-P1 — lazy `createRetryableLazyView(() => import("./grid/GridView"))` (`views/index.ts:24`), bundle check for `GridView-` (`check-bundle-size.mjs:25`), "Grid is not loaded while Cards is shown".
- ✅ NFR-A1 — `settings_view_mode_e2e.feature` names, arrow keys, 44 × 44, focus outline, axe in both themes.
- ⚠️ NFR-A2 — the Grid contract run covers axe in every state and theme, keyboard add, remove and focus after removal, and a keyboard pick-up, move and drop in Grid ("Device time location under contract", `locations_view_contract_e2e.feature:35-37`), but **the list order after a keyboard reorder is not checked in Grid** (see R1).
- ✅ NFR-R1 — view group in "Caption and options in one row" at 320/375/1024/2560 in both languages; "Grid fits a <width> px wide screen" at 320/2560.
- ✅ NFR-R2 — settings and language screenshots re-approved (PNGs in the diff), scenarios tagged `@NFR-R2`.
- ✅ UX1 — same `SettingsOptionGroup`; "Size and focus of the view options" asserts the accent fill of the checked option.
- ✅ UX2 — "Switching keeps the selected moment" (`main_page_grid_view_unit.feature`); the list and home live in providers above the host.
- ✅ UX3 — panel and row classes in `locationRowVariant.ts:46-54`; "Grid row header in one line", "Grid rows use the <theme> theme token colours", Grid screenshots.
- ✅ M1 — `ViewModeGroup.test.tsx:56,86,98` (2 names in 2 languages, a third view via `registryOverride` without settings change).
- ✅ M2 — the three starts: "Cards by default" (no document), "Existing users get Cards" (version 3), "A stored view that is not registered".
- ✅ M3 — at once ("Choosing Grid"), reload (E2E "The view survives a reload"), second tab (unit "Another tab changes the view"), 1280 → 375 and 2560 (E2E).
- ✅ M4 — both greps print nothing (re-run in this review).
- ✅ M5 — one `view-contract-<id>` project per registry entry (`playwright.bdd.config.ts:77`), the only `@grid-pending-hour-cells` tag in the tree is on "Select a time".
- ✅ M6 — axe in "Size and focus of the view options" (both themes) and the contract accessibility outline for Grid (both themes).
- ✅ Scenario: View selection without ResizeObserver — `browser_compatibility_missing_apis.feature`, unchanged and green.
- ✅ Scenario: Rows in one panel without hour cells — `main_page_grid_view_unit.feature`.
- ✅ Scenario: Grid row header in one line — `main_page_grid_view_e2e.feature` (bounding boxes at 1024 px).
- ✅ Scenario: Grid rows use the theme token colours — `main_page_grid_view_e2e.feature` outline "Grid rows use the <theme> theme token colours".
- ✅ Scenario: Typing a time in Grid — `main_page_grid_view_unit.feature`.
- ✅ Scenario: Empty Grid — `main_page_grid_view_unit.feature`.
- ✅ Scenario: Unreadable list in Grid — `main_page_grid_view_unit.feature`.
- ✅ Scenario: Grid works offline — `main_page_grid_view_e2e.feature`.
- ✅ Scenario: Grid fits narrow and wide screens — `main_page_grid_view_e2e.feature` outline "Grid fits a <width> px wide screen".
- ✅ Scenario: Approved Grid screenshots — `main_page_grid_view_e2e.feature` outline and the two Grid baselines per project.
- ✅ Scenario: One contract run per registered view — `playwright.bdd.config.ts:77-92`; `showContractView` fails unless `[data-view-id]` is the view's id.
- ✅ Scenario: Grid skips only the marked scenario — `grepInvert` for `grid` only (`playwright.bdd.config.ts:80`); the tag exists once in the tree.
- ✅ Scenario: Chosen view is shown — `main_page_view_host_unit.feature`.
- ✅ Scenario: No view chosen — `main_page_view_host_unit.feature`.
- ✅ Scenario: Unknown view id — `main_page_view_host_unit.feature`.
- ✅ Scenario: Width does not choose the view — `main_page_view_host_unit.feature` (resize observer fake 320 then 2560).
- ✅ Scenario: View mode changes — `main_page_view_host_unit.feature`.
- ✅ Scenario: Registry content — `main_page_view_host_unit.feature`, `viewRegistry.test.ts:8`.
- ✅ Scenario: Second view needs no page change — `main_page_view_host_unit.feature`.
- ✅ Scenario: Grid is not loaded while Cards is shown — `main_page_view_host_unit.feature` (Grid loader `vi.fn()` not called).
- ✅ Scenario: Cards by default — `settings_view_mode_unit.feature`.
- ✅ Scenario: Choosing Grid — `settings_view_mode_unit.feature`.
- ✅ Scenario: Switching keeps the selected moment — `main_page_grid_view_unit.feature`.
- ✅ Scenario: A stored view that is not registered — `settings_view_mode_unit.feature`.
- ✅ Scenario: A newly registered view appears in the settings — `settings_view_mode_unit.feature`.
- ✅ Scenario: The view does not follow the width — `settings_view_mode_e2e.feature` (375, 2560).
- ✅ Scenario: The view does not follow the orientation — `settings_view_mode_e2e.feature`.
- ✅ Scenario: Names and checked state of the view group — `settings_view_mode_e2e.feature`.
- ✅ Scenario: Arrow keys change the view — `settings_view_mode_e2e.feature`.
- ✅ Scenario: Size and focus of the view options — `settings_view_mode_e2e.feature` outline, both themes.
- ✅ Scenario: Choices survive a reload — `settings_e2e.feature:155`, unchanged.
- ✅ Scenario: The language survives a reload — `settings_language_e2e.feature`, unchanged.
- ✅ Scenario: Opening writes nothing — `settings_preferences_unit.feature`, unchanged.
- ✅ Scenario: Offline reopen — `settings_e2e.feature:168`, unchanged.
- ✅ Scenario: Migration of the previous document — `settings_language_storage_unit.feature`, now through step 3 as well.
- ✅ Scenario: Legacy key without a document — `settings_language_storage_unit.feature`.
- ✅ Scenario: The zone label survives a reload — `settings_zone_label_unit.feature`.
- ✅ Scenario: Existing users get both parts — `settings_zone_label_unit.feature` (legacy version pinned to 2, D7).
- ✅ Scenario: Another tab changes the zone label — `settings_zone_label_unit.feature`.
- ✅ Scenario: The view survives a reload — `settings_view_mode_unit.feature` and `settings_view_mode_e2e.feature`.
- ✅ Scenario: Existing users get Cards — `settings_view_mode_unit.feature`.
- ✅ Scenario: Another tab changes the view — `settings_view_mode_unit.feature`.
- ✅ Scenario: Corrupted preferences — `settings_storage_unit.feature`.
- ✅ Scenario: Reset — `settings_storage_unit.feature`.
- ✅ Scenario: Reset returns to the browser language — `settings_language_storage_unit.feature`.
- ✅ Scenario: A view mode of the wrong type — `settings_view_mode_unit.feature`.
- ✅ Scenario: Both languages — `settings_e2e.feature:47-59` with the view column and options.
- ✅ Scenario: The factory name is never translated — `settings_factory_name.feature`, `GnomishFactoryCredit.test.tsx`, unchanged.
- ✅ Scenario: Narrow and wide screens — `settings_e2e.feature:80` "Settings fit a screen <width> px wide".
- ✅ Scenario: Compact groups — `settings_option_group_e2e.feature:72-76` includes the view group.
- ✅ Scenario: Approved screenshots — `settings_e2e.feature:94`, baselines re-approved.
- ✅ Scenario: A group with three options — `settings_option_group_unit.feature`, unchanged.
- ✅ Scenario: An option without an icon or a pictogram shows its name — `settings_option_group_unit.feature`; the view group uses it (`ViewModeGroup.test.tsx:62`).
- ✅ Scenario: Caption and options in one row — `settings_option_group_e2e.feature:55-61` includes the view group.
- ✅ Scenario: Choosing moves nothing — `settings_option_group_e2e.feature:84`, unchanged.
- ✅ Scenario: Select a time — `time_selection_view_contract_e2e.feature:11-13`, runs for Cards, excluded for Grid by the marker.

## Mutation

Measured in this review with scoped Stryker runs, one at a time (`cd packages/client && npx stryker run --mutate '<files>'`), read from `reports/mutation/mutation-report.json`:

| File | Score | Survivors |
|---|---|---|
| `src/preferences/preferencesCommands.ts` | 100.00 % | — |
| `src/preferences/parseStoredPreferences.ts` | 100.00 % | — |
| `src/adapters/preferencesDocument.ts` | 96.43 % | 1: `BlockStatement` emptying `deserializePreferencesDocument` (line 56), a function this change did not touch |
| `src/views/resolveActiveView.ts` | 100.00 % | — |
| `src/controller/useViewMode.ts` | 100.00 % | — |
| `src/app/settings/ViewModeGroup.tsx` | 100.00 % | — |
| `src/views/shared/ViewLocationList.tsx` | 100.00 % | — |
| `src/app/ViewHost.tsx` | 100.00 % | — |
| `src/views/shared/locationRowVariant.ts` | 88.24 % | 2: `StringLiteral` → `""` on the `GRID_ROW` `placeAndTime` (line 49) and `place` (line 50) classes — see R2 |
| `src/views/shared/LocalDateTime.tsx` | 100.00 % | — |

Not measured: `LocationRow.tsx`, `LocationList.tsx`, `ZoneRowContent.tsx`, `useLocationMenuItems.ts` (moved code), `GridView.tsx` / `CardsView.tsx` (one-line wrappers).

## Findings

### R1 — WARNING — No Grid test checks the list order after a reorder
- Location: `packages/client/src/test/features/main_page/main_page_grid_view_e2e.feature:1`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: FR7 and the `main-page` delta "Grid view skeleton" (`specs/main-page/spec.md:14`) say "In Grid the user MUST be able to … reorder the list", and NFR-A2 says that in Grid "adding, removing, reordering and the focus after a removal work with the keyboard". Grid does run one keyboard reorder: the view-contract scenario "Device time location under contract" (`locations_view_contract_e2e.feature:30-40`, tagged `@view-contract` with no pending tag, so it runs in the `view-contract-grid` project, `playwright.bdd.config.ts:77-92`) picks up "Almaty" with the keyboard, moves it up 1 time and drops it, and its pick-up step (`locations_reorder_drag_e2e.steps.ts:126-133`) focuses the move handle, presses Space and expects the "picked up" announcement. But the scenario then makes the moved row home and removes it before `Then the locations list order is "Moscow"` (line 39), so the order the drop produced is never asserted in Grid. The scenarios that do assert the order after a reorder ("Move a card down with the keyboard", `locations_reorder_e2e.feature:66-75`, and the rest of that file) run only on the default view, Cards, and neither `main_page_grid_view_*.feature` nor the "with grid rows" block of `ViewLocationList.test.tsx:147-230` checks an order after a move.
- Impact: a regression where a drop in Grid is announced but leaves the list order unchanged (for example the grid variant's sortable `<li>` losing its sortable id or transform, so the row falls back to its old place) passes CI, because the only Grid reorder removes the moved row before checking the order. The outcome of FR7's "reorder the list" in Grid stays unverified.
- Fix: add to `main_page_grid_view_e2e.feature` a scenario tagged `@add-view-mode-setting-and-grid-skeleton @FR7 @NFR-A2` that reuses the existing steps of "Move a card down with the keyboard" (`locations_reorder_e2e.feature:68-76`, steps in `locations/steps/locations_reorder_drag_e2e.steps.ts` and `locations_reorder_checks_e2e.steps.ts`, same `locations_ui_e2e.fixtures` as the Grid steps): `Given the view mode is Grid`, `And the stored locations are "Moscow", "Almaty", "New York"`, `And the user opens the locations app`, pick up "Moscow" with the keyboard, move it down 2 times, drop it, `Then the locations list order is "Almaty", "New York", "Moscow"` and focus is on the move handle "Move Moscow". The contract scenario already proves the pick-up and its announcement in Grid; this scenario adds the outcome. It belongs in an `_e2e.feature` (`.claude/rules/bdd-e2e.md`) because dnd-kit keyboard sorting needs real layout.
- Fix risk: low — one more E2E scenario on both browser projects; if the "picked-up card" step wording reads oddly for a grid row, keep the existing step text rather than adding a synonym step.
- Status: fixed
- Resolution: added E2E scenario "Move a Grid row down with the keyboard" to main_page_grid_view_e2e.feature, asserting the list order and move-handle focus after the drop in Grid; test:bdd passes (1113).

### R2 — WARNING — Mutation score of locationRowVariant.ts is 88.24 %, below the 90 % minimum
- Location: `packages/client/src/views/shared/locationRowVariant.ts:49`
- Rule: `CLAUDE.md` → Mutation testing ("target >=95%, minimum acceptable >=90%"); `.claude/rules/tdd-workflow.md` Step 5
- Problem: the `GRID_ROW` entries `placeAndTime: "md:flex-1"` (line 49) and `place: "md:flex-1 md:flex-row md:items-baseline md:gap-x-2"` (line 50) can be replaced by `""` and every unit test still passes. `ZoneRowContent.test.tsx:25-42` only checks the card variant (`md:w-64`), and `ViewLocationList.test.tsx` checks the grid list, row and date order but not the place column. These two classes are what puts Grid's zone line on the city's line from 768 px (FR7, UX3).
- Impact: the file is below the project's minimum score, and a change that drops the grid place-column classes is caught only by the E2E "Grid row header in one line", not by the unit suite that Stryker and TDD rely on.
- Fix: in `src/views/shared/ZoneRowContent.test.tsx`, add a `describe("ZoneRowContent for a grid row")` that renders with `rowVariant={LocationRowVariant.GRID_ROW}` and asserts, the same way the existing card test does (`screen.getByText("Almaty").parentElement?.parentElement`), that the place column has `md:flex-row` and not `md:w-64`, and that its parent (the place-and-time block) has `md:flex-1` and not `md:flex-none`. Re-run `npx stryker run --mutate 'src/views/shared/locationRowVariant.ts'` and confirm ≥ 90 % (target 95 %).
- Fix risk: low — the tests assert Tailwind class names, which the file already does for the card variant; a later layout tweak of the grid row header must update them.
- Status: fixed
- Resolution: added grid-row and card place-and-time class tests in ZoneRowContent.test.tsx and ViewLocationList.test.tsx; locationRowVariant.ts mutation score 94.1% (16/17, was 88.2%).

## Verdict

Ready — no CRITICAL findings. R1 and R2 (both WARNING) should be fixed but do not block. Outside the code: handoff H1 (ADR-0012 and the status lines of ADR-0002 and ADR-0005) must be applied by a human. Until then the Accepted ADR-0005 still describes `AUTO`, and the new links to `docs/adr/0012-user-chosen-view.md` in `docs/architecture/` lead nowhere.
