# Refresh data through scheduled pull requests

Supersedes: NG3 of `add-remote-zone-rules-updates` ("Pull requests for releases. The workflow commits the release directly…") and the direct commit and push of its FR1 (design D7). Everything else of that change stays.

Related changes: `add-city-coordinates-to-locations` is archived — the zone rules compiler already writes the zone coordinates file `zone-rules/zone-coordinates.json` next to the release file, and this change publishes both together. The active change `apply-data-updates-silently` reads the trailer this change guarantees; it must be deployed before the data refresh is switched on (FR11). No other active change touches `app-delivery` requirement "Zone rules publication" or `city-data` requirement "Compiled once, committed, no network at build time".

## Why

The app carries three kinds of data that change after a release: the zone rules (IANA), the city data (GeoNames) and the names of the zone cities (CLDR). Development is close to its end, so there will be no weekly release that could carry fresh data. Today nothing refreshes any of it: the zone rules publication of `add-remote-zone-rules-updates` was specified but never switched on, because it pushes to `main` and `main` accepts changes only through pull requests; the city data is recompiled only when a maintainer remembers; the CLDR packages are updated by hand.

Audience: every user, who should see correct times and current city names without anyone working on the app; and the maintainer, who should be needed only when a refresh looks wrong.

## What Changes

- MODIFIED `app-delivery` "Zone rules publication": the daily workflow no longer commits to `main`. For a newer IANA release it compiles, checks and tests it, then opens a data refresh pull request, which merges by itself when every check passes. The deploy is the ordinary deploy of `main`.
- ADDED `app-delivery`: a monthly city data refresh with the same pull request path; one pull request per data source, updated instead of duplicated; the `Data-Only: true` trailer on every data refresh commit on `main`; a refresh guard that leaves a suspicious refresh to a human; an issue for a failed refresh; CLDR package updates by a dependency bot on the same path; schedules that stay enabled in an idle repository; a repository switch that keeps every data refresh off until the maintainer turns it on.
- MODIFIED `city-data` "Compiled once, committed, no network at build time": the compile command is also run by the city data refresh; pull request checks, the build and the deploy still never contact GeoNames; a refresh that changes nothing but the dump date publishes nothing.
- Unchanged: the data sources (IANA, GeoNames, CLDR — no new one), the compilers, the checks, the files the site serves, everything the app does on the device.
- Glossary (`docs/glossary/zone-rules.md`), changed term: **Zone rules publication** — now "opens a data refresh pull request" instead of "commits it and deploys it".
- Glossary (`docs/glossary/architecture.md`), new terms:
  - **Data refresh** — a scheduled or manual run that recompiles committed data from its source (zone rules publication, city data refresh, CLDR update) and proposes the result as a data refresh pull request. *Never:* auto-update, sync.
  - **City data refresh** — the monthly or manual data refresh of the city data from GeoNames.
  - **Data refresh pull request** — the one pull request of a data source that carries its newest refresh, opened by the data refresh bot and merged automatically when every check and the refresh guard pass.
  - **Data-only commit** — a commit on `main` that changes only committed data and carries the trailer `Data-Only: true`.
  - **Refresh guard** — the comparison of the refreshed data with the committed data that decides whether the pull request may merge by itself.
- Glossary (`docs/glossary/architecture.md`), new term **Data refresh bot** — the GitHub App that opens, updates and merges data refresh pull requests; its pull requests start their checks without approval. *Never:* service account.
- A new ADR records the long-lived decision: committed data reaches `main` only through data refresh pull requests made by a bot, guarded and marked `Data-Only: true`; ADR-0014 point 5 gets a status note ("commits it" becomes "proposes it as a pull request that merges automatically"). The ADR, the workflows, the dependency bot configuration and the repository settings are handoff items (`tasks.md`, Human follow-up); the scripts, their tests, the glossary and the operator notes are ordinary tasks.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-delivery`: MODIFIED "Zone rules publication"; ADDED "City data refresh", "Data refresh pull requests", "Data-only commits", "Refresh guard", "Failed refresh is reported", "CLDR updates", "Schedules stay enabled", "Data refresh switch".
- `city-data`: MODIFIED "Compiled once, committed, no network at build time".

## Goals

- G1: A newer IANA release is on `main` and deployed within 48 hours of its appearance in the IANA listing, with 0 human actions.
- G2: The city data on `main` is never older than 35 days behind GeoNames when GeoNames changed a city of the data, with 0 human actions.
- G3: 0 commits reach `main` outside a pull request.
- G4: 100% of data refresh commits on `main` carry `Data-Only: true` and change nothing but data.

## Non-Goals

- NG1: What the app does with a data-only deploy (notices, silence) — `apply-data-updates-silently`.
- NG2: New data sources, new data fields, or changes to the compilers' output.
- NG3: A refresh of GeoNames more often than monthly, or of IANA less often than daily.
- NG4: Version numbers, release notes or a changelog.
- NG5: Automatic merging of any other dependency update than the two CLDR packages.
- NG6: Refreshing approved screenshots automatically: a refresh that changes a screenshot stays open for a human.
- NG7: A merge queue, a staging site, or data refresh from forks.

## Users & Scenarios

- U1: IANA publishes `2026g` on Monday evening. On Tuesday at 04:17 UTC the zone rules publication opens a pull request "Update zone rules to 2026g"; the checks pass, it merges, the deploy runs. Nobody did anything.
- U2: On the 2nd of the month the city data refresh finds 14 changed cities. Its pull request merges by itself and the site carries the new dump date.
- U3: A GeoNames dump is broken and drops 900 cities. The pull request is opened with the label `needs-review` and the reason, and stays open; the maintainer gets the notification of the pull request.
- U4: IANA is unreachable for a night. The run fails, an issue "Data refresh failed: zone rules" appears; the next successful run closes it.
- U5: The maintainer dispatches either workflow by hand after fixing a problem; it does the same as a scheduled run.
- U6: CLDR 49 is released. The dependency bot opens one pull request for both packages; the checks pass and it merges as a data-only commit.

## Requirements

### Functional

- FR1: The zone rules publication SHALL run daily and on manual dispatch, find the newest released IANA release in the releases listing and stop when the committed release is not older. For a newer release it SHALL compile it, run the zone rules check and the unit tests, and open or update the data refresh pull request of the zone rules. It SHALL NOT push to `main`. The pull request SHALL carry every file the zone rules compiler wrote (the release file and the zone coordinates file).
- FR2: The city data refresh SHALL run monthly and on manual dispatch, compile the city data from the current GeoNames dumps, and stop without a pull request when the result differs from the committed city data in nothing but the dump date. Otherwise it SHALL run the city data check and the unit tests and open or update the data refresh pull request of the city data.
- FR3: Each data source SHALL have at most one open data refresh pull request, on a branch of its own. A newer refresh of the same source SHALL replace the content of the open pull request instead of opening a second one. The title SHALL name the release or the dump date. The pull request SHALL be opened by the data refresh bot, so that the pull request checks start without approval.
- FR4: A data refresh pull request that passes the refresh guard SHALL have automatic squash merging enabled and SHALL merge only when every required check of `main` passes. The merge SHALL trigger the ordinary deploy of `main`.
- FR5: The commit a data refresh pull request leaves on `main` SHALL have a subject naming the source and the release or the dump date, and a message ending with the trailer `Data-Only: true`.
- FR6: A pull request check SHALL fail when a pull request made on a data refresh branch, or by the dependency bot for the CLDR packages, changes a path outside the data paths of its source. A pull request made by anyone else SHALL NOT be merged with the trailer by this automation.
- FR7: The refresh guard SHALL withhold automatic merging and label the pull request `needs-review`, with the reasons in its text, when the refreshed city data lacks more than 1% of the committed cities, lacks a committed city of at least 1 000 000 inhabitants, or uses a zone fewer than before; or when the refreshed zone rules lack a zone identifier of the committed release or the coordinates of a zone that had them.
- FR8: A failed data refresh run SHALL open one issue for its source, or add to the open one, naming the failed step and linking the run; the next successful run of that source SHALL close it. A failed run SHALL NOT open or change a pull request.
- FR9: A dependency bot SHALL propose updates of the CLDR packages `cldr-bcp47` and `cldr-dates-full` together, at most monthly, in one pull request. That pull request SHALL follow FR4–FR6 with the data paths of CLDR: the two version entries of the client package manifest and the lockfile. It SHALL merge only after every required check passed; when a check fails it SHALL stay unmerged, be labelled for a human and be reported in the issue of CLDR (FR8).
- FR10: Every scheduled run of the zone rules publication SHALL re-enable the scheduled workflows of the data refresh (the zone rules publication and the city data refresh), so that an idle repository does not lose its schedules. Both workflows SHALL act only on `main`: dispatched from another branch, they SHALL compile nothing and open no pull request.
- FR11: Until the maintainer switches the data refresh on for the repository, every scheduled or dispatched data refresh run SHALL stop at once, reporting that the data refresh is off, and SHALL open, change or merge nothing. CLDR pull requests of the dependency bot SHALL then not merge automatically either.

### Non-Functional

#### Performance

- NFR-P1: A zone rules publication run that finds the committed release current SHALL make one request to IANA and finish within 2 minutes. Every refresh job SHALL stop after at most 20 minutes.
- NFR-P2: A data refresh SHALL change no budget: the initial JavaScript, the search data file and the zone rules asset keep their limits, checked on the pull request as on any other.

#### Accessibility

- NFR-A1: No interface changes. The existing axe-core scenarios SHALL pass on every data refresh pull request before it merges.

#### Responsive

- NFR-R1: No layout changes. A data refresh pull request whose data changes an approved screenshot SHALL NOT merge by itself.

#### Security

- NFR-S1: The data refresh bot SHALL hold only the repository permissions to write contents and pull requests. Issues and the enabling of workflows SHALL use the run's own short-lived token, limited to writing issues and actions. The bot's credentials SHALL be repository secrets, never printed, and SHALL NOT be available to pull requests from forks. Downloads keep their present verification: the IANA archive's signature against the pinned key.

## UX Acceptance Criteria

- UX1: The maintainer learns about a problem without watching the repository: one issue per failing source, one labelled pull request per suspicious refresh, and nothing at all when everything works.
- UX2: A data refresh reads at a glance in the history of `main`: "Update zone rules to 2026g", "Refresh city data to the dump of 2026-12-02".

## UI States Matrix

| Network | Data | Outcome (repository, not app) |
|---|---|---|
| source reachable | nothing newer | run ends "already current"; no pull request, no issue |
| source reachable | newer, guard passes, checks pass | pull request opens, merges, `main` deploys |
| source reachable | newer, guard withholds | pull request opens with `needs-review`, stays open |
| source reachable | newer, a check fails on the pull request | pull request stays open; the author is notified by GitHub |
| source unreachable or a step fails | any | run fails; issue opened or extended; no pull request |
| any | an open pull request of the source exists | its content is replaced by the newer refresh |
| any | data refresh switched off (FR11) | run ends "data refresh is off"; nothing opened, changed or merged |

## Behavior

- `packages/client/src/test/features/data_refresh/data_refresh_guard.feature` (new) — the verdict of a refresh and the refresh guard, tagged `@refresh-data-through-scheduled-pull-requests` with `@FR2` or `@FR7`.
- `packages/client/src/test/features/data_refresh/data_refresh_data_only_commits.feature` (new) — the text of the data refresh pull request, its commit and the data-only path check, tagged with `@FR3`, `@FR5` or `@FR6`.
- `packages/client/src/test/features/data_refresh/data_refresh_failure_issue.feature` (new) — the text of the issue of a failed refresh, tagged `@FR8`.
- `packages/client/src/test/features/zone_rules_updates/zone_rules_updates_publication.feature` — its scenarios keep their tags and gain `@refresh-data-through-scheduled-pull-requests` where the outcome is now a pull request.

## Visual Reference

None: no screen changes.

## Affected IA

No changes.

## Success Metrics

- M1: On the first live run after the switch-on (H5), a newer release produces exactly 1 pull request and 0 pushes to `main` (a current release: 0 pull requests); after the first live release, the time from the IANA listing to the deploy is at most 48 hours.
- M2: 100% of the data refresh commits on `main` end with `Data-Only: true` and touch only data paths (checked by the pull request check and by `git log` after the first three refreshes).
- M3: A fixture refresh that drops 2% of the cities, a city of 1 000 000 inhabitants, a zone of the city data, a zone identifier or a zone's coordinates gets the verdict "needs review" in 5 of 5 cases; a fixture with 0.5% of cities dropped gets "merge".
- M4: An "already current" run takes at most 2 minutes.
- M5: Mutation score ≥ 95% (minimum acceptable 90%) on the new production files of `scripts/dataRefresh/`.
- M6: 0 changes to files under `packages/client/src/` outside `src/test/`.

## Open Questions

None. Decided by the owner: the data refresh bot is a GitHub App installed on this repository (Q1); the CLDR update merges by itself, but only after every required check passed, and a failure is reported and never merged (Q2).
