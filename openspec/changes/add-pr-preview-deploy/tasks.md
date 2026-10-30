# Tasks

All paths are relative to `packages/client/` unless they start with `.github/` or `docs/`. Run every test command from `packages/client/`, one at a time, never in the background (CLAUDE.md "Running tests"). Stryker runs only with `--mutate` on at most 5 files.

## 1. Glossary (proposal What Changes)

- [x] 1.1 Add **Preview deploy** to `docs/glossary/architecture.md`: "a deploy of one pull request's tested build to the preview host, under the same `APP_BASE_PATH`, with its own address linked from one PR comment. *Code:* the `preview` job in `.github/workflows/ci.yml`, `scripts/previewSite/buildPreviewSiteFiles.ts`. *Never:* staging, QA build." Verify: `grep -n "Preview deploy" docs/glossary/architecture.md` from the repo root prints the entry, and the file stays under 200 lines (`wc -l`).

## 2. Preview site files (FR2, FR3, design D3)

- [x] 2.1 RED: add `src/test/previewSite/buildPreviewSiteFiles.test.ts`, with each case commented `// FR2` or `// FR3 of add-pr-preview-deploy`. Cases: `appDirectory` is `time-zones` for `/time-zones/`, and `it.each` covers other bases (`/a/`, `/a/b/`); `redirects` is exactly one line redirecting `/` to the base with `302`; `headers` applies `X-Robots-Tag: noindex` to `/*`. Verify: `npx vitest run src/test/previewSite/buildPreviewSiteFiles.test.ts` fails (module missing).
- [x] 2.2 GREEN: implement `scripts/previewSite/buildPreviewSiteFiles.ts` (pure, no I/O) with `PREVIEW_ROOT_REDIRECT_STATUS` and the header constants. Header comment: `Implements FR2, FR3 of add-pr-preview-deploy (D3).` Verify: task 2.1's command passes.
- [x] 2.3 Add `scripts/assemble-preview-site.mjs <distDir> <siteDir>`. It imports `APP_BASE_PATH` from `../app.config.ts` and `buildPreviewSiteFiles`, copies `distDir` to `<siteDir>/<appDirectory>/` and writes `_redirects` and `_headers`. Header comment as in 2.2. Verify: after `pnpm build`, `node scripts/assemble-preview-site.mjs dist <scratch dir>` then `diff -r dist <scratch dir>/time-zones` prints nothing, and `cat <scratch dir>/_redirects <scratch dir>/_headers` shows the redirect and the header.
- [x] 2.4 Mutation (M4): `npx stryker run --mutate 'scripts/previewSite/buildPreviewSiteFiles.ts'`. Read `reports/mutation/mutation-report.json`. The score is ≥ 95% (minimum 90%). Kill survivors in the 2.1 test file.

## 3. Shared CI workflow reader (design D6)

- [x] 3.1 Refactor: move `splitJobBlocks`, `CI_WORKFLOW_FILE` and the job-key parsing from `src/test/benchmarks/ciBenchmarkJob.test.ts` to `src/test/ciWorkflow.ts` (`readCiJobBlocks(): Map<string, string>`), and import it there. No behavior change. Verify: `npx vitest run src/test/benchmarks/ciBenchmarkJob.test.ts` passes before and after.

## 4. Preview job in CI (FR1, FR4–FR7, NFR-P1, design D1, D2, D4, D5)

- [x] 4.1 RED: add `src/test/previewSite/ciPreviewJob.test.ts` on `readCiJobBlocks()`, with each `it` commented with its FR id of `add-pr-preview-deploy`. Cases: the `preview` job exists with `needs: check` (FR1, FR6); its `if` requires `pull_request`, the same repository and a non-Dependabot actor (FR6, FR7); its concurrency group is per PR number and has `cancel-in-progress: true` (FR5); `timeout-minutes: 10` (NFR-P1); a step with id `preview-secrets` writes `available` and a `::notice::` naming each secret, and every later step is guarded by `steps.preview-secrets.outputs.available == 'true'` (FR6); it uses `nwtgck/actions-netlify@v3` with `production-deploy: false`, `enable-pull-request-comment: true`, `overwrites-pull-request-comment: true`, `enable-commit-comment: false` and `enable-github-deployment: false`, and with no `alias` input (FR1, FR4, NG5); its permissions include `pull-requests: write`; it runs `assemble-preview-site.mjs` and no `pnpm install` or `pnpm build` (FR2); the `check` job uploads `preview-build` under a `pull_request` guard after the smoke E2E (FR2, NFR-P1); no job lists `preview` in `needs` (FR7). Verify: `npx vitest run src/test/previewSite/ciPreviewJob.test.ts` fails because there is no `preview` job.
- [x] 4.2 GREEN: in `.github/workflows/ci.yml`, add the `preview-build` upload step to `check` (D2), and the `preview` job (D1, D4, D5): checkout, `setup-node` from `.nvmrc`, download the artifact into `packages/client/dist`, `node packages/client/scripts/assemble-preview-site.mjs packages/client/dist preview-site`, then the Netlify action. Update the header comment with `Implements FR1–FR7, NFR-P1 of add-pr-preview-deploy (D1–D5).` Verify: task 4.1's command passes, then `npx vitest run src/test/benchmarks/ciBenchmarkJob.test.ts` passes (it must not match `bench` in the new job), and `wc -l ../../.github/workflows/ci.yml` is at most 200.
- [x] 4.3 Lint the workflow with `actionlint`: `brew install actionlint` if it is missing, then run `actionlint .github/workflows/ci.yml` from the repo root. If it cannot be installed, use JetBrains `get_file_problems` on `ci.yml`. Verify: no errors are reported.

## 5. Integration on the PR of this change (M1–M3, M5, UX1)

- [x] 5.1 Build check: `pnpm run build` from the repo root passes, and `pnpm lint` and `pnpm typecheck` pass (CLAUDE.md Post-Edit Workflow).
- [x] 5.2 Traceability (M5): from the repo root, `grep -rhE "add-pr-preview-deploy" .github packages/client/scripts packages/client/src` lists lines that name each of FR1–FR7, NFR-P1 and UX1 at least once. A range such as `FR1–FR7` counts for every id in it. If UX1 is missing, add it to the header of `buildPreviewSiteFiles.test.ts` (the redirect to the app path is what makes the preview open the same app).
- [ ] 5.3 Open the PR. Before the secrets exist, the `preview` job ends successfully with the notice naming both secrets, and `check` is green (FR6, FR7). Ask the owner to do the one-time setup (design Migration Plan, step 2): a Netlify site with manual deploys only, `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` in the repository secrets. Then re-run the jobs.
  - [x] Owner setup done on 2026-10-30, before the PR was opened: Netlify site with manual deploys only, `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` in the repository secrets. The "secrets missing" notice (FR6) can therefore no longer be seen on this PR; it stays covered by `ciPreviewJob.test.ts`.
- [ ] 5.4 M1, UX1: after the re-run, the PR has a bot comment with a preview address. `curl -sI <address>/` shows `302` with `location: /time-zones/` and `x-robots-tag: noindex`, and `curl -sI <address>/time-zones/` shows `200`. Open the address in Playwright (`browser_navigate`), and check that the shell renders and that `navigator.serviceWorker.ready` gives a scope ending in `/time-zones/`.
- [ ] 5.5 M2, M3: push one more commit. The PR still has exactly 1 preview comment (`gh pr view --comments | grep -c netlify` or `gh api repos/{owner}/{repo}/issues/<n>/comments`), and it links to the new deploy. The Netlify production URL of the site serves what it served before. Record both checks in the PR description.

## Workflow follow-up

- Archive the change with `/opsx:archive` after the PR is merged (path `openspec/changes/archive/2026/<MM>/<date>-add-pr-preview-deploy`).
