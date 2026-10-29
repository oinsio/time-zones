# Design: Support legacy iOS 12 Safari

## Context

Driven by FR1–FR13, NFR-P1, NFR-P2, NFR-A1, NFR-A2 and UX1–UX3 of `proposal.md` (see proposal.md — Why). Current state, checked in `packages/client/`:

- `vite.config.ts` sets no `build.target`, so Vite 6 (`vite@6.4.3` in the lockfile) builds for its default `es2020, edge88, firefox78, chrome87, safari14`. The sources use `??` and `?.` (for example `src/controller/useCitySearch.ts:25`), which that target keeps and Safari 12 cannot parse.
- `scripts/check-bundle-size.mjs` counts as initial JS the entry `<script type="module">` of `dist/index.html` plus its `modulepreload` links, against `INITIAL_JS_BUDGET_KB = 150`. It also requires a separate `CardsView-` chunk. Polyfills inside the initial JS would spend the budget in every browser.
- BigInt in production code: `src/model/timeZoneId.ts:5` (`EPOCH_NANOSECONDS = 0n`, passed to `new Temporal.ZonedDateTime`), `src/model/dayPeriodStops.ts:27` (an `epochNanoseconds` difference), `src/model/dayPeriodWindows.ts:103-104` (`epochNanoseconds - BigInt(localStart.offsetNanoseconds)`). esbuild refuses a BigInt literal for a `safari12` target, so the build would fail, and the two run-time uses would throw on iOS 12. `NANOSECONDS_PER_MINUTE` (`src/constants/utcOffset.ts`) and `MILLISECONDS_PER_MINUTE` (`src/constants/clock.ts`) exist. `NANOSECONDS_PER_MILLISECOND` does not.
- `temporal-polyfill` 0.3.2 (lockfile) is imported only through `src/lib/temporal.ts`. Its README states support for iOS 11.3+ without BigInt unless BigInt-returning members are used. Its internals keep the `Intl.DateTimeFormat` reference taken when the module is evaluated, so a shim of the constructor must be installed before that module is evaluated. This comes from the package source, not from this repository. The spike (task 1.1) confirms it before any zone task.
- Zones: `canonicalizeTimeZoneId` (`src/model/timeZoneId.ts`) builds a `Temporal.ZonedDateTime` and maps the result through `virtual:time-zone-aliases`. That map is legacy → canonical (for example `Europe/Kiev` → `Europe/Kyiv`; type in `src/vite-env.d.ts`) and comes from CLDR `bcp47` (`scripts/zoneData/extractZoneData.ts`). `parseStoredLocations` canonicalizes every stored zone, and a list with an unknown zone is unreadable. `ADD_LOCATION` fails with `UNKNOWN_TIME_ZONE` (`src/model/locations.ts:108-110`). `SET_DEVICE_TIME_ZONE` canonicalizes the device zone too (`src/model/locations.ts:145`). `resolveWallClock` (`src/model/wallClock.ts`) calls `PlainDateTime#toZonedDateTime(zone, { disambiguation })` with `compatible`, `earlier` and `later`. `dayPeriodWindows.ts:107` does the same with `earlier`. About 20 call sites pass a zone id into Temporal (`model/`, `presenter/`, `controller/`).
- Unguarded APIs: `new Intl.DisplayNames` in `src/presenter/countryName.ts:9` and in `readCountryTexts` (`src/adapters/city-search/zoneCitiesSource.ts:91`). `new ResizeObserver` in `src/controller/useContainerWidth.ts:18`. `queryList?.addEventListener` in `src/controller/usePrefersReducedMotion.ts:13`. `Intl.supportedValuesOf` (`zoneCitiesSource.ts:31`) and `BroadcastChannel` (`src/adapters/localStorageLocationRepository.ts:41`) are already guarded. The views already render nothing for an empty country name (`src/views/shared/LocationRow.tsx:117`, `LocationSearchResults.tsx:51`).
- Input: `src/views/shared/DayTrack.tsx` uses only `onPointer*` and `setPointerCapture`. `selectAt` (line 60) takes a React `PointerEvent<HTMLDivElement>` and reads `clientX` and the track's `getBoundingClientRect`. `src/views/shared/LocationList.tsx:58-67` uses `PointerSensor` (activation distance `REORDER_POINTER_ACTIVATION_DISTANCE_PX` from `src/constants/reorder.ts`) and `KeyboardSensor`.
- Updates: `src/controller/usePwaUpdateStatus.ts` takes no arguments. It calls `registration.update()` once, in `onRegisteredSW`, and a rejection sets `isUpdateCheckFailed`. `src/controller/useMinuteTick.ts` shows the pattern for an injected `Clock` (`@/lib/temporal`).
- CSS: Tailwind 3.4 emits `inset: 0px` for `inset-0` and `inset: auto` for `sm:inset-auto` (`src/components/ui/dialog.tsx:23,26,27`). `inset-x-0` (`DayTrack.tsx:142`) emits only `left` and `right`. `min-h-dvh` emits `min-height: 100dvh` (`src/app/MainPage.tsx:23`, `src/app/RecoveryScreen.tsx:16`). `tailwind.config.ts` does not set `minHeight` today.
- Tests: Vitest collects only `src/**/*.{test,steps}.{ts,tsx}` (`vitest.config.ts`). Tests of modules under `scripts/` therefore live under `src/test/` and import the script, as `src/test/benchmarks/benchBudgets.test.ts` does for `scripts/benchBudgets.ts`. Stryker mutates `src/**` only. `src/test/setup.ts` installs stub `ResizeObserver` and `matchMedia` for jsdom and does not define `PointerEvent`. A `PointerEvent` stand-in exists only per file: `src/views/shared/dayTrackFixture.tsx` defines `class FakePointerEvent extends MouseEvent` and `useFakePointerEvents()`, which calls `vi.stubGlobal("PointerEvent", FakePointerEvent)`; its one caller is `src/views/shared/DayTrack.input.test.tsx`. The E2E helpers already drive touch through CDP (`startTouch`, `dispatchTouch` in `src/test/features/locations/steps/locationsReorderE2eHelpers.ts`, a locations-only module of 196 lines) and use `page.addInitScript`. Several test files this change touches are already near or over the 200-line target (`app_shell_notices.steps.ts` 273, `LocationRow.test.tsx` 224, `app_shell_smoke_e2e.steps.ts` 199, `LocationList.test.tsx` 196, `time_selection_select_time.steps.tsx` 190, `locations_reorder_drag_e2e.steps.ts` 188, `locations_reorder_e2e.feature` 237), so new tests go into new files (task list).
- `tsconfig.app.json` has `lib: ["ES2020", "ES2022.Intl", "DOM", "DOM.Iterable"]`. `Intl.DisplayNames`, `MediaQueryList.addListener` and `globalThis.PointerEvent` type-check. `Array.prototype.at` does not, so the probe tests `"at" in Array.prototype`.
- CI (`.github/workflows/ci.yml`): one job with lint, typecheck, test, build, "Check initial JS budget", "Check that the build left sources untouched" and smoke E2E, plus the non-blocking `benchmark` job.

Binding decisions followed: ADR-0002 (layers: side effects in the controller, views render and emit events), ADR-0003 (Temporal for all time math, canonical IANA ids; its known limitation "time zone rules come from the browser" stays), ADR-0004 (storage schema unchanged), ADR-0007 (device zone only through the `Clock` port), ADR-0008 (no wall-clock assertions in unit tests), ADR-0001 (real-browser checks in playwright-bdd). The set of supported engines is a global decision, so it goes into a new ADR (`docs/adr/0009-supported-browser-engines.md`, handoff H2) rather than being settled here. A future change that ships its own zone database will need an ADR that supersedes ADR-0003's known limitation, and it will retire D4.

## Goals / Non-Goals

**Goals:** keep every legacy accommodation in one place (the boot step and `src/lib/legacy/`), except the small input and API guards that must live where the API is used. Modern browsers pay at most one tiny boot module. Every accommodation is driven by a missing API, so jsdom tests can remove the API and check it.

**Non-Goals:** a `nomodule` legacy bundle (NG8). Babel. Any change to domain types or the stored schema.

## Decision

### D1. Build: lower syntax with esbuild targets, not `@vitejs/plugin-legacy` (FR1, NFR-P1)

`build.target` becomes `["es2020", "edge88", "firefox78", "chrome87", "safari12", "ios12"]` (the Vite default with `safari12` and `ios12` in place of `safari14`), kept in one exported constant. `build.cssTarget` uses the same list (D7). esbuild lowers `??`, `?.`, numeric separators, class fields and the other post-2018 syntax. It stops the build on what it cannot lower, such as a BigInt literal.


### D2. Boot module loads legacy support, then the app (FR2, NFR-P2)

`index.html` points at a new `src/boot.ts`. It does three things in order:

1. It calls `needsLegacySupport()`. The check is true when any of these holds: `"at" in Array.prototype` is false (marks Safari < 15.4 and covers the core-js gap), `ResizeObserver` is missing, or `new Intl.DateTimeFormat("en", { timeZone: LEGACY_ZONE_PROBE_ID })` throws (`LEGACY_ZONE_PROBE_ID = "Europe/Kyiv"`).
2. When the check is true, it awaits `loadLegacySupport()`, which `lib/legacy/index.ts` defines as `() => import("./installLegacySupport")`. The dynamic import lives inside the module, so `boot.ts` imports only through `@/lib/legacy` (module boundary rule) and the polyfills stay in their own chunk.
3. It awaits `import("./main")`. `main.tsx` stays the app entry and mounts the app. A rejected legacy load still loads the app, so the user sees the app or its recovery screen, never a blank page.

The static import graph of `boot.ts` holds only `lib/legacy/` and `@/constants` (plain values; apart from imports between its own files, its only import is the type-only `SupportedLanguage` from `@/i18n` in `src/constants/date.ts`, which the build erases). `lib/legacy/` must not import `@/lib/temporal`, React or any app module statically, so nothing evaluates `temporal-polyfill` before the shim (task 5.5 checks it with a source scan).

To avoid a request waterfall on modern browsers, a small Vite plugin (`transformIndexHtml`, `enforce: "post"`) adds `<link rel="modulepreload">` for the `main` chunk and its static imports. `check-bundle-size.mjs` already counts those links, so the budget measures exactly what a modern browser fetches at start. The legacy chunk gets no preload link and stays outside the budget.


### D3. Polyfill set: everything core-js reports as missing in iOS 12.5 (FR2, FR6)

`src/lib/legacy/installLegacySupport.ts` imports, in this order:

1. The core-js `stable` modules that `core-js-compat` reports as needed for `ios_saf 12.2`. A build-time virtual module (`virtual:legacy-core-js`, declared in `src/vite-env.d.ts`) lists them, and the `core-js-compat` version is pinned to the `core-js` dependency. The plugin that serves it is registered in both `vite.config.ts` and `vitest.config.ts` (whose `plugins` are `[react(), zoneDataPlugin()]` today), as `zoneDataPlugin` already is for `virtual:time-zone-aliases`. Stryker runs through `vitest.config.ts` (`stryker.config.mjs`), so scoped mutation runs resolve it too.
2. `@juggle/resize-observer`, assigned to `globalThis.ResizeObserver` only when it is absent.
3. The zone shim of D4, installed only when the probe of D2 fails.

This is a target-based set, not a usage-based one. It also covers built-ins used by dependencies (React, Radix, i18next, dnd-kit), which a scan of our own sources would miss. It is paid only by legacy engines. The Service Worker precaches the chunk for everyone (`globPatterns` include `js`), so it also works offline on iOS 12.

The `Array#reverse` bug of Safari 12.0 is fixed in 12.1+, so the target 12.5 needs no fix for it (NG8).


### D4. Legacy zone names through an `Intl.DateTimeFormat` shim (FR4)

On engines whose zone data predates a rename, the shim wraps `Intl.DateTimeFormat`. When the native constructor throws `RangeError` for a `timeZone` option, the wrapper retries with each legacy name of that zone. The names come from `getLegacyZoneNames`, which inverts `virtual:time-zone-aliases` into canonical → legacy names. The shim keeps `prototype`, `supportedLocalesOf` and `instanceof`. It is installed before `temporal-polyfill` is evaluated, which D2 guarantees, because the polyfill keeps the constructor it saw at evaluation.

Effects on the existing code:

- `canonicalizeTimeZoneId("Europe/Kyiv")` succeeds. If Temporal reports the resolved name `Europe/Kiev`, the existing alias map turns it back into `Europe/Kyiv`.
- Stored and compared ids stay canonical (ADR-0004 unchanged).
- `SET_DEVICE_TIME_ZONE` already canonicalizes the device zone read through the `Clock`, so the Here mark still matches.
- All ~20 Temporal call sites work unchanged, including `resolveWallClock` and `dayPeriodWindows`, if the spike shows that `PlainDateTime#toZonedDateTime` with each disambiguation reaches the shimmed constructor.

**Spike (task 1.1).** It installs a fake native constructor that rejects `Europe/Kyiv`, wraps it with a minimal retry, resets modules and re-imports `@/lib/temporal`. Vitest leaves `node_modules` packages to Node, and `vi.resetModules()` does not re-evaluate them; `src/test/setup.ts` already imports `@/lib/temporal`, so without more the polyfill would keep the real constructor, which accepts `Europe/Kyiv` in Node, and every check would pass with the shim bypassed. Task 1.1 therefore adds `temporal-polyfill` to `test.server.deps.inline` in `vitest.config.ts` (Vitest 3.2), so a fresh import re-evaluates it, and the spike also asserts on the fake's call log. It checks:

- the fake native constructor was called with `Europe/Kyiv` and threw, then with `Europe/Kiev` and succeeded (the shim was reached, not bypassed);
- `Instant#toZonedDateTimeISO("Europe/Kyiv")` at `2026-03-08T07:30:00Z` gives `09:30` and `+02:00`, and what `.timeZoneId` returns;
- `resolveWallClock("Europe/Kyiv", …)` gives `2026-03-08T08:00:00Z` `UNIQUE` for `2026-03-08T10:00`, `2026-03-29T01:30:00Z` `GAP` for `2026-03-29T03:30` (DST start in Kyiv), and `2026-10-25T00:30:00Z` `AMBIGUOUS` for `2026-10-25T03:30` (DST end; `compatible` picks the earlier `+03:00` instant). These are the `compatible`, `earlier` and `later` paths of `src/model/wallClock.ts`, which the later change `add-wall-time-input-with-hint` relies on;
- no other `Intl` or `Date` path throws.

If any check fails, D4 switches to the explicit resolver (Alternatives Considered, D4) before section 5 of `tasks.md`. Either way the spike stays as a permanent test (`src/lib/legacy/zoneShim.temporal.test.ts`), so the result is recorded in code, not in this document.

The shim is a stopgap. The future change that ships its own zone database removes it together with the probe in D2.


### D5. Milliseconds instead of BigInt (FR3)

- `timeZoneId.ts`: build the probe with `Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO(input)`.
- `dayPeriodStops.ts`: `(instant.epochMilliseconds - day.start.epochMilliseconds) / (day.lengthMinutes * MILLISECONDS_PER_MINUTE)`. Every instant on a track is minute-aligned, so millisecond precision is exact.
- `dayPeriodWindows.ts`: replace `epochNanoseconds - BigInt(offsetNanoseconds)` with `Temporal.Instant.fromEpochMilliseconds(utcMilliseconds - offsetNanoseconds / NANOSECONDS_PER_MILLISECOND)`. Zone offsets are whole seconds. `NANOSECONDS_PER_MILLISECOND` is added next to `NANOSECONDS_PER_MINUTE` in `src/constants/utcOffset.ts`.

A unit test (`src/test/noBigIntInSources.test.ts`) scans `src/**/*.{ts,tsx}`, excluding tests, steps, benchmarks and `src/test/`, for `/\b\d[\d_]*n\b/`, `BigInt(` and `epochNanoseconds`. Together with esbuild refusing literals (D1), this keeps BigInt out.

### D6. API guards where the API is used (FR5, FR7, UX3)

- `presentCountryName` returns `""` when `Intl.DisplayNames` is not a function. `readCountryTexts` returns `[]` in that case, so country search matches nothing (`location-search` delta). The views already render nothing for an empty country name, so UX3 needs only tests.
- `usePrefersReducedMotion.subscribe` uses `addEventListener` when present, otherwise `addListener` / `removeListener`.
- `ResizeObserver` comes from D3. No guard in `useContainerWidth`.

A guard is chosen over a polyfill for `Intl.DisplayNames`. `@formatjs/intl-displaynames` needs `Intl.Locale` and `getCanonicalLocales` polyfills plus locale data for `en` and `ru`, for country names the owner accepted losing (NG5).

### D7. CSS fallbacks through esbuild's CSS target and a Tailwind fallback value (FR12)

- `build.cssTarget` with `safari12`: esbuild expands `inset` into `top/right/bottom/left` for that target. The CSS check (D9) proves it on every build.
- `min-h-dvh`: set `theme.extend.minHeight.dvh` in `tailwind.config.ts` to the fallback array `["100vh", "100dvh"]`. Tailwind emits both declarations in that order, so an engine without `dvh` keeps `100vh`. The CSS check (D9) fails any `dvh` declaration without that fallback, so a later `h-dvh` or arbitrary `[100dvh]` class cannot regress it.


### D8. Input fallbacks chosen once from Pointer Events support (FR8, FR9, NFR-A2, UX1, UX2)

`src/lib/legacy/pointerEvents.ts` exports `IS_POINTER_EVENTS_SUPPORTED`, read once at module load (`typeof globalThis.PointerEvent === "function"`), re-exported from `lib/legacy/index.ts`. Unit tests override it through `vi.stubGlobal` and a fresh module import. jsdom 25 does not provide `PointerEvent`, and the flag is read at module load, so a per-file `beforeAll` stub comes too late for modules imported at the top of a test. The existing stand-in therefore gets one owner: `FakePointerEvent` moves from `dayTrackFixture.tsx` to new `src/test/fakePointerEvent.ts`, and `src/test/setup.ts` assigns it to `globalThis.PointerEvent` when it is missing (plain assignment, like its `ResizeObserver` stub). `useFakePointerEvents` and its call in `DayTrack.input.test.tsx` are removed. Existing tests keep the modern path; a legacy test removes the API with `vi.stubGlobal("PointerEvent", undefined)`, and `vi.unstubAllGlobals()` restores the stand-in.

- `DayTrack`: when Pointer Events are missing, the slider gets `onClick` that calls the existing `selectAt`. Its parameter widens from `PointerEvent` to `MouseEvent`, which has `clientX` and `currentTarget`. With Pointer Events, no `onClick` is attached, so a click never adds a selection (`time-selection` delta). iOS sends `click` only after a tap, never after a scroll, so the vertical-swipe rule holds. The slider's role, name, value and keys are untouched (NFR-A2).
- `LocationList`: `useSensor(IS_POINTER_EVENTS_SUPPORTED ? PointerSensor : TouchSensor, options)`. The options are the current distance constraint for pointers, or `{ delay: REORDER_TOUCH_ACTIVATION_DELAY_MS (250), tolerance: REORDER_TOUCH_ACTIVATION_TOLERANCE_PX (5) }` for touch (both in `src/constants/reorder.ts`). The hook is called unconditionally and the sensor class is a module constant, so the hook order is stable. During a drag, dnd-kit's `TouchSensor` blocks `touchmove` with a non-passive listener, which replaces the `touch-action: none` iOS 12 ignores.


### D9. Legacy build check (FR12, FR13)

A new `scripts/check-legacy-build.mjs` (package script `check:legacy-build`) runs after `pnpm build`:

- It parses every `dist/assets/*.js`, `dist/sw.js` and `dist/workbox-*.js` with `acorn` (`ecmaVersion: 2020`, module). That rejects ES2021+ syntax such as `??=`, numeric separators, class fields and top-level `await`.
- It walks the AST and rejects `ChainExpression`, `??`, BigInt literals and regex literals with `(?<=` / `(?<!`. Those are ES2020 or ES2018 syntax that Safari 12 lacks, while `import()` and `import.meta` stay allowed.
- It also rejects every `NewExpression` or `CallExpression` whose callee is `RegExp` and whose first argument is a string literal containing `(?<=` or `(?<!`. When the target lacks a regex feature, esbuild rewrites the literal into a `new RegExp("…")` call so the file still parses, and a dependency may build the pattern from a string itself. Either way Safari 12 throws when the line runs. A dependency that builds such a pattern only inside a feature-detection `try`/`catch` gets a named allow-list entry in the script, visible in review.
- It scans `dist/assets/*.css` for `inset:` declarations, and for any rule whose `dvh` declaration (for example `min-height:100dvh`) has no declaration of the same property with a `vh` value before it in that rule (FR12).
- It exits non-zero and names the file and the construct.

Its rules live in a pure module (`scripts/legacyBuild/findLegacySyntaxIssues.ts`) tested from `src/test/legacyBuild/`, as `scripts/benchBudgets.ts` is tested from `src/test/benchmarks/`. The CI step that runs the script goes into `.github/workflows/ci.yml`, after "Check initial JS budget", through handoff H1, because the implement stage may not edit `.github/`.


### D10. Re-check for updates when the page becomes visible (FR10)

A new `src/controller/useUpdateRecheckOnReturn.ts` takes the `ServiceWorkerRegistration` (or `undefined` before registration), a `Clock` and an `onCheckFailed` callback. It records the instant of the start-up check. On `visibilitychange` with `document.visibilityState === "visible"` (the event and state constants move from `useMinuteTick.ts` to `src/constants/pageVisibility.ts`, so both hooks share them), if at least `UPDATE_RECHECK_INTERVAL_MS` (15 min, new `src/constants/update.ts`) have passed, it calls `registration.update()` and records the instant. A rejection calls `onCheckFailed`, which is the existing `setIsUpdateCheckFailed(true)`. `usePwaUpdateStatus(clock: Clock = systemClock)` keeps the registration in state and uses the hook, so its file stays small. `AppShell` (`src/app/AppShell.tsx`, today without props) gains an optional `clock?: Clock` prop, default `systemClock`, and passes it to `usePwaUpdateStatus(clock)` and to `LocationsProvider` (which already accepts `clock`). `main.tsx` keeps rendering `<AppShell />`, so production uses `systemClock` as today. AppShell is the composition root, so handing the `Clock` port down keeps to ADR-0007, and BDD steps can render the real shell with `createSwitchableClock`. A found worker flows through the existing `needRefresh` path and the existing notice. `applyUpdate` already reloads, which answers the "iOS never restarts the PWA" half of WebKit bug 199110.


### D11. Tests without a real iOS 12 engine (NG9)

Every fallback is driven by a missing API. jsdom tests remove the API (`vi.stubGlobal("PointerEvent", undefined)`, deleting `Intl.DisplayNames`, a `MediaQueryList` stub without `addEventListener`) and re-import the module under test after `vi.resetModules()`.

The zone shim is tested with a fake native `Intl.DateTimeFormat` that rejects `Europe/Kyiv`, installed before a fresh import of `@/lib/temporal` (`vi.resetModules`). This works only because `temporal-polyfill` is inlined (`test.server.deps.inline`, task 1.1, see D4), and each such test asserts that the fake was called with `Europe/Kyiv` and rejected it, so a bypassed shim fails the test. Tests never import `temporal-polyfill` directly (`.claude/rules/temporal.md`).

Real-browser behaviour runs in playwright-bdd on Chromium. A shared E2E helper `emulateEngineWithoutPointerEvents(page)`, in its own module `src/test/e2e/withoutPointerEvents.ts` so that the `locations`, `time_selection` and `browser_compatibility` steps import it without reaching into another feature's step helpers, uses `page.addInitScript` to delete `window.PointerEvent` and to stop `pointerdown`, `pointermove`, `pointerup` and `pointercancel` in the window capture phase, so React and dnd-kit see only touch, mouse and click events, as on iOS 12. Taps and finger drags go through the existing CDP touch helpers.

Build-level facts are checked over `dist/` (D9) plus the existing bundle-size script. The only manual step is M7 on the owner's device (handoff H4).

## Consequences

Positive:

- Modern browsers keep their initial JavaScript and download no polyfill. Only the boot module and the `modulepreload` links are new for them (D2).
- Every legacy accommodation is driven by a missing API, so jsdom tests can remove the API and check it (D11).
- Stored data and domain types do not change. Stored ids stay canonical, so rollback is a plain revert.

Negative (risks, each with its mitigation):

- [The polyfill may resolve zones in a way that bypasses the captured constructor, for example through `Date.prototype.toLocaleString`, or only on the `PlainDateTime#toZonedDateTime` path] → Task 1.1 is a spike that runs the shim against `temporal-polyfill` 0.3.2 in jsdom, covering `resolveWallClock`. If it fails, switch to the explicit resolver of D4 before any other zone task.
- [Initial JS grows slightly from lowered syntax (helpers for `?.` and `??`)] → The bundle-size check runs in task 5.6 and on every PR. If it fails, the next lever is to move `CardsView` dependencies behind the existing lazy view, not to raise the budget.
- [The polyfill chunk is precached by every client] → Accepted: it is downloaded once, in the background, after the first visit.
- [esbuild may not expand `inset` for the given target] → The D9 CSS check fails at once. The fallback is a 10-line PostCSS plugin in `postcss.config.js` that expands `inset` declarations.
- [dnd-kit `TouchSensor` on iOS 12 may still let the page scroll] → The E2E scenario with Pointer Events emulated away checks `scrollY`, and M7 checks the device. The fallback is a non-passive `touchmove` listener on the drag handle while a drag is active.
- [The E2E emulation is Chromium with pointer events suppressed, not WebKit 12] → Accepted (NG9). It proves our code paths; M7 proves the engine.
- [The probe in D2 uses `Europe/Kyiv` as the marker of outdated zone data] → An engine with old data that already knows Kyiv would skip the shim, and other renames would still fail there as unknown zones. Accepted for the stopgap. The own zone database (NG2) replaces it.
- [Boot adds one tiny module and an `await import` on modern browsers] → The `modulepreload` links of D2 remove the waterfall. The bundle check measures the result.

## Alternatives Considered

**D1 — Build: lower syntax with esbuild targets, not `@vitejs/plugin-legacy`.** `@vitejs/plugin-legacy` with `modernPolyfills: true`. Its modern-polyfill chunk is a static `<script type="module">` in `index.html`, so every browser downloads it and it counts as initial JS. That breaks NFR-P1 and G3, and it adds Babel to the build. Rejected. `renderLegacyChunks: true` (the SystemJS bundle) targets engines without modules. iOS 12 has them, so it only adds build time. Rejected.

**D2 — Boot module loads legacy support, then the app.** A classic inline script that writes a synchronous polyfill `<script>` with `document.write` before the module scripts. That needs a second IIFE build and an API the platform discourages. Rejected. A static import of polyfills in `main.tsx`: they would be in the initial JS for everyone. Rejected. Top-level `await` in a polyfill module: unsupported before Safari 15. Rejected.

**D3 — Polyfill set: everything core-js reports as missing in iOS 12.5.** Usage-based detection with Babel `preset-env` (`useBuiltIns: "usage"`). It needs a Babel pass over `node_modules`. Rejected. A hand-written list: it silently misses what dependencies use. Rejected. All of `core-js/stable`: larger, with no benefit over the target-based list. Rejected.

**D4 — Legacy zone names through an `Intl.DateTimeFormat` shim.** An explicit `toEngineTimeZoneId(id)` at every call site that hands a zone to Temporal or `Intl`. That is about 20 edits across `model/`, `presenter/` and `controller/`, and new code easily misses it. Kept as the fallback if the spike fails. Storing the legacy name on legacy devices: breaks "IANA canonical ids are the source of truth". Rejected.

**D7 — CSS fallbacks through esbuild's CSS target and a Tailwind fallback value.** `postcss-preset-env`: a new PostCSS dependency for one property. Rejected. `css.transformer: "lightningcss"`: replaces the PostCSS pipeline Tailwind 3 needs. Rejected. Rewriting `inset-*` classes by hand: easy to regress in new components. Rejected.

**D8 — Input fallbacks chosen once from Pointer Events support.** Registering `PointerSensor` and `TouchSensor` together. Both react to one finger on modern browsers, and dnd-kit advises against it. Rejected. A Pointer Events polyfill (PEP): unmaintained, with partial `setPointerCapture` support. Rejected. `touchstart/move/end` on `DayTrack`: gives smooth dragging, but that is NG4.

**D9 — Legacy build check.** `es-check es2018`. It rejects optional catch binding (ES2019, supported by Safari 12) and `import()` (supported since Safari 11.1), which the build legitimately emits, and it misses lookbehind. Rejected.

**D10 — Re-check for updates when the page becomes visible.** A repeating `setInterval` check: wakes hidden pages, and iOS suspends timers in the background anyway. Rejected. `registerType: "autoUpdate"`: the app would reload by itself, which `app-shell` forbids. Rejected.

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
