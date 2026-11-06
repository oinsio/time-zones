# Review: polish-settings-and-remove-offline-update-notice

## Summary

| Item | Value |
|---|---|
| Tasks verified | 24/24 |
| Requirements traced | 55/55 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 1 |

## Tasks

Paths are relative to `packages/client/` unless they start with `docs/`.

- ✅ 1.1 Glossary and docs — `docs/glossary/settings.md:10` (Zone label: «Обозначение часового пояса»: «Аббревиатура», «Смещение UTC», `ZONE_LABEL_PART_ORDER`), `docs/glossary/settings.md:11` (new **Deploy time** with Code/Not/Never), `docs/glossary/settings.md:5` (Settings page lists the deploy time), `docs/glossary/time.md:21` («Аббревиатура»), `docs/glossary/app-shell.md` (Update check failure note removed; Update check "a failed check is silent"; Offline without `useOnlineStatus`), `docs/architecture/views.md:132` ("no note is shown"). A grep for `Update check failure note|useOnlineStatus|Подпись пояса|«Сокращение»` in `docs/glossary docs/architecture` prints nothing.
- ✅ 2.1 RED tests — `src/presenter/zoneLine.test.ts:83-84` (Russia en/ru), `:107` ("should follow ZONE_LABEL_PART_ORDER"); `src/controller/useZoneLabelExample.test.tsx:56,62`; `src/app/settings/SettingsPage.test.tsx:151,183-187` (group "Timezone label", DOM order `["Abbreviation", "UTC offset"]`); `src/locales/locales.test.ts:76-90` (`it.each` with the `// Verifies FR1, FR2` comment).
- ✅ 2.2 GREEN — `src/constants/preferences.ts:12-15` (`Europe/Moscow`, `RU`), `:22-25` (`ZONE_LABEL_PART_ORDER`), exported at `src/constants/index.ts`; `src/presenter/zoneLine.ts:50-63` maps `ZONE_LABEL_PART_ORDER`; `src/app/settings/ZoneLabelGroup.tsx:31` maps it instead of `Object.values`; `src/preferences/preferences.ts:20` JSDoc updated; `src/locales/en.json` "Timezone label", `src/locales/ru.json` «Обозначение часового пояса», «Аббревиатура».
- ✅ 2.3 Unit BDD — `src/test/features/settings/settings_zone_label_unit.feature:6,14` (Russia rows, tags `@FR3 @FR4 @UX1 @M1` / `@FR4 @M1`); new step "the {string} and {string} toggles are both on, in this order" in `steps/settings_zone_label_unit.steps.tsx` (checks `pressedToggleNames()` order).
- ✅ 2.4 E2E — `steps/settingsE2eHelpers.ts` group pattern `Timezone label|Обозначение часового пояса`; `settings_zone_label_e2e.feature:6` («Аббревиатура» and «Смещение UTC» in this order, «Россия»), `:13` ("Russia, UTC+3"), `:23` new "Tab order follows the zone line" `@NFR-A2`; `settings_e2e.feature:44` "Both languages" with new columns and `@M2`.
- ✅ 3.1 RED — `src/test/deployInstant/resolveDeployInstant.test.ts` (two `it.each` rows, ISO format regex, `APP_DEPLOY_INSTANT === TEST_DEPLOY_INSTANT`).
- ✅ 3.2 GREEN — `scripts/deployInstant/resolveDeployInstant.ts`, `app.config.ts:49,52`, `vite.config.ts:25` `define`, `vitest.config.ts:10` `define`, `src/vite-env.d.ts:37`, `src/constants/deploy.ts:6`, exported from `src/constants/index.ts`. `dist` holds no `__APP_DEPLOY_INSTANT__` and `dist/assets/main-*.js` holds an ISO instant; `pnpm typecheck` exits 0 (run during this review).
- ✅ 4.1 RED — `src/presenter/deployTime.test.ts` (4 `it.each` rows from the spec table, U+202F/U+00A0 normalised, `startWorkCount()` formatter test).
- ✅ 4.2 GREEN — `src/constants/localDateTime.ts:47` `DEPLOY_DATE_FORMAT_OPTIONS`; `src/presenter/dateTimeFormatters.ts:19,36-39,64-65` `DEPLOY_DATE` (hourless); `src/presenter/deployTime.ts:21-37` `formatDeployTime`, exported from `src/presenter/index.ts`; `settings.deployTime` in both locale files.
- ✅ 4.3 RED — `src/controller/useDeployTime.test.tsx` (build instant not clock, `SET_DEVICE_TIME_ZONE`, hour format, `ru`, missing-provider error); `src/app/settings/DeployTime.test.tsx` (last element of `<main>`, after the language group with the list expanded, classes, no `tabindex`/`role`/`aria-live`).
- ✅ 4.4 GREEN — `src/controller/useDeployTime.ts:20-38` (reads `deviceTimeZoneId` from the `LocationsContext` store, never `clock.timeZoneId()`), exported from `src/controller/index.ts`; `src/app/settings/DeployTime.tsx:8-15`; `src/app/settings/SettingsPage.tsx:135` after `InterfaceLanguageGroup`, JSDoc updated.
- ✅ 4.5 Unit BDD — `src/test/features/settings/settings_deploy_time_unit.feature` (outline of 4 rows `@FR5 @M3`, "follows the settings at once" `@FR5`, "fixed into the build" `@FR6`) with `steps/settings_deploy_time_unit.steps.tsx` and `steps/settings_deploy_time_world.tsx` (clock is `A_DAY_AFTER_THE_BUILD` by default, `navigator.onLine` mocked offline).
- ✅ 4.6 E2E — `settings_deploy_time_e2e.feature` (icon colour light/dark `@NFR-A1 @M4`, one line at 375/1024 px, 320 px no horizontal scroll); `steps/settings_deploy_time_e2e.steps.ts` compares the computed `color` with the back button `svg`, checks Tab never focuses the line, compares height with `line-height`.
- ✅ 5.1 RED — `src/controller/usePwaUpdateStatus.test.ts` (status keys without `isUpdateCheckFailed`; no `unhandledRejection`), `src/controller/useUpdateRecheckOnReturn.test.tsx` (two-argument calls; "should swallow a failed check without an unhandled rejection"), `src/controller/usePwaUpdateStatus.recheck.test.ts` ("a failed check on return changes nothing in the status"), `src/app/AppShell.pageNotices.test.tsx` (empty region after a failed check; update notice alone; offline/online shows nothing).
- ✅ 5.2 GREEN — `src/controller/usePwaUpdateStatus.ts:38,41` (`ignoreFailedUpdateCheck`, no flag, no `useOnlineStatus`); `src/controller/useUpdateRecheckOnReturn.ts:10,21-24,42` (no `onCheckFailed`); `UpdateCheckFailedNote.tsx`, its test, `useOnlineStatus.ts` and its test deleted; exports removed; `mainPage.updateCheckFailed` gone from both locales. `grep -rn "updateCheckFailed\|UpdateCheckFailed\|useOnlineStatus" packages/client/src` prints nothing.
- ✅ 5.3 Unit BDD — `src/test/features/main_page/main_page_unit.feature:20-21` ("Given storage is unavailable"), `:27` "Update cannot be fetched", `:34` "Going offline and back online"; `src/test/features/app_shell/app_shell_update_recheck.feature:25` (2 checks, region stays empty), `:33` "The start-up check fails"; steps updated, none reads the removed key.
- ✅ 5.4 E2E — `main_page_e2e.feature:55-65` ("Header keeps its position" without update-check lines; new "Update cannot be fetched" `@FR7 @UX3 @M5`); `steps/main_page_e2e.fixtures.ts:8-19` counts rejected checks under `REJECTED_UPDATE_CHECKS_KEY`; `steps/main_page_recovery_e2e.steps.ts:112-124` polls the count to ≥ 1 before asserting an empty region; `UPDATE_CHECK_FAILED_TEXT` and `updateCheckFailed` removed from helpers and `englishTexts.ts`.
- ✅ 6.1 Screenshots — `src/test/features/locations/steps/locations_layout_e2e.steps.ts:12-13,71-74` (`DEPLOY_TIME_SCREENSHOT_STYLE` via `addStyleTag`, `// Verifies NFR-R2`); `@NFR-R2` on the screenshot outlines of `settings_e2e.feature:89` and `settings_language_e2e.feature`; the 16 settings PNGs are re-approved (the 1024 px light baseline shows "Timezone label", "Abbreviation" before "UTC offset", "Russia MSK UTC+3").
- ✅ 6.2 Main page and app shell screenshots — no main page or app shell PNG changed in the diff; only the settings baselines changed.
- ✅ 6.3 Layout — `settings_zone_label_e2e.feature` outlines "One row on wide screens", "Narrow screens", "Toggling does not move the toggles" carry `@polish-settings-and-remove-offline-update-notice @NFR-R1`; `SettingsToggleGroup.tsx` needed no change.
- ✅ 6.4 Whole suites — CI is green (stage precondition); the stale India, old-name and failure-note expectations are updated across the touched features (no remaining `Подпись пояса`, `Сокращение` or India example under `src/test/features/settings`).
- ✅ 7.1 Mutation — re-measured in this review, see Mutation: every changed production file ≥ 97.96 %.
- ✅ 7.2 CI commands — `pnpm lint` ("Checked 738 files … No fixes applied") and `pnpm typecheck` exit 0 in this review; build, bundle-size and legacy-build are covered by green CI.
- ✅ 7.3 Traceability — the grep from the task finds every id in `packages/client/src` with this change's name (FR1 5, FR2 5, FR3 7, FR4 6, FR5 16, FR6 7, FR7 14, FR8 7, NFR-A1 6, NFR-A2 2, NFR-R1 6, NFR-R2 6, UX1 5, UX2 3, UX3 6, M1 3, M2 1, M3 2, M4 2, M5 4 lines).

## Requirements

- ✅ FR1 — en "Timezone label", ru «Обозначение часового пояса» (`src/locales/*.json`); tests `src/locales/locales.test.ts:76-90`, `SettingsPage.test.tsx:151`, E2E `settings_e2e.feature:44`, `settings_zone_label_e2e.feature:6`.
- ✅ FR2 — ru «Аббревиатура», en "Abbreviation", "UTC offset"/«Смещение UTC» unchanged; `locales.test.ts:76-90`, E2E "Both languages".
- ✅ FR3 — `ZONE_LABEL_PART_ORDER` (`src/constants/preferences.ts:22`) used by `ZoneLabelGroup.tsx:31` and `zoneLine.ts:62`; tests `zoneLine.test.ts:107`, `SettingsPage.test.tsx:183-187`, unit BDD "Both parts by default", E2E "Names and pressed state" (order asserted with `toHaveText([first, second])`).
- ✅ FR4 — `ZONE_LABEL_EXAMPLE = { Europe/Moscow, RU }`; `zoneLine.test.ts:83-84`, `useZoneLabelExample.test.tsx:56,62,74`, unit BDD outline with 5 Russia rows.
- ✅ FR5 — `formatDeployTime` (`src/presenter/deployTime.ts`), `useDeployTime`, `DeployTime` after the language group; `deployTime.test.ts` (4 rows), `useDeployTime.test.tsx`, `DeployTime.test.tsx`, unit BDD `settings_deploy_time_unit.feature`.
- ✅ FR6 — build-time `define` from `resolveDeployInstant()` (`vite.config.ts:25`), `APP_DEPLOY_INSTANT` (`src/constants/deploy.ts:6`); `resolveDeployInstant.test.ts`, unit BDD "The deploy time is fixed into the build" (clock a day after the build, offline, text equals the build instant).
- ✅ FR7 — failed checks swallowed by `ignoreFailedUpdateCheck` (`usePwaUpdateStatus.ts:38`, `useUpdateRecheckOnReturn.ts:42`), note removed from `AppShell.tsx`; `AppShell.pageNotices.test.tsx`, `usePwaUpdateStatus*.test.ts`, unit BDD `main_page_unit.feature:27,34`, `app_shell_update_recheck.feature:25,33`, E2E `main_page_e2e.feature` "Update cannot be fetched".
- ✅ FR8 — `mainPage.updateCheckFailed` removed from both locales; key-set parity test in `locales.test.ts`; `grep -rn updateCheckFailed packages/client/src` prints nothing.
- ✅ NFR-A1 — `<p data-deploy-time className="text-center text-sm text-accent">` with no role/tabindex/aria-live (`DeployTime.tsx:11`); `DeployTime.test.tsx`, E2E "The deploy time in the icon colour" (computed colour equals the back button icon, not a Tab stop, axe-core, both themes).
- ✅ NFR-A2 — DOM order follows `ZONE_LABEL_PART_ORDER`; E2E `settings_zone_label_e2e.feature:23` "Tab order follows the zone line", group name test `SettingsPage.test.tsx:151`.
- ✅ NFR-R1 — E2E zone label outlines tagged `@NFR-R1` in `settings_zone_label_e2e.feature`; deploy time one-line (375/1024 px) and 320 px outlines in `settings_deploy_time_e2e.feature`.
- ✅ NFR-R2 — the deploy time text hidden in screenshots (`locations_layout_e2e.steps.ts:71-74`); 16 settings baselines re-approved; outlines tagged `@NFR-R2`.
- ✅ UX1 — the toggle order matches the example (`ZONE_LABEL_PART_ORDER` drives both); unit BDD "Both parts by default" `@UX1`.
- ✅ UX2 — centred, small, accent (`DeployTime.tsx:11`); `DeployTime.test.tsx` class test, last element of `<main>`.
- ✅ UX3 — no note offline; unit BDD `main_page_unit.feature:27,34`, E2E "Update cannot be fetched" `@UX3`.
- ✅ M1 — the 5 rows of "The example follows the toggles" use Russia (`settings_zone_label_unit.feature:14-27`, `@M1`).
- ✅ M2 — E2E "Both languages" (`settings_e2e.feature:44`, `@M2`) checks caption and toggle order in both languages.
- ✅ M3 — 4 unit cases in the outline "The deploy time in the interface language" (`@M3`) and `deployTime.test.ts`.
- ✅ M4 — E2E "The deploy time in the icon colour" light and dark (`@M4`): axe-core plus colour equality.
- ✅ M5 — E2E "Update cannot be fetched" (`@M5`) asserts an empty notices region after at least one rejected check; the `updateCheckFailed` grep prints 0 lines.
- ✅ Scenario: Update cannot be fetched — `main_page_unit.feature:27` and `main_page_e2e.feature` with steps in `main_page_unit.steps.ts` and `main_page_recovery_e2e.steps.ts:94-124`.
- ✅ Scenario: Going offline and back online — `main_page_unit.feature:34`; step toggles the connection off and on (`main_page_unit.steps.ts:133-134`), region empty.
- ✅ Scenario: User opens the app — `main_page_unit.feature:6`, unchanged steps.
- ✅ Scenario: Notices stay available — `main_page_unit.feature:13`, unchanged steps.
- ✅ Scenario: Header keeps its position — `main_page_unit.feature:20` (Given storage is unavailable) and `main_page_e2e.feature` (storage only).
- ✅ Scenario: New version becomes available — `app_shell/app_shell_notices.feature`, unchanged.
- ✅ Scenario: User accepts the update — `app_shell/app_shell_notices.feature`, unchanged.
- ✅ Scenario: User postpones the update — `app_shell/app_shell_notices.feature`, unchanged.
- ✅ Scenario: Keyboard user handles the notice — `app_shell/app_shell_notices.feature:63` "User postpones the update from the keyboard", unchanged requirement text.
- ✅ Scenario: Returning to the app checks again — `app_shell_update_recheck.feature:7`.
- ✅ Scenario: Returning soon after a check does not check — `app_shell_update_recheck.feature:13`.
- ✅ Scenario: Hiding the page does not check — `app_shell_update_recheck.feature:19`.
- ✅ Scenario: A check on return fails offline — `app_shell_update_recheck.feature:25` (2 checks, notices region stays empty).
- ✅ Scenario: The start-up check fails — `app_shell_update_recheck.feature:33` (update notice stays, nothing else).
- ✅ Scenario: The deploy time in the interface language — `settings_deploy_time_unit.feature` outline (4 rows) and `deployTime.test.ts`.
- ✅ Scenario: The deploy time follows the settings at once — `settings_deploy_time_unit.feature` (24-hour → 12-hour, "7:30 AM").
- ✅ Scenario: The deploy time is fixed into the build — `settings_deploy_time_unit.feature` (clock a day later, offline).
- ✅ Scenario: The deploy time in the icon colour — `settings_deploy_time_e2e.feature` outline light/dark.
- ✅ Scenario: The deploy time fits one line — `settings_deploy_time_e2e.feature` (375/1024 px, English 12-hour and Russian).
- ✅ Scenario: The deploy time at 320 px — `settings_deploy_time_e2e.feature` (English 12-hour and Russian).
- ✅ Scenario: Both parts by default — `settings_zone_label_unit.feature:6` (order asserted, "Russia, MSK, UTC+3").
- ✅ Scenario: The example follows the toggles — `settings_zone_label_unit.feature:14` (5 Russia rows).
- ✅ Scenario: Both off leaves the country — `settings_zone_label_unit.feature:29`, unchanged.
- ✅ Scenario: A toggle writes the preferences once — `settings_zone_label_unit.feature:37`, unchanged.
- ✅ Scenario: Names and pressed state — `settings_zone_label_e2e.feature:6` (Russian names, order, «Россия»).
- ✅ Scenario: Toggle with the keyboard — `settings_zone_label_e2e.feature:13` ("Russia, UTC+3").
- ✅ Scenario: Tab order follows the zone line — `settings_zone_label_e2e.feature:23`.
- ✅ Scenario: Toggle size, focus and pressed icon — `settings_zone_label_e2e.feature:30`, unchanged.
- ✅ Scenario: No violations with the zone label group — `settings_zone_label_e2e.feature:39`, unchanged.
- ✅ Scenario: Both languages — `settings_e2e.feature:44` (new caption, «Аббревиатура», toggle order).
- ✅ Scenario: The factory name is never translated — `settings/settings_factory_name.feature:7`, unchanged.
- ✅ Scenario: Narrow and wide screens — `settings_e2e.feature:76` "Settings fit a screen <width> px wide" (320, 2560).
- ✅ Scenario: Approved screenshots — `settings_e2e.feature:89`, re-approved baselines with the deploy time text hidden.
- ✅ Scenario: Bar in each state — `date_selection/date_selection_date_bar.feature:37` (offline row included), unchanged.
- ✅ Scenario: Notice above the bar — `main_page/main_page_e2e.feature:68`, unchanged.

## Mutation

Measured in this review with scoped runs (`cd packages/client && npx stryker run --mutate '<files>'`), three runs of at most five files each, one at a time:

| File | Score | Notes |
|---|---|---|
| `src/presenter/deployTime.ts` | 100 % (3/3) | |
| `src/presenter/zoneLine.ts` | 93.75 % (30 killed, 2 no coverage) | both uncovered mutants are at lines 94 and 97 (`presentZoneLabelExample` fallbacks), not touched by this branch; the changed lines 50-63 are fully killed |
| `src/controller/useDeployTime.ts` | 100 % (6/6) | |
| `src/app/settings/DeployTime.tsx` | 100 % (1/1) | |
| `src/constants/preferences.ts` | 80 % (4 killed, 1 survived) | the survivor is a StringLiteral at line 49, outside this branch's hunk (lines 1-25); the new `ZONE_LABEL_PART_ORDER` and example are killed |
| `src/presenter/dateTimeFormatters.ts` | 100 % (17 killed, 5 timeout; 1 ignored by an existing `Stryker disable`) | |
| `src/controller/usePwaUpdateStatus.ts` | 100 % (10/10) | |
| `src/controller/useUpdateRecheckOnReturn.ts` | 100 % (20/20) | |
| `src/app/settings/ZoneLabelGroup.tsx` | 100 % (5/5) | |
| `src/app/AppShell.tsx` | 97.96 % (48 killed, 1 survived) | the survivor is the `"keydown"` literal at line 78 (Esc listener cleanup), untouched code |
| `src/app/settings/SettingsPage.tsx` | 100 % (24/24) | |
| `src/constants/localDateTime.ts` | 100 % (27/27) | |
| `scripts/deployInstant/resolveDeployInstant.ts` | 100 % (2/2) | |
| `src/constants/deploy.ts` | no mutants | a single `define` binding |

Every changed line is killed. The two files below 95 % fall short only because of mutants on lines this branch did not touch, so they get no finding.

## Findings

### R1 — SUGGESTION — Deploy time Given step ignores its Gherkin parameter
- Location: `packages/client/src/test/features/settings/steps/settings_deploy_time_unit.steps.tsx:36`
- Rule: —
- Problem: The step `Given("the build was made at {string}", () => givenBuildInstant(undefined, "2026-03-08T07:30:00.000Z"))` discards the `{string}` argument that vitest-cucumber passes and compares `APP_DEPLOY_INSTANT` with a hard-coded copy of the instant. The helper `givenBuildInstant(_ctx, buildInstant)` at line 28 already takes the value as its second parameter, but the step never forwards it.
- Impact: The instant in `settings_deploy_time_unit.feature` (`Given the build was made at "2026-03-08T07:30:00.000Z"`) is not executed. If the feature's instant is edited and the expected texts are changed to match, the Given step still passes against the old literal. The scenario then claims a build instant it never checked, and the outline's rows fail later with a misleading message instead of failing at the Given.
- Fix: Register the helper directly so the step uses the feature's value: `Given("the build was made at {string}", givenBuildInstant);` (or `(_ctx, buildInstant: string) => givenBuildInstant(_ctx, buildInstant)`).
- Fix risk: none — the feature's value equals `TEST_DEPLOY_INSTANT` today, so the scenario keeps passing. The change stays in the same unit BDD steps file where `bdd-unit.md` puts it.
- Status: fixed
- Resolution: the Given step now registers `givenBuildInstant` directly, so the feature's
  instant is compared with `APP_DEPLOY_INSTANT`; covered by settings_deploy_time_unit.steps.tsx (24 tests pass).

## Verdict

Ready. No CRITICAL or WARNING findings. Every task and requirement has evidence in code and tests, lint and typecheck pass, and every changed line is killed by the mutation runs. R1 is a non-blocking test polish.
