# Design: Keep the location menu in view and clear the meeting range after a share

## Context

See `proposal.md` → Why. The state of the code this design starts from:

- `src/views/shared/LocationMenu.tsx` (250 lines) renders the menu. In Cards (`isMenuFixedToViewport: false` in `locationRowVariant.ts`) the menu is `absolute right-0 top-full mt-1` inside the row. In Grid (`isMenuFixedToViewport: true`) it is `fixed`, placed by `useFixedMenuPosition` (`src/views/shared/useFixedMenuPosition.ts`) at `top = button bottom + LOCATION_MENU_OFFSET_PX` (4 px, `src/constants/grid.ts`) and `right = clientWidth − button right`. That hook re-reads the button on every `scroll` (capture) and `resize`. Neither variant looks at the room below the button.
- The menu layer `z-location-menu` (20) lies above the date bar `z-page-bar` (10) (`tailwind.config.ts`). In Grid the row's header box takes that layer while the menu is open (`headerBoxLayerWithOpenMenu`).
- `src/controller/useMeetingShare.ts` → `finishShare(outcome)` closes the dialog for every outcome except `CANCELLED` and sets the notice. It never clears the meeting range.
- `src/app/AppShell.tsx` clears the range for Clear meeting with `clearMeetingRange()` from `useMeetingRange` and sets `isFocusAfterClearDue`. An effect then focuses `ADD_LOCATION_BUTTON_ID` once the meeting bar is gone.
- `MeetingShareDialog` returns the focus to `returnFocusRef` (Share meeting) in `onCloseAutoFocus`. After a clear, that button no longer exists.
- Root `README.md` and `README.ru.md` show `docs/design/screens/{cards-phone-light,cards-phone-dark,cards-tablet-light,grid-desktop-light,grid-desktop-meeting-dark}.png`.
- Approved screenshots are written by the step "the locations screen matches the approved screenshot" (`src/test/features/locations/steps/locations_layout_e2e.steps.ts`) to `src/test/features/__screenshots__/{projectName}/<test title>.png` (`snapshotPathTemplate` of `playwright.bdd.config.ts`). The title has every run of characters other than letters and digits replaced by `-`.

Glossary owners this design touches: **Location menu** → `LocationMenu` (`docs/glossary/locations.md`); **Share meeting** → `useMeetingShare` (`docs/glossary/time-selection.md`); **Meeting range** → `CLEAR_MEETING_RANGE`, `useMeetingRange`. No new concept, so no new term. The two entries are extended (D1, D3).

## Goals / Non-Goals

Goals: one placement rule for the location menu of both variants, and one "clear meeting" path for Clear meeting and a shared outcome. Non-goals beyond the proposal: no general popover library, and no change to the menu's layer order.

## Decision

### D1. One pure placement rule, `getLocationMenuPlacement`

Context: driven by FR1, FR2, FR3, NFR-R1, UX1, UX2.

A new pure module `src/views/shared/locationMenuPlacement.ts` exports:

```
enum LocationMenuSide { BELOW = "BELOW", ABOVE = "ABOVE" }

getLocationMenuPlacement({
  buttonTopPx, buttonBottomPx,   // the button's box in the viewport
  menuHeightPx,                  // the natural height of the menu (scrollHeight)
  viewportHeightPx,              // document.documentElement.clientHeight
}): { side: LocationMenuSide; maxHeightPx: number | undefined }
```

- `roomBelow = viewportHeightPx − buttonBottomPx − LOCATION_MENU_OFFSET_PX − LOCATION_MENU_VIEWPORT_MARGIN_PX`
- `roomAbove = buttonTopPx − LOCATION_MENU_OFFSET_PX − LOCATION_MENU_VIEWPORT_MARGIN_PX`
- `menuHeightPx ≤ roomBelow` → `BELOW`, no limit. Otherwise `menuHeightPx ≤ roomAbove` → `ABOVE`, no limit. Otherwise the larger room wins (a tie goes to `BELOW`), with `maxHeightPx` = that room.

`LOCATION_MENU_VIEWPORT_MARGIN_PX = 4` is added next to `LOCATION_MENU_OFFSET_PX` in `src/constants/grid.ts` and exported through `src/constants/index.ts`. The numbers of the spec's "Choosing the side" and "No room on either side" tables are this rule with both constants at 4 px. The bound is the viewport, not the top of the date bar: the menu lies above the date bar (`grid-view` → "Grid layers stay under the page bars and dialogs"), so covering it while open is allowed, and the spec's topmost check proves it.

Alternatives: **flip only, never limit** fails U2 at 844 × 390, where four 44 px items fit on neither side of a middle row. **Scroll the page to make room** breaks FR4 and moves the row the user aimed at. **Floating UI / Radix Popover**: a new runtime dependency and a second menu implementation for a 20-line rule. The menu is a hand-written WAI-ARIA menu button that must work without Pointer Events.

### D2. One placement hook for both variants, replacing `useFixedMenuPosition`

Context: driven by FR1–FR4, NFR-P1, NFR-A2.

`useFixedMenuPosition.ts` is renamed to `useLocationMenuPlacement.ts`, and its test moves with it. The hook takes the button ref, the menu ref, `isOpen` and `isMenuFixedToViewport`. In a layout effect, while open, and again on `scroll` (capture) and `resize`, it reads the button's `getBoundingClientRect()` and the menu's `scrollHeight` once per event, calls `getLocationMenuPlacement`, and returns:

- `side` and `maxHeightPx` for both variants;
- for the fixed variant (Grid), the style `{ position: fixed, right, top }` for `BELOW` (`button bottom + offset`) or `{ position: fixed, right, bottom }` for `ABOVE` (`clientHeight − button top + offset`).

`LocationMenu` applies `top-full mt-1` or `bottom-full mb-1` to the absolute variant (Cards) by `side`. It sets `maxHeight` and `overflow-y: auto` on the menu element when `maxHeightPx` is defined. The menu's natural height is read before the limit applies: `scrollHeight` does not shrink under `max-height`. There is one measurement per opening and per event, no `ResizeObserver` and no timer (NFR-P1, ADR-0009). `LocationMenu.tsx` must not grow past its 250 lines. The class choice goes into a small helper in the hook's module if needed.

Keyboard focus inside a limited menu: `item.focus()` scrolls the item into the menu's own scroll box. The page is not scrolled, because the menu lies inside the viewport. `focus({ preventScroll: true })` is not used: it would leave a focused item hidden in a limited menu (NFR-A2).

The Cards variant keeps `absolute` rather than switching to `fixed`. A sortable card gets a `transform` while it is dragged, and a transformed ancestor would capture a fixed menu. Keeping the Cards layout as it is also keeps the existing Cards screenshots valid.

Alternatives: **make Cards fixed too**: one code path less, but a new risk for the dragged card for no gain, since the side rule is shared anyway.

### D3. One "clear meeting" handler for Clear meeting and a shared outcome

Context: driven by FR5, FR6, FR7, NFR-A3, UX3.

`useMeetingShare(textSharing, onMeetingShared?)` gains an optional second parameter. `finishShare` calls it after closing the dialog when the outcome is `ShareOutcome.SHARED`, and only then. `COPIED`, `FAILED` and `CANCELLED` behave as today (NG1). `AppShell` passes the handler it already gives the meeting bar's Clear meeting, extracted into one function `clearMeetingAndFocusAddLocation` (it sets `isFocusAfterClearDue` and calls `clearMeetingRange()`). Both paths therefore dispatch `CLEAR_MEETING_RANGE` and focus Add location through the existing effect. Nothing new is added to the model: `CLEAR_MEETING_RANGE` already keeps the reference moment pinned at the former start (`meeting-range` → "Set and clear a meeting range").

The notice is unaffected: `SHARED` sets none, and the existing effect that clears the notice on a range change has nothing to clear.

Focus: when the range clears, the meeting bar unmounts and the dialog (a child of `AppShellMeeting`) unmounts with it. `MeetingShareDialog`'s `onCloseAutoFocus` tries `returnFocusRef.current?.focus()`, which is `null` by then and does nothing. The AppShell effect then focuses Add location (NFR-A3).

Alternatives: **clear inside `useMeetingShare` with its own `useMeetingRange().clearMeetingRange`**: the hook would own the rule, but the focus would need a second flag, and two clear paths could drift apart. **Clear on `COPIED` too**: rejected by NG1, because the copied notice and the copied text still refer to the meeting.

### D4. README screenshots are approved baselines, linked directly

Context: driven by FR8, M4.

A new E2E feature `src/test/features/main_page/main_page_readme_screenshots_e2e.feature` holds one Scenario Outline "README screenshot <name>" over ten rows (five states × English and Russian). It is tagged `@desktop-only`, so only the `chromium` project writes a baseline (`DESKTOP_ONLY_TAG_PATTERN` excludes it from `mobile-chrome`). It is built from existing steps only: "the locations interface language is English" / "… Russian", "the view mode is Cards" / "… Grid", "the current time is …", "the list holds … and home is …", "the locations screen uses the … theme", "the screen is … by … px for the locations", "the user opens the locations app", "the user sets the sample meeting", "the locations screen matches the approved screenshot". The `<name>` values are `cards-phone-light-en`, `cards-phone-dark-en`, `cards-tablet-light-en`, `grid-desktop-light-en`, `grid-desktop-meeting-dark-en` and the same with `-ru`. The baselines are therefore `src/test/features/__screenshots__/chromium/README-screenshot-<name>.png`.

The READMEs link these files directly, from the repository root: `packages/client/src/test/features/__screenshots__/chromium/README-screenshot-<name>.png`. A UI change that alters them fails visual regression, and re-approving the baseline updates the README image in the same commit, so the README cannot go stale silently (G3). The intro line "Details: docs/design" stays as a link to the design docs.

The implement stage may not write the root READMEs (`.gnomish/stages/specify/handoff.md`: it writes under `packages/` and `docs/` only). The link change is therefore handoff H1, a patch the owner applies. The screenshots themselves are produced inside the limits.

Alternatives: **overwrite `docs/design/screens/*.png`** keeps the README paths, but it breaks the design docs, whose PNG is the `#screen` element of each HTML (`docs/design/README.md`; NG4). **Copy the baselines to `docs/screenshots/`**: a second copy that goes stale unless a sync check is added, which is more code for the same result.

## Consequences

Positive:
- One rule places the menu of every row in both views. It is pure, so every edge case is a table test.
- Clear meeting and a shared outcome take one code path, so the range, the reference moment and the focus end up the same way.
- The README images are the approved screenshots, so they change with the app and never go stale silently.

Negative:
- A limited menu scrolls inside itself. This is rare, but it is a second look of the menu.
- `useMeetingShare` gains a callback parameter that only `AppShell` passes.
- The README image paths point into the test folder of the client package.

## Alternatives Considered

Each decision lists its rejected alternatives: D1 (flip only, scroll the page, a popover library), D2 (a fixed menu in Cards), D3 (clearing inside `useMeetingShare`, clearing on "copied"), D4 (overwriting the design screens, copying the baselines to `docs/`).

## Risks / Trade-offs

- [The flip is chosen from `scrollHeight` before the browser has laid out the menu] → the layout effect runs after the menu is in the DOM and before paint, so the first frame is already on the right side. A unit test asserts the side for a mocked `scrollHeight`.
- [A menu that flips while the user scrolls can look jumpy] → it flips only when its side no longer fits, which is the moment it would otherwise leave the screen.
- [README images live in a test folder] → that folder is the one place the app's appearance is approved. The path is long but stable, because `snapshotPathTemplate` is fixed.
- [Fonts differ between machines] → the same as for every approved screenshot of the project. The baselines are taken by the same Playwright set-up as the others.

## Migration Plan

None: no stored data or setting changes. Rollback is a revert of the change.

## Open Questions

None.
