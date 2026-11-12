# Specs review: add-remote-zone-rules-updates

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 37/37 |
| Contradictions | 2 |
| CRITICAL | 1 |
| WARNING | 1 |
| SUGGESTION | 0 |

## Freshness

- ✅ `src/boot.ts` calls `bootApp` with `loadZoneRules: () => loadZoneRules(zoneRulesUrl)` and `zoneRulesUrl` from `virtual:zone-rules-url` (`packages/client/src/boot.ts:1,14`).
- ✅ `loadZoneRules(releaseUrl, fetchRelease)` fetches, parses with `parseZoneRulesRelease`, installs with `installZoneRulesDateTimeFormat` and rejects on failure (`src/lib/zoneRules/loadZoneRules.ts`); `bootApp` catches and logs (`src/lib/legacy/bootApp.ts:25-28`).
- ✅ `getInstalledRelease()` has no production caller outside `src/lib/zoneRules/` (its only outside caller is the test `src/test/installZoneRules.test.ts:19`).
- ✅ Compiler release-name check `RELEASE_NAME = /^\d{4}[a-z]$/` (`scripts/zoneRules/compile.ts:21,38`); `IANA_RELEASES_URL` (`scripts/zoneRules/downloadRelease.ts:11`).
- ✅ Committed release `packages/client/zone-rules/release.json` is `2026f`, 105 590 bytes; `ZONE_RULES_RELEASE_FILE` is used from `app.config`.
- ✅ `useUpdateRecheckOnReturn`, `UPDATE_RECHECK_INTERVAL_MS`, `ignoreFailedUpdateCheck` (`src/controller/useUpdateRecheckOnReturn.ts:3,10,21`, `src/constants/update.ts:9`); `usePwaUpdateStatus` returns `applyUpdate` via `updateServiceWorker` (`src/controller/usePwaUpdateStatus.ts:25,48`).
- ✅ `AppShell.tsx` is 168 lines; `app_shell_notices.steps.ts` is 273 lines; `Notice` dismisses on Esc (`src/app/Notice.tsx:23`); `app.reload`/`app.dismiss` exist (`src/locales/en.json:13-14`).
- ✅ `STORAGE_KEYS` holds `LOCATIONS`/`PREFERENCES` (`src/constants/storage.ts:6-7`); `LocationsLoadStatus.LOADED|EMPTY|UNREADABLE` and `SaveOutcome.SAVED|FAILED` (`src/ports/locationRepository.ts:13-27`); `adapters/city-search/` is a sub-module with its own `index.ts`.
- ✅ The new `src/adapters/storedRelease/` may import `@/constants` and `@/ports` at boot without loading Temporal: no file under `src/constants/` imports `@/lib/temporal` or `temporal-polyfill`, `@/preferences` imports only its own files, and `src/ports/*` import `@/model` only as `import type`.
- ✅ `DeployTime` renders `<p data-deploy-time className="text-center text-sm text-accent">` (`src/app/settings/DeployTime.tsx:11`); `DeployTime.test.tsx:46` asserts "should be the last element of main"; `DEPLOY_TIME_SCREENSHOT_STYLE` is in `src/test/features/locations/steps/locations_layout_e2e.steps.ts:12`.
- ✅ `vite.config.ts` registers `zoneRulesPlugin()` (line 42), uses `resolveDeployInstant()` (line 26) and Workbox `globPatterns` including `json` (line 68), so emitted JSON would be precached today; `check-bundle-size.mjs` checks the `zone-rules-` asset against `ZONE_RULES_ASSET_BUDGET_KB`.
- ✅ `deploy.yml` runs on `push` to `main` and `workflow_dispatch` and calls `ci.yml` with `upload-pages-artifact`; `ci.yml` is `workflow_call` with `actions/checkout@v5` and runs `pnpm test` (`.github/workflows/ci.yml:9-43`).
- ✅ Test helpers named by the tasks exist: `createSwitchableClock` (`src/test/switchableClock.ts:9`), `setPageVisibility` (`src/test/pageVisibility.ts:7`), `src/test/localStorageMock.ts`, `fakeServiceWorkerModule` (`src/test/fakeServiceWorker.ts:17`), `src/i18n.test.ts`, `src/app/AppShell.notices.test.tsx`.
- ✅ `compile.stops.test.ts:134-141` "rejects the release name %s" lists `2026fx`, as task 2.2 says.
- ✅ Package scripts named by the tasks exist (`check:bundle-size`, `check:legacy-build`, `zone-rules:compile`, `zone-rules:check`, `test:bdd`, `typecheck`, `lint` in `packages/client/package.json`); playwright-bdd picks up `src/test/features/**/*_e2e.feature` (`playwright.bdd.config.ts:24`).
- ✅ `docs/glossary/zone-rules.md` has 9 `- **` entries today, so 6 new terms give the 15 task 1.3 expects; the glossary files `app-shell.md`/`settings.md` hold the **Update recheck**, **Settings page** and **Deploy time** entries the task extends.
- ✅ MODIFIED "Deploy time" restates `openspec/specs/settings/spec.md:735` with only the "last line" clause changed; its scenarios are identical (diffed). MODIFIED "Works offline after the first visit" restates `openspec/specs/app-delivery/spec.md:42` and adds to it.
- ✅ Nothing of the change is implemented yet: no `releaseOrder`, `storedRelease`, `useZoneRulesUpdate` or `zone-rules/version.json` in `packages/client/`; the dependency `add-zone-rules-from-iana` is archived.
- ❌ Implicit in design D7 (`design.md:50`, the workflow runs `pnpm test` before committing a new release, and the deploy it calls runs `ci.yml`'s `pnpm test`): that the test suite passes on a newly compiled release. It does not: `src/test/installZoneRules.test.ts:19` (`toBe("2026f")`), `src/test/zoneRules/zoneRulesPlugin.virtualModules.test.ts:20` (`toBe("2026f")`), `src/test/features/zone_rules/steps/zone_rules_release.steps.ts:79` with `zone_rules_release.feature:18` ("A zone whose last type holds forever") and `zone_rules_release.steps.ts:145` with `zone_rules_release.feature:36`, and `src/test/features/zone_abbreviations/steps/zoneAbbreviationsWorld.ts:69` with `zone_abbreviations_unit.feature:87` all assert that the committed release is named `2026f` (see R1).

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ app-delivery "Zone rules publication" | ✅ 8.1, 8.3, 8.4, 10.2 (H2); see R1 |
| FR2 | ✅ | ✅ app-delivery "Zone rules files are served and not precached", "Works offline" | ✅ 8.2, 8.3, 9.1 |
| FR3 | ✅ | ✅ zone-rules-updates "Zone rules update check" | ✅ 5.1–5.4 |
| FR4 | ✅ | ✅ "Failed checks are silent"; app-delivery "Works offline" | ✅ 5.2–5.4, 9.1 |
| FR5 | ✅ | ✅ "Release order" | ✅ 2.1–2.3 |
| FR6 | ✅ | ✅ "Active release at start" (stable zone-rules spec not modified, R2) | ✅ 4.1–4.3 |
| FR7 | ✅ | ✅ app-shell "Zone rules update notice"; "Dismissed notice stays dismissed" | ✅ 1.2, 5.3, 6.1–6.3 |
| FR8 | ✅ | ✅ settings "Zone rules release line", MODIFIED "Deploy time" | ✅ 1.2, 7.1–7.2 |
| FR9 | ✅ | ✅ "Stored release document" | ✅ 3.1, 5.3, 5.4 |
| NFR-P1 | ✅ | ✅ "Zone rules update check", "Zone rules files are served and not precached" | ✅ 5.3, 5.4, 8.2, 11.1 |
| NFR-P2 | ✅ | ✅ "Active release at start" | ✅ 4.2, 4.3 |
| NFR-A1 | ✅ | ✅ app-shell notice and settings line axe scenarios | ✅ 6.3, 7.3, 11.2 |
| NFR-R1 | ✅ | ✅ settings "Zone rules release line" | ✅ 7.3, 7.4 |
| UX1 | ✅ | ✅ app-shell "Zone rules update notice" | ✅ 6.1–6.3 |
| UX2 | ✅ | ✅ app-shell "Both notices at once" | ✅ 6.1, 6.2 |
| UX3 | ✅ | ✅ settings "Plain text in the accent colour" | ✅ 7.1, 7.3 |
| G1 | ✅ | n/a met by FR1–FR3 | n/a met by FR1–FR3 tasks; blocked in practice by R1 |
| G2 | ✅ | n/a met by FR6, FR8, M2 | n/a met by 4.x, 7.x, 9.1 |
| G3 | ✅ | n/a met by FR5, FR6 | n/a met by 2.x, 4.x |
| G4 | ✅ | n/a met by FR3, FR4, NFR-P1 | n/a met by 5.x |
| G5 | ✅ | n/a met by NFR-P1 | n/a met by 8.2, 11.1 |
| NG1 | ✅ | n/a | n/a — nothing applies a release live |
| NG2 | ✅ | n/a | n/a — files are static on the same origin |
| NG3 | ✅ | n/a | n/a — D7 commits directly, no PR |
| NG4 | ✅ | n/a | n/a — nothing about device zone data |
| NG5 | ✅ | n/a | n/a — one storage key, one release |
| NG6 | ✅ | n/a | n/a — no staging or preview publication |
| M1 | ✅ | n/a | ✅ 11.3 |
| M2 | ✅ | n/a | ✅ 9.1 |
| M3 | ✅ | ✅ "Release order" tables | ✅ 2.1, 2.3 |
| M4 | ✅ | ✅ "Failures change nothing", "Stored release is older or equal" | ✅ 4.2, 5.3, 5.4 |
| M5 | ✅ | ✅ "Files in the build", "Not precached" | ✅ 8.2 |
| M6 | ✅ | n/a | ✅ 4.4, 5.5, 6.4, 7.5 |
| M7 | ✅ | n/a | ✅ 10.2, 10.3 (H2, H3) |
| Q1 | ✅ | n/a | n/a — answered in proposal and `design.md` D7 (releases listing) |
| Q2 | ✅ | n/a | n/a — answered in `design.md` D7 |
| Q3 | ✅ | n/a | n/a — answered in `design.md` Alternatives ("Showing a pending release") |

## Consistency

- `design.md:50` (D7: the publication job runs `pnpm test` before committing a newly compiled release, and the deploy it calls runs `ci.yml`'s `pnpm test`) contradicts existing tests that assert the committed release is named `2026f`: `packages/client/src/test/installZoneRules.test.ts:19`, `src/test/zoneRules/zoneRulesPlugin.virtualModules.test.ts:20`, `src/test/features/zone_rules/steps/zone_rules_release.steps.ts:79,145`, `src/test/features/zone_abbreviations/steps/zoneAbbreviationsWorld.ts:69` (R1).
- `proposal.md:74` (FR6: "when the bundled release cannot be loaded, a valid stored release is used") and `specs/zone-rules-updates/spec.md:133-136` contradict the stable `openspec/specs/zone-rules/spec.md:228-246` ("Rules load before the app": the rules load "from one asset the service worker precaches"; "If the asset cannot be loaded or is invalid, the app MUST still start, with the engine's data"), which the change leaves unmodified (R2).

## Findings

### R1 — CRITICAL — The publication workflow can never publish a new release: tests pin the committed release to `2026f`
- Location: `openspec/changes/add-remote-zone-rules-updates/design.md:50`; `openspec/changes/add-remote-zone-rules-updates/tasks.md:57-62` (no task covers it)
- Rule: —
- Problem: D7 makes the workflow run `zone-rules:compile <name>`, `zone-rules:check` and then `pnpm test` before committing, and the deploy it calls runs `ci.yml`, which runs `pnpm test` again (`.github/workflows/ci.yml:43`). After a new release is compiled into `zone-rules/release.json`, at least five existing assertions fail, because they assert that the committed release is literally named `2026f`: `packages/client/src/test/installZoneRules.test.ts:19` (`expect(getInstalledRelease()?.release).toBe("2026f")`), `src/test/zoneRules/zoneRulesPlugin.virtualModules.test.ts:20` (`expect(document.release).toBe("2026f")`), `src/test/features/zone_rules/steps/zone_rules_release.steps.ts:79` (`expect(committedRelease.release).toBe(release)` with `"2026f"` from `zone_rules_release.feature:18`, scenario "A zone whose last type holds forever"), `zone_rules_release.steps.ts:145` (the same assertion with `"2026f"` from `zone_rules_release.feature:36`, scenario "The release carries its name") and `src/test/features/zone_abbreviations/steps/zoneAbbreviationsWorld.ts:69` (`expect(committedReleaseName).toBe(releaseName)` with `"2026f"` from `zone_abbreviations_unit.feature:87,94`). No task in `tasks.md` touches these tests, and no task runs the suite against a committed release with another name. The stable specs say the same and the change modifies none of them: `openspec/specs/zone-rules/spec.md:41,46` (Almaty and Dublin "read from the release `2026f`"), `:55-56` ("The release carries its name"), `:220` ("the zone rules check runs on the committed release `2026f`") and `openspec/specs/zone-abbreviations/spec.md:70,76` (table "built from the zone rules release `2026f`").
- Impact: Implemented as written, every scheduled run that finds a newer IANA release fails at `pnpm test`. It commits nothing and deploys nothing, so FR1, G1 and the whole point of the task (new rules without an app release) are never delivered. If the gate were dropped, the commit would land on `main` and then fail `ci.yml` in the deploy, leaving `main` red and the site unchanged. After archive, the stable specs listed above would also describe a committed release `2026f` that is no longer the committed one.
- Fix: In `tasks.md` section 8, add a task before 8.3: "Make the tests that read the committed release independent of its name (FR1): in `src/test/installZoneRules.test.ts:19`, `src/test/zoneRules/zoneRulesPlugin.virtualModules.test.ts:20`, `src/test/features/zone_rules/steps/zone_rules_release.steps.ts:79` (scenario 'A zone whose last type holds forever') and `:145` (scenario 'The release carries its name'), and `src/test/features/zone_abbreviations/steps/zoneAbbreviationsWorld.ts:69` (`expectBuiltFrom`), compare with the name read from `ZONE_RULES_RELEASE_FILE`, or assert that `parseReleaseName` accepts it, instead of the literal `2026f`. Reword the matching feature steps — `zone_rules_release.feature:18,24,35-36,40` and `zone_abbreviations_unit.feature:87,94` — to 'the committed release' without a name. Verify with `npx vitest run src/test/installZoneRules.test.ts`, then `npx vitest run src/test/zoneRules/zoneRulesPlugin.virtualModules.test.ts`, then the `zone_rules` and `zone_abbreviations` unit BDD feature runs, one at a time, and `grep -n '2026f' src/test/installZoneRules.test.ts src/test/zoneRules/zoneRulesPlugin.virtualModules.test.ts src/test/features/zone_rules/zone_rules_release.feature src/test/features/zone_abbreviations/zone_abbreviations_unit.feature` prints nothing." In the same change, add MODIFIED deltas that restate each requirement in full with "the committed release" in place of `2026f`: `specs/zone-rules/spec.md` → "Content of a zone rules release" (scenarios "A zone whose last type holds forever", "A zone whose listed changes end before the cutoff", and "The release carries its name" as "**WHEN** the committed release, compiled from `tzdata<name>.tar.gz`, is read / **THEN** its release name is `<name>`") and "Zone rules check against zdump" (scenario "The committed release passes"); `specs/zone-abbreviations/spec.md` → "One offline abbreviation table" (scenarios "Table built from the release" and "Abbreviations kept from the table before"). Append `FR1 of add-remote-zone-rules-updates` to each implements comment. The "Compiling a release" scenarios (`openspec/specs/zone-rules/spec.md:186-214`) keep `2026f` unmodified: they describe compiling a named archive, not which release is committed, so they stay true after a new release is published. In task 8.4, have the operator notes say that a run can still fail on release content, and that fixing it is then a human change, naming every such pin: the zdump fixtures (`src/test/zoneRules/fixtures/zdump/`: America/New_York, Asia/Almaty, Europe/Dublin) used by `zone-rules:check`; the release-content assertions of `zone_rules_release.steps.ts` (New York's cutoff type `EST`, last listed change in 2007 and future rule `EST5EDT,M3.2.0,M11.1.0`; Almaty's last listed change `2024-02-29T18:00:00Z` to `+05` and future rule `<+05>-5`; Dublin's empty change list, cutoff type `GMT` and future rule `IST-1GMT0,M10.5.0,M3.5.0/1`); and the abbreviation pairs of `zone_abbreviations_unit.feature` together with the designations listed in `zone-abbreviations.changes.json`.
- Fix risk: The fix adds deltas for two more capabilities (`zone-rules`, `zone-abbreviations`), so the proposal's "Modified Capabilities" and "What Changes" must list them; the `zone-rules` delta file is the same one R2 adds, so both sets of MODIFIED requirements go into one file. The pin "the committed release is 2026f" is lost as an explicit assertion, though `zone-rules:check` and the content assertions still guard the data. The content assertions stay pinned to today's data on purpose (they are regression checks of the compiler), so a release that changes New York, Almaty or Dublin, or an abbreviation pair, still blocks publication until a human updates them. The fix makes the workflow publish every release that leaves those pins intact, not every release unattended, and the operator notes must say so. The new task touches tests of the archived change `add-zone-rules-from-iana`. They are live code, not archive artifacts, so editing them is allowed, but their `@add-zone-rules-from-iana` tags must stay, next to new `@add-remote-zone-rules-updates @FR1` tags on the reworded scenarios.
- Status: open

### R2 — WARNING — FR6 changes the stable "Rules load before the app" requirement without a delta
- Location: `openspec/changes/add-remote-zone-rules-updates/proposal.md:74`; `openspec/changes/add-remote-zone-rules-updates/specs/zone-rules-updates/spec.md:96,133-136`; `openspec/specs/zone-rules/spec.md:228-246`
- Rule: `.claude/rules/delta-specs.md`
- Problem: The stable `zone-rules` requirement "Rules load before the app" says the rules load "from one asset the service worker precaches" and "If the asset cannot be loaded or is invalid, the app MUST still start, with the engine's data". Its scenario "A failed load still starts the app" says the main page is shown "with the engine's data". FR6 and the ADDED "Active release at start" now load a stored release instead of the asset when it is newer, and use a valid stored release when the asset fails. The change has no `specs/zone-rules/` delta, and the proposal's "Modified Capabilities" (`proposal.md:26-30`) does not list `zone-rules`.
- Impact: After archive, the two stable requirements contradict each other: a failed asset load with a valid stored release must use the engine's data under one and the stored release under the other. The scenario "A failed load still starts the app" stays true only by accident of its preconditions. An implementer or a later change cannot tell which one wins.
- Fix: Add `openspec/changes/add-remote-zone-rules-updates/specs/zone-rules/spec.md` with `## MODIFIED Requirements` → "Rules load before the app". Restate the stable text with these changes: the rules come from the bundled asset the service worker precaches, or from the stored release when it is newer (see zone-rules-updates "Active release at start"); the app starts with the engine's data only when neither can be loaded. In scenario "A failed load still starts the app", add the precondition "**AND** no valid stored release is kept". Append `FR6 of add-remote-zone-rules-updates` to the requirement's implements comment, and add `zone-rules`: MODIFIED "Rules load before the app" to `proposal.md` "Modified Capabilities" and "What Changes".
- Fix risk: none beyond keeping it consistent with R1, whose fix adds MODIFIED requirements to the same `specs/zone-rules/spec.md` delta file. The restated requirement must keep its other scenarios ("Offline start with the rules", "The asset is requested with the app") verbatim, and the code already planned in D3 matches the modified text.
- Status: open

## Verdict

Needs revision. Blocking: R1 (CRITICAL: implemented as written, the publication workflow fails on every new release, so the task's goal is never delivered). R2 should be fixed in the same revision.
