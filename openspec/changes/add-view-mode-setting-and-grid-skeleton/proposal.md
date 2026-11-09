# Add the view mode setting and the Grid view skeleton

No other active change touches the capabilities this change modifies: the only one, `add-pr-preview-deploy`, changes `app-delivery`.

## Why

The app is getting a second view, Grid, for planning a meeting range. Its design is approved (`docs/architecture/views.md` → Grid, `docs/design/README.md` → Grid), but there is no way to reach it: the preferences hold no view mode, the settings page has no view group, and the view host picks a view by container width (`AUTO`), which the owner rejected — a view that changes when a window is resized or a phone is turned makes the app unpredictable. The view is always the user's choice.

This change is the first step towards Grid: the setting and the skeleton of the view. Later changes add the hour cells, the hour frame and the meeting range to the same skeleton. Until then Grid is reachable in the settings and grows piece by piece.

Audience: every user (the setting, Cards stays the default) and the developers of the next Grid changes (the skeleton they build on).

## What Changes

- ADDED `settings` → **View mode**: a new option group «Вид» / "View" on the settings page, one compact row like the theme and the hour format, with one option per registered view, «Карточки» / "Cards" and «Сетка» / "Grid". Cards is the default for new and existing users. The choice applies at once, is stored on the device with the other preferences, survives a reload and is shared between tabs. A stored view that is no longer registered shows Cards.
- MODIFIED `settings` → **Preferences are kept on the device**: the view mode is part of the stored preferences; a document of an earlier version gets "no view chosen" (Cards).
- MODIFIED `settings` → **Unreadable stored preferences**: the defaults include Cards; a stored view mode of the wrong type makes the document unreadable, an unregistered view id does not.
- MODIFIED `settings` → **Settings strings are localized**: the Russian names «Вид», «Карточки», «Сетка».
- MODIFIED `settings` → **Option group**: the view group is built from the same option group, and shows each option by its name.
- MODIFIED `settings` → **Settings page layout**: the view group takes one row at every width; the approved settings screenshots are re-approved once.
- REMOVED `main-page` → **View host resolves the active view** (`AUTO`, the container width and re-resolving on resize), replaced by ADDED `main-page` → **View host shows the chosen view**: the host shows the view of the view mode, Cards when none is chosen or the chosen one is not registered.
- MODIFIED `main-page` → **Cards view is registered and lazy**: the registry holds Cards and Grid, in this order, both lazy.
- ADDED `main-page` → **Grid view skeleton**: Grid shows the location rows with the shared row headers, arranged as in the Grid design, in one panel, without hour cells, plus the date bar and every state of the main page.
- ADDED `main-page` → **View contract runs for every registered view**: the view contract runs against Grid too; the scenarios that need hour cells are excluded for Grid by a visible marker until the hour cells change.
- MODIFIED `browser-compatibility` → **Width measurement on legacy engines**: wording only — the `ResizeObserver` polyfill no longer serves view selection by width; it still makes a `ResizeObserver` available and the app still starts on the chosen view.
- REMOVED: `AutoViewMode`, the `ViewMode` type of `views/`, `ViewDefinition.autoMinWidth`, `useContainerWidth`, `src/test/viewContractViewport.ts`. Every view-contract run picks its view through the stored view mode, not through the viewport width.
- Docs: `docs/architecture/views.md` (intro, Catalog without Auto, Grid status, Overlays → Settings), `docs/architecture/domain-model.md` (`viewMode`), `docs/architecture/overview.md` (ADR table).
- Glossary (`docs/glossary/views.md`, `docs/glossary/settings.md`):
  - **View mode** changed: the user's choice of a registered view, Cards when none is chosen; no auto; *Code:* `Preferences.viewMode`, `SET_VIEW_MODE`, `DEFAULT_VIEW_ID`, `resolveActiveView`, `settings.viewModeLabel`;
  - **View registry** changed: no minimum container width;
  - **Grid view** no longer planned: *Code:* `GridView`, `views.gridTitle`;
  - new **Grid row** and **Row header**; **Shared block** gains the view location list (`ViewLocationList`);
  - **Preferences** and **Settings page** list the view mode.
- ADR (handoff H1, `docs/adr/` is outside the factory's limits): new ADR-0012 "The user chooses the view; no automatic choice by width". It supersedes the `AUTO` parts of ADR-0005 and of ADR-0002 (its "Swappable views" section); both get a status line, and `CLAUDE.md` lists ADR-0012.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `settings`: the view mode preference and its option group, its storage and migration, its strings, layout and screenshots.
- `main-page`: the view host without `AUTO`, the registry with Grid, the Grid view skeleton and the view contract for every registered view.
- `browser-compatibility`: the legacy `ResizeObserver` requirement no longer mentions view selection by width.

## Goals

- G1: The user chooses between Cards and Grid in the settings, and the chosen view is the one the main page shows, on every width and orientation.
- G2: A third view, once registered, appears in the settings with no change to the settings page.
- G3: Grid is a working view skeleton that later changes extend with hour cells, the hour frame and the meeting range, without reshaping the setting, the registry or the view contract.
- G4: No code, spec or doc describes an automatic, width-based choice of the view any more.

## Non-Goals

- NG1: No hour cells, hour frame, meeting range, meeting handles, meeting bar or «Поделиться встречей» in Grid.
- NG2: No day shift mark («днём раньше / днём позже») in either view.
- NG3: No automatic view choice of any kind: not by width, orientation, device type or first-launch screen size.
- NG4: No change of the Cards view's look or behaviour.
- NG5: The `ResizeObserver` polyfill of the legacy support chunk stays; whether any dependency still needs it is a separate question for the legacy-support owner.
- NG6: No view icons in the settings: the view options show their names.

## Users & Scenarios

- U1: A phone user opens the settings, sees «Вид: Карточки | Сетка» with «Карточки» checked, and keeps it.
- U2: A desktop user who plans meetings checks «Сетка», goes back and sees the locations as grid rows in one panel with the date bar; after a reload, and in a second tab, Grid is still shown.
- U3: A user on Grid resizes the window to phone width or turns the tablet; Grid stays.
- U4: A developer of the hour cells change works inside `views/grid/` and re-enables the excluded contract scenario by removing one tag.

## Requirements

### Functional

- FR1: The settings page shows a view group captioned "View" / «Вид» with one option per registered view, "Cards" / «Карточки» and "Grid" / «Сетка». It is one compact row built from the existing option group, placed right after the hour format group, and each option shows its name.
- FR2: The view group's options come from the view registry, in registry order. Registering another view adds its option with no change to the settings page.
- FR3: Without a chosen view the app shows Cards and the view group checks «Карточки»: on the first launch, and for every existing user, whose stored preferences hold no view mode yet.
- FR4: Choosing a view applies it to the main page at once, with no reload. The choice is stored on the device with the other preferences, is in force from the first render after a reload, and is applied in every other open tab without a reload. A stored view that is not registered shows Cards and the view group checks «Карточки». Nothing is written until the user changes a setting.
- FR5: The shown view never changes by itself: not when the window is resized, not when the screen is turned.
- FR6: `AUTO` and the choice of a view by container width are removed from the code (no `AUTO` mode, no minimum width per view, no width measurement of the view host) and from the documents that describe them: ADR-0005 and ADR-0002 (by ADR-0012, handoff H1), `docs/architecture/views.md`, `docs/architecture/domain-model.md` and the glossary (View mode, View registry).
- FR7: Grid is registered in the view registry after Cards. It shows the location rows in list order, each with the shared row header (drag handle, mark, city, offset difference, zone line, local time and date, location menu, row note), all rows in one panel separated by dividers, and no hour cells. From 768 px the row header is one line, as in the Grid design: city, offset difference and zone line on the left, date, time and location menu on the right. The date bar stays under it. Everything that does not need hour cells works in Grid: adding and removing a location, setting and clearing home, reordering, typing an exact time, the date bar, the Now button, and the loading, error, empty, offline and storage-unavailable states.
- FR8: The view contract runs against Grid. Each contract scenario that cannot pass without hour cells is excluded for Grid only, by a marker on the scenario that names the change that brings it back (the hour cells change). Today this is one scenario: "Select a time".

### Non-Functional

#### Performance

- NFR-P1: Grid is loaded lazily: while Cards is shown, the Grid component is not part of the initial JavaScript, and the existing bundle-size check passes.

#### Accessibility

- NFR-A1: The view group is a radio group named by its visible caption "View" / «Вид», one Tab stop, the arrow keys moving the choice in display order, every option at least 44 × 44 px with a visible focus outline. axe-core reports no violations on the settings page in the light and the dark theme.
- NFR-A2: Grid passes the accessibility and keyboard scenarios of the view contract: axe-core reports no violations in every state of the contract outline, in both themes, and adding, removing, reordering and the focus after a removal work with the keyboard.

#### Responsive

- NFR-R1: At 320, 375, 1024 and 2560 px, in English and in Russian, the caption and the options of the view group share one row. Grid does not scroll horizontally at 320 px and at 2560 px.
- NFR-R2: The approved settings screenshots (375 px and 1024 px, both themes) are re-approved once, now showing the view group with Cards checked.

## UX Acceptance Criteria

- UX1: The view group reads like the theme and the hour format groups: caption at the start of the row, joined options at the end, the checked option filled with the accent colour.
- UX2: Switching the view keeps everything the user set: the location list, home, the chosen date and time. Only the presentation changes.
- UX3: A Grid row reads as the row header of the Grid design (`docs/design/README.md` → Grid, `docs/architecture/views.md` → Grid → Row header) without its hour strip and without the day shift mark (NG2): one line from 768 px with the date before the time; the rows sit in one panel separated by dividers, not as separate cards; each row keeps the surface token background, and the panel border and the dividers use the border token colour.

## UI States Matrix

The view group shows a local preference and loads nothing. Grid shares the states of the main page:

| Network | Data | UI |
|---|---|---|
| any (online or offline) | no stored preferences, or no view chosen | Cards shown, «Карточки» checked (FR3) |
| any | stored view mode Grid | Grid shown from the first render, «Сетка» checked (FR4) |
| any | stored view mode not registered | Cards shown, «Карточки» checked (FR4) |
| any | stored preferences unreadable | defaults (Cards); unreadable note with Reset on the settings page (unchanged) |
| any | storage unavailable / save failed | the chosen view applies for the session; save-failed note and storage warning (unchanged) |
| any | Grid chunk loading | the view skeleton (`ViewSkeleton`) |
| offline, Grid chunk not cached | Grid chunk fails to load | the view error with Retry (`ViewErrorFallback`) |
| any | Grid, location list empty | the empty-state explanation and the header "Add location" action |
| any | Grid, stored location list unreadable | the load error with Reset (`LocationsLoadError`) |
| offline | Grid, list present | Grid works fully; no note |

## Behavior

- New `packages/client/src/test/features/settings/settings_view_mode_unit.feature` and `settings_view_mode_e2e.feature`, new `packages/client/src/test/features/main_page/main_page_grid_view_unit.feature` and `main_page_grid_view_e2e.feature` (`@add-view-mode-setting-and-grid-skeleton`).
- Rewritten `packages/client/src/test/features/main_page/main_page_view_host_unit.feature`.
- The `@view-contract` features run for Grid; `time_selection_view_contract_e2e.feature` → "Select a time" carries the Grid exclusion marker.

## Visual Reference

No Figma. The Grid row header follows `docs/design/screens/grid-*.html` without the hour strip; colours come from the design tokens (`--color-surface`, `--color-border`, `--color-accent`).

## Affected IA

No changes.

## Success Metrics

- M1: The view group has 2 of 2 registered views as options, in registry order, with the names "Cards", "Grid" and «Карточки», «Сетка» in 2 of 2 interface languages, and a test view added to the registry adds a third option with 0 changed lines in `src/app/settings/`.
- M2: In 3 of 3 starts without a chosen view (no document, a version 3 document, a stored unregistered id) the main page shows Cards and «Карточки» is checked.
- M3: After choosing Grid, Grid is shown in 4 of 4 checks: at once, after a reload, in a second tab without a reload, and after resizing the viewport from 1280 px to 375 px and to 2560 px.
- M4: 0 matches of `AutoViewMode`, `autoMinWidth`, `useContainerWidth` and `getContractViewportWidth` under `packages/client/src/` and `packages/client/playwright.bdd.config.ts`, and 0 matches of `AUTO` or "container width" as a way to choose a view in `docs/architecture/` and `docs/glossary/`.
- M5: The view contract runs for 2 of 2 registered views; for Grid every `@view-contract` scenario but 1 ("Select a time") runs and passes.
- M6: axe-core reports 0 violations on the settings page in 2 of 2 themes and on Grid in every state of the contract accessibility outline in 2 of 2 themes.

## Open Questions

None. Showing the view options by name rather than by icon, and the stored form of the view mode, are settled in `design.md` (D2, D1).

## Impact

- `packages/client/src/preferences/` (`viewMode`, `SET_VIEW_MODE`, parsing), `src/adapters/preferencesDocument.ts` (schema version 4 and its migration), `src/constants/preferences.ts`, `src/controller/` (`setViewMode`, `useViewMode`; `useContainerWidth` removed), `src/views/` (registry with Grid, `resolveActiveView`, `viewDefinition.ts`, new `grid/GridView.tsx`, new shared `ViewLocationList.tsx`, `LocationRowVariant`, `rowVariant` in `LocationList`, `LocationRow`, `ZoneRowContent`, `LocalDateTime`), `src/app/ViewHost.tsx`, `src/app/settings/` (`ViewModeGroup.tsx`, `SettingsPage.tsx`), `src/locales/en.json`, `src/locales/ru.json`.
- Tests: the view host, registry, preferences, settings, Grid unit and E2E features, the view-contract fixture and `playwright.bdd.config.ts`, every test seed of a current-version preferences document, the approved settings screenshots.
- `docs/architecture/views.md`, `docs/architecture/domain-model.md`, `docs/architecture/overview.md`, `docs/glossary/views.md`, `docs/glossary/settings.md`; ADR-0012 and the status lines of ADR-0002 and ADR-0005 and `CLAUDE.md` by handoff H1.
- No new dependency.
