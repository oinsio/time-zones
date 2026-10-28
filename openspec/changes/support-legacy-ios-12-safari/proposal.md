# Support legacy iOS 12 Safari

## Why

The owner wants to use the app on an old phone and tablet that cannot update past iOS 12.5.7 (iPhone 5s/6, iPad Air / mini 2–3). Today the app does not start there at all. The build targets Safari 14, so the bundle contains syntax Safari 12 cannot parse (46 `??` operators in `dist/assets/index-*.js`). Three model modules use BigInt (`src/model/timeZoneId.ts`, `dayPeriodStops.ts`, `dayPeriodWindows.ts`), which iOS 12 lacks and no polyfill can provide. Past the start, `Intl.DisplayNames`, `ResizeObserver` and `MediaQueryList.addEventListener` are missing, and an unguarded call to any of them throws. Pointer Events do not exist before iOS 13, so the day track and drag reorder ignore every touch. The device's zone data predates IANA 2022b, so renamed zones such as `Europe/Kyiv` throw `RangeError`.

Audience: users of iOS 12.5 devices, which the owner uses as a second screen. The work is a bounded "it starts and the main jobs work" level. Visual parity is out of scope (see Non-Goals).

Research behind this proposal: the `@vitejs/plugin-legacy` documentation, caniuse (Pointer Events, BigInt), WebKit Bugzilla 190269 / 192166 / 199110 (service worker on iOS 12), the PWA-POLICE bug list, and the Safari 12 `Array#reverse` bug report. Sources are listed in `design.md`.

## What Changes

- ADDED: the production build lowers syntax to the Safari 12 level. Missing built-ins are polyfilled only on engines that lack them, before any application module runs. Modern browsers download no polyfill at start.
- ADDED: production code never uses BigInt at run time. Instants are compared and measured in milliseconds.
- ADDED: on an engine whose zone data predates an IANA rename, the renamed zone still works through its legacy name. This covers adding it, reading it from storage, and formatting its time and offset. The stored identifier stays canonical. This is a stopgap until the app ships its own time zone database (NG2).
- ADDED: on engines without `Intl.DisplayNames` the app works without country names. On engines without `ResizeObserver` the polyfill measures widths. On engines whose `MediaQueryList` lacks `addEventListener`, the reduced-motion preference is followed through `addListener`.
- MODIFIED: on engines without Pointer Events, a tap on a day track selects the time at the tapped position.
- MODIFIED: on engines without Pointer Events, cards are reordered by dragging the handle with a finger (touch events).
- MODIFIED: the app checks for a new version again when it returns to the screen, at most once per 15 minutes, on every platform. This is a workaround for WebKit bug 199110: iOS never restarts an installed PWA. The existing update notice and update-check failure note are reused.
- MODIFIED: the page declares itself as a home-screen web app for iOS (`apple-mobile-web-app-capable`).
- ADDED: the dialog and its overlay keep their position, and the main page keeps its full height, on engines without the `inset` shorthand and the `dvh` unit.
- MODIFIED: every pull request checks that the built JavaScript parses at the Safari 12 level and that the built CSS has no `inset` shorthand. A unit test checks that production sources contain no BigInt.
- Glossary (`docs/glossary/`): new context `browser-compatibility` with the terms supported engine, legacy engine, legacy support and legacy zone shim; **update recheck** added to the app shell context; **time selection** extended with a tap.
- No storage schema change, no new network calls. The stored list stays ADR-0004 schema version 1.

## Capabilities

### New Capabilities

- `browser-compatibility`: which engines the app supports, and how it starts and degrades on the oldest one (iOS Safari 12.5). Covers conditional polyfills, the BigInt ban, legacy zone names, missing Intl and observer APIs, and CSS fallbacks.

### Modified Capabilities

- `time-selection`: "Select a time on a track" gains selection by tap on engines without Pointer Events.
- `locations`: "Reorder cards by dragging" gains finger drag on engines without Pointer Events.
- `location-search`: "Search by country" matches nothing, and is not an error, on engines without `Intl.DisplayNames`.
- `app-shell`: "New version notice" checks for a new version again when the app returns to the screen.
- `app-delivery`: "Installable PWA" adds the iOS home-screen meta tag. "Checks on every pull request" adds the legacy syntax and CSS checks.

## Impact

- `packages/client/vite.config.ts`: build and CSS targets.
- `packages/client/src/main.tsx` and a new boot module: polyfills load before the app.
- New `src/lib/legacy/` (or similar, see design): feature detection, the polyfill bundle, the `Intl.DateTimeFormat` legacy-zone shim.
- `src/model/timeZoneId.ts`, `dayPeriodStops.ts`, `dayPeriodWindows.ts`: BigInt removed.
- `src/presenter/countryName.ts`, `src/adapters/city-search/zoneCitiesSource.ts`: `Intl.DisplayNames` guarded.
- `src/controller/usePrefersReducedMotion.ts`, `src/controller/usePwaUpdateStatus.ts`.
- `src/views/shared/DayTrack.tsx`, `src/views/shared/LocationList.tsx`.
- `index.html`, `.github/workflows/ci.yml`, `scripts/` (legacy syntax and CSS checks).
- New dependencies: `core-js` (polyfills, loaded only on legacy engines), `@juggle/resize-observer`, a syntax checker for CI (`es-check` or equivalent, decided in design).
- Tests: a new unit BDD feature under `src/test/features/browser_compatibility/`. Existing time-selection, locations and app-shell features gain scenarios.

## Goals

- G1: On iOS Safari 12.5 the app starts and shows the main page with the stored locations, with no uncaught error.
- G2: On iOS Safari 12.5 a user can add a city, select a time by tap, select a date and reorder cards by finger.
- G3: Modern browsers are unaffected. Their initial JavaScript stays within the existing 150 KB gzipped budget, and they download no polyfill at start.
- G4: An installed PWA on any platform finds a new version within one return to the screen, once 15 minutes have passed since the last check.

## Non-Goals

- NG1: Dark theme on iOS 12. iOS 12 has no system dark mode, so `prefers-color-scheme` never matches. A future change adds a theme choice (light / dark / system) to a settings page, which will also give iOS 12 a dark theme.
- NG2: Correct DST rules and zone names from outdated device zone data. A future change ships the app's own time zone database, which updates faster than devices do. That change replaces the legacy-name stopgap of FR4.
- NG3: Cache Storage wiped when Safari closes (iOS 12.0–12.1, PWA-POLICE list). There is no workaround, and the target is 12.5.
- NG4: Smooth dragging along a day track on iOS 12. Only a tap selects there. Possible later change.
- NG5: Country names on iOS 12 (rows, search results, search by country). A later change may bundle CLDR region names at build time.
- NG6: Flexbox `gap` on iOS 12 (Safari < 14.1). Spacing between flex children may collapse. This is accepted until a later change.
- NG7: Focus rings from `:focus-visible` on iOS 12 (Safari < 15.4). Accepted. A keyboard is rare on the target devices.
- NG8: Browsers older than iOS Safari 12.5, and the legacy (`nomodule`) bundle for engines without ES modules.
- NG9: Running automated tests in a real iOS 12 engine. Playwright WebKit cannot emulate it. The final check is manual on the owner's device (see Success Metrics M7).

## Users & Scenarios

- U1: The owner opens the installed app on an iPad mini 2 (iOS 12.5.7). The cards for Almaty, Moscow, Kyiv and New York appear with their times.
- U2: On that iPad the owner taps three quarters of the New York track. Every card shows the time of 18:00 Almaty.
- U3: The owner drags the Kyiv card to the top by its handle with a finger. The page does not scroll during the drag.
- U4: A new version is deployed. The owner switches back to the installed app the next day. The update notice appears, and reload switches to the new version.
- U5: The owner searches "Kyiv" on the iPhone 6 and adds it. The row shows the time without a country name.

## Requirements

### Functional

- FR1: The supported engines are the latest Chrome, Firefox, Edge and Safari, and iOS Safari 12.5. On iOS Safari 12.5 the production build MUST start without a syntax error or a missing built-in, and MUST show the main page.
- FR2: Built-ins missing on a legacy engine MUST be installed before any application module or library runs. An engine that has them all MUST download no polyfill at start.
- FR3: Production code MUST NOT create, read or compare BigInt values at run time. That includes BigInt literals, `BigInt()` and `epochNanoseconds`.
- FR4: When the engine rejects a canonical IANA zone that has a legacy name it accepts, every date and time operation on that zone MUST use the legacy name. This covers adding a location, reading the stored list, local time, date, UTC offset, day track and hour labels. Stored and compared identifiers MUST stay canonical. A zone the engine rejects under every name MUST behave as today's unknown zone.
- FR5: On an engine without `Intl.DisplayNames`, presenting a country MUST yield an empty name and MUST NOT throw. Search by country MUST match nothing. Search by city and abbreviation MUST work as before.
- FR6: On an engine without `ResizeObserver`, container widths MUST be measured by a polyfill, so view selection by width works.
- FR7: On an engine whose `MediaQueryList` lacks `addEventListener`, the reduced-motion preference MUST be read and its changes followed through `addListener` / `removeListener`.
- FR8: On an engine without Pointer Events, a tap on a day track MUST select the time at the tapped position as in "Select a time on a track", with the same rounding and clamping. On engines with Pointer Events, behaviour MUST NOT change.
- FR9: On an engine without Pointer Events, a finger drag on a card's handle MUST reorder the cards as in "Reorder cards by dragging". The page MUST NOT scroll during the drag. On engines with Pointer Events, sensors MUST NOT change.
- FR10: When the page becomes visible again and at least 15 minutes have passed since the last update check, the app MUST check for a new version. A found version MUST show the existing update notice. A failed check MUST show the existing update-check failure note. Checks MUST NOT run while the page is hidden.
- FR11: The page head MUST contain `<meta name="apple-mobile-web-app-capable" content="yes">`.
- FR12: The built CSS MUST express every `inset` utility through `top`, `right`, `bottom` and `left`. Every `dvh` height MUST be preceded by a `vh` fallback, so the dialog, its overlay and the main page keep their layout on iOS 12.
- FR13: Every pull request MUST fail when the built JavaScript does not parse at the Safari 12 level (including regular-expression lookbehind), when the built CSS contains an `inset` shorthand, or when production sources contain BigInt.

### Non-Functional

#### Performance

- NFR-P1: The initial JavaScript of the modern build stays within 150 KB gzipped (140.0 KB before this change). Polyfills are a separate chunk and are not part of the initial JavaScript.
- NFR-P2: On engines with every built-in, the boot step makes no extra network request before the app starts, apart from chunks the browser already preloads.

#### Accessibility

- NFR-A1: axe-core reports no new violations on the main page and the search dialog in modern browsers.
- NFR-A2: The tap-to-select fallback keeps the slider's role, name, value and keys unchanged (`time-selection` "Accessible day tracks").

#### Responsive

- NFR-R1: The approved screenshot baselines in `chromium` and `mobile-chrome` pass unchanged. The legacy fallbacks have no visible effect in modern browsers.

## UX Acceptance Criteria

- UX1: On iOS 12, a tap anywhere on a track moves the handle to the tapped position within the same render. No long press is needed.
- UX2: On iOS 12, a card drag starts from the handle after a short hold, so a swipe over the handle that starts scrolling still scrolls the page.
- UX3: Missing country names leave no empty separator or placeholder in rows and search results.

## UI States Matrix

| Network | Data | UI |
|---|---|---|
| any | modern engine | unchanged |
| any | iOS 12.5, list with locations | rows with time, date, offset and track; no country names (FR5) |
| any | iOS 12.5, stored zone renamed after the device's zone data (`Europe/Kyiv`) | row works through the legacy name (FR4) |
| any | iOS 12.5, zone unknown under every name | today's unknown-zone row |
| any | iOS 12.5, no locations | empty state unchanged |
| online | page visible again after ≥ 15 min, new version | update notice (FR10) |
| offline | page visible again after ≥ 15 min | update-check failure note, as today (FR10) |
| any | iOS 12.5, storage unavailable | today's warning; everything else works |
| offline | iOS 12.5, installed, cache intact | app opens offline; Cache Storage loss is NG3 |

## Behavior

Feature files tagged `@support-legacy-ios-12-safari`:

- `src/test/features/browser_compatibility/browser_compatibility_legacy_engine.feature` (vitest-cucumber): polyfills installed only when missing, legacy zone names, missing `Intl.DisplayNames`, `ResizeObserver` and `addEventListener` on `MediaQueryList`, no BigInt in sources.
- New scenarios in `time_selection_select_time.feature` (tap without Pointer Events), the locations reorder feature (finger drag without Pointer Events), and the app-shell update feature (check on return to the screen).
- The build checks (FR12, FR13) run as CI scripts. Their behaviour is covered by unit tests of the scripts.

## Visual Reference

No new screens. The approved screens in `docs/design/screens/` remain the reference for modern browsers. On iOS 12 the accepted visual differences are NG1, NG5, NG6 and NG7.

## Affected IA

No changes (no IA documents exist under `docs/ia/`).

## Success Metrics

- M1: 100% of FR1–FR13, NFR-P1, NFR-P2, NFR-A1, NFR-A2, NFR-R1 and UX1–UX3 have at least one automated test or CI check that names `support-legacy-ios-12-safari` together with the id. The exception is FR1 on a real device (M7).
- M2: The CI syntax check passes on `dist/assets/*.js` at the Safari 12 level, and the CSS check finds 0 `inset:` declarations in `dist/assets/*.css`.
- M3: With `Europe/Kyiv` rejected and `Europe/Kiev` accepted by the stubbed engine, adding Kyiv succeeds, the stored id is `Europe/Kyiv`, and the row shows the same time and offset as `Europe/Kiev` at `2026-03-08T07:30:00Z` (`09:30`, `UTC+2`).
- M4: With `Intl.DisplayNames`, `ResizeObserver` and `MediaQueryList.addEventListener` removed from the test environment, the main page renders with 0 uncaught errors (3 of 3 cases).
- M5: Initial JS of the modern build ≤ 150 KB gzipped. On an engine with every built-in, 0 requests for the polyfill chunk.
- M6: Mutation score of the new or changed code ≥ 95% (minimum 90%).
- M7: Manual acceptance on the owner's iOS 12.5.7 device. This is the one check that cannot be automated (NG9). The app starts, U1–U5 pass, and the Web Inspector console shows 0 errors.

## Open Questions

- Q1: Interval between update checks on return. Decided: 15 minutes (FR10). That is often enough for daily use without a request on every app switch.
- Q2: Does `temporal-polyfill` accept a legacy zone name and keep it, or normalize it through `resolvedOptions()`? This decides whether FR4 can be a pure `Intl.DateTimeFormat` shim. Answered by the spike in tasks (design D3).
- Q3: Which minimum hold starts a finger drag (UX2)? Proposed: dnd-kit's typical 250 ms delay with 5 px tolerance. To be confirmed on the device.
