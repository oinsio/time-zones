# app-delivery Specification

## Purpose

How the application reaches users: published to GitHub Pages under the project sub-path, installable as a PWA with icons from one replaceable image, usable offline, and deployed automatically only when all checks pass.

## Requirements

### Requirement: Served under the project sub-path
The application SHALL be published at `https://oinsio.github.io/time-zones/`. The page, its scripts, styles, fonts, icons, manifest and service worker MUST all resolve under the `/time-zones/` path. <!-- implements FR1 of setup-app-shell-and-pages-deploy -->

#### Scenario: Opening the published address
- **WHEN** a user opens `/time-zones/`
- **THEN** the shell is shown and no resource request fails

#### Scenario: Service worker scope
- **WHEN** the service worker is registered
- **THEN** its scope is `/time-zones/`

### Requirement: Installable PWA
The application SHALL provide a web app manifest with name "Time Zones", short name "Time Zones", standalone display, `start_url` and `scope` equal to `/time-zones/`, theme color `#2F5BD3`, a background color equal to the light-theme background token, and icons of 192 px and 512 px including a maskable 512 px icon. The page MUST link a favicon, an Apple touch icon and the theme color. The page MUST declare itself as a home-screen web app for iOS with `<meta name="apple-mobile-web-app-capable" content="yes">`. <!-- implements FR3 of setup-app-shell-and-pages-deploy; FR11 of support-legacy-ios-12-safari -->

#### Scenario: Manifest is complete
- **WHEN** the manifest linked from the page is read
- **THEN** it contains the name, display mode, start URL, scope, theme color and the 192, 512 and maskable 512 icons

#### Scenario: Every icon is reachable
- **WHEN** each icon listed in the manifest and in the page head is requested
- **THEN** each responds successfully with an image

#### Scenario: Page declares an iOS home-screen web app
- **WHEN** the head of the built page is read
- **THEN** it contains `<meta name="apple-mobile-web-app-capable" content="yes">`

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
Every pull request SHALL run lint, typecheck, unit tests, the production build with the bundle size budget, and the smoke E2E scenarios. Any failing step MUST fail the check. The result of the unit tests MUST NOT depend on the speed or load of the runner: no unit test may compare a measured duration with a limit. Every pull request MUST also run the timing benchmark in a separate job that reports the median of each timed operation and warns about every median above its budget, and that job MUST NOT fail the check. The check MUST also fail when the built JavaScript does not parse at the Safari 12 level or uses a regular-expression lookbehind, when the built CSS contains an `inset` shorthand or a `dvh` height without a preceding `vh` fallback in the same rule, or when production sources contain BigInt. The check MUST also run the zone rules check against `zdump -v` and fail on one difference, and MUST fail when the zone rules asset exceeds its gzipped budget. <!-- implements FR12, NFR-P1 of setup-app-shell-and-pages-deploy; FR6, FR7, FR8 of replace-wall-clock-row-budgets-with-deterministic-checks; FR13 of support-legacy-ios-12-safari; FR8, NFR-P1 of add-zone-rules-from-iana -->

#### Scenario: A check fails
- **WHEN** a pull request introduces a lint, type, test, build or budget failure
- **THEN** the pull request check is reported as failed

#### Scenario: Bundle exceeds the budget
- **WHEN** the initial JavaScript of the build exceeds 150 KB gzipped
- **THEN** the build check fails and reports the actual size

#### Scenario: A timing budget is missed
- **WHEN** the median of a timed operation in the benchmark is above its 50 ms budget
- **THEN** the benchmark job reports that median with a warning
- **AND** the pull request check is not failed by it

#### Scenario: Unit tests ignore runner speed
- **WHEN** the unit test files are searched for comparisons of a measured duration with a limit
- **THEN** none is found

#### Scenario: Built code is newer than Safari 12
- **WHEN** a pull request makes the built JavaScript use syntax Safari 12 cannot parse
- **THEN** the pull request check is reported as failed and names the file

#### Scenario: Built CSS uses the inset shorthand
- **WHEN** a pull request makes the built CSS contain an `inset:` declaration
- **THEN** the pull request check is reported as failed

#### Scenario: Built CSS uses dvh without a fallback
- **WHEN** a pull request makes a rule of the built CSS declare a `dvh` height with no `vh` value of the same property before it in that rule
- **THEN** the pull request check is reported as failed and names the file

#### Scenario: Sources use BigInt
- **WHEN** a pull request adds a BigInt literal, `BigInt(` or `epochNanoseconds` to production sources
- **THEN** the pull request check is reported as failed

#### Scenario: Zone rules differ from zdump
- **WHEN** a pull request changes the committed zone rules release so that one zone's offset differs from `zdump -v` at a clock change
- **THEN** the pull request check is reported as failed and names the zone

#### Scenario: Zone rules asset exceeds its budget
- **WHEN** the zone rules asset of the build exceeds its gzipped budget
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

### Requirement: Preview deploy for every pull request
Every pull request from a branch of this repository SHALL be published as a preview deploy once its PR check passes. The preview deploy MUST NOT replace the production deploy of the preview host, and MUST NOT change the GitHub Pages site. A new push to the pull request MUST cancel the still-running preview of that pull request only. <!-- implements FR1, FR5 of add-pr-preview-deploy -->

#### Scenario: Green pull request
- **WHEN** the PR check of a pull request from this repository passes
- **THEN** the build is published as a preview deploy with its own address

#### Scenario: Production is untouched
- **WHEN** a preview deploy is published
- **THEN** the production deploy of the preview host and the GitHub Pages site serve what they served before

#### Scenario: A newer push arrives
- **WHEN** a push to a pull request arrives while that pull request's preview is still being published
- **THEN** the older preview is cancelled and the newer one is published
- **AND** the previews of other pull requests keep running

### Requirement: Preview deploy is the tested build
The preview deploy SHALL serve the files that the PR check built and tested, unchanged and not rebuilt, under the `/time-zones/` path, as production does. <!-- implements FR2, UX1 of add-pr-preview-deploy -->

#### Scenario: Opening the preview
- **WHEN** a user opens `/time-zones/` on the preview address
- **THEN** the shell is shown and no resource request fails
- **AND** the service worker scope is `/time-zones/`

#### Scenario: Same bytes as checked
- **WHEN** the files of a preview deploy under `/time-zones/` are compared with the PR check's build output
- **THEN** they are identical

### Requirement: Preview site root and indexing
The preview deploy SHALL redirect its site root `/` to `/time-zones/` with status 302. Every response of the preview deploy MUST carry the header `X-Robots-Tag: noindex`. <!-- implements FR3 of add-pr-preview-deploy -->

#### Scenario: Opening the site root
- **WHEN** a user opens `/` on the preview address
- **THEN** they are redirected to `/time-zones/` with status 302

#### Scenario: Search engines are told to skip the preview
- **WHEN** any path of the preview deploy is requested
- **THEN** the response has the header `X-Robots-Tag: noindex`

### Requirement: One preview comment per pull request
The pull request SHALL have one bot comment with the address of its latest preview deploy. Each later preview deploy MUST update that comment instead of adding one. No comment MUST be posted on commits. <!-- implements FR4 of add-pr-preview-deploy -->

#### Scenario: First preview
- **WHEN** the first preview deploy of a pull request is published
- **THEN** a comment with its address is added to the pull request

#### Scenario: Next push
- **WHEN** a later preview deploy of the same pull request is published
- **THEN** the existing comment links to the new address
- **AND** the pull request still has exactly one preview comment

### Requirement: Preview is skipped when it cannot or must not run
No preview deploy SHALL be attempted when the PR check fails, when the pull request comes from a fork or from Dependabot, or when a preview host secret is unavailable. A missing secret MUST end the preview job successfully with a notice that names that secret. <!-- implements FR6 of add-pr-preview-deploy -->

#### Scenario: Red pull request
- **WHEN** the PR check of a pull request fails
- **THEN** no preview deploy is published for that commit

#### Scenario: Pull request from a fork
- **WHEN** a pull request comes from a fork
- **THEN** the preview job does not run and the PR check runs as before

#### Scenario: Secrets are missing
- **WHEN** `NETLIFY_AUTH_TOKEN` or `NETLIFY_SITE_ID` is not available to the preview job
- **THEN** nothing is published and the job ends successfully with a notice naming the missing secret

### Requirement: Preview never gates checks or production
The PR check SHALL NOT depend on the preview job: a failed preview deploy fails only the preview job. The PR check MUST gain no step other than keeping its build for the preview. Pushes to `main` MUST run no preview job. The preview job MUST time out after 10 minutes. <!-- implements FR7, NFR-P1 of add-pr-preview-deploy -->

#### Scenario: Preview host fails
- **WHEN** publishing a preview deploy fails
- **THEN** the preview job is reported as failed and the PR check result is unchanged

#### Scenario: Push to main
- **WHEN** a push to `main` runs the checks and the GitHub Pages deploy
- **THEN** no preview job runs
