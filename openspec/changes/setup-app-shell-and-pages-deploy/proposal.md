# Set up app shell and GitHub Pages deploy

## Why

The project has approved screens, an architecture and a configured toolchain, but no runnable application: there is no entry page, no root component and no delivery pipeline. Nothing can be opened on a device, so no feature can be tried by real use.

This change delivers an empty but real application — an installable, offline-capable PWA published to GitHub Pages on every merge to `main`. Every following feature change then ships to users by merging, with no extra setup.

Audience: the project owner and early users on phones, tablets and desktops. Urgency: every MVP feature from the README depends on this pipeline.

## What Changes

- ADDED: an application entry point and an app shell that shows only the app title (no features yet).
- ADDED: empty layer modules (model, presenter, controller, views) with public entry points and an empty view registry, following [ADR-0002](../../../docs/adr/0002-model-presenter-swappable-views.md) and [ADR-0005](../../../docs/adr/0005-view-registry.md).
- ADDED: installable PWA — manifest, icon set generated from one temporary logo (`assets/app-icon-source.jpg` in this change), theme color `#2F5BD3`, offline work after the first visit, notices for "ready to work offline" and "new version available".
- ADDED: recovery screen for unexpected errors instead of a blank page.
- ADDED: design tokens for light and dark themes from [views.md](../../../docs/architecture/views.md#visual-style), theme follows the system, Manrope font available offline.
- ADDED: locale metadata (`_meta`) in `en.json` and `ru.json`; shell strings in both languages.
- ADDED: CI checks on pull requests and automatic deploy to GitHub Pages on push to `main`.
- MODIFIED: the production build no longer rewrites source files (auto-fixing lint is removed from the build chain).

## Capabilities

### New Capabilities

- `app-shell`: the application frame — title, page language, theme and font, error recovery, offline and update notices, empty layer modules and view registry.
- `app-delivery`: how the application reaches users — hosting under the GitHub Pages sub-path, installable PWA with an icon set from one source image, CI checks and automatic deploy.

### Modified Capabilities

None — `openspec/specs/` is empty.

## Goals

- G1: The app is live at `https://oinsio.github.io/time-zones/` and updates automatically within 10 minutes of a merge to `main`.
- G2: The app installs to the home screen on Android, iOS and desktop Chrome with its own icon, and opens offline after the first visit.
- G3: The layered structure from the architecture docs exists, so the first feature change only adds code inside the prepared modules.
- G4: A broken change cannot reach users: failing checks block deploy.

## Non-Goals

- NG1: Domain model, clock, the Here entry, locations, search, settings — any MVP feature.
- NG2: Content on the screen beyond the app title (no empty-state illustration, no header bar).
- NG3: Storybook and visual regression — introduced with the first view (see Q2).
- NG4: The final logo — the provided image is temporary.
- NG5: Custom domain, analytics, error reporting services.
- NG6: Language and theme switchers in the UI.

## Users & Scenarios

- U1: A user opens the link on a phone, sees the app title in their language and theme, and adds the app to the home screen.
- U2: A user opens the installed app without network and sees the app, not a browser error page.
- U3: A user has the app open when a new version is deployed and is offered to reload into it.
- U4: The developer merges a pull request; the new version is live without manual steps.
- U5: The developer opens a pull request with a failing check; the problem is reported and nothing is deployed.

## Requirements

### Functional

- FR1: The app is served under the `/time-zones/` path of GitHub Pages; the page, assets, manifest and service worker all resolve under that path.
- FR2: The shell shows only the app title as the page heading. The title, the document title and the page `lang` attribute follow the active UI language (en, ru).
- FR3: The app is installable: the manifest declares name, short name, standalone display, `start_url` and `scope` under `/time-zones/`, theme color `#2F5BD3`, background color from the light theme tokens, and icons of 192 and 512 px including a maskable variant; the page links a favicon and an Apple touch icon.
- FR4: All icons are produced from a single source image; replacing that image and rebuilding updates every icon, with no other edits.
- FR5: After the first successful visit, the app opens and shows the shell without network.
- FR6: When the app becomes ready to work offline, the user sees a dismissible notice once.
- FR7: When a new version is available, the user sees a non-blocking notice with an action that reloads into the new version; the app never reloads on its own.
- FR8: An unexpected rendering error shows a recovery screen with an explanation and a reload action instead of a blank page.
- FR9: Colors come from design tokens with light and dark values; the theme follows the system preference; text uses Manrope, available offline.
- FR10: Every locale file carries a `_meta` block (`code`, `name`, `nativeName`, `baseLanguage`, `emoji`) whose `code` matches the file name.
- FR11: Layer modules `model`, `presenter`, `controller` and `views` exist, each with a public entry point; the view registry exists and is empty; the shell reads the registry and renders no view while it is empty.
- FR12: Every pull request runs lint, typecheck, unit tests, the production build and the smoke E2E; any failure marks the check red.
- FR13: Every push to `main` runs the same checks and, only if all pass, publishes the build to GitHub Pages.
- FR14: The production build does not modify source files.

### Non-Functional

#### Performance

- NFR-P1: Initial JavaScript is at most 150 KB gzipped.
- NFR-P2: From push to `main` to the new version being live takes at most 10 minutes.

#### Accessibility

- NFR-A1: axe-core reports no violations on the shell, the recovery screen and the notices, in light and dark themes.
- NFR-A2: Notices are announced to screen readers without taking focus, and their actions and dismiss control work with Tab, Enter and Esc.
- NFR-A3: Text and controls meet WCAG 2.1 AA contrast in both themes.

#### Responsive

- NFR-R1: No horizontal scrolling at any viewport width from 320 px to 2560 px.

## UX Acceptance Criteria

- UX1: The page never flashes the wrong theme on load.
- UX2: Notices do not cover the heading and do not block interaction with the page.
- UX3: The offline-ready notice appears at most once per installation.
- UX4: The recovery screen uses plain language, no technical error text.

## UI States Matrix

| Network | Data (service worker) | UI |
|---|---|---|
| online | first visit, caching in progress | shell with title |
| online | cached for offline | shell + offline-ready notice (once) |
| online | new version waiting | shell + update notice with reload action |
| offline | cached | shell with title, works as online |
| offline | not cached (never visited) | browser's own offline page — out of our control |
| any | rendering error | recovery screen with reload action |

Loading and empty states have no data behind them in this change: the shell renders synchronously and the empty view registry is the expected state (FR11).

## Behavior

- `packages/client/src/test/features/app_shell/app_shell_notices.feature` — offline-ready and update notices, error recovery (unit BDD, `@setup-app-shell-and-pages-deploy`).
- `packages/client/src/test/features/app_shell/app_shell_smoke_e2e.feature` — opening under the base path, language, installability, offline reopen, axe, responsive (E2E BDD, `@setup-app-shell-and-pages-deploy`).

## Visual Reference

No screen for this state; design tokens from [views.md](../../../docs/architecture/views.md#visual-style) are the source of truth. The temporary logo is `assets/app-icon-source.jpg` in this change.

## Affected IA

No changes.

## Success Metrics

- M1: The first merge to `main` after this change results in `https://oinsio.github.io/time-zones/` responding with the shell; deploy workflow success rate on `main` is 100% for green checks.
- M2: axe-core: 0 violations in all smoke E2E scenarios.
- M3: The offline reopen scenario passes in 100% of CI runs.
- M4: Mutation score of shell code >= 95% (minimum acceptable >= 90%).
- M5: Initial JavaScript <= 150 KB gzipped, checked on every build.
- M6: The full CI check completes in <= 10 minutes.

## Open Questions

- Q1: Russian app title — assumed "Часовые пояса"; the manifest name stays "Time Zones" because the manifest is not localized.
- Q2: When to add Storybook and visual regression — proposed: with the first view change, where there are real UI states to capture.

## Impact

- Code: `packages/client` — new entry page, `src/main.tsx`, `src/app/`, empty `src/model/`, `src/presenter/`, `src/controller/`, `src/views/`, tokens in `src/styles/`, locale files, Vite, PWA, Playwright and Stryker configuration.
- Dependencies: Manrope font package, PWA icon generator (and its native image library build approval).
- Repository: `.github/workflows/` (CI and deploy), root `package.json` scripts and package manager pin.
- Hosting: GitHub Pages with source "GitHub Actions" (already enabled).
