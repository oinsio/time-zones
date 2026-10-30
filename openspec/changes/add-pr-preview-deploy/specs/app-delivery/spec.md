## ADDED Requirements

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
