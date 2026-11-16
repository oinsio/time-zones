# Spec Delta: app-delivery

## MODIFIED Requirements

### Requirement: Zone rules publication
A scheduled workflow SHALL run daily and on manual dispatch, determine the newest released IANA release from the `data.iana.org` releases listing (never a `-latest` archive or the development `version` file), and stop when the committed release is not older by the release order. For a newer release it MUST compile it with the zone rules compiler, run the zone rules check and the unit tests, and open or update the data refresh pull request of the zone rules with every file the compiler wrote, under a title naming the release. It MUST NOT push to `main`; the release reaches `main` only when that pull request merges, and the deploy is the ordinary deploy of `main`. A failed step MUST fail the run and MUST NOT open or change a pull request. A run that finds the committed release current MUST make one request to IANA and finish within 2 minutes. The workflow MUST act only on `main`, also when dispatched from another branch. <!-- implements FR1 of add-remote-zone-rules-updates; FR1, FR10, NFR-P1 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The newest release in the listing
- **GIVEN** the releases listing holds `tzdata2026f.tar.gz`, `tzdata2026z.tar.gz`, `tzdata2026aa.tar.gz` and `tzcode2026ab.tar.gz`
- **WHEN** the newest release is determined
- **THEN** it is `2026aa`

#### Scenario: Already current
- **GIVEN** the committed release is `<committed>` and the newest listed release is `2026f`
- **WHEN** the workflow runs
- **THEN** it stops reporting "already current" and opens no pull request

| committed |
|---|
| 2026f |
| 2026g |

#### Scenario: A newer release
- **GIVEN** the committed release is `2026f` and the newest listed release is `2026g`
- **WHEN** the workflow runs
- **THEN** `2026g` is compiled and checked, and the unit tests run
- **AND** a pull request titled "Update zone rules to 2026g" holds the compiled files
- **AND** nothing was pushed to `main`

#### Scenario: The compiler wrote two files
- **GIVEN** the zone rules compiler writes the release file and the zone coordinates file
- **WHEN** the workflow publishes `2026g`
- **THEN** the pull request holds both files

#### Scenario: The check fails
- **GIVEN** the compiled release differs from `zdump -v`
- **WHEN** the workflow runs
- **THEN** the run fails and no pull request is opened or changed

#### Scenario: Manual dispatch
- **WHEN** the workflow is dispatched by hand on `main`
- **THEN** it runs the same steps as a scheduled run

#### Scenario: Dispatch from another branch
- **WHEN** the workflow is dispatched by hand on a branch other than `main`
- **THEN** it compiles nothing and opens no pull request

## ADDED Requirements

### Requirement: City data refresh
A scheduled workflow SHALL run monthly and on manual dispatch, only on `main`, and compile the city data from the current GeoNames dumps. When only the dump date differs from the committed city data, it MUST stop as "already current". Otherwise it MUST run the city data check and the unit tests and open or update the city data's pull request, titled with the dump date. A failed step MUST NOT open or change one. <!-- implements FR2, FR10 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: Nothing but the dump date changed
- **GIVEN** the committed city data was compiled from the dump of `2026-11-14`
- **AND** the dump of `2026-12-02` gives the same cities, names, zones, regions, populations and coordinates
- **WHEN** the workflow runs
- **THEN** it stops reporting "already current" and opens no pull request

#### Scenario: Cities changed
- **GIVEN** the dump of `2026-12-02` changes the population of 14 cities of the committed city data
- **WHEN** the workflow runs
- **THEN** the city data check and the unit tests run
- **AND** a pull request titled "Refresh city data to the dump of 2026-12-02" holds the compiled files

#### Scenario: A download fails
- **GIVEN** a GeoNames dump cannot be downloaded
- **WHEN** the workflow runs
- **THEN** the run fails and no pull request is opened or changed

### Requirement: Data refresh pull requests
Each data source SHALL have at most one open data refresh pull request, on its own branch; a newer refresh MUST replace its content and title. The data refresh bot MUST open it, so its checks start without approval. When the refresh guard passes, it MUST be squash-merged automatically once every required check of `main` passes, and the merge MUST start the ordinary deploy. A data refresh reaches `main` no other way. <!-- implements FR3, FR4, G3 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The pull request merges by itself
- **GIVEN** a data refresh pull request whose refresh guard passed
- **WHEN** every required check passes
- **THEN** it is squash-merged into `main` without a human action
- **AND** the deploy of `main` starts

#### Scenario: A check fails
- **GIVEN** a data refresh pull request whose refresh guard passed
- **WHEN** a required check fails
- **THEN** it stays open and `main` is unchanged

#### Scenario: A newer refresh replaces an open one
- **GIVEN** the pull request "Update zone rules to 2026g" is open
- **WHEN** the zone rules publication finds `2026h`
- **THEN** the same pull request holds the files of `2026h` under the title "Update zone rules to 2026h"
- **AND** no second pull request of the zone rules is open

#### Scenario: Sources do not share a pull request
- **GIVEN** the pull request of the zone rules is open
- **WHEN** the city data refresh finds changed cities
- **THEN** a separate pull request of the city data is opened

### Requirement: Data-only commits
The commit a data refresh pull request leaves on `main` SHALL have a message whose last line is the trailer `Data-Only: true`. For the zone rules and the city data its subject MUST name the source and its release or dump date; the commit of the CLDR pull request keeps the dependency bot's title with the pull request number as its subject. A pull request check MUST fail when a data refresh pull request changes a path outside the data paths of its source. The automation MUST NOT give the trailer to any other pull request. <!-- implements FR5, FR6, G4, UX2 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The commit of a zone rules refresh
- **WHEN** the pull request "Update zone rules to 2026g" with the number 140 merges
- **THEN** the commit on `main` has the subject "Update zone rules to 2026g (#140)"
- **AND** the last line of its message is `Data-Only: true`

#### Scenario: The commit of a city data refresh
- **WHEN** the pull request "Refresh city data to the dump of 2026-12-02" merges
- **THEN** the last line of the commit's message on `main` is `Data-Only: true`

#### Scenario: The commit of a CLDR update
- **WHEN** the CLDR pull request of the dependency bot with the number 150 merges
- **THEN** the subject of the commit on `main` is the dependency bot's title followed by "(#150)"
- **AND** the last line of its message is `Data-Only: true`

#### Scenario: Data paths of each source
- **WHEN** the data paths of a source are named
- **THEN** they are the zone rules directory for the zone rules, the city data directory for the city data, and the two CLDR version entries of the client package manifest with the lockfile for CLDR

#### Scenario: A data refresh branch with other changes
- **GIVEN** a pull request on the data refresh branch of `<source>` that changes `<path>`
- **WHEN** the pull request checks run
- **THEN** the data-only check `<outcome>`

| source | path | outcome |
|---|---|---|
| zone rules | the zone rules release file | passes |
| zone rules | the zone coordinates file | passes |
| zone rules | a file under `src/` | fails and names the file |
| city data | the committed city data | passes |
| city data | the zone rules release file | fails and names the file |
| CLDR | the lockfile and the two CLDR version entries | passes |
| CLDR | another dependency's version entry | fails and names the entry |

#### Scenario: An ordinary pull request
- **WHEN** a pull request on any other branch is merged
- **THEN** the automation added no `Data-Only` trailer to its commit

### Requirement: Refresh guard
The refreshed data SHALL be compared with the committed data before its pull request is opened or updated. When the comparison finds a loss listed below, automatic merging MUST be withheld, and the pull request MUST carry the label `needs-review` and state each reason. Otherwise automatic merging is enabled and the label is absent, also on a pull request left labelled earlier. <!-- implements FR7, UX1, M3 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The losses the guard looks for
- **WHEN** refreshed data is compared with the committed data
- **THEN** the losses are: more than 1% of the committed GeoNames cities missing; a committed city of at least 1 000 000 inhabitants missing; a zone the city data used and no longer uses; a zone identifier of the committed release missing; the coordinates of a zone that had them missing

#### Scenario: The guard decides
- **GIVEN** the committed city data holds 6 000 cities
- **WHEN** a refresh `<difference>`
- **THEN** the verdict is `<verdict>`

| difference | verdict |
|---|---|
| lacks 30 cities (0.5%), none of 1 000 000 inhabitants | merge |
| lacks 60 cities (1%), none of 1 000 000 inhabitants | merge |
| lacks 61 cities | needs review: the count and the share |
| lacks one city of 1 200 000 inhabitants | needs review: the city |
| no longer uses the zone `Asia/Almaty` | needs review: the zone |
| adds 200 cities | merge |

#### Scenario: Zone rules that lose a zone
- **GIVEN** the committed release holds the identifier `Europe/Kyiv`
- **WHEN** the refreshed release has no entry `Europe/Kyiv`, neither a zone nor a link
- **THEN** the verdict is "needs review" and names `Europe/Kyiv`

#### Scenario: Zone rules that lose coordinates
- **GIVEN** the committed zone coordinates hold `Asia/Almaty`
- **WHEN** the refreshed zone coordinates do not
- **THEN** the verdict is "needs review" and names `Asia/Almaty`

#### Scenario: A pull request left to a human
- **WHEN** a pull request is opened with the verdict "needs review"
- **THEN** it has the label `needs-review` and no automatic merging
- **AND** its text lists the reasons

#### Scenario: A later refresh passes
- **GIVEN** an open data refresh pull request with the label `needs-review`
- **WHEN** a newer refresh of the same source gets the verdict "merge"
- **THEN** the label is removed and automatic merging is enabled

### Requirement: Failed refresh is reported
A data refresh run that fails SHALL open one issue for its source, titled with the source, that names the failed step and links the run; while such an issue is open, a further failed run MUST add a comment to it and MUST NOT open another. The next successful run of that source, whether it found something newer or not, MUST close the issue with a comment. A run that works MUST leave no issue and no comment. <!-- implements FR8, UX1 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The first failure
- **GIVEN** no issue of the zone rules refresh is open
- **WHEN** the zone rules publication fails at the step "Compile the release"
- **THEN** an issue "Data refresh failed: zone rules" is opened that names the step and links the run

#### Scenario: A repeated failure
- **GIVEN** the issue "Data refresh failed: zone rules" is open
- **WHEN** the zone rules publication fails again
- **THEN** a comment with the new run is added and no second issue is opened

#### Scenario: Recovery
- **GIVEN** the issue "Data refresh failed: zone rules" is open
- **WHEN** the zone rules publication succeeds reporting "already current"
- **THEN** the issue is closed with a comment linking the run

### Requirement: CLDR updates
A dependency bot SHALL propose updates of the CLDR packages `cldr-bcp47` and `cldr-dates-full` together in one pull request, at most once a month. That pull request is the data refresh pull request of CLDR: it MUST merge automatically as a data-only commit only when it changes only the data paths of CLDR and every required check passed: the build, the tests and the data checks. When a required check fails, the pull request MUST NOT merge; it MUST stay open with the label `needs-review`, and the failure MUST be reported as "Failed refresh is reported" defines for a source, in the issue of CLDR, naming the failed check and linking the pull request; when every required check of a later CLDR pull request passes, that issue MUST be closed with a comment. No other dependency update MUST be merged automatically. <!-- implements FR9, NG5 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: A new CLDR release
- **GIVEN** `cldr-bcp47` and `cldr-dates-full` are at 48.2.0 and 49.0.0 is published
- **WHEN** the dependency bot runs
- **THEN** one pull request updates both packages
- **AND** when every required check passes it merges with the trailer `Data-Only: true`

#### Scenario: A CLDR update that breaks a check
- **GIVEN** the dependency bot opened the pull request that updates both CLDR packages
- **WHEN** a required check of that pull request fails
- **THEN** the pull request is not merged and gets the label `needs-review`
- **AND** one issue for CLDR names the failed check and links the pull request
- **AND** the app that users have is unchanged

#### Scenario: Another dependency
- **WHEN** the dependency bot proposes an update of a package other than the two CLDR packages, on a branch other than the CLDR group's
- **THEN** automatic merging is not enabled and no trailer is added
- **AND** this holds whatever the dependency bot's configuration allows, because the automation acts only on the CLDR group's branch

### Requirement: Schedules stay enabled
Every scheduled run of the zone rules publication SHALL re-enable the scheduled workflows of the data refresh, so that a repository without other activity keeps its schedules. The operator notes MUST state how to see that a schedule was disabled and how to enable it again by hand. <!-- implements FR10 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: A daily run renews the schedules
- **WHEN** the zone rules publication runs on its schedule
- **THEN** it has enabled the zone rules publication and the city data refresh workflows

#### Scenario: Renewing fails
- **GIVEN** enabling a workflow fails
- **WHEN** the zone rules publication runs
- **THEN** the run still looks for a newer release
- **AND** the run is reported as failed

### Requirement: Data refresh switch
The repository SHALL hold one switch for the data refresh, off until the maintainer turns it on. While it is off, every scheduled or dispatched run of the zone rules publication and of the city data refresh MUST stop at once reporting "data refresh is off" and MUST NOT open, change or merge a pull request or an issue, and a CLDR pull request of the dependency bot MUST NOT get automatic merging. Turning the switch on MUST need no change to a file of the repository. <!-- implements FR11 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: The switch is off
- **GIVEN** the data refresh is switched off
- **WHEN** the zone rules publication or the city data refresh runs
- **THEN** it stops reporting "data refresh is off"
- **AND** no pull request or issue is opened or changed

#### Scenario: The switch is turned on
- **GIVEN** the data refresh was switched off
- **WHEN** the maintainer switches it on in the repository settings
- **THEN** the next run of each workflow refreshes its data as the other requirements define

### Requirement: Data refresh credentials
The data refresh bot SHALL hold only the repository permissions to write contents and pull requests. Opening, commenting and closing the issue of a failed refresh and enabling the scheduled workflows MUST use the run's own short-lived token, limited to writing issues and actions. The bot's credentials MUST be repository secrets, MUST never be printed by a step and MUST NOT be available to pull requests from forks. The zone rules publication MUST keep verifying the IANA archive's signature against the pinned key. <!-- implements NFR-S1 of refresh-data-through-scheduled-pull-requests -->

#### Scenario: A data refresh workflow runs
- **WHEN** a data refresh workflow runs
- **THEN** the data refresh bot's token can write only contents and pull requests
- **AND** issues and the enabling of workflows use the run's own token, limited to writing issues and actions
- **AND** no step prints a secret, and no workflow triggered by a pull request from a fork receives the bot's credentials
