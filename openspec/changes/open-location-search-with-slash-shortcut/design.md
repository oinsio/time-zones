# Design: Open the location search with the "/" keyboard shortcut

## Context

Driven by FR1–FR6, NFR-P1, NFR-A1 and UX1 of `proposal.md`. Current state, checked in `packages/client/src/`:

- `views/shared/LocationSearch.tsx` renders `AddLocationButton` and owns the open state (`const [isOpen, setIsOpen] = useState(false)`); the button's `onClick` calls `setIsOpen(true)`. `OpenLocationSearch` (and with it `useCitySearch`, which requests the search data) is mounted only while `isOpen` is true.
- `views/shared/LocationSearchDialog.tsx` moves focus into the query field in `onOpenAutoFocus`; `LocationSearch`'s `handleCloseAutoFocus` returns focus to the button on close (Esc or after adding).
- `views/shared/AddLocationButton.tsx` is a `forwardRef` button that spreads its props onto `<button>`; `LocationSearch.tsx` is its only production user.
- `views/cards/CardsView.tsx` renders `LocationSearch` in the list and empty states, and returns `LocationsLoadError` instead (no `LocationSearch`) when `loadStatus === LocationsStatus.UNREADABLE`.
- The only text field in the app is the query `<input type="text">` in `LocationSearchDialog.tsx`; no textarea or contenteditable element exists.
- `app/Notice.tsx` already listens to `keydown` on `document` in a `useEffect` and removes the listener in its cleanup — the precedent for a page-wide key handler.
- `constants/keyboard.ts` holds `enum KeyboardKey` (`ESCAPE`, `ARROW_DOWN`, `ARROW_UP`, `ENTER`), exported from `constants/index.ts`. Event-name strings are module-local constants (`PAGE_HIDE_EVENT` in `controller/LocationsProvider.tsx`, `ONLINE_EVENT` in `controller/useOnlineStatus.ts`).
- Unit tests run in jsdom (`vitest.config.ts`: `environment: "jsdom"`).

Binding rules read for this change: ADR-0002 — view state such as an "open sheet" is owned by "the view itself" and "never goes into the model"; the controller "maps UI events to commands and runs side effects (clock tick, persistence, cross-tab sync)". `.claude/rules/architecture.md` — views "Keep view state (scroll, open panels, focus) local — never put it into the model" and "Reuse `views/shared/` blocks instead of duplicating them per view". ADR-0005 — shared blocks live in `views/shared/`. ADR-0001 — "vitest-cucumber runs in jsdom — no real focus, aria, layout"; `.claude/rules/bdd-unit.md` marks "Keyboard accessibility" and "aria-labels, focus management" as E2E (playwright-bdd), not unit BDD.

ADR-0003, ADR-0004, ADR-0006 and ADR-0007 are not touched: no time, storage, search-data or reference-zone behaviour changes.

## Goals / Non-Goals

**Goals:** open the existing search through the same state change the action uses; keep the shortcut decision a pure, mutation-testable function.

**Non-Goals:** a general shortcut registry or keymap (NG1, NG3); any model, controller or presenter change. No global architectural decision is made, so no ADR is needed.

## Decision

### D1. The shortcut is view behaviour in `views/shared/`

Opening the search changes only `LocationSearch`'s local `isOpen` view state; there is no command and no model state. So the shortcut lives next to it in `views/shared/` and is not a controller hook. Because every view composes `LocationSearch` from `views/shared/`, every registered view gets the shortcut, and when `LocationSearch` is not rendered (unreadable list, view still loading) there is no listener — FR6 holds by construction.


### D2. Pure predicate: `isSearchShortcutEvent(event)`

New `views/shared/searchShortcut.ts` exports `isSearchShortcutEvent(event: KeyboardEvent): boolean`, true only when all hold:

1. `event.key === KeyboardKey.SLASH` — the produced character, so layouts that need Shift for `/` work; `shiftKey` is not read (FR4, spec scenario "Shift on layouts that need it").
2. `!event.ctrlKey && !event.metaKey && !event.altKey` (FR4).
3. The target is not a text-entry element (FR2): `event.target` is not an `Element`, or it is not inside a `textarea`, not inside an element matched by `CONTENT_EDITABLE_SELECTOR = '[contenteditable]:not([contenteditable="false"])'` (via `Element.closest`), and not an `input` unless its `type` is in `NON_TEXT_INPUT_TYPES` (`button`, `checkbox`, `color`, `file`, `image`, `radio`, `range`, `reset`, `submit`). Matching by attribute with `closest` instead of `HTMLElement.isContentEditable` keeps the check identical in jsdom and browsers. Both constants are module-local to `searchShortcut.ts`, as the house keeps DOM strings (`PAGE_HIDE_EVENT`); they are not added to `constants/`.

`KeyboardKey.SLASH = "/"` is added to the enum in `constants/keyboard.ts` (`.claude/rules/code-style.md`: "if a value is used in a `switch`, `if`, or for branching — it must be an enum").

### D3. Hook: `useSearchShortcut({ isEnabled, onShortcut })`

New `views/shared/useSearchShortcut.ts`. While `isEnabled` is true it adds one `keydown` listener (`KEYDOWN_EVENT = "keydown"`, module-local) on `document`, and removes it in the effect cleanup when disabled or unmounted. On a matching event it calls `event.preventDefault()` and then `onShortcut()`. `preventDefault` is what keeps the `/` out of the query field — focus moves into the field while the key is still being processed — and stops browser quick find (UX1). Non-matching events are left untouched, so `/` is typed into text fields (FR2).

`LocationSearch` calls `useSearchShortcut({ isEnabled: !isOpen, onShortcut: () => setIsOpen(true) })` — the same state change as the button's `onClick`, so data loading (NFR-P1), focus into the query field (FR1) and focus return to the button on close (FR5) all reuse the existing paths. Disabling while open gives FR3: a `/` in an open search is left to the dialog (typed into the query field when it has focus, ignored on the close action).

Both files are internal to the `views/shared` module and are not exported from `views/shared/index.ts` (only `LocationSearch` uses them).


### D4. `aria-keyshortcuts` on the button

`AddLocationButton` renders `aria-keyshortcuts={KeyboardKey.SLASH}` before spreading `props` (NFR-A1). The attribute is not visible text, so no locale key is added and the accessible name stays "Add location". No visual change (NFR-R1).

### D5. Test placement

Every rule of this change is keyboard behaviour, which `.claude/rules/bdd-unit.md` marks "Keyboard accessibility | no | yes" and "aria-labels, focus management | no | yes" (unit BDD | E2E BDD), and ADR-0001 says "vitest-cucumber runs in jsdom — no real focus, aria, layout". So the specification of the change is one playwright-bdd feature in a real browser, and no unit BDD feature is written.

| What | Where |
|---|---|
| Every spec scenario: opening, suggestions, the key not reaching the browser, adding with the keyboard, focus return, the announced shortcut, lazy data, the 3 text-entry elements, the open search (query field and close action), Ctrl / Meta / Alt, Shift, unreadable list (FR1–FR6, NFR-P1, NFR-A1, UX1, UX2, M2, M4) | `test/features/locations/locations_search_shortcut_e2e.feature` + `steps/locations_search_shortcut_e2e.steps.ts` (playwright-bdd, `@view-contract`, so it runs in every `view-contract-<id>` project) |
| axe-core and screenshots (NFR-A1, NFR-R1, M5) | existing outlines in `locations_view_contract_e2e.feature` and `locations_ui_e2e.feature`, tagged with this change; no new state, they prove nothing regressed. The accessibility outline is `@view-contract`, so it runs only in the `view-contract-<id>` projects; the screenshot outline is not, so it runs in `chromium` and `mobile-chrome` (both invert `@view-contract`) |
| Predicate: `/`, Shift, each ignore case | `views/shared/searchShortcut.test.ts` (Vitest, `it.each`) — TDD and mutation guard |
| Hook: listener on/off, `preventDefault`, unmount | `views/shared/useSearchShortcut.test.tsx` (Vitest, `renderHook`) — TDD and mutation guard |
| `aria-keyshortcuts` attribute | `views/shared/AddLocationButton.test.tsx` (Vitest) — TDD and mutation guard |
| `LocationSearch` opens on `/`, loads data once | `views/shared/LocationSearch.shortcut.test.tsx` (Vitest) — TDD and mutation guard |

The Vitest tests are plain unit and component tests, the level `.claude/rules/test-planning.md` asks for ("**Unit tests (Vitest)** — domain logic, utils, hooks via TDD"), and the files Stryker mutates (M3). They assert only state and calls (`onShortcut` called, `dispatchEvent` result, dialog rendered, stub called), never real focus or text entry — those are asserted only in the E2E feature. Text-entry elements a Vitest test appends to `document.body` are removed in `afterEach` with `element.remove()`, because Testing Library's `cleanup()` unmounts only the containers it rendered.

E2E techniques, decided here so every scenario is real-browser evidence:

- **Text-entry elements.** The app has no text field outside the search, so the step adds one: `page.evaluate` appends an `<input type="text">`, a `<textarea>` or a `<div contenteditable="true">` with a `data-testid` to `document.body` and focuses it; the real `page.keyboard.press("/")` must then leave `/` in it (`toHaveValue("/")` / `toHaveText("/")`) — the browser itself inserts the character, which jsdom cannot show.
- **The key does not reach the browser (UX1).** Before pressing, the step adds a bubbling `keydown` listener on `window` (after the `document` listener of D3) that stores `event.defaultPrevented` for `/` on `window`; the Then step reads it back with `page.evaluate` and expects `true`. Chromium has no own `/` action to observe, so a prevented default is the observable proof that no browser action (Firefox quick find) can start.
- **Shift.** Playwright types with a US layout, where Shift + the `/` key produces `?`. The step uses a Chrome DevTools Protocol session (`page.context().newCDPSession(page)`, `Input.dispatchKeyEvent` with `key: "/"`, `code: "Digit7"`, `text: "/"`, `modifiers: 8` for Shift) — a trusted key event as a German layout sends it. The `view-contract-<id>` projects use `devices["Desktop Chrome"]` (Chromium), where CDP is available.
- **Negative assertions.** "The search does not open" first waits two animation frames in the page (`requestAnimationFrame` twice in `page.evaluate`) so a React render caused by the key has happened, then expects `page.getByRole("dialog")` to have count 0 — `toBeHidden()` alone would pass before a late render.
- **Step texts with `/`.** `/` is the alternation operator of Cucumber expressions, so every step text that contains it is defined with a regular expression.
- **Unreadable list.** The existing "the locations are in the unreadable state" step (`locationsStates.ts`) seeds the unreadable document and reloads.

## Consequences

Positive:

- One key press opens the search from anywhere on the main page, in every view that composes `LocationSearch`, with no new state, data or locale keys.
- The decision logic is one pure function, fully mutation-testable.

Negative:

- AltGr layouts: on Windows browsers report AltGr as Ctrl+Alt, so users whose `/` needs AltGr cannot use the shortcut (proposal Q2). Accepted to keep FR4 simple.
- A future text-entry widget that is neither `input`, `textarea` nor contenteditable (e.g. a custom combobox on a `div`) would not be recognised; it would have to stop propagation of `/` or be added to the predicate.
- A second view that renders `LocationSearch` twice would register two listeners; today Cards renders it once.

## Alternatives Considered

**A controller hook** (`src/controller/`): rejected — the controller "maps UI events to commands and runs side effects (clock tick, persistence, cross-tab sync)" (ADR-0002); opening a panel changes only view state, with no command.

**Listening on `window` in the capture phase**: rejected — a bubbling `document` listener matches `app/Notice.tsx` and lets an element that handles `/` itself stop propagation.

**Checking `HTMLElement.isContentEditable`**: rejected for the attribute selector of D2, so the predicate behaves the same in the jsdom unit tests and in browsers.

**Ignoring Shift as well**: rejected — on layouts where `/` is typed with Shift (e.g. German, Shift+7) the shortcut would never fire (FR4).
