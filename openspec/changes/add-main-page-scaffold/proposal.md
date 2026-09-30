# Add main page scaffold

## Why

The app shell shows only a title and renders no view, because the view registry is empty. Every MVP feature (Here entry, locations, reference moment, search, settings) needs a page to live on. Without a prepared main page each feature would invent its own layout, its own loading, error, empty and offline handling, and its own way of picking a view.

This change prepares the main page once, following [ADR-0002](../../../docs/adr/0002-model-presenter-swappable-views.md) and [ADR-0005](../../../docs/adr/0005-view-registry.md): a page with fixed regions, a registry-driven view host (AUTO resolution, lazy loading, per-view failure isolation) and a first registered Cards view that is deliberately empty. Later changes add features by filling regions and the Cards view, not by reshaping the page.

Audience: the developer adding MVP features, and users who from now on see a real main page instead of a bare title.

## What Changes

- ADDED: main page with regions — header (title, slot for future controls), content (active view), bottom bar (slot for the future date control), notices.
- ADDED: view host that reads the view registry, resolves `AUTO` by container width and renders the resolved view lazily.
- ADDED: `Cards` view registered in the registry as a skeleton that shows the empty state; no rows, no model.
- ADDED: UI states of the page: loading (view chunk loading), error (view failed, retry), empty (no locations), offline note, storage-unavailable warning.
- ADDED: `main-page` i18n strings in `en` and `ru`.
- MODIFIED: the shell requirement "empty view registry" — the registry now contains the Cards view and the shell renders the main page.

## Capabilities

### New Capabilities

- `main-page`: the main page regions, view host with AUTO resolution and its UI states.

### Modified Capabilities

- `app-shell`: the view registry is no longer empty; the shell renders the main page.

## Goals

- G1: A new view can be added by one registry entry plus its folder, with no edit to the page (verified by a test that registers a second view).
- G2: Every UI state from the matrix (loading, error, empty, offline, storage unavailable) has a component, a unit test and an axe-core check.
- G3: The next feature change touches only the prepared regions or the Cards view.

## Non-Goals

- NG1: Domain model, clock, Here entry, locations, reference moment, home — any MVP feature.
- NG2: Search overlay and settings screen; the header and bottom bar only expose empty slots.
- NG3: Persisting the `viewMode` preference ([ADR-0004](../../../docs/adr/0004-local-persistence-strategy.md)); the host takes the mode as an input defaulting to `AUTO`.
- NG4: Grid view and day tracks.
- NG5: Storybook and visual regression (see Q2).

## Users & Scenarios

- U1: A user opens the app on a phone and sees the title and an explanation that no locations are added yet.
- U2: A user opens the app on a wide screen; `AUTO` resolves to Cards, the only registered view.
- U3: A user opens the app offline; the page works and shows a short offline note.
- U4: A user in private mode sees a warning that changes will not be saved.
- U5: A view fails to load; the user sees an error with a retry action, and the title and notices stay usable.
- U6: The developer registers a second view; the host can resolve to it without any page edit.

## Requirements

### Functional

- FR1: The main page has regions in order: header with the app title as the only `h1` and an empty slot for controls, content, bottom bar slot, and a polite notices region that keeps the existing offline-ready and update notices.
- FR2: The view host resolves the active view from the registry and the mode (`AUTO` or a view id): for `AUTO` it picks the view with the largest `autoMinWidth` not exceeding the container width, falling back to the view with the smallest `autoMinWidth` when none fits; an unknown view id resolves as `AUTO`.
- FR3: The registry contains the `Cards` view (`ViewId.CARDS`); its component is lazy-loaded and its title key exists in every locale file.
- FR4: The host reacts to container width changes and re-resolves `AUTO` without reloading.
- FR5: While the active view loads, the host shows a skeleton; the header and notices stay visible.
- FR6: If the active view throws or fails to load, the host shows an error message with a retry action, and the rest of the page stays usable. Retry re-renders the view.
- FR7: When there are no locations, the Cards view shows an empty state with an explanation. It has no action button until search exists (Q1).
- FR8: While the browser is offline, the page shows a short non-blocking note that the app works offline; it disappears when the connection returns.
- FR9: When local storage is unavailable, the page shows a warning that changes will not be saved; the app still works.
- FR10: All page strings exist in `en` and `ru`; both files keep identical key sets.

### Non-Functional

#### Performance

- NFR-P1: Initial JavaScript stays at most 150 KB gzipped, and the Cards view is a separate chunk.

#### Accessibility

- NFR-A1: axe-core reports no violations on the main page in each state, in light and dark themes.
- NFR-A2: The offline note, the storage warning and the error message are announced politely or as an alert without taking focus; the retry action works with Tab and Enter.

#### Responsive

- NFR-R1: No horizontal scrolling from 320 px to 2560 px in any state.

## UX Acceptance Criteria

- UX1: The user never sees a blank content area: every state shows text.
- UX2: The page uses design tokens only and follows the system theme.
- UX3: Loading, empty, offline and storage messages do not shift the header.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| online | view chunk loading | skeleton in content |
| online | view failed | error message with Retry |
| online | no locations | empty state text |
| offline | any | same content plus offline note |
| any | storage unavailable | warning banner plus same content |

## Behavior

`packages/client/src/test/features/main_page/main_page.feature`, tagged `@add-main-page-scaffold`.

## Visual Reference

Design tokens are the source of truth ([views.md](../../../docs/architecture/views.md#visual-style)); screens in [docs/design](../../../docs/design/README.md) show the target for the future Cards content, not for this scaffold.

## Affected IA

No changes.

## Success Metrics

- M1: 100% of FR1–FR10 have at least one automated test (vitest-cucumber scenario or Vitest spec).
- M2: axe-core reports 0 violations across 5 states × 2 themes = 10 checks.
- M3: Mutation score of the view-resolution function and host is at least 95% (minimum 90%).
- M4: Adding a second test view to the registry requires 0 edits outside `views/` (checked by a test).
- M5: Initial JavaScript at most 150 KB gzipped; Cards view emitted as a separate chunk.

## Open Questions

- Q1: The empty state's "Add location" action needs the search overlay; assumed to come with the search change, so this change shows text only.
- Q2: Storybook and visual regression are introduced with the first real view content.
- Q3: Whether the Here entry shows in the empty state is decided by the Here-entry change (ADR-0007); this change shows only the explanation.
