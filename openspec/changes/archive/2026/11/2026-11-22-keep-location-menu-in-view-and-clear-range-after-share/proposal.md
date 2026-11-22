# Keep the location menu in view and clear the meeting range after a share

Three fixes the owner asked for in task #159.

## Why

1. **The location menu leaves the screen.** The «⋮» menu of a card or a grid row always opens under its button (`top-full` inside the card in Cards, `top: button bottom + 4 px` from `useFixedMenuPosition` in Grid). For a row at the bottom of the screen the menu is pushed under the bottom edge, so "Move up", "Move down" and "Remove" are out of sight and out of reach. The existing rule of `locations` → "Location menu" ("The open menu MUST lie inside the screen") is only checked for the first rows of a two-row list.
2. **A shared meeting stays selected.** After the user chooses «Поделиться» in the share dialog and then picks an app in the system share sheet, the dialog closes and the Grid view comes back with the same meeting range still set. The user is done with that meeting, so they have to clear it by hand with «Сбросить выбор встречи» before they can do anything else with the rows: the grab area, the location menu and the wall-time input stay locked while a meeting range is set. Closing the dialog with its close button «Закрыть» has to keep the range, as it does today: the user is still choosing.
3. **The README screenshots are out of date.** `README.md` and `README.ru.md` show five PNGs from `docs/design/screens/`. They are design screens of the November redesign, not screenshots of the app, and they lack what has been built since (the share dialog's Share meeting flow, the strip tail, the sticky meeting bar, the move handle). Both READMEs also show the same Russian screens.

Audience: everyone who uses the location menu on a phone or in a long list, and everyone who shares a meeting. Urgency: items 1 and 2 are defects users run into every day.

## What Changes

- **ADDED** to `locations`: the open location menu opens where it fits. It opens under its button when it fits there, above the button when it fits there and not below, and otherwise on the side with more room, its height limited to that room and its items scrolling inside it. It stays inside the viewport while the page scrolls, and opening it does not scroll the page.
- **ADDED** to `meeting-share-dialog`: a share whose outcome is "shared" clears the meeting range, the same as Clear meeting. The focus goes to Add location, as after Clear meeting.
- **MODIFIED** in `meeting-share-dialog`: "Share dialog opens and closes" (closing with the close button or Esc keeps the meeting range; a shared outcome clears it), "Share from the share dialog" (where the focus goes after each outcome) and "Accessible share dialog" (after the outcome "shared" the focus goes to Add location; new scenario "Focus after a shared meeting").
- **MODIFIED** in `grid-view`: "Grid layers stay under the page bars and dialogs" (its scenario "An open location menu lies above the date bar" now scrolls the page so that the menu opens under its button and reaches over the date bar, because a button just above the date bar now opens its menu above it).
- **ADDED** to `main-page`: the README screenshots are approved screenshots of the running app, in the README's language.
- Changed glossary terms (`docs/glossary/`): **Location menu** (where it opens, its new *Code:* owner of the placement) and **Share meeting** (a shared outcome clears the meeting range). No new term.

No stored data changes. The meeting range is never stored. The placement of the menu is view state.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `locations`: new requirement "Location menu opens where it fits".
- `meeting-share-dialog`: "Share dialog opens and closes", "Share from the share dialog" and "Accessible share dialog" are modified. New requirement "A shared meeting clears the meeting range".
- `grid-view`: "Grid layers stay under the page bars and dialogs" is modified (the scroll position of its open-menu scenario).
- `main-page`: new requirement "README screenshots of the running app".

## Goals

- G1: Every item of an open location menu is visible and can be activated, for every row, in both views, at every scroll position and on every supported screen size.
- G2: After a meeting has been shared, the Grid view is back in its normal state without a second action.
- G3: The READMEs show the app as it is built today, and they cannot go stale silently.

## Non-Goals

- NG1: The outcomes "copied" and "failed" keep the meeting range. A copied text has not reached anyone yet and the copied notice still refers to that meeting, and after a failure the user tries again. The outcome "cancelled" keeps the dialog open, as today.
- NG2: The items, the look and the keyboard behaviour of the location menu do not change. Only where it opens changes.
- NG3: Other popups (the language list of the share dialog, the calendar, the search) are not changed.
- NG4: The approved design screens in `docs/design/screens/` and `docs/design/README.md` are not changed. They stay the design reference.
- NG5: The Cards view shows no meeting range, so item 2 does not concern it.

## Users & Scenarios

- U1: Oleg has twelve locations on a phone. He scrolls to the bottom and opens the menu of the last card to move it up. The menu opens above the button, and all four items are visible.
- U2: Anna holds a phone in landscape (844 × 390) in the Grid view and opens the menu of a row in the middle of the screen. Neither side has room for all four items, so the menu opens on the larger side and scrolls, and every item can be reached.
- U3: Daria picks 09:00–11:00, chooses «Поделиться встречей», then «Поделиться», and sends the text to a messenger. Back in the app, the meeting is cleared, the header is back and the focus is on Add location.
- U4: Milan opens the share dialog, reads the preview and closes the dialog with «Закрыть» to adjust the end. The meeting range is still 09:00–11:00.
- U5: A visitor of the repository reads `README.md` in English and sees the English app, and `README.ru.md` in Russian and sees the Russian app.

## Requirements

### Functional

#### Location menu

- FR1: An open location menu, in the Cards view and the Grid view, opens under its button when all its items fit between the button and the bottom of the viewport. Otherwise it opens above the button when they fit between the top of the viewport and the button.
- FR2: When the items fit on neither side, the menu opens on the side with more room. Its height is limited to that room and its items scroll inside it, so every item can be reached by the arrow keys, by scrolling and by a tap.
- FR3: While the menu is open, it stays inside the viewport and next to its button when the page or the grid panel scrolls or the window is resized. Horizontally it stays right-aligned to its button and inside the screen, as today.
- FR4: Opening the menu, by pointer or by keyboard, does not scroll the page.

#### Share and the meeting range

- FR5: A share from the share dialog whose outcome is "shared" closes the dialog and clears the meeting range in the same way as Clear meeting. The meeting bar gives way to the normal header, the reference moment stays pinned at the former start, and the row controls locked by the meeting range work again.
- FR6: After FR5 the focus is on Add location, as after Clear meeting.
- FR7: Closing the share dialog with its close button «Закрыть» or with Esc keeps the meeting range unchanged, and so do the outcomes "cancelled" (the dialog stays open), "copied" and "failed" (the dialog closes, the notice shows and the focus returns to Share meeting). This is today's behaviour, which must not regress.

#### README screenshots

- FR8: `README.md` shows five screenshots of the running app with the English interface, and `README.ru.md` shows the same five with the Russian interface: Cards on a phone in the light and the dark theme, Cards on a tablet, Grid on a desktop, and Grid on a desktop with a meeting range in the dark theme. Each one is an approved screenshot of a browser test, so a change of the app that alters it fails that test until the screenshot is approved again.

### Non-Functional

#### Performance

- NFR-P1: Opening the location menu reads the layout of its button and of the menu once, and so does each scroll or resize event while it is open. The placement adds no `ResizeObserver` (iOS Safari 12 has none, ADR-0009) and no timer. `pnpm check:bundle-size` passes without raising a budget.

#### Accessibility

- NFR-A1: With the menu open above its button or with a limited height, axe-core reports no violations in the light and the dark theme, in the Cards view and the Grid view. At the centre of every menu item that is inside the menu's visible box, the topmost element is that item.
- NFR-A2: The keyboard behaviour of the menu (WAI-ARIA menu button) is unchanged wherever it opens. A focused item of a menu with a limited height is scrolled into the menu's view.
- NFR-A3: After a shared outcome the focus is never left on the document body (FR6).

#### Responsive

- NFR-R1: FR1–FR4 hold at 320 × 568, 390 × 844 and 844 × 390 px for the first and the last row of a list of 12 locations, in both views.

## UX Acceptance Criteria

- UX1: A menu opened above its button looks like one opened below: the same surface, border, shadow and width, right-aligned to the button, with the same 4 px gap between the menu and the button.
- UX2: A menu with a limited height keeps its border and shadow around the visible part. Only its items scroll. It keeps the 4 px gap to its button and to the edge of the viewport.
- UX3: After a shared outcome the user sees the Grid view without a meeting frame, with the normal header and the hour frame at the former start. No notice is shown, as today for "shared".

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | menu closed | button only, as today |
| any | room below the button for every item | menu under the button |
| any | no room below, room above | menu above the button |
| any | room on neither side | menu on the larger side, limited height, items scroll |
| any | menu open, page or panel scrolled | menu follows its button and stays inside the viewport |
| any | share dialog open, outcome "shared" | dialog closed, no meeting range, normal header, focus on Add location, no notice |
| any | share dialog open, outcome "copied" or "failed" | dialog closed, meeting range kept, notice shown, focus on Share meeting |
| any | share dialog open, outcome "cancelled" | dialog open, unchanged |
| any | share dialog closed with «Закрыть» or Esc | dialog closed, meeting range kept |
| offline | any | the same as online: no state needs the network |

There is no loading or error state: the placement is computed from the layout in memory, and the share outcomes are the existing ones.

## Behavior

- `packages/client/src/test/features/locations/locations_menu_placement_e2e.feature`: the placement, scrolling, keyboard, axe-core and the topmost check (`@keep-location-menu-in-view-and-clear-range-after-share @FR1`–`@FR4`, `@NFR-A1`, `@NFR-A2`, `@NFR-R1`, `@UX1`, `@UX2`).
- `packages/client/src/test/features/grid_view/grid_view_layers_e2e.feature`: "An open location menu lies above the date bar" scrolls so that the menu opens under its button and reaches over the date bar (`@NFR-A1`).
- `packages/client/src/test/features/grid_view/grid_view_meeting_share_unit.feature`: the shared outcome clears the range and the other ways keep it (`@FR5`, `@FR7`).
- `packages/client/src/test/features/grid_view/grid_view_meeting_share_e2e.feature`: the focus after the shared outcome and the kept range after «Закрыть» in a real browser (`@FR5`–`@FR7`, `@NFR-A3`, `@UX3`).
- `packages/client/src/test/features/main_page/main_page_readme_screenshots_e2e.feature`: the ten README screenshots (`@FR8`).

## Visual Reference

There is no new screen. The menu keeps the look of `docs/design/screens/cards-phone-menu-light.png` and only flips to the other side of its button. The design tokens are the source of truth.

## Affected IA

No changes: the project has no `docs/ia/` documents.

## Success Metrics

- M1: The open location menu lies wholly inside the viewport in 12 of 12 cases: 2 views × 3 screen sizes (320 × 568, 390 × 844, 844 × 390) × 2 rows (the first row at the top of the list, the last row with the page scrolled to the end).
- M2: The page scroll offset changes by 0 px when the menu opens, in the same 12 cases.
- M3: Every row of the outcome table in "A shared meeting clears the meeting range" gives the stated meeting range: 6 of 6 rows (shared clears it; close button, Esc, cancelled, copied and failed keep it).
- M4: `README.md` and `README.ru.md` each reference 5 approved screenshots of this change (10 in total), and 0 image links of either README point into `docs/design/screens/`.
- M5: axe-core reports 0 violations with a menu open above its button in 4 of 4 cases (Cards and Grid, light and dark).
- M6: The mutation score of `src/views/shared/locationMenuPlacement.ts` and `src/controller/useMeetingShare.ts` is at least 95 % (minimum 90 %).

## Open Questions

None. The one judgement call, whether "copied" also clears the meeting range, is settled by NG1.

## Impact

- Views: `src/views/shared/LocationMenu.tsx`, `src/views/shared/useFixedMenuPosition.ts` (replaced by the placement hook), a new pure `src/views/shared/locationMenuPlacement.ts`, `src/constants/grid.ts` (the menu gap).
- Controller and app shell: `src/controller/useMeetingShare.ts` (`finishShare`), `src/app/AppShell.tsx` (one "clear meeting" handler for Clear meeting and a shared outcome).
- Tests: new and updated Vitest, vitest-cucumber and playwright-bdd files listed under Behavior. Ten new approved PNGs under `src/test/features/__screenshots__/chromium/`.
- Docs: `docs/glossary/locations.md`, `docs/glossary/time-selection.md`, `docs/architecture/views.md`.
- Root `README.md` and `README.ru.md`: the image links. The implement stage may not write them, so they reach the branch as a patch that the owner applies (H1 in `tasks.md`).
- No new dependency, no stored data change, no ADR.
