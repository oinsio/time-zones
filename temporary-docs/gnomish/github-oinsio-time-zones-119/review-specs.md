# Specs review: add-zone-rules-from-iana

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 35/38 |
| Contradictions | 3 |
| CRITICAL | 1 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Freshness

- ✅ `src/boot.ts` calls `bootApp({ needsLegacySupport, loadLegacySupport, loadApp })` from `@/lib/legacy` (`packages/client/src/boot.ts:9-13`); `BootAppSteps` has `loadLegacySupport` and `bootApp` logs a failed legacy load with `console.error` (`src/lib/legacy/bootApp.ts:1-19`).
- ✅ `isZoneDataOutdated` probes `LEGACY_ZONE_PROBE_ID` (`src/lib/legacy/needsLegacySupport.ts:1-25`, `src/constants/legacy.ts:6` = `"Europe/Kyiv"`), and `installLegacySupport.ts:17` installs the shim on it.
- ✅ `src/lib/legacy/index.ts` exports `LegacyZoneNames` and `createLegacyZoneDateTimeFormat` from `./zoneShim`; `zoneShim.ts`, `zoneShim.test.ts`, `zoneShim.temporal.test.ts` and `zoneShim.errors.test.ts` all exist in `src/lib/legacy/`.
- ✅ `src/constants/index.ts:46` re-exports `LEGACY_ZONE_PROBE_ID` from `./legacy`; the constants index reaches `@/preferences` through `preferences.ts:1` and `localDateTime.ts:1`, and `src/preferences/` does not import Temporal.
- ✅ `needsLegacySupport.test.ts` imports `LEGACY_ZONE_PROBE_ID` (`:3`), has `rejectProbeZone` (`:9`) and the row "the engine rejects the probe zone" (`:46`). `installLegacySupport.test.ts` has exactly two zone-shim cases (`:34`, `:58`).
- ✅ `src/model/reduceWallTime.legacy.test.ts:3` uses `createLegacyZoneDateTimeFormat`. Its header today reads `Verifies FR13 of add-wall-time-input-with-hint (D1, M8)`.
- ✅ `bootApp.test.ts:13` scans for static imports of `@/lib/temporal`, `temporal-polyfill`, `react` and `./main` in the files of `src/lib/legacy/` (`:83-86`).
- ✅ `src/test/features/browser_compatibility/steps/legacyZoneWorld.ts` imports `loadLegacySupport` (`:3`), has `buildOutdatedDateTimeFormat` (`:21`) and `startOnOutdatedZoneData` calls `loadLegacySupport()` (`:56-61`); `FreshModules` and `restoreZoneData` are exported. `deviceTimeEngineWorld.ts:21` imports `FreshModules`, and `wallTimeHintScenarios.ts:8` and `locations_device_time_data_unit.steps.tsx:10` import `startOnOutdatedZoneData`. `rejectedZones` is used only by `expectZoneRejectedNatively`, which task 7.3 drops.
- ✅ `browser_compatibility_legacy_zones.feature` has "Zone checks work without BigInt", "Adding a renamed zone", "A renamed zone shows its time", "A wall-clock time in a renamed zone" and "A zone rejected under every name" (`:6-41`).
- ✅ `zoneCitiesSource.ts:21-24` defines `listBrowserTimeZones` over `Intl.supportedValuesOf("timeZone")`; with `undefined`, `collectZoneIds` (`:47-48`) falls back to every CLDR record. `zoneCitiesSource.matching.test.ts:100` has the `supportedValuesOf` case.
- ✅ `scripts/zoneData/extractZoneAbbreviations.ts` owns `ZONE_ABBREVIATION_RULES_YEAR = 2026` (`:9`) and `LETTERS_ONLY_DESIGNATION` (`:11`) and imports `../../src/lib/temporal.ts` (`:6`); `zoneDataPlugin.ts` has `ZONE_ABBREVIATIONS_PACKAGE = "moment-timezone"` (`:20`), `TzdbZone` (`:35`) and `readTzdbZonePeriods` (`:56`).
- ✅ `src/constants/zoneAbbreviations.ts` exists and has no imports (only `LOCALIZED_ZONE_ABBREVIATION_KEYS`). It is re-exported from `src/constants/index.ts:163`.
- ✅ `scripts/check-bundle-size.mjs` imports `../app.config.ts` (`:17`), counts `modulepreload` links (`:32`) and forbids a preload of `city-search-*` (`:26`, `:112`). The Workbox glob is `**/*.{js,mjs,css,html,ico,png,svg,json,woff2}` (`vite.config.ts:66`).
- ✅ `vitest.config.ts:17` inlines `temporal-polyfill`. `src/test/setup.ts:6` imports `@/lib/temporal`. `src/test/workCounters.ts` exports `startWorkCount` (`:33`) over a `Proxy` (`:45`).
- ✅ `tsconfig.app.json:7` has `lib: ["ES2020", "ES2022.Intl", "DOM", "DOM.Iterable"]` and `allowImportingTsExtensions`. `tsconfig.node.json:6` has `lib: ["ES2023"]`. The root `engines.node` is `>=26.0.0` and the sandbox runs Node v26.13.1. `scripts/check-bench-budgets.mjs:8` imports `./benchBudgets.ts`.
- ✅ `packages/client/package.json:66` lists `moment-timezone`; the package is `@time-zones/client` and has `check:bundle-size`, `check:legacy-build`, `test:bdd` and `typecheck` scripts. `.github/workflows/ci.yml:47` has the step "Check initial JS budget" that H1 anchors on.
- ✅ The named code owners exist: `presentLocationRows` (`src/presenter/index.ts`), `presentHourStrip` (`src/presenter/hourStrip.ts`), `presentDateBar` (`src/presenter/dateBar.ts`), `resolveWallClock` (`src/model/wallClock.ts`), `reduceLocations` and `ADD_LOCATION` (`src/model/locations.ts`, `locationCommands.ts`), `parseStoredLocations`, `canonicalizeTimeZoneId` (`src/model/timeZoneId.ts`, through `virtual:time-zone-aliases`), `createSwitchableClock` (`src/test/switchableClock`). `wallClock.test.ts` has the `GAP` and `AMBIGUOUS` cases.
- ✅ Production sources that still name `supportedValuesOf`, `isZoneDataOutdated`, `LEGACY_ZONE_PROBE_ID` or `zoneShim` today are exactly the files the change edits or deletes: `src/lib/legacy/{index,needsLegacySupport,installLegacySupport}.ts`, `src/constants/{index,legacy}.ts` and `src/adapters/city-search/zoneCitiesSource.ts`. `scripts/` holds none. The test worlds that call `Intl.supportedValuesOf` are under `src/test/` and are outside the M7 grep.
- ✅ The MODIFIED and REMOVED requirements exist in `openspec/specs/` under the restated names: "Checks on every pull request" (app-delivery), "Polyfills only where needed" and "Renamed zones on outdated zone data" (browser-compatibility), "Exemplar city of the device time location" (locations), "Wall-time input in a renamed zone" (time-selection) and "One offline abbreviation table" (zone-abbreviations). Every stable scenario is restated in its delta. No `zone-rules` capability exists yet, and no archived change implements it.
- ✅ ADR-0014 is `Accepted (2026-11-12)`. ADR-0003 (`:6`) and ADR-0009 (`:6`) carry the superseded note. ADR-0006 does not, which is why H3 exists.
- ✅ `docs/architecture/overview.md:68` has "Where things live" (task 9.1). The glossary owns **legacy engine**, **legacy support** (`browser-compatibility.md:6-7`, still naming the zone data of IANA 2022b and the shim) and **legacy zone name** (`time.md:11`).
- ✅ `scripts/zoneRules/tz-coordinator-key.asc` is committed and is the only file in `scripts/zoneRules/`.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ zone-rules "Zone rules are the only source of offsets" | ✅ 5.2, 5.3, 6.3, 8.2 |
| FR2 | ✅ | ✅ "Content of a zone rules release" | ✅ 3.1, 4.3, 8.5 |
| FR3 | ✅ | ✅ "Future rule evaluation" | ✅ 3.2, 3.3, 8.1 |
| FR4 | ✅ | ✅ "Local time type lookup" | ✅ 3.4, 8.2 |
| FR5 | ✅ | ✅ "Known zones come from the release", browser-compatibility, time-selection, locations | ✅ 7.3, 7.4, 8.3 |
| FR6 | ✅ | ✅ "Date and time formatting through the rules" | ✅ 1.2, 5.2, 8.4 |
| FR7 | ✅ | ✅ "Compiling a release" | ✅ 4.1, 4.4, 8.5 (runnable CLI: see R2) |
| FR8 | ✅ | ✅ "Zone rules check against zdump", app-delivery | ✅ 4.5, 4.6, 8.5; CI step is H1 |
| FR9 | ✅ | ✅ location-search, zone-abbreviations (Etc ids: see R1) | ✅ 7.1, 7.2, 8.7 |
| FR10 | ✅ | ✅ "Rules load before the app" | ✅ 6.1, 6.2, 8.8 (offline assertion: see R3) |
| NFR-P1 | ✅ | ✅ "Zone rules within their budgets", app-delivery | ✅ 1.1, 6.4, 8.6 |
| NFR-P2 | ✅ | ✅ "The asset is requested with the app" | ✅ 6.1, 6.4, 8.8 |
| NFR-P3 | ✅ | ✅ "Zone rules within their budgets" | ✅ 5.2, 8.6 |
| NFR-A1 | ✅ | ❌ no requirement or scenario in any delta | ✅ 8.8, 10.2 |
| NFR-R1 | ✅ | ❌ no requirement or scenario in any delta | ✅ 8.8, 10.2 |
| UX1 | ✅ | ✅ "Temporal and the presenter agree" | ✅ 8.2 |
| UX2 | ✅ | ❌ no requirement or scenario in any delta | ✅ 8.8 |
| G1 | ✅ | n/a, met by FR1 and M3 | n/a, met by FR1 and M3 |
| G2 | ✅ | n/a, met by FR5 | n/a, met by FR5 |
| G3 | ✅ | n/a, met by FR3 | n/a, met by FR3 |
| G4 | ✅ | n/a, met by FR8 and M2 | n/a, met by FR8 and M2 |
| G5 | ✅ | n/a, met by NFR-P1 and NFR-P2 | n/a, met by NFR-P1 and NFR-P2 |
| NG1 | ✅ | n/a, no artifact fetches or stores a release at run time | n/a |
| NG2 | ✅ | n/a, the cutoff type is used before 2000 as excluded | n/a |
| NG3 | ✅ | n/a, nothing models leap seconds | n/a |
| NG4 | ✅ | n/a, the wrapper gives designations or `GMT±H[:MM]` only | n/a |
| NG5 | ✅ | n/a, `temporal-polyfill` stays | n/a |
| NG6 | ✅ | n/a, a stale engine is a fake (D10) | n/a |
| M1 | ✅ | n/a | ✅ 10.3 |
| M2 | ✅ | ✅ "The committed release passes" | ✅ 4.6, 10.1 |
| M3 | ✅ | ✅ "A stale engine…", "A zone the engine rejects is known" | ✅ 8.2, 8.3 |
| M4 | ✅ | ✅ "Future rule evaluation" | ✅ 3.2, 3.3, 4.2, 8.1 |
| M5 | ✅ | n/a | ✅ 6.4 |
| M6 | ✅ | n/a | ✅ 3.5, 4.7, 5.5, 6.5, 7.5 |
| M7 | ✅ | n/a | ✅ 7.1, 7.4 |
| Q1 | ✅ | n/a, measured by task 1.1; design "Open Questions" sets the budget rule | n/a |
| Q2 | ✅ | n/a, answered by spike task 1.2 (design D5) | n/a |
| Q3 | ✅ | n/a, resolved in the proposal; pinned by task 4.1 (design D7) | n/a |

## Consistency

- FR9 (`proposal.md:87`) and the location-search delta (`specs/location-search/spec.md:6`) offer "the zone ids of the zone rules release". The release has the `Etc/GMT±N` zones of `etcetera` (design D7 `TZDATA_SOURCE_FILES`, `design.md:84`). UX2 (`proposal.md:110`) says "Nothing else moves or changes on screen". Today's list (`Intl.supportedValuesOf`, 418 ids in Node 26, no `Etc/` id) and the CLDR records (`scripts/zoneData/extractZoneData.ts` skips `Etc/`) offer none of them.
- Design D11 (`design.md:105-109`) has Node-run scripts (`node scripts/zoneRules/compile.ts`, `check.ts`, `design.md:87-88`) load `src/lib/zoneRules/core/`. Task 2.1 (`tasks.md:20`) puts `enum RuleDateKind` in `core/zoneRulesConstants.ts`. Node 26 runs `.ts` in strip-only mode and rejects `enum`.
- NFR-P3 (`proposal.md:96`) and the zone-rules requirement "Zone rules within their budgets" (`specs/zone-rules/spec.md:248`) say a wrapper instance builds exactly one native formatter and one `formatToParts` call makes exactly one native call. Design D5 (`design.md:67`) formats an absent date by calling `formatToParts()` on a second, module-level native UTC formatter, so that path makes two native calls.

## Findings

### R1 — CRITICAL — Search would offer `Etc/GMT±N` pseudo-cities
- Location: `openspec/changes/add-zone-rules-from-iana/specs/location-search/spec.md:6`; `proposal.md:87` (FR9); `design.md:75` (D6); `tasks.md:62` (task 7.2)
- Rule: `—`
- Problem: D6 replaces `listBrowserTimeZones` with `getKnownZoneIds()`, and the delta says the offered zones "SHALL be the zone ids of the zone rules release". The release is compiled from every source file including `etcetera` (`design.md:84`), so it holds `Etc/GMT+1`…`Etc/GMT+12`, `Etc/GMT-1`…`Etc/GMT-14` and `Etc/GMT`. It also holds area-less ids such as `EST5EDT`, `CET` and `GB`. `createZoneCitiesSource` canonicalizes each listed id (`zoneCitiesSource.ts:47-53`), and every release id will now pass the wrapper. `buildRecord` (`zoneCitiesSource.ts:57-70`) then gives an id with no CLDR record a city named by `deriveCityNameFromTimeZoneId`, so `Etc/GMT+5` becomes a city "GMT+5". POSIX signs are inverted, so that city is at UTC−5. Today none of these ids is offered: Node 26's `Intl.supportedValuesOf("timeZone")` lists 418 ids with no `Etc/` id, and the CLDR fallback skips `Etc/` (`scripts/zoneData/extractZoneData.ts`, `ETC_AREA`).
- Impact: implemented as written, search gains about 25 pseudo-cities. Their names read as the opposite UTC offset ("GMT+5" shows UTC−5 times), and any area-less id the CLDR alias map does not fold also appears. This breaks UX2 ("Nothing else moves or changes on screen") and today's search results, and no scenario or task declares it.
- Fix: in FR9, the location-search delta, D6 and task 7.2, offer "the zone ids of the release that have an area (contain `/`) and lie outside the `Etc/` area, plus `UTC` as today". Move `ETC_AREA` from `scripts/zoneData/extractZoneData.ts` to `core/zoneRulesConstants.ts` as `ETC_ZONE_AREA`, exported through `core/index.ts`. `extractZoneData.ts` imports it from `../../src/lib/zoneRules/core/index.ts`, as D11 allows scripts to, and `zoneCitiesSource.ts` imports it from `@/lib/zoneRules`. Add a delta scenario "Offset-only zones are not offered": WHEN the user searches for "GMT+5", THEN no result has a zone in `Etc/`. In task 7.2, add a test that no offered id is in `Etc/` or lacks a `/` other than `UTC`.
- Fix risk: low. FR9's wording narrows. `America/Ciudad_Juarez` and links such as `Europe/Oslo` keep their area and stay offered. The constant moves to one owner instead of being duplicated. Task 2.2's glossary may want a sentence on the search list, which is still in scope.
- Status: open

### R2 — WARNING — A TypeScript `enum` in `core/` stops the Node-run compiler and check
- Location: `openspec/changes/add-zone-rules-from-iana/tasks.md:20` (task 2.1); `design.md:107` (D11); `tasks.md:27` (task 3.1, typed error codes)
- Rule: `—`
- Problem: the CLIs run as `node scripts/zoneRules/compile.ts` and `node scripts/zoneRules/check.ts` (`design.md:87-88`, tasks 4.4 and 4.5). Through `truncateToCutoff.ts` and `checkAgainstZdump.ts` they import `src/lib/zoneRules/core/index.ts`, which exports `enum RuleDateKind` from `core/zoneRulesConstants.ts` (task 2.1). Node 26 loads `.ts` only in strip-only mode. In the sandbox (Node v26.13.1), a file with `export enum K { A, B }` fails with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX: TypeScript enum is not supported in strip-only mode`, and `--experimental-transform-types` is a "bad option" in Node 26. The `ZoneRulesReleaseError` codes of task 3.1 hit the same limit if written as an enum. Vitest and Vite compile enums with esbuild, so every unit test and mutation run before task 4.6 stays green.
- Impact: the first real run, `pnpm --filter @time-zones/client zone-rules:compile 2026f` in task 4.6, crashes before it downloads anything. So does `zone-rules:check` in tasks 4.6 and 10.1 and H1's CI step. M2 cannot be met and the release cannot be committed until `core/` is reworked late, after its mutation runs.
- Fix: in task 2.1 and D11, declare `RuleDateKind` (and the `ZoneRulesReleaseError` codes of task 3.1) in `core/` as an erasable const object with a same-named union type: `export const RuleDateKind = { JULIAN_NO_LEAP: "JULIAN_NO_LEAP", … } as const; export type RuleDateKind = (typeof RuleDateKind)[keyof typeof RuleDateKind];`. Add to D11 that files loaded by Node (`core/`, `scripts/zoneRules/`, `app.config.ts`) use only erasable TypeScript: no `enum`, `namespace` or parameter properties. Add to task 4.4's verification a smoke run of `node scripts/zoneRules/compile.ts` with no argument, which must exit non-zero with the usage line (no network needed).
- Fix risk: `.claude/rules/code-style.md` says "if a value is used in a `switch`, `if`, or for branching — it must be an enum". The const object keeps named members (`RuleDateKind.MONTH_WEEK_DAY`) and no raw strings in conditions, but D11 must record it as a deliberate exception next to its existing placement exception. Nothing outside `core/` and the scripts changes.
- Status: open

### R3 — WARNING — The offline E2E scenario cannot fail when the rules are not precached
- Location: `openspec/changes/add-zone-rules-from-iana/tasks.md:76` (task 8.8, "Offline start with the rules"); `specs/zone-rules/spec.md:232-235`
- Rule: `.claude/rules/test-planning.md` (every FR has an automated test covering it)
- Problem: the spec scenario requires "the main page shows the stored locations with times from the rules". Task 8.8 asserts only that "the Almaty card shows a time" after an offline reload. FR10 also says a failed asset load starts the app with the engine's data. Chromium's current ICU agrees with `2026f` for Almaty. So if the asset is missing from the precache (wrong glob, emitted after the manifest, a hashed name the service worker does not serve), the offline reload logs the failure and shows the same time, and the scenario passes.
- Impact: FR10's offline guarantee and the precache part of D2 have no test that can fail. A regression would put engine data on every installed offline start and go unnoticed.
- Fix: in task 8.8, "Offline start with the rules" also asserts that on the offline reload the `zone-rules-*.json` response is served by the service worker (`response.fromServiceWorker()` is true) and that no console error was logged during boot.
- Fix risk: low. `locations_tabs_offline_e2e.steps.ts` already proves an offline reload under the service worker in this suite. The assertion stays in playwright-bdd, where `.claude/rules/bdd-e2e.md` puts real-browser behaviour.
- Status: open

### R4 — WARNING — NFR-A1, NFR-R1 and UX2 have no delta-spec scenario
- Location: `openspec/changes/add-zone-rules-from-iana/proposal.md:100`, `:104`, `:110`; `specs/` (no requirement names them)
- Rule: `.claude/rules/traceability.md` ("For every FR/NFR/UX in `proposal.md`, at least one implementing entity must exist"); `.gnomish/stages/review-specs/instructions.md` (spec column required for NFR and UX)
- Problem: no delta requirement carries `NFR-A1`, `NFR-R1` or `UX2` in its `implements` comment, and no scenario states their behaviour. Tasks 8.8 and 10.2 still write the Gherkin: "No accessibility violations on the main page" in `zone_rules_boot_e2e.feature`, and the screenshot outline tagged `@NFR-R1 @UX2`.
- Impact: those feature scenarios rest on no spec. When the change is archived, the stable `zone-rules` spec will not record that the change keeps the main page axe-clean and its approved screenshots unchanged.
- Fix: add to `specs/zone-rules/spec.md` a requirement "Nothing visible changes" (`<!-- implements NFR-A1, NFR-R1, UX2 of add-zone-rules-from-iana -->`). Its SHALL: the main page shows no new note or control, axe-core reports no violations on it, and the approved screenshot baselines in `chromium` and `mobile-chrome` pass unchanged. Give it two scenarios matching tasks 8.8 and 10.2.
- Fix risk: none. The tasks and E2E placement already exist; only the spec text is added.
- Status: open

### R5 — SUGGESTION — The work bound of a wrapper call does not hold for an absent date
- Location: `openspec/changes/add-zone-rules-from-iana/proposal.md:96` (NFR-P3); `specs/zone-rules/spec.md:248`; `design.md:67` (D5)
- Rule: `—`
- Problem: NFR-P3 and the spec say one `formatToParts` call on a wrapper makes exactly one native `formatToParts` call and an instance builds exactly one native formatter. D5's absent-date path first calls `formatToParts()` on a module-level native UTC formatter (built on first use) and then the instance's own native formatter.
- Impact: an implementer who tests the bound for every call shape gets a failing test or bends D5. The scenarios in task 8.6 use dates, so nothing breaks today; the text is only ambiguous.
- Fix: in NFR-P3 and the spec requirement, scope the bound to "a call with a date", and state in D5 that an absent date adds one call on the shared clock formatter.
- Fix risk: none.
- Status: open

## Verdict

Needs revision. Blocking: R1 (search would offer misleading `Etc/GMT±N` cities), and R2 (the compiler and check CLIs cannot run on Node 26 as specified). R3 and R4 should be fixed in the same pass, and R5 is optional.
