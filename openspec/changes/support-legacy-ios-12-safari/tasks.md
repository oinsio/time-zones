# Tasks

All source paths are under `packages/client/`. Commands run from `packages/client/` unless they start with `pnpm --filter` or `git`, which run from the repository root.

- **Running tests:** one command at a time, never in the background. Vitest collects only `src/**/*.{test,steps}.{ts,tsx}`, so every test below sits under `src/`, and a feature runs through its steps file. Mutation runs take at most 5 files per run. The report is in `reports/mutation/mutation-report.json`.
- **Time in tests:** only `fakeClock(instant, timeZone)` of `@/lib/temporal` or `createSwitchableClock` (`src/test/switchableClock.ts`). Never `vi.setSystemTime()` or `vi.useFakeTimers()`. Page visibility comes from `setPageVisibility` / `resetPageVisibility` (`src/test/pageVisibility.ts`).
- **Missing APIs in tests:** remove the API with `vi.stubGlobal(...)` (or delete the property), and restore it with `vi.unstubAllGlobals()`. Modules that read support at load time are re-imported after `vi.resetModules()` (design D11). Temporal is always imported from `@/lib/temporal`.
- **Traceability:** every new test, step file and feature carries `support-legacy-ios-12-safari`:
  - `@support-legacy-ios-12-safari @FR-X` tags above scenarios;
  - `// @support-legacy-ios-12-safari @FR-X` before `f.Scenario`, `// Verifies NFR-X of support-legacy-ios-12-safari` in E2E steps;
  - `Implements FR-X of support-legacy-ios-12-safari` in the JSDoc of new or changed production code.
- **File size:** every new or changed file stays under 200 lines (`.claude/rules/process-invariants.md`: "Target 100–200 lines per file; 300 is a hard cap"). Existing test files at or near the limit (`app_shell_notices.steps.ts` 273, `LocationRow.test.tsx` 224, `app_shell_smoke_e2e.steps.ts` 199, `LocationList.test.tsx` 196, `locationsReorderE2eHelpers.ts` 196, `time_selection_select_time.steps.tsx` 190, `locations_reorder_drag_e2e.steps.ts` 188, `locations_reorder_e2e.feature` 237) get no new code: the tasks below put the new tests into new files. Each task's verification includes `wc -l` on the files it creates or changes, every count < 200.
- **Design references:** "design Dn" refers to `design.md`.

## 1. Spike: zone shim against temporal-polyfill (blocks section 5)

- [ ] 1.1 Spike test `src/lib/legacy/zoneShim.temporal.test.ts` (design D4, proposal Q2, FR4), header `// FR4 of support-legacy-ios-12-safari: the shim reaches temporal-polyfill`. First add `server: { deps: { inline: ["temporal-polyfill"] } }` under `test` in `vitest.config.ts`: `src/test/setup.ts` already imports `@/lib/temporal`, and Vitest does not re-evaluate an externalized `node_modules` package after `vi.resetModules()`, so without it the polyfill keeps the real constructor (design D4). Install a fake `Intl.DateTimeFormat` that records every `timeZone` it receives, throws `RangeError` for `Europe/Kyiv` and delegates otherwise. Wrap it with a minimal retry on `Europe/Kiev`. Then call `vi.resetModules()` and import `@/lib/temporal` and `@/model` fresh. Check:
  - the fake's call log holds a rejected `Europe/Kyiv` call followed by an accepted `Europe/Kiev` call, so the test fails when the shim is bypassed (verify this once by removing the inline entry: the spike must go red);
  - `Temporal.Instant.from("2026-03-08T07:30:00Z").toZonedDateTimeISO("Europe/Kyiv")` gives `09:30` and offset `+02:00`, and record what `.timeZoneId` returns;
  - `resolveWallClock("Europe/Kyiv", Temporal.PlainDateTime.from("2026-03-08T10:00"))` gives `2026-03-08T08:00:00Z` with `WallClockStatus.UNIQUE`;
  - `resolveWallClock("Europe/Kyiv", Temporal.PlainDateTime.from("2026-03-29T03:30"))` gives `2026-03-29T01:30:00Z` with `WallClockStatus.GAP`;
  - `resolveWallClock("Europe/Kyiv", Temporal.PlainDateTime.from("2026-10-25T03:30"))` gives `2026-10-25T00:30:00Z` with `WallClockStatus.AMBIGUOUS` (DST end: the `earlier` and `later` paths differ);
  - no other `Intl` / `Date` path throws.

  If every check passes, keep the file: after task 5.1 it switches from the minimal retry to `createLegacyZoneDateTimeFormat`, and it stays as the regression test for the path `add-wall-time-input-with-hint` relies on. If any check fails, follow the fallback of design D4 (explicit resolver) before section 5, and keep the failing checks as the tests of that resolver. Verify with `npx vitest run src/lib/legacy/zoneShim.temporal.test.ts`, then that the inline entry breaks nothing with `npx vitest run src/model/wallClock.test.ts`.

## 2. Dependencies and constants (no TDD: setup and constants)

- [ ] 2.1 Add the dependencies of design D3 and D9: `pnpm --filter @time-zones/client add core-js @juggle/resize-observer`, then `pnpm --filter @time-zones/client add -D core-js-compat acorn` (`core-js-compat` at the same minor as `core-js`). Verify with `pnpm --filter @time-zones/client typecheck`.
- [ ] 2.2 Add the constants and re-export them from `src/constants/index.ts`:
  - `UPDATE_RECHECK_INTERVAL_MS = 15 * MILLISECONDS_PER_MINUTE` in new `src/constants/update.ts` (design D10, FR10);
  - `REORDER_TOUCH_ACTIVATION_DELAY_MS = 250` and `REORDER_TOUCH_ACTIVATION_TOLERANCE_PX = 5` in `src/constants/reorder.ts` (design D8, FR9);
  - `LEGACY_ZONE_PROBE_ID = "Europe/Kyiv"` in new `src/constants/legacy.ts` (design D2);
  - `NANOSECONDS_PER_MILLISECOND = 1_000_000` in `src/constants/utcOffset.ts` (design D5).

  Verify with `pnpm --filter @time-zones/client typecheck`.

## 3. Model: no BigInt (TDD)

- [ ] 3.1 Add the source-scan test `src/test/noBigIntInSources.test.ts` (design D5, FR3, FR13). It reads `src/**/*.{ts,tsx}`, excluding `*.test.*`, `*.steps.*`, `*.bench.*` and `src/test/`. It asserts that no file matches a BigInt literal, `BigInt(` or `epochNanoseconds`. Verify red with `npx vitest run src/test/noBigIntInSources.test.ts`: it lists `timeZoneId.ts`, `dayPeriodStops.ts` and `dayPeriodWindows.ts`.
- [ ] 3.2 TDD in `src/model/timeZoneId.ts`: build the probe from `Temporal.Instant.fromEpochMilliseconds(0)` (design D5). In `src/model/timeZoneId.test.ts`, add a case with `vi.stubGlobal("BigInt", undefined)`: `canonicalizeTimeZoneId("Asia/Almaty")` → `"Asia/Almaty"` and `canonicalizeTimeZoneId("Europe/Kiev")` → `"Europe/Kyiv"`. Verify red, then green, with `npx vitest run src/model/timeZoneId.test.ts`.
- [ ] 3.3 TDD in `src/model/dayPeriodStops.ts` and `src/model/dayPeriodWindows.ts`: millisecond arithmetic (design D5). Keep the existing stop tests green. Add a case that computes the Almaty and New York stops for the `2026-03-08` reference day with `BigInt` stubbed out and expects the same arrays as with `BigInt` present. Verify with `npx vitest run src/model/dayPeriodStops.test.ts`, then `npx vitest run src/model/dayPeriodWindows.test.ts`, then `npx vitest run src/test/noBigIntInSources.test.ts` (now green).
- [ ] 3.4 Mutation run. Verify that `npx stryker run --mutate 'src/model/timeZoneId.ts,src/model/dayPeriodStops.ts,src/model/dayPeriodWindows.ts'` scores ≥ 95% (minimum 90%).

## 4. API guards (TDD)

- [ ] 4.1 TDD `src/presenter/countryName.ts`: return `""` when `Intl.DisplayNames` is not a function (design D6, FR5). Tests in new `src/presenter/countryName.test.ts`, with the global removed and the module re-imported: `presentCountryName("KZ", "en")` → `""` with no throw. With the global present, `"Kazakhstan"` stays. Verify red, then green, with `npx vitest run src/presenter/countryName.test.ts`.
- [ ] 4.2 TDD `readCountryTexts` in `src/adapters/city-search/zoneCitiesSource.ts`: `[]` without `Intl.DisplayNames` (FR5). In `src/adapters/city-search/zoneCitiesSource.test.ts`, with the global removed: "Kazakhstan" matches no record by country, and "Almaty" still matches. Verify red, then green, with `npx vitest run src/adapters/city-search/zoneCitiesSource.test.ts`.
- [ ] 4.3 UX3 tests: in new `src/views/shared/LocationRow.countryless.test.tsx` (the existing `LocationRow.test.tsx` is already 224 lines and stays untouched), a row with `countryName: ""` and an offset label renders the offset and no empty country element. In `src/views/shared/LocationSearchDialog.test.tsx` (83 lines), a result with `countryName: ""` renders the city and no empty country element. Tag both `// UX3 of support-legacy-ios-12-safari`. Verify with `npx vitest run src/views/shared/LocationRow.countryless.test.tsx`, then `npx vitest run src/views/shared/LocationSearchDialog.test.tsx`.
- [ ] 4.4 TDD `src/controller/usePrefersReducedMotion.ts`: `addListener` / `removeListener` fallback (design D6, FR7). Tests in `src/controller/usePrefersReducedMotion.test.ts` with a `MediaQueryList` stub that has only `addListener`:
  - the preference turns on → the hook returns `true`;
  - unmount → `removeListener` is called with the same listener;
  - the modern path still uses `addEventListener`.

  Verify red, then green, with `npx vitest run src/controller/usePrefersReducedMotion.test.ts`.
- [ ] 4.5 Mutation run. Verify that `npx stryker run --mutate 'src/presenter/countryName.ts,src/adapters/city-search/zoneCitiesSource.ts,src/controller/usePrefersReducedMotion.ts'` scores ≥ 95% (minimum 90%).

## 5. Legacy support and boot (TDD)

- [ ] 5.1 TDD new `src/lib/legacy/zoneShim.ts` (design D4, FR4): `getLegacyZoneNames(timeZoneAliases)` (canonical → legacy names), `createLegacyZoneDateTimeFormat(nativeDateTimeFormat, legacyNamesByCanonicalId)` and `installLegacyZoneShim()`. Tests in `src/lib/legacy/zoneShim.test.ts` with a fake native that rejects `Europe/Kyiv`:
  - `getLegacyZoneNames` maps `Europe/Kyiv` to a list containing `Europe/Kiev`;
  - retries `Europe/Kiev` and formats `09:30` at `2026-03-08T07:30:00Z`;
  - rethrows the original `RangeError` when no legacy name is accepted (`America/Ciudad_Juarez`);
  - passes calls without `timeZone` through unchanged;
  - keeps `supportedLocalesOf` and `instanceof`.

  Verify red, then green, with `npx vitest run src/lib/legacy/zoneShim.test.ts`.
- [ ] 5.2 TDD new `src/lib/legacy/needsLegacySupport.ts` (design D2, FR2): true when `"at" in Array.prototype` is false, when `ResizeObserver` is missing, or when the `LEGACY_ZONE_PROBE_ID` probe throws. False otherwise. Use `it.each` over the 4 cases in `src/lib/legacy/needsLegacySupport.test.ts`. Verify with `npx vitest run src/lib/legacy/needsLegacySupport.test.ts`.
- [ ] 5.3 Add the pure list builder `scripts/legacyCoreJs/buildLegacyCoreJsModules.ts` and the Vite plugin `scripts/legacyCoreJs/legacyCoreJsPlugin.ts` serving `virtual:legacy-core-js` (design D3): one `import "core-js/modules/<name>.js"` line per module that `core-js-compat` reports for `{ targets: "ios_saf 12.2", modules: "core-js/stable" }`. Declare the virtual module in `src/vite-env.d.ts`. Register `legacyCoreJsPlugin()` in `vitest.config.ts` next to `zoneDataPlugin()` (`plugins: [react(), zoneDataPlugin(), legacyCoreJsPlugin()]`), so Vitest and Stryker (which runs through `vitest.config.ts`) resolve `virtual:legacy-core-js` for tasks 5.4, 5.7 and 10.1; `vite.config.ts` follows in task 5.6. Test in `src/test/legacyCoreJs/buildLegacyCoreJsModules.test.ts`: the list contains `es.array.at` and `es.object.from-entries`, and does not contain `es.promise` (present in iOS 12). A second case in `src/test/legacyCoreJs/legacyCoreJsPlugin.test.ts` does `await import("virtual:legacy-core-js")` and expects it to resolve, which fails while the plugin is missing from `vitest.config.ts`. Verify with `npx vitest run src/test/legacyCoreJs`.
- [ ] 5.4 Add `src/lib/legacy/pointerEvents.ts` (`IS_POINTER_EVENTS_SUPPORTED`, design D8), `src/lib/legacy/installLegacySupport.ts` and `src/lib/legacy/index.ts`. `installLegacySupport` imports `virtual:legacy-core-js`, installs `@juggle/resize-observer` on `globalThis` when it is absent, and calls `installLegacyZoneShim()` when the probe fails (design D3, FR2, FR4, FR6). `index.ts` exports `needsLegacySupport`, `loadLegacySupport = () => import("./installLegacySupport")`, `IS_POINTER_EVENTS_SUPPORTED` and the shim types. Test in `src/lib/legacy/installLegacySupport.test.ts` with `ResizeObserver` removed: after `await loadLegacySupport()`, `globalThis.ResizeObserver` is a function. Verify with `npx vitest run src/lib/legacy/installLegacySupport.test.ts`.
- [ ] 5.5 TDD new `src/boot.ts` (design D2). It exports `bootApp({ needsLegacySupport, loadLegacySupport, loadApp })` and runs it with `@/lib/legacy` and `() => import("./main")`. Tests in `src/boot.test.ts`:
  - with `needsLegacySupport` false, `loadLegacySupport` is never called and `loadApp` is called once;
  - with true, `loadLegacySupport` resolves before `loadApp` starts (order recorded by a log array);
  - a rejected `loadLegacySupport` still calls `loadApp`, so the app shows its recovery screen instead of a blank page;
  - a source scan of `src/boot.ts` and `src/lib/legacy/*.ts` (tests excluded) finds no static import of `@/lib/temporal`, `temporal-polyfill`, `react` or `./main`.

  Point `index.html` at `/src/boot.ts`. Verify red, then green, with `npx vitest run src/boot.test.ts`.
- [ ] 5.6 Add the `modulepreload` plugin for the `main` chunk under `scripts/legacyBoot/` (design D2, NFR-P2), and register it and the plugin of 5.3 in `vite.config.ts`. Set `build.target` and `build.cssTarget` (design D1, D7). The plugin's JSDoc says `Implements NFR-P1, NFR-P2 of support-legacy-ios-12-safari`, and the header of `scripts/check-bundle-size.mjs` gains `NFR-P1 of support-legacy-ios-12-safari`. Verify with `pnpm run build`, then `pnpm --filter @time-zones/client check:bundle-size`:
  - `dist/index.html` has a `modulepreload` for the main chunk and none for the chunk holding `installLegacySupport` (`grep -c modulepreload dist/index.html`, then `grep -L installLegacySupport` on each preloaded file);
  - the bundle-size check reports initial JS ≤ 150 KB and passes (NFR-P1, M5).
- [ ] 5.7 Mutation run. Verify that `npx stryker run --mutate 'src/lib/legacy/zoneShim.ts,src/lib/legacy/needsLegacySupport.ts,src/lib/legacy/installLegacySupport.ts,src/boot.ts'` scores ≥ 95% (minimum 90%).

## 6. Input fallbacks (TDD)

- [ ] 6.1 Give the `PointerEvent` stand-in one owner (design D8, no TDD: test setup). Move `FakePointerEvent` from `src/views/shared/dayTrackFixture.tsx` into new `src/test/fakePointerEvent.ts`. In `src/test/setup.ts`, assign it to `globalThis.PointerEvent` when `typeof globalThis.PointerEvent !== "function"`. Delete `useFakePointerEvents` from `dayTrackFixture.tsx` and its import and call from `src/views/shared/DayTrack.input.test.tsx`. Verify that `grep -rn "FakePointerEvent\|useFakePointerEvents" src` lists only `src/test/fakePointerEvent.ts` and `src/test/setup.ts`, and that `npx vitest run src/views/shared/DayTrack.input.test.tsx`, then `npx vitest run src/views/shared/DayTrack.test.tsx`, then `npx vitest run src/views/shared/LocationList.test.tsx` stay green.
- [ ] 6.2 TDD `src/views/shared/DayTrack.tsx`: `onClick` → `selectAt` only when `IS_POINTER_EVENTS_SUPPORTED` is false (design D8, FR8, NFR-A2, UX1). Tests in new `src/views/shared/DayTrack.legacy.test.tsx`, using `dayTrackFixture.tsx` and a re-imported module with `PointerEvent` removed:
  - a click at `clientX` = three quarters of the track calls `onSelectFraction(0.75)`;
  - role, name, value and key handling are unchanged.

  With `PointerEvent` present, a click without a press calls nothing. Verify red, then green, with `npx vitest run src/views/shared/DayTrack.legacy.test.tsx`, then `npx vitest run src/views/shared/DayTrack.test.tsx`.
- [ ] 6.3 Write new `src/test/features/time_selection/time_selection_legacy_tap.feature` with the scenarios "A tap selects a time without Pointer Events" and "A click adds nothing where Pointer Events exist", and its step definitions in new `steps/time_selection_legacy_tap.steps.tsx` (reusing `timeSelectionWorld.tsx` and `dayTrackSteps.ts`), tagged `@support-legacy-ios-12-safari @FR8` (the tap one also `@UX1`). `time_selection_select_time.steps.tsx` (190 lines) stays untouched. Verify with `npx vitest run src/test/features/time_selection/steps/time_selection_legacy_tap.steps.tsx`.
- [ ] 6.4 TDD `src/views/shared/LocationList.tsx`: the sensor class from `IS_POINTER_EVENTS_SUPPORTED`, with `TouchSensor` options `{ delay: REORDER_TOUCH_ACTIVATION_DELAY_MS, tolerance: REORDER_TOUCH_ACTIVATION_TOLERANCE_PX }` (design D8, FR9, UX2). In new `src/views/shared/LocationList.sensors.test.tsx` (the existing `LocationList.test.tsx` is 196 lines), spy on dnd-kit `useSensor` through `vi.mock` and check:
  - without `PointerEvent`: `TouchSensor` with those options plus `KeyboardSensor`;
  - with it: `PointerSensor` with the distance constraint plus `KeyboardSensor`.

  Verify red, then green, with `npx vitest run src/views/shared/LocationList.sensors.test.tsx`, then `npx vitest run src/views/shared/LocationList.test.tsx` stays green.
- [ ] 6.5 Add the shared E2E helper `emulateEngineWithoutPointerEvents(page)` in its own new module `src/test/e2e/withoutPointerEvents.ts` (design D11), so no feature folder imports it from another feature's step helpers. Write new `src/test/features/locations/locations_reorder_legacy_touch_e2e.feature` with the scenarios "Drag by finger without Pointer Events" (order changes, `window.scrollY` unchanged during the drag) and "A quick swipe over the handle scrolls without Pointer Events", and its steps in new `steps/locations_reorder_legacy_touch_e2e.steps.ts`, built on `startTouch` / `dispatchTouch` imported from `locationsReorderE2eHelpers.ts` (same feature folder; that file stays unchanged), tagged `@support-legacy-ios-12-safari @FR9 @UX2`. `locations_reorder_e2e.feature` and `locations_reorder_drag_e2e.steps.ts` stay untouched. Verify with `pnpm --filter @time-zones/client test:bdd -- --grep "without Pointer Events"`.
- [ ] 6.6 Write new `src/test/features/time_selection/time_selection_legacy_touch_e2e.feature` with the scenario "A finger tap keeps the slider accessible without Pointer Events", and its steps in new `steps/time_selection_legacy_touch_e2e.steps.ts`, tagged `@support-legacy-ios-12-safari @FR8 @NFR-A2 @UX1`. It uses `emulateEngineWithoutPointerEvents`, taps through CDP, and checks the pinned time, the slider's role, accessible name, `aria-valuemin` / `aria-valuemax`, and that ArrowRight moves one track step. Verify with `pnpm --filter @time-zones/client test:bdd -- --grep "keeps the slider accessible"`.
- [ ] 6.7 Mutation run. Verify that `npx stryker run --mutate 'src/views/shared/DayTrack.tsx,src/views/shared/LocationList.tsx,src/lib/legacy/pointerEvents.ts'` scores ≥ 95% (minimum 90%).

## 7. Update check on return (TDD)

- [ ] 7.1 TDD new `src/controller/useUpdateRecheckOnReturn.ts` (design D10, FR10). Tests in `src/controller/useUpdateRecheckOnReturn.test.tsx` with a fake registration (`update: vi.fn()`), `createSwitchableClock` and `setPageVisibility`:
  - visible after 16 min → `update` called once;
  - visible after 5 min → not called;
  - hidden after 16 min → not called;
  - two visible events 16 min apart → called twice;
  - `update` rejecting → `onCheckFailed` called;
  - unmount removes the listener.

  Verify red, then green, with `npx vitest run src/controller/useUpdateRecheckOnReturn.test.tsx`.
- [ ] 7.2 Wire the hook into `src/controller/usePwaUpdateStatus.ts`: add `clock: Clock = systemClock`, keep the registration from `onRegisteredSW` in state, and pass `setIsUpdateCheckFailed(true)` as `onCheckFailed`. Keep `src/controller/usePwaUpdateStatus.test.ts` green and add a case: after `onRegisteredSW` and a visible event 16 min later, a second `update` call happens. Verify with `npx vitest run src/controller/usePwaUpdateStatus.test.ts`.
- [ ] 7.3 Write new `src/test/features/app_shell/app_shell_update_recheck.feature` with the scenarios "Returning to the app checks again", "Returning soon after a check does not check", "Hiding the page does not check" and "A check on return fails offline", and its step definitions in new `steps/app_shell_update_recheck.steps.ts`, tagged `@support-legacy-ios-12-safari @FR10`. The steps mock `virtual:pwa-register/react` with the shared `fakeServiceWorkerModule` of `src/test/fakeServiceWorker.ts`, which already captures `onRegisteredSW`, and report a fake registration through `fakeServiceWorker.onRegisteredSW`. Do not use `failUpdateCheck` there: its `update()` always rejects, and `usePwaUpdateStatus` already calls `update()` on registration, so the start-up check alone would show the note. For the offline case, the registration's `update` is a `vi.fn()` that resolves on its first (start-up) call and rejects with `TypeError("network unreachable")` on later calls. The scenario asserts that the failure note is absent after registration and before the page becomes visible, and shown after it; the other scenarios assert `update` call counts (1 at start-up, 2 after the recheck). `app_shell_notices.feature` and `app_shell_notices.steps.ts` (273 lines) stay untouched. Verify with `npx vitest run src/test/features/app_shell/steps/app_shell_update_recheck.steps.ts`.
- [ ] 7.4 Mutation run. Verify that `npx stryker run --mutate 'src/controller/useUpdateRecheckOnReturn.ts,src/controller/usePwaUpdateStatus.ts'` scores ≥ 95% (minimum 90%).

## 8. CSS and page head

- [ ] 8.1 Set `theme.extend.minHeight.dvh` in `tailwind.config.ts` to `["100vh", "100dvh"]` (design D7, FR12). Add `<meta name="apple-mobile-web-app-capable" content="yes">` to `index.html` (FR11). Verify with `pnpm run build`: the `min-h-dvh` rule in `dist/assets/index-*.css` declares `100vh` before `100dvh`, and `dist/index.html` contains the meta tag. The lasting check of the fallback is the `dvh` rule of tasks 9.1–9.2, which `check:legacy-build` runs on every build (and in CI after H1).
- [ ] 8.2 Write new `src/test/features/app_shell/app_shell_ios_home_screen_e2e.feature` with the scenario "Page declares an iOS home-screen web app", and its steps in new `steps/app_shell_ios_home_screen_e2e.steps.ts` (using the `test` of `app_shell_smoke_e2e.fixtures.ts`; `app_shell_smoke_e2e.steps.ts`, 199 lines, stays untouched), tagged `@support-legacy-ios-12-safari @FR11`. Verify with `pnpm --filter @time-zones/client test:bdd -- --grep "iOS home-screen"`.

## 9. Legacy build check

- [ ] 9.1 TDD the pure module `scripts/legacyBuild/findLegacySyntaxIssues.ts` (design D9, FR13). Input: file name and source. Output: a list of `{ file, construct }`. It parses with `acorn` (`ecmaVersion: 2020`, module), walks the AST and reports parse errors, `ChainExpression`, `??`, BigInt literals and regex lookbehind. `findInsetShorthand(css)` reports `inset:` declarations, and `findDvhWithoutFallback(css)` reports every rule with a `dvh` declaration that has no declaration of the same property with a `vh` value before it in that rule (FR12, design D7, D9). Tests in `src/test/legacyBuild/findLegacySyntaxIssues.test.ts` with `it.each`, header `// FR12, FR13 of support-legacy-ios-12-safari`:
  - one snippet per construct is reported, including `a ??= b` and `1_000`;
  - `import()`, `import.meta` and `catch {}` are allowed;
  - `top:0;inset-inline:0` is not reported as `inset:`;
  - `.min-h-dvh{min-height:100dvh}`, `.h-dvh{height:100dvh}` and `.x{min-height:100dvh;min-height:100vh}` (fallback after) are reported by `findDvhWithoutFallback`;
  - `.min-h-dvh{min-height:100vh;min-height:100dvh}` and a rule with no `dvh` are not reported.

  Verify red, then green, with `npx vitest run src/test/legacyBuild`.
- [ ] 9.2 Add `scripts/check-legacy-build.mjs` and the script `"check:legacy-build": "node scripts/check-legacy-build.mjs"` in `packages/client/package.json`. It reads `dist/assets/*.{js,css}`, `dist/sw.js` and `dist/workbox-*.js`, prints every issue and exits non-zero on any. Add a test in `src/test/legacyBuild/checkLegacyBuild.test.ts` that runs the script with `execFileSync` against a temporary fixture directory (as `src/test/benchmarks/benchBudgets.test.ts` does): a fixture with `inset:0` in CSS exits non-zero and names the file; a fixture with `.min-h-dvh{min-height:100dvh}` exits non-zero and names the file (FR12); a clean fixture (including `min-height:100vh;min-height:100dvh`) exits 0. Verify with `npx vitest run src/test/legacyBuild`, then `pnpm run build`, then `pnpm --filter @time-zones/client check:legacy-build` exits 0 with no issues (M2).

## 10. Behavior features

- [ ] 10.1 Write the `browser-compatibility` scenarios that need no real browser as three vitest-cucumber features under `src/test/features/browser_compatibility/`, one steps file each under `steps/` (one feature per steps file keeps each under 200 lines):
  - `browser_compatibility_legacy_boot.feature` / `browser_compatibility_legacy_boot.steps.tsx`: main page on a legacy engine (FR1), modern engine skips the polyfills and legacy engine installs them first (FR2, through `bootApp` with recorded loaders);
  - `browser_compatibility_legacy_zones.feature` / `browser_compatibility_legacy_zones.steps.ts`: zone checks without BigInt (FR3), the four renamed-zone scenarios including the wall-clock outline with its `UNIQUE`, `GAP` and `AMBIGUOUS` rows (FR4, M3). The steps install the fake native `Intl.DateTimeFormat` and `installLegacyZoneShim()` before a fresh import (design D11) and assert in each scenario that the fake rejected `Europe/Kyiv`, so a bypassed shim fails;
  - `browser_compatibility_missing_apis.feature` / `browser_compatibility_missing_apis.steps.tsx`: the two country-name scenarios (FR5, UX3), view selection without `ResizeObserver` (FR6), the two reduced-motion scenarios (FR7). The search scenarios of the `location-search` delta go into `src/test/features/location_search/location_search_by_country.feature` and its steps. Tags: `@support-legacy-ios-12-safari @FR-X`. Verify with `npx vitest run src/test/features/browser_compatibility`, then `npx vitest run src/test/features/location_search/steps` (M4).
- [ ] 10.2 Write `src/test/features/browser_compatibility/browser_compatibility_legacy_engine_e2e.feature` (playwright-bdd) with steps in `steps/browser_compatibility_legacy_engine_e2e.steps.ts`:
  - "Modern engine requests no polyfills" (`@NFR-P2 @M5`): the request log of a Chromium page load holds no request for the chunk that contains `installLegacySupport`;
  - "No accessibility violations without Pointer Events" (`@NFR-A1`): with `emulateEngineWithoutPointerEvents` from `src/test/e2e/withoutPointerEvents.ts`, axe-core reports no violations on the main page and in the open search dialog;
  - "Modern screenshots unchanged" (`@NFR-R1 @FR12`) is proven by the existing screenshot scenarios, whose baselines under `src/test/features/__screenshots__/` must pass unchanged (task 12.2). A new scenario would need new baselines, so instead add `// Verifies NFR-R1 of support-legacy-ios-12-safari: approved baselines pass unchanged with the legacy CSS fallbacks` above the `toHaveScreenshot` step in `src/test/features/locations/steps/locations_layout_e2e.steps.ts`.

  Verify with `pnpm --filter @time-zones/client test:bdd -- --grep "@support-legacy-ios-12-safari"`.

## 11. Handoff patches (files the implement stage may not edit)

- [ ] 11.1 Handoff H1: write `openspec/changes/support-legacy-ios-12-safari/handoff/H1-ci-legacy-build-step.patch` and its README section. The patch adds the step "Check legacy build" (`pnpm --filter @time-zones/client check:legacy-build`, comment `# implements FR12, FR13 of support-legacy-ios-12-safari`) after "Check initial JS budget" in `.github/workflows/ci.yml`. Verify with `git apply --check openspec/changes/support-legacy-ios-12-safari/handoff/H1-ci-legacy-build-step.patch` and `git diff --exit-code -- .github`.
- [ ] 11.2 Handoff H2: write `handoff/H2-adr-supported-browser-engines.patch` and its README section. The patch adds `docs/adr/0009-supported-browser-engines.md` (status Accepted, format of `.claude/rules/adr.md`, naming `support-legacy-ios-12-safari`) covering the supported engines (latest evergreen and iOS Safari 12.5), the boot-time conditional polyfills, the BigInt ban, and the legacy zone shim as a stopgap under ADR-0003's known limitation. It links the ADR from the ADR list in `CLAUDE.md` and the table in `docs/architecture/overview.md`. Verify with `git apply --check` on the patch, `git diff --exit-code -- docs CLAUDE.md`, and `grep -c "0009" openspec/changes/support-legacy-ios-12-safari/handoff/H2-adr-supported-browser-engines.patch` ≥ 3.
- [ ] 11.3 Handoff H3: write `handoff/H3-glossary-browser-compatibility.patch` and its README section. The patch adds `docs/glossary/browser-compatibility.md` with **Supported engine**, **Legacy engine** (*Never:* old browser, legacy browser), **Legacy support** (*Code:* `src/lib/legacy/`, `src/boot.ts`) and **Legacy zone shim** (*Code:* `src/lib/legacy/zoneShim.ts`; *Not:* the legacy zone name), adds **Update recheck** (*Code:* `useUpdateRecheckOnReturn`, `UPDATE_RECHECK_INTERVAL_MS`) to `docs/glossary/app-shell.md`, extends the *Code:* part of **Legacy zone name** in `docs/glossary/time.md` (line 11, today `virtual:time-zone-aliases`, `canonicalizeTimeZoneId`) with `getLegacyZoneNames` (`src/lib/legacy/zoneShim.ts`, canonical → legacy names), and adds the new file to the context table of `docs/glossary/README.md`. Verify with `git apply --check` on the patch, `git diff --exit-code -- docs`, `grep -c "Legacy engine\|Update recheck" openspec/changes/support-legacy-ios-12-safari/handoff/H3-glossary-browser-compatibility.patch` ≥ 2, and `grep -c "^+.*Legacy zone name.*getLegacyZoneNames" openspec/changes/support-legacy-ios-12-safari/handoff/H3-glossary-browser-compatibility.patch` = 1.
- [ ] 11.4 Handoff H4: write the README section for the device acceptance (M7), with no patch. It lists the steps: deploy, open in Safari on iOS 12.5.7, add to the home screen, open the installed app online once, then U1 (cards shown, Kyiv included), U2 (tap the track), U3 (finger reorder without page scroll), U5 (search and add Kyiv), and after a later deploy U4 (notice on return); the Safari Web Inspector console shows 0 errors; any tuning of `REORDER_TOUCH_ACTIVATION_DELAY_MS` is recorded on the PR. Verify with `grep -c "^## H[1-4]:" openspec/changes/support-legacy-ios-12-safari/handoff/README.md` = 4.

## 12. Integration verification

- [ ] 12.1 Run `pnpm lint`, then `pnpm typecheck`, then `pnpm test`, then `pnpm run build`, then `pnpm --filter @time-zones/client check:bundle-size`, then `pnpm --filter @time-zones/client check:legacy-build`, one at a time: the CI job's commands plus the new check. All must pass (NFR-P1, M2, M5).
- [ ] 12.2 Run the BDD E2E suite once: `pnpm --filter @time-zones/client test:bdd`. All screenshot baselines pass without `--update-snapshots` (NFR-R1), and the axe-core scenarios report no violations (NFR-A1).
- [ ] 12.3 Traceability check (M1). From the repository root, this loop prints nothing:
  `for id in FR1 FR2 FR3 FR4 FR5 FR6 FR7 FR8 FR9 FR10 FR11 FR12 FR13 NFR-P1 NFR-P2 NFR-A1 NFR-A2 NFR-R1 UX1 UX2 UX3; do grep -rlE "support-legacy-ios-12-safari.*[@ ,]$id([^0-9]|$)|[@ ,]$id([^0-9]|$).*support-legacy-ios-12-safari" packages/client/src packages/client/scripts packages/client/vite.config.ts packages/client/index.html >/dev/null || echo "missing $id"; done`.
  It matches the change name and the id on one line, so references left by earlier changes cannot satisfy it.

## Human follow-up

The operator reviews these on the PR that the deliver stage opens, then applies the patches.

- H1 (FR12, FR13, M2): apply `handoff/H1-ci-legacy-build-step.patch` — adds the "Check legacy build" step to `.github/workflows/ci.yml`.
  Why manual: the factory may not edit `.github/`.
  Automated part: `check:legacy-build`, its rule tests in `src/test/legacyBuild/` and the BigInt source scan run in `pnpm test` and in task 12.1.
- H2 (FR1, FR2, FR3, FR4): apply `handoff/H2-adr-supported-browser-engines.patch` — adds ADR-0009 and links it from `CLAUDE.md` and `docs/architecture/overview.md`.
  Why manual: the factory may not write `docs/adr/` or `CLAUDE.md`, and the implement stage writes only under `packages/`.
  Automated part: the behaviour the ADR records is covered by the unit and E2E features of sections 3–10.
- H3 (FR4, FR10): apply `handoff/H3-glossary-browser-compatibility.patch` — adds the `browser-compatibility` glossary context and **Update recheck**, and adds `getLegacyZoneNames` to the owners of **Legacy zone name**.
  Why manual: the implement stage writes only under `packages/`, and the glossary lives in `docs/glossary/`.
  Automated part: none; `git apply --check` in task 11.3 proves the patch applies.
- H4 (FR1, M7): run the device acceptance in the `handoff/README.md` section H4 on the owner's iOS 12.5.7 device.
  Why manual: no automated runner provides iOS Safari 12 (NG9), and the check needs the owner's physical device.
  Automated part: every fallback is tested with the API removed in jsdom, and the touch paths run in Chromium with Pointer Events suppressed (tasks 6.5, 6.6, 10.2).
