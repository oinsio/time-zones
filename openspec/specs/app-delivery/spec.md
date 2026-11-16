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
After one successful online visit, the application SHALL open without network and show the shell with all its styles and fonts. The zone rules version and release files are not precached: offline, the app uses the bundled or the stored release and makes no zone rules check. <!-- implements FR5 of setup-app-shell-and-pages-deploy; FR2, FR4 of add-remote-zone-rules-updates -->

#### Scenario: Reopening without network
- **WHEN** a user has visited the app once and opens it again with no network
- **THEN** the shell is shown with the app title

#### Scenario: Offline with the rules
- **WHEN** a user has visited the app once and opens it again with no network
- **THEN** the locations show their times from the active release
- **AND** no zone rules check is made

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

### Requirement: Zone rules publication
A scheduled workflow SHALL run daily and on manual dispatch, determine the newest released IANA release from the `data.iana.org` releases listing (never a `-latest` archive or the development `version` file), and stop when the committed release is not older by the release order. For a newer release it MUST compile it with the zone rules compiler, run the zone rules check and the unit tests, and open or update the data refresh pull request of the zone rules with every file the compiler wrote, under a title naming the release. It MUST NOT push to `main`; the release reaches `main` only when that pull request merges, and the deploy is the ordinary deploy of `main`. A failed step MUST fail the run and MUST NOT open or change a pull request. A run that finds the committed release current MUST make one request to IANA and finish within 2 minutes. The workflow MUST act only on `main`, also when dispatched from another branch. <!-- implements FR1 of add-remote-zone-rules-updates; FR1, FR10, NFR-P1 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The newest release in the listing
- **GIVEN** the releases listing holds `tzdata2026f.tar.gz`, `tzdata2026z.tar.gz`, `tzdata2026aa.tar.gz` and `tzcode2026ab.tar.gz`
- **WHEN** the newest release is determined
- **THEN** it is `2026aa`

#### Scenario: Already current
- **GIVEN** the committed release is `<committed>` and the newest listed release is `2026f`
- **WHEN** the workflow runs
- **THEN** it stops reporting "already current" and opens no pull request

| committed |
|---|
| 2026f |
| 2026g |

#### Scenario: A newer release
- **GIVEN** the committed release is `2026f` and the newest listed release is `2026g`
- **WHEN** the workflow runs
- **THEN** `2026g` is compiled and checked, and the unit tests run
- **AND** a pull request titled "Update zone rules to 2026g" holds the compiled files
- **AND** nothing was pushed to `main`

#### Scenario: The compiler wrote two files
- **GIVEN** the zone rules compiler writes the release file and the zone coordinates file
- **WHEN** the workflow publishes `2026g`
- **THEN** the pull request holds both files

#### Scenario: The check fails
- **GIVEN** the compiled release differs from `zdump -v`
- **WHEN** the workflow runs
- **THEN** the run fails and no pull request is opened or changed

#### Scenario: Manual dispatch
- **WHEN** the workflow is dispatched by hand on `main`
- **THEN** it runs the same steps as a scheduled run

#### Scenario: Dispatch from another branch
- **WHEN** the workflow is dispatched by hand on a branch other than `main`
- **THEN** it compiles nothing and opens no pull request

### Requirement: Zone rules files are served and not precached
The site SHALL serve, under the app's base path, the zone rules version file `zone-rules/version.json` naming the bundled release and the build instant as an ISO 8601 timestamp with `Z`, and the release file `zone-rules/<release>.json` with the same content as the bundled release of that build. Neither MUST be in the service worker's precache manifest, and neither counts as initial JavaScript. <!-- implements FR2, NFR-P1 of add-remote-zone-rules-updates -->

#### Scenario: Files in the build
- **WHEN** the production build is read
- **THEN** `zone-rules/version.json` names the bundled release and a `publishedAt` ending in `Z`
- **AND** `zone-rules/<that release>.json` equals the bundled release asset

#### Scenario: Not precached
- **WHEN** the precache manifest of the built service worker is read
- **THEN** it lists neither `zone-rules/version.json` nor `zone-rules/<release>.json`
- **AND** it still lists the bundled release asset

#### Scenario: Not initial JavaScript
- **WHEN** the bundle size check runs
- **THEN** the zone rules files are not counted as initial JavaScript and the check passes

### Requirement: City data refresh
A scheduled workflow SHALL run monthly and on manual dispatch, only on `main`, and compile the city data from the current GeoNames dumps. When only the dump date differs from the committed city data, it MUST stop as "already current". Otherwise it MUST run the city data check and the unit tests and open or update the city data's pull request, titled with the dump date. A failed step MUST NOT open or change one. <!-- implements FR2, FR10 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: Nothing but the dump date changed
- **GIVEN** the committed city data was compiled from the dump of `2026-11-14`
- **AND** the dump of `2026-12-02` gives the same cities, names, zones, regions, populations and coordinates
- **WHEN** the workflow runs
- **THEN** it stops reporting "already current" and opens no pull request

#### Scenario: Cities changed
- **GIVEN** the dump of `2026-12-02` changes the population of 14 cities of the committed city data
- **WHEN** the workflow runs
- **THEN** the city data check and the unit tests run
- **AND** a pull request titled "Refresh city data to the dump of 2026-12-02" holds the compiled files

#### Scenario: A download fails
- **GIVEN** a GeoNames dump cannot be downloaded
- **WHEN** the workflow runs
- **THEN** the run fails and no pull request is opened or changed

### Requirement: Data refresh pull requests
Each data source SHALL have at most one open data refresh pull request, on its own branch; a newer refresh MUST replace its content and title. The data refresh bot MUST open it, so its checks start without approval. When the refresh guard passes, it MUST be squash-merged automatically once every required check of `main` passes, and the merge MUST start the ordinary deploy. A data refresh reaches `main` no other way. <!-- implements FR3, FR4, G3 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The pull request merges by itself
- **GIVEN** a data refresh pull request whose refresh guard passed
- **WHEN** every required check passes
- **THEN** it is squash-merged into `main` without a human action
- **AND** the deploy of `main` starts

#### Scenario: A check fails
- **GIVEN** a data refresh pull request whose refresh guard passed
- **WHEN** a required check fails
- **THEN** it stays open and `main` is unchanged

#### Scenario: A newer refresh replaces an open one
- **GIVEN** the pull request "Update zone rules to 2026g" is open
- **WHEN** the zone rules publication finds `2026h`
- **THEN** the same pull request holds the files of `2026h` under the title "Update zone rules to 2026h"
- **AND** no second pull request of the zone rules is open

#### Scenario: Sources do not share a pull request
- **GIVEN** the pull request of the zone rules is open
- **WHEN** the city data refresh finds changed cities
- **THEN** a separate pull request of the city data is opened

### Requirement: Data-only commits
The commit a data refresh pull request leaves on `main` SHALL have a message whose last line is the trailer `Data-Only: true`. For the zone rules and the city data its subject MUST name the source and its release or dump date; the commit of the CLDR pull request keeps the dependency bot's title with the pull request number as its subject. A pull request check MUST fail when a data refresh pull request changes a path outside the data paths of its source. The automation MUST NOT give the trailer to any other pull request. <!-- implements FR5, FR6, G4, UX2 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The commit of a zone rules refresh
- **WHEN** the pull request "Update zone rules to 2026g" with the number 140 merges
- **THEN** the commit on `main` has the subject "Update zone rules to 2026g (#140)"
- **AND** the last line of its message is `Data-Only: true`

#### Scenario: The commit of a city data refresh
- **WHEN** the pull request "Refresh city data to the dump of 2026-12-02" merges
- **THEN** the last line of the commit's message on `main` is `Data-Only: true`

#### Scenario: The commit of a CLDR update
- **WHEN** the CLDR pull request of the dependency bot with the number 150 merges
- **THEN** the subject of the commit on `main` is the dependency bot's title followed by "(#150)"
- **AND** the last line of its message is `Data-Only: true`

#### Scenario: Data paths of each source
- **WHEN** the data paths of a source are named
- **THEN** they are the zone rules directory for the zone rules, the city data directory for the city data, and the two CLDR version entries of the client package manifest with the lockfile for CLDR

#### Scenario: A data refresh branch with other changes
- **GIVEN** a pull request on the data refresh branch of `<source>` that changes `<path>`
- **WHEN** the pull request checks run
- **THEN** the data-only check `<outcome>`

| source | path | outcome |
|---|---|---|
| zone rules | the zone rules release file | passes |
| zone rules | the zone coordinates file | passes |
| zone rules | a file under `src/` | fails and names the file |
| city data | the committed city data | passes |
| city data | the zone rules release file | fails and names the file |
| CLDR | the lockfile and the two CLDR version entries | passes |
| CLDR | another dependency's version entry | fails and names the entry |

#### Scenario: An ordinary pull request
- **WHEN** a pull request on any other branch is merged
- **THEN** the automation added no `Data-Only` trailer to its commit

### Requirement: Refresh guard
The refreshed data SHALL be compared with the committed data before its pull request is opened or updated. When the comparison finds a loss listed below, automatic merging MUST be withheld, and the pull request MUST carry the label `needs-review` and state each reason. Otherwise automatic merging is enabled and the label is absent, also on a pull request left labelled earlier. <!-- implements FR7, UX1, M3 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The losses the guard looks for
- **WHEN** refreshed data is compared with the committed data
- **THEN** the losses are: more than 1% of the committed GeoNames cities missing; a committed city of at least 1 000 000 inhabitants missing; a zone the city data used and no longer uses; a zone identifier of the committed release missing; the coordinates of a zone that had them missing

#### Scenario: The guard decides
- **GIVEN** the committed city data holds 6 000 cities
- **WHEN** a refresh `<difference>`
- **THEN** the verdict is `<verdict>`

| difference | verdict |
|---|---|
| lacks 30 cities (0.5%), none of 1 000 000 inhabitants | merge |
| lacks 60 cities (1%), none of 1 000 000 inhabitants | merge |
| lacks 61 cities | needs review: the count and the share |
| lacks one city of 1 200 000 inhabitants | needs review: the city |
| no longer uses the zone `Asia/Almaty` | needs review: the zone |
| adds 200 cities | merge |

#### Scenario: Zone rules that lose a zone
- **GIVEN** the committed release holds the identifier `Europe/Kyiv`
- **WHEN** the refreshed release has no entry `Europe/Kyiv`, neither a zone nor a link
- **THEN** the verdict is "needs review" and names `Europe/Kyiv`

#### Scenario: Zone rules that lose coordinates
- **GIVEN** the committed zone coordinates hold `Asia/Almaty`
- **WHEN** the refreshed zone coordinates do not
- **THEN** the verdict is "needs review" and names `Asia/Almaty`

#### Scenario: A pull request left to a human
- **WHEN** a pull request is opened with the verdict "needs review"
- **THEN** it has the label `needs-review` and no automatic merging
- **AND** its text lists the reasons

#### Scenario: A later refresh passes
- **GIVEN** an open data refresh pull request with the label `needs-review`
- **WHEN** a newer refresh of the same source gets the verdict "merge"
- **THEN** the label is removed and automatic merging is enabled

### Requirement: Failed refresh is reported
A data refresh run that fails SHALL open one issue for its source, titled with the source, that names the failed step and links the run; while such an issue is open, a further failed run MUST add a comment to it and MUST NOT open another. The next successful run of that source, whether it found something newer or not, MUST close the issue with a comment. A run that works MUST leave no issue and no comment. <!-- implements FR8, UX1 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The first failure
- **GIVEN** no issue of the zone rules refresh is open
- **WHEN** the zone rules publication fails at the step "Compile the release"
- **THEN** an issue "Data refresh failed: zone rules" is opened that names the step and links the run

#### Scenario: A repeated failure
- **GIVEN** the issue "Data refresh failed: zone rules" is open
- **WHEN** the zone rules publication fails again
- **THEN** a comment with the new run is added and no second issue is opened

#### Scenario: Recovery
- **GIVEN** the issue "Data refresh failed: zone rules" is open
- **WHEN** the zone rules publication succeeds reporting "already current"
- **THEN** the issue is closed with a comment linking the run

### Requirement: CLDR updates
A dependency bot SHALL propose updates of the CLDR packages `cldr-bcp47` and `cldr-dates-full` together in one pull request, at most once a month. That pull request is the data refresh pull request of CLDR: it MUST merge automatically as a data-only commit only when it changes only the data paths of CLDR and every required check passed: the build, the tests and the data checks. When a required check fails, the pull request MUST NOT merge; it MUST stay open with the label `needs-review`, and the failure MUST be reported as "Failed refresh is reported" defines for a source, in the issue of CLDR, naming the failed check and linking the pull request; when every required check of a later CLDR pull request passes, that issue MUST be closed with a comment. No other dependency update MUST be merged automatically. <!-- implements FR9, NG5 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: A new CLDR release
- **GIVEN** `cldr-bcp47` and `cldr-dates-full` are at 48.2.0 and 49.0.0 is published
- **WHEN** the dependency bot runs
- **THEN** one pull request updates both packages
- **AND** when every required check passes it merges with the trailer `Data-Only: true`

#### Scenario: A CLDR update that breaks a check
- **GIVEN** the dependency bot opened the pull request that updates both CLDR packages
- **WHEN** a required check of that pull request fails
- **THEN** the pull request is not merged and gets the label `needs-review`
- **AND** one issue for CLDR names the failed check and links the pull request
- **AND** the app that users have is unchanged

#### Scenario: Another dependency
- **WHEN** the dependency bot proposes an update of a package other than the two CLDR packages, on a branch other than the CLDR group's
- **THEN** automatic merging is not enabled and no trailer is added
- **AND** this holds whatever the dependency bot's configuration allows, because the automation acts only on the CLDR group's branch

### Requirement: Schedules stay enabled
Every scheduled run of the zone rules publication SHALL re-enable the scheduled workflows of the data refresh, so that a repository without other activity keeps its schedules. The operator notes MUST state how to see that a schedule was disabled and how to enable it again by hand. <!-- implements FR10 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: A daily run renews the schedules
- **WHEN** the zone rules publication runs on its schedule
- **THEN** it has enabled the zone rules publication and the city data refresh workflows

#### Scenario: Renewing fails
- **GIVEN** enabling a workflow fails
- **WHEN** the zone rules publication runs
- **THEN** the run still looks for a newer release
- **AND** the run is reported as failed

### Requirement: Data refresh switch
The repository SHALL hold one switch for the data refresh, off until the maintainer turns it on. While it is off, every scheduled or dispatched run of the zone rules publication and of the city data refresh MUST stop at once reporting "data refresh is off" and MUST NOT open, change or merge a pull request or an issue, and a CLDR pull request of the dependency bot MUST NOT get automatic merging. Turning the switch on MUST need no change to a file of the repository. <!-- implements FR11 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The switch is off
- **GIVEN** the data refresh is switched off
- **WHEN** the zone rules publication or the city data refresh runs
- **THEN** it stops reporting "data refresh is off"
- **AND** no pull request or issue is opened or changed

#### Scenario: The switch is turned on
- **GIVEN** the data refresh was switched off
- **WHEN** the maintainer switches it on in the repository settings
- **THEN** the next run of each workflow refreshes its data as the other requirements define

### Requirement: Data refresh credentials
The data refresh bot SHALL hold only the repository permissions to write contents and pull requests. Opening, commenting and closing the issue of a failed refresh and enabling the scheduled workflows MUST use the run's own short-lived token, limited to writing issues and actions. The bot's credentials MUST be repository secrets, MUST never be printed by a step and MUST NOT be available to pull requests from forks. The zone rules publication MUST keep verifying the IANA archive's signature against the pinned key. <!-- implements NFR-S1 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: A data refresh workflow runs
- **WHEN** a data refresh workflow runs
- **THEN** the data refresh bot's token can write only contents and pull requests
- **AND** issues and the enabling of workflows use the run's own token, limited to writing issues and actions
- **AND** no step prints a secret, and no workflow triggered by a pull request from a fork receives the bot's credentials
