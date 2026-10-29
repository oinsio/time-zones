# Design: Support legacy iOS 12 Safari

## Context

Driven by FR1–FR13, NFR-P1, NFR-P2, NFR-A2 and UX1–UX3 of `proposal.md` (see proposal.md — Why). Current state, checked in `packages/client/` on `main`:

- `vite.config.ts` sets `build: { outDir }` only, with no `build.target`, so Vite 6 (6.4.3 in the lockfile) builds for its default `es2020, edge88, firefox78, chrome87, safari14`. Its plugins are `react()`, `zoneDataPlugin()` and `VitePWA` (`registerType: "prompt"`, Workbox `globPatterns` `**/*.{js,mjs,css,html,ico,png,svg,json,woff2}`). `vitest.config.ts` registers `react()` and `zoneDataPlugin()` and includes only `src/**/*.{test,steps}.{ts,tsx}`, so tests of `scripts/` code live under `src/test/` (as `src/test/benchmarks/benchBudgets.test.ts` tests `scripts/benchBudgets.ts`).
- `scripts/check-bundle-size.mjs` counts as initial JS the `<script type="module">` of `dist/index.html` plus its `modulepreload` links, against `INITIAL_JS_BUDGET_KB = 150`. `index.html` loads `/src/main.tsx`, which imports fonts, CSS and i18n and mounts `AppShell` inside `AppErrorBoundary`.
- BigInt in production code: `src/model/timeZoneId.ts:5` (`const EPOCH_NANOSECONDS = 0n`, passed to `new Temporal.ZonedDateTime`), `src/model/dayPeriodStops.ts:27` (`epochNanoseconds` difference divided by `NANOSECONDS_PER_MINUTE`), `src/model/dayPeriodWindows.ts:103-104` (`epochNanoseconds - BigInt(localStart.offsetNanoseconds)`). esbuild refuses a BigInt literal for a `safari12` target, so the build would fail. The two run-time uses would throw on iOS 12.
- `temporal-polyfill` is 0.3.2 in the lockfile, imported only through `src/lib/temporal.ts`. It is expected to need BigInt only for BigInt-returning members (`epochNanoseconds`, `fromEpochNanoseconds`) and to resolve zones through `Intl.DateTimeFormat` (ADR-0003: "`temporal-polyfill` uses `Intl`"). Its package is not installed in the planning worktree, so these are not taken on trust: the spike (task 1.1) loads it with `BigInt` removed, searches its files for BigInt literals, and proves whether every zone path goes through a constructor captured at load, before section 5.
- Zones: `canonicalizeTimeZoneId` (`src/model/timeZoneId.ts`) builds a `Temporal.ZonedDateTime` and maps its `timeZoneId` through `virtual:time-zone-aliases`. That map is legacy → canonical (`Europe/Kiev` → `Europe/Kyiv`), built from CLDR `bcp47` by `scripts/zoneData/extractZoneData.ts`. `parseStoredLocations` rejects the whole stored list when one zone fails to canonicalize. `ADD_LOCATION` fails with `UNKNOWN_TIME_ZONE`. `SET_DEVICE_TIME_ZONE` canonicalizes the device zone too (`src/model/locations.ts:145`). `resolveWallClock` (`src/model/wallClock.ts`) calls `PlainDateTime#toZonedDateTime` with `compatible`, `earlier` and `later`; `dayPeriodWindows.ts` calls it with `earlier`.
- Unguarded APIs: `new Intl.DisplayNames` in `src/presenter/countryName.ts:9` and `src/adapters/city-search/zoneCitiesSource.ts:91` (`readCountryTexts`). `new ResizeObserver` in `src/controller/useContainerWidth.ts:18`, used by `app/ViewHost.tsx`. `queryList.addEventListener` in `src/controller/usePrefersReducedMotion.ts:13`. `Intl.supportedValuesOf` is already guarded (`listBrowserTimeZones` in `zoneCitiesSource.ts:30-33` falls back to `undefined`). The views already hide an empty country name: `LocationRow.tsx:117` and `LocationSearchResults.tsx:51` render it only when it is not `""`.
- Input: `src/views/shared/DayTrack.tsx` listens only to `onPointerDown/Move/Up/Cancel` with `setPointerCapture`. A mouse or pen selects on press; a touch pointer waits for `getTouchGestureDecision` (`dayTrackTouch.ts`) to tell a horizontal drag from a vertical swipe, and selects on lift after a tap. `selectAt` takes a `PointerEvent` and reads `clientX` and the track's `getBoundingClientRect`. jsdom 25 has no `PointerEvent`; `dayTrackFixture.tsx` says so and stubs one. `src/views/shared/LocationList.tsx:58-67` uses `PointerSensor` (activation `distance: REORDER_POINTER_ACTIVATION_DISTANCE_PX`, 4 px) and `KeyboardSensor`.
- Updates: `src/controller/usePwaUpdateStatus.ts` takes no arguments and calls `registration?.update()` once, in `onRegisteredSW`; a rejection sets `isUpdateCheckFailed`. `AppShell.tsx` calls `usePwaUpdateStatus()`. `src/controller/useMinuteTick.ts` shows the pattern for an injected `Clock` and `visibilitychange`. Tests have `fakeClock` (`@/lib/temporal`), `createSwitchableClock` (`src/test/switchableClock.ts`), `setPageVisibility` / `resetPageVisibility` (`src/test/pageVisibility.ts`) and `fakeServiceWorker` (`src/test/fakeServiceWorker.ts`).
- CSS: Tailwind 3.4 emits `inset: 0px` for `inset-0` and `inset: auto` for `sm:inset-auto` (`src/components/ui/dialog.tsx:23,26,27`). `inset-x-0` (`DayTrack.tsx:142`, `MainPage.tsx:35`) emits `left` and `right` and needs nothing. `min-h-dvh` (`MainPage.tsx:23`, `RecoveryScreen.tsx:16`) emits `min-height: 100dvh`. `tailwind.config.ts` has no `minHeight` entry.
- CI (`.github/workflows/ci.yml`): `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, "Check initial JS budget", "Check that the build left sources untouched", smoke E2E (`test:bdd`, whose `webServer` runs `pnpm build && pnpm preview`), and a non-blocking `benchmark` job. `deploy.yml` reuses `ci.yml` (`uses: ./.github/workflows/ci.yml`) and publishes its `dist`, so a failing CI build also stops the deploy.
- TypeScript: `tsconfig.app.json` has `target` ES2020 and `lib` `ES2020, ES2022.Intl, DOM, DOM.Iterable`, so `Array.prototype.at` is not declared. Virtual modules are declared in `src/vite-env.d.ts`.

Binding decisions followed: ADR-0002 (layers; the model stays pure, the controller owns side effects), ADR-0003 (Temporal for all time math; canonical ids; "we do not ship our own tzdata"), ADR-0004 (storage schema unchanged; validation of canonical ids on load), ADR-0001 (real-browser checks in playwright-bdd), ADR-0008 (no wall-clock assertions in unit tests). Which engines are supported, and that legacy engines get polyfills at boot, is a global decision: it goes to ADR-0009 (handoff H1), not into this design.

## Goals / Non-Goals

**Goals:** keep every legacy accommodation in one place (`src/boot.ts` and `src/lib/legacy/`), except the small input and API guards that must live where the API is used. Modern browsers pay at most one tiny boot module. Every accommodation is detectable and testable by removing the API, in jsdom or in Chromium.

**Non-Goals:** a `nomodule` legacy bundle (NG8). Babel. Any change to domain types or the stored schema.

## Decisions

### D1. Build: lower syntax with esbuild targets, not `@vitejs/plugin-legacy` (FR1, NFR-P1)

`build.target` becomes the current Vite default list with `safari12` and `ios12` in place of `safari14`, kept in one constant of `app.config.ts`. `build.cssTarget` uses the same list (D7). esbuild lowers `??`, `?.`, class fields and the other post-2018 syntax. It stops the build on what it cannot lower, such as a BigInt literal.

**Alternatives:** `@vitejs/plugin-legacy` with `modernPolyfills: true`. Its modern-polyfill chunk is a static `<script type="module">` in `index.html`, so every browser downloads it, and it counts as initial JS. That would break NFR-P1 and G3, and it adds Babel to the build. Rejected. `renderLegacyChunks: true` (the SystemJS bundle) targets engines without modules. iOS 12 has them, so it would only add build time. Rejected.

### D2. Boot module loads legacy support, then the app (FR2, NFR-P2)

`index.html` points at a new `src/boot.ts`. It statically imports only `@/lib/legacy` (light: no Temporal, no React; `@/constants` has no runtime imports besides its own files) and calls `bootApp`, which does three things in order:

1. It runs `needsLegacySupport()`. The check is true when any of these holds: `"at" in Array.prototype` is false (marks Safari < 15.4 and covers the core-js gap; the `in` form compiles under the ES2020 `lib`), `ResizeObserver` is missing, or `new Intl.DateTimeFormat("en", { timeZone: LEGACY_ZONE_PROBE_ID })` throws.
2. When the check is true, it awaits `import("@/lib/legacy/polyfills")`.
3. It awaits `import("./main")`, which stays the current module and mounts the app.

A rejected polyfill import is logged and the app still loads, so the error boundary can show the recovery screen instead of a blank page. `@/lib/legacy` must not import `@/lib/temporal`, because the shim must be in place before `temporal-polyfill` is evaluated.

`bootApp({ needsLegacySupport, loadLegacySupport, loadApp })` lives in `src/lib/legacy/bootApp.ts` and takes its steps as arguments, so it is unit-tested without loading the app. `src/boot.ts` only calls it with the real steps. Importing `boot.ts` would mount the app, so, like `src/main.tsx`, it has no unit test and is excluded in `stryker.config.mjs`. The E2E scenarios of task 10.2 cover its wiring.

To avoid a request waterfall on modern browsers, a small Vite plugin (`transformIndexHtml`, `enforce: "post"`, in `scripts/legacyBuild/mainPreloadPlugin.ts`) adds `<link rel="modulepreload">` for the `main` chunk and its static imports. `check-bundle-size.mjs` already counts those links, so the budget measures exactly what a modern browser fetches at start. The polyfill chunk gets no preload link and stays outside the budget. `build.rollupOptions.output.manualChunks` puts `src/lib/legacy/polyfills/`, `core-js` and `@juggle/resize-observer` into one chunk named by `LEGACY_POLYFILLS_CHUNK_NAME` (`app.config.ts`), so the build check and the E2E request check find it by name.

**Alternatives:** a classic inline script that writes a synchronous polyfill `<script>` with `document.write`. That needs a second IIFE build and an API the platform discourages. Rejected. Static import of polyfills in `main.tsx`: they would be in the initial JS for everyone. Rejected. Top-level `await` in a polyfill module: unsupported before Safari 15. Rejected.

### D3. Polyfill set: everything core-js reports as missing in iOS 12.5 (FR2, FR6)

`src/lib/legacy/polyfills/index.ts` exports `installLegacySupport()`. Importing the module installs, in this order:

1. The core-js `stable` modules that `core-js-compat` reports as needed for `ios_saf 12.2`. A build-time virtual module (`virtual:legacy-core-js`, plugin in `scripts/legacyCoreJs/`) lists them, and `core-js-compat` is pinned to the same minor as `core-js`. Both `vite.config.ts` and `vitest.config.ts` register the plugin. `src/vite-env.d.ts` declares the module (`declare module "virtual:legacy-core-js" {}`), which the side-effect import needs under `noUncheckedSideEffectImports` (`tsconfig.app.json`).
2. `@juggle/resize-observer`, assigned to `globalThis.ResizeObserver` only when it is absent.
3. The zone shim of D4, when the probe of D2 fails.

This is a target-based set, not a usage-based one. It also covers built-ins used by dependencies (React, Radix, i18next, dnd-kit), which a scan of our own sources would miss. Its size, estimated at 30–40 KB gzipped, is paid only by legacy engines. The service worker precaches the chunk for everyone (`globPatterns` include `js`), so it also works offline on iOS 12.

The `Array#reverse` bug of Safari 12.0 is fixed in 12.1+, so the target 12.5 needs no fix for it (NG8).

**Alternatives:** usage-based detection with Babel `preset-env` (`useBuiltIns: "usage"`). It needs a Babel pass over `node_modules`. Rejected. A hand-written list: it silently misses what dependencies use. Rejected. All of `core-js/stable`: larger, with no benefit over the target-based list. Rejected.

### D4. Legacy zone names through an `Intl.DateTimeFormat` shim (FR4)

On engines whose zone data predates a rename, the legacy zone shim (`src/lib/legacy/zoneShim.ts`) wraps `Intl.DateTimeFormat`. When the native constructor throws `RangeError` for a `timeZone` option, the wrapper retries with each legacy zone name of that zone. The names come from the inverse of `virtual:time-zone-aliases` (canonical → legacy names). The shim keeps `prototype`, `supportedLocalesOf` and `instanceof`. It is installed before `temporal-polyfill` is evaluated, which D2 guarantees.

Effects on the existing code:

- `canonicalizeTimeZoneId("Europe/Kyiv")` succeeds. If Temporal reports the resolved name `Europe/Kiev`, the existing alias map turns it back into `Europe/Kyiv`.
- Stored and compared ids stay canonical (ADR-0004 unchanged).
- `SET_DEVICE_TIME_ZONE` already canonicalizes `clock.timeZoneId()`, so the Here mark still matches.
- Every Temporal call site, including `resolveWallClock`, works unchanged.

**Spike (task 1.1, proposal Q2).** It runs the shim against `temporal-polyfill` 0.3.2 in jsdom with a fake native constructor that rejects `Europe/Kyiv`. It checks `Instant#toZonedDateTimeISO`, the resulting `timeZoneId`, and `PlainDateTime#toZonedDateTime` with `compatible`, `earlier` and `later` through `resolveWallClock`: `2026-03-08T09:30` gives `2026-03-08T07:30:00Z` `UNIQUE`, and `2026-03-29T03:30` (DST start in Kyiv) gives `2026-03-29T01:30:00Z` `GAP`, as for `Europe/Kiev`. The later change `add-wall-time-input-with-hint` relies on that last result.

**Alternatives:** an explicit `toEngineTimeZoneId(id)` at every call site that hands a zone to Temporal or `Intl`. That touches every zone call site across `model/`, `presenter/` and `controller/`, and it is easy to miss in new code. Kept as the fallback if the spike shows that the polyfill bypasses the captured constructor; it would then live in `src/model/timeZoneId.ts`, the owner of the time zone ID. Storing the legacy name on legacy devices: breaks "IANA canonical ids are the source of truth". Rejected.

### D5. Milliseconds instead of BigInt (FR3)

- `timeZoneId.ts`: build the probe with `Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO(input)`.
- `dayPeriodStops.ts`: `(instant.epochMilliseconds - day.start.epochMilliseconds) / (day.lengthMinutes * MILLISECONDS_PER_MINUTE)`, with the existing `MILLISECONDS_PER_MINUTE` of `constants/clock.ts`. Every instant on a track is minute-aligned, so millisecond precision is exact.
- `dayPeriodWindows.ts`: `Temporal.Instant.fromEpochMilliseconds(wanted.toZonedDateTime(UTC_ZONE_ID).epochMilliseconds - localStart.offsetNanoseconds / NANOSECONDS_PER_MILLISECOND)`, with a new `NANOSECONDS_PER_MILLISECOND` next to `NANOSECONDS_PER_MINUTE` in `constants/utcOffset.ts`. Zone offsets are whole seconds.

A unit test (`src/test/noBigIntInSources.test.ts`) scans `src/**/*.{ts,tsx}`, excluding `*.test.*`, `*.steps.*`, `*.bench.*` and `src/test/`, for `/\b\d[\d_]*n\b/`, `BigInt(` and `epochNanoseconds`. It reads files with `node:fs`, as `src/styles/tokens.test.ts` and `src/test/benchmarks/ciBenchmarkJob.test.ts` read files. Together with esbuild refusing literals (D1), this keeps BigInt out, and the existing CI `pnpm test` step runs it.

### D6. API guards where the API is used (FR5, FR6, FR7)

- `@/lib/legacy` exports `isDisplayNamesSupported()` (`typeof Intl.DisplayNames === "function"`, read at call time). `presentCountryName` returns `""` and `readCountryTexts` returns `[]` when it is false, so country search matches nothing (`location-search` delta). One owner answers the question for both layers. The views already render nothing for an empty country name (Context), so UX3 needs no view change; tests prove it.
- `usePrefersReducedMotion.subscribe` uses `addEventListener` when present, otherwise `addListener` / `removeListener`.
- `ResizeObserver` is provided by D3. No guard in `useContainerWidth`.

A guard in place is chosen over a polyfill for `Intl.DisplayNames`. `@formatjs/intl-displaynames` needs `Intl.Locale` and `getCanonicalLocales` polyfills plus locale data for `en` and `ru`, about 20 KB more, for country names the owner accepted losing (NG5).

### D7. CSS fallbacks through esbuild's CSS target and a Tailwind fallback value (FR12)

- `build.cssTarget` with `safari12`: esbuild expands `inset` into `top/right/bottom/left` for that target. The legacy build check (D9) proves it on every build.
- `min-h-dvh`: add `theme.extend.minHeight.dvh = ["100vh", "100dvh"]` in `tailwind.config.ts`. Tailwind emits both declarations in that order, so an engine without `dvh` keeps `100vh`.

**Alternatives:** `postcss-preset-env`: a new PostCSS dependency for one property. Rejected. `css.transformer: "lightningcss"`: replaces the PostCSS pipeline Tailwind 3 needs. Rejected. Rewriting `inset-*` classes by hand: easy to regress in new components. Rejected.

### D8. Input fallbacks chosen once from Pointer Events support (FR8, FR9, UX1, UX2)

`@/lib/legacy` exports `IS_POINTER_EVENTS_SUPPORTED`, read once at module load (`typeof globalThis.PointerEvent === "function"`). jsdom 25 has no `PointerEvent`; today only `useFakePointerEvents` (`src/views/shared/dayTrackFixture.tsx`) stubs it, in `beforeAll`, after the modules are loaded. So `src/test/setup.ts` installs that `FakePointerEvent` (moved to `src/test/fakePointerEvent.ts`) on `globalThis` before any test module loads, and the default test environment stays a modern engine. Legacy tests override it through `vi.stubGlobal("PointerEvent", undefined)`, `vi.resetModules()` and a fresh import. E2E tests delete `window.PointerEvent` in a Playwright init script before the app loads. The later changes `set-home-location-and-show-differences` and `add-wall-time-input-with-hint` import this name from `src/lib/legacy/`.

- `DayTrack`: when Pointer Events are missing, the slider gets `onClick` that calls the existing `selectAt` (its parameter widens from `PointerEvent` to `MouseEvent`, which has `clientX` and `currentTarget`), and no `onPointer*` handler. With Pointer Events, nothing changes and no `onClick` is attached, so a click never adds a selection (`time-selection` delta). iOS sends `click` only after a tap, never after a scroll, so the vertical-swipe rule holds. The slider's role, name, value and keys are untouched (NFR-A2).
- `LocationList`: `useSensor(IS_POINTER_EVENTS_SUPPORTED ? PointerSensor : TouchSensor, options)`. The options are the current distance constraint for pointers, or `{ activationConstraint: { delay: REORDER_TOUCH_ACTIVATION_DELAY_MS, tolerance: REORDER_TOUCH_ACTIVATION_TOLERANCE_PX } }` for touch (250 ms and 5 px, in `constants/reorder.ts`). The hook is called unconditionally and the sensor class is a module constant, so the hook order is stable. During a drag, dnd-kit's `TouchSensor` blocks `touchmove` with a non-passive listener, which replaces the `touch-action: none` iOS 12 ignores.

**Alternatives:** registering `PointerSensor` and `TouchSensor` together. Both react to one finger on modern browsers, and dnd-kit advises against it. Rejected. A Pointer Events polyfill (PEP): unmaintained, with partial `setPointerCapture` support. Rejected. `touchstart/move/end` on `DayTrack` with `dayTrackTouch.ts`: gives smooth dragging, but that is NG4.

### D9. Legacy build check inside `pnpm build` (FR13)

A new `scripts/check-legacy-build.mjs` (script `check:legacy-build`) runs at the end of `build` (`tsc -b && vite build && node scripts/check-legacy-build.mjs`). CI's existing `pnpm build` step (root `build` = `pnpm --filter @time-zones/client build`), the E2E `webServer` and the deploy that reuses `ci.yml` therefore fail on a legacy issue, with no `.github/` change:

- It parses every `dist/assets/*.js`, `dist/sw.js` and `dist/workbox-*.js` with `acorn` (`ecmaVersion: 2020`, module). That rejects ES2021+ syntax such as `??=`, class fields and top-level `await`.
- It then walks the AST and rejects `ChainExpression`, `??`, BigInt literals, and regex lookbehind (`(?<=` / `(?<!`) both in regex literals and in a string literal passed to `RegExp(...)` / `new RegExp(...)`, because esbuild turns a regex literal its target cannot parse into a `new RegExp` call that would still throw on Safari 12. Those are ES2018–ES2020 features that Safari 12 lacks, while `import()`, `import.meta` and optional catch binding stay allowed.
- It scans `dist/assets/*.css` for `inset:` declarations and for a `100dvh` declaration with no `100vh` before it in the same rule (FR12).
- It checks that `dist/index.html` has a `modulepreload` link for the `main` chunk and none for the polyfill chunk (NFR-P2).
- It exits non-zero and names the file and the construct.

Its rules live in a pure module (`scripts/legacyBuild/findLegacySyntaxIssues.ts`) with unit tests under `src/test/legacyBuild/`, as `scripts/benchBudgets.ts` is tested from `src/test/benchmarks/`. The script runs with Node 26 (`.nvmrc`), which imports `.ts` directly, as `check-bench-budgets.mjs` does.

**Alternatives:** `es-check es2018`. It rejects optional catch binding (ES2019, supported by Safari 12) and `import()`, which the build legitimately emits, and it misses lookbehind. Rejected. A separate CI step: needs a `.github/` edit the factory cannot make, and deploy would not run it. Rejected.

### D10. Update recheck when the page becomes visible (FR10)

A new `src/controller/useUpdateRecheckOnReturn.ts` takes the `ServiceWorkerRegistration | undefined`, a `Clock` and an `onCheckFailed` callback. It records the instant of the start-up check. On `visibilitychange` with `document.visibilityState === "visible"`, if at least `UPDATE_RECHECK_INTERVAL_MS` (15 min, new `constants/updates.ts`) have passed, it calls `registration.update()` and records the instant. A rejection calls `onCheckFailed`. `usePwaUpdateStatus` gains an optional `clock: Clock = systemClock` parameter (as `LocationsProvider` has), keeps the registration from `onRegisteredSW` in state, and passes `() => setIsUpdateCheckFailed(true)`. `AppShell` keeps calling it without arguments. A found worker flows through the existing `needRefresh` path and the existing notice. `applyUpdate` already reloads, which answers the "iOS never restarts the PWA" half of WebKit bug 199110.

**Alternatives:** `setInterval` polling: wakes hidden pages, and iOS suspends timers in the background anyway. Rejected. `registerType: "autoUpdate"`: the app would reload by itself, which `app-shell` forbids. Rejected.

### D11. Tests without a real iOS 12 engine (NG9)

Every fallback is driven by a missing API. jsdom tests remove the API (`vi.stubGlobal("PointerEvent", undefined)`, deleting `Intl.DisplayNames`, a `MediaQueryList` stub without `addEventListener`) and re-import the module under test. Layout-dependent behaviour (tap position, finger drag, page scroll, slider name and keys, network requests) runs in playwright-bdd against the production build, with the API removed by an init script. The touch helpers of `src/test/features/locations/steps/locationsReorderE2eHelpers.ts` drive the finger drag through CDP touch events.

The zone shim is tested with a fake native `Intl.DateTimeFormat` that rejects `Europe/Kyiv`, installed before a fresh import of `temporal-polyfill` (`vi.resetModules`).

Build-level facts are the legacy build check (D9) plus the existing bundle-size script. The only manual step is M7 on the owner's device (handoff H3).

## Risks / Trade-offs

- [The polyfill may resolve zones in a way that bypasses the captured constructor, for example through `Date.prototype.toLocaleString`] → The spike of task 1.1 runs first. If it fails, switch to the explicit resolver of D4 before any other zone task.
- [Initial JS grows slightly from lowered syntax (helpers for `?.`/`??`) and the boot module] → The bundle-size check runs on every PR. If it fails, the next lever is to move `CardsView` dependencies behind the existing lazy view, not to raise the budget.
- [The polyfill chunk is precached by every client, about 30–40 KB] → Accepted: it is downloaded once, in the background, after the first visit.
- [esbuild may not expand `inset` for the given target] → The legacy build check fails the build at once. The fallback is a small PostCSS plugin in `postcss.config.js` that expands `inset` declarations.
- [dnd-kit `TouchSensor` on iOS 12 may still let the page scroll] → Checked in M7. The fallback is a non-passive `touchmove` listener on the drag handle while a drag is active.
- [The probe in D2 uses `Europe/Kyiv` as a marker of outdated zone data] → An engine with old data that already knows Kyiv would skip the shim, and other renames would still fail there as unknown zones. Accepted for the stopgap.
- [`dist/sw.js` is generated by Workbox, not lowered by Vite] → The legacy build check parses it too. Workbox's `generateSW` compiles it for `babelPresetEnvTargets` (default `chrome >= 56`, older than Safari 12's syntax level), so it should pass; if not, set that option in the `workbox` block of `vite.config.ts`.
- [A dependency ships a BigInt literal] → esbuild stops the `safari12` build at task 5.6 and names the file. The spike searches `temporal-polyfill` for literals first, because it is the dependency most likely to have one.
- [Boot adds one tiny module and an `await import` on modern browsers] → The `modulepreload` links of D2 remove the waterfall. The bundle check and the E2E request check measure the result.

## Consequences

Positive:
- iOS 12.5 devices run the app with no change to domain types, the stored schema or the views' markup.
- Modern browsers fetch no polyfill; the only cost to them is the boot module and lowered syntax, both measured by the bundle-size check.
- Every rule (syntax level, no BigInt, no `inset`, `vh` fallback) is enforced by `pnpm test` or `pnpm build`, so a later change cannot silently break iOS 12.

Negative:
- Two input paths in `DayTrack` and two sensor setups in `LocationList`, chosen by `IS_POINTER_EVENTS_SUPPORTED`.
- The legacy zone shim is a stopgap that patches a global; it only knows renames in the CLDR alias map.
- The real iOS 12 engine is checked only manually (H3).

## Alternatives Considered

Each decision above lists its rejected alternatives. In short: `@vitejs/plugin-legacy` (puts polyfills into every browser's initial JavaScript, D1); a static polyfill import or `document.write` (D2); a hand-written or usage-based polyfill list (D3); an explicit legacy-name resolver at every zone call site, kept as the spike's fallback (D4); an `Intl.DisplayNames` polyfill (D6); `postcss-preset-env` or Lightning CSS (D7); the PEP polyfill or both dnd-kit sensors at once (D8); `es-check` or a separate CI step (D9); polling or `autoUpdate` (D10).

## Migration Plan

No data migration: the stored schema stays version 1. Deploying is the normal `main` deploy. Rollback is reverting the change. Stored lists stay readable either way, because ids stay canonical.

## Open Questions

- The touch activation delay (Q3 of the proposal) may be tuned after M7 without changing specs or tasks. The constant lives in `src/constants/reorder.ts`.

## Sources

- `@vitejs/plugin-legacy` options (`modernPolyfills`, `renderLegacyChunks`): https://tessl.io/registry/tessl/npm-vitejs--plugin-legacy/files/docs/configuration.md and https://dev.to/solleedata/supporting-older-browsers-using-vite-2ii
- Pointer Events support (iOS 13+): https://caniuse.com/pointer
- `temporal-polyfill` browser support and BigInt: `node_modules/temporal-polyfill/README.md`
- Safari 12 `Array#reverse` bug: https://github.com/cbrevik/arrayReverseBug
- Flexbox `gap` in Safari 14.1+: https://dev.to/philw_/a-small-tailwindcss-plugin-to-emulate-support-for-gap-in-older-safari-ios-browsers-1hld
- IANA 2022b rename `Europe/Kiev` → `Europe/Kyiv`: https://community.postcrossing.com/t/selecting-timezone-europe-kyiv-causes-an-error/630405
- iOS 12 service worker bugs: https://bugs.webkit.org/show_bug.cgi?id=190269, https://bugs.webkit.org/show_bug.cgi?id=192166, https://bugs.webkit.org/show_bug.cgi?id=199110, https://github.com/PWA-POLICE/pwa-bugs
- iOS 12.2 PWA lifecycle: https://firt.dev/ios-12.2/
