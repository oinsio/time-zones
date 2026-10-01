# Tasks

All source paths are under `packages/client/src/`; commands run from `packages/client/` unless they start with `pnpm --filter`. Run tests one command at a time, never in the background. Mutation runs: at most 5 files per run, report in `reports/mutation/mutation-report.json`. Every new test, step file and feature carries `open-location-search-with-slash-shortcut` traceability: `@open-location-search-with-slash-shortcut @FR-X` tags above scenarios, `// @open-location-search-with-slash-shortcut @FR-X` before `f.Scenario` / `f.ScenarioOutline`, `// Verifies FR-X of open-location-search-with-slash-shortcut` at the top of Vitest files and in E2E steps, and `Implements FR-X of open-location-search-with-slash-shortcut` in the JSDoc of new or changed production code.

## 1. Constant (no TDD: enum value)

- [ ] 1.1 Add `SLASH = "/"` to `enum KeyboardKey` in `constants/keyboard.ts` (design D2; FR1, NFR-A1); verify `pnpm --filter @time-zones/client typecheck`

## 2. Shortcut predicate (TDD)

- [ ] 2.1 TDD `views/shared/searchShortcut.ts` `isSearchShortcutEvent(event: KeyboardEvent): boolean` (design D2) in `views/shared/searchShortcut.test.ts` with `it.each` over events built with `new KeyboardEvent("keydown", …)` and dispatched on real jsdom elements appended to `document.body` (read `event.target` inside a listener, or build the event and call the predicate from a `keydown` listener on the element):
  - true: `/` on `document.body`; `/` on a `<button>`; `/` with `shiftKey: true` (FR1, FR4);
  - false: key `?`, key `a` (FR1); `/` with `ctrlKey`, `metaKey`, `altKey` each (FR4); `/` on `<input>` with no type, `type="text"`, `type="search"`, `type="email"` (FR2); `/` on a `<textarea>` (FR2); `/` on a `<div contenteditable="true">`, on `<div contenteditable="">` and on a `<span>` inside it (FR2);
  - true again: `/` on `<input type="checkbox">` and `<input type="button">` (non-text inputs), and on `<div contenteditable="false">`.
  Verify red, then green with `npx vitest run src/views/shared/searchShortcut.test.ts`

## 3. Shortcut hook (TDD)

- [ ] 3.1 TDD `views/shared/useSearchShortcut.ts` `useSearchShortcut({ isEnabled, onShortcut })` (design D3) in `views/shared/useSearchShortcut.test.tsx` with `renderHook` from `@testing-library/react` and events built with `{ key: KeyboardKey.SLASH, bubbles: true, cancelable: true }`: a `/` keydown dispatched on `document.body` calls `onShortcut` once and `dispatchEvent` returns `false` (default prevented, UX1); with `isEnabled: false` it is not called and the event is not prevented (FR3); after `rerender` from enabled to disabled it is no longer called; after `unmount` it is not called; a `/` keydown on a focused `<input type="text">` neither calls it nor is prevented (FR2, M2). Verify red, then green with `npx vitest run src/views/shared/useSearchShortcut.test.tsx`

## 4. View wiring (TDD)

- [ ] 4.1 TDD `aria-keyshortcuts` in `views/shared/AddLocationButton.test.tsx`: the button has `aria-keyshortcuts="/"` and its accessible name is still "Add location" (`getByRole("button", { name: "Add location" })`); then set `aria-keyshortcuts={KeyboardKey.SLASH}` in `views/shared/AddLocationButton.tsx` before `{...props}` (design D4; NFR-A1); verify red, then green with `npx vitest run src/views/shared/AddLocationButton.test.tsx`
- [ ] 4.2 TDD the shortcut in `views/shared/LocationSearch.tsx` (design D3: `useSearchShortcut({ isEnabled: !isOpen, onShortcut: () => setIsOpen(true) })`) with a new `views/shared/LocationSearch.shortcut.test.tsx` that reuses the `renderSearch` setup of `LocationSearch.test.tsx` (copy the small helper; do not grow that file past 200 lines): `userEvent.keyboard("/")` with nothing focused opens the dialog with the suggestions heading and the combobox value `""` (FR1, UX1); the `loadCitySearch` stub is not called before `/` and is called once after it (NFR-P1); pressing Esc after opening with `/` closes the dialog and the "Add location" button has focus again (FR5); a second `/` while the dialog is open with focus on its close action keeps exactly one dialog and the combobox value `""` (FR3). Verify red, then green with `npx vitest run src/views/shared/LocationSearch.shortcut.test.tsx`, then the existing `npx vitest run src/views/shared` stays green
- [ ] 4.3 Mutation run on the new and changed view code (M3); verify `npx stryker run --mutate 'src/views/shared/searchShortcut.ts,src/views/shared/useSearchShortcut.ts,src/views/shared/LocationSearch.tsx,src/views/shared/AddLocationButton.tsx'` scores ≥ 95% (minimum 90%); kill survivors with more cases in the tests of tasks 2–4

## 5. Unit BDD (vitest-cucumber, jsdom, whole app)

- [ ] 5.1 Write `test/features/locations/locations_search_shortcut_unit.feature` ("Implements change open-location-search-with-slash-shortcut.") with the scenarios below, each tagged `@open-location-search-with-slash-shortcut` plus the ids given; no focus or `aria-*` assertions (those are E2E):
  - Scenario Outline "The slash key opens the search from the <state> state" — Examples `list` (stored list "Moscow") / `empty` (no stored list): the search is open with suggestions, the query is empty, the key's default action was prevented — `@FR1 @UX1 @UX2`;
  - "Search data is requested only when the slash key opens the search" — not requested after the app opened; requested exactly once after `/` — `@NFR-P1`;
  - Scenario Outline "The slash key types into a <element>" — Examples `text input` / `textarea` / `contenteditable element`: the search is not open and the key's default action was not prevented — `@FR2 @M2`;
  - "The slash key while the search is open" — opened with the "Add location" action, focus on its close action: the search stays open and the query stays empty — `@FR3 @M2`;
  - Scenario Outline "The slash key with <modifier> held" — Examples `Ctrl` / `Meta` / `Alt`: the search is not open — `@FR4 @M2`;
  - "The slash key with Shift held": the search is open — `@FR4`;
  - "The slash key with an unreadable stored list" — stored list unreadable: the Reset action is shown and the search is not open — `@FR6`.
- [ ] 5.2 Write `test/features/locations/steps/locations_search_shortcut_unit.steps.tsx` (scenario names exactly as in the feature) using `openApp`, `closeApp`, `seedStoredList`, `NOT_JSON`, `openSearch` and `expectSuggestions` from `./locationsUiWorld` (`openApp` renders `AppShell` over `stubZoneCitiesFetch`; read the request count from `vi.mocked(fetch).mock.calls` filtered by `virtual:zone-cities-url`). "presses `/`" dispatches a cancelable, bubbling `keydown` with key `KeyboardKey.SLASH` and the scenario's modifier on `document.activeElement ?? document.body` inside `act`, and stores the `dispatchEvent` return value in the typed context for the "default action" steps. For the text-entry examples, append the element to `document.body` and `focus()` it; remove it in `BeforeEachScenario`/`AfterEachScenario` with `closeApp`. Verify `npx vitest run src/test/features/locations/steps/locations_search_shortcut_unit.steps.tsx` — all 12 examples pass (FR1–FR4, FR6, NFR-P1, UX1, UX2, M2)

## 6. E2E BDD (playwright-bdd, real browser, every registered view)

- [ ] 6.1 Write `test/features/locations/locations_search_shortcut_e2e.feature` with `Background: Given the view under contract is shown` (existing step in `test/features/view_contract/steps/view_contract_e2e.steps.ts`) and one scenario, tagged `@open-location-search-with-slash-shortcut @view-contract @FR1 @FR5 @NFR-A1 @UX1 @UX2 @M4`, "Add a location after opening the search with the slash key":
  - `When the user presses "/" on the main page`
  - `Then the search is open with focus in an empty query field`
  - `When the user picks "Tokyo" in the search with the keyboard`
  - `Then the locations list shows "Tokyo"` (existing)
  - `And focus is on the "Add location" action` (existing)
  - `And the "Add location" action announces the "/" keyboard shortcut`
  Add `test/features/locations/steps/locations_search_shortcut_e2e.steps.ts` (`createBdd(test)` with `test` from `./locations_ui_e2e.fixtures`, helpers `addLocationButton`, `queryField`, `resultOption` from `./locationsE2eHelpers`, `// Verifies FR1, FR5, NFR-A1, UX1 of open-location-search-with-slash-shortcut`): "presses" blurs `document.activeElement` via `page.evaluate`, then `page.keyboard.press(key)`; "open with focus" expects `queryField` focused and with value `""`; "picks with the keyboard" types the city with `page.keyboard.type`, waits for `resultOption`, presses `ArrowDown` and `Enter` (no pointer action, M4); "announces" expects `addLocationButton` to have attribute `aria-keyshortcuts` `"/"`. Verify `pnpm test:bdd --grep "Add a location after opening the search with the slash key"` passes in the `view-contract-cards` project
- [ ] 6.2 NFR-A1, NFR-R1, M5 — prove no regression with the existing outlines, without new baselines: add `@open-location-search-with-slash-shortcut @NFR-A1 @M5` to the tags of "Accessibility in the <state> state in the <theme> theme" in `test/features/locations/locations_view_contract_e2e.feature`, and `@open-location-search-with-slash-shortcut @NFR-R1 @M5` to the tags of "Screenshot of the <state> state at <width> px in the <theme> theme" in `test/features/locations/locations_ui_e2e.feature` (keep their existing tags). Verify `pnpm test:bdd --grep "Accessibility in the (list|empty) state"` and then `pnpm test:bdd --grep "Screenshot of the (list|empty) state"` pass without `--update-snapshots`, and `git status --short src/test/features/__screenshots__` prints nothing

## 7. Verification

- [ ] 7.1 Traceability (M1): from the repository root, `for id in FR1 FR2 FR3 FR4 FR5 FR6 NFR-P1 NFR-A1 NFR-R1 UX1 UX2; do grep -rqE "open-location-search-with-slash-shortcut.*@?${id}([^0-9]|$)|${id}([^0-9].*)?open-location-search-with-slash-shortcut" packages/client/src --include='*.test.ts' --include='*.test.tsx' --include='*.feature' --include='*.steps.ts' --include='*.steps.tsx' || echo "missing $id"; done` prints nothing
- [ ] 7.2 Full unit suite, lint and build; verify `pnpm --filter @time-zones/client test`, then `pnpm --filter @time-zones/client lint`, then `pnpm --filter @time-zones/client build`
