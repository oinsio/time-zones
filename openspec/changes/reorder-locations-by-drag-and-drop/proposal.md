# Reorder location cards by drag and drop

## Why

Today the user can only add and remove locations, and a new location always goes to the end of the list (`openspec/specs/locations/spec.md`, requirement "Add a location"). The only way to change the order is to remove locations and add them back. But the order matters: `docs/architecture/domain-model.md` says "`locations` order is the display order", and users want the places they check most often at the top.

Audience: every user with two or more locations, on phones (touch), tablets and desktops (mouse, keyboard). The list order is already domain state, and it is already stored ([ADR-0004](../../../docs/adr/0004-local-persistence-strategy.md) envelope, `payload.locations` is an ordered array). So moving a card is a new model command whose result is saved, restored and synced like adding and removing.

## What Changes

- ADDED: the user can move a location card to another position in the Cards view by dragging it by its handle, with a mouse, a pen or a finger.
- ADDED: the same move works from the keyboard (pick up, move with arrow keys, drop, cancel with Esc) and is announced to screen readers.
- ADDED: while a card is dragged, the other cards slide smoothly out of its way, and the dropped card settles into its slot; with "reduce motion" turned on in the system the cards move without animation.
- ADDED: the new order is saved on the device, restored when the app is opened again (also offline) and shown in other open tabs.
- No stored data format change: the list document keeps schema version 1, because its locations are already an ordered array.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `locations`: adds the requirements "Move a location", "Reorder cards by dragging", "Reorder cards with the keyboard", "Smooth reorder transitions", "New order is kept and shared", "Reorder is accessible and fits every screen" and "Reorder strings are localized".

## Impact

- `packages/client/src/`: `model/locations.ts` (new command and error code), `controller/` (`moveLocation` action, reduced-motion hook), `views/shared/` (sortable list, drag handle, announcements), `constants/` (reorder constants), `locales/en.json` and `locales/ru.json`.
- New runtime dependencies in `packages/client/package.json`: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (design D4). They load only with the lazily loaded Cards view.
- Tests: Vitest unit tests next to the changed modules; unit BDD and E2E BDD feature files under `src/test/features/locations/`; the 8 approved "list" screenshots are re-approved because the rows gain a handle.
- No storage schema change, no network.

## Goals

- G1: A user can put any location at any position of the list in one gesture (drag and drop) or one keyboard sequence, without removing and re-adding it.
- G2: The order the user set is the order shown after closing and reopening the app, in 100% of the persistence scenarios (reload, offline reopen, other tab).
- G3: Reordering feels smooth: cards that make room slide over 200 ms instead of jumping; nothing animates for users who asked the system to reduce motion.

## Non-Goals

- NG1: Reordering inside the search results or the suggestions.
- NG2: Sorting the list automatically (by offset, by name, by time).
- NG3: Making reorder part of the view contract that every registered view must pass; only the Cards view exists today and `docs/architecture/views.md` is not changed here (see Q1).
- NG4: Animating adds, removals or list changes that arrive from another tab; only reorder done in this tab animates.
- NG5: Reordering the derived Here entry or a home location; neither exists in the code yet ([ADR-0007](../../../docs/adr/0007-reference-zone-and-device-time.md) plans them).
- NG6: Undo of a move.

## Users & Scenarios

- U1: A user on a phone keeps "Moscow, Almaty, New York" and wants New York first: they drag New York's card by its handle to the top; the cards below slide down.
- U2: A desktop user drags Almaty below New York with the mouse, changes their mind mid-drag and presses Esc; the list stays as it was.
- U3: A keyboard or screen-reader user tabs to "Move Almaty", presses Space, presses Down twice, presses Space, and hears where Almaty landed.
- U4: A user reorders the list, closes the app and opens it the next day offline; the list is in the order they left it.
- U5: A user with "reduce motion" turned on reorders the list; the cards change places without sliding.

## Requirements

### Functional

- FR1: Every location card in the Cards view has a drag handle when the list holds at least 2 locations. Dragging a card by its handle and dropping it at another position moves that location there; the other locations keep their relative order. A list with 1 location shows no handle.
- FR2: Moving a location is a model command. Inputs: the location and its target position (counted from the top of the list after the move, first = 1). Effects: the location is at the target position, the others keep their relative order. Errors: location not found (for example removed in another tab), position outside the list. Moving a location to the position it already holds leaves the list unchanged.
- FR3: A drag that is cancelled (Esc) or dropped outside the list, or dropped at the card's own position, leaves the list as it was and writes nothing to storage.
- FR4: After a move the new order is saved on the device and restored in the same order when the app is opened again, also without a network. The stored document keeps schema version 1.
- FR5: A move made in one open tab appears in every other open tab of the app without a reload; when two tabs write, the last write wins (existing sync).
- FR6: When storage cannot be written, moving still works for the session and the existing storage warning is shown.
- FR7: The handle is keyboard operable: with the handle focused, Space or Enter picks the card up, Up and Down arrows move it by one position, Space or Enter drops it, Esc cancels and restores the original position.
- FR8: Every string of the reorder (handle name "Move {city}", screen-reader instructions, pick-up, move, drop and cancel announcements) exists in English and Russian with identical key sets.

### Non-Functional

#### Performance

- NFR-P1: Moving a location in a list of 50 and presenting the 50 rows again takes at most 50 ms; the new order appears in the same render, with no loading state.
- NFR-P2: The initial JavaScript stays within the existing 150 KB gzipped budget of `scripts/check-bundle-size.mjs`; the drag-and-drop code loads with the Cards view chunk, not the initial bundle.

#### Accessibility

- NFR-A1: axe-core reports no violations for the list with handles, at rest and while a card is picked up with the keyboard, in the light and dark themes.
- NFR-A2: Reorder is fully keyboard operable as in FR7; after a keyboard drop or cancel, focus stays on the moved card's handle.
- NFR-A3: Picking up, moving over a new position, dropping and cancelling are announced through a live region with the city and the position, for example "Moscow moved to position 1 of 3".
- NFR-A4: When the system asks to reduce motion (`prefers-reduced-motion: reduce`), cards change places without a slide transition and without a drop animation; reordering still works.
- NFR-A5: The handle's accessible name includes the city ("Move Moscow") and its target size is at least 44 × 44 CSS px.

#### Responsive

- NFR-R1: A list of 5 locations with handles causes no horizontal scrolling at 320 px and 2560 px, and a dragged card does not make the page scroll horizontally.
- NFR-R2: A card can be moved by touch on a phone-sized touch screen (375 px class, the `mobile-chrome` project) and with a mouse on a desktop (the `chromium` project).
- NFR-R3: The approved "list" screenshots at 375 px and 1024 px in both themes show the handles.

## UX Acceptance Criteria

- UX1: While a card is dragged, the cards it passes slide to their new places with a 200 ms transform transition (`REORDER_TRANSITION_DURATION_MS`), and on drop the card settles into its slot with an animation of the same duration — no card jumps between positions.
- UX2: The dragged card stays on the list's vertical axis, is raised above the others (shadow) and keeps its width; the slot it leaves is held open until the drop.
- UX3: The handle is a grip icon at the leading edge of the card, separate from the remove action; dragging starts only from the handle, so scrolling the page over a card and tapping the remove action keep working. A mouse drag starts after the pointer moves at least 4 px, so a click on the handle is not a drag.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | 2 or more locations | each card: handle, city, country and UTC offset, remove action; cards can be reordered |
| any | 1 location | the card without a handle (FR1); nothing to reorder |
| any | no locations | empty state unchanged; no handle |
| any | stored list unreadable | error with reset unchanged; no reorder |
| any | storage cannot be written | reorder works for the session; storage warning shown (FR6) |
| any | loading | none: the list is read synchronously and a move re-renders in the same frame; the existing view skeleton is unchanged |
| offline | any of the above | same behaviour: reorder needs no network |

## Behavior

Feature files under `packages/client/src/test/features/locations/`, tagged `@reorder-locations-by-drag-and-drop`:

- `locations_reorder_unit.feature` — moving, errors, cancel and same-position drops writing nothing, persistence, other tab, storage failure, localization, performance (vitest-cucumber, jsdom);
- `locations_reorder_e2e.feature` — mouse, touch and keyboard drags, announcements, focus, transitions and reduced motion, axe-core, layout, reopen and offline reopen (playwright-bdd).

## Visual Reference

[docs/design](../../../docs/design/README.md) screens do not show a drag handle. The handle uses the existing `lucide-react` icon set and existing design tokens (muted foreground, accent focus outline, border, surface); no new colour tokens. Design tokens are the source of truth.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR8, NFR-P1, NFR-P2, NFR-A1–NFR-A5, NFR-R1–NFR-R3 and UX1–UX3 have at least one automated test tagged or commented with `reorder-locations-by-drag-and-drop`.
- M2: In the list Almaty, Moscow, Kolkata, Tokyo the model produces exactly these results — 7 of 7: Almaty to position 4 → Moscow, Kolkata, Tokyo, Almaty; Tokyo to 1 → Tokyo, Almaty, Moscow, Kolkata; Moscow to 3 → Almaty, Kolkata, Moscow, Tokyo; Kolkata to 2 → Almaty, Kolkata, Moscow, Tokyo; Moscow to 2 → list unchanged; position 0 and position 5 → position-out-of-range error; an unknown location → location-not-found error.
- M3: Mutation score of the new or changed model, controller and view code is at least 95% (minimum 90%).
- M4: axe-core reports 0 violations in 4 checks (at rest and while picked up, light and dark themes).
- M5: 0 storage writes after a cancelled drag and after a drop at the card's own position (2 unit scenarios); the reordered list is restored after a reload and after an offline reopen in both E2E projects (4 runs).
- M6: The card displaced by a keyboard move runs a 200 ms `transform` transition (1 E2E check); with reduced motion it runs 0 transitions (1 E2E check).
- M7: `pnpm check:bundle-size` passes with the initial JavaScript at or below 150 KB gzipped.

## Open Questions

- Q1: Should reorder join the view contract in `docs/architecture/views.md` so that the Grid view must support it too? Left to a docs change; this change keeps reorder in the shared list block, so a view that reuses it gets reorder for free.
- Q2: When the Here entry and home arrive ([ADR-0007](../../../docs/adr/0007-reference-zone-and-device-time.md)), should a home location be pinned to the top? Decided with the change that adds home; reorder here moves stored locations only.
