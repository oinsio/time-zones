# Review: add-remote-zone-rules-updates

## Summary

| Item | Value |
|---|---|
| Tasks verified | 38/39 |
| Requirements traced | 80/86 |
| CRITICAL | 1 |
| WARNING | 0 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 — `STORAGE_KEYS.ZONE_RULES` in `packages/client/src/constants/storage.ts:8`; `ZONE_RULES_VERSION_PATH`, `ZONE_RULES_RELEASE_DIRECTORY`, `ZONE_RULES_RELEASE_FILE_EXTENSION`, `STORED_RELEASE_SCHEMA_VERSION` in `src/constants/zoneRules.ts:5-14`, exported from `src/constants/index.ts:168-173`; `ZONE_RULES_RELEASE_NAME_PATTERN` in `src/lib/zoneRules/core/zoneRulesConstants.ts:63`.
- ✅ 1.2 — `app.zoneRulesReady` and `settings.zoneRulesRelease` in `src/locales/en.json:13,151` and `src/locales/ru.json:13,151`, with the wording FR7/FR8 give.
- ✅ 1.3 — `docs/glossary/zone-rules.md` has 15 entries (`grep -c "^- \*\*"` = 15); `docs/glossary/app-shell.md:10-11` (Update recheck names `useRecheckOnReturn`, Zone rules update notice); `docs/glossary/settings.md` has Zone rules release line; `docs/architecture/overview.md:76,84` name the publication scripts and the active release.
- ✅ 2.1 — `src/lib/zoneRules/core/releaseOrder.ts:15-54` (`parseReleaseName`, `compareReleaseNames`, `isNewerRelease`), exported from `core/index.ts`; `releaseOrder.test.ts` covers pairs, both directions, self and invalid names; Stryker 100%.
- ✅ 2.2 — `scripts/zoneRules/compile.ts:38` uses `parseReleaseName`, `RELEASE_NAME` removed; `src/test/zoneRules/compile.stops.test.ts:148-150` accepts `2026aa` and `2026fx`.
- ✅ 2.3 — `src/test/features/zone_rules_updates/zone_rules_updates_release_order.feature` ("Ordered pairs", "Invalid names") with `steps/zone_rules_updates_release_order.steps.ts`.
- ✅ 3.1 — port `src/ports/storedReleaseRepository.ts:28`; sub-module `src/adapters/storedRelease/` (`index.ts`, `localStorageStoredReleaseRepository.ts`, `inMemoryStoredReleaseRepository.ts`); contract `src/adapters/storedReleaseRepository.contract.ts` run by `storedReleaseRepository.test.ts`; adapter-only cases in `storedRelease/localStorageStoredReleaseRepository.test.ts`.
- ✅ 3.2 — `src/adapters/storedRelease/storedRelease.imports.test.ts` checks the sub-module's imports.
- ✅ 4.1 — `src/lib/zoneRules/activeRelease.ts:14-31` with `activeRelease.test.ts`; Stryker 100%.
- ✅ 4.2 — `src/lib/zoneRules/loadZoneRules.ts:39-67` reads storage once, fetches, chooses, clears, installs, rejects only with nothing installed; `src/boot.ts:16-19` passes `localStorageStoredReleaseRepository`; cases in `loadZoneRules.stored.test.ts:45-113` (newer, older/equal, unreadable, failed fetch with stored, failed fetch without, one read and one fetch).
- ✅ 4.3 — `zone_rules_updates_active_release.feature` (five scenarios) with `steps/zone_rules_updates_active_release.steps.ts`.
- ✅ 4.4 — measured in this review: `releaseOrder.ts` 100%, `activeRelease.ts` 100%, `loadZoneRules.ts` 95.83%, `localStorageStoredReleaseRepository.ts` 96.67%, `inMemoryStoredReleaseRepository.ts` 100%.
- ✅ 5.1 — `src/controller/useRecheckOnReturn.ts:26-59`; `useUpdateRecheckOnReturn.ts:16-30` calls it; `useRecheckOnReturn.test.tsx:32-50` (16 min, 5 min, disabled, counted from enable).
- ✅ 5.2 — port `src/ports/zoneRulesVersionSource.ts`; adapters `src/adapters/fetchZoneRulesVersionSource.ts:47-70` (`cache: "no-cache"` only on the version request, line 55) and `inMemoryZoneRulesVersionSource.ts`; contract `zoneRulesVersionSource.contract.ts` run by `zoneRulesVersionSource.test.ts`; `fetchZoneRulesVersionSource.test.ts`.
- ✅ 5.3 — `src/controller/useZoneRulesUpdate.ts:41-95`, exported from `src/controller/index.ts`; `useZoneRulesUpdate.test.tsx:25-160` and `useZoneRulesUpdate.failures.test.tsx:58-89` cover newer, not newer, already stored, no active release, offline, the 6 failures, failed save, recheck 16/5 min, dismissal.
- ✅ 5.4 — `zone_rules_updates_check.feature` and `zone_rules_updates_stored_release.feature` with `steps/zone_rules_updates_check.steps.tsx` and `steps/zone_rules_updates_stored_release.steps.tsx` (the spec's "Stored release document" and "Dismissed notice stays dismissed" scenarios live in the second file).
- ❌ 5.5 — ticked `[x]` at `tasks.md:40` but not done: the task demands score ≥ 95% (minimum 90%) on its listed files, and `useUpdateRecheckOnReturn.ts` scores 87.50% (7 killed, 1 survived; re-measured in this round, see R1, CRITICAL). The other four files: `useZoneRulesUpdate.ts` 100%, `useRecheckOnReturn.ts` 100%, `fetchZoneRulesVersionSource.ts` 97.30%, `inMemoryZoneRulesVersionSource.ts` 100%.
- ✅ 6.1 — `src/app/ZoneRulesUpdateNotice.tsx`, `src/app/ZoneRulesUpdateNoticeSlot.tsx:50-64` (Reload = `applyUpdate` when an update waits, else `reloadPage`), wired in `src/app/AppShell.tsx:99-104,144-150`; tests `src/app/AppShell.zoneRules.test.tsx`.
- ✅ 6.2 — `app_shell/app_shell_zone_rules_notice_unit.feature` (names, reloads, reloads with waiting update, dismisses, both notices, Russian) with `steps/app_shell_zone_rules_notice_unit.steps.tsx`.
- ✅ 6.3 — `app_shell/app_shell_zone_rules_notice_e2e.feature` (notice appears, keyboard, Escape, axe light/dark) with `steps/app_shell_zone_rules_notice_e2e.steps.ts`.
- ✅ 6.4 — measured: `ZoneRulesUpdateNotice.tsx` 100%, `ZoneRulesUpdateNoticeSlot.tsx` 100%, `AppShell.tsx` 97.40%.
- ✅ 7.1 — `src/presenter/zoneRulesRelease.ts`, `src/controller/useZoneRulesRelease.ts`, `src/app/settings/ZoneRulesReleaseLine.tsx` after `DeployTime` in `SettingsPage.tsx:143`; `SETTINGS_FOOTNOTE_CLASS_NAME` in `src/constants/preferences.ts:83` used by both lines; tests `zoneRulesRelease.test.ts`, `ZoneRulesReleaseLine.test.tsx`, `DeployTime.test.tsx:47`.
- ✅ 7.2 — `settings/settings_zone_rules_release_unit.feature` (three scenarios) with its steps file.
- ✅ 7.3 — `settings/settings_zone_rules_release_e2e.feature` (accent colour + not a Tab stop + axe in both themes, one line at 375 px EN/RU, 320 px no scroll) with its steps file.
- ✅ 7.4 — `locations_layout_e2e.steps.ts` style is `[data-deploy-time], [data-zone-rules-release] { visibility: hidden; }` with the NFR-R1 comment; tags added in `settings_e2e.feature` and `settings_language_e2e.feature`. No PNG changed: the 800 px-high viewport baselines show the hidden lines as empty background below the language group (e.g. `__screenshots__/chromium/Approved-screenshots-of-the-settings-at-1024-px-in-the-light-theme.png`), so the baselines pass unchanged in CI's `test:bdd`.
- ✅ 7.5 — measured: `zoneRulesRelease.ts` 100%, `useZoneRulesRelease.ts` 100%, `ZoneRulesReleaseLine.tsx` 100%, `DeployTime.tsx` 100%.
- ✅ 8.1 — `scripts/zoneRules/latestRelease.ts:25-100` (`findNewestListedRelease`, `findReleaseToPublish`, CLI); `package.json` script `zone-rules:latest`; `src/test/zoneRules/latestRelease.test.ts`.
- ✅ 8.2 — `scripts/zoneRules/servedZoneRulesFiles.ts`, `precacheExclusion.ts`, `servedReleaseFiles.ts`; `zoneRulesPlugin.ts` `generateBundle` emits both files; `vite.config.ts` uses one `DEPLOY_INSTANT` and `globIgnores: [ZONE_RULES_PRECACHE_IGNORE_PATTERN]`; `scripts/check-bundle-size.mjs:168-186` fails on missing or precached files; tests `servedZoneRulesFiles.test.ts`, `precacheExclusion.test.ts`, `servedReleaseFiles.test.ts`.
- ✅ 8.3 — `src/test/installZoneRules.test.ts` compares with `committedRelease.release` and `parseReleaseName`; same for `zoneRulesPlugin.virtualModules.test.ts`, `zone_rules_release.steps.ts`, `zoneAbbreviationsWorld.ts`; the reworded scenarios of `zone_rules_release.feature` and `zone_abbreviations_unit.feature` carry `@add-remote-zone-rules-updates @FR1`.
- ✅ 8.4 — `zone_rules_updates_publication.feature` (newest, already current, newer, files in build, not precached) with `steps/zone_rules_updates_publication.steps.ts`.
- ✅ 8.5 — `packages/client/zone-rules/README.md` (41 new lines) names `zone-rules-publication`, manual dispatch, re-enabling the schedule, failed runs and the zdump/content/abbreviation pins.
- ✅ 9.1 — `zone_rules_updates/zone_rules_updates_delivery_e2e.feature` (served and not precached; newer release delivered, reload, settings names it, Almaty UTC+4; offline reload without a version request) with `steps/zone_rules_updates_delivery_e2e.steps.ts`.
- ✅ 10.1 — `temporary-docs/gnomish/github-oinsio-time-zones-123/handoff/H1-adr-0015-cached-published-data.patch`; `git apply --check` passes; README `## H1`.
- ✅ 10.2 — `handoff/H2-zone-rules-publication-workflow.patch` adds `zone-rules-publication.yml`, `workflow_call` + `ref` in `deploy.yml`, `ref` for the `check` job checkout in `ci.yml` (the job that uploads the Pages artifact); `git apply --check` passes; README `## H2`.
- ✅ 10.3 — `handoff/README.md` has exactly one `## H3`.
- ✅ 11.1 — CI is green for the branch (lint, typecheck, test, build, bundle size, legacy build); the scoped Stryker runs of this review ran the suite without failures.
- ✅ 11.2 — `ci.yml:63` runs `test:bdd` in CI, green; screenshot baselines pass (see 7.4).
- ✅ 11.3 — the traceability loop of the task, run from the root, prints nothing.
- ✅ 11.4 — new names (`useZoneRulesUpdate`, `ZoneRulesVersionSource`, `StoredReleaseRepository`, `chooseActiveRelease`, `compareReleaseNames`, `ZoneRulesUpdateNotice`, `ZoneRulesReleaseLine`, `app.zoneRulesReady`, `settings.zoneRulesRelease`) are glossary terms; `grep -rniE "auto-update|autoupdate" packages/client/src` prints nothing.

## Requirements

- ⚠️ FR1 — in-repo parts implemented and tested: release decision `scripts/zoneRules/latestRelease.ts:25-50` (`latestRelease.test.ts`, `zone_rules_updates_publication.feature`), compiler accepts every valid name (`compile.ts:38`), tests independent of the committed name (task 8.3). The workflow itself is only in the H2 handoff patch (the factory may not write `.github/`), so the schedule, commit and deploy are not in the repository until a human applies it; no code finding.
- ✅ FR2 — `servedZoneRulesFiles.ts:16-31`, `zoneRulesPlugin.ts` `generateBundle`, `vite.config.ts` `globIgnores`, `check-bundle-size.mjs:168-186`; tests `servedZoneRulesFiles.test.ts`, `precacheExclusion.test.ts`, delivery E2E scenario 1.
- ✅ FR3 — `useZoneRulesUpdate.ts:52-88` (online + active release guard, version, newer check, stored shortcut, download, name check, save); `fetchZoneRulesVersionSource.ts:54-56` `cache: "no-cache"`; `useZoneRulesUpdate.test.tsx`, `zone_rules_updates_check.feature`.
- ✅ FR4 — every failure returns silently (`useZoneRulesUpdate.ts:56,58,70,71`); `useZoneRulesUpdate.failures.test.tsx:58`, "Failures change nothing" outline (6 cases), delivery E2E offline scenario.
- ✅ FR5 — `releaseOrder.ts`; `releaseOrder.test.ts`, `zone_rules_updates_release_order.feature`, compiler acceptance test `compile.stops.test.ts:148`.
- ✅ FR6 — `activeRelease.ts`, `loadZoneRules.ts:43-66`; `loadZoneRules.stored.test.ts`, `zone_rules_updates_active_release.feature`.
- ✅ FR7 — `ZoneRulesUpdateNotice.tsx`, `ZoneRulesUpdateNoticeSlot.tsx`, dismissal in `useZoneRulesUpdate.ts:90-94`; `AppShell.zoneRules.test.tsx`, unit and E2E notice features.
- ✅ FR8 — `ZoneRulesReleaseLine.tsx`, `useZoneRulesRelease.ts`, `presentZoneRulesRelease`; `ZoneRulesReleaseLine.test.tsx`, `settings_zone_rules_release_unit.feature`.
- ✅ FR9 — envelope in `localStorageStoredReleaseRepository.ts:67-75`; failed save not shown and not re-downloaded (`useZoneRulesUpdate.ts:67,72-75`); `useZoneRulesUpdate.failures.test.tsx:68-77`, `zone_rules_updates_stored_release.feature`.
- ✅ NFR-P1 — one version request plus at most one release request (`useZoneRulesUpdate.test.tsx:25-47` count requests); bundle and asset budgets enforced by `check-bundle-size.mjs`, green in CI.
- ✅ NFR-P2 — one `load()` before the fetch, no extra request (`loadZoneRules.ts:43`; `loadZoneRules.stored.test.ts:103`, "No stored release" scenario).
- ✅ NFR-A1 — axe in both themes in `app_shell_zone_rules_notice_e2e.feature` and `settings_zone_rules_release_e2e.feature`.
- ✅ NFR-R1 — 375 px one-line and 320 px scenarios in `settings_zone_rules_release_e2e.feature`; screenshot style hides the line (`locations_layout_e2e.steps.ts`).
- ✅ UX1 — notice built on `Notice` + `NoticeButton` (`ZoneRulesUpdateNotice.tsx:23-29`); heading-in-viewport step in the E2E keyboard scenario.
- ✅ UX2 — both notices and the shared Reload: `ZoneRulesUpdateNoticeSlot.tsx:61`; unit scenarios "Both notices at once", "User reloads with a waiting update".
- ✅ UX3 — shared `SETTINGS_FOOTNOTE_CLASS_NAME`; `ZoneRulesReleaseLine.test.tsx` "same class list"; E2E computed colour equals the deploy time's.
- ✅ M1 — the task 11.3 loop prints nothing: all 16 ids are named with the change under `packages/client/`.
- ✅ M2 — delivery E2E "A newer release is delivered and used after a reload" asserts the notice, the reload, `Time zone rules: <release>` on settings and `UTC+4` for Almaty (`zone_rules_updates_delivery_e2e.steps.ts`).
- ✅ M3 — 6 pairs both ways and against themselves plus 4 invalid names in `releaseOrder.test.ts` and `zone_rules_updates_release_order.feature`.
- ✅ M4 — 6 failure cases with no notice and no write (`zone_rules_updates_check.feature` outline, `useZoneRulesUpdate.failures.test.tsx:58`); older and equal stored release removed at start (`loadZoneRules.stored.test.ts:57`).
- ✅ M5 — `check-bundle-size.mjs:168-186` checks the built files and the precache in CI; delivery E2E scenario 1 checks the served files and `sw.js`.
- ❌ M6 — measured on 20 new or changed `src/` modules: all ≥ 95% except `useUpdateRecheckOnReturn.ts` at 87.50%, below the 90% minimum (R1, CRITICAL).
- ⚠️ M7 — `actionlint` and the first dispatch are H2/H3 human steps; not measurable in the sandbox.
- ✅ Scenario: The newest release in the listing — `zone_rules_updates_publication.feature` + `latestRelease.test.ts` (`2026aa`).
- ✅ Scenario: Already current — publication outline with `2026f`/`2026g`; CLI prints `already current` in `latestRelease.test.ts`.
- ⚠️ Scenario: A newer release — the decision `2026g` is tested (publication feature); compile, commit and deploy happen only in the H2 workflow patch.
- ⚠️ Scenario: The check fails — only in the H2 workflow (`zone-rules:check` step before the commit); no automated test in the repo, by design.
- ⚠️ Scenario: Manual dispatch — `workflow_dispatch` only in the H2 patch.
- ✅ Scenario: Files in the build — publication feature "Files in the build", `servedZoneRulesFiles.test.ts`, `check-bundle-size.mjs`.
- ✅ Scenario: Not precached — publication feature "Not precached", `precacheExclusion.test.ts`, delivery E2E scenario 1.
- ✅ Scenario: Not initial JavaScript — `check-bundle-size.mjs` counts only initial scripts; green in CI.
- ✅ Scenario: Reopening without network — delivery E2E "Offline after a first visit" (heading "Time Zones") and the existing app-shell offline E2E.
- ✅ Scenario: Offline with the rules — delivery E2E offline scenario (no version request) and `zone_rules/zone_rules_boot_e2e.feature:12` "Offline start with the rules" (times from the rules).
- ✅ Scenario: Notice names the release — unit notice feature + E2E "The notice appears for a newer published release".
- ✅ Scenario: User reloads — unit "User reloads" (`reloadPage` once).
- ✅ Scenario: User dismisses — unit "User dismisses".
- ✅ Scenario: Keyboard user handles the notice — E2E "Keyboard user handles the notice" and "Escape dismisses the notice".
- ✅ Scenario: Both notices at once — unit "Both notices at once" and "User reloads with a waiting update".
- ✅ Scenario: Russian notice — unit "Russian notice".
- ✅ Scenario: No accessibility violations — E2E outline light/dark.
- ✅ Scenario: The line in both languages — `settings_zone_rules_release_unit.feature` outline.
- ✅ Scenario: The line names the active release — same feature.
- ✅ Scenario: No active release — same feature; `ZoneRulesReleaseLine.test.tsx` "absent without an active release".
- ✅ Scenario: Plain text in the accent colour — `settings_zone_rules_release_e2e.feature` outline.
- ✅ Scenario: The line fits one line — same feature, 375 px EN/RU.
- ✅ Scenario: The line at 320 px — same feature.
- ✅ Scenario: The deploy time in the interface language — unchanged, `settings/settings_deploy_time_unit.feature`.
- ✅ Scenario: The deploy time follows the settings at once — unchanged, `settings_deploy_time_unit.feature`.
- ✅ Scenario: The deploy time is fixed into the build — unchanged, `settings_deploy_time_unit.feature`.
- ✅ Scenario: The deploy time in the icon colour — unchanged, `settings/settings_deploy_time_e2e.feature`.
- ✅ Scenario: The deploy time fits one line — unchanged, `settings_deploy_time_e2e.feature`.
- ✅ Scenario: The deploy time at 320 px — unchanged, `settings_deploy_time_e2e.feature`; position after it covered by `DeployTime.test.tsx:47`.
- ✅ Scenario: Available on the first render offline — `zone_abbreviations_unit.feature:62`.
- ✅ Scenario: Table size — unchanged, `src/test/zoneData/zoneAbbreviationTable.test.ts` (gzip size) and the bundle size check.
- ✅ Scenario: Table built from the release — `zone_abbreviations_unit.feature:86`, reworded to the committed release.
- ✅ Scenario: Abbreviations kept from the table before — `zone_abbreviations_unit.feature:92`.
- ✅ Scenario: Ordered pairs — `zone_rules_updates_release_order.feature:5`.
- ✅ Scenario: Invalid names — `zone_rules_updates_release_order.feature:19`.
- ✅ Scenario: A newer release is published — `zone_rules_updates_check.feature:5`.
- ✅ Scenario: The published release is not newer — `zone_rules_updates_check.feature:13`.
- ✅ Scenario: The newer release is already stored — `zone_rules_updates_check.feature:24`.
- ✅ Scenario: Checks follow the update recheck rule — `zone_rules_updates_check.feature:31`.
- ✅ Scenario: No active release — `zone_rules_updates_check.feature:38`.
- ✅ Scenario: Offline — `zone_rules_updates_check.feature:44`.
- ✅ Scenario: Failures change nothing — `zone_rules_updates_check.feature:50` (6 examples).
- ✅ Scenario: Stored release is newer — `zone_rules_updates_active_release.feature:5`.
- ✅ Scenario: Stored release is older or equal — `zone_rules_updates_active_release.feature:12`.
- ✅ Scenario: Stored release is unreadable — `zone_rules_updates_active_release.feature:24` (3 documents).
- ✅ Scenario: No stored release — `zone_rules_updates_active_release.feature:38`.
- ✅ Scenario: The bundled release cannot be loaded — `zone_rules_updates_active_release.feature:44`.
- ✅ Scenario: Envelope — `zone_rules_updates_stored_release.feature:5`.
- ✅ Scenario: Storage unavailable — `zone_rules_updates_stored_release.feature:12`.
- ✅ Scenario: An unstored release is not downloaded again — `zone_rules_updates_stored_release.feature:19`.
- ✅ Scenario: Dismiss then recheck — `zone_rules_updates_stored_release.feature:26`.
- ✅ Scenario: A newer release after dismissal — `zone_rules_updates_stored_release.feature:32`.
- ✅ Scenario: A local time type — `zone_rules/zone_rules_release.feature:5`.
- ✅ Scenario: A zone with a future rule — `zone_rules_release.feature:10`.
- ✅ Scenario: A zone whose last type holds forever — `zone_rules_release.feature:17`, reworded to the committed release.
- ✅ Scenario: A zone whose listed changes end before the cutoff — `zone_rules_release.feature:23`, reworded.
- ✅ Scenario: A link resolves to its target's rules — `zone_rules_release.feature:29`.
- ✅ Scenario: The release carries its name — `zone_rules_release.feature:34`, compares with the committed release.
- ✅ Scenario: The committed release passes — `zone_rules_release.feature:39`.
- ✅ Scenario: A wrong rule fails the check — `zone_rules_release.feature:44`.
- ✅ Scenario: Offline start with the rules — `zone_rules/zone_rules_boot_e2e.feature:12`.
- ✅ Scenario: The asset is requested with the app — `zone_rules_boot_e2e.feature:6`.
- ✅ Scenario: A failed load still starts the app — `zone_rules_boot_e2e.feature:23`; `loadZoneRules.stored.test.ts:94` (rejects with nothing stored, so `bootApp` logs and starts).

## Mutation

Measured in this review with `npx stryker run --mutate '<files>'` from `packages/client/`, four runs of at most five files, one at a time; scores from the clear-text table and `reports/mutation/mutation-report.json`:

| File | Score | Survivors |
|---|---|---|
| `src/lib/zoneRules/core/releaseOrder.ts` | 100.00% | — |
| `src/lib/zoneRules/activeRelease.ts` | 100.00% | — |
| `src/lib/zoneRules/loadZoneRules.ts` | 95.83% | line 45 `ConditionalExpression` → `true` (equivalent: a non-LOADED result has no `release`) |
| `src/adapters/storedRelease/localStorageStoredReleaseRepository.ts` | 96.67% | line 25 `OptionalChaining` (equivalent: `JSON.parse` of a stored `"null"` is the only null case, and both paths end UNREADABLE) |
| `src/adapters/storedRelease/inMemoryStoredReleaseRepository.ts` | 100.00% | — |
| `src/adapters/fetchZoneRulesVersionSource.ts` | 97.30% | line 19 `typeof document === "object"` → `true` |
| `src/adapters/inMemoryZoneRulesVersionSource.ts` | 100.00% | — |
| `src/controller/useZoneRulesUpdate.ts` | 100.00% | — |
| `src/controller/useRecheckOnReturn.ts` | 100.00% | — |
| `src/controller/useUpdateRecheckOnReturn.ts` | **87.50%** | line 21 `OptionalChaining` `registration?.update` → `registration.update` (R1) |
| `src/controller/useZoneRulesRelease.ts` | 100.00% | — |
| `src/app/ZoneRulesUpdateNotice.tsx` | 100.00% | — |
| `src/app/ZoneRulesUpdateNoticeSlot.tsx` | 100.00% | — |
| `src/app/AppShell.tsx` | 97.40% | line 41 `reloadWindow` body; line 134 a string literal |
| `src/app/settings/ZoneRulesReleaseLine.tsx` | 100.00% | — |
| `src/app/settings/DeployTime.tsx` | 100.00% | — |
| `src/app/settings/SettingsPage.tsx` | 100.00% | — |
| `src/presenter/zoneRulesRelease.ts` | 100.00% | — |
| `src/ports/zoneRulesVersionSource.ts` | 100.00% | — |
| `src/constants/zoneRules.ts` | 100.00% | — |

`src/boot.ts` is excluded by `stryker.config.mjs`; the scripts under `scripts/` are outside its `mutate` globs and were not measured. The only file below 90% is `useUpdateRecheckOnReturn.ts` (R1).

## Findings

### R1 — CRITICAL — Task 5.5 ticked but useUpdateRecheckOnReturn is below the 90% mutation minimum
- Location: `packages/client/src/controller/useUpdateRecheckOnReturn.ts:21`
- Rule: `CLAUDE.md` ("Mutation testing … target >=95%, minimum acceptable >=90%"), `.claude/rules/tdd-workflow.md` Step 5; task 5.5 of `tasks.md`
- Problem: the refactor of task 5.1 moved the scheduling into `useRecheckOnReturn` and left `onRecheck = useCallback(() => { registration?.update().catch(ignoreFailedUpdateCheck); }, [registration])`. `useRecheckOnReturn` is called with `isEnabled: registration !== undefined`, so `onRecheck` never runs while `registration` is undefined and the `?.` can never short-circuit. Stryker's `OptionalChaining` mutant (`registration.update`) therefore survives, and the file scores 7/8 = 87.50%, below the 90% minimum; task 5.5 is ticked with this file in its list.
- Impact: task 5.5 is ticked (`- [x] 5.5 Mutation: … score ≥ 95% (minimum 90%) (M6).`, `tasks.md:40`) but its acceptance is not met for this file — a ticked-but-undone task — and M6 is not met for it either; a full `pnpm test:mutation` run reports the file under the threshold.
- Fix: mark the mutant as equivalent the way the code base already does (`src/app/ViewErrorBoundary.tsx:22`, `src/views/shared/DayTrack.tsx:134`): put `// Stryker disable next-line OptionalChaining: equivalent — useRecheckOnReturn never calls onRecheck while registration is undefined (isEnabled is false)` on the line above the `registration?.update()` call, then rerun `cd packages/client && npx stryker run --mutate 'src/controller/useUpdateRecheckOnReturn.ts'` and confirm 100% (at least 90%) before task 5.5 stays ticked; if the file cannot be brought to ≥ 90%, un-tick 5.5 in `tasks.md`.
- Fix risk: none for behaviour (a comment only). Keep the `?.` itself: TypeScript needs it, or a non-null assertion, because `registration` is typed `ServiceWorkerRegistration | undefined` inside the callback; replacing it with an `if (registration === undefined) return;` guard would only create another equivalent mutant.
- Status: open

## Verdict

Not ready. Blocking: R1 (CRITICAL) — task 5.5 is ticked while `useUpdateRecheckOnReturn.ts` scores 87.50%, below the 90% minimum, so task 5.5 and M6 are unmet for that file. The change is ready once R1 is fixed and the file is re-measured at ≥ 90% (the proposed equivalent-mutant annotation brings it to 100%). Apart from R1 the change implements every functional requirement with traceability and tests at each layer; FR1's workflow and M7 wait for the human handoffs H2/H3, as the design says, and do not block.
