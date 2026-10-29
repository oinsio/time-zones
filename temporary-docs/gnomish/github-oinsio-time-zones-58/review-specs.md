# Specs review: support-legacy-ios-12-safari

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 42/44 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 1 |

## Freshness

All paths are under `packages/client/` unless stated otherwise.

- ✅ `vite.config.ts` sets no `build.target` (`build: { outDir: BUILD_OUT_DIR }`, line 18). The lockfile has `vite@6.4.3` (`pnpm-lock.yaml:3831`), whose default target is `es2020, edge88, firefox78, chrome87, safari14`.
- ✅ `src/controller/useCitySearch.ts:25` uses `??` (`i18n.resolvedLanguage ??`).
- ✅ BigInt in production code: `src/model/timeZoneId.ts:5` (`const EPOCH_NANOSECONDS = 0n`, passed to `new Temporal.ZonedDateTime` at line 18), `src/model/dayPeriodStops.ts:27` (`instant.epochNanoseconds - day.start.epochNanoseconds`), `src/model/dayPeriodWindows.ts:102-104` (`fromEpochNanoseconds(… .epochNanoseconds - BigInt(localStart.offsetNanoseconds))`). These are the only BigInt uses outside tests.
- ✅ `NANOSECONDS_PER_MINUTE` is in `src/constants/utcOffset.ts:2` and `MILLISECONDS_PER_MINUTE` in `src/constants/clock.ts:2`. `NANOSECONDS_PER_MILLISECOND` does not exist.
- ✅ `scripts/check-bundle-size.mjs` has `INITIAL_JS_BUDGET_KB = 150` (line 17), counts `modulepreload` links (line 30) and requires a `CardsView-` chunk (lines 23, 57, 91).
- ✅ `dayPeriodWindows.ts:107-109` calls `wanted.toZonedDateTime(timeZoneId, { disambiguation: "earlier" })`.
- ✅ `src/model/wallClock.ts:24-41` `resolveWallClock(timeZoneId, plainDateTime)` uses `compatible`, `earlier` and `later` (lines 15-17, 30-33) and returns `UNIQUE` / `AMBIGUOUS` / `GAP`. `src/model/index.ts:72` exports it.
- ✅ `src/model/locations.ts:107-110`: `ADD_LOCATION` canonicalizes and fails with `UNKNOWN_TIME_ZONE`. Line 145: `SET_DEVICE_TIME_ZONE` canonicalizes the device zone.
- ✅ `virtual:time-zone-aliases` is typed legacy → canonical in `src/vite-env.d.ts:4-7`. It is built from CLDR bcp47 in `scripts/zoneData/extractZoneData.ts` (lines 15, 25, 57-59).
- ✅ About 20 zone call sites: 22 lines in production `src/` pass a zone into Temporal or `Intl` (`toZonedDateTime(ISO)`, `timeZone:`, `ZonedDateTime(`).
- ✅ Unguarded APIs: `new Intl.DisplayNames` at `src/presenter/countryName.ts:9` and `src/adapters/city-search/zoneCitiesSource.ts:91` (inside `readCountryTexts`, line 88). `new ResizeObserver` at `src/controller/useContainerWidth.ts:18`. `queryList?.addEventListener` at `src/controller/usePrefersReducedMotion.ts:13`. `Intl.supportedValuesOf` is already guarded (`zoneCitiesSource.ts:31`), and so is `BroadcastChannel` (`src/adapters/localStorageLocationRepository.ts:41`).
- ✅ Empty country names already render nothing: `src/views/shared/LocationRow.tsx:117` and `src/views/shared/LocationSearchResults.tsx:51`.
- ✅ `src/views/shared/DayTrack.tsx` uses only `onPointer*` (lines 131-134) and `setPointerCapture` (78, 96). `selectAt` takes `PointerEvent<HTMLDivElement>` (line 60). `inset-x-0` is at line 142.
- ✅ `src/views/shared/LocationList.tsx:58-67` registers `PointerSensor` with `REORDER_POINTER_ACTIVATION_DISTANCE_PX` and `KeyboardSensor`. The constant is in `src/constants/reorder.ts`, which has no touch constants yet.
- ✅ `src/controller/usePwaUpdateStatus.ts:20` takes no arguments. It calls `registration?.update()` once in `onRegisteredSW` (line 27), a rejection sets `isUpdateCheckFailed`, and `applyUpdate` reloads (`shouldReloadPage = true`).
- ✅ `src/controller/useMinuteTick.ts:6-7` holds the module constants `VISIBILITY_CHANGE_EVENT` and `VISIBLE_STATE` and takes an injected `Clock`.
- ✅ `systemClock`, `fakeClock` and `Clock` are exported by `src/lib/temporal.ts` (lines 9, 19, 30). `createSwitchableClock` (`src/test/switchableClock.ts`), `setPageVisibility` / `resetPageVisibility` (`src/test/pageVisibility.ts`), and `fakeServiceWorkerModule` / `failUpdateCheck` (`src/test/fakeServiceWorker.ts`, whose `update()` always rejects) exist as described.
- ✅ The Tailwind CSS claims hold: `inset-0` and `sm:inset-auto` in `src/components/ui/dialog.tsx:23,26,27`, and `min-h-dvh` in `src/app/MainPage.tsx:23` and `src/app/RecoveryScreen.tsx:16`. `tailwind.config.ts` sets no `minHeight`. The lockfile has `tailwindcss@3.4.19`.
- ✅ `vitest.config.ts` includes only `src/**/*.{test,steps}.{ts,tsx}` and has `plugins: [react(), zoneDataPlugin()]`. `stryker.config.mjs` runs through `vitest.config.ts` and mutates `src/**` by default. `src/test/benchmarks/benchBudgets.test.ts` runs `scripts/check-bench-budgets.mjs` with `execFileSync`.
- ✅ `src/test/setup.ts` stubs `ResizeObserver` and `matchMedia`, defines no `PointerEvent`, and imports `systemClock` from `@/lib/temporal`. `src/views/shared/dayTrackFixture.tsx` defines `FakePointerEvent extends MouseEvent` and `useFakePointerEvents()` (`vi.stubGlobal`). `DayTrack.input.test.tsx` is the only test that uses pointer events in jsdom.
- ✅ `src/test/features/locations/steps/locationsReorderE2eHelpers.ts` exports `startTouch` (line 146) and `dispatchTouch` (line 152) over CDP, and uses `page.addInitScript` (lines 67, 86). `src/test/e2e/` does not exist yet.
- ✅ The line counts quoted in design.md and tasks.md match `wc -l`: 273, 224, 199, 196, 196, 190, 188, 237. `LocationSearchDialog.test.tsx` is 83 lines and `location_search_by_country.steps.ts` is 44.
- ✅ `locations_device_time_zone_unit.steps.tsx` is the only file that calls `vi.resetModules()`.
- ✅ `tsconfig.app.json` has `lib: ["ES2020", "ES2022.Intl", "DOM", "DOM.Iterable"]`. The lockfile has `jsdom@25.0.1` and `vitest@3.2.7`, and `acorn@8.18.0` and `core-js-compat@3.50.0` already appear as transitive dependencies.
- ✅ `.github/workflows/ci.yml` has lint, typecheck, test, build, "Check initial JS budget" (line 46), "Check that the build left sources untouched", smoke E2E (`test:bdd`), and the separate `benchmark` job.
- ✅ `playwright.bdd.config.ts` loads steps from `src/test/features/**/steps/*_e2e.{steps,fixtures}.ts`, has the projects `chromium` and `mobile-chrome`, and runs against `pnpm build && pnpm preview`, so the E2E polyfill-request check sees the production build. `toHaveScreenshot` is only in `locations_layout_e2e.steps.ts:68`.
- ✅ The static imports of `src/constants/` leave the module only once, through the type-only `import type { SupportedLanguage } from "@/i18n"` in `date.ts:1`.
- ✅ `index.html` loads `/src/main.tsx` and has no `apple-mobile-web-app-capable` meta tag. `main.tsx` imports the global CSS and mounts the app.
- ✅ The glossary entry **Legacy zone name** is at `docs/glossary/time.md:11` with *Code:* `virtual:time-zone-aliases`, `canonicalizeTimeZoneId`. `docs/glossary/` has no `browser-compatibility.md` and no **Update recheck** entry.
- ✅ The MODIFIED requirements "Installable PWA", "Checks on every pull request" (`openspec/specs/app-delivery/spec.md:20,45`), "New version notice" (`app-shell/spec.md:52`), "Search by country" (`location-search/spec.md:39`), "Reorder cards by dragging" (`locations/spec.md:313`) and "Select a time on a track" (`time-selection/spec.md:57`) exist. Each delta repeats every stable scenario word for word and only adds to it. No `browser-compatibility` capability exists in `openspec/specs/`.
- ✅ Nothing is implemented yet. No `TouchSensor`, `addListener`, `apple-mobile-web-app-capable` or `src/lib/legacy/` exists in the code, and no archived change mentions iOS 12 or Safari 12.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ browser-compatibility "Supported engines" | ✅ 9.1–9.2, 10.1, H4 |
| FR2 | ✅ | ✅ "Polyfills only where needed" | ✅ 5.2, 5.4, 5.5, 10.1 |
| FR3 | ✅ | ✅ "No BigInt at run time" | ✅ 3.1–3.3, 10.1 |
| FR4 | ✅ | ✅ "Renamed zones on outdated zone data" | ✅ 1.1, 5.1, 10.1 |
| FR5 | ✅ | ✅ "Missing country names", location-search "Search by country" | ✅ 4.1, 4.2, 10.1 |
| FR6 | ✅ | ✅ "Width measurement on legacy engines" | ✅ 5.4, 10.1 |
| FR7 | ✅ | ✅ "Reduced motion on legacy engines" | ✅ 4.4, 10.1 |
| FR8 | ✅ | ✅ time-selection "Select a time on a track" | ✅ 6.2, 6.3, 6.6 |
| FR9 | ✅ | ✅ locations "Reorder cards by dragging" | ✅ 6.4, 6.5 |
| FR10 | ✅ | ✅ app-shell "New version notice" | ✅ 7.1–7.3 (7.3 has a clock gap, R2) |
| FR11 | ✅ | ✅ app-delivery "Installable PWA" | ✅ 8.1, 8.2 |
| FR12 | ✅ | ✅ "Layout fallbacks for legacy CSS", app-delivery checks | ✅ 8.1, 9.1, 9.2 |
| FR13 | ✅ | ✅ app-delivery "Checks on every pull request" | ✅ 3.1, 9.1, 9.2, H1 (lookbehind gap, R3) |
| NFR-P1 | ✅ | ✅ "Polyfills only where needed" | ✅ 5.6, 12.1 |
| NFR-P2 | ✅ | ✅ "Modern engine skips the polyfills" | ✅ 5.6, 10.2 |
| NFR-A1 | ✅ | ❌ no requirement or scenario names it (R1) | ✅ 10.2 |
| NFR-A2 | ✅ | ✅ time-selection "A finger tap keeps the slider accessible…" | ✅ 6.2, 6.6 |
| NFR-R1 | ✅ | ✅ "Modern screenshots unchanged" | ✅ 10.2, 12.2 |
| UX1 | ✅ | ✅ time-selection tap scenarios | ✅ 6.2, 6.3, 6.6 |
| UX2 | ✅ | ✅ locations "A quick swipe over the handle…" | ✅ 6.4, 6.5 |
| UX3 | ✅ | ✅ "Missing country names" | ✅ 4.3, 10.1 |
| G1 | ✅ | n/a met by FR1, M7 | n/a met by FR1, M7 |
| G2 | ✅ | n/a met by FR4, FR8, FR9 | n/a met by FR4, FR8, FR9 |
| G3 | ✅ | n/a met by NFR-P1, NFR-P2, M5 | n/a met by NFR-P1, NFR-P2, M5 |
| G4 | ✅ | n/a met by FR10 | n/a met by FR10 |
| NG1 | ✅ | n/a | n/a nothing builds a dark theme |
| NG2 | ✅ | n/a | n/a no own tzdata |
| NG3 | ✅ | n/a | n/a no Cache Storage workaround |
| NG4 | ✅ | n/a | n/a only tap on tracks (D8) |
| NG5 | ✅ | n/a | n/a no CLDR country names bundled |
| NG6 | ✅ | n/a | n/a no flex `gap` fallback |
| NG7 | ✅ | n/a | n/a no `:focus-visible` fallback |
| NG8 | ✅ | n/a | n/a no `nomodule` bundle |
| NG9 | ✅ | n/a | n/a no iOS 12 test runner |
| M1 | ✅ | n/a | ✅ 12.3 |
| M2 | ✅ | n/a | ✅ 9.2, 12.1 |
| M3 | ✅ | n/a | ✅ 5.1, 10.1 |
| M4 | ✅ | n/a | ✅ 10.1 |
| M5 | ✅ | n/a | ✅ 5.6, 10.2 |
| M6 | ✅ | n/a | ❌ partial: 3.4, 4.5, 5.7, 6.7, 7.4 cover `src/`; no run for the new `scripts/` modules (R4) |
| M7 | ✅ | n/a | ✅ 11.4, H4 |
| Q1 | ✅ | n/a | n/a answered in proposal FR10 (15 minutes) |
| Q2 | ✅ | n/a | n/a open until the spike, task 1.1 (design D4) |
| Q3 | ✅ | n/a | n/a proposed 250 ms / 5 px in D8, tuned after M7 (design Open Questions) |

## Consistency

None.

## Findings

### R1 — WARNING — NFR-A1 has no delta-spec requirement or scenario
- Location: `openspec/changes/support-legacy-ios-12-safari/proposal.md:110`
- Rule: `.claude/rules/traceability.md` ("For every FR/NFR/UX in `proposal.md`, at least one implementing entity must exist"), `.claude/rules/process-invariants.md` (artifact layering)
- Problem: NFR-A1 says "axe-core reports no new violations on the main page and the search dialog in modern browsers". No requirement in any of the six delta specs carries NFR-A1 in its `implements` comment, and no scenario describes it. The other NFR and UX ids are all tagged in a spec (for example `NFR-A2` in `specs/time-selection/spec.md:10` and `NFR-R1` in `specs/browser-compatibility/spec.md:129`). Only task 10.2 builds the E2E scenario "No accessibility violations without Pointer Events" (`tasks.md:143`), so that scenario has no spec behind it.
- Impact: when the change is archived, nothing in `openspec/specs/browser-compatibility/` states the accessibility rule for the legacy fallbacks. Task 10.2 then builds a Gherkin scenario with no upward spec, and a later change can drop the axe check without contradicting any stable spec.
- Fix: in `specs/browser-compatibility/spec.md`, extend the "Supported engines" requirement with "With Pointer Events absent, the main page and the search dialog MUST have no accessibility violations." Add `NFR-A1` to its comment (`implements FR1, NFR-A1 of support-legacy-ios-12-safari`). Add the scenario "No accessibility violations without Pointer Events": GIVEN the engine has no Pointer Events, WHEN the main page is shown and the search dialog is opened, THEN an accessibility check reports no violations. Its name must match the one task 10.2 already uses.
- Fix risk: none. Task 10.2 already builds this E2E scenario with axe-core in playwright-bdd, which is where `.claude/rules/bdd-e2e.md` and ADR-0001 put accessibility checks.
- Status: fixed
- Resolution: added the requirement "Accessibility of the legacy fallbacks" (implements NFR-A1) with the scenario "No accessibility violations without Pointer Events" to specs/browser-compatibility/spec.md; task 10.2 now names that requirement, and design.md Context lists NFR-A1.

### R2 — WARNING — The recheck scenarios cannot set "16 minutes ago" through AppShell
- Location: `openspec/changes/support-legacy-ios-12-safari/tasks.md:115`
- Rule: `.claude/rules/tdd-workflow.md` ("Mock current time with `fakeClock` … never use `vi.setSystemTime()` or `vi.useFakeTimers()`"), `.claude/rules/temporal.md` ("Add `clock: Clock = systemClock` parameter to functions using current time")
- Problem: Task 7.3 writes the vitest-cucumber scenarios "Returning to the app checks again", "Returning soon after a check does not check", "Hiding the page does not check" and "A check on return fails offline". Their Given steps say the last check was "16 minutes ago" or "5 minutes ago" (`specs/app-shell/spec.md:27,32,37,42`). The note scenario must show the real update-check failure note, so the steps render the shell, as `app_shell_notices.steps.ts:62-63` does with `createElement(AppShell)`. `AppShell` (`src/app/AppShell.tsx:22`) takes no props and calls `usePwaUpdateStatus()` with no arguments (line 39). Design D10 and task 7.2 add only `usePwaUpdateStatus(clock: Clock = systemClock)`, so inside AppShell the hook always gets `systemClock`, which reads the real time. Neither D10 nor any task says how a scenario moves that clock forward 15 minutes. The only allowed tools, `fakeClock` and `createSwitchableClock` (`tasks.md:6`), cannot reach the hook. `src/app/AppShell.tsx` is not in proposal Impact (`proposal.md:49-50`).
- Impact: the implement stage cannot write task 7.3 as specified. It will either reach for a forbidden fake timer, overwrite `systemClock.now` from the steps, or render a harness without AppShell, and then the "note is shown" scenario no longer checks the real shell. FR10 can end up untested at the BDD level, or tested in a way the rules forbid.
- Fix: in design D10 and task 7.2, add "`AppShell` takes an optional `clock?: Clock` prop, default `systemClock`, and passes it to `usePwaUpdateStatus(clock)` and to `LocationsProvider` (which already accepts `clock`, `src/controller/LocationsProvider.tsx:80`)". In task 7.3, add "the steps render `AppShell` with `createSwitchableClock` and advance it by 16 or 5 minutes before `setPageVisibility("visible")`". Add `src/app/AppShell.tsx` to the proposal's Impact list.
- Fix risk: low. `main.tsx` keeps calling `<AppShell />`, so production gets `systemClock` as today. Existing AppShell tests and steps keep passing because the prop is optional. AppShell is the composition root, so passing a `Clock` port down keeps to ADR-0007 and `.claude/rules/architecture.md`.
- Status: fixed
- Resolution: design D10 now gives AppShell an optional `clock?: Clock` prop (default systemClock) passed to usePwaUpdateStatus and LocationsProvider; task 7.2 adds it to src/app/AppShell.tsx, task 7.3 renders AppShell with createSwitchableClock and moves it 16 or 5 minutes before setPageVisibility("visible"), and proposal Impact lists src/app/AppShell.tsx.

### R3 — WARNING — The legacy build check misses lookbehind built with `new RegExp`
- Location: `openspec/changes/support-legacy-ios-12-safari/design.md:119`
- Rule: —
- Problem: FR13 (`proposal.md:99`) requires every pull request to fail when the built JavaScript uses "regular-expression lookbehind". The app-delivery delta (`specs/app-delivery/spec.md:21`) and the "Supported engines" scenario (`specs/browser-compatibility/spec.md:15`) say the same. Design D9 and task 9.1 (`tasks.md:125`) only reject regex *literals* containing `(?<=` / `(?<!`. Two things defeat that check:
  - When the target lacks a regex feature, esbuild (the minifier behind `build.target`, D1) rewrites the literal into a `new RegExp("…")` call so the file still parses. With `safari12` in the target, `dist/` would hold no lookbehind literal for the check to find.
  - Any dependency that already builds its pattern from a string (`new RegExp("(?<=…)")`) is never seen.
  
  Either way Safari 12 throws `SyntaxError: Invalid regular expression` when that line runs.
- Impact: the lookbehind clause of FR13 is not enforced. A dependency with a lookbehind pattern passes `check:legacy-build` and CI, then fails at run time on iOS 12. If the pattern sits at module top level, the app does not start (FR1).
- Fix: in design D9 and task 9.1, extend `findLegacySyntaxIssues` to also report every `NewExpression` or `CallExpression` whose callee is `RegExp` and whose first argument is a string literal containing `(?<=` or `(?<!`, as construct `regex lookbehind`. Add the `it.each` cases `new RegExp("(?<=a)b")` and `RegExp("(?<!a)b")` (reported) and `new RegExp("(?:a)b")` (not reported). Keep the literal check.
- Fix risk: a dependency that builds a lookbehind `RegExp` only inside a feature-detection `try`/`catch` would now fail the check even though it is safe at run time. The implementer would then need a named allow-list entry in the script. That is acceptable and visible in review.
- Status: fixed
- Resolution: design D9 and task 9.1 now also report `new RegExp(…)` / `RegExp(…)` calls whose first string-literal argument contains `(?<=` or `(?<!`, with a named allow-list for guarded feature detection; task 9.1 adds the it.each cases `new RegExp("(?<=a)b")`, `RegExp("(?<!a)b")` (reported) and `new RegExp("(?:a)b")` (not reported).

### R4 — WARNING — M6 has no mutation run for the new `scripts/` modules
- Location: `openspec/changes/support-legacy-ios-12-safari/tasks.md:125`
- Rule: `.claude/rules/tdd-workflow.md` (Step 5: "Run … mutation on the changed files … Target mutation score: >=95%"), `.claude/rules/test-planning.md` ("Mutation testing (Stryker) — verify test quality")
- Problem: M6 (`proposal.md:161`) requires a mutation score of at least 95% for "the new or changed code". Tasks 5.3, 5.6 and 9.1 add three pure TypeScript modules with logic, all under `scripts/`:
  - `scripts/legacyBuild/findLegacySyntaxIssues.ts`: the syntax, `inset` and `dvh` rules behind FR12 and FR13;
  - `scripts/legacyCoreJs/buildLegacyCoreJsModules.ts`: the polyfill list behind FR2;
  - the `modulepreload` plugin under `scripts/legacyBoot/` (NFR-P2).
  
  The five mutation tasks (3.4, 4.5, 5.7, 6.7, 7.4) list only `src/` files. Stryker's default `mutate` is `src/**` (`stryker.config.mjs:8-17`), so `pnpm test:mutation` never reaches `scripts/` either. A scoped run on a `scripts/` file is the established practice: the archived task 6.4 of `replace-wall-clock-row-budgets-with-deterministic-checks` ran `npx stryker run --mutate 'scripts/benchBudgets.ts'` for M6.
- Impact: the rules that decide whether CI fails a build (FR12, FR13) and which polyfills iOS 12 gets (FR2) can ship with weak tests, for example a `dvh` fallback rule whose inverted comparison survives. M6 can then neither be shown nor be claimed as met.
- Fix: add task 9.3 "Mutation run (M6). Verify that `npx stryker run --mutate 'scripts/legacyBuild/findLegacySyntaxIssues.ts,scripts/legacyCoreJs/buildLegacyCoreJsModules.ts'` scores ≥ 95% (minimum 90%); kill survivors with extra cases in `src/test/legacyBuild/` and `src/test/legacyCoreJs/`." For the `modulepreload` plugin, either give task 5.6 a unit test of its pure HTML transform under `src/test/legacyBoot/` and add the file to the same run (at most 5 files), or say in task 5.6 that the plugin is glue only and covered by the build check.
- Fix risk: low. It adds one Stryker run of 2–3 files, within the 5-file limit in `CLAUDE.md`. A plugin without a unit test would score low if it were added to the run without one, hence the either/or above.
- Status: fixed
- Resolution: task 5.6 splits the modulepreload plugin into the pure transform scripts/legacyBoot/addMainChunkPreloads.ts (unit-tested in src/test/legacyBoot/) and a glue plugin (design D2 notes it); new task 9.3 runs Stryker scoped to findLegacySyntaxIssues.ts, buildLegacyCoreJsModules.ts and addMainChunkPreloads.ts for M6.

### R5 — SUGGESTION — Importing `boot.ts` in its test runs the real boot
- Location: `openspec/changes/support-legacy-ios-12-safari/tasks.md:73`
- Rule: —
- Problem: Task 5.5 has `src/boot.ts` both export `bootApp(...)` and "run it with `@/lib/legacy` and `() => import("./main")`" when the module loads. `src/boot.test.ts` must import `src/boot.ts` to reach `bootApp`, which starts the real boot. That boot dynamically imports `src/main.tsx`, which throws `Missing #root element in index.html` (`src/main.tsx:15-17`) because the jsdom document has no `#root`. Unless the test mocks `./main`, that rejection is unhandled. Stryker would also mutate the top-level call.
- Impact: Vitest reports an unhandled rejection and fails `npx vitest run src/boot.test.ts` even when every assertion passes. The implementer finds this only at the green step and must improvise a `vi.mock("./main")`.
- Fix: in design D2 and task 5.5, put the pure `bootApp` in its own module (`src/lib/legacy/bootApp.ts`, exported from `lib/legacy/index.ts`). `src/boot.ts` then holds only the call, and `src/boot.ts` is added to the `!src/main.tsx`-style exclusions of Stryker. Test `bootApp` in `src/lib/legacy/bootApp.test.ts`. Alternatively, keep the layout and state in task 5.5 that `boot.test.ts` mocks `./main` and `@/lib/legacy` with `vi.mock` before importing `./boot`.
- Fix risk: low. The source-scan case of task 5.5 must then also scan `src/lib/legacy/bootApp.ts`, which the `src/lib/legacy/*.ts` glob already covers. Editing `stryker.config.mjs` is inside `packages/`, so the implement stage may do it.
- Status: fixed
- Resolution: design D2 and task 5.5 move the pure bootApp into src/lib/legacy/bootApp.ts (exported from lib/legacy/index.ts, tested in src/lib/legacy/bootApp.test.ts); src/boot.ts holds only the call and is added to the Stryker exclusions next to src/main.tsx; task 5.7 mutates bootApp.ts instead of boot.ts.

## Verdict

Needs revision. There is no CRITICAL finding. Fix R1, R2, R3 and R4 (WARNING) before implementation: R1 leaves NFR-A1 without a spec, R2 makes task 7.3 impossible to write as specified, R3 leaves the lookbehind clause of FR13 unenforced, and R4 leaves M6 unmet for the new `scripts/` modules. R5 is optional polish.
