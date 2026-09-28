# Tasks

## 1. Tooling and dependencies

- [x] 1.1 Pin pnpm via `packageManager` in root `package.json` and remove the root `prebuild` script (FR14, D10, D12); verify `pnpm build` no longer runs `lint:fix` by checking the script list with `pnpm run`
- [x] 1.2 Add `@fontsource-variable/manrope` and `@vite-pwa/assets-generator`, add `sharp` to `onlyBuiltDependencies` in `pnpm-workspace.yaml` (FR3, FR4, FR9, D2, D8); verify `pnpm install --frozen-lockfile` succeeds after the lockfile update
- [x] 1.3 Move `openspec/changes/setup-app-shell-and-pages-deploy/assets/app-icon-source.jpg` to `packages/client/assets/app-icon-source.jpg` (FR4, D2); verify the file exists and the change folder no longer holds it

## 2. Base path, entry page and PWA configuration

- [x] 2.1 Add the `APP_BASE_PATH = "/time-zones/"` config module and use it for Vite `base`, manifest `start_url` and `scope` (FR1, D1); verify `pnpm --filter @time-zones/client build` emits asset URLs under `/time-zones/` in `dist/index.html`
- [x] 2.2 Create `packages/client/index.html` with viewport, `color-scheme` meta, default `lang="en"` and title, root element and `src/main.tsx` script (FR1, FR2, UX1); verify the build succeeds
- [x] 2.3 Add `pwa-assets.config.ts` (`minimal-2023` preset, maskable padding, white background) and enable `pwaAssets` in `vite.config.ts`; complete the manifest (name, short name, standalone, theme color `#2F5BD3`, background color from the light token) and add `woff2` to Workbox `globPatterns` (FR3, FR4, FR5, FR9, D2, D8); verify `dist/manifest.webmanifest` lists 192, 512 and maskable icons and `dist/` contains the favicon and Apple touch icon

## 3. Controller: language and service worker status (TDD)

- [x] 3.1 Configure i18next `supportedLngs: ["en", "ru"]` and `load: "languageOnly"`; add `_meta` blocks and shell keys (`app.*` from D9) to `en.json` and `ru.json` (FR2, FR10); verify with a Vitest test that each file's `_meta.code` equals its file name and both files have identical key sets
- [x] 3.2 TDD `useDocumentLanguage` in `src/controller/` — sets `document.title` and `<html lang>` on language change (FR2, D9); verify red then green with `npx vitest run src/controller`
- [x] 3.3 TDD `usePwaUpdateStatus` in `src/controller/` — exposes offline-ready, update-available, `applyUpdate`, `dismiss`, with `vi.mock("virtual:pwa-register/react")` per test (FR6, FR7, D5); verify red then green with `npx vitest run src/controller`
- [x] 3.4 Export both hooks from `src/controller/index.ts`; create empty `src/model/index.ts`, `src/presenter/index.ts` and `src/views/index.ts` with the `ViewDefinition` type and empty `viewRegistry` (FR11, D4); verify `pnpm typecheck` passes

## 4. Design tokens and theme

- [x] 4.1 Create `src/styles/tokens.css` with light and dark values (accent, background, text, day-period colors from views.md and the screen HTML files), import it in `globals.css`, map Tailwind colors to the variables, switch `darkMode` to `"media"` (FR9, NFR-A3, UX1, D7); verify the build succeeds and the generated CSS contains the `prefers-color-scheme: dark` block
- [x] 4.2 Import Manrope in `src/main.tsx` and set it as the Tailwind sans font (FR9, D8); verify `dist/` contains Manrope `woff2` files listed in the service worker precache manifest

## 5. App shell UI (TDD + unit BDD)

- [x] 5.1 Write `src/test/features/app_shell/app_shell_notices.feature` with `@setup-app-shell-and-pages-deploy @FR-X` tags for: title per language, empty registry, offline-ready notice (shown, dismissed), update notice (shown, reload, dismiss, Esc), recovery screen (shown, reload) (FR2, FR6, FR7, FR8, FR11); verify `npx vitest run src/test/features/app_shell` fails (red) before implementation
- [x] 5.2 Implement `AppShell` (heading from `app.title`, reads `viewRegistry`, uses `useDocumentLanguage`) in `src/app/` with component tests (FR2, FR11, D4); verify `npx vitest run src/app`
- [x] 5.3 Implement `OfflineReadyNotice` and `UpdateNotice` (`role="status"`, `aria-live="polite"`, no focus change, Esc dismisses, reserved space so the heading is not covered) with component tests (FR6, FR7, UX2, UX3, NFR-A2, D5); verify `npx vitest run src/app`
- [x] 5.4 Implement `AppErrorBoundary` and `RecoveryScreen` with injected `reloadPage` and component tests (FR8, UX4, D6); verify `npx vitest run src/app`
- [x] 5.5 Create `src/main.tsx` mounting `AppShell` inside `AppErrorBoundary` and export shell parts from `src/app/index.ts`; implement step definitions in `steps/app_shell_notices.steps.ts` (FR2, FR6, FR7, FR8, FR11); verify `npx vitest run src/test/features/app_shell` is green and `pnpm --filter @time-zones/client build` succeeds
- [x] 5.6 Add `src/app/**` and `src/controller/**` to Stryker scope if needed and run `cd packages/client && npx stryker run --mutate 'src/app/AppShell.tsx,src/app/UpdateNotice.tsx,src/app/OfflineReadyNotice.tsx,src/app/AppErrorBoundary.tsx,src/controller/usePwaUpdateStatus.ts'`, then a second run for the remaining files (<= 5 files per run) (M4); verify mutation score >= 95% (minimum >= 90%) in `reports/mutation/mutation-report.json`

## 6. Smoke E2E against the production build

- [ ] 6.1 Switch `playwright.bdd.config.ts` to `pnpm build && pnpm preview` on a fixed E2E port with `baseURL` from `APP_BASE_PATH` (FR1, D1, D3); verify `pnpm --filter @time-zones/client test:bdd:gen` succeeds
- [ ] 6.2 Write `src/test/features/app_shell/app_shell_smoke_e2e.feature` and `steps/app_shell_smoke_e2e.steps.ts` (`// Verifies ... of setup-app-shell-and-pages-deploy`): opens under `/time-zones/` with no failed requests, service worker scope, title in en and ru (`locale` of the browser context), manifest completeness and reachable icons, offline reopen, axe-core with no violations in light and dark (`colorScheme`), no horizontal scroll at 320 px and 2560 px (FR1, FR2, FR3, FR5, NFR-A1, NFR-A3, NFR-R1, M2, M3); verify `pnpm --filter @time-zones/client test:bdd` passes on both projects

## 7. Bundle budget, CI and deploy

- [ ] 7.1 Add `packages/client/scripts/check-bundle-size.mjs` with `INITIAL_JS_BUDGET_KB = 150` and a `check:bundle-size` script (NFR-P1, M5, D11); verify it prints the gzipped size and exits non-zero when the budget constant is temporarily lowered below the actual size
- [ ] 7.2 Add `.github/workflows/ci.yml` (`pull_request` + `workflow_call` with `upload-pages-artifact` input): install, lint, typecheck, test, build, bundle budget, `git diff --exit-code`, Playwright Chromium, `test:bdd`, optional Pages artifact upload (FR12, FR14, D10); verify the workflow runs green on the pull request of this change
- [ ] 7.3 Add `.github/workflows/deploy.yml` (`push` to `main` + `workflow_dispatch`; `ci` job reuses `ci.yml` with upload; `deploy` job with `actions/deploy-pages`, `pages: write`, `id-token: write`, `concurrency: pages`) (FR13, NFR-P2, D10); verify with a YAML lint (`actionlint` if available) and, after merge, a successful run

## 8. Documentation and integration checks

- [ ] 8.1 Update `README.md` (live link, `pnpm preview`, how to replace the logo) and `docs/architecture/overview.md` "Where things live" with `app/` and `assets/` (FR1, FR4); verify links resolve and the layout matches the created folders
- [ ] 8.2 Run `pnpm preflight` and `pnpm build` locally one at a time; verify both pass and `git status` shows no changes made by the build (FR12, FR14)
- [ ] 8.3 After merge to `main`, confirm the deploy run succeeded and `https://oinsio.github.io/time-zones/` shows the shell within 10 minutes of the push (FR13, NFR-P2, M1, M6)
