# Design: Add remote zone rules updates

## Context

Driven by FR1–FR9, NFR-P1, NFR-P2, NFR-A1, NFR-R1 and UX1–UX3 of `proposal.md`, and by ADR-0014 items 5 and 6. Follows ADR-0002 (layers), ADR-0004 (envelope, ports, contract tests), ADR-0008 (work is counted, never timed) and ADR-0009 (boot order, update recheck). Builds on the landed `add-zone-rules-from-iana`. Current state, checked in `packages/client/` and `.github/`:

- Boot: `src/boot.ts` calls `bootApp` (`src/lib/legacy/bootApp.ts`) with `loadZoneRules: () => loadZoneRules(zoneRulesUrl)`; `zoneRulesUrl` comes from `virtual:zone-rules-url`. `loadZoneRules(releaseUrl, fetchRelease)` (`src/lib/zoneRules/loadZoneRules.ts`) fetches the asset, reads it with `parseZoneRulesRelease` and calls `installZoneRulesDateTimeFormat`; a failure rejects and `bootApp` logs it and starts the app on the engine's data. `getInstalledRelease()` (`installZoneRules.ts`) returns the installed `ZoneRulesRelease` (`{ release, zones }`) and has no caller outside `src/lib/zoneRules/`. Nothing may evaluate Temporal before the wrapper is installed; `src/adapters/index.ts` re-exports adapters that import the model, so `boot.ts` cannot import it.
- Release names: the reader accepts any string as `release`; the compiler (`scripts/zoneRules/compile.ts`) checks its argument with its own `RELEASE_NAME = /^\d{4}[a-z]$/` (one letter only). The compiler downloads from `IANA_RELEASES_URL = "https://data.iana.org/time-zones/releases/"` (`downloadRelease.ts`). Scripts import the reader through `../../src/lib/zoneRules/core/index.ts`. The committed release is `zone-rules/release.json` (`ZONE_RULES_RELEASE_FILE` in `app.config.ts`), release `2026f`, 105 590 bytes.
- Update recheck: `src/controller/useUpdateRecheckOnReturn.ts` runs `registration.update()` on `visibilitychange` at most once per `UPDATE_RECHECK_INTERVAL_MS` (`src/constants/update.ts`) with an injected `Clock`, swallowing failures (`ignoreFailedUpdateCheck`). `usePwaUpdateStatus(clock)` returns `isUpdateAvailable` and `applyUpdate` (`updateServiceWorker(true)`).
- Shell: `src/app/AppShell.tsx` (168 lines) renders the notices region: `UpdateNotice` (built on `Notice` + `NoticeButton`; `Notice` dismisses on Esc), `OfflineReadyNotice`, `StorageWarning`, `MeetingShareNotice`. `app.reload` and `app.dismiss` exist in `src/locales/en.json`. `app_shell_notices.steps.ts` is 273 lines, so new notice tests go into new files.
- Storage: `STORAGE_KEYS` (`src/constants/storage.ts`) holds `LOCATIONS` and `PREFERENCES`; ports live in `src/ports/` (`locationRepository.ts`: `load()` → `LocationsLoadStatus.LOADED | EMPTY | UNREADABLE`, `save`/`clear` → `SaveOutcome`), adapters and shared contract suites in `src/adapters/` (`locationRepository.contract.ts`). `useStorageAvailability` drives `StorageWarning`.
- Settings: `src/app/settings/SettingsPage.tsx` renders `DeployTime` (`<p data-deploy-time className="text-center text-sm text-accent">`) last; `DeployTime.test.tsx` asserts "should be the last element of main". Screenshots hide its text with `DEPLOY_TIME_SCREENSHOT_STYLE = "[data-deploy-time] { visibility: hidden; }"` in `src/test/features/locations/steps/locations_layout_e2e.steps.ts`.
- Build: `vite.config.ts` registers `zoneRulesPlugin()` and Workbox with `globPatterns: ["**/*.{js,mjs,css,html,ico,png,svg,json,woff2}"]`, so any emitted JSON is precached today; `resolveDeployInstant()` (`scripts/deployInstant/`) gives the build instant. `scripts/check-bundle-size.mjs` checks the initial JavaScript and the hashed `assets/zone-rules-*.json` against `ZONE_RULES_ASSET_BUDGET_KB`. E2E runs on `pnpm build && pnpm preview` (`playwright.bdd.config.ts`). Runtime code can read the build's base path as `import.meta.env.BASE_URL` (`vite/client` types are referenced in `src/vite-env.d.ts`).
- Workflows: `deploy.yml` runs on `push` to `main` and `workflow_dispatch`, calls `ci.yml` (`workflow_call`, input `upload-pages-artifact`) whose `actions/checkout@v5` checks out the triggering commit, then deploys to Pages. A push made with `GITHUB_TOKEN` triggers no workflow. GitHub Pages serves every file with `Cache-Control: max-age=600`.

## Decision

### D1. Release order: one owner in the core (FR5)

`src/lib/zoneRules/core/releaseOrder.ts`: `parseReleaseName(text)` → `{ year, letters }` or `undefined` (pattern `ZONE_RULES_RELEASE_NAME_PATTERN = /^\d{4}[a-z]+$/` in `core/zoneRulesConstants.ts`), `compareReleaseNames(left, right)` → negative, zero or positive: year, then letter count, then letters; `isNewerRelease(candidate, current)`. Exported through `core/index.ts`. Callers: the check (D4), the start (D3), `latestRelease.ts` (D7) and `compile.ts`, whose `RELEASE_NAME` is replaced by `parseReleaseName`.

### D2. Stored release behind a repository port (FR6, FR9)

Port `src/ports/storedReleaseRepository.ts`, shaped like `LocationRepository` and synchronous: `load()` → `{ status: StoredReleaseLoadStatus.LOADED, release: ZoneRulesRelease, document: unknown } | EMPTY | UNREADABLE`; `save(document)` → `SaveOutcome`; `clear()` → `SaveOutcome`. `save` takes the release JSON as downloaded (the parsed `ZoneRulesRelease` holds a `Map` and does not serialize). Adapters in a sub-module `src/adapters/storedRelease/` with its own `index.ts` (as `adapters/city-search/` has): `localStorageStoredReleaseRepository` (key `STORAGE_KEYS.ZONE_RULES = "time-zones:zone-rules"`, envelope `{ schemaVersion: STORED_RELEASE_SCHEMA_VERSION (1), payload }`; invalid JSON, a missing or other schema version, or a payload `parseZoneRulesRelease` rejects → `UNREADABLE`; a throwing `localStorage` → `UNREADABLE` on load and `FAILED` on write) and `createInMemoryStoredReleaseRepository`. The sub-module imports only `@/lib/zoneRules`, `@/constants` and `@/ports`, so `boot.ts` can import `@/adapters/storedRelease` without evaluating Temporal; `src/adapters/index.ts` re-exports it for the controller. One contract suite `storedReleaseRepository.contract.ts` runs against both.

ADR-0004 asks for an error state with a reset action on invalid data and for broadcasting writes to other tabs. The stored release is a cached copy of a published file, not user data: discarding it loses nothing, and other tabs learn of it at their next check (D4). This exception is global to persistence, so it is not settled here: H1 hands the amendment of ADR-0004 to a human.

### D3. Active release at start (FR6, NFR-P2)

`src/lib/zoneRules/activeRelease.ts`: `chooseActiveRelease({ bundled, stored })`, pure, both `ZoneRulesRelease | undefined` → `{ active: ZoneRulesRelease | undefined, shouldClearStored: boolean }`: stored newer than bundled (or bundled missing) → stored; otherwise bundled, and `shouldClearStored` when a stored release exists. `loadZoneRules(releaseUrl, { storedReleases, fetchRelease })` reads `storedReleases.load()` once before the fetch (an `UNREADABLE` result is cleared and counts as none), fetches and reads the bundled asset (a failure counts as none), chooses, clears when told, installs the chosen release, and rejects only when nothing could be installed (so `bootApp` keeps its log). `boot.ts` passes `localStorageStoredReleaseRepository`. The active release for every later reader stays `getInstalledRelease()`; no second "active release" state is added.

### D4. The check: one controller hook on the shared recheck (FR3, FR4, FR9, NFR-P1)

- `src/controller/useRecheckOnReturn.ts`: the scheduling of `useUpdateRecheckOnReturn` extracted as `useRecheckOnReturn({ onRecheck, clock, isEnabled })`; `useUpdateRecheckOnReturn` becomes its caller with unchanged behaviour and tests.
- Port `src/ports/zoneRulesVersionSource.ts`: `fetchVersion()` → `{ release: string }` or `ZoneRulesSourceFailure`; `fetchRelease(name)` → the release JSON (`unknown`) or `ZoneRulesSourceFailure` (enum `REQUEST_FAILED`, `UNPARSABLE`); never throws. Adapters `src/adapters/fetchZoneRulesVersionSource.ts` (`fetch(url, { cache: "no-cache" })` for the version file, a conditional request that beats the 600 s `max-age`; a plain `fetch` for the release file, whose name changes with its content; URLs `${import.meta.env.BASE_URL}${ZONE_RULES_VERSION_PATH}` and `${BASE_URL}${ZONE_RULES_RELEASE_DIRECTORY}<name>.json`, constants in `src/constants/zoneRules.ts`) and `src/adapters/inMemoryZoneRulesVersionSource.ts` (counts requests, scripted failures); contract `zoneRulesVersionSource.contract.ts`.
- `src/controller/useZoneRulesUpdate.ts`: `useZoneRulesUpdate({ clock, versionSource, storedReleases, isOnline = () => navigator.onLine, getActiveRelease = getInstalledRelease })` → `{ readyRelease: string | undefined, dismiss() }`. A check at mount and on each recheck: no active release or offline → return; `fetchVersion`; invalid name or not newer than the active release → return; `storedReleases.load()` names it → `readyRelease`; else `fetchRelease`, `parseZoneRulesRelease`, name must equal → `save` (a `FAILED` save still sets `readyRelease`) → `readyRelease`. Every failure returns silently. Dismissal (`dismissedRelease` in hook state) hides the notice until a newer `readyRelease`.

### D5. Notice and its Reload (FR7, UX1, UX2)

`src/app/ZoneRulesUpdateNotice.tsx` on `Notice` + `NoticeButton`, message `app.zoneRulesReady` with `{{release}}`, reusing `app.reload`. `AppShell` (optional props `zoneRulesVersionSource`, `storedReleases`, `reloadPage`, defaulting to the real adapters and `() => window.location.reload()`) renders it after the update or offline-ready notice. Reload calls `applyUpdate` when `isUpdateAvailable` (a plain reload would leave the waiting service worker waiting), else `reloadPage`; the update notice's Reload already restarts the page, which applies the stored release. To keep `AppShell.tsx` under 200 lines, the wiring sits in a small `src/app/ZoneRulesUpdateNoticeSlot.tsx`.

### D6. Release line after the deploy time (FR8, UX3, NFR-R1)

`src/presenter/zoneRulesRelease.ts`: `presentZoneRulesRelease(release, translate)` → text. `src/controller/useZoneRulesRelease.ts` reads `getInstalledRelease()?.release` and presents it. `src/app/settings/ZoneRulesReleaseLine.tsx` renders `<p data-zone-rules-release>` with `SETTINGS_FOOTNOTE_CLASS_NAME`, one constant shared with `DeployTime` so the two lines cannot drift, and nothing when no release is active. String `settings.zoneRulesRelease`. Screenshots hide its text as the deploy time's (the release name changes with every publication, which would otherwise break the baselines each time).

### D7. Served files and publication (FR1, FR2)

- `scripts/zoneRules/servedZoneRulesFiles.ts`: `buildServedZoneRulesFiles(releaseText, deployInstant)` → `[{ fileName: "zone-rules/version.json", source }, { fileName: "zone-rules/<release>.json", source: releaseText }]`. `zoneRulesPlugin({ deployInstant })` emits them in a build (`emitFile` with a fixed `fileName`); `vite.config.ts` passes the one `resolveDeployInstant()` value and adds `workbox.globIgnores: ["zone-rules/**"]` (the hashed `assets/zone-rules-*.json` stays precached for offline start). `scripts/zoneRules/precacheExclusion.ts`: `findPrecachedZoneRulesFiles(serviceWorkerText)`; `check-bundle-size.mjs` fails when the two files are missing or listed.
- `scripts/zoneRules/latestRelease.ts`: `findNewestListedRelease(listingHtml)` (names from `tzdata(\d{4}[a-z]+)\.tar\.gz`, newest by D1) and `findReleaseToPublish(listingHtml, committedRelease)` → the name or `undefined`. CLI (script `zone-rules:latest`) fetches `IANA_RELEASES_URL`, reads the committed release, prints `already current` or the name, and writes `release=<name>` to `$GITHUB_OUTPUT` when set.
- Workflow (H2): `.github/workflows/zone-rules-publication.yml`, `schedule: cron "17 4 * * *"` and `workflow_dispatch`; job `publish` (`contents: write`): checkout, pnpm install, `zone-rules:latest`, then only for a name: `zone-rules:compile <name>`, `zone-rules:check`, `pnpm test`, commit `Update zone rules to <name>` as `github-actions[bot]`, push, output the new commit SHA. Job `deploy` (`needs: publish`, `if` a name was published) `uses: ./.github/workflows/deploy.yml` with `ref: <sha>` and the permissions the deploy needs. `deploy.yml` gains `workflow_call` with input `ref` passed to `ci.yml`, which gains input `ref` for its checkout; without it a called run would deploy the commit that triggered the schedule, not the new one.

## Consequences

Positive:

- Freshness is bounded by IANA plus one day and one reload, without an app release.
- Each step has one owner and a fake: release order, stored release port, version source port, the check hook; no downgrade is one comparison in one module.
- The files ride the existing Pages deploy; no server, no third party.

Negative (with mitigations):

- [Pages caches files for 600 s] → `cache: "no-cache"` revalidates; at most 10 minutes of delay, absorbed by the daily cadence.
- [A `GITHUB_TOKEN` push triggers no deploy] → the workflow calls the deploy itself with the new commit as `ref`.
- [Schedules stop after 60 idle days] → the operator notes in `zone-rules/README.md` say how to re-enable; `workflow_dispatch` always works; H3 checks the first run.
- [A future release format an old app cannot read] → the reader rejects it (FR4) and the app stays on what it has; a format change bumps the envelope's schema version with a migration (ADR-0004).
- [`localStorage` quota on iOS 12] → the document is about 106 KB, far below the 5 MB limit; a failed write still shows the notice (FR9).
- [Two notices crowd the region] → both are one-line `Notice` blocks; the E2E scenario checks the heading stays visible.

## Alternatives Considered

**IndexedDB for the stored release**: asynchronous, adding a wait before the wrapper at boot; `localStorage` is synchronous and already ADR-0004's store. Rejected.

**Applying a downloaded release live**: the polyfill memoizes zones for the page's life, leaving rows stale. Rejected (NG1); Reload is the Android pattern.

**A timer for checks**: wakes hidden pages and runs offline. Rejected. **Checking only at start**: an installed iOS PWA is never restarted (ADR-0009). Rejected.

**Broadcasting the stored release to other tabs**: a second channel for a rare event; each tab finds the stored release at its next check and shows the notice without a download (D4). Rejected.

**A pull request per release**: waits for a human on an urgent, machine-verified change. Rejected (NG3). **A personal access token so the push triggers the deploy**: a secret to rotate. Rejected.

**`tzdb/version` or the `-latest` archive for discovery**: the first names development versions, the second has lagged. Rejected for the releases listing.

**Showing a pending release on the settings page**: doubles texts and states for what the notice says. Rejected (Q3).

## Migration Plan

A new storage key; existing documents untouched. Rollback: revert; a leftover `time-zones:zone-rules` document is ignored by a build without this change.

## Sources

- Android Time Zone Data module: https://source.android.com/docs/core/ota/modular-system/timezone
- GitHub Actions schedules (delays, disabled after 60 days): https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#schedule
- `GITHUB_TOKEN` pushes trigger no runs: https://docs.github.com/actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow
- IANA releases listing: https://data.iana.org/time-zones/releases/; `-latest` lag: https://lists.iana.org/hyperkitty/list/tz@iana.org/thread/NVHSX2PAQIT44U5FCCEVNJJYXQMMTJSA/
- Elixir `tz`, Python `tzdata`: https://preview.hex.pm/preview/tz/0.26.5/show/lib/tz/update_periodically.ex, https://tzdata.python.org/maintaining.html
- `@tubular/time`: https://github.com/kshetline/tubular_time
