# Review: add-main-page-scaffold

## Summary

| Item | Value |
|---|---|
| Tasks verified | 20/20 |
| Requirements traced | 46/47 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 3 |

## Tasks

- ✅ 1.1 `ViewId.CARDS`, `AutoViewMode`, `ViewMode` in `packages/client/src/views/viewDefinition.ts:4-14`; `STORAGE_AVAILABILITY_PROBE_KEY` in `constants/storage.ts:2`, exported from `constants/index.ts:3`.
- ✅ 1.2 `views/resolveActiveView.ts:22-31`; `views/resolveActiveView.test.ts:28` (`it.each` widest fit), `:42` no-fit fallback, `:77` unknown id, `:64` single view, `:83` empty registry.
- ✅ 1.3 Measured in this review: `resolveActiveView.ts` 100% (20/20 killed).
- ✅ 2.1 `test/resizeObserverFake.ts` (controllable fake); `controller/useContainerWidth.ts:10-26`, `controller/useContainerWidth.test.tsx`; the global stub in `test/setup.ts` is untouched.
- ✅ 2.2 `controller/useOnlineStatus.ts:10-25` with listener cleanup; `controller/useOnlineStatus.test.ts`.
- ✅ 2.2b `controller/usePwaUpdateStatus.ts:26-35` (`onRegisteredSW` + one `registration.update()`, `isUpdateCheckFailed`); `usePwaUpdateStatus.test.ts:78-139`, existing cases kept at `:28-76`.
- ✅ 2.3 Port `ports/storageAvailability.ts:5-7`, adapters `adapters/localStorageAvailability.ts`, `adapters/inMemoryStorageAvailability.ts`, both with `index.ts`; shared contract `adapters/storageAvailability.contract.ts:14` run against both in `adapters/storageAvailability.test.ts`.
- ✅ 2.4 `controller/useStorageAvailability.ts:9-16` defaults to `localStorageAvailability`; `useStorageAvailability.test.ts:7-20` uses the in-memory adapter; all three hooks exported in `controller/index.ts:1-6`.
- ✅ 3.1 `mainPage.*` and `views.cardsTitle`/`views.cardsEmptyState` in `locales/en.json` and `locales/ru.json` with identical key sets; `locales/locales.test.ts` checks key parity.
- ✅ 4.1 `views/cards/CardsView.tsx:8-15` (text only); `views/cards/CardsView.test.tsx:7` (en/ru) and `:19` (no action).
- ✅ 4.2 `views/createRetryableLazyView.ts:24-49`; `createRetryableLazyView.test.tsx:56` (loads after remount), `:70` (loader called twice).
- ✅ 4.3 `views/index.ts:15-28` registers `cardsView` via `createRetryableLazyView(() => import("./cards/CardsView"))`; `views/viewRegistry.test.ts:8-24` (one view, Cards, lazy, title key in every locale).
- ✅ 5.1 `test/features/main_page/main_page_unit.feature`, `main_page_states_unit.feature`, `main_page_view_host_unit.feature` with step files in `steps/`, all tagged `@add-main-page-scaffold @FR-x`; the "Accessible and responsive" scenarios live in `main_page_e2e.feature`.
- ✅ 5.2 `app/ViewHost.tsx:26-55`, `app/ViewSkeleton.tsx`, `app/ViewErrorFallback.tsx:16` (`role="alert"`); `app/ViewHost.test.tsx:39-133` covers loading, error, retry, keyboard retry, resize, second view.
- ✅ 5.3 `app/UpdateCheckFailedNote.tsx`, `app/StorageWarning.tsx`; `UpdateCheckFailedNote.test.tsx`, `StorageWarning.test.tsx`; offline/online behaviour in `app/AppShell.pageNotices.test.tsx:47-109`.
- ✅ 5.4 `app/MainPage.tsx:16-37`; `AppShell.tsx:29-43` renders it; `app/MainPage.test.tsx`, `AppShell.test.tsx:56-72`; feature scenario "Shell with no registered views" updated in `test/features/app_shell/app_shell_notices.feature:21-25`.
- ✅ 5.5 `app/index.ts:3-11` exports the new components; main_page unit features have step definitions for every scenario.
- ✅ 6.1 `test/features/main_page/main_page_e2e.feature` + `steps/main_page_e2e.steps.ts`: axe in 5 states × 2 themes (`:111-119`), theme colour check against tokens (`:122-162`), no horizontal scroll (`:165-174`), keyboard retry with `page.route` abort (`:178-213`), header box comparison (`:216-252`).
- ✅ 6.2 `packages/client/scripts/check-bundle-size.mjs:52-57,78-83` fails without a `CardsView-*` chunk; the 150 KB budget check is kept.
- ✅ 6.3 Measured in this review: `ViewHost.tsx` 100%, `useContainerWidth.ts` 100%, `useOnlineStatus.ts` 100%, `useStorageAvailability.ts` 100% (all ≥ 90%).

## Requirements

- ✅ FR1 — `app/MainPage.tsx:19-35` (header with only `h1` + empty controls slot, `main`, bottom bar slot, fixed polite notices region); `AppShell.tsx:31-40` stacks the notices; tests `MainPage.test.tsx:13-53`, `main_page_unit.feature` "User opens the app", "Header keeps its position".
- ✅ FR2 — `views/resolveActiveView.ts:3-31`; `resolveActiveView.test.ts`, `main_page_view_host_unit.feature` (wide, narrow, single, unknown id).
- ✅ FR3 — `views/index.ts:15-28`; `viewRegistry.test.ts:8-24`; bundle chunk check in `check-bundle-size.mjs`.
- ✅ FR4 — `controller/useContainerWidth.ts:15-23`, `ViewHost.tsx:31-33`; `ViewHost.test.tsx:56`, feature "Container is resized".
- ✅ FR5 — `ViewHost.tsx:48` Suspense with `ViewSkeleton`; `ViewHost.test.tsx:82-92`, feature "View is loading" (title still visible).
- ✅ FR6 — `ViewErrorBoundary.tsx`, `ViewErrorFallback.tsx`, `ViewHost.tsx:35-46`, `createRetryableLazyView.ts`; `ViewHost.test.tsx:94-133`, features "View fails", "User retries", e2e "User retries from the keyboard". See R3 for the offline reload edge case.
- ✅ FR7 — `views/cards/CardsView.tsx:8-15`; `CardsView.test.tsx`, feature "First launch".
- ✅ FR8 — `usePwaUpdateStatus.ts:26-35`, `useOnlineStatus.ts`, `AppShell.tsx:38`; `AppShell.pageNotices.test.tsx:47-92`, features "Update cannot be fetched", "Offline without a pending check", "Connection restored". See R4 for a test gap.
- ✅ FR9 — port/adapters + `useStorageAvailability.ts` + `StorageWarning.tsx`; contract test, `AppShell.pageNotices.test.tsx:94-109`, feature "Private mode".
- ✅ FR10 — `locales/en.json`, `locales/ru.json` identical key sets checked by `locales/locales.test.ts`; feature "Russian user sees the empty state".
- ✅ NFR-P1 — lazy Cards view (`views/index.ts:19`); `check-bundle-size.mjs` enforces 150 KB and the separate `CardsView-` chunk.
- ✅ NFR-A1 — e2e axe scan in 5 states × light/dark, `main_page_e2e.steps.ts:111-119`.
- ⚠️ NFR-A2 — the error fallback is `role="alert"` without focus move (`ViewErrorFallback.tsx:16`, e2e "focus has not moved"), the update-check-failed note is inserted into the existing polite region after mount; but the storage warning is present in the first render together with its live region, so it is not announced (R1).
- ✅ NFR-R1 — e2e "Main page fits a <width> px wide screen" at 320/2560 px in 5 states, `main_page_e2e.steps.ts:165-174`.
- ✅ UX1 — skeleton with `mainPage.loading` label, error text, empty-state text; feature scenarios tagged `@UX1`.
- ✅ UX2 — only token classes (`bg-notice`, `text-muted-foreground`, …); e2e colour check against `styles/tokens.css` in both themes (`main_page_e2e.steps.ts:122-162`).
- ✅ UX3 — notices are `fixed` out of flow (`MainPage.tsx:31`); e2e "Header keeps its position" compares the `h1` box; unit "Header keeps its position".
- ✅ M1 — every FR1–FR10 has a tagged vitest-cucumber scenario or Vitest spec (see FR lines above).
- ✅ M2 — the axe Scenario Outline has 10 example rows (5 states × 2 themes).
- ✅ M3 — measured: `resolveActiveView.ts` 100%, `ViewHost.tsx` 100%.
- ✅ M4 — `ViewHost.test.tsx:65` and feature "Second view needs no page change" pass a second view through the registry with no page edit.
- ✅ M5 — `check-bundle-size.mjs` fails over 150 KB gzipped or without a `CardsView-*` chunk.
- ✅ Scenario: Shell renders the main page — `AppShell.test.tsx:65` (registered view inside `main`), `main_page_unit.feature` "User opens the app" shows the Cards empty state.
- ✅ Scenario: Shell with no registered views — `app_shell_notices.feature:21-25` and steps (title shown, empty `main`, no `console.error`).
- ✅ Scenario: Update check fails offline — `AppShell.pageNotices.test.tsx:62` keeps the update notice next to the failed-check note.
- ✅ Scenario: User opens the app — `main_page_unit.steps.ts:58-68`.
- ✅ Scenario: Notices stay available — `main_page_unit.feature` "Notices stay available" (update notice in the polite region).
- ✅ Scenario: Header keeps its position — unit (notices `fixed`, header outside notices) and e2e (`h1` bounding box unchanged).
- ✅ Scenario: Wide container picks the wider view — `main_page_view_host_unit.feature`, `ViewHost.test.tsx:49`.
- ✅ Scenario: Narrow container picks the narrower view — `main_page_view_host_unit.feature`.
- ✅ Scenario: Only one view registered — `main_page_view_host_unit.feature`, `viewRegistry.test.ts:16`.
- ✅ Scenario: Unknown view id — `main_page_view_host_unit.feature`, `resolveActiveView.test.ts:77`.
- ✅ Scenario: Container is resized — `main_page_view_host_unit.feature`, `ViewHost.test.tsx:56`.
- ✅ Scenario: Registry content — `main_page_view_host_unit.feature`, `viewRegistry.test.ts:8-12`.
- ✅ Scenario: Second view needs no page change — `main_page_view_host_unit.feature`, `ViewHost.test.tsx:65`.
- ✅ Scenario: View is loading — `main_page_states_unit.feature`, `ViewHost.test.tsx:82`.
- ✅ Scenario: View fails — `main_page_states_unit.feature`, `ViewHost.test.tsx:94-101`.
- ✅ Scenario: User retries — `main_page_states_unit.feature`, `ViewHost.test.tsx:114`.
- ✅ Scenario: User retries from the keyboard — `main_page_e2e.feature`, `ViewHost.test.tsx:108,120`.
- ✅ Scenario: First launch — `main_page_states_unit.feature`, `CardsView.test.tsx:7`.
- ✅ Scenario: Update cannot be fetched — `main_page_unit.steps.ts` "Update cannot be fetched".
- ✅ Scenario: Offline without a pending check — `main_page_unit.steps.ts` "Offline without a pending check", `AppShell.pageNotices.test.tsx:74`.
- ✅ Scenario: Connection restored — `main_page_unit.steps.ts` "Connection restored", `AppShell.pageNotices.test.tsx:82`.
- ✅ Scenario: Private mode — `main_page_unit.steps.ts` "Private mode" (warning in notices region, view still shown).
- ✅ Scenario: Russian user sees the empty state — `main_page_unit.steps.ts` "Russian user sees the empty state".
- ✅ Scenario: Accessibility check — `main_page_e2e.feature` axe Scenario Outline (10 rows).
- ✅ Scenario: Narrow and wide screens — `main_page_e2e.feature` width Scenario Outline (10 rows).

## Mutation

Measured in this review with `npx stryker run --mutate '<files>'` from `packages/client`, three runs of five files each, one at a time:

| File | Score | Survivors |
|---|---|---|
| `src/views/resolveActiveView.ts` | 100% | — |
| `src/views/createRetryableLazyView.ts` | 90.00% | `:11` `reloadBrowserPage` body → `undefined` (default reload never exercised) |
| `src/app/ViewHost.tsx` | 100% | — |
| `src/app/ViewErrorBoundary.tsx` | 100% | one `ObjectLiteral` ignored by an existing Stryker disable comment |
| `src/controller/usePwaUpdateStatus.ts` | 94.44% | `:34` `if (isOnline)` → `if (true)` (R4) |
| `src/controller/useOnlineStatus.ts` | 100% | — |
| `src/controller/useContainerWidth.ts` | 100% | — |
| `src/controller/useStorageAvailability.ts` | 100% | — |
| `src/adapters/localStorageAvailability.ts` | 92.31% | `:4` `PROBE_VALUE` → `""` (equivalent: an empty write also probes) |
| `src/app/AppShell.tsx` | 100% | — |
| `src/app/MainPage.tsx` | 100% | — |
| `src/app/ViewSkeleton.tsx` | 50.00% | `:5` length object → `{}`, `:6` key builder → `undefined`, `:6` key template → `` (R2) |
| `src/app/ViewErrorFallback.tsx` | 100% | — |
| `src/views/index.ts` | 100% | — |
| `src/views/cards/CardsView.tsx` | 100% | — |

Not measured (no logic beyond a translated string in a card): `NoticeCard.tsx`, `StorageWarning.tsx`, `UpdateCheckFailedNote.tsx`, `inMemoryStorageAvailability.ts`.

## Findings

### R1 — WARNING — Storage warning is not announced to screen readers
- Location: `packages/client/src/controller/useStorageAvailability.ts:12`
- Rule: NFR-A2 of `add-main-page-scaffold` (`.claude/rules/ui-states.md`)
- Problem: `useStorageAvailability` probes storage synchronously in the `useState` initializer, so when storage is unavailable `AppShell.tsx:39` renders `<StorageWarning />` in the very first commit, together with the polite live region it lives in (`app/MainPage.tsx:28-34`). Screen readers announce changes to a live region that already exists; content present when the region is created is not announced. NFR-A2 requires the storage warning to be "announced politely or as an alert". The tests only check that the text sits inside a `role="status"` element (`main_page_unit.steps.ts` "Private mode"), which cannot detect this.
- Impact: a screen-reader user in private mode (U4) is never told that their changes will not be saved; they find out only if they happen to navigate to the end of the page. The update-check-failed note does not have this problem because it is inserted after the region exists.
- Fix: start `useStorageAvailability` from `true` and run `storageAvailability.isStorageAvailable()` in a `useEffect` on mount that sets the state, so the warning is inserted into an already rendered live region. Add a unit test in `controller/useStorageAvailability.test.ts` that the first render reports `true` and the value after mount is the port's answer (e.g. record the values the hook returns across renders).
- Fix risk: the warning appears one commit later; it is out of the document flow (FR1/UX3), so the header does not move. Existing tests render through RTL `render`/`renderHook`, which flush effects inside `act`, so `AppShell.pageNotices.test.tsx:99`, "Private mode" and the e2e `toBeVisible` waits keep passing. Without the first-render test the `useState(true)` initial value becomes a surviving mutant and `useStorageAvailability.ts` (only 2 mutants today) could drop below 90%.
- Status: open

### R2 — WARNING — ViewSkeleton mutation score 50%, placeholder rows untested
- Location: `packages/client/src/app/ViewSkeleton.tsx:4-7`
- Rule: `.claude/rules/tdd-workflow.md` (mutation minimum 90%), `stages/review-code` mutation threshold
- Problem: the scoped Stryker run gives `ViewSkeleton.tsx` 50% (3 of 6 killed). Replacing `{ length: PLACEHOLDER_ROW_COUNT }` with `{}` survives, i.e. no test notices that the skeleton renders no placeholder rows at all; the tests only check `aria-busy` and the screen-reader label (`ViewHost.test.tsx:82-92`). The two key mutants on line 6 also survive.
- Impact: a regression that drops the visual placeholder rows leaves sighted users with an empty-looking content area while the view loads (FR5, UX1 "never a blank content area"), and no test fails.
- Fix: add a test in `app/ViewHost.test.tsx` (next to "should show a busy skeleton while the view loads") that the busy skeleton contains 3 `aria-hidden` placeholder rows, using the never-loading view already built there. Mark the two key mutants on line 6 as equivalent with a `// Stryker disable next-line ArrowFunction,StringLiteral: equivalent — keys only silence React's list warning` comment, the same way `ViewErrorBoundary.tsx:22` does.
- Fix risk: the row count is not exported; the test either repeats `3` as test data (allowed in tests by `code-style.md`) or the constant is exported from `ViewSkeleton.tsx` only for the test. None for production behaviour.
- Status: open

### R3 — SUGGESTION — Retry while still offline reloads the page into the browser error page
- Location: `packages/client/src/views/createRetryableLazyView.ts:11,28-32`
- Rule: FR6 of `add-main-page-scaffold` ("the rest of the page stays usable"); design D4 does not mention a reload
- Problem: when a retried load fails, `loadAfterFailure` calls `window.location.reload()` unconditionally. On a first visit (no service worker controls the page yet) with the network down, the user presses Retry, the import fails again and the page reloads without network.
- Impact: the header, notices and the error with its Retry action are replaced by the browser's offline error page; the user loses the app instead of seeing the error state again. The reload is also untested with its default (`reloadBrowserPage` survives mutation).
- Fix: in `reloadBrowserPage` reload only when `navigator.onLine` is true; otherwise do nothing, so the rejection rethrown by `loadAfterFailure` shows the error fallback again and Retry stays available. Add a test in `views/createRetryableLazyView.test.tsx` that stubs `navigator.onLine` to `false` (`vi.spyOn(navigator, "onLine", "get")`) and checks that no reload happens and the error stays, and one with `true` that `window.location.reload` is called (spy restored in `afterEach`).
- Fix risk: `navigator.onLine` can be `true` while the network is unreachable, so that case still reloads as today. When a browser caches the failed import, a retry while offline keeps showing the error until the connection returns, which is the intended error state.
- Status: open

### R4 — SUGGESTION — No test that the update-check-failed note stays while offline
- Location: `packages/client/src/controller/usePwaUpdateStatus.ts:34`
- Rule: FR8 of `add-main-page-scaffold`; `.claude/rules/tdd-workflow.md` (survivors indicate missed scenarios)
- Problem: the mutant `if (isOnline)` → `if (true)` survives: clearing the failure on every connectivity change, including going offline, passes all tests. "Connection restored" (`main_page_unit.steps.ts`) and `AppShell.pageNotices.test.tsx:82` never assert that the note is still shown after the `offline` event, so they also pass when the note has already vanished.
- Impact: a regression that hides the note as soon as the browser reports offline — exactly when it matters (U3) — would go unnoticed.
- Fix: add a case in `controller/usePwaUpdateStatus.test.ts` ("should keep the failure while the browser is offline"): let the update check reject, dispatch `offline`, and expect `isUpdateCheckFailed` to stay `true`.
- Fix risk: none.
- Status: open

### R5 — SUGGESTION — E2E step file exceeds the 200-line limit
- Location: `packages/client/src/test/features/main_page/steps/main_page_e2e.steps.ts:1`
- Rule: `CLAUDE.md` Process Invariants ("Files must stay under 200 lines"), `.claude/rules/process-invariants.md`
- Problem: the new file has 252 lines and mixes four concerns: state setup, axe/theme checks, keyboard retry and header position.
- Impact: breaks the project file-size invariant for a file this branch created; splitting would not hurt clarity since the concerns are independent.
- Fix: move the keyboard-retry and header-position steps (`:176-252`) into `steps/main_page_recovery_e2e.steps.ts`, and move the shared helpers (`installServiceWorker`, `failStorageWrites`, `APP_ROOT_URL`, text constants) into `steps/main_page_e2e.fixtures.ts` or a small helper module imported by both step files.
- Fix risk: the new file must match the playwright-bdd steps glob `src/test/features/**/steps/*_e2e.{steps,fixtures}.ts` (the name above does); each step text must be defined in exactly one file or playwright-bdd reports duplicates; `createBdd(test)` must use the same `test` from the fixtures file in both files.
- Status: open

## Verdict

Ready — no CRITICAL findings, so nothing blocks. R1 (NFR-A2: storage warning not announced) and R2 (ViewSkeleton mutation 50%) are WARNINGs that should be fixed; R3–R5 are optional improvements.
