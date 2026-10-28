# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`.

- **Running tests:** one command at a time, never in the background. Mutation runs take at most 5 files per run. The report is in `reports/mutation/mutation-report.json`.
- **Time in tests:** only `fakeClock(instant, timeZone)` of `@/lib/temporal` or `createSwitchableClock` (`test/switchableClock.ts`). Never `vi.setSystemTime()` or `vi.useFakeTimers()`. Page visibility comes from `setPageVisibility` / `resetPageVisibility` (`test/pageVisibility.ts`).
- **Missing APIs in tests:** remove the API with `vi.stubGlobal(...)` (or delete the property), and restore it with `vi.unstubAllGlobals()`. Modules that read support at load time are re-imported after `vi.resetModules()` (design D11).
- **Traceability:** every new test, step file and feature carries `support-legacy-ios-12-safari`:
  - `@support-legacy-ios-12-safari @FR-X` tags above scenarios;
  - `// @support-legacy-ios-12-safari @FR-X` before `f.Scenario`;
  - `Implements FR-X of support-legacy-ios-12-safari` in the JSDoc of new or changed production code.
- **File size:** every file stays under 200 lines.
- **Design references:** "design Dn" refers to `design.md`.

## 1. Spike: zone shim against temporal-polyfill (blocks section 5)

- [ ] 1.1 Throwaway test `lib/legacy/zoneShim.spike.test.ts` (design D4, proposal Q2). Install a fake `Intl.DateTimeFormat` that throws `RangeError` for `Europe/Kyiv` and delegates otherwise. Wrap it with a minimal retry on `Europe/Kiev`. Then `vi.resetModules()` and import `temporal-polyfill` fresh. Check three things:
  - `Temporal.Instant.from("2026-03-08T07:30:00Z").toZonedDateTimeISO("Europe/Kyiv")` gives `09:30` and offset `+02:00`;
  - what `.timeZoneId` returns;
  - that no other `Intl` / `Date` path throws.

  Record the result in a short note at the end of `design.md` "Risks". If the shim does not work, switch D4 to the explicit resolver before section 5. Delete the spike file. Verify with `npx vitest run src/lib/legacy/zoneShim.spike.test.ts`.

## 2. Dependencies and constants (no TDD: setup and constants)

- [ ] 2.1 Add the dependencies of design D3 and D9 to `packages/client/package.json`:
  - runtime `core-js` and `@juggle/resize-observer`;
  - dev `core-js-compat` (same minor as `core-js`) and `acorn`.

  Verify with `pnpm install` and `pnpm --filter @time-zones/client typecheck`.
- [ ] 2.2 Add the constants and re-export them from `constants/index.ts`:
  - `UPDATE_RECHECK_INTERVAL_MS = 15 * 60 * 1000` (design D10, FR10);
  - `REORDER_TOUCH_ACTIVATION_DELAY_MS = 250` and `REORDER_TOUCH_ACTIVATION_TOLERANCE_PX = 5` (design D8, FR9);
  - `LEGACY_ZONE_PROBE_ID = "Europe/Kyiv"` (design D2);
  - `NANOSECONDS_PER_MILLISECOND` (design D5), unless an equivalent constant exists.

  Verify with `pnpm --filter @time-zones/client typecheck`.

## 3. Model: no BigInt (TDD)

- [ ] 3.1 Add the source-scan test `test/noBigIntInSources.test.ts` (design D5, FR3, FR13). It reads `src/**/*.{ts,tsx}`, excluding `*.test.*`, `*.steps.*`, `*.bench.*` and `src/test/`. It asserts that no file matches a BigInt literal, `BigInt(` or `epochNanoseconds`. Verify red with `npx vitest run src/test/noBigIntInSources.test.ts`: it lists `timeZoneId.ts`, `dayPeriodStops.ts` and `dayPeriodWindows.ts`.
- [ ] 3.2 TDD in `model/timeZoneId.ts`: build the probe from `Temporal.Instant.fromEpochMilliseconds(0)`. In `model/timeZoneId.test.ts`, add a case with `vi.stubGlobal("BigInt", undefined)`: `canonicalizeTimeZoneId("Asia/Almaty")` → `"Asia/Almaty"` and `canonicalizeTimeZoneId("Europe/Kiev")` → `"Europe/Kyiv"`. Verify red, then green, with `npx vitest run src/model/timeZoneId.test.ts`.
- [ ] 3.3 TDD in `model/dayPeriodStops.ts` and `model/dayPeriodWindows.ts`: millisecond arithmetic (design D5). Keep the existing M5 stop tests of `add-time-sliders-to-location-cards` green. Add a case that computes the Almaty and New York stops for the `2026-03-08` reference day with `BigInt` stubbed out and expects the same arrays. Verify with `npx vitest run src/model/dayPeriodStops.test.ts`, then `npx vitest run src/model/dayPeriodWindows.test.ts`, then `npx vitest run src/test/noBigIntInSources.test.ts` (now green).
- [ ] 3.4 Mutation run. Verify that `npx stryker run --mutate 'src/model/timeZoneId.ts,src/model/dayPeriodStops.ts,src/model/dayPeriodWindows.ts'` scores ≥ 95% (minimum 90%).

## 4. API guards (TDD)

- [ ] 4.1 TDD `presenter/countryName.ts`: return `""` when `Intl.DisplayNames` is not a function (design D6, FR5). Tests in `presenter/countryName.test.ts`, with the global removed and the module re-imported: `presentCountryName("KZ", "en")` → `""` with no throw. With the global present, `"Kazakhstan"` stays. Verify red, then green, with `npx vitest run src/presenter/countryName.test.ts`.
- [ ] 4.2 TDD `adapters/city-search/zoneCitiesSource.ts`: `readCountryTexts` → `[]` without `Intl.DisplayNames` (FR5). In its tests, with the global removed:
  - "Kazakhstan" matches no record by country;
  - "Almaty" still matches.

  Also check UX3: in `views/shared/LocationRow.test.tsx` and the search results test, a row and a result with `countryName: ""` render no separator text. Verify with `npx vitest run src/adapters/city-search/zoneCitiesSource.test.ts`, then each view test file.
- [ ] 4.3 TDD `controller/usePrefersReducedMotion.ts`: `addListener` / `removeListener` fallback (design D6, FR7). Tests in `controller/usePrefersReducedMotion.test.tsx` with a `MediaQueryList` stub that has only `addListener`:
  - the preference turns on → the hook returns `true`;
  - unmount → `removeListener` is called with the same listener;
  - the modern path still uses `addEventListener`.

  Verify red, then green, with `npx vitest run src/controller/usePrefersReducedMotion.test.tsx`.
- [ ] 4.4 Mutation run. Verify that `npx stryker run --mutate 'src/presenter/countryName.ts,src/adapters/city-search/zoneCitiesSource.ts,src/controller/usePrefersReducedMotion.ts'` scores ≥ 95% (minimum 90%).

## 5. Legacy support and boot (TDD)

- [ ] 5.1 TDD new `lib/legacy/zoneShim.ts` (design D4, FR4): `createLegacyZoneDateTimeFormat(nativeDateTimeFormat, legacyNamesByCanonicalId)` and `installLegacyZoneShim()`. Use the inverse of `virtual:time-zone-aliases`, built by `getLegacyZoneNames`. Tests in `lib/legacy/zoneShim.test.ts` with a fake native that rejects `Europe/Kyiv`:
  - retries `Europe/Kiev` and formats `09:30` at `2026-03-08T07:30:00Z`;
  - rethrows the original `RangeError` when no legacy name is accepted (`America/Ciudad_Juarez`);
  - passes calls without `timeZone` through unchanged;
  - keeps `supportedLocalesOf` and `instanceof`.

  Verify red, then green, with `npx vitest run src/lib/legacy/zoneShim.test.ts`.
- [ ] 5.2 TDD new `lib/legacy/needsLegacySupport.ts` (design D2, FR2): true when `Array.prototype.at` is missing, when `ResizeObserver` is missing, or when the `LEGACY_ZONE_PROBE_ID` probe throws. False otherwise. Use `it.each` over the 4 cases. Verify with `npx vitest run src/lib/legacy/needsLegacySupport.test.ts`.
- [ ] 5.3 Add `scripts/legacyCoreJs/legacyCoreJsPlugin.ts` (design D3). It is a Vite plugin serving `virtual:legacy-core-js`: the `import "core-js/modules/<name>.js"` lines for the modules that `core-js-compat` reports for `{ targets: "ios_saf 12.2", modules: "core-js/stable" }`. Split the pure list builder into its own file and unit-test it: the list contains `es.array.at` and `es.object.from-entries`, and does not contain `es.promise` (present in iOS 12). Verify with `npx vitest run scripts/legacyCoreJs`.
- [ ] 5.4 Add `lib/legacy/installLegacySupport.ts`. It imports `virtual:legacy-core-js`, installs `@juggle/resize-observer` on `globalThis` when it is absent, and calls `installLegacyZoneShim()` when the probe fails (design D3, FR2, FR4, FR6). Add `lib/legacy/index.ts` exporting `needsLegacySupport`, `IS_POINTER_EVENTS_SUPPORTED` (design D8) and the shim types. Test in `lib/legacy/installLegacySupport.test.ts` with `ResizeObserver` removed: after the import, `globalThis.ResizeObserver` is a function. Verify with `npx vitest run src/lib/legacy/installLegacySupport.test.ts`.
- [ ] 5.5 TDD new `boot.ts` (design D2). It exports `bootApp({ needsLegacySupport, loadLegacySupport, loadApp })` and runs it with the real imports. Tests in `boot.test.ts`:
  - with `needsLegacySupport` false, `loadLegacySupport` is never called and `loadApp` is called once;
  - with true, `loadLegacySupport` resolves before `loadApp` starts (order recorded by a log array);
  - a rejected `loadLegacySupport` still calls `loadApp`, so the app shows its recovery screen instead of a blank page.

  Point `index.html` at `/src/boot.ts`. Verify red, then green, with `npx vitest run src/boot.test.ts`.
- [ ] 5.6 Add the `modulepreload` plugin for the `main` chunk (design D2, NFR-P2) and register both plugins in `vite.config.ts`. Set `build.target` and `build.cssTarget` (design D1, D7). Verify with `pnpm run build`:
  - `dist/index.html` has a `modulepreload` for the main chunk and none for the legacy chunk;
  - `pnpm --filter @time-zones/client check:bundle-size` reports initial JS ≤ 150 KB (NFR-P1, M5).
- [ ] 5.7 Mutation run. Verify that `npx stryker run --mutate 'src/lib/legacy/zoneShim.ts,src/lib/legacy/needsLegacySupport.ts,src/boot.ts'` scores ≥ 95% (minimum 90%).

## 6. Input fallbacks (TDD)

- [ ] 6.1 TDD `views/shared/DayTrack.tsx`: `onClick` → `selectAt` only when `IS_POINTER_EVENTS_SUPPORTED` is false (design D8, FR8, NFR-A2, UX1). Tests in new `views/shared/DayTrack.legacy.test.tsx`, using `dayTrackFixture.tsx` and a re-imported module with `PointerEvent` removed:
  - a click at `clientX` = three quarters of the track calls `onSelectFraction(0.75)`;
  - role, name, value and keys are unchanged.

  With `PointerEvent` present, a click without a press calls nothing. Verify red, then green, with `npx vitest run src/views/shared/DayTrack.legacy.test.tsx`, then `npx vitest run src/views/shared/DayTrack.test.tsx`.
- [ ] 6.2 Add the scenarios "A tap selects a time without Pointer Events" and "A click adds nothing where Pointer Events exist" to `test/features/time_selection/time_selection_select_time.feature`, with step definitions, tagged `@support-legacy-ios-12-safari @FR8`. Verify with `npx vitest run src/test/features/time_selection`.
- [ ] 6.3 TDD `views/shared/LocationList.tsx`: the sensor class from `IS_POINTER_EVENTS_SUPPORTED`, with `TouchSensor` options `{ delay: REORDER_TOUCH_ACTIVATION_DELAY_MS, tolerance: REORDER_TOUCH_ACTIVATION_TOLERANCE_PX }` (design D8, FR9, UX2). In `views/shared/LocationList.test.tsx`, spy on dnd-kit `useSensor` through `vi.mock` and check:
  - without `PointerEvent`: `TouchSensor` with those options plus `KeyboardSensor`;
  - with it: `PointerSensor` with the distance constraint plus `KeyboardSensor`.

  Verify red, then green, with `npx vitest run src/views/shared/LocationList.test.tsx`.
- [ ] 6.4 Add the scenarios "Drag by finger without Pointer Events" and "Sensors depend on Pointer Events" to `test/features/locations/locations_reorder_unit.feature`, with step definitions, tagged `@support-legacy-ios-12-safari @FR9`. The drag scenario fires `touchstart`, waits out the delay through the dnd-kit test pattern already in use, then fires `touchmove` / `touchend`, and checks the order. Verify with `npx vitest run src/test/features/locations/locations_reorder_unit.feature`.
- [ ] 6.5 Mutation run. Verify that `npx stryker run --mutate 'src/views/shared/DayTrack.tsx,src/views/shared/LocationList.tsx'` scores ≥ 95% (minimum 90%).

## 7. Update check on return (TDD)

- [ ] 7.1 TDD new `controller/useUpdateRecheckOnReturn.ts` (design D10, FR10). Tests in `controller/useUpdateRecheckOnReturn.test.tsx` with a fake registration (`update: vi.fn()`), `createSwitchableClock` and `setPageVisibility`:
  - visible after 16 min → `update` called once;
  - visible after 5 min → not called;
  - hidden after 16 min → not called;
  - two visible events 16 min apart → called twice;
  - `update` rejecting → `onCheckFailed` called;
  - unmount removes the listener.

  Verify red, then green, with `npx vitest run src/controller/useUpdateRecheckOnReturn.test.tsx`.
- [ ] 7.2 Wire the hook into `controller/usePwaUpdateStatus.ts`: keep the registration from `onRegisteredSW` in state, and pass the app's clock and `setIsUpdateCheckFailed(true)`. Keep `controller/usePwaUpdateStatus.test.tsx` green, and add a case: after `onRegisteredSW` and a visible event 16 min later, a second `update` call happens. Verify with `npx vitest run src/controller/usePwaUpdateStatus.test.tsx`.
- [ ] 7.3 Add the scenarios "Returning to the app checks again", "Returning soon after a check does not check", "Hiding the page does not check" and "A check on return fails offline" to `test/features/app_shell/app_shell_notices.feature`, with step definitions, tagged `@support-legacy-ios-12-safari @FR10`. Verify with `npx vitest run src/test/features/app_shell/app_shell_notices.feature`.
- [ ] 7.4 Mutation run. Verify that `npx stryker run --mutate 'src/controller/useUpdateRecheckOnReturn.ts,src/controller/usePwaUpdateStatus.ts'` scores ≥ 95% (minimum 90%).

## 8. CSS and page head

- [ ] 8.1 Extend `theme.minHeight.dvh` in `tailwind.config.ts` to `["100vh", "100dvh"]` (design D7, FR12). Add `<meta name="apple-mobile-web-app-capable" content="yes">` to `index.html` (FR11). Verify with `pnpm run build`: the `min-h-dvh` rule in `dist/assets/index-*.css` declares `100vh` before `100dvh`, and `dist/index.html` contains the meta tag.
- [ ] 8.2 Extend the existing app-delivery manifest/head E2E step (`app_shell_smoke_e2e.feature`) with the scenario "Page declares an iOS home-screen web app", tagged `@support-legacy-ios-12-safari @FR11`. Verify with `pnpm --filter @time-zones/client test:bdd -- --grep "iOS home-screen"`.

## 9. Legacy build checks in CI

- [ ] 9.1 TDD the pure module `scripts/legacyBuild/findLegacySyntaxIssues.ts` (design D9, FR13). Input: file name and source. Output: a list of `{ file, construct }`. It parses with `acorn` (`ecmaVersion: 2020`, module), walks the AST and reports parse errors, `ChainExpression`, `??`, BigInt literals and regex lookbehind. `findInsetShorthand(css)` reports `inset:` declarations. Tests in `scripts/legacyBuild/findLegacySyntaxIssues.test.ts` with `it.each`:
  - one snippet per construct is reported;
  - `import()`, `import.meta` and `catch {}` are allowed;
  - `top:0;inset-inline:0` is not reported as `inset:`.

  Verify red, then green, with `npx vitest run scripts/legacyBuild`.
- [ ] 9.2 Add `scripts/check-legacy-build.mjs` and the script `check:legacy-build` in `package.json`. It reads `dist/assets/*.{js,css}`, `dist/sw.js` and `dist/workbox-*.js`, prints every issue and exits non-zero on any. Add the step "Check legacy build" after "Check initial JS budget" in `.github/workflows/ci.yml`. Verify that `pnpm run build` then `pnpm --filter @time-zones/client check:legacy-build` exits 0 with no issues (M2). Verify that it exits non-zero when one source temporarily uses `inset` in raw CSS. Revert that edit.

## 10. Behavior feature and docs

- [ ] 10.1 Write `test/features/browser_compatibility/browser_compatibility_legacy_engine.feature` (vitest-cucumber) with step definitions under `steps/`. It covers the `browser-compatibility` scenarios that are not build checks: main page on a legacy engine, modern engine skips polyfills, legacy engine installs polyfills first, zone checks without BigInt, the three renamed-zone scenarios (M3), the two country-name scenarios, view selection without `ResizeObserver`, and the two reduced-motion scenarios. Tags: `@support-legacy-ios-12-safari @FR-X`. Verify with `npx vitest run src/test/features/browser_compatibility` (M4).
- [ ] 10.2 Write `docs/adr/0009-supported-browser-engines.md` (status Accepted). It covers:
  - the supported engines (latest evergreen and iOS Safari 12.5);
  - the boot-time conditional polyfill strategy;
  - the BigInt ban;
  - the legacy zone shim as a stopgap until the app's own zone database.

  Link it from `CLAUDE.md` "ADRs" and `docs/architecture/overview.md`. Verify that `grep -n "0009" CLAUDE.md docs/architecture/overview.md` finds both links.

- [ ] 10.3 Add the new terms of this change to `docs/glossary/` (`.claude/rules/glossary.md`):
  - new context file `browser-compatibility.md`: **Supported engine**, **Legacy engine** (*Never:* old browser, legacy browser), **Legacy support** (the boot-time polyfills and shims, *Code:* `src/lib/legacy/`, `boot.ts`), **Legacy zone shim** (*Code:* `zoneShim.ts`; *Not:* the legacy zone name);
  - `time-selection.md`: add "tap" to **Time selection** for engines without Pointer Events;
  - `app-shell.md`: **Update recheck** (*Code:* `useUpdateRecheckOnReturn`, `UPDATE_RECHECK_INTERVAL_MS`).

  Add the new file to the context table in `docs/glossary/README.md`. Verify with `grep -rn "Legacy engine\|Update recheck" docs/glossary`.

## 11. Integration verification

- [ ] 11.1 Run `pnpm lint`, then `pnpm typecheck`, then `pnpm run build`, then `pnpm --filter @time-zones/client check:bundle-size`, then `pnpm --filter @time-zones/client check:legacy-build`, one at a time. All must pass (NFR-P1, M2, M5).
- [ ] 11.2 Run the smoke E2E and the screenshot suite once: `pnpm --filter @time-zones/client test:bdd`. All baselines pass without `--update-snapshots` (NFR-R1), and axe-core reports no new violations (NFR-A1). Also check that the network log of the smoke run in Chromium shows no request for the legacy chunk (M5).
- [ ] 11.3 Traceability check (M1): `grep -rn "support-legacy-ios-12-safari" packages/client/src packages/client/scripts` finds at least one reference for each of FR1–FR13, NFR-P1, NFR-P2, NFR-A1, NFR-A2, NFR-R1 and UX1–UX3. FR1 on a device is left to 11.4.
- [ ] 11.4 Manual acceptance on the owner's iOS 12.5.7 device (M7, NG9: the only check that cannot be automated). Deploy, open in Safari, add to the home screen, open the installed app online once, then:
  - U1 (cards shown, Kyiv included);
  - U2 (tap the track);
  - U3 (finger reorder without page scroll);
  - U5 (search and add Kyiv);
  - after a later deploy, U4 (notice on return).

  The Safari Web Inspector console must show 0 errors. Record the result, and any tuning of `REORDER_TOUCH_ACTIVATION_DELAY_MS`, in the PR.

## Workflow follow-up

- Ask the user for a full mutation run (`pnpm test:mutation`) before archive, as the project rules require.
- Archive with `/opsx:archive` once 11.4 has passed.
- Future changes noted in proposal Non-Goals: theme choice in settings (NG1), the app's own time zone database (NG2, retires design D4), and possibly smooth track drag, CLDR country names, flex `gap` and `:focus-visible` fallbacks (NG4–NG7).
