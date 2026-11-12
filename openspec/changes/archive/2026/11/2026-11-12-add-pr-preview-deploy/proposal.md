# Add PR preview deploy

## Why

A pull request can only be tried in a real browser after it is merged: `deploy.yml` publishes to GitHub Pages only on a push to `main`, and `ci.yml` checks a PR without publishing it. A reviewer who wants to see a layout, a drag or an install prompt on a phone must check out the branch and run it locally, and a change can only be tested on iOS 12 Safari (`support-legacy-ios-12-safari`) after it is live for everyone. `clear-progress` already solves this with `deploy-qa.yml`: every PR gets a Netlify deploy and a comment with its address.

Audience: reviewers and the author of every PR, and testers on real devices.

## What Changes

- ADDED: every pull request from this repository whose PR check passes is published as a **preview deploy** on Netlify. A bot comment on the PR links to it and is updated on every push, so the PR has one such comment.
- ADDED: the preview deploy serves exactly the build the PR check built and tested. It is not rebuilt.
- ADDED: the preview deploy is served under the same `/time-zones/` path as production. The site root redirects there. The preview is marked as not for search engines.
- MODIFIED: `ci.yml` keeps the PR build as a workflow artifact and gets a `preview` job, which runs only on pull requests.
- New glossary term: **Preview deploy** (Architecture context).
- Unchanged: production stays on GitHub Pages and is published only from `main` (`deploy.yml`). The app code, its base path and its manifest do not change.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `app-delivery`: adds the requirement "Preview deploy for every pull request".

## Impact

- CI: `.github/workflows/ci.yml` gets an artifact upload step in `check` and a new `preview` job. `deploy.yml` does not change.
- New: `packages/client/scripts/previewSite/buildPreviewSiteFiles.ts`, which is pure and builds the Netlify `_redirects` and `_headers` from `APP_BASE_PATH`. Also its command-line wrapper `packages/client/scripts/assemble-preview-site.mjs`, and the tests `src/test/previewSite/buildPreviewSiteFiles.test.ts` and `src/test/previewSite/ciPreviewJob.test.ts`. The workflow parsing of `src/test/benchmarks/ciBenchmarkJob.test.ts` moves to a shared test helper, `src/test/ciWorkflow.ts`.
- New third-party action: `nwtgck/actions-netlify@v3`, the same as in `clear-progress`. There are no new npm dependencies.
- One-time setup outside the repository, done by the repository owner: a Netlify site that is not linked to Git (so Netlify never builds on its own), plus the GitHub Secrets `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`.
- Docs: `docs/glossary/architecture.md`.

## Goals

- G1: Every PR from this repository has a working preview address within minutes of its PR check passing, without any local setup.
- G2: The preview deploy is the tested build, byte for byte.
- G3: Production and its deploy flow do not change.

## Non-Goals

- NG1: Previews for PRs from forks or from Dependabot. Netlify secrets are not available to them, so they get no preview, and their PR check is unaffected.
- NG2: Moving production off GitHub Pages, or giving the preview a different build mode, base path or configuration.
- NG3: Deleting old preview deploys. Netlify keeps them, and nothing links to them after the comment is updated.
- NG4: Running E2E or Lighthouse against the preview address.
- NG5: A stable per-PR alias address. Each push gets its own unique address, as in `clear-progress`.

## Users & Scenarios

- U1: An author pushes a PR. After the check passes, a comment appears on the PR with the preview address, and the author opens it on a phone.
- U2: The author pushes again. The same comment now links to the new deploy.
- U3: A reviewer opens the site root of the preview. They land on `/time-zones/` and see the shell.
- U4: A contributor opens a PR from a fork. The PR check runs as before, and no preview is attempted.
- U5: A PR breaks a test. No preview is published for that commit.

## Requirements

### Functional

- FR1: For every pull request opened from a branch of this repository, after the PR check job passes, the build that the check produced is published to Netlify as a deploy that is not the production deploy of the Netlify site.
- FR2: The published files are the PR check's `dist` output, unchanged, placed under the path of `APP_BASE_PATH` (`/time-zones/`). They are not rebuilt in the preview job.
- FR3: A request to the preview site root `/` is redirected (302) to `APP_BASE_PATH`. Every response of the preview carries `X-Robots-Tag: noindex`.
- FR4: The PR gets one bot comment with the preview address. Every later preview deploy of the PR updates that comment instead of adding a new one. No commit comments are posted.
- FR5: A new push to the PR cancels a preview job of the same PR that is still running. Preview jobs of different PRs do not cancel each other.
- FR6: No preview is attempted when the PR check fails, when the PR comes from a fork, or when `NETLIFY_AUTH_TOKEN` or `NETLIFY_SITE_ID` is not available. In the last case the job ends successfully with a notice that names the missing secret.
- FR7: The `check` job, which is the PR check, does not depend on the preview job. A Netlify failure fails only the `preview` job. Pushes to `main` (`deploy.yml` → `ci.yml` via `workflow_call`) run no preview job.

### Non-Functional

#### Performance

- NFR-P1: The preview job adds no step to the `check` job other than one artifact upload. The preview job itself has a 10-minute timeout.

#### Accessibility

_None. No markup changes._

#### Responsive

_None. No layout changes._

## UX Acceptance Criteria

- UX1: Opening the address from the PR comment shows the same app as production would after the merge. The shell renders, the manifest and service worker resolve under `/time-zones/`, and offline reopen works, all on the preview origin.

## UI States Matrix

The app's states do not change. The PR states:

| PR source | PR check | Preview |
|---|---|---|
| this repository | passed | deployed, comment created or updated |
| this repository | failed | not deployed, comment keeps the last successful address |
| this repository, secrets missing | passed | skipped with a notice |
| fork / Dependabot | any | job skipped |

## Behavior

No Gherkin feature. The behavior is CI configuration, checked by `src/test/previewSite/ciPreviewJob.test.ts` (shape of the workflow, the same approach as `ciBenchmarkJob.test.ts`) and `src/test/previewSite/buildPreviewSiteFiles.test.ts` (site files). Each test names its FR id with `add-pr-preview-deploy`.

## Visual Reference

Not applicable.

## Affected IA

No changes.

## Success Metrics

- M1: On the PR of this change, after the setup of the Netlify secrets, the bot comment links to a preview, and `/` and `/time-zones/` of that preview respond with 302 and 200.
- M2: After a second push to that PR, the PR has exactly 1 preview comment, and it links to the new deploy.
- M3: The site of the Netlify production deploy is unchanged by every preview job of that PR. `production-deploy` is never set.
- M4: All tests in `src/test/previewSite/` pass, and Stryker scores ≥ 95% (minimum acceptable ≥ 90%) on `scripts/previewSite/buildPreviewSiteFiles.ts`.
- M5: 100% of FR1–FR7, NFR-P1 and UX1 appear on at least one line under `.github/` or `packages/client/` that also names `add-pr-preview-deploy`.

## Open Questions

_None._ Q1 (a stable alias address per PR instead of a new address per push) is resolved: each push gets its own unique address, as in `clear-progress` (NG5).
