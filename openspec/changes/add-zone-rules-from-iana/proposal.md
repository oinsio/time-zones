# Add zone rules from IANA

## Why

Every time the app shows comes from the operating system's time zone data: `temporal-polyfill` reads UTC offsets through `Intl.DateTimeFormat.formatToParts`, and the presenter builds its own `Intl.DateTimeFormat` per zone (`src/presenter/dateTimeFormatters.ts`). That data moves only with OS updates. iOS Safari 12.5, a supported engine (ADR-0009), received its last update in January 2023; IANA release 2024a moved Kazakhstan to UTC+5 on 2024-03-01, so those devices show Almaty an hour late, and macOS and iOS in general lag an IANA release by months. A renamed or new zone id throws on such engines, which `support-legacy-ios-12-safari` patched with a retry under legacy names and called a stopgap (its NG2).

The owner wants correct dates and times on every supported engine, whether or not its OS was updated. This change makes the app's own compiled zone rules the only source of offsets on every engine, with release `2026f` committed into the build. The companion change `add-remote-zone-rules-updates` delivers new IANA releases without an app release. Decision: ADR-0014.

Research behind this proposal: RFC 9636 (TZif, the POSIX TZ footer and its known reader bugs), the `zic` slim default since 2020, the readers of CPython `zoneinfo`, GLib, `jiff` and Go, the Android Time Zone Data module, `@formatjs/intl-datetimeformat` (193 KB gzipped for all zones) and `@tubular/time-tzdb`. Sources are listed in `design.md` and ADR-0014.

## What Changes

- ADDED: **zone rules**, the app's compiled time zone data for every zone of one IANA release: the local time type at the cutoff `2000-01-01T00:00:00Z`, every clock change since, and the zone's **future rule** (the POSIX TZ string of its TZif footer). Release `2026f` is committed into the repository and built into the app as one asset.
- ADDED: a **future rule** interpreter per RFC 9636, including its extensions (transition hours −167..167, negative daylight saving time, quoted numeric designations, rules whose transitions never fire).
- ADDED: a **zone rules wrapper** of `Intl.DateTimeFormat`, installed at boot on every engine before `temporal-polyfill` or any app module runs. For a zone the rules know it answers from the rules; other zones fall through to the engine. Temporal and the presenter therefore agree, on every engine.
- ADDED: a **zone rules compiler** script: downloads the named IANA release archive from `data.iana.org`, verifies its OpenPGP signature against the pinned tz coordinator key (already committed as `packages/client/scripts/zoneRules/tz-coordinator-key.asc`), compiles it with the system `zic -b slim`, reads the TZif 64-bit block and footer, truncates to the cutoff and writes the JSON release. A **zone rules check** compares the app's lookup with `zdump -v` over 2000–2040 for every zone and fails on one difference.
- MODIFIED: a zone id the engine rejects but the rules know (`America/Ciudad_Juarez`, `Europe/Kyiv` on iOS 12) is a known zone everywhere; legacy zone names are canonicalized as today. A name in neither is an unknown zone.
- REMOVED: the legacy zone shim and its probe (`isZoneDataOutdated`, `LEGACY_ZONE_PROBE_ID`); the legacy engine is defined by its missing built-ins only. **BREAKING** for nothing user-visible: stored data is unchanged.
- MODIFIED: the zone abbreviation table and the search's list of zones are built from the zone rules release, not from `moment-timezone` and `Intl.supportedValuesOf`. `moment-timezone` leaves the dev dependencies.
- MODIFIED: the build fails when the zone rules asset exceeds its gzipped budget, and CI runs the zone rules check.
- Glossary (`docs/glossary/`): new context `zone-rules` with **zone rules**, **zone rules release**, **cutoff**, **local time type**, **future rule**, **zone rules wrapper**, **zone rules compiler**, **zone rules check**; **clock change** (time context) gains the compiled clock changes as a *Code:* owner; **unknown zone** (time context) is redefined against the zone rules; **legacy zone name** (time context) loses `getLegacyZoneNames` of the deleted shim from its *Code:*; **legacy engine**, **legacy support** and **legacy zone shim** (browser-compatibility context) are updated and retired.
- ADR-0014 is written and linked; ADR-0003's known limitation and ADR-0009's shim already carry a superseded note. ADR-0006 gains a status note (its zone list no longer comes from `Intl.supportedValuesOf`), delivered as a human follow-up because the factory may not edit `docs/adr/`.

## Capabilities

### New Capabilities

- `zone-rules`: the app's own time zone rules: what they contain, how an offset and the wall-clock parts of an instant are found from them, how the future rule is evaluated, which zones are known, how the release is compiled and checked, and how the engine's data is kept out.

### Modified Capabilities

- `browser-compatibility`: "Renamed zones on outdated zone data" is replaced by the zone rules; the legacy engine no longer includes outdated zone data; the polyfill set drops the zone shim.
- `zone-abbreviations`: "One offline abbreviation table" is built from the zone rules release.
- `location-search`: the zones offered by search come from the zone rules release, not from the engine.
- `app-delivery`: "Checks on every pull request" adds the zone rules check and the asset budget.
- `time-selection`: "Wall-time input in a renamed zone" rests on the zone rules instead of the legacy zone shim; its scenario is unchanged.
- `locations`: "Exemplar city of the device time location" shows a renamed device time zone from the zone rules instead of through the legacy name; its scenario "Renamed device time zone" is unchanged.

## Impact

All paths are under `packages/client/` unless stated otherwise.

- New `src/lib/zoneRules/`: a Node-safe `core/` submodule (the release format and its reader, the future rule parser and evaluator, the lookup, their constants) and, above it, the `Intl.DateTimeFormat` wrapper and the boot loader. `src/boot.ts` and `src/lib/legacy/bootApp.ts`: the rules load and the wrapper install before the app. `src/test/setup.ts`: every unit test runs with the wrapper installed over the committed release.
- Removed: `src/lib/legacy/zoneShim.ts`, `zoneShim.test.ts`, `zoneShim.temporal.test.ts`, `zoneShim.errors.test.ts`, `src/constants/legacy.ts`, `isZoneDataOutdated`; the shim exports of `src/lib/legacy/index.ts`, the shim cases of `installLegacySupport.test.ts`, and the probe import and probe stub of `src/lib/legacy/needsLegacySupport.test.ts`; `src/model/reduceWallTime.legacy.test.ts` is rewritten over the stale-engine fake and the wrapper. The outdated-zone-data test world `src/test/features/browser_compatibility/steps/legacyZoneWorld.ts` (`startOnOutdatedZoneData`, which today loads the shim through `loadLegacySupport`) is rewritten over the same fake and the wrapper; its consumers keep their Gherkin and stay green: `src/test/features/time_selection/steps/wallTimeHintScenarios.ts` ("A renamed zone on outdated zone data" of `time_selection_wall_time_input_unit.feature`), `src/test/features/locations/steps/locations_device_time_data_unit.steps.tsx` ("Renamed device time zone" of `locations_device_time_data_unit.feature`) and `src/test/features/locations/steps/deviceTimeEngineWorld.ts` (its `FreshModules` type).
- New `scripts/zoneRules/`: the compiler (download, signature check, `zic`, TZif reader, truncation, JSON writer), the `zdump` check, the Vite plugin serving the release as an asset; the committed release and its `README.md` under `zone-rules/`. `scripts/zoneData/zoneDataPlugin.ts` and `extractZoneAbbreviations.ts`: periods from the release; `LETTERS_ONLY_DESIGNATION` moves to `src/constants/zoneAbbreviations.ts`. `app.config.ts`: the release file path and the asset budget. `scripts/check-bundle-size.mjs`: the asset budget. `package.json`: scripts `zone-rules:compile`, `zone-rules:check`; `moment-timezone` removed. `tsconfig.app.json`: `ES2021.Intl` in `lib`.
- `src/model/timeZoneId.ts` (known zones through the wrapper, JSDoc), `src/adapters/city-search/zoneCitiesSource.ts` (zone list), `src/vite-env.d.ts` (virtual modules).
- `docs/glossary/`, `docs/architecture/overview.md`. Human follow-ups (patches, forbidden paths for the factory): `.github/workflows/ci.yml` (the zone rules check step), `.claude/rules/temporal.md` (the zone rules line), `docs/adr/0006-city-data-sources.md` (status note).
- New dev dependencies: none; `zic`, `zdump` and `gpg` come from the operating system (the compiler and the check run on Ubuntu, in the sandbox and on `ubuntu-latest`, which ship `zic`, `zdump` and `gpg`). Removed: `moment-timezone`.
- Tests: new unit and BDD features under `src/test/features/zone_rules/`; `browser_compatibility_legacy_zones.feature` rewritten; new scenarios in `zone_abbreviations` and `location_search` features.

## Goals

- G1: Asia/Almaty at `2026-07-15T08:00:00Z` shows 13:00 and UTC+5 on every supported engine, including an engine whose own data still says UTC+6.
- G2: A zone id the engine does not know but the release does (`America/Ciudad_Juarez`) can be added, stored, shown and used for a wall-clock time on every engine.
- G3: Daylight saving time stays correct after 2037 for every zone with a future rule (Europe/Dublin, America/New_York in 2040).
- G4: The app's own offsets equal `zdump -v` of the same release for every zone and every clock change in 2000–2040.
- G5: Modern browsers keep the initial JavaScript under its 150 KB gzipped budget; the zone rules asset stays within its own budget and is fetched once, in parallel with the app's chunks.

## Non-Goals

- NG1: Fetching a newer release at run time, storing it, the update notice and the release line in settings. That is `add-remote-zone-rules-updates`.
- NG2: Historical correctness before the cutoff `2000-01-01T00:00:00Z`. Instants before it use the cutoff's local time type.
- NG3: Leap seconds. Temporal and the app ignore them, as the browser does.
- NG4: Localized zone names (`timeZoneName: "long"` texts such as "Central European Summer Time"). The wrapper gives the tzdb designation or a `GMT±H:MM` form.
- NG5: Replacing `temporal-polyfill` or changing how the model uses Temporal.
- NG6: Running automated tests in a real iOS 12 engine (NG9 of `support-legacy-ios-12-safari`); a stale engine is emulated with a fake native `Intl.DateTimeFormat`.

## Users & Scenarios

- U1: The owner opens the installed app on an iPad mini 2 (iOS 12.5.7) with Almaty, Moscow and New York. Almaty shows 13:00 for 08:00 UTC, one hour earlier than the iPad's own clock app would say.
- U2: On the same iPad the owner adds Ciudad Juárez from search; the card appears with its time and UTC−6 (MDT) in summer.
- U3: A user on current Safari, whose macOS has not received the latest IANA release, sees the same times as a user on Chrome.
- U4: A user pins 2040-07-15 in the date bar; Dublin shows IST, UTC+1, and New York EDT, UTC−4.

## Requirements

### Functional

- FR1: On every supported engine, every UTC offset, local date and local time the app shows or computes (Temporal values, presenter formatting, day tracks, hour cells, wall-clock resolution, clock changes, offset differences, day shifts) MUST come from the zone rules of the built release. The engine's own zone data MUST NOT decide any of them for a zone the release knows.
- FR2: The zone rules of a release MUST hold, for every zone id of the IANA release including links: the local time type (UTC offset in seconds, tzdb designation, daylight saving flag) in force at the cutoff `2000-01-01T00:00:00Z`; every clock change after the cutoff that the release lists explicitly, each with its instant and the local time type after it; the zone's future rule, or none when its TZif footer is empty. The release MUST carry its IANA release name (`2026f`).
- FR3: The future rule MUST be interpreted as RFC 9636 §3.3 defines the POSIX TZ string, including: `Mm.w.d` (with `w = 5` as the last week), `Jn` (no 29 February) and `n` (with 29 February) dates; a default transition time of 02:00:00; transition hours from −167 through 167; negative daylight saving time (`IST-1GMT0,M10.5.0,M3.5.0/1`); designations in angle brackets (`<+05>-5`); a standard-only string (`<+05>-5`, no transitions); and a rule whose transitions never fire (`EST5EDT,0/0,J365/25`, permanent daylight time). The sign convention of POSIX (positive west of UTC) MUST be converted to the app's (positive east).
- FR4: The local time type at an instant MUST be: before the cutoff, the cutoff's type; between the cutoff and the last listed clock change, the type after the latest clock change at or before the instant; after the last listed clock change, the type the future rule gives. The lookup MUST NOT predict from the listed clock changes.
- FR5: A zone id in the release MUST be a known zone on every engine, including an id the engine rejects. A legacy zone name MUST be canonicalized as today. A name in neither the release nor the alias map MUST be an unknown zone. The legacy zone shim and its probe MUST be removed, and the legacy engine MUST be defined by missing built-ins only.
- FR6: `Intl.DateTimeFormat` with a `timeZone` the release knows MUST format and `formatToParts` every date and time field from the zone rules and the native formatter's locale, calendar and numbering; `resolvedOptions().timeZone` MUST return the requested id in the release's spelling (`asia/almaty` → `Asia/Almaty`), never its link target (`Europe/Oslo` stays `Europe/Oslo`); a `timeZoneName` part MUST be the tzdb designation when it is letters, otherwise `GMT±H` or `GMT±H:MM` from the offset. A `timeZone` the release does not know MUST reach the native constructor unchanged. The wrapper MUST be installed before `temporal-polyfill` and any app module is evaluated, on every engine.
- FR7: A script MUST compile a release: download `tzdata<release>.tar.gz` and its `.asc` from `https://data.iana.org/time-zones/releases/`, never a `-latest` link; verify the signature against the pinned fingerprint of the tz coordinator's key and stop on a mismatch; compile with the system `zic -b slim`; read the version-2-or-later 64-bit block and footer of every TZif file; truncate to the cutoff; write the release JSON and its name. The release name MUST be taken from the archive's `version` file and MUST equal the requested name.
- FR8: A zone rules check MUST compare the app's lookup (FR4) over the committed release with `zdump -v` of the same release compiled by `zic`, for every zone, at every clock change in 2000–2040 and one second before it, and MUST fail on one difference in offset or designation. CI MUST run it on every pull request. The committed release MUST pass it.
- FR9: The zone abbreviation table MUST be built from the zone rules release, and the zones offered by search MUST be the zone ids of the release that have an area (contain `/`) outside the `Etc` area, plus `UTC` as today, so neither depends on `moment-timezone` or on the engine's list of zones. Every zone of the table built before this change MUST keep its abbreviations, except a zone whose designations an IANA release note after the `moment-timezone` data changed.
- FR10: The zone rules MUST load before the app on every engine from one asset the service worker precaches, so the app works offline after the first visit. If the asset cannot be loaded, the app MUST still start, with the engine's data, and MUST log the failure.

### Non-Functional

#### Performance

- NFR-P1: The initial JavaScript of the modern build stays within the 150 KB gzipped budget of `scripts/check-bundle-size.mjs`. The zone rules asset is counted on its own and MUST stay within `ZONE_RULES_ASSET_BUDGET_KB` gzipped (set from the spike, Q1; target ≤ 24 KB). The build fails on either excess.
- NFR-P2: The asset is requested in parallel with the app's chunks (a preload link), so start adds one request and no second network round trip.
- NFR-P3: Presenting 50 rows builds no more `Intl.DateTimeFormat` instances than today (work bound of `replace-wall-clock-row-budgets-with-deterministic-checks`). A wrapper instance builds exactly one native formatter; a `formatToParts` call on it with a date makes exactly one native `formatToParts` call (a call without a date adds one call on the shared clock formatter of design D5); a local time type lookup builds no formatter and makes no native call.

#### Accessibility

- NFR-A1: axe-core reports no new violations on the main page. Nothing visible changes.

#### Responsive

- NFR-R1: The approved screenshot baselines in `chromium` and `mobile-chrome` pass unchanged.

## UX Acceptance Criteria

- UX1: A user never sees two different times for the same zone and instant in two places of the app (card, hour label, wall-time hint, date bar).
- UX2: Nothing else moves or changes on screen: no new note, no new control.

## UI States Matrix

| Network | Data | UI |
|---------|------|----|
| any | engine data current, release current | unchanged |
| any | engine data stale (Almaty at UTC+6), release current | Almaty shows UTC+5 (FR1) |
| any | engine rejects the zone id, release knows it | the location works as any other (FR5) |
| any | zone id in neither | unknown-zone behaviour as today (FR5) |
| online, first visit | asset loading | nothing new: the boot waits for the preloaded asset before the app renders, as it waits for its chunks (FR10, NFR-P2) |
| offline, installed | asset precached | app starts with the rules (FR10) |
| any | asset fails to load or is invalid | app starts with engine data, failure logged; no new error screen (FR10, UX2) |
| any | instant before 2000 | cutoff type used (NG2) |

The change adds no list and no empty state of its own; the empty list of locations is unchanged.

## Behavior

Feature files tagged `@add-zone-rules-from-iana`:

- `src/test/features/zone_rules/` (vitest-cucumber): `zone_rules_lookup.feature` (FR1, FR4, UX1: offsets and wall-clock parts by lookup, including Almaty 2024, before-cutoff), `zone_rules_future_rule.feature` (FR3: the RFC 9636 pitfalls as scenario outlines), `zone_rules_known_zones.feature` (FR5: new ids, legacy names, unknown names, with a fake native formatter that rejects the id), `zone_rules_wrapper.feature` (FR6: parts, `resolvedOptions`, `timeZoneName`, fall-through), `zone_rules_release.feature` (FR2, FR7, FR8: the release format, truncation, compiler steps on fakes, the `zdump` check on a fixture), `zone_rules_budget.feature` (NFR-P1, NFR-P3: asset budget, work bounds).
- `src/test/features/zone_rules/zone_rules_boot_e2e.feature` (playwright-bdd): the asset is requested with the app's chunks (NFR-P2), the app starts offline with the asset precached (FR10), a failed load still starts the app (FR10), axe-core on the main page (NFR-A1).
- `src/test/features/locations/locations_ui_e2e.feature`: the approved screenshot outline gains `@add-zone-rules-from-iana @NFR-R1 @UX2`, its baselines unchanged.
- `src/test/features/browser_compatibility/browser_compatibility_legacy_zones.feature`: rewritten for the rules (FR5); "A renamed zone on outdated zone data" of `time_selection_wall_time_input_unit.feature` and "Renamed device time zone" of `locations_device_time_data_unit.feature` keep their Gherkin, run over the zone rules and gain `@add-zone-rules-from-iana @FR5`; `zone_abbreviations_unit.feature` and `location_search_by_name.feature` gain the release-sourced scenarios (FR9).

## Visual Reference

No new screens. The approved screens in `docs/design/screens/` stay the reference.

## Affected IA

No changes.

## Success Metrics

- M1: 100% of FR1–FR10, NFR-P1–P3, NFR-A1, NFR-R1, UX1 and UX2 have at least one automated test naming `add-zone-rules-from-iana` with the id.
- M2: The zone rules check reports 0 differences against `zdump -v` for every zone of the committed release `2026f` over 2000–2040.
- M3: With a fake native `Intl.DateTimeFormat` that reports UTC+6 for Asia/Almaty and rejects `America/Ciudad_Juarez`, the Almaty card shows `13:00` and `UTC+5` at `2026-07-15T08:00:00Z`, and Ciudad Juárez is added and shows `02:00` and `UTC−6`.
- M4: The seven RFC 9636 pitfall cases (sign, negative DST, hours outside 0–24, never-firing transitions, angle-bracket names, after 2037, 64-bit block only) each have a passing scenario or unit test.
- M5: Initial JavaScript ≤ 150 KB gzipped; zone rules asset ≤ `ZONE_RULES_ASSET_BUDGET_KB`; exactly 1 `<link rel="preload">` for the asset in `dist/index.html`.
- M6: Mutation score ≥ 95% (minimum 90%) on every module of `src/lib/zoneRules/` and `scripts/zoneRules/` that holds logic; the constants-only files (`core/zoneRulesConstants.ts`, `scripts/zoneRules/signing.ts`) and the re-exporting `index.ts` files hold none and are left out.
- M7: `moment-timezone` is absent from `packages/client/package.json`, and a grep of production sources (`packages/client/src` without tests, steps and `src/test/`, plus `packages/client/scripts`) for `supportedValuesOf`, `isZoneDataOutdated`, `LEGACY_ZONE_PROBE_ID` and `zoneShim` prints nothing.

## Open Questions

- Q1: The gzipped size of the release asset with the cutoff 2000. Measured while writing this change: release `2026f`, 597 ids, every id written in full (no link entries) — 144 959 bytes, 20 070 bytes gzipped. Task 1.1 measures the real writer's output (with link entries) and sets `ZONE_RULES_ASSET_BUDGET_KB`. If it exceeds 30 KB, the encoding switches to the compact form of design D1 before anything else is built.
- Q2: Does `temporal-polyfill` 0.3.2 read every zone fact it needs through `formatToParts` of the constructor it captured (offsets, and the `resolvedOptions().timeZone` it uses to canonicalize ids), so a wrapper is enough? The spike of `support-legacy-ios-12-safari` showed the constructor path; task 1.2 checks the parts and options the polyfill asks for and that `Temporal.Now.timeZoneId()` still works.
- Q3 (resolved 2026-11-12): the pinned key is the tz coordinator's (Paul Eggert <eggert@cs.ucla.edu>, rsa4096, created 2010-09-03), fingerprint `7E3792A9D8ACF7D633BC1588ED97E90E62AA7E34`, expiring 2031-07-24, committed as `packages/client/scripts/zoneRules/tz-coordinator-key.asc`. A human verified it on 2026-11-12 against keys.openpgp.org, keyserver.ubuntu.com and `github.com/eggert.gpg`, and checked that it signs `tzdata2026f.tar.gz` on `data.iana.org` and the tag `2026f` of `github.com/eggert/tz`. Task 3.1 pins it in code and records it in `zone-rules/README.md`.
