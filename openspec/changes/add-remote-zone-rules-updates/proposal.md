# Add remote zone rules updates

## Why

`add-zone-rules-from-iana` (archived 2026-11-12) makes the app's own zone rules the only source of offsets, with one IANA release (`2026f` today) committed into the build. A user then gets a newer release only when the app itself is released and reloaded. IANA publishes five to ten releases a year, sometimes weeks before a change takes effect (Kazakhstan: announced 2024-01-19, in tzdata 2024a on 2024-02-01, effective 2024-03-01). The owner wants every user to have the newest rules whenever the device is online, without waiting for an app release, and to be able to see which release the app is using. Decision: ADR-0014, items 5 and 6.

Research behind this proposal: the Android Time Zone Data module (separate data, release ordering, no downgrade, apply at restart), the Elixir `tz` and Python `tzdata` update practices (daily polling of IANA), `@tubular/time` (polling at most hourly), the GitHub Actions schedule caveats (delayed runs, schedules disabled after 60 days without commits), and the lag of the `-latest` link of `data.iana.org`. Sources are listed in `design.md`.

## What Changes

- ADDED: **zone rules publication**: a scheduled workflow checks IANA daily and on demand, compiles and checks a newer release with the existing zone rules compiler and zone rules check, commits it, deploys the site, and the site publishes two files next to the app: a small **zone rules version file** naming the newest release, and the release file itself under a path that includes its name. Neither is precached by the service worker, so both can change under an installed app.
- ADDED: **zone rules update**: at start and on every update recheck, online, the app reads the version file; when it names a release newer than the **active release**, the app downloads it (unless it is already the **stored release**), checks it, stores it on the device and shows the **zone rules update notice** with Reload. A failed or offline check is silent.
- ADDED: **active release** at start: the newest of the bundled release and the stored release by the **release order**, never an older one; an unreadable stored release is discarded.
- ADDED: the **zone rules release line** on the settings page directly after the deploy time: "Time zone rules: 2026f" («Правила часовых поясов: 2026f»), naming the active release.
- MODIFIED: `app-shell` gains the zone rules update notice next to the update notice; `settings`: the deploy time is no longer the last line (the release line follows it); `app-delivery` gains the publication and the served files, and the offline requirement states that those files are not precached; `zone-rules`: "Rules load before the app" names the stored release as a source besides the precached asset, and the engine's data is used only when neither loads.
- Glossary (`docs/glossary/`): `zone-rules.md` gains **zone rules update**, **zone rules version file**, **zone rules publication**, **active release**, **stored release**, **release order**; `app-shell.md` gains **zone rules update notice** and the **update recheck** entry names its shared scheduler; `settings.md` gains **zone rules release line**, and the **settings page** and **deploy time** entries list it.
- Storage: a new document under its own key (ADR-0004 envelope, schema version 1). The locations and preferences documents are unchanged. ADR-0004 stays as it is. A new ADR-0015 "Cached copies of published data" refines it for this kind of document: an unreadable copy is removed silently and the bundled data is used instead, which is its recovery (no reset action), and its writes are not broadcast to other tabs. The persistence line of `.claude/rules/architecture.md` ("Invalid stored data leads to a recoverable error state, never a crash") gains the same exception. Both are written by a human (H1), because the factory may not write `docs/adr/`, `.claude/` or `CLAUDE.md`.
- One owner for release names: the compiler's own single-letter pattern is replaced by the release order, so `2026aa` compiles too.
- MODIFIED `zone-rules` ("Content of a zone rules release", "Zone rules check against zdump") and `zone-abbreviations` ("One offline abbreviation table"): they speak of "the committed release" instead of the release name `2026f`, and the tests that assert that name read the committed release instead, so the test suite the publication runs passes for a newer release. Assertions on release content (zdump fixtures, New York, Almaty, Dublin, abbreviation pairs) stay; a release that changes them needs a human change.

## Capabilities

### New Capabilities

- `zone-rules-updates`: how a newer release reaches a running installation: the release order, the check, the download, the stored release and its document, the active release at start, the silence of failures, the dismissal of the notice.

### Modified Capabilities

- `app-shell`: ADDED "Zone rules update notice".
- `settings`: ADDED "Zone rules release line"; MODIFIED "Deploy time" (no longer the last line of the page).
- `app-delivery`: ADDED "Zone rules publication" and "Zone rules files are served and not precached"; MODIFIED "Works offline after the first visit".
- `zone-rules`: MODIFIED "Rules load before the app" (the stored release may be loaded instead of the bundled asset; the engine's data only when neither loads).
- `zone-rules`: MODIFIED "Content of a zone rules release" and "Zone rules check against zdump" (they name "the committed release" instead of `2026f`).
- `zone-abbreviations`: MODIFIED "One offline abbreviation table" (built from the committed release, not from `2026f`).

## Impact

Paths are under `packages/client/` unless stated otherwise; `design.md` names each module.

- New: release order in `src/lib/zoneRules/core/`, active release choice in `src/lib/zoneRules/`, two ports in `src/ports/` (stored release, version source) with their adapters in `src/adapters/`, the check hook in `src/controller/`, the notice in `src/app/`, the release line in `src/app/settings/` with its presenter, constants in `src/constants/`, strings in `src/locales/en.json` and `ru.json`.
- Changed: `src/boot.ts` and `loadZoneRules` (active release at start), `src/controller/useUpdateRecheckOnReturn.ts` (shared scheduler), `src/app/AppShell.tsx`, `src/app/settings/SettingsPage.tsx`, `scripts/zoneRules/zoneRulesPlugin.ts`, `scripts/zoneRules/compile.ts`, `vite.config.ts`, `scripts/check-bundle-size.mjs`, `zone-rules/README.md`; new `scripts/zoneRules/latestRelease.ts` with a `package.json` script.
- Settings screenshot baselines re-approved once with the line present and its text hidden.
- Handed to a human (`tasks.md`, Human follow-up): the workflow files under `.github/workflows/` (H2), the new ADR-0015 with its lines in `CLAUDE.md` and `.claude/rules/architecture.md` (H1), the first run on `main` (H3).

## Goals

- G1: Within one day of an IANA release, the published version file names it, and an installed app that goes online shows the zone rules update notice at its next check.
- G2: After the user reloads, the app uses the new release on every supported engine, and the settings page names it.
- G3: An installation never moves to an older release: a stored release older than or equal to the bundled one is removed; a version file naming an older release is ignored.
- G4: Checks cost at most one small request per 15 minutes of visible use and nothing while offline or hidden; a failed check changes nothing on screen.
- G5: The initial JavaScript stays under its 150 KB gzipped budget; the bundled zone rules asset keeps its 22 KB budget.

## Non-Goals

- NG1: Applying a downloaded release without a reload. The Temporal polyfill memoizes zone objects for the page's life; the release is applied at the next start, which Reload gives.
- NG2: A server of our own, push notifications, or a third-party CDN. The files are static, on the same origin as the app.
- NG3: Pull requests for releases. The workflow commits the release directly after the zone rules check passes, as the data is machine-produced and machine-verified.
- NG4: Notifying the user when the device's own zone data is stale.
- NG5: Keeping more than the newest stored release on the device.
- NG6: Publishing to a staging site or to pull request previews.

## Users & Scenarios

- U1: IANA publishes 2026g on a Tuesday. On Wednesday the owner opens the installed app on the iPad (iOS 12.5.7), online; the notice "Time zone rules 2026g are ready. Reload to use them." appears. The owner reloads; the settings page reads "Time zone rules: 2026g".
- U2: A user opens the app offline on a train. No notice, no error; the app uses the release it has. Later, online, the check runs on the next return to the screen.
- U3: A user whose installed app bundles 2026f, with 2026g stored, starts the app: 2026g is active. After an app release bundling 2026h, 2026h is active and the stored 2026g is removed.
- U4: The owner answers a bug report from the settings page: "Time zone rules: 2026g" tells which release decided the times.

## Requirements

### Functional

- FR1: A scheduled workflow MUST run daily and on manual dispatch. It MUST determine the newest released IANA release from the `data.iana.org` releases listing (never a `-latest` archive or the development `version` file), compare it with the committed release by the release order, and stop when the committed one is not older. For a newer release it MUST compile it with the zone rules compiler, run the zone rules check, commit the release file to `main` with a message naming the release, and deploy the new commit. A failed step MUST fail the run and MUST NOT commit or deploy. The tests and specs that read the committed release MUST hold for any committed release name, so a newer release is not blocked by a pinned name.
- FR2: The site MUST serve, under the app's base path, the zone rules version file `zone-rules/version.json` (`{ "release": "2026f", "publishedAt": "<ISO 8601 with Z>" }`) and the release file `zone-rules/<release>.json` whose content equals the bundled release of the same build. Neither MUST be precached by the service worker, and neither counts as initial JavaScript.
- FR3: The app MUST check for a zone rules update when it starts and on every update recheck (on return to the screen, at most once per 15 minutes), only while online and only when an active release is installed. A check reads the version file with a request that revalidates the HTTP cache. When the named release is newer than the active release: if it is already the stored release, the app MUST show the zone rules update notice without a further request; otherwise it MUST download the release file, accept it only when it is a valid zone rules release whose name equals the named one, store it as the stored release and show the notice. When the named release is equal to or older than the active one, nothing happens.
- FR4: A check that fails (offline, network error, non-2xx status, unparsable version file, invalid release name, invalid release file or one with another name) MUST show nothing and change nothing; the next check runs by the same rule. The stored release MUST NOT be replaced by a rejected download.
- FR5: Releases are ordered by year, then by the length of their letter sequence, then alphabetically (`2026a` < `2026b` < `2026z` < `2026aa`); a name that does not match `^\d{4}[a-z]+$` is invalid. The app MUST never make an older release active, and the zone rules compiler MUST accept every valid name.
- FR6: At start, before the zone rules wrapper is installed, the app MUST choose the active release: the stored release when it is readable, valid and newer than the bundled one, otherwise the bundled one; when the bundled release cannot be loaded, a valid stored release is used. An unreadable or invalid stored release MUST be removed silently; a stored release older than or equal to the bundled one MUST be removed.
- FR7: The zone rules update notice MUST read "Time zone rules `<release>` are ready. Reload to use them." («Доступны правила часовых поясов `<release>`. Перезагрузите, чтобы применить.») with a Reload action and a dismiss control. Reload reloads the page; the app MUST NOT reload by itself; the notice MUST behave as the update notice for keyboard and focus; a dismissed notice stays hidden for the page's life until a newer release is stored.
- FR8: The settings page MUST show the zone rules release line directly after the deploy time: "Time zone rules: `<release>`" («Правила часовых поясов: `<release>`»), naming the active release, in the accent colour of the deploy time, as plain text. Its strings MUST exist in every locale file. When no release is active the line is absent.
- FR9: The stored release MUST be kept under its own storage key in the ADR-0004 envelope with schema version 1; the locations and preferences documents are unchanged. When storage is unavailable or the write fails, a downloaded newer release MUST still show the notice and MUST NOT be stored.

### Non-Functional

#### Performance

- NFR-P1: A check makes one request for the version file and, only for a newer release that is not stored, one request for the release file. The initial JavaScript stays within 150 KB gzipped; the bundled zone rules asset keeps its 22 KB budget.
- NFR-P2: Choosing the active release at start reads one storage key once and adds no network request to the start.

#### Accessibility

- NFR-A1: axe-core reports no violations with the zone rules update notice shown and on the settings page with the release line, in both themes.

#### Responsive

- NFR-R1: The release line fits one line from 375 px in English and Russian and causes no horizontal scroll at 320 px; the approved settings screenshots are re-approved once with the line present and its text hidden, as the deploy time's is.

## UX Acceptance Criteria

- UX1: The notice reads like the update notice: one sentence, one action, dismissible, never covering the page heading.
- UX2: Both notices (new version and new zone rules) may be shown at once; each has its own Reload, and the Reload of either applies both the waiting version and the stored release.
- UX3: The release line looks like the deploy time line: same colour, same size, no icon.

## UI States Matrix

| Network | Data | UI |
|---------|------|----|
| online | version file names a newer release, download valid | zone rules update notice (FR3, FR7) |
| online | version file names a newer release that is already stored | zone rules update notice, no download (FR3) |
| online | version file names the active or an older release | unchanged |
| online | version file or release file unreadable or rejected | unchanged, silent (FR4) |
| offline | any | unchanged, silent, no request (FR4) |
| any | no active release (rules failed to load) | no check; no release line (FR3, FR8) |
| any | start, stored release newer and valid | stored release active; settings name it (FR6) |
| any | start, stored release older, equal or invalid | bundled release active; stored one removed (FR6) |
| online | storage unavailable, newer release published | notice shown, nothing stored (FR9) |
| any | settings page | release line after the deploy time (FR8) |

Loading: the check runs in the background and has no loading state; the release line is known before the first render. Empty: no stored release is the normal case (bundled release active).

## Behavior

Feature files tagged `@add-remote-zone-rules-updates`, under `packages/client/src/test/features/`:

- `zone_rules_updates/` (vitest-cucumber): `zone_rules_updates_release_order.feature` (FR5), `zone_rules_updates_check.feature` (FR3, FR4, FR7, FR9, NFR-P1), `zone_rules_updates_active_release.feature` (FR6, NFR-P2), `zone_rules_updates_publication.feature` (FR1, FR2); the existing `zone_rules/zone_rules_release.feature` and `zone_abbreviations/zone_abbreviations_unit.feature` gain `@add-remote-zone-rules-updates @FR1` on the scenarios that read the committed release.
- `zone_rules_updates/zone_rules_updates_delivery_e2e.feature` (playwright-bdd): files served and not precached (FR2), a newer release reaches the app and a reload applies it (G2, M2), offline start makes no check (FR4).
- `app_shell/app_shell_zone_rules_notice_unit.feature` (FR7, UX1, UX2) and `app_shell_zone_rules_notice_e2e.feature` (keyboard, heading, NFR-A1).
- `settings/settings_zone_rules_release_unit.feature` (FR8) and `settings_zone_rules_release_e2e.feature` (NFR-A1, NFR-R1, UX3).

## Visual Reference

No new screens. The release line follows the deploy time line of the approved settings screen (`docs/design/screens/`).

## Affected IA

No changes.

## Success Metrics

- M1: 16 of 16 ids (FR1–FR9, NFR-P1, NFR-P2, NFR-A1, NFR-R1, UX1–UX3) are named together with `add-remote-zone-rules-updates` in at least one test, feature or source file under `packages/client/`.
- M2: With a mocked version file naming the release one letter above the bundled one and a valid release file whose Almaty rule is UTC+4, the notice appears within one check, and after one reload the settings page names that release and the Almaty card shows UTC+4 (1 of 1 E2E scenario).
- M3: Release order: 6 ordered pairs (including `2026z` < `2026aa`, `2025z` < `2026a`), checked in both directions and against themselves, and 4 invalid names behave as FR5 says.
- M4: With the version request failing, a 404, an unparsable version file, an invalid release name, an invalid release file or a release file with another name: 0 notices and 0 storage writes (6 of 6 cases); a stored release older than or equal to the bundled one is removed at start (2 of 2).
- M5: The built `dist/zone-rules/version.json` and `dist/zone-rules/<release>.json` exist, appear 0 times in the precache manifest of `dist/sw.js`, and the bundle size check passes.
- M6: Mutation score ≥ 95% (minimum 90%) on every new or changed module under `src/`.
- M7: `actionlint` reports 0 findings on the workflow files of H2; the first manual dispatch on `main` after merge ends with "already current" or a commit naming a release followed by a deploy (H3).

## Open Questions

- Q1 (resolved): the releases listing `https://data.iana.org/time-zones/releases/` (already `IANA_RELEASES_URL` of the compiler) names released versions only; `tzdb/version` may name an unreleased one. The workflow reads the listing.
- Q2 (resolved): the workflow commits with the default `GITHUB_TOKEN` and calls the deploy workflow itself for the new commit, since such a push triggers no other workflow (design D7).
- Q3 (resolved): the settings page does not show a stored release that is not yet active; the notice says it.
