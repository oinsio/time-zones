# Spec Delta: app-delivery

## ADDED Requirements

### Requirement: App revision of a build
Every build SHALL carry an app revision fixed at build time: the identifier of the newest commit of the built history that does not carry the trailer `Data-Only: true`. A value given to the build explicitly MUST replace it. When the history cannot be read, or every commit the build can see is a data-only commit, the build MUST take a value unique to that build. <!-- implements FR1, M2 of apply-data-updates-silently -->

#### Scenario: The newest commit changed the app
- **GIVEN** the newest commit of the history is `c3` and carries no `Data-Only` trailer
- **WHEN** the app is built
- **THEN** the app revision is `c3`

#### Scenario: Data-only commits keep the revision
- **GIVEN** the history is `a1`, `b2`, then `c3` and `d4`, which both carry the trailer `Data-Only: true`
- **WHEN** the app is built from `d4`
- **THEN** the app revision is `b2`

#### Scenario: Another value of the trailer
- **GIVEN** the newest commit carries the trailer `Data-Only: false`
- **WHEN** the app is built
- **THEN** the app revision is the identifier of that commit

#### Scenario: An explicit value
- **GIVEN** the build is given the app revision `1.4.0`
- **WHEN** the app is built
- **THEN** the app revision is `1.4.0`

#### Scenario: The history cannot be read
- **GIVEN** `<condition>`
- **WHEN** the app is built twice
- **THEN** each build has an app revision, and the two differ

| condition |
|---|
| the sources are not a repository |
| every commit the build can see carries the trailer `Data-Only: true` |

### Requirement: App revision file
The site SHALL serve, under the app's base path, the file `app-revision.json` naming the app revision of the published build. It MUST NOT be in the service worker's precache manifest, MUST NOT count as initial JavaScript and MUST be at most 1 KB. The workflow that builds the published site MUST give the build the history it needs. <!-- implements FR1, FR2, NFR-P1 of apply-data-updates-silently -->

#### Scenario: The file in the build
- **WHEN** the production build is read
- **THEN** `app-revision.json` names the app revision fixed into the app's code
- **AND** the file is at most 1 KB

#### Scenario: Not precached
- **WHEN** the precache manifest of the built service worker is read
- **THEN** it does not list `app-revision.json`

#### Scenario: Not initial JavaScript
- **WHEN** the bundle size check runs
- **THEN** `app-revision.json` is not counted as initial JavaScript and the check passes

#### Scenario: The published build sees the history
- **GIVEN** the two newest commits of `main` carry the trailer `Data-Only: true`
- **WHEN** the deploy workflow builds `main`
- **THEN** the app revision is the identifier of the newest commit without the trailer
