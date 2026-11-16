# Specs review: refresh-data-through-scheduled-pull-requests

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 34/35 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 0 |

## Freshness

- ✅ `main` deploys on every push (design.md:7) — `.github/workflows/deploy.yml:5-7` `on: push: branches: [main]`.
- ✅ `.github/workflows/` holds only `ci.yml`, `cla.yml`, `deploy.yml`; no `zone-rules-publication.yml` (design.md:8) — `ls .github/workflows`.
- ✅ The glossary names `.github/workflows/zone-rules-publication.yml` as the *Code:* of **Zone rules publication**, and describes it as "commits it and deploys it" (design.md:8, proposal.md:19) — `docs/glossary/zone-rules.md:17`.
- ✅ Scripts `scripts/zoneRules/latestRelease.ts`, `compile.ts`, `check.ts` and the `package.json` scripts `zone-rules:latest|compile|check` exist (design.md:8) — `packages/client/package.json:13-17`.
- ✅ `latestRelease.ts` writes `$GITHUB_OUTPUT` through injected dependencies (tasks.md:22) — `scripts/zoneRules/latestRelease.ts:6,55,97`.
- ✅ `ci.yml` job "Lint, test, build, E2E" runs lint, typecheck, "Check city data", `pnpm test`, build, `check:bundle-size`, "Check zone rules" and the smoke E2E `test:bdd` (design.md:9) — `.github/workflows/ci.yml:21-72`.
- ✅ `src/test/ciWorkflow.ts` exports `readCiJobBlocks` (design.md:9) — `packages/client/src/test/ciWorkflow.ts:37`.
- ✅ `city-data:compile` writes only `city-data/geonames-cities.json`; the file records `source.dumpDate` `2026-11-15`, 6 102 cities and 271 zones (design.md:10, D6) — `scripts/cityData/compile.ts:83`; the committed file read with `node`.
- ✅ `city-data/README.md` repeats the dump date by hand under "Source and licence" and has a section "Refresh" (design.md:10, tasks.md:8) — `packages/client/city-data/README.md:8,15,39`.
- ✅ `zone-rules:compile` writes the release file and `ZONE_COORDINATES_FILE` (design.md:11) — `scripts/zoneRules/compile.ts:83-85`; `zone-rules/release.json` and `zone-rules/zone-coordinates.json` are committed.
- ✅ `zone-rules/README.md` has a section "Publication of a newer release" (tasks.md:8) — `packages/client/zone-rules/README.md:69`.
- ✅ Vitest collects only `src/**/*.{test,steps}.{ts,tsx}` and script tests live under `src/test/cityData/`; `tsconfig.node.json` includes `scripts` (design.md:12) — `packages/client/vitest.config.ts:21`, `tsconfig.node.json:34`.
- ✅ No `.github/dependabot.yml`; `cldr-bcp47` and `cldr-dates-full` are `^48.2.0` in `packages/client/package.json` (design.md:13) — `.github/` holds only `workflows/`; `package.json:67-68`.
- ✅ CLDR data is extracted at build time, not committed, so a CLDR update changes only the manifest and the lockfile (FR9 data paths) — only `scripts/zoneData/loadZoneData.ts` reads the CLDR packages; no committed CLDR output.
- ✅ `CityDataset` is exported from `scripts/cityData/cityDataTypes.ts` (design.md D5, tasks.md:13) — `cityDataTypes.ts:26`.
- ✅ The package is `@time-zones/client` and scripts run as `node scripts/….ts` under type stripping (tasks.md:3, 12) — `package.json:2,13-17`.
- ✅ `zone_rules_updates_publication.feature` and its steps hold "it stops reporting {string} and commits nothing" and "{string} is the release to compile, check, commit and deploy" (tasks.md:29) — feature lines 14, 25; `steps/zone_rules_updates_publication.steps.ts:74,97`.
- ✅ The MODIFIED `app-delivery` "Zone rules publication" and `city-data` "Compiled once, committed, no network at build time" exist in the stable specs as restated before modification — `openspec/specs/app-delivery/spec.md:193`, `openspec/specs/city-data/spec.md:77`.
- ✅ `add-remote-zone-rules-updates` and `add-city-coordinates-to-locations` are archived; `apply-data-updates-silently` is active and reads the `Data-Only` trailer (proposal.md:5) — `openspec/changes/archive/2026/11/`, `openspec/changes/apply-data-updates-silently/design.md:32`.
- ✅ Nothing of this change is implemented yet — no `scripts/dataRefresh/`, no `data-refresh:*` script, no workflow.
- ✅ A zone rules refresh does not change an approved screenshot by itself: the screenshot step hides the zone rules release line — `src/test/features/locations/steps/locations_layout_e2e.steps.ts:71-76`.
- ✅ The new ADR number 0017 is free (design.md:146) — highest in `docs/adr/` is 0016.
- ✅ `docs/glossary/architecture.md` (20 lines) and `zone-rules.md` (21 lines) have room for the new terms (tasks.md:7).

## Coverage

| id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ app-delivery "Zone rules publication" | ✅ 4.4, 6.1 |
| FR2 | ✅ | ✅ "City data refresh"; city-data "Only the dump date differs" | ✅ 2.2, 4.1, 6.1 |
| FR3 | ✅ | ✅ "Data refresh pull requests" | ✅ 3.1, 4.2, 6.1 |
| FR4 | ✅ | ✅ "Data refresh pull requests" | ✅ 6.1 (workflow test), H5 |
| FR5 | ✅ | ✅ "Data-only commits" | ✅ 3.1, 4.2 |
| FR6 | ✅ | ✅ "Data-only commits" | ✅ 3.2, 3.4, 4.2 |
| FR7 | ✅ | ✅ "Refresh guard" | ✅ 2.3, 2.4, 4.1 |
| FR8 | ✅ | ✅ "Failed refresh is reported" | ✅ 3.3, 4.3, 6.1 |
| FR9 | ✅ | ✅ "CLDR updates" | ✅ 6.1 |
| FR10 | ✅ | ✅ "Schedules stay enabled", "Zone rules publication" | ✅ 1.2, 6.1 |
| FR11 | ✅ | ✅ "Data refresh switch" | ✅ 6.1, H6 |
| NFR-P1 | ✅ | ✅ "Zone rules publication" (one request, 2 minutes) | ✅ 6.1 (`timeout-minutes: 20`), H5 |
| NFR-P2 | ✅ | ✅ via "every required check" of "Data refresh pull requests" | ✅ 5.2 `check:bundle-size` |
| NFR-A1 | ✅ | ✅ via "every required check" of "Data refresh pull requests" | ✅ existing smoke E2E, H4 makes it required |
| NFR-R1 | ✅ | ✅ "A check fails" of "Data refresh pull requests" | ✅ existing screenshot E2E, H4 |
| NFR-S1 | ✅ | ❌ no requirement or scenario on the bot's permissions or secrets (see R4) | ✅ 6.1 (workflow test), H3 |
| UX1 | ✅ | ✅ "Refresh guard", "Failed refresh is reported" | ✅ 3.3, 4.3 |
| UX2 | ✅ | ✅ "Data-only commits" | ✅ 3.1, 4.2 |
| G1 | ✅ | n/a — met by FR1, FR4, M1 | n/a — met by FR1, FR4, M1 |
| G2 | ✅ | n/a — met by FR2, FR7 | n/a — met by FR2, FR7 |
| G3 | ✅ | ✅ "Data refresh pull requests" | ✅ 6.1 (no push to `main` asserted) |
| G4 | ✅ | ✅ "Data-only commits" | ✅ 3.1, 3.2 |
| NG1 | ✅ | n/a | n/a — nothing builds the app's handling of a data-only deploy |
| NG2 | ✅ | n/a | n/a — compilers untouched |
| NG3 | ✅ | n/a | n/a — schedules daily (IANA) and monthly (GeoNames) |
| NG4 | ✅ | n/a | n/a — no versions or changelog |
| NG5 | ✅ | n/a | n/a — nothing builds it on purpose; the auto-merge gate of `cldr-update.yml` is incomplete, see R1 |
| NG6 | ✅ | n/a | n/a — no screenshot refresh |
| NG7 | ✅ | n/a | n/a — no merge queue, staging or forks |
| M1 | ✅ | n/a | ✅ H5 (live check) |
| M2 | ✅ | n/a | ✅ 3.2 path check, H5 `git log` |
| M3 | ✅ | n/a | ✅ 2.4, 4.1 |
| M4 | ✅ | n/a | ✅ H5 |
| M5 | ✅ | n/a | ✅ 5.1 |
| M6 | ✅ | n/a | ✅ 5.2 |

Q1 and Q2 are not defined as requirement lines; proposal.md:144 records both as decided by the owner (GitHub App; CLDR merges after every required check), answered in design.md D2 and D10.

## Consistency

- FR5 (`proposal.md:74`) requires the commit of every data refresh pull request to have "a subject naming the source and the release or the dump date", and FR9 (`proposal.md:78`) applies FR4–FR6 to the CLDR pull request; design D3 (`design.md:52`) gives the CLDR pull request "the bot's title" and D10 (`design.md:97`) sets no subject, so the CLDR commit names no release (R3).
- ADR-0015 (`docs/adr/0015-city-data-from-geonames.md`, Decision) says "A maintainer command (`city-data:compile`) downloads the dumps, compiles one file and commits it … The build, the tests and CI never contact GeoNames"; the change runs that command from a scheduled GitHub Actions workflow and commits through a bot (`design.md:83`, `specs/city-data/spec.md:6`), but its ADR handoff only annotates ADR-0014 (`tasks.md:40`, `proposal.md:27`) (R2).

## Findings

### R1 — WARNING — The CLDR auto-merge step has no CLDR-only gate
- Location: `openspec/changes/refresh-data-through-scheduled-pull-requests/design.md:97`; `tasks.md:39`
- Rule: —
- Problem: D10 says `cldr-update.yml` "runs on `pull_request` for the actor `dependabot[bot]` … and runs `gh pr merge --auto --squash` with the trailer", and names the path check of D7 as "the gate". But D7 (`design.md:85`) makes that path check "pass at once for a branch that is neither a data refresh branch nor the dependency bot's CLDR group". So any pull request by `dependabot[bot]` that is not on the CLDR branch, such as a security update of another package raised from the repository's Dependabot settings, or an update from a future ecosystem added to `dependabot.yml`, passes the path check and would get auto-merge with `Data-Only: true`. The only guard is the `allow` list. Task 6.1's workflow test asserts that `allow` list, but not a branch condition on the auto-merge step.
- Impact: The spec scenario "Another dependency" (`specs/app-delivery/spec.md:238-240`: "automatic merging is not enabled and no trailer is added"), FR6's "A pull request made by anyone else SHALL NOT be merged with the trailer" and NG5 are guaranteed only by Dependabot configuration and not by the workflow. A non-CLDR Dependabot pull request could merge as a data-only commit, and `apply-data-updates-silently` would then deploy code changes without a notice (`apply-data-updates-silently/design.md:86`).
- Fix: In design D10, condition the auto-merge job of `cldr-update.yml` on the head branch starting with the CLDR branch prefix of `refreshConstants.ts` (`startsWith(github.head_ref, 'dependabot/npm_and_yarn/cldr')`), or on `data-refresh:check-paths` recognizing the branch as source `cldr`. In task 6.1, add to the workflow test's assertions that the auto-merge step carries that condition.
- Fix risk: If Dependabot names the grouped branch differently from the assumed prefix, the CLDR pull request would not auto-merge and would wait for a human. That is safe, and H5 would catch it on the first CLDR update. No other artifact changes.
- Status: fixed
- Resolution: design.md D10 now conditions the auto-merge job of `cldr-update.yml` on `startsWith(github.head_ref, 'dependabot/npm_and_yarn/cldr')` (the path check stays the second gate) and D7 lists that condition among the workflow test assertions; tasks.md 6.1 requires the condition and the workflow test assertion; specs/app-delivery/spec.md scenario "Another dependency" now covers any non-CLDR branch whatever the bot configuration allows.

### R2 — WARNING — ADR-0015 is refined but not annotated
- Location: `openspec/changes/refresh-data-through-scheduled-pull-requests/tasks.md:40`; `proposal.md:27`
- Rule: `.claude/rules/adr.md`
- Problem: ADR-0015 (Accepted) decides "A maintainer command (`city-data:compile`) downloads the dumps, compiles one file and commits it; `city-data:check` validates it offline in CI. The build, the tests and CI never contact GeoNames." This change runs `city-data:compile` from a scheduled GitHub Actions workflow and lands the result through a bot pull request (`design.md:83`, MODIFIED `city-data` requirement at `specs/city-data/spec.md:6`). The H2 patch adds a status note only to ADR-0014 point 5 and lists only ADR-0014 and ADR-0015 as "related" in ADR-0017.
- Impact: After the change lands, ADR-0015 still says CI never contacts GeoNames and that a maintainer commits the city data, while a workflow does both. A later change or reviewer reading ADR-0015 would treat the city data refresh workflow as a violation, or would miss that ADR-0017 refines it.
- Fix: In task 6.2 and H2 (`tasks.md:40,48`), and in proposal "What Changes" (`proposal.md:27`), add a status note under ADR-0015's status: "Refined by ADR-0017: the compile command is also run by the scheduled city data refresh, which proposes its result as a data refresh pull request; pull request checks, the build and the deploy still never contact GeoNames." Include `docs/adr/0015-city-data-from-geonames.md` in the H2 patch's files.
- Fix risk: none. The note goes in the same handoff patch, under `docs/adr/`, which the factory already treats as a handoff path.
- Status: fixed
- Resolution: tasks.md 6.2 and H2 now put a status note under ADR-0015 ("Refined by ADR-0017: the compile command is also run by the scheduled city data refresh …; pull request checks, the build and the deploy still never contact GeoNames.") into the H2 patch; proposal.md "What Changes" and design.md Context name the ADR-0015 refinement.

### R3 — WARNING — The CLDR commit subject contradicts FR5
- Location: `openspec/changes/refresh-data-through-scheduled-pull-requests/proposal.md:74`; `design.md:52`
- Rule: —
- Problem: FR5 requires the commit of every data refresh pull request to have "a subject naming the source and the release or the dump date", and FR9 says the CLDR pull request "SHALL follow FR4–FR6". The "Data-only commits" requirement (`specs/app-delivery/spec.md:129`) repeats this. Design D3 gives CLDR "the bot's title", which for a Dependabot group names the group and not the CLDR version. D10 runs `gh pr merge --auto --squash` "with the trailer" but no subject. Task 6.1 does not say what subject `cldr-update.yml` sets.
- Impact: Whoever implements `cldr-update.yml` (H1) has to choose between FR5 and D3. If they follow D3, the CLDR commit on `main` breaks FR5 and UX2 ("reads at a glance in the history of `main`").
- Fix: Pick one. Either narrow FR5 and the "Data-only commits" requirement so that "for the zone rules and the city data" the subject names the release or dump date, while the CLDR commit keeps the dependency bot's title (D3 unchanged). Or add to D10 and task 6.1 that `cldr-update.yml` passes `--subject "Update CLDR to <new version> (#<number>)"`, taking the version from the pull request's manifest diff, and have the H1 workflow test assert it. The first option is cheaper.
- Fix risk: The first option weakens UX2 for CLDR only. The second adds a version-reading step to the workflow and a test assertion. Neither touches the scripts of groups 2–4.
- Status: fixed
- Resolution: took the reviewer's first option: proposal.md FR5 and the "Data-only commits" requirement of specs/app-delivery/spec.md now require the release or dump date in the subject for the zone rules and the city data only, and the CLDR commit keeps the dependency bot's title with the pull request number (D3 unchanged); design.md D10 passes that `--subject`; new scenario "The commit of a CLDR update" is asserted by the H1 workflow test (tasks.md 6.1).

### R4 — WARNING — NFR-S1 has no delta spec requirement
- Location: `openspec/changes/refresh-data-through-scheduled-pull-requests/proposal.md:99`
- Rule: `.claude/rules/traceability.md`; `.claude/rules/delta-specs.md`
- Problem: NFR-S1 sets the bot's permissions (contents and pull requests write only), the use of the run's own token for issues and `gh workflow enable`, secrets never printed and unavailable to forks, and the IANA signature check. None of the delta spec requirements under `specs/app-delivery/spec.md` states these, and no scenario covers them. They exist only in design D2 and in the H1 workflow test (`tasks.md:35`).
- Impact: After archive, the stable `app-delivery` spec does not hold the security constraint. A later change could widen the App's permissions or move issue handling to the App token without contradicting any spec. The traceability rule's "for every FR/NFR … at least one implementing entity" holds only through a test that the factory itself cannot run.
- Fix: Add to the ADDED requirements of `specs/app-delivery/spec.md` a requirement "Data refresh credentials" (`<!-- implements NFR-S1 of refresh-data-through-scheduled-pull-requests -->`) restating NFR-S1. Give it one scenario: "WHEN a data refresh workflow runs THEN the data refresh bot's token can write only contents and pull requests, issues and workflow enabling use the run's own token, and no step prints a secret". Its verification stays the H1 workflow test, which task 6.1 already describes.
- Fix risk: none. This is spec text only, and the test that verifies it is already planned in H1.
- Status: open

## Verdict

Needs revision. No CRITICAL finding. Before implementation, fix the WARNINGs R1 (the CLDR auto-merge gate) and R3 (the CLDR commit subject), because both decide what the H1 workflows must do. R2 and R4 are documentation and spec gaps that fix-specs can close in the same pass.
