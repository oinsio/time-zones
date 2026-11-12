# Review: add-zone-rules-from-iana

## Summary

| Item | Value |
|---|---|
| Tasks verified | 46/47 |
| Requirements traced | 88/91 |
| CRITICAL | 0 |
| WARNING | 5 |
| SUGGESTION | 0 |

## Tasks

All paths below are under `packages/client/` unless they start with `docs/`, `openspec/` or `temporary-docs/`.

- ✅ 1.1 — `zone-rules/README.md:7` "Size" section (597 zones, 253 links, gzipped sizes); `app.config.ts:59` `ZONE_RULES_ASSET_BUDGET_KB = 22`. The size the budget is based on no longer matches the committed file: see R4.
- ✅ 1.2 — `src/lib/zoneRules/dateTimeFormatWrapper.polyfill.test.ts` records the option keys and methods temporal-polyfill asks for, and asserts them against an explicit list.
- ✅ 2.1 — `src/lib/zoneRules/core/zoneRulesConstants.ts:8-28` (cutoff, max hours, default time, min designation, `ETC_ZONE_AREA`, `RuleDateKind` const object; no imports); `app.config.ts:66` `ZONE_RULES_RELEASE_FILE`; `src/constants/zoneAbbreviations.ts` holds `LETTERS_ONLY_DESIGNATION` and `GMT_ZONE_NAME_PREFIX`, re-exported from `src/constants/index.ts`; `scripts/zoneData/extractZoneAbbreviations.ts` imports `../../src/constants/zoneAbbreviations.ts`; `tsconfig.app.json:7` has `ES2021.Intl`.
- ✅ 2.2 — `docs/glossary/zone-rules.md` has 9 `- **` entries; `docs/glossary/README.md:20` row; `docs/glossary/time.md:12` (unknown zone), `:23` (clock change gains `ZoneRules.changes`/`ListedClockChange`); `docs/glossary/browser-compatibility.md:8` legacy zone shim retired; no `getLegacyZoneNames`/`zoneShim` left in `docs/glossary` (on main from #117; pointers verified against the code).
- ✅ 3.1 — `src/lib/zoneRules/core/zoneRulesRelease.ts:83` `parseZoneRulesRelease`, `core/zoneRulesReleaseError.ts:5,15` const-object codes and typed error; tests `core/zoneRulesRelease.test.ts`, `core/zoneRulesRelease.errors.test.ts`.
- ✅ 3.2 — `core/futureRule.ts:154` `parseFutureRule` (with `core/futureRuleTokens.ts`); `core/futureRule.test.ts`.
- ✅ 3.3 — `core/futureRuleOffset.ts` `resolveFutureRule` with a per-rule `WeakMap` memo, `core/epochDays.ts` integer arithmetic (no `Date`, no Temporal); tests `futureRuleOffset.test.ts`, `epochDays.test.ts`.
- ✅ 3.4 — `core/localTimeType.ts:49-63` three ranges with binary search; `core/localTimeType.test.ts`.
- ✅ 3.5 — measured in this review: every core file at or above 94% once the zero-test static survivors are discounted (see Mutation); core files import only `./*.ts`.
- ✅ 4.1 — `scripts/zoneRules/signing.ts:10-11` fingerprint `7E3792A9…62AA7E34` and `2031-07-24`; `zone-rules/README.md:23-38` "Signing key" section with owner, fingerprint, expiry and the 2026-11-12 human verification.
- ✅ 4.2 — `scripts/zoneRules/readTzif.ts` (64-bit block, v1 rejected); `src/test/zoneRules/readTzif.test.ts`, `buildTzif.ts`, `fixtures/America_New_York.tzif`.
- ✅ 4.3 — `scripts/zoneRules/truncateToCutoff.ts:64`, `writeRelease.ts:36`; `src/test/zoneRules/truncateToCutoff.test.ts`, `writeRelease.test.ts`.
- ✅ 4.4 — `downloadRelease.ts`, `verifySignature.ts` (temporary `GNUPGHOME`, `VALIDSIG` last field), `compileWithZic.ts` (`version` check, `zic -b slim`), `compile.ts:177` `runZoneRulesCompile`; `src/test/zoneRules/compile.test.ts`, `downloadRelease.test.ts`; `package.json:13`.
- ✅ 4.5 — `scripts/zoneRules/checkAgainstZdump.ts`, `check.ts` `runZoneRulesCheck`; `src/test/zoneRules/checkAgainstZdump.test.ts`, `check.test.ts`, zdump fixtures with README; `package.json:14`.
- ✅ 4.6 — `zone-rules/release.json` (release `2026f`, 597 ids); `zone-rules/README.md:40` "Commands". Re-run in this review: `node scripts/zoneRules/check.ts` downloaded and verified 2026f and printed `0 differences`. The committed file is not the compiler's output, though: see R4.
- ❌ 4.7 — the mutation threshold is not met: `scripts/zoneRules/check.ts` measures 89.74% (minimum 90%). The other eight files pass (see Mutation). See R2.
- ✅ 5.1 — `src/test/fakeStaleDateTimeFormat.ts` (`createStaleDateTimeFormat`, `installStaleEngine`, `restoreEngine`, call log); `src/test/fakeStaleDateTimeFormat.test.ts`.
- ✅ 5.2 — `src/lib/zoneRules/dateTimeFormatWrapper.ts:160` `createZoneRulesDateTimeFormat`, `installZoneRules.ts` (`installZoneRulesDateTimeFormat`, `getKnownZoneIds`, `getInstalledRelease`), `currentInstant.ts` (no `Date.now`), `zoneNameParts.ts`; tests `dateTimeFormatWrapper.test.ts`, `.names.test.ts`, `.clock.test.ts`. The current-instant test is weak: see R1.
- ✅ 5.3 — `dateTimeFormatWrapper.polyfill.test.ts:158-215` (Almaty 13:00/+05:00, `resolveWallClock` rows, Ciudad Juárez, no Almaty construction after the install, case-insensitive at `:210-211`).
- ✅ 5.4 — `src/model/reduceWallTime.legacy.test.ts:16` over `installStaleEngine` and the wrapper.
- ✅ 5.5 — `dateTimeFormatWrapper.ts` measures 88.57% raw; all 5 survivors that keep it below 90% ran zero tests (an artifact of static mutants, see Mutation). Without them it is 95.38%.
- ✅ 6.1 — `scripts/zoneRules/zoneRulesPlugin.ts:24`, `addZoneRulesPreload.ts:9`; `src/vite-env.d.ts:32,38`; `vite.config.ts:42`, `vitest.config.ts`; tests `src/test/zoneRules/addZoneRulesPreload.test.ts`, `zoneRulesPlugin.test.ts`.
- ✅ 6.2 — `src/lib/zoneRules/loadZoneRules.ts`; `src/lib/legacy/bootApp.ts` (rules step after legacy support, `console.error` on rejection); `src/boot.ts`; tests `loadZoneRules.test.ts`, `bootApp.test.ts:121-122` (source scan covers `lib/zoneRules` and `core`).
- ✅ 6.3 — `src/test/installZoneRules.ts` (exports `realNativeDateTimeFormat`, `committedRelease`); `src/test/setup.ts:2` imports it first; `src/test/installZoneRules.test.ts`.
- ✅ 6.4 — `scripts/check-bundle-size.mjs`: asset present, gzipped budget, exactly one `preload`, no `modulepreload`, header names NFR-P1, NFR-P2.
- ✅ 6.5 — measured: `loadZoneRules.ts` 100%, `bootApp.ts` 100%, `addZoneRulesPreload.ts` 100%, `zoneRulesPlugin.ts` 91.78%.
- ✅ 7.1 — `scripts/zoneRules/releaseZonePeriods.ts:131`, used at `scripts/zoneData/zoneDataPlugin.ts:69`; `moment-timezone` absent from `package.json`; `src/test/zoneRules/releaseZonePeriods.test.ts` compares with `fixtures/zone-abbreviations.before.json` and `changes.json` (`{}`).
- ✅ 7.2 — `src/adapters/city-search/zoneCitiesSource.ts:29-34` (`getKnownZoneIds()`, area outside `Etc`); `zoneCitiesSource.matching.test.ts:95-171`. The real no-release path is untested: see R3.
- ✅ 7.3 — `src/test/features/browser_compatibility/steps/legacyZoneWorld.ts:22-23` over `startOnStaleEngine` (no `loadLegacySupport`/`buildOutdatedDateTimeFormat`); tags at `time_selection_wall_time_input_unit.feature:252` and `locations_device_time_data_unit.feature:62`; `browser_compatibility_legacy_zones.feature:13` "Outdated zone data alone needs no polyfills".
- ✅ 7.4 — the shim files and `src/constants/legacy.ts` are deleted; `src/lib/legacy/index.ts` has no shim exports; `needsLegacySupport.ts:10-15` has two checks; `src/model/timeZoneId.ts:11` JSDoc names FR5; `timeZoneId.test.ts:14,38,50`; the M7 grep prints nothing.
- ✅ 7.5 — measured: `releaseZonePeriods.ts` 100%, `zoneCitiesSource.ts` 97.92%, `needsLegacySupport.ts` 100%, `timeZoneId.ts` 94.12%.
- ✅ 8.1 — `src/test/features/zone_rules/zone_rules_future_rule.feature` + `steps/zone_rules_future_rule.steps.ts`.
- ✅ 8.2 — `zone_rules_lookup.feature` + `steps/zone_rules_lookup.steps.ts` (row, hour strip, hint, date bar through `@/presenter`).
- ✅ 8.3 — `zone_rules_known_zones.feature` (Ciudad Juárez `02:00` `UTC−6`, Kyiv `09:30` `UTC+2`, Mars unknown) + steps.
- ✅ 8.4 — `zone_rules_wrapper.feature` (six scenarios) + steps.
- ✅ 8.5 — `zone_rules_release.feature` (release content, check) and `zone_rules_compile.feature` (compiler stops, truncation) + steps.
- ✅ 8.6 — `zone_rules_budget.feature` (asset budget and three work bounds with `startWorkCount()`) + steps.
- ✅ 8.7 — `location_search_by_name.feature` (three scenarios) + steps; `zone_abbreviations_unit.feature` "Table built from the release", "Abbreviations kept from the table before".
- ✅ 8.8 — `zone_rules_boot_e2e.feature:6-35` (four scenarios) + `steps/zone_rules_boot_e2e.steps.ts`; `locations_ui_e2e.feature:152` `@add-zone-rules-from-iana @NFR-R1 @UX2`.
- ✅ 9.1 — `docs/architecture/overview.md:22,76-77,83`; ADR-0014 links resolve.
- ✅ 9.2 — `temporary-docs/gnomish/github-oinsio-time-zones-119/handoff/H1-ci-zone-rules-check.patch`; `git apply --check` passes.
- ✅ 9.3 — `handoff/H2-temporal-rule-zone-rules.patch`; `git apply --check` passes.
- ✅ 9.4 — `handoff/H3-adr-0006-zone-list-note.patch`; `git apply --check` passes.
- ✅ 10.1 — the integration commands passed in the implement stage (CI green); `zone-rules:check` re-run here prints `0 differences`.
- ✅ 10.2 — the BDD e2e run is green in CI; the screenshot outline carries the new tags with its baselines unchanged.
- ✅ 10.3 — the traceability loop over FR1–FR10, NFR-P1–P3, NFR-A1, NFR-R1, UX1, UX2 prints nothing (re-run in this review).
- ✅ 10.4 — no `footer rule`, `DST rule`, `old browser` or `legacy browser` in the changed code; new names match `docs/glossary/zone-rules.md`.

## Requirements

- ✅ FR1 — `src/lib/zoneRules/dateTimeFormatWrapper.ts` is installed as the global `Intl.DateTimeFormat` (`installZoneRules.ts:27-36`) in `bootApp` before the app loads; tested by `zone_rules_lookup.feature` "A stale engine shows the current rules" and "Temporal and the presenter agree", and by `dateTimeFormatWrapper.polyfill.test.ts`.
- ✅ FR2 — `core/zoneRulesRelease.ts`, `scripts/zoneRules/truncateToCutoff.ts`, `writeRelease.ts`; `zone_rules_release.feature` (local time type, future rule, links, release name) on the committed `2026f`.
- ✅ FR3 — `core/futureRule.ts`, `core/futureRuleOffset.ts`; `zone_rules_future_rule.feature` outlines and `futureRuleOffset.test.ts` (−167..167 hours, negative DST, `<+05>-5`, `0/0,J365/25`, after 2037).
- ✅ FR4 — `core/localTimeType.ts:49-63`; `zone_rules_lookup.feature` "Lookup across the three ranges", "Before the cutoff the cutoff type holds"; `localTimeType.ts` measures 100% mutation.
- ✅ FR5 — `src/model/timeZoneId.ts` through the wrapper, shim removed, `needsLegacySupport.ts:10-15`; `zone_rules_known_zones.feature`, `timeZoneId.test.ts`, `browser_compatibility_legacy_zones.feature:13`.
- ✅ FR6 — the wrapper (parts, `resolvedOptions`, zone names, fall-through, `formatRange`, current instant) plus the boot order in `src/boot.ts`; `zone_rules_wrapper.feature`, `dateTimeFormatWrapper*.test.ts`. The current-instant path is tested too weakly: see R1.
- ✅ FR7 — `scripts/zoneRules/compile.ts`, `downloadRelease.ts`, `verifySignature.ts`, `compileWithZic.ts`; `zone_rules_compile.feature`, `compile.test.ts`.
- ⚠️ FR8 — the check is implemented (`scripts/zoneRules/check.ts`, `checkAgainstZdump.ts`, tested by `check.test.ts`, `checkAgainstZdump.test.ts`, `zone_rules_release.feature`) and the committed release passes (re-run: `0 differences`). "CI MUST run it on every pull request" waits on handoff H1 (`.github/` is a human path), so no finding. `check.ts` is below the mutation minimum: R2.
- ✅ FR9 — `releaseZonePeriods.ts` feeds `zoneDataPlugin.ts:69`; `zoneCitiesSource.ts:29-34`; `releaseZonePeriods.test.ts` (before table, changes list), `zone_abbreviations_unit.feature`, `location_search_by_name.feature`.
- ✅ FR10 — `loadZoneRules.ts`, `bootApp.ts` catch-and-log, precached asset; `zone_rules_boot_e2e.feature` "Offline start with the rules", "A failed load still starts the app"; `bootApp.test.ts`. The search's fallback when nothing is installed is untested on its real path: R3.
- ✅ NFR-P1 — `scripts/check-bundle-size.mjs` budget check, `app.config.ts:59`; `zone_rules_budget.feature` "Asset budget". Measured asset 20 947 bytes gzipped against 22 528 (see R4 for the stale basis).
- ✅ NFR-P2 — `addZoneRulesPreload.ts` and the plugin's `transformIndexHtml`; `zone_rules_boot_e2e.feature:6` "The asset is requested with the app"; the one-preload check in `check-bundle-size.mjs`.
- ✅ NFR-P3 — `zone_rules_budget.feature` work bounds of a lookup, the wrapper and presenting rows; `dateTimeFormatWrapper.clock.test.ts` one native construction and one/two native calls.
- ✅ NFR-A1 — `zone_rules_boot_e2e.feature:32` axe-core scenario.
- ✅ NFR-R1 — `src/test/features/locations/locations_ui_e2e.feature:152` tags the approved screenshot outline.
- ✅ UX1 — `zone_rules_lookup.feature` "Temporal and the presenter agree" (row, hour cell, hint and date bar all `13:00`).
- ✅ UX2 — no UI change in the diff; axe scenario and screenshot outline tagged `@UX2`.
- ✅ M1 — the traceability loop of task 10.3 prints nothing.
- ✅ M2 — re-run here: `node scripts/zoneRules/check.ts` → `0 differences` for `2026f`.
- ✅ M3 — `zone_rules_lookup.feature` (Almaty `13:00`, `UTC+5` with the stale fake) and `zone_rules_known_zones.feature` (Ciudad Juárez `02:00`, `UTC−6`).
- ✅ M4 — sign, negative DST, hours outside 0–24, never-firing rule, angle brackets and after 2037 in `zone_rules_future_rule.feature`/`futureRuleOffset.test.ts`; 64-bit block only in `readTzif.test.ts`.
- ✅ M5 — `check-bundle-size.mjs` checks initial JS ≤ 150 KB, the asset ≤ `ZONE_RULES_ASSET_BUDGET_KB` and exactly one preload; CI green.
- ⚠️ M6 — not met for three logic modules: `currentInstant.ts` 60% (R1), `check.ts` 89.74% (R2), `installZoneRules.ts` 87.5% (R3). Every other module is ≥ 90% (see Mutation).
- ✅ M7 — `moment-timezone` absent from `package.json`; the production grep for `supportedValuesOf`, `isZoneDataOutdated`, `LEGACY_ZONE_PROBE_ID` and `zoneShim` prints nothing.
- ✅ Scenario: A check fails — unchanged CI behaviour; the new zone rules checks are build checks (`check-bundle-size.mjs`) and H1.
- ✅ Scenario: Bundle exceeds the budget — unchanged; `scripts/check-bundle-size.mjs` initial JS check.
- ✅ Scenario: A timing budget is missed — unchanged; `scripts/check-bench-budgets.mjs`.
- ✅ Scenario: Unit tests ignore runner speed — unchanged; no `performance.now()` in the new tests (grep of the diff).
- ✅ Scenario: Built code is newer than Safari 12 — unchanged; `scripts/check-legacy-build.mjs`.
- ✅ Scenario: Built CSS uses the inset shorthand — unchanged; `scripts/check-legacy-build.mjs`.
- ✅ Scenario: Built CSS uses dvh without a fallback — unchanged; `scripts/check-legacy-build.mjs`.
- ✅ Scenario: Sources use BigInt — unchanged; `src/test/noBigIntInSources.test.ts`, and `readTzif.ts` reads 64-bit times as two 32-bit halves.
- ⚠️ Scenario: Zone rules differ from zdump — `check.ts` exits 1 and names the zone (`check.test.ts:163-185`); running it on every pull request waits on handoff H1.
- ✅ Scenario: Zone rules asset exceeds its budget — `check-bundle-size.mjs` prints the actual size and the budget and exits non-zero.
- ✅ Scenario: Modern engine skips the polyfills — `browser_compatibility_legacy_boot.feature`.
- ✅ Scenario: Legacy engine installs the polyfills first — `browser_compatibility_legacy_boot.feature`; `bootApp.test.ts` order legacy, rules, app.
- ✅ Scenario: Initial JavaScript stays in budget — `check-bundle-size.mjs`.
- ✅ Scenario: Outdated zone data alone needs no polyfills — `browser_compatibility_legacy_zones.feature:13` + steps; `needsLegacySupport.test.ts`.
- ✅ Scenario: A zone the engine rejects is offered — `location_search_by_name.feature` + steps; `zoneCitiesSource.matching.test.ts:142`.
- ✅ Scenario: The engine's own list plays no part — `location_search_by_name.feature` + steps.
- ✅ Scenario: Offset-only zones are not offered — `location_search_by_name.feature` + steps; `zoneCitiesSource.matching.test.ts:157-166`.
- ✅ Scenario: Derived city first, exemplar city after loading — `locations_device_time_data_unit.feature`, unchanged.
- ✅ Scenario: Loading fails — `locations_device_time_data_unit.feature`, unchanged.
- ✅ Scenario: No load without the device time location — `locations_device_time_data_unit.feature`, unchanged.
- ✅ Scenario: One request for city labels and the device time location — `locations_device_time_data_unit.feature`, unchanged.
- ✅ Scenario: Renamed device time zone — `locations_device_time_data_unit.feature:62-63` tagged `@add-zone-rules-from-iana @FR5`, run over `startOnStaleEngine`.
- ✅ Scenario: A renamed zone on outdated zone data — `time_selection_wall_time_input_unit.feature:252-253` tagged, run over `legacyZoneWorld.ts`.
- ✅ Scenario: Available on the first render offline — `zone_abbreviations_unit.feature`, unchanged.
- ✅ Scenario: Table size — unchanged; the table is part of the initial JS checked by `check-bundle-size.mjs`.
- ✅ Scenario: Table built from the release — `zone_abbreviations_unit.feature` + `zone_abbreviations_unit.steps.tsx`.
- ✅ Scenario: Abbreviations kept from the table before — `zone_abbreviations_unit.feature`; `releaseZonePeriods.test.ts:99-120` with `zone-abbreviations.before.json`/`changes.json`.
- ✅ Scenario: A stale engine shows the current rules — `zone_rules_lookup.feature` + steps.
- ✅ Scenario: Temporal and the presenter agree — `zone_rules_lookup.feature` + steps.
- ✅ Scenario: Wall-clock resolution uses the rules — `zone_rules_lookup.feature` + steps.
- ✅ Scenario: A local time type — `zone_rules_release.feature` + steps.
- ✅ Scenario: A zone with a future rule — `zone_rules_release.feature` + steps.
- ✅ Scenario: A zone whose last type holds forever — `zone_rules_release.feature` + steps.
- ✅ Scenario: A zone whose listed changes end before the cutoff — `zone_rules_release.feature` + steps.
- ✅ Scenario: A link resolves to its target's rules — `zone_rules_release.feature` + steps.
- ✅ Scenario: The release carries its name — `zone_rules_release.feature` + steps.
- ✅ Scenario: Future rule forms — `zone_rules_future_rule.feature` + steps.
- ✅ Scenario: Transitions are read in the local time in force — `zone_rules_future_rule.feature` + steps.
- ✅ Scenario: Julian day forms — `zone_rules_future_rule.feature` + steps.
- ✅ Scenario: Lookup across the three ranges — `zone_rules_lookup.feature` + steps.
- ✅ Scenario: Before the cutoff the cutoff type holds — `zone_rules_lookup.feature` + steps.
- ✅ Scenario: A zone the engine rejects is known — `zone_rules_known_zones.feature` + steps.
- ✅ Scenario: A legacy name stays canonical — `zone_rules_known_zones.feature` + steps.
- ✅ Scenario: A name in neither is unknown — `zone_rules_known_zones.feature` + steps.
- ✅ Scenario: Parts come from the rules — `zone_rules_wrapper.feature` + steps.
- ✅ Scenario: Formatting in Russian keeps the locale — `zone_rules_wrapper.feature` + steps.
- ✅ Scenario: Zone names — `zone_rules_wrapper.feature` outline + steps.
- ✅ Scenario: Resolved options keep the requested id — `zone_rules_wrapper.feature` outline + steps.
- ✅ Scenario: Unknown zones fall through — `zone_rules_wrapper.feature` + steps.
- ✅ Scenario: A formatter without a date formats the current instant — `zone_rules_wrapper.feature` + steps, `dateTimeFormatWrapper.clock.test.ts:105-114` (weak, see R1).
- ✅ Scenario: A valid archive compiles — `zone_rules_compile.feature` + `steps/zone_rules_compile.steps.ts`.
- ✅ Scenario: The archive comes from the release address — `zone_rules_compile.feature` + steps.
- ✅ Scenario: A bad signature stops the compiler — `zone_rules_compile.feature` + steps.
- ✅ Scenario: A signature by another key stops the compiler — `zone_rules_compile.feature` + steps.
- ✅ Scenario: A version mismatch stops the compiler — `zone_rules_compile.feature` + steps.
- ✅ Scenario: Truncation keeps the cutoff type — `zone_rules_compile.feature` + steps.
- ✅ Scenario: The committed release passes — `zone_rules_release.feature` + steps over the zdump fixtures; confirmed live (`0 differences`).
- ✅ Scenario: A wrong rule fails the check — `zone_rules_release.feature` + steps.
- ✅ Scenario: Offline start with the rules — `zone_rules_boot_e2e.feature:12`.
- ✅ Scenario: The asset is requested with the app — `zone_rules_boot_e2e.feature:6`.
- ✅ Scenario: A failed load still starts the app — `zone_rules_boot_e2e.feature:23`; `bootApp.test.ts`.
- ✅ Scenario: Asset budget — `zone_rules_budget.feature` + steps.
- ✅ Scenario: Work bound of a lookup — `zone_rules_budget.feature` + steps.
- ✅ Scenario: Work bound of the wrapper — `zone_rules_budget.feature` + steps.
- ✅ Scenario: Work bound of presenting rows — `zone_rules_budget.feature` + steps.
- ✅ Scenario: No accessibility violations on the main page — `zone_rules_boot_e2e.feature:32`.
- ✅ Scenario: The approved screens stay the same — `locations_ui_e2e.feature:152`.

## Mutation

**How it was measured.** Stryker was run on each file listed below, at most five files per run, one run at a time. A first run with the project config (`npx stryker run --mutate '<5 zoneRules files>'`) did not finish within 590 s and was stopped. `src/test/setup.ts` installs the wrapper for every test, so the dry run executes the whole unit suite as "related". The later runs therefore used a throwaway config outside the repository (`/tmp/zr/stryker.narrow.config.mjs`). It loads `vitest.config.ts` unchanged and only narrows `test.include` to the tests of the mutated files: `src/lib/zoneRules/**`, `src/test/zoneRules/*`, `src/test/*.test.ts`, the `zone_rules` steps, and, for the batches that need them, the `zone_abbreviations`, `location_search`, `browser_compatibility`, `src/lib/legacy`, `src/adapters/city-search` and `src/model/timeZoneId` tests. Those are the only tests that target these files, but the scores are a lower bound.

**Zero-test survivors.** Some mutants are "static": the code runs while the test setup loads the release (`parseZoneRulesRelease`, `parseFutureRule`, the wrapper constructor). In these runs Stryker marked them Survived with `testsCompleted: 0`, meaning no test ran against them. They are counted as not measured, not as gaps. Both numbers are given.

| File | Raw score | Zero-test survivors | Score without them |
|---|---|---|---|
| `src/lib/zoneRules/dateTimeFormatWrapper.ts` | 88.57% | 5 | 95.38% |
| `src/lib/zoneRules/currentInstant.ts` | 60.00% | 0 | 60.00% (R1) |
| `src/lib/zoneRules/zoneNameParts.ts` | 96.55% | 0 | 96.55% |
| `src/lib/zoneRules/installZoneRules.ts` | 87.50% | 0 | 87.50% (R3) |
| `src/lib/zoneRules/loadZoneRules.ts` | 100% | 0 | 100% |
| `src/lib/zoneRules/core/localTimeType.ts` | 100% | 0 | 100% |
| `src/lib/zoneRules/core/futureRuleOffset.ts` | 97.50% | 0 | 97.50% |
| `src/lib/zoneRules/core/epochDays.ts` | 95.77% | 0 | 95.77% |
| `src/lib/zoneRules/core/futureRule.ts` | 51.59% | 60 | 98.48% |
| `src/lib/zoneRules/core/futureRuleTokens.ts` | 50.00% | 30 | 94.12% |
| `src/lib/zoneRules/core/readZoneRules.ts` | 59.18% | 38 | 96.67% |
| `src/lib/zoneRules/core/zoneRulesRelease.ts` | 50.00% | 29 | 100% |
| `scripts/zoneRules/readTzif.ts` | 94.68% | 0 | 94.68% |
| `scripts/zoneRules/truncateToCutoff.ts` | 100% | 0 | 100% |
| `scripts/zoneRules/writeRelease.ts` | 92.59% | 0 | 92.59% |
| `scripts/zoneRules/checkAgainstZdump.ts` | 96.88% | 0 | 96.88% |
| `scripts/zoneRules/verifySignature.ts` | 97.73% | 0 | 97.73% |
| `scripts/zoneRules/downloadRelease.ts` | 100% | 0 | 100% |
| `scripts/zoneRules/compileWithZic.ts` | 97.14% | 0 | 97.14% |
| `scripts/zoneRules/compile.ts` | 91.67% | 0 | 91.67% |
| `scripts/zoneRules/check.ts` | 89.74% | 0 | 89.74% (R2) |
| `scripts/zoneRules/releaseZonePeriods.ts` | 100% | 0 | 100% |
| `scripts/zoneRules/zoneRulesPlugin.ts` | 91.78% | 0 | 91.78% |
| `scripts/zoneRules/addZoneRulesPreload.ts` | 100% | 0 | 100% |
| `src/adapters/city-search/zoneCitiesSource.ts` | 97.92% | 0 | 97.92% |
| `src/lib/legacy/bootApp.ts` | 100% | 0 | 100% |
| `src/lib/legacy/needsLegacySupport.ts` | 100% | 0 | 100% |
| `src/lib/legacy/installLegacySupport.ts` | 100% | 0 | 100% |
| `src/model/timeZoneId.ts` | 94.12% | 0 | 94.12% |

`scripts/zoneData/zoneDataPlugin.ts` got 0% with every mutant NoCoverage. It runs inside the Vite config and no unit test imports it, which was already true before this change, so it was not measurable this way. M6 does not cover it. The zero-test numbers for the static core files are not proven kills: a run with the project config and a longer time limit would confirm them.

## Findings

### R1 — WARNING — The current-instant reader is tested only on its hour
- Location: `packages/client/src/lib/zoneRules/dateTimeFormatWrapper.clock.test.ts:75-114` (the code under test: `packages/client/src/lib/zoneRules/currentInstant.ts:45-61`)
- Rule: `.claude/rules/tdd-workflow.md` (mutation ≥ 95%, minimum 90%); M6 of the proposal
- Problem: `createCurrentInstantReader` turns the year, month, day, hour, minute, second and fractional-second parts of the native UTC clock formatter into epoch milliseconds. Its only test fixes the clock at `2026-07-15T08:00:00.000Z` (minute, second and millisecond are all 0) and asserts only `format()` → `"13:00"` with time-only options. Stryker leaves 10 of 25 mutants alive (60%). Reading `"month"` or `"day"` as `""`, dropping the minute, second or millisecond term, and turning `*` into `/` for minutes and seconds all survive.
- Impact: a regression that misreads the month, the day, the minutes or the seconds of "now" goes unnoticed. For example, a wrapper `format()` with a date option would show January for a July "now", or `13:00` at 13:47. FR6's scenario "A formatter without a date formats the current instant" would still pass. The file fails M6 (minimum 90%).
- Fix: in `dateTimeFormatWrapper.clock.test.ts`, change `FIXED_INSTANT` to an instant where every field matters, e.g. `2026-11-28T19:47:31.250Z` (Almaty has no clock change near it). Add a case asserting that `formatToParts()` without a date returns the same parts as `formatToParts(FIXED_INSTANT)` with all fields to the second plus `fractionalSecondDigits: 3`. Optionally test `createCurrentInstantReader(ClockNative)()` directly for `FIXED_INSTANT`. Re-run `npx stryker run --mutate 'src/lib/zoneRules/currentInstant.ts'` to ≥ 90%.
- Fix risk: none — test-only. Keep the `ClockNative` proxy that substitutes `FIXED_INSTANT` for a date-less call, and keep the file under 200 lines (it has 146).
- Status: open

### R2 — WARNING — `check.ts` is below the mutation minimum; its missing-zone tests assert too loosely
- Location: `packages/client/scripts/zoneRules/check.ts:94-114` (`findMissingZone`) and `:79-84`; the tests at `packages/client/src/test/zoneRules/check.test.ts:169-186`
- Rule: `.claude/rules/tdd-workflow.md` (minimum 90%); task 4.7 and M6 of the change
- Problem: task 4.7 is ticked, but `check.ts` measures 89.74% (70/78). The tests "exits 1 when the compiled files hold a zone the release lacks" and "… the release holds a zone the compiled files lack" exist. They only check that the log contains the zone id and `no such zone in the release`. The fallback through `compareWithRelease` logs the same substring after running `zdump`, so the `findMissingZone` branch is never told apart. The survivors: `(zoneId) => !release.zones.has(zoneId)` → `() => undefined`, the `instant: "-"` and `expected` texts emptied, `if (!path) continue` dropped, the whitespace regex of `groupZdumpLinesByZone` weakened, `rm(…, { force: true })` flipped, and the uncovered `?? ""` for `--compiled` without a directory.
- Impact: if the compiler silently drops a zone, or the release keeps a zone IANA removed, the check is supposed to stop before running `zdump` and say which side lacks the zone. A regression in `findMissingZone` would still exit 1 through the fallback, but run `zdump` and print a misleading message, and no test would notice. The ticked task 4.7 is not met.
- Fix: tighten the two existing cases at `check.test.ts:169-186` instead of adding new ones. Assert the exact logged line (`Europe/Oslo differs at -: zdump says a zone of the release, the release says no such zone in the release`, and the `a compiled zone file` / `no such compiled file` line for `Asia/Kolkata`) and that no `zdump` call was recorded. Add one case for `--compiled` given without a directory (exit 1 with the check's error). If that case pushes the file past 300 lines, put it in a sibling `check.arguments.test.ts`. Re-run `npx stryker run --mutate 'scripts/zoneRules/check.ts'` to ≥ 90%.
- Fix risk: none for behaviour. A new sibling file needs the fakes of `compileFakes.ts`/`compileWorld.ts` and the `// FR8 of add-zone-rules-from-iana` header.
- Status: open

### R3 — WARNING — The "no release installed" path of the zone list is untested where it runs
- Location: `packages/client/src/lib/zoneRules/installZoneRules.ts:43-47` and `packages/client/src/adapters/city-search/zoneCitiesSource.ts:29-30`
- Rule: `.claude/rules/tdd-workflow.md` (mutation minimum 90%); FR10 and design D6 ("`undefined` when no release is installed, keeping today's 'offer every CLDR record' behaviour")
- Problem: when the boot's rules load fails (FR10), nothing is installed. `getKnownZoneIds()` must then return `undefined`, and `listKnownZones` must pass it on through `?.filter`. No test reaches this path. `zoneCitiesSource.matching.test.ts:112-116` injects its own `() => undefined` lister and bypasses both, and the test setup always installs a release. Stryker confirms it: `if (installedRelease === undefined) return undefined` → `false` survives (`installZoneRules.ts` 87.5%), and so does `getKnownZoneIds()?.filter` → `getKnownZoneIds().filter` in `zoneCitiesSource.ts`.
- Impact: a regression in either line throws a `TypeError` in the city search exactly when the zone rules asset failed to load. That is the state FR10 says must still give a working app, and no unit test or e2e scenario ("A failed load still starts the app" only checks the main page) would catch it. `installZoneRules.ts` fails M6.
- Fix: add `packages/client/src/lib/zoneRules/installZoneRules.test.ts`. Call `vi.resetModules()`, import `./installZoneRules.ts` fresh, and assert `getKnownZoneIds()` and `getInstalledRelease()` are `undefined`. In `zoneCitiesSource.matching.test.ts` (171 lines), add a case that calls `vi.resetModules()`, imports `./zoneCitiesSource` fresh (its fresh `@/lib/zoneRules` has nothing installed), and asserts `createZoneCitiesSource([moscow, almaty])` *without* a lister keeps every record plus `UTC`.
- Fix risk: low. `vi.resetModules()` only affects later dynamic imports in that file, and a fresh `@/lib/zoneRules` does not touch the global `Intl.DateTimeFormat` the setup installed. Put the fresh-import cases in their own `describe` after the static-import cases.
- Status: open

### R4 — WARNING — The committed release is not the compiler's output, and its documented size and budget basis are wrong
- Location: `packages/client/zone-rules/release.json:1` (reformatted in commit `2fcf9e1`), `packages/client/zone-rules/README.md:18-21`, `packages/client/app.config.ts:55-59`
- Rule: task 1.1 and NFR-P1 of the change ("`ZONE_RULES_ASSET_BUDGET_KB` (measured + 20 %, rounded up)"); design D1/D7 (the release is the compiler's reproducible output)
- Problem: `zone-rules:compile 2026f` wrote a compact file with one zone per line (commit `d704628`: 105 590 bytes, 18 204 gzipped). Biome then reformatted it into multi-line JSON: the root `biome.json` formats every file and `pnpm lint` runs `biome check .`, which rejects the compiler's output (verified: `npx biome check` on the `d704628` file fails). The committed file is now 165 338 bytes and 20 947 bytes gzipped, and the plugin emits it byte-for-byte as the asset. The README and the JSDoc of `ZONE_RULES_ASSET_BUDGET_KB` still say "105 590 bytes, gzips to 18 204 bytes … 22 is that size plus 20 %".
- Impact: (1) every `zone-rules:compile` run produces a whole-file diff against the committed release until someone reformats it. That defeats D1's "readable in the diff of a release bump", and the companion change's automated bumps would fail `pnpm lint`. (2) Users download about 2.7 KB more gzipped than measured. (3) The asset has 7% headroom under its 22 KB budget instead of the 20% task 1.1 prescribes, so an ordinary release bump can fail the build. (4) The recorded measurements in the README and `app.config.ts` are false.
- Fix: add `"!packages/client/zone-rules/release.json"` to `files.includes` in the root `biome.json`. Re-run `pnpm --filter @time-zones/client zone-rules:compile 2026f` (data.iana.org is reachable, and `zic`/`gpg` exist), then `pnpm --filter @time-zones/client zone-rules:check` (must print `0 differences`). Confirm `gzip -c zone-rules/release.json | wc -c` matches the README's 18 204 bytes, or update the README and the `app.config.ts` JSDoc to the measured numbers.
- Fix risk: low. The release file is no longer format-checked, which is intended because the compiler owns its format. `zoneRulesPlugin.test.ts` and `installZoneRules.ts` parse the file and do not depend on its whitespace. Keeping the pretty file and raising the budget instead would mean 25 KB, above NFR-P1's ≤ 24 KB target, so don't.
- Status: open

### R5 — WARNING — New and grown test files exceed the 200-line limit
- Location: `packages/client/src/test/zoneRules/check.test.ts` (294 lines), `src/test/features/zone_abbreviations/steps/zone_abbreviations_unit.steps.tsx` (291, was 215), `src/lib/zoneRules/core/zoneRulesRelease.errors.test.ts` (246), `src/test/zoneRules/checkAgainstZdump.test.ts` (239), `src/test/zoneRules/compile.test.ts` (233), `src/test/features/zone_rules/steps/zone_rules_lookup.steps.ts` (232), `src/test/features/zone_rules/steps/zone_rules_release.steps.ts` (221), `src/test/zoneRules/zoneRulesPlugin.test.ts` (216), `src/lib/zoneRules/dateTimeFormatWrapper.polyfill.test.ts` (215), `src/test/zoneRules/truncateToCutoff.test.ts` (214)
- Rule: `CLAUDE.md` Process Invariants ("Files must stay under 200 lines for AI context quality"); `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity"); tasks.md conventions ("every new or changed file stays under 200 lines")
- Problem: ten files this branch created or grew are between 214 and 294 lines. Two are within 10 lines of the 300 hard cap. None records why splitting would hurt clarity, and the tasks' own `wc -l` verification fails for them.
- Impact: the project caps file size because long files degrade AI context. `check.test.ts` is 6 lines short of the hard cap, so R2's extra case barely fits.
- Fix: split each plain test file by its `describe` groups into siblings with the same header comment, e.g. `check.test.ts` into `check.compiled.test.ts` and `check.download.test.ts`, and `zoneRulesRelease.errors.test.ts` into shape and consistency errors. For the three steps files, which `.claude/rules/bdd-unit.md` binds one-to-one to their feature, move helper functions into a world module next to the existing ones (`src/test/zoneRules/compileWorld.ts`, `src/test/staleEngineWorld.ts`) rather than splitting the steps file.
- Fix risk: low; no behaviour change. Keep each file's `FR-x of add-zone-rules-from-iana` header so the M1 loop still finds every id, and keep `f.Scenario` names exactly as in the features.
- Status: open

## Verdict

Not ready. Nothing is CRITICAL. The wrapper, the lookup, the future rule, the compiler and the check behave as specified, and the committed `2026f` release matches `zdump` (`0 differences`, re-run here). Five WARNINGs should be fixed before archive: R1 (untested current-instant fields, M6), R2 (`check.ts` below the mutation minimum; ticked task 4.7 not met), R3 (untested no-release fallback of the zone list, M6), R4 (the release was reformatted away from the compiler's output; size records and budget basis are wrong) and R5 (files over the 200-line limit). The FR8 CI step waits on the human handoff H1.
