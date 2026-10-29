# Review: support-legacy-ios-12-safari

## Summary

| Item | Value |
|---|---|
| Tasks verified | 43/44 |
| Requirements traced | 76/85 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Tasks

The diff was reviewed from the task's base `cce9c96` (the commit before "gnomish: task started"); `origin/main` is not available in this clone. Commands I ran myself: `pnpm run build`, `check:bundle-size`, `check:legacy-build`, the handoff `git apply --check` calls and the 12.3 traceability loop. I did not run lint, typecheck, Vitest or playwright-bdd; CI is reported green. Mutation scores below are the ones the implement commits record. I could not measure any myself (see Mutation).

- ✅ 1.1 — `packages/client/vitest.config.ts:15` inlines `temporal-polyfill`. `src/lib/legacy/zoneShim.temporal.test.ts:50-92` asserts the fake's call log (rejected `Europe/Kyiv`, then accepted `Europe/Kiev`), `09:30` / `+02:00`, records `timeZoneId` = `Europe/Kyiv` (line 74), and resolves the `UNIQUE`, `GAP` and `AMBIGUOUS` rows through `resolveWallClock`. It now wraps the fake with `createLegacyZoneDateTimeFormat`, as the task asks after 5.1.
- ✅ 2.1 — `packages/client/package.json` adds `core-js` and `@juggle/resize-observer` (dependencies), and `acorn` and `core-js-compat` `^3.51.0` (devDependencies). `pnpm-lock.yaml` is updated.
- ✅ 2.2 — `src/constants/update.ts:9`, `src/constants/reorder.ts:19,22`, `src/constants/legacy.ts:6`, `src/constants/utcOffset.ts:9`, `src/constants/pageVisibility.ts:5-6`, all re-exported from `src/constants/index.ts`. `useMinuteTick.ts:2` imports the shared visibility constants.
- ✅ 3.1 — `src/test/noBigIntInSources.test.ts:10` scans for `\d…n`, `BigInt(` and `epochNanoseconds`. Tests, steps, benches and `src/test/` are excluded.
- ✅ 3.2 — `src/model/timeZoneId.ts:18-21` uses `Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO`. `src/model/timeZoneId.test.ts` has the case with `BigInt` stubbed out.
- ✅ 3.3 — `src/model/dayPeriodStops.ts:28-29` and `src/model/dayPeriodWindows.ts:104-107` use milliseconds. `src/model/dayPeriodStops.test.ts` compares the stops with and without `BigInt`.
- ✅ 3.4 — Commit `39b5762` records a mutation score of 94–100% for the three model files.
- ✅ 4.1 — `src/presenter/countryName.ts:26`. Tests in `src/presenter/countryName.test.ts:10,14`.
- ✅ 4.2 — `src/adapters/city-search/zoneCitiesSource.ts:90`. Tests in `zoneCitiesSource.test.ts:98-120`.
- ✅ 4.3 — `src/views/shared/LocationRow.countryless.test.tsx:24` and `src/views/shared/LocationSearchDialog.test.tsx:88` (result with `countryName: ""`).
- ✅ 4.4 — `src/controller/usePrefersReducedMotion.ts:13-19`. Legacy cases in `usePrefersReducedMotion.test.ts:109,119`; the modern path at `:55-71`.
- ✅ 4.5 — Commit `bd0b18f` records 99–100%.
- ✅ 5.1 — `src/lib/legacy/zoneShim.ts:12,39,85`. `zoneShim.test.ts:40-150` covers the alias inversion, the retry, the rethrow (both "not accepted" and "not known"), pass-through, a non-RangeError, a call without `new`, `supportedLocalesOf` and `instanceof`.
- ✅ 5.2 — `src/lib/legacy/needsLegacySupport.ts:21-27`. `needsLegacySupport.test.ts:30-34` uses `it.each` over the cases.
- ✅ 5.3 — `scripts/legacyCoreJs/buildLegacyCoreJsModules.ts`, `scripts/legacyCoreJs/legacyCoreJsPlugin.ts`, `src/vite-env.d.ts:26`, `vitest.config.ts:8`. Tests in `src/test/legacyCoreJs/`.
- ✅ 5.4 — `src/lib/legacy/pointerEvents.ts:6`, `installLegacySupport.ts:7-17`, `index.ts:1-7`. Tests in `installLegacySupport.test.ts:14-58`.
- ✅ 5.5 — `src/lib/legacy/bootApp.ts:13-22`, `src/boot.ts:9-13`, `index.html:12`, `stryker.config.mjs` `"!src/boot.ts"`. `bootApp.test.ts:30-73` covers order, rejection and the static-import source scan.
- ✅ 5.6 — `scripts/legacyBoot/addMainChunkPreloads.ts`, `mainChunkPreloadPlugin.ts`, `vite.config.ts:23-30`. My build: `dist/index.html` preloads `main-*.js` and gets no link for `installLegacySupport-*.js`. `check:bundle-size` printed "Initial JS: 142.0 KB gzipped (budget 150 KB)". The plugin does not carry the main chunk's stylesheet (R1).
- ❌ 5.7 — Ticked, but there is no recorded score for `zoneShim.ts`, `needsLegacySupport.ts`, `installLegacySupport.ts` or `bootApp.ts`. Commit `7fd57a4` ("tasks 5.1-5.7") names none, unlike every other section's commit, and the current `reports/mutation/mutation-report.json` holds only the `scripts/` files of task 9.3. I could not re-measure (ENOSPC). See R3.
- ✅ 6.1 — `src/test/fakePointerEvent.ts:6`, `src/test/setup.ts:17-20`. A grep for `FakePointerEvent|useFakePointerEvents` lists only those two files.
- ✅ 6.2 — `src/views/shared/DayTrack.tsx:62,133`. Tests in `DayTrack.legacy.test.tsx:39-76`: a click at ¾ gives 0.75, a click past the end is clamped, role, name, value and keys are kept, and a click with Pointer Events selects nothing.
- ✅ 6.3 — `src/test/features/time_selection/time_selection_legacy_tap.feature` and `steps/time_selection_legacy_tap.steps.tsx`, tagged `@FR8 @UX1` / `@FR8`.
- ✅ 6.4 — `src/views/shared/LocationList.tsx:32-42,78`. `LocationList.sensors.test.tsx:37-69` checks both sensor sets with their options.
- ✅ 6.5 — `src/test/e2e/withoutPointerEvents.ts:62`. `locations/locations_reorder_legacy_touch_e2e.feature` and its steps check that the page did not scroll and that it did scroll.
- ✅ 6.6 — `time_selection/time_selection_legacy_touch_e2e.feature` and `steps/time_selection_legacy_touch_e2e.steps.ts:17-45`.
- ✅ 6.7 — Commit `65a71f0` records 100%.
- ✅ 7.1 — `src/controller/useUpdateRecheckOnReturn.ts:17-48`. `useUpdateRecheckOnReturn.test.tsx:36-148` covers 16 and 5 min, the exact interval, hidden, a repeat, a failure, unmount and no registration.
- ✅ 7.2 — `src/controller/usePwaUpdateStatus.ts:23-45`, `src/app/AppShell.tsx:25-30`. The new case lives in a new file, `usePwaUpdateStatus.recheck.test.ts:27,45`, rather than in `usePwaUpdateStatus.test.ts`.
- ✅ 7.3 — `src/test/features/app_shell/app_shell_update_recheck.feature` (4 scenarios) and `steps/app_shell_update_recheck.steps.ts`. The offline case resolves the first `update` and rejects the later ones.
- ✅ 7.4 — Commit `06dbe8c` records 100%.
- ✅ 8.1 — `tailwind.config.ts:42,44`, `index.html:7`. My build's `main-*.css` passes the dvh rule of `check:legacy-build`.
- ✅ 8.2 — `app_shell/app_shell_ios_home_screen_e2e.feature` and `steps/app_shell_ios_home_screen_e2e.steps.ts:8`.
- ✅ 9.1 — `scripts/legacyBuild/findLegacySyntaxIssues.ts:46-152`. Tests in `src/test/legacyBuild/findLegacySyntaxIssues.test.ts`.
- ✅ 9.2 — `scripts/check-legacy-build.mjs`, `package.json:12`, `src/test/legacyBuild/checkLegacyBuild.test.ts:41-72`. My run printed "Legacy build check passed: 15 files."
- ✅ 9.3 — Commit `022da81` records 92% (above the 90% minimum).
- ✅ 10.1 — The three features under `src/test/features/browser_compatibility/` with `steps/*.steps.ts(x)`. Two scenarios added to `location_search/location_search_by_country.feature` (steps at `location_search_by_country.steps.ts:76,95`).
- ✅ 10.2 — `browser_compatibility_legacy_engine_e2e.feature` with `steps/browser_compatibility_legacy_engine_e2e.steps.ts:21-45`. The NFR-R1 comment is at `locations/steps/locations_layout_e2e.steps.ts:68`.
- ✅ 11.1 — `handoff/H1-ci-legacy-build-step.patch`: `git apply --check` passes.
- ✅ 11.2 — `handoff/H2-adr-supported-browser-engines.patch` touches `CLAUDE.md`, `docs/adr/0009-…` (status Accepted) and `docs/architecture/overview.md`. It applies, and "0009" occurs 5 times.
- ✅ 11.3 — `handoff/H3-glossary-browser-compatibility.patch` applies. The two greps give 2 and 1.
- ✅ 11.4 — `handoff/README.md` has 4 `## H[1-4]:` sections.
- ✅ 12.1 — `pnpm run build`, `check:bundle-size` and `check:legacy-build` pass in my run. Lint, typecheck and test are green per CI.
- ✅ 12.2 — The E2E suite is green per CI. I did not re-run it.
- ✅ 12.3 — I ran the traceability loop and it printed nothing.

## Requirements

- ✅ FR1 — `app.config.ts:36` `BUILD_TARGETS` (safari12/ios12), used in `vite.config.ts:23-24`. `check:legacy-build` parses every built script. `browser_compatibility_legacy_boot.feature` "Main page renders on a legacy engine". The real device is M7.
- ✅ FR2 — `src/boot.ts`, `src/lib/legacy/bootApp.ts:13`, `needsLegacySupport.ts:21`, `installLegacySupport.ts`. Tests in `bootApp.test.ts` and the legacy boot feature.
- ✅ FR3 — `timeZoneId.ts:18`, `dayPeriodStops.ts:28`, `dayPeriodWindows.ts:104`. `noBigIntInSources.test.ts`; the "Zone checks work without BigInt" scenario.
- ⚠️ FR4 — The shim is at `src/lib/legacy/zoneShim.ts:39-90`. Adding, local time, offset and wall-clock resolution are tested under the shim. FR4's "reading the stored list" is not: the scenarios drop the spec's storage steps (R2).
- ✅ FR5 — `presenter/countryName.ts:26`, `zoneCitiesSource.ts:90`. Tests in `countryName.test.ts`, `zoneCitiesSource.test.ts:98-120` and the two `location_search_by_country.feature` scenarios.
- ✅ FR6 — `installLegacySupport.ts:12-15`. "View selection without ResizeObserver" in `browser_compatibility_missing_apis.feature`.
- ✅ FR7 — `usePrefersReducedMotion.ts:13-19`. `usePrefersReducedMotion.test.ts:109,119` and two scenarios.
- ✅ FR8 — `DayTrack.tsx:133`. `DayTrack.legacy.test.tsx`, `time_selection_legacy_tap.feature` and `time_selection_legacy_touch_e2e.feature`.
- ✅ FR9 — `LocationList.tsx:32-42`. `LocationList.sensors.test.tsx` and `locations_reorder_legacy_touch_e2e.feature`.
- ✅ FR10 — `useUpdateRecheckOnReturn.ts`, `usePwaUpdateStatus.ts:41-45`, `AppShell.tsx:25`. Tests in `useUpdateRecheckOnReturn.test.tsx` and `app_shell_update_recheck.feature`.
- ✅ FR11 — `index.html:7`. `app_shell_ios_home_screen_e2e.feature`.
- ✅ FR12 — `postcss.config.js` with `scripts/legacyCss/expandInsetShorthand.mjs`, and `tailwind.config.ts:42,44`. `findInsetShorthand` and `findDvhWithoutFallback` (`findLegacySyntaxIssues.ts:104,124`); my `check:legacy-build` run found 0 issues.
- ⚠️ FR13 — The rules (`findLegacySyntaxIssues.ts`) and the script (`check-legacy-build.mjs`) exist and are tested. The BigInt scan runs in `pnpm test`. The PR check for the build artifacts waits on the human handoff H1: `.github/workflows/ci.yml` has no "Check legacy build" step yet. The implement stage may not edit `.github/`, so this is not a code finding.
- ✅ NFR-P1 — `check:bundle-size`: 142.0 KB of 150 KB. The polyfill chunk (64 KB gzipped) is not preloaded.
- ✅ NFR-P2 — `mainChunkPreloadPlugin.ts:52-77` preloads `main` and its imports. The E2E scenario "Modern engine requests no polyfills" (`browser_compatibility_legacy_engine_e2e.steps.ts:22`). The stylesheet, which is not an extra request but now starts late, is R1.
- ✅ NFR-A1 — "No accessibility violations without Pointer Events" in `browser_compatibility_legacy_engine_e2e.feature`, using axe on the main page and the dialog (`steps:33-45`).
- ✅ NFR-A2 — `DayTrack.legacy.test.tsx:55-66` and `time_selection_legacy_touch_e2e.steps.ts:17-45`.
- ✅ NFR-R1 — The existing baselines must pass unchanged, noted at `locations_layout_e2e.steps.ts:68`. E2E is green per CI.
- ✅ UX1 — `DayTrack.tsx:133` (`onClick` → `selectAt` within the same render). Tagged `@UX1` scenarios in the legacy tap and legacy touch features.
- ✅ UX2 — `REORDER_TOUCH_ACTIVATION_DELAY_MS` / `TOLERANCE_PX` (`constants/reorder.ts:19,22`). The E2E "quick swipe … scrolls" scenario.
- ✅ UX3 — `LocationRow.countryless.test.tsx:24`, `LocationSearchDialog.test.tsx:88` and the two `@UX3` scenarios.
- ✅ M1 — The traceability loop of task 12.3 prints nothing.
- ✅ M2 — My `check:legacy-build` run: "Legacy build check passed: 15 files." It runs in CI once H1 is applied.
- ✅ M3 — `browser_compatibility_legacy_zones.feature`, outline tagged `@M3`. "A renamed zone shows its time" asserts `09:30` / `UTC+2`.
- ✅ M4 — The 3 missing-API cases (`Intl.DisplayNames`, `ResizeObserver`, `addEventListener`) in `browser_compatibility_missing_apis.feature` and the legacy boot feature.
- ✅ M5 — 142.0 KB ≤ 150 KB in my run, plus the E2E "requests no polyfills" scenario (`@M5`).
- ⚠️ M6 — The recorded scores are 92–100% for the sections that report one. `src/lib/legacy/*` (task 5.7) and `scripts/legacyCss/expandInsetShorthand.mjs` have no recorded run, and I could not measure (R3).
- ⚠️ M7 — Manual device acceptance is the handoff H4 (`handoff/README.md`). By design it is not done before the PR.
- ✅ Scenario: Manifest is complete — Unchanged, covered by the existing "App can be installed to the home screen" (`app_shell_smoke_e2e.feature:31`).
- ✅ Scenario: Every icon is reachable — Unchanged, covered by the same smoke E2E scenario.
- ✅ Scenario: Page declares an iOS home-screen web app — `app_shell_ios_home_screen_e2e.feature`; `index.html:7`.
- ✅ Scenario: A check fails — Unchanged, covered by the existing CI job (`.github/workflows/ci.yml` lint/typecheck/test/build).
- ✅ Scenario: Bundle exceeds the budget — Unchanged. `check-bundle-size.mjs` still runs in CI; my run passed at 142.0 KB.
- ✅ Scenario: A timing budget is missed — Unchanged, covered by the non-blocking `benchmark` job.
- ✅ Scenario: Unit tests ignore runner speed — Unchanged. No new test compares a duration.
- ⚠️ Scenario: Built code is newer than Safari 12 — Covered by `findLegacySyntaxIssues` and `checkLegacyBuild.test.ts`. The PR check waits on H1.
- ⚠️ Scenario: Built CSS uses the inset shorthand — `findInsetShorthand` is tested and the script exits non-zero (`checkLegacyBuild.test.ts:48`). The PR check waits on H1.
- ⚠️ Scenario: Built CSS uses dvh without a fallback — `findDvhWithoutFallback` is tested and the script names the file. The PR check waits on H1.
- ✅ Scenario: Sources use BigInt — `noBigIntInSources.test.ts` runs in `pnpm test`, which CI runs.
- ✅ Scenario: New version becomes available — Unchanged, `app_shell_notices.feature:41`.
- ✅ Scenario: User accepts the update — Unchanged, `app_shell_notices.feature:48`.
- ✅ Scenario: User postpones the update — Unchanged, `app_shell_notices.feature:55`.
- ✅ Scenario: Keyboard user handles the notice — Unchanged, `app_shell_notices.feature:63` ("User postpones the update from the keyboard").
- ✅ Scenario: Returning to the app checks again — `app_shell_update_recheck.feature`: 2 checks after 16 min.
- ✅ Scenario: Returning soon after a check does not check — The same feature: 1 check after 5 min.
- ✅ Scenario: Hiding the page does not check — The same feature: hidden after 16 min, 1 check.
- ✅ Scenario: A check on return fails offline — The same feature: the note is absent before the return and shown after it.
- ✅ Scenario: Built code parses at the oldest supported level — `check:legacy-build` (acorn ES2020 plus lookbehind rules) passed on my build.
- ✅ Scenario: Main page renders on a legacy engine — `browser_compatibility_legacy_boot.feature`. The `PointerEvent` stub comes after `LocationList` / `DayTrack` were imported, so the touch path at render is proven by the E2E legacy-touch scenarios, not by this one.
- ✅ Scenario: Modern engine skips the polyfills — The legacy boot feature (through `bootApp`) and the E2E request log.
- ✅ Scenario: Legacy engine installs the polyfills first — The legacy boot feature: load order `[polyfills, app]` and `es.array.at` in the core-js list.
- ✅ Scenario: Initial JavaScript stays in budget — `check:bundle-size`: 142.0 KB. The polyfill chunk is not in the initial JS.
- ✅ Scenario: Sources contain no BigInt — `noBigIntInSources.test.ts`.
- ✅ Scenario: Zone checks work without BigInt — `browser_compatibility_legacy_zones.feature`, first scenario.
- ⚠️ Scenario: Adding a renamed zone — Implemented without the spec's step "the stored list holds `Europe/Kyiv`". Only the reducer state is checked (R2).
- ⚠️ Scenario: A renamed zone shows its time — Implemented without "the stored list contains Kyiv" and "the stored list is read without error". No stored list is read under the shim (R2).
- ✅ Scenario: A wall-clock time in a renamed zone — The outline with `UNIQUE` / `GAP` / `AMBIGUOUS` rows. Each row asserts the fake rejected `Europe/Kyiv`.
- ✅ Scenario: A zone rejected under every name — `America/Ciudad_Juarez` → `UNKNOWN_TIME_ZONE`.
- ✅ Scenario: Rows without country names — `browser_compatibility_missing_apis.feature`.
- ✅ Scenario: Search results without country names — `browser_compatibility_missing_apis.feature`.
- ✅ Scenario: View selection without ResizeObserver — `browser_compatibility_missing_apis.feature`: the polyfill is installed and the Cards view is shown.
- ✅ Scenario: Preference followed through addListener — `browser_compatibility_missing_apis.feature`.
- ✅ Scenario: Listener removed on unmount — `browser_compatibility_missing_apis.feature`: listener count goes 1 → 0.
- ✅ Scenario: No inset shorthand in the build — `check:legacy-build` on my build; `expandInsetShorthand.mjs` in `postcss.config.js`.
- ✅ Scenario: Full height has a fallback — `tailwind.config.ts:42`; the dvh rule of `check:legacy-build` passed.
- ✅ Scenario: Modern screenshots unchanged — The existing baselines, noted at `locations_layout_e2e.steps.ts:68`. Green per CI.
- ✅ Scenario: No accessibility violations without Pointer Events — `browser_compatibility_legacy_engine_e2e.feature`.
- ✅ Scenario: Country with several zones — Unchanged, `location_search_by_country.steps.ts:51`.
- ✅ Scenario: Country name in Russian — Unchanged, `location_search_by_country.steps.ts:68`.
- ✅ Scenario: No country names on a legacy engine — `location_search_by_country.steps.ts:76`.
- ✅ Scenario: City search on a legacy engine — `location_search_by_country.steps.ts:95`.
- ✅ Scenario: Drag a card to the top with the mouse — Unchanged, `locations_reorder_e2e.feature`. The `PointerSensor` options are unchanged (`LocationList.sensors.test.tsx:55`).
- ✅ Scenario: Drag a card down by touch — Unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: Cancel a drag — Unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: Scrolling over a card scrolls the page — Unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: A single location has no handle — Unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: Drag by finger without Pointer Events — `locations_reorder_legacy_touch_e2e.feature`. It uses a 5-city list and drags Almaty below Moscow instead of the spec's 3-city example, and checks the order and an unchanged `scrollY`.
- ✅ Scenario: A quick swipe over the handle scrolls without Pointer Events — `locations_reorder_legacy_touch_e2e.feature`.
- ✅ Scenario: Dragging one track moves every card — Unchanged, `time_selection_select_time.feature` and `time_selection_e2e.feature`.
- ✅ Scenario: Selections snap to quarter hours and stay inside the day — Unchanged, `time_selection_select_time.feature`.
- ✅ Scenario: Selection on a 23-hour day — Unchanged, `time_selection_select_time.feature`.
- ✅ Scenario: A malformed instant changes nothing — Unchanged, `time_selection_select_time.feature`.
- ✅ Scenario: A tap selects a time without Pointer Events — `time_selection_legacy_tap.feature`.
- ✅ Scenario: A finger tap keeps the slider accessible without Pointer Events — `time_selection_legacy_touch_e2e.feature`.
- ✅ Scenario: A click adds nothing where Pointer Events exist — `time_selection_legacy_tap.feature` and `DayTrack.legacy.test.tsx:70`.

## Mutation

Not measured. I ran `cd packages/client && npx stryker run --mutate 'src/lib/legacy/zoneShim.ts,src/lib/legacy/needsLegacySupport.ts,src/lib/legacy/installLegacySupport.ts,src/lib/legacy/bootApp.ts,src/lib/legacy/pointerEvents.ts'` once, and it failed because of the environment:

```
ERROR Stryker Unexpected error occurred while running Stryker Error: ENOSPC: no space left on device, copyfile '/gnomish/work/packages/client/playwright-report/data/0619f6fe….zip' -> '/gnomish/work/packages/client/.stryker-tmp/sandbox-bxbifn/playwright-report/data/0619f6fe….zip'
```

`df -h` showed `/dev/vda1 79G 75G 0 100% /gnomish/work`. After the failed run's own sandbox was removed, 9.3 MB was free, too little for a Stryker sandbox, so no other scoped run was attempted. The per-task statements in Tasks repeat the scores the implement commits record; they are not measurements of this review. The gaps without any recorded score are R3.

## Findings

### R1 — WARNING — Main stylesheet is no longer linked from index.html, so modern browsers fetch it only after the boot module runs
- Location: `packages/client/scripts/legacyBoot/mainChunkPreloadPlugin.ts:71`
- Rule: `openspec/changes/support-legacy-ios-12-safari/design.md` D2 ("To avoid a request waterfall on modern browsers…") and proposal G3 ("Modern browsers are unaffected")
- Problem: `src/main.tsx:2` imports `@/styles/globals.css`. `main.tsx` is now a dynamic chunk loaded by `src/boot.ts`, so Vite no longer emits a `<link rel="stylesheet">` for that CSS in `index.html`. `mainChunkPreloadPlugin` adds only `modulepreload` links for the JS of the `main` chunk's static-import closure (`collectStaticImportClosure` at line 71 reads `chunk.imports` only). In my build, `dist/index.html` has no stylesheet link at all. `main-BjoqD7hO.css` is listed only in the boot chunk's `__vite__mapDeps`, and `__vitePreload` appends it after `index-*.js` has downloaded and run.
- Impact: On every cold, uncached start in a modern browser, the stylesheet request starts one round trip later than before this change: html → boot JS → CSS, instead of html → CSS in parallel. The `__vitePreload` call waits for the CSS before it evaluates `main`, so first render is delayed by that round trip. The change set out to keep modern browsers unchanged and to remove the boot waterfall (D2), and NFR-P1/M5 measure only JS, so the regression passes every current check.
- Fix: In `mainChunkPreloadPlugin`, also collect `chunk.viteMetadata?.importedCss` for every chunk in the closure. Extend the pure `addMainChunkPreloads` (or add a sibling pure function in `scripts/legacyBoot/`) to insert one `<link rel="stylesheet" crossorigin href="${base}${file}">` per CSS file before `</head>`, skipping hrefs already present, as it does for JS. Add cases to `src/test/legacyBoot/addMainChunkPreloads.test.ts`: one link per CSS file, none duplicated, HTML unchanged for an empty list.
- Fix risk: Low. The boot chunk's `__vitePreload` already skips a CSS dependency when `link[href="…"][rel="stylesheet"]` exists (seen in the built `index-*.js`), so the CSS is not loaded twice, provided the href is the same `${base}${fileName}` the helper builds. The stylesheet becomes render-blocking in `<head>` again, which is how it worked before this change, so NFR-R1 baselines are unaffected. `check-bundle-size.mjs` counts only JS, and the polyfill chunk still gets no link.
- Status: open

### R2 — WARNING — Renamed-zone scenarios drop the spec's stored-list steps, so FR4 "reading the stored list" is untested under the shim
- Location: `packages/client/src/test/features/browser_compatibility/browser_compatibility_legacy_zones.feature:13-23`
- Rule: `.claude/rules/bdd-unit.md` / `gherkin.md` (the feature carries the spec scenario); `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: In `specs/browser-compatibility/spec.md`, "Adding a renamed zone" ends with "**AND** the stored list holds `Europe/Kyiv`", and "A renamed zone shows its time" starts from "the stored list contains Kyiv with the zone `Europe/Kyiv`" and ends with "the stored list is read without error". The feature leaves all three steps out. Its steps (`steps/browser_compatibility_legacy_zones.steps.ts`) check only the reducer state after `ADD_LOCATION` and call `getLocalDateTime` / `getUtcOffsetMinutes` directly. No scenario reads a stored document through `parseStoredLocations` or the location repository while `Intl.DateTimeFormat` rejects `Europe/Kyiv`, although FR4 names "reading the stored list" explicitly.
- Impact: The start-up path an iOS 12 user with a stored Kyiv takes (`localStorageLocationRepository.load` → `deserializeLocationsDocument` → `parseStoredLocations` → `canonicalizeTimeZoneId`) is never run against the shim. A regression there, for example a stored-list validation that checks zones through another API, or a canonicalization step that runs before the shim is installed, would make the whole stored list unreadable on iOS 12. ADR-0004 then shows the reset screen, which risks data loss. No test would catch it.
- Fix: Add the missing steps to both scenarios. In `legacyZoneWorld.ts`, also import `@/adapters` fresh. "the stored list holds {string}": save the added locations with `adapters.localStorageLocationRepository.save(...)`, then assert that `load()` returns `ok` with that zone id. "the stored list contains {string} with the zone {string}": seed `localStorage` the way `seedStoredList` in `locations/steps/locationsUiWorld.ts` does. "the stored list is read without error": assert that `adapters.localStorageLocationRepository.load()` is `ok` and holds `Europe/Kyiv`, and present the card from the loaded location. Keep `expectNativeRejectedKyiv()` in each.
- Fix risk: Low. `steps/browser_compatibility_legacy_zones.steps.ts` is 189 lines, so new helpers belong in `legacyZoneWorld.ts` (82 lines) to keep both under 200. `localStorage` must be cleared in `restoreZoneData` so scenarios stay independent. A fresh `@/adapters` import re-evaluates the city-search modules, which only costs time.
- Status: open

### R3 — WARNING — No mutation evidence for the legacy-support modules (task 5.7) and the inset PostCSS plugin (M6)
- Location: `packages/client/src/lib/legacy/zoneShim.ts:39` (with `needsLegacySupport.ts`, `installLegacySupport.ts`, `bootApp.ts`) and `packages/client/scripts/legacyCss/expandInsetShorthand.mjs:36`
- Rule: `.claude/rules/tdd-workflow.md` Step 5 ("Run … mutation on the changed files … Target mutation score: >=95%. Minimum acceptable: >=90%"); proposal M6
- Problem: Task 5.7 is ticked, but neither its commit (`7fd57a4`) nor any later artifact records a score for `zoneShim.ts`, `needsLegacySupport.ts`, `installLegacySupport.ts` or `bootApp.ts`. Every other section's commit states one. `expandInsetShorthand.mjs` is new production build code (FR12) that appears in no mutation task. This review could not measure either set (ENOSPC, see Mutation).
- Impact: M6 ("Mutation score of the new or changed code ≥ 95% (minimum 90%)") is unproven for the legacy zone shim and the boot ordering. These are the two pieces that decide whether the app starts on iOS 12 at all, and the device check (M7) is the only other safeguard. A weak assertion there, for example on the shim's case-insensitive lookup or the probe's `||` chain, would go unnoticed until the owner's device.
- Fix: On a machine with free disk, run `cd packages/client && npx stryker run --mutate 'src/lib/legacy/zoneShim.ts,src/lib/legacy/needsLegacySupport.ts,src/lib/legacy/installLegacySupport.ts,src/lib/legacy/bootApp.ts'`, then separately `npx stryker run --mutate 'scripts/legacyCss/expandInsetShorthand.mjs'`. Kill survivors with cases in `src/lib/legacy/*.test.ts` and `src/test/legacyBuild/expandInsetShorthand.test.ts`, and record the scores in the commit message, as the other sections do.
- Fix risk: Only time and disk: the current box has 9 MB free, so a Stryker sandbox cannot be created there. No production code changes unless a survivor shows a real gap.
- Status: open

### R4 — SUGGESTION — bootApp swallows a failed legacy-support load without a trace
- Location: `packages/client/src/lib/legacy/bootApp.ts:17`
- Rule: `.claude/rules/code-style.md` (console strings are allowed for debugging); review checklist "catch blocks that swallow silently"
- Problem: `catch { // Fall through … }` drops the error of `loadLegacySupport()`. Starting the app anyway is right (design D2), but nothing records why the polyfills are missing.
- Impact: If the polyfill chunk fails on iOS 12 (first open offline before the Service Worker precached it, or a core-js module throwing on that engine), the app starts without polyfills and fails later with a secondary error such as "`…at` is not a function". During the M7 device check the Web Inspector then shows only that secondary symptom, and the root cause is lost.
- Fix: `catch (legacySupportError) { console.error(legacySupportError); }`. Keep the fall-through. In `bootApp.test.ts`, the case "should still load the app when legacy support fails" spies on `console.error` and asserts it was called with the rejection.
- Fix risk: Low. The legacy boot feature's "no error is shown" step spies on `console.error` only in the scenario where the load succeeds, so it stays green. No other production module logs today, so this is the first `console.error` in `src/`.
- Status: open

## Verdict

Not ready. Blocking: R1 (a modern-browser start regression against D2 and G3), R2 (FR4's stored-list path is untested on the shim) and R3 (task 5.7 is ticked with no mutation evidence, and M6 is unproven for the start-critical modules). R4 is optional. No CRITICAL findings. Every implemented behaviour I checked matches the specs, the build passes `check:bundle-size` (142.0 KB) and `check:legacy-build`, and the handoff patches apply.
