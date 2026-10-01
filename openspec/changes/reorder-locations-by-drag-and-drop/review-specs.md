# Specs review: reorder-locations-by-drag-and-drop

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 38/39 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 3 |

## Freshness

- ✅ "a new location always goes to the end of the list" (proposal.md:5) — `openspec/specs/locations/spec.md:30-31` "Adding a location SHALL append it to the end of the list"; `model/locations.ts:78`.
- ✅ "`locations` order is the display order" (proposal.md:5) — `docs/architecture/domain-model.md:34`.
- ✅ `LocationCommandType` `ADD_LOCATION`/`REMOVE_LOCATION`/`REPLACE_LOCATIONS`, `LocationErrorCode` `DUPLICATE_LOCATION`/`UNKNOWN_TIME_ZONE`/`LOCATION_NOT_FOUND`, pure `reduceLocations` (design.md:7) — `packages/client/src/model/locations.ts:19-29,58`.
- ✅ The store notifies only when the reducer returns a new state object (design.md:7) — `model/store.ts:32` `if (outcome.ok && outcome.state !== currentState)`.
- ✅ `dispatchAndSchedule` schedules a debounced write after every `ok` outcome, `LOCATIONS_WRITE_DEBOUNCE_MS` = 300, flushed on `pagehide`; other tabs arrive via `repository.subscribe` as `REPLACE_LOCATIONS` (design.md:8) — `controller/LocationsProvider.tsx:20,84-90,115-127`; `constants/locations.ts:5`.
- ✅ `useLocations` returns `{ rows, locations, ...rest }` of `LocationsContextValue` (design.md:8) — `controller/useLocations.ts:61,78`; `controller/locationsContext.ts:23-31`.
- ✅ Stored document `{ schemaVersion: 1, payload: { locations } }`, no migration needed (design.md:9, proposal.md:15) — `adapters/locationsDocument.ts:6,24-27`; `constants/locations.ts:2` `LOCATIONS_SCHEMA_VERSION = 1`; spec "List survives a reload" at `openspec/specs/locations/spec.md:93`.
- ✅ `CardsView` renders `LocationList` from `views/shared/`; `LocationList` moves focus after a removal; `LocationRow` is a `forwardRef` to its remove button with `min-h-11 min-w-11` and `locations.removeLocation` (design.md:10) — `views/cards/CardsView.tsx:143`, `views/shared/LocationList.tsx:19-29`, `views/shared/LocationRow.tsx:16-41`; `locales/en.json:32` `"Remove {{city}}"`.
- ✅ The Cards view is lazy-loaded through `views/index.ts` and only `CardsView` imports `@/views/shared` in production code (design.md:10, D4) — `views/index.ts:21` `import("./cards/CardsView")`; grep finds no other non-test importer.
- ✅ No drag-and-drop library, nothing reads `prefers-reduced-motion`, no Storybook (design.md:11) — `packages/client/package.json` has none; grep over `src/` is empty.
- ✅ `test/setup.ts` stubs `window.matchMedia` with `matches: false` and listener functions (design.md:11, tasks.md:20) — `test/setup.ts:15-22`.
- ✅ No home location and no derived Here entry exist in code (design.md:12, NG5) — no `SET_DEVICE_TIME_ZONE` or home state in `model/`.
- ✅ `useOnlineStatus` and `useContainerWidth` live in the controller (design.md:38) — `controller/useOnlineStatus.ts`, `controller/useContainerWidth.ts`.
- ✅ Test helpers named by D7 and tasks exist: `test/renderLocations.tsx` `renderLocations`, `createInMemoryLocationRepository` (with `isWritable`) from `@/adapters`, `openApp`/`labelsOf` in `steps/locationsPersistenceWorld.ts:60,77`, `createInMemoryChannelHub` in `test/inMemoryChannel.ts:9` used by `locations_persistence.steps.ts:134`, `buildLocation`/`KNOWN_CITIES` (Almaty, Moscow, Kolkata, Tokyo, New York) in `test/factories/buildLocation.ts`, `fakeClock` in `lib/temporal.ts:30`.
- ✅ "should return exactly the documented members" asserts the exact `Object.keys` (tasks.md:19) — `controller/useLocations.test.tsx:19-31`.
- ✅ `locales/locales.test.ts` checks key parity (tasks.md:9) — `locales/locales.test.ts:2,34-38`.
- ✅ `vi.spyOn(localStorage, "setItem")` works in jsdom here (tasks.md:34) — `test/localStorageMock.ts` replaces `localStorage` with a plain object; the same spy is used in `steps/locationsUiWorld.tsx:85`.
- ✅ Existing E2E steps reused by tasks.md:50 exist: `/^the stored locations are (.+)$/`, `the user removes {string}` (`locations_view_contract_e2e.steps.ts:22,71`), `the user opens the locations app` (`locations_ui_e2e.steps.ts:22`), `the screen is {int} px wide for the locations`, `the locations screen does not scroll horizontally` (`locations_layout_e2e.steps.ts:15,25`), theme / list state / axe steps (`locations_view_a11y_e2e.steps.ts:18,26,34`), two tabs, service worker, offline reopen (`locations_tabs_offline_e2e.steps.ts:11,37,56`); `failAllStorageWrites` (`locations_ui_e2e.fixtures.ts:85`); `mainPage.storageUnavailable` in `main_page/steps/englishTexts.ts:16`. None of the new step texts duplicates an existing playwright-bdd step.
- ✅ The substring step `the list offers the action {string}` uses `getByRole("button", { name })` without `exact` (design.md:84, tasks.md:50) — `locations_ui_e2e.steps.ts:109-115`.
- ✅ CDP is already used in E2E steps (design.md:84) — `locations_search_shortcut_e2e.steps.ts:26`.
- ✅ `chromium` and `mobile-chrome` projects run every scenario without `@view-contract` (design.md:84) — `playwright.bdd.config.ts:84-93`.
- ✅ The screenshot outline has 4 `list` examples with 8 baselines across both projects (proposal.md:31, tasks.md:75) — `locations_ui_e2e.feature:111-123`; `__screenshots__/chromium` and `__screenshots__/mobile-chrome` each hold 4 `list-state` PNGs; the other screenshot states seed no locations (`steps/locationsStates.ts:47-80`).
- ✅ Initial JS budget 150 KB gzipped in `scripts/check-bundle-size.mjs`, script `check:bundle-size`, package `@time-zones/client` (proposal.md:75, tasks.md:80) — `scripts/check-bundle-size.mjs:17`, `packages/client/package.json:2,11`.
- ✅ No part of reorder is implemented yet, in code or an archived change — grep for `reorder`/`MOVE_LOCATION`/`drag` in `src/` and `openspec/changes/archive/` only finds NG3 of `add-locations-via-search` ("Reordering locations … out of scope").
- ❌ tasks.md:28 (4.4) names `views/shared/LocationList.test.tsx` and `views/shared/LocationRow.test.tsx` as the renders to update for the new props, but `test/features/locations/steps/locations_utc_offset_unit.steps.tsx:51-54` also renders `<LocationList rows=… onRemove=…>` without `onMove`; it is type-checked by `tsconfig.test.json` (`src/test/**/*`) under `tsc -b` in `build`.

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ Reorder cards by dragging | ✅ 4.4, 4.5, 6.1 |
| FR2 | ✅ | ✅ Move a location | ✅ 2.1, 2.2, 3.1, 5.1 |
| FR3 | ✅ | ✅ Move a location; Reorder cards by dragging | ✅ 3.1, 4.1, 5.1, 6.1 |
| FR4 | ✅ | ✅ New order is kept and shared | ✅ 3.1, 5.1, 6.1, 7.2 |
| FR5 | ✅ | ✅ New order is kept and shared | ✅ 5.1, 6.1 |
| FR6 | ✅ | ✅ New order is kept and shared | ✅ 3.1, 5.1, 6.1 |
| FR7 | ✅ | ✅ Reorder cards with the keyboard | ✅ 6.1 |
| FR8 | ✅ | ✅ Reorder strings are localized | ✅ 1.3, 4.2, 4.3, 5.1 |
| NFR-P1 | ✅ | ✅ Reorder is accessible and fits every screen | ✅ 5.1 |
| NFR-P2 | ✅ | ❌ no delta requirement mentions the initial bundle (R5) | ✅ 7.1 |
| NFR-A1 | ✅ | ✅ Reorder is accessible and fits every screen | ✅ 6.1 |
| NFR-A2 | ✅ | ✅ Reorder cards with the keyboard | ✅ 6.1 |
| NFR-A3 | ✅ | ✅ Reorder cards with the keyboard | ✅ 4.2, 6.1 (drop outside the list not covered, R2) |
| NFR-A4 | ✅ | ✅ Smooth reorder transitions | ✅ 3.2, 4.1, 6.1 |
| NFR-A5 | ✅ | ✅ keyboard + accessible requirements | ✅ 4.3, 6.1 |
| NFR-R1 | ✅ | ✅ Reorder is accessible and fits every screen | ✅ 6.1 |
| NFR-R2 | ✅ | ✅ Reorder cards by dragging | ✅ 6.1 |
| NFR-R3 | ✅ | ✅ Reorder is accessible and fits every screen | ✅ 6.1, 6.2 |
| UX1 | ✅ | ✅ Smooth reorder transitions | ✅ 4.1, 6.1 |
| UX2 | ✅ | ✅ Smooth reorder transitions | ✅ 4.1, 6.1 |
| UX3 | ✅ | ✅ Reorder cards by dragging | ✅ 4.3, 4.4, 6.1 |
| M1 | ✅ | n/a | ✅ 7.3 |
| M2 | ✅ | ✅ Move a location scenarios | ✅ 2.1, 5.1 |
| M3 | ✅ | n/a | ✅ 2.3, 3.3, 4.6 |
| M4 | ✅ | n/a | ✅ 6.1 |
| M5 | ✅ | n/a | ✅ 5.1, 6.1 |
| M6 | ✅ | n/a | ✅ 6.1 |
| M7 | ✅ | n/a | ✅ 7.1 |
| G1 | ✅ | n/a — met by FR1, FR2, FR7 | n/a |
| G2 | ✅ | n/a — met by FR4, FR5, M5 | n/a |
| G3 | ✅ | n/a — met by UX1, NFR-A4, M6 | n/a |
| NG1 | ✅ | n/a | n/a — nothing reorders search results or suggestions |
| NG2 | ✅ | n/a | n/a — no automatic sorting is built |
| NG3 | ✅ | n/a | n/a — the E2E feature has no `@view-contract` tag, `views.md` untouched |
| NG4 | ✅ | n/a | n/a — D5 animates only drags; other-tab and add/remove changes are not animated |
| NG5 | ✅ | n/a | n/a — no Here entry or home handling is built |
| NG6 | ✅ | n/a | n/a — no undo |
| Q1 | ✅ | n/a | n/a — stays open (answered in proposal.md:136 as a later docs change) |
| Q2 | ✅ | n/a | n/a — stays open for the change that adds home |

## Consistency

- design.md:26 gives `moveLocationInList(locations, id, targetIndex)` a list argument, while design.md:28 and tasks.md:13 require it to return "the **same** state object" (`toBe`) for a same-position move — a function given only the list has no state object to return (R3).
- tasks.md:50 defines only the singular step `the list offers the move handle {string}`, while the scenarios at tasks.md:57 ("Handle names the city…") and tasks.md:72 ("The list state shows handles…") use "the list offers the move handles "…" and "…"", for which no step is defined (R4).

## Findings

### R1 — WARNING — A second `LocationList` render is not updated for the required `onMove` prop
- Location: `openspec/changes/reorder-locations-by-drag-and-drop/tasks.md:28`
- Rule: `CLAUDE.md` (Post-Edit Workflow: `pnpm run build` must pass)
- Problem: Design D5 (design.md:50) makes `onMove: (id: string, targetIndex: number) => void` a new required prop of `LocationList`. Task 4.4 updates only `views/shared/LocationList.test.tsx` and `views/shared/LocationRow.test.tsx`. `packages/client/src/test/features/locations/steps/locations_utc_offset_unit.steps.tsx:51-54` also renders `<LocationList rows={latestLocations.rows} onRemove={latestLocations.removeLocation} />`, and no task mentions it. That file is in `tsconfig.test.json` (`"src/test/**/*"`), which `tsc -b` checks in the `build` script (`"build": "tsc -b && vite build"`).
- Impact: Task 5.2 still passes, because Vitest does not type-check. But the type check in 7.1 (`build`) and 7.4 (`build`, and also `typecheck` if run) fails with a missing `onMove` prop on a file that no task names. The implementer finds the break only at the end.
- Fix: In tasks.md 4.4, add: "In `test/features/locations/steps/locations_utc_offset_unit.steps.tsx` pass `onMove={latestLocations.moveLocation}` to `LocationList`; verify `pnpm --filter @time-zones/client typecheck`, then `npx vitest run src/test/features/locations/steps/locations_utc_offset_unit.steps.tsx`".
- Fix risk: none — `moveLocation` exists on `useLocations()` after task 3.1, which comes before 4.4.
- Status: fixed
- Resolution: confirmed `locations_utc_offset_unit.steps.tsx:51-54` renders `LocationList` without `onMove` and is in `tsconfig.test.json`; tasks.md 4.4 now passes `onMove={latestLocations.moveLocation}` there and verifies with `typecheck` and a vitest run of that steps file.

### R2 — WARNING — Announcements are undefined when the card is over no position
- Location: `openspec/changes/reorder-locations-by-drag-and-drop/design.md:56`
- Rule: —
- Problem: D5 builds `onDragOver` and `onDragEnd` announcements with "`position` (index of `over` + 1…)". It does not say what happens when `over` is null. With a pointer, `over` is null when the card is dragged above or below every card. dnd-kit then still calls `onDragOver` and `onDragEnd`, with `over: null`. This is exactly the "dropped outside the list" case of FR3 (proposal.md:63). Task 4.2 (tasks.md:26) tests only drags that are over a card.
- Impact: Implemented as written, the announcement code looks up a missing `over` (index −1). Screen-reader users then hear "Moscow moved to position 0 of 3" or "Moscow dropped at position 0 of 3" for a drop that FR3 says changes nothing (NFR-A3 asks for the real position). No test catches it.
- Fix: In design.md D5 `useReorderAnnouncements`, add: "when `over` is null, `onDragOver` returns `undefined` (no announcement) and `onDragEnd` returns `locations.reorderCancelled` for the active city, because the list stays as it was (FR3)". In tasks.md 4.2, add the cases "`onDragOver` with no `over` → `undefined`" and "`onDragEnd` with no `over` → "Moving Moscow cancelled"".
- Fix risk: none — no new locale keys (FR8's key set stays the same), and dnd-kit announcement callbacks may return `undefined`.
- Status: open

### R3 — SUGGESTION — `moveLocationInList` signature cannot return the same state object
- Location: `openspec/changes/reorder-locations-by-drag-and-drop/design.md:26`
- Rule: —
- Problem: D1 declares `moveLocationInList(locations, id, targetIndex)`. design.md:28 and task 2.1 (tasks.md:13, "returns `ok` with the same state object (`toBe`)") need it to return the caller's state object unchanged for a same-position move. A function that only receives the list cannot do that.
- Impact: An implementer who follows the signature returns a new `{ locations }` wrapper. Then the `toBe` test cannot be written against the function. Worse, if the reducer wraps the result, the store sees a changed snapshot and D2 schedules a write, so FR3 / M5 ("0 storage writes after a move to the card's own position") fails.
- Fix: In design.md D1, change the signature to `moveLocationInList(state: LocationsState, id: string, targetIndex: number): LocationsReduceResult`. In task 2.1, build the input as a `LocationsState`.
- Fix risk: none.
- Status: open

### R4 — SUGGESTION — Two E2E scenarios use a plural handle step that is never defined
- Location: `openspec/changes/reorder-locations-by-drag-and-drop/tasks.md:57`
- Rule: `.claude/rules/gherkin.md` ("Step text must be reusable across scenarios")
- Problem: Task 6.1 defines `the list offers the move handle {string}` (singular). The scenarios "Handle names the city and is large enough" (tasks.md:57) and "The list state shows handles at <width> px in the <theme> theme" (tasks.md:72) are written as "the list offers the move handles "Move Moscow" and "Move Almaty"", and no step matches that text.
- Impact: `bddgen` reports missing step definitions, so `pnpm test:bdd --grep "@reorder-locations-by-drag-and-drop"` fails until the implementer invents a step or rewrites the scenarios.
- Fix: In tasks.md 6.1, write both scenarios with two lines each: `Then the list offers the move handle "Move Moscow"` / `And the list offers the move handle "Move Almaty"` (and Almaty/Moscow for the outline).
- Fix risk: none — the singular step already uses the required `exact: true` locator.
- Status: open

### R5 — SUGGESTION — NFR-P2 has no delta-spec requirement and no tagged check for M1
- Location: `openspec/changes/reorder-locations-by-drag-and-drop/specs/locations/spec.md:142`
- Rule: `.claude/rules/traceability.md` ("For every FR/NFR/UX in `proposal.md`, at least one implementing entity must exist")
- Problem: No delta requirement carries NFR-P2 (proposal.md:75: drag-and-drop code loads with the Cards chunk, initial JS ≤ 150 KB). M1 (proposal.md:126) lists NFR-P2 among the ids that need "at least one automated test tagged or commented with `reorder-locations-by-drag-and-drop`". Task 7.3 drops NFR-P2 from its grep ("covered by 7.1's script"), and `scripts/check-bundle-size.mjs` carries no such tag.
- Impact: After archive, `openspec/specs/locations/spec.md` does not record that the reorder library must stay out of the initial bundle. M1 cannot reach 100% as written.
- Fix: In the delta "Reorder is accessible and fits every screen" requirement, add the sentence "The drag-and-drop code MUST NOT be part of the initial JavaScript, which stays at most 150 KB gzipped." Add a scenario "Reorder stays out of the initial bundle" (WHEN the app is built, THEN the initial JavaScript is at most 150 KB gzipped AND contains no drag-and-drop code), and add NFR-P2 to its `implements` comment. In proposal.md M1, write "(NFR-P2 is verified by `pnpm check:bundle-size` in task 7.1)".
- Fix risk: none — this agrees with the existing budget in `openspec/specs/app-delivery/spec.md:53` and with task 7.1.
- Status: open

## Verdict

Needs revision. Blocking: R1, R2 (WARNING). R3–R5 are polish that can be fixed in the same pass. No CRITICAL findings: the change delivers drag-and-drop reorder, persistence across reopen, offline use and other tabs, and smooth transitions as the task asks. It follows ADR-0002/0004 (model command, persistence only through the repository, schema version 1) and stores no offsets.
