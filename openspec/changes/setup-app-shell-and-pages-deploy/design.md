# Design: Set up app shell and GitHub Pages deploy

## Context

See proposal.md — Why. Current state of `packages/client`:

- Configured but unused: Vite with `vite-plugin-pwa` (`registerType: "prompt"`, `start_url: "/"`, no icons, Workbox globs without fonts), Vitest, Stryker, playwright-bdd (runs against `pnpm dev` on port 5173), Tailwind (`darkMode: ["class"]`, empty theme), i18next with language detection, `lib/temporal.ts`.
- Missing: `index.html`, `src/main.tsx`, any component, any GitHub workflow except CLA. Locale files are `{}`.
- Root `prebuild` runs `lint:fix`, so `pnpm build` rewrites sources (FR14).
- The container has no image tooling; the logo is a 1024x1024 JPG whose circle nearly touches the edges.

## Goals / Non-Goals

**Goals:**
- One place that defines the base path, used by the app, the manifest and the E2E tests.
- E2E runs against the production build, because the service worker only exists there (FR5, FR6, FR7).
- Deploy reuses the exact CI job, so "what was checked" equals "what is published" (FR12, FR13).

**Non-Goals:**
- Automatic discovery of locale files and dialect fallback from the README — a later change; this one only adds `_meta` (FR10).
- Persisting preferences through repository ports (ADR-0004) — the shell stores nothing.
- A separate theme color for dark mode — one `#2F5BD3` as agreed.

## Decisions

### D1. Base path is one constant used everywhere
`APP_BASE_PATH = "/time-zones/"` lives in a small config module next to the Vite config and is imported by `vite.config.ts` (Vite `base`, manifest `start_url` and `scope`) and by `playwright.bdd.config.ts` (`baseURL`). Dev, preview and production use the same path, so no "works locally, 404 on Pages" class of bugs. Drives FR1.

Alternative: env variable only in CI — rejected, dev and prod would differ and the E2E would not test the real path.

### D2. Icons generated at build time from one committed source
The source image moves from this change's `assets/app-icon-source.jpg` to `packages/client/assets/app-icon-source.jpg`. `vite-plugin-pwa`'s built-in `pwaAssets` integration with a `pwa-assets.config.ts` (`minimal-2023` preset: favicon, `apple-touch-icon-180x180`, `pwa-64/192/512`, `maskable-icon-512x512` with padding and white background) generates icons during the build, injects the head links and the manifest `icons`. Generated files are not committed. `sharp` (used by the generator) is added to `onlyBuiltDependencies`. Drives FR3, FR4.

Alternative: run the generator CLI once and commit PNGs — rejected, replacing the logo would need a manual step that is easy to forget.

### D3. E2E runs against `vite preview` of the production build
`playwright.bdd.config.ts` starts `pnpm build && pnpm preview --port <E2E_PORT> --strictPort` and uses `http://localhost:<E2E_PORT>/time-zones/`. The offline scenario waits for `navigator.serviceWorker.ready`, reloads so the page is controlled, then switches the browser context offline and reloads again. Drives FR1, FR5, NFR-A1, NFR-R1.

Alternative: dev server with the PWA dev option — rejected, dev service worker does not precache the real build.

### D4. Where the shell code lives
```
src/
  main.tsx                     mounts <AppShell/> inside <AppErrorBoundary/>
  app/                         shell (not a view): AppShell, AppErrorBoundary,
    index.ts                   RecoveryScreen, OfflineReadyNotice, UpdateNotice
  controller/                  usePwaUpdateStatus (wraps useRegisterSW),
    index.ts                   useDocumentLanguage (document title + <html lang>)
  model/index.ts               empty public API
  presenter/index.ts           empty public API
  views/index.ts               viewRegistry: [] (ViewDefinition type from ADR-0005)
  styles/tokens.css            design tokens
```
Side effects (service worker, document title and `lang`) sit in `controller/`, per the architecture rule; `app/` only renders. The shell reads `viewRegistry` and renders nothing below the heading while it is empty. Drives FR2, FR7, FR8, FR11.

### D5. Offline and update notices
`registerType: "prompt"` stays. `usePwaUpdateStatus` exposes `isOfflineReady`, `isUpdateAvailable`, `applyUpdate()` and `dismiss()`. The service worker raises offline-ready only when it is installed for the first time, so "once per installation" (UX3) needs no storage. Notices are a fixed bottom region with `role="status"` / `aria-live="polite"`, no focus change, Esc dismisses (NFR-A2); the page keeps padding for them so the heading is never covered (UX2). Drives FR6, FR7.

Unit tests control the service worker state with `vi.mock("virtual:pwa-register/react")` per test instead of the static alias mock.

### D6. Recovery screen
`AppErrorBoundary` is a class component (React has no hook for this) that renders `RecoveryScreen` with a translated message and a reload button. Reload goes through an injected `reloadPage` function (default `window.location.reload`) so tests do not touch the real location. Drives FR8, UX4.

### D7. Theme via CSS variables and `prefers-color-scheme`
Tokens in `styles/tokens.css` as CSS variables for light, overridden inside `@media (prefers-color-scheme: dark)`; Tailwind colors reference the variables and `darkMode` becomes `"media"`. `index.html` sets `<meta name="color-scheme" content="light dark">`. No JavaScript decides the theme, so there is no flash (UX1). Token values come from the "Visual style" section of views.md; background and text colors are taken from the approved screen HTML files. Drives FR9, NFR-A3.

Alternative: class-based dark mode set by a script — rejected until a manual theme switch exists (NG6).

### D8. Font
`@fontsource-variable/manrope` imported once in `main.tsx`; `woff2` added to Workbox `globPatterns` so the font is precached (FR9, FR5).

### D9. Language
i18next gets `supportedLngs: ["en", "ru"]` and `load: "languageOnly"` so `ru-RU` resolves to `ru`. `useDocumentLanguage` sets `document.title` and `<html lang>` on every language change. Shell keys: `app.title`, `app.offlineReady`, `app.updateAvailable`, `app.reload`, `app.dismiss`, `app.errorTitle`, `app.errorMessage`. Drives FR2, FR10.

### D10. CI and deploy share one workflow
- `.github/workflows/ci.yml` — `on: pull_request` and `workflow_call` (input `upload-pages-artifact`). Steps: checkout, `pnpm/action-setup` (pnpm version pinned via root `packageManager`), Node 22 with pnpm cache, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, bundle budget, `git diff --exit-code` (FR14), Playwright Chromium install, `test:bdd`. When the input is set, uploads `packages/client/dist` with `actions/upload-pages-artifact`.
- `.github/workflows/deploy.yml` — `on: push` to `main` and `workflow_dispatch`; job `ci` uses `ci.yml` with upload enabled; job `deploy` needs `ci`, runs `actions/deploy-pages` in the `github-pages` environment with `pages: write` and `id-token: write`; `concurrency: pages` without cancelling a running deploy.

Drives FR12, FR13, NFR-P2, M6.

### D11. Bundle budget script
`packages/client/scripts/check-bundle-size.mjs` reads `dist/index.html`, collects the entry script and its `modulepreload` links, gzips them with Node's `zlib` and fails above `INITIAL_JS_BUDGET_KB = 150`, printing the actual size. Runs as `pnpm --filter @time-zones/client check:bundle-size`. Drives NFR-P1, M5.

### D12. Build without auto-fix
Root `prebuild` is removed. `pnpm lint:fix` stays as a manual command. Drives FR14.

## Risks / Trade-offs

- [`sharp` native binary fails to install on some machines] → it is a devDependency used only at build; CI runs on ubuntu-latest where prebuilt binaries exist; approved in `onlyBuiltDependencies`.
- [Precaching every Manrope subset adds download weight on first visit] → acceptable (tens of KB each); limit subsets later if the first-visit budget becomes a problem.
- [Offline E2E is timing-sensitive] → wait for `serviceWorker.ready` and a controlled page before going offline; no fixed sleeps.
- [E2E on every PR lengthens CI] → Chromium only plus the mobile Chromium project; budget of 10 minutes (M6) is checked.
- [JPG source with white background] → icons get a white square; acceptable for a temporary logo (NG4).
- [Changing Tailwind `darkMode` to `"media"`] → no existing components depend on the class strategy.

## Migration Plan

1. Merge to `main` → deploy workflow publishes the first version (Pages source is already "GitHub Actions").
2. Rollback: revert the commit on `main`; the deploy republishes the previous build. A failed deploy leaves the last good version live.
