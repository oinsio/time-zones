# Spec Delta

## ADDED Requirements

### Requirement: Zone rules publication
A scheduled workflow SHALL run daily and on manual dispatch, determine the current IANA release name from `data.iana.org` without a `-latest` archive, and stop when it equals the committed release. For a newer release it MUST compile it with the zone rules compiler, run the zone rules check, commit the release to `main` with a message naming the release, and deploy the site. A failed step MUST fail the run and MUST NOT commit. <!-- implements FR1 of add-remote-zone-rules-updates -->

#### Scenario: Already current
- **GIVEN** the committed release equals the current IANA release
- **WHEN** the workflow runs
- **THEN** it stops reporting "already current" and commits nothing

#### Scenario: A newer release
- **GIVEN** IANA names a release newer than the committed one
- **WHEN** the workflow runs
- **THEN** the release is compiled, checked, committed with a message naming it, and the site is deployed

#### Scenario: The check fails
- **GIVEN** the compiled release differs from `zdump -v`
- **WHEN** the workflow runs
- **THEN** the run fails and nothing is committed or deployed

#### Scenario: Manual dispatch
- **WHEN** the workflow is dispatched by hand
- **THEN** it runs the same steps as a scheduled run

### Requirement: Zone rules files are served and not precached
The site SHALL serve, under the app's base path, the zone rules version file `zone-rules/version.json` naming the newest release and its publication instant, and the release file `zone-rules/<release>.json` with the same content as the bundled release of that build. Neither MUST be in the service worker's precache manifest, and neither counts as initial JavaScript. <!-- implements FR2, NFR-P1 of add-remote-zone-rules-updates -->

#### Scenario: Files in the build
- **WHEN** the production build is read
- **THEN** `zone-rules/version.json` names the bundled release
- **AND** `zone-rules/<that release>.json` equals the bundled release asset

#### Scenario: Not precached
- **WHEN** the precache manifest of the built service worker is read
- **THEN** it lists neither `zone-rules/version.json` nor `zone-rules/<release>.json`

#### Scenario: Not initial JavaScript
- **WHEN** the bundle size check runs
- **THEN** the zone rules files are not counted and the check passes

## MODIFIED Requirements

### Requirement: Works offline after the first visit
After one successful online visit, the application SHALL open without network and show the shell with all its styles and fonts. The zone rules version and release files are not precached: offline, the app uses the bundled or the stored release and makes no check. <!-- implements FR5 of setup-app-shell-and-pages-deploy; FR2, FR4 of add-remote-zone-rules-updates -->

#### Scenario: Reopening without network
- **WHEN** a user has visited the app once and opens it again with no network
- **THEN** the shell is shown with the app title

#### Scenario: Offline with the rules
- **WHEN** a user has visited the app once and opens it again with no network
- **THEN** the locations show their times from the active release
- **AND** no zone rules check is made
