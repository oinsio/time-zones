# Spec Delta: app-delivery

## Purpose

How the application reaches users: published to GitHub Pages under the project sub-path, installable as a PWA with icons from one replaceable image, usable offline, and deployed automatically only when all checks pass.

## ADDED Requirements

### Requirement: Served under the project sub-path
The application SHALL be published at `https://oinsio.github.io/time-zones/`. The page, its scripts, styles, fonts, icons, manifest and service worker MUST all resolve under the `/time-zones/` path. <!-- implements FR1 of setup-app-shell-and-pages-deploy -->

#### Scenario: Opening the published address
- **WHEN** a user opens `/time-zones/`
- **THEN** the shell is shown and no resource request fails

#### Scenario: Service worker scope
- **WHEN** the service worker is registered
- **THEN** its scope is `/time-zones/`

### Requirement: Installable PWA
The application SHALL provide a web app manifest with name "Time Zones", short name "Time Zones", standalone display, `start_url` and `scope` equal to `/time-zones/`, theme color `#2F5BD3`, a background color equal to the light-theme background token, and icons of 192 px and 512 px including a maskable 512 px icon. The page MUST link a favicon, an Apple touch icon and the theme color. <!-- implements FR3 of setup-app-shell-and-pages-deploy -->

#### Scenario: Manifest is complete
- **WHEN** the manifest linked from the page is read
- **THEN** it contains the name, display mode, start URL, scope, theme color and the 192, 512 and maskable 512 icons

#### Scenario: Every icon is reachable
- **WHEN** each icon listed in the manifest and in the page head is requested
- **THEN** each responds successfully with an image

### Requirement: Icons come from one source image
All icons SHALL be produced from a single source image during the build. The maskable icon MUST keep the whole logo inside the maskable safe zone by adding padding. Replacing the source image and rebuilding MUST update every icon with no other change. <!-- implements FR4 of setup-app-shell-and-pages-deploy -->

#### Scenario: Logo is replaced
- **WHEN** the source image is replaced and the app is rebuilt
- **THEN** the favicon, the Apple touch icon and all manifest icons are regenerated from the new image

### Requirement: Works offline after the first visit
After one successful online visit, the application SHALL open without network and show the shell with all its styles and fonts. <!-- implements FR5 of setup-app-shell-and-pages-deploy -->

#### Scenario: Reopening without network
- **WHEN** a user has visited the app once and opens it again with no network
- **THEN** the shell is shown with the app title

### Requirement: Checks on every pull request
Every pull request SHALL run lint, typecheck, unit tests, the production build with the bundle size budget, and the smoke E2E scenarios. Any failing step MUST fail the check. <!-- implements FR12, NFR-P1 of setup-app-shell-and-pages-deploy -->

#### Scenario: A check fails
- **WHEN** a pull request introduces a lint, type, test, build or budget failure
- **THEN** the pull request check is reported as failed

#### Scenario: Bundle exceeds the budget
- **WHEN** the initial JavaScript of the build exceeds 150 KB gzipped
- **THEN** the build check fails and reports the actual size

### Requirement: Automatic deploy from main
Every push to `main` SHALL run the same checks and, only when all pass, publish the build to GitHub Pages. A failed check MUST leave the previously published version live. Deploys MUST NOT run concurrently. <!-- implements FR13, NFR-P2 of setup-app-shell-and-pages-deploy -->

#### Scenario: Green push to main
- **WHEN** a push to `main` passes all checks
- **THEN** the new build is published and live within 10 minutes of the push

#### Scenario: Red push to main
- **WHEN** a push to `main` fails any check
- **THEN** nothing is published and the previous version stays live

### Requirement: Build leaves sources untouched
The production build SHALL NOT modify any tracked source file. <!-- implements FR14 of setup-app-shell-and-pages-deploy -->

#### Scenario: Building a clean checkout
- **WHEN** the production build runs on a clean checkout
- **THEN** the working tree has no changes to tracked files afterwards
