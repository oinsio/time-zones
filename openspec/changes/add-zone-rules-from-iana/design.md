# Design: Add zone rules from IANA

## Context

Driven by FR1–FR10, NFR-P1–P3, UX1 of `proposal.md` and by ADR-0014, which fixes the global decisions: own rules as the only source, the POSIX future rule evaluated rather than expanded, one `Intl.DateTimeFormat` wrapper installed at boot on every engine, a release compiled by the project from IANA and committed. This design settles how those decisions land in this repository. Current state, checked in `packages/client/`:

- `src/boot.ts` calls `bootApp({ needsLegacySupport, loadLegacySupport, loadApp })` (`src/lib/legacy/bootApp.ts`). `installLegacySupport.ts` installs the legacy zone shim when `isZoneDataOutdated()` (a probe with `LEGACY_ZONE_PROBE_ID = "Europe/Kyiv"`, `src/constants/legacy.ts`) is true; `needsLegacySupport()` also returns true on that probe. `lib/legacy/` imports nothing that evaluates `temporal-polyfill`, and `bootApp.test.ts` scans its files for static imports of `@/lib/temporal`, `temporal-polyfill`, `react` and `./main`.
- `temporal-polyfill` 0.3.2 keeps the `Intl.DateTimeFormat` it sees when it is evaluated, reads offsets through `formatToParts`, canonicalizes ids through `resolvedOptions().timeZone`, and upper-cases the id before constructing (spike of `support-legacy-ios-12-safari`, noted in `src/lib/legacy/zoneShim.ts`). Vitest inlines it (`test.server.deps.inline`), so `vi.resetModules()` re-evaluates it. Task 1.2 records exactly what it asks.
- The presenter builds its own formatters with `timeZone` (`src/presenter/dateTimeFormatters.ts`, one cached formatter per language, zone, kind and hour format; `src/presenter/hourStrip.ts` reads parts). A wrapper that only the polyfill saw would make Temporal and the presenter disagree.
- `canonicalizeTimeZoneId` (`src/model/timeZoneId.ts`) accepts a zone when `Temporal.Instant#toZonedDateTimeISO(id)` succeeds and maps `.timeZoneId` through `virtual:time-zone-aliases` (CLDR, `scripts/zoneData/`). `zoneCitiesSource.ts` lists zones through `listBrowserTimeZones` (`Intl.supportedValuesOf("timeZone")` when available).
- `scripts/zoneData/zoneDataPlugin.ts` builds `virtual:zone-abbreviations` from `moment-timezone` periods (`readTzdbZonePeriods`, `ZONE_ABBREVIATIONS_PACKAGE`, `TzdbZone`) through `extractZoneAbbreviations(zoneIds, readZonePeriods)` with `ZonePeriod = { designation, utcOffsetMinutes, untilEpochMilliseconds }`, `ZONE_ABBREVIATION_RULES_YEAR = 2026` and `LETTERS_ONLY_DESIGNATION` (all in `extractZoneAbbreviations.ts`, which imports `../../src/lib/temporal.ts` by path).
- `scripts/check-bundle-size.mjs` counts the entry script and `modulepreload` links against 150 KB and checks the `city-search-*.json` asset against its own 30 KB budget without a preload. Workbox precaches `**/*.{js,mjs,css,html,ico,png,svg,json,woff2}` (`vite.config.ts`).
- Node 26 (`engines`) runs `.ts` files directly; `scripts/check-bench-budgets.mjs` already imports `./benchBudgets.ts`. `tsconfig.node.json` type-checks `scripts/` with `lib: ["ES2023"]` and no `paths`, so `@/` does not resolve there; `src/constants/index.ts` imports `@/preferences`. `tsconfig.app.json` has `lib: ["ES2020", "ES2022.Intl", "DOM", "DOM.Iterable"]`, which declares `formatToParts` and `supportedValuesOf` but not `formatRange` (ES2021.Intl).
- Tests: Vitest collects `src/**/*.{test,steps}.{ts,tsx}`; `src/test/setup.ts` imports `@/lib/temporal` (so the polyfill is evaluated by the setup). Work bounds use `src/test/workCounters.ts` (a `Proxy` over the global `Intl.DateTimeFormat`, ADR-0008). Stryker's default `mutate` covers `src/` only; `--mutate` names `scripts/` files explicitly.
- `zic`, `zdump` and `gpg` exist in the sandbox (Ubuntu 24.04) and on `ubuntu-latest`; `data.iana.org` is reachable. The key `scripts/zoneRules/tz-coordinator-key.asc` is committed.
- The glossary already owns **clock change** (`ClockChange`, `getClockChanges`, `findOffsetTransitions`, time context), **unknown zone**, **legacy zone name**, **legacy engine**, **legacy support** and **legacy zone shim**.

Measured while writing this change (release `2026f`, `zic -b slim` of the nine source files): 597 TZif files; written in full without link entries the D1 document is 144 959 bytes, 20 070 bytes gzipped. America/New_York lists 15 changes after the cutoff, the last on 2007-03-11; Asia/Almaty ends with `2024-02-29T18:00:00Z` to `+05`; Europe/Dublin and Europe/Kyiv list none after the cutoff; Ciudad Juárez's footer is `MST7MDT,M3.2.0,M11.1.0`.

## Goals / Non-Goals

**Goals:** one module owns every zone fact (`src/lib/zoneRules/`); everything above it (Temporal, presenter, model) is untouched except where it asked the engine for zone facts; the release is data in the repository with a reproducible compiler and an independent oracle (`zdump`); every RFC 9636 pitfall is a named test.

**Non-Goals:** fetching or storing a newer release at run time (the companion change); a pre-2000 history; a `Temporal.TimeZone`-like API of our own.

## Decision

### D1. Release format: JSON, one entry per zone, links by name (FR2, NFR-P1)

`zone-rules/release.json` (committed, under `packages/client/`), with `zone-rules/README.md` recording the release, the key and the commands:

```
{ "release": "2026f", "cutoff": 946684800,
  "zones": {
    "America/New_York": { "types": [[-18000,"EST",0],[-14400,"EDT",1]], "cutoffType": 0,
                          "changes": [[7974000,1],[...]], "futureRule": "EST5EDT,M3.2.0,M11.1.0" },
    "US/Eastern": "America/New_York" } }
```

- `types`: local time types `[utcOffsetSeconds, designation, isDst]`; `cutoffType` indexes it. `changes`: clock changes after the cutoff as `[secondsSinceCutoff, typeIndex]`, ascending. `futureRule`: the TZif footer, `""` when empty. A link is its target's id (a string); the reader shares the target's rules object under the link's own name.
- JSON rather than a packed string: readable in the diff of a release bump, parsed by the platform, and gzip removes most of the repetition (20 KB measured, above). If task 1.1 measures more than 30 KB, `changes` becomes a base-36 string of deltas and `types` a shared table (D1-compact), with no change to the reader's interface.
- The reader (`src/lib/zoneRules/zoneRulesRelease.ts`) validates the shape (every type index in range, `changes` ascending, cutoff equal to `ZONE_RULES_CUTOFF_EPOCH_SECONDS`, every link target present) and returns `ZoneRulesRelease` or a typed `ZoneRulesReleaseError`, never a throw into the boot.

### D2. Asset delivery with a preload, outside the initial JavaScript (FR10, NFR-P1, NFR-P2)

A Vite plugin `scripts/zoneRules/zoneRulesPlugin.ts` (registered in `vite.config.ts` and `vitest.config.ts`, like `zoneDataPlugin`) serves `virtual:zone-rules-url` (in a build: `emitFile` of `zone-rules-<hash>.json`; in dev: a middleware path) and `virtual:zone-rules` (the parsed document, test mode only, as `virtual:zone-cities` is). Its `transformIndexHtml` adds `<link rel="preload" as="fetch" crossorigin href="…">` for the asset (the pure transform is `scripts/zoneRules/addZoneRulesPreload.ts`). `check-bundle-size.mjs` gains the asset check: present, at most `ZONE_RULES_ASSET_BUDGET_KB` gzipped (`app.config.ts`, set by task 1.1), one `preload` link and no `modulepreload` for it. Workbox precaches it through the existing `json` glob, which gives the offline start.

### D3. Boot: rules load between legacy support and the app (FR6, FR10)

`BootAppSteps` gains `loadZoneRules: () => Promise<unknown>`, run after legacy support (polyfills first, so `fetch` and `Promise` behave the same on every engine) and before `loadApp`. `src/boot.ts` imports `virtual:zone-rules-url` and passes `() => loadZoneRules(zoneRulesUrl)`. `loadZoneRules(releaseUrl, fetchRelease = fetch)` (`src/lib/zoneRules/loadZoneRules.ts`) fetches, parses with the reader and calls `installZoneRulesDateTimeFormat(release)`; a failed request or an invalid document rejects. `bootApp` catches the rejection like a failed legacy load: `console.error`, then the app starts with the engine's data (FR10). This is a boot step outside the layers, like the legacy chunk load; the model, presenter and controller never see the fetch. `lib/zoneRules/` must not import `@/lib/temporal`, `temporal-polyfill`, React or app modules: the source scan of `bootApp.test.ts` is extended to `src/lib/zoneRules/*.ts`.

### D4. Lookup and future rule in `src/lib/zoneRules/` (FR3, FR4, NFR-P3)

- `localTimeType.ts`: `getLocalTimeType(zoneRules, epochSeconds)`: before the cutoff the cutoff type; otherwise binary search over `changes` for the latest change at or before the instant, the cutoff type before the first; after the last change (or when there is none) the future rule, when present, else the last type.
- `futureRule.ts`: `parseFutureRule(text)` → `FutureRule = { standard: { designation, offsetSeconds }, daylight?: { designation, offsetSeconds, start: RuleDate, end: RuleDate } }`, `RuleDate = { kind: RuleDateKind, …, timeSeconds }`. It accepts angle-bracket designations, signed `hh[:mm[:ss]]` offsets, the default daylight offset (standard + 1 h), a missing `,rule` (standard only), the default time 02:00:00 and times from −167:59:59 to 167:59:59; it rejects a designation shorter than three characters and an hour above 167. POSIX offsets are negated into east-positive seconds here, in one place.
- `futureRuleOffset.ts`: `resolveFutureRule(rule, epochSeconds)` → `LocalTimeType`: the two transition instants of the instant's UTC year and of both neighbouring years (an hour outside 0–24 or a negative-DST rule moves a transition across a year boundary), each as "local wall time in the type in force before it" converted to UTC, then the type by position between them. A daylight interval covering the whole year (`0/0,J365/25`) resolves to daylight. Per (rule, year) the instants are memoized on the parsed rule.
- Calendar arithmetic here is integer arithmetic on epoch days (days from civil date, weekday from epoch day, leap years), not Temporal and not `Date`: this module runs before `temporal-polyfill` is evaluated and is the source Temporal itself reads. This is a local exception to `.claude/rules/temporal.md` ("Date/time math: Temporal API only"); handoff H2 records it in that rule.
- The truncation of the compiler (D7) and the wrapper use the same `resolveFutureRule`, so the cutoff type of a zone whose listed changes end before the cutoff (Europe/Dublin: `GMT`, daylight flag set) comes from this owner.

### D5. The wrapper: compute in UTC, shift by the rules (FR1, FR6, NFR-P3)

`src/lib/zoneRules/dateTimeFormatWrapper.ts`: `createZoneRulesDateTimeFormat(nativeDateTimeFormat, release)` returns a constructor; `installZoneRulesDateTimeFormat(release)` assigns it to `Intl.DateTimeFormat`, keeping `prototype`, `supportedLocalesOf` and `instanceof`; `getKnownZoneIds()` and `getInstalledRelease()` read the installed release.

- Construction: when `options.timeZone` names a zone of the release (matched case-insensitively, since the polyfill upper-cases ids), the instance keeps the zone's rules and the id in the release's spelling, and builds exactly one native formatter with the same options and `timeZone: "UTC"`. Otherwise it returns a native instance unchanged (fall-through, FR6). A link keeps its own name: `Europe/Oslo` stays `Europe/Oslo`, never `Europe/Berlin`.
- `formatToParts(date)`: the instant (a `Date` or a number) is shifted by the offset of its local time type and passed to the native UTC formatter. When `timeZoneName` was requested, the native puts a `timeZoneName` part where the locale wants it; the wrapper replaces its value with the designation when it matches `LETTERS_ONLY_DESIGNATION`, else `GMT±H[:MM]` from the offset (`GMT_ZONE_NAME_PREFIX`). `format(date)` joins those parts. `formatRange` / `formatRangeToParts` shift both ends and exist only when the native prototype has them (not on Safari 12); `tsconfig.app.json` gains `ES2021.Intl` to type them. `resolvedOptions()` is the native result with `timeZone` set to the instance's id.
- An absent date: the wrapper never calls `Date.now()` (forbidden by `.claude/rules/temporal.md`). It reads the current instant from one module-level native UTC formatter (all fields to the second plus `fractionalSecondDigits: 3`, built on first use from the native constructor) through `formatToParts()` with no argument, as the native itself would, and turns those parts into epoch milliseconds with the D4 day arithmetic.
- `LETTERS_ONLY_DESIGNATION` moves to `src/constants/zoneAbbreviations.ts`, its one owner, used by the wrapper and by `extractZoneAbbreviations.ts`.
- The polyfill's own needs: its parts request has no `timeZoneName`; its canonicalization reads `resolvedOptions().timeZone`; `Temporal.Now.timeZoneId()` constructs without `timeZone`, which falls through to the native (device zone, ADR-0007).
- Work bounds: one native formatter per wrapper instance, so the presenter's cache builds the same number as before; one native `formatToParts` per wrapper call; the work counters wrap the global after the install, so they count wrapper constructions as they counted native ones.

### D6. Known zones and the search list read the installed release (FR5, FR9)

- `canonicalizeTimeZoneId` keeps its logic: `toZonedDateTimeISO(id)` now succeeds for every release id through the wrapper and gives the requested id in release spelling; legacy names (`Europe/Kiev`, `Asia/Calcutta`) still become canonical through `virtual:time-zone-aliases`, the existing owner of **legacy zone name**. A name in neither throws in the native and stays unknown.
- `zoneCitiesSource.ts` replaces `listBrowserTimeZones` with `getKnownZoneIds()` from `@/lib/zoneRules` (`undefined` when no release is installed, keeping today's "offer every CLDR record" behaviour). No new asset: the ids are already in memory.

### D7. Compiler and check in `scripts/zoneRules/` (FR7, FR8)

Modules with the process runner and `fetch` injected, each tested from `src/test/zoneRules/`:

- `signing.ts`: `TZ_COORDINATOR_KEY_FILE = "scripts/zoneRules/tz-coordinator-key.asc"`, `TZ_COORDINATOR_KEY_FINGERPRINT = "7E3792A9D8ACF7D633BC1588ED97E90E62AA7E34"`, `TZ_COORDINATOR_KEY_EXPIRES = "2031-07-24"`.
- `downloadRelease.ts`: `IANA_RELEASES_URL = "https://data.iana.org/time-zones/releases/"` + `tzdata<release>.tar.gz` and `.asc`, by Node `fetch` (no proxy code: the sandbox sets `NODE_USE_ENV_PROXY=1`), into a temporary directory. Never `-latest`.
- `verifySignature.ts`: every `gpg` call runs with `GNUPGHOME` set to a new temporary directory (the home directory is not writable): `gpg --batch --import <key>`, then `gpg --batch --status-fd 1 --verify <asc> <archive>`. It reads the `[GNUPG:] VALIDSIG` line; its last field, the primary key fingerprint, must equal `TZ_COORDINATOR_KEY_FINGERPRINT`. No `VALIDSIG` is a failed signature; another fingerprint stops with both. The temporary directory is removed afterwards.
- `compileWithZic.ts`: `tar -xzf`, read `version`, compare with the requested name, then `zic -b slim -d <out> <TZDATA_SOURCE_FILES>` (`africa antarctica asia australasia europe northamerica southamerica etcetera backward`). Link names come from the `Link` lines of those files.
- `readTzif.ts`: RFC 9636 §3: magic, version, the version-1 block skipped, the 64-bit header and block (transition times read as two 32-bit halves into a double, no BigInt), type indices, `ttinfo` entries, designations, the footer line. Version 1 files are rejected.
- `truncateToCutoff.ts`: drops changes at or before `ZONE_RULES_CUTOFF_EPOCH_SECONDS`; the cutoff type is the type of the latest listed transition at or before the cutoff when a listed transition follows the cutoff, otherwise the type `resolveFutureRule` gives at the cutoff (or the last type when the footer is empty); drops unused types and re-indexes.
- `writeRelease.ts`: the D1 document with link entries; `compile.ts` is the CLI (`pnpm --filter @time-zones/client zone-rules:compile 2026f`, script `node scripts/zoneRules/compile.ts`).
- `checkAgainstZdump.ts` and the CLI `check.ts`: reads the committed release, downloads, verifies and compiles the release it names (or takes `--compiled <dir>`), runs `zdump -v -c 2000,2041 <absolute path of each compiled file>` (an absolute path, so the system's own zoneinfo is never read), skips the `NULL` lines, parses each line into (instant, offset, designation) and compares it with `getLocalTimeType` of the committed release; the first difference is reported with zone and instant, else `0 differences`. Script `zone-rules:check`. The CI step is handoff H1.

### D8. Abbreviation table from the release (FR9)

`zoneDataPlugin.ts` replaces `readTzdbZonePeriods` with `readReleaseZonePeriods(release, zoneId)` (`scripts/zoneRules/releaseZonePeriods.ts`): the cutoff type until the first change, each change until the next, and, for a zone with a future rule, the periods of `ZONE_ABBREVIATION_RULES_YEAR` and the next year from `resolveFutureRule`. `extractZoneAbbreviations` and `ZonePeriod` stay. Before the swap the current table is saved as `src/test/zoneRules/fixtures/zone-abbreviations.before.json`; the test compares it with the new table, and every difference must appear in `zone-abbreviations.changes.json` with the IANA release whose note changed that zone's designations (zones new in `2026f` are additions, not differences). `moment-timezone`, `ZONE_ABBREVIATIONS_PACKAGE` and `TzdbZone` go.

### D9. Legacy zone shim removed (FR5)

Deleted: `src/lib/legacy/zoneShim.ts`, `zoneShim.test.ts`, `zoneShim.temporal.test.ts`, `zoneShim.errors.test.ts`, `src/constants/legacy.ts` (and its re-export in `src/constants/index.ts`), `isZoneDataOutdated`, and the shim exports (`LegacyZoneNames`, `createLegacyZoneDateTimeFormat`) of `src/lib/legacy/index.ts`. `needsLegacySupport` keeps the `Array#at` and `ResizeObserver` checks; `installLegacySupport.ts` installs polyfills and `ResizeObserver` only, and `installLegacySupport.test.ts` loses its two zone-shim cases. `src/model/reduceWallTime.legacy.test.ts` is rewritten over the stale-engine fake and the wrapper. `browser_compatibility_legacy_zones.feature` keeps "Zone checks work without BigInt" and loses the renamed-zone scenarios, which move to `zone_rules_known_zones.feature`.

### D10. Testing on the rules, and a stale engine without one (NG6)

- `src/test/setup.ts` first imports `src/test/installZoneRules.ts`, which installs the wrapper over the real native constructor with `virtual:zone-rules` before `@/lib/temporal` is evaluated, so every unit test runs on the committed rules like the app.
- A fake native `Intl.DateTimeFormat` (`src/test/fakeStaleDateTimeFormat.ts`) delegates to the real constructor, but for `Asia/Almaty` substitutes `Etc/GMT-6` (its parts say UTC+6) and throws `RangeError` for `America/Ciudad_Juarez` and `Europe/Kyiv`. Steps install it, call `installZoneRulesDateTimeFormat` over it, `vi.resetModules()` and import `@/lib/temporal`, `@/model` and `@/presenter` fresh. Each such scenario asserts that the fake was asked for `Asia/Almaty` zero times after the install, so a bypassed wrapper fails the test. Browser behaviour (preload, offline start, axe, screenshots) runs in playwright-bdd on Chromium.

### D11. One module loaded by Vite and by Node

`src/lib/zoneRules/` is read by the app and by Node-run scripts (`truncateToCutoff.ts`, `releaseZonePeriods.ts`, `checkAgainstZdump.ts`). So its files use relative imports with the `.ts` extension, import their constants by path (`../../constants/zoneRules.ts`, `../../constants/zoneAbbreviations.ts`, both free of imports), and import no virtual module; scripts import `../../src/lib/zoneRules/index.ts`. This follows `extractZoneAbbreviations.ts`, which imports `../../src/lib/temporal.ts` by path, because `@/` and the constants index do not resolve outside Vite.

## Consequences

Positive:

- Every zone fact has one owner (`src/lib/zoneRules/`); Temporal, the presenter, the model and the search read the same release, so the same instant never shows two times (UX1).
- The release is data in the repository with an independent oracle (`zdump`), so a release bump is a reviewable diff.
- The legacy zone shim, its probe and `moment-timezone` go away; the legacy engine is defined by built-ins only.
- Unit tests run on the committed rules, not on the ICU of the machine.

Negative (risks, each with its mitigation):

- [The asset is larger than the 30 KB ceiling] → D1-compact; measured at 20 KB before link entries.
- [The polyfill asks the formatter for something the wrapper does not model] → task 1.2 records every option and method with a logging fake; the test fails on a polyfill upgrade that asks for more.
- [An hour outside 0–24 or a negative-DST rule moves a transition into the neighbouring UTC year] → D4 evaluates three years; the Dublin, Nuuk and Sydney fixtures cover it.
- [`zdump` output differs between Linux and macOS] → the parser is tested on fixtures of both formats.
- [A wrong committed release] → the check runs on the committed file (H1 puts it in CI); a failing bump cannot merge.
- [`gpg` missing on a developer machine] → the compiler stops with the install hint; day-to-day development never runs the compiler.
- [Installing the wrapper in the test setup changes expectations that leaned on the machine's ICU] → the full suite runs in task 10.1; a changed expectation is fixed to the `2026f` value, never by removing the install.
- [Boot adds one fetch before the app] → preloaded, precached, about 20 KB gzipped.

## Alternatives Considered

**D1 — JSON release format.** The packed pipe-delimited string of `moment-timezone`: smaller before gzip, unreadable in a release diff, and a second parser. Rejected unless the spike exceeds 30 KB. The FormatJS tz data: fat-expanded to 2100, 193 KB gzipped. Rejected.

**D2 — Asset outside the initial JavaScript.** Inlining the release into the entry chunk spends the 150 KB budget on data in every browser. Rejected. A lazy load after the first render: the polyfill memoizes zone objects for the page's life, so rows would freeze on the engine's data. Rejected.

**D3 — Boot step.** Loading the rules inside `main.tsx`: `temporal-polyfill` is evaluated by then. Rejected. Top-level `await` in the entry: unsupported before Safari 15 (ADR-0009). Rejected.

**D4 — Evaluated future rule.** `zic -b fat` to a horizon: a file with a shelf life (ADR-0014). Rejected. Temporal for the day arithmetic: not evaluated yet at that point, and circular. Rejected.

**D5 — Global wrapper.** A wrapper only the polyfill sees: the presenter's formatters would disagree with Temporal. Rejected. Resolving links to their targets in `resolvedOptions`: stored zones would change (`Europe/Oslo` → `Europe/Berlin`). Rejected. `@formatjs/intl-datetimeformat` `polyfill-force`: 150–220 KB gzipped. Rejected.

**D6 — Known zones.** A separate zone-list asset for search: a second download for data already in memory. Rejected.

**D7 — Own compiler on `zic`.** `@tubular/time-tzdb`: a proprietary future-rule format, no signature check. Rejected. The `tzdata` npm package or `moment-timezone` data: a third party between IANA and the app. Rejected. Node's ICU as the oracle: may ship another release. Rejected.

**D8 — Abbreviations from the release.** Reading the designation at the instant in `getZoneAbbreviation`: changes the pair semantics the spec requires. Deferred.

**D9 — Removing the shim.** Keeping it behind the wrapper: a second owner of "which zones exist". Rejected.

**D10 — Stale-engine fake.** A real iOS 12 runner: none exists for Playwright (NG6). Rejected.

## Migration Plan

No stored data changes. Deploying is the normal `main` deploy; the release asset ships with the build. Rollback is reverting the change; stored ids were canonical before and stay canonical.

## Open Questions

- The exact `ZONE_RULES_ASSET_BUDGET_KB` (Q1 of the proposal) is the measured size of the written release plus 20 %, rounded up, in `app.config.ts`; it changes no spec text.

## Sources

- RFC 9636, The Time Zone Information Format (TZif): https://www.rfc-editor.org/rfc/rfc9636.html (footer §3.3, reader pitfalls, extensions)
- `zic(8)` and the slim default: https://data.iana.org/time-zones/tz-link.html, https://mm.icann.org/pipermail/tz/2020-June/029125.html
- Transition hours −167..167 in real footers (Nuuk, Scoresbysund): https://github.com/HowardHinnant/date/pull/941
- DST lost after 2037 when the footer is ignored: https://github.com/frostney/GocciaScript/issues/1724
- CPython `zoneinfo` footer handling: https://chromium.googlesource.com/external/github.com/python/cpython/+/bc8cf07d8dbb4341955dc85d9b2bf273ec5852c7/Lib/zoneinfo/_zoneinfo.py
- `-latest` link and `version` file lag: https://lists.iana.org/hyperkitty/list/tz@iana.org/thread/NVHSX2PAQIT44U5FCCEVNJJYXQMMTJSA/
- `@formatjs/intl-datetimeformat`: https://formatjs.github.io/docs/polyfills/intl-datetimeformat/
- Android Time Zone Data module: https://source.android.com/docs/core/ota/modular-system/timezone
