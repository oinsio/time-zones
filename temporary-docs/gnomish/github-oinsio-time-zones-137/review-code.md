# Review: refresh-data-through-scheduled-pull-requests

## Summary

| Item | Value |
|---|---|
| Tasks verified | 20/20 |
| Requirements traced | 64/67 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 0 |

## Tasks

Paths are relative to `packages/client/` unless they start with `docs/` or `temporary-docs/`; `H1` is `temporary-docs/gnomish/github-oinsio-time-zones-137/handoff/H1-data-refresh-workflows.patch` (patch line numbers).

- ✅ 1.1 `docs/glossary/zone-rules.md:17` reworded ("checks it and opens its data refresh pull request"); `docs/glossary/architecture.md:21-26` adds the six terms with *Code:* owners and *Never:* words; files are 26 and 21 lines.
- ✅ 1.2 `zone-rules/README.md:81,91,101` (branch `data-refresh/zone-rules`, `DATA_REFRESH_ENABLED`, `gh workflow enable`); `city-data/README.md:15,56,59` (`source.dumpDate`, `data-refresh/city-data`); `2026-11-15` no longer appears in `city-data/README.md`.
- ✅ 2.1 `scripts/dataRefresh/refreshConstants.ts:8-78` holds the trailer, sources, branches, CLDR prefix, both labels, thresholds, verdicts and `DATA_PATHS` as `as const` objects.
- ✅ 2.2 `scripts/dataRefresh/compareCityData.ts:30-65` (`isSameData` ignores only `source.dumpDate`, removed cities/share/large cities/zones); tests `src/test/dataRefresh/compareCityData.test.ts:37-125`.
- ✅ 2.3 `scripts/dataRefresh/compareZoneRules.ts:27-46`; tests `src/test/dataRefresh/compareZoneRules.test.ts:15-61` (zone and link, zone→link, coordinates, either side without a coordinates file).
- ✅ 2.4 `scripts/dataRefresh/refreshVerdict.ts:31-72`; `src/test/dataRefresh/refreshVerdict.test.ts:33-47` is the `it.each` over the spec table (60 of 6 000 → MERGE, 61 → NEEDS_REVIEW), `:103-125` the two zone rules losses.
- ✅ 3.1 `scripts/dataRefresh/refreshPullRequest.ts:46-84`; `src/test/dataRefresh/refreshPullRequest.test.ts:22-125` (titles, reasons, trailer last line, `mergeSubject(140)`).
- ✅ 3.2 `scripts/dataRefresh/checkDataOnlyPaths.ts:22-78`; `src/test/dataRefresh/checkDataOnlyPaths.test.ts:23-109` (`it.each` over the spec table, CLDR manifest diff offenders).
- ✅ 3.3 `scripts/dataRefresh/refreshFailureIssue.ts:15-32`; `src/test/dataRefresh/refreshFailureIssue.test.ts:11-36`.
- ✅ 3.4 `scripts/dataRefresh/cli.ts:23-48`, `cliCommands.ts:61-174`, `cliInputs.ts`; `src/test/dataRefresh/cli.test.ts:61-300`; `package.json` scripts `data-refresh:verdict|check-paths|issue`. (The test file is 300 lines, see R4.)
- ✅ 4.1 `src/test/features/data_refresh/data_refresh_guard.feature` (five scenarios, tags `@FR2`/`@FR7`) with `steps/data_refresh_guard.steps.ts` and `steps/data_refresh_guard.fixtures.ts`.
- ✅ 4.2 `src/test/features/data_refresh/data_refresh_data_only_commits.feature` (zone rules, city data, CLDR commit, data paths, branch outline, ordinary pull request, sources) with `steps/data_refresh_data_only_commits.steps.ts:111-198`.
- ✅ 4.3 `src/test/features/data_refresh/data_refresh_failure_issue.feature` with `steps/data_refresh_failure_issue.steps.ts`.
- ✅ 4.4 `src/test/features/zone_rules_updates/zone_rules_updates_publication.feature:10-25` reworded and tagged `@refresh-data-through-scheduled-pull-requests @FR1`; steps reworded at `steps/zone_rules_updates_publication.steps.ts:74,97`.
- ✅ 5.1 Measured by this review: run 1 (5 files) 99.32%, run 2 (`refreshFailureIssue.ts`, `cli.ts` and the other new files) 99.01% — both ≥ 95% per run as the task asks; `refreshConstants.ts` alone is below 90% (R2).
- ✅ 5.2 No file under `packages/client/src/` outside `src/test/` changed (`git diff --name-only` on the branch); CI is green per the stage input.
- ✅ 5.3 Every new file under `scripts/dataRefresh/` and `src/test/dataRefresh/` carries `of refresh-data-through-scheduled-pull-requests`; feature tags name FR1, FR2, FR3, FR5, FR6, FR7, FR8.
- ✅ 6.1 H1 exists and `git apply --check` passes; it adds `dependabot.yml`, the CI step "Check data-only paths" (H1:39-43), the three workflows and `src/test/dataRefresh/dataRefreshWorkflows.test.ts` (H1:494-745) with the CLDR branch condition, subject/trailer, token-permission and secrets assertions.
- ✅ 6.2 `H2-adr-data-refresh.patch` applies cleanly (`git apply --check`); it creates ADR-0017, the status notes of ADR-0014 and ADR-0015 and the `CLAUDE.md` ADR list entry.
- ✅ 6.3 `handoff/README.md` holds six `## H[1-6]:` sections.

## Requirements

- ✅ FR1 — `zone-rules-publication.yml` in H1:319-493 (daily cron, dispatch, `zone-rules:latest` → compile → check → `pnpm test` → pull request, no push to `main`, `git add packages/client/zone-rules` carries both compiled files); `scripts/zoneRules/latestRelease.ts`; feature `zone_rules_updates_publication.feature:10-25`; workflow test H1 "never pushes to main", "opens no pull request when the release is current".
- ✅ FR2 — `compareCityData.ts:46` + `refreshVerdict.ts:34-36` (`UNCHANGED`); `city-data-refresh.yml` H1:41-198 stops on `UNCHANGED` before check, tests and pull request; scenario "Nothing but the dump date changed".
- ✅ FR3 — `refreshPullRequest.ts:46-84` (fixed branch, title with release or dump date); workflow `gh pr list --head … --state open` then `gh pr edit` or `gh pr create` with the App token (H1:138-149, 427-438); scenario "Sources do not share a pull request".
- ✅ FR4 — `gh pr merge --auto --squash` only for a non-`NEEDS_REVIEW` verdict (H1:151-157, 440-446); workflow test "enables auto-merge only for a merge verdict"; live check in H5.
- ✅ FR5 — `refreshPullRequest.ts:33-44` (`appendDataOnlyTrailer`, `buildMergeSubject`); `cldr-update.yml` subject `"$PULL_REQUEST_TITLE (#$PULL_REQUEST_NUMBER)"` and trailer body (H1:245-248); scenarios in `data_refresh_data_only_commits.feature`.
- ✅ FR6 — `checkDataOnlyPaths.ts:22-78`; CI step `data-refresh:check-paths auto origin/main HEAD` (H1:39-43); `cli.test.ts:174-257`; outline "A data refresh branch with other changes".
- ✅ FR7 — `refreshVerdict.ts:31-72` with `MAX_REMOVED_CITY_SHARE`, `LARGE_CITY_POPULATION`; label `needs-review` and reasons in the body (`refreshPullRequest.ts:52-66`, H1:152-154); `refreshVerdict.test.ts`, `data_refresh_guard.feature`.
- ⚠️ FR8 — `refreshFailureIssue.ts` and the failure/recovery steps (H1:160-198, 455-493) exist and are tested, but a run that fails before checkout and `pnpm install` finish (e.g. the App token step) cannot build the issue title and opens no issue (R1).
- ✅ FR9 — `dependabot.yml` (H1:1-23: monthly, allow only the two CLDR packages, group `cldr`); `cldr-update.yml` auto-merge and `report-checks` job labelling `needs-review` and reporting via `data-refresh:issue cldr` (H1:199-318); workflow test "labels the pull request and reports a failed check".
- ✅ FR10 — `gh workflow enable` for both workflows with `continue-on-error` and a later failing step (H1:387-395, 449-453); `if: github.ref == 'refs/heads/main'` on both jobs; workflow tests "enables both scheduled workflows", "acts only on main".
- ✅ FR11 — every step but the switch report carries `vars.DATA_REFRESH_ENABLED == 'true'`, the CLDR jobs too (H1:78-80, 220-226); workflow test "conditions every step but the report on the switch".
- ✅ NFR-P1 — `timeout-minutes: 20` on every refresh job; `latestRelease.ts:89` makes the one IANA request; workflow test "acts only on main, within 20 minutes"; the 2-minute run is measured live in H5.
- ✅ NFR-P2 — no budget changed; the existing CI job (`check:bundle-size`) runs on every data refresh pull request; no file under `src/` outside `src/test/` changed.
- ✅ NFR-A1 — no interface change; the required CI job "Lint, test, build, E2E" (smoke E2E with axe-core) gates every data refresh pull request (H4 makes it required).
- ✅ NFR-R1 — the screenshot scenarios in the same required job block auto-merge of a pull request that changes an approved screenshot.
- ✅ NFR-S1 — App token asks only `permission-contents: write`, `permission-pull-requests: write`; issue and `gh workflow enable` steps use `github.token` under job permissions `contents: read, issues: write, actions: write` (H1:70-74, 82-91); workflow test `describe("secrets")` (no step prints a secret, secrets only in token steps).
- ⚠️ UX1 — one issue per failing source and one labelled pull request per suspicious refresh are implemented, but failures before setup completes produce no issue (R1).
- ✅ UX2 — titles "Update zone rules to 2026g", "Refresh city data to the dump of 2026-12-02" (`refreshPullRequest.ts:46-50`, `refreshPullRequest.test.ts:22`).
- ✅ M1 — measurement is the first live run, described in handoff H5 (`tasks.md:57`); the "no push to `main`" part is asserted by the workflow test.
- ✅ M2 — the CI path check (H1:39-43) and the `git log --grep "Data-Only: true" --name-only` check of H5.
- ✅ M3 — `refreshVerdict.test.ts:33-47,103-125`: the five losses each give `NEEDS_REVIEW`, 30 of 6 000 (0.5%) gives `MERGE`.
- ✅ M4 — measured live in H5 (`tasks.md:57`), bounded by `timeout-minutes: 20`.
- ⚠️ M5 — measured: all new files ≥ 98% except `refreshConstants.ts` at 87.50% (R2).
- ✅ M6 — `git diff --name-only` on the branch lists no file under `packages/client/src/` outside `src/test/`.
- ✅ Scenario: The newest release in the listing — unchanged `latestRelease.ts`; `zone_rules_updates_publication.feature:5-8`.
- ✅ Scenario: Already current — `zone_rules_updates_publication.feature:10-19` (tagged for this change); workflow steps conditioned on `steps.latest.outputs.release != ''`.
- ✅ Scenario: A newer release — `zone_rules_updates_publication.feature:21-25`; workflow compile/check/test/pull request steps (H1:397-446).
- ✅ Scenario: The compiler wrote two files — `git add packages/client/zone-rules` (H1:432) stages both `release.json` and `zone-coordinates.json`; outline row "zone coordinates file passes".
- ✅ Scenario: The check fails — `zone-rules:check` step precedes the pull request step; a failed step skips it.
- ✅ Scenario: Manual dispatch — `workflow_dispatch` with the same job (H1:333); workflow test "runs on its schedule and on manual dispatch".
- ✅ Scenario: Dispatch from another branch — job condition `github.ref == 'refs/heads/main'` (H1:345); workflow test.
- ✅ Scenario: Nothing but the dump date changed — `data_refresh_guard.feature:4-9`; `cli.test.ts:152` writes only the verdict.
- ✅ Scenario: Cities changed — `cli.test.ts:161` title with the dump date; city data check and `pnpm test` steps (H1:120-130).
- ✅ Scenario: A download fails — `city-data:compile` fails the run; later steps are skipped (H1:113-115).
- ✅ Scenario: The pull request merges by itself — `gh pr merge --auto --squash` (H1:156); live in H5.
- ✅ Scenario: A check fails — auto-merge waits for required checks (GitHub); H4 makes the CI job required.
- ✅ Scenario: A newer refresh replaces an open one — force-push of the fixed branch and `gh pr edit --title` (H1:136-145).
- ✅ Scenario: Sources do not share a pull request — `data_refresh_data_only_commits.feature:46-50`, steps `:176-198`.
- ✅ Scenario: The commit of a zone rules refresh — feature `:4-8`; `refreshPullRequest.test.ts:80`.
- ✅ Scenario: The commit of a city data refresh — feature `:10-13`.
- ✅ Scenario: The commit of a CLDR update — feature `:15-19`; workflow test "keeps the dependency bot's title in the subject".
- ✅ Scenario: Data paths of each source — feature `:21-24`, steps `:111-125` assert `DATA_PATHS` and `CLDR_PACKAGE_NAMES`.
- ✅ Scenario: A data refresh branch with other changes — outline `:26-40`; `checkDataOnlyPaths.test.ts:23-36`.
- ✅ Scenario: An ordinary pull request — feature `:42-45`: `findSourceOfBranch` gives `undefined`, so the path check passes and no workflow merges it.
- ✅ Scenario: The losses the guard looks for — `refreshVerdict.test.ts:74` (one reason per broken rule) and `:103-125`.
- ✅ Scenario: The guard decides — `data_refresh_guard.feature:17-31`; `refreshVerdict.test.ts:33-47`.
- ✅ Scenario: Zone rules that lose a zone — `data_refresh_guard.feature:33-37`.
- ✅ Scenario: Zone rules that lose coordinates — `data_refresh_guard.feature:39-43`.
- ✅ Scenario: A pull request left to a human — `--add-label needs-review`, `--disable-auto` (H1:152-154); body lists reasons (`refreshPullRequest.test.ts:43,106`).
- ✅ Scenario: A later refresh passes — `--remove-label needs-review` then `--auto` (H1:155-157).
- ✅ Scenario: The first failure — `data_refresh_failure_issue.feature:4-8`; "Report the failed refresh" `gh issue create` (H1:169-181). A failure at "Compile the release" happens after install, so the issue is built.
- ✅ Scenario: A repeated failure — `gh issue list … --state open` then `gh issue comment` (H1:176-178).
- ✅ Scenario: Recovery — `data_refresh_failure_issue.feature:10-14`; "Close the issue of a failed refresh" runs on `success()`, also for "already current" (H1:483-493).
- ✅ Scenario: A new CLDR release — `dependabot.yml` group `cldr`; `cldr-update.yml` auto-merge with the trailer.
- ✅ Scenario: A CLDR update that breaks a check — `report-checks` job (H1:250-318) labels `needs-review` and opens/comments the CLDR issue.
- ✅ Scenario: Another dependency — `startsWith(github.head_ref, 'dependabot/npm_and_yarn/cldr')` on the auto-merge job (H1:225), tied to `CLDR_BRANCH_PREFIX` by the workflow test.
- ✅ Scenario: A daily run renews the schedules — "Keep the scheduled workflows enabled" (H1:388-395).
- ✅ Scenario: Renewing fails — `continue-on-error: true` and "Fail the run when renewing the schedules failed" (H1:448-453); workflow test.
- ✅ Scenario: The switch is off — "Report the data refresh switch" and the switch condition on every later step.
- ✅ Scenario: The switch is turned on — the switch is the repository variable `DATA_REFRESH_ENABLED` (H6), no file change.
- ✅ Scenario: A data refresh workflow runs — token permissions and secrets assertions in the workflow test (`describe("secrets")`).
- ✅ Scenario: Deterministic output — unchanged compiler and its existing tests under `src/test/cityData/`.
- ✅ Scenario: The file records its source — unchanged compiler; `source.dumpDate` named in `city-data/README.md:15`.
- ✅ Scenario: A failed download — unchanged compiler behaviour; the refresh run fails at "Compile the city data".
- ✅ Scenario: The build is offline — unchanged build; no GeoNames access added outside `city-data-refresh.yml`.
- ✅ Scenario: Pull request checks are offline — the CI step added by H1 runs only `data-refresh:check-paths` (git only).
- ✅ Scenario: Only the dump date differs — `data_refresh_guard.feature:11-15`; `compareCityData.test.ts:37`.

## Mutation

Measured with `npx stryker run --mutate …` in `packages/client`, two runs, one at a time:

- Run 1: `compareCityData.ts` 100.00%, `compareZoneRules.ts` 100.00%, `refreshVerdict.ts` 100.00%, `refreshPullRequest.ts` 100.00%, `checkDataOnlyPaths.ts` 98.15% (1 survivor: `source !== REFRESH_SOURCES.CLDR` → `false` at `checkDataOnlyPaths.ts:72`, not observable for real inputs because a non-CLDR manifest change is already an offender). Run total 99.32%.
- Run 2: `cli.ts` 100.00%, `cliCommands.ts` 100.00%, `cliInputs.ts` 100.00%, `refreshFailureIssue.ts` 100.00%, `refreshConstants.ts` 87.50% (1 survivor: `REFRESH_FAILURE_LABEL = ""` at `refreshConstants.ts:51`). Run total 99.01%.

`refreshConstants.ts` is below 90% — R2.

## Findings

### R1 — WARNING — A refresh that fails during setup opens no failure issue
- Location: `temporary-docs/gnomish/github-oinsio-time-zones-137/handoff/H1-data-refresh-workflows.patch:160` (city data refresh, `city-data-refresh.yml` step "Describe the failed refresh") and `:455` (same step of `zone-rules-publication.yml`)
- Rule: FR8 of `proposal.md` ("A failed data refresh run SHALL open one issue for its source, or add to the open one, naming the failed step and linking the run"); UX1
- Problem: the issue title and body come from `pnpm --filter @time-zones/client data-refresh:issue …`, which needs the checkout, `pnpm/action-setup`, `setup-node` and `pnpm install`. Those steps run after "Create the data refresh bot token" (H1:82, H1:360) and carry `if: vars.DATA_REFRESH_ENABLED == 'true'`, which implies `success()`. When the token step fails (missing or rotated `DATA_REFRESH_APP_*` secrets, an uninstalled App), or the checkout or install fails, every setup step is skipped; "Describe the failed refresh" then fails because there is no repository and no pnpm, `steps.issue.outputs.title` is empty, and "Report the failed refresh" runs `gh issue list --search '"" in:title'` (which may match the open issue of another source and comment there) or `gh issue create --title ""` (rejected).
- Impact: the most likely live failure of this change — a credential problem of the data refresh bot (H3) — produces no "Data refresh failed: …" issue; the maintainer learns of it only if GitHub's run-failure mail reaches them, which UX1 says the design must not rely on (design D8: "the issue does not depend on that"). A city data failure can also be appended to the zone rules issue.
- Fix: keep design D8's single job with its last `if: failure()` / `if: success()` steps, and only reorder the setup so those steps can run. In both workflows (H1:82-103 and H1:360-385): (1) give `actions/checkout@v5` `persist-credentials: false` and no `token:` (it then clones with the job's `github.token`, which has `contents: read`), and move it, `pnpm/action-setup`, `actions/setup-node` and `pnpm install --frozen-lockfile` ahead of "Create the data refresh bot token"; (2) move "Create the data refresh bot token" to sit directly before "Open or update the data refresh pull request", without the verdict condition, so a broken App is still caught on an "already current" run. This also lets "Keep the scheduled workflows enabled" (FR10) run when the App token fails; (3) in "Open or update the data refresh pull request", before `git push --force origin "$BRANCH"`, add `git remote set-url origin "https://x-access-token:${GH_TOKEN}@github.com/${GH_REPO}.git"` so the App token still pushes the branch (design D2: a push by `GITHUB_TOKEN` starts no further workflow); (4) in "Report the failed refresh", exit with an error when `ISSUE_TITLE` is empty instead of searching for `""`. In the existing workflow test `packages/client/src/test/dataRefresh/dataRefreshWorkflows.test.ts`, which runs for both entries of `REFRESH_WORKFLOWS`, assert that the checkout step carries `persist-credentials: false` and comes before the token step, and that the pull request step sets the remote URL from `GH_TOKEN`. design.md needs no change: D8's failure and recovery steps stay the last steps of the one job, and D2's App token still pushes the branch and opens the pull request.
- Fix risk: the existing H1 assertions still hold. Every moved step keeps `vars.DATA_REFRESH_ENABLED == 'true'` ("conditions every step but the report on the switch"). The push line stays `git push --force origin "$BRANCH"` ("never pushes to main"). The token step keeps its two permissions ("asks the bot token for contents and pull requests only"). The new URL reads `steps.app-token.outputs.token` through `GH_TOKEN`, not `secrets.*` ("prints no secret"). The App token stays in `.git/config` of the ephemeral runner for the rest of the job, and GitHub masks it in logs. Compile and tests now run before a broken App token is found, which costs the minutes of one run, within NFR-P1's 20-minute bound. A failure of the checkout or `pnpm install` itself (for example a registry outage) still opens no issue, as today: the fix closes the credential case, not that one.
- Status: fixed
- Resolution: in both workflows of the H1 patch the checkout (`persist-credentials: false`), pnpm, node and install now come before the bot token step, which sits directly before the pull request step; that step sets the remote URL from `GH_TOKEN`, and "Report the failed refresh" exits when `ISSUE_TITLE` is empty. Covered by dataRefreshWorkflows.test.ts "sets up the checkout before the bot token…", "pushes the refresh branch with the bot token", "refuses to report a failed refresh it could not describe".

### R2 — WARNING — `refreshConstants.ts` mutation score 87.5%: `REFRESH_FAILURE_LABEL` has no reader
- Location: `packages/client/scripts/dataRefresh/refreshConstants.ts:51`
- Rule: `CLAUDE.md` "Mutation testing … target >=95%, minimum acceptable >=90%"; M5 of `proposal.md`
- Problem: `REFRESH_FAILURE_LABEL = "data-refresh-failure"` is exported but no script or test reads it (`grep -rn REFRESH_FAILURE_LABEL packages/client` finds only the declaration); the workflows hard-code `data-refresh-failure`. Stryker's mutant `REFRESH_FAILURE_LABEL = ""` survives, putting the file at 87.50%, below the 90% minimum.
- Impact: M5 ("Mutation score ≥ 95% (minimum acceptable 90%) on the new production files of `scripts/dataRefresh/`") is not met for this file, and the constant can change without any test noticing although H4 creates the label by that name and the workflows search issues by it.
- Fix: add to `packages/client/src/test/dataRefresh/refreshFailureIssue.test.ts` a test that `REFRESH_FAILURE_LABEL` is `"data-refresh-failure"` (the label H4 creates and the failure issue steps search by), in the style of the existing `DATA_PATHS` assertion in `data_refresh_data_only_commits.steps.ts:117-122`; together with R3 the workflow test also ties the workflows' `--label` values to it.
- Fix risk: none — a test-only addition; re-run `npx stryker run --mutate 'scripts/dataRefresh/refreshConstants.ts'` to confirm 100%.
- Status: fixed
- Resolution: refreshFailureIssue.test.ts now has "REFRESH_FAILURE_LABEL is the label the failure issue steps create and search by"; Stryker on refreshConstants.ts now scores 100%.

### R3 — WARNING — Refresh branch names and labels in the workflows are not tied to their constants
- Location: `temporary-docs/gnomish/github-oinsio-time-zones-137/handoff/H1-data-refresh-workflows.patch:134` (`BRANCH: data-refresh/city-data`), `:423` (`BRANCH: data-refresh/zone-rules`), `:153`, `:442`, `:300` (`--add-label needs-review`), `:176-180`, `:471-475` (`--label data-refresh-failure`)
- Rule: `.claude/rules/code-style.md` ("Is any value repeated in 2+ places? → Must be a constant"); FR6
- Problem: the workflows repeat the values of `REFRESH_BRANCHES`, `NEEDS_REVIEW_LABEL` and `REFRESH_FAILURE_LABEL` (`refreshConstants.ts:42-51`) as literals. YAML cannot import them, and the H1 workflow test ties only `CLDR_BRANCH_PREFIX` (H1 test import at patch line 510, assertion at :653); nothing checks that `BRANCH:` equals `REFRESH_BRANCHES[…]` or that the labels equal the constants.
- Impact: if a branch name changes in one place only, `data-refresh:check-paths auto` (`cliCommands.ts:118-133`) no longer recognises the refresh branch, logs "is not a data refresh branch" and exits 0 — the FR6 data-only gate disappears silently while the workflow keeps enabling auto-merge with the `Data-Only: true` trailer; a renamed label makes the failure-issue search miss the open issue and open duplicates. No test fails in either case.
- Fix: in `src/test/dataRefresh/dataRefreshWorkflows.test.ts` inside the H1 patch, import `REFRESH_BRANCHES`, `REFRESH_SOURCES`, `NEEDS_REVIEW_LABEL` and `REFRESH_FAILURE_LABEL` from `scripts/dataRefresh/refreshConstants.ts` and assert that the pull request step of each workflow contains `BRANCH: ${REFRESH_BRANCHES[source]}`, and that every `--add-label`/`--remove-label` value is `NEEDS_REVIEW_LABEL` and every issue `--label` value is `REFRESH_FAILURE_LABEL`, as the test already does for `CLDR_BRANCH_PREFIX`.
- Fix risk: none — test-only, inside the handoff patch the human applies; the patch must still pass `git apply --check`.
- Status: fixed
- Resolution: dataRefreshWorkflows.test.ts (H1 patch) asserts `BRANCH:` equals `REFRESH_BRANCHES[source]` and every `--add-label`/`--remove-label` and `--label` value equals `NEEDS_REVIEW_LABEL` / `REFRESH_FAILURE_LABEL` ("names its branch and labels as the constants do"). The patch still passes `git apply --check`.

### R4 — WARNING — `cli.test.ts` is 300 lines (and the H1 workflow test 246)
- Location: `packages/client/src/test/dataRefresh/cli.test.ts:1` (300 lines); `temporary-docs/gnomish/github-oinsio-time-zones-137/handoff/H1-data-refresh-workflows.patch:494` (`dataRefreshWorkflows.test.ts`, 246 lines)
- Rule: `CLAUDE.md` "Files must stay under 200 lines for AI context quality"; `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity"); `tasks.md` preamble "Keep every file under 200 lines"
- Problem: `cli.test.ts` sits at the hard cap although it splits naturally by command (`describe` blocks "verdict zone-rules", "verdict city-data", "check-paths", "issue", "usage" at lines 61, 151, 174, 259, 289); the workflow test of H1 likewise splits by workflow file.
- Impact: breaks the explicit file-size limit of the project and of this change's tasks; the next edit to either file pushes it over the hard cap.
- Fix: move `createHarness` and the shared fixtures of `cli.test.ts:6-60` into `src/test/dataRefresh/cliHarness.ts` (not collected by Vitest, which takes only `*.test.ts`/`*.steps.ts`), and split the tests into `cliVerdict.test.ts`, `cliCheckPaths.test.ts` and `cliIssue.test.ts` (with "usage"), each keeping the `// Verifies … of refresh-data-through-scheduled-pull-requests.` comment; in the H1 patch split `dataRefreshWorkflows.test.ts` into a refresh-workflows file and a CLDR/Dependabot/CI file.
- Fix risk: Stryker's mutation score of `cli.ts`/`cliCommands.ts` must be re-measured after the split (same tests, so it should stay 100%); the H1 patch's README and task 6.1 name `dataRefreshWorkflows.test.ts`, so the patch README must name the new files.
- Status: fixed
- Resolution: cli.test.ts is split into cliVerdict.test.ts, cliCheckPaths.test.ts and cliIssue.test.ts over a shared cliHarness.ts (all under 200 lines); the H1 workflow test is split into dataRefreshWorkflows.test.ts, dataRefreshOtherWorkflows.test.ts and workflowFiles.ts, and the patch README names the new files.

## Verdict

Not ready. No CRITICAL finding; the WARNINGs R1 (FR8 not met when the run fails during setup), R2 (M5 below the 90% minimum on `refreshConstants.ts`), R3 (FR6 gate can disappear silently on a rename) and R4 (file-size rule) should be fixed before the change is archived. R1 and R3 live in the H1 handoff patch, R2 and R4 in the client tests.
