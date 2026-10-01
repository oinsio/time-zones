# Design: Reorder location cards by drag and drop

## Context

Driven by FR1–FR8, NFR-P1, NFR-P2, NFR-A1–NFR-A5, NFR-R1–NFR-R3 and UX1–UX3 of `proposal.md` (see proposal.md — Why). Current state, checked in `packages/client/src/`:

- `model/locations.ts` has `LocationCommandType` `ADD_LOCATION`, `REMOVE_LOCATION`, `REPLACE_LOCATIONS`, `LocationErrorCode` `DUPLICATE_LOCATION`, `UNKNOWN_TIME_ZONE`, `LOCATION_NOT_FOUND`, and the pure `reduceLocations`. `model/store.ts` notifies subscribers only when the reducer returns a new state object.
- `controller/LocationsProvider.tsx` dispatches through `dispatchAndSchedule`, which schedules a debounced write (`LOCATIONS_WRITE_DEBOUNCE_MS` = 300, flushed on `pagehide`) after every `ok` outcome; changes from other tabs arrive through `repository.subscribe` as `REPLACE_LOCATIONS`. `controller/locationsContext.ts` defines `LocationsContextValue`; `useLocations` returns `{ rows, locations, ...rest }` of it.
- `adapters/locationsDocument.ts` stores `{ schemaVersion: 1, payload: { locations: [...] } }`; `payload.locations` is the list in display order, and loading keeps that order (spec "List survives a reload").
- `views/cards/CardsView.tsx` renders `LocationList` from `views/shared/`; `LocationList` maps rows to `LocationRow` and moves focus after a removal; `LocationRow` is a `forwardRef` to its remove button (`min-h-11 min-w-11`, accessible name `locations.removeLocation`). The Cards view is lazy-loaded through the registry in `views/index.ts`; `app/` imports `@/views`, not `@/views/shared`.
- No drag-and-drop library is installed (`packages/client/package.json`); nothing in `src/` reads `prefers-reduced-motion`; `test/setup.ts` stubs `window.matchMedia` with `matches: false`. The project has no Storybook.
- No home location and no derived Here entry exist in the code yet (NG5).

Binding rules: ADR-0002 and `.claude/rules/architecture.md` — model is "pure TypeScript — never import React, the DOM, i18next…", "state changes only through command objects with a `type` enum and a pure reducer", "expected failures are returned as typed errors, not thrown"; controller "maps UI events to commands; views never call the reducer or ports directly" and "owns side effects … persistence, cross-tab sync"; views "render presenter output and emit events only", "keep view state (scroll, open panels, focus) local", "reuse `views/shared/` blocks". ADR-0004 — "Stored documents are `{ schemaVersion, payload }`; a schema change requires a migration": none is needed here because the order is already stored. `.claude/rules/code-style.md` — numbers and strings in branching go to `src/constants/` or enums.

## Goals / Non-Goals

**Goals:** a move is one model command saved, restored and synced by the existing persistence path; drag state stays in the view; one library supplies pointer, touch and keyboard dragging with announcements and transform transitions.

**Non-Goals:** no new port, adapter, storage key or schema version; no change to the presenter; no global ADR — the library is used by one shared view block only (D4).

## Decisions

### D1. Model: `MOVE_LOCATION` command

`LocationCommandType.MOVE_LOCATION` with `{ type, id: string, targetIndex: number }`; `targetIndex` is the 0-based index in the list after the move, i.e. the spec's position − 1. New `LocationErrorCode.LOCATION_POSITION_OUT_OF_RANGE`. The list logic lives in a new pure `model/moveLocation.ts` (`moveLocationInList(locations, id, targetIndex): LocationsReduceResult`-style result) so `locations.ts` stays small; `reduceLocations` delegates to it.

Rules (FR2): unknown `id` → `LOCATION_NOT_FOUND`; `targetIndex` not an integer, `< 0` or `> locations.length - 1` → `LOCATION_POSITION_OUT_OF_RANGE`; `targetIndex` equal to the current index → `{ ok: true, state }` with the **same** state object (the store does not notify); otherwise remove and insert at `targetIndex`, returning a new array. Ids, zones, labels and country codes are copied unchanged — no offset is stored. Exported from `model/index.ts`.

Alternatives: a `beforeId` anchor instead of an index — rejected, both the keyboard and pointer paths end at an index, and an index makes "position out of range" testable. A `REPLACE_LOCATIONS` with the reordered list from the view — rejected, it skips validation and puts list logic into the view.

### D2. Controller: `moveLocation` and write only on change

`LocationsContextValue` gains `moveLocation: (id: string, targetIndex: number) => LocationsReduceResult`; `LocationsProvider` builds it with `dispatchAndSchedule`. `dispatchAndSchedule` now reads `store.getSnapshot()` before dispatching and schedules a write only when `outcome.ok` **and** the snapshot changed (FR3: a same-position move writes nothing). Add and remove always produce a new state on success, so their behaviour is unchanged. Persistence, the `pagehide` flush, the storage-failure flag (FR6) and cross-tab sync (FR5) are the existing paths: `repository.save` broadcasts, the other tab receives `REPLACE_LOCATIONS`. `LOCATIONS_SCHEMA_VERSION` stays 1 (FR4).

### D3. Controller: `usePrefersReducedMotion`

New `controller/usePrefersReducedMotion.ts`, exported from `controller/index.ts`: `useSyncExternalStore` over `window.matchMedia(REDUCED_MOTION_MEDIA_QUERY)` with its `change` event; returns `false` when `matchMedia` is missing. Reading a media query is an environment side effect, so it sits in the controller next to `useOnlineStatus` and `useContainerWidth`, and views receive a boolean (NFR-A4).

### D4. Library: `@dnd-kit` in the view layer

Add `@dnd-kit/core` `^6.3.1`, `@dnd-kit/sortable` `^10.0.0` and `@dnd-kit/utilities` `^3.2.2` to `dependencies`. They ship their own TypeScript types and support React 18. They give, in one place: a pointer sensor (mouse, pen, touch) with an activation distance, a keyboard sensor with `sortableKeyboardCoordinates` (Space/Enter pick up and drop, arrows move, Esc cancels — FR7), a built-in live region with configurable announcements and screen-reader instructions (NFR-A3, FR8), `verticalListSortingStrategy` that moves the other items with CSS transforms and a configurable transition (UX1), and focus restoration to the activator after a drop or cancel (NFR-A2).

The library is imported only by `views/shared/` files used by the Cards view, which is lazy-loaded, so it stays out of the initial bundle (NFR-P2, checked by `pnpm check:bundle-size`). It touches no model, controller or port, and can be replaced inside `views/shared/` alone, so this is a local decision rather than an ADR; if a second view adopts drag and drop, that is the time to record it in `docs/adr/`.

Alternatives: native HTML5 drag and drop — no keyboard support, unreliable touch support on mobile browsers, a browser ghost image instead of smooth sliding. A hand-written pointer + FLIP implementation — more code and a11y work to own for the same result. `@hello-pangea/dnd` — larger, opinionated about DOM structure. `framer-motion` `Reorder` — larger and without keyboard reordering.

### D5. View: sortable list, handle and announcements

- `views/shared/LocationList.tsx` takes a new `onMove: (id: string, targetIndex: number) => void` and wraps the rows in `DndContext` + `SortableContext` (`items` = row ids, `verticalListSortingStrategy`). Sensors: `PointerSensor` with `activationConstraint: { distance: REORDER_POINTER_ACTIVATION_DISTANCE_PX }` (UX3) and `KeyboardSensor` with `sortableKeyboardCoordinates`. `modifiers={[restrictToVerticalAxis]}` (UX2). `onDragEnd` calls `onMove` only when `getMoveTargetIndex(rows, active.id, over?.id)` returns an index; cancel does nothing (FR3). Its existing focus-after-removal logic is unchanged. No `DragOverlay`: the dragged card itself moves, so no duplicate of the card and its accessible names appears during a drag.
- `views/shared/reorderTarget.ts`: pure `getMoveTargetIndex(rows, activeId, overId): number | undefined` — `undefined` when `overId` is missing (dropped outside), equal to `activeId`, or unknown; otherwise the index of `overId`.
- `views/shared/reorderModifiers.ts`: `restrictToVerticalAxis: Modifier` that returns the transform with `x: 0` (no extra `@dnd-kit/modifiers` package).
- `views/shared/reorderTransition.ts`: pure `getReorderTransition(prefersReducedMotion)` → `{ duration: REORDER_TRANSITION_DURATION_MS, easing: REORDER_TRANSITION_EASING }`, or `null` when motion is reduced (NFR-A4, UX1).
- `views/shared/LocationRow.tsx` takes `isReorderable: boolean` and `prefersReducedMotion: boolean`, calls `useSortable({ id: row.id, transition: getReorderTransition(prefersReducedMotion), attributes: { roleDescription: t("locations.reorderRoleDescription") } })`, puts `setNodeRef` on the `<li>`, and sets `style={{ transform: CSS.Transform.toString(transform), transition }}`. While `isDragging` the `<li>` gets `relative z-10 shadow-lg` (UX2); the `<li>` itself is translated, so it keeps its width and its place in the layout, and the list keeps its height. The drop animation (UX1) is `useSortable`'s default `animateLayoutChanges`: after a drop it moves the dropped card from where it was released into its new slot with the same `transition`; with `transition` `null` (reduced motion) it animates nothing (NFR-A4). The handle is rendered first in the row only when `isReorderable`.
- `views/shared/DragHandle.tsx`: a `<button type="button">` with `aria-label={t("locations.moveLocation", { city })}`, the dnd-kit `attributes` and `listeners`, `ref={setActivatorNodeRef}`, a `GripVertical` icon from `lucide-react` (`aria-hidden`), and the classes `flex min-h-11 min-w-11 touch-none cursor-grab items-center justify-center rounded-md text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent` — 44 px target like the remove button (NFR-A5), `touch-none` so a finger drag on the handle does not scroll the page while scrolling over the rest of the card still works (UX3, NFR-R2).
- `views/shared/useReorderAnnouncements.ts`: builds the dnd-kit `accessibility` prop from `t` and the rows: `screenReaderInstructions.draggable` = `locations.reorderInstructions`; `onDragStart`, `onDragOver`, `onDragEnd`, `onDragCancel` return `locations.reorderPickedUp`, `reorderMovedOver`, `reorderDropped`, `reorderCancelled` with `city` (row's `cityLabel`), `position` (index of `over` + 1, or of `active` for pick-up and cancel) and `total` (`rows.length`). When `over` is null (the card is above or below every card, i.e. dropped outside the list), `onDragOver` returns `undefined` (no announcement) and `onDragEnd` returns `locations.reorderCancelled` for the active city, because the list stays as it was (FR3, NFR-A3); no new key is needed. Views already build announcements with `t()` (`CardsView` `locations.addedAnnouncement`), so this follows the existing pattern.
- `LocationList` sets `isReorderable = rows.length >= MIN_LOCATIONS_TO_REORDER` (FR1) and passes `prefersReducedMotion` from `usePrefersReducedMotion()` (via `@/controller`) to the rows.
- `views/cards/CardsView.tsx` passes `moveLocation` from `useLocations()` as `onMove`.

### D6. Constants and strings

New `constants/reorder.ts`, re-exported from `constants/index.ts`: `REORDER_TRANSITION_DURATION_MS = 200`, `REORDER_TRANSITION_EASING = "ease"`, `REORDER_POINTER_ACTIVATION_DISTANCE_PX = 4`, `MIN_LOCATIONS_TO_REORDER = 2`, `REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)"`.

New keys in `locales/en.json` and `locales/ru.json` (`locations.` namespace, FR8):

| Key | en | ru |
|---|---|---|
| `moveLocation` | `Move {{city}}` | `Переместить {{city}}` |
| `reorderRoleDescription` | `movable item` | `перемещаемый элемент` |
| `reorderInstructions` | `To move a location, press Space or Enter. Use the Up and Down arrow keys to change its position. Press Space or Enter again to drop it, or Escape to cancel.` | `Чтобы переместить место, нажмите Пробел или Enter. Меняйте позицию стрелками вверх и вниз. Нажмите Пробел или Enter ещё раз, чтобы отпустить, или Escape для отмены.` |
| `reorderPickedUp` | `{{city}} picked up at position {{position}} of {{total}}` | `{{city}}: взято, позиция {{position}} из {{total}}` |
| `reorderMovedOver` | `{{city}} moved to position {{position}} of {{total}}` | `{{city}}: позиция {{position}} из {{total}}` |
| `reorderDropped` | `{{city}} dropped at position {{position}} of {{total}}` | `{{city}}: перемещено на позицию {{position}} из {{total}}` |
| `reorderCancelled` | `Moving {{city}} cancelled` | `Перемещение {{city}} отменено` |

`position` and `total` are ordinal places, not counted nouns, so no plural forms are needed.

### D7. Tests and their placement

- Pure functions — Vitest with `it.each`: `model/moveLocation.test.ts` (the 7 cases of M2, plus a non-integer index), `model/locations.test.ts` (the reducer delegates), `views/shared/reorderTarget.test.ts`, `views/shared/reorderTransition.test.ts`.
- Controller — `controller/useLocations.reorder.test.tsx` via `test/renderLocations.tsx` with `createInMemoryLocationRepository` from `@/adapters` and a `vi.spyOn` on its `save`; `controller/usePrefersReducedMotion.test.ts` overriding the `window.matchMedia` stub of `test/setup.ts`.
- View in jsdom — `views/shared/DragHandle.test.tsx`, `views/shared/useReorderAnnouncements.test.tsx`, `views/shared/LocationList.test.tsx` (handles with 2 rows, none with 1). jsdom has no layout, so dragging itself is not exercised here.
- Unit BDD `test/features/locations/locations_reorder_unit.feature` + `steps/locations_reorder_unit.steps.ts` (`_unit` because a paired `_e2e` file exists, `.claude/rules/bdd-unit.md`): real `LocationsProvider` with the localStorage repository through `openApp` of `steps/locationsPersistenceWorld.ts` (immediate write scheduler), two tabs through `createInMemoryChannelHub` of `test/inMemoryChannel.ts` as in `locations_persistence.steps.ts`, writes counted with `vi.spyOn(localStorage, "setItem")`, storage failure with a throwing `setItem` and `hasSaveFailed`; Russian names by rendering `LocationList` from `@/views/shared` after `i18n.changeLanguage("ru")`; performance with `performance.now()` around `reduceLocations` + `presentLocationRows` over 50 built locations.
- E2E `test/features/locations/locations_reorder_e2e.feature` + `steps/locations_reorder_e2e.steps.ts` and `steps/locationsReorderE2eHelpers.ts` — mouse, touch and keyboard dragging, focus, live-region text, computed transitions, `emulateMedia({ reducedMotion: "reduce" })`, target size, axe-core and layout need a real browser (`.claude/rules/bdd-e2e.md`, ADR-0001). The list order is read from the remove buttons' accessible names in DOM order. Mouse drags use `page.mouse` with several intermediate moves; touch drags use CDP `Emulation.setTouchEmulationEnabled` and `Input.dispatchTouchEvent` (CDP is already used in `locations_search_shortcut_e2e.steps.ts`). The slide check reads the displaced card's computed `transition-property` and `transition-duration` while the card is still picked up (deterministic, no timing sampling); "runs no transition" also asserts `element.getAnimations()` is empty. The drop check uses an init script that records every `transitionrun` event on a list `<li>` (the card's handle name, `propertyName`, and the `<li>`'s computed `transition-duration` at that moment); the mouse-drag helper clears the record right before `page.mouse.up()` and releases a quarter card height past the target's centre, so the dropped card has a distance to settle. UX3's touch scroll uses CDP `Input.synthesizeScrollGesture` with `gestureSourceType: "touch"` over the city name on a 375 × 300 px screen, where 5 cards make the page taller than the screen; `window.scrollY` must grow. Handle names must be matched exactly: Playwright's `getByRole` `name` string is a case-insensitive substring match, and "Move Moscow" is a substring of the remove action's "Remove Moscow" (`locations.removeLocation` = `Remove {{city}}`), so every handle locator passes `exact: true` and the existing substring step `the list offers the action {string}` is not used for handles. The feature has no `@view-contract` tag (NG3), so it runs in the `chromium` and `mobile-chrome` projects of `playwright.bdd.config.ts`.
- NFR-R3: the 4 `list` examples (375 / 1024 px × light / dark; 8 baseline images across the `chromium` and `mobile-chrome` projects) of the existing outline "Screenshot of the <state> state at <width> px in the <theme> theme" in `locations_ui_e2e.feature` are re-approved, and a text outline in `locations_reorder_e2e.feature` enters the same list state and asserts both handles.

## Risks / Trade-offs

- [Pointer drags in E2E are timing-sensitive] → mouse and touch steps move in several steps and assert the final order with Playwright's auto-retrying `expect`; the keyboard path covers announcements, focus and transitions deterministically.
- [A move and a change from another tab at the same moment] → last write wins (existing policy); a move whose location is gone returns `LOCATION_NOT_FOUND` and changes nothing.
- [The dragged card's transform could widen the page] → `restrictToVerticalAxis` keeps `x` at 0; checked by NFR-R1 at 320 px and 2560 px.
- [Bundle grows by the library] → only the lazy Cards chunk grows; `pnpm check:bundle-size` guards the initial budget.

## Migration Plan

None: the stored document is unchanged (schema version 1); rollback is reverting the code and the dependency.
