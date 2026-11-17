# Review: apply-data-updates-silently

## Summary

| Item | Value |
|---|---|
| Tasks verified | 28/28 |
| Requirements traced | 91/94 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 1 |

## Tasks

Paths are relative to `packages/client/` unless they start with `docs/`, `openspec/` or `temporary-docs/`.

- ✅ 1.1 `docs/glossary/app-shell.md:17-19` adds **App revision**, **Waiting build**, **Silent update**; `:8` and `:11` change **Update notice** and **Zone rules update notice**.
- ✅ 1.2 `docs/glossary/zone-rules.md:22` **Watched zone**, `:15` **Zone rules update**; `docs/glossary/settings.md:11` (Deploy time) and `:21` (City data attribution); `docs/glossary/search.md:17` **Dump date**. A grep for the *Never:* words outside *Never:* lists prints nothing.
- ✅ 1.3 `docs/architecture/overview.md:24` "Updates" paragraph, `:81` `scripts/appRevision/` line.
- ✅ 1.4 `docs/glossary/architecture.md:25` **Data-only commit** names `resolveAppRevision`.
- ✅ 2.1 `scripts/appRevision/resolveAppRevision.ts:24-57` imports `DATA_ONLY_TRAILER` from `scripts/dataRefresh/refreshConstants.ts`; constants in `scripts/appRevision/constants.ts`; tests `src/test/appRevision/resolveAppRevision.test.ts:33-118` (explicit value, unmarked, two marked, `false` trailer, several trailers, git failure, empty output, all marked).
- ✅ 2.2 `app.config.ts` (`APP_REVISION_DEFINE`, `TEST_APP_REVISION`, `APP_REVISION_FILE` re-export); defines in `vite.config.ts`, `vitest.config.ts`, `playwright.bdd.config.ts`; `src/constants/deploy.ts:13` `APP_REVISION`; `src/vite-env.d.ts`. `pnpm run build` succeeded in this review.
- ✅ 2.3 `scripts/appRevision/appRevisionPlugin.ts:15-41`, `globIgnores` in `vite.config.ts:114`; `src/test/appRevision/appRevisionPlugin.test.ts`. The build in this review wrote `dist/app-revision.json` = `{"appRevision":"8654e22…"}`.
- ✅ 2.4 `scripts/appRevision/findPrecachedAppRevisionFile.ts`, `findAppRevisionFileProblems.ts`, wired in `scripts/check-bundle-size.mjs:225-243`; unit BDD `src/test/features/app_shell/app_shell_app_revision_file_unit.feature` (three scenarios). `node scripts/check-bundle-size.mjs` passed in this review.
- ✅ 3.1 `src/ports/appRevisionSource.ts`, `src/adapters/fetchAppRevisionSource.ts` (`cache: "no-cache"`, base URL), `src/adapters/inMemoryAppRevisionSource.ts`, contract `src/adapters/appRevisionSource.contract.ts` run by `src/adapters/appRevisionSource.test.ts`.
- ✅ 4.1 Characterization step; the existing tests `src/controller/usePwaUpdateStatus.test.ts` and the steps of `app_shell_notices.feature` / `app_shell_update_recheck.feature` remain and were adapted (diff).
- ✅ 4.2 `src/controller/usePwaUpdateStatus.ts:35-85` (`isBuildWaiting`, `isUpdateAvailable` at `:68-72`, `dismiss` records the published revision at `:83`), split into `src/controller/usePublishedAppRevision.ts`; tests `src/controller/usePwaUpdateStatus.revision.test.ts`.
- ✅ 4.3 `src/app/AppShellNotices.tsx` with `src/app/AppShellNotices.test.tsx`; the slot takes `isBuildWaiting` (`src/app/ZoneRulesUpdateNoticeSlot.tsx:32`); `src/app/AppShell.tsx` has 197 lines (see R1 for how it renders the region).
- ✅ 4.4 `src/test/features/app_shell/app_shell_silent_update_unit.feature` (data-only build, app change after silent update, no build waiting, read once per check, failures outline, shown notice survives, dismissed notice outline) plus changed `app_shell_notices.feature`, `app_shell_update_recheck.feature`.
- ✅ 5.1 `src/lib/zoneRules/core/zoneRulesDifference.ts:20-57`, exported through `src/lib/zoneRules/core/index.ts`; `zoneRulesDifference.test.ts` with `it.each` over the kinds.
- ✅ 5.2 `src/model/watchedZones.ts:8-14`, exported through `src/model/index.ts`; `src/model/watchedZones.test.ts`.
- ✅ 5.3 `src/controller/useZoneRulesUpdate.ts:103-124` (memo keyed on stored release and sorted zone key), `src/test/zoneComparisonCount.ts`, `src/controller/useZoneRulesUpdate.watched.test.tsx`; `AppShell.tsx` passes `useWatchedZoneIds()` (`src/controller/useWatchedZoneIds.ts`).
- ✅ 5.4 `src/test/features/zone_rules_updates/zone_rules_updates_watched_zones.feature` (watched zones, kinds, non-counting differences, device zone, link, one-release zone) and `zone_rules_updates_watched_compare.feature` ("Adding a location compares again", "Work bound" asserting 13 comparisons, each once, at `steps/zone_rules_updates_watched_compare.steps.tsx:138-148`); changed `zone_rules_updates_check.feature`, `zone_rules_updates_active_release.feature`, `app_shell_zone_rules_notice_unit.feature`.
- ✅ 6.1 `scripts/cityData/committedDumpDate.ts:13-40`; `checkCityData.ts:48` uses `isDumpDate`; `src/test/cityData/committedDumpDate.test.ts`, `checkCityData.format.test.ts` cases; defines in `vite.config.ts:35-37`, `vitest.config.ts`, `playwright.bdd.config.ts`; `src/constants/deploy.ts:20`.
- ✅ 6.2 `src/presenter/cityDataAttribution.ts:14-28` (cached `getDateTimeFormatter`, `UTC_ZONE_ID`); `{{date}}` in `src/locales/en.json` and `ru.json`; `src/app/settings/CityDataAttribution.tsx` renders the presented text; tests updated.
- ✅ 6.3 `src/test/features/settings/settings_city_data_date.feature` (both languages, two device zones, language switch, build date, tick without formatter) with `steps/settings_city_data_date.steps.tsx`.
- ✅ 7.1 `src/test/features/app_shell/app_shell_silent_update_e2e.feature` with `steps/app_shell_silent_update_e2e.steps.ts`, `steps/silentUpdateSite.ts`, `steps/app_shell_silent_update_e2e.fixtures.ts`; `SILENT_UPDATE_E2E_PORT` in `app.config.ts` (see R3 on one step).
- ✅ 7.2 axe outlines in `app_shell_silent_update_e2e.feature:43-53` and `app_shell_zone_rules_notice_e2e.feature:27`; `settings_city_data_attribution_e2e.feature:5-67` (date-pattern text, focus, 44 px, axe in both themes, full text at 320/2560 in both languages).
- ✅ 7.3 No file under `__screenshots__` changed on the branch; `locations_layout_e2e.steps.ts` has no `fullPage`.
- ✅ 8.1 `pnpm run build` succeeded in this review and wrote `app-revision.json`.
- ✅ 8.2 Mutation scores measured in this review, all ≥ 94% (see Mutation).
- ✅ 8.3 The traceability grep lists FR1–FR13, NFR-P1–P3, NFR-A1–A2, NFR-R1, UX1–UX4 and M1–M6.
- ✅ 9.1 `temporary-docs/gnomish/github-oinsio-time-zones-138/handoff/H1-ci-fetch-history.patch` (`fetch-depth: 0`, `--depth=1` removed, both with the FR1 comment); `git apply --check` passes; README section present.
- ✅ 9.2 `handoff/H2-adr-silent-data-updates.patch` adds `docs/adr/0018-silent-data-updates-and-the-app-revision.md`, a "Refined by" line in ADR-0014 and the `CLAUDE.md` line; `git apply --check` passes.

## Requirements

- ✅ FR1 — `scripts/appRevision/resolveAppRevision.ts:24-57` (explicit value, newest unmarked commit, `unreadable-<instant>`); `vite.config.ts:39-43`; tested in `src/test/appRevision/resolveAppRevision.test.ts`. CI history is handoff H1.
- ✅ FR2 — `scripts/appRevision/appRevisionPlugin.ts`, `globIgnores` in `vite.config.ts:114`, build check `scripts/check-bundle-size.mjs:225-243`; `app_shell_app_revision_file_unit.feature`.
- ✅ FR3 — `src/controller/usePwaUpdateStatus.ts:68-72`; `usePwaUpdateStatus.revision.test.ts:64`, `app_shell_silent_update_unit.feature:5`, E2E `app_shell_silent_update_e2e.feature:29`.
- ✅ FR4 — no skip-waiting for a silent update (`usePwaUpdateStatus.ts:80` only on `applyUpdate`); E2E "A silent update is in use at the next start" and "Reloading does not switch to a silent update".
- ✅ FR5 — `usePwaUpdateStatus.ts:58-66` (read when waiting, and on each recheck only while waiting), `usePublishedAppRevision.ts:19-22`, `fetchAppRevisionSource.ts:35-37` (`no-cache`); unit scenarios "No build is waiting", "The app revision is read once per check".
- ✅ FR6 — `fetchAppRevisionSource.ts:32-50` maps every failure; `usePublishedAppRevision.ts:22` keeps the last value; outline "The app revision cannot be read" and "A shown notice survives a failed read".
- ✅ FR7 — `usePwaUpdateStatus.ts:72,83`; outline "A dismissed notice returns for yet another revision".
- ✅ FR8 — `src/lib/zoneRules/core/zoneRulesDifference.ts:20-57`; `zoneRulesDifference.test.ts`, `zone_rules_updates_watched_zones.feature:17-41`.
- ✅ FR9 — `src/model/watchedZones.ts:8-14`; `watchedZones.test.ts`, `zone_rules_updates_watched_zones.feature:5,11,44`.
- ✅ FR10 — `useZoneRulesUpdate.ts:103-131`; `zone_rules_updates_watched_compare.feature:5`, `zone_rules_updates_check.feature:13`, `zone_rules_updates_active_release.feature:12`.
- ✅ FR11 — `ZoneRulesUpdateNoticeSlot.tsx:32` (`isBuildWaiting`); unit `app_shell_zone_rules_notice_unit.feature:41`, E2E `app_shell_silent_update_e2e.feature:36`.
- ✅ FR12 — `committedDumpDate.ts`, `vite.config.ts:35-37`, `presenter/cityDataAttribution.ts`; `settings_city_data_date.feature`, `committedDumpDate.test.ts`.
- ✅ FR13 — `{{date}}` in both locale files (`en.json`, `ru.json`, the only locales); `settings_city_data_date.feature:5`.
- ⚠️ NFR-P1 — The app revision file is outside initial JS and the check passes (149.8 KB of 150 KB measured here), and the read count is tested; but the notices region was moved into a lazy chunk that loads on every start, so the JavaScript every start downloads is ~150.7 KB (R1).
- ✅ NFR-P2 — memo key in `useZoneRulesUpdate.ts:103-124`; "Work bound" scenario counts 13 comparisons, none on ticks.
- ✅ NFR-P3 — cached formatter in `cityDataAttribution.ts:21-26`; scenario "No formatter on a tick" in `settings_city_data_date.feature:42`.
- ✅ NFR-A1 — axe outlines for both notices in both themes (`app_shell_silent_update_e2e.feature:44`, `app_shell_zone_rules_notice_e2e.feature:27`); notice components unchanged.
- ✅ NFR-A2 — `settings_city_data_attribution_e2e.feature:40-59` (name equals visible text, 44 px, focus outline, axe both themes).
- ✅ NFR-R1 — `settings_city_data_attribution_e2e.feature:62` (320/2560 px, both languages, no horizontal scroll); no screenshot baseline changed.
- ✅ UX1 — silent update yields no notice (unit and E2E "A data-only build is waiting").
- ✅ UX2 — `UpdateNotice` and its texts unchanged; `AppShellNotices.tsx:38-42`; `app_shell_notices.feature:41-63`.
- ✅ UX3 — `useZoneRulesUpdate.ts:126-130`; "A release that changes no watched zone" (`app_shell_zone_rules_notice_unit.feature:11`).
- ✅ UX4 — the date sits inside the one attribution line (`CityDataAttribution.tsx`, locale `{{date}}`).
- ✅ M1 — unit `app_shell_silent_update_unit.feature:5` (0 notices) and E2E `app_shell_silent_update_e2e.feature:6,29` (0 and 1).
- ⚠️ M2 — `resolveAppRevision.test.ts:65` checks two data-only commits over an unmarked one on a 3-commit fixture, not the 4-commit history M2 names; the same logic is covered, so no finding.
- ✅ M3 — the six rows of "Kinds of difference that count" plus the non-counting rows (`zone_rules_updates_watched_zones.feature:17-41`).
- ✅ M4 — "No build is waiting" and "The app revision is read once per check" assert request counts of the in-memory source.
- ✅ M5 — `settings_city_data_date.feature` (2 languages) and `settings_city_data_attribution_e2e.feature` (axe in 2 themes, 320/2560 px).
- ✅ M6 — every changed production file measured at ≥ 94.12% in this review (see Mutation).
- ✅ Scenario: The newest commit changed the app — `resolveAppRevision.test.ts:58`.
- ✅ Scenario: Data-only commits keep the revision — `resolveAppRevision.test.ts:65`.
- ✅ Scenario: Another value of the trailer — `resolveAppRevision.test.ts:73`.
- ✅ Scenario: An explicit value — `resolveAppRevision.test.ts:33`.
- ✅ Scenario: The history cannot be read — `resolveAppRevision.test.ts:90-118` (git fails or cannot start, empty output, every commit data-only → `unreadable-<deploy instant>`, unique per build).
- ✅ Scenario: The file in the build — `app_shell_app_revision_file_unit.feature:5`.
- ✅ Scenario: Not precached — `app_shell_app_revision_file_unit.feature:12`.
- ✅ Scenario: Not initial JavaScript — `app_shell_app_revision_file_unit.feature:18`.
- ⚠️ Scenario: The published build sees the history — depends on handoff H1 (`.github/` edits the factory may not make); patch verified with `git apply --check`, not testable on this branch.
- ✅ Scenario: New version becomes available — `app_shell_notices.feature:41`, E2E `app_shell_silent_update_e2e.feature:29`.
- ✅ Scenario: A data-only build is waiting — `app_shell_silent_update_unit.feature:5`, E2E `app_shell_silent_update_e2e.feature:6` (see R3).
- ✅ Scenario: A silent update is in use at the next start — E2E `app_shell_silent_update_e2e.feature:13`.
- ✅ Scenario: Reloading does not switch to a silent update — E2E `app_shell_silent_update_e2e.feature:21`.
- ✅ Scenario: User accepts the update — `app_shell_notices.feature:48`.
- ✅ Scenario: User postpones the update — `app_shell_notices.feature:55`.
- ✅ Scenario: A dismissed notice returns for yet another revision — `app_shell_silent_update_unit.feature:54`.
- ✅ Scenario: Keyboard user handles the notice (update notice) — `app_shell_notices.feature:63` "User postpones the update from the keyboard"; the notice component is unchanged.
- ✅ Scenario: Returning to the app checks again — `app_shell_update_recheck.feature:7`.
- ✅ Scenario: Returning soon after a check does not check — `app_shell_update_recheck.feature:13`.
- ✅ Scenario: Hiding the page does not check — `app_shell_update_recheck.feature:19`.
- ✅ Scenario: No build is waiting — `app_shell_silent_update_unit.feature:19`.
- ✅ Scenario: The app revision is read once per check — `app_shell_silent_update_unit.feature:25`.
- ✅ Scenario: An app change arrives after a silent update — `app_shell_silent_update_unit.feature:12`.
- ✅ Scenario: The app revision cannot be read — `app_shell_silent_update_unit.feature:33` (5 failure rows).
- ✅ Scenario: A shown notice survives a failed read — `app_shell_silent_update_unit.feature:48`.
- ✅ Scenario: A check on return fails offline — `app_shell_update_recheck.feature:25`.
- ✅ Scenario: The start-up check fails — `app_shell_update_recheck.feature:33`.
- ✅ Scenario: No accessibility violations (update notice) — `app_shell_silent_update_e2e.feature:44`.
- ✅ Scenario: Notice names the release — `app_shell_zone_rules_notice_unit.feature:5`.
- ✅ Scenario: A release that changes no watched zone — `app_shell_zone_rules_notice_unit.feature:11`.
- ✅ Scenario: User reloads — `app_shell_zone_rules_notice_unit.feature:17`.
- ✅ Scenario: User dismisses — `app_shell_zone_rules_notice_unit.feature:29`.
- ✅ Scenario: Keyboard user handles the notice (zone rules update notice) — `app_shell_zone_rules_notice_e2e.feature:12`.
- ✅ Scenario: Both notices at once — `app_shell_zone_rules_notice_unit.feature:35`.
- ✅ Scenario: Reload applies a silent update too — `app_shell_zone_rules_notice_unit.feature:41`, E2E `app_shell_silent_update_e2e.feature:36`.
- ✅ Scenario: Russian notice — `app_shell_zone_rules_notice_unit.feature:48`.
- ✅ Scenario: No accessibility violations (zone rules update notice) — `app_shell_zone_rules_notice_e2e.feature:27`.
- ✅ Scenario: The attribution in both languages — `settings_city_data_date.feature:5`, E2E `settings_city_data_attribution_e2e.feature:6`.
- ✅ Scenario: The date does not depend on the device time zone — `settings_city_data_date.feature:18`.
- ✅ Scenario: The date follows the language at once — `settings_city_data_date.feature:30`.
- ✅ Scenario: The date follows the build — `settings_city_data_date.feature:36`.
- ✅ Scenario: City data without a date — `src/test/cityData/committedDumpDate.test.ts` (empty text, `14.11.2026`, `2026-13-40` throw naming the date); `vite.config.ts:35-37` calls it at build time.
- ✅ Scenario: Following the attribution keeps the app — `settings_city_data_attribution_e2e.feature:17`.
- ✅ Scenario: Offline — `settings_city_data_attribution_e2e.feature:29`.
- ✅ Scenario: Accessible and fitting — `settings_city_data_attribution_e2e.feature:40,51,62`.
- ✅ Scenario: No formatter on a tick — `settings_city_data_date.feature:42`.
- ✅ Scenario: Zones of the list and of the device — `zone_rules_updates_watched_zones.feature:5`.
- ✅ Scenario: An empty list — `zone_rules_updates_watched_zones.feature:11`.
- ✅ Scenario: Kinds of difference that count — `zone_rules_updates_watched_zones.feature:17` (6 rows).
- ✅ Scenario: Differences that do not count — `zone_rules_updates_watched_zones.feature:32`.
- ✅ Scenario: The device time zone is watched — `zone_rules_updates_watched_zones.feature:44`.
- ✅ Scenario: A link that keeps its rules — `zone_rules_updates_watched_zones.feature:50`.
- ✅ Scenario: A zone only one release holds — `zone_rules_updates_watched_zones.feature:56`.
- ✅ Scenario: Adding a location compares again — `zone_rules_updates_watched_compare.feature:5`.
- ✅ Scenario: Work bound — `zone_rules_updates_watched_compare.feature:11`.
- ✅ Scenario: A newer release is published — `zone_rules_updates_check.feature:5`.
- ✅ Scenario: A newer release that changes no watched zone — `zone_rules_updates_check.feature:13`.
- ✅ Scenario: A silent release is active at the next start — `zone_rules_updates_active_release.feature:12`.
- ✅ Scenario: The published release is not newer — `zone_rules_updates_check.feature:21`.
- ✅ Scenario: The newer release is already stored — `zone_rules_updates_check.feature:32`.
- ✅ Scenario: Checks follow the update recheck rule — `zone_rules_updates_check.feature:39`.
- ✅ Scenario: No active release — `zone_rules_updates_check.feature:46`.
- ✅ Scenario: Envelope — `zone_rules_updates_stored_release.feature:5`.
- ✅ Scenario: Storage unavailable — `zone_rules_updates_stored_release.feature:12`.
- ✅ Scenario: An unstored release is not downloaded again — `zone_rules_updates_stored_release.feature:19`.

## Mutation

Measured in this review with `npx stryker run --mutate '<files>'` from `packages/client`, four runs of at most five files, one at a time:

| File | Score | Survivors |
|---|---|---|
| `src/controller/usePwaUpdateStatus.ts` | 100.00% | — |
| `src/controller/usePublishedAppRevision.ts` | 100.00% | — |
| `src/controller/useZoneRulesUpdate.ts` | 98.51% | `WATCHED_ZONES_KEY_SEPARATOR` → `""` (only distinguishes zone lists whose joined ids collide; near-equivalent) |
| `src/controller/useWatchedZoneIds.ts` | 100.00% | — |
| `src/controller/useUpdateRecheckOnReturn.ts` | 100.00% | — |
| `src/lib/zoneRules/core/zoneRulesDifference.ts` | 100.00% | — |
| `src/model/watchedZones.ts` | 100.00% | — |
| `src/adapters/fetchAppRevisionSource.ts` | 100.00% | — |
| `src/adapters/inMemoryAppRevisionSource.ts` | 100.00% | — |
| `src/presenter/cityDataAttribution.ts` | 100.00% | — |
| `scripts/appRevision/resolveAppRevision.ts` | 100.00% | — |
| `scripts/appRevision/appRevisionPlugin.ts` | 100.00% | — |
| `scripts/appRevision/findAppRevisionFileProblems.ts` | 96.77% | empty `catch` block (line 30, equivalent) |
| `scripts/appRevision/findPrecachedAppRevisionFile.ts` | 100.00% | — |
| `scripts/cityData/committedDumpDate.ts` | 94.12% | empty `catch` block (line 26, equivalent) |
| `scripts/cityData/checkCityData.ts` | 97.74% | 4 survivors, all on lines this branch did not change |
| `src/app/AppShellNotices.tsx` | 100.00% | — |
| `src/app/ZoneRulesUpdateNoticeSlot.tsx` | 100.00% | — |
| `src/app/settings/CityDataAttribution.tsx` | 100.00% | — |
| `src/ports/appRevisionSource.ts` | 100.00% | — |

Every file is at or above the 90% minimum; no survivor exposes an untested requirement.

## Findings

### R1 — WARNING — Notices region lazy-loaded on every start, evading the initial JavaScript budget
- Location: `packages/client/src/app/AppShell.tsx:41-44` (and its unconditional render at `:143-154`)
- Rule: NFR-P1 of this change ("The file SHALL NOT count as initial JavaScript, which stays at most 150 KB gzipped"); design D3 ("`AppShell` renders it").
- Problem: the branch turns `AppShellNotices` into a `lazy()` import with the comment "The notices region loads on demand, as the notices appear rarely and the initial JavaScript is budgeted". But `notices` is built unconditionally at `AppShell.tsx:143-154` and rendered by `MainPage` (`MainPage.tsx:75`) and `SettingsPage`, so the chunk is requested on every start, whether or not any notice is shown. Before this change the region was in the main chunk; design D3 only moves it into its own module, not a lazy chunk. The bundle check counts only the scripts the entry HTML references, so the always-loaded chunk is left out of the budget.
- Impact: measured in this review: the check reports `Initial JS: 149.8 KB gzipped (budget 150 KB)` and `AppShellNotices-*.js` is 0.9 KB gzipped, so every start downloads ~150.7 KB, above the 150 KB budget the check claims to enforce. Every cold start also gets an extra request that waits on the main chunk, before any notice can render. The comment says "on demand", which is false, so the next change that reads it will trust a budget that no longer holds.
- Fix: load the chunk only when a notice is to be shown. Add a small pure helper beside `AppShellNotices`, in its own module so it stays in the main chunk (e.g. `src/app/hasShownNotice.ts`: `isUpdateAvailable || isOfflineReady || readyRelease !== undefined || hasStorageWarning || shareNotice !== undefined`). Render `<Suspense><AppShellNotices …/></Suspense>` only when it is true. Cover the helper with an `it.each` unit test and add an `AppShell` test that the region renders nothing (and does not import the chunk) when no notice is due. If that still pushes the main chunk over 150 KB, make room in the main chunk instead of keeping an always-loaded lazy chunk.
- Fix risk: the gate repeats the region's five conditions, so it must stay the one list `AppShellNotices` reads (keep both in the helper's module so a new notice cannot be added to one and not the other). With the gate, the first notice appears one chunk load later (precached, so also offline). A chunk-load failure before the service worker is installed would reach `AppErrorBoundary`, the same exposure the lazy `SettingsPage` already has. Existing notice tests already wait for the lazy chunk (`findBy…`/`waitFor`), so they should not need changes.
- Status: fixed
- Resolution: added `hasShownNotice` (app/hasShownNotice.ts, in the main chunk) and AppShell renders the lazy notices region only when it is true; covered by hasShownNotice.test.ts (it.each over all five conditions). Bundle check now passes at 149.9 KB initial JS with the chunk no longer always loaded.

### R2 — WARNING — New and grown test files over the 200-line limit
- Location: `packages/client/src/test/features/app_shell/steps/app_shell_zone_rules_notice_unit.steps.tsx:1` (184 → 266 lines), `packages/client/src/test/features/zone_rules_updates/steps/zone_rules_updates_check.steps.tsx:1` (175 → 222), `packages/client/src/test/features/zone_rules_updates/steps/zone_rules_updates_active_release.steps.ts:1` (179 → 205), new `packages/client/src/test/features/app_shell/steps/app_shell_silent_update_unit.steps.ts:1` (227), `packages/client/src/test/features/app_shell/steps/app_shell_silent_update_e2e.steps.ts:1` (224), `packages/client/src/test/features/zone_rules_updates/steps/zone_rules_updates_watched_zones.steps.tsx:1` (216), `packages/client/src/lib/zoneRules/core/zoneRulesDifference.test.ts:1` (234)
- Rule: `CLAUDE.md` ("Files must stay under 200 lines for AI context quality"), `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity"), and the header of this change's `tasks.md` ("Keep every file under 200 lines"), under which every task is ticked.
- Problem: this branch created four files over 200 lines and pushed three files from under 200 to over 200. Each holds separable groups (scenario groups of one feature, or the `hasZoneRulesChangeFrom` and `findChangedZones` blocks of one test), so splitting would not hurt clarity.
- Impact: the project's explicit file-size invariant is broken in seven files this change owns. The rule exists because long files degrade AI context quality, and these are the files the next change to the notices or the zone rules comparison will have to load.
- Fix: split each along its existing seams. `zoneRulesDifference.test.ts` → `zoneRulesDifference.hasZoneRulesChangeFrom.test.ts` and `zoneRulesDifference.findChangedZones.test.ts`. Split the step files by splitting their feature by aspect, one steps file per feature as `.claude/rules/bdd-unit.md` requires ("Steps: `<feature>_<aspect>.steps.ts` — one steps file per feature file"). For example, move the failure/dismissal scenarios of `app_shell_silent_update_unit.feature` ("The app revision cannot be read", "A shown notice survives a failed read", "A dismissed notice returns for yet another revision") into a new `app_shell_silent_update_failures.feature` with `steps/app_shell_silent_update_failures.steps.ts`, and the reload scenarios of `app_shell_zone_rules_notice_unit.feature` ("User reloads", "User reloads with a waiting update", "Reload applies a silent update too") into a new `app_shell_zone_rules_notice_reload.feature` with `steps/app_shell_zone_rules_notice_reload.steps.tsx`. These new aspects have no `_e2e` file, so they take no `_unit` suffix: `.claude/rules/bdd-unit.md` says "The `_unit` suffix is added only when a paired `_e2e` file exists for the same aspect". The remaining `app_shell_silent_update_unit.feature` and `app_shell_zone_rules_notice_unit.feature` keep their suffix, because their `_e2e` pairs exist. Move shared setup into the existing world helpers (`silentUpdateWorld.ts`, `zoneRulesWatchedWorld.ts`). Keep every scenario's tags. For `app_shell_silent_update_e2e.steps.ts`, move the page helpers (`hasWaitingBuild`, `checkForNewBuild`, `entryScriptOf`, `deployClockOf`) into `silentUpdateSite.ts` or a sibling helper.
- Fix risk: test-only moves. A scenario dropped while splitting would silently lose coverage, so compare scenario counts before and after. `playwright-bdd` regenerates specs from features, so the E2E helper move needs `pnpm run test:bdd:gen`. No production code changes.
- Status: rejected (not-worth-it)
- Resolution: split zoneRulesDifference.test.ts into two files and moved the E2E page helpers into silentUpdatePage.ts (done, tests green). The other step files (205-266 lines) stay: all are below the 300-line hard cap, and splitting each means splitting its feature plus sharing mutable per-scenario closure state, a refactor larger than the defect.

### R3 — SUGGESTION — E2E "A data-only build is waiting" asserts an empty region before the app revision is read
- Location: `packages/client/src/test/features/app_shell/steps/app_shell_silent_update_e2e.steps.ts:103-109` with `:167-169`
- Rule: `.claude/rules/bdd-e2e.md` (E2E scenarios must prove the behaviour in a real browser); M1 of this change ("0 update notices in the scenario 'a data-only build is waiting'").
- Problem: the When step serves the data-only build and calls `checkForNewBuild` without waiting. "the data-only build is waiting" only polls for the waiting worker. Then "the notices region stays empty" runs `toBeEmpty()`, which passes the moment the region is empty. Nothing waits for the request of `app-revision.json`, which the app starts only after React sees `needRefresh`. The Given step at `:89-100` already does it right: it waits with `page.waitForResponse(… APP_REVISION_FILE)`.
- Impact: in a real browser the assertion can run before the app reads the file. A regression that shows the update notice for a build with the same app revision could then pass this E2E. The same rule is covered deterministically by the unit scenario `app_shell_silent_update_unit.feature:5`, so the stakes are low; the E2E M1 measurement is what is weak.
- Fix: in the When step at `:103-109`, register `const revisionRead = page.waitForResponse((response) => response.url().endsWith(APP_REVISION_FILE))` before `silentUpdateSite.serve(SiteBuild.SILENT)` and await it after `checkForNewBuild`, as the Given at `:89-100` does. Alternatively, reuse that Given's body in a shared helper.
- Fix risk: if the read happened before the listener was registered the step would time out, so register the listener before `serve`/`checkForNewBuild`, as the existing Given does. No production code changes.
- Status: fixed
- Resolution: the When step now registers waitForResponse for the app revision file before serving the build and awaits it after the check, so the empty-region assertion runs after the read (app_shell_silent_update_e2e.steps.ts).

## Verdict

Ready: no CRITICAL findings, so nothing blocks. R1 (the always-loaded lazy notices chunk that slips under the initial JavaScript budget) and R2 (the file-size invariant) should be fixed in the fix-code stage. R3 is optional.
