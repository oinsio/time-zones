# Handoff: refresh-data-through-scheduled-pull-requests

Apply the patches on the pull request branch before it merges: `git apply temporary-docs/gnomish/<task>/handoff/<patch>`.

## H1: Data refresh workflows

- **Serves:** FR1–FR6, FR8–FR11, NFR-P1, NFR-S1
- **Files:** `.github/workflows/zone-rules-publication.yml`, `.github/workflows/city-data-refresh.yml`, `.github/workflows/cldr-update.yml`, `.github/dependabot.yml`, `.github/workflows/ci.yml` (step "Check data-only paths"), `packages/client/src/test/dataRefresh/dataRefreshWorkflows.test.ts`, `dataRefreshOtherWorkflows.test.ts`, `workflowFiles.ts`
- **Verify:** `git apply --check H1-data-refresh-workflows.patch`; after applying, `pnpm --filter @time-zones/client exec vitest run src/test/dataRefresh`
- **Why manual:** the factory may not edit `.github/`.
- **Automated part:** every decision the workflows take is a tested script (groups 2–4); the workflow test in the patch runs in `pnpm test` once applied.

## H2: ADR-0017 and the status notes

- **Serves:** FR1, FR2, FR4, FR5
- **Files:** `docs/adr/0017-data-refresh-through-pull-requests.md`, `docs/adr/0014-zone-rules-from-iana.md`, `docs/adr/0015-city-data-from-geonames.md`, `CLAUDE.md`
- **Verify:** `git apply --check H2-adr-data-refresh.patch`
- **Why manual:** the factory may not write `docs/adr/` or `CLAUDE.md`.
- **Automated part:** `git apply --check` in task 6.2.

## H3: The data refresh bot

- **Serves:** FR3, NFR-S1
- **Files:** none
- **Verify:** Settings → GitHub Apps shows "time-zones data refresh" with Contents: write and Pull requests: write only, installed on this repository only; `DATA_REFRESH_APP_ID` and `DATA_REFRESH_APP_PRIVATE_KEY` exist as Actions secrets and as Dependabot secrets.
- **Why manual:** an account-level action that creates a secret; the sandbox has no GitHub access.
- **Automated part:** the workflow test of H1 asserts the token step and the job permissions.

## H4: Repository settings

- **Serves:** FR4, FR5, NFR-A1, NFR-R1
- **Files:** none
- **Verify:** auto-merge is allowed; squash merging is allowed with the default message "pull request title and description"; in the protection of `main`, the job "Lint, test, build, E2E" is a required check and a required approving review does not block the App (bypass for the App, or no required review); the labels `needs-review` and `data-refresh-failure` exist.
- **Why manual:** repository settings; the sandbox has no GitHub access and they could not be read while planning.
- **Automated part:** none.

## H5: First live refresh

- **Serves:** FR1–FR5, FR10, M1, M2, M4
- **Files:** none
- **Verify:** after H6, dispatch "Zone rules publication" and "City data refresh" by hand on `main` once. A pull request by the App appears (or the run says "already current" within 2 minutes), its checks start without approval, it merges by itself, the commit on `main` ends with `Data-Only: true`, the deploy starts, and `gh workflow list` shows both workflows active. After the first three refreshes, `git log --grep "Data-Only: true" --name-only` shows only data paths.
- **Why manual:** it exercises GitHub itself, which the sandbox cannot reach; design D4 and D9 rest on behaviour that is not documented in full.
- **Automated part:** the path check of H1 runs on every data refresh pull request.

## H6: Switch the data refresh on

- **Serves:** FR11
- **Files:** none
- **Verify:** once `apply-data-updates-silently` is deployed, set the repository variable `DATA_REFRESH_ENABLED` to `true` (Settings → Secrets and variables → Actions → Variables).
- **Why manual:** a repository setting that depends on another change being live; the sandbox has no GitHub access.
- **Automated part:** the workflow test of H1 asserts that every refresh step is conditioned on the variable.
