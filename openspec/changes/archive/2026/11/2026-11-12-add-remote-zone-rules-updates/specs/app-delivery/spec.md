# Spec Delta

## ADDED Requirements

### Requirement: Zone rules publication
A scheduled workflow SHALL run daily and on manual dispatch, determine the newest released IANA release from the `data.iana.org` releases listing (never a `-latest` archive or the development `version` file), and stop when the committed release is not older by the release order. For a newer release it MUST compile it with the zone rules compiler, run the zone rules check, commit the release to `main` with a message naming the release, and deploy that commit. A failed step MUST fail the run and MUST NOT commit or deploy. <!-- implements FR1 of add-remote-zone-rules-updates -->

#### Scenario: The newest release in the listing
- **GIVEN** the releases listing holds `tzdata2026f.tar.gz`, `tzdata2026z.tar.gz`, `tzdata2026aa.tar.gz` and `tzcode2026ab.tar.gz`
- **WHEN** the newest release is determined
- **THEN** it is `2026aa`

#### Scenario: Already current
- **GIVEN** the committed release is `<committed>` and the newest listed release is `2026f`
- **WHEN** the workflow runs
- **THEN** it stops reporting "already current" and commits nothing

| committed |
|---|
| 2026f |
| 2026g |

#### Scenario: A newer release
- **GIVEN** the committed release is `2026f` and the newest listed release is `2026g`
- **WHEN** the workflow runs
- **THEN** `2026g` is compiled, checked, committed with a message naming it, and that commit is deployed

#### Scenario: The check fails
- **GIVEN** the compiled release differs from `zdump -v`
- **WHEN** the workflow runs
- **THEN** the run fails and nothing is committed or deployed

#### Scenario: Manual dispatch
- **WHEN** the workflow is dispatched by hand
- **THEN** it runs the same steps as a scheduled run

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

## MODIFIED Requirements

### Requirement: Works offline after the first visit
After one successful online visit, the application SHALL open without network and show the shell with all its styles and fonts. The zone rules version and release files are not precached: offline, the app uses the bundled or the stored release and makes no zone rules check. <!-- implements FR5 of setup-app-shell-and-pages-deploy; FR2, FR4 of add-remote-zone-rules-updates -->

#### Scenario: Reopening without network
- **WHEN** a user has visited the app once and opens it again with no network
- **THEN** the shell is shown with the app title

#### Scenario: Offline with the rules
- **WHEN** a user has visited the app once and opens it again with no network
- **THEN** the locations show their times from the active release
- **AND** no zone rules check is made
