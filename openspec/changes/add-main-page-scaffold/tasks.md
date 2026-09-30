# Tasks

All paths are under `packages/client/src/`. Run tests one command at a time.

## 1. View resolution (TDD)

- [ ] 1.1 Add `ViewId.CARDS`, `ViewMode` (`AUTO | ViewId`) and constants in `views/viewDefinition.ts` and `constants/` (FR2, FR3, D1); verify `pnpm typecheck`
- [ ] 1.2 TDD `resolveActiveView` in `views/resolveActiveView.ts` with `it.each` cases: widest fit, no fit fallback, unknown id, single view, empty registry (FR2, D1); verify red then green with `npx vitest run src/views/resolveActiveView.test.ts`
- [ ] 1.3 Scoped mutation run on `views/resolveActiveView.ts`, score ≥ 95% (M3); verify with `cd packages/client && npx stryker run --mutate 'src/views/resolveActiveView.ts'`

## 2. Controller hooks (TDD)

- [ ] 2.1 Add a controllable fake `test/resizeObserverFake.ts` (records observers, lets a test report a width; the global no-op stub in `test/setup.ts` stays), then TDD `useContainerWidth` installing it with `vi.stubGlobal` and `vi.unstubAllGlobals()` in `afterEach` (FR4, D2); verify `npx vitest run src/controller/useContainerWidth.test.ts`
- [ ] 2.2 TDD `useOnlineStatus` — initial value, offline and online events (FR8, D5); verify `npx vitest run src/controller/useOnlineStatus.test.ts`
- [ ] 2.3 Declare the `StorageAvailability` port in `ports/` and implement the localStorage and in-memory adapters in `adapters/` (each folder with `index.ts`), with a shared contract test run against both (FR9, D5); verify `npx vitest run src/adapters`
- [ ] 2.4 TDD `useStorageAvailability(storageAvailability = localStorageAvailability)` using the in-memory adapter — available, unavailable (FR9, D5); verify `npx vitest run src/controller/useStorageAvailability.test.ts`; export all three hooks from `controller/index.ts`

## 3. Locales

- [ ] 3.1 Add `mainPage.*` keys (loading label, error text, retry, update-check-failed note, storage warning) and `views.cardsTitle`, `views.cardsEmptyState` keys to `locales/en.json` and `locales/ru.json` (FR10, FR3); verify `npx vitest run src/locales` (identical key sets)

## 4. Cards view and registry

- [ ] 4.1 TDD `views/cards/CardsView.tsx` empty state without any action, in en and ru (FR7, UX1); verify `npx vitest run src/views/cards`
- [ ] 4.2 TDD `createRetryableLazyView` in `views/createRetryableLazyView.ts` with a loader that rejects once and then resolves: after a remount the view renders and the loader was called twice (FR6, D4); verify `npx vitest run src/views/createRetryableLazyView.test.tsx`
- [ ] 4.3 Register `cardsView` in `views/index.ts` with `component: createRetryableLazyView(() => import("./cards/CardsView"))` and title key (FR3, D6); verify registry test `npx vitest run src/views/viewRegistry.test.ts` (one view, Cards, title key in every locale)

## 5. Page components (TDD)

- [ ] 5.1 Write `test/features/main_page/main_page_unit.feature` and `steps/main_page_unit.steps.ts` tagged `@add-main-page-scaffold @FR-X` for every main-page scenario except those of "Accessible and responsive main page", which task 6.1 writes in `main_page_e2e.feature` and `steps/main_page_e2e.steps.ts`; verify red with `npx vitest run src/test/features/main_page`
- [ ] 5.2 TDD `ViewHost` with `ViewSkeleton` and `ViewErrorFallback`: loading, error, retry after failed lazy import, resize re-resolution (installing the `resizeObserverFake`), second test view without page edit (FR2, FR4, FR5, FR6, M4, D3, D4); verify `npx vitest run src/app/ViewHost.test.tsx`
- [ ] 5.3 TDD `OfflineNote` and `StorageWarning` with polite/alert roles and no focus steal (FR8, FR9, NFR-A2); verify `npx vitest run src/app/OfflineNote.test.tsx src/app/StorageWarning.test.tsx` — one command
- [ ] 5.4 TDD `MainPage` (header, content, bottom bar slot, notices) and switch `AppShell` to render it; update `AppShell.test.tsx` and the existing feature scenario "Shell with no registered views" (FR1, UX3, D3); verify `npx vitest run src/app/AppShell.test.tsx`
- [ ] 5.5 Export new components from `app/index.ts`; verify the `main_page_unit` feature run is green: `npx vitest run src/test/features/main_page`

## 6. Accessibility, responsive, bundle

- [ ] 6.1 BDD E2E `main_page_e2e.feature` + steps: axe-core in 5 states × light/dark, no horizontal scroll at 320 and 2560 px (NFR-A1, NFR-R1, M2); verify `pnpm --filter @time-zones/client test:bdd --grep @add-main-page-scaffold`
- [ ] 6.2 Bundle check: extend `scripts/check-bundle-size.mjs` (package root) to also fail when the build emits no separate chunk whose file name starts with `CardsView-`; the 150 KB gzipped budget stays enforced by the existing check (NFR-P1, M5); verify `pnpm build && pnpm --filter @time-zones/client check:bundle-size`
- [ ] 6.3 Scoped mutation run on `app/ViewHost.tsx` and the three hooks (≤ 5 files), score ≥ 90% (M3); verify with `cd packages/client && npx stryker run --mutate '<files>'`
