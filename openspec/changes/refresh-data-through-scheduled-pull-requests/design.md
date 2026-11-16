# Design: Refresh data through scheduled pull requests

## Context

See `proposal.md` — Why. Facts found in the repository on 2026-11-16:

- `main` deploys on every push (`.github/workflows/deploy.yml`, `on: push: branches: [main]`), and accepts changes only through pull requests.
- The zone rules publication exists as scripts only (`scripts/zoneRules/latestRelease.ts`, `compile.ts`, `check.ts`; `package.json` scripts `zone-rules:latest|compile|check`). `.github/workflows/` holds `ci.yml`, `cla.yml` and `deploy.yml`; no `zone-rules-publication.yml` exists, although the glossary entry **Zone rules publication** names it as its *Code:*. The workflow of `add-remote-zone-rules-updates` (a commit and push to `main`) was never merged, and its draft is not in this working copy, so H1 writes the workflows from this design.
- `ci.yml` already runs "Check city data" (`city-data:check`) and "Check zone rules" (`zone-rules:check`) in its job "Lint, test, build, E2E", together with lint, typecheck, `pnpm test`, the build, `check:bundle-size` and the smoke E2E (`test:bdd`, which holds the axe-core and screenshot scenarios). Tests of the CI workflow read it through `src/test/ciWorkflow.ts` (`readCiJobBlocks`).
- `city-data:compile` writes only `city-data/geonames-cities.json`, which records `source.dumpDate` (`2026-11-15`, 6 102 cities, 271 zones); `city-data/README.md` repeats the dump date by hand under "Source and licence" and has a section "Refresh".
- `zone-rules:compile` writes `zone-rules/release.json` and `zone-rules/zone-coordinates.json` (`add-city-coordinates-to-locations`, archived).
- Tests of scripts live under `src/test/<area>/` (`src/test/cityData/`), because Vitest collects only `src/**/*.{test,steps}.{ts,tsx}`; `tsconfig.node.json` includes `scripts`.
- There is no `.github/dependabot.yml`; the CLDR packages are `cldr-bcp47` and `cldr-dates-full` `^48.2.0` in `packages/client/package.json`.
- The repository is public. Its merge settings and the protection rules of `main` could not be read (the API call needs authentication), so they are a handoff item.
- Constraint of the factory (`.gnomish/stages/specify/handoff.md`): the implement stage writes only under `packages/` and `docs/` other than `docs/adr/` and never edits `.github/` or `CLAUDE.md`; those are handoff patches, which the human applies on the pull request branch before it merges.
- ADR-0014 point 5 (Accepted) says the workflow "commits it and deploys". This change refines that point; the refinement is recorded by the new ADR and a status note on ADR-0014 (H2), which land in the same pull request.

Driven by FR1–FR11, NFR-P1, NFR-P2, NFR-S1 from proposal.

## Goals / Non-Goals

**Goals:**
- Every decision of the refresh that can be wrong lives in a tested script under `packages/client/scripts/dataRefresh/`; the workflows only call scripts and the `gh` CLI.
- One pull request path for the three sources.

**Non-Goals:**
- Testing GitHub itself: that auto-merge, the trailer and the deploy behave as designed is verified once, live, by the human who applies the workflows (Human follow-up, H5).
- Changing the compilers or the checks, apart from what `add-city-coordinates-to-locations` does.

## Decision

### D1. A pull request that merges by itself replaces the push (FR1, FR3, FR4)

The workflow commits the compiled files on the branch of its source, force-pushes it and opens or edits the pull request with `gh`. `gh pr merge --auto --squash` hands the merge to GitHub, which performs it when the required checks pass. The merge is a push to `main` made in the name of the data refresh bot, so `deploy.yml` starts by its ordinary `push` trigger.

No `ref` input is added to `ci.yml` or `deploy.yml` and no deploy job is called from the refresh workflow: the merge itself starts the deploy.

Alternatives: allow the workflow to bypass the protection of `main` (rejected: unreviewed machine output on `main` with no pull request checks, and it keeps the trigger problem); a merge queue (rejected: more settings for at most two pull requests a month).

### D2. The data refresh bot is a GitHub App (FR3, FR4, NFR-S1)

GitHub's documentation says that a pull request created with `GITHUB_TOKEN` gets its runs in an approval-required state, and that events caused by `GITHUB_TOKEN` start no further workflow; it recommends an App installation token or a personal access token. The workflows therefore mint a short-lived token with `actions/create-github-app-token` from two secrets, `DATA_REFRESH_APP_ID` and `DATA_REFRESH_APP_PRIVATE_KEY`, for an App installed on this repository only, with the repository permissions Contents: write and Pull requests: write. Issues (D8) and enabling workflows (D9) use `GITHUB_TOKEN` with `issues: write` and `actions: write`, since they need to trigger nothing (NFR-S1).

Alternative: a fine-grained personal access token of the owner (works; rejected as the default because it expires, is tied to a person and makes the owner the author of every refresh; it stays the fallback of Q1 — only the token step differs).

### D3. Branches and titles (FR3, FR5, UX2)

| Source | Branch | Title |
|---|---|---|
| zone rules | `data-refresh/zone-rules` | `Update zone rules to <release>` |
| city data | `data-refresh/city-data` | `Refresh city data to the dump of <date>` |
| CLDR | the dependency bot's branch of the group `cldr` | the bot's title |

A fixed branch per source gives "at most one open pull request" for free: the workflow force-pushes the branch and runs `gh pr edit` when `gh pr list --head <branch> --state open` finds one, `gh pr create` otherwise.

### D4. The trailer (FR5)

`gh pr merge --auto --squash --subject "<title> (#<number>)" --body "<text>\n\nData-Only: true"` sets the squash commit's headline and body when auto-merge is enabled (GraphQL `enablePullRequestAutoMerge` takes `commitHeadline` and `commitBody`). As a second line of defence the pull request's own text ends with the same trailer, so the repository setting "default squash message: pull request title and description" (H4) yields the trailer even if a human presses the merge button. The search found no documented example of `--auto` with `--body`; H5 verifies it on the first live refresh.

Alternative: put the trailer in the branch commit and merge with a merge commit (rejected: `main` uses squash merges, and the trailer must be on the commit of `main`).

### D5. Scripts, one owner per decision

New directory `packages/client/scripts/dataRefresh/` (Node type stripping: no `enum`, constants as `as const` objects), tests under `packages/client/src/test/dataRefresh/`:

- `refreshConstants.ts` — trailer, branch names, label, thresholds (`MAX_REMOVED_CITY_SHARE = 0.01`, `LARGE_CITY_POPULATION = 1_000_000`), data paths per source.
- `compareCityData.ts` — `compareCityData(committed, refreshed)` → `{ isSameData, removedCities, removedShare, removedLargeCities, removedZones }`; `isSameData` ignores `source.dumpDate` only (FR2). Reuses `CityDataset` of `scripts/cityData/cityDataTypes.ts`.
- `compareZoneRules.ts` — `compareZoneRules(committed, refreshed)` → `{ removedZoneIds, zonesWithoutCoordinates }` over the release documents and the zone coordinates files; a side without a zone coordinates file gives an empty second list.
- `refreshVerdict.ts` — `decideCityDataRefresh` / `decideZoneRulesRefresh` → `{ verdict: "UNCHANGED" | "MERGE" | "NEEDS_REVIEW", reasons: string[] }` (FR7).
- `refreshPullRequest.ts` — `buildRefreshPullRequest(source, name, verdict)` → `{ branch, title, body, mergeSubject(number), mergeBody }` (FR3, FR5).
- `checkDataOnlyPaths.ts` — `findPathsOutsideData(source, changedPaths, manifestDiff?)` → the offending paths; for CLDR the manifest diff may change only the two version entries (FR6).
- `refreshFailureIssue.ts` — `buildRefreshFailureIssue(source, failedStep, runUrl)` → `{ title, body }` and `buildRefreshRecoveryComment(runUrl)` (FR8): one fixed title per source ("Data refresh failed: zone rules", "… city data", "… CLDR"); the body names the failed step (for CLDR, the failed check) and links the run or the pull request.
- `cli.ts` — `data-refresh:verdict <zone-rules|city-data>` (reads the committed files from `git show HEAD:<path>`, the refreshed ones from disk, prints the verdict and writes `verdict`, `title`, `body-file`, `merge-body-file` to `$GITHUB_OUTPUT`), `data-refresh:check-paths <source|auto> <base> <head>` and `data-refresh:issue <source> <step> <url>` (writes `title` and `body-file` to `$GITHUB_OUTPUT`). Three `package.json` scripts.

The city data check and the zone rules check stay the owners of validity; the guard only compares two valid files. No glossary owner is duplicated: there is no existing comparison of two datasets.

### D6. Thresholds of the refresh guard (FR7)

The committed city data holds 6 102 cities (dump of 2026-11-15); `city-data:check` already fails below 6 000. A month's honest churn is the handful of cities that cross 100 000 inhabitants or are merged. 1% (61 cities) is far above that and far below what a truncated or mis-parsed dump removes, and unlike the absolute floor it also works when the data grows. A lost city of a million inhabitants is checked separately because one such loss affects many users and usually means a renamed or re-coded record that deserves a `NAME_OVERRIDES` or `ZONE_OVERRIDES` entry. A zone that the city data stops using means every city of that zone moved or vanished. IANA never deletes an identifier (it becomes a link in `backward`), so a zone identifier missing from a compiled release is a compiler defect, not news.

### D7. Workflow shape (FR1, FR2, FR8, FR10, NFR-P1)

`zone-rules-publication.yml` (cron `17 4 * * *`): checkout, install, renew schedules (D9, `continue-on-error`, re-raised at the end), `zone-rules:latest`; only for a name: `zone-rules:compile`, `zone-rules:check`, `pnpm test`, `data-refresh:verdict zone-rules`, open or update the pull request (D1–D4), label or enable auto-merge by the verdict. `city-data-refresh.yml` (cron `43 5 2 * *`, the 2nd of each month): install `unzip`, `city-data:compile`, `data-refresh:verdict city-data` (stops on `UNCHANGED`), `city-data:check`, `pnpm test`, pull request. Both: `workflow_dispatch`, `if: github.ref == 'refs/heads/main'` on the job, the switch of D11, `timeout-minutes: 20`, `concurrency` per source without cancelling, top-level `permissions: contents: read`. The full suite (build, budgets, E2E, axe-core, screenshots) is not repeated in the refresh run: it runs as the checks of the pull request (NFR-P2, NFR-A1, NFR-R1). The minutes are off the hour because GitHub delays schedules at `:00`.

`ci.yml` gains one step, "Check data-only paths" (`data-refresh:check-paths auto origin/main HEAD` after fetching `main`), which passes at once for a branch that is neither a data refresh branch nor the dependency bot's CLDR group; "Check zone rules" and "Check city data" are already there. The H1 patch also adds `src/test/dataRefresh/dataRefreshWorkflows.test.ts`, which reads the workflows and `dependabot.yml` (through `src/test/ciWorkflow.ts` for `ci.yml`) and asserts the schedules, `timeout-minutes: 20`, the job condition, the permissions, the absence of any push to `main`, `gh workflow enable`, the Dependabot allow list and the new CI step; it lives in the patch because it reads files only the human writes.

### D8. Failure issue (FR8)

A last step with `if: failure()` takes the title and body from `data-refresh:issue` (D5), runs `gh issue list --label data-refresh-failure --search "<title>"`, then `gh issue create` or `gh issue comment`; a last step with `if: success()` closes an open one with the recovery comment. One fixed title per source: "Data refresh failed: zone rules", "Data refresh failed: city data". GitHub also mails a failed scheduled run to one account (per its notification settings); the issue does not depend on that.

### D9. Keeping the schedules (FR10)

GitHub disables scheduled workflows of a public repository after 60 days without repository activity (confirmed in its documentation; ADR-0014 already lists it as a consequence). Merged refresh pull requests are activity, but IANA can be quiet for months and a city data refresh can be "already current". The daily run therefore calls `gh workflow enable` for both workflows. Whether enabling an enabled workflow restarts the 60 days is not documented; the keepalive actions in common use rely on this API. If it proves false, the fallback is a keepalive commit on a side branch, decided then; the operator notes say where the "disabled" banner appears and how to re-enable.

### D10. CLDR through Dependabot (FR9)

`.github/dependabot.yml`: ecosystem `npm`, directory `/`, schedule monthly, `allow` only `cldr-bcp47` and `cldr-dates-full`, one group `cldr`. Dependabot then proposes nothing else, which satisfies NG5 without a second rule. `cldr-update.yml` runs on `pull_request` for the actor `dependabot[bot]`: mints the App token (the two secrets must also exist as Dependabot secrets), and runs `gh pr merge --auto --squash` with the trailer. The path check of D7 is the gate. A CLDR release that renames a zone city can fail `city-data:check` or a screenshot; the pull request then waits for a human.

A CLDR pull request merges only through auto-merge, so GitHub merges it only after every required check passed. When a check fails, a second small workflow labels the pull request `needs-review` and reports the failed check in the CLDR issue (FR8); nothing is merged, so the deployed app is unchanged.

### D11. Switching on (FR11)

The refreshes must not run before `apply-data-updates-silently` is deployed, or users would get a "new version" notice for every refresh. The handoff patches are applied on the pull request branch before it merges, so the workflows reach `main` with this change. The switch is the repository variable `DATA_REFRESH_ENABLED`. Each refresh job starts with a step that, when the variable is not `true`, writes "data refresh is off" to the log and the run summary; every later step, and the auto-merge step of `cldr-update.yml`, carries the condition `vars.DATA_REFRESH_ENABLED == 'true'`. The maintainer sets the variable once `apply-data-updates-silently` is live (H6). The variable is a repository setting, not a file, so the switch needs no commit.

Alternative: keep the workflows out of the pull request and apply them later (rejected: the factory's handoff patches land with the change, and a workflow file waiting outside `main` is easy to forget).

## Consequences

Positive:

- `main` keeps one rule: everything arrives through a pull request with the full checks, machine output included.
- The three data sources share one path, one trailer and one guard; a fourth source would add a workflow and a branch name.
- The maintainer is needed only for a labelled pull request or an open issue.
- The deploy needs no special case: a merged refresh is an ordinary push to `main`.

Negative (risks and their mitigations):


- [The protection of `main` requires an approving review] → the bot's pull request would never merge. H4 checks it and, if so, lets the App bypass the review requirement only.
- [`gh pr merge --auto --body` does not set the squash body] → the pull request text carries the trailer and H4 sets the squash default to title and description; H5 verifies the first commit.
- [A data refresh changes an approved screenshot or an E2E expectation] → the pull request stays open (NG6); GitHub notifies about the failed check, no issue is opened because the run itself succeeded. Accepted: rare, and visible in the open pull request list.
- [Zone rules and city data refresh in the same hour] → separate branches and files; the second merge needs an up-to-date branch only if the protection demands it, in which case the next run re-pushes it.
- [The App's private key leaks] → it can write contents and pull requests of one repository, cannot bypass checks; rotate the key in the App settings.
- [`gh workflow enable` does not reset the idle timer] → schedules stop silently; D9 fallback, and the settings page shows a stale zone rules release.

## Alternatives Considered

**Push to `main` with a protection bypass**: the shape of `add-remote-zone-rules-updates`; rejected in D1.
**`GITHUB_TOKEN` for the pull request**: no secrets to manage; rejected in D2 because its pull request checks wait for approval and its merge starts no deploy.
**A personal access token**: rejected as the default in D2, kept as the fallback of Q1.
**Weekly instead of daily IANA check**: a current run costs one request, and a late release is seven times later; the user chose daily.
**Monthly city data pull request even when only the dump date changed**: keeps the repository active but deploys nothing new; rejected in favour of D9.
**Renovate instead of Dependabot**: no bot is configured today, Dependabot needs no installation; D10.

## Migration Plan

1. On this change's pull request branch, the human applies H1 (workflows, CI step, Dependabot, workflow test) and H2 (ADR); the change merges with `DATA_REFRESH_ENABLED` unset, so nothing runs.
2. Human: create and install the App, add the secrets, set the repository settings (H3, H4).
3. After `apply-data-updates-silently` is deployed, set `DATA_REFRESH_ENABLED` to `true` (H6).
4. Dispatch both workflows by hand once and verify H5.

Rollback: set `DATA_REFRESH_ENABLED` to `false`; nothing on the device depends on the workflows.

## Open Questions

None. The new ADR takes the number after the highest in `docs/adr/` when H2 is written (0017 on 2026-11-16).
