# ADR-0014: Zone rules from IANA, shipped and updated by the app

## Status
Accepted (2026-11-12)

Supersedes the "Known limitation" of [ADR-0003](0003-reference-instant-time-model.md) (time zone rules come from the browser) and the legacy zone shim of [ADR-0009](0009-supported-browser-engines.md). Driven by `add-zone-rules-from-iana` and `add-remote-zone-rules-updates`.

## Context

Every time the app shows comes from `temporal-polyfill`, which reads UTC offsets through `Intl.DateTimeFormat.formatToParts`, and from the presenter's own `Intl.DateTimeFormat` instances. Both take the time zone rules from the operating system's ICU data. That data moves with OS updates: iOS Safari 12.5 (a supported engine, ADR-0009) stopped receiving them in January 2023, and even current macOS and iOS lag an IANA release by months. IANA published Kazakhstan's unification on UTC+5 (release 2024a, effective 2024-03-01); devices without that release still show Almaty an hour late. A renamed or new zone id (`Europe/Kyiv`, `America/Ciudad_Juarez`) throws on such engines, which ADR-0009 patched with a retry under legacy names.

The owner's requirement is that the app shows correct dates and times on every supported engine, whether or not its operating system was updated, and that every user gets a new IANA release without waiting for an app release.

What the environment offers:

- IANA publishes only source text, compiled by `zic`. Since 2020 `zic` defaults to `-b slim`: a TZif file lists explicit transitions only up to where a POSIX TZ string (the file's footer, RFC 9636 §3.3) takes over. The footer is how every current reader (CPython `zoneinfo`, GLib, Rust `jiff`, Go `time`) handles the future; readers that ignore it lose daylight saving time after 2037.
- `temporal-polyfill` accepts time zones as strings only and has no hook for own data. It keeps the `Intl.DateTimeFormat` constructor it sees when it is evaluated.
- The one proven JavaScript library with own zone data for `Intl.DateTimeFormat`, `@formatjs/intl-datetimeformat`, weighs 193 KB gzipped for all zones (122 KB for its "golden" set) plus a 26 KB polyfill and locale data, expands transitions to the year 2100 and needs further `Intl` polyfills on iOS 12. The initial JavaScript budget is 150 KB in total.
- Platforms that solved the same problem (the Android Time Zone Data module) keep the data separate from the code, version it by IANA release, never apply an older release over a newer one, and apply a downloaded release at the next start.

## Decision

1. **Zone rules are the app's own data and the only source of offsets.** The app ships a compiled set of zone rules for every zone of an IANA release: the local time type in force at the cutoff `2000-01-01T00:00:00Z`, every clock change since the cutoff, and the zone's future rule (the POSIX TZ string of its TZif footer). Instants before the cutoff use the cutoff's local time type. The engine's own zone data is not consulted on any engine, so every supported engine shows the same times.
2. **The future rule is evaluated, not expanded.** The app interprets the POSIX TZ string as RFC 9636 defines it, including its extensions: transition hours from −167 to 167, negative daylight saving time (`IST-1GMT0,M10.5.0,M3.5.0/1`), quoted numeric designations (`<+05>-5`), and rules whose transitions never fire (`EST5EDT,0/0,J365/25`). Lookups use the explicit clock changes up to the last one and the future rule after it, never a prediction from the table.
3. **One wrapper of `Intl.DateTimeFormat` carries the rules.** The wrapper is installed at boot, before `temporal-polyfill` or any app module is evaluated, on every engine. For a `timeZone` the rules know, it computes the wall-clock parts from the rules and delegates everything else (locale, calendar, numbering) to the native constructor in UTC. A zone the rules do not know falls through to the native constructor. This replaces the legacy zone shim of ADR-0009, which is removed together with its probe.
4. **The rules are compiled from IANA by the project itself.** A script downloads the named release archive (`tzdata<release>.tar.gz`, never the `-latest` link, whose caches lag), verifies its OpenPGP signature against the pinned fingerprint of the tz coordinator's key, compiles it with the system `zic -b slim`, parses the 64-bit block and footer of every TZif file, truncates to the cutoff and writes one JSON file. The result is validated against `zdump -v` over 2000–2040 for every zone before it is used; a single difference blocks it. The compiled release is committed to the repository, so the build is reproducible offline, and `moment-timezone` is no longer a build-time source.
5. **New releases reach users without an app release.** A scheduled workflow checks IANA daily, compiles and validates a new release, commits it and deploys. The app publishes the release file and a small version file outside the service worker's precache. At start and on each update recheck (ADR-0009's 15-minute rule) the app compares the published release with the active one, downloads a newer one, stores it on the device (ADR-0004 envelope) and offers a reload. At the next start the app uses the newest of the bundled and the stored release, never an older one. A failed check is silent, as every update check is.
6. **The active release is visible.** The settings page shows the IANA release in use (`2026c`), next to the deploy time, so a user can tell why a zone still shows old rules.

## Consequences

Positive:
- Correct times on iOS 12 and on any engine whose OS lags IANA; new zone ids work everywhere.
- One source of rules for Temporal, the presenter, the abbreviation table and the search's zone list; tests no longer depend on the ICU of the machine they run on.
- Freshness is bounded by IANA plus one day, not by OS vendors.
- Stored identifiers stay canonical IANA ids (ADR-0003 unchanged there).

Negative:
- The app owns zone arithmetic it used to delegate: a POSIX rule interpreter and a TZif reader, each with a known list of pitfalls that must stay covered by tests.
- One more asset at start (the zone rules, tens of kilobytes gzipped) and one more scheduled workflow to keep alive (GitHub disables schedules of repositories idle for 60 days).
- A wrong published release would be wrong for every user at once; the `zdump` cross-check and the no-downgrade rule are the guards.
- Instants before 2000 are approximated by the cutoff's local time type.

## Alternatives Considered

**Keep the browser's data and warn when it is stale**: cheap, but the owner's requirement is correct times, not an explanation.

**Override only the zones where the engine disagrees with our rules**: modern engines would pay nothing, but results would differ between devices and every discrepancy would need two code paths. The platforms that solved this (Android) never consult the system data once a newer set is installed.

**Expand transitions to a fixed horizon (`zic -b fat`)**: no interpreter, but the file has a shelf life, grows with the horizon, and is the compatibility mode IANA keeps only for old readers.

**`@formatjs/intl-datetimeformat` with its own data**: proven and spec-complete, but 150–220 KB gzipped against a 150 KB total budget, fat-expanded to 2100, and more polyfills on iOS 12. Kept as a test oracle only.

**`@tubular/time`, `@js-joda/timezone`**: own data and runtime updates, but they are whole date libraries that would replace Temporal.

**Fetch compiled data from a third-party CDN (unpkg, jsDelivr)**: a dependency on another maintainer's release cadence and availability; our workflow reaches IANA directly.

**Compile at build time from the network**: the build would need the network and `zic`; a committed release keeps it reproducible.

## Related

- [ADR-0003](0003-reference-instant-time-model.md) — reference instant; its known limitation is superseded
- [ADR-0004](0004-local-persistence-strategy.md) — the stored release uses the same envelope and migration rules
- [ADR-0008](0008-performance-budgets-as-work-bounds.md) — the wrapper's work is counted, not timed
- [ADR-0009](0009-supported-browser-engines.md) — boot sequence; its legacy zone shim is removed
- RFC 9636, The Time Zone Information Format (TZif), and IANA tz-link (https://www.iana.org/time-zones/tz-link)
