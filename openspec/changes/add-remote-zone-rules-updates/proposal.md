# Add remote zone rules updates

## Why

`add-zone-rules-from-iana` makes the app's own zone rules the only source of offsets, with one IANA release committed into the build. A user then gets a newer release only when the app itself is released and reloaded. IANA publishes five to ten releases a year, sometimes weeks before a change takes effect (Kazakhstan: announced 2024-01-19, in tzdata 2024a on 2024-02-01, effective 2024-03-01). The owner wants every user to have the newest rules whenever the device is online, without waiting for an app release, and to be able to see which release the app is using. Decision: ADR-0014, items 5 and 6.

Research behind this proposal: the Android Time Zone Data module (separate data, release ordering, no downgrade, apply at restart), the Elixir `tz` and Python `tzdata` update practices (daily polling of IANA), `@tubular/time` (polling at most hourly, listeners), the GitHub Actions schedule caveats (delayed runs, schedules disabled after 60 days without commits), and the `-latest` link and `version` file lag of `data.iana.org`. Sources are listed in `design.md`.

## What Changes

- ADDED: **zone rules publication**: a scheduled workflow checks IANA daily and on demand, compiles and checks a newer release with the compiler of `add-zone-rules-from-iana`, commits it, deploys the site, and publishes two files next to the app: a small **zone rules version file** naming the newest release, and the release file itself under a path that includes its name. Neither is precached by the service worker, so they can change under an installed app.
- ADDED: **zone rules update**: at start and on every update recheck (the 15-minute rule of the app shell), online, the app reads the version file; when it names a newer release than the active one, the app downloads the release, checks its shape, stores it on the device, and shows the **zone rules update notice** with Reload. A failed or offline check is silent.
- ADDED: **active release** selection at start: the newest of the bundled release and the stored release, never an older one; an unreadable stored release is discarded.
- ADDED: the **zone rules release line** on the settings page after the deploy time: "Time zone rules: 2026c" («Правила часовых поясов: 2026c»), with the active release.
- MODIFIED: `app-shell` gains the zone rules update notice next to the update notice; `settings` gains the release line; `app-delivery` gains the publication workflow and the served files.
- Glossary (`docs/glossary/`): `zone-rules.md` gains **zone rules update**, **zone rules version file**, **zone rules publication**, **active release**, **stored release**, **release order**; `app-shell.md` gains **zone rules update notice**; `settings.md` gains **zone rules release line** and the settings page definition lists it.
- Storage: a new document `time-zones:zone-rules` (ADR-0004 envelope, schema version 1). No change to the locations or preferences documents.

## Capabilities

### New Capabilities

- `zone-rules-updates`: how a newer release reaches a running installation: the check, the download, the stored release, the release order and the no-downgrade rule, the choice of the active release at start, and the silence of failures.

### Modified Capabilities

- `app-shell`: a new notice, "Zone rules update notice", with the same reload and dismiss behaviour as the update notice.
- `settings`: the settings page shows the zone rules release line after the deploy time; the strings exist in every locale.
- `app-delivery`: "Automatic deploy from main" gains the scheduled publication of zone rules; "Works offline after the first visit" states that the version and release files are not precached.

## Impact

All paths are under `packages/client/` unless stated otherwise.

- New `src/lib/zoneRules/releaseOrder.ts` (release order), `src/lib/zoneRules/activeRelease.ts` (bundled vs stored), `src/ports/ZoneRulesRepository.ts` and `src/adapters/localStorageZoneRulesRepository.ts` (+ in-memory adapter and contract tests), `src/adapters/zoneRulesVersionSource.ts` (fetching the version and release files), `src/controller/useZoneRulesUpdate.ts`, `src/constants/zoneRules.ts` (paths, storage key), `src/constants/storage.ts` (`STORAGE_KEYS.ZONE_RULES`).
- `src/lib/zoneRules/loadZoneRules.ts` and `src/lib/legacy/bootApp.ts`: the active release is chosen before the wrapper is installed. `src/app/AppShell.tsx`, `src/app/AppNotices*.tsx`: the notice. `src/views/.../SettingsPage.tsx`, `src/controller/useZoneRulesRelease.ts`, `src/presenter/zoneRulesRelease.ts`: the release line. `src/locales/*.json`: new strings.
- `vite.config.ts` and `scripts/zoneRules/zoneRulesPlugin.ts`: the version and release files are emitted under `zone-rules/` and excluded from the Workbox precache (`globIgnores`); `scripts/check-bundle-size.mjs`: they are not initial JavaScript.
- `.github/workflows/zone-rules-publication.yml` (new, schedule and manual), `.github/workflows/deploy.yml` (callable from it). `scripts/zoneRules/latestRelease.ts` (which release IANA names as current).
- Tests: new features under `src/test/features/zone_rules_updates/`, new scenarios in `app_shell_notices` (a new file), `settings_zone_rules_release_unit.feature` and `_e2e.feature`; screenshot baselines of the settings page re-approved once (the line's text is hidden like the deploy time).
- Depends on `add-zone-rules-from-iana` being implemented first (its compiler, reader, wrapper and asset).

## Goals

- G1: Within one day of an IANA release, the published version file names it, and an installed app that goes online shows the zone rules update notice at its next check.
- G2: After the user reloads, the app uses the new release on every supported engine, and the settings page names it.
- G3: An installation never moves to an older release: a stored release older than the bundled one is ignored; a version file naming an older release is ignored.
- G4: Checks cost at most one small request per 15 minutes of visible use and nothing while offline or hidden; a failed check changes nothing on screen.
- G5: The initial JavaScript stays under its 150 KB gzipped budget; the bundled release asset of `add-zone-rules-from-iana` keeps its budget.

## Non-Goals

- NG1: Applying a downloaded release without a reload. The Temporal polyfill memoizes zone objects for the page's life; the release is applied at the next start, which Reload gives.
- NG2: A server of our own, push notifications, or a third-party CDN. The files are static, on the same origin as the app.
- NG3: Automatic merging of pull requests. The workflow commits the release directly after the check passes, as the data is machine-produced and machine-verified.
- NG4: Notifying the user when the device's own zone data is stale. The app's rules are used regardless.
- NG5: Keeping more than the newest stored release on the device.
- NG6: Running the scheduled workflow against a staging site.

## Users & Scenarios

- U1: IANA publishes 2026d on a Tuesday. On Wednesday the owner opens the installed app on the iPad (iOS 12.5.7), online; the notice "Time zone rules 2026d are ready. Reload to use them." appears. The owner reloads; the settings page reads "Time zone rules: 2026d".
- U2: A user opens the app offline on a train. No notice, no error; the app uses the release it has. Later, online, the check runs on the next return to the screen.
- U3: A user whose installed app still bundles 2026a, with 2026c stored from a previous check, starts the app: 2026c is active. After an app release bundling 2026d, 2026d is active and the stored 2026c is replaced on the next check.
- U4: The owner looks at the settings page to answer a bug report: "Time zone rules: 2026c" tells which release decided the times.

## Requirements

### Functional

- FR1: A scheduled workflow MUST run daily and on manual dispatch. It MUST determine the current IANA release name from `data.iana.org` (not from a `-latest` archive), compare it with the committed release, and stop when they are equal. For a newer release it MUST compile it with the zone rules compiler, run the zone rules check, commit the release file to `main` with a message naming the release, and deploy the site. A failed step MUST fail the run and MUST NOT commit.
- FR2: The site MUST serve, under the app's base path, a zone rules version file `zone-rules/version.json` (`{ "release": "2026c", "publishedAt": "<ISO 8601 Z>" }`) and the release file `zone-rules/<release>.json`. Neither MUST be precached by the service worker, and neither counts as initial JavaScript. The release file content MUST equal the bundled release of the same build.
- FR3: The app MUST check for a zone rules update when it starts and on every update recheck (the app shell's rule: on return to the screen, at most once per 15 minutes), only while online. A check reads the version file with a request that bypasses the HTTP cache. When the named release is newer than the active one (FR5), the app MUST download the release file, parse it as a zone rules release, store it as the stored release, and show the zone rules update notice. When it is equal or older, or already stored, nothing happens.
- FR4: A check that fails (offline, network error, non-2xx, unparsable version file or release) MUST show nothing and change nothing; the next check runs by the same rule. The stored release MUST NOT be replaced by an unparsable download.
- FR5: Releases are ordered by year, then by their letter sequence (`2026a` < `2026b` < `2026z` < `2026aa`); a name that does not match `^\d{4}[a-z]+$` is invalid. The app MUST never make an older release active or store one older than the active release.
- FR6: At start, before the zone rules wrapper is installed, the app MUST choose the active release: the stored release when it is readable, valid and newer than the bundled one, otherwise the bundled one. An unreadable or invalid stored release MUST be discarded silently and the app MUST start with the bundled one. A stored release older than or equal to the bundled one MUST be removed.
- FR7: The zone rules update notice MUST read "Time zone rules `<release>` are ready. Reload to use them." («Доступны правила часовых поясов `<release>`. Перезагрузите, чтобы применить.») with a Reload action and a dismiss control; Reload reloads the page; the app MUST NOT reload by itself; the notice MUST behave as the update notice for keyboard and focus; dismissing hides it until a newer release is stored.
- FR8: The settings page MUST show the zone rules release line directly after the deploy time: "Time zone rules: `<release>`" («Правила часовых поясов: `<release>`»), with the active release, in the accent colour of the deploy time, as plain text. Its strings MUST exist in every locale file.
- FR9: The stored release document MUST use the ADR-0004 envelope with schema version 1 under its own key; the locations and preferences documents are unchanged. Storage unavailable MUST not break the check: the download is used for the notice but not stored.

### Non-Functional

#### Performance

- NFR-P1: A check adds one request for the version file and, only for a newer release, one for the release file. The initial JavaScript stays within 150 KB gzipped; the bundled asset keeps its budget.
- NFR-P2: Choosing the active release at start reads one storage key and parses one document at most; it adds no network request to the start.

#### Accessibility

- NFR-A1: axe-core reports no violations with the zone rules update notice shown and on the settings page with the release line, in both themes.

#### Responsive

- NFR-R1: The release line fits one line from 375 px in English and Russian and causes no horizontal scroll at 320 px; the approved screenshots of the settings page are re-approved once with the line present and its release text hidden, as the deploy time is.

## UX Acceptance Criteria

- UX1: The notice reads like the update notice: one sentence, one action, dismissible, never covering the heading.
- UX2: Two notices (new version and new zone rules) may be shown at once; each has its own Reload, and either reload applies both.
- UX3: The release line looks like the deploy time line: same colour, same size, no icon.

## UI States Matrix

| Network | Data | UI |
|---------|------|----|
| online | version file names a newer release, download valid | zone rules update notice (FR3, FR7) |
| online | version file names the active or an older release | unchanged |
| online | newer release already stored | unchanged (notice was shown when stored) |
| online | version file or release unreadable | unchanged, silent (FR4) |
| offline | any | unchanged, silent (FR4) |
| any | start, stored release newer and valid | app uses the stored release; settings name it (FR6) |
| any | start, stored release older or invalid | app uses the bundled release; stored one removed (FR6) |
| any | storage unavailable, newer release online | notice shown, nothing stored (FR9) |
| any | settings page | release line after the deploy time (FR8) |

## Behavior

Feature files tagged `@add-remote-zone-rules-updates`:

- `src/test/features/zone_rules_updates/` (vitest-cucumber): `zone_rules_updates_release_order.feature` (FR5), `zone_rules_updates_check.feature` (FR3, FR4, FR9: newer, equal, older, unreadable, offline, storage unavailable), `zone_rules_updates_active_release.feature` (FR6), `zone_rules_updates_publication.feature` (FR1, FR2: the workflow's pure steps on fakes, the emitted files, the precache exclusion).
- `src/test/features/app_shell/app_shell_zone_rules_notice.feature` (FR7, UX1, UX2) and `app_shell_zone_rules_notice_e2e.feature` (keyboard, axe, NFR-A1).
- `src/test/features/settings/settings_zone_rules_release_unit.feature` (FR8) and `settings_zone_rules_release_e2e.feature` (NFR-A1, NFR-R1, UX3).
- `src/test/features/zone_rules_updates/zone_rules_updates_e2e.feature` (playwright-bdd): the version and release files are served and not precached (FR2), a mocked newer version file shows the notice and a reload applies it (G2).

## Visual Reference

No new screens. The release line follows the deploy time line of the approved settings screen (`docs/design/screens/`).

## Affected IA

No changes.

## Success Metrics

- M1: 100% of FR1–FR9, NFR-P1, NFR-P2, NFR-A1, NFR-R1 and UX1–UX3 have at least one automated test or CI check naming `add-remote-zone-rules-updates` with the id.
- M2: With a mocked version file naming a release one letter above the bundled one and a valid release file, the notice appears within one check, the release is stored, and after a reload the settings page names it and Almaty's offset comes from it (1 of 1 E2E scenario).
- M3: Release order: 12 ordered pairs (including `2026z` < `2026aa`, `2025z` < `2026a`) and 4 invalid names behave as FR5 says.
- M4: With the network failing, the version file unparsable, or the release file invalid, 0 notices and 0 storage writes (3 of 3 scenarios); a stored release older than the bundled one is removed at start (1 of 1).
- M5: The published `zone-rules/version.json` and `zone-rules/<release>.json` are absent from the precache manifest of `dist/sw.js` and absent from the initial JavaScript (bundle check passes).
- M6: Mutation score ≥ 95% (minimum 90%) on the new modules.
- M7: The workflow file passes `actionlint`; its first scheduled run on `main` after merge either stops with "already current" or commits a newer release and deploys.

## Open Questions

- Q1: Which `data.iana.org` resource names the current release. `https://data.iana.org/time-zones/tzdb/version` holds the development version; the release list `https://data.iana.org/time-zones/releases/` and the `tz-announce` feed name releases. Task 7.1 picks the one that names released versions only and records it in `design.md`.
- Q2: Whether the workflow commits with the default `GITHUB_TOKEN` (its pushes trigger no other workflow, so the deploy is called from the same run, design D7) or with a dedicated token. Proposed: `GITHUB_TOKEN` plus an explicit call of the deploy workflow.
- Q3: Whether to show the stored-but-not-yet-active release on the settings page ("2026d after reload"). Proposed: no; the notice already says it, and the line stays a single fact.
