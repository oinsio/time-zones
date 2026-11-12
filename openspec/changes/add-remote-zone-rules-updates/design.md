# Design: Add remote zone rules updates

## Context

Driven by FR1–FR9, NFR-P1, NFR-P2, NFR-A1, NFR-R1 and UX1–UX3 of `proposal.md` (see proposal.md — Why) and by ADR-0014 items 5 and 6. Builds on `add-zone-rules-from-iana`: its `ZoneRulesRelease` reader, `installZoneRulesDateTimeFormat`, `loadZoneRules` (boot step), the asset plugin and the compiler and check scripts under `scripts/zoneRules/`. Current state, checked in `packages/client/` and `.github/`:

- `src/controller/usePwaUpdateStatus.ts` holds the update check; `useUpdateRecheckOnReturn.ts` runs a callback on `visibilitychange` at most once per `UPDATE_RECHECK_INTERVAL_MS` (15 min, `src/constants/update.ts`) with an injected `Clock`. `AppShell` takes an optional `clock` and renders the notices region; `app_shell_notices.steps.ts` is 273 lines, so new notice tests go into new files. `fakeServiceWorkerModule` lives in `src/test/fakeServiceWorker.ts`.
- Storage: `STORAGE_KEYS` in `src/constants/storage.ts`; repositories follow ADR-0004 (`{ schemaVersion, payload }`, a storage adapter, an in-memory adapter, shared contract tests; `useStorageAvailability` reports unavailable storage). `localStorage` is the store of both existing documents; the release document (tens of kilobytes) fits its limits.
- Settings: the deploy time line (`useDeployTime`, `presentDeployTime` in `src/presenter/deployTime.ts`, `DeployTime` component, `settings.deployTime`) is the last line of the page, in the accent colour; screenshots hide its text (`settings_deploy_time_e2e.feature`).
- Build and deploy: `vite.config.ts` registers the PWA with `workbox.globPatterns` covering `json`; `deploy.yml` runs on `push` to `main` and `workflow_dispatch`, calls `ci.yml` and deploys to GitHub Pages; pushes made with the default `GITHUB_TOKEN` trigger no workflow. GitHub Pages sets `Cache-Control: max-age=600` on every file and allows no custom headers. GitHub disables a repository's schedules after 60 days without commits; a workflow's own commits count as activity.
- IANA: `https://data.iana.org/time-zones/releases/` lists `tzdata<release>.tar.gz` files; `https://data.iana.org/time-zones/tzdb/version` names the development version (may be ahead of the last release). The `-latest` links and the `version` file inside them have lagged (2026c).

## Goals / Non-Goals

**Goals:** the data path (publication → version file → check → store → next start) has one owner per step, every step is testable with fakes, and a failure anywhere leaves the app on a release that passed the check.

**Non-Goals:** applying a release without reload (the polyfill memoizes zones), a staging channel, more than one stored release.

## Decision

### D1. Release order as one pure function (FR5)

`src/lib/zoneRules/releaseOrder.ts`: `parseReleaseName(text)` → `{ year, letters }` or `undefined` (`^\d{4}[a-z]+$`), `compareReleases(a, b)` → negative, zero, positive: year first, then letter-sequence length, then lexicographic letters. Used by the check (newer than active?), the start (stored newer than bundled?) and the workflow (`scripts/zoneRules/latestRelease.ts` imports the same module). One owner: the glossary term **release order**.

### D2. Stored release through a repository port (FR6, FR9)

`src/ports/ZoneRulesRepository.ts`: `read(): StoredZoneRules | undefined | ZoneRulesStorageError`, `write(release)`, `remove()`. Adapters `localStorageZoneRulesRepository` (key `STORAGE_KEYS.ZONE_RULES = "time-zones:zone-rules"`, envelope schema version 1, payload the release document) and `createInMemoryZoneRulesRepository`; shared contract tests as for the other repositories. Invalid JSON, a foreign envelope or a payload the release reader rejects read as `UNREADABLE`, which the caller removes. No cross-tab sync: the document is written at most once per release, and each tab chooses its active release at its own start.

### D3. Active release at boot (FR6, NFR-P2)

`src/lib/zoneRules/activeRelease.ts`: `chooseActiveRelease({ bundled, stored })` → `{ release, source: BUNDLED | STORED, discardStored: boolean }`, pure. `loadZoneRules` (from the first change) becomes: read the repository synchronously (`localStorage` is synchronous, so no extra await before the app), fetch the bundled asset, call `chooseActiveRelease`, remove the stored document when `discardStored`, install the wrapper with the chosen release, and remember `{ release, source }` in `getInstalledRelease()` for the settings line and the check. A repository error counts as "no stored release". This keeps every zone fact behind `installZoneRulesDateTimeFormat`.

### D4. The check as one controller hook on the existing recheck (FR3, FR4, NFR-P1)

`src/controller/useZoneRulesUpdate.ts` takes a `ZoneRulesVersionSource` (port: `fetchVersion()`, `fetchRelease(name)`), the repository, a `Clock` and `navigator.onLine` (injected as `isOnline`). It runs `checkForUpdate()` once at mount and on each tick of `useUpdateRecheckOnReturn`, which is generalized to accept a second callback (or called twice with the same registration-independent signature: the hook today takes the registration; this change extracts its scheduling into `useRecheckOnReturn(onRecheck, clock)` and keeps `useUpdateRecheckOnReturn` as its first caller). `checkForUpdate`: if offline, return; `fetchVersion()`; parse the name (D1); compare with the active release and the stored release; if newer than both, `fetchRelease(name)`, parse with the release reader, `repository.write`, set `pendingRelease` in state. Every failure path returns silently and is reported nowhere (as the update check is, `ignoreFailedUpdateCheck`). The adapter `fetchZoneRulesVersionSource` uses `fetch(url, { cache: "no-cache" })` for the version file (a conditional request against the Pages ETag, which is how the 600 s `max-age` is bypassed) and a plain fetch for the immutable release file. URLs come from `ZONE_RULES_VERSION_PATH = "zone-rules/version.json"` and `ZONE_RULES_RELEASE_PATH(name)` under `APP_BASE_PATH`.

### D5. Notice and dismissal (FR7, UX1, UX2)

`AppShell` reads `pendingRelease` and `dismissedRelease` from `useZoneRulesUpdate` and renders `ZoneRulesUpdateNotice` in the notices region, after the update notice, with the same `Notice` block (Reload → `window.location.reload()`, Dismiss → `dismissedRelease = pendingRelease`). The notice is shown when `pendingRelease` is set and differs from `dismissedRelease`; both live in component state, so a dismissal lasts the page's life, and a newer stored release shows again. Strings: `app.zoneRulesReady` ("Time zone rules {{release}} are ready. Reload to use them." / «Доступны правила часовых поясов {{release}}. Перезагрузите, чтобы применить.»), reusing `app.reload` and `app.dismiss`.

### D6. Settings line next to the deploy time (FR8, UX3, NFR-R1)

`useZoneRulesRelease()` returns `getInstalledRelease().release`; `presentZoneRulesRelease(release, translate)` → the text; `ZoneRulesReleaseLine` renders it with the deploy time's classes (extract the shared class list into one constant next to `DeployTime`, so the two lines cannot drift). String `settings.zoneRulesRelease` ("Time zone rules: {{release}}" / «Правила часовых поясов: {{release}}»). Screenshots: the release text is hidden the way the deploy time is (same `data-screenshot-hidden` hook), baselines re-approved once.

### D7. Publication workflow and served files (FR1, FR2)

- `scripts/zoneRules/latestRelease.ts`: `findLatestRelease(indexHtml)` parses the `releases/` directory listing for `tzdata(\d{4}[a-z]+)\.tar\.gz` and returns the newest by D1 (Q1 of the proposal: the listing names released versions only; `tzdb/version` may name an unreleased one). The CLI `zone-rules:latest` prints it.
- `.github/workflows/zone-rules-publication.yml`: `on: schedule: cron "17 4 * * *"` (off the hour, GitHub's advice against load spikes) and `workflow_dispatch`; `permissions: contents: write`; steps: checkout, pnpm, `zone-rules:latest` → `latest`, read the committed release → `committed`, stop when equal (`::notice::already current`), `zone-rules:compile $latest` (needs `gpg`, `zic`, `tar`; all on `ubuntu-latest`), `zone-rules:check`, `pnpm test` of `src/test/zoneRules` (the release-shaped tests), `git commit -m "Update zone rules to $latest"` as `github-actions[bot]`, `git push`. A second job `deploy` with `needs: publish` and `if: needs.publish.outputs.updated == 'true'` runs `uses: ./.github/workflows/deploy.yml` (which gains `on: workflow_call`), because a `GITHUB_TOKEN` push fires no `push` workflow. The run's own commit keeps the repository active for the 60-day schedule rule; the operator still sees a failed run by GitHub's email.
- Served files: `zoneRulesPlugin` (first change) also emits `zone-rules/version.json` (`{ release, publishedAt: resolveDeployInstant() }`) and `zone-rules/<release>.json` (the same bytes as the hashed asset) as unhashed assets, and `vite.config.ts` adds `workbox.globIgnores: ["zone-rules/**"]`. The hashed asset stays precached and preloaded for the start; the unhashed files are the remote channel. `check-bundle-size.mjs` asserts the two files exist and are neither preloaded nor precached (reads `dist/sw.js` for the manifest).

### D8. Tests (FR1–FR9)

Unit and BDD with fakes: an in-memory version source (`createFakeZoneRulesVersionSource({ version, releases, failures })`), the in-memory repository, `createSwitchableClock`, `setPageVisibility`, and `isOnline` injected. The workflow's pure parts (`findLatestRelease`, the "already current" decision) are unit-tested; the YAML is checked with `actionlint` and by its first run. E2E (Chromium): `page.route` serves a `version.json` one letter above the bundled release and a release file copied from the build with its `release` field renamed; the notice appears; after `page.reload()` the settings page names the new release and Almaty's offset follows a deliberately altered rule in that file (`+04:00`), which proves the stored release is active.

## Consequences

Positive:

- Freshness is bounded by IANA plus one day and one reload; no app release is needed for a rules change.
- Every step is a pure function or a port with a fake; the no-downgrade rule is one comparison in one module.
- The published files ride the existing Pages deploy; no server, no third party.

Negative (risks, each with its mitigation):

- [GitHub Pages caches every file for 600 s and allows no headers] → the version file is fetched with `cache: "no-cache"` (a conditional request), and a check happens at most every 15 minutes anyway; a release may be visible up to 10 minutes late, which the one-day cadence absorbs.
- [A `GITHUB_TOKEN` push triggers no deploy] → the publication workflow calls the deploy workflow itself (D7).
- [The schedule is disabled after 60 idle days] → the workflow's own commits are activity only when releases happen; the operator is told in the README of the workflow to re-enable it, and `workflow_dispatch` always works. Accepted.
- [A release file is served before the matching app build is live, or after] → the release file is self-contained and the app validates its shape and name; an app can use any newer release regardless of which build it came with.
- [A user with an old installed app downloads a release whose format a future change has altered] → the envelope and the release document carry versions; an unparsable release is ignored (FR4), and a format change bumps `schemaVersion` with a migration (ADR-0004).
- [`localStorage` quota on iOS 12 with a 60 KB document] → far below the 5 MB limit; a failed write is `storage unavailable` and the notice is still shown (FR9).
- [Two notices at once crowd the region] → both use the one-line `Notice` block and stack; UX2 accepts it, the E2E scenario checks neither covers the heading.

## Alternatives Considered

**D2 — localStorage over IndexedDB.** IndexedDB is asynchronous and would force an `await` before the wrapper is installed at boot; `localStorage` is synchronous and already the store of ADR-0004. Rejected IndexedDB for now.

**D3 — Applying a downloaded release live.** The polyfill memoizes zone objects and their offsets for the page's life; a live swap would leave existing rows stale. Rejected (NG1); Reload is the Android pattern (apply at restart).

**D4 — Polling on a timer.** Wakes hidden pages and runs offline; the existing visibility-based recheck already encodes the right cadence. Rejected. Checking only at start: an installed iOS PWA is never restarted (ADR-0009), so it would never update. Rejected.

**D7 — Pull request instead of a direct commit.** Safer for code, but the data is machine-produced and machine-verified by `zdump`, and a PR would wait for a human for a change that is urgent by nature. Rejected (NG3); the check is the gate. A dedicated token (PAT) to trigger the deploy by push: a secret to rotate; calling the deploy workflow needs none. Rejected. Publishing the release files to a separate branch or bucket: a second deploy path to keep alive. Rejected.

**D7 — Release discovery.** `tzdb/version`: names the development version, which can be ahead of the last release; the `-latest` archive: lagging caches and a once-wrong `version` file. Rejected in favour of the releases listing.

**D6 — Showing the pending release too.** "2026c (2026d after reload)" doubles the texts and the states for a fact the notice already states. Rejected (Q3).

## Migration Plan

A new storage key; existing documents untouched. First deploy publishes the files and the workflow; the first scheduled run either stops as current or commits a newer release. Rollback: revert the change; a stored release document left behind is ignored by a build without this change (unknown key) and can be removed by a later cleanup.

## Open Questions

- The cron hour (`17 4 * * *` UTC) can be changed without touching specs or tasks.

## Sources

- Android Time Zone Data module (release ordering, no downgrade, apply at restart): https://source.android.com/docs/core/ota/modular-system/timezone
- GitHub Actions schedule caveats (delays, disabled after 60 days): https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#schedule
- `GITHUB_TOKEN` pushes trigger no workflow runs: https://docs.github.com/actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow
- GitHub Pages caching: https://docs.github.com/pages (600 s `max-age`, no custom headers)
- IANA releases listing: https://data.iana.org/time-zones/releases/; `-latest` and `version` lag: https://lists.iana.org/hyperkitty/list/tz@iana.org/thread/NVHSX2PAQIT44U5FCCEVNJJYXQMMTJSA/
- Elixir `tz` daily update and Python `tzdata` maintainer guide: https://preview.hex.pm/preview/tz/0.26.5/show/lib/tz/update_periodically.ex, https://tzdata.python.org/maintaining.html
- `@tubular/time` polling (at most hourly, listeners report changed / unchanged / error): https://github.com/kshetline/tubular_time
