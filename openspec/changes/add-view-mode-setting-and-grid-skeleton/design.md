# Design: Add the view mode setting and the Grid view skeleton

Paths are relative to `packages/client/` unless they start with `docs/`. Glossary owners touched: **View mode**, **View registry**, **Grid view**, **Cards view**, **Shared block** (`docs/glossary/views.md`), **Preferences**, **Option group** (`docs/glossary/settings.md`), **Location row** (`docs/glossary/locations.md`). Each is extended in place; no second owner is introduced.

The global decision — the view is always the user's choice, there is no `AUTO` — is an ADR, not a local decision: ADR-0012, written as handoff H1 because `docs/adr/` is outside the implement stage's limits. The decisions below are local to this change and follow ADR-0002 (layers), ADR-0004 (persistence) and ADR-0005 (registry, minus its `AUTO` rules).

## D1. The view mode is a stored view id or "none chosen"

### Context
FR3, FR4, FR6. `Preferences` lives in `src/preferences/`, a pure model that must not import the views (`.claude/rules/architecture.md`: "never import React, the DOM, i18next, the presenter or adapters"; ADR-0002 dependency rule). The view ids (`ViewId`) and the registry live in `src/views/`. ADR-0004 requires that a stored reference that no longer resolves does not make the document unreadable, while a value of the wrong type does.

### Decision
- `Preferences.viewMode: string | null` — the id of the chosen view, `null` when none is chosen. `DEFAULT_PREFERENCES.viewMode` is `null`. This mirrors the existing owner pattern of `Preferences.interfaceLanguage` (`string | null`, resolved against the locale registry by `resolveInterfaceLanguage`).
- Command `PreferencesCommandType.SET_VIEW_MODE` with `{ viewMode: string }`; the reducer returns the same object when the value is unchanged, as every other preferences command does.
- `parseStoredPreferences` accepts `viewMode` that is `null` or a non-empty string, and rejects anything else (the document is unreadable). It does not check the registry.
- Resolution against the registry happens in `src/views/` only: `resolveActiveView(registry, viewMode)` returns the registered view whose `id === viewMode`, otherwise the view with `DEFAULT_VIEW_ID` (`ViewId.CARDS`, a new constant in `views/viewDefinition.ts`, exported from `@/views`), otherwise `registry[0]`, otherwise `undefined` (empty registry, as the `app-shell` spec requires). The `containerWidth` parameter is removed.
- Storage: `PREFERENCES_SCHEMA_VERSION` goes from 3 to 4. `createPreferencesMigrations` gets step `3: payload => ({ ...payload, viewMode: null })`; `serializePreferencesDocument` writes `viewMode`. Version 1 and 2 documents migrate through all steps.
- Controller: `PreferencesContextValue.setViewMode(viewMode: string)` in `preferencesContext.ts` and `PreferencesProvider.tsx`; a hook `useViewMode(): string | null` in `src/controller/useViewMode.ts` that, like `useHourFormat`, returns `DEFAULT_PREFERENCES.viewMode` outside a provider. Cross-tab sync and the debounced write are the provider's existing paths; nothing new is needed for them.

### Consequences
Positive:
- The model stays free of views; a new view needs no preferences change (G2).
- An unregistered stored id (a view removed in a later version) shows Cards without an unreadable note, and the stored id is kept until the user chooses again.

Negative:
- The model accepts any non-empty string, so a typo in a stored id is caught only at resolution, silently. This is the same trade-off as the interface language.

### Alternatives Considered
**Move `ViewId` into `src/preferences/` and validate against it**: the model would have to change for every new view, against ADR-0005's "Nothing else changes: the model, …".
**Store `"cards"` as the default instead of `null`**: needs the model to know a view id; and an existing user's document would claim a choice the user never made.

## D2. The view group lists the registry by name

### Context
FR1, FR2, NG6, NFR-A1, UX1. The option group (`SettingsOptionGroup`, `src/app/settings/SettingsOptionGroup.tsx`) already shows an option by its name when it has neither `Icon` nor `pictogram`.

### Decision
- New `src/app/settings/ViewModeGroup.tsx`: reads `viewRegistry` from `@/views`, `useViewMode()` and `usePreferences().setViewMode`. It passes to `SettingsOptionGroup` the caption `t("settings.viewModeLabel")`, one option per registry entry in registry order `{ value: view.id, label: t(view.titleKey) }` without `Icon` or `pictogram`, `selectedValue = resolveActiveView(viewRegistry, viewMode)?.id`, and `onSelect = setViewMode`. With an empty registry it renders nothing.
- `SettingsPage.tsx` renders `<ViewModeGroup />` right after the hour format group.
- New locale keys in `src/locales/en.json` and `src/locales/ru.json`: `settings.viewModeLabel` ("View" / «Вид»), `views.gridTitle` ("Grid" / «Сетка»). `views.cardsTitle` exists ("Cards" / «Карточки»).
- The settings test can swap the registry through the existing `src/test/registryOverride.ts` (`withRegistryOverride`) to prove M1 (a test view adds an option with no settings change).

### Consequences
Positive: the names are unambiguous in both languages and fit one row at 320 px; no new component.
Negative: `ViewDefinition.icon` stays unused by the settings for now.

### Alternatives Considered
**Icons only, like the theme**: no established icon distinguishes "cards" from "grid" reliably, and the task names the options by word.

## D3. The view host follows the view mode only

### Context
FR4, FR5, FR6.

### Decision
- `src/app/ViewHost.tsx` drops `containerRef`, `useContainerWidth` and the `mode` prop. It reads `useViewMode()` and calls `resolveActiveView(registry, viewMode)`. It keeps the `registry` prop for tests, the retry and error boundary, the `Suspense` fallback `ViewSkeleton`, and the `data-view-id` attribute.
- Removed: `AutoViewMode` and the `ViewMode` type (`views/viewDefinition.ts`), `ViewDefinition.autoMinWidth`, `CARDS_AUTO_MIN_WIDTH` (`views/index.ts`), `src/controller/useContainerWidth.ts` and its test and export, `src/test/viewContractViewport.ts` and its test. `buildTestView` / `buildTextView` in `src/test/viewFixtures.tsx` lose their `autoMinWidth` parameter.
- The `ResizeObserver` polyfill of the legacy chunk (`src/lib/legacy/`) stays (NG5); only the wording of its requirement changes.

### Consequences
Positive: the host has no measurement effect and no re-render on resize.
Negative: the view-host BDD scenarios of add-main-page-scaffold are rewritten, not kept.

### Alternatives Considered
**Keep `AUTO` as a hidden default**: contradicts FR5 and the owner's decision that the view is always the user's choice.

## D4. Grid is a registry entry over a shared view location list

### Context
FR7, UX3, NFR-P1. Everything `CardsView` does around the list (unreadable list → `LocationsLoadError`, empty state, remove and home announcements, focus to "Add location" after the last removal, wiring of `useLocations`, `useTimeSelection`, `useWallTimeInput`) is view-independent and part of the view contract. Copying it into Grid would make it a second owner (`.claude/rules/glossary.md`).

### Decision
- `ViewId.GRID = "grid"`. Registry entry `gridView` after `cardsView` in `views/index.ts`: `titleKey: "views.gridTitle"`, `icon: Grid3x3` from `lucide-react`, `component: createRetryableLazyView(() => import("./grid/GridView"))`.
- New shared enum `LocationRowLayout { CARD = "card", GRID_ROW = "grid-row" }` in `views/shared/locationRowLayout.ts`, exported from `views/shared/index.ts`.
- New shared block `views/shared/ViewLocationList.tsx` with the prop `rowLayout: LocationRowLayout`: the body of today's `CardsView` moved unchanged, passing `rowLayout` to `LocationList`. `CardsView` becomes `<ViewLocationList rowLayout={LocationRowLayout.CARD} />`; new `views/grid/GridView.tsx` (default export) is `<ViewLocationList rowLayout={LocationRowLayout.GRID_ROW} />`.
- `LocationList` takes `rowLayout` and passes it to each `LocationRow`. For `GRID_ROW` its `<ul>` is one panel: `rounded-md border border-border bg-surface divide-y divide-border`, no gap; for `CARD` it stays `flex flex-col gap-2`. The `<ul>` carries `data-row-layout={rowLayout}` so tests can tell the layouts apart.
- `LocationRow` with `GRID_ROW` drops its own border, rounding and background (the panel draws them) and passes `dayTrack={undefined}` to `ZoneRowContent`, which already renders no `DayTrack` without one. Everything else — drag handle, marks, offset difference, zone line, `LocalDateTime` with the wall-time input, location menu, wall-time hint, clock change note — is the same component, so the row header is shared, not copied. The "Make home" item still depends on `row.dayTrack` from the presenter, unchanged.
- The empty-state key `views.cardsEmptyState` is renamed `views.emptyState` in both locale files and every reference (`englishTexts.ts`, `mainPageE2eHelpers.ts`, `locationsStates.ts`, `locationsUiWorld.tsx`, `locations_storage_ui_unit.steps.tsx`, `locations_device_time_e2e.steps.ts`, `main_page_states_unit.steps.tsx`), because both views show it.
- The date bar is rendered by `AppShell` in the main page's bottom bar, outside the view, so Grid gets it with no change.

### Consequences
Positive: the hour cells change adds its strip inside `LocationRow` / `views/grid/` for `GRID_ROW` only, on top of a row header that is already shared.
Negative: `LocationRow` gains one branch on the layout; it stays under 200 lines (194 today, the branch adds a few).

### Alternatives Considered
**A separate `GridRow` component composing the shared pieces**: duplicates the sortable wiring, the accessible name and the menu items of `LocationRow`.

## D5. The view contract picks its view through the stored view mode

### Context
FR8, NFR-A2. Today `playwright.bdd.config.ts` makes one `view-contract-<id>` project per registry entry and makes `AUTO` pick the view by viewport width (`getContractViewportWidth`). Without `AUTO` that cannot select Grid.

### Decision
- The contract option becomes `contractView: { id: string; preferencesStorageKey: string; preferencesDocument: string }` in `src/test/features/view_contract/steps/view_contract_e2e.fixtures.ts`. The fixture file keeps importing nothing through `@/`.
- `playwright.bdd.config.ts` loads, at run time like the registry, `./src/constants/index.ts` (`STORAGE_KEYS`, `PREFERENCES_SCHEMA_VERSION`) and `./src/preferences/index.ts` (`DEFAULT_PREFERENCES`), and per view builds `JSON.stringify({ schemaVersion: PREFERENCES_SCHEMA_VERSION, payload: { ...DEFAULT_PREFERENCES, viewMode: view.id } })`.
- `showContractView()` registers an init script that writes that document under `STORAGE_KEYS.PREFERENCES` only when the key is missing (as `seedPreferences` does), sets the viewport to a fixed `1280 × 800`, opens the app and still fails unless `[data-view-id]` equals the view's id. No contract scenario seeds its own preferences document today; one that does later must include the view mode.
- Exclusion marker: the tag `@grid-pending-hour-cells` on "Select a time" in `src/test/features/time_selection/time_selection_view_contract_e2e.feature`, with the comment line `# Grid: excluded until the hour cells change; remove @grid-pending-hour-cells there.` above the tags. The config holds `VIEW_CONTRACT_PENDING_TAGS: Partial<Record<string, RegExp>> = { grid: /@grid-pending-hour-cells/ }` and sets it as the `grepInvert` of that view's project; Cards has none. Only "Select a time" needs it: it moves the time through the day track slider (`sliderOf`), which Grid does not have. "Type an exact time" passes, because the Grid row header keeps the wall-time input.

### Consequences
Positive: a contract run selects its view the way a user does, independent of width; the marker is one tag to delete.
Negative: the config imports two more source modules at run time.

### Alternatives Considered
**Switch the view through the settings page in the fixture**: adds a settings round-trip to every contract scenario and depends on the settings UI.
**Skip Grid in the contract until it is complete**: hides regressions of everything Grid already does.

## D6. Width and orientation checks in a real browser

### Context
FR5, M3.

### Decision
`settings_view_mode_e2e.feature` chooses Grid at 1280 px, then sets the viewport to 375 px and 2560 px and asserts `[data-view-id="grid"]` each time. Orientation is emulated by swapping the viewport of a phone in portrait (390 × 844) to landscape (844 × 390), the layout change a turn causes; Playwright has no rotation API.

### Consequences
Positive: the checks run in a real layout engine.
Negative: a real device rotation is not exercised; the viewport swap is its layout equivalent.

### Alternatives Considered
**jsdom resize in unit tests**: jsdom has no layout, so it cannot show that nothing reacts to the size.

## D7. Test seeds of the current preferences document

### Context
D1 raises the schema to 4 and makes `viewMode` required in a current document.

### Decision
Every test that writes a current-version preferences document adds `viewMode: null` to its payload: `src/test/features/settings/steps/zoneLabelWorld.tsx`, `settings_deploy_time_world.tsx`, `settings_theme_e2e.steps.ts`, `settings_zone_label_unit.steps.tsx`, `settingsE2eHelpers.ts`, `src/test/features/locations/steps/locationsSeedHelpers.ts`, `locations_device_time_storage_unit.steps.ts`, and the adapter tests that write `PREFERENCES_SCHEMA_VERSION` documents (`src/adapters/preferencesDocument.test.ts`, `preferencesRepository.test.ts`). A literal version 3 document in a test stays version 3 and now exercises the new migration step.

### Consequences
Positive: the seeds keep exercising a valid current document.
Negative: several test files change only for the new field.

### Alternatives Considered
**Let `parseStoredPreferences` default a missing `viewMode`**: breaks the rule that a current document missing a value is unreadable, which every other preference follows.
