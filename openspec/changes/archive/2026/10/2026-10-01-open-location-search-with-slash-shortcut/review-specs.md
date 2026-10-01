# Specs review: open-location-search-with-slash-shortcut

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 24/24 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 1 |

## Freshness

- ✅ `views/shared/LocationSearch.tsx` owns `const [isOpen, setIsOpen] = useState(false)` and the button's `onClick={() => setIsOpen(true)}`; `OpenLocationSearch` (which calls `useCitySearch`) is mounted only while `isOpen` (`packages/client/src/views/shared/LocationSearch.tsx:75,84-92`).
- ✅ `handleCloseAutoFocus` returns focus to the button on close (`LocationSearch.tsx:77-80`); `LocationSearchDialog.tsx` moves focus in `onOpenAutoFocus` (`LocationSearchDialog.tsx:81`).
- ✅ `AddLocationButton` is a `forwardRef` button that spreads `{...props}` after its own attributes (`views/shared/AddLocationButton.tsx:9-25`); `LocationSearch.tsx` is its only production user (the other reference is the re-export in `views/shared/index.ts:1`).
- ✅ `views/cards/CardsView.tsx` returns `LocationsLoadError` when `loadStatus === LocationsStatus.UNREADABLE` (`CardsView.tsx:29-31`) and otherwise renders `LocationSearch` under both the empty text and the list (`CardsView.tsx:49-59`).
- ✅ The only text field is the `<input type="text">` of `LocationSearchDialog.tsx:98-100`; no `textarea`/`contenteditable` exists in non-test source.
- ✅ `app/Notice.tsx:25-26` adds and removes a `keydown` listener on `document` in a `useEffect`.
- ✅ `constants/keyboard.ts` holds `enum KeyboardKey` with `ESCAPE`, `ARROW_DOWN`, `ARROW_UP`, `ENTER` only; exported from `constants/index.ts:2`. Module-local event constants exist: `PAGE_HIDE_EVENT` (`controller/LocationsProvider.tsx:20`), `ONLINE_EVENT` (`controller/useOnlineStatus.ts:3`).
- ✅ Vitest runs in jsdom (`packages/client/vitest.config.ts:10`).
- ✅ Stable spec `openspec/specs/location-search/spec.md:169-170` "Keyboard-operable search" reads "it opens from the "Add location" action with Enter", as quoted in proposal Why; no slash shortcut or `aria-keyshortcuts` exists in `openspec/specs/`, `openspec/changes/archive/` or `packages/client/src/` (nothing already implemented).
- ✅ ADR quotes in design Context hold: ADR-0002 table "open sheet … the view itself | no" and "View state never goes into the model" (`docs/adr/0002-model-presenter-swappable-views.md:62-64`), controller "maps UI events to commands and runs side effects" (`:52`); ADR-0001 "vitest-cucumber runs in jsdom — no real focus, aria, layout" (`docs/adr/0001-bdd-e2e-via-playwright-bdd.md:90`); `.claude/rules/bdd-unit.md:117-118` marks "Keyboard accessibility" and "aria-labels, focus management" as E2E only. All seven ADRs are `Accepted`.
- ✅ Existing E2E steps reused by tasks.md:131 exist: "the view under contract is shown" (`test/features/view_contract/steps/view_contract_e2e.steps.ts:8`), "the suggestions are shown", "the page has not requested the search data", "the page has requested the search data" (`locations/steps/locations_ui_e2e.steps.ts:77,94,101`), "the locations list shows {string}" and "focus is on the "Add location" action" (`locations/steps/locations_view_contract_e2e.steps.ts:94,119`), the regex step `^the locations are in the (.+) state$` (`locations/steps/locations_view_a11y_e2e.steps.ts:25-30`).
- ✅ `locationsE2eHelpers.ts` exports `addLocationButton`, `queryField`, `resultOption` (`:46,49,61`); `locations_ui_e2e.fixtures.ts` exports `test` built on the view-contract fixtures (`:3`); `englishLocale.locations.close` exists (`locales/en.json:43`) and is the close action's `aria-label` (`LocationSearchDialog.tsx:91-92`).
- ✅ `LocationSearch.test.tsx` (117 lines) has the `renderSearch` helper with a `loadCitySearch` stub (`:23-37`); `AddLocationButton.test.tsx` exists.
- ✅ The accessibility outline is tagged `@view-contract` (`locations/locations_view_contract_e2e.feature:59-74`, list/empty × light/dark = 4 examples); the screenshot outline is not (`locations/locations_ui_e2e.feature:109-124`); `playwright.bdd.config.ts:50-53` gives `view-contract-<id>` projects `grep: VIEW_CONTRACT_TAG_PATTERN` with `devices["Desktop Chrome"]`, and `chromium`/`mobile-chrome` use `grepInvert` (`:86-93`); 16 list/empty baselines exist (8 under `__screenshots__/chromium/`, 8 under `__screenshots__/mobile-chrome/`).
- ✅ Scripts named in tasks exist in `packages/client/package.json`: `test`, `test:bdd`, `lint`, `build`, `typecheck`; package name `@time-zones/client`.
- ❌ design.md:78 says the existing "the locations are in the unreadable state" step is in `locationsStates.ts`; the step is defined in `locations/steps/locations_view_a11y_e2e.steps.ts:25-30`, and `locationsStates.ts` only holds `enterLocationsState`. tasks.md:131 names the right file, so the implementer is not misled — no finding.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ scenarios "Open the search and add a location with the keyboard", "Suggestions are shown" | ✅ 2.1, 4.2, 5.1 |
| FR2 | ✅ | ✅ "Typing in a text field" | ✅ 2.1, 3.1, 5.3 |
| FR3 | ✅ | ✅ "Slash typed in the open search", "Search already open" | ✅ 3.1, 5.4 |
| FR4 | ✅ | ✅ "Modifier keys held", "Shift on layouts that need it" | ✅ 2.1, 3.1, 5.5 |
| FR5 | ✅ | ✅ "Open the search and add a location with the keyboard" (focus on the action) | ✅ 5.1 |
| FR6 | ✅ | ✅ "Stored list unreadable" | ✅ 5.6 |
| NFR-P1 | ✅ | ✅ "Data is requested only when the search opens" | ✅ 4.2, 5.2 |
| NFR-A1 | ✅ | ✅ "Shortcut announced on the action"; axe on list/empty states is already a stable scenario (`openspec/specs/locations/spec.md:175-178`) | ✅ 4.1, 5.1, 5.7 |
| NFR-R1 | ✅ | ✅ requirement text "no visual change"; list/empty screenshots are already a stable scenario (`openspec/specs/locations/spec.md:175,187`) | ✅ 5.7 |
| UX1 | ✅ | ✅ first scenario "did not reach the browser's own `/` action" | ✅ 3.1, 5.1 |
| UX2 | ✅ | ✅ "Suggestions are shown", first scenario | ✅ 5.1 |
| G1 | ✅ | n/a — met by FR1, M4 | n/a — met by FR1 (5.1), M4 |
| G2 | ✅ | n/a — met by FR2–FR4, M2 | n/a — met by FR2–FR4 (5.3–5.5), M2 |
| NG1 | ✅ | n/a | n/a — no artifact adds another shortcut |
| NG2 | ✅ | n/a | n/a — no visible hint; D4 adds only a non-visual attribute |
| NG3 | ✅ | n/a | n/a — no registry or remapping (design Non-Goals) |
| NG4 | ✅ | n/a | n/a — search results, ranking and data loading untouched |
| M1 | ✅ | n/a | ✅ 6.1 |
| M2 | ✅ | n/a | ✅ 5.3, 5.4, 5.5 |
| M3 | ✅ | n/a | ✅ 4.3 |
| M4 | ✅ | n/a | ✅ 5.1 |
| M5 | ✅ | n/a | ✅ 5.7 |
| Q1 | ✅ | n/a | n/a — stays open, deferred by NG2 |
| Q2 | ✅ | n/a | n/a — answered as accepted limitation in design Consequences (AltGr) |

## Consistency

None.

## Findings

### R1 — SUGGESTION — Task 5.7 mixes this change's ids into the tag line of add-locations-via-search
- Location: `openspec/changes/open-location-search-with-slash-shortcut/tasks.md:148`
- Rule: `.claude/rules/traceability.md` ("Uniqueness is per change: `add-tag-search.FR1` and `fix-sync.FR1` are different requirements")
- Problem: Task 5.7 says to "add `@open-location-search-with-slash-shortcut @NFR-A1 @M5` to the tags of" the accessibility outline, whose tag line is already `@add-locations-via-search @view-contract @NFR-A1 @UX5 @M3` (`packages/client/src/test/features/locations/locations_view_contract_e2e.feature:59`), and `@open-location-search-with-slash-shortcut @NFR-R1 @M5` to the screenshot outline, whose tag line is `@add-locations-via-search @NFR-R2` (`locations_ui_e2e.feature:109`). Appended to the same line, the accessibility line carries `@NFR-A1` twice and the screenshot line reads `@add-locations-via-search … @NFR-R1`, although add-locations-via-search's NFR-R1 is a different requirement ("No horizontal scrolling from 320 px to 2560 px…", `openspec/changes/archive/2026/09/2026-09-30-add-locations-via-search/proposal.md:102`). No feature file today carries two change tags, so there is no precedent to follow.
- Impact: A line-based traceability check for add-locations-via-search (`@add-locations-via-search.*@NFR-R1`) now matches the screenshot outline, which does not verify that change's NFR-R1, and a reader cannot tell which change each id belongs to.
- Fix: In tasks.md 5.7, put this change's tags on their own tag line directly above the existing one (Gherkin allows several tag lines per scenario), e.g. `@open-location-search-with-slash-shortcut @NFR-A1 @M5` above `@add-locations-via-search @view-contract @NFR-A1 @UX5 @M3`, and likewise for the screenshot outline; leave the existing line unchanged.
- Fix risk: none — tags from all lines still apply to the outline, so `--grep` in 5.7/5.8 is unaffected, and the 6.1 grep (`@open-location-search-with-slash-shortcut.*@${id}`) still matches because the change tag and the id sit on the same new line.
- Status: fixed
- Resolution: tasks.md 5.7 now puts `@open-location-search-with-slash-shortcut @NFR-A1 @M5` and `@open-location-search-with-slash-shortcut @NFR-R1 @M5` on new tag lines directly above the existing add-locations-via-search tag lines of the two outlines and leaves those lines unchanged; design.md's test-strategy row says the same. The 5.7/5.8 greps and the 6.1 per-line check still match.

## Verdict

Ready to implement. No blocking findings; R1 is SUGGESTION-level traceability polish.
