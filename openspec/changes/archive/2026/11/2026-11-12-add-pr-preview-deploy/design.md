# Design: Add PR preview deploy

## Context

Driven by FR1–FR7, NFR-P1 and UX1 of `proposal.md` (see proposal.md, Why). Current state:

- `.github/workflows/ci.yml` runs on `pull_request` and as a reusable workflow (`workflow_call`). Its `check` job ("Lint, test, build, E2E") builds `packages/client/dist` with `pnpm build`, checks the bundle budget, runs `git diff --exit-code` and the smoke E2E against that build. It uploads the GitHub Pages artifact only when the caller passes `upload-pages-artifact: true`. A second job, `benchmark`, runs only when `github.event_name == 'pull_request'`.
- `.github/workflows/deploy.yml` runs on push to `main`. It calls `ci.yml` with `upload-pages-artifact: true` and then deploys to Pages. Inside a called workflow `github.event_name` is the caller's event, `push`.
- `APP_BASE_PATH = "/time-zones/"` (`packages/client/app.config.ts`) is the Vite `base`, the manifest `start_url`/`scope`, and the base the E2E steps check the service worker scope against. It is a constant, not an environment value.
- `clear-progress/.github/workflows/deploy-qa.yml` is the model: a separate workflow on `pull_request` that installs, checks, builds in QA mode and runs `nwtgck/actions-netlify@v3` with `enable-pull-request-comment: true`, `overwrites-pull-request-comment: true` and `enable-commit-comment: false`. There its site is served at the root (`VITE_BASE_PATH=/`).
- `packages/client/src/test/benchmarks/ciBenchmarkJob.test.ts` already tests the shape of a `ci.yml` job by splitting the workflow text into job blocks (`splitJobBlocks`).
- Scripts that CI runs with Node import TypeScript directly, for example `scripts/check-bench-budgets.mjs` → `./benchBudgets.ts`. The pure part is tested under `src/test/`.

## Goals / Non-Goals

**Goals:**
- Reuse the PR check's build and its result. Do not run a second install, build or test.
- Keep `APP_BASE_PATH` a single constant that holds for every build.

**Non-Goals:**
- Any change to `deploy.yml`, `vite.config.ts`, `app.config.ts` or the app sources.
- A `netlify.toml`. The site is not linked to Git, so Netlify never builds, and everything the preview needs is in the deployed directory.

## Decisions

### D1: The preview is a job in `ci.yml`, not a separate workflow (FR1, FR7, NFR-P1)

Add a `preview` job to `ci.yml` with `needs: check`, the condition below (D5) and `timeout-minutes: 10`. `needs: check` gives "no preview for a red PR" (FR6) and the tested build (FR2) for free. The `check` job never depends on `preview` (FR7). Under `workflow_call` from `deploy.yml` the event is `push`, so the job is skipped on `main` (FR7).

- Alternative: a separate `preview.yml` on `pull_request`, like `clear-progress`, that calls `ci.yml` and then deploys. Rejected: `ci.yml` also runs on `pull_request` by itself, so every PR would run the full check twice. Moving the `pull_request` trigger out of `ci.yml` would rename the PR check that branch protection may require.
- Alternative: `workflow_run` after CI completes. Rejected: it runs in the context of `main`, needs extra wiring to find the PR number and the artifact, and is only worth it for fork PRs, which are out of scope (NG1).

### D2: The build is handed over as a workflow artifact (FR2, NFR-P1)

In `check`, after the smoke E2E, a step `if: github.event_name == 'pull_request'` uploads `packages/client/dist` with `actions/upload-artifact@v4` as `preview-build`, `retention-days: 1`. This is the only new step of `check`. `preview` downloads it with `actions/download-artifact@v4`. It has no checkout of dependencies and no build: it checks out the repo only to run the assembly script (D3), with `setup-node` from `.nvmrc` and no `pnpm install`.

- Alternative: rebuild in `preview`. Rejected by FR2: what is published would no longer be what was tested.

### D3: The preview serves `dist` under `/time-zones/` and redirects the root (FR2, FR3, UX1)

The preview job assembles a directory `preview-site/`: it copies `dist/` unchanged to `preview-site/time-zones/` and writes `preview-site/_redirects` and `preview-site/_headers` (Netlify's file-based configuration), then deploys `preview-site/`.

- `_redirects`: `/  /time-zones/  302`.
- `_headers`: `/*` with `X-Robots-Tag: noindex`.

The file contents come from a pure function `buildPreviewSiteFiles(appBasePath)` in `packages/client/scripts/previewSite/buildPreviewSiteFiles.ts`. It returns `{ redirects, headers, appDirectory }`, where `appDirectory` is `APP_BASE_PATH` without slashes. Constants live there: `PREVIEW_ROOT_REDIRECT_STATUS = 302`, `NOINDEX_HEADER`. Its command-line wrapper `scripts/assemble-preview-site.mjs <distDir> <siteDir>` imports `APP_BASE_PATH` from `app.config.ts`, copies, and writes the two files. No `/time-zones/` literal appears in the workflow.

- Alternative: build the preview with base `/` (an env override of `APP_BASE_PATH`, as `clear-progress` does with `VITE_BASE_PATH`). Rejected: it is a different build from the tested one (FR2), and it turns a constant that the manifest, the service worker scope and the E2E steps rely on into configuration.
- Alternative: a `netlify.toml` with the redirect. Rejected: it is read from the working directory of the CLI, not from the deployed directory, and would invite Netlify's own Git builds.

### D4: Netlify via `nwtgck/actions-netlify@v3` (FR1, FR4)

The same action as `clear-progress`, with:

- `publish-dir: preview-site`
- `production-deploy: false` (the default, written out so the shape test can see it): a draft deploy with its own unique address, so production on Netlify is never touched (FR1, M3). No `alias` input: every push gets a new unique address, as in `clear-progress` (NG5).
- `enable-pull-request-comment: true`, `overwrites-pull-request-comment: true`, `enable-commit-comment: false` (FR4).
- `enable-github-deployment: false`: the comment is the one place for the address, and the job needs no `deployments: write`.
- `deploy-message: "PR #<number>: <title>"`.
- env `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` from secrets.

The job permissions are `contents: read` and `pull-requests: write`. The workflow default stays `contents: read`.

### D5: When the preview runs (FR5, FR6)

- Job condition: `github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name == github.repository && github.actor != 'dependabot[bot]'`. Fork and Dependabot PRs get no secrets, so they are excluded up front (NG1).
- First step "Check preview secrets": a shell step with the two secrets in `env`. It writes `available=true|false` to `$GITHUB_OUTPUT` and, for each missing one, prints `::notice::Preview skipped: <NAME> is not set`. Every later step has `if: steps.preview-secrets.outputs.available == 'true'`. Secrets cannot be read in a job-level `if`, so this is a step.
- `concurrency: { group: preview-${{ github.event.pull_request.number }}, cancel-in-progress: true }` (FR5). The group is per PR number, so PRs never cancel each other.

### D6: The workflow shape is tested like the benchmark job (FR1–FR7, M4)

Move `splitJobBlocks` and the workflow path from `ciBenchmarkJob.test.ts` into a shared test helper `src/test/ciWorkflow.ts` (`readCiJobBlocks()`), and use it from both tests. A second copy would be a second owner of the same parsing. `src/test/previewSite/ciPreviewJob.test.ts` checks the `preview` job: `needs: check`, the pull-request, same-repository and Dependabot condition, the per-PR concurrency group with cancel, the 10-minute timeout, the secrets step and its guard, the action version and inputs of D4, and the `pull-requests: write` permission. It also checks that the `check` job has exactly one new artifact upload guarded by `pull_request`, that no job `needs: preview`, and that `preview` does not run `pnpm build` or `pnpm install`.

- Alternative: parse the YAML with a library. Rejected: it adds a dependency only for tests, and the text-block approach already exists in the project.

## Risks / Trade-offs

- [The Netlify site or secrets do not exist yet] → FR6 makes the job end successfully with a notice, so this change can be merged before the setup. The setup is a manual task for the owner (tasks, group 5).
- [A preview job for a PR from a branch of this repository has write access to PR comments and the Netlify token] → Only collaborators can push branches here. The job runs no code from the PR beyond the already-checked build and the assembly script.
- [Each push gets a new unique address, so the service worker update prompt cannot be tried between pushes] → Accepted, as in `clear-progress` (NG5). Unique origins also mean that no stale service worker cache from an older preview is ever served.
- [Netlify free-tier limits on build minutes do not apply, because nothing is built there. Bandwidth limits do] → Previews are opened by a few people. Revisit if a limit is reached.
- [An artifact upload adds seconds to `check`] → That is the only addition (NFR-P1). Retention is 1 day.

## Migration Plan

1. Merge with the job in place. Until the secrets exist, every preview job ends with the notice (FR6).
2. The owner creates a Netlify site with manual deploys only, creates a personal access token, and adds `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` as repository secrets.
3. The next PR gets its preview (M1, M2).

Rollback: delete the `preview` job and the upload step from `ci.yml`. Nothing else depends on them.
