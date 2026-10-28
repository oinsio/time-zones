# Design: Support legacy iOS 12 Safari

## Context

Driven by FR1–FR13, NFR-P1, NFR-P2 and UX1–UX3 of `proposal.md` (see proposal.md — Why). Current state, checked in `packages/client/`:

- `vite.config.ts` sets no `build.target`, so Vite 6 builds for `es2020, edge88, firefox78, chrome87, safari14`. The built `dist/assets/index-*.js` holds 46 `??` operators. It has no regular-expression lookbehind.
- `scripts/check-bundle-size.mjs`: the initial JS is the entry `<script type="module">` plus its `modulepreload` links. Today it is 140.0 KB gzipped against the 150 KB budget, so about 10 KB is left. Polyfills inside the initial JS would not fit.
- BigInt in production code: `src/model/timeZoneId.ts:5` (`0n` passed to `new Temporal.ZonedDateTime`), `src/model/dayPeriodStops.ts:27` (`epochNanoseconds` difference), `src/model/dayPeriodWindows.ts:103-104` (`epochNanoseconds - BigInt(offsetNanoseconds)`). esbuild refuses a BigInt literal for a `safari12` target, so the build would fail. The two run-time uses would throw on iOS 12.
- `temporal-polyfill` 0.3.2 supports iOS 11.3+ and needs no BigInt unless BigInt-returning members are used (README "BigInt Considerations"). It captures `Intl.DateTimeFormat` once, at module evaluation (`en = Intl.DateTimeFormat` in `chunks/internal.js`). Any shim of `Intl.DateTimeFormat` must therefore be installed before the polyfill module is evaluated.
- Zones: `canonicalizeTimeZoneId` (`src/model/timeZoneId.ts`) builds a `Temporal.ZonedDateTime` and maps legacy names to canonical ones through `virtual:time-zone-aliases`. That map is legacy → canonical (for example `Europe/Kiev` → `Europe/Kyiv`) and comes from CLDR `bcp47` (`scripts/zoneData/extractZoneData.ts`). `parseStoredLocations` rejects the whole stored list when one zone fails to canonicalize. `ADD_LOCATION` fails with `UNKNOWN_TIME_ZONE`. `SET_DEVICE_TIME_ZONE` canonicalizes the device zone too (`src/model/locations.ts:145`). About 20 call sites pass a zone id into Temporal (`model/`, `presenter/`, `controller/`).
- Unguarded APIs: `new Intl.DisplayNames` in `src/presenter/countryName.ts:9` and `src/adapters/city-search/zoneCitiesSource.ts:91`. `new ResizeObserver` in `src/controller/useContainerWidth.ts:18`, which Radix Dialog also needs. `MediaQueryList.addEventListener` in `src/controller/usePrefersReducedMotion.ts:13`. `Intl.supportedValuesOf` and `BroadcastChannel` are already guarded.
- Input: `src/views/shared/DayTrack.tsx` uses only `onPointer*` and `setPointerCapture`. `selectAt` reads `clientX` and the track's `getBoundingClientRect`. `src/views/shared/LocationList.tsx:58-67` uses `PointerSensor` (activation distance `REORDER_POINTER_ACTIVATION_DISTANCE_PX`) and `KeyboardSensor`.
- Updates: `src/controller/usePwaUpdateStatus.ts` calls `registration.update()` once, in `onRegisteredSW`. `src/controller/useMinuteTick.ts` shows the pattern for an injected `Clock` (`@/lib/temporal`).
- CSS: Tailwind 3.4 emits `inset: 0px` for `inset-0` (`src/components/ui/dialog.tsx:23,26`, `MainPage.tsx:35`, `DayTrack.tsx:142`). It emits `min-height: 100dvh` for `min-h-dvh` (`MainPage.tsx:23`, `RecoveryScreen.tsx:16`).
- CI (`.github/workflows/ci.yml`): lint, typecheck, test, build, bundle size, untouched sources, smoke E2E.

Binding decisions followed: ADR-0002 (layers; `lib/` is shared infrastructure), ADR-0003 (Temporal for all time math), ADR-0004 (storage schema unchanged), ADR-0008 (no wall-clock assertions in unit tests). No global decision changes. Supported engines are recorded in the new `browser-compatibility` spec. A future change that ships its own zone database will need an ADR, and it will retire D4.

## Goals / Non-Goals

**Goals:** keep every legacy accommodation in one place (the boot step and `src/lib/legacy/`), except the three small input and API guards that must live where the API is used. Modern browsers pay at most one tiny boot module. Every accommodation is detectable and testable in jsdom by removing the API.

**Non-Goals:** a `nomodule` legacy bundle (NG8). Babel. Any change to domain types or the stored schema.

## Decisions

### D1. Build: lower syntax with esbuild targets, not `@vitejs/plugin-legacy` (FR1, NFR-P1)

`build.target` becomes the current Vite default list with `safari12` and `ios12` in place of `safari14`. `build.cssTarget` uses the same list (D7). esbuild lowers `??`, `?.`, class fields and the other post-2018 syntax. It stops the build on what it cannot lower, such as a BigInt literal.

**Alternatives:** `@vitejs/plugin-legacy` with `modernPolyfills: true`. Its modern-polyfill chunk is a static `<script type="module">` in `index.html`, so every browser downloads it, and it counts as initial JS. That would break NFR-P1 and G3, and it adds Babel to the build. Rejected. `renderLegacyChunks: true` (the SystemJS bundle) targets engines without modules. iOS 12 has them, so it would only add build time. Rejected.

### D2. Boot module loads legacy support, then the app (FR2, NFR-P2)

`index.html` points at a new `src/boot.ts` with no static application imports. It does three things in order:

1. It runs `needsLegacySupport()`. The check is true when any of these holds: `Array.prototype.at` is missing (marks Safari < 15.4 and covers the core-js gap), `ResizeObserver` is missing, or `new Intl.DateTimeFormat("en", { timeZone: "Europe/Kyiv" })` throws.
2. When the check is true, it awaits `import("./lib/legacy/installLegacySupport")`.
3. It awaits `import("./main")`, which stays the current entry and mounts the app.

To avoid a request waterfall on modern browsers, a small Vite plugin (`transformIndexHtml`, `enforce: "post"`) adds `<link rel="modulepreload">` for the `main` chunk and its static imports. `check-bundle-size.mjs` already counts those links, so the budget measures exactly what a modern browser fetches at start. The legacy chunk gets no preload link and stays outside the budget.

**Alternatives:** a classic inline script that writes a synchronous polyfill `<script>` with `document.write` before the module scripts. That needs a second IIFE build and an API the platform discourages. Rejected. Static import of polyfills in `main.tsx`: they would be in the initial JS for everyone. Rejected. Top-level `await` in a polyfill module: unsupported before Safari 15. Rejected.

### D3. Polyfill set: everything core-js reports as missing in iOS 12.5 (FR2)

`src/lib/legacy/installLegacySupport.ts` imports, in this order:

1. The core-js `stable` modules that `core-js-compat` reports as needed for `ios_saf 12.2`. A build-time virtual module (`virtual:legacy-core-js`) lists them, and the `core-js-compat` version is pinned to the `core-js` dependency.
2. `@juggle/resize-observer`, assigned to `globalThis.ResizeObserver` only when it is absent.
3. The zone shim of D4.

This is a target-based set, not a usage-based one. It also covers built-ins used by dependencies (React, Radix, i18next, dnd-kit), which a scan of our own sources would miss. Its size, estimated at 30–40 KB gzipped, is paid only by legacy engines. The Service Worker precaches the chunk for everyone (`globPatterns` include `js`), so it also works offline on iOS 12.

The `Array#reverse` bug of Safari 12.0 is fixed in 12.1+, so the target 12.5 needs no fix for it (NG8).

**Alternatives:** usage-based detection with Babel `preset-env` (`useBuiltIns: "usage"`). It needs a Babel pass over `node_modules`. Rejected. A hand-written list: it silently misses what dependencies use. Rejected. All of `core-js/stable`: larger, with no benefit over the target-based list. Rejected.

### D4. Legacy zone names through an `Intl.DateTimeFormat` shim (FR4)

On engines whose zone data predates a rename, the shim wraps `Intl.DateTimeFormat`. When the native constructor throws `RangeError` for a `timeZone` option, the wrapper retries with each legacy name of that zone. The names come from the inverse of `virtual:time-zone-aliases`, which maps canonical → legacy names. The shim keeps `prototype`, `supportedLocalesOf` and `instanceof`. It is installed before `temporal-polyfill` is evaluated, which D2 guarantees, because the polyfill captures the constructor once.

Effects on the existing code:

- `canonicalizeTimeZoneId("Europe/Kyiv")` succeeds. If Temporal reports the resolved name `Europe/Kiev`, the existing alias map turns it back into `Europe/Kyiv`.
- Stored and compared ids stay canonical (ADR-0004 unchanged).
- `SET_DEVICE_TIME_ZONE` already canonicalizes `Temporal.Now.timeZoneId()`, so the Here mark still matches.
- All ~20 Temporal call sites work unchanged.

The shim is a stopgap. The future change that ships its own zone database removes it together with the probe in D2.

**Alternatives:** an explicit `toEngineTimeZoneId(id)` at every call site that hands a zone to Temporal or `Intl`. That is about 20 edits across `model/`, `presenter/` and `controller/`, and it is easy to miss in new code. Kept as the fallback if the spike (task 1.1) shows that the polyfill bypasses the captured constructor. Storing the legacy name on legacy devices: breaks "IANA canonical ids are the source of truth". Rejected.

### D5. Milliseconds instead of BigInt (FR3)

- `timeZoneId.ts`: build the probe with `Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO(input)`.
- `dayPeriodStops.ts`: `instant.epochMilliseconds - day.start.epochMilliseconds`. Every instant on a track is minute-aligned, so millisecond precision is exact.
- `dayPeriodWindows.ts`: replace `epochNanoseconds - BigInt(offsetNanoseconds)` with `Temporal.Instant.fromEpochMilliseconds(utcMs - offsetNanoseconds / NANOSECONDS_PER_MILLISECOND)`. Zone offsets are whole seconds.

A unit test scans `src/**/*.{ts,tsx}`, excluding tests and `src/test/`, for `/\b\d[\d_]*n\b/`, `BigInt(` and `epochNanoseconds`. It follows the style of the existing source scan for duration assertions (ADR-0008). Together with esbuild refusing literals (D1), this keeps BigInt out.

### D6. API guards where the API is used (FR5, FR6, FR7)

- `presentCountryName` returns `""` when `Intl.DisplayNames` is not a function. `zoneCitiesSource.readCountryTexts` returns `[]` in that case, so country search matches nothing (`location-search` delta). The views already render nothing for an empty country name. Task 4.2 verifies UX3.
- `usePrefersReducedMotion.subscribe` uses `addEventListener` when present, otherwise `addListener` / `removeListener`.
- `ResizeObserver` is provided by D3. No guard in `useContainerWidth`.

A guard in place is chosen over a polyfill for `Intl.DisplayNames`. `@formatjs/intl-displaynames` needs `Intl.Locale` and `getCanonicalLocales` polyfills plus locale data for `en` and `ru`, about 20 KB more, for country names the owner accepted losing (NG5).

### D7. CSS fallbacks through esbuild's CSS target and a Tailwind fallback value (FR12)

- `build.cssTarget` with `safari12`: esbuild expands `inset` into `top/right/bottom/left` for that target. The CI CSS check (D9) proves it on every build.
- `min-h-dvh`: extend `theme.minHeight.dvh` in `tailwind.config.ts` to the fallback array `["100vh", "100dvh"]`. Tailwind emits both declarations in that order, so an engine without `dvh` keeps `100vh`.

**Alternatives:** `postcss-preset-env`: a new PostCSS dependency for one property. Rejected. `css.transformer: "lightningcss"`: replaces the PostCSS pipeline Tailwind 3 needs. Rejected. Rewriting `inset-*` classes by hand: easy to regress in new components. Rejected.

### D8. Input fallbacks chosen once from Pointer Events support (FR8, FR9, UX1, UX2)

`src/lib/legacy/` exports `IS_POINTER_EVENTS_SUPPORTED`, read once at module load (`typeof globalThis.PointerEvent === "function"`). Tests override it through `vi.stubGlobal` and a fresh module import.

- `DayTrack`: when Pointer Events are missing, the slider gets `onClick` that calls the existing `selectAt` (its parameter widens from `PointerEvent` to `MouseEvent`, which has `clientX` and `currentTarget`). With Pointer Events, no `onClick` is attached, so a click can never add a selection (`time-selection` delta). iOS sends `click` only after a tap, never after a scroll, so the vertical-swipe rule holds. The slider's role, name, value and keys are untouched (NFR-A2).
- `LocationList`: `useSensor(IS_POINTER_EVENTS_SUPPORTED ? PointerSensor : TouchSensor, options)`. The options are the current distance constraint for pointers, or `{ delay: REORDER_TOUCH_ACTIVATION_DELAY_MS (250), tolerance: REORDER_TOUCH_ACTIVATION_TOLERANCE_PX (5) }` for touch. The hook is called unconditionally, and the sensor class is a module constant, so the hook order is stable. During a drag, dnd-kit's `TouchSensor` blocks `touchmove` with a non-passive listener, which replaces the `touch-action: none` iOS 12 ignores.

**Alternatives:** registering `PointerSensor` and `TouchSensor` together. Both react to one finger on modern browsers, and dnd-kit advises against it. Rejected. A Pointer Events polyfill (PEP): unmaintained, with partial `setPointerCapture` support. Rejected. `touchstart/move/end` on `DayTrack` with `dayTrackTouch.ts`: gives smooth dragging, but that is NG4.

### D9. Legacy build checks in CI (FR13)

A new `scripts/check-legacy-build.mjs` runs after `pnpm build` in `ci.yml`, next to the bundle-size step:

- It parses every `dist/assets/*.js` and `dist/sw.js` / `dist/workbox-*.js` with `acorn` (`ecmaVersion: 2020`, module). That rejects ES2021+ syntax such as `??=`, class fields and top-level `await`.
- It then walks the AST and rejects `ChainExpression`, `??`, BigInt literals and regex literals with `(?<=` / `(?<!`. Those are ES2020 or ES2018 syntax that Safari 12 lacks, while `import()` and `import.meta` stay allowed.
- It scans `dist/assets/*.css` for `inset:` declarations.
- It exits non-zero and names the file and the construct.

Its rules live in a pure module (`scripts/legacyBuild/findLegacySyntaxIssues.ts`) with unit tests, as `benchBudgets.ts` is tested today.

**Alternatives:** `es-check es2018`. It rejects optional catch binding (ES2019, supported by Safari 12) and `import()` (supported since Safari 11.1), which the build legitimately emits, and it misses lookbehind, which is ES2018. Rejected.

### D10. Re-check for updates when the page becomes visible (FR10)

A new `src/controller/useUpdateRecheckOnReturn.ts` takes the `ServiceWorkerRegistration` (from `onRegisteredSW`), the injected `Clock` and an `onCheckFailed` callback. It records the instant of the start-up check. On `visibilitychange` with `document.visibilityState === "visible"`, if at least `UPDATE_RECHECK_INTERVAL_MS` (15 min, in `src/constants/`) have passed, it calls `registration.update()` and records the instant. A rejection calls `onCheckFailed`, the existing `setIsUpdateCheckFailed(true)`. `usePwaUpdateStatus` keeps the registration in a ref and uses the hook, so the file stays small. A found worker flows through the existing `needRefresh` path and the existing notice. `applyUpdate` already reloads, which answers the "iOS never restarts the PWA" half of WebKit bug 199110.

**Alternatives:** `setInterval` polling: wakes hidden pages, and iOS suspends timers in the background anyway. Rejected. `registerType: "autoUpdate"`: the app would reload by itself, which `app-shell` forbids. Rejected.

### D11. Tests without a real iOS 12 engine (NG9)

Every fallback is driven by a missing API, so jsdom tests remove the API (`vi.stubGlobal("PointerEvent", undefined)`, deleting `Intl.DisplayNames`, a `MediaQueryList` stub without `addEventListener`) and re-import the module under test.

The zone shim is tested with a fake native `Intl.DateTimeFormat` that rejects `Europe/Kyiv`, installed before a fresh import of `temporal-polyfill` (`vi.resetModules`).

Build-level facts are CI checks over `dist/` (D9) plus the existing bundle-size script. The only manual step is M7 on the owner's device.

## Risks / Trade-offs

- [The polyfill may resolve zones in a way that bypasses the captured constructor, for example through `Date.prototype.toLocaleString`] → Task 1.1 is a spike that runs the shim against `temporal-polyfill` 0.3.2 in jsdom with a fake native that rejects `Europe/Kyiv`. If it fails, switch to the explicit resolver of D4 before any other zone task.
- [Initial JS grows slightly from lowered syntax (helpers for `?.`/`??`), with about 10 KB of headroom] → The bundle-size check runs on every PR. If it fails, the next lever is to move `CardsView` dependencies behind the existing lazy view, not to raise the budget.
- [The polyfill chunk is precached by every client, about 30–40 KB] → Accepted: it is downloaded once, in the background, after the first visit.
- [esbuild may not expand `inset` for the given target] → The D9 CSS check fails the build at once. The fallback is a 10-line PostCSS plugin in `postcss.config.js` that expands `inset` declarations.
- [dnd-kit `TouchSensor` on iOS 12 may still let the page scroll] → Verified manually in M7. The fallback is a non-passive `touchmove` listener on the handle while a drag is active.
- [The probe in D2 uses `Europe/Kyiv` as a marker of outdated zone data] → An engine with old data that already knows Kyiv would skip the shim, and other renames would still fail there as unknown zones. Accepted for the stopgap. The own zone database (NG2) replaces it.
- [Boot adds one tiny module and an `await import` on modern browsers] → The `modulepreload` links of D2 remove the waterfall. The bundle check measures the result.

## Migration Plan

No data migration: the stored schema stays version 1. Deploying is the normal `main` deploy. Rollback is reverting the change. Stored lists stay readable either way, because ids stay canonical.

## Open Questions

- The touch activation delay (Q3 of the proposal) may be tuned after M7 without changing specs or tasks. The constant lives in `src/constants/`.

## Sources

- `@vitejs/plugin-legacy` options (`modernPolyfills`, `renderLegacyChunks`): https://tessl.io/registry/tessl/npm-vitejs--plugin-legacy/files/docs/configuration.md and https://dev.to/solleedata/supporting-older-browsers-using-vite-2ii
- Pointer Events support (iOS 13+): https://caniuse.com/pointer
- `temporal-polyfill` browser support and BigInt: `node_modules/temporal-polyfill/README.md`
- Safari 12 `Array#reverse` bug: https://github.com/cbrevik/arrayReverseBug
- Flexbox `gap` in Safari 14.1+: https://dev.to/philw_/a-small-tailwindcss-plugin-to-emulate-support-for-gap-in-older-safari-ios-browsers-1hld
- IANA 2022b rename `Europe/Kiev` → `Europe/Kyiv`: https://community.postcrossing.com/t/selecting-timezone-europe-kyiv-causes-an-error/630405
- iOS 12 service worker bugs: https://bugs.webkit.org/show_bug.cgi?id=190269, https://bugs.webkit.org/show_bug.cgi?id=192166, https://bugs.webkit.org/show_bug.cgi?id=199110, https://github.com/PWA-POLICE/pwa-bugs
- iOS 12.2 PWA lifecycle: https://firt.dev/ios-12.2/
