# Design: Add zone rules from IANA

## Context

Driven by FR1–FR10, NFR-P1–P3, UX1 of `proposal.md` (see proposal.md — Why) and by ADR-0014, which fixes the global decisions: own rules as the only source, the POSIX future rule evaluated rather than expanded, one `Intl.DateTimeFormat` wrapper installed at boot on every engine, a release compiled by the project from IANA and committed. This design settles how those decisions land in this repository. Current state, checked in `packages/client/`:

- `src/boot.ts` calls `bootApp({ needsLegacySupport, loadLegacySupport, loadApp })` (`src/lib/legacy/bootApp.ts`). `installLegacySupport.ts` installs the legacy zone shim when `isZoneDataOutdated()` (a probe with `LEGACY_ZONE_PROBE_ID = "Europe/Kyiv"`, `src/constants/legacy.ts`) is true. `lib/legacy/` imports nothing that evaluates `temporal-polyfill`, which keeps the `Intl.DateTimeFormat` it sees at evaluation (confirmed by the spike of `support-legacy-ios-12-safari`; `temporal-polyfill` is inlined in Vitest through `test.server.deps.inline`).
- `temporal-polyfill` 0.3.2 reads offsets through `formatToParts` of a formatter built with `{ timeZone, hourCycle: "h23", era, year, month, day, hour, minute, second }` (its `hashIntlFormatParts`), canonicalizes ids through `resolvedOptions().timeZone`, and upper-cases the id before constructing (noted in `src/lib/legacy/zoneShim.ts`). It memoizes one zone object per id for the life of the page.
- The presenter builds its own formatters with `timeZone` (`src/presenter/dateTimeFormatters.ts`, one cached formatter per language, zone, kind and hour format; `src/presenter/hourStrip.ts` reads parts). So a wrapper that only the polyfill saw would make Temporal and the presenter disagree.
- `canonicalizeTimeZoneId` (`src/model/timeZoneId.ts`) accepts a zone when `Temporal.Instant#toZonedDateTimeISO(id)` succeeds and maps `.timeZoneId` through `virtual:time-zone-aliases` (CLDR, `scripts/zoneData/`). `zoneCitiesSource.ts` filters the CLDR exemplar cities by `Intl.supportedValuesOf("timeZone")` when available.
- `scripts/zoneData/zoneDataPlugin.ts` builds `virtual:zone-abbreviations` from `moment-timezone` zone periods (`readTzdbZonePeriods`) through `extractZoneAbbreviations(zoneIds, readZonePeriods)` with `ZonePeriod = { designation, utcOffsetMinutes, untilEpochMilliseconds }` and `ZONE_ABBREVIATION_RULES_YEAR = 2026`, and owns `LETTERS_ONLY_DESIGNATION`. `moment-timezone` is a dev dependency in `package.json` and the lockfile. `extractZoneAbbreviations.ts` imports `../../src/lib/temporal.ts`, so nothing in the boot graph may import it.
- `.nvmrc` pins Node 26, which runs TypeScript files directly: `check-bundle-size.mjs` already imports `../app.config.ts`.
- Besides `zoneShim.test.ts` and `zoneShim.temporal.test.ts`, the shim is used by `zoneShim.errors.test.ts`, `src/model/reduceWallTime.legacy.test.ts` and `installLegacySupport.test.ts`; `src/lib/legacy/index.ts` exports `createLegacyZoneDateTimeFormat` and `LegacyZoneNames`.
- `scripts/check-bundle-size.mjs` counts the entry script and `modulepreload` links against 150 KB and checks the `city-search-*.json` asset against its own 30 KB budget without a preload. Workbox precaches `**/*.{js,mjs,css,html,ico,png,svg,json,woff2}`.
- Tests: Vitest collects `src/**/*.{test,steps}.{ts,tsx}`; `scripts/` modules are tested from `src/test/`. Work bounds use `src/test/workCounters.ts` (a Proxy over the global `Intl.DateTimeFormat`, ADR-0008). `zic` and `zdump` exist on macOS (`/usr/sbin`) and on `ubuntu-latest`.
- The glossary already owns **clock change** (`ClockChange`, `getClockChanges`, `findOffsetTransitions`, time context), **unknown zone**, **legacy zone name**, **legacy engine** and **legacy zone shim**.

## Goals / Non-Goals

**Goals:** one module owns every zone fact (`src/lib/zoneRules/`); everything above it (Temporal, presenter, model) is untouched except where it asked the engine for zone facts; the release is data in the repository with a reproducible compiler and an independent oracle (`zdump`); every RFC 9636 pitfall is a named test.

**Non-Goals:** fetching or storing a newer release at run time (the companion change); a pre-2000 history; a `Temporal.TimeZone`-like API of our own.

## Decision

### D1. Release format: JSON, one entry per zone, links by name (FR2, NFR-P1)

`zone-rules/release.json` (committed, under `packages/client/`):

```
{ "release": "2026c", "cutoff": 946684800,
  "zones": {
    "America/New_York": { "types": [[-18000,"EST",0],[-14400,"EDT",1]], "cutoffType": 0,
                          "changes": [[7822800,1],[...]], "futureRule": "EST5EDT,M3.2.0,M11.1.0" },
    "US/Eastern": "America/New_York" } }
```

- `types`: local time types `[utcOffsetSeconds, designation, isDst]`; `cutoffType` indexes it. `changes`: clock changes after the cutoff as `[secondsSinceCutoff, typeIndex]`, ascending. `futureRule`: the TZif footer, `""` when none. A link is the target's id (a string), resolved at load.
- Why JSON over a packed string: readable in review diffs of a release bump, parsed by the platform, and gzip removes most of the repetition. The spike (task 1.1) measures the gzipped size with the cutoff 2000; the estimate is 15–25 KB for about 600 ids. If it exceeds 30 KB, `changes` switches to a base-36 string of deltas and `types` to a shared table (D1-compact), with no change to the reader's interface.
- The reader (`src/lib/zoneRules/zoneRulesRelease.ts`) validates the shape (every type index in range, `changes` ascending, cutoff equal to `ZONE_RULES_CUTOFF_EPOCH_SECONDS`) and returns `ZoneRulesRelease` with resolved links. An invalid document is a typed error, never a throw into the boot.

### D2. Asset delivery with a preload, outside the initial JavaScript (FR10, NFR-P1, NFR-P2)

A Vite plugin `scripts/zoneRules/zoneRulesPlugin.ts` (registered in `vite.config.ts` and `vitest.config.ts`, like `zoneDataPlugin`) serves two virtual modules: `virtual:zone-rules-url` (in a build: `emitFile` of `zone-rules-<hash>.json`, `import.meta.ROLLUP_FILE_URL_…`; in dev: a middleware path) and `virtual:zone-rules` (the parsed release, Vitest mode only, as `virtual:zone-cities` is). Its `transformIndexHtml` adds `<link rel="preload" as="fetch" crossorigin href="…">` for the asset, so the browser fetches it with the first chunks (NFR-P2). `check-bundle-size.mjs` gains the asset check: present, at most `ZONE_RULES_ASSET_BUDGET_KB` gzipped (`app.config.ts`, set by the spike), and not a `modulepreload` (so it is never counted as initial JavaScript). Workbox precaches it through the existing `json` glob, which gives the offline start.

### D3. Boot: rules load between legacy support and the app (FR6, FR10)

`bootApp` gains a step: `loadZoneRules: () => Promise<unknown>` run after `loadLegacySupport` (polyfills first, so `fetch` and `Promise` behave the same on every engine) and before `loadApp`. `src/lib/zoneRules/loadZoneRules.ts` fetches `virtual:zone-rules-url`, parses it with the reader, and calls `installZoneRulesDateTimeFormat(release)`. A rejected load is caught in `bootApp` like a failed legacy load: `console.error` and the app starts with the engine's data (FR10). The static import graph of `boot.ts` grows by `lib/zoneRules/`, which, like `lib/legacy/`, must not import `@/lib/temporal`, React or app modules; the existing source scan of task 5.5 of `support-legacy-ios-12-safari` (`bootApp.test.ts`) is extended to `src/lib/zoneRules/*.ts`.

### D4. Lookup and future rule in `src/lib/zoneRules/` (FR3, FR4, NFR-P3)

- `localTimeType.ts`: `getLocalTimeType(zoneRules, epochSeconds)`: before the cutoff the cutoff type; otherwise binary search over `changes` for the latest change at or before the instant; after the last change (or when there is none) the future rule, when present, else the last type.
- `futureRule.ts`: `parseFutureRule(text)` → `{ standard: { designation, offsetSeconds }, daylight?: { designation, offsetSeconds, start: RuleDate, end: RuleDate } }` with `RuleDate = { kind: JULIAN_NO_LEAP | ZERO_BASED | MONTH_WEEK_DAY, …, timeSeconds }`. It accepts angle-bracket designations, signed `hh[:mm[:ss]]` offsets, the default daylight offset (standard + 1 h), a missing `,rule` (standard only), and transition times from −167:59:59 to 167:59:59. POSIX offsets are negated into east-positive seconds at parse time, in one place.
- `futureRuleOffset.ts`: `resolveFutureRule(rule, epochSeconds)`: computes the two transition instants of the instant's UTC year and of the neighbouring years (a transition time far outside 0–24 h or a negative-DST rule can move a transition across the year boundary), each as "local wall time in the type in force before it" converted to UTC, then picks the type by position between them. A rule whose daylight interval is empty or covers the whole year (`0/0,J365/25`) resolves accordingly. Per (rule, year) the two instants are memoized in a `Map` on the parsed rule, so a lookup after the first in a year is a comparison, not a date computation.
- The seven pitfalls of RFC 9636 are the fixtures of `zone_rules_future_rule.feature` (spec scenario outline) and of the unit tests: sign, negative DST (Dublin), hours outside 0–24 (Nuuk `M3.5.0/-1`), never-firing transitions (`J365/25`), angle-bracket names, after 2037, 64-bit block only (D7).

### D5. The wrapper: compute in UTC, shift by the rules (FR1, FR6)

`src/lib/zoneRules/dateTimeFormatWrapper.ts`: `createZoneRulesDateTimeFormat(nativeDateTimeFormat, release)` returns a constructor; `installZoneRulesDateTimeFormat(release)` assigns it to `Intl.DateTimeFormat`, keeping `prototype`, `supportedLocalesOf` and `instanceof` as the legacy zone shim did.

- Construction: when `options.timeZone` names a zone of the release (matched case-insensitively, since the polyfill upper-cases ids), the instance keeps the zone's rules and the canonical id, and builds one native formatter with the same options except `timeZone: "UTC"` and no `timeZoneName`. Otherwise it returns a native instance unchanged (fall-through, FR6).
- `format(date)` and `formatToParts(date)`: the instant (a `Date` or a number, read with `Number(date)`) is shifted by the offset of its local time type and formatted by the native UTC formatter. `.claude/rules/temporal.md` says "Never: `new Date()` / `Date.now()` in production code", so an absent argument does not call either: the current instant is read from one module-level native formatter (`timeZone: "UTC"`, numeric year to second, `hourCycle: "h23"`, built on the first absent-argument call) through `formatToParts()` without an argument, and its UTC fields become epoch milliseconds through `Date.UTC`. Neither the presenter nor the polyfill calls without an argument, so the presenter's formatter count is unchanged (NFR-P3). When `timeZoneName` was requested, the part is appended (or inserted where a native formatter of the same options places it) with the tzdb designation when it matches `LETTERS_ONLY_DESIGNATION` (moved to `src/constants/zoneAbbreviations.ts`; `extractZoneAbbreviations.ts` imports it from there by relative path, as it imports `src/lib/temporal.ts`), else `GMT±H[:MM]` built from the offset. `formatRange` / `formatRangeToParts` shift both ends. `resolvedOptions()` is the native result with `timeZone` set to the canonical id.
- The polyfill's own needs are met: its parts request has no `timeZoneName`, so it sees pure field parts; its canonicalization reads `resolvedOptions().timeZone`, which gives the release id; `Temporal.Now.timeZoneId()` constructs without `timeZone`, which falls through to the native (device zone, ADR-0007).
- Work bounds (NFR-P3): one native formatter per wrapper instance, built in the constructor, so the presenter's cache builds the same number of formatters as before; the work counters wrap the global after the install, so they count wrapper constructions, as they counted native ones. One lookup is a binary search and a memoized rule, no formatter.

### D6. Known zones and the search list read the installed release (FR5, FR9)

- `canonicalizeTimeZoneId` is unchanged: `toZonedDateTimeISO(id)` now succeeds for every release id through the wrapper and returns the canonical id; legacy names still pass through `virtual:time-zone-aliases`. The release's `backward` links (`Asia/Calcutta`) also resolve inside the wrapper, and CLDR's alias map keeps the canonical spelling as before.
- `zoneCitiesSource.ts` replaces `listBrowserTimeZones` with `getKnownZoneIds()` from `@/lib/zoneRules`, the ids of the installed release (`undefined` when none is installed, keeping today's "offer every CLDR record" behaviour). No new asset: the ids are already in memory. ADR-0006 still says ZoneCitiesSource takes "one record per IANA zone from `Intl.supportedValuesOf("timeZone")`"; ADR-0014 names "the search's zone list" among what the one source of rules feeds. ADR files are outside what the implement stage writes, so the status note on ADR-0006 is handoff H3 of `tasks.md`.

### D7. Compiler and check in `scripts/zoneRules/` (FR7, FR8)

Pure modules, each tested from `src/test/zoneRules/`:

- `downloadRelease.ts`: `https://data.iana.org/time-zones/releases/tzdata<release>.tar.gz` and `.asc`, by Node `fetch`, into a temporary directory. Never `-latest`.
- `verifySignature.ts`: `gpg --no-default-keyring --keyring <temp> --import scripts/zoneRules/tz-coordinator-key.asc`, then `gpg --verify`, and the signing key's fingerprint must equal `TZ_COORDINATOR_KEY_FINGERPRINT` (constant in the script module; recorded with its expiry date in task 3.1 after verification through WKD and `github.com/eggert/tz`).
- `compileWithZic.ts`: `tar -xzf`, read `version`, compare with the requested name, then `zic -b slim -d <out> africa antarctica asia australasia europe northamerica southamerica etcetera backward`, the file list `TZDATA_SOURCE_FILES` as a constant. Links come from `backward` and the zone files (`zic` writes them as copies or hard links; the compiler detects identical rules and emits a link entry).
- `readTzif.ts`: RFC 9636 §3: magic, version, the version-1 header to skip its block, the 64-bit header and block (transition times as 64-bit integers read as two 32-bit halves, no BigInt in the result, since every instant 2000–2100 fits a double), type indices, `ttinfo` entries, designations, the footer line. Version 1 files (no footer) are rejected with a clear error.
- `truncateToCutoff.ts`: drops changes before `ZONE_RULES_CUTOFF_EPOCH_SECONDS`, keeps the type in force at the cutoff as `cutoffType`, drops unused types and re-indexes.
- `writeRelease.ts`: the D1 document; `compile.ts` is the CLI (`pnpm --filter @time-zones/client zone-rules:compile 2026c`, script `node scripts/zoneRules/compile.ts`, which Node 26 of `.nvmrc` runs without a flag).
- `checkAgainstZdump.ts`: `zdump -v -c 2000,2041 <zone>` per zone of the compiled directory, parsed into (instant, offset, designation) pairs at each boundary (zdump prints the second before and the second of each change); each pair is compared with `getLocalTimeType` of the committed release, and the first difference is reported with zone and instant. CLI `zone-rules:check`; the CI step after "Check initial JS budget" is handoff H1 of `tasks.md`, since `.github/` is outside what the implement stage writes. The check runs against the committed release and the `zic` output of the same archive, so its only external dependency is the system `zic`/`zdump`, whose own rules are not involved.

### D8. Abbreviation table from the release (FR9)

`zoneDataPlugin.ts` replaces `readTzdbZonePeriods` with `readReleaseZonePeriods(zoneId)` (`scripts/zoneRules/releaseZonePeriods.ts`): the cutoff type until the first change, each change until the next, and, for a zone with a future rule, the periods of `ZONE_ABBREVIATION_RULES_YEAR` and the next year produced by `resolveFutureRule`. `extractZoneAbbreviations` and its `ZonePeriod` type stay; the table must equal the previous one for the committed release (spec scenario "Table built from the release"). `moment-timezone` and `ZONE_ABBREVIATIONS_PACKAGE` go.

### D9. Legacy zone shim removed (FR5)

`src/lib/legacy/zoneShim.ts`, `zoneShim.test.ts`, `zoneShim.temporal.test.ts`, `zoneShim.errors.test.ts`, `src/constants/legacy.ts` (`LEGACY_ZONE_PROBE_ID`) and `isZoneDataOutdated` are deleted, with the shim exports of `src/lib/legacy/index.ts`; `src/model/reduceWallTime.legacy.test.ts` is rewritten over the stale-engine fake and the wrapper (D10); `installLegacySupport.test.ts` loses its shim cases; `needsLegacySupport` keeps the `Array#at` and `ResizeObserver` checks; `installLegacySupport.ts` no longer installs a shim. `getLegacyZoneNames` has no other caller and goes with the shim (glossary: **legacy zone name** keeps `virtual:time-zone-aliases`, `canonicalizeTimeZoneId`). `browser_compatibility_legacy_zones.feature` keeps "Zone checks work without BigInt" and loses the renamed-zone scenarios, which move to `zone_rules_known_zones.feature`.

### D10. Testing a stale engine without one (NG6)

A fake native `Intl.DateTimeFormat` (`src/test/fakeStaleDateTimeFormat.ts`): delegates to the real constructor, but for `Asia/Almaty` substitutes `Etc/GMT-6` (so its parts say UTC+6), and throws `RangeError` for `America/Ciudad_Juarez`. Steps install it, call `installZoneRulesDateTimeFormat(virtual:zone-rules)`, `vi.resetModules()` and import `@/lib/temporal`, `@/model` and `@/presenter` fresh (the polyfill is inlined). Each such scenario asserts that the fake was asked for `Asia/Almaty` zero times after the install (the wrapper never constructed a native formatter for it), so a bypassed wrapper fails the test. Browser behaviour (preload, offline start, axe) runs in playwright-bdd on Chromium.

## Consequences

Positive:

- Every zone fact has one owner (`src/lib/zoneRules/`); Temporal, the presenter, the model and the search read the same release, so the same instant never shows two times (UX1).
- The release is data in the repository with an independent oracle (`zdump`), so a release bump is a reviewable diff checked in CI.
- The legacy zone shim, its probe and `moment-timezone` go away; the legacy engine is defined by built-ins only.
- Tests of zone behaviour no longer depend on the ICU of the machine running them.

Negative (risks, each with its mitigation):

- [The asset is larger than the 30 KB ceiling] → D1-compact encoding; the reader interface stays. Measured first (task 1.1).
- [The polyfill asks the formatter for something the wrapper does not model (a calendar option, `formatRange`)] → task 1.2 records every option and method the polyfill uses against the wrapper with a logging fake; the wrapper implements exactly that set plus what the presenter uses.
- [A transition time outside 0–24 h or a negative-DST rule moves a transition into the neighbouring UTC year] → D4 evaluates three years and sorts; the Dublin and Nuuk fixtures cover both.
- [`zdump` on the runner differs from `zdump` on macOS in output format] → the parser is tested on fixtures of both formats (`-v` prints `isdst` and `gmtoff` on every line in both).
- [A wrong committed release] → the check runs in CI on the committed file; a release bump that fails the check cannot merge.
- [`gpg` missing on a developer machine] → the compiler stops with the install hint; CI has it. The committed release is what the build needs, so day-to-day development never runs the compiler.
- [Case-insensitive id matching returns a different id than the engine would (`asia/almaty`)] → `resolvedOptions().timeZone` gives the release's canonical spelling, which is what the engine does for ids it knows.
- [An absent date argument loses milliseconds] → the current instant is read at second precision from the native UTC formatter (D5); no app caller omits the argument, and a format without `fractionalSecondDigits` shows no milliseconds.
- [Boot adds one fetch before the app on every engine] → preloaded (D2), precached, tens of kilobytes; the bundle check records it.

## Alternatives Considered

**D1 — JSON release format.** The packed pipe-delimited string of `moment-timezone`: smaller before gzip, unreadable in a release diff, and a second parser to maintain. Rejected unless the spike exceeds 30 KB, in which case only the `changes` array is compacted. The FormatJS tz data (`__addTZData`): fat-expanded to 2100 and 193 KB gzipped. Rejected.

**D2 — Asset outside the initial JavaScript.** Inlining the release into the entry chunk: simplest, but spends the 150 KB budget on data in every browser and couples a release bump to a JavaScript rebuild. Rejected. Lazy load after the first render: the polyfill memoizes zone objects for the page's life, so rows would freeze on the engine's data. Rejected.

**D3 — Boot step.** Loading the rules inside `main.tsx`: `temporal-polyfill` is evaluated by then and keeps the native constructor. Rejected. Top-level `await` in the entry: unsupported before Safari 15 (ADR-0009). Rejected.

**D4 — Evaluated future rule.** Expanding transitions to a horizon with `zic -b fat`: no interpreter, but a file with a shelf life that grows with the horizon and the compatibility mode IANA keeps for old readers. Rejected (ADR-0014). Predicting the future from the last listed years: the reader bug RFC 9636 names. Rejected.

**D5 — Global wrapper.** A wrapper only the polyfill sees (install, evaluate the polyfill, restore the native): the presenter's own formatters would keep the engine's data and disagree with Temporal (`dateTimeFormatters.ts`). Rejected. Overriding only zones where the engine disagrees: two code paths and device-dependent results. Rejected (ADR-0014). `@formatjs/intl-datetimeformat` `polyfill-force`: proven, but 150–220 KB gzipped with its data and more polyfills on iOS 12. Kept as a test oracle idea only.

**D6 — Known zones.** A separate list asset of zone ids for the search: a second download for data already in memory. Rejected.

**D7 — Own compiler on `zic`.** `@tubular/time-tzdb` (compiles the text rules in TypeScript, no `zic`): a proprietary future-rule format instead of the POSIX string, no signature check. Rejected as the primary path; usable as a second oracle later. Downloading the `tzdata` npm package or `moment-timezone` data: a third party between IANA and the app. Rejected. Checking against Node's ICU instead of `zdump`: Node's ICU may ship a different release than the one compiled. Rejected.

**D8 — Abbreviations from the release.** Reading the designation at the instant directly from the rules in `getZoneAbbreviation`: exact, but changes the `zone-abbreviations` pair semantics and the initial-JS table that the spec requires. Deferred; the table keeps its shape and only its source changes.

**D9 — Removing the shim.** Keeping the shim as a second fallback behind the wrapper: a second owner of "which zones exist" for no case the wrapper leaves. Rejected.

**D10 — Stale-engine fake.** A real iOS 12 runner: none exists for Playwright (NG6). A WebKit build with old ICU: not reproducible in CI. Rejected.

## Migration Plan

No stored data changes. Deploying is the normal `main` deploy; the release asset ships with the build. Rollback is reverting the change; stored ids were canonical before and stay canonical.

## Open Questions

- The exact `ZONE_RULES_ASSET_BUDGET_KB` (Q1 of the proposal) is set from the spike's measurement plus 20 % headroom, in `app.config.ts`; it changes no spec text.

## Sources

- RFC 9636, The Time Zone Information Format (TZif): https://www.rfc-editor.org/rfc/rfc9636.html (footer §3.3, reader pitfalls, extensions)
- `zic(8)` and the slim default: https://ftp.iana.org/tz/tzdb-2023d/zic.8.txt, https://mm.icann.org/pipermail/tz/2020-June/029125.html
- Transition hours −167..167 in real footers (Nuuk, Scoresbysund): https://github.com/HowardHinnant/date/pull/941
- DST lost after 2037 when the footer is ignored: https://github.com/frostney/GocciaScript/issues/1724
- CPython `zoneinfo` footer handling: https://chromium.googlesource.com/external/github.com/python/cpython/+/bc8cf07d8dbb4341955dc85d9b2bf273ec5852c7/Lib/zoneinfo/_zoneinfo.py
- tz coordinator's key via GitHub and WKD: https://mm.icann.org/pipermail/tz/2020-October/029410.html; `-latest` link and `version` file lag: https://lists.iana.org/hyperkitty/list/tz@iana.org/thread/NVHSX2PAQIT44U5FCCEVNJJYXQMMTJSA/
- `@formatjs/intl-datetimeformat` (own data, `polyfill-force`, `__addTZData`; 193 KB gzipped measured from unpkg 8.0.3): https://formatjs.github.io/docs/polyfills/intl-datetimeformat/
- Android Time Zone Data module (separate data, no downgrade, apply on restart): https://source.android.com/docs/core/ota/modular-system/timezone
