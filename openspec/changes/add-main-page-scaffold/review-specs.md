# Specs review: add-main-page-scaffold

## Summary

| Item | Value |
|---|---|
| Stale claims | 4 |
| Requirements fully covered | 30/33 |
| Contradictions | 6 |
| CRITICAL | 0 |
| WARNING | 11 |
| SUGGESTION | 2 |

## Freshness

- ✅ "The app shell shows only a title and renders no view, because the view registry is empty" (`proposal.md:5`) — `packages/client/src/app/AppShell.tsx:19-30` renders `viewRegistry[0]` only if present; `packages/client/src/views/index.ts:10` exports an empty array.
- ✅ "`ViewId` is an empty enum" (`design.md:5`) — `packages/client/src/views/viewDefinition.ts:4`.
- ✅ `ViewDefinition` has `id`, `titleKey`, `icon`, `component` (a `LazyExoticComponent<ComponentType>`) and `autoMinWidth` — `packages/client/src/views/viewDefinition.ts:10-18`, matching ADR-0005 (`docs/adr/0005-view-registry.md:30-37`).
- ✅ "`model` and `presenter` are empty" — `packages/client/src/model/index.ts`, `packages/client/src/presenter/index.ts`; no `ports/` or `adapters/` folder exists yet.
- ✅ "`controller` holds `useDocumentLanguage` and `usePwaUpdateStatus`" — `packages/client/src/controller/index.ts:1-3`.
- ✅ A global `AppErrorBoundary` exists, separate from what D4 adds — `packages/client/src/app/AppErrorBoundary.tsx:21`.
- ✅ The existing offline-ready and update notices live in one polite region (FR1) — `packages/client/src/app/AppShell.tsx:32-42`, a fixed bottom `role="status"` element that shows one notice at a time through a ternary.
- ✅ Existing locale keys are flat two-level under one namespace (`app.title`, `app.offlineReady`, …) — `packages/client/src/locales/en.json`, as `.claude/rules/i18n.md:12` requires.
- ✅ Locale key-set parity is already tested (task 3.1) — `packages/client/src/locales/locales.test.ts:63-72`.
- ✅ The feature scenario "Shell with no registered views" that task 5.4 updates exists — `packages/client/src/test/features/app_shell/app_shell_notices.feature:20-24`.
- ✅ The MODIFIED requirement "Layered modules and empty view registry" exists in the stable spec under that exact name — `openspec/specs/app-shell/spec.md:85-91`.
- ✅ Nothing of this change is implemented yet: no `ViewHost`, `MainPage`, `resolveActiveView`, `useOnlineStatus`, `useStorageAvailability`, `useContainerWidth` in `packages/client/src`; the only archived change is `openspec/changes/archive/2026/09/2026-09-29-setup-app-shell-and-pages-deploy`.
- ✅ `React.lazy` keeps a rejected import (D4) — true for React 18.3 (`packages/client/package.json`): the rejection is stored on the lazy object, whose loader is never called again.
- ✅ `constants/storage.ts` (D5) does not exist yet; D5 and task 1.1 create it, and `.claude/rules/code-style.md` places storage keys there.
- ✅ E2E harness: `packages/client/playwright.bdd.config.ts` picks `src/test/features/**/*_e2e.feature` with steps in `steps/*_e2e.steps.ts` and builds and previews the app itself (`webServer.command`); Vitest includes `src/**/*.{test,steps}.{ts,tsx}` and excludes `*_e2e.steps.ts` (`packages/client/vitest.config.ts`).
- ❌ D2 (`design.md:13`) "jsdom has no `ResizeObserver`, so tests inject a stub in `test/setup.ts`" and task 2.1 (`tasks.md:13`) "stub added to `test/setup.ts`" — a global no-op stub already exists at `packages/client/src/test/setup.ts:34-39`; its `observe` never calls back (→ R9).
- ❌ Task 6.1 (`tasks.md:36`) verifies with `pnpm test:e2e` — no such script in `package.json` or `packages/client/package.json`; the playwright-bdd script is `test:bdd`, run in CI at `.github/workflows/ci.yml:57` (→ R2).
- ❌ Task 6.2 (`tasks.md:37`) plans the 150 KB initial-JS budget as a new Vitest spec — the budget is already enforced by `packages/client/scripts/check-bundle-size.mjs`, run in CI after the build at `.github/workflows/ci.yml:47-48` (→ R1).
- ❌ Scenario "First launch" (`specs/main-page/spec.md:78`) "nothing is written to storage" — the running app already writes on first launch: `packages/client/src/i18n.ts:30-34` configures the language detector with `caches: ["localStorage"]` under key `language`, and D5's probe writes too (→ R3).

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ Main page regions | ✅ 5.4 |
| FR2 | ✅ | ✅ View host resolves the active view | ✅ 1.2, 5.2 |
| FR3 | ✅ | ✅ Cards view is registered and lazy | ✅ 3.1, 4.2 |
| FR4 | ✅ | ✅ Scenario: Container is resized | ✅ 2.1, 5.2 |
| FR5 | ✅ | ✅ Loading state | ✅ 5.2 |
| FR6 | ✅ | ✅ Error state with retry | ✅ 5.2 (retry factory under-specified and untested, R5) |
| FR7 | ✅ | ✅ Empty state | ✅ 4.1 |
| FR8 | ✅ | ✅ Offline note | ✅ 2.2, 5.3 |
| FR9 | ✅ | ✅ Storage unavailable warning | ✅ 2.3, 5.3 (layering, R4) |
| FR10 | ✅ | ✅ Page strings are localized | ✅ 3.1 (key depth, R11) |
| NFR-P1 | ✅ | ✅ Cards view is registered and lazy | ✅ 6.2 (runs before the build in CI, R1) |
| NFR-A1 | ✅ | ✅ Accessibility check | ✅ 6.1 |
| NFR-A2 | ✅ | ❌ no scenario for keyboard retry or for the error not taking focus (R6) | ❌ only 5.3 cites it; retry keyboard and error focus untested (R6) |
| NFR-R1 | ✅ | ✅ Narrow and wide screens | ✅ 6.1 |
| UX1 | ✅ | ✅ Loading / Error / Empty requirements | ✅ 4.1 |
| UX2 | ✅ | ✅ Accessible and responsive main page | ❌ no task references UX2 (R10) |
| UX3 | ✅ | ❌ cited on Main page regions, no scenario checks the header does not shift (R7) | ❌ only 5.4, a jsdom test that cannot observe layout (R7) |
| G1 | ✅ | ✅ Scenario: Second view needs no page change | ✅ 5.2 |
| G2 | ✅ | ✅ Loading, Error, Empty, Offline, Storage and Accessibility requirements | ✅ 4.1, 5.2, 5.3, 6.1 |
| G3 | ✅ | n/a — met by FR1 (prepared regions) and FR3 (Cards view) | n/a — met by FR1, FR3 |
| M1 | ✅ | n/a | ✅ every FR has a TDD or BDD task (1.2–5.5) |
| M2 | ✅ | ✅ Accessibility check | ✅ 6.1 |
| M3 | ✅ | n/a | ✅ 1.3, 6.3 |
| M4 | ✅ | ✅ Second view needs no page change | ✅ 5.2 |
| M5 | ✅ | n/a | ✅ 6.2 (R1) |
| NG1 | ✅ | n/a | n/a — no artifact builds the model, clock or locations; D6 renders text only |
| NG2 | ✅ | n/a | n/a — D7 keeps header controls and bottom bar as empty slots |
| NG3 | ✅ | n/a | n/a — D3 makes the mode a `ViewHost` prop defaulting to `AUTO`; nothing persists it |
| NG4 | ✅ | n/a | n/a — task 1.1 adds only `ViewId.CARDS` |
| NG5 | ✅ | n/a | n/a — no Storybook or visual-regression task |
| Q1 | ✅ | ✅ Empty state "MUST NOT show an action that does nothing" | ✅ 4.1; answered in design D6 |
| Q2 | ✅ | n/a | n/a — deliberately left open (deferred to the first real view content, NG5) |
| Q3 | ✅ | ✅ Empty state shows only the explanation | ✅ 4.1; answered in design D6 |

## Consistency

- Scenario "First launch" "AND nothing is written to storage" (`specs/main-page/spec.md:78`) vs design D5 "probes `localStorage` with a write/remove of a constant key … once on mount" (`design.md:22`) and the existing language cache (`packages/client/src/i18n.ts:33`) (R3).
- Design D5 "`useStorageAvailability` probes `localStorage`" in a controller hook (`design.md:22`) vs `.claude/rules/architecture.md:35` "Access storage only through repository ports; every adapter passes the shared contract tests" (R4).
- Design D4 "the registry component is wrapped in a small factory that drops a failed promise on retry" (`design.md:19`) vs task 4.2 "Register `cardsView` in `views/index.ts` with lazy component" (`tasks.md:24`), which registers a plain lazy component and builds no factory (R5).
- Design D6 "Strings live under `mainPage.*` and `views.cards.*` keys" (`design.md:25`) and task 3.1 "Add `mainPage.*` and `views.cards.*` keys" (`tasks.md:19`) vs `.claude/rules/i18n.md:12` "Use flat two-level namespacing: `domain.specificKey`" and the existing two-level `app.*` keys (`packages/client/src/locales/en.json`) (R11).
- Task 5.1 puts "all scenarios of the main-page spec" into the jsdom feature `main_page.feature` (`tasks.md:28`) vs task 6.1 covering the axe and 320/2560 px scenarios in `main_page_e2e.feature` (`tasks.md:36`) and `.claude/rules/gherkin.md:65` ("If a scenario requires a real browser (focus, aria, layout), it goes into `*_e2e.feature`") (R8).
- Modified app-shell scenario "the shell renders the app title and an error-free empty content region" (`specs/app-shell/spec.md:10-12`) vs UX1 "The user never sees a blank content area: every state shows text" (`proposal.md:85`) (R12).

## Findings

### R1 — WARNING — Bundle check planned as a Vitest spec that breaks CI and duplicates the existing script
- Location: `openspec/changes/add-main-page-scaffold/tasks.md:37`
- Rule: `.claude/rules/test-planning.md`
- Problem: Task 6.2 plans "a Vitest spec asserting the build output has a separate Cards chunk and initial JS ≤ 150 KB gzipped", verified by "`pnpm run build` then the spec". Vitest includes every `src/**/*.{test,steps}.{ts,tsx}` (`packages/client/vitest.config.ts`), and CI runs `pnpm test` (`.github/workflows/ci.yml:43`) before `pnpm build` (`ci.yml:45`), so `dist/` does not exist when the spec runs. The 150 KB initial-JS budget is already enforced by `packages/client/scripts/check-bundle-size.mjs`, run in CI after the build (`ci.yml:47-48`).
- Impact: The new spec fails in CI and in every local `pnpm test` without a fresh build, and the budget ends up defined twice with two definitions of "initial JS".
- Fix: Rewrite task 6.2 as: "Extend `scripts/check-bundle-size.mjs` to also fail when the build emits no separate chunk for the Cards view; the 150 KB budget stays enforced by the existing check (NFR-P1, M5); verify `pnpm build && pnpm --filter @time-zones/client check:bundle-size`."
- Fix risk: Finding the Cards chunk depends on Vite's chunk naming (the dynamic import emits `assets/CardsView-<hash>.js`); the script must match the file-name prefix, not a hash, and breaks if the component file is renamed. Low.
- Status: open

### R2 — WARNING — E2E task names a script that does not exist
- Location: `openspec/changes/add-main-page-scaffold/tasks.md:36`
- Rule: `.claude/rules/bdd-e2e.md`
- Problem: Task 6.1 verifies with "`pnpm test:e2e` scoped to this feature". Neither the root `package.json` nor `packages/client/package.json` defines `test:e2e`; the playwright-bdd script is `test:bdd` (`bddgen -c playwright.bdd.config.ts && playwright test -c playwright.bdd.config.ts`), which CI runs at `.github/workflows/ci.yml:57`.
- Impact: The stated verification command fails, and the implementer has to guess how to run and scope the E2E check.
- Fix: Replace the command in task 6.1 with "`pnpm --filter @time-zones/client test:bdd --grep @add-main-page-scaffold`". The Playwright `webServer` in `playwright.bdd.config.ts` already builds and previews the app, so no separate build step is needed.
- Fix risk: none.
- Status: open

### R3 — WARNING — Empty-state scenario forbids storage writes the app already makes
- Location: `openspec/changes/add-main-page-scaffold/specs/main-page/spec.md:78`
- Rule: —
- Problem: Scenario "First launch" says "AND nothing is written to storage". The running app already writes on first launch: `packages/client/src/i18n.ts:30-34` sets the language detector's `caches: ["localStorage"]`, which stores the detected language under key `language`. Design D5 (`design.md:22`) also has the storage probe write and remove a key on every mount. FR7 (`proposal.md:63`), which the scenario implements, says nothing about storage.
- Impact: A step that checks this literally (a `setItem` spy, or storage contents after the app starts) fails in the real app because of the language cache and the probe. Or the implementer weakens the probe or the language cache to make it pass, which breaks FR9 or the language persistence of the setup change.
- Fix: Delete the step "AND nothing is written to storage" from scenario "First launch". Keep "the explanation is shown in the current language".
- Fix risk: The intent "nothing is stored until the user acts" (`docs/architecture/views.md:132`) is not checked by this change. Nothing is lost, because no location or preference writer exists here (NG1, NG3), and the locations change will own that check. Low.
- Status: open

### R4 — WARNING — Storage probe reads localStorage directly instead of through a port
- Location: `openspec/changes/add-main-page-scaffold/design.md:22`
- Rule: `.claude/rules/architecture.md` (Persistence: "Access storage only through repository ports; every adapter passes the shared contract tests"); `docs/adr/0004-local-persistence-strategy.md`
- Problem: D5 has the controller hook `useStorageAvailability` probe `localStorage` itself, with a write and remove of a constant key. The architecture rule allows storage access only through ports whose adapters pass shared contract tests. ADR-0004 puts storage access behind ports with a storage adapter and an in-memory adapter (`docs/adr/0004-local-persistence-strategy.md:14-29`), and handles "storage unavailable" in that layer (`:60`). `docs/architecture/overview.md` plans `ports/` and `adapters/` folders for this. Task 2.3 builds and tests the hook against the global `localStorage` mock.
- Impact: The first storage access written in the app's own layers sits in a controller hook instead of behind a port. (The only existing access, the language cache in `packages/client/src/i18n.ts:30-34`, is i18next detector configuration outside the layers.) The hook cannot be tested without touching the global storage mock, and the persistence change's LocalStorage adapter, which ADR-0004 makes responsible for degraded mode, will either duplicate the probe or have to reach into a controller hook.
- Fix: Rewrite D5's storage half and task 2.3 as follows. "A `StorageAvailability` port (`isStorageAvailable(): boolean`) is declared in `src/ports/`. `src/adapters/` implements it with a localStorage adapter (probe using the key from `constants/storage.ts`) and an in-memory adapter with a configurable result, and both pass one shared contract test. `useStorageAvailability(storageAvailability = localStorageAvailability)` calls only the port, like the `clock: Clock = systemClock` default in `.claude/rules/temporal.md`. Its tests pass the in-memory adapter." Task 2.3 lists the port, both adapters, the contract test (`npx vitest run src/adapters`) and the hook test.
- Fix risk: Adds the `ports/` and `adapters/` modules (each with an `index.ts`) before the persistence change. They are already in the planned layout (`docs/architecture/overview.md`), so the layout does not change, but the later repository adapters must reuse this probe. About 4 extra small files. Low.
- Status: open

### R5 — WARNING — Retry factory for a failed lazy view is described by a mechanism that does not retry, and no task builds it
- Location: `openspec/changes/add-main-page-scaffold/design.md:19`
- Rule: `.claude/rules/tdd-workflow.md` (no implementation without a test); `docs/adr/0005-view-registry.md` (contract to preserve)
- Problem: D4 says a rejected lazy import is re-imported because "the registry component is wrapped in a small factory that drops a failed promise on retry". In React 18.3 the rejection is stored on the `React.lazy` object itself and its loader is never called again, so dropping a cached promise inside the loader changes nothing: the same lazy object keeps throwing the stored error after the boundary `key` is bumped. The factory must instead hand the remounted view a new `lazy(loader)`. No task builds or tests this factory: task 1.1 touches only `viewDefinition.ts` and constants, task 4.2 (`tasks.md:24`) registers Cards "with lazy component", and task 5.2 tests retry only through `ViewHost`.
- Impact: An implementer following D4 literally writes a loader that resets its promise, and scenario "User retries" (`specs/main-page/spec.md:67-70`) fails for a failed chunk load, the offline and deploy-skew case FR6 targets: Retry shows the same error again. Or the implementer changes the `ViewDefinition` contract of ADR-0005 during task 5.2 to reach the loader, an unplanned change to an accepted ADR.
- Fix: In D4, replace the factory sentence with: "`createRetryableLazyView(loader)` in `views/` returns `lazy(() => Promise.resolve({ default: RetryableView }))`. `RetryableView` renders the current inner `lazy(loader)`; when that loader rejected, the next mount creates a fresh `lazy(loader)`. `ViewHost` retries by bumping the boundary key, which remounts `RetryableView`. `ViewDefinition` is unchanged: `component` stays a `LazyExoticComponent`, as ADR-0005 requires." In task 4.2, register Cards as `component: createRetryableLazyView(() => import("./cards/CardsView"))` and add a TDD step `npx vitest run src/views/createRetryableLazyView.test.tsx` with a loader that rejects once and then resolves: after a remount the view renders and the loader was called twice.
- Fix risk: The inner lazy suspends after the outer one, so the skeleton comes from the same `Suspense` boundary; the Cards chunk stays separate because the dynamic import sits at the call site. The unit test covers only the React side; if Chromium keeps a failed module fetch in its module map, a real-browser retry of the same chunk URL can still fail, which R6's E2E step would expose. Low.
- Status: open

### R6 — WARNING — NFR-A2 keyboard retry and error focus have no scenario and no test
- Location: `openspec/changes/add-main-page-scaffold/tasks.md:29`
- Rule: `.claude/rules/test-planning.md`, `.claude/rules/bdd-unit.md` (keyboard accessibility and focus are E2E, not unit BDD)
- Problem: NFR-A2 (`proposal.md:77`) requires the error message to be announced without taking focus and "the retry action works with Tab and Enter". Task 5.3, the only task citing NFR-A2, covers only `OfflineNote` and `StorageWarning`. Task 5.2 (`ViewHost`, `ViewErrorFallback`) does not cite NFR-A2. No spec scenario covers keyboard retry, and task 6.1 does no keyboard or focus check.
- Impact: The Retry control can ship unreachable by keyboard, or the error can take focus or lack a live role, and no test fails. Half of NFR-A2 goes unverified, against M1.
- Fix: Add to requirement "Error state with retry" the scenario "User retries from the keyboard: GIVEN the view failed and the failure cause is gone, WHEN the user reaches Retry with Tab and presses Enter, THEN the view is shown, AND focus was not moved when the error appeared". In task 6.1, add this scenario to `main_page_e2e.feature`. It runs on a first visit, before the service worker controls the page. The step aborts the Cards chunk request with `page.route` and then removes the route before Retry. Add NFR-A2 to task 5.2 for a jsdom check that the fallback has `role="alert"`.
- Fix risk: The step matches the Cards chunk by its file-name prefix (`CardsView-`), which breaks if the component file is renamed. It depends on R5 being fixed, because retry cannot pass otherwise, and on Chromium re-fetching a module whose earlier fetch was aborted. Moderate.
- Status: open

### R7 — WARNING — Placement of the offline note and storage warning is undefined, and UX3 is untestable as planned
- Location: `openspec/changes/add-main-page-scaffold/design.md:16`
- Rule: `.claude/rules/test-planning.md`
- Problem: UX3 (`proposal.md:87`) requires that loading, empty, offline and storage messages do not shift the header. D3 lists `OfflineNote` and `StorageWarning` but does not say where they render. The options are the existing fixed bottom notices region (`packages/client/src/app/AppShell.tsx:32-42`, which shows one notice at a time through a ternary) or an in-flow "warning banner" (`proposal.md:97`). FR1 describes the notices region as keeping only the two existing notices. No scenario checks UX3, and task 5.4, the only task citing it, is a jsdom test that cannot measure layout.
- Impact: The implementer must pick a placement. An in-flow banner above the header shifts it and breaks UX3. Adding the new notes to the existing ternary hides the update notice while offline. No test catches either outcome.
- Fix: In D3, state that `OfflineNote` and `StorageWarning` render in the existing notices region, out of the document flow, stacked with the PWA notice instead of replacing it. Extend FR1 and requirement "Main page regions" to list them. Add a scenario to "Main page regions": "WHEN the page is offline or storage is unavailable THEN the header keeps its position". Implement it in task 6.1 as an E2E check that the `h1` bounding box is the same in the default, offline and storage-unavailable states (UX3). Remove UX3 from task 5.4.
- Fix risk: Up to three stacked notices at 320 px may cover content. The 320 px no-horizontal-scroll check in 6.1 still applies, but overlap is not caught. Moderate.
- Status: open

### R8 — WARNING — Browser-only scenarios assigned to the jsdom feature file
- Location: `openspec/changes/add-main-page-scaffold/tasks.md:28`
- Rule: `.claude/rules/gherkin.md` ("If a scenario requires a real browser (focus, aria, layout), it goes into `*_e2e.feature`"; `_unit` suffix when paired with `_e2e`), `.claude/rules/bdd-unit.md`
- Problem: Task 5.1 writes `test/features/main_page/main_page.feature` and `main_page.steps.ts` "for all scenarios of the main-page spec". That includes "Accessibility check" and "Narrow and wide screens" (`specs/main-page/spec.md:110-116`), which need axe-core and real layout, and which task 6.1 also covers in `main_page_e2e.feature`. The paired unit file should be named `main_page_unit.feature`, with steps under `steps/` (`bdd-unit.md` file structure). Proposal "Behavior" (`proposal.md:101`) names only the unit file.
- Impact: The implementer writes jsdom steps for axe and horizontal scrolling that cannot observe either. The steps pass vacuously or fail, and the same scenarios are implemented twice.
- Fix: Change task 5.1 to "Write `test/features/main_page/main_page_unit.feature` and `steps/main_page_unit.steps.ts` for every main-page scenario except those of 'Accessible and responsive main page', which task 6.1 writes in `main_page_e2e.feature` and `steps/main_page_e2e.steps.ts`". Update task 5.5's path, and list both files in proposal "Behavior".
- Fix risk: none.
- Status: open

### R9 — WARNING — ResizeObserver stub claimed missing, but a no-op stub already exists
- Location: `openspec/changes/add-main-page-scaffold/tasks.md:13`
- Rule: —
- Problem: D2 (`design.md:13`) and task 2.1 plan to add a `ResizeObserver` stub to `test/setup.ts`. That file already defines a global no-op stub (`packages/client/src/test/setup.ts:34-39`) whose `observe` never calls back.
- Impact: The existing stub never reports a width, so it cannot drive the `useContainerWidth` tests (task 2.1) or the resize re-resolution tests (FR4, task 5.2). Adding another stub to `setup.ts` either duplicates the global or changes it for every existing test.
- Fix: Change D2 and task 2.1 to "add a controllable fake in `test/resizeObserverFake.ts` that records observers and lets a test report a width. `useContainerWidth.test.ts` and `ViewHost.test.tsx` install it with `vi.stubGlobal("ResizeObserver", …)` and restore it with `vi.unstubAllGlobals()` in `afterEach`. The global no-op stub in `setup.ts` stays as it is."
- Fix risk: none; other tests keep the global no-op stub.
- Status: open

### R10 — WARNING — UX2 has no task
- Location: `openspec/changes/add-main-page-scaffold/tasks.md:36`
- Rule: `.claude/rules/traceability.md`, `.claude/rules/test-planning.md`
- Problem: UX2 (`proposal.md:86`, "design tokens only and follows the system theme") is cited on requirement "Accessible and responsive main page" (`specs/main-page/spec.md:108`), but no task in `tasks.md` references UX2 or checks theme colours.
- Impact: Nothing verifies that the new components use tokens and follow the system theme. A hard-coded colour in `ViewErrorFallback` or `StorageWarning` passes every planned test as long as its contrast is fine, and the coverage grep for UX2 finds no test.
- Fix: Add UX2 to task 6.1's references and to its light/dark runs, with the assertion that the computed background and text colours of the content region and of each shown notice equal the `--color-background`/`--color-foreground` (or `--color-notice`/`--color-notice-foreground`) token values of the active theme (`packages/client/src/styles/tokens.css`).
- Fix risk: The step must compare normalised colours (computed `rgb()` vs token hex). Low.
- Status: open

### R11 — WARNING — Cards strings planned under three-level `views.cards.*` keys
- Location: `openspec/changes/add-main-page-scaffold/design.md:25`
- Rule: `.claude/rules/i18n.md` ("Use flat two-level namespacing: `domain.specificKey`")
- Problem: D6 puts strings under `views.cards.*`, and task 3.1 (`tasks.md:19`) adds `mainPage.*` and `views.cards.*` keys, among them the Cards title and the empty text. `views.cards.<key>` is three levels deep. The i18n rule requires `domain.specificKey`, and every existing key follows it (`app.title`, `app.offlineReady` in `packages/client/src/locales/en.json`).
- Impact: The first view's keys set the pattern for every later view's `titleKey` (ADR-0005 step 3, "add the title key to every locale file"), so the rule violation spreads to each new view. The implementer also has to decide whether the empty text belongs under `mainPage` or `views.cards`.
- Fix: In D6 and task 3.1, replace `views.cards.*` with two-level keys: `views.cardsTitle` (the registry `titleKey`; a later view adds `views.gridTitle`) and `views.cardsEmptyState` (the empty explanation). Keep the page strings under `mainPage.*` (loading label, error text, retry, offline note, storage warning).
- Fix risk: none; the key-set parity test (`packages/client/src/locales/locales.test.ts:63-72`) collects key paths at any depth, so it still passes.
- Status: open

### R12 — SUGGESTION — Empty-registry scenario allows a blank content area, contradicting UX1
- Location: `openspec/changes/add-main-page-scaffold/specs/app-shell/spec.md:12`
- Rule: —
- Problem: The modified scenario expects "an error-free empty content region" when no view is registered. UX1 (`proposal.md:85`) says the user never sees a blank content area. `resolveActiveView` must handle an empty registry (task 1.2), so tests reach this state.
- Impact: The implementer cannot tell whether `ViewHost` should render nothing or a fallback text for an empty registry, and the updated unit scenario and a UX1 check would assert opposite things.
- Fix: Scope UX1 to "every state of a registered view shows text", leaving the empty-registry scenario as written.
- Fix risk: none; once Cards is registered, the empty registry is reachable only in tests.
- Status: open

### R13 — SUGGESTION — design.md lacks the sections the design rule requires
- Location: `openspec/changes/add-main-page-scaffold/design.md:1`
- Rule: `.claude/rules/design-decisions.md`
- Problem: design.md has Context and Decisions D1–D7 but no "Consequences" and no "Alternatives Considered" section, both required by the rule. D2, D5 and D7 name no requirement id, although the rule says "Always reference the FR/NFR/UX from proposal.md that drove the decision".
- Impact: Later changes cannot see which alternatives were rejected, for example viewport media queries versus `ResizeObserver` (D2) or reusing `AppErrorBoundary` (D4), and the traceability grep misses three decisions.
- Fix: Add a short "Consequences" section (positive/negative) and an "Alternatives Considered" section (viewport media query vs `ResizeObserver` for D2; reusing `AppErrorBoundary` for D4). Append "(FR4)" to D2, "(FR8, FR9)" to D5 and "(FR1)" to D7.
- Fix risk: none.
- Status: open

## Verdict

Needs revision. There are no CRITICAL findings: the change builds what the task asks for, a main-page scaffold with a registry-driven view host, in line with ADR-0002 and ADR-0005. Blocking: WARNINGs R1–R11. These include a bundle task that breaks CI, a missing script, a storage scenario that contradicts the running app, a storage probe that bypasses the port rule, and a retry factory described by a mechanism that does not retry and built by no task. The rest are an untested half of NFR-A2, an undefined notice placement for UX3, browser-only scenarios in the jsdom feature, a stale test-setup claim, UX2 without a task, and three-level i18n keys against the i18n rule. R12 and R13 are polish.
