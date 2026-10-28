# Tasks

All source paths are under `packages/client/` (`src/…` unless they start with `scripts/` or name a root file). Commands run from `packages/client/` unless they start with `pnpm --filter`.

- **Running tests:** one command at a time, never in the background. Mutation runs take at most 5 files per run. The report is in `reports/mutation/mutation-report.json`.
- **Time in tests:** only `fakeClock(instant, timeZone)` of `@/lib/temporal` or `createSwitchableClock` (`src/test/switchableClock.ts`). Never `vi.setSystemTime()` or `vi.useFakeTimers()`. Page visibility comes from `setPageVisibility` / `resetPageVisibility` (`src/test/pageVisibility.ts`).
- **Missing APIs in unit tests:** remove the API with `vi.stubGlobal(...)` (or delete the property), and restore it with `vi.unstubAllGlobals()`. Modules that read support at load time are re-imported after `vi.resetModules()` (design D11).
- **Missing APIs in E2E:** a step `the engine has no {string}` adds a Playwright init script that deletes the API before the app loads (design D11).
- **Traceability:** every new test, step file and feature carries `support-legacy-ios-12-safari`:
  - `@support-legacy-ios-12-safari @FR-X` tags above scenarios;
  - `// @support-legacy-ios-12-safari @FR-X` before `f.Scenario` (unit), `// Verifies <id> of support-legacy-ios-12-safari` in E2E steps;
  - `Implements FR-X of support-legacy-ios-12-safari` in the JSDoc of new or changed production code.
- **File size:** every file stays under 200 lines. New scenarios go into new feature files, because `app_shell_notices.steps.ts` (273 lines) and `locations_reorder_unit.steps.ts` (281) are already long.
- **Design references:** "design Dn" refers to `design.md`.

## 1. Spike: zone shim against temporal-polyfill (blocks section 5)

- [ ] 1.1 Throwaway test `src/lib/legacy/zoneShim.spike.test.ts` (design D4, proposal Q2, FR4). Install a fake `Intl.DateTimeFormat` that throws `RangeError` for `Europe/Kyiv` and delegates otherwise. Wrap it with a minimal retry on `Europe/Kiev`. Then `vi.resetModules()` and import `temporal-polyfill` and `@/model` fresh. Check:
  - `Temporal.Instant.from("2026-03-08T07:30:00Z").toZonedDateTimeISO("Europe/Kyiv")` gives `09:30` and offset `+02:00`, and what `.timeZoneId` returns;
  - `resolveWallClock("Europe/Kyiv", Temporal.PlainDateTime.from("2026-03-08T09:30"))` gives `2026-03-08T07:30:00Z` `UNIQUE`;
  - `resolveWallClock("Europe/Kyiv", Temporal.PlainDateTime.from("2026-03-29T03:30"))` gives `2026-03-29T01:30:00Z` `GAP` (each of `compatible`, `earlier`, `later` reaches the shim);
  - no other `Intl` / `Date` path throws.

  Verify with `npx vitest run src/lib/legacy/zoneShim.spike.test.ts`. Record the outcome in the commit message of this task. If the shim works, delete the spike file (task 5.1 and 10.1 keep these checks permanently). If it does not, keep the file as the red test of the explicit resolver (design D4 "Alternatives") and build that resolver in `src/model/timeZoneId.ts` in place of task 5.1 before any other zone task.

## 2. Dependencies and constants (no TDD: setup and constants)

- [ ] 2.1 Add the dependencies of design D3 and D9: `pnpm --filter @time-zones/client add core-js @juggle/resize-observer`, then `pnpm --filter @time-zones/client add -D core-js-compat acorn` (same minor for `core-js` and `core-js-compat`). Verify with `pnpm --filter @time-zones/client typecheck`.
- [ ] 2.2 Add the constants and re-export them from `src/constants/index.ts`:
  - `UPDATE_RECHECK_INTERVAL_MS = 15 * MILLISECONDS_PER_MINUTE` in new `constants/updates.ts` (design D10, FR10);
  - `REORDER_TOUCH_ACTIVATION_DELAY_MS = 250` and `REORDER_TOUCH_ACTIVATION_TOLERANCE_PX = 5` in `constants/reorder.ts` (design D8, FR9);
  - `LEGACY_ZONE_PROBE_ID = "Europe/Kyiv"` in new `constants/legacySupport.ts` (design D2);
  - `NANOSECONDS_PER_MILLISECOND = 1_000_000` in `constants/utcOffset.ts` (design D5).

  Add `LEGACY_BUILD_TARGETS` (design D1) and `LEGACY_POLYFILLS_CHUNK_NAME = "legacy-polyfills"` (design D2) to `app.config.ts`. Verify with `pnpm --filter @time-zones/client typecheck`.
- [ ] 2.3 Move `FakePointerEvent` from `src/views/shared/dayTrackFixture.tsx` to new `src/test/fakePointerEvent.ts` and assign it to `globalThis.PointerEvent` in `src/test/setup.ts` when the global is missing, so every test module loads as on a modern engine (design D8). `useFakePointerEvents` keeps working. Verify with `pnpm test`: the whole unit suite stays green.

## 3. Model: no BigInt (TDD)

- [ ] 3.1 Add the source-scan test `src/test/noBigIntInSources.test.ts` (design D5, FR3, FR13). It reads `src/**/*.{ts,tsx}` with `node:fs`, excluding `*.test.*`, `*.steps.*`, `*.bench.*` and `src/test/`. It asserts that no file matches a BigInt literal, `BigInt(` or `epochNanoseconds`, and reports the file names. Verify red with `npx vitest run src/test/noBigIntInSources.test.ts`: it lists `model/timeZoneId.ts`, `model/dayPeriodStops.ts` and `model/dayPeriodWindows.ts`.
- [ ] 3.2 TDD in `src/model/timeZoneId.ts`: build the probe from `Temporal.Instant.fromEpochMilliseconds(0)`. In `src/model/timeZoneId.test.ts`, add a case with `vi.stubGlobal("BigInt", undefined)`: `canonicalizeTimeZoneId("Asia/Almaty")` → `"Asia/Almaty"` and `canonicalizeTimeZoneId("Europe/Kiev")` → `"Europe/Kyiv"`. Verify red, then green, with `npx vitest run src/model/timeZoneId.test.ts`.
- [ ] 3.3 TDD in `src/model/dayPeriodStops.ts` and `src/model/dayPeriodWindows.ts`: millisecond arithmetic (design D5). Keep the existing tests green. Add a case to each test file that computes the Almaty and New York results for the `2026-03-08` reference day with `BigInt` stubbed out and expects the same values as with it. Verify with `npx vitest run src/model/dayPeriodStops.test.ts`, then `npx vitest run src/model/dayPeriodWindows.test.ts`, then `npx vitest run src/test/noBigIntInSources.test.ts` (now green).
- [ ] 3.4 Mutation run: `npx stryker run --mutate 'src/model/timeZoneId.ts,src/model/dayPeriodStops.ts,src/model/dayPeriodWindows.ts'` scores ≥ 95% (minimum 90%) (M6).

## 4. API guards (TDD)

- [ ] 4.1 TDD `isDisplayNamesSupported()` in new `src/lib/legacy/engineSupport.ts`, exported from new `src/lib/legacy/index.ts` (design D6, FR5). Then guard `src/presenter/countryName.ts`. Tests in new `src/presenter/countryName.test.ts`: with `Intl.DisplayNames` removed, `presentCountryName("KZ", "en")` → `""` with no throw; with it present, `"Kazakhstan"`. Verify red, then green, with `npx vitest run src/presenter/countryName.test.ts`.
- [ ] 4.2 TDD `readCountryTexts` in `src/adapters/city-search/zoneCitiesSource.ts`: `[]` without `Intl.DisplayNames` (FR5). In `src/adapters/city-search/zoneCitiesSource.matching.test.ts`, with the global removed: "Kazakhstan" matches no record by country; "Almaty" still matches. Then UX3: in `src/views/shared/LocationRow.test.tsx` and `src/views/shared/LocationSearch.test.tsx`, a row and a result with `countryName: ""` render no separator text. Verify with `npx vitest run src/adapters/city-search/zoneCitiesSource.matching.test.ts`, then `npx vitest run src/views/shared/LocationRow.test.tsx`, then `npx vitest run src/views/shared/LocationSearch.test.tsx`.
- [ ] 4.3 TDD `src/controller/usePrefersReducedMotion.ts`: `addListener` / `removeListener` fallback (design D6, FR7). Tests in `src/controller/usePrefersReducedMotion.test.ts` with a `MediaQueryList` stub that has only `addListener`: the preference turns on → the hook returns `true`; unmount → `removeListener` is called with the same listener; the modern path still uses `addEventListener`. Verify red, then green, with `npx vitest run src/controller/usePrefersReducedMotion.test.ts`.
- [ ] 4.4 Mutation run: `npx stryker run --mutate 'src/presenter/countryName.ts,src/adapters/city-search/zoneCitiesSource.ts,src/controller/usePrefersReducedMotion.ts,src/lib/legacy/engineSupport.ts'` scores ≥ 95% (minimum 90%) (M6).

## 5. Legacy support and boot (TDD)

- [ ] 5.1 TDD new `src/lib/legacy/zoneShim.ts` (design D4, FR4): `createLegacyZoneDateTimeFormat(nativeDateTimeFormat, legacyNamesByCanonicalId)`, `getLegacyZoneNames(timeZoneAliases)` (the inverse of `virtual:time-zone-aliases`) and `installLegacyZoneShim()`; export them from `lib/legacy/index.ts`. The module must not import `@/lib/temporal`. Tests in `src/lib/legacy/zoneShim.test.ts` with a fake native that rejects `Europe/Kyiv`:
  - retries `Europe/Kiev` and formats `09:30` at `2026-03-08T07:30:00Z`;
  - rethrows the original `RangeError` when no legacy name is accepted (`America/Ciudad_Juarez`);
  - passes calls without `timeZone` through unchanged;
  - keeps `supportedLocalesOf` and `instanceof`.

  Verify red, then green, with `npx vitest run src/lib/legacy/zoneShim.test.ts`.
- [ ] 5.2 TDD `needsLegacySupport()` and `IS_POINTER_EVENTS_SUPPORTED` in `src/lib/legacy/engineSupport.ts` (design D2, D8, FR2): true when `"at" in Array.prototype` is false, when `ResizeObserver` is missing, or when the `LEGACY_ZONE_PROBE_ID` probe throws; false otherwise. Use `it.each` over the 4 cases, and one case each for `IS_POINTER_EVENTS_SUPPORTED` with and without `PointerEvent` (fresh import). Verify with `npx vitest run src/lib/legacy/engineSupport.test.ts`.
- [ ] 5.3 Add `scripts/legacyCoreJs/listLegacyCoreJsModules.ts` (pure list builder) and `scripts/legacyCoreJs/legacyCoreJsPlugin.ts`, a Vite plugin serving `virtual:legacy-core-js`: one `import "core-js/modules/<name>.js"` line per module that `core-js-compat` reports for `{ targets: "ios_saf 12.2", modules: "core-js/stable" }` (design D3). Declare the module in `src/vite-env.d.ts` and register the plugin in `vite.config.ts` and `vitest.config.ts`. Unit-test the list builder in `src/test/legacyBuild/listLegacyCoreJsModules.test.ts`: the list contains `es.array.at` and `es.object.from-entries`, and does not contain `es.promise`. Verify with `npx vitest run src/test/legacyBuild/listLegacyCoreJsModules.test.ts`.
- [ ] 5.4 Add `src/lib/legacy/polyfills/index.ts` exporting `installLegacySupport()` (design D3, FR2, FR4, FR6): it imports `virtual:legacy-core-js`, installs `@juggle/resize-observer` on `globalThis` when absent, and calls `installLegacyZoneShim()` when the probe fails. Test in `src/lib/legacy/polyfills/installLegacySupport.test.ts` with `ResizeObserver` removed: after `installLegacySupport()`, `globalThis.ResizeObserver` is a function; with a native present, it is the same native. Verify with `npx vitest run src/lib/legacy/polyfills/installLegacySupport.test.ts`.
- [ ] 5.5 TDD new `src/boot.ts` (design D2). It exports `bootApp({ needsLegacySupport, loadLegacySupport, loadApp })` and runs it with `needsLegacySupport` from `@/lib/legacy`, `() => import("@/lib/legacy/polyfills").then((polyfills) => polyfills.installLegacySupport())` and `() => import("./main")`. Tests in `src/boot.test.ts`:
  - with `needsLegacySupport` false, `loadLegacySupport` is never called and `loadApp` is called once;
  - with true, `loadLegacySupport` resolves before `loadApp` starts (order recorded in an array);
  - a rejected `loadLegacySupport` still calls `loadApp`.

  Point `index.html` at `/src/boot.ts`. Verify red, then green, with `npx vitest run src/boot.test.ts`.
- [ ] 5.6 Add `scripts/legacyBuild/mainPreloadPlugin.ts` (design D2, NFR-P2) and register it in `vite.config.ts`. Set `build.target` and `build.cssTarget` to `LEGACY_BUILD_TARGETS` (design D1, D7), and `build.rollupOptions.output.manualChunks` to put the polyfills into the `LEGACY_POLYFILLS_CHUNK_NAME` chunk (design D2). Verify with `pnpm run build`, then `pnpm --filter @time-zones/client check:bundle-size`: initial JS ≤ 150 KB (NFR-P1, M5). Section 9 adds the automated check of the preload links.
- [ ] 5.7 Mutation run: `npx stryker run --mutate 'src/lib/legacy/zoneShim.ts,src/lib/legacy/engineSupport.ts,src/lib/legacy/polyfills/index.ts,src/boot.ts'` scores ≥ 95% (minimum 90%) (M6).

## 6. Input fallbacks (TDD)

- [ ] 6.1 TDD `src/views/shared/DayTrack.tsx`: without Pointer Events, `onClick` → `selectAt` and no `onPointer*` handlers; with them, no `onClick` (design D8, FR8, UX1). Tests in new `src/views/shared/DayTrack.legacy.test.tsx`, with `dayTrackFixture.tsx`, a stubbed `getBoundingClientRect` and a re-imported module with `PointerEvent` removed: a click at three quarters of the track calls `onSelectFraction(0.75)`. With `PointerEvent` present, a click without a press calls nothing. Verify red, then green, with `npx vitest run src/views/shared/DayTrack.legacy.test.tsx`, then `npx vitest run src/views/shared/DayTrack.test.tsx`.
- [ ] 6.2 Write `src/test/features/time_selection/time_selection_legacy_tap_unit.feature` with `steps/time_selection_legacy_tap_unit.steps.tsx`: "A tap selects a time without Pointer Events" (Almaty and New York, `2026-03-08T07:30:00Z`, three quarters of the New York track → pinned to `2026-03-08T13:00:00Z`, Almaty `18:00`) and "A click adds nothing where Pointer Events exist", tagged `@support-legacy-ios-12-safari @FR8 @UX1`. Reuse `timeSelectionWorld.tsx`. Verify with `npx vitest run src/test/features/time_selection/steps/time_selection_legacy_tap_unit.steps.tsx`.
- [ ] 6.3 Write `src/test/features/time_selection/time_selection_legacy_tap_e2e.feature` with `steps/time_selection_legacy_tap_e2e.steps.ts`, reusing `timeSelectionE2eHelpers.ts`: on an engine without `PointerEvent`, a finger tap at 75 percent of the Almaty track shows `18:00` (`@FR8 @UX1`); the track keeps its slider role, name, value and arrow keys (`@NFR-A2`). Tags start with `@support-legacy-ios-12-safari`. Verify with `pnpm --filter @time-zones/client test:bdd -- --grep "support-legacy-ios-12-safari"`.
- [ ] 6.4 TDD `src/views/shared/LocationList.tsx`: the sensor class from `IS_POINTER_EVENTS_SUPPORTED`, with the `TouchSensor` activation constraint `{ delay: REORDER_TOUCH_ACTIVATION_DELAY_MS, tolerance: REORDER_TOUCH_ACTIVATION_TOLERANCE_PX }` (design D8, FR9, UX2). In new `src/views/shared/LocationList.sensors.test.tsx`, spy on dnd-kit `useSensor` through `vi.mock` and check: without `PointerEvent`, `TouchSensor` with those options plus `KeyboardSensor`; with it, `PointerSensor` with the distance constraint plus `KeyboardSensor`. Verify red, then green, with `npx vitest run src/views/shared/LocationList.sensors.test.tsx`, then `npx vitest run src/views/shared/LocationList.test.tsx`.
- [ ] 6.5 Write `src/test/features/locations/locations_reorder_legacy_unit.feature` with `steps/locations_reorder_legacy_unit.steps.tsx`: "Sensors depend on Pointer Events", tagged `@support-legacy-ios-12-safari @FR9`. Verify with `npx vitest run src/test/features/locations/steps/locations_reorder_legacy_unit.steps.tsx`.
- [ ] 6.6 Write `src/test/features/locations/locations_reorder_legacy_e2e.feature` with `steps/locations_reorder_legacy_e2e.steps.ts`, reusing the CDP touch helpers of `locationsReorderE2eHelpers.ts`: on an engine without `PointerEvent`, "Drag by finger without Pointer Events" (hold the New York drag handle for longer than the delay, drag it above Moscow → New York, Moscow, Almaty; the page scroll position is unchanged during the drag) tagged `@support-legacy-ios-12-safari @FR9 @UX2`, and a swipe over the drag handle that moves before the delay scrolls the page (`@UX2`). Verify with `pnpm --filter @time-zones/client test:bdd -- --grep "support-legacy-ios-12-safari"`.
- [ ] 6.7 Mutation run: `npx stryker run --mutate 'src/views/shared/DayTrack.tsx,src/views/shared/LocationList.tsx'` scores ≥ 95% (minimum 90%) (M6).

## 7. Update recheck on return (TDD)

- [ ] 7.1 TDD new `src/controller/useUpdateRecheckOnReturn.ts` (design D10, FR10). Tests in `src/controller/useUpdateRecheckOnReturn.test.tsx` with a fake registration (`update: vi.fn()`), `createSwitchableClock` and `setPageVisibility`:
  - visible after 16 min → `update` called once;
  - visible after 5 min → not called;
  - hidden after 16 min → not called;
  - two visible events 16 min apart → called twice;
  - `update` rejecting → `onCheckFailed` called;
  - no registration → nothing called;
  - unmount removes the listener.

  Verify red, then green, with `npx vitest run src/controller/useUpdateRecheckOnReturn.test.tsx`.
- [ ] 7.2 Wire the hook into `src/controller/usePwaUpdateStatus.ts` with an optional `clock: Clock = systemClock` parameter (design D10). Keep `src/controller/usePwaUpdateStatus.test.ts` green and add a case: after `onRegisteredSW` and a visible event 16 min later, a second `update` call happens. Verify with `npx vitest run src/controller/usePwaUpdateStatus.test.ts`.
- [ ] 7.3 Write `src/test/features/app_shell/app_shell_update_recheck.feature` with `steps/app_shell_update_recheck.steps.tsx`, using `fakeServiceWorker`: "Returning to the app checks again", "Returning soon after a check does not check", "Hiding the page does not check" and "A check on return fails offline", tagged `@support-legacy-ios-12-safari @FR10`. Verify with `npx vitest run src/test/features/app_shell/steps/app_shell_update_recheck.steps.tsx`.
- [ ] 7.4 Mutation run: `npx stryker run --mutate 'src/controller/useUpdateRecheckOnReturn.ts,src/controller/usePwaUpdateStatus.ts'` scores ≥ 95% (minimum 90%) (M6).

## 8. CSS and page head

- [ ] 8.1 Add `theme.extend.minHeight.dvh = ["100vh", "100dvh"]` to `tailwind.config.ts` (design D7, FR12) and `<meta name="apple-mobile-web-app-capable" content="yes">` to `index.html` (FR11). Verify with `pnpm run build`; sections 9 and 10 add the automated checks of both.

## 9. Legacy build check (TDD)

- [ ] 9.1 TDD the pure module `scripts/legacyBuild/findLegacySyntaxIssues.ts` (design D9, FR13): `findLegacySyntaxIssues(fileName, source)` returns `{ file, construct }[]` (acorn `ecmaVersion: 2020`, module; parse errors, `ChainExpression`, `??`, BigInt literals, regex lookbehind), and `findInsetShorthand(fileName, css)` reports `inset:` declarations; `findMissingVhFallback(fileName, css)` reports a `100dvh` declaration with no `100vh` before it in the same rule (FR12). Tests in `src/test/legacyBuild/findLegacySyntaxIssues.test.ts` with `it.each`: one snippet per construct is reported; `import()`, `import.meta` and `catch {}` are allowed; `top:0;inset-inline:0` is not reported. Verify red, then green, with `npx vitest run src/test/legacyBuild/findLegacySyntaxIssues.test.ts`.
- [ ] 9.2 Add `scripts/check-legacy-build.mjs` and, in `packages/client/package.json`, the script `"check:legacy-build": "node scripts/check-legacy-build.mjs"` and the `build` script `"tsc -b && vite build && node scripts/check-legacy-build.mjs"` (design D9). It reads `dist/assets/*.{js,css}`, `dist/sw.js` and `dist/workbox-*.js` (or a directory given as its argument), prints every issue and exits non-zero on any. Also make it check that `dist/index.html` has a `modulepreload` for the main chunk and none for the polyfill chunk (NFR-P2). Test the script in `src/test/legacyBuild/checkLegacyBuild.test.ts` with `execFileSync` on fixture directories under `src/test/legacyBuild/fixtures/`, as `benchBudgets.test.ts` does: a clean fixture exits 0; fixtures with `??`, with `inset:0` and without the preload exit non-zero and name the file. Verify with `npx vitest run src/test/legacyBuild/checkLegacyBuild.test.ts`, then `pnpm run build` exits 0 (M2).
- [ ] 9.3 Mutation run: `npx stryker run --mutate 'scripts/legacyBuild/findLegacySyntaxIssues.ts,scripts/legacyCoreJs/listLegacyCoreJsModules.ts'` scores ≥ 95% (minimum 90%) (M6).

## 10. Behavior features

- [ ] 10.1 Write `src/test/features/browser_compatibility/browser_compatibility_legacy_engine_unit.feature` (vitest-cucumber) with `steps/browser_compatibility_legacy_engine_unit.steps.tsx`. It covers the `browser-compatibility` scenarios that are not build or browser checks: main page on a legacy engine (FR1, M4), legacy engine installs polyfills first (FR2, through `bootApp`), zone checks without BigInt (FR3), the three renamed-zone scenarios (FR4, M3, with the fake native of task 5.1 installed before a fresh import), rows and search results without country names (FR5, UX3), view selection without `ResizeObserver` (FR6), and the two reduced-motion scenarios (FR7). Tags: `@support-legacy-ios-12-safari @FR-X`. Verify with `npx vitest run src/test/features/browser_compatibility`.
- [ ] 10.2 Write `src/test/features/browser_compatibility/browser_compatibility_legacy_engine_e2e.feature` with `steps/browser_compatibility_legacy_engine_e2e.steps.ts` (playwright-bdd, production build):
  - "Modern engine skips the polyfills": the page requests no polyfill chunk and shows the main page (`@NFR-P2 @M5 @FR2`);
  - "Legacy engine installs the polyfills first": with `Array.prototype.at` deleted by an init script, the polyfill chunk is requested, `[1, 2].at(-1)` is `2` in the page, and the main page shows the stored cards (`@FR1 @FR2`);
  - "Page declares an iOS home-screen web app" (`@FR11`);
  - "Main page and search dialog have no axe violations" with `@axe-core/playwright` (`@NFR-A1`).

  The polyfill chunk is recognised by `LEGACY_POLYFILLS_CHUNK_NAME`.

  Verify with `pnpm --filter @time-zones/client test:bdd -- --grep "support-legacy-ios-12-safari"`.

## 11. Integration verification

- [ ] 11.1 Run, one at a time: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm run build` (includes the legacy build check, M2), `pnpm --filter @time-zones/client check:bundle-size` (NFR-P1, M5). All must pass.
- [ ] 11.2 Run `pnpm --filter @time-zones/client test:bdd` once. Every scenario passes and every existing screenshot baseline in `chromium` and `mobile-chrome` passes without `--update-snapshots` (NFR-R1).
- [ ] 11.3 Traceability check (M1). From the repository root, run:

  ```sh
  for id in FR1 FR2 FR3 FR4 FR5 FR6 FR7 FR8 FR9 FR10 FR11 FR12 FR13 NFR-P1 NFR-P2 NFR-A1 NFR-A2 UX1 UX2 UX3; do grep -rqE "(support-legacy-ios-12-safari.*[^A-Za-z-]$id\b|[^A-Za-z-]$id\b.*support-legacy-ios-12-safari)" packages/client/src packages/client/scripts || echo "missing $id"; done
  ```

  It must print nothing. NFR-R1 is covered by task 11.2.

## 12. Handoff

- [ ] 12.1 Handoff H1: write `handoff/H1-adr-supported-browser-engines.patch` and its README section. The patch adds `docs/adr/0009-supported-browser-engines.md` (status Proposed; supported engines; the boot-time conditional polyfill strategy; the BigInt ban; the legacy zone shim as a stopgap that keeps ADR-0003's "we do not ship our own tzdata"), and links it from the "ADRs" line of `CLAUDE.md` and the document table of `docs/architecture/overview.md`. Verify with `git apply --check openspec/changes/support-legacy-ios-12-safari/handoff/H1-adr-supported-browser-engines.patch` from the repository root.
- [ ] 12.2 Handoff H2: write `handoff/H2-glossary-browser-compatibility.patch` and its README section. The patch adds `docs/glossary/browser-compatibility.md` with **Supported engine**, **Legacy engine** (*Never:* old browser, legacy browser), **Legacy support** (*Code:* `src/lib/legacy/`, `src/boot.ts`) and **Legacy zone shim** (*Code:* `src/lib/legacy/zoneShim.ts`; *Not:* the legacy zone name), adds **Update recheck** (*Code:* `useUpdateRecheckOnReturn`, `UPDATE_RECHECK_INTERVAL_MS`) to `docs/glossary/app-shell.md`, and adds the new file to the context table of `docs/glossary/README.md`. Verify with `git apply --check openspec/changes/support-legacy-ios-12-safari/handoff/H2-glossary-browser-compatibility.patch`.
- [ ] 12.3 Handoff H3: write the README section for the device acceptance run (no patch): the steps of M7 (deploy, open in Safari on iOS 12.5.7, add to the home screen, open once online, then U1, U2, U3, U5, and U4 after a later deploy; 0 errors in the Web Inspector console), and where to record the result and any change of `REORDER_TOUCH_ACTIVATION_DELAY_MS`. Verify with `grep -n "## H3" openspec/changes/support-legacy-ios-12-safari/handoff/README.md`.

## Human follow-up

- H1 (FR1, FR2, FR3, FR4): apply `handoff/H1-adr-supported-browser-engines.patch` — adds ADR-0009 "Supported browser engines" and links it from `CLAUDE.md` and `docs/architecture/overview.md`; review it and set its status to Accepted.
  Why manual: the implement stage may not write `docs/adr/` or `CLAUDE.md`, and accepting an ADR is the owner's decision.
  Automated part: every rule the ADR records is enforced by tests of this change (`noBigIntInSources.test.ts`, the legacy build check inside `pnpm build`, the legacy engine features).
- H2 (FR4, FR10, FR13): apply `handoff/H2-glossary-browser-compatibility.patch` — adds the `browser-compatibility` glossary context and the **Update recheck** term.
  Why manual: the implement stage may not write `docs/`.
  Automated part: `git apply --check` in task 12.2; the code already uses the names the entries define.
- H3 (FR1, M7): run the acceptance on the owner's iOS 12.5.7 device as `handoff/README.md` "H3" describes.
  Why manual: it needs a physical iOS 12.5 device; Playwright WebKit cannot emulate iOS 12 (NG9), and no such device is reachable from the sandbox or CI.
  Automated part: every fallback is tested by removing its API in jsdom (unit BDD) and in Chromium (E2E), and the legacy build check proves the Safari 12 syntax level on every build.
