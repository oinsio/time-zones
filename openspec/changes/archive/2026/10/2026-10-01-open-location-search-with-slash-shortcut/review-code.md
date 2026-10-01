# Review: open-location-search-with-slash-shortcut

## Summary

| Item | Value |
|---|---|
| Tasks verified | 16/16 |
| Requirements traced | 26/26 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 0 |

## Tasks

All paths are under `packages/client/src/`.

- ✅ 1.1 `KeyboardKey.SLASH = "/"` added at `constants/keyboard.ts:7`; `pnpm --filter @time-zones/client typecheck` passes (re-run in this review).
- ✅ 2.1 `isSearchShortcutEvent` at `views/shared/searchShortcut.ts:40-46` (key, Ctrl/Meta/Alt, text-entry target via `closest` with `CONTENT_EDITABLE_SELECTOR` and `NON_TEXT_INPUT_TYPES`, as in design D2); `views/shared/searchShortcut.test.ts:49-121` covers every listed case (body, button, Shift, `?`/`a`, each modifier, input with no type/text/search/email, textarea, `contenteditable` `"true"`/`""`/nested span/`"false"`, the 9 non-text input types) with `it.each`, and removes appended elements in `afterEach` (`:44-47`).
- ✅ 3.1 `useSearchShortcut` at `views/shared/useSearchShortcut.ts:17-31` (document `keydown` listener only while enabled, removed in the effect cleanup, `preventDefault` then `onShortcut`); `views/shared/useSearchShortcut.test.tsx:36-97` covers call + prevented, disabled, enabled→disabled `rerender`, `unmount`, the 3 text-entry targets and the 3 modifiers.
- ✅ 4.1 `aria-keyshortcuts={KeyboardKey.SLASH}` before `{...props}` at `views/shared/AddLocationButton.tsx:21-22`; test at `views/shared/AddLocationButton.test.tsx:29-34` finds the button by name "Add location" and asserts the attribute.
- ✅ 4.2 `views/shared/LocationSearch.tsx:77-78` wires `useSearchShortcut({ isEnabled: !isOpen, onShortcut: openSearch })` with `openSearch` shared by the button (`:87`); `views/shared/LocationSearch.shortcut.test.tsx:34-47` asserts the dialog and "Popular locations" after `/`, and `loadCitySearch` not called before and called once after.
- ✅ 4.3 Mutation run on the 4 files re-run in this review: all ≥ 95% (see Mutation).
- ✅ 5.1 `test/features/locations/locations_search_shortcut_e2e.feature:7-16` with the listed tags; steps at `test/features/locations/steps/locations_search_shortcut_e2e.steps.ts:30-35` (blur, recorder, press), `:70-80` (keyboard-only pick), `:100-107`, `:110-115`, `:118-126`.
- ✅ 5.2 Feature `:18-22` (`@NFR-P1`), reusing the existing "has (not) requested the search data" steps in `locations_ui_e2e.steps.ts:94-105`.
- ✅ 5.3 Outline at feature `:24-35` with the 3 examples; `appendFocusedField` in `steps/locationsShortcutE2eHelpers.ts:44-63`, steps `:92-97`, `:129-133` (two animation frames, then dialog count 0), `:136-142` (`toHaveText` / `toHaveValue`).
- ✅ 5.4 Feature `:37-50`; steps `:82-89` (focus on the close action), `:145-149` (dialog count 1), `:152-157` (query value).
- ✅ 5.5 Outline at feature `:52-61` (Control, Meta, Alt; step `:43-51`) and Shift scenario `:63-66` via CDP `Input.dispatchKeyEvent` (step `:53-68`).
- ✅ 5.6 Feature `:68-72`; the existing `the locations are in the (.+) state` step (`locations_view_a11y_e2e.steps.ts:26`) seeds the unreadable document and waits for the alert (`locationsStates.ts:59-63`) before the press.
- ✅ 5.7 New tag lines `@open-location-search-with-slash-shortcut @NFR-A1 @M5` at `test/features/locations/locations_view_contract_e2e.feature:59` and `@open-location-search-with-slash-shortcut @NFR-R1 @M5` at `test/features/locations/locations_ui_e2e.feature:109`, the existing tag lines unchanged; the branch commit adds no files under `src/test/features/__screenshots__`.
- ✅ 5.8 Every scenario of the new feature and both tagged outlines carry `@open-location-search-with-slash-shortcut`; CI is green for the branch (stage premise). Not re-run here.
- ✅ 6.1 Each of FR1–FR6, NFR-P1, NFR-A1, NFR-R1, UX1, UX2 appears on an `@open-location-search-with-slash-shortcut` tag line of an `*_e2e.feature` (feature `:7,18,24,37,44,52,63,68`, plus the two outline tag lines above).
- ✅ 6.2 `pnpm --filter @time-zones/client lint` re-run: 0 errors, 6 warnings, all in untouched `test/features/location_search/steps/*` files; typecheck passes; unit suite and build green in CI.

## Requirements

- ✅ FR1 — `views/shared/useSearchShortcut.ts:23-27` + `LocationSearch.tsx:77-78` (same `setIsOpen(true)` as the button); unit `LocationSearch.shortcut.test.tsx:34-39`; E2E feature `:8-16`, step `:100-107` (focused, empty query field).
- ✅ FR2 — `views/shared/searchShortcut.ts:19-31`; unit `searchShortcut.test.ts:74-112`, `useSearchShortcut.test.tsx:73-86`; E2E outline feature `:25-35` asserts `/` lands in the field and no dialog.
- ✅ FR3 — hook disabled while open (`LocationSearch.tsx:78`, `useSearchShortcut.ts:22`); unit `useSearchShortcut.test.tsx:44-61`; E2E feature `:38-50`.
- ✅ FR4 — `searchShortcut.ts:42-45` (Shift not read); unit `searchShortcut.test.ts:59-72`, `useSearchShortcut.test.tsx:88-97`; E2E feature `:53-66` (Control/Meta/Alt, CDP Shift).
- ✅ FR5 — reuses the existing `handleCloseAutoFocus` (`LocationSearch.tsx:80-83`); E2E feature `:14-15` "focus is on the "Add location" action" after adding.
- ✅ FR6 — no listener when `LocationSearch` is not rendered (design D1); E2E feature `:69-72`.
- ✅ NFR-P1 — `OpenLocationSearch` still mounted only while open (`LocationSearch.tsx:88-95`); unit `LocationSearch.shortcut.test.tsx:41-47` (not called before, exactly once after); E2E feature `:19-22`.
- ✅ NFR-A1 — `AddLocationButton.tsx:21`; unit `AddLocationButton.test.tsx:29-34`; E2E step `:118-126` (locator by name "Add location"); axe outline tagged at `locations_view_contract_e2e.feature:59`.
- ✅ NFR-R1 — attribute only, no markup or class change in `AddLocationButton.tsx`; screenshot outline tagged at `locations_ui_e2e.feature:109`; no baseline files in the branch diff.
- ✅ UX1 — `preventDefault` at `useSearchShortcut.ts:25`; unit `useSearchShortcut.test.tsx:36-42` (`dispatchEvent` returns `false`); E2E recorder `locationsShortcutE2eHelpers.ts:24-34`, step `:110-115`; empty query asserted at step `:104-106`.
- ✅ UX2 — same `OpenLocationSearch` path as the action; E2E feature `:11-13` (suggestions, Down + Enter add Tokyo).
- ✅ M1 — every FR/NFR/UX id is on an `@open-location-search-with-slash-shortcut` tag line (Tasks 6.1); Vitest files carry `// Verifies … of open-location-search-with-slash-shortcut` headers.
- ✅ M2 — the 7 ignore cases are E2E examples: 3 text-entry (feature `:32-35`, each asserting the field holds `/`), close action (`:45-50`), Control/Meta/Alt (`:58-61`).
- ✅ M3 — measured in this review: searchShortcut.ts 100%, useSearchShortcut.ts 100%, AddLocationButton.tsx 100%, LocationSearch.tsx 95.45% (see Mutation).
- ✅ M4 — feature `:8-16` adds Tokyo with `page.keyboard` only (step `:70-80`), `@view-contract`, so it runs in the one registered view project (`view-contract-cards`).
- ✅ M5 — axe outline (`locations_view_contract_e2e.feature:59`) and screenshot outline (`locations_ui_e2e.feature:109`) tagged; no baseline re-approved in the branch.
- ✅ Scenario: Open the search and add a location with the keyboard — E2E feature `:8-16`.
- ✅ Scenario: Suggestions are shown — feature `:12` ("the suggestions are shown") and `:10` (empty query); unit `LocationSearch.shortcut.test.tsx:34-39`.
- ✅ Scenario: Data is requested only when the search opens — feature `:19-22`; "exactly once" asserted in unit `LocationSearch.shortcut.test.tsx:41-47`.
- ✅ Scenario: Typing in a text field — feature `:25-35`.
- ✅ Scenario: Slash typed in the open search — feature `:38-42`.
- ✅ Scenario: Search already open — feature `:45-50`.
- ✅ Scenario: Modifier keys held — feature `:53-61`.
- ✅ Scenario: Shift on layouts that need it — feature `:64-66` (CDP key event with Shift modifier).
- ✅ Scenario: Stored list unreadable — feature `:69-72`.
- ✅ Scenario: Shortcut announced on the action — feature `:16`, step `:118-126`; unit `AddLocationButton.test.tsx:29-34`.

## Mutation

Run in this review: `cd packages/client && npx stryker run --mutate 'src/views/shared/searchShortcut.ts,src/views/shared/useSearchShortcut.ts,src/views/shared/LocationSearch.tsx,src/views/shared/AddLocationButton.tsx'` (one run), read from `reports/mutation/mutation-report.json`:

| File | Score | Killed | Survived | Errors |
|---|---|---|---|---|
| `src/views/shared/searchShortcut.ts` | 100.00% | 45 | 0 | 0 |
| `src/views/shared/useSearchShortcut.ts` | 100.00% | 12 | 0 | 0 |
| `src/views/shared/AddLocationButton.tsx` | 100.00% | 2 | 0 | 0 |
| `src/views/shared/LocationSearch.tsx` | 95.45% | 21 | 1 | 1 |
| All files | 98.77% | 80 | 1 | 1 |

The one survivor (`LocationSearch.tsx:80`, `handleCloseAutoFocus` body emptied) and the one runtime error (`OptionalChaining` at `:82`, "Cannot convert object to primitive" in the runner) are in the focus-return handler that predates this branch and was not changed by it; focus return (FR5) is real-browser behaviour covered by the E2E step "focus is on the "Add location" action". `constants/keyboard.ts` (an enum value) was not mutated.

## Findings

None.

## Verdict

Ready. No findings; nothing blocks.
