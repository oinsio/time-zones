# Build zic from tzcode

## Why

The zone rules compiler and the zone rules check use the system `zic` and `zdump`. On Ubuntu 24.04 (CI `ubuntu-latest` and the gnome sandbox, glibc 2.39) and on Debian 12 (glibc 2.36), glibc's `zic` compiles `America/Ojinaga` wrong: from `2022-10-30T08:00:00Z` to `2022-11-06T07:00:00Z` it writes CDT, UTC−5. The IANA source says CST, UTC−6, for that week (`northamerica`: `-6:00 - CST 2022 Nov 30 0:00`). The `zic` and `zdump` of `tzcode2026f` and the engine's ICU data agree with the source. The committed zone rules release `2026f` was compiled by glibc's `zic` and has the same error. The zone rules check cannot find it, because it compares the release with glibc's `zdump` over glibc's `zic` output: both sides share the bug.

Whatever `zic` a machine has decides the zone rules today, so the release depends on the machine. This change makes the compiler and the check use the `zic` and `zdump` of the release itself, built from the signed `tzcode<release>.tar.gz`. It also recompiles `2026f` with them. The error was found while fixing the zone rules check for the `zdump` of glibc 2.39 (PR of task #135).

## What Changes

- MODIFIED: the **zone rules compiler** downloads `tzcode<release>.tar.gz` and its `.asc` next to `tzdata<release>.tar.gz` and verifies them against the same pinned tz coordinator key. The `version` file of the code archive must name the requested release. The compiler builds `zic` and `zdump` from it with `make` and compiles with that `zic -b slim`. The system `zic` is never called.
- MODIFIED: the **zone rules check** runs the `zdump` built from the code archive of the committed release, over files compiled by the `zic` built from it. The system `zdump` is never called.
- MODIFIED: the committed zone rules release `2026f` is recompiled. `America/Ojinaga` is UTC−6 CST from `2022-10-30T08:00:00Z`. `zone-coordinates.json` is rewritten by the same run and is expected to stay unchanged.
- MODIFIED: the gnome sandbox image gets a C compiler and `make` (`gcc`, `make`, `libc6-dev`). CI's `ubuntu-latest` already has them.
- Glossary (`docs/glossary/zone-rules.md`): new term **zone tools**: the `zic` and `zdump` built from the code archive of one IANA release. **Zone rules compiler** and **zone rules check** name them in their definitions.
- ADR-0014 gains a status note: zone tools come from the release's code archive, not from the operating system.
- `packages/client/zone-rules/README.md`: the commands need `cc`, `make` and `gpg`, not `zic` and `zdump`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `zone-rules`: "Compiling a release" builds the zone tools from the signed code archive of the same release and compiles with that `zic`. "Zone rules check against zdump" uses the zone tools of the committed release.

## Goals

- G1: The committed release gives UTC−6 CST for `America/Ojinaga` at `2022-10-30T08:00:00Z` and at `2022-11-03T12:00:00Z`.
- G2: The compiler and the check give the same result on macOS, on CI `ubuntu-latest` and in the gnome sandbox, whatever `zic` and `zdump` the operating system has.
- G3: The zone rules check reports `0 differences` for the recompiled release on CI.

## Non-Goals

- NG1: Reporting the glibc `zic` bug upstream (a separate, optional human task).
- NG2: Changing the release format, the cutoff, the truncation or the app's lookup. The app code is not touched.
- NG3: Caching the built zone tools between runs. Building them takes seconds.
- NG4: Verifying the 2000–2040 data against a second, independent oracle such as ICU.

## Users & Scenarios

- U1: The owner bumps the zone rules release on a Mac with `pnpm zone-rules:compile <release>` and gets the same file CI would get.
- U2: The zone rules publication workflow compiles and checks a new release on `ubuntu-latest` without depending on glibc's `zic`.
- U3: The gnome works on zone rules in the sandbox and runs the same compiler and check.
- U4: A user in Ojinaga looks at a date in the first week of November 2022 and sees UTC−6.

## Requirements

### Functional

- FR1: The compiler SHALL download `tzcode<release>.tar.gz` and `tzcode<release>.tar.gz.asc` from `https://data.iana.org/time-zones/releases/` (never a `-latest` link) and verify the signature against the pinned fingerprint, as it does for the data archive. It MUST stop without writing a release when the signature fails or was made by another key.
- FR2: The `version` file of the code archive MUST equal the requested release. Otherwise the compiler stops without writing a release and names both versions.
- FR3: The compiler SHALL build `zic` and `zdump` from the code archive with `make` and compile the data archive with that `zic -b slim`. It MUST NOT run a `zic` or `zdump` found on `PATH`.
- FR4: The zone rules check SHALL build the zone tools of the committed release the same way (FR1–FR3) and run that `zdump -v -c 2000,2041`. It MUST NOT run a `zdump` found on `PATH`. With `--compiled <dir>` it still builds the zone tools for `zdump`.
- FR5: A failed build of the zone tools stops the compiler or the check with an error that names the failed step (`make` exit code and stderr).
- FR6: The committed release `2026f` is recompiled with the zone tools of `2026f`, and the zone rules check reports `0 differences` for it.
- FR7: The gnome sandbox image SHALL contain `gcc`, `make` and `libc6-dev`, so that the compiler and the check run in it.
- FR8: The glossary, ADR-0014 and `zone-rules/README.md` describe the zone tools and the new requirements of the commands.

### Non-Functional

#### Performance

- NFR-P1: Building the zone tools adds no more than 60 seconds to a CI run of the zone rules check. Measured on CI, never asserted in unit tests.

#### Accessibility

Not applicable: no UI changes.

#### Responsive

Not applicable: no UI changes.

## UX Acceptance Criteria

- UX1: In the app, `America/Ojinaga` shows UTC−6 for `2022-10-30T08:00:00Z` (the visible effect of FR6). No other screen changes.

## Behavior

Unit BDD in `packages/client/src/test/features/zone_rules/`, tagged `@build-zic-from-tzcode`: `zone_rules_compile.feature` gains the code archive scenarios; a new `zone_rules_check.feature` holds the zone tools scenarios of the check; `zone_rules_lookup.feature` gains the Ojinaga row over the committed release.

## Visual Reference

None.

## Affected IA

No changes.

## Success Metrics

- M1: The zone rules check on CI reports `0 differences` for the recompiled `2026f`.
- M2: `getLocalTimeType` over the committed release returns UTC−6 `CST`, standard time, for `America/Ojinaga` at `2022-10-30T08:00:00Z` and `2022-11-03T12:00:00Z`.
- M3: `grep` finds no `"zic"` or `"zdump"` command name passed to `runProcess` in `scripts/zoneRules/`; every call uses the built tools' paths.
- M4: Mutation score of the changed `scripts/zoneRules/` files is at least 95 %, and never below 90 %.

## Open Questions

- Q1: Should the check also compare the release with the engine's ICU data as a second oracle? Out of scope here (NG4); a follow-up if needed.
