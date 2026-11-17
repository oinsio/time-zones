# Specs review: apply-data-updates-silently

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 39/39 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 2 |

## Freshness

- ✅ "No other change is active" (`proposal.md:3`): `openspec/changes/` holds only `apply-data-updates-silently` and `archive/`.
- ✅ ADR-0014 point 5 "offers a reload" (`proposal.md:3`): `docs/adr/0014-zone-rules-from-iana.md`, Decision 5; ADR-0017 is Accepted and defines the trailer `Data-Only: true`.
- ✅ `DATA_ONLY_TRAILER = "Data-Only: true"` in `scripts/dataRefresh/refreshConstants.ts` (`design.md:14`): `packages/client/scripts/dataRefresh/refreshConstants.ts:8`; glossary `docs/glossary/architecture.md:25` names it under **Data-only commit**.
- ✅ `registerType: "prompt"` and `globIgnores` in `vite.config.ts` (`design.md:7,11`): `packages/client/vite.config.ts:57,80`.
- ✅ `usePwaUpdateStatus` wraps `useRegisterSW`, `needRefresh` becomes `isUpdateAvailable`, `dismiss` sets `needRefresh` false (`design.md:7`): `packages/client/src/controller/usePwaUpdateStatus.ts:31-53`.
- ✅ `useRecheckOnReturn` schedules both the service worker recheck and `useZoneRulesUpdate` (`design.md:9`): `src/controller/useUpdateRecheckOnReturn.ts:24`, `src/controller/useZoneRulesUpdate.ts:84`.
- ✅ `useZoneRulesUpdate` reports `readyRelease` and holds `downloaded` / `storedLoadResult.release` (`design.md:10`, `design.md:72`): `src/controller/useZoneRulesUpdate.ts:29,59-71`.
- ✅ `ZoneRulesUpdateNoticeSlot` chooses `applyUpdate` over a plain reload when `isUpdateAvailable` (`design.md:10`): `src/app/ZoneRulesUpdateNoticeSlot.tsx:30`.
- ✅ `__APP_DEPLOY_INSTANT__` from `scripts/deployInstant/`, exposed as `APP_DEPLOY_INSTANT` in `src/constants/deploy.ts` (`design.md:11`): `app.config.ts:49`, `src/constants/deploy.ts`, `scripts/deployInstant/resolveDeployInstant.ts`.
- ✅ `fetchZoneRulesVersionSource` reads with `cache: "no-cache"` (`design.md:11`): `src/adapters/fetchZoneRulesVersionSource.ts:55`.
- ✅ The committed city data records `source.dumpDate` and `toServedCityData` drops `source` (`design.md:12`): `city-data/geonames-cities.json` (`"dumpDate":"2026-11-15"`), `scripts/cityData/toServedCityData.ts:27`.
- ✅ `readDumpDate` in `scripts/cityData/download.ts` is not exported and `checkFormat` checks `source.dumpDate` only as a non-empty text (`design.md:76`): `scripts/cityData/download.ts:86`, `scripts/cityData/checkCityData.ts:46`.
- ✅ Switching the dump date check to `isDumpDate` keeps the existing check tests green (`tasks.md:39`): every "valid" fixture uses an ISO date (`src/test/cityData/checkCityData.fixtures.ts:31`), and the cases with `dumpDate: "c"` expect a failure that `checkCityData` reports as one message (`scripts/cityData/checkCityData.ts:168-169`).
- ✅ `checkCityData.ts` has 180 lines and `AppShell.tsx` has 199 lines (`design.md:15,78`): `wc -l`.
- ✅ CI checks out with `actions/checkout@v5` at default depth, the step "Check data-only paths" runs `git fetch --no-tags --depth=1 origin main` before `pnpm build`, and `deploy.yml` calls `ci.yml` (`design.md:13`): `.github/workflows/ci.yml:27,39-42,55`, `.github/workflows/deploy.yml:15`.
- ✅ `check-paths` diffs `origin/main..HEAD` with two dots (`design.md:91`): `scripts/dataRefresh/cli.ts:74`; no test under `src/test/` asserts `--depth=1` (the CI job test only checks the `check-paths` line, `src/test/dataRefresh/dataRefreshOtherWorkflows.test.ts:123`).
- ✅ `RunProcess` in `scripts/zoneRules/processTypes.ts`, used by `scripts/cityData/compile.ts` (`design.md:14`): `processTypes.ts:13`, `compile.ts:14,30`.
- ✅ `playwright.bdd.config.ts` runs `chromium`, `mobile-chrome` and the view-contract projects against `pnpm build && pnpm preview`, and sets the deploy instant by `Object.assign(globalThis, …)` (`design.md:15,81`): `playwright.bdd.config.ts:16,86,131-145`; `@/constants` re-exports `./deploy` (`src/constants/index.ts:20`).
- ✅ The package has no default `playwright.config.ts` (`tasks.md:45`): only `playwright.bdd.config.ts` exists.
- ✅ Vitest collects only `src/**/*.{test,steps}.{ts,tsx}` (`tasks.md:3`): `vitest.config.ts:21`.
- ✅ `getLocalTimeType` owns the local time type with `utcOffsetSeconds`, `designation`, `isDaylightSavingTime`, and `ZoneRulesRelease.zones` resolves links to their target's rules (`design.md:64`): `src/lib/zoneRules/core/localTimeType.ts:49`, `src/lib/zoneRules/core/zoneRulesRelease.ts:3,21-43`.
- ✅ `src/test/workCounters.ts` has no counter of compared zones (`design.md:72`): it counts formatters and transition lookups only (`workCounters.ts:14,18`).
- ✅ `getDateTimeFormatter` with `DateTimeLabelKind.DEPLOY_DATE` is a cached, hourless date formatter, and `UTC_ZONE_ID` exists (`design.md:85`): `src/presenter/dateTimeFormatters.ts:19,56-75`, `src/constants/search.ts:5`.
- ✅ `settings.cityDataAttribution` exists in every locale file (`en.json`, `ru.json`) and `CityDataAttribution` renders one translated link (`design.md:12`): `src/locales/en.json:142`, `src/locales/ru.json:142`, `src/app/settings/CityDataAttribution.tsx:20`.
- ✅ The model state carries `deviceTimeZoneId` for `getWatchedZoneIds` (`design.md:72`): e.g. `src/model/workingTime.spans.test.ts:21` (`INITIAL_WORLD_CLOCK_STATE`).
- ✅ The existing zone rules update notice E2E keeps showing the notice under FR8/FR9: the E2E device time zone is `Asia/Almaty` (`playwright.bdd.config.ts:69`) and the published test release changes only Almaty (`src/test/features/zone_rules_updates/steps/zoneRulesPublishedFiles.ts:31-50`), so Almaty is a watched zone.
- ✅ The deploy time and the zone rules release line are hidden in the approved screenshots because they change between builds: `src/test/features/locations/steps/locations_layout_e2e.steps.ts:12-13,71-75`.
- ❌ Task 7.3 (`tasks.md:47`: "FR12 puts a date into the city data attribution", "Read the 375 px PNGs and confirm the attribution line names the date of the city data") and NFR-R1 (`proposal.md:99`: "The approved settings screenshots are re-approved once") assume the approved settings screenshots show the city data attribution. They do not. The screenshot step captures only the viewport (`locations_layout_e2e.steps.ts:76` calls `toHaveScreenshot` with the file name only, no `fullPage`), and the baselines `src/test/features/__screenshots__/chromium/Approved-screenshots-of-the-settings-at-{375,1024}-px-in-the-light-theme.png` end at the Language group and the offline notice. The attribution is the page's last line, so none of the 8 settings PNGs contains it. See R1.
- ✅ Existing tests still assert the old attribution text: `src/app/settings/SettingsPage.sections.test.tsx:20,28`, `src/app/settings/CityDataAttribution.test.tsx:13`, `src/test/features/settings/settings_city_data_attribution_e2e.feature:13,36`.
- ✅ The E2E scenarios run against `pnpm build && pnpm preview` (`playwright.bdd.config.ts:131-145`). Under task 6.1 the built app shows the committed dump date from the `vite.config.ts` define. The Playwright process, by contrast, gets `TEST_CITY_DATA_DATE` through `Object.assign(globalThis, …)`, so `CITY_DATA_DATE` imported into an E2E step is not the date the page shows. See R2.
- ✅ The MODIFIED requirements exist in `openspec/specs/` as restated: app-shell "New version notice" (`app-shell/spec.md:71`) and "Zone rules update notice" (`:246`), zone-rules-updates "Zone rules update check" (`:35`) and "Stored release document" (`:137`), settings "City data attribution" (`settings/spec.md:999`); every stable scenario is kept in the deltas. The ADDED app-delivery and zone-rules-updates requirements have no namesake in `openspec/specs/`.
- ✅ Glossary terms the change edits exist as described (`proposal.md:18-25`): **Deploy time** says "a stand-in for a version number" and "*Not:* a version number" (`docs/glossary/settings.md:11`), **Update notice** and **Zone rules update notice** (`docs/glossary/app-shell.md:8,11`), **City data attribution** (`settings.md:21`), **Zone rules update** (`zone-rules.md:15`); no **App revision**, **Waiting build**, **Silent update**, **Watched zone** or **Dump date** exists yet. `docs/architecture/overview.md:68` has "Where things live".
- ✅ Nothing of the change is implemented yet: no `scripts/appRevision/`, no `app-revision.json`, no `findChangedZones`, `getWatchedZoneIds` or `CITY_DATA_DATE` in the tree, and no archived change covers it.

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ app-delivery "App revision of a build" | ✅ 2.1, 2.2, 9.1 |
| FR2 | ✅ | ✅ app-delivery "App revision file" | ✅ 2.3, 2.4 |
| FR3 | ✅ | ✅ app-shell "New version notice" | ✅ 4.2, 4.4, 7.1 |
| FR4 | ✅ | ✅ "A silent update is in use at the next start", "Reloading does not switch…" | ✅ 4.2, 7.1 |
| FR5 | ✅ | ✅ "No build is waiting", "The app revision is read once per check" | ✅ 3.1, 4.2, 4.4 |
| FR6 | ✅ | ✅ "The app revision cannot be read", "A shown notice survives a failed read" | ✅ 3.1, 4.2, 4.4 |
| FR7 | ✅ | ✅ "A dismissed notice returns for yet another revision" | ✅ 4.2, 4.4 |
| FR8 | ✅ | ✅ zone-rules-updates "Releases that change a watched zone" | ✅ 5.1, 5.4 |
| FR9 | ✅ | ✅ zone-rules-updates "Watched zones" | ✅ 5.2, 5.4 |
| FR10 | ✅ | ✅ "Watched zones are compared when they can change", "Zone rules update check" | ✅ 5.3, 5.4 |
| FR11 | ✅ | ✅ app-shell "Reload applies a silent update too" | ✅ 4.3, 7.1 |
| FR12 | ✅ | ✅ settings "City data attribution" | ✅ 6.1, 6.2, 6.3 |
| FR13 | ✅ | ✅ settings "City data attribution" (every locale file) | ✅ 6.2, 6.3 |
| NFR-P1 | ✅ | ✅ "App revision file" (1 KB, not initial JavaScript), "read once per check" | ✅ 2.4, 4.4 |
| NFR-P2 | ✅ | ✅ "Work bound" | ✅ 5.3, 5.4 |
| NFR-P3 | ✅ | ✅ "No formatter on a tick" | ✅ 6.2, 6.3 |
| NFR-A1 | ✅ | ✅ "No accessibility violations" of both notices | ✅ 7.2 |
| NFR-A2 | ✅ | ✅ settings "Accessible and fitting" (focus outline and contrast stay in the stable "Accessible and responsive attribution") | ✅ 7.2 |
| NFR-R1 | ✅ | ✅ settings "Accessible and fitting" | ✅ 7.2 (320 px / 2560 px E2E); the re-approval in 7.3 cannot happen, see R1 |
| UX1 | ✅ | ✅ "A data-only build is waiting" | ✅ 4.4, 7.1 |
| UX2 | ✅ | ✅ "New version becomes available", "User accepts / postpones" | ✅ 4.4, 7.1 |
| UX3 | ✅ | ✅ "A release that changes no watched zone" | ✅ 5.4 |
| UX4 | ✅ | ✅ settings "City data attribution" (one line) | ✅ 6.2, 6.3 |
| M1 | ✅ | n/a | ✅ 7.1 |
| M2 | ✅ | n/a | ✅ 2.1 (fixture histories) |
| M3 | ✅ | n/a | ✅ 5.1 (six rows of "Kinds of difference that count") |
| M4 | ✅ | n/a | ✅ 4.4 |
| M5 | ✅ | n/a | ✅ 6.3, 7.2 |
| M6 | ✅ | n/a | ✅ 8.2 |
| G1 | ✅ | n/a — met by FR3, FR4, M1 | n/a — FR3, FR4, M1 |
| G2 | ✅ | n/a — met by FR3, M1 | n/a — FR3, M1 |
| G3 | ✅ | n/a — met by FR8, FR10, M3 | n/a — FR8, FR10, M3 |
| G4 | ✅ | n/a — met by FR12, M5 (release line exists) | n/a — FR12, M5 |
| NG1 | ✅ | n/a — no artifact adds version numbers or a release process | n/a |
| NG2 | ✅ | n/a — no artifact reloads by itself; D3 rejects skip-waiting | n/a |
| NG3 | ✅ | n/a — the refresh workflows are untouched; H1 edits only the fetch depth of `check` | n/a |
| NG4 | ✅ | n/a — notice texts unchanged in the deltas | n/a |
| NG5 | ✅ | n/a — FR5 forbids the request while no build waits | n/a |
| NG6 | ✅ | n/a — no artifact announces a silent update | n/a |

## Consistency

None.

## Findings

### R1 — WARNING — Task 7.3 re-approves settings screenshots that never show the city data attribution
- Location: `openspec/changes/apply-data-updates-silently/tasks.md:47` (task 7.3), `openspec/changes/apply-data-updates-silently/proposal.md:99` (NFR-R1, last sentence)
- Rule: `.claude/rules/test-planning.md` ("The `tasks.md` verification section must list concrete test commands, not \"check manually\"")
- Problem: Task 7.3 re-approves the settings screenshots because "FR12 puts a date into the city data attribution". It asks to "Read the 375 px PNGs and confirm the attribution line names the date of the city data", and its Verify requires `git status --short src/test/features/__screenshots__` to list exactly the 8 settings PNGs. NFR-R1 ends with "The approved settings screenshots are re-approved once." But the screenshot step (`src/test/features/locations/steps/locations_layout_e2e.steps.ts:76`) calls `toHaveScreenshot` without `fullPage`, so it captures only the viewport. The baselines (`src/test/features/__screenshots__/chromium/Approved-screenshots-of-the-settings-at-1024-px-in-the-light-theme.png`, and the 375 px one) end at the Language group and the offline notice. The attribution is the last line of the page and appears in none of them.
- Impact: The implementer cannot complete task 7.3. `--update-snapshots` rewrites nothing, no PNG shows the attribution to confirm, and the Verify "lists only the 8 settings PNGs" fails because `git status` lists none. The implement stage either stalls on a check it cannot pass or ticks it falsely. NFR-R1 keeps a sentence that no test can meet.
- Fix: Replace task 7.3 with: "The approved screenshots stay unchanged (NFR-R1): after `pnpm run test:bdd:gen`, run `npx playwright test -c playwright.bdd.config.ts --grep "Approved|Screenshot of the|screenshot"` once, without `--update-snapshots`. Verify: it passes and `git status --short src/test/features/__screenshots__` prints nothing." Drop the tag edit to `settings_e2e.feature` and the reading of the PNGs. In `proposal.md:99`, replace "The approved settings screenshots are re-approved once." with "The approved screenshots stay unchanged."
- Fix risk: The attribution with its date gets no visual-regression baseline. Do not add one through `fullPage`: a baseline that shows the dump date would fail the next city data refresh pull request, which may change only the city data paths. Wrapping and the absence of horizontal scroll stay asserted by the E2E checks of task 7.2 at 320 px and 2560 px in both languages, so NFR-R1 keeps its test.
- Status: fixed
- Resolution: confirmed the screenshot step calls `toHaveScreenshot` without `fullPage`; task 7.3 now only checks that every approved screenshot passes unchanged with an empty `git status` of `__screenshots__`, and NFR-R1 in proposal.md now says the approved screenshots stay unchanged and no baseline shows the dated attribution. Wrapping and no horizontal scroll stay covered by task 7.2.

### R2 — WARNING — Existing tests that assert the old attribution text have no task, and the scoped runs never reach them
- Location: `openspec/changes/apply-data-updates-silently/tasks.md:40` (task 6.2), `tasks.md:46` (task 7.2); code `packages/client/src/app/settings/SettingsPage.sections.test.tsx:20,28`, `packages/client/src/test/features/settings/settings_city_data_attribution_e2e.feature:13-14,36`
- Rule: `.claude/rules/tdd-workflow.md` ("When modifying existing code: verify a test exists first"); `.claude/rules/test-planning.md`
- Problem: Task 6.2 changes `settings.cityDataAttribution` to carry `{{date}}`, but it updates and runs only `cityDataAttribution.test.ts`, `CityDataAttribution.test.tsx` and `src/locales`. `SettingsPage.sections.test.tsx` looks up the link by the exact name "City data: GeoNames, CC BY 4.0". The E2E scenarios "The attribution in both languages" and "The attribution offline" assert that same old text. The delta spec changes both scenarios (`specs/settings/spec.md:241-251,291-294`), but no task edits them, and the Playwright runs of tasks 7.1–7.2 are scoped to `--grep @apply-data-updates-silently`, a tag those scenarios do not carry. Nothing says how an E2E check gets the date either. The built app under test shows the committed dump date (`vite.config.ts` define, task 6.1), while the Playwright process holds `TEST_CITY_DATA_DATE` (`Object.assign(globalThis, …)` in `playwright.bdd.config.ts`).
- Impact: The implement stage finishes with every listed command green. Then the full `pnpm test` and `test:bdd` in CI fail on three old assertions, and the delta's changed scenarios never become executable in the E2E feature. An E2E check that names a literal date, or imports `CITY_DATA_DATE`, fails at once (test date ≠ committed date) or at the next city data refresh pull request, which may change only the city data paths.
- Fix: In task 6.2, add "update `src/app/settings/SettingsPage.sections.test.tsx` to the new attribution text" and the command `npx vitest run src/app/settings/SettingsPage.sections.test.tsx`. In task 7.2, add "change the scenarios 'The attribution in both languages' and 'The attribution offline' of `settings_city_data_attribution_e2e.feature` to the delta's text, checking the date part only as non-empty text between the parentheses (patterns `^City data: GeoNames \(.+\), CC BY 4\.0$` and `^Данные о городах: GeoNames \(.+\), CC BY 4\.0$`, never a literal date and never `CITY_DATA_DATE`), adding `@apply-data-updates-silently @FR12 @FR13` to their tags", and run `npx playwright test -c playwright.bdd.config.ts --grep "attribution"` after `pnpm run test:bdd:gen`.
- Fix risk: The E2E check no longer pins the exact date. The exact date stays covered by unit BDD 6.3, which runs with `TEST_CITY_DATA_DATE`. The Gherkin steps take a pattern instead of a literal, which is a small step-definition change inside task 7.2.
- Status: fixed
- Resolution: task 6.2 now updates `CityDataAttribution.test.tsx` and `SettingsPage.sections.test.tsx` to the new text, runs the latter, and greps that no old text remains; task 7.2 changes "The attribution in both languages" and "The attribution offline" of `settings_city_data_attribution_e2e.feature` to the delta text with `@apply-data-updates-silently @FR12 @FR13`, checking the date only by the patterns `^City data: GeoNames \(.+\), CC BY 4\.0$` / Russian (never a literal date or `CITY_DATA_DATE`), and runs `--grep "attribution"`.

### R3 — SUGGESTION — FR8 uses "abbreviation" for the local time type's designation
- Location: `openspec/changes/apply-data-updates-silently/proposal.md:77,141`, `specs/zone-rules-updates/spec.md:19,29`, `design.md:68`
- Rule: `.claude/rules/glossary.md` ("A name that carries a glossary concept under a different word is a bug")
- Problem: The comparison checks the `designation` of the **Local time type** (`docs/glossary/zone-rules.md:8`, `LocalTimeType.designation`, as D4 says at `design.md:64`). FR8, M3, the requirement "Releases that change a watched zone" and its table row "abbreviation in force" call it "abbreviation". In the glossary, **Zone abbreviation** (`docs/glossary/time.md:21`) is a different concept that excludes numeric designations such as `+05` (*Code:* `getZoneAbbreviation`).
- Impact: The stable spec that this change archives would name the compared field with a term for another concept. An implementer or step writer who follows the spec rather than D4 could compare `getZoneAbbreviation` output, which doesn't see numeric designations.
- Fix: Replace "abbreviation" with "designation" in FR8 and M3 of `proposal.md`, in the requirement text at `specs/zone-rules-updates/spec.md:19`, and in the table row at `:29` (`| designation in force | the designation in force at the comparison instant |`). Rephrase `design.md:68` as "The designation counts because the zone label can show its abbreviation."
- Fix risk: The task 5.1 wording ("the abbreviation in force") must follow, and M3's six rows keep their count. No code or steps exist yet.
- Status: fixed
- Resolution: replaced "abbreviation" with "designation" (the `LocalTimeType.designation` field of the glossary's Local time type) in FR8 and M3 of proposal.md, the requirement text and both table rows of specs/zone-rules-updates/spec.md (lines 19, 29, 30), task 5.1, and design.md D4 ("The designation counts because the zone label can show its abbreviation.").

### R4 — SUGGESTION — The handoff patch tasks do not name the handoff folder
- Location: `openspec/changes/apply-data-updates-silently/tasks.md:57-58` (tasks 9.1, 9.2)
- Rule: `.gnomish/stages/specify/handoff.md` ("Handoff H1: write `H1-<slug>.patch` and its README section in the task's handoff folder")
- Problem: Tasks 9.1 and 9.2 say "written as `H1-ci-fetch-history.patch`" and "written as `H2-adr-silent-data-updates.patch`", with "its README section", but they never name `temporary-docs/gnomish/github-oinsio-time-zones-138/handoff/` or its `README.md`.
- Impact: An implementer who writes the patch anywhere else, such as the repository root or the change folder (which the implement stage may not write), leaves the deliver stage nothing to hand over, so H1 and H2 never reach the pull request.
- Fix: In tasks 9.1 and 9.2, write the paths in full: `temporary-docs/gnomish/github-oinsio-time-zones-138/handoff/H1-ci-fetch-history.patch` (and `…/H2-adr-silent-data-updates.patch`), each with its `## H<n>: <title>` section in `temporary-docs/gnomish/github-oinsio-time-zones-138/handoff/README.md`.
- Fix risk: none.
- Status: fixed
- Resolution: tasks.md 9.1 and 9.2 now write the patches to `temporary-docs/gnomish/github-oinsio-time-zones-138/handoff/H1-ci-fetch-history.patch` and `…/H2-adr-silent-data-updates.patch`, each with its `## H<n>: <title>` section in that folder's `README.md`.

## Verdict

Needs revision. Blocking: R1 and R2 (both WARNING). Task 7.3 cannot be completed as written, and the old attribution assertions would fail outside the scoped runs. R3 and R4 are polish.
