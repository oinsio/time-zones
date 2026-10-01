# Open the location search with the "/" keyboard shortcut

## Why

Today the location search opens only from the "Add location" action (`openspec/specs/location-search/spec.md`, requirement "Keyboard-operable search": "it opens from the "Add location" action with Enter"). The action sits below the list in the Cards view, so a keyboard user with several locations has to Tab past every row's remove action to reach it. Pressing `/` is the common web convention for "search" (GitHub, YouTube, MDN, Gmail); supporting it lets keyboard users add a location from anywhere on the main page in one key press.

Audience: keyboard and screen-reader users, and anyone who adds locations often. The shortcut only opens the existing search, so nothing about search data, storage or time math changes; the app stays client-only and offline-first.

## What Changes

- ADDED: pressing `/` on the main page opens the location search exactly as the "Add location" action does — suggestions shown, focus in the query field, the query empty.
- ADDED: the shortcut is ignored while focus is in a text input, a textarea or a contenteditable element, while the search is already open, and when Ctrl, Meta or Alt is held.
- ADDED: the "Add location" action announces its shortcut to assistive technology (`aria-keyshortcuts="/"`).
- No stored data, no network, no time zone or date/time logic changes.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `location-search`: adds the requirement "Open the search with the slash key" — `/` opens the search, its ignore cases, and the shortcut announced on the "Add location" action.

## Impact

- `packages/client/src/`: `views/shared/` (a keyboard shortcut predicate and hook, `LocationSearch.tsx` opens on the shortcut, `AddLocationButton.tsx` gains `aria-keyshortcuts`), `constants/` (the `/` key and DOM constants).
- Tests: Vitest unit tests under `views/shared/`; `locations_search_shortcut_unit.feature` (vitest-cucumber) and `locations_search_shortcut_e2e.feature` (playwright-bdd) under `src/test/features/locations/`.
- No new dependencies, no locale keys (the shortcut has no visible text), no storage schema change.

## Goals

- G1: A keyboard user opens the search from anywhere on the main page with 1 key press instead of Tabbing to the "Add location" action.
- G2: The shortcut never steals the `/` character from text entry and never overrides a browser or OS shortcut that uses Ctrl, Meta or Alt — 0 of the 7 ignore cases of M2 opens the search.

## Non-Goals

- NG1: Other keyboard shortcuts (removing a location, changing the time, settings).
- NG2: A shortcuts help screen or a visible shortcut hint on the "Add location" action.
- NG3: Customizable or remappable bindings.
- NG4: Changes to the search itself — results, ranking, keyboard navigation inside the search, data loading.

## Users & Scenarios

- U1: A user with five locations presses `/`, types "Tokyo", presses Down and Enter, and Tokyo is added — without touching the mouse or Tabbing through the list.
- U2: A user typing "Rio/Brazil" into some text field gets the `/` typed into the field; the search does not open.
- U3: A user presses Ctrl+/ (or Cmd+/) for a browser or OS shortcut; the search does not open.
- U4: A screen-reader user focused on "Add location" hears that `/` is its keyboard shortcut.

## Requirements

### Functional

- FR1: Pressing `/` while the main page shows the "Add location" action opens the location search exactly as that action does: the search shows its suggestions, focus is in the query field and the query is empty (the `/` is not typed into it).
- FR2: The shortcut is ignored while focus is in a text input, a textarea or a contenteditable element; the `/` is entered into that element as usual.
- FR3: The shortcut is ignored while the search is already open: the search stays open and its query does not change.
- FR4: The shortcut is ignored when Ctrl, Meta or Alt is held. Shift is not checked, because on some keyboard layouts `/` is typed with Shift.
- FR5: Closing a search opened with `/` — with Esc or by adding a location — returns focus to the "Add location" action, as when it was opened from the action.
- FR6: The shortcut works only while the "Add location" action is on the page. While the stored list is unreadable (the error with Reset is shown instead of the list and the action), pressing `/` does nothing.

### Non-Functional

#### Performance

- NFR-P1: The shortcut keeps the search data lazy: the data is not requested before the search is first opened (with `/` or the action) and is requested exactly once when `/` opens it.

#### Accessibility

- NFR-A1: The "Add location" action exposes `aria-keyshortcuts="/"`; its accessible name stays "Add location"; axe-core reports no violations in the existing list and empty states in light and dark themes.

#### Responsive

- NFR-R1: No visual change: the 8 approved screenshots of the list and empty states (the states that show the "Add location" action) at 375 px and 1024 px in both themes stay unchanged — no baseline is re-approved.

## UX Acceptance Criteria

- UX1: Pressing `/` opens only the search: the `/` does not appear in the query field and the browser's own action for `/` (for example Firefox quick find) does not start.
- UX2: The search opened with `/` is indistinguishable from the one opened with the action: same suggestions, same keyboard navigation (Down, Enter, Esc) as in "Keyboard-operable search".

## UI States Matrix

| Network | Data | UI on `/` |
|---|---|---|
| any | at least one location | search opens with suggestions, focus in the query field (FR1) |
| any | no locations (empty state) | search opens with suggestions, focus in the query field (FR1) |
| any | stored list unreadable (error with Reset) | nothing happens — no "Add location" action (FR6) |
| any | view loading (skeleton) | nothing happens — the "Add location" action is not on the page yet |
| any | search data loading / failed to load | the search opens in its existing loading / error-with-retry state, as from the action |
| offline | any of the above | same behaviour: the shortcut needs no network; search data works offline after the first visit (existing "Search data states") |
| any | search already open | nothing happens (FR3) |

## Behavior

Feature files under `packages/client/src/test/features/locations/`, tagged `@open-location-search-with-slash-shortcut`:

- `locations_search_shortcut_unit.feature` — `/` opens the search, each ignore case, the unreadable list, lazy data (vitest-cucumber, jsdom);
- `locations_search_shortcut_e2e.feature` — one scenario: `/` opens the search with focus in the query field, a location is added with the keyboard, and the action announces the shortcut (playwright-bdd, every registered view).

## Visual Reference

None — the change has no visible element ([docs/design](../../../docs/design/README.md) screens are unchanged). Design tokens are the source of truth.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR6, NFR-P1, NFR-A1, NFR-R1, UX1 and UX2 have at least one automated test tagged or commented with `open-location-search-with-slash-shortcut`.
- M2: 7 of 7 ignore cases — text input, textarea, contenteditable, search already open, Ctrl, Meta, Alt — leave the search state unchanged in the unit tests, and in the 3 text-entry cases the `/` is not default-prevented.
- M3: Mutation score of the new and changed view code is at least 95% (minimum 90%).
- M4: The E2E scenario adds a location with 0 pointer actions, in 1 of 1 registered view (Cards).
- M5: axe-core reports 0 violations in the 4 existing list and empty accessibility examples (2 states × 2 themes) with the shortcut attribute in place; 0 of the 8 list and empty screenshot baselines is re-approved.

## Open Questions

- Q1: Should the "Add location" action later show a visible hint (`/` key cap or tooltip)? Left out (NG2); it needs a design decision and screens.
- Q2: Keyboard layouts without a `/` key reachable at all (some need AltGr, which browsers report as Ctrl+Alt on Windows) cannot use the shortcut, because FR4 ignores Alt and Ctrl. Accepted for now; a configurable binding is out of scope (NG3).
